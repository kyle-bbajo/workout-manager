// 네트워크 우선, 오프라인일 때만 저장본 사용
const CACHE = 'aiwm-v2', MPC = 'aiwm-mp';   // MediaPipe 모델·실행 파일은 버전이 바뀌어도 남김
self.addEventListener('install', e => { self.skipWaiting(); e.waitUntil(caches.open(CACHE).then(c => c.addAll(['./', './index.html', './manifest.json', './fonts/pretendardvariable-dynamic-subset.css']))); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE && k !== MPC && !k.startsWith('aiwm-models')).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const same = url.origin === location.origin;
  const mp = /cdn\.jsdelivr\.net\/npm\/@mediapipe|mediapipe-models/.test(req.url);
  if (!same && !mp) return;
  if (same && /\/(models|vendor)\//.test(url.pathname)) return;   // 큰 모델·실행 파일은 앱이 따로 보관
  e.respondWith(fetch(req).then(res => {
    if (res.ok && (same || mp)) { const copy = res.clone(); caches.open(mp ? MPC : CACHE).then(c => c.put(req, copy)); }
    return res;
  }).catch(() => caches.match(req).then(r => r || Response.error())));
});
