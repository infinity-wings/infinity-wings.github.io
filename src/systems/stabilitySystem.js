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
 watchdogInterval:.4,
 recoveryCount:0,
 faultCount:0,
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
   player.tilt=Number.isFinite(player.tilt)?Math.max(-1,Math.min(1,player.tilt)):0;
   player.pitch=Number.isFinite(player.pitch)?Math.max(-1,Math.min(1,player.pitch)):0;
   player.visualY=Number.isFinite(player.visualY)?Math.max(-30,Math.min(30,player.visualY)):0;
  }
 },
 clearTransientEffects(){
  if(typeof particles!=='undefined'&&Array.isArray(particles))particles.length=0;
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
   if(typeof openPauseMenu==='function')openPauseMenu();
   else paused=true;
  }
  if(typeof last!=='undefined')last=performance.now();
 },
 resume(reason='foreground'){
  if(document.hidden)return;
  this.lifecycleEpoch++;
  this.lastLifecycleAt=performance.now();
  this.suspended=false;
  this.resumePending=true;
  this.resumeGraceFrames=3;
  this.resetInput();this.resetCanvas();this.clearTransientEffects();
  if(typeof last!=='undefined')last=performance.now();
  if(typeof mobilePerf!=='undefined'){
   mobilePerf.lastSample=performance.now();mobilePerf.sampleFrames=0;mobilePerf.frameMs=16.7;
   mobilePerf.slowFrames=0;mobilePerf.fastFrames=0;
  }
  this.watchdog(true);
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
  if(typeof hardSanitizeCombatState==='function'){
   try{hardSanitizeCombatState()}catch(error){this.faultCount++;console.warn('稳定性清理已降级',error)}
  }
  enemies=this.cleanPool(enemies,{margin:260,max:72});
  bullets=this.cleanPool(bullets,{margin:260,max:260});
  missiles=this.cleanPool(missiles,{margin:320,max:40});
  enemyBullets=this.cleanPool(enemyBullets,{margin:240,max:220});
  particles=this.cleanPool(particles,{margin:360,max:360,requireLife:true});
  pickups=this.cleanPool(pickups,{margin:180,max:120});
  drones=this.cleanPool(drones,{margin:180,max:8});
  if(typeof blastWaves!=='undefined'&&Array.isArray(blastWaves)){
   for(let i=blastWaves.length-1;i>=0;i--){const wave=blastWaves[i];if(!wave||!Number.isFinite(wave.x)||!Number.isFinite(wave.y)||!Number.isFinite(wave.life)||!Number.isFinite(wave.maxRadius))blastWaves.splice(i,1)}
   if(blastWaves.length>8)blastWaves.splice(0,blastWaves.length-8);
  }
  if(typeof lightningArcs!=='undefined'&&Array.isArray(lightningArcs)){
   for(let i=lightningArcs.length-1;i>=0;i--){const arc=lightningArcs[i];if(!arc||![arc.x1,arc.y1,arc.x2,arc.y2,arc.life].every(Number.isFinite))lightningArcs.splice(i,1)}
   if(lightningArcs.length>48)lightningArcs.splice(0,lightningArcs.length-48);
  }
  if(typeof enemyLasers!=='undefined'&&Array.isArray(enemyLasers)){
   for(let i=enemyLasers.length-1;i>=0;i--){const laser=enemyLasers[i];if(!laser||!Number.isFinite(laser.x)||!Number.isFinite(laser.y)||!Number.isFinite(laser.life))enemyLasers.splice(i,1)}
   if(enemyLasers.length>8)enemyLasers.splice(0,enemyLasers.length-8);
  }
  this.repairReferences();this.resetCanvas();
 }
};
window.IWStability=IWStability;

const suspendIW=()=>IWStability.suspend('lifecycle');
const resumeIW=()=>IWStability.resume('lifecycle');
document.addEventListener('visibilitychange',()=>document.hidden?suspendIW():resumeIW(),{passive:true});
window.addEventListener('pagehide',suspendIW,{passive:true});
window.addEventListener('pageshow',resumeIW,{passive:true});
window.addEventListener('freeze',suspendIW,{passive:true});
window.addEventListener('resume',resumeIW,{passive:true});
window.addEventListener('blur',()=>{if(document.hidden) suspendIW()},{passive:true});
window.addEventListener('focus',()=>{if(!document.hidden) resumeIW()},{passive:true});
