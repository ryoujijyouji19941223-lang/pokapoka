'use strict';
// ============================================================
//  ぷちっこの くらし: personality, toys, talk, diary, omikuji
// ============================================================

// ---------------- toys & new furniture ----------------
const NEW_FURN = {
 ball:{name:'ころころボール',price:320,toy:'ball'},
 yarn:{name:'けいとだま',price:260,toy:'yarn'},
 slide:{name:'ちいさな すべりだい',price:1500,toy:'slide'},
 tsumiki:{name:'つみき',price:200,craft:true,toy:'stack'},
 mokuba:{name:'もくば',price:600,craft:true,toy:'rock'},
 taiko:{name:'ぽんぽこだいこ',price:420,craft:true,toy:'drum'},
 petbed:{name:'ぷちっこベッド',price:380,craft:true,toy:'sleep',walk:true,floor:true,w:1,h:1},
};
Object.assign(FURN,NEW_FURN);
FURN.plush.toy='hug';
for(const k in NEW_FURN){ITEMS['f_'+k]={name:FURN[k].name,sell:Math.floor(FURN[k].price/4),cat:'furn',furn:k,desc:'ぷちっこの おもちゃ。 おうちに おくと あそんでくれるよ。'};}
ITEMS.f_plush.desc='ぷちっこが だきついて あそぶ ぬいぐるみ。';
const SHOP_TOYS = ['ball','yarn','slide','plush'];
Object.assign(RECIPES,{
 tsumiki:{out:'f_tsumiki',need:{wood:3}},
 petbed:{out:'f_petbed',need:{wood:3,branch:3}},
 mokuba:{out:'f_mokuba',need:{wood:6,branch:2}},
 taiko:{out:'f_taiko',need:{wood:3,clay:2}},
});
START_RECIPES.push('tsumiki','petbed');
VIL_RECIPES.bear.push('mokuba');VIL_RECIPES.frog.push('taiko');

// which activity each furniture invites
const FURN_ACT = {bed:'sleep',cushion:'sleep',kotatsu:'sleep',rug:'sleep',rug2:'sleep',mat:'sleep',
 fishbowl:'watch',tv:'watch',globe:'watch',plant:'watch',starlamp:'watch',bonsai:'watch',fossilmodel:'watch',shelllamp:'watch',sakuravase:'watch',planter:'watch',stove:'watch',
 piano:'music',radio:'music',music:'music',table:'eat',wtable:'eat',chair:'sit',wchair:'sit',stool:'sit'};
function actOf(id){return FURN[id].toy||FURN_ACT[id]||null;}
const ACT_JP = {sleep:'ねている',ball:'ボールで あそんでいる',yarn:'けいとだまを おいかけている',slide:'すべりだいで あそんでいる',stack:'つみきを つんでいる',
 rock:'もくばに のっている',drum:'たいこを たたいている',hug:'ぬいぐるみを ぎゅっと している',watch:'じっと みつめている',music:'おんがくに あわせて おどっている',eat:'おやつを たべている',sit:'いすで くつろいでいる'};

// ---------------- personality ----------------
const PERSONA = {
 kuishinbo:{jp:'くいしんぼう',col:'#ff9a3a',desc:'たべることが だいすき。 ごはんを あげると とくに よろこぶ。',acts:{eat:6,ball:2,watch:1,sleep:2,hug:1,sit:1}},
 nebosuke:{jp:'ねぼすけ',col:'#8a8ad8',desc:'ねるのが だいすき。 おうちで ひるねを すると げんきが もどる。',acts:{sleep:8,hug:2,watch:1,sit:1}},
 amaenbo:{jp:'あまえんぼう',col:'#ff7aa8',desc:'いつも そばに いたい。 なでると とくに よろこぶ。',acts:{follow:5,hug:3,sleep:2,sit:1,watch:1}},
 genki:{jp:'げんきいっぱい',col:'#ff6a4a',desc:'うごくのが だいすき。 げんきの さいだいちが おおい。',acts:{ball:4,slide:5,drum:3,rock:2,yarn:2,music:2,wander:2}},
 nonbiri:{jp:'のんびりや',col:'#5cb87a',desc:'マイペース。 しごとを しても つかれない ことが ある。',acts:{watch:4,sit:3,sleep:3,rock:3}},
 kouki:{jp:'こうきしん おうせい',col:'#e8b020',desc:'なんでも きになる。 おみやげを よく みつけてくる。',acts:{stack:5,watch:3,yarn:2,music:2,wander:3,slide:1}},
 hazukashi:{jp:'はずかしがりや',col:'#b88ae8',desc:'ちょっぴり シャイ。 なかよく なると めずらしい ものを くれる。',acts:{yarn:4,hug:3,stack:2,watch:2,sleep:2}},
};
const PERSONA_KEYS = Object.keys(PERSONA);
const FAV_POOL = ['apple','apple','peach','orange','pear','strawberry','strawberry','yakiringo','jam','soup'];

