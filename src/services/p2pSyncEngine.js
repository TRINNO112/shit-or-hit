/**
 * 📡 Peer-to-Peer (P2P) Direct Device-to-Device Sync Engine
 * Uses WebRTC RTCDataChannel for 0-latency direct browser-to-browser transfers.
 * Zero diary data is ever stored on Firebase or remote cloud databases.
 */

import { getFirebase, sha256Sync } from './firebase';
import { getDbStorageKey } from './api';

const STUN_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun.services.mozilla.com' }
  ]
};

const SYNC_COLLECTION = 'p2p_ephemeral_handshakes';

/**
 * Derives a zero-knowledge deterministic room ID for authenticated account-to-account P2P pairing.
 * Zero email addresses or PII are exposed in the room identifier.
 */
export function getAccountRoomId(email) {
  if (!email) return null;
  const hash = sha256Sync(email.toLowerCase().trim());
  return 'ACC-' + hash.slice(0, 10).toUpperCase();
}

/**
 * Checks if a remote host device is actively broadcasting for this account
 */
export async function checkAccountHostActive(email) {
  if (!email) return false;
  try {
    const fb = await getFirebase();
    if (!fb || !fb.db) return false;
    const { doc, getDoc } = fb.firestoreMod;
    const roomCode = getAccountRoomId(email);
    const snap = await getDoc(doc(fb.db, SYNC_COLLECTION, roomCode));
    if (!snap.exists()) return false;
    const data = snap.data();
    const isRecent = (Date.now() - (data.createdAt || 0)) < 15 * 60 * 1000;
    return isRecent && data.status === 'waiting';
  } catch (e) {
    console.warn('Could not check remote host status:', e);
    return false;
  }
}

/**
 * Generates a memorable 6-character pairing code (e.g. SHIT-482)
 */
export function generatePairingCode() {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  const digits = Math.floor(100 + Math.random() * 900);
  return `${code}-${digits}`;
}

/**
 * Gathers current local entries for device beaming
 */
export function getLocalSyncPayload() {
  if (typeof window === 'undefined') return null;
  const storageKey = getDbStorageKey();
  const raw = localStorage.getItem(storageKey);
  let entries = {};
  let startDate = new Date().toISOString().slice(0, 10);
  
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      entries = parsed.entries || {};
      startDate = parsed.startDate || startDate;
    } catch (e) {
      console.warn('Failed to parse local entries for sync:', e);
    }
  }

  // Also collect active spheres config if present
  let spheresConfig = [];
  try {
    const sRaw = localStorage.getItem('daily_verdict_spheres_config');
    if (sRaw) spheresConfig = JSON.parse(sRaw);
  } catch (e) {}

  return {
    version: '1.0',
    type: 'P2P_BEAM',
    timestamp: Date.now(),
    startDate,
    entries,
    spheresConfig
  };
}

/**
 * Imports received P2P payload safely into local device storage.
 * Hardened with strict prototype pollution protection and input validation.
 */
