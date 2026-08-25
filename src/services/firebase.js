import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithRedirect, 
  getRedirectResult,
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  collection 
} from 'firebase/firestore';

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

// Initialize Firebase App
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Dual-User Whitelist Gate
export const WHITELIST_EMAILS = [
  'kaushtubh457@gmail.com',
  'pathakkartik593@gmail.com'
];

/**
 * Checks if a given email is permitted for Cloud Firestore Sync
 */
export function isEmailWhitelisted(email) {
  if (!email) return false;
  return WHITELIST_EMAILS.includes(email.toLowerCase().trim());
}

/**
 * Sign in with Google (Popup on Desktop, Redirect fallback on Mobile)
 */
export async function loginWithGoogle() {
  try {
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (isMobile) {
      // Mobile-friendly redirect flow
      await signInWithRedirect(auth, googleProvider);
    } else {
      const result = await signInWithPopup(auth, googleProvider);
      return result.user;
    }
  } catch (error) {
    console.error('Google Sign-In Error:', error);
    // If popup blocked or failed on mobile, fallback to redirect
    if (error.code === 'auth/popup-blocked' || error.code === 'auth/popup-closed-by-user') {
      await signInWithRedirect(auth, googleProvider);
    } else {
      throw error;
    }
  }
}

/**
 * Sign out current user
 */
export async function logoutUser() {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Sign Out Error:', error);
    throw error;
  }
}

/**
 * Save / Update a single daily entry in Firestore
 */
export async function saveCloudEntry(userId, entry) {
  if (!userId || !entry?.date) return;
  try {
    const entryRef = doc(db, 'users', userId, 'entries', entry.date);
    await setDoc(entryRef, {
      ...entry,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    console.error('Firestore save entry error:', err);
    throw err;
  }
}

/**
 * Fetch all entries for user from Firestore
 */
export async function fetchCloudEntries(userId) {
  if (!userId) return {};
  try {
    const colRef = collection(db, 'users', userId, 'entries');
    const snapshot = await getDocs(colRef);
    const entries = {};
    snapshot.forEach(docSnap => {
      entries[docSnap.id] = docSnap.data();
    });
    return entries;
  } catch (err) {
    console.error('Firestore fetch entries error:', err);
    return {};
  }
}

/**
 * Save an evaluated monthly dossier to Firestore
 */
export async function saveCloudReport(userId, reportKey, reportData) {
  if (!userId || !reportKey || !reportData) return;
  try {
    const reportRef = doc(db, 'users', userId, 'reports', reportKey);
    await setDoc(reportRef, {
      ...reportData,
      savedAt: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    console.error('Firestore save report error:', err);
    throw err;
  }
}

/**
 * Fetch a specific saved report from Firestore
 */
export async function fetchCloudReport(userId, reportKey) {
  if (!userId || !reportKey) return null;
  try {
    const reportRef = doc(db, 'users', userId, 'reports', reportKey);
    const snap = await getDoc(reportRef);
    if (snap.exists()) {
      return snap.data();
    }
    return null;
  } catch (err) {
    console.error('Firestore fetch report error:', err);
    return null;
  }
}
