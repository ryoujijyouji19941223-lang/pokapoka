'use strict';
// ============================================================
//  きりの よる (gentle night defense) & はたけの あおむし
//  no penalties: mists just fade at dawn if left alone
// ============================================================
const MIST_TYPES = {
 fog:{name:'きりもや',weak:'kaze',col:'#c8d0e0'},chill:{name:'ひえもや',weak:'hono',col:'#9ad0ff'},dark:{name:'やみもや',weak:'denki',col:'#6a5aa0'},
 dry:{name:'かれもや',weak:'mizu',col:'#c8a878'},thorn:{name:'とげもや',weak:'kusa',col:'#8aa868'},gloom:{name:'しずみもや',weak:'yozora',col:'#8a7aaa'},
};
ITEMS.mistdrop={name:'きりの しずく',sell:80,cat:'mat',col:'#c8e0ff',desc:'きりもやを はらうと のこる ふしぎな しずく。 クラフトに つかう。'};
FURN.mistlamp={name:'きりの ランタン',price:800,craft:true,light:true};ITEMS.f_mistlamp={name:FURN.mistlamp.name,sell:200,cat:'furn',furn:'mistlamp',desc:'きりの しずくで つくった ランタン。'};
RECIPES.mistlamp={out:'f_mistlamp',need:{mistdrop:3,iron:1}};START_RECIPES.push('mistlamp');SERIES.find(s=>s.id==='light').items.push('mistlamp');

