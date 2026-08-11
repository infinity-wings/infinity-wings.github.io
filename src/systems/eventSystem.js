'use strict';

const METEOR_IMAGE_ASSETS=Object.freeze({
 small:Object.assign(new Image(),{src:'assets/meteors/meteor-small-v1.png'}),
 medium:Object.assign(new Image(),{src:'assets/meteors/meteor-medium-v1.png'}),
 large:Object.assign(new Image(),{src:'assets/meteors/meteor-large-v1.png'})
});
function meteorSpriteFor(f){return METEOR_IMAGE_ASSETS[f.r<24?'small':f.r<31?'medium':'large']}
function meteorSpriteReady(f){const image=meteorSpriteFor(f);return Boolean(image&&image.complete&&image.naturalWidth>0)}
function drawTexturedMeteor(f){
 const image=meteorSpriteFor(f);
 ctx.save();ctx.globalAlpha=Math.min(1,f.life);ctx.translate(f.x,f.y);ctx.rotate(f.spin||0);
 ctx.globalCompositeOperation='source-over';ctx.shadowBlur=f.r*.42;ctx.shadowColor='rgba(255,55,28,.55)';
 const drawSize=f.r*2.75;ctx.drawImage(image,-drawSize/2,-drawSize/2,drawSize,drawSize);ctx.restore();
}
function drawMeteorWarningOverlay(f){
 const remaining=Math.max(0,f.life),progress=1-Math.min(1,remaining/f.max),size=f.r<24?'小型':f.r<31?'中型':'大型';
 const entryX=Math.max(34,Math.min(W-34,f.x+f.vx*((0-f.y)/Math.max(1,f.vy)))),bandW=Math.max(66,f.r*3.1),pulse=.55+.45*Math.abs(Math.sin(elapsed*11+f.seed));
 ctx.save();ctx.globalCompositeOperation='source-over';
 const glow=ctx.createLinearGradient(entryX-bandW,0,entryX+bandW,0);glow.addColorStop(0,'rgba(255,30,44,0)');glow.addColorStop(.5,`rgba(255,61,45,${.18+.2*pulse})`);glow.addColorStop(1,'rgba(255,30,44,0)');ctx.fillStyle=glow;ctx.fillRect(entryX-bandW,0,bandW*2,44);
 ctx.strokeStyle=`rgba(255,${Math.round(92+80*progress)},68,${.62+.3*pulse})`;ctx.shadowBlur=14;ctx.shadowColor='#ff263f';ctx.lineWidth=2;ctx.beginPath();ctx.arc(entryX,0,28+f.r*.5,0,Math.PI);ctx.stroke();
 const arrowY=23+progress*8;ctx.fillStyle='#ff6656';ctx.beginPath();ctx.moveTo(entryX-9,arrowY);ctx.lineTo(entryX+9,arrowY);ctx.lineTo(entryX,arrowY+10);ctx.closePath();ctx.fill();
 const panelW=142,panelH=40,panelX=Math.max(8,Math.min(W-panelW-8,entryX-panelW/2)),panelY=48;
 ctx.shadowBlur=12;ctx.shadowColor='rgba(255,27,49,.34)';ctx.fillStyle='rgba(10,5,13,.9)';ctx.fillRect(panelX,panelY,panelW,panelH);ctx.shadowBlur=0;ctx.strokeStyle='rgba(255,73,69,.58)';ctx.lineWidth=1;ctx.strokeRect(panelX+.5,panelY+.5,panelW-1,panelH-1);
 ctx.textAlign='center';ctx.fillStyle='#ff7a66';ctx.font='700 9px system-ui';ctx.fillText(`${size}陨石接近`,panelX+panelW/2,panelY+14);ctx.fillStyle='#fff5e8';ctx.font='800 15px ui-monospace,monospace';ctx.fillText(`${remaining.toFixed(1)}s`,panelX+panelW/2,panelY+32);ctx.restore();
}

