
const ARCHIVE_KEYS={cores:'iwArchiveCoreLevelsV2',legacyCores:'iwArchiveCoresV1',enemies:'iwArchiveEnemiesV1',defeated:'iwArchiveEnemyDefeatedV1',records:'iwRunRecordsV1'};
const ENEMY_ARCHIVE_DATA={
 scout:{name:'侦察战机',baseHp:25,attack:'直线等离子弹',damage:'子弹 10 / 接触 16',xp:7,desc:'基础敌军单位，速度较快，装甲薄弱。'},
 heavy:{name:'重甲战机',baseHp:95,attack:'低速高亮重弹',damage:'重弹 18 / 接触 16',xp:17,desc:'缓慢推进的高耐久单位，射击间隔较长。'},
 suicide:{name:'自爆战机',baseHp:30,attack:'接近后启动2.2秒自爆',damage:'自爆 24 / 接触 28',xp:11,desc:'进入警戒距离后追踪玩家并启动倒计时。'},
 sniper:{name:'狙击战机',baseHp:44,attack:'瞄准后高速射击',damage:'高速弹 13 / 接触 16',xp:18,desc:'保持中远距离，以精确射击压迫移动空间。'},
 support:{name:'护盾支援机',baseHp:72,attack:'为附近敌军补充护盾',damage:'接触 16',xp:13,desc:'自身攻击能力有限，但会显著提高编队生存力。'},
 barrage:{name:'弹幕载机',baseHp:105,attack:'扇形弹幕',damage:'弹幕 16 / 接触 16',xp:21,desc:'缓慢移动并周期释放多方向弹幕。'},
 raider:{name:'侧翼突袭机',baseHp:36,attack:'高速横穿连射',damage:'连射弹 7 / 接触 16',xp:12,desc:'从左右两侧进入战场，快速穿越交战区域。'},
 carrier:{name:'分裂母机',baseHp:165,attack:'射击并在击毁后释放3架小型机',damage:'子弹 10 / 接触 16',xp:26,desc:'大型载机，死亡后仍会制造新的威胁。'},
 jammer:{name:'干扰机',baseHp:62,attack:'紫色减速干扰弹',damage:'干扰弹 10 / 接触 16',xp:17,desc:'命中后暂时降低玩家移动速度，不影响武器。'},
 boss:{name:'六级 Boss 总览',baseHp:'1953–14159+',attack:'连续波次弹幕、召唤与可躲避激光',damage:'子弹 13–20 / 激光 24–28',xp:'255–1640+',desc:'六个危险等级各有一只实体 Boss，按当前阶段战斗进度出现。'},
 'boss-1':{name:'危险 I · 重甲先锋［前哨］',baseHp:'1953+',attack:'连续扇形、环形弹幕',damage:'13–20',xp:480,desc:'1分30秒出现的前期小型 Boss，30秒后撤离。'},
 'boss-2':{name:'危险 II · 弹幕母机［前哨］',baseHp:'2695+',attack:'连续扇形、环形弹幕',damage:'13–20',xp:660,desc:'3分30秒出现的第二前哨，使用放大的现役载机模型。'},
 'boss-3':{name:'危险 III · 裂隙猎手［投影］',baseHp:'2883+',attack:'扇形连射、瞄准弹',damage:'14–17',xp:405,desc:'真身的相位投影，固定在战场上方；60秒未击毁会自行消散。'},
 'boss-4':{name:'危险 III · 裂隙猎手［真身］',baseHp:'5544+',attack:'强化扇形、瞄准弹、定点激光',damage:'17–28',xp:840,desc:'宽体真身占据上方空域，以连续波次压迫闪避空间。'},
 'boss-5':{name:'危险 IV · 赤钢战争堡垒［投影］',baseHp:'3505+',attack:'强化扇形、环形齐射',damage:'18–20',xp:480,desc:'战争堡垒的全息投影，60秒后相位消散。'},
 'boss-6':{name:'危险 IV · 赤钢战争堡垒［真身］',baseHp:'6741+',attack:'强化扇形、强化环形、扫射激光',damage:'18–28',xp:1020,desc:'固定封锁战场上沿，以更长的连续齐射形成火力墙。'},
 'boss-7':{name:'危险 V · 虚空航母［投影］',baseHp:'4128+',attack:'强化环形、召唤护航机',damage:'18–20',xp:555,desc:'虚空航母投影，会在60秒内持续投放护航单位。'},
 'boss-8':{name:'危险 V · 虚空航母［真身］',baseHp:'7938+',attack:'强化环形、召唤、连续弹雨',damage:'16–20',xp:1460,desc:'巨型宽体航母，控制战场上方并持续制造额外目标。'},
 'boss-9':{name:'危险 Ω · 终焉核心［投影］',baseHp:'4750+',attack:'双层新星、瞄准弹、定点激光',damage:'17–28',xp:630,desc:'最终 Boss 的全息先兆，拥有三种攻击方式。'},
 'boss-10':{name:'危险 Ω · 终焉核心［真身］',baseHp:'14159+',attack:'强化扇形、强化环形、新星、扫射激光、终焉齐射',damage:'17–28',xp:'1640+',desc:'约14分30秒抵达的最终 Boss，宽度覆盖几乎整个上方战区。'}
};
function readArchiveSet(key){const field=key===ARCHIVE_KEYS.enemies?'enemies':key===ARCHIVE_KEYS.defeated?'defeated':null;if(field&&window.IWSave&&IWSave.data.progression[field]?.length)return new Set(IWSave.data.progression[field]);try{return new Set(JSON.parse(localStorage.getItem(key)||'[]'))}catch{return new Set()}}
function writeArchiveSet(key,set){localStorage.setItem(key,JSON.stringify([...set]))}
function markEnemyEncounter(type){const set=readArchiveSet(ARCHIVE_KEYS.enemies);if(!set.has(type)){set.add(type);writeArchiveSet(ARCHIVE_KEYS.enemies,set);if(window.IWSave){IWSave.data.progression.enemies=[...set];IWSave.commit()}}}
function markEnemyDefeated(type){const set=readArchiveSet(ARCHIVE_KEYS.defeated);if(!set.has(type)){set.add(type);writeArchiveSet(ARCHIVE_KEYS.defeated,set);if(window.IWSave){IWSave.data.progression.defeated=[...set];IWSave.commit()}}}
function readCoreArchive(){
 if(window.IWSave&&Object.keys(IWSave.data.progression.cores||{}).length)return {...IWSave.data.progression.cores};
 try{
  const raw=JSON.parse(localStorage.getItem(ARCHIVE_KEYS.cores)||'{}');
  if(raw&&typeof raw==='object'&&!Array.isArray(raw))return raw;
 }catch{}
 const migrated={};
 for(const id of readArchiveSet(ARCHIVE_KEYS.legacyCores))migrated[id]=1;
 if(Object.keys(migrated).length)localStorage.setItem(ARCHIVE_KEYS.cores,JSON.stringify(migrated));
 return migrated;
}
function markCoreUnlocked(id,level=1){const archive=readCoreArchive();archive[id]=Math.max(Number(archive[id])||0,Math.max(1,Math.min(3,Number(level)||1)));localStorage.setItem(ARCHIVE_KEYS.cores,JSON.stringify(archive));if(window.IWSave){IWSave.data.progression.cores=archive;IWSave.commit()}}
function getRunRecords(){if(window.IWSave&&IWSave.data.records.length)return IWSave.data.records;try{return JSON.parse(localStorage.getItem(ARCHIVE_KEYS.records)||'[]')}catch{return []}}
function saveRunRecord(reason='战机损毁'){
 const records=getRunRecords();records.unshift({time:Math.floor(elapsed),score,level,threat:THREAT_ROMAN[threatLevel()],reason,date:new Date().toLocaleDateString('zh-CN'),pilot:pilotId});
 localStorage.setItem(ARCHIVE_KEYS.records,JSON.stringify(records.slice(0,20)));
 IWSave?.recordRun?.({time:Math.floor(elapsed),score,level,threat:THREAT_ROMAN[threatLevel()],threatIndex:threatLevel(),reason,date:new Date().toLocaleDateString('zh-CN'),pilot:pilotId});
}
function formatRunTime(seconds){seconds=Math.max(0,Math.floor(seconds||0));return String(Math.floor(seconds/60)).padStart(2,'0')+':'+String(seconds%60).padStart(2,'0')}
function renderArchiveHome(){document.querySelector('#archiveHome').classList.remove('hidden');document.querySelector('#archiveDetail').classList.add('hidden');}
function drawEnemyArchivePreview(canvas,type){
 const c=canvas?.getContext?.('2d');if(!c||typeof drawEnemyShip!=='function')return;
 const w=canvas.width||132,h=canvas.height||96,isBoss=type==='boss'||type.startsWith('boss-');
 const bossNumber=isBoss?Math.max(1,Number(type.split('-')[1])||1):0,encounter=isBoss&&typeof BOSS_ENCOUNTERS!=='undefined'?BOSS_ENCOUNTERS[bossNumber-1]:null;
 const previewSize=encounter?.size||[196,144],scale=isBoss?Math.min(112/previewSize[0],78/previewSize[1]):(type==='carrier'||type==='heavy'||type==='barrage')?.82:.98;
 c.save();c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,w,h);c.globalAlpha=1;c.globalCompositeOperation='source-over';
 c.translate(w/2,h/2+4);c.scale(scale,scale);
 const model={type:isBoss?'boss':type,boss:isBoss,bossNumber,bossStage:encounter?.tier||bossNumber,bossKind:encounter?.kind||'',bossName:encounter?.name,bossArtKey:encounter?.art,bossSpriteType:encounter?.sprite,bossRenderSize:previewSize,projectionBoss:encounter?.role==='projection',miniBoss:encounter?.role==='mini',eventMeteor:false,x:0,y:0,r:isBoss?Math.max(...(encounter?.hit||[70,60])):28,age:Math.max(1,Number(elapsed)||1),dir:1,hp:100,max:100,maxHp:100,shield:0,fuse:2.2};
 drawEnemyShip(model,c);c.restore();
}
function renderArchiveView(view){
 const home=$('#archiveHome'),detail=$('#archiveDetail'),title=$('#archiveDetailTitle'),code=$('#archiveDetailCode'),content=$('#archiveDetailContent');home.classList.add('hidden');detail.classList.remove('hidden');content.innerHTML='';
 if(view==='cores'){
  title.textContent='源核档案';code.textContent='CORE ARCHIVE';const archive=readCoreArchive();
  CORE_LIST.forEach(core=>{const unlockedLevel=Math.max(0,Math.min(3,Number(archive[core.id])||0));const known=unlockedLevel>0;const card=document.createElement('article');card.className='archive-entry '+(known?'':'locked');
   if(!known){card.innerHTML=`<header><b>未解析源核</b><span>LOCKED</span></header><p>在作战中首次同步后解锁资料。</p>`}
   else{
    const levels=core.levels.map((x,i)=>i<unlockedLevel?`<li><strong>${['Ⅰ','Ⅱ','Ⅲ'][i]} · ${x.name}</strong><span>${x.description}</span></li>`:i===unlockedLevel?`<li class="potential-level"><strong>未知高阶形态</strong><span>源核频谱仍在延伸，检测到可能存在更强形态。继续同步后可解析。</span></li>`:'').join('');
    card.innerHTML=`<header><b>${core.name}</b><span>已解析至 ${['Ⅰ','Ⅱ','Ⅲ'][unlockedLevel-1]}</span></header><p>${core.role}</p><ol>${levels}</ol>`;
   }
   content.appendChild(card)});
 }else if(view==='enemies'){
  title.textContent='敌人资料';code.textContent='HOSTILE ARCHIVE';const met=readArchiveSet(ARCHIVE_KEYS.enemies),defeated=readArchiveSet(ARCHIVE_KEYS.defeated);
  Object.entries(ENEMY_ARCHIVE_DATA).forEach(([id,data])=>{const known=met.has(id),cleared=defeated.has(id);const card=document.createElement('article');card.className='archive-entry enemy-entry '+(known?'':'locked');
   card.innerHTML=known?`<div class="enemy-archive-layout"><div class="enemy-preview"><canvas width="132" height="96" aria-label="${data.name}模型演示"></canvas><i>MODEL PREVIEW</i></div><div class="enemy-archive-info"><header><b>${data.name}</b><span>${cleared?'已击毁':'已遭遇'}</span></header>${cleared?`<div class="enemy-data-grid"><span>基础耐久<strong>${data.baseHp}</strong></span><span>经验值<strong>${data.xp}</strong></span><span>攻击伤害<strong>${data.damage}</strong></span></div><p>${data.desc}</p><small>攻击方式：${data.attack}</small>`:'<p>目标数据已捕获。击毁一次后解锁完整耐久、经验与攻击资料。</p>'}</div></div>`:`<div class="enemy-archive-layout"><div class="enemy-preview unknown"><b>?</b><i>NO SIGNAL</i></div><div class="enemy-archive-info"><header><b>未知敌军</b><span>UNSEEN</span></header><p>首次遭遇后解锁名称与模型，击毁后解锁完整资料。</p></div></div>`;
   content.appendChild(card);if(known){const preview=card.querySelector('canvas');drawEnemyArchivePreview(preview,id);requestAnimationFrame(()=>drawEnemyArchivePreview(preview,id))}});
 }else{
  title.textContent='同步记录';code.textContent='RUN HISTORY';const records=getRunRecords();
  if(!records.length){content.innerHTML='<div class="archive-empty">尚无完整同步记录。完成一次行动后将在此保存。</div>';return}
  records.forEach((r,i)=>{const card=document.createElement('article');card.className='archive-entry record-entry';card.innerHTML=`<header><b>记录 #${String(records.length-i).padStart(3,'0')}</b><span>${r.date||''}</span></header><div class="record-grid"><span>生存时间<strong>${formatRunTime(r.time)}</strong></span><span>分数<strong>${r.score}</strong></span><span>等级<strong>${r.level}</strong></span><span>危险等级<strong>${r.threat}</strong></span></div><small>${r.reason||'行动结束'} · 驾驶员 #${String(r.pilot||1).padStart(6,'0')}</small>`;content.appendChild(card)});
 }
}

