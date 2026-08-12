'use strict';

/**
 * Infinity Wings - Core combat effects
 * Alpha 0.9: Main Cannon, Blast, Thunder and attack core support
 */
class CoreEffectsSystem {
  constructor(manager) {
    if (!manager) throw new Error('CoreEffectsSystem requires CoreManager');

    this.manager = manager;
    this.baseStats = Object.freeze({
      damage: 11,
      fireRate: 220
    });

    this.manager.on('levelChanged', () => this.applyPlayerStats());
    this.manager.on('reset', () => this.applyPlayerStats());

    console.log('[CoreEffects] System Loaded');
  }

  init() {
    this.applyPlayerStats();
    console.log('[CoreEffects] Init');
  }

  reset() {
    this.applyPlayerStats();
  }

  update(dt) {
    // Later source cores will use the frame update here.
    void dt;
  }

  applyPlayerStats() {
    if (typeof player === 'undefined' || !player) return;

    // Always rebuild from base values so upgrades never stack by accident.
    player.damage = this.baseStats.damage;
    player.fireRate = this.baseStats.fireRate;

    this.applyMainCore();

    if (typeof updateUI === 'function') updateUI();
  }

  applyMainCore() {
  const level = this.manager.getLevel('main');

  // 0/1级：单弹道
  // 2级：双弹道
  // 3级：三弹道
  player.mainBulletCount = [1, 1, 2, 3][level] || 1;
  player.mainBulletSize = [1, 1, 1.08, 1.25][level] || 1;
  player.mainBulletDamageScale = [1, 1, 1.08, 1.25][level] || 1;
  }

  getDebugState() {
    return {
      mainLevel: this.manager.getLevel('main'),
      blastLevel: this.manager.getLevel('blast'),
      thunderLevel: this.manager.getLevel('thunder'),
      damage: Number((player?.damage || 0).toFixed(2)),
      fireRate: Number((player?.fireRate || 0).toFixed(2))
    };
  }
}

const coreEffects = new CoreEffectsSystem(coreManager);
window.coreEffects = coreEffects;
window.IWCoreEffects = coreEffects;
