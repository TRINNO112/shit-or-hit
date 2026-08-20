import React, { useState } from 'react';
import { 
  AlertCircle, 
  CloudRain, 
  MinusCircle, 
  Zap, 
  Sparkles, 
  Check, 
  PenLine, 
  X 
} from 'lucide-react';
import { ratingMeta } from '../services/api';

const IconMap = {
  AlertCircle,
  CloudRain,
  MinusCircle,
  Zap,
  Sparkles
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

  const selectedRating = currentEntry?.rating || null;

  const now = new Date();
  const dayName = now.toLocaleDateString('en-US', { weekday: 'long' });
  const fullDate = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  const handleRate = async (val) => {
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
    if (!selectedRating) return;
    await onSaveToday({
      date: todayStr,
      rating: selectedRating,
      verdict: ratingMeta[selectedRating]?.title || 'Verdict',
      notes: noteText
    });
    setSyncedBadge(true);
    setTimeout(() => setSyncedBadge(false), 2500);
  };

  return (
    <div className="neo-card p-6 sm:p-10 max-w-2xl mx-auto text-center my-4">
      
      {/* Badge & Date */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-black text-white text-xs font-mono font-black mb-3 shadow-[2px_2px_0px_#FDC800]">
        <span>TODAY</span>
        <span>•</span>
        <span>DAY {dayCount}</span>
      </div>

      <h2 className="font-display font-black text-3xl sm:text-5xl text-black tracking-tight uppercase">
        {dayName}
      </h2>
      <p className="text-sm font-mono font-bold text-neutral-600 mt-1 mb-8">
        {fullDate}
      </p>

      {/* 5 Tactile Neobrutalist Rating Buttons */}
      <div className="grid grid-cols-5 gap-2.5 sm:gap-3 max-w-xl mx-auto mb-6">
        {[1, 2, 3, 4, 5].map((val) => {
          const m = ratingMeta[val];
          const SvgIcon = IconMap[m.icon];
          const isSelected = selectedRating === val;

          return (
            <button
              key={val}
              type="button"
              onClick={() => handleRate(val)}
              className={`neo-btn flex flex-col items-center justify-center p-3 sm:p-4 ${
                isSelected ? m.selectedClass : ''
              }`}
            >
              <div 
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl border-2 border-black flex items-center justify-center mb-1.5 shadow-[2px_2px_0px_#000000]"
                style={{ backgroundColor: m.bg }}
              >
                <SvgIcon className="w-5 h-5 sm:w-6 sm:h-6 text-black stroke-[2.5]" />
              </div>

              <span className="font-display font-black text-xs sm:text-sm text-black uppercase tracking-tight leading-none">
                {m.title}
              </span>

              <span className="text-[10px] font-mono font-bold text-neutral-600 mt-1">
                {val}/5
              </span>
            </button>
          );
        })}
      </div>

      {/* Status Feedback Badge */}
      {selectedRating ? (
        <div 
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-black text-xs font-mono font-bold text-black shadow-[3px_3px_0px_#000000]"
          style={{ backgroundColor: ratingMeta[selectedRating]?.bg }}
        >
          <span>
            VERDICT: <strong className="uppercase">{ratingMeta[selectedRating]?.title}</strong> — {ratingMeta[selectedRating]?.desc}
          </span>
          {syncedBadge && (
            <span className="flex items-center gap-1 bg-black text-white px-2 py-0.5 rounded-md font-mono text-[10px] uppercase font-black ml-1">
              <Check className="w-3 h-3 stroke-[3]" /> Saved
            </span>
          )}
        </div>
      ) : (
        <p className="text-xs font-mono font-bold text-neutral-500">
          Tap any button to punch in today's verdict.
        </p>
      )}

      {/* Optional Note Field */}
      <div className="max-w-md mx-auto mt-6 pt-5 border-t-2 border-black/10">
        {!showNote ? (
          <button
            onClick={() => setShowNote(true)}
            className="text-xs font-mono font-bold text-black hover:bg-[#FDC800] border-2 border-black px-3 py-1.5 rounded-xl shadow-[2px_2px_0px_#000000] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_#000000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_#000000] flex items-center gap-1.5 mx-auto transition-all cursor-pointer"
          >
            <PenLine className="w-3.5 h-3.5" />
            <span>{currentEntry?.notes ? 'Edit note' : '+ Add reflection (optional)'}</span>
          </button>
        ) : (
          <div className="text-left space-y-2">
            <div className="flex items-center justify-between text-xs font-mono font-bold text-black">
              <span>UNFILTERED NOTE</span>
              <button 
                onClick={() => setShowNote(false)}
                className="hover:bg-red-200 border border-black p-0.5 rounded"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <textarea
              rows={2}
              placeholder="What made today rough or legendary?"
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              className="neo-input w-full text-xs text-black placeholder:text-neutral-500"
            />
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleSaveNote}
                className="neo-btn px-4 py-1.5 bg-[#00E599] text-black text-xs font-mono font-black"
              >
                SAVE NOTE
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
