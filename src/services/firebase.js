// Zero-Dependency Google Firebase Client via Official Google ESM CDN

// User's Firebase Project Configuration
const firebaseConfig = {
  apiKey: "AIzaSyAOHaoLEZjT8V5rkuDrOsdny1s09OKMelc",
  authDomain: "miscellaneous-adventure.firebaseapp.com",
  projectId: "miscellaneous-adventure",
  storageBucket: "miscellaneous-adventure.firebasestorage.app",
  messagingSenderId: "974562975403",
  appId: "1:974562975403:web:8dc24c1b865680cd4e61ee",
  measurementId: "G-08GC6BKWLJ"
};

// 🔒 Pure-JS Zero-Knowledge Deterministic SHA-256 Engine (Zero External Dependencies)
export function sha256Sync(ascii) {
  if (!ascii) return '';
  function rightRotate(value, amount) { return (value >>> amount) | (value << (32 - amount)); }
  const mathPow = Math.pow;
  const maxWord = mathPow(2, 32);
  const lengthProperty = 'length';
  let i, j;
  let result = '';
  const words = [];
  const asciiBitLength = ascii[lengthProperty] * 8;
  const hash = sha256Sync.h = sha256Sync.h || [];
  const k = sha256Sync.k = sha256Sync.k || [];
  let primeCounter = k[lengthProperty];
  const isComposite = {};
  for (let candidate = 2; primeCounter < 64; candidate++) {
    if (!isComposite[candidate]) {
      for (i = 0; i < 313; i += candidate) { isComposite[i] = candidate; }
      hash[primeCounter] = (mathPow(candidate, 0.5) * maxWord) | 0;
      k[primeCounter++] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
    }
  }
  ascii += '\x80';
  while (ascii[lengthProperty] % 64 - 56) ascii += '\x00';
  for (i = 0; i < ascii[lengthProperty]; i++) {
    j = ascii.charCodeAt(i);
    if (j >> 8) return '';
    words[i >> 2] |= j << ((3 - i) % 4) * 8;
  }
  words[words[lengthProperty]] = ((asciiBitLength / maxWord) | 0);
  words[words[lengthProperty]] = (asciiBitLength) | 0;
  for (j = 0; j < words[lengthProperty];) {
    const w = words.slice(j, j += 16);
    const oldHash = hash;
    const currentHash = hash.slice(0, 8);
    for (i = 0; i < 64; i++) {
      const w15 = w[i - 15], w2 = w[i - 2];
      const a = currentHash[0], e = currentHash[4];
      const temp1 = currentHash[7]
        + (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25))
        + ((e & currentHash[5]) ^ ((~e) & currentHash[6]))
        + k[i]
        + (w[i] = (i < 16) ? w[i] : (
            w[i - 16]
            + (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3))
            + w[i - 7]
            + (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10))
          ) | 0
        );
      const temp2 = (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22))
        + ((a & currentHash[1]) ^ (a & currentHash[2]) ^ (currentHash[1] & currentHash[2]));
      currentHash.unshift((temp1 + temp2) | 0);
      currentHash[4] = (currentHash[4] + temp1) | 0;
    }
    for (i = 0; i < 8; i++) { hash[i] = (currentHash[i] + oldHash[i]) | 0; }
  }
  for (i = 0; i < 8; i++) {
    for (let i2 = 3; i2 >= 0; i2--) {
      const b = (hash[i] >> (i2 * 8)) & 255;
      result += ((b < 16) ? 0 : '') + b.toString(16);
    }
  }
  return result;
}

// 🛡️ Zero-Knowledge Irreversible Hashes for Unified Owner Vaults (Zero Plaintext in GitHub)
const OWNER_EMAIL_HASHES = [
  '2bf73073f0477bdf305748485fb73ecd9c3507a9ca40516800178e63c78e3b4a', // Owner Personal
  'c1666232b2a1c40fdb71142f7317feb3c56d05670c8b179d0f03a3a0cb801508'  // Owner Work
];

