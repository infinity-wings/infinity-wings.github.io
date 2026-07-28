function draw(){
 const renderLoad=enemies.length+enemyBullets.length*.08+bullets.length*.035+particles.length*.02;
 const lowFx=renderLoad>36;
 ctx.save();if(shake&&$('#shakeSetting').checked){ctx.translate((Math.random()-.5)*shake,(Math.random()-.5)*shake);shake*=.85}ctx.clearRect(0,0,W,H);ctx.fillStyle='#020712';ctx.fillRect(0,0,W,H);
 for(const s of stars){ctx.globalAlpha=.35+s.s/3;ctx.fillStyle='#85ddff';ctx.fillRect(s.x,s.y,s.s,s.s)}ctx.globalAlpha=1;
 if(!Array.isArray(particles)){ctx.restore();return}
 for(const p of particles){ctx.globalAlpha=Math.max(0,p.life/p.max);ctx.fillStyle=p.type==='barrier'?'#8ff6ff':p.type==='thunder'?'#d9fbff':p.type==='missile'||p.type==='missileTrail'?'#ffcf70':p.type==='repairShard'?'#6dff9b':p.type==='laserCharge'?'#bffcff':'#ffb24a';if(!lowFx&&(p.type==='barrier'||p.type==='thunder'||p.type==='missile'||p.type==='missileTrail'||p.type==='laserCharge')){ctx.save();ctx.globalCompositeOperation='lighter';ctx.shadowBlur=9;ctx.shadowColor='#5de8ff'}ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,7);ctx.fill();if(!lowFx&&(p.type==='barrier'||p.type==='thunder'||p.type==='missile'||p.type==='missileTrail'||p.type==='laserCharge'))ctx.restore()}ctx.globalAlpha=1;
 for(const wave of blastWaves)drawBarrierWave(wave);
 for(const arc of lightningArcs)drawLightningArc(arc);
 drawLaserChargeEffect();
 drawCoreDefenseEffects();
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
  }else{ctx.fillStyle=b.source==='clone'?'#b88cff':'#65e7ff';ctx.fillRect(b.x-2,b.y-10,4,14);if(b.blastLevel){ctx.save();ctx.globalCompositeOperation='lighter';ctx.shadowBlur=10;ctx.shadowColor='#ff9a45';ctx.fillStyle='#ffd27a';ctx.beginPath();ctx.arc(b.x,b.y-4,1.8+b.blastLevel*.45,0,Math.PI*2);ctx.fill();ctx.restore()}}
 }
 for(const m of missiles)drawMissile(m);
 for(const b of enemyBullets){
  if(lowFx){ctx.fillStyle=b.type==='jammer'?'#d7a8ff':b.type==='barrage'?'#ffd279':'#baf8ff';ctx.beginPath();ctx.arc(b.x,b.y,b.r,0,Math.PI*2);ctx.fill();continue}
  const speed=Math.hypot(b.vx,b.vy)||1,ux=b.vx/speed,uy=b.vy/speed;
  const isJammer=b.type==='jammer',isBarrage=b.type==='barrage';
  const outer=isJammer?'#a45cff':isBarrage?'#ff9a3d':'#20d9ff';
  const mid=isJammer?'#d7a8ff':isBarrage?'#ffd279':'#8cf5ff';
  const core=isJammer?'#fbf0ff':isBarrage?'#fff7d6':'#f7ffff';
  ctx.save();ctx.globalCompositeOperation='lighter';
  const trail=ctx.createLinearGradient(b.x-ux*(22+b.r*1.5),b.y-uy*(22+b.r*1.5),b.x,b.y);
  trail.addColorStop(0,'rgba(255,255,255,0)');trail.addColorStop(.58,isJammer?'rgba(157,73,255,.18)':isBarrage?'rgba(255,130,48,.18)':'rgba(32,217,255,.16)');trail.addColorStop(1,isJammer?'rgba(203,132,255,.65)':isBarrage?'rgba(255,194,88,.64)':'rgba(112,242,255,.72)');
  ctx.strokeStyle=trail;ctx.lineWidth=b.r*(isJammer?1.2:.85);ctx.lineCap='round';ctx.beginPath();ctx.moveTo(b.x-ux*(24+b.r*2),b.y-uy*(24+b.r*2));ctx.lineTo(b.x-ux*b.r*.55,b.y-uy*b.r*.55);ctx.stroke();
  ctx.shadowBlur=isJammer?22:isBarrage?17:14;ctx.shadowColor=outer;ctx.fillStyle=outer;ctx.beginPath();ctx.arc(b.x,b.y,b.r+2.2,0,Math.PI*2);ctx.fill();
  ctx.shadowBlur=isJammer?13:9;ctx.fillStyle=mid;ctx.beginPath();ctx.arc(b.x,b.y,b.r*.72,0,Math.PI*2);ctx.fill();
  ctx.shadowBlur=6;ctx.shadowColor='#fff';ctx.fillStyle=core;ctx.beginPath();ctx.arc(b.x-ux*b.r*.12,b.y-uy*b.r*.12,Math.max(1.8,b.r*.32),0,Math.PI*2);ctx.fill();
  ctx.strokeStyle=isJammer?'rgba(235,211,255,.9)':isBarrage?'rgba(255,226,160,.82)':'rgba(196,252,255,.88)';ctx.lineWidth=isJammer?1.8:1.1;ctx.globalAlpha=.65+.3*Math.sin(elapsed*(isJammer?11:8)+b.x*.03);ctx.beginPath();ctx.arc(b.x,b.y,b.r+5+(isJammer?2:1)*Math.sin(elapsed*9+b.y*.02),0,Math.PI*2);ctx.stroke();
  if(isJammer){ctx.rotate(elapsed*2.5+b.x*.01);ctx.strokeStyle='rgba(210,164,255,.55)';ctx.lineWidth=1;for(let i=0;i<3;i++){const a=i*Math.PI*2/3;ctx.beginPath();ctx.arc(b.x+Math.cos(a)*(b.r+7),b.y+Math.sin(a)*(b.r+7),2.1,0,Math.PI*2);ctx.stroke();}}
  ctx.restore();
 }
 for(const e of enemies){drawEnemyShip(e);if(e.boss){ctx.fillStyle='#18233b';ctx.fillRect(55,28,W-110,12);ctx.fillStyle='#a767ff';ctx.fillRect(55,28,(W-110)*(e.hp/e.max),12)}}
 for(const d of drones)drawDrone(d);
 drawHeavyEscortShield();
 drawAwakenedFrontShield();
 if(!dying){for(const clone of clonePositions()){ctx.save();ctx.globalAlpha=clone.alpha||.54;drawShip(clone.x,clone.y,clone.color||'#b474ff',clone);ctx.restore()}}
 if(!dying)drawShip(player.x,player.y,'#5ce1ff');
 battleEventSystem.draw();
 awakeningSystem.draw();
 if(deathFade>0){ctx.fillStyle=`rgba(0,0,0,${deathFade})`;ctx.fillRect(0,0,W,H)}
 ctx.restore()
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
 ctx.shadowBlur=9;ctx.shadowColor='#72e9ff';ctx.fillStyle='#dceaf1';ctx.beginPath();ctx.moveTo(0,-11);ctx.lineTo(-4,-3);ctx.lineTo(-3,7);ctx.lineTo(3,7);ctx.lineTo(4,-3);ctx.closePath();ctx.fill();ctx.fillStyle='#52768d';ctx.beginPath();ctx.moveTo(-3,1);ctx.lineTo(-9,7);ctx.lineTo(-3,6);ctx.closePath();ctx.fill();ctx.beginPath();ctx.moveTo(3,1);ctx.lineTo(9,7);ctx.lineTo(3,6);ctx.closePath();ctx.fill();ctx.fillStyle=m.level===3?'#b998ff':'#62e9ff';ctx.beginPath();ctx.arc(0,-3,2.2,0,Math.PI*2);ctx.fill();ctx.restore();
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
 const fade=Math.min(1,build.heavyEscortShieldActive/.38),pulse=.88+.12*Math.sin(elapsed*8.5);
 const cx=player.x,cy=player.y-8,radius=84;
 ctx.save();ctx.translate(cx,cy);ctx.globalCompositeOperation='lighter';ctx.globalAlpha=fade;ctx.lineCap='round';
 const drawHalf=(a1,a2)=>{
  const g=ctx.createLinearGradient(-radius,0,radius,0);g.addColorStop(0,'rgba(70,108,255,.2)');g.addColorStop(.5,'rgba(224,255,255,.98)');g.addColorStop(1,'rgba(70,108,255,.2)');
  ctx.shadowBlur=26;ctx.shadowColor='#65ebff';ctx.strokeStyle=g;ctx.lineWidth=6*pulse;ctx.beginPath();ctx.arc(0,0,radius,a1,a2);ctx.stroke();
  ctx.shadowBlur=12;ctx.strokeStyle='rgba(229,255,255,.8)';ctx.lineWidth=1.7;ctx.beginPath();ctx.arc(0,0,radius-8,a1+.025,a2-.025);ctx.stroke();
 };
 drawHalf(Math.PI*1.08,Math.PI*1.5-.025);
 drawHalf(Math.PI*1.5+.025,Math.PI*1.92);
 ctx.setLineDash([7,8]);ctx.strokeStyle='rgba(104,151,255,.42)';ctx.lineWidth=1.2;ctx.beginPath();ctx.arc(0,0,radius+9,Math.PI*1.06,Math.PI*1.94);ctx.stroke();ctx.setLineDash([]);
 for(const d of escorts){const pos=dronePosition(d);ctx.strokeStyle='rgba(109,239,255,.38)';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(pos.x-cx,pos.y-cy-8);ctx.lineTo((pos.x-cx)*1.35,-Math.sqrt(Math.max(0,radius*radius-Math.min(radius-1,(pos.x-cx)*1.35)**2)));ctx.stroke()}
 ctx.restore();
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
  ctx.fillStyle='#0e1b2d';ctx.fillRect(-5,-24,10,15);ctx.fillStyle='#dffaff';ctx.fillRect(-2.5,-27,5,10);ctx.save();ctx.globalCompositeOperation='lighter';ctx.shadowBlur=17;ctx.shadowColor='#63e8ff';ctx.fillStyle='#eaffff';ctx.beginPath();ctx.arc(0,-4,5.5,0,Math.PI*2);ctx.fill();ctx.fillStyle='#26aee9';ctx.beginPath();ctx.arc(0,-4,3.2,0,Math.PI*2);ctx.fill();if(d.guardFlash>0){ctx.globalAlpha=.7;ctx.strokeStyle='#aefaff';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,-2,20+Math.sin(elapsed*8)*2,0,Math.PI*2);ctx.stroke()}ctx.restore();ctx.restore();return;
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

