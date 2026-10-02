// ⚡ High-Performance PWA Service Worker for Daily Verdict (v8)
// Provides instant Cache-First & Stale-While-Revalidate for static assets & modal chunks,
// eliminating network latency on mobile devices.
const CACHE_NAME = 'daily-verdict-v10';

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
      return Promise.allSettled(
        PRECACHE_URLS.map((url) => cache.add(url))
      );
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
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

  // ⚡ DEV BYPASS: NEVER intercept Vite dev server, HMR, or local development modules!
  if (
    url.hostname === 'localhost' ||
    url.hostname === '127.0.0.1' ||
    url.port === '5888' ||
    url.pathname.startsWith('/@') ||
    url.pathname.startsWith('/src/') ||
    url.pathname.startsWith('/node_modules/') ||
    url.searchParams.has('t')
  ) {
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
        if (cachedResponse) {
          fetch(request).then((networkResponse) => {
            if (networkResponse && (networkResponse.status === 200 || networkResponse.type === 'opaque')) {
              cache.put(request, networkResponse.clone()).catch(() => {});
            }
          }).catch(() => {});
          return cachedResponse;
        }

        try {
          const networkResponse = await fetch(request);
          if (networkResponse && (networkResponse.status === 200 || networkResponse.type === 'opaque')) {
            cache.put(request, networkResponse.clone()).catch(() => {});
          }
          return networkResponse;
        } catch (fetchErr) {
          return new Response('Network error', { status: 503, statusText: 'Service Unavailable' });
        }
      })
    );
    return;
  }

  // 3. Navigation requests (HTML): Stale-While-Revalidate with offline fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && (networkResponse.status === 200 || networkResponse.type === 'opaque')) {
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
    fetch(request).catch(() => caches.match(request).then((r) => r || Response.error()))
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

