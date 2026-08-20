import React from 'react';
import { 
  AlertCircle, 
  CloudRain, 
  MinusCircle, 
  Zap, 
  Sparkles,
  Calendar,
  PenLine
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
  entries,
  onEditDay
}) {
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

  const totalLogged = Object.keys(entries).length;

  return (
    <div className="neo-card bg-white flex flex-col justify-between h-full" style={{ padding: '32px 36px' }}>
      
      <div>
        {/* Section Header */}
        <div className="flex items-center justify-between mb-6 pb-2 border-b-2 border-black/10">
          <div className="flex items-center gap-2.5">
            <Calendar className="w-5 h-5 text-black stroke-[2.5]" />
            <h3 className="font-display font-black text-lg text-black uppercase tracking-wider">
              JOURNEY TIMELINE
            </h3>
          </div>

          <span className="text-xs font-mono font-black px-3 py-1 bg-black text-white rounded-md shadow-[2px_2px_0px_#FDC800]">
            {totalLogged} LOGGED
          </span>
        </div>

        {/* Day Cards List */}
        <div className="space-y-3.5">
          {daysList.map(({ dayIndex, dateStr, dateFormatted, isToday, entry }) => {
            const rating = entry?.rating;
            const meta = rating ? ratingMeta[rating] : null;
            const SvgIcon = meta ? IconMap[meta.icon] : null;

            return (
              <div
                key={dateStr}
                className={`p-4 rounded-xl border-2 border-black flex items-center justify-between shadow-[3px_3px_0px_#000000] transition-all group ${
                  isToday ? 'bg-[#FFFDF5] border-[2.5px]' : 'bg-white'
                }`}
              >
                {/* Left: Day & Date */}
                <div className="flex items-center gap-3.5 flex-1 pr-3">
                  <div className="w-11 h-11 rounded-xl bg-[#FDC800] border-2 border-black flex flex-col items-center justify-center text-black shadow-[2px_2px_0px_#000000] shrink-0">
                    <span className="text-[9px] font-mono font-black leading-none">DAY</span>
                    <span className="font-display font-black text-sm leading-none mt-0.5">{dayIndex}</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-display font-black text-sm text-black uppercase">
                        {dateFormatted}
                      </span>
                      {isToday && (
                        <span className="text-[9px] font-mono font-black px-2 py-0.5 rounded-full bg-black text-white shrink-0">
                          TODAY
                        </span>
                      )}
                    </div>
                    {entry?.notes ? (
                      <p className="text-xs font-mono text-neutral-700 line-clamp-1 mt-1 font-semibold">
                        "{entry.notes}"
                      </p>
                    ) : (
                      <p className="text-[11px] font-mono text-neutral-400 mt-0.5">
                        No reflection note
                      </p>
                    )}
                  </div>
                </div>

                {/* Right: Badge & Quick Edit Trigger */}
                <div className="flex items-center gap-2.5 shrink-0">
                  {entry ? (
                    <div 
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 border-black text-xs font-display font-black uppercase text-black shadow-[2px_2px_0px_#000000]"
                      style={{ backgroundColor: meta.bg }}
                    >
                      {SvgIcon && <SvgIcon className="w-4 h-4 stroke-[3]" />}
                      <span>{meta.title}</span>
                    </div>
                  ) : (
                    <span className="text-xs font-mono font-bold text-neutral-400 bg-neutral-100 px-3 py-1.5 rounded-lg border border-neutral-300">
                      PENDING
                    </span>
                  )}

                  {/* Edit Button */}
                  <button
                    onClick={() => onEditDay({ dateStr, dayIndex, entry })}
                    title="Edit Rating & Reflection"
                    className="p-2 rounded-lg border-2 border-black bg-white hover:bg-[#FDC800] text-black shadow-[2px_2px_0px_#000000] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_#000000] active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer"
                  >
                    <PenLine className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-8 pt-4 border-t-2 border-black/10 text-right">
        <span className="text-xs font-mono font-bold text-neutral-500">
          Tracking forward from {startDate}
        </span>
      </div>

    </div>
  );
}