const interfaceTouchDevice=('ontouchstart' in window)||(navigator.maxTouchPoints>0);
const pointerActivationSeen=new WeakMap(),syntheticPenActivation=new WeakMap();
document.addEventListener('click',event=>{
 const control=event.target instanceof Element?event.target.closest('button,[role="button"]'):null;if(!control)return;
 const syntheticAt=syntheticPenActivation.get(control)||0;
 if(event.isTrusted&&performance.now()-syntheticAt<450){event.preventDefault();event.stopImmediatePropagation();return}
 pointerActivationSeen.set(control,performance.now());
},true);
document.addEventListener('pointerup',event=>{
 if(event.pointerType!=='pen')return;
 const control=event.target instanceof Element?event.target.closest('button,[role="button"]'):null;
 if(!control||control.disabled||control.getAttribute('aria-disabled')==='true')return;
 const stamp=performance.now();
 setTimeout(()=>{if((pointerActivationSeen.get(control)||0)>=stamp)return;syntheticPenActivation.set(control,performance.now());control.click()},0);
},true);
const uiPrefs={
 shake:true,
 scan:true,
 sfx:localStorage.getItem('iwSfx')!=='off',
 music:localStorage.getItem('iwMusic')!=='off',
 touchSensitivity:Math.max(.8,Math.min(2.2,(Number(localStorage.getItem('iwTouchSensitivity'))||150)/100)),
 controlMode:localStorage.getItem('iwControlMode')==='keyboard'?'keyboard':'mouse'
};
let settingsReturnState='menu';
function refreshChapterMenu(){
 $('#startButton').disabled=false;
 $('#startButton').classList.remove('unavailable');
 $('#startButton span').textContent='继续游戏';
 const checkpoint=IWSave.data.runCheckpoint;
 $('#startButton small').textContent=checkpoint?`检查点 ${formatRunTime(checkpoint.elapsed)}`:'开始当前行动';
 refreshSaveStatus();
}
function createRunCheckpoint(){
 if(!running||!player||!build)return null;
 const boss=enemies.some(e=>e.boss),snapshot={schema:1,elapsed:Math.floor(elapsed),score,level,xp,nextXp,bombs,player:{hp:Math.max(1,Math.ceil(player.hp)),maxHp:player.maxHp},cores:coreManager.createSnapshot(),awakenings:awakeningSystem.getActive().map(a=>a.id),build:{bossClearedTier:build.bossClearedTier,bossDirectorTier:build.bossDirectorTier,bossDirectorIndex:build.bossDirectorIndex,bossDirectorProgress:boss?8:build.bossDirectorProgress,bossesDefeated:build.bossesDefeated,barrierCharge:build.barrierCharge,shieldLayers:build.shieldLayers,lastLandmarkThreat:build.lastLandmarkThreat}};
 return IWSave.saveCheckpoint(snapshot);
}
function restoreRunCheckpoint(){
 const cp=IWSave.data.runCheckpoint;if(!cp||cp.schema!==1)return false;
 elapsed=Math.max(0,Number(cp.elapsed)||0);score=Math.max(0,Number(cp.score)||0);level=Math.max(1,Number(cp.level)||1);xp=Math.max(0,Number(cp.xp)||0);nextXp=Math.max(1,Number(cp.nextXp)||50);bombs=Math.max(0,Math.min(3,Number(cp.bombs)||0));player.maxHp=Math.max(100,Number(cp.player?.maxHp)||100);player.hp=Math.max(1,Math.min(player.maxHp,Number(cp.player?.hp)||player.maxHp));coreManager.loadSnapshot(cp.cores,{silent:true});for(const id of cp.awakenings||[])awakeningSystem.grant(id);Object.assign(build,cp.build||{});build.bossPendingNumber=0;build.bossPendingTimer=0;coreEffects.applyPlayerStats();updateUI();setTimeout(()=>toast('安全检查点已载入','important'),180);return true;
}
function refreshSaveStatus(){const el=$('#saveStatusText');if(!el)return;const save=IWSave.data;el.textContent=`V${save.version} · ${save.profile.totalRuns} 次行动 · ${new Date(save.updatedAt).toLocaleString('zh-CN')}`}
function showChapterComplete(){
 if(!IWSave.completeChapterOne())return;
 IWSave.clearCheckpoint();
 running=false;paused=false;state='chapterComplete';UI.hud.classList.add('hidden');UI.timerPanel.classList.add('hidden');UI.touch.classList.add('hidden');setSystemMenuVisible(false);showScreen(UI.chapterComplete);refreshChapterMenu();
}
function isMouseBattleMode(){return !interfaceTouchDevice&&uiPrefs.controlMode==='mouse'&&state==='game'&&running&&!paused&&!dying}
function refreshMouseCursorState(){
 const active=isMouseBattleMode()&&document.pointerLockElement===canvas;
 document.body.classList.toggle('mouse-game-active',active);
}
function releaseMouseLock(){
 mouseMoveActive=false;mouseDeltaX=mouseDeltaY=0;
 if(document.pointerLockElement===canvas)document.exitPointerLock?.();
 refreshMouseCursorState();
}
function requestMouseBattleLock(){
 if(!isMouseBattleMode())return;
 if(document.pointerLockElement!==canvas){
  let result;
  try{result=canvas.requestPointerLock?.({unadjustedMovement:true})}catch(_){result=canvas.requestPointerLock?.()}
  if(result&&typeof result.catch==='function')result.catch(()=>{try{canvas.requestPointerLock?.()}catch(_){}});
 }else refreshMouseCursorState();
}
document.addEventListener('pointerlockchange',()=>{
 mouseMoveActive=document.pointerLockElement===canvas&&isMouseBattleMode();
 mouseDeltaX=mouseDeltaY=0;refreshMouseCursorState();
 if(isMouseBattleMode()&&!mouseMoveActive)toast('点击战场启用鼠标控制');
});
document.addEventListener('pointerlockerror',()=>{mouseMoveActive=false;refreshMouseCursorState();toast('点击战场启用鼠标控制')});
function refreshPauseToggles(){
 const sfxSetting=$('#sfxSetting'),musicSetting=$('#musicSetting');
 const sfxVolumeSetting=$('#sfxVolumeSetting'),musicVolumeSetting=$('#musicVolumeSetting');
 const touchSensitivitySetting=$('#touchSensitivitySetting'),controlModeSetting=$('#controlModeSetting');
 const sfxVolumeValue=$('#sfxVolumeValue'),musicVolumeValue=$('#musicVolumeValue');
 const touchSensitivityValue=$('#touchSensitivityValue');
 if(sfxSetting)sfxSetting.checked=uiPrefs.sfx;
 if(musicSetting)musicSetting.checked=uiPrefs.music;
 if(sfxVolumeSetting)sfxVolumeSetting.value=String(Math.round(audioSystem.prefs.sfxVolume*100));
 if(musicVolumeSetting)musicVolumeSetting.value=String(Math.round(audioSystem.prefs.musicVolume*100));
 if(touchSensitivitySetting)touchSensitivitySetting.value=String(Math.round(uiPrefs.touchSensitivity*100));
 if(controlModeSetting)controlModeSetting.value=uiPrefs.controlMode;
 if(sfxVolumeValue)sfxVolumeValue.textContent=Math.round(audioSystem.prefs.sfxVolume*100)+'%';
 if(musicVolumeValue)musicVolumeValue.textContent=Math.round(audioSystem.prefs.musicVolume*100)+'%';
 if(touchSensitivityValue)touchSensitivityValue.textContent=Math.round(uiPrefs.touchSensitivity*100)+'%';
 document.body.classList.toggle('mouse-control',!interfaceTouchDevice&&uiPrefs.controlMode==='mouse');
 if(typeof refreshMouseCursorState==='function')refreshMouseCursorState();
 const moveHelp=$('#controlMoveHelp'),barrierHelp=$('#controlBarrierHelp');
 if(moveHelp)moveHelp.innerHTML=uiPrefs.controlMode==='mouse'?'<kbd>移动鼠标</kbd><span>控制战机</span>':'<kbd>WASD / 方向键</kbd><span>移动战机</span>';
 if(barrierHelp)barrierHelp.innerHTML=uiPrefs.controlMode==='mouse'?'<kbd>鼠标右键</kbd><span>启动亚空间屏障</span>':'<kbd>B</kbd><span>启动亚空间屏障</span>';
 document.body.classList.remove('no-scanlines');
 if(typeof audioSystem!=='undefined'){audioSystem.prefs.sfx=uiPrefs.sfx;audioSystem.prefs.music=uiPrefs.music;audioSystem.syncState();}
}
let frameFaultCount=0,lastFrameFaultAt=0;
function recoverFrameState(error){
 frameFaultCount++;lastFrameFaultAt=performance.now();
 console.error('战斗帧异常，已自动恢复：',error);
 if(player){
  const defaults={x:W/2,y:H-SAFE_BOTTOM-75,vx:0,vy:0,targetVx:0,targetVy:0,tilt:0,pitch:0,thrust:.28,visualY:0,recoil:0};
  for(const [key,value] of Object.entries(defaults))if(!Number.isFinite(player[key]))player[key]=value;
 }
 const cleanInPlace=pool=>{if(!Array.isArray(pool))return;for(let i=pool.length-1;i>=0;i--)if(!pool[i]||!Number.isFinite(pool[i].x)||!Number.isFinite(pool[i].y))pool.splice(i,1)};
 bullets=ensureEntityArray('bullets',bullets);missiles=ensureEntityArray('missiles',missiles);enemyBullets=ensureEntityArray('enemyBullets',enemyBullets);particles=ensureEntityArray('particles',particles);pickups=ensureEntityArray('pickups',pickups);enemies=Array.isArray(enemies)?enemies:[];
 [bullets,missiles,enemies,enemyBullets,particles,pickups].forEach(cleanInPlace);
 if(typeof enemyLasers!=='undefined'&&!Array.isArray(enemyLasers))enemyLasers=[];
 last=performance.now();
}
function loop(t){
 if(!running)return;
 requestAnimationFrame(loop);
 const rawDt=Math.max(0,(t-last)/1000||0);last=t;
 // Safari/iPad may resume with a multi-second frame. The stability layer
 // discards the gap plus a few settling frames before simulation continues.
 const lifecycleGap=IWStability?.consumeFrameGuard?.(rawDt)??(rawDt>.12);
 const dt=lifecycleGap?0:Math.min(.028,rawDt);
 if(typeof mobilePerf!=='undefined'&&mobilePerf.enabled){
  mobilePerf.frameMs=mobilePerf.frameMs*.9+rawDt*1000*.1;mobilePerf.sampleFrames++;
  const sampleAge=t-mobilePerf.lastSample;
  if(sampleAge>=1000){
   mobilePerf.avgFps=Math.max(1,Math.round(mobilePerf.sampleFrames*1000/sampleAge));mobilePerf.sampleFrames=0;mobilePerf.lastSample=t;
   if(mobilePerf.avgFps<40){mobilePerf.slowFrames++;mobilePerf.fastFrames=0;mobilePerf.thermalPressure=Math.min(10,(mobilePerf.thermalPressure||0)+1)}else if(mobilePerf.avgFps>53){mobilePerf.fastFrames++;mobilePerf.slowFrames=Math.max(0,mobilePerf.slowFrames-1);mobilePerf.thermalPressure=Math.max(0,(mobilePerf.thermalPressure||0)-.35)}else{mobilePerf.slowFrames=Math.max(0,mobilePerf.slowFrames-1);mobilePerf.fastFrames=Math.max(0,mobilePerf.fastFrames-1)}
   if(mobilePerf.slowFrames>=2){const drop=mobilePerf.avgFps<30?.16:.10;mobilePerf.quality=Math.max(.52,mobilePerf.quality-drop);mobilePerf.slowFrames=0}
   if(mobilePerf.fastFrames>=6&&(mobilePerf.thermalPressure||0)<2){mobilePerf.quality=Math.min(1,mobilePerf.quality+.06);mobilePerf.fastFrames=0}
  }
 }
 try{
  const battleUpdating=!lifecycleGap&&((state==='game'&&!paused)||(state==='dying'&&dying));
  if(battleUpdating&&dt>0)update(dt);
  IWStability?.watchdog?.();
  if(state==='game'&&!paused&&dt>0)updateBarrierDangerHint(dt);
  if(!lifecycleGap){
   IWStability?.beforeRender?.();
   draw();
  }
 }catch(error){recoverFrameState(error)}
}
function renderCoreSelection(){
 const cards=[...document.querySelectorAll('.core-card')];
 cards.forEach((card,i)=>{card.classList.toggle('selected',i===coreSelection);card.setAttribute('aria-selected',i===coreSelection?'true':'false')});
 if(cards[coreSelection])cards[coreSelection].focus({preventScroll:true});
}
function selectCore(index){
 const result=upgradeSystem.select(index);if(!result){
  if(state==='core')chooseCore();
  return;
 }
 const meta=CORE_CATEGORY_META[result.definition.category];markCoreUnlocked(result.definition.id,result.level);
 state='game';UI.core.classList.add('hidden');paused=false;setSystemMenuVisible(true);
 audioSystem?.play('upgrade');toast(`${result.definition.shortName}源核 ${['Ⅰ','Ⅱ','Ⅲ'][result.level-1]}`);
}
function coreModelMarkup(id,category){
 return `<span class="core-model ${category}" data-core-model="${id}" aria-hidden="true"><i class="core-model-ring ring-a"></i><i class="core-model-ring ring-b"></i><i class="core-model-shell"></i><i class="core-model-heart"></i><i class="core-model-mark"></i></span>`;
}
function chooseCore(){
 releaseMouseLock?.();paused=true;state='core';setSystemMenuVisible(false);showScreen(UI.core);refreshMouseCursorState?.();UI.hud.classList.remove('hidden');UI.timerPanel.classList.remove('hidden');
 currentCorePool=upgradeSystem.createChoices(3);coreSelection=0;
 const box=$('#coreChoices');box.innerHTML='';
 if(!currentCorePool.length){
  state='game';UI.core.classList.add('hidden');paused=false;setSystemMenuVisible(true);toast('所有源核已达到Ⅲ级');return;
 }
 currentCorePool.forEach((choice,i)=>{
  const definition=coreManager.getDefinition(choice.id);
  const meta=CORE_CATEGORY_META[choice.category];
  const nextData=choice.nextLevelData;
  const el=document.createElement('button');
  el.className='core-card';el.type='button';
  el.style.setProperty('--core-color',meta.color);
  el.innerHTML=`<em>${i+1}</em><b>${coreModelMarkup(definition.id,choice.category)}<span class="core-card-title">${definition.shortName}源核 ${['Ⅰ','Ⅱ','Ⅲ'][choice.nextLevel-1]}</span></b><p>${nextData.description}</p><span>${meta.name} · ${nextData.name}</span>`;
  el.onclick=()=>selectCore(i);
  el.onmouseenter=()=>{coreSelection=i;renderCoreSelection()};
  box.appendChild(el);
 });
 renderCoreSelection();
}
function die(){
 audioSystem?.play('death');
 IWSave?.clearCheckpoint?.();
 saveRunRecord('战机损毁');
 running=false;dying=false;state='death';setSystemMenuVisible(false);UI.hud.classList.add('hidden');UI.timerPanel.classList.add('hidden');UI.touch.classList.add('hidden');showScreen(UI.death);
 const nextPilotId=pilotId+1;
 const main=$('#deathMain'),sub=$('#deathSub'),stats=$('#deathStats'),actions=$('#deathActions');
 main.textContent='';main.classList.remove('visible');sub.textContent='';stats.classList.add('hidden');actions.classList.add('hidden');
 setTimeout(()=>{main.textContent='驾驶员生命信号消失';main.classList.add('visible')},350);
 const lines=['正在搜索意识备份……','发现可用备份。','开始同步记忆……','同步完成。','备用驾驶员编号：#'+String(nextPilotId).padStart(6,'0')];let i=0;
 setTimeout(()=>{const timer=setInterval(()=>{sub.innerHTML+=`<div>${lines[i]}</div>`;i++;if(i===lines.length){clearInterval(timer);stats.innerHTML=`本次行动分数：<b>${score}</b><br>生存时间：<b>${formatRunTime(elapsed)}</b><br>到达等级：<b>${level}</b><br>最高危险等级：<b>${THREAT_ROMAN[threatLevel()]}</b>`;stats.classList.remove('hidden');actions.classList.remove('hidden')}},850)},1150)
}

