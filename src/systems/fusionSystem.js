'use strict';

/** Alpha 2.9 fusion replacement weapon runtime. */
class FusionWeaponSystem {
  constructor(manager){
    this.manager=manager;this.maxFusions=3;this.cooldowns=new Map();this.pendingPack=false;this.lastBossAt=-999;this.pauseSnapshot=null;this.temporalEvents=[];
  }
  reset(){this.cooldowns.clear();this.pendingPack=false;this.lastBossAt=-999;this.pauseSnapshot=null;this.temporalEvents.length=0;const overlay=document.getElementById('fusionPackScreen');if(overlay)overlay.classList.add('hidden');}
  eligible(){return this.manager.getAvailableFusionCandidates().filter(f=>!this.manager.isCoreConsumed(f.coreIds[0])&&!this.manager.isCoreConsumed(f.coreIds[1]));}
  grant(id){const f=FUSION_DEFINITIONS.find(x=>x.id===id);if(!f)return null;const result=this.manager.activateFusion(f.coreIds[0],f.coreIds[1]);if(result){toast(`融合完成 · ${result.name}`);this.cooldowns.set(result.id,.4);}return result;}
  openPack(){const choices=this.eligible().sort(()=>Math.random()-.5).slice(0,3);if(!choices.length){toast('融合条件不足 · 共振能量转化为经验');if(!build?.debugLockXp)xp+=Math.max(25,Math.round(nextXp*.25));return false;}
    if(this.pendingPack)return false;
    this.pauseSnapshot={wasPaused:Boolean(paused),previousState:state};
    paused=true;state='fusion';this.pendingPack=true;setSystemMenuVisible(false);
    let overlay=document.getElementById('fusionPackScreen');if(!overlay){overlay=document.createElement('section');overlay.id='fusionPackScreen';overlay.className='screen modal-screen';document.querySelector('#app')?.appendChild(overlay);}overlay.classList.remove('hidden');overlay.innerHTML=`<div class="panel wide-panel rift-panel fusion-pack"><div class="panel-kicker"><span>CORE FUSION PACKAGE</span>源核融合包</div><h2>选择新的融合武器</h2><p class="fusion-warning">融合选择期间作战时间已冻结。融合后，两个原始源核将停止独立工作，并被新武器永久替换。</p><div class="core-grid">${choices.map(f=>`<button class="core-choice fusion-choice" data-fusion="${f.id}"><b>${f.name}</b><small>${f.coreIds.map(id=>CORE_DEFINITIONS[id].shortName).join(' × ')}</small><span>${f.description}</span></button>`).join('')}</div></div>`;
    overlay.querySelectorAll('[data-fusion]').forEach(btn=>btn.onclick=()=>this.finishPack(btn.dataset.fusion,overlay));return true;
  }
  finishPack(fusionId,overlay){
    if(!this.pendingPack)return;
    this.grant(fusionId);overlay.classList.add('hidden');this.pendingPack=false;
    const snapshot=this.pauseSnapshot||{wasPaused:false,previousState:'game'};this.pauseSnapshot=null;
    state=snapshot.previousState==='fusion'?'game':snapshot.previousState;
    const keepPaused=snapshot.wasPaused||state!=='game';paused=keepPaused;
    if(!keepPaused){last=performance.now();setSystemMenuVisible(true);}
  }
  spawnBoss(){if(typeof enemies==='undefined'||enemies.some(e=>e.fusionBoss)){toast('融合Boss已在战场');return false;}const hp=Math.round(1900*(1+Math.max(0,threatLevel()-2)*.2));enemies.push({type:'boss',boss:true,fusionBoss:true,x:W/2,y:90,r:58,hp,max:hp,v:26,shoot:920,dir:1,age:0});enemyBullets.length=0;toast('高密度共振体接近 · 融合Boss');return true;}
  onEnemyKilled(e){if(e?.fusionBoss){this.lastBossAt=elapsed;setTimeout(()=>this.openPack(),350);}}
  update(dt){
    this.updateTemporalEvents(dt);
    for(const f of this.manager.getActiveFusions()){let cd=(this.cooldowns.get(f.id)||0)-dt;if(cd<=0){this.fire(f);cd=this.interval(f);}this.cooldowns.set(f.id,cd);}if(typeof elapsed!=='undefined'&&threatLevel()>=3&&this.eligible().length&&elapsed-this.lastBossAt>360&&!enemies.some(e=>e.boss)&&Math.random()<dt*.002){this.spawnBoss();}
  }
  interval(f){const [a,b]=f.coreIds;if(f.id==='main_time')return .48;if(a==='laser'||b==='laser')return 7;if(a==='missile'||b==='missile')return 4.8;if(a==='drone'||b==='drone')return 2.2;if(a==='time'||b==='time')return 6.5;if(a==='shield'||b==='shield')return 8;return 3.2;}
  fire(f){if(typeof player==='undefined'||!player||typeof enemies==='undefined')return;const [a,b]=f.coreIds;const target=enemies.filter(e=>e.hp>0).sort((x,y)=>Math.hypot(x.x-player.x,x.y-player.y)-Math.hypot(y.x-player.x,y.y-player.y))[0];if(!target)return;
    if(f.id==='main_time'){
      const phase=Math.sin(elapsed*8)*3;
      for(const offset of [-9,9])bullets.push({x:player.x+offset,y:player.y-25,vx:phase*(offset<0?-1:1),vy:-760,r:5.4,d:54,isFusion:true,fusionId:'main_time',temporal:true,life:2.4});
      this.temporalEvents.push({type:'muzzle',x:player.x,y:player.y-28,life:.18,maxLife:.18});
      return;
    }
    if(a==='laser'||b==='laser'){const width=10,life=1.8;bullets.push({laser:true,x:player.x,y:player.y,w:width,h:player.y-20,d:115,life,source:'fusion',fusionId:f.id,color:'#bdfcff'});return;}
    if(a==='missile'||b==='missile'){for(let i=0;i<4;i++){const ang=-Math.PI/2+(i-1.5)*.14;missiles.push({x:player.x+(i-1.5)*9,y:player.y-18,vx:Math.cos(ang)*250,vy:Math.sin(ang)*250,speed:300,turn:3.4,damage:90,radius:55,life:5,trail:0,target,level:3,fusionId:f.id});}return;}
    if(a==='drone'||b==='drone'){for(let i=-2;i<=2;i++)bullets.push({x:player.x+i*18,y:player.y-22,vx:i*12,vy:-470,r:4,d:32,isFusion:true,life:3});return;}
    if(f.id==='shield_repair'){
      build.shieldLayers=Math.min(3,(build.shieldLayers||0)+1);
      if(player.hp<player.maxHp) player.hp=Math.min(player.maxHp,player.hp+8);
      blastWaves.push({x:player.x,y:player.y,life:.65,maxLife:.65,radius:22,prevRadius:0,maxRadius:190,absorbed:0,shieldPulse:true,repairPulse:true});
      return;
    }
    if(a==='time'||b==='time'){build.chronoActive=Math.max(build.chronoActive||0,2.2);return;}
    // Main/thunder/blast/clone combinations become a five-lane replacement salvo.
    for(let i=-2;i<=2;i++)bullets.push({x:player.x+i*16,y:player.y-24,vx:i*18,vy:-520,r:4.8,d:42,isFusion:true,life:3,thunderLevel:(a==='thunder'||b==='thunder')?3:0,blastLevel:(a==='blast'||b==='blast')?3:0});
  }

