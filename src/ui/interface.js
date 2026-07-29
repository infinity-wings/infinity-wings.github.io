
const ARCHIVE_KEYS={cores:'iwArchiveCoreLevelsV2',legacyCores:'iwArchiveCoresV1',enemies:'iwArchiveEnemiesV1',records:'iwRunRecordsV1'};
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
 boss:{name:'阶段Boss',baseHp:1150,attack:'连射、扇形/环形弹幕、定点与扫射激光',damage:'子弹 10–20 / 激光 24–28 / 接触 30',xp:210,desc:'高危大型单位，拥有更高耐久与时间抗性。'}
};
function readArchiveSet(key){try{return new Set(JSON.parse(localStorage.getItem(key)||'[]'))}catch{return new Set()}}
function writeArchiveSet(key,set){localStorage.setItem(key,JSON.stringify([...set]))}
function markEnemyEncounter(type){const set=readArchiveSet(ARCHIVE_KEYS.enemies);if(!set.has(type)){set.add(type);writeArchiveSet(ARCHIVE_KEYS.enemies,set)}}
function readCoreArchive(){
 try{
  const raw=JSON.parse(localStorage.getItem(ARCHIVE_KEYS.cores)||'{}');
  if(raw&&typeof raw==='object'&&!Array.isArray(raw))return raw;
 }catch{}
 const migrated={};
 for(const id of readArchiveSet(ARCHIVE_KEYS.legacyCores))migrated[id]=1;
 if(Object.keys(migrated).length)localStorage.setItem(ARCHIVE_KEYS.cores,JSON.stringify(migrated));
 return migrated;
}
function markCoreUnlocked(id,level=1){const archive=readCoreArchive();archive[id]=Math.max(Number(archive[id])||0,Math.max(1,Math.min(3,Number(level)||1)));localStorage.setItem(ARCHIVE_KEYS.cores,JSON.stringify(archive))}
function getRunRecords(){try{return JSON.parse(localStorage.getItem(ARCHIVE_KEYS.records)||'[]')}catch{return []}}
function saveRunRecord(reason='战机损毁'){
 const records=getRunRecords();records.unshift({time:Math.floor(elapsed),score,level,threat:THREAT_ROMAN[threatLevel()],reason,date:new Date().toLocaleDateString('zh-CN'),pilot:pilotId});
 localStorage.setItem(ARCHIVE_KEYS.records,JSON.stringify(records.slice(0,20)));
}
function formatRunTime(seconds){seconds=Math.max(0,Math.floor(seconds||0));return String(Math.floor(seconds/60)).padStart(2,'0')+':'+String(seconds%60).padStart(2,'0')}
function renderArchiveHome(){document.querySelector('#archiveHome').classList.remove('hidden');document.querySelector('#archiveDetail').classList.add('hidden');}
function drawEnemyArchivePreview(canvas,type){
 const c=canvas?.getContext?.('2d');if(!c||typeof drawEnemyShip!=='function')return;
 const w=canvas.width||132,h=canvas.height||96,isBoss=type==='boss';
 const scale=isBoss?.68:(type==='carrier'||type==='heavy'||type==='barrage')?.82:.98;
 c.save();c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,w,h);c.globalAlpha=1;c.globalCompositeOperation='source-over';
 c.translate(w/2,h/2+4);c.scale(scale,scale);
 const model={type:isBoss?'scout':type,boss:isBoss,eventMeteor:false,x:0,y:0,r:isBoss?45:28,age:Math.max(1,Number(elapsed)||1),dir:1,hp:100,max:100,maxHp:100,shield:0,fuse:2.2};
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
  title.textContent='敌人资料';code.textContent='HOSTILE ARCHIVE';const met=readArchiveSet(ARCHIVE_KEYS.enemies);
  Object.entries(ENEMY_ARCHIVE_DATA).forEach(([id,data])=>{const known=met.has(id);const card=document.createElement('article');card.className='archive-entry enemy-entry '+(known?'':'locked');
   card.innerHTML=known?`<div class="enemy-archive-layout"><div class="enemy-preview"><canvas width="132" height="96" aria-label="${data.name}模型演示"></canvas><i>MODEL PREVIEW</i></div><div class="enemy-archive-info"><header><b>${data.name}</b><span>已遭遇</span></header><div class="enemy-data-grid"><span>基础耐久<strong>${data.baseHp}</strong></span><span>经验值<strong>${data.xp}</strong></span><span>攻击伤害<strong>${data.damage}</strong></span></div><p>${data.desc}</p><small>攻击方式：${data.attack}</small></div></div>`:`<div class="enemy-archive-layout"><div class="enemy-preview unknown"><b>?</b><i>NO SIGNAL</i></div><div class="enemy-archive-info"><header><b>未知敌军</b><span>UNSEEN</span></header><p>首次遭遇后自动记录模型与完整资料。</p></div></div>`;
   content.appendChild(card);if(known){const preview=card.querySelector('canvas');drawEnemyArchivePreview(preview,id);requestAnimationFrame(()=>drawEnemyArchivePreview(preview,id))}});
 }else{
  title.textContent='同步记录';code.textContent='RUN HISTORY';const records=getRunRecords();
  if(!records.length){content.innerHTML='<div class="archive-empty">尚无完整同步记录。完成一次行动后将在此保存。</div>';return}
  records.forEach((r,i)=>{const card=document.createElement('article');card.className='archive-entry record-entry';card.innerHTML=`<header><b>记录 #${String(records.length-i).padStart(3,'0')}</b><span>${r.date||''}</span></header><div class="record-grid"><span>生存时间<strong>${formatRunTime(r.time)}</strong></span><span>分数<strong>${r.score}</strong></span><span>等级<strong>${r.level}</strong></span><span>危险等级<strong>${r.threat}</strong></span></div><small>${r.reason||'行动结束'} · 驾驶员 #${String(r.pilot||1).padStart(6,'0')}</small>`;content.appendChild(card)});
 }
}

