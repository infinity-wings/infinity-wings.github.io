'use strict';

/**
 * Infinity Wings - Core definitions
 * Alpha 0.2 only establishes the data model. Existing gameplay still uses the
 * legacy upgrade pool until the next migration step.
 */
const CORE_CATEGORIES = Object.freeze({
  WEAPON: 'weapon',
  DEFENSE: 'defense',
  TACTICAL: 'tactical'
});

const CORE_CATEGORY_META = Object.freeze({
  [CORE_CATEGORIES.WEAPON]: Object.freeze({ name: '攻击源核', color: '#ff4d5f', icon: '' }),
  [CORE_CATEGORIES.DEFENSE]: Object.freeze({ name: '防御源核', color: '#4da3ff', icon: '' }),
  [CORE_CATEGORIES.TACTICAL]: Object.freeze({ name: '战术源核', color: '#a56cff', icon: '' })
});

function defineCore(core) {
  const levels = core.levels.map((level, index) => Object.freeze({
    level: index + 1,
    ...level
  }));

  return Object.freeze({
    maxLevel: 3,
    ...core,
    levels: Object.freeze(levels)
  });
}

const CORE_DEFINITIONS = Object.freeze({
  main: defineCore({
    id: 'main', name: '动能源核', shortName: '动能', category: CORE_CATEGORIES.WEAPON,
    role: '稳定连续输出',
    levels: [
    {
        name: "动能Ⅰ",
        description: "启用低射速单弹道动能主炮。"
    },
    {
        name: "动能Ⅱ",
        description: "主炮升级为双弹道，并提高射速与弹头威力。"
    },
    {
        name: "动能Ⅲ",
        description: "主炮升级为高速强化三弹道，子弹更粗，伤害提升。"
    }
]
  }),
  laser: defineCore({
    id: 'laser', name: '光能源核', shortName: '光能', category: CORE_CATEGORIES.WEAPON,
    role: '蓄能贯穿输出',
    levels: [
      { name: '裂隙蓄能炮', description: '蓄力0.7秒后持续照射2.5秒，冷却3秒。' },
      { name: '聚焦透镜', description: '蓄力0.55秒，冷却2.5秒，光束更粗并持续3秒。' },
      { name: '双束歼灭阵列', description: '蓄力0.4秒后发射双束激光，持续3.5秒，冷却2秒。' }
    ]
  }),
  drone: defineCore({
    id: 'drone', name: '协同源核', shortName: '协同', category: CORE_CATEGORIES.WEAPON,
    role: '编队火力覆盖',
    levels: [
      { name: '双翼护航', description: '在机身左右部署两架护航无人机。' },
      { name: '锋矢编队', description: '在前方增加一架无人机，并提高全体无人机伤害与射速。' },
      { name: '四向协同', description: '在后方增加一架无人机，再次强化全体无人机伤害与射速。' }
    ]
  }),
  missile: defineCore({
    id: 'missile', name: '制导源核', shortName: '制导', category: CORE_CATEGORIES.WEAPON,
    role: '追踪爆发输出',
    levels: [
      { name: '追踪弹舱', description: '周期性发射一枚高机动追踪导弹。' },
      { name: '多目标锁定', description: '同时发射两枚导弹，提升追踪与爆炸范围。' },
      { name: '饱和打击', description: '齐射四枚导弹，对多个目标实施范围轰炸。' }
    ]
  }),
  thunder: defineCore({
    id: 'thunder', name: '电磁源核', shortName: '电磁', category: CORE_CATEGORIES.WEAPON,
    role: '连锁清场输出',
    levels: [
      { name: '电弧发生器', description: '每1.6秒从机身释放闪电，在一定范围内连续连接最多2个敌人。' },
      { name: '连锁回路', description: '冷却缩短至1.4秒，可连续连接最多3个敌人，并显著提高电击伤害。' },
      { name: '雷暴矩阵', description: '冷却缩短至1秒，可连续连接最多5个敌人，并进一步扩大连接范围。' }
    ]
  }),
  shield: defineCore({
    id: 'shield', name: '护盾源核', shortName: '护盾', category: CORE_CATEGORIES.DEFENSE,
    role: '自动恢复的偏转护层',
    rules: Object.freeze({ temporaryOnly: true }),
    levels: [
      { name: '偏转护层', description: '脱离受击后自动重构1层护盾，可抵挡一次伤害。' },
      { name: '复合护层', description: '最多储存2层护盾，重构速度提升。' },
      { name: '相位装甲', description: '最多储存3层；护盾破裂时清除附近敌弹。' }
    ]
  }),
  repair: defineCore({
    id: 'repair', name: '修复源核', shortName: '修复', category: CORE_CATEGORIES.DEFENSE,
    role: '击杀回收与战场续航',
    levels: [
      { name: '应急回收', description: '击毁普通敌人有4%概率掉落维修包，精英敌人概率更高。' },
      { name: '战场回收', description: '普通敌人掉率提升至7%，并提高治疗量。' },
      { name: '纳米补给', description: '普通敌人掉率提升至10%，Boss必定掉落大型维修包。' }
    ]
  }),
  time: defineCore({
    id: 'time', name: '时间源核', shortName: '时间', category: CORE_CATEGORIES.TACTICAL,
    role: '周期控制与冷却加速',
    levels: [
      { name: '迟滞场', description: '周期性释放时间脉冲，短暂减慢敌人与敌弹。' },
      { name: '加速回路', description: '迟滞持续更久，并缩短激光、导弹与无人机冷却。' },
      { name: '零时领域', description: '周期性冻结普通敌人与敌弹，Boss仅受到强减速。' }
    ]
  }),
  clone: defineCore({
    id: 'clone', name: '投影源核', shortName: '投影', category: CORE_CATEGORIES.TACTICAL,
    role: '固定投影阵列与多点协同火力',
    rules: Object.freeze({ invulnerable: true }),
    levels: [
      { name: '中央投影', description: '在战场中部固定展开1架蓝紫色半透明投影，持续5秒，解除后空窗8秒；仅复制已拥有攻击源核的Ⅰ级形态。' },
      { name: '双翼投影', description: '在战场左右固定展开2架蓝紫色半透明投影，持续5秒，解除后空窗5秒；仅复制已拥有攻击源核的Ⅰ级形态。' },
      { name: '三点投影阵列', description: '在左、中、右固定展开3架蓝紫色半透明投影，持续5秒，解除后空窗3秒；只复制Ⅰ级攻击技能，以覆盖和补刀为主。' }
    ]
  }),
  blast: defineCore({
    id: 'blast', name: '爆裂源核', shortName: '爆裂', category: CORE_CATEGORIES.TACTICAL,
    role: '击杀分裂与追击清场',
    levels: [
      { name: '裂弹触发', description: '击杀敌人后分裂出2枚追击弹。' },
      { name: '多重裂变', description: '分裂为3枚追击弹，并提高伤害与索敌范围。' },
      { name: '爆裂蜂群', description: '分裂为4枚高伤追击弹，快速清理附近目标。' }
    ]
  })
});

const CORE_LIST = Object.freeze(Object.values(CORE_DEFINITIONS));
const CORE_IDS = Object.freeze(CORE_LIST.map(core => core.id));
const FIGHTER_CORE_UNLOCKS = Object.freeze({main:'infinity',laser:'laser',drone:'drone',missile:'missile',thunder:'thunder'});

function isCoreAvailable(id) {
  const fighterId = FIGHTER_CORE_UNLOCKS[id];
  if (!fighterId) return true;
  if (fighterId === 'infinity') return (window.IWSave?.data?.profile?.selectedFighter || 'infinity') === 'infinity';
  const fighters = window.IWSave?.data?.progression?.fighters;
  return Array.isArray(fighters) && fighters.includes(fighterId);
}

function getCoreDefinition(id) {
  return CORE_DEFINITIONS[id] || null;
}

function getCoresByCategory(category) {
  return CORE_LIST.filter(core => core.category === category);
}
