'use strict';
// ============================================================
//  rendering + boot
// ============================================================
const LIGHT_KEYS=[[0,16,20,56,0.52],[270,16,20,56,0.52],[330,90,60,130,0.4],[390,255,180,140,0.12],[450,255,255,255,0],[960,255,255,255,0],[1050,255,140,60,0.16],[1110,150,70,110,0.32],[1170,40,30,90,0.5],[1260,16,20,56,0.52],[1440,16,20,56,0.52]];
function lightNow(){const d=NOW();const m=d.getHours()*60+d.getMinutes()+d.getSeconds()/60;for(let i=0;i<LIGHT_KEYS.length-1;i++){const a=LIGHT_KEYS[i],b=LIGHT_KEYS[i+1];if(m>=a[0]&&m<=b[0]){const t=(m-a[0])/(b[0]-a[0]||1);return[0,1,2,3].map(k=>a[k+1]+(b[k+1]-a[k+1])*t);}}return[16,20,56,0.6];}
function skyCol(){const ph=phaseOf();const w=G.weather;if(w==='rain'||w==='snow')return ph==='N'?'#2a3050':'#9aa8b8';return{M:'#ffc8b0',D:'#8fd0ff',E:'#ff9a60',N:'#1a2050'}[ph];}

function shadow(c,x,y,w=10){c.fillStyle='rgba(20,20,40,0.22)';c.fillRect(x+8-w/2+1,y+13,w-2,1);c.fillRect(x+8-w/2,y+14,w,2);c.fillRect(x+8-w/2+1,y+16,w-2,1);}
function drawPlayer(c,p,ox,oy){const P=_player;if(!P)return;const fr=P[p.dir];let fi=0;if(p.moving){fi=[0,1,0,2][Math.floor(p.anim*2.2)%4];}
 const x=Math.round(p.px-ox),y=Math.round(p.py-oy);shadow(c,x,y);c.drawImage(fr[fi],x-2,y-3-(fi?1:0));}
function drawMonAt(c,id,e,ox,oy,seed=0,o={}){
 const s=monSpr(id,o.look||o.scarf);const sp=SP[id];const blink=o.sleep||((G.t+seed)%3.4)<0.14;const img=blink?s.b:s.n;
 let bob=Math.floor(G.t*(o.sleep?0.8:2.4)+seed)%2;if(e.moving)bob=Math.floor(e.anim*4)%2?2:0;if(o.still)bob=0;
 const x=Math.round(e.px-ox),y0=Math.round(e.py-oy);let y=y0-4-bob-1+Math.round(o.dy||0);if(e.jump>0)y-=Math.round(Math.sin(e.jump/0.45*Math.PI)*6); if(sp.tpl!=='fish'&&!o.noShadow)shadow(c,x,y0,sp.tpl==='ghost'?8:10);
 if(sp.tpl==='ghost'){y-=3+Math.round(Math.sin(G.t*2+seed)*2);c.globalAlpha=0.86;}
 if(sp.tpl==='fish'){y=y0-4+Math.round(Math.sin(G.t*3+seed));}
 const flip=sp.tpl==='fish'?!e.flip&&e.dir==='right':e.flip;
 if(flip){c.save();c.translate(x-4+img.width,y);c.scale(-1,1);c.drawImage(img,0,0);c.restore();}else c.drawImage(img,x-4,y);
 c.globalAlpha=1;
 if(sp.tpl==='fish'){c.fillStyle='rgba(255,255,255,0.7)';const r=(G.t*2+seed)%2;c.fillRect(x+2-r,y0+13,12+r*2,1);}
 if(o.look&&o.look.shiny&&((G.t*1.3+seed)%2.2)<0.35)c.drawImage(SPARK,x+12-Math.round(((G.t*1.3+seed)%2.2)*10),y-2);
 if(o.grass){const T1=TUFT1(G.layers.S);c.drawImage(T1,x-3,y0+8);c.drawImage(T1,x+6,y0+9);}
}
function drawVil(c,v,ox,oy){const e=v.e;const s=vilSpr(v.v.id);const x=Math.round(e.px-ox),y=Math.round(e.py-oy);const fi=e.moving?Math.floor(e.anim*2.2)%4:0;const bob=fi%2;const im=s.f[fi];shadow(c,x,y);
 if(e.flip){c.save();c.translate(x-2+im.width,y-3-bob);c.scale(-1,1);c.drawImage(im,0,0);c.restore();}else c.drawImage(im,x-2,y-3-bob);
 if(G.weather==='rain'&&G.scene==='map')c.drawImage(UMB,x+1,y-9-bob);}