const BATTLE_EVENT_DEFINITIONS=Object.freeze([
 {id:'supply_tide',name:'补给潮汐',category:'reward',label:'奖励事件',duration:20,desc:'敌军攻势暂缓，战场析出经验与修复补给。'},
 {id:'core_meteor',name:'源核陨星',category:'reward',label:'奖励事件',duration:35,desc:'击破高能源核陨星，获得一次直升Ⅲ级或觉醒机会。'},
 {id:'mirror_invasion',name:'镜像入侵',category:'danger',label:'危险事件',duration:26,desc:'事件期间，所有正常刷新的敌军都会以镜像形态进入战场。'},
 {id:'hunt_reversal',name:'赏金猎杀',category:'danger',label:'危险事件',duration:34,desc:'限时击毁小型Boss级赏金目标；目标拥有高耐久与强化弹幕。'},
 {id:'fire_support',name:'火力支援',category:'rare',label:'稀有事件',duration:18,desc:'两架友军进入战区，在底部左右巡航并持续射击，为驾驶员提供火力掩护。'},
 {id:'emp_storm',name:'电磁风暴',category:'environment',label:'环境异常',duration:25,desc:'高亮红色雷击走廊提前预警，落雷同时威胁敌我。'},
 {id:'gravity_anomaly',name:'引力异常',category:'environment',label:'环境异常',duration:25,desc:'引力核心牵引敌弹、掉落物与小型敌军。'},
 {id:'meteor_rain',name:'陨石雨',category:'environment',label:'环境异常',duration:30,desc:'高速陨石穿越战区，可同时伤害玩家与敌军。'}
]);
const BATTLE_EVENT_BY_ID=Object.freeze(Object.fromEntries(BATTLE_EVENT_DEFINITIONS.map(e=>[e.id,e])));

class BattleEventSystem{
 constructor(){this.reset()}
 reset(){this.deck=[];this.active=null;this.nextAt=135+Math.random()*35;this.warning=null;this.enabled=true;this.spawnCd=0;this.fx=[];this.gravity=null;this.huntTarget=null;this.supportUnits=[];this.lastEventAt=-999;this.buildDeck();this.hideHud()}
 buildDeck(){const rewards=this.pick(BATTLE_EVENT_DEFINITIONS.filter(e=>e.category==='reward'),1);const dangers=this.pick(BATTLE_EVENT_DEFINITIONS.filter(e=>e.category==='danger'),1);const env=this.pick(BATTLE_EVENT_DEFINITIONS.filter(e=>e.category==='environment'),1);const used=new Set([...rewards,...dangers,...env].map(e=>e.id));let rest=BATTLE_EVENT_DEFINITIONS.filter(e=>!used.has(e.id));if(Math.random()>.35)rest=rest.filter(e=>e.category!=='rare').concat(rest.filter(e=>e.category==='rare'));const fourth=this.pick(rest,1);this.deck=this.shuffle([...rewards,...dangers,...env,...fourth]).map(e=>e.id)}
 pick(arr,n){return this.shuffle([...arr]).slice(0,n)}
 shuffle(arr){for(let i=arr.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[arr[i],arr[j]]=[arr[j],arr[i]]}return arr}
 getHud(){let root=document.getElementById('battleEventHud');if(!root){root=document.createElement('div');root.id='battleEventHud';root.className='battle-event-hud hidden';document.getElementById('app')?.appendChild(root)}return root}
 hideHud(){document.getElementById('battleEventHud')?.classList.add('hidden')}
 showHud(def,time,warning=false){const root=this.getHud();root.className=`battle-event-hud ${def.category} ${warning?'warning':''}`;root.innerHTML=`<small>${warning?'异常预警':def.label}</small><b>${def.name}</b><span>${warning?'即将进入战区':Math.max(0,Math.ceil(time))+'s'}</span>`}
 canStart(){return running&&!paused&&!dying&&state==='game'&&!enemies.some(e=>e.boss)&&!awakeningSystem.pending}
 update(dt){if(!this.enabled||!running||dying)return;this.updateFx(dt);const bossActive=enemies.some(e=>e.boss);if(bossActive&&(this.warning||this.active)){this.cancelForBoss();return}if(this.warning){this.warning.time-=dt;this.showHud(this.warning.def,this.warning.time,true);if(this.warning.time<=0){const id=this.warning.def.id;this.warning=null;this.start(id)}return}if(!this.active){if(this.deck.length&&elapsed>=this.nextAt&&this.canStart()){this.warning={def:BATTLE_EVENT_BY_ID[this.deck.shift()],time:5};this.showHud(this.warning.def,5,true)}return}this.active.time-=dt;this.showHud(this.active.def,this.active.time,false);this.updateActive(dt);if(this.active&&this.active.time<=0)this.end(false)}

