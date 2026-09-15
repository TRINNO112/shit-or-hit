import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Lock,
  Unlock,
  Sparkles,
  Check,
  X,
  Clock,
  Calendar,
  Plus,
  Trash2,
  Hourglass,
  ChevronRight,
  Copy,
  Feather,
  Mail,
  Send,
  RotateCcw,
  Flame,
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

/* ------------------------------------------------------------------------
   Wax Seal Color Presets
------------------------------------------------------------------------- */
const WAX_SEAL_PALETTES = [
  { id: 'crimson', label: 'Imperial Crimson', color: '#B91C1C', light: '#FEE2E2', border: '#7F1D1D', desc: 'Courage & raw truth' },
  { id: 'navy', label: 'Royal Navy', color: '#1D4ED8', light: '#DBEAFE', border: '#1E3A8A', desc: 'Clarity & stoic resolve' },
  { id: 'emerald', label: 'Forest Emerald', color: '#059669', light: '#D1FAE5', border: '#065F46', desc: 'Growth & resurgence' },
  { id: 'amber', label: 'Vintage Amber', color: '#D97706', light: '#FEF3C7', border: '#92400E', desc: 'Wisdom & nostalgia' }
];

/* ------------------------------------------------------------------------
   Realistic SVG 3D Wax Seal Stamp Mark
------------------------------------------------------------------------- */
function WaxSealEmblem({ color = '#B91C1C', borderColor = '#7F1D1D', isBroken = false, size = 64 }) {
  // Sanitize color string so it forms a valid CSS/SVG ID selector without '#'
  const cleanId = 'waxGrad-' + (color || '').replace(/[^a-zA-Z0-9]/g, '');

  return (
    <div
      className="relative flex items-center justify-center shrink-0 select-none"
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_4px_6px_rgba(0,0,0,0.35)]">
        <defs>
          <radialGradient id={cleanId} cx="35%" cy="30%" r="65%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.45" />
            <stop offset="35%" stopColor={color} />
            <stop offset="85%" stopColor={borderColor} />
            <stop offset="100%" stopColor="#1C0505" />
          </radialGradient>
        </defs>

        {/* Outer melted organic rim */}
        <path
          d="M 50,5 C 65,4 82,12 88,24 C 95,36 98,54 93,68 C 88,82 76,94 60,96 C 44,98 28,95 16,84 C 4,73 2,56 6,40 C 10,24 25,6 50,5 Z"
          fill={`url(#${cleanId})`}
          stroke={borderColor}
          strokeWidth="2.5"
        />

        {/* Inner debossed stamped ring */}
        <circle
          cx="50"
          cy="50"
          r="30"
          fill="none"
          stroke={borderColor}
          strokeWidth="2"
          strokeDasharray={isBroken ? "6 3" : "none"}
          opacity="0.85"
        />

        {/* Center Insignia */}
        <g transform="translate(50, 50)" fill={borderColor}>
          {isBroken ? (
            <path
              d="M -16,-20 L 4,-4 L -4,6 L 16,22"
              stroke="#FFF"
              strokeWidth="3.5"
              strokeLinecap="round"
              fill="none"
            />
          ) : (
            <>
              <circle cx="0" cy="0" r="18" fill="rgba(0,0,0,0.2)" />
              {/* Monogram / Hourglass Icon */}
              <path
                d="M -7,-10 L 7,-10 L 1,-1 L 7,8 L -7,8 L -1,-1 Z"
                fill="#FFFFFF"
                opacity="0.9"
              />
              <circle cx="0" cy="0" r="1.5" fill="#FFFFFF" />
            </>
          )}
        </g>
      </svg>
    </div>
  );
}

