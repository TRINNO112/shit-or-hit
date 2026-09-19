import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertCircle, 
  CloudRain, 
  MinusCircle, 
  Zap, 
  Sparkles, 
  Check, 
  PenLine, 
  X,
  Wand2,
  Loader2,
  Undo2,
  Redo2,
  RotateCcw,
  Target,
  ShieldCheck,
  ListOrdered,
  Terminal,
  HelpCircle,
  BookOpen,
  Printer,
  AlertOctagon,
  Layers,
  ChevronDown,
  ChevronUp,
  Wind,
  Heart,
  Shield,
  Compass,
  Sun,
  Coffee,
  Droplets,
  Footprints,
  Moon,
  PhoneOff,
  ArrowRight
} from 'lucide-react';
import { 
  ratingMeta, 
  enhanceReflectionWithAI,
  isSphereModeEnabled,
  getSphereConfig,
  calculateCompositeScore,
  isRansomCapsuleEnabled,
  isAutopsyChamberEnabled,
  isReceiptOfTruthEnabled,
  getActiveSealedCapsule,
  checkCapsuleUnlockConditions,
  calculateStreak,
  isRehabilitationActive,
  isAutoSanctuaryAssumed,
  getRehabilitationConfig,
  exitRehabilitation,
  activateSabbatical,
  activateRehabilitation
} from '../services/api';
import MoodReactionBanner from './MoodReactionBanner';
import MagneticButton from './MagneticButton';
import confetti from 'canvas-confetti';
import SphereIcon from './SphereIcon';
import AutoExpandTextarea from './AutoExpandTextarea';
import NonNegotiableCard, { isNonNegotiablesActive, getNonNegotiablesMode } from './NonNegotiableCard';
import { soundEngine } from '../services/soundEngine';
import AIDirectivesModal, { DIRECTIVES } from './AIDirectivesModal';
import { AutopsyBadge } from './AutopsyBadge';

const RansomCapsuleModal = lazy(() => import('./RansomCapsuleModal'));
const AutopsyChamberModal = lazy(() => import('./AutopsyChamberModal'));
const ReceiptOfTruthModal = lazy(() => import('./ReceiptOfTruthModal'));

const IconMap = {
  AlertCircle,
  CloudRain,
  MinusCircle,
  Zap,
  Sparkles
};

// 100% Normalized 10-Point Solid Closed SVG Paths for Flawless Liquid Morphing
const moodSvgPaths = {
  // 1: Rough — Stoic Diamond-Shield
  1: "M12,2 L17,6 L21,11 L20,17 L16,21 L12,22 L8,21 L4,17 L3,11 L7,6 Z",
  // 2: Down — Melancholy Teardrop
  2: "M12,2 L14.5,6.5 L17.5,11 L18.5,15.5 L16.5,19.5 L12,22 L7.5,19.5 L5.5,15.5 L6.5,11 L9.5,6.5 Z",
  // 3: Okay — Smooth Equilibrium Octagon / Circle
  3: "M12,2 L18.5,4.5 L22,10 L22,16 L18.5,21.5 L12,22 L5.5,21.5 L2,16 L2,10 L5.5,4.5 Z",
  // 4: Good — High Current 4-Point Spark
  4: "M12,2 L14,8.5 L21,9 L15.5,14 L17.5,21 L12,16.5 L6.5,21 L8.5,14 L3,9 L10,8.5 Z",
  // 5: Peak — Radiant 5-Point Apex Star
  5: "M12,1.5 L15,8 L22,8.5 L16.5,13.5 L18.5,20.5 L12,16.5 L5.5,20.5 L7.5,13.5 L2,8.5 L9,8 Z"
};

