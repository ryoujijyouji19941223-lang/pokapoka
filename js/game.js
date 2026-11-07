'use strict';
// ============================================================
//  ぽかぽか村と ぷちっこ  -  core
// ============================================================
const Q=new URLSearchParams(location.search);
const TIME_OFF=(()=>{const d=new Date();const t=new Date(d);if(Q.has('mo'))t.setMonth(+Q.get('mo')-1);if(Q.has('d'))t.setDate(+Q.get('d'));if(Q.has('h'))t.setHours(+Q.get('h'));if(Q.has('mi'))t.setMinutes(+Q.get('mi'));return t-d;})();
const W_OVERRIDE=Q.get('w');
function NOW(){return new Date(Date.now()+TIME_OFF);}
function dayKey(d=NOW()){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
function dayNum(dk){const[y,m,d]=dk.split('-').map(Number);return Math.round(new Date(y,m-1,d).getTime()/86400000);}
function seasonOf(d=NOW()){const m=d.getMonth()+1;return m>=3&&m<=5?'sp':m>=6&&m<=8?'su':m>=9&&m<=11?'au':'wi';}
function phaseOf(d=NOW()){const h=d.getHours();return h>=5&&h<10?'M':h>=10&&h<16?'D':h>=16&&h<19?'E':'N';}
function weatherAt(d=NOW()){if(W_OVERRIDE)return W_OVERRIDE;if(d.getMonth()===11&&(d.getDate()===24||d.getDate()===25)&&d.getHours()>=16)return 'snow';const block=Math.floor(d.getHours()/6);const r=mkRng(hashStr(dayKey(d)+'w'+block));const s=seasonOf(d);const x=r();
 if(s==='wi')return x<0.42?'clear':x<0.68?'cloudy':'snow';if(s==='su')return x<0.64?'clear':x<0.8?'cloudy':'rain';return x<0.56?'clear':x<0.78?'cloudy':'rain';}
const WDAY=['にち','げつ','か','すい','もく','きん','ど'];

// ---------------- state ----------------
const SAVE_KEY='pokapoka_v1';
let S=null;
const G={cv:null,ctx:null,vw:200,vh:400,cs:1,cam:{x:0,y:0},scene:'map',lock:0,t:0,world:null,layers:null,season:null,waterFrame:0,
 player:null,partner:null,wilds:[],yard:[],vils:[],parts:[],emotes:[],wparts:[],lastMin:-1,lastHour:-1,phase:null,weather:null,
 party:[],trail:[],tool:'',star:null,starT:30,tapMark:null,shake:{},catching:false,shopOpen:false,radio:false,ptr:null,holdT:0,keys:{},stepAcc:0,fade:0,ready:false};
function newState(name,shirt,hair){return{v:2,name,shirt,hair,coins:500,items:{cookie:5,seed_sun:2},creatures:[],party:[],dex:{},
 farm:{},story:0,storyP:0,storyReady:false,storyEnc:null,recipes:[],lastTick:Date.now(),daily:null,stamps:0,vil:{},mails:[],mailQ:[],momIdx:0,dadOrder:null,dadIdx:0,
 lastMom:-99,lastDad:-99,flags:{},furniture:[{id:'bed',x:0,y:2},{id:'table',x:3,y:3},{id:'chair',x:5,y:4},{id:'plant',x:7,y:2}],eggs:[],
 pos:{scene:'map',x:16,y:28},stats:{caught:0,steps:0,crafted:0},opt:{bgm:false,sfx:false},uid:1,created:Date.now(),lastSeen:Date.now()};}
function save(){if(!S)return;S.lastSeen=Date.now();if(G.player){S.pos=G.scene==='inside'&&G.inside?{scene:'map',x:G.inside.b.door[0],y:G.inside.b.door[1]+1}:{scene:G.scene,x:G.player.tx,y:G.player.ty};}try{localStorage.setItem(SAVE_KEY,JSON.stringify(S));}catch(e){}}
function load(){try{const s=localStorage.getItem(SAVE_KEY);return s?migrate(JSON.parse(s)):null;}catch(e){return null;}}
function migrate(s){
 if(!s.party){const others=s.creatures.filter(c=>c.uid!==s.partner).map(c=>c.uid);s.party=(s.partner?[s.partner]:[]).concat(others).slice(0,3);delete s.partner;}
 if(!s.farm)s.farm={};if(s.story==null){s.story=s.creatures.length?STORY_DONE:0;s.storyP=0;s.storyReady=false;s.storyEnc=null;}
 if(!s.recipes)s.recipes=s.story>=STORY_DONE?START_RECIPES.concat(['stonelamp','yakiringo']):[];
 if(s.story>=5&&!s.furniture.some(f=>f.id==='workbench'))placeBench(s);
 s.creatures.forEach(m=>{if(m.exp==null)m.exp=0;perOf(m);favOf(m);});if(!s.stats.crafted)s.stats.crafted=0;delete s.plots;
 if(s.story>=5&&!s.recipes.includes('petbed'))s.recipes.push('petbed');if(!s.phc){s.phc={M:0,D:0,E:0,N:0};s.phd={};}
 if(!s.look)s.look={outfit:'tee',style:'short',hat:null};if(s.houseLv==null)s.houseLv=0;if(!s.shinyDex)s.shinyDex={};if(s.story>=5&&!s.recipes.includes('wshelf'))s.recipes.push('wshelf');s.v=4;return s;}
function placeBench(s=S){const free=(x,y)=>!s.furniture.some(f=>!FURN[f.id].floor&&f.x===x&&f.y===y);
 for(const[x,y]of[[11,2],[12,2],[10,2],[7,2],[5,2]])if(free(x,y)){s.furniture.push({id:'workbench',x,y});return;}
 for(let y=2;y<ROOM_H;y++)for(let x=0;x<ROOM_W;x++)if(free(x,y)&&!DOOR_X.includes(x)){s.furniture.push({id:'workbench',x,y});return;}}
function addItem(id,n=1){S.items[id]=(S.items[id]||0)+n;}
function itemCount(id){return S.items[id]||0;}
function takeItem(id,n=1){if((S.items[id]||0)<n)return false;S.items[id]-=n;if(S.items[id]<=0)delete S.items[id];return true;}
function addCoins(n){S.coins=Math.max(0,S.coins+n);UI.hud();}
function monById(uid){return S.creatures.find(c=>c.uid===uid);}
function partyMons(){return S.party.map(monById).filter(Boolean);}
function partnerMon(){return partyMons()[0]||null;}
function hasJob(j){return partyMons().some(m=>jobOf(m.sp)===j);}
function ownsJob(j){return S.creatures.some(m=>jobOf(m.sp)===j);}
function caughtCount(){return SPECIES.filter(s=>S.dex[s.id]==='c').length;}
function lvFromExp(e){let lv=1;while(lv<10&&e>=3*lv*(lv+1))lv++;return lv;}
function monLv(m){return lvFromExp(m.exp||0);}
function expNext(m){const lv=monLv(m);return lv>=10?null:3*lv*(lv+1);}
function affHearts(m){return Math.min(5,Math.floor(m.aff/3));}
function enMax(m){return 8+monLv(m)*2+(perOf(m)==='genki'?3:0);}
function enLeft(m){return enMax(m)-(((S.daily&&S.daily.en)||{})[m.uid]||0);}
function restoreEn(m,n){const d=S.daily;d.en[m.uid]=Math.max(0,(d.en[m.uid]||0)-n);}
function joinCreature(m){S.creatures.push(m);if(S.party.length<3){S.party.push(m.uid);if(G.ready)placeParty();return true;}return false;}
function newMon(id,aff=0){return{uid:S.uid++,sp:id,name:SP[id].name,aff,exp:0,got:Date.now(),per:rollPersona(),fav:rnd(FAV_POOL)};}
function learnRecipe(id,quiet){if(S.recipes.includes(id))return false;S.recipes.push(id);if(!quiet){UI.toast(`レシピを おぼえた：${ITEMS[RECIPES[id].out].name}`,'recipe');Snd.sfx('get');}return true;}
function fmt(s,x={}){const pm=partnerMon();return s.replace(/\{name\}/g,S.name).replace(/\{partner\}/g,pm?pm.name:'ぷちっこ').replace(/\{item\}/g,x.item||'').replace(/\{n\}/g,x.n||'');}

// ---------------- daily ----------------
function pickTiles(r,ok,n,y0,y1){const W=G.world;const out=[];let tries=0;while(out.length<n&&tries<500){tries++;const x=2+Math.floor(r()*(W.W-4)),y=y0+Math.floor(r()*(y1-y0+1));
 if(!ok(W.t[y][x])||W.props[W.key(x,y)]||S.farm[x+','+y])continue;if(out.some(p=>Math.abs(p[0]-x)+Math.abs(p[1]-y)<4))continue;
 if(W.t[y-1]&&W.t[y-1][x]==='B')continue;out.push([x,y]);}return out;}
function ensureDaily(){
 const dk=dayKey();if(S.daily&&S.daily.day===dk){if(!S.daily.clothes){const SH=shopStockFor(dk,seasonOf());Object.assign(S.daily,{clothes:SH.clothes,wears:SH.wears,surf:SH.surf});}if(!S.daily.bday)Story.storyDaily();if(S.daily.mistNight===undefined)Mist.daily();if(!S.daily.bugs)S.daily.bugs=Mini.spawnBugs(mkRng(hashStr(dk+'bug')));return false;}if(S.houseBuild)checkHouseBuild();
 const prev=S.daily?S.daily.day:null;const r=mkRng(hashStr(dk+S.name));
 const pool=QUEST_POOL.filter(q=>(!q.job||ownsJob(q.job))&&(q.story==null||S.story>=q.story));const qs=[];for(let i=0;i<3;i++){const q=pool.splice(Math.floor(r()*pool.length),1)[0];const n=q.n[0]+Math.floor(r()*(q.n[1]-q.n[0]+1));qs.push({k:q.k,t:q.t.replace('{n}',n),n,p:0,claimed:false,r:q.r});}
 const req={};VILLAGERS.forEach(v=>{if(!v.chief&&(!v.movein||(S.movedIn&&S.movedIn[v.id]))&&r()<0.6)req[v.id]={item:rpick(r,v.likes.concat(['apple','orange','stone','shell_s'])),done:false};});
 const digs=pickTiles(r,t=>t==='.',7,3,34);const shells=pickTiles(r,t=>t==='s',seriesOn('sea')?4:3,35,37).map(p=>({x:p[0],y:p[1],k:r()<0.25?'shell_l':'shell_s'}));
 const SH=shopStockFor(dk,seasonOf());const stock=SH.stock;
 S.daily={day:dk,quests:qs,bonus:false,req,digs,dug:[],shells,picked:[],shaken:{},chopped:{},rocks:{},talked:{},petted:{},fed:{},en:{},walkAff:0,stars:0,fountain:0,stock,sale:SH.sale,toys:SH.toys,clothes:SH.clothes,wears:SH.wears,surf:SH.surf,stampTaken:false,enc:[],talkedMon:{},gifts:0,diaries:0,naps:{},omikuji:null,luck:0,slept:false};
 S.daily.enc=pickEncounters();S.daily.bugs=Mini.spawnBugs(r);for(const k in S.farm)S.farm[k].water=false;
 S.stamps=(S.stamps||0)+1;
 genMail(prev);Story.storyDaily();Mist.daily();Village.checkRank(true);
 return true;
}
function quest(k,n=1){if(!S.daily)return;for(const q of S.daily.quests){if(q.k===k&&q.p<q.n){q.p=Math.min(q.n,q.p+n);if(q.p>=q.n){UI.toast('おねがい たっせい！ けいじばんで うけとろう','scroll');Snd.sfx('get');}}}UI.hud();}

// ---------------- mail ----------------
function pushMail(m){S.mails.unshift(Object.assign({id:S.uid++,read:false,taken:false,day:dayKey()},m));if(S.mails.length>40)S.mails.length=40;}
function genMail(prevDay){
 const today=dayNum(dayKey());const r=mkRng(hashStr(dayKey()+'mail'));
 const momL=(L,key)=>({from:'mom',sender:'おかあさん',body:L.t,gift:L.gift||null,n:L.n||1,coins:L.coins||0,recipe:L.recipe||null,key});
 // queued (villager gifts etc.)
 while(S.mailQ.length)pushMail(S.mailQ.shift());
 let momSent=false;
 if(!S.flags.first){S.flags.first=1;pushMail(momL(MOM_SPECIAL.first,'first'));momSent=true;S.lastMom=today;}
 else{
  const away=prevDay?today-dayNum(prevDay):0;
  if(away>=4){pushMail(momL(MOM_SPECIAL.comeback,'comeback'));momSent=true;}
  else if(S.flags.pendFirstCatch&&!S.flags.firstCatchSent){S.flags.firstCatchSent=1;pushMail(momL(MOM_SPECIAL.firstcatch,'fc'));momSent=true;}
  else if(S.flags.late&&today-(S.flags.lateSent||-99)>=6){S.flags.lateSent=today;pushMail(momL(MOM_SPECIAL.latenight,'late'));momSent=true;}
  else{const w=weatherAt(new Date(NOW().setHours(9)));
   if(w==='snow'&&!S.flags.snowSent){S.flags.snowSent=1;pushMail(momL(MOM_SPECIAL.snow,'snow'));momSent=true;}
   else if(w==='rain'&&today-(S.flags.rainSent||-99)>=10&&r()<0.6){S.flags.rainSent=today;pushMail(momL(MOM_SPECIAL.rain,'rain'));momSent=true;}}
  if(!momSent&&today-S.lastMom>=3){const L=MOM_LETTERS[S.momIdx%MOM_LETTERS.length];S.momIdx++;pushMail(momL(L,'m'+S.momIdx));momSent=true;}
  if(momSent)S.lastMom=today;
 }
 S.flags.late=0;
 // dad: whimsical, irregular
 if(!S.dadOrder){const o=DAD_GIFTS.map((_,i)=>i);for(let i=o.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[o[i],o[j]]=[o[j],o[i]];}S.dadOrder=o;}
 const since=today-S.lastDad;if(S.flags.first&&since>=6&&r()<(since>=12?0.5:0.15)&&prevDay){const L=DAD_GIFTS[S.dadOrder[S.dadIdx%S.dadOrder.length]];S.dadIdx++;S.lastDad=today;
  pushMail({from:'dad',sender:'おとうさん',body:L.t,gift:L.gift||null,n:L.n||1,coins:L.coins||0,recipe:L.recipe||null});}
}
function unreadMail(){return S.mails.filter(m=>!m.read).length;}

// ---------------- world helpers ----------------
const BLOCK=new Set(['#','T','~','S','R','f','L','B','M','K','F','H']);
const DIRS=[[0,1],[1,0],[0,-1],[-1,0]];
function walkMap(x,y){const W=G.world;if(x<0||y<0||x>=W.W||y>=W.H)return false;return!BLOCK.has(W.t[y][x])&&!(typeof Village!=='undefined'&&S&&S.outdoor&&Village.blocks(x,y));}
let ROOM_W=14,ROOM_H=11;let DOOR_X=[6,7];
function fdim(f){const F=FURN[f.id];return[F.w||1,F.h||1];}
function covers(f,x,y){const[w,h]=fdim(f);return x>=f.x&&x<f.x+w&&y>=f.y&&y<f.y+h;}
function furnAt(x,y){return S.furniture.find(f=>!FURN[f.id].floor&&f.x===x&&f.y===y)||S.furniture.find(f=>FURN[f.id].floor&&covers(f,x,y));}
function walkRoom(x,y){if(x<0||y<2||x>=ROOM_W||y>=ROOM_H)return false;for(const f of S.furniture){if(f.x===x&&f.y===y&&!FURN[f.id].walk)return false;}return true;}
function walkable(x,y){return G.scene==='map'?walkMap(x,y):G.scene==='inside'?Inside.walk(x,y):walkRoom(x,y);}
function gridW(){return G.scene==='map'?G.world.W:ROOM_W;}
function gridH(){return G.scene==='map'?G.world.H:ROOM_H;}
function bfs(sx,sy,isGoal,walk,W,H,maxN=5000){
 const prev=new Int32Array(W*H).fill(-1);const s=sy*W+sx;prev[s]=s;const q=[s];let h=0;
 while(h<q.length&&h<maxN){const c=q[h++];const cx=c%W,cy=(c/W)|0;if(isGoal(cx,cy)){const path=[];let k=c;while(k!==s){path.push([k%W,(k/W)|0]);k=prev[k];}return path.reverse();}
  for(const[dx,dy]of DIRS){const nx=cx+dx,ny=cy+dy;if(nx<0||ny<0||nx>=W||ny>=H)continue;const n=ny*W+nx;if(prev[n]!==-1||!walk(nx,ny))continue;prev[n]=c;q.push(n);}}
 return null;
}
function habTiles(){
 if(G._hab)return G._hab;const W=G.world;const H={grass:[],flower:[],water:[],sand:[],tree:[],shore:[],any:[],plaza:[]};
 const adj=(x,y,f)=>DIRS.some(([dx,dy])=>f(W.get(x+dx,y+dy)));
 // only tiles the player can actually reach (flood fill from home)
 const reach=new Uint8Array(W.W*W.H);const q=[[16,28]];reach[28*W.W+16]=1;while(q.length){const[cx,cy]=q.pop();for(const[dx,dy]of DIRS){const nx=cx+dx,ny=cy+dy;if(walkMap(nx,ny)&&!reach[ny*W.W+nx]){reach[ny*W.W+nx]=1;q.push([nx,ny]);}}}
 const R=(x,y)=>x>=0&&y>=0&&x<W.W&&y<W.H&&reach[y*W.W+x]===1;
 for(let y=2;y<W.H;y++)for(let x=1;x<W.W-1;x++){const t=W.t[y][x];const walk=R(x,y);if(!walk&&!(t==='~'||t==='S'))continue;
  if(t==='"')H.grass.push([x,y]);if(t===',')H.flower.push([x,y]);if(t==='s'&&walk)H.sand.push([x,y]);
  if((t==='~'||t==='S')&&DIRS.some(([dx,dy])=>R(x+dx,y+dy)))H.water.push([x,y]);
  if(walk&&(t==='.'||t===',')&&adj(x,y,c=>c==='#'||c==='T'))H.tree.push([x,y]);
  if(walk&&(t==='.'||t===','||t==='s')&&adj(x,y,c=>c==='~'))H.shore.push([x,y]);
  if(walk&&t==='.')H.any.push([x,y]);
  if(walk&&x>=4&&x<=31&&y>=10&&y<=15&&t!==':')H.plaza.push([x,y]);}
 G._hab=H;return H;
}
function habOf(x,y){const t=G.world.t[y][x];return t;}

// ---------------- entities ----------------
function mkEnt(x,y,speed){return{tx:x,ty:y,nx:x,ny:y,prog:0,moving:false,speed,dir:'down',path:[],arrive:null,px:x*TS,py:y*TS,anim:0,flip:false};}
function dirOf(dx,dy){return dx>0?'right':dx<0?'left':dy<0?'up':'down';}
function entUpdate(e,dt,walk){
 let b=dt*e.speed;
 for(let guard=0;guard<4&&b>0;guard++){
  if(!e.moving){if(!e.path.length)break;const[nx,ny]=e.path[0];if(walk&&!walk(nx,ny)){e.path=[];e.arrive=null;break;}e.path.shift();e.dir=dirOf(nx-e.tx,ny-e.ty);if(nx!==e.tx)e.flip=nx<e.tx;e.nx=nx;e.ny=ny;e.moving=true;e.prog=0;if(e.onLeave)e.onLeave(e);}
  const need=1-e.prog;if(b>=need){b-=need;e.prog=0;e.tx=e.nx;e.ty=e.ny;e.moving=false;if(e.onStep)e.onStep(e);}else{e.prog+=b;b=0;}
 }
 if(!e.moving&&!e.path.length&&e.arrive){const f=e.arrive;e.arrive=null;f();}
 e.px=(e.tx+(e.nx-e.tx)*e.prog)*TS;e.py=(e.ty+(e.ny-e.ty)*e.prog)*TS;if(e.moving)e.anim+=dt*e.speed;
}
function placePlayer(x,y,dir='down'){const p=mkEnt(x,y,5.2);p.dir=dir;p.onLeave=onPlayerLeave;p.onStep=onPlayerStep;G.player=p;placeParty();}
function placeParty(){const p=G.player;G.party=[];G.trail=[];if(!p)return;const taken=new Set([p.tx+','+p.ty]);
 for(const m of partyMons()){const path=bfs(p.tx,p.ty,(x,y)=>!taken.has(x+','+y),walkable,gridW(),gridH(),600);const pos=path&&path.length?path[path.length-1]:[p.tx,p.ty];
  taken.add(pos[0]+','+pos[1]);const e=mkEnt(pos[0],pos[1],5.2);e.jump=0;G.party.push({mon:m,e});G.trail.push(pos.slice());}
 G.partner=G.party[0]||null;}
function onPlayerLeave(p){if(!G.party.length||G.scene==='house')return;G.trail.unshift([p.tx,p.ty]);G.trail.length=Math.min(G.trail.length,G.party.length);
 G.party.forEach((pa,i)=>{const t=G.trail[i];if(!t)return;const e=pa.e;const d=Math.abs(e.tx-t[0])+Math.abs(e.ty-t[1]);if(d===0&&!e.moving)return;
  if(d>4){e.tx=e.nx=t[0];e.ty=e.ny=t[1];e.path=[];e.moving=false;e.prog=0;return;}e.path=[t.slice()];});}
function onPlayerStep(p){S.stats.steps++;quest('steps');if(G.scene==='map'&&(G.player.tx+G.player.ty)%2)Snd.sfx('step');
 if(G.partner&&S.daily){G.stepAcc++;if(G.stepAcc>=60){G.stepAcc=0;if(S.daily.walkAff<5){S.daily.walkAff++;gainAff(G.partner.mon,1,true);}}}}
function walkTo(tx,ty,arrive){const p=G.player;p.arrive=null;const path=bfs(p.tx,p.ty,(x,y)=>x===tx&&y===ty,walkable,gridW(),gridH());
 if(!path){return false;}p.path=path;p.arrive=arrive||null;if(!path.length&&arrive){p.arrive=null;arrive();}return true;}
function goAdjacent(tx,ty,fn,fail){const p=G.player;p.arrive=null;
 const goal=(x,y)=>Math.abs(x-tx)+Math.abs(y-ty)===1;const path=bfs(p.tx,p.ty,goal,walkable,gridW(),gridH());
 if(!path){const path2=bfs(p.tx,p.ty,(x,y)=>Math.max(Math.abs(x-tx),Math.abs(y-ty))===1,walkable,gridW(),gridH());if(!path2){fail&&fail();return false;}p.path=path2;}else p.path=path;
 p.arrive=()=>{p.dir=dirOf(tx-p.tx,ty-p.ty);if(tx!==p.tx)p.flip=tx<p.tx;fn();};if(!p.path.length){const f=p.arrive;p.arrive=null;f();}return true;}

// villagers
function vilActive(v,h=NOW().getHours()){const[a,b]=v.hours;return(h>=a&&h<Math.min(b,24))||(b>24&&h<b-24);}
function syncVillagers(){const h=NOW().getHours();
 for(const v of VILLAGERS.concat(VISITORS)){const on=Story.isPresent(v)&&vilActive(v,h);const ex=G.vils.find(o=>o.v.id===v.id);
  if(on&&!ex){const b=v.house&&BUILDINGS.find(b=>b.id===v.house);const e=mkEnt(b?b.door[0]:v.home[0],b?b.door[1]+1:v.home[1],1.8);G.vils.push({v,e,wt:1+Math.random()*3,emote:null,talking:false});}
  if(!on&&ex&&!ex.talking){G.vils.splice(G.vils.indexOf(ex),1);}}}
// ---------------- encounters (であい) ----------------
const RARE_W={1:60,2:26,3:11,4:5,5:6};
function speciesAvailable(s,en){if(!s.rare)return false;const d=NOW();if(s.rare===5)return caughtCount()>=20&&S.dex[s.id]!=='c';
 const ph=phaseOf(d),se=seasonOf(d),w=G.weather||weatherAt(d);
 if(!(en&&en.anytime)&&s.time!=='*'&&!s.time.includes(ph))return false;if(s.season!=='*'&&!s.season.split(',').includes(se))return false;
 if(s.weather==='clear'&&(w==='rain'||w==='snow'))return false;if(s.weather!=='*'&&s.weather!=='clear'&&s.weather!==w&&!(s.weather==='rain'&&w==='snow'))return false;return true;}
function wpick(list,wf){let tot=0;for(const x of list)tot+=wf(x);let r=Math.random()*tot;for(const x of list){r-=wf(x);if(r<=0)return x;}return list[list.length-1];}
function mkEnc(id,near){const H=habTiles();const T=(H[SP[id].hab]&&H[SP[id].hab].length?H[SP[id].hab]:H.any).filter(c=>!S.farm[c[0]+','+c[1]]&&!(S.outdoor||[]).some(o=>o.x===c[0]&&o.y===c[1]));let c;
 if(near){const dd=a=>Math.abs(a[0]-near[0])+Math.abs(a[1]-near[1]);c=T.reduce((b,a)=>dd(a)<dd(b)?a:b,T[0]);}else c=T[Math.floor(Math.random()*T.length)];
 return{sp:id,x:c[0],y:c[1],done:false,story:!!near,shiny:!near&&rollShiny()};}
function pickEncounters(){if(S.story<STORY_DONE)return[];const dk=dayKey();
 const ids=(S.nextEnc&&S.nextEnc.day===dk)?S.nextEnc.ids:pickEncSpecies(NOW());
 return ids.filter(o=>o.id!=='pokapokasama'||((caughtCount()>=20||S.flags.legend)&&S.dex.pokapokasama!=='c')).map(o=>Object.assign(mkEnc(o.id),{anytime:!!o.anytime}));}
function encList(){const l=(S.daily&&S.daily.enc)||[];let out=S.storyEnc?l.concat([S.storyEnc]):l;const L=S.daily&&S.daily.lost;if(L&&!L.found&&L.en)out=out.concat([L.en]);return out;}
function syncEncounters(){if(G.scene!=='map'||!S.daily)return;
 for(const en of encList()){if(en.done)continue;const ex=G.wilds.find(w=>w.enc===en);const ok=en.story||en.lost||speciesAvailable(SP[en.sp],en);
  if(ok&&!ex)spawnEnc(en);else if(!ok&&ex&&!ex.frozen){G.wilds.splice(G.wilds.indexOf(ex),1);puff(ex.e.px+8,ex.e.py+8);}}
 G.wilds=G.wilds.filter(w=>encList().includes(w.enc));}
function spawnEnc(en){const sp=SP[en.sp];const e=mkEnt(en.x,en.y,1.4);const w={sp:sp.id,e,hab:sp.hab,wt:1+Math.random()*2,frozen:false,enc:en,home:[en.x,en.y]};
 G.wilds.push(w);if(S.dex[sp.id]!=='c'&&S.dex[sp.id]!=='s')S.dex[sp.id]='s';return w;}
function encResult(w,ok){G.wilds=G.wilds.filter(x=>x!==w);const en=w.enc;if(!en)return;
 if(ok){en.done=true;if(en===S.storyEnc){S.storyEnc=null;}storyEvent('befriend',1,w.sp);}
 else if(!en.story)en.done=true;}
function wildWalk(w,x,y){const t=G.world.get(x,y);if(w.hab==='water')return t==='~'||t==='S';if(!walkMap(x,y))return false;
 if(Math.abs(x-w.home[0])+Math.abs(y-w.home[1])>3)return false;if(w.hab==='grass')return t==='"';if(w.hab==='sand')return t==='s';return t!==':';}

// ---------------- particles ----------------
function puff(x,y,col='#ffffff',n=8){for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,s=20+Math.random()*30;G.parts.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-10,life:0.5,max:0.5,col,sz:2});}}
function hearts(x,y,n=3){for(let i=0;i<n;i++)G.parts.push({x:x+(Math.random()*12-6),y,vx:Math.random()*16-8,vy:-25-Math.random()*20,life:1,max:1,spr:HEART});}
function emote(ent,spr,dur=1.5){G.emotes.push({ent,spr,t:dur,max:dur});}

