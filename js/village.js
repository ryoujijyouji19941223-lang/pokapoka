'use strict';
// ============================================================
//  むらづくり: outdoor decor, village rating, museum, memories
// ============================================================
const OUTDOOR = {
 bench:{name:'もくせいの ベンチ',need:{wood:4},desc:'すわると ぷちっこが すこし げんきに なる'},
 flowerbed:{name:'はなだん',need:{wildflower:3,stone:2},desc:'はなが さいて むらが あかるく なる'},
 olamp:{name:'がいとう',need:{iron:2,stone:3},desc:'よるの みちを てらす',light:true},
 birdhouse:{name:'ことりの いえ',need:{wood:3,branch:2},desc:'ことりが あそびに くる'},
 picnic:{name:'ピクニックシート',need:{wildflower:2,branch:2},desc:'ぷちっこと ひとやすみ',walk:true},
 stoneroad:{name:'いしだたみ',need:{stone:2},desc:'あるきやすい いしの みち',walk:true},
 signpost:{name:'むらの かんばん',need:{wood:2,branch:1},desc:'「ようこそ ぽかぽか村へ」'},
 statue:{name:'ぽかぽかさまの ぞう',need:null,desc:'むらの ほこり。 ひょうか ★5の しるし'},
};
for(const k in OUTDOOR){ITEMS['od_'+k]={name:OUTDOOR[k].name,sell:40,cat:'outdoor',desc:OUTDOOR[k].desc+'。 メニューの「むらづくり」で そとに おけるよ。'};if(OUTDOOR[k].need)RECIPES['od_'+k]={out:'od_'+k,need:OUTDOOR[k].need};}
START_RECIPES.push('od_bench','od_stoneroad','od_signpost','od_flowerbed','od_picnic');
const FOSSILS = ['アンモナイト','さんようちゅう','こはく','ぷちサウルスの あたま','ぷちサウルスの からだ','ぷちサウルスの しっぽ'];
const RANKS = [0,40,90,150,220];
const RANK_REWARD = [null,{coins:1000,recipe:'od_olamp',t:'1000ポカと がいとうの レシピ'},{items:{feast:2},recipe:'od_birdhouse',t:'ごちそうクッキーと ことりの いえの レシピ'},{items:{w_crown:1},t:'ちいさな おうかん'},{items:{od_statue:1},t:'ぽかぽかさまの ぞう'}];

function odSpr(id){const k='od_'+id;if(_furn[k])return _furn[k];let g=new Grid(16,16),pal={};
 switch(id){
  case 'bench':pal={w:'#c88a4a',W:'#9a6030',l:'#7a4e2a'};g.rect(1,4,14,2,'w');g.rect(1,7,14,3,'w');g.rect(1,9,14,1,'W');g.rect(2,10,2,5,'l');g.rect(12,10,2,5,'l');g.rect(2,6,1,1,'l');g.rect(13,6,1,1,'l');break;
  case 'flowerbed':pal={s:'#a8a8b4',S:'#c8c8d4',d:'#7a5434',g:'#4caf50',a:'#ff8ab0',b:'#ffd030',c:'#ffffff',r:'#ff5a5a'};g.rect(0,8,16,8,'s');g.rect(0,8,16,1,'S');g.rect(1,9,14,4,'d');[[3,6,'a'],[6,5,'b'],[9,6,'r'],[12,5,'c'],[4,9,'b'],[11,9,'a'],[7,9,'c']].forEach(([x,y,c])=>{g.rect(x,y+2,1,3,'g');g.circle(x+0.5,y+1.5,1.4,c);});break;
  case 'olamp':g=new Grid(10,24);pal={g:'#5a5a6a',y:'#fff0a0',Y:'#ffd860',k:'#3a3a4a'};g.rect(4,7,2,16,'g');g.rect(2,22,6,2,'k');g.rect(2,1,6,6,'y');g.rect(1,0,8,1,'k');g.rect(1,6,8,1,'k');g.rect(3,2,4,3,'Y');break;
  case 'birdhouse':g=new Grid(16,22);pal={w:'#e8a060',r:'#e8605a',p:'#7a4e2a',k:'#3b2a20',b:'#5a9ae8',y:'#ffd040'};g.rect(7,10,2,12,'p');g.rect(3,4,10,7,'w');for(let i=0;i<4;i++)g.rect(3-1+i,3-i,12-2*i+2,1,'r');g.circle(8,7.5,1.6,'k');g.rect(10,0,3,2,'b');g.set(13,1,'y');break;
  case 'picnic':pal={r:'#ff6a7a',w:'#ffffff'};for(let y=2;y<14;y+=3)for(let x=1;x<15;x+=3)g.rect(x,y,3,3,((x+y)/3)%2?'r':'w');break;
  case 'stoneroad':pal={s:'#b8b8c4',S:'#d8d8e0',d:'#8a8a98'};[[1,1,6,5],[8,1,7,4],[1,7,5,7],[7,6,8,4],[7,11,7,4]].forEach(([x,y,w,h])=>{g.rect(x,y,w,h,'s');g.rect(x,y,w,1,'S');g.rect(x,y+h-1,w,1,'d');});break;
  case 'signpost':g=new Grid(16,20);pal={w:'#c88a4a',W:'#9a6030',p:'#7a4e2a',t:'#fff3dc'};g.rect(7,9,2,11,'p');g.rect(1,2,14,8,'w');g.rect(2,3,12,6,'t');g.rect(3,4,8,1,'W');g.rect(3,6,10,1,'W');break;
  case 'statue':g=new Grid(16,24);pal={s:'#c8c8d4',S:'#e8e8f0',d:'#9a9aa8',y:'#ffd040'};g.rect(2,18,12,6,'d');g.rect(3,17,10,1,'S');g.ellipse(8,11,5.5,5,'s');g.ellipse(7,9,2,1.6,'S');g.rows(["x.x.x","xxxxx"],6,3,{x:'y'});g.rect(1,9,2,4,'s');g.rect(13,9,2,4,'s');break;
 }
 const c=renderGrid(g,pal);_furn[k]=c;return c;}
