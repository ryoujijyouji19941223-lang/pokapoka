'use strict';
// ============================================================
//  ミニあそび data: fish, bugs, flowers, bakery
// ============================================================
// where: river | pond | sea ; time like species (MDEN or *) ; season list or *
const FISH = [
 {id:'medaka',name:'めだか',where:'river',time:'*',season:'*',rare:1,size:[2,4],col:'#a8b8c8',sell:40},
 {id:'funa',name:'ふな',where:'pond',time:'*',season:'*',rare:1,size:[12,25],col:'#8a9a6a',sell:80},
 {id:'koi',name:'にしきごい',where:'pond',time:'MD',season:'*',rare:3,size:[30,60],col:'#ff8a4a',sell:500},
 {id:'ayu',name:'あゆ',where:'river',time:'MDE',season:'su,au',rare:2,size:[15,25],col:'#c8d8a8',sell:180},
 {id:'namazu',name:'なまず',where:'river',time:'EN',season:'*',rare:2,size:[30,60],col:'#6a6a5a',sell:260},
 {id:'nijimasu',name:'にじます',where:'river',time:'*',season:'au,wi,sp',rare:2,size:[20,40],col:'#ff9ab0',sell:220},
 {id:'kingyo',name:'きんぎょ',where:'pond',time:'*',season:'su',rare:3,size:[4,8],col:'#ff4a3a',sell:400},
 {id:'iwashi',name:'いわし',where:'sea',time:'*',season:'*',rare:1,size:[10,18],col:'#7a9ac8',sell:60},
 {id:'aji',name:'あじ',where:'sea',time:'*',season:'*',rare:1,size:[15,30],col:'#9ab0c8',sell:90},
 {id:'fugu',name:'ふぐ',where:'sea',time:'DEN',season:'*',rare:2,size:[15,30],col:'#e8d8a0',sell:240},
 {id:'tako',name:'たこ',where:'sea',time:'EN',season:'*',rare:2,size:[30,60],col:'#e86a5a',sell:300},
 {id:'kurage',name:'くらげ',where:'sea',time:'*',season:'su',rare:2,size:[10,25],col:'#c8e8ff',sell:120},
 {id:'tai',name:'たい',where:'sea',time:'MD',season:'*',rare:3,size:[30,60],col:'#ff6a7a',sell:650},
 {id:'nushi',name:'かわの ぬし',where:'river',time:'EN',season:'*',rare:5,size:[90,150],col:'#4a5a6a',sell:3000},
];
const BUGS = [
 {id:'monshiro',name:'もんしろちょう',where:'flower',time:'MD',season:'sp,su',rare:1,shape:'fly',col:'#ffffff',col2:'#3a3a3a',sell:60},
 {id:'ageha',name:'あげはちょう',where:'flower',time:'MD',season:'sp,su',rare:2,shape:'fly',col:'#ffd040',col2:'#2a2a2a',sell:200},
 {id:'tentou',name:'てんとうむし',where:'flower',time:'MDE',season:'sp,su,au',rare:1,shape:'beetle',col:'#ff3a3a',col2:'#2a2a2a',sell:80},
 {id:'kabuto',name:'かぶとむし',where:'tree',time:'EN',season:'su',rare:3,shape:'beetle',col:'#7a4a2a',col2:'#4a2a1a',sell:600},
 {id:'kuwagata',name:'くわがた',where:'tree',time:'N',season:'su',rare:3,shape:'beetle',col:'#3a2a1a',col2:'#8a6a3a',sell:700},
 {id:'semi',name:'せみ',where:'tree',time:'MDE',season:'su',rare:1,shape:'beetle',col:'#6a8a5a',col2:'#c8e8c0',sell:90},
 {id:'hotaru',name:'ほたる',where:'shore',time:'N',season:'su',rare:2,shape:'glow',col:'#fff27a',col2:'#3a3a3a',sell:300},
 {id:'tonbo',name:'あかとんぼ',where:'grass',time:'MDE',season:'au',rare:1,shape:'fly',col:'#ff6a3a',col2:'#ffd0b0',sell:100},
 {id:'suzumushi',name:'すずむし',where:'grass',time:'EN',season:'au',rare:2,shape:'beetle',col:'#4a4a3a',col2:'#c8c890',sell:220},
 {id:'batta',name:'ばった',where:'grass',time:'MD',season:'su,au',rare:1,shape:'beetle',col:'#7ac85a',col2:'#4a8a3a',sell:70},
 {id:'mitsubachi',name:'みつばち',where:'flower',time:'MD',season:'sp,su,au',rare:1,shape:'fly',col:'#ffc030',col2:'#3a2a1a',sell:90},
 {id:'yukimushi',name:'ゆきむし',where:'grass',time:'DE',season:'wi',rare:2,shape:'glow',col:'#ffffff',col2:'#c8d8ff',sell:250},
 {id:'minomushi',name:'みのむし',where:'tree',time:'*',season:'au,wi',rare:1,shape:'beetle',col:'#a88a5a',col2:'#6a4a2a',sell:80},
 {id:'niji',name:'にじいろ ちょう',where:'flower',time:'D',season:'*',rare:4,shape:'fly',col:'#ff8ac8',col2:'#7ac8ff',sell:1500},
];
FISH.forEach(f=>{ITEMS['fish_'+f.id]={name:f.name,sell:f.sell,cat:'fish',col:f.col,desc:'つった さかな。 うると おかねに なる。 しりょうかんに きぞう できるよ。'};});
BUGS.forEach(b=>{ITEMS['bug_'+b.id]={name:b.name,sell:b.sell,cat:'bug',col:b.col,col2:b.col2,shape:b.shape,desc:'つかまえた むし。 しりょうかんに きぞう できるよ。'};});

