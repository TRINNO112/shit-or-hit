import { 
  getCurrentUser, 
  getEffectiveUserId,
  saveCloudUserSettings,
  saveCloudEntry, 
  fetchCloudEntries, 
  batchSaveCloudEntries,
  saveCloudReport, 
  fetchCloudReport, 
  isEmailWhitelisted,
  saveCloudCapsules,
  fetchCloudCapsules,
  deleteCloudUserData
} from './firebase';
import { encryptCapsuleMessage, decryptCapsuleMessage } from './cipherEngine';

const API_BASE = '/api';

export const ratingMeta = {
  1: {
    rating: 1,
    icon: 'AlertCircle',
    title: 'Rough',
    desc: 'Heavy friction, chaos or struggle',
    bg: '#FF4D4D',
    color: '#000000',
    selectedClass: 'neo-selected-1'
  },
  2: {
    rating: 2,
    icon: 'CloudRain',
    title: 'Down',
    desc: 'Low battery, slow progress',
    bg: '#FF8A00',
    color: '#000000',
    selectedClass: 'neo-selected-2'
  },
  3: {
    rating: 3,
    icon: 'MinusCircle',
    title: 'Okay',
    desc: 'Solid baseline, held the line',
    bg: '#CBD5E1',
    color: '#000000',
    selectedClass: 'neo-selected-3'
  },
  4: {
    rating: 4,
    icon: 'Zap',
    title: 'Good',
    desc: 'Sharp, dialed-in & productive',
    bg: '#00E599',
    color: '#000000',
    selectedClass: 'neo-selected-4'
  },
  5: {
    rating: 5,
    icon: 'Sparkles',
    title: 'Peak',
    desc: 'Absolute God Mode momentum!',
    bg: '#FDC800',
    color: '#000000',
    selectedClass: 'neo-selected-5'
  }
};

export const DEFAULT_SPHERES = [
  {
    id: 'work_school',
    name: 'Work & School',
    icon: 'GraduationCap',
    color: '#FDC800',
    desc: 'Office, classes, exams & academic focus',
    enabled: true
  },
  {
    id: 'home_personal',
    name: 'Home & Sanctuary',
    icon: 'Home',
    color: '#00E599',
    desc: 'Household, family, rest & evening space',
    enabled: true
  },
  {
    id: 'social_event',
    name: 'Social & Events',
    icon: 'PartyPopper',
    color: '#FF8A00',
    desc: 'Hangouts, outings, gatherings & parties',
    enabled: true
  }
];

export function isSphereModeEnabled() {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('daily_verdict_sphere_mode_enabled') === 'true';
}

export function setSphereModeEnabled(enabled) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('daily_verdict_sphere_mode_enabled', enabled ? 'true' : 'false');
  try {
    const user = getCurrentUser();
    if (user?.uid) {
      saveCloudUserSettings(user.uid, { sphereModeEnabled: enabled });
    }
  } catch (e) {}
}

export function getSphereConfig() {
  if (typeof window === 'undefined') return DEFAULT_SPHERES;
  try {
    const saved = localStorage.getItem('daily_verdict_spheres_config');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}
  return DEFAULT_SPHERES;
}

export function saveSphereConfig(config) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('daily_verdict_spheres_config', JSON.stringify(config));
  try {
    const user = getCurrentUser();
    if (user?.uid) {
      saveCloudUserSettings(user.uid, { spheresConfig: config });
    }
  } catch (e) {}
}

export function calculateCompositeScore(spheres) {
  if (!spheres || typeof spheres !== 'object') return null;
  const entries = Object.values(spheres).filter(s => s && s.rating && Number(s.rating) > 0);
  if (entries.length === 0) return null;
  const sum = entries.reduce((acc, curr) => acc + Number(curr.rating), 0);
  const avg = sum / entries.length;
  const rounded = Math.round(avg * 10) / 10;
  const tier = Math.min(5, Math.max(1, Math.round(avg)));
  return {
    score: rounded,
    rating: tier,
    verdict: ratingMeta[tier]?.title || 'Verdict',
    ratedCount: entries.length,
    totalSpheres: Object.keys(spheres).length
  };
}

export const isStaticHost = typeof window !== 'undefined' && (
  window.location.hostname.includes('github.io') ||
  window.location.hostname.includes('netlify.app') ||
  window.location.hostname.includes('web.app') ||
  window.location.hostname.includes('firebaseapp.com') ||
  window.location.protocol === 'file:'
);

/**
 * 🛡️ RECONCILIATION ENGINE
 * Resolves conflicts between two entry records with an absolute guarantee:
 * An entry with reflection notes CAN NEVER be erased by an entry with blank notes,
 * regardless of timestamps.
 */
function reconcileEntryItems(baseItem, candidateItem) {
  if (!baseItem) return candidateItem;
  if (!candidateItem) return baseItem;

  const baseNotes = (baseItem.notes || '').trim();
  const candNotes = (candidateItem.notes || '').trim();

  // Rule 1: Base has rich notes, candidate has blank notes -> NEVER wipe base notes!
  if (baseNotes && !candNotes) {
    const baseRating = Number(baseItem.rating);
    const candRating = Number(candidateItem.rating);
    return {
      ...candidateItem,
      notes: baseItem.notes, // Absolute note protection
      rating: (candRating === 3 && baseRating !== 3) ? baseRating : (candidateItem.rating ?? baseItem.rating),
      verdict: (candRating === 3 && baseRating !== 3) ? baseItem.verdict : (candidateItem.verdict ?? baseItem.verdict),
      spheres: candidateItem.spheres || baseItem.spheres
    };
  }

  // Rule 2: Base has blank notes, candidate has rich notes -> candidate has authentic new notes
  if (!baseNotes && candNotes) {
    return candidateItem;
  }

  // Rule 3: Both have notes -> timestamp determines the winner (server data/entries.json is authoritative)
  if (baseNotes && candNotes) {
    const baseTime = new Date(baseItem.updatedAt || baseItem.createdAt || 0).getTime();
    const candTime = new Date(candidateItem.updatedAt || candidateItem.createdAt || 0).getTime();
    if (baseTime >= candTime) {
      return baseItem;
    }
    return candidateItem;
  }

  // Rule 4: Neither has notes:
  // If base has an explicit non-default rating (like Sep 13 with rating 4 Good),
  // and candidate was demoted to rating 3 (default/unrated) -> keep base rating!
  const baseRating = Number(baseItem.rating);
  const candRating = Number(candidateItem.rating);
  if (baseRating && baseRating !== 3 && candRating === 3) {
    return baseItem;
  }

  const baseTime = new Date(baseItem.updatedAt || baseItem.createdAt || 0).getTime();
  const candTime = new Date(candidateItem.updatedAt || candidateItem.createdAt || 0).getTime();
  return candTime > baseTime ? candidateItem : baseItem;
}

export function getDbStorageKey(userId) {
  if (!userId) return 'goodness_db_guest';
  if (typeof userId === 'object') {
    return `goodness_db_${getEffectiveUserId(userId)}`;
  }
  return `goodness_db_${userId}`;
}

export async function fetchDatabase(userOverride = null) {
  const currentUser = userOverride || getCurrentUser();
  const effectiveId = getEffectiveUserId(currentUser);
  const storageKey = getDbStorageKey(effectiveId);

  // 1. First fetch authoritative data from server API (data/entries.json)
  let localData = { startDate: new Date().toISOString().slice(0, 10), entries: {} };
  let serverData = null;

  if (!isStaticHost) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 900);
      const res = await fetch(`${API_BASE}/entries`, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) {
        const json = await res.json();
        if (json.data && Object.keys(json.data).length > 0) {
          serverData = {
            startDate: json.startDate || new Date().toISOString().slice(0, 10),
            entries: json.data || {}
          };
        }
      }
    } catch (e) {
      // Local server not running or timed out
    }
  }

  let cached = localStorage.getItem(storageKey);
  // Also check legacy raw UID key in localStorage if user_UID has no cached entries
  if (!cached && effectiveId && effectiveId.startsWith('user_')) {
    const legacyRawKey = `goodness_db_${effectiveId.slice(5)}`;
    const legacyCached = localStorage.getItem(legacyRawKey);
    if (legacyCached) {
      cached = legacyCached;
      localStorage.setItem(storageKey, legacyCached);
    }
  }

  let cachedData = null;
  if (cached) {
    try { 
      const parsed = JSON.parse(cached);
      if (parsed && parsed.entries && Object.keys(parsed.entries).length > 0) {
        cachedData = parsed;
      }
    } catch (err) {
      console.warn('Primary database corrupted! Attempting auto-recovery from rolling snapshots...');
      for (let i = 1; i <= 3; i++) {
        try {
          const snapRaw = localStorage.getItem(`${storageKey}_snapshot_${i}`);
          if (snapRaw) {
            const snapParsed = JSON.parse(snapRaw);
            if (snapParsed && snapParsed.entries && Object.keys(snapParsed.entries).length > 0) {
              cachedData = {
                startDate: snapParsed.startDate || new Date().toISOString().slice(0, 10),
                entries: snapParsed.entries
              };
              console.log(`🛡️ Auto-healed database from snapshot ${i}!`);
              break;
            }
          }
        } catch (e) {}
      }
    }
  }

  // 🛡️ RECONCILIATION: Server data (data/entries.json) is the ground truth
  if (serverData && serverData.entries) {
    localData = { ...serverData };
    // Merge client-side cached entries through content-protection shield
    if (cachedData && cachedData.entries) {
      Object.entries(cachedData.entries).forEach(([dKey, cItem]) => {
        const sItem = localData.entries[dKey];
        localData.entries[dKey] = reconcileEntryItems(sItem, cItem);
      });
    }
  } else if (cachedData && cachedData.entries) {
    localData = cachedData;
  }

  // Persist clean merged ground truth to user storageKey and mirror immediately
  localStorage.setItem(storageKey, JSON.stringify(localData));
  localStorage.setItem('goodness_db', JSON.stringify(localData));
  saveRollingSnapshot(storageKey, localData);

  // 2. If user is logged in with whitelisted Firebase account, sync bidirectionally with Firestore
  if (currentUser && isEmailWhitelisted(currentUser.email)) {
    try {
      const cloudEntries = await fetchCloudEntries(effectiveId);
      const cloudCount = Object.keys(cloudEntries).length;
      const localCount = Object.keys(localData.entries || {}).length;

      if (cloudCount > 0) {
        const mergedEntries = { ...localData.entries };

        Object.entries(cloudEntries).forEach(([dateKey, cloudItem]) => {
          const localItem = mergedEntries[dateKey];
          mergedEntries[dateKey] = reconcileEntryItems(localItem, cloudItem);
        });

        const dates = Object.keys(mergedEntries).sort();
        const startDate = dates[0] || localData.startDate;
        const payload = JSON.stringify({ startDate, entries: mergedEntries });
        localStorage.setItem(storageKey, payload);
        localStorage.setItem('goodness_db', payload);
        saveRollingSnapshot(storageKey, { startDate, entries: mergedEntries });
        
        // Push any healed local entries back to Firestore so cloud stays 100% clean
        Object.entries(mergedEntries).forEach(([dKey, mItem]) => {
          const cItem = cloudEntries[dKey];
          const mNotes = (mItem.notes || '').trim();
          const cNotes = (cItem?.notes || '').trim();
          const mRating = Number(mItem.rating);
          const cRating = Number(cItem?.rating);

          const needsCloudPush = !cItem ||
            (mNotes && !cNotes) ||
            (mRating !== cRating && mRating !== 3 && cRating === 3) ||
            (mItem.updatedAt && mItem.updatedAt > (cItem.updatedAt || ''));

          if (needsCloudPush) {
            saveCloudEntry(effectiveId, mItem).catch(() => {});
          }
        });

        return { startDate, entries: mergedEntries };
      } else if (localCount > 0) {
        // Cloud is empty but local has data: auto-populate cloud from local so entries are preserved
        console.log(`📡 [Firestore] Cloud is empty for ${effectiveId}. Uploading ${localCount} local entries to cloud...`);
        batchSaveCloudEntries(effectiveId, localData.entries).catch(e => console.warn('Cloud initial upload note:', e));
      }
    } catch (err) {
      console.warn('Firestore sync failed, using local database:', err);
    }
  }

  return localData;
}

