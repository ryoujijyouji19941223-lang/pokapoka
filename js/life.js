'use strict';
// ============================================================
//  ぷちっこの くらし: personality, house life, gifts, diary,
//  encounter picking, tomorrow preview
// ============================================================

// ---------------- personality ----------------
function rollPersona(){return PERSONA_KEYS[Math.floor(Math.random()*PERSONA_KEYS.length)];}
function perOf(m){if(!m.per)m.per=PERSONA_KEYS[hashStr('p'+m.uid+m.sp+(m.got||0))%PERSONA_KEYS.length];return m.per;}
function favOf(m){if(!m.fav)m.fav=FAV_POOL[hashStr('f'+m.uid+(m.got||0))%FAV_POOL.length];return m.fav;}
function perData(m){return PERSONA[perOf(m)];}
function monFmt(s,m,x={}){return fmt(s,x).replace(/\{me\}/g,m.name).replace(/\{fav\}/g,ITEMS[favOf(m)].name);}
function rnd(a){return a[Math.floor(Math.random()*a.length)];}
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}

// ---------------- house life ----------------
function housePets(){return G.scene==='house'?G.party.concat(G.guests||[]):G.party;}
function petTaken(x,y,except){return housePets().some(p=>p!==except&&((p.ai&&p.ai.tgt&&p.ai.tgt[0]===x&&p.ai.tgt[1]===y)||(p.e.tx===x&&p.e.ty===y)));}
function freeRoomTile(except){const c=[];for(let y=3;y<ROOM_H-1;y++)for(let x=0;x<ROOM_W;x++)if(walkRoom(x,y)&&!petTaken(x,y,except))c.push([x,y]);return c.length?rnd(c):null;}
function lifeEnter(){
 G.guests=[];S.furniture.forEach(f=>{f._busy=null;f._ox=0;f._oy=0;f._stack=0;});
 const rest=shuffle(S.creatures.filter(m=>!S.party.includes(m.uid))).slice(0,seriesOn('toy')?5:3);
 for(const m of rest){const t=freeRoomTile();if(!t)break;const e=mkEnt(t[0],t[1],3);e.jump=0;const pa={mon:m,e,guest:true,ai:{st:'idle',t:0}};G.guests.push(pa);chooseAct(pa,true);}
 G.party.forEach((pa,i)=>{pa.e.speed=3.2;pa.ai={st:'idle',t:0.9+i*0.8};});seriesOnEnter();checkSeries(true);
 setTimeout(()=>{if(G.scene!=='house')return;const g=(G.guests||[]).find(p=>p.ai&&p.ai.st==='act'&&actText(p));if(g)UI.toast(`${g.mon.name}が ${actText(g)}`,g.mon.sp);},700);
}
function lifeExit(){G.guests=[];S.furniture.forEach(f=>{f._busy=null;f._ox=0;f._oy=0;f._stack=0;});}
function actText(pa){const a=pa.ai;if(!a||!a.type)return '';if(a.type==='sleep'&&a.f)return `${FURN[a.f.id].name}で すやすや ねている`;if(a.type==='eat')return 'テーブルで おやつを たべている';return ACT_JP[a.type]||'';}
function chooseAct(pa,instant){
 const per=perData(pa.mon),h=NOW().getHours(),night=h>=21||h<6;const opts=[];
 for(const f of S.furniture){const t=actOf(f.id);if(!t||f._busy)continue;let w=per.acts[t]||0.6;
  if(t==='sleep'){w*=night?5:(h>=12&&h<15?1.4:0.6);if(f.id==='kotatsu'&&!['au','wi'].includes(G.season))w*=0.3;}
  else if(night)w*=0.5;
  if(FURN[f.id].toy)w*=1.5;opts.push({f,t,w});}
 if(!instant){opts.push({t:'wander',w:per.acts.wander||1});opts.push({t:'follow',w:per.acts.follow||0.4});}
 if(!opts.length)return wander(pa);
 const o=wpick(opts,x=>x.w);if(o.t==='wander')return wander(pa);if(o.t==='follow')return follow(pa);
 goAct(pa,o.f,o.t,instant);
}
function actTarget(f,pa){const F=FURN[f.id];const[w,h]=fdim(f);const c=[];
 if(F.walk){for(let j=0;j<h;j++)for(let i=0;i<w;i++){const x=f.x+i,y=f.y+j;if(walkRoom(x,y)&&!petTaken(x,y,pa))c.push([x,y]);}return c.length?rnd(c):null;}
 const pref=[];for(const[dx,dy]of[[0,1],[-1,0],[1,0],[0,-1]]){const x=f.x+dx,y=f.y+dy;if(walkRoom(x,y)&&!covers(f,x,y)&&!petTaken(x,y,pa))(dy===1?pref:c).push([x,y]);}
 return pref.length?pref[0]:c.length?rnd(c):null;}
