// service-worker.js - Guarda este archivo en la raíz de tu proyecto

const CACHE_NAME = 'boda-laura-raul-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/imagenes/raul_laura_acu.png',
  '/imagenes/fachada.jpg',
  '/imagenes/timeline.jpeg',
  '/musica/bso.mp3'
];

// Instalación del Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache abierto');
        return cache.addAll(urlsToCache);
      })
  );
});

// Activación y limpieza de cachés antiguos
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Eliminando caché antigua:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Estrategia cache-first: intenta servir desde caché, luego red
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Si está en caché, devuélvelo
        if (response) {
          return response;
        }
        
        // Si no, haz una petición a la red
        return fetch(event.request).then(
          response => {
            // Verifica que sea una respuesta válida
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clona la respuesta
            const responseToCache = response.clone();

            // Guarda en caché para futuras peticiones
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
      .catch(() => {
        // Si todo falla, muestra una página offline personalizada (opcional)
        // return caches.match('/offline.html');
      })
  );
});