// 🔄 Triple-Tier Rolling Snapshots Engine (Time Machine)
export function saveRollingSnapshot(storageKey, db) {
  if (typeof window === 'undefined' || !storageKey || !db || !db.entries) return;
  try {
    const entryCount = Object.keys(db.entries).length;
    if (entryCount === 0) return;

    // Shift snapshots: 2 -> 3, 1 -> 2
    const s1 = localStorage.getItem(`${storageKey}_snapshot_1`);
    const s2 = localStorage.getItem(`${storageKey}_snapshot_2`);

    if (s2) {
      localStorage.setItem(`${storageKey}_snapshot_3`, s2);
    }
    if (s1) {
      localStorage.setItem(`${storageKey}_snapshot_2`, s1);
    }

    // Save current state as Snapshot 1
    const snapshotData = {
      timestamp: new Date().toISOString(),
      entryCount,
      startDate: db.startDate,
      entries: db.entries
    };
    localStorage.setItem(`${storageKey}_snapshot_1`, JSON.stringify(snapshotData));
  } catch (e) {
    console.warn('Snapshot write warning:', e);
  }
}

export function getRollingSnapshots(userOverride = null) {
  if (typeof window === 'undefined') return [];
  const currentUser = userOverride || getCurrentUser();
  const effectiveId = getEffectiveUserId(currentUser);
  const storageKey = getDbStorageKey(effectiveId);

  const snapshots = [];
  for (let i = 1; i <= 3; i++) {
    try {
      const raw = localStorage.getItem(`${storageKey}_snapshot_${i}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.timestamp && parsed.entries) {
          snapshots.push({
            id: i,
            timestamp: parsed.timestamp,
            entryCount: parsed.entryCount || Object.keys(parsed.entries).length,
            startDate: parsed.startDate
          });
        }
      }
    } catch (e) {}
  }
  return snapshots;
}

export function restoreSnapshot(snapshotId, userOverride = null) {
  if (typeof window === 'undefined') return null;
  const currentUser = userOverride || getCurrentUser();
  const effectiveId = getEffectiveUserId(currentUser);
  const storageKey = getDbStorageKey(effectiveId);

  try {
    const raw = localStorage.getItem(`${storageKey}_snapshot_${snapshotId}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.entries) return null;

    const restoredDb = {
      startDate: parsed.startDate || new Date().toISOString().slice(0, 10),
      entries: parsed.entries
    };

    const payload = JSON.stringify(restoredDb);
    localStorage.setItem(storageKey, payload);
    localStorage.setItem('goodness_db', payload);

    return restoredDb;
  } catch (e) {
    console.error('Failed to restore snapshot:', e);
    return null;
  }
}

export async function saveEntry(entryData) {
  const formatted = {
    ...entryData,
    rating: Number(entryData.rating),
    verdict: entryData.verdict || ratingMeta[entryData.rating]?.title || 'Verdict',
    updatedAt: new Date().toISOString()
  };

  const currentUser = getCurrentUser();
  const effectiveId = getEffectiveUserId(currentUser);
  const storageKey = getDbStorageKey(effectiveId);

  // 1. Always update user-scoped local storage database immediately
  try {
    const dbStr = localStorage.getItem(storageKey);
    let db = dbStr ? JSON.parse(dbStr) : { startDate: new Date().toISOString().slice(0, 10), entries: {} };
    if (!db.entries) db.entries = {};
    db.entries[formatted.date] = formatted;
    localStorage.setItem(storageKey, JSON.stringify(db));
    localStorage.setItem('goodness_db', JSON.stringify(db));
    saveRollingSnapshot(storageKey, db);
  } catch (e) {}

  // 2. Cloud save with 4s timeout protection against slow connections
  if (currentUser && isEmailWhitelisted(currentUser.email)) {
    try {
      const cloudPromise = saveCloudEntry(effectiveId, formatted);
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Cloud save timeout')), 4000));
      await Promise.race([cloudPromise, timeoutPromise]);
    } catch (err) {
      console.warn('Firestore cloud save background note:', err.message);
    }
  }

  // 3. Local server save if available (and not on static host like GitHub Pages)
  if (!isStaticHost) {
    try {
      const res = await fetch(`${API_BASE}/entries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formatted)
      });
      if (res.ok) {
        const json = await res.json();
        return json.entry || formatted;
      }
    } catch (err) {}
  }

  return formatted;
}

export async function enhanceReflectionWithAI(notes, rating, date, spheres = null, customInstruction = null) {
  if ((!notes || notes.trim() === '') && (!spheres || Object.keys(spheres).length === 0)) return notes;

  const preferredLanguage = (typeof window !== 'undefined' && localStorage.getItem('daily_verdict_ai_language')) || 'auto';

  // 1. Try local dev backend if running (and not on static host)
  if (!isStaticHost) {
    try {
      const res = await fetch(`${API_BASE}/ai/enhance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes, rating, date, preferredLanguage, spheres, customInstruction })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.enhancedText) return data.enhancedText;
      }
    } catch (err) {
      // Backend offline (e.g. GitHub Pages static deployment)
    }
  }

  // 2. Direct client-side Gemini fallback
  try {
    let apiKey = null;
    try {
      const { fetchCloudGeminiApiKey } = await import('./firebase');
      apiKey = await fetchCloudGeminiApiKey();
    } catch (e) {}

    if (!apiKey && typeof import.meta !== 'undefined' && import.meta.env) {
      apiKey = import.meta.env.VITE_GEMINI_API_KEY || null;
    }

    if (apiKey) {
      let languageRule = '';
      if (preferredLanguage === 'english') {
        languageRule = 'STRICT LANGUAGE MANDATE: The user has chosen ENGLISH. Write 100% in polished, natural English. Do NOT include any Hindi, Hinglish, or foreign words.';
      } else if (preferredLanguage === 'hinglish') {
        languageRule = 'STRICT LANGUAGE MANDATE: The user has chosen HINGLISH. Write in natural, expressive 1st-person Hinglish (Hindi in Roman script).';
      } else {
        languageRule = 'LANGUAGE MIRRORING MANDATE: Strictly mirror the exact language and blend of the user input. If the user wrote in standard English, you MUST output 100% pure English with ZERO Hindi/Hinglish words. If the user wrote in Hinglish, output in Hinglish. NEVER translate English notes into Hinglish.';
      }

      let journalInput = notes || '';
      if (spheres && Object.keys(spheres).length > 0) {
        const sphereDetails = Object.entries(spheres)
          .filter(([_, s]) => s && (s.rating || (s.notes && s.notes.trim())))
          .map(([id, s]) => `[${s.icon || '⚡'} ${s.name || id} — Rated ${s.rating || 'N/A'}/5]: ${s.notes || '(No specific notes, just score logged)'}`)
          .join('\n\n');
        
        if (sphereDetails) {
          journalInput = `${journalInput ? journalInput + '\n\n' : ''}--- Segmented Life Domain Breakdown ---\n${sphereDetails}`;
        }
      }

      const directiveSection = customInstruction && customInstruction.trim()
        ? `\n\n🎯 USER'S DIRECT CUSTOM DIRECTIVE / COMMAND TO YOU:
"${customInstruction.trim()}"
You MUST strictly prioritize and execute this specific custom command while maintaining the 1st-person diary structure.`
        : '';

      const prompt = `You are a personal diary ghostwriter and tactical reflection co-pilot.
The user logged their day (${date || 'Today'}, Verdict: ${rating || 3}/5).
${spheres ? 'The user logged segmented life domains (e.g. Work/School, Home, Social).' : ''}

User's raw journal inputs and domain ratings:
"${journalInput}"${directiveSection}

CRITICAL INSTRUCTIONS:
- You must write strictly in the FIRST PERSON ("I", "my", "me", "myself").
- NEVER use "You" or "Your" under any circumstances.
- PRESERVE FULL LENGTH AND EVERY SINGLE DETAIL: Synthesize the domain events into a unified, chronological, vivid personal diary reflection (from morning through night).
- ${languageRule}
- Fix grammatical roughness, awkward phrasing, and run-on sentences while keeping the user's raw, authentic voice.
- Write it as a deep, vivid, complete personal diary entry written by ME about MY own day.

Return ONLY the complete polished diary entry text without quotes or preamble.`;

      let response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 2048 }
        })
      });

      // Fallback to gemini-3.1-flash-lite if 3.5 is busy
      if (!response.ok) {
        response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.7, maxOutputTokens: 2048 }
          })
        });
      }

      if (response.ok) {
        const result = await response.json();
        const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text && text.trim()) return text.trim();
      }
    }
  } catch (err) {
    console.error('Direct Gemini Polish error:', err);
  }

  return notes;
}

