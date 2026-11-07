'use strict';
// ============================================================
//  むらの ものがたり: villager stories, newcomers, visitors,
//  legend, events, birthdays
// ============================================================

// ---------------- newcomers ----------------
VILLAGERS.push(
 {id:'mint',name:'ミント',house:'h_mint',home:[6,8],hours:[7,22],pitch:600,col:'#5ac8b0',likes:['shell_l','sunflower','peach'],movein:true,
  lines:{
   M:['おはよ、{name}！ あさの うたを つくってたの。 ♪ら〜ら〜','あさひが きらきら！ きょうも いい ひに なりそう！'],
   D:['ねぇねぇ {name}、 この むらって ほんとに ぷちっこが いっぱいだね！','ナナと いっしょに うみまで さんぽ してきたの！'],
   E:['ゆうやけの いろ、 うたに したいなぁ。'],
   N:['よるの むらって、 ほしの おとが きこえそう…','ねむる まえに ハーモニカを ふくのが すきなの。'],
   chat:['てがみで よんでた とおりの むら！ きて よかった〜！','{partner}って いい なまえ！ うたに いれても いい？','ナナとは ずっと てがみ ともだち だったんだ。 あえた ときは ないちゃった。',
    'むらの みんなの うたを つくるのが ゆめなんだ。','{name}の アルバム、 ナナに みせてもらったよ！ すてきだった！'],
   rain:['あめの おとって、 たいこみたいで すき！'],snow:['ゆき！ はじめて みた！ ふわふわ〜！'],
   love:['{name}は この むらで いちばん さいしょの ともだち だよ！','{name}の うた、 つくったの。 いつか きいてね。'],
   req:'あっ {name}！ {item}って もってる？ ひとつ わけてくれたら うれしいな！',thanks:'わぁ、 ありがとう！ これ、 おれいね！'}},
 {id:'riku',name:'リク',house:'h_riku',home:[5,33],hours:[6,21],pitch:300,col:'#4a9ae8',likes:['apple','shell_s','branch'],movein:true,
  lines:{
   M:['おはよう！ あさの もりは むしが いっぱい いるんだ！','はやおきは さんもんの とく… だっけ？'],
   D:['{name}、 つりざお もってる？ かわの ぬしを ねらってるんだ！','この むら、 むしも さかなも すごく おおいね！'],
   E:['ゆうがたは さかなが よく つれる じかん なんだぜ。'],
   N:['よるは ほたるを みに いくんだ。 なつに なったら いっしょに いこうよ！'],
   chat:['むかし ゲンじいさんに つりを おしえて もらったんだ。 だから この むらに きたの。','{partner}、 つよそうだなぁ！ いいな〜。',
    'ぷちっこずかんと むしずかん、 どっちが さきに うまるか しょうぶ だ！','きの ねもとには めずらしい むしが いるんだ。','うみの むこうには まだ みたことない さかなが いるんだって。'],
   rain:['あめの ひは かえるが いっぱい！ わくわく するよね！'],snow:['ゆきの ひは むしが いなくて ちょっと さみしい…'],
   love:['{name}と いると、 たんけんが もっと たのしく なるよ！','{name}は ぼくの いちばんの あいぼう だぜ！'],
   req:'{name}！ {item}が ほしいんだ。 もってたら ひとつ くれない？',thanks:'やった！ ありがとう！ はい、 おかえし！'}},
);
VILLAGERS.forEach(v=>VIL[v.id]=v);
BUILDINGS.push(
 {id:'h_mint',kind:'vhouse',vil:'mint',x:4,y:4,w:4,h:3,door:[5,6],roof:'#5ac8b0',wall:'#f0fff8',cond:'mint'},
 {id:'h_riku',kind:'vhouse',vil:'riku',x:2,y:30,w:4,h:3,door:[3,32],roof:'#4a8ad8',wall:'#f4f4ec',cond:'riku'},
);
function builtBuildings(){return BUILDINGS.filter(b=>!b.cond||(typeof S!=='undefined'&&S&&S.movedIn&&S.movedIn[b.cond]));}
VSPR.mint={pal:{h:'#7ad0c0',s:'#ffd9b8',e:'#2a2238',c:'#ff9bb0',d:'#ffd040',r:'#ff9ab8',k:'#e86a8a'},rows:VSPR.peng.rows};
VSPR.riku={pal:{w:'#4a9ae8',h:'#3a2a20',s:'#ffd9b8',e:'#2a2238',c:'#ff9bb0',r:'#5cbf5a',a:'#fff8ec',b:'#5a6a8a',k:'#5a3a2a'},rows:VSPR.bear.rows};

