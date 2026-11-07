'use strict';
// ============================================================
//  おしゃれ logic: looks, shiny, wallpaper, series, house size
// ============================================================
function monLook(m){return{scarf:m.scarfCol||S.shirt,wear:m.wear||null,shiny:!!m.shiny};}
function lookKey(l){return(l.scarf||'')+(l.wear||'')+(l.shiny?'s':'');}
function rollShiny(){const luck=(S&&S.daily&&S.daily.luck)||0;return Math.random()<SHINY_RATE*(1+luck*0.5);}

// ---------------- house size ----------------
function applyHouse(){const L=HOUSE_LV[Math.min(HOUSE_LV.length-1,(S&&S.houseLv)||0)];ROOM_W=L.w;ROOM_H=L.h;const dl=ROOM_W/2-1;DOOR_X=[dl,dl+1];}
function checkHouseBuild(){const b=S.houseBuild;if(!b||b.day===dayKey())return false;S.houseLv=b.lv;S.houseBuild=null;applyHouse();
 pushMail({from:'vil',sender:'そんちょう ハルさん',body:`{name}さんへ\n\nおうちの ぞうちくが おわったわよ。\n『${HOUSE_LV[b.lv].name}』に なったの。\nぷちっこたちも のびのび あそべるわね。\n\nそんちょう ハル`,gift:b.lv===1?'f_mirror':null,n:1});
 S.flags.houseDone=b.lv;addMemory(`おうちが『${HOUSE_LV[b.lv].name}』に なった`,'house');return true;}

// ---------------- wallpaper / floor ----------------
function applySurface(key){const it=ITEMS[key];if(!it)return;const kind=it.cat,id=key.slice(3);const cur=kind==='wall'?(S.wall||'peach'):(S.floor||'oak');
 if(cur===id)return;takeItem(key);addItem((kind==='wall'?'wp_':'fl_')+cur);if(kind==='wall')S.wall=id;else S.floor=id;Snd.sfx('pop');
 UI.toast(`${it.name}に はりかえた！`,key);checkSeries(true);save();}

// ---------------- furniture series ----------------
function seriesState(){const placed=new Set(S.furniture.map(f=>f.id));return SERIES.map(s=>{const have=s.items.filter(i=>placed.has(i)).length;return{s,have,done:have>=s.need};});}
function seriesOn(id){return S&&S.furniture&&seriesState().some(x=>x.s.id===id&&x.done);}
function checkSeries(announce){if(!S.seriesSeen)S.seriesSeen={};for(const x of seriesState()){if(x.done&&!S.seriesSeen[x.s.id]){S.seriesSeen[x.s.id]=1;addMemory(`${x.s.name}が そろった`,'f_'+x.s.items[0]);if(announce){setTimeout(()=>{UI.toast(`${x.s.name}が そろった！`,'f_'+x.s.items[0]);Snd.jingle('fanfare');},300);}}}}
function seriesOnEnter(){const d=S.daily;if(!d||d.seriesBonus)return;d.seriesBonus=1;const msgs=[];
 if(seriesOn('wood')){partyMons().forEach(m=>restoreEn(m,3));if(partyMons().length)msgs.push('もくせいの へやで ぷちっこが げんきに なった');}
 if(seriesOn('toy')){(G.guests||[]).forEach(p=>gainAff(p.mon,1,true));if((G.guests||[]).length)msgs.push('おもちゃの へやで みんな ごきげん');}
 if(msgs.length)setTimeout(()=>UI.toast(msgs.join('・'),'house'),1500);}

// ---------------- photo capture ----------------
function arrangeForPhoto(){const p=G.player;p.dir='down';p.path=[];const pets=G.scene==='house'?housePets():G.party;const spots=[[-1,0],[1,0],[-1,1],[1,1],[0,1],[-2,0],[2,0]];const used=new Set([p.tx+','+p.ty]);let i=0;
 for(const pa of pets.slice(0,6)){if(pa.ai&&pa.ai.st==='act'&&pa.ai.type==='sleep')continue;
  for(;i<spots.length;i++){const x=p.tx+spots[i][0],y=p.ty+spots[i][1];if(walkable(x,y)&&!used.has(x+','+y)){used.add(x+','+y);if(pa.ai){if(pa.ai.f){pa.ai.f._busy=null;pa.ai.f._ox=0;pa.ai.f._oy=0;pa.ai.f._stack=0;}pa.ai.st='idle';pa.ai.t=6;pa.ai.f=null;pa.ai.type=null;pa.ai.tgt=null;pa.vis=null;}
   const e=pa.e;e.tx=e.nx=x;e.ty=e.ny=y;e.path=[];e.moving=false;e.prog=0;e.px=x*TS;e.py=y*TS;e.flip=spots[i][0]>0;i++;break;}}}
 G.trail=G.party.map(pa=>[pa.e.tx,pa.e.ty]);}
