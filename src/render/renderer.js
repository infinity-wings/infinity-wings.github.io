const shipSpriteAssets={
 player:Object.assign(new Image(),{src:'assets/ships/player-fighter-v4.png'}),
 drone:Object.assign(new Image(),{src:'assets/ships/player-drone-v1.png'}),
 enemies:{
  scout:Object.assign(new Image(),{src:'assets/ships/enemy-scout-v3.png'}),
  heavy:Object.assign(new Image(),{src:'assets/ships/enemy-heavy-v1.png'}),
  suicide:Object.assign(new Image(),{src:'assets/ships/enemy-suicide-v1.png'}),
  sniper:Object.assign(new Image(),{src:'assets/ships/enemy-sniper-v1.png'}),
  support:Object.assign(new Image(),{src:'assets/ships/enemy-support-v1.png'}),
  barrage:Object.assign(new Image(),{src:'assets/ships/enemy-barrage-v1.png'}),
  raider:Object.assign(new Image(),{src:'assets/ships/enemy-raider-v1.png'}),
  carrier:Object.assign(new Image(),{src:'assets/ships/enemy-carrier-v1.png'}),
  jammer:Object.assign(new Image(),{src:'assets/ships/enemy-jammer-v1.png'})
 },
 guard:Object.assign(new Image(),{src:'assets/ships/enemy-boss-guard-v1.png'}),
 boss:Object.assign(new Image(),{src:'assets/ships/boss-dreadnought-wide-v3.png'})
};
const shieldSpriteAssets={
 enemy:Object.assign(new Image(),{src:'assets/effects/enemy-support-shield-v2.png'}),
 player1:Object.assign(new Image(),{src:'assets/effects/player-shield-level1-v1.png'}),
 player2:Object.assign(new Image(),{src:'assets/effects/player-shield-level2-v1.png'}),
 player3:Object.assign(new Image(),{src:'assets/effects/player-shield-level3-v1.png'}),
 escort:Object.assign(new Image(),{src:'assets/effects/escort-front-barrier-v2.png'})
};
for(const image of [shipSpriteAssets.player,shipSpriteAssets.drone,shipSpriteAssets.guard,shipSpriteAssets.boss,...Object.values(shipSpriteAssets.enemies),...Object.values(shieldSpriteAssets)])image.decoding='async';
const tintedShipSpriteCache=new Map();
const mobileRenderSpriteCache=new WeakMap();
function getMobileRenderSprite(image){
 if(!mobilePerf?.enabled||!image)return image;
 if(mobileRenderSpriteCache.has(image))return mobileRenderSpriteCache.get(image);
 const sourceW=image.naturalWidth||image.width||0,sourceH=image.naturalHeight||image.height||0;if(!sourceW||!sourceH)return image;
 const scale=Math.min(1,256/Math.max(sourceW,sourceH)),sprite=document.createElement('canvas');sprite.width=Math.max(1,Math.round(sourceW*scale));sprite.height=Math.max(1,Math.round(sourceH*scale));
 const spriteCtx=sprite.getContext('2d',{alpha:true});spriteCtx.imageSmoothingEnabled=true;spriteCtx.imageSmoothingQuality='high';spriteCtx.drawImage(image,0,0,sprite.width,sprite.height);mobileRenderSpriteCache.set(image,sprite);return sprite;
}
function getTintedShipSprite(image,color,strength=.35){
 if(!shipSpriteReady(image)||!color)return image;
 const key=`${image.src}|${color}|${strength}`;if(tintedShipSpriteCache.has(key))return tintedShipSpriteCache.get(key);
 const maxSide=mobilePerf?.enabled?256:Math.max(image.naturalWidth,image.naturalHeight),scale=Math.min(1,maxSide/Math.max(image.naturalWidth,image.naturalHeight));const tinted=document.createElement('canvas');tinted.width=Math.round(image.naturalWidth*scale);tinted.height=Math.round(image.naturalHeight*scale);const tintCtx=tinted.getContext('2d');
 tintCtx.drawImage(image,0,0,tinted.width,tinted.height);tintCtx.globalCompositeOperation='source-atop';tintCtx.globalAlpha=strength;tintCtx.fillStyle=color;tintCtx.fillRect(0,0,tinted.width,tinted.height);tintCtx.globalCompositeOperation='source-over';
 tintedShipSpriteCache.set(key,tinted);return tinted;
}
const BOSS_VISUAL_PROFILES=Object.freeze([
 {tint:'#365d86',core:'#7ddfff',mark:1},{tint:'#6f351f',core:'#ff9a55',mark:2},{tint:'#574084',core:'#c49aff',mark:3},{tint:'#775e25',core:'#ffe06d',mark:4},{tint:'#7b214f',core:'#ff66bd',mark:5},
 {tint:'#183f54',core:'#62edff',mark:6},{tint:'#743226',core:'#ff705b',mark:7},{tint:'#49316f',core:'#b77aff',mark:8},{tint:'#705c18',core:'#ffd84b',mark:9},{tint:'#83182e',core:'#ff365c',mark:10}
]);
function bossVisualProfile(e){return BOSS_VISUAL_PROFILES[Math.max(0,Math.min(9,(e.bossNumber||e.bossStage||1)-1))]}
function drawBossStageDetails(e,profile,pulse){
 const advanced=(e.bossNumber||1)>=5;enemyModelCtx.save();enemyModelCtx.globalCompositeOperation='lighter';enemyModelCtx.strokeStyle=profile.core;enemyModelCtx.fillStyle=profile.core;enemyModelCtx.shadowBlur=advanced?15:9;enemyModelCtx.shadowColor=profile.core;enemyModelCtx.globalAlpha=.46+.28*pulse;enemyModelCtx.lineWidth=1.5;
 const span=58+Math.min(18,profile.mark*1.6);enemyModelCtx.beginPath();enemyModelCtx.moveTo(-span,-15);enemyModelCtx.lineTo(-34,-4);enemyModelCtx.lineTo(-span,12);enemyModelCtx.moveTo(span,-15);enemyModelCtx.lineTo(34,-4);enemyModelCtx.lineTo(span,12);enemyModelCtx.stroke();
 if(advanced){for(const side of [-1,1]){enemyModelCtx.beginPath();enemyModelCtx.arc(side*(42+profile.mark%3*6),-2,4+(profile.mark%2),0,Math.PI*2);enemyModelCtx.fill()}}
 if(profile.mark===10){enemyModelCtx.lineWidth=2.5;enemyModelCtx.beginPath();enemyModelCtx.ellipse(0,-4,70,45,0,0,Math.PI*2);enemyModelCtx.stroke()}
 if(elapsed-(e.lastHitAt||-99)<.12){enemyModelCtx.globalAlpha=.92;enemyModelCtx.strokeStyle='#ffffff';enemyModelCtx.shadowBlur=20;enemyModelCtx.lineWidth=2.4;enemyModelCtx.beginPath();enemyModelCtx.ellipse(0,0,82,59,0,0,Math.PI*2);enemyModelCtx.stroke()}
 enemyModelCtx.restore();
}
const enemySpriteSizes={
 scout:[76,80],heavy:[100,92],suicide:[72,80],sniper:[82,92],support:[90,84],
 barrage:[102,90],raider:[82,78],carrier:[112,92],jammer:[90,84]
};
function shipSpriteReady(image){return image?.complete&&image.naturalWidth>0}
function drawShieldSprite(targetCtx,image,x,y,width,height,alpha=1,rotation=0){
 if(!shipSpriteReady(image))return false;
 const sprite=getMobileRenderSprite(image);targetCtx.save();targetCtx.translate(x,y);targetCtx.rotate(rotation);targetCtx.globalCompositeOperation='lighter';targetCtx.globalAlpha=alpha;targetCtx.imageSmoothingEnabled=true;targetCtx.imageSmoothingQuality='high';targetCtx.drawImage(sprite,-width/2,-height/2,width,height);targetCtx.restore();return true;
}
function drawSupportShieldLinks(){
 const supports=enemies.filter(e=>e?.type==='support'&&e.hp>0);if(!supports.length)return;
 ctx.save();ctx.globalCompositeOperation='lighter';ctx.lineCap='round';
 for(const support of supports){
  const allies=enemies.filter(e=>e!==support&&e.hp>0&&e.shield>0&&e.supportShieldSource===support&&Math.hypot(e.x-support.x,e.y-support.y)<132).sort((a,b)=>Math.hypot(a.x-support.x,a.y-support.y)-Math.hypot(b.x-support.x,b.y-support.y)).slice(0,3);
  for(const ally of allies){const pulse=.68+.32*Math.sin(elapsed*10+ally.x*.03),gradient=ctx.createLinearGradient(support.x,support.y,ally.x,ally.y);gradient.addColorStop(0,'rgba(198,255,255,.92)');gradient.addColorStop(.45,'rgba(67,224,255,.72)');gradient.addColorStop(1,'rgba(84,170,255,.22)');ctx.globalAlpha=.52+.28*pulse;ctx.shadowBlur=12;ctx.shadowColor='#4ceaff';ctx.strokeStyle=gradient;ctx.lineWidth=2.2;ctx.beginPath();ctx.moveTo(support.x,support.y);ctx.lineTo(ally.x,ally.y);ctx.stroke();ctx.globalAlpha=.8;ctx.fillStyle='#e8ffff';for(let t=.22;t<1;t+=.28){const travel=(t+elapsed*.55)%1;ctx.beginPath();ctx.arc(support.x+(ally.x-support.x)*travel,support.y+(ally.y-support.y)*travel,1.7,0,Math.PI*2);ctx.fill()}}
 }
 ctx.restore();
}
function drawPlayerSpriteGlow(color='#69efff',alpha=1){
 const pulse=.76+.24*Math.sin(elapsed*6.4),enginePulse=.8+.2*Math.sin(elapsed*18);
 ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=alpha;
 ctx.shadowBlur=13;ctx.shadowColor=color;ctx.strokeStyle=color;ctx.lineWidth=1.35;
 ctx.beginPath();ctx.moveTo(0,-32);ctx.lineTo(0,8);ctx.moveTo(-8,-8);ctx.lineTo(-15,10);ctx.lineTo(-31,18);ctx.moveTo(8,-8);ctx.lineTo(15,10);ctx.lineTo(31,18);ctx.stroke();
 ctx.globalAlpha=alpha*pulse;ctx.fillStyle='#eaffff';ctx.beginPath();ctx.ellipse(0,-18,3.8,10,0,0,Math.PI*2);ctx.fill();
 ctx.shadowBlur=18;ctx.fillStyle=color;for(const x of [-27,27]){ctx.beginPath();ctx.arc(x,15,2.1,0,Math.PI*2);ctx.fill()}
 ctx.globalAlpha=alpha*enginePulse;ctx.shadowBlur=22;for(const x of [-9,9]){ctx.fillStyle='#efffff';ctx.fillRect(x-2,31,4,4);ctx.fillStyle=color;ctx.fillRect(x-1.2,35,2.4,8+enginePulse*4)}
 ctx.restore();
}

