import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Check, 
  Wand2, 
  Loader2, 
  Calendar as CalIcon,
  AlertCircle,
  CloudRain,
  MinusCircle,
  Zap,
  Sparkles,
  Undo2,
  Redo2
} from 'lucide-react';
import { 
  ratingMeta, 
  enhanceReflectionWithAI,
  isSphereModeEnabled,
  getSphereConfig,
  calculateCompositeScore
} from '../services/api';
import confetti from 'canvas-confetti';
import { Layers } from 'lucide-react';
import SphereIcon from './SphereIcon';

const IconMap = {
  AlertCircle,
  CloudRain,
  MinusCircle,
  Zap,
  Sparkles
};

export default function EditDayModal({
  isOpen,
  onClose,
  entryData,
  dateStr,
  dayIndex,
  onSave,
  onOpenWallpaper,
  sphereSettingsVer = 0
}) {
  const [rating, setRating] = useState(entryData?.rating || 3);
  const [notes, setNotes] = useState(entryData?.notes || '');
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Sphere mode states
  const [sphereModeActive, setSphereModeActive] = useState(false);
  const [spheresConfig, setSpheresConfig] = useState([]);
  const [spheresData, setSpheresData] = useState({});
  
  // History stack for Undo / Redo / Revert
  const [historyStack, setHistoryStack] = useState([entryData?.notes || '']);
  const [historyIdx, setHistoryIdx] = useState(0);
  const originalDraft = entryData?.notes || '';

  useEffect(() => {
    const isEnabled = isSphereModeEnabled() || Boolean(entryData?.spheres && Object.keys(entryData.spheres).length > 0);
    setSphereModeActive(isEnabled);
    const cfg = getSphereConfig().filter(s => s.enabled);
    setSpheresConfig(cfg);

    if (entryData) {
      setRating(entryData.rating || 3);
      setNotes(entryData.notes || '');
      setHistoryStack([entryData.notes || '']);
      setHistoryIdx(0);

      const initialSpheres = {};
      cfg.forEach(s => {
        initialSpheres[s.id] = {
          id: s.id,
          name: s.name,
          icon: s.icon,
          color: s.color,
          rating: entryData?.spheres?.[s.id]?.rating || null,
          notes: entryData?.spheres?.[s.id]?.notes || ''
        };
      });
      setSpheresData(initialSpheres);
    }
  }, [entryData, dateStr, sphereSettingsVer]);

  const formattedDate = new Date(`${dateStr}T00:00:00`).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const handleRatingSelect = (val) => {
    setRating(val);
    if (val === 5) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#FDC800', '#000000', '#00E599']
      });
    }
  };

  const handleRateSphere = (sphereId, val) => {
    const updated = {
      ...spheresData,
      [sphereId]: {
        ...(spheresData[sphereId] || {}),
        id: sphereId,
        rating: val
      }
    };
    setSpheresData(updated);
    const comp = calculateCompositeScore(updated);
    if (comp) {
      setRating(comp.rating);
    }
  };

  const handleSphereNoteChange = (sphereId, text) => {
    setSpheresData(prev => ({
      ...prev,
      [sphereId]: {
        ...(prev[sphereId] || {}),
        notes: text
      }
    }));
  };

  const handleAIEnhance = async () => {
    const hasSphereNotes = Object.values(spheresData).some(s => s.notes && s.notes.trim());
    if ((!notes || !notes.trim()) && !hasSphereNotes) return;
    const currentVal = notes;
    setIsEnhancing(true);
    try {
      const comp = calculateCompositeScore(spheresData);
      const enhanced = await enhanceReflectionWithAI(
        currentVal, 
        comp?.rating || rating, 
        dateStr,
        sphereModeActive ? spheresData : null
      );
      const newStack = historyStack.slice(0, historyIdx + 1);
      newStack.push(enhanced);
      setHistoryStack(newStack);
      setHistoryIdx(newStack.length - 1);
      setNotes(enhanced);
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
      setNotes(historyStack[target]);
    }
  };

  const handleRedo = () => {
    if (historyIdx < historyStack.length - 1) {
      const target = historyIdx + 1;
      setHistoryIdx(target);
      setNotes(historyStack[target]);
    }
  };

  const handleRevertOriginal = () => {
    setNotes(originalDraft);
    const newStack = [...historyStack, originalDraft];
    setHistoryStack(newStack);
    setHistoryIdx(newStack.length - 1);
  };

  const handleSave = async () => {
    setIsSaving(true);
    const comp = sphereModeActive ? calculateCompositeScore(spheresData) : null;
    await onSave({
      date: dateStr,
      rating: comp ? comp.rating : Number(rating),
      verdict: comp ? comp.verdict : (ratingMeta[rating]?.title || 'Verdict'),
      notes,
      spheres: sphereModeActive ? spheresData : entryData?.spheres,
      calculatedScore: comp ? comp.score : entryData?.calculatedScore
    });
    setIsSaving(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs"
          onClick={onClose}
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className="neo-card w-full max-w-xl bg-white"
            style={{ padding: '32px 36px' }}
            onClick={(e) => e.stopPropagation()}
          >
            
            {/* Header */}
            <div className="flex items-center justify-between pb-4 mb-6 border-b-2 border-black/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FDC800] border-2 border-black flex items-center justify-center font-display font-black text-sm shadow-[2px_2px_0px_#000000]">
                  D{dayIndex}
                </div>
                <div>
                  <h3 className="font-display font-black text-xl text-black uppercase">
                    EDIT DAY {dayIndex}
                  </h3>
                  <span className="text-xs font-mono font-bold text-neutral-600 block">
                    {formattedDate}
                  </span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="neo-btn p-2 bg-red-100 hover:bg-red-200 text-black cursor-pointer"
              >
                <X className="w-4 h-4 stroke-[3]" />
              </button>
            </div>

            {/* Rating Picker */}
            <div className="mb-6 space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-mono font-black text-neutral-700 uppercase">
                  1. CHANGE VERDICT RATING
                </label>
                {sphereModeActive && (
                  <span className="text-[10px] font-mono bg-black text-[#FDC800] px-2 py-0.5 rounded font-black">
                    SEGMENTED MATRIX
                  </span>
                )}
              </div>

              {/* Master Rating Row */}
              <div className="grid grid-cols-5 gap-2.5">
                {[1, 2, 3, 4, 5].map((val) => {
                  const m = ratingMeta[val];
                  const SvgIcon = IconMap[m.icon];
                  const isSelected = Number(rating) === val;

                  return (
                    <motion.button
                      key={val}
                      type="button"
                      whileHover={{ scale: 1.06, y: -2 }}
                      whileTap={{ scale: 0.9, rotate: (val - 3) * 2 }}
                      onClick={() => handleRatingSelect(val)}
                      className={`neo-btn flex flex-col items-center justify-center p-2.5 cursor-pointer ${
                        isSelected ? m.selectedClass : 'bg-neutral-50'
                      }`}
                    >
                      <div 
                        className="w-8 h-8 rounded-lg border-2 border-black flex items-center justify-center mb-1 shadow-[1px_1px_0px_#000000]"
                        style={{ backgroundColor: m.bg }}
                      >
                        <SvgIcon className="w-4 h-4 text-black stroke-[2.5]" />
                      </div>
                      <span className="font-display font-black text-[11px] uppercase">{m.title}</span>
                    </motion.button>
                  );
                })}
              </div>

              {/* Sphere-Specific Breakdown if Sphere Mode Active */}
              {sphereModeActive && spheresConfig.length > 0 && (
                <div className="mt-3 p-3 bg-neutral-50 rounded-2xl border-2 border-black space-y-2">
                  <div className="text-[11px] font-mono font-black uppercase text-neutral-800 flex items-center justify-between">
                    <span>Life Spheres Breakdown</span>
                    <span className="text-[10px] text-neutral-500">Rate domain performance</span>
                  </div>

                  <div className="space-y-2">
                    {spheresConfig.map((sphere) => {
                      const sData = spheresData[sphere.id] || {};
                      const sRating = sData.rating;

                      return (
                        <div key={sphere.id} className="p-2.5 bg-white rounded-xl border border-black/40 space-y-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <div 
                                className="w-7 h-7 rounded-lg border border-black flex items-center justify-center shrink-0 shadow-[1px_1px_0px_#000000]"
                                style={{ backgroundColor: sphere.color || '#FDC800' }}
                              >
                                <SphereIcon icon={sphere.icon} className="w-4 h-4 text-black stroke-[2.5]" />
                              </div>
                              <span className="font-display font-black text-xs uppercase truncate">{sphere.name}</span>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              {[1, 2, 3, 4, 5].map((sVal) => (
                                <button
                                  key={sVal}
                                  type="button"
                                  onClick={() => handleRateSphere(sphere.id, sVal)}
                                  className={`w-6 h-6 rounded-lg border border-black font-mono text-[10px] font-black cursor-pointer ${
                                    sRating === sVal ? 'bg-[#FDC800] shadow-[1px_1px_0px_#000000]' : 'bg-neutral-100 hover:bg-neutral-200'
                                  }`}
                                >
                                  {sVal}★
                                </button>
                              ))}
                            </div>
                          </div>

                          <input
                            type="text"
                            placeholder={`Reflection note for ${sphere.name}...`}
                            value={sData.notes || ''}
                            onChange={(e) => handleSphereNoteChange(sphere.id, e.target.value)}
                            className="w-full px-2 py-1 text-[11px] font-mono bg-neutral-50 border border-black/30 rounded-lg placeholder:text-neutral-400 focus:outline-none focus:bg-white focus:border-black"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Reflection Note & AI Tool with Version History */}
            <div className="space-y-2.5 mb-6">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono font-bold text-black">
                <span>2. EDIT DIARY REFLECTION NOTE</span>
                
                <div className="flex items-center gap-2">
                  {/* Undo / Redo / Revert Buttons */}
                  <div className="flex items-center gap-1 bg-neutral-100 p-0.5 border-2 border-black rounded-lg shadow-[1px_1px_0px_#000000]">
                    <button
                      type="button"
                      onClick={handleUndo}
                      disabled={historyIdx <= 0}
                      title="Undo last change"
                      className="p-1 rounded hover:bg-white disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed text-black"
                    >
                      <Undo2 className="w-3 h-3 stroke-[2.5]" />
                    </button>

                    <button
                      type="button"
                      onClick={handleRedo}
                      disabled={historyIdx >= historyStack.length - 1}
                      title="Redo change"
                      className="p-1 rounded hover:bg-white disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed text-black"
                    >
                      <Redo2 className="w-3 h-3 stroke-[2.5]" />
                    </button>

                    {originalDraft && (
                      <button
                        type="button"
                        onClick={handleRevertOriginal}
                        title="Revert back to original raw draft"
                        className="px-1.5 py-0.5 rounded hover:bg-white text-[9px] font-black uppercase cursor-pointer text-neutral-800"
                      >
                        ORIGINAL
                      </button>
                    )}
                  </div>

                  {/* AI Polish Button */}
                  <button
                    type="button"
                    onClick={handleAIEnhance}
                    disabled={isEnhancing || !notes.trim()}
                    className="neo-btn px-3 py-1 bg-[#FDC800] hover:bg-amber-300 text-black text-xs font-mono font-black flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-[2px_2px_0px_#000000]"
                  >
                    {isEnhancing ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Wand2 className="w-3.5 h-3.5 stroke-[2.5]" />
                    )}
                    <span>{isEnhancing ? 'POLISHING...' : 'AI POLISH DIARY'}</span>
                  </button>
                </div>
              </div>

              <textarea
                rows={6}
                placeholder="Type your reflection or edits here..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="neo-input text-xs font-mono text-black placeholder:text-neutral-500 w-full leading-relaxed"
                style={{ minHeight: '140px' }}
              />

              <div className="text-[10px] font-mono text-neutral-500 font-bold text-right">
                {historyStack.length > 1 && `Version ${historyIdx + 1} of ${historyStack.length}`}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between gap-2 pt-4 border-t-2 border-black/10">
              <button
                type="button"
                onClick={() => {
                  if (onOpenWallpaper) {
                    onOpenWallpaper({ rating, notes, date: dateStr }, dateStr);
                  }
                }}
                className="neo-btn px-3 py-2 bg-[#FDC800] hover:bg-amber-400 text-black text-xs font-mono font-black flex items-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_#000000]"
                title="Generate Aesthetic Wallpaper for this day"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>WALLPAPER</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="neo-btn px-3.5 py-2 bg-neutral-100 text-black text-xs font-mono font-bold cursor-pointer"
                >
                  CANCEL
                </button>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="neo-btn px-5 py-2 bg-[#00E599] text-black text-xs font-mono font-black flex items-center gap-1.5 cursor-pointer shadow-[3px_3px_0px_#000000]"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>{isSaving ? 'SAVING...' : 'SAVE CHANGES'}</span>
                </button>
              </div>
            </div>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

