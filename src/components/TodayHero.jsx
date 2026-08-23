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
  RotateCcw
} from 'lucide-react';
import { ratingMeta, enhanceReflectionWithAI } from '../services/api';
import MagneticButton from './MagneticButton';
import confetti from 'canvas-confetti';

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
  onSaveToday, 
  dayCount 
}) {
  const [showNote, setShowNote] = useState(Boolean(currentEntry?.notes));
  const [noteText, setNoteText] = useState(currentEntry?.notes || '');
  const [syncedBadge, setSyncedBadge] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [sadSettle, setSadSettle] = useState(false);
  
  // History stack for Undo / Redo / Revert to Original
  const [historyStack, setHistoryStack] = useState([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const [originalDraft, setOriginalDraft] = useState('');

  // Sync state whenever currentEntry changes
  useEffect(() => {
    if (currentEntry?.notes !== undefined) {
      setNoteText(currentEntry.notes);
      setOriginalDraft(currentEntry.notes);
      setHistoryStack([currentEntry.notes]);
      setHistoryIdx(0);
      if (currentEntry.notes) setShowNote(true);
    }
  }, [currentEntry]);

  const selectedRating = currentEntry?.rating || null;
  const activeRatingForVisual = selectedRating || 3;

  const now = new Date();
  const dayName = now.toLocaleDateString('en-US', { weekday: 'long' });
  const fullDate = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  const handleRate = async (val, e) => {
    if (val <= 2) {
      // Gentle melancholy sigh settle (subtle & respectful, zero seismic waves)
      setSadSettle(true);
      setTimeout(() => setSadSettle(false), 800);
    } else if (val === 5) {
      confetti({
        particleCount: 60,
        spread: 65,
        origin: { y: 0.6 },
        colors: ['#FDC800', '#000000', '#00E599']
      });
    } else if (val === 4) {
      confetti({
        particleCount: 25,
        spread: 45,
        origin: { y: 0.65 },
        colors: ['#00E599', '#000000']
      });
    }

    setSyncedBadge(true);
    await onSaveToday({
      date: todayStr,
      rating: val,
      verdict: ratingMeta[val]?.title || 'Verdict',
      notes: noteText
    });
    setTimeout(() => setSyncedBadge(false), 2500);
  };

  const handleSaveNote = async () => {
    const ratingToUse = selectedRating || 3;
    await onSaveToday({
      date: todayStr,
      rating: ratingToUse,
      verdict: ratingMeta[ratingToUse]?.title || 'Verdict',
      notes: noteText
    });
    setSyncedBadge(true);
    setTimeout(() => setSyncedBadge(false), 2500);
  };

  const handleNoteChange = (newVal) => {
    setNoteText(newVal);
  };

  const handleAIEnhance = async () => {
    if (!noteText || noteText.trim() === '') return;
    
    const currentVal = noteText;
    setIsEnhancing(true);
    try {
      const enhanced = await enhanceReflectionWithAI(currentVal, selectedRating || 3, todayStr);
      
      const newStack = historyStack.slice(0, historyIdx + 1);
      newStack.push(enhanced);
      setHistoryStack(newStack);
      setHistoryIdx(newStack.length - 1);
      setNoteText(enhanced);
    } catch (err) {
      console.error('AI Enhance error:', err);
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
      
      {/* Top Panoramic Grid */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
        
        {/* Left Side: Date, Heading & Prominent Morphing Vector Emblem */}
        <div className="text-left w-full lg:w-5/12 flex items-start gap-4">
          
          {/* Prominent Morphing Vector Emblem Box */}
          <motion.div
            animate={{ 
              scale: [1, 1.08, 1],
              rotate: (activeRatingForVisual - 3) * 6
            }}
            transition={{ duration: 0.65, ease: 'easeOut' }}
            className="w-16 h-16 rounded-2xl border-[2.5px] border-black flex items-center justify-center shadow-[3px_3px_0px_#000000] shrink-0 mt-1"
            style={{ backgroundColor: ratingMeta[activeRatingForVisual]?.bg }}
          >
            <svg viewBox="0 0 24 24" className="w-8 h-8 stroke-black fill-black" strokeWidth="1.5">
              <motion.path
                d={moodSvgPaths[activeRatingForVisual]}
                animate={{ d: moodSvgPaths[activeRatingForVisual] }}
                transition={{ duration: 0.65, ease: [0.34, 1.56, 0.64, 1] }}
              />
            </svg>
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

        {/* Right Side: 5 Chunky Tactile Buttons with Direction 1 Shape-Shifting & Gliding Outline */}
        <div className="w-full lg:w-7/12">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5 relative">
            {[1, 2, 3, 4, 5].map((val) => {
              const m = ratingMeta[val];
              const SvgIcon = IconMap[m.icon];
              const isSelected = selectedRating === val;

              return (
                <motion.button
                  key={val}
                  type="button"
                  whileHover={{ 
                    scale: 1.08, 
                    y: -5, 
                    rotate: (val - 3) * 2.2,
                    boxShadow: '5px 5px 0px #000000'
                  }}
                  whileTap={{ 
                    scale: 0.86, 
                    rotate: (val - 3) * -3.5 
                  }}
                  transition={{ type: 'spring', stiffness: 450, damping: 16 }}
                  onClick={(e) => handleRate(val, e)}
                  className={`neo-btn flex flex-col items-center justify-center p-3 relative cursor-pointer ${
                    isSelected ? 'ring-2 ring-black font-black' : ''
                  }`}
                  style={{ 
                    minHeight: '110px',
                    backgroundColor: isSelected ? m.bg : '#FFFFFF'
                  }}
                >
                  {/* Gliding Selection Box Indicator from Direction 1 */}
                  {isSelected && (
                    <motion.div
                      layoutId="active-cyber-box"
                      className="absolute inset-0 rounded-2xl border-[3px] border-black pointer-events-none"
                      transition={{ type: 'spring', stiffness: 480, damping: 26 }}
                    />
                  )}

                  <div 
                    className="w-10 h-10 rounded-xl border-2 border-black flex items-center justify-center mb-1.5 shadow-[2px_2px_0px_#000000]"
                    style={{ backgroundColor: m.bg }}
                  >
                    <SvgIcon className="w-5 h-5 text-black stroke-[2.5]" />
                  </div>

                  <span className="font-display font-black text-xs uppercase tracking-tight leading-none mt-1">
                    {m.title}
                  </span>

                  <span className="text-[10px] font-mono font-bold text-neutral-600 mt-1">
                    {val}/5
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>

      </div>

      {/* Bottom Bar: Morphing Vector Status Verdict + Expandable Note */}
      <div className="mt-8 pt-6 border-t-2 border-black/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        
        {/* Active Verdict Pill with Live Morphing SVG Path */}
        {selectedRating ? (
          <motion.div 
            layout
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 450, damping: 25 }}
            className="inline-flex items-center gap-3 px-4 py-2.5 rounded-xl border-2 border-black text-xs font-mono font-bold text-black shadow-[3px_3px_0px_#000000]"
            style={{ backgroundColor: ratingMeta[selectedRating]?.bg }}
          >
            {/* Morphing SVG Graphic */}
            <svg viewBox="0 0 24 24" className="w-4 h-4 stroke-black fill-black shrink-0" strokeWidth="2">
              <motion.path
                d={moodSvgPaths[selectedRating] || moodSvgPaths[3]}
                animate={{ d: moodSvgPaths[selectedRating] || moodSvgPaths[3] }}
                transition={{ type: 'spring', stiffness: 300, damping: 22 }}
              />
            </svg>

            <span>
              VERDICT: <strong className="uppercase">{ratingMeta[selectedRating]?.title}</strong> — {ratingMeta[selectedRating]?.desc}
            </span>

            {syncedBadge && (
              <span className="flex items-center gap-1 bg-black text-white px-2 py-0.5 rounded-md font-mono text-[10px] uppercase font-black ml-1">
                <Check className="w-3 h-3 stroke-[3]" /> Saved
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
            <span>{currentEntry?.notes ? 'Edit reflection' : '+ Add reflection note'}</span>
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
            className="overflow-hidden mt-5 pt-5 border-t-2 border-dashed border-black/20 text-left space-y-3"
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
                    className="p-1 rounded hover:bg-white disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed text-black"
                  >
                    <Undo2 className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>

                  <button
                    type="button"
                    onClick={handleRedo}
                    disabled={historyIdx >= historyStack.length - 1}
                    title="Redo change"
                    className="p-1 rounded hover:bg-white disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed text-black"
                  >
                    <Redo2 className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>

                  {originalDraft && (
                    <button
                      type="button"
                      onClick={handleRevertOriginal}
                      title="Revert back to original raw text"
                      className="px-2 py-0.5 rounded hover:bg-white text-[10px] font-black uppercase cursor-pointer text-neutral-800"
                    >
                      ORIGINAL
                    </button>
                  )}
                </div>

                {/* AI Polish Button */}
                <button
                  type="button"
                  onClick={handleAIEnhance}
                  disabled={isEnhancing || !noteText.trim()}
                  title="Polish and organize your diary entry with Gemini AI (maintains 1st person)"
                  className="neo-btn px-3.5 py-1 bg-[#FDC800] hover:bg-amber-300 text-black text-xs font-mono font-black flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-[2px_2px_0px_#000000]"
                >
                  {isEnhancing ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Wand2 className="w-3.5 h-3.5 stroke-[2.5]" />
                  )}
                  <span>{isEnhancing ? 'POLISHING...' : 'AI POLISH DIARY'}</span>
                </button>

                <button 
                  onClick={() => setShowNote(false)}
                  className="hover:bg-red-200 border border-black p-1 rounded cursor-pointer ml-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <textarea
              rows={6}
              placeholder="Write your raw diary thoughts here... (what went wrong, what went right, real struggles)"
              value={noteText}
              onChange={(e) => handleNoteChange(e.target.value)}
              className="neo-input text-xs text-black placeholder:text-neutral-500 font-mono leading-relaxed"
              style={{ minHeight: '140px' }}
            />

            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-neutral-500 font-bold">
                {historyStack.length > 1 && `Version ${historyIdx + 1} of ${historyStack.length} • `}
                Use Undo/Original to revert anytime.
              </span>

              <MagneticButton
                onClick={handleSaveNote}
                className="neo-btn px-6 py-2 bg-[#00E599] text-black text-xs font-mono font-black cursor-pointer shadow-[3px_3px_0px_#000000]"
              >
                SAVE DIARY ENTRY
              </MagneticButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}