// ---------------- traveling visitors ----------------
const VISITORS = [
 {id:'toto',name:'トト',title:'たびの しょうにん トト',kind:'merchant',home:[20,14],hours:[8,20],pitch:200,col:'#a86a3a'},
 {id:'lulu',name:'ルル',title:'たびの おんがくか ルル',kind:'musician',home:[20,14],hours:[9,21],pitch:640,col:'#ff9a4a'},
 {id:'popo',name:'ポポ',title:'まいごの ポポ',kind:'lostkid',home:[20,14],hours:[8,18],pitch:720,col:'#c8823a'},
 {id:'luna',name:'ルナ',title:'うらないし ルナ',kind:'fortune',home:[20,14],hours:[12,23],pitch:380,col:'#6a4ab0'},
 {id:'sepia',name:'セピア',title:'えかき の セピア',kind:'painter',home:[20,14],hours:[9,18],pitch:460,col:'#ff5a7a'},
];
VISITORS.forEach(v=>{v.visitor=true;v.likes=[];v.house=null;VIL[v.id]=v;});
VSPR.toto={pal:{c:'#a86a3a',h:'#c8c8d0',s:'#f0c8a0',e:'#2a2238',g:'#e8e8f0',v:'#7a5a3a',r:'#f4e8c8',b:'#5a4a3a',k:'#3a2a20'},rows:VSPR.frog.rows};
VSPR.lulu={pal:{h:'#ff9a4a',c:'#ffd040',s:'#ffe0c8',e:'#2a2238',p:'#ff9bb0',r:'#5ab0f0',k:'#3a5a8a'},rows:VSPR.sheep.rows};
VSPR.popo={pal:{h:'#c8823a',s:'#ffd9b8',e:'#2a2238',c:'#ff9bb0',d:'#ffd040',r:'#ff7a4a',k:'#5a3a2a'},rows:VSPR.peng.rows};
VSPR.luna={pal:{h:'#6a4ab0',s:'#ffd9b8',e:'#2a2238',g:'#ffd040',c:'#ff9bb0',r:'#3a2a5a',a:'#ffd040',b:'#2a1a3a',k:'#2a1a3a'},rows:VSPR.chief.rows};
VSPR.sepia={pal:{h:'#2a2238',s:'#ffd9b8',e:'#2a2238',c:'#ff9bb0',m:'#c85a6a',d:'#ffffff',w:'#ff5a7a',b:'#5a4a6a',k:'#4a3a2a'},rows:VSPR.shop.rows};
const MERCHANT_GOODS = ['f_teaset','f_globe','f_bonsai','f_music','w_crown','f_starlamp','f_piano','w_sunglasses','seed_pump','f_fossilmodel','f_slide','feast'];

