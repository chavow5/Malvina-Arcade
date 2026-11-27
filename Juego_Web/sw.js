const CACHE_NAME = 'malvinas-arcade-v1';
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/styles.css',
  '/edicion.js',
  '/logica.js',
  '/juego.js',
  '/firebase-service.js',
  '/manifest.webmanifest',
  '/logo_heladeria_malvinas.png',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(CORE_ASSETS))
      .catch(() => {})
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // Nunca interceptar llamadas externas (base de datos, autenticación, fuentes externas)
  if (url.origin !== self.location.origin) {
    return;
  }

  // Network-First para HTML, JS, CSS y manifiesto (siempre trae la última versión publicada)
  const isCodeOrDoc =
    req.mode === 'navigate' ||
    url.pathname === '/' ||
    /\.(html|js|css|webmanifest)$/i.test(url.pathname);

  if (isCodeOrDoc) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, copy)).catch(() => {});
          }
          return res;
        })
        .catch(() => caches.match(req).then((cached) => cached || caches.match('/index.html')))
    );
    return;
  }

  // Cache-First con actualización en segundo plano para imágenes y sprites
  event.respondWith(
    caches.match(req).then((cached) => {
      const networkFetch = fetch(req)
        .then((res) => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, copy)).catch(() => {});
          }
          return res;
        })
        .catch(() => cached);

      return cached || networkFetch;
    })
  );
});
