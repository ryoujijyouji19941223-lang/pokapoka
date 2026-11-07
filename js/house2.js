'use strict';
// ============================================================
//  おうち v2: realistic room sizes, multi-tile furniture,
//  and enterable shop / bakery interiors
// ============================================================

// ---------- house levels (sized for the furniture you actually own) ----------
HOUSE_LV.length=0;
HOUSE_LV.push(
 {w:8,h:7,name:'ちいさな おうち'},
 {w:10,h:8,coins:3000,need:{wood:15},name:'すこし ひろい おうち'},
 {w:12,h:9,coins:8000,need:{wood:25,stone:15,iron:3},name:'ひろい おうち'},
 {w:14,h:10,coins:15000,need:{wood:30,stone:20,iron:6,clay:5},name:'とっても ひろい おうち'},
 {w:16,h:11,coins:25000,need:{wood:40,stone:30,iron:10,clay:10},name:'おおきな おやしき'},
);

// ---------- footprints (tiles) ----------
const FOOT={bed:[1,2],slide:[2,2],piano:[2,1],kotatsu:[2,2],tv:[2,1],table:[2,2],shelf:[2,1],wshelf:[2,1],fishtank:[2,1],workbench:[2,1],wtable:[2,1]};
for(const k in FOOT){FURN[k].w=FOOT[k][0];FURN[k].h=FOOT[k][1];}

// ---------- interior-only furniture ----------
const INNER_FURN={counter:'カウンター',dshelf:'しょうひんだな',rack:'ハンガーラック',crate:'くだものばこ',oven:'パンがま',bcounter:'パンの カウンター',bshelf:'パンの たな',flour:'こむぎこの ふくろ'};
for(const k in INNER_FURN)FURN[k]=Object.assign({name:INNER_FURN[k],gift:true,inner:true},{counter:{w:2,h:1},dshelf:{w:2,h:1},rack:{w:2,h:1},oven:{w:2,h:1,light:true},bcounter:{w:2,h:1},bshelf:{w:2,h:1}}[k]||{});

