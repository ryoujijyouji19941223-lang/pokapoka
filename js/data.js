'use strict';
// ============================================================
//  ぽかぽか村と ぷちっこ  -  data
// ============================================================
const TS = 16;

function hashStr(s){let h=2166136261>>>0;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)>>>0;}return h>>>0;}
function mkRng(seed){let a=seed>>>0;return function(){a=(a+0x6D2B79F5)>>>0;let t=a;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296;};}
function rpick(r,arr){return arr[Math.floor(r()*arr.length)];}

// ---------------- types ----------------
const TYPES = {
  kusa:  {jp:'くさ',   col:'#4caf50', skill:'はたけの さくもつが はやく そだつ'},
  mizu:  {jp:'みず',   col:'#3a9ad9', skill:'はたけに みずを まいてくれる'},
  hono:  {jp:'ほのお', col:'#f06a3a', skill:'なかよしゲームの わくが ひろがる'},
  denki: {jp:'でんき', col:'#e0a820', skill:'いわから でる アイテムが ふえる'},
  kaze:  {jp:'かぜ',   col:'#3cb8b0', skill:'きを ゆらすと くだものが おおく おちる'},
  yozora:{jp:'よぞら', col:'#8a6ad8', skill:'よるに めずらしい ぷちっこが でやすい'},
};
const HAB_JP = {grass:'くさむら', flower:'おはなばたけ', water:'かわや いけの なか', tree:'きの ちかく', sand:'すなはま', shore:'みずべ', any:'むらの あちこち', plaza:'ひろば'};
const TIME_JP = {M:'あさ', D:'ひる', E:'ゆうがた', N:'よる'};
const SEASON_JP = {sp:'はる', su:'なつ', au:'あき', wi:'ふゆ'};
const WEATHER_JP = {clear:'はれ', cloudy:'くもり', rain:'あめ', snow:'ゆき'};

// ---------------- creature templates (16x16) ----------------
const TEMPLATES = {
 blob:["................","................","................","................",
  "......aaaa......","....aaaaaaaa....","...awaaaaaaaa...","..awaaaaaaaaaa..",
  "..aaaeaaaaeaaa..",".aaaaeaaaaeaaaa.",".aapaaammaaapaa.",".aaaaabbbbaaaaa.",
  ".aaaabbbbbbaaaa.","..aaabbbbbbaaa..","...aaaaaaaaaa...","................"],
 cat:["................","...a........a...","...aa......aa...","...aca....aca...",
  "...aaaaaaaaaa...","..aaaaaaaaaaaa..","..aaeaaaaaaeaa..","..aaeaaaaaaeaa..",
  "..apaaammaaapa..","...aaaaaaaaaa...","....abbbbbba....","...aabbbbbbaa.aa",
  "...aabbbbbbaa.a.","...aaabbbbaaaaa.","...aa.aaaa.aa...","................"],
 bird:["................","................","................","................",
  ".....aaaaaa.....","....aaaaaaaa....","...aaeaaaaeaa...","...aaeaaaaeaa...",
  "...apaayyaapa...","..aaaaayyaaaaa..",".a.abbbbbbbba.a.",".aaabbbbbbbbaaa.",
  "..aaabbbbbbaaa..","....aaaaaaaa....",".....y....y.....","....yy....yy...."],
 fish:["................","................","................","................",
  ".......cc.......",".....aaaaaa....c","...aaaaaaaaa..cc","..aeaaaaaaaaacc.",
  ".apaaabbbbbaaac.","..aaabbbbbbaacc.","...aaaaaaaaa..cc",".....aaaaaa....c",
  ".......cc.......","................","................","................"],
 bug:["................","................","................","................",
  "................","....aaaaaaaa....","...aaeaaaaeaa...","...aaeaaaaeaa...",
  "...apaammaapa...",".k.bbbbccbbbb.k.","..kbbbbccbbbbk..",".k.bbbbccbbbb.k.",
  "...bbbbccbbbb...","....bbbccbbb....","....k......k....","................"],
 bunny:["....aa....aa....","....ac....ca....","....ac....ca....","....ac....ca....",
  "....aa....aa....","....aaaaaaaa....","...aaaaaaaaaa...","...aaeaaaaeaa...",
  "...aaeaaaaeaa...","...apaammaapa...","....aaaaaaaa....","...aabbbbbbaa...",
  "...aabbbbbbaa...","....abbbbbba.aa.","....aa....aa....","................"],
 puff:["................","................","................","................",
  "......aa.aa.....","....aaaaaaaaa...","...aaaaaaaaaaa..","..aaaaaaaaaaaaa.",
  ".aaaaeaaaaeaaaa.",".aaaaeaaaaeaaaa.","aaapaaammaaapaaa","aaaaaaaaaaaaaaaa",
  ".aaaaaaaaaaaaaa.","..aa.aaaaaa.aa..","................","................"],
 lizard:["................","................","....c......c....","....ca....ac....",
  "....aaaaaaaa....","...aaaaaaaaaa...","...aeaaaaaaea...","...aeaaaaaaea...",
  "...aaaammaaaa...","....aaaaaaaa....","...aabbbbbbaa...","..aaabbbbbbaaa..",
  "..a.abbbbbba.aac","....abbbbbba.a..","....aa....aa....","................"],
 mush:["................","................",".....cccccc.....","...ccwcccccwc...",
  "..cccccccwcccc..",".cwcccccccccwcc.",".cccccccccccccc.","..cccccccccccc..",
  "....aaaaaaaa....","....aeaaaaea....","....aeaaaaea....","....paammaap....",
  "....aaaaaaaa....",".....aaaaaa.....","....aa....aa....","................"],
 ghost:["................","................","................",".....aaaaaa.....",
  "....aaaaaaaa....","...awaaaaaaaa...","..aaaeaaaaeaaa..","..aaaeaaaaeaaa..",
  "..aapaammaapaa..","..aaaaaaaaaaaa..",".aaaaaaaaaaaaaa.","..aaaaaaaaaaaa..",
  "..aaaaaaaaaaaa..","..aa.aaa.aaa.aa.","................","................"],
};
const TPL_ANCHOR = {blob:{h:[8,4]}, cat:{h:[8,4],t:[14,11]}, bird:{h:[8,4]}, fish:{h:[8,5]}, bug:{h:[8,5]},
  bunny:{h:[8,5]}, puff:{h:[8,5]}, lizard:{h:[8,4],t:[15,12]}, mush:{h:[8,2]}, ghost:{h:[8,3]}};

const ACC = {
 leaf:["..xx",".xxx",".yx.",".y.."],
 leaf2:["xx...xx","xxx.xxx",".xxyxx.","...y..."],
 drop:[".x.",".x.","xxx","xyx",".x."],
 flame:[".x..",".xx.","xxx.","xyxx","xyyx",".xx."],
 bolt:["..xx",".xx.","xxxx",".xx.","xx.."],
 star:["..x..",".xxx.","xxyxx",".xxx.",".x.x."],
 moon:[".xx","xx.","xx.","xx.",".xx"],
 flower:[".x.","xyx",".x."],
 crown:["x.x.x","xxxxx","xyxyx","xxxxx"],
 hornS:["..x","..x",".xx",".x."],
 horn:["x...x","xx.xx",".xxx.","..x.."],
 crest:["x...x",".x.x.","..x.."],
 feather:["...x","..xx",".xyx","xyx.","y..."],
 hat:[".xxx.",".xxx.","yyyyy"],
 wings:["xx..","xxx.","xxxx",".xxx","..xx"],
};

