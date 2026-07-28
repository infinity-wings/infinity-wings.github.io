'use strict';

/**
 * Alpha 2.6 fusion rules:
 * - Red attack cores may only fuse with purple tactical cores.
 * - Blue defense cores may only fuse with another blue defense core.
 * - Both participating cores must reach level III before a package can offer it.
 */
function fusionKey(coreAId, coreBId) {
  return [coreAId, coreBId].sort().join('+');
}

function defineFusion(id, coreA, coreB, name, description, effectId) {
  return Object.freeze({
    id,
    coreIds: Object.freeze([coreA, coreB]),
    key: fusionKey(coreA, coreB),
    name,
    description,
    effectId
  });
}

const FUSION_DEFINITIONS = Object.freeze([
  // Red attack + purple tactical: 6 x 2 = 12 replacement weapons.
  defineFusion('main_time', 'main', 'time', '时序回响炮', '炮击命中后记录攻击，并在短暂延迟后于原位置重演一次；连续命中可触发时序崩塌。原主炮与时间减速场停止工作。', 'temporalEchoCannon'),
  defineFusion('main_clone', 'main', 'clone', '镜像主炮', '主炮被重构为多重镜像炮列，周期性从相位位置同步齐射。原主炮与普通投影停止工作。', 'mirrorMainCannon'),
  defineFusion('laser_time', 'laser', 'time', '断层光束', '光束切割过的轨迹会在延迟后再次崩解，形成第二次时序切割。原激光与时间减速场停止工作。', 'faultlineBeam'),
  defineFusion('laser_clone', 'laser', 'clone', '镜像光阵', '多个相位发射点共同形成交叉光束阵列，覆盖不同纵向区域。原激光与普通投影停止工作。', 'mirrorLaserArray'),
  defineFusion('drone_time', 'drone', 'time', '时序机群', '无人机编队交替预支未来火力并进入短暂偿还周期，形成有节奏的高密度齐射。原无人机与时间场停止工作。', 'temporalDroneSwarm'),
  defineFusion('drone_clone', 'drone', 'clone', '镜像编队', '实体与相位无人机组成轮换编队，从多个位置同步发射。原无人机与普通投影停止工作。', 'mirrorDroneFormation'),
  defineFusion('missile_time', 'missile', 'time', '时序导弹', '导弹命中后记录爆点，短暂延迟后在同一位置重演一次较小爆炸。原导弹与时间减速场停止工作。', 'temporalMissiles'),
  defineFusion('missile_clone', 'missile', 'clone', '幻影蜂群', '相位弹舱复制导弹发射轨迹，形成真假交错的追踪蜂群。原导弹与普通投影停止工作。', 'phantomMissileSwarm'),
  defineFusion('thunder_time', 'thunder', 'time', '回溯雷链', '雷链结束后沿相反顺序回溯一次，对仍存活的目标造成第二轮电击，不再产生减速。', 'rewindLightningChain'),
  defineFusion('thunder_clone', 'thunder', 'clone', '镜像电网', '多个相位节点同时建立雷电连接，形成短暂的交叉电网。原雷电触发与普通投影停止工作。', 'mirrorLightningGrid'),
  defineFusion('blast_time', 'blast', 'time', '延迟裂变', '敌人被击破后留下不稳定时序核，延迟后才释放高速裂变弹，适合封锁后续敌群。原爆裂与时间场停止工作。', 'delayedFission'),
  defineFusion('blast_clone', 'blast', 'clone', '残像裂变', '裂变弹会生成短暂残像，并从残像位置发动第二轮弱化追击。原爆裂与普通投影停止工作。', 'afterimageFission'),

  // Blue defense + blue defense: one survival device.
  defineFusion('shield_repair', 'shield', 'repair', '再生堡垒', '护盾与维修包机制被统一替换为再生装甲核心：吸收敌弹积累能量，充满后释放修复脉冲。传统回血包停止掉落。', 'regenerativeFortress')
]);

const FUSION_TABLE = Object.freeze(FUSION_DEFINITIONS.reduce((table, fusion) => {
  table[fusion.key] = fusion;
  return table;
}, {}));

function getFusionDefinition(coreAId, coreBId) {
  return FUSION_TABLE[fusionKey(coreAId, coreBId)] || null;
}
