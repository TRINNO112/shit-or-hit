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
  console.log('🔔 [Notification Debug] Step 1: Checking browser support...');
  if (!isNotificationSupported()) {
    console.warn('❌ [Notification Debug] Notifications are NOT supported in this browser window environment.');
    return false;
  }

  const body = customBody || getRandomReminderText();
  console.log(`🔔 [Notification Debug] Step 2: Notification Permission is currently: "${Notification.permission}"`);

  // If permission not granted yet, ask for it
  if (Notification.permission !== 'granted') {
    console.log('🔔 [Notification Debug] Requesting permission from user...');
    const perm = await requestNotificationPermission();
    console.log(`🔔 [Notification Debug] User response: ${perm ? 'GRANTED' : 'DENIED / DISMISSED'}`);
    if (!perm) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('in_app_reminder', { detail: { title: '⚡ Daily Verdict', body } }));
      }
      return false;
    }
  }

  console.log('🔔 [Notification Debug] Step 3: Triggering notification payload:', { title: '⚡ Daily Verdict', body });

  try {
    // Method A: Check for active Service Worker Registration (Most reliable for PWAs & Chrome on Windows)
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration && registration.showNotification) {
          console.log('🔔 [Notification Debug] Step 3a: Firing notification via ServiceWorkerRegistration.showNotification()');
          await registration.showNotification('⚡ Daily Verdict', {
            body,
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            vibrate: [150, 50, 150],
            tag: 'daily-verdict-reminder',
            renotify: true
          });
          console.log('✅ [Notification Debug] Step 4: ServiceWorker notification fired successfully!');
          return true;
        }
      } catch (swErr) {
        console.warn('⚠️ [Notification Debug] ServiceWorker trigger fallback:', swErr);
      }
    }

    // Method B: Standard Web Notification API
    console.log('🔔 [Notification Debug] Step 3b: Firing notification via standard new Notification() API');
    const n = new Notification('⚡ Daily Verdict', {
      body,
      icon: '/favicon.ico',
      vibrate: [150, 50, 150],
      tag: 'daily-verdict-reminder',
      requireInteraction: false
    });

    n.onshow = () => console.log('✅ [Notification Debug] Step 4: Notification displayed on screen!');
    n.onerror = (e) => console.error('❌ [Notification Debug] Notification encountered error:', e);
    n.onclick = () => {
      window.focus();
      n.close();
    };

    return true;
  } catch (err) {
    console.error('❌ [Notification Debug] Show notification failed:', err);
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