function grantRecipes(){if(!S||S.story<STORY_DONE)return;START_RECIPES.forEach(r=>{if(!S.recipes.includes(r))S.recipes.push(r);});
 if(!S.flags.villageLetter){S.flags.villageLetter=1;pushMail({from:'vil',sender:'そんちょう ハルさん',body:'{name}さんへ\n\nむらの くらしにも なれてきたかしら。\nさぎょうだいで ベンチや はなだんを つくって、 そとに かざってみてね（メニューの「むらづくり」）。\nやくばの なかは しりょうかんに なっているの。 かせきや さかな、 むしを きぞう してくれると うれしいわ。\nつりざおは にゃんこしょうてんで かえるわよ。\n\nそんちょう ハル',gift:'od_bench',n:2});}}
function addMemory(t,icon){if(!S)return;if(!S.memo)S.memo=[];S.memo.unshift({d:dayKey(),t,icon:icon||null});if(S.memo.length>300)S.memo.length=300;}

const Village=(()=>{
 const el=(...a)=>UI.el(...a);const $=s=>document.querySelector(s);
 // ---------- outdoor placement ----------
 function odSet(){if(!G._od||G._odN!==(S.outdoor||[]).length){G._od=new Map();(S.outdoor||[]).forEach(o=>G._od.set(o.x+','+o.y,o));G._odN=(S.outdoor||[]).length;}return G._od;}
 function blocks(x,y){const o=S&&S.outdoor&&odSet().get(x+','+y);return !!(o&&!OUTDOOR[o.id].walk);}
 let building=false,sel=null;
 function canPlace(x,y,id){const W=G.world;const t=W.get(x,y);if(!['.','"',',','s',':'].includes(t))return false;if(t===':'&&id!=='stoneroad')return false;
  if(W.props[W.key(x,y)]||S.farm[fk(x,y)]||odSet().has(x+','+y))return false;if(G.player.tx===x&&G.player.ty===y)return false;
  const d=S.daily;if(d.digs.some(g=>g[0]===x&&g[1]===y)||d.shells.some(s=>s.x===x&&s.y===y))return false;
  for(const b of builtBuildings())if(Math.abs(b.door[0]-x)<=1&&Math.abs(b.door[1]+1-y)<=1)return false;
  if(OUTDOOR[id].walk)return true;
  // keep the village connected
  const key=x+','+y;const R=new Uint8Array(W.W*W.H);const q=[[16,28]];R[28*W.W+16]=1;const ok=(a,b)=>a>=0&&b>=0&&a<W.W&&b<W.H&&!BLOCK.has(W.t[b][a])&&!blocks(a,b)&&(a+','+b)!==key;
  while(q.length){const[cx,cy]=q.pop();for(const[dx,dy]of DIRS){const nx=cx+dx,ny=cy+dy;if(ok(nx,ny)&&!R[ny*W.W+nx]){R[ny*W.W+nx]=1;q.push([nx,ny]);}}}
  for(const b of builtBuildings())if(!R[(b.door[1]+1)*W.W+b.door[0]])return false;for(const[mx,my]of[MAILBOX,BOARD,[HUT[0],HUT[1]+2]])if(!DIRS.some(([dx,dy])=>R[(my+dy)*W.W+mx+dx]))return false;return true;}
 function start(){if(G.scene!=='map'){UI.toast('そとで できるよ');return;}building=true;sel=null;let bar=$('#odbar');if(!bar){bar=el('div','win');bar.id='odbar';document.body.append(bar);}bar.classList.remove('hidden');draw();UI.toast('かざりを えらんで じめんを タップ。 おいた ものを タップすると しまえるよ');}
 function stop(){building=false;sel=null;const bar=$('#odbar');if(bar)bar.classList.add('hidden');G._od=null;G._hab=null;save();}
 function draw(){const bar=$('#odbar');bar.innerHTML='';const list=el('div','odlist');const keys=Object.keys(S.items).filter(k=>ITEMS[k]&&ITEMS[k].cat==='outdoor');
  if(!keys.length)list.append(el('div','desc','おける かざりが ないよ。 さぎょうだいで つくれるよ。'));
  keys.forEach(k=>{const b=el('button','icell'+(sel===k?' sel':''));b.append(UI.iconOf(k));b.append(el('span','cnt',S.items[k]));b.onclick=()=>{sel=sel===k?null:k;draw();};list.append(b);});
  const end=el('button','btn gold','おわる');end.onclick=stop;bar.append(list,end);}
 function tap(tx,ty){const o=odSet().get(tx+','+ty);
  if(sel){const id=sel.slice(3);if(canPlace(tx,ty,id)){takeItem(sel);(S.outdoor||(S.outdoor=[])).push({id,x:tx,y:ty});G._od=null;Snd.sfx('pop');puff(tx*TS+8,ty*TS+8,'#fff6a0',6);if(!itemCount(sel))sel=null;draw();checkRank(true);return true;}
   if(!o){UI.toast('そこには おけないみたい');return true;}}
  if(o){S.outdoor=S.outdoor.filter(x=>x!==o);G._od=null;addItem('od_'+o.id);Snd.sfx('close');UI.toast(`${OUTDOOR[o.id].name}を しまった`,'od_'+o.id);draw();return true;}
  return true;}
 function drawList(list,c,ox,oy){for(const o of (S&&S.outdoor)||[]){const spr=odSpr(o.id);const px=o.x*TS-ox,py=o.y*TS-oy;if(px<-24||py<-32||px>G.vw+8||py>G.vh+8)continue;
   if(OUTDOOR[o.id].walk){c.drawImage(spr,px-2,py-2);continue;}const h=spr.height-4;list.push({y:o.y*TS-0.2,f:()=>c.drawImage(spr,px-2+Math.round((16-(spr.width-4))/2),py+16-h-2)});}
  if(building){c.strokeStyle='rgba(255,255,255,0.35)';const x0=Math.floor(ox/TS),y0=Math.floor(oy/TS);if(sel){c.fillStyle='rgba(255,240,120,0.22)';for(let y=y0;y<y0+Math.ceil(G.vh/TS)+1;y++)for(let x=x0;x<x0+Math.ceil(G.vw/TS)+1;x++){if(y>=0&&x>=0&&x<G.world.W&&y<G.world.H&&Math.abs(x-G.player.tx)+Math.abs(y-G.player.ty)<9&&canPlaceFast(x,y))c.fillRect(x*TS-ox+1,y*TS-oy+1,TS-2,TS-2);}}}}
 function canPlaceFast(x,y){const t=G.world.get(x,y);return['.','"',',','s'].includes(t)&&!G.world.props[G.world.key(x,y)]&&!S.farm[fk(x,y)]&&!odSet().has(x+','+y);}
 function lights(arr){for(const o of (S&&S.outdoor)||[])if(OUTDOOR[o.id].light)arr.push([o.x*TS+8,o.y*TS-4,44,1]);}
 async function interact(tx,ty){const o=odSet().get(tx+','+ty);if(!o)return false;const d=S.daily;
  goAdjacent(tx,ty,async()=>{switch(o.id){
   case 'bench':case 'picnic':{const k='b'+tx+','+ty;if(!d.bench)d.bench={};if(!d.bench[k]){d.bench[k]=1;partyMons().forEach(m=>{restoreEn(m,2);gainAff(m,1,true);});G.party.forEach(pa=>{pa.e.jump=0.45;hearts(pa.e.px+8,pa.e.py,2);});UI.toast('みんなで ひとやすみ。 ぷちっこが すこし げんきに なった','paw');Snd.sfx('pet');}else UI.toast('ぽかぽかで きもちいい…');break;}
   case 'signpost':UI.say('「ようこそ ぽかぽか村へ」 …だれかが ハートの らくがきを している。');break;
   case 'birdhouse':Snd.jingle('newday');UI.toast('ことりが ちゅんちゅん うたっている ♪');break;
   case 'statue':UI.say('ぽかぽかさまの ぞう。 むらを やさしく みまもっている。');break;
   default:UI.toast(OUTDOOR[o.id].name);}});return true;}

 // ---------- rating ----------
 function score(){const parts={};let f=0;for(const v of Story.residents()){const fr=S.vil[v.id];f+=Math.min(10,fr?fr.f:0);}parts.people=f;
  const od=S.outdoor||[];parts.decor=Math.min(60,od.length*3)+new Set(od.map(o=>o.id)).size*5;
  parts.mon=caughtCount()*2;const M=S.museum||{};parts.museum=((M.fossil||[]).length+Object.keys(M.fish||{}).length+Object.keys(M.bug||{}).length)*2;
  parts.flower=Math.min(15,Object.values(S.farm).filter(x=>x.crop&&(x.crop.startsWith('tulip_')||x.crop==='sunflower')).length*2);
  parts.home=Math.min(20,S.furniture.length)+seriesState().filter(x=>x.done).length*5;
  const total=Object.values(parts).reduce((a,b)=>a+b,0);let rank=0;RANKS.forEach((t,i)=>{if(total>=t)rank=i;});return{parts,total,rank};}
 function checkRank(quiet){const r=score();if(S.rankSeen==null)S.rankSeen=r.rank;if(r.rank>S.rankSeen){S.rankSeen=r.rank;const rw=RANK_REWARD[r.rank];
   if(rw){if(rw.coins)S.mailQ.length;pushMail({from:'vil',sender:'そんちょう ハルさん',body:`{name}さんへ\n\nむらの ひょうかが ★${r.rank+1}に なったわ！\nみんなの おかげで、 むらが どんどん すてきに なっていく。\nこんど あったら、 おれいを わたさせてね。\n\nそんちょう ハル`});Post.hand('chief',{t:`むらの ひょうか ★${r.rank+1}、 ほんとうに おめでとう！ これは むらからの おれいよ。`,items:rw.items||null,coins:rw.coins||0,recipes:rw.recipe?[rw.recipe]:[]});}
   addMemory(`むらの ひょうかが ★${r.rank+1}に なった`,'house');if(!quiet)UI.toast(`むらの ひょうかが ★${r.rank+1}に なった！ ポストを みてね`,'house');}}
 async function rateTalk(o){const r=score();const stars='★'.repeat(r.rank+1)+'☆'.repeat(4-r.rank);await UI.say(`いまの むらの ひょうかは ${stars}よ。`,o);
  if(r.rank<4){const lowest=Object.entries(r.parts).sort((a,b)=>a[1]-b[1])[0][0];
   const hint={people:'むらの ひとたちと もっと おはなし してみて。',decor:'そとに ベンチや はなだんを おくと、 むらが あかるく なるわ。',mon:'いろんな ぷちっこと なかよく なってね。',museum:'やくばの しりょうかんに かせきや さかな、 むしを きぞうしてね。',flower:'はたけに はなを うえると きれいよ。',home:'おうちの かぐを シリーズで そろえるのも すてきね。'}[lowest];
   await UI.say(`つぎの ★まで あと ${RANKS[r.rank+1]-r.total}ポイント。 ${hint}`,o);}else await UI.say('もう さいこうの むらよ。 ほんとうに ありがとう。',o);checkRank(true);}

 // ---------- museum ----------
 function museum(tab='fossil'){if(!S.museum)S.museum={fossil:[],fish:{},bug:{}};const M=S.museum;
  UI.panel('しりょうかん',body=>{const tabs=el('div','tabs');[['fossil','かせき'],['fish','さかな'],['bug','むし']].forEach(([k,l])=>{const b=el('button','tab'+(k===tab?' on':''),l);b.onclick=()=>{UI.closePanel(true);museum(k);};tabs.append(b);});body.append(tabs);
   const grid=el('div','dgrid');let canDonate=[];
   if(tab==='fossil'){body.append(el('div','note',`かせき ${M.fossil.length} / ${FOSSILS.length}　かせきを きぞうすると、 しらべて くれるよ`));
    FOSSILS.forEach((n,i)=>{const got=M.fossil.includes(i);const c=el('div','dcell'+(got?' got':''));c.append(got?UI.iconOf('fossil'):el('div','unk','？'));c.append(el('span','dnm',got?n:'？？？'));grid.append(c);});
    if(itemCount('fossil')&&M.fossil.length<FOSSILS.length)canDonate=['fossil'];}
   if(tab==='fish'){body.append(el('div','note',`さかな ${Object.keys(M.fish).length} / ${FISH.length}`));FISH.forEach(f=>{const got=M.fish[f.id];const c=el('div','dcell'+(got?' got':''));c.append(got?UI.iconOf('fish_'+f.id):el('div','unk','？'));c.append(el('span','dnm',got?f.name:'？？？'));grid.append(c);});
    canDonate=FISH.filter(f=>!M.fish[f.id]&&itemCount('fish_'+f.id)).map(f=>'fish_'+f.id);}
   if(tab==='bug'){body.append(el('div','note',`むし ${Object.keys(M.bug).length} / ${BUGS.length}`));BUGS.forEach(b=>{const got=M.bug[b.id];const c=el('div','dcell'+(got?' got':''));c.append(got?UI.iconOf('bug_'+b.id):el('div','unk','？'));c.append(el('span','dnm',got?b.name:'？？？'));grid.append(c);});
    canDonate=BUGS.filter(b=>!M.bug[b.id]&&itemCount('bug_'+b.id)).map(b=>'bug_'+b.id);}
   body.append(grid);
   if(canDonate.length){body.append(el('div','note','きぞう できる もの'));const l=el('div','slist');canDonate.forEach(k=>{const r=el('div','srow');r.append(UI.iconOf(k));r.append(el('div','sname',ITEMS[k].name));const b=el('button','btn','きぞう');
     b.onclick=()=>{takeItem(k);let name=ITEMS[k].name;if(k==='fossil'){const i=FOSSILS.findIndex((_,j)=>!M.fossil.includes(j));M.fossil.push(i);name=FOSSILS[i];UI.toast(`しらべた けっか… 「${name}」だった！`,'fossil');}
      else if(k.startsWith('fish_'))M.fish[k.slice(5)]=1;else M.bug[k.slice(4)]=1;Snd.jingle('mail');addMemory(`しりょうかんに ${name}を きぞうした`,k);
      const tot=M.fossil.length+Object.keys(M.fish).length+Object.keys(M.bug).length;if(tot%5===0){addCoins(500);UI.toast(`きぞう ${tot}こ ありがとう！ 500ポカ もらった`,'coin');}
      checkRank();save();UI.closePanel(true);museum(tab);};r.append(b);l.append(r);});body.append(l);}
   else body.append(el('div','desc','きぞう できる ものを もっていない。 つったり つかまえたり、 いわを わったり して あつめよう。'));});}

 // ---------- memories ----------
 function memories(){UI.panel('おもいで',body=>{const L=S.memo||[];if(!L.length){body.append(el('div','empty','これから たくさんの おもいでが きろく されていくよ。'));return;}
  body.append(el('div','note',`むらに きて ${S.stamps||1}にち。 たいせつな できごとの きろく。`));let last='';
  L.forEach(m=>{if(m.d!==last){last=m.d;const[y,mo,d]=m.d.split('-');body.append(el('div','mday',`${+mo}がつ ${+d}にち`));}const r=el('div','mrow mem');const ic=m.icon&&UI.iconOf(m.icon);if(ic)r.append(ic);r.append(el('div','minfo',fmt(m.t)));body.append(r);});});}

 return{start,stop,tap,get building(){return building;},blocks,drawList,lights,interact,score,checkRank,rateTalk,museum,memories};
})();
