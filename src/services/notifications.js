// Smart Brotherly Notification & Reminder Engine (Zero-PII, Zero-Emoji)

const HINGLISH_REMINDERS = [
  "Bhai yaar rating nahi dali na tune? Kar le na shanti se, kya timepass kar raha hai!",
  "Bhai aaj ka daalna tu bhool chuka hai, yaad dila raha hoon bas... baad mein kahega yaad nahi dilaya!",
  "Are yaar daal de na rating, achhi khasi late ho gayi hai! Poore din karta nahi, raat ko karne mein bhi natak!",
  "Bhai bhai please please please rating daal de, please please please... matlab rating daal de aur kya apni!",
  "Mere devta, mere prabhu... rating de di aaj ke day ki? Main aapke bhale ke liye bol raha hoon!",
  "Bhai sun na, Hit tha ya Shit? Bas 1 tap deke rating lock karle!",
  "Oye hero! Diary entry kaun karega? 1 minute lagega bas, abhi nipata le!"
];

export function getRandomReminderText() {
  const idx = Math.floor(Math.random() * HINGLISH_REMINDERS.length);
  return HINGLISH_REMINDERS[idx];
}

export function detectActiveEngine() {
  if (typeof window === 'undefined') return 'standard';
  try {
    const rawRehab = localStorage.getItem('goodness_rehab_config');
    if (rawRehab) {
      const cfg = JSON.parse(rawRehab);
      if (cfg && cfg.active) {
        if (cfg.isSabbatical || (cfg.freezeDays && cfg.freezeDays > 30)) {
          return 'sabbatical';
        }
        return 'sanctuary';
      }
    }
    const sphereRaw = localStorage.getItem('daily_verdict_sphere_mode_enabled');
    if (sphereRaw === 'true') {
      return 'spheres';
    }
    const nonNegRaw = localStorage.getItem('daily_verdict_non_negotiables_enabled');
    const rawAnchors = localStorage.getItem('daily_anchors_config');
    if (nonNegRaw === 'true' || (rawAnchors && JSON.parse(rawAnchors)?.enabled)) {
      return 'non-negotiables';
    }
  } catch (e) {}
  return 'standard';
}

export function getEngineNotificationContent(engineKey = null) {
  const engine = engineKey || detectActiveEngine();
  switch (engine) {
    case 'spheres':
      return {
        title: 'LIFE SPHERES AUDIT • DOMAINS',
        body: 'Audit your life spheres. Type domain ratings (e.g. 321 or 453) followed by notes.',
        placeholder: 'Type numbers (e.g. 321) & domain reflections...'
      };
    case 'sabbatical':
      return {
        title: 'SABBATICAL STASIS • DAILY CHRONICLE',
        body: 'Open horizon active. Streak shielded & frozen. Record your reflection note for today.',
        placeholder: 'Write today\'s sabbatical chronicle note...'
      };
    case 'sanctuary':
      return {
        title: 'TRANQUILITY SANCTUARY • SOMATIC RESET',
        body: 'Nervous system recovery active. Breathe 4-2-6 and check in on your recovery state.',
        placeholder: 'Log recovery state (1-5★) or soothing note...'
      };
    case 'non-negotiables':
      return {
        title: 'DAILY ANCHORS & HABITS AUDIT',
        body: 'Non-negotiable audit. Type binary status (e.g. 101 for done/not-done) & summary.',
        placeholder: 'Type binary (e.g. 101) & habit summary...'
      };
    case 'standard':
    default:
      return {
        title: 'DAILY VERDICT • HIT OR SHIT',
        body: getRandomReminderText(),
        placeholder: 'Type 1-5 & optional note (e.g. 5 Finished workout)...'
      };
  }
}

export function isNotificationSupported() {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function getNotificationPermission() {
  if (!isNotificationSupported()) return 'unsupported';
  return Notification.permission; // 'default' | 'granted' | 'denied'
}

export async function requestNotificationPermission() {
  if (!isNotificationSupported()) return false;
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      localStorage.setItem('daily_verdict_notifications', 'enabled');
      scheduleLocalEveningReminder();
      return true;
    }
  } catch (err) {
    console.warn('Notification permission error:', err);
  }
  return false;
}

export function isNotificationEnabled() {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('daily_verdict_notifications') === 'enabled' && Notification.permission === 'granted';
}

export function disableNotifications() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('daily_verdict_notifications');
  }
}

