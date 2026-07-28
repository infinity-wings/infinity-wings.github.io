'use strict';

/**
 * Infinity Wings - Source Core upgrade selection system.
 * Replaces the legacy CORES pool with CoreManager candidates.
 */
class UpgradeSystem {
  constructor(manager) {
    if (!manager) throw new Error('UpgradeSystem requires CoreManager');
    this.manager = manager;
    this.currentChoices = [];
  }

  getCategoryMeta(category) {
    return CORE_CATEGORY_META[category] || {
      name: '未知源核',
      color: '#ffffff',
      icon: '⚪'
    };
  }

  shuffle(items) {
    const result = [...items];
    for (let i = result.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  /**
   * Tries to show different categories in one selection when possible.
   */
  createChoices(count = 3) {
    const candidates = this.manager.getUpgradeCandidates();
    if (candidates.length === 0) {
      this.currentChoices = [];
      return [];
    }

    const byCategory = new Map();
    candidates.forEach(candidate => {
      if (!byCategory.has(candidate.category)) byCategory.set(candidate.category, []);
      byCategory.get(candidate.category).push(candidate);
    });

    const selected = [];
    const categoryOrder = this.shuffle([...byCategory.keys()]);

    categoryOrder.forEach(category => {
      if (selected.length >= count) return;
      const pool = this.shuffle(byCategory.get(category));
      if (pool[0]) selected.push(pool[0]);
    });

    if (selected.length < count) {
      const usedIds = new Set(selected.map(item => item.id));
      const remaining = this.shuffle(candidates.filter(item => !usedIds.has(item.id)));
      while (selected.length < count && remaining.length) selected.push(remaining.shift());
    }

    this.currentChoices = selected;
    return selected;
  }

  getChoice(index) {
    return this.currentChoices[index] || null;
  }

  select(index) {
    const choice = this.getChoice(index);
    if (!choice) return null;
    if (window.IWAwakeningSystem?.isCoreAwakened(choice.id)) {
      this.currentChoices = this.createChoices(this.currentChoices.length || 3);
      return null;
    }

    const previousLevel = this.manager.getLevel(choice.id);
    const level = this.manager.upgrade(choice.id);
    const definition = this.manager.getDefinition(choice.id);
    const levelData = definition.levels[level - 1];

    return {
      id: choice.id,
      definition,
      previousLevel,
      level,
      levelData,
      newlyActivatedFusions: this.manager.getActiveFusions()
    };
  }

  reset() {
    this.currentChoices = [];
  }
}

const upgradeSystem = new UpgradeSystem(coreManager);
window.IWUpgradeSystem = upgradeSystem;