// ---------------- canvas ----------------
function resize(){
 const dpr=window.devicePixelRatio||1,cw=innerWidth,ch=innerHeight;const z=(typeof S!=='undefined'&&S&&S.opt&&S.opt.zoom!=null)?S.opt.zoom:1;const tw=[140,118,100][z]||118;let s=Math.max(2,Math.floor(Math.min(cw*dpr/tw,ch*dpr/(tw*1.6))));
 G.vw=Math.ceil(cw*dpr/s);G.vh=Math.ceil(ch*dpr/s);G.cv.width=G.vw;G.cv.height=G.vh;G.cv.style.width=(G.vw*s/dpr)+'px';G.cv.style.height=(G.vh*s/dpr)+'px';G.cs=s/dpr;
 G.ctx.imageSmoothingEnabled=false;G.light.width=G.vw;G.light.height=G.vh;}
function screenToWorld(cx,cy){const r=G.cv.getBoundingClientRect();return[(cx-r.left)/G.cs+G.cam.x,(cy-r.top)/G.cs+G.cam.y];}

// ---------------- input ----------------
function setupInput(){
 const cv=G.cv;
 cv.addEventListener('pointerdown',e=>{Snd.init();if(G.lock||!G.ready)return;G.ptr={sx:e.clientX,sy:e.clientY,x:e.clientX,y:e.clientY,t:performance.now(),hold:false};});
 cv.addEventListener('pointermove',e=>{if(!G.ptr)return;G.ptr.x=e.clientX;G.ptr.y=e.clientY;if(Math.hypot(e.clientX-G.ptr.sx,e.clientY-G.ptr.sy)>14)G.ptr.hold=true;});
 const up=e=>{if(!G.ptr)return;const p=G.ptr;G.ptr=null;if(G.lock)return;if(!p.hold){const[wx,wy]=screenToWorld(p.x,p.y);onTap(wx,wy);}};
 cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',()=>{G.ptr=null;});
 addEventListener('keydown',e=>{G.keys[e.key]=true;if((e.key===' '||e.key==='Enter')&&!G.lock&&G.ready){const p=G.player;const[dx,dy]={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]}[p.dir];const tx=p.tx+dx,ty=p.ty+dy;onTap(tx*TS+8,ty*TS+8);}});
 addEventListener('keyup',e=>{G.keys[e.key]=false;});
}
function holdMove(dt){
 if(G.ptr&&!G.lock){if(performance.now()-G.ptr.t>260)G.ptr.hold=true;if(G.ptr.hold){G.holdT-=dt;if(G.holdT<=0){G.holdT=0.15;const[wx,wy]=screenToWorld(G.ptr.x,G.ptr.y);const tx=Math.floor(wx/TS),ty=Math.floor(wy/TS);
   const p=G.player;if(walkable(tx,ty)){const path=bfs(p.tx,p.ty,(x,y)=>x===tx&&y===ty,walkable,gridW(),gridH(),1500);if(path){p.path=path;p.arrive=null;}}}}}
 const k=G.keys;const p=G.player;if(!p||G.lock)return;let d=null;if(k.ArrowUp||k.w)d=[0,-1];else if(k.ArrowDown||k.s)d=[0,1];else if(k.ArrowLeft||k.a)d=[-1,0];else if(k.ArrowRight||k.d)d=[1,0];
 if(d&&!p.moving&&!p.path.length){const nx=p.tx+d[0],ny=p.ty+d[1];p.dir=dirOf(d[0],d[1]);if(d[0])p.flip=d[0]<0;if(walkable(nx,ny))p.path=[[nx,ny]];}
}

