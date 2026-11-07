const C='pokapoka-v8';
const F=['./','index.html','js/data.js?v=8','js/life_data.js?v=8','js/style_data.js?v=8','js/story_data.js?v=8','js/mini_data.js?v=8','js/gfx.js?v=8','js/audio.js?v=8','js/game.js?v=8','js/life.js?v=8','js/style.js?v=8','js/ui.js?v=8','js/style_ui.js?v=8','js/story.js?v=8','js/mini.js?v=8','js/bakery.js?v=8','js/village.js?v=8','js/kanji.js?v=8','js/mist.js?v=8','js/render.js?v=8','manifest.webmanifest','icon-192.png','icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(F)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(fetch(e.request).then(r=>{const cp=r.clone();caches.open(C).then(c=>c.put(e.request,cp)).catch(()=>{});return r;}).catch(()=>caches.match(e.request)));});