// talk lines: [tier0(♥0-1), tier1(♥2-3), tier2(♥4-5)]  {me}=puchikko name {name}=player
const TALK = {
 kuishinbo:[
  ['…くんくん。 なにか おいしい においが する…？','{me}の おなかが ぐぅ〜と なった。','ごはんの じかんは まだかなぁ…'],
  ['ねぇねぇ、 きょうの おやつ なにかな？','{name}と たべる ごはんが いちばん おいしいんだ。','パンじろうさんの パン、 いつか ひとくち たべてみたいなぁ。'],
  ['{name}が くれた ごはん、 ぜんぶ おぼえてるよ。 ほんとだよ。','おなかいっぱいより、 {name}と いっしょの ほうが しあわせかも。 …でも ごはんも ほしい。','いつか {name}に ごちそう つくって あげるんだ！']],
 nebosuke:[
  ['ふぁ〜… あ、 {name}…','{me}は うとうと している…','…zzz。 …はっ。 おきてるよ…'],
  ['{name}の そばだと よく ねむれるんだ。','ゆめの なかで {name}と さんぽ したよ。','ひなたぼっこと おひるね、 どっちも すき。'],
  ['ねむる まえに {name}の かおを みると、 いい ゆめが みられるの。','{name}も ちゃんと ねてる？ ねるのは だいじだよ。','ずっと いっしょに おひるね しようね。']],
 amaenbo:[
  ['{me}は {name}の あしもとに すりよってきた。','…ちょっとだけ、 そばに いても いい？','{name}の あとを ついていくの、 たのしい。'],
  ['なでなで して〜！','{name}が いないと、 さみしくて まどの そとを ずっと みてるの。','ぎゅって して いい？'],
  ['{name}は {me}の いちばん だいすきな ひと だよ！','どこに いっても ついていくからね。','{name}が わらうと、 {me}も うれしい！']],
 genki:[
  ['{me}は その ばで ぴょんぴょん はねている！','かけっこ しよっ！','うずうず… なにか して あそびたい！'],
  ['きょうは むらを なんしゅう する？','{name}、 おそいぞ〜！ …なんてね！','あたらしい おもちゃ、 あったら いいなぁ！'],
  ['{name}と いっしょなら どこまでも はしれる！','いちばんの なかま は {name}だよ！','あした も あさって も、 いっしょに あそぼうね！']],
 nonbiri:[
  ['{me}は ぼんやり くもを みている…','…いい かぜ だねぇ。','いそがない、 いそがない…'],
  ['{name}も いっしょに ひなたぼっこ しよう。','くもの かたち、 ぷちっこに にてるね。','ゆっくりで いいんだよ。 むらは にげないもん。'],
  ['{name}と ぼーっと する じかんが いちばん すき。','がんばらない ひが あっても いいんだよ。','{name}の となりは、 ぽかぽか するなぁ。']],
 kouki:[
  ['{me}は きょろきょろ あたりを みまわしている。','あれ なに？ これ なに？','{name}の かばん、 なにが はいってるの？'],
  ['きのう、 もりで へんな いしを みつけたんだ！','むらの はずれって、 どうなってるのかな？','ねぇ、 ながれぼしって どこに おちるの？'],
  ['{name}と いると、 まいにち はっけんが いっぱい！','いつか いっしょに、 むらの ひみつを ぜんぶ しらべようね。','{name}の ことも、 もっと しりたいな。']],
 hazukashi:[
  ['…{me}は {name}の かげに かくれた。','…あ、 あの…','{me}は もじもじ している。'],
  ['…きょうも、 あえて うれしい。','…はなし かけて くれて、 ありがとう。','{name}と なら、 あんまり どきどき しない…かも。'],
  ['…{name}の こと、 だいすき。 …いっちゃった。','ずっと いえなかったけど… いつも ありがとう。','…これからも、 となりに いて いい？']],
};
// reaction when petted
const PET_LINE = {
 kuishinbo:['{me}は うれしそうに めを ほそめた。 …おなかも なった。','{me}は もっと〜 という かおを している。'],
 nebosuke:['{me}は きもちよくて ねむって しまいそう…','{me}は ふにゃ〜っと とろけた。'],
 amaenbo:['{me}は ぴったり くっついて はなれない！','{me}は もっと なでて！と すりよってきた。'],
 genki:['{me}は うれしくて その ばで くるくる まわった！','{me}は ぴょーんと とびはねた！'],
 nonbiri:['{me}は ほわ〜んと した かおを している。','{me}は ゆっくり しっぽを ゆらした。'],
 kouki:['{me}は {name}の てを くんくん かいでいる。','{me}は なでられながら きょろきょろ している。'],
 hazukashi:['{me}は てれて まっかに なった。','{me}は ちいさく 「…えへへ」と わらった。'],
};
// bedtime "goodnight"
const NIGHT_LINE = {
 kuishinbo:['おやすみ、 {name}。 あしたの あさごはん、 たのしみだね。','ゆめの なかで ケーキ たべるんだ… おやすみ…'],
 nebosuke:['…おやすみ…zzz。','{name}… あったかい… おやすみ…'],
 amaenbo:['おやすみ、 {name}。 あした おきても そばに いるからね。','いっしょに ねられて うれしい。 おやすみ！'],
 genki:['あしたも いっぱい あそぼうね！ おやすみっ！','まだ ねむくない… ……zzz'],
 nonbiri:['きょうも いい いちにち だったね。 おやすみ。','ゆっくり やすんでね、 {name}。'],
 kouki:['あした なに みつけるか、 かんがえてたら ねむれない…！ おやすみ！','おやすみ、 {name}。 ゆめで たんけん しようね。'],
 hazukashi:['…おやすみ、 {name}。 …だいすき。','…となりで ねても、 いい？ おやすみ。'],
};
// first time the puchikko tells its favorite food (♥2+)
const FAV_TELL = ['あのね、 {me}は {fav}が いちばん すきなんだ。 …ないしょだよ。','{fav}… たべたいなぁ。 だいこうぶつ なんだ。'];