// ---------------- species ----------------
// acc: [key, pos(head|tail|side|wings), xColor, yColor]
const SPECIES = [
 {id:'moppuru',name:'もっぷる',type:'kusa',tpl:'blob',pal:{a:'#86d96a',b:'#e2f7c4'},acc:[['leaf','head','#3fa040','#2a7a2e']],hab:'grass',time:'MDE',season:'*',weather:'*',rare:1,evo:'moripurun',
  desc:'あたまの はっぱで ひなたぼっこを する。 あさつゆを のむと ぷるんと ふくらむ。'},
 {id:'moripurun',name:'もりぷるん',type:'kusa',tpl:'blob',pal:{a:'#4fb860',b:'#cdf0a8'},acc:[['leaf2','head','#2e8c3a','#1f6a2a'],['flower','side','#ff8fb8','#fff27a']],rare:0,
  desc:'もりの においが する ぷるぷるボディ。 そばに いると なぜか ねむくなる。'},
 {id:'shizukun',name:'しずくん',type:'mizu',tpl:'blob',pal:{a:'#74c8f4',b:'#dff5ff'},acc:[['drop','head','#4aa8f0','#ffffff']],hab:'shore',time:'*',season:'*',weather:'*',rare:1,evo:'minamon',
  desc:'みずべで ぽよんと はねている。 あめの ひは いつもより げんき。'},
 {id:'minamon',name:'みなもん',type:'mizu',tpl:'blob',pal:{a:'#4a96e8',b:'#c8eaff'},acc:[['wings','wings','#a8e0ff','#ffffff'],['drop','head','#2a78d8','#ffffff']],rare:0,
  desc:'みずの うえを すべるように はしる。 ひれの ような はねで ちょっとだけ とべる。'},
 {id:'honoya',name:'ほのにゃ',type:'hono',tpl:'cat',pal:{a:'#ffa458',b:'#ffe6c0',c:'#ffc4b0'},acc:[['flame','tail','#ff6a3a','#ffd84a']],hab:'grass',time:'DE',season:'*',weather:'*',rare:2,evo:'homuranya',
  desc:'しっぽの ほのおは きもちで いろが かわる。 じつは さむがり。'},
 {id:'homuranya',name:'ほむらにゃ',type:'hono',tpl:'cat',pal:{a:'#f2683e',b:'#ffdca0',c:'#ffbca0'},acc:[['flame','tail','#ffd84a','#ffffff'],['flame','head','#ff4a2a','#ffd84a']],rare:0,
  desc:'あたまと しっぽに ほのおを ともす。 ふゆは みんなの ひなたぼっこ スポット。'},
 {id:'pachipiyo',name:'ぱちぴよ',type:'denki',tpl:'bird',pal:{a:'#ffe46a',b:'#fff8cc',y:'#ff9a3a'},acc:[['bolt','head','#ffb020','#ffffff']],hab:'tree',time:'MD',season:'*',weather:'*',rare:1,evo:'raichon',
  desc:'はねを こすると ぱちぱち ひかる。 むらで いちばんの はやおき。'},
 {id:'raichon',name:'らいちょん',type:'denki',tpl:'bird',pal:{a:'#ffcc2a',b:'#fff0a0',y:'#ff7a20'},acc:[['wings','wings','#ffe88a','#ffffff'],['bolt','head','#ff9a10','#ffffff']],rare:0,
  desc:'おおきな はねに でんきを ためる。 かみなりの ひは ちょっと ほこらしげ。'},
 {id:'fuwawa',name:'ふわわ',type:'kaze',tpl:'puff',pal:{a:'#f6fcff'},acc:[['feather','head','#9fe8e0','#5cc8c0']],hab:'flower',time:'MDE',season:'*',weather:'*',rare:1,evo:'kumofuwa',
  desc:'かぜに のって ふわふわ さんぽ。 たんぽぽの わたげと なかよし。'},
 {id:'kumofuwa',name:'くもふわ',type:'kaze',tpl:'puff',pal:{a:'#dcefff'},acc:[['wings','wings','#ffffff','#bfe8ff'],['feather','head','#5cc8c0','#2aa8a0']],rare:0,
  desc:'くもの ように おおきく なった。 せなかで ねむると いい ゆめが みられるとか。'},
 {id:'yoruusa',name:'よるうさ',type:'yozora',tpl:'bunny',pal:{a:'#9a8ee0',b:'#e2dcff',c:'#ffb8e8'},acc:[['moon','side','#fff27a','#ffffff']],hab:'grass',time:'N',season:'*',weather:'*',rare:2,evo:'tsukiusa',
  desc:'よるに なると みみが ほんのり ひかる。 ひるまは ぐっすり ねむっている。'},
 {id:'tsukiusa',name:'つきうさ',type:'yozora',tpl:'bunny',pal:{a:'#6a5ec8',b:'#cfc6ff',c:'#ffa8e0'},acc:[['moon','side','#fff27a','#ffffff'],['star','head','#ffe85a','#ffffff']],rare:0,
  desc:'つきの ひかりを あびて そだつ。 まんげつの よるは ずっと おどっている。'},
 {id:'koron',name:'ころん',type:'kusa',tpl:'bug',pal:{a:'#9ad870',b:'#4f9e40',c:'#356e2c'},acc:[['hornS','head','#6a4a2a','#8a6a3a']],hab:'tree',time:'DEN',season:'sp,su,au',weather:'*',rare:1,evo:'korokabuto',
  desc:'きの みきが おきにいり。 ころんと ころがって ねるのが すき。'},
 {id:'korokabuto',name:'ころかぶと',type:'kusa',tpl:'bug',pal:{a:'#7ac850',b:'#2e7a3c',c:'#1e5a2a'},acc:[['horn','head','#d8a020','#ffe070']],rare:0,
  desc:'りっぱな つのが じまん。 ちからもちで いしも かるがる はこぶ。'},
 {id:'pichigyo',name:'ぴちぎょ',type:'mizu',tpl:'fish',pal:{a:'#ff9470',b:'#ffe4d4',c:'#ffd04a'},acc:[],hab:'water',time:'*',season:'*',weather:'*',rare:1,evo:'gyogyomaru',
  desc:'かわを ぴちぴち およぐ。 あわを ぷくぷく はくのが とくい。'},
 {id:'gyogyomaru',name:'ぎょぎょまる',type:'mizu',tpl:'fish',pal:{a:'#e8543c',b:'#ffd4b8',c:'#ffb020'},acc:[['crown','head','#ffd030','#ff5a5a']],rare:0,
  desc:'かわの おうさまを なのる。 おうかんは まいにち じぶんで みがいている。'},
 {id:'pokage',name:'ぽかげ',type:'hono',tpl:'lizard',pal:{a:'#ffb85a',b:'#fff0c0',c:'#ff6a3a'},acc:[],hab:'sand',time:'MDE',season:'*',weather:'*',rare:2,evo:'pokagedon',
  desc:'すなはまで ひなたぼっこ。 せなかを さわると ぽかぽか あったかい。'},
 {id:'pokagedon',name:'ぽかげドン',type:'hono',tpl:'lizard',pal:{a:'#ec6e30',b:'#ffdc98',c:'#ffd040'},acc:[['flame','head','#ff4a2a','#ffd84a']],rare:0,
  desc:'あたまの ほのおで まわりを あたためる。 むらの ふゆの みかた。'},
 {id:'fuwarin',name:'ふわりん',type:'yozora',tpl:'ghost',pal:{a:'#ece6ff'},acc:[],hab:'any',time:'N',season:'*',weather:'*',rare:2,evo:'yurarin',
  desc:'よなかに あらわれる はずかしがりや。 ちょうちんの ひかりが すき。'},
 {id:'yurarin',name:'ゆらりん',type:'yozora',tpl:'ghost',pal:{a:'#c4acff'},acc:[['wings','wings','#e8dcff','#ffffff'],['star','head','#fff27a','#ffffff']],rare:0,
  desc:'ほしを ひとつ もちあるく。 さびしい よるに そっと よりそって くれる。'},
 {id:'sakuramochi',name:'さくらもち',type:'kaze',tpl:'puff',pal:{a:'#ffcfe0'},acc:[['flower','head','#ff8ab8','#fff27a']],hab:'flower',time:'MDE',season:'sp',weather:'*',rare:3,
  desc:'はるだけ あらわれる まぼろしの ぷちっこ。 ほのかに さくらの かおりが する。'},
 {id:'yukidarukko',name:'ゆきだるっこ',type:'mizu',tpl:'blob',pal:{a:'#ffffff',b:'#eaf2ff'},acc:[['hat','head','#5a7ab0','#3a5a90']],hab:'any',time:'*',season:'wi',weather:'*',rare:3,
  desc:'ゆきの きせつに どこからか やってくる。 あったかい へやは ちょっと にがて。'},
 {id:'hotarun',name:'ほたるん',type:'denki',tpl:'bug',pal:{a:'#5a5a7a',b:'#3a3a55',c:'#fff27a'},acc:[['star','side','#fff27a','#ffffff']],hab:'shore',time:'EN',season:'su',weather:'*',rare:3,
  desc:'なつの よる、みずべで おしりを ひからせる。 ひかりで おしゃべり するらしい。'},
 {id:'momijigitsune',name:'もみじぎつね',type:'hono',tpl:'cat',pal:{a:'#ec7a3a',b:'#fff2dc',c:'#ffd0b0'},acc:[['leaf','head','#e83a2a','#a82a1a']],hab:'tree',time:'MDE',season:'au',weather:'*',rare:3,
  desc:'あきの もりに すむ。 あたまの もみじは まいとし はえかわる。'},
 {id:'hoshinoko',name:'ほしのこ',type:'yozora',tpl:'puff',pal:{a:'#fff4b0'},acc:[['star','head','#ffd84a','#ffffff']],hab:'flower',time:'N',season:'*',weather:'clear',rare:4,
  desc:'ながれぼしの かけらから うまれたと いわれる。 はれた よるに だけ あえる。'},
 {id:'nijipiyo',name:'にじぴよ',type:'kaze',tpl:'bird',pal:{a:'#ffa8d8',b:'#b8f4ff',y:'#ffb050'},acc:[['crest','head','#ff6a6a','#6ab0ff']],hab:'tree',time:'MDE',season:'*',weather:'rain',rare:3,
  desc:'あめの ひに あらわれる なないろの ことり。 なきごえを きくと にじが でるとか。'},
 {id:'kaigaran',name:'かいがらん',type:'mizu',tpl:'mush',pal:{a:'#ffe0d0',c:'#ffb4a4'},acc:[],hab:'sand',time:'*',season:'*',weather:'*',rare:2,
  desc:'かいがらを ぼうしに している。 なみの おとを きくと おどりだす。'},
 {id:'asatsuyu',name:'あさつゆ',type:'kusa',tpl:'mush',pal:{a:'#e8ffd8',c:'#8adc7a'},acc:[['drop','side','#7ad0ff','#ffffff']],hab:'grass',time:'M',season:'*',weather:'*',rare:2,
  desc:'あさの ほんの すこしの じかんだけ かおを だす。 ひかりに すけて きれい。'},
 {id:'yuuyakedori',name:'ゆうやけドリ',type:'hono',tpl:'bird',pal:{a:'#ff8a62',b:'#ffd8a8',y:'#ffcf40'},acc:[['crest','head','#ff4a3a','#ffd040']],hab:'tree',time:'E',season:'*',weather:'*',rare:2,
  desc:'ゆうやけの そらを うつした はね。 ゆうがたに なると うたいだす。'},
 {id:'kinokoppe',name:'きのこっぺ',type:'kusa',tpl:'mush',pal:{a:'#fff2dc',c:'#ec544a'},acc:[],hab:'tree',time:'*',season:'*',weather:'rain',rare:2,
  desc:'あめの ひに きの ねもとで にょきっと はえる。 かさを ふると いい におい。'},
 {id:'pokapokasama',name:'ぽかぽかさま',type:'kaze',tpl:'puff',pal:{a:'#ffe88a'},acc:[['wings','wings','#ffffff','#fff6c0'],['crown','head','#ffc020','#ff6a8a']],hab:'plaza',time:'*',season:'*',weather:'*',rare:5,
  desc:'むらを みまもる でんせつの ぷちっこ。 なかまを たくさん つくると すがたを みせる。'},
];
const SP = {}; SPECIES.forEach((s,i)=>{s.no=i+1;SP[s.id]=s;});
SPECIES.forEach(s=>{ if(s.evo) SP[s.evo].from = s.id; });
const EVO_LV = 5, EVO_AFF = 12;