let barrierTutorialActive=false,barrierTutorialShownThisLaunch=false,barrierDangerHintCd=0;
function barrierControlText(){if(touchDevice)return '点击“亚空间屏障”按钮';return uiPrefs?.controlMode==='mouse'?'按鼠标右键':'按 B 键'}
function dismissBarrierTutorial(remember=true){
 const tip=$('#barrierTutorial');if(!tip)return;
 tip.classList.add('hidden');UI.barrierBox?.classList.remove('tutorial-focus');barrierTutorialActive=false;
 if(running&&state==='game'&&!dying){paused=false;last=performance.now()}
}
function showBarrierTutorial(){
 if(!running||state!=='game'||dying||barrierTutorialShownThisLaunch)return;
 const tip=$('#barrierTutorial'),copy=$('#barrierTutorialText');if(!tip||!copy)return;
 barrierTutorialShownThisLaunch=true;barrierTutorialActive=true;paused=true;copy.textContent=`${barrierControlText()}启动屏障，可立即吸收并清除画面中的全部敌方子弹。`;
 tip.classList.remove('hidden');UI.barrierBox?.classList.add('tutorial-focus');releaseMouseLock?.();refreshMouseCursorState?.();
}
$('#barrierTutorialClose')?.addEventListener('click',()=>dismissBarrierTutorial(true));
UI.barrierBox?.addEventListener('pointerup',()=>{if(barrierTutorialActive){dismissBarrierTutorial(true);setTimeout(()=>pulse(),0)}},{passive:true});
function updateBarrierDangerHint(dt){
 barrierDangerHintCd=Math.max(0,barrierDangerHintCd-dt);
 const danger=running&&state==='game'&&!paused&&!dying&&bombs>0&&enemyBullets.length>=38;
 UI.barrierBox?.classList.toggle('danger-hint',danger);
 if(danger&&barrierDangerHintCd<=0){barrierDangerHintCd=7;toast('弹幕过密：启动亚空间屏障可吸收全部敌弹')}
}

