import React from 'react';
import { 
  AlertCircle, 
  CloudRain, 
  MinusCircle, 
  Zap, 
  Sparkles,
  Calendar
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
    <div className="neo-card p-6 bg-white flex flex-col justify-between h-full">
      
      <div>
        {/* Section Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-black stroke-[2.5]" />
            <h3 className="font-display font-black text-base text-black uppercase tracking-wider">
              JOURNEY TIMELINE
            </h3>
          </div>

          <span className="text-xs font-mono font-black px-2 py-0.5 bg-black text-white rounded-md shadow-[2px_2px_0px_#FDC800]">
            {totalLogged} LOGGED
          </span>
        </div>

        {/* Day Cards List */}
        <div className="space-y-3">
          {daysList.map(({ dayIndex, dateStr, dateFormatted, isToday, entry }) => {
            const rating = entry?.rating;
            const meta = rating ? ratingMeta[rating] : null;
            const SvgIcon = meta ? IconMap[meta.icon] : null;

            return (
              <div
                key={dateStr}
                className={`p-3.5 rounded-xl border-2 border-black flex items-center justify-between shadow-[3px_3px_0px_#000000] transition-all ${
                  isToday ? 'bg-[#FFFDF5] border-[2.5px]' : 'bg-white'
                }`}
              >
                {/* Left: Day & Date */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FDC800] border-2 border-black flex flex-col items-center justify-center text-black shadow-[2px_2px_0px_#000000]">
                    <span className="text-[9px] font-mono font-black leading-none">DAY</span>
                    <span className="font-display font-black text-sm leading-none mt-0.5">{dayIndex}</span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-display font-black text-sm text-black uppercase">
                        {dateFormatted}
                      </span>
                      {isToday && (
                        <span className="text-[9px] font-mono font-black px-2 py-0.5 rounded-full bg-black text-white">
                          TODAY
                        </span>
                      )}
                    </div>
                    {entry?.notes && (
                      <p className="text-xs font-mono text-neutral-700 line-clamp-1 mt-0.5">
                        "{entry.notes}"
                      </p>
                    )}
                  </div>
                </div>

                {/* Right: Badge */}
                <div>
                  {entry ? (
                    <div 
                      className="flex items-center gap-1.5 px-3 py-1 rounded-xl border-2 border-black text-xs font-display font-black uppercase text-black shadow-[2px_2px_0px_#000000]"
                      style={{ backgroundColor: meta.bg }}
                    >
                      {SvgIcon && <SvgIcon className="w-3.5 h-3.5 stroke-[3]" />}
                      <span>{meta.title}</span>
                    </div>
                  ) : (
                    <span className="text-xs font-mono font-bold text-neutral-400">
                      PENDING
                    </span>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-6 pt-4 border-t-2 border-black/10 text-right">
        <span className="text-[11px] font-mono font-bold text-neutral-500">
          Tracking forward from {startDate}
        </span>
      </div>

    </div>
  );
}
