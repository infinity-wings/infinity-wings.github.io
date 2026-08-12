'use strict';

class CoreManager {
  constructor({ definitions = CORE_DEFINITIONS, fusionTable = FUSION_TABLE } = {}) {
    this.definitions = definitions;
    this.fusionTable = fusionTable;
    this.levels = new Map();
    this.activeFusions = new Set();
    this.consumedCores = new Set();
    this.listeners = new Map();
  }

  on(eventName, listener) {
    if (typeof listener !== 'function') return () => {};
    if (!this.listeners.has(eventName)) this.listeners.set(eventName, new Set());
    this.listeners.get(eventName).add(listener);
    return () => this.listeners.get(eventName)?.delete(listener);
  }

  emit(eventName, payload) {
    this.listeners.get(eventName)?.forEach(listener => {
      try { listener(payload); }
      catch (error) { console.error(`[CoreManager] ${eventName} listener failed`, error); }
    });
  }

  getDefinition(id) {
    return this.definitions[id] || null;
  }

  getRawLevel(id) { return this.levels.get(id) || 0; }

  getLevel(id) {
    if (window.IWAwakeningSystem?.isCoreAwakened(id)) return 0;
    return this.consumedCores.has(id) ? 0 : this.getRawLevel(id);
  }

  getLevelData(id) {
    const definition = this.getDefinition(id);
    const level = this.getLevel(id);
    if (!definition || level <= 0) return null;
    return definition.levels[level - 1] || null;
  }

  owns(id) {
    return this.getLevel(id) > 0;
  }

  isMaxLevel(id) {
    const definition = this.getDefinition(id);
    return Boolean(definition && this.getLevel(id) >= definition.maxLevel);
  }

  setLevel(id, requestedLevel, { detectFusions = true, silent = false } = {}) {
    const definition = this.getDefinition(id);
    if (!definition) throw new Error(`Unknown core: ${id}`);

    const previousLevel = this.getRawLevel(id);
    const numericLevel = Number.isFinite(Number(requestedLevel)) ? Number(requestedLevel) : 0;
    const nextLevel = Math.max(0, Math.min(definition.maxLevel, Math.floor(numericLevel)));

    if (nextLevel === 0) { this.levels.delete(id); this.consumedCores.delete(id); }
    else { this.levels.set(id, nextLevel); if (previousLevel !== nextLevel) this.consumedCores.delete(id); }

    if (!silent && previousLevel !== nextLevel) {
      this.emit('levelChanged', { id, definition, previousLevel, level: nextLevel });
    }

    // Fusion no longer activates automatically. It is granted by a fusion package.
    return nextLevel;
  }

  upgrade(id, amount = 1) {
    return this.setLevel(id, this.getLevel(id) + Math.max(1, Math.floor(amount)));
  }

  downgrade(id, amount = 1) {
    return this.setLevel(id, this.getLevel(id) - Math.max(1, Math.floor(amount)));
  }

  canCombine(coreAId, coreBId) {
    const a = this.getDefinition(coreAId);
    const b = this.getDefinition(coreBId);
    if (!a || !b || a.id === b.id) return false;

    const isRedPurple =
      (a.category === CORE_CATEGORIES.WEAPON && b.category === CORE_CATEGORIES.TACTICAL) ||
      (b.category === CORE_CATEGORIES.WEAPON && a.category === CORE_CATEGORIES.TACTICAL);
    const isBlueBlue =
      a.category === CORE_CATEGORIES.DEFENSE && b.category === CORE_CATEGORIES.DEFENSE;
    return isRedPurple || isBlueBlue;
  }

  canFuse(coreAId, coreBId) {
    if (!this.canCombine(coreAId, coreBId)) return false;
    if (this.getRawLevel(coreAId) < 3 || this.getRawLevel(coreBId) < 3) return false;
    if (this.consumedCores.has(coreAId) || this.consumedCores.has(coreBId)) return false;
    return Boolean(getFusionDefinition(coreAId, coreBId));
  }

  getFusion(coreAId, coreBId) {
    return getFusionDefinition(coreAId, coreBId);
  }