function goAct(pa,f,t,instant){
 const tgt=actTarget(f,pa);if(!tgt)return wander(pa);const a=pa.ai;
 f._busy=pa.mon.uid;a.f=f;a.type=t;a.tgt=tgt;
 if(instant){const e=pa.e;e.tx=e.nx=tgt[0];e.ty=e.ny=tgt[1];e.path=[];e.moving=false;e.prog=0;e.px=e.tx*TS;e.py=e.ty*TS;beginAct(pa,true);return;}
 const path=bfs(pa.e.tx,pa.e.ty,(x,y)=>x===tgt[0]&&y===tgt[1],walkRoom,ROOM_W,ROOM_H,800);
 if(!path){f._busy=null;a.f=null;a.tgt=null;return wander(pa);}
 pa.e.path=path;a.st='go';a.t=14;}
function beginAct(pa,instant){const a=pa.ai;a.st='act';a.at=instant?Math.random()*6:0;a.em=0.6+Math.random()*1.5;a.ps=0;
 const per=perOf(pa.mon);a.t=a.type==='sleep'?(per==='nebosuke'?70:40)+Math.random()*50:14+Math.random()*18;
 if(a.f)pa.e.flip=a.f.x<pa.e.tx;}
function endAct(pa){const a=pa.ai;if(a.f){a.f._busy=null;a.f._ox=0;a.f._oy=0;a.f._stack=0;}
 if(a.type==='sleep'&&a.at>25&&perOf(pa.mon)==='nebosuke'&&S.daily){const n=S.daily.naps||(S.daily.naps={});if((n[pa.mon.uid]||0)<3){n[pa.mon.uid]=(n[pa.mon.uid]||0)+1;restoreEn(pa.mon,2);}}
 a.f=null;a.type=null;a.tgt=null;a.st='idle';a.t=2+Math.random()*4;pa.vis=null;}
function wander(pa){const a=pa.ai;a.st='idle';a.t=3+Math.random()*4;a.f=null;a.type=null;a.tgt=null;const e=pa.e;const c=[];
 for(let y=Math.max(2,e.ty-3);y<=Math.min(ROOM_H-1,e.ty+3);y++)for(let x=Math.max(0,e.tx-3);x<=Math.min(ROOM_W-1,e.tx+3);x++)if(walkRoom(x,y)&&!petTaken(x,y,pa))c.push([x,y]);
 if(!c.length)return;const t=rnd(c);const p=bfs(e.tx,e.ty,(x,y)=>x===t[0]&&y===t[1],walkRoom,ROOM_W,ROOM_H,400);if(p)e.path=p;}
function follow(pa){const a=pa.ai;a.st='idle';a.t=3+Math.random()*3;a.f=null;a.type=null;a.tgt=null;const p=G.player,e=pa.e;
 const path=bfs(e.tx,e.ty,(x,y)=>Math.abs(x-p.tx)+Math.abs(y-p.ty)===1&&!petTaken(x,y,pa),walkRoom,ROOM_W,ROOM_H,600);if(path)e.path=path;
 if(Math.random()<0.5)emote(e,HEART,1.2);}
