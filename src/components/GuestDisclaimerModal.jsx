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
  AlertTriangle 
} from 'lucide-react';
import { soundEngine } from '../services/soundEngine';

export const GUEST_DISCLAIMER_KEY = 'daily_verdict_guest_disclaimer_dismissed';
export const GUEST_DISCLAIMER_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export function isGuestDisclaimerDismissed() {
  if (typeof window === 'undefined') return false;
  try {
    const raw = localStorage.getItem(GUEST_DISCLAIMER_KEY);
    if (!raw) return false;
    const timestamp = parseInt(raw, 10);
    if (!isNaN(timestamp)) {
      const isStillValid = (Date.now() - timestamp) < GUEST_DISCLAIMER_TTL_MS;
      if (!isStillValid) {
        localStorage.removeItem(GUEST_DISCLAIMER_KEY);
        return false;
      }
      return true;
    }
    return raw === 'true';
  } catch (e) {
    return false;
  }
}

export function setGuestDisclaimerDismissed() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(GUEST_DISCLAIMER_KEY, Date.now().toString());
  } catch (e) {}
}

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
        className="fixed inset-0 z-100 flex items-center justify-center p-3.5 sm:p-6 bg-black/85 backdrop-blur-md select-none overflow-y-auto"
        onClick={handleDismiss}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.93, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.93, y: 20 }}
          transition={{ type: 'spring', stiffness: 350, damping: 28 }}
          className="bg-[#FFFDF8] border-3 border-black rounded-3xl p-5 sm:p-7 max-w-lg w-full shadow-[8px_8px_0px_#000000] relative space-y-4 text-black my-auto"
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
                ⚠️ LOCAL GUEST MODE
              </span>
              <span className="px-2 py-0.5 rounded-md bg-[#FDC800] text-black border border-black font-mono text-[10px] font-black uppercase shadow-[1px_1px_0px_#000000]">
                TWO-TIER ACCESS GATE
              </span>
            </div>

            <div className="flex items-start gap-3 pt-1">
              <div className="w-12 h-12 rounded-2xl bg-[#FFF5C2] border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_#000000] shrink-0">
                <ShieldAlert className="w-6 h-6 text-black stroke-[2.5]" />
              </div>
              <div>
                <h3 className="font-display font-black text-lg sm:text-xl uppercase tracking-tight text-black leading-tight">
                  Two-Tier Access & Data Safety Notice
                </h3>
                <p className="text-[11px] font-mono font-bold text-neutral-600 mt-0.5">
                  Local-first storage active • Zero cloud recovery in guest mode
                </p>
              </div>
            </div>
          </div>

          {/* Section 1: Core Warning Card */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-[#FFF9E6] border-2 border-black shadow-[3px_3px_0px_#000000] flex gap-3 items-start">
            <div className="w-8 h-8 rounded-xl bg-[#FDC800] border-2 border-black flex items-center justify-center shadow-[1px_1px_0px_#000000] shrink-0 mt-0.5">
              <HardDrive className="w-4 h-4 text-black stroke-[2.5]" />
            </div>
            <div className="space-y-1">
              <span className="font-mono text-[10px] font-black uppercase tracking-wider text-amber-900 bg-amber-200/70 px-1.5 py-0.5 rounded border border-amber-400">
                LOCAL BROWSER STORAGE ONLY
              </span>
              <p className="font-mono text-xs sm:text-[13px] text-neutral-900 font-bold leading-relaxed">
                Your diary reflections, habit streaks, and PIN settings are stored in this browser only.
              </p>
            </div>
          </div>

          {/* Section 2: PIN & Critical Data Loss Warning Card */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-red-50 border-2 border-[#FF4D4D] shadow-[3px_3px_0px_#000000] flex gap-3 items-start">
            <div className="w-8 h-8 rounded-xl bg-[#FF4D4D] border-2 border-black flex items-center justify-center shadow-[1px_1px_0px_#000000] shrink-0 mt-0.5">
              <KeyRound className="w-4 h-4 text-white stroke-[2.5]" />
            </div>
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-[10px] font-black uppercase tracking-wider text-red-900 bg-red-200/80 px-1.5 py-0.5 rounded border border-red-400">
                  CRITICAL PIN & DATA HAZARD
                </span>
              </div>
              <p className="font-mono text-xs sm:text-[13px] text-red-950 font-black leading-relaxed">
                If you set a Vault PIN or clear your browser data, your records cannot be recovered. There are zero cloud backups in guest mode.
              </p>
              <div className="pt-1">
                <span className="inline-block px-2 py-0.5 rounded bg-red-100 text-red-900 text-[10px] font-mono font-black border border-red-300">
                  ⚠️ ZERO RECOVERY BYPASS • LOCAL PBKDF2 ENCRYPTED HASH
                </span>
              </div>
            </div>
          </div>

          {/* Section 3: Developer Whitelist Call-to-Action Card */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-[#F0FDF4] border-2 border-emerald-600 shadow-[3px_3px_0px_#000000] flex gap-3 items-start">
            <div className="w-8 h-8 rounded-xl bg-[#00E599] border-2 border-black flex items-center justify-center shadow-[1px_1px_0px_#000000] shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4 text-black stroke-[2.5]" />
            </div>
            <div className="space-y-1">
              <span className="font-mono text-[10px] font-black uppercase tracking-wider text-emerald-900 bg-emerald-200/70 px-1.5 py-0.5 rounded border border-emerald-400">
                TIER 1 CLOUD & AI ADVANTAGES
              </span>
              <p className="font-mono text-xs sm:text-[13px] text-emerald-950 font-bold leading-relaxed">
                Contact the developer to have your email whitelisted for cloud backups and AI features, or sign in if you already have an authorized email.
              </p>
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
              <span>I Understand the Risks</span>
            </button>
          </div>

          <div className="text-center pt-1">
            <span className="text-[10px] font-mono text-neutral-500 font-bold">
              Dismissing saves your choice for 7 days • Re-accessible anytime in Settings
            </span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