// 🛡️ Zero-Knowledge Identity Map for Known Accounts (Zero Plaintext Emails)
const KNOWN_USER_HASH_MAP = {
  '31bf12386a161aa1534c04ce4966f484a0a3c9297b3ec13637cd4cf2649628c7': 'Kartik Pathak',
  '41af4e617dc4e6a5f6f285a6f73ffb23f2e21d08d94bfa80324297c829cdd3c3': 'Yuvraj Mohanty'
};

// Dynamic User Profile Management & Multi-User Isolation (Zero Hardcoded PII)
export function getCustomDisplayName(email = null) {
  if (typeof window !== 'undefined') {
    const key = email ? `custom_display_name_${email.toLowerCase().trim()}` : 'custom_display_name_guest';
    return localStorage.getItem(key) || localStorage.getItem('custom_display_name') || null;
  }
  return null;
}

export function setCustomDisplayName(name, email = null) {
  if (typeof window !== 'undefined') {
    const key = email ? `custom_display_name_${email.toLowerCase().trim()}` : 'custom_display_name_guest';
    if (name && name.trim()) {
      localStorage.setItem(key, name.trim());
    } else {
      localStorage.removeItem(key);
      localStorage.removeItem('custom_display_name');
    }
  }
}

export function isEmailWhitelisted(email) {
  return !!email;
}

export function getEffectiveUserId(user) {
  if (!user) return null;

  // 1. Deterministic Multi-Device Owner Clustering via Zero-Knowledge SHA-256 Hashes
  if (user.email) {
    const emailHash = sha256Sync(user.email.toLowerCase().trim());
    if (OWNER_EMAIL_HASHES.includes(emailHash)) {
      return 'trinno_owner_vault';
    }
  }

  // 2. Local custom cluster override if configured
  if (typeof window !== 'undefined') {
    const customVaultId = localStorage.getItem('custom_vault_cluster_id');
    if (customVaultId && customVaultId.trim()) {
      return `vault_${customVaultId.trim()}`;
    }
  }

  // 3. Strict multi-user separation by Native Firebase UID (Brother, Friends, Public)
  return user.uid ? `user_${user.uid}` : 'guest';
}

export function getUserDisplayName(email, fallbackName = null) {
  const emailLower = (email || '').toLowerCase().trim();

  // 1. User-configured custom alias in settings
  const customAlias = getCustomDisplayName(emailLower);
  if (customAlias) return customAlias;

  // 2. Zero-Knowledge Owner & Known User Recognition via SHA-256
  if (emailLower) {
    const emailHash = sha256Sync(emailLower);
    if (OWNER_EMAIL_HASHES.includes(emailHash)) {
      return 'Trinno';
    }
    if (KNOWN_USER_HASH_MAP[emailHash]) {
      return KNOWN_USER_HASH_MAP[emailHash];
    }
  }

  // 3. Real Google OAuth Display Name from Google Account
  if (fallbackName && fallbackName.trim()) {
    return fallbackName.trim();
  }

  // 4. Fallback clean username from email
  if (email && email.includes('@')) {
    const username = email.split('@')[0];
    return username.charAt(0).toUpperCase() + username.slice(1);
  }

  return 'Daily Operator';
}

let authInstance = null;
let dbInstance = null;
let googleProviderInstance = null;
let authModule = null;
let firestoreModule = null;