export function getNotificationBannerMode() {
  if (typeof window === 'undefined') return 'inline';
  const stored = localStorage.getItem('daily_verdict_notification_mode');
  // Default to inline if unset or if legacy 'all5' (which overflows OS limits)
  if (!stored || stored === 'all5') return 'inline';
  return stored;
}

export function setNotificationBannerMode(mode) {
  if (typeof window !== 'undefined') {
    const safeMode = mode === 'polar' ? 'polar' : 'inline';
    localStorage.setItem('daily_verdict_notification_mode', safeMode);
    if (typeof window.dispatchEvent === 'function') {
      window.dispatchEvent(new CustomEvent('notification-mode-updated', { detail: safeMode }));
    }
  }
}

export function getNotificationRatingActions(forcedMode = null, engineContext = null) {
  const mode = forcedMode || getNotificationBannerMode();
  const engineContent = getEngineNotificationContent(engineContext);

  // Mode 1: Inline 1-5★ Rating & Note Text Field (DEFAULT - works on Android & Windows)
  if (mode === 'inline') {
    return [
      {
        action: 'rate-inline',
        title: engineContext === 'sabbatical' ? 'Record Note' : 'Log Verdict (1-5★ & Note)',
        type: 'text',
        placeholder: engineContent.placeholder
      },
      {
        action: 'rate-open',
        title: 'Open Today'
      }
    ];
  }

  // Mode 2: Polar Quick Actions (1★ Shit vs 5★ Hit binary buttons - 100% Windows & Android Compatible)
  return [
    { action: 'rate-1', title: '1★ Shit (Rough)' },
    { action: 'rate-5', title: '5★ Hit (Peak)' }
  ];
}

export const NOTIFICATION_RATING_ACTIONS = getNotificationRatingActions();

export async function showInstantReminderNotification(customBody = null, overrideMode = null, engineContext = null) {
  if (!isNotificationSupported()) {
    console.warn('Notifications are NOT supported in this browser window environment.');
    return false;
  }

  const engineContent = getEngineNotificationContent(engineContext);
  const title = engineContent.title;
  const body = customBody || engineContent.body;

  // If permission not granted yet, ask for it
  if (Notification.permission !== 'granted') {
    const perm = await requestNotificationPermission();
    if (!perm) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('in_app_reminder', { detail: { title, body } }));
      }
      return false;
    }
  }

  const actions = getNotificationRatingActions(overrideMode, engineContext);

  try {
    // Method A: Check for active Service Worker Registration (Supports 1-Tap Notification Actions)
    if ('serviceWorker' in navigator) {
      try {
        let registration = await navigator.serviceWorker.getRegistration();
        if (!registration) {
          registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
          await navigator.serviceWorker.ready;
        }
        if (registration && registration.showNotification) {
          const targetUrl = (typeof window !== 'undefined' ? window.location.origin : '') + '/';
          await registration.showNotification(title, {
            body,
            icon: '/icon-192.png',
            badge: '/icon-192.png',
            data: { url: targetUrl },
            vibrate: [150, 50, 150],
            tag: 'daily-verdict-reminder',
            renotify: true,
            actions
          });
          return true;
        }
      } catch (swErr) {
        console.warn('ServiceWorker notification trigger note:', swErr.message || swErr);
      }
    }

    // Method B: Standard Web Notification API Fallback (Desktop/Safari)
    const targetUrl = (typeof window !== 'undefined' ? window.location.origin : '') + '/';
    const n = new Notification(title, {
      body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      vibrate: [150, 50, 150],
      tag: 'daily-verdict-reminder',
      data: { url: targetUrl }
    });

    n.onclick = (event) => {
      event.preventDefault();
      window.focus();
      try {
        window.location.href = targetUrl;
      } catch (err) {}
      n.close();
    };

    return true;
  } catch (err) {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('in_app_reminder', { detail: { title, body } }));
    }
    return false;
  }
}

/**
 * 🎯 MULTI-ENGINE NOTIFICATION TEXT PARSER
 * Parses inline reply strings according to the active rating engine:
 * 1. Non-Negotiables: Binary sequence (e.g. "101 All done except workout")
 * 2. Multi-Sphere: Domain ratings (e.g. "321 Crushed coding & work sprint")
 * 3. Standard: 1-5★ digit (e.g. "5 Today was legendary")
 * 4. Freeform/Keywords: Keywords or journal chronicles
 */
