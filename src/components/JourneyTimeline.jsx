import React from 'react';
import { 
  AlertCircle, 
  CloudRain, 
  MinusCircle, 
  Zap, 
  Sparkles,
  Calendar,
  Sparkle
} from 'lucide-react';
import { ratingMeta } from '../services/api';

const IconMap = {
  AlertCircle,
  CloudRain,
  MinusCircle,
  Zap,
  Sparkles
};

export default function JourneyTimeline({ 
  startDate, 
  todayStr, 
  entries 
}) {
  // Generate all dates from startDate to todayStr
  const start = new Date(`${startDate}T00:00:00`);
  const today = new Date(`${todayStr}T00:00:00`);

  const daysList = [];
  const current = new Date(start);
  let dayIndex = 1;

  while (current <= today) {
    const yStr = current.getFullYear();
    const mStr = String(current.getMonth() + 1).padStart(2, '0');
    const dStr = String(current.getDate()).padStart(2, '0');
    const dateStr = `${yStr}-${mStr}-${dStr}`;

    const entry = entries[dateStr] || null;
    const isToday = dateStr === todayStr;

    daysList.push({
      dayIndex,
      dateStr,
      dateFormatted: current.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      isToday,
      entry
    });

    current.setDate(current.getDate() + 1);
    dayIndex++;
  }

  // Reverse so newest / today is at the top/front if long, or keep chronological
  const totalLogged = Object.keys(entries).length;

  return (
    <div className="max-w-2xl mx-auto mt-8">
      
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-400" />
          <h3 className="font-display font-bold text-sm text-slate-800 uppercase tracking-wider">
            Your Journey Since Day 1
          </h3>
        </div>

        <span className="text-xs font-mono text-slate-500">
          {totalLogged} logged day{totalLogged === 1 ? '' : 's'}
        </span>
      </div>

      {/* Day Cards List (Starts strictly from Day 1 / today) */}
      <div className="space-y-2.5">
        {daysList.map(({ dayIndex, dateStr, dateFormatted, isToday, entry }) => {
          const rating = entry?.rating;
          const meta = rating ? ratingMeta[rating] : null;
          const SvgIcon = meta ? IconMap[meta.icon] : null;

          return (
            <div
              key={dateStr}
              className={`white-card p-4 flex items-center justify-between transition-all ${
                isToday ? 'ring-2 ring-slate-900/10' : ''
              }`}
            >
              {/* Left: Day number and date */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex flex-col items-center justify-center text-slate-800">
                  <span className="text-[10px] font-mono font-bold leading-none text-slate-500">DAY</span>
                  <span className="font-display font-black text-sm leading-none mt-0.5">{dayIndex}</span>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-display font-bold text-sm text-slate-900">
                      {dateFormatted}
                    </span>
                    {isToday && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-900 text-white font-semibold">
                        Today
                      </span>
                    )}
                  </div>
                  {entry?.notes && (
                    <p className="text-xs text-slate-500 line-clamp-1 mt-0.5 font-sans">
                      "{entry.notes}"
                    </p>
                  )}
                </div>
              </div>

              {/* Right: Logged Rating Badge or Pending State */}
              <div>
                {entry ? (
                  <div 
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-display font-bold"
                    style={{
                      backgroundColor: meta.bg,
                      borderColor: meta.border,
                      color: meta.color
                    }}
                  >
                    {SvgIcon && <SvgIcon className="w-4 h-4 stroke-[2.5]" />}
                    <span>{meta.title}</span>
                  </div>
                ) : (
                  <span className="text-xs font-mono text-slate-400">
                    Not logged yet
                  </span>
                )}
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
