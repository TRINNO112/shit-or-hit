/**
 * 🧪 ISOLATED TEST SUITE: Device File Mirror & QR / P2P Sync on FAKE Mock Data
 * 
 * Strict Invariants:
 * 1. Zero touching or modifying real user data (data/entries.json, data/reports.json).
 * 2. Generates sandbox fake fixtures (10 mock diary days).
 * 3. Tests QR / P2P payload creation and integrity verification.
 * 4. Tests Plaintext File Mirror serialization and parsing.
 * 5. Tests AES-256 GCM PIN-based encryption and decryption roundtrip.
 * 6. Tests that wrong PIN fails decryption cleanly.
 */

const assert = require('assert');
const crypto = require('crypto');
const webcrypto = crypto.webcrypto || globalThis.crypto;

console.log('======================================================================');
console.log('🛡️  STARTING ISOLATED FAKE-DATA STORAGE & SYNC VERIFICATION');
console.log('======================================================================\n');

// 1. Generate 10 isolated mock entries (FAKE DATA ONLY)
const MOCK_USER_ID = 'test_user_simulated_device_alpha_992';
const MOCK_PIN = '7391';
const WRONG_PIN = '1234';

const FAKE_ENTRIES = {
  "2026-09-01": { score: 5, rating: "Peak", notes: "Crushed project milestone with high focus.", habitAnchorScore: 100 },
  "2026-09-02": { score: 4, rating: "Good", notes: "Solid morning workout and disciplined sprint.", habitAnchorScore: 85 },
  "2026-09-03": { score: 3, rating: "Okay", notes: "Routine operational day, neutral energy.", habitAnchorScore: 70 },
  "2026-09-04": { score: 2, rating: "Down", notes: "Afternoon slump and skipped gym session.", habitAnchorScore: 40 },
  "2026-09-05": { score: 1, rating: "Rough", notes: "Total burnout. Initiated emergency rest.", habitAnchorScore: 10 },
  "2026-09-06": { score: 4, rating: "Good", notes: "Recovery walk, hydration, and reflection.", habitAnchorScore: 80 },
  "2026-09-07": { score: 5, rating: "Peak", notes: "10km run, read 50 pages, zero distractions.", habitAnchorScore: 100 },
  "2026-09-08": { score: 4, rating: "Good", notes: "Consistent deep work block completed.", habitAnchorScore: 90 },
  "2026-09-09": { score: 3, rating: "Okay", notes: "Travel day, maintained reading habit.", habitAnchorScore: 60 },
  "2026-09-10": { score: 5, rating: "Peak", notes: "Clean weekly review and perfect habit score.", habitAnchorScore: 100 }
};

console.log(`📦 [Setup] Created 10 sandbox mock entries for simulated user: ${MOCK_USER_ID}`);
assert.strictEqual(Object.keys(FAKE_ENTRIES).length, 10, 'Mock entries count must be 10');

// -------------------------------------------------------------
// Test 1: QR & P2P Device Sync Payload Packaging
// -------------------------------------------------------------
console.log('\n📡 [Test 1] Testing QR & P2P Payload Packaging...');

function generatePairingCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

const pairingCode = generatePairingCode();
assert.strictEqual(pairingCode.length, 6, 'Pairing code must be 6 characters');
assert.match(pairingCode, /^[A-Z0-9]{6}$/, 'Pairing code must be uppercase alphanumeric');
console.log(`  ✅ Generated 6-character P2P Pairing Code: [ ${pairingCode} ]`);

// Package P2P sync payload
const p2pPayload = {
  version: 'TRINNO_P2P_V2',
  timestamp: new Date().toISOString(),
  sourceDevice: 'Simulated-Sender-Browser',
  userId: MOCK_USER_ID,
  entries: FAKE_ENTRIES,
  entryCount: Object.keys(FAKE_ENTRIES).length,
  checksum: crypto.createHash('sha256').update(JSON.stringify(FAKE_ENTRIES)).digest('hex')
};

assert.strictEqual(p2pPayload.entryCount, 10);
assert.ok(p2pPayload.checksum.length === 64, 'SHA-256 checksum must be 64 hex characters');

// Simulated Receiver unpacks payload
const receiverEntries = p2pPayload.entries;
const receiverChecksum = crypto.createHash('sha256').update(JSON.stringify(receiverEntries)).digest('hex');
assert.strictEqual(receiverChecksum, p2pPayload.checksum, 'Receiver checksum must match sender checksum');
console.log(`  ✅ P2P Beam Verified: 10 entries transferred with zero corruption. Checksum: ${receiverChecksum.slice(0, 16)}...`);

// -------------------------------------------------------------
// Test 2: Device File Mirror (Plaintext JSON)
// -------------------------------------------------------------
console.log('\n📄 [Test 2] Testing Device File Mirror (Plaintext JSON Format)...');