// flowers: picked wild flowers + garden tulips with breeding
const FLOWER_COLS = {r:['あか','#ff4a5a'],y:['きいろ','#ffd030'],w:['しろ','#ffffff'],p:['ピンク','#ff9ac8'],o:['オレンジ','#ff9a30'],b:['あお','#5a9ae8'],v:['むらさき','#a86ae8'],n:['にじいろ','rainbow']};
for(const c in FLOWER_COLS){const[jp,col]=FLOWER_COLS[c];
 ITEMS['tulip_'+c]={name:`${jp}の チューリップ`,sell:{r:40,y:40,w:40,p:120,o:120,b:180,v:300,n:1200}[c],cat:'flower',col,desc:'はたけで そだてた はな。 となりに ちがう いろを うえると、 めずらしい たねが とれる ことも。'};
 ITEMS['seed_tulip_'+c]={name:`${jp}の チューリップの たね`,buy:['r','y','w'].includes(c)?60:undefined,sell:15,cat:'seed',crop:'tulip_'+c,hours:4,col,desc:'4じかんで さく チューリップの たね。'};}
const HYBRID = {'r+w':'p','r+y':'o','w+y':'b','b+p':'v','o+v':'n'};
ITEMS.wildflower={name:'のはなの はなたば',sell:30,cat:'flower',col:'#ffb0d0',desc:'のはらで つんだ はな。 むらの ひとに あげると よろこぶ。'};
Object.assign(FURN,{tulipvase:{name:'チューリップの かびん',price:600,craft:true},fishtank:{name:'すいそう',price:900,craft:true},bugcage:{name:'むしかご',price:500,craft:true}});
['tulipvase','fishtank','bugcage'].forEach(k=>{ITEMS['f_'+k]={name:FURN[k].name,sell:Math.floor(FURN[k].price/4),cat:'furn',furn:k,desc:'じぶんで つくった かぐ。'};});
Object.assign(RECIPES,{
 tulipvase:{out:'f_tulipvase',need:{tulip_r:1,tulip_y:1,tulip_w:1,clay:1}},
 fishtank:{out:'f_fishtank',need:{fish_medaka:2,iron:1,stone:2}},
 bugcage:{out:'f_bugcage',need:{branch:4,bug_tentou:1}},
});
START_RECIPES.push('tulipvase','fishtank','bugcage');
VIL.sheep.likes.push('tulip_p','wildflower');VIL.mint.likes.push('tulip_b');VIL.riku.likes.push('fish_nushi','bug_kabuto');
ITEMS.rod.buy=500;

// bakery orders
QUEST_POOL.push({k:'fish',t:'さかなを {n}ひき つる',n:[1,2],r:150,story:8},{k:'bug',t:'むしを {n}ひき つかまえる',n:[1,2],r:140,story:8},{k:'flower',t:'のはなを {n}かい つむ',n:[2,3],r:100,story:8});
const BREADS = [['pan_round','まるパン','#e8b060'],['pan_crois','クロワッサン','#d8903a'],['pan_melon','メロンパン','#f0d070'],['pan_choco','チョココロネ','#8a5a3a']];
