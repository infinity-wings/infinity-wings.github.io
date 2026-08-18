'use strict';

// Alpha 8.50 stability layer.
// Keeps simulation time, pooled entities and Canvas state safe across iPad/Safari
// lock-screen, app switching, page cache restores and long-running sessions.
const IWStability={
 suspended:document.hidden,
 autoPaused:false,
 resumePending:false,
 resumeGraceFrames:0,
 lifecycleEpoch:0,
 lastLifecycleAt:performance.now(),
 lastWatchdog:0,
 watchdogInterval:.75,
 recoveryCount:0,
 faultCount:0,
 canvasResetCount:0,
 canvasResetRequested:false,
 lastCanvasResetAt:0,
 resetCanvas(){
  if(typeof ctx==='undefined'||!ctx)return;
  try{
   ctx.setTransform(1,0,0,1,0,0);
   ctx.globalAlpha=1;
   ctx.globalCompositeOperation='source-over';
   ctx.shadowBlur=0;
   ctx.shadowColor='transparent';
   ctx.filter='none';
   ctx.setLineDash([]);
   ctx.lineWidth=1;
   ctx.lineCap='butt';
   ctx.lineJoin='miter';
  }catch(_){}
 },
 hardResetCanvas(reason='lifecycle'){
  if(typeof canvas==='undefined'||!canvas||typeof ctx==='undefined'||!ctx)return;
  const now=performance.now();
  if(now-this.lastCanvasResetAt<80){
   this.resetCanvas();
   return;
  }
  this.lastCanvasResetAt=now;
  try{
   // iPad Safari may keep a stale GPU-backed rotation matrix after the app
   // returns from the lock screen. Reassigning the backing-store dimensions
   // clears the complete state stack, not only the current transform.
   const width=canvas.width,height=canvas.height;
   canvas.width=width;
   canvas.height=height;
   this.canvasResetCount++;
   this.canvasResetRequested=false;
   this.resetCanvas();
   ctx.clearRect(0,0,width,height);
   ctx.fillStyle='#020712';
   ctx.fillRect(0,0,width,height);
   if(typeof enemyModelCtx!=='undefined')enemyModelCtx=ctx;
  }catch(error){
   this.faultCount++;
   console.warn('画布恢复已降级',reason,error);
   this.resetCanvas();
  }
 },
 requestCanvasReset(){
  this.canvasResetRequested=true;
 },
 beforeRender(){
  if(this.canvasResetRequested)this.hardResetCanvas('render-fault');
  this.resetCanvas();
 },
 sanitizePlayerPose(){
  if(typeof player==='undefined'||!player)return;
  const finite=(value,fallback=0)=>Number.isFinite(value)?value:fallback;
  const clamp=(value,min,max,fallback=0)=>Math.max(min,Math.min(max,finite(value,fallback)));
  player.x=clamp(player.x,24,W-24,W/2);
  player.y=clamp(player.y,55,H-SAFE_BOTTOM-35,H-SAFE_BOTTOM-90);
  player.r=clamp(player.r,4,28,10);
  player.vx=clamp(player.vx,-1200,1200,0);
  player.vy=clamp(player.vy,-1200,1200,0);
  player.targetVx=clamp(player.targetVx,-1200,1200,0);
  player.targetVy=clamp(player.targetVy,-1200,1200,0);
  player.tilt=clamp(player.tilt,-1,1,0);
  player.pitch=clamp(player.pitch,-1,1,0);
  player.thrust=clamp(player.thrust,0,1.35,.28);
  player.visualY=clamp(player.visualY,-30,30,0);
  player.recoil=clamp(player.recoil,0,2.5,0);
  player.inv=clamp(player.inv,0,999,0);
  player.slowTimer=clamp(player.slowTimer,0,12,0);
 },
 resetInput(){
  if(typeof joyX!=='undefined')joyX=0;
  if(typeof joyY!=='undefined')joyY=0;
  if(typeof touchMoveActive!=='undefined')touchMoveActive=false;
  if(typeof touchMovePointerId!=='undefined')touchMovePointerId=null;
  if(typeof mouseMoveActive!=='undefined')mouseMoveActive=false;
  if(typeof mouseDeltaX!=='undefined')mouseDeltaX=0;
  if(typeof mouseDeltaY!=='undefined')mouseDeltaY=0;
  if(typeof keys!=='undefined'&&keys)for(const key of Object.keys(keys))keys[key]=false;
  if(typeof player!=='undefined'&&player){
   player.vx=0;player.vy=0;player.targetVx=0;player.targetVy=0;
   this.sanitizePlayerPose();
  }
 },
 clearTransientEffects(){
  if(typeof particles!=='undefined'&&Array.isArray(particles))clearEntityArray(particles);
  if(typeof blastWaves!=='undefined'&&Array.isArray(blastWaves))blastWaves.length=0;
  if(typeof lightningArcs!=='undefined'&&Array.isArray(lightningArcs))lightningArcs.length=0;
  if(typeof coreEffects!=='undefined'&&coreEffects?.init){try{coreEffects.init()}catch(_){}}
 },
 suspend(reason='background'){
  this.lifecycleEpoch++;
  this.lastLifecycleAt=performance.now();
  this.resumePending=true;
  this.resumeGraceFrames=3;
  if(this.suspended){
   if(typeof last!=='undefined')last=performance.now();
   return;
  }
  this.suspended=true;
  this.resetInput();this.resetCanvas();
  if(typeof endTouchDrive==='function')endTouchDrive();
  if(typeof releaseMouseLock==='function')releaseMouseLock();
  if(typeof running!=='undefined'&&running&&typeof paused!=='undefined'&&!paused&&typeof state!=='undefined'&&state==='game'){
   this.autoPaused=true;
   if(typeof createRunCheckpoint==='function'){try{createRunCheckpoint()}catch(_){}}
   if(typeof openPauseMenu==='function')openPauseMenu();
   else paused=true;
  }
  if(typeof last!=='undefined')last=performance.now();
 },
 resume(reason='foreground'){
  if(document.hidden)return;
  const returningFromBackground=this.suspended;
  this.lifecycleEpoch++;
  this.lastLifecycleAt=performance.now();
  this.suspended=false;
  this.resumePending=true;
  this.resumeGraceFrames=Math.max(this.resumeGraceFrames,4);
  this.resetInput();
  if(returningFromBackground)this.hardResetCanvas(reason);
  else this.resetCanvas();
  this.clearTransientEffects();
  if(this.autoPaused&&typeof running!=='undefined'&&running&&typeof dying!=='undefined'&&!dying){
   if(typeof paused!=='undefined')paused=true;
   if(typeof state!=='undefined')state='pause';
   if(typeof UI!=='undefined'&&UI.pause&&typeof showScreen==='function')showScreen(UI.pause);
   if(typeof setSystemMenuVisible==='function')setSystemMenuVisible(false);
  }
  if(typeof last!=='undefined')last=performance.now();
  if(typeof mobilePerf!=='undefined'){
   mobilePerf.lastSample=performance.now();mobilePerf.sampleFrames=0;mobilePerf.frameMs=16.7;
   mobilePerf.slowFrames=0;mobilePerf.fastFrames=0;mobilePerf.thermalPressure=Math.max(0,(mobilePerf.thermalPressure||0)-2);
   mobilePerf.quality=Math.max(.9,Number(mobilePerf.quality)||1);
  }
  this.watchdog(true);
 },
 prepareGameplayResume(){
  this.suspended=false;
  this.resumePending=true;
  this.resumeGraceFrames=Math.max(this.resumeGraceFrames,4);
  this.resetInput();
  this.clearTransientEffects();
  this.hardResetCanvas('continue-game');
  this.watchdog(true);
  this.autoPaused=false;
  if(typeof last!=='undefined')last=performance.now();
 },
 consumeFrameGuard(rawDt){
  if(this.suspended||document.hidden)return true;
  if(!Number.isFinite(rawDt)||rawDt<0||rawDt>.12){
   this.resumeGraceFrames=Math.max(this.resumeGraceFrames,2);
   return true;
  }
  if(this.resumePending||this.resumeGraceFrames>0){
   this.resumeGraceFrames=Math.max(0,this.resumeGraceFrames-1);
   if(this.resumeGraceFrames===0)this.resumePending=false;
   return true;
  }
  return false;
 },
 validPoint(item,margin=400){
  return !!item&&Number.isFinite(item.x)&&Number.isFinite(item.y)&&Math.abs(item.x)<W+margin&&Math.abs(item.y)<H+margin;
 },
 cleanPool(pool,{margin=400,max=500,requireLife=false}={}){
  if(!Array.isArray(pool))return [];
  for(let i=pool.length-1;i>=0;i--){
   const item=pool[i];
   const wrongRun=item&&item._iwRun!=null&&item._iwRun!==runGeneration;
   const badLife=requireLife&&item&&!Number.isFinite(item.life);
   if(!this.validPoint(item,margin)||wrongRun||badLife){
    if(item&&typeof item==='object')item._iwAlive=false;
    pool.splice(i,1);continue;
   }
   item._iwRun=runGeneration;item._iwAlive=true;
  }
  if(pool.length>max){
   const removed=pool.splice(0,pool.length-max);removed.forEach(item=>{if(item)item._iwAlive=false});
  }
  return pool;
 },
 repairReferences(){
  const enemySet=new Set(typeof enemies!=='undefined'&&Array.isArray(enemies)?enemies:[]);
  for(const missile of typeof missiles!=='undefined'&&Array.isArray(missiles)?missiles:[]){
   if(missile.target&&!enemySet.has(missile.target))missile.target=null;
  }
  const pools=[
   typeof bullets!=='undefined'?bullets:null,
   typeof enemyBullets!=='undefined'?enemyBullets:null,
   typeof particles!=='undefined'?particles:null,
   typeof pickups!=='undefined'?pickups:null,
   typeof drones!=='undefined'?drones:null
  ];
  for(const pool of pools){
   if(!Array.isArray(pool))continue;
   for(const item of pool){
    if(item?.target&&!enemySet.has(item.target))item.target=null;
    if(item?.owner&&item.owner._iwRun!=null&&item.owner._iwRun!==runGeneration)item.owner=null;
   }
  }
 },
 watchdog(force=false){
  const now=performance.now()/1000;
  if(!force&&now-this.lastWatchdog<this.watchdogInterval)return;
  this.lastWatchdog=now;
  if(typeof player==='undefined'||!player)return;
  const badPlayer=!Number.isFinite(player.x)||!Number.isFinite(player.y)||Math.abs(player.x)>W+500||Math.abs(player.y)>H+500;
  if(badPlayer){
   player.x=W/2;player.y=H-SAFE_BOTTOM-75;player.vx=0;player.vy=0;player.targetVx=0;player.targetVy=0;
   player.tilt=0;player.pitch=0;player.visualY=0;
   this.recoveryCount++;
  }
  this.sanitizePlayerPose();
  if(typeof shake!=='undefined')shake=Number.isFinite(shake)?Math.max(0,Math.min(32,shake)):0;
  if(typeof hardSanitizeCombatState==='function'){
   try{hardSanitizeCombatState()}catch(error){this.faultCount++;console.warn('稳定性清理已降级',error)}
  }
  enemies=this.cleanPool(enemies,{margin:260,max:72});
  bullets=this.cleanPool(bullets,{margin:260,max:260});
  missiles=this.cleanPool(missiles,{margin:320,max:40});
  enemyBullets=this.cleanPool(enemyBullets,{margin:240,max:typeof enemyBulletLimit==='function'?enemyBulletLimit():220});
  const stabilityQuality=typeof mobilePerf!=='undefined'&&mobilePerf.enabled?mobilePerf.quality:1;
  particles=this.cleanPool(particles,{margin:360,max:Math.round(170+190*stabilityQuality),requireLife:true});
  pickups=this.cleanPool(pickups,{margin:180,max:120});
  drones=this.cleanPool(drones,{margin:180,max:8});
  if(typeof blastWaves!=='undefined'&&Array.isArray(blastWaves)){
   for(let i=blastWaves.length-1;i>=0;i--){const wave=blastWaves[i];if(!wave||!Number.isFinite(wave.x)||!Number.isFinite(wave.y)||!Number.isFinite(wave.life)||!Number.isFinite(wave.maxRadius))blastWaves.splice(i,1)}
   if(blastWaves.length>8)blastWaves.splice(0,blastWaves.length-8);
  }
  if(typeof lightningArcs!=='undefined'&&Array.isArray(lightningArcs)){
   for(let i=lightningArcs.length-1;i>=0;i--){const arc=lightningArcs[i];if(!arc||![arc.x1,arc.y1,arc.x2,arc.y2,arc.life].every(Number.isFinite))lightningArcs.splice(i,1)}
   const arcCap=Math.round(20+28*(typeof mobilePerf!=='undefined'&&mobilePerf.enabled?mobilePerf.quality:1));if(lightningArcs.length>arcCap)lightningArcs.splice(0,lightningArcs.length-arcCap);
  }
  if(typeof enemyLasers!=='undefined'&&Array.isArray(enemyLasers)){
   for(let i=enemyLasers.length-1;i>=0;i--){const laser=enemyLasers[i];if(!laser||!Number.isFinite(laser.x)||!Number.isFinite(laser.y)||!Number.isFinite(laser.life))enemyLasers.splice(i,1)}
   if(enemyLasers.length>8)enemyLasers.splice(0,enemyLasers.length-8);
  }
  this.repairReferences();this.resetCanvas();
 }
};
window.IWStability=IWStability;

const suspendIW=event=>IWStability.suspend(event?.type||'lifecycle');
const resumeIW=event=>IWStability.resume(event?.type||'lifecycle');
document.addEventListener('visibilitychange',event=>document.hidden?suspendIW(event):resumeIW(event),{passive:true});
window.addEventListener('pagehide',suspendIW,{passive:true});
window.addEventListener('pageshow',resumeIW,{passive:true});
window.addEventListener('freeze',suspendIW,{passive:true});
window.addEventListener('resume',resumeIW,{passive:true});
window.addEventListener('blur',()=>suspendIW({type:'window-blur'}),{passive:true});
window.addEventListener('focus',()=>{if(!document.hidden&&IWStability.suspended) resumeIW()},{passive:true});
canvas?.addEventListener?.('contextlost',event=>{event.preventDefault?.();IWStability.suspend('context-lost')},{passive:false});
canvas?.addEventListener?.('contextrestored',()=>IWStability.resume('context-restored'),{passive:true});