// ---------------- away diary (るすちゅうの できごと) ----------------
const DIARY_JOB = {
 till:{t:'{me}が はたけの まわりを たがやして、 {item}を みつけてくれた。',items:[['clay',1],['clay',2],['seed_sun',1],['seed_straw',1]]},
 water:{t:'{me}が はたけに みずを まいておいてくれた。',water:true,items:[['shell_s',1]]},
 chop:{t:'{me}が もりで {item}を あつめてきてくれた。',items:[['wood',2],['wood',3],['branch',2]]},
 smash:{t:'{me}が いわを わって {item}を もってきてくれた。',items:[['stone',2],['stone',3],['iron',1]]},
 fire:{t:'{me}が かまどで {item}を やいておいてくれた。',items:[['yakiringo',1],['cookie',2]]},
 wind:{t:'{me}が かぜで きを ゆらして {item}を おとしてくれた。',items:[['apple',2],['peach',2],['orange',2],['pear',2],['branch',2]]},
 seek:{t:'{me}が じめんの なかから {item}を ほりあててきた！',items:[['oldcoin',1],['clay',2],['stone',2],['gem',1]]},
};
const DIARY_PER = {
 kuishinbo:['{me}は つまみぐいを しようとして… がまんしていた。 えらい！','{me}は おなかを ならしながら {name}の かえりを まっていた。'],
 nebosuke:['{me}は ずっと ベッドで おひるね していたみたい。','{me}は ひなたで まるくなって ねていた。'],
 amaenbo:['{me}は まどの そばで ずっと {name}を まっていた。','{me}は {name}の まくらを だいて ねていた。'],
 genki:['{me}は むらを 10しゅう も はしったらしい！','{me}は ほかの ぷちっこと おにごっこ していた。'],
 nonbiri:['{me}は ひなたぼっこ しながら くもを ながめていた。','{me}は いちにち のんびり すごしていた。'],
 kouki:['{me}は むらの はずれまで たんけんに いっていた。','{me}は ながれぼしを さがして そらを みていた。'],
 hazukashi:['{me}は こっそり おはなを つんで、 テーブルに かざってくれた。','{me}は ゲンじいさんに もじもじ あいさつ していた。'],
};
const DIARY_VIL = [
 {t:'パンじろうさんが やきたての クッキーを おいていってくれた。',item:['cookie',2]},
 {t:'ナナが かいがらを ポストに いれていった。',item:['shell_s',1]},
 {t:'ゲンじいが つりの かえりに よって、 くだものを わけてくれた。',item:['peach',1]},
 {t:'メリーさんが おはなの たねを とどけてくれた。',item:['seed_sun',2]},
];

