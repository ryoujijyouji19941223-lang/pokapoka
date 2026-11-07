'use strict';
// ============================================================
//  おしゃれ: puchikko wear, player clothes, wallpaper/floor,
//  furniture series, house expansion
// ============================================================

// ---------------- puchikko wear ----------------
const WEAR = {
 ribbon:{name:'リボン',pos:'side',rows:["xx.xx","xxyxx","xx.xx"],c1:'#ff5a7a',c2:'#ffd0dc',price:300},
 bluebow:{name:'あおい リボン',pos:'side',rows:["xx.xx","xxyxx","xx.xx"],c1:'#5a9ae8',c2:'#d0e4ff',price:300},
 starpin:{name:'ほしの かみかざり',pos:'side',rows:[".x.","xyx",".x."],c1:'#ffe060',c2:'#ffffff',price:400},
 strawhat:{name:'むぎわらぼうし',pos:'head',rows:["..xxxx..",".xyyyyx.","xxxxxxxx"],c1:'#f0d070',c2:'#ff6a6a',price:600,season:'sp,su'},
 beret:{name:'ベレーぼう',pos:'head',rows:["...x...",".xxxxx.","xxxxxxx"],c1:'#d84a5a',price:500},
 knit:{name:'ニットぼう',pos:'head',rows:["..y..",".xxx.","xxxxx","yyyyy"],c1:'#5cb87a',c2:'#ffffff',price:500,season:'au,wi'},
 witch:{name:'まじょの ぼうし',pos:'head',rows:["....x..","...xx..","..xxx..",".xyyyx.","xxxxxxx"],c1:'#6a4ab0',c2:'#ffd040',price:900,season:'au'},
 santa:{name:'サンタぼうし',pos:'head',rows:["....yy","..xxx.",".xxxx.","yyyyyy"],c1:'#e83a3a',c2:'#ffffff',price:900,season:'wi'},
 crown:{name:'ちいさな おうかん',pos:'head',rows:["x.x.x","xxxxx","xyxyx"],c1:'#ffd040',c2:'#ff5a8a',price:2400},
 flowercrown:{name:'はなかんむり',pos:'head',rows:["x.y.x.y","yxyxyxy"],c1:'#ff9ac0',c2:'#fff27a',craft:true},
 leafhat:{name:'はっぱの ぼうし',pos:'head',rows:["...y.",".xxx.","xxxxx"],c1:'#5cbf5a',c2:'#7a4e2a',craft:true},
 glasses:{name:'まるメガネ',pos:'eyes',c1:'#3a2a2a',price:450},
 sunglasses:{name:'サングラス',pos:'eyes',c1:'#2a2a3a',fill:true,price:700,season:'sp,su'},
 bell:{name:'すず',pos:'neck',c1:'#ffd040',c2:'#b8801a',price:350},
};
for(const k in WEAR)ITEMS['w_'+k]={name:WEAR[k].name,sell:Math.floor((WEAR[k].price||400)/4),cat:'wear',wear:k,desc:'ぷちっこに つけられる こもの。「なかま」から きせかえよう。'};
const SCARF_COLS = ['#ff6a7a','#ffa040','#ffd040','#5cbf5a','#3cb8b0','#4a9ae8','#a87ae8','#ff8ac8','#f4f4f4','#3a3a4a'];
const SHINY_DEG = 150, SHINY_RATE = 1/30;