// ---------------- jobs (ぷちっこの しごと) ----------------
const JOBS = {
 till: {jp:'たがやす',   col:'#a8703a', desc:'じめんを たがやして はたけを つくる'},
 water:{jp:'みずやり',   col:'#3a9ad9', desc:'はたけの さくもつに みずを あげる'},
 chop: {jp:'きを きる',  col:'#5a8a3a', desc:'もりの きを きって もくざいを あつめる'},
 smash:{jp:'いわを わる',col:'#8a8aa0', desc:'いわを わって いしや てっこうせきを あつめる'},
 fire: {jp:'かまど',     col:'#f06a3a', desc:'さぎょうだいで りょうりが できる。 よるは あかりに なる'},
 wind: {jp:'ゆらす',     col:'#3cb8b0', desc:'きを ゆらすと くだものや たねが たくさん おちる'},
 seek: {jp:'さがしもの', col:'#8a6ad8', desc:'うまっている おたからの ばしょを みつける'},
};
const TYPE_JOB = {kusa:'till', mizu:'water', hono:'fire', denki:'smash', kaze:'wind', yozora:'seek'};
const JOB_OVERRIDE = {koron:'chop', korokabuto:'chop', momijigitsune:'chop', kinokoppe:'chop'};
function jobOf(id){ return JOB_OVERRIDE[id] || TYPE_JOB[SP[id].type]; }

// ---------------- items ----------------
const ITEMS = {
 cookie:{name:'ぷちクッキー',buy:30,sell:8,cat:'treat',desc:'ぷちっこの だいこうぶつ。 なかよしゲームで わくが ひろがる。'},
 feast:{name:'ごちそうクッキー',buy:180,sell:40,cat:'treat',desc:'とくべつな クッキー。 わくが とても ひろがる。'},
 apple:{name:'りんご',sell:30,cat:'fruit',col:'#ff4a4a',desc:'あまずっぱい むらの くだもの。 ぷちっこに あげると よろこぶ。'},
 peach:{name:'もも',sell:35,cat:'fruit',col:'#ffa0b0',desc:'やわらかくて いい かおり。 ぷちっこに あげると よろこぶ。'},
 orange:{name:'みかん',sell:30,cat:'fruit',col:'#ffa030',desc:'こたつで たべたい。 ぷちっこに あげると よろこぶ。'},
 pear:{name:'なし',sell:35,cat:'fruit',col:'#e8d860',desc:'みずみずしい。 ぷちっこに あげると よろこぶ。'},
 seed_sun:{name:'ひまわりのたね',buy:40,sell:10,cat:'seed',crop:'sunflower',hours:3,col:'#ffd030',desc:'3じかんで さく。 はたけに うえよう。'},
 seed_straw:{name:'いちごのたね',buy:90,sell:20,cat:'seed',crop:'strawberry',hours:6,yield:3,col:'#ff4a5a',desc:'6じかんで みのる。 3こ とれる。'},
 seed_pump:{name:'かぼちゃのたね',buy:160,sell:40,cat:'seed',crop:'pumpkin',hours:12,col:'#ff9a20',desc:'12じかんで みのる。 たかく うれる。'},
 sunflower:{name:'ひまわり',sell:140,cat:'crop',desc:'おひさまみたいな はな。'},
 strawberry:{name:'いちご',sell:70,cat:'crop',desc:'つやつやの いちご。'},
 pumpkin:{name:'かぼちゃ',sell:520,cat:'crop',desc:'ずっしり おおきい かぼちゃ。'},
 stone:{name:'いし',sell:15,cat:'mat',desc:'いわを わると でてくる。 クラフトに つかう。'},
 wood:{name:'もくざい',sell:12,cat:'mat',desc:'きを きって とれた もくざい。 クラフトに つかう。'},
 branch:{name:'えだ',sell:3,cat:'mat',desc:'きを ゆらすと ときどき おちてくる。 クラフトに つかう。'},
 iron:{name:'てっこうせき',sell:60,cat:'mat',desc:'いわを わると たまに でてくる。 じょうぶな ものが つくれる。'},
 clay:{name:'ねんど',sell:20,cat:'mat',desc:'はたけを たがやすと でてくる ことが ある。 やきものに つかう。'},
 yakiringo:{name:'やきりんご',sell:60,cat:'food',desc:'ぷちっこの だいこうぶつ。 あげると げんきが ぜんぶ もどる。'},
 soup:{name:'かぼちゃスープ',sell:300,cat:'food',desc:'ぽかぽか あったまる。 あげると げんきが ぜんぶ もどる。'},
 jam:{name:'いちごジャム',sell:220,cat:'food',desc:'あまくて とろとろ。 あげると げんきが ぜんぶ もどる。'},
 gem:{name:'きらきらいし',sell:260,cat:'mat',desc:'ひかりに かざすと にじいろ。'},
 shell_s:{name:'さくらがい',sell:45,cat:'mat',desc:'さくらいろの ちいさな かい。'},
 shell_l:{name:'まきがい',sell:120,cat:'mat',desc:'みみに あてると なみの おと。'},
 fossil:{name:'かせき',sell:480,cat:'mat',desc:'むかしの ぷちっこの ほね…？'},
 oldcoin:{name:'むかしのコイン',sell:300,cat:'mat',desc:'むらの むかしの おかね。'},
 starbit:{name:'ほしのかけら',sell:400,cat:'mat',desc:'ながれぼしが のこした かけら。'},
 egg:{name:'ぷちっこのたまご',cat:'egg',desc:'あたためると なにかが うまれそう…'},
 letterpaper:{name:'びんせん',sell:5,cat:'mat',desc:'かわいい びんせん。'},
};