const Mist=(()=>{
 const el=(...a)=>UI.el(...a);
 const night=()=>{const h=NOW().getHours();return h>=19||h<1;};
 function daily(){const d=S.daily;const r=mkRng(hashStr(d.day+'mist'+S.name));d.mistNight=S.story>=STORY_DONE&&(S.stamps||0)>=3&&r()<0.28;d.mists=null;d.mistDone=false;
  d.pests=[];const plots=Object.keys(S.farm).filter(k=>S.farm[k].crop&&cropStage(S.farm[k])<3);if(plots.length&&r()<0.35){const n=1+Math.floor(r()*Math.min(3,plots.length));for(let i=0;i<n;i++){const k=plots.splice(Math.floor(r()*plots.length),1)[0];d.pests.push({k,done:false});}}}
 function spawn(){const d=S.daily;const H=habTiles();const tiles=H.any.concat(H.grass,H.plaza).filter(([x,y])=>!S.farm[fk(x,y)]&&!(S.outdoor||[]).some(o=>o.x===x&&o.y===y));const keys=Object.keys(MIST_TYPES);d.mists=[];
  const owned=new Set(S.creatures.map(m=>SP[m.sp].type));const pref=keys.filter(k=>owned.has(MIST_TYPES[k].weak));
  for(let i=0;i<5&&tiles.length;i++){const c=tiles.splice(Math.floor(Math.random()*tiles.length),1)[0];const t=(pref.length&&Math.random()<0.75)?rnd(pref):rnd(keys);d.mists.push({x:c[0],y:c[1],type:t,hp:2,done:false});}}
 function tick(){if(!S||!G.ready||!S.daily)return;const d=S.daily;if(!d.mistNight||d.mistDone)return;
  if(night()&&G.scene==='map'&&!d.mists&&!G.lock){spawn();Snd.sfx('star');UI.say('…むらに きりが でてきた。 もやもやした ものが うろうろ している…\nぷちっこと いっしょに タップして はらおう！ とくいな タイプの こだと いっぱつだよ。');}}
 function active(){const d=S.daily;return d&&d.mistNight&&d.mists&&!d.mistDone&&night();}
 function at(tx,ty){if(!active())return -1;return S.daily.mists.findIndex(m=>!m.done&&Math.abs(m.x-tx)<=0&&Math.abs(m.y-ty)<=0);}
 const _spr={};function mistSpr(type){if(_spr[type])return _spr[type];const T=MIST_TYPES[type];const g=new Grid(16,16);g.rows(TEMPLATES.ghost);const pal={a:T.col,e:'#2a2238',p:darken(T.col,0.8),m:'#2a2238',w:lighten(T.col,0.5)};
  _spr[type]=renderGrid(g,pal,{outlineColor:darken(T.col,0.5)});return _spr[type];}
 function draw(c,ox,oy){const d=S&&S.daily;if(!d)return;
  if(d.pests)d.pests.forEach(p=>{if(p.done||!S.farm[p.k])return;const[x,y]=p.k.split(',').map(Number);const px=x*TS-ox+4+Math.round(Math.sin(G.t*3+x)*2),py=y*TS-oy+9;c.fillStyle='#3a7a2a';c.fillRect(px-1,py-1,9,4);c.fillStyle='#8ad05a';c.fillRect(px,py,7,2);c.fillStyle='#2a2238';c.fillRect(px+6,py,1,1);});
  if(!active())return;
  c.fillStyle='rgba(220,226,240,0.16)';c.fillRect(0,0,G.vw,G.vh);
  for(let i=0;i<14;i++){const x=((i*53+G.t*6)%(G.vw+60))-30,y=(i*37)%G.vh;c.fillStyle='rgba(235,240,250,0.10)';c.fillRect(Math.round(x),Math.round(y),38,10);}
  d.mists.forEach((m,i)=>{if(m.done)return;const spr=mistSpr(m.type);const px=Math.round(m.x*TS-ox+Math.sin(G.t*1.2+i)*3)-2,py=Math.round(m.y*TS-oy-6+Math.sin(G.t*2+i)*2)-2;c.globalAlpha=m.hp>1?0.85:0.55;c.drawImage(spr,px,py);c.globalAlpha=1;});}
 function lights(arr){if(!active())return;S.daily.mists.forEach(m=>{if(!m.done)arr.push([m.x*TS+8,m.y*TS+4,14,0.35]);});}
 async function fight(i){const d=S.daily;const m=d.mists[i];if(!m||m.done)return;const T=MIST_TYPES[m.type];
  const party=G.party.filter(p=>!p.hidden);if(!party.length){UI.say('ぷちっこが いないと はらえないみたい…');return;}
  const ch=await UI.say(`${T.name}が いる！ だれに たのむ？`,{choices:party.map(p=>{const tp=SP[p.mon.sp].type;return `${p.mon.name}（${TYPES[tp].jp}）${tp===T.weak?' ◎':''}`;}).concat(['やめる'])});
  if(ch<0||ch>=party.length)return;const pa=party[ch];if(enLeft(pa.mon)<=0){UI.toast(`${pa.mon.name}は つかれている… ごはんで げんきを あげよう`,pa.mon.sp);return;}
  d.en[pa.mon.uid]=(d.en[pa.mon.uid]||0)+1;const eff=SP[pa.mon.sp].type===T.weak;pa.e.jump=0.45;emote(pa.e,SPARK,0.8);
  for(let k=0;k<10;k++)G.parts.push({x:m.x*TS+8,y:m.y*TS+4,vx:Math.random()*60-30,vy:-20-Math.random()*30,life:0.7,max:0.7,col:eff?'#fff6a0':'#e8f0ff',sz:2});
  m.hp-=eff?2:1;gainExp(pa.mon,eff?6:3);Snd.sfx(eff?'hit':'tap');
  if(m.hp<=0){m.done=true;addItem('mistdrop');quest('mist');UI.toast(eff?`こうかは ばつぐん！ ${T.name}が きえた！ きりの しずくを てにいれた`:`${T.name}を はらった！ きりの しずくを てにいれた`,'mistdrop');}
  else UI.toast(`${T.name}が すこし うすく なった！（あと すこし）`);
  if(d.mists.every(x=>x.done)){d.mistDone=true;setTimeout(cleared,700);}save();}
 function cleared(){const d=S.daily;addCoins(300);Snd.jingle('fanfare');addMemory('きりの よるを みんなで のりこえた','mistdrop');
  const pool=SPECIES.filter(s=>s.rare>=2&&s.rare<=3&&S.dex[s.id]!=='c'&&(s.season==='*'||s.season.split(',').includes(seasonOf())));
  if(pool.length&&Math.random()<0.6){const sp=rnd(pool);const en=Object.assign(mkEnc(sp.id,[G.player.tx,G.player.ty]),{story:true,shiny:false});d.enc.push(en);syncEncounters();
   UI.say(`きりが はれて、 ほしぞらが もどった！ 300ポカ もらった。\n…あれ？ きりの なかから ${sp.name}が でてきた。 こまっている みたい… やさしく なでてあげよう！`);}
  else UI.say('きりが はれて、 ほしぞらが もどった！ むらの みんなが よろこんでいる。 300ポカ もらった。');}
 function pestAt(tx,ty){const d=S.daily;return d&&d.pests?d.pests.find(p=>!p.done&&p.k===fk(tx,ty)):null;}
 async function pest(tx,ty){const p=pestAt(tx,ty);if(!p)return false;const party=G.party.filter(x=>!x.hidden);
  if(!party.length){p.done=true;UI.toast('あおむしを そっと にがしてあげた');return true;}const pa=party[0];pa.e.jump=0.45;p.done=true;gainExp(pa.mon,2);Snd.sfx('pop');puff(tx*TS+8,ty*TS+8,'#8ad05a',6);
  UI.toast(`${pa.mon.name}が あおむしを もりへ かえしてあげた！`,pa.mon.sp);quest('mist');save();return true;}
 function newsLine(){const d=S.daily;if(d&&d.mistNight&&!d.mistDone)return '<div class="nsec ev"><b>🌫 こんやは きりが でそう</b><br>よる 7じごろから むらに きりもやが あらわれるかも。 ぷちっこと はらおう。</div>';
  if(d&&d.pests&&d.pests.some(p=>!p.done))return '<div class="nsec"><b>はたけに あおむし</b>：はたけを タップして もりへ かえしてあげよう。</div>';return '';}
 function strongVs(m){const tp=SP[m.sp].type;const k=Object.keys(MIST_TYPES).find(k=>MIST_TYPES[k].weak===tp);return k?MIST_TYPES[k].name:'';}
 return{daily,tick,at,draw,lights,fight,pestAt,pest,newsLine,strongVs};
})();
