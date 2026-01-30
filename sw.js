const CACHE_NAME = 'safari-match-v3';

// All external resources required to run the game without internet
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './index.tsx',
  './App.tsx',
  './types.ts',
  './constants.ts',
  './components/GameEngine.tsx',
  './components/SplashScreen.tsx',
  './components/HomeScreen.tsx',
  './components/ModeSelector.tsx',
  './components/SettingsScreen.tsx',
  './components/GameOverScreen.tsx',
  './components/InfoScreen.tsx',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Fredoka:wght@400;600;700&display=swap',
  'https://esm.sh/react@19.0.0',
  'https://esm.sh/react-dom@19.0.0',
  'https://esm.sh/react-dom@19.0.0/client',
  'https://esm.sh/lucide-react@0.460.0'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Service Worker: Caching Assets for Offline Use');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Clearing Old Cache');
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Strategy: Cache-First, falling back to Network
  // This is best for offline games to ensure instant loading
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response; // Return from cache
      }
      return fetch(event.request).then((networkResponse) => {
        // Cache new successful requests dynamically
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            // Only cache valid http/https requests
            if (event.request.url.startsWith('http')) {
              cache.put(event.request, responseToCache);
            }
          });
        }
        return networkResponse;
      }).catch(() => {
        // If both fail, we could return an offline page here if needed
      });
    })
  );
});