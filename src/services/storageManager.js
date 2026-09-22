/**
 * 🛡️ Cross-Platform Persistent Storage Engine
 * Standard StorageManager API (Android, iOS Safari 15.2+, macOS, Windows, Linux)
 * 
 * Protects client-side localStorage/IndexedDB from eviction during low disk space.
 * Default is Standard Local Storage (Best-Effort) to honor user freedom.
 * Persistent mode is strictly opt-in by user choice.
 */

export const STORAGE_PREF_KEY = 'daily_verdict_storage_tier_pref';

export function getUserStorageTierPreference() {
  if (typeof window === 'undefined') return 'local';
  return localStorage.getItem(STORAGE_PREF_KEY) || 'local';
}

export function setUserStorageTierPreference(tier) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_PREF_KEY, tier);
  }
}

export function isPersistentStorageSupported() {
  return typeof navigator !== 'undefined' && 
         Boolean(navigator.storage && navigator.storage.persist && navigator.storage.persisted);
}

/**
 * Checks current persistence state and quota estimate
 */
export async function getStorageStatus() {
  const userPref = getUserStorageTierPreference();

  if (!isPersistentStorageSupported()) {
    return {
      supported: false,
      persisted: false,
      userPref,
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
      userPref,
      usageKb,
      quotaMb
    };
  } catch (err) {
    console.warn('Storage status inquiry error:', err);
    return {
      supported: true,
      persisted: false,
      userPref,
      usageKb: 0,
      quotaMb: 0
    };
  }
}

/**
 * Explicitly requests the browser/OS to protect stored data from eviction.
 * Sets user preference to 'persistent'.
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
    setUserStorageTierPreference(granted ? 'persistent' : 'local');
    const status = await getStorageStatus();
    return {
      supported: true,
      persisted: Boolean(granted),
      userPref: getUserStorageTierPreference(),
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
      userPref: getUserStorageTierPreference(),
      message: err?.message || 'Storage persistence request failed.'
    };
  }
}

/**
 * Sets preference to standard local storage (revokes persistent opt-in expectation)
 */
export function setStandardLocalStorageMode() {
  setUserStorageTierPreference('local');
  return {
    userPref: 'local',
    message: 'Switched to Standard Local Storage mode (Maximum Freedom).'
  };
}

/**
 * Only requests persistence if user explicitly chose 'persistent' tier.
 * Never requests on default load.
 */
export async function syncStoragePersistenceWithPreference() {
  if (getUserStorageTierPreference() === 'persistent') {
    return await requestPersistentStorage();
  }
  return {
    supported: isPersistentStorageSupported(),
    persisted: false,
    userPref: 'local',
    message: 'User opted for standard local storage mode.'
  };
}
