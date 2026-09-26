/**
 * ⚡ PWA Auto-Update & Stale Worker Elimination Engine
 * 
 * Automatically detects new deploys, polls for updates on app focus / online events,
 * and activates new service workers seamlessly without user friction or stale asset freezes.
 */

let updateCheckInterval = null;
let isRefreshing = false;

/**
 * Initializes proactive PWA auto-update polling and controller change handlers.
 * @param {Function} onUpdateAvailable - Optional callback if UI wants to display a pill.
 */
export function initPwaAutoUpdate(onUpdateAvailable) {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  // 1. Skip completely in local development mode
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return;
  }

  // 2. Controller Change Listener: reload when new worker takes over
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!isRefreshing) {
      isRefreshing = true;
      console.log('⚡ [PWA Engine] New Service Worker activated. Reloading to apply update...');
      // Small 150ms buffer to allow any pending IndexedDB/localStorage writes to complete
      setTimeout(() => {
        window.location.reload();
      }, 150);
    }
  });

  // 3. Setup proactive update triggers on ready
  navigator.serviceWorker.ready.then((registration) => {
    // Initial check on load
    checkForUpdate(registration);

    // If a worker is already waiting in the wings, trigger skipWaiting immediately
    if (registration.waiting) {
      handleWaitingWorker(registration.waiting, onUpdateAvailable);
    }

    // Listen for new workers entering the pipeline
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            handleWaitingWorker(newWorker, onUpdateAvailable);
          }
        });
      }
    });

    // 4. Trigger update check on App Focus / Visibility Change (e.g. phone unlock, tab switch)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        checkForUpdate(registration);
      }
    });

    // 5. Trigger update check when returning online
    window.addEventListener('online', () => {
      checkForUpdate(registration);
    });

    // 6. Polling heartbeat every 15 minutes when online
    if (updateCheckInterval) clearInterval(updateCheckInterval);
    updateCheckInterval = setInterval(() => {
      if (navigator.onLine) {
        checkForUpdate(registration);
      }
    }, 15 * 60 * 1000);

  }).catch((err) => {
    console.warn('⚠️ [PWA Engine] Service worker ready check skipped:', err);
  });
}

/**
 * Safely asks the browser to check the server for a newer sw.js
 */
export function checkForUpdate(registration) {
  if (!registration || !navigator.onLine) return;
  try {
    registration.update().catch(() => {});
  } catch (e) {}
}

/**
 * Handles a waiting service worker by signaling skipWaiting
 */
function handleWaitingWorker(worker, onUpdateAvailable) {
  if (!worker) return;

  // Check if user is actively typing in a reflection textarea to avoid interrupting their flow
  const isTyping = document.activeElement && (
    document.activeElement.tagName === 'TEXTAREA' ||
    document.activeElement.tagName === 'INPUT'
  );

  if (isTyping && onUpdateAvailable) {
    // Give user an on-screen pill if they are actively drafting
    onUpdateAvailable(() => {
      worker.postMessage({ type: 'SKIP_WAITING' });
    });
  } else {
    // Auto-activate immediately for seamless updates
    worker.postMessage({ type: 'SKIP_WAITING' });
  }
}
