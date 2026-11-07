'use strict';
// ============================================================
//  むらの ものがたり logic + UI
// ============================================================
const Story=(()=>{
 const say=(t,o)=>UI.say(t,o);
 const vilPor=id=>UI.img('vp_'+id,()=>scaled(vilSpr(id).n,3),60);
 const today=()=>dayKey();
 const md=(d=NOW())=>[d.getMonth()+1,d.getDate()];
 const inRange=(m,d,f,t)=>{const v=m*100+d,a=f[0]*100+f[1],b=t[0]*100+t[1];return a<=b?(v>=a&&v<=b):(v>=a||v<=b);};

 // ---------- presence ----------
 function isPresent(v){if(v.visitor)return !!(S.daily&&S.daily.visitor===v.id);if(v.movein)return !!(S.movedIn&&S.movedIn[v.id]);return true;}
 function residents(){return VILLAGERS.filter(v=>!v.chief&&isPresent(v));}
 function allPeople(){return VILLAGERS.concat(VISITORS);}

 // ---------- world rebuild for new houses ----------
 function syncWorld(){const key=Object.keys(S.movedIn||{}).sort().join(',');if(G.worldKey===key)return;G.worldKey=key;
  G.world=buildWorld();G._hab=null;G.layers=buildMapLayers(G.world,G.season);G.layers.season=G.season;
  if(G.player&&G.scene==='map'&&!walkMap(G.player.tx,G.player.ty))placePlayer(16,28);G.vils=[];if(G.ready)syncVillagers();}
 function queueMoveIn(id){if(!S.moveQ)S.moveQ=[];if(S.movedIn&&S.movedIn[id]||S.moveQ.some(q=>q.id===id))return;S.moveQ.push({id,day:today()});}
 function checkMoveIns(){if(!S.movedIn)S.movedIn={};
  if((S.stamps||0)>=8&&!S.movedIn.riku&&!(S.moveQ||[]).some(q=>q.id==='riku')){queueMoveIn('riku');
   pushMail({from:'vil',sender:'そんちょう ハルさん',body:'{name}さんへ\n\nあしたから、 リクくんという おとこのこが むらに ひっこして くるのよ。\nむしと つりが だいすきなんですって。\nなかよく してあげてね。\n\nそんちょう ハル'});}
  for(const q of (S.moveQ||[]).slice()){if(q.day===today())continue;S.movedIn[q.id]=true;S.moveQ=S.moveQ.filter(x=>x!==q);const v=VIL[q.id];addMemory(`${v.name}が むらに ひっこして きた`,'house');
   pushMail({from:'vil',sender:v.name,body:q.id==='mint'?'{name}へ\n\nはじめまして！ ナナの てがみ ともだちの ミントです。\nきたの はらっぱに ひっこして きました！\nむらの うたを つくるのが ゆめです。 よろしくね！\n\nミントより':'{name}へ\n\nはじめまして、 リクです！\nみなみの すなはまの ちかくに ひっこして きたよ。\nむしとりと つりなら まかせて！ こんど いっしょに いこうぜ！\n\nリクより',gift:'cookie',n:3});}}

 // ---------- visitors ----------
 function pickVisitor(dk){const r=mkRng(hashStr(dk+'visit'+S.name));if(S.story<STORY_DONE||r()>0.5)return null;const c=VISITORS.filter(v=>v.id!==S.lastVisitor);return c[Math.floor(r()*c.length)].id;}
 function storyDaily(){const d=S.daily;d.bday={};d.otoshi={};d.lost=null;d.visitor=pickVisitor(d.day);if(d.visitor)S.lastVisitor=d.visitor;
  if(d.visitor==='toto'){const r=mkRng(hashStr(d.day+'goods'));const g=MERCHANT_GOODS.slice();d.goods=[];while(d.goods.length<3)d.goods.push(g.splice(Math.floor(r()*g.length),1)[0]);}
  checkMoveIns();eventLetters();}

 // ---------- villager stories ----------
 const fmtS=(l,s)=>fmt(l).replace(/\{ans\}/g,(s&&s.ans)||'');
 function askMet(a){if(!a)return true;if(a.item)return itemCount(a.item)>=a.n;if(a.cond==='album')return !!(S.album&&S.album.length);if(a.cond==='party')return partyMons().length>0;return true;}
 function stState(id){if(!S.vstory)S.vstory={};return S.vstory[id]||(S.vstory[id]={ch:0,last:'',asking:false,ans:null});}
 async function finishCh(v,c,s,o){s.asking=false;for(const l of (c.done||[]))await say(fmtS(l,s),o);const rw=c.reward||{};
  if(rw.items)for(const k in rw.items){addItem(k,rw.items[k]);UI.toast(`${ITEMS[k].name}を ${rw.items[k]}こ もらった！`,k);}
  if(rw.coins){addCoins(rw.coins);UI.toast(`${rw.coins}ポカ もらった！`,'coin');}
  if(rw.movein)queueMoveIn(rw.movein);
  s.ch++;s.last=today();if(s.ch>=VSTORY[v.id].length)addMemory(`${v.name}の おはなしを さいごまで きいた`,'scroll');const fr=S.vil[v.id]||(S.vil[v.id]={f:0,ms:0});fr.f+=2;Snd.sfx('get');save();}
 async function offer(v,c,s,o){const items=c.ask.item;const ch=await say(fmtS(c.askT,s),Object.assign({},o,{choices:items?[`わたす（${ITEMS[c.ask.item].name}×${c.ask.n}）`,'あとで']:['うん！','まだ']}));
  if(ch===0){if(items)takeItem(c.ask.item,c.ask.n);await finishCh(v,c,s,o);}}
 async function villagerStory(v,o){const L=VSTORY[v.id];if(!L)return false;const s=stState(v.id);if(s.ch>=L.length)return false;const c=L[s.ch];
  if(s.asking){if(!askMet(c.ask))return false;await offer(v,c,s,o);return true;}
  const fr=S.vil[v.id]||{f:0};if(fr.f<c.f||s.last===today())return false;
  emote(G.vils.find(x=>x.v===v)?.e||G.player,EXCL,1.2);
  for(const l of c.lines)await say(fmtS(l,s),o);
  if(c.choice){const ch=await say('どれが いい？',Object.assign({},o,{choices:c.choice}));s.ans=c.choice[Math.max(0,ch)];}
  if(c.ask){s.asking=true;if(askMet(c.ask))await offer(v,c,s,o);else{await say(fmtS(c.askT,s),o);save();}return true;}
  await finishCh(v,c,s,o);return true;}
 function pendingAsks(){const out=[];for(const id in VSTORY){const s=S.vstory&&S.vstory[id];if(!s||!s.asking)continue;const c=VSTORY[id][s.ch];if(c&&c.ask)out.push({v:VIL[id],t:fmtS(c.askT,s),ok:askMet(c.ask)});}return out;}

 // ---------- birthdays & event greetings ----------
 function isBirthday(id){const b=BIRTHDAYS[id];if(!b)return false;const[m,d]=md();return b[0]===m&&b[1]===d;}
 async function birthday(v,o){const d=S.daily;if(!isBirthday(v.id)||d.bday[v.id])return;d.bday[v.id]=1;
  const ch=await say('じつは きょう、 たんじょうび なんだ。',Object.assign({},o,{choices:['おめでとう！ プレゼントを わたす','おめでとう！']}));
  const fr=S.vil[v.id]||(S.vil[v.id]={f:0,ms:0});
  if(ch===0){const keys=Object.keys(S.items).filter(k=>ITEMS[k]&&ITEMS[k].cat!=='key'&&ITEMS[k].cat!=='egg');const pref=keys.filter(k=>(v.likes||[]).includes(k)).concat(keys.filter(k=>!(v.likes||[]).includes(k))).slice(0,8);
   if(!pref.length){await say('…きもちだけで うれしいよ。 ありがとう！',o);fr.f+=2;return;}
   const c=await say('なにを わたす？',{choices:pref.map(k=>`${ITEMS[k].name}${(v.likes||[]).includes(k)?' ♥':''}`).concat(['やめる'])});
   if(c>=0&&c<pref.length){const k=pref[c];takeItem(k);const liked=(v.likes||[]).includes(k);fr.f+=liked?6:4;Snd.jingle('fanfare');
    await say(liked?`わぁ… ${ITEMS[k].name}！ いちばん ほしかった もの！ ほんとうに ありがとう！`:`${ITEMS[k].name}！ うれしい、 だいじに するね！`,o);
    const fs=Object.keys(FURN).filter(x=>!FURN[x].gift&&!FURN[x].craft);const f=fs[hashStr(v.id+dayKey())%fs.length];addItem('f_'+f);UI.toast(`おかえしに ${FURN[f].name}を もらった！`,'f_'+f);return;}}
  fr.f+=2;await say('ありがとう！ おぼえていて くれて うれしいな。',o);}
 async function eventGreeting(v,o){const d=S.daily;const ev=currentEvents().find(e=>e.otoshidama);if(ev&&!d.otoshi[v.id]&&!v.visitor){d.otoshi[v.id]=1;const c=100+Math.floor(Math.random()*3)*100;
  await say('あけまして おめでとう！ ことしも よろしくね。 はい、 おとしだま！',o);addCoins(c);UI.toast(`おとしだま ${c}ポカ もらった！`,'coin');Snd.sfx('coin');}}
 // hook used by UI.talkVillager after the greeting line
 async function afterGreeting(v,o){if(v.visitor)return true;await eventGreeting(v,o);await birthday(v,o);return await villagerStory(v,o);}

 // ---------- chief tales & legend ----------
 function kakeraCount(){let n=0;for(let i=1;i<=5;i++)if(itemCount('kakera'+i))n++;return n;}
 async function chiefExtra(o){
  if(kakeraCount()===5&&!S.flags.legend){S.flags.legend=1;
   await UI.sayAll(['まぁ… それは こもんじょの かけら！ ぜんぶ そろったのね。','ならべて よんでみるわ。'],o);
   for(const t of KAKERA_TEXT)await say(`「${t}」`,o);
   await UI.sayAll(['…これは ぽかぽかさまの おはなしね。 むらを まもる でんせつの ぷちっこ。','なかまを おもう こころが ある とき… きっと あなたの まえにも あらわれるわ。','あしたの ひろばを たのしみに していて。'],o);
   addMemory('こもんじょの なぞが とけた','kakera5');Snd.jingle('evolve');save();return true;}
  const i=S.chiefTale||0;const t=CHIEF_TALES[i];if(t&&(S.stamps||0)>=t.st&&S.chiefTaleDay!==today()){S.chiefTale=i+1;S.chiefTaleDay=today();for(const l of t.lines)await say(fmt(l),o);return true;}
  if(isBirthday('chief')&&!S.daily.bday.chief){S.daily.bday.chief=1;await say('あら、 きょうは わたしの たんじょうび。 おぼえてて くれたの？ うれしいわ。',o);const fr=S.vil.chief||(S.vil.chief={f:0,ms:0});fr.f+=3;addItem('feast');UI.toast('ごちそうクッキーを もらった！','feast');return true;}
  return false;}
 function tryKakera(src){if(!S.vstory||!S.vstory.frog||S.vstory.frog.ch<3)return;const map={dig:'kakera3',fountain:'kakera4',star:'kakera5'};const k=map[src];if(!k||itemCount(k))return;if(Math.random()>0.22)return;
  addItem(k);setTimeout(()=>{UI.toast(`${ITEMS[k].name}を みつけた！`,k);Snd.jingle('mail');},600);}

 // ---------- visitor talk ----------
 async function talkVisitor(vo){const v=vo.v;const o={name:v.title,por:vilPor(v.id),pitch:v.pitch};const d=S.daily;emote(vo.e,NOTE,1.2);
  if(!d.talked[v.id]){d.talked[v.id]=1;quest('talk');}
  switch(v.kind){
   case 'merchant':{await say('やぁ やぁ！ たびの しょうにん トトだよ。 めずらしい ものを もってきたんだ。',o);
    const price=k=>{const it=ITEMS[k];if(it.cat==='furn'){const F=FURN[it.furn];return Math.round((F.price||1600)*1.4/10)*10;}if(it.cat==='wear')return Math.round(WEAR[it.wear].price*1.4/10)*10;return Math.round(((it.buy||it.sell*4)||200)*1.3/10)*10;};
    while(true){const goods=(d.goods||[]).filter(k=>!d.bought||!d.bought.includes(k));if(!goods.length){await say('きょうは うりきれ！ また どこかで あおう！',o);break;}
     const c=await say('どれに する？',Object.assign({},o,{choices:goods.map(k=>`${ITEMS[k].name} ${price(k)}ポカ`).concat(['やめておく'])}));if(c<0||c>=goods.length){await say('また きが むいたら よってね！',o);break;}
     const k=goods[c],p=price(k);if(S.coins<p){await say('おっと、 ポカが たりないみたいだね。',o);continue;}addCoins(-p);addItem(k);(d.bought||(d.bought=[])).push(k);Snd.sfx('buy');UI.toast(`${ITEMS[k].name}を かった！`,k);}
    return;}
   case 'musician':{if(d.music){await say('きょうも いい かぜ。 また どこかの むらで うたうよ♪',o);return;}d.music=1;
    await say('こんにちは！ たびの おんがくか、 ルルです。 いっきょく きいて いく？',o);Snd.jingle('piano');setTimeout(()=>Snd.jingle('newday'),1600);
    G.party.forEach(pa=>{pa.e.jump=0.45;hearts(pa.e.px+8,pa.e.py,3);gainAff(pa.mon,1,true);});
    await say('♪ ぽかぽか ひだまり ちいさな なかま〜 ♪','');await say('ぷちっこたちも おどってくれた！ ありがとう！',o);
    if(!S.flags.lulu){S.flags.lulu=1;addItem('f_music');UI.toast('オルゴールを もらった！','f_music');}else{addItem('cookie',3);UI.toast('ぷちクッキーを 3こ もらった！','cookie');}
    if(S.movedIn&&S.movedIn.mint)await say('ミントちゃんの うた、 すてきだったよ。 また いっしょに うたいたいな。',o);return;}
   case 'lostkid':{const L=d.lost;
    if(!L){const pool=SPECIES.filter(s=>s.rare>=1&&s.rare<=2);const sp=pool[Math.floor(Math.random()*pool.length)];const en=Object.assign(mkEnc(sp.id),{lost:true,shiny:false});d.lost={sp:sp.id,found:false,done:false,en};
     await UI.sayAll(['ぐすっ… ぼく、 ポポ。 むらを たびしてる とちゅう なんだけど…',`いっしょに いた ${sp.name}が、 どこかに いっちゃったの…`,`${HAB_JP[sp.hab]||'むらの どこか'}の ほうに いったと おもうんだ。 いっしょに さがして くれる？`],o);syncEncounters();return;}
    if(!L.found){await say(`${SP[L.sp].name}、 みつかった…？ ${HAB_JP[SP[L.sp].hab]||'むらの どこか'}の ほうだと おもうんだけど…`,o);return;}
    if(!L.done){L.done=true;await UI.sayAll([`${SP[L.sp].name}！！ よかったぁ…！`,'ほんとうに ありがとう！ これ、 たからものだけど あげる！'],o);
     let k='gem';if(S.vstory&&S.vstory.frog&&S.vstory.frog.ch>=3){for(let i=3;i<=5;i++)if(!itemCount('kakera'+i)){k='kakera'+i;break;}}if(k==='gem')k=rnd(['gem','starbit','f_ball','f_yarn']);
     addItem(k);UI.toast(`${ITEMS[k].name}を もらった！`,k);Snd.jingle('fanfare');save();return;}
    await say('また どこかで あおうね！ ばいばーい！',o);return;}
   case 'fortune':{if(d.fortuned){await say('ほしは また あした かたりかけて くるわ…',o);return;}d.fortuned=1;
    const{L}=tomorrowLines();await UI.sayAll(['ようこそ… うらないし ルナよ。 あなたの あしたを みて あげる。',...L.slice(0,2).map(x=>`…みえるわ。 ${x}`)],o);
    let k=null;if(S.vstory&&S.vstory.frog&&S.vstory.frog.ch>=3){for(let i=3;i<=5;i++)if(!itemCount('kakera'+i)){k='kakera'+i;break;}}
    if(k){await say('…それと、 これは あなたが もつべき もの。 ふるい かみきれよ。',o);}else{k='starbit';await say('ほしの かけらを おまもりに どうぞ。',o);}
    addItem(k);UI.toast(`${ITEMS[k].name}を もらった！`,k);save();return;}
   case 'painter':{const pm=partnerMon();if(d.painted){await say('いい えが かけたわ。 また いつか。',o);return;}
    if(!pm){await say('こんにちは、 えかきの セピアよ。 ぷちっこを つれて きてくれたら、 えに かいて あげる。',o);return;}
    const c=await say(`まぁ、 すてきな ${pm.name}！ えに かいても いい？`,Object.assign({},o,{choices:['おねがい！','また こんど']}));if(c!==0)return;
    d.painted=1;await say('…さら さら さら…',o);S.portrait={sp:pm.sp,look:monLook(pm),name:pm.name};delete _furn.portrait;delete _icon.f_portrait;UI.dropCache('it_f_portrait');
    addItem('f_portrait');Snd.jingle('fanfare');UI.toast(`${pm.name}の しょうぞうがを もらった！`,'f_portrait');await say('できた！ おうちに かざってね。',o);save();return;}
  }}
 function foundLost(w){const L=S.daily.lost;if(!L)return;L.found=true;w.enc.done=true;G.wilds=G.wilds.filter(x=>x!==w);puff(w.e.px+8,w.e.py+8,'#fff6a0');Snd.sfx('pet');
  UI.say(`${SP[L.sp].name}を みつけた！ ポポの ところへ かえろうね。 （ひろばの ポポに はなしかけよう）`);}

 // ---------- events ----------
 function currentEvents(date=NOW()){const[m,d]=md(date);return EVENTS.filter(e=>inRange(m,d,e.from,e.to));}
 function eventLetters(){if(!S.evSeen)S.evSeen={};const y=NOW().getFullYear();for(const e of currentEvents()){const k=e.id+y;if(S.evSeen[k])continue;S.evSeen[k]=1;addMemory(`${e.name}を むかえた`,'scroll');const g=e.gift||{};
  const gifts=[];if(g.items)for(const i in g.items)gifts.push([i,g.items[i]]);if(g.furn)gifts.push(['f_'+g.furn,1]);
  pushMail({from:'vil',sender:'そんちょう ハルさん',body:`{name}さんへ\n\n${e.letter}\n\nそんちょう ハル`,gift:gifts[0]?gifts[0][0]:null,n:gifts[0]?gifts[0][1]:1,coins:g.coins||0});
  for(const x of gifts.slice(1))S.mailQ.push({from:'vil',sender:'むらの みんな',body:`{name}さんへ\n\n${e.name}の おすそわけです。\n\nむらの みんなより`,gift:x[0],n:x[1]});}}
 function upcoming(days=45){const out=[];const base=NOW();for(let i=0;i<days;i++){const d=new Date(base);d.setDate(d.getDate()+i);const[m,dd]=md(d);
  for(const e of EVENTS)if(e.from[0]===m&&e.from[1]===dd||(i===0&&inRange(m,dd,e.from,e.to)))out.push({i,date:d,t:e.name,ev:e});
  for(const id in BIRTHDAYS){const b=BIRTHDAYS[id];if(b[0]===m&&b[1]===dd&&(isPresent(VIL[id])||VIL[id].chief))out.push({i,date:d,t:`${VIL[id].name}の たんじょうび`,bday:id});}}return out;}
 function newsHtml(){const ev=currentEvents();const parts=[];ev.forEach(e=>parts.push(`<div class="nsec ev"><b>🎉 ${e.name}</b><br>${e.news}</div>`));
  const bd=Object.keys(BIRTHDAYS).filter(id=>isBirthday(id)&&(isPresent(VIL[id])||VIL[id].chief));bd.forEach(id=>parts.push(`<div class="nsec ev"><b>🎂 きょうは ${VIL[id].name}の たんじょうび！</b><br>はなしかけて おいわい しよう。</div>`));
  const up=upcoming(10).filter(x=>x.i>0&&!x.bday).slice(0,1);up.forEach(x=>parts.push(`<div class="nsec"><b>もうすぐ</b>：あと ${x.i}にちで「${x.t}」</div>`));
  const vz=S.daily.visitor&&VIL[S.daily.visitor];if(vz)parts.push(`<div class="nsec"><b>ひろばに おきゃくさん</b>：${vz.title}が きているよ。</div>`);
  if(S.moveQ&&S.moveQ.length)parts.push(`<div class="nsec"><b>おしらせ</b>：あした あたらしい ひとが ひっこして くるよ。</div>`);
  return parts.join('');}
 function calendar(){UI.panel('カレンダー',body=>{const list=upcoming(60);const el=UI.el;
  if(!list.length)body.append(el('div','empty','しばらく ぎょうじは ないみたい。'));
  list.forEach(x=>{const r=el('div','qrow'+(x.i===0?' story':''));r.append(el('div','qt',`${x.date.getMonth()+1}/${x.date.getDate()}（${WDAY[x.date.getDay()]}）　${x.bday?'🎂 ':'🎉 '}${x.t}`));
   r.append(el('div','desc',x.i===0?'きょう！':`あと ${x.i}にち`+(x.ev?`　${x.ev.news}`:'')));body.append(r);});});}
 const DECO_COL={xmas:['#ff5a5a','#5cbf5a','#ffd040'],lantern:['#ff6a4a','#ffffff'],momiji:['#e8502a','#ffa030'],sakura:['#ffb0cc','#ffffff'],heart:['#ff6a9a','#ffd0dc'],shogatsu:['#ff5a5a','#ffffff'],tanabata:['#5ab0f0','#ffd040','#ff8ab0'],halloween:['#ff8a20','#6a4ab0'],flag:['#ff5a5a','#4a9ae8','#ffd040']};
 function drawDeco(c,ox,oy){const ev=currentEvents()[0];if(!ev||!ev.deco)return;const cols=DECO_COL[ev.deco]||['#fff'];
  const y=10*TS-9-oy;c.fillStyle='rgba(60,40,30,0.7)';for(let x=5*TS;x<=30*TS;x+=2){const sag=Math.sin(((x-5*TS)%(5*TS))/(5*TS)*Math.PI)*5;c.fillRect(x-ox,Math.round(y+sag),2,1);}
  for(let i=0,x=5*TS+6;x<30*TS;x+=12,i++){const sag=Math.sin(((x-5*TS)%(5*TS))/(5*TS)*Math.PI)*5;const px=x-ox,py=Math.round(y+sag)+1;if(px<-8||px>G.vw+8)continue;
   if(ev.deco==='heart')c.drawImage(HEART,px-3,py);else if(ev.deco==='flag'){c.fillStyle=cols[i%cols.length];c.fillRect(px-2,py,5,2);c.fillRect(px-1,py+2,3,2);c.fillRect(px,py+4,1,1);}
   else{c.fillStyle=cols[i%cols.length];const on=ev.deco==='xmas'?((Math.floor(G.t*2)+i)%3>0):true;c.globalAlpha=on?1:0.4;c.fillRect(px-1,py,3,3+(ev.deco==='lantern'?2:0));c.globalAlpha=1;}}
  const cx=13*TS-ox,cy=13*TS-oy;
  if(ev.deco==='xmas'){c.drawImage(decoTree(),cx-4,cy-22);}
  if(ev.deco==='shogatsu'){const k=furnSpr('kadomatsu');c.drawImage(k,24*TS-ox-2,13*TS-oy-6);c.drawImage(k,26*TS-ox-2,13*TS-oy-6);}
  if(ev.deco==='tanabata'){c.drawImage(furnSpr('tanabata'),cx-2,cy-8);}
  if(ev.deco==='halloween'){const p=furnSpr('pumpkinlamp');[[9,15],[13,13],[21,15],[26,15]].forEach(([x,yy])=>c.drawImage(p,x*TS-ox-2,yy*TS-oy-2));}
  if(ev.deco==='momiji'){c.drawImage(furnSpr('momiji'),cx-2,cy-6);}
  if(ev.fireworks){const h=NOW().getHours();if(h>=19&&h<23){if(!G.fw)G.fw=[];if(Math.random()<0.02){const fx=G.vw*(0.2+Math.random()*0.6),fy=10+Math.random()*G.vh*0.25,col=rnd(['#ff6a6a','#ffd040','#7ac8ff','#ff9ac0','#a8ff7a']);for(let k=0;k<24;k++){const a=k/24*Math.PI*2;G.fw.push({x:fx,y:fy,vx:Math.cos(a)*30,vy:Math.sin(a)*30,t:1.2,col});}Snd.sfx('pop');}}}
  if(G.fw&&G.fw.length){for(let i=G.fw.length-1;i>=0;i--){const p=G.fw[i];p.t-=1/60;p.x+=p.vx/60;p.y+=p.vy/60;p.vy+=0.4;if(p.t<=0){G.fw.splice(i,1);continue;}c.globalAlpha=Math.min(1,p.t);c.fillStyle=p.col;c.fillRect(Math.round(p.x),Math.round(p.y),2,2);}c.globalAlpha=1;}}
 let _tree=null;function decoTree(){if(_tree)return _tree;const g=new Grid(24,32);const pal={g:'#2e8a4a',G:'#4ab060',b:'#7a4e2a',y:'#ffd040',r:'#ff5a5a',w:'#ffffff',u:'#5a9ae8'};
  for(let l=0;l<3;l++){const top=4+l*8,w=4+l*4;for(let j=0;j<9;j++){const hw=Math.round(w*j/9)+1;g.rect(12-hw,top+j,hw*2,1,j%3?'g':'G');}}g.rect(10,29,4,3,'b');
  g.rows(["..y..",".yyy.","yyyyy",".y.y."],10,0);[[9,10,'r'],[15,14,'u'],[8,19,'y'],[14,21,'r'],[11,25,'u'],[17,26,'y'],[6,26,'w'],[12,16,'w']].forEach(([x,y,c])=>g.set(x,y,c));_tree=renderGrid(g,pal,{noShade:'yrwu'});return _tree;}

 return{isPresent,residents,syncWorld,queueMoveIn,storyDaily,afterGreeting,chiefExtra,tryKakera,talkVisitor,foundLost,currentEvents,newsHtml,calendar,drawDeco,pendingAsks,kakeraCount,stState};
})();
