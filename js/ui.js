'use strict';
// ============================================================
//  UI (DOM): dialogs, panels, minigame, screens
// ============================================================
const UI=(()=>{
 const $=s=>document.querySelector(s);
 const el=(t,c,h)=>{const e=document.createElement(t);if(c)e.className=c;if(h!=null)e.innerHTML=h;return e;};
 const urlCache={};
 function url(key,fn){if(!urlCache[key])urlCache[key]=fn().toDataURL();return urlCache[key];}
 function dropCache(k){delete urlCache[k];}
 function img(key,fn,size,cls='px'){const i=new Image();i.src=url(key,fn);i.className=cls;if(size){i.style.width=size+'px';i.style.height=size+'px';}i.draggable=false;return i;}
 const iconOf=k=>{if(!k)return null;if(k==='recipe')return img('it_recipe',()=>itemIcon('recipe'),24);if(ITEMS[k])return img('it_'+k,()=>itemIcon(k),24);if(SP[k])return img('mon_'+k,()=>monSpr(k).n,32);return img('ui_'+k,()=>uiIcon(k),22);};
 const monImg=(id,size=48,sil=false)=>img((sil?'sil_':'mon_')+id,()=>sil?monSpr(id).s:monSpr(id).n,size);
 const monImgM=(m,size=48)=>{const l=monLook(m);return img('monm_'+m.sp+lookKey(l),()=>monSpr(m.sp,l).n,size);};
 const heartsStr=m=>{const h=affHearts(m);return '♥'.repeat(h)+'♡'.repeat(5-h);};
 const jobChip=id=>{const j=JOBS[jobOf(id)];return `<span class="tchip" style="background:${j.col}">${j.jp}</span>`;};
 const typeChip=t=>`<span class="tchip" style="background:${TYPES[t].col}">${TYPES[t].jp}</span>`;

 // ---------- HUD ----------
 function init(){
  $('#hCoin').src=url('ui_coin',()=>uiIcon('coin'));
  const bar=$('#bar');[['bag','もちもの',()=>bag()],['paw','なかま',()=>nakama()],['book','ずかん',()=>dex()],['scroll','おねがい',()=>questPanel()],['gear','メニュー',()=>menu()]].forEach(([ic,lb,fn])=>{
   const b=el('button','bbtn');b.dataset.nav=ic;b.append(img('ui_'+ic,()=>uiIcon(ic),22));b.append(el('span',null,lb));
   b.onclick=()=>{Snd.init();if(!G.ready)return;
    // a bottom-bar panel is open: tapping another tab switches straight to it; tapping the same tab closes it
    if(cur&&G.lock===1&&!G.photo&&!UI.decor){const same=cur.nav===ic&&cur.root;closePanel(true);if(same){Snd.sfx('close');return;}}else if(G.lock)return;
    Snd.sfx('tap');fn();if(cur){cur.nav=ic;cur.root=true;}navMark();};bar.append(b);});
  $('#toolBtn').onclick=()=>{Snd.init();if(G.lock||!G.ready)return;const t=toolsAvail();G.tool=t[(t.indexOf(G.tool)+1)%t.length];Snd.sfx('tap');hud();
   toast(G.tool==='till'?'しごと：たがやす（じめんを タップ）':G.tool==='chop'?'しごと：きを きる（もりの きを タップ）':'しごと：なし');};
  $('#btnDecor').onclick=()=>{if(G.lock&&!UI.decor)return;decorToggle();};
  $('#btnWard').onclick=()=>{if(G.lock)return;if(UI.decor)decorToggle();SUI.wardrobe();};
  $('#camBtn').onclick=()=>{Snd.init();SUI.photo();};
  $('#skyBtn').onclick=()=>{Snd.init();if(G.lock)return;Post.skyOpen();};
  $('#camBtn').append(img('ui_camera',()=>uiIcon('camera'),26));
  $('#btnOut').onclick=()=>{if(G.lock)return;if(UI.decor)decorToggle();walkTo(DOOR_X[0],ROOM_H-1,()=>G.scene==='inside'?Inside.exit():exitHouse());};
 }
 let lastW=null;
 function hud(){if(!S)return;const d=NOW();const h=d.getHours(),m=String(d.getMinutes()).padStart(2,'0');
  $('#hTime').textContent=`${h}:${m}`;$('#hDate').textContent=`${d.getMonth()+1}/${d.getDate()}(${WDAY[d.getDay()]})`;
  if(G.weather!==lastW){lastW=G.weather;$('#hW').src=url('ui_'+G.weather,()=>uiIcon(G.weather));}
  $('#hCoins').textContent=S.coins.toLocaleString();
  fixTool();const tb=$('#toolBtn');const av=toolsAvail();tb.classList.toggle('hidden',G.scene!=='map'||av.length<2);
  if(tb.dataset.t!==G.tool){tb.dataset.t=G.tool;tb.innerHTML='';const k=G.tool||'hand';tb.append(img('ui_'+k,()=>uiIcon(k),26));tb.append(el('span',null,G.tool?JOBS[G.tool].jp:'しごと'));tb.classList.toggle('on',!!G.tool);}}

 // ---------- toast ----------
 function toast(msg,icon){const t=el('div','toast win');const ic=iconOf(icon);if(ic)t.append(ic);t.append(el('span',null,msg));$('#toasts').append(t);
  setTimeout(()=>t.classList.add('out'),2300);setTimeout(()=>t.remove(),2700);const all=$('#toasts').children;if(all.length>3)all[0].remove();}

 // ---------- dialog ----------
 let sayChain=Promise.resolve();
 function say(text,o={}){const p=sayChain.then(()=>sayNow(text,o));sayChain=p.catch(()=>{});return p;}
 function sayNow(text,o={}){return new Promise(res=>{
  G.lock++;const d=$('#dlg');d.classList.remove('hidden');const nm=d.querySelector('.dname'),por=d.querySelector('.dpor'),tx=d.querySelector('.dtext'),nx=d.querySelector('.dnext'),chs=d.querySelector('.dchoices');
  nm.textContent=o.name||'';nm.classList.toggle('hidden',!o.name);por.innerHTML='';if(o.por){por.append(o.por);por.classList.remove('hidden');}else por.classList.add('hidden');
  chs.innerHTML='';chs.classList.add('hidden');nx.classList.add('hidden');tx.textContent='';
  let i=0,typing=true;const full=KJ.on()?KJ.convert(text,false):text;
  const end=()=>{typing=false;if(KJ.on())tx.innerHTML=KJ.convert(text,true);else tx.textContent=full;if(o.choices){chs.classList.remove('hidden');o.choices.forEach((c,k)=>{const b=el('button','btn',c);b.onclick=(e)=>{e.stopPropagation();finish(k);};chs.append(b);});}else nx.classList.remove('hidden');};
  const timer=setInterval(()=>{i++;tx.textContent=full.slice(0,i);const ch=full[i-1];if(o.pitch&&ch&&ch!==' '&&ch!=='\n'&&i%2===0)Snd.sfx('voice',o.pitch);if(i>=full.length){clearInterval(timer);end();}},30);
  d.onclick=e=>{if(e.target.closest('.dchoices'))return;if(typing){clearInterval(timer);end();return;}if(!o.choices)finish(-1);};
  function finish(v){clearInterval(timer);d.onclick=null;d.classList.add('hidden');G.lock--;Snd.sfx('tap');res(v);}
 });}
 async function sayAll(lines,o){for(const l of lines)await say(l,o);}
 const vilPor=id=>img('vp_'+id,()=>scaled(vilSpr(id).n,3),60);

 // ---------- panel ----------
 let cur=null;
 function panel(title,build,o={}){if(cur)closePanel(true);G.lock++;Snd.sfx('open');const p=el('div','panel win');const hd=el('div','phead');hd.append(el('div','ptitle',title));const x=el('button','pclose','×');x.onclick=()=>closePanel();hd.append(x);
  const body=el('div','pbody');p.append(hd,body);$('#panels').append(p);cur={p,body,title,onClose:o.onClose,nav:navLast,root:false};build(body,p);navMark();
  if(lastClose&&lastClose.title===title&&performance.now()-lastClose.t<300)body.scrollTop=lastClose.top;return body;}
 let lastClose=null;
 function closePanel(silent){if(!cur)return;lastClose={title:cur.title,top:cur.body.scrollTop,t:performance.now()};navLast=cur.nav;cur.p.remove();G.lock--;if(!silent)Snd.sfx('close');const f=cur.onClose;cur=null;setTimeout(()=>{if(!cur)navLast=null;navMark();},0);if(f&&!silent)f();}
 let navLast=null;
 function navMark(){const k=cur?cur.nav:null;document.querySelectorAll('#bar .bbtn').forEach(b=>b.classList.toggle('on',!!k&&b.dataset.nav===k));}

 // ---------- villagers ----------
 async function talkVillager(vo){
  const v=vo.v,e=vo.e;vo.talking=true;e.path=[];const p=G.player;const dx=p.tx-e.tx;if(dx)e.flip=dx<0;
  if(!v.visitor){try{await Post.handOver(v,{name:v.name,por:vilPor(v.id),pitch:v.pitch});}catch(err){console.error(err);}}
  if(v.chief){try{await talkChief(vo);}finally{vo.talking=false;}return;}
  if(v.visitor){try{await Story.talkVisitor(vo);}finally{vo.talking=false;}return;}
  const d=S.daily;const fr=S.vil[v.id]||(S.vil[v.id]={f:0,ms:0});const L=v.lines;const o={name:v.name,por:vilPor(v.id),pitch:v.pitch};
  const pool=[];const ph=phaseOf();if(!d.talked[v.id])pool.push(...L[ph]);else{pool.push(...L.chat);if(G.weather==='rain')pool.push(...L.rain);if(G.weather==='snow')pool.push(...L.snow);if(fr.f>=6)pool.push(...L.love);pool.push(...L[ph]);}
  let lines=pool.filter(s=>partnerMon()||!s.includes('{partner}'));const line=lines[Math.floor(Math.random()*lines.length)]||L.chat[0];
  emote(e,NOTE,1.2);await say(fmt(line),o);
  if(!d.talked[v.id]){d.talked[v.id]=1;fr.f++;quest('talk');if(G.weather==='rain'||G.weather==='snow'){const wl=L[G.weather];await say(fmt(wl[0]),o);}checkFriend(v,fr);}
  try{if(await Story.afterGreeting(v,o)){vo.talking=false;return;}if(await Mini.villagerExtra(v,o)){vo.talking=false;return;}}catch(err){console.error(err);}
  const rq=d.req[v.id];
  if(rq&&!rq.done){const it=ITEMS[rq.item];const has=itemCount(rq.item)>0;
   const ch=await say(fmt(L.req,{item:it.name}),Object.assign({},o,{choices:has?['あげる','ごめんね']:['いまは もってないや']}));
   if(has&&ch===0){takeItem(rq.item);rq.done=true;fr.f+=2;await say(fmt(L.thanks),o);
    const r=Math.random();if(r<0.4){const c=100+Math.floor(Math.random()*5)*50;addCoins(c);toast(`${c}ポカ もらった！`,'coin');Snd.sfx('coin');}
    else if(r<0.7){addItem('cookie',3);toast('ぷちクッキーを 3こ もらった！','cookie');Snd.sfx('get');}
    else{const fs=Object.keys(FURN).filter(k=>!FURN[k].gift&&!FURN[k].craft);const f=fs[Math.floor(Math.random()*fs.length)];addItem('f_'+f);toast(`${FURN[f].name}を もらった！`,'f_'+f);Snd.sfx('get');}
    checkFriend(v,fr);}
   else await say(has?'そっか… また こんど おねがいね！':'そっか！ みつけたら おしえてね！',o);}
  try{await Post.handOver(v,o);}catch(err){console.error(err);}
  vo.talking=false;
 }
 function checkFriend(v,fr){const lv=fr.f>=20?3:fr.f>=12?2:fr.f>=5?1:0;if(lv>fr.ms){fr.ms=lv;const fs=Object.keys(FURN).filter(k=>!FURN[k].gift&&!FURN[k].craft);const f=fs[(hashStr(v.id+lv))%fs.length];
  const rc=(VIL_RECIPES[v.id]||[])[lv-1];
  const msg=['いつも はなしかけてくれて ありがとう！ これからも よろしくね。','{name}と なかよく なれて うれしいよ。 ささやかだけど プレゼント！','{name}は もう だいじな ともだちだよ。 これ、 うけとってね。'][lv-1];
  const rmsg=rc?`\nそれと、 ${ITEMS[RECIPES[rc].out].name}の レシピを かいておいたよ。`:'';
  Post.hand(v.id,{t:msg+(rc?`\nそれと、 ${ITEMS[RECIPES[rc].out].name}の レシピを おしえてあげる。`:''),items:lv>=2?{['f_'+f]:1}:null,recipes:rc?[rc]:[]});toast(`${v.name}と もっと なかよく なった！`,'paw');addMemory(`${v.name}と もっと なかよく なった`,'paw');}}
 async function talkChief(vo){
  const v=vo.v;const o={name:v.title,por:vilPor('chief'),pitch:v.pitch};const d=S.daily;
  if(!d.talked.chief){d.talked.chief=1;quest('talk');}
  if(S.storyReady){const st=STORY[S.story];emote(vo.e,HEART,1.4);
   for(const l of st.report)await say(fmt(l),o);
   const rw=st.reward||{};if(rw.items)for(const k in rw.items){addItem(k,rw.items[k]);toast(`${ITEMS[k].name}を ${rw.items[k]}こ もらった！`,k);}
   if(rw.coins){addCoins(rw.coins);toast(`${rw.coins}ポカ もらった！`,'coin');}
   if(rw.workbench&&!S.furniture.some(f=>f.id==='workbench')){placeBench();toast('いえに さぎょうだいが おかれた！','f_workbench');}
   if(rw.recipes)rw.recipes.forEach(r=>learnRecipe(r));Snd.sfx('get');
   S.story++;S.storyP=0;S.storyReady=false;
   if(st.spawn){const near={shizukun:[12,19],koron:[9,8],pachipiyo:[31,13]}[st.spawn]||[16,20];S.storyEnc=mkEnc(st.spawn,near);syncEncounters();}
   if(S.story>=STORY_DONE){S.daily.enc=pickEncounters();syncEncounters();Snd.jingle('fanfare');}
   save();return;}
  if(S.story<STORY_DONE){const st=STORY[S.story];await say(fmt(st.hint.replace(/（.*?）/,'')),o);
   if(st.goal!=='befriend'&&S.storyP>0)await say(`いまの ところ ${S.storyP} / ${st.n}。 そのちょうしよ。`,o);return;}
  if(await Story.chiefExtra(o))return;
  const cc=await say(fmt(rnd(['{name}さん、 なにか ようかしら？','あら、{name}さん。 どうしたの？'])),Object.assign({},o,{choices:['おはなし','おうちを ひろげたい','むらの ひょうか','なんでもない']}));if(cc===1){await SUI.houseTalk(o);return;}if(cc===2){await Village.rateTalk(o);return;}if(cc!==0)return;
  const ph=phaseOf();const L=v.lines;const pool=L.chat.concat(L[ph],G.weather==='rain'?L.rain:[],G.weather==='snow'?L.snow:[]).filter(s=>partnerMon()||!s.includes('{partner}'));
  emote(vo.e,NOTE,1.2);await say(fmt(pool[Math.floor(Math.random()*pool.length)]),o);
 }

 // ---------- creatures ----------
 async function monMenu(m,e){
  const d=S.daily;const o={name:m.name,por:monImgM(m,56)};const job=JOBS[jobOf(m.sp)];const pa=petInHouse(m);
  let head=`${m.name}（${job.jp}・${perData(m).jp}）Lv${monLv(m)}\n${heartsStr(m)}　げんき ${Math.max(0,enLeft(m))}/${enMax(m)}`;
  if(G.scene==='house'&&pa&&pa.ai&&pa.ai.st==='act')head=`${m.name}は ${actText(pa)}。\n${heartsStr(m)}　げんき ${Math.max(0,enLeft(m))}/${enMax(m)}`;
  if(d.luckyMon===m.uid)head+='　🍀ラッキー';
  const opts=['なでる','おはなし','ごはん'];const canHide=G.scene==='map'&&!d.hideDone&&!G.hide&&S.story>=STORY_DONE&&G.party.some(p=>p.mon===m);if(canHide)opts.push('かくれんぼ');opts.push('やめる');
  const ch=await say(head,Object.assign({},o,{choices:opts}));
  if(canHide&&ch===3)return Mini.hideStart(m);
  if(ch===0)await petMon(m,e,o);
  if(ch===1)await talkMon(m,e,o);
  if(ch===2)await feedMenu(m,e);
 }
 const monPitch=m=>520+hashStr(m.sp)%260;
 async function petMon(m,e,o){const d=S.daily;Snd.sfx('pet');hearts(e.px+8,e.py);
  if(!d.petted[m.uid]){d.petted[m.uid]=1;quest('pet');let n=2+(perOf(m)==='amaenbo'?1:0);if(Story.currentEvents().some(e=>e.petx2))n*=2;const lucky=d.luckyMon===m.uid;if(lucky)n+=2;gainAff(m,n);gainExp(m,1);
   await say(monFmt(rnd(PET_LINE[perOf(m)]),m),o);
   if(lucky){toast('きょうの ラッキーぷちっこ！ なかよしが たくさん ふえた','paw');Snd.sfx('star');}}
  else toast(`${m.name}は きもちよさそう`);}
 async function talkMon(m,e,o){const d=S.daily;const h=affHearts(m);const tier=h>=4?2:h>=2?1:0;emote(e,NOTE,1.2);
  const oo=Object.assign({},o,{pitch:monPitch(m)});const pool=TALK[perOf(m)][tier].slice();
  const days=Math.floor((Date.now()-(m.got||Date.now()))/86400000);
  if(h>=3&&days>=3)pool.push(`{name}と であって、 もう ${days}にち だね。 ${rnd(['あっと いう まだね！','これからも よろしくね。','ずっと おぼえてるよ。'])}`);
  if(G.weather==='rain')pool.push('あめの おと、 すき？ {me}は ちょっと すき。');
  if(G.weather==='snow')pool.push('ゆき！ ゆき！ {name}、 みて！ ふわふわ！');
  if(phaseOf()==='N')pool.push('よるの むらって、 しずかで いいね。');
  if(G.scene==='house'&&S.furniture.some(f=>FURN[f.id].toy))pool.push('おうちの おもちゃ、 だいすき！ ありがとう、 {name}。');
  const pa=petInHouse(m);if(G.scene==='house'&&pa&&pa.ai&&pa.ai.st==='act'&&pa.ai.type==='sleep'){await say(monFmt(rnd(['むにゃむにゃ… {name}… もう たべられないよ…','…すぅ… すぅ… {name}… えへへ…','…zzz… つぎは… もっと たかく つむの…','…むにゃ… {name}、 いっしょに… さんぽ…']),m),oo);if(!d.talkedMon[m.uid]){d.talkedMon[m.uid]=1;gainAff(m,1);}return;}
  if(h>=2&&!m.favKnown&&Math.random()<0.6){m.favKnown=true;await say(monFmt(rnd(FAV_TELL),m),oo);toast(`${m.name}の だいこうぶつ：${ITEMS[favOf(m)].name}`,favOf(m));}
  else await say(monFmt(rnd(pool),m),oo);
  if(!d.talkedMon[m.uid]){d.talkedMon[m.uid]=1;gainAff(m,1);}save();}
 async function feedMenu(m,e){const d=S.daily;
  const foods=FEED_FOODS.filter(k=>itemCount(k)>0);if(!foods.length)return say('あげられる ものを もっていない。 くだものの なる きを ゆらしてみよう。');
  if((d.fed[m.uid]||0)>=3)return say(`${m.name}は おなか いっぱい みたい。`);
  const c=await say('どれを あげる？',{choices:foods.map(k=>`${ITEMS[k].name}（${itemCount(k)}）${m.favKnown&&k===favOf(m)?'♥':''}`).concat(['やめる'])});if(c<0||c>=foods.length)return;
  const k=foods[c];const food=ITEMS[k].cat==='food';const fav=k===favOf(m);takeItem(k);d.fed[m.uid]=(d.fed[m.uid]||0)+1;Snd.sfx('pet');if(e)hearts(e.px+8,e.py,fav?8:5);
  let aff=food?4:3;if(fav)aff+=3;if(perOf(m)==='kuishinbo')aff+=2;
  restoreEn(m,food||fav?99:4);gainAff(m,aff);gainExp(m,1);quest('feed');
  if(fav){m.favKnown=true;if(e)e.jump=0.45;Snd.sfx('lvup');toast(`${ITEMS[k].name}は ${m.name}の だいこうぶつ！ とびはねて よろこんでいる！`,k);}
  else toast(`${m.name}は ${ITEMS[k].name}を おいしそうに たべた！ げんきが ${food?'ぜんぶ ':''}もどった`,k);save();}

 // ---------- catch minigame ----------
 function catchGame(w){
  const sp=SP[w.sp];G.catching=true;updateBGM();G.lock++;const story=w.enc&&w.enc.story;
  const D=story?[2,100,2.0]:{1:[1,80,2.4],2:[2,62,2.9],3:[2,52,3.4],4:[3,46,3.8],5:[3,40,4.2]}[sp.rare];
  let need=D[0],zone=(D[1]+((S.daily&&S.daily.luck)||0)*6)*Math.PI/180,spd=D[2],hits=0,miss=0,treat=0,done=false;
  let ang=0,z0=Math.random()*Math.PI*2,bounce=0,shake=0,lp=[],raf=0,last=performance.now();
  const ov=el('div','catch');const box=el('div','cbox win');ov.append(box);
  box.innerHTML=`<div class="ctitle">${'★'.repeat(Math.min(sp.rare,5))} <b>${sp.name}</b> ${jobChip(sp.id)} ${S.dex[sp.id]==='c'?'<span class="own">なかま</span>':''}${w.enc&&w.enc.shiny?' <span class="own">✨いろちがい</span>':''}</div><canvas width="180" height="190"></canvas><div class="cmsg">ハートが みどりに かさなったら タップ！</div><div class="chits"></div><div class="cbtns"><button class="btn" id="cT"></button><button class="btn sub" id="cR">そっと はなれる</button></div>`;
  $('#overlay').append(ov);const cv=box.querySelector('canvas'),c=cv.getContext('2d');c.imageSmoothingEnabled=false;const msg=box.querySelector('.cmsg'),hb=box.querySelector('.chits'),bT=box.querySelector('#cT'),bR=box.querySelector('#cR');
  if(story)msg.textContent=`${sp.name}は こまっている みたい… やさしく なでてあげよう`;
  const shiny=!!(w.enc&&w.enc.shiny);const big=scaled(monSpr(sp.id,{shiny}).n,4),bigB=scaled(monSpr(sp.id,{shiny}).b,4),hrt=scaled(HEART,2);
  const bg={grass:['#7ccf5a','#5aaf4a'],flower:['#9fdc78','#ffb8d0'],water:['#6ac0f0','#3a90d8'],shore:['#8ad0a8','#5ab0e0'],tree:['#5aaa50','#3a7a3a'],sand:['#f6e2a6','#e8c880'],any:['#86d462','#6fc054'],plaza:['#e6c88e','#c9a46a']}[w.hab]||['#86d462','#6fc054'];
  const night=phaseOf()==='N';
  const drawHits=()=>{hb.innerHTML='';for(let i=0;i<need;i++)hb.append(el('span','hh'+(i<hits?' on':''),'♥'));};
  const updT=()=>{const ck=itemCount('cookie'),fk2=itemCount('feast');bT.disabled=treat>0||(ck+fk2===0);bT.textContent=treat?'おやつ あげた！':fk2&&!ck?`ごちそう（${fk2}）`:`おやつを あげる（${ck}）`;};
  drawHits();updT();
  function draw(dt){
   ang=(ang+spd*dt)%(Math.PI*2);bounce=Math.max(0,bounce-dt*3);shake=Math.max(0,shake-dt*2);
   const g=c.createLinearGradient(0,0,0,190);g.addColorStop(0,bg[0]);g.addColorStop(1,bg[1]);c.fillStyle=g;c.fillRect(0,0,180,190);
   c.fillStyle='rgba(255,255,255,0.18)';for(let i=0;i<14;i++){c.fillRect((i*37)%180,(i*53)%190,2,2);}
   if(night){c.fillStyle='rgba(16,20,56,0.35)';c.fillRect(0,0,180,190);}
   c.fillStyle='rgba(0,0,0,0.18)';c.beginPath();c.ellipse(90,140,34,8,0,0,Math.PI*2);c.fill();
   const cx=90,cy=98,R=72;
   c.lineWidth=9;c.strokeStyle='rgba(255,248,230,0.85)';c.beginPath();c.arc(cx,cy,R,0,Math.PI*2);c.stroke();
   c.strokeStyle=treat?'#ffc830':'#5cd06a';c.beginPath();c.arc(cx,cy,R,z0,z0+zone);c.stroke();
   c.lineWidth=2;c.strokeStyle='#3b2a20';c.beginPath();c.arc(cx,cy,R+5,0,Math.PI*2);c.stroke();c.beginPath();c.arc(cx,cy,R-5,0,Math.PI*2);c.stroke();
   const sx=Math.sin(G.t*60)*shake*4;const by=-Math.abs(Math.sin(bounce*Math.PI*2))*14;const bob=Math.floor(performance.now()/400)%2;
   c.drawImage((performance.now()%3000)<130?bigB:big,cx-48+sx,cy-50+by-bob);
   c.drawImage(hrt,Math.round(cx+Math.cos(ang)*R-hrt.width/2),Math.round(cy+Math.sin(ang)*R-hrt.height/2));
   for(let i=lp.length-1;i>=0;i--){const p=lp[i];p.t-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;c.globalAlpha=Math.max(0,p.t);c.drawImage(hrt,p.x,p.y);c.globalAlpha=1;if(p.t<=0)lp.splice(i,1);}
  }
  function frame(ts){const dt=Math.min(0.05,(ts-last)/1000);last=ts;draw(dt);if(!done||lp.length)raf=requestAnimationFrame(frame);}
  raf=requestAnimationFrame(frame);
  const finish=(ok)=>{done=true;bR.disabled=true;bT.disabled=true;cv.onpointerdown=null;
   setTimeout(()=>{if(ok){result();}else{msg.textContent=`${sp.name}は どこかへ いってしまった…`;Snd.sfx('miss');encResult(w,false);setTimeout(close,1300);}},ok?500:200);};
  const close=()=>{cancelAnimationFrame(raf);ov.remove();G.catching=false;G.lock--;w.frozen=false;updateBGM();};
  function result(){
   const isNew=S.dex[sp.id]!=='c';S.dex[sp.id]='c';const m=newMon(sp.id);if(shiny){m.shiny=true;S.shinyDex[sp.id]=1;}S.stats.caught++;if(isNew)addMemory(`${sp.name}と はじめて なかよしに なった${shiny?'（いろちがい！）':''}`,sp.id);
   if(!S.flags.pendFirstCatch&&!story)S.flags.pendFirstCatch=1;quest('catch');const inParty=joinCreature(m);encResult(w,true);
   Snd.jingle('fanfare');box.innerHTML='';const r=el('div','cres');r.append(monImgM(m,96));if(shiny)r.append(el('div','cnew','✨ いろちがい！ ✨'));
   r.append(el('div','crt',`<b>${sp.name}</b>と なかよくなった！`));if(isNew)r.append(el('div','cnew','ずかんに とうろく！ NEW'));
   r.append(el('div','cdesc',`とくいな しごと：${jobChip(sp.id)} ${JOBS[jobOf(sp.id)].desc}`));
   r.append(el('div','cdesc',inParty?'いっしょに ついてくるよ！':'いっしょに あるけるのは 3びきまで。 ぷちっこごやで まっているよ。'));
   const b=el('button','btn','やったね！');b.onclick=close;r.append(b);box.append(r);save();}
  cv.onpointerdown=(e)=>{e.preventDefault();if(done)return;
   const a=((ang-z0)%(Math.PI*2)+Math.PI*2)%(Math.PI*2);
   if(a<=zone||Q.has('debug')){hits++;Snd.sfx('hit');bounce=1;for(let i=0;i<5;i++)lp.push({x:80,y:80,vx:Math.random()*80-40,vy:-30-Math.random()*40,t:1});
    msg.textContent=['なでなで… うれしそう！','もう すこし！','いい かんじ！'][Math.min(2,hits-1)];drawHits();
    if(hits>=need){msg.textContent='こころを ひらいてくれた！';finish(true);return;}z0=Math.random()*Math.PI*2;if(!story)zone*=0.92;}
   else{miss++;Snd.sfx('miss');shake=1;msg.textContent=['びっくり させちゃった…','あせらず ゆっくり…','もう いちど…！'][Math.min(2,miss-1)];
    if(story)return;const flee=miss>=2?0.06*sp.rare*(treat?0.5:1):0;if(miss>=3||Math.random()<flee){finish(false);}}};
  bT.onclick=()=>{if(treat)return;let k=itemCount('cookie')?'cookie':itemCount('feast')?'feast':null;if(!k)return;takeItem(k);treat=1;zone+=(k==='feast'?45:25)*Math.PI/180;Snd.sfx('pet');
   msg.textContent=`${sp.name}は ${ITEMS[k].name}を たべた！ もぐもぐ`;for(let i=0;i<4;i++)lp.push({x:80,y:70,vx:Math.random()*60-30,vy:-30,t:0.8});updT();};
  bR.onclick=()=>{done=true;close();};
 }

 // ---------- evolve / hatch ----------
 function whenFree(fn){if(G.lock||!G.ready){setTimeout(()=>whenFree(fn),600);return;}fn();}
 function evolve(m){whenFree(()=>{
  G.lock++;const from=SP[m.sp],to=SP[from.evo];const ov=el('div','catch');const box=el('div','cbox win');ov.append(box);$('#overlay').append(ov);
  box.innerHTML=`<div class="ctitle">おや…？</div><canvas width="180" height="160"></canvas><div class="cmsg">${m.name}の ようすが…！</div>`;
  const cv=box.querySelector('canvas'),c=cv.getContext('2d');c.imageSmoothingEnabled=false;const lk=monLook(m);const A=scaled(monSpr(from.id,lk).n,4),B=scaled(monSpr(to.id,lk).n,4),As=scaled(monSpr(from.id,lk).s,4),Bs=scaled(monSpr(to.id,lk).s,4);
  let t=0,last=performance.now(),raf;Snd.sfx('star');
  const fr=(ts)=>{const dt=(ts-last)/1000;last=ts;t+=dt;c.fillStyle='#2a2040';c.fillRect(0,0,180,160);
   for(let i=0;i<20;i++){const a=i/20*Math.PI*2+t;const r=40+Math.sin(t*3+i)*20;c.fillStyle='rgba(255,240,160,0.7)';c.fillRect(90+Math.cos(a)*r,80+Math.sin(a)*r,2,2);}
   let im;if(t<3.2){const sp=4+t*6;im=(Math.floor(t*sp)%2)?As:Bs;}else im=B;
   if(t>=3.2&&t<3.5){c.fillStyle='#fff';c.fillRect(0,0,180,160);}else c.drawImage(im,90-48,80-50);
   if(t<4.2)raf=requestAnimationFrame(fr);else done();};
  raf=requestAnimationFrame(fr);
  function done(){Snd.jingle('evolve');const old=m.name;if(m.name===from.name)m.name=to.name;m.sp=to.id;m.evoPending=false;addMemory(`${old}が ${to.name}に しんかした`,to.id);const isNew=S.dex[to.id]!=='c';S.dex[to.id]='c';
   box.querySelector('.ctitle').innerHTML=`<b>${to.name}</b> ${jobChip(to.id)}`;box.querySelector('.cmsg').innerHTML=`${old}は <b>${to.name}</b>に しんかした！<br><span class="desc">しごとの ちからも つよく なった！</span>${isNew?'<br><span class="cnew">ずかんに とうろく！</span>':''}`;
   const b=el('button','btn','すごい！');b.onclick=()=>{ov.remove();G.lock--;placeParty();save();};box.append(b);}
 });}
 function hatch(id){whenFree(()=>{G.lock++;const sp=SP[id];const ov=el('div','catch');const box=el('div','cbox win');ov.append(box);$('#overlay').append(ov);
  box.innerHTML=`<div class="ctitle">たまごが…！</div><canvas width="180" height="150"></canvas><div class="cmsg">ぷちっこの たまごが うごいている！</div>`;
  const cv=box.querySelector('canvas'),c=cv.getContext('2d');c.imageSmoothingEnabled=false;const egg=scaled(itemIcon('egg'),4),B=scaled(monSpr(id).n,4);let t=0,last=performance.now();
  const fr=(ts)=>{const dt=(ts-last)/1000;last=ts;t+=dt;c.fillStyle='#fff3dc';c.fillRect(0,0,180,150);
   if(t<2.4){const w=Math.sin(t*20)*(t*2);c.save();c.translate(90,110);c.rotate(w*0.04);c.drawImage(egg,-40,-70);c.restore();requestAnimationFrame(fr);}
   else{c.drawImage(B,90-48,75-50);Snd.jingle('fanfare');const m=newMon(id,3);if(rollShiny()){m.shiny=true;S.shinyDex[id]=1;}const isNew=S.dex[id]!=='c';S.dex[id]='c';const inP=joinCreature(m);addMemory(`たまごから ${sp.name}が うまれた`,id);
    box.querySelector('.cmsg').innerHTML=`<b>${sp.name}</b>が うまれた！ ${jobChip(id)}${isNew?'<br><span class="cnew">ずかんに とうろく！</span>':''}${inP?'':'<br><span class="desc">ぷちっこごやで まっているよ</span>'}`;const b=el('button','btn','よろしくね！');b.onclick=()=>{ov.remove();G.lock--;save();};box.append(b);}};
  requestAnimationFrame(fr);Snd.sfx('pop');});}

 // ---------- bag ----------
 function bag(tab='item'){
  panel('もちもの',body=>{
   const tabs=el('div','tabs');[['item','どうぐ'],['furn','かぐ']].forEach(([k,l])=>{const b=el('button','tab'+(k===tab?' on':''),l);b.onclick=()=>{closePanel(true);lastClose=null;bag(k);};tabs.append(b);});body.append(tabs);
   body.append(el('div','money',`<img class="px" src="${url('ui_coin',()=>uiIcon('coin'))}" width="16"> ${S.coins.toLocaleString()} ポカ`));
   const keys=Object.keys(S.items).filter(k=>ITEMS[k]&&(tab==='furn'?ITEMS[k].cat==='furn':ITEMS[k].cat!=='furn'));
   if(S.eggs.length&&tab==='item'){const e=S.eggs[0];const rem=Math.max(0,6*3600000-(Date.now()-e.t));body.append(el('div','note',`🥚 あたためちゅうの たまご：${S.eggs.length}こ（あと ${Math.ceil(rem/60000)}ふん）`));}
   if(!keys.length){body.append(el('div','empty',tab==='furn'?'かぐは まだ ないよ。 にゃんこしょうてんで かえるよ。':'からっぽ'));return;}
   const grid=el('div','igrid');const info=el('div','info');
   keys.forEach(k=>{const it=ITEMS[k];const c=el('button','icell');c.append(iconOf(k));c.append(el('span','cnt',S.items[k]));
    c.onclick=()=>{grid.querySelectorAll('.icell').forEach(x=>x.classList.remove('sel'));c.classList.add('sel');info.innerHTML=`<b>${it.name}</b>　×${S.items[k]}<br><span class="desc">${it.desc||''}</span>${it.sell?`<br><span class="desc">うると ${it.sell}ポカ</span>`:''}`;
     if(k==='egg'){const b=el('button','btn','あたためる');b.onclick=()=>{takeItem('egg');S.eggs.push({t:Date.now()});toast('たまごを あたためはじめた。 6じかんくらいで うまれそう！','egg');closePanel();};info.append(b);}
    };grid.append(c);});
   body.append(grid,info);
  });
 }

 // ---------- nakama ----------
 function monRow(m,extra){const sp=SP[m.sp];const r=el('div','mrow');r.append(monImgM(m,40));
  r.append(el('div','minfo',`<b>${m.name}</b> ${jobChip(m.sp)} Lv${monLv(m)} <span class="desc">${perData(m).jp}</span><br><span class="hearts">${heartsStr(m)}</span> <span class="desc">げんき ${Math.max(0,enLeft(m))}/${enMax(m)}</span>`));
  if(extra)r.append(extra);return r;}
 function nakama(){
  panel('なかま',body=>{
   if(!S.creatures.length){body.append(el('div','empty','まだ なかまが いないよ。'));return;}
   body.append(el('div','note',`いっしょに あるく なかま（${S.party.length}/3）`));
   const list=el('div','mlist');partyMons().forEach(m=>{const r=monRow(m);r.onclick=()=>monDetail(m);list.append(r);});body.append(list);
   const rest=S.creatures.filter(m=>!S.party.includes(m.uid));
   if(rest.length){body.append(el('div','note',`ぷちっこごやで やすんでいる なかま（${rest.length}）`));const l2=el('div','mlist');rest.forEach(m=>{const r=monRow(m);r.onclick=()=>monDetail(m);l2.append(r);});body.append(l2);}
   body.append(el('div','desc','つれていく なかまは、 いえの ひだりの ぷちっこごやで いれかえられるよ。'));});
 }
 function monDetail(m,back){const sp=SP[m.sp];const j=JOBS[jobOf(m.sp)];panel(m.name,body=>{
  const top=el('div','mdet');top.append(monImgM(m,96));top.append(el('div','minfo',`<b>${sp.name}</b>${m.shiny?' <span class="own">✨いろちがい</span>':''} ${typeChip(sp.type)}<br>しごと：${jobChip(m.sp)}<br>レベル ${monLv(m)}　<span class="hearts">${heartsStr(m)}</span>`));body.append(top);
  const days=Math.floor((Date.now()-(m.got||Date.now()))/86400000);const P=perData(m);
  body.append(el('div','info',`<b>せいかく</b>：<span class="tchip" style="background:${P.col}">${P.jp}</span><br><span class="desc">${P.desc}</span><br><b>だいこうぶつ</b>：${m.favKnown?ITEMS[favOf(m)].name:'？？？<span class="desc">（なかよく なると おしえてくれるかも）</span>'}<br><span class="desc">いっしょに すごして ${days+1}にちめ</span>`));
  body.append(el('div','info',`<b>${j.jp}</b>：${j.desc}<br><span class="desc">${jobPower(m)}</span>${Mist.strongVs(m)?`<br><span class="desc">きりの よるに つよい あいて：${Mist.strongVs(m)}</span>`:''}`));
  const nx=expNext(m);body.append(el('div','desc',nx?`つぎの レベルまで あと ${nx-m.exp}（しごと・なでる・ごはんで ふえる）`:'レベル さいだい！'));
  if(nx){const prev=3*(monLv(m)-1)*monLv(m);body.append(el('div','bar xp',`<div style="width:${Math.round((m.exp-prev)/(nx-prev)*100)}%"></div>`));}
  body.append(el('div','desc',`げんき ${Math.max(0,enLeft(m))}/${enMax(m)}　（しごとで へって、 ごはんで もどる。 まいあさ ぜんかい）`));
  if(sp.evo)body.append(el('div','info',`<b>しんか</b>：レベル${EVO_LV}いじょう ＆ なかよし ♥${Math.ceil(EVO_AFF/3)}つ いじょう<br><span class="desc">いま レベル${monLv(m)}・♥${affHearts(m)}つ</span>`));
  body.append(el('div','info',sp.desc));
  const wb=el('button','btn gold','きせかえ');wb.onclick=()=>{UI.closePanel(true);SUI.monWear(m,()=>monDetail(m,back));};body.append(wb);
  const rn=el('button','btn','なまえを かえる');rn.onclick=async()=>{const nm=await nameInput(m.name,`${m.name}の あたらしい なまえ`);if(nm&&nm!==m.name){m.name=nm;save();Snd.sfx('pop');toast(`これからは「${nm}」だね！`,m.sp);}closePanel(true);monDetail(m,back);};body.append(rn);
  const b2=el('button','btn sub','もどる');b2.onclick=()=>{closePanel(true);(back||nakama)();};body.append(b2);});}
 function nameInput(def,label){return new Promise(res=>{G.lock++;const ov=el('div','catch');const box=el('div','cbox win create');ov.append(box);
  box.innerHTML=`<div class="ctitle">${label}</div><label><input maxlength="6"></label><div class="desc">6もじ まで</div>`;const inp=box.querySelector('input');inp.value=def;
  const ok=el('button','btn gold','けってい');const cn=el('button','btn sub','やめる');box.append(ok,cn);$('#overlay').append(ov);
  const done=v=>{ov.remove();G.lock--;res(v);};ok.onclick=()=>done(inp.value.trim().slice(0,6)||null);cn.onclick=()=>done(null);});}
 function jobPower(m){const lv=monLv(m);switch(jobOf(m.sp)){
  case 'till':return `いちどに ${lv>=7?3:lv>=4?2:1}マス たがやせる（Lv4で 2マス・Lv7で 3マス）`;
  case 'water':return `いちどに ${lv>=7?9:lv>=4?5:1}マスに みずを まける（Lv4で 5マス・Lv7で 9マス）`;
  case 'chop':return `もくざいが ${1+(lv>=4?1:0)+(lv>=7?1:0)}こ とれる（Lv4・Lv7で ふえる）`;
  case 'smash':return `いわを 1にち ${lv>=5?4:3}かい われる。 Lv4で いしが ふえて、 Lv5から かせきも でる`;
  case 'fire':return 'つれていると さぎょうだいで りょうりが できる。 よるの みちも あかるい';
  case 'wind':return `くだものが ${lv>=5?4:3}こ おちる。 たねや えだも おちやすい`;
  case 'seek':return 'つれていると、 かくれた ひかる じめんが みえるように なる';}return '';}

 // ---------- hut ----------
 function hut(){
  panel('ぷちっこごや',body=>{
   body.append(el('div','note',`いっしょに あるく なかま（${S.party.length}/3）`));
   const l1=el('div','mlist');partyMons().forEach(m=>{const b=el('button','btn sub','やすませる');b.disabled=S.party.length<=1;b.onclick=e=>{e.stopPropagation();S.party=S.party.filter(u=>u!==m.uid);placeParty();fixTool();hud();Snd.sfx('tap');closePanel(true);hut();};
    const r=monRow(m,b);r.onclick=()=>monDetail(m,hut);l1.append(r);});body.append(l1);
   const rest=S.creatures.filter(m=>!S.party.includes(m.uid));
   body.append(el('div','note',`こやで やすんでいる なかま（${rest.length}）`));
   if(!rest.length)body.append(el('div','desc','いまは だれも いないよ。'));
   const l2=el('div','mlist');rest.forEach(m=>{const b=el('button','btn','つれていく');b.disabled=S.party.length>=3;b.onclick=e=>{e.stopPropagation();S.party.push(m.uid);placeParty();hud();Snd.sfx('pop');toast(`${m.name}が ついてくる！`,m.sp);closePanel(true);hut();};
    const r=monRow(m,b);r.onclick=()=>monDetail(m,hut);l2.append(r);});body.append(l2);
   if(S.party.length>=3&&rest.length)body.append(el('div','desc','3びき つれているときは、 さきに だれかを やすませてね。'));
  });
 }

 // ---------- craft ----------
 function craft(){
  panel('さぎょうだい',body=>{
   if(!S.recipes.length){body.append(el('div','empty','まだ レシピを しらないみたい。'));return;}
   const fire=hasJob('fire');body.append(el('div','note',fire?'🔥 ほのおの なかまが いるから りょうりも できるよ':'りょうりには ほのおの なかま（かまど）が ひつよう'));
   const list=el('div','slist');
   S.recipes.forEach(id=>{const R=RECIPES[id];const out=ITEMS[R.out];const r=el('div','srow');r.append(iconOf(R.out));
    const ok=Object.keys(R.need).every(k=>itemCount(k)>=R.need[k])&&(!R.fire||fire);
    const need=Object.keys(R.need).map(k=>`<span class="${itemCount(k)>=R.need[k]?'ok':'ng'}">${ITEMS[k].name}${itemCount(k)}/${R.need[k]}</span>`).join('　');
    r.append(el('div','sname',`${out.name}${R.n>1?' ×'+R.n:''}${R.fire?' 🔥':''}<br><span class="desc">${need}</span>`));
    const b=el('button','btn','つくる');b.disabled=!ok;b.onclick=async()=>{for(const k in R.need)takeItem(k,R.need[k]);let bonus=0;if(R.fire){closePanel(true);bonus=await Mini.cook(R);}addItem(R.out,(R.n||1)+bonus);S.stats.crafted++;Snd.sfx('craft');quest('craft');storyEvent('craft',1);
     if(R.fire){const f=bestWorker('fire');if(f){gainExp(f.mon,3);f.e.jump=0.45;}}
     toast(`${out.name}が できた！`,R.out);closePanel(true);craft();save();};r.append(b);list.append(r);});
   body.append(list);
   body.append(el('div','desc','レシピは、 むらの ひとと なかよく なったり、 てがみで おしえて もらえる ことが あるよ。'));
  });
 }

 // ---------- dex ----------
 function dex(){
  panel('ずかん',body=>{
   const tabs=el('div','tabs');[['mon','ぷちっこ'],['fish','さかな'],['bug','むし'],['flower','はな']].forEach(([k,l])=>{const b=el('button','tab'+(k===(UI._dexTab||'mon')?' on':''),l);b.onclick=()=>{UI._dexTab=k;closePanel(true);lastClose=null;dex();};tabs.append(b);});body.append(tabs);
   if(UI._dexTab&&UI._dexTab!=='mon'){Mini.dexTab(body,UI._dexTab);return;}
   const cc=caughtCount();body.append(el('div','note',`なかよし ${cc} / ${SPECIES.length}　みかけた ${SPECIES.filter(s=>S.dex[s.id]).length}`));
   const g=el('div','dgrid');
   SPECIES.forEach(sp=>{const st=S.dex[sp.id];const c=el('button','dcell'+(st==='c'?' got':''));c.append(el('span','dno','No.'+String(sp.no).padStart(2,'0')));
    if(st)c.append(monImg(sp.id,40,st!=='c'));else c.append(el('div','unk','？'));c.append(el('span','dnm',(S.shinyDex&&S.shinyDex[sp.id]?'✨':'')+(st?sp.name:'？？？')));
    c.onclick=()=>dexDetail(sp);g.append(c);});body.append(g);});
 }
 function hint(sp){if(sp.rare===0)return `${SP[sp.from].name}が なかよく なると…？`;if(sp.rare===5)return 'なかまが 20しゅるい いじょうに なると…';
  const t=sp.time==='*'?'いつでも':sp.time.split('').map(x=>TIME_JP[x]).join('・');const s=sp.season==='*'?'':sp.season.split(',').map(x=>SEASON_JP[x]).join('・')+'の ';const w=sp.weather==='*'?'':sp.weather==='clear'?'はれた ':WEATHER_JP[sp.weather]+'の ひの ';
  return `${s}${w}${t}　${HAB_JP[sp.hab]}`;}
 function dexDetail(sp){const st=S.dex[sp.id];panel('No.'+String(sp.no).padStart(2,'0'),body=>{
  const top=el('div','mdet');top.append(st?monImg(sp.id,96,st!=='c'):el('div','unk big','？'));
  top.append(el('div','minfo',st?`<b>${sp.name}</b> ${typeChip(sp.type)} ${jobChip(sp.id)}<br>${'★'.repeat(Math.max(1,Math.min(5,sp.rare||2)))}`:'<b>？？？</b>'));body.append(top);
  body.append(el('div','info',st==='c'?sp.desc:'まだ なかよく なっていない。'));
  body.append(el('div','info',`<b>であえる ばしょ</b><br>${st||sp.rare===0||sp.rare===5?hint(sp):'？？？'}`));
  const b=el('button','btn sub','もどる');b.onclick=()=>{closePanel(true);dex();};body.append(b);});}

 // ---------- quests ----------
 function questPanel(){
  panel('けいじばん',body=>{
   const d=S.daily;
   if(S.story<STORY_DONE){const st=STORY[S.story];const r=el('div','qrow story');r.innerHTML=`<div class="qt">📜 そんちょうの おねがい</div><div class="desc">${S.storyReady?'たっせい！ ひろばの やくばの まえに いる ハルさんに ほうこくしよう。':fmt(st.hint)}</div>`+(st.goal!=='befriend'&&!S.storyReady?`<div class="qs">${Math.min(S.storyP,st.n)}/${st.n}</div>`:'');body.append(r);}
   const asks=Story.pendingAsks();if(asks.length){body.append(el('div','note','むらの ひとの たのみごと'));asks.forEach(a=>{const r=el('div','qrow story');r.innerHTML=`<div class="qt">${a.v.name}</div><div class="desc">${a.t}${a.ok?'　<b class="ok">じゅんび OK！ はなしかけよう</b>':''}</div>`;body.append(r);});}
   body.append(el('div','note','きょうの おねがい（まいあさ かわるよ）'));
   d.quests.forEach(q=>{const r=el('div','qrow'+(q.claimed?' done':''));const pct=Math.round(q.p/q.n*100);
    r.innerHTML=`<div class="qt">${q.t}</div><div class="bar"><div style="width:${pct}%"></div></div><div class="qs">${q.p}/${q.n}　ほうしゅう ${q.r}ポカ＋クッキー</div>`;
    if(q.p>=q.n&&!q.claimed){const b=el('button','btn','うけとる');b.onclick=()=>{q.claimed=true;addCoins(q.r);addItem('cookie');Snd.sfx('coin');toast(`${q.r}ポカと クッキーを もらった！`,'coin');closePanel(true);questPanel();};r.append(b);}
    else if(q.claimed)r.append(el('div','stampok','たっせい！'));body.append(r);});
   if(d.quests.every(q=>q.claimed)&&!d.bonus){const b=el('button','btn gold','ぜんぶ たっせい ボーナス！');b.onclick=()=>{d.bonus=true;addCoins(300);addItem('feast');Snd.jingle('fanfare');toast('300ポカと ごちそうクッキー！','feast');const pm=partnerMon();setTimeout(()=>say(pm?`${pm.name}「きょうも いっぱい がんばったね！ また あした あそぼうね！」`:'きょうの おねがいは ぜんぶ おわり！ また あした ね。',pm?{name:pm.name,por:monImgM(pm,56)}:{}),600);closePanel(true);questPanel();};body.append(b);}
   body.append(el('div','note','スタンプカード（むらで すごした ひに 1こ）'));
   body.append(stampCard());});
 }
 function stampCard(){const card=el('div','stamps');const idx=(S.stamps-1)%7;
  STAMP_REWARDS.forEach((r,i)=>{const c=el('div','stamp'+(i<idx||(i===idx&&S.daily.stampTaken)?' on':'')+(i===idx?' today':''));c.innerHTML=`<span class="sd">${i+1}</span><span class="sr">${r.t}</span>`;card.append(c);});return card;}

 // ---------- mail ----------
 function mailPanel(){
  panel('ポスト',body=>{
   if(!S.mails.length){body.append(el('div','empty','てがみは まだ ないよ'));return;}
   S.mails.forEach(m=>{const r=el('button','mail'+(m.read?'':' new'));const ic=m.from==='mom'?'💌':m.from==='dad'?'📦':'✉';
    r.innerHTML=`<span class="mic">${ic}</span><span><b>${m.sender}</b> より<br><span class="desc">${m.day.replace(/^\d+-/,'').replace('-','/')}${m.read?'':'　NEW'}${(m.gift||m.coins||m.recipe)&&!m.taken?'　🎁':''}</span></span>`;
    r.onclick=()=>readMail(m);body.append(r);});});
 }
 function readMail(m){m.read=true;hud();Snd.jingle('mail');panel(`${m.sender}からの てがみ`,body=>{
  const paper=el('div','paper'+(m.from==='dad'?' dad':''));paper.textContent=fmt(m.body);body.append(paper);
  if((m.gift||m.coins||m.recipe)&&!m.taken){const box=el('div','giftbox');const parts=[];
   if(m.gift){box.append(iconOf(m.gift));parts.push(`${ITEMS[m.gift].name}${m.n>1?' ×'+m.n:''}`);}else if(m.coins){box.append(iconOf('coin'));}
   if(m.coins)parts.push(`${m.coins}ポカ`);if(m.recipe){if(!m.gift)box.append(iconOf('recipe'));parts.push(`レシピ：${ITEMS[RECIPES[m.recipe].out].name}`);}
   box.append(el('span',null,parts.join('<br>')));
   const b=el('button','btn','うけとる');b.onclick=()=>{m.taken=true;if(m.gift)addItem(m.gift,m.n||1);if(m.coins)addCoins(m.coins);if(m.recipe)learnRecipe(m.recipe);Snd.sfx('get');toast('てがみの おくりものを うけとった！',m.gift||(m.recipe?'recipe':'coin'));closePanel(true);readMail(m);};box.append(b);body.append(box);}
  else if(m.gift||m.coins||m.recipe)body.append(el('div','desc','おくりものは うけとりずみ'));
  const b=el('button','btn sub','もどる');b.onclick=()=>{closePanel(true);mailPanel();};body.append(b);save();});}

 // ---------- shop ----------
 async function shop(){
  G.shopOpen=true;updateBGM();const o={name:SHOPKEEPER.name,por:vilPor('shop'),pitch:SHOPKEEPER.pitch};
  const ph=phaseOf();await say({M:'いらっしゃいませ！ あさいちばんの おきゃくさまね。',D:'いらっしゃいませ！ ゆっくり みていってね。',E:'いらっしゃいませ。 ゆうがたは かぐが よく うれるのよ。',N:'あら、いらっしゃい。 よるも あけてるの。 ねこたちが よふかしだから。'}[ph],o);
  shopPanel('buy');
 }
 function shopPanel(tab){
  panel('にゃんこしょうてん',body=>{
   const tabs=el('div','tabs');[['buy','かう'],['style','ふく・こもの'],['sell','うる']].forEach(([k,l])=>{const b=el('button','tab'+(k===tab?' on':''),l);b.onclick=()=>{closePanel(true);lastClose=null;shopPanel(k);};tabs.append(b);});body.append(tabs);
   body.append(el('div','money',`<img class="px" src="${url('ui_coin',()=>uiIcon('coin'))}" width="16"> ${S.coins.toLocaleString()} ポカ`));
   const d=S.daily;const list=el('div','slist');
   const row=(key,name,price,onAct,label,sale)=>{const r=el('div','srow');r.append(iconOf(key));r.append(el('div','sname',`${name}${sale?'<span class="sale">2わりびき</span>':''}<br><span class="desc">${price}ポカ</span>`));const b=el('button','btn',label);b.onclick=onAct;r.append(b);list.append(r);return b;};
   if(tab==='buy'){
    ['cookie','feast','seed_sun','seed_straw','seed_pump','seed_tulip_r','seed_tulip_y','seed_tulip_w'].concat(itemCount('rod')?[]:['rod']).forEach(k=>{const it=ITEMS[k];const b=row(k,it.name,it.buy,()=>{if(S.coins<it.buy){toast('ポカが たりないみたい…');return;}addCoins(-it.buy);addItem(k);Snd.sfx('buy');toast(`${it.name}を かった！`,k);closePanel(true);shopPanel('buy');},'かう');b.disabled=S.coins<it.buy;});
    list.append(el('div','note','きょうの おもちゃ'));
    (d.toys||[]).forEach(f=>{const F=FURN[f];const b=row('f_'+f,F.name,F.price,()=>{if(S.coins<F.price){toast('ポカが たりないみたい…');return;}addCoins(-F.price);addItem('f_'+f);Snd.sfx('buy');toast(`${F.name}を かった！ おうちに おくと ぷちっこが あそぶよ`,'f_'+f);closePanel(true);shopPanel('buy');},'かう');b.disabled=S.coins<F.price;});
    list.append(el('div','note','きょうの かぐ'));
    d.stock.forEach(f=>{const F=FURN[f];const pr=f===d.sale?Math.floor(F.price*0.8):F.price;const b=row('f_'+f,F.name,pr,()=>{if(S.coins<pr){toast('ポカが たりないみたい…');return;}addCoins(-pr);addItem('f_'+f);Snd.sfx('buy');toast(`${F.name}を かった！ おうちで かざろう`,'f_'+f);closePanel(true);shopPanel('buy');},'かう',f===d.sale);b.disabled=S.coins<pr;});
   }else if(tab==='style'){
    const buyIt=(key,name,pr,msg,own)=>{const b=row(key,name,pr,()=>{if(S.coins<pr){toast('ポカが たりないみたい…');return;}addCoins(-pr);addItem(key);Snd.sfx('buy');toast(msg,key);closePanel(true);shopPanel('style');},own?'もってる':'かう');b.disabled=own||S.coins<pr;};
    list.append(el('div','note','きょうの ふく'));(d.clothes||[]).forEach(k=>{if(k.startsWith('o_')){const O=OUTFITS[k.slice(2)];buyIt(k,O.name,O.price,`${O.name}を かった！ おうちの「きがえ」で きてみよう`,itemCount(k)>0);}else{const H=HATS[k.slice(2)];buyIt(k,H.name,H.price,`${H.name}を かった！ おうちの「きがえ」で つけてみよう`,itemCount(k)>0);}});
    list.append(el('div','note','ぷちっこの こもの'));(d.wears||[]).forEach(k=>{const W=WEAR[k];buyIt('w_'+k,W.name,W.price,`${W.name}を かった！「なかま」から つけてあげよう`);});
    list.append(el('div','note','かべがみ・ゆか'));(d.surf||[]).forEach(k=>{const it=ITEMS[k];const pr=(k.startsWith('wp_')?WALLS:FLOORS)[k.slice(3)].price;buyIt(k,it.name,pr,`${it.name}を かった！「もようがえ」で はりかえよう`);});
   }else{
    const keys=Object.keys(S.items).filter(k=>ITEMS[k]&&ITEMS[k].sell);if(!keys.length)list.append(el('div','empty','うれる ものが ないみたい'));
    keys.forEach(k=>{const it=ITEMS[k];const r=el('div','srow');r.append(iconOf(k));r.append(el('div','sname',`${it.name} ×${S.items[k]}<br><span class="desc">1こ ${it.sell}ポカ</span>`));
     const b1=el('button','btn','1こ');b1.onclick=()=>{takeItem(k);addCoins(it.sell);quest('sell');Snd.sfx('coin');closePanel(true);shopPanel('sell');};r.append(b1);
     if(S.items[k]>1&&it.cat!=='furn'){const b2=el('button','btn','ぜんぶ');b2.onclick=()=>{const n=S.items[k];takeItem(k,n);addCoins(it.sell*n);quest('sell',n);Snd.sfx('coin');toast(`${it.sell*n}ポカに なった！`,'coin');closePanel(true);shopPanel('sell');};r.append(b2);}
     list.append(r);});
   }
   body.append(list);
  },{onClose:()=>{G.shopOpen=false;updateBGM();say('ありがとう！ また きてね〜',{name:SHOPKEEPER.name,por:vilPor('shop'),pitch:SHOPKEEPER.pitch});}});
 }

 // ---------- fountain ----------
 async function fountain(){const d=S.daily;
  const ch=await say('きれいな ふんすい。 コインを なげいれる？（10ポカ）',{choices:['なげる','やめる']});if(ch!==0)return;
  if(S.coins<10){say('ポカが たりない…');return;}addCoins(-10);Snd.sfx('coin');puff(FOUNTAIN[0]*TS+16,FOUNTAIN[1]*TS+14,'#9ad8ff');d.fountain++;
  const r=Math.random();if(d.fountain<=3&&r<0.15){addItem('starbit');toast('みずの なかが ひかった… ほしのかけら！','starbit');Snd.sfx('star');}
  else if(d.fountain<=3&&r<0.45){addItem('cookie');toast('ふしぎ… クッキーが うかんできた！','cookie');}
  else toast('ぽちゃん。 なんだか いいことが ありそう');Story.tryKakera('fountain');}

 // ---------- house ----------
 function houseMode(on){$('#houseBar').classList.toggle('hidden',!on);document.body.classList.toggle('inhouse',on);if(!on&&UI.decor)decorToggle();}
 function decorToggle(){UI.decor=!UI.decor;UI.decorSel=null;$('#btnDecor').textContent=UI.decor?'おわる':'もようがえ';$('#decor').classList.toggle('hidden',!UI.decor);
  if(UI.decor){drawDecor();toast('かぐを えらんで ゆかを タップ。 かべがみ・ゆかは えらぶだけで はりかわるよ');}else save();}
 function drawDecor(){const box=$('#decorList');box.innerHTML='';const sb=el('button','icell ser','シリーズ');sb.onclick=()=>SUI.series();box.append(sb);const keys=Object.keys(S.items).filter(k=>['furn','wall','floor'].includes(ITEMS[k].cat));
  if(!keys.length)box.append(el('div','desc','もっている かぐが ないよ'));
  keys.forEach(k=>{const b=el('button','icell'+(UI.decorSel===k?' sel':''));b.append(iconOf(k));b.append(el('span','cnt',S.items[k]));b.onclick=()=>{if(ITEMS[k].cat!=='furn'){applySurface(k);drawDecor();return;}UI.decorSel=UI.decorSel===k?null:k;drawDecor();};box.append(b);});}
 function canPlace(tx,ty,key=UI_decor.sel){if(!key)return false;const id=ITEMS[key].furn;const F=FURN[id];const w=F.w||1,h=F.h||1;
  if(tx<0||ty<2||tx+w>ROOM_W||ty+h>ROOM_H)return false;
  if(F.floor){return !S.furniture.some(f=>FURN[f.id].floor&&[...Array(w*h)].some((_,i)=>covers(f,tx+i%w,ty+Math.floor(i/w))));}
  if(G.player.tx>=tx&&G.player.tx<tx+w&&G.player.ty>=ty&&G.player.ty<ty+h)return false;return fitsAt(id,tx,ty,S.furniture);}
 function decorTap(tx,ty){if(ty<2||ty>=ROOM_H||tx<0||tx>=ROOM_W)return;const f=furnAt(tx,ty);
  if(UI_decor.sel){if(canPlace(tx,ty)){const id=ITEMS[UI_decor.sel].furn;takeItem(UI_decor.sel);S.furniture.push({id,x:tx,y:ty});Snd.sfx('pop');checkSeries(true);puff(tx*TS+8,ty*TS+8,'#fff6a0',6);if(!itemCount(UI_decor.sel))UI_decor.sel=null;drawDecor();return;}
   if(!f){toast('そこには おけないよ');return;}}
  if(f){S.furniture.splice(S.furniture.indexOf(f),1);addItem('f_'+f.id);Snd.sfx('close');toast(`${FURN[f.id].name}を しまった`,'f_'+f.id);drawDecor();}}

 // ---------- menu ----------
 function menu(){
  panel('メニュー',body=>{
   const sv=el('button','btn gold','💾 セーブする');sv.onclick=()=>{save();Snd.sfx('coin');closePanel(true);say('セーブしたよ！ このまま アプリを とじても だいじょうぶ。 つぎに ひらくと つづきから あそべるよ。\n（ふだんも じどうで こまめに セーブ しているよ）');};body.append(sv);
   const t=(label,on,fn)=>{const r=el('div','srow');r.append(el('div','sname',label));const b=el('button','btn'+(on?'':' sub'),on?'ON':'OFF');b.onclick=()=>{fn();closePanel(true);menu();};r.append(b);body.append(r);};
   t('BGM（おんがく）',S.opt.bgm,()=>{Snd.init();S.opt.bgm=!S.opt.bgm;Snd.setBGM(S.opt.bgm);updateBGM();save();});
   t('こうかおん',S.opt.sfx,()=>{Snd.init();S.opt.sfx=!S.opt.sfx;Snd.setSFX(S.opt.sfx);Snd.sfx('tap');save();});
   const cyc=(label,val,fn)=>{const r=el('div','srow');r.append(el('div','sname',label));const b=el('button','btn',val);b.onclick=()=>{fn();};r.append(b);body.append(r);};
   cyc('がめんの おおきさ',['ふつう','おおきい','もっと おおきい'][S.opt.zoom==null?1:S.opt.zoom],()=>{S.opt.zoom=((S.opt.zoom==null?1:S.opt.zoom)+1)%3;save();resize();closePanel(true);menu();});
   cyc('もじ',['ひらがな','かんじ＋ふりがな','かんじ'][S.opt.kanji||0],()=>{S.opt.kanji=((S.opt.kanji||0)+1)%3;save();location.reload();});
   cyc('ねる まえ モード',{auto:'じどう（22じ〜）',on:'いつも',off:'つかわない'}[S.opt.calm||'auto'],()=>{const o=['auto','on','off'];S.opt.calm=o[(o.indexOf(S.opt.calm||'auto')+1)%3];save();Calm.tick();closePanel(true);menu();});
   const s=el('div','info',`<b>${S.name}</b>　なかま ${S.creatures.length}ひき　ずかん ${caughtCount()}/${SPECIES.length}<br>あそんだ ひ ${S.stamps}にち　あるいた ${S.stats.steps}ほ`);body.append(s);
   const vb=el('button','btn','🏡 むらづくり');vb.onclick=()=>{closePanel(true);Village.start();};body.append(vb);
   const mm=el('button','btn','📖 おもいで');mm.onclick=()=>{closePanel(true);Village.memories();};body.append(mm);
   const cal=el('button','btn','📅 カレンダー');cal.onclick=()=>{closePanel(true);Story.calendar();};body.append(cal);
   const al=el('button','btn','📷 アルバム');al.onclick=()=>{closePanel(true);SUI.album();};body.append(al);
   const h=el('button','btn','あそびかた');h.onclick=()=>{closePanel(true);help();};body.append(h);
   const a=el('button','btn sub','ホームがめんに ついか するには');a.onclick=()=>say('ブラウザの メニュー（きょうゆう ボタン）から「ホームがめんに ついか」を えらぶと、 アプリの ように あそべるよ。');body.append(a);
   const r=el('button','btn danger','データを けす');r.onclick=async()=>{closePanel();const c=await say('ほんとうに データを けす？ もとに もどせないよ。',{choices:['けさない','けす']});if(c===1){const c2=await say('ほんとうの ほんとうに？',{choices:['やっぱり やめる','けす']});if(c2===1){localStorage.removeItem(SAVE_KEY);location.reload();}}};body.append(r);
  });
 }
 function help(){panel('あそびかた',body=>{body.append(el('div','info help',[
  '👆 タップした ところへ あるくよ。 ながおしで ゆびに ついてくる。',
  '🐾 ぷちっこは それぞれ とくいな しごとが あるよ。 たがやす・みずやり・きを きる・いわを わる・かまど・ゆらす・さがしもの。',
  '🌱 したの「しごと」ボタンで「たがやす」「きを きる」を えらんで、 じめんや もりの きを タップ。 はたけは タップで たねを うえる・みずやり・しゅうかく。 いわは タップするだけで わってくれるよ。',
  '⭐ しごとを すると ぷちっこの レベルが あがって、 しごとが つよく なる。 なかよく なると しんかする ことも。',
  '🍎 しごとを すると げんきが へるよ。 くだものや りょうりを あげると もどる。 まいあさ ぜんかい。',
  '🏠 いっしょに あるけるのは 3びきまで。 いえの ひだりの ぷちっこごやで いれかえよう。',
  '🔨 いえの さぎょうだいで もくざいや いしから かぐや りょうりが つくれるよ。',
  '🕐 じかん・てんき・きせつで むらに やってくる ぷちっこが かわるよ。 しんぶんの うわさを チェック！',
  '💌 いえの ポストには おかあさんから てがみが とどくよ。 おとうさんからも ときどき…？',
  '📋 ひろばの けいじばんで まいにちの おねがいを こなそう。',
  '💬 ぷちっこを タップして「おはなし」すると、 その こ らしい はなしを してくれるよ。 なかよく なると だいこうぶつも おしえてくれる。 なまえは「なかま」から かえられるよ。',
  '🧸 おうちに おもちゃや ベッドを おくと、 ぷちっこたちが じぶんの すきな ように あそぶよ。 こやの こたちも あそびに くる。 よるは ベッドで いっしょに ねよう。',
  '👗 おうちの「きがえ」で ふく・かみがた・ぼうしを かえられるよ。 ぷちっこには「なかま」から こものや スカーフの いろを えらんであげよう。',
  '📷 みぎの カメラ ボタンで みんなで しゃしん。 フレームや スタンプで かざって、 アルバムや スマホに ほぞん できるよ。',
  '🏠 そんちょうの ハルさんに たのむと、 おうちを ひろく できるよ。 かぐを シリーズで そろえると ボーナスも。',
  '🎣 つりざおを もって みずべを タップすると つり。 うきが しずんだ しゅんかんに タップ！ ひかる むしは タップで つかまえられるよ。',
  '🌷 のはなは となりに たって タップで つめる。 はたけの チューリップは、 ちがう いろを となりに うえると めずらしい たねが とれる ことも。',
  '🍳 かまどの ぷちっこと りょうりを すると ミニゲーム。 パンじろうさんの おみせの おてつだいや、 ぷちっこと かくれんぼも できるよ。',
  '🏡 メニューの「むらづくり」で、 つくった ベンチや はなだんを そとに おけるよ。 やくばは しりょうかん。 かせきや さかな、 むしを きぞうしよう。 ハルさんに きくと むらの ひょうかが わかるよ。',
  '🌫 ときどき よるに きりが でて、 きりもやが あらわれるよ。 ぷちっこと タップして はらおう。 タイプが あうと いっぱつ。 ほうっておいても あさには きえるから だいじょうぶ。 はたけの あおむしも タップで もりへ かえしてあげよう。',
  '💾 セーブは じどうで されるよ。 メニューの「セーブする」でも できる。 やめる ときは そのまま アプリや ブラウザを とじて だいじょうぶ。',
  '🥐 パンじろうさんに はなしかけると、 パンやさんの おみせばんが できるよ。 ちゅうもんの パンを えらんで、 きんいろに やいて、 ふくろか はこで わたそう。',
  '🎋 しんぶんの おみくじで きょうの うんせいと ラッキーぷちっこが わかるよ。',
  '☕ あそべない ひが あっても だいじょうぶ。 ペナルティは ないよ。 じぶんの ペースで ね。'].join('<br><br>')));
  const b=el('button','btn sub','もどる');b.onclick=()=>{closePanel(true);menu();};body.append(b);});}

 // ---------- news (daily) ----------
 function forecastText(){const d=NOW();const out=[];for(let b=0;b<4;b++){const t=new Date(d);t.setHours(b*6+1);out.push(WEATHER_JP[weatherAt(t)]);}return `きょうの てんきは あさ${out[1]}、ひる${out[2]}、よる${out[3]} です`;}
 function news(){whenFree(()=>{
  G.lock++;const d=NOW();const D=S.daily;const ov=el('div','catch');const box=el('div','news win');ov.append(box);$('#overlay').append(ov);
  const fc=[0,1,2,3].map(b=>{const t=new Date(d);t.setHours(b*6+2);const w=weatherAt(t);return `<div class="fc"><img class="px" src="${url('ui_'+w,()=>uiIcon(w))}"><span>${['よなか','あさ','ひる','よる'][b]}</span></div>`;}).join('');
  const enc=(D.enc||[]).filter(e=>!e.done).sort((a,b)=>speciesAvailable(SP[b.sp])-speciesAvailable(SP[a.sp]));const feat=enc.length?SP[enc[0].sp]:null;const sale=FURN[D.sale];
  const idx=(S.stamps-1)%7;const rw=STAMP_REWARDS[idx];
  const greet=phaseOf()==='N'?'こんばんは':phaseOf()==='E'?'こんにちは':phaseOf()==='M'?'おはよう':'こんにちは';
  box.innerHTML=`<div class="nhead">ぽかぽか しんぶん</div><div class="ndate">${d.getMonth()+1}がつ ${d.getDate()}にち（${WDAY[d.getDay()]}）　${SEASON_JP[seasonOf()]}</div>
   <div class="nsec"><b>${greet}、${S.name}さん！</b></div>
   <div class="nsec fcs">${fc}</div>
   ${Story.newsHtml()}${Mist.newsLine()}
   ${feat?`<div class="nsec feat"><img class="px" src="${url('sil_'+feat.id,()=>monSpr(feat.id).s)}" width="44"><div><b>きょうの うわさ</b><br>${hint(feat)}で ${S.dex[feat.id]==='c'?'みおぼえの ある':'みなれない'} ぷちっこを みかけた ひとが いるらしい…${enc.length>1?`<br><span class="desc">ほかにも もう 1ぴき むらに きているみたい</span>`:''}</div></div>`:(S.story<STORY_DONE?`<div class="nsec"><b>そんちょうの おねがい</b><br>${S.storyReady?'ハルさんに ほうこくしよう！':fmt(STORY[S.story].hint.replace(/（.*?）/,''))}</div>`:'')}
   <div class="nsec"><b>にゃんこしょうてん</b>　きょうは「${sale.name}」が 2わりびき！</div>
   ${unreadMail()?`<div class="nsec">💌 ポストに てがみが ${unreadMail()}つう とどいているよ</div>`:''}
   <div class="nsec omi"></div>
   <div class="nsec"><b>スタンプカード ${idx+1}こめ</b>：${rw.t}</div>`;
  const omi=box.querySelector('.omi');const drawOmi=()=>{omi.innerHTML='';if(D.omikuji){const O=OMIKUJI[D.omikuji.i];const lm=monById(D.omikuji.mon);omi.innerHTML=`<b>きょうの おみくじ</b>：<span style="color:${O.col}">${O.k}</span><br><span class="desc">${D.omikuji.t}<br>ラッキーアイテム：${D.omikuji.item}${lm?`　ラッキーぷちっこ：${lm.name}`:''}</span>`;}else{omi.append(el('b',null,'きょうの おみくじ'));const ob=el('button','btn','🎋 おみくじを ひく');ob.onclick=()=>omikuji(drawOmi);omi.append(ob);}};drawOmi();
  box.append(stampCard());{const{L}=tomorrowLines();box.append(el('div','nsec tmr',`<b>あしたの よこく</b><br><span class="desc">${L.slice(0,3).join('<br>')}</span>`));}
  const b=el('button','btn gold','スタンプを おして うけとる');box.append(b);Snd.jingle('newday');
  b.onclick=()=>{if(!D.stampTaken){D.stampTaken=true;if(rw.coins)addCoins(rw.coins);if(rw.items)for(const k in rw.items)addItem(k,rw.items[k]);Snd.sfx('stamp');toast(`${rw.t}を もらった！`,rw.items?Object.keys(rw.items)[0]:'coin');}
   ov.remove();G.lock--;save();hud();};
 });}

 // ---------- omikuji ----------
 function omikuji(after){const d=S.daily;if(d.omikuji)return;G.lock++;
  const i=OMIKUJI.indexOf(wpick(OMIKUJI,o=>o.w));const O=OMIKUJI[i];const lm=S.creatures.length?rnd(S.creatures):null;
  d.omikuji={i,t:rnd(O.t),item:rnd(LUCKY_ITEM),mon:lm?lm.uid:null};d.luck=O.luck;d.luckyMon=lm?lm.uid:null;
  let rw;if(i===0){const k=rnd(SHOP_TOYS.concat(['tsumiki','mokuba','taiko','petbed']));addItem('f_'+k);addItem('starbit');rw=['f_'+k,`${FURN[k].name}と ほしのかけら`];}
  else if(i===1){addItem('feast');addCoins(300);rw=['feast','ごちそうクッキーと 300ポカ'];}
  else if(i===2){addItem('cookie',3);addItem('seed_straw');rw=['cookie','ぷちクッキー×3と いちごのたね'];}
  else if(i===3){const f=rnd(['apple','peach','orange','pear']);addItem(f,2);rw=[f,`${ITEMS[f].name}×2`];}
  else{addItem('cookie');rw=['cookie','ぷちクッキー'];}
  const ov=el('div','catch');const box=el('div','cbox win');ov.append(box);$('#overlay').append(ov);
  box.innerHTML=`<div class="ctitle">おみくじ</div><canvas width="180" height="150"></canvas><div class="cmsg">からから…</div>`;
  const cv=box.querySelector('canvas'),c=cv.getContext('2d');c.imageSmoothingEnabled=false;let t=0,last=performance.now(),shown=false;Snd.sfx('rustle');
  const reveal=()=>{if(shown)return;shown=true;Snd.jingle(i<=1?'fanfare':'newday');
   box.querySelector('.cmsg').innerHTML=`<b style="color:${O.col};font-size:22px">${O.k}</b><br><span class="desc">${d.omikuji.t}</span><br>ラッキーアイテム：${d.omikuji.item}${lm?`<br>ラッキーぷちっこ：${lm.name}<span class="desc">（なでると いいことが…）</span>`:''}`;
   const g=el('div','giftbox');g.append(iconOf(rw[0]));g.append(el('span',null,`${rw[1]}を もらった！`));box.append(g);
   const b=el('button','btn gold','ありがとう');b.onclick=()=>{ov.remove();G.lock--;save();hud();if(after)after();};box.append(b);};
  const fr=ts=>{const dt=Math.min(0.05,(ts-last)/1000);last=ts;t+=dt;c.fillStyle='#fff3dc';c.fillRect(0,0,180,150);
   c.fillStyle='rgba(255,180,100,0.35)';for(let k=0;k<12;k++){const a=k/12*Math.PI*2+t*0.5;c.fillRect(90+Math.cos(a)*62,78+Math.sin(a)*52,3,3);}
   const sh=t<1.4?Math.sin(t*40)*4:0;const up=t>1.4?Math.min(1,(t-1.4)/0.5):0;
   c.save();c.translate(90+sh,92);c.rotate(sh*0.03);
   c.fillStyle='#3b2a20';c.fillRect(-6,-35-up*34,12,42);c.fillStyle='#e8c070';c.fillRect(-5,-34-up*34,10,40);if(up>=1){c.fillStyle=O.col;c.fillRect(-4,-66,8,12);}
   c.fillStyle='#3b2a20';c.fillRect(-24,-30,48,62);c.fillStyle='#d83a3a';c.fillRect(-22,-28,44,58);c.fillStyle='#fff3dc';c.fillRect(-12,-20,24,42);
   c.fillStyle='#3b2a20';c.font='12px DotGothic16, monospace';c.textAlign='center';c.fillText('お',0,-6);c.fillText('み',0,8);c.fillText('く',0,22);c.restore();
   if(up>=1)reveal();if(t<4)requestAnimationFrame(fr);};
  requestAnimationFrame(fr);setTimeout(reveal,2400);}

 // ---------- away diary ----------
 function diary(list){whenFree(()=>{G.lock++;const ov=el('div','catch');const box=el('div','news win');ov.append(box);$('#overlay').append(ov);
  box.append(el('div','nhead','るすの あいだに…'));box.append(el('div','ndate',`${S.name}が いない あいだの できごと`));
  list.forEach(x=>{const r=el('div','nsec drow');r.append(x.sp?monImg(x.sp,40):x.sil?monImg(x.sil,40,true):img('ui_house',()=>uiIcon('house'),30));
   const t=el('div',null,fmt(x.t));if(x.item){const g=el('div','dget');g.append(iconOf(x.item));g.append(el('span',null,`${ITEMS[x.item].name}${x.n>1?' ×'+x.n:''}`));t.append(g);}r.append(t);box.append(r);});
  const b=el('button','btn gold','ありがとう！');b.onclick=()=>{ov.remove();G.lock--;save();hud();};box.append(b);Snd.jingle('mail');});}

 // ---------- bedtime ----------
 async function bedtime(){const h=NOW().getHours();const night=h>=20||h<5;const d=S.daily;
  const ch=await say(night?'ふかふかの ベッド。 もう ねる？':'ふかふかの ベッド。 すこし ひとやすみ する？',{choices:[night?'おやすみ する':'ひとやすみ','やめる']});if(ch!==0)return;
  const pets=housePets().filter(p=>!p.guest||true).slice(0,4);G.lock++;const ov=el('div','catch');const box=el('div','cbox win');ov.append(box);$('#overlay').append(ov);
  box.innerHTML=`<div class="ctitle">${night?'おやすみの じかん':'ひとやすみ'}</div><canvas width="180" height="140"></canvas><div class="cmsg"></div><div class="cbtns"></div>`;
  const cv=box.querySelector('canvas'),c=cv.getContext('2d');c.imageSmoothingEnabled=false;const msg=box.querySelector('.cmsg'),btns=box.querySelector('.cbtns');
  const bed=scaled(furnSpr('bed'),3);const head=mkCanvas(20,12);head.getContext('2d').drawImage(_player.down[0],0,0,20,12,0,0,20,12);const headB=scaled(head,3);
  const imgs=pets.map(p=>{const s=monSpr(p.mon.sp,monLook(p.mon));return[scaled(s.n,2),scaled(s.b,2)];});const z2=scaled(ZZZ,2);
  const spots=[[4,72],[136,72],[26,96],[114,96]];const asleep=new Set();let dark=0,raf=0,last=performance.now(),alive=true;
  const fr=ts=>{if(!alive)return;const dt=Math.min(0.05,(ts-last)/1000);last=ts;const T=performance.now()/1000;
   c.fillStyle=night?'#2a2850':'#ffe8c8';c.fillRect(0,0,180,140);c.fillStyle=night?'#34326a':'#ffd8a8';for(let x=0;x<180;x+=10)c.fillRect(x,0,5,34);
   c.fillStyle='#3b2a20';c.fillRect(66,4,48,30);c.fillStyle=night?'#1a2050':'#8fd0ff';c.fillRect(68,6,44,26);
   if(night){c.fillStyle='#fff6c0';c.beginPath();c.arc(100,16,6,0,Math.PI*2);c.fill();c.fillStyle='#1a2050';c.beginPath();c.arc(103,14,5,0,Math.PI*2);c.fill();c.fillStyle='#fff';[[74,10],[84,22],[90,9],[78,27]].forEach(([x,y],k)=>{if((T*2+k)%3>0.4)c.fillRect(x,y,1,1);});}
   c.fillStyle=night?'#4a3a5a':'#cf9c60';c.fillRect(0,34,180,106);
   c.drawImage(bed,60,36);c.drawImage(headB,60,42);c.fillStyle='#3b2a20';c.fillRect(63,66,54,2);c.fillStyle='#6aa8f0';c.fillRect(63,68,54,28);c.fillStyle='#8ac0ff';c.fillRect(63,68,54,4);
   pets.forEach((p,k)=>{const zz=asleep.has(k);const[x,y]=spots[k];const bob=zz?Math.round(Math.sin(T*1.5+k)):Math.floor(T*3+k)%2;c.drawImage(imgs[k][zz?1:0],x,y-bob);
    if(zz&&(T+k)%2.4<1.4)c.drawImage(ZZZ,x+32,y-4-((T+k)%2.4)*4);});
   if(night&&asleep.size===pets.length&&(T%2.4)<1.4)c.drawImage(z2,120,34-(T%2.4)*5);
   if(dark>0){c.fillStyle=`rgba(10,8,24,${Math.min(0.85,dark)})`;c.fillRect(0,0,180,140);dark+=dt*0.6;}
   raf=requestAnimationFrame(fr);};raf=requestAnimationFrame(fr);
  const close=()=>{alive=false;cancelAnimationFrame(raf);ov.remove();G.lock--;save();hud();};
  const step=(text,label)=>new Promise(res=>{msg.innerHTML=text;btns.innerHTML='';const b=el('button','btn',label||'▼');b.onclick=()=>res();btns.append(b);});
  for(let k=0;k<pets.length;k++){const m=pets[k].mon;const tier=affHearts(m)>=4?2:affHearts(m)>=2?1:0;
   await step(`<b>${m.name}</b>「${monFmt(night?rnd(NIGHT_LINE[perOf(m)]):rnd(TALK[perOf(m)][tier]),m)}」`);if(night)asleep.add(k);Snd.sfx('pet');}
  if(!d.slept){d.slept=true;pets.forEach(p=>{gainAff(p.mon,1,true);restoreEn(p.mon,perOf(p.mon)==='nebosuke'?99:3);});}
  if(!pets.length)await step(night?'しずかな よる…':'すこし うとうと…');
  if(night){const{L}=tomorrowLines();await step(`<b>あしたの よこく</b><br><span class="desc">${L.join('<br>')}</span>`,'おやすみなさい');
   dark=0.01;msg.innerHTML='…zzz<br><span class="desc">（タップで おきる）</span>';btns.innerHTML='';
   await new Promise(res=>setTimeout(()=>{ov.onclick=()=>res();},400));ov.onclick=null;close();toast('ふぁ〜… よく ねた！','house');}
  else{await step(pets.length?'みんなで ひとやすみ。 げんきが でた！':'すこし やすんで、 げんきが でた！','すっきり！');close();}}

 // ---------- title / creation / intro ----------
 function title(){
  const ov=el('div','title');ov.innerHTML=`<div class="logo"><div class="l1">ぽかぽか村</div><div class="l2">と ぷちっこ</div></div><div class="tmons"></div><div class="tbtns"></div><div class="tfoot">ちいさな むらの ちいさな まいにち</div>`;
  const ms=ov.querySelector('.tmons');['moppuru','honoya','shizukun','fuwawa','pachipiyo'].forEach((id,i)=>{const im=monImg(id,52);im.style.animationDelay=(i*0.15)+'s';ms.append(im);});
  const bs=ov.querySelector('.tbtns');const go=(snd)=>{Snd.init();if(S){S.opt.bgm=snd;S.opt.sfx=snd;}ov.remove();if(S){startWorld();news();if(G.pendingDiary&&G.pendingDiary.length){diary(G.pendingDiary);G.pendingDiary=null;}}else creation(snd);};
  const b1=el('button','btn gold',S?'▶ つづきから（おと あり）':'▶ はじめる（おと あり）');b1.onclick=()=>go(true);
  const b2=el('button','btn',S?'▶ つづきから（おと なし）':'▶ はじめる（おと なし）');b2.onclick=()=>go(false);
  bs.append(b1,b2);bs.append(el('div','desc','おとは あとから メニューで かえられるよ'));$('#overlay').append(ov);
 }
 function creation(snd){
  let shirt=SHIRTS[0],hair=HAIRS[0];const ov=el('div','catch');const box=el('div','cbox win create');ov.append(box);$('#overlay').append(ov);
  box.innerHTML=`<div class="ctitle">あなたの ことを おしえてね</div><div class="prev"></div><label>なまえ<input id="nmIn" maxlength="6" value="" placeholder="なまえ"></label><div class="lbl">ふくの いろ</div><div class="sw" id="swS"></div><div class="lbl">かみの いろ</div><div class="sw" id="swH"></div>`;
  const pv=box.querySelector('.prev');const redraw=()=>{buildPlayer(shirt,hair);pv.innerHTML='';const c=scaled(_player.down[0],5);c.className='px';pv.append(c);};
  const mk=(id,list,set)=>{const w=box.querySelector(id);list.forEach((c,i)=>{const b=el('button','swc'+(i===0?' on':''));b.style.background=c;b.onclick=()=>{w.querySelectorAll('.swc').forEach(x=>x.classList.remove('on'));b.classList.add('on');set(c);redraw();Snd.sfx('tap');};w.append(b);});};
  mk('#swS',SHIRTS,c=>shirt=c);mk('#swH',HAIRS,c=>hair=c);redraw();
  const ok=el('button','btn gold','これで けってい！');box.append(ok);
  ok.onclick=()=>{let nm=box.querySelector('#nmIn').value.trim().slice(0,6);if(!nm)nm='ぽか';S=newState(nm,shirt,hair);S.opt.bgm=snd;S.opt.sfx=snd;ov.remove();startWorld();intro();};
 }
 async function intro(){
  const v=VIL.chief;const o={name:v.title,por:vilPor('chief'),pitch:v.pitch};
  await sayAll([`ようこそ、${S.name}さん！ わたしは この むらの そんちょう、 ハルです。`,
   'この むらでは『ぷちっこ』という ちいさな いきものたちが、 くらしの おてつだいを してくれるの。',
   'はたけを たがやしたり、 みずを まいたり、 きを きったり… みんな それぞれ とくいな しごとが あるのよ。',
   'あなたにも おてつだいの こを しょうかいするわね。'],o);
  const m=newMon('moppuru',2);S.dex.moppuru='c';joinCreature(m);Snd.jingle('fanfare');
  await say('もっぷるが なかまに なった！',{name:'もっぷる',por:monImg('moppuru',56)});
  await sayAll(['もっぷるは つちを たがやすのが とくいなの。 くびの スカーフは、 あなたの なかまの しるしよ。',
   'さっそくだけど、 あなたの いえの みぎにある さくの なかを たがやしてみて。',
   'したの「しごと」ボタンで『たがやす』を えらんで、 じめんを タップするのよ。',
   'わたしは ひろばの やくばの まえに いるから、 おわったら おしえてね。 ゆっくりで いいからね。'],o);
  hud();save();news();
 }

 return {dropCache,el,img,iconOf,monImg,monImgM,url,whenFree,init,hud,toast,say,sayAll,panel,closePanel,talkVillager,monMenu,diary,bedtime,omikuji,nameInput,catchGame,evolve,hatch,bag,nakama,dex,questPanel,mailPanel,shop,fountain,houseMode,decorTap,canPlace,menu,news,title,forecastText,hut,craft,
  get decor(){return UI_decor.on;},set decor(v){UI_decor.on=v;},get decorSel(){return UI_decor.sel;},set decorSel(v){UI_decor.sel=v;}};
})();
const UI_decor={on:false,sel:null};
