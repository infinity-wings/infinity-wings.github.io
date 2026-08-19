function showScreen(el){document.querySelectorAll('.screen').forEach(s=>s.classList.add('hidden'));el.classList.remove('hidden')}
function setSystemMenuVisible(visible){UI.systemMenuButton.classList.toggle('hidden',!visible)}
function openPauseMenu(){if(!running||dying||state==='core'||state==='awakening'||state==='fusion')return;dismissBarrierTutorial?.(false);releaseMouseLock?.();paused=true;state='pause';showScreen(UI.pause);setSystemMenuVisible(false);$('#controlsPanel')?.classList.add('hidden');refreshMouseCursorState?.();last=performance.now()}
function closePauseMenu(){if(!running||dying)return;IWStability?.prepareGameplayResume?.();UI.pause.classList.add('hidden');state='game';paused=false;last=performance.now();setSystemMenuVisible(true);refreshMouseCursorState?.();if(!touchDevice&&uiPrefs?.controlMode==='mouse')setTimeout(()=>requestMouseBattleLock?.(),0)}
function restartCurrentRun(){IWSave?.clearCheckpoint?.();reset();state='game';UI.pause.classList.add('hidden');UI.hud.classList.remove('hidden');UI.timerPanel.classList.remove('hidden');UI.touch.classList.remove('hidden');paused=false;running=true;last=performance.now();setSystemMenuVisible(true);toast('新的作战记录已建立')}
function returnToTitle(){running=false;paused=false;dying=false;state='menu';UI.hud.classList.add('hidden');UI.timerPanel.classList.add('hidden');UI.touch.classList.add('hidden');setSystemMenuVisible(false);refreshChapterMenu?.();showScreen(UI.menu)}
let menuAssetsReady=null;
function preloadMenuAssets(){
 if(menuAssetsReady)return menuAssetsReady;
 const touch=navigator.maxTouchPoints>0||matchMedia('(pointer: coarse)').matches;
 const portraitWidth=Math.min(innerWidth||540,innerHeight||960);
 const background=touch?(portraitWidth<600?'assets/menu/menu-space-background-phone.jpg':'assets/menu/menu-space-background-tablet.jpg'):'assets/menu/menu-space-background-desktop.jpg';
 const sources=[background,'assets/menu/menu-title-logo.PNG','assets/menu/menu-fighter-rear-v2.png'];
 const load=src=>new Promise(resolve=>{
  const image=new Image(),done=()=>resolve(src);
  image.onload=()=>{if(typeof image.decode==='function')image.decode().catch(()=>{}).finally(done);else done()};
  image.onerror=done;
  image.src=src;
  if(image.complete&&image.naturalWidth)done();
 });
 menuAssetsReady=Promise.all(sources.map(load));
 return menuAssetsReady;
}
function boot(){
 const lines=['正在建立加密连接……','正在读取驾驶员档案……','意识备份：可用','源核网络：异常','欢迎回来，驾驶员。'];
 const assets=preloadMenuAssets();
 const box=$('#bootLines');box.innerHTML='';let i=0,finished=false;
 const finish=()=>{if(finished)return;finished=true;clearInterval(timer);Promise.race([assets,new Promise(resolve=>setTimeout(resolve,1500))]).finally(()=>{refreshChapterMenu?.();if(IWSave?.migrationPending){state='migration';showScreen(UI.migration)}else{state='menu';showScreen(UI.menu)}})};
 const timer=setInterval(()=>{if(i>=lines.length)return finish();const d=document.createElement('div');d.className='boot-line '+(i===2?'ok':i===3?'warn':'');d.textContent=lines[i];box.appendChild(d);i++;if(i===lines.length)setTimeout(finish,420)},360);
 setTimeout(finish,4000);
}
let storyAutoTimer=0;
function startStory(){state='story';showScreen(UI.story);const roll=$('#storyRoll');roll.style.animation='none';void roll.offsetWidth;roll.style.animation='storyScroll 36s linear forwards';clearTimeout(storyAutoTimer);storyAutoTimer=setTimeout(()=>{if(state==='story')beginGame()},35000)}
function beginGame(){if(state==='game'&&running)return;clearTimeout(storyAutoTimer);storyAutoTimer=0;const roll=$('#storyRoll');if(roll)roll.style.animation='none';reset();state='game';document.querySelectorAll('.screen').forEach(s=>s.classList.add('hidden'));UI.hud.classList.remove('hidden');UI.timerPanel.classList.remove('hidden');UI.touch.classList.remove('hidden');setSystemMenuVisible(true);running=true;paused=false;last=performance.now();refreshMouseCursorState?.();if(!touchDevice&&uiPrefs?.controlMode==='mouse'){requestMouseBattleLock?.();setTimeout(()=>{if(document.pointerLockElement!==canvas&&state==='game')toast('点击战场启用鼠标控制')},120)}requestAnimationFrame(loop);setTimeout(()=>showBarrierTutorial?.(),420)}
function reset(){
 runGeneration++;
 player={
 x:W/2,
 y:H-SAFE_BOTTOM-75,
 r:10,
 speed:315,
 accel:2600,
 brake:4300,
 turnGrip:15,
 hp:100,
 maxHp:100,
 damage:11,
 fireRate:315,
 fireCd:0,
 inv:0,
 vx:0,
 vy:0,
 targetVx:0,
 targetVy:0,
 tilt:0,
 pitch:0,
 thrust:.28,
 visualY:0,
 shotSide:-1,
 recoil:0,
 slowTimer:0,

 mainBulletCount:1,
 mainBulletSize:1,
 mainBulletDamageScale:1
};
bullets=resetEntityArray('bullets',bullets);missiles=resetEntityArray('missiles',missiles);enemies=[];enemyBullets=resetEntityArray('enemyBullets',enemyBullets);enemyLasers=[];particles=resetEntityArray('particles',particles);blastWaves=[];lightningArcs=[];drones=[];pickups=resetEntityArray('pickups',pickups);score=0;level=1;xp=0;nextXp=50;bombs=3;build={laserState:{phase:'cooldown',timer:1.8,level:0},missileCd:1.4,thunderCd:.7,chronoActive:0,chronoCd:8,levelUpLock:0,killWindow:[],spawnBurst:0,lastEnemyUnlock:1,lastLandmarkThreat:0,barrierCharge:0,shieldLayers:0,shieldRecharge:0,lastHitAt:-99,targetCacheFrame:-1,targetCache:[],projectionActive:0,projectionCd:0,projectionLevel:0,projectionMirrorSide:1,projectionCacheFrame:-1,projectionCacheLevel:0,projectionCache:[],projectionMode:'none',projectionMainCd:0,projectionMissileCd:0,projectionLaserState:{phase:'idle',timer:0},debugLockHp:false,debugLockXp:false,debugThreatLevel:null,bossClearedTier:-1,bossDirectorTier:0,bossDirectorIndex:0,bossDirectorProgress:0,bossPendingNumber:0,bossPendingTimer:0,bossWarningShownFor:0,bossesDefeated:0,finalBossDefeated:false,firstEliteSpawned:false,wreckStory:null,droneVolleyCd:0,droneVolleyMode:'none',heavyEscortShieldActive:0,heavyEscortShieldCd:0,heavyEscortShieldDuration:4.5,heavyEscortShieldCooldown:9,awakeFrontShieldActive:0,awakeFrontShieldCd:0,awakeFrontShieldDuration:4,awakeFrontShieldCooldown:8,awakeFrontShieldBurstDone:false};coreManager.reset({silent:true});const sortieFighter=IWSave?.data?.profile?.selectedFighter||'infinity',sortieCore={infinity:'main',laser:'laser',drone:'drone',missile:'missile',thunder:'thunder'}[sortieFighter]||'main';coreManager.setLevel(sortieCore,1,{silent:true});awakeningSystem.reset();battleEventSystem.reset();upgradeSystem.reset();rewindHistory=[];projectionHistory=[];elapsed=0;spawnCd=0;bossSpawned=false;dying=false;deathTimer=0;deathFade=0;spaceLandmarks.length=0;build.allCoresMax=false;updateUI();coreEffects.init()
}
function threatLevel(){
 if(Number.isInteger(build?.debugThreatLevel))return Math.max(0,Math.min(5,build.debugThreatLevel));
 // 六段章节节奏：前哨分别在 02:30、04:00 抵达，最终阶段约 13:00 开放，
 // 为最终 Boss 的入场留出时间，使其稳定在约 14:15–15:00 出现。
 const thresholds=[0,180,330,480,630,780];
 let timeTier=0;for(let i=1;i<thresholds.length;i++)if(elapsed>=thresholds[i])timeTier=i;
 // 时间只决定下一阶段何时具备开放资格；当前 Boss 未结算时不能越级。
 const gateTier=Math.max(0,Math.min(5,(build?.bossClearedTier??-1)+1));
 return Math.min(timeTier,gateTier);
}
function displayedThreatLevel(){
 const boss=enemies.find(e=>e.boss&&!e.bossRetreating);
 return boss?Math.max(0,Math.min(5,(boss.bossStage||1)-1)):threatLevel();
}
function combatPower(){
 const corePower=CORE_IDS.reduce((sum,id)=>sum+coreManager.getLevel(id),0);
 const weaponPower=coreManager.getLevel('laser')*1.4+coreManager.getLevel('drone')*1.25+coreManager.getLevel('missile')*1.35+coreManager.getLevel('thunder')+coreManager.getLevel('blast')*.8;
 const gunPower=Math.max(0,(player.damage-11)/5)+Math.max(0,(315-player.fireRate)/35)+(player.mainBulletCount-1)*1.2;
 return corePower*.42+weaponPower+gunPower+Math.max(0,level-1)*.18;
}
function recentKillRate(){
 const now=elapsed;build.killWindow=build.killWindow.filter(t=>now-t<10);return build.killWindow.length/10;
}
function enemyCap(){
 const t=threatLevel(),power=combatPower(),rate=recentKillRate();
 // 敌军数量随作战时间、等级和玩家火力平滑增长，不在某个阶段突然形成敌潮。
 const timeGrowth=Math.floor(elapsed/95);
 const levelGrowth=Math.floor(Math.max(0,level-1)/2.4);
 const powerGrowth=Math.floor(Math.max(0,power-3)*.28);
 const killGrowth=Math.floor(rate*1.15);
 return Math.min(28,5+t+timeGrowth+levelGrowth+powerGrowth+killGrowth);
}
function enemyStage(){
 if(level<=3)return 0;
 if(level<=6)return 1;
 if(level<=9)return 2;
 if(level<=13)return 3;
 return 4;
}
function enemyDurabilityScale(type='scout'){
 const stage=enemyStage();
 const stageScale=[1,1.12,1.28,1.46,1.68][stage];
 const powerPressure=Math.min(.28,Math.max(0,combatPower()-8)*.012);
 const typeWeight=type==='scout'?.55:type==='suicide'||type==='raider'?.72:1;
 return 1+(stageScale-1+powerPressure)*typeWeight;
}
function applyEnemyDurability(enemy){
 const scale=enemyDurabilityScale(enemy.type);
 enemy.hp=Math.round(enemy.hp*scale);
 enemy.max=enemy.hp;
 return enemy;
}
function makeEnemy(type,side=false){
 const t=threatLevel(),power=combatPower();
 const sideEntry=side||type==='raider'||type==='suicide',fromLeft=sideEntry&&Math.random()<.5;
 const base={x:sideEntry?(fromLeft?-30:W+30):35+Math.random()*(W-70),y:sideEntry?70+Math.random()*Math.min(250,H*.38):-35,type,r:15,hp:25,max:25,v:120,shoot:0,attackArmed:false,age:0,dir:fromLeft?1:-1,shield:0,maxShield:0};
 if(type==='heavy')Object.assign(base,{r:23,hp:95+t*12,max:95+t*12,v:42,shoot:1550});
 if(type==='suicide'){const suicideHp=68+t*12;Object.assign(base,{r:14,hp:suicideHp,max:suicideHp,v:130,shoot:99999,warning:0,fuse:null,fuseDuration:1.35,suicidePhase:'entry',heading:fromLeft?0:Math.PI,dashSpeed:265,sideEntry:true})}
 if(type==='sniper')Object.assign(base,{r:16,hp:44+t*8,max:44+t*8,v:42,shoot:1350,sniperAim:null,sniperAimDuration:2,sniperLockWindow:.8});
 if(type==='support')Object.assign(base,{r:18,hp:72+t*10,max:72+t*10,v:48,shoot:99999,supportCd:.4});
 if(type==='barrage')Object.assign(base,{r:22,hp:105+t*14,max:105+t*14,v:38,shoot:1500});
 if(type==='raider')Object.assign(base,{r:14,hp:36+t*6,max:36+t*6,v:205+power*2,shoot:850,sideEntry:true});
 if(type==='carrier')Object.assign(base,{r:27,hp:165+t*18,max:165+t*18,v:34,shoot:1750,spawnCount:3});
 if(type==='jammer')Object.assign(base,{r:17,hp:62+t*9,max:62+t*9,v:135+Math.max(0,t-3)*10,shoot:999999,jammerGroup:null,jammerSlot:0,jammerNetDelay:.4});
 const enemy=applyEnemyDurability(base);
 if(typeof markEnemyEncounter==='function')markEnemyEncounter(enemy.type);
 return enemy;
}
function weightedEnemyChoice(table){
 const total=table.reduce((sum,item)=>sum+item[1],0);let roll=Math.random()*total;
 for(const [type,weight] of table){roll-=weight;if(roll<=0)return type}
 return table[0][0];
}
function enemyRosterForThreat(t=threatLevel()){
 const rosters=[
  [['scout',100]],
  [['scout',58],['heavy',24],['suicide',10],['raider',8]],
  [['scout',30],['heavy',20],['suicide',13],['raider',10],['support',10],['barrage',12],['sniper',5]],
  [['scout',14],['heavy',17],['suicide',11],['raider',10],['support',12],['barrage',15],['carrier',9],['jammer',7],['sniper',5]],
  [['scout',3],['heavy',16],['suicide',10],['raider',10],['support',12],['barrage',16],['carrier',14],['jammer',11],['sniper',8]],
  [['heavy',15],['suicide',11],['raider',12],['support',12],['barrage',17],['carrier',16],['jammer',10],['sniper',7]]
 ];
 return rosters[Math.max(0,Math.min(5,t))];
}
function enemyRosterForLevel(){
 if(Number.isInteger(build?.debugThreatLevel))return enemyRosterForThreat(build.debugThreatLevel);
 if(level<=2||elapsed<85)return [['scout',100]];
 if(level===3)return [['scout',86],['heavy',14]];
 if(level<=6)return [['scout',45],['heavy',25],['suicide',18],['raider',12]];
 if(level<=9)return [['scout',25],['heavy',20],['suicide',15],['raider',10],['support',12],['barrage',18]];
 if(level<=13)return [['scout',10],['heavy',16],['suicide',12],['raider',10],['support',12],['barrage',14],['carrier',14],['jammer',12]];
 return [['scout',5],['heavy',15],['suicide',12],['raider',10],['support',12],['barrage',15],['carrier',16],['jammer',15],['sniper',10]];
}
function chooseEnemyType(){
 if(enemies.some(e=>e.boss)){
  if(Number.isInteger(build?.debugThreatLevel)&&build.debugThreatLevel>=4)return weightedEnemyChoice(enemyRosterForThreat(build.debugThreatLevel));
  return Math.random()<.78?'scout':'heavy';
 }
 return weightedEnemyChoice(enemyRosterForLevel());
}
const ENEMY_THREAT_COST={scout:1,raider:2,suicide:2,heavy:3,sniper:3,support:4,barrage:5,carrier:5,jammer:4};
function activeEnemyThreat(){return enemies.reduce((sum,e)=>sum+(e.boss?0:(ENEMY_THREAT_COST[e.type]||1)),0)}
function canSpawnEnemyType(type){
 const t=threatLevel(),count=enemies.filter(e=>e.type===type).length,budget=10+t*4+Math.floor(elapsed/180)*2;
 const caps={barrage:t>=4?2:1,sniper:t>=4?2:1,carrier:t>=5?2:1,support:2,jammer:2,suicide:t>=3?4:3};
 return count<(caps[type]??99)&&activeEnemyThreat()+(ENEMY_THREAT_COST[type]||1)<=budget;
}
function announceEnemyUnlock(currentLevel){
 const messages={4:'敌军换装：自爆战机与侧翼突袭机投入战场',7:'威胁升级：弹幕载机与护盾支援机出现',10:'高阶威胁：分裂母机与干扰机出现',14:'敌军精英编队已全面投入'};
 if(messages[currentLevel]&&build.lastEnemyUnlock<currentLevel){build.lastEnemyUnlock=currentLevel;toast(messages[currentLevel])}
}

function enemyHitRadius(enemy){
 const byType={scout:25,heavy:32,suicide:23,sniper:31,support:30,barrage:35,raider:23,carrier:41,jammer:30,boss:63};
 return byType[enemy.type]||Math.max(enemy.r||15,25);
}
function enemyShieldRadius(enemy){
 const byType={scout:52,heavy:62,suicide:52,sniper:58,support:57,barrage:63,raider:53,carrier:68,jammer:57};
 return byType[enemy.type]||enemyHitRadius(enemy)+12;
}
function enemyHitAxes(enemy,padding=0){
 if(enemy.boss)return {rx:(enemy.hitRx||88)+padding,ry:(enemy.hitRy||60)+padding};
 if(enemy.shield>0){const radius=enemyShieldRadius(enemy)+padding;return {rx:radius,ry:radius}}
 const radius=enemyHitRadius(enemy)+padding;return {rx:radius,ry:radius};
}
function enemyHitTest(enemy,x,y,padding=0){const {rx,ry}=enemyHitAxes(enemy,padding),dx=x-enemy.x,dy=y-enemy.y;return dx*dx/(rx*rx)+dy*dy/(ry*ry)<=1}
function enemyHitHalfWidth(enemy){return enemyHitAxes(enemy).rx}

