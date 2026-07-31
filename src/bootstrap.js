'use strict';
const $=s=>document.querySelector(s);
const canvas=$('#game'),ctx=canvas.getContext('2d');
const W=canvas.width,H=canvas.height,SAFE_BOTTOM=120;
const UI={
 boot:$('#bootScreen'),menu:$('#menuScreen'),story:$('#storyScreen'),core:$('#coreScreen'),archive:$('#archiveScreen'),settings:$('#settingsScreen'),death:$('#deathScreen'),pause:$('#pauseScreen'),
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
// 驾驶员编号使用独立的新存档键，避免旧版 Clone/测试计数污染编号。
pilotId=Math.max(1,Number(localStorage.getItem('infinityWingsPilotIdV2'))||1);
const stars=Array.from({length:110},()=>({x:Math.random()*W,y:Math.random()*H,s:.4+Math.random()*1.8,v:18+Math.random()*65}));
const MOBILE_DEVICE=/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)||navigator.maxTouchPoints>1;
const mobilePerf={enabled:MOBILE_DEVICE,quality:1,avgFps:60,frameMs:16.7,slowFrames:0,fastFrames:0,lastSample:performance.now(),sampleFrames:0};
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