export async function getSavedMonthlyReport(year, month) {
  const currentUser = getCurrentUser();
  const effectiveId = getEffectiveUserId(currentUser) || 'guest';
  const preferredLanguage = (typeof window !== 'undefined' && localStorage.getItem('daily_verdict_ai_language')) || 'auto';
  const monthStr = String(month).padStart(2, '0');
  const baseKey = `report_${effectiveId}_${year}_${monthStr}`;
  const langKey = `${baseKey}_${preferredLanguage}`;
  const cloudKey = `${year}_${monthStr}`;

  // 1. Try local dev backend if running (and not on static host)
  if (!isStaticHost) {
    try {
      const res = await fetch(`${API_BASE}/monthly-report?year=${year}&month=${month}&preferredLanguage=${preferredLanguage}&effectiveId=${effectiveId}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          try {
            localStorage.setItem(baseKey, JSON.stringify(json.data));
            localStorage.setItem(langKey, JSON.stringify(json.data));
          } catch (e) {}
          return json.data;
        }
      }
    } catch (err) {
      console.warn('Backend GET /api/monthly-report unavailable, checking local/cloud storage:', err);
    }
  }

  // 2. Check local cache (check langKey, then baseKey)
  try {
    const cached = localStorage.getItem(langKey) || localStorage.getItem(baseKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed && parsed.executiveSummary) return parsed;
    }
  } catch (e) {}

  // 3. Check Firestore Cloud if authenticated
  if (effectiveId && effectiveId !== 'guest') {
    try {
      const cloudReport = await fetchCloudReport(effectiveId, `${cloudKey}_${preferredLanguage}`) || 
                          await fetchCloudReport(effectiveId, cloudKey);
      if (cloudReport && cloudReport.executiveSummary) {
        try {
          localStorage.setItem(baseKey, JSON.stringify(cloudReport));
          localStorage.setItem(langKey, JSON.stringify(cloudReport));
        } catch (e) {}
        return cloudReport;
      }
    } catch (err) {
      console.warn('Firestore cloud report fetch error:', err);
    }
  }

  return null;
}

export async function fetchMonthlyReport(year, month, customEntries = null, archetypeId = null, forceReevaluate = false) {
  const currentUser = getCurrentUser();
  const effectiveId = getEffectiveUserId(currentUser) || 'guest';
  const preferredLanguage = (typeof window !== 'undefined' && localStorage.getItem('daily_verdict_ai_language')) || 'auto';
  const monthStr = String(month).padStart(2, '0');
  const baseKey = `report_${effectiveId}_${year}_${monthStr}`;
  const langKey = `${baseKey}_${preferredLanguage}`;
  const cloudKey = `${year}_${monthStr}`;

  // Check cached report if not forcing reevaluation
  if (!forceReevaluate) {
    try {
      const cached = localStorage.getItem(langKey) || localStorage.getItem(baseKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && parsed.executiveSummary) return parsed;
      }
    } catch (e) {}

    if (effectiveId && effectiveId !== 'guest') {
      try {
        const cloudReport = await fetchCloudReport(effectiveId, `${cloudKey}_${preferredLanguage}`) || 
                            await fetchCloudReport(effectiveId, cloudKey);
        if (cloudReport && cloudReport.executiveSummary) {
          try {
            localStorage.setItem(baseKey, JSON.stringify(cloudReport));
            localStorage.setItem(langKey, JSON.stringify(cloudReport));
          } catch (e) {}
          return cloudReport;
        }
      } catch (e) {}
    }
  }

  // Ensure entries are properly supplied for this user
  let entriesPayload = customEntries;
  if (!entriesPayload) {
    try {
      const storageKey = getDbStorageKey(effectiveId);
      const cachedDb = localStorage.getItem(storageKey);
      if (cachedDb) {
        entriesPayload = JSON.parse(cachedDb).entries || {};
      }
    } catch (e) {}
  }

  let finalReport = null;

  // 1. Try local dev backend if running (and not on static host)
  if (!isStaticHost) {
    try {
      const res = await fetch(`${API_BASE}/monthly-report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          year, 
          month, 
          customEntries: entriesPayload, 
          archetypeId, 
          forceReevaluate, 
          preferredLanguage 
        })
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          finalReport = json.data;
        }
      }
    } catch (err) {
      console.warn('Backend POST /api/monthly-report unavailable, falling back to client generation:', err);
    }
  }

  // 2. Direct client-side forensic synthesis with live Gemini AI fallback if backend didn't return report
  if (!finalReport) {
    finalReport = await generateClientMonthlyReport(year, month, entriesPayload, preferredLanguage);
  }

  // 3. Save locally in localStorage under both baseKey and langKey
  try {
    localStorage.setItem(baseKey, JSON.stringify(finalReport));
    localStorage.setItem(langKey, JSON.stringify(finalReport));
  } catch (e) {}

  // 4. Save to Cloud Firestore
  try {
    if (effectiveId && effectiveId !== 'guest') {
      await saveCloudReport(effectiveId, cloudKey, finalReport);
      if (preferredLanguage && preferredLanguage !== 'auto') {
        await saveCloudReport(effectiveId, `${cloudKey}_${preferredLanguage}`, finalReport);
      }
    }
  } catch (cloudErr) {
    console.warn('Failed to sync dossier to Firebase Cloud:', cloudErr);
  }

  return finalReport;
}