function spawnEnemy(){
 const bossActive=enemies.some(e=>e.boss);
 if(bossActive)return;
 const cap=enemyCap();
 if(enemies.length>=cap)return;
 let type=chooseEnemyType();for(let tries=0;tries<6&&!canSpawnEnemyType(type);tries++)type=chooseEnemyType();if(!canSpawnEnemyType(type))type='scout';
 if(type==='jammer'&&cap-enemies.length<2)type='heavy';
 if(type==='jammer'){
  const threat=threatLevel(),count=threat>=5&&Math.random()<.42?3:2,group=`jammer-${elapsed.toFixed(3)}-${Math.random().toString(36).slice(2,6)}`,diagonal=Math.random()<.5,desired=count===3?155+Math.random()*30:190+Math.random()*40,safeMargin=35,spacing=Math.min(desired,Math.max(110,(W-safeMargin*2)/(count-1))),halfWidth=spacing*(count-1)/2,centerMin=safeMargin+halfWidth,centerMax=W-safeMargin-halfWidth,center=centerMax>centerMin?centerMin+Math.random()*(centerMax-centerMin):W/2,baseY=diagonal?-112:-55;
  for(let slot=0;slot<count&&enemies.length<cap;slot++){const unit=battleEventSystem.decorateSpawnedEnemy(makeEnemy('jammer')),verticalOffset=diagonal?(count===2?(slot===0?-45:45):(slot===1?50:-42)):0;unit.x=Math.max(safeMargin,Math.min(W-safeMargin,center+(slot-(count-1)/2)*spacing));unit.y=baseY+verticalOffset;unit.jammerGroup=group;unit.jammerSlot=slot;unit.jammerFormation=diagonal?'diagonal':'horizontal';enemies.push(unit);battleEventSystem.spawnMirrorPartner(unit)}
 }else{const primary=battleEventSystem.decorateSpawnedEnemy(makeEnemy(type,type==='raider'));enemies.push(primary);battleEventSystem.spawnMirrorPartner(primary)}
 const power=combatPower(),rate=recentKillRate();
 const ramp=Math.min(1,Math.max(0,(elapsed-45)/120));
 const extraChance=Math.min(.52,.02+ramp*(power*.016+rate*.10));
 if(enemies.length<cap&&Math.random()<extraChance){
  const forcedHigh=Number.isInteger(build?.debugThreatLevel)&&build.debugThreatLevel>=4;
  let extraType=forcedHigh?chooseEnemyType():(Math.random()<.72?'scout':chooseEnemyType());if(extraType==='jammer')extraType='heavy';const primary=battleEventSystem.decorateSpawnedEnemy(makeEnemy(extraType,false));enemies.push(primary);battleEventSystem.spawnMirrorPartner(primary);
 }
 if(level>=10&&elapsed>150&&power>12&&enemies.length<cap-2&&Math.random()<.08){
  let burstType=Number.isInteger(build?.debugThreatLevel)&&build.debugThreatLevel>=4?chooseEnemyType():'scout';if(burstType==='jammer')burstType='heavy';
  const first=battleEventSystem.decorateSpawnedEnemy(makeEnemy(burstType));enemies.push(first);battleEventSystem.spawnMirrorPartner(first);const second=battleEventSystem.decorateSpawnedEnemy(makeEnemy(burstType));enemies.push(second);battleEventSystem.spawnMirrorPartner(second);
 }
}
const BOSS_TOTAL=6,BOSS_ENCOUNTERS_BY_TIER=[[1],[2],[3],[4],[5],[6]];
const BOSS_ENCOUNTERS=[
 {tier:1,role:'mini',kind:'fortress',name:'重甲先锋',sprite:'heavy',duration:30,modes:['royalSplit','fan'],size:[170,134],hit:[73,56],hp:2100,expectedCores:2,expectedDps:90},
 {tier:2,role:'mini',kind:'seraph',name:'弹幕母机',sprite:'barrage',duration:30,modes:['beholsterCombo','ring'],size:[180,139],hit:[78,59],hp:3500,expectedCores:5,expectedDps:145},
 {tier:3,role:'entity',kind:'rift',name:'裂隙猎手',art:'iii',modes:['hunterCombo','aimed','beam'],size:[422,288],hit:[184,116],hp:12200,expectedCores:8,expectedDps:220},
 {tier:4,role:'entity',kind:'fortress',name:'赤钢战争堡垒',art:'iv',modes:['wallLanes','ringStrong','sweep'],size:[426,290],hit:[186,117],hp:19800,expectedCores:11,expectedDps:340},
 {tier:5,role:'entity',kind:'seraph',name:'虚空航母',art:'v',modes:['carrierCombo','guard','voidTorpedo'],size:[422,356],hit:[184,143],hp:31500,expectedCores:14,expectedDps:485},
 {tier:6,role:'entity',kind:'omega',name:'终焉核心 Ω',art:'omega',modes:['omegaStarRing','bulletWall','omegaCombo','finalBarrage'],size:[422,352],hit:[184,142],hp:60000,expectedCores:18,expectedDps:705,final:true}
];
function currentStageNumber(){const queue=BOSS_ENCOUNTERS_BY_TIER[Math.max(0,Math.min(5,threatLevel()))]||[1];return queue[Math.max(0,Math.min(queue.length-1,build?.bossDirectorIndex||0))]}
function bossNumberForThreat(tier=threatLevel()){return Math.max(1,Math.min(6,tier+1))}
function syncBossDirectorTier(force=false){const tier=Math.max(0,Math.min(5,threatLevel()));if(!force&&build.bossDirectorTier===tier)return;build.bossDirectorTier=tier;build.bossDirectorIndex=0;build.bossDirectorProgress=0;build.bossPendingNumber=0;build.bossPendingTimer=0;build.bossWarningShownFor=0}
function advanceBossDirector(number){const queue=BOSS_ENCOUNTERS_BY_TIER[build.bossDirectorTier]||[];if(queue[build.bossDirectorIndex]===number){build.bossDirectorIndex++;build.bossClearedTier=Math.max(build.bossClearedTier??-1,build.bossDirectorTier)}build.bossDirectorProgress=0;build.bossPendingNumber=0;build.bossPendingTimer=0;build.bossWarningShownFor=0}
function tierThreeWreckRecovered(){return !!IWSave?.data?.progression?.fighters?.includes('laser')}
function wreckCinematicActive(){const phase=build?.wreckStory?.phase;return ['signal','drift','discoveryDialogue','bossEntry','abduct','dialogue','return','scan','reveal','briefing','departure'].includes(phase)}
function ensureWreckDiscoveryDialogue(){
 let overlay=document.getElementById('wreckDiscoveryDialogue');
 if(!overlay){overlay=document.createElement('section');overlay.id='wreckDiscoveryDialogue';overlay.className='wreck-story-dialogue hidden';overlay.innerHTML='<button type="button"><small>PILOT LOG · 驾驶员通讯</small><strong>失联编队战机</strong><p>“这不是失联编队的战机吗？<br>我要把它带回去。”</p><span>点击继续</span></button>';document.querySelector('#app')?.appendChild(overlay);overlay.querySelector('button').onclick=()=>continueWreckDiscovery()}
 return overlay;
}
function continueWreckDiscovery(){const story=build?.wreckStory;if(!story||story.phase!=='discoveryDialogue')return;document.getElementById('wreckDiscoveryDialogue')?.classList.add('hidden');story.phase='bossEntry';story.timer=0;audioSystem?.play('ui');toast('高能反应接近','important');const boss=spawnBoss(3,{wreckStory:true});boss.wreckStory=true;boss.cinematicEntry=true;boss.bossEntering=true;boss.bossEntryTime=0;boss.y=-210;boss.entryStartY=-210;boss.targetY=128}
function ensureWreckDialogue(){
 let overlay=document.getElementById('wreckStoryDialogue');
 if(!overlay){overlay=document.createElement('section');overlay.id='wreckStoryDialogue';overlay.className='wreck-story-dialogue hidden';overlay.innerHTML='<button type="button"><small>UNKNOWN HOSTILE SIGNAL</small><strong>裂隙猎手</strong><p>“想带回这个手下败将的遗骸？<br>那就先击败我。”</p><span>点击继续</span></button>';document.querySelector('#app')?.appendChild(overlay);overlay.querySelector('button').onclick=()=>continueTierThreeWreckStory()}
 return overlay;
}
function hideWreckDialogue(){document.getElementById('wreckStoryDialogue')?.classList.add('hidden')}
function ensureWreckAnalysis(){
 let overlay=document.getElementById('wreckAnalysisDialogue');
 if(!overlay){overlay=document.createElement('section');overlay.id='wreckAnalysisDialogue';overlay.className='wreck-story-dialogue wreck-analysis-dialogue hidden';overlay.innerHTML='<button type="button"><small>WRECK DATA RESTORED · 遗骸数据解析完成</small><strong>曙光棱镜</strong><p><b>主要源核 · 光能源核</b><br>以高密度光束贯穿敌阵的高速歼击机，曾负责为舰队打开通往裂隙深处的航路。</p><span>确认资料并返航</span></button>';document.querySelector('#app')?.appendChild(overlay);overlay.querySelector('button').onclick=()=>finishTierThreeWreckStory()}
 return overlay;
}
function finishTierThreeWreckStory(){const story=build?.wreckStory;if(!story||story.phase!=='briefing')return;document.getElementById('wreckAnalysisDialogue')?.classList.add('hidden');story.phase='departure';story.timer=0;IWSave.data.story.wrecks[0]=true;IWSave.data.story.wrecksFound=IWSave.data.story.wrecks.filter(Boolean).length;IWSave.unlockFighter('laser');IWSave.clearCheckpoint();audioSystem?.play('ui');toast('曙光棱镜已加入机库 · 正在返航','important')}
function continueTierThreeWreckStory(){const story=build?.wreckStory;if(!story||story.phase!=='dialogue')return;hideWreckDialogue();story.phase='guarded';story.timer=0;story.alpha=0;const boss=enemies.find(e=>e.boss&&e.wreckStory);if(boss){boss.bossEntering=false;boss.y=boss.targetY;boss.shoot=.55;boss.bossModeTimer=.65}touchMoveActive=false;touchMovePointerId=null;touchTargetX=player.x;touchTargetY=player.y;mouseMoveActive=false;mouseDeltaX=mouseDeltaY=0;joyX=joyY=0;player.fireCd=Math.min(player.fireCd,180);player.vx=player.vy=player.targetVx=player.targetVy=0;paused=false;state='game';last=performance.now();audioSystem?.play('ui');toast('遗骸夺回作战开始','important')}
function beginTierThreeWreckStory(force=false){
 hideWreckDialogue();document.getElementById('wreckDiscoveryDialogue')?.classList.add('hidden');clearEntityArray(enemyBullets);clearEntityArray(bullets);clearEntityArray(missiles);clearEntityArray(particles);clearEntityArray(pickups);enemyLasers.length=0;lightningArcs.length=0;blastWaves.length=0;drones.length=0;enemies.length=0;battleEventSystem.cancelForBoss?.();build.bossPendingNumber=0;build.bossPendingTimer=0;build.projectionActive=0;build.awakeFrontShieldActive=0;build.heavyEscortShieldActive=0;
 const story={fighterId:'laser',phase:'signal',timer:0,x:W/2,y:76,alpha:1,rotation:-.18,float:0,assetReady:false,assetFailed:false,debugForce:!!force};build.wreckStory=story;
 if(typeof preloadStoryWreckAsset==='function')preloadStoryWreckAsset('laser').then(ready=>{if(build?.wreckStory!==story)return;story.assetReady=!!ready;story.assetFailed=!ready}).catch(()=>{if(build?.wreckStory===story)story.assetFailed=true});else story.assetFailed=true;
 player.fireCd=Math.max(player.fireCd,900);player.vx=player.vy=player.targetVx=player.targetVy=0;audioSystem?.play('ui');toast('系统检测到失联战机信号……','important');
}
function releaseTierThreeWreck(){
 if(!build.wreckStory||build.wreckStory.fighterId!=='laser'||(tierThreeWreckRecovered()&&!build.wreckStory.debugForce))return;
 clearEntityArray(enemyBullets);clearEntityArray(bullets);clearEntityArray(missiles);clearEntityArray(particles);clearEntityArray(pickups);enemyLasers.length=0;lightningArcs.length=0;blastWaves.length=0;drones.length=0;
 Object.assign(build.wreckStory,{phase:'return',timer:0,x:W/2,y:118,alpha:1,scanProgress:0,revealProgress:0});player.fireCd=999999;player.vx=player.vy=player.targetVx=player.targetVy=0;
 toast('牵引场已解除 · 战机遗骸正在坠回战区','important');
}
function updateWreckStory(dt){
 const story=build?.wreckStory;if(!story)return;
 const cinematic=['signal','drift','discoveryDialogue','bossEntry','abduct','dialogue'].includes(story.phase);story.timer+=dt;story.rotation=(story.rotation||0)+dt*.17;story.float=Math.sin(story.timer*1.35)*5;
 const playerTargetY=H-SAFE_BOTTOM-118;if(cinematic){player.x+=(W/2-player.x)*Math.min(1,dt*2.3);player.y+=(playerTargetY-player.y)*Math.min(1,dt*2.3);player.vx=player.vy=player.targetVx=player.targetVy=0;player.tilt*=Math.max(0,1-dt*5);player.pitch*=Math.max(0,1-dt*5)}
 if(story.phase==='signal'){
  story.alpha=1;story.y=76+Math.sin(story.timer*1.1)*3;if((story.assetReady||story.assetFailed)&&story.timer>=1.55){story.phase='drift';story.timer=0;story.y=76;story.alpha=1}
 }else if(story.phase==='drift'){
  const targetY=Math.max(180,playerTargetY-205),p=Math.min(1,story.timer/5.1),ease=1-Math.pow(1-p,2.25);story.y=76+(targetY-76)*ease;story.x=W/2+Math.sin(story.timer*.78)*15;
  if(story.timer>=5.1){story.phase='discoveryDialogue';story.timer=0;story.x=W/2;story.y=targetY;ensureWreckDiscoveryDialogue().classList.remove('hidden');audioSystem?.play('ui')}
 }else if(story.phase==='discoveryDialogue'){
  story.x=W/2;story.y=Math.max(180,playerTargetY-205)+Math.sin(story.timer*1.5)*4;
 }else if(story.phase==='bossEntry'){
  const boss=enemies.find(e=>e.boss&&e.wreckStory);if(boss){const p=Math.min(1,story.timer/2.15),ease=1-Math.pow(1-p,3);boss.y=-210+(boss.targetY+210)*ease;boss.bossEntryTime=Math.min(boss.bossIntroTravel||1.7,story.timer*.72)}if(story.timer>=2.3){story.phase='abduct';story.timer=0}
 }else if(story.phase==='abduct'){
  const boss=enemies.find(e=>e.boss&&e.wreckStory),p=Math.min(1,story.timer/2.15);if(boss){story.x+=(boss.x-story.x)*Math.min(1,dt*(1.25+p*2.5));story.y+=(boss.y+22-story.y)*Math.min(1,dt*(1.05+p*2.8));story.alpha=Math.max(0,1-Math.max(0,p-.64)/.36)}if(story.timer>=2.2){story.phase='dialogue';story.timer=0;story.alpha=0;ensureWreckDialogue().classList.remove('hidden');audioSystem?.play('ui')}
 }else if(story.phase==='dialogue'){
  const boss=enemies.find(e=>e.boss&&e.wreckStory);if(boss)boss.y=boss.targetY;
 }else if(story.phase==='return'){
  const targetY=Math.max(210,playerTargetY-205);story.y+=(targetY-story.y)*Math.min(1,dt*1.55);story.x+=(W/2-story.x)*Math.min(1,dt*2);if(story.timer>=3.1){story.phase='scan';story.timer=0;story.x=W/2;story.y=targetY;audioSystem?.play('ui')}
 }else if(story.phase==='scan'){
  story.scanProgress=Math.min(1,story.timer/3);story.x=W/2;story.y=Math.max(210,playerTargetY-205)+Math.sin(story.timer*1.4)*3;if(story.scanProgress>=1){story.phase='reveal';story.timer=0;audioSystem?.play('pickup')}
 }else if(story.phase==='reveal'){
  story.revealProgress=Math.min(1,story.timer/1.8);if(story.revealProgress>=1){story.phase='briefing';story.timer=0;ensureWreckAnalysis().classList.remove('hidden');audioSystem?.play('ui')}
 }else if(story.phase==='briefing'){
  story.revealProgress=1;
 }else if(story.phase==='departure'){
  story.alpha=Math.max(0,1-story.timer/1.2);player.y=Math.min(H+90,player.y+150*dt);if(story.timer>=1.25){story.phase='recovered';running=false;paused=false;returnToTitle()}
 }
}
function maybeSpawnStageBoss(dt=0){
 syncBossDirectorTier();if(enemies.some(e=>e.boss)||battleEventSystem.warning||battleEventSystem.active)return;
 const queue=BOSS_ENCOUNTERS_BY_TIER[build.bossDirectorTier]||[],number=queue[build.bossDirectorIndex];if(!number)return;const encounter=BOSS_ENCOUNTERS[number-1];
 // 前两名前哨使用明确的章节时间点；后续实体 Boss 使用本阶段击毁进度，
 // 因而测试跳转危险等级也不会触发低阶段的旧定时 Boss。
 const required=number===3?30:encounter?.tier>=6?72:58;
 const ready=number===1?elapsed>=145:number===2?elapsed>=235:build.bossDirectorProgress>=required;
 if(number===3&&ready&&!tierThreeWreckRecovered()){
  if(!build.wreckStory)beginTierThreeWreckStory();
  return;
 }
 if(!build.bossPendingNumber&&ready){build.bossPendingNumber=number;build.bossPendingTimer=5;build.bossWarningShownFor=number;audioSystem?.play('ui');toast('有一股强大的力量正在靠近','important')}
 if(build.bossPendingNumber){build.bossPendingTimer=Math.max(0,build.bossPendingTimer-dt);if(build.bossPendingTimer<=0)spawnBoss(build.bossPendingNumber)}
}
function spawnBoss(number=currentStageNumber(),options={}){
 number=Math.max(1,Math.min(BOSS_TOTAL,number));
 bossSpawned=true;
 if(battleEventSystem.warning||battleEventSystem.active)battleEventSystem.cancelForBoss();
 clearEntityArray(enemyBullets);enemyLasers.length=0;
 enemies.length=0;
 const encounter=BOSS_ENCOUNTERS[number-1],kind=encounter.kind;
 const ownedCoreLevels=CORE_IDS.reduce((sum,id)=>sum+coreManager.getRawLevel(id),0);
 const projection=false,mini=encounter.role==='mini',persistent=!encounter.duration;
 // 每次遭遇的基础血量由该时间点的预计原核数量、标准构筑 DPS 和目标击杀时间反推。
 // 只有超过阶段预期的强化才追加少量耐久，避免普通玩家因动态缩放受到惩罚。
 const overbuild=Math.max(0,ownedCoreLevels-(encounter.expectedCores||0)),overbuildScale=1+Math.min(.24,overbuild*.03);
 const bossHp=Math.round(encounter.hp*overbuildScale);
 const volleyCount=mini?3:Math.min(8,encounter.tier+2);
 const boss={type:'boss',boss:true,projectionBoss:projection,miniBoss:mini,fixedBoss:number>=3,awakenedBoss:encounter.tier>=5&&!projection,awakeningBoss:false,bossKind:kind,bossName:encounter.name,bossNumber:number,bossStage:encounter.tier,bossRole:encounter.role,bossArtKey:encounter.art,bossSpriteType:encounter.sprite,bossModes:encounter.modes,bossRenderSize:encounter.size,hitRx:encounter.hit[0],hitRy:encounter.hit[1],persistentBoss:persistent,bossTimeLeft:persistent?null:encounter.duration,finalBoss:!!encounter.final,x:W/2,y:-180,entryStartY:-180,targetY:number>=3?145:150,bossEntering:true,bossEntryTime:0,bossEntryFxCd:0,bossIntroTravel:1.7,bossIntroDuration:3.7,r:Math.max(encounter.hit[0],encounter.hit[1]),hp:bossHp,max:bossHp,v:28+encounter.tier*2,shoot:99999,dir:1,age:0,bossPhase:1,bossModeIndex:0,bossModeTimer:.9,bossModeMorph:0,bossVolleyCount:volleyCount,bossVolleyRemaining:volleyCount,bossActionCd:.65,guardWaveUsed:false};
 enemies.push(boss);
 if(options.wreckStory)toast('强大能量反应正在接近','important');
 else if(encounter.final)toast('最终 Boss 降临 · 必须将其击毁','important');
 else if(mini)toast(`前期小型 Boss · ${encounter.duration} 秒限时歼灭`,'important');
 else toast(`危险等级 ${THREAT_ROMAN[encounter.tier-1]} · ${encounter.name} 真身降临`,'important');
 if(typeof markEnemyEncounter==='function'){markEnemyEncounter('boss');markEnemyEncounter(`boss-${number}`)}
 return boss;
}
function projectionSnapshot(delayFrames=0){
 return {x:player.x,y:player.y,tilt:0,visualY:0,recoil:0,vx:0,vy:0,speed:player.speed};
}
function clonePositions(){
 const awakening=awakeningSystem.get('clone');
 const rawLevel=coreManager.getRawLevel('clone');
 const cloneLevel=awakening?3:coreManager.getLevel('clone');
 if((rawLevel<=0&&!awakening)||(build.projectionActive||0)<=0)return [];
 const mode=awakening?.id||`level-${cloneLevel}`;
 if(build.projectionCacheFrame===elapsed&&build.projectionCacheLevel===mode)return build.projectionCache||[];
 const fixedY=Math.max(92,Math.min(H-SAFE_BOTTOM-92,H*.70));
 const palette={color:'#a99cff',bodyColor:'#6657d9',alpha:.56};
 const make=(x,slot,damageScale,spread=0)=>({
  x:Math.max(42,Math.min(W-42,x)),y:fixedY,damageScale,spread,slot,
  tilt:0,visualY:Math.sin(elapsed*2.2+slot)*1.2,recoil:0,
  vx:0,vy:0,speed:player.speed,cloneType:'static-'+slot,
  color:palette.color,bodyColor:palette.bodyColor,alpha:palette.alpha
 });
 let result=[];
 if(awakening?.id==='clone_mirror'){
  result=[make(W*.10,-2,.10,-42),make(W*.30,-1,.10,-20),make(W*.50,0,.10,0),make(W*.70,1,.10,20),make(W*.90,2,.10,42)];
 }else if(awakening?.id==='clone_substitute'){
  result=[make(W*.22,-1,.18,0),make(W*.50,0,.18,0),make(W*.78,1,.18,0)];
 }else if(cloneLevel===1){
  result=[make(W*.5,0,.34,0)];
 }else if(cloneLevel===2){
  result=[make(W*.26,-1,.34,0),make(W*.74,1,.34,0)];
 }else{
  result=[make(W*.20,-1,.12,0),make(W*.50,0,.12,0),make(W*.80,1,.12,0)];
 }
 build.projectionCacheFrame=elapsed;build.projectionCacheLevel=mode;build.projectionCache=result;
 return result;
}
function updateProjectionCore(dt){
 const awakening=awakeningSystem.get('clone');
 const rawLevel=coreManager.getRawLevel('clone');
 const projectionLevel=awakening?3:coreManager.getLevel('clone');
 const mode=awakening?.id||`level-${projectionLevel}`;
 if(rawLevel<=0&&!awakening){build.projectionActive=0;build.projectionCd=0;build.projectionLevel=0;build.projectionMode='none';return}
 if(build.projectionMode!==mode){
  build.projectionMode=mode;build.projectionLevel=projectionLevel;build.projectionActive=0;build.projectionCd=1.2;build.projectionCacheFrame=-1;
 }
 if((build.projectionActive||0)>0){
  build.projectionActive=Math.max(0,build.projectionActive-dt);
  if(build.projectionActive<=0){
   build.projectionCd=awakening?.id==='clone_mirror'?3:awakening?.id==='clone_substitute'?5:[0,8,5,3][projectionLevel];
  }
 }else{
  build.projectionCd=Math.max(0,(build.projectionCd||0)-dt);
  if(build.projectionCd<=0){
   build.projectionActive=5;
   build.projectionCacheFrame=-1;
   build.projectionMainCd=.12;
   build.projectionMissileCd=.75;
   build.projectionLaserState={phase:'idle',timer:.25};
  }
 }
}
function getBlastCoreStats(){
 const blastLevel=coreManager.getLevel('blast');
 if(blastLevel<=0)return null;
 return [null,
  {level:1,count:2,damageScale:.52,speed:465,seekRadius:210},
  {level:2,count:3,damageScale:.62,speed:505,seekRadius:265},
  {level:3,count:4,damageScale:.72,speed:545,seekRadius:330}
 ][blastLevel];
}
function getThunderCoreStats(){
 const thunderLevel=coreManager.getLevel('thunder');
 if(thunderLevel<=0)return null;
 return [null,
  {level:1,chains:2,range:260,damage:38,cooldown:1.6},
  {level:2,chains:3,range:310,damage:58,cooldown:1.4},
  {level:3,chains:5,range:370,damage:72,cooldown:1.0}
 ][thunderLevel];
}
function applyThunderPayload(projectile){
 return projectile;
}
function removeKilledEnemy(enemy,baseDamage,blastLevel){
 const index=enemies.indexOf(enemy);
 if(index<0)return;
 const x=enemy.x,y=enemy.y;
 enemies.splice(index,1);
 if(blastLevel)spawnSplitBullets(x,y,baseDamage,blastLevel);
}
function createLightningArc(from,to,level=1){
 lightningArcs.push({x1:from.x,y1:from.y,x2:to.x,y2:to.y,life:.26,maxLife:.26,level,seed:Math.random()*9999});
 for(let i=0;i<4;i++)particles.push({x:to.x+(Math.random()-.5)*10,y:to.y+(Math.random()-.5)*10,vx:(Math.random()-.5)*90,vy:(Math.random()-.5)*90,life:.18+Math.random()*.18,max:.36,r:1+Math.random()*1.8,type:'thunder'});
}
function fireThunderCore(level){
 const stats=getThunderCoreStats();if(!stats||!enemies.length)return false;
 const blastLevel=coreManager.getLevel('blast');
 let from={x:player.x,y:player.y-18},fired=false;const struck=new Set();
 for(let step=0;step<stats.chains;step++){
  const target=enemies.filter(enemy=>enemy.hp>0&&!enemy.bossRetreating&&!struck.has(enemy)&&Math.hypot(enemy.x-from.x,enemy.y-from.y)<=stats.range).sort((a,b)=>Math.hypot(a.x-from.x,a.y-from.y)-Math.hypot(b.x-from.x,b.y-from.y))[0];
  if(!target)break;fired=true;struck.add(target);createLightningArc(from,target,level);const nextFrom={x:target.x,y:target.y};
  if(damageEnemy(target,stats.damage))removeKilledEnemy(target,stats.damage,blastLevel);from=nextFrom;
 }
 if(fired){audioSystem?.play('thunder');shake=Math.max(shake,level===3?6:4)}return fired;
}
function updateThunderCore(dt){
 const level=coreManager.getLevel('thunder'),stats=getThunderCoreStats();if(!level||!stats){build.thunderCd=.7;return}
 build.thunderCd=Math.max(0,(build.thunderCd??.7)-dt/timeCooldownScale());if(build.thunderCd>0)return;
 fireThunderCore(level);build.thunderCd=stats.cooldown;
}
function triggerThunder(origin,baseDamage,thunderLevel,blastLevel=0,excludedEnemy=null){
 audioSystem?.play('thunder');
 const stats=[null,
  {chance:.18,chains:2,range:220,damageScale:.46},
  {chance:.27,chains:3,range:280,damageScale:.54},
  {chance:.36,chains:4,range:350,damageScale:.62,stormRadius:72,stormScale:.34}
 ][thunderLevel];
 if(!stats||Math.random()>stats.chance||!enemies.length)return;
 let from={x:origin.x,y:origin.y};
 const struck=new Set();
 let last=null;
 for(let step=0;step<stats.chains;step++){
  const target=enemies
   .filter(enemy=>enemy!==excludedEnemy&&!struck.has(enemy)&&enemy.hp>0&&Math.hypot(enemy.x-from.x,enemy.y-from.y)<=stats.range)
   .sort((a,b)=>Math.hypot(a.x-from.x,a.y-from.y)-Math.hypot(b.x-from.x,b.y-from.y))[0];
  if(!target)break;
  struck.add(target);createLightningArc(from,target,thunderLevel);
  const killed=damageEnemy(target,baseDamage*stats.damageScale);
  last={x:target.x,y:target.y};from=last;
  if(killed)removeKilledEnemy(target,baseDamage,blastLevel);
 }
 if(thunderLevel===3&&last){
  lightningArcs.push({x1:last.x,y1:last.y,x2:last.x,y2:last.y,life:.32,maxLife:.32,level:3,burst:true,radius:stats.stormRadius,seed:Math.random()*9999});
  for(const enemy of [...enemies]){
   if(Math.hypot(enemy.x-last.x,enemy.y-last.y)>stats.stormRadius)continue;
   const killed=damageEnemy(enemy,baseDamage*stats.stormScale);
   if(killed)removeKilledEnemy(enemy,baseDamage,blastLevel);
  }
 }
}
function applyBlastPayload(projectile){
 const stats=getBlastCoreStats();
 if(stats)projectile.blastLevel=stats.level;
 return applyThunderPayload(projectile);
}
function spawnSplitBullets(x,y,baseDamage,blastLevel){
 const stats=[null,
  {count:2,damageScale:.52,speed:360,seekRadius:210},
  {count:3,damageScale:.62,speed:395,seekRadius:265},
  {count:4,damageScale:.72,speed:430,seekRadius:330}
 ][blastLevel];
 if(!stats)return;
 const candidates=enemies
  .map(enemy=>({enemy,distance:Math.hypot(enemy.x-x,enemy.y-y)}))
  .filter(item=>item.distance<=stats.seekRadius)
  .sort((a,b)=>a.distance-b.distance);
 for(let i=0;i<stats.count;i++){
  const target=candidates[i%candidates.length]?.enemy;
  let vx=0,vy=-stats.speed;
  if(target){
   const dx=target.x-x,dy=target.y-y,len=Math.hypot(dx,dy)||1;
   vx=dx/len*stats.speed;vy=dy/len*stats.speed;
  }else{
   const spread=stats.count===1?0:(i-(stats.count-1)/2)*.24;
   vx=Math.sin(spread)*stats.speed;vy=-Math.cos(spread)*stats.speed;
  }
  bullets.push({x,y,vx,vy,r:3.1,d:baseDamage*stats.damageScale,source:'split',isSplit:true,splitLevel:blastLevel,life:1.5,maxLife:1.5});
 }
 blastWaves.push({x,y,life:.34,maxLife:.34,radius:6,prevRadius:0,maxRadius:42+blastLevel*14,absorbed:0,blastCore:true});
 for(let i=0;i<8+blastLevel*3;i++){const a=Math.PI*2*i/(8+blastLevel*3),s=85+blastLevel*32+Math.random()*70;particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:.25+Math.random()*.18,max:.43,r:2+blastLevel*.45,type:'blastCore'})}
 explode(x,y,10+stats.count*2);
}
function spawnMainBullet(x,y,source='player',damageScale=null,options={}){
 bullets.push(applyBlastPayload({
  x,
  y,
  vx:options.vx||0,
  vy:options.vy||-650,
  r:(options.r||4)*(player.mainBulletSize||1),
  d:player.damage*(player.mainBulletDamageScale||1)*(damageScale??(source==='clone'?.62:1)),
  source,
  awakening:options.awakening||null,
  pierce:options.pierce||0
 }));
}
function fireMainWeapon(x,y,source='player',damageScale=null,options={}){
 const count=player.mainBulletCount||1;
 if(count===1){
  spawnMainBullet(x,y,source,damageScale,options);
 }else if(count===2){
  spawnMainBullet(x-9,y,source,damageScale,options);
  spawnMainBullet(x+9,y,source,damageScale,options);
 }else{
  spawnMainBullet(x-14,y,source,damageScale,options);
  spawnMainBullet(x,y,source,damageScale,options);
  spawnMainBullet(x+14,y,source,damageScale,options);
 }
}

