import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Flame, X, Sparkles, Check, ChevronRight } from 'lucide-react';
import { ratingMeta } from '../services/api';
import { requestNotificationPermission, isNotificationEnabled } from '../services/notifications';

export default function ReminderBanner({ todayEntry, onQuickRate, onOpenDiary }) {
  const [dismissed, setDismissed] = useState(false);
  const [notificationsAllowed, setNotificationsAllowed] = useState(isNotificationEnabled());
  const [isEvening, setIsEvening] = useState(false);

  useEffect(() => {
    const checkTime = () => {
      const currentHour = new Date().getHours();
      // Show from 8:00 PM (20:00) to midnight if not logged
      setIsEvening(currentHour >= 20 || currentHour < 3);
    };
    checkTime();
    const interval = setInterval(checkTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const hasRatedToday = Boolean(todayEntry && todayEntry.rating);

  if (hasRatedToday || dismissed || !isEvening) {
    return null;
  }

  const handleEnableAlerts = async () => {
    const granted = await requestNotificationPermission();
    setNotificationsAllowed(granted);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className="w-full bg-[#FDC800] border-b-3 border-black text-black px-3.5 py-2.5 shadow-[0_3px_0px_#000000] relative z-40 overflow-hidden"
      >
        <div className="max-w-[1380px] mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
          
          {/* Left Message */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-black text-[#FDC800] flex items-center justify-center shrink-0 shadow-[1.5px_1.5px_0px_#000000] animate-bounce">
              <Bell className="w-4 h-4 fill-[#FDC800]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display font-black text-xs sm:text-sm uppercase tracking-tight">
                  ⏰ Bhai sun... aaj ka verdict register nahi kiya!
                </span>
              </div>
              <span className="text-[10px] sm:text-xs font-mono font-bold text-neutral-800 block">
                Raat ke 9 baje hain — 1-tap me apna score lock in karle:
              </span>
            </div>
          </div>

          {/* Quick Rate Buttons Tray */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-0.5 sm:pb-0">
            {[1, 2, 3, 4, 5].map((val) => {
              const meta = ratingMeta[val];
              return (
                <button
                  key={val}
                  type="button"
                  onClick={() => onQuickRate(val)}
                  style={{ backgroundColor: meta.bg }}
                  className="px-2.5 py-1 rounded-xl border-2 border-black font-mono text-xs font-black text-black shadow-[1.5px_1.5px_0px_#000000] hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-1 shrink-0"
                  title={meta.desc}
                >
                  <span>{val}★</span>
                  <span className="hidden sm:inline text-[10px]">{meta.title}</span>
                </button>
              );
            })}

            {/* Notification Permission Bell Toggle */}
            {!notificationsAllowed && (
              <button
                type="button"
                onClick={handleEnableAlerts}
                className="px-2 py-1 rounded-xl bg-white hover:bg-neutral-100 border-2 border-black font-mono text-[10px] font-bold text-black shadow-[1px_1px_0px_#000000] cursor-pointer whitespace-nowrap ml-1"
                title="Enable 9 PM lockscreen notifications"
              >
                🔔 Alert Me at 9 PM
              </button>
            )}

            {/* Dismiss Button */}
            <button
              type="button"
              onClick={() => setDismissed(true)}
              className="p-1 rounded-lg hover:bg-black/10 text-black cursor-pointer shrink-0 ml-auto sm:ml-1"
              title="Dismiss reminder for now"
            >
              <X className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
