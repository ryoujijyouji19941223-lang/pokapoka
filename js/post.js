'use strict';
// ============================================================
//  てがみ・おくりもの・ながれつく びん・そらを みあげる
//  - letters are mostly just words. presents are handed over in person.
//  - recipes come from bottles, friends (in person) and your own ideas.
//  - looking up at the sky: shooting stars / UFOs with a special action
// ============================================================

// ---------- letters: words first ----------
(function(){
 const keep=new Set(['f_cushion','f_momphoto','seed_straw']);
 for(let i=MOM_LETTERS.length-1;i>=0;i--){const L=MOM_LETTERS[i];if(L.recipe||L.coins||(L.gift&&!keep.has(L.gift)))MOM_LETTERS.splice(i,1);}
 for(const k of ['rain','snow','firstcatch','comeback']){delete MOM_SPECIAL[k].gift;delete MOM_SPECIAL[k].n;}
 const db=DAD_GIFTS.find(d=>d.recipe);if(db){delete db.recipe;db.gift='f_woodbox';db.t='{name}へ\n\nはこを つくった。 なにを いれるかは じぶんで きめろ。\n\nちちより';}
 delete TOY_LETTER.gift;delete TOY_LETTER.n;delete TOY_LETTER.recipe;
 TOY_LETTER.body='{name}さんへ\n\nぷちっこたちは あそぶのが だいすきなの。\nおうちに おもちゃを おいてあげると、 るすの あいだも たのしく すごせるのよ。\nちいさな ボールを よういしたから、 こんど わたしに こえを かけてね。\n\nそんちょう ハル';
})();

// ---------- new limited items (sky gifts) ----------
ITEMS.konpeito={name:'ほしの こんぺいとう',sell:120,cat:'food',desc:'ながれぼしから とどいた きらきらの おかし。 げんきが ぜんぶ もどる。'};
ITEMS.ufocandy={name:'うちゅうキャンディ',sell:150,cat:'food',desc:'みたことの ない いろの キャンディ。 しゅわしゅわ する。 げんきが ぜんぶ もどる。'};
FEED_FOODS.push('konpeito','ufocandy');
FURN.starglobe={name:'ほしぞらの スノードーム',gift:true,light:true};FURN.moonlamp={name:'おつきさまランプ',gift:true,light:true};FURN.ufo={name:'UFOの もけい',gift:true,light:true};
for(const k of ['starglobe','moonlamp','ufo'])ITEMS['f_'+k]={name:FURN[k].name,sell:300,cat:'furn',furn:k,desc:'そらから とどいた とくべつな かぐ。 どこにも うっていない。'};
WEAR.comet={name:'ほうきぼしの かみかざり',pos:'side',rows:["..x","yx.","y.."],c1:'#ffe060',c2:'#9ad8ff'};
WEAR.antenna={name:'うちゅうアンテナ',pos:'head',rows:["y...y",".x.x.","xxxxx"],c1:'#8ad870',c2:'#ff6aa8'};
for(const k of ['comet','antenna'])ITEMS['w_'+k]={name:WEAR[k].name,sell:200,cat:'wear',wear:k,desc:'そらから とどいた とくべつな こもの。 どこにも うっていない。'};
const STAR_GIFTS=[{k:'konpeito',n:3},{k:'f_starglobe'},{k:'w_comet'},{k:'f_moonlamp'},{k:'konpeito',n:3},{k:'starbit',n:3}];
const UFO_GIFTS=[{k:'ufocandy',n:3},{k:'f_ufo'},{k:'w_antenna'},{k:'ufocandy',n:3}];
{const _ex=extraIcon;extraIcon=function(id,it){let g,pal;
 if(id==='konpeito'){g=new Grid(16,16);pal={a:'#ffd0e8',b:'#bfe8ff',c:'#fff4a0',d:'#d8c8ff',j:'#ffffff'};g.rows(["..j..",".jjj.","jjjjj"],5,2,{j:'j'});g.rect(4,5,8,8,'j');[[5,7,'a'],[9,6,'b'],[7,9,'c'],[10,10,'d'],[5,11,'b']].forEach(([x,y,c])=>{g.rect(x,y,2,2,c);});}
 else if(id==='ufocandy'){g=new Grid(16,16);pal={a:'#8ad870',b:'#ff6aa8',c:'#9ad8ff',w:'#ffffff'};g.circle(8,8,4.5,'a');g.rect(6,6,2,2,'w');g.rows(["bb...","bbb..",".b..."],1,5,{b:'b'});g.rows(["...bb","..bbb","...b."],11,5,{b:'b'});g.set(9,10,'c');}
 if(g)return renderGrid(g,pal);return _ex(id,it);};}
{const _fs=furnSpr;const own={};furnSpr=function(id){if(own[id])return own[id];let g,pal;
 if(id==='starglobe'){g=new Grid(16,16);pal={g:'#bfe0ff',n:'#2a3a7a',s:'#fff6a0',w:'#a8703a',W:'#8a5a2a'};g.circle(8,7,6,'g');g.circle(8,7,5,'n');[[6,5],[9,4],[10,8],[5,8],[8,9]].forEach(([x,y])=>g.set(x,y,'s'));g.rect(3,12,10,4,'w');g.rect(3,14,10,1,'W');}
 else if(id==='moonlamp'){g=new Grid(16,18);pal={y:'#fff0a0',Y:'#f0d060',k:'#8a8aa0'};g.circle(8,6,5.5,'y');g.circle(10,5,4.5,null);g.set(6,4,'Y');g.set(5,7,'Y');g.rect(7,12,2,4,'k');g.rect(4,16,8,2,'k');}
 else if(id==='ufo'){g=new Grid(16,16);pal={g:'#bfeaff',s:'#c8c8d8',S:'#8a8aa0',l:'#ff6aa8',y:'#fff0a0',k:'#8a8aa0'};g.ellipse(8,5,3.5,3,'g');g.ellipse(8,8,7.5,2.5,'s');g.rect(1,9,14,1,'S');g.set(4,8,'l');g.set(8,8,'y');g.set(12,8,'l');g.rect(7,11,2,3,'k');g.rect(5,14,6,2,'k');}
 if(g){own[id]=renderGrid(g,pal);return own[id];}return _fs(id);};}

