import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings, 
  X, 
  Bell, 
  BellOff, 
  Cloud, 
  Smartphone, 
  Check, 
  Sparkles, 
  ShieldCheck,
  Moon,
  Info,
  Clock
} from 'lucide-react';
import { 
  isNotificationSupported, 
  isNotificationEnabled, 
  requestNotificationPermission, 
  disableNotifications,
  getReminderTime,
  setReminderTime
} from '../services/notifications';

export default function SettingsModal({
  isOpen,
  onClose,
  user
}) {
  const [notificationsOn, setNotificationsOn] = useState(false);
  const [reminderTimeVal, setReminderTimeVal] = useState('21:00');
  const [notificationMsg, setNotificationMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      setNotificationsOn(isNotificationEnabled());
      setReminderTimeVal(getReminderTime());
      setNotificationMsg('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleToggleNotifications = async () => {
    if (notificationsOn) {
      disableNotifications();
      setNotificationsOn(false);
      setNotificationMsg('Daily reminders disabled.');
    } else {
      const granted = await requestNotificationPermission();
      if (granted) {
        setNotificationsOn(true);
        setNotificationMsg(`✅ Daily reminders active for ${reminderTimeVal}!`);
      } else {
        setNotificationMsg('⚠️ Permission denied. Please enable notifications in your browser settings.');
      }
    }
  };

  const handleTimeChange = (newTime) => {
    setReminderTimeVal(newTime);
    setReminderTime(newTime);
    if (notificationsOn) {
      setNotificationMsg(`⏰ Reminder time updated to ${newTime}`);
    }
  };

  const timePresets = [
    { label: '8:00 PM', value: '20:00' },
    { label: '9:00 PM', value: '21:00' },
    { label: '10:00 PM', value: '22:00' },
    { label: '11:00 PM', value: '23:00' }
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.94, y: 15 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.94, y: 15 }}
          className="w-full max-w-md bg-[#FFFDF5] rounded-3xl border-3 border-black p-5 sm:p-6 shadow-[6px_6px_0px_#000000] space-y-4 max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header with High-Contrast Desktop & Mobile Close ✕ Button */}
          <div className="flex items-center justify-between border-b-2 border-black/10 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-[#FDC800] border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_#000000]">
                <Settings className="w-5 h-5 text-black stroke-[2.5]" />
              </div>
              <div>
                <h3 className="font-display font-black text-lg uppercase leading-none">
                  App Settings
                </h3>
                <span className="text-xs font-mono text-neutral-600">
                  Preferences & Clock Reminders
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-white hover:bg-neutral-200 border-2 border-black cursor-pointer shadow-[1.5px_1.5px_0px_#000000] active:scale-95 transition-all"
              title="Close Settings"
            >
              <X className="w-5 h-5 text-black stroke-[2.5]" />
            </button>
          </div>

          {/* Settings List */}
          <div className="space-y-3.5">
            
            {/* 1. Daily Reminder & Clock Setting */}
            <div className="bg-white border-2 border-black rounded-2xl p-4 shadow-[3px_3px_0px_#000000] space-y-3.5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-neutral-100 border-2 border-black flex items-center justify-center">
                    {notificationsOn ? (
                      <Bell className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
                    ) : (
                      <BellOff className="w-4 h-4 text-neutral-500" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-display font-black text-sm uppercase">
                      Daily Streak Reminder
                    </h4>
                    <p className="text-[11px] font-mono text-neutral-600">
                      Evening alert if today's log is empty
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleToggleNotifications}
                  className={`px-3 py-1.5 rounded-xl border-2 border-black font-mono text-xs font-black cursor-pointer transition-all shadow-[1.5px_1.5px_0px_#000000] active:scale-95 ${
                    notificationsOn 
                      ? 'bg-[#00E599] text-black' 
                      : 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300'
                  }`}
                >
                  {notificationsOn ? 'ACTIVE' : 'OFF'}
                </button>
              </div>

              {/* ⏰ Interactive Clock Time Selector */}
              <div className="pt-2 border-t border-black/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-neutral-700 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-black stroke-[2.5]" />
                    <span>REMINDER TIME</span>
                  </span>
                  <input
                    type="time"
                    value={reminderTimeVal}
                    onChange={(e) => handleTimeChange(e.target.value)}
                    className="bg-neutral-100 border-2 border-black rounded-xl px-2.5 py-1 font-mono text-xs font-black text-black shadow-[1.5px_1.5px_0px_#000000] cursor-pointer focus:outline-none"
                  />
                </div>

                {/* Quick-Pick Time Chips */}
                <div className="grid grid-cols-4 gap-1.5 pt-1">
                  {timePresets.map((preset) => (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() => handleTimeChange(preset.value)}
                      className={`py-1 rounded-xl border border-black font-mono text-[10px] font-black cursor-pointer transition-all ${
                        reminderTimeVal === preset.value
                          ? 'bg-[#FDC800] text-black shadow-[1.5px_1.5px_0px_#000000] border-2 border-black'
                          : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-600'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {notificationMsg && (
                <div className="p-2 bg-neutral-100 border border-black/20 rounded-xl text-[11px] font-mono font-bold text-neutral-800">
                  {notificationMsg}
                </div>
              )}
            </div>

            {/* 2. Cloud Sync Profile */}
            <div className="bg-white border-2 border-black rounded-2xl p-3.5 shadow-[3px_3px_0px_#000000] flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-neutral-100 border-2 border-black flex items-center justify-center">
                  <Cloud className="w-4 h-4 text-blue-600 stroke-[2.5]" />
                </div>
                <div>
                  <h4 className="font-display font-black text-sm uppercase">
                    Cloud Sync
                  </h4>
                  <p className="text-[11px] font-mono text-neutral-600">
                    {user ? `Connected as ${user.email?.split('@')[0]}` : 'Offline Local Storage'}
                  </p>
                </div>
              </div>
              <span className={`px-2.5 py-1 rounded-xl border-2 border-black font-mono text-[10px] font-black ${
                user ? 'bg-[#00E599] text-black' : 'bg-neutral-200 text-neutral-600'
              }`}>
                {user ? 'SYNCED' : 'LOCAL'}
              </span>
            </div>

            {/* 3. PWA Status */}
            <div className="bg-white border-2 border-black rounded-2xl p-3.5 shadow-[3px_3px_0px_#000000] flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-neutral-100 border-2 border-black flex items-center justify-center">
                  <Smartphone className="w-4 h-4 text-purple-600 stroke-[2.5]" />
                </div>
                <div>
                  <h4 className="font-display font-black text-sm uppercase">
                    PWA App Mode
                  </h4>
                  <p className="text-[11px] font-mono text-neutral-600">
                    Android & iOS Standalone Ready
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-xl border-2 border-black bg-[#FDC800] text-black font-mono text-[10px] font-black">
                PWA v1.0
              </span>
            </div>

          </div>

          {/* Footer */}
          <div className="pt-2 border-t-2 border-black/10 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-6 bg-black text-white hover:bg-neutral-800 font-display font-black text-xs uppercase rounded-xl border-2 border-black shadow-[2px_2px_0px_#000000] cursor-pointer"
            >
              DONE
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
