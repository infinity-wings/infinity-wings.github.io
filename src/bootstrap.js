'use strict';
const $=s=>document.querySelector(s);
const canvas=$('#game'),ctx=canvas.getContext('2d');
const W=canvas.width,H=canvas.height,SAFE_BOTTOM=120;
const UI={
 boot:$('#bootScreen'),menu:$('#menuScreen'),story:$('#storyScreen'),core:$('#coreScreen'),hangar:$('#hangarScreen'),archive:$('#archiveScreen'),settings:$('#settingsScreen'),death:$('#deathScreen'),pause:$('#pauseScreen'),chapterComplete:$('#chapterCompleteScreen'),migration:$('#migrationScreen'),
 hud:$('#hud'),timerPanel:$('#topTimer'),touch:$('#touchControls'),toast:$('#toast'),threatFlash:$('#threatFlash'),
 hpText:$('#hpText'),hpFill:$('#hpFill'),xpFill:$('#xpFill'),score:$('#scoreText'),level:$('#levelText'),threat:$('#threatText'),timer:$('#timerText'),
 barrierBox:$('#barrierBox'),barrierCount:$('#barrierCount'),barrierChargeFill:$('#barrierChargeFill'),barrierCores:$('#barrierCores'),touchBarrierCount:$('#touchBarrierCount'),touchBarrierCores:$('#touchBarrierCores'),bombButton:$('#bombButton'),systemMenuButton:$('#systemMenuButton')
};
const THREAT_ROMAN=['Ⅰ','Ⅱ','Ⅲ','Ⅳ','Ⅴ','Ω'];
const keys={};
let state='boot',running=false,paused=false,last=0,elapsed=0,spawnCd=0,bossSpawned=false,shake=0,joyX=0,joyY=0;
let runGeneration=0;
let touchMoveActive=false,touchMovePointerId=null,touchTargetX=0,touchTargetY=0;
let mouseMoveActive=false,mouseTargetX=W/2,mouseTargetY=H-SAFE_BOTTOM-75,mouseDeltaX=0,mouseDeltaY=0;
let dying=false,deathTimer=0,deathFade=0,coreSelection=0,currentCorePool=[];
let player,bullets,missiles,enemies,enemyBullets,enemyLasers,particles,blastWaves,lightningArcs,drones,pickups,score,level,xp,nextXp,bombs,build,rewindHistory,projectionHistory,pilotId;