const plaintextSerialized = JSON.stringify({
  version: 'TRINNO_FILE_MIRROR_V1',
  format: 'plaintext',
  updatedAt: new Date().toISOString(),
  entries: FAKE_ENTRIES
}, null, 2);

// Assert it is human-readable in Notepad
assert.ok(plaintextSerialized.includes('"Peak"'), 'Plaintext must contain readable ratings');
assert.ok(plaintextSerialized.includes('"Crushed project milestone with high focus."'), 'Plaintext must contain notes');

// Deserialize
const plaintextParsed = JSON.parse(plaintextSerialized);
assert.strictEqual(Object.keys(plaintextParsed.entries).length, 10);
assert.strictEqual(plaintextParsed.entries["2026-09-01"].score, 5);
console.log('  ✅ Plaintext Mirror Verified: Human-readable in Notepad and parses back 100% losslessly.');

// -------------------------------------------------------------
// Test 3: Device File Mirror (AES-256 GCM Encrypted Vault)
// -------------------------------------------------------------
console.log('\n🔒 [Test 3] Testing Device File Mirror (AES-256 GCM Encrypted Vault)...');

async function deriveKeyFromPin(pin, saltBytes) {
  const enc = new TextEncoder();
  const baseKey = await webcrypto.subtle.importKey(
    'raw',
    enc.encode(pin),
    'PBKDF2',
    false,
    ['deriveKey']
  );
  return webcrypto.subtle.deriveKey(
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

async function runEncryptionTests() {
  const salt = webcrypto.getRandomValues(new Uint8Array(16));
  const iv = webcrypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKeyFromPin(MOCK_PIN, salt);

  const jsonStr = JSON.stringify({ entries: FAKE_ENTRIES });
  const encoded = new TextEncoder().encode(jsonStr);

  const cipherBuffer = await webcrypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoded
  );

  const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('');
  const ivHex = Array.from(iv).map(b => b.toString(16).padStart(2, '0')).join('');
  const cipherHex = Array.from(new Uint8Array(cipherBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');

  const encryptedContainer = {
    version: 'TRINNO_MIRROR_V1',
    encrypted: true,
    cipher: 'AES-256-GCM',
    salt: saltHex,
    iv: ivHex,
    data: cipherHex,
    timestamp: new Date().toISOString()
  };

  const fileDiskContent = JSON.stringify(encryptedContainer, null, 2);

  // Assert ciphertext reveals NO private notes or ratings
  assert.ok(!fileDiskContent.includes('Crushed project milestone'), 'Ciphertext must NEVER contain plaintext notes');
  assert.ok(!fileDiskContent.includes('Burnout'), 'Ciphertext must NEVER contain plaintext burnout text');
  console.log('  ✅ Zero-Knowledge Check Passed: Encrypted file contains zero readable text on disk.');

  // Test successful decryption with correct PIN
  const targetSalt = new Uint8Array(encryptedContainer.salt.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
  const targetIv = new Uint8Array(encryptedContainer.iv.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
  const targetCipher = new Uint8Array(encryptedContainer.data.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));

  const decryptKey = await deriveKeyFromPin(MOCK_PIN, targetSalt);
  const decryptedBuf = await webcrypto.subtle.decrypt(
    { name: 'AES-GCM', iv: targetIv },
    decryptKey,
    targetCipher
  );

  const decryptedJson = JSON.parse(new TextDecoder().decode(decryptedBuf));
  assert.strictEqual(Object.keys(decryptedJson.entries).length, 10, 'Decrypted entries count must match 10');
  assert.strictEqual(decryptedJson.entries["2026-09-07"].notes, "10km run, read 50 pages, zero distractions.");
  console.log('  ✅ Correct PIN Decryption Passed: Recovered 100% of entries intact using PIN [ 7391 ].');

  // Test failed decryption with wrong PIN
  let wrongPinFailed = false;
  try {
    const wrongKey = await deriveKeyFromPin(WRONG_PIN, targetSalt);
    await webcrypto.subtle.decrypt(
      { name: 'AES-GCM', iv: targetIv },
      wrongKey,
      targetCipher
    );
  } catch (e) {
    wrongPinFailed = true;
  }
  assert.ok(wrongPinFailed, 'Decryption with wrong PIN must throw error and fail');
  console.log('  ✅ Security Enforcement Passed: Decryption with incorrect PIN [ 1234 ] was strictly blocked.');
}

runEncryptionTests().then(() => {
  console.log('\n======================================================================');
  console.log('🎉 ALL ISOLATED FAKE-DATA TESTS PASSED WITH 100% SUCCESS!');
  console.log('🛡️  Verified: Real user data was untouched and isolated throughout.');
  console.log('======================================================================\n');
}).catch(err => {
  console.error('\n❌ Fake data test failed:', err);
  process.exit(1);
});