export function parseNotificationReply(replyText, engineContext = null) {
  if (!replyText || typeof replyText !== 'string') return null;
  const raw = replyText.trim();
  if (!raw) return null;

  const engine = engineContext || detectActiveEngine();

  // A. Non-Negotiables: Binary pattern (e.g. "101", "1 0 1", "1,0,1")
  // Detected if engine is 'non-negotiables' OR string starts with binary characters
  const binaryMatch = raw.match(/^([01]{2,8}|(?:[01][\s,/-]){1,7}[01])(?:\s*[-:,.]?\s*(.*))?$/s);
  if ((engine === 'non-negotiables' || (!raw.match(/^[2-5]/) && binaryMatch)) && binaryMatch) {
    const binDigits = binaryMatch[1].replace(/[\s,/-]/g, '').split('');
    const remainderNote = (binaryMatch[2] || '').trim();

    let anchorList = [
      { id: 'anchor_1', utils: 2.0 },
      { id: 'anchor_2', utils: 1.5 },
      { id: 'anchor_3', utils: 1.5 }
    ];
    try {
      const savedAnchors = localStorage.getItem('daily_verdict_custom_anchor_templates');
      if (savedAnchors) {
        const parsed = JSON.parse(savedAnchors);
        if (Array.isArray(parsed) && parsed.length > 0) anchorList = parsed;
      }
    } catch (e) {}

    const checkedState = {};
    let totalUtils = 0;
    let achievedUtils = 0;
    let completedCount = 0;

    anchorList.forEach((anchor, idx) => {
      const isDone = binDigits[idx] === '1';
      checkedState[anchor.id] = isDone;
      const u = Number(anchor.utils) || 1.0;
      totalUtils += u;
      if (isDone) {
        achievedUtils += u;
        completedCount++;
      }
    });

    const calculatedScore = totalUtils > 0 ? (achievedUtils / totalUtils) * 5.0 : 0;
    const rating = Math.max(1, Math.min(5, Math.round(calculatedScore || 1)));

    return {
      type: 'non-negotiables',
      rating,
      calculatedScore: Number(calculatedScore.toFixed(1)),
      notes: remainderNote || null,
      nonNegotiables: {
        checkedState,
        completedCount,
        totalCount: anchorList.length,
        digits: binDigits.join('')
      },
      spheres: null,
      raw
    };
  }

  // B. Multi-Sphere: Sequence of digits 1-5 (e.g. "321", "453", "5 4 3", "2,3,4")
  // Detected if engine is 'spheres' OR string starts with 2 to 6 digits each in range 1-5
  const sphereMatch = raw.match(/^([1-5]{2,6}|(?:[1-5][\s,/-]){1,5}[1-5])(?:\s*[-:,.]?\s*(.*))?$/s);
  if ((engine === 'spheres' || sphereMatch) && sphereMatch) {
    const digits = sphereMatch[1].replace(/[\s,/-]/g, '').split('').map(d => parseInt(d, 10));
    const remainderNote = (sphereMatch[2] || '').trim();

    let sphereList = [
      { id: 'work_school', name: 'Work & School' },
      { id: 'home_personal', name: 'Home & Sanctuary' },
      { id: 'social_event', name: 'Social & Events' }
    ];
    try {
      const savedSpheres = localStorage.getItem('daily_verdict_spheres_config');
      if (savedSpheres) {
        const parsed = JSON.parse(savedSpheres);
        if (Array.isArray(parsed) && parsed.length > 0) {
          sphereList = parsed.filter(s => s && s.enabled !== false);
        }
      }
    } catch (e) {}

    const spheres = {};
    let sum = 0;
    let count = 0;

    digits.forEach((val, idx) => {
      const sphereObj = sphereList[idx] || { id: `sphere_${idx + 1}` };
      spheres[sphereObj.id] = { rating: val, notes: '' };
      sum += val;
      count++;
    });

    const avg = count > 0 ? sum / count : 3;
    const rating = Math.max(1, Math.min(5, Math.round(avg)));

    return {
      type: 'spheres',
      rating,
      compositeScore: Number(avg.toFixed(1)),
      notes: remainderNote || null,
      spheres,
      nonNegotiables: null,
      raw
    };
  }

  // C. Standard: 1 single rating digit 1-5 followed by optional note (e.g. "5 Finished workout")
  const numMatch = raw.match(/^([1-5])(?:\s*[-:,.]?\s*(.*))?$/s);
  if (numMatch) {
    const rating = parseInt(numMatch[1], 10);
    const notes = (numMatch[2] && numMatch[2].trim()) ? numMatch[2].trim() : null;
    return {
      type: 'standard',
      rating,
      notes,
      spheres: null,
      nonNegotiables: null,
      raw
    };
  }

  // D. Keywords fallback
  const lower = raw.toLowerCase();
  let keywordRating = null;
  let keywordNotes = null;
  if (lower.startsWith('shit') || lower.startsWith('rough') || lower.startsWith('bad') || lower.startsWith('terrible')) {
    keywordRating = 1;
    keywordNotes = raw.replace(/^(shit|rough|bad|terrible)\s*[-:,.]?\s*/i, '').trim() || null;
  } else if (lower.startsWith('down') || lower.startsWith('sad') || lower.startsWith('low')) {
    keywordRating = 2;
    keywordNotes = raw.replace(/^(down|sad|low)\s*[-:,.]?\s*/i, '').trim() || null;
  } else if (lower.startsWith('ok') || lower.startsWith('okay') || lower.startsWith('fine') || lower.startsWith('average') || lower.startsWith('meh')) {
    keywordRating = 3;
    keywordNotes = raw.replace(/^(ok|okay|fine|average|meh)\s*[-:,.]?\s*/i, '').trim() || null;
  } else if (lower.startsWith('good') || lower.startsWith('decent') || lower.startsWith('nice')) {
    keywordRating = 4;
    keywordNotes = raw.replace(/^(good|decent|nice)\s*[-:,.]?\s*/i, '').trim() || null;
  } else if (lower.startsWith('hit') || lower.startsWith('peak') || lower.startsWith('great') || lower.startsWith('awesome') || lower.startsWith('fire')) {
    keywordRating = 5;
    keywordNotes = raw.replace(/^(hit|peak|great|awesome|fire)\s*[-:,.]?\s*/i, '').trim() || null;
  }

  if (keywordRating !== null) {
    return {
      type: 'standard',
      rating: keywordRating,
      notes: keywordNotes,
      spheres: null,
      nonNegotiables: null,
      raw
    };
  }

  // E. Freeform text reflection (Sabbatical chronicle / Sanctuary check-in)
  return {
    type: engine === 'sabbatical' ? 'sabbatical' : engine === 'sanctuary' ? 'sanctuary' : 'note-only',
    rating: null,
    notes: raw,
    spheres: null,
    nonNegotiables: null,
    raw
  };
}