// ---------------- villager stories ----------------
// f: friendship needed. ask: {item,n} or {cond:'album'|'party'}. choice: options -> {ans}
const VSTORY = {
 bear:[
  {f:2,lines:['{name}、 きいておくれ！ あたらしい パンを かんがえているんだ。','むらの くだものを つかった、 むらだけの パン… いちごを いれたら どうだろう？'],ask:{item:'strawberry',n:2},askT:'いちごを 2こ もってきて くれないかい？',done:['ありがとう！ さっそく ためしに やいてみるよ。 また あした きておくれ！']},
  {f:3,lines:['できたよ、 いちごの しろパン！ …でも なにか たりない きがするんだ。','そうだ、 ひまわりの たねを まぶしたら こうばしく なるかも！'],ask:{item:'seed_sun',n:3},askT:'ひまわりの たねを 3つ わけて くれるかい？',done:['よし、 これで かんせいに ちかづいた！ あしたが たのしみだ。']},
  {f:4,lines:['ついに できた！ …でも なまえが きまらないんだ。','{name}、 えらんで くれるかい？'],choice:['ぽかぽかパン','ぷちっこパン','おひさまパン'],done:['「{ans}」！ いい なまえだ！ あしたから おみせに ならべるよ。'],reward:{items:{pokapan:3}}},
  {f:6,lines:['「{ans}」が だいにんきで、 あさから ぎょうれつ なんだ！','{name}の おかげだよ。 これ、 おれいの しるしに。'],reward:{coins:1000,items:{pokapan:5}}},
 ],
 peng:[
  {f:2,lines:['ねぇ {name}、 ないしょの はなし しても いい？','とおくの うみの むこうに、 てがみ ともだちが いるんだ！ ミントって いうの。','こんど かいがらを いっしょに おくりたいんだけど…'],ask:{item:'shell_s',n:1},askT:'さくらがいを ひとつ もらえないかな？',done:['ありがとっ！ きっと よろこぶよ！ へんじが きたら おしえるね！']},
  {f:3,lines:['へんじ きたよ！ きいて きいて！','「ぽかぽか村って どんな ところ？ ぷちっこと くらしてるって ほんと？」だって！','{name}の ことも かいて いい？ …やったー！']},
  {f:4,lines:['ミントがね、 「どんな むらか しゃしんが みたい」って いうの。','{name}、 カメラで しゃしんを とって アルバムに のこしてくれたら、 それを おくるね！'],ask:{cond:'album'},askT:'アルバムに しゃしんを のこしたら おしえてね！',done:['わぁ、 すてきな しゃしん！ ミントに おくるね！']},
  {f:5,lines:['たいへん たいへん！ ミントが この むらに ひっこして くるって！！','あした、 きたの はらっぱに いえが たつんだって！ たのしみ〜！'],reward:{movein:'mint'}},
 ],
 frog:[
  {f:2,lines:['なぁ {name}。 わしが わかい ころは、 せかいじゅうを たびして いたんだぜ。','いろんな ところで ぷちっこを みたが… この むらの ぷちっこが いちばん しあわせそうだ。']},
  {f:3,lines:['むかし、 この むらで ふしぎな かみきれを ひろってなぁ。 ほれ、 やるよ。','なにか かいて あるんだが、 わしには よめなくてなぁ。 ほかにも かけらが あるはずだ。'],reward:{items:{kakera1:1}}},
  {f:4,lines:['かけらは じめんの なかや、 ふんすい、 ながれぼしの よるに みつかるかも しれねぇ。','それと… かせきを ひとつ みせてくれないか？ むかしの ぷちっこの ほねと くらべたいんだ。'],ask:{item:'fossil',n:1},askT:'かせきを ひとつ もってきて くれるか？',done:['…やっぱりだ。 この ほねは、 でんせつの ぷちっこに にている。 ぽかぽかさま…'],reward:{coins:500}},
  {f:6,lines:['かけらが ぜんぶ そろったら、 ハルさんに みせてみな。 あのひとは むらの むかしを いちばん しっている。','…わしの たびも、 この むらで おわりで いい。 いい なかまが できたからな。'],reward:{items:{kakera2:1}}},
 ],
 sheep:[
  {f:2,lines:['{name}さん、 わたくし こんど あみものの コンテストに でますの。','とくべつな いとを そめたいのですけれど…'],ask:{item:'sunflower',n:2},askT:'ひまわりを 2ほん いただけないかしら？',done:['まぁ、 きれいな きいろ！ これで すてきな いとが そめられますわ。']},
  {f:3,lines:['いとは そめあがりましたの。 なにを あむか まよっていて…','ぷちっこの ための ちいさな ものが いいと おもうのですけれど。'],choice:['ぼうし','マフラー','てぶくろ'],done:['「{ans}」… すてき！ それに しますわ！']},
  {f:4,lines:['ぷちっこの {ans}、 できあがりましたの。 でも ためしに つけてくれる モデルさんが いなくて…'],ask:{cond:'party'},askT:'ぷちっこを つれて きてくださる？',done:['まぁ、 ぴったり！ {partner}ちゃん、 とっても にあってますわ！']},
  {f:5,lines:['コンテスト、 ゆうしょう しましたの！！','{name}さんと {partner}ちゃんの おかげですわ。 これは おれいですの。'],reward:{items:{w_knit:1},coins:800}},
 ],
 mint:[
  {f:2,lines:['{name}、 むらの うたを つくってるの。 でも さいごの ことばが きまらなくて…','ぷちっこって、 {name}に とって どんな そんざい？'],choice:['かぞく','ともだち','たからもの'],done:['「{ans}」… いい ことば！ うたに いれるね！']},
  {f:4,lines:['うた、 できたよ！ 「ぽかぽか村の {ans}」っていうの。','ルルさんって おんがくかさんが きたら、 いっしょに うたうんだ！ これ、 がくふの おれい。'],reward:{items:{f_music:1}}},
 ],
 riku:[
  {f:2,lines:['{name}！ かわの ぬしって しってる？ ものすごく おおきい さかな なんだって！','つりざおを つくりたいんだけど、 えだが たりなくて…'],ask:{item:'branch',n:3},askT:'えだを 3ぼん もってきて くれる？',done:['ありがとう！ これで さいきょうの つりざおが できるぞ！ {name}にも ひとつ あげるね！'],reward:{items:{rod:1}}},
  {f:4,lines:['ぬし、 まだ つれないんだ…','でも {name}と つりを してると、 つれなくても たのしいんだよね。 へへ。'],reward:{items:{feast:1}}},
 ],
};
const CHIEF_TALES = [
 {st:3,lines:['{name}さん、 この むらの なまえの ゆらい、 しってる？','むかし、 さむい ふゆの よるに ぷちっこたちが よりそって、 むらを あたためたんですって。 だから ぽかぽか村なの。']},
 {st:6,lines:['ふんすいの そこに、 むかしの もじが ほってあるのを しってる？','わたしにも よめないのよ。 ゲンじいさんなら なにか しってるかも しれないわね。']},
 {st:10,lines:['むらに ひとが ふえて、 にぎやかに なったわね。','あなたが きてくれてから、 ほんとうに むらが ぽかぽか してるわ。']},
];