function renderMap(c){
 const ox=Math.round(G.cam.x),oy=Math.round(G.cam.y);const L=G.layers;const S2=L.S;
 c.drawImage(L.base[G.waterFrame],-ox,-oy);
 const d=S&&S.daily;
 // plots
 if(S){const x0=Math.floor(ox/TS)-1,x1=x0+Math.ceil(G.vw/TS)+2,y0=Math.floor(oy/TS)-1,y1=y0+Math.ceil(G.vh/TS)+2;
  for(const k in S.farm){const[x,y]=k.split(',').map(Number);if(x<x0||x>x1||y<y0||y>y1)continue;const f=S.farm[k];const px=x*TS-ox,py=y*TS-oy;c.drawImage(soilSpr(!!f.water),px,py);
   if(f.crop){const st=cropStage(f);c.drawImage(cropSpr(f.crop,st),px-2,py-4);if(st===3&&Math.floor(G.t*2+x+y)%3===0)c.drawImage(SPARK,px+10,py-2);}}
  if(G.tool==='till'&&G.player){const p=G.player;for(const[dx,dy]of DIRS){const tx=p.tx+dx,ty=p.ty+dy;if(canTill(tx,ty,true)){c.strokeStyle='rgba(255,240,150,'+(0.5+Math.sin(G.t*5)*0.3)+')';c.strokeRect(tx*TS-ox+1.5,ty*TS-oy+1.5,TS-3,TS-3);}}}}
 if(d){const seek=hasJob('seek');d.digs.forEach(([x,y],i)=>{if(i>=4&&!seek)return;const px=x*TS-ox,py=y*TS-oy;if(d.dug.includes(i)){c.fillStyle='#7a5434';c.fillRect(px+4,py+7,8,4);c.fillStyle='#5a3a22';c.fillRect(px+5,py+8,6,2);}
   else{c.drawImage(DIG,px+3,py+4);if(Math.floor(G.t*1.5+i)%4===0)c.drawImage(SPARK,px+9,py+1);}});
  d.shells.forEach((s,i)=>{if(d.picked.includes(i))return;c.drawImage(itemIcon(s.k),x0(s.x)-ox+2,s.y*TS-oy+2,12,12);});}
 Mini.drawBugs(c,ox,oy);
 // fountain
 {const fx=FOUNTAIN[0]*TS-ox,fy=FOUNTAIN[1]*TS-oy;c.fillStyle='#3b2a20';c.fillRect(fx+1,fy+5,30,24);c.fillStyle='#b8b8c8';c.fillRect(fx+2,fy+6,28,22);c.fillStyle='#d8d8e4';c.fillRect(fx+2,fy+6,28,3);
  c.fillStyle='#5ab4ee';c.fillRect(fx+5,fy+10,22,14);c.fillStyle='#8ad0ff';c.fillRect(fx+6+((G.waterFrame)*3),fy+12,6,1);c.fillRect(fx+16-G.waterFrame*2,fy+19,7,1);
  c.fillStyle='#9a9aa8';c.fillRect(fx+13,fy+6,6,10);c.fillStyle='#ffffff';const k=Math.floor(G.t*6)%3;c.fillRect(fx+15,fy+1+k,2,5);c.fillRect(fx+12-k,fy+4+k,1,2);c.fillRect(fx+19+k,fy+4+k,1,2);}
 // mailbox
 {const mx=MAILBOX[0]*TS-ox,my=MAILBOX[1]*TS-oy;c.fillStyle='rgba(0,0,0,0.2)';c.fillRect(mx+3,my+14,10,2);c.fillStyle='#7a4e2a';c.fillRect(mx+7,my+6,2,9);c.fillStyle='#3b2a20';c.fillRect(mx+2,my,12,8);c.fillStyle='#ff6a6a';c.fillRect(mx+3,my+1,10,6);c.fillStyle='#ff9a9a';c.fillRect(mx+3,my+1,10,2);
  if(S&&unreadMail()){c.fillStyle='#3b2a20';c.fillRect(mx+13,my-5,1,7);c.fillStyle='#ffd040';c.fillRect(mx+14,my-5,3,3);if(Math.floor(G.t*2)%2)c.drawImage(EXCL,mx+5,my-12);}}
 // board
 {const bx=BOARD[0]*TS-ox,by=BOARD[1]*TS-oy;c.fillStyle='rgba(0,0,0,0.2)';c.fillRect(bx+1,by+14,14,2);c.fillStyle='#3b2a20';c.fillRect(bx,by,16,12);c.fillStyle='#b8844a';c.fillRect(bx+1,by+1,14,10);c.fillStyle='#7a4e2a';c.fillRect(bx+3,by+12,2,4);c.fillRect(bx+11,by+12,2,4);
  c.fillStyle='#fff8e6';c.fillRect(bx+2,by+2,4,5);c.fillRect(bx+7,by+3,3,4);c.fillRect(bx+11,by+2,3,6);
  if(d&&d.quests.some(q=>q.p>=q.n&&!q.claimed)&&Math.floor(G.t*2)%2)c.drawImage(EXCL,bx+6,by-9);}
 // entities
 const list=[];
 if(G.player)list.push({y:G.player.py,f:()=>drawPlayer(c,G.player,ox,oy)});
 G.party.forEach((pa,i)=>!pa.hidden&&list.push({y:pa.e.py-0.1,f:()=>drawMonAt(c,pa.mon.sp,pa.e,ox,oy,1.7+i,{look:monLook(pa.mon)})}));
 G.wilds.forEach((w,i)=>{const g=G.world.t[w.e.ty][w.e.tx]==='"';list.push({y:w.e.py,f:()=>drawMonAt(c,w.sp,w.e,ox,oy,i*1.3,{grass:g&&!w.e.moving,look:{shiny:!!(w.enc&&w.enc.shiny)}})});});
 G.vils.forEach(v=>list.push({y:v.e.py,f:()=>{drawVil(c,v,ox,oy);if(S&&((v.v.chief&&(S.storyReady||Post.pending('chief')))||(!v.v.chief&&Post.pending(v.v.id)))&&Math.floor(G.t*2)%2)c.drawImage(EXCL,Math.round(v.e.px-ox+7),Math.round(v.e.py-oy-12));}}));
 Village.drawList(list,c,ox,oy);
 list.sort((a,b)=>a.y-b.y);for(const it of list)it.f();
 // overlay trees/lamps
 c.drawImage(L.over,-ox,-oy-16);
 // fruit trees
 FRUIT_TREES.forEach(([x,y,f],i)=>{const sh=G.shake['f'+i]?Math.round(Math.sin(G.t*50)*1.5):0;const has=d&&!d.shaken['f'+i];c.drawImage(fruitTreeSpr(S2,G.season,has,ITEMS[f].col),x*TS-ox-2+sh,y*TS-oy-10);});
 // shaking forest tree hint
 for(const k in G.shake){if(k[0]==='t'){const[x,y]=k.slice(1).split(',').map(Number);for(let i=0;i<3;i++){c.fillStyle=S2.trees[0][1];c.fillRect(x*TS-ox+2+((G.t*40+i*5)%12),y*TS-oy-6+i*4,2,2);}}}
 // particles (world)
 drawParts(c,ox,oy);
 Story.drawDeco(c,ox,oy);Mist.draw(c,ox,oy);Post.draw(c,ox,oy);
 // weather
 drawWeather(c);
 // lighting
 drawLighting(c,ox,oy);
 // emotes
 for(const em of G.emotes){const e=em.ent;const a=Math.min(1,em.t*3);c.globalAlpha=a;c.drawImage(em.spr,Math.round(e.px-ox+8-em.spr.width/2),Math.round(e.py-oy-14-(1-em.t/em.max)*3));c.globalAlpha=1;}
 if(G.tapMark){const m=G.tapMark;c.strokeStyle='rgba(255,255,255,'+(m.t*1.6)+')';c.lineWidth=1;const r=3+(0.5-m.t)*10;c.beginPath();c.ellipse(m.x*TS-ox+8,m.y*TS-oy+12,r,r*0.5,0,0,Math.PI*2);c.stroke();}
 // star
 if(G.star){const s=G.star;const k=Math.min(1,s.t/s.dur);const x=s.x-k*90,y=s.y+k*40;const a=s.t>s.dur?Math.max(0,1-(s.t-s.dur)/0.3):1;
  const g=c.createLinearGradient(x,y,x+30,y-14);g.addColorStop(0,`rgba(255,255,220,${a})`);g.addColorStop(1,'rgba(255,255,220,0)');c.strokeStyle=g;c.lineWidth=2;c.beginPath();c.moveTo(x,y);c.lineTo(x+30,y-14);c.stroke();c.fillStyle=`rgba(255,255,255,${a})`;c.fillRect(x-1,y-1,3,3);}
}
function x0(x){return x*TS;}
function drawParts(c,ox,oy){for(const p of G.parts){const a=Math.min(1,p.life/p.max*2);c.globalAlpha=a;if(p.spr)c.drawImage(p.spr,Math.round(p.x-ox-p.spr.width/2),Math.round(p.y-oy-p.spr.height/2));else{c.fillStyle=p.col;c.fillRect(Math.round(p.x-ox),Math.round(p.y-oy),p.sz,p.sz);}}c.globalAlpha=1;}
function drawWeather(c){const night=phaseOf()==='N'||phaseOf()==='E';for(const p of G.wparts){switch(p.k){
 case 'rain':c.fillStyle='rgba(200,225,255,0.55)';c.fillRect(Math.round(p.x),Math.round(p.y),1,4);c.fillRect(Math.round(p.x)-1,Math.round(p.y)+4,1,1);break;
 case 'snow':c.fillStyle='#ffffff';c.fillRect(Math.round(p.x),Math.round(p.y),p.s>0.9?2:1,p.s>0.9?2:1);break;
 case 'petal':c.fillStyle='#ffc0d8';c.fillRect(Math.round(p.x),Math.round(p.y),2,1);c.fillRect(Math.round(p.x)+1,Math.round(p.y)+1,1,1);break;
 case 'leaf':c.fillStyle=p.c;c.fillRect(Math.round(p.x),Math.round(p.y),2,2);break;
 case 'fly':if(night&&G.scene==='map'){const a=0.5+Math.sin(G.t*3+p.ph)*0.5;c.fillStyle=`rgba(230,255,120,${a})`;c.fillRect(Math.round(p.x),Math.round(p.y),1,1);}break;}}}