const FURN = {
 bed:{name:'ベッド',price:900}, table:{name:'まるテーブル',price:450}, chair:{name:'いす',price:220},
 lamp:{name:'スタンドライト',price:380,light:true}, plant:{name:'かんようしょくぶつ',price:300}, rug:{name:'まるいラグ',price:350,walk:true,floor:true,w:3,h:2}, rug2:{name:'しかくい ラグ',price:620,walk:true,floor:true,w:4,h:3}, mat:{name:'ちいさな マット',price:180,walk:true,floor:true,w:2,h:1},
 shelf:{name:'ほんだな',price:650}, tv:{name:'テレビ',price:1200}, clock:{name:'はしらどけい',price:780},
 fishbowl:{name:'きんぎょばち',price:520}, kotatsu:{name:'こたつ',price:980,season:'au,wi'}, fan:{name:'せんぷうき',price:480,season:'sp,su'},
 piano:{name:'ピアノ',price:2400}, plush:{name:'ぷちっこぬいぐるみ',price:500}, radio:{name:'ラジオ',price:620},
 pumpkinlamp:{name:'かぼちゃランタン',price:600,season:'au',light:true}, snowman:{name:'ゆきだるま',price:400,season:'wi'},
 sakuravase:{name:'さくらのいけばな',price:520,season:'sp'},
 // gifts only
 cushion:{name:'てづくりクッション',price:0,gift:true,walk:true,floor:true,w:1,h:1}, momphoto:{name:'かぞくの しゃしん',price:0,gift:true},
 bearstatue:{name:'なぞの きぼりクマ',price:0,gift:true}, bigfish:{name:'ぎょたく',price:0,gift:true},
 globe:{name:'ちきゅうぎ',price:0,gift:true}, teaset:{name:'ティーセット',price:0,gift:true},
 bonsai:{name:'ぼんさい',price:0,gift:true}, music:{name:'オルゴール',price:0,gift:true},
 workbench:{name:'さぎょうだい',price:0,gift:true},
 // crafted
 stool:{name:'まるたの スツール',price:120,craft:true}, wchair:{name:'もくせいの いす',price:200,craft:true}, wtable:{name:'もくせいの テーブル',price:300,craft:true},
 woodbox:{name:'きの たからばこ',price:360,craft:true}, stonelamp:{name:'いしどうろう',price:320,craft:true,light:true}, stove:{name:'てつの ストーブ',price:600,craft:true,light:true},
 shelllamp:{name:'かいがらランプ',price:520,craft:true,light:true}, pot:{name:'すやきの つぼ',price:240,craft:true}, planter:{name:'はなの プランター',price:260,craft:true},
 fossilmodel:{name:'かせきの もけい',price:1200,craft:true}, starlamp:{name:'ほしの オブジェ',price:1400,craft:true,light:true},
};
for(const k in FURN){ ITEMS['f_'+k] = {name:FURN[k].name, sell:Math.floor((FURN[k].price||400)/4), cat:'furn', furn:k, desc:FURN[k].craft?'じぶんで つくった かぐ。 おうちの「もようがえ」で おこう。':'へやに かざれる かぐ。 おうちの「もようがえ」で おこう。'}; }

// ---------------- crafting recipes ----------------
const RECIPES = {
 stool:{out:'f_stool',need:{wood:3}},
 wchair:{out:'f_wchair',need:{wood:4,branch:2}},
 wtable:{out:'f_wtable',need:{wood:6}},
 stonelamp:{out:'f_stonelamp',need:{stone:5,branch:1}},
 woodbox:{out:'f_woodbox',need:{wood:5,iron:1}},
 stove:{out:'f_stove',need:{iron:4,stone:3}},
 pot:{out:'f_pot',need:{clay:4},fire:true},
 planter:{out:'f_planter',need:{clay:3,wood:2,seed_sun:1}},
 shelllamp:{out:'f_shelllamp',need:{shell_s:3,shell_l:1}},
 fossilmodel:{out:'f_fossilmodel',need:{fossil:1,wood:3}},
 starlamp:{out:'f_starlamp',need:{starbit:2,iron:2}},
 cookie:{out:'cookie',n:3,need:{apple:1,orange:1},fire:true},
 yakiringo:{out:'yakiringo',n:2,need:{apple:2,branch:2},fire:true},
 jam:{out:'jam',need:{strawberry:3},fire:true},
 soup:{out:'soup',n:2,need:{pumpkin:1},fire:true},
};
const START_RECIPES = ['stool','wchair','wtable'];

// ---------------- story (そんちょうの おねがい) ----------------
const STORY = [
 {goal:'till', n:3, hint:'もっぷるに たのんで、 いえの みぎの さくの なかを 3マス たがやそう。（したの「しごと」ボタンで「たがやす」を えらんで じめんを タップ）',
  report:['まぁ、 りっぱな はたけが できたわね！','おいわいに ひまわりの たねを あげる。 あとで うえてみてね。',
   '…ところで、 さっき かわの ほうから しくしく ないている こえが きこえたの。','みずべに いる こを みてきて くれないかしら？'], reward:{items:{seed_sun:3}}, spawn:'shizukun'},
 {goal:'befriend', sp:'shizukun', n:1, hint:'ひだりの はしの ちかく、 かわの そばで ないている ぷちっこを さがそう。',
  report:['しずくんと なかよしに なったのね！ よかった…','しずくんは みずやりが とくいなの。 たねを うえて、 みずを あげてもらいましょう。'], reward:{items:{cookie:3}}},
 {goal:'water', n:3, hint:'はたけに たねを うえて、 しずくんに みずやりを たのもう。（はたけを タップ）',
  report:['ちゃんと みずを あげられたわね。 さくもつは まいにち みずを あげると そだつのよ。 あめの ひは おやすみ。',
   '…それと、 きたの もりで コンコン きを たたく おとが するって うわさなの。','もりの ほうへ いってみてくれる？'], reward:{items:{seed_straw:2}}, spawn:'koron'},
 {goal:'befriend', sp:'koron', n:1, hint:'きたの もりの ちかくで、 コンコン きを たたいている ぷちっこを さがそう。',
  report:['ころんは きを きるのが とくいなの。','もくざいが あれば いろんな ものが つくれるわ。 5こ あつめて きてくれる？'], reward:{items:{cookie:2}}},
 {goal:'wood', n:5, hint:'「しごと」ボタンで「きを きる」を えらんで、 もりの きを タップ。 もくざいを 5こ あつめよう。',
  report:['まぁ、 こんなに！ ありがとう。','おうちに『さぎょうだい』を おいておいたわ。 もくざいで かぐが つくれるのよ。','つくりかたも いくつか おしえておくわね。 なにか ひとつ つくってみて。'],
  reward:{workbench:true, recipes:['stool','wchair','wtable']}},
 {goal:'craft', n:1, hint:'いえの なかの さぎょうだいを タップして、 なにか ひとつ つくってみよう。',
  report:['じょうずに できたわね！ あなた、 てさきが きようね。',
   '…そうそう。 ひがしの いわの あたりで ぱちぱち ひかる こを みたって ひとが いるの。','いってみてくれる？'], reward:{coins:300}, spawn:'pachipiyo'},
 {goal:'befriend', sp:'pachipiyo', n:1, hint:'ひがしの いわの ちかくで、 ぱちぱち ひかっている ぷちっこを さがそう。',
  report:['ぱちぴよは いわを わるのが とくい。 いしや てっこうせきが とれるのよ。',
   'いっしょに あるけるのは 3びきまで。 ほかの こは あなたの いえの ひだりの『ぷちっこごや』で やすんでいるわ。','こやで いれかえて、 いわを 3かい わってみてね。'], reward:{items:{cookie:2}}},
 {goal:'smash', n:3, hint:'ぷちっこごやで ぱちぴよを つれていき、 いわを 3かい わってもらおう。',
  report:['これで ひととおり できるように なったわね。 ほんとうに たすかったわ。',
   'いしどうろうと やきりんごの つくりかたも おしえておくわね。 やきりんごは ほのおの ぷちっこが いないと やけないけど…',
   'これからは むらに いろんな ぷちっこが やってくるわ。 しんぶんの『きょうの うわさ』を みてね。',
   'ぷちっこは しごとを すると つよく なって、 なかよく なると しんかする ことも あるの。 これからも よろしくね。'],
  reward:{coins:1000, recipes:['stonelamp','yakiringo']}},
];
const STORY_DONE = STORY.length;

