'use strict';

const AWAKENING_DEFINITIONS = Object.freeze([
 {id:'main_rapid',coreId:'main',name:'裂阵速射炮',description:'以扇形一次发射7枚小型高速弹，覆盖正前方较宽区域，适合近距离压制与清理敌群。'},
 {id:'main_piercer',coreId:'main',name:'贯星重炮',description:'每1.55秒发射一枚大型贯穿重炮；单发伤害高、后坐明显，贯穿目标后继续增伤。'},
 {id:'laser_reflect',coreId:'laser',name:'折射光阵',description:'主光束命中后自动折射附近目标，最多连续折射四次。'},
 {id:'laser_star',coreId:'laser',name:'贯星光束',description:'蓄力后发射持续2.2秒的超粗全屏光束，以稳定高能照射贯穿战场。'},
 {id:'drone_swarm',coreId:'drone',name:'蜂群编队',description:'部署八架小型无人机，分散索敌并进行高覆盖火力压制。'},
 {id:'drone_heavy',coreId:'drone',name:'重型护航机',description:'部署两架前置护航机，发射大口径高伤穿透炮，并在玩家前方展开完整圆弧屏障。'},
 {id:'missile_cluster',coreId:'missile',name:'集束蜂群',description:'中型导弹接近目标后裂解成多枚自动索敌的小型导弹。'},
 {id:'missile_hunter',coreId:'missile',name:'重型追猎弹',description:'周期发射大型追猎弹，锁定生命最高目标并对Boss造成额外伤害。'},
 {id:'thunder_storm',coreId:'thunder',name:'雷暴领域',description:'从玩家战机向前方目标连续释放雷电，每轮最多同时电击五个敌人；冷却很短，单体伤害低于聚焦雷枪。'},
 {id:'thunder_lance',coreId:'thunder',name:'聚焦雷枪',description:'每2.5秒锁定最多四个危险目标，从战机同时释放四道粗型高伤雷枪。'},
 {id:'blast_chain',coreId:'blast',name:'连锁裂变',description:'击杀后释放高伤害追踪裂变弹；裂变弹可再次连锁，同一目标累计命中还会触发额外裂变爆炸。'},
 {id:'blast_annihilation',coreId:'blast',name:'湮灭核心',description:'击杀时在目标位置产生一次受控的局部湮灭爆炸，伤害附近敌人并消除少量敌弹；爆炸造成的击杀不会再次触发湮灭。'},
 {id:'shield_reflect',coreId:'shield',name:'反射壁垒',description:'在战机前方展开持续数秒的弧形屏障，拦截正面敌弹；屏障结束时释放一圈高能冲击波，伤害敌人并清除周围弹幕。'},
 {id:'shield_phase',coreId:'shield',name:'相位装甲',description:'受到伤害时进入短暂无敌；致命伤害触发后保留少量生命，随后长冷却。'},
 {id:'repair_salvage',coreId:'repair',name:'战斗回收系统',description:'传统维修包停止掉落；敌人低概率析出绿色水晶，自动吸收并累计，储备满后回复生命并短暂无敌。'},
 {id:'repair_emergency',coreId:'repair',name:'紧急再生协议',description:'低生命时自动持续修复，修复期间火力略降，触发后进入长冷却。'},
 {id:'time_stop',coreId:'time',name:'时间停滞',description:'周期释放停滞波，冻结普通敌人与敌弹；Boss仅受到强减速。'},
 {id:'time_replay',coreId:'time',name:'时序回放',description:'周期生成时间残像，沿玩家此前轨迹移动并重放基础射击。'},
 {id:'clone_mirror',coreId:'clone',name:'火力矩阵',description:'部署五架蓝紫色半透明固定投影，持续5秒、空窗3秒；只复制已拥有攻击源核的Ⅰ级形态，以宽阵列压制和补刀为主。'},
 {id:'clone_substitute',coreId:'clone',name:'相位炮台',description:'部署三架蓝紫色半透明固定投影，持续5秒、空窗5秒；除复制Ⅰ级攻击技能外，还会蓄力1秒并发射高伤贯穿激光。'}
]);
const AWAKENING_BY_ID = Object.freeze(Object.fromEntries(AWAKENING_DEFINITIONS.map(a=>[a.id,a])));
function getAwakeningsForCore(coreId){return AWAKENING_DEFINITIONS.filter(a=>a.coreId===coreId)}