function drawLighting(c,ox,oy,inside){
 let[r,g,b,a]=lightNow();const w=G.weather;
 if(w==='rain'||w==='snow'){if(a<0.22){r=110;g=120;b=140;}a=Math.max(a,w==='rain'?0.22:0.12);}else if(w==='cloudy'&&a<0.08){r=120;g=130;b=150;a=0.08;}
 if(inside)a*=0.55;if(a<0.01)return;
 const L=G.lctx;L.globalCompositeOperation='source-over';L.clearRect(0,0,G.vw,G.vh);L.fillStyle=`rgba(${r|0},${g|0},${b|0},${a})`;L.fillRect(0,0,G.vw,G.vh);
 const dark=a>0.24;const lights=[];
 if(dark){
  if(!inside){LAMPS.forEach(([x,y])=>lights.push([x*TS+8,y*TS-2,46,1]));Village.lights(lights);Mist.lights(lights);builtBuildings().forEach(bb=>(bb.wins||[]).forEach(wn=>lights.push([wn[0]+5,wn[1]+8,22,0.8])));
   G.wparts.forEach(p=>{if(p.k==='fly')lights.push([p.x+ox,p.y+oy,7,0.6]);});
   G.wilds.forEach(wl=>{const t=SP[wl.sp];const glow=t.type==='hono'||t.id==='hoshinoko'||t.id==='hotarun';lights.push([wl.e.px+8,wl.e.py+6,glow?22:16,glow?0.8:0.6]);});
   G.vils.forEach(v=>lights.push([v.e.px+8,v.e.py+6,14,0.5]));}
  else{(G.scene==='inside'&&G.inside?G.inside.furn:S.furniture).forEach(f=>{if(FURN[f.id].light&&!f.off){const[w]=fdim(f);lights.push([f.x*TS+w*8,f.y*TS,56,1]);}});lights.push([ROOM_W*TS/2,TS,34,0.5]);}
  if(G.player)lights.push([G.player.px+8,G.player.py+8,30,0.55]);
  G.party.forEach(pa=>{const t=SP[pa.mon.sp].type;const j=jobOf(pa.mon.sp);if(j==='fire')lights.push([pa.e.px+8,pa.e.py+6,40,0.9]);else if(t==='denki'||t==='yozora')lights.push([pa.e.px+8,pa.e.py+6,24,0.7]);else lights.push([pa.e.px+8,pa.e.py+6,12,0.4]);});
  L.globalCompositeOperation='destination-out';
  for(const[x,y,rad,s]of lights){const gx=x-ox,gy=y-oy;if(gx<-rad||gy<-rad||gx>G.vw+rad||gy>G.vh+rad)continue;const gr=L.createRadialGradient(gx,gy,0,gx,gy,rad);gr.addColorStop(0,`rgba(0,0,0,${s})`);gr.addColorStop(0.5,`rgba(0,0,0,${s*0.6})`);gr.addColorStop(1,'rgba(0,0,0,0)');L.fillStyle=gr;L.fillRect(gx-rad,gy-rad,rad*2,rad*2);}
  L.globalCompositeOperation='source-over';
 }
 c.drawImage(G.light,0,0);
 if(dark){c.globalCompositeOperation='lighter';
  if(!inside){LAMPS.forEach(([x,y])=>{const gx=x*TS+8-ox,gy=y*TS-3-oy;const gr=c.createRadialGradient(gx,gy,0,gx,gy,20);gr.addColorStop(0,'rgba(255,200,110,0.35)');gr.addColorStop(1,'rgba(255,200,110,0)');c.fillStyle=gr;c.fillRect(gx-20,gy-20,40,40);});}
  c.globalCompositeOperation='source-over';
  if(!inside){c.fillStyle=`rgba(255,220,130,${Math.min(0.9,a*1.5)})`;builtBuildings().forEach(bb=>(bb.wins||[]).forEach(([wx,wy])=>{c.fillRect(wx+1-ox,wy+1-oy,4,3);c.fillRect(wx+6-ox,wy+1-oy,3,3);c.fillRect(wx+1-ox,wy+5-oy,4,2);c.fillRect(wx+6-ox,wy+5-oy,3,2);}));}
 }
}