function updateUI(){
 if(UI.timer)UI.timer.textContent=formatRunTime(elapsed);
 UI.hpText.textContent=`${Math.ceil(player?.hp||0)} / ${player?.maxHp||100}`;UI.hpFill.style.width=Math.max(0,(player?.hp||0)/(player?.maxHp||100)*100)+'%';UI.xpFill.style.width=(build?.allCoresMax?100:xp/nextXp*100)+'%';UI.xpFill.classList.toggle('maxed',Boolean(build?.allCoresMax));UI.score.textContent=score;UI.level.textContent=level;UI.threat.textContent=THREAT_ROMAN[typeof displayedThreatLevel==='function'?displayedThreatLevel():threatLevel()];
 const barrierLeft=Math.max(0,bombs||0);UI.barrierCount.textContent=`剩余 ${barrierLeft} 次`;UI.touchBarrierCount.textContent=`剩余 ${barrierLeft} 次`;if(UI.barrierChargeFill)UI.barrierChargeFill.style.width=Math.max(0,Math.min(100,build?.barrierCharge||0))+'%';
 [...UI.barrierCores.children].forEach((core,i)=>{const active=i<barrierLeft;core.classList.toggle('active',active);core.classList.toggle('spent',!active&&!core.classList.contains('consuming'))});
 [...UI.touchBarrierCores.children].forEach((core,i)=>core.classList.toggle('active',i<barrierLeft));
 UI.barrierBox.classList.toggle('empty',barrierLeft===0);UI.barrierBox.classList.toggle('last-charge',barrierLeft===1);UI.bombButton.classList.toggle('empty',barrierLeft===0);UI.bombButton.disabled=barrierLeft===0;
}
function animateBarrierUse(spentIndex){
 const core=UI.barrierCores.children[spentIndex],touchCore=UI.touchBarrierCores.children[spentIndex];
 UI.barrierBox.classList.remove('activating');UI.bombButton.classList.remove('activating');void UI.barrierBox.offsetWidth;UI.barrierBox.classList.add('activating');UI.bombButton.classList.add('activating');
 if(core){core.classList.remove('active','spent');core.classList.add('consuming');setTimeout(()=>{core.classList.remove('consuming');core.classList.add('spent')},540)}
 if(touchCore){touchCore.classList.remove('active');touchCore.classList.add('consuming');setTimeout(()=>touchCore.classList.remove('consuming'),540)}
 setTimeout(()=>{UI.barrierBox.classList.remove('activating');UI.bombButton.classList.remove('activating')},430);
}
function toast(text,priority='normal'){
 const now=performance.now();
 if(priority==='quiet')return;
 // 重要警报显示期间，普通状态消息不能覆盖它；普通消息本身也限制频率。
 if(priority!=='important'&&(UI.toast._importantUntil||0)>now)return;
 if(priority==='normal'&&now-(UI.toast._lastNormalAt||0)<3200)return;
 if(priority==='important')UI.toast._importantUntil=now+2100;
 else UI.toast._lastNormalAt=now;
 UI.toast.textContent=text;UI.toast.classList.remove('show');void UI.toast.offsetWidth;UI.toast.classList.add('show');clearTimeout(UI.toast._timer);
 UI.toast._timer=setTimeout(()=>UI.toast.classList.remove('show'),priority==='important'?2000:1350);
}