// ---------- bigger sprites ----------
const _bigSpr={};
const _furnSpr0=furnSpr;
furnSpr=function(id){if(_bigSpr[id])return _bigSpr[id];const s=bigFurn(id);if(s){_bigSpr[id]=s;return s;}return _furnSpr0(id);};
function bigFurn(id){let g,pal;
 switch(id){
  case 'bed':g=new Grid(16,32);pal={w:'#a8703a',W:'#8a5a2a',s:'#ffffff',p:'#fff4d8',b:'#6aa8f0',B:'#9ac8ff'};
   g.rect(0,0,16,6,'w');g.rect(2,1,12,1,'W');g.rect(1,6,14,24,'s');g.rect(3,7,10,5,'p');g.rect(1,13,14,16,'b');g.rect(1,13,14,2,'B');g.rect(0,29,16,3,'W');break;
  case 'slide':g=new Grid(32,34);pal={b:'#5ab4f0',B:'#a8dcff',l:'#ffd040',L:'#e8a020',k:'#8a8aa0',r:'#ff6a6a'};
   for(let y=4;y<34;y++){g.set(24,y,'l');g.set(29,y,'l');}for(let y=7;y<34;y+=4)g.rect(25,y,4,1,'L');
   g.rect(16,3,14,3,'r');g.rect(16,1,1,2,'r');g.rect(29,1,1,2,'r');g.rect(10,18,2,15,'k');
   for(let t=0;t<=24;t++){const x=18-Math.round(t*16/24),y=6+t;g.rect(x-2,y,7,1,'b');g.set(x-2,y,'B');g.set(x+4,y,'B');}g.rect(0,30,8,2,'b');break;
  case 'piano':g=new Grid(32,22);pal={k:'#3a2a2a',K:'#5a4040',w:'#ffffff',W:'#c8a070'};
   g.rect(0,0,32,16,'k');g.rect(1,1,30,2,'K');g.rect(10,3,12,4,'W');g.rect(1,10,30,4,'w');for(let x=3;x<30;x+=4){g.rect(x,10,2,2,'k');}g.rect(1,16,2,6,'k');g.rect(29,16,2,6,'k');g.rect(14,19,4,1,'W');break;
  case 'kotatsu':g=new Grid(32,26);pal={q:'#e85a4a',Q:'#ffd0a0',t:'#c88a4a',T:'#a86a2a',o:'#ffa030',g:'#5cbf5a'};
   g.rect(0,6,32,20,'q');for(let y=12;y<26;y+=4)for(let x=(y/4)%2?2:4;x<32;x+=4)g.set(x,y,'Q');g.rect(2,2,28,8,'t');g.rect(2,9,28,1,'T');g.circle(12,5,2,'o');g.circle(17,6,2,'o');g.set(12,3,'g');break;
  case 'tv':g=new Grid(32,22);pal={k:'#3a3a4a',s:'#6ac8ff',S:'#bfeaff',w:'#a8703a',W:'#8a5a2a'};
   g.rect(4,0,24,14,'k');g.rect(5,1,22,12,'s');g.rect(6,2,6,3,'S');g.rect(0,14,32,6,'w');g.rect(1,16,14,3,'W');g.rect(17,16,14,3,'W');g.rect(1,20,2,2,'W');g.rect(29,20,2,2,'W');break;
  case 'table':g=new Grid(32,26);pal={t:'#d0904a',T:'#9a6030',h:'#e8b070',c:'#ffffff',C:'#ff9ab8'};
   g.rect(5,15,2,11,'T');g.rect(25,15,2,11,'T');g.rect(15,16,2,10,'T');g.ellipse(16,9,15,8.5,'t');g.ellipse(16,8,13,6.5,'h');g.rect(11,6,3,3,'c');g.rect(19,4,2,4,'C');break;
  case 'shelf':g=new Grid(32,26);pal={w:'#b07a42',W:'#7a4e2a',a:'#ff6a6a',b:'#5a9ae8',c:'#ffd040',d:'#6ac86a',e:'#c8a0ff'};
   g.rect(0,0,32,26,'w');g.rect(2,2,28,22,'W');g.rect(2,9,28,1,'w');g.rect(2,17,28,1,'w');
   {const cols='abcdeacbdeabc';let i=0;for(const y0 of[3,11,19]){let x=3;while(x<28){const bw=2+(i%2);g.rect(x,y0+(i%3===0?1:0),bw,6-(i%3===0?1:0),cols[i%cols.length]);x+=bw+(i%4===3?2:0);i++;}}}break;
  case 'wshelf':g=new Grid(32,24);pal={w:'#c8904a',W:'#9a6030',j:'#ffffff',r:'#ff7a7a',g:'#6ac86a',y:'#e8c060',b:'#5a9ae8'};
   g.rect(0,0,32,24,'w');g.rect(2,2,28,20,'W');g.rect(2,11,28,2,'w');g.rect(4,5,4,6,'j');g.rect(4,4,4,1,'r');g.circle(14,7,3,'g');g.rect(12,9,5,2,'y');g.rect(21,4,2,7,'b');g.rect(24,5,2,6,'r');g.rect(4,15,9,6,'y');g.rect(17,16,10,5,'j');break;
  case 'fishtank':g=new Grid(32,22);pal={g:'#bfeaff',a:'#5ab4ee',A:'#8ad0ff',w:'#a8703a',f:'#ff8a3a',p:'#5cbf5a',s:'#e8d8a8'};
   g.rect(1,0,30,15,'g');g.rect(2,3,28,11,'a');g.rect(2,3,28,1,'A');g.rect(2,12,28,2,'s');g.rect(5,7,1,6,'p');g.rect(7,9,1,4,'p');g.rect(26,8,1,5,'p');g.rect(14,6,3,2,'f');g.set(13,7,'f');g.rect(21,9,3,2,'f');g.set(24,10,'f');
   g.rect(0,15,32,4,'w');g.rect(1,19,2,3,'w');g.rect(29,19,2,3,'w');break;
  case 'workbench':g=new Grid(32,20);pal={w:'#c88a4a',W:'#8a5a2a',k:'#8a8aa0',r:'#ff6a6a'};
   g.rect(0,4,32,4,'w');g.rect(0,8,32,1,'W');g.rect(2,9,2,11,'W');g.rect(28,9,2,11,'W');g.rect(2,15,28,2,'W');g.rect(5,1,1,3,'W');g.rect(4,1,3,1,'k');g.rect(12,2,8,2,'k');g.rect(23,1,6,3,'r');break;
  case 'wtable':g=new Grid(32,18);pal={w:'#c88a4a',W:'#8a5a2a',h:'#e0a868'};g.rect(0,2,32,6,'w');g.rect(1,3,30,2,'h');g.rect(2,8,2,10,'W');g.rect(28,8,2,10,'W');break;
  // ---- interiors ----
  case 'counter':g=new Grid(32,22);pal={w:'#c88a4a',W:'#8a5a2a',t:'#e8c08a',k:'#5a5a6a',g:'#ffd040'};
   g.rect(0,6,32,16,'w');g.rect(0,4,32,3,'t');g.rect(2,10,12,10,'W');g.rect(18,10,12,10,'W');g.rect(20,0,8,5,'k');g.rect(21,1,6,2,'g');break;
  case 'bcounter':g=new Grid(32,22);pal={w:'#e8d0a8',W:'#c8a878',t:'#fff4e0',y:'#c8903a',a:'#e8a050',b:'#f0d070',k:'#5a5a6a',g:'#ff9ab8'};
   g.rect(0,6,32,16,'w');g.rect(0,4,32,3,'t');g.rect(2,10,28,1,'W');g.rect(2,15,28,1,'W');g.rect(3,0,13,5,'y');g.ellipse(6,1.5,2.5,1.5,'a');g.ellipse(12,1.5,2.5,1.5,'b');g.rect(21,0,7,5,'k');g.rect(22,1,5,2,'g');break;
  case 'dshelf':g=new Grid(32,28);pal={w:'#f4ece0',W:'#b8b0a0',a:'#ff8a8a',b:'#8ab8ff',c:'#ffd070',d:'#8ad88a',e:'#d8a0ff'};
   g.rect(0,0,32,28,'W');g.rect(1,1,30,26,'w');g.rect(1,9,30,1,'W');g.rect(1,18,30,1,'W');
   {const cols='abcdecadbe';let i=0;for(const y0 of[3,12,21]){for(let x=3;x<29;x+=6){g.rect(x,y0,4,5,cols[i%cols.length]);g.rect(x+1,y0+1,2,1,'w');i++;}}}break;
  case 'rack':g=new Grid(32,26);pal={k:'#8a8aa0',a:'#ff8aa8',b:'#8ac8ff',c:'#ffd070',d:'#a8e08a'};
   g.rect(1,2,30,1,'k');g.rect(1,2,1,24,'k');g.rect(30,2,1,24,'k');g.rect(0,25,4,1,'k');g.rect(28,25,4,1,'k');
   'abcd'.split('').forEach((c,i)=>{const x=3+i*7;g.rect(x+2,3,2,1,'k');g.rect(x,4,6,11,c);g.rect(x-1,5,1,3,c);g.rect(x+6,5,1,3,c);});break;
  case 'crate':g=new Grid(16,14);pal={w:'#c88a4a',W:'#8a5a2a',a:'#ff5a5a',o:'#ffa030',g:'#5cbf5a'};
   g.circle(4,5,2.4,'a');g.circle(8,4,2.4,'o');g.circle(12,5,2.4,'a');g.set(8,1,'g');g.rect(0,6,16,8,'w');g.rect(0,9,16,1,'W');break;
  case 'oven':g=new Grid(32,30);pal={b:'#c86a4a',B:'#a84a3a',m:'#e8d0b0',f:'#ffd040',F:'#ff6a2a',k:'#3a2a2a'};
   g.ellipse(16,13,15,12,'b');g.rect(1,13,30,14,'b');for(let y=6;y<27;y+=5)for(let x=(y%2?3:6);x<30;x+=7)g.rect(x,y,3,1,'B');g.ellipse(16,19,7,5,'k');g.rect(9,19,15,5,'k');g.ellipse(16,22,5,2.5,'F');g.ellipse(16,23,3,1.5,'f');g.rect(0,26,32,4,'m');break;
  case 'bshelf':g=new Grid(32,28);pal={w:'#c8904a',W:'#9a6030',a:'#e8a050',b:'#f0d070',c:'#d8903a',d:'#8a5a3a',p:'#fff4e0'};
   g.rect(0,0,32,28,'w');g.rect(2,2,28,24,'W');g.rect(2,9,28,1,'w');g.rect(2,18,28,1,'w');
   {const cols='abcdabcda';let i=0;for(const y0 of[5,14,23]){for(let x=5;x<29;x+=6){g.ellipse(x,y0,2.6,2,cols[i%cols.length]);g.set(x-1,y0-1,'p');i++;}}}break;
  case 'flour':g=new Grid(16,16);pal={s:'#f4ecd8',S:'#d8ccb0',r:'#c84a4a'};g.ellipse(8,10,6.5,5.5,'s');g.rect(5,2,6,5,'s');g.rect(5,5,6,1,'S');g.rect(6,9,4,1,'r');g.rect(7,11,2,1,'r');break;
  default:return null;}
 return renderGrid(g,pal);}