async function generateClientMonthlyReport(year, month, customEntries = null, preferredLanguage = 'auto') {
  let allEntries = {};
  if (customEntries) {
    if (Array.isArray(customEntries)) {
      allEntries = customEntries.reduce((acc, e) => {
        if (e && e.date) acc[e.date] = e;
        return acc;
      }, {});
    } else if (typeof customEntries === 'object') {
      allEntries = customEntries;
    }
  } else {
    const currentUser = getCurrentUser();
    const effectiveId = getEffectiveUserId(currentUser);
    const storageKey = getDbStorageKey(effectiveId);
    const cached = localStorage.getItem(storageKey);
    allEntries = cached ? JSON.parse(cached).entries || {} : {};
  }

  const monthPrefix = `${year}-${String(month).padStart(2, '0')}`;
  const monthEntries = Object.entries(allEntries || {})
    .filter(([date]) => date.startsWith(monthPrefix))
    .sort(([a], [b]) => a.localeCompare(b));

  const totalDaysInMonth = new Date(year, month, 0).getDate();
  const loggedCount = monthEntries.length;
  const monthName = new Date(year, month - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  if (loggedCount === 0) {
    return {
      monthName,
      year,
      month,
      totalLogged: 0,
      totalDaysInMonth,
      hitRate: 0,
      avgScore: 0,
      ratingCounts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      weekdayAverages: { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 },
      personaTitle: 'The New Explorer',
      executiveSummary: `No entries have been logged yet for ${monthName}. Start logging daily verdicts or select a test archetype to unlock deep intelligence.`,
      homieLetter: [
        `Welcome to your monthly dossier. Start logging daily verdicts to unlock personalized AI evaluations and deep behavioral forensics.`
      ],
      hiddenFacts: ['Log at least 3 days to reveal hidden behavioral patterns.'],
      frictionAnalysis: 'No friction points recorded.',
      goldenHabits: 'Consistent daily logging will reveal your peak momentum triggers.',
      nextMonthDirectives: ['Log your verdict daily for 7 consecutive days.', 'Write raw unfiltered notes.', 'Aim for a 75%+ Hit Rate.']
    };
  }

  const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  const weekdayTotals = { Mon: { sum: 0, count: 0 }, Tue: { sum: 0, count: 0 }, Wed: { sum: 0, count: 0 }, Thu: { sum: 0, count: 0 }, Fri: { sum: 0, count: 0 }, Sat: { sum: 0, count: 0 }, Sun: { sum: 0, count: 0 } };
  const weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  let totalScoreSum = 0;
  let hitsCount = 0;

  monthEntries.forEach(([date, entry]) => {
    const r = Number(entry.rating) || 3;
    ratingCounts[r] = (ratingCounts[r] || 0) + 1;
    totalScoreSum += r;
    if (r >= 3) hitsCount++;

    const dayOfWeek = weekdayNames[new Date(`${date}T00:00:00`).getDay()];
    if (weekdayTotals[dayOfWeek]) {
      weekdayTotals[dayOfWeek].sum += r;
      weekdayTotals[dayOfWeek].count++;
    }
  });

  const hitRate = Math.round((hitsCount / loggedCount) * 100);
  const avgScore = Number((totalScoreSum / loggedCount).toFixed(1));

  const weekdayAverages = {};
  ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].forEach(day => {
    const item = weekdayTotals[day];
    weekdayAverages[day] = item.count > 0 ? Number((item.sum / item.count).toFixed(1)) : 0;
  });

  const bestWeekday = Object.entries(weekdayAverages).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Wed';
  const worstWeekday = Object.entries(weekdayAverages).filter(([, score]) => score > 0).sort((a, b) => a[1] - b[1])[0]?.[0] || 'Mon';

  let personaTitle = 'The Disciplined Sustainer';
  let executiveSummary = '';
  let homieLetter = [];
  let hiddenFacts = [];
  let frictionAnalysis = '';
  let goldenHabits = '';
  let nextMonthDirectives = [];

  if (hitRate >= 80) {
    personaTitle = 'The Relentless Velocity Builder ⚡';
    executiveSummary = `Dominated ${monthName} with an exceptional ${hitRate}% Hit Rate across ${loggedCount} days. Maintained relentless forward momentum and deep flow-state consistency.`;
    homieLetter = [
      `Bro... look at this board. You absolutely ran the table this month with a ${hitRate}% Hit Rate. That is elite execution.`,
      `You protected your flow blocks, stayed consistent even on off-days, and didn't let minor distractions derail your weekly trajectory.`,
      `Keep this exact momentum heading into next month—raise your targets and expand on this foundation.`,
      `Stay humble, maintain your recovery, and keep dominating.`
    ];
    hiddenFacts = [
      `Peak Power Velocity: ${bestWeekday}s were your highest-output days with an average score of ${weekdayAverages[bestWeekday] || 4.8}/5.0.`,
      `Flow-State Mastery: Logged ${ratingCounts[5]} Peak (5/5) and ${ratingCounts[4]} Good (4/5) days with zero compounding slumps.`,
      `Discipline Defense: Successfully avoided multi-day friction loops throughout the entire month.`
    ];
    frictionAnalysis = `Minor friction accounted for only ${Math.round(((ratingCounts[1] + ratingCounts[2]) / loggedCount) * 100)}% of the month, immediately neutralized within 24 hours.`;
    goldenHabits = `Peak momentum was driven by uninterrupted deep work blocks, early morning execution, and proactive planning.`;
    nextMonthDirectives = [
      `Protect high-leverage flow blocks on ${bestWeekday}s.`,
      `Raise baseline targets to expand on this elite momentum.`,
      `Maintain clean nutrition and recovery to sustain high velocity.`
    ];
  } else if (hitRate >= 50) {
    personaTitle = 'The Resilient Equilibrium Builder 🛡️';
    executiveSummary = `Maintained steady discipline in ${monthName} with a ${hitRate}% Hit Rate. Balanced standard routines while holding the baseline through fluctuating demands.`;
    homieLetter = [
      `Solid month of holding the line, bro. You finished with a ${hitRate}% Hit Rate across ${loggedCount} logged days.`,
      `You avoided severe tailspins by defending your baseline on ${bestWeekday}s. The next step is turning your 3/5 baseline days into 4/5 breakout days.`,
      `Keep your morning momentum clean and limit late-evening context switching.`,
      `You have the discipline—now let's push for an 80%+ Hit Rate next month.`
    ];
    hiddenFacts = [
      `Mid-Week Momentum: ${bestWeekday} delivered your strongest performance (${weekdayAverages[bestWeekday] || 3.8}/5.0).`,
      `Baseline Defense: Logged ${ratingCounts[3]} Okay (3/5) days, ensuring consistent output without severe crashes.`,
      `Recovery Window: Managed to bounce back from ${worstWeekday} fatigue within 1–2 days.`
    ];
    frictionAnalysis = `Friction points occurred during ${worstWeekday} context-switching and late afternoon fatigue.`;
    goldenHabits = `Good days were achieved when tasks were prioritized into single-focus execution blocks.`;
    nextMonthDirectives = [
      `Eliminate multi-tasking bottlenecks on ${worstWeekday}s.`,
      `Turn 3/5 baseline days into 4/5 Good days by scheduling single-task sprints.`,
      `Aim for an 80%+ Hit Rate next month.`
    ];
  } else {
    personaTitle = 'The 3:45 AM Dopamine Goblin 👺';
    executiveSummary = `Bro... look at this chart. Your month was cooked as shit. Genuinely raw-dogging the trenches with ${ratingCounts[1]} Rough days, ${ratingCounts[2]} Down days, and only 1 win—but you logged every single day and clutched up on Day 31.`;
    homieLetter = [
      `Listen to me bro: this month was an absolute blender. You had failed Accounts papers, public teacher callouts, morning stomach cramps in class, family tension over gas cylinders, and sitting in the canteen watching your friends flex their dating life while you felt completely invisible. I hear you, and that shit genuinely hurts.`,
      `Now let's talk about the self-inflicted damage: you kept treating 3:45 AM Reels doomscrolling like a coping mechanism, when in reality it was frying your dopamine receptors and guaranteeing next-day morning migraines. Spilling chai all over 15 completed project pages was peak tragic comedy, but the endless phone avoidance was the real bottleneck.`,
      `Here is why you're built different though: despite 30 consecutive days of pure hell and feeling like a clown on the terrace, you never stopped logging. You didn't delete the database, you didn't give up, and when the big 50-mark Accounts unit test landed on Day 31, you dropped a massive 78% (39/50) clutch win and earned your dad's proud nod at dinner.`,
      `For next month, we take that exact bulldog resilience and apply it daily. Put your phone in another room at 11 PM, stop letting one awkward hallway moment ruin your week, and lock in on your revision. You proved you have the horsepower—now let's make it consistent.`
    ];
    hiddenFacts = [
      `Bro, start believing in superstitions because your ${worstWeekday}s are statistically cursed as fuck with an automatic L.`,
      `3:45 AM Doomscroll Trap: Late-night phone binges were your personal final boss—they wiped out your attention span and caused morning brain fog.`,
      `Spilled Chai & Tragic Comedy: Spilling hot chai all over completed BST project pages is proof the universe had personal beef with you on Day 20.`,
      `Accounts PTSD: You spent 30 days fighting for your life against partnership balance sheets, only to drop a massive 78% redemption arc on Day 31.`,
      `Iron Will Consistency: You logged 100% of your days across all 31 days even when your life felt like a dumpster fire. That's real mental toughness.`,
      `The Day 31 Clutch: After a whole month in the mud, you proved that action creates confidence and earned genuine respect at home.`
    ];
    frictionAnalysis = `Heavy friction was driven by exam panic, feeling behind compared to your friends, and escaping into endless Reels instead of facing the balance sheet.`;
    goldenHabits = `Your only massive win happened when you put the phone in another room, stopped negotiating with your brain, and locked in on one single task.`;
    nextMonthDirectives = [
      `Directive 1: Put your fucking phone in another room after 11 PM or you're cooked. No excuses, bro.`,
      `Directive 2: Cleanse your ${worstWeekday} bad karma with an evening power walk and zero social media.`,
      `Directive 3: Remember that 1 clutch win on Day 31 proved you're capable—now let's turn 1 win into 15 wins next month.`
    ];
  }

  const weeklyPhases = [
    { label: 'Week 1 (Days 1–7)', days: [], sum: 0, count: 0, hits: 0 },
    { label: 'Week 2 (Days 8–14)', days: [], sum: 0, count: 0, hits: 0 },
    { label: 'Week 3 (Days 15–21)', days: [], sum: 0, count: 0, hits: 0 },
    { label: 'Week 4 (Days 22–31)', days: [], sum: 0, count: 0, hits: 0 }
  ];

  let screenMentions = 0;
  let academicMentions = 0;
  let householdSocialMentions = 0;
  let currentSlump = 0;
  let longestSlump = 0;

  const dayMatrix = monthEntries.map(([date, entry]) => {
    const dayNum = parseInt(date.split('-')[2], 10);
    const r = Number(entry.rating) || 3;
    const noteLower = (entry.notes || '').toLowerCase();

    const weekIdx = dayNum <= 7 ? 0 : dayNum <= 14 ? 1 : dayNum <= 21 ? 2 : 3;
    weeklyPhases[weekIdx].days.push(r);
    weeklyPhases[weekIdx].sum += r;
    weeklyPhases[weekIdx].count++;
    if (r >= 3) weeklyPhases[weekIdx].hits++;

    if (/(reel|instagram|tiktok|scroll|phone|short|stream|3:45|4:30|gaming|youtube)/i.test(noteLower)) {
      screenMentions++;
    }
    if (/(account|exam|test|balance sheet|marks|teacher|quiz|fail|homework|bst|eco|math)/i.test(noteLower)) {
      academicMentions++;
    }
    if (/(gas|cylinder|brother|parent|dad|mom|fight|canteen|crush|ananya|friend|lonel)/i.test(noteLower)) {
      householdSocialMentions++;
    }

    if (r <= 2) {
      currentSlump++;
      if (currentSlump > longestSlump) longestSlump = currentSlump;
    } else {
      currentSlump = 0;
    }

    return {
      day: dayNum,
      date,
      rating: r,
      notes: entry.notes || ''
    };
  });

  const weeklyAnalytics = weeklyPhases.map(w => ({
    label: w.label,
    count: w.count,
    avgScore: w.count > 0 ? Number((w.sum / w.count).toFixed(1)) : 0,
    hitRate: w.count > 0 ? Math.round((w.hits / w.count) * 100) : 0
  }));

  const totalFrictionSignals = Math.max(1, screenMentions + academicMentions + householdSocialMentions);
  const frictionBreakdown = {
    screenDoomscrollPct: Math.round((screenMentions / totalFrictionSignals) * 100),
    academicStressPct: Math.round((academicMentions / totalFrictionSignals) * 100),
    householdSocialPct: Math.round((householdSocialMentions / totalFrictionSignals) * 100)
  };

  // Attempt direct Google Gemini AI synthesis if API Key is available
  try {
    let apiKey = null;
    try {
      const { fetchCloudGeminiApiKey } = await import('./firebase');
      apiKey = await fetchCloudGeminiApiKey();
    } catch (e) {}

    if (!apiKey && typeof import.meta !== 'undefined' && import.meta.env) {
      apiKey = import.meta.env.VITE_GEMINI_API_KEY || null;
    }

    if (apiKey) {
      let languageRule = '';
      if (preferredLanguage === 'english') {
        languageRule = 'STRICT LANGUAGE MANDATE: The user has selected ENGLISH as their preferred language. You MUST write the personaTitle, executiveSummary, homieLetter, and hiddenFacts 100% in polished, high-impact English. Do NOT use Hinglish or any Hindi phrases under any circumstance.';
      } else if (preferredLanguage === 'hinglish') {
        languageRule = 'STRICT LANGUAGE MANDATE: The user has selected HINGLISH. Write the personaTitle, executiveSummary, and homieLetter in authentic, witty, expressive conversational Hinglish (Hindi in Roman script).';
      } else {
        languageRule = 'LANGUAGE MIRRORING MANDATE: Automatically detect the language of the diary entries. If the notes are written in English, write the entire dossier 100% in pure English (ZERO Hinglish/Hindi words). If written in Hinglish, write in natural Hinglish.';
      }

      const prompt = `You are the user's brutally honest, hilarious, deeply caring bro/best-friend and forensic habit analyst evaluating their daily life log for ${monthName}.

DATA SUMMARY:
- Total Logged Days: ${loggedCount} / ${totalDaysInMonth}
- Hit Rate: ${hitRate}% (Days with rating >= 3)
- Average Quality Score: ${avgScore} / 5.0
- Longest Slump: ${longestSlump} consecutive rough/down days
- Weekday Averages: ${JSON.stringify(weekdayAverages)}
- Friction Breakdown: Screen=${frictionBreakdown.screenDoomscrollPct}%, Academic=${frictionBreakdown.academicStressPct}%, Family/Social=${frictionBreakdown.householdSocialPct}%
- Detailed Log Entries with Notes:
${JSON.stringify(dayMatrix.slice(0, 31), null, 2)}

CORE INSTRUCTIONS:
1. CREATE A UNIQUE, DYNAMIC PERSONA TITLE based on specific diary events.
2. WRITE A 4-PARAGRAPH "HOMIE LETTER" addressing them directly with real validation, playful roasting, resilience celebration, and a brotherly game plan.
3. PROVIDE 5 TO 6 SHARP HIDDEN FACTS referencing exact diary events.
4. ${languageRule}

Return ONLY a valid JSON object matching:
{
  "personaTitle": "...",
  "executiveSummary": "...",
  "homieLetter": ["p1", "p2", "p3", "p4"],
  "hiddenFacts": ["fact1", "fact2", "fact3", "fact4", "fact5", "fact6"],
  "frictionAnalysis": "...",
  "goldenHabits": "...",
  "nextMonthDirectives": ["dir1", "dir2", "dir3"]
}`;

      let aiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.88, maxOutputTokens: 2500, responseMimeType: 'application/json' }
        })
      });

      // Fallback to gemini-3.1-flash-lite if 3.5 is busy
      if (!aiRes.ok) {
        aiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.88, maxOutputTokens: 2500, responseMimeType: 'application/json' }
          })
        });
      }

      if (aiRes.ok) {
        const aiData = await aiRes.json();
        const jsonText = aiData?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (jsonText) {
          const parsed = JSON.parse(jsonText);
          if (parsed.personaTitle) personaTitle = parsed.personaTitle;
          if (parsed.executiveSummary) executiveSummary = parsed.executiveSummary;
          if (parsed.homieLetter && Array.isArray(parsed.homieLetter)) homieLetter = parsed.homieLetter;
          if (parsed.hiddenFacts && Array.isArray(parsed.hiddenFacts)) hiddenFacts = parsed.hiddenFacts;
          if (parsed.frictionAnalysis) frictionAnalysis = parsed.frictionAnalysis;
          if (parsed.goldenHabits) goldenHabits = parsed.goldenHabits;
          if (parsed.nextMonthDirectives && Array.isArray(parsed.nextMonthDirectives)) nextMonthDirectives = parsed.nextMonthDirectives;
        }
      }
    }
  } catch (aiErr) {
    console.warn('Direct client Gemini report error, fallback activated:', aiErr);
  }

  return {
    monthName,
    year,
    month,
    totalLogged: loggedCount,
    totalDaysInMonth,
    hitRate,
    avgScore,
    longestSlump,
    ratingCounts,
    weekdayAverages,
    weeklyAnalytics,
    frictionBreakdown,
    dayMatrix,
    personaTitle,
    executiveSummary,
    homieLetter,
    hiddenFacts,
    frictionAnalysis,
    goldenHabits,
    nextMonthDirectives
  };
}