// ---------------- tap / interact ----------------
function hitEntity(wx,wy){
 const c=[];const chk=(e,kind,o)=>{if(wx>=e.px-4&&wx<=e.px+20&&wy>=e.py-8&&wy<=e.py+18)c.push({kind,o,d:Math.hypot(wx-(e.px+8),wy-(e.py+8))});};
 if(G.scene==='map'){G.wilds.forEach(w=>chk(w.e,'wild',w));G.vils.forEach(v=>chk(v.e,'vil',v));}
 housePets().forEach(pa=>{if(!pa.hidden)chk(pa.e,'mon',pa);});
 c.sort((a,b)=>a.d-b.d);return c[0]||null;
}
function onTap(wx,wy){
 if(G.scene==='map'&&Village.building){Village.tap(Math.floor(wx/TS),Math.floor(wy/TS));return;}
 if(G.star&&G.star.t<G.star.dur){wish();return;}
 let h=hitEntity(wx,wy);
 if(h&&h.kind==='mon'&&G.scene==='map'&&G.tool==='till'&&canTill(Math.floor(wx/TS),Math.floor(wy/TS),true))h=null;
 if(h){const e=h.o.e;if(h.kind==='wild')h.o.frozen=true;Snd.sfx('tap');
  goAdjacent(e.tx,e.ty,()=>{const d=Math.abs(G.player.tx-e.tx)+Math.abs(G.player.ty-e.ty);if(d>2){h.o.frozen=false;return;}interactEnt(h);},()=>{if(h.kind==='wild')h.o.frozen=false;UI.toast('そこまで いけないみたい');});return;}
 let tx=Math.floor(wx/TS),ty=Math.floor(wy/TS);
 if(G.scene==='house'){return tapRoom(tx,ty);}
 if(G.scene==='inside'){return Inside.tap(tx,ty);}
 const W=G.world;
 // tall sprites: tap on canopy area -> tree below
 const below=W.get(tx,ty+1);
 let p=W.props[W.key(tx,ty)];
 if(!p&&(below==='T'||below==='#')&&(wy%TS)>7&&!walkMap(tx,ty)){p=W.props[W.key(tx,ty+1)];ty++;}
 const d=S.daily;
 if(Mini.hideTap(tx,ty))return;const bi=Mini.bugAt(tx,ty);if(bi>=0){goAdjacent(tx,ty,()=>Mini.catchBug(bi));return;}
 if(Post.bottleAt(tx,ty)){goAdjacent(tx,ty,()=>Post.openBottle(),()=>Post.openBottle());return;}
 const mi=Mist.at(tx,ty);if(mi>=0){goAdjacent(tx,ty,()=>Mist.fight(mi),()=>Mist.fight(mi));return;}
 const dig=d.digs.findIndex(g=>g[0]===tx&&g[1]===ty);if(dig>=0&&!d.dug.includes(dig)&&(dig<4||hasJob('seek'))){goAdjacent(tx,ty,()=>doDig(dig));return;}
 const sh=d.shells.findIndex(s=>s.x===tx&&s.y===ty);if(sh>=0&&!d.picked.includes(sh)){goAdjacent(tx,ty,()=>pickShell(sh));return;}
 if(S.farm[fk(tx,ty)]){goAdjacent(tx,ty,()=>{if(Mist.pestAt(tx,ty))Mist.pest(tx,ty);else farmAct(tx,ty);});return;}
 if(p&&p.kind!=='lamp'){goAdjacent(tx,ty,()=>interactProp(p,tx,ty));return;}
 if(S.outdoor&&S.outdoor.some(o=>o.x===tx&&o.y===ty&&o.id!=='stoneroad')){Village.interact(tx,ty);return;}
 if(G.tool==='till'&&canTill(tx,ty,true)){goAdjacent(tx,ty,()=>doTill(tx,ty));G.tapMark={x:tx,y:ty,t:0.5};return;}
 if(W.t[ty][tx]===','&&!G.tool&&Math.abs(G.player.tx-tx)+Math.abs(G.player.ty-ty)<=1&&!(G.player.tx===tx&&G.player.ty===ty)){Mini.pickFlower(tx,ty);return;}
 if(walkMap(tx,ty)){walkTo(tx,ty);G.tapMark={x:tx,y:ty,t:0.5};}
 else{const t=W.t[ty]&&W.t[ty][tx];if(t==='~'||t==='S'){goAdjacent(tx,ty,()=>itemCount('rod')?Mini.fish(tx,ty):UI.toast(t==='S'?'なみの おとが きもちいい…':'みずが きらきら ひかっている'));}}
}
function interactEnt(h){
 if(h.kind==='wild')return h.o.enc&&h.o.enc.lost?Story.foundLost(h.o):UI.catchGame(h.o);
 if(h.kind==='vil')return UI.talkVillager(h.o);
 if(h.kind==='mon')return UI.monMenu(h.o.mon,h.o.e);
}
function interactProp(p,tx,ty){
 switch(p.kind){
  case 'fruit':if(G.tool==='chop')UI.toast('くだものの なる きは きらないで おこう');return shakeFruit(p);
  case 'tree':return G.tool==='chop'?chopTree(tx,ty):shakeTree(tx,ty);
  case 'rock':return smashRock(p);
  case 'hut':return UI.hut();
  case 'door':return doorAct(p.b);case 'board':return UI.questPanel();case 'mailbox':return UI.mailPanel();case 'fountain':return UI.fountain();
 }
}
function doorAct(b){
 if(b.kind==='home'){Snd.sfx('door');return enterHouse();}
 if(Inside.door(b))return;
 if(b.kind==='shop'){Snd.sfx('door');return UI.shop();}
 if(b.vil==='chief')return Village.museum();
 const v=VIL[b.vil];const on=vilActive(v);
 UI.say(on?`${v.name}は でかけているみたい。 むらの どこかに いるかも。`:`…zzz。 ${v.name}は ねているみたい。 しずかに しておこう。`);
}

