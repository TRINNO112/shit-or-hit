/**
 * ⚡ PWA Auto-Update & Stale Worker Elimination Engine
 * 
 * Automatically detects new deploys, polls for updates on app focus / online events,
 * and activates new service workers safely without interrupting user reflections or force-reloading mid-thought.
 */

let initialized = false;
let updateCheckInterval = null;
let isRefreshing = false;
let waitingWorkerInstance = null;

/**
 * Checks whether the user is actively typing, interacting, or viewing a modal.
 */
export function isUserBusy() {
  if (typeof document === 'undefined') return false;
  
  const active = document.activeElement;
  if (active && (
    active.tagName === 'TEXTAREA' ||
    active.tagName === 'INPUT' ||
    active.tagName === 'SELECT' ||
    active.isContentEditable
  )) {
    return true;
  }

  // Check if any modal, drawer, or dialog overlay is active
  if (document.querySelector('[role="dialog"], .fixed.inset-0, .z-50, .z-80, .z-85')) {
    return true;
  }

  return false;
}

/**
 * Explicit user-triggered activation of the waiting service worker.
 */
export function applyWaitingUpdate() {
  if (waitingWorkerInstance) {
    waitingWorkerInstance.postMessage({ type: 'SKIP_WAITING' });
  } else {
    window.location.reload();
  }
}

/**
 * Initializes proactive PWA update polling and controller change handlers.
 * @param {Function} onUpdateAvailable - Optional callback if UI wants to display a pill.
 */
export function initPwaAutoUpdate(onUpdateAvailable) {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  // Guard against double-initialization (HMR, remounts)
  if (initialized) {
    return;
  }
  initialized = true;

  // 1. Skip completely in local development mode
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return;
  }

  // 2. Controller Change Listener: reload when new worker takes over
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!isRefreshing) {
      isRefreshing = true;
      console.log('⚡ [PWA Engine] New Service Worker activated. Reloading to apply update...');
      // 200ms buffer to allow any pending writes to complete cleanly
      setTimeout(() => {
        window.location.reload();
      }, 200);
    }
  });

  // 3. Setup proactive update triggers on ready
  navigator.serviceWorker.ready.then((registration) => {
    // Initial check on load
    checkForUpdate(registration);

    // If a worker is already waiting in the wings
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

    // 4. Trigger update check on App Focus / Visibility Change
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
 * Handles a waiting service worker safely without disrupting user reflection
 */
function handleWaitingWorker(worker, onUpdateAvailable) {
  if (!worker) return;
  waitingWorkerInstance = worker;

  const notifyUser = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('pwa-update-available', {
        detail: { applyUpdate: applyWaitingUpdate }
      }));
    }
    if (typeof onUpdateAvailable === 'function') {
      onUpdateAvailable(applyWaitingUpdate);
    }
  };

  // If user is actively typing or inside a modal, defer and inform without force-reloading
  if (isUserBusy()) {
    notifyUser();
    return;
  }

  // If onUpdateAvailable callback is hooked, let user initiate
  if (onUpdateAvailable) {
    notifyUser();
  } else {
    // If not busy, dispatch global event first; only activate if window is hidden
    notifyUser();
    if (document.visibilityState === 'hidden') {
      worker.postMessage({ type: 'SKIP_WAITING' });
    }
  }
}
