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
import AutoExpandTextarea from './AutoExpandTextarea';

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
    // Strictly respect the user's active sphere mode setting
    const isGlobalSphereEnabled = isSphereModeEnabled();
    setSphereModeActive(isGlobalSphereEnabled);
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
            initial={{ opacity: 0, scale: 0.94, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 15 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className={`w-full ${sphereModeActive ? 'max-w-6xl' : 'max-w-3xl'} min-h-[500px] sm:min-h-[560px] max-h-[92vh] h-[85vh] flex flex-col bg-white border-3 border-black rounded-3xl shadow-[10px_10px_0px_#000000] overflow-hidden p-5 sm:p-7`}
            onClick={(e) => e.stopPropagation()}
          >

            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b-2 border-black/10 shrink-0">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-[#FDC800] border-2 border-black flex items-center justify-center font-display font-black text-base shadow-[2.5px_2.5px_0px_#000000]">
                  D{dayIndex}
                </div>
                <div>
                  <h3 className="font-display font-black text-xl sm:text-2xl text-black uppercase leading-tight">
                    EDIT DAY {dayIndex}
                  </h3>
                  <span className="text-xs font-mono font-bold text-neutral-600 block mt-0.5">
                    {formattedDate}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 sm:p-2.5 rounded-xl bg-[#FF4D4D] hover:bg-red-600 border-2 border-black text-black hover:text-white cursor-pointer shadow-[2px_2px_0px_#000000] active:scale-95 transition-all"
                  title="Close modal"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5 stroke-[3]" />
                </button>
              </div>
            </div>

            {/* Scrollable Content Body */}
            <div className="flex-1 flex flex-col min-h-0 overflow-y-auto overflow-x-hidden pr-1 space-y-4">

              {/* If Multi-Sphere Mode Active: Landscape Spheres Matrix */}
              {sphereModeActive && spheresConfig.length > 0 ? (
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-black text-neutral-800 uppercase flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-black" />
                      <span>LIFE SPHERES PERFORMANCE & REFLECTIONS</span>
                    </span>
                    <span className="text-xs font-mono text-neutral-500 font-bold">
                      Rate domains & add specific notes
                    </span>
                  </div>

                  {/* Wide Grid of Life Spheres */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 items-stretch">
                    {spheresConfig.map((sphere) => {
                      const sData = spheresData[sphere.id] || {};
                      const sRating = sData.rating;

                      return (
                        <div
                          key={sphere.id}
                          className="p-6 bg-[#FFFDF8] rounded-3xl border-3 border-black shadow-[4px_4px_0px_#000000] flex flex-col justify-between space-y-4 h-full transition-all duration-200 hover:-translate-y-1 hover:shadow-[7px_7px_0px_#000000]"
                        >
                          {/* Sphere Header */}
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-3.5 min-w-0">
                              <div
                                className="w-12 h-12 rounded-2xl border-2.5 border-black flex items-center justify-center shrink-0 shadow-[2px_2px_0px_#000000] transition-transform hover:scale-105"
                                style={{ backgroundColor: sphere.color || '#FDC800' }}
                              >
                                <SphereIcon icon={sphere.icon} className="w-6 h-6 text-black stroke-[2.5]" />
                              </div>
                              <div className="min-w-0">
                                <span className="font-display font-black text-base uppercase truncate text-black block leading-tight">
                                  {sphere.name}
                                </span>
                                <span className="text-[11px] font-mono text-neutral-500 truncate block mt-0.5">
                                  {sphere.desc}
                                </span>
                              </div>
                            </div>

                            {sRating ? (
                              <span
                                className="px-2.5 py-1 rounded-xl border-2 border-black font-mono text-xs font-black shadow-[1.5px_1.5px_0px_#000000] shrink-0"
                                style={{ backgroundColor: ratingMeta[sRating]?.bg }}
                              >
                                {sRating}★ {ratingMeta[sRating]?.title}
                              </span>
                            ) : (
                              <span className="text-[11px] font-mono text-neutral-400 font-bold shrink-0">UNRATED</span>
                            )}
                          </div>

                          {/* 1★ to 5★ Tactile Mini Buttons with Hover Scale */}
                          <div className="grid grid-cols-5 gap-1.5 pt-0.5">
                            {[1, 2, 3, 4, 5].map((sVal) => {
                              const isSel = sRating === sVal;
                              return (
                                <button
                                  key={sVal}
                                  type="button"
                                  onClick={() => handleRateSphere(sphere.id, sVal)}
                                  className={`py-2 rounded-xl border-2 border-black font-mono text-xs font-black cursor-pointer transition-all active:scale-90 hover:scale-105 ${isSel
                                    ? 'bg-[#FDC800] shadow-[2px_2px_0px_#000000] font-black scale-[1.03]'
                                    : 'bg-white hover:bg-neutral-100 hover:shadow-[1.5px_1.5px_0px_#000000]'
                                    }`}
                                >
                                  {sVal}★
                                </button>
                              );
                            })}
                          </div>

                          {/* Multi-Line Sphere-Specific Reflection Note with Auto-Expansion */}
                          <div className="pt-3 border-t-2 border-black/10 flex-1 flex flex-col justify-end space-y-1.5">
                            <label className="block text-xs font-mono font-bold text-neutral-700 uppercase">
                              Reflection Note:
                            </label>
                            <AutoExpandTextarea
                              minHeight={68}
                              maxHeight={280}
                              placeholder={`What happened at ${sphere.name}?`}
                              value={sData.notes || ''}
                              onChange={(e) => handleSphereNoteChange(sphere.id, e.target.value)}
                              className="w-full p-3 text-xs font-mono bg-white border-2 border-black rounded-2xl placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-black leading-relaxed"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                /* Single-Verdict Standard Rating & Single Diary Area */
                <div className="flex-1 flex flex-col min-h-0 space-y-4">

                  {/* Rating Selector */}
                  <div className="space-y-2 shrink-0">
                    <label className="block text-xs font-mono font-black text-neutral-700 uppercase">
                      1. SELECT VERDICT RATING
                    </label>
                    <div className="grid grid-cols-5 gap-2">
                      {[1, 2, 3, 4, 5].map((val) => {
                        const m = ratingMeta[val];
                        const SvgIcon = IconMap[m.icon];
                        const isSelected = Number(rating) === val;

                        return (
                          <motion.button
                            key={val}
                            type="button"
                            whileHover={{ scale: 1.04, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleRatingSelect(val)}
                            className={`p-3 rounded-2xl border-2 border-black flex flex-col items-center justify-center cursor-pointer transition-all ${isSelected ? 'shadow-[3px_3px_0px_#000000] font-black' : 'bg-neutral-50 hover:bg-white'
                              }`}
                            style={{ backgroundColor: isSelected ? m.bg : '#F9F9F9' }}
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
                  </div>

                  {/* Single Diary Reflection Textarea */}
                  <div className="flex-1 flex flex-col min-h-0 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono font-bold text-black shrink-0">
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
                          className="px-3 py-1 bg-[#FDC800] hover:bg-amber-300 border-2 border-black rounded-xl text-black text-xs font-mono font-black flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-[2px_2px_0px_#000000]"
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
                      placeholder="Type your reflection, thoughts, or wins for this day..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full flex-1 min-h-[200px] sm:min-h-[260px] p-4 text-xs sm:text-sm font-mono bg-white border-2 border-black rounded-2xl text-black placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-black leading-relaxed shadow-[2px_2px_0px_#000000] resize-none"
                    />
                  </div>
                </div>
              )}

            </div>

            {/* Pinned Action Buttons Footer */}
            <div className="flex items-center justify-between gap-2 pt-4 mt-2 border-t-2 border-black/10 shrink-0">
              <button
                type="button"
                onClick={() => {
                  if (onOpenWallpaper) {
                    onOpenWallpaper({ rating, notes, date: dateStr }, dateStr);
                  }
                }}
                className="px-3.5 py-2 bg-[#FDC800] hover:bg-amber-400 border-2 border-black rounded-xl text-black text-xs font-mono font-black flex items-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_#000000] active:scale-95"
                title="Generate Aesthetic Wallpaper for this day"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>WALLPAPER</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 border-2 border-black rounded-xl text-black text-xs font-mono font-bold cursor-pointer"
                >
                  CANCEL
                </button>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-5 py-2 bg-[#00E599] hover:bg-emerald-400 border-2 border-black rounded-xl text-black text-xs font-mono font-black flex items-center gap-1.5 cursor-pointer shadow-[2.5px_2.5px_0px_#000000] active:scale-95"
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