let _lifeChk=0;
function lifeUpdate(dt){
 const pets=housePets();
 _lifeChk-=dt;if(_lifeChk<=0){_lifeChk=2;for(const f of S.furniture)if(f._busy&&!pets.some(p=>p.ai&&p.ai.f===f)){f._busy=null;f._ox=0;f._oy=0;f._stack=0;}}
 for(const pa of pets){const e=pa.e;if(!pa.ai)pa.ai={st:'idle',t:1};const a=pa.ai;if(e.jump>0)e.jump=Math.max(0,e.jump-dt);
  if(a.f&&!S.furniture.includes(a.f))endAct(pa);
  if(a.st==='act'){a.at+=dt;a.t-=dt;poseAct(pa,dt);if(a.t<=0)endAct(pa);continue;}
  entUpdate(e,dt,walkRoom);a.t-=dt;
  if(a.st==='go'){if(!e.moving&&!e.path.length){if(a.tgt&&e.tx===a.tgt[0]&&e.ty===a.tgt[1])beginAct(pa);else{if(a.f)a.f._busy=null;a.f=null;a.st='idle';a.t=1;}}
   else if(a.t<=0){if(a.f)a.f._busy=null;a.f=null;a.st='idle';a.t=1;}continue;}
  if(a.t<=0&&!e.moving&&!e.path.length&&!G.lock)chooseAct(pa);}
}
function poseAct(pa,dt){
 const a=pa.ai,f=a.f,e=pa.e,t=a.at;const[fw,fh]=f?fdim(f):[1,1];const sx=f?f.x*TS:0,sy=f?f.y*TS:0,fx=sx+(fw-1)*8,fy=sy+(fh-1)*8,ex=e.tx*TS,ey=e.ty*TS;
 let vx=ex,vy=ey,flip=e.flip,o={},on=false;a.em-=dt;const em=(spr,every,d=1.2)=>{if(a.em<=0){a.em=every*(0.7+Math.random()*0.6);emote(e,spr,d);}};
 switch(a.type){
  case 'sleep':o.sleep=true;
   if(f.id==='bed'){vx=fx;vy=sy+1;on=true;o.noShadow=true;o.still=true;}else if(f.id==='kotatsu'){vx=fx;vy=fy-2;on=true;o.noShadow=true;}else{o.noShadow=FURN[f.id].floor;}
   em(ZZZ,2.6,1.6);break;
  case 'eat':vx=fx;vy=fy-7;on=true;o.noShadow=true;o.dy=Math.floor(t*5)%2;em(HEART,4);pa.food=favOf(pa.mon);break;
  case 'sit':vx=fx;vy=fy-4;on=true;o.noShadow=true;em(NOTE,5);break;
  case 'rock':f._ox=Math.sin(t*4)*1.5;vx=fx+f._ox;vy=fy-6+Math.sin(t*4+1);on=true;o.noShadow=true;o.still=true;em(HEART,3.5);break;
  case 'ball':{f._ox=Math.sin(t*2.4)*6;const b=Math.abs(Math.sin(t*4.8));f._oy=-b*3;vy=ey-b*3;flip=fx+f._ox<ex;o.still=true;em(NOTE,3);break;}
  case 'yarn':{f._ox=Math.sin(t*1.6)*7;vx=ex+Math.sin((t-0.5)*1.6)*5;flip=Math.cos((t-0.5)*1.6)<0;o.still=true;o.dy=-Math.abs(Math.sin(t*6))*1.5;em(HEART,4);break;}
  case 'drum':{const k=Math.floor(t/0.55);if(k!==a.ps){a.ps=k;e.jump=0.3;f._oy=1;emote(e,NOTE,0.8);}else f._oy=0;break;}
  case 'slide':{const p=t%3.2;on=true;o.noShadow=true;o.still=true;
   if(p<1.0){vx=sx+18;vy=sy+16-p*30;flip=false;}else if(p<1.3){const k=(p-1.0)/0.3;vx=sx+18-k*8;vy=sy-14;}
   else if(p<2.0){const k=(p-1.3)/0.7;vx=sx+10-k*16;vy=sy-14+k*30;flip=true;}
   else if(p<2.5){vx=sx-6;vy=sy+16;o.noShadow=false;if(a.ps!==Math.floor(t/3.2)){a.ps=Math.floor(t/3.2);emote(e,HEART,1);}}
   else{const k=(p-2.5)/0.7;vx=sx-6+k*24;vy=sy+16;flip=false;o.noShadow=false;o.still=false;}
   break;}
  case 'stack':{const s=Math.floor(t/1.6)%5;if(s!==a.ps){if(s===0&&a.ps===4){puff(fx+8,fy+2,'#ffd040',8);emote(e,EXCL,1);}else{e.jump=0.3;}a.ps=s;}f._stack=s;break;}
  case 'watch':o.dy=Math.sin(t*1.5)*0.6;em(rnd([NOTE,HEART]),3.5);break;
  case 'music':flip=Math.floor(t/0.45)%2===0;o.still=true;o.dy=-Math.abs(Math.sin(t*7))*2;em(NOTE,1.2,0.9);break;
  case 'hug':o.dy=Math.sin(t*2)*0.6;em(HEART,2.2);break;
 }
 e.px=vx;e.py=vy;e.flip=flip;pa.vis={o,on,food:a.type==='eat'?favOf(pa.mon):null};
}
function petSortY(pa){const a=pa.ai;if(a&&a.st==='act'&&pa.vis&&pa.vis.on&&a.f)return a.f.y*TS+1;return pa.e.py+0.5;}
function drawHousePet(c,pa,ox,oy,i){const a=pa.ai;const act=a&&a.st==='act'&&pa.vis;
 drawMonAt(c,pa.mon.sp,pa.e,ox,oy,1.7+i,Object.assign({look:monLook(pa.mon)},act?pa.vis.o:{}));
 if(act&&pa.vis.food)c.drawImage(itemIcon(pa.vis.food),Math.round(pa.e.px-ox)+9,Math.round(pa.e.py-oy)+5,8,8);
 if(act&&a.type==='sleep'&&a.f&&a.f.id==='bed'){const B=furnSpr('bed');c.drawImage(B,0,15,B.width,B.height-15,a.f.x*TS-2-ox,a.f.y*TS-2-oy+15,B.width,B.height-15);}}
