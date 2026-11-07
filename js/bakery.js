'use strict';
// ============================================================
//  パンやさん ごっこ — run the counter of パンじろう's bakery
//  order → pick dough onto the tray → oven timing → wrap → hand over
//  gentle: no fail state, slow patience hearts, can close the shop any time
// ============================================================
const BAKE_MENU=[
 {id:'round',name:'まるパン',lv:1,c:{a:'#e8a858',b:'#f8d8a0',c:'#b8783a'}},
 {id:'crois',name:'クロワッサン',lv:1,c:{a:'#d8903a',b:'#f0c070',c:'#9a5a22'}},
 {id:'melon',name:'メロンパン',lv:1,c:{a:'#f0d070',b:'#fff0b0',c:'#c8a040'}},
 {id:'choco',name:'チョココロネ',lv:2,c:{a:'#e0a860',b:'#6a3a1a',c:'#a86a3a'}},
 {id:'an',name:'あんパン',lv:3,c:{a:'#b8682a',b:'#e8a868',c:'#fff4d0'}},
 {id:'curry',name:'カレーパン',lv:4,c:{a:'#c88a3a',b:'#e8b860',c:'#8a5a22'}},
 {id:'shoku',name:'しょくパン',lv:5,c:{a:'#f4e0b8',b:'#b8783a',c:'#fffaf0'}},
];
const BAKE_LV=[0,0,12,35,70,120]; // total ★ needed for lv1..5