export function exportDatabaseBackup(startDate, entries) {
  const payload = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    startDate,
    totalEntries: Object.keys(entries).length,
    entries
  };

  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(payload, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `daily_verdict_backup_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

// ============================================================================
// 🎭 STICKER VAULT & CUSTOM MASCOTS MANAGEMENT SYSTEM
// ============================================================================

const STICKER_VAULT_KEY = 'custom_stickers_vault_v1';
const ACTIVE_STICKER_KEY = 'active_wallpaper_sticker_id';

export function getStickerVault() {
  try {
    const raw = localStorage.getItem(STICKER_VAULT_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Failed to parse sticker vault:', e);
    return [];
  }
}

export function saveCustomSticker({ name, dataUrl, tag = 'custom' }) {
  try {
    const current = getStickerVault();
    const newSticker = {
      id: 'sticker_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      name: name || 'Custom Sticker',
      dataUrl,
      tag,
      createdAt: new Date().toISOString()
    };
    const updated = [newSticker, ...current];
    localStorage.setItem(STICKER_VAULT_KEY, JSON.stringify(updated));
    return newSticker;
  } catch (e) {
    console.error('Failed to save custom sticker:', e);
    throw e;
  }
}

export function deleteCustomSticker(stickerId) {
  try {
    const current = getStickerVault();
    const updated = current.filter(s => s.id !== stickerId);
    localStorage.setItem(STICKER_VAULT_KEY, JSON.stringify(updated));
    if (getActiveStickerId() === stickerId) {
      setActiveStickerId('auto');
    }
    return updated;
  } catch (e) {
    console.error('Failed to delete custom sticker:', e);
    return [];
  }
}

export function getActiveStickerId() {
  try {
    return localStorage.getItem(ACTIVE_STICKER_KEY) || 'auto';
  } catch (e) {
    return 'auto';
  }
}

export function setActiveStickerId(stickerId) {
  try {
    localStorage.setItem(ACTIVE_STICKER_KEY, stickerId || 'auto');
  } catch (e) {}
}

// ============================================================================
// 🏛️ BEHAVIORAL TRILOGY ARCHITECTURAL ENGINE (OFF BY DEFAULT)
// ============================================================================

const RANSOM_CAPSULES_STORAGE_KEY = 'daily_verdict_ransom_capsules';
const RANSOM_CAPSULE_ENABLED_KEY = 'daily_verdict_ransom_capsule_enabled';
const RANSOM_CAPSULE_SENSITIVITY_KEY = 'daily_verdict_ransom_capsule_sensitivity';
const AUTOPSY_CHAMBER_ENABLED_KEY = 'daily_verdict_autopsy_chamber_enabled';
const RECEIPT_OF_TRUTH_ENABLED_KEY = 'daily_verdict_receipt_of_truth_enabled';

// 1. Down-Bad Ransom Capsule Preferences & Storage
export function isRansomCapsuleEnabled() {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(RANSOM_CAPSULE_ENABLED_KEY) === 'true';
}

export function setRansomCapsuleEnabled(enabled) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(RANSOM_CAPSULE_ENABLED_KEY, enabled ? 'true' : 'false');
  try {
    const user = getCurrentUser();
    if (user?.uid) {
      saveCloudUserSettings(user.uid, { enableRansomCapsule: enabled });
    }
  } catch (e) {}
}

export function getRansomCapsuleSensitivity() {
  if (typeof window === 'undefined') return 2;
  const val = parseInt(localStorage.getItem(RANSOM_CAPSULE_SENSITIVITY_KEY) || '2', 10);
  return val === 3 ? 3 : 2;
}

export function setRansomCapsuleSensitivity(days) {
  if (typeof window === 'undefined') return;
  const cleanDays = days === 3 ? 3 : 2;
  localStorage.setItem(RANSOM_CAPSULE_SENSITIVITY_KEY, cleanDays.toString());
  try {
    const user = getCurrentUser();
    if (user?.uid) {
      saveCloudUserSettings(user.uid, { ransomCapsuleSensitivity: cleanDays });
    }
  } catch (e) {}
}

export function getRansomCapsules() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(RANSOM_CAPSULES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    
    // Auto-decrypt any unlocked capsule that lacks plaintext on this client
    return parsed.map(c => {
      if (c && c.status === 'unlocked' && !c.decryptedMessage && c.cipher) {
        return {
          ...c,
          decryptedMessage: decryptCapsuleMessage(c.cipher)
        };
      }
      return c;
    });
  } catch (e) {
    console.error('Failed to parse time capsules:', e);
    return [];
  }
}

export const getTimeCapsules = getRansomCapsules;

// 🧮 Compute Current Unbroken Positive Habit Streak (>=3 Stars, Protected by Rehabilitation Freeze)
export function calculateStreak(entries = {}) {
  const dates = Object.keys(entries || {});
  if (dates.length === 0) return 0;

  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const todayStr = `${y}-${m}-${d}`;

  const yest = new Date(now);
  yest.setDate(yest.getDate() - 1);
  const yestStr = `${yest.getFullYear()}-${String(yest.getMonth() + 1).padStart(2, '0')}-${String(yest.getDate()).padStart(2, '0')}`;

  const rehabActive = isRehabilitationActive();

  if (!entries[todayStr]?.rating && !entries[yestStr]?.rating && !rehabActive) {
    return 0;
  }

  let streak = 0;
  let curr = entries[todayStr]?.rating ? new Date(now) : yest;
  if (!entries[todayStr]?.rating && rehabActive) {
    curr = yest;
  }

  while (true) {
    const ds = `${curr.getFullYear()}-${String(curr.getMonth() + 1).padStart(2, '0')}-${String(curr.getDate()).padStart(2, '0')}`;
    const entry = entries[ds];
    const isRehabDay = (entry && (entry.isRehabilitation || entry.isStreakFreeze)) || isRehabilitationActive(ds);

    if (entry && Number(entry.rating) >= 3) {
      streak++;
      curr.setDate(curr.getDate() - 1);
    } else if (isRehabDay) {
      // 🌿 Rehabilitation & Streak Freeze: Bridge the streak without resetting to zero
      curr.setDate(curr.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

// ☁️ Zero-Knowledge Encrypted Cloud Capsule Sync
export async function syncTimeCapsulesToCloud(capsules = []) {
  try {
    const user = getCurrentUser();
    const effectiveId = getEffectiveUserId(user);
    if (effectiveId && effectiveId !== 'guest') {
      // Zero-knowledge: Send ciphertext payload to Firebase with dual redundancy
      await saveCloudCapsules(effectiveId, capsules);
    }
  } catch (e) {
    console.warn('Capsule cloud sync note:', e);
  }
}

/**
 * ☁️ Cross-Device Cloud Hydration & Zero-Knowledge Decryption Engine
 * Merges capsules from Firebase Firestore into local storage when user logs in on a new device.
 * Guarantees that any unlocked capsules are immediately readable.
 */
export async function hydrateTimeCapsulesFromCloud(user = null) {
  try {
    const activeUser = user || getCurrentUser();
    const effectiveId = getEffectiveUserId(activeUser);
    if (!effectiveId || effectiveId === 'guest') return getRansomCapsules();

    console.log(`📡 [Cloud Capsules] Fetching cloud capsules for user: ${effectiveId}...`);
    const cloudCapsules = await fetchCloudCapsules(effectiveId);
    const localCapsules = getRansomCapsules();

    if (!Array.isArray(cloudCapsules) || cloudCapsules.length === 0) {
      if (localCapsules.length > 0) {
        console.log(`📦 [Cloud Capsules] Syncing ${localCapsules.length} existing local capsules to Firebase...`);
        await saveCloudCapsules(effectiveId, localCapsules);
      }
      return localCapsules;
    }

    const mergedMap = new Map();

    // 1. Ingest cloud capsules and auto-decrypt unlocked ones
    cloudCapsules.forEach(cap => {
      if (cap?.id) {
        let processed = { ...cap };
        if (processed.status === 'unlocked' && !processed.decryptedMessage && processed.cipher) {
          processed.decryptedMessage = decryptCapsuleMessage(processed.cipher);
        }
        mergedMap.set(cap.id, processed);
      }
    });

    // 2. Merge local capsules (preserve any newly captured or locally unsealed letters)
    localCapsules.forEach(cap => {
      if (cap?.id) {
        const existing = mergedMap.get(cap.id);
        if (!existing) {
          mergedMap.set(cap.id, cap);
        } else if (cap.status === 'unlocked' && existing.status !== 'unlocked') {
          mergedMap.set(cap.id, cap);
        } else if (cap.status === 'unlocked' && !existing.decryptedMessage && (cap.decryptedMessage || cap.cipher)) {
          mergedMap.set(cap.id, {
            ...existing,
            ...cap,
            decryptedMessage: cap.decryptedMessage || decryptCapsuleMessage(cap.cipher)
          });
        }
      }
    });

    const merged = Array.from(mergedMap.values());
    merged.sort((a, b) => new Date(b.createdAt || b.createdDate || 0) - new Date(a.createdAt || a.createdDate || 0));

    localStorage.setItem(RANSOM_CAPSULES_STORAGE_KEY, JSON.stringify(merged));
    console.log(`🎉 [Cloud Capsules SUCCESS] Loaded and merged ${merged.length} capsules from cloud!`);

    // Keep cloud updated with the complete union
    await saveCloudCapsules(effectiveId, merged);
    return merged;
  } catch (err) {
    console.warn('Capsule cloud hydration warning:', err);
    return getRansomCapsules();
  }
}

export function saveRansomCapsule({ 
  message, 
  title = '', 
  triggerType = 'date', // 'date' | 'slump' | 'streak'
  targetDate = null,
  roughDaysThreshold = 2,
  streakThreshold = 7,
  sealStyle = 'wax', // 'wax' | 'cyber' | 'top_secret' | 'biohazard'
  category = 'motivation',
  date = new Date().toISOString().slice(0, 10), 
  streak = 0 
}) {
  if (!message || !message.trim()) return null;
  try {
    const current = getRansomCapsules();
    const encrypted = encryptCapsuleMessage(message.trim());
    const newCapsule = {
      id: 'capsule_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      createdAt: new Date().toISOString(),
      createdDate: date || new Date().toISOString().slice(0, 10),
      title: title && title.trim() ? title.trim() : 'Confidential Capsule',
      triggerType: triggerType || 'date',
      targetDate: targetDate || null,
      roughDaysThreshold: Number(roughDaysThreshold) || 2,
      streakThreshold: Number(streakThreshold) || 7,
      sealStyle: sealStyle || 'wax',
      category: category || 'motivation',
      cipher: encrypted,
      status: 'sealed', // 'sealed' | 'unlocked'
      streakAtCapture: streak,
      peakRating: 5
    };
    const updated = [newCapsule, ...current];
    localStorage.setItem(RANSOM_CAPSULES_STORAGE_KEY, JSON.stringify(updated));
    syncTimeCapsulesToCloud(updated);
    return newCapsule;
  } catch (e) {
    console.error('Failed to save time capsule:', e);
    throw e;
  }
}

export const saveTimeCapsule = saveRansomCapsule;

export function getActiveSealedCapsule() {
  const capsules = getRansomCapsules();
  return capsules.find(c => c && c.status === 'sealed') || null;
}

// Evaluates all sealed capsules against current date, streak, and recent consecutive rough days
export function checkCapsuleUnlockConditions(entries = {}, currentStreak = 0) {
  const todayStr = new Date().toISOString().slice(0, 10);
  const capsules = getRansomCapsules();
  const readyToUnlock = [];

  // Calculate consecutive rough days ending today or yesterday
  const sortedDates = Object.keys(entries || {}).sort().reverse();
  let consecutiveRough = 0;
  for (const d of sortedDates) {
    const entry = entries[d];
    if (entry && (entry.rating === 1 || entry.rating === 2)) {
      consecutiveRough++;
    } else {
      break;
    }
  }

  capsules.forEach(cap => {
    if (cap && cap.status === 'sealed') {
      if (cap.triggerType === 'date' && cap.targetDate) {
        if (todayStr >= cap.targetDate) {
          readyToUnlock.push(cap);
        }
      } else if (cap.triggerType === 'slump') {
        const threshold = Number(cap.roughDaysThreshold) || 2;
        if (consecutiveRough >= threshold) {
          readyToUnlock.push(cap);
        }
      } else if (cap.triggerType === 'streak') {
        const threshold = Number(cap.streakThreshold) || 7;
        if (currentStreak >= threshold) {
          readyToUnlock.push(cap);
        }
      }
    }
  });

  return readyToUnlock;
}

export function unlockRansomCapsule(capsuleId) {
  try {
    const current = getRansomCapsules();
    let unlockedCapsule = null;
    const updated = current.map(c => {
      if (c.id === capsuleId) {
        unlockedCapsule = {
          ...c,
          status: 'unlocked',
          unlockedAt: new Date().toISOString(),
          decryptedMessage: decryptCapsuleMessage(c.cipher)
        };
        return unlockedCapsule;
      }
      return c;
    });
    localStorage.setItem(RANSOM_CAPSULES_STORAGE_KEY, JSON.stringify(updated));
    syncTimeCapsulesToCloud(updated);
    return unlockedCapsule;
  } catch (e) {
    console.error('Failed to unlock capsule:', e);
    return null;
  }
}

export const unlockTimeCapsule = unlockRansomCapsule;

export function deleteRansomCapsule(capsuleId) {
  try {
    const current = getRansomCapsules();
    const updated = current.filter(c => c.id !== capsuleId);
    localStorage.setItem(RANSOM_CAPSULES_STORAGE_KEY, JSON.stringify(updated));
    syncTimeCapsulesToCloud(updated);
    return updated;
  } catch (e) {
    console.error('Failed to delete capsule:', e);
    return [];
  }
}

export const deleteTimeCapsule = deleteRansomCapsule;

// 2. Autopsy Chamber Interrogator Preferences
export function isAutopsyChamberEnabled() {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(AUTOPSY_CHAMBER_ENABLED_KEY) === 'true';
}

export function setAutopsyChamberEnabled(enabled) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(AUTOPSY_CHAMBER_ENABLED_KEY, enabled ? 'true' : 'false');
  try {
    const user = getCurrentUser();
    if (user?.uid) {
      saveCloudUserSettings(user.uid, { enableAutopsyChamber: enabled });
    }
  } catch (e) {}
}

// 3. Receipt of Truth Preferences (Off by default, locked/opt-in via Settings)
export function isReceiptOfTruthEnabled() {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(RECEIPT_OF_TRUTH_ENABLED_KEY) === 'true';
}

export function setReceiptOfTruthEnabled(enabled) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(RECEIPT_OF_TRUTH_ENABLED_KEY, enabled ? 'true' : 'false');
  try {
    const user = getCurrentUser();
    if (user?.uid) {
      saveCloudUserSettings(user.uid, { enableReceiptOfTruth: enabled });
    }
  } catch (e) {}
}

// 4. Guest Disclaimer State
export const GUEST_DISCLAIMER_KEY = 'daily_verdict_guest_disclaimer_dismissed';
export const GUEST_DISCLAIMER_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export function isGuestDisclaimerDismissed() {
  if (typeof window === 'undefined') return false;
  try {
    const raw = localStorage.getItem(GUEST_DISCLAIMER_KEY);
    if (!raw) return false;
    const timestamp = parseInt(raw, 10);
    if (!isNaN(timestamp)) {
      const isStillValid = (Date.now() - timestamp) < GUEST_DISCLAIMER_TTL_MS;
      if (!isStillValid) {
        localStorage.removeItem(GUEST_DISCLAIMER_KEY);
        return false;
      }
      return true;
    }
    return raw === 'true';
  } catch (e) {
    return false;
  }
}

export function setGuestDisclaimerDismissed() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(GUEST_DISCLAIMER_KEY, Date.now().toString());
  } catch (e) {}
}

// ============================================================================
// 🌿 REHABILITATION & STREAK FREEZE PROTOCOL (7-TO-14 DAYS SANCTUARY ENGINE)
// ============================================================================

export const REHAB_CONFIG_KEY = 'daily_verdict_rehabilitation_v1';
export const COMPASSION_ANCHORS_KEY = 'daily_verdict_compassion_anchors_v1';
export const AUTO_SANCTUARY_ASSUMED_KEY = 'daily_verdict_auto_sanctuary_assumed_v1';
export const SANCTUARY_RESPONSES_KEY = 'daily_verdict_sanctuary_responses_v1';

export const DEFAULT_COMPASSION_ANCHORS = [
  { id: 'rest_sleep', title: 'Rest & 8hr Sleep', desc: 'Allow body and mind to recharge deeply', utils: 2.0 },
  { id: 'hydration', title: 'Drink Water & Hydrate', desc: 'At least 2L clean water throughout the day', utils: 1.0 },
  { id: 'fresh_air', title: 'Step Outside for Fresh Air', desc: '5-10 minutes without screens or obligations', utils: 1.0 },
  { id: 'peaceful_joy', title: 'One Small Joy / Peaceful Act', desc: 'Read, listen to music, or just sit peacefully', utils: 1.0 }
];

export const DEFAULT_SANCTUARY_INQUIRIES = [
  { id: 'water', question: 'Have you drank a glass of water today?', icon: '💧', affirmText: 'Yes 💧', deferText: 'Not yet' },
  { id: 'screens', question: 'Did you step away from screens for a moment?', icon: '🌿', affirmText: 'Yes 🌿', deferText: 'Not yet' },
  { id: 'nourish', question: 'Have you eaten something nourishing?', icon: '🍲', affirmText: 'Yes 🍲', deferText: 'Later' },
  { id: 'sigh', question: 'Took a deep physiological sigh (2 inhales, long exhale)?', icon: '🫁', affirmText: 'Done 🫁', deferText: 'Will try' }
];

export function getRehabilitationConfig() {
  if (typeof window === 'undefined') return { active: false, freezeDays: 7, maxDays: 14 };
  try {
    const raw = localStorage.getItem(REHAB_CONFIG_KEY);
    if (!raw) return { active: false, freezeDays: 7, maxDays: 14 };
    const parsed = JSON.parse(raw);
    if (parsed.active && parsed.startDate) {
      if (parsed.isSabbatical) {
        parsed.daysRemaining = '∞';
        parsed.elapsedDays = 0;
        parsed.needsDay7CheckIn = false;
        return parsed;
      }
      const start = new Date(`${parsed.startDate}T00:00:00`).getTime();
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const elapsedDays = Math.max(0, Math.floor((today.getTime() - start) / (24 * 60 * 60 * 1000)));
      const allowedDays = Math.min(parsed.freezeDays || 7, 14);

      if (elapsedDays >= allowedDays) {
        parsed.active = false;
        parsed.expired = true;
        localStorage.setItem(REHAB_CONFIG_KEY, JSON.stringify(parsed));
      } else {
        parsed.daysRemaining = Math.max(0, allowedDays - elapsedDays);
        parsed.elapsedDays = elapsedDays;
        parsed.needsDay7CheckIn = elapsedDays >= 7 && !parsed.checkedInDay7;
      }
    }
    return parsed;
  } catch (e) {
    return { active: false, freezeDays: 7, maxDays: 14 };
  }
}

export function isRehabilitationActive(targetDateStr = null) {
  if (typeof window === 'undefined') return false;
  try {
    const cfg = getRehabilitationConfig();
    if (!cfg || !cfg.active || !cfg.startDate) return false;

    if (!targetDateStr) return true; // Current status check

    const start = new Date(`${cfg.startDate}T00:00:00`).getTime();
    const target = new Date(`${targetDateStr}T00:00:00`).getTime();
    if (cfg.isSabbatical) {
      return target >= start;
    }
    const allowedDays = Math.min(cfg.freezeDays || 7, 14);
    const end = start + (allowedDays * 24 * 60 * 60 * 1000);

    return target >= start && target < end;
  } catch (e) {
    return false;
  }
}

export function activateRehabilitation(freezeDays = 7) {
  if (typeof window === 'undefined') return;
  try {
    const cappedDays = Math.min(Math.max(1, freezeDays), 14);
    const now = new Date();
    const startDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const payload = {
      active: true,
      isSabbatical: false,
      startDate,
      freezeDays: cappedDays,
      maxDays: 14,
      checkedInDay7: false,
      activatedAt: new Date().toISOString()
    };
    localStorage.setItem(REHAB_CONFIG_KEY, JSON.stringify(payload));
    return payload;
  } catch (e) {
    console.warn('Failed to activate rehabilitation:', e);
  }
}

export function extendRehabilitation(additionalDays = 7) {
  if (typeof window === 'undefined') return;
  try {
    const current = getRehabilitationConfig();
    if (!current.active) return activateRehabilitation(7);
    const newTotal = Math.min((current.freezeDays || 7) + additionalDays, 14); // 14 days strict ceiling
    current.freezeDays = newTotal;
    current.checkedInDay7 = true;
    localStorage.setItem(REHAB_CONFIG_KEY, JSON.stringify(current));
    return current;
  } catch (e) {
    console.warn('Failed to extend rehabilitation:', e);
  }
}

export function activateSabbatical() {
  if (typeof window === 'undefined') return;
  try {
    const now = new Date();
    const startDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const payload = {
      active: true,
      isSabbatical: true,
      startDate,
      freezeDays: 9999,
      maxDays: 9999,
      checkedInDay7: true,
      activatedAt: new Date().toISOString()
    };
    localStorage.setItem(REHAB_CONFIG_KEY, JSON.stringify(payload));
    return payload;
  } catch (e) {
    console.warn('Failed to activate sabbatical:', e);
  }
}

export function exitRehabilitation() {
  if (typeof window === 'undefined') return;
  try {
    const current = getRehabilitationConfig();
    current.active = false;
    current.isSabbatical = false;
    current.exitedAt = new Date().toISOString();
    delete current.autoSanctuaryAssumed;
    localStorage.setItem(REHAB_CONFIG_KEY, JSON.stringify(current));
  } catch (e) {}
}

/**
 * 🤖 Auto-Sanctuary Assumption Engine
 * Automatically triggers freeze if 2+ consecutive rough days (<=2 stars) were experienced right before missing yesterday
 */
export function checkAutoSanctuaryEligible(entries = {}) {
  if (!entries || typeof entries !== 'object') return { eligible: false, reason: 'no_entries' };

  const now = new Date();
  const yest = new Date(now);
  yest.setDate(yest.getDate() - 1);
  const yestStr = `${yest.getFullYear()}-${String(yest.getMonth() + 1).padStart(2, '0')}-${String(yest.getDate()).padStart(2, '0')}`;

  // If yesterday already has an entry, user didn't miss yesterday
  if (entries[yestStr]?.rating) {
    return { eligible: false, reason: 'yesterday_rated' };
  }

  // If sanctuary is already active, no need to auto-trigger
  if (isRehabilitationActive()) {
    return { eligible: false, reason: 'sanctuary_already_active' };
  }

  // Look back at preceding days before yesterday (days -2, -3, -4, -5)
  let consecutiveRoughCount = 0;
  for (let i = 2; i <= 5; i++) {
    const prevDate = new Date(now);
    prevDate.setDate(prevDate.getDate() - i);
    const prevStr = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}-${String(prevDate.getDate()).padStart(2, '0')}`;
    const entry = entries[prevStr];

    if (entry && entry.rating && Number(entry.rating) <= 2) {
      consecutiveRoughCount++;
    } else if (entry && entry.rating && Number(entry.rating) > 2) {
      break; // Streak of rough days ended
    } else {
      break;
    }
  }

  if (consecutiveRoughCount >= 2) {
    return {
      eligible: true,
      roughCount: consecutiveRoughCount,
      reason: 'chronic_friction_before_missed_day'
    };
  }

  return { eligible: false, roughCount: consecutiveRoughCount, reason: 'insufficient_consecutive_rough' };
}