function withRenderState(label,fn){
 const baseTransform=ctx.getTransform?.();
 ctx.save();
 try{
  ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';ctx.shadowBlur=0;ctx.shadowColor='transparent';ctx.filter='none';ctx.setLineDash([]);ctx.lineCap='butt';ctx.lineJoin='miter';
  fn();
 }catch(error){console.warn(label+' 绘制已隔离',error);IWStability?.requestCanvasReset?.()}
 finally{
  ctx.restore();
  if(baseTransform)ctx.setTransform(baseTransform);
  else ctx.setTransform(1,0,0,1,0,0);
  ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';ctx.shadowBlur=0;ctx.shadowColor='transparent';ctx.filter='none';ctx.setLineDash([]);
 }
}
function drawParticleSafe(p,lowFx){
 if(!p||![p.x,p.y,p.r,p.life].every(Number.isFinite))return;
 const max=Number.isFinite(p.max)&&p.max>0?p.max:(p.life>0?p.life:1);
 ctx.globalAlpha=Math.max(0,Math.min(1,p.life/max));ctx.globalCompositeOperation='source-over';ctx.shadowBlur=0;ctx.shadowColor='transparent';
 ctx.fillStyle=p.type==='barrier'?'#8ff6ff':p.type==='thunder'?'#d9fbff':p.type==='missile'||p.type==='missileTrail'?'#ffcf70':p.type==='repairShard'?'#6dff9b':p.type==='laserCharge'?'#bffcff':'#ffb24a';
 if(!lowFx&&(p.type==='barrier'||p.type==='thunder'||p.type==='missile'||p.type==='missileTrail'||p.type==='laserCharge')){ctx.globalCompositeOperation='lighter';ctx.shadowBlur=9;ctx.shadowColor='#5de8ff'}
 ctx.beginPath();ctx.arc(p.x,p.y,Math.max(.1,p.r),0,Math.PI*2);ctx.fill();
}
const enemyBulletSpriteCache=new Map();
function getEnemyBulletSprite(type,radius){
 const size=Math.max(3,Math.min(10,Math.round(radius||5))),key=`${type||'cyan'}-${size}`;
 if(enemyBulletSpriteCache.has(key))return enemyBulletSpriteCache.get(key);
 const sprite=document.createElement('canvas');sprite.width=56;sprite.height=32;const c=sprite.getContext('2d'),headX=38,centerY=16;
 const purple=type==='purple'||type==='jammer',orange=type==='orange'||type==='barrage',red=type==='red',yellow=type==='yellow';
 const outer=purple?'#a45cff':orange?'#ff7b32':red?'#ff324f':yellow?'#ffd43b':'#20d9ff';
 const mid=purple?'#d7a8ff':orange?'#ffd279':red?'#ff8a98':yellow?'#fff09a':'#8cf5ff';
 const core=purple?'#fbf0ff':orange?'#fff7d6':red?'#fff1f3':yellow?'#fffde8':'#f7ffff';
 const trail=c.createLinearGradient(13,centerY,35,centerY);trail.addColorStop(0,'rgba(255,255,255,0)');trail.addColorStop(.66,outer+'20');trail.addColorStop(1,mid+'8c');c.fillStyle=trail;c.beginPath();c.moveTo(12,centerY);c.lineTo(35,centerY-Math.max(1.2,size*.24));c.lineTo(35,centerY+Math.max(1.2,size*.24));c.closePath();c.fill();
 const glow=c.createRadialGradient(headX,centerY,1,headX,centerY,size+5);glow.addColorStop(0,core);glow.addColorStop(.38,mid);glow.addColorStop(.72,outer+'a0');glow.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=glow;c.beginPath();c.arc(headX,centerY,size+5,0,Math.PI*2);c.fill();c.fillStyle=core;c.beginPath();c.arc(headX+.5,centerY,Math.max(1.7,size*.36),0,Math.PI*2);c.fill();
 sprite._iwAnchorX=headX;enemyBulletSpriteCache.set(key,sprite);return sprite;
}
function draw(){
 try{
  ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';ctx.shadowBlur=0;ctx.shadowColor='transparent';ctx.setLineDash([]);
  const finite=(v,f=0)=>Number.isFinite(v)?v:f;
  enemyBullets=ensureEntityArray('enemyBullets',enemyBullets);bullets=ensureEntityArray('bullets',bullets);particles=ensureEntityArray('particles',particles);missiles=ensureEntityArray('missiles',missiles);pickups=ensureEntityArray('pickups',pickups);
  enemies=Array.isArray(enemies)?enemies:[];
  enemyLasers=Array.isArray(enemyLasers)?enemyLasers:[];
  blastWaves=Array.isArray(blastWaves)?blastWaves:[];
  lightningArcs=Array.isArray(lightningArcs)?lightningArcs:[];
  drones=Array.isArray(drones)?drones:[];
 const renderLoad=enemies.length+enemyBullets.length*.08+bullets.length*.035+particles.length*.02+(pickups?.length||0)*.07;
 const perfQ=(typeof mobilePerf!=='undefined'&&mobilePerf.enabled)?mobilePerf.quality:1;
 // 降载只减少模糊与渐变层，绝不再把子弹退化成纯色圆点。
 const lowFx=perfQ<.86||renderLoad>(38+10*perfQ)||(particles?.length||0)>250;
 if(shake&&uiPrefs.shake){ctx.translate((Math.random()-.5)*shake,(Math.random()-.5)*shake);shake*=.85}ctx.clearRect(0,0,W,H);ctx.fillStyle='#020712';ctx.fillRect(0,0,W,H);
 const starStride=mobilePerf?.enabled?(perfQ<.66?3:perfQ<.82?2:1):1;for(let i=0;i<stars.length;i+=starStride){const s=stars[i];ctx.globalAlpha=.35+s.s/3;ctx.fillStyle='#85ddff';ctx.fillRect(s.x,s.y,s.s,s.s)}ctx.globalAlpha=1;
 const bossWarning=typeof bossWarningState==='function'?bossWarningState():null;
 if(bossWarning){withRenderState('Boss预警',()=>{const pulse=.72+.28*Math.sin(elapsed*14);ctx.globalAlpha=.78+.22*pulse;ctx.fillStyle='rgba(66,4,18,.88)';ctx.fillRect(W/2-155,82,310,48);ctx.strokeStyle='#ff526d';ctx.lineWidth=2;ctx.strokeRect(W/2-155,82,310,48);ctx.fillStyle='#fff0f3';ctx.font='bold 15px system-ui';ctx.textAlign='center';ctx.fillText(`警告 · 第 ${bossWarning.number} 号 Boss 接近`,W/2,102);ctx.fillStyle='#ff9baa';ctx.font='bold 13px ui-monospace,monospace';ctx.fillText(`${Math.max(0,bossWarning.remaining).toFixed(1)} 秒`,W/2,121)})}
 if(!(particles instanceof PooledEntityArray))particles=ensureEntityArray('particles',particles);
 withRenderState('粒子层',()=>{const particleStride=mobilePerf?.enabled?(perfQ<.66?4:perfQ<.82?2:1):1;for(let i=0;i<particles.length;i++){const p=particles[i],important=p.type==='barrier'||p.type==='thunder'||p.type==='repairShard';if(!important&&particleStride>1&&i%particleStride)continue;if(p.x<-45||p.x>W+45||p.y<-60||p.y>H+60)continue;drawParticleSafe(p,lowFx)}});
 withRenderState('冲击波层',()=>{for(const wave of blastWaves||[])withRenderState('单个冲击波',()=>drawBarrierWave(wave))});
 withRenderState('闪电层',()=>{for(const arc of lightningArcs||[])withRenderState('单条闪电',()=>drawLightningArc(arc))});
 withRenderState('激光蓄力层',()=>drawLaserChargeEffect());
 withRenderState('核心防御层',()=>drawCoreDefenseEffects(lowFx));
 for(const b of bullets){
  if(b.laser){ctx.save();ctx.globalCompositeOperation='lighter';ctx.shadowBlur=24+(b.level||1)*7;ctx.shadowColor=b.level===3?'#8d6cff':'#55eaff';ctx.fillStyle='rgba(68,196,255,.13)';ctx.fillRect(b.x-b.w*2.7,0,b.w*5.4,b.h);ctx.fillStyle='rgba(110,232,255,.48)';ctx.fillRect(b.x-b.w,0,b.w*2,b.h);ctx.fillStyle='rgba(239,255,255,.98)';ctx.fillRect(b.x-b.w*.34,0,b.w*.68,b.h);ctx.restore()}
  else if(b.source==='drone'){
   ctx.save();ctx.globalCompositeOperation='lighter';
   if(b.awakening==='drone_heavy'){
    const speed=Math.hypot(b.vx,b.vy)||1,ux=b.vx/speed,uy=b.vy/speed;
    const trail=ctx.createLinearGradient(b.x-ux*30,b.y-uy*30,b.x,b.y);trail.addColorStop(0,'rgba(67,184,255,0)');trail.addColorStop(1,'rgba(190,252,255,.9)');ctx.strokeStyle=trail;ctx.lineWidth=5.5;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(b.x-ux*30,b.y-uy*30);ctx.lineTo(b.x-ux*5,b.y-uy*5);ctx.stroke();
    ctx.shadowBlur=20;ctx.shadowColor='#61eaff';ctx.fillStyle='#dffeff';ctx.beginPath();ctx.ellipse(b.x,b.y-7,5.2,13.5,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#59cfff';ctx.beginPath();ctx.ellipse(b.x,b.y-8,2.6,8.5,0,0,Math.PI*2);ctx.fill();
   }else{ctx.shadowBlur=9;ctx.shadowColor='#58d9ff';ctx.fillStyle='#baf6ff';ctx.beginPath();ctx.ellipse(b.x,b.y-5,2.2,6.5,0,0,Math.PI*2);ctx.fill();}
   ctx.restore();
  }else if(b.source==='split'){
   const angle=Math.atan2(b.vy,b.vx)+Math.PI/2;
   ctx.save();ctx.translate(b.x,b.y);ctx.rotate(angle);ctx.globalCompositeOperation='lighter';ctx.shadowBlur=12;ctx.shadowColor='#ff9b42';ctx.fillStyle='#ffe0a0';ctx.beginPath();ctx.moveTo(0,-8);ctx.lineTo(-3.2,4);ctx.lineTo(0,2);ctx.lineTo(3.2,4);ctx.closePath();ctx.fill();ctx.restore();
  }else if(b.awakening){ctx.save();ctx.globalCompositeOperation='lighter';const phase=b.awakening==='clone_substitute',matrix=b.awakening==='clone_mirror';ctx.shadowBlur=phase?28:18;ctx.shadowColor=b.awakening==='main_piercer'?'#ff765d':phase?'#765dff':matrix?'#8f7cff':'#b58cff';ctx.fillStyle=b.awakening==='main_piercer'?'#fff0b8':b.awakening.includes('repair')?'#6dff9b':phase?'#f1ecff':'#d6c5ff';ctx.beginPath();ctx.ellipse(b.x,b.y-3,b.r||4,(b.r||4)*(phase?3.1:2.2),0,0,Math.PI*2);ctx.fill();if(phase){ctx.strokeStyle='#9fdcff';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(b.x,b.y+12);ctx.lineTo(b.x,b.y+34);ctx.stroke()}ctx.restore();
  }else{ctx.fillStyle=b.source==='clone'?'#b88cff':'#65e7ff';ctx.fillRect(b.x-2,b.y-10,4,14);if(b.blastLevel){ctx.save();ctx.globalCompositeOperation='lighter';const pulse=.72+.28*Math.sin(elapsed*18+b.x*.04),radius=3.2+b.blastLevel*1.25;ctx.shadowBlur=16+b.blastLevel*4;ctx.shadowColor='#ff743c';ctx.fillStyle='#fff0a8';ctx.beginPath();ctx.arc(b.x,b.y-4,radius,0,Math.PI*2);ctx.fill();ctx.strokeStyle=`rgba(255,121,58,${.55+.35*pulse})`;ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(b.x,b.y-4,radius+4+pulse*2,0,Math.PI*2);ctx.stroke();for(let i=0;i<b.blastLevel+2;i++){const a=elapsed*3+i*Math.PI*2/(b.blastLevel+2);ctx.fillStyle='#ff9a45';ctx.beginPath();ctx.arc(b.x+Math.cos(a)*(radius+6),b.y-4+Math.sin(a)*(radius+6),1.2,0,Math.PI*2);ctx.fill()}ctx.restore()}}
 }
 for(const m of missiles)withRenderState('导弹模型',()=>drawMissile(m));
 for(const l of enemyLasers||[]){
  const active=l.life<l.duration;
  ctx.save();ctx.globalCompositeOperation='lighter';
  if(!active){const pulse=.45+.35*Math.sin(elapsed*18);ctx.globalAlpha=.28+.28*pulse;ctx.fillStyle='rgba(255,38,70,.16)';ctx.fillRect(l.x-l.width*2.5,l.y,l.width*5,H-l.y);ctx.globalAlpha=.72;ctx.strokeStyle='#ff6c7d';ctx.lineWidth=1.5;ctx.setLineDash([7,8]);for(const side of [-1,1]){ctx.beginPath();ctx.moveTo(l.x+side*l.width*1.7,l.y);ctx.lineTo(l.x+side*l.width*1.7,H);ctx.stroke()}ctx.setLineDash([]);for(let y=l.y+45;y<H;y+=86){ctx.globalAlpha=.35+.4*pulse;ctx.beginPath();ctx.moveTo(l.x-8,y-6);ctx.lineTo(l.x,y);ctx.lineTo(l.x+8,y-6);ctx.stroke()}}
  else{ctx.globalAlpha=.9;ctx.shadowBlur=30;ctx.shadowColor='#ff355d';const g=ctx.createLinearGradient(l.x-l.width*2.2,0,l.x+l.width*2.2,0);g.addColorStop(0,'rgba(255,30,70,0)');g.addColorStop(.22,'rgba(255,45,82,.42)');g.addColorStop(.42,'rgba(255,153,170,.9)');g.addColorStop(.5,'#fff');g.addColorStop(.58,'rgba(255,153,170,.9)');g.addColorStop(.78,'rgba(255,45,82,.42)');g.addColorStop(1,'rgba(255,30,70,0)');ctx.fillStyle=g;ctx.fillRect(l.x-l.width*2.2,l.y,l.width*4.4,H-l.y);ctx.shadowBlur=10;ctx.strokeStyle='rgba(255,225,232,.88)';ctx.lineWidth=1.2;for(let y=l.y+32;y<H;y+=72){ctx.globalAlpha=.35+.35*Math.sin(elapsed*14+y*.03);ctx.beginPath();ctx.arc(l.x,y,l.width*1.7,0,Math.PI*2);ctx.stroke()}}ctx.restore();
 }
 const enemyBulletBaseTransform=ctx.getTransform?.();
 for(const b of enemyBullets){
  if(b.x<-55||b.x>W+55||b.y<-70||b.y>H+70)continue;
  if(typeof mobilePerf!=='undefined'&&mobilePerf.enabled){const sprite=getEnemyBulletSprite(b.type,b.r),angle=Number.isFinite(b.angle)?b.angle:Math.atan2(b.vy,b.vx),cs=Math.cos(angle),sn=Math.sin(angle);if(enemyBulletBaseTransform){const m=enemyBulletBaseTransform;ctx.setTransform(m.a*cs+m.c*sn,m.b*cs+m.d*sn,-m.a*sn+m.c*cs,-m.b*sn+m.d*cs,m.a*b.x+m.c*b.y+m.e,m.b*b.x+m.d*b.y+m.f);ctx.drawImage(sprite,-sprite._iwAnchorX,-sprite.height/2)}else{ctx.save();ctx.translate(b.x,b.y);ctx.rotate(angle);ctx.drawImage(sprite,-sprite._iwAnchorX,-sprite.height/2);ctx.restore()}continue}
  const speed=Math.hypot(b.vx,b.vy)||1,ux=b.vx/speed,uy=b.vy/speed;
  const isPurple=b.type==='purple'||b.type==='jammer',isOrange=b.type==='orange'||b.type==='barrage',isRed=b.type==='red',isYellow=b.type==='yellow';
  const outer=isPurple?'#a45cff':isOrange?'#ff7b32':isRed?'#ff324f':isYellow?'#ffd43b':'#20d9ff';
  const mid=isPurple?'#d7a8ff':isOrange?'#ffd279':isRed?'#ff8a98':isYellow?'#fff09a':'#8cf5ff';
  const core=isPurple?'#fbf0ff':isOrange?'#fff7d6':isRed?'#fff1f3':isYellow?'#fffde8':'#f7ffff';
  ctx.save();ctx.globalCompositeOperation='lighter';
  if(lowFx){
   ctx.globalAlpha=.72;ctx.strokeStyle=mid;ctx.lineWidth=Math.max(1.3,b.r*.42);ctx.lineCap='round';ctx.beginPath();ctx.moveTo(b.x-ux*(7+b.r*.7),b.y-uy*(7+b.r*.7));ctx.lineTo(b.x-ux*b.r*.55,b.y-uy*b.r*.55);ctx.stroke();
   ctx.globalAlpha=1;ctx.fillStyle=outer;ctx.beginPath();ctx.arc(b.x,b.y,b.r+1,0,Math.PI*2);ctx.fill();ctx.fillStyle=core;ctx.beginPath();ctx.arc(b.x-ux,b.y-uy,Math.max(1.6,b.r*.42),0,Math.PI*2);ctx.fill();ctx.restore();continue;
  }
  const trailLength=10+b.r*.8,trail=ctx.createLinearGradient(b.x-ux*trailLength,b.y-uy*trailLength,b.x,b.y);
  trail.addColorStop(0,'rgba(255,255,255,0)');trail.addColorStop(.7,isPurple?'rgba(157,73,255,.10)':isOrange?'rgba(255,130,48,.10)':isRed?'rgba(255,45,75,.11)':isYellow?'rgba(255,215,55,.11)':'rgba(32,217,255,.09)');trail.addColorStop(1,isPurple?'rgba(203,132,255,.48)':isOrange?'rgba(255,194,88,.46)':isRed?'rgba(255,100,120,.5)':isYellow?'rgba(255,236,120,.52)':'rgba(112,242,255,.48)');
  ctx.strokeStyle=trail;ctx.lineWidth=Math.max(1.4,b.r*(isPurple?.58:.45));ctx.lineCap='round';ctx.beginPath();ctx.moveTo(b.x-ux*trailLength,b.y-uy*trailLength);ctx.lineTo(b.x-ux*b.r*.7,b.y-uy*b.r*.7);ctx.stroke();
  ctx.shadowBlur=isPurple?22:isOrange?17:isRed?20:isYellow?12:14;ctx.shadowColor=outer;ctx.fillStyle=outer;ctx.beginPath();ctx.arc(b.x,b.y,b.r+2.2,0,Math.PI*2);ctx.fill();
  ctx.shadowBlur=isPurple?13:9;ctx.fillStyle=mid;ctx.beginPath();ctx.arc(b.x,b.y,b.r*.72,0,Math.PI*2);ctx.fill();
  ctx.shadowBlur=6;ctx.shadowColor='#fff';ctx.fillStyle=core;ctx.beginPath();ctx.arc(b.x-ux*b.r*.12,b.y-uy*b.r*.12,Math.max(1.8,b.r*.32),0,Math.PI*2);ctx.fill();
  ctx.strokeStyle=isPurple?'rgba(235,211,255,.9)':isOrange?'rgba(255,226,160,.82)':isRed?'rgba(255,205,212,.88)':isYellow?'rgba(255,248,190,.9)':'rgba(196,252,255,.88)';ctx.lineWidth=isPurple?1.8:1.1;ctx.globalAlpha=.65+.3*Math.sin(elapsed*(isPurple?11:8)+b.x*.03);ctx.beginPath();ctx.arc(b.x,b.y,b.r+5+(isPurple?2:1)*Math.sin(elapsed*9+b.y*.02),0,Math.PI*2);ctx.stroke();
  if(isPurple){ctx.save();ctx.translate(b.x,b.y);ctx.rotate(elapsed*2.5+b.x*.01);ctx.strokeStyle='rgba(210,164,255,.55)';ctx.lineWidth=1;for(let i=0;i<3;i++){const a=i*Math.PI*2/3;ctx.beginPath();ctx.arc(Math.cos(a)*(b.r+7),Math.sin(a)*(b.r+7),2.1,0,Math.PI*2);ctx.stroke();}ctx.restore();}
  ctx.restore();
 }
 if(enemyBulletBaseTransform)ctx.setTransform(enemyBulletBaseTransform);
 ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';ctx.shadowBlur=0;ctx.shadowColor='transparent';ctx.filter='none';ctx.setLineDash([]);ctx.lineWidth=1;ctx.lineCap='butt';ctx.lineJoin='miter';
 enemyModelCtx=ctx;
 withRenderState('支援护盾连接',()=>drawSupportShieldLinks());
 for(const e of enemies){try{withRenderState('敌机模型',()=>drawEnemyShip(e));if(e.boss&&!e.bossRetreating){ctx.save();ctx.fillStyle='#dbeaff';ctx.font='bold 12px system-ui';ctx.textAlign='center';const timer=!e.persistentBoss&&Number.isFinite(e.bossTimeLeft)?` · ${Math.max(0,Math.ceil(e.bossTimeLeft))}秒`:'';ctx.fillText(`#${e.bossNumber||e.bossStage} ${e.bossName||'Boss'}${e.awakenedBoss?' [觉醒]':''}${timer}`,W/2,21);ctx.fillStyle='#18233b';ctx.fillRect(55,28,W-110,12);ctx.fillStyle=e.awakenedBoss?'#ff5fd7':'#a767ff';ctx.fillRect(55,28,(W-110)*Math.max(0,Math.min(1,(finite(e.hp,0)/Math.max(1,finite(e.max,1))))),12);ctx.restore()}}catch(error){console.warn('敌机绘制已跳过',error,e)}}
 for(const d of drones){try{withRenderState('无人机模型',()=>drawDrone(d))}catch(error){console.warn('无人机绘制已跳过',error,d)}}
 try{drawHeavyEscortShield()}catch(error){console.warn('护航盾绘制已跳过',error)}
 try{drawAwakenedFrontShield()}catch(error){console.warn('前盾绘制已跳过',error)}
 if(!dying){for(const clone of clonePositions()){try{ctx.save();ctx.globalAlpha=finite(clone.alpha,.54);drawShip(finite(clone.x,player.x),finite(clone.y,player.y),clone.color||'#b474ff',clone)}catch(error){console.warn('投影绘制已跳过',error,clone)}finally{ctx.restore()}}}
 if(!dying&&player&&Number.isFinite(player.x)&&Number.isFinite(player.y)){try{withRenderState('玩家模型',()=>drawShip(player.x,player.y,'#5ce1ff'))}catch(error){console.warn('玩家模型绘制已跳过',error)}}
 try{battleEventSystem.draw();battleEventSystem.drawMeteorTextures();battleEventSystem.drawMeteorWarnings()}catch(error){console.warn('随机事件绘制已跳过',error)}
 try{awakeningSystem.draw()}catch(error){console.warn('觉醒效果绘制已跳过',error)}
 if(deathFade>0){ctx.fillStyle=`rgba(0,0,0,${deathFade})`;ctx.fillRect(0,0,W,H)}
 }catch(error){
  console.error('战斗渲染层已自动恢复',error);
  // 任何单个爆炸、弹幕或特效出错时，仍强制补画核心战斗模型，避免“游戏继续但飞机全部消失”。
  ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';ctx.shadowBlur=0;ctx.shadowColor='transparent';ctx.filter='none';ctx.setLineDash([]);
  enemyModelCtx=ctx;
  for(const e of Array.isArray(enemies)?enemies:[])if(e&&Number.isFinite(e.x)&&Number.isFinite(e.y))withRenderState('恢复敌机模型',()=>drawEnemyShip(e));
  for(const d of Array.isArray(drones)?drones:[])if(d&&Number.isFinite(d.x)&&Number.isFinite(d.y))withRenderState('恢复无人机模型',()=>drawDrone(d));
  if(!dying&&player&&Number.isFinite(player.x)&&Number.isFinite(player.y))withRenderState('恢复玩家模型',()=>drawShip(player.x,player.y,'#5ce1ff'));
 }finally{ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';ctx.shadowBlur=0;ctx.shadowColor='transparent';ctx.filter='none';ctx.setLineDash([])}
}

function drawLaserChargeEffect(){
 const level=coreManager.getLevel('laser'),state=build&&build.laserState;
 if(!level||!state||state.phase!=='charging')return;
 const stats=laserStats(level),progress=1-Math.max(0,state.timer)/stats.charge;
 for(const emitter of laserEmitterPositions(level)){
  const x=emitter.x,y=emitter.y-28;
  ctx.save();ctx.translate(x,y);ctx.globalCompositeOperation='lighter';
  const radius=8+progress*13,pulse=.72+.28*Math.sin(elapsed*24);
  ctx.shadowBlur=18+progress*24;ctx.shadowColor=level===3?'#8c70ff':'#58ecff';
  const glow=ctx.createRadialGradient(0,0,0,0,0,radius*2.3);glow.addColorStop(0,`rgba(245,255,255,${.9*pulse})`);glow.addColorStop(.25,`rgba(80,231,255,${.65*progress})`);glow.addColorStop(1,'rgba(84,70,255,0)');ctx.fillStyle=glow;ctx.beginPath();ctx.arc(0,0,radius*2.3,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle=`rgba(193,249,255,${.45+.5*progress})`;ctx.lineWidth=1.5+progress*2;ctx.beginPath();ctx.arc(0,0,radius,elapsed*3,elapsed*3+Math.PI*1.55);ctx.stroke();
  ctx.strokeStyle=`rgba(118,94,255,${.35+.45*progress})`;ctx.lineWidth=1.2;ctx.beginPath();ctx.arc(0,0,radius+6,-elapsed*4,-elapsed*4+Math.PI*1.25);ctx.stroke();
  ctx.strokeStyle=`rgba(154,241,255,${.12+.28*progress})`;ctx.lineWidth=.7+progress;ctx.beginPath();ctx.moveTo(0,-y);ctx.lineTo(0,-radius-8);ctx.stroke();ctx.restore();
 }
}

function drawLightningArc(arc){
 const fade=Math.max(0,arc.life/arc.maxLife);
 ctx.save();ctx.globalCompositeOperation='lighter';
 if(arc.burst){
  const progress=1-fade;const radius=arc.radius*(.35+.65*progress);
  const clusterBurst=arc.awakening==='missile_cluster',hunterBurst=arc.awakening==='missile_hunter';ctx.shadowBlur=arc.missile?34:24;ctx.shadowColor=clusterBurst?'#55ecff':hunterBurst?'#ff313d':arc.missile?'#ff9d3d':'#775dff';ctx.strokeStyle=clusterBurst?`rgba(205,255,255,${.94*fade})`:hunterBurst?`rgba(255,220,190,${.96*fade})`:arc.missile?`rgba(255,244,196,${.9*fade})`:`rgba(205,247,255,${.82*fade})`;ctx.lineWidth=hunterBurst?6:arc.missile?4.2:2.4;
  ctx.beginPath();ctx.arc(arc.x1,arc.y1,radius,0,Math.PI*2);ctx.stroke();
  ctx.strokeStyle=clusterBurst?`rgba(65,225,255,${.62*fade})`:hunterBurst?`rgba(255,45,58,${.72*fade})`:arc.missile?`rgba(255,115,48,${.62*fade})`:`rgba(126,98,255,${.55*fade})`;ctx.lineWidth=hunterBurst?18:clusterBurst?11:arc.missile?12:7;ctx.beginPath();ctx.arc(arc.x1,arc.y1,Math.max(4,radius-7),0,Math.PI*2);ctx.stroke();ctx.restore();return;
 }
 const dx=arc.x2-arc.x1,dy=arc.y2-arc.y1,len=Math.hypot(dx,dy)||1,nx=-dy/len,ny=dx/len;
 const segments=Math.max(5,Math.ceil(len/22));
 const drawBolt=(width,alpha,offsetScale)=>{
  ctx.beginPath();ctx.moveTo(arc.x1,arc.y1);
  for(let i=1;i<segments;i++){
   const t=i/segments;const wobble=Math.sin((arc.seed+i*17.31)*2.13)*offsetScale*(1-Math.abs(t-.5)*.8);
   ctx.lineTo(arc.x1+dx*t+nx*wobble,arc.y1+dy*t+ny*wobble);
  }
  ctx.lineTo(arc.x2,arc.y2);ctx.lineWidth=width;ctx.strokeStyle=`rgba(175,${arc.level===3?155:225},255,${alpha*fade})`;ctx.stroke();
 };
 const lanceScale=arc.lance?1.85:arc.storm?.82:1;ctx.shadowBlur=arc.lance?52:34;ctx.shadowColor=arc.level===3?'#7d5cff':'#5de8ff';drawBolt(24*lanceScale,.16,18*lanceScale);drawBolt(11*lanceScale,.58,14*lanceScale);drawBolt(5.2*lanceScale,.92,10*lanceScale);drawBolt(2.8*lanceScale,1,8*lanceScale);
 ctx.shadowBlur=arc.lance?10:5;ctx.strokeStyle=`rgba(245,255,255,${fade})`;ctx.lineWidth=arc.lance?3.4:1.6;ctx.stroke();ctx.restore();
}

function drawMissile(m){
 const angle=Math.atan2(m.vy,m.vx)+Math.PI/2;
 ctx.save();ctx.translate(m.x,m.y);ctx.rotate(angle);
 if(m.awakening==='missile_cluster'){
  if(m.clusterChild){
   const pulse=.75+Math.sin(elapsed*26+m.x*.04)*.2;
   ctx.save();ctx.globalCompositeOperation='lighter';ctx.shadowBlur=15;ctx.shadowColor='#58f4ff';ctx.fillStyle=`rgba(184,255,255,${pulse})`;ctx.beginPath();ctx.moveTo(0,-8);ctx.lineTo(-5,1);ctx.lineTo(0,7);ctx.lineTo(5,1);ctx.closePath();ctx.fill();ctx.fillStyle='#3d8dff';ctx.beginPath();ctx.arc(0,0,2.2,0,Math.PI*2);ctx.fill();ctx.strokeStyle='rgba(92,238,255,.55)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,7);ctx.lineTo(0,15);ctx.stroke();ctx.restore();ctx.restore();return;
  }
  const flame=15+Math.sin(elapsed*32+m.x*.03)*2.5;
  ctx.save();ctx.globalCompositeOperation='lighter';ctx.shadowBlur=22;ctx.shadowColor='#45eaff';for(const ox of [-6,0,6]){const g=ctx.createLinearGradient(ox,9,ox,9+flame);g.addColorStop(0,'#f3ffff');g.addColorStop(.28,'#62efff');g.addColorStop(1,'rgba(43,92,255,0)');ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(ox-2,8);ctx.lineTo(ox+2,8);ctx.lineTo(ox,9+flame);ctx.closePath();ctx.fill()}ctx.restore();
  ctx.shadowBlur=18;ctx.shadowColor='#62eaff';ctx.fillStyle='#dffcff';ctx.beginPath();ctx.moveTo(0,-17);ctx.lineTo(-7,-7);ctx.lineTo(-12,3);ctx.lineTo(-7,11);ctx.lineTo(0,7);ctx.lineTo(7,11);ctx.lineTo(12,3);ctx.lineTo(7,-7);ctx.closePath();ctx.fill();ctx.fillStyle='#24578a';ctx.beginPath();ctx.moveTo(-7,-7);ctx.lineTo(-16,1);ctx.lineTo(-10,8);ctx.lineTo(-4,3);ctx.closePath();ctx.fill();ctx.beginPath();ctx.moveTo(7,-7);ctx.lineTo(16,1);ctx.lineTo(10,8);ctx.lineTo(4,3);ctx.closePath();ctx.fill();ctx.fillStyle='#6cf5ff';for(const ox of [-6,6]){ctx.beginPath();ctx.arc(ox,1,2.3,0,Math.PI*2);ctx.fill()}ctx.restore();return;
 }
 if(m.awakening==='missile_hunter'){
  const pulse=.72+Math.sin(elapsed*8)*.22,flame=22+Math.sin(elapsed*26)*3;
  ctx.save();ctx.globalCompositeOperation='lighter';ctx.shadowBlur=28;ctx.shadowColor='#ff3b32';const g=ctx.createLinearGradient(0,14,0,14+flame);g.addColorStop(0,'#fff3c7');g.addColorStop(.25,'#ff7c2d');g.addColorStop(.65,'#ff2b35');g.addColorStop(1,'rgba(130,0,20,0)');ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(-6,12);ctx.lineTo(6,12);ctx.lineTo(0,14+flame);ctx.closePath();ctx.fill();ctx.restore();
  ctx.shadowBlur=22;ctx.shadowColor='#ff5348';ctx.fillStyle='#f2e8dc';ctx.beginPath();ctx.moveTo(0,-24);ctx.lineTo(-8,-10);ctx.lineTo(-9,12);ctx.lineTo(9,12);ctx.lineTo(8,-10);ctx.closePath();ctx.fill();ctx.fillStyle='#7b1f2a';ctx.beginPath();ctx.moveTo(-8,-7);ctx.lineTo(-19,8);ctx.lineTo(-8,5);ctx.closePath();ctx.fill();ctx.beginPath();ctx.moveTo(8,-7);ctx.lineTo(19,8);ctx.lineTo(8,5);ctx.closePath();ctx.fill();ctx.fillStyle=`rgba(255,45,54,${pulse})`;ctx.beginPath();ctx.arc(0,-8,4.5,0,Math.PI*2);ctx.fill();ctx.strokeStyle=`rgba(255,98,68,${.45*pulse})`;ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(0,-8,9+Math.sin(elapsed*7)*2,0,Math.PI*2);ctx.stroke();ctx.restore();return;
 }
 ctx.save();ctx.globalCompositeOperation='lighter';ctx.shadowBlur=17;ctx.shadowColor='#ff9d3d';const flame=10+Math.sin(elapsed*30+m.x)*2;const g=ctx.createLinearGradient(0,7,0,7+flame);g.addColorStop(0,'#fff6cf');g.addColorStop(.35,'#ffb340');g.addColorStop(1,'rgba(255,70,20,0)');ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(-3,6);ctx.lineTo(3,6);ctx.lineTo(0,7+flame);ctx.closePath();ctx.fill();ctx.restore();
 ctx.shadowBlur=9;ctx.shadowColor='#72e9ff';ctx.fillStyle='#dceaf1';ctx.beginPath();ctx.moveTo(0,-11);ctx.lineTo(-4,-3);ctx.lineTo(-3,7);ctx.lineTo(3,7);ctx.lineTo(4,-3);ctx.closePath();ctx.fill();ctx.fillStyle='#52768d';ctx.beginPath();ctx.moveTo(-3,1);ctx.lineTo(-9,7);ctx.lineTo(-3,6);ctx.closePath();ctx.fill();ctx.beginPath();ctx.moveTo(3,1);ctx.lineTo(9,7);ctx.lineTo(3,6);ctx.closePath();ctx.fill();ctx.fillStyle=m.level===3?'#b998ff':'#62e9ff';ctx.beginPath();ctx.arc(0,-3,2.2,0,Math.PI*2);ctx.fill();ctx.save();ctx.globalCompositeOperation='lighter';const lockColor=m.level===3?'#b88cff':'#5ceaff',lockPulse=.6+.4*Math.sin(elapsed*13+(m.x||0)*.02);ctx.globalAlpha=.45+.3*lockPulse;ctx.strokeStyle=lockColor;ctx.shadowBlur=13;ctx.shadowColor=lockColor;ctx.lineWidth=1.2;ctx.beginPath();ctx.arc(0,-2,9+lockPulse*2,Math.PI*.15,Math.PI*.85);ctx.stroke();ctx.beginPath();ctx.arc(0,-2,9+lockPulse*2,Math.PI*1.15,Math.PI*1.85);ctx.stroke();ctx.restore();ctx.restore();
}

function drawBarrierWave(wave){
 const progress=1-Math.max(0,wave.life)/wave.maxLife;
 const fade=Math.pow(Math.max(0,1-progress),.62);
 ctx.save();ctx.translate(wave.x,wave.y);ctx.globalCompositeOperation='lighter';
 const glow=ctx.createRadialGradient(0,0,Math.max(0,wave.radius-48),0,0,wave.radius+34);
 glow.addColorStop(0,wave.temporalEcho?'rgba(114,64,255,0)':'rgba(46,92,255,0)');glow.addColorStop(.55,`rgba(72,213,255,${.07*fade})`);glow.addColorStop(.82,`rgba(140,112,255,${.19*fade})`);glow.addColorStop(1,'rgba(205,252,255,0)');
 ctx.fillStyle=glow;ctx.beginPath();ctx.arc(0,0,wave.radius+34,0,Math.PI*2);ctx.fill();
 ctx.shadowBlur=30;ctx.shadowColor=wave.temporalEcho?'#8c5cff':'#62e9ff';ctx.strokeStyle=wave.temporalEcho?`rgba(220,191,255,${.95*fade})`:`rgba(205,253,255,${.9*fade})`;ctx.lineWidth=2.6+4*(1-progress);ctx.beginPath();ctx.arc(0,0,wave.radius,0,Math.PI*2);ctx.stroke();
 ctx.shadowBlur=18;ctx.strokeStyle=`rgba(113,92,255,${.68*fade})`;ctx.lineWidth=8;ctx.beginPath();ctx.arc(0,0,Math.max(2,wave.radius-9),0,Math.PI*2);ctx.stroke();
 for(let i=0;i<14;i++){
  const a=i*Math.PI*2/14+progress*1.9;
  const inner=Math.max(10,wave.radius-22-(i%3)*5),outer=wave.radius+8+(i%2)*6;
  ctx.strokeStyle=`rgba(${i%2?126:91},${i%2?113:228},255,${.38*fade})`;ctx.lineWidth=1.2;
  ctx.beginPath();ctx.moveTo(Math.cos(a)*inner,Math.sin(a)*inner);ctx.lineTo(Math.cos(a+.025)*outer,Math.sin(a+.025)*outer);ctx.stroke();
 }
 if(progress<.34){
  const coreFade=1-progress/.34;const coreRadius=24+progress*95;
  const core=ctx.createRadialGradient(0,0,0,0,0,coreRadius);core.addColorStop(0,`rgba(235,255,255,${.48*coreFade})`);core.addColorStop(.3,`rgba(80,229,255,${.24*coreFade})`);core.addColorStop(1,'rgba(81,70,255,0)');ctx.fillStyle=core;ctx.beginPath();ctx.arc(0,0,coreRadius,0,Math.PI*2);ctx.fill();
 }
 ctx.restore();
}


function drawHeavyEscortShield(){
 if(!build||build.heavyEscortShieldActive<=0)return;
 const escorts=drones.filter(d=>d.mode==='drone_heavy');if(escorts.length<2)return;
 const fade=Math.min(1,build.heavyEscortShieldActive/.38);
 const cx=player.x,cy=player.y-70,width=190,height=86;
 drawShieldSprite(ctx,shieldSpriteAssets.escort,cx,cy,width,height,.78+.18*fade);
}

function drawAwakenedFrontShield(){
 if(!build||build.awakeFrontShieldActive<=0)return;
 const remain=build.awakeFrontShieldActive,fade=Math.min(1,remain/.42),pulse=.88+.12*Math.sin(elapsed*9.5),cx=player.x,cy=player.y-78;
 ctx.save();ctx.translate(cx,cy);ctx.globalCompositeOperation='lighter';ctx.globalAlpha=fade;
 const g=ctx.createLinearGradient(-118,0,118,0);g.addColorStop(0,'rgba(75,105,255,.08)');g.addColorStop(.24,'rgba(82,226,255,.72)');g.addColorStop(.5,'rgba(238,255,255,.98)');g.addColorStop(.76,'rgba(82,226,255,.72)');g.addColorStop(1,'rgba(75,105,255,.08)');
 ctx.shadowBlur=30;ctx.shadowColor='#6aeaff';ctx.strokeStyle=g;ctx.lineWidth=8*pulse;ctx.lineCap='round';ctx.beginPath();ctx.arc(0,52,118,Math.PI*1.18,Math.PI*1.82);ctx.stroke();
 ctx.shadowBlur=12;ctx.strokeStyle='rgba(228,255,255,.92)';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,52,105,Math.PI*1.2,Math.PI*1.8);ctx.stroke();
 ctx.setLineDash([7,9]);ctx.strokeStyle='rgba(112,155,255,.55)';ctx.lineWidth=1.2;ctx.beginPath();ctx.arc(0,52,126,Math.PI*1.16,Math.PI*1.84);ctx.stroke();ctx.setLineDash([]);
 ctx.restore();
}

function drawDrone(d){
 const pos=dronePosition(d),bank=d.bank||0,recoil=(d.recoil||0)*1.4;
 ctx.save();ctx.translate(pos.x,pos.y+recoil);ctx.rotate(-bank*.09);
 if(shipSpriteReady(shipSpriteAssets.drone)){
  const swarm=d.mode==='drone_swarm',heavy=d.mode==='drone_heavy',width=heavy?64:swarm?34:46,height=heavy?58:swarm?31:42;
  const droneImage=getMobileRenderSprite(heavy?getTintedShipSprite(shipSpriteAssets.drone,'#6c87c8',.2):swarm?getTintedShipSprite(shipSpriteAssets.drone,'#62efff',.16):shipSpriteAssets.drone);
  ctx.save();ctx.globalAlpha=.99;ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.drawImage(droneImage,-width/2,-height/2,width,height);ctx.restore();
  ctx.save();ctx.globalCompositeOperation='lighter';ctx.shadowBlur=heavy?15:10;ctx.shadowColor='#59ddff';ctx.fillStyle='#dfffff';const engineY=height*.39;for(const engineX of heavy?[-11,11]:[-7,7]){ctx.beginPath();ctx.ellipse(engineX,engineY,heavy?2.2:1.5,heavy?6:4,0,0,Math.PI*2);ctx.fill()}ctx.restore();ctx.restore();return;
 }
 if(d.mode==='drone_swarm'){
  const scale=.68+(d.slot%2)*.04;ctx.scale(scale,scale);
  ctx.save();ctx.translate(bank*2,11);ctx.scale(1,.3);ctx.filter='blur(4px)';ctx.globalAlpha=.2;ctx.fillStyle='#000';ctx.beginPath();ctx.ellipse(0,0,12,5,0,0,Math.PI*2);ctx.fill();ctx.restore();
  const flame=6+Math.sin(elapsed*25+(d.slot||0)*1.4)*1.4;
  ctx.save();ctx.globalCompositeOperation='lighter';ctx.shadowBlur=11;ctx.shadowColor='#74f2ff';const fg=ctx.createLinearGradient(0,6,0,6+flame);fg.addColorStop(0,'#f6ffff');fg.addColorStop(.35,'rgba(71,231,255,.95)');fg.addColorStop(1,'rgba(44,90,255,0)');ctx.fillStyle=fg;ctx.beginPath();ctx.moveTo(-2,6);ctx.lineTo(2,6);ctx.lineTo(0,6+flame);ctx.closePath();ctx.fill();ctx.restore();
  ctx.shadowBlur=13;ctx.shadowColor='rgba(86,238,255,.7)';ctx.fillStyle='#dffbff';ctx.beginPath();ctx.moveTo(0,-12);ctx.lineTo(-4,-5);ctx.lineTo(-13,-1);ctx.lineTo(-8,3);ctx.lineTo(-4,1);ctx.lineTo(0,8);ctx.lineTo(4,1);ctx.lineTo(8,3);ctx.lineTo(13,-1);ctx.lineTo(4,-5);ctx.closePath();ctx.fill();
  ctx.fillStyle='#214866';ctx.beginPath();ctx.moveTo(-4,-5);ctx.lineTo(-13,-1);ctx.lineTo(-8,3);ctx.lineTo(-1,0);ctx.closePath();ctx.fill();ctx.beginPath();ctx.moveTo(4,-5);ctx.lineTo(13,-1);ctx.lineTo(8,3);ctx.lineTo(1,0);ctx.closePath();ctx.fill();
  ctx.save();ctx.globalCompositeOperation='lighter';ctx.shadowBlur=12;ctx.shadowColor='#6ff4ff';ctx.fillStyle='#efffff';ctx.beginPath();ctx.arc(0,-2,3.4,0,Math.PI*2);ctx.fill();ctx.fillStyle='#37bfff';ctx.beginPath();ctx.arc(0,-2,2,0,Math.PI*2);ctx.fill();ctx.restore();
  ctx.fillStyle='#9eeeff';ctx.fillRect(-1.4,-14,2.8,5);ctx.restore();return;
 }
 if(d.mode==='drone_heavy'){
  ctx.scale(.82,.82);
  ctx.save();ctx.translate(bank*2,18);ctx.scale(1,.3);ctx.filter='blur(6px)';ctx.globalAlpha=.28;ctx.fillStyle='#000';ctx.beginPath();ctx.ellipse(0,0,21,8,0,0,Math.PI*2);ctx.fill();ctx.restore();
  for(const ox of [-7,7]){const flame=11+Math.sin(elapsed*19+(d.slot||0)*1.8+ox)*1.8;ctx.save();ctx.globalCompositeOperation='lighter';ctx.shadowBlur=15;ctx.shadowColor='#5ecfff';const fg=ctx.createLinearGradient(ox,10,ox,10+flame);fg.addColorStop(0,'#fff');fg.addColorStop(.32,'#54dbff');fg.addColorStop(1,'rgba(39,76,255,0)');ctx.fillStyle=fg;ctx.beginPath();ctx.moveTo(ox-2.5,9);ctx.lineTo(ox+2.5,9);ctx.lineTo(ox,10+flame);ctx.closePath();ctx.fill();ctx.restore();}
  ctx.shadowBlur=16;ctx.shadowColor='rgba(72,184,255,.6)';const hull=ctx.createLinearGradient(0,-22,0,15);hull.addColorStop(0,'#eefaff');hull.addColorStop(.45,'#6d95b7');hull.addColorStop(1,'#1d354d');ctx.fillStyle=hull;ctx.beginPath();ctx.moveTo(0,-23);ctx.lineTo(-8,-13);ctx.lineTo(-24,-8);ctx.lineTo(-28,1);ctx.lineTo(-16,8);ctx.lineTo(-9,6);ctx.lineTo(-5,15);ctx.lineTo(0,11);ctx.lineTo(5,15);ctx.lineTo(9,6);ctx.lineTo(16,8);ctx.lineTo(28,1);ctx.lineTo(24,-8);ctx.lineTo(8,-13);ctx.closePath();ctx.fill();
  ctx.fillStyle='#22364d';ctx.beginPath();ctx.moveTo(-22,-6);ctx.lineTo(-27,1);ctx.lineTo(-15,6);ctx.lineTo(-5,2);ctx.closePath();ctx.fill();ctx.beginPath();ctx.moveTo(22,-6);ctx.lineTo(27,1);ctx.lineTo(15,6);ctx.lineTo(5,2);ctx.closePath();ctx.fill();
  ctx.fillStyle='#0e1b2d';ctx.fillRect(-5,-24,10,15);ctx.fillStyle='#dffaff';ctx.fillRect(-2.5,-27,5,10);ctx.save();ctx.globalCompositeOperation='lighter';ctx.shadowBlur=17;ctx.shadowColor='#63e8ff';ctx.fillStyle='#eaffff';ctx.beginPath();ctx.arc(0,-4,5.5,0,Math.PI*2);ctx.fill();ctx.fillStyle='#26aee9';ctx.beginPath();ctx.arc(0,-4,3.2,0,Math.PI*2);ctx.fill();ctx.restore();ctx.restore();return;
 }
 // Standard drone model.
 ctx.save();ctx.translate(bank*2,13);ctx.scale(1,.32);ctx.filter='blur(5px)';ctx.globalAlpha=.24;ctx.fillStyle='#000';ctx.beginPath();ctx.ellipse(0,0,13,7,0,0,Math.PI*2);ctx.fill();ctx.restore();
 const flame=8+Math.sin(elapsed*22+(d.slot||0)*1.7)*1.5;
 ctx.save();ctx.globalCompositeOperation='lighter';ctx.shadowBlur=12;ctx.shadowColor='#2ccfff';
 const fg=ctx.createLinearGradient(0,7,0,7+flame);fg.addColorStop(0,'rgba(235,255,255,.95)');fg.addColorStop(.35,'rgba(55,221,255,.9)');fg.addColorStop(1,'rgba(25,92,255,0)');ctx.fillStyle=fg;
 ctx.beginPath();ctx.moveTo(-2.8,7);ctx.lineTo(2.8,7);ctx.lineTo(0,7+flame);ctx.closePath();ctx.fill();ctx.restore();
 ctx.shadowBlur=10;ctx.shadowColor='rgba(73,211,255,.55)';ctx.fillStyle='#dfeef7';
 ctx.beginPath();ctx.moveTo(0,-13);ctx.lineTo(-5,-5);ctx.lineTo(-15,-2);ctx.lineTo(-10,3);ctx.lineTo(-5,2);ctx.lineTo(-7,10);ctx.lineTo(0,7);ctx.lineTo(7,10);ctx.lineTo(5,2);ctx.lineTo(10,3);ctx.lineTo(15,-2);ctx.lineTo(5,-5);ctx.closePath();ctx.fill();
 ctx.shadowBlur=0;ctx.fillStyle='#48677f';ctx.beginPath();ctx.moveTo(-5,-5);ctx.lineTo(-15,-2);ctx.lineTo(-10,3);ctx.lineTo(-3,1);ctx.closePath();ctx.fill();ctx.beginPath();ctx.moveTo(5,-5);ctx.lineTo(15,-2);ctx.lineTo(10,3);ctx.lineTo(3,1);ctx.closePath();ctx.fill();
 ctx.fillStyle='#13273b';ctx.beginPath();ctx.arc(0,-1,7.5,0,Math.PI*2);ctx.fill();ctx.save();ctx.globalCompositeOperation='lighter';ctx.shadowBlur=14;ctx.shadowColor='#4ce7ff';ctx.fillStyle='#d9ffff';ctx.beginPath();ctx.arc(0,-2,4.5,0,Math.PI*2);ctx.fill();ctx.fillStyle='#35bfff';ctx.beginPath();ctx.arc(0,-2,2.8,0,Math.PI*2);ctx.fill();ctx.restore();ctx.fillStyle='#a9c9da';ctx.fillRect(-2,-14,4,6);ctx.fillStyle='#70edff';ctx.fillRect(-1,-15,2,4);ctx.restore();
}

let enemyModelCtx=ctx;
function enemyEngineFlame(x,y,color,size=1,phase=0){
 const flame=(8+Math.sin(elapsed*23+phase)*2.2)*size;
 enemyModelCtx.save();enemyModelCtx.globalCompositeOperation='lighter';enemyModelCtx.shadowBlur=14*size;enemyModelCtx.shadowColor=color;
 const g=enemyModelCtx.createLinearGradient(x,y,x,y+flame);g.addColorStop(0,'rgba(255,255,255,.98)');g.addColorStop(.3,color);g.addColorStop(1,'rgba(20,40,255,0)');enemyModelCtx.fillStyle=g;
 enemyModelCtx.beginPath();enemyModelCtx.moveTo(x-2.1*size,y);enemyModelCtx.lineTo(x+2.1*size,y);enemyModelCtx.lineTo(x,y+flame);enemyModelCtx.closePath();enemyModelCtx.fill();enemyModelCtx.restore();
}
function enemyPanelLine(points,color='rgba(255,255,255,.25)',width=1){enemyModelCtx.strokeStyle=color;enemyModelCtx.lineWidth=width;enemyModelCtx.beginPath();enemyModelCtx.moveTo(points[0][0],points[0][1]);for(let i=1;i<points.length;i++)enemyModelCtx.lineTo(points[i][0],points[i][1]);enemyModelCtx.stroke();}
function enemyCore(x,y,r,color,pulse=1){enemyModelCtx.save();enemyModelCtx.globalCompositeOperation='lighter';enemyModelCtx.shadowBlur=18;enemyModelCtx.shadowColor=color;enemyModelCtx.fillStyle='rgba(245,255,255,.96)';enemyModelCtx.beginPath();enemyModelCtx.arc(x,y,r,0,Math.PI*2);enemyModelCtx.fill();enemyModelCtx.globalAlpha=.72+.28*pulse;enemyModelCtx.fillStyle=color;enemyModelCtx.beginPath();enemyModelCtx.arc(x,y,r*.62,0,Math.PI*2);enemyModelCtx.fill();enemyModelCtx.restore();}
function drawTexturedEnemyOnly(e,pulse,hpRatio){
 const image=e.boss?shipSpriteAssets.boss:e.bossGuard?shipSpriteAssets.guard:(shipSpriteAssets.enemies[e.type]||shipSpriteAssets.enemies.scout);if(!shipSpriteReady(image))return false;const bossProfile=e.boss?bossVisualProfile(e):null,renderImage=getMobileRenderSprite(e.boss?getTintedShipSprite(image,bossProfile.tint,e.awakenedBoss?.27:.17):image);
 const [width,height]=e.boss?[196,144]:e.bossGuard?[78,66]:(enemySpriteSizes[e.type]||enemySpriteSizes.scout);
 if(e.shield>0){const shieldPulse=1+Math.sin(e.age*6)*.025,shieldAlpha=.48+.28*Math.min(1,e.shield/Math.max(1,e.maxShield||e.shield));enemyModelCtx.save();enemyModelCtx.scale(1,-1);if(!drawShieldSprite(enemyModelCtx,shieldSpriteAssets.enemy,0,0,(width+24)*shieldPulse,(Math.max(width,height)+24)*shieldPulse,shieldAlpha,elapsed*.06)){enemyModelCtx.strokeStyle='rgba(91,224,255,.85)';enemyModelCtx.lineWidth=3;enemyModelCtx.beginPath();enemyModelCtx.arc(0,0,e.r+9,0,Math.PI*2);enemyModelCtx.stroke()}enemyModelCtx.restore()}
 const entryProgress=e.bossEntering?Math.min(1,(e.bossEntryTime||0)/1.7):1,entryPulse=.72+.28*Math.sin(elapsed*18);
 const spriteAlpha=e.bossRetreating?Math.max(.14,Math.min(1,(e.retreatTime||0)/1.6))*(.7+.3*Math.sin(elapsed*24)):e.bossEntering?(.22+.77*entryProgress)*entryPulse:.99;
 enemyModelCtx.save();enemyModelCtx.scale(1,-1);if(e.bossEntering){const entryScale=.78+.22*(1-Math.pow(1-entryProgress,3));enemyModelCtx.scale(entryScale,entryScale)}enemyModelCtx.globalAlpha=spriteAlpha;enemyModelCtx.imageSmoothingEnabled=true;enemyModelCtx.imageSmoothingQuality='high';enemyModelCtx.drawImage(renderImage,-width/2,-height/2,width,height);enemyModelCtx.restore();
 const coreColor=e.boss?(e.awakenedBoss?'#ff5fd7':bossProfile.core):e.bossGuard?'#ff79dc':e.type==='support'?'#5deaff':e.type==='sniper'||e.type==='raider'?'#ffe171':e.type==='carrier'||e.type==='jammer'?'#c477ff':e.type==='heavy'||e.type==='barrage'?'#ff9b45':'#ff526f';if(e.boss)drawBossStageDetails(e,bossProfile,pulse);enemyCore(0,e.boss?-4:-3,e.boss?8:Math.max(3.2,width*.075),coreColor,pulse);return true;
}
function drawEnemyShip(e,targetCtx=null){
 const previousEnemyModelCtx=enemyModelCtx;if(targetCtx)enemyModelCtx=targetCtx;
 if(e.eventMeteor){enemyModelCtx.save();enemyModelCtx.translate(e.x,e.y);enemyModelCtx.rotate(elapsed*.35);enemyModelCtx.globalCompositeOperation='lighter';enemyModelCtx.shadowBlur=30;enemyModelCtx.shadowColor='#b78cff';const g=enemyModelCtx.createRadialGradient(0,0,2,0,0,e.r);g.addColorStop(0,'#ffffff');g.addColorStop(.18,'#9ff5ff');g.addColorStop(.52,'#9d69ff');g.addColorStop(1,'rgba(84,32,145,.15)');enemyModelCtx.fillStyle=g;enemyModelCtx.beginPath();for(let i=0;i<10;i++){const a=i*Math.PI/5,r=e.r*(i%2?0.66:1);const x=Math.cos(a)*r,y=Math.sin(a)*r;i?enemyModelCtx.lineTo(x,y):enemyModelCtx.moveTo(x,y)}enemyModelCtx.closePath();enemyModelCtx.fill();enemyModelCtx.strokeStyle='rgba(222,246,255,.8)';enemyModelCtx.lineWidth=2;enemyModelCtx.beginPath();enemyModelCtx.arc(0,0,e.r+9,elapsed,-elapsed+Math.PI*1.55);enemyModelCtx.stroke();enemyModelCtx.restore();enemyModelCtx=previousEnemyModelCtx;return}
 enemyModelCtx.save();enemyModelCtx.translate(e.x,e.y);enemyModelCtx.scale(1,-1);if(e.boss){const bossVisualScale=Math.max(1.18,Math.min(1.55,(e.r||70)/58));enemyModelCtx.scale(bossVisualScale,bossVisualScale)}if(e.eventMirror){enemyModelCtx.save();enemyModelCtx.globalCompositeOperation='lighter';enemyModelCtx.strokeStyle='rgba(120,103,255,.82)';enemyModelCtx.shadowBlur=17;enemyModelCtx.shadowColor='#7060ff';enemyModelCtx.lineWidth=2;enemyModelCtx.setLineDash([7,5]);enemyModelCtx.beginPath();enemyModelCtx.arc(0,0,(e.r||22)+9+Math.sin(e.age*6)*2,0,Math.PI*2);enemyModelCtx.stroke();enemyModelCtx.setLineDash([]);enemyModelCtx.restore();}if(e.huntTarget){const bountyScale=1.18;enemyModelCtx.scale(bountyScale,bountyScale);enemyModelCtx.save();enemyModelCtx.globalCompositeOperation='lighter';enemyModelCtx.strokeStyle=e.enraged?'rgba(255,178,55,.8)':'rgba(255,53,92,.72)';enemyModelCtx.lineWidth=2;enemyModelCtx.shadowBlur=18;enemyModelCtx.shadowColor=e.enraged?'#ffb13b':'#ff355c';enemyModelCtx.beginPath();enemyModelCtx.arc(0,0,(e.r||28)+7+Math.sin(elapsed*5)*2,0,Math.PI*2);enemyModelCtx.stroke();enemyModelCtx.restore();}const pulse=.72+.28*Math.sin(e.age*7);const hpRatio=Math.max(0,e.hp/e.max);
 if(e.bossGuard){if(drawTexturedEnemyOnly(e,pulse,hpRatio)){enemyModelCtx.restore();enemyModelCtx=previousEnemyModelCtx;return;}enemyModelCtx.shadowBlur=18;enemyModelCtx.shadowColor='#7c8dff';enemyModelCtx.fillStyle='#29345f';enemyModelCtx.beginPath();enemyModelCtx.moveTo(0,-28);enemyModelCtx.lineTo(32,-5);enemyModelCtx.lineTo(24,24);enemyModelCtx.lineTo(-24,24);enemyModelCtx.lineTo(-32,-5);enemyModelCtx.closePath();enemyModelCtx.fill();enemyCore(0,0,7,'#9bb5ff',pulse);enemyModelCtx.restore();enemyModelCtx=previousEnemyModelCtx;return;}
 if(drawTexturedEnemyOnly(e,pulse,hpRatio)){enemyModelCtx.restore();enemyModelCtx=previousEnemyModelCtx;return;}
 if(e.boss){
  const bossKind=e.bossKind||'rift';const bossColor=bossKind==='fortress'?'#ff6248':bossKind==='seraph'?'#d06cff':bossKind==='omega'?'#ffb43b':'#8e62ff';const bossLight=bossKind==='fortress'?'#ffd0bd':bossKind==='seraph'?'#f0d0ff':bossKind==='omega'?'#fff0a6':'#d7ccff';
  enemyEngineFlame(-27,34,bossColor,1.25,0);enemyEngineFlame(0,42,bossLight,1.45,1);enemyEngineFlame(27,34,bossColor,1.25,2);
  enemyModelCtx.shadowBlur=25;enemyModelCtx.shadowColor=bossColor;let g=enemyModelCtx.createLinearGradient(0,-52,0,50);g.addColorStop(0,bossLight);g.addColorStop(.34,bossColor);g.addColorStop(1,'#241735');enemyModelCtx.fillStyle=g;
  enemyModelCtx.beginPath();enemyModelCtx.moveTo(0,-56);enemyModelCtx.lineTo(-13,-30);enemyModelCtx.lineTo(-38,-43);enemyModelCtx.lineTo(-58,-9);enemyModelCtx.lineTo(-48,24);enemyModelCtx.lineTo(-24,17);enemyModelCtx.lineTo(-12,45);enemyModelCtx.lineTo(0,36);enemyModelCtx.lineTo(12,45);enemyModelCtx.lineTo(24,17);enemyModelCtx.lineTo(48,24);enemyModelCtx.lineTo(58,-9);enemyModelCtx.lineTo(38,-43);enemyModelCtx.lineTo(13,-30);enemyModelCtx.closePath();enemyModelCtx.fill();
  enemyModelCtx.shadowBlur=0;enemyModelCtx.fillStyle='#1a1028';enemyModelCtx.beginPath();enemyModelCtx.moveTo(-39,-30);enemyModelCtx.lineTo(-51,-7);enemyModelCtx.lineTo(-42,14);enemyModelCtx.lineTo(-20,8);enemyModelCtx.lineTo(-10,-18);enemyModelCtx.closePath();enemyModelCtx.fill();enemyModelCtx.beginPath();enemyModelCtx.moveTo(39,-30);enemyModelCtx.lineTo(51,-7);enemyModelCtx.lineTo(42,14);enemyModelCtx.lineTo(20,8);enemyModelCtx.lineTo(10,-18);enemyModelCtx.closePath();enemyModelCtx.fill();
  enemyModelCtx.fillStyle='#ad91e4';enemyModelCtx.beginPath();enemyModelCtx.moveTo(0,-49);enemyModelCtx.lineTo(-8,-22);enemyModelCtx.lineTo(-7,22);enemyModelCtx.lineTo(0,35);enemyModelCtx.lineTo(7,22);enemyModelCtx.lineTo(8,-22);enemyModelCtx.closePath();enemyModelCtx.fill();
  enemyPanelLine([[-39,-28],[-20,-7],[-11,20]],'rgba(230,217,255,.4)',1.4);enemyPanelLine([[39,-28],[20,-7],[11,20]],'rgba(230,217,255,.4)',1.4);
  enemyCore(0,-4,12,bossColor,pulse);for(const x of [-31,31])enemyCore(x,-8,5,bossLight,pulse);if(bossKind==='fortress'){enemyModelCtx.fillStyle='#5a1713';enemyModelCtx.fillRect(-58,-2,18,12);enemyModelCtx.fillRect(40,-2,18,12)}else if(bossKind==='seraph'){enemyModelCtx.strokeStyle=bossLight;enemyModelCtx.lineWidth=3;enemyModelCtx.beginPath();enemyModelCtx.arc(0,-8,48,0,Math.PI*2);enemyModelCtx.stroke()}else if(bossKind==='omega'){enemyModelCtx.rotate(elapsed*.35);enemyModelCtx.strokeStyle=bossLight;enemyModelCtx.lineWidth=4;enemyModelCtx.beginPath();for(let i=0;i<8;i++){const a=i*Math.PI/4,rr=i%2?38:54;i?enemyModelCtx.lineTo(Math.cos(a)*rr,Math.sin(a)*rr):enemyModelCtx.moveTo(Math.cos(a)*rr,Math.sin(a)*rr)}enemyModelCtx.closePath();enemyModelCtx.stroke()}
  if(shipSpriteReady(shipSpriteAssets.boss)){enemyModelCtx.save();enemyModelCtx.scale(1,-1);enemyModelCtx.globalAlpha=.97;enemyModelCtx.drawImage(shipSpriteAssets.boss,-58,-88,116,176);enemyModelCtx.restore();enemyCore(0,-4,8,bossColor,pulse)}
  enemyModelCtx.restore();enemyModelCtx=previousEnemyModelCtx;return;
 }
 if(e.shield>0){enemyModelCtx.save();enemyModelCtx.globalCompositeOperation='lighter';enemyModelCtx.strokeStyle='rgba(91,224,255,.8)';enemyModelCtx.lineWidth=2.5;enemyModelCtx.shadowBlur=13;enemyModelCtx.shadowColor='#57ddff';enemyModelCtx.beginPath();enemyModelCtx.arc(0,0,e.r+7+Math.sin(e.age*5)*2,0,Math.PI*2);enemyModelCtx.stroke();enemyModelCtx.restore();}
 if(e.type==='heavy'){
  enemyEngineFlame(-12,22,'#ff9b45',1.15,0);enemyEngineFlame(12,22,'#ff9b45',1.15,2);
  let g=enemyModelCtx.createLinearGradient(0,-28,0,30);g.addColorStop(0,'#f2aa63');g.addColorStop(.42,'#a85231');g.addColorStop(1,'#3c1d1b');enemyModelCtx.shadowBlur=15;enemyModelCtx.shadowColor='#ff8a42';enemyModelCtx.fillStyle=g;
  enemyModelCtx.beginPath();enemyModelCtx.moveTo(0,-30);enemyModelCtx.lineTo(-12,-20);enemyModelCtx.lineTo(-31,-12);enemyModelCtx.lineTo(-32,10);enemyModelCtx.lineTo(-18,24);enemyModelCtx.lineTo(-7,18);enemyModelCtx.lineTo(0,28);enemyModelCtx.lineTo(7,18);enemyModelCtx.lineTo(18,24);enemyModelCtx.lineTo(32,10);enemyModelCtx.lineTo(31,-12);enemyModelCtx.lineTo(12,-20);enemyModelCtx.closePath();enemyModelCtx.fill();
  enemyModelCtx.shadowBlur=0;enemyModelCtx.fillStyle='#47221d';enemyModelCtx.fillRect(-27,-6,9,20);enemyModelCtx.fillRect(18,-6,9,20);enemyModelCtx.fillStyle='#d67a42';enemyModelCtx.beginPath();enemyModelCtx.moveTo(-13,-18);enemyModelCtx.lineTo(-6,17);enemyModelCtx.lineTo(0,24);enemyModelCtx.lineTo(6,17);enemyModelCtx.lineTo(13,-18);enemyModelCtx.closePath();enemyModelCtx.fill();enemyCore(0,-7,5,'#ffb05b',pulse);enemyPanelLine([[-27,0],[-15,-12],[-8,12]],'rgba(255,226,190,.35)');enemyPanelLine([[27,0],[15,-12],[8,12]],'rgba(255,226,190,.35)');
 }else if(e.type==='suicide'){
  const targetAngle=Math.atan2(player.y-e.y,player.x-e.x);enemyModelCtx.rotate(Math.PI/2-targetAngle);
  const armed=e.fuse!=null;const urgency=armed?Math.max(0,1-e.fuse/2.2):0;const alarm=.45+.55*Math.abs(Math.sin(e.age*(armed?18:8)));
  enemyEngineFlame(0,17,armed?'#ffcf4d':'#ff315c',1.4+urgency*.3,0);
  enemyModelCtx.shadowBlur=armed?28:18;enemyModelCtx.shadowColor=armed?'#ff3a22':'#ff3558';
  const body=enemyModelCtx.createLinearGradient(0,-26,0,24);body.addColorStop(0,armed?`rgba(255,${80+Math.floor(95*alarm)},45,1)`:'#a71935');body.addColorStop(.45,armed?'#c92721':'#641329');body.addColorStop(1,armed?'#45100e':'#260914');enemyModelCtx.fillStyle=body;
  enemyModelCtx.beginPath();enemyModelCtx.moveTo(0,-27);enemyModelCtx.lineTo(-8,-18);enemyModelCtx.lineTo(-21,10);enemyModelCtx.lineTo(-10,8);enemyModelCtx.lineTo(-5,19);enemyModelCtx.lineTo(0,25);enemyModelCtx.lineTo(5,19);enemyModelCtx.lineTo(10,8);enemyModelCtx.lineTo(21,10);enemyModelCtx.lineTo(8,-18);enemyModelCtx.closePath();enemyModelCtx.fill();
  enemyModelCtx.fillStyle=armed?`rgba(255,206,80,${.55+.45*alarm})`:'#d53650';enemyModelCtx.beginPath();enemyModelCtx.moveTo(0,-23);enemyModelCtx.lineTo(-7,7);enemyModelCtx.lineTo(0,20);enemyModelCtx.lineTo(7,7);enemyModelCtx.closePath();enemyModelCtx.fill();
  enemyModelCtx.strokeStyle=armed?`rgba(255,238,130,${.65+.35*alarm})`:'rgba(255,110,135,.8)';enemyModelCtx.lineWidth=armed?2.8:1.6;for(const side of [-1,1]){enemyModelCtx.beginPath();enemyModelCtx.moveTo(side*4,-15);enemyModelCtx.lineTo(side*14,8);enemyModelCtx.lineTo(side*8,6);enemyModelCtx.stroke()}
  enemyCore(0,0,armed?7:6,armed?'#ffb62e':'#ff315c',alarm);
  enemyModelCtx.strokeStyle=armed?`rgba(255,86,45,${.75+.25*alarm})`:`rgba(255,130,145,${pulse})`;enemyModelCtx.lineWidth=armed?3.2:1.5;enemyModelCtx.beginPath();enemyModelCtx.arc(0,0,12+urgency*5+Math.sin(e.age*14)*1.5,0,Math.PI*2);enemyModelCtx.stroke();
  if(armed){enemyModelCtx.save();enemyModelCtx.scale(1,-1);enemyModelCtx.rotate(targetAngle-Math.PI/2);enemyModelCtx.font='bold 13px system-ui';enemyModelCtx.textAlign='center';enemyModelCtx.textBaseline='middle';enemyModelCtx.fillStyle='#fff4c2';enemyModelCtx.shadowBlur=9;enemyModelCtx.shadowColor='#ff3b24';enemyModelCtx.fillText(Math.max(0,e.fuse).toFixed(1),0,-34);enemyModelCtx.restore()}
 }else if(e.type==='sniper'){
  enemyEngineFlame(-7,20,'#ffd45a',.8,0);enemyEngineFlame(7,20,'#ffd45a',.8,2);enemyModelCtx.shadowBlur=12;enemyModelCtx.shadowColor='#ffd35a';enemyModelCtx.fillStyle='#4b3a17';enemyModelCtx.beginPath();enemyModelCtx.moveTo(0,-29);enemyModelCtx.lineTo(-8,-16);enemyModelCtx.lineTo(-28,2);enemyModelCtx.lineTo(-18,11);enemyModelCtx.lineTo(-8,7);enemyModelCtx.lineTo(-5,22);enemyModelCtx.lineTo(0,17);enemyModelCtx.lineTo(5,22);enemyModelCtx.lineTo(8,7);enemyModelCtx.lineTo(18,11);enemyModelCtx.lineTo(28,2);enemyModelCtx.lineTo(8,-16);enemyModelCtx.closePath();enemyModelCtx.fill();enemyModelCtx.fillStyle='#c39b37';enemyModelCtx.fillRect(-3,-26,6,42);enemyModelCtx.fillStyle='#f5d978';enemyModelCtx.fillRect(-1.5,-30,3,28);enemyCore(0,-4,4,'#ffe171',pulse);
 }else if(e.type==='support'){
  enemyEngineFlame(-9,18,'#4ce7ff',.85,0);enemyEngineFlame(9,18,'#4ce7ff',.85,2);enemyModelCtx.shadowBlur=15;enemyModelCtx.shadowColor='#4ce7ff';enemyModelCtx.fillStyle='#174455';enemyModelCtx.beginPath();enemyModelCtx.moveTo(0,-25);enemyModelCtx.lineTo(-22,-12);enemyModelCtx.lineTo(-27,8);enemyModelCtx.lineTo(-13,21);enemyModelCtx.lineTo(0,14);enemyModelCtx.lineTo(13,21);enemyModelCtx.lineTo(27,8);enemyModelCtx.lineTo(22,-12);enemyModelCtx.closePath();enemyModelCtx.fill();enemyModelCtx.fillStyle='#2e91a8';enemyModelCtx.beginPath();enemyModelCtx.arc(0,-1,11,0,Math.PI*2);enemyModelCtx.fill();enemyModelCtx.strokeStyle='#b9fbff';enemyModelCtx.lineWidth=2;enemyModelCtx.beginPath();enemyModelCtx.arc(0,-1,15+Math.sin(e.age*5)*2,0,Math.PI*2);enemyModelCtx.stroke();enemyCore(0,-1,5,'#5deaff',pulse);
 }else if(e.type==='barrage'){
  enemyEngineFlame(-15,21,'#ff7a45',1,0);enemyEngineFlame(15,21,'#ff7a45',1,2);enemyModelCtx.shadowBlur=15;enemyModelCtx.shadowColor='#ff7e4c';enemyModelCtx.fillStyle='#4a231d';enemyModelCtx.beginPath();enemyModelCtx.moveTo(0,-29);enemyModelCtx.lineTo(-18,-21);enemyModelCtx.lineTo(-33,-5);enemyModelCtx.lineTo(-29,17);enemyModelCtx.lineTo(-10,24);enemyModelCtx.lineTo(0,17);enemyModelCtx.lineTo(10,24);enemyModelCtx.lineTo(29,17);enemyModelCtx.lineTo(33,-5);enemyModelCtx.lineTo(18,-21);enemyModelCtx.closePath();enemyModelCtx.fill();enemyModelCtx.fillStyle='#a94f31';enemyModelCtx.beginPath();enemyModelCtx.moveTo(0,-24);enemyModelCtx.lineTo(-10,-8);enemyModelCtx.lineTo(-8,18);enemyModelCtx.lineTo(0,14);enemyModelCtx.lineTo(8,18);enemyModelCtx.lineTo(10,-8);enemyModelCtx.closePath();enemyModelCtx.fill();for(const x of [-18,-9,0,9,18]){enemyModelCtx.fillStyle='#1d0e0c';enemyModelCtx.fillRect(x-2,-8,4,17);enemyModelCtx.fillStyle='#ffc27e';enemyModelCtx.fillRect(x-1,-9,2,7)}enemyPanelLine([[-28,6],[-17,-13],[-8,-3]],'rgba(255,190,145,.35)');enemyPanelLine([[28,6],[17,-13],[8,-3]],'rgba(255,190,145,.35)');
 }else if(e.type==='raider'){
  enemyModelCtx.rotate(e.dir>0?Math.PI/2:-Math.PI/2);enemyEngineFlame(0,17,'#ffcf57',1.25,0);enemyModelCtx.shadowBlur=13;enemyModelCtx.shadowColor='#ffcf57';enemyModelCtx.fillStyle='#4a3414';enemyModelCtx.beginPath();enemyModelCtx.moveTo(0,-28);enemyModelCtx.lineTo(-8,-8);enemyModelCtx.lineTo(-17,18);enemyModelCtx.lineTo(0,10);enemyModelCtx.lineTo(17,18);enemyModelCtx.lineTo(8,-8);enemyModelCtx.closePath();enemyModelCtx.fill();enemyModelCtx.fillStyle='#ba852e';enemyModelCtx.beginPath();enemyModelCtx.moveTo(0,-24);enemyModelCtx.lineTo(-4,8);enemyModelCtx.lineTo(0,14);enemyModelCtx.lineTo(4,8);enemyModelCtx.closePath();enemyModelCtx.fill();enemyCore(0,-7,3.8,'#ffe16d',pulse);
 }else if(e.type==='carrier'){
  enemyEngineFlame(-20,27,'#c56cff',1.1,0);enemyEngineFlame(0,31,'#d993ff',1.2,1);enemyEngineFlame(20,27,'#c56cff',1.1,2);enemyModelCtx.shadowBlur=20;enemyModelCtx.shadowColor='#c66cff';enemyModelCtx.fillStyle='#392145';enemyModelCtx.beginPath();enemyModelCtx.moveTo(0,-32);enemyModelCtx.lineTo(-14,-23);enemyModelCtx.lineTo(-37,-18);enemyModelCtx.lineTo(-39,14);enemyModelCtx.lineTo(-22,28);enemyModelCtx.lineTo(-8,21);enemyModelCtx.lineTo(0,32);enemyModelCtx.lineTo(8,21);enemyModelCtx.lineTo(22,28);enemyModelCtx.lineTo(39,14);enemyModelCtx.lineTo(37,-18);enemyModelCtx.lineTo(14,-23);enemyModelCtx.closePath();enemyModelCtx.fill();enemyModelCtx.fillStyle='#76508a';enemyModelCtx.beginPath();enemyModelCtx.moveTo(0,-26);enemyModelCtx.lineTo(-12,-8);enemyModelCtx.lineTo(-10,19);enemyModelCtx.lineTo(0,27);enemyModelCtx.lineTo(10,19);enemyModelCtx.lineTo(12,-8);enemyModelCtx.closePath();enemyModelCtx.fill();enemyModelCtx.fillStyle='#1b1022';enemyModelCtx.fillRect(-25,-5,13,18);enemyModelCtx.fillRect(12,-5,13,18);enemyCore(0,-3,8,'#dc8cff',pulse);enemyPanelLine([[-34,-10],[-20,2],[-10,18]],'rgba(238,190,255,.3)');enemyPanelLine([[34,-10],[20,2],[10,18]],'rgba(238,190,255,.3)');
 }else if(e.type==='jammer'){
  enemyEngineFlame(-9,19,'#b76cff',.9,0);enemyEngineFlame(9,19,'#b76cff',.9,2);enemyModelCtx.shadowBlur=17;enemyModelCtx.shadowColor='#b76cff';enemyModelCtx.fillStyle='#301b43';enemyModelCtx.beginPath();enemyModelCtx.moveTo(0,-27);enemyModelCtx.lineTo(-18,-14);enemyModelCtx.lineTo(-27,7);enemyModelCtx.lineTo(-12,22);enemyModelCtx.lineTo(0,14);enemyModelCtx.lineTo(12,22);enemyModelCtx.lineTo(27,7);enemyModelCtx.lineTo(18,-14);enemyModelCtx.closePath();enemyModelCtx.fill();enemyModelCtx.fillStyle='#654084';enemyModelCtx.beginPath();enemyModelCtx.moveTo(0,-21);enemyModelCtx.lineTo(-8,-3);enemyModelCtx.lineTo(0,15);enemyModelCtx.lineTo(8,-3);enemyModelCtx.closePath();enemyModelCtx.fill();enemyModelCtx.strokeStyle='#e5c8ff';enemyModelCtx.lineWidth=2;enemyModelCtx.beginPath();enemyModelCtx.arc(0,-3,11+Math.sin(e.age*7)*2,0,Math.PI*2);enemyModelCtx.stroke();for(const a of [0,Math.PI*2/3,Math.PI*4/3]){enemyModelCtx.beginPath();enemyModelCtx.moveTo(Math.cos(a)*12,-3+Math.sin(a)*12);enemyModelCtx.lineTo(Math.cos(a)*20,-3+Math.sin(a)*20);enemyModelCtx.stroke()}enemyCore(0,-3,4.5,'#c477ff',pulse);
 }else{
  enemyEngineFlame(-7,17,'#ff6f8b',.8,0);enemyEngineFlame(7,17,'#ff6f8b',.8,2);enemyModelCtx.shadowBlur=10;enemyModelCtx.shadowColor='#ff5c78';enemyModelCtx.fillStyle='#4a1525';enemyModelCtx.beginPath();enemyModelCtx.moveTo(0,-25);enemyModelCtx.lineTo(-9,-14);enemyModelCtx.lineTo(-24,1);enemyModelCtx.lineTo(-17,13);enemyModelCtx.lineTo(-7,9);enemyModelCtx.lineTo(-4,21);enemyModelCtx.lineTo(0,16);enemyModelCtx.lineTo(4,21);enemyModelCtx.lineTo(7,9);enemyModelCtx.lineTo(17,13);enemyModelCtx.lineTo(24,1);enemyModelCtx.lineTo(9,-14);enemyModelCtx.closePath();enemyModelCtx.fill();enemyModelCtx.fillStyle='#a82d48';enemyModelCtx.beginPath();enemyModelCtx.moveTo(0,-20);enemyModelCtx.lineTo(-7,3);enemyModelCtx.lineTo(0,15);enemyModelCtx.lineTo(7,3);enemyModelCtx.closePath();enemyModelCtx.fill();enemyModelCtx.fillStyle='#ff8295';enemyModelCtx.beginPath();enemyModelCtx.moveTo(0,-18);enemyModelCtx.lineTo(-2,-3);enemyModelCtx.lineTo(0,4);enemyModelCtx.lineTo(2,-3);enemyModelCtx.closePath();enemyModelCtx.fill();enemyPanelLine([[-20,2],[-9,-8],[-5,8]],'rgba(255,180,195,.3)');enemyPanelLine([[20,2],[9,-8],[5,8]],'rgba(255,180,195,.3)');enemyCore(0,-5,3.5,'#ff6f8b',pulse);
 }
 enemyModelCtx.shadowBlur=0;enemyModelCtx.restore();
 enemyModelCtx=previousEnemyModelCtx;
}
function drawCoreDefenseEffects(lowFx=false){
 const shieldLayers=build?.shieldLayers||0;
 if(shieldLayers>0&&!dying){
  ctx.save();ctx.translate(player.x,player.y+(player.visualY||0));ctx.globalCompositeOperation='lighter';
  for(let i=0;i<shieldLayers;i++){
   const textureWidth=94+i*16,textureHeight=textureWidth;
   const layerSprite=shieldSpriteAssets[`player${i+1}`];
   drawShieldSprite(ctx,layerSprite,0,0,textureWidth,textureHeight,.76+i*.07,(i-1)*.025);
  }
  ctx.restore();
 }
 if(build?.chronoActive>0){ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.16+.06*Math.sin(elapsed*7);ctx.strokeStyle=coreManager.getLevel('time')===3?'#f0e8ff':'#b58cff';ctx.lineWidth=3;ctx.beginPath();ctx.arc(player.x,player.y,70+Math.sin(elapsed*5)*10,0,Math.PI*2);ctx.stroke();ctx.restore();}
 for(const p of pickups||[]){ctx.save();ctx.translate(p.x,p.y);const xpDrop=p.type==='eventXp'||p.type==='xpShard',repairCrystal=p.type==='repairShard';if(xpDrop&&lowFx){const r=p.r||4.6;ctx.fillStyle='#77eaff';ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.fill();ctx.fillStyle='#efffff';ctx.beginPath();ctx.arc(-r*.22,-r*.22,Math.max(1,r*.34),0,Math.PI*2);ctx.fill();ctx.restore();continue}ctx.globalCompositeOperation='lighter';ctx.shadowBlur=repairCrystal?22:16;ctx.shadowColor=xpDrop?'#5de7ff':'#5dff9a';ctx.fillStyle=xpDrop?'#d7fbff':'#b9ffd0';ctx.rotate(elapsed*(repairCrystal?2.7:1.8)+(p.x||0)*.01);if(xpDrop){const r=p.r||4.6;const glow=ctx.createRadialGradient(-r*.28,-r*.32,.4,0,0,r*1.15);glow.addColorStop(0,'#ffffff');glow.addColorStop(.32,'#bdf8ff');glow.addColorStop(.72,'#48dfff');glow.addColorStop(1,'rgba(30,143,255,.15)');ctx.fillStyle=glow;ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.fill();ctx.strokeStyle='rgba(211,252,255,.9)';ctx.lineWidth=1;ctx.beginPath();ctx.arc(0,0,r*.72,0,Math.PI*2);ctx.stroke()}else if(repairCrystal){const r=p.r||6;const grad=ctx.createLinearGradient(-r,-r,r,r);grad.addColorStop(0,'#eafff0');grad.addColorStop(.34,'#72ff9e');grad.addColorStop(1,'#079957');ctx.fillStyle=grad;ctx.beginPath();ctx.moveTo(0,-r*1.55);ctx.lineTo(r*.72,-r*.28);ctx.lineTo(r*.45,r*1.05);ctx.lineTo(0,r*1.5);ctx.lineTo(-r*.55,r*.82);ctx.lineTo(-r*.72,-r*.28);ctx.closePath();ctx.fill();ctx.strokeStyle='#b8ffd0';ctx.lineWidth=1.4;ctx.stroke();ctx.globalAlpha=.72;ctx.fillStyle='#effff4';ctx.beginPath();ctx.moveTo(-r*.15,-r*1.2);ctx.lineTo(r*.28,-r*.22);ctx.lineTo(0,r*.65);ctx.closePath();ctx.fill()}else{ctx.fillRect(-3,-10,6,20);ctx.fillRect(-10,-3,20,6);ctx.strokeStyle='#5dff9a';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,p.r+3,0,Math.PI*2);ctx.stroke()}ctx.restore();}
}
function drawShip(x,y,color,pose=null){
 const isPlayer=Math.abs(x-player.x)<1&&Math.abs(y-player.y)<1;
 const isClone=!!pose||(!isPlayer&&(build.projectionActive||0)>0&&clonePositions().some(c=>Math.abs(c.x-x)<1&&Math.abs(c.y-y)<1));
 // 横滚方向按玩家反馈反转：右移时向左侧倾，左移时向右侧倾。
 // 只改变姿态方向，不改变移动方向、碰撞范围或操控手感。
 const motion=pose||player;
 const bank=(isPlayer||isClone)?(motion.tilt||0):0;
 const pitch=(isPlayer||isClone)?(motion.pitch||0):0;
 const thrust=(isPlayer||isClone)?(motion.thrust||0):0;
 const hover=(isPlayer||isClone)?(motion.visualY||0):0;
 const recoil=(isPlayer||isClone)?(motion.recoil||0)*1.1:0;
 const movement=Math.min(1,Math.hypot(motion.vx||0,motion.vy||0)/(motion.speed||player.speed));
 const bodyY=y+hover+recoil;
 const flicker=1+Math.sin(elapsed*24)*.08;

 // 75度俯视投影：阴影与机体分离，并随横滚向低翼一侧轻微偏移。
 ctx.save();
 ctx.translate(x+bank*5,bodyY+31+pitch*3);
 ctx.scale(1-Math.abs(bank)*.06,.34+Math.abs(bank)*.035-pitch*.018);
 ctx.filter='blur(9px)';ctx.globalAlpha=.22;ctx.fillStyle='#000';
 ctx.beginPath();ctx.ellipse(0,0,29,14,0,0,Math.PI*2);ctx.fill();
 ctx.filter='none';ctx.restore();

 ctx.save();ctx.translate(x,bodyY+pitch*1.8);
 // 轻微航向偏转与纵向透视，让转弯、加速和制动更接近真实飞行动作。
 ctx.rotate(bank*.11);
 ctx.scale(1,1+pitch*.018);
 if(isPlayer&&player.inv>0&&Math.floor(player.inv*16)%2)ctx.globalAlpha=.3;

 // 尾流与四推进器固定在机尾下方，清楚表示飞机朝屏幕上方飞行。
 if(movement>.2){
  ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.13*movement;
  const trail=ctx.createLinearGradient(0,21,0,76+movement*20);
  trail.addColorStop(0,'rgba(130,235,255,.7)');trail.addColorStop(1,'rgba(50,120,255,0)');
  ctx.fillStyle=trail;
  for(const tx of [-8,8]){ctx.beginPath();ctx.moveTo(tx-1.3,21);ctx.lineTo(tx+1.3,21);ctx.lineTo(tx,76+movement*20);ctx.closePath();ctx.fill()}
  ctx.restore();
 }
 ctx.save();ctx.globalCompositeOperation='lighter';ctx.shadowBlur=20;ctx.shadowColor=color;
 for(const [ex,ey,power] of [[-9,21,1],[-3,23,.72],[3,23,.72],[9,21,1]]){
  const flame=(12+movement*10+thrust*12+Math.sin(elapsed*26+ex)*1.7)*power*flicker;
  const g=ctx.createLinearGradient(ex,ey,ex,ey+flame);
  g.addColorStop(0,'rgba(245,255,255,.98)');g.addColorStop(.24,'rgba(91,225,255,.96)');g.addColorStop(.62,'rgba(33,111,255,.72)');g.addColorStop(1,'rgba(20,70,255,0)');
  ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(ex-2.1*power,ey);ctx.lineTo(ex+2.1*power,ey);ctx.lineTo(ex,ey+flame);ctx.closePath();ctx.fill();
 }
 ctx.restore();

 if(shipSpriteReady(shipSpriteAssets.player)){
  const spriteAlpha=pose?.alpha??.99,playerImage=getMobileRenderSprite(pose?.bodyColor?getTintedShipSprite(shipSpriteAssets.player,pose.bodyColor,.42):shipSpriteAssets.player);ctx.save();ctx.globalAlpha=spriteAlpha;ctx.drawImage(playerImage,-39,-46,78,88);ctx.restore();drawPlayerSpriteGlow(pose?.color||color,spriteAlpha);ctx.restore();return;
 }

 // 横滚透视：压低的一侧更宽、更暗并稍向下；抬高的一侧更窄、更亮并稍向上。
 // 翼根始终重叠中央机身，杜绝“机翼掉落”的视觉断裂。
 const leftLow=Math.max(0,-bank),rightLow=Math.max(0,bank);
 const leftHigh=Math.max(0,bank),rightHigh=Math.max(0,-bank);
 const leftReach=31;
 const rightReach=31;
 const leftY=bank*-.7+pitch*.35;
 const rightY=bank*.7+pitch*.35;

 ctx.shadowBlur=17;ctx.shadowColor='rgba(60,205,255,.5)';
 // 深色下层机架把两翼与机身锁成一个整体。
 ctx.fillStyle='#122238';ctx.beginPath();
 ctx.moveTo(0,-47);ctx.lineTo(-5,-31);ctx.lineTo(-8,-15);
 ctx.lineTo(-leftReach,-2+leftY);ctx.lineTo(-leftReach+2,6+leftY);ctx.lineTo(-13,6);
 ctx.lineTo(-9,18);ctx.lineTo(-5,22);ctx.lineTo(0,27);
 ctx.lineTo(5,22);ctx.lineTo(9,18);ctx.lineTo(13,6);
 ctx.lineTo(rightReach-2,6+rightY);ctx.lineTo(rightReach,-2+rightY);
 ctx.lineTo(8,-15);ctx.lineTo(5,-31);ctx.closePath();ctx.fill();ctx.shadowBlur=0;

 // 左翼上表面。
 let wing=ctx.createLinearGradient(-leftReach,0,-4,0);
 wing.addColorStop(0,leftLow?'#8fa6bb':'#dce9f3');wing.addColorStop(1,'#f8fcff');ctx.fillStyle=wing;
 ctx.beginPath();ctx.moveTo(-4,-18);ctx.lineTo(-leftReach,-2+leftY);ctx.lineTo(-leftReach+2,5+leftY);ctx.lineTo(-12,5);ctx.lineTo(-7,13);ctx.lineTo(-4,5);ctx.closePath();ctx.fill();
 // 左翼可见侧面，压低时更明显，形成75度俯视厚度。
 if(leftLow>.01){ctx.globalAlpha=.75*leftLow;ctx.fillStyle='#526d87';ctx.beginPath();ctx.moveTo(-leftReach,-2+leftY);ctx.lineTo(-leftReach+2,5+leftY);ctx.lineTo(-12,5);ctx.lineTo(-12,7);ctx.lineTo(-leftReach+1,8+leftY);ctx.closePath();ctx.fill();ctx.globalAlpha=1}

 // 右翼上表面。
 wing=ctx.createLinearGradient(4,0,rightReach,0);
 wing.addColorStop(0,'#f8fcff');wing.addColorStop(1,rightLow?'#8fa6bb':'#dce9f3');ctx.fillStyle=wing;
 ctx.beginPath();ctx.moveTo(4,-18);ctx.lineTo(rightReach,-2+rightY);ctx.lineTo(rightReach-2,5+rightY);ctx.lineTo(12,5);ctx.lineTo(7,13);ctx.lineTo(4,5);ctx.closePath();ctx.fill();
 if(rightLow>.01){ctx.globalAlpha=.75*rightLow;ctx.fillStyle='#526d87';ctx.beginPath();ctx.moveTo(rightReach,-2+rightY);ctx.lineTo(rightReach-2,5+rightY);ctx.lineTo(12,5);ctx.lineTo(12,7);ctx.lineTo(rightReach-1,8+rightY);ctx.closePath();ctx.fill();ctx.globalAlpha=1}

 // 机身也参与横滚：轻微横向偏移和旋转，让机体与机翼动作保持一致，
 // 但幅度受控，机鼻仍然明确朝向屏幕上方。
 ctx.save();
 ctx.translate(0,0);
 ctx.rotate(0);

 // 中央机身采用上亮下暗的75度俯视塑形，机鼻尖长、机尾宽短，避免倒飞错觉。
 const body=ctx.createLinearGradient(0,-46,0,26);
 body.addColorStop(0,'#ffffff');body.addColorStop(.48,'#e8f2f9');body.addColorStop(.78,'#a8bdcf');body.addColorStop(1,'#5b7187');ctx.fillStyle=body;
 ctx.beginPath();ctx.moveTo(0,-48);ctx.lineTo(-4.4,-32);ctx.lineTo(-5.6,-8);ctx.lineTo(-7.4,12);ctx.lineTo(-5,21);ctx.lineTo(0,27);ctx.lineTo(5,21);ctx.lineTo(7.4,12);ctx.lineTo(5.6,-8);ctx.lineTo(4.4,-32);ctx.closePath();ctx.fill();
 // 右侧机身侧面，加强斜俯视立体感。
 ctx.globalAlpha=.48;ctx.fillStyle='#526c85';ctx.beginPath();ctx.moveTo(4.4,-32);ctx.lineTo(5.6,-8);ctx.lineTo(7.4,12);ctx.lineTo(5,21);ctx.lineTo(0,27);ctx.lineTo(2,16);ctx.lineTo(3,-10);ctx.closePath();ctx.fill();ctx.globalAlpha=1;

 // 尖锐机鼻高光。
 ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.85;ctx.fillStyle='#eaffff';ctx.beginPath();ctx.moveTo(0,-48);ctx.lineTo(-1.5,-34);ctx.lineTo(0,-37);ctx.lineTo(1.5,-34);ctx.closePath();ctx.fill();ctx.restore();

 // 驾驶舱位于机身前半部，明确“前方”在上。
 ctx.save();ctx.globalCompositeOperation='lighter';ctx.shadowBlur=13;ctx.shadowColor=color;
 const cockpit=ctx.createLinearGradient(0,-34,0,-7);cockpit.addColorStop(0,'#f2ffff');cockpit.addColorStop(.34,'#65e8ff');cockpit.addColorStop(1,'#0752aa');ctx.fillStyle=cockpit;
 ctx.beginPath();ctx.moveTo(0,-35);ctx.lineTo(-3.4,-25);ctx.lineTo(-3,-12);ctx.lineTo(0,-7);ctx.lineTo(3,-12);ctx.lineTo(3.4,-25);ctx.closePath();ctx.fill();
 ctx.globalAlpha=.72+.28*Math.sin(elapsed*5.5);ctx.fillStyle=color;ctx.beginPath();ctx.arc(0,7,3.2,0,Math.PI*2);ctx.fill();ctx.restore();

 // 双垂尾和推进器只出现在下方机尾。
 ctx.fillStyle='#d6e4ee';ctx.beginPath();ctx.moveTo(-5,10);ctx.lineTo(-13,21);ctx.lineTo(-7,21);ctx.lineTo(-2,15);ctx.closePath();ctx.fill();
 ctx.beginPath();ctx.moveTo(5,10);ctx.lineTo(13,21);ctx.lineTo(7,21);ctx.lineTo(2,15);ctx.closePath();ctx.fill();
 ctx.fillStyle='#071421';for(const ex of [-9,-3,3,9]){ctx.beginPath();ctx.arc(ex,21+(Math.abs(ex)<5?2:0),2.5,0,Math.PI*2);ctx.fill()}
 ctx.fillStyle='#69e6ff';for(const ex of [-9,-3,3,9]){ctx.beginPath();ctx.arc(ex,21+(Math.abs(ex)<5?2:0),1.2,0,Math.PI*2);ctx.fill()}

 // 机体装甲刻线、翼尖导航灯和主炮导轨，保持原轮廓不变。
 ctx.save();ctx.globalAlpha=.58;ctx.strokeStyle='rgba(92,142,174,.9)';ctx.lineWidth=.8;
 ctx.beginPath();ctx.moveTo(-4,-19);ctx.lineTo(-18,-1+leftY);ctx.lineTo(-10,4);ctx.stroke();
 ctx.beginPath();ctx.moveTo(4,-19);ctx.lineTo(18,-1+rightY);ctx.lineTo(10,4);ctx.stroke();
 ctx.beginPath();ctx.moveTo(-2,-5);ctx.lineTo(-2,14);ctx.moveTo(2,-5);ctx.lineTo(2,14);ctx.stroke();ctx.restore();
 ctx.save();ctx.globalCompositeOperation='lighter';ctx.shadowBlur=10;ctx.fillStyle='#9ff7ff';ctx.beginPath();ctx.arc(-leftReach+3,3+leftY,1.5,0,Math.PI*2);ctx.fill();ctx.fillStyle='#b79cff';ctx.beginPath();ctx.arc(rightReach-3,3+rightY,1.5,0,Math.PI*2);ctx.fill();ctx.restore();
 ctx.fillStyle='#3c586d';ctx.fillRect(-5,-43,2.2,14);ctx.fillRect(2.8,-43,2.2,14);ctx.fillStyle='#e9fbff';ctx.fillRect(-4.5,-44,1.2,10);ctx.fillRect(3.3,-44,1.2,10);
 // 收回机身局部横滚变换。
 ctx.restore();
 // 投影机体使用独立半透明色板，不再沿用玩家的白色机身。
 if(pose&&pose.bodyColor){
  ctx.save();ctx.globalCompositeOperation='source-over';ctx.globalAlpha=.68;ctx.fillStyle=pose.bodyColor;ctx.shadowBlur=12;ctx.shadowColor=pose.color||pose.bodyColor;
  ctx.beginPath();ctx.moveTo(0,-48);ctx.lineTo(-7,-18);ctx.lineTo(-31,-2+leftY);ctx.lineTo(-29,6+leftY);ctx.lineTo(-12,6);ctx.lineTo(-7,18);ctx.lineTo(0,27);ctx.lineTo(7,18);ctx.lineTo(12,6);ctx.lineTo(29,6+rightY);ctx.lineTo(31,-2+rightY);ctx.lineTo(7,-18);ctx.closePath();ctx.fill();
  ctx.globalAlpha=.55;ctx.strokeStyle=pose.color||'#a86cff';ctx.lineWidth=1.8;ctx.stroke();ctx.restore();
 }
 ctx.restore();
}