// ---------------- puchikko work ----------------
function bestWorker(job){const c=G.party.filter(p=>jobOf(p.mon.sp)===job);if(!c.length)return null;c.sort((a,b)=>enLeft(b.mon)-enLeft(a.mon));return c[0];}
function useWorker(job,fail){const w=bestWorker(job);if(!w){if(fail)fail();return null;}
 if(enLeft(w.mon)<=0){UI.toast(`${w.mon.name}は つかれて ひとやすみ ちゅう… くだものを あげると げんきが もどるよ`,w.mon.sp);return null;}
 if(perOf(w.mon)==='nonbiri'&&Math.random()<0.25){emote(w.e,NOTE,0.8);}else S.daily.en[w.mon.uid]=(S.daily.en[w.mon.uid]||0)+1;w.e.jump=0.45;emote(w.e,SPARK,0.8);return w;}
function toolsAvail(){const t=[''];if(hasJob('till'))t.push('till');if(hasJob('chop'))t.push('chop');return t;}
function fixTool(){if(!toolsAvail().includes(G.tool))G.tool='';}
function storyEvent(kind,n=1,sp){if(!S||S.story>=STORY_DONE||S.storyReady)return;const st=STORY[S.story];if(st.goal!==kind)return;if(kind==='befriend'&&st.sp!==sp)return;
 S.storyP+=n;if(S.storyP>=st.n){S.storyReady=true;setTimeout(()=>{UI.toast('そんちょうの ハルさんに ほうこくしよう！','scroll');Snd.jingle('mail');},900);}}