export function importSyncPayload(payload) {
  if (!payload || typeof payload !== 'object' || payload.type !== 'P2P_BEAM') {
    throw new Error('Invalid P2P Sync Payload received.');
  }

  if (!payload.entries || typeof payload.entries !== 'object' || Array.isArray(payload.entries)) {
    throw new Error('Malformed entries in sync payload.');
  }

  const storageKey = getDbStorageKey();
  let currentLocal = { entries: {} };
  try {
    const raw = localStorage.getItem(storageKey);
    if (raw) currentLocal = JSON.parse(raw);
  } catch (e) {}

  const mergedEntries = { ...(currentLocal.entries || {}) };
  let importedCount = 0;
  const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
  const DANGEROUS_KEYS = ['__proto__', 'constructor', 'prototype'];

  // Merge entries preserving latest updates with prototype pollution guard
  Object.entries(payload.entries).forEach(([dateStr, incomingEntry]) => {
    if (DANGEROUS_KEYS.includes(dateStr) || !DATE_REGEX.test(dateStr)) {
      return;
    }

    if (!incomingEntry || typeof incomingEntry !== 'object' || Array.isArray(incomingEntry)) {
      return;
    }

    // Sanitize entry fields
    const sanitized = {
      rating: (typeof incomingEntry.rating === 'number' && incomingEntry.rating >= 1 && incomingEntry.rating <= 5) ? incomingEntry.rating : null,
      note: typeof incomingEntry.note === 'string' ? incomingEntry.note.slice(0, 50000) : '',
      timestamp: typeof incomingEntry.timestamp === 'string' ? incomingEntry.timestamp : new Date().toISOString()
    };

    if (incomingEntry.spheres && typeof incomingEntry.spheres === 'object' && !Array.isArray(incomingEntry.spheres)) {
      const sanitizedSpheres = {};
      Object.entries(incomingEntry.spheres).forEach(([sId, sVal]) => {
        if (!DANGEROUS_KEYS.includes(sId) && sVal && typeof sVal === 'object') {
          sanitizedSpheres[sId] = {
            rating: typeof sVal.rating === 'number' ? sVal.rating : null,
            note: typeof sVal.note === 'string' ? sVal.note.slice(0, 10000) : ''
          };
        }
      });
      sanitized.spheres = sanitizedSpheres;
    }

    if (Array.isArray(incomingEntry.anchors)) {
      sanitized.anchors = incomingEntry.anchors.filter(a => a && typeof a === 'object' && !Array.isArray(a)).slice(0, 20);
    }

    if (!mergedEntries[dateStr]) {
      mergedEntries[dateStr] = sanitized;
      importedCount++;
    } else {
      mergedEntries[dateStr] = {
        ...mergedEntries[dateStr],
        ...sanitized
      };
      importedCount++;
    }
  });

  const updatedDb = {
    startDate: (typeof payload.startDate === 'string' && DATE_REGEX.test(payload.startDate)) ? payload.startDate : (currentLocal.startDate || new Date().toISOString().slice(0, 10)),
    entries: mergedEntries
  };

  localStorage.setItem(storageKey, JSON.stringify(updatedDb));

  if (Array.isArray(payload.spheresConfig) && payload.spheresConfig.length > 0) {
    const sanitizedSpheresConfig = payload.spheresConfig.filter(s => s && typeof s === 'object' && !DANGEROUS_KEYS.includes(s.id));
    localStorage.setItem('daily_verdict_spheres_config', JSON.stringify(sanitizedSpheresConfig));
  }

  return {
    success: true,
    totalEntries: Object.keys(mergedEntries).length,
    importedCount
  };
}

/**
 * SENDER: Initiates a WebRTC connection and awaits receiver
 */
export async function startSenderSession(code, onStatus, onSuccess, onError, onPeerConnected) {
  let peerConnection = null;
  let dataChannel = null;
  let unsubSnapshot = () => {};

  try {
    onStatus('Initializing peer-to-peer antenna...');
    peerConnection = new RTCPeerConnection(STUN_SERVERS);

    dataChannel = peerConnection.createDataChannel('daily_verdict_sync', {
      ordered: true
    });

    const beamPayload = () => {
      if (dataChannel && dataChannel.readyState === 'open') {
        onStatus('Direct peer tunnel open! Beaming entries...');
        const payload = getLocalSyncPayload();
        const serialized = JSON.stringify(payload);
        dataChannel.send(serialized);
      }
    };

    dataChannel.onopen = () => {
      onStatus('Direct peer tunnel open! Ready to beam entries.');
      if (onPeerConnected) {
        onPeerConnected({
          code,
          approve: beamPayload
        });
      } else {
        beamPayload();
      }
    };

    dataChannel.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === 'ACK') {
          onStatus('Transfer verified by receiving device!');
          cleanup();
          onSuccess({
            count: Object.keys(getLocalSyncPayload()?.entries || {}).length
          });
        }
      } catch (e) {
        console.warn('Unknown peer message:', event.data);
      }
    };

    // Gather ICE candidates
    const iceCandidates = [];
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        iceCandidates.push(event.candidate.toJSON());
      }
    };

    // Create SDP Offer
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    // Give ICE candidates a brief 600ms buffer to collect
    await new Promise(r => setTimeout(r, 600));

    onStatus('Awaiting receiver to scan QR or enter code...');

    const fb = await getFirebase();
    if (!fb || !fb.db) {
      throw new Error('Signaling service unavailable. Please use Direct Code Beam.');
    }

    const { doc, setDoc, onSnapshot, deleteDoc } = fb.firestoreMod;
    const sessionDocRef = doc(fb.db, SYNC_COLLECTION, code.toUpperCase().trim());

    // Publish ephemeral signaling handshake (ZERO DIARY ENTRIES)
    await setDoc(sessionDocRef, {
      offer: {
        type: peerConnection.localDescription.type,
        sdp: peerConnection.localDescription.sdp
      },
      iceCandidates,
      createdAt: Date.now(),
      status: 'waiting'
    });

    // Listen for receiver's Answer
    unsubSnapshot = onSnapshot(sessionDocRef, async (snapshot) => {
      if (!snapshot.exists()) return;
      const data = snapshot.data();

      if (data.answer && !peerConnection.currentRemoteDescription) {
        onStatus('Receiver detected! Establishing encrypted WebRTC tunnel...');
        const remoteDesc = new RTCSessionDescription(data.answer);
        await peerConnection.setRemoteDescription(remoteDesc);

        if (Array.isArray(data.receiverIceCandidates)) {
          for (const cand of data.receiverIceCandidates) {
            try {
              await peerConnection.addIceCandidate(new RTCIceCandidate(cand));
            } catch (e) {}
          }
        }
      }
    });

    const cleanup = async () => {
      unsubSnapshot();
      try {
        if (fb?.db && sessionDocRef) {
          await deleteDoc(sessionDocRef);
        }
      } catch (e) {}
      if (peerConnection) {
        peerConnection.close();
      }
    };

    return { cleanup, approveTransfer: beamPayload };
  } catch (err) {
    if (onError) onError(err);
    return { cleanup: () => {}, approveTransfer: () => {} };
  }
}

