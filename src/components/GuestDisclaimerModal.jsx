import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldAlert, 
  HardDrive, 
  KeyRound, 
  Sparkles, 
  LogIn, 
  Check, 
  X, 
  AlertTriangle,
  Download,
  Info,
  Trash2
} from 'lucide-react';
import { soundEngine } from '../services/soundEngine';
import { 
  GUEST_DISCLAIMER_KEY, 
  GUEST_DISCLAIMER_TTL_MS, 
  isGuestDisclaimerDismissed, 
  setGuestDisclaimerDismissed 
} from '../services/api';

export { 
  GUEST_DISCLAIMER_KEY, 
  GUEST_DISCLAIMER_TTL_MS, 
  isGuestDisclaimerDismissed, 
  setGuestDisclaimerDismissed 
};

export default function GuestDisclaimerModal({ isOpen, onClose, onLogin }) {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [authError, setAuthError] = useState('');

  if (!isOpen) return null;

  const handleDismiss = () => {
    soundEngine.playClick();
    setGuestDisclaimerDismissed();
    onClose();
  };

  const handleGoogleLogin = async () => {
    soundEngine.playClick();
    setAuthError('');
    setIsLoggingIn(true);
    try {
      if (onLogin) {
        await onLogin();
      }
      soundEngine.playSuccessChime();
      onClose();
    } catch (err) {
      console.error('Login from Guest Disclaimer failed:', err);
      setAuthError(err.message || 'Google Authentication failed. Please try again.');
      soundEngine.playRoughTone();
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
          className="bg-[#FFFDF8] border-3 border-black rounded-3xl p-5 sm:p-6 max-w-xl w-full shadow-[8px_8px_0px_#000000] relative space-y-4 text-black my-auto max-h-[90vh] overflow-y-auto"
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
                TRANSPARENCY & DATA DISCLAIMER
              </span>
              <span className="px-2 py-0.5 rounded-md bg-[#FDC800] text-black border border-black font-mono text-[10px] font-black uppercase shadow-[1px_1px_0px_#000000]">
                LOCAL-FIRST GUEST MODE
              </span>
            </div>

            <div className="flex items-start gap-3 pt-1">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#FFF5C2] border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_#000000] shrink-0">
                <ShieldAlert className="w-6 h-6 text-black stroke-[2.5]" />
              </div>
              <div>
                <h3 className="font-display font-black text-lg sm:text-xl uppercase tracking-tight text-black leading-tight">
                  Data Architecture & Risk Disclosure
                </h3>
                <p className="text-[11px] font-mono font-bold text-neutral-600 mt-0.5">
                  100% on-device storage • Zero cloud upload • What you see is what is implemented
                </p>
              </div>
            </div>
          </div>

          {/* Core Disclosures Grid */}
          <div className="space-y-2.5">
            {/* 1. Local Browser Storage */}
            <div className="p-3 sm:p-3.5 rounded-2xl bg-[#FFF9E6] border-2 border-black shadow-[2px_2px_0px_#000000] flex gap-3 items-start">
              <div className="w-7 h-7 rounded-lg bg-[#FDC800] border border-black flex items-center justify-center shadow-[1px_1px_0px_#000000] shrink-0 mt-0.5">
                <HardDrive className="w-4 h-4 text-black stroke-[2.5]" />
              </div>
              <div className="space-y-0.5 flex-1">
                <span className="font-mono text-[10px] font-black uppercase tracking-wider text-amber-950 bg-amber-200/80 px-1.5 py-0.5 rounded border border-amber-400 inline-block">
                  1. 100% LOCAL DEVICE STORAGE
                </span>
                <p className="font-mono text-xs text-neutral-900 font-bold leading-relaxed">
                  Your daily ratings, habit checkmarks, mood tags, and notes are stored strictly inside your browser's private sandbox (<code className="bg-amber-100 px-1 py-0.5 border border-amber-300 rounded font-black">localStorage</code>). We do not transmit or sell your reflections to any server.
                </p>
              </div>
            </div>

            {/* 2. Incognito & Cache Clearing Hazard */}
            <div className="p-3 sm:p-3.5 rounded-2xl bg-red-50 border-2 border-[#FF4D4D] shadow-[2px_2px_0px_#000000] flex gap-3 items-start">
              <div className="w-7 h-7 rounded-lg bg-[#FF4D4D] border border-black flex items-center justify-center shadow-[1px_1px_0px_#000000] shrink-0 mt-0.5">
                <Trash2 className="w-4 h-4 text-white stroke-[2.5]" />
              </div>
              <div className="space-y-0.5 flex-1">
                <span className="font-mono text-[10px] font-black uppercase tracking-wider text-red-950 bg-red-200/90 px-1.5 py-0.5 rounded border border-red-400 inline-block">
                  2. CACHE CLEARING & INCOGNITO WIPES DATA
                </span>
                <p className="font-mono text-xs text-red-950 font-bold leading-relaxed">
                  Browsing in Private / Incognito mode or clearing browser site data/cookies permanently erases your entries. There are zero cloud backups in guest mode to recover lost data.
                </p>
              </div>
            </div>

            {/* 3. PIN Vault Cryptographic Reality */}
            <div className="p-3 sm:p-3.5 rounded-2xl bg-neutral-100 border-2 border-black shadow-[2px_2px_0px_#000000] flex gap-3 items-start">
              <div className="w-7 h-7 rounded-lg bg-black border border-black flex items-center justify-center shadow-[1px_1px_0px_#000000] shrink-0 mt-0.5">
                <KeyRound className="w-4 h-4 text-white stroke-[2.5]" />
              </div>
              <div className="space-y-0.5 flex-1">
                <span className="font-mono text-[10px] font-black uppercase tracking-wider text-neutral-900 bg-neutral-200 px-1.5 py-0.5 rounded border border-neutral-400 inline-block">
                  3. ZERO-BACKDOOR PIN VAULT
                </span>
                <p className="font-mono text-xs text-neutral-900 font-bold leading-relaxed">
                  If you enable a 4-digit PIN, your reflections are encrypted using AES-GCM and PBKDF2 directly on your device. We hold no master key and have no password-reset bypass.
                </p>
              </div>
            </div>

            {/* 4. Two-Tier Cloud & AI Gate */}
            <div className="p-3 sm:p-3.5 rounded-2xl bg-[#F0FDF4] border-2 border-emerald-600 shadow-[2px_2px_0px_#000000] flex gap-3 items-start">
              <div className="w-7 h-7 rounded-lg bg-[#00E599] border border-black flex items-center justify-center shadow-[1px_1px_0px_#000000] shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4 text-black stroke-[2.5]" />
              </div>
              <div className="space-y-0.5 flex-1">
                <span className="font-mono text-[10px] font-black uppercase tracking-wider text-emerald-950 bg-emerald-200/80 px-1.5 py-0.5 rounded border border-emerald-400 inline-block">
                  4. TWO-TIER ACCESS: CLOUD & AI GHOSTWRITING
                </span>
                <p className="font-mono text-xs text-emerald-950 font-bold leading-relaxed">
                  Automated Firestore cloud sync and AI Ghostwriter features are reserved for authorized whitelisted Google accounts to prevent spam and AI token exhaustion. Unverified sign-ins safely continue in local offline mode.
                </p>
              </div>
            </div>

            {/* 5. Direct Backup via Export Studio & Advisory Notice */}
            <div className="p-3 sm:p-3.5 rounded-2xl bg-[#EEF2FF] border-2 border-indigo-600 shadow-[2px_2px_0px_#000000] flex gap-3 items-start">
              <div className="w-7 h-7 rounded-lg bg-indigo-500 border border-black flex items-center justify-center shadow-[1px_1px_0px_#000000] shrink-0 mt-0.5">
                <Download className="w-4 h-4 text-white stroke-[2.5]" />
              </div>
              <div className="space-y-0.5 flex-1">
                <span className="font-mono text-[10px] font-black uppercase tracking-wider text-indigo-950 bg-indigo-200/80 px-1.5 py-0.5 rounded border border-indigo-400 inline-block">
                  5. EXPORT STUDIO & MENTAL WELLNESS NOTICE
                </span>
                <p className="font-mono text-xs text-indigo-950 font-bold leading-relaxed">
                  Export your full data anytime via <span className="font-black underline">Settings → Export Studio</span> (JSON/CSV) to retain full personal ownership. SHIT OR HIT is an accountability journal and reflection engine, not a medical or psychiatric service.
                </p>
              </div>
            </div>
          </div>

          {/* Optional Error Alert if Auth Fails */}
          {authError && (
            <div className="p-3 rounded-xl bg-red-100 border-2 border-red-500 font-mono text-xs text-red-900 font-bold">
              {authError}
            </div>
          )}

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
              <span>I Understand & Accept</span>
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