// trees, rocks, dig, shell
function shakeFruit(p){
 const d=S.daily;G.shake['f'+p.i]=0.5;Snd.sfx('rustle');
 if(d.shaken['f'+p.i]){UI.toast('もう くだものは ないみたい。 また あした！');return;}
 d.shaken['f'+p.i]=1;quest('shake');const wd=bestWorker('wind');let n=2;if(wd){n=monLv(wd.mon)>=5?4:3;wd.e.jump=0.45;gainExp(wd.mon,1);}addItem(p.fruit,n);
 for(let i=0;i<n;i++)G.parts.push({x:p.x*TS+4+i*5,y:p.y*TS-4,vx:(i-1)*12,vy:-10,g:180,life:0.7,max:0.7,col:ITEMS[p.fruit].col,sz:3});
 setTimeout(()=>{UI.toast(`${ITEMS[p.fruit].name}を ${n}こ てにいれた！`,p.fruit);Snd.sfx('get');},300);
}
function shakeTree(x,y){
 const d=S.daily;const k='t'+x+','+y;G.shake[k]=0.4;Snd.sfx('rustle');
 if(d.shaken[k]){UI.toast('はっぱが さわさわ ゆれた');return;}d.shaken[k]=1;quest('shake');
 const wd=bestWorker('wind');if(wd){wd.e.jump=0.45;gainExp(wd.mon,1);}const r=Math.random();
 if(r<(wd?0.5:0.35))setTimeout(()=>{addItem('branch');UI.toast('えだが おちてきた','branch');},250);
 else if(r<(wd?0.62:0.42))setTimeout(()=>{addItem('apple');UI.toast('りんごが ひとつ おちてきた！','apple');Snd.sfx('get');},250);
 else if(wd&&r<0.8){const s=['seed_sun','seed_sun','seed_straw','seed_pump'][Math.floor(Math.random()*4)];setTimeout(()=>{addItem(s);UI.toast(`${ITEMS[s].name}が おちてきた！`,s);Snd.sfx('get');},250);}
 else UI.toast('はっぱが さわさわ ゆれた');
}
function chopTree(x,y){
 const d=S.daily;const k='c'+x+','+y;G.shake['t'+x+','+y]=0.4;
 if(d.chopped[k]){Snd.sfx('rustle');UI.toast('この きは きょうは もう じゅうぶん。 ほかの きを さがそう');return;}
 const w=useWorker('chop',()=>UI.toast('きを きるのが とくいな なかまが いない…'));if(!w)return;
 d.chopped[k]=1;const lv=monLv(w.mon);const n=1+(lv>=4?1:0)+(lv>=7?1:0);addItem('wood',n);Snd.sfx('chop');
 for(let i=0;i<6;i++)G.parts.push({x:x*TS+8,y:y*TS+6,vx:Math.random()*60-30,vy:-30-Math.random()*30,g:160,life:0.6,max:0.6,col:'#c88a4a',sz:2});
 gainExp(w.mon,3);quest('chop',n);storyEvent('wood',n);
 let extra='';if(Math.random()<0.2){addItem('branch');extra='・えだ';}
 UI.toast(`${w.mon.name}が きを きった！ もくざい×${n}${extra}`,'wood');
}
function smashRock(p){
 const d=S.daily;const k='r'+p.i;const w0=bestWorker('smash');G.shake['r'+p.i]=0.25;
 if(!w0){Snd.sfx('rock');UI.toast('てで たたいても びくとも しない… いわを わるのが とくいな なかまが いれば');return;}
 const lv=monLv(w0.mon);const max=lv>=5?4:3;const n=d.rocks[k]||0;
 if(n>=max){Snd.sfx('rock');UI.toast('いまは なにも でなさそう。 また あした');return;}
 const w=useWorker('smash');if(!w)return;d.rocks[k]=n+1;Snd.sfx('rock');puff(p.x*TS+8,p.y*TS+10,'#c4c4d0',8);
 gainExp(w.mon,3);quest('smash');storyEvent('smash',1);
 const r=Math.random();const ip=0.16+lv*0.02;let msg,icon;
 if(r<0.05){addItem('gem');msg='きらきらいしが でてきた！';icon='gem';}
 else if(lv>=5&&r<0.09){addItem('fossil');msg='かせきが でてきた！';icon='fossil';}
 else if(r<0.09+ip){addItem('iron');msg='てっこうせきが でてきた！';icon='iron';}
 else if(r<0.19+ip){const c=30+Math.floor(Math.random()*40);addCoins(c);msg=`${c}ポカ でてきた！`;icon='coin';}
 else{const m=lv>=4?2:1;addItem('stone',m);msg=`いしを ${m}こ てにいれた`;icon='stone';}
 setTimeout(()=>{UI.toast(`${w.mon.name}が いわを わった！ ${msg}`,icon);Snd.sfx('get');},250);
}
function doDig(i){
 const d=S.daily;if(i>=4){const w=useWorker('seek');if(!w)return;gainExp(w.mon,2);}
 d.dug.push(i);quest('dig');Snd.sfx('dig');const[x,y]=d.digs[i];puff(x*TS+8,y*TS+10,'#a8784a',10);
 const r=Math.random();let msg,icon;
 if(r<0.2){addItem('fossil');msg='かせきを ほりあてた！';icon='fossil';}
 else if(r<0.34){addItem('oldcoin');msg='むかしのコインを みつけた！';icon='oldcoin';}
 else if(r<0.42){addItem('egg');msg='ぷちっこのたまごが でてきた！';icon='egg';}
 else if(r<0.5){addItem('gem');msg='きらきらいしを みつけた！';icon='gem';}
 else if(r<0.62){addItem('clay',2);msg='ねんどが でてきた';icon='clay';}
 else if(r<0.8){const c=80+Math.floor(Math.random()*120);addCoins(c);msg=`${c}ポカ うまっていた！`;icon='coin';}
 else{addItem('stone');msg='いしが でてきた';icon='stone';}
 setTimeout(()=>{UI.toast(msg,icon);Snd.sfx('get');},250);Story.tryKakera('dig');
}
function pickShell(i){const d=S.daily;d.picked.push(i);const s=d.shells[i];addItem(s.k);quest('shell');Snd.sfx('get');UI.toast(`${ITEMS[s.k].name}を ひろった！`,s.k);}

