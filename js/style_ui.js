'use strict';
// ============================================================
//  おしゃれ UI: wardrobe, puchikko dress-up, photo, album,
//  series, house expansion
// ============================================================
const SUI=(()=>{
 const el=(...a)=>UI.el(...a);
 const $=s=>document.querySelector(s);
 const sw=(cols,cur,on)=>{const w=el('div','sw');cols.forEach(c=>{const b=el('button','swc'+(c===cur?' on':''));b.style.background=c;b.onclick=()=>on(c);w.append(b);});return w;};
 const chipRow=(list,cur,on)=>{const r=el('div','chips');list.forEach(([k,label,ok])=>{const b=el('button','chipb'+(k===cur?' on':''),label);b.disabled=ok===false;b.onclick=()=>on(k);r.append(b);});return r;};

 // ---------- player wardrobe ----------
 function wardrobe(){
  if(!S.look)S.look={outfit:'tee',style:'short',hat:null};const L=S.look;
  UI.panel('きがえ',body=>{
   const pv=el('div','prev');const draw=()=>{buildPlayer(S.shirt,S.hair,L);pv.innerHTML='';const c=scaled(_player.down[0],5);c.className='px';pv.append(c);const c2=scaled(_player.right[0],5);c2.className='px';pv.append(c2);};draw();body.append(pv);
   const re=()=>{draw();UI.hud();save();UI.closePanel(true);wardrobe();};
   body.append(el('div','note','ふく'));
   body.append(chipRow(Object.keys(OUTFITS).map(k=>[k,OUTFITS[k].name,k==='tee'||itemCount('o_'+k)>0]),L.outfit||'tee',k=>{L.outfit=k;Snd.sfx('pop');re();}));
   body.append(el('div','note','ふくの いろ'));body.append(sw(SHIRTS.concat(['#5a5a6a','#7ad0c0']),S.shirt,c=>{S.shirt=c;Snd.sfx('tap');re();}));
   body.append(el('div','note','かみがた'));body.append(chipRow(Object.keys(HAIRSTYLES).map(k=>[k,HAIRSTYLES[k]]),L.style||'short',k=>{L.style=k;Snd.sfx('pop');re();}));
   body.append(el('div','note','かみの いろ'));body.append(sw(HAIRS.concat(['#f4f0ff','#ff8ab0']),S.hair,c=>{S.hair=c;Snd.sfx('tap');re();}));
   body.append(el('div','note','ぼうし・かみかざり'));
   body.append(chipRow([[null,'なし']].concat(Object.keys(HATS).map(k=>[k,HATS[k].name,itemCount('h_'+k)>0])),L.hat||null,k=>{L.hat=k;Snd.sfx('pop');re();}));
   body.append(el('div','desc','ふくや ぼうしは にゃんこしょうてんの「ふく・こもの」で かえるよ。 かみがたと いろは いつでも かえられる。'));
  });}

 // ---------- puchikko dress-up ----------
 function monWear(m,back){
  UI.panel(`${m.name}の きせかえ`,body=>{
   const pv=el('div','prev');const c=scaled(monSpr(m.sp,monLook(m)).n,5);c.className='px';pv.append(c);body.append(pv);
   const re=()=>{save();UI.closePanel(true);monWear(m,back);};
   body.append(el('div','note','スカーフの いろ'));
   body.append(sw([S.shirt].concat(SCARF_COLS.filter(x=>x!==S.shirt)),m.scarfCol||S.shirt,col=>{m.scarfCol=col===S.shirt?null:col;Snd.sfx('tap');re();}));
   body.append(el('div','desc','いちばん ひだりは じぶんの ふくと おそろい。'));
   body.append(el('div','note','こもの'));
   const owned=Object.keys(WEAR).filter(k=>itemCount('w_'+k)>0||m.wear===k);
   const list=el('div','igrid');
   const none=el('button','icell'+(!m.wear?' sel':''),'なし');none.onclick=()=>{if(m.wear){addItem('w_'+m.wear);m.wear=null;Snd.sfx('close');re();}};list.append(none);
   owned.forEach(k=>{const b=el('button','icell'+(m.wear===k?' sel':''));b.append(UI.iconOf('w_'+k));if(m.wear!==k)b.append(el('span','cnt',itemCount('w_'+k)));
    b.onclick=()=>{if(m.wear===k)return;if(m.wear)addItem('w_'+m.wear);takeItem('w_'+k);m.wear=k;Snd.sfx('pop');UI.toast(`${m.name}に ${WEAR[k].name}を つけた！`,'w_'+k);re();};list.append(b);});
   body.append(list);if(!owned.length)body.append(el('div','desc','こものは にゃんこしょうてんの「ふく・こもの」で かえるよ。'));
   const b2=el('button','btn sub','もどる');b2.onclick=()=>{UI.closePanel(true);back?back():UI.nakama();};body.append(b2);
  });}

 // ---------- photo mode ----------
 function photo(){if(G.lock||!G.ready)return;G.lock++;
  arrangeForPhoto();const ov=el('div','catch photo');const box=el('div','cbox win');ov.append(box);$('#overlay').append(ov);
  box.innerHTML='<div class="ctitle">しゃしん</div><div class="cmsg">みんな あつまって〜！</div>';let t=3;
  const tick=()=>{if(t>0){box.querySelector('.cmsg').textContent=`${t}…`;Snd.sfx('tap');t--;setTimeout(tick,500);return;}
   box.querySelector('.cmsg').textContent='はい、 チーズ！';Snd.sfx('star');ov.classList.add('flash');setTimeout(()=>{ov.classList.remove('flash');editor(capturePhoto(),ov,box);},120);};
  setTimeout(tick,350);}
 function editor(src,ov,box){
  const W=src.width,H=src.height;let frame='polaroid',sel=null;const stamps=[];
  const out=mkCanvas(W,H);const oc=out.getContext('2d');
  const compose=()=>{oc.clearRect(0,0,W,H);oc.drawImage(src,0,0);for(const s of stamps){const im=stampSpr(s.k);oc.drawImage(im,Math.round(s.x-im.width/2),Math.round(s.y-im.height/2));}drawFrame(oc,W,H,frame);};
  box.innerHTML='<div class="ctitle">しゃしん</div>';const view=mkCanvas(W,H);view.className='pview';box.append(view);const vc=view.getContext('2d');
  const redraw=()=>{compose();vc.clearRect(0,0,W,H);vc.drawImage(out,0,0);};
  box.append(el('div','desc','フレーム'));const fr=el('div','chips');PHOTO_FRAMES.forEach(([k,l])=>{const b=el('button','chipb'+(k===frame?' on':''),l);b.onclick=()=>{frame=k;fr.querySelectorAll('.chipb').forEach(x=>x.classList.remove('on'));b.classList.add('on');redraw();};fr.append(b);});box.append(fr);
  box.append(el('div','desc','スタンプ（えらんで しゃしんを タップ）'));const st=el('div','chips');PHOTO_STAMPS.forEach(k=>{const b=el('button','chipb stamp');const im=scaled(stampSpr(k),2);im.className='px';b.append(im);b.onclick=()=>{sel=sel===k?null:k;st.querySelectorAll('.chipb').forEach(x=>x.classList.remove('on'));if(sel)b.classList.add('on');};st.append(b);});
  const undo=el('button','chipb','↶ もどす');undo.onclick=()=>{stamps.pop();redraw();};st.append(undo);box.append(st);
  view.onpointerdown=e=>{if(!sel)return;const r=view.getBoundingClientRect();stamps.push({k:sel,x:(e.clientX-r.left)/r.width*W,y:(e.clientY-r.top)/r.height*H});Snd.sfx('pop');redraw();};
  const btns=el('div','cbtns');
  const keep=el('button','btn gold','アルバムに のこす');keep.onclick=()=>{compose();if(!S.album)S.album=[];if(!S.album.length)addMemory('はじめて しゃしんを アルバムに のこした','album');S.album.unshift({d:dayKey(),img:out.toDataURL()});if(S.album.length>24)S.album.length=24;save();Snd.jingle('mail');UI.toast('アルバムに のこした！','album');keep.disabled=true;quest('photo');};
  const dl=el('button','btn','スマホに ほぞん');dl.onclick=()=>{compose();exportImage(out);};
  const cl=el('button','btn sub','とじる');cl.onclick=()=>{ov.remove();G.lock--;};
  btns.append(keep,dl,cl);box.append(btns);redraw();}
 function exportImage(c){const big=scaled(c,4);const url=big.toDataURL('image/png');const name=`pokapoka_${dayKey()}_${Date.now()%100000}.png`;
  const a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);try{a.click();}catch(e){}a.remove();
  const ov=el('div','catch');const box=el('div','cbox win');ov.append(box);const im=new Image();im.src=url;im.className='pbig';box.append(el('div','ctitle','しゃしん'));box.append(im);
  box.append(el('div','desc','ほぞん されない ときは、 しゃしんを ながおし して「しゃしんに ほぞん」を えらんでね。'));const b=el('button','btn','とじる');b.onclick=()=>ov.remove();box.append(b);$('#overlay').append(ov);}

 // ---------- album ----------
 function album(){UI.panel('アルバム',body=>{const A=S.album||[];
  if(!A.length){body.append(el('div','empty','まだ しゃしんが ないよ。<br>みぎの カメラ ボタンで とってみよう！'));return;}
  const g=el('div','agrid');A.forEach((p,i)=>{const b=el('button','acell');const im=new Image();im.src=p.img;im.className='px';b.append(im);b.append(el('span','desc',p.d.replace(/^\d+-/,'').replace('-','/')));
   b.onclick=()=>{const ov=el('div','catch');const box=el('div','cbox win');ov.append(box);const big=new Image();big.src=p.img;big.className='pbig px';box.append(big);
    const bs=el('div','cbtns');const sv=el('button','btn','スマホに ほぞん');sv.onclick=()=>{const c=mkCanvas(big.naturalWidth,big.naturalHeight);c.getContext('2d').drawImage(big,0,0);exportImage(c);};
    const del=el('button','btn danger','けす');del.onclick=async()=>{ov.remove();const ch=await UI.say('この しゃしんを けす？',{choices:['けさない','けす']});if(ch===1){A.splice(i,1);save();UI.closePanel(true);album();}};
    const cl=el('button','btn sub','とじる');cl.onclick=()=>ov.remove();bs.append(sv,del,cl);box.append(bs);$('#overlay').append(ov);};g.append(b);});body.append(g);});}

 // ---------- series ----------
 function series(){UI.panel('かぐの シリーズ',body=>{body.append(el('div','desc','おなじ シリーズの かぐを へやに おくと、 ボーナスが あるよ。'));
  for(const x of seriesState()){const r=el('div','qrow'+(x.done?' done':''));const icons=el('div','sicons');x.s.items.forEach(i=>{const im=UI.iconOf('f_'+i);if(!S.furniture.some(f=>f.id===i))im.classList.add('dim');icons.append(im);});
   r.append(el('div','qt',`${x.done?'✨ ':''}${x.s.name}　${x.have}/${x.s.need}`));r.append(icons);r.append(el('div','desc',x.s.bonus));body.append(r);}});}

 // ---------- house expansion (talk to chief) ----------
 async function houseTalk(o){const lv=S.houseLv||0;
  if(S.houseBuild){await UI.say('いま だいくさんたちが がんばって いるわ。 あしたには できあがるわよ。 たのしみに しててね。',o);return;}
  const nx=HOUSE_LV[lv+1];if(!nx){await UI.say('もう むらで いちばん ひろい おうちよ。 すてきに かざってね。',o);return;}
  const need=Object.keys(nx.need).map(k=>`${ITEMS[k].name}×${nx.need[k]}（${itemCount(k)}）`).join('、 ');
  const ok=S.coins>=nx.coins&&Object.keys(nx.need).every(k=>itemCount(k)>=nx.need[k]);
  const ch=await UI.say(`おうちを『${nx.name}』に ひろげるには、 ${nx.coins}ポカと ${need} が いるわ。`,Object.assign({},o,{choices:ok?['おねがいします','また こんど']:['また こんど']}));
  if(ok&&ch===0){addCoins(-nx.coins);for(const k in nx.need)takeItem(k,nx.need[k]);S.houseBuild={lv:lv+1,day:dayKey()};save();Snd.jingle('fanfare');
   await UI.say('まかせて！ あしたの あさには できあがっているはずよ。 おうちの なかの ものは そのままで だいじょうぶ。',o);}
  else if(!ok)await UI.say('ざいりょうが そろったら また きてね。 もくざいは もりの きから、 いしや てっこうせきは いわから とれるわ。',o);}

 return{wardrobe,monWear,photo,album,series,houseTalk,exportImage};
})();