function drawStack(c,dx,dy,n){const cols=['#ff6a6a','#5a9ae8','#5cbf5a','#ffd040'];for(let i=0;i<n;i++){const x=dx+8+(i%2?1:-1),y=dy+8-4*(i+1);c.fillStyle='#3b2a20';c.fillRect(x-1,y-1,7,6);c.fillStyle=cols[i%4];c.fillRect(x,y,5,4);}}
function petInHouse(m){return(G.guests||[]).concat(G.party).find(p=>p.mon===m)||null;}

// ---------------- gifts while walking ----------------
function giftItem(m){const per=perOf(m),r=Math.random();
 if(r<(per==='hazukashi'&&affHearts(m)>=3?0.12:0.04))return rnd(GIFT_RARE);
 if(per==='kuishinbo'&&r<0.4)return[rnd(['apple','peach','orange','pear']),1];
 return rnd(GIFT_JOB[jobOf(m.sp)]);}
function giftTick(){
 if(G.scene!=='map'||G.lock||!S.daily||!G.party.length||S.story<STORY_DONE)return;const d=S.daily;if((d.gifts||0)>=2)return;
 const cands=G.party.filter(pa=>affHearts(pa.mon)>=2);if(!cands.length)return;
 let p=1/300*(1+(d.luck||0)*0.3);if(cands.some(pa=>perOf(pa.mon)==='kouki'))p*=1.6;if(Math.random()>p)return;
 const pa=wpick(cands,x=>perOf(x.mon)==='kouki'?2:1);d.gifts=(d.gifts||0)+1;const[k,n]=giftItem(pa.mon);
 pa.e.jump=0.45;emote(pa.e,EXCL,1.2);Snd.sfx('pop');
 setTimeout(()=>{addItem(k,n);UI.toast(`${pa.mon.name}が ${ITEMS[k].name}${n>1?'を '+n+'こ':'を'} ひろってきてくれた！`,k);Snd.sfx('get');hearts(pa.e.px+8,pa.e.py,2);save();},700);
}