const uiPrefs={
 shake:true,
 scan:true,
 sfx:localStorage.getItem('iwSfx')!=='off',
 music:localStorage.getItem('iwMusic')!=='off',
 touchSensitivity:Math.max(.8,Math.min(2.2,(Number(localStorage.getItem('iwTouchSensitivity'))||150)/100))
};
let settingsReturnState='menu';
function refreshPauseToggles(){
 const sfxSetting=$('#sfxSetting'),musicSetting=$('#musicSetting');
 const sfxVolumeSetting=$('#sfxVolumeSetting'),musicVolumeSetting=$('#musicVolumeSetting');
 const touchSensitivitySetting=$('#touchSensitivitySetting');
 const sfxVolumeValue=$('#sfxVolumeValue'),musicVolumeValue=$('#musicVolumeValue');
 const touchSensitivityValue=$('#touchSensitivityValue');
 if(sfxSetting)sfxSetting.checked=uiPrefs.sfx;
 if(musicSetting)musicSetting.checked=uiPrefs.music;
 if(sfxVolumeSetting)sfxVolumeSetting.value=String(Math.round(audioSystem.prefs.sfxVolume*100));
 if(musicVolumeSetting)musicVolumeSetting.value=String(Math.round(audioSystem.prefs.musicVolume*100));
 if(touchSensitivitySetting)touchSensitivitySetting.value=String(Math.round(uiPrefs.touchSensitivity*100));
 if(sfxVolumeValue)sfxVolumeValue.textContent=Math.round(audioSystem.prefs.sfxVolume*100)+'%';
 if(musicVolumeValue)musicVolumeValue.textContent=Math.round(audioSystem.prefs.musicVolume*100)+'%';
 if(touchSensitivityValue)touchSensitivityValue.textContent=Math.round(uiPrefs.touchSensitivity*100)+'%';
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
 const clean=pool=>Array.isArray(pool)?pool.filter(item=>item&&Number.isFinite(item.x)&&Number.isFinite(item.y)):[];
 bullets=clean(bullets);missiles=clean(missiles);enemies=clean(enemies);enemyBullets=clean(enemyBullets);particles=clean(particles);pickups=clean(pickups);
 if(typeof enemyLasers!=='undefined'&&!Array.isArray(enemyLasers))enemyLasers=[];
 last=performance.now();
}
function loop(t){
 if(!running)return;
 requestAnimationFrame(loop);
 const dt=Math.min(.028,Math.max(0,(t-last)/1000||0));last=t;
 try{if(!paused||dying)update(dt);draw()}catch(error){recoverFrameState(error)}
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
 paused=true;state='core';setSystemMenuVisible(false);showScreen(UI.core);UI.hud.classList.remove('hidden');UI.timerPanel.classList.remove('hidden');
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
 saveRunRecord('战机损毁');
 running=false;dying=false;state='death';setSystemMenuVisible(false);UI.hud.classList.add('hidden');UI.timerPanel.classList.add('hidden');UI.touch.classList.add('hidden');showScreen(UI.death);
 const nextPilotId=pilotId+1;
 const main=$('#deathMain'),sub=$('#deathSub'),stats=$('#deathStats'),actions=$('#deathActions');
 main.textContent='';main.classList.remove('visible');sub.textContent='';stats.classList.add('hidden');actions.classList.add('hidden');
 setTimeout(()=>{main.textContent='驾驶员生命信号消失';main.classList.add('visible')},350);
 const lines=['正在搜索意识备份……','发现可用备份。','开始同步记忆……','同步完成。','备用驾驶员编号：#'+String(nextPilotId).padStart(6,'0')];let i=0;
 setTimeout(()=>{const timer=setInterval(()=>{sub.innerHTML+=`<div>${lines[i]}</div>`;i++;if(i===lines.length){clearInterval(timer);stats.innerHTML=`本次行动分数：<b>${score}</b><br>生存时间：<b>${formatRunTime(elapsed)}</b><br>到达等级：<b>${level}</b><br>最高危险等级：<b>${THREAT_ROMAN[threatLevel()]}</b>`;stats.classList.remove('hidden');actions.classList.remove('hidden')}},850)},1150)
}
function updateUI(){
 if(UI.timer)UI.timer.textContent=formatRunTime(elapsed);
 UI.hpText.textContent=`${Math.ceil(player?.hp||0)} / ${player?.maxHp||100}`;UI.hpFill.style.width=Math.max(0,(player?.hp||0)/(player?.maxHp||100)*100)+'%';UI.xpFill.style.width=(build?.allCoresMax?100:xp/nextXp*100)+'%';UI.xpFill.classList.toggle('maxed',Boolean(build?.allCoresMax));UI.score.textContent=score;UI.level.textContent=level;UI.threat.textContent=THREAT_ROMAN[threatLevel()];
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
function toast(text){UI.toast.textContent=text;UI.toast.classList.remove('show');void UI.toast.offsetWidth;UI.toast.classList.add('show');clearTimeout(UI.toast._timer);UI.toast._timer=setTimeout(()=>UI.toast.classList.remove('show'),1500)}

$('#systemMenuButton').onclick=openPauseMenu;$('#resumeButton').onclick=closePauseMenu;$('#restartButton').onclick=restartCurrentRun;$('#titleButton').onclick=returnToTitle;
$('#controlsButton').onclick=()=>$('#controlsPanel').classList.toggle('hidden');
$('#gameSettingsButton').onclick=()=>{settingsReturnState='pause';showScreen(UI.settings);refreshPauseToggles()};
$('#sfxSetting')?.addEventListener('change',e=>{uiPrefs.sfx=e.target.checked;audioSystem.setEnabled('sfx',uiPrefs.sfx);refreshPauseToggles()});
$('#musicSetting')?.addEventListener('change',e=>{uiPrefs.music=e.target.checked;audioSystem.setEnabled('music',uiPrefs.music);refreshPauseToggles()});
$('#sfxVolumeSetting')?.addEventListener('input',e=>{const value=Math.max(0,Math.min(100,Number(e.target.value)||0));audioSystem.setVolume('sfx',value/100);const out=$('#sfxVolumeValue');if(out)out.textContent=Math.round(value)+'%'});
$('#musicVolumeSetting')?.addEventListener('input',e=>{const value=Math.max(0,Math.min(100,Number(e.target.value)||0));audioSystem.setVolume('music',value/100);const out=$('#musicVolumeValue');if(out)out.textContent=Math.round(value)+'%'});
$('#touchSensitivitySetting')?.addEventListener('input',e=>{const value=Math.max(80,Math.min(220,Number(e.target.value)||150));uiPrefs.touchSensitivity=value/100;localStorage.setItem('iwTouchSensitivity',String(value));refreshPauseToggles()});
refreshPauseToggles();
document.addEventListener('click',e=>{if(e.target.closest('button'))audioSystem?.play('ui')});
$('#settingsBackButton').onclick=()=>{if(settingsReturnState==='pause'){showScreen(UI.pause);setSystemMenuVisible(false)}else showScreen(UI.menu)};
$('#startButton').onclick=startStory;const skipStoryButton=$('#skipStory');const skipStoryNow=e=>{if(e){e.preventDefault();e.stopPropagation()}beginGame()};skipStoryButton.onclick=skipStoryNow;skipStoryButton.addEventListener('pointerup',skipStoryNow);skipStoryButton.addEventListener('touchend',skipStoryNow,{passive:false});$('#storyRoll').addEventListener('animationend',beginGame);$('#syncRestartButton').onclick=()=>{pilotId++;localStorage.setItem('infinityWingsPilotIdV2',String(pilotId));$('#archiveCloneCount').textContent='当前驾驶员编号：#'+String(pilotId).padStart(6,'0');beginGame()};$('#deathMenuButton').onclick=returnToTitle;$('#bombButton').onclick=pulse;
$('#archiveButton').onclick=()=>{showScreen(UI.archive);$('#archiveCloneCount').textContent='当前驾驶员编号：#'+String(pilotId).padStart(6,'0');renderArchiveHome()};document.querySelectorAll('[data-archive-view]').forEach(button=>button.onclick=()=>renderArchiveView(button.dataset.archiveView));$('#archiveBack').onclick=renderArchiveHome;$('#settingsButton').onclick=()=>{settingsReturnState='menu';showScreen(UI.settings);refreshPauseToggles()};
document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>showScreen(UI.menu));
addEventListener('keydown',e=>{
 keys[e.key]=true;
 if(state==='core'){
  if(['ArrowDown','ArrowRight'].includes(e.key)){e.preventDefault();coreSelection=(coreSelection+1)%currentCorePool.length;renderCoreSelection();return}
  if(['ArrowUp','ArrowLeft'].includes(e.key)){e.preventDefault();coreSelection=(coreSelection-1+currentCorePool.length)%currentCorePool.length;renderCoreSelection();return}
  if(e.key==='Enter'||e.key===' '){e.preventDefault();selectCore(coreSelection);return}
  if(['1','2','3'].includes(e.key)){e.preventDefault();selectCore(Number(e.key)-1);return}
 }
 if(e.key==='Escape'&&(state==='death'||state==='dying')){e.preventDefault();beginGame();return}
 if((e.key==='Escape'||e.key==='p'||e.key==='P')&&running){e.preventDefault();state==='pause'?closePauseMenu():openPauseMenu();return}
 if(e.key==='b'||e.key==='B')pulse();if(state==='story'&&(e.key==='Escape'||e.key===' '))beginGame()
});addEventListener('keyup',e=>keys[e.key]=false);
const joy=$('#joystick'),knob=$('#knob');
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
const touchDevice=('ontouchstart' in window)||(navigator.maxTouchPoints>0);
const phoneDevice=touchDevice&&Math.min(screen.width||innerWidth,screen.height||innerHeight)<=600;
if(touchDevice)document.body.classList.add('touch-device');
function syncPortraitLock(){
 const blocked=phoneDevice&&innerWidth>innerHeight;
 portraitLock?.classList.toggle('hidden',!blocked);
 if(blocked){endTouchDrive();if(running&&!paused){paused=true;document.body.dataset.orientationPaused='1'}}
 else if(document.body.dataset.orientationPaused==='1'){delete document.body.dataset.orientationPaused;if(running&&state==='game'){paused=false;last=performance.now()}}
}
addEventListener('resize',syncPortraitLock,{passive:true});
addEventListener('orientationchange',()=>setTimeout(syncPortraitLock,120),{passive:true});
addEventListener('visibilitychange',()=>{if(document.hidden){endTouchDrive();if(running&&!paused)openPauseMenu()}});
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