function playerShoot(){
 if((IWSave?.data?.profile?.selectedFighter||'infinity')!=='infinity')return;
 audioSystem?.play('shot');
 const mainAwakening=awakeningSystem.get('main');
 if(mainAwakening){awakeningSystem.fireMainAwakening(mainAwakening);player.recoil=1;return;}
 const muzzleY=player.y-43+(player.visualY||0);
 fireMainWeapon(player.x,muzzleY,'player');
 player.recoil=1;
}
function sortiePrimaryCore(){return({infinity:'main',laser:'laser',drone:'drone',missile:'missile',thunder:'thunder'})[IWSave?.data?.profile?.selectedFighter||'infinity']||'main'}
function projectionCoreLevel(){const coreId=sortiePrimaryCore();return{coreId,level:Math.max(1,coreManager.getLevel(coreId))}}
function projectionPrimaryAwakening(){return awakeningSystem.get(projectionCoreLevel().coreId)}
function fireProjectionMainVolley(){
 const inherited=projectionCoreLevel();if(inherited.coreId!=='main')return;
 const awakening=projectionPrimaryAwakening();
 for(const clone of clonePositions()){
  if(awakening?.id==='main_piercer')bullets.push({x:clone.x,y:clone.y-45,vx:0,vy:-500,r:12,d:138*clone.damageScale,life:3.4,source:'clone',awakening:'main_piercer',pierce:7,projectionInherited:true});
  else if(awakening?.id==='main_rapid'){for(const angle of [-.42,-.28,-.14,0,.14,.28,.42]){const speed=690;bullets.push({x:clone.x,y:clone.y-40,vx:Math.sin(angle)*speed,vy:-Math.cos(angle)*speed,r:2.7,d:13*clone.damageScale,life:2.2,source:'clone',awakening:'main_rapid',projectionInherited:true})}}
  else fireMainWeapon(clone.x,clone.y-43,'clone',clone.damageScale,{projectionInherited:true});
 }
}
function fireProjectionLaserVolley(){
 const inherited=projectionCoreLevel();if(inherited.coreId!=='laser')return;
 const stats=laserStats(inherited.level),awakening=projectionPrimaryAwakening();
 clonePositions().forEach((clone,index)=>{
  const star=awakening?.id==='laser_star',reflect=awakening?.id==='laser_reflect',life=star?2.2:reflect?2.1:stats.duration;
  bullets.push({laser:true,x:clone.x,y:0,w:star?20:reflect?7:stats.width*.72,h:clone.y-20,life,maxLife:life,d:(star?140:reflect?72:stats.dps)*clone.damageScale,level:inherited.level,source:'clone',awakening:awakening?.id||null,emitterOffset:0,emitterIndex:index,projectionInherited:true,visualNodes:Array(9).fill(clone.x)});
 });
 if(clonePositions().length)shake=Math.max(shake,3);
}
function fireProjectionMissileVolley(){
 const inherited=projectionCoreLevel();if(inherited.coreId!=='missile')return;
 const stats=missileStats(inherited.level),awakening=projectionPrimaryAwakening();
 clonePositions().forEach((clone,index)=>{
  const targets=enemiesByDistance(clone.x,clone.y);
  if(awakening?.id==='missile_cluster'){for(let shot=0;shot<3;shot++){const target=targets[shot%Math.max(1,targets.length)]||null;missiles.push({x:clone.x+(shot-1)*16,y:clone.y-10,vx:(shot-1)*70,vy:-180,target,life:4.5,level:3,trail:0,damage:48*clone.damageScale,radius:46,speed:300,turn:6,awakening:'missile_cluster',cluster:true,projectionInherited:true})}}
  else if(awakening?.id==='missile_hunter'&&targets.length){const target=[...targets].sort((a,b)=>b.hp-a.hp)[0];missiles.push({x:clone.x,y:clone.y-18,vx:0,vy:-135,target,life:7,level:3,trail:0,damage:(target.boss?260:180)*clone.damageScale,radius:105,speed:235,turn:3.8,awakening:'missile_hunter',projectionInherited:true})}
  else for(let shot=0;shot<stats.count;shot++){const side=shot%2?1:-1,target=targets[shot%Math.max(1,targets.length)]||null;missiles.push({x:clone.x+side*(10+Math.floor(shot/2)*5),y:clone.y-7,vx:side*55,vy:-180,target,life:4.2,level:inherited.level,trail:0,count:stats.count,damage:stats.damage*clone.damageScale,radius:stats.radius,speed:stats.speed,turn:stats.turn,projectionInherited:true})}
 });
}
function fireProjectionDroneVolley(){
 const inherited=projectionCoreLevel();if(inherited.coreId!=='drone')return;
 const awakening=projectionPrimaryAwakening(),stats=awakening?.id==='drone_swarm'?{count:8,damage:.3}:awakening?.id==='drone_heavy'?{count:2,damage:2.08,heavy:true}:[null,{count:2,damage:.5},{count:3,damage:.62},{count:4,damage:.75}][inherited.level];
 if(!stats)return;
 for(const clone of clonePositions())for(let shot=0;shot<stats.count;shot++){
  const formation=droneFormationOffset(shot,stats.count,awakening?.id||'standard'),originX=clone.x+formation.x*.48,originY=clone.y+formation.y*.4,focus=awakening?.id==='drone_swarm'&&shot%4===3,target=nearestLivingEnemy(originX,originY);
  if(!target)continue;
  const range=[0,260,315,370][inherited.level]||370,dx=target.x-originX,dy=target.y-originY;
  if(dx*dx+dy*dy>range*range)continue;
  const speed=stats.heavy?610:690,aimAngle=Math.atan2(dy,dx)+Math.PI/2,muzzleX=originX+Math.sin(aimAngle)*13,muzzleY=originY-Math.cos(aimAngle)*13,velocity=aimedVelocity(muzzleX,muzzleY,target,speed);
  bullets.push({x:muzzleX,y:muzzleY,vx:velocity.vx,vy:velocity.vy,r:stats.heavy?9.4:focus?4.2:2.8,d:player.damage*stats.damage*(focus?1.75:1)*clone.damageScale,source:'drone',life:stats.heavy?3.4:2.4,pierce:stats.heavy?4:focus?1:0,awakening:awakening?.id||null,swarmFocus:focus,seek:focus?6.8:0,target:focus?target:null,projectionInherited:true,droneLevel:inherited.level,aimAngle});
 }
}
function fireProjectionThunderVolley(){
 const inherited=projectionCoreLevel();if(inherited.coreId!=='thunder')return;
 const stats=getThunderCoreStats();if(!stats)return;const awakening=projectionPrimaryAwakening();
 const chainCount=awakening?.id==='thunder_lance'?4:awakening?.id==='thunder_storm'?5:stats.chains,range=awakening?.id==='thunder_lance'?420:awakening?.id==='thunder_storm'?Math.max(300,W*.48):stats.range,damage=awakening?.id==='thunder_lance'?265:awakening?.id==='thunder_storm'?21:stats.damage;
 const blastLevel=coreManager.getLevel('blast');
 for(const clone of clonePositions()){
  let from=clone;const struck=new Set();
  for(let step=0;step<chainCount;step++){
   const origin=awakening?clone:from,target=enemies.filter(e=>e.hp>0&&!e.bossRetreating&&!struck.has(e)&&e.y<clone.y+16&&Math.hypot(e.x-origin.x,e.y-origin.y)<=range).sort((a,b)=>(awakening?.id==='thunder_lance'?(Number(b.boss)-Number(a.boss))||(b.hp-a.hp):Math.hypot(a.x-origin.x,a.y-origin.y)-Math.hypot(b.x-origin.x,b.y-origin.y)))[0];
   if(!target)break;struck.add(target);lightningArcs.push({x1:origin.x,y1:origin.y-28,x2:target.x,y2:target.y,life:awakening?.id==='thunder_lance'?.58:.26,maxLife:awakening?.id==='thunder_lance'?.58:.26,level:3,lance:awakening?.id==='thunder_lance',storm:awakening?.id==='thunder_storm',projectionInherited:true,seed:Math.random()*9999});const arcDamage=(target.boss&&awakening?.id==='thunder_lance'?195:target.boss&&awakening?.id==='thunder_storm'?16:damage)*clone.damageScale;if(damageEnemy(target,arcDamage))removeKilledEnemy(target,arcDamage,blastLevel);from={x:target.x,y:target.y};
  }
 }
}
function updateProjectionInheritedSkills(dt){
 const active=(build.projectionActive||0)>0&&clonePositions().length>0;
 if(!active){build.projectionMainCd=0;build.projectionMissileCd=0;build.projectionLaserState={phase:'idle',timer:0};return;}
 build.projectionMainCd-=dt;
 const inherited=projectionCoreLevel();
 if(build.projectionMainCd<=0){if(inherited.coreId==='main')fireProjectionMainVolley();else if(inherited.coreId==='drone')fireProjectionDroneVolley();else if(inherited.coreId==='thunder')fireProjectionThunderVolley();const awakening=projectionPrimaryAwakening();build.projectionMainCd=inherited.coreId==='thunder'?(awakening?.id==='thunder_storm'?.36:awakening?.id==='thunder_lance'?2.5:getThunderCoreStats().cooldown):inherited.coreId==='drone'?(awakening?.id==='drone_swarm'?.52:awakening?.id==='drone_heavy'?1.05:[0,.44,.39,.34][inherited.level]):inherited.coreId==='main'?(awakening?.id==='main_piercer'?1.55:awakening?.id==='main_rapid'?.22:.28):.28;}
 if(inherited.coreId==='missile'){
  build.projectionMissileCd-=dt;
  if(build.projectionMissileCd<=0){fireProjectionMissileVolley();const awakening=projectionPrimaryAwakening();build.projectionMissileCd=awakening?.id==='missile_cluster'?3.6:awakening?.id==='missile_hunter'?5.8:missileStats(inherited.level).cooldown;}
 }
 if(inherited.coreId==='laser'){
 const state=build.projectionLaserState||{phase:'idle',timer:0},awakening=projectionPrimaryAwakening(),stats=laserStats(inherited.level),charge=awakening?.id==='laser_star'?.8:awakening?.id==='laser_reflect'?.45:stats.charge,duration=awakening?.id==='laser_star'?2.2:awakening?.id==='laser_reflect'?2.1:stats.duration,cooldown=awakening?.id==='laser_star'?10:awakening?.id==='laser_reflect'?5.8:stats.cooldown;state.timer-=dt;
  if(state.phase==='idle'||state.phase==='cooldown'&&state.timer<=0){state.phase='charging';state.timer=charge;state.total=state.timer;}
  else if(state.phase==='charging'&&state.timer<=0){fireProjectionLaserVolley();state.phase='firing';state.timer=duration;state.total=state.timer;}
  else if(state.phase==='firing'&&state.timer<=0){state.phase='cooldown';state.timer=cooldown;state.total=state.timer;}
  build.projectionLaserState=state;
 }
}
function syncAttackCoreState(){
 const droneAwakening=awakeningSystem.get('drone');
 const droneLevel=coreManager.getLevel('drone');
 const desired=droneAwakening?.id==='drone_swarm'?8:droneAwakening?.id==='drone_heavy'?2:([0,2,3,4][droneLevel]||0);
 const mode=droneAwakening?.id||'standard';
 if(build.droneVolleyMode!==mode){build.droneVolleyMode=mode;build.droneVolleyCd=90;}
 while(drones.length<desired){
  const index=drones.length;
  drones.push({slot:index,cd:0,fireRate:440,damageScale:.55,bank:0,recoil:0,aimAngle:0,x:player.x,y:player.y+26,mode});
 }
 if(drones.length>desired)drones.length=desired;
 const droneStats=droneAwakening?.id==='drone_swarm'
  ?{fireRate:520,damageScale:.3,mode:'drone_swarm'}
  :droneAwakening?.id==='drone_heavy'
   ?{fireRate:1050,damageScale:2.08,mode:'drone_heavy'}
   :([null,{fireRate:440,damageScale:.5,mode:'standard'},{fireRate:390,damageScale:.62,mode:'standard'},{fireRate:340,damageScale:.75,mode:'standard'}][droneLevel]);
 if(droneStats)drones.forEach((d,i)=>Object.assign(d,droneStats,{slot:i}));
}
function droneFormationOffset(slot,count,mode='standard'){
 if(mode==='drone_swarm'){
  const formation=[{x:-72,y:18},{x:-24,y:18},{x:24,y:18},{x:72,y:18},{x:-54,y:52},{x:-18,y:52},{x:18,y:52},{x:54,y:52}];
  return formation[slot]||{x:0,y:46};
 }
 if(mode==='drone_heavy')return [{x:-34,y:-38},{x:34,y:-38}][slot]||{x:0,y:-38};
 const wideDroneFighter=(IWSave?.data?.profile?.selectedFighter||'infinity')==='drone';
 const side=wideDroneFighter?66:52,front=wideDroneFighter?-58:-48,rear=wideDroneFighter?54:46;
 const crossFormation=[{x:-side,y:4},{x:side,y:4},{x:0,y:front},{x:0,y:rear}];
 return crossFormation[slot]||{x:0,y:rear};
}
function dronePosition(d){
 return {x:Number.isFinite(d.x)?d.x:player.x,y:Number.isFinite(d.y)?d.y:player.y+30};
}
function aimedVelocity(x,y,target,speed){
 const dx=target.x-x,dy=target.y-y,length=Math.hypot(dx,dy)||1;
 return{vx:dx/length*speed,vy:dy/length*speed};
}
function droneTarget(d,pos){
 const level=Math.max(1,coreManager.getLevel('drone')),range=[0,260,315,370][level]||370,current=d.target;
 if(current&&current.hp>0&&!current.bossRetreating){const dx=current.x-pos.x,dy=current.y-pos.y;if(dx*dx+dy*dy<=range*range*1.25)return current}
 let best=null,bestDistance=range*range;
 for(const enemy of livingTargetSnapshot()){
  if(enemy.hp<=0||enemy.bossRetreating)continue;
  const dx=enemy.x-pos.x,dy=enemy.y-pos.y,distance=dx*dx+dy*dy;
  if(distance<bestDistance){best=enemy;bestDistance=distance}
 }
 d.target=best;return best;
}
function smoothDroneAim(current,target,dt){
 const delta=Math.atan2(Math.sin(target-current),Math.cos(target-current));
 return current+delta*(1-Math.exp(-7.5*dt));
}
function droneMuzzle(pos,angle,distance){return{x:pos.x+Math.sin(angle)*distance,y:pos.y-Math.cos(angle)*distance}}
function droneShoot(d){
 const pos=dronePosition(d),target=droneTarget(d,pos);
 if(!target)return false;
 const level=Math.max(1,coreManager.getLevel('drone')),aimAngle=Number.isFinite(d.aimAngle)?d.aimAngle:Math.atan2(target.y-pos.y,target.x-pos.x)+Math.PI/2,muzzle=droneMuzzle(pos,aimAngle,d.mode==='drone_heavy'?22:15);
 if(d.mode==='drone_swarm'){
  d.shotCount=(d.shotCount||0)+1;const focus=d.shotCount%4===0;
  const velocity=aimedVelocity(muzzle.x,muzzle.y,target,690);
  bullets.push({x:muzzle.x,y:muzzle.y,vx:velocity.vx,vy:velocity.vy,r:focus?4.2:2.1,d:player.damage*(d.damageScale||.3)*(focus?1.75:1),source:'drone',awakening:'drone_swarm',swarmFocus:focus,seek:focus?6.8:0,target:focus?target:null,pierce:focus?1:0,life:2.3,droneLevel:level,aimAngle});
 }else if(d.mode==='drone_heavy'){
  const velocity=aimedVelocity(muzzle.x,muzzle.y,target,610);
  bullets.push({x:muzzle.x,y:muzzle.y,vx:velocity.vx,vy:velocity.vy,r:9.4,d:player.damage*(d.damageScale||2.08),source:'drone',awakening:'drone_heavy',pierce:4,life:3.4,droneLevel:level,aimAngle});
  shake=Math.max(shake,2.5);
 }else{
  const velocity=aimedVelocity(muzzle.x,muzzle.y,target,610);
  bullets.push(applyBlastPayload({x:muzzle.x,y:muzzle.y,vx:velocity.vx,vy:velocity.vy,r:2.8,d:player.damage*(d.damageScale||.45),source:'drone',droneLevel:level,aimAngle}));
 }
 d.recoil=1;return true;
}
function laserStats(level){
 return [null,
  {count:1,width:8,charge:.7,duration:2.5,cooldown:3,dps:58},
  {count:1,width:12,charge:.55,duration:3,cooldown:2.5,dps:84},
  {count:2,width:9,charge:.4,duration:3,cooldown:2,dps:78}
 ][level];
}
function laserEmitterPositions(level){
 const stats=laserStats(level);if(!stats)return [];
 const offsets=stats.count===2?[-30,30]:[0];
 const emitters=[{x:player.x,y:player.y,source:'player',emitterIndex:-1}];
 return emitters.flatMap(emitter=>offsets.map(offset=>({...emitter,offset,x:emitter.x+offset})));
}
function laserFire(level){
 audioSystem?.play('laser');
 const stats=laserStats(level);if(!stats)return;
 for(const emitter of laserEmitterPositions(level)){
  const nodeCount=mobilePerf?.enabled?(mobilePerf.quality<.7?5:7):9;
  bullets.push({laser:true,x:emitter.x,y:0,w:stats.width*(emitter.source==='clone'?.58:1),h:emitter.y-20,life:stats.duration,maxLife:stats.duration,d:stats.dps*(emitter.source==='clone'?.72:1),level,source:emitter.source,emitterOffset:emitter.offset,emitterIndex:emitter.emitterIndex,visualNodes:Array(nodeCount).fill(emitter.x),damageTick:0});
 }
 shake=Math.max(shake,level===3?10:7);
}
function updateLaserCore(dt,level){
 if(!level){build.laserState={phase:'cooldown',timer:0,level:0};return;}
 const stats=laserStats(level);
 if(!build.laserState||build.laserState.level!==level)build.laserState={phase:'cooldown',timer:Math.min(1.4,stats.cooldown*.2),level};
 const state=build.laserState;state.timer-=dt;
 if(state.phase==='cooldown'&&state.timer<=0){state.phase='charging';state.timer=stats.charge;state.total=stats.charge;}
 else if(state.phase==='charging'){
  state.total=stats.charge;
  const chargeRate=mobilePerf?.enabled?18+18*mobilePerf.quality:42;
  if(Math.random()<dt*chargeRate){
   for(const emitter of laserEmitterPositions(level)){
    const a=Math.random()*Math.PI*2,r=12+Math.random()*25;
    particles.push({x:emitter.x+Math.cos(a)*r,y:emitter.y-27+Math.sin(a)*r,vx:-Math.cos(a)*(35+Math.random()*45),vy:-Math.sin(a)*(35+Math.random()*45),life:.18+Math.random()*.18,max:.36,r:1.1+Math.random()*1.7,type:'laserCharge'});
   }
  }
  if(state.timer<=0){laserFire(level);state.phase='firing';state.timer=stats.duration;state.total=stats.duration;}
 }else if(state.phase==='firing'&&state.timer<=0){state.phase='cooldown';state.timer=stats.cooldown;state.total=stats.cooldown;}
}
function missileStats(level){return [null,{count:1,damage:58,radius:54,speed:275,turn:4.8,cooldown:3.05},{count:2,damage:72,radius:68,speed:310,turn:6.2,cooldown:2.55},{count:4,damage:86,radius:82,speed:345,turn:7.8,cooldown:2.05}][level]}
function livingTargetSnapshot(){
 if(build.targetCacheFrame!==elapsed){build.targetCacheFrame=elapsed;build.targetCache=enemies.filter(e=>e.hp>0&&!e.bossRetreating)}
 return build.targetCache;
}
function enemiesByDistance(x,y){return livingTargetSnapshot().slice().sort((a,b)=>{const adx=a.x-x,ady=a.y-y,bdx=b.x-x,bdy=b.y-y;return adx*adx+ady*ady-(bdx*bdx+bdy*bdy)})}
function fireMissiles(level){
 audioSystem?.play('missile');
 const stats=missileStats(level);if(!stats)return;
 const launchers=[{x:player.x,y:player.y,scale:1}];
 for(const launcher of launchers){const targets=enemiesByDistance(launcher.x,launcher.y);for(let i=0;i<stats.count;i++){
 const side=i%2?1:-1,target=targets[i%Math.max(1,targets.length)]||null;
  const launchX=launcher.x+side*(16+Math.floor(i/2)*7),launchY=launcher.y-4;
  missiles.push({x:launchX,y:launchY,vx:side*(65+Math.floor(i/2)*20),vy:-185,target,life:4.2,level,trail:0,...stats,damage:stats.damage*launcher.scale});
  const launchFx=mobilePerf?.enabled?Math.max(2,Math.round((2+level)*mobilePerf.quality)):3+level;
  for(let p=0;p<launchFx;p++)particles.push({x:launchX+(Math.random()-.5)*7,y:launchY+8,vx:side*(20+Math.random()*30),vy:75+Math.random()*85,life:.22+Math.random()*.16,max:.38,r:1.8+level*.45,type:'missileLaunch',missileLevel:level});
 }}
}
function explodeMissile(m){
 audioSystem?.play(m.awakening==='missile_hunter'?'explosionLarge':'explosionSmall');
 if(m.cluster&&!m.clusterChild){const liveTargets=enemies.filter(e=>e.hp>0);for(let i=0;i<6;i++){const a=-Math.PI/2+(i-2.5)*.30,target=liveTargets[i%Math.max(1,liveTargets.length)]||null;missiles.push({x:m.x,y:m.y,vx:Math.cos(a)*245,vy:Math.sin(a)*245,target,life:3,level:2,trail:0,damage:22,radius:28,speed:365,turn:9.4,awakening:'missile_cluster',clusterChild:true});}for(let i=0;i<10;i++){const a=Math.PI*2*i/10;particles.push({x:m.x,y:m.y,vx:Math.cos(a)*(90+Math.random()*120),vy:Math.sin(a)*(90+Math.random()*120),life:.28,max:.28,r:2.5,type:'laserCharge'})}}
 lightningArcs.push({x1:m.x,y1:m.y,x2:m.x,y2:m.y,life:m.awakening==='missile_hunter'?.48:.3,maxLife:m.awakening==='missile_hunter'?.48:.3,level:3,burst:true,radius:m.radius,seed:Math.random()*9999,missile:true,awakening:m.awakening});
 for(const enemy of [...enemies])if(enemyHitTest(enemy,m.x,m.y,m.radius)){const killed=damageEnemy(enemy,m.damage);if(killed)removeKilledEnemy(enemy,m.damage,coreManager.getLevel('blast'))}
 for(let i=0;i<22;i++){const a=Math.random()*Math.PI*2,s=70+Math.random()*250;particles.push({x:m.x,y:m.y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:.25+Math.random()*.35,max:.6,r:1.8+Math.random()*3.8,type:'missile'})}
 shake=Math.max(shake,m.awakening==='missile_hunter'?19:m.awakening==='missile_cluster'?14:12);
}
function enemyBulletLimit(){const quality=(typeof mobilePerf!=='undefined'&&mobilePerf.enabled)?mobilePerf.quality:1;return (typeof mobilePerf!=='undefined'&&mobilePerf.enabled)?Math.round(95+105*quality):320}
function enemyBulletVisualType(type,damage){
 if(type==='purple'&&damage<=10)return 'purple';
 if(damage>=19)return 'red';
 if(damage>=13)return 'orange';
 return 'cyan';
}
function pushEnemyBullet(x,y,vx,vy,r,type,damage){if(enemyBullets.length>=enemyBulletLimit())return false;const visualType=enemyBulletVisualType(type,damage),bullet={x,y,vx,vy,r,type:visualType,damage,angle:Math.atan2(vy,vx)};enemyBullets.push(bullet);return bullet}
const ENEMY_ATTACK_INTERVAL=Object.freeze({scout:1120,raider:820,heavy:2180,sniper:2650,barrage:1280,carrier:2350,jammer:1720});
function enemyAttackInterval(e,threat){const base=ENEMY_ATTACK_INTERVAL[e.type]||1450,pressure=Math.min(e.type==='sniper'?260:420,threat*(e.type==='barrage'?45:e.type==='raider'?28:34));return Math.max(e.type==='raider'?620:e.type==='barrage'?900:e.type==='scout'?780:1050,base-pressure)}
function bossPhase(e){const ratio=e.hp/e.max;return ratio<=.3?3:ratio<=.6?2:1}
function bossModes(e,phase){
 if(Array.isArray(e.bossModes))return e.bossModes;
 const number=Math.max(1,e.bossNumber||e.bossStage||1);
 const modes=number<=4?['fan','ring']:[
  ['fanStrong','ringStrong','guard'],
  ['aimed','beam','guard'],
  ['fanStrong','crossfire','guard'],
  ['ringStrong','rain','guard'],
  ['nova','sweep','guard'],
  ['fanStrong','ringStrong','beam','guard','finalBarrage']
 ][Math.min(BOSS_TOTAL,number)-5];
 if(phase===1)return modes;
 return modes.map(mode=>phase===3&&mode==='fan'?'fanStrong':phase>=2&&mode==='ring'?'ringStrong':mode);
}
function summonBossGuards(e){
 if(enemies.some(x=>x.bossGuardFor===e))return;
 const number=e.bossNumber||e.bossStage||5;
 const count=number>=10?5:number>=8?4:3;
 for(let i=0;i<count;i++){
  const offset=(i-(count-1)/2)*68,hp=125+number*28;
  enemies.push({type:'scout',bossGuard:true,bossGuardFor:e,x:Math.max(48,Math.min(W-48,e.x+offset)),y:e.y+88,r:17,hp,max:hp,v:0,shoot:1050+i*130,dir:0,age:0,rewardless:true});
 }
 e.guardActive=true;
}
function spawnBossLaser(e,mode){
 const warning=mode==='sweep'?1.45:1.2;
 const duration=mode==='sweep'?3.35:1.35;
 const width=mode==='sweep'?12:16;
 const startX=mode==='sweep'?Math.max(W*.22,Math.min(W*.78,e.x)):Math.max(45,Math.min(W-45,player.x));
 enemyLasers.push({boss:e,mode,x:startX,y:e.y+32,width,warning,duration,life:warning+duration,damage:mode==='sweep'?24:28,tick:0,sweepDir:e.dir||1});
}
function angleDelta(a,b){return Math.atan2(Math.sin(a-b),Math.cos(a-b))}
function fireGapRing(x,y,count,speed,damage,gapAngle,gapWidth=.42,offset=0){
 for(let i=0;i<count;i++){const a=i*Math.PI*2/count+offset;if(Math.abs(angleDelta(a,gapAngle))<gapWidth)continue;pushEnemyBullet(x,y,Math.cos(a)*speed,Math.sin(a)*speed,5.4,damage>=18?'orange':'purple',damage)}
}
function launchBossHomingBullet(e,side=0,phase=1){
 const x=e.x+side*Math.min(82,e.hitRx*.55),y=e.y+34,dx=player.x-x,dy=player.y-y,len=Math.hypot(dx,dy)||1;
 const b=pushEnemyBullet(x,y,dx/len*128+side*36,dy/len*128,8,'orange',phase>=3?20:17);
 if(b)Object.assign(b,{bossHoming:2.1,turnRate:phase>=3?2.15:1.65,speed:phase>=3?180:158,splitOnExpire:false});
}
function fireBossLaneWall(e,phase=1,omega=false){
 const columns=omega?11:9,spacing=(W-30)/(columns-1),safeIndex=Math.max(1,Math.min(columns-2,Math.round((player.x-15)/spacing))),speed=omega?225:198;
 for(let i=0;i<columns;i++){if(Math.abs(i-safeIndex)<=1)continue;const b=pushEnemyBullet(15+i*spacing,omega?12:e.y+36,(i-safeIndex)*2.5,speed,omega?6:5.5,omega?'orange':'purple',omega?19:17);if(b)b.laneShot=true}
 e.bossSafeLane=safeIndex;e.bossSafeLaneUntil=elapsed+1.1;
}
function fireBossMode(e,mode,phase=1){
 if(mode==='guard'){summonBossGuards(e);
 }else if(mode==='royalSplit'){
  const base=Math.atan2(player.y-(e.y+34),player.x-e.x),shellCount=phase>=3?3:2;
  for(let i=0;i<shellCount;i++){const offset=(i-(shellCount-1)/2)*.24,a=base+offset,b=pushEnemyBullet(e.x+(i-(shellCount-1)/2)*28,e.y+34,Math.cos(a)*124,Math.sin(a)*124,10,'orange',16);if(b)Object.assign(b,{splitTimer:.92+i*.08,splitCount:phase>=3?12:10,splitSpeed:158+(phase-1)*10,splitDamage:13,splitGapAngle:base,splitGapWidth:.5})}
 }else if(mode==='beholsterCombo'){
  fireGapRing(e.x,e.y+22,16,155,13,Math.atan2(player.y-e.y,player.x-e.x),.48,e.age*.12);launchBossHomingBullet(e,-1,phase);launchBossHomingBullet(e,1,phase);
 }else if(mode==='hunterCombo'){
  for(let a=-.96;a<=.96;a+=.27)pushEnemyBullet(e.x,e.y+34,Math.sin(a)*205,Math.cos(a)*205,6,'orange',18);spawnBossLaser(e,'beam');
 }else if(mode==='wallLanes'){
  fireBossLaneWall(e,phase,false);
 }else if(mode==='carrierCombo'){
  summonBossGuards(e);launchBossHomingBullet(e,-1,phase);launchBossHomingBullet(e,1,phase);
 }else if(mode==='voidTorpedo'){
  launchBossHomingBullet(e,-1,phase);launchBossHomingBullet(e,1,phase);
 }else if(mode==='omegaStarRing'){
  fireGapRing(e.x,e.y+24,22,180,18,Math.atan2(player.y-e.y,player.x-e.x),.38,e.age*.18);fireGapRing(e.x,e.y+24,18,232,19,Math.atan2(player.y-e.y,player.x-e.x)+.7,.42,e.age*.18+.18);
 }else if(mode==='bulletWall'){
  fireBossLaneWall(e,phase,true);
 }else if(mode==='omegaCombo'){
  fireBossLaneWall(e,phase,true);spawnBossLaser(e,'sweep');
 }else if(mode==='fan'){
  const count=phase===1?7:phase===2?9:11,spread=phase===1?1.42:1.72,offset=(e.bossVolleyRemaining||0)%2?.07:-.07;
  for(let i=0;i<count;i++){const a=-spread/2+i*spread/(count-1)+offset;pushEnemyBullet(e.x,e.y+32,Math.sin(a)*(188+phase*8),Math.cos(a)*(188+phase*8),5.7,'purple',14+phase-1)}
 }else if(mode==='fanStrong'){
  for(let a=-1.08;a<=1.08;a+=.22)pushEnemyBullet(e.x,e.y+34,Math.sin(a)*230,Math.cos(a)*230,7,'orange',20);
 }else if(mode==='ring'||mode==='ringStrong'){
  const count=mode==='ringStrong'?18:14,speed=mode==='ringStrong'?205:176,damage=mode==='ringStrong'?18:13;
  for(let i=0;i<count;i++){const a=i*Math.PI*2/count+e.age*.24;pushEnemyBullet(e.x,e.y+18,Math.cos(a)*speed,Math.sin(a)*speed,5.5,mode==='ringStrong'?'orange':'purple',damage)}
 }else if(mode==='aimed'){
  const base=Math.atan2(player.y-e.y,player.x-e.x),count=phase===3?7:5;
  for(let i=0;i<count;i++){const a=base+(i-(count-1)/2)*.12;pushEnemyBullet(e.x,e.y+30,Math.cos(a)*245,Math.sin(a)*245,5.5,'red',17)}
 }else if(mode==='spiral'){
  for(let arm=0;arm<2;arm++)for(let i=0;i<8;i++){const a=e.age*1.25+arm*Math.PI+i*.32;pushEnemyBullet(e.x,e.y+20,Math.cos(a)*(165+i*6),Math.sin(a)*(165+i*6),5,'purple',15)}
 }else if(mode==='crossfire'){
  for(let i=0;i<8;i++){const a=i*Math.PI/4+e.age*.15;pushEnemyBullet(e.x,e.y+20,Math.cos(a)*225,Math.sin(a)*225,6,'orange',18)}
 }else if(mode==='rain'){
  for(let i=0;i<11;i++){const x=22+i*(W-44)/10;pushEnemyBullet(x,18,(Math.random()-.5)*35,190+(i%3)*24,5.2,'purple',16)}
 }else if(mode==='nova'){
  for(let ring=0;ring<2;ring++)for(let i=0;i<14;i++){const a=i*Math.PI*2/14+ring*Math.PI/14;pushEnemyBullet(e.x,e.y+18,Math.cos(a)*(165+ring*62),Math.sin(a)*(165+ring*62),5.5,ring?'orange':'purple',18)}
 }else if(mode==='finalBarrage'){
  fireBossMode(e,'fanStrong',phase);fireBossMode(e,'ringStrong',phase);fireBossMode(e,'aimed',phase);
 }else if(mode==='beam'||mode==='sweep')spawnBossLaser(e,mode);
}
function updateBossAttackPattern(e,dt){
 const phase=bossPhase(e);
 if(e.bossPhase!==phase){e.bossPhase=phase;e.bossModeIndex=0;e.bossVolleyRemaining=e.bossVolleyCount||3;e.bossActionCd=.8}
 const modes=bossModes(e,phase);
 e.bossModeMorph=Math.min(1,(e.bossModeMorph||0)+dt*2.8);
 e.bossActionCd-=dt;
 if(e.bossActionCd>0)return;
 const mode=modes[e.bossModeIndex];
 if((e.bossVolleyRemaining||0)>0){
  fireBossMode(e,mode,phase);e.bossVolleyRemaining--;
  const interval=mode==='guard'?1.15:(mode==='beam'||mode==='sweep'||mode==='omegaCombo'||mode==='hunterCombo')?1.35:['nova','finalBarrage','omegaStarRing'].includes(mode)?.95:['royalSplit','beholsterCombo','carrierCombo'].includes(mode)?1.18:['wallLanes','bulletWall','voidTorpedo'].includes(mode)?.88:mode.includes('ring')?.72:.52;
  e.bossActionCd=interval;
  if(mode==='guard')e.bossVolleyRemaining=0;
 }else{
  e.bossModeIndex=(e.bossModeIndex+1)%modes.length;e.bossModeMorph=0;
  const nextMode=modes[e.bossModeIndex],laserMode=nextMode.includes('beam')||nextMode==='sweep'||nextMode==='omegaCombo'||nextMode==='hunterCombo';
  const baseCount=e.bossVolleyCount||3;e.bossVolleyRemaining=laserMode?Math.min(2,baseCount):nextMode==='guard'?1:baseCount;
  e.bossActionCd=Math.max(.85,1.35-(e.bossStage||1)*.07);
 }
}