$('#systemMenuButton').onclick=openPauseMenu;const resumeButton=$('#resumeButton');if(resumeButton){resumeButton.onclick=closePauseMenu;resumeButton.addEventListener('pointerup',e=>{e.preventDefault();closePauseMenu()},{passive:false})}$('#restartButton').onclick=restartCurrentRun;$('#titleButton').onclick=returnToTitle;
$('#saveProgressButton').onclick=()=>{const cp=createRunCheckpoint();if(!cp)return;const hint=$('#saveProgressHint');if(hint)hint.textContent=`已保存 · ${formatRunTime(cp.elapsed)}`;refreshChapterMenu();toast('当前行动已保存','important')};
$('#controlsButton').onclick=()=>$('#controlsPanel').classList.toggle('hidden');
$('#gameSettingsButton').onclick=()=>{settingsReturnState='pause';showScreen(UI.settings);refreshPauseToggles()};
$('#sfxSetting')?.addEventListener('change',e=>{uiPrefs.sfx=e.target.checked;audioSystem.setEnabled('sfx',uiPrefs.sfx);refreshPauseToggles()});
$('#musicSetting')?.addEventListener('change',e=>{uiPrefs.music=e.target.checked;audioSystem.setEnabled('music',uiPrefs.music);refreshPauseToggles()});
$('#sfxVolumeSetting')?.addEventListener('input',e=>{const value=Math.max(0,Math.min(100,Number(e.target.value)||0));audioSystem.setVolume('sfx',value/100);const out=$('#sfxVolumeValue');if(out)out.textContent=Math.round(value)+'%'});
$('#musicVolumeSetting')?.addEventListener('input',e=>{const value=Math.max(0,Math.min(100,Number(e.target.value)||0));audioSystem.setVolume('music',value/100);const out=$('#musicVolumeValue');if(out)out.textContent=Math.round(value)+'%'});
$('#touchSensitivitySetting')?.addEventListener('input',e=>{const value=Math.max(80,Math.min(220,Number(e.target.value)||150));uiPrefs.touchSensitivity=value/100;localStorage.setItem('iwTouchSensitivity',String(value));refreshPauseToggles()});
$('#controlModeSetting')?.addEventListener('change',e=>{uiPrefs.controlMode=e.target.value==='mouse'?'mouse':'keyboard';localStorage.setItem('iwControlMode',uiPrefs.controlMode);releaseMouseLock();for(const key of Object.keys(keys))keys[key]=false;refreshPauseToggles();toast(uiPrefs.controlMode==='mouse'?'已切换为鼠标控制，返回战场后点击启用':'已切换为键盘控制')});
refreshPauseToggles();
document.addEventListener('click',e=>{if(e.target.closest('button'))audioSystem?.play('ui')});
$('#settingsBackButton').onclick=()=>{if(settingsReturnState==='pause'){showScreen(UI.pause);setSystemMenuVisible(false)}else{refreshChapterMenu();showScreen(UI.menu)}};
// HUD 内的亚空间屏障在移动端直接作为按钮使用；独立圆形按钮不再显示。
UI.barrierBox?.setAttribute('role','button');UI.barrierBox?.setAttribute('tabindex','0');UI.barrierBox?.setAttribute('aria-label','启动亚空间屏障');
const activateHudBarrier=e=>{if(e){e.preventDefault();e.stopPropagation()}if(touchDevice&&state==='game'&&running&&!paused&&!dying)pulse()};
UI.barrierBox?.addEventListener('pointerup',activateHudBarrier,{passive:false});
UI.barrierBox?.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&touchDevice)activateHudBarrier(e)});
$('#startButton').onclick=()=>beginGame(Boolean(IWSave.data.runCheckpoint));$('#newGameButton').onclick=()=>{IWSave.clearCheckpoint();IWSave.markIntroSeen();refreshChapterMenu();startStory()};const skipStoryButton=$('#skipStory');const skipStoryNow=e=>{if(e){e.preventDefault();e.stopPropagation()}IWSave.markIntroSeen();beginGame()};skipStoryButton.onclick=skipStoryNow;skipStoryButton.addEventListener('pointerup',skipStoryNow);skipStoryButton.addEventListener('touchend',skipStoryNow,{passive:false});$('#storyRoll').addEventListener('animationend',()=>{IWSave.markIntroSeen();beginGame()});$('#syncRestartButton').onclick=()=>{pilotId++;localStorage.setItem('infinityWingsPilotIdV2',String(pilotId));IWSave.data.profile.pilotId=pilotId;IWSave.clearCheckpoint();$('#archiveCloneCount').textContent='当前驾驶员编号：#'+String(pilotId).padStart(6,'0');beginGame()};$('#deathMenuButton').onclick=returnToTitle;$('#bombButton').onclick=pulse;
$('#archiveButton').onclick=()=>{showScreen(UI.archive);$('#archiveCloneCount').textContent='当前驾驶员编号：#'+String(pilotId).padStart(6,'0');renderArchiveHome()};document.querySelectorAll('[data-archive-view]').forEach(button=>button.onclick=()=>renderArchiveView(button.dataset.archiveView));$('#archiveBack').onclick=renderArchiveHome;$('#settingsButton').onclick=()=>{settingsReturnState='menu';showScreen(UI.settings);refreshPauseToggles()};
document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>showScreen(UI.menu));
$('#chapterCompleteButton').onclick=()=>{state='menu';refreshChapterMenu();showScreen(UI.menu)};
$('#migrationConfirmButton').onclick=()=>{IWSave.migrate();pilotId=IWSave.data.profile.pilotId;refreshChapterMenu();state='menu';showScreen(UI.menu);toast('旧版作战档案迁移完成','important')};
$('#exportSaveButton').onclick=()=>{const blob=new Blob([IWSave.export()],{type:'application/json'}),link=document.createElement('a');link.href=URL.createObjectURL(blob);link.download=`infinity-wings-save-${new Date().toISOString().slice(0,10)}.json`;link.click();setTimeout(()=>URL.revokeObjectURL(link.href),500);toast('永久存档已导出')};
$('#importSaveButton').onclick=()=>$('#importSaveFile').click();
$('#importSaveFile').onchange=async e=>{const file=e.target.files?.[0];if(!file)return;try{IWSave.import(await file.text());pilotId=IWSave.data.profile.pilotId;refreshChapterMenu();toast('永久存档导入成功','important')}catch(error){toast(error.message||'存档导入失败','important')}e.target.value=''};
$('#clearSaveButton').onclick=()=>{if(!confirm('确定清除永久存档吗？此操作无法撤销。'))return;if(!confirm('再次确认：章节、图鉴与行动记录都会被清除。'))return;IWSave.clear();pilotId=1;localStorage.setItem('infinityWingsPilotIdV2','1');refreshChapterMenu();toast('永久存档已清除','important')};
addEventListener('keydown',e=>{
 if(uiPrefs.controlMode==='keyboard'||touchDevice)keys[e.key]=true;
 if(state==='core'){
  if(['ArrowDown','ArrowRight'].includes(e.key)){e.preventDefault();coreSelection=(coreSelection+1)%currentCorePool.length;renderCoreSelection();return}
  if(['ArrowUp','ArrowLeft'].includes(e.key)){e.preventDefault();coreSelection=(coreSelection-1+currentCorePool.length)%currentCorePool.length;renderCoreSelection();return}
  if(e.key==='Enter'||e.key===' '){e.preventDefault();selectCore(coreSelection);return}
  if(['1','2','3'].includes(e.key)){e.preventDefault();selectCore(Number(e.key)-1);return}
 }
 if(e.key==='Escape'&&(state==='death'||state==='dying')){e.preventDefault();beginGame();return}
 if((e.key==='Escape'||e.key==='p'||e.key==='P')&&running){e.preventDefault();state==='pause'?closePauseMenu():openPauseMenu();return}
 if((e.key==='b'||e.key==='B')&&(uiPrefs.controlMode==='keyboard'||touchDevice))pulse();if(state==='story'&&(e.key==='Escape'||e.key===' '))beginGame()
});addEventListener('keyup',e=>keys[e.key]=false);
const joy=$('#joystick'),knob=$('#knob');
function updateMouseRelative(e){
 if(!isMouseBattleMode()||document.pointerLockElement!==canvas)return;
 const rect=canvas.getBoundingClientRect();if(!rect.width||!rect.height)return;
 // X/Y 使用同一个缩放比例，避免桌面窗口比例变化时产生方向手感不一致。
 const displayScale=Math.min(W/rect.width,H/rect.height);
 const samples=typeof e.getCoalescedEvents==='function'?e.getCoalescedEvents():[e];
 for(const sample of samples){
  mouseDeltaX+=(Number(sample.movementX)||0)*displayScale;
  mouseDeltaY+=(Number(sample.movementY)||0)*displayScale;
 }
 mouseMoveActive=true;
}
canvas.addEventListener('mousedown',e=>{
 if(!isMouseBattleMode())return;
 if(e.button===2){e.preventDefault();pulse();return}
 if(e.button===0&&document.pointerLockElement!==canvas){e.preventDefault();requestMouseBattleLock()}
});
const mouseMotionEvent=('onpointerrawupdate' in window)?'pointerrawupdate':'mousemove';
document.addEventListener(mouseMotionEvent,updateMouseRelative,{passive:true});
canvas.addEventListener('contextmenu',e=>{if(!interfaceTouchDevice&&uiPrefs.controlMode==='mouse'&&state==='game')e.preventDefault()});

