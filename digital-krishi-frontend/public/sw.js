// ============================================================
// KISAN SETU — ENTERPRISE PROGRESSIVE WEB APP (PWA) SERVICE WORKER
// Offline First, Network-First Fallback, Auto-Cache Invalidation
// ============================================================

const CACHE_NAME = 'kisan-setu-v1.0.3';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.jpg',
  '/icon-192.jpg',
  '/icon-512.jpg'
];

// 1. Install Event: Pre-cache Essential App Shell
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[ServiceWorker] Pre-cache warning:', err);
      });
    })
  );
});

// 2. Activate Event: Clean up Old Versioned Caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Listen for skip waiting command
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignore non-GET, chrome-extension, and third-party media streams
  if (request.method !== 'GET' || !url.protocol.startsWith('http')) {
    return;
  }

  // Bypass CDN video / media requests to prevent CORS issues
  if (url.pathname.endsWith('.mp4') || url.pathname.endsWith('.webm') || url.hostname.includes('mixkit')) {
    return;
  }

  // A. Navigation Requests (Page Routes like /register, /login, /farmer/...)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(async () => {
        const cache = await caches.open(CACHE_NAME);
        const cachedIndex = await cache.match('/index.html') || await cache.match('/');
        if (cachedIndex) return cachedIndex;
        return new Response('<!DOCTYPE html><html><body><h3>Kisan Setu Offline</h3><p>Please check your internet connection.</p></body></html>', {
          headers: { 'Content-Type': 'text/html' }
        });
      })
    );
    return;
  }

  // B. API Requests
  if (url.pathname.startsWith('/api') || url.pathname.includes('/api/')) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return networkResponse;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) return cached;
          return new Response(
            JSON.stringify({ offline: true, message: 'You are currently offline.' }),
            { status: 503, headers: { 'Content-Type': 'application/json' } }
          );
        })
    );
    return;
  }

  // C. Static Assets: Stale-While-Revalidate with Safe Fallback
  event.respondWith(
    caches.match(request).then(async (cachedResponse) => {
      if (cachedResponse) {
        // Fetch in background to update cache
        fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const copy = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
            }
          })
          .catch(() => {});
        return cachedResponse;
      }

      try {
        const networkResponse = await fetch(request);
        if (networkResponse && networkResponse.status === 200) {
          const copy = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return networkResponse;
      } catch (err) {
        // Fallback for missing resources
        return new Response('', { status: 408, statusText: 'Network request failed' });
      }
    })
  );
});

// 4. Push Notification Support
self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = { title: 'Kisan Setu Alert', body: event.data ? event.data.text() : 'New advisory update available.' };
  }

  const options = {
    body: data.body || 'Farm advisory update available.',
    icon: '/icon-192.svg',
    badge: '/favicon.svg',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/farmer/alerts'
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title || '🌾 Kisan Setu Advisory', options)
  );
});

// 5. Notification Click Handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url === targetUrl && 'focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