// ---------------- villagers ----------------
const VILLAGERS = [
 {id:'bear',name:'パンじろう',house:'h_bear',home:[13,7],hours:[6,21],pitch:170,col:'#c8823a',likes:['apple','pear','strawberry'],
  lines:{
   M:['おはよう、{name}！ やきたての パンの においが するだろう？','あさの くうきは おいしいねぇ。 きょうも いい いちにちに しよう。'],
   D:['やあ {name}！ おひるは もう たべたかい？','いい てんきだねぇ。 パンが ふっくら やけるよ。'],
   E:['ゆうやけが きれいだねぇ。 あしたの パンの したじゅんびを しなくちゃ。','おつかれさま、{name}。 きょうは どんな いちにち だった？'],
   N:['おや、まだ おきてたのかい？ よふかしは ほどほどにね。'],
   chat:['{partner}は げんきそうだねぇ。 いい あいぼうだ。','パンは ねかせる じかんが だいじなんだ。 ひとも おなじかもねぇ。 ゆっくり やすむんだよ。',
     'むらの きに なる くだもの、 パンに いれると おいしいんだよ。','ひろばの けいじばんは みたかい？ まいにち おねがいごとが かわるんだ。',
     'もりの くさむらは、よるに なると ちがう ぷちっこが でるらしいよ。','いえの ポストは みてるかい？ てがみが とどいてるかもしれないよ。'],
   rain:['あめの ひは パンの きじが しっとりするんだ。','かさを わすれないようにね！ かぜ ひいたら たいへんだ。'],
   snow:['ゆきだ ゆきだ！ あったかい スープパンが おいしい きせつだねぇ。'],
   love:['{name}が むらに きてくれて ほんとうに よかったよ。','きみの ために とっておきの レシピを かんがえてるんだ。'],
   req:'{name}、 ちょっと たのみが あるんだ。 {item}を ひとつ わけて もらえないかい？',
   thanks:'うわぁ、ありがとう！ これは おれいだよ。'}},
 {id:'peng',name:'ナナ',house:'h_peng',home:[20,7],hours:[7,22],pitch:520,col:'#5a7ae0',likes:['orange','shell_s','sunflower'],
  lines:{
   M:['おっはよー！ {name}！ あさから はしると きもちいいよっ！'],
   D:['ねぇねぇ {name}、 きょうは なにして あそぶ？','おひさま ぽかぽか〜！ おさんぽ びより だねっ！'],
   E:['ゆうがたの うみって キラキラしてて すきなんだ！'],
   N:['ふぁ〜… もう ねむくなってきちゃった…','よるの むらって しずかで ドキドキするね！'],
   chat:['すなはまで ぽかぽかの トカゲ みたいな こを みたよっ！','わたし、さむいの へっちゃら なんだ！ かぜのこ だからね！','{partner}と かけっこ したいなー！',
     'かいがらを あつめるのが マイブームなの！','ぷちっこずかん、ぜんぶ うめたら すごいよね！','つかれたら ちゃんと やすむんだよ！ わたしも おひるねは かかさないもん！'],
   rain:['あめ だいすき！ みずたまり ジャンプ しよっ！'],
   snow:['ゆき〜！！ ゆきがっせん しようよっ！'],
   love:['{name}は わたしの いちばんの ともだち だよっ！','ずっと この むらに いてね！ やくそくだよっ！'],
   req:'あっ {name}！ おねがい！ {item}を もってたら ひとつ ちょうだいっ！',
   thanks:'やったー！ ありがとっ！ おかえしに これあげる！'}},
 {id:'frog',name:'ゲンじい',house:'h_frog',home:[5,28],hours:[10,26],pitch:240,col:'#5ab05a',likes:['shell_l','stone','peach'],
  lines:{
   M:['…ふぁ。 あさは にがてだなぁ…'],
   D:['よぉ、{name}。 のんびり いこうや。','ひるねに ちょうどいい てんきだなぁ。'],
   E:['ゆうがたの かわは いい かんじだなぁ。'],
   N:['よるの かわは しずかで すきなんだ。','ほしが きれいだなぁ。 たまには みあげて みなよ。'],
   chat:['かわの なかに ぴちぴち はねる ぷちっこが いるんだ。 きしから そっと ちかづくのが コツだぜ。','あせらない、あせらない。 なかよしは タイミングが だいじなんだよなぁ。',
     'いしを たたくと たまに きらきら ひかる いしが でるんだぜ。','まいにち ちょっとずつで いいんだよ。 むらは にげないからなぁ。','{partner}、 いい かおしてるなぁ。'],
   rain:['あめは いいなぁ… さかなが よく つれるんだ。'],
   snow:['さむい… こしに くるなぁ… こたつで みかんが いちばんだ。'],
   love:['おまえと はなすと なんだか おちつくなぁ。','…また あした、 はなしに こいよな。'],
   req:'なぁ {name}… {item}って もってるか？ ひとつ くれたら うれしいなぁ。',
   thanks:'おぉ… ありがとな。 これ、 とっときなよ。'}},
 {id:'sheep',name:'メリーさん',house:'h_sheep',home:[28,28],hours:[8,23],pitch:400,col:'#e88ab8',likes:['peach','gem','sunflower'],
  lines:{
   M:['ごきげんよう、{name}さん。 あさの こうちゃは いかが？'],
   D:['あら {name}さん。 きょうも すてきな いちにちに なりそうですわ。'],
   E:['ゆうひに てらされた おはなばたけ… うっとりしますわ。'],
   N:['こんな じかんに おさんぽ？ ほしが きれいですものね。','よふかしは おはだに よくなくてよ。 ふふ。'],
   chat:['おはなばたけには ふわふわした ぷちっこが あそびに くるのですって。','わたくしの あみものは ぷちっこたちにも だいにんきですのよ。',
     'おうちの もようがえは しまして？ ミケさんの おみせで すてきな かぐが かえますわ。','はるには さくらいろの まぼろしの ぷちっこが あらわれるとか…','{partner}ちゃん、 けなみが つやつやですわね。'],
   rain:['あめの ひは かみが まとまらなくて たいへんですの…'],
   snow:['ゆきげしきは まるで レースの ようですわ。 うっとり…'],
   love:['{name}さんとの おしゃべりが いちにちの たのしみですわ。','あなたが いると むらが あかるく なりますわね。'],
   req:'{name}さん、 よろしければ {item}を ひとつ いただけないかしら？',
   thanks:'まぁ、うれしい！ ありがとう。 ささやかですけれど おれいですわ。'}},
 {id:'chief',name:'ハルさん',title:'そんちょう ハルさん',chief:true,house:'hall',home:[25,14],hours:[0,24],pitch:330,col:'#a86ad8',likes:[],
  lines:{
   M:['おはよう、{name}さん。 あさの ひかりは きもちいいわね。','おはよう。 ぷちっこたちも もう おきているわよ。'],
   D:['こんにちは、{name}さん。 むらの くらしには なれてきた？','いい てんきね。 はたけしごと びよりだわ。'],
   E:['ゆうやけが きれいね。 きょうも いちにち おつかれさま。'],
   N:['あら、{name}さん。 よるの むらも しずかで いいでしょう？','ねむれない よるは、 ほしを かぞえると いいのよ。'],
   chat:['ぷちっこは しごとを すると すこしずつ つかれるの。 くだものを あげると げんきが もどるわ。','なかよしに なった ぷちっこは スカーフを まいているでしょう？ あなたの なかまの しるしよ。',
    'ぷちっこの しゅるいに よって、 とくいな しごとが ちがうの。 いろんな こと なかよく なってね。','むらの ひとたちと なかよく なると、 ものの つくりかたを おしえてもらえる ことも あるのよ。',
    '{partner}は ほんとうに はたらきもの ね。','いそがない、 いそがない。 むらは にげないわ。'],
   rain:['あめの ひは はたけの みずやりは おやすみね。'],
   snow:['ゆきの ひは あったかく してね。'],
   love:['あなたが きてから むらが あかるく なったわ。'],
   req:'',thanks:''}},
];
const VIL_RECIPES = {bear:['jam','soup','cookie'], peng:['shelllamp','planter','woodbox'], frog:['pot','stove','fossilmodel'], sheep:['starlamp','woodbox','planter']};
const VIL = {}; VILLAGERS.forEach(v=>VIL[v.id]=v);

// villager sprites (16x16)
const VSPR = {
 bear:{pal:{w:'#ffffff',h:'#7a4a2a',s:'#ffd9b8',e:'#2a2238',c:'#ff9bb0',r:'#e8904a',a:'#fff8ec',b:'#6a5a4a',k:'#5a3a2a'},rows:[
  "....wwwwwwww....","...wwwwwwwwww...","...wwwwwwwwww...","....wwwwwwww....","...hhsssssshh...","...hssssssssh...",
  "...ssessssess...","...ssessssess...","...sshhhhhhss...","....ssssssss....","....rraaaarr....","...srraaaarrs...",
  "...srraaaarrs...","....bbbbbbbb....","....bb....bb....","....kk....kk...."]},
 peng:{pal:{h:'#3a3a5a',s:'#ffd9b8',e:'#2a2238',c:'#ff9bb0',d:'#ff5a6a',r:'#5ab0f0',k:'#e86a4a'},rows:[
  "................",".....hhhhhh.....","....hhhhhhhh....","...hhhhhhhhhh...","..hhhsssssshhh..",".hhhsssssssshhh.",
  ".hhssessssesshh.",".hhssessssesshh.",".hhscsssssscshh.",".h..ssssssss..h.","....dddddddd....","...srrrrrrrrs...",
  "...srrrrrrrrs...","...rrrrrrrrrr...","....ss....ss....","....kk....kk...."]},
 frog:{pal:{c:'#c8b070',h:'#c8c8d0',s:'#f0c8a0',e:'#2a2238',g:'#e8e8f0',v:'#5a8a5a',r:'#f4f0e0',b:'#5a6a8a',k:'#4a3a2a'},rows:[
  "................","....cccccccc....","...cccccccccc...","..cccccccccccc..","...hssssssssh...","...ssssssssss...",
  "...seessssees...","...ssssssssss...","...sggggggggs...","....gggggggg....","....vvvvvvvv....","...svvrrrrvvs...",
  "...svvrrrrvvs...","....bbbbbbbb....","....bb....bb....","....kk....kk...."]},
 sheep:{pal:{h:'#f0c860',c:'#ff7aa8',s:'#ffe0c8',e:'#2a2238',p:'#ff9bb0',r:'#b8a0e8',k:'#7a5a8a'},rows:[
  "................",".....hhhhhh..cc.","....hhhhhhhhccc.","...hhhhhhhhhhc..","...hhsssssshh...","..hhsssssssshh..",
  "..hssessssessh..","..hssessssessh..","..hspsssssspsh..","..hhsssssssshh..","..hhrrrrrrrrhh..","..hsrrrrrrrrsh..",
  "...srrrrrrrrs...","..rrrrrrrrrrrr..","..rrrrrrrrrrrr..","....kk....kk...."]},
 shop:{pal:{h:'#a8502a',s:'#ffd9b8',e:'#2a2238',c:'#ff9bb0',m:'#c85a6a',d:'#5cae6a',w:'#ffffff',b:'#5a4a6a',k:'#4a3a2a'},rows:[
  "......hhhh......",".....hhhhhh.....","....hhhhhhhh....","...hhhhhhhhhh...","...hhsssssshh...","...hssssssssh...",
  "...ssessssess...","...ssessssess...","...scssmmsscs...","....ssssssss....","....dddddddd....","...sdddwwddds...",
  "...sdddddddds...","....bbbbbbbb....","....bb....bb....","....kk....kk...."]},
};
VSPR.chief={pal:{h:'#ececf4',s:'#ffd9b8',e:'#2a2238',g:'#8a5a3a',c:'#ff9bb0',r:'#a86ad8',a:'#fff3dc',b:'#5a4a7a',k:'#4a3a2a'},rows:[
  "......hhhh......",".....hhhhhh.....","....hhhhhhhh....","...hhhhhhhhhh...","...hhsssssshh...","...hssssssssh...",
  "...sgggssgggs...","...sgegssgegs...","...scsssssscs...","....ssssssss....","...rrrraarrrr...","...srrraarrrs...",
  "...srrraarrrs...","...bbbbbbbbbb...","....bb....bb....","....kk....kk...."]};
