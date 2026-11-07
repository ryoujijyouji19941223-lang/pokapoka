'use strict';
// ============================================================
//  chiptune engine (WebAudio)
// ============================================================
const Snd = (()=>{
 let ac=null,master,lp,bgmBus,sfxBus,delay,fb,wet,noiseBuf,pw={},rainNode=null,rainGain=null;
 let bgmOn=false,sfxOn=false;const tracks=[];let curName=null;let wanted=null;
 const NOTE={C:0,'C#':1,Db:1,D:2,'D#':3,Eb:3,E:4,F:5,'F#':6,Gb:6,G:7,'G#':8,Ab:8,A:9,'A#':10,Bb:10,B:11};
 function midi(n){const m=/^([A-G](?:#|b)?)(\d)$/.exec(n);if(!m)return 60;return 12*(+m[2]+1)+NOTE[m[1]];}
 const hz=m=>440*Math.pow(2,(m-69)/12);
 function chordTones(ch){const m=/^([A-G](?:#|b)?)(m?)/.exec(ch);const root=NOTE[m[1]];const minor=m[2]==='m';return{root,ints:[0,minor?3:4,7,12]};}
 function mkPulse(d){const n=48,re=new Float32Array(n),im=new Float32Array(n);for(let i=1;i<n;i++)re[i]=(2/(i*Math.PI))*Math.sin(i*Math.PI*d);return ac.createPeriodicWave(re,im);}
 function init(){
  if(ac){if(ac.state==='suspended')ac.resume();return;}
  const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;ac=new AC();
  master=ac.createGain();master.gain.value=0.85;master.connect(ac.destination);
  lp=ac.createBiquadFilter();lp.type='lowpass';lp.frequency.value=18000;lp.connect(master);
  bgmBus=ac.createGain();bgmBus.gain.value=bgmOn?0.55:0;bgmBus.connect(lp);
  delay=ac.createDelay(1);delay.delayTime.value=0.33;fb=ac.createGain();fb.gain.value=0.32;wet=ac.createGain();wet.gain.value=0;
  bgmBus.connect(wet);wet.connect(delay);delay.connect(fb);fb.connect(delay);delay.connect(lp);
  sfxBus=ac.createGain();sfxBus.gain.value=sfxOn?0.6:0;sfxBus.connect(master);
  pw.p25=mkPulse(0.25);pw.p12=mkPulse(0.125);
  noiseBuf=ac.createBuffer(1,ac.sampleRate,ac.sampleRate);const d=noiseBuf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
  const s=ac.createBufferSource();s.buffer=ac.createBuffer(1,1,22050);s.connect(master);s.start(0);
  setInterval(sched,25);
  if(wanted)play(wanted);
 }
 function osc(dest,wave,f,t,dur,vol,o={}){
  const os=ac.createOscillator(),g=ac.createGain();
  if(wave==='p25'||wave==='p12')os.setPeriodicWave(pw[wave]);else os.type=wave==='p50'?'square':wave==='tri'?'triangle':wave;
  os.frequency.setValueAtTime(f,t);if(o.slide)os.frequency.exponentialRampToValueAtTime(o.slide,t+dur);
  if(o.vib){const l=ac.createOscillator(),lg=ac.createGain();l.frequency.value=5;lg.gain.value=f*0.01;l.connect(lg);lg.connect(os.frequency);l.start(t+0.15);l.stop(t+dur+0.3);}
  const a=o.att||0.006,rel=o.rel||0.05;g.gain.setValueAtTime(0.0001,t);g.gain.linearRampToValueAtTime(vol,t+a);
  g.gain.exponentialRampToValueAtTime(Math.max(0.0002,vol*(o.sus||0.5)),t+Math.max(a+0.01,dur));g.gain.linearRampToValueAtTime(0.0001,t+dur+rel);
  os.connect(g);g.connect(dest);os.start(t);os.stop(t+dur+rel+0.05);
 }
 function noise(dest,t,dur,vol,type,freq,q=1){const s=ac.createBufferSource();s.buffer=noiseBuf;const f=ac.createBiquadFilter();f.type=type;f.frequency.value=freq;f.Q.value=q;const g=ac.createGain();
  g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(0.0001,t+dur);s.connect(f);f.connect(g);g.connect(dest);s.start(t,Math.random()*0.5);s.stop(t+dur+0.02);}
 function compile(def){const lead=def.notes.replace(/\|/g,' ').trim().split(/\s+/);const bars=def.chords.length;while(lead.length<bars*8)lead.push('.');return{...def,leadArr:lead,len:bars*8};}
 const compiled={};
 function play(name){
  wanted=name;if(!ac||!bgmOn)return;if(curName===name)return;curName=name;
  const now=ac.currentTime;
  for(const tr of tracks){if(!tr.dead){tr.dead=true;tr.gain.gain.cancelScheduledValues(now);tr.gain.gain.setValueAtTime(tr.gain.gain.value,now);tr.gain.gain.linearRampToValueAtTime(0.0001,now+0.9);tr.deadAt=now+1;}}
  if(!name)return;const def=compiled[name]||(compiled[name]=compile(MUSIC[name]));
  const g=ac.createGain();g.gain.setValueAtTime(0.0001,now);g.gain.linearRampToValueAtTime(1,now+0.8);g.connect(bgmBus);
  wet.gain.setTargetAtTime(def.echo?0.35:0.08,now,0.3);
  tracks.push({def,gain:g,step:0,next:now+0.1,sd:60/def.bpm/2,dead:false});
 }
 function sched(){
  if(!ac)return;const now=ac.currentTime;
  for(const tr of tracks){while(tr.next<now+0.15){if(!tr.dead||now<tr.deadAt)step(tr,tr.step,tr.next);const sw=tr.def.swing*tr.sd;tr.next+=tr.sd+((tr.step%2===0)?sw:-sw);tr.step=(tr.step+1)%tr.def.len;}}
  for(let i=tracks.length-1;i>=0;i--)if(tracks[i].dead&&now>tracks[i].deadAt+0.2){tracks[i].gain.disconnect();tracks.splice(i,1);}
 }
 function step(tr,i,t){
  const d=tr.def,s=i%8,bar=Math.floor(i/8),sd=tr.sd,out=tr.gain;const ch=chordTones(d.chords[bar%d.chords.length]);
  const tok=d.leadArr[i];
  if(tok&&tok!=='.'&&tok!=='-'){let len=1;while(len<16&&d.leadArr[(i+len)%d.len]==='-')len++;osc(out,d.lead,hz(midi(tok)),t,len*sd*0.9,d.lv,{vib:d.vib&&len>=3,sus:d.lead==='sine'?0.35:0.55,rel:d.lead==='sine'?0.25:0.05});}
  const r3=48+ch.root;const bv=0.3;
  const B=(m,len)=>osc(out,'tri',hz(m),t,len*sd*0.85,bv,{sus:0.7});
  switch(d.bass){
   case 'bounce':if(s===0||s===4)B(r3,1.5);if(s===2||s===6)B(r3+7,1.5);break;
   case 'walk':{const seq=[0,ch.ints[1],7,ch.ints[1]];if(s%2===0)B(r3+seq[s/2],1.6);break;}
   case 'half':if(s===0)B(r3,3.8);if(s===4)B(r3+7,3.8);break;
   case 'long':if(s===0)B(r3,7.5);break;
   case 'eighth':B(r3+(s%2?12:0),0.8);break;
  }
  const a5=72+ch.root;const av=0.045;
  switch(d.arp){
   case 'up':osc(out,'p12',hz(a5+ch.ints[s%4]),t,sd*0.5,av);break;
   case 'down':osc(out,'p12',hz(a5+ch.ints[3-(s%4)]),t,sd*0.6,av);break;
   case 'broken':if(s%2===0)osc(out,'tri',hz(a5+[0,7,12,ch.ints[1]+12][(s/2)%4]),t,sd*1.6,0.07,{sus:0.3,rel:0.3});break;
  }
  switch(d.drums){
   case 'pop':if(s===0||s===4)kick(out,t);if(s===2||s===6)snare(out,t);if(s%2)noise(out,t,0.03,0.06,'highpass',7000);break;
   case 'light':if(s===0)kick(out,t,0.35);if(s===2||s===6)noise(out,t,0.04,0.05,'highpass',7000);if(s===4)snare(out,t,0.12);break;
   case 'soft':if(s===0)kick(out,t,0.25);if(s===2||s===6)noise(out,t,0.035,0.035,'highpass',8000);break;
  }
 }
 function kick(out,t,v=0.5){osc(out,'sine',150,t,0.12,v,{slide:45,sus:0.2});}
 function snare(out,t,v=0.2){noise(out,t,0.12,v,'bandpass',1800,0.8);}
 // ---- sfx ----
 const T=()=>ac.currentTime;
 function sfx(name,arg){
  if(!ac||!sfxOn)return;const t=T(),o=sfxBus;
  switch(name){
   case 'tap':osc(o,'p25',1046,t,0.035,0.1);break;
   case 'step':noise(o,t,0.03,0.03,'lowpass',900);break;
   case 'coin':osc(o,'p25',988,t,0.06,0.16);osc(o,'p25',1319,t+0.06,0.22,0.16);break;
   case 'get':['C5','E5','G5','C6'].forEach((n,i)=>osc(o,'p25',hz(midi(n)),t+i*0.06,0.08,0.14));break;
   case 'hit':osc(o,'p25',600,t,0.12,0.18,{slide:1300});osc(o,'tri',hz(midi('C6')),t+0.05,0.15,0.2);break;
   case 'miss':osc(o,'p50',220,t,0.22,0.08,{slide:110});break;
   case 'rustle':noise(o,t,0.25,0.12,'bandpass',2500,0.6);noise(o,t+0.12,0.2,0.1,'bandpass',3200,0.6);break;
   case 'rock':osc(o,'sine',140,t,0.1,0.4,{slide:60});noise(o,t,0.12,0.2,'lowpass',1200);break;
   case 'dig':noise(o,t,0.1,0.2,'lowpass',800);noise(o,t+0.15,0.1,0.2,'lowpass',700);break;
   case 'door':osc(o,'tri',hz(midi('G4')),t,0.08,0.25);osc(o,'tri',hz(midi('C5')),t+0.08,0.12,0.25);break;
   case 'open':osc(o,'p25',hz(midi('E6')),t,0.04,0.08);osc(o,'p25',hz(midi('A6')),t+0.04,0.05,0.08);break;
   case 'close':osc(o,'p25',hz(midi('A6')),t,0.04,0.08);osc(o,'p25',hz(midi('E6')),t+0.04,0.05,0.08);break;
   case 'voice':{const p=(arg||300)*(0.85+Math.random()*0.4);osc(o,'p50',p,t,0.04,0.035,{slide:p*(Math.random()<0.5?1.15:0.9)});break;}
   case 'pet':osc(o,'sine',hz(midi('A5')),t,0.08,0.2,{slide:hz(midi('E6'))});osc(o,'sine',hz(midi('E6')),t+0.1,0.12,0.15);break;
   case 'water':noise(o,t,0.35,0.12,'bandpass',4000,1.5);break;
   case 'stamp':osc(o,'sine',90,t,0.12,0.4,{slide:50});osc(o,'p25',hz(midi('C6')),t+0.1,0.15,0.12);break;
   case 'buy':osc(o,'p25',hz(midi('A5')),t,0.05,0.12);osc(o,'p25',hz(midi('E6')),t+0.05,0.15,0.12);break;
   case 'star':for(let i=0;i<6;i++)osc(o,'sine',hz(midi('C7'))*(1+i*0.12),t+i*0.05,0.12,0.06);break;
   case 'pop':osc(o,'sine',400,t,0.06,0.2,{slide:900});break;
   case 'chop':for(let i=0;i<2;i++){osc(o,'tri',320,t+i*0.16,0.06,0.3,{slide:180});noise(o,t+i*0.16,0.05,0.18,'bandpass',1800,1);}break;
   case 'craft':for(let i=0;i<3;i++){osc(o,'p25',hz(midi(['E5','G5','C6'][i])),t+i*0.11,0.05,0.12);noise(o,t+i*0.11,0.03,0.12,'highpass',3000);}break;
   case 'lvup':['C5','E5','G5','C6','E6'].forEach((n,i)=>osc(o,'p25',hz(midi(n)),t+i*0.07,0.1,0.13));break;
  }
 }
 function jingle(name){
  if(!ac||!sfxOn)return;const seq=JINGLES[name];let t=T()+0.02;const sd=0.085;
  if(bgmOn){bgmBus.gain.cancelScheduledValues(t);bgmBus.gain.setTargetAtTime(0.12,t,0.05);}
  let total=0;for(const[n,l]of seq){osc(sfxBus,name==='chime'?'sine':'p25',hz(midi(n)),t,l*sd*0.95,name==='chime'?0.22:0.14,{sus:name==='chime'?0.3:0.6,rel:name==='chime'?0.6:0.06});
   osc(sfxBus,'tri',hz(midi(n)-12),t,l*sd*0.9,0.12);t+=l*sd;total+=l*sd;}
  if(bgmOn)bgmBus.gain.setTargetAtTime(0.55,T()+total+0.3,0.3);
 }
 function setRain(on){if(!ac)return;if(on&&!rainNode){rainNode=ac.createBufferSource();rainNode.buffer=noiseBuf;rainNode.loop=true;const f=ac.createBiquadFilter();f.type='bandpass';f.frequency.value=1400;f.Q.value=0.4;
   rainGain=ac.createGain();rainGain.gain.value=0;rainNode.connect(f);f.connect(rainGain);rainGain.connect(master);rainNode.start();}
  if(rainGain)rainGain.gain.setTargetAtTime(on&&bgmOn?0.05:0,T(),0.5);
  lp.frequency.setTargetAtTime(on?2600:18000,T(),0.5);}
 function setBGM(on){bgmOn=on;if(!ac)return;bgmBus.gain.setTargetAtTime(on?0.55:0,T(),0.1);if(on){const w=wanted;curName=null;play(w);}else{curName=null;for(const tr of tracks){tr.dead=true;tr.deadAt=T();}} if(rainGain&&!on)rainGain.gain.value=0;}
 function setSFX(on){sfxOn=on;if(ac)sfxBus.gain.value=on?0.6:0;}
 let calm=false;function setCalm(on){calm=on;if(!ac)return;master.gain.setTargetAtTime(on?0.5:0.85,T(),0.5);lp.frequency.setTargetAtTime(on?2600:18000,T(),0.5);}
 return {setCalm,init,play,sfx,jingle,setRain,setBGM,setSFX,get bgm(){return bgmOn;},get sfxOn(){return sfxOn;}};
})();
