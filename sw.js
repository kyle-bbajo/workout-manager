// 네트워크 우선, 오프라인일 때만 저장본 사용
const CACHE = 'aiwm-v1';
self.addEventListener('install', e => { self.skipWaiting(); e.waitUntil(caches.open(CACHE).then(c => c.addAll(['./', './index.html', './manifest.json', './fonts/pretendardvariable-dynamic-subset.css']))); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const same = url.origin === location.origin;
  const mp = /cdn\.jsdelivr\.net\/npm\/@mediapipe|mediapipe-models/.test(req.url);
  if (!same && !mp) return;
  e.respondWith(fetch(req).then(res => {
    if (res.ok && (same || mp)) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
    return res;
  }).catch(() => caches.match(req)));
});