function capturePhoto(){
 const all=(G.scene==='house'?housePets():G.party);all.forEach(pa=>{if(!(pa.ai&&pa.ai.st==='act'))pa.e.jump=0.225;});G._noUI=true;render();G._noUI=false;
 const p=G.player;const W=Math.min(G.vw,160),H=Math.min(G.vh,128);const ents=[p].concat(all.map(pa=>pa.e));
 const sx=ents.reduce((a,e)=>a+e.px,0)/ents.length-G.cam.x+8,sy=ents.reduce((a,e)=>a+e.py,0)/ents.length-G.cam.y+4;
 let lx=0,ly=0,hx=G.vw,hy=G.vh;if(G.scene==='house'){lx=Math.max(0,-G.cam.x-3);ly=Math.max(0,-G.cam.y-3);hx=Math.min(G.vw,ROOM_W*TS-G.cam.x+3);hy=Math.min(G.vh,ROOM_H*TS-G.cam.y+3);}
 const cl=(v,a,b)=>b<a?(a+b)/2:Math.max(a,Math.min(b,v));
 const x0=Math.round(Math.max(0,Math.min(G.vw-W,cl(sx-W/2,lx,hx-W)))),y0=Math.round(Math.max(0,Math.min(G.vh-H,cl(sy-H/2,ly,hy-H))));
 const c=mkCanvas(W,H);c.getContext('2d').drawImage(G.cv,x0,y0,W,H,0,0,W,H);return c;}
function stampSpr(k){switch(k){case 'heart':return HEART;case 'note':return NOTE;case 'spark':return SPARK;case 'zzz':return ZZZ;default:return itemIcon(k);}}
function drawFrame(c,W,H,frame){const F=(col,x,y,w,h)=>{c.fillStyle=col;c.fillRect(x,y,w,h);};const border=(col,t)=>{F(col,0,0,W,t);F(col,0,H-t,W,t);F(col,0,0,t,H);F(col,W-t,0,t,H);};
 switch(frame){
  case 'polaroid':border('#fffdf6',6);F('#fffdf6',0,H-16,W,16);c.fillStyle='#7a6250';c.font='8px DotGothic16, monospace';c.textAlign='right';const d=NOW();c.fillText(`${d.getMonth()+1}/${d.getDate()} ぽかぽか村`,W-8,H-5);break;
  case 'heart':border('#ffb0c8',5);for(let x=4;x<W-6;x+=14){c.drawImage(HEART,x,-2);c.drawImage(HEART,x+6,H-9);}break;
  case 'flower':border('#7ac890',5);for(let x=3;x<W;x+=11){F(['#ff9ac0','#fff27a','#ffffff'][x%3],x,1,3,3);F('#ffd040',x+1,2,1,1);F(['#ff9ac0','#fff27a','#ffffff'][(x+1)%3],x+3,H-4,3,3);}break;
  case 'star':border('#2a2a5a',5);for(let x=2;x<W;x+=9){c.drawImage(SPARK,x,-1);c.drawImage(SPARK,x+4,H-6);}for(let y=8;y<H-8;y+=12){c.drawImage(SPARK,-1,y);c.drawImage(SPARK,W-6,y+6);}break;
  case 'season':{const se=seasonOf();const col={sp:'#ffc0d8',su:'#8ad0ff',au:'#f0a050',wi:'#e8f0ff'}[se];border(col,5);const dot={sp:'#ff8ab0',su:'#ffd040',au:'#c8502a',wi:'#ffffff'}[se];for(let i=0;i<W+H;i+=7){const x=(i*37)%W,y=(i*53)%H;if(x<6||x>W-7||y<6||y>H-7)F(dot,x,y,2,2);}break;}
 }}
