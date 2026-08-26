import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Smartphone, X, Sparkles, CheckCircle2 } from 'lucide-react';

export default function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if already in standalone mode (already installed)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // Check if user previously dismissed today
    const dismissedUntil = localStorage.getItem('pwa_install_dismissed_until');
    if (dismissedUntil && Date.now() < parseInt(dismissedUntil, 10)) {
      setIsDismissed(true);
    }

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      console.log('Daily Verdict PWA successfully installed!');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // Fallback instruction for iOS Safari & browsers that don't support beforeinstallprompt
      alert('📱 To install on iOS/Android: Tap your browser Share/Menu button (⋮ or ⬆) and select "Add to Home Screen" / "Install App"!');
      return;
    }

    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } catch (err) {
      console.error('Install prompt error:', err);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    // Dismiss for 24 hours
    localStorage.setItem('pwa_install_dismissed_until', String(Date.now() + 24 * 60 * 60 * 1000));
  };

  if (isInstalled || isDismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -50, opacity: 0 }}
        className="w-full bg-[#FDC800] border-b-2 border-black py-2.5 px-3 select-none z-40 sticky top-0 shadow-[0_4px_0_#000000]"
      >
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-black text-[#FDC800] flex items-center justify-center font-mono font-black text-sm border-2 border-black shrink-0">
              ⚡
            </div>
            <div className="min-w-0">
              <h4 className="font-display font-black text-xs sm:text-sm text-black uppercase leading-tight truncate">
                Install Daily Verdict Web App
              </h4>
              <p className="text-[10px] sm:text-xs font-mono text-neutral-800 font-bold truncate">
                Get 1-tap home screen access, offline storage & push reminders
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleInstallClick}
              className="px-3 py-1.5 bg-black hover:bg-neutral-800 text-white rounded-xl font-display font-black text-xs uppercase border-2 border-black shadow-[2px_2px_0px_#000000] cursor-pointer flex items-center gap-1.5 transition-all active:scale-95"
            >
              <Download className="w-3.5 h-3.5 text-[#00E599] stroke-[3]" />
              <span>INSTALL</span>
            </button>
            <button
              type="button"
              onClick={handleDismiss}
              className="p-1.5 rounded-xl hover:bg-black/10 text-black cursor-pointer transition-all"
              title="Dismiss for today"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