function renderHouse(c){
 const ox=Math.round(G.cam.x),oy=Math.round(G.cam.y);const X=-ox,Y=-oy;
 c.fillStyle='#2a2030';c.fillRect(0,0,G.vw,G.vh);
 drawRoom(c,X,Y,ROOM_W,ROOM_H,skyCol(),G.weather,G.season,S.wall,S.floor);
 const list=[];
 for(const f of S.furniture.filter(f=>FURN[f.id].floor))c.drawImage(furnSpr(f.id),X+f.x*TS-2,Y+f.y*TS-2);
 for(const f of S.furniture){if(FURN[f.id].floor)continue;list.push(furnItem(c,f,X,Y));}
 if(G.player)list.push({y:G.player.py+1,f:()=>drawPlayer(c,G.player,ox,oy)});
 housePets().forEach((pa,i)=>list.push({y:petSortY(pa),f:()=>drawHousePet(c,pa,ox,oy,i)}));
 Post.houseGuest(list,c,ox,oy);
 list.sort((a,b)=>a.y-b.y);for(const it of list)it.f();
 drawParts(c,ox,oy);
 drawLighting(c,ox,oy,true);
 for(const em of G.emotes){const e=em.ent;c.globalAlpha=Math.min(1,em.t*3);c.drawImage(em.spr,Math.round(e.px-ox+8-em.spr.width/2),Math.round(e.py-oy-14-(1-em.t/em.max)*3));c.globalAlpha=1;}
 if(UI.decor){c.strokeStyle='rgba(255,255,255,0.35)';c.lineWidth=1;for(let y=2;y<ROOM_H;y++)for(let x=0;x<ROOM_W;x++){c.strokeRect(X+x*TS+0.5,Y+y*TS+0.5,TS-1,TS-1);}
  if(UI.decorSel){c.fillStyle='rgba(255,240,120,0.25)';for(let y=2;y<ROOM_H;y++)for(let x=0;x<ROOM_W;x++)if(UI.canPlace(x,y))c.fillRect(X+x*TS+1,Y+y*TS+1,TS-2,TS-2);}}
}
function hand(c,cx,cy,frac,len){const a=frac*Math.PI*2-Math.PI/2;c.fillStyle='#3b2a20';for(let i=0;i<=len;i++){c.fillRect(Math.round(cx+Math.cos(a)*i-0.5),Math.round(cy+Math.sin(a)*i-0.5),1,1);}}