function bountyTargetShoot(e){
 const muzzleY=e.y+Math.max(14,e.r*.48);
 if(muzzleY>=player.y-36)return;
 const phase=e.enraged?2:(e.hp/e.max<.5?2:1);
 e.bountyPattern=((e.bountyPattern||0)+1)%3;
 if(e.bountyPattern===0){
  const count=phase===2?9:7;
  const spread=phase===2?.92:.72;
  for(let i=0;i<count;i++){const a=-spread+(spread*2)*(i/(count-1));pushEnemyBullet(e.x,muzzleY,Math.sin(a)*205,Math.cos(a)*205,5.2,'orange',phase===2?17:14)}
 }else if(e.bountyPattern===1){
  const speed=phase===2?285:245;
  const base=Math.atan2(player.y-muzzleY,player.x-e.x);
  for(let i=-1;i<=1;i++){const a=base+i*.12;pushEnemyBullet(e.x+i*8,muzzleY,Math.cos(a)*speed,Math.sin(a)*speed,4.8,'red',phase===2?19:16)}
 }else{
  const count=phase===2?16:12;
  for(let i=0;i<count;i++){const a=Math.PI*2*i/count+elapsed*.35;pushEnemyBullet(e.x,muzzleY,Math.cos(a)*155,Math.sin(a)*155,4.4,'purple',phase===2?13:11)}
 }
}
function enemyShoot(e){
 if(e.boss)return;
 if(e.huntTarget){bountyTargetShoot(e);return;}
 const muzzleY=e.y+Math.max(10,e.r*.55);if(muzzleY>=player.y-28||e.y>H-SAFE_BOTTOM-45)return;
 if(e.type==='sniper'){if(e.sniperAim==null){e.sniperAim=e.sniperAimDuration||2;e.sniperLockX=player.x;e.sniperLockY=player.y;e.shoot=999999}return}
 if(e.type==='barrage'){
  for(let a=-.72;a<=.72;a+=.24)pushEnemyBullet(e.x,muzzleY,Math.sin(a)*190,Math.cos(a)*190,5,'orange',16);return;
 }
 if(e.type==='raider'){
  const speed=255;
  for(let i=0;i<6;i++){const lag=i*9*e.dir;pushEnemyBullet(e.x-lag,muzzleY-i*2,-e.dir*(18+i*2),speed+i*7,4.2,'yellow',7)}
  return;
 }
 const speed=e.type==='heavy'?125:e.type==='jammer'?150:205;
 const distance=Math.hypot(player.x-e.x,player.y-muzzleY),travel=Math.min(1.15,distance/speed);
 const lead=e.type==='heavy'?.22:.42;
 let targetX=player.x+player.vx*travel*lead,targetY=player.y+player.vy*travel*lead;
 targetX=Math.max(18,Math.min(W-18,targetX));targetY=Math.max(muzzleY+70,Math.min(H-SAFE_BOTTOM-18,targetY));
 let dx=targetX-e.x,dy=Math.max(70,targetY-muzzleY);const maxSide=dy*.72;dx=Math.max(-maxSide,Math.min(maxSide,dx));
 const len=Math.hypot(dx,dy)||1;
 const type=e.type==='jammer'?'purple':e.type==='heavy'?'red':'cyan';
 const damage=e.type==='jammer'?10:e.type==='heavy'?18:10;
 pushEnemyBullet(e.x,muzzleY,dx/len*speed,dy/len*speed,e.type==='heavy'?6:e.type==='jammer'?7:5,type,damage);
}
function fireSniperLaser(e){
 const x1=e.x,y1=e.y+Math.max(10,e.r*.55),targetX=Number.isFinite(e.sniperLockX)?e.sniperLockX:player.x,targetY=Number.isFinite(e.sniperLockY)?e.sniperLockY:player.y;
 let dx=targetX-x1,dy=targetY-y1,len=Math.hypot(dx,dy)||1;dx/=len;dy/=len;const reach=Math.max(W,H)*2.4;
 enemyLasers.push({boss:e,mode:'sniper',sniper:true,x:x1,y:y1,x1,y1,x2:x1+dx*reach,y2:y1+dy*reach,width:3,warning:0,duration:2,life:2,damage:13,tick:0});
}
function releaseCarrierDrones(e){
 for(let i=0;i<(e.spawnCount||3);i++){
  const child=makeEnemy('scout');const childHp=Math.round((20+threatLevel()*3)*(1+(enemyDurabilityScale('scout')-1)*.55));Object.assign(child,{x:e.x+(i-1)*22,y:e.y+8,hp:childHp,max:childHp,v:145,shoot:850+i*140});enemies.push(battleEventSystem.decorateSpawnedEnemy(child));
 }
}
function suicideBlast(e){
 lightningArcs.push({x1:e.x,y1:e.y,x2:e.x,y2:e.y,life:.28,maxLife:.28,level:2,burst:true,radius:72,seed:Math.random()*9999,missile:true});
 for(const other of [...enemies])if(other!==e&&Math.hypot(other.x-e.x,other.y-e.y)<72)other.hp-=40;
}
function enemyReward(e){
 if(e.rewardless)return [0,0];
 if(e.boss){const tier=e.bossStage||1;if(e.projectionBoss)return [100,180+tier*75];return [100,300+tier*180+(e.awakenedBoss?260:0)]}
 const data={scout:[1,7],heavy:[2,17],sniper:[2,13],suicide:[2,11],support:[2,18],barrage:[3,21],raider:[3,12],carrier:[5,26],jammer:[3,17]};
 return [...(data[e.type]||[30,8])];
}
function spawnExperienceFragments(e,total){
 if(total<=0)return;
 const count=Math.min(e.boss?60:120,Math.max(1,Math.ceil(total/(e.boss?20:5))));
 const base=Math.floor(total/count),extra=total%count;
 for(let i=0;i<count;i++){
  const a=Math.random()*Math.PI*2,s=38+Math.random()*88;
  pickups.push({type:'xpShard',x:e.x,y:e.y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:18,age:0,r:e.boss?5.8:4.6,xp:base+(i<extra?1:0)});
 }
}
function barrierChargeValue(e){
 if(e.boss)return 45;
 if(['heavy','support','barrage','carrier','jammer'].includes(e.type))return 9;
 return 3;
}
function addBarrierCharge(amount){
 if(bombs>=3)return;
 build.barrierCharge=Math.min(100,(build.barrierCharge||0)+amount);
 if(build.barrierCharge>=100){
  build.barrierCharge-=100;bombs=Math.min(3,bombs+1);toast('亚空间屏障核心重构完成');
 }
}
function maybeDropRepair(e){
 if(awakeningSystem.isCoreAwakened('repair'))return;
 const repairLevel=coreManager.getLevel('repair');if(!repairLevel)return;
 if(pickups.filter(p=>p.type==='repair').length>=2)return;
 const elite=e.boss||['heavy','support','barrage','carrier','jammer'].includes(e.type);
 const chance=e.boss?1:(elite?[0,.12,.20,.30][repairLevel]:[0,.04,.07,.10][repairLevel]);
 if(Math.random()>chance)return;
 const large=e.boss||(repairLevel===3&&elite&&Math.random()<.45);
 pickups.push({type:'repair',x:e.x,y:e.y,vx:(Math.random()-.5)*24,vy:145,life:14,r:large?11:8,heal:large?30:[0,10,15,20][repairLevel]});
}
function updateDefenseCores(dt){
 const shieldLevel=coreManager.getLevel('shield');
 if(shieldLevel){
  const maxLayers=[0,1,2,3][shieldLevel],delay=[0,8,6.5,5][shieldLevel],interval=[0,10,8,6.5][shieldLevel];
  if((build.shieldLayers||0)<maxLayers&&elapsed-(build.lastHitAt||-99)>=delay){
   build.shieldRecharge=(build.shieldRecharge||0)+dt;
   if(build.shieldRecharge>=interval){build.shieldRecharge=0;build.shieldLayers++;}
  }else build.shieldRecharge=0;
 }else build.shieldLayers=0;
 const timeLevel=coreManager.getLevel('time');
 if(timeLevel){
  build.chronoCd-=dt;
  if(build.chronoCd<=0){
   const duration=[0,3,4,2.2][timeLevel];build.chronoActive=duration;build.chronoCd=[0,12,10,13][timeLevel];
  }
 }
 build.chronoActive=Math.max(0,(build.chronoActive||0)-dt);
}

