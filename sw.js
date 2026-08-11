const CACHE='iw-cache-8.85-mirror-entry-v1';
const ASSETS=[
  './',
  './index.html',
  './style.css?v=8.85.0',
  './game.js?v=8.85.0',
  './manifest.webmanifest',
  './apple-touch-icon.png',
  './favicon.png',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  './assets/menu/menu-space-background-desktop.jpg',
  './assets/menu/menu-space-background-tablet.jpg',
  './assets/menu/menu-space-background-phone.jpg',
  './assets/menu/menu-title-logo.PNG',
  './assets/menu/menu-fighter-rear-v2.png',
  './assets/backgrounds/deep-space-flight-v1.jpg',
  './assets/backgrounds/landmarks/distant-planet-v1.png',
  './assets/backgrounds/landmarks/station-wreck-v1.png',
  './assets/ships/player-fighter-v4.png',
  './assets/ships/player-drone-v1.png',
  './assets/ships/enemy-scout-v3.png',
  './assets/ships/enemy-heavy-v1.png',
  './assets/ships/enemy-suicide-v1.png',
  './assets/ships/enemy-sniper-v1.png',
  './assets/ships/enemy-support-v1.png',
  './assets/ships/enemy-barrage-v1.png',
  './assets/ships/enemy-raider-v1.png',
  './assets/ships/enemy-carrier-v1.png',
  './assets/ships/enemy-jammer-v1.png',
  './assets/ships/enemy-boss-guard-v1.png',
  './assets/ships/boss-dreadnought-wide-v3.png',
  './assets/effects/enemy-support-shield-v2.png',
  './assets/effects/player-shield-level1-v3.png',
  './assets/effects/player-shield-level2-v4.png',
  './assets/effects/player-shield-level3-v3.png',
  './assets/effects/escort-front-barrier-v2.png',
  './assets/meteors/meteor-small-v1.png',
  './assets/meteors/meteor-medium-v1.png',
  './assets/meteors/meteor-large-v1.png'
];

self.addEventListener('install',event=>{
  event.waitUntil(
    caches.open(CACHE)
      .then(cache=>cache.addAll(ASSETS))
      .then(()=>self.skipWaiting())
  );
});

self.addEventListener('activate',event=>{
  event.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;

  event.respondWith(
    fetch(event.request)
      .then(response=>{
        if(response.ok){
          const copy=response.clone();
          caches.open(CACHE).then(cache=>cache.put(event.request,copy));
        }
        return response;
      })
      .catch(async()=>{
        const cached=await caches.match(event.request);
        if(cached)return cached;
        if(event.request.mode==='navigate')return caches.match('./index.html');
        return Response.error();
      })
  );
});