const BOTTLE_RECIPES=['tsumiki','stonelamp','yakiringo','wshelf','od_picnic','od_stoneroad','od_signpost'];
const BOTTLE_NOTES=[
 ['うみの むこうの しまに すむ おばあちゃん','こんにちは。 だれかの ところに とどくと いいな。\nわたしの しまでは みんな これを つくって あそぶのよ。'],
 ['とおくの みなとの ふなのり','やあ！ ふねの うえから びんを ながしてみた。\nうみは ひろいけど、 どこかで つながってるんだな。'],
 ['なぞの たびびと','たびの とちゅうで おもいついた ものを かいておく。\nだれかの やくに たちますように。'],
 ['ちいさな まちの パンやさん','このびんを ひろった あなたへ。\nきょうも おいしい ものを たべて、 よく ねてくださいね。'],
 ['うみが すきな こども','びんに てがみを いれるのって わくわく するね！\nへんじは いらないよ。 ひろってくれて ありがとう！'],
 ['やまの うえの おじいさん','うみを みたくて ここまで きた。 ついでに びんを ながす。\nむかし よく つくった ものの かきかたを いれておく。'],
 ['ほしを みるのが すきな ひと','よるの うみは ほしが ふたつ あるみたい。\nうえと、 したに。 きっと あなたの ところも きれいでしょう。'],
];
const BOTTLE_EXTRA=[['shell_l',1],['starbit',1],['shell_s',3],['letterpaper',2],['glassbead',1]];
ITEMS.glassbead={name:'うみの ガラスだま',sell:150,cat:'mat',col:'#9ad8e8',desc:'なみに みがかれた まるい ガラス。 ひかりに すかすと きれい。'};