function enemyEngineFlame(x,y,color,size=1,phase=0){
 const flame=(8+Math.sin(elapsed*23+phase)*2.2)*size;
 ctx.save();ctx.globalCompositeOperation='lighter';ctx.shadowBlur=14*size;ctx.shadowColor=color;
 const g=ctx.createLinearGradient(x,y,x,y+flame);g.addColorStop(0,'rgba(255,255,255,.98)');g.addColorStop(.3,color);g.addColorStop(1,'rgba(20,40,255,0)');ctx.fillStyle=g;
 ctx.beginPath();ctx.moveTo(x-2.1*size,y);ctx.lineTo(x+2.1*size,y);ctx.lineTo(x,y+flame);ctx.closePath();ctx.fill();ctx.restore();
}
function enemyPanelLine(points,color='rgba(255,255,255,.25)',width=1){ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();ctx.moveTo(points[0][0],points[0][1]);for(let i=1;i<points.length;i++)ctx.lineTo(points[i][0],points[i][1]);ctx.stroke();}
function enemyCore(x,y,r,color,pulse=1){ctx.save();ctx.globalCompositeOperation='lighter';ctx.shadowBlur=18;ctx.shadowColor=color;ctx.fillStyle='rgba(245,255,255,.96)';ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();ctx.globalAlpha=.72+.28*pulse;ctx.fillStyle=color;ctx.beginPath();ctx.arc(x,y,r*.62,0,Math.PI*2);ctx.fill();ctx.restore();}
function drawEnemyShip(e){
 if(e.eventMeteor){ctx.save();ctx.translate(e.x,e.y);ctx.rotate(elapsed*.35);ctx.globalCompositeOperation='lighter';ctx.shadowBlur=30;ctx.shadowColor='#b78cff';const g=ctx.createRadialGradient(0,0,2,0,0,e.r);g.addColorStop(0,'#ffffff');g.addColorStop(.18,'#9ff5ff');g.addColorStop(.52,'#9d69ff');g.addColorStop(1,'rgba(84,32,145,.15)');ctx.fillStyle=g;ctx.beginPath();for(let i=0;i<10;i++){const a=i*Math.PI/5,r=e.r*(i%2?0.66:1);const x=Math.cos(a)*r,y=Math.sin(a)*r;i?ctx.lineTo(x,y):ctx.moveTo(x,y)}ctx.closePath();ctx.fill();ctx.strokeStyle='rgba(222,246,255,.8)';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,e.r+9,elapsed,-elapsed+Math.PI*1.55);ctx.stroke();ctx.restore();return}
 ctx.save();ctx.translate(e.x,e.y);ctx.scale(1,-1);const pulse=.72+.28*Math.sin(e.age*7);const hpRatio=Math.max(0,e.hp/e.max);
 if(e.boss){
  enemyEngineFlame(-27,34,'#8a6cff',1.25,0);enemyEngineFlame(0,42,'#d493ff',1.45,1);enemyEngineFlame(27,34,'#8a6cff',1.25,2);
  ctx.shadowBlur=25;ctx.shadowColor='#8e62ff';let g=ctx.createLinearGradient(0,-52,0,50);g.addColorStop(0,'#d7ccff');g.addColorStop(.34,'#7356a7');g.addColorStop(1,'#241735');ctx.fillStyle=g;
  ctx.beginPath();ctx.moveTo(0,-56);ctx.lineTo(-13,-30);ctx.lineTo(-38,-43);ctx.lineTo(-58,-9);ctx.lineTo(-48,24);ctx.lineTo(-24,17);ctx.lineTo(-12,45);ctx.lineTo(0,36);ctx.lineTo(12,45);ctx.lineTo(24,17);ctx.lineTo(48,24);ctx.lineTo(58,-9);ctx.lineTo(38,-43);ctx.lineTo(13,-30);ctx.closePath();ctx.fill();
  ctx.shadowBlur=0;ctx.fillStyle='#1a1028';ctx.beginPath();ctx.moveTo(-39,-30);ctx.lineTo(-51,-7);ctx.lineTo(-42,14);ctx.lineTo(-20,8);ctx.lineTo(-10,-18);ctx.closePath();ctx.fill();ctx.beginPath();ctx.moveTo(39,-30);ctx.lineTo(51,-7);ctx.lineTo(42,14);ctx.lineTo(20,8);ctx.lineTo(10,-18);ctx.closePath();ctx.fill();
  ctx.fillStyle='#ad91e4';ctx.beginPath();ctx.moveTo(0,-49);ctx.lineTo(-8,-22);ctx.lineTo(-7,22);ctx.lineTo(0,35);ctx.lineTo(7,22);ctx.lineTo(8,-22);ctx.closePath();ctx.fill();
  enemyPanelLine([[-39,-28],[-20,-7],[-11,20]],'rgba(230,217,255,.4)',1.4);enemyPanelLine([[39,-28],[20,-7],[11,20]],'rgba(230,217,255,.4)',1.4);
  enemyCore(0,-4,12,'#b06cff',pulse);for(const x of [-31,31])enemyCore(x,-8,5,'#8265ff',pulse);
  ctx.restore();return;
 }
 if(e.shield>0){ctx.save();ctx.globalCompositeOperation='lighter';ctx.strokeStyle='rgba(91,224,255,.8)';ctx.lineWidth=2.5;ctx.shadowBlur=13;ctx.shadowColor='#57ddff';ctx.beginPath();ctx.arc(0,0,e.r+7+Math.sin(e.age*5)*2,0,Math.PI*2);ctx.stroke();ctx.restore();}
 if(hpRatio<.38){ctx.save();ctx.globalAlpha=.28+(1-hpRatio)*.35;ctx.fillStyle='#8794a2';for(let i=0;i<3;i++){const ox=Math.sin(e.age*2+i*2.3)*5,oy=15-i*8-(e.age*18+i*7)%30;ctx.beginPath();ctx.arc(ox,oy,4+i*1.4,0,Math.PI*2);ctx.fill()}ctx.restore();}
 if(e.type==='heavy'){
  enemyEngineFlame(-12,22,'#ff9b45',1.15,0);enemyEngineFlame(12,22,'#ff9b45',1.15,2);
  let g=ctx.createLinearGradient(0,-28,0,30);g.addColorStop(0,'#f2aa63');g.addColorStop(.42,'#a85231');g.addColorStop(1,'#3c1d1b');ctx.shadowBlur=15;ctx.shadowColor='#ff8a42';ctx.fillStyle=g;
  ctx.beginPath();ctx.moveTo(0,-30);ctx.lineTo(-12,-20);ctx.lineTo(-31,-12);ctx.lineTo(-32,10);ctx.lineTo(-18,24);ctx.lineTo(-7,18);ctx.lineTo(0,28);ctx.lineTo(7,18);ctx.lineTo(18,24);ctx.lineTo(32,10);ctx.lineTo(31,-12);ctx.lineTo(12,-20);ctx.closePath();ctx.fill();
  ctx.shadowBlur=0;ctx.fillStyle='#47221d';ctx.fillRect(-27,-6,9,20);ctx.fillRect(18,-6,9,20);ctx.fillStyle='#d67a42';ctx.beginPath();ctx.moveTo(-13,-18);ctx.lineTo(-6,17);ctx.lineTo(0,24);ctx.lineTo(6,17);ctx.lineTo(13,-18);ctx.closePath();ctx.fill();enemyCore(0,-7,5,'#ffb05b',pulse);enemyPanelLine([[-27,0],[-15,-12],[-8,12]],'rgba(255,226,190,.35)');enemyPanelLine([[27,0],[15,-12],[8,12]],'rgba(255,226,190,.35)');
 }else if(e.type==='suicide'){
  const targetAngle=Math.atan2(player.y-e.y,player.x-e.x);ctx.rotate(Math.PI/2-targetAngle);
  const armed=e.fuse!=null;const urgency=armed?Math.max(0,1-e.fuse/2.2):0;const alarm=.45+.55*Math.abs(Math.sin(e.age*(armed?18:8)));
  enemyEngineFlame(0,17,armed?'#ffcf4d':'#ff315c',1.4+urgency*.3,0);
  ctx.shadowBlur=armed?28:18;ctx.shadowColor=armed?'#ff3a22':'#ff3558';
  const body=ctx.createLinearGradient(0,-26,0,24);body.addColorStop(0,armed?`rgba(255,${80+Math.floor(95*alarm)},45,1)`:'#a71935');body.addColorStop(.45,armed?'#c92721':'#641329');body.addColorStop(1,armed?'#45100e':'#260914');ctx.fillStyle=body;
  ctx.beginPath();ctx.moveTo(0,-27);ctx.lineTo(-8,-18);ctx.lineTo(-21,10);ctx.lineTo(-10,8);ctx.lineTo(-5,19);ctx.lineTo(0,25);ctx.lineTo(5,19);ctx.lineTo(10,8);ctx.lineTo(21,10);ctx.lineTo(8,-18);ctx.closePath();ctx.fill();
  ctx.fillStyle=armed?`rgba(255,206,80,${.55+.45*alarm})`:'#d53650';ctx.beginPath();ctx.moveTo(0,-23);ctx.lineTo(-7,7);ctx.lineTo(0,20);ctx.lineTo(7,7);ctx.closePath();ctx.fill();
  ctx.strokeStyle=armed?`rgba(255,238,130,${.65+.35*alarm})`:'rgba(255,110,135,.8)';ctx.lineWidth=armed?2.8:1.6;for(const side of [-1,1]){ctx.beginPath();ctx.moveTo(side*4,-15);ctx.lineTo(side*14,8);ctx.lineTo(side*8,6);ctx.stroke()}
  enemyCore(0,0,armed?7:6,armed?'#ffb62e':'#ff315c',alarm);
  ctx.strokeStyle=armed?`rgba(255,86,45,${.75+.25*alarm})`:`rgba(255,130,145,${pulse})`;ctx.lineWidth=armed?3.2:1.5;ctx.beginPath();ctx.arc(0,0,12+urgency*5+Math.sin(e.age*14)*1.5,0,Math.PI*2);ctx.stroke();
  if(armed){ctx.save();ctx.scale(1,-1);ctx.rotate(targetAngle-Math.PI/2);ctx.font='bold 13px system-ui';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#fff4c2';ctx.shadowBlur=9;ctx.shadowColor='#ff3b24';ctx.fillText(Math.max(0,e.fuse).toFixed(1),0,-34);ctx.restore()}
 }else if(e.type==='sniper'){
  enemyEngineFlame(-7,20,'#ffd45a',.8,0);enemyEngineFlame(7,20,'#ffd45a',.8,2);ctx.shadowBlur=12;ctx.shadowColor='#ffd35a';ctx.fillStyle='#4b3a17';ctx.beginPath();ctx.moveTo(0,-29);ctx.lineTo(-8,-16);ctx.lineTo(-28,2);ctx.lineTo(-18,11);ctx.lineTo(-8,7);ctx.lineTo(-5,22);ctx.lineTo(0,17);ctx.lineTo(5,22);ctx.lineTo(8,7);ctx.lineTo(18,11);ctx.lineTo(28,2);ctx.lineTo(8,-16);ctx.closePath();ctx.fill();ctx.fillStyle='#c39b37';ctx.fillRect(-3,-26,6,42);ctx.fillStyle='#f5d978';ctx.fillRect(-1.5,-30,3,28);enemyCore(0,-4,4,'#ffe171',pulse);
 }else if(e.type==='support'){
  enemyEngineFlame(-9,18,'#4ce7ff',.85,0);enemyEngineFlame(9,18,'#4ce7ff',.85,2);ctx.shadowBlur=15;ctx.shadowColor='#4ce7ff';ctx.fillStyle='#174455';ctx.beginPath();ctx.moveTo(0,-25);ctx.lineTo(-22,-12);ctx.lineTo(-27,8);ctx.lineTo(-13,21);ctx.lineTo(0,14);ctx.lineTo(13,21);ctx.lineTo(27,8);ctx.lineTo(22,-12);ctx.closePath();ctx.fill();ctx.fillStyle='#2e91a8';ctx.beginPath();ctx.arc(0,-1,11,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#b9fbff';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,-1,15+Math.sin(e.age*5)*2,0,Math.PI*2);ctx.stroke();enemyCore(0,-1,5,'#5deaff',pulse);
 }else if(e.type==='barrage'){
  enemyEngineFlame(-15,21,'#ff7a45',1,0);enemyEngineFlame(15,21,'#ff7a45',1,2);ctx.shadowBlur=15;ctx.shadowColor='#ff7e4c';ctx.fillStyle='#4a231d';ctx.beginPath();ctx.moveTo(0,-29);ctx.lineTo(-18,-21);ctx.lineTo(-33,-5);ctx.lineTo(-29,17);ctx.lineTo(-10,24);ctx.lineTo(0,17);ctx.lineTo(10,24);ctx.lineTo(29,17);ctx.lineTo(33,-5);ctx.lineTo(18,-21);ctx.closePath();ctx.fill();ctx.fillStyle='#a94f31';ctx.beginPath();ctx.moveTo(0,-24);ctx.lineTo(-10,-8);ctx.lineTo(-8,18);ctx.lineTo(0,14);ctx.lineTo(8,18);ctx.lineTo(10,-8);ctx.closePath();ctx.fill();for(const x of [-18,-9,0,9,18]){ctx.fillStyle='#1d0e0c';ctx.fillRect(x-2,-8,4,17);ctx.fillStyle='#ffc27e';ctx.fillRect(x-1,-9,2,7)}enemyPanelLine([[-28,6],[-17,-13],[-8,-3]],'rgba(255,190,145,.35)');enemyPanelLine([[28,6],[17,-13],[8,-3]],'rgba(255,190,145,.35)');
 }else if(e.type==='raider'){
  ctx.rotate(e.dir>0?Math.PI/2:-Math.PI/2);enemyEngineFlame(0,17,'#ffcf57',1.25,0);ctx.shadowBlur=13;ctx.shadowColor='#ffcf57';ctx.fillStyle='#4a3414';ctx.beginPath();ctx.moveTo(0,-28);ctx.lineTo(-8,-8);ctx.lineTo(-17,18);ctx.lineTo(0,10);ctx.lineTo(17,18);ctx.lineTo(8,-8);ctx.closePath();ctx.fill();ctx.fillStyle='#ba852e';ctx.beginPath();ctx.moveTo(0,-24);ctx.lineTo(-4,8);ctx.lineTo(0,14);ctx.lineTo(4,8);ctx.closePath();ctx.fill();enemyCore(0,-7,3.8,'#ffe16d',pulse);
 }else if(e.type==='carrier'){
  enemyEngineFlame(-20,27,'#c56cff',1.1,0);enemyEngineFlame(0,31,'#d993ff',1.2,1);enemyEngineFlame(20,27,'#c56cff',1.1,2);ctx.shadowBlur=20;ctx.shadowColor='#c66cff';ctx.fillStyle='#392145';ctx.beginPath();ctx.moveTo(0,-32);ctx.lineTo(-14,-23);ctx.lineTo(-37,-18);ctx.lineTo(-39,14);ctx.lineTo(-22,28);ctx.lineTo(-8,21);ctx.lineTo(0,32);ctx.lineTo(8,21);ctx.lineTo(22,28);ctx.lineTo(39,14);ctx.lineTo(37,-18);ctx.lineTo(14,-23);ctx.closePath();ctx.fill();ctx.fillStyle='#76508a';ctx.beginPath();ctx.moveTo(0,-26);ctx.lineTo(-12,-8);ctx.lineTo(-10,19);ctx.lineTo(0,27);ctx.lineTo(10,19);ctx.lineTo(12,-8);ctx.closePath();ctx.fill();ctx.fillStyle='#1b1022';ctx.fillRect(-25,-5,13,18);ctx.fillRect(12,-5,13,18);enemyCore(0,-3,8,'#dc8cff',pulse);enemyPanelLine([[-34,-10],[-20,2],[-10,18]],'rgba(238,190,255,.3)');enemyPanelLine([[34,-10],[20,2],[10,18]],'rgba(238,190,255,.3)');
 }else if(e.type==='jammer'){
  enemyEngineFlame(-9,19,'#b76cff',.9,0);enemyEngineFlame(9,19,'#b76cff',.9,2);ctx.shadowBlur=17;ctx.shadowColor='#b76cff';ctx.fillStyle='#301b43';ctx.beginPath();ctx.moveTo(0,-27);ctx.lineTo(-18,-14);ctx.lineTo(-27,7);ctx.lineTo(-12,22);ctx.lineTo(0,14);ctx.lineTo(12,22);ctx.lineTo(27,7);ctx.lineTo(18,-14);ctx.closePath();ctx.fill();ctx.fillStyle='#654084';ctx.beginPath();ctx.moveTo(0,-21);ctx.lineTo(-8,-3);ctx.lineTo(0,15);ctx.lineTo(8,-3);ctx.closePath();ctx.fill();ctx.strokeStyle='#e5c8ff';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,-3,11+Math.sin(e.age*7)*2,0,Math.PI*2);ctx.stroke();for(const a of [0,Math.PI*2/3,Math.PI*4/3]){ctx.beginPath();ctx.moveTo(Math.cos(a)*12,-3+Math.sin(a)*12);ctx.lineTo(Math.cos(a)*20,-3+Math.sin(a)*20);ctx.stroke()}enemyCore(0,-3,4.5,'#c477ff',pulse);
 }else{
  enemyEngineFlame(-7,17,'#ff6f8b',.8,0);enemyEngineFlame(7,17,'#ff6f8b',.8,2);ctx.shadowBlur=10;ctx.shadowColor='#ff5c78';ctx.fillStyle='#4a1525';ctx.beginPath();ctx.moveTo(0,-25);ctx.lineTo(-9,-14);ctx.lineTo(-24,1);ctx.lineTo(-17,13);ctx.lineTo(-7,9);ctx.lineTo(-4,21);ctx.lineTo(0,16);ctx.lineTo(4,21);ctx.lineTo(7,9);ctx.lineTo(17,13);ctx.lineTo(24,1);ctx.lineTo(9,-14);ctx.closePath();ctx.fill();ctx.fillStyle='#a82d48';ctx.beginPath();ctx.moveTo(0,-20);ctx.lineTo(-7,3);ctx.lineTo(0,15);ctx.lineTo(7,3);ctx.closePath();ctx.fill();ctx.fillStyle='#ff8295';ctx.beginPath();ctx.moveTo(0,-18);ctx.lineTo(-2,-3);ctx.lineTo(0,4);ctx.lineTo(2,-3);ctx.closePath();ctx.fill();enemyPanelLine([[-20,2],[-9,-8],[-5,8]],'rgba(255,180,195,.3)');enemyPanelLine([[20,2],[9,-8],[5,8]],'rgba(255,180,195,.3)');enemyCore(0,-5,3.5,'#ff6f8b',pulse);
 }
 ctx.shadowBlur=0;ctx.restore();
}
function drawCoreDefenseEffects(){
 const shieldLayers=build?.shieldLayers||0;
 if(shieldLayers>0&&!dying){
  ctx.save();ctx.translate(player.x,player.y+(player.visualY||0));ctx.globalCompositeOperation='lighter';
  const pulse=1+Math.sin(elapsed*3.6)*.025;
  for(let i=0;i<shieldLayers;i++){
   const radius=(48+i*7)*pulse;
   const color=i===2?'#b28cff':i===1?'#73d9ff':'#9bf5ff';
   ctx.save();ctx.rotate(elapsed*(i%2?-.16:.12)+i*.16);ctx.globalAlpha=.10+i*.035;
   ctx.fillStyle=color;ctx.beginPath();for(let a=0;a<6;a++){const ang=-Math.PI/2+a*Math.PI/3,x=Math.cos(ang)*radius,y=Math.sin(ang)*radius;(a?ctx.lineTo(x,y):ctx.moveTo(x,y))}ctx.closePath();ctx.fill();ctx.restore();
   ctx.save();ctx.rotate(i*.08);ctx.globalAlpha=.7+i*.08;ctx.strokeStyle=color;ctx.lineWidth=2.4+i*.7;ctx.shadowBlur=18+i*5;ctx.shadowColor=color;ctx.beginPath();for(let a=0;a<6;a++){const ang=-Math.PI/2+a*Math.PI/3,x=Math.cos(ang)*radius,y=Math.sin(ang)*radius;(a?ctx.lineTo(x,y):ctx.moveTo(x,y))}ctx.closePath();ctx.stroke();
   ctx.globalAlpha=.28;ctx.lineWidth=1;for(let a=0;a<6;a++){const ang=-Math.PI/2+a*Math.PI/3;ctx.beginPath();ctx.moveTo(Math.cos(ang)*(radius-10),Math.sin(ang)*(radius-10));ctx.lineTo(Math.cos(ang)*radius,Math.sin(ang)*radius);ctx.stroke()}ctx.restore();
  }
  ctx.restore();
 }
 if(build?.chronoActive>0){ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.16+.06*Math.sin(elapsed*7);ctx.strokeStyle=coreManager.getLevel('time')===3?'#f0e8ff':'#b58cff';ctx.lineWidth=3;ctx.beginPath();ctx.arc(player.x,player.y,70+Math.sin(elapsed*5)*10,0,Math.PI*2);ctx.stroke();ctx.restore();}
 for(const p of pickups||[]){ctx.save();ctx.translate(p.x,p.y);ctx.globalCompositeOperation='lighter';const xpDrop=p.type==='eventXp',repairCrystal=p.type==='repairShard';ctx.shadowBlur=repairCrystal?22:16;ctx.shadowColor=xpDrop?'#5de7ff':'#5dff9a';ctx.fillStyle=xpDrop?'#d7fbff':'#b9ffd0';ctx.rotate(elapsed*(repairCrystal?2.7:1.8)+(p.x||0)*.01);if(xpDrop){ctx.beginPath();for(let i=0;i<6;i++){const a=i*Math.PI/3,r=i%2?p.r*.55:p.r;const x=Math.cos(a)*r,y=Math.sin(a)*r;i?ctx.lineTo(x,y):ctx.moveTo(x,y)}ctx.closePath();ctx.fill()}else if(repairCrystal){const r=p.r||6;const grad=ctx.createLinearGradient(-r,-r,r,r);grad.addColorStop(0,'#eafff0');grad.addColorStop(.34,'#72ff9e');grad.addColorStop(1,'#079957');ctx.fillStyle=grad;ctx.beginPath();ctx.moveTo(0,-r*1.55);ctx.lineTo(r*.72,-r*.28);ctx.lineTo(r*.45,r*1.05);ctx.lineTo(0,r*1.5);ctx.lineTo(-r*.55,r*.82);ctx.lineTo(-r*.72,-r*.28);ctx.closePath();ctx.fill();ctx.strokeStyle='#b8ffd0';ctx.lineWidth=1.4;ctx.stroke();ctx.globalAlpha=.72;ctx.fillStyle='#effff4';ctx.beginPath();ctx.moveTo(-r*.15,-r*1.2);ctx.lineTo(r*.28,-r*.22);ctx.lineTo(0,r*.65);ctx.closePath();ctx.fill()}else{ctx.fillRect(-3,-10,6,20);ctx.fillRect(-10,-3,20,6);ctx.strokeStyle='#5dff9a';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,p.r+3,0,Math.PI*2);ctx.stroke()}ctx.restore();}
}
function drawShip(x,y,color,pose=null){
 const isPlayer=Math.abs(x-player.x)<1&&Math.abs(y-player.y)<1;
 const isClone=!!pose||(!isPlayer&&(build.projectionActive||0)>0&&clonePositions().some(c=>Math.abs(c.x-x)<1&&Math.abs(c.y-y)<1));
 // 右移时右机翼压低、左机翼抬高；左移时相反。
 // 这里反转输入符号，修正上一版横滚方向颠倒的问题。
 const motion=pose||player;
 const bank=(isPlayer||isClone)?-(motion.tilt||0):0;
 const hover=(isPlayer||isClone)?(motion.visualY||0):0;
 const recoil=(isPlayer||isClone)?(motion.recoil||0)*1.1:0;
 const movement=Math.min(1,Math.hypot(motion.vx||0,motion.vy||0)/(motion.speed||player.speed));
 const bodyY=y+hover+recoil;
 const flicker=1+Math.sin(elapsed*24)*.08;

 // 75度俯视投影：阴影与机体分离，并随横滚向低翼一侧轻微偏移。
 ctx.save();
 ctx.translate(x+bank*4,bodyY+31);
 ctx.scale(1-Math.abs(bank)*.06,.34+Math.abs(bank)*.035);
 ctx.filter='blur(9px)';ctx.globalAlpha=.22;ctx.fillStyle='#000';
 ctx.beginPath();ctx.ellipse(0,0,29,14,0,0,Math.PI*2);ctx.fill();
 ctx.filter='none';ctx.restore();

 ctx.save();ctx.translate(x,bodyY);
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
  const flame=(13+movement*13+Math.sin(elapsed*26+ex)*2)*power*flicker;
  const g=ctx.createLinearGradient(ex,ey,ex,ey+flame);
  g.addColorStop(0,'rgba(245,255,255,.98)');g.addColorStop(.24,'rgba(91,225,255,.96)');g.addColorStop(.62,'rgba(33,111,255,.72)');g.addColorStop(1,'rgba(20,70,255,0)');
  ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(ex-2.1*power,ey);ctx.lineTo(ex+2.1*power,ey);ctx.lineTo(ex,ey+flame);ctx.closePath();ctx.fill();
 }
 ctx.restore();

 // 横滚透视：压低的一侧更宽、更暗并稍向下；抬高的一侧更窄、更亮并稍向上。
 // 翼根始终重叠中央机身，杜绝“机翼掉落”的视觉断裂。
 const leftLow=Math.max(0,-bank),rightLow=Math.max(0,bank);
 const leftHigh=Math.max(0,bank),rightHigh=Math.max(0,-bank);
 const leftReach=31*(1+leftLow*.14-leftHigh*.12);
 const rightReach=31*(1+rightLow*.14-rightHigh*.12);
 const leftY=leftLow*3-leftHigh*2;
 const rightY=rightLow*3-rightHigh*2;

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
 ctx.translate(bank*1.7,Math.abs(bank)*.35);
 ctx.rotate(bank*.028);

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