// ---------------- away diary ----------------
function makeDiary(awayMs){
 if(!S||!S.daily||!S.creatures.length||S.story<1)return null;const d=S.daily;if((d.diaries||0)>=3)return null;
 const hrs=Math.min(24,awayMs/3600000);if(hrs<1.5)return null;d.diaries=(d.diaries||0)+1;
 const n=Math.min(4,1+Math.floor(hrs/3));const mons=shuffle(S.creatures.slice());
 const order=mons.filter(m=>!S.party.includes(m.uid)).concat(mons.filter(m=>S.party.includes(m.uid)));
 const out=[];const used=new Set();
 for(const m of order){if(out.length>=n)break;const j=jobOf(m.sp);if(used.has('j'+j))continue;const J=DIARY_JOB[j];
  if(J.water){const plots=Object.values(S.farm).filter(f=>f.crop&&!f.water&&cropStage(f)<3);if(!plots.length||G.weather==='rain')continue;
   plots.slice(0,3+monLv(m)).forEach(f=>f.water=true);out.push({sp:m.sp,t:monFmt(J.t,m)});used.add('j'+j);used.add(m.uid);continue;}
  let it=rnd(J.items);if(it[0]==='gem'&&Math.random()<0.6)it=['stone',2];if(it[0]==='iron'&&Math.random()<0.4)it=['stone',2];
  const nn=it[1]+(hrs>=8&&Math.random()<0.5?1:0);addItem(it[0],nn);
  out.push({sp:m.sp,t:monFmt(J.t,m,{item:ITEMS[it[0]].name+(nn>1?` ×${nn}`:'')}),item:it[0],n:nn});used.add('j'+j);used.add(m.uid);}
 const pm=mons.find(m=>!used.has(m.uid))||mons[0];out.push({sp:pm.sp,t:monFmt(rnd(DIARY_PER[perOf(pm)]),pm)});
 const fr=mons.filter(m=>affHearts(m)>=3);if(fr.length&&Math.random()<0.5){const m=fr[0];const[k,nn]=giftItem(m);addItem(k,nn);out.push({sp:m.sp,t:`${m.name}から ${S.name}へ、 ${ITEMS[k].name}の プレゼント！`,item:k,n:nn});}
 if(Math.random()<0.35){const v=rnd(DIARY_VIL);addItem(v.item[0],v.item[1]);out.push({vil:true,t:v.t,item:v.item[0],n:v.item[1]});}
 const en=(d.enc||[]).find(e=>!e.done);if(en&&S.dex[en.sp]!=='c'&&Math.random()<0.5)out.push({sil:en.sp,t:'みなれない ぷちっこが、 まどから そっと のぞいていたらしい…'});
 return out;
}
function onResume(){if(!S||!G.ready)return;const away=Date.now()-(S.lastSeen||Date.now());
 if(dayKey()!==S.daily.day){ensureDaily();Story.syncWorld();const se=seasonOf();if(se!==G.season){G.season=se;G.layers=buildMapLayers(G.world,se);G.layers.season=se;}UI.news();}
 if(away>=90*60000){const dl=makeDiary(away);if(dl&&dl.length)UI.diary(dl);}save();}

// ---------------- encounter picking ----------------
function trackPhase(){if(!S.phc){S.phc={M:0,D:0,E:0,N:0};S.phd={};}const ph=phaseOf(),dk=dayKey();if(S.phd[ph]!==dk){S.phd[ph]=dk;S.phc[ph]++;}}
function playPhases(){const c=S.phc||{};const tot=Object.values(c).reduce((a,b)=>a+b,0);
 let P=Object.keys(c).filter(k=>c[k]>=Math.max(1,tot*0.12));if(!P.includes('D'))P.push('D');if(!P.includes(phaseOf()))P.push(phaseOf());return P;}
function dayWeathers(date){const s=new Set();for(let b=0;b<4;b++){const t=new Date(date);t.setHours(b*6+1,0,0,0);s.add(weatherAt(t));}return s;}
function wpickR(r,list,wf){let tot=0;for(const x of list)tot+=wf(x);let v=r()*tot;for(const x of list){v-=wf(x);if(v<=0)return x;}return list[list.length-1];}
function pickEncSpecies(date){
 const r=mkRng(hashStr(dayKey(date)+'enc'+S.name));const se=seasonOf(date);const ws=dayWeathers(date);const wet=ws.has('rain')||ws.has('snow'),dry=ws.has('clear');
 let pool=SPECIES.filter(s=>s.rare>=1&&s.rare<=4&&(s.season==='*'||s.season.split(',').includes(se))&&(s.weather!=='rain'||wet)&&(s.weather!=='clear'||dry));
 const P=playPhases();const fits=s=>s.time==='*'||[...s.time].some(x=>P.includes(x));const unc=s=>S.dex[s.id]!=='c';
 const anyUnc=pool.some(s=>fits(s)&&unc(s));const wf=s=>RARE_W[s.rare]*(unc(s)?4:(anyUnc?0.35:1));const out=[];
 for(let i=0;i<2&&pool.length;i++){let cand=pool.filter(fits);if(!cand.length)cand=pool;const sp=wpickR(r,cand,wf);pool=pool.filter(x=>x!==sp);out.push({id:sp.id});}
 if((S.stamps||0)>=10&&r()<0.2&&out.length){const lost=pool.filter(s=>!fits(s)&&unc(s));if(lost.length)out[out.length-1]={id:lost[Math.floor(r()*lost.length)].id,anytime:true};}
 if((caughtCount()>=20||(S.flags&&S.flags.legend))&&S.dex.pokapokasama!=='c')out.push({id:'pokapokasama'});return out;}