/* ------------------------------------------------------------------------
   Main Component: Wax-Sealed Vintage Letter & Capsule Vault
------------------------------------------------------------------------- */
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

  // Form state
  const [title, setTitle] = useState('');
  const [messageText, setMessageText] = useState('');
  const [triggerType, setTriggerType] = useState('date'); // 'date' | 'slump' | 'streak'
  const [selectedPalette, setSelectedPalette] = useState('crimson');

  // Default target date: 30 days ahead
  const [targetDate, setTargetDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().slice(0, 10);
  });
  const [roughThreshold, setRoughThreshold] = useState(2);
  const [streakThreshold, setStreakThreshold] = useState(7);
  const [isSealing, setIsSealing] = useState(false);
  const [formError, setFormError] = useState('');

  // Release Typewriter State
  const [activeReleaseCapsule, setActiveReleaseCapsule] = useState(targetCapsule || null);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState(false);
  const typingIntervalRef = useRef(null);

  const refreshCapsules = () => {
    const list = getRansomCapsules();
    setCapsulesList(list);
  };

  useEffect(() => {
    return () => {
      if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
    };
  }, []);

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
    soundEngine?.playCapsuleUnlock?.();

    const unlocked = unlockRansomCapsule(cap.id);
    const fullMessage = unlocked?.decryptedMessage || cap.decryptedMessage || cap.message || "Remember who you are and rebuild.";

    if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
    setIsTyping(true);
    setDisplayedText('');
    let charIndex = 0;
    typingIntervalRef.current = setInterval(() => {
      if (charIndex < fullMessage.length) {
        setDisplayedText(fullMessage.slice(0, charIndex + 1));
        if (charIndex % 3 === 0) {
          soundEngine?.playTypewriterKey?.();
        }
        charIndex++;
      } else {
        clearInterval(typingIntervalRef.current);
        typingIntervalRef.current = null;
        setIsTyping(false);
        soundEngine?.playSuccessChime?.();
        refreshCapsules();
      }
    }, 24);
  };

  const handleSkipTyping = () => {
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
      typingIntervalRef.current = null;
    }
    const fullMessage = activeReleaseCapsule?.decryptedMessage || activeReleaseCapsule?.message || '';
    setDisplayedText(fullMessage);
    setIsTyping(false);
    soundEngine?.playClick?.();
  };

  const handleCopyLetter = () => {
    const text = activeReleaseCapsule?.decryptedMessage || activeReleaseCapsule?.message || displayedText;
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      setCopiedMessage(true);
      soundEngine?.playSuccessChime?.();
      setTimeout(() => setCopiedMessage(false), 2200);
    }).catch(() => {});
  };

  const handleCreateCapsule = (e) => {
    e.preventDefault();
    if (!messageText.trim()) {
      setFormError('Please write your letter to your future self before sealing.');
      return;
    }

    setIsSealing(true);
    soundEngine?.playClick?.();

    setTimeout(() => {
      try {
        const saved = saveRansomCapsule({
          title: title.trim() || 'Confidential Letter',
          message: messageText.trim(),
          triggerType,
          targetDate: triggerType === 'date' ? targetDate : null,
          roughDaysThreshold: triggerType === 'slump' ? roughThreshold : 2,
          streakThreshold: triggerType === 'streak' ? streakThreshold : 7,
          sealStyle: selectedPalette,
          date: activeDate,
          streak: activeStreak
        });

        soundEngine?.playCapsuleSeal?.();
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
        setFormError('Failed to seal dispatch. Please try again.');
      }
    }, 600);
  };

  const handleDeleteCapsule = (id, e) => {
    e.stopPropagation();
    if (window.confirm('Break and incinerate this sealed dispatch permanently? This cannot be undone.')) {
      deleteRansomCapsule(id);
      soundEngine?.playClick?.();
      refreshCapsules();
    }
  };

  const handleSetQuickDate = (daysAhead) => {
    soundEngine?.playClick?.();
    const d = new Date();
    d.setDate(d.getDate() + daysAhead);
    setTargetDate(d.toISOString().slice(0, 10));
  };

  if (!isOpen) return null;

  const sealedCount = capsulesList.filter(c => c.status === 'sealed').length;
  const unlockedCount = capsulesList.filter(c => c.status === 'unlocked').length;
  const currentPaletteObj = WAX_SEAL_PALETTES.find(p => p.id === selectedPalette) || WAX_SEAL_PALETTES[0];

  return (
    <div className="fixed inset-0 z-[85] bg-[#14110E]/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto" onClick={onClose}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Courier+Prime:ital,wght@0,400;0,700;1,400&family=Playfair+Display:ital,wght@0,700;0,900;1,700&display=swap');

        .vintage-parchment {
          background-color: #F8F3E6;
          background-image: radial-gradient(#E8DEC8 1px, transparent 1px);
          background-size: 16px 16px;
        }

        .vintage-lined-paper {
          background-color: #FFFDF8;
          background-image: repeating-linear-gradient(transparent, transparent 27px, #E5DCB8 28px);
          line-height: 28px;
        }

        .vintage-postal-border {
          background: repeating-linear-gradient(
            -45deg,
            #991B1B 0px,
            #991B1B 12px,
            #F8F3E6 12px,
            #F8F3E6 24px,
            #1E3A8A 24px,
            #1E3A8A 36px,
            #F8F3E6 36px,
            #F8F3E6 48px
          );
        }
      `}</style>

      <div
        className="w-full max-w-xl vintage-parchment rounded-3xl border-3 border-[#2E241E] shadow-[8px_8px_0px_#2E241E] p-4 sm:p-6 text-left max-h-[94vh] flex flex-col relative overflow-hidden text-[#2E241E]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Postal Airmail Ribbon Trim */}
        <div className="absolute top-0 left-0 right-0 h-3 vintage-postal-border border-b-2 border-[#2E241E]" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b-2 border-[#2E241E]/15 pb-3 shrink-0 mt-2">
          <div className="flex items-center gap-3">
            <WaxSealEmblem color={currentPaletteObj.color} borderColor={currentPaletteObj.border} size={44} />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-black text-lg sm:text-xl tracking-tight leading-none text-[#2E241E]">
                  Letters to Future You
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-[#2E241E] text-[#F8F3E6] text-[9px] font-mono font-bold tracking-wider uppercase">
                  Wax Sealed
                </span>
              </div>
              <span className="text-[11px] font-mono text-[#6E5B4B] block mt-0.5">
                P.O. Box Temporal • Unlocks on Milestones or Dark Slumps
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-[#EFE7D5] hover:bg-[#E2D6BF] border-2 border-[#2E241E] text-[#2E241E] cursor-pointer shadow-[2px_2px_0px_#2E241E] active:scale-95 transition-all"
            aria-label="Close"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Tab Navigation (Hidden in Release Mode) */}
        {currentTab !== 'release' && (
          <div className="flex items-center gap-2 bg-[#EFE8D6] p-1.5 rounded-2xl border-2 border-[#2E241E] shrink-0 mt-3">
            <button
              type="button"
              onClick={() => {
                setCurrentTab('vault');
                soundEngine?.playClick?.();
              }}
              className={`flex-1 py-2 px-3 rounded-xl border-2 border-[#2E241E] font-mono text-xs font-bold uppercase transition-all cursor-pointer flex items-center justify-center gap-2 ${
                currentTab === 'vault'
                  ? 'bg-[#2E241E] text-[#F8F3E6] shadow-[2px_2px_0px_#2E241E]'
                  : 'bg-[#FFFDF8] text-[#4E3F33] hover:bg-[#F3EFE2]'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Sealed Archive ({sealedCount})</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setCurrentTab('create');
                soundEngine?.playClick?.();
              }}
              className={`flex-1 py-2 px-3 rounded-xl border-2 border-[#2E241E] font-mono text-xs font-bold uppercase transition-all cursor-pointer flex items-center justify-center gap-2 ${
                currentTab === 'create'
                  ? 'bg-[#991B1B] text-[#FFFDF8] shadow-[2px_2px_0px_#2E241E]'
                  : 'bg-[#FFFDF8] text-[#4E3F33] hover:bg-[#F3EFE2]'
              }`}
            >
              <Feather className="w-3.5 h-3.5" />
              <span>Inscribe Letter</span>
            </button>
          </div>
        )}

        {/* -------------------------------------------------------------
            TAB 1: ARCHIVE GALLERY
        -------------------------------------------------------------- */}
        {currentTab === 'vault' && (
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 mt-3 min-h-0">
            {capsulesList.length === 0 ? (
              <div className="py-12 text-center border-2 border-dashed border-[#2E241E]/25 rounded-2xl p-6 bg-[#FFFDF8]/70 space-y-3">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-[#EFE8D6] border-2 border-[#2E241E] flex items-center justify-center shadow-[2px_2px_0px_#2E241E]">
                  <Mail className="w-6 h-6 text-[#991B1B]" />
                </div>
                <h4 className="font-serif font-black text-base text-[#2E241E]">
                  No Wax-Sealed Letters in Stasis
                </h4>
                <p className="font-mono text-xs text-[#6E5B4B] max-w-sm mx-auto leading-relaxed">
                  Pen an honest letter to your future self right now. Seal it with crimson wax until a future calendar date, or configure it to open automatically when you hit a slump!
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setCurrentTab('create');
                    soundEngine?.playClick?.();
                  }}
                  className="px-5 py-2.5 bg-[#991B1B] text-[#FFFDF8] font-mono font-bold text-xs uppercase rounded-xl border-2 border-[#2E241E] shadow-[3px_3px_0px_#2E241E] hover:bg-[#7F1D1D] active:scale-95 transition-all cursor-pointer"
                >
                  Inscribe First Dispatch
                </button>
              </div>
            ) : (
              capsulesList.map((cap) => {
                const isUnlocked = cap.status === 'unlocked';
                const palette = WAX_SEAL_PALETTES.find(p => p.id === cap.sealStyle) || WAX_SEAL_PALETTES[0];

                return (
                  <div
                    key={cap.id}
                    onClick={() => {
                      if (isUnlocked) {
                        triggerRelease(cap);
                      }
                    }}
                    className={`p-4 rounded-2xl border-2 border-[#2E241E] shadow-[3px_3px_0px_#2E241E] transition-all bg-[#FFFDF8] relative overflow-hidden ${
                      isUnlocked ? 'cursor-pointer hover:bg-[#FEFCE8]' : 'opacity-95'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <WaxSealEmblem color={palette.color} borderColor={palette.border} isBroken={isUnlocked} size={48} />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-serif font-bold text-sm text-[#2E241E]">
                              {cap.title || 'Untitled Letter'}
                            </h4>
                            <span
                              className={`text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded-full border border-[#2E241E] ${
                                isUnlocked ? 'bg-[#D1FAE5] text-[#065F46]' : 'bg-[#EFE8D6] text-[#4E3F33]'
                              }`}
                            >
                              {isUnlocked ? 'Unsealed' : 'Wax Stasis'}
                            </span>
                          </div>

                          <div className="text-[11px] font-mono text-[#6E5B4B] mt-1 space-y-0.5">
                            <div>Inscribed: {cap.createdDate || cap.createdAt?.slice(0, 10)}</div>
                            {cap.triggerType === 'date' && cap.targetDate && (
                              <div className="text-[#991B1B] font-bold">
                                ⏳ Opens: {cap.targetDate}
                              </div>
                            )}
                            {cap.triggerType === 'slump' && (
                              <div className="text-[#B45309] font-bold">
                                🩸 Tripwire: Triggers upon {cap.roughDaysThreshold || 2} rough days
                              </div>
                            )}
                            {cap.triggerType === 'streak' && (
                              <div className="text-[#065F46] font-bold">
                                ⚡ Reward: Unlocks at {cap.streakThreshold || 7}-day streak
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {isUnlocked ? (
                          <span className="text-xs font-mono font-bold text-[#065F46] flex items-center gap-1 bg-[#D1FAE5] px-2.5 py-1 rounded-lg border border-[#065F46]">
                            Read Dispatch <ChevronRight className="w-3.5 h-3.5" />
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              triggerRelease(cap);
                            }}
                            className="text-[10px] font-mono font-bold text-[#991B1B] hover:text-[#7F1D1D] bg-[#FEE2E2] px-2 py-1 rounded-lg border border-[#991B1B] cursor-pointer"
                            title="Emergency Break Seal"
                          >
                            Break Seal Early
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={(e) => handleDeleteCapsule(cap.id, e)}
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-red-700 hover:bg-neutral-100 transition-colors cursor-pointer"
                          title="Burn Dispatch"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* -------------------------------------------------------------
            TAB 2: INSCRIBE VINTAGE LETTER
        -------------------------------------------------------------- */}
        {currentTab === 'create' && (
          <form onSubmit={handleCreateCapsule} className="flex-1 overflow-y-auto space-y-4 pr-1 mt-3 min-h-0">
            {formError && (
              <div className="p-2.5 bg-red-100 border-2 border-red-800 text-red-900 rounded-xl text-xs font-mono font-bold">
                {formError}
              </div>
            )}

            {/* Letter Title */}
            <div>
              <label className="block text-[11px] font-mono font-bold text-[#6E5B4B] uppercase mb-1">
                Dispatch Subject / Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Read This When You Feel Like Quitting"
                className="w-full py-2 px-3 rounded-xl border-2 border-[#2E241E] bg-[#FFFDF8] font-serif font-bold text-sm text-[#2E241E] placeholder:text-[#9E8B7A] focus:outline-none focus:ring-2 focus:ring-[#991B1B]"
                maxLength={60}
              />
            </div>

            {/* Parchment Writing Area */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-mono font-bold text-[#6E5B4B] uppercase">
                  Confidential Message To Future Self
                </label>
                <span className="text-[10px] font-mono text-[#9E8B7A]">
                  {messageText.length} characters
                </span>
              </div>
              <div className="border-2 border-[#2E241E] rounded-2xl overflow-hidden bg-[#FFFDF8] shadow-[2px_2px_0px_#2E241E]">
                <div className="p-3 bg-[#EFE8D6] border-b-2 border-[#2E241E]/15 text-[11px] font-mono font-bold text-[#6E5B4B] flex items-center justify-between">
                  <span>DEAR FUTURE SELF,</span>
                  <span>{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
                <textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Write from the heart. What must you remember? What standards are non-negotiable? How do you recover when you stumble?"
                  rows={6}
                  className="w-full p-3 bg-[#FFFDF8] font-mono text-xs text-[#2E241E] placeholder:text-[#9E8B7A] focus:outline-none resize-none leading-relaxed"
                />
              </div>
            </div>

            {/* Trigger Configuration */}
            <div>
              <label className="block text-[11px] font-mono font-bold text-[#6E5B4B] uppercase mb-1.5">
                When Shall The Wax Seal Break?
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setTriggerType('date');
                    soundEngine?.playClick?.();
                  }}
                  className={`p-2.5 rounded-xl border-2 border-[#2E241E] text-left transition-all cursor-pointer ${
                    triggerType === 'date'
                      ? 'bg-[#2E241E] text-[#FFFDF8] shadow-[2px_2px_0px_#2E241E]'
                      : 'bg-[#FFFDF8] text-[#2E241E] hover:bg-[#F3EFE2]'
                  }`}
                >
                  <div className="font-mono text-xs font-bold uppercase">Calendar Date</div>
                  <div className="text-[10px] font-mono opacity-80 mt-0.5">Specific future day</div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setTriggerType('slump');
                    soundEngine?.playClick?.();
                  }}
                  className={`p-2.5 rounded-xl border-2 border-[#2E241E] text-left transition-all cursor-pointer ${
                    triggerType === 'slump'
                      ? 'bg-[#991B1B] text-[#FFFDF8] shadow-[2px_2px_0px_#2E241E]'
                      : 'bg-[#FFFDF8] text-[#2E241E] hover:bg-[#F3EFE2]'
                  }`}
                >
                  <div className="font-mono text-xs font-bold uppercase">S.O.S. Dark Slump</div>
                  <div className="text-[10px] font-mono opacity-80 mt-0.5">Consecutive rough days</div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setTriggerType('streak');
                    soundEngine?.playClick?.();
                  }}
                  className={`p-2.5 rounded-xl border-2 border-[#2E241E] text-left transition-all cursor-pointer ${
                    triggerType === 'streak'
                      ? 'bg-[#065F46] text-[#FFFDF8] shadow-[2px_2px_0px_#2E241E]'
                      : 'bg-[#FFFDF8] text-[#2E241E] hover:bg-[#F3EFE2]'
                  }`}
                >
                  <div className="font-mono text-xs font-bold uppercase">Peak Milestone</div>
                  <div className="text-[10px] font-mono opacity-80 mt-0.5">Hitting a streak target</div>
                </button>
              </div>

              {/* Dynamic trigger details */}
              <div className="mt-2.5 p-3 rounded-xl bg-[#EFE8D6] border-2 border-[#2E241E]">
                {triggerType === 'date' && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="date"
                        value={targetDate}
                        onChange={(e) => setTargetDate(e.target.value)}
                        className="py-1.5 px-3 rounded-lg border-2 border-[#2E241E] bg-[#FFFDF8] font-mono text-xs text-[#2E241E]"
                      />
                      <span className="text-[11px] font-mono text-[#6E5B4B]">
                        Unlock Target
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <button
                        type="button"
                        onClick={() => handleSetQuickDate(7)}
                        className="px-2.5 py-1 rounded bg-[#FFFDF8] border border-[#2E241E] text-[10px] font-mono font-bold hover:bg-[#F4ECD8]"
                      >
                        +7 Days
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSetQuickDate(30)}
                        className="px-2.5 py-1 rounded bg-[#FFFDF8] border border-[#2E241E] text-[10px] font-mono font-bold hover:bg-[#F4ECD8]"
                      >
                        +30 Days
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSetQuickDate(90)}
                        className="px-2.5 py-1 rounded bg-[#FFFDF8] border border-[#2E241E] text-[10px] font-mono font-bold hover:bg-[#F4ECD8]"
                      >
                        +90 Days
                      </button>
                    </div>
                  </div>
                )}

                {triggerType === 'slump' && (
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-mono font-bold text-[#2E241E]">
                      Auto-unseal upon rough days:
                    </span>
                    <div className="flex items-center gap-2">
                      {[2, 3, 4].map(num => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setRoughThreshold(num)}
                          className={`w-8 h-8 rounded-lg border-2 border-[#2E241E] font-mono font-bold text-xs ${
                            roughThreshold === num ? 'bg-[#991B1B] text-white shadow-[1.5px_1.5px_0px_#2E241E]' : 'bg-[#FFFDF8]'
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {triggerType === 'streak' && (
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-mono font-bold text-[#2E241E]">
                      Unlock upon reaching streak:
                    </span>
                    <div className="flex items-center gap-2">
                      {[7, 14, 21, 30].map(days => (
                        <button
                          key={days}
                          type="button"
                          onClick={() => setStreakThreshold(days)}
                          className={`px-2.5 py-1 rounded-lg border-2 border-[#2E241E] font-mono font-bold text-xs ${
                            streakThreshold === days ? 'bg-[#065F46] text-white shadow-[1.5px_1.5px_0px_#2E241E]' : 'bg-[#FFFDF8]'
                          }`}
                        >
                          {days}d
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Wax Palette Selector with Live Seal Preview */}
            <div className="p-3 bg-[#EFE8D6] rounded-2xl border-2 border-[#2E241E] space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-[11px] font-mono font-bold text-[#6E5B4B] uppercase">
                    Wax Seal Color Impression
                  </label>
                  <span className="text-xs font-serif font-bold text-[#2E241E]">
                    Selected: {currentPaletteObj.label}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <WaxSealEmblem color={currentPaletteObj.color} borderColor={currentPaletteObj.border} size={48} />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {WAX_SEAL_PALETTES.map(pal => (
                  <button
                    key={pal.id}
                    type="button"
                    onClick={() => {
                      setSelectedPalette(pal.id);
                      soundEngine?.playClick?.();
                    }}
                    className={`p-2 rounded-xl border-2 border-[#2E241E] flex items-center gap-2 text-left cursor-pointer transition-all ${
                      selectedPalette === pal.id ? 'bg-[#2E241E] text-[#FFFDF8] shadow-[2px_2px_0px_#2E241E]' : 'bg-[#FFFDF8] text-[#2E241E] hover:bg-[#FAF6ED]'
                    }`}
                  >
                    <span className="w-4 h-4 rounded-full border border-[#2E241E] shrink-0" style={{ background: pal.color }} />
                    <span className="text-[10px] font-mono font-bold truncate">{pal.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Seal Action Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSealing}
                style={{ background: currentPaletteObj.color }}
                className="w-full py-3 px-4 text-[#FFFDF8] font-mono font-black text-sm uppercase tracking-wider rounded-xl border-2 border-[#2E241E] shadow-[4px_4px_0px_#2E241E] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_#2E241E] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Flame className="w-4 h-4 text-[#FDE047]" />
                <span>{isSealing ? `Melting ${currentPaletteObj.label} Wax...` : `Stamp & Melt ${currentPaletteObj.label} Wax Seal`}</span>
              </button>
            </div>
          </form>
        )}

        {/* -------------------------------------------------------------
            TAB 3: RELEASE & UNSEALED DISPATCH
        -------------------------------------------------------------- */}
        {currentTab === 'release' && (() => {
          const releasePalette = WAX_SEAL_PALETTES.find(p => p.id === activeReleaseCapsule?.sealStyle) || currentPaletteObj;

          return (
            <div className="flex-1 overflow-y-auto space-y-4 pr-1 mt-3 min-h-0 flex flex-col">
              {/* Wax Broken Stamp Hero */}
              <div className="text-center py-2 shrink-0">
                <div className="inline-block relative">
                  <WaxSealEmblem color={releasePalette.color} borderColor={releasePalette.border} isBroken={true} size={64} />
                </div>
                <h4
                  className="font-serif font-black text-base uppercase mt-1 tracking-tight"
                  style={{ color: releasePalette.color }}
                >
                  Wax Seal Broken • Dispatch In Stasis Delivered
                </h4>
                <div className="text-[11px] font-mono text-[#6E5B4B]">
                  Inscribed on: {activeReleaseCapsule?.createdDate || activeReleaseCapsule?.createdAt?.slice(0, 10)}
                </div>
              </div>

              {/* Vintage Typewriter Letter */}
              <div className="vintage-lined-paper border-2 border-[#2E241E] rounded-2xl p-4 sm:p-5 shadow-[3px_3px_0px_#2E241E] relative flex-1 min-h-[160px]">
                <div className="font-mono text-xs sm:text-sm text-[#2E241E] whitespace-pre-wrap leading-[28px] font-bold">
                  {displayedText}
                  {isTyping && (
                    <span
                      className="inline-block w-2 h-4 ml-1 animate-pulse"
                      style={{ background: releasePalette.color }}
                    />
                  )}
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2 pt-1 shrink-0 flex-wrap sm:flex-nowrap">
                {isTyping ? (
                  <button
                    type="button"
                    onClick={handleSkipTyping}
                    className="w-full py-2.5 px-4 bg-[#EFE8D6] hover:bg-[#E2D6BF] border-2 border-[#2E241E] rounded-xl font-mono text-xs font-bold uppercase shadow-[2px_2px_0px_#2E241E] cursor-pointer"
                  >
                    Skip Typewriter Animation
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={handleCopyLetter}
                      className="flex-1 py-2.5 px-4 bg-[#FFFDF8] hover:bg-[#F3EFE2] border-2 border-[#2E241E] rounded-xl font-mono text-xs font-bold uppercase shadow-[2px_2px_0px_#2E241E] cursor-pointer flex items-center justify-center gap-2"
                    >
                      {copiedMessage ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedMessage ? 'Letter Copied!' : 'Copy Letter'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setCurrentTab('vault');
                        soundEngine?.playClick?.();
                      }}
                      className="flex-1 py-2.5 px-4 bg-[#2E241E] text-[#FFFDF8] hover:bg-[#4E3F33] border-2 border-[#2E241E] rounded-xl font-mono text-xs font-bold uppercase shadow-[2px_2px_0px_#2E241E] cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Mail className="w-4 h-4" />
                      <span>Return to Archive</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
