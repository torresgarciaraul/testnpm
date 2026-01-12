const CACHE_NAME = 'boda-laura-raul-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/src/styles/main.css',
  '/src/styles/visual.css',
  '/src/styles/envelope.css',
  '/src/js/main.js',
  '/src/js/effects.js',
  '/manifest.json',
  '/imagenes/raul_laura_acu.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});