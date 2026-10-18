// Neeksha's Summer Bar — offline-capable service worker.
// Strategy: network-first for code (HTML/CSS/JS) so updates land immediately
// when online; cache-first for fonts/icons (they rarely change) for speed.
// Either way the app works fully offline from the precache.
const CACHE = 'summer-bar-v4';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './css/styles.css',
  './js/data.js',
  './js/app.js',
  './js/cocktail.js',
  './js/reactions.js',
  './js/screens.js',
  './js/glaze.js',
  './js/drink.js',
  './js/file.js',
  './js/fx.js',
  './js/pwa.js',
  './fonts/PlayfairDisplay-var-latin.woff2',
  './fonts/DMSans-var-latin.woff2',
  './icons/icon-192.png',
  './icons/icon-512.png',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// fonts and icons: content-stable, cache-first
const CACHE_FIRST = /\.(?:woff2|png|ico|svg)$/i;

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);

  if (CACHE_FIRST.test(url.pathname)) {
    e.respondWith(
      caches.match(e.request, { ignoreSearch: true }).then(hit =>
        hit || fetch(e.request).then(res => {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, copy));
          return res;
        })
      )
    );
    return;
  }

  // code + navigations: network-first, fall back to cache when offline
  e.respondWith(
    fetch(e.request).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy));
      return res;
    }).catch(() =>
      caches.match(e.request, { ignoreSearch: true }).then(hit =>
        hit || (e.request.mode === 'navigate' ? caches.match('./index.html') : Response.error())
      )
    )
  );
});