 cancelForBoss(){
  if(this.warning){this.warning=null;this.hideHud()}
  if(!this.active)return;
  const id=this.active.def.id;
  if(id==='core_meteor')for(let i=enemies.length-1;i>=0;i--)if(enemies[i].eventMeteor)enemies.splice(i,1);
  if(id==='mirror_invasion')for(let i=enemies.length-1;i>=0;i--)if(enemies[i].eventMirror)enemies.splice(i,1);
  if(id==='hunt_reversal'&&this.huntTarget){const i=enemies.indexOf(this.huntTarget);if(i>=0)enemies.splice(i,1)}
  this.fx=[];this.gravity=null;this.supportUnits=[];this.active=null;this.huntTarget=null;this.hideHud();this.nextAt=elapsed+28;
  toast('Boss 接近 · 随机事件已中止');
 }
 startFireSupport(){
  // 两架支援机使用完全相同的安全高度，始终停留在 HUD 上方。
  const baseY=Math.max(120,Math.min(H-SAFE_BOTTOM-105,H*.69));
  this.supportUnits=[
   {side:-1,x:W*.24,y:H+52,targetY:baseY,phase:0,fireCd:.1,alpha:0,bank:0},
   {side:1,x:W*.76,y:H+52,targetY:baseY,phase:Math.PI,fireCd:.22,alpha:0,bank:0}
  ];
  toast('友军编队抵达 · 火力支援开始');
 }
 updateFireSupport(dt){
  const units=this.supportUnits||[];
  const active=this.active?.def.id==='fire_support';
  for(const unit of units){
   const remaining=this.active?.time??0;unit.alpha=remaining<1.2?Math.max(0,remaining/1.2):Math.min(1,unit.alpha+dt*2.7);
   unit.y+=(unit.targetY-unit.y)*Math.min(1,dt*5.4);
   const center=unit.side<0?W*.27:W*.73;
   const range=Math.min(W*.19,92);
   const targetX=center+Math.sin(elapsed*1.65+unit.phase)*range;
   const dx=targetX-unit.x;
   unit.x+=dx*Math.min(1,dt*5.2);
   unit.bank=Math.max(-.45,Math.min(.45,dx/85));
   unit.fireCd-=dt;
   if(active&&unit.fireCd<=0){
    unit.fireCd=.115+Math.random()*.035;
    const damage=Math.max(8,player.damage*.38);
    bullets.push({x:unit.x-7,y:unit.y-30,vx:-10,vy:-720,r:2.8,d:damage,life:2.3,source:'fireSupport'});
    bullets.push({x:unit.x+7,y:unit.y-30,vx:10,vy:-720,r:2.8,d:damage,life:2.3,source:'fireSupport'});
   }
  }
 }
 start(id,forced=false){const def=BATTLE_EVENT_BY_ID[id];if(!def||enemies.some(e=>e.boss))return false;if(this.active)this.end(true);this.active={def,time:def.duration,forced,success:false};this.spawnCd=0;this.lastEventAt=elapsed;toast(`${def.label} · ${def.name}`);if(id==='core_meteor')this.spawnCoreMeteor();if(id==='hunt_reversal')this.spawnHuntTarget();if(id==='gravity_anomaly')this.gravity={x:W*(.28+Math.random()*.44),y:H*(.25+Math.random()*.3),life:def.duration};if(id==='fire_support')this.startFireSupport();return true}
 end(cancelled=false){if(!this.active)return;const id=this.active.def.id;if(id==='hunt_reversal'&&this.huntTarget&&this.huntTarget.hp>0&&!cancelled){this.huntTarget.enraged=true;this.huntTarget.bountyPhase=2;this.huntTarget.shoot=Math.min(this.huntTarget.shoot,520);this.huntTarget.hp=Math.min(this.huntTarget.max,this.huntTarget.hp+this.huntTarget.max*.28);toast('赏金猎杀失败 · 目标火力强化')}if(id==='gravity_anomaly')this.gravity=null;if(id==='meteor_rain')this.fx=this.fx.filter(f=>!['meteor','meteorWarning'].includes(f.type));if(id==='fire_support')this.supportUnits=[];this.active=null;this.huntTarget=null;this.hideHud();this.nextAt=elapsed+95+Math.random()*45}
 decorateSpawnedEnemy(enemy){if(this.active?.def.id==='mirror_invasion'&&enemy&&!enemy.boss&&!enemy.eventMeteor){enemy.eventMirror=true;enemy.mirrorSpawn=true;enemy.mirrorSeed=Math.random()*Math.PI*2;enemy.hp=Math.max(1,Math.round(enemy.hp*.88));enemy.max=enemy.hp}return enemy}
 triggerRandom(){const pool=BATTLE_EVENT_DEFINITIONS.filter(e=>!this.active||e.id!==this.active.def.id);return this.start(pool[Math.floor(Math.random()*pool.length)].id,true)}
 spawnCoreMeteor(){enemies.push({type:'eventMeteor',eventMeteor:true,x:W/2,y:115,r:40,hp:720,max:720,v:12,shoot:999999,age:0,dir:1})}
 spawnHuntTarget(){const candidates=['heavy','barrage','carrier'];const e=makeEnemy(candidates[Math.floor(Math.random()*candidates.length)]);e.x=W/2;e.y=92;e.huntTarget=true;e.bountyPhase=1;e.bountyPattern=0;e.bountyVolley=0;e.r=Math.round((e.r||22)*1.28);e.hp=Math.max(680,Math.round(e.hp*5.4));e.max=e.hp;e.v=16;e.shoot=720;e.dir=Math.random()<.5?-1:1;this.huntTarget=e;enemies.push(e);toast('赏金目标进入战区 · 小型Boss级威胁')}
 updateActive(dt){const id=this.active.def.id;this.spawnCd-=dt;if(id==='supply_tide'&&this.spawnCd<=0){this.spawnCd=.72;const salvage=awakeningSystem.get('repair')?.id==='repair_salvage';const type=salvage||Math.random()<.78?'eventXp':'repair';pickups.push({type,x:35+Math.random()*(W-70),y:-15,vx:(Math.random()-.5)*22,vy:type==='repair'?105:58,life:9,r:type==='eventXp'?6:8,heal:14,xp:18})}
 if(id==='emp_storm'&&this.spawnCd<=0){this.spawnCd=1.55+Math.random()*1.25;const x=45+Math.random()*(W-90),warningTime=1.18;this.fx.push({type:'lightningWarning',x,life:warningTime,max:warningTime,seed:Math.random()*99});setTimeout(()=>{if(!this.active||this.active.def.id!=='emp_storm'||enemies.some(e=>e.boss))return;this.fx.push({type:'lightningStrike',x,life:.38,max:.38});for(const e of [...enemies])if(Math.abs(e.x-x)<42&&damageEnemy(e,70)){const idx=enemies.indexOf(e);if(idx>=0)enemies.splice(idx,1)}if(Math.abs(player.x-x)<20+playerCombatRadius())damagePlayer(13)},warningTime*1000)}
 if(id==='meteor_rain'&&this.spawnCd<=0){this.spawnCd=2.3+Math.random()*1.4;const startX=55+Math.random()*(W-110),angle=(-.24+Math.random()*.48),speed=520+Math.random()*130,warningTime=1.65;const vx=Math.sin(angle)*speed,vy=Math.cos(angle)*speed;const sizeRoll=Math.random(),radius=sizeRoll<.48?18+Math.random()*5:sizeRoll<.84?24+Math.random()*6:31+Math.random()*7;this.fx.push({type:'meteorWarning',x:startX,y:-90,vx,vy,r:radius,life:warningTime,max:warningTime,seed:Math.random()*999});toast('陨石即将到来')}
 if(id==='gravity_anomaly'&&this.gravity){const g=this.gravity;for(const b of enemyBullets){const dx=g.x-b.x,dy=g.y-b.y,d=Math.hypot(dx,dy)||1;b.vx+=dx/d*105*dt;b.vy+=dy/d*105*dt}for(const p of pickups){const dx=g.x-p.x,dy=g.y-p.y,d=Math.hypot(dx,dy)||1;p.vx=(p.vx||0)+dx/d*75*dt;p.vy=(p.vy||0)+dy/d*75*dt}for(const e of enemies)if(!e.boss&&!e.eventMeteor){const dx=g.x-e.x,dy=g.y-e.y,d=Math.hypot(dx,dy)||1;e.x+=dx/d*18*dt;e.y+=dy/d*18*dt}}
 if(id==='fire_support')this.updateFireSupport(dt);
 }
 updateFx(dt){for(let i=this.fx.length-1;i>=0;i--){const f=this.fx[i];f.life-=dt;if(f.type==='meteorWarning'&&f.life<=0){this.fx.push({type:'meteor',x:f.x,y:f.y,vx:f.vx,vy:f.vy,r:f.r,life:5.5,spin:0,spinSpeed:(Math.random()>.5?1:-1)*(1.2+Math.random()*1.8),seed:f.seed,hit:new WeakSet()});this.fx.splice(i,1);continue}if(f.type==='meteor'){f.x+=f.vx*dt;f.y+=f.vy*dt;f.spin=(f.spin||0)+(f.spinSpeed||1.5)*dt;for(const e of [...enemies]){if(!e||f.hit?.has(e))continue;if(Math.hypot(e.x-f.x,e.y-f.y)<(e.r||18)+f.r){f.hit?.add(e);if(e.boss){damageEnemy(e,Math.max(260,(e.max||e.hp||100)*.08))}else{e.hp=0;const idx=enemies.indexOf(e);if(idx>=0){battleEventSystem.onEnemyKilled(e);explode(e.x,e.y,e.type==='carrier'?30:18);enemies.splice(idx,1)}}}}if(!f.playerHit&&Math.hypot(player.x-f.x,player.y-f.y)<playerCombatRadius()+f.r){f.playerHit=true;damagePlayer(68)}if(f.y>H+180||f.x<-240||f.x>W+240)f.life=0}if(f.life<=0)this.fx.splice(i,1)}}
 drawMeteorTextures(){for(const f of this.fx)if(f.type==='meteor'&&meteorSpriteReady(f))drawTexturedMeteor(f)}
 drawMeteorWarnings(){for(const f of this.fx)if(f.type==='meteorWarning')drawMeteorWarningOverlay(f)}
 onEnemyKilled(e){if(e.eventMeteor){this.active&&(this.active.success=true);this.end(true);setTimeout(()=>awakeningSystem.openMeteorReward(),320);return}if(e.huntTarget){this.active&&(this.active.success=true);xp+=Math.round(nextXp*.7);addBarrierCharge(32);toast('赏金猎杀完成 · 获得高额同步能量');this.end(true)}}
 draw(){ctx.save();ctx.globalCompositeOperation='lighter';if(this.gravity){const g=this.gravity,p=1+Math.sin(elapsed*4)*.08;ctx.strokeStyle='rgba(177,105,255,.75)';ctx.shadowBlur=28;ctx.shadowColor='#8c53ff';ctx.lineWidth=3;ctx.beginPath();ctx.arc(g.x,g.y,34*p,0,Math.PI*2);ctx.stroke();ctx.strokeStyle='rgba(92,224,255,.48)';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(g.x,g.y,57/p,elapsed,-elapsed+Math.PI*1.4);ctx.stroke()}for(const f of this.fx){if(f.type==='lightningWarning'){const q=f.life/f.max,p=1-q,flash=.45+.55*Math.abs(Math.sin(elapsed*20+f.seed));ctx.save();ctx.globalAlpha=.2+.45*flash;const band=ctx.createLinearGradient(f.x-55,0,f.x+55,0);band.addColorStop(0,'rgba(255,20,40,0)');band.addColorStop(.5,'rgba(255,30,45,.44)');band.addColorStop(1,'rgba(255,20,40,0)');ctx.fillStyle=band;ctx.fillRect(f.x-58,0,116,H);ctx.globalAlpha=.75+.25*flash;ctx.strokeStyle='#ff3048';ctx.shadowBlur=18;ctx.shadowColor='#ff1738';ctx.lineWidth=3.5;ctx.setLineDash([14,9]);ctx.beginPath();ctx.moveTo(f.x-38,0);ctx.lineTo(f.x-38,H);ctx.moveTo(f.x+38,0);ctx.lineTo(f.x+38,H);ctx.stroke();ctx.setLineDash([]);for(const yy of [H*.22,H*.5,H*.78]){ctx.lineWidth=4;ctx.beginPath();ctx.arc(f.x,yy,54-34*p,0,Math.PI*2);ctx.stroke();ctx.lineWidth=2;ctx.beginPath();ctx.arc(f.x,yy,18+30*p,0,Math.PI*2);ctx.stroke()}ctx.fillStyle='#fff2f4';ctx.font='bold 18px system-ui';ctx.textAlign='center';ctx.fillText('雷击预警',f.x,Math.max(42,H*.12));ctx.restore()}if(f.type==='lightningStrike'){ctx.globalAlpha=f.life/f.max;ctx.strokeStyle='#e9ffff';ctx.shadowBlur=24;ctx.shadowColor='#61dcff';ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(f.x,0);ctx.lineTo(f.x+Math.sin(elapsed*60)*8,H);ctx.stroke()}if(f.type==='meteor'){ctx.globalAlpha=Math.min(1,f.life);ctx.save();ctx.translate(f.x,f.y);const flight=Math.atan2(f.vy,f.vx)-Math.PI/2;ctx.rotate(flight);ctx.shadowBlur=24;ctx.shadowColor='#ff2838';const tailLength=f.r*(4.4+Math.sin(elapsed*10+f.seed)*.35);const tail=ctx.createLinearGradient(0,-f.r*.1,0,-tailLength);tail.addColorStop(0,'rgba(255,245,205,.92)');tail.addColorStop(.16,'rgba(255,74,46,.9)');tail.addColorStop(.52,'rgba(218,14,35,.58)');tail.addColorStop(1,'rgba(90,0,18,0)');ctx.fillStyle=tail;ctx.beginPath();ctx.moveTo(-f.r*.42,-f.r*.25);ctx.quadraticCurveTo(-f.r*.78,-tailLength*.45,0,-tailLength);ctx.quadraticCurveTo(f.r*.78,-tailLength*.45,f.r*.42,-f.r*.25);ctx.closePath();ctx.fill();if(!meteorSpriteReady(f)){ctx.rotate((f.spin||0)-flight);const rock=ctx.createRadialGradient(-f.r*.28,-f.r*.35,1,0,0,f.r);rock.addColorStop(0,'#fff0b8');rock.addColorStop(.17,'#ff704d');rock.addColorStop(.52,'#d7192e');rock.addColorStop(1,'#39050d');ctx.fillStyle=rock;ctx.beginPath();for(let i=0;i<10;i++){const a=i*Math.PI*2/10;const wobble=.72+(((i*43+Math.floor(f.seed))%13)/38);const rr=f.r*wobble;i?ctx.lineTo(Math.cos(a)*rr,Math.sin(a)*rr):ctx.moveTo(Math.cos(a)*rr,Math.sin(a)*rr)}ctx.closePath();ctx.fill();ctx.strokeStyle='rgba(255,122,88,.88)';ctx.lineWidth=1.6;ctx.stroke();ctx.fillStyle='rgba(72,0,10,.5)';for(let i=0;i<3;i++){const a=f.seed+i*2.1;ctx.beginPath();ctx.arc(Math.cos(a)*f.r*.36,Math.sin(a)*f.r*.32,f.r*(.09+i*.018),0,Math.PI*2);ctx.fill()}}ctx.restore()}}if(this.huntTarget&&enemies.includes(this.huntTarget)){const e=this.huntTarget,pulse=.5+.5*Math.sin(elapsed*7);ctx.save();ctx.translate(e.x,e.y);ctx.strokeStyle=e.enraged?'#ffb13b':'#ff355c';ctx.shadowBlur=18;ctx.shadowColor=ctx.strokeStyle;ctx.lineWidth=2.5;ctx.rotate(elapsed*.7);const rr=(e.r||24)+15+pulse*4;for(let q=0;q<4;q++){ctx.rotate(Math.PI/2);ctx.beginPath();ctx.moveTo(rr-10,0);ctx.lineTo(rr+7,0);ctx.stroke()}ctx.rotate(-elapsed*.7);ctx.font='bold 12px system-ui';ctx.textAlign='center';ctx.fillStyle='#fff4f6';ctx.fillText(e.enraged?'暴走悬赏目标':'悬赏目标',0,-rr-10);ctx.restore();}for(const f of this.fx){if(f.type==='legacyMeteorWarning'){const q=Math.max(0,f.life/f.max),len=H+180,mag=Math.hypot(f.vx,f.vy)||1,dx=f.vx/mag,dy=f.vy/mag,px=-dy,py=dx,w=Math.max(13,f.r*.72),flash=.45+.55*Math.abs(Math.sin(elapsed*16+f.seed));ctx.save();ctx.globalAlpha=.42+.35*flash;ctx.strokeStyle='#ff263f';ctx.shadowBlur=22;ctx.shadowColor='#ff102f';ctx.lineWidth=w*2;ctx.setLineDash([20,14]);ctx.beginPath();ctx.moveTo(f.x-px*w,f.y-py*w);ctx.lineTo(f.x+dx*len-px*w,f.y+dy*len-py*w);ctx.moveTo(f.x+px*w,f.y+py*w);ctx.lineTo(f.x+dx*len+px*w,f.y+dy*len+py*w);ctx.stroke();ctx.setLineDash([]);ctx.fillStyle='#fff1f3';ctx.font='bold 19px system-ui';ctx.textAlign='center';ctx.fillText('陨石即将到来',W/2,H*.25);ctx.restore();}}if(this.supportUnits?.length&&this.active?.def.id==='fire_support'){
 for(const unit of this.supportUnits){
  ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=unit.alpha;
  if(typeof drawShip==='function')drawShip(unit.x,unit.y,'#75dfff',{alpha:unit.alpha,tilt:unit.bank,pitch:-.03,thrust:.8,visualY:0,vx:unit.bank*150,vy:0,speed:320,recoil:0});
  else{ctx.translate(unit.x,unit.y);ctx.fillStyle='#75dfff';ctx.beginPath();ctx.moveTo(0,-24);ctx.lineTo(-18,20);ctx.lineTo(0,12);ctx.lineTo(18,20);ctx.closePath();ctx.fill()}
  ctx.strokeStyle='rgba(117,223,255,.6)';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(unit.x,unit.y,30+Math.sin(elapsed*5+unit.phase)*3,0,Math.PI*2);ctx.stroke();ctx.restore();
 }
}ctx.restore()}
}
const battleEventSystem=new BattleEventSystem();window.IWBattleEventSystem=battleEventSystem;
