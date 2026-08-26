import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Sparkles, CheckCircle2 } from 'lucide-react';
import { 
  isNotificationSupported, 
  isNotificationEnabled, 
  requestNotificationPermission 
} from '../services/notifications';

export default function NotificationOptInModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Only prompt if notifications are supported and user has not made a decision yet
    const decision = localStorage.getItem('daily_verdict_notif_prompt_seen');
    if (!decision && isNotificationSupported() && !isNotificationEnabled()) {
      // Delay prompt slightly so it feels natural
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleEnable = async () => {
    localStorage.setItem('daily_verdict_notif_prompt_seen', 'true');
    await requestNotificationPermission();
    setIsOpen(false);
  };

  const handleDismiss = () => {
    localStorage.setItem('daily_verdict_notif_prompt_seen', 'true');
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 select-none"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="w-full max-w-sm bg-[#FFFDF5] rounded-3xl border-3 border-black p-5 sm:p-6 shadow-[6px_6px_0px_#000000] text-center space-y-4"
        >
          {/* Bell Icon */}
          <div className="w-12 h-12 rounded-2xl bg-[#FDC800] border-2 border-black flex items-center justify-center mx-auto shadow-[3px_3px_0px_#000000]">
            <Bell className="w-6 h-6 text-black stroke-[2.5]" />
          </div>

          <div className="space-y-1.5">
            <h3 className="font-display font-black text-lg uppercase text-black">
              Daily 9:00 PM Reminders?
            </h3>
            <p className="text-xs font-mono text-neutral-600 leading-relaxed">
              Get a smart 1-tap reminder every night so you never forget to log your verdict and protect your streak.
            </p>
          </div>

          <div className="space-y-2 pt-1">
            <button
              type="button"
              onClick={handleEnable}
              className="w-full py-3 bg-[#00E599] hover:bg-emerald-400 text-black font-display font-black text-xs uppercase rounded-xl border-2 border-black shadow-[2.5px_2.5px_0px_#000000] cursor-pointer active:scale-95 transition-all"
            >
              ✅ TURN ON 9 PM REMINDERS
            </button>

            <button
              type="button"
              onClick={handleDismiss}
              className="w-full py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-600 font-mono font-bold text-xs uppercase rounded-xl border border-black/30 cursor-pointer"
            >
              Maybe Later
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