// ---------- footprint-aware helpers (replace the 1-tile versions) ----------
furnAt=function(x,y,L=S.furniture){return L.find(f=>!FURN[f.id].floor&&covers(f,x,y))||L.find(f=>FURN[f.id].floor&&covers(f,x,y));};
walkRoom=function(x,y){if(x<0||y<2||x>=ROOM_W||y>=ROOM_H)return false;for(const f of S.furniture){if(!FURN[f.id].walk&&!FURN[f.id].floor&&covers(f,x,y))return false;}return true;};
function fitsAt(id,x,y,list,skip){const F=FURN[id];const w=F.w||1,h=F.h||1;if(x<0||y<2||x+w>ROOM_W||y+h>ROOM_H)return false;
 for(let j=0;j<h;j++)for(let i=0;i<w;i++){const tx=x+i,ty=y+j;
  if(F.floor){if(list.some(f=>f!==skip&&FURN[f.id].floor&&covers(f,tx,ty)))return false;continue;}
  if(ty===ROOM_H-1&&DOOR_X.includes(tx))return false;if(list.some(f=>f!==skip&&!FURN[f.id].floor&&covers(f,tx,ty)))return false;}
 return true;}
placeBench=function(s=S){const L=s.furniture;for(let y=2;y<ROOM_H;y++)for(let x=ROOM_W-2;x>=0;x--)if(fitsAt('workbench',x,y,L)){L.push({id:'workbench',x,y});return;}};
actTarget=function(f,pa){const F=FURN[f.id];const[w,h]=fdim(f);const c=[];
 if(F.walk){for(let j=0;j<h;j++)for(let i=0;i<w;i++){const x=f.x+i,y=f.y+j;if(walkRoom(x,y)&&!petTaken(x,y,pa))c.push([x,y]);}return c.length?rnd(c):null;}
 const pref=[];const ok=(x,y)=>walkRoom(x,y)&&!covers(f,x,y)&&!petTaken(x,y,pa);
 for(let i=0;i<w;i++){if(ok(f.x+i,f.y+h))pref.push([f.x+i,f.y+h]);if(ok(f.x+i,f.y-1))c.push([f.x+i,f.y-1]);}
 for(let j=0;j<h;j++){if(ok(f.x-1,f.y+j))c.push([f.x-1,f.y+j]);if(ok(f.x+w,f.y+j))c.push([f.x+w,f.y+j]);}
 return pref.length?rnd(pref):c.length?rnd(c):null;};
