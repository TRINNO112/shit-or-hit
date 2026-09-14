import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  HelpCircle,
  Calendar,
  Plus,
  Trash2,
  Hourglass,
  Layers,
  ChevronRight,
  ShieldCheck,
  FileText
} from 'lucide-react';
import { soundEngine } from '../services/soundEngine';
import { 
  saveRansomCapsule, 
  unlockRansomCapsule, 
  getActiveSealedCapsule, 
  getRansomCapsules,
  deleteRansomCapsule
} from '../services/api';

const SEAL_STYLES = [
  { id: 'wax', label: 'Classic Wax Seal', color: '#FF4D4D', bg: '#FFE5E5', desc: 'Regal crimson wax imprint' },
  { id: 'cyber', label: 'Cyber Matrix Tape', color: '#00E599', bg: '#E6FFF5', desc: 'Encrypted neon grid lock' },
  { id: 'top_secret', label: 'Classified Redacted', color: '#FDC800', bg: '#FFF9E6', desc: 'Eyes-only clearance seal' },
  { id: 'biohazard', label: 'Hazard Quarantine', color: '#FF8A00', bg: '#FFF0E0', desc: 'Severe mental quarantine' }
];

export default function RansomCapsuleModal({
  isOpen,
  onClose,
  mode = 'vault', // 'vault' | 'capture' | 'release'
  targetCapsule = null,
  activeDate = new Date().toISOString().slice(0, 10),
  activeStreak = 1,
  onCapsuleSaved,
  onCapsuleDismissed
}) {
  const [currentTab, setCurrentTab] = useState(mode === 'release' ? 'release' : 'vault');
  const [capsulesList, setCapsulesList] = useState([]);

  // Form State for creating a capsule
  const [title, setTitle] = useState('');
  const [messageText, setMessageText] = useState('');
  const [triggerType, setTriggerType] = useState('date'); // 'date' | 'slump' | 'streak'
  
  // Date trigger default: 30 days from now
  const [targetDate, setTargetDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().slice(0, 10);
  });
  const [roughThreshold, setRoughThreshold] = useState(2);
  const [streakThreshold, setStreakThreshold] = useState(7);
  const [sealStyle, setSealStyle] = useState('wax');
  const [isSealing, setIsSealing] = useState(false);
  const [formError, setFormError] = useState('');

  const handleSetNewYear = () => {
    soundEngine.playClick();
    const nextYear = new Date().getFullYear() + 1;
    setTargetDate(`${nextYear}-01-01`);
  };

  // Release Typewriter State
  const [activeReleaseCapsule, setActiveReleaseCapsule] = useState(targetCapsule || null);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Refresh capsules list
  const refreshCapsules = () => {
    const list = getRansomCapsules();
    setCapsulesList(list);
  };

  useEffect(() => {
    if (!isOpen) return;
    refreshCapsules();

    if (mode === 'release' && targetCapsule) {
      triggerRelease(targetCapsule);
    } else if (mode === 'capture') {
      setCurrentTab('create');
    } else {
      setCurrentTab('vault');
    }
  }, [isOpen, mode, targetCapsule]);

  const triggerRelease = (cap) => {
    setCurrentTab('release');
    setActiveReleaseCapsule(cap);
    soundEngine.playCapsuleUnlock();

    const unlocked = unlockRansomCapsule(cap.id);
    const fullMessage = unlocked?.decryptedMessage || cap.decryptedMessage || cap.message || "Remember who you are and rebuild.";

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
        soundEngine.playSuccessChime();
        refreshCapsules();
      }
    }, 28);
  };

  const handleCreateCapsule = (e) => {
    e.preventDefault();
    if (!messageText.trim()) {
      setFormError('Please enter your confidential message to your future self.');
      return;
    }

    setIsSealing(true);
    soundEngine.playClick();

    setTimeout(() => {
      try {
        const saved = saveRansomCapsule({
          title: title.trim() || 'Confidential Time Capsule',
          message: messageText.trim(),
          triggerType,
          targetDate: triggerType === 'date' ? targetDate : null,
          roughDaysThreshold: triggerType === 'slump' ? roughThreshold : 2,
          streakThreshold: triggerType === 'streak' ? streakThreshold : 7,
          sealStyle,
          date: activeDate,
          streak: activeStreak
        });

        soundEngine.playCapsuleSeal();
        setIsSealing(false);
        setTitle('');
        setMessageText('');
        setFormError('');
        refreshCapsules();
        setCurrentTab('vault');
        if (onCapsuleSaved) onCapsuleSaved(saved);
      } catch (err) {
        console.error('Save error:', err);
        setIsSealing(false);
        setFormError('Failed to encrypt capsule. Please try again.');
      }
    }, 450);
  };

  const handleDeleteCapsule = (id, e) => {
    e.stopPropagation();
    if (window.confirm('Delete this capsule permanently? This cannot be undone.')) {
      deleteRansomCapsule(id);
      soundEngine.playClick();
      refreshCapsules();
    }
  };

  // Quick Date presets
  const handleSetQuickDate = (daysAhead) => {
    soundEngine.playClick();
    const d = new Date();
    d.setDate(d.getDate() + daysAhead);
    setTargetDate(d.toISOString().slice(0, 10));
  };

  // Countdown Calculator
  const getCountdownString = (targetDateStr) => {
    if (!targetDateStr) return 'Target Date';
    const now = new Date();
    const target = new Date(targetDateStr);
    const diffMs = target.getTime() - now.getTime();
    if (diffMs <= 0) return 'Ready to Unlock!';
    const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return `${days} Days Left`;
  };

  if (!isOpen) return null;

  const sealedCount = capsulesList.filter(c => c.status === 'sealed').length;
  const unlockedCount = capsulesList.filter(c => c.status === 'unlocked').length;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-90 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.94, y: 15 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.94, y: 15 }}
          className="w-full max-w-xl bg-[#FFFDF5] rounded-3xl border-3 border-black p-4 sm:p-6 shadow-[8px_8px_0px_#000000] space-y-4 text-left max-h-[94vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b-2 border-black/10 pb-3 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-[#FDC800] border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_#000000]">
                <Hourglass className="w-5 h-5 text-black stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display font-black text-lg uppercase leading-none">
                    TIME & MOOD CAPSULE VAULT
                  </h3>
                  <span className="px-1.5 py-0.5 rounded bg-black text-[#FDC800] text-[9px] font-mono font-black uppercase">
                    ENCRYPTED
                  </span>
                </div>
                <span className="text-xs font-mono text-neutral-600">
                  Letters to Future You • Date & Mood Gatekeepers
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 border-2 border-black cursor-pointer shadow-[1.5px_1.5px_0px_#000000] active:scale-95"
            >
              <X className="w-4 h-4 text-black stroke-[2.5]" />
            </button>
          </div>

          {/* Tab Navigation */}
          {currentTab !== 'release' && (
            <div className="flex items-center gap-2 bg-neutral-100 p-1.5 rounded-2xl border-2 border-black shrink-0">
              <button
                type="button"
                onClick={() => {
                  setCurrentTab('vault');
                  soundEngine.playClick();
                }}
                className={`flex-1 py-2 px-3 rounded-xl border-2 border-black font-mono text-xs font-black uppercase transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  currentTab === 'vault'
                    ? 'bg-[#FDC800] text-black shadow-[2px_2px_0px_#000000]'
                    : 'bg-white text-neutral-700 hover:bg-neutral-50'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>VAULT GALLERY ({sealedCount})</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setCurrentTab('create');
                  soundEngine.playClick();
                }}
                className={`flex-1 py-2 px-3 rounded-xl border-2 border-black font-mono text-xs font-black uppercase transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  currentTab === 'create'
                    ? 'bg-[#00E599] text-black shadow-[2px_2px_0px_#000000]'
                    : 'bg-white text-neutral-700 hover:bg-neutral-50'
                }`}
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>CRAFT NEW CAPSULE</span>
              </button>
            </div>
          )}

          {/* TAB 1: VAULT GALLERY */}
          {currentTab === 'vault' && (
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {capsulesList.length === 0 ? (
                <div className="py-16 text-center border-2 border-dashed border-black/20 rounded-2xl p-6 bg-neutral-50 space-y-3">
                  <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-100 border-2 border-black flex items-center justify-center">
                    <Hourglass className="w-6 h-6 text-amber-800" />
                  </div>
                  <h4 className="font-display font-black text-sm uppercase text-neutral-800">
                    No Capsules Sealed Yet
                  </h4>
                  <p className="font-mono text-xs text-neutral-600 max-w-sm mx-auto">
                    Write a message to your future self. Lock it until a specific calendar date, or set it to unlock when you suffer consecutive rough days!
                  </p>
                  <button
                    type="button"
                    onClick={() => setCurrentTab('create')}
                    className="px-4 py-2 bg-[#00E599] text-black font-mono text-xs font-black uppercase rounded-xl border-2 border-black shadow-[2px_2px_0px_#000000] cursor-pointer"
                  >
                    + CRAFT FIRST CAPSULE
                  </button>
                </div>
              ) : (
                capsulesList.map((cap) => {
                  const isSealed = cap.status === 'sealed';
                  const isDate = cap.triggerType === 'date';
                  const isSlump = cap.triggerType === 'slump';
                  const isStreak = cap.triggerType === 'streak';

                  const countdown = isDate ? getCountdownString(cap.targetDate) : null;
                  const canUnlockNow = isDate ? countdown === 'Ready to Unlock!' : false;

                  return (
                    <div
                      key={cap.id}
                      onClick={() => {
                        if (!isSealed || canUnlockNow) {
                          triggerRelease(cap);
                        } else {
                          soundEngine.playVaultError();
                        }
                      }}
                      className={`p-3.5 rounded-2xl border-2 border-black shadow-[3px_3px_0px_#000000] flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                        isSealed 
                          ? canUnlockNow 
                            ? 'bg-[#00E599]/20 hover:scale-[1.01] cursor-pointer border-[#00A86B]' 
                            : 'bg-neutral-50/80 select-none cursor-not-allowed border-black/60' 
                          : 'bg-white hover:bg-neutral-50 cursor-pointer'
                      }`}
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <div className={`w-10 h-10 rounded-xl border-2 border-black flex items-center justify-center shrink-0 shadow-[1px_1px_0px_#000000] ${
                          isSealed ? (canUnlockNow ? 'bg-[#00E599]' : 'bg-[#FDC800]') : 'bg-neutral-200'
                        }`}>
                          {isSealed ? (
                            canUnlockNow ? <Unlock className="w-5 h-5 text-black stroke-[2.5]" /> : <Lock className="w-5 h-5 text-black stroke-[2.5]" />
                          ) : (
                            <FileText className="w-5 h-5 text-neutral-700 stroke-[2]" />
                          )}
                        </div>

                        <div className="min-w-0 space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="font-display font-black text-sm uppercase text-black truncate">
                              {cap.title || 'Confidential Capsule'}
                            </h4>
                            <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-black uppercase border border-black ${
                              isSealed ? (canUnlockNow ? 'bg-[#00E599] text-black' : 'bg-black text-[#FDC800]') : 'bg-neutral-200 text-neutral-700'
                            }`}>
                              {isSealed ? (canUnlockNow ? 'READY TO UNLOCK' : 'LOCKED & SEALED') : 'ARCHIVED (UNLOCKED)'}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] text-neutral-600">
                            {isDate && (
                              <span className="flex items-center gap-1 font-bold text-black">
                                <Calendar className="w-3.5 h-3.5" />
                                {cap.targetDate} ({countdown})
                              </span>
                            )}
                            {isSlump && (
                              <span className="flex items-center gap-1 text-red-700 font-bold">
                                <AlertTriangle className="w-3.5 h-3.5" />
                                Auto-triggers on {cap.roughDaysThreshold || 2} Rough Days
                              </span>
                            )}
                            {isStreak && (
                              <span className="flex items-center gap-1 text-emerald-700 font-bold">
                                <Flame className="w-3.5 h-3.5" />
                                Auto-triggers on {cap.streakThreshold || 7}-Day Streak
                              </span>
                            )}
                            <span>Seal: {cap.sealStyle || 'Wax'}</span>
                          </div>

                          {/* Strict Zero-Knowledge Lockout Explanation for sealed items */}
                          {isSealed && !canUnlockNow && (
                            <div className="text-[10px] font-mono text-neutral-500 font-bold bg-neutral-100 px-2 py-0.5 rounded border border-neutral-300 inline-block">
                              🔒 Zero-Knowledge Encrypted: Content cannot be previewed until trigger arrives
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                        {canUnlockNow && (
                          <button
                            type="button"
                            onClick={() => triggerRelease(cap)}
                            className="px-3 py-1.5 bg-[#00E599] hover:bg-emerald-400 text-black font-mono text-xs font-black uppercase rounded-xl border-2 border-black shadow-[2px_2px_0px_#000000] cursor-pointer active:scale-95"
                          >
                            BREACH & UNLOCK
                          </button>
                        )}
                        {!isSealed && (
                          <button
                            type="button"
                            onClick={() => triggerRelease(cap)}
                            className="px-3 py-1.5 bg-[#FDC800] hover:bg-amber-400 text-black font-mono text-xs font-black uppercase rounded-xl border-2 border-black shadow-[2px_2px_0px_#000000] cursor-pointer active:scale-95"
                          >
                            READ LETTER
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={(e) => handleDeleteCapsule(cap.id, e)}
                          className="p-1.5 rounded-lg bg-red-100 hover:bg-red-200 border border-black text-red-800 cursor-pointer"
                          title="Delete Capsule"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB 2: CREATE / CRAFT NEW CAPSULE */}
          {currentTab === 'create' && (
            <form onSubmit={handleCreateCapsule} className="flex-1 overflow-y-auto space-y-3 pr-1">
              {formError && (
                <div className="p-2.5 bg-red-100 border-2 border-red-700 rounded-xl text-red-950 font-mono text-xs font-bold">
                  {formError}
                </div>
              )}

              {/* Title Input */}
              <div className="space-y-1">
                <label className="font-mono font-black text-xs uppercase text-neutral-800">
                  Capsule Title / Dedication
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. To Future Ashish on Semester Finals Week"
                  className="w-full p-2.5 bg-white border-2 border-black rounded-xl font-mono text-xs font-bold text-black focus:outline-none focus:bg-[#FFFDF5]"
                />
              </div>

              {/* Trigger Mode Selector */}
              <div className="space-y-1.5">
                <label className="font-mono font-black text-xs uppercase text-neutral-800">
                  Choose Unlock Condition
                </label>
                <div className="grid grid-cols-3 gap-2 font-mono text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setTriggerType('date');
                      soundEngine.playClick();
                    }}
                    className={`p-2.5 rounded-xl border-2 border-black font-black uppercase text-left transition-all cursor-pointer ${
                      triggerType === 'date'
                        ? 'bg-[#FDC800] text-black shadow-[2px_2px_0px_#000000]'
                        : 'bg-white text-neutral-700 hover:bg-neutral-50'
                    }`}
                  >
                    <Calendar className="w-4 h-4 mb-1" />
                    <span>CALENDAR DATE</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setTriggerType('slump');
                      soundEngine.playClick();
                    }}
                    className={`p-2.5 rounded-xl border-2 border-black font-black uppercase text-left transition-all cursor-pointer ${
                      triggerType === 'slump'
                        ? 'bg-[#FF4D4D] text-white shadow-[2px_2px_0px_#000000]'
                        : 'bg-white text-neutral-700 hover:bg-neutral-50'
                    }`}
                  >
                    <AlertTriangle className="w-4 h-4 mb-1" />
                    <span>ROUGH SLUMP</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setTriggerType('streak');
                      soundEngine.playClick();
                    }}
                    className={`p-2.5 rounded-xl border-2 border-black font-black uppercase text-left transition-all cursor-pointer ${
                      triggerType === 'streak'
                        ? 'bg-[#00E599] text-black shadow-[2px_2px_0px_#000000]'
                        : 'bg-white text-neutral-700 hover:bg-neutral-50'
                    }`}
                  >
                    <Flame className="w-4 h-4 mb-1" />
                    <span>STREAK GOAL</span>
                  </button>
                </div>
              </div>

              {/* Dynamic Trigger Sub-Config */}
              {triggerType === 'date' && (
                <div className="p-3 bg-[#FFF9E6] border-2 border-black rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-black uppercase text-black">
                      Target Unlock Date:
                    </span>
                    <input
                      type="date"
                      value={targetDate}
                      min={new Date().toISOString().slice(0, 10)}
                      onChange={(e) => setTargetDate(e.target.value)}
                      className="p-1.5 bg-white border-2 border-black rounded-lg font-mono text-xs font-bold"
                    />
                  </div>
                  <div className="flex items-center gap-1.5 font-mono text-[10px]">
                    <span className="text-neutral-500 font-bold">Quick Jump:</span>
                    <button
                      type="button"
                      onClick={() => handleSetQuickDate(7)}
                      className="px-2 py-0.5 bg-white hover:bg-neutral-100 border border-black rounded"
                    >
                      +7 Days
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSetQuickDate(30)}
                      className="px-2 py-0.5 bg-white hover:bg-neutral-100 border border-black rounded"
                    >
                      +30 Days
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSetQuickDate(90)}
                      className="px-2 py-0.5 bg-white hover:bg-neutral-100 border border-black rounded"
                    >
                      +90 Days
                    </button>
                    <button
                      type="button"
                      onClick={handleSetNewYear}
                      className="px-2 py-0.5 bg-[#FDC800] hover:bg-amber-400 text-black font-black border border-black rounded"
                    >
                      New Year
                    </button>
                  </div>
                </div>
              )}

              {triggerType === 'slump' && (
                <div className="p-3 bg-red-50 border-2 border-black rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-black uppercase text-red-950">
                      Unlocks After Consecutive Rough Days:
                    </span>
                    <div className="flex items-center gap-1">
                      {[2, 3, 4].map(num => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => {
                            setRoughThreshold(num);
                            soundEngine.playClick();
                          }}
                          className={`px-2.5 py-1 rounded-lg border-2 border-black font-mono text-xs font-black ${
                            roughThreshold === num ? 'bg-[#FF4D4D] text-white shadow-[1px_1px_0px_#000000]' : 'bg-white text-black'
                          }`}
                        >
                          {num} Days
                        </button>
                      ))}
                    </div>
                  </div>
                  <p className="font-mono text-[11px] text-red-900 leading-snug">
                    When you are in the trenches for {roughThreshold} days, this message will automatically crack open to pull you out of the dark.
                  </p>
                </div>
              )}

              {triggerType === 'streak' && (
                <div className="p-3 bg-emerald-50 border-2 border-black rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-black uppercase text-emerald-950">
                      Unlocks Upon Reaching Streak:
                    </span>
                    <div className="flex items-center gap-1">
                      {[7, 14, 30].map(num => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => {
                            setStreakThreshold(num);
                            soundEngine.playClick();
                          }}
                          className={`px-2.5 py-1 rounded-lg border-2 border-black font-mono text-xs font-black ${
                            streakThreshold === num ? 'bg-[#00E599] text-black shadow-[1px_1px_0px_#000000]' : 'bg-white text-black'
                          }`}
                        >
                          {num} Days
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Seal Style Selector */}
              <div className="space-y-1">
                <label className="font-mono font-black text-xs uppercase text-neutral-800">
                  Select Seal & Tamper Tape
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {SEAL_STYLES.map(seal => (
                    <button
                      key={seal.id}
                      type="button"
                      onClick={() => {
                        setSealStyle(seal.id);
                        soundEngine.playClick();
                      }}
                      className={`p-2 rounded-xl border-2 border-black font-mono text-[10px] font-black text-center transition-all cursor-pointer ${
                        sealStyle === seal.id
                          ? 'bg-black text-white shadow-[2px_2px_0px_#000000]'
                          : 'bg-white text-neutral-800 hover:bg-neutral-50'
                      }`}
                    >
                      <span className="block truncate">{seal.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Zero-Knowledge Security Notice & Confidential Message */}
              <div className="space-y-1.5">
                <div className="p-2.5 bg-neutral-100 border-2 border-black rounded-xl text-[10px] font-mono text-neutral-700 space-y-0.5">
                  <div className="font-black text-black flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5 text-black" />
                    <span>ZERO-KNOWLEDGE CIPHER ENCRYPTION</span>
                  </div>
                  <p>
                    Your message is encrypted client-side using a dynamic salted key before saving. Plaintext is never transmitted or stored on Google Firebase.
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <label className="font-mono font-black text-xs uppercase text-neutral-800">
                    Confidential Message To Future You
                  </label>
                  <span className="text-[10px] font-mono text-neutral-500 font-bold">
                    {messageText.length} chars
                  </span>
                </div>
                <textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Drop the brutal truth, the promise, or the reminder you will need to hear. Speak directly from your current frame of mind..."
                  rows={4}
                  className="w-full p-3 bg-white border-2 border-black rounded-xl font-mono text-xs text-black focus:outline-none focus:bg-[#FFFDF5] leading-relaxed resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-black/10">
                <button
                  type="button"
                  onClick={() => setCurrentTab('vault')}
                  className="py-2.5 px-4 bg-neutral-100 hover:bg-neutral-200 text-black font-mono text-xs font-black uppercase rounded-xl border-2 border-black cursor-pointer"
                >
                  CANCEL
                </button>

                <button
                  type="submit"
                  disabled={isSealing || !messageText.trim()}
                  className="py-2.5 px-6 bg-[#00E599] hover:bg-emerald-400 text-black font-display font-black text-xs uppercase rounded-xl border-3 border-black shadow-[3px_3px_0px_#000000] cursor-pointer flex items-center gap-2 active:scale-95 transition-all"
                >
                  <Lock className="w-4 h-4 stroke-[2.5]" />
                  <span>{isSealing ? 'ENCRYPTING & SEALING...' : 'ENCRYPT & SEAL CAPSULE'}</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: RELEASE / CRACK OPEN TYPEWRITER VIEW */}
          {currentTab === 'release' && (
            <div className="flex-1 overflow-y-auto space-y-4 py-2 text-center">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-[#00E599] border-3 border-black flex items-center justify-center shadow-[4px_4px_0px_#000000] animate-bounce">
                <Unlock className="w-8 h-8 text-black stroke-[2.5]" />
              </div>

              <div>
                <span className="px-2 py-0.5 rounded bg-black text-[#00E599] text-[10px] font-mono font-black uppercase">
                  TAMPER SEAL BROKEN • MESSAGE DECRYPTED
                </span>
                <h3 className="font-display font-black text-xl uppercase tracking-tight text-black mt-1">
                  {activeReleaseCapsule?.title || 'A Message From Your Past Self'}
                </h3>
                <span className="text-xs font-mono text-neutral-500">
                  Sealed on {activeReleaseCapsule?.createdDate || 'a previous high-momentum day'}
                </span>
              </div>

              {/* Typewriter Terminal Display */}
              <div className="p-4 sm:p-6 bg-black text-[#00E599] font-mono text-xs sm:text-sm rounded-2xl border-3 border-black shadow-[4px_4px_0px_#000000] text-left leading-relaxed min-h-[140px] whitespace-pre-wrap select-text">
                {displayedText}
                {isTyping && <span className="inline-block w-2 h-4 bg-[#00E599] ml-1 animate-pulse" />}
              </div>

              <div className="pt-2 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentTab('vault');
                    soundEngine.playClick();
                  }}
                  className="py-2.5 px-6 bg-[#FDC800] hover:bg-amber-400 text-black font-display font-black text-xs uppercase rounded-xl border-3 border-black shadow-[3px_3px_0px_#000000] cursor-pointer"
                >
                  RETURN TO VAULT
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
