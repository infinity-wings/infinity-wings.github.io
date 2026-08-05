const CACHE='iw-cache-8.63-tablet-render-v1';
const ASSETS=[
  './',
  './index.html',
  './style.css?v=8.63.0',
  './game.js?v=8.63.0',
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
  './assets/menu/ui-start-frame.png',
  './assets/menu/ui-small-frame.png',
  './assets/ships/player-fighter-v2.png',
  './assets/ships/enemy-fighter-v2.png',
  './assets/ships/boss-dreadnought-v2.png'
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