  activateFusion(coreAId, coreBId, { silent = false } = {}) {
    const fusion = this.getFusion(coreAId, coreBId);
    if (!fusion || !this.canFuse(coreAId, coreBId)) return null;
    if (this.activeFusions.has(fusion.id)) return fusion;

    if (this.activeFusions.size >= 3) return null;
    this.activeFusions.add(fusion.id);
    fusion.coreIds.forEach(id => this.consumedCores.add(id));
    if (!silent) this.emit('fusionActivated', fusion);
    return fusion;
  }

  deactivateFusion(fusionId, { silent = false } = {}) {
    if (!this.activeFusions.delete(fusionId)) return false;
    if (!silent) this.emit('fusionDeactivated', { id: fusionId });
    return true;
  }

  refreshFusions() { return this.getActiveFusions(); }

  isCoreConsumed(id) { return this.consumedCores.has(id); }

  hasFusion(fusionId) {
    return this.activeFusions.has(fusionId);
  }

  getActiveFusions() {
    const byId = new Map(Object.values(this.fusionTable).map(fusion => [fusion.id, fusion]));
    return [...this.activeFusions].map(id => byId.get(id)).filter(Boolean);
  }

  getOwnedCores() {
    return CORE_LIST
      .filter(core => this.owns(core.id))
      .map(core => ({
        ...core,
        currentLevel: this.getLevel(core.id),
        currentLevelData: this.getLevelData(core.id)
      }));
  }

  getUpgradeCandidates() {
    const awakening = window.IWAwakeningSystem;
    return CORE_LIST
      .filter(core => isCoreAvailable(core.id) || this.owns(core.id))
      .filter(core => !this.isMaxLevel(core.id))
      .filter(core => !awakening?.isCoreAwakened(core.id))
      .map(core => ({
        id: core.id,
        name: core.name,
        category: core.category,
        currentLevel: this.getLevel(core.id),
        nextLevel: this.getLevel(core.id) + 1,
        nextLevelData: core.levels[this.getLevel(core.id)]
      }));
  }

  getAvailableFusionCandidates() {
    return Object.values(this.fusionTable).filter(fusion => {
      if (this.activeFusions.has(fusion.id)) return false;
      return this.canFuse(fusion.coreIds[0], fusion.coreIds[1]);
    });
  }

  createSnapshot() {
    return Object.freeze({
      version: 1,
      levels: Object.fromEntries(this.levels),
      activeFusions: [...this.activeFusions],
      consumedCores: [...this.consumedCores]
    });
  }

  loadSnapshot(snapshot, { silent = false } = {}) {
    this.reset({ silent: true });
    if (!snapshot || typeof snapshot !== 'object') return this.createSnapshot();

    Object.entries(snapshot.levels || {}).forEach(([id, level]) => {
      if (this.getDefinition(id)) this.setLevel(id, level, { detectFusions: false, silent: true });
    });

    for (const fusionId of snapshot.activeFusions || []) {
      const fusion = Object.values(this.fusionTable).find(item => item.id === fusionId);
      if (fusion) this.activateFusion(fusion.coreIds[0], fusion.coreIds[1], { silent: true });
    }
    if (!silent) this.emit('snapshotLoaded', this.createSnapshot());
    return this.createSnapshot();
  }

  reset({ silent = false } = {}) {
    this.levels.clear();
    this.activeFusions.clear();
    this.consumedCores.clear();
    if (!silent) this.emit('reset', null);
  }

  debugSetAll(level = 3) {
    CORE_LIST.forEach(core => this.setLevel(core.id, level, { detectFusions: false, silent: true }));
    return this.createSnapshot();
  }
}

const coreManager = new CoreManager();

// Temporary browser debugging API for Alpha 0.2. This does not alter the
// current legacy combat system yet; it lets us validate all definitions and
// fusion rules from DevTools before connecting the new upgrade UI.
window.IWCoreSystem = Object.freeze({
  manager: coreManager,
  definitions: CORE_DEFINITIONS,
  fusions: FUSION_DEFINITIONS,
  awakenings: AWAKENING_DEFINITIONS,
  categories: CORE_CATEGORIES,
  help() {
    console.table(CORE_LIST.map(core => ({ id: core.id, name: core.name, category: core.category })));
    console.info('Examples:');
    console.info("IWCoreSystem.manager.setLevel('laser', 3)");
    console.info("IWCoreSystem.manager.setLevel('time', 3)");
    console.info('IWCoreSystem.manager.getActiveFusions()');
    console.info('IWCoreSystem.manager.debugSetAll(3)');
  }
});