// shared draw item (used by the home and by shop/bakery interiors)
function furnItem(c,f,X,Y){const spr=furnSpr(f.id);const[w,h]=fdim(f);const dx=X+f.x*TS-2+Math.round((w*16-(spr.width-4))/2),dy=Y+(f.y+h)*TS-(spr.height-4)-2;
 return{y:(f.y+h-1)*TS,f:()=>{c.drawImage(spr,dx+Math.round(f._ox||0),dy+Math.round(f._oy||0));if(f._stack)drawStack(c,dx,dy,f._stack);
  if(f.id==='clock'){const d=NOW();const cx=X+f.x*TS+8,cy=dy+2+5.5;hand(c,cx,cy,(d.getHours()%12+d.getMinutes()/60)/12,2);hand(c,cx,cy,d.getMinutes()/60,3);}
  if(f.id==='tv'){c.fillStyle=`hsl(${(G.t*40)%360},70%,75%)`;c.fillRect(dx+9,dy+5,3,2);}
  if(f.id==='oven'&&Math.floor(G.t*4)%2){c.fillStyle='#ffe080';c.fillRect(dx+16,dy+22,2,1);}}};}

// keep everything inside the walls after the size changed (older saves had a much bigger room)
function fitFurniture(){if(!S||!S.furniture)return;const keep=[];let stored=0;
 const all=S.furniture.slice().sort((a,b)=>(FURN[a.id].floor?1:0)-(FURN[b.id].floor?1:0));
 for(const f of all){if(fitsAt(f.id,f.x,f.y,keep)){keep.push(f);continue;}let done=false;
  for(let y=2;y<ROOM_H&&!done;y++)for(let x=0;x<ROOM_W&&!done;x++)if(fitsAt(f.id,x,y,keep)){f.x=x;f.y=y;keep.push(f);done=true;}
  if(!done){addItem('f_'+f.id);stored++;}}
 S.furniture.length=0;S.furniture.push(...keep);if(stored)S.flags.fitNote=(S.flags.fitNote||0)+stored;}
