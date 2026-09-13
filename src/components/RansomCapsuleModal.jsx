import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lock, 
  Unlock, 
  ShieldAlert, 
  Sparkles, 
  AlertTriangle, 
  Flame, 
  Check, 
  X, 
  KeyRound, 
  Send, 
  Clock, 
  FastForward,
  RotateCcw,
  Zap,
  HelpCircle
} from 'lucide-react';
import { soundEngine } from '../services/soundEngine';
import { 
  saveRansomCapsule, 
  unlockRansomCapsule, 
  getActiveSealedCapsule, 
  getRansomCapsules,
  deleteRansomCapsule
} from '../services/api';

const INSPIRATION_PRESETS = [
  "Put down the phone. Stop crying. Remember who you are and execute.",
  "You are not your slump. Drink 1L water, take a cold shower, and lock in for 60 minutes.",
  "The standard never drops just because you're tired. Rebuild the momentum brick by brick.",
  "Discipline over emotion. What would the peak version of you do right now?",
  "You built this streak from zero once before. Get off the floor and attack tomorrow."
];

export default function RansomCapsuleModal({
  isOpen,
  onClose,
  mode = 'capture', // 'capture' | 'release' | 'manage'
  targetCapsule = null,
  activeDate = new Date().toISOString().slice(0, 10),
  activeStreak = 1,
  onCapsuleSaved,
  onCapsuleDismissed
}) {
  // Capture Mode State
  const [messageText, setMessageText] = useState('');
  const [isSealing, setIsSealing] = useState(false);
  const [sealedSuccess, setSealedSuccess] = useState(false);

  // Release Mode State
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [capsuleToRelease, setCapsuleToRelease] = useState(targetCapsule || null);

  // Manage Mode State
  const [capsulesList, setCapsulesList] = useState([]);

  useEffect(() => {
    if (!isOpen) return;

    if (mode === 'release') {
      const active = targetCapsule || getActiveSealedCapsule();
      setCapsuleToRelease(active);
      if (active) {
        soundEngine.playCapsuleUnlock();
        const unlocked = unlockRansomCapsule(active.id);
        const fullMessage = unlocked?.decryptedMessage || active.decryptedMessage || active.message || "Remember who you are and rebuild.";
        
        // Start live typewriter effect
        setIsTyping(true);
        setDisplayedText('');
        let charIndex = 0;
        const typingInterval = setInterval(() => {
          if (charIndex < fullMessage.length) {
            setDisplayedText(fullMessage.slice(0, charIndex + 1));
            if (charIndex % 3 === 0) {
              soundEngine.playTypewriterKey();
            }
            charIndex++;
          } else {
            clearInterval(typingInterval);
            setIsTyping(false);
          }
        }, 22);

        return () => clearInterval(typingInterval);
      }
    } else if (mode === 'manage') {
      setCapsulesList(getRansomCapsules());
    } else if (mode === 'capture') {
      setMessageText('');
      setIsSealing(false);
      setSealedSuccess(false);
    }
  }, [isOpen, mode, targetCapsule]);

  if (!isOpen) return null;

  const handleSealCapsule = (e) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    setIsSealing(true);
    soundEngine.playClick();

    setTimeout(() => {
      try {
        const saved = saveRansomCapsule({
          message: messageText.trim(),
          date: activeDate,
          streak: activeStreak
        });
        soundEngine.playSuccessChime();
        setIsSealing(false);
        setSealedSuccess(true);
        if (onCapsuleSaved) onCapsuleSaved(saved);
        setTimeout(() => {
          onClose();
        }, 1200);
      } catch (err) {
        setIsSealing(false);
        alert("Failed to seal capsule cipher. Please try again.");
      }
    }, 450);
  };

  const handleSkipTyping = () => {
    const fullMessage = capsuleToRelease?.decryptedMessage || capsuleToRelease?.message || "Remember who you are.";
    setDisplayedText(fullMessage);
    setIsTyping(false);
  };

  const handleAcknowledgeRelease = () => {
    soundEngine.playSuccessChime();
    if (onCapsuleDismissed) onCapsuleDismissed();
    onClose();
  };

  const handleDeleteCapsule = (id) => {
    if (window.confirm("Delete this encrypted capsule from storage?")) {
      deleteRansomCapsule(id);
      setCapsulesList(getRansomCapsules());
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-90 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
        onClick={mode === 'release' ? undefined : onClose}
      >
        <motion.div
          initial={{ scale: 0.94, y: 15 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.94, y: 15 }}
          className={`w-full max-w-xl bg-[#FFFDF5] rounded-3xl border-3 border-black p-5 sm:p-7 shadow-[8px_8px_0px_#000000] space-y-4 text-left ${
            mode === 'release' ? 'ring-4 ring-[#FF4D4D]' : ''
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* ================================================================= */}
          {/* 1. CAPTURE MODE: God Mode Peak Reality Check Capture */}
          {/* ================================================================= */}
          {mode === 'capture' && (
            <div className="space-y-4">
              {/* Header Badge */}
              <div className="flex items-center justify-between border-b-2 border-black/10 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-11 h-11 rounded-2xl bg-[#FDC800] border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_#000000]">
                    <Sparkles className="w-6 h-6 text-black stroke-[2.5]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-display font-black text-lg sm:text-xl uppercase leading-none text-black">
                        DOWN-BAD RANSOM CAPSULE
                      </h3>
                      <span className="px-1.5 py-0.5 rounded bg-black text-[#FDC800] text-[9px] font-mono font-black uppercase">
                        GOD MODE
                      </span>
                    </div>
                    <span className="text-xs font-mono text-neutral-600">
                      Time-Locked Reality Check for Future Slumps
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 border-2 border-black cursor-pointer shadow-[1.5px_1.5px_0px_#000000]"
                >
                  <X className="w-4 h-4 text-black stroke-[2.5]" />
                </button>
              </div>

              {/* Explanatory Banner */}
              <div className="p-3.5 bg-amber-50 border-2 border-black rounded-2xl shadow-[2px_2px_0px_#000000] space-y-1">
                <div className="flex items-center gap-2 font-display font-black text-xs uppercase text-black">
                  <Lock className="w-4 h-4 text-amber-700 stroke-[2.5]" />
                  <span>CRYPTOGRAPHIC TIME-LOCK PROTOCOL</span>
                </div>
                <p className="text-xs font-mono text-neutral-700 leading-snug">
                  You are operating at <strong>5★ Peak Power</strong> today. Write a brutal, uncompromising reality check for your future down-bad self. This message is encrypted and will <strong>ONLY unlock</strong> if you record consecutive 1★ Rough days.
                </p>
              </div>

              {/* Quick Inspiration Chips */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono font-bold text-neutral-600 uppercase flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-600" />
                  <span>Quick Tactical Directives:</span>
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {INSPIRATION_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setMessageText(preset)}
                      className="px-2.5 py-1 bg-white hover:bg-[#FDC800] border-2 border-black rounded-xl font-mono text-[10px] font-bold text-neutral-800 text-left transition-all active:scale-95 shadow-[1px_1px_0px_#000000] cursor-pointer"
                    >
                      {preset.slice(0, 36)}...
                    </button>
                  ))}
                </div>
              </div>

              {/* Text Input Area */}
              <form onSubmit={handleSealCapsule} className="space-y-3 pt-1">
                <div className="relative">
                  <textarea
                    rows={4}
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="E.g. Listen to me: You are spiraling right now because you stayed up till 3 AM on TikTok and skipped the gym. Put the phone in the other room, take a cold shower, and execute your anchors. Stop acting like a victim."
                    className="w-full p-3.5 bg-white border-2 border-black rounded-2xl font-mono text-xs text-black focus:outline-none focus:ring-2 focus:ring-[#FDC800] shadow-[2px_2px_0px_#000000] leading-relaxed resize-none"
                    autoFocus
                  />
                  <span className="absolute bottom-2.5 right-3 font-mono text-[10px] text-neutral-400">
                    {messageText.length} chars
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3 pt-1">
                  <div className="flex items-center gap-1.5 text-[11px] font-mono text-neutral-500">
                    <KeyRound className="w-3.5 h-3.5 text-neutral-700" />
                    <span>XOR Dynamic Salt Sealed</span>
                  </div>

                  <button
                    type="submit"
                    disabled={!messageText.trim() || isSealing || sealedSuccess}
                    className={`px-5 py-3 rounded-2xl border-3 border-black font-display font-black text-xs uppercase cursor-pointer shadow-[3px_3px_0px_#000000] active:scale-95 transition-all flex items-center gap-2 ${
                      sealedSuccess 
                        ? 'bg-[#00E599] text-black' 
                        : isSealing 
                        ? 'bg-neutral-300 text-neutral-700' 
                        : 'bg-[#FDC800] hover:bg-amber-400 text-black'
                    }`}
                  >
                    {sealedSuccess ? (
                      <>
                        <Check className="w-4 h-4 stroke-3" />
                        <span>CAPSULE CIPHER SEALED!</span>
                      </>
                    ) : isSealing ? (
                      <span>ENCRYPTING CIPHER...</span>
                    ) : (
                      <>
                        <Lock className="w-4 h-4 stroke-[2.5]" />
                        <span>SEAL RANSOM CAPSULE</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ================================================================= */}
          {/* 2. RELEASE MODE: Emergency Down-Bad Slump Unlock */}
          {/* ================================================================= */}
          {mode === 'release' && (
            <div className="space-y-4">
              {/* Emergency Danger Header */}
              <div className="p-3 bg-[#FF4D4D] text-black border-2 border-black rounded-2xl shadow-[3px_3px_0px_#000000] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-6 h-6 stroke-3 text-black animate-pulse" />
                  <div>
                    <h3 className="font-display font-black text-sm uppercase leading-none">
                      EMERGENCY CAPSULE BREACH DETECTED
                    </h3>
                    <span className="font-mono text-[10px] uppercase font-bold tracking-tight">
                      CONSECUTIVE 1★ SLUMP TRIGGERED • TIME-LOCK VOIDED
                    </span>
                  </div>
                </div>

                <div className="px-2 py-0.5 rounded border border-black bg-white font-mono text-[10px] font-black uppercase">
                  UNSEALED
                </div>
              </div>

              {/* Metadata Pill */}
              <div className="flex items-center justify-between px-3 py-1.5 bg-neutral-100 border-2 border-black rounded-xl text-[11px] font-mono text-neutral-700">
                <div className="flex items-center gap-1.5 font-bold">
                  <Clock className="w-3.5 h-3.5 text-neutral-900" />
                  <span>WRITTEN: {capsuleToRelease?.createdDate || 'PAST PEAK DAY'}</span>
                </div>
                <div className="flex items-center gap-1 font-black text-black">
                  <Flame className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                  <span>PEAK STREAK: {capsuleToRelease?.streakAtCapture || 1} DAYS</span>
                </div>
              </div>

              {/* Typewriter Decrypted Reality-Check Body */}
              <div className="p-4 bg-white border-3 border-black rounded-2xl shadow-[4px_4px_0px_#000000] space-y-2 min-h-[140px] relative">
                <div className="flex items-center justify-between text-[10px] font-mono text-neutral-500 uppercase pb-1 border-b border-black/10">
                  <span>TRANSMISSION FROM YOUR 5★ PEAK SELF:</span>
                  {isTyping && (
                    <button
                      type="button"
                      onClick={handleSkipTyping}
                      className="text-neutral-700 hover:text-black font-black flex items-center gap-1 underline cursor-pointer"
                    >
                      <FastForward className="w-3 h-3" />
                      <span>FAST-FORWARD</span>
                    </button>
                  )}
                </div>

                <p className="font-mono text-sm sm:text-base font-bold text-black leading-relaxed whitespace-pre-wrap">
                  {displayedText}
                  {isTyping && <span className="inline-block w-2.5 h-4 ml-1 bg-black animate-pulse" />}
                </p>
              </div>

              {/* Acknowledge Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleAcknowledgeRelease}
                  className="w-full py-3.5 px-4 bg-[#00E599] hover:bg-emerald-400 text-black font-display font-black text-sm uppercase rounded-2xl border-3 border-black shadow-[4px_4px_0px_#000000] active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Zap className="w-4 h-4 stroke-3" />
                  <span>I HEAR YOU. I AM BACK. RESUME THE FIGHT.</span>
                </button>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* 3. MANAGE MODE: View & Manage Past Sealed/Unlocked Capsules */}
          {/* ================================================================= */}
          {mode === 'manage' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b-2 border-black/10 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-[#00E599] border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_#000000]">
                    <Lock className="w-5 h-5 text-black stroke-[2.5]" />
                  </div>
                  <div>
                    <h3 className="font-display font-black text-lg uppercase leading-none">
                      RANSOM CAPSULE VAULT
                    </h3>
                    <span className="text-xs font-mono text-neutral-600">
                      Active Time-Locked Ciphers & Archives
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 border-2 border-black cursor-pointer shadow-[1.5px_1.5px_0px_#000000]"
                >
                  <X className="w-4 h-4 text-black stroke-[2.5]" />
                </button>
              </div>

              {capsulesList.length === 0 ? (
                <div className="py-12 text-center font-mono text-xs text-neutral-500 space-y-2">
                  <p>No capsules stored yet.</p>
                  <p className="text-[11px] text-neutral-400">
                    Log a 5★ Peak day with Ransom Capsule enabled to seal your first message!
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                  {capsulesList.map((c) => (
                    <div
                      key={c.id}
                      className="p-3 bg-white border-2 border-black rounded-xl shadow-[2px_2px_0px_#000000] flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded border border-black font-mono text-[9px] font-black uppercase ${
                            c.status === 'sealed' ? 'bg-[#FDC800] text-black' : 'bg-[#00E599] text-black'
                          }`}>
                            {c.status.toUpperCase()}
                          </span>
                          <span className="font-mono text-xs text-neutral-700 font-bold">
                            {c.createdDate}
                          </span>
                        </div>
                        <div className="text-[11px] font-mono text-neutral-500 truncate mt-1">
                          {c.status === 'sealed' ? '🔒 Cipher sealed with time-lock' : c.decryptedMessage || 'Unlocked capsule'}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteCapsule(c.id)}
                        className="px-2.5 py-1 text-xs font-mono text-red-600 hover:bg-red-50 rounded border border-red-200 cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-2 border-t border-black/10 flex justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 bg-black text-white font-display font-black text-xs uppercase rounded-xl border-2 border-black shadow-[2px_2px_0px_#000000] cursor-pointer"
                >
                  DONE
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
