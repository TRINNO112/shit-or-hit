// Daily Verdict Service Worker for PWA Offline & Notifications
const CACHE_NAME = 'daily-verdict-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Let browser network handle live requests; fallback gracefully if offline
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});

// Listen for push notifications
self.addEventListener('push', (event) => {
  let payload = {
    title: 'Daily Verdict',
    body: 'Bhai karle aaj register! Din kaisa tha?',
    icon: '/vite.svg',
    badge: '/vite.svg'
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
    icon: payload.icon || '/vite.svg',
    badge: payload.badge || '/vite.svg',
    vibrate: [100, 50, 100],
    data: {
      url: '/'
    }
  };

  event.waitUntil(
    self.registration.showNotification(payload.title || '⚡ Daily Verdict', options)
  );
});

// Click on notification to focus or open app
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});
