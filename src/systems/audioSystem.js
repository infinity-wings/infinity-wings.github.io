'use strict';

class InfinityAudioSystem{
 constructor(){
  this.ctx=null;this.master=null;this.musicBus=null;this.sfxBus=null;this.ready=false;
  this.lastPlayed=new Map();this.activeSources=new Set();this.buffers=new Map();this.loadingBuffers=new Map();
  this.bgmFadeFrame=0;this.bgmTarget=-1;this.bgmFadeMs=3000;this.lastBgmPlayAttempt=0;
  this.bgmSource=null;this.bgmStartedAt=0;this.bgmOffset=0;this.bgmGeneration=0;
  this.backgrounded=document.hidden;this.awaitingForegroundGesture=false;
  this.lifecycleToken=0;this.backgroundSuspendTimer=0;this.masterLevel=.72;
  this.deviceMix=this.detectDeviceMix();
  if(localStorage.getItem('iwAudioDefaults73')!=='applied'){
   localStorage.setItem('iwMusicVolume','.5');localStorage.setItem('iwSfxVolume','.5');localStorage.setItem('iwAudioDefaults73','applied');
  }
  this.prefs={
   music:localStorage.getItem('iwMusic')!=='off',
   sfx:localStorage.getItem('iwSfx')!=='off',
   musicVolume:this.readVolume('iwMusicVolume',.5),
   sfxVolume:this.readVolume('iwSfxVolume',.5)
  };
  this.assetUrls={
   bgm:'./assets/audio/bgm.mp3',
   weaponShot:'./assets/audio/main-cannon.mp3',
   droneShot:'./assets/audio/drone-shot.mp3',
   shieldHit:'./assets/audio/shield-hit.wav',
   shieldBreak:'./assets/audio/shield-break.wav',
   hullDamage:'./assets/audio/hull-damage.wav',
   explosionLarge:'./assets/audio/explosion-large.mp3',
   explosionSmall:'./assets/audio/explosion-small.mp3'
  };
  this.unlock=this.unlock.bind(this);
  this.handleUnlockEvent=e=>{
   if(e?.type==='keydown'&&e.repeat)return;
   if(this.awaitingForegroundGesture){this.awaitingForegroundGesture=false;this.backgrounded=false}
   this.unlock();this.recover(true);
  };
  ['pointerdown','touchstart','keydown'].forEach(type=>window.addEventListener(type,this.handleUnlockEvent,{passive:true}));
  document.addEventListener('visibilitychange',()=>document.hidden?this.enterBackground():this.leaveBackground());
  window.addEventListener('pagehide',()=>this.enterBackground(),{passive:true});
  window.addEventListener('pageshow',()=>this.leaveBackground(),{passive:true});
  window.addEventListener('blur',()=>{if(document.hidden)this.enterBackground()},{passive:true});
  window.addEventListener('focus',()=>{if(!document.hidden)this.leaveBackground()},{passive:true});
  this.syncTimer=setInterval(()=>this.syncState(),700);
 }
 detectDeviceMix(){
  const ua=navigator.userAgent||'';
  const iphone=/iPhone|iPod/i.test(ua);
  const androidPhone=/Android/i.test(ua)&&/Mobile/i.test(ua);
  const narrow=Math.min(window.innerWidth||9999,window.innerHeight||9999)<=600;
  const phone=iphone||androidPhone||narrow;
  const tablet=!phone&&(/iPad|Tablet/i.test(ua)||(/Macintosh/i.test(ua)&&navigator.maxTouchPoints>1));
  return phone?{sfx:.52,music:.72}:tablet?{sfx:.82,music:.88}:{sfx:1,music:1};
 }
 readVolume(key,fallback){const value=Number(localStorage.getItem(key));return Number.isFinite(value)?Math.max(0,Math.min(1,value)):fallback}
 async loadBuffer(name){
  if(this.buffers.has(name))return this.buffers.get(name);
  if(this.loadingBuffers.has(name))return this.loadingBuffers.get(name);
  const url=this.assetUrls[name];if(!url||!this.ctx)return null;
  const task=fetch(url,{cache:'force-cache'}).then(r=>{if(!r.ok)throw new Error('audio '+r.status);return r.arrayBuffer()}).then(data=>this.ctx.decodeAudioData(data)).then(buffer=>{this.buffers.set(name,buffer);this.loadingBuffers.delete(name);return buffer}).catch(()=>{this.loadingBuffers.delete(name);return null});
  this.loadingBuffers.set(name,task);return task;
 }
 preloadBuffers(){Object.keys(this.assetUrls).forEach(name=>this.loadBuffer(name));}
 unlock(){
  let created=false;
  if(!this.ctx){
   const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;
   this.ctx=new AC({latencyHint:'interactive'});this.master=this.ctx.createGain();this.musicBus=this.ctx.createGain();this.sfxBus=this.ctx.createGain();
   this.master.gain.value=this.masterLevel;this.musicBus.gain.value=0;this.sfxBus.gain.value=this.currentSfxGain();
   this.musicBus.connect(this.master);this.sfxBus.connect(this.master);this.master.connect(this.ctx.destination);this.ready=true;created=true;this.preloadBuffers();
  }
  if(this.ctx.state==='suspended'){
   const resumed=this.ctx.resume();if(resumed&&typeof resumed.then==='function')resumed.then(()=>{this.preloadBuffers();this.recover()}).catch(()=>{});return;
  }
  if(created)this.recover();
 }
 currentSfxGain(){return (this.prefs?.sfx?1:0)*.42*(this.prefs?.sfxVolume||0)*this.deviceMix.sfx}
 setMasterGain(target,duration=0){
  if(!this.ctx||!this.master)return;
  target=Math.max(0,Math.min(1,target));duration=Math.max(0,Number(duration)||0);
  const now=this.ctx.currentTime;
  try{
   const gain=this.master.gain,current=Number.isFinite(gain.value)?gain.value:this.masterLevel;
   gain.cancelScheduledValues(now);gain.setValueAtTime(current,now);
   if(duration>0)gain.linearRampToValueAtTime(target,now+duration);else gain.setValueAtTime(target,now);
  }catch(_){this.master.gain.value=target}
 }
 stopAllSfx(fadeSeconds=0){
  const stopAt=this.ctx?this.ctx.currentTime+Math.max(0,fadeSeconds):0;
  for(const source of [...this.activeSources]){
   try{
    if(fadeSeconds>0){
     const previous=source.onended;
     source.onended=event=>{try{previous?.call(source,event)}catch(_){}try{source.disconnect()}catch(_){}};
     source.stop(stopAt);
    }else{source.stop();source.disconnect()}
   }catch(_){}
   this.activeSources.delete(source);
  }
 }
 enterBackground(){
  if(this.backgrounded)return;
  this.backgrounded=true;this.awaitingForegroundGesture=true;
  const token=++this.lifecycleToken,fadeSeconds=.09;
  if(this.backgroundSuspendTimer){clearTimeout(this.backgroundSuspendTimer);this.backgroundSuspendTimer=0}
  this.setMasterGain(0,fadeSeconds);
  this.stopBgm(true,fadeSeconds);this.stopAllSfx(fadeSeconds);
  if('mediaSession' in navigator){try{navigator.mediaSession.playbackState='none'}catch(_){}}
  this.backgroundSuspendTimer=setTimeout(()=>{
   this.backgroundSuspendTimer=0;
   if(token!==this.lifecycleToken||!this.backgrounded||!this.ctx||this.ctx.state!=='running')return;
   const suspended=this.ctx.suspend();if(suspended&&typeof suspended.catch==='function')suspended.catch(()=>{});
  },125);
 }
 leaveBackground(){
  if(document.hidden||!this.backgrounded)return;
  this.backgrounded=false;this.awaitingForegroundGesture=true;++this.lifecycleToken;
  if(this.backgroundSuspendTimer){clearTimeout(this.backgroundSuspendTimer);this.backgroundSuspendTimer=0}
  this.setMasterGain(0,0);this.setMusicGain(0,true);
 }
 recover(fromGesture=false){
  if(document.hidden||this.backgrounded||(this.awaitingForegroundGesture&&!fromGesture))return;
  if(this.ctx&&this.ctx.state==='suspended'){
   const resumed=this.ctx.resume();if(resumed&&typeof resumed.then==='function')resumed.then(()=>{this.setMasterGain(this.masterLevel,.12);this.syncState(true)}).catch(()=>{});return;
  }
  this.setMasterGain(this.masterLevel,.12);this.syncState(true);
 }
 setEnabled(kind,value){this.prefs[kind]=Boolean(value);localStorage.setItem(kind==='music'?'iwMusic':'iwSfx',value?'on':'off');if(kind==='sfx'&&!value)this.stopAllSfx();if(kind==='music'&&!value)this.stopBgm(true);this.unlock();this.syncState(true)}
 setVolume(kind,value){
  const normalized=Math.max(0,Math.min(1,Number(value)||0));this.prefs[kind+'Volume']=normalized;
  localStorage.setItem(kind==='music'?'iwMusicVolume':'iwSfxVolume',String(normalized));
  if(kind==='music')this.setMusicGain(this.shouldMusicPlay()?this.musicTargetVolume():0,false);
  if(kind==='sfx'&&this.ready&&this.ctx)this.sfxBus.gain.setTargetAtTime(this.currentSfxGain(),this.ctx.currentTime,.035);
  this.unlock();this.syncState(true);
 }
 musicTargetVolume(){return Math.max(0,Math.min(1,this.prefs.musicVolume*.62*this.deviceMix.music))}
 shouldMusicPlay(){return this.prefs.music&&this.prefs.musicVolume>0&&!document.hidden&&!this.backgrounded&&!this.awaitingForegroundGesture&&typeof state!=='undefined'&&['menu','story','game','core','dying'].includes(state)}
 setMusicGain(target,immediate=false){
  if(!this.ready||!this.ctx||!this.musicBus)return;target=Math.max(0,Math.min(1,target));
  const now=this.ctx.currentTime;try{this.musicBus.gain.cancelScheduledValues(now);if(immediate)this.musicBus.gain.setValueAtTime(target,now);else{this.musicBus.gain.setValueAtTime(this.musicBus.gain.value,now);this.musicBus.gain.linearRampToValueAtTime(target,now+(target>0?.35:.22))}}catch(_){this.musicBus.gain.value=target}
 }
 async startBgm(force=false){
  if(!this.shouldMusicPlay()||!this.ctx||this.ctx.state!=='running')return;
  if(this.bgmSource){this.setMusicGain(this.musicTargetVolume());return}
  const buffer=await this.loadBuffer('bgm');if(!buffer||!this.shouldMusicPlay()||!this.ctx||this.ctx.state!=='running')return;
  if(this.bgmSource)this.stopBgm(false);
  const generation=++this.bgmGeneration,src=this.ctx.createBufferSource();src.buffer=buffer;src.loop=false;src.connect(this.musicBus);
  const offset=((this.bgmOffset%buffer.duration)+buffer.duration)%buffer.duration;this.bgmStartedAt=this.ctx.currentTime-offset;this.bgmSource=src;
  src.onended=()=>{if(this.bgmSource===src)this.bgmSource=null;if(generation!==this.bgmGeneration)return;this.bgmOffset=0;if(this.shouldMusicPlay())this.startBgm(true)};
  try{src.start(0,offset);this.setMusicGain(this.musicTargetVolume())}catch(_){if(this.bgmSource===src)this.bgmSource=null}
 }
 stopBgm(rememberPosition=true,fadeSeconds=0){
  if(this.bgmSource){
   if(rememberPosition&&this.ctx&&this.buffers.has('bgm')){const d=this.buffers.get('bgm').duration;this.bgmOffset=((this.ctx.currentTime-this.bgmStartedAt)%d+d)%d}
   const src=this.bgmSource;this.bgmSource=null;++this.bgmGeneration;
   try{
    if(fadeSeconds>0){
     src.onended=()=>{try{src.disconnect()}catch(_){}};
     src.stop(this.ctx.currentTime+fadeSeconds);
    }else{src.onended=null;src.stop();src.disconnect()}
   }catch(_){}
  }
  this.setMusicGain(0,fadeSeconds<=0);
 }
 syncState(force=false){
  if(document.hidden||this.backgrounded)return;
  if(this.ready&&this.ctx)this.sfxBus.gain.setTargetAtTime(this.currentSfxGain(),this.ctx.currentTime,.05);
  if(this.shouldMusicPlay())this.startBgm(false);else this.stopBgm(true);
 }
 canPlay(name,gap=.04){if(!this.ready||!this.prefs.sfx||this.prefs.sfxVolume<=0||document.hidden||this.backgrounded)return false;const now=performance.now()/1000,last=this.lastPlayed.get(name)||-99;if(now-last<gap)return false;this.lastPlayed.set(name,now);return true}
 playBuffer(name,{gain=.1,duration=0,rate=1}={}){
  if(!this.ready||!this.ctx||!this.buffers.has(name))return false;
  try{
   const src=this.ctx.createBufferSource(),g=this.ctx.createGain();src.buffer=this.buffers.get(name);src.loop=false;src.playbackRate.value=rate;
   g.gain.value=Math.max(0,Math.min(1,gain));src.connect(g);g.connect(this.sfxBus);this.activeSources.add(src);
   src.onended=()=>{this.activeSources.delete(src);try{src.disconnect();g.disconnect()}catch(_){}};
   const max=duration>0?Math.min(duration,src.buffer.duration):src.buffer.duration;src.start(0,0,max);return true;
  }catch(_){return false}
 }
 tone(freq,duration=.1,type='sine',gain=.12,when=0,slide=0,bus=this.sfxBus){
  if(!this.ready)return;const t=this.ctx.currentTime+when,o=this.ctx.createOscillator(),g=this.ctx.createGain();o.type=type;o.frequency.setValueAtTime(freq,t);if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(20,freq+slide),t+duration);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(Math.max(.0002,gain),t+.008);g.gain.exponentialRampToValueAtTime(.0001,t+duration);o.connect(g);g.connect(bus);this.activeSources.add(o);o.onended=()=>this.activeSources.delete(o);o.start(t);o.stop(t+duration+.03);
 }
 noise(duration=.14,gain=.08,when=0,filter=900){
  if(!this.ready)return;const len=Math.max(1,Math.floor(this.ctx.sampleRate*duration)),buffer=this.ctx.createBuffer(1,len,this.ctx.sampleRate),data=buffer.getChannelData(0);for(let i=0;i<len;i++)data[i]=(Math.random()*2-1)*(1-i/len);const src=this.ctx.createBufferSource(),f=this.ctx.createBiquadFilter(),g=this.ctx.createGain(),t=this.ctx.currentTime+when;src.buffer=buffer;f.type='lowpass';f.frequency.value=filter;g.gain.setValueAtTime(gain,t);g.gain.exponentialRampToValueAtTime(.0001,t+duration);src.connect(f);f.connect(g);g.connect(this.sfxBus);this.activeSources.add(src);src.onended=()=>this.activeSources.delete(src);src.start(t);
 }
 play(name){
  if(document.hidden||this.backgrounded)return;this.unlock();
  const gateName=name==='shot'?'weaponShot':name==='droneShot'?'droneShot':name;
  const gateGap=gateName==='weaponShot'?.085:gateName==='droneShot'?.11:(name==='hit'?.09:name==='shieldHit'?.1:name==='shieldBreak'?.18:name==='hullDamage'?.2:.03);if(!this.canPlay(gateName,gateGap))return;
  if(name==='ui'){this.tone(720,.055,'square',.045);this.tone(1080,.045,'sine',.03,.035)}
  else if(name==='shot'){
   if(!this.playBuffer('weaponShot',{gain:.05,duration:.072,rate:1.08})){this.loadBuffer('weaponShot');this.tone(1180,.045,'triangle',.012,0,-260);this.tone(760,.055,'sine',.007,.008,-180)}
  }
  else if(name==='droneShot'){
   if(!this.playBuffer('droneShot',{gain:.032,duration:.068,rate:1.12})){this.loadBuffer('droneShot');this.tone(940,.04,'triangle',.006,0,-180)}
  }
  else if(name==='explosionSmall'){if(!this.playBuffer('explosionSmall',{gain:.14,duration:.42})){this.loadBuffer('explosionSmall');this.noise(.22,.075,0,760);this.tone(125,.2,'sine',.05,0,-45)}}
  else if(name==='explosionLarge'){if(!this.playBuffer('explosionLarge',{gain:.24,duration:.8})){this.loadBuffer('explosionLarge');this.noise(.5,.15,0,520);this.tone(80,.5,'sine',.11,0,-45)}}
  else if(name==='laser'){this.tone(180,.28,'sawtooth',.07,0,520);this.tone(680,.24,'sine',.05,.06,260)}
  else if(name==='missile'){this.noise(.18,.055,0,520);this.tone(150,.22,'sawtooth',.06,0,-70)}
  else if(name==='explosion'){if(!this.playBuffer('explosionSmall',{gain:.14,duration:.42})){this.noise(.34,.12,0,580);this.tone(95,.32,'sine',.09,0,-55)}}
  else if(name==='thunder'){this.noise(.2,.10,0,2400);this.tone(72,.25,'square',.06,0,35)}
  else if(name==='shield'){this.tone(260,.22,'sine',.06);this.tone(520,.28,'sine',.07,.04,280)}
  else if(name==='shieldHit'){if(!this.playBuffer('shieldHit',{gain:.12})){this.loadBuffer('shieldHit');this.tone(480,.16,'sine',.05,0,-180)}}
  else if(name==='shieldBreak'){if(!this.playBuffer('shieldBreak',{gain:.2})){this.loadBuffer('shieldBreak');this.noise(.28,.08,0,2600);this.tone(720,.34,'triangle',.07,0,-420)}}
  else if(name==='hullDamage'){if(!this.playBuffer('hullDamage',{gain:.2})){this.loadBuffer('hullDamage');this.noise(.2,.1,0,850);this.tone(125,.24,'square',.075,0,-65)}}
  else if(name==='pickup'){this.tone(660,.08,'sine',.05);this.tone(990,.11,'sine',.05,.07)}
  else if(name==='upgrade'){[392,523,659,784].forEach((f,i)=>this.tone(f,.16,'triangle',.055,i*.07))}
  else if(name==='awakening'){[196,294,392,587,784].forEach((f,i)=>this.tone(f,.28,'sawtooth',.05,i*.09,80));this.noise(.45,.05,.28,1600)}
  else if(name==='damage'){this.noise(.16,.09,0,1000);this.tone(130,.18,'square',.07,0,-60)}
  else if(name==='death'){this.noise(.75,.13,0,700);this.tone(180,.9,'sawtooth',.08,0,-130)}
  else if(name==='barrier'){this.tone(115,.45,'sine',.08);this.tone(230,.52,'triangle',.07,.05,500);this.noise(.22,.045,.08,2400)}
 }
}
const audioSystem=new InfinityAudioSystem();window.IWAudioSystem=audioSystem;
