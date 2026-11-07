'use strict';
// ============================================================
//  ミニあそび: fishing, bugs, flowers, cooking, bakery, hide&seek
// ============================================================

// ---------------- icons ----------------
function extraIcon(id,it){if(!it)return null;const g=new Grid(16,16);let pal=null;
 if(it.cat==='fish'){pal={a:it.col,b:lighten(it.col,0.4),e:'#2a2238',f:darken(it.col,0.75)};g.ellipse(7,8.5,5.5,3.5,'a');g.ellipse(7,9.5,4,1.5,'b');g.rows(["x..","xx.","xxx","xx.","x.."],12,6,{x:'f'});g.set(4,7,'e');
  if(id==='fish_tako'){g.d.fill(null);g.circle(8,6,4.5,'a');for(let i=0;i<4;i++)g.rect(4+i*2,10,1,4,'a');g.set(6,6,'e');g.set(10,6,'e');}
  if(id==='fish_kurage'){g.d.fill(null);g.ellipse(8,6,5.5,3.5,'a');for(let i=0;i<4;i++)g.rect(4+i*2+(i%2),9,1,5,'b');}
  if(id==='fish_nushi'){g.rect(5,4,4,1,'f');}}
 else if(it.cat==='bug')return bugSpr(it.shape,it.col,it.col2,true);
 else if(it.cat==='flower'){if(id==='wildflower'){pal={g:'#4caf50',a:'#ff9ac8',b:'#ffd030',c:'#ffffff',r:'#ff6a8a'};g.rect(7,8,2,7,'g');g.rect(5,9,1,5,'g');g.rect(10,9,1,5,'g');g.circle(8,6,2,'a');g.circle(5,8,1.6,'b');g.circle(11,7,1.6,'c');g.rect(5,12,7,2,'r');}
  else{const c=id.slice(6);pal={g:'#4caf50',G:'#7ad46a',a:c==='n'?'#ff6a8a':FLOWER_COLS[c][1],b:c==='n'?'#7ac8ff':darken(FLOWER_COLS[c][1]==='#ffffff'?'#e8e8f0':FLOWER_COLS[c][1],0.8),y:'#ffd030'};
   g.rect(7,8,2,7,'g');g.rect(9,10,3,2,'G');g.rows(["x.x.x","xxxxx","xxxxx",".xxx."],5,3,{x:'a'});g.rect(6,5,4,2,'b');if(c==='n'){g.set(5,4,'y');g.set(9,4,'y');g.set(7,5,'G');}}}
 else if(it.cat==='seed'&&it.col&&!['seed_sun','seed_straw','seed_pump'].includes(id)){pal={a:'#e8cfa0',t:'#a8703a',c:it.col==='rainbow'?'#ff8ac8':it.col,d:'#7ac8ff'};g.rect(4,4,8,10,'a');g.rect(5,2,6,2,'a');g.rect(5,4,6,1,'t');g.circle(8,10,2.5,'c');if(it.col==='rainbow')g.set(9,9,'d');}
 else switch(id){
  case 'rod':pal={w:'#a8703a',s:'#e8e8f0',r:'#ff5a5a'};for(let i=0;i<11;i++)g.set(2+i,13-i,'w');g.rect(12,2,1,9,'s');g.rect(11,11,3,2,'r');break;
  case 'pokapan':pal={a:'#e8a050',b:'#f8d090',c:'#ff6a7a'};g.ellipse(8,9,6.5,4.5,'a');g.ellipse(8,8,4.5,2.5,'b');g.set(6,8,'c');g.set(9,7,'c');g.set(11,9,'c');break;
  case 'yakiimo':pal={a:'#a83a6a',b:'#ffd040',c:'#7a2a4a'};g.ellipse(8,9,6.5,3.5,'a');g.ellipse(10,8,3,2,'b');g.set(3,9,'c');break;
  case 'cake':pal={w:'#ffffff',p:'#ffd0dc',r:'#ff4a5a',c:'#f0c080'};g.rect(3,7,10,7,'c');g.rect(3,7,10,2,'w');g.rect(3,11,10,1,'p');g.circle(8,5.5,1.6,'r');g.set(5,6,'r');g.set(11,6,'r');break;
  case 'soba':pal={b:'#5a7ab0',w:'#ffffff',s:'#c8a070',g:'#5cbf5a'};g.ellipse(8,11,6.5,3,'b');g.ellipse(8,9,5.5,1.6,'s');g.rect(5,8,1,2,'w');g.set(10,8,'g');g.rect(11,2,1,7,'s');g.rect(13,3,1,6,'s');break;
  case 'choco':pal={a:'#7a4a2a',b:'#a86a4a',r:'#ff5a7a'};g.rows([".xx.xx.","xxxxxxx","xxxxxxx",".xxxxx.","..xxx..","...x..."],4,5,{x:'a'});g.set(6,6,'b');g.rect(3,3,1,3,'r');break;
  case 'dango':pal={p:'#ffb0c8',w:'#ffffff',g:'#9ad870',s:'#a8703a'};g.rect(2,13,12,1,'s');for(let i=0;i<12;i++)g.set(2+i,13-i,'s');g.circle(5,10,2.2,'g');g.circle(8,7,2.2,'w');g.circle(11,4,2.2,'p');break;
  case 'mochi':pal={w:'#ffffff',o:'#ff9a30',g:'#5cbf5a',b:'#c8c8d8'};g.ellipse(8,11,6,3,'w');g.ellipse(8,7.5,4.5,2.5,'w');g.circle(8,4.5,1.8,'o');g.set(9,3,'g');g.rect(2,13,12,1,'b');break;
  default:if(/^kakera\d$/.test(id)){pal={a:'#f0e0b8',b:'#a88a5a'};g.rows(["..xxxxxx..",".xxxxxxxx.","xxxxxxxxx.","xxxxxxxxxx",".xxxxxxxxx","..xxxxxxx.","...xxxx..."],3,4,{x:'a'});g.rect(5,6,5,1,'b');g.rect(5,8,6,1,'b');g.rect(5,10,3,1,'b');break;}
   if(id.startsWith('pan_')){const B=BREADS.find(b=>b[0]===id);pal={a:B[2],b:lighten(B[2],0.4)};g.ellipse(8,9,6,4,'a');g.ellipse(8,8,3.5,2,'b');break;}
   return null;}
 return renderGrid(g,pal);}