// ---------------- player clothes ----------------
const OUTFITS = {
 tee:{name:'Tシャツ',price:0},
 dress:{name:'ワンピース',price:900},
 overall:{name:'オーバーオール',price:1100},
 stripe:{name:'ボーダーシャツ',price:700},
 hoodie:{name:'パーカー',price:1000},
 apron:{name:'エプロンドレス',price:800},
 yukata:{name:'ゆかた',price:1500,season:'su'},
 coat:{name:'ダッフルコート',price:1600,season:'au,wi'},
};
const OUTFIT_SPR = {
 tee:{front:["....rrrrrrrr....","...srrrrrrrrs...","...srrrrrrrrs...","....bbbbbbbb...."],side:["....rrrrrrrr....","....rrrrrrrr....","....rrrsrrrr....","....bbbbbbbb...."]},
 dress:{front:["....rrrrrrrr....","...srrrrrrrrs...","...srrrrrrrrs...","...rrrrrrrrrr..."],side:["....rrrrrrrr....","....rrrrrrrr....","....rrrsrrrr....","...rrrrrrrrrr..."],pants:'skin'},
 overall:{front:["....rddddddr....","...srddddddrs...","...sdddddddds...","....dddddddd...."],side:["....rrddddrr....","....rrddddrr....","....rddsdddr....","....dddddddd...."],pants:'#4a7ac8'},
 stripe:{front:["....rrrrrrrr....","...swwwwwwwws...","...srrrrrrrrs...","....bbbbbbbb...."],side:["....rrrrrrrr....","....wwwwwwww....","....rrrsrrrr....","....bbbbbbbb...."]},
 hoodie:{front:["...rrrrrrrrrr...","...srrrwwrrrs...","...srrRRRRrrs...","....bbbbbbbb...."],side:["...Rrrrrrrrr....","...Rrrrrrrrr....","....rrrsrrrr....","....bbbbbbbb...."]},
 apron:{front:["....rwwwwwwr....","...srwwwwwwrs...","...srwwwwwwrs...","...rrwwwwwwrr..."],side:["....rrrrwwww....","....rrrrwwww....","....rrrswwww....","...rrrrrwwww...."],pants:'skin'},
 yukata:{front:["....rrwwrrrr....","...srrrwrrrrs...","...syyyyyyyys...","...rrrrrrrrrr..."],side:["....rrrrrrrr....","....rrrrrrrr....","....yyysyyyy....","...rrrrrrrrrr..."],pants:'dark'},
 coat:{front:["...rrrrrrrrrr...","...srryrryrrs...","...srryrryrrs...","...rrrrrrrrrr..."],side:["...rrrrrrrrr....","...rrrrrrrrr....","...rrrrsrrrr....","...rrrrrrrrr...."]},
};
const HATS = {
 ribbon:{name:'おおきな リボン',price:500,c1:'#ff5a7a',c2:'#ffd0dc'},
 straw:{name:'むぎわらぼうし',price:800,c1:'#f0d070',c2:'#ff6a6a',season:'sp,su'},
 beanie:{name:'ニットぼう',price:600,c1:'#5a9ae8',c2:'#ffffff',season:'au,wi'},
 flower:{name:'はなかざり',price:400,c1:'#ff9ac0',c2:'#fff27a'},
 cap:{name:'キャップ',price:600,c1:'#ff8a3a',c2:'#ffffff'},
};
const HAIRSTYLES = {short:'ショート',long:'ロング',twin:'ツインテール',odango:'おだんご',bob:'ボブ'};
for(const k in OUTFITS)if(OUTFITS[k].price)ITEMS['o_'+k]={name:OUTFITS[k].name,sell:Math.floor(OUTFITS[k].price/4),cat:'cloth',desc:'じぶんの ふく。 おうちの「きがえ」で きられるよ。'};
for(const k in HATS)ITEMS['h_'+k]={name:HATS[k].name,sell:Math.floor(HATS[k].price/4),cat:'cloth',desc:'じぶんの ぼうし・かみかざり。 おうちの「きがえ」で つけられるよ。'};