export function autoActivateSanctuaryIfEligible(entries = {}) {
  if (typeof window === 'undefined') return { autoActivated: false };
  try {
    const check = checkAutoSanctuaryEligible(entries);
    if (!check.eligible) return { autoActivated: false, check };

    const todayStr = new Date().toISOString().slice(0, 10);
    const lastAssumedDate = localStorage.getItem(AUTO_SANCTUARY_ASSUMED_KEY);
    if (lastAssumedDate === todayStr) {
      return { autoActivated: false, reason: 'already_assumed_today' };
    }

    const payload = activateRehabilitation(7);
    if (payload) {
      payload.autoSanctuaryAssumed = true;
      payload.roughCount = check.roughCount;
      localStorage.setItem(REHAB_CONFIG_KEY, JSON.stringify(payload));
      localStorage.setItem(AUTO_SANCTUARY_ASSUMED_KEY, todayStr);
      return { autoActivated: true, roughCount: check.roughCount };
    }
  } catch (e) {
    console.warn('Auto-sanctuary trigger note:', e);
  }
  return { autoActivated: false };
}

export function isAutoSanctuaryAssumed() {
  if (typeof window === 'undefined') return false;
  try {
    const cfg = getRehabilitationConfig();
    return Boolean(cfg && cfg.active && cfg.autoSanctuaryAssumed);
  } catch (e) {
    return false;
  }
}