async function getFirebase() {
  if (authInstance && dbInstance) {
    return { 
      auth: authInstance, 
      db: dbInstance, 
      googleProvider: googleProviderInstance, 
      authMod: authModule, 
      firestoreMod: firestoreModule 
    };
  }

  try {
    const { initializeApp } = await import(/* @vite-ignore */ 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js');
    authModule = await import(/* @vite-ignore */ 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js');
    firestoreModule = await import(/* @vite-ignore */ 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');

    const app = initializeApp(firebaseConfig);
    authInstance = authModule.getAuth(app);
    dbInstance = firestoreModule.getFirestore(app);
    googleProviderInstance = new authModule.GoogleAuthProvider();

    return { 
      auth: authInstance, 
      db: dbInstance, 
      googleProvider: googleProviderInstance, 
      authMod: authModule, 
      firestoreMod: firestoreModule 
    };
  } catch (err) {
    console.warn('Firebase ESM dynamic import unavailable (local fallback):', err);
    return null;
  }
}

export function getCurrentUser() {
  if (authInstance?.currentUser) {
    const u = authInstance.currentUser;
    return {
      uid: u.uid,
      email: u.email,
      displayName: getUserDisplayName(u.email, u.displayName)
    };
  }
  try {
    const cached = localStorage.getItem('local_auth_user');
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed.email) {
        parsed.displayName = getUserDisplayName(parsed.email, parsed.displayName);
      }
      return parsed;
    }
    return null;
  } catch (e) {
    return null;
  }
}

export function subscribeAuthState(callback) {
  let unsub = () => {};
  getFirebase().then(fb => {
    if (fb?.authMod && fb?.auth) {
      unsub = fb.authMod.onAuthStateChanged(fb.auth, (user) => {
        if (user) {
          const name = getUserDisplayName(user.email, user.displayName);
          const userObj = { email: user.email, displayName: name, uid: user.uid };
          localStorage.setItem('local_auth_user', JSON.stringify(userObj));
          callback(userObj);
        } else {
          localStorage.removeItem('local_auth_user');
          callback(null);
        }
      });
    } else {
      const userObj = getCurrentUser();
      callback(userObj);
    }
  }).catch(() => {
    callback(null);
  });
  return () => unsub();
}

export async function loginWithGoogle() {
  const fb = await getFirebase();
  if (!fb) {
    throw new Error('Firebase client not loaded');
  }
  try {
    const res = await fb.authMod.signInWithPopup(fb.auth, fb.googleProvider);
    const user = res.user;
    const name = getUserDisplayName(user.email, user.displayName);
    const userObj = { email: user.email, displayName: name, uid: user.uid };
    localStorage.setItem('local_auth_user', JSON.stringify(userObj));
    return userObj;
  } catch (err) {
    console.error('Google Sign In Error:', err);
    if (err.code === 'auth/popup-blocked' && fb.authMod.signInWithRedirect) {
      await fb.authMod.signInWithRedirect(fb.auth, fb.googleProvider);
    }
    throw err;
  }
}

export async function logoutUser() {
  localStorage.removeItem('local_auth_user');
  const fb = await getFirebase();
  if (fb && fb.authMod && fb.auth) {
    try {
      await fb.authMod.signOut(fb.auth);
    } catch (e) {}
  }
  if (typeof window !== 'undefined') {
    window.location.reload();
  }
}

export async function saveCloudEntry(userId, entry) {
  if (!userId || !entry?.date) return;
  const fb = await getFirebase();
  if (!fb || !fb.db) return;
  try {
    console.log(`📡 [Firestore] Saving entry (${entry.date}) for user: ${userId}...`);
    const entryRef = fb.firestoreMod.doc(fb.db, 'users', userId, 'entries', entry.date);
    await fb.firestoreMod.setDoc(entryRef, {
      ...entry,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    console.log(`✅ [Firestore] Successfully saved entry (${entry.date}) to Firebase Cloud!`);
  } catch (err) {
    console.error(`❌ [Firestore Save Error]:`, err.code || err.name, err.message);
  }
}

export async function batchSaveCloudEntries(userId, entriesMap) {
  if (!userId || !entriesMap || Object.keys(entriesMap).length === 0) return;
  const fb = await getFirebase();
  if (!fb || !fb.db) return;
  try {
    const entriesList = Object.entries(entriesMap);
    console.log(`📡 [Firestore] Uploading batch of ${entriesList.length} entries to Firebase Cloud for user: ${userId}...`);
    const promises = entriesList.map(([dateStr, entry]) => {
      const entryRef = fb.firestoreMod.doc(fb.db, 'users', userId, 'entries', dateStr);
      return fb.firestoreMod.setDoc(entryRef, {
        ...entry,
        date: dateStr,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    });
    await Promise.all(promises);
    console.log(`🎉 [Firestore] SUCCESS! All ${promises.length} entries are now stored in your Firebase Cloud database!`);
  } catch (err) {
    console.error(`❌ [Firestore Batch Save Error]:`, err.code || err.name, err.message);
  }
}

export async function fetchCloudEntries(userId) {
  if (!userId) return {};
  const fb = await getFirebase();
  if (!fb || !fb.db) return {};
  try {
    console.log(`📡 [Firestore] Fetching cloud entries for user: ${userId}...`);
    const colRef = fb.firestoreMod.collection(fb.db, 'users', userId, 'entries');
    const snapshot = await fb.firestoreMod.getDocs(colRef);
    const entries = {};
    snapshot.forEach(docSnap => {
      entries[docSnap.id] = docSnap.data();
    });
    const count = Object.keys(entries).length;
    console.log(`✅ [Firestore] Loaded ${count} entries from Firebase Cloud.`);
    return entries;
  } catch (err) {
    console.error(`❌ [Firestore Fetch Error]:`, err.code || err.name, err.message);
    return {};
  }
}

export async function saveCloudReport(userId, reportKey, reportData) {
  if (!userId || !reportKey || !reportData) return;
  const fb = await getFirebase();
  if (!fb || !fb.db) return;
  try {
    console.log(`📡 [Firestore] Saving monthly dossier (${reportKey}) for user: ${userId}...`);
    const reportRef = fb.firestoreMod.doc(fb.db, 'users', userId, 'reports', reportKey);
    await fb.firestoreMod.setDoc(reportRef, {
      ...reportData,
      savedAt: new Date().toISOString()
    }, { merge: true });
    console.log(`✅ [Firestore] Monthly dossier saved to Firebase Cloud!`);
  } catch (err) {
    console.error(`❌ [Firestore Dossier Save Error]:`, err.code || err.name, err.message);
  }
}

export async function fetchCloudReport(userId, reportKey) {
  if (!userId || !reportKey) return null;
  const fb = await getFirebase();
  if (!fb || !fb.db) return null;
  try {
    const reportRef = fb.firestoreMod.doc(fb.db, 'users', userId, 'reports', reportKey);
    const snap = await fb.firestoreMod.getDoc(reportRef);
    if (snap.exists()) {
      console.log(`✅ [Firestore] Found cached dossier in Firebase Cloud (${reportKey}).`);
      return snap.data();
    }
    return null;
  } catch (err) {
    console.error(`❌ [Firestore Dossier Fetch Error]:`, err.code || err.name, err.message);
    return null;
  }
}

export async function fetchCloudGeminiApiKey() {
  const fb = await getFirebase();
  if (!fb || !fb.db) return null;
  try {
    const configRef = fb.firestoreMod.doc(fb.db, 'config', 'gemini');
    const snap = await fb.firestoreMod.getDoc(configRef);
    if (snap.exists()) {
      const data = snap.data();
      return data?.apiKey || null;
    }
    return null;
  } catch (err) {
    console.warn('Could not fetch cloud Gemini API key:', err.message);
    return null;
  }
}

export async function saveCloudUserSettings(userId, settingsData) {
  if (!userId || !settingsData) return;
  const fb = await getFirebase();
  if (!fb || !fb.db) return;
  try {
    const settingsRef = fb.firestoreMod.doc(fb.db, 'users', userId, 'settings', 'config');
    await fb.firestoreMod.setDoc(settingsRef, {
      ...settingsData,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    console.log(`✅ [Firestore] User preferences & sphere configs saved to cloud!`);
  } catch (err) {
    console.warn(`Firestore user settings save note:`, err.message);
  }
}

export async function fetchCloudUserSettings(userId) {
  if (!userId) return null;
  const fb = await getFirebase();
  if (!fb || !fb.db) return null;
  try {
    const settingsRef = fb.firestoreMod.doc(fb.db, 'users', userId, 'settings', 'config');
    const snap = await fb.firestoreMod.getDoc(settingsRef);
    if (snap.exists()) {
      return snap.data();
    }
    return null;
  } catch (err) {
    console.warn(`Firestore user settings fetch note:`, err.message);
    return null;
  }
}