const _applyHouse0=applyHouse;
applyHouse=function(){_applyHouse0();if(G.scene==='inside')return;fitFurniture();
 if(S&&S.pos&&S.pos.scene==='house'&&!walkRoom(S.pos.x,S.pos.y)){S.pos.x=DOOR_X[0];S.pos.y=ROOM_H-1;}};

// ============================================================
//  interiors: にゃんこしょうてん & パンじろうの パンや
// ============================================================
const INTERIORS={
 shop:{name:'にゃんこしょうてん',w:10,h:8,wall:'mint',floor:'tile',bgm:'shop',npc:{id:'shop',x:4,y:2},
  furn:[{id:'counter',x:4,y:3},{id:'dshelf',x:0,y:2},{id:'dshelf',x:8,y:2},{id:'rack',x:0,y:5},{id:'dshelf',x:8,y:5},{id:'crate',x:2,y:2},{id:'crate',x:7,y:2},{id:'plant',x:9,y:7},{id:'mat',x:4,y:6}]},
 bakery:{name:'パンじろうの パンや',w:10,h:8,wall:'brick',floor:'oak',bgm:'house',npc:{id:'bear',x:4,y:2},
  furn:[{id:'bcounter',x:4,y:3},{id:'oven',x:7,y:2},{id:'bshelf',x:0,y:2},{id:'flour',x:2,y:2},{id:'flour',x:9,y:2},{id:'table',x:6,y:5},{id:'chair',x:5,y:6},{id:'chair',x:8,y:6},{id:'bshelf',x:0,y:5},{id:'plant',x:9,y:7}]},
};
const Inside=(()=>{
 const bakeryOpen=()=>{const h=NOW().getHours();return S&&S.story>=STORY_DONE&&h>=7&&h<19;};
 function enter(key,b){const I=INTERIORS[key];Snd.sfx('door');
  fadeTo(()=>{G.inside={key,b,...I,furn:I.furn.map(f=>Object.assign({},f))};G.scene='inside';G.wilds=[];ROOM_W=I.w;ROOM_H=I.h;DOOR_X=[I.w/2-1,I.w/2];
   G.npc={v:{id:I.npc.id},e:{px:I.npc.x*TS,py:I.npc.y*TS,tx:I.npc.x,ty:I.npc.y,flip:false,moving:false,anim:0,path:[]}};
   placePlayer(DOOR_X[0],ROOM_H-1,'up');UI.houseMode(true);document.body.classList.add('inshop');UI.hud();updateBGM();save();
   if(key==='bakery'&&!S.flags.bakeryIn){S.flags.bakeryIn=1;setTimeout(()=>UI.say('いらっしゃい！ パンやへ ようこそ。 やきたての パンの いい においが するだろう？',vo()),400);}});}
 function exit(){Snd.sfx('door');fadeTo(()=>{const b=G.inside.b;G.inside=null;G.npc=null;G.scene='map';applyHouse();UI.houseMode(false);document.body.classList.remove('inshop');placePlayer(b.door[0],b.door[1]+1,'down');syncEncounters();updateBGM();UI.hud();save();});}
 function walk(x,y){if(x<0||y<2||x>=ROOM_W||y>=ROOM_H)return false;const I=G.inside;if(!I)return false;if(I.npc.x===x&&I.npc.y===y)return false;
  return !I.furn.some(f=>!FURN[f.id].walk&&!FURN[f.id].floor&&covers(f,x,y));}
 const vo=()=>{const id=G.inside.npc.id;return id==='shop'?{name:SHOPKEEPER.name,por:UI.img('vp_shop',()=>scaled(vilSpr('shop').n,3),60),pitch:SHOPKEEPER.pitch}:{name:VIL[id].name,por:UI.img('vp_'+id,()=>scaled(vilSpr(id).n,3),60),pitch:VIL[id].pitch};};
 async function npcTalk(){const I=G.inside;if(I.key==='shop')return UI.shop();
  // bakery: パンじろう behind the counter
  const o=vo();const d=S.daily;const canHelp=!d.bakery||(d.bakery===1&&!d.bakery2);
  const opts=['おしゃべり','パンを かう'].concat(canHelp?['おみせを てつだう']:[],['またね']);
  const ch=await UI.say(rnd(['いらっしゃい！ きょうも いい パンが やけたよ。','やあ、 {name}！ なにに する？','パンの においで げんきが でるだろう？']).replace('{name}',S.name),Object.assign({},o,{choices:opts}));
  const pick=opts[ch];
  if(pick==='おしゃべり'){await UI.talkVillager({v:VIL.bear,e:G.npc.e,talking:false});return;}
  if(pick==='パンを かう')return buyBread(o);
  if(pick==='おみせを てつだう'){
   if(!d.bakery){await UI.say(S.bakery?'お、 てつだって くれるのかい？ たすかるよ！ じゃあ カウンターを たのむね。':'てつだって くれるのかい？ ありがとう！\nおきゃくさんの ちゅうもんを きいて、 パンを えらんで、 オーブンで やいて、 つつんで わたすんだ。 わたしが となりで おしえるから だいじょうぶ！',o);
    d.bakery=1;await Bakery.play();await UI.say('たすかったよ！ また あした たのむよ！',o);}
   else{d.bakery2=1;await Bakery.play({repeat:true});await UI.say('ありがとう！ きみが いると おみせが あかるく なるよ。',o);}
   save();}}
 const BREAD_MENU=[['pokapan',150],['cookie',90]];
 async function buyBread(o){const opts=BREAD_MENU.map(([k,p])=>`${ITEMS[k].name}（${p}ポカ）`).concat(['やめる']);const c=await UI.say('どれに する？',Object.assign({},o,{choices:opts}));
  if(c<0||c>=BREAD_MENU.length)return;const[k,p]=BREAD_MENU[c];if(S.coins<p){await UI.say('おや、 ポカが たりないみたいだね。 また おいで。',o);return;}
  addCoins(-p);addItem(k);Snd.sfx('coin');UI.toast(`${ITEMS[k].name}を かった！`,k);save();}
 function tap(tx,ty){const I=G.inside;if(!I)return;
  if(ty>=ROOM_H&&DOOR_X.includes(tx)){walkTo(tx,ROOM_H-1,()=>exit());return;}
  const cnt=I.furn.find(f=>f.id==='counter'||f.id==='bcounter');
  if((tx===I.npc.x&&ty===I.npc.y)||(cnt&&covers(cnt,tx,ty))){const fx=cnt?cnt.x:I.npc.x,fy=cnt?cnt.y+1:I.npc.y+1;const spots=[[fx,fy],[fx+1,fy]];const sp=spots.find(([x,y])=>walk(x,y))||spots[0];
   walkTo(sp[0],sp[1],()=>{G.player.dir='up';npcTalk();});return;}
  const f=furnAt(tx,ty,I.furn);
  if(f){const say={dshelf:'いろいろな しょうひんが ならんでいる。',rack:'かわいい ふくが かかっている。',crate:'つやつやの くだもの。',oven:'パンがまの なかで ひが パチパチ いっている。',bshelf:'やきたての パンが ずらり。 いい におい…',flour:'こむぎこが たっぷり。',table:'ここで パンを たべられるみたい。',chair:'すわりごこちの いい いす。',plant:'みどりが いきいき している。',mat:'ふかふかの マット。'}[f.id];
   goAdjacent(tx,ty,()=>UI.toast(say||FURN[f.id].name),()=>UI.toast(say||FURN[f.id].name));return;}
  if(walk(tx,ty))walkTo(tx,ty);}
 function render(c){const I=G.inside;const ox=Math.round(G.cam.x),oy=Math.round(G.cam.y);const X=-ox,Y=-oy;
  c.fillStyle='#2a2030';c.fillRect(0,0,G.vw,G.vh);drawRoom(c,X,Y,ROOM_W,ROOM_H,skyCol(),G.weather,G.season,I.wall,I.floor);
  for(const f of I.furn.filter(f=>FURN[f.id].floor))c.drawImage(furnSpr(f.id),X+f.x*TS-2,Y+f.y*TS-2);
  const list=I.furn.filter(f=>!FURN[f.id].floor).map(f=>furnItem(c,f,X,Y));
  if(G.npc&&(I.key!=='bakery'||bakeryOpen()))list.push({y:G.npc.e.py-0.5,f:()=>{drawVil(c,G.npc,ox,oy);}});
  if(G.player)list.push({y:G.player.py+1,f:()=>drawPlayer(c,G.player,ox,oy)});
  G.party.forEach((pa,i)=>!pa.hidden&&list.push({y:pa.e.py-0.1,f:()=>drawMonAt(c,pa.mon.sp,pa.e,ox,oy,1.7+i,{look:monLook(pa.mon)})}));
  list.sort((a,b)=>a.y-b.y);for(const it of list)it.f();
  drawParts(c,ox,oy);drawLighting(c,ox,oy,true);
  for(const em of G.emotes){const e=em.ent;c.globalAlpha=Math.min(1,em.t*3);c.drawImage(em.spr,Math.round(e.px-ox+8-em.spr.width/2),Math.round(e.py-oy-14-(1-em.t/em.max)*3));c.globalAlpha=1;}}
 function door(b){if(b.kind==='shop'){enter('shop',b);return true;}
  if(b.vil==='bear'&&S.story>=STORY_DONE){if(bakeryOpen()){enter('bakery',b);return true;}UI.say('パンやは もう しまっているみたい。 あさ 7じから あいているよ。');return true;}
  return false;}
 return{enter,exit,walk,tap,render,door,bakeryOpen,npcTalk};
})();
// パンじろう stays in his bakery while it is open
const _vilActive0=vilActive;
vilActive=function(v,h){if(v.id==='bear'&&Inside.bakeryOpen())return false;return _vilActive0(v,h);};