// Helper: Timezone-safe local YYYY-MM-DD date string
function getLocalDateStr() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// Click notification to focus or execute 1-Tap Verdict actions
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const baseUrl = (event.notification.data && event.notification.data.url) || self.registration.scope || '/';
  const todayStr = getLocalDateStr();

  // 1-Tap Quick Rating Action from Lockscreen / Notification Shade (Button or Inline Input)
  let rating = null;
  let notes = null;
  let spheres = null;
  let nonNegotiables = null;

  if (event.action && event.action.startsWith('rate-')) {
    if (event.action === 'rate-inline' && event.reply) {
      const raw = event.reply.trim();

      // Guard: Check for out-of-range initial numbers (e.g. 0, 6, 7, 8, 9)
      const invalidNumMatch = raw.match(/^([06-9]+)/);
      if (invalidNumMatch) {
        event.waitUntil(
          self.registration.showNotification('Format Error: Score Out of Range', {
            body: `Ratings must be between 1★ and 5★. Found "${invalidNumMatch[1]}". Your entry was not recorded to protect your diary.`,
            icon: './icon.svg',
            badge: './icon.svg'
          })
        );
        return;
      }

      // 1. Non-Negotiables Binary Input (e.g. "101", "1 0 1", "1,0,1" followed by optional notes)
      const binaryMatch = raw.match(/^([01]{2,8}|(?:[01][\s,/-]){1,7}[01])(?:\s*[-:,.]?\s*(.*))?$/s);
      
      // 2. Multi-Sphere Input (e.g. "321", "453", "5 4 3" followed by optional notes)
      const sphereMatch = raw.match(/^([1-5]{2,6}|(?:[1-5][\s,/-]){1,5}[1-5])(?:\s*[-:,.]?\s*(.*))?$/s);

      if (binaryMatch && !raw.match(/^[2-5]/)) {
        const binDigits = binaryMatch[1].replace(/[\s,/-]/g, '').split('');
        const ones = binDigits.filter(d => d === '1').length;
        const total = binDigits.length;
        const calc = total > 0 ? (ones / total) * 5.0 : 1;
        rating = Math.max(1, Math.min(5, Math.round(calc)));
        notes = (binaryMatch[2] && binaryMatch[2].trim()) ? binaryMatch[2].trim() : null;
        nonNegotiables = { digits: binDigits.join(''), ones, total, checked: binDigits.map(d => d === '1') };
      } else if (sphereMatch) {
        const digits = sphereMatch[1].replace(/[\s,/-]/g, '').split('').map(d => parseInt(d, 10));
        const sum = digits.reduce((a, b) => a + b, 0);
        const avg = digits.length > 0 ? sum / digits.length : 3;
        rating = Math.max(1, Math.min(5, Math.round(avg)));
        notes = (sphereMatch[2] && sphereMatch[2].trim()) ? sphereMatch[2].trim() : null;
        spheres = digits;
      } else {
        // 3. Check if input starts with a single number 1-5 followed by optional note
        const numMatch = raw.match(/^([1-5])(?:\s*[-:,.]?\s*(.*))?$/s);
        if (numMatch) {
          rating = parseInt(numMatch[1], 10);
          if (numMatch[2] && numMatch[2].trim()) {
            notes = numMatch[2].trim();
          }
        } else {
          // 4. Keyword fallback with remaining text as note
          const lower = raw.toLowerCase();
          if (lower.startsWith('shit') || lower.startsWith('rough') || lower.startsWith('bad') || lower.startsWith('terrible')) {
            rating = 1;
            notes = raw.replace(/^(shit|rough|bad|terrible)\s*[-:,.]?\s*/i, '').trim() || null;
          } else if (lower.startsWith('down') || lower.startsWith('sad') || lower.startsWith('low')) {
            rating = 2;
            notes = raw.replace(/^(down|sad|low)\s*[-:,.]?\s*/i, '').trim() || null;
          } else if (lower.startsWith('ok') || lower.startsWith('okay') || lower.startsWith('fine') || lower.startsWith('average') || lower.startsWith('meh')) {
            rating = 3;
            notes = raw.replace(/^(ok|okay|fine|average|meh)\s*[-:,.]?\s*/i, '').trim() || null;
          } else if (lower.startsWith('good') || lower.startsWith('decent') || lower.startsWith('nice')) {
            rating = 4;
            notes = raw.replace(/^(good|decent|nice)\s*[-:,.]?\s*/i, '').trim() || null;
          } else if (lower.startsWith('hit') || lower.startsWith('peak') || lower.startsWith('great') || lower.startsWith('awesome') || lower.startsWith('fire')) {
            rating = 5;
            notes = raw.replace(/^(hit|peak|great|awesome|fire)\s*[-:,.]?\s*/i, '').trim() || null;
          } else {
            // 5. Freeform text reflection (e.g. Sabbatical chronicle or Sanctuary check-in)
            notes = raw;
          }
        }
      }
    } else {
      const parsed = parseInt(event.action.replace('rate-', ''), 10);
      if (parsed >= 1 && parsed <= 5) {
        rating = parsed;
      }
    }
  }

  if (rating !== null || notes !== null) {
    const params = new URLSearchParams();
    if (rating !== null) params.set('quickRate', String(rating));
    if (notes) params.set('notes', notes);
    if (spheres) params.set('spheres', JSON.stringify(spheres));
    if (nonNegotiables) params.set('anchors', JSON.stringify(nonNegotiables));
    params.set('date', todayStr);
    const rateUrl = new URL(`/?${params.toString()}`, baseUrl).href;

    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then(async (clientList) => {
        let focusedClient = null;
        // Broadcast rating directly to open tabs and focus the first one
        for (const client of clientList) {
          client.postMessage({
            type: 'REMOTE_NOTIFICATION_RATING',
            dateStr: todayStr,
            rating: rating,
            notes: notes,
            spheres: spheres,
            nonNegotiables: nonNegotiables
          });
          if ('focus' in client && !focusedClient) {
            focusedClient = client;
            await client.focus().catch(() => {});
          }
        }

        // If no window is currently open, launch a new window with quickRate, notes and date
        if (!focusedClient && clients.openWindow) {
          return clients.openWindow(rateUrl);
        }
      })
    );
    return;
  }

  // Standard notification click: Focus active app window or open website URL
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(async (clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          client.postMessage({ type: 'NOTIFICATION_OPEN_URL', url: baseUrl, dateStr: todayStr });
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(baseUrl);
      }
    })
  );
});
