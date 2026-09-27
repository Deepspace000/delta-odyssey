// Delta Odyssey service worker: lets Chrome and Edge install the game, and keeps a copy for offline play.
// Network first, and the game's own files skip the browser's short-term cache: GitHub Pages lets a browser reuse a
// page for 10 minutes, which made a fresh push look like the old version. Now each open asks the server whether
// anything changed (a "not modified" answer costs almost nothing), so a new push shows up straight away.
const CACHE='delta-odyssey-v1';
self.addEventListener('install',e=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('fetch',e=>{
  const req=e.request; if(req.method!=='GET')return;
  const same=new URL(req.url).origin===self.location.origin;
  // a page-load request can't be copied with new options, so same-site files are fetched by URL; a redirect goes back to the plain request
  const net=same?fetch(req.url,{cache:'no-cache',credentials:'same-origin'}).then(res=>res.redirected?fetch(req):res):fetch(req);
  e.respondWith(net.then(res=>{ if(same&&res.ok){const copy=res.clone(); caches.open(CACHE).then(c=>c.put(req,copy));} return res; })
    .catch(()=>caches.match(req,{ignoreSearch:true})));
});
