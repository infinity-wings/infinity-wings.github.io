'use strict';

class InfinityAudioSystem{
 constructor(){
  this.ctx=null;this.master=null;this.musicBus=null;this.sfxBus=null;this.ready=false;this.lastPlayed=new Map();this.assetStopTimers=new WeakMap();
  this.bgmFadeFrame=0;this.bgmTarget=-1;this.bgmFadeMs=3000;this.lastBgmPlayAttempt=0;this.backgrounded=document.hidden;this.awaitingForegroundGesture=false;
  if(localStorage.getItem('iwAudioDefaults73')!=='applied'){localStorage.setItem('iwMusicVolume','.5');localStorage.setItem('iwSfxVolume','.5');localStorage.setItem('iwAudioDefaults73','applied')}
  this.prefs={
   music:localStorage.getItem('iwMusic')!=='off',
   sfx:localStorage.getItem('iwSfx')!=='off',
   musicVolume:this.readVolume('iwMusicVolume',.5),
   sfxVolume:this.readVolume('iwSfxVolume',.5)
  };
  this.assetPools={};this.assetIndexes={};this.prepareAudioAssets();
  this.bgm=this.createBgm('./assets/audio/bgm.mp3');
  this.unlock=this.unlock.bind(this);
  this.handleUnlockEvent=e=>{if(e?.type==='keydown'&&e.repeat)return;if(this.awaitingForegroundGesture){this.awaitingForegroundGesture=false;this.backgrounded=false}this.unlock();this.recover(true)};
  ['pointerdown','touchstart','keydown'].forEach(type=>window.addEventListener(type,this.handleUnlockEvent,{passive:true,once:false}));
  document.addEventListener('visibilitychange',()=>{if(document.hidden)this.enterBackground();else this.leaveBackground()});
  window.addEventListener('pagehide',()=>this.enterBackground(),{passive:true});
  window.addEventListener('pageshow',()=>this.leaveBackground(),{passive:true});
  window.addEventListener('blur',()=>{if(document.hidden)this.enterBackground()},{passive:true});
  window.addEventListener('focus',()=>{if(!document.hidden)this.leaveBackground()},{passive:true});
  window.addEventListener('online',()=>this.recover(),{passive:true});
  if(this.bgm){['canplay','loadeddata','ended','stalled'].forEach(type=>this.bgm.addEventListener(type,()=>this.syncState(),{passive:true}))}
  setInterval(()=>this.syncState(),500);
 }
 readVolume(key,fallback){const value=Number(localStorage.getItem(key));return Number.isFinite(value)?Math.max(0,Math.min(1,value)):fallback}
 createBgm(src){
  try{const audio=new Audio(src);audio.preload='auto';audio.loop=true;audio.playsInline=true;audio.volume=0;audio.load();return audio}catch(_){return null}
 }
 preparePool(name,src,count,volume){
  try{this.assetPools[name]=Array.from({length:count},()=>{const a=new Audio(src);a.preload='auto';a.loop=false;a.playsInline=true;a.dataset.baseVolume=String(volume);a.volume=volume*this.prefs.sfxVolume;a.load();return a});this.assetIndexes[name]=0;}catch(_){this.assetPools[name]=[];}
 }
 prepareAudioAssets(){
  const cannonVolume=.03;
  // Main cannon and drones share one short weapon pool. This prevents dozens of
  // overlapping HTMLAudio instances from turning the shot tail into a continuous tone.
  this.preparePool('weaponShot','./assets/audio/main-cannon.mp3',3,cannonVolume);
  this.preparePool('explosionLarge','./assets/audio/explosion-large.mp3',3,.24);
  this.preparePool('explosionSmall','./assets/audio/explosion-small.mp3',5,.14);
 }
 playAsset(name,volume,maxDuration=0){
  if(document.hidden||this.backgrounded||!this.prefs.sfx||this.prefs.sfxVolume<=0)return false;
  const pool=this.assetPools[name]||[];if(!pool.length)return false;
  const index=this.assetIndexes[name]||0,a=pool[index%pool.length];this.assetIndexes[name]=index+1;
  try{
   const previousTimer=this.assetStopTimers.get(a);if(previousTimer)clearTimeout(previousTimer);
   const base=Number.isFinite(volume)?volume:Number(a.dataset.baseVolume||.1);
   a.pause();a.loop=false;a.currentTime=0;a.volume=Math.max(0,Math.min(1,base*this.prefs.sfxVolume));
   const r=a.play();if(r&&typeof r.catch==='function')r.catch(()=>{});
   if(maxDuration>0){const timer=setTimeout(()=>{try{a.pause();a.currentTime=0}catch(_){}this.assetStopTimers.delete(a)},Math.ceil(maxDuration*1000));this.assetStopTimers.set(a,timer)}
   return true;
  }catch(_){return false}
 }
 unlock(){
  let created=false;
  if(!this.ctx){
   const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;
   this.ctx=new AC();this.master=this.ctx.createGain();this.musicBus=this.ctx.createGain();this.sfxBus=this.ctx.createGain();
   this.master.gain.value=.72;this.musicBus.gain.value=0;this.sfxBus.gain.value=.42*this.prefs.sfxVolume;
   this.musicBus.connect(this.master);this.sfxBus.connect(this.master);this.master.connect(this.ctx.destination);this.ready=true;created=true;
  }
  if(this.ctx.state==='suspended'){
   const resumed=this.ctx.resume();
   if(resumed&&typeof resumed.then==='function')resumed.then(()=>this.recover()).catch(()=>{});
   return;
  }
  if(created)this.recover();
 }
 enterBackground(){
  this.backgrounded=true;this.awaitingForegroundGesture=true;this.bgmTarget=0;
  if(this.bgmFadeFrame){cancelAnimationFrame(this.bgmFadeFrame);this.bgmFadeFrame=0}
  if(this.bgm){try{this.bgm.volume=0;this.bgm.pause()}catch(_){}}
  for(const audio of Object.values(this.assetPools).flat()){const timer=this.assetStopTimers.get(audio);if(timer)clearTimeout(timer);this.assetStopTimers.delete(audio);try{audio.pause();audio.loop=false;audio.currentTime=0}catch(_){}}
  if(this.ctx&&this.ctx.state==='running'){const suspended=this.ctx.suspend();if(suspended&&typeof suspended.catch==='function')suspended.catch(()=>{})}
 }
 leaveBackground(){
  if(document.hidden)return;this.backgrounded=false;this.awaitingForegroundGesture=true;
  if(this.bgm){this.bgm.volume=0;this.bgmTarget=0}
 }
 recover(fromGesture=false){
  if(document.hidden||this.backgrounded||this.awaitingForegroundGesture&&!fromGesture)return;
  if(this.ctx&&this.ctx.state==='suspended'){const resumed=this.ctx.resume();if(resumed&&typeof resumed.catch==='function')resumed.catch(()=>{})}
  this.bgmTarget=-1;
  this.syncState(true);
 }
 tryPlayBgm(force=false){
  if(!this.bgm||!this.shouldMusicPlay())return;
  const now=performance.now();if(!force&&now-this.lastBgmPlayAttempt<350)return;this.lastBgmPlayAttempt=now;
  try{const result=this.bgm.play();if(result&&typeof result.catch==='function')result.catch(()=>{})}catch(_){}
 }
 setEnabled(kind,value){this.prefs[kind]=Boolean(value);localStorage.setItem(kind==='music'?'iwMusic':'iwSfx',value?'on':'off');this.unlock();this.syncState()}
 setVolume(kind,value){
  const normalized=Math.max(0,Math.min(1,Number(value)||0));this.prefs[kind+'Volume']=normalized;
  localStorage.setItem(kind==='music'?'iwMusicVolume':'iwSfxVolume',String(normalized));
  if(kind==='music'&&this.bgm){const active=this.shouldMusicPlay();this.fadeBgmTo(active?this.musicTargetVolume():0,active?300:3000,!active)}
  if(kind==='sfx'){
   if(this.ready)this.sfxBus.gain.setTargetAtTime(.42*normalized,this.ctx.currentTime,.04);
   Object.values(this.assetPools).flat().forEach(a=>{a.volume=Math.max(0,Math.min(1,Number(a.dataset.baseVolume||.1)*normalized))});
  }
  this.unlock();this.syncState();
 }
 musicTargetVolume(){return Math.max(0,Math.min(1,this.prefs.musicVolume*.62))}
 shouldMusicPlay(){return this.prefs.music&&this.prefs.musicVolume>0&&!document.hidden&&!this.backgrounded&&!this.awaitingForegroundGesture&&typeof state!=='undefined'&&['menu','story','game','core','dying'].includes(state)}
 fadeBgmTo(target,duration=this.bgmFadeMs,pauseAtEnd=false){
  if(!this.bgm)return;target=Math.max(0,Math.min(1,target));
  if(Math.abs(this.bgmTarget-target)<.0005&&this.bgmFadeFrame)return;
  this.bgmTarget=target;if(this.bgmFadeFrame)cancelAnimationFrame(this.bgmFadeFrame);
  const startVolume=this.bgm.volume,start=performance.now(),span=Math.max(1,duration);
  if(target>0)this.tryPlayBgm(true)
  const step=now=>{const t=Math.min(1,(now-start)/span),eased=t*t*(3-2*t);this.bgm.volume=startVolume+(target-startVolume)*eased;
   if(t<1)this.bgmFadeFrame=requestAnimationFrame(step);else{this.bgmFadeFrame=0;this.bgm.volume=target;if(pauseAtEnd&&target<=.0001)this.bgm.pause();}
  };this.bgmFadeFrame=requestAnimationFrame(step);
 }
 syncState(force=false){
  const active=this.shouldMusicPlay();
  if(this.ready&&this.ctx)this.sfxBus.gain.setTargetAtTime(this.prefs.sfx?.42*this.prefs.sfxVolume:0,this.ctx.currentTime,.05);
  if(!this.bgm)return;
  const target=active?this.musicTargetVolume():0;
  if(active){
   this.tryPlayBgm(force||this.bgm.paused);
   if(force||this.bgm.paused||Math.abs(this.bgmTarget-target)>.0005||this.bgm.volume<=.0001)this.fadeBgmTo(target,this.bgm.volume<=.0001?this.bgmFadeMs:450,false);
  }else if(force||Math.abs(this.bgmTarget)>.0005||!this.bgm.paused)this.fadeBgmTo(0,this.bgmFadeMs,true);
 }
 canPlay(name,gap=.04){if(!this.ready||!this.prefs.sfx||this.prefs.sfxVolume<=0)return false;const now=performance.now()/1000,last=this.lastPlayed.get(name)||-99;if(now-last<gap)return false;this.lastPlayed.set(name,now);return true}
 tone(freq,duration=.1,type='sine',gain=.12,when=0,slide=0,bus=this.sfxBus){
  if(!this.ready)return;const t=this.ctx.currentTime+when,o=this.ctx.createOscillator(),g=this.ctx.createGain();o.type=type;o.frequency.setValueAtTime(freq,t);if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(20,freq+slide),t+duration);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(Math.max(.0002,gain),t+.008);g.gain.exponentialRampToValueAtTime(.0001,t+duration);o.connect(g);g.connect(bus);o.start(t);o.stop(t+duration+.03);
 }
 noise(duration=.14,gain=.08,when=0,filter=900){
  if(!this.ready)return;const len=Math.max(1,Math.floor(this.ctx.sampleRate*duration)),buffer=this.ctx.createBuffer(1,len,this.ctx.sampleRate),data=buffer.getChannelData(0);for(let i=0;i<len;i++)data[i]=(Math.random()*2-1)*(1-i/len);const src=this.ctx.createBufferSource(),f=this.ctx.createBiquadFilter(),g=this.ctx.createGain(),t=this.ctx.currentTime+when;src.buffer=buffer;f.type='lowpass';f.frequency.value=filter;g.gain.setValueAtTime(gain,t);g.gain.exponentialRampToValueAtTime(.0001,t+duration);src.connect(f);f.connect(g);g.connect(this.sfxBus);src.start(t);
 }
 play(name){
  if(document.hidden||this.backgrounded)return;this.unlock();
  const gateName=(name==='shot'||name==='droneShot')?'weaponShot':name;
  const gateGap=(gateName==='weaponShot')?.075:(name==='hit'?.09:.03);
  if(!this.canPlay(gateName,gateGap))return;
  if(name==='ui'){this.tone(720,.055,'square',.045);this.tone(1080,.045,'sine',.03,.035)}
  else if(name==='shot'||name==='droneShot'){if(!this.playAsset('weaponShot',.03,.11)){this.tone(1180,.045,'triangle',.007,0,-260);this.tone(760,.06,'sine',.0045,.008,-180)}}
  else if(name==='explosionSmall'){if(!this.playAsset('explosionSmall',.14)){this.noise(.22,.075,0,760);this.tone(125,.2,'sine',.05,0,-45)}}
  else if(name==='explosionLarge'){if(!this.playAsset('explosionLarge',.24)){this.noise(.5,.15,0,520);this.tone(80,.5,'sine',.11,0,-45)}}
  else if(name==='laser'){this.tone(180,.28,'sawtooth',.07,0,520);this.tone(680,.24,'sine',.05,.06,260)}
  else if(name==='missile'){this.noise(.18,.055,0,520);this.tone(150,.22,'sawtooth',.06,0,-70)}
  else if(name==='explosion'){if(!this.playAsset('explosionSmall',.14)){this.noise(.34,.12,0,580);this.tone(95,.32,'sine',.09,0,-55)}}
  else if(name==='thunder'){this.noise(.2,.10,0,2400);this.tone(72,.25,'square',.06,0,35)}
  else if(name==='shield'){this.tone(260,.22,'sine',.06);this.tone(520,.28,'sine',.07,.04,280)}
  else if(name==='pickup'){this.tone(660,.08,'sine',.05);this.tone(990,.11,'sine',.05,.07)}
  else if(name==='upgrade'){[392,523,659,784].forEach((f,i)=>this.tone(f,.16,'triangle',.055,i*.07))}
  else if(name==='awakening'){[196,294,392,587,784].forEach((f,i)=>this.tone(f,.28,'sawtooth',.05,i*.09,80));this.noise(.45,.05,.28,1600)}
  else if(name==='damage'){this.noise(.16,.09,0,1000);this.tone(130,.18,'square',.07,0,-60)}
  else if(name==='death'){this.noise(.75,.13,0,700);this.tone(180,.9,'sawtooth',.08,0,-130)}
  else if(name==='barrier'){this.tone(115,.45,'sine',.08);this.tone(230,.52,'triangle',.07,.05,500);this.noise(.22,.045,.08,2400)}
 }
}
const audioSystem=new InfinityAudioSystem();window.IWAudioSystem=audioSystem;