const SHOPKEEPER = {name:'ミケさん', pitch:560};

// player parts
const PLAYER_HEAD = {
 down:["................",".....hhhhhh.....","....hhhhhhhh....","...hhhhhhhhhh...","...hhsssssshh...","...hssssssssh...","...ssessssess...","...ssessssess...","...scsssssscs...","....ssssssss...."],
 up:["................",".....hhhhhh.....","....hhhhhhhh....","...hhhhhhhhhh...","...hhhhhhhhhh...","...hhhhhhhhhh...","...hhhhhhhhhh...","...hhhhhhhhhh...","...shhhhhhhhs...","....ssssssss...."],
 side:["................",".....hhhhhh.....","....hhhhhhhh....","...hhhhhhhhhh...","...hhhhhhhsss...","...hhhhhsssss...","...hhhhhssess...","...hhhhhssess...","...hhhhsssscs...","....hhhsssss...."],
};
const PLAYER_BODY = {
 front:["....rrrrrrrr....","...srrrrrrrrs...","...srrrrrrrrs...","....bbbbbbbb...."],
 side:["....rrrrrrrr....","....rrrrrrrr....","....rrrsrrrr....","....bbbbbbbb...."],
};
const PLAYER_LEGS = {
 front:[["....bb....bb....","....kk....kk...."],["....kk....bb....","..........kk...."],["....bb....kk....","....kk.........."]],
 side:[[".....bb..bb.....",".....kk..kk....."],["....bb....bb....","...kk......kk..."],["......bbbb......","......kkkk......"]],
};
const SHIRTS = ['#ff6a7a','#ffa040','#5cbf5a','#4a9ae8','#a87ae8','#ffd040','#ff8ac8','#f4f4f4'];
const HAIRS = ['#5a3a2a','#2a2238','#c8823a','#e8c060','#d85a3a','#8a6ad8'];

// ---------------- quests ----------------
const QUEST_POOL = [
 {k:'till',t:'はたけを {n}マス たがやす',n:[2,4],r:120,job:'till'},
 {k:'water',t:'さくもつに {n}かい みずを あげる',n:[2,3],r:120,job:'water'},
 {k:'chop',t:'もくざいを {n}こ あつめる',n:[3,5],r:130,job:'chop'},
 {k:'smash',t:'いわを {n}かい わる',n:[2,3],r:130,job:'smash'},
 {k:'craft',t:'さぎょうだいで {n}かい ものを つくる',n:[1,2],r:150,story:5},
 {k:'shake',t:'きを {n}かい ゆらす',n:[2,3],r:110},
 {k:'talk',t:'むらの ひとと {n}にん はなす',n:[2,3],r:120},
 {k:'sell',t:'アイテムを {n}こ うる',n:[3,5],r:140},
 {k:'dig',t:'ひかる じめんを {n}かしょ ほる',n:[1,2],r:150},
 {k:'pet',t:'なかまを {n}かい なでる',n:[2,3],r:110},
 {k:'feed',t:'ぷちっこに {n}かい ごはんを あげる',n:[1,2],r:110},
 {k:'shell',t:'かいがらを {n}こ ひろう',n:[1,2],r:120},
 {k:'steps',t:'{n}ほ さんぽする',n:[300,400],r:100},
 {k:'plant',t:'はたけに たねを {n}こ うえる',n:[1,2],r:120,story:2},
 {k:'catch',t:'ぷちっこと {n}かい なかよくなる',n:[1,1],r:200,story:8},
];
const STAMP_REWARDS = [
 {t:'ぷちクッキー ×3',items:{cookie:3}},{t:'200 ポカ',coins:200},{t:'ひまわりのたね ×2',items:{seed_sun:2}},
 {t:'ぷちクッキー ×5',items:{cookie:5}},{t:'500 ポカ',coins:500},{t:'ごちそうクッキー',items:{feast:1}},{t:'ぷちっこのたまご',items:{egg:1}},
];

