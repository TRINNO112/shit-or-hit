import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldAlert, 
  ShieldCheck,
  HardDrive, 
  KeyRound, 
  Sparkles, 
  LogIn, 
  Check, 
  X, 
  AlertTriangle,
  Download,
  Info,
  Trash2,
  Lock,
  Cpu,
  Layers,
  Radio
} from 'lucide-react';
import { soundEngine } from '../services/soundEngine';
import { 
  GUEST_DISCLAIMER_KEY, 
  GUEST_DISCLAIMER_TTL_MS, 
  isGuestDisclaimerDismissed, 
  setGuestDisclaimerDismissed 
} from '../services/api';
import { 
  getStorageStatus, 
  requestPersistentStorage 
} from '../services/storageManager';

export { 
  GUEST_DISCLAIMER_KEY, 
  GUEST_DISCLAIMER_TTL_MS, 
  isGuestDisclaimerDismissed, 
  setGuestDisclaimerDismissed 
};

export default function GuestDisclaimerModal({ isOpen, onClose, onLogin }) {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [authError, setAuthError] = useState('');
  const [toast, setToast] = useState(null);
  const [storageState, setStorageState] = useState({
    supported: false,
    persisted: false,
    usageKb: 0,
    quotaMb: 0
  });
  const [isPersisting, setIsPersisting] = useState(false);
  const [persistFeedback, setPersistFeedback] = useState('');

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4500);
  };

  useEffect(() => {
    if (isOpen) {
      getStorageStatus().then(status => {
        setStorageState(status);
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDismiss = () => {
    soundEngine.playClick();
    setGuestDisclaimerDismissed();
    onClose();
  };

  const handleRequestPersistence = async () => {
    soundEngine.playClick();
    setIsPersisting(true);
    setPersistFeedback('');
    try {
      const res = await requestPersistentStorage();
      setStorageState({
        supported: res.supported,
        persisted: res.persisted,
        usageKb: res.usageKb || storageState.usageKb,
        quotaMb: res.quotaMb || storageState.quotaMb
      });
      setPersistFeedback(res.message);
      if (res.persisted) {
        soundEngine.playSuccessChime();
        showToast('Persistent Storage Granted! Your device will not auto-evict this diary.', 'success');
      } else {
        showToast('Storage lock deferred by browser. Installing as PWA will lock persistence.', 'warning');
      }
    } catch (err) {
      console.warn('Storage persistence request error:', err);
      showToast('Could not query storage persistence on this browser.', 'error');
    } finally {
      setIsPersisting(false);
    }
  };

  const handleGoogleLogin = async () => {
    soundEngine.playClick();
    setAuthError('');
    setIsLoggingIn(true);
    showToast('Connecting to Google Authentication...', 'info');
    try {
      if (onLogin) {
        await onLogin();
      }
      soundEngine.playSuccessChime();
      showToast('Authentication Successful! Cloud Sync Active.', 'success');
      setTimeout(() => onClose(), 800);
    } catch (err) {
      console.error('Login from Guest Disclaimer failed:', err);
      const friendlyMsg = err?.code === 'auth/popup-closed-by-user'
        ? 'Sign-in window was closed. Your local diary remains safe on this device.'
        : (err.message || 'Google Authentication failed. Your local guest mode is still active.');
      setAuthError(friendlyMsg);
      soundEngine.playRoughTone();
      showToast('Sign-In Cancelled or Interrupted. Local mode remains 100% active.', 'error');
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-100 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md select-none overflow-y-auto"
        onClick={handleDismiss}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.93, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.93, y: 20 }}
          transition={{ type: 'spring', stiffness: 350, damping: 28 }}
          className="bg-[#FFFDF8] border-3 border-black rounded-3xl p-5 sm:p-7 max-w-2xl w-full shadow-[8px_8px_0px_#000000] relative space-y-4 text-black my-auto max-h-[92vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Right Close Button */}
          <button
            type="button"
            onClick={handleDismiss}
            className="absolute top-3.5 right-3.5 w-8 h-8 rounded-xl bg-neutral-100 hover:bg-neutral-200 border-2 border-black flex items-center justify-center text-black cursor-pointer shadow-[1.5px_1.5px_0px_#000000] active:scale-90 transition-all z-10"
            title="Dismiss for 7 days"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>

          {/* Header Banner & Status Badge */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-[#FF4D4D] text-white border-2 border-black font-mono text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_#000000] inline-flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 stroke-[2.5]" />
                DATA ARCHITECTURE & SAFETY
              </span>
              <span className="px-2 py-0.5 rounded-md bg-[#FF4D4D] text-white border border-black font-mono text-[10px] font-black uppercase shadow-[1px_1px_0px_#000000]">
                STATUS: NOT WHITELISTED
              </span>
              {storageState.persisted ? (
                <span className="px-2 py-0.5 rounded-md bg-[#00E599] text-black border border-black font-mono text-[10px] font-black uppercase shadow-[1px_1px_0px_#000000] inline-flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 stroke-[2.5]" />
                  PERSISTENT STORAGE: ACTIVE
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-md bg-neutral-200 text-neutral-800 border border-black font-mono text-[10px] font-black uppercase shadow-[1px_1px_0px_#000000]">
                  STORAGE: LOCAL BEST-EFFORT
                </span>
              )}
            </div>

            <div className="flex items-start gap-3 pt-1">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#FFF5C2] border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_#000000] shrink-0">
                <ShieldAlert className="w-6 h-6 text-black stroke-[2.5]" />
              </div>
              <div>
                <h3 className="font-display font-black text-lg sm:text-xl uppercase tracking-tight text-black leading-tight">
                  Guest Mode & Data Sovereignty Notice
                </h3>
                <p className="text-[11px] font-mono font-bold text-neutral-600 mt-0.5">
                  100% on-device privacy • Zero server harvesting • What is implemented in code
                </p>
              </div>
            </div>
          </div>

          {/* 🚨 PROMINENT TOP ALERT: WHITELIST RESTRICTION & LOCAL STORAGE REALITY */}
          <div className="p-4 rounded-2xl bg-[#FFF5C2] border-3 border-black shadow-[4px_4px_0px_#000000] space-y-2.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#FF4D4D] border-2 border-black flex items-center justify-center text-white shrink-0 shadow-[1px_1px_0px_#000000]">
                <ShieldAlert className="w-4 h-4 stroke-[2.5]" />
              </div>
              <span className="font-mono text-xs font-black uppercase tracking-wider text-black">
                IMPORTANT: YOU ARE CURRENTLY NOT A WHITELISTED USER
              </span>
            </div>
            
            <div className="space-y-2 font-mono text-xs text-neutral-900 font-bold leading-relaxed">
              <div className="p-2 bg-white/80 rounded-xl border border-black/20">
                <span className="underline decoration-2 decoration-red-500 font-black text-black block mb-0.5">
                  1. ALL YOUR DATA IS STORED ONLY ON THIS DEVICE
                </span>
                Because your account is not whitelisted, 100% of your diary entries, ratings, and habit checks are saved exclusively in your local browser sandbox (<code className="bg-amber-200 px-1 py-0.5 rounded border border-black/30 font-black text-[11px]">localStorage</code>). No cloud backup exists for your account.
              </div>

              <div className="p-2 bg-white/80 rounded-xl border border-black/20">
                <span className="underline decoration-2 decoration-amber-500 font-black text-black block mb-0.5">
                  2. LOGGING IN DOES NOT AUTOMATICALLY WHITELIST YOU
                </span>
                Even if you sign in with your Google account, you will still NOT be whitelisted. Standard users remain strictly in local storage mode after logging in.
              </div>

              <div className="p-2 bg-white/80 rounded-xl border border-black/20">
                <span className="underline decoration-2 decoration-emerald-600 font-black text-black block mb-0.5">
                  3. HOW TO BECOME A WHITELISTED USER
                </span>
                Cloud synchronization and AI Ghostwriting incur continuous real-time API and server costs. To become a whitelisted user, you must <strong>contact and message the developer directly</strong>. The developer will review your request, explain the operational constraints, and manually whitelist your account email.
              </div>

              <div className="p-2 bg-red-100 rounded-xl border border-red-400 text-red-950">
                <span className="font-black uppercase block mb-0.5">
                  4. ZERO BACKDOOR RECOVERY
                </span>
                If you clear your browser cache/cookies or use incognito, your local diary will be permanently wiped. There is no backdoor to recover deleted local data.
              </div>
            </div>
          </div>

          {/* Core Disclosures Cards */}
          <div className="space-y-3">
            {/* 1. Local Browser Storage */}
            <div className="p-3.5 rounded-2xl bg-[#FFF9E6] border-2 border-black shadow-[2px_2px_0px_#000000] space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-[#FDC800] border border-black flex items-center justify-center shadow-[1px_1px_0px_#000000] shrink-0">
                  <HardDrive className="w-3.5 h-3.5 text-black stroke-[2.5]" />
                </div>
                <span className="font-mono text-[11px] font-black uppercase tracking-wider text-amber-950">
                  1. 100% On-Device Storage (Zero-Surveillance)
                </span>
              </div>
              <p className="font-mono text-xs text-neutral-900 font-bold leading-relaxed pl-8">
                Daily Verdict is built local-first. All your daily ratings, habit checkmarks, mood reflections, and notes are saved directly into your device's browser sandbox (<code className="bg-amber-200/80 px-1 py-0.5 rounded font-black">localStorage</code>). We do NOT transmit, monetize, or harvest your personal reflections.
              </p>
            </div>

            {/* 2. Persistent Storage Controls */}
            <div className="p-3.5 rounded-2xl bg-neutral-50 border-2 border-black shadow-[2px_2px_0px_#000000] space-y-2">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-black border border-black flex items-center justify-center shadow-[1px_1px_0px_#000000] shrink-0">
                    <Lock className="w-3.5 h-3.5 text-white stroke-[2.5]" />
                  </div>
                  <span className="font-mono text-[11px] font-black uppercase tracking-wider text-neutral-900">
                    2. Device Persistence & Eviction Shield
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleRequestPersistence}
                  disabled={isPersisting || storageState.persisted}
                  className={`px-2.5 py-1 rounded-lg border-2 border-black font-mono text-[10px] font-black uppercase shadow-[1.5px_1.5px_0px_#000000] cursor-pointer transition-all active:translate-x-px active:translate-y-px ${
                    storageState.persisted 
                      ? 'bg-[#00E599] text-black cursor-default' 
                      : 'bg-[#FDC800] hover:bg-amber-300 text-black'
                  }`}
                >
                  {isPersisting ? 'Checking...' : storageState.persisted ? 'Protection Granted' : 'Lock Persistent Storage'}
                </button>
              </div>
              <p className="font-mono text-xs text-neutral-800 font-medium leading-relaxed pl-8">
                {storageState.persisted ? (
                  <span className="text-emerald-950 font-bold">
                    This browser has granted persistent disk protection. Your data will not be evicted during low disk space.
                  </span>
                ) : (
                  <span>
                    By default, browsers treat web storage as temporary. Tap <strong>Lock Persistent Storage</strong> to instruct Chrome, Safari, or Edge to protect your database from automated OS disk cleanups.
                  </span>
                )}
                {storageState.quotaMb > 0 && (
                  <span className="block mt-1 text-[10px] font-mono text-neutral-500 font-bold">
                    Device Quota: {storageState.usageKb} KB used of ~{storageState.quotaMb} MB available
                  </span>
                )}
              </p>
              {persistFeedback && (
                <div className="ml-8 p-2 rounded-lg bg-neutral-200 border border-black font-mono text-[10px] font-bold text-black">
                  {persistFeedback}
                </div>
              )}
            </div>

            {/* 3. Cache Erasure & Incognito Hazard */}
            <div className="p-3.5 rounded-2xl bg-red-50 border-2 border-[#FF4D4D] shadow-[2px_2px_0px_#000000] space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-[#FF4D4D] border border-black flex items-center justify-center shadow-[1px_1px_0px_#000000] shrink-0">
                  <Trash2 className="w-3.5 h-3.5 text-white stroke-[2.5]" />
                </div>
                <span className="font-mono text-[11px] font-black uppercase tracking-wider text-red-950">
                  3. Critical Risk: Cache Clearing & Incognito
                </span>
              </div>
              <p className="font-mono text-xs text-red-950 font-bold leading-relaxed pl-8">
                Clearing your browser's "Cookies & Site Data", or using Private / Incognito browsing, will <strong>immediately and permanently wipe your records</strong>. Because guest accounts have zero cloud syncing, deleted local data cannot be recovered by anyone.
              </p>
            </div>

            {/* 4. Two-Tier Access Matrix */}
            <div className="p-3.5 rounded-2xl bg-[#F0FDF4] border-2 border-emerald-600 shadow-[2px_2px_0px_#000000] space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-[#00E599] border border-black flex items-center justify-center shadow-[1px_1px_0px_#000000] shrink-0">
                  <Sparkles className="w-3.5 h-3.5 text-black stroke-[2.5]" />
                </div>
                <span className="font-mono text-[11px] font-black uppercase tracking-wider text-emerald-950">
                  4. Two-Tier Architecture (Why AI & Cloud are Gated)
                </span>
              </div>
              <div className="pl-8 space-y-1.5 font-mono text-xs text-emerald-950">
                <p className="font-bold leading-relaxed">
                  You have 100% full access to: Daily Ratings, Habit Anchors, Multi-Sphere Matrix, Autopsy Chamber, Ransom Capsules, Sanctuary Pause, 4K Wallpapers, AES-256 PIN Vault, and JSON/CSV Exports.
                </p>
                <p className="text-[11px] text-neutral-700 font-medium leading-relaxed bg-white/70 p-2 rounded-lg border border-emerald-300">
                  <strong>Why are Cloud Sync & AI Ghostwriting gated?</strong> Google Gemini and Firebase incur live API costs per query. To keep Daily Verdict free without subscription paywalls or ads, cloud sync and AI endpoints are reserved for whitelisted developer accounts.
                </p>
              </div>
            </div>

            {/* 5. Export Studio & Ownership */}
            <div className="p-3.5 rounded-2xl bg-[#EEF2FF] border-2 border-indigo-600 shadow-[2px_2px_0px_#000000] space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-indigo-500 border border-black flex items-center justify-center shadow-[1px_1px_0px_#000000] shrink-0">
                  <Download className="w-3.5 h-3.5 text-white stroke-[2.5]" />
                </div>
                <span className="font-mono text-[11px] font-black uppercase tracking-wider text-indigo-950">
                  5. Data Safety: Export Studio & Physical Backups
                </span>
              </div>
              <p className="font-mono text-xs text-indigo-950 font-bold leading-relaxed pl-8">
                Protect your streak: open <span className="underline font-black">Settings → Export Studio</span> anytime to download your complete diary and habit history as JSON or CSV files. Daily Verdict is an accountability and mindfulness journal, not medical or psychiatric advice.
              </p>
              <div className="pl-8 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    if (window.__openP2PSync) window.__openP2PSync();
                    onClose();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-neutral-100 border-2 border-black font-mono text-[10px] font-black uppercase shadow-[2px_2px_0px_#000000] cursor-pointer inline-flex items-center gap-1.5 active:translate-x-px active:translate-y-px transition-all"
                >
                  <Radio className="w-3.5 h-3.5 stroke-[2.5] text-indigo-700 animate-pulse" />
                  <span>Beam To Nearby Device (WebRTC Direct)</span>
                </button>
              </div>
            </div>
          </div>

          {/* ⚡ Live UX Feedback Toast HUD */}
          <AnimatePresence>
            {toast && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.96 }}
                className={`p-3 rounded-2xl border-2 border-black shadow-[3px_3px_0px_#000000] font-mono text-xs font-black flex items-center gap-2.5 transition-all ${
                  toast.type === 'success' 
                    ? 'bg-[#00E599] text-black' 
                    : toast.type === 'error'
                    ? 'bg-[#FF4D4D] text-white'
                    : toast.type === 'warning'
                    ? 'bg-[#FDC800] text-black'
                    : 'bg-[#EEF2FF] text-indigo-950'
                }`}
              >
                {toast.type === 'success' && <ShieldCheck className="w-4 h-4 shrink-0 stroke-[2.5]" />}
                {toast.type === 'error' && <Trash2 className="w-4 h-4 shrink-0 stroke-[2.5]" />}
                {toast.type === 'warning' && <AlertTriangle className="w-4 h-4 shrink-0 stroke-[2.5]" />}
                {toast.type === 'info' && <Info className="w-4 h-4 shrink-0 stroke-[2.5]" />}
                <span>{toast.message}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Optional Error Alert if Auth Fails */}
          {authError && (
            <div className="p-3.5 rounded-2xl bg-red-100 border-2 border-red-500 font-mono text-xs text-red-950 font-bold space-y-1 shadow-[2px_2px_0px_#000000]">
              <div className="flex items-center gap-1.5 text-red-900 font-black uppercase text-[10px]">
                <AlertTriangle className="w-3.5 h-3.5 stroke-[2.5]" />
                SIGN-IN FEEDBACK
              </div>
              <p>{authError}</p>
              <p className="text-[11px] text-neutral-700 font-medium">
                Tip: You do not need to sign in. Local guest mode works completely without an account.
              </p>
            </div>
          )}

          {/* Friendly UX Educational Tip */}
          <div className="p-2.5 rounded-xl bg-amber-100/60 border border-amber-300 font-mono text-[11px] text-neutral-800 flex items-center gap-2">
            <Info className="w-3.5 h-3.5 text-amber-900 shrink-0 stroke-[2.5]" />
            <span>
              <strong>UX Transparency:</strong> Logging in is 100% optional for multi-device sync. Local mode already includes all habit dials, notes, and metrics with zero setup.
            </span>
          </div>

          {/* Action Buttons */}
          <div className="pt-1 flex flex-col sm:flex-row items-center gap-3">
            <button
              type="button"
              disabled={isLoggingIn}
              onClick={handleGoogleLogin}
              className="w-full sm:flex-1 py-3 px-4 bg-[#FDC800] hover:bg-amber-400 border-2 border-black rounded-xl font-mono text-xs sm:text-sm font-black uppercase text-black shadow-[3px_3px_0px_#000000] cursor-pointer flex items-center justify-center gap-2 active:scale-98 transition-all disabled:opacity-50"
            >
              <LogIn className="w-4 h-4 stroke-[2.5]" />
              <span>{isLoggingIn ? 'Connecting...' : 'Sign In With Google'}</span>
            </button>

            <button
              type="button"
              onClick={handleDismiss}
              className="w-full sm:flex-1 py-3 px-4 bg-white hover:bg-neutral-100 border-2 border-black rounded-xl font-mono text-xs sm:text-sm font-black uppercase text-neutral-800 shadow-[2px_2px_0px_#000000] cursor-pointer flex items-center justify-center gap-2 active:scale-98 transition-all"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>I Understand & Enter Local Mode</span>
            </button>
          </div>

          <div className="text-center pt-1">
            <span className="text-[10px] font-mono text-neutral-500 font-bold">
              Dismissing saves your choice for 7 days • Re-accessible anytime in Settings • Zero tracking cookies
            </span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

