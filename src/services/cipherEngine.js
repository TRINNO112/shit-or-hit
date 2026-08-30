/**
 * Trinno Reversible Cryptographic Cipher Engine
 * Encrypts sensitive tokens (like 4-digit Vault PINs) before transit and storage in Firebase,
 * while allowing authorized decryption with the master application key.
 */

const MASTER_CIPHER_SECRET = 'TRINNO_SHIT_OR_HIT_MASTER_SECRET_KEY_2026';

/**
 * Encrypts a string (e.g. 4-digit PIN) into an encrypted cipher hex token.
 * @param {string} text - Plain text PIN (e.g. "4829")
 * @returns {string} - Encrypted cipher token
 */
export function encryptVaultPin(text) {
  if (!text) return null;
  try {
    const keyBytes = new TextEncoder().encode(MASTER_CIPHER_SECRET);
    
    // Obfuscate / Symmetric XOR with rotating key + Salt prefix
    const salt = Math.floor(1000 + Math.random() * 9000).toString();
    const saltedInput = `${salt}:${text}`;
    const inputBytes = new TextEncoder().encode(saltedInput);
    
    const encrypted = inputBytes.map((byte, i) => byte ^ keyBytes[i % keyBytes.length]);
    const hex = Array.from(encrypted).map(b => b.toString(16).padStart(2, '0')).join('');
    
    return `TRINNO_ENC_V1:${hex}`;
  } catch (err) {
    console.warn('Cipher encryption fallback:', err);
    return `TRINNO_ENC_RAW:${btoa(text)}`;
  }
}

/**
 * Decrypts an encrypted cipher token back to the original plain text PIN.
 * @param {string} cipherToken - The encrypted token from Firestore/LocalStorage
 * @returns {string|null} - Decrypted plain text (e.g. "4829")
 */
export function decryptVaultPin(cipherToken) {
  if (!cipherToken) return null;
  try {
    if (cipherToken.startsWith('TRINNO_ENC_V1:')) {
      const hex = cipherToken.replace('TRINNO_ENC_V1:', '');
      const bytes = new Uint8Array(hex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
      const keyBytes = new TextEncoder().encode(MASTER_CIPHER_SECRET);
      
      const decryptedBytes = bytes.map((byte, i) => byte ^ keyBytes[i % keyBytes.length]);
      const decryptedStr = new TextDecoder().decode(decryptedBytes);
      
      // Extract original text after salt prefix
      const parts = decryptedStr.split(':');
      if (parts.length >= 2) {
        return parts.slice(1).join(':');
      }
      return decryptedStr;
    }

    if (cipherToken.startsWith('TRINNO_ENC_RAW:')) {
      return atob(cipherToken.replace('TRINNO_ENC_RAW:', ''));
    }

    // Fallback for legacy 4-digit plain pins
    if (/^\d{4}$/.test(cipherToken)) {
      return cipherToken;
    }

    return null;
  } catch (err) {
    console.warn('Cipher decryption error:', err);
    return null;
  }
}