function endTouchDrive(pointerId=null){
 if(pointerId!==null&&touchMovePointerId!==pointerId)return;
 touchMoveActive=false;touchMovePointerId=null;joyX=joyY=0;
 if(knob)knob.style.transform='translate(0,0)';
}
function updateTouchTarget(clientX,clientY){
 const rect=canvas.getBoundingClientRect();
 if(!rect.width||!rect.height)return;
 const scaleX=W/rect.width,scaleY=H/rect.height;
 const fingerClearance=Math.max(54,Math.min(88,rect.height*.085));
 touchTargetX=Math.max(28,Math.min(W-28,(clientX-rect.left)*scaleX));
 touchTargetY=Math.max(48,Math.min(H-SAFE_BOTTOM-28,(clientY-rect.top-fingerClearance)*scaleY));
 touchMoveActive=true;
}
canvas.addEventListener('pointerdown',e=>{
 if(!touchDevice||state!=='game'||!running||paused||dying||e.pointerType==='mouse')return;
 e.preventDefault();touchMovePointerId=e.pointerId;canvas.setPointerCapture?.(e.pointerId);updateTouchTarget(e.clientX,e.clientY);
},{passive:false});
canvas.addEventListener('pointermove',e=>{
 if(!touchMoveActive||e.pointerId!==touchMovePointerId)return;
 e.preventDefault();updateTouchTarget(e.clientX,e.clientY);
},{passive:false});
canvas.addEventListener('pointerup',e=>endTouchDrive(e.pointerId),{passive:true});
canvas.addEventListener('pointercancel',e=>endTouchDrive(e.pointerId),{passive:true});
canvas.addEventListener('lostpointercapture',e=>endTouchDrive(e.pointerId),{passive:true});