const Bakery=(()=>{
 const el=(...a)=>UI.el(...a);
 const ico={};
 function icon(id){if(ico[id])return ico[id];const g=new Grid(16,16);let pal;const B=BAKE_MENU.find(b=>b.id===id);
  const clr=(x,y,w,h)=>{for(let j=y;j<y+h;j++)for(let i=x;i<x+w;i++)g.set(i,j,null);};
  switch(id){
   case 'round':pal=B.c;g.ellipse(8,9,6.5,4.5,'a');g.ellipse(8,8,4,2.5,'b');g.set(6,7,'w');pal=Object.assign({w:'#fffaf0'},pal);break;
   case 'crois':pal=B.c;g.ellipse(8,9,7,4,'a');g.rect(5,6,1,7,'c');g.rect(8,5,1,8,'c');g.rect(11,6,1,7,'c');g.rect(6,7,2,2,'b');g.rect(9,6,2,2,'b');clr(5,12,7,2);clr(6,11,5,1);break;
   case 'melon':pal=B.c;g.circle(8,8.5,6,'a');for(let k=-6;k<=6;k+=3){for(let t=-6;t<=6;t++){const x=8+t,y1=8+t+k,y2=8-t+k;if(g.get(x,y1))g.set(x,y1,'c');if(g.get(x,y2))g.set(x,y2,'c');}}g.set(6,6,'b');g.set(7,6,'b');break;
   case 'choco':pal=B.c;g.rows([".........bbbb.","......aabbbbbb","....aacaabbbbb","..aacaacaabbb.","aacaacaa......",".aacaa........","..a..........."],1,4,{a:'a',b:'b',c:'c'});break;
   case 'an':pal=B.c;g.ellipse(8,9,6.5,4.5,'a');g.ellipse(8,8,4,2.5,'b');g.set(8,6,'c');g.set(7,7,'c');g.set(9,7,'c');pal=Object.assign({},pal);break;
   case 'curry':pal=B.c;g.ellipse(8,9,7,4,'a');for(const[x,y]of[[4,8],[6,7],[9,7],[11,8],[7,10],[10,10],[5,10],[12,10],[8,8]])g.set(x,y,(x+y)%2?'b':'c');break;
   case 'shoku':pal=B.c;g.rect(3,6,10,8,'b');g.circle(5.5,6,2.5,'b');g.circle(10.5,6,2.5,'b');g.rect(4,7,8,6,'c');g.ellipse(5.5,6.3,1.6,1.2,'c');g.ellipse(10.5,6.3,1.6,1.2,'c');break;
   case 'bag':pal={a:'#d8a868',b:'#b8884a',r:'#ff6a8a'};g.rect(4,4,9,11,'a');g.rect(4,4,9,2,'b');g.rect(7,2,3,2,'b');g.set(7,9,'r');g.set(9,9,'r');g.rect(7,10,3,1,'r');g.set(8,11,'r');break;
   case 'box':pal={w:'#fff4f6',p:'#ffc0d0',r:'#ff4a6a'};g.rect(2,6,13,9,'w');g.rect(2,5,13,2,'p');g.rect(8,5,1,10,'r');g.rect(2,10,13,1,'r');g.rows(["x...x","xx.xx",".xxx."],6,2,{x:'r'});break;
   case 'tray':pal={a:'#c8c8d8',b:'#9a9aaa'};g.rect(1,10,14,3,'a');g.rect(1,12,14,1,'b');break;
  }
  ico[id]=renderGrid(g,pal);return ico[id];}
 const img=(id,size)=>UI.img('bk_'+id,()=>icon(id),size);
 const st=()=>S.bakery||(S.bakery={lv:1,stars:0,days:0,best:0});
 const unlocked=()=>BAKE_MENU.filter(b=>b.lv<=st().lv);
 function lvFor(stars){let lv=1;for(let i=2;i<BAKE_LV.length;i++)if(stars>=BAKE_LV[i])lv=i;return lv;}

 const HINT={order:'いらっしゃいませ〜！ ちゅうもんを よく きいてね。',pick:'たなから ちゅうもんの パンを えらんで トレーに のせよう。',
  bake:'オーブンだ！ パンが きんいろに なったら 「とりだす！」',wrap:'ふくろか はこか… おきゃくさんの いったほうで つつもう。'};
 const REACT=[['えへへ… つぎも たのしみに してるね！'],['あれれ？ …でも ありがとう！','ちょっと ちがうけど、 これも おいしそう！'],
  ['ありがとう！ おいしそう！','うん、 いいかんじ！ ありがとう！'],['わあ！ かんぺき！ ありがとう！','いい においー！ また くるね！','すごい！ ほかほかだ！']];
 const BOSS=['どんまい、 どんまい！ つぎ いこう！','いいねぇ、 そのちょうし！','うん、 なかなか！','かんぺきだ！ きみ、 パンやの さいのう あるねぇ！'];

 function play(opt={}){return new Promise(res=>{
  G.lock++;const s=st();const repeat=!!opt.repeat;
  const ov=el('div','catch');const box=el('div','cbox win bk');ov.append(box);document.getElementById('overlay').append(ov);
  const pool=Story.residents().filter(v=>v.id!=='bear').map(v=>({kind:'v',v})).concat(S.creatures.slice(0,8).map(m=>({kind:'m',m})));
  const N=Math.min(7,5+Math.floor((s.lv-1)/2));let idx=0,total=0,coins=0,cust=null,tray=[],bake=null,wrap=null,closed=false,timer=null,patT=null;
  box.innerHTML=`<div class="bk-top"><span class="ctitle">パンやさん ごっこ</span><span class="bk-cnt"></span><button class="btn bk-x">おみせを しめる</button></div>
   <div class="bk-shop"><div class="bk-awn"></div><div class="bk-cust"></div><div class="bk-ctr"></div></div>
   <div class="bk-boss"></div><div class="bk-work"></div>`;
  const q=s=>box.querySelector(s);const custEl=q('.bk-cust'),ctr=q('.bk-ctr'),boss=q('.bk-boss'),work=q('.bk-work'),cnt=q('.bk-cnt');
  const bossPor=UI.img('vp_bear',()=>scaled(vilSpr('bear').n,3),40);
  function say(t){boss.innerHTML='';boss.append(bossPor.cloneNode());boss.append(el('div','bk-say',t));}
  q('.bk-x').onclick=()=>{if(closed)return;Snd.sfx('tap');finish();};
  const nameOf=c=>c.kind==='v'?c.v.name:c.m.name;
  const porOf=c=>c.kind==='v'?UI.img('vp_'+c.v.id,()=>scaled(vilSpr(c.v.id).n,3),72):UI.monImgM(c.m,72);
  function trayView(){ctr.innerHTML='';const t=el('div','bk-tray');t.append(img('tray',36));tray.forEach(id=>t.append(img(id,30)));if(wrap){t.append(img(wrap,30));}ctr.append(t);}
  function hearts(){const h=custEl.querySelector('.bk-pat');if(h)h.textContent='♥'.repeat(cust.pat)+'♡'.repeat(3-cust.pat);}

  // ---- new customer ----
  function next(){clearInterval(patT);if(closed)return;if(idx>=N||!pool.length)return finish();idx++;cnt.textContent=`${idx} / ${N}にんめ`;
   let c;do{c=rnd(pool);}while(pool.length>1&&cust&&nameOf(c)===nameOf(cust.c));
   const menu=unlocked();const two=s.lv>=3&&Math.random()<0.4;const want=[rnd(menu).id];if(two)want.push(rnd(menu).id);
   cust={c,want,wrap:Math.random()<0.5?'bag':'box',pat:3};tray=[];bake=null;wrap=null;
   custEl.innerHTML='';const por=porOf(c);por.classList.add('bk-in');custEl.append(por);
   const b=el('div','bubble bk-bub');want.forEach(id=>b.append(img(id,28)));b.append(el('span',null,'＋'));b.append(img(cust.wrap,28));
   const names=want.map(id=>BAKE_MENU.find(x=>x.id===id).name);const same=want.length===2&&want[0]===want[1];
   const line=(same?`${names[0]}を 2こ`:names.join('と '))+(cust.wrap==='bag'?'、 ふくろに いれて ください！':'、 おみやげなので はこで おねがい！');
   const col=el('div','bk-col');col.append(el('div','bk-nm',nameOf(c)));col.append(b);col.append(el('div','bk-line',line));col.append(el('div','bk-pat'));custEl.append(col);hearts();
   Snd.sfx('pop');say(HINT.order);trayView();patT=setInterval(()=>{if(cust.pat>1){cust.pat--;hearts();}},14000);
   setTimeout(()=>{if(!closed)pick();},500);}

  // ---- step 1: pick ----
  function pick(){say(HINT.pick);work.innerHTML='';const g=el('div','bk-grid');
   unlocked().forEach(B=>{const b=el('button','btn bk-bread');b.append(img(B.id,30));b.append(el('span',null,B.name));
    b.onclick=()=>{if(tray.length>=3){Snd.sfx('miss');return;}tray.push(B.id);Snd.sfx('tap');trayView();go.disabled=false;};g.append(b);});
   work.append(g);const row=el('div','bk-row');const undo=el('button','btn','やりなおし');undo.onclick=()=>{tray=[];trayView();go.disabled=true;Snd.sfx('tap');};
   const go=el('button','btn gold','オーブンへ ▶');go.disabled=true;go.onclick=()=>{Snd.sfx('tap');oven();};row.append(undo,go);work.append(row);}

  // ---- step 2: oven timing ----
  function oven(){say(HINT.bake);work.innerHTML='';const wrapEl=el('div','bk-oven');const win=el('div','bk-owin');const breads=el('div','bk-obr');tray.forEach(id=>breads.append(img(id,34)));win.append(breads);wrapEl.append(win);
   const bar=el('div','bk-gauge');bar.innerHTML='<div class="bk-zone"></div><div class="bk-perf"></div><div class="bk-needle"></div>';wrapEl.append(bar);
   const lab=el('div','bk-glab','<span>なま</span><span>こんがり</span><span>こげ</span>');wrapEl.append(lab);work.append(wrapEl);
   const btn=el('button','btn gold bk-big','とりだす！');work.append(btn);const nd=bar.querySelector('.bk-needle');
   let p=0;const sp=100/(4.2-Math.min(1.2,s.lv*0.18));let last=performance.now();
   const stop=()=>{clearInterval(timer);timer=null;};
   const take=()=>{if(timer===null)return;stop();bake=p>=58&&p<=72?'perfect':p>=48&&p<=82?'good':p<50?'raw':'burnt';
    Snd.sfx(bake==='perfect'?'star':bake==='good'?'coin':'miss');const msg={perfect:'きんいろ！ かんぺきな やきかげん！',good:'いいかんじに やけた！',raw:'ちょっと はやかった… まだ しろっぽい',burnt:'あちゃ、 すこし こげちゃった…'}[bake];
    say(msg);btn.disabled=true;setTimeout(()=>{if(!closed)wrapStep();},900);};
   btn.onclick=take;
   timer=setInterval(()=>{const now=performance.now();p+=sp*Math.min(0.1,(now-last)/1000);last=now;if(p>=100){p=100;}nd.style.left=p+'%';
    breads.style.filter=`brightness(${(1.25-p/100*0.75).toFixed(2)}) saturate(${(0.6+p/100*0.8).toFixed(2)})`;if(p>=100)take();},40);}

  // ---- step 3: wrap ----
  function wrapStep(){say(HINT.wrap);work.innerHTML='';const row=el('div','bk-row');
   [['bag','ふくろ'],['box','はこ']].forEach(([k,n])=>{const b=el('button','btn bk-wrap');b.append(img(k,40));b.append(el('span',null,n));b.onclick=()=>{wrap=k;Snd.sfx('tap');trayView();serve();};row.append(b);});work.append(row);}

  // ---- step 4: hand over ----
  function serve(){clearInterval(patT);work.innerHTML='';
   const a=tray.slice().sort().join(),b=cust.want.slice().sort().join();let stars=(a===b?1:0)+((bake==='perfect'||bake==='good')?1:0)+(wrap===cust.wrap?1:0);
   let c=stars*15;if(bake==='perfect')c+=10;if(stars===3&&cust.pat>=2)c+=10;if(repeat)c=Math.round(c/2);total+=stars;coins+=c;
   const r=el('div','bk-res');r.append(el('div','bk-stars','★'.repeat(stars)+'☆'.repeat(3-stars)));
   const tips=[];if(a!==b)tips.push('パンが ちがったみたい');if(!(bake==='perfect'||bake==='good'))tips.push('やきかげんが いまいち');if(wrap!==cust.wrap)tips.push(cust.wrap==='bag'?'ふくろが よかったみたい':'はこが よかったみたい');
   r.append(el('div','bk-line',`${nameOf(cust.c)}「${rnd(REACT[stars])}」`));if(tips.length)r.append(el('div','desc',tips.join('・')));r.append(el('div','desc',`+${c}ポカ`));work.append(r);
   say(BOSS[stars]);Snd.sfx(stars>=2?'coin':'tap');const por=custEl.querySelector('.bk-in');if(por)por.classList.add(stars>=2?'bk-hop':'bk-tilt');
   const nb=el('button','btn gold',idx>=N?'けっかを みる':'つぎの おきゃくさん ▶');nb.onclick=()=>{Snd.sfx('tap');next();};work.append(nb);}

  // ---- close shop ----
  function finish(){if(closed)return;closed=true;clearInterval(timer);clearInterval(patT);timer=null;
   const served=cust&&wrap?idx:Math.max(0,idx-1);const before=s.lv;s.stars+=total;s.lv=lvFor(s.stars);if(!repeat)s.days++;s.best=Math.max(s.best,total);
   addCoins(coins);let extra='';if(!repeat&&served>=3&&total>=served*2.4){addItem('pokapan',2);extra+='<br>おれいに むらの パンを 2こ もらった！';}
   const fr=S.vil.bear||(S.vil.bear={f:0,ms:0});fr.f+=1;if(s.days===1&&!repeat)addMemory('パンやさんで はじめて おみせばんを した','pokapan');
   custEl.innerHTML='';work.innerHTML='';ctr.innerHTML='';cnt.textContent='';q('.bk-x').remove();const bp=UI.img('vp_bear',()=>scaled(vilSpr('bear').n,3),72);bp.classList.add('bk-in','bk-hop');custEl.append(bp);custEl.append(el('div','bk-col',`<div class="bk-nm">パンじろう</div><div class="bk-line">${served?'おつかれさま！ たすかったよ。':'また きてね。'}</div>`));
   const r=el('div','bk-res');r.innerHTML=`<div class="ctitle">きょうの おみせ</div>おきゃくさん ${served}にん　★ ${total}<br>${coins}ポカ もらった！${extra}`;
   const nx=BAKE_LV[s.lv+1];if(nx!==undefined){const pc=Math.min(100,Math.round((s.stars-BAKE_LV[s.lv])/(nx-BAKE_LV[s.lv])*100));const nb=BAKE_MENU.find(b=>b.lv===s.lv+1);
    r.append(el('div','desc',`おみせレベル ${s.lv}　つぎの レベルで ${nb?nb.name:'あたらしい パン'}が つくれるよ`));const bar=el('div','bar');bar.innerHTML=`<div style="width:${pc}%"></div>`;r.append(bar);}
   else r.append(el('div','desc',`おみせレベル ${s.lv}（さいこう！）`));
   work.append(r);let msg=served?BOSS[Math.min(3,Math.round(total/Math.max(1,served)))]:'また いつでも てつだいに きてね。';
   if(s.lv>before){const nb=BAKE_MENU.filter(b=>b.lv===s.lv).map(b=>b.name).join('と ');msg=`おみせレベルが ${s.lv}に あがった！ これからは ${nb}も つくって もらおうかな！`;Snd.jingle('fanfare');}
   else if(served)Snd.jingle('fanfare');say(msg);
   const b=el('button','btn gold','おつかれさま');b.onclick=()=>{ov.remove();G.lock--;save();res({served,total,lvUp:s.lv>before});};work.append(b);}

  next();});}
 return{play,icon,st};
})();
