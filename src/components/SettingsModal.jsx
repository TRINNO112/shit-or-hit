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
  Info
} from 'lucide-react';
import { 
  isNotificationSupported, 
  isNotificationEnabled, 
  requestNotificationPermission, 
  disableNotifications 
} from '../services/notifications';

export default function SettingsModal({
  isOpen,
  onClose,
  user
}) {
  const [notificationsOn, setNotificationsOn] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      setNotificationsOn(isNotificationEnabled());
      setNotificationMsg('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleToggleNotifications = async () => {
    if (notificationsOn) {
      disableNotifications();
      setNotificationsOn(false);
      setNotificationMsg('9:00 PM reminders disabled.');
    } else {
      const granted = await requestNotificationPermission();
      if (granted) {
        setNotificationsOn(true);
        setNotificationMsg('✅ 9:00 PM brotherly reminders activated!');
      } else {
        setNotificationMsg('⚠️ Permission denied. Please enable notifications in your browser settings.');
      }
    }
  };

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
          className="w-full max-w-md bg-[#FFFDF5] rounded-3xl border-3 border-black p-6 shadow-[6px_6px_0px_#000000] space-y-5"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
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
                  Preferences & Notification Hub
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-neutral-200 border-2 border-transparent hover:border-black cursor-pointer transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Settings List */}
          <div className="space-y-4">
            
            {/* 1. Daily 9:00 PM Reminder Toggle */}
            <div className="bg-white border-2 border-black rounded-2xl p-4 shadow-[3px_3px_0px_#000000] space-y-3">
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
                      9:00 PM Daily Reminder
                    </h4>
                    <p className="text-[11px] font-mono text-neutral-600">
                      Brotherly prompt if today's log is empty
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

              {notificationMsg && (
                <div className="p-2 bg-neutral-100 border border-black/20 rounded-xl text-[11px] font-mono font-bold text-neutral-800">
                  {notificationMsg}
                </div>
              )}
            </div>

            {/* 2. Cloud Sync Profile */}
            <div className="bg-white border-2 border-black rounded-2xl p-4 shadow-[3px_3px_0px_#000000] flex items-center justify-between gap-3">
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
            <div className="bg-white border-2 border-black rounded-2xl p-4 shadow-[3px_3px_0px_#000000] flex items-center justify-between gap-3">
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