// ---------------- letters ----------------
// mom: caring letters, anyone who plays gets them
const MOM_LETTERS = [
 {t:'{name}へ\n\nあたらしい むらでの くらしは どう？ ごはんは ちゃんと たべてる？\nおかあさんは あなたが げんきなら それで いいの。\nむりは しないでね。\n\nははより', gift:'cookie', n:3},
 {t:'{name}へ\n\nこのまえ そらを みていたら、 あなたの ちいさい ころを おもいだしたよ。\nいつも ねぼすけさん だったね。 いまも かしら？ ふふ。\nゆっくり ねむれていると いいな。\n\nははより'},
 {t:'{name}へ\n\nさむく なってきたから、 からだを ひやさないようにね。\nクッションを つくったから おくります。\nすわって ほっと ひといき ついてね。\n\nははより', gift:'f_cushion', n:1},
 {t:'{name}へ\n\nがんばりやさんの あなたの ことだから、 ついつい むりして いないか しんぱいです。\nなにも しない ひが あっても いいんだよ。\nそれも だいじな いちにち だからね。\n\nははより'},
 {t:'{name}へ\n\nとなりの おばあちゃんから くだものを たくさん いただいたので、 おすそわけ です。\nむらの おともだちにも わけてあげてね。\n\nははより', gift:'peach', n:3},
 {t:'{name}へ\n\nおとうさんが また へんな ものを おくったみたいで ごめんね。\nあれでも あなたの ことを いちばん きにかけて いるのよ。\nないしょね。\n\nははより'},
 {t:'{name}へ\n\nあなたの すきな おかしを みつけたので いれておきます。\nいっぺんに たべすぎないようにね。\n\nははより', gift:'feast', n:1},
 {t:'{name}へ\n\nこのあいだ アルバムを ひらいたら なつかしくて、 ついつい いちにち ながめちゃった。\n1まい おくるね。 かざってくれたら うれしいな。\n\nははより', gift:'f_momphoto', n:1},
 {t:'{name}へ\n\nげんき？ おかあさんは げんきです。\nあなたが わらっていると、 とおくに いても わかる きがするの。\nきょうも いい いちにちに なりますように。\n\nははより'},
 {t:'{name}へ\n\nあめの ひは なんだか きもちも しずみがちよね。\nそういう ひは あったかい のみものを のんで、 すきな ことを してね。\n\nははより', gift:'cookie', n:2},
 {t:'{name}へ\n\nたまには こえを きかせてね。\nでも いそがしかったら へんじは いらないよ。\nおかあさんは いつでも あなたの みかたです。\n\nははより'},
 {t:'{name}へ\n\nおこづかいを すこし いれておきます。\nじぶんの ために つかってね。 がまんは しないこと！\n\nははより', coins:500},
 {t:'{name}へ\n\nよる ちゃんと ねてる？ スマホを みすぎないようにね。\n…と いいながら、 おかあさんも ついつい よふかし しちゃうの。 おたがいさまね。\n\nははより'},
 {t:'{name}へ\n\nあなたが うまれた ひの ことは いまでも よく おぼえているよ。\nちいさな てで ぎゅっと ゆびを にぎってくれたの。\nあの ひから ずっと、 あなたは おかあさんの たからものです。\n\nははより'},
 {t:'{name}へ\n\nはたけを はじめたって きいたよ。 なにを そだててるの？\nたねを すこし おくります。 さくのが たのしみだね。\n\nははより', gift:'seed_straw', n:2},
 {t:'{name}へ\n\nむかし いっしょに つくった クッキー、 おぼえてる？\nつくりかたを かいて おくるね。 りんごと みかんで できるのよ。\nやくときは ひの ようじんを わすれずに。\n\nははより', recipe:'cookie'},
 {t:'{name}へ\n\nなにか つらい ことが あったら、 いつでも かえっておいで。\nあなたの へやは そのままに してあるからね。\n\nははより'},
];
// mom: special letters for situations (key -> letter)
const MOM_SPECIAL = {
 first:{t:'{name}へ\n\nぶじに むらに ついたかしら？\nあたらしい ばしょは ドキドキするけど、 あなたなら だいじょうぶ。\nおまもりがわりに クッキーを いれておくね。\nこまったら むらの みなさんに たよるのよ。\n\nははより', gift:'cookie', n:5},
 latenight:{t:'{name}へ\n\nきのうは おそくまで おきていたみたいね？\nなんで わかるかって？ おかあさんだからです。\nきょうは はやく ねてね。\n\nははより'},
 rain:{t:'{name}へ\n\nそっちは あめ？ かさは もってる？\nあめの おとを ききながら ゆっくり するのも わるくないよね。\n\nははより', gift:'cookie', n:2},
 snow:{t:'{name}へ\n\nゆきが ふったって？ あったかく してね。\nてぶくろ わすれないように！\n\nははより', gift:'f_kotatsu', n:1},
 firstcatch:{t:'{name}へ\n\nぷちっこと なかよく なったんだってね！\nあなたは むかしから どうぶつに すかれる こ だったもの。\nたいせつに してあげてね。\n\nははより', gift:'apple', n:3},
 comeback:{t:'{name}へ\n\nしばらく ぶりね。 いそがしかった？\nげんきなら それで いいの。 おかえりなさい。\n\nははより', gift:'feast', n:1},
};
// dad: irregular odd gifts with short notes
const DAD_GIFTS = [
 {t:'{name}へ\n\nつりに いった。 でかいのが つれた。 やる。\n\nちちより', gift:'f_bigfish'},
 {t:'{name}へ\n\nりょこうさきで みつけた。 なんか にてた。\n\nちちより', gift:'f_bearstatue'},
 {t:'{name}へ\n\nかあさんには ないしょだ。\n\nちちより', coins:1000},
 {t:'{name}へ\n\nせかいは ひろいぞ。\n\nちちより', gift:'f_globe'},
 {t:'{name}へ\n\nいしを みつけた。 いい いしだ。\n\nちちより', gift:'gem', n:1},
 {t:'{name}へ\n\nぼんさいを はじめた。 ふたつ かったら ひとつ あまった。\n\nちちより', gift:'f_bonsai'},
 {t:'{name}へ\n\nかぼちゃが とれすぎた。\n\nちちより', gift:'pumpkin', n:2},
 {t:'{name}へ\n\nげんきか。 おれは げんきだ。\n\nちちより', gift:'oldcoin', n:1},
 {t:'{name}へ\n\nむかし おまえが すきだった きょく。 たぶん。\n\nちちより', gift:'f_music'},
 {t:'{name}へ\n\nかあさんが こうちゃに ハマっている。 おすそわけ。\n\nちちより', gift:'f_teaset'},
 {t:'{name}へ\n\nあまいものは つかれに きく らしい。\n\nちちより', gift:'feast', n:2},
 {t:'{name}へ\n\nかいがらを ひろった。 うみは いいぞ。\n\nちちより', gift:'shell_l', n:2},
 {t:'{name}へ\n\nはこを つくった。 つくりかたを かいた。 よめるか。\n\nちちより', recipe:'woodbox'},
 {t:'{name}へ\n\nてつは いい。 じょうぶだ。\n\nちちより', gift:'iron', n:3},
];

// ---------------- music ----------------
const MUSIC = {
 morning:{bpm:104,lead:'p25',lv:0.13,bass:'bounce',arp:'up',drums:'light',swing:0,
  chords:['C','G','Am','Em','F','C','Dm','G','F','G','Em','Am','Dm','G','C','C'],
  notes:'E5 . G5 E5 C6 - G5 - | D5 . G5 D5 B5 - G5 - | C5 . E5 A5 G5 - E5 - | B4 . E5 G5 B5 - - . | A5 - G5 F5 E5 - F5 - | G5 - E5 C5 E5 - G5 - | F5 - E5 D5 A5 - F5 - | G5 - - - D5 . B4 . | C6 - A5 - F5 - A5 - | B5 - G5 - D5 - G5 - | G5 - E5 - B4 - E5 G5 | A5 - - - E5 - C5 - | D5 F5 A5 - F5 - D5 - | B4 D5 G5 - F5 - D5 - | E5 - G5 - C6 - E6 - | C6 - - - . . . .'},
 day:{bpm:122,lead:'p25',lv:0.13,bass:'walk',arp:'up',drums:'pop',swing:0.12,
  chords:['F','Dm','Bb','C','F','Dm','Gm','C','Bb','C','Am','Dm','Gm','C','F','F'],
  notes:'F5 . A5 . C6 . A5 F5 | D5 . F5 . A5 . F5 D5 | D5 F5 Bb5 - A5 - G5 - | E5 - G5 - C6 - - . | A5 . A5 C6 A5 . F5 . | F5 . F5 A5 F5 . D5 . | G5 A5 Bb5 - D6 - Bb5 - | C6 - Bb5 - A5 - G5 - | D6 - C6 Bb5 F5 - Bb5 - | E6 - D6 C6 G5 - C6 - | C6 - A5 E5 A5 - C6 - | D6 - A5 F5 D5 - F5 - | Bb5 - A5 G5 D5 - G5 - | C6 - Bb5 A5 G5 - E5 - | F5 A5 C6 A5 F6 - C6 - | F5 - - - . . . .'},
 evening:{bpm:86,lead:'p25',lv:0.12,bass:'half',arp:'down',drums:'soft',swing:0,
  chords:['Am','F','C','G','Am','F','Dm','E','F','G','Em','Am','Dm','G','C','E'],
  notes:'E5 - - C5 E5 - A5 - | A5 - - G5 F5 - C5 - | G5 - - E5 G5 - C6 - | B5 - A5 - G5 - D5 - | C6 - - B5 A5 - E5 - | F5 - A5 - C6 - A5 - | F5 - E5 - D5 - A4 - | G#5 - - - B5 - E5 - | A5 - C6 - F5 - A5 - | B5 - D6 - G5 - B5 - | B5 - G5 - E5 - G5 - | A5 - E5 - C5 - E5 - | F5 - A5 - D6 - C6 - | B5 - G5 - D5 - F5 - | E5 - G5 - C6 - - - | B5 - G#5 - E5 - - -'},
 night:{bpm:68,lead:'sine',lv:0.16,bass:'long',arp:'broken',drums:'none',swing:0,echo:true,vib:true,
  chords:['C','Am','F','G','C','Em','F','G'],
  notes:'E5 - - - G5 - - - | C5 - - - E5 - A5 - | A5 - - - G5 - F5 - | D5 - - - - - . . | E5 - G5 - C6 - - - | B5 - G5 - E5 - - - | A5 - C6 - F5 - A5 - | G5 - - - - - . .'},
 house:{bpm:96,lead:'p25',lv:0.12,bass:'bounce',arp:'up',drums:'soft',swing:0.14,
  chords:['G','Em','C','D','G','Em','Am','D'],
  notes:'B4 . D5 . G5 - D5 . | E5 . G5 . B5 - G5 . | E5 - C5 - G5 - E5 - | F#5 - A5 - D5 - - . | B5 - A5 G5 D5 - G5 - | G5 - F#5 E5 B4 - E5 - | C5 E5 A5 - G5 - E5 - | F#5 - - - D5 - - .'},
 shop:{bpm:134,lead:'p50',lv:0.07,bass:'walk',arp:'none',drums:'pop',swing:0.18,
  chords:['C','Am','Dm','G','C','Am','Dm','G'],
  notes:'C5 E5 G5 E5 C6 . G5 . | A5 . E5 . C5 . E5 . | F5 A5 D6 A5 F5 . D5 . | G5 . B5 . D6 - B5 . | C6 . G5 . E5 G5 C6 . | A5 . C6 . E5 . A5 . | D5 F5 A5 F5 D6 . A5 . | G5 . F5 . D5 . B4 .'},
 catch:{bpm:150,lead:'p25',lv:0.12,bass:'eighth',arp:'up',drums:'pop',swing:0,
  chords:['Am','F','G','E'],
  notes:'A5 . E5 . A5 C6 B5 A5 | F5 . C5 . F5 A5 G5 F5 | G5 . D5 . G5 B5 A5 G5 | E5 G#5 B5 G#5 E6 - - .'},
 radio:{bpm:112,lead:'tri',lv:0.2,bass:'walk',arp:'broken',drums:'light',swing:0.2,
  chords:['F','Am','Bb','C','Dm','Am','Bb','C'],
  notes:'A5 - C6 - A5 G5 F5 - | E5 - G5 - E5 - C5 - | D5 - F5 - Bb5 - A5 G5 | G5 - - - . . E5 F5 | F5 - A5 - D6 - C6 - | C6 - A5 - E5 - . . | D5 F5 Bb5 - A5 - G5 - | F5 - - - . . . .'},
};
const JINGLES = {
 fanfare:[['C5',1],['E5',1],['G5',1],['C6',1],['G5',1],['C6',1],['E6',6]],
 evolve:[['C5',1],['D5',1],['E5',1],['G5',1],['A5',1],['C6',1],['D6',1],['E6',1],['G6',6]],
 newday:[['C5',1],['G5',1],['E6',2],['C6',4]],
 chime:[['E6',3],['C6',3],['D6',3],['G5',6]],
 piano:[['C5',2],['E5',2],['G5',2],['E5',2],['F5',2],['A5',2],['G5',4]],
 mail:[['G5',1],['C6',1],['E6',3]],
};

