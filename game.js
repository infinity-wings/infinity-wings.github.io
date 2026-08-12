'use strict';
// Modular loader. Keep index.html unchanged: it can continue loading game.js.
(() => {
  if (window.__IW_MODULE_LOADER_STARTED__) return;
  window.__IW_MODULE_LOADER_STARTED__ = true;
  const version = '9.08.4';
  const files = [
    './src/bootstrap.js',
    './src/systems/saveSystem.js',
    './src/core/coreDefinitions.js',
    './src/core/fusionTable.js',
    './src/core/awakeningDefinitions.js',
    './src/systems/coreManager.js',
    './src/systems/audioSystem.js',
    './src/systems/coreEffects.js',
    './src/systems/awakeningSystem.js',
    './src/systems/eventSystem.js',
    './src/systems/upgradeSystem.js',
    './src/systems/gameplay.js',
    './src/systems/stabilitySystem.js',
    './src/render/renderer.js',
    './src/ui/interface.js',
    './src/systems/debugMenu.js'
  ];
  const loadNext = index => {
    if (index >= files.length) return;
    const script = document.createElement('script');
    script.src = `${files[index]}?v=${version}`;
    script.async = false;
    script.onload = () => loadNext(index + 1);
    script.onerror = () => console.error('模块加载失败：' + files[index]);
    document.head.appendChild(script);
  };
  loadNext(0);
})();