// ---------------- shop stock (deterministic per day) ----------------
function shopStockFor(dk,season){const r=mkRng(hashStr(dk+S.name+'shop'));
 const shopF=Object.keys(FURN).filter(k=>!FURN[k].gift&&!FURN[k].craft&&!FURN[k].toy&&(!FURN[k].season||FURN[k].season.split(',').includes(season)));const stock=[];
 while(stock.length<4&&shopF.length)stock.push(shopF.splice(Math.floor(r()*shopF.length),1)[0]);
 const toys=SHOP_TOYS.slice();const ts=[];while(ts.length<2&&toys.length)ts.push(toys.splice(Math.floor(r()*toys.length),1)[0]);
 const seasOk=o=>!o.season||o.season.split(',').includes(season);
 const pick=(arr,n)=>{const a=arr.slice();const out=[];while(out.length<n&&a.length)out.push(a.splice(Math.floor(r()*a.length),1)[0]);return out;};
 const clothes=pick(Object.keys(OUTFITS).filter(k=>OUTFITS[k].price&&seasOk(OUTFITS[k])).map(k=>'o_'+k),2).concat(pick(Object.keys(HATS).filter(k=>seasOk(HATS[k])).map(k=>'h_'+k),1));
 const wears=pick(Object.keys(WEAR).filter(k=>!WEAR[k].craft&&seasOk(WEAR[k])),2);
 const surf=pick(Object.keys(WALLS).filter(k=>WALLS[k].price&&seasOk(WALLS[k])).map(k=>'wp_'+k),1).concat(pick(Object.keys(FLOORS).filter(k=>FLOORS[k].price).map(k=>'fl_'+k),1));
 return{stock,sale:stock[0],toys:ts,clothes,wears,surf};}

// ---------------- tomorrow preview ----------------
function tomorrowInfo(){
 const t=new Date(NOW());t.setDate(t.getDate()+1);t.setHours(9,0,0,0);const tk=dayKey(t);
 if(!S.nextEnc||S.nextEnc.day!==tk)S.nextEnc={day:tk,ids:pickEncSpecies(t)};
 const enc=S.nextEnc.ids.find(o=>o.id!=='pokapokasama')||S.nextEnc.ids[0]||null;
 const shop=shopStockFor(tk,seasonOf(t));const today=dayNum(dayKey());
 const mid=new Date(NOW());mid.setHours(24,0,0,0);const left=mid-NOW();let ready=0,dry=0;
 for(const k in S.farm){const f=S.farm[k];if(!f.crop||f.grow>=1)continue;const it=ITEMS[cropSeed(f.crop)];const rem=(1-f.grow)*it.hours*3600000;if(rem<=left){if(f.water)ready++;else dry++;}}
 return{w:weatherAt(t),enc,sale:shop.sale,toy:shop.toys[0],mom:today+1-S.lastMom>=2,ready,dry,stamp:STAMP_REWARDS[(S.stamps||0)%7]};}
function tomorrowLines(){const T=tomorrowInfo();const L=[];
 L.push(`てんき：${WEATHER_JP[T.w]}`);
 if(T.enc)L.push(`うわさ：${S.dex[T.enc.id]==='c'?'みおぼえの ある':'みなれない'} ぷちっこが くるかも…`);
 if(T.mom)L.push('ポスト：おかあさんから てがみが とどきそう');
 if(T.ready)L.push(`はたけ：${T.ready}かしょ しゅうかく できそう！`);else if(T.dry)L.push(`はたけ：みずを あげれば ${T.dry}かしょ みのりそう`);
 L.push(`おみせ：「${FURN[T.sale].name}」が 2わりびき`);
 L.push(`スタンプ：${T.stamp.t}`);return{T,L};}
