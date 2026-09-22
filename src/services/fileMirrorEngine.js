/**
 * 🪞 Device File Mirror Engine (Physical Disk Sync)
 * Allows users to mirror their daily diary directly to a real file on their disk
 * (e.g. C:\Users\...\Documents\shit-or-hit-diary.json) via File System Access API.
 * 
 * Supports:
 * 1. Plaintext JSON (Human-readable in Notepad)
 * 2. Encrypted AES-256 Vault (Locked behind 4-digit PIN)
 * 3. Graceful fallback for mobile browsers (1-tap blob download/upload)
 */

const DB_NAME = 'trinno_file_mirror_db';
const STORE_NAME = 'file_handles';
const HANDLE_KEY = 'active_mirror_handle';
export const FORMAT_PREF_KEY = 'trinno_file_mirror_format'; // 'plaintext' | 'encrypted'

/**
 * Checks if browser supports the native File System Access API
 */
export function isFileSystemAccessSupported() {
  return typeof window !== 'undefined' && Boolean(window.showSaveFilePicker && window.showOpenFilePicker);
}

/**
 * Gets user format preference ('plaintext' or 'encrypted')
 */
export function getFileMirrorFormatPreference() {
  if (typeof window === 'undefined') return 'plaintext';
  return localStorage.getItem(FORMAT_PREF_KEY) || 'plaintext';
}

/**
 * Sets user format preference
 */
export function setFileMirrorFormatPreference(format) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(FORMAT_PREF_KEY, format === 'encrypted' ? 'encrypted' : 'plaintext');
  }
}

// -------------------------------------------------------------
// IndexedDB Handle Persistence (keeps file connected across reloads)
// -------------------------------------------------------------
function openHandleDb() {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB not supported'));
    }
    const req = window.indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function savePersistedFileHandle(handle) {
  try {
    const db = await openHandleDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).put(handle, HANDLE_KEY);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  } catch (e) {
    console.warn('Could not persist file handle in IndexedDB:', e);
    return false;
  }
}

export async function getPersistedFileHandle() {
  try {
    const db = await openHandleDb();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const req = tx.objectStore(STORE_NAME).get(HANDLE_KEY);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
  } catch (e) {
    return null;
  }
}

export async function clearPersistedFileHandle() {
  try {
    const db = await openHandleDb();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).delete(HANDLE_KEY);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    });
  } catch (e) {
    return false;
  }
}

