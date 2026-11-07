'use strict';
// ============================================================
//  pixel graphics: sprites built from code, auto outline/shading
// ============================================================
function hex2rgb(h){h=h.replace('#','');if(h.length===3)h=h.split('').map(c=>c+c).join('');const n=parseInt(h,16);return[(n>>16)&255,(n>>8)&255,n&255];}
function rgb2hex(c){return '#'+c.map(v=>Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,'0')).join('');}
function mulC(c,f){return c.map(v=>Math.max(0,Math.min(255,Math.round(v*f))));}
function liftC(c,f){return c.map(v=>Math.round(v+(255-v)*f));}
function darken(hex,f=0.75){return rgb2hex(mulC(hex2rgb(hex),f));}
function lighten(hex,f=0.3){return rgb2hex(liftC(hex2rgb(hex),f));}
function mkCanvas(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');x.imageSmoothingEnabled=false;return c;}

class Grid{
 constructor(w,h){this.w=w;this.h=h;this.d=new Array(w*h).fill(null);}
 set(x,y,c){x=Math.floor(x);y=Math.floor(y);if(x>=0&&y>=0&&x<this.w&&y<this.h)this.d[y*this.w+x]=c;}
 get(x,y){return(x<0||y<0||x>=this.w||y>=this.h)?null:this.d[y*this.w+x];}
 rect(x,y,w,h,c){for(let j=y;j<y+h;j++)for(let i=x;i<x+w;i++)this.set(i,j,c);return this;}
 circle(cx,cy,r,c){return this.ellipse(cx,cy,r,r,c);}
 ellipse(cx,cy,rx,ry,c){for(let y=0;y<this.h;y++)for(let x=0;x<this.w;x++){const dx=(x+0.5-cx)/rx,dy=(y+0.5-cy)/ry;if(dx*dx+dy*dy<=1)this.set(x,y,c);}return this;}
 rows(rows,ox=0,oy=0,map=null){rows.forEach((r,y)=>{for(let x=0;x<r.length;x++){const ch=r[x];if(ch==='.'||ch===' ')continue;this.set(ox+x,oy+y,map&&map[ch]?map[ch]:ch);}});return this;}
}

// render grid -> canvas with padding 2, selective outline & soft shading
function renderGrid(g,pal,opt={}){
 const P=2,W=g.w,H=g.h;const c=mkCanvas(W+P*2,H+P*2);const ctx=c.getContext('2d');
 const img=ctx.createImageData(c.width,c.height);const D=img.data;
 const col={};for(const k in pal)col[k]=hex2rgb(pal[k]);
 const at=(x,y)=>{const ch=g.get(x,y);return ch&&col[ch]?ch:null;};
 const noShade=opt.noShade||'emwpkyY';
 const put=(x,y,rgb,a=255)=>{const i=((y+P)*c.width+(x+P))*4;D[i]=rgb[0];D[i+1]=rgb[1];D[i+2]=rgb[2];D[i+3]=a;};
 for(let y=0;y<H;y++)for(let x=0;x<W;x++){const ch=at(x,y);if(!ch)continue;let rgb=col[ch];
  if(opt.shade!==false&&!noShade.includes(ch)){if(!at(x,y+1))rgb=mulC(rgb,0.8);else if(!at(x,y-1))rgb=liftC(rgb,0.22);}
  if(opt.sil)rgb=hex2rgb(opt.sil);
  put(x,y,rgb);}
 if(opt.outline!==false){const oc=opt.outlineColor?hex2rgb(opt.outlineColor):null;
  for(let y=-1;y<=H;y++)for(let x=-1;x<=W;x++){if(at(x,y))continue;let n=at(x,y+1)||at(x,y-1)||at(x-1,y)||at(x+1,y);if(!n)continue;
   const rgb=opt.sil?mulC(hex2rgb(opt.sil),0.6):(oc||mulC(col[n],0.38));put(x,y,rgb);}}
 ctx.putImageData(img,0,0);return c;
}
function rowsSprite(rows,pal,opt){const h=rows.length,w=Math.max(...rows.map(r=>r.length));const g=new Grid(w,h);g.rows(rows);return renderGrid(g,pal,opt);}

// ---------------- creatures ----------------
const DEF_PAL={e:'#2a2238',m:'#7a2c42',p:'#ff9cb4',w:'#ffffff',k:'#3a2a2a',y:'#ffa63a'};
const _mon={};
const SCARF_ROW={blob:11,cat:9,bird:9,fish:9,bug:9,bunny:10,puff:11,lizard:9,mush:12,ghost:9};
function rgb2hsl(c){let[r,g,b]=c.map(v=>v/255);const mx=Math.max(r,g,b),mn=Math.min(r,g,b);let h=0,s=0;const l=(mx+mn)/2;
 if(mx!==mn){const d=mx-mn;s=l>0.5?d/(2-mx-mn):d/(mx+mn);h=mx===r?(g-b)/d+(g<b?6:0):mx===g?(b-r)/d+2:(r-g)/d+4;h/=6;}return[h,s,l];}
function hsl2rgb([h,s,l]){if(!s)return[l*255,l*255,l*255];const q=l<0.5?l*(1+s):l+s-l*s,p=2*l-q;const f=t=>{t=(t%1+1)%1;return t<1/6?p+(q-p)*6*t:t<1/2?q:t<2/3?p+(q-p)*(2/3-t)*6:p;};return[f(h+1/3)*255,f(h)*255,f(h-1/3)*255];}
function hueShift(hex,deg){const[h,s,l]=rgb2hsl(hex2rgb(hex));const s2=s<0.1?0.45:s;const l2=s<0.1?Math.min(l,0.86):l;return rgb2hex(hsl2rgb([h+deg/360,s2,l2]));}
function normLook(look){if(!look)return{};if(typeof look==='string')return{scarf:look};return look;}
function monGrid(sp,blink,look){
 look=normLook(look);const scarf=look.scarf,wear=look.wear;
 const g=new Grid(20,20);const O=2;const tpl=TEMPLATES[sp.tpl];const an=TPL_ANCHOR[sp.tpl];
 const pal=Object.assign({},DEF_PAL,sp.pal);
 if(look.shiny){for(const k of ['a','b','c'])if(sp.pal[k])pal[k]=hueShift(sp.pal[k],SHINY_DEG);}
 if(!pal.b)pal.b=lighten(pal.a,0.45);if(!pal.c)pal.c=darken(pal.a,0.8);
 const accs=sp.acc||[];const place=(a,i)=>{const rows=ACC[a[0]];const w=rows[0].length,h=rows.length;const X=String.fromCharCode(65+i*2),Y=String.fromCharCode(66+i*2);
  pal[X]=a[2];pal[Y]=a[3]||a[2];const map={x:X,y:Y};let pos=a[1];if(pos==='tail'&&!an.t)pos='side';
  if(pos==='wings'){g.rows(rows,O+0,O+7,map);g.rows(rows.map(r=>r.split('').reverse().join('')),O+16-w,O+7,map);return;}
  let ox,oy;if(pos==='head'){ox=O+an.h[0]-Math.floor(w/2);oy=O+an.h[1]-h+1;}else if(pos==='tail'){ox=O+an.t[0]-Math.floor(w/2);oy=O+an.t[1]-h+1;}else{ox=O+12;oy=O+1;}
  g.rows(rows,ox,oy,map);};
 accs.forEach((a,i)=>{if(a[1]==='wings')place(a,i);});
 g.rows(tpl,O,O);
 accs.forEach((a,i)=>{if(a[1]!=='wings'&&!(wear&&WEAR[wear].pos==='head'&&a[1]==='head'))place(a,i);});
 if(blink){for(let y=0;y<20;y++)for(let x=0;x<20;x++){if(g.get(x,y)==='e'&&g.get(x,y+1)==='e')g.set(x,y,'a');}}
 const sr=O+SCARF_ROW[sp.tpl];let sL=99,sR=-1;
 if(scarf){pal.Z=scarf;pal.z=darken(scarf,0.8);
  for(let x=0;x<20;x++){const ch=g.get(x,sr);if(ch&&'abcpwkym'.includes(ch)){g.set(x,sr,'Z');sL=Math.min(sL,x);sR=Math.max(sR,x);}}
  if(sR>0){const kx=Math.min(sR-2,O+11);g.set(kx,sr+1,'z');g.set(kx+1,sr+1,'Z');g.set(kx+1,sr+2,'z');}}
 if(wear&&WEAR[wear]){const W=WEAR[wear];pal.Q=W.c1;pal.R=W.c2||W.c1;const map={x:'Q',y:'R'};
  if(W.pos==='head'){const w=W.rows[0].length,h=W.rows.length;g.rows(W.rows,O+an.h[0]-Math.floor(w/2),O+an.h[1]-h+1,map);}
  else if(W.pos==='side'){g.rows(W.rows,O+an.h[0]+2,O+an.h[1]-1,map);}
  else if(W.pos==='eyes'){const eyes=[];const T=TEMPLATES[sp.tpl];for(let y=0;y<16;y++)for(let x=0;x<16;x++)if(T[y][x]==='e'){const ex=eyes.find(e=>e[0]===x+O);if(ex)ex[2]=y+O;else eyes.push([x+O,y+O,y+O]);}
   for(const[x,y0,y1]of eyes){for(let y=y0-1;y<=y1+1;y++)for(let dx=-1;dx<=1;dx++){const cx=x+dx;if(dx===0&&y>=y0&&y<=y1){if(W.fill)g.set(cx,y,'Q');continue;}g.set(cx,y,'Q');}}
   if(eyes.length>=2){const a=eyes[0],b=eyes[eyes.length-1];for(let x=a[0]+2;x<=b[0]-2;x++)g.set(x,a[1],'Q');}}
  else if(W.pos==='neck'){const cx=sR>0?Math.round((sL+sR)/2):O+8;g.set(cx-1,sr+1,'Q');g.set(cx,sr+1,'Q');g.set(cx-1,sr+2,'R');g.set(cx,sr+2,'Q');}}
 return {g,pal};
}
function monSpr(id,look){
 look=normLook(look);const key=id+'|'+(look.scarf||'')+'|'+(look.wear||'')+'|'+(look.shiny?1:0);if(_mon[key])return _mon[key];const sp=SP[id];const A=monGrid(sp,false,look),B=monGrid(sp,true,look);
 const o={n:renderGrid(A.g,A.pal,{noShade:'emwpkyYz'}),b:renderGrid(B.g,B.pal,{noShade:'emwpkyYz'}),s:renderGrid(A.g,A.pal,{sil:'#3a3550',shade:false})};
 _mon[key]=o;return o;
}
function scaled(src,k){const c=mkCanvas(src.width*k,src.height*k);const x=c.getContext('2d');x.imageSmoothingEnabled=false;x.drawImage(src,0,0,c.width,c.height);return c;}

// ---------------- people ----------------
const _vil={};
function vilSpr(id){if(_vil[id])return _vil[id];const v=VSPR[id];const n=rowsSprite(v.rows,v.pal);
 const step=(a,b)=>{const r=v.rows.slice();const r14=r[14].split(''),r15=r[15].split('');for(const x of [a,a+1]){r14[x]=r15[x];r15[x]='.';}r[14]=r14.join('');r[15]=r15.join('');return rowsSprite(r,v.pal);};
 _vil[id]={n,b:n,f:[n,step(4),n,step(10)]};return _vil[id];}
let _player=null;
const SKIN='#ffd9b8';
function hairOverlay(g,dir,style){const H=(x,y)=>g.set(x,y,'h');const R=(x0,y0,w,h)=>{for(let y=y0;y<y0+h;y++)for(let x=x0;x<x0+w;x++)H(x,y);};
 switch(style){
  case 'long':if(dir==='down'){R(2,4,1,8);R(13,4,1,8);R(3,10,1,2);R(12,10,1,2);}else if(dir==='up'){R(3,9,10,4);R(2,4,1,8);R(13,4,1,8);}else{R(2,4,2,9);R(4,10,1,2);}break;
  case 'twin':if(dir==='side'){R(0,3,3,6);g.set(2,3,'T');}else{R(0,3,3,6);R(13,3,3,6);g.set(2,3,'T');g.set(13,3,'T');}break;
  case 'odango':if(dir==='side'){R(3,0,3,2);}else{R(3,0,3,2);R(10,0,3,2);}break;
  case 'bob':if(dir==='down'){R(3,6,1,3);R(12,6,1,3);R(2,5,1,4);R(13,5,1,4);}else if(dir==='up'){R(3,8,10,2);R(2,5,1,4);R(13,5,1,4);}else{R(2,4,2,6);}break;
 }}
function hatOverlay(g,dir,hat){if(!hat)return;const rows=(r,ox,oy,map)=>g.rows(r,ox,oy,map);const m={x:'X',y:'Y'};
 switch(hat){
  case 'ribbon':rows(["xx.xx","xxyxx","xx.xx"],dir==='side'?3:10,0,m);break;
  case 'straw':rows([".....xxxxxx.....","....xyyyyyyx....","..xxxxxxxxxxxx.."],0,0,m);break;
  case 'beanie':rows([".......yy.......",".....xxxxxx.....","....xxxxxxxx....","...yyyyyyyyyy..."],0,0,m);break;
  case 'flower':rows([".x.","xyx",".x."],dir==='side'?4:11,2,m);break;
  case 'cap':rows([".....xxxxxx.....","....xxxxxxxx....","...xxxxxxxxxx..."],0,0,m);if(dir==='down')rows(["...yyyyyyyyyy..."],0,3,m);else if(dir==='side')rows(["..........yyyy.."],0,3,m);break;
 }}
function buildPlayer(shirt,hair,look={}){
 const O=OUTFIT_SPR[look.outfit||'tee']||OUTFIT_SPR.tee;const hat=look.hat&&HATS[look.hat]?look.hat:null;
 const pants=O.pants==='skin'?SKIN:O.pants==='dark'?darken(shirt,0.7):O.pants||'#4a6ab8';
 const pal={h:hair,s:SKIN,e:'#2a2238',c:'#ff9bb0',r:shirt,R:darken(shirt,0.78),b:pants,k:'#5a3a2a',w:'#ffffff',d:'#4a7ac8',y:'#ffd040',T:'#ff6a8a',X:hat?HATS[hat].c1:'#fff',Y:hat?HATS[hat].c2:'#fff'};
 const mk=(dir,head,body,legs,flip)=>{const g=new Grid(16,16);g.rows(head,0,0);g.rows(body,0,10);g.rows(legs,0,14);hairOverlay(g,dir,look.style);hatOverlay(g,dir,hat);
  if(flip){const f=new Grid(16,16);for(let y=0;y<16;y++)for(let x=0;x<16;x++)f.set(15-x,y,g.get(x,y));return renderGrid(f,pal);}return renderGrid(g,pal);};
 const P={};
 P.down=PLAYER_LEGS.front.map(l=>mk('down',PLAYER_HEAD.down,O.front,l));
 P.up=PLAYER_LEGS.front.map(l=>mk('up',PLAYER_HEAD.up,O.front,l));
 P.right=PLAYER_LEGS.side.map(l=>mk('side',PLAYER_HEAD.side,O.side,l));
 P.left=PLAYER_LEGS.side.map(l=>mk('side',PLAYER_HEAD.side,O.side,l,true));
 _player=P;return P;
}
// ---------------- small things ----------------
const HEART=rowsSprite([".xx.xx.","xxxxxxx","xxxxxxx",".xxxxx.","..xxx..","...x..."],{x:'#ff5a7a'});
const NOTE=rowsSprite(["..xxx","..x.x","..x.x","xxx..","xxx.."],{x:'#5a7ae0'});
const EXCL=rowsSprite(["xx","xx","xx","..","xx"],{x:'#ff5a3a'});
const SPARK=rowsSprite(["..x..","..x..","xxyxx","..x..","..x.."],{x:'#fff6a0',y:'#ffffff'},{outline:false});
const ZZZ=rowsSprite(["xxx","..x",".x.","xxx"],{x:'#8a8ad8'});
const DIG=rowsSprite(["x...x",".x.x.","..x..",".x.x.","x...x"],{x:'#8a6a3a'},{outline:false});
const UMB=rowsSprite(["....xxxx....","..xxyxxyxx..",".xxyxxxxyxx.","xxxxxxxxxxxx","......k.....","......k.....","......k....."],{x:'#ff7a9a',y:'#ffd0dc',k:'#6a4a3a'});

// ---------------- item icons ----------------
const _icon={};
function itemIcon(id){
 if(_icon[id])return _icon[id];const it=ITEMS[id];let c;
 if(it&&it.cat==='furn'){c=furnSpr(it.furn);_icon[id]=c;return c;}
 if(it&&it.cat==='wear'){c=wearIcon(it.wear);_icon[id]=c;return c;}
 if(it&&it.cat==='wall'){c=swatchIcon('wall',id.slice(3));_icon[id]=c;return c;}
 if(it&&it.cat==='floor'){c=swatchIcon('floor',id.slice(3));_icon[id]=c;return c;}
 if(it&&it.cat==='cloth'){c=clothIcon(id);_icon[id]=c;return c;}
 if(typeof extraIcon==='function'){const x=extraIcon(id,it);if(x){_icon[id]=x;return x;}}
 const g=new Grid(16,16);let pal={};
 const fruit=(col)=>{pal={a:col,s:'#7a4a2a',g:'#4caf50',w:'#ffffff'};g.circle(8,9.5,5.5,'a');g.rect(8,2,1,3,'s');g.rect(9,2,3,2,'g');g.set(6,7,'w');g.set(5,8,'w');};
 switch(id){
  case 'apple':fruit('#ff4a4a');break; case 'peach':fruit('#ffa0b0');g.set(8,6,'s');break; case 'orange':fruit('#ffa030');break;
  case 'pear':pal={a:'#e8d860',s:'#7a4a2a',g:'#4caf50',w:'#ffffff'};g.ellipse(8,11,5,4.5,'a');g.circle(8,7,3,'a');g.rect(8,2,1,3,'s');g.rect(9,2,3,2,'g');g.set(6,9,'w');break;
  case 'cookie':pal={a:'#e0a860',c:'#7a4a2a'};g.circle(8,8.5,6,'a');[[5,6],[9,5],[7,9],[11,9],[5,11],[9,12]].forEach(p=>g.set(p[0],p[1],'c'));break;
  case 'feast':pal={a:'#f0c078',h:'#ff5a8a',c:'#7a4a2a'};g.circle(8,8.5,6.5,'a');g.rows([".x.x.","xxxxx",".xxx.","..x.."],6,6,{x:'h'});g.set(4,7,'c');g.set(12,11,'c');break;
  case 'seed_sun':case 'seed_straw':case 'seed_pump':pal={a:'#e8cfa0',t:'#a8703a',c:it.col};g.rect(4,4,8,10,'a');g.rect(5,2,6,2,'a');g.rect(5,4,6,1,'t');g.circle(8,10,2.5,'c');break;
  case 'stone':pal={a:'#a8a8b4',w:'#d8d8e0'};g.ellipse(8,10,6,4.5,'a');g.set(6,8,'w');g.set(7,8,'w');break;
  case 'gem':pal={a:'#7ae0ff',b:'#c8f6ff',c:'#3ab0e0'};g.rows(["...aaaaa...","..abbaaaa..",".abbaaaaaa.","aaaaaaaaaac",".caaaaaaac.","..caaaaac..","...caaac...","....cac....",".....c....."],2,3);break;
  case 'shell_s':pal={a:'#ffb8c8',b:'#ff8aa8'};g.ellipse(8,9,6,5,'a');g.rect(2,10,13,5,null);g.rect(6,10,4,3,'a');for(let x=4;x<13;x+=2)g.rect(x,5,1,4,'b');break;
  case 'shell_l':pal={a:'#f0d8b0',b:'#c8a070',c:'#ffeedd'};g.circle(7,9,5,'a');g.rows(["....x","...xx","..xx."],10,3,{x:'a'});g.set(7,9,'b');g.set(8,8,'b');g.set(6,7,'b');g.set(5,9,'b');g.set(7,11,'b');g.set(9,10,'b');break;
  case 'fossil':pal={a:'#f0e8d0'};g.rect(4,7,8,3,'a');g.circle(3.5,7,2,'a');g.circle(3.5,10,2,'a');g.circle(12.5,7,2,'a');g.circle(12.5,10,2,'a');break;
  case 'oldcoin':pal={a:'#e8c040',b:'#c8962a'};g.circle(8,8,6.5,'a');g.circle(8,8,4.5,'b');g.circle(8,8,3.5,'a');g.rect(7,7,2,2,null);break;
  case 'starbit':pal={a:'#ffe060',w:'#ffffff'};g.rows(["......a......",".....aaa.....",".....aaa.....","aaaaaawaaaaaa",".aaaawwwaaaa.","...aaaaaaa...","...aaaaaaa...","..aaaa.aaaa..","..aa.....aa.."],1,3);break;
  case 'egg':pal={a:'#fff4e0',b:'#8adc7a',c:'#ffb0c8'};g.ellipse(8,9,5,6.5,'a');g.circle(6,7,1.2,'b');g.circle(10,10,1.5,'c');g.circle(7,12,1,'b');g.circle(10,6,1,'b');break;
  case 'sunflower':pal={y:'#ffd030',c:'#8a5a2a',g:'#4caf50'};g.rect(7,11,2,5,'g');g.rect(9,12,3,2,'g');g.circle(8,7,5.5,'y');g.circle(8,7,2.5,'c');break;
  case 'strawberry':pal={r:'#ff4a5a',g:'#4caf50',y:'#fff27a'};g.ellipse(8,10,5,5,'r');g.rows(["x.x.x",".xxx."],6,3,{x:'g'});[[6,9],[9,8],[8,11],[10,11],[6,12]].forEach(p=>g.set(p[0],p[1],'y'));break;
  case 'pumpkin':pal={o:'#ff9a20',O:'#e07a10',g:'#4a8a3a'};g.ellipse(8,10,7,5,'o');g.rect(5,6,1,9,'O');g.rect(10,6,1,9,'O');g.rect(7,3,2,3,'g');break;
  case 'letterpaper':pal={a:'#fff8e8',b:'#ff9ab8'};g.rect(3,3,10,11,'a');for(let y=5;y<13;y+=2)g.rect(4,y,8,1,'b');break;
  case 'wood':pal={a:'#c88a4a',b:'#a8703a',c:'#f0d0a0',d:'#7a4e2a'};g.rect(2,5,12,4,'a');g.rect(2,9,12,4,'b');g.circle(13,7,2,'c');g.circle(13,11,2,'c');g.set(13,7,'d');g.set(13,11,'d');g.rect(4,6,6,1,'b');g.rect(5,10,6,1,'d');break;
  case 'branch':pal={a:'#9a6a3a',g:'#5cbf5a'};g.rows(["..........x..","........xx...",".......x.....","..xxxxxx.....",".x....x......","x......x.....","........x...."],1,4,{x:'a'});g.rect(11,3,2,2,'g');g.rect(2,6,2,2,'g');break;
  case 'iron':pal={a:'#7a7a8a',b:'#b8b8c8',c:'#e88a4a'};g.ellipse(8,10,6,4.5,'a');g.set(6,8,'b');g.set(7,8,'b');g.rect(9,9,2,2,'c');g.set(5,11,'c');g.rect(10,7,1,1,'b');break;
  case 'clay':pal={a:'#d88a5a',b:'#f0a878',c:'#b8683a'};g.ellipse(8,10,6,4,'a');g.ellipse(7,9,3,1.6,'b');g.set(10,12,'c');g.set(5,11,'c');break;
  case 'yakiringo':pal={a:'#c83a2a',b:'#ff7a4a',s:'#7a4a2a',w:'#fff0c0',p:'#ffffff'};g.ellipse(8,14,7,1.5,'p');g.circle(8,9,5.5,'a');g.circle(7,8,2.5,'b');g.rect(8,2,1,3,'s');g.rect(6,4,4,1,'w');break;
  case 'soup':pal={a:'#ffffff',b:'#ffa030',c:'#c8c8d8',s:'#ffe0a0'};g.ellipse(8,10,7,4,'a');g.ellipse(8,9,5.5,2.2,'b');g.rect(4,12,8,2,'c');g.rect(5,3,1,3,'s');g.rect(8,2,1,3,'s');g.rect(11,3,1,3,'s');break;
  case 'jam':pal={a:'#ff4a6a',g:'#e8f4ff',l:'#ffd0a0',r:'#ff9ab0'};g.rect(4,5,8,10,'g');g.rect(5,7,6,7,'a');g.rect(4,3,8,2,'r');g.rect(6,9,4,3,'l');break;
  case 'recipe':pal={a:'#fff8e8',b:'#c8823a',c:'#5a9ae8'};g.rect(3,2,10,12,'a');g.rect(3,2,10,2,'b');for(let y=6;y<13;y+=2)g.rect(5,y,6,1,'c');break;
  default:pal={a:'#cccccc'};g.circle(8,8,5,'a');
 }
 c=renderGrid(g,pal);_icon[id]=c;return c;
}

// ---------------- furniture ----------------
const _furn={};
function furnSpr(id){
 if(_furn[id])return _furn[id];let g=new Grid(16,16),pal={};
 switch(id){
  case 'bed':g=new Grid(16,18);pal={w:'#a8703a',W:'#8a5a2a',s:'#ffffff',b:'#6aa8f0',p:'#fff4d8'};g.rect(1,0,14,5,'w');g.rect(1,5,14,12,'s');g.rect(3,6,10,3,'p');g.rect(1,10,14,7,'b');g.rect(1,16,2,2,'W');g.rect(13,16,2,2,'W');break;
  case 'table':pal={t:'#d0904a',T:'#9a6030',c:'#ffffff'};g.ellipse(8,6,7.5,4,'t');g.rect(3,9,2,6,'T');g.rect(11,9,2,6,'T');g.rect(7,3,2,2,'c');break;
  case 'chair':pal={w:'#c88a4a',v:'#ff9a8a',l:'#8a5a2a'};g.rect(4,1,8,7,'w');g.rect(6,3,4,3,'v');g.rect(3,8,10,3,'v');g.rect(3,11,2,4,'l');g.rect(11,11,2,4,'l');break;
  case 'lamp':g=new Grid(16,22);pal={y:'#fff0b0',Y:'#ffd870',g:'#8a8a9a'};g.rows(["....yyyyyyyy....","...yyyyyyyyyy...","...yyyyyyyyyy...","..yyyyyyyyyyyy..","..YYYYYYYYYYYY.."],0,1);g.rect(7,6,2,13,'g');g.ellipse(8,20,4.5,1.6,'g');break;
  case 'plant':g=new Grid(16,20);pal={p:'#d8703a',P:'#b85a2a',l:'#3fa040',L:'#7ad46a'};g.rect(4,13,8,6,'p');g.rect(3,12,10,2,'P');g.circle(8,7,4.5,'l');g.circle(4.5,9.5,3,'l');g.circle(11.5,9.5,3,'l');g.circle(7,4,2,'L');g.circle(10,6,1.5,'L');break;
  case 'rug':g=new Grid(48,32);pal={r:'#e8708a',R:'#ffd0d8',q:'#ffffff'};g.ellipse(24,16,23.5,15.5,'r');g.ellipse(24,16,19,12,'R');g.ellipse(24,16,14,8.5,'r');g.ellipse(24,16,9,5,'R');for(let a=0;a<24;a++){const t=a/24*Math.PI*2;g.set(24+Math.cos(t)*21.3,16+Math.sin(t)*13.8,'q');}break;
  case 'rug2':g=new Grid(64,48);pal={r:'#5a8ad8',R:'#bcd4ff',y:'#ffd860'};g.rect(0,0,64,48,'r');g.rect(3,3,58,42,'R');g.rect(6,6,52,36,'r');g.rect(8,8,48,32,'R');for(let x=10;x<56;x+=6)for(let y=10;y<40;y+=6)g.set(x+(y%12?3:0),y,'y');break;
  case 'mat':g=new Grid(32,16);pal={m:'#7ac890',M:'#4a9a6a'};g.rect(0,2,32,12,'m');for(let x=2;x<32;x+=4)g.rect(x,4,2,8,'M');break;
  case 'shelf':g=new Grid(16,22);pal={w:'#b07a42',W:'#7a4e2a',a:'#ff6a6a',b:'#5a9ae8',c:'#ffd040',d:'#6ac86a'};g.rect(1,0,14,22,'w');g.rect(2,1,12,20,'W');
   [[2,1],[2,8],[2,15]].forEach(([x,y],i)=>{g.rect(2,y+6,12,1,'w');const bk='abcdabcd';for(let k=0;k<6;k++){g.rect(x+1+k*2,y+1+((k+i)%2),2,5-((k+i)%2),bk[(k+i)%8]);}});break;
  case 'tv':pal={k:'#3a3a4a',s:'#6ac8ff',S:'#bfeaff',w:'#a8703a'};g.rect(1,1,14,10,'k');g.rect(2,2,12,8,'s');g.rect(3,3,3,2,'S');g.rect(0,11,16,3,'w');g.rect(1,14,2,2,'w');g.rect(13,14,2,2,'w');break;
  case 'clock':g=new Grid(16,24);pal={w:'#a8703a',W:'#5a3a22',f:'#fff8e8',g:'#e8c040'};g.rect(4,0,8,24,'w');g.rect(3,0,10,2,'w');g.circle(8,5.5,3.6,'f');g.rect(6,11,4,10,'W');g.rect(8,11,1,6,'g');g.circle(8.5,17.5,1.6,'g');break;
  case 'fishbowl':pal={b:'#c8eeff',B:'#7ac8f0',o:'#ff7a3a',w:'#a8703a'};g.circle(8,6,5.5,'b');g.rect(3,6,11,6,null);g.ellipse(8,7,5.5,4,'B');g.rect(4,1,8,1,'b');g.set(7,7,'o');g.set(8,7,'o');g.set(9,8,'o');g.rect(2,12,12,2,'w');g.rect(3,14,2,2,'w');g.rect(11,14,2,2,'w');break;
  case 'kotatsu':pal={q:'#e85a4a',Q:'#ffd0a0',t:'#c88a4a',o:'#ffa030'};g.rect(0,6,16,9,'q');for(let x=1;x<16;x+=3)g.set(x,11,'Q');for(let x=2;x<16;x+=3)g.set(x,13,'Q');g.rect(1,3,14,5,'t');g.circle(8,4,1.8,'o');break;
  case 'fan':pal={b:'#9ad8ff',c:'#ffffff',g:'#8a8a9a'};g.circle(8,6,5.5,'b');g.circle(8,6,1.8,'c');g.rect(7,11,2,4,'g');g.ellipse(8,15,4,1.3,'g');break;
  case 'piano':g=new Grid(16,20);pal={k:'#3a2a2a',w:'#ffffff',W:'#c8a070'};g.rect(0,1,16,15,'k');g.rect(1,9,14,4,'w');for(let x=2;x<15;x+=2)g.rect(x,9,1,2,'k');g.rect(4,3,8,3,'W');g.rect(1,16,2,4,'k');g.rect(13,16,2,4,'k');break;
  case 'plush':{const c=monSpr('moppuru').n;_furn[id]=c;return c;}
  case 'radio':pal={r:'#e86a4a',k:'#3a3a4a',y:'#ffd040',g:'#8a8a9a'};g.rect(2,6,12,9,'r');g.circle(6,10.5,2.6,'k');g.rect(10,8,3,2,'y');g.rect(10,11,3,1,'k');g.rect(4,3,8,1,'g');g.rect(4,3,1,3,'g');g.rect(11,3,1,3,'g');g.rect(13,0,1,6,'g');break;
  case 'pumpkinlamp':pal={o:'#ff9a20',O:'#e07a10',g:'#4a8a3a',y:'#fff27a'};g.ellipse(8,10,7,5,'o');g.rect(7,3,2,3,'g');g.rows(["y....y","yy..yy","......","yyyyyy",".y..y."],5,8);break;
  case 'snowman':pal={w:'#ffffff',k:'#3a3a4a',o:'#ff8a30',r:'#ff5a6a'};g.circle(8,12,4.5,'w');g.circle(8,6,3.4,'w');g.set(7,5,'k');g.set(9,5,'k');g.set(8,6,'o');g.rect(5,1,6,2,'k');g.rect(6,0,4,1,'k');g.rect(5,8,7,1,'r');g.rect(10,9,1,2,'r');break;
  case 'sakuravase':pal={v:'#4a7ab0',b:'#7a4a2a',p:'#ffb0cc',P:'#ff80aa'};g.rect(6,10,4,6,'v');g.rect(5,10,6,1,'v');g.rect(7,4,1,6,'b');g.rect(5,3,1,4,'b');g.rect(10,2,1,6,'b');[[4,3],[7,2],[10,2],[5,6],[11,5],[8,4]].forEach(([x,y],i)=>g.circle(x+0.5,y+0.5,1.6,i%2?'p':'P'));break;
  case 'cushion':pal={c:'#ffb0c8',C:'#ff7aa0'};g.ellipse(8,8,7,5,'c');g.circle(8,10,1.2,'C');g.set(1,7,'C');g.set(14,7,'C');break;
  case 'momphoto':pal={w:'#c8823a',s:'#bfe8ff',h:'#ffd9b8',k:'#5a3a2a',g:'#8adc7a'};g.rect(3,1,10,12,'w');g.rect(4,2,8,8,'s');g.rect(4,8,8,2,'g');g.circle(6,6,1.5,'h');g.circle(10,6,1.5,'h');g.circle(8,7.5,1.2,'h');g.set(6,4,'k');g.set(10,4,'k');g.rect(6,13,4,2,'w');break;
  case 'bearstatue':pal={w:'#a8703a',W:'#7a4e2a',f:'#a8b4c0'};g.circle(8,5,3.6,'w');g.circle(5,2,1.3,'w');g.circle(11,2,1.3,'w');g.ellipse(8,11.5,5,4,'w');g.rect(3,7,10,2,'f');g.rect(1,6,2,4,'f');g.set(6,4,'W');g.set(10,4,'W');g.rect(4,15,8,1,'W');break;
  case 'bigfish':pal={w:'#7a4e2a',p:'#fff8e8',k:'#3a3a4a',r:'#ff4a4a'};g.rect(0,2,16,12,'w');g.rect(1,3,14,10,'p');g.ellipse(7,8,5,2.6,'k');g.rows(["x.","xx","x."],12,7,{x:'k'});g.rect(12,4,2,2,'r');break;
  case 'globe':pal={b:'#4a9ae8',g:'#5cbf5a',y:'#e8c040',w:'#a8703a'};g.circle(8,7,5,'b');g.rect(5,5,3,2,'g');g.rect(9,8,3,2,'g');g.rect(6,9,2,1,'g');g.rect(2,3,1,8,'y');g.rect(7,12,2,2,'w');g.rect(4,14,8,2,'w');break;
  case 'teaset':pal={t:'#c88a4a',w:'#ffffff',b:'#7ab0e8'};g.ellipse(8,12,7.5,3,'t');g.circle(6,8,3,'w');g.rect(9,7,2,1,'w');g.rect(5,4,2,1,'w');g.rect(11,10,3,2,'w');g.set(6,8,'b');g.set(12,10,'b');break;
  case 'bonsai':pal={p:'#6a5a8a',b:'#7a4a2a',g:'#3a8a3a',G:'#6ac06a'};g.rect(3,12,10,3,'p');g.rect(7,7,2,5,'b');g.rect(5,8,2,1,'b');g.ellipse(8,5,5,2.5,'g');g.ellipse(4,8,2.5,1.6,'g');g.ellipse(12,7,2.5,1.6,'G');break;
  case 'music':pal={w:'#c86a8a',W:'#a84a6a',y:'#e8c040',n:'#5a7ae0'};g.rect(3,8,10,7,'w');g.rect(3,5,10,3,'W');g.rect(3,8,10,1,'y');g.rect(7,11,2,2,'y');g.rows(["..xx","..x.","xxx.","xx.."],10,0,{x:'n'});break;
  case 'workbench':pal={t:'#c88a4a',T:'#9a6030',l:'#7a4e2a',s:'#a8a8b8',h:'#e8c040'};g.rect(0,4,16,4,'t');g.rect(0,7,16,1,'T');g.rect(1,8,2,8,'l');g.rect(13,8,2,8,'l');g.rect(3,11,10,1,'l');g.rect(2,1,5,2,'s');g.rect(4,0,1,4,'l');g.rect(10,2,4,2,'h');g.rect(11,1,2,1,'T');break;
  case 'stool':pal={a:'#c88a4a',b:'#f0d0a0',c:'#a8703a',d:'#7a4e2a'};g.ellipse(8,6,6,2.5,'b');g.rect(2,6,12,8,'a');g.ellipse(8,14,6,2,'c');g.rect(5,8,1,5,'c');g.rect(10,9,1,4,'c');g.set(8,6,'d');g.set(7,5,'c');break;
  case 'wchair':pal={w:'#c88a4a',W:'#9a6030',l:'#7a4e2a'};g.rect(4,0,8,8,'w');g.rect(5,1,6,1,'W');g.rect(5,4,6,1,'W');g.rect(3,8,10,3,'w');g.rect(3,10,10,1,'W');g.rect(3,11,2,4,'l');g.rect(11,11,2,4,'l');break;
  case 'wtable':pal={t:'#c88a4a',T:'#9a6030',l:'#7a4e2a'};g.rect(0,4,16,5,'t');g.rect(0,8,16,1,'T');g.rect(0,6,16,1,'T');g.rect(1,9,2,7,'l');g.rect(13,9,2,7,'l');break;
  case 'woodbox':pal={a:'#c88a4a',b:'#9a6030',i:'#9a9aaa',y:'#ffd040'};g.rect(1,3,14,12,'a');g.rect(1,7,14,1,'b');g.rect(1,3,14,1,'b');g.rect(2,3,1,12,'i');g.rect(13,3,1,12,'i');g.rect(7,7,2,3,'y');break;
  case 'stonelamp':g=new Grid(16,20);pal={s:'#a8a8b8',S:'#c8c8d4',y:'#fff0a0',k:'#6a6a7a'};g.rect(2,2,12,3,'S');g.rect(4,0,8,2,'S');g.rect(4,5,8,6,'s');g.rect(6,6,4,4,'y');g.rect(3,11,10,2,'S');g.rect(6,13,4,4,'s');g.rect(4,17,8,3,'k');break;
  case 'stove':g=new Grid(16,20);pal={k:'#4a4a5a',K:'#6a6a7a',o:'#ff8a3a',y:'#ffd860',p:'#8a8a9a'};g.rect(7,0,3,6,'p');g.rect(2,6,12,11,'k');g.rect(3,7,10,1,'K');g.rect(5,10,6,5,'o');g.rect(6,12,4,2,'y');g.rect(2,17,2,3,'k');g.rect(12,17,2,3,'k');break;
  case 'shelllamp':g=new Grid(16,20);pal={a:'#ffd0dc',b:'#ff9ab8',y:'#fff4c0',w:'#c8a070'};g.ellipse(8,6,7,6,'a');for(let x=3;x<14;x+=2)g.rect(x,2,1,8,'b');g.ellipse(8,7,3,2.5,'y');g.rect(7,12,2,5,'w');g.ellipse(8,18,5,1.6,'w');break;
  case 'pot':pal={a:'#d88a5a',b:'#f0a878',c:'#a8603a'};g.ellipse(8,10,6,5,'a');g.rect(5,2,6,3,'a');g.rect(4,2,8,1,'c');g.ellipse(6,8,2,3,'b');g.rect(3,11,10,1,'c');break;
  case 'planter':pal={a:'#d88a5a',c:'#a8603a',g:'#4caf50',y:'#ffd030',p:'#ff8ab0',w:'#ffffff'};g.rect(2,9,12,6,'a');g.rect(1,9,14,2,'c');g.rect(4,4,1,5,'g');g.rect(8,3,1,6,'g');g.rect(11,5,1,4,'g');g.circle(4.5,3.5,1.8,'p');g.circle(8.5,2.5,1.8,'y');g.circle(11.5,4.5,1.8,'w');break;
  case 'fossilmodel':g=new Grid(16,18);pal={a:'#f0e8d0',w:'#9a6030',b:'#c8b898'};g.rect(1,15,14,3,'w');g.rect(7,6,2,9,'b');g.rows(["...aaa......","..aaaaa.....","..a.aaaaaaa.",".....aaaaaaa",".....a.a.a.a",".....a.a.a.a","aaaaaaaaaa.."],2,1);break;
  case 'starlamp':g=new Grid(16,20);pal={y:'#ffe060',w:'#ffffff',k:'#6a6a7a'};g.rows(["......y......",".....yyy.....","yyyyyywyyyyyy",".yyyywwwyyyy.","...yyyyyyy...","..yyyy.yyyy..",".yy.......yy."],1,1);g.rect(7,8,2,9,'k');g.ellipse(8,18,5,1.6,'k');break;
  case 'ball':pal={r:'#ff5a6a',w:'#ffffff',y:'#ffd040',b:'#5a9ae8'};g.circle(8,10.5,5,'r');g.rect(7,5,2,11,'w');g.rect(3,10,11,1,'b');g.ellipse(8,10.5,1.5,1.5,'y');g.set(5,7,'w');break;
  case 'yarn':pal={p:'#ff9ac0',P:'#e8608a',n:'#c8a070'};g.circle(8,10,5,'p');for(let i=0;i<4;i++){g.set(5+i,7+i,'P');g.set(7+i,6+i,'P');g.set(4+i,10+i,'P');}g.rows(["x....","xx...",".xxx.","...xx"],10,12,{x:'P'});break;
  case 'slide':g=new Grid(18,20);pal={b:'#5ab4f0',B:'#a8dcff',l:'#ffd040',L:'#e8a020',k:'#8a8aa0'};for(let y=2;y<20;y++){g.set(14,y,'l');g.set(17,y,'l');}for(let y=4;y<20;y+=3)g.rect(15,y,2,1,'L');
   for(let i=0;i<13;i++){const x=13-i,y=3+i;g.rect(x,y,2,2,'b');g.set(x,y-1,'B');}g.rect(0,16,3,2,'b');g.rect(1,18,1,2,'k');g.rect(7,12,1,8,'k');break;
  case 'tsumiki':pal={r:'#ff6a6a',b:'#5a9ae8',y:'#ffd040',g:'#5cbf5a'};g.rect(2,10,6,6,'r');g.rect(8,10,6,6,'b');g.rows(["...x...","..xxx..",".xxxxx.","xxxxxxx"],5,6,{x:'y'});g.rect(10,12,2,2,'y');g.rect(4,12,2,2,'g');break;
  case 'mokuba':pal={a:'#d8904a',b:'#a8603a',m:'#5a3a22',e:'#2a2238',r:'#ff6a6a',k:'#8a5a2a'};g.ellipse(8,8,5,3,'a');g.rect(11,2,3,6,'a');g.rect(12,1,3,3,'a');g.rect(10,2,2,5,'m');g.set(13,2,'e');g.rect(3,6,2,2,'m');
   g.rect(5,10,2,3,'b');g.rect(10,10,2,3,'b');for(let x=1;x<16;x++){const y=13+Math.round(Math.pow((x-8)/7,2)*-2+2);g.set(x,y,'k');g.set(x,y-1,'k');}g.rect(7,5,3,2,'r');break;
  case 'taiko':pal={r:'#e84a3a',R:'#b8302a',w:'#fff4e0',y:'#ffd040',k:'#7a4e2a'};g.rect(3,6,10,8,'r');g.ellipse(8,6,5,2,'w');for(let x=3;x<13;x+=2){g.set(x,9,'y');g.set(x+1,10,'y');}g.rect(3,13,10,1,'R');g.rect(4,14,1,2,'k');g.rect(11,14,1,2,'k');g.rect(1,1,1,5,'k');g.ellipse(1.5,1,1.2,1.2,'w');break;
  case 'petbed':pal={b:'#c88a4a',B:'#9a6030',p:'#ffc0d4',P:'#ff9ab8'};g.ellipse(8,9,7.5,5,'b');g.ellipse(8,9,5.5,3.2,'p');g.ellipse(8,10,3,1.4,'P');for(let x=2;x<15;x+=3)g.set(x,12,'B');break;
  case 'wshelf':g=new Grid(16,20);pal={w:'#c88a4a',W:'#9a6030',a:'#ff8a6a',b:'#7ab0e8',c:'#ffd040',g:'#5cbf5a'};g.rect(1,0,14,20,'w');g.rect(2,1,12,18,'W');g.rect(2,6,12,1,'w');g.rect(2,12,12,1,'w');g.rect(3,3,3,3,'a');g.rect(7,2,2,4,'b');g.circle(11.5,4,1.6,'g');g.rect(3,8,4,4,'c');g.rect(9,9,4,3,'a');g.rect(4,14,8,4,'b');break;
  case 'mirror':g=new Grid(16,22);pal={w:'#e8c070',W:'#b8904a',m:'#cfeaff',M:'#ffffff'};g.ellipse(8,9,6.5,8.5,'w');g.ellipse(8,9,5,7,'m');g.rect(5,4,2,5,'M');g.rect(7,3,1,2,'M');g.rect(4,18,8,2,'W');g.rect(7,17,2,2,'W');break;
  case 'xmastree':g=new Grid(16,22);pal={g:'#2e8a4a',G:'#4ab060',b:'#7a4e2a',y:'#ffd040',r:'#ff5a5a',u:'#5a9ae8',p:'#c8603a'};for(let l=0;l<3;l++){const top=3+l*5,w=3+l*2;for(let j=0;j<6;j++){const hw=Math.round(w*j/6)+1;g.rect(8-hw,top+j,hw*2,1,j%2?'g':'G');}}g.rows(["..y..",".yyy.","..y.."],6,0);g.rect(7,18,2,2,'b');g.rect(5,20,6,2,'p');[[6,8,'r'],[10,11,'u'],[5,15,'y'],[11,16,'r'],[8,13,'u']].forEach(([x,y,c])=>g.set(x,y,c));break;
  case 'kadomatsu':g=new Grid(16,20);pal={g:'#5cbf5a',G:'#3a9a4a',w:'#c8a060',p:'#3a7a3a',r:'#ff6a6a'};g.rect(5,2,2,14,'g');g.rect(8,0,2,16,'G');g.rect(11,4,2,12,'g');g.rect(5,2,2,1,'w');g.rect(8,0,2,1,'w');g.rect(11,4,2,1,'w');g.rect(3,14,11,6,'w');g.rect(3,16,11,1,'r');g.rect(2,10,3,4,'p');g.rect(12,10,3,4,'p');break;
  case 'momiji':g=new Grid(16,18);pal={b:'#7a4e2a',r:'#e8502a',o:'#ffa030',v:'#4a7ab0'};g.rect(6,11,4,7,'v');g.rect(7,3,1,8,'b');g.rect(5,6,3,1,'b');g.rect(8,5,3,1,'b');[[4,4,'r'],[9,2,'o'],[11,5,'r'],[6,1,'r'],[3,7,'o'],[10,8,'r']].forEach(([x,y,c])=>g.circle(x+0.5,y+0.5,1.6,c));break;
  case 'tanabata':g=new Grid(16,22);pal={g:'#5cbf5a',G:'#3a9a4a',a:'#ff8ab0',b:'#5ab0f0',c:'#ffd040',d:'#ffffff'};g.rect(7,0,2,22,'G');for(let y=2;y<18;y+=4){g.rect(3,y,4,1,'g');g.rect(9,y+2,4,1,'g');}[[3,3,'a'],[11,5,'b'],[4,8,'c'],[12,10,'a'],[3,12,'b'],[11,14,'d']].forEach(([x,y,c])=>g.rect(x,y,2,4,c));break;
  case 'portrait':{const c=mkCanvas(24,26);const x=c.getContext('2d');x.fillStyle='#3b2a20';x.fillRect(0,0,24,26);x.fillStyle='#e8c070';x.fillRect(1,1,22,24);x.fillStyle='#fff8e8';x.fillRect(3,3,18,18);
   if(typeof S!=='undefined'&&S&&S.portrait){const m=monSpr(S.portrait.sp,S.portrait.look).n;x.drawImage(m,2,2);}x.fillStyle='#c8904a';x.fillRect(3,22,18,2);_furn[id]=c;return c;}
  default:pal={a:'#cccccc'};g.rect(2,2,12,12,'a');
 }
 const c=renderGrid(g,pal);_furn[id]=c;return c;
}

// ---------------- crops ----------------
function cropSpr(crop,stage){
 const k=crop+stage;if(_furn['crop_'+k])return _furn['crop_'+k];const g=new Grid(16,16);let pal={g:'#4caf50',G:'#7ad46a',y:'#ffd030',c:'#8a5a2a',r:'#ff4a5a',o:'#ff9a20'};
 if(stage===0){g.rows([".x.x.","..x..","..x.."],5,9,{x:'g'});}
 else if(stage===1){g.rows(["x...x","xx.xx",".xxx.","..x..","..x.."],5,7,{x:'g'});}
 else if(stage===2){g.rect(7,3,2,10,'g');g.rows(["xx..xx","xxxxxx",".xxxx."],5,6,{x:'G'});g.rows(["xx..xx",".xxxx."],5,10,{x:'g'});}
 else{ if(crop.startsWith('tulip_')){const cc=crop.slice(6);const col=cc==='n'?'#ff6a8a':FLOWER_COLS[cc][1];pal.t=col;pal.u=cc==='n'?'#7ac8ff':darken(col==='#ffffff'?'#e8e8f0':col,0.8);g.rect(7,7,2,8,'g');g.rect(9,10,3,2,'g');g.rows(["x.x.x","xxxxx","xxxxx",".xxx."],5,2,{x:'t'});g.rect(6,4,4,2,'u');}
  else if(crop==='sunflower'){g.rect(7,6,2,9,'g');g.rect(9,10,3,2,'g');g.circle(8,5,4.5,'y');g.circle(8,5,2,'c');}
  else if(crop==='strawberry'){g.ellipse(8,10,6,4,'g');g.circle(5,11,1.8,'r');g.circle(9,9,1.8,'r');g.circle(11,12,1.8,'r');}
  else{g.rows(["xx..xx",".xxxx."],5,6,{x:'g'});g.ellipse(8,11,6,4,'o');g.rect(7,6,2,2,'g');}}
 const c=renderGrid(g,pal);_furn['crop_'+k]=c;return c;
}

// ---------------- UI icons ----------------
function uiIcon(kind){
 const g=new Grid(14,14);let pal={};
 switch(kind){
  case 'bag':pal={a:'#d8904a',b:'#a8603a',c:'#ffd040'};g.rect(2,4,10,9,'a');g.rect(4,1,6,1,'b');g.rect(4,1,1,3,'b');g.rect(9,1,1,3,'b');g.rect(2,4,10,3,'b');g.rect(6,6,2,2,'c');break;
  case 'paw':pal={a:'#ff8aa8'};g.ellipse(7,9.5,3.5,3,'a');g.circle(3,5,1.6,'a');g.circle(5.5,2.8,1.6,'a');g.circle(8.5,2.8,1.6,'a');g.circle(11,5,1.6,'a');break;
  case 'book':pal={a:'#5a9ae8',b:'#ffffff',c:'#ffd040'};g.rect(2,1,10,12,'a');g.rect(3,2,1,10,'b');g.rect(6,4,4,3,'c');break;
  case 'scroll':pal={a:'#fff0c8',b:'#c8823a',c:'#ff5a3a'};g.rect(3,2,8,10,'a');g.rect(2,1,10,2,'b');g.rect(2,11,10,2,'b');g.rect(6,4,2,4,'c');g.rect(6,9,2,1,'c');break;
  case 'gear':pal={a:'#9aa0b4',b:'#ffffff'};g.circle(7,7,4.5,'a');for(const[x,y]of[[6,0],[6,12],[0,6],[12,6],[2,2],[10,2],[2,10],[10,10]])g.rect(x,y,2,2,'a');g.circle(7,7,1.8,'b');break;
  case 'mail':pal={a:'#ffffff',b:'#ff7a8a',c:'#d8d8e8'};g.rect(1,3,12,9,'a');g.rows(["x..........x",".x........x.","..x......x..","...xx..xx...",".....xx....."],1,3,{x:'c'});g.rect(5,7,4,3,'b');break;
  case 'coin':pal={a:'#ffd040',b:'#e8a020',c:'#fff6a0'};g.circle(7,7,6,'a');g.circle(7,7,4,'b');g.rect(6,4,2,6,'c');break;
  case 'clear':pal={a:'#ffb020',b:'#ffe060'};g.circle(7,7,3.5,'b');[[6,0],[6,12],[0,6],[12,6],[2,2],[10,2],[2,10],[10,10]].forEach(([x,y])=>g.rect(x,y,2,2,'a'));break;
  case 'cloudy':pal={a:'#e8eef6',b:'#b8c4d4'};g.circle(5,8,3.5,'a');g.circle(9,7,4,'a');g.rect(2,8,11,4,'a');g.rect(2,11,11,1,'b');break;
  case 'rain':pal={a:'#c8d4e4',b:'#5a9ae8'};g.circle(5,5,3,'a');g.circle(9,4.5,3.5,'a');g.rect(2,5,11,3,'a');g.rect(3,10,1,2,'b');g.rect(7,10,1,3,'b');g.rect(11,10,1,2,'b');break;
  case 'snow':pal={a:'#ffffff'};g.rows(["..x..x..x..","...x.x.x...","....xxx....","xxxxxxxxxxx","....xxx....","...x.x.x...","..x..x..x.."],1,3);break;
  case 'house':pal={a:'#e8605a',b:'#fff3dc',c:'#8a5a32'};g.rows(["......x......",".....xxx.....","....xxxxx....","...xxxxxxx...","..xxxxxxxxx.."],0,1,{x:'a'});g.rect(3,6,8,7,'b');g.rect(6,9,2,4,'c');break;
  case 'till':pal={w:'#a8703a',m:'#a8a8b8',M:'#d8d8e4'};for(let i=0;i<10;i++)g.set(3+i,12-i,'w');g.set(4+0,12,'w');g.rect(8,1,5,3,'m');g.rect(8,1,5,1,'M');break;
  case 'chop':pal={w:'#a8703a',m:'#a8a8b8',M:'#e4e4ec'};for(let i=0;i<10;i++)g.set(3+i,12-i,'w');g.rows(["xx...","xxx..","xxxx.","xxx..","xx..."],8,1,{x:'m'});g.rect(8,1,1,5,'M');break;
  case 'hand':pal={a:'#ffd9b8'};g.rect(3,6,8,6,'a');g.rect(3,2,2,5,'a');g.rect(5,1,2,6,'a');g.rect(7,2,2,5,'a');g.rect(9,3,2,4,'a');g.rect(11,7,2,3,'a');break;
  case 'camera':pal={a:'#5a5a6a',b:'#9a9aaa',c:'#7ac8ff',w:'#ffffff',r:'#ff5a6a'};g.rect(1,4,12,8,'a');g.rect(4,2,5,2,'a');g.circle(7,8,3.2,'b');g.circle(7,8,2,'c');g.set(6,7,'w');g.rect(10,5,2,1,'r');break;
  case 'shirt':pal={a:'#ff8ab0'};g.rows(["..aa..aa..",".aaaaaaaaa.","aaaaaaaaaaaa","aa.aaaaaa.aa","...aaaaaa...","...aaaaaa...","...aaaaaa..."],1,3);break;
  case 'album':pal={a:'#ff9ab8',b:'#fff8e8',c:'#7ac8ff',g:'#5cbf5a'};g.rect(1,1,12,12,'a');g.rect(3,3,8,7,'b');g.rect(4,4,6,4,'c');g.rect(4,7,6,1,'g');break;
  case 'hut':pal={a:'#e8a060',b:'#c8703a',c:'#5a3a22'};g.rows(["......x......",".....xxx.....","....xxxxx....","...xxxxxxx...","..xxxxxxxxx.."],0,1,{x:'b'});g.rect(3,6,8,7,'a');g.circle(7,11,2.2,'c');g.rect(5,11,4,2,'c');break;
 }
 return renderGrid(g,pal);
}

// ---------------- world: trees, rocks ----------------
const SEASON_PAL = {
 sp:{g1:'#86d462',g2:'#6fc054',g3:'#a8e682',tall:'#3f9e3e',tall2:'#6fc456',path:'#e6c88e',path2:'#c9a46a',sand:'#f6e2a6',flowers:['#ffb3d1','#fff07a','#ffffff','#ff8ab0'],trees:[['#3e9a48','#5cbf5a','#8ee07a'],['#e889ae','#ffb4cf','#ffe4ee']],snow:false},
 su:{g1:'#62c452',g2:'#50ae44',g3:'#88da6c',tall:'#2f8e38',tall2:'#56b84a',path:'#e6c88e',path2:'#c9a46a',sand:'#f8e4a0',flowers:['#ff6a6a','#fff07a','#6ab0ff','#ffffff'],trees:[['#2f8a40','#4cae4c','#7ad46a']],snow:false},
 au:{g1:'#bcc65e',g2:'#a8b250',g3:'#d4d878',tall:'#8a983a',tall2:'#b4bc4c',path:'#dcb880',path2:'#c09460',sand:'#f2dca0',flowers:['#ff9a4a','#ffe060','#e86a8a','#ffffff'],trees:[['#c8502a','#ec8a3a','#f8c04a'],['#c89a20','#ecc640','#fff080'],['#a84030','#d8603a','#f09050']],snow:false},
 wi:{g1:'#eaf2fa',g2:'#d4e2ee',g3:'#ffffff',tall:'#a8bccc',tall2:'#d0dde8',path:'#d8d0c4',path2:'#bdb2a2',sand:'#e8e0cc',flowers:['#ffffff','#d8e8ff'],trees:[['#b8ccd8','#dce8f2','#ffffff']],snow:true},
};
const PINE=['#2a6a48','#3a8a5a','#5aa870'];
function treeGrid(kind,cols,snow){
 const g=new Grid(16,24);
 g.rect(6,16,4,8,'t');g.rect(9,16,1,8,'T');
 if(kind==='pine'){
  const tiers=[[2,4,3],[6,6,5],[11,8,7]];
  for(const[top,h,half] of tiers){for(let r=0;r<h;r++){const hw=Math.round(1+(half-1)*(r/(h-1)));for(let x=8-hw;x<8+hw;x++)g.set(x,top+r,r<2?'3':(x<8?'2':'1'));}}
  if(snow){for(let x=0;x<16;x++)for(let y=0;y<22;y++){const c=g.get(x,y);if(c&&c!=='t'&&c!=='T'&&!g.get(x,y-1)){g.set(x,y,'s');if(y+1<22&&g.get(x,y+1)&&((x+y)%2))g.set(x,y+1,'s');}}}
 }else{
  g.circle(8,10,7.2,'1');g.circle(4,13,4,'1');g.circle(12,13,4,'1');g.circle(7.5,8.5,5.5,'2');g.circle(10.5,11,3.5,'2');g.circle(6,6,3,'3');g.circle(9,5,1.6,'3');
  if(snow){for(let x=0;x<16;x++)for(let y=0;y<18;y++){const c=g.get(x,y);if(c&&!g.get(x,y-1))g.set(x,y,'s');}}
 }
 return {g,pal:{'1':cols[0],'2':cols[1],'3':cols[2],t:'#8a5a32',T:'#6a4024',s:'#ffffff'}};
}
const _tree={};
function treeSpr(kind,cols,snow){const k=kind+cols.join()+snow;if(_tree[k])return _tree[k];const T=treeGrid(kind,cols,snow);const c=renderGrid(T.g,T.pal,{noShade:'s'});_tree[k]=c;return c;}
function rockSpr(snow){const k='rock'+snow;if(_tree[k])return _tree[k];const g=new Grid(16,16);g.ellipse(8,10,7,5.2,'a');g.ellipse(6.5,8.5,4,2.8,'b');g.set(10,10,'c');g.set(11,11,'c');g.set(9,12,'c');if(snow){g.ellipse(7,6.5,5,2,'s');}
 const c=renderGrid(g,{a:'#9a9aa8',b:'#c4c4d0',c:'#6a6a7a',s:'#ffffff'});_tree[k]=c;return c;}
function lampSpr(){if(_tree.lamp)return _tree.lamp;const g=new Grid(10,22);g.rect(4,7,2,15,'g');g.rect(2,20,6,2,'g');g.rect(2,1,6,6,'y');g.rect(1,0,8,1,'k');g.rect(1,6,8,1,'k');g.rect(3,2,4,3,'Y');
 const c=renderGrid(g,{g:'#4a4a5a',y:'#ffe9a0',Y:'#fff8d8',k:'#3a3a4a'});_tree.lamp=c;return c;}
function fruitTreeSpr(S,season,hasFruit,fruitCol){
 const k='ft'+season+hasFruit+fruitCol;if(_tree[k])return _tree[k];
 const cols=season==='sp'?['#4caa50','#6cc860','#ffd0e0']:S.trees[0];const T=treeGrid('round',cols,S.snow);
 if(season==='sp'){[[4,7],[11,6],[7,12],[12,11],[3,12],[9,3]].forEach(([x,y])=>{T.g.set(x,y,'3');T.g.set(x+1,y,'3');});}
 if(hasFruit){T.pal.f=fruitCol;T.pal.w='#ffffff';[[4,9],[10,7],[7,13],[12,12],[6,4]].forEach(([x,y])=>{T.g.rect(x,y,2,2,'f');T.g.set(x,y,'w');});}
 const c=renderGrid(T.g,T.pal,{noShade:'swf'});_tree[k]=c;return c;
}
const TUFT=(S)=>{const k='tuft'+S.tall;if(_tree[k])return _tree[k];const g=new Grid(16,7);const t=["l..l.l","x.lxlx",".xxxx.","xxxxxx"];g.rows(t,0,3);g.rows(t,5,2);g.rows(t,10,3);
 const c=renderGrid(g,{x:S.tall,l:S.tall2},{outline:false,noShade:'l'});_tree[k]=c;return c;};
const TUFT1=(S)=>{const k='tuft1'+S.tall;if(_tree[k])return _tree[k];const g=new Grid(7,6);g.rows(["l..l..l",".lxlxl.","xxxxxxx",".xxxxx."],0,1);const c=renderGrid(g,{x:S.tall,l:S.tall2},{noShade:'l',outlineColor:darken(S.tall,0.6)});_tree[k]=c;return c;};

// ---------------- map layers ----------------
function drawTileBase(ctx,W,x,y,S,frame){
 const t=W.t[y][x];const px=x*TS,py=y*TS;const r=mkRng(hashStr(x+':'+y));
 const grass=()=>{ctx.fillStyle=S.g1;ctx.fillRect(px,py,TS,TS);for(let i=0;i<4;i++){const gx=px+1+Math.floor(r()*12),gy=py+1+Math.floor(r()*13);ctx.fillStyle=r()<0.5?S.g2:S.g3;ctx.fillRect(gx,gy+1,1,1);ctx.fillRect(gx+1,gy,1,1);ctx.fillRect(gx+2,gy+1,1,1);}};
 const isW=(c)=>c==='~'||c==='S';
 switch(t){
  case '.':case '#':case 'T':case 'B':case 'M':case 'K':case 'F':case 'L':case 'H':grass();
   if(t==='#'||t==='T'){ctx.fillStyle='rgba(30,40,20,0.22)';ctx.fillRect(px+2,py+12,12,3);ctx.fillRect(px+4,py+15,8,1);}
   break;
  case ',':{grass();const fl=S.flowers;for(let i=0;i<3;i++){const fx=px+2+Math.floor(r()*10),fy=py+2+Math.floor(r()*10);const c=fl[Math.floor(r()*fl.length)];
    ctx.fillStyle=c;ctx.fillRect(fx,fy-1,1,1);ctx.fillRect(fx-1,fy,3,1);ctx.fillRect(fx,fy+1,1,1);if(!S.snow){ctx.fillStyle='#fff6a0';ctx.fillRect(fx,fy,1,1);}}break;}
  case '"':{grass();ctx.fillStyle=darken(S.g1,0.93);ctx.fillRect(px,py,TS,TS);const T1=TUFT1(S);const o=(x+y)%2?3:0;ctx.drawImage(T1,px-2+o,py-2);ctx.drawImage(T1,px+7-o,py+3-2);ctx.drawImage(T1,px-1+o,py+8-2);ctx.drawImage(T1,px+8,py+10-2);break;}
  case ':':{ctx.fillStyle=S.path;ctx.fillRect(px,py,TS,TS);ctx.fillStyle=S.path2;for(let i=0;i<4;i++){ctx.fillRect(px+Math.floor(r()*14),py+Math.floor(r()*14),2,1);}
    // soft edges against grass
    const nb=[[0,-1],[0,1],[-1,0],[1,0]];ctx.fillStyle=S.g1;nb.forEach(([dx,dy])=>{const c=W.get(x+dx,y+dy);if(c==='.'||c===','||c==='"'||c==='#'){for(let k=0;k<16;k+=3){const o=Math.floor(r()*2);if(dx===0)ctx.fillRect(px+k,dy<0?py:py+15,2,1+o);else ctx.fillRect(dx<0?px:px+15,py+k,1+o,2);}}});break;}
  case 's':{ctx.fillStyle=S.sand;ctx.fillRect(px,py,TS,TS);ctx.fillStyle=darken(S.sand,0.9);for(let i=0;i<5;i++)ctx.fillRect(px+Math.floor(r()*15),py+Math.floor(r()*15),1,1);break;}
  case 'P':{grass();ctx.fillStyle='#9a6a42';ctx.fillRect(px+1,py+1,14,14);ctx.fillStyle='#7a4e2e';for(let k=3;k<15;k+=4)ctx.fillRect(px+2,py+k,12,1);break;}
  case 'f':{grass();break;}
  case 'R':{grass();break;}
  case '=':{ctx.fillStyle='#4aa8e8';ctx.fillRect(px,py,TS,TS);ctx.fillStyle='#c8945a';ctx.fillRect(px+1,py,14,TS);ctx.fillStyle='#9a6a3a';for(let k=0;k<16;k+=4)ctx.fillRect(px+1,py+k,14,1);ctx.fillStyle='#7a4e2a';ctx.fillRect(px,py,2,TS);ctx.fillRect(px+14,py,2,TS);break;}
  case '~':case 'S':{const deep=t==='S';ctx.fillStyle=deep?'#3a8ad8':(S.snow?'#5aa8d8':'#4aa8e8');ctx.fillRect(px,py,TS,TS);
    ctx.fillStyle=deep?'#4a9ae4':'#5ab4ee';for(let i=0;i<3;i++){const wx=px+Math.floor(r()*11),wy=py+Math.floor(r()*14);ctx.fillRect(wx+(frame?1:0),wy,4,1);}
    ctx.fillStyle='#ffffff';if(r()<0.5){const sx=px+Math.floor(r()*13),sy=py+Math.floor(r()*13);ctx.fillRect(sx+(frame?2:0),sy,2,1);}
    const foam=deep?'#bfe6ff':'#a8dcff';[[0,-1],[0,1],[-1,0],[1,0]].forEach(([dx,dy])=>{const c=W.get(x+dx,y+dy);if(!isW(c)&&c!=='='){ctx.fillStyle=foam;if(dx===0)ctx.fillRect(px,dy<0?py:py+13+(frame?0:1),TS,dy<0?2+(frame?1:0):3-(frame?0:1));else ctx.fillRect(dx<0?px:px+14,py,2,TS);
      ctx.fillStyle='#ffffff';if(dx===0)ctx.fillRect(px+(frame?3:9),dy<0?py:py+15,4,1);}});break;}
  default:grass();
 }
}
function drawFence(ctx,W,x,y){const px=x*TS,py=y*TS;const f=(c)=>c==='f';ctx.fillStyle='#fff4e0';
 ctx.fillRect(px+6,py+3,4,11);ctx.fillStyle='#c8a880';ctx.fillRect(px+6,py+13,4,1);
 ctx.fillStyle='#fff4e0';if(f(W.get(x-1,y))){ctx.fillRect(px,py+5,7,2);ctx.fillRect(px,py+9,7,2);}if(f(W.get(x+1,y))){ctx.fillRect(px+9,py+5,7,2);ctx.fillRect(px+9,py+9,7,2);}
 if(f(W.get(x,y+1))){ctx.fillRect(px+7,py+12,2,4);}ctx.fillStyle='#8a6a4a';ctx.fillRect(px+5,py+3,1,11);ctx.fillRect(px+10,py+3,1,11);ctx.fillRect(px+6,py+2,4,1);}

function drawBuilding(ctx,b,S){
 const x=b.x*TS,y=b.y*TS,w=b.w*TS,h=b.h*TS;const ink='#3b2a20';const roofH=27;const wallY=y+roofH-3;
 ctx.fillStyle='rgba(0,0,0,0.2)';ctx.fillRect(x+3,y+h-3,w-2,4);
 // wall
 ctx.fillStyle=ink;ctx.fillRect(x+1,wallY,w-2,h-(wallY-y));ctx.fillStyle=b.wall;ctx.fillRect(x+2,wallY,w-4,h-(wallY-y)-1);
 ctx.fillStyle=darken(b.wall,0.85);ctx.fillRect(x+2,y+h-5,w-4,4);
 // roof
 ctx.fillStyle=ink;ctx.fillRect(x,y+3,w,roofH-2);ctx.fillRect(x+2,y+1,w-4,2);
 ctx.fillStyle=b.roof;ctx.fillRect(x+1,y+3,w-2,roofH-4);ctx.fillRect(x+3,y+2,w-6,1);
 ctx.fillStyle=lighten(b.roof,0.35);ctx.fillRect(x+3,y+3,w-6,2);
 ctx.fillStyle=darken(b.roof,0.8);for(let r=y+8;r<y+roofH-2;r+=5){ctx.fillRect(x+1,r,w-2,1);for(let k=x+3+((r/5)%2)*4;k<x+w-2;k+=8)ctx.fillRect(k,r-4,1,4);}
 ctx.fillStyle=darken(b.roof,0.62);ctx.fillRect(x+1,y+roofH-3,w-2,2);
 if(S.snow){ctx.fillStyle='#ffffff';ctx.fillRect(x+1,y+2,w-2,5);for(let k=x+2;k<x+w-2;k+=3)ctx.fillRect(k,y+7,2,1+((k>>1)%2));}
 // chimney
 if(b.kind==='home'||b.vil==='bear'){const cx=x+w-14;ctx.fillStyle=ink;ctx.fillRect(cx-1,y-6,8,9);ctx.fillStyle='#c86a4a';ctx.fillRect(cx,y-5,6,8);ctx.fillStyle='#e88a6a';ctx.fillRect(cx,y-5,6,2);if(S.snow){ctx.fillStyle='#fff';ctx.fillRect(cx,y-6,6,2);}}
 // door
 const dx=b.door[0]*TS,dy=y+h-16;
 ctx.fillStyle=ink;ctx.fillRect(dx+2,dy,12,16);
 if(b.kind==='shop'){ctx.fillStyle='#9ad8ff';ctx.fillRect(dx+3,dy+1,10,14);ctx.fillStyle='#ffffff';ctx.fillRect(dx+4,dy+2,2,5);ctx.fillStyle=ink;ctx.fillRect(dx+7,dy+1,1,14);}
 else{ctx.fillStyle='#9a5e34';ctx.fillRect(dx+3,dy+1,10,14);ctx.fillStyle='#b8784a';ctx.fillRect(dx+4,dy+2,8,5);ctx.fillRect(dx+4,dy+8,8,6);ctx.fillStyle='#ffd040';ctx.fillRect(dx+10,dy+8,2,2);}
 // windows
 const wins=[];const cols=[];for(let i=0;i<b.w;i++){const tx=b.x+i;if(tx!==b.door[0])cols.push(tx);}
 const pickCols=b.w>=5?[cols[0],cols[cols.length-1]]:[cols[cols.length-1]];
 if(b.w===4&&b.door[0]===b.x+1)pickCols.splice(0,1,b.x+3);
 for(const cx of pickCols){const wx=cx*TS+3,wy=wallY+3;ctx.fillStyle=ink;ctx.fillRect(wx-1,wy-1,12,10);ctx.fillStyle='#ffffff';ctx.fillRect(wx,wy,10,8);ctx.fillStyle='#8ac8f0';ctx.fillRect(wx+1,wy+1,8,6);ctx.fillStyle='#d8f0ff';ctx.fillRect(wx+1,wy+1,3,2);ctx.fillStyle='#ffffff';ctx.fillRect(wx+5,wy,1,8);ctx.fillRect(wx,wy+4,10,1);
  ctx.fillStyle=b.kind==='shop'?'#ff8a5c':'#ff8ab0';ctx.fillRect(wx-1,wy+9,12,2);wins.push([wx,wy,10,8]);}
 b.wins=wins;
 if(b.kind==='shop'){ // awning + sign
  for(let k=0;k<20;k++){ctx.fillStyle=(k>>2)%2?'#ffffff':'#ff6a6a';ctx.fillRect(dx-2+k,dy-5,1,4);}ctx.fillStyle=ink;ctx.fillRect(dx-2,dy-1,20,1);
  const sx=x+w/2-14,sy=y+9;ctx.fillStyle=ink;ctx.fillRect(sx-1,sy-1,30,12);ctx.fillStyle='#fff8e6';ctx.fillRect(sx,sy,28,10);
  // cat face
  ctx.fillStyle='#ffa040';ctx.fillRect(sx+3,sy+2,8,6);ctx.fillRect(sx+3,sy+1,2,1);ctx.fillRect(sx+9,sy+1,2,1);ctx.fillStyle=ink;ctx.fillRect(sx+5,sy+4,1,1);ctx.fillRect(sx+8,sy+4,1,1);
  ctx.fillStyle='#ffd040';ctx.fillRect(sx+14,sy+3,4,4);ctx.fillRect(sx+20,sy+3,4,4);ctx.fillStyle='#e8a020';ctx.fillRect(sx+15,sy+4,2,2);ctx.fillRect(sx+21,sy+4,2,2);
 }
 if(b.kind==='vhouse'){const v=VIL[b.vil];ctx.fillStyle=ink;ctx.fillRect(dx+4,dy-6,8,5);ctx.fillStyle=v.col;ctx.fillRect(dx+5,dy-5,6,3);}
}

function buildMapLayers(W,season){
 const S=SEASON_PAL[season];const base=[0,1].map(fr=>{const c=mkCanvas(W.W*TS,W.H*TS);const ctx=c.getContext('2d');
  for(let y=0;y<W.H;y++)for(let x=0;x<W.W;x++)drawTileBase(ctx,W,x,y,S,fr);
  for(let y=0;y<W.H;y++)for(let x=0;x<W.W;x++){const t=W.t[y][x];if(t==='f')drawFence(ctx,W,x,y);if(t==='R')ctx.drawImage(rockSpr(S.snow),x*TS-2,y*TS-2);}
  for(const b of builtBuildings())drawBuilding(ctx,b,S);
  drawHut(ctx,HUT[0]*TS,HUT[1]*TS,S);
  return c;});
 // overlay (tall things)
 const over=mkCanvas(W.W*TS,W.H*TS+16);const o=over.getContext('2d');
 for(let y=0;y<W.H;y++)for(let x=0;x<W.W;x++){const t=W.t[y][x];
  if(t==='#'){const r=mkRng(hashStr('tr'+x+','+y));let kind=r()<0.3?'pine':'round';let cols;
   if(kind==='pine')cols=PINE;else{cols=S.trees[Math.floor(r()*S.trees.length)];if(season==='sp'&&r()<0.5)cols=S.trees[0];}
   o.drawImage(treeSpr(kind,cols,S.snow),x*TS-2,y*TS-8-2+16);}
  if(t==='L')o.drawImage(lampSpr(),x*TS+3-2,y*TS-6-2+16);
 }
 return {base,over,S};
}

// puchikko hut (2x2 tiles)
function drawHut(ctx,x,y,S){const ink='#3b2a20';
 ctx.fillStyle='rgba(0,0,0,0.2)';ctx.fillRect(x+3,y+28,28,4);
 ctx.fillStyle=ink;ctx.fillRect(x+3,y+12,26,19);ctx.fillStyle='#f0c088';ctx.fillRect(x+4,y+13,24,17);ctx.fillStyle='#d8a068';for(let k=y+16;k<y+30;k+=4)ctx.fillRect(x+4,k,24,1);
 // roof
 for(let r=0;r<12;r++){const hw=4+r*1.4|0;ctx.fillStyle=ink;ctx.fillRect(x+16-hw-1,y+2+r,hw*2+2,1);ctx.fillStyle=r<2?'#ffa080':'#e8705a';ctx.fillRect(x+16-hw,y+2+r,hw*2,1);}
 ctx.fillStyle=ink;ctx.fillRect(x+1,y+13,30,2);ctx.fillStyle='#c8503a';ctx.fillRect(x+2,y+13,28,1);
 if(S.snow){ctx.fillStyle='#fff';for(let r=0;r<5;r++){const hw=4+r*1.4|0;ctx.fillRect(x+16-hw,y+2+r,hw*2,1);}}
 // round door
 ctx.fillStyle=ink;ctx.fillRect(x+11,y+19,10,12);ctx.fillRect(x+12,y+18,8,1);ctx.fillStyle='#5a3a22';ctx.fillRect(x+12,y+20,8,11);ctx.fillRect(x+13,y+19,6,1);
 // paw sign
 ctx.fillStyle='#fff8e6';ctx.fillRect(x+5,y+17,5,5);ctx.fillStyle='#ff8aa8';ctx.fillRect(x+6,y+19,3,2);ctx.fillRect(x+6,y+18,1,1);ctx.fillRect(x+8,y+18,1,1);
}
// tilled soil
const _soil={};
function soilSpr(wet){const k='soil'+wet;if(_soil[k])return _soil[k];const c=mkCanvas(16,16);const x=c.getContext('2d');
 x.fillStyle=wet?'#5a3a22':'#8a5a36';x.fillRect(1,1,14,14);x.fillStyle=wet?'#4a2e1a':'#6e4628';for(let k2=3;k2<15;k2+=4)x.fillRect(2,k2,12,1);
 x.fillStyle=wet?'#6e4a2e':'#a8744a';x.fillRect(1,1,14,1);x.fillRect(1,1,1,14);_soil[k]=c;return c;}

// wallpaper & floor patterns
function wallPattern(ctx,x0,y0,w,h,id){const F=(c,x,y,ww,hh)=>{ctx.fillStyle=c;ctx.fillRect(x0+x,y0+y,ww,hh);};
 switch(id){
  case 'mint':F('#d8f4e4',0,0,w,h);for(let x=0;x<w;x+=8)F('#bfe8d2',x,0,4,h);break;
  case 'sky':F('#cfe8ff',0,0,w,h);for(let x=6;x<w;x+=28){F('#ffffff',x,6+(x%3)*4,10,4);F('#ffffff',x+3,4+(x%3)*4,5,2);}break;
  case 'polka':F('#fff0f4',0,0,w,h);for(let y=3;y<h;y+=8)for(let x=(y%16?6:2);x<w;x+=8)F('#ffbcd2',x,y,2,2);break;
  case 'woodw':F('#d8a468',0,0,w,h);for(let x=0;x<w;x+=6)F('#b8844a',x,0,1,h);for(let y=5;y<h;y+=11)for(let x=3;x<w;x+=12)F('#c8945a',x,y,2,1);break;
  case 'star':F('#2a2a5a',0,0,w,h);for(let i=0;i<w;i+=7){const y=(i*13)%Math.max(1,h-2);F(i%3?'#fff6a0':'#ffffff',i,y,1,1);if(i%21===0){F('#fff6a0',i-1,y,3,1);F('#fff6a0',i,y-1,1,3);}}break;
  case 'sakura':F('#ffe8f0',0,0,w,h);for(let y=4;y<h;y+=10)for(let x=(y%20?2:8);x<w;x+=13){F('#ff9ab8',x,y,2,2);F('#ffc0d4',x+2,y+1,1,1);}break;
  case 'brick':F('#d8846a',0,0,w,h);for(let y=0;y<h;y+=5){F('#b8644a',0,y,w,1);for(let x=((y/5)%2?0:5);x<w;x+=10)F('#b8644a',x,y,1,5);}break;
  default:F('#ffe8c8',0,0,w,h);for(let x=0;x<w;x+=8)F('#ffd8a8',x,0,4,h);
 }}
function floorPattern(ctx,x0,y0,w,rows,id){const F=(c,x,y,ww,hh)=>{ctx.fillStyle=c;ctx.fillRect(x0+x,y0+y,ww,hh);};const W=w,T=TS;
 for(let r=0;r<rows;r++){const y=r*T;
  switch(id){
   case 'tile':for(let x=0;x<W;x+=T){F(((x/T+r)%2)?'#f4f0e8':'#d8d0c0',x,y,T,T);}break;
   case 'bluetile':for(let x=0;x<W;x+=T){F(((x/T+r)%2)?'#8ac0f0':'#6aa0d8',x,y,T,T);F('#a8d4ff',x,y,T,1);}break;
   case 'tatami':F('#c8d890',0,y,W,T);for(let x=0;x<W;x+=4)F('#b8c880',x,y,1,T);F('#5a7a3a',0,y+T-1,W,1);for(let x=(r%2)*32;x<W;x+=64)F('#5a7a3a',x,y,1,T);break;
   case 'carpet':F('#f0a8c0',0,y,W,T);for(let x=(r%2)*4;x<W;x+=8)F('#f8c0d4',x,y+6,2,2);break;
   case 'grass':F('#86d462',0,y,W,T);for(let x=(r*5)%9;x<W;x+=9){F('#6cbf52',x,y+5,1,3);F('#6cbf52',x+2,y+6,1,2);}break;
   case 'marble':F('#ecebf4',0,y,W,T);F('#d0d0e0',0,y+T-1,W,1);for(let x=(r*11)%23;x<W;x+=23){F('#c8c8d8',x,y+3,6,1);F('#c8c8d8',x+5,y+4,4,1);}for(let x=0;x<W;x+=32)F('#d0d0e0',x,y,1,T);break;
   default:F((r%2)?'#d8a56a':'#cf9c60',0,y,W,T);F('#b8844a',0,y+15,W,1);for(let x=(r%2)*24;x<W;x+=48)F('#b8844a',x,y,1,T);
  }}}
// house interior background
function drawRoom(ctx,ox,oy,RW,RH,phaseSky,weather,season,wall,floor){
 const ink='#3b2a20';
 wallPattern(ctx,ox,oy,RW*TS,TS*2,wall);
 ctx.fillStyle='#c8945a';ctx.fillRect(ox,oy+TS*2-4,RW*TS,4);ctx.fillStyle='#a8743a';ctx.fillRect(ox,oy+TS*2-1,RW*TS,1);
 const wx=ox+RW*TS/2-12,wy=oy+4;ctx.fillStyle=ink;ctx.fillRect(wx-2,wy-2,28,20);ctx.fillStyle=phaseSky;ctx.fillRect(wx,wy,24,16);
 if(weather==='rain'){ctx.fillStyle='rgba(255,255,255,0.6)';for(let i=0;i<8;i++){const t=(performance.now()/40+i*13)%16;ctx.fillRect(wx+((i*7)%24),wy+t,1,3);}}
 if(weather==='snow'){ctx.fillStyle='#fff';for(let i=0;i<8;i++){const t=(performance.now()/120+i*11)%16;ctx.fillRect(wx+((i*7+Math.floor(t/4))%24),wy+t,2,2);}}
 ctx.fillStyle='#ffffff';ctx.fillRect(wx+11,wy,2,16);ctx.fillRect(wx,wy+7,24,2);
 ctx.fillStyle='#ff9ab8';ctx.fillRect(wx-4,wy-3,6,20);ctx.fillRect(wx+22,wy-3,6,20);
 if(RW>=16){for(const sx of [ox+RW*TS*0.2-8,ox+RW*TS*0.8-8]){ctx.fillStyle=ink;ctx.fillRect(sx-2,wy,20,14);ctx.fillStyle=phaseSky;ctx.fillRect(sx,wy+2,16,10);ctx.fillStyle='#fff';ctx.fillRect(sx+7,wy+2,2,10);}}
 floorPattern(ctx,ox,oy+2*TS,RW*TS,RH-2,floor);
 const dl=RW/2-1;ctx.fillStyle='#5aa870';ctx.fillRect(ox+TS*dl+2,oy+(RH-1)*TS+4,TS*2-4,10);ctx.fillStyle='#7ac890';ctx.fillRect(ox+TS*dl+4,oy+(RH-1)*TS+6,TS*2-8,6);
 ctx.fillStyle=ink;ctx.fillRect(ox-3,oy-3,RW*TS+6,3);ctx.fillRect(ox-3,oy,3,RH*TS+3);ctx.fillRect(ox+RW*TS,oy,3,RH*TS+3);ctx.fillRect(ox,oy+RH*TS,TS*dl,3);ctx.fillRect(ox+TS*(dl+2),oy+RH*TS,TS*(RW-dl-2),3);
}
function swatchIcon(kind,id){const c=mkCanvas(20,20);const x=c.getContext('2d');x.fillStyle='#3b2a20';x.fillRect(1,1,18,18);
 if(kind==='wall')wallPattern(x,2,2,16,16,id);else{x.save();x.beginPath();x.rect(2,2,16,16);x.clip();floorPattern(x,2,2,16,1,id);x.restore();}return c;}
function wearIcon(k){const W=WEAR[k];const g=new Grid(16,16);const pal={x:W.c1,y:W.c2||W.c1};
 let rows=W.rows;if(W.pos==='eyes')rows=W.fill?["xxx.xxx","xxxxxxx","xxx.xxx"]:["xxx.xxx","x.xxx.x","xxx.xxx"];if(W.pos==='neck')rows=[".xx.","xxxx","xyyx",".xx."];
 const w=rows[0].length,h=rows.length;const sc=w*2<=14&&h*2<=14?2:1;const ox=Math.floor((16-w*sc)/2),oy=Math.floor((16-h*sc)/2);
 rows.forEach((r,y)=>{for(let x=0;x<w;x++){const ch=r[x];if(ch==='.')continue;for(let j=0;j<sc;j++)for(let i=0;i<sc;i++)g.set(ox+x*sc+i,oy+y*sc+j,ch);}});return renderGrid(g,pal);}
function clothIcon(id){if(id.startsWith('o_')){const P=buildPlayerMini({outfit:id.slice(2)});return P;}const k=id.slice(2);const H=HATS[k];const g=new Grid(16,16);g.rows(["......","......"],0,0);
 const tmp=new Grid(16,16);hatOverlay(tmp,'down',k);const pal={X:H.c1,Y:H.c2};return renderGrid(tmp,pal);}
function buildPlayerMini(look){const keep=_player;const P=buildPlayer('#ff8ab0','#5a3a2a',Object.assign({style:'short'},look));_player=keep;return P.down[0];}
