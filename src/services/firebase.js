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

// Dual-User Whitelist Gate
export const WHITELIST_EMAILS = [
  'kaushtubh457@gmail.com',
  'pathakkartik593@gmail.com'
];

export function isEmailWhitelisted(email) {
  if (!email) return false;
  return WHITELIST_EMAILS.includes(email.toLowerCase().trim());
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
  if (authInstance?.currentUser) return authInstance.currentUser;
  try {
    const cached = localStorage.getItem('local_auth_user');
    return cached ? JSON.parse(cached) : null;
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
          localStorage.setItem('local_auth_user', JSON.stringify({ email: user.email, displayName: user.displayName, uid: user.uid }));
        } else {
          localStorage.removeItem('local_auth_user');
        }
        callback(user);
      });
    } else {
      const cached = localStorage.getItem('local_auth_user');
      callback(cached ? JSON.parse(cached) : null);
    }
  }).catch(() => {
    callback(null);
  });
  return () => unsub();
}

export async function loginWithGoogle() {
  const fb = await getFirebase();
  if (!fb) {
    const dummyUser = { email: 'pathakkartik593@gmail.com', displayName: 'Kartik Pathak', uid: 'user_kartik_local' };
    localStorage.setItem('local_auth_user', JSON.stringify(dummyUser));
    return dummyUser;
  }
  try {
    const res = await fb.authMod.signInWithPopup(fb.auth, fb.googleProvider);
    return res.user;
  } catch (err) {
    console.error('Google Sign In Error:', err);
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
  if (!fb) return;
  try {
    const entryRef = fb.firestoreMod.doc(fb.db, 'users', userId, 'entries', entry.date);
    await fb.firestoreMod.setDoc(entryRef, {
      ...entry,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    console.error('Firestore save error:', err);
  }
}

export async function fetchCloudEntries(userId) {
  if (!userId) return {};
  const fb = await getFirebase();
  if (!fb) return {};
  try {
    const colRef = fb.firestoreMod.collection(fb.db, 'users', userId, 'entries');
    const snapshot = await fb.firestoreMod.getDocs(colRef);
    const entries = {};
    snapshot.forEach(docSnap => {
      entries[docSnap.id] = docSnap.data();
    });
    return entries;
  } catch (err) {
    console.error('Firestore fetch error:', err);
    return {};
  }
}

export async function saveCloudReport(userId, reportKey, reportData) {
  if (!userId || !reportKey || !reportData) return;
  const fb = await getFirebase();
  if (!fb) return;
  try {
    const reportRef = fb.firestoreMod.doc(fb.db, 'users', userId, 'reports', reportKey);
    await fb.firestoreMod.setDoc(reportRef, {
      ...reportData,
      savedAt: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    console.error('Firestore save report error:', err);
  }
}

export async function fetchCloudReport(userId, reportKey) {
  if (!userId || !reportKey) return null;
  const fb = await getFirebase();
  if (!fb) return null;
  try {
    const reportRef = fb.firestoreMod.doc(fb.db, 'users', userId, 'reports', reportKey);
    const snap = await fb.firestoreMod.getDoc(reportRef);
    if (snap.exists()) {
      return snap.data();
    }
    return null;
  } catch (err) {
    console.error('Firestore fetch report error:', err);
    return null;
  }
}