// ---------------- legend ----------------
const KAKERA_TEXT = ['さむい ふゆの よる、 むらに ひが きえた','ちいさな ものたちが あつまり、 よりそった','その ぬくもりが、 ひとつの ひかりに なり','ひかりは はねを ひろげ、 むらを つつんだ','なかまを おもう こころ ある とき、 ひかりは また まいおりる'];
for(let i=1;i<=5;i++)ITEMS['kakera'+i]={name:`こもんじょの かけら${i}`,cat:'key',desc:`「${KAKERA_TEXT[i-1]}」 …と かいてある。`};

// ---------------- new items ----------------
Object.assign(ITEMS,{
 pokapan:{name:'むらの パン',sell:80,cat:'food',desc:'パンじろうさんの じしんさく。 ぷちっこに あげると げんきが ぜんぶ もどる。'},
 yakiimo:{name:'やきいも',sell:60,cat:'food',desc:'ほくほく あまい。 げんきが ぜんぶ もどる。'},
 cake:{name:'いちごケーキ',sell:200,cat:'food',desc:'クリスマスの とくべつな ケーキ。'},
 soba:{name:'としこしそば',sell:80,cat:'food',desc:'ながく げんきで いられますように。'},
 choco:{name:'ハートの チョコ',sell:90,cat:'food',desc:'だいすきの きもちを こめて。'},
 dango:{name:'おだんご',sell:70,cat:'food',desc:'もちもちの おだんご。'},
 mochi:{name:'おもち',sell:70,cat:'food',desc:'おしょうがつの おもち。'},
 rod:{name:'つりざお',cat:'key',desc:'リクが つくってくれた つりざお。 みずべを タップすると つりが できる。'},
});
const FEED_FOODS = ['yakiringo','soup','jam','pokapan','yakiimo','cake','soba','choco','dango','mochi','apple','peach','orange','pear','strawberry'];

// ---------------- event furniture ----------------
Object.assign(FURN,{
 xmastree:{name:'クリスマスツリー',price:0,gift:true,light:true},kadomatsu:{name:'かどまつ',price:0,gift:true},
 momiji:{name:'もみじの えだ',price:0,gift:true},tanabata:{name:'たなばたかざり',price:0,gift:true},portrait:{name:'ぷちっこの しょうぞうが',price:0,gift:true},
});
['xmastree','kadomatsu','momiji','tanabata','portrait'].forEach(k=>{ITEMS['f_'+k]={name:FURN[k].name,sell:100,cat:'furn',furn:k,desc:'とくべつな かぐ。 おうちに かざろう。'};});

