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
    const rawAnchors = localStorage.getItem('daily_anchors_config');
    if (rawAnchors) {
      const aCfg = JSON.parse(rawAnchors);
      if (aCfg && aCfg.enabled) {
        return 'non-negotiables';
      }
    }
    const rawPeer = localStorage.getItem('goodness_peer_mutual_backup');
    if (rawPeer) {
      return 'peer';
    }
  } catch (e) {}
  return 'standard';
}

export function getEngineNotificationContent(engineKey = null) {
  const engine = engineKey || detectActiveEngine();
  switch (engine) {
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
        body: 'Daily non-negotiable checklist pending. Log execution score and summary notes.',
        placeholder: 'Type 1-5★ habit score & completion summary...'
      };
    case 'peer':
      return {
        title: 'PEER ACCOUNTABILITY MIRROR',
        body: 'Mutual streak shield active. Rate today to synchronize with your partner mirror.',
        placeholder: 'Type 1-5★ rating & peer note...'
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

export function getReminderTime() {
  if (typeof window === 'undefined') return '21:00';
  return localStorage.getItem('daily_verdict_reminder_time') || '21:00';
}

export function setReminderTime(timeStr) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('daily_verdict_reminder_time', timeStr || '21:00');
    scheduleLocalEveningReminder();
  }
}

export function getLocalDateString(d = new Date()) {
  const dateObj = (d instanceof Date) ? d : new Date(d);
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function scheduleLocalEveningReminder() {
  if (!isNotificationEnabled()) return;

  const timeStr = getReminderTime();
  const [hStr, mStr] = timeStr.split(':');
  const targetHour = parseInt(hStr, 10) || 21;
  const targetMinute = parseInt(mStr, 10) || 0;

  const now = new Date();
  const target = new Date();
  target.setHours(targetHour, targetMinute, 0, 0);

  let delay = target.getTime() - now.getTime();
  if (delay < 0) {
    // Already past the scheduled time today, schedule for tomorrow
    delay += 24 * 60 * 60 * 1000;
  }

  // Clear any previous timer
  if (window._dailyVerdictReminderTimer) {
    clearTimeout(window._dailyVerdictReminderTimer);
  }

  window._dailyVerdictReminderTimer = setTimeout(() => {
    // Check if today is logged
    const todayStr = getLocalDateString();
    const dbStr = localStorage.getItem('goodness_db');
    let isLoggedToday = false;
    if (dbStr) {
      try {
        const db = JSON.parse(dbStr);
        if (db.entries && db.entries[todayStr] && db.entries[todayStr].rating) {
          isLoggedToday = true;
        }
      } catch (e) { }
    }

    if (!isLoggedToday) {
      showInstantReminderNotification(getRandomReminderText());
    }

    // Schedule next day
    scheduleLocalEveningReminder();
  }, delay);
}
