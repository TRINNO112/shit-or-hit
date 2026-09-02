import React, { useState, useEffect, useRef } from 'react';
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
  BookOpen
} from 'lucide-react';
import { 
  ratingMeta, 
  enhanceReflectionWithAI,
  isSphereModeEnabled,
  getSphereConfig,
  calculateCompositeScore
} from '../services/api';
import MoodReactionBanner from './MoodReactionBanner';
import MagneticButton from './MagneticButton';
import confetti from 'canvas-confetti';
import { Layers, ChevronDown, ChevronUp } from 'lucide-react';
import SphereIcon from './SphereIcon';
import AutoExpandTextarea from './AutoExpandTextarea';
import NonNegotiableCard from './NonNegotiableCard';
import { soundEngine } from '../services/soundEngine';
import AIDirectivesModal, { DIRECTIVES } from './AIDirectivesModal';

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
  sphereSettingsVer = 0
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
  
  // History stack for Undo / Redo / Revert to Original
  const [historyStack, setHistoryStack] = useState([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const [originalDraft, setOriginalDraft] = useState('');

  // Sync state whenever activeEntry or sphereSettingsVer changes
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

  const handleRate = async (val, e) => {
    triggerRatingExpression(val, 0.6);

    setSyncedBadge(true);
    if (saveHandler) {
      await saveHandler({
        date: todayStr,
        rating: val,
        verdict: ratingMeta[val]?.title || 'Verdict',
        notes: noteText,
        spheres: sphereModeActive ? spheresData : undefined,
        calculatedScore: sphereModeActive ? activeEntry?.calculatedScore : undefined
      });
    }
    setTimeout(() => setSyncedBadge(false), 2500);
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
                Hover & punch an icon to log your verdict.
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
                    whileHover={{ 
                      scale: 1.06, 
                      y: -4, 
                      boxShadow: '4px 4px 0px #000000'
                    }}
                    whileTap={{ 
                      scale: 0.88, 
                      rotate: (val - 3) * -2.5 
                    }}
                    transition={{ type: 'spring', stiffness: 450, damping: 16 }}
                    onClick={(e) => handleRate(val, e)}
                    className="neo-btn flex flex-col items-center justify-center p-1.5 sm:p-3 relative cursor-pointer"
                    style={{ 
                      minHeight: '82px',
                      backgroundColor: isSelected ? m.bg : '#FFFFFF'
                    }}
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
    </motion.div>
  );
}