const _bug={};
function bugSpr(shape,c1,c2,icon){const k=shape+c1+c2+(icon?1:0);if(_bug[k])return _bug[k];const g=new Grid(icon?16:8,icon?16:7);const pal={a:c1,b:c2,k:'#2a2238'};const o=icon?4:0,sc=icon?2:1;
 const R=icon?(rows)=>rows.forEach((r,y)=>{for(let x=0;x<r.length;x++)if(r[x]!=='.')g.rect(o-1+x*sc,o+y*sc,sc,sc,r[x]);}):(rows)=>g.rows(rows,0,0);
 if(shape==='fly')R(["aa.aa","aabaa",".kbk.","aabaa","a...a"]);else if(shape==='glow')R([".k.k.","..b..",".bab.","..a.."]);else R(["k...k",".bbb.","babab","babab",".bbb."]);
 _bug[k]=renderGrid(g,pal,{outline:icon});return _bug[k];}

const Mini=(()=>{
 const el=(...a)=>UI.el(...a);const $=s=>document.querySelector(s);
 const fitT=(t,ph)=>t==='*'||t.includes(ph);const fitS=(s,se)=>s==='*'||s.split(',').includes(se);
 // ---------------- fishing ----------------
 function waterKind(x,y){const t=G.world.t[y][x];if(t==='S')return 'sea';if(y<10)return 'pond';return 'river';}
 function fishPick(where){const ph=phaseOf(),se=seasonOf();const pool=FISH.filter(f=>f.where===where&&fitT(f.time,ph)&&fitS(f.season,se));const W={1:60,2:28,3:9,4:3,5:1.2};
  return wpick(pool,f=>W[f.rare]*(S.fishDex&&S.fishDex[f.id]?1:1.6)*(1+((S.daily.luck||0)*(f.rare>=3?0.3:0))));}
 function fish(tx,ty){if(G.lock)return;G.lock++;const where=waterKind(tx,ty);const ov=el('div','catch');const box=el('div','cbox win');ov.append(box);$('#overlay').append(ov);
  box.innerHTML=`<div class="ctitle">つり（${{river:'かわ',pond:'いけ',sea:'うみ'}[where]}）</div><canvas width="180" height="130"></canvas><div class="cmsg">うきを みて、 しずんだら タップ！</div><div class="cbtns"></div>`;
  const cv=box.querySelector('canvas'),c=cv.getContext('2d'),msg=box.querySelector('.cmsg'),btns=box.querySelector('.cbtns');let st='wait',t0=performance.now(),bite=0,dur=0,alive=true,fishSp=null,timers=[];
  const bg={river:['#6ac0f0','#3a90d8'],pond:['#5ab8a0','#2a8870'],sea:['#4aa0e8','#2a60b8']}[where];const night=phaseOf()==='N';
  const draw=()=>{if(!alive)return;const T=performance.now()/1000;const gr=c.createLinearGradient(0,0,0,130);gr.addColorStop(0,bg[0]);gr.addColorStop(1,bg[1]);c.fillStyle=gr;c.fillRect(0,0,180,130);if(night){c.fillStyle='rgba(16,20,56,0.35)';c.fillRect(0,0,180,130);}
   c.fillStyle='rgba(255,255,255,0.35)';for(let i=0;i<8;i++){const y=(i*17+T*6)%130;c.fillRect((i*41)%170,y,10,1);}
   let by=62+Math.sin(T*3)*1.5;if(st==='nibble')by+=Math.sin(T*40)*2;if(st==='bite')by+=7;
   c.strokeStyle='rgba(255,255,255,0.8)';c.beginPath();c.moveTo(90,0);c.lineTo(90,by-5);c.stroke();
   c.fillStyle='#3b2a20';c.fillRect(85,by-5,10,11);c.fillStyle='#ff4a4a';c.fillRect(86,by-4,8,5);c.fillStyle='#ffffff';c.fillRect(86,by+1,8,4);
   if(st==='bite'||st==='nibble'){c.strokeStyle='rgba(255,255,255,0.7)';const r=(T*30)%16+6;c.beginPath();c.ellipse(90,by+6,r,r*0.35,0,0,Math.PI*2);c.stroke();}
   if(st==='bite'){c.fillStyle='#ff4a3a';c.fillRect(104,30,4,12);c.fillRect(104,45,4,4);}
   requestAnimationFrame(draw);};requestAnimationFrame(draw);
  const later=(fn,ms)=>timers.push(setTimeout(fn,ms));
  const start=()=>{st='wait';msg.textContent='…しずかに まとう';btns.innerHTML='';fishSp=fishPick(where);if(!fishSp){msg.textContent='いまは なにも いないみたい。';return end();}
   const w=1400+Math.random()*3200;const nib=Math.random()<0.6;if(nib)later(()=>{if(st==='wait'){st='nibble';later(()=>{if(st==='nibble')st='wait';},500);}},w*0.5);
   later(()=>{if(st!=='wait'&&st!=='nibble')return;st='bite';Snd.sfx('hit');msg.textContent='！！ いまだ！';dur=fishSp.rare>=4?520:fishSp.rare>=3?620:760;later(()=>{if(st==='bite'){st='miss';msg.textContent='あっ… にげられちゃった。';Snd.sfx('miss');end();}},dur);},w);};
  const end=()=>{btns.innerHTML='';const a=el('button','btn','もういちど');a.onclick=()=>start();const b=el('button','btn sub','おわる');b.onclick=close;btns.append(a,b);};
  const close=()=>{alive=false;timers.forEach(clearTimeout);ov.remove();G.lock--;save();};
  cv.onpointerdown=e=>{e.preventDefault();if(st==='bite'||(Q.has('debug')&&(st==='wait'||st==='nibble'))){st='done';timers.forEach(clearTimeout);const f=fishSp;const sz=Math.round(f.size[0]+Math.random()*(f.size[1]-f.size[0]));
    if(!S.fishDex)S.fishDex={};const isNew=!S.fishDex[f.id];const rec=S.fishDex[f.id]||(S.fishDex[f.id]={n:0,max:0});rec.n++;const best=sz>rec.max;rec.max=Math.max(rec.max,sz);
    if(isNew)addMemory(`はじめて ${f.name}を つった（${sz}cm）`,'fish_'+f.id);addItem('fish_'+f.id);quest('fish');Snd.jingle(f.rare>=3?'fanfare':'mail');msg.innerHTML=`<b>${f.name}</b>（${sz}cm）を つりあげた！${isNew?'<br><span class="cnew">ずかんに とうろく！</span>':best?'<br><span class="desc">じこ ベスト！</span>':''}`;
    const im=UI.iconOf('fish_'+f.id);im.style.width='48px';im.style.height='48px';box.querySelector('.cmsg').prepend(im);
    G.party.forEach(pa=>{pa.e.jump=0.45;});if(f.id==='nushi'&&S.movedIn&&S.movedIn.riku)S.flags.nushi=1;end();}
   else if(st==='wait'||st==='nibble'){st='early';timers.forEach(clearTimeout);msg.textContent='はやすぎた… さかなが にげちゃった。';Snd.sfx('miss');end();}};
  start();}

 // ---------------- bugs ----------------
 function spawnBugs(r){const H=habTiles();const se=seasonOf();const out=[];const used=new Set();
  for(let i=0;i<6;i++){const cand=BUGS.filter(b=>fitS(b.season,se));if(!cand.length)break;const W={1:60,2:26,3:10,4:3};const b=wpickR(r,cand,x=>W[x.rare]);
   const tiles=(H[b.where]||H.any).filter(c=>!used.has(c[0]+','+c[1])&&!S.farm[c[0]+','+c[1]]);if(!tiles.length)continue;const c=tiles[Math.floor(r()*tiles.length)];used.add(c[0]+','+c[1]);out.push({id:b.id,x:c[0],y:c[1],got:false});}
  return out;}
 function bugVisible(b){const B=BUGS.find(x=>x.id===b.id);return !b.got&&fitT(B.time,phaseOf())&&G.weather!=='rain';}
 function drawBugs(c,ox,oy){const d=S&&S.daily;if(!d||!d.bugs)return;d.bugs.forEach((b,i)=>{if(!bugVisible(b))return;const B=BUGS.find(x=>x.id===b.id);const spr=bugSpr(B.shape,B.col,B.col2);
   const T=G.t+i*1.7;let dx=0,dy=0;if(B.shape==='fly'){dx=Math.sin(T*1.3)*5;dy=Math.sin(T*2.6)*3-4;}else if(B.shape==='glow'){dx=Math.sin(T*0.8)*4;dy=Math.cos(T*1.1)*3-5;}
   const x=Math.round(b.x*TS+4+dx-ox),y=Math.round(b.y*TS+4+dy-oy);if(B.shape==='glow'&&(phaseOf()==='N'||phaseOf()==='E')){c.fillStyle=`rgba(255,250,150,${0.25+Math.sin(T*3)*0.15})`;c.fillRect(x-2,y-2,11,10);}
   if(B.shape==='fly'&&Math.floor(T*8)%2){c.drawImage(spr,0,0,spr.width,spr.height,x+1,y,spr.width-2,spr.height);}else c.drawImage(spr,x,y);});}
 function bugAt(tx,ty){const d=S.daily;if(!d||!d.bugs)return -1;return d.bugs.findIndex(b=>b.x===tx&&b.y===ty&&bugVisible(b));}
 function catchBug(i){const d=S.daily;const b=d.bugs[i];if(!b||b.got)return;const B=BUGS.find(x=>x.id===b.id);const p={1:0.9,2:0.75,3:0.62,4:0.5}[B.rare]+(d.luck||0)*0.04;
  Snd.sfx('rustle');puff(b.x*TS+8,b.y*TS+6,'#ffffff',6);
  if(Math.random()<p||Q.has('debug')){b.got=true;if(!S.bugDex)S.bugDex={};const isNew=!S.bugDex[b.id];S.bugDex[b.id]=(S.bugDex[b.id]||0)+1;if(isNew)addMemory(`はじめて ${B.name}を つかまえた`,'bug_'+b.id);addItem('bug_'+b.id);quest('bug');
   setTimeout(()=>{UI.toast(`${B.name}を つかまえた！${isNew?' ずかんに とうろく！':''}`,'bug_'+b.id);Snd.sfx('get');},250);}
  else{b.got='flew';setTimeout(()=>{UI.toast(`${B.name}に にげられちゃった…`);Snd.sfx('miss');},250);}save();}

 // ---------------- flowers ----------------
 function pickFlower(tx,ty){const d=S.daily;if((d.flowers||0)>=10){UI.toast('きょうは もう じゅうぶん つんだ。 また あした');return;}d.flowers=(d.flowers||0)+1;addItem('wildflower');quest('flower');Snd.sfx('rustle');puff(tx*TS+8,ty*TS+8,'#ffc0d8',6);UI.toast('はなを つんだ！','wildflower');}
 function tulipHybrid(x,y,crop){const c=crop.slice(6);const cols=[];for(const[dx,dy]of DIRS){const g=S.farm[fk(x+dx,y+dy)];if(g&&g.crop&&g.crop.startsWith('tulip_')&&cropStage(g)===3)cols.push(g.crop.slice(6));}
  for(const o of cols){if(o===c)continue;const key=[c,o].sort().join('+');const h=HYBRID[key];if(h&&Math.random()<0.35){addItem('seed_tulip_'+h);if(!S.flowerDex)S.flowerDex={};setTimeout(()=>{UI.toast(`めずらしい たねが とれた！ ${ITEMS['seed_tulip_'+h].name}`,'seed_tulip_'+h);Snd.jingle('mail');},500);return;}}}
 function noteFlower(crop){if(!crop.startsWith('tulip_'))return;if(!S.flowerDex)S.flowerDex={};S.flowerDex[crop]=(S.flowerDex[crop]||0)+1;}

 // ---------------- cooking ----------------
 function cook(R){return new Promise(res=>{G.lock++;const ov=el('div','catch');const box=el('div','cbox win');ov.append(box);$('#overlay').append(ov);const out=ITEMS[R.out];
  box.innerHTML=`<div class="ctitle">りょうり：${out.name}</div><canvas width="180" height="120"></canvas><div class="cmsg">はりが みどりに きたら タップ！（3かい）</div><div class="chits"></div>`;
  const cv=box.querySelector('canvas'),c=cv.getContext('2d'),msg=box.querySelector('.cmsg'),hb=box.querySelector('.chits');let ang=0,dir=1,score=0,taps=0,done=false,last=performance.now();let z0=0.35+Math.random()*0.3;const zw=0.18;
  const fire=bestWorker('fire');const pot=scaled(itemIcon(R.out),3);const fm=fire?scaled(monSpr(fire.mon.sp,monLook(fire.mon)).n,2):null;
  const drawH=()=>{hb.innerHTML='';for(let i=0;i<3;i++)hb.append(el('span','hh'+(i<score?' on':''),i<taps?(i<score?'♥':'×'):'♥'));};drawH();
  const fr=ts=>{if(done)return;const dt=Math.min(0.05,(ts-last)/1000);last=ts;ang+=dir*dt*0.9;if(ang>1){ang=1;dir=-1;}if(ang<0){ang=0;dir=1;}
   c.fillStyle='#fff3dc';c.fillRect(0,0,180,120);c.fillStyle='#ffd8a8';c.fillRect(0,80,180,40);
   if(fm)c.drawImage(fm,6,58);c.drawImage(pot,64,24);const T=performance.now()/1000;c.fillStyle='rgba(255,255,255,0.7)';for(let i=0;i<3;i++)c.fillRect(80+i*8,20-((T*20+i*7)%14),2,4);
   c.fillStyle='#3b2a20';c.fillRect(20,96,140,12);c.fillStyle='#ffffff';c.fillRect(22,98,136,8);c.fillStyle='#5cd06a';c.fillRect(22+z0*136,98,zw*136,8);
   c.fillStyle='#ff4a3a';c.fillRect(20+ang*136,92,4,20);requestAnimationFrame(fr);};requestAnimationFrame(fr);
  cv.onpointerdown=e=>{e.preventDefault();if(done)return;taps++;const hit=ang>=z0-0.01&&ang<=z0+zw+0.01||Q.has('debug');if(hit){score++;Snd.sfx('hit');msg.textContent=['いい かんじ！','その ちょうし！','かんぺき！'][score-1];}else{Snd.sfx('miss');msg.textContent='あれれ…';}
   z0=0.1+Math.random()*0.7;drawH();if(taps>=3){done=true;const q=score>=3?2:score>=2?1:0;msg.innerHTML=['できあがり！','<b>おいしく できた！</b>','<b>とっても おいしく できた！</b> ひとつ おまけ！'][q];
    if(fire){fire.e.jump=0.45;gainExp(fire.mon,q+1);}const b=el('button','btn gold','やったね');b.onclick=()=>{ov.remove();G.lock--;res(q>=2?1:0);};box.append(b);}};});}

 // ---------------- bakery ----------------
 function bakery(o){return Bakery.play(o);}
 async function villagerExtra(v,o){const d=S.daily;const h=NOW().getHours();
  if(v.id==='bear'&&h>=7&&h<19&&!d.bakery&&(S.vil.bear&&S.vil.bear.f>=1)){const c=await UI.say('いまから いそがしく なるんだ。 おみせを ちょっと てつだって くれないかい？',Object.assign({},o,{choices:['てつだう！','また こんど']}));
   if(c===0){d.bakery=1;await bakery();await UI.say('たすかったよ！ また あした たのむよ！',o);return true;}}
  if(v.id==='bear'&&h>=7&&h<19&&d.bakery===1){const c=await UI.say('おや、 また きてくれたのかい？ よかったら もう いちど おみせばん してみる？（おれいは すこし すくなめだけど）',Object.assign({},o,{choices:['やる！','きょうは もう いいや']}));
   if(c===0){await bakery({repeat:true});await UI.say('ありがとう！ きみが いると おみせが あかるく なるよ。',o);}else d.bakery=2;return true;}
  if(v.id==='riku'&&!S.flags.nushiTold&&S.flags.nushi){S.flags.nushiTold=1;await UI.sayAll(['えっ！？ かわの ぬしを つったって！？','す、 すごすぎる… {name}は つりの めいじんだ！ これ、 ぼくの たからもの… あげる！'].map(fmt),o);addItem('fossil');UI.toast('かせきを もらった！','fossil');return true;}
  return false;}
 const residents=()=>Story.residents();

 // ---------------- hide & seek ----------------
 function hideStart(m){const pa=G.party.find(p=>p.mon===m);if(!pa||G.scene!=='map')return;const p=G.player;const H=habTiles();
  const cands=H.tree.concat(H.grass).filter(([x,y])=>{const d=Math.abs(x-p.tx)+Math.abs(y-p.ty);return d>=4&&d<=10&&walkMap(x,y);});if(!cands.length){UI.toast('ここでは かくれる ばしょが ないみたい');return;}
  const c=rnd(cands);G.hide={pa,x:c[0],y:c[1],t:120};pa.hidden=true;S.daily.hideDone=1;puff(pa.e.px+8,pa.e.py+8);Snd.sfx('pop');
  UI.say(`${m.name}「かくれんぼ しよう！ 10 かぞえたら さがしてね！」\n…ちかくの きの かげや くさむらを タップして さがそう。`);}
 function hideTick(dt){const h=G.hide;if(!h)return;h.t-=dt;const p=G.player;const d=Math.abs(p.tx-h.x)+Math.abs(p.ty-h.y);
  if(d<=3&&Math.random()<dt*1.5)G.parts.push({x:h.x*TS+4+Math.random()*8,y:h.y*TS+6,vx:Math.random()*10-5,vy:-12,life:0.5,max:0.5,col:'#7ac85a',sz:2});
  if(h.t<=0&&!G.lock){hideEnd(false);}}
 function hideTap(tx,ty){const h=G.hide;if(!h)return false;if(Math.abs(tx-h.x)+Math.abs(ty-h.y)<=1){goAdjacent(h.x,h.y,()=>hideEnd(true),()=>hideEnd(true));return true;}return false;}
 function hideEnd(found){const h=G.hide;if(!h)return;G.hide=null;const pa=h.pa;pa.hidden=false;const e=pa.e;e.tx=e.nx=h.x;e.ty=e.ny=h.y;e.px=h.x*TS;e.py=h.y*TS;e.path=[];e.jump=0.45;hearts(e.px+8,e.py,found?6:3);
  G.trail=G.party.map(q=>[q.e.tx,q.e.ty]);const m=pa.mon;
  if(found){gainAff(m,3);const[k,n]=giftItem(m);addItem(k,n);Snd.jingle('fanfare');UI.say(`${m.name}「みつかっちゃった〜！ ${rnd(['{name}、 すごい！','えへへ、 たのしかった！','もう いっかい やりたいな！'])}」`.replace('{name}',S.name)).then(()=>UI.toast(`${m.name}が ${ITEMS[k].name}を くれた！`,k));}
  else{gainAff(m,1);UI.say(`${m.name}「ここだよ〜！ …みつけて ほしかったな〜」`);}save();}

 // ---------------- collection dex ----------------
 function dexTab(body,tab){const grid=el('div','dgrid');const info=(t)=>{const r=el('div','info');r.innerHTML=t;return r;};
  const TJ=t=>t==='*'?'いつでも':t.split('').map(x=>TIME_JP[x]).join('・');const SJ=s=>s==='*'?'いちねんじゅう':s.split(',').map(x=>SEASON_JP[x]).join('・');
  if(tab==='fish'){const D=S.fishDex||{};body.append(el('div','note',`さかな ${Object.keys(D).length} / ${FISH.length}　（つりざおで みずべを タップ）`));
   FISH.forEach(f=>{const got=D[f.id];const c=el('button','dcell'+(got?' got':''));c.append(got?UI.iconOf('fish_'+f.id):el('div','unk','？'));c.append(el('span','dnm',got?f.name:'？？？'));
    c.onclick=()=>UI.say(got?`${f.name}　さいだい ${got.max}cm　（${got.n}ひき）\n${{river:'かわ',pond:'いけ',sea:'うみ'}[f.where]}・${TJ(f.time)}・${SJ(f.season)}`:`${{river:'かわ',pond:'いけ',sea:'うみ'}[f.where]}で つれるらしい…`);grid.append(c);});}
  if(tab==='bug'){const D=S.bugDex||{};body.append(el('div','note',`むし ${Object.keys(D).length} / ${BUGS.length}　（ひかる むしを タップ）`));
   BUGS.forEach(b=>{const got=D[b.id];const c=el('button','dcell'+(got?' got':''));c.append(got?UI.iconOf('bug_'+b.id):el('div','unk','？'));c.append(el('span','dnm',got?b.name:'？？？'));
    c.onclick=()=>UI.say(got?`${b.name}（${got}ひき）\n${HAB_JP[b.where]||'はなの ちかく'}・${TJ(b.time)}・${SJ(b.season)}`:`${SJ(b.season)}に みられるらしい…`);grid.append(c);});}
  if(tab==='flower'){const D=S.flowerDex||{};const keys=Object.keys(FLOWER_COLS);body.append(el('div','note',`チューリップ ${keys.filter(c=>D['tulip_'+c]).length} / ${keys.length}　（ちがう いろを となりに うえると…）`));
   keys.forEach(c=>{const got=D['tulip_'+c];const cc=el('button','dcell'+(got?' got':''));cc.append(got?UI.iconOf('tulip_'+c):el('div','unk','？'));cc.append(el('span','dnm',got?ITEMS['tulip_'+c].name.replace('の チューリップ',''):'？？？'));grid.append(cc);});}
  body.append(grid);}
 return{fish,spawnBugs,drawBugs,bugAt,catchBug,pickFlower,tulipHybrid,noteFlower,cook,bakery,villagerExtra,hideStart,hideTick,hideTap,dexTab};
})();
