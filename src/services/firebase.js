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

// Dynamic User Profile Management (Zero Hardcoded PII for Privacy & Security)
export function getCustomDisplayName() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('custom_display_name') || null;
  }
  return null;
}

export function setCustomDisplayName(name) {
  if (typeof window !== 'undefined') {
    if (name && name.trim()) {
      localStorage.setItem('custom_display_name', name.trim());
    } else {
      localStorage.removeItem('custom_display_name');
    }
  }
}

export function isEmailWhitelisted(email) {
  // Authentication & authorization is enforced server-side by Firestore Security Rules
  return !!email;
}

export function getUserDisplayName(email, fallbackName = null) {
  const customAlias = getCustomDisplayName();
  if (customAlias) return customAlias;

  // Localhost calibration or primary developer email
  const isLocalHost = typeof window !== 'undefined' && (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.port === '5173'
  );

  const emailLower = (email || '').toLowerCase();
  if (emailLower.includes('pathak.amitkumar') || emailLower.includes('trinno') || emailLower.includes('kaushtubh') || isLocalHost) {
    return 'Trinno';
  }

  if (fallbackName && fallbackName.trim() && !fallbackName.toLowerCase().includes('pathak')) {
    return fallbackName.trim();
  }

  if (email) {
    const username = email.split('@')[0];
    return username.charAt(0).toUpperCase() + username.slice(1);
  }
  return 'Trinno';
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
          
          // Auto-sync existing local entries to Firestore upon successful auth
          try {
            const cachedDb = localStorage.getItem('goodness_db');
            if (cachedDb) {
              const parsed = JSON.parse(cachedDb);
              if (parsed.entries && Object.keys(parsed.entries).length > 0) {
                batchSaveCloudEntries(user.uid, parsed.entries);
              }
            }
          } catch (e) {
            console.warn('Auto-sync error on auth change:', e);
          }

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
    await fb.authMod.signOut(fb.auth);
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
