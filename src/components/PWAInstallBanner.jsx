import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Smartphone, X, Sparkles, CheckCircle2 } from 'lucide-react';
import ShieldVoltIcon from './ShieldVoltIcon';

export default function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  const [showGuideModal, setShowGuideModal] = useState(false);

  useEffect(() => {
    // Check if already in standalone mode (already installed)
    const isStandalone = 
      window.matchMedia('(display-mode: standalone)').matches || 
      window.navigator.standalone || 
      document.referrer.includes('android-app://');
      
    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // Check if user permanently dismissed or dismissed today
    const dismissedUntil = localStorage.getItem('pwa_install_dismissed_until');
    const permanentlyDismissed = localStorage.getItem('pwa_install_dismissed_forever');
    if (permanentlyDismissed === 'true' || (dismissedUntil && Date.now() < parseInt(dismissedUntil, 10))) {
      setIsDismissed(true);
    }

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      console.log('SHIT OR HIT PWA successfully installed!');
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
      // Open clean interactive visual guide modal instead of browser alert
      setShowGuideModal(true);
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
    // Dismiss for 7 days
    localStorage.setItem('pwa_install_dismissed_until', String(Date.now() + 7 * 24 * 60 * 60 * 1000));
  };

  const handleDismissForever = () => {
    setIsDismissed(true);
    localStorage.setItem('pwa_install_dismissed_forever', 'true');
    setShowGuideModal(false);
  };

  if (isInstalled || isDismissed) return null;

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          className="w-full bg-[#FDC800] border-b-2 border-black py-2 px-3 select-none z-40 sticky top-0 shadow-[0_3px_0_#000000]"
        >
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-white border-2 border-black flex items-center justify-center p-0.5 shrink-0 shadow-[1px_1px_0px_#000000]">
                <ShieldVoltIcon className="w-full h-full" color="#FDC800" />
              </div>
              <div className="min-w-0">
                <h4 className="font-display font-black text-xs sm:text-sm text-black uppercase leading-tight truncate">
                  Install SHIT OR HIT App
                </h4>
                <p className="text-[10px] sm:text-xs font-mono text-neutral-800 font-bold truncate">
                  1-tap standalone app access & full offline storage
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
                title="Dismiss banner"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Visual Installation Guide Modal */}
      {showGuideModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
          onClick={() => setShowGuideModal(false)}
        >
          <div 
            className="w-full max-w-sm bg-white border-3 border-black rounded-3xl p-5 shadow-[8px_8px_0px_#000000] space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b-2 border-black/10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#FDC800] border-2 border-black flex items-center justify-center p-0.5">
                  <ShieldVoltIcon className="w-full h-full" color="#FDC800" />
                </div>
                <div>
                  <h3 className="font-display font-black text-base uppercase leading-tight">
                    Add To Home Screen
                  </h3>
                  <span className="text-[11px] font-mono text-neutral-600">Quick 2-Step Setup</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="p-1.5 rounded-xl bg-red-100 hover:bg-red-200 border-2 border-black text-black"
              >
                <X className="w-4 h-4 stroke-[3]" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs font-mono">
              <div className="p-3 bg-[#FFFDF5] border-2 border-black rounded-xl flex items-start gap-2.5">
                <span className="w-6 h-6 rounded-lg bg-black text-[#FDC800] font-black flex items-center justify-center shrink-0">1</span>
                <span>Tap browser menu (<strong>⋮</strong> on Android or <strong>Share ⬆</strong> on iOS Safari).</span>
              </div>
              <div className="p-3 bg-[#FFFDF5] border-2 border-black rounded-xl flex items-start gap-2.5">
                <span className="w-6 h-6 rounded-lg bg-[#00E599] text-black font-black flex items-center justify-center shrink-0">2</span>
                <span>Select <strong>"Add to Home Screen"</strong> or <strong>"Install App"</strong>.</span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 pt-2 border-t-2 border-black/10">
              <button
                type="button"
                onClick={handleDismissForever}
                className="text-[10px] font-mono text-neutral-500 hover:text-black underline cursor-pointer"
              >
                Don't show again
              </button>
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="px-4 py-1.5 bg-black text-white rounded-xl font-mono text-xs font-black uppercase cursor-pointer"
              >
                GOT IT
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