/**
 * RECEIVER: Connects to sender using code, receives entries over data channel
 */
export async function joinReceiverSession(code, onStatus, onSuccess, onError) {
  let peerConnection = null;

  try {
    onStatus(`Locating device with code ${code}...`);
    const fb = await getFirebase();
    if (!fb || !fb.db) {
      throw new Error('Signaling service unavailable.');
    }

    const { doc, getDoc, updateDoc, deleteDoc } = fb.firestoreMod;
    const sessionDocRef = doc(fb.db, SYNC_COLLECTION, code.toUpperCase().trim());
    const snapshot = await getDoc(sessionDocRef);

    if (!snapshot.exists()) {
      throw new Error('Sync code not found or expired. Make sure the sending device is still active.');
    }

    const sessionData = snapshot.data();
    if (!sessionData.offer) {
      throw new Error('Invalid sender handshake packet.');
    }

    onStatus('Sender found! Negotiating peer connection...');
    peerConnection = new RTCPeerConnection(STUN_SERVERS);

    const receiverCandidates = [];
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        receiverCandidates.push(event.candidate.toJSON());
      }
    };

    peerConnection.ondatachannel = (event) => {
      const receiveChannel = event.channel;
      onStatus('Direct peer channel connected! Receiving data stream...');

      receiveChannel.onmessage = (msgEvent) => {
        try {
          const payload = JSON.parse(msgEvent.data);
          onStatus('Processing incoming diary database...');
          const result = importSyncPayload(payload);

          // Send confirmation ACK back to sender
          receiveChannel.send(JSON.stringify({ type: 'ACK', status: 'OK' }));
          onStatus('Success! Local database synchronized.');
          try { setTimeout(() => deleteDoc(sessionDocRef), 1200); } catch (e) {}
          if (onSuccess) onSuccess(result);
        } catch (e) {
          console.error('Failed to import payload over data channel:', e);
          if (onError) onError(new Error('Corrupted data received over peer channel.'));
        }
      };
    };

    // Set Remote Offer
    await peerConnection.setRemoteDescription(new RTCSessionDescription(sessionData.offer));

    // Add Sender Candidates
    if (Array.isArray(sessionData.iceCandidates)) {
      for (const cand of sessionData.iceCandidates) {
        try {
          await peerConnection.addIceCandidate(new RTCIceCandidate(cand));
        } catch (e) {}
      }
    }

    // Create & Set Local Answer
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);

    // Buffer candidates
    await new Promise(r => setTimeout(r, 600));

    // Update session document with Answer
    await updateDoc(sessionDocRef, {
      answer: {
        type: peerConnection.localDescription.type,
        sdp: peerConnection.localDescription.sdp
      },
      receiverIceCandidates: receiverCandidates,
      status: 'connected'
    });

    onStatus('Answer transmitted. Finalizing peer handshake...');

    return {
      cleanup: () => {
        if (peerConnection) peerConnection.close();
      }
    };
  } catch (err) {
    if (onError) onError(err);
    return { cleanup: () => {} };
  }
}
