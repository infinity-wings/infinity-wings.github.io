
const ARCHIVE_KEYS={cores:'iwArchiveCoreLevelsV2',legacyCores:'iwArchiveCoresV1',enemies:'iwArchiveEnemiesV1',records:'iwRunRecordsV1'};
const ENEMY_ARCHIVE_DATA={
 scout:{name:'侦察战机',baseHp:25,attack:'直线等离子弹',xp:5,desc:'基础敌军单位，速度较快，装甲薄弱。'},
 heavy:{name:'重甲战机',baseHp:95,attack:'低速高亮重弹',xp:12,desc:'缓慢推进的高耐久单位，射击间隔较长。'},
 suicide:{name:'自爆战机',baseHp:30,attack:'接近后启动2.2秒自爆',xp:8,desc:'进入警戒距离后追踪玩家并启动倒计时。'},
 sniper:{name:'狙击战机',baseHp:44,attack:'瞄准后高速射击',xp:9,desc:'保持中远距离，以精确射击压迫移动空间。'},
 support:{name:'护盾支援机',baseHp:72,attack:'为附近敌军补充护盾',xp:13,desc:'自身攻击能力有限，但会显著提高编队生存力。'},
 barrage:{name:'弹幕载机',baseHp:105,attack:'扇形弹幕',xp:15,desc:'缓慢移动并周期释放多方向弹幕。'},
 raider:{name:'侧翼突袭机',baseHp:36,attack:'高速横穿射击',xp:8,desc:'从左右两侧进入战场，快速穿越交战区域。'},
 carrier:{name:'分裂母机',baseHp:165,attack:'射击并在击毁后释放3架小型机',xp:18,desc:'大型载机，死亡后仍会制造新的威胁。'},
 jammer:{name:'干扰机',baseHp:62,attack:'紫色减速干扰弹',xp:12,desc:'命中后暂时降低玩家移动速度，不影响武器。'},
 boss:{name:'裂隙主宰',baseHp:1100,attack:'多阶段高密度攻击',xp:140,desc:'高危大型单位，拥有更高耐久与时间抗性。'}
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
 const c=canvas.getContext('2d'),w=canvas.width,h=canvas.height;c.clearRect(0,0,w,h);c.save();c.translate(w/2,h/2+3);
 const palette={scout:['#ff4d72','#ffd7e0'],heavy:['#f0a43b','#ffe0a0'],suicide:['#ff304f','#fff1f4'],sniper:['#de6cff','#f3d3ff'],support:['#38d7ff','#c8f8ff'],barrage:['#ff8f45','#ffe4b8'],raider:['#ff557b','#ffd1dd'],carrier:['#c66cff','#f0d4ff'],jammer:['#9b6dff','#e2d8ff'],boss:['#b46cff','#f5ddff']}[type]||['#ff557b','#fff'];
 c.shadowBlur=16;c.shadowColor=palette[0];c.fillStyle=palette[0];c.strokeStyle=palette[1];c.lineWidth=2;
 const poly=pts=>{c.beginPath();c.moveTo(pts[0][0],pts[0][1]);for(const p of pts.slice(1))c.lineTo(p[0],p[1]);c.closePath();c.fill();c.stroke()};
 if(type==='heavy'||type==='carrier'||type==='boss'){
  const scale=type==='boss'?1.15:type==='carrier'?1.0:.88;c.scale(scale,scale);poly([[0,28],[-35,8],[-26,-19],[-10,-12],[0,-31],[10,-12],[26,-19],[35,8]]);
  c.fillStyle='rgba(5,16,30,.9)';c.fillRect(-20,-2,40,13);c.fillStyle=palette[1];c.beginPath();c.arc(0,-4,type==='boss'?9:7,0,Math.PI*2);c.fill();
  if(type==='carrier'){c.strokeRect(-25,12,14,10);c.strokeRect(11,12,14,10)}
 }else if(type==='support'){
  poly([[0,25],[-30,2],[-16,-18],[0,-10],[16,-18],[30,2]]);c.beginPath();c.arc(0,1,27,0,Math.PI*2);c.stroke();c.beginPath();c.arc(0,1,18,0,Math.PI*2);c.stroke();
 }else if(type==='jammer'){
  poly([[0,26],[-25,5],[-12,-16],[0,-8],[12,-16],[25,5]]);for(let i=0;i<3;i++){c.save();c.rotate(i*Math.PI*2/3);c.fillRect(-2,-31,4,14);c.restore()}c.beginPath();c.arc(0,0,19,0,Math.PI*2);c.stroke();
 }else if(type==='barrage'){
  poly([[0,25],[-31,7],[-23,-18],[-8,-10],[0,-27],[8,-10],[23,-18],[31,7]]);c.fillStyle=palette[1];for(let x=-18;x<=18;x+=9){c.beginPath();c.arc(x,8,2.5,0,Math.PI*2);c.fill()}
 }else if(type==='raider'){
  poly([[0,18],[-39,5],[-18,-6],[0,-19],[18,-6],[39,5]]);
 }else{
  poly([[0,27],[-28,6],[-16,-16],[0,-8],[16,-16],[28,6]]);if(type==='suicide'){c.lineWidth=4;c.beginPath();c.arc(0,0,15,0,Math.PI*2);c.stroke();c.fillStyle='#fff';c.beginPath();c.arc(0,0,5,0,Math.PI*2);c.fill()}else{c.fillStyle=palette[1];c.beginPath();c.arc(0,-2,5,0,Math.PI*2);c.fill()}
 }
 c.shadowBlur=10;c.fillStyle='#64e8ff';for(const x of [-10,0,10]){c.beginPath();c.ellipse(x,27,3,8,0,0,Math.PI*2);c.fill()}c.restore();
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
   card.innerHTML=known?`<div class="enemy-archive-layout"><div class="enemy-preview"><canvas width="132" height="96" aria-label="${data.name}模型演示"></canvas><i>MODEL PREVIEW</i></div><div class="enemy-archive-info"><header><b>${data.name}</b><span>已遭遇</span></header><div class="enemy-data-grid"><span>基础耐久<strong>${data.baseHp}</strong></span><span>经验值<strong>${data.xp}</strong></span></div><p>${data.desc}</p><small>攻击方式：${data.attack}</small></div></div>`:`<div class="enemy-archive-layout"><div class="enemy-preview unknown"><b>?</b><i>NO SIGNAL</i></div><div class="enemy-archive-info"><header><b>未知敌军</b><span>UNSEEN</span></header><p>首次遭遇后自动记录模型与完整资料。</p></div></div>`;
   content.appendChild(card);if(known)drawEnemyArchivePreview(card.querySelector('canvas'),id)});
 }else{
  title.textContent='同步记录';code.textContent='RUN HISTORY';const records=getRunRecords();
  if(!records.length){content.innerHTML='<div class="archive-empty">尚无完整同步记录。完成一次行动后将在此保存。</div>';return}
  records.forEach((r,i)=>{const card=document.createElement('article');card.className='archive-entry record-entry';card.innerHTML=`<header><b>记录 #${String(records.length-i).padStart(3,'0')}</b><span>${r.date||''}</span></header><div class="record-grid"><span>生存时间<strong>${formatRunTime(r.time)}</strong></span><span>分数<strong>${r.score}</strong></span><span>等级<strong>${r.level}</strong></span><span>危险等级<strong>${r.threat}</strong></span></div><small>${r.reason||'行动结束'} · 驾驶员 #${String(r.pilot||1).padStart(6,'0')}</small>`;content.appendChild(card)});
 }
}