// ---------------- farm ----------------
function fk(x,y){return x+','+y;}
function canTill(x,y,loose){const W=G.world;const t=W.get(x,y);if(t!=='.'&&t!==',')return false;if(y<3||y>34||x<2||x>W.W-3)return false;
 if(W.props[W.key(x,y)]||S.farm[fk(x,y)]||(S.outdoor&&S.outdoor.some(o=>o.x===x&&o.y===y)))return false;const d=S.daily;if(d.digs.some(g=>g[0]===x&&g[1]===y)||d.shells.some(s=>s.x===x&&s.y===y))return false;
 if(!loose&&(G.player.tx===x&&G.player.ty===y))return false;if(G.vils.some(v=>v.e.tx===x&&v.e.ty===y))return false;
 return Object.keys(S.farm).length<60;}
function doTill(tx,ty){
 if(!canTill(tx,ty)){UI.toast('ここは たがやせないみたい');return;}
 const w=useWorker('till',()=>UI.toast('たがやすのが とくいな なかまが いない…'));if(!w)return;
 const lv=monLv(w.mon);const n=lv>=7?3:lv>=4?2:1;const p=G.player;let dx=Math.sign(tx-p.tx),dy=Math.sign(ty-p.ty);if(dx&&dy)dy=0;let cnt=0;
 for(let i=0;i<n;i++){const x=tx+dx*i,y=ty+dy*i;if(i>0&&!canTill(x,y))break;S.farm[fk(x,y)]={crop:null,grow:0,water:false};cnt++;puff(x*TS+8,y*TS+10,'#a8784a',8);}
 Snd.sfx('dig');gainExp(w.mon,2);quest('till',cnt);storyEvent('till',cnt);
 const r=Math.random();if(r<0.12){addItem('clay');UI.toast('つちの なかから ねんどが でてきた！','clay');}else if(r<0.18){addItem('stone');UI.toast('つちの なかから いしが でてきた','stone');}
 else UI.toast(cnt>1?`${w.mon.name}が ${cnt}マス たがやした！`:`${w.mon.name}が たがやした！`,w.mon.sp);
}
function cropStage(f){if(!f.crop)return -1;if(f.grow>=1)return 3;if(f.grow>=0.5)return 2;if(f.grow>=0.12)return 1;return 0;}
function cropSeed(crop){return Object.keys(ITEMS).find(k=>ITEMS[k].crop===crop);}
function growPlots(ms){const rain=G.weather==='rain';if(seriesOn('nature'))ms*=1.2;for(const k in S.farm){const f=S.farm[k];if(!f.crop)continue;if(rain)f.water=true;
 if(f.water&&f.grow<1){const it=ITEMS[cropSeed(f.crop)];f.grow=Math.min(1,f.grow+ms/(it.hours*3600000));}}}
