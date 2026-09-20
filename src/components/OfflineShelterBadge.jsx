import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, WifiOff, CloudLightning } from 'lucide-react';

export default function OfflineShelterBadge() {
  const [isOnline, setIsOnline] = useState(() => (typeof navigator !== 'undefined' ? navigator.onLine : true));
  const [storageVerified, setStorageVerified] = useState(true);
  const [justReconnected, setJustReconnected] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const verifyStorage = () => {
      try {
        const probeKey = '__shit_or_hit_storage_probe__';
        localStorage.setItem(probeKey, Date.now().toString());
        const readBack = localStorage.getItem(probeKey);
        localStorage.removeItem(probeKey);
        return Boolean(readBack);
      } catch (e) {
        return false;
      }
    };

    let autoDismissTimer;

    const handleOnline = () => {
      setIsOnline(true);
      setJustReconnected(true);
      setIsDismissed(false);

      // Auto-check for fresh PWA service worker updates when internet returns
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.ready
          .then((registration) => registration.update())
          .catch(() => {});
      }

      const timer = setTimeout(() => {
        setJustReconnected(false);
      }, 3500);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setIsDismissed(false);
      const isVerified = verifyStorage();
      setStorageVerified(isVerified);

      // Auto-dismiss after 6 seconds so it doesn't linger and block the mobile screen
      clearTimeout(autoDismissTimer);
      autoDismissTimer = setTimeout(() => {
        setIsDismissed(true);
      }, 6000);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    if (!navigator.onLine) {
      handleOffline();
    }

    return () => {
      clearTimeout(autoDismissTimer);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <AnimatePresence>
      {!isOnline && !isDismissed && (
        <motion.div
          key="offline-shelter"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ type: 'spring', stiffness: 450, damping: 25 }}
          className="fixed top-2 left-1/2 -translate-x-1/2 z-60 w-[92%] max-w-lg pointer-events-none"
        >
          <div className="bg-[#FFFDF5] border-3 border-black p-2.5 rounded-2xl shadow-[4px_4px_0px_#000000] flex items-center justify-between gap-2.5 pointer-events-auto">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className="w-8 h-8 rounded-xl bg-[#FDC800] border-2 border-black flex items-center justify-center shrink-0 shadow-[1px_1px_0px_#000000]">
                <WifiOff className="w-4 h-4 text-black stroke-[2.5]" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-display font-black text-xs uppercase text-black">
                    Airplane Shelter Active
                  </span>
                  <span className="px-1.5 py-0.2 bg-[#00E599] border border-black rounded text-[9px] font-mono font-black uppercase text-black">
                    {storageVerified ? 'VERIFIED' : 'LOCAL'}
                  </span>
                </div>
                <p className="text-[10px] font-mono text-neutral-600 truncate">
                  {storageVerified 
                    ? 'All diary notes & ratings save instantly to device memory.' 
                    : 'Saving locally on device.'}
                </p>
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-1.5">
              <div className="hidden sm:flex items-center gap-1 text-[10px] font-mono font-black bg-neutral-100 border-1.5 border-black px-2 py-1 rounded-lg">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
                <span>0ms LAG</span>
              </div>
              <button
                type="button"
                onClick={() => setIsDismissed(true)}
                className="px-2.5 py-1 bg-black text-white hover:bg-neutral-800 border-2 border-black rounded-lg font-mono text-[10px] font-black uppercase shadow-[1px_1px_0px_#000000] cursor-pointer active:translate-x-px active:translate-y-px"
                title="Dismiss notification"
              >
                OK
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {justReconnected && (
        <motion.div
          key="reconnected-banner"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ type: 'spring', stiffness: 450, damping: 25 }}
          className="fixed top-2 left-1/2 -translate-x-1/2 z-60 w-[92%] max-w-lg pointer-events-none"
        >
          <div className="bg-[#00E599] border-3 border-black p-2.5 rounded-2xl shadow-[4px_4px_0px_#000000] flex items-center justify-between gap-3 pointer-events-auto">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-black border-2 border-black flex items-center justify-center shrink-0">
                <CloudLightning className="w-4 h-4 text-[#FDC800] stroke-[2.5]" />
              </div>
              <div className="min-w-0">
                <span className="font-display font-black text-xs uppercase text-black block truncate">
                  Network Reconnected • Cloud Sync Armed
                </span>
                <p className="text-[10px] font-mono text-neutral-900 truncate">
                  Background sync armed. Checking for latest updates...
                </p>
              </div>
            </div>

            <span className="px-2 py-1 bg-black text-white text-[9px] font-mono font-black uppercase rounded-lg border border-black shrink-0">
              ONLINE
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