function nearestLivingEnemy(x,y,exclude=null){let best=null,bestD=Infinity;for(const e of livingTargetSnapshot()){if(e===exclude||e.hp<=0||e.bossRetreating)continue;const dx=e.x-x,dy=e.y-y,d=dx*dx+dy*dy;if(d<bestD){bestD=d;best=e}}return best}
function timeCooldownScale(){return coreManager.getLevel('time')>=2?.82:1;}
function damageEnemy(e,d,opts={}){
 if(e.bossRetreating||e.bossEntering)return false;
 if(e.boss){const guards=enemies.filter(g=>g.bossGuardFor===e&&g.hp>0);e.guardActive=guards.length>0;if(e.guardActive&&!opts.piercing){e.guardFlash=.16;return false}if(e.guardActive&&opts.piercing)d*=.42;}
 if(e.shield>0){const absorbed=Math.min(e.shield,d);e.shield-=absorbed;d-=absorbed;if(d<=0)return false;}
 e.lastHitAt=elapsed;e.hp-=d;if(e.hp<=0){audioSystem?.play(e.boss||e.type==='carrier'?'explosionLarge':'explosionSmall');const archiveId=e.boss?`boss-${e.bossNumber||e.bossStage}`:e.type;if(typeof markEnemyDefeated==='function')markEnemyDefeated(archiveId);if(IWSave){const list=IWSave.data.progression.defeated;if(!list.includes(archiveId))list.push(archiveId);IWSave.data.progression.highestThreat=Math.max(IWSave.data.progression.highestThreat,(e.bossStage||1)-1);IWSave.commit()}const [points,experience]=enemyReward(e);score+=points;spawnExperienceFragments(e,experience);build.killWindow.push(elapsed);addBarrierCharge(barrierChargeValue(e));maybeDropRepair(e);if(e.type==='carrier')releaseCarrierDrones(e);if(e.type==='suicide')suicideBlast(e);if(e.boss){build.bossesDefeated=(build.bossesDefeated||0)+1;advanceBossDirector(e.bossNumber);if(e.wreckStory)releaseTierThreeWreck();if(e.finalBoss){build.finalBossDefeated=true;toast('最终 Boss 已击毁 · 终焉信号消散','important');setTimeout(()=>{if(build?.finalBossDefeated)showChapterComplete?.()},2200)}else if(!e.wreckStory)toast(`${e.bossName}${e.projectionBoss?'投影':'真身'}已击毁 · 大量经验释放`);for(let burst=0;burst<5;burst++)explode(e.x+(Math.random()-.5)*e.r*1.4,e.y+(Math.random()-.5)*e.r*1.1,18);blastWaves.push({x:e.x,y:e.y,life:.72,maxLife:.72,radius:18,prevRadius:0,maxRadius:e.r*2.8,absorbed:0,temporalCollapse:true});shake=Math.max(shake,22)}else build.bossDirectorProgress=(build.bossDirectorProgress||0)+1;if(!e.wreckStory)awakeningSystem.onEnemyKilled(e,opts);battleEventSystem.onEnemyKilled(e);if(!e.boss)explode(e.x,e.y,e.type==='carrier'?30:18);return true}return false
}
function despawnTimedBoss(e){
 if(e.bossRetreating)return;
 advanceBossDirector(e.bossNumber);
 e.bossRetreating=true;e.retreatTime=1.6;e.retreatFxCd=0;e.bossTimeLeft=0;
 for(let i=enemies.length-1;i>=0;i--)if(enemies[i].bossGuardFor===e)enemies.splice(i,1);
 clearEntityArray(enemyBullets);enemyLasers.length=0;
 blastWaves.push({x:e.x,y:e.y,life:.55,maxLife:.55,radius:14,prevRadius:0,maxRadius:e.r*1.8,absorbed:0,temporalCollapse:true});
 shake=Math.max(shake,9);toast(e.projectionBoss?`${e.bossName} 投影正在相位消散 · 未获得奖励`:`${e.bossName} 正在撤离 · 未获得奖励`);
}
function playerCombatRadius(){const layers=Math.max(0,Math.min(3,build?.shieldLayers||0));return layers?64:player.r}
function damagePlayer(d){
 audioSystem?.play('damage');
 if(awakeningSystem.onPlayerDamage(d))return;
 if(build?.debugLockHp){player.hp=Math.max(1,player.hp);return}
 if(player.inv>0)return;build.lastHitAt=elapsed;
 if((build.shieldLayers||0)>0){build.shieldLayers--;player.inv=.42;shake=8;toast('偏转护层承受冲击');if(coreManager.getLevel('shield')===3){for(let i=enemyBullets.length-1;i>=0;i--)if(Math.hypot(enemyBullets[i].x-player.x,enemyBullets[i].y-player.y)<150)enemyBullets.splice(i,1);blastWaves.push({x:player.x,y:player.y,life:.35,maxLife:.35,radius:18,prevRadius:0,maxRadius:150,absorbed:0,shieldPulse:true});}return;}
 player.hp-=d;player.inv=.65;shake=12;
 if(player.hp<=0&&build.rewind&&!build.rewindUsed&&rewindHistory.length){const snap=rewindHistory[0];Object.assign(player,{x:snap.x,y:snap.y,hp:Math.max(35,snap.hp)});clearEntityArray(enemyBullets);enemyLasers=[];build.rewindUsed=1;toast('回溯保险已启动');return}
 if(player.hp<=0&&awakeningSystem.onLethalDamage())return;
 if(player.hp<=0)startDeathSequence()
}
function startDeathSequence(){
 if(dying)return;
 dying=true;paused=false;state='dying';deathTimer=0;deathFade=0;player.hp=0;player.inv=999;
 clearEntityArray(enemyBullets);enemyLasers=[];explode(player.x,player.y,90);shake=22;
 toast('机体严重受损');
}
function pulse(){
 if(!running||paused||dying||bombs<=0)return;
 audioSystem?.play('barrier');
 const spentIndex=bombs-1;bombs--;animateBarrierUse(spentIndex);
 const absorbedBullets=enemyBullets.length;clearEntityArray(enemyBullets);if(typeof enemyLasers!=='undefined')enemyLasers.length=0;
 blastWaves.push({x:player.x,y:player.y,life:.82,maxLife:.82,radius:18,prevRadius:0,maxRadius:Math.hypot(W,H),absorbed:absorbedBullets});
 for(const e of enemies)e.hp-=120;
 shake=16;updateUI();toast(bombs>0?'亚空间屏障剩余 '+bombs:'亚空间屏障能量耗尽')
}
function explode(x,y,n=18){const load=(enemies.length+enemyBullets.length*.045+particles.length*.025);n=Math.max(5,Math.min(n,load>30?10:load>20?14:28));for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,s=40+Math.random()*230;particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:.25+Math.random()*.55,max:.8,r:2+Math.random()*4})}shake=9}
function trimEntityPools(){
 const pressure=enemies.length+enemyBullets.length*.06+bullets.length*.025+particles.length*.018;
 const q=mobilePerf?.enabled?mobilePerf.quality:1,particleCap=mobilePerf?.enabled?Math.round((pressure>34?145:185)*(.72+.28*q)):(pressure>34?220:300),arcCap=mobilePerf?.enabled?Math.round(18+12*q):(pressure>34?28:42);
 const limits=[[particles,particleCap],[bullets,pressure>34?180:230],[missiles,36],[enemyBullets,pressure>34?150:190],[lightningArcs,arcCap],[blastWaves,6],[pickups,120]];
 for(const [pool,max] of limits)if(pool.length>max)pool.splice(0,pool.length-max);
 if(build.killWindow.length>120)build.killWindow.splice(0,build.killWindow.length-120);
}
function hardSanitizeCombatState(){
 const finite=(value,fallback=0)=>Number.isFinite(value)?value:fallback;
 const clamp=(value,min,max,fallback=min)=>Math.max(min,Math.min(max,finite(value,fallback)));
 const sanitizePool=(pool,max,fix)=>{
  if(!Array.isArray(pool))return;
  for(let i=pool.length-1;i>=0;i--){
   const item=pool[i];
   if(!item||!Number.isFinite(item.x)||!Number.isFinite(item.y)){pool.splice(i,1);continue}
   fix?.(item);
  }
  if(pool.length>max)pool.splice(0,pool.length-max);
 };
 sanitizePool(enemies,72,e=>{e.x=clamp(e.x,-120,W+120);e.y=clamp(e.y,-180,H+180);e.r=clamp(e.r,4,90,18);e.hp=finite(e.hp,1);e.max=Math.max(1,finite(e.max,e.hp));e.age=clamp(e.age,0,1e6,0);e.dir=finite(e.dir,1)>=0?1:-1;e.shield=clamp(e.shield,0,1e7,0);e.fuse=clamp(e.fuse,-1,30,0)});
 sanitizePool(enemyBullets,enemyBulletLimit(),b=>{b.x=clamp(b.x,-80,W+80);b.y=clamp(b.y,-100,H+100);b.vx=clamp(b.vx,-1600,1600);b.vy=clamp(b.vy,-1600,1600);b.r=clamp(b.r,1,18,5);b.damage=clamp(b.damage,0,250,8)});
 sanitizePool(bullets,Math.round(230*(.72+.28*((typeof mobilePerf!=='undefined'&&mobilePerf.enabled)?mobilePerf.quality:1))),b=>{b.x=clamp(b.x,-80,W+80);b.y=clamp(b.y,-120,H+120);b.vx=clamp(b.vx,-2200,2200);b.vy=clamp(b.vy,-2200,2200);b.r=clamp(b.r,.5,18,3);b.w=clamp(b.w,.5,36,4);b.h=clamp(b.h,1,H+80,14);b.life=clamp(b.life,-1,12,2)});
 sanitizePool(missiles,36,m=>{m.x=clamp(m.x,-100,W+100);m.y=clamp(m.y,-120,H+120);m.vx=clamp(m.vx,-1300,1300);m.vy=clamp(m.vy,-1300,1300);m.life=clamp(m.life,0,12,3)});
 sanitizePool(particles,Math.round((mobilePerf?.enabled?190:300)*(.48+.52*((typeof mobilePerf!=='undefined'&&mobilePerf.enabled)?mobilePerf.quality:1))),p=>{p.x=clamp(p.x,-100,W+100);p.y=clamp(p.y,-120,H+120);p.vx=clamp(p.vx,-1800,1800);p.vy=clamp(p.vy,-1800,1800);p.r=clamp(p.r,.1,42,2);p.life=clamp(p.life,0,4,.2);p.max=clamp(p.max,.01,4,p.life||.2)});
 sanitizePool(pickups,120,p=>{p.x=clamp(p.x,-50,W+50);p.y=clamp(p.y,-70,H+70);p.r=clamp(p.r,2,15,5)});
 if(Array.isArray(enemyLasers)){
  for(let i=enemyLasers.length-1;i>=0;i--){const l=enemyLasers[i];if(!l||!Number.isFinite(l.x)||!Number.isFinite(l.y)){enemyLasers.splice(i,1);continue}l.x=clamp(l.x,0,W);l.y=clamp(l.y,-80,H);l.width=clamp(l.width,2,70,14);l.life=clamp(l.life,-1,12,0);l.duration=clamp(l.duration,.05,8,1)}
  if(enemyLasers.length>8)enemyLasers.splice(0,enemyLasers.length-8);
 }
 if(Array.isArray(drones)){
  if(drones.length>8)drones.length=8;
  drones.forEach((d,index)=>{d.slot=index;d.x=clamp(d.x,20,W-20,player.x);d.y=clamp(d.y,40,H-SAFE_BOTTOM-20,player.y+30);d.bank=clamp(d.bank,-1.2,1.2,0);d.recoil=clamp(d.recoil,0,2,0)});
 }
 build.shieldLayers=clamp(build.shieldLayers,0,3,0);
 build.heavyEscortShieldActive=clamp(build.heavyEscortShieldActive,0,8,0);
 build.awakeFrontShieldActive=clamp(build.awakeFrontShieldActive,0,8,0);
 if(!Number.isFinite(player.x)||!Number.isFinite(player.y)){player.x=W/2;player.y=H-SAFE_BOTTOM-90}
 player.x=clamp(player.x,24,W-24,W/2);player.y=clamp(player.y,55,H-SAFE_BOTTOM-35,H-SAFE_BOTTOM-90);
 player.r=clamp(player.r,4,28,10);player.vx=clamp(player.vx,-1200,1200,0);player.vy=clamp(player.vy,-1200,1200,0);
 player.targetVx=clamp(player.targetVx,-1200,1200,0);player.targetVy=clamp(player.targetVy,-1200,1200,0);
 player.tilt=clamp(player.tilt,-1,1,0);player.pitch=clamp(player.pitch,-1,1,0);player.thrust=clamp(player.thrust,0,1.35,.28);
 player.visualY=clamp(player.visualY,-30,30,0);player.recoil=clamp(player.recoil,0,2.5,0);
 shake=clamp(shake,0,32,0);
}
function update(dt){
 IWStability?.watchdog?.();
 const cinematic=wreckCinematicActive();if(!cinematic)elapsed+=dt;const threat=threatLevel();const wreckSceneActive=build?.wreckStory&&!['recovered'].includes(build.wreckStory.phase);if(!wreckSceneActive)battleEventSystem.update(dt);
 for(const s of stars){s.y+=s.v*(1+threat*.08)*dt;if(s.y>H){s.y=0;s.x=Math.random()*W}}
 for(const d of spaceDust){d.y+=d.v*(1+threat*.025)*dt;d.x+=d.drift*dt;if(d.y>H+8){d.y=-8;d.x=Math.random()*W}if(d.x<-8)d.x=W+8;else if(d.x>W+8)d.x=-8}
 for(const s of nearSpaceStreaks){s.y+=s.v*(1+threat*.045)*dt;if(s.y>H+s.len){s.y=-s.len-Math.random()*H*.28;s.x=Math.random()*W}}
 for(let i=spaceLandmarks.length-1;i>=0;i--){const landmark=spaceLandmarks[i];landmark.y+=landmark.v*dt;if(landmark.y>H+landmark.size*1.7)spaceLandmarks.splice(i,1)}
 if(dying){
  deathTimer+=dt;deathFade=Math.min(1,Math.max(0,(deathTimer-.45)/1.45));
 for(let i=particles.length-1;i>=0;i--){const p=particles[i];p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=.985;p.vy*=.985;p.life-=dt;if(p.life<=0)particles.splice(i,1)}
  if(deathTimer>=2.15)die();
  updateUI();return;
 }
 if(cinematic){updateWreckStory(dt);updateUI();return}
 const keyboardMode=touchDevice||uiPrefs?.controlMode!=='mouse';
 let dx=keyboardMode?((keys.ArrowRight||keys.d?1:0)-(keys.ArrowLeft||keys.a?1:0)+joyX):0;
 let dy=keyboardMode?((keys.ArrowDown||keys.s?1:0)-(keys.ArrowUp||keys.w?1:0)+joyY):0;
 let inputLength=Math.hypot(dx,dy);
 const keyboardInput=keyboardMode&&inputLength>.035;
 player.slowTimer=Math.max(0,(player.slowTimer||0)-dt);
 const laserFiring=coreManager.getLevel('laser')>0&&build?.laserState?.phase==='firing';
 const laserMovementDrag=laserFiring?.88:1;
 const movementSpeed=player.speed*(player.slowTimer>0?.58:1)*laserMovementDrag;
 let touchDistance=0,mouseDistance=0;
 if(!touchDevice&&uiPrefs?.controlMode==='mouse'&&mouseMoveActive){
  mouseDistance=Math.hypot(mouseDeltaX,mouseDeltaY);
  if(mouseDistance>.01){dx=mouseDeltaX/mouseDistance;dy=mouseDeltaY/mouseDistance;inputLength=1}else{dx=dy=0;inputLength=0}
 }else if(touchMoveActive&&!keyboardInput){
  const tx=touchTargetX-player.x,ty=touchTargetY-player.y;touchDistance=Math.hypot(tx,ty);
  if(touchDistance>3){dx=tx/touchDistance;dy=ty/touchDistance;inputLength=1}else{dx=dy=0;inputLength=0}
 }else if(inputLength>1){dx/=inputLength;dy/=inputLength;inputLength=1}
 const hasInput=inputLength>.035;
 const usingTouch=touchMoveActive&&!keyboardInput;
 const usingMouse=!touchDevice&&uiPrefs?.controlMode==='mouse'&&mouseMoveActive;
 const touchSensitivity=usingTouch?(uiPrefs?.touchSensitivity||1.5):1;
 const touchSpeedScale=usingTouch?Math.max(.72,Math.min(1.65,touchDistance/62))*touchSensitivity:1;
 const mouseSpeedScale=1;
 player.targetVx=hasInput?dx*movementSpeed*touchSpeedScale*mouseSpeedScale:0;
 player.targetVy=hasInput?dy*movementSpeed*touchSpeedScale*mouseSpeedScale:0;
 // 位置控制采用单调逼近：快速起步、快速制动，绝不越过目标速度或反弹。
 const approach=(value,target,step)=>value<target?Math.min(value+step,target):Math.max(value-step,target);
 const reversingX=hasInput&&Math.sign(player.targetVx)&&Math.sign(player.vx)&&Math.sign(player.targetVx)!==Math.sign(player.vx);
 const reversingY=hasInput&&Math.sign(player.targetVy)&&Math.sign(player.vy)&&Math.sign(player.targetVy)!==Math.sign(player.vy);
 const touchResponse=usingTouch?Math.max(1.25,uiPrefs?.touchSensitivity||1.5):(usingMouse?2.15:1);
 const laserTurnDrag=laserFiring?.68:1;
 const responseX=(!hasInput||reversingX?player.brake:player.accel)*touchResponse*laserTurnDrag;
 const responseY=(!hasInput||reversingY?player.brake:player.accel)*touchResponse*laserTurnDrag;
 if(usingMouse){
  // 鼠标采用一比一位置控制，不再复用触控灵敏度，也不经过加速/制动曲线。
  // 保留极小的异常输入上限，只拦截锁屏恢复或浏览器产生的巨大跳变。
  const maxMouseStep=Math.max(W,H)*.22;
  const directDrag=laserFiring?.82:1;
  const moveX=Math.max(-maxMouseStep,Math.min(maxMouseStep,mouseDeltaX))*directDrag;
  const moveY=Math.max(-maxMouseStep,Math.min(maxMouseStep,mouseDeltaY))*directDrag;
  const safeDt=Math.max(dt,1/240);
  player.vx=moveX/safeDt;player.vy=moveY/safeDt;
  player.targetVx=player.vx;player.targetVy=player.vy;
  player.x+=moveX;player.y+=moveY;
  mouseDeltaX=0;mouseDeltaY=0;
 }else{
  player.vx=approach(player.vx,player.targetVx,responseX*dt);
  player.vy=approach(player.vy,player.targetVy,responseY*dt);
  // 极低速度直接归零，消除松手后的亚像素爬动。
  if(!hasInput&&Math.abs(player.vx)<8)player.vx=0;
  if(!hasInput&&Math.abs(player.vy)<8)player.vy=0;
  player.x+=player.vx*dt;player.y+=player.vy*dt;
 }
 const minX=28,maxX=W-28,minY=48,maxY=H-SAFE_BOTTOM-28;
 if(player.x<minX){player.x=minX;player.vx=Math.max(0,player.vx)}else if(player.x>maxX){player.x=maxX;player.vx=Math.min(0,player.vx)}
 if(player.y<minY){player.y=minY;player.vy=Math.max(0,player.vy)}else if(player.y>maxY){player.y=maxY;player.vy=Math.min(0,player.vy)}
 // 横滚只做姿态缓动，不使用弹簧速度，因此不会过冲、回弹或产生“果冻感”。
 const velocityBank=player.vx/(movementSpeed||player.speed);
 const inputBank=hasInput?dx:0;
 const targetTilt=Math.max(-1,Math.min(1,velocityBank*.82+inputBank*.18));
 const tiltBlend=1-Math.exp(-player.turnGrip*dt);
 player.tilt+=(targetTilt-player.tilt)*tiltBlend;
 if(Math.abs(targetTilt)<.01&&Math.abs(player.tilt)<.008)player.tilt=0;
 player.tilt=Math.max(-1,Math.min(1,player.tilt));
 // 纵向动作采用机头俯仰：向前推进时略微俯冲，向后制动时轻微抬头。
 const targetPitch=Math.max(-1,Math.min(1,-player.vy/(movementSpeed||player.speed)));
 const pitchBlend=1-Math.exp(-10.5*dt);
 player.pitch+=(targetPitch-player.pitch)*pitchBlend;
 if(Math.abs(targetPitch)<.01&&Math.abs(player.pitch)<.008)player.pitch=0;
 // 推力依据实际速度和加速状态变化，避免机体动作与推进器脱节。
 const speedRatio=Math.min(1.35,Math.hypot(player.vx,player.vy)/(movementSpeed||player.speed));
 const accelDemand=Math.min(1,Math.hypot(player.targetVx-player.vx,player.targetVy-player.vy)/(movementSpeed||player.speed));
 const targetThrust=Math.min(1.35,.28+speedRatio*.72+accelDemand*.32);
 player.thrust+=(targetThrust-player.thrust)*(1-Math.exp(-8*dt));
 // 只保留极轻微的推进器呼吸，不参与横移停止反馈。
 player.visualY=Math.sin(elapsed*3.1)*.38;
 player.recoil=Math.max(0,player.recoil-dt*8);
 player.inv=Math.max(0,player.inv-dt);player.fireCd-=dt*1000;if(!cinematic&&player.fireCd<=0){playerShoot();const mainAwakening=awakeningSystem.get('main');player.fireCd=mainAwakening?.id==='main_piercer'?1550:mainAwakening?.id==='main_rapid'?220:player.fireRate}
 syncAttackCoreState();updateDefenseCores(dt);updateProjectionCore(dt);updateProjectionInheritedSkills(dt);awakeningSystem.update(dt);
 const cooldownScale=timeCooldownScale();
 const laserLevel=coreManager.getLevel('laser');updateLaserCore(dt/cooldownScale,laserLevel);updateThunderCore(dt)
 const missileLevel=coreManager.getLevel('missile');if(missileLevel){build.missileCd-=dt/cooldownScale;if(build.missileCd<=0){fireMissiles(missileLevel);build.missileCd=missileStats(missileLevel).cooldown}}
 rewindHistory.unshift({x:player.x,y:player.y,hp:player.hp});if(rewindHistory.length>240)rewindHistory.pop();
 // 投影已经使用固定阵列缓存，不再每帧创建未被读取的历史姿态对象。
 if(!build.firstEliteSpawned&&elapsed>=50&&!enemies.some(e=>e.boss)&&!battleEventSystem.active){build.firstEliteSpawned=true;enemies.push(makeEnemy('heavy'))}
 updateWreckStory(dt);spawnCd-=dt;if(spawnCd<=0){const bossActive=enemies.some(e=>e.boss),wreckScene=build.wreckStory&&!['recovered'].includes(build.wreckStory.phase);if(!bossActive&&!wreckScene)spawnEnemy();const gradual=Math.min(.48,elapsed/1800+Math.max(0,level-1)*.012);const pressure=Math.min(.18,combatPower()*.004+recentKillRate()*.03);spawnCd=bossActive?.5:Math.max(.30,1.18-gradual-pressure)}maybeSpawnStageBoss(dt);
 const timeLevel=coreManager.getLevel('time');const slow=(build.awakeTimeStop||0)>0?.015:(build.chronoActive>0?(timeLevel===3?.02:.42):1);
 for(const b of bullets)if(b.swarmFocus){if(!b.target||b.target.hp<=0||!enemies.includes(b.target))b.target=nearestLivingEnemy(b.x,b.y);if(b.target){const dx=b.target.x-b.x,dy=b.target.y-b.y,len=Math.hypot(dx,dy)||1,speed=Math.hypot(b.vx,b.vy)||690,turn=Math.min(1,(b.seek||6.8)*dt);b.vx+=(dx/len*speed-b.vx)*turn;b.vy+=(dy/len*speed-b.vy)*turn}}
 for(let i=bullets.length-1;i>=0;i--){const b=bullets[i];if(b.laser){b.life-=dt;const emitter=b.source==='clone'?clonePositions()[b.emitterIndex||0]:player;if(emitter){const targetX=emitter.x+(b.emitterOffset||0);b.x=targetX;b.h=emitter.y-20;if(!Array.isArray(b.visualNodes)||b.visualNodes.length<2)b.visualNodes=Array(mobilePerf?.enabled?7:9).fill(targetX);b.visualNodes[0]=targetX;for(let n=1;n<b.visualNodes.length;n++){const source=b.visualNodes[n-1],follow=1-Math.exp(-(13-n*.72)*dt);b.visualNodes[n]+=(source-b.visualNodes[n])*follow}}b.damageTick=(b.damageTick||0)+dt;const damageStep=1/30;if(b.damageTick>=damageStep){const damageDt=b.damageTick;b.damageTick=0;for(let j=enemies.length-1;j>=0;j--){const e=enemies[j];if(Math.abs(e.x-b.x)<b.w+enemyHitHalfWidth(e)&&e.y<(emitter?emitter.y:player.y)){const killed=damageEnemy(e,b.d*damageDt,{piercing:true});if(b.awakening==='laser_reflect'&&Math.random()<damageDt*7){const others=livingTargetSnapshot().filter(x=>x!==e&&Math.hypot(x.x-e.x,x.y-e.y)<180).slice(0,4);let from=e;for(const target of others){createLightningArc(from,target,2);if(damageEnemy(target,b.d*damageDt*.65)){const idx=enemies.indexOf(target);if(idx>=0)enemies.splice(idx,1)}from=target}}if(killed)enemies.splice(j,1)}}}if(b.life<=0||!emitter)bullets.splice(i,1);continue}if(b.isSplit){b.life-=dt;if(b.life<=0){bullets.splice(i,1);continue}}if(b.awakening==='blast_chain'){if(!Number.isFinite(b.life)){b.life=1.1;b.maxLife=1.1}if(!b.isSplit){b.life-=dt;if(b.life<=0){bullets.splice(i,1);continue}}if(!b.target||b.target.hp<=0||!enemies.includes(b.target)){b.target=nearestLivingEnemy(b.x,b.y)}if(b.target){const dx=b.target.x-b.x,dy=b.target.y-b.y,len=Math.hypot(dx,dy)||1,speed=Math.hypot(b.vx,b.vy)||500,turn=Math.min(1,(b.seek||7.5)*dt);b.vx+=(dx/len*speed-b.vx)*turn;b.vy+=(dy/len*speed-b.vy)*turn}}b.x+=b.vx*dt;b.y+=b.vy*dt;if(b.y<-30||b.y>H+30||b.x<-30||b.x>W+30){bullets.splice(i,1);continue}for(let j=enemies.length-1;j>=0;j--){const e=enemies[j];if(enemyHitTest(e,b.x,b.y,b.r)){const hitX=e.x,hitY=e.y;if(b.awakening==='blast_chain'&&b.splitMark){e.blastAwakeMarks=(e.blastAwakeMarks||0)+1;if(e.blastAwakeMarks>=3){e.blastAwakeMarks=0;blastWaves.push({x:e.x,y:e.y,life:.28,maxLife:.28,radius:6,prevRadius:0,maxRadius:72,absorbed:0,temporalCollapse:true});for(const other of [...enemies])if(other!==e&&Math.hypot(other.x-e.x,other.y-e.y)<72)damageEnemy(other,34)}}const killed=damageEnemy(e,b.d,{piercing:(b.pierce||0)>0});if(killed){enemies.splice(j,1);if(b.blastLevel&&!b.isSplit)spawnSplitBullets(hitX,hitY,b.d,b.blastLevel);if(b.awakening==='blast_chain'&&b.chainDepth<2)awakeningSystem.spawnChainSplit?.(hitX,hitY,b.d,b.chainDepth+1)}if(b.thunderLevel)triggerThunder({x:hitX,y:hitY},b.d,b.thunderLevel,b.blastLevel&&!b.isSplit?b.blastLevel:0,e);if(b.pierce>0){b.pierce--;b.d*=1.08;break}else{bullets.splice(i,1);break}}}}
 for(let i=missiles.length-1;i>=0;i--){
  const m=missiles[i];m.life-=dt;m.trail-=dt;
  if(!m.target||m.target.hp<=0||!enemies.includes(m.target))m.target=nearestLivingEnemy(m.x,m.y);
  if(m.target){const desired=Math.atan2(m.target.y-m.y,m.target.x-m.x),current=Math.atan2(m.vy,m.vx);let diff=((desired-current+Math.PI*3)%(Math.PI*2))-Math.PI;const angle=current+Math.max(-m.turn*dt,Math.min(m.turn*dt,diff));m.vx=Math.cos(angle)*m.speed;m.vy=Math.sin(angle)*m.speed}
  m.x+=m.vx*dt;m.y+=m.vy*dt;
  if(m.trail<=0){const q=mobilePerf?.enabled?mobilePerf.quality:1;m.trail=mobilePerf?.enabled?(q<.68?.085:q<.84?.06:.045):(particles.length>220?.07:particles.length>150?.045:.03);if(particles.length<(mobilePerf?.enabled?180:280))particles.push({x:m.x,y:m.y,vx:-m.vx*.13+(Math.random()-.5)*22,vy:-m.vy*.13+(Math.random()-.5)*22,life:.22+Math.random()*.18,max:.4,r:2+Math.random()*2.5+(m.level||1)*.35,type:'missileTrail',missileLevel:m.level||1})}
  let hit=m.life<=0||m.x<-40||m.x>W+40||m.y<-50||m.y>H+50;
  if(!hit)for(const e of enemies)if(enemyHitTest(e,m.x,m.y,7)){hit=true;break}
  if(hit){explodeMissile(m);missiles.splice(i,1)}
 }
 for(let i=enemies.length-1;i>=0;i--){
  const e=enemies[i];e.age+=dt;
  if(e.supportShieldSource&&(!enemies.includes(e.supportShieldSource)||(e.supportShieldUntil||0)<elapsed)){e.shield=0;e.maxShield=0;e.supportShieldSource=null;e.supportShieldUntil=0}
  if(e.boss&&!e.bossEntering&&!e.persistentBoss&&!e.bossRetreating&&Number.isFinite(e.bossTimeLeft)){e.bossTimeLeft-=dt;if(e.bossTimeLeft<=0)despawnTimedBoss(e)}
  if(e.bossGuard&&e.bossGuardFor){const host=e.bossGuardFor;if(!enemies.includes(host)){enemies.splice(i,1);continue}const guards=enemies.filter(g=>g.bossGuardFor===host);const gi=Math.max(0,guards.indexOf(e));const targetX=host.x+(gi-(guards.length-1)/2)*78,targetY=host.y+92;e.x+=(targetX-e.x)*Math.min(1,dt*5);e.y+=(targetY-e.y)*Math.min(1,dt*5);}
  else if(e.boss){const bossSlow=build.chronoActive>0?(timeLevel===3?.28:slow):1;if(e.bossRetreating){e.retreatTime-=dt;e.retreatFxCd-=dt;const retreatProgress=1-Math.max(0,e.retreatTime)/1.6;e.y-=(125+retreatProgress*355)*dt;if(e.retreatFxCd<=0){e.retreatFxCd=.055;for(const offset of [-36,0,36])particles.push({x:e.x+offset,y:e.y+44,vx:(Math.random()-.5)*20,vy:75+Math.random()*55,life:.24,max:.24,r:2.2+Math.random()*2.2,type:'laserCharge'})}if(e.retreatTime<=0||e.y<-190){enemies.splice(i,1);toast(`第 ${e.bossNumber||e.bossStage} 号 Boss 已脱离战区`);continue}}else if(e.bossEntering){e.bossEntryTime=(e.bossEntryTime||0)+dt;e.bossEntryFxCd=(e.bossEntryFxCd||0)-dt;const travel=e.bossIntroTravel||1.7,total=e.bossIntroDuration||3.7,entryProgress=Math.min(1,e.bossEntryTime/travel),entryEase=1-Math.pow(1-entryProgress,3);e.y=(e.entryStartY??-150)+((e.targetY??150)-(e.entryStartY??-150))*entryEase;if(e.bossEntryFxCd<=0&&e.bossEntryTime<=travel){e.bossEntryFxCd=.055;const engineY=e.y-(e.hitRy||60)*.72;for(const offset of [-42,0,42])particles.push({x:e.x+offset,y:engineY,vx:(Math.random()-.5)*18,vy:-(65+Math.random()*45),life:.22,max:.22,r:2+Math.random()*2.2,type:'laserCharge'})}if(e.bossEntryTime>=total){e.y=e.targetY;e.bossEntering=false;blastWaves.push({x:e.x,y:e.y,life:.62,maxLife:.62,radius:16,prevRadius:0,maxRadius:e.r*2.2,absorbed:0,temporalCollapse:true});shake=Math.max(shake,16)}}else{if(e.fixedBoss){const hoverSeed=(e.bossNumber||e.bossStage||1)*.73,hoverX=W/2+Math.sin(e.age*.62+hoverSeed)*(10+Math.min(6,(e.bossStage||3)-3)*2),hoverY=(e.targetY??145)+Math.sin(e.age*.88+hoverSeed*1.7)*(4+Math.min(3,(e.bossStage||3)-3));e.x+=(hoverX-e.x)*Math.min(1,dt*1.9*bossSlow);e.y+=(hoverY-e.y)*Math.min(1,dt*1.7*bossSlow)}else{e.x+=e.dir*90*dt*bossSlow;if(e.x<e.r||e.x>W-e.r)e.dir*=-1}updateBossAttackPattern(e,dt*bossSlow)}}
  else if(e.huntTarget){const targetY=Math.min(145,H*.2);e.y+=(targetY-e.y)*Math.min(1,dt*2.2);e.x+=e.dir*(e.enraged?36:25)*dt*slow;if(e.x<75||e.x>W-75)e.dir*=-1;}
  else if(e.type==='suicide'){
   const distance=Math.hypot(player.x-e.x,player.y-e.y);
   if(e.suicidePhase==='entry'&&distance<350){e.suicidePhase='tracking';e.fuse=e.fuseDuration||1.35;e.warning=1;e.heading=Math.atan2(player.y-e.y,player.x-e.x)}
   if(e.suicidePhase==='entry'){const targetY=Math.max(70,Math.min(H*.64,player.y-110)),vertical=Math.max(-.42,Math.min(.42,(targetY-e.y)/180));e.x+=Math.cos(e.heading||0)*e.v*dt*slow;e.y+=vertical*e.v*dt*slow}
   else if(e.suicidePhase==='tracking'){e.fuse=Math.max(0,e.fuse-dt);const desired=Math.atan2(player.y-e.y,player.x-e.x),current=Number.isFinite(e.heading)?e.heading:desired,diff=((desired-current+Math.PI*3)%(Math.PI*2))-Math.PI,maxTurn=Math.PI*(150/180)*dt;e.heading=current+Math.max(-maxTurn,Math.min(maxTurn,diff));const trackingProgress=1-e.fuse/(e.fuseDuration||1.35),trackingSpeed=e.v+35+trackingProgress*45;e.x+=Math.cos(e.heading)*trackingSpeed*dt*slow;e.y+=Math.sin(e.heading)*trackingSpeed*dt*slow;if(e.fuse<=0){e.suicidePhase='dash';e.warning=2}}
   else{e.x+=Math.cos(e.heading)*(e.dashSpeed||265)*dt*slow;e.y+=Math.sin(e.heading)*(e.dashSpeed||265)*dt*slow}
   const impactDistance=Math.hypot(player.x-e.x,player.y-e.y);if(e.suicidePhase!=='entry'&&impactDistance<34){damagePlayer(24);suicideBlast(e);explode(e.x,e.y);enemies.splice(i,1);if(dying)break;continue}
  }else if(e.type==='raider'){
   e.x+=e.dir*e.v*dt*slow;e.y+=34*dt*slow;
  }else if(e.type==='sniper'){
   const targetY=Math.min(155,H*.24);e.y+=(targetY-e.y)*Math.min(1,dt*1.8*slow);e.x+=Math.sin(e.age*1.7)*30*dt*slow;
   if(e.sniperAim!=null){if(e.sniperAim>(e.sniperLockWindow||.8)){e.sniperLockX=player.x;e.sniperLockY=player.y}e.sniperAim-=dt;if(e.sniperAim<=0){fireSniperLaser(e);e.sniperAim=null;e.shoot=enemyAttackInterval(e,threat)}}
  }else{
   e.y+=(e.v+threat*7)*dt*slow;
   if(e.type==='support'){
    e.supportCd-=dt;if(e.supportCd<=0){e.supportCd=1.15;const shieldTargets=enemies.filter(ally=>ally!==e&&ally.type!=='support'&&ally.hp>0&&Math.hypot(ally.x-e.x,ally.y-e.y)<220).sort((a,b)=>Math.hypot(a.x-e.x,a.y-e.y)-Math.hypot(b.x-e.x,b.y-e.y)).slice(0,3);for(const ally of enemies)if(ally.supportShieldSource===e&&!shieldTargets.includes(ally)){ally.shield=0;ally.maxShield=0;ally.supportShieldSource=null;ally.supportShieldUntil=0}for(const ally of shieldTargets){ally.supportShieldSource=e;ally.supportShieldUntil=elapsed+1.35;ally.maxShield=Math.max(ally.maxShield||0,28+threat*4);ally.shield=Math.min(ally.maxShield,(ally.shield||0)+18+threat*3)}}
   }
  }
  const fullyVisible=e.sideEntry?(e.x>=e.r+8&&e.x<=W-e.r-8):e.y>=e.r+8;
  if(!e.boss&&!e.attackArmed&&fullyVisible){e.attackArmed=true;e.shoot=e.type==='sniper'?120:['heavy','barrage'].includes(e.type)?400:e.type==='carrier'?350:250}
  if(e.attackArmed){e.shoot-=dt*1000*slow;if(e.shoot<=0&&!e.boss&&!['suicide','support','jammer'].includes(e.type)){enemyShoot(e);if(e.type!=='sniper'||e.sniperAim==null)e.shoot=e.huntTarget?(e.enraged?560:760):enemyAttackInterval(e,threat)}}
  if(!e.bossRetreating&&(e.boss?enemyHitTest(e,player.x,player.y,playerCombatRadius()):Math.hypot(player.x-e.x,player.y-e.y)<playerCombatRadius()+e.r)){
   if(e.boss){
    const wasVulnerable=player.inv<=0;damagePlayer(50);if(wasVulnerable&&!dying){const dx=player.x-e.x,dy=player.y-e.y,len=Math.hypot(dx,dy)||1,push=46;player.x=Math.max(playerCombatRadius(),Math.min(W-playerCombatRadius(),player.x+dx/len*push));player.y=Math.max(65,Math.min(H-SAFE_BOTTOM-playerCombatRadius(),player.y+dy/len*push));player.inv=Math.max(player.inv,1);player.vx=dx/len*155;player.vy=dy/len*155;shake=Math.max(shake,18)}if(dying)break;continue
   }
   damagePlayer(e.type==='suicide'?28:16);if(e.type==='suicide')suicideBlast(e);explode(e.x,e.y);enemies.splice(i,1);if(dying)break;continue
  }
  if(e.y>H+50||e.x<-70||e.x>W+70)enemies.splice(i,1)
 }
 build.jammerNetHitCd=Math.max(0,(build.jammerNetHitCd||0)-dt);
 if(build.jammerNetHitCd<=0){
  const groups=new Map();for(const e of enemies)if(e.type==='jammer'&&e.jammerGroup&&e.age>=(e.jammerNetDelay||.4)&&e.hp>0){if(!groups.has(e.jammerGroup))groups.set(e.jammerGroup,[]);groups.get(e.jammerGroup).push(e)}
  outer:for(const group of groups.values()){group.sort((a,b)=>a.jammerSlot-b.jammerSlot);for(let n=1;n<group.length;n++){const a=group[n-1],b=group[n];if(b.jammerSlot-a.jammerSlot!==1)continue;const dx=b.x-a.x,dy=b.y-a.y,len2=dx*dx+dy*dy||1,t=Math.max(0,Math.min(1,((player.x-a.x)*dx+(player.y-a.y)*dy)/len2)),distance=Math.hypot(player.x-(a.x+dx*t),player.y-(a.y+dy*t));if(distance<playerCombatRadius()+8){const shielded=(build.shieldLayers||0)>0;damagePlayer(4);if(!shielded){player.slowTimer=Math.max(player.slowTimer||0,1.2);toast('减速电网 · 动力输出下降')}build.jammerNetHitCd=.6;break outer}}}
 }
 for(let i=enemyLasers.length-1;i>=0;i--){
  const l=enemyLasers[i];l.life-=dt;
  if(!l.boss||(!l.sniper&&!enemies.includes(l.boss))){enemyLasers.splice(i,1);continue}
  if(l.mode==='sweep'&&l.life<l.duration){const progress=1-Math.max(0,l.life)/l.duration;l.x=W*.22+W*.56*(l.sweepDir>0?progress:1-progress)}
  const active=l.sniper||l.life<l.duration;
  if(active){l.tick-=dt;if(l.sniper){const dx=l.x2-l.x1,dy=l.y2-l.y1,len2=dx*dx+dy*dy||1,t=Math.max(0,Math.min(1,((player.x-l.x1)*dx+(player.y-l.y1)*dy)/len2)),distance=Math.hypot(player.x-(l.x1+dx*t),player.y-(l.y1+dy*t));if(l.tick<=0&&distance<l.width+playerCombatRadius()){damagePlayer(l.damage);l.tick=.55}}else if(l.tick<=0&&Math.abs(player.x-l.x)<l.width+playerCombatRadius()&&player.y>l.y){damagePlayer(l.damage);l.tick=.55}}
  if(l.life<=0)enemyLasers.splice(i,1)
 }
 for(let i=enemyBullets.length-1;i>=0;i--){const b=enemyBullets[i];if(Number.isFinite(b.splitTimer)){b.splitTimer-=dt;if(b.splitTimer<=0){fireGapRing(b.x,b.y,b.splitCount||14,b.splitSpeed||150,b.splitDamage||13,Number.isFinite(b.splitGapAngle)?b.splitGapAngle:Math.PI/2,b.splitGapWidth||.45);for(let p=0;p<12;p++){const a=p*Math.PI/6;particles.push({x:b.x,y:b.y,vx:Math.cos(a)*95,vy:Math.sin(a)*95,life:.3,max:.3,r:2.6,type:'laserCharge'})}enemyBullets.splice(i,1);continue}}if(b.bossHoming>0){b.bossHoming-=dt;const dx=player.x-b.x,dy=player.y-b.y,len=Math.hypot(dx,dy)||1,speed=b.speed||160,turn=Math.min(1,(b.turnRate||1.7)*dt);b.vx+=(dx/len*speed-b.vx)*turn;b.vy+=(dy/len*speed-b.vy)*turn;b.angle=Math.atan2(b.vy,b.vx)}b.x+=b.vx*dt*slow;b.y+=b.vy*dt*slow;if(build.heavyEscortShieldActive>0){const dx=b.x-player.x,dy=b.y-(player.y-8),dist=Math.hypot(dx,dy);const inFront=dy<2&&dy>-112;const insideGuard=dist<92&&Math.abs(dx)<88;if(inFront&&insideGuard){enemyBullets.splice(i,1);particles.push({x:b.x,y:b.y,vx:dx*.75,vy:-70,life:.26,max:.26,r:5.5,type:'barrier'});continue}}if(build.awakeFrontShieldActive>0){const dx=b.x-player.x,dy=b.y-(player.y-78);if(dy>-26&&dy<34&&Math.abs(dx)<118){enemyBullets.splice(i,1);particles.push({x:b.x,y:b.y,vx:dx*.55,vy:-65,life:.28,max:.28,r:6,type:'barrier'});continue}}const bd=Math.hypot(b.x-player.x,b.y-player.y);if(bd<b.r+playerCombatRadius()){if(b.type==='purple'&&b.damage<=10){player.slowTimer=2.2;toast('动力受阻 · 移动速度下降')}damagePlayer(Number.isFinite(b.damage)?b.damage:10+threat*1.5);enemyBullets.splice(i,1);if(dying)break;continue}if(b.y>H+30||b.x<-30||b.x>W+30)enemyBullets.splice(i,1)}
 if(dying){updateUI();return}
 const heavyEscortActive=drones.some(d=>d.mode==='drone_heavy');
 if(heavyEscortActive){
  if(build.heavyEscortShieldActive>0)build.heavyEscortShieldActive=Math.max(0,build.heavyEscortShieldActive-dt);
  else{build.heavyEscortShieldCd=Math.max(0,(build.heavyEscortShieldCd||0)-dt);if(build.heavyEscortShieldCd<=0){build.heavyEscortShieldActive=build.heavyEscortShieldDuration||4.5;build.heavyEscortShieldCd=build.heavyEscortShieldCooldown||9}}
 }else{build.heavyEscortShieldActive=0;build.heavyEscortShieldCd=0}
 for(const d of drones){
  const formation=droneFormationOffset(d.slot||0,drones.length,d.mode);
  const targetX=player.x+formation.x,targetY=player.y+formation.y;
  const follow=1-Math.exp(-7.5*dt);
  d.x+=(targetX-d.x)*follow;d.y+=(targetY-d.y)*follow;
  d.recoil=Math.max(0,(d.recoil||0)-dt*9);
  const targetBank=Math.max(-1,Math.min(1,player.vx/player.speed));
  d.bank+=(targetBank-d.bank)*(1-Math.exp(-9*dt));
  const aimTarget=droneTarget(d,dronePosition(d));
  const desiredAim=aimTarget?Math.atan2(aimTarget.y-d.y,aimTarget.x-d.x)+Math.PI/2:0;
  d.aimAngle=smoothDroneAim(Number.isFinite(d.aimAngle)?d.aimAngle:0,desiredAim,dt);
  if(d.mode==='drone_heavy')d.guardFlash=build.heavyEscortShieldActive>0?Math.min(1,build.heavyEscortShieldActive):0;
 }
 if(drones.length){
  build.droneVolleyCd=(build.droneVolleyCd||0)-dt*1000/timeCooldownScale();
  if(build.droneVolleyCd<=0){
   audioSystem?.play('droneShot');
   for(const d of drones)droneShoot(d);
   build.droneVolleyCd=drones[0].fireRate||305;
  }
 }
 for(let i=particles.length-1;i>=0;i--){const p=particles[i];p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=.985;p.vy*=.985;p.life-=dt;if(p.life<=0)particles.splice(i,1)}
 for(let i=pickups.length-1;i>=0;i--){
  const p=pickups[i];p.life-=dt;p.age=(p.age||0)+dt;const dx=player.x-p.x,dy=player.y-p.y,dist=Math.hypot(dx,dy)||1;
  const xpPickup=p.type==='xpShard'||p.type==='eventXp';
  if(xpPickup&&p.age>.22){
   const playerSpeed=Math.hypot(player.vx||0,player.vy||0);
   const catchup=p.age>2.6||dist>430;
   const desiredSpeed=Math.min(catchup?2200:1750,520+dist*2.15+playerSpeed*1.25);
   const turn=1-Math.exp(-(catchup?18:12)*dt);
   p.vx+=(dx/dist*desiredSpeed-p.vx)*turn;p.vy+=(dy/dist*desiredSpeed-p.vy)*turn;
  }else if(p.type==='repairShard'){
   const force=920;p.vx+=dx/dist*force*dt;p.vy+=dy/dist*force*dt;
  }
  if(p.type==='repair'){p.vy=Math.max(125,Math.min(165,p.vy));p.vx+=Math.sin((p.age||0)*2.4+p.x*.03)*4*dt}
  else if(p.type==='awakeningModule'){p.vy=Math.max(62,Math.min(88,p.vy));p.vx+=Math.sin((p.age||0)*1.8)*7*dt}
  const drag=xpPickup&&p.age>.22?1:.985;p.vx*=Math.pow(drag,dt*60);p.vy*=Math.pow(drag,dt*60);
  p.x+=p.vx*dt;p.y+=p.vy*dt;
  const playerMoveSpeed=Math.hypot(player.vx||0,player.vy||0);
  const collectRadius=xpPickup?Math.min(86,48+playerMoveSpeed*.08):p.r+player.r+8;
  if(dist<collectRadius){if(p.type==='eventXp'||p.type==='xpShard'){if(!build.debugLockXp)xp+=p.xp||18;particles.push({x:player.x,y:player.y,vx:0,vy:-30,life:.35,max:.35,r:4,type:'thunder'});}else if(p.type==='repairShard'){audioSystem?.play('pickup');awakeningSystem.collectRepairShard(p.value||1);}else if(p.type==='awakeningModule'){audioSystem?.play('awakening');pickups.splice(i,1);setTimeout(()=>{if(!awakeningSystem.pending&&awakeningSystem.eligibleCores().length)awakeningSystem.openModule()},0);continue}else if(player.hp>=player.maxHp-1){audioSystem?.play('pickup');addBarrierCharge(6)}else{audioSystem?.play('pickup');player.hp=Math.min(player.maxHp,player.hp+p.heal)}pickups.splice(i,1);continue}
  if(p.life<=0||p.y>H+30)pickups.splice(i,1)
 }
 for(let i=lightningArcs.length-1;i>=0;i--){lightningArcs[i].life-=dt;if(lightningArcs[i].life<=0)lightningArcs.splice(i,1)}
 for(let i=blastWaves.length-1;i>=0;i--){
  const wave=blastWaves[i];wave.prevRadius=wave.radius;wave.life-=dt;
  const progress=1-Math.max(0,wave.life)/wave.maxLife;
  wave.radius=18+wave.maxRadius*(1-Math.pow(1-progress,2.35));
  for(let j=enemyBullets.length-1;j>=0;j--){
   const b=enemyBullets[j],dist=Math.hypot(b.x-wave.x,b.y-wave.y);
   if(dist<=wave.radius+18){
    const angle=Math.atan2(b.y-wave.y,b.x-wave.x);
    for(let k=0;k<3;k++)particles.push({x:b.x,y:b.y,vx:-Math.cos(angle)*(55+Math.random()*85)+(Math.random()-.5)*35,vy:-Math.sin(angle)*(55+Math.random()*85)+(Math.random()-.5)*35,life:.22+Math.random()*.22,max:.44,r:1.2+Math.random()*2.1,type:'barrier'});
    enemyBullets.splice(j,1);wave.absorbed++;addBarrierCharge(.8);
   }
  }
  if(wave.life<=0)blastWaves.splice(i,1)
 }
 build.levelUpLock=Math.max(0,(build.levelUpLock||0)-dt);
 if(!build.allCoresMax&&!build.debugLockXp&&xp>=nextXp&&build.levelUpLock<=0){
  const hasUpgrade=coreManager.getUpgradeCandidates().length>0;
  if(hasUpgrade){xp-=nextXp;level++;nextXp=Math.round(140+level*40+Math.pow(level,1.64)*10);build.levelUpLock=4;announceEnemyUnlock(level);chooseCore()}
  else{build.allCoresMax=true;xp=0;nextXp=1;build.levelUpLock=999999;toast('全源核同步完成 · 进入极限作战');}
 }
 const newThreat=threatLevel();if(newThreat!==Number(UI.threat.dataset.level||0)){UI.threat.dataset.level=newThreat;UI.threatFlash.classList.remove('hidden');$('#threatFlashText').textContent=THREAT_ROMAN[newThreat];if(newThreat>(build.lastLandmarkThreat??-1)){spawnThreatLandmark(newThreat);build.lastLandmarkThreat=newThreat}setTimeout(()=>UI.threatFlash.classList.add('hidden'),1800)}updateUI()
}
