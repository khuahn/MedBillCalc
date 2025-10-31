const CACHE_NAME = 'mbcalc-v1'; // DEPLOY:VERSION
const urlsToCache = [
  '/',
  '/index.html',
  '/mbc.js',
  '/mbc.css',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/manifest.json',
  '/note.html'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting(); // Force activate new SW immediately
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  clients.claim(); // Take control of all clients immediately
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
