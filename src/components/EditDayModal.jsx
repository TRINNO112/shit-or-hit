import React, { useState, useEffect } from 'react';
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
import { ratingMeta, enhanceReflectionWithAI } from '../services/api';

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
  onSave
}) {
  if (!isOpen) return null;

  const [rating, setRating] = useState(entryData?.rating || 3);
  const [notes, setNotes] = useState(entryData?.notes || '');
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // History stack for Undo / Redo / Revert
  const [historyStack, setHistoryStack] = useState([entryData?.notes || '']);
  const [historyIdx, setHistoryIdx] = useState(0);
  const originalDraft = entryData?.notes || '';

  useEffect(() => {
    if (entryData) {
      setRating(entryData.rating || 3);
      setNotes(entryData.notes || '');
      setHistoryStack([entryData.notes || '']);
      setHistoryIdx(0);
    }
  }, [entryData, dateStr]);

  const formattedDate = new Date(`${dateStr}T00:00:00`).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const handleAIEnhance = async () => {
    if (!notes || !notes.trim()) return;
    const currentVal = notes;
    setIsEnhancing(true);
    try {
      const enhanced = await enhanceReflectionWithAI(currentVal, rating, dateStr);
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
    await onSave({
      date: dateStr,
      rating,
      verdict: ratingMeta[rating]?.title || 'Verdict',
      notes
    });
    setIsSaving(false);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs"
      onClick={onClose}
    >
      <div 
        className="neo-card w-full max-w-xl bg-white animate-slide-up"
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
        <div className="mb-6">
          <label className="block text-xs font-mono font-black text-neutral-700 uppercase mb-2.5">
            1. CHANGE VERDICT RATING
          </label>
          <div className="grid grid-cols-5 gap-2.5">
            {[1, 2, 3, 4, 5].map((val) => {
              const m = ratingMeta[val];
              const SvgIcon = IconMap[m.icon];
              const isSelected = Number(rating) === val;

              return (
                <button
                  key={val}
                  type="button"
                  onClick={() => setRating(val)}
                  className={`neo-btn flex flex-col items-center justify-center p-2.5 ${
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
                </button>
              );
            })}
          </div>
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
            rows={5}
            placeholder="Type your reflection or edits here..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="neo-input text-xs font-mono text-black placeholder:text-neutral-500 w-full leading-relaxed"
          />

          <div className="text-[10px] font-mono text-neutral-500 font-bold text-right">
            {historyStack.length > 1 && `Version ${historyIdx + 1} of ${historyStack.length}`}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t-2 border-black/10">
          <button
            type="button"
            onClick={onClose}
            className="neo-btn px-4 py-2 bg-neutral-100 text-black text-xs font-mono font-bold cursor-pointer"
          >
            CANCEL
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="neo-btn px-6 py-2 bg-[#00E599] text-black text-xs font-mono font-black flex items-center gap-1.5 cursor-pointer shadow-[3px_3px_0px_#000000]"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>{isSaving ? 'SAVING...' : 'SAVE CHANGES'}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