// -------------------------------------------------------------
// AES-256 GCM Cryptographic Functions (Web Crypto API)
// -------------------------------------------------------------
async function deriveKeyFromPin(pin, saltBytes) {
  const enc = new TextEncoder();
  const baseKey = await crypto.subtle.importKey(
    'raw',
    enc.encode(pin),
    'PBKDF2',
    false,
    ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: saltBytes,
      iterations: 100000,
      hash: 'SHA-256'
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypts a JSON object into an encrypted string container using AES-256 GCM.
 */
export async function encryptDiaryPayload(dataObject, pin) {
  if (!pin || typeof pin !== 'string') {
    throw new Error('A 4-digit PIN is required for encrypted mirror.');
  }

  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKeyFromPin(pin, salt);

  const jsonStr = JSON.stringify(dataObject);
  const encodedData = new TextEncoder().encode(jsonStr);

  const cipherBuffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encodedData
  );

  const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('');
  const ivHex = Array.from(iv).map(b => b.toString(16).padStart(2, '0')).join('');
  const cipherHex = Array.from(new Uint8Array(cipherBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');

  return JSON.stringify({
    version: 'TRINNO_MIRROR_V1',
    encrypted: true,
    cipher: 'AES-256-GCM',
    salt: saltHex,
    iv: ivHex,
    data: cipherHex,
    timestamp: new Date().toISOString()
  }, null, 2);
}

/**
 * Decrypts an encrypted string container back into a JSON object using AES-256 GCM.
 */
export async function decryptDiaryPayload(cipherContainerStr, pin) {
  if (!pin) {
    throw new Error('PIN required to unlock encrypted diary file.');
  }

  let container;
  try {
    container = typeof cipherContainerStr === 'string' ? JSON.parse(cipherContainerStr) : cipherContainerStr;
  } catch (e) {
    throw new Error('Invalid file format. Not a valid JSON payload.');
  }

  if (!container.encrypted || container.version !== 'TRINNO_MIRROR_V1') {
    throw new Error('Unrecognized encryption format.');
  }

  const salt = new Uint8Array(container.salt.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
  const iv = new Uint8Array(container.iv.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
  const cipherBytes = new Uint8Array(container.data.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));

  const key = await deriveKeyFromPin(pin, salt);

  try {
    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      cipherBytes
    );
    const jsonStr = new TextDecoder().decode(decryptedBuffer);
    return JSON.parse(jsonStr);
  } catch (err) {
    throw new Error('Incorrect PIN or corrupted file. Decryption failed.');
  }
}

// -------------------------------------------------------------
// High-Level File System Sync Engine
// -------------------------------------------------------------

/**
 * Prompts user to pick or create their local file mirror on disk.
 */
export async function pickDeviceFileMirror() {
  if (!isFileSystemAccessSupported()) {
    throw new Error('File System Access API is not supported in this browser.');
  }

  const options = {
    suggestedName: 'shit-or-hit-diary.json',
    types: [
      {
        description: 'SHIT OR HIT Diary Mirror (*.json)',
        accept: { 'application/json': ['.json'] }
      }
    ]
  };

  const handle = await window.showSaveFilePicker(options);
  await savePersistedFileHandle(handle);
  return handle;
}

/**
 * Writes data directly to a FileSystemFileHandle.
 */
export async function writeToFileHandle(handle, dataObject, format = 'plaintext', pin = null) {
  if (!handle) throw new Error('No active file handle provided.');

  let textContent = '';
  if (format === 'encrypted') {
    if (!pin) throw new Error('4-digit PIN required for encrypted file mirror.');
    textContent = await encryptDiaryPayload(dataObject, pin);
  } else {
    // Plaintext human-readable JSON
    textContent = JSON.stringify(dataObject, null, 2);
  }

  const writable = await handle.createWritable();
  await writable.write(textContent);
  await writable.close();

  return {
    success: true,
    format,
    fileName: handle.name,
    timestamp: new Date().toISOString()
  };
}

/**
 * Reads from a FileSystemFileHandle and automatically parses / decrypts if needed.
 */
export async function readFromFileHandle(handle, pin = null) {
  if (!handle) throw new Error('No file handle provided.');
  const file = await handle.getFile();
  const text = await file.text();
  return parseMirrorFileContent(text, pin);
}

/**
 * Parses raw text from a mirrored file (handles both Plaintext and Encrypted).
 */
export async function parseMirrorFileContent(rawText, pin = null) {
  if (!rawText || !rawText.trim()) {
    return { success: true, data: { entries: {} }, isEncrypted: false };
  }

  let parsed;
  try {
    parsed = JSON.parse(rawText);
  } catch (e) {
    throw new Error('File is corrupted or not valid JSON.');
  }

  // Check if encrypted container
  if (parsed && parsed.encrypted && parsed.version === 'TRINNO_MIRROR_V1') {
    if (!pin) {
      return {
        needsPin: true,
        encryptedContainer: parsed,
        message: 'This file is protected with AES-256 encryption. Please enter your 4-digit PIN.'
      };
    }
    const decryptedData = await decryptDiaryPayload(parsed, pin);
    return {
      success: true,
      data: decryptedData,
      isEncrypted: true
    };
  }

  // Normal Plaintext file
  return {
    success: true,
    data: parsed,
    isEncrypted: false
  };
}

/**
 * 1-Tap Fallback: Generates a downloadable file blob for browsers without File System Access API
 */
export async function triggerManualFileDownload(dataObject, format = 'plaintext', pin = null) {
  let content = '';
  let filename = 'shit-or-hit-diary.json';

  if (format === 'encrypted') {
    if (!pin) throw new Error('4-digit PIN required for encrypted export.');
    content = await encryptDiaryPayload(dataObject, pin);
    filename = 'shit-or-hit-diary.enc.json';
  } else {
    content = JSON.stringify(dataObject, null, 2);
  }

  const blob = new Blob([content], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  return { success: true, filename };
}