// ---------------- world map ----------------
const MAP_W = 36, MAP_H = 46;
const BUILDINGS = [
 {id:'home', kind:'home', x:14,y:25,w:5,h:3, door:[16,27], roof:'#e8605a', wall:'#fff3dc'},
 {id:'shop', kind:'shop', x:15,y:10,w:5,h:3, door:[17,12], roof:'#4ab0c8', wall:'#fff3dc'},
 {id:'h_bear', kind:'vhouse', vil:'bear', x:12,y:3,w:4,h:3, door:[13,5], roof:'#c8823a', wall:'#f8e4c0'},
 {id:'h_peng', kind:'vhouse', vil:'peng', x:19,y:3,w:4,h:3, door:[20,5], roof:'#5a7ae0', wall:'#eef4ff'},
 {id:'h_frog', kind:'vhouse', vil:'frog', x:4,y:24,w:4,h:3, door:[5,26], roof:'#5ab05a', wall:'#f4f0d8'},
 {id:'h_sheep', kind:'vhouse', vil:'sheep', x:27,y:24,w:4,h:3, door:[28,26], roof:'#e88ab8', wall:'#fff4f8'},
 {id:'hall', kind:'vhouse', vil:'chief', x:23,y:10,w:5,h:3, door:[25,12], roof:'#8a6ad8', wall:'#fff3dc'},
];
const FRUIT_TREES = [[7,11,'apple'],[28,11,'peach'],[20,19,'pear'],[12,31,'orange'],[23,32,'apple'],[31,31,'peach'],[8,7,'orange']];
const ROCKS = [[2,13],[33,12],[7,37],[29,37]];
const LAMPS = [[5,10],[30,10],[5,15],[30,15],[13,29],[19,29]];
const GARDEN = [20,25,22,26];
const HUT = [11,25];
const MAILBOX = [12,27];
const BOARD = [22,13];
const FOUNTAIN = [10,12];

function buildWorld(){
 const W=MAP_W,H=MAP_H; const t=[]; for(let y=0;y<H;y++) t.push(new Array(W).fill('.'));
 const R=mkRng(20261104);
 const set=(x,y,c)=>{ if(x>=0&&y>=0&&x<W&&y<H) t[y][x]=c; };
 const get=(x,y)=> (x>=0&&y>=0&&x<W&&y<H)?t[y][x]:'#';
 const rect=(x,y,w,h,c,p=1)=>{for(let j=y;j<y+h;j++)for(let i=x;i<x+w;i++) if(R()<p) set(i,j,c);};
 const hline=(x0,x1,y,c=':')=>{for(let x=x0;x<=x1;x++)set(x,y,c);};
 const vline=(x,y0,y1,c=':')=>{for(let y=y0;y<=y1;y++)set(x,y,c);};
 // forest border
 for(let y=0;y<36;y++)for(let x=0;x<W;x++){ if(y<=1||x===0||x===W-1) set(x,y,'#'); }
 for(let y=2;y<35;y++){ if(R()<0.55) set(1,y,'#'); if(R()<0.55) set(W-2,y,'#'); }
 for(let x=2;x<W-2;x++){ if(R()<0.5) set(x,2,'#'); }
 // north meadow & pond
 rect(2,3,9,5,'"',0.88); rect(3,4,6,3,'"');
 for(let y=2;y<9;y++)for(let x=24;x<35;x++){ const dx=(x-29)/4.6, dy=(y-5)/2.4; if(dx*dx+dy*dy<1) set(x,y,'~'); }
 rect(24,7,3,2,',',0.7); rect(31,2,3,2,',',0.6);
 // paths
 hline(3,32,9); hline(3,32,16); vline(3,9,16); vline(32,9,16);
 vline(13,6,8); vline(20,6,8); vline(17,13,15);
 vline(10,17,20); vline(25,17,20);
 // plaza flowers
 rect(6,13,3,2,','); rect(26,13,3,2,','); rect(13,14,3,1,',',0.6); rect(19,14,2,1,',',0.6);
 // middle band
 rect(4,18,4,2,','); rect(27,17,6,4,'"',0.9); rect(13,18,5,2,'"',0.85);
 set(18,18,'#'); set(2,19,'#'); set(33,20,'#'); set(7,20,'#');
 // river
 for(let x=0;x<W;x++){ set(x,21,'~'); set(x,22,'~'); if(R()<0.3) set(x, (x%7<3)?20:23, '~'); }
 for(const bx of [10,25]){ for(let y=20;y<=23;y++) set(bx,y, (y===21||y===22)?'=':':'); }
 // south
 vline(10,23,28); vline(25,23,28); hline(5,28,28); vline(5,27,27); vline(28,27,27); vline(17,29,35);
 // garden fence
 for(let x=19;x<=23;x++){ set(x,24,'f'); set(x,27,'f'); } for(let y=24;y<=27;y++){ set(19,y,'f'); set(23,y,'f'); }
 set(21,27,':');
 // tall grass south
 rect(2,30,6,4,'"',0.9); rect(28,30,6,4,'"',0.9);
 rect(9,33,4,2,','); rect(21,33,4,2,','); rect(14,30,2,2,',',0.6);
 set(2,23,'#'); set(33,23,'#'); set(12,24,'#'); set(9,24,'#'); set(32,26,'#'); set(2,27,'#');
 // beach & sea
 for(let x=0;x<W;x++){ if(R()<0.55) set(x,35,'s'); set(x,36,'s'); set(x,37,'s'); set(x,38,'s'); for(let y=39;y<H;y++) set(x,y,'S'); if(R()<0.4) set(x,38,'S'); }
 for(let x=0;x<W;x++){ if(get(x,35)!=='s' && (x<2||x>W-3)) set(x,35,'#'); }
 // small water edges near path beach
 vline(17,35,36,':');
 // features
 const props = {};
 const key=(x,y)=>y*W+x;
 for(const b of (typeof builtBuildings==='function'?builtBuildings():BUILDINGS)){ for(let j=b.y;j<b.y+b.h;j++)for(let i=b.x;i<b.x+b.w;i++) set(i,j,'B'); props[key(b.door[0],b.door[1])]={kind:'door',b}; if(get(b.door[0],b.door[1]+1)!==':') set(b.door[0],b.door[1]+1,':'); }
 FRUIT_TREES.forEach(([x,y,f],i)=>{ set(x,y,'T'); props[key(x,y)]={kind:'fruit',x,y,fruit:f,i}; });
 ROCKS.forEach(([x,y],i)=>{ set(x,y,'R'); props[key(x,y)]={kind:'rock',x,y,i}; });
 LAMPS.forEach(([x,y])=>{ set(x,y,'L'); props[key(x,y)]={kind:'lamp',x,y}; });
 for(let j=0;j<2;j++)for(let i=0;i<2;i++){ set(HUT[0]+i,HUT[1]+j,'H'); props[key(HUT[0]+i,HUT[1]+j)]={kind:'hut'}; }
 set(MAILBOX[0],MAILBOX[1],'M'); props[key(MAILBOX[0],MAILBOX[1])]={kind:'mailbox'};
 set(BOARD[0],BOARD[1],'K'); props[key(BOARD[0],BOARD[1])]={kind:'board'};
 for(let j=0;j<2;j++)for(let i=0;i<2;i++){ set(FOUNTAIN[0]+i,FOUNTAIN[1]+j,'F'); props[key(FOUNTAIN[0]+i,FOUNTAIN[1]+j)]={kind:'fountain'}; }
 for(let y=0;y<H;y++)for(let x=0;x<W;x++) if(t[y][x]==='#' && !props[key(x,y)]) props[key(x,y)]={kind:'tree',x,y};
 return {W,H,t,props,get,key};
}