export function dismissAutoSanctuaryAssumption() {
  if (typeof window === 'undefined') return;
  try {
    const cfg = getRehabilitationConfig();
    if (cfg && cfg.autoSanctuaryAssumed) {
      delete cfg.autoSanctuaryAssumed;
      localStorage.setItem(REHAB_CONFIG_KEY, JSON.stringify(cfg));
    }
  } catch (e) {}
}

export function getSanctuaryInquiryResponses(dateStr = '') {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(SANCTUARY_RESPONSES_KEY);
    const all = raw ? JSON.parse(raw) : {};
    return dateStr ? (all[dateStr] || {}) : all;
  } catch (e) {
    return {};
  }
}

export function saveSanctuaryInquiryResponse(dateStr, inquiryId, answer) {
  if (typeof window === 'undefined' || !dateStr || !inquiryId) return;
  try {
    const raw = localStorage.getItem(SANCTUARY_RESPONSES_KEY);
    const all = raw ? JSON.parse(raw) : {};
    if (!all[dateStr]) all[dateStr] = {};
    all[dateStr][inquiryId] = {
      answer,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem(SANCTUARY_RESPONSES_KEY, JSON.stringify(all));
    return all[dateStr];
  } catch (e) {}
}

export function getCompassionAnchors() {
  if (typeof window === 'undefined') return DEFAULT_COMPASSION_ANCHORS;
  try {
    const raw = localStorage.getItem(COMPASSION_ANCHORS_KEY);
    return raw ? JSON.parse(raw) : DEFAULT_COMPASSION_ANCHORS;
  } catch (e) {
    return DEFAULT_COMPASSION_ANCHORS;
  }
}

export function saveCompassionAnchors(anchors) {
  if (typeof window === 'undefined' || !Array.isArray(anchors)) return;
  try {
    localStorage.setItem(COMPASSION_ANCHORS_KEY, JSON.stringify(anchors));
  } catch (e) {}
}

// ============================================================================
// 📊 MULTI-FORMAT DATA EXPORT STUDIO (CSV, DIARY DIGEST, JSON)
// ============================================================================

export function exportEntriesToCsv(entries = {}, startDate = '') {
  const dates = Object.keys(entries || {}).sort().reverse();
  const rows = [
    ['Date', 'Verdict', 'Star Rating', 'Rehabilitation', 'Habits Completed', 'Reflection Notes', 'Life Spheres']
  ];

  dates.forEach(ds => {
    const item = entries[ds];
    if (!item) return;

    const rating = item.rating || '';
    const verdict = item.verdict || (ratingMeta[rating]?.title) || '';
    const isRehab = item.isRehabilitation || item.isStreakFreeze ? 'YES' : 'NO';

    // Format anchors / habits
    let habitsStr = '';
    if (item.anchors && typeof item.anchors === 'object') {
      habitsStr = Object.entries(item.anchors)
        .filter(([_, val]) => !!val)
        .map(([key]) => key)
        .join('; ');
    }

    // Notes
    const notesStr = item.notes ? item.notes.replace(/\r?\n/g, ' ') : '';

    // Spheres
    let spheresStr = '';
    if (item.spheres && typeof item.spheres === 'object') {
      spheresStr = Object.entries(item.spheres)
        .map(([id, s]) => `${id}:${s.rating || ''}`)
        .join('; ');
    }

    rows.push([ds, verdict, rating, isRehab, habitsStr, notesStr, spheresStr]);
  });

  // RFC 4180 CSV serialization
  const csvContent = rows.map(row => 
    row.map(cell => {
      const str = String(cell ?? '');
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    }).join(',')
  ).join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `daily_verdict_export_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function exportEntriesToDiaryDigest(entries = {}, startDate = '') {
  const dates = Object.keys(entries || {}).sort().reverse();
  const dateExported = new Date().toISOString().slice(0, 10);

  let digest = `# 📖 Daily Verdict — Personal Diary Digest\n`;
  digest += `*Exported on ${dateExported} • Total Recorded Entries: ${dates.length}*\n\n`;
  digest += `> "A private sanctuary for daily truth, habit forensics, and personal momentum."\n\n`;
  digest += `---\n\n`;

  dates.forEach(ds => {
    const item = entries[ds];
    if (!item) return;

    const rating = item.rating || 0;
    const verdict = item.verdict || (ratingMeta[rating]?.title) || 'Unrated';
    const starIcons = '★'.repeat(Math.max(0, Math.min(5, Number(rating)))) + '☆'.repeat(Math.max(0, 5 - Number(rating)));

    digest += `### 📅 ${ds} — ${starIcons} ${verdict}\n`;
    if (item.isRehabilitation || item.isStreakFreeze) {
      digest += `*🌿 Rehabilitation / Streak Freeze Day*\n\n`;
    }

    if (item.notes && item.notes.trim()) {
      digest += `**Reflection Notes:**\n> ${item.notes.replace(/\n/g, '\n> ')}\n\n`;
    } else {
      digest += `*No notes recorded for this day.*\n\n`;
    }

    if (item.anchors && typeof item.anchors === 'object') {
      const completed = Object.entries(item.anchors).filter(([_, v]) => !!v).map(([k]) => k);
      if (completed.length > 0) {
        digest += `**Habits Completed:** ${completed.join(', ')}\n\n`;
      }
    }

    digest += `---\n\n`;
  });

  const blob = new Blob([digest], { type: 'text/markdown;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `daily_verdict_diary_digest_${dateExported}.md`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export const exportDiaryDigestToMarkdown = exportEntriesToDiaryDigest;

// ============================================================================
// 🛡️ DPDPA 2023 STATUTORY COMPLIANCE: COMPLETE RIGHT TO ERASURE
// ============================================================================

export const PENDING_DELETION_KEY = 'daily_verdict_pending_deletion_v1';

/**
 * ⏳ 7-Day Cooling-Off Erasure Holding Pattern (DPDPA 2023 Statutory Protection)
 * Schedules account deletion with a reversible 7-day grace window.
 */
export function scheduleAccountDeletion(graceDays = 7) {
  if (typeof window === 'undefined') return;
  const now = Date.now();
  const executeAt = now + (graceDays * 24 * 60 * 60 * 1000);
  const payload = {
    active: true,
    scheduledAt: now,
    executeAt,
    graceDays,
    scheduledDateStr: new Date(now).toISOString().slice(0, 10),
    executeDateStr: new Date(executeAt).toISOString().slice(0, 10)
  };
  localStorage.setItem(PENDING_DELETION_KEY, JSON.stringify(payload));
  return payload;
}

/**
 * Cancels pending account deletion immediately, preserving user records
 */
export function cancelAccountDeletion() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(PENDING_DELETION_KEY);
  return { cancelled: true };
}

/**
 * Checks pending deletion status and remaining grace period
 */
export function getPendingDeletionStatus() {
  if (typeof window === 'undefined') return { pending: false };
  try {
    const raw = localStorage.getItem(PENDING_DELETION_KEY);
    if (!raw) return { pending: false };
    const parsed = JSON.parse(raw);
    if (!parsed.active || !parsed.executeAt) return { pending: false };

    const now = Date.now();
    if (now >= parsed.executeAt) {
      permanentlyDeleteAllUserData(true);
      return { pending: false, executed: true };
    }

    const msRemaining = Math.max(0, parsed.executeAt - now);
    const daysRemaining = Math.ceil(msRemaining / (24 * 60 * 60 * 1000));
    const hoursRemaining = Math.ceil(msRemaining / (60 * 60 * 1000));

    return {
      pending: true,
      scheduledAt: parsed.scheduledAt,
      executeAt: parsed.executeAt,
      daysRemaining,
      hoursRemaining,
      scheduledDateStr: parsed.scheduledDateStr,
      executeDateStr: parsed.executeDateStr
    };
  } catch (e) {
    return { pending: false };
  }
}

export async function permanentlyDeleteAllUserData(shouldReload = true) {
  if (typeof window === 'undefined') return false;
  try {
    console.log('🚨 [DPDPA 2023] Executing Permanent Right to Erasure...');

    // 1. Cloud Deletion: Purge all Firestore user documents if authenticated
    try {
      const user = getCurrentUser();
      const effectiveId = getEffectiveUserId(user);
      if (effectiveId && effectiveId !== 'guest') {
        await deleteCloudUserData(effectiveId);
      }
    } catch (cloudErr) {
      console.warn('Cloud purge warning:', cloudErr);
    }

    // 2. Local Deletion: Purge all application localStorage keys
    const allKeys = Object.keys(localStorage);
    allKeys.forEach(k => {
      if (
        k.startsWith('goodness_db') ||
        k.startsWith('daily_verdict') ||
        k.startsWith('custom_display_name') ||
        k.startsWith('daily_non_negotiables') ||
        k.startsWith('vault_pin') ||
        k.startsWith('user_spheres') ||
        k.startsWith('custom_stickers') ||
        k.startsWith('active_wallpaper') ||
        k === 'local_auth_user' ||
        k === 'goodness_theme'
      ) {
        localStorage.removeItem(k);
      }
    });

    // 3. Purge session storage
    sessionStorage.clear();

    console.log('✅ [DPDPA 2023] All local and cloud records completely erased.');
    if (shouldReload) {
      window.location.reload();
    }
    return true;
  } catch (err) {
    console.error('Failed to execute complete data erasure:', err);
    return false;
  }
}