export const REMINDER_TIMES_KEY = 'daily_verdict_reminder_times';
export const LEGACY_REMINDER_TIME_KEY = 'daily_verdict_reminder_time';

export function getReminderTimes() {
  if (typeof window === 'undefined') return ['21:00'];
  try {
    const raw = localStorage.getItem(REMINDER_TIMES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.slice(0, 5); // Up to 5 multi-pump slots
      }
    }
    const legacy = localStorage.getItem(LEGACY_REMINDER_TIME_KEY);
    if (legacy) return [legacy];
  } catch (e) {}
  return ['21:00'];
}

export function setReminderTimes(timesList) {
  if (typeof window === 'undefined') return;
  const sanitized = Array.isArray(timesList)
    ? [...new Set(timesList.filter(t => typeof t === 'string' && /^\d{1,2}:\d{2}$/.test(t)))]
        .sort()
        .slice(0, 5)
    : ['21:00'];
  const finalTimes = sanitized.length > 0 ? sanitized : ['21:00'];
  localStorage.setItem(REMINDER_TIMES_KEY, JSON.stringify(finalTimes));
  localStorage.setItem(LEGACY_REMINDER_TIME_KEY, finalTimes[finalTimes.length - 1] || '21:00');
  scheduleLocalEveningReminder();
}

export function addReminderTime(timeStr) {
  const current = getReminderTimes();
  if (current.length >= 5) return false;
  if (!current.includes(timeStr)) {
    setReminderTimes([...current, timeStr]);
  }
  return true;
}

export function removeReminderTime(timeStr) {
  const current = getReminderTimes();
  if (current.length <= 1) return false;
  setReminderTimes(current.filter(t => t !== timeStr));
  return true;
}

export function getReminderTime() {
  if (typeof window === 'undefined') return '21:00';
  const times = getReminderTimes();
  return times[times.length - 1] || '21:00';
}

