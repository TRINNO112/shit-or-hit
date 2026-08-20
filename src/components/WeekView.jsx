import React from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  AlertOctagon, 
  CloudRain, 
  MinusCircle, 
  Zap, 
  Sparkles,
  Plus
} from 'lucide-react';
import { ratingMeta } from '../services/api';

const IconMap = {
  AlertOctagon,
  CloudRain,
  MinusCircle,
  Zap,
  Sparkles
};

export default function WeekView({ 
  entries, 
  currentDate, 
  onDateChange, 
  onQuickRate,
  onOpenDetail,
  todayStr
}) {
  const curr = new Date(currentDate);
  const dayOfWeek = curr.getDay();
  const diffToMonday = (dayOfWeek === 0 ? -6 : 1) - dayOfWeek;
  const monday = new Date(curr);
  monday.setDate(curr.getDate() + diffToMonday);

  const weekDays = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const dateStr = d.toISOString().slice(0, 10);
    const entry = entries[dateStr] || null;
    weekDays.push({
      dateObj: d,
      dateStr,
      dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
      formattedDate: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      isToday: dateStr === todayStr,
      entry
    });
  }

  const handlePrevWeek = () => {
    const prev = new Date(monday);
    prev.setDate(monday.getDate() - 7);
    onDateChange(prev);
  };

  const handleNextWeek = () => {
    const next = new Date(monday);
    next.setDate(monday.getDate() + 7);
    onDateChange(next);
  };

  return (
    <div className="space-y-4 max-w-6xl mx-auto">
      
      {/* Week Navigator */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevWeek}
            className="w-8 h-8 rounded-lg bg-white/[0.03] hover:bg-white/10 flex items-center justify-center text-[#8e95a5] hover:text-white border border-white/[0.06]"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => onDateChange(new Date())}
            className="px-2.5 py-1 rounded-lg bg-white/[0.03] hover:bg-white/10 text-xs font-mono text-[#8e95a5] hover:text-white border border-white/[0.06]"
          >
            Today
          </button>

          <button
            onClick={handleNextWeek}
            className="w-8 h-8 rounded-lg bg-white/[0.03] hover:bg-white/10 flex items-center justify-center text-[#8e95a5] hover:text-white border border-white/[0.06]"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <h3 className="font-serif text-lg font-medium text-[#f5f2ea]">
          {weekDays[0].formattedDate} — {weekDays[6].formattedDate}
        </h3>
      </div>

      {/* 7-Day Clean Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-7 gap-3">
        {weekDays.map(({ dateStr, dayName, formattedDate, isToday, entry }) => {
          const rating = entry?.rating;
          const meta = rating ? ratingMeta[rating] : null;
          const IconComp = meta ? IconMap[meta.icon] : null;

          return (
            <div
              key={dateStr}
              className={`minimal-card p-4 flex flex-col justify-between min-h-[220px] transition-all ${
                isToday ? 'border-amber-400/40 bg-white/[0.03]' : ''
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs text-[#8e95a5] uppercase">
                    {dayName}
                  </span>
                  {isToday && (
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-amber-300">
                      Today
                    </span>
                  )}
                </div>

                <div className="font-serif font-semibold text-lg text-[#f5f2ea] mb-3">
                  {formattedDate}
                </div>

                {/* Rating state */}
                {entry ? (
                  <div 
                    onClick={() => onOpenDetail(dateStr)}
                    className="cursor-pointer p-3 rounded-xl border border-white/[0.08] bg-white/[0.02] text-center my-2 hover:bg-white/[0.05] transition-all"
                  >
                    {IconComp && (
                      <div className="flex justify-center mb-1" style={{ color: meta.color }}>
                        <IconComp className="w-6 h-6 stroke-[1.75]" />
                      </div>
                    )}
                    <span className="font-serif text-xs font-medium" style={{ color: meta.color }}>
                      {meta.title}
                    </span>
                  </div>
                ) : (
                  <div className="space-y-2 my-2">
                    <div className="text-[11px] font-mono text-[#5a6170] text-center">
                      Quick Log
                    </div>
                    <div className="flex items-center justify-center gap-1">
                      {[1, 2, 3, 4, 5].map((val) => {
                        const m = ratingMeta[val];
                        const SvgIcon = IconMap[m.icon];
                        return (
                          <button
                            key={val}
                            onClick={() => onQuickRate(dateStr, val)}
                            title={m.title}
                            className="w-6 h-6 rounded flex items-center justify-center hover:bg-white/10 transition-transform hover:scale-110"
                            style={{ color: m.color }}
                          >
                            <SvgIcon className="w-3.5 h-3.5" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Note snippet */}
                {entry?.notes && (
                  <p className="text-xs font-serif italic text-[#c8c4bc] line-clamp-2 mt-2">
                    "{entry.notes}"
                  </p>
                )}
              </div>

              {/* Bottom Action */}
              <div className="pt-2 border-t border-white/[0.04] mt-2 text-right">
                <button
                  onClick={() => onOpenDetail(dateStr)}
                  className="text-[11px] font-mono text-[#8e95a5] hover:text-white"
                >
                  {entry ? 'Edit' : '+ Note'}
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