function render(){
 const c=G.ctx;c.fillStyle='#1d1b2a';c.fillRect(0,0,G.vw,G.vh);
 if(!G.layers)return;
 if(!G.ready){G.cam.x=(Math.sin(G.t*0.05)*0.5+0.5)*(G.world.W*TS-G.vw);G.cam.y=12*TS-G.vh*0.3+Math.sin(G.t*0.07)*40;renderMap(c);return;}
 if(G.scene==='map')renderMap(c);else if(G.scene==='inside')Inside.render(c);else renderHouse(c);
}

let _last=0,_wf=0;
function loop(ts){requestAnimationFrame(loop);const dt=Math.min(0.05,((ts-_last)/1000)||0);_last=ts;G.t+=G.ready?0:dt;
 // one bad frame must never freeze the whole game (keep looping, log once)
 try{if(G.ready)update(dt);else updateWeatherParts(dt);}catch(e){if(!loop._eu){loop._eu=1;console.error(e);}}
 _wf+=dt;if(_wf>0.6){_wf=0;G.waterFrame^=1;}try{render();}catch(e){if(!loop._er){loop._er=1;console.error(e);}}}

function startWorld(){
 resize();G.season=seasonOf();if(!G.layers||G.layers.season!==G.season){G.layers=buildMapLayers(G.world,G.season);G.layers.season=G.season;}
 applyHouse();buildPlayer(S.shirt,S.hair,S.look);G.weather=weatherAt();G.phase=phaseOf();initWeatherParts();
 KJ.setMode(S.opt.kanji||0);
 const away=Date.now()-(S.lastSeen||Date.now());const isNew=ensureDaily();trackPhase();Story.syncWorld();growPlots(Date.now()-(S.lastTick||Date.now()));S.lastTick=Date.now();
 G.scene=S.pos.scene==='house'?'house':'map';
 if(G.scene==='map'&&!walkMap(S.pos.x,S.pos.y)){S.pos.x=16;S.pos.y=28;}
 placePlayer(S.pos.x,S.pos.y);if(G.scene==='house')lifeEnter();UI.houseMode(G.scene==='house');
 G.pendingDiary=away>=90*60000?makeDiary(away):null;
 syncVillagers();syncEncounters();fixTool();G.lastMin=-1;G.lastHour=NOW().getHours();G.ready=true;
 document.body.classList.remove("pre");Snd.setBGM(S.opt.bgm);Snd.setSFX(S.opt.sfx);updateBGM();UI.hud();save();return isNew;
}
function boot(){
 G.cv=document.getElementById('game');G.ctx=G.cv.getContext('2d');G.light=mkCanvas(1,1);G.lctx=G.light.getContext('2d');
 resize();addEventListener('resize',resize);setupInput();
 G.world=buildWorld();G.worldKey='';G.season=seasonOf();G.weather=weatherAt();G.layers=buildMapLayers(G.world,G.season);G.layers.season=G.season;initWeatherParts();
 UI.init();S=load();UI.title();
 requestAnimationFrame(loop);setInterval(tick1s,1000);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)save();else onResume();});addEventListener('pagehide',save);
 if('serviceWorker'in navigator&&location.protocol.startsWith('http'))navigator.serviceWorker.register('sw.js').catch(()=>{});
}
addEventListener('load',boot);