const portraitLock=$('#portraitLock');
const touchDevice=interfaceTouchDevice;
const mobilePortraitDevice=touchDevice;
if(touchDevice){document.body.classList.add('touch-device','mobile-portrait-device');UI.bombButton?.classList.add('hidden');UI.bombButton?.setAttribute('aria-hidden','true')}else document.body.classList.add('desktop-device');
function isLandscapeViewport(){
 const vv=window.visualViewport;
 const width=vv?.width||innerWidth;
 const height=vv?.height||innerHeight;
 return width>height;
}
async function requestPortraitOrientation(){
 if(!mobilePortraitDevice||isLandscapeViewport())return false;
 try{
  if(screen.orientation?.lock){await screen.orientation.lock('portrait');return true}
 }catch{}
 return false;
}
function syncPortraitLock(){
 const blocked=mobilePortraitDevice&&isLandscapeViewport();
 document.body.classList.toggle('orientation-blocked',blocked);
 portraitLock?.classList.toggle('hidden',!blocked);
 portraitLock?.setAttribute('aria-hidden',String(!blocked));
 if(blocked){
  endTouchDrive();
  if(running&&!paused){paused=true;document.body.dataset.orientationPaused='1'}
 }else{
  requestPortraitOrientation();
  if(document.body.dataset.orientationPaused==='1'){
   delete document.body.dataset.orientationPaused;
   if(running&&state==='game'){paused=false;last=performance.now()}
  }
 }
}
addEventListener('resize',syncPortraitLock,{passive:true});
window.visualViewport?.addEventListener('resize',syncPortraitLock,{passive:true});
addEventListener('orientationchange',()=>setTimeout(syncPortraitLock,180),{passive:true});
document.addEventListener('pointerdown',()=>requestPortraitOrientation(),{passive:true,once:true});
['gesturestart','gesturechange','gestureend'].forEach(type=>document.addEventListener(type,e=>e.preventDefault(),{passive:false}));
function isNativeTouchSurface(target){
 if(!(target instanceof Element))return false;
 if(target.closest('input[type=range],select,textarea'))return true;
 const surface=target.closest('.archive-detail-content,.touch-scroll,[data-touch-scroll]');
 if(!surface)return false;
 return surface.scrollHeight>surface.clientHeight||surface.scrollWidth>surface.clientWidth;
}
document.addEventListener('touchmove',e=>{if(e.target.closest('#gameShell')&&!isNativeTouchSurface(e.target))e.preventDefault()},{passive:false});
function enableRangeTouch(input){
 if(!input)return;
 const update=clientX=>{const rect=input.getBoundingClientRect();const min=Number(input.min)||0,max=Number(input.max)||100;const ratio=Math.max(0,Math.min(1,(clientX-rect.left)/Math.max(1,rect.width)));input.value=String(min+(max-min)*ratio);input.dispatchEvent(new Event('input',{bubbles:true}))};
 input.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse')return;e.preventDefault();input.setPointerCapture?.(e.pointerId);update(e.clientX)},{passive:false});
 input.addEventListener('pointermove',e=>{if(e.pointerType==='mouse'||!input.hasPointerCapture?.(e.pointerId))return;e.preventDefault();update(e.clientX)},{passive:false});
 input.addEventListener('touchstart',e=>{const t=e.touches[0];if(t)update(t.clientX)},{passive:true});
 input.addEventListener('touchmove',e=>{const t=e.touches[0];if(t){e.preventDefault();update(t.clientX)}},{passive:false});
}
document.querySelectorAll('input[type=range]').forEach(enableRangeTouch);
syncPortraitLock();
boot();draw();
