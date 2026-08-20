import React, { useState, useEffect } from 'react';
import { 
  X, 
  Trash2, 
  Check, 
  AlertOctagon, 
  CloudRain, 
  MinusCircle, 
  Zap, 
  Sparkles 
} from 'lucide-react';
import { ratingMeta } from '../services/api';

const IconMap = {
  AlertOctagon,
  CloudRain,
  MinusCircle,
  Zap,
  Sparkles
};

export default function DayRatingModal({ 
  date, 
  existingEntry, 
  isOpen, 
  onClose, 
  onSave, 
  onDelete 
}) {
  if (!isOpen) return null;

  const [rating, setRating] = useState(existingEntry?.rating || 4);
  const [notes, setNotes] = useState(existingEntry?.notes || '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (existingEntry) {
      setRating(existingEntry.rating || 4);
      setNotes(existingEntry.notes || '');
    } else {
      setRating(4);
      setNotes('');
    }
  }, [existingEntry, date]);

  const handleSave = async () => {
    setSaving(true);
    await onSave({
      date,
      rating,
      verdict: ratingMeta[rating]?.title || 'Verdict',
      notes
    });
    setSaving(false);
    onClose();
  };

  const handleDelete = async () => {
    if (window.confirm(`Clear entry for ${date}?`)) {
      await onDelete(date);
      onClose();
    }
  };

  const parsedDate = new Date(`${date}T00:00:00`);
  const dateHeading = isNaN(parsedDate.getTime()) 
    ? date 
    : parsedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="minimal-card w-full max-w-lg p-6 animate-soft-fade bg-[#11141b] border-white/15">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 mb-4">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#8e95a5]">
              LOG DAY
            </span>
            <h3 className="font-serif text-xl font-medium text-[#f5f2ea]">
              {dateHeading}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-[#8e95a5] hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 5 Icons */}
        <div className="grid grid-cols-5 gap-2 my-4">
          {[1, 2, 3, 4, 5].map((val) => {
            const m = ratingMeta[val];
            const SvgIcon = IconMap[m.icon];
            const isSelected = rating === val;

            return (
              <button
                key={val}
                type="button"
                onClick={() => setRating(val)}
                className={`p-2.5 rounded-xl border flex flex-col items-center justify-center transition-all ${
                  isSelected
                    ? 'border-white/40 bg-white/10'
                    : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.06]'
                }`}
              >
                <div className="mb-1" style={{ color: m.color }}>
                  <SvgIcon className="w-5 h-5 stroke-[1.75]" />
                </div>
                <span className="font-serif text-[11px]" style={{ color: isSelected ? m.color : '#c8c4bc' }}>
                  {m.title}
                </span>
              </button>
            );
          })}
        </div>

        {/* Optional Note */}
        <div className="my-4">
          <label className="block text-[11px] font-mono text-[#8e95a5] mb-1.5">
            Reflection Note (Optional)
          </label>
          <textarea
            rows={3}
            placeholder="Thoughts or context for this day..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full text-xs"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
          {existingEntry ? (
            <button
              onClick={handleDelete}
              className="text-xs font-mono text-red-400/80 hover:text-red-300 flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          ) : <div />}

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg text-xs font-mono text-[#8e95a5] hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-[#f5f2ea] text-xs font-mono font-medium transition-all"
            >
              {saving ? 'Saving...' : 'Save Entry'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