// ---------------- wallpaper / floor ----------------
const WALLS = {
 peach:{name:'ももいろ ストライプ',price:0},mint:{name:'ミントの かべがみ',price:800},sky:{name:'あおぞらの かべがみ',price:1000},
 polka:{name:'みずたまの かべがみ',price:900},woodw:{name:'きの かべ',price:1000},star:{name:'よぞらの かべがみ',price:1400},
 sakura:{name:'さくらの かべがみ',price:1200,season:'sp'},brick:{name:'レンガの かべ',price:1100},
};
const FLOORS = {
 oak:{name:'きの ゆか',price:0},tile:{name:'チェックの タイル',price:900},tatami:{name:'たたみ',price:1000},
 carpet:{name:'ピンクの じゅうたん',price:1100},grass:{name:'しばふの ゆか',price:1200},marble:{name:'だいりせきの ゆか',price:1500},bluetile:{name:'あおい タイル',price:900},
};
for(const k in WALLS)ITEMS['wp_'+k]={name:WALLS[k].name,sell:Math.floor((WALLS[k].price||400)/4),cat:'wall',desc:'へやの かべがみ。「もようがえ」で えらぶと はりかえるよ。'};
for(const k in FLOORS)ITEMS['fl_'+k]={name:FLOORS[k].name,sell:Math.floor((FLOORS[k].price||400)/4),cat:'floor',desc:'へやの ゆか。「もようがえ」で えらぶと はりかえるよ。'};

// ---------------- extra furniture ----------------
Object.assign(FURN,{wshelf:{name:'もくせいの たな',price:500,craft:true},mirror:{name:'すがたみ',price:700}});
ITEMS.f_wshelf={name:FURN.wshelf.name,sell:125,cat:'furn',furn:'wshelf',desc:'じぶんで つくった かぐ。'};
ITEMS.f_mirror={name:FURN.mirror.name,sell:175,cat:'furn',furn:'mirror',desc:'しらべると きがえが できる。'};
Object.assign(RECIPES,{wshelf:{out:'f_wshelf',need:{wood:5,branch:1}},flowercrown:{out:'w_flowercrown',need:{sunflower:2}},leafhat:{out:'w_leafhat',need:{branch:3,wood:1}}});
START_RECIPES.push('wshelf');VIL_RECIPES.sheep.push('flowercrown');VIL_RECIPES.peng.push('leafhat');

// ---------------- furniture series ----------------
const SERIES = [
 {id:'wood',name:'もくせい シリーズ',items:['stool','wchair','wtable','woodbox','petbed','wshelf'],need:4,bonus:'おうちに はいると、 つれている ぷちっこの げんきが 3 もどる（1にち 1かい）'},
 {id:'light',name:'あかり シリーズ',items:['lamp','stonelamp','shelllamp','starlamp','pumpkinlamp','stove'],need:3,bonus:'よるの ながれぼしが よく ながれるように なる'},
 {id:'toy',name:'おもちゃ シリーズ',items:['ball','yarn','slide','tsumiki','mokuba','taiko','plush'],need:4,bonus:'あそびに くる ぷちっこが ふえて、 なかよしも すこし ふえる'},
 {id:'nature',name:'しぜん シリーズ',items:['plant','bonsai','planter','sakuravase','fishbowl','pot'],need:3,bonus:'はたけの さくもつが すこし はやく そだつ'},
 {id:'music',name:'おんがく シリーズ',items:['piano','radio','music','taiko'],need:3,bonus:'ぷちっこと おはなし すると なかよしが もっと ふえる'},
 {id:'sea',name:'うみと たび シリーズ',items:['shelllamp','fishbowl','bigfish','globe'],need:3,bonus:'すなはまの かいがらが ひとつ ふえる'},
];

// ---------------- house expansion ----------------
const HOUSE_LV = [
 {w:14,h:11},
 {w:16,h:12,coins:3000,need:{wood:15},name:'すこし ひろい おうち'},
 {w:18,h:13,coins:8000,need:{wood:25,stone:15,iron:3},name:'ひろい おうち'},
 {w:20,h:14,coins:15000,need:{wood:30,stone:20,iron:6,clay:5},name:'とっても ひろい おうち'},
];

// ---------------- photo ----------------
const PHOTO_FRAMES = [['none','なし'],['polaroid','しろ'],['heart','ハート'],['flower','おはな'],['star','ほし'],['season','きせつ']];
QUEST_POOL.push({k:'photo',t:'しゃしんを {n}まい アルバムに のこす',n:[1,1],r:120,story:8});
const PHOTO_STAMPS = ['heart','note','spark','starbit','sunflower','apple','cookie','zzz'];
