/**
 * 🛡️ Cross-Platform Persistent Storage Engine
 * Standard StorageManager API (Android, iOS Safari 15.2+, macOS, Windows, Linux)
 * 
 * Protects client-side localStorage/IndexedDB from eviction during low disk space.
 */

export function isPersistentStorageSupported() {
  return typeof navigator !== 'undefined' && 
         Boolean(navigator.storage && navigator.storage.persist && navigator.storage.persisted);
}

/**
 * Checks current persistence state and quota estimate
 */
export async function getStorageStatus() {
  if (!isPersistentStorageSupported()) {
    return {
      supported: false,
      persisted: false,
      usageKb: 0,
      quotaMb: 0
    };
  }

  try {
    const isPersisted = await navigator.storage.persisted();
    let usageKb = 0;
    let quotaMb = 0;

    if (navigator.storage.estimate) {
      const estimate = await navigator.storage.estimate();
      usageKb = Math.round((estimate.usage || 0) / 1024);
      quotaMb = Math.round((estimate.quota || 0) / (1024 * 1024));
    }

    return {
      supported: true,
      persisted: Boolean(isPersisted),
      usageKb,
      quotaMb
    };
  } catch (err) {
    console.warn('Storage status inquiry error:', err);
    return {
      supported: true,
      persisted: false,
      usageKb: 0,
      quotaMb: 0
    };
  }
}

/**
 * Requests the browser/OS to permanently protect stored data from eviction
 */
export async function requestPersistentStorage() {
  if (!isPersistentStorageSupported()) {
    return {
      supported: false,
      persisted: false,
      message: 'StorageManager API not supported by this browser.'
    };
  }

  try {
    const granted = await navigator.storage.persist();
    const status = await getStorageStatus();
    return {
      supported: true,
      persisted: Boolean(granted),
      usageKb: status.usageKb,
      quotaMb: status.quotaMb,
      message: granted 
        ? 'Persistent storage granted! Browser eviction protection is active.'
        : 'Browser deferred persistent storage. Installing as PWA will lock persistence.'
    };
  } catch (err) {
    console.error('Failed to request persistent storage:', err);
    return {
      supported: true,
      persisted: false,
      message: err?.message || 'Storage persistence request failed.'
    };
  }
}