export function setReminderTime(timeStr) {
  if (typeof window !== 'undefined') {
    setReminderTimes([timeStr]);
  }
}

export function getLocalDateString(d = new Date()) {
  const dateObj = (d instanceof Date) ? d : new Date(d);
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 🛡️ INVARIANT CHECK: Is today already rated in local storage?
 */
export function isDayRated(dateStr = getLocalDateString()) {
  if (typeof window === 'undefined') return false;
  try {
    const u = localStorage.getItem('goodness_last_user_id');
    const storageKey = u ? `goodness_db_${u}` : 'goodness_db';
    const dbStr = localStorage.getItem(storageKey) || localStorage.getItem('goodness_db');
    if (dbStr) {
      const db = JSON.parse(dbStr);
      const entry = db.entries && db.entries[dateStr];
      return Boolean(entry && entry.rating && Number(entry.rating) > 0);
    }
  } catch (e) {}
  return false;
}

/**
 * 🚀 MULTI-PUMP NOTIFICATION SCHEDULER (WITH GOLDEN AUTO-SILENCE INVARIANT)
 * Supports up to 5 alarm slots per day.
 * As soon as today is recorded, all subsequent reminders for today immediately stand down!
 */
export function scheduleLocalEveningReminder() {
  if (!isNotificationEnabled()) return;

  const todayStr = getLocalDateString();

  // 🛡️ Auto-Silence Stand-Down Invariant:
  // If today already has a recorded rating, all reminders for today stand down immediately!
  if (isDayRated(todayStr)) {
    console.log(`🔕 [Notification Scheduler] Today (${todayStr}) is already rated. Multi-pump reminders stand down.`);
    if (window._dailyVerdictReminderTimer) {
      clearTimeout(window._dailyVerdictReminderTimer);
      window._dailyVerdictReminderTimer = null;
    }
    scheduleNextDayFirstSlot();
    return;
  }

  const times = getReminderTimes();
  const now = new Date();

  // Find the next upcoming slot for today
  let nextTarget = null;
  let minDiff = Infinity;

  for (const timeStr of times) {
    const [hStr, mStr] = timeStr.split(':');
    const target = new Date();
    target.setHours(parseInt(hStr, 10), parseInt(mStr, 10), 0, 0);
    const diff = target.getTime() - now.getTime();
    if (diff > 0 && diff < minDiff) {
      minDiff = diff;
      nextTarget = target;
    }
  }

  // If no remaining slots today, schedule for tomorrow's earliest slot
  if (!nextTarget) {
    scheduleNextDayFirstSlot();
    return;
  }

  if (window._dailyVerdictReminderTimer) {
    clearTimeout(window._dailyVerdictReminderTimer);
  }

  window._dailyVerdictReminderTimer = setTimeout(() => {
    // Re-verify auto-silence invariant right before firing
    if (isDayRated(todayStr)) {
      console.log(`🔕 [Notification Scheduler] Today (${todayStr}) was rated before trigger. Standing down.`);
      scheduleLocalEveningReminder();
      return;
    }

    showInstantReminderNotification(getRandomReminderText());
    scheduleLocalEveningReminder();
  }, minDiff);
}

function scheduleNextDayFirstSlot() {
  const times = getReminderTimes();
  const earliestTime = times[0] || '21:00';
  const [hStr, mStr] = earliestTime.split(':');
  const target = new Date();
  target.setDate(target.getDate() + 1);
  target.setHours(parseInt(hStr, 10), parseInt(mStr, 10), 0, 0);

  const delay = target.getTime() - new Date().getTime();
  if (window._dailyVerdictReminderTimer) {
    clearTimeout(window._dailyVerdictReminderTimer);
  }
  window._dailyVerdictReminderTimer = setTimeout(() => {
    scheduleLocalEveningReminder();
  }, Math.max(1000, delay));
}

// 🔔 Stand-Down Reactive Watchers
if (typeof window !== 'undefined' && !window._verdictReminderListenersBound) {
  window._verdictReminderListenersBound = true;
  window.addEventListener('remote_notification_verdict', () => scheduleLocalEveningReminder());
  window.addEventListener('verdict-sync-status', () => scheduleLocalEveningReminder());
  window.addEventListener('storage', (e) => {
    if (e.key && e.key.startsWith('goodness_db')) {
      scheduleLocalEveningReminder();
    }
  });
}
