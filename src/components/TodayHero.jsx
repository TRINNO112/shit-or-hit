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

  // Format today's date
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
    setTimeout(() => setSyncedBadge(false), 2000);
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
    setTimeout(() => setSyncedBadge(false), 2000);
  };

  return (
    <div className="white-card p-6 sm:p-10 max-w-2xl mx-auto text-center animate-slide-up">
      
      {/* Badge & Date */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-mono font-semibold mb-3">
        <span>TODAY</span>
        <span>•</span>
        <span>DAY {dayCount}</span>
      </div>

      <h2 className="font-display font-black text-3xl sm:text-4xl text-slate-900 tracking-tight">
        {dayName}
      </h2>
      <p className="text-sm font-medium text-slate-500 mt-1 mb-8">
        {fullDate}
      </p>

      {/* 5 Tactile 1-Click Rating Buttons */}
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
              className={`rating-btn flex flex-col items-center justify-center p-3 sm:p-4 cursor-pointer ${
                isSelected ? m.activeClass : ''
              }`}
            >
              <div 
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center mb-1.5 transition-transform"
                style={{ 
                  color: isSelected ? m.color : '#64748b',
                  backgroundColor: isSelected ? m.bg : '#f8fafc' 
                }}
              >
                <SvgIcon className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2]" />
              </div>

              <span 
                className="font-display font-bold text-xs sm:text-sm tracking-tight leading-none"
                style={{ color: isSelected ? m.color : '#334155' }}
              >
                {m.title}
              </span>

              <span className="text-[10px] font-mono text-slate-400 mt-1">
                {val}/5
              </span>
            </button>
          );
        })}
      </div>

      {/* Status Feedback */}
      {selectedRating ? (
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 border border-slate-200/80 text-xs font-medium text-slate-700">
          <span 
            className="w-2 h-2 rounded-full" 
            style={{ backgroundColor: ratingMeta[selectedRating]?.color }} 
          />
          <span>
            Marked as <strong className="text-slate-900">{ratingMeta[selectedRating]?.title}</strong> — {ratingMeta[selectedRating]?.desc}
          </span>
          {syncedBadge && (
            <span className="flex items-center gap-1 text-emerald-600 font-bold ml-1">
              <Check className="w-3.5 h-3.5 stroke-[3]" /> Saved
            </span>
          )}
        </div>
      ) : (
        <p className="text-xs font-mono text-slate-400">
          Tap any tier to log how your day went.
        </p>
      )}

      {/* Optional Note Reflection */}
      <div className="max-w-md mx-auto mt-6 pt-5 border-t border-slate-100">
        {!showNote ? (
          <button
            onClick={() => setShowNote(true)}
            className="text-xs font-medium text-slate-500 hover:text-slate-900 flex items-center gap-1.5 mx-auto py-1 px-3 rounded-lg hover:bg-slate-100 transition-all"
          >
            <PenLine className="w-3.5 h-3.5" />
            <span>{currentEntry?.notes ? 'Edit note' : '+ Add a note (optional)'}</span>
          </button>
        ) : (
          <div className="text-left space-y-2 animate-slide-up">
            <div className="flex items-center justify-between text-xs font-mono text-slate-500">
              <span>Quick Note</span>
              <button 
                onClick={() => setShowNote(false)}
                className="hover:text-slate-800"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <textarea
              rows={2}
              placeholder="What made today rough or great?"
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              className="w-full text-xs text-slate-800 placeholder:text-slate-400"
            />
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleSaveNote}
                className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition-all"
              >
                Save Note
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