const uiPrefs={
 shake:localStorage.getItem('iwShake')!=='off',
 scan:localStorage.getItem('iwScan')!=='off',
 sfx:localStorage.getItem('iwSfx')!=='off',
 music:localStorage.getItem('iwMusic')!=='off'
};
function refreshPauseToggles(){
 const shakeToggle=$('#shakeToggle'),scanToggle=$('#scanToggle'),sfxToggle=$('#sfxToggle'),musicToggle=$('#musicToggle');
 const shakeSetting=$('#shakeSetting'),sfxSetting=$('#sfxSetting'),musicSetting=$('#musicSetting');
 const sfxVolumeSetting=$('#sfxVolumeSetting'),musicVolumeSetting=$('#musicVolumeSetting');
 const pauseSfxVolumeSetting=$('#pauseSfxVolumeSetting'),pauseMusicVolumeSetting=$('#pauseMusicVolumeSetting');
 const sfxVolumeValue=$('#sfxVolumeValue'),musicVolumeValue=$('#musicVolumeValue');
 const pauseSfxVolumeValue=$('#pauseSfxVolumeValue'),pauseMusicVolumeValue=$('#pauseMusicVolumeValue');
 if(shakeSetting)shakeSetting.checked=uiPrefs.shake;
 if(sfxSetting)sfxSetting.checked=uiPrefs.sfx;
 if(musicSetting)musicSetting.checked=uiPrefs.music;
 if(sfxVolumeSetting)sfxVolumeSetting.value=String(Math.round(audioSystem.prefs.sfxVolume*100));
 if(musicVolumeSetting)musicVolumeSetting.value=String(Math.round(audioSystem.prefs.musicVolume*100));
 if(pauseSfxVolumeSetting)pauseSfxVolumeSetting.value=String(Math.round(audioSystem.prefs.sfxVolume*100));
 if(pauseMusicVolumeSetting)pauseMusicVolumeSetting.value=String(Math.round(audioSystem.prefs.musicVolume*100));
 if(sfxVolumeValue)sfxVolumeValue.textContent=Math.round(audioSystem.prefs.sfxVolume*100)+'%';
 if(musicVolumeValue)musicVolumeValue.textContent=Math.round(audioSystem.prefs.musicVolume*100)+'%';
 if(pauseSfxVolumeValue)pauseSfxVolumeValue.textContent=Math.round(audioSystem.prefs.sfxVolume*100)+'%';
 if(pauseMusicVolumeValue)pauseMusicVolumeValue.textContent=Math.round(audioSystem.prefs.musicVolume*100)+'%';
 document.body.classList.toggle('no-scanlines',!uiPrefs.scan);
 const updateToggle=(button,enabled)=>{if(!button)return;button.classList.toggle('off',!enabled);const label=button.querySelector('small');if(label)label.textContent='当前：'+(enabled?'开启':'关闭')};
 updateToggle(shakeToggle,uiPrefs.shake);updateToggle(scanToggle,uiPrefs.scan);updateToggle(sfxToggle,uiPrefs.sfx);updateToggle(musicToggle,uiPrefs.music);
 if(typeof audioSystem!=='undefined'){audioSystem.prefs.sfx=uiPrefs.sfx;audioSystem.prefs.music=uiPrefs.music;audioSystem.syncState();}
}
function loop(t){if(!running)return;const dt=Math.min(.028,(t-last)/1000||0);last=t;if(!paused||dying)update(dt);draw();requestAnimationFrame(loop)}
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
 audioSystem?.play('upgrade');toast(`${meta.icon} ${result.definition.shortName}源核 ${['Ⅰ','Ⅱ','Ⅲ'][result.level-1]}`);
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
  el.innerHTML=`<em>${i+1}</em><b>${meta.icon} ${definition.shortName}源核 ${['Ⅰ','Ⅱ','Ⅲ'][choice.nextLevel-1]}</b><p>${nextData.description}</p><span>${meta.name} · ${nextData.name}</span>`;
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
 pilotId++;localStorage.setItem('infinityWingsPilotIdV2',String(pilotId));$('#archiveCloneCount').textContent='当前驾驶员编号：#'+String(pilotId).padStart(6,'0');
 const main=$('#deathMain'),sub=$('#deathSub'),stats=$('#deathStats'),btn=$('#syncRestartButton');
 main.textContent='';main.classList.remove('visible');sub.textContent='';stats.classList.add('hidden');btn.classList.add('hidden');
 setTimeout(()=>{main.textContent='驾驶员生命信号消失';main.classList.add('visible')},350);
 const lines=['正在搜索意识备份……','发现可用备份。','开始同步记忆……','同步完成。','新驾驶员编号：#'+String(pilotId).padStart(6,'0')];let i=0;
 setTimeout(()=>{const timer=setInterval(()=>{sub.innerHTML+=`<div>${lines[i]}</div>`;i++;if(i===lines.length){clearInterval(timer);stats.innerHTML=`本次行动分数：<b>${score}</b><br>生存时间：<b>${formatRunTime(elapsed)}</b><br>到达等级：<b>${level}</b><br>最高危险等级：<b>${THREAT_ROMAN[threatLevel()]}</b>`;stats.classList.remove('hidden');btn.classList.remove('hidden')}},850)},1150)
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
$('#shakeToggle').onclick=()=>{uiPrefs.shake=!uiPrefs.shake;localStorage.setItem('iwShake',uiPrefs.shake?'on':'off');refreshPauseToggles()};
$('#scanToggle').onclick=()=>{uiPrefs.scan=!uiPrefs.scan;localStorage.setItem('iwScan',uiPrefs.scan?'on':'off');refreshPauseToggles()};
$('#sfxToggle')?.addEventListener('click',()=>{uiPrefs.sfx=!uiPrefs.sfx;audioSystem.setEnabled('sfx',uiPrefs.sfx);refreshPauseToggles()});
$('#musicToggle')?.addEventListener('click',()=>{uiPrefs.music=!uiPrefs.music;audioSystem.setEnabled('music',uiPrefs.music);refreshPauseToggles()});
$('#sfxSetting')?.addEventListener('change',e=>{uiPrefs.sfx=e.target.checked;audioSystem.setEnabled('sfx',uiPrefs.sfx);refreshPauseToggles()});
$('#musicSetting')?.addEventListener('change',e=>{uiPrefs.music=e.target.checked;audioSystem.setEnabled('music',uiPrefs.music);refreshPauseToggles()});
$('#sfxVolumeSetting')?.addEventListener('input',e=>{const value=Math.max(0,Math.min(100,Number(e.target.value)||0));audioSystem.setVolume('sfx',value/100);if(sfxVolumeValue)sfxVolumeValue.textContent=Math.round(value)+'%'});
$('#musicVolumeSetting')?.addEventListener('input',e=>{const value=Math.max(0,Math.min(100,Number(e.target.value)||0));audioSystem.setVolume('music',value/100);if(musicVolumeValue)musicVolumeValue.textContent=Math.round(value)+'%'});
$('#pauseSfxVolumeSetting')?.addEventListener('input',e=>{const value=Math.max(0,Math.min(100,Number(e.target.value)||0));audioSystem.setVolume('sfx',value/100);refreshPauseToggles()});
$('#pauseMusicVolumeSetting')?.addEventListener('input',e=>{const value=Math.max(0,Math.min(100,Number(e.target.value)||0));audioSystem.setVolume('music',value/100);refreshPauseToggles()});
refreshPauseToggles();
document.addEventListener('click',e=>{if(e.target.closest('button'))audioSystem?.play('ui')});
$('#startButton').onclick=startStory;const skipStoryButton=$('#skipStory');const skipStoryNow=e=>{if(e){e.preventDefault();e.stopPropagation()}beginGame()};skipStoryButton.onclick=skipStoryNow;skipStoryButton.addEventListener('pointerup',skipStoryNow);skipStoryButton.addEventListener('touchend',skipStoryNow,{passive:false});$('#storyRoll').addEventListener('animationend',beginGame);$('#syncRestartButton').onclick=beginGame;$('#bombButton').onclick=pulse;
$('#archiveButton').onclick=()=>{showScreen(UI.archive);$('#archiveCloneCount').textContent='当前驾驶员编号：#'+String(pilotId).padStart(6,'0');renderArchiveHome()};document.querySelectorAll('[data-archive-view]').forEach(button=>button.onclick=()=>renderArchiveView(button.dataset.archiveView));$('#archiveBack').onclick=renderArchiveHome;$('#settingsButton').onclick=()=>showScreen(UI.settings);
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
const joy=$('#joystick'),knob=$('#knob');function moveJoy(e){const r=joy.getBoundingClientRect(),p=e.touches?e.touches[0]:e,x=p.clientX-r.left-r.width/2,y=p.clientY-r.top-r.height/2,m=Math.min(42,Math.hypot(x,y)),a=Math.atan2(y,x);joyX=Math.cos(a)*m/42;joyY=Math.sin(a)*m/42;knob.style.transform=`translate(${Math.cos(a)*m}px,${Math.sin(a)*m}px)`}function endJoy(){joyX=joyY=0;knob.style.transform='translate(0,0)'}joy.addEventListener('touchstart',moveJoy,{passive:false});joy.addEventListener('touchmove',e=>{e.preventDefault();moveJoy(e)},{passive:false});joy.addEventListener('touchend',endJoy);joy.addEventListener('pointerdown',e=>{joy.setPointerCapture(e.pointerId);moveJoy(e)});joy.addEventListener('pointermove',e=>{if(e.buttons)moveJoy(e)});joy.addEventListener('pointerup',endJoy);
const portraitLock=$('#portraitLock');
const touchDevice=('ontouchstart' in window)||(navigator.maxTouchPoints>0);
const phoneDevice=touchDevice&&Math.min(screen.width||innerWidth,screen.height||innerHeight)<=600;
if(touchDevice)document.body.classList.add('touch-device');
function syncPortraitLock(){
 const blocked=phoneDevice&&innerWidth>innerHeight;
 portraitLock?.classList.toggle('hidden',!blocked);
 if(blocked){joyX=0;joyY=0;if(running&&!paused){paused=true;document.body.dataset.orientationPaused='1'}}
 else if(document.body.dataset.orientationPaused==='1'){delete document.body.dataset.orientationPaused;if(running&&state==='game'){paused=false;last=performance.now()}}
}
addEventListener('resize',syncPortraitLock,{passive:true});
addEventListener('orientationchange',()=>setTimeout(syncPortraitLock,120),{passive:true});
addEventListener('visibilitychange',()=>{if(document.hidden&&running&&!paused){openPauseMenu()}});
['gesturestart','gesturechange','gestureend'].forEach(type=>document.addEventListener(type,e=>e.preventDefault(),{passive:false}));
document.addEventListener('touchmove',e=>{if(e.target.closest('#gameShell'))e.preventDefault()},{passive:false});
syncPortraitLock();
boot();draw();
