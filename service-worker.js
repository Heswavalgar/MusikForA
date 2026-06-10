/* ============================================================
   MusikForAll — service-worker.js
   ============================================================ */

const CACHE_NAME = 'musikforall-v1.6';

const ASSETS = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/app.js'
];

// Install — cache file utama
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activate — hapus cache lama
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch — cache first, fallback ke network
self.addEventListener('fetch', e => {
  // Jangan cache request ke Supabase (data harus selalu fresh)
  if (e.request.url.includes('supabase.co')) return;

  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
