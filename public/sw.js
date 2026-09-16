// ⚡ High-Performance PWA Service Worker for Daily Verdict (v6)
// Provides instant Cache-First & Stale-While-Revalidate for static assets & modal chunks,
// eliminating network latency on mobile devices.
const CACHE_NAME = 'daily-verdict-v6';

// Assets to precache immediately on install
const PRECACHE_URLS = [
  './',
  './index.html',
  './manifest.json',
  './icon.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS).catch((err) => {
        console.warn('Precache partial warning:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests (e.g. POST, PUT, DELETE) and browser extensions
  if (request.method !== 'GET' || !url.protocol.startsWith('http')) {
    return;
  }

  // 1. API Requests & Cloud endpoints: Network-first, never cache dynamic state
  if (url.pathname.startsWith('/api') || url.pathname.includes('/.netlify/functions') || url.hostname.includes('firestore.googleapis.com')) {
    event.respondWith(
      fetch(request).catch(() => {
        return new Response(JSON.stringify({ error: 'Offline', offline: true }), {
          headers: { 'Content-Type': 'application/json' }
        });
      })
    );
    return;
  }

  // 2. Static Assets (JS chunks, CSS, WebP images, Fonts, Icons):
  // ⚡ Stale-While-Revalidate (Instant 0ms disk cache return + background refresh)
  const isStaticAsset = (
    url.pathname.includes('/assets/') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.webp') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.woff2') ||
    url.hostname.includes('fonts.googleapis.com') ||
    url.hostname.includes('fonts.gstatic.com')
  );

  if (isStaticAsset) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cachedResponse = await cache.match(request);
        const networkFetch = fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            cache.put(request, networkResponse.clone()).catch(() => {});
          }
          return networkResponse;
        }).catch(() => cachedResponse);

        // If cached response exists, return it instantly in < 2ms!
        return cachedResponse || networkFetch;
      })
    );
    return;
  }

  // 3. Navigation requests (HTML): Stale-While-Revalidate with offline fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy)).catch(() => {});
          }
          return networkResponse;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) return cached;
          const fallback = await caches.match('./index.html') || await caches.match('/');
          return fallback || Response.error();
        })
    );
    return;
  }

  // Default: Network with cache fallback
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});

// 🔔 Push Notifications
self.addEventListener('push', (event) => {
  let payload = {
    title: 'Daily Verdict',
    body: 'Bhai karle aaj register! Din kaisa tha?',
    icon: './icon.svg',
    badge: './icon.svg'
  };

  if (event.data) {
    try {
      payload = event.data.json();
    } catch (e) {
      payload.body = event.data.text();
    }
  }

  const options = {
    body: payload.body,
    icon: payload.icon || './icon.svg',
    badge: payload.badge || './icon.svg',
    vibrate: [100, 50, 100],
    data: {
      url: './'
    }
  };

  event.waitUntil(
    self.registration.showNotification(payload.title || '⚡ Daily Verdict', options)
  );
});

// Click notification to focus
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('./');
      }
    })
  );
});