  onBulletHit(b,e,x,y){
    if(!b||b.fusionId!=='main_time'||!e)return;
    this.temporalEvents.push({type:'mark',x,y,life:.62,maxLife:.62,damage:b.d*.62,radius:48});
    e.temporalStacks=(e.temporalStacks||0)+1;
    e.temporalStackLife=1.8;
    if(e.temporalStacks>=3){
      e.temporalStacks=0;
      this.temporalEvents.push({type:'collapse',x:e.x,y:e.y,life:.42,maxLife:.42,damage:b.d*1.55,radius:92,triggered:false});
    }
  }
  updateTemporalEvents(dt){
    if(typeof enemies==='undefined')return;
    for(const e of enemies){if(e.temporalStackLife>0){e.temporalStackLife-=dt;if(e.temporalStackLife<=0)e.temporalStacks=0;}}
    for(let i=this.temporalEvents.length-1;i>=0;i--){const ev=this.temporalEvents[i];ev.life-=dt;
      const triggerAt=ev.type==='mark'?.08:ev.type==='collapse'?.22:-1;
      if(!ev.triggered&&triggerAt>=0&&ev.life<=triggerAt){ev.triggered=true;const victims=[...enemies];for(const enemy of victims){if(Math.hypot(enemy.x-ev.x,enemy.y-ev.y)<=ev.radius){const killed=damageEnemy(enemy,ev.damage);if(killed){const idx=enemies.indexOf(enemy);if(idx>=0)enemies.splice(idx,1);}}}blastWaves.push({x:ev.x,y:ev.y,life:.32,maxLife:.32,radius:8,prevRadius:0,maxRadius:ev.radius,absorbed:0,temporalEcho:true,temporalCollapse:ev.type==='collapse'});}
      if(ev.life<=0)this.temporalEvents.splice(i,1);
    }
  }
  draw(){if(typeof ctx==='undefined'||typeof player==='undefined'||!player)return;const active=this.manager.getActiveFusions();if(!active.length&&!this.temporalEvents.length)return;ctx.save();ctx.globalCompositeOperation='lighter';active.forEach((f,i)=>{const angle=elapsed*.8+i*Math.PI*2/Math.max(1,active.length),r=48+i*7,x=player.x+Math.cos(angle)*r,y=player.y+Math.sin(angle)*r;const temporal=f.id==='main_time';ctx.strokeStyle=temporal?'rgba(173,118,255,.82)':`hsla(${185+i*55},90%,70%,.65)`;ctx.shadowBlur=temporal?18:8;ctx.shadowColor=temporal?'#8b5dff':'#65eaff';ctx.lineWidth=2;ctx.beginPath();ctx.arc(x,y,temporal?6:5,0,Math.PI*2);ctx.stroke();});
    for(const ev of this.temporalEvents){const p=1-Math.max(0,ev.life)/ev.maxLife,fade=Math.max(0,ev.life/ev.maxLife);ctx.save();ctx.translate(ev.x,ev.y);ctx.shadowBlur=24;ctx.shadowColor='#8a5cff';if(ev.type==='muzzle'){ctx.strokeStyle=`rgba(200,170,255,${fade})`;ctx.lineWidth=2.5;ctx.beginPath();ctx.arc(0,0,10+p*18,0,Math.PI*2);ctx.stroke();}else{const r=(ev.type==='collapse'?18:9)+p*(ev.type==='collapse'?76:34);ctx.rotate(elapsed*(ev.type==='collapse'?3.4:-4.2));ctx.strokeStyle=`rgba(173,112,255,${.85*fade})`;ctx.lineWidth=ev.type==='collapse'?5:2.4;ctx.setLineDash(ev.type==='collapse'?[14,8]:[7,5]);ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);ctx.strokeStyle=`rgba(120,232,255,${.72*fade})`;ctx.lineWidth=1.6;ctx.beginPath();ctx.arc(0,0,r*.68,0,Math.PI*2);ctx.stroke();for(let k=0;k<8;k++){const a=k*Math.PI/4;ctx.beginPath();ctx.moveTo(Math.cos(a)*(r*.78),Math.sin(a)*(r*.78));ctx.lineTo(Math.cos(a)*(r+8),Math.sin(a)*(r+8));ctx.stroke();}}ctx.restore();}
    ctx.restore();}
}
const fusionWeaponSystem=new FusionWeaponSystem(coreManager);window.IWFusionSystem=fusionWeaponSystem;