async function farmAct(x,y){
 const k=fk(x,y);const f=S.farm[k];if(!f)return;
 if(!f.crop){const seeds=Object.keys(S.items).filter(k=>ITEMS[k]&&ITEMS[k].cat==='seed');
  const ch=await UI.say(seeds.length?'なにを うえる？':'たねを もっていない。 にゃんこしょうてんで かえるよ。',{choices:seeds.map(k=>`${ITEMS[k].name}（${itemCount(k)}）`).concat(['もとの じめんに もどす','やめる'])});
  if(ch<0)return;
  if(ch<seeds.length){const s=seeds[ch];takeItem(s);f.crop=ITEMS[s].crop;f.grow=0;f.water=G.weather==='rain';quest('plant');Snd.sfx('dig');UI.toast(f.water?`${ITEMS[s].name}を うえた！`:`${ITEMS[s].name}を うえた！ みずを あげよう`,s);return;}
  if(ch===seeds.length){delete S.farm[k];Snd.sfx('dig');puff(x*TS+8,y*TS+10,'#86d462',6);}return;}
 const st=cropStage(f);
 if(st===3){const it=ITEMS[cropSeed(f.crop)];const n=it.yield||1;addItem(f.crop,n);Mini.noteFlower(f.crop);if(!S.firstCrop)S.firstCrop={};if(!S.firstCrop[f.crop]){S.firstCrop[f.crop]=1;addMemory(`はじめて ${ITEMS[f.crop].name}を しゅうかくした`,f.crop);}if(f.crop.startsWith('tulip_'))Mini.tulipHybrid(x,y,f.crop);UI.toast(`${ITEMS[f.crop].name}を ${n}こ しゅうかく！`,f.crop);Snd.sfx('get');f.crop=null;f.grow=0;f.water=false;puff(x*TS+8,y*TS+8,'#fff6a0');return;}
 if(!f.water){const w=useWorker('water',()=>UI.toast('みずやりが とくいな なかまが いれば…'));if(!w)return;
  const lv=monLv(w.mon);const area=lv>=7?[[0,0],[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]:lv>=4?[[0,0],[1,0],[-1,0],[0,1],[0,-1]]:[[0,0]];let n=0;
  for(const[ax,ay]of area){const g=S.farm[fk(x+ax,y+ay)];if(g&&g.crop&&!g.water&&cropStage(g)<3){g.water=true;n++;puff((x+ax)*TS+8,(y+ay)*TS+6,'#9ad8ff',6);}}
  Snd.sfx('water');gainExp(w.mon,2);quest('water',n);storyEvent('water',n);UI.toast(n>1?`${w.mon.name}が ${n}マスに みずを まいた！`:`${w.mon.name}が みずを あげた！`,w.mon.sp);return;}
 const it=ITEMS[cropSeed(f.crop)];const rem=(1-f.grow)*it.hours*3600000;const h=Math.floor(rem/3600000),m=Math.ceil((rem%3600000)/60000);
 UI.toast(`すくすく そだっている。 あと ${h?h+'じかん ':''}${m}ふん くらい`);
}

// affection, exp & evolution
function gainAff(m,n,quiet){m.aff+=n;if(!quiet)UI.hud();checkEvolve(m);}
function gainExp(m,n){const b=monLv(m);m.exp=(m.exp||0)+n;const a=monLv(m);if(a>b)setTimeout(()=>{UI.toast(`${m.name}の レベルが ${a}に あがった！`,m.sp);Snd.sfx('lvup');},500);checkEvolve(m);}
function checkEvolve(m){const sp=SP[m.sp];if(sp.evo&&monLv(m)>=EVO_LV&&m.aff>=EVO_AFF&&!m.evoPending){m.evoPending=true;setTimeout(()=>UI.evolve(m),900);}}

// wish on star
function wish(){const d=S.daily;G.star.t=G.star.dur;if(d.stars>=3){UI.toast('ながれぼしに おねがいした… ☆');return;}d.stars++;addItem('starbit');Story.tryKakera('star');Snd.sfx('star');UI.toast('ねがいごとを した！ ほしのかけらを てにいれた','starbit');}

// ---------------- house ----------------
function enterHouse(){fadeTo(()=>{G.scene='house';G.wilds=[];placePlayer(DOOR_X[0],ROOM_H-1,'up');lifeEnter();UI.houseMode(true);updateBGM();save();});}
function exitHouse(){Snd.sfx('door');fadeTo(()=>{lifeExit();G.scene='map';const b=BUILDINGS[0];placePlayer(b.door[0],b.door[1]+1,'down');UI.houseMode(false);syncEncounters();updateBGM();save();});}
function tapRoom(tx,ty){
 if(UI.decor){return UI.decorTap(tx,ty);}
 if(Post.guestTap(tx,ty))return;
 if(ty>=ROOM_H&&DOOR_X.includes(tx)){walkTo(tx,ROOM_H-1,()=>exitHouse());return;}
 const f=furnAt(tx,ty);
 if(f){const act=()=>furnAct(f);if(FURN[f.id].walk){walkTo(tx,ty,act);}else goAdjacent(tx,ty,act);return;}
 if(walkRoom(tx,ty))walkTo(tx,ty);
}
function furnAct(f){
 const n=FURN[f.id].name;
 switch(f.id){
  case 'workbench':return UI.craft();
  case 'mirror':return SUI.wardrobe();
  case 'bed':return UI.bedtime();
  case 'clock':{const d=NOW();return UI.say(`いまは ${d.getHours()}じ ${d.getMinutes()}ふん。 チクタク…`);}
  case 'tv':{const h=NOW().getHours();if(h>=17||h<4){const{L}=tomorrowLines();return UI.sayAll(['テレビ「こんばんは。 あしたの ぽかぽか村の よこくです」',...L.slice(0,4).map(x=>'テレビ「'+x+'」')]);}return UI.say(`テレビ「きょうの ぽかぽか村は ${WEATHER_JP[G.weather]}。 ${UI.forecastText()}」`);}
  case 'piano':Snd.jingle('piano');return UI.toast('ポロン♪');
  case 'radio':G.radio=!G.radio;updateBGM();return UI.toast(G.radio?'ラジオを つけた ♪':'ラジオを けした');
  case 'lamp':case 'pumpkinlamp':f.off=!f.off;return UI.toast(f.off?'あかりを けした':'あかりを つけた');
  case 'momphoto':return UI.say('かぞくの しゃしん。 みていると こころが ぽかぽか する。');
  case 'music':Snd.jingle('newday');return UI.toast('♪〜');
  case 'fishbowl':return UI.say('きんぎょが すいすい およいでいる。');
  case 'kotatsu':return UI.say('こたつ… ぬくぬく… でられなく なりそう。');
  case 'rug':case 'rug2':case 'mat':case 'cushion':return UI.toast(`${n}。 ふかふか。`);
  default:if(FURN[f.id].toy){const p=housePets().find(p=>p.ai&&p.ai.f===f);return UI.toast(p?`${p.mon.name}が ${actText(p)}`:`${n}。 ぷちっこの おきにいり。`);}return UI.toast(n);
 }
}

// ---------------- fade ----------------
function fadeTo(fn){const f=document.getElementById('fade');G.lock++;f.classList.add('on');setTimeout(()=>{fn();setTimeout(()=>{f.classList.remove('on');G.lock--;},120);},260);}

// ---------------- bgm ----------------
function bgmFor(){if(G.catching)return 'catch';if(G.shopOpen)return 'shop';if(G.scene==='inside'&&G.inside)return G.inside.bgm;if(G.scene==='house')return G.radio?'radio':'house';return{M:'morning',D:'day',E:'evening',N:'night'}[phaseOf()];}
function updateBGM(){Snd.play(bgmFor());Snd.setRain(G.weather==='rain'&&G.scene==='map');}

// ---------------- update ----------------
function update(dt){
 G.t+=dt;holdMove(dt);
 const walkF=walkable;
 if(G.player)entUpdate(G.player,dt,walkF);
 if(G.scene==='house')lifeUpdate(dt);else for(const pa of G.party){entUpdate(pa.e,dt,null);if(pa.e.jump>0)pa.e.jump=Math.max(0,pa.e.jump-dt);}
 if(G.scene==='map'){
  for(const v of G.vils){if(v.talking){v.e.path=[];}else{v.wt-=dt;if(v.wt<=0&&!v.e.moving){v.wt=1.5+Math.random()*4;const h=v.v.home;const opts=DIRS.map(([dx,dy])=>[v.e.tx+dx,v.e.ty+dy]).filter(([x,y])=>walkMap(x,y)&&Math.abs(x-h[0])+Math.abs(y-h[1])<9);
    if(opts.length&&Math.random()<0.8)v.e.path=[opts[Math.floor(Math.random()*opts.length)]];if(Math.random()<0.12)emote(v.e,NOTE,1.4);}}entUpdate(v.e,dt,walkMap);}
  for(const w of G.wilds){if(!w.frozen){w.wt-=dt;if(w.wt<=0&&!w.e.moving){w.wt=1.6+Math.random()*3;const opts=DIRS.map(([dx,dy])=>[w.e.tx+dx,w.e.ty+dy]).filter(([x,y])=>wildWalk(w,x,y));
    if(opts.length&&Math.random()<0.6)w.e.path=[opts[Math.floor(Math.random()*opts.length)]];if(w.enc&&w.enc.story&&Math.random()<0.5)emote(w.e,EXCL,1.2);}}
   entUpdate(w.e,dt,null);if(Math.random()<dt*(SP[w.sp].rare>=3?3:1.2))G.parts.push({x:w.e.px+Math.random()*16,y:w.e.py+Math.random()*12,vx:0,vy:-8,life:0.7,max:0.7,spr:SPARK});}
  Mini.hideTick(dt);
  // shooting star
  const h=NOW().getHours();if((h>=20||h<4)&&G.weather==='clear'&&!G.lock){G.starT-=dt;if(G.starT<=0){{const L=seriesOn('light');G.starT=(L?15:40)+Math.random()*(L?40:80);}G.star={x:G.vw*(0.3+Math.random()*0.6),y:10+Math.random()*G.vh*0.25,t:0,dur:1.6};Snd.sfx('star');}}
  if(G.star){G.star.t+=dt;if(G.star.t>G.star.dur+0.3)G.star=null;}
 }
 for(const k in G.shake){G.shake[k]-=dt;if(G.shake[k]<=0)delete G.shake[k];}
 for(let i=G.parts.length-1;i>=0;i--){const p=G.parts[i];p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;if(p.g)p.vy+=p.g*dt;else p.vy*=0.96;if(p.life<=0)G.parts.splice(i,1);}
 for(let i=G.emotes.length-1;i>=0;i--){G.emotes[i].t-=dt;if(G.emotes[i].t<=0)G.emotes.splice(i,1);}
 if(G.tapMark){G.tapMark.t-=dt;if(G.tapMark.t<=0)G.tapMark=null;}
 updateWeatherParts(dt);
 // camera
 const p=G.player;if(p){if(G.scene==='map'){const mw=G.world.W*TS,mh=G.world.H*TS;let tx=p.px+8-G.vw/2,ty=p.py+8-G.vh*0.48;tx=Math.max(0,Math.min(mw-G.vw,tx));ty=Math.max(-8,Math.min(mh-G.vh,ty));
  G.cam.x+=(tx-G.cam.x)*Math.min(1,dt*10);G.cam.y+=(ty-G.cam.y)*Math.min(1,dt*10);}
  else{const rw=ROOM_W*TS,rh=ROOM_H*TS+6;const fit=(v,size,pp)=>size+12<=v?-(v-size)/2:Math.max(-6,Math.min(size-v+6,pp-v/2));
   const tx=fit(G.vw,rw,p.px+8),ty=fit(G.vh,rh,p.py+8)+(rh+12<=G.vh?10:0);G.cam.x+=(tx-G.cam.x)*Math.min(1,dt*10);G.cam.y+=(ty-G.cam.y)*Math.min(1,dt*10);}}
}
let _acc=0;
function tick1s(){
 if(!S||!G.ready)return;const d=NOW();const m=d.getMinutes(),h=d.getHours();
 const nowMs=Date.now();growPlots(nowMs-S.lastTick);S.lastTick=nowMs;
 if(h<4)S.flags.late=1;
 if(m!==G.lastMin){G.lastMin=m;
  const w=weatherAt(d);if(w!==G.weather){G.weather=w;initWeatherParts();updateBGM();}
  const ph=phaseOf(d);if(ph!==G.phase){G.phase=ph;updateBGM();}
  trackPhase();if(S.story>=5&&!S.flags.toyLetter){S.flags.toyLetter=1;pushMail(TOY_LETTER);}if(S.story>=STORY_DONE&&(!S.flags.villageLetter||S.recipes.length<START_RECIPES.length))grantRecipes();
  if(G.lastHour>=0&&h!==G.lastHour&&!G.lock){Snd.jingle('chime');UI.toast(`${h}じに なったよ`,'clock');}G.lastHour=h;
  if(G.scene==='map'){syncVillagers();if(!G.lock)syncEncounters();}
  if(dayKey(d)!==S.daily.day&&!G.lock){ensureDaily();Story.syncWorld();const se=seasonOf(d);if(se!==G.season){G.season=se;G.layers=buildMapLayers(G.world,se);}UI.news();}
  checkEggs();save();}
 giftTick();Calm.tick();Mist.tick();Post.tick();UI.hud();
}
function checkEggs(){if(G.lock||!S.eggs.length||G.scene!=='map')return;const now=Date.now();const i=S.eggs.findIndex(e=>now-e.t>=6*3600000);if(i<0)return;S.eggs.splice(i,1);
 const pool=SPECIES.filter(s=>s.rare>=1&&s.rare<=3);const sp=wpick(pool,s=>RARE_W[s.rare]);UI.hatch(sp.id);}

// ---------------- weather particles ----------------
function initWeatherParts(){G.wparts=[];const w=G.weather,se=G.season;const n=w==='rain'?70:w==='snow'?50:0;
 for(let i=0;i<n;i++)G.wparts.push({k:w,x:Math.random()*G.vw,y:Math.random()*G.vh,s:0.6+Math.random()*0.6});
 if(w!=='rain'&&w!=='snow'){if(se==='sp')for(let i=0;i<14;i++)G.wparts.push({k:'petal',x:Math.random()*G.vw,y:Math.random()*G.vh,s:0.5+Math.random(),ph:Math.random()*6});
  if(se==='au')for(let i=0;i<9;i++)G.wparts.push({k:'leaf',x:Math.random()*G.vw,y:Math.random()*G.vh,s:0.5+Math.random(),ph:Math.random()*6,c:['#e8743a','#f0c040','#c8502a'][i%3]});}
 if(se==='su')for(let i=0;i<14;i++)G.wparts.push({k:'fly',x:Math.random()*G.vw,y:Math.random()*G.vh,s:Math.random()*6,ph:Math.random()*6});}
function updateWeatherParts(dt){for(const p of G.wparts){switch(p.k){
 case 'rain':p.y+=260*p.s*dt;p.x-=50*dt;break;case 'snow':p.y+=22*p.s*dt;p.x+=Math.sin(G.t*1.5+p.y*0.05)*10*dt;break;
 case 'petal':case 'leaf':p.y+=16*p.s*dt;p.x+=(14+Math.sin(G.t*2+p.ph)*16)*dt;break;case 'fly':p.ph+=dt;p.x+=Math.sin(p.ph*1.3)*10*dt;p.y+=Math.cos(p.ph)*8*dt;break;}
 if(p.y>G.vh+4){p.y=-4;p.x=Math.random()*G.vw*1.2;}if(p.x<-6)p.x=G.vw+4;if(p.x>G.vw+6)p.x=-4;}}