// ---------------- events ----------------
const EVENTS = [
 {id:'momiji',name:'もみじまつり',from:[11,14],to:[11,16],deco:'momiji',news:'ひろばで もみじまつり！ もりの きが まっかに そまっているよ。',gift:{items:{yakiimo:3},furn:'momiji'},letter:'もみじまつりが はじまったわ。 やきいもを おすそわけ。 もみじの えだも かざってね。'},
 {id:'thanks',name:'ありがとうの ひ',from:[11,23],to:[11,23],deco:'heart',news:'いつも はたらいてくれる ぷちっこに ありがとうを つたえる ひ。 なでると いつもより よろこぶよ。',gift:{items:{feast:2}},letter:'きょうは ありがとうの ひ。 ぷちっこたちに ごちそうを あげてね。',petx2:true},
 {id:'advent',name:'クリスマスの じゅんび',from:[12,1],to:[12,23],deco:'xmas',news:'ひろばに おおきな ツリーが かざられたよ。 クリスマスまで あと すこし！',gift:{furn:'xmastree'},letter:'むらの クリスマスの じゅんびが はじまったわ。 あなたの おうちにも ツリーを どうぞ。'},
 {id:'xmas',name:'クリスマス',from:[12,24],to:[12,25],deco:'xmas',news:'メリー クリスマス！ ゆきが ふる よるは とくべつ。',gift:{items:{cake:2,w_santa:1}},letter:'メリー クリスマス！ ケーキと、 ぷちっこ用の サンタぼうしを おくるわ。',snow:true},
 {id:'omisoka',name:'おおみそか',from:[12,31],to:[12,31],deco:'lantern',news:'ことしも ありがとう。 としこしそばで あったまろう。',gift:{items:{soba:2}},letter:'ことしも いちねん ありがとう。 としこしそばを どうぞ。'},
 {id:'shogatsu',name:'おしょうがつ',from:[1,1],to:[1,3],deco:'shogatsu',news:'あけまして おめでとう！ むらの ひとに あいさつ すると おとしだまが もらえるかも。',gift:{coins:2000,items:{mochi:3},furn:'kadomatsu'},letter:'あけまして おめでとう。 ことしも よろしくね。 おとしだまと かどまつよ。',otoshidama:true},
 {id:'setsubun',name:'せつぶん',from:[2,3],to:[2,3],deco:'heart',news:'おには そと！ ふくは うち！',gift:{items:{cookie:5}},letter:'きょうは せつぶん。 ふくが たくさん きますように。'},
 {id:'valentine',name:'バレンタイン',from:[2,14],to:[2,14],deco:'heart',news:'だいすきな ひとに あまい ものを わたす ひ。',gift:{items:{choco:3}},letter:'ハートの チョコを おくるわ。 ぷちっこたちにも わけてあげてね。'},
 {id:'hina',name:'ひなまつり',from:[3,3],to:[3,3],deco:'sakura',news:'ひなまつり。 あまい おかしで おいわい！',gift:{items:{dango:2}},letter:'ひなまつり おめでとう。 おだんごを どうぞ。'},
 {id:'hanami',name:'おはなみ',from:[3,28],to:[4,8],deco:'sakura',news:'さくらが まんかい！ おはなみ びより。',gift:{items:{dango:3}},letter:'さくらが きれいね。 おはなみの おだんごよ。'},
 {id:'kodomo',name:'こどもの ひ',from:[5,5],to:[5,5],deco:'flag',news:'こどもの ひ。 ぷちっこたちも おおはしゃぎ！',gift:{items:{feast:1}},letter:'こどもの ひ。 ぷちっこたちと いっぱい あそんでね。'},
 {id:'tanabata',name:'たなばた',from:[7,1],to:[7,7],deco:'tanabata',news:'たなばたかざりに ねがいごとを かこう。',gift:{furn:'tanabata'},letter:'たなばたかざりを おくるわ。 ねがいごと、 なんて かく？'},
 {id:'natsu',name:'なつまつり',from:[8,10],to:[8,16],deco:'lantern',news:'よるは はなびが あがるよ！',gift:{items:{yakiringo:3}},letter:'なつまつりよ。 よるの はなび、 みのがさないでね。',fireworks:true},
 {id:'tsukimi',name:'おつきみ',from:[9,15],to:[9,17],deco:'lantern',news:'まんまるの おつきさまを みよう。',gift:{items:{dango:3}},letter:'おつきみ だんごを どうぞ。'},
 {id:'halloween',name:'ハロウィン',from:[10,25],to:[10,31],deco:'halloween',news:'トリック オア トリート！ ぷちっこも かそう？',gift:{items:{w_witch:1,cookie:5}},letter:'ハロウィンね。 まじょの ぼうしを ぷちっこに どうぞ。'},
];
const BIRTHDAYS = {bear:[11,28],peng:[12,12],frog:[1,20],sheep:[2,8],chief:[3,15],mint:[4,22],riku:[6,30]};
