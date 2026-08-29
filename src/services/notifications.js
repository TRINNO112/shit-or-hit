// Smart Brotherly Notification & Reminder Engine (Zero-PII)

const HINGLISH_REMINDERS = [
  "Bhai karle aaj register! Din kaisa tha?",
  "⏰ 9 PM ho gaye bhai! Aaj ka verdict lock in karle.",
  "Bhai sun... diary entry bachi hai! 1-tap rating de de.",
  "⚡ Aaj Hit tha ya Miss? Register karle mere bhai!",
  "Bhai 2 minute nikal ke aaj ka verdict note karle."
];

export function getRandomReminderText() {
  const idx = Math.floor(Math.random() * HINGLISH_REMINDERS.length);
  return HINGLISH_REMINDERS[idx];
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

export async function showInstantReminderNotification(customBody = null) {
  if (!isNotificationSupported()) return false;

  const body = customBody || getRandomReminderText();

  // If permission not granted yet, ask for it
  if (Notification.permission !== 'granted') {
    const perm = await requestNotificationPermission();
    if (!perm) {
      // Fallback: emit custom in-app visual banner event
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('in_app_reminder', { detail: { title: '⚡ Daily Verdict', body } }));
      }
      return false;
    }
  }

  try {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'TRIGGER_NOTIFICATION',
        title: '⚡ Daily Verdict',
        body
      });
    } else {
      const n = new Notification('⚡ Daily Verdict', {
        body,
        icon: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%23000%22 stroke-width=%222%22><polygon points=%2213 2 3 14 12 14 11 22 21 10 12 10 13 2%22 fill=%22%23FDC800%22/></svg>',
        vibrate: [100, 50, 100],
        requireInteraction: false
      });
      if (n) {
        n.onclick = () => {
          window.focus();
          n.close();
        };
      }
    }
    return true;
  } catch (err) {
    console.error('Show notification failed:', err);
    // Fallback: emit custom in-app visual banner event
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('in_app_reminder', { detail: { title: '⚡ Daily Verdict', body } }));
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
    const todayStr = new Date().toISOString().slice(0, 10);
    const dbStr = localStorage.getItem('goodness_db');
    let isLoggedToday = false;
    if (dbStr) {
      try {
        const db = JSON.parse(dbStr);
        if (db.entries && db.entries[todayStr] && db.entries[todayStr].rating) {
          isLoggedToday = true;
        }
      } catch (e) {}
    }

    if (!isLoggedToday) {
      showInstantReminderNotification(getRandomReminderText());
    }

    // Schedule next day
    scheduleLocalEveningReminder();
  }, delay);
}
