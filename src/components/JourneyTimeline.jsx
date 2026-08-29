import React from 'react';
import { motion } from 'framer-motion';
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
    <div className="neo-card bg-white flex flex-col justify-between h-full p-3.5 sm:p-6 lg:p-8">
      
      <div>
        {/* Section Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-6 pb-2 border-b-2 border-black/10">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-black stroke-[2.5]" />
            <h3 className="font-display font-black text-base sm:text-lg text-black uppercase tracking-wider">
              JOURNEY TIMELINE
            </h3>
          </div>

          <span className="text-[11px] sm:text-xs font-mono font-black px-2.5 py-1 bg-black text-white rounded-md shadow-[2px_2px_0px_#FDC800]">
            {totalLogged} LOGGED
          </span>
        </div>

        {/* Day Cards List with Guaranteed Uniform Height & Alignment */}
        <div className="space-y-2.5 sm:space-y-3.5">
          {daysList.map(({ dayIndex, dateStr, dateFormatted, isToday, entry }) => {
            const rating = entry?.rating;
            const meta = rating ? ratingMeta[rating] : null;
            const SvgIcon = meta ? IconMap[meta.icon] : null;

            return (
              <motion.div
                key={dateStr}
                layout
                whileHover={{ y: -2, scale: 1.005 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                className={`p-2.5 sm:p-3.5 rounded-xl border-2 border-black flex items-center justify-between shadow-[2.5px_2.5px_0px_#000000] transition-all group min-h-16 sm:min-h-17 ${
                  isToday ? 'bg-[#FFFDF5] border-[2.5px]' : 'bg-white'
                }`}
              >
                {/* Left: Day & Date */}
                <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 flex-1 pr-2 sm:pr-3">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#FDC800] border-2 border-black flex flex-col items-center justify-center text-black shadow-[1.5px_1.5px_0px_#000000] shrink-0">
                    <span className="text-[8px] sm:text-[9px] font-mono font-black leading-none">DAY</span>
                    <span className="font-display font-black text-xs sm:text-sm leading-none mt-0.5">{dayIndex}</span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="font-display font-black text-xs sm:text-sm text-black uppercase whitespace-nowrap truncate">
                        {dateFormatted}
                      </span>
                      {isToday && (
                        <span className="text-[8px] sm:text-[9px] font-mono font-black px-1.5 py-0.5 rounded-full bg-black text-white shrink-0">
                          TODAY
                        </span>
                      )}
                    </div>
                    {entry?.notes ? (
                      <p className="text-[11px] sm:text-xs font-mono text-neutral-700 truncate mt-0.5 font-medium">
                        "{entry.notes}"
                      </p>
                    ) : (
                      <p className="text-[10px] sm:text-[11px] font-mono text-neutral-400 mt-0.5 truncate">
                        No reflection note
                      </p>
                    )}
                  </div>
                </div>

                {/* Right: Badge & Quick Edit Trigger */}
                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                  {entry ? (
                    <div 
                      className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl border-2 border-black text-[11px] sm:text-xs font-display font-black uppercase text-black shadow-[1.5px_1.5px_0px_#000000] shrink-0"
                      style={{ backgroundColor: meta.bg }}
                    >
                      {SvgIcon && <SvgIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />}
                      <span className="whitespace-nowrap">{meta.title}</span>
                    </div>
                  ) : (
                    <span className="text-[10px] sm:text-xs font-mono font-bold text-neutral-400 bg-neutral-100 px-2 sm:px-2.5 py-1 rounded-lg border border-neutral-300 shrink-0">
                      PENDING
                    </span>
                  )}

                  {/* Edit Button with Spring Tap Physics */}
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: -3 }}
                    whileTap={{ scale: 0.9, rotate: 3 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                    onClick={() => onEditDay({ dateStr, dayIndex, entry })}
                    title="Edit Rating & Reflection"
                    className="p-1.5 sm:p-2 rounded-lg border-2 border-black bg-white hover:bg-[#FDC800] text-black shadow-[1.5px_1.5px_0px_#000000] cursor-pointer shrink-0"
                  >
                    <PenLine className="w-3.5 h-3.5 stroke-[2.5]" />
                  </motion.button>
                </div>

              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="mt-6 sm:mt-8 pt-3 sm:pt-4 border-t-2 border-black/10 text-right">
        <span className="text-[10px] sm:text-xs font-mono font-bold text-neutral-500">
          Tracking forward from {startDate}
        </span>
      </div>

    </div>
  );
}