class EntityObjectPool{
 constructor(name,{initial=0,growBy=16,maxFree=512}={}){this.name=name;this.growBy=growBy;this.maxFree=maxFree;this.free=[];this.created=0;this.reused=0;this.grow(initial)}
 grow(count=this.growBy){const amount=Math.max(1,Number(count)||this.growBy);for(let i=0;i<amount;i++){this.free.push({});this.created++}}
 acquire(data){if(!this.free.length)this.grow();const item=this.free.pop();for(const key of Object.keys(item))delete item[key];Object.assign(item,data);item._iwPool=this.name;item._iwRun=runGeneration;item._iwAlive=true;item._iwInPool=false;this.reused++;return item}
 release(item){if(!item||item._iwPool!==this.name||item._iwInPool)return;item._iwAlive=false;item._iwInPool=true;item.target=null;item.owner=null;if(this.free.length<this.maxFree)this.free.push(item)}
}
class PooledEntityArray extends Array{
 static get [Symbol.species](){return Array}
 constructor(pool){super();this.pool=pool}
 push(...items){return super.push(...items.map(item=>this.pool.acquire(item)))}
 unshift(...items){return super.unshift(...items.map(item=>this.pool.acquire(item)))}
 splice(start,deleteCount,...items){const inserts=items.map(item=>this.pool.acquire(item));const removed=arguments.length===1?super.splice(start):super.splice(start,deleteCount,...inserts);removed.forEach(item=>this.pool.release(item));return removed}
 pop(){const item=super.pop();this.pool.release(item);return item}
 shift(){const item=super.shift();this.pool.release(item);return item}
 clear(){if(this.length)this.splice(0,this.length)}
}
const IW_ENTITY_POOLS={
 bullets:new EntityObjectPool('bullets',{initial:96,growBy:24,maxFree:300}),
 enemyBullets:new EntityObjectPool('enemyBullets',{initial:128,growBy:32,maxFree:260}),
 missiles:new EntityObjectPool('missiles',{initial:24,growBy:8,maxFree:48}),
 particles:new EntityObjectPool('particles',{initial:160,growBy:40,maxFree:420}),
 pickups:new EntityObjectPool('pickups',{initial:48,growBy:16,maxFree:140})
};
function resetEntityArray(name,current){if(current instanceof PooledEntityArray){current.clear();return current}return new PooledEntityArray(IW_ENTITY_POOLS[name])}
function clearEntityArray(array){if(array?.clear)array.clear();else if(Array.isArray(array))array.length=0}
function ensureEntityArray(name,current){if(current instanceof PooledEntityArray)return current;const next=new PooledEntityArray(IW_ENTITY_POOLS[name]);if(Array.isArray(current)&&current.length)next.push(...current);return next}
window.IWEntityPools=IW_ENTITY_POOLS;
// 驾驶员编号使用独立的新存档键，避免旧版 Clone/测试计数污染编号。
pilotId=Math.max(1,Number(localStorage.getItem('infinityWingsPilotIdV2'))||1);
const stars=Array.from({length:110},()=>({x:Math.random()*W,y:Math.random()*H,s:.4+Math.random()*1.8,v:18+Math.random()*65}));
const MOBILE_DEVICE=/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)||navigator.maxTouchPoints>1;
const spaceDust=Array.from({length:MOBILE_DEVICE?32:44},()=>({x:Math.random()*W,y:Math.random()*H,s:.45+Math.random()*1.25,v:12+Math.random()*24,drift:(Math.random()-.5)*5,kind:Math.random()>.78?'debris':'dust'}));
const nearSpaceStreaks=Array.from({length:MOBILE_DEVICE?9:14},()=>({x:Math.random()*W,y:Math.random()*H,w:.7+Math.random()*1.2,v:260+Math.random()*260,len:8+Math.random()*15,alpha:.34+Math.random()*.42}));
const spaceLandmarks=[];
const THREAT_LANDMARK_PROFILES=Object.freeze([
 {type:'planetTexture',x:.88,size:126,v:15,alpha:.3,rotation:0},
 {type:'wreckTexture',x:.18,size:90,v:18,alpha:.26,rotation:-.18},
 {type:'asteroids',x:.72,size:78,v:20,alpha:.23,rotation:.22},
 {type:'planetTexture',x:.08,size:142,v:16,alpha:.27,rotation:Math.PI},
 {type:'wreckTexture',x:.76,size:112,v:19,alpha:.24,rotation:.2},
 {type:'asteroids',x:.42,size:108,v:22,alpha:.25,rotation:-.28}
]);
function spawnThreatLandmark(tier,{initial=false}={}){
 const profile=THREAT_LANDMARK_PROFILES[Math.max(0,Math.min(5,tier))];if(!profile)return;
 spaceLandmarks.push({...profile,tier,x:W*profile.x,y:initial?H*.08:-profile.size*1.5});
 if(spaceLandmarks.length>3)spaceLandmarks.splice(0,spaceLandmarks.length-3);
}
const mobilePerf={enabled:MOBILE_DEVICE,quality:1,avgFps:60,frameMs:16.7,slowFrames:0,fastFrames:0,thermalPressure:0,lastSample:performance.now(),sampleFrames:0};
window.IWMobilePerf=mobilePerf;

const CORES=[
 {id:'rapid',name:'快速装填',tag:'通用',desc:'主炮射速提高 18%。',can:()=>true,apply:()=>player.fireRate*=.82},
 {id:'power',name:'高能弹头',tag:'通用',desc:'主炮伤害提高 25%。',can:()=>true,apply:()=>player.damage*=1.25},
 {id:'laser',name:'裂隙蓄能炮',tag:'激光流',desc:'蓄力后发射持续贯穿激光。',can:()=>!build.laser,apply:()=>build.laser=1},
 {id:'laser2',name:'聚焦透镜',tag:'激光流',desc:'缩短蓄力与冷却，并提高持续时间和伤害。',can:()=>build.laser===1,apply:()=>build.laser=2},
 {id:'laser3',name:'双束歼灭阵列',tag:'激光流',desc:'快速蓄力后发射持续三秒的双束激光。',can:()=>build.laser===2,apply:()=>build.laser=3},
 {id:'drone',name:'护航无人机',tag:'无人机流',desc:'扩展向前射击的无人机编队，最高四架。',can:()=>true,apply:()=>{build.drone=(build.drone||0)+1}},
 {id:'chrono',name:'时滞场',tag:'时间系',desc:'周期性释放时滞场，使敌人与敌弹减速 3 秒。',can:()=>!build.chrono,apply:()=>{build.chrono=1;build.chronoCd=7}},
 {id:'rewind',name:'回溯保险',tag:'时间系',desc:'受到致命伤害时回到约 4 秒前。每局一次。',can:()=>!build.rewind,apply:()=>build.rewind=1},
 {id:'echo',name:'意识回响',tag:'时间系',desc:'周期性召唤一架战术投影。投影短时复制主角的主炮射速、伤害与武器能力。',can:()=>!build.echo,apply:()=>{build.echo=1;build.echoCd=4}},
 {id:'repair',name:'战地维修',tag:'生存',desc:'恢复 35 点生命，并提高 10 点生命上限。',can:()=>true,apply:()=>{player.maxHp+=10;player.hp=Math.min(player.maxHp,player.hp+35)}}
];