const Post=(()=>{
 const el=(...a)=>UI.el(...a);
 // ---------- presents handed over in person ----------
 function hand(who,g){if(!S.hand)S.hand={};(S.hand[who]||(S.hand[who]=[])).push(g);}
 const pending=who=>!!(S&&S.hand&&S.hand[who]&&S.hand[who].length);
 function give(g){if(g.items)for(const k in g.items){addItem(k,g.items[k]);UI.toast(`${ITEMS[k].name}を もらった！`,k);}
  if(g.coins){addCoins(g.coins);UI.toast(`${g.coins}ポカ もらった！`,'coin');}(g.recipes||[]).forEach(r=>learnRecipe(r));Snd.sfx('get');}
 async function handOver(v,o){const who=v.chief?'chief':v.id;if(!pending(who))return false;const q=S.hand[who];
  while(q.length){const g=q.shift();await UI.say(fmt(g.t),o);give(g);}save();return true;}

 // ---------- villager visits your home (a thank-you letter comes the day after) ----------
 const visitHours=()=>{const h=NOW().getHours();return h>=13&&h<19;};
 function homeVisitor(){const d=S&&S.daily;if(!d||!d.homeVisit||d.homeVisitDone||!visitHours())return null;return VIL[d.homeVisit]||null;}
 let guest=null;
 function houseGuest(list,c,ox,oy){const v=homeVisitor();if(!v||G.scene!=='house'){guest=null;return;}
  if(!guest||guest.v.id!==v.id){let spot=null;for(let y=ROOM_H-2;y>=2&&!spot;y--)for(let x=1;x<ROOM_W-1&&!spot;x++)if(walkRoom(x,y)&&!(G.player.tx===x&&G.player.ty===y)&&walkRoom(x,y+1))spot=[x,y];
   if(!spot)return;guest={v:{id:v.id},vv:v,e:{px:spot[0]*TS,py:spot[1]*TS,tx:spot[0],ty:spot[1],flip:false,moving:false,anim:0,path:[]}};
   if(!S.daily.homeVisitSeen){S.daily.homeVisitSeen=1;setTimeout(()=>UI.toast(`${v.name}が あそびに きている！`,'paw'),300);}}
  list.push({y:guest.e.py,f:()=>{drawVil(c,guest,ox,oy);if(Math.floor(G.t*2)%2)c.drawImage(EXCL,Math.round(guest.e.px-ox+7),Math.round(guest.e.py-oy-12));}});}
 function guestTap(tx,ty){if(!guest||G.scene!=='house'||!homeVisitor())return false;if(guest.e.tx!==tx||guest.e.ty!==ty)return false;
  goAdjacent(tx,ty,()=>talkGuest(),()=>talkGuest());return true;}
 async function talkGuest(){const v=guest.vv;const o={name:v.name,por:UI.img('vp_'+v.id,()=>scaled(vilSpr(v.id).n,3),60),pitch:v.pitch};
  const fs=S.furniture.filter(f=>!FURN[f.id].inner);const fav=fs.length?FURN[rnd(fs).id].name:null;const n=fs.length;
  const lines=[`おじゃましてます！ ${S.name}の おうち、 いちど きてみたかったんだ。`,
   fav?`この ${fav}、 すてきだね！ ${rnd(['どこで みつけたの？','わたしも ほしいなあ。','おへやに よく にあってる。'])}`:'まだ かぐが すくないね。 これから たのしみだね！',
   n>=15?'かぐが いっぱいで、 みてるだけで たのしい！':n>=6?'いごこちの いい おへやだね。 ぷちっこたちも うれしそう。':'すっきりしてて おちつくね。',
   'きょうは よんでくれて ありがとう。 そろそろ かえるね！'];
  await UI.sayAll(lines,o);const d=S.daily;d.homeVisitDone=1;const fr=S.vil[v.id]||(S.vil[v.id]={f:0,ms:0});fr.f++;
  S.thanks={id:v.id,fav,day:dayKey()};addMemory(`${v.name}が おうちに あそびに きた`,'paw');puff(guest.e.px+8,guest.e.py+8,'#fff6a0',8);guest=null;save();}

 // ---------- letters from neighbours: only on real occasions ----------
 function extraMail(prev){const today=dayKey();
  if(S.thanks&&S.thanks.day!==today){const v=VIL[S.thanks.id];if(v)pushMail({from:'vil',sender:v.name,body:`{name}へ\n\nきのうは おうちに よんでくれて ありがとう！\n${S.thanks.fav?`${S.thanks.fav}が とっても すてきだったな。\n`:''}こんどは わたしの ところにも あそびに きてね。\n\n${v.name}より`});S.thanks=null;}
  // birthday invitation the day before
  const tm=new Date(NOW());tm.setDate(tm.getDate()+1);const m=tm.getMonth()+1,dd=tm.getDate();
  for(const id in BIRTHDAYS){const[bm,bd]=BIRTHDAYS[id];if(bm!==m||bd!==dd)continue;const v=VIL[id];if(!v||v.chief&&false)continue;if(!Story.isPresent(v))continue;const k='inv'+id+tm.getFullYear();if(S.flags[k])continue;S.flags[k]=1;
   pushMail({from:'vil',sender:v.name,body:`{name}へ\n\nじつは あしたは ${v.chief?'わたし':'わたし'}の たんじょうびなの。\nよかったら むらで あったときに こえを かけてね。\nいっしょに おいわい できたら うれしいな。\n\n${v.name}より`});}
  // sky wishes come true the next morning
  (S.skyQ||[]).filter(q=>q.day!==today).forEach(q=>{const L=q.type==='star'?STAR_GIFTS:UFO_GIFTS;const i=(q.type==='star'?S.starN=(S.starN||0)+1:S.ufoN=(S.ufoN||0)+1)-1;const g=L[i%L.length];
   pushMail(q.type==='star'?{from:'sky',sender:'ながれぼし',body:'{name}へ\n\nきのうの よる、 ねがいごとを ありがとう。\nあなたの ねがいが かないますように。\nほしの ひかりを すこし おすそわけ します。\n\n☆',gift:g.k,n:g.n||1}
    :{from:'sky',sender:'？？？',body:'ピピ… {name}… ピピピ。\nきのう てを ふって くれて ありがとう。\nこの ほしは とても きれい。 また あいに くる。\n\n…うちゅうの ともだちより',gift:g.k,n:g.n||1});});
  S.skyQ=(S.skyQ||[]).filter(q=>q.day===today);}

 // ---------- daily setup ----------
 function daily(){const d=S.daily;if(d.postInit)return;d.postInit=1;const r=mkRng(hashStr(d.day+'post'+S.name));
  d.bottle=null;if(S.story>=STORY_DONE&&r()<0.4){const H=habTiles();const c=H.sand.filter(([x,y])=>DIRS.some(([dx,dy])=>G.world.get(x+dx,y+dy)==='S'));if(c.length){const t=c[Math.floor(r()*c.length)];d.bottle={x:t[0],y:t[1],done:false};}}
  d.homeVisit=null;if(S.story>=STORY_DONE&&r()<0.22){const c=Story.residents().filter(v=>v.id!=='bear'&&(S.vil[v.id]&&S.vil[v.id].f>=3));if(c.length)d.homeVisit=c[Math.floor(r()*c.length)].id;}}

 // ---------- recipes you come up with yourself ----------
 const IDEAS=[['fishtank',()=>Object.keys(S.fishDex||{}).length>=5,'さかなを ながめていたら'],['bugcage',()=>Object.keys(S.bugDex||{}).length>=5,'むしを みていたら'],
  ['tulipvase',()=>Object.keys(S.items).some(k=>k.startsWith('tulip_')&&S.items[k]>0),'チューリップを みていたら'],['mistlamp',()=>itemCount('mistdrop')>0,'きりの しずくを みていたら']];
 function ideas(){if(G.lock||S.story<STORY_DONE)return;for(const[r,cond,why]of IDEAS){if(S.recipes.includes(r)||!cond())continue;S.recipes.push(r);Snd.sfx('get');
  UI.say(`${why}… ひらめいた！\n${ITEMS[RECIPES[r].out].name}の レシピを おもいついた！ さぎょうだいで つくれるよ。`);return;}}

 // ---------- message bottle on the beach ----------
 function bottleAt(tx,ty){const b=S&&S.daily&&S.daily.bottle;return b&&!b.done&&b.x===tx&&b.y===ty;}
 let _bspr=null;function bottleSpr(){if(_bspr)return _bspr;const g=new Grid(12,8);g.rect(1,2,8,4,'g');g.rect(9,3,2,2,'c');g.rect(3,3,4,2,'p');g.set(2,2,'w');_bspr=renderGrid(g,{g:'#8ad8c8',c:'#a8703a',p:'#fff4d8',w:'#ffffff'});return _bspr;}
 function draw(c,ox,oy){const b=S&&S.daily&&S.daily.bottle;if(!b||b.done)return;const px=b.x*TS-ox+1,py=b.y*TS-oy+5+Math.round(Math.sin(G.t*2)*1);c.drawImage(bottleSpr(),px,py);if(Math.floor(G.t*1.5)%3===0)c.drawImage(SPARK,px+8,py-6);}
 async function openBottle(){const d=S.daily;if(!d.bottle||d.bottle.done)return;d.bottle.done=true;S.bottles=(S.bottles||0)+1;Snd.sfx('pop');
  const n=BOTTLE_NOTES[(S.bottles-1)%BOTTLE_NOTES.length];await UI.say('なみうちぎわに びんが ながれついている。 なかに てがみが はいっている…');
  const left=BOTTLE_RECIPES.filter(r=>!S.recipes.includes(r));
  if(left.length){const r=left[Math.floor(Math.random()*left.length)];await UI.say(`「${n[1]}」\n― ${n[0]}より`);learnRecipe(r,true);Snd.sfx('get');await UI.say(`てがみと いっしょに レシピが はいっていた！\n${ITEMS[RECIPES[r].out].name}の レシピを おぼえた。`);}
  else{const[k,c]=rnd(BOTTLE_EXTRA);await UI.say(`「${n[1].split('\n')[0]}」\n― ${n[0]}より`);addItem(k,c);UI.toast(`${ITEMS[k].name}が はいっていた！`,k);}
  addMemory('うみで びんの てがみを ひろった','letterpaper');save();}

 // ---------- the sky ----------
 let sky=null;
 function skyOpen(){if(G.lock||G.scene!=='map'||!G.ready)return;G.lock++;Snd.sfx('open');
  const ov=el('div','skyov');const cv=document.createElement('canvas');cv.className='skycv';ov.append(cv);
  const msg=el('div','skymsg win',rnd(['そらを みあげた。','ぼんやり そらを ながめよう。','くもが ゆっくり ながれていく。']));const act=el('button','btn gold skyact hidden','');const back=el('button','btn skyback','もどる');ov.append(msg,act,back);document.body.append(ov);
  const W=Math.max(100,Math.round(G.vw)),H=Math.max(160,Math.round(G.vh));cv.width=W;cv.height=H;
  const h=NOW().getHours();const night=h>=19||h<5;const w=G.weather;const clear=w==='clear'||w==='cloudy';
  const r=mkRng(hashStr(dayKey()+'sky'));const stars=[...Array(70)].map(()=>[Math.floor(r()*W),Math.floor(r()*H*0.75),r()]);
  const clouds=[...Array(w==='cloudy'||w==='rain'||w==='snow'?7:3)].map((_,i)=>({x:r()*W,y:10+r()*H*0.45,s:0.6+r()*0.9,v:2+r()*4}));
  const d=S.daily;sky={ov,cv,ctx:cv.getContext('2d'),W,H,night,clear,stars,clouds,ev:null,evT:night&&w==='clear'?(seriesOn('light')?3:5)+Math.random()*8:999,t:0,last:performance.now(),act,msg,birds:null,birdT:6+Math.random()*10};
  act.onclick=()=>doAction();back.onclick=()=>close();
  // occasionally an UFO, at most once every few days
  const today=dayNum(dayKey());sky.ufoOk=clear&&today-(S.lastUfo==null?-99:S.lastUfo)>=3;
  sky.raf=requestAnimationFrame(loop);}
 function close(){if(!sky)return;cancelAnimationFrame(sky.raf);sky.ov.remove();sky=null;G.lock--;Snd.sfx('close');save();}
 function startEv(type){const s=sky;const fromR=Math.random()<0.5;
  if(type==='star'){s.ev={type,t:0,dur:1.5,x0:s.W*(0.4+Math.random()*0.55),y0:6+Math.random()*s.H*0.2,dx:-(30+Math.random()*30),dy:22+Math.random()*16};Snd.sfx('star');showAct('🙏 おねがい する');}
  if(type==='ufo'){s.ev={type,t:0,dur:5.5,x0:fromR?s.W+20:-20,y0:20+Math.random()*s.H*0.25,dir:fromR?-1:1};Snd.sfx('star');showAct('👋 てを ふる');}}
 function showAct(t){sky.act.textContent=t;sky.act.classList.remove('hidden');sky.act.disabled=false;}
 function doAction(){const s=sky;if(!s||!s.ev||s.ev.done)return;const e=s.ev;e.done=true;s.act.disabled=true;const d=S.daily;const today=dayKey();if(!S.skyQ)S.skyQ=[];
  if(e.type==='star'){if(d.skyWish){s.msg.textContent='…もう いちど おねがいした。 ほしが きらっと ひかった きがする。';Snd.sfx('tap');return;}
   d.skyWish=1;S.skyQ.push({type:'star',day:today});Snd.sfx('star');s.msg.textContent='ながれぼしに ねがいごとを した…！ ☆ あした なにか いいことが あるかも。';addMemory('ながれぼしに ねがいごとを した','starbit');Story.tryKakera&&Story.tryKakera('star');}
  else{S.lastUfo=dayNum(today);S.skyQ.push({type:'ufo',day:today});Snd.jingle('fanfare');s.msg.textContent='UFOに おもいきり てを ふった！ …UFOが くるっと まわって こたえて くれた きがする！';addMemory('そらで UFOを みた！','paw');}
  save();}
 function loop(now){const s=sky;if(!s)return;const dt=Math.min(0.05,(now-s.last)/1000);s.last=now;s.t+=dt;
  // events
  if(!s.ev){s.evT-=dt;if(s.evT<=0){s.evT=(seriesOn('light')?4:7)+Math.random()*14;if(s.night&&s.clear&&G.weather==='clear')startEv('star');}
   if(s.ufoOk&&!s.ev&&Math.random()<dt/90){s.ufoOk=false;startEv('ufo');}}
  else{s.ev.t+=dt;if(s.ev.t>s.ev.dur+0.5){s.ev=null;s.act.classList.add('hidden');}}
  if(!s.night&&!s.birds){s.birdT-=dt;if(s.birdT<=0){s.birds={x:-20,y:20+Math.random()*s.H*0.35,n:3+Math.floor(Math.random()*3)};s.birdT=12+Math.random()*20;}}
  if(s.birds){s.birds.x+=dt*22;if(s.birds.x>s.W+30)s.birds=null;}
  draw2(s);s.raf=requestAnimationFrame(loop);}
 function draw2(s){const c=s.ctx,W=s.W,H=s.H;const ph=phaseOf();const w=G.weather;
  const top={M:'#ffb89a',D:'#5ab0ee',E:'#7a5ac8',N:'#0e1440'}[ph],bot={M:'#ffe8c8',D:'#bfe6ff',E:'#ffa860',N:'#2a3070'}[ph];
  const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,w==='rain'||w==='snow'?(s.night?'#1a2030':'#7a8898'):top);g.addColorStop(1,w==='rain'||w==='snow'?(s.night?'#2a3040':'#aab4c0'):bot);c.fillStyle=g;c.fillRect(0,0,W,H);
  if(s.night&&w!=='rain'&&w!=='snow'){for(const[x,y,k]of s.stars){const a=0.4+0.6*Math.abs(Math.sin(s.t*(0.5+k)+k*9));c.fillStyle=`rgba(255,255,230,${a.toFixed(2)})`;c.fillRect(x,y,k>0.85?2:1,k>0.85?2:1);}
   c.fillStyle='#fff6c8';c.beginPath();c.arc(W*0.78,H*0.14,9,0,Math.PI*2);c.fill();c.fillStyle=top;c.beginPath();c.arc(W*0.78+4,H*0.14-2,8,0,Math.PI*2);c.fill();}
  else if(!s.night&&w!=='rain'&&w!=='snow'){c.fillStyle=ph==='E'?'#ffd080':'#fff6c0';c.beginPath();c.arc(W*(ph==='M'?0.2:ph==='E'?0.82:0.6),H*(ph==='D'?0.12:0.3),10,0,Math.PI*2);c.fill();}
  for(const cl of s.clouds){cl.x+=cl.v*0.016;if(cl.x>W+40)cl.x=-40;const col=s.night?'rgba(80,90,130,0.6)':w==='rain'?'rgba(150,160,175,0.9)':'rgba(255,255,255,0.9)';c.fillStyle=col;const x=Math.round(cl.x),y=Math.round(cl.y),k=cl.s;
   c.fillRect(x,y,Math.round(30*k),Math.round(7*k));c.fillRect(x+Math.round(5*k),y-Math.round(4*k),Math.round(14*k),Math.round(5*k));c.fillRect(x+Math.round(15*k),y-Math.round(6*k),Math.round(10*k),Math.round(7*k));}
  if(s.birds){c.fillStyle=s.night?'#ccc':'#3a3a4a';for(let i=0;i<s.birds.n;i++){const bx=Math.round(s.birds.x-i*7),by=Math.round(s.birds.y+(i%2)*4+Math.sin(s.t*8+i)*1),f=Math.floor(s.t*6+i)%2;c.fillRect(bx-2,by-f,2,1);c.fillRect(bx,by,1,1);c.fillRect(bx+1,by-f,2,1);}}
  if(w==='rain'){c.fillStyle='rgba(200,220,255,0.6)';for(let i=0;i<60;i++){const x=(i*37+s.t*40)%W,y=(i*53+s.t*160)%H;c.fillRect(Math.round(x),Math.round(y),1,4);}}
  if(w==='snow'){c.fillStyle='#ffffff';for(let i=0;i<50;i++){const x=(i*37+Math.sin(s.t+i)*8)%W,y=(i*53+s.t*20)%H;c.fillRect(Math.round(x),Math.round(y),2,2);}}
  const e=s.ev;
  if(e&&e.type==='star'&&e.t<e.dur){const k=e.t/e.dur;const x=e.x0+e.dx*k*2.2,y=e.y0+e.dy*k*2.2;for(let i=0;i<14;i++){c.fillStyle=`rgba(255,250,200,${(1-i/14)*(1-k*0.6)})`;c.fillRect(Math.round(x-e.dx*i*0.04),Math.round(y-e.dy*i*0.04),2,2);}c.fillStyle='#ffffff';c.fillRect(Math.round(x)-1,Math.round(y)-1,3,3);}
  if(e&&e.type==='ufo'&&e.t<e.dur){const k=e.t/e.dur;const x=Math.round(e.x0+e.dir*k*(W+40)),y=Math.round(e.y0+Math.sin(e.t*3)*6);c.fillStyle='#bfeaff';c.fillRect(x-4,y-5,8,4);c.fillStyle='#c8c8d8';c.fillRect(x-10,y-1,20,4);c.fillStyle='#8a8aa0';c.fillRect(x-8,y+3,16,1);
   const bl=Math.floor(e.t*6)%3;['#ff6aa8','#fff0a0','#8ad870'].forEach((col,i)=>{c.fillStyle=i===bl?col:'#e8e8f0';c.fillRect(x-7+i*6,y+1,2,1);});if(e.done){c.fillStyle='rgba(255,240,160,0.25)';c.fillRect(x-6,y+4,12,H);}}
  // hill + you from behind
  c.fillStyle=s.night?'#1e3a2a':'#5cb85a';c.beginPath();c.ellipse(W/2,H+30,W*0.9,70,0,0,Math.PI*2);c.fill();c.fillStyle=s.night?'#2a4a34':'#7ad06a';c.beginPath();c.ellipse(W/2,H+38,W*0.8,64,0,0,Math.PI*2);c.fill();
  if(_player){const P=_player.up[0];c.drawImage(P,Math.round(W/2-P.width/2),H-46);}
  G.party.slice(0,3).forEach((pa,i)=>{const sp=monSpr(pa.mon.sp,monLook(pa.mon)).n;const x=Math.round(W/2+(i===0?-24:i===1?14:-40)),y=H-40+Math.round(Math.abs(Math.sin(s.t*2+i))*-1);c.drawImage(sp,x,y);});}

 // ---------- tick ----------
 function tick(){if(!S||!G.ready||!S.daily)return;if(!S.daily.postInit)daily();
  if(S.flags.toyLetter&&!S.flags.toyHand){S.flags.toyHand=1;hand('chief',{t:'これが てがみに かいた ボールよ。 ぷちっこと あそんであげてね。',items:{f_ball:1}});}
  ideas();if(G.scene==='house'&&S.flags.fitNote&&!G.lock){UI.say(`おうちに はいりきらない かぐを ${S.flags.fitNote}こ もちものに しまったよ。 ぞうちく したら また かざってね。`);S.flags.fitNote=0;}}
 return{hand,pending,handOver,houseGuest,guestTap,homeVisitor,extraMail,daily,bottleAt,draw,openBottle,skyOpen,tick};
})();