// ---------------- gifts while walking ----------------
const GIFT_JOB = {till:[['clay',1],['seed_sun',1]],water:[['shell_s',1],['shell_l',1]],chop:[['branch',2],['wood',1]],smash:[['stone',2],['iron',1]],
 fire:[['yakiringo',1],['branch',1]],wind:[['apple',1],['orange',1],['peach',1],['pear',1]],seek:[['oldcoin',1],['gem',1],['clay',1]]};
const GIFT_RARE = [['gem',1],['starbit',1],['fossil',1],['f_ball',1],['f_yarn',1]];

// ---------------- omikuji ----------------
const OMIKUJI = [
 {k:'だいきち',w:8,luck:3,col:'#ff5a7a',t:['なにを しても うまく いく いちにち！ めずらしい であいが あるかも。','ほしが あなたに ほほえんでいます。 さいこうの いちにちに なるでしょう。']},
 {k:'ちゅうきち',w:20,luck:2,col:'#ff9a3a',t:['ぷちっこと こころが かよう ひ。 たくさん なでてあげましょう。','ちいさな しあわせが つぎつぎ やってくる ひ。']},
 {k:'きち',w:32,luck:1,col:'#5cb87a',t:['のんびり すごすと いいことが あります。','おさんぽ すると たのしい はっけんが あるかも。']},
 {k:'しょうきち',w:25,luck:1,col:'#5a9ae8',t:['いつもの ことを ていねいに。 それが いちばんの しあわせ。','あたたかい のみものを のむと うんきが あがります。']},
 {k:'すえきち',w:15,luck:0,col:'#a87ae8',t:['これから どんどん よく なる ひ。 あせらず いきましょう。','ゆっくり やすむと あしたが もっと たのしく なります。']},
];
const LUCKY_ITEM = ['りんご','ピンクの もの','まるい もの','あたたかい のみもの','ほしの もの','みどりの もの','ふわふわの もの','クッキー'];

// letter from the chief introducing toys
const TOY_LETTER = {from:'vil',sender:'そんちょう ハルさん',body:'{name}さんへ\n\nぷちっこたちは あそぶのが だいすきなの。\nおうちに おもちゃを おいてあげると、 るすの あいだも たのしく すごせるのよ。\nボールを ひとつ おくるわね。 つみきの つくりかたも かいておいたわ。\n\nそんちょう ハル',gift:'f_ball',n:1,recipe:'tsumiki'};
STORY[4].reward.recipes.push('petbed');