export default function TodayHero({ 
  todayStr, 
  currentEntry, 
  todayEntry,
  onSaveToday, 
  onSave,
  dayCount,
  onOpenWallpaper,
  sphereSettingsVer = 0,
  onOpenRehab
}) {
  const activeEntry = currentEntry || todayEntry || null;
  const saveHandler = onSaveToday || onSave || (() => Promise.resolve());

  const [sphereModeActive, setSphereModeActive] = useState(false);
  const [activeSpheresConfig, setActiveSpheresConfig] = useState([]);
  const [spheresData, setSpheresData] = useState({});
  const [expandedSphereNotes, setExpandedSphereNotes] = useState({});

  const [showNote, setShowNote] = useState(Boolean(activeEntry?.notes));
  const [noteText, setNoteText] = useState(activeEntry?.notes || '');
  const [syncedBadge, setSyncedBadge] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [sadSettle, setSadSettle] = useState(false);
  
  // Behavioral Trilogy Modal States
  const [isCapsuleModalOpen, setIsCapsuleModalOpen] = useState(false);
  const [isAutopsyModalOpen, setIsAutopsyModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  
  // History stack for Undo / Redo / Revert to Original
  const [historyStack, setHistoryStack] = useState([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const [originalDraft, setOriginalDraft] = useState('');

  // 🌿 Somatic Care & Breathing Pacer State for Sanctuary Mode
  const [breathActive, setBreathActive] = useState(false);
  const [breathPhase, setBreathPhase] = useState('Inhale');
  const [somaticCare, setSomaticCare] = useState({
    water: false,
    walk: false,
    rest: false,
    screens: false
  });

  // 4s Inhale - 2s Hold - 6s Long Exhale vagal calming cycle
  useEffect(() => {
    if (!breathActive) {
      setBreathPhase('Inhale');
      return;
    }
    let t1, t2, t3;
    const runCycle = () => {
      setBreathPhase('Inhale (4s)');
      t1 = setTimeout(() => {
        setBreathPhase('Hold (2s)');
        t2 = setTimeout(() => {
          setBreathPhase('Long Exhale (6s)');
          t3 = setTimeout(() => {
            runCycle();
          }, 6000);
        }, 2000);
      }, 4000);
    };
    runCycle();
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [breathActive]);
  useEffect(() => {
    const isEnabled = isSphereModeEnabled();
    setSphereModeActive(isEnabled);
    const cfg = getSphereConfig().filter(s => s.enabled);
    setActiveSpheresConfig(cfg);

    // Populate spheres data from existing entry or fresh defaults
    const initialSpheres = {};
    cfg.forEach(s => {
      initialSpheres[s.id] = {
        id: s.id,
        name: s.name,
        icon: s.icon,
        color: s.color,
        rating: activeEntry?.spheres?.[s.id]?.rating || null,
        notes: activeEntry?.spheres?.[s.id]?.notes || ''
      };
    });
    setSpheresData(initialSpheres);

    const draftKey = `daily_verdict_draft_notes_${todayStr}`;
    const savedDraft = typeof window !== 'undefined' ? sessionStorage.getItem(draftKey) : null;

    if (activeEntry?.notes !== undefined) {
      const initialText = activeEntry.notes || savedDraft || '';
      setNoteText(initialText);
      setOriginalDraft(initialText);
      setHistoryStack([initialText]);
      setHistoryIdx(0);
      if (initialText) setShowNote(true);
    } else if (savedDraft) {
      setNoteText(savedDraft);
      setShowNote(true);
    }
  }, [activeEntry, sphereSettingsVer, todayStr]);

  // Auto-debounce note draft into sessionStorage to protect thoughts from accidental tab closes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const draftKey = `daily_verdict_draft_notes_${todayStr}`;
    const timeout = setTimeout(() => {
      if (noteText && (!activeEntry?.notes || noteText !== activeEntry.notes)) {
        sessionStorage.setItem(draftKey, noteText);
      } else if (!noteText) {
        sessionStorage.removeItem(draftKey);
      }
    }, 400);
    return () => clearTimeout(timeout);
  }, [noteText, todayStr, activeEntry]);

  const selectedRating = activeEntry?.rating || null;
  const activeRatingForVisual = selectedRating || 3;
  const compositeStats = sphereModeActive ? calculateCompositeScore(spheresData) : null;

  const now = new Date();
  const dayName = now.toLocaleDateString('en-US', { weekday: 'long' });
  const fullDate = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  const triggerRatingExpression = (val, originY = 0.6) => {
    if (val >= 4) {
      soundEngine.playSuccessChime();
    } else if (val <= 2) {
      soundEngine.playRoughTone();
    } else {
      soundEngine.playClick();
    }

    if (val === 5) {
      // 5★ Peak: Golden & Emerald Mega Burst
      confetti({
        particleCount: 75,
        spread: 70,
        origin: { y: originY },
        colors: ['#FDC800', '#00E599', '#000000', '#FFFFFF']
      });
    } else if (val === 4) {
      // 4★ Good: Emerald Flow Surge
      confetti({
        particleCount: 40,
        spread: 55,
        origin: { y: originY },
        colors: ['#00E599', '#FDC800', '#000000']
      });
    } else if (val === 3) {
      // 3★ Okay: Balanced Equilibrium Lock (Zero confetti, tactile focus)
      setSadSettle(false);
    } else if (val === 2) {
      // 2★ Down: Sombre low-energy settle (Zero confetti)
      setSadSettle(true);
      setTimeout(() => setSadSettle(false), 900);
    } else if (val === 1) {
      // 1★ Rough: Visceral Screen Shudder & Glitch Rumble (Zero confetti)
      setSadSettle(true);
      setTimeout(() => setSadSettle(false), 1100);
    }
  };

  const isAnchorsActive = typeof window !== 'undefined' && isNonNegotiablesActive();
  const anchorsMode = typeof window !== 'undefined' ? getNonNegotiablesMode() : 'checklist';
  const isDeterministicTaskLocked = isAnchorsActive && anchorsMode === 'deterministic_100';

  const handleRate = async (val, e) => {
    // 🛡️ Enforce Deterministic 100% Task Engine Lock:
    if (isDeterministicTaskLocked) {
      soundEngine.playRoughTone();
      alert("🔒 Deterministic 100% Mode Active: Your day rating is automatically governed by your completed habit tasks below. Check off your tasks to update your rating!");
      return;
    }

    triggerRatingExpression(val, 0.6);

    setSyncedBadge(true);
    if (saveHandler) {
      await saveHandler({
        date: todayStr,
        rating: val,
        verdict: ratingMeta[val]?.title || 'Verdict',
        notes: noteText || activeEntry?.notes || '',
        spheres: sphereModeActive ? spheresData : undefined,
        calculatedScore: sphereModeActive ? activeEntry?.calculatedScore : undefined,
        autopsy: activeEntry?.autopsy
      });
    }
    setTimeout(() => setSyncedBadge(false), 2500);

    // 🩸 Down-Bad Ransom Capsule Trigger (5★ Peak)
    if (val === 5 && isRansomCapsuleEnabled()) {
      setTimeout(() => {
        setIsCapsuleModalOpen(true);
      }, 700);
    } 
    // 📉 The Autopsy Chamber Trigger (1★ or 2★)
    else if (val <= 2 && isAutopsyChamberEnabled()) {
      setTimeout(() => {
        setIsAutopsyModalOpen(true);
      }, 700);
    }
  };

  const handleSaveAutopsy = async (autopsyData) => {
    if (saveHandler) {
      await saveHandler({
        date: todayStr,
        rating: selectedRating || activeEntry?.rating || 1,
        verdict: activeEntry?.verdict || ratingMeta[selectedRating || 1]?.title || 'Verdict',
        notes: noteText,
        spheres: sphereModeActive ? spheresData : undefined,
        calculatedScore: sphereModeActive ? activeEntry?.calculatedScore : undefined,
        autopsy: autopsyData
      });
    }
  };

  const handleAnchorScoreUpdate = async (scoreInfo) => {
    if (!scoreInfo) return;
    if (scoreInfo.mode === 'deterministic_100') {
      const roundedRating = Math.max(1, Math.min(5, Math.round(scoreInfo.calculatedRating) || 1));
      if (saveHandler) {
        await saveHandler({
          date: todayStr,
          rating: roundedRating,
          verdict: ratingMeta[roundedRating]?.title || 'Verdict',
          notes: noteText,
          calculatedScore: scoreInfo.calculatedRating,
          spheres: sphereModeActive ? spheresData : undefined
        });
      }
    } else if (scoreInfo.mode === 'hybrid_50_50' && selectedRating) {
      const blended = Number(((0.5 * selectedRating) + (0.5 * scoreInfo.calculatedRating)).toFixed(1));
      const roundedRating = Math.max(1, Math.min(5, Math.round(blended) || 1));
      if (saveHandler) {
        await saveHandler({
          date: todayStr,
          rating: roundedRating,
          verdict: ratingMeta[roundedRating]?.title || 'Verdict',
          notes: noteText,
          calculatedScore: blended,
          spheres: sphereModeActive ? spheresData : undefined
        });
      }
    }
  };

  const handleRateSphere = async (sphereId, val) => {
    const updatedSpheres = {
      ...spheresData,
      [sphereId]: {
        ...(spheresData[sphereId] || {}),
        id: sphereId,
        rating: val
      }
    };
    setSpheresData(updatedSpheres);

    triggerRatingExpression(val, 0.7);

    const comp = calculateCompositeScore(updatedSpheres);
    const finalRating = comp ? comp.rating : (selectedRating || val);
    const finalVerdict = comp ? comp.verdict : (ratingMeta[val]?.title || 'Verdict');

    setSyncedBadge(true);
    if (saveHandler) {
      await saveHandler({
        date: todayStr,
        rating: finalRating,
        verdict: finalVerdict,
        notes: noteText,
        spheres: updatedSpheres,
        calculatedScore: comp?.score
      });
    }
    setTimeout(() => setSyncedBadge(false), 2500);
  };

  const handleSphereNoteChange = (sphereId, text) => {
    setSpheresData(prev => ({
      ...prev,
      [sphereId]: {
        ...(prev[sphereId] || {}),
        id: sphereId,
        notes: text
      }
    }));
  };

  const handleSphereNoteBlur = async (sphereId, text) => {
    const updatedSpheres = {
      ...spheresData,
      [sphereId]: {
        ...(spheresData[sphereId] || {}),
        id: sphereId,
        notes: text
      }
    };
    setSpheresData(updatedSpheres);
    const comp = calculateCompositeScore(updatedSpheres);
    const ratingToUse = comp ? comp.rating : (selectedRating || 3);
    const verdictToUse = comp ? comp.verdict : (ratingMeta[ratingToUse]?.title || 'Verdict');
    
    if (saveHandler) {
      await saveHandler({
        date: todayStr,
        rating: ratingToUse,
        verdict: verdictToUse,
        notes: noteText,
        spheres: updatedSpheres,
        calculatedScore: comp?.score
      });
      setSyncedBadge(true);
      setTimeout(() => setSyncedBadge(false), 2000);
    }
  };

  const toggleSphereNote = (sphereId) => {
    setExpandedSphereNotes(prev => ({
      ...prev,
      [sphereId]: !prev[sphereId]
    }));
  };

  const handleSaveNote = async () => {
    const comp = calculateCompositeScore(spheresData);
    const ratingToUse = comp ? comp.rating : (selectedRating || 3);
    const verdictToUse = comp ? comp.verdict : (ratingMeta[ratingToUse]?.title || 'Verdict');
    
    if (saveHandler) {
      await saveHandler({
        date: todayStr,
        rating: ratingToUse,
        verdict: verdictToUse,
        notes: noteText,
        spheres: spheresData,
        calculatedScore: comp?.score
      });
    }
    setSyncedBadge(true);
    setTimeout(() => setSyncedBadge(false), 2500);
  };

  const handleNoteChange = (newVal) => {
    setNoteText(newVal);
  };

  const handleAIEnhance = async (overridePrompt = null) => {
    const hasSphereNotes = Object.values(spheresData).some(s => s.notes && s.notes.trim());
    if ((!noteText || noteText.trim() === '') && !hasSphereNotes) return;
    
    // Pull active preferences directly from SettingsModal / localStorage
    const savedDirective = localStorage.getItem('daily_verdict_default_directive') || 'auto';
    const savedCustomPrompt = localStorage.getItem('daily_verdict_custom_prompt') || '';
    
    const currentVal = noteText;
    const foundPreset = DIRECTIVES.find(d => d.id === savedDirective);
    const activePrompt = overridePrompt || (savedCustomPrompt ? savedCustomPrompt : (foundPreset ? foundPreset.instruction : null));
    setIsEnhancing(true);
    try {
      const enhanced = await enhanceReflectionWithAI(
        currentVal, 
        compositeStats?.rating || selectedRating || 3, 
        todayStr,
        sphereModeActive ? spheresData : null,
        activePrompt
      );
      
      const newStack = historyStack.slice(0, historyIdx + 1);
      newStack.push(enhanced);
      setHistoryStack(newStack);
      setHistoryIdx(newStack.length - 1);
      setNoteText(enhanced);
      setShowNote(true);
      soundEngine.playSuccessChime();
    } catch (err) {
      console.error('AI Enhance error:', err);
      soundEngine.playRoughTone();
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleUndo = () => {
    if (historyIdx > 0) {
      const target = historyIdx - 1;
      setHistoryIdx(target);
      setNoteText(historyStack[target]);
    }
  };

  const handleRedo = () => {
    if (historyIdx < historyStack.length - 1) {
      const target = historyIdx + 1;
      setHistoryIdx(target);
      setNoteText(historyStack[target]);
    }
  };

  const handleRevertOriginal = () => {
    if (originalDraft !== undefined) {
      setNoteText(originalDraft);
      const newStack = [...historyStack, originalDraft];
      setHistoryStack(newStack);
      setHistoryIdx(newStack.length - 1);
    }
  };

  const isDemoSabbatical = typeof window !== 'undefined' && window.location.search.includes('demo=sabbatical');
  const isDemoSanctuary = typeof window !== 'undefined' && (window.location.search.includes('demo=sanctuary') || window.location.search.includes('demo=rehab'));
  const rehabConfig = getRehabilitationConfig();
  const isLiveSanctuary = isRehabilitationActive(todayStr);
  const isSanctuaryActive = isLiveSanctuary || isDemoSanctuary || isDemoSabbatical;
  const isSabbatical = isDemoSabbatical || Boolean(rehabConfig?.isSabbatical);

  const freezeDays = rehabConfig?.freezeDays || 7;
  const startDate = rehabConfig?.startDate || todayStr;
  const startMs = new Date(startDate).getTime();
  const todayMs = new Date(todayStr).getTime();
  const daysIn = Math.max(1, Math.floor((todayMs - startMs) / (1000 * 60 * 60 * 24)) + 1);

  const handleExitSanctuary = () => {
    try { soundEngine.playSuccessChime(); } catch (e) {}
    exitRehabilitation();
    if (typeof window !== 'undefined') {
      if (window.location.search.includes('demo=')) {
        window.history.replaceState(null, '', '/');
      }
      window.location.reload();
    }
  };

  const handleActivateSabbatical = () => {
    try { soundEngine.playClick(); } catch (e) {}
    activateSabbatical();
    if (typeof window !== 'undefined') {
      if (window.location.search.includes('demo=')) {
        window.history.replaceState(null, '', '/?demo=sabbatical');
      }
      window.location.reload();
    }
  };

  const handleActivate7Day = () => {
    try { soundEngine.playClick(); } catch (e) {}
    activateRehabilitation(7);
    if (typeof window !== 'undefined') {
      if (window.location.search.includes('demo=')) {
        window.history.replaceState(null, '', '/?demo=sanctuary');
      }
      window.location.reload();
    }
  };

  // =========================================================================
  // 🌿 TOTAL DESIGN OVERHAUL: DEDICATED SANCTUARY & GRAND SABBATICAL HERO DECK
  // =========================================================================
  // =========================================================================
  // 🌿 1. REHABILITATION SANCTUARY DECK (Acute Nervous System Recovery & Rest)
  // =========================================================================
  if (isSanctuaryActive && !isSabbatical) {
    const nourishedCount = Object.values(somaticCare).filter(Boolean).length;
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="neo-card w-full mb-8 relative overflow-hidden border-3 border-black shadow-[8px_8px_0px_#000000] bg-linear-to-br from-[#F4FAF6] via-[#EDF7F1] to-[#E5F2EA] rounded-4xl p-6 sm:p-8 md:p-10"
      >
        {/* Subtle Ambient Zen Glow Background Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[#00E599]/12 blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-[#FDC800]/10 blur-3xl pointer-events-none -ml-20 -mb-20" />

        {/* Top Serenity Architectural Header Strip */}
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b-2 border-black/15">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-black text-white font-mono text-xs font-black shadow-[2px_2px_0px_#000000]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00E599] animate-ping" />
              <span className="tracking-wider">{isSabbatical ? 'GRAND SABBATICAL' : 'TRANQUILITY SANCTUARY'}</span>
            </div>

            <span className="px-3.5 py-1.5 rounded-full border-2 border-black font-mono text-xs font-black uppercase bg-[#00E599] text-black shadow-[2px_2px_0px_#000000]">
              DAY {daysIn} OF {freezeDays} • STREAK SHIELDED & FROZEN
            </span>

            <span className="text-xs font-mono font-bold text-neutral-600 hidden lg:inline">
              DAY {dayCount} • {dayName}, {fullDate}
            </span>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleExitSanctuary}
              className="py-2.5 px-4 bg-white hover:bg-neutral-100 text-neutral-900 rounded-xl border-2 border-black font-mono text-xs font-black uppercase cursor-pointer shadow-[2.5px_2.5px_0px_#000000] active:translate-x-px active:translate-y-px flex items-center gap-2 transition-all"
              title="End sanctuary mode and resume daily verdicts"
            >
              <RotateCcw className="w-4 h-4 stroke-[2.5]" />
              <span>TURN OFF SANCTUARY • RESUME VERDICTS</span>
            </button>
          </div>
        </div>

        {/* Bento Content Architecture */}
        <div className="relative z-10 space-y-6 pt-6">
          
          {/* Row 1: The Breathing Lotus Orb (Left) & The Sacred Momentum Shelter (Right) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
            
            {/* Left Card (6 cols): The Vagus Breathing Lotus Orb */}
            <div className="md:col-span-6 border-3 border-black rounded-[28px] p-6 bg-white/95 shadow-[5px_5px_0px_#000000] flex flex-col justify-between space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#00E599] border-2 border-black flex items-center justify-center shadow-[1.5px_1.5px_0px_#000000]">
                    <Wind className="w-5 h-5 text-black stroke-[2.5]" />
                  </div>
                  <div>
                    <h3 className="font-display font-black text-sm uppercase text-black">Nervous System Pacer</h3>
                    <span className="text-[10px] font-mono text-neutral-500 font-bold block">
                      Vagus Reset • 4s Inhale - 2s Hold - 6s Exhale
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    try { soundEngine.playClick(); } catch (e) {}
                    setBreathActive(!breathActive);
                  }}
                  className={`px-3.5 py-1.5 rounded-xl border-2 border-black font-mono text-xs font-black uppercase cursor-pointer shadow-[2px_2px_0px_#000000] active:translate-x-px active:translate-y-px transition-all ${
                    breathActive ? 'bg-[#FF4D4D] text-black' : 'bg-[#00E599] text-black'
                  }`}
                >
                  {breathActive ? 'Pause Breath' : 'Start Pacer'}
                </button>
              </div>

              {/* Center Meditative Lotus Orb with Concentric Ripples */}
              <div className="py-6 flex flex-col items-center justify-center relative overflow-hidden bg-linear-to-b from-[#F0FDF4] to-[#E6F8ED] rounded-2xl border-2 border-emerald-300">
                <div className="relative w-40 h-40 flex items-center justify-center">
                  {breathActive && (
                    <>
                      <motion.div
                        animate={{ 
                          scale: breathPhase.includes('Inhale') ? [1, 1.45] : breathPhase.includes('Hold') ? 1.45 : [1.45, 1], 
                          opacity: [0.3, 0.6, 0.3] 
                        }}
                        transition={{ 
                          duration: breathPhase.includes('Inhale') ? 4 : breathPhase.includes('Hold') ? 2 : 6, 
                          ease: 'easeInOut', 
                          repeat: Infinity 
                        }}
                        className="absolute inset-0 rounded-full border-2 border-[#00E599]/60 pointer-events-none"
                      />
                      <motion.div
                        animate={{ 
                          scale: breathPhase.includes('Inhale') ? [1.1, 1.7] : breathPhase.includes('Hold') ? 1.7 : [1.7, 1.1], 
                          opacity: [0.15, 0.35, 0.15] 
                        }}
                        transition={{ 
                          duration: breathPhase.includes('Inhale') ? 4 : breathPhase.includes('Hold') ? 2 : 6, 
                          ease: 'easeInOut', 
                          repeat: Infinity 
                        }}
                        className="absolute inset-0 rounded-full border-2 border-emerald-400/40 pointer-events-none"
                      />
                    </>
                  )}

                  {/* Central Touch Orb */}
                  <motion.button
                    type="button"
                    onClick={() => {
                      try { soundEngine.playClick(); } catch (e) {}
                      setBreathActive(!breathActive);
                    }}
                    animate={breathActive ? {
                      scale: breathPhase.includes('Inhale') ? [1, 1.25] : breathPhase.includes('Hold') ? 1.25 : [1.25, 0.95],
                      backgroundColor: breathPhase.includes('Inhale') ? '#00E599' : breathPhase.includes('Hold') ? '#FDC800' : '#86EFAC'
                    } : { scale: 1, backgroundColor: '#00E599' }}
                    transition={{ 
                      duration: breathPhase.includes('Inhale') ? 4 : breathPhase.includes('Hold') ? 2 : 6, 
                      ease: 'easeInOut' 
                    }}
                    className="w-24 h-24 rounded-full border-3 border-black flex flex-col items-center justify-center shadow-[3px_3px_0px_#000000] cursor-pointer active:scale-95 transition-transform z-10"
                    title="Tap to toggle breathing pacer"
                  >
                    <Wind className="w-7 h-7 text-black stroke-[2.5]" />
                    <span className="font-mono text-[10px] font-black uppercase tracking-wider text-black mt-1">
                      {breathActive 
                        ? (breathPhase.includes('Inhale') ? 'INHALE' : breathPhase.includes('Hold') ? 'HOLD' : 'EXHALE') 
                        : 'BREATHE'}
                    </span>
                  </motion.button>
                </div>

                <div className="mt-3 text-center px-4">
                  <span className="font-mono text-xs font-black uppercase text-neutral-800 tracking-wider block">
                    {breathActive ? breathPhase : 'Tap Orb to Begin Nervous System Reset'}
                  </span>
                  <p className="text-[11px] font-sans text-neutral-600 max-w-xs mt-1">
                    Slow prolonged exhales stimulate the vagus nerve, dropping cortisol and lowering physiological tension.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Card (6 cols): The Sacred Momentum Shelter */}
            <div className="md:col-span-6 border-3 border-black rounded-[28px] p-6 bg-white/95 shadow-[5px_5px_0px_#000000] flex flex-col justify-between space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#00E599] border-2 border-black flex items-center justify-center shadow-[1.5px_1.5px_0px_#000000]">
                    <Shield className="w-5 h-5 text-black stroke-[2.5]" />
                  </div>
                  <div>
                    <h3 className="font-display font-black text-sm uppercase text-black">Sacred Momentum Shelter</h3>
                    <span className="text-[10px] font-mono text-emerald-800 font-bold block">Untouchable Streak Protection</span>
                  </div>
                </div>

                <span className="px-3 py-1 rounded-full bg-[#DCFCE7] text-emerald-950 font-mono text-[11px] font-black border border-emerald-400 shadow-[1px_1px_0px_#000000]">
                  0% JUDGMENT
                </span>
              </div>

              {/* Reassurance Lead */}
              <div className="p-4 bg-[#F2FBF5] border-2 border-black/80 rounded-2xl space-y-1.5">
                <p className="text-xs sm:text-sm font-sans text-neutral-800 leading-relaxed font-medium">
                  Your <span className="font-mono font-black text-black underline decoration-[#00E599] decoration-2">{dayCount}-day streak</span> is sealed in safe stasis. Daily grading is suspended, and missed days cannot break your momentum.
                </p>
                <p className="text-[11px] font-sans text-neutral-500">
                  Permission granted to sleep, rest your eyes, and recuperate with zero guilt.
                </p>
              </div>

              {/* Visual 7-Day Cycle Pebble Beads */}
              <div className="space-y-2.5 pt-1">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="font-bold text-neutral-600 uppercase text-[11px]">7-Day Rest Arc</span>
                  <span className="font-black text-black">Day {daysIn} of {freezeDays}</span>
                </div>

                <div className="grid grid-cols-7 gap-2">
                  {Array.from({ length: freezeDays || 7 }).map((_, i) => {
                    const dayNum = i + 1;
                    const isPast = dayNum < daysIn;
                    const isCurrent = dayNum === daysIn;
                    return (
                      <div
                        key={i}
                        className={`h-9 rounded-xl border-2 border-black flex items-center justify-center font-mono text-xs font-black transition-all ${
                          isPast 
                            ? 'bg-[#00E599] text-black shadow-[1.5px_1.5px_0px_#000000]' 
                            : isCurrent 
                            ? 'bg-[#FDC800] text-black shadow-[2px_2px_0px_#000000] scale-105 ring-2 ring-black' 
                            : 'bg-neutral-100 text-neutral-400'
                        }`}
                        title={`Sanctuary Day ${dayNum}`}
                      >
                        {isPast ? <Check className="w-3.5 h-3.5 stroke-3" /> : dayNum}
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400 pt-0.5">
                  <span>Initiated</span>
                  <span>Day 7 Check-in</span>
                  <span>Max 14d Ceiling</span>
                </div>
              </div>
            </div>

          </div>

          {/* Row 2: Somatic Grounding Garden • Tactile Talismans (Full Width) */}
          <div className="border-3 border-black rounded-[28px] p-6 bg-white/95 shadow-[5px_5px_0px_#000000] space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-emerald-600 fill-emerald-600" />
                <h4 className="font-display font-black text-sm uppercase text-black">
                  Somatic Grounding Garden • Tactile Talismans
                </h4>
              </div>
              <span className="text-[11px] font-mono font-bold text-neutral-600 bg-[#F4F9F5] px-3 py-1 rounded-full border border-neutral-300">
                {nourishedCount} of 4 Nourished Today • Zero Pressure
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-mono text-xs">
              {[
                { key: 'water', icon: Droplets, label: 'Hydration Well', blurb: 'Drank a tall glass of water', doneLabel: 'Hydrated' },
                { key: 'walk', icon: Footprints, label: 'Fresh Air Step', blurb: 'Stepped outside for breeze', doneLabel: 'Breathed Fresh Air' },
                { key: 'rest', icon: Moon, label: 'Quiet Horizon', blurb: 'Rested eyes for 10 minutes', doneLabel: 'Eyes Rested' },
                { key: 'screens', icon: PhoneOff, label: 'Digital Boundary', blurb: 'Put down feeds & devices', doneLabel: 'Screen Unplugged' }
              ].map((stone) => {
                const IconComp = stone.icon;
                const isDone = somaticCare[stone.key];
                return (
                  <button
                    key={stone.key}
                    type="button"
                    onClick={() => {
                      try { soundEngine.playClick(); } catch (e) {}
                      setSomaticCare(prev => ({ ...prev, [stone.key]: !prev[stone.key] }));
                    }}
                    className={`p-4 rounded-2xl border-2 border-black flex flex-col justify-between text-left cursor-pointer transition-all duration-150 relative overflow-hidden ${
                      isDone 
                        ? 'bg-[#DCFCE7] border-black shadow-[3px_3px_0px_#000000] translate-y-px' 
                        : 'bg-[#F9FBFA] hover:bg-neutral-100 hover:shadow-[3px_3px_0px_#000000] text-neutral-700 shadow-[1.5px_1.5px_0px_#000000]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 rounded-xl bg-white border-2 border-black flex items-center justify-center shadow-[1.5px_1.5px_0px_#000000]">
                        <IconComp className="w-4 h-4 text-black stroke-[2.5]" />
                      </div>
                      <span className={`w-5 h-5 rounded-full border border-black flex items-center justify-center text-[10px] ${
                        isDone ? 'bg-black text-[#00E599]' : 'bg-white text-transparent'
                      }`}>
                        <Check className="w-3.5 h-3.5 stroke-3" />
                      </span>
                    </div>
                    <div>
                      <span className="font-black text-xs uppercase block text-black">
                        {isDone ? stone.doneLabel : stone.label}
                      </span>
                      <span className="text-[10px] text-neutral-500 font-sans block mt-0.5 leading-snug">
                        {stone.blurb}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Row 3: Field of Unburdened Thoughts (Full Width) */}
          <div className="border-3 border-black rounded-[28px] p-6 bg-white/95 shadow-[5px_5px_0px_#000000] space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2 text-xs font-mono font-black text-black uppercase">
                <PenLine className="w-4 h-4 text-black" />
                <span>Field of Unburdened Thoughts (Optional)</span>
              </div>
              <span className="text-[10px] font-mono text-neutral-500 font-bold">
                No scores • Auto-saves to your private diary
              </span>
            </div>

            <AutoExpandTextarea
              minHeight={70}
              maxHeight={200}
              placeholder="How is your body feeling right now? Write freely without scoring, self-judgment, or performance anxiety..."
              value={noteText}
              onChange={(e) => handleNoteChange(e.target.value)}
              onBlur={handleSaveNote}
              className="w-full p-4 text-xs font-mono bg-[#FCFDF9] border-2 border-black rounded-2xl placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-black leading-relaxed"
            />

            <div className="flex items-center justify-between pt-1 text-[11px] font-mono text-neutral-500">
              <span>Words are preserved safely in your diary stasis.</span>
              {syncedBadge && (
                <span className="text-emerald-700 font-black flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 stroke-3" /> Saved to Vault
                </span>
              )}
            </div>
          </div>

          {/* Row 4: Sabbatical Transition Ribbon */}
          <div className="border-2 border-dashed border-neutral-400 rounded-2xl p-4 bg-white/70 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-2.5 text-neutral-700">
              <Compass className="w-4 h-4 text-amber-600 stroke-[2.5]" />
              <span>Need an open-ended macro break for months or years instead of 7 days?</span>
            </div>
            <button
              type="button"
              onClick={handleActivateSabbatical}
              className="px-4 py-2 bg-[#FFB800] hover:bg-amber-400 text-black border-2 border-black rounded-xl font-mono text-xs font-black uppercase cursor-pointer shadow-[2px_2px_0px_#000000] active:translate-x-px active:translate-y-px transition-all shrink-0 flex items-center gap-1.5"
            >
              <span>Step Into Grand Sabbatical Horizon</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>

        </div>
      </motion.div>
    );
  }

  // =========================================================================
  // ⛺ 2. GRAND SABBATICAL DECK (Open-Ended Macro Life Pause & Unplugged Living)
  // =========================================================================
  if (isSanctuaryActive && isSabbatical) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="neo-card w-full mb-8 relative overflow-hidden border-3 border-black shadow-[8px_8px_0px_#000000] bg-linear-to-br from-[#FFFDF2] via-[#FEF9E7] to-[#FDEFC2] rounded-4xl p-6 sm:p-8 md:p-10"
      >
        {/* Subtle Ambient Sunburst Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[#FFB800]/15 blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-[#F59E0B]/10 blur-3xl pointer-events-none -ml-20 -mb-20" />

        {/* Top Horizon Atmosphere Strip */}
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b-2 border-black/15">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-black text-white font-mono text-xs font-black shadow-[2px_2px_0px_#000000]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FFB800] animate-ping" />
              <span className="tracking-wider">⛺ GRAND SABBATICAL HORIZON</span>
            </div>

            <span className="px-3.5 py-1.5 rounded-full border-2 border-black font-mono text-xs font-black uppercase bg-[#FFB800] text-black shadow-[2px_2px_0px_#000000]">
              DAY {daysIn} OF SABBATICAL • INDEFINITE STREAK SHELTER
            </span>

            <span className="text-xs font-mono font-bold text-neutral-600 hidden lg:inline">
              DAY {dayCount} • {dayName}, {fullDate}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => {
                try { soundEngine.playClick(); } catch (e) {}
                if (onOpenRehab) onOpenRehab();
                else if (typeof window !== 'undefined') window.location.href = '/?view=sanctuary';
              }}
              className="py-2 px-4 rounded-xl border-2 border-black font-mono text-xs font-black uppercase cursor-pointer shadow-[2.5px_2.5px_0px_#000000] active:translate-x-px active:translate-y-px flex items-center gap-2 bg-[#FFB800] hover:bg-amber-400 text-black transition-all"
            >
              <Compass className="w-4 h-4 stroke-[2.5]" />
              <span>OPEN SABBATICAL CHARTER</span>
            </button>

            <button
              type="button"
              onClick={handleExitSanctuary}
              className="py-2 px-3.5 bg-white hover:bg-neutral-100 text-neutral-800 rounded-xl border-2 border-black font-mono text-xs font-black uppercase cursor-pointer shadow-[2px_2px_0px_#000000] active:translate-x-px active:translate-y-px flex items-center gap-1.5 transition-all"
              title="Return to daily verdicts"
            >
              <RotateCcw className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>RETURN TO DAILY TRACKING</span>
            </button>
          </div>
        </div>

        {/* Bento Content Architecture */}
        <div className="relative z-10 space-y-6 pt-6">
          
          {/* Row 1: The Astrolabe Centerpiece (Left) & The Unbounded Life Horizon (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            {/* Left Card (6 cols): Sabbatical Compass Narrative */}
            <div className="lg:col-span-6 border-3 border-black rounded-[28px] p-6 bg-white/95 shadow-[5px_5px_0px_#000000] flex flex-col justify-between space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#FFB800] border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_#000000] shrink-0">
                  <Compass className="w-6 h-6 text-black stroke-[2.5]" />
                </div>
                <div>
                  <span className="text-[10px] font-mono font-black uppercase text-amber-900 px-2.5 py-0.5 bg-[#FEF3C7] rounded-full border border-amber-300 inline-block">
                    Living Offline & Unplugged
                  </span>
                  <h3 className="font-display font-black text-xl text-black uppercase leading-tight mt-1">
                    The Grand Life Sabbatical
                  </h3>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-neutral-700 font-sans leading-relaxed">
                You have stepped back from daily self-scoring to focus on an expansive season of life — deep creation, unhurried travel, family, or personal reinvention. There are no daily quotas or alarms here.
              </p>

              <div className="p-4 bg-[#FEF3C7] border-2 border-black rounded-2xl font-mono text-xs space-y-1 shadow-[2px_2px_0px_#000000]">
                <span className="text-[10px] text-amber-900 font-black uppercase block tracking-wider">
                  SABBATICAL GUARANTEE:
                </span>
                <p className="text-black font-medium leading-relaxed">
                  Your lifetime streak is frozen with <strong>zero expiration date</strong>. Take months or years — your record will wait for you untouched.
                </p>
              </div>
            </div>

            {/* Right Card (6 cols): Sabbatical Horizon Metrics */}
            <div className="lg:col-span-6 border-3 border-black rounded-[28px] p-6 bg-white/95 shadow-[5px_5px_0px_#000000] flex flex-col justify-between space-y-5">
              <div className="flex items-center justify-between border-b border-neutral-200 pb-3 font-mono text-xs">
                <span className="font-black text-black uppercase flex items-center gap-2">
                  <Sun className="w-5 h-5 text-[#FFB800]" />
                  <span>Sabbatical Horizon Overview</span>
                </span>
                <span className="text-amber-900 font-black text-xs px-2.5 py-0.5 rounded-full bg-[#FEF3C7] border border-amber-300">
                  DEADLINE: NONE
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 font-mono text-center">
                <div className="bg-[#FFFDF0] border-2 border-black rounded-2xl p-4 shadow-[2px_2px_0px_#000000]">
                  <span className="text-[10px] text-neutral-500 uppercase block font-bold">STREAK SHELTER</span>
                  <span className="text-2xl font-black text-black block mt-1">{dayCount}d Safe</span>
                  <span className="text-[9px] text-amber-800 uppercase block font-black mt-1">UNTOUCHABLE</span>
                </div>

                <div className="bg-[#FFFDF0] border-2 border-black rounded-2xl p-4 shadow-[2px_2px_0px_#000000]">
                  <span className="text-[10px] text-neutral-500 uppercase block font-bold">DURATION</span>
                  <span className="text-2xl font-black text-black block mt-1">Day {daysIn}</span>
                  <span className="text-[9px] text-neutral-600 uppercase block font-bold mt-1">IN THE FIELD</span>
                </div>

                <div className="bg-[#FFFDF0] border-2 border-black rounded-2xl p-4 shadow-[2px_2px_0px_#000000]">
                  <span className="text-[10px] text-neutral-500 uppercase block font-bold">EXPECTATIONS</span>
                  <span className="text-2xl font-black text-emerald-700 block mt-1">0%</span>
                  <span className="text-[9px] text-neutral-600 uppercase block font-bold mt-1">PURE FREEDOM</span>
                </div>
              </div>

              <div className="p-3 bg-neutral-50 border border-neutral-300 rounded-xl text-center text-xs font-mono text-neutral-600">
                You are on an open path with no checklist. Live today fully without judging it.
              </div>
            </div>

          </div>

          {/* Row 2: Sabbatical Field Chronicles (Full Width) */}
          <div className="border-3 border-black rounded-[28px] p-6 bg-white/95 shadow-[5px_5px_0px_#000000] space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2 text-xs font-mono font-black text-black uppercase">
                <PenLine className="w-4 h-4 text-black" />
                <span>Sabbatical Field Notes & Chronicles</span>
              </div>
              <span className="text-[10px] font-mono text-neutral-500 font-bold">
                Freeform • Auto-saves to your private diary
              </span>
            </div>

            <AutoExpandTextarea
              minHeight={70}
              maxHeight={220}
              placeholder="Observations from the road, book excerpts, ideas, creative brainstorms, or reflections from this season of life..."
              value={noteText}
              onChange={(e) => handleNoteChange(e.target.value)}
              onBlur={handleSaveNote}
              className="w-full p-4 text-xs font-mono bg-[#FFFDF5] border-2 border-black rounded-2xl placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-black leading-relaxed"
            />

            <div className="flex items-center justify-between pt-1 text-[11px] font-mono text-neutral-500">
              <span>Stored safely in your private journal without assigning numbers or scores.</span>
              {syncedBadge && (
                <span className="text-amber-800 font-black flex items-center gap-1">
                  <Check className="w-3 h-3 stroke-3" /> Saved
                </span>
              )}
            </div>
          </div>

          {/* Row 3: Switch to Short-Term Sanctuary */}
          <div className="border-2 border-dashed border-amber-300 rounded-2xl p-4 bg-white/70 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
            <span className="text-neutral-700 font-medium">
              Just need a structured 7-day nervous system reset instead of an open-ended pause?
            </span>
            <button
              type="button"
              onClick={handleActivate7Day}
              className="px-4 py-2 bg-white hover:bg-neutral-100 border-2 border-black rounded-xl font-mono text-xs font-black uppercase cursor-pointer shadow-[2px_2px_0px_#000000] active:translate-x-px active:translate-y-px transition-all shrink-0"
            >
              Switch to 7-Day Sanctuary
            </button>
          </div>

        </div>
      </motion.div>
    );
  }

  // =========================================================================
  // ⚡ STANDARD DAILY VERDICT FLOW
  // =========================================================================
  return (
    <motion.div 
      animate={sadSettle ? { y: [0, 4, 1, 0] } : {}}
      transition={{ duration: 0.7, ease: 'easeInOut' }}
      className="neo-card w-full mb-8 bg-white relative overflow-hidden" 
      style={{ padding: '36px 40px' }}
    >
      {/* Top Panoramic Grid or Segmented Matrix Header */}
      {!sphereModeActive ? (
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          
          {/* Left Side: Date, Heading & Prominent Emblem Box */}
          <div className="text-left w-full lg:w-5/12 flex items-start gap-4">
            
            {/* Prominent Dynamic Vector Emblem Box with Crisp Icons & Spring Morph */}
            <motion.div
              animate={{ 
                scale: [1, 1.06, 1],
                rotate: (activeRatingForVisual - 3) * 4
              }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="w-16 h-16 rounded-2xl border-[2.5px] border-black flex items-center justify-center shadow-[3px_3px_0px_#000000] shrink-0 mt-1"
              style={{ backgroundColor: ratingMeta[activeRatingForVisual]?.bg }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeRatingForVisual}
                  initial={{ scale: 0.4, rotate: -30, opacity: 0 }}
                  animate={{ scale: 1, rotate: 0, opacity: 1 }}
                  exit={{ scale: 0.4, rotate: 30, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 450, damping: 20 }}
                  className="w-8 h-8 flex items-center justify-center"
                >
                  {React.createElement(IconMap[ratingMeta[activeRatingForVisual]?.icon] || Sparkles, {
                    className: "w-8 h-8 text-black stroke-[2.5]"
                  })}
                </motion.div>
              </AnimatePresence>
            </motion.div>

            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black text-white text-xs font-mono font-black mb-3 shadow-[2px_2px_0px_#FDC800]">
                <span>TODAY</span>
                <span>•</span>
                <span>DAY {dayCount}</span>
              </div>

              <h2 className="font-display font-black text-3xl sm:text-4xl text-black tracking-tight uppercase leading-none">
                {dayName}
              </h2>
              <p className="text-sm font-mono font-bold text-neutral-700 mt-1.5">
                {fullDate}
              </p>
              <p className="text-xs font-mono text-neutral-500 mt-1 font-semibold">
                {isDeterministicTaskLocked 
                  ? 'Rating governed 100% by your Non-Negotiable Tasks below.' 
                  : 'Hover & punch an icon to log your verdict.'}
              </p>
            </div>
          </div>

          {/* Right Side: 5 Chunky Tactile 1-Tap Buttons */}
          <div className="w-full lg:w-7/12">
              <div className="grid grid-cols-5 gap-1.5 sm:gap-3.5 relative">
                {[1, 2, 3, 4, 5].map((val) => {
                  const m = ratingMeta[val];
                  const SvgIcon = IconMap[m.icon];
                  const isSelected = selectedRating === val;

                  return (
                    <motion.button
                      key={val}
                      type="button"
                      whileHover={!isDeterministicTaskLocked ? { 
                        scale: 1.06, 
                        y: -4, 
                        boxShadow: '4px 4px 0px #000000' 
                      } : {}}
                      whileTap={!isDeterministicTaskLocked ? { 
                        scale: 0.88, 
                        rotate: (val - 3) * -2.5 
                      } : {}}
                      transition={{ type: 'spring', stiffness: 450, damping: 16 }}
                      onClick={(e) => handleRate(val, e)}
                      className={`neo-btn flex flex-col items-center justify-center p-1.5 sm:p-3 relative ${isDeterministicTaskLocked ? 'cursor-not-allowed opacity-85' : 'cursor-pointer'}`}
                      style={{ 
                        minHeight: '82px',
                        backgroundColor: isSelected ? m.bg : '#FFFFFF'
                      }}
                      title={isDeterministicTaskLocked ? 'Locked by 100% Task Engine' : `Log ${m.title} (${val}/5)`}
                    >
                      {/* Seamless Active Selection Highlight */}
                      {isSelected && (
                        <motion.div
                          layoutId="active-cyber-box"
                          className="absolute -inset-0.5 rounded-2xl border-[3px] border-black pointer-events-none"
                          transition={{ type: 'spring', stiffness: 480, damping: 26 }}
                        />
                      )}

                      <div 
                        className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl border-2 border-black flex items-center justify-center mb-1 sm:mb-1.5 shadow-[1.5px_1.5px_0px_#000000]"
                        style={{ backgroundColor: m.bg }}
                      >
                        <SvgIcon className="w-4 h-4 sm:w-5 sm:h-5 text-black stroke-[2.5]" />
                      </div>

                      <span className="font-display font-black text-[10px] sm:text-xs uppercase tracking-tight leading-none truncate max-w-full">
                        {m.title}
                      </span>

                      <span className="text-[8px] sm:text-[10px] font-mono font-bold text-neutral-600 mt-0.5 sm:mt-1">
                        {val}/5
                      </span>
                    </motion.button>
                  );
                })}
              </div>
          </div>

        </div>
      ) : (
        /* Multi-Sphere Segmented Day Matrix Layout */
        <div className="space-y-6">
          
          {/* Header & Composite Velocity Gauge */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-2 border-black/10 pb-5">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black text-white text-xs font-mono font-black mb-2 shadow-[2px_2px_0px_#FDC800]">
                <Layers className="w-3.5 h-3.5 text-[#FDC800]" />
                <span>SEGMENTED DAY MATRIX</span>
                <span>•</span>
                <span>DAY {dayCount}</span>
              </div>
              <h2 className="font-display font-black text-2xl sm:text-3xl text-black tracking-tight uppercase leading-none">
                {dayName}, {fullDate}
              </h2>
              <p className="text-xs font-mono text-neutral-600 mt-1">
                Rate your performance across distinct life spheres for forensic precision.
              </p>
            </div>

            {/* Composite Blended Score Pill */}
            {compositeStats ? (
              <div 
                className="px-4 py-2.5 rounded-2xl border-2 border-black shadow-[3px_3px_0px_#000000] flex items-center gap-3 self-start md:self-auto"
                style={{ backgroundColor: ratingMeta[compositeStats.rating]?.bg || '#FDC800' }}
              >
                <div className="w-9 h-9 rounded-xl bg-black text-white flex items-center justify-center font-display font-black text-sm shadow-[1.5px_1.5px_0px_#000000]">
                  {compositeStats.score}
                </div>
                <div>
                  <div className="text-[10px] font-mono font-black uppercase text-black/80 leading-none">
                    COMPOSITE BLENDED VERDICT
                  </div>
                  <div className="font-display font-black text-sm uppercase text-black leading-tight">
                    {compositeStats.verdict} ({compositeStats.ratedCount}/{activeSpheresConfig.length} RATED)
                  </div>
                </div>
              </div>
            ) : (
              <div className="px-3.5 py-2 bg-neutral-100 border-2 border-dashed border-black/30 rounded-2xl text-xs font-mono font-bold text-neutral-500 self-start md:self-auto">
                ⚡ Rate spheres below to calculate score
              </div>
            )}
          </div>

          {/* Spheres Grid Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {activeSpheresConfig.map((sphere) => {
              const currentSphereData = spheresData[sphere.id] || {};
              const sphereRating = currentSphereData.rating;
              const isExpanded = Boolean(expandedSphereNotes[sphere.id] || currentSphereData.notes);

              return (
                <div
                  key={sphere.id}
                  className="bg-[#FFFDF8] rounded-3xl border-3 border-black py-6 px-5 sm:px-6 shadow-[5px_5px_0px_#000000] flex flex-col justify-between space-y-4 transition-all hover:shadow-[7px_7px_0px_#000000]"
                >
                  {/* Sphere Card Header: Large Infographic Box & Bold Label */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div 
                        className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl border-2.5 border-black flex items-center justify-center shadow-[3px_3px_0px_#000000] shrink-0"
                        style={{ backgroundColor: sphere.color || '#FDC800' }}
                      >
                        <SphereIcon icon={sphere.icon} className="w-7 h-7 sm:w-8 sm:h-8 text-black stroke-[2.5]" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-display font-black text-base sm:text-lg uppercase tracking-tight text-black leading-tight truncate">
                          {sphere.name}
                        </h4>
                        <span className="text-xs font-mono font-medium text-neutral-600 line-clamp-1 block mt-0.5">
                          {sphere.desc}
                        </span>
                      </div>
                    </div>

                    {sphereRating ? (
                      <span 
                        className="px-2.5 py-1 rounded-xl border-2 border-black font-mono text-xs font-black shadow-[1.5px_1.5px_0px_#000000] shrink-0"
                        style={{ backgroundColor: ratingMeta[sphereRating]?.bg }}
                      >
                        {sphereRating}★ {ratingMeta[sphereRating]?.title}
                      </span>
                    ) : (
                      <span className="text-[11px] font-mono text-neutral-400 font-bold shrink-0">UNRATED</span>
                    )}
                  </div>

                  {/* 1★ to 5★ Tactile Prominent Rating Row */}
                  <div className="grid grid-cols-5 gap-1.5 pt-1">
                    {[1, 2, 3, 4, 5].map((val) => {
                      const m = ratingMeta[val];
                      const SvgIcon = IconMap[m.icon];
                      const isSelected = sphereRating === val;

                      return (
                        <button
                          key={val}
                          type="button"
                          onClick={() => handleRateSphere(sphere.id, val)}
                          className={`py-2.5 px-1.5 rounded-xl border-2 border-black flex flex-col items-center justify-center cursor-pointer transition-all active:scale-95 ${
                            isSelected 
                              ? 'shadow-[2.5px_2.5px_0px_#000000] ring-2 ring-black font-black scale-[1.02]' 
                              : 'bg-white hover:bg-neutral-100 text-neutral-800 hover:shadow-[1.5px_1.5px_0px_#000000]'
                          }`}
                          style={{ backgroundColor: isSelected ? m.bg : '#FFFFFF' }}
                        >
                          <SvgIcon className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-black stroke-[2.5]" />
                          <span className="text-[10px] font-mono font-black mt-1">{val}★</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Sphere Reflection Notes: Direct Notepad with Auto-save on blur */}
                  <div className="pt-3 border-t-2 border-black/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => toggleSphereNote(sphere.id)}
                        className="text-xs font-mono font-bold text-neutral-700 hover:text-black flex items-center gap-1.5 cursor-pointer"
                      >
                        <PenLine className="w-3.5 h-3.5" />
                        <span className="uppercase">{currentSphereData.notes ? 'Edit notes' : '+ Sphere notes'}</span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>

                      {currentSphereData.notes && (
                        <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md border border-emerald-400 font-black">
                          ✓ Saved
                        </span>
                      )}
                    </div>

                    {isExpanded && (
                      <div className="space-y-2">
                        <AutoExpandTextarea
                          minHeight={48}
                          maxHeight={260}
                          placeholder={`What happened at ${sphere.name}? (Wins, struggles, events)`}
                          value={currentSphereData.notes || ''}
                          onChange={(e) => handleSphereNoteChange(sphere.id, e.target.value)}
                          onBlur={(e) => handleSphereNoteBlur(sphere.id, e.target.value)}
                          className="w-full p-3 text-xs font-mono bg-white border-2 border-black rounded-2xl placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-black leading-relaxed"
                        />
                        <div className="flex justify-between items-center text-[10px] font-mono text-neutral-500">
                          <span>Auto-saves on typing</span>
                          <button
                            type="button"
                            onClick={() => handleSphereNoteBlur(sphere.id, currentSphereData.notes || '')}
                            className="px-3 py-1 font-mono font-black uppercase bg-black text-white rounded-lg cursor-pointer hover:bg-neutral-800 shadow-[1px_1px_0px_#000000] active:scale-95"
                          >
                            Save Note
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* Rich Graphical Mood Reaction Showcase */}
      {(sphereModeActive ? (compositeStats?.rating || selectedRating) : selectedRating) && (
        <div className="mt-6">
          <MoodReactionBanner rating={sphereModeActive && compositeStats ? compositeStats.rating : selectedRating} />
        </div>
      )}

      {/* 3 Daily Non-Negotiable Anchors */}
      <div className="mt-6">
        <NonNegotiableCard dateStr={todayStr} onScoreUpdate={handleAnchorScoreUpdate} />
      </div>

      {/* Bottom Bar: Status Verdict + Expandable Note */}
      <div className="mt-6 pt-5 border-t-2 border-black/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        
        {/* Active Verdict Pill with Crisp Icon */}
        {(sphereModeActive ? (compositeStats || selectedRating) : selectedRating) ? (
          <motion.div 
            layout
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 450, damping: 25 }}
            className="inline-flex items-center gap-2.5 px-4 py-2 rounded-xl border-2 border-black text-xs font-mono font-bold text-black shadow-[3px_3px_0px_#000000]"
            style={{ backgroundColor: ratingMeta[sphereModeActive && compositeStats ? compositeStats.rating : selectedRating]?.bg }}
          >
            {React.createElement(IconMap[ratingMeta[sphereModeActive && compositeStats ? compositeStats.rating : selectedRating]?.icon] || Sparkles, {
              className: "w-4 h-4 text-black stroke-3 shrink-0"
            })}

            <span>
              VERDICT: <strong className="uppercase">{ratingMeta[sphereModeActive && compositeStats ? compositeStats.rating : selectedRating]?.title}</strong>
              {sphereModeActive && compositeStats?.score ? ` (SCORE: ${compositeStats.score}/5.0)` : ''} — {ratingMeta[sphereModeActive && compositeStats ? compositeStats.rating : selectedRating]?.desc}
            </span>

            {syncedBadge && (
              <span className="flex items-center gap-1 bg-black text-white px-2 py-0.5 rounded-md font-mono text-[10px] uppercase font-black ml-1">
                <Check className="w-3 h-3 stroke-3" /> Saved
              </span>
            )}
          </motion.div>
        ) : (
          <span className="text-xs font-mono font-bold text-neutral-500">
            No verdict logged yet for today.
          </span>
        )}

        {/* Autopsy & Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 self-stretch sm:self-auto justify-end">
          {/* Forensic Crime Scene Badge if autopsy exists */}
          {activeEntry?.autopsy && (
            <AutopsyBadge
              autopsy={activeEntry.autopsy}
              onClick={() => setIsAutopsyModalOpen(true)}
            />
          )}

          {/* 1-Tap Receipt of Truth Generator Button (When Enabled) */}
          {isReceiptOfTruthEnabled() && (
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                setIsReceiptModalOpen(true);
              }}
              className="text-xs font-mono font-bold text-black bg-white hover:bg-[#00E599] border-2 border-black px-3.5 py-2 rounded-xl shadow-[2px_2px_0px_#000000] flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
              title="Generate Streetwear Thermal Receipt Slip"
            >
              <Printer className="w-3.5 h-3.5 text-black stroke-[2.5]" />
              <span>RECEIPT</span>
            </button>
          )}

          {/* Note Toggle Button with Magnetic Cursor Attraction */}
          {!showNote && (
            <MagneticButton
              onClick={() => setShowNote(true)}
              className="text-xs font-mono font-bold text-black bg-white hover:bg-[#FDC800] border-2 border-black px-4 py-2 rounded-xl shadow-[2px_2px_0px_#000000] flex items-center gap-1.5 cursor-pointer"
            >
              <PenLine className="w-3.5 h-3.5" />
              <span>{currentEntry?.notes ? 'Edit Master Reflection' : '+ Unified Day Journal'}</span>
            </MagneticButton>
          )}
        </div>

      </div>

      {/* Expanded Note Area with Smooth Spring Physics */}
      <AnimatePresence>
        {showNote && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
            className="mt-5 pt-5 pb-3 border-t-2 border-dashed border-black/20 text-left space-y-3.5"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono font-bold text-black">
              <span className="flex items-center gap-1.5">
                <PenLine className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>UNFILTERED DAILY DIARY REFLECTION</span>
              </span>

              <div className="flex items-center gap-2">
                {/* Undo / Redo / Revert History Controls */}
                <div className="flex items-center gap-1 bg-neutral-100 p-1 border-2 border-black rounded-xl shadow-[1px_1px_0px_#000000]">
                  <button
                    type="button"
                    onClick={handleUndo}
                    disabled={historyIdx <= 0}
                    title="Undo last change"
                    className="p-1 rounded hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed text-black"
                  >
                    <Undo2 className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>

                  <button
                    type="button"
                    onClick={handleRedo}
                    disabled={historyIdx >= historyStack.length - 1}
                    title="Redo change"
                    className="p-1 rounded hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed text-black"
                  >
                    <Redo2 className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>

                  {originalDraft && (
                    <button
                      type="button"
                      onClick={handleRevertOriginal}
                      title="Revert back to original raw text"
                      className="px-2 py-0.5 rounded hover:bg-white text-[10px] font-black uppercase text-neutral-800"
                    >
                      ORIGINAL
                    </button>
                  )}
                </div>

                {/* AI Polish Button (Directly powered by Settings preferences) */}
                <button
                  type="button"
                  onClick={() => handleAIEnhance()}
                  disabled={isEnhancing || (!noteText.trim() && !Object.values(spheresData).some(s => s?.notes && s.notes.trim()))}
                  title="Polish and organize your diary entry with Gemini AI using your Settings directive (maintains 1st person)"
                  className="px-3.5 py-1.5 bg-[#FDC800] hover:bg-amber-300 border-2 border-black rounded-xl text-black text-xs font-mono font-black flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed shadow-[2px_2px_0px_#000000]"
                >
                  {isEnhancing ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Wand2 className="w-3.5 h-3.5 stroke-[2.5]" />
                  )}
                  <span>
                    {isEnhancing 
                      ? 'SYNTHESIZING...' 
                      : 'AI POLISH'
                    }
                  </span>
                </button>

                <button 
                  onClick={() => setShowNote(false)}
                  className="hover:bg-red-200 border-2 border-black p-1.5 rounded-xl cursor-pointer ml-1 shadow-[1px_1px_0px_#000000]"
                >
                  <X className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>
              </div>
            </div>

            <textarea
              rows={6}
              placeholder="Write your raw diary thoughts here... (what went wrong, what went right, real struggles)"
              value={noteText}
              onChange={(e) => handleNoteChange(e.target.value)}
              className="neo-input text-sm sm:text-base font-mono leading-relaxed p-4"
              style={{ minHeight: '160px' }}
            />

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 pb-1">
              <span className="text-[11px] font-mono text-neutral-500 font-bold">
                {historyStack.length > 1 && `Version ${historyIdx + 1} of ${historyStack.length} • `}
                Use Undo/Original to revert anytime.
              </span>

              <button
                type="button"
                onClick={handleSaveNote}
                className="px-6 py-2.5 bg-[#00E599] hover:bg-emerald-400 text-black text-xs font-mono font-black border-2 border-black rounded-xl cursor-pointer shadow-[3px_3px_0px_#000000] transition-all hover:-translate-x-px hover:-translate-y-px hover:shadow-[4px_4px_0px_#000000] active:translate-x-px active:translate-y-px"
              >
                SAVE DIARY ENTRY
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lazy Loaded Heavy Modals wrapped in Suspense */}
      <Suspense fallback={null}>
        {/* 🩸 Down-Bad Ransom Capsule Capture Modal */}
        {isCapsuleModalOpen && (
          <RansomCapsuleModal
            isOpen={isCapsuleModalOpen}
            onClose={() => setIsCapsuleModalOpen(false)}
            mode="capture"
            activeDate={todayStr}
            activeStreak={dayCount}
            onCapsuleSaved={() => {
              soundEngine.playSuccessChime();
            }}
          />
        )}

        {/* 📉 The Autopsy Chamber Interrogator Modal */}
        {isAutopsyModalOpen && (
          <AutopsyChamberModal
            isOpen={isAutopsyModalOpen}
            onClose={() => setIsAutopsyModalOpen(false)}
            entryDate={todayStr}
            rating={selectedRating || activeEntry?.rating || 1}
            existingAutopsy={activeEntry?.autopsy || null}
            onSaveAutopsy={handleSaveAutopsy}
          />
        )}

        {/* 🧾 The Receipt of Truth Thermal Generator Modal */}
        {isReceiptModalOpen && (
          <ReceiptOfTruthModal
            isOpen={isReceiptModalOpen}
            onClose={() => setIsReceiptModalOpen(false)}
            entry={activeEntry}
            dateStr={todayStr}
            dayCount={dayCount}
          />
        )}
      </Suspense>
    </motion.div>
  );
}