// ---------- hooks ----------
{const _gm=genMail;genMail=function(prev){_gm(prev);try{Post.extraMail(prev);}catch(e){console.error(e);}};}
grantRecipes=function(){if(!S||S.story<STORY_DONE)return;if(S.flags.villageLetter)return;S.flags.villageLetter=1;
 pushMail({from:'vil',sender:'そんちょう ハルさん',body:'{name}さんへ\n\nむらの くらしにも なれてきたかしら。\nこれからは ベンチや はなだんを そとに おいて、 むらを かざれるのよ（メニューの「むらづくり」）。\nこんど わたしに こえを かけてね。 ベンチと はなだんの レシピを おしえるわ。\nやくばの なかは しりょうかんに なっているの。 かせきや さかな、 むしを きぞう してくれると うれしいわ。\nつりざおは にゃんこしょうてんで かえるわよ。\n\nそんちょう ハル'});
 Post.hand('chief',{t:'きてくれたのね！ ベンチと はなだんの レシピよ。 さぎょうだいで つくって、 そとに かざってみてね。',recipes:['od_bench','od_flowerbed']});};
checkHouseBuild=function(){const b=S.houseBuild;if(!b||b.day===dayKey())return false;S.houseLv=b.lv;S.houseBuild=null;applyHouse();
 pushMail({from:'vil',sender:'そんちょう ハルさん',body:`{name}さんへ\n\nおうちの ぞうちくが おわったわよ。\n『${HOUSE_LV[b.lv].name}』に なったの。\nぷちっこたちも のびのび あそべるわね。\n\nそんちょう ハル`});
 if(b.lv===1)Post.hand('chief',{t:'ぞうちく おめでとう！ おいわいに すがたみを どうぞ。 きがえる ときに つかってね。',items:{f_mirror:1}});
 S.flags.houseDone=b.lv;addMemory(`おうちが『${HOUSE_LV[b.lv].name}』に なった`,'house');return true;};
{const _va=vilActive;vilActive=function(v,h){const d=S&&S.daily;if(d&&d.homeVisit===v.id&&!d.homeVisitDone&&Post.homeVisitor())return false;return _va(v,h);};}
