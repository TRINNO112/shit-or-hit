import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalIcon,
  AlertCircle,
  CloudRain,
  MinusCircle,
  Zap,
  Sparkles,
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

export default function CalendarModal({ 
  isOpen, 
  onClose, 
  entries, 
  startDate, 
  todayStr,
  onEditDay,
  onOpenMonthlyReport
}) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1; // 1-indexed for report

  const handlePrev = () => setCurrentDate(new Date(year, month - 2, 1));
  const handleNext = () => setCurrentDate(new Date(year, month, 1));

  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  const totalDays = lastDay.getDate();

  const startDay = firstDay.getDay();
  const leadingBlanks = (startDay === 0 ? 6 : startDay - 1);

  const days = [];
  for (let d = 1; d <= totalDays; d++) {
    const dObj = new Date(year, month - 1, d);
    const yStr = dObj.getFullYear();
    const mStr = String(dObj.getMonth() + 1).padStart(2, '0');
    const dStr = String(dObj.getDate()).padStart(2, '0');
    const dateStr = `${yStr}-${mStr}-${dStr}`;
    
    // Check if before start date
    const isBeforeStart = dateStr < startDate;
    const isFuture = dateStr > todayStr;
    const entry = entries[dateStr] || null;

    // Calculate dayIndex from startDate
    const startObj = new Date(`${startDate}T00:00:00`);
    const thisObj = new Date(`${dateStr}T00:00:00`);
    const dayIndex = Math.max(1, Math.floor((thisObj - startObj) / (1000 * 60 * 60 * 24)) + 1);

    days.push({
      dayNumber: d,
      dayIndex,
      dateStr,
      isToday: dateStr === todayStr,
      isBeforeStart,
      isFuture,
      entry
    });
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/65 backdrop-blur-xs overflow-y-auto"
          onClick={onClose}
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className="neo-card w-full max-w-3xl bg-white my-auto max-h-[92vh] flex flex-col justify-between overflow-hidden" 
            style={{ padding: '24px 28px' }}
            onClick={(e) => e.stopPropagation()}
          >
            
            {/* Sticky Header with prominent AI Report & Close buttons */}
            <div className="flex flex-wrap items-center justify-between pb-3.5 mb-4 border-b-2 border-black/10 shrink-0 gap-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FDC800] border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_#000000]">
                  <CalIcon className="w-5 h-5 text-black stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="font-display font-black text-xl text-black uppercase leading-tight">
                    {monthName}
                  </h3>
                  <span className="text-xs font-mono font-bold text-neutral-500">
                    Click any active day to view or edit reflection
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Launch AI Report for this specific month */}
                {onOpenMonthlyReport && (
                  <button
                    onClick={() => onOpenMonthlyReport({ year, month })}
                    title={`Generate AI Performance Report for ${monthName}`}
                    className="neo-btn px-3 py-1.5 bg-[#FDC800] text-black font-mono font-black text-xs flex items-center gap-1.5 shadow-[2px_2px_0px_#000000] cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>AI REPORT</span>
                  </button>
                )}

                <button
                  onClick={handlePrev}
                  title="Previous Month"
                  className="neo-btn p-2 text-black cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4 stroke-[3]" />
                </button>

                <button
                  onClick={handleNext}
                  title="Next Month"
                  className="neo-btn p-2 text-black cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4 stroke-[3]" />
                </button>

                {/* High-visibility Close Button with text and icon */}
                <button
                  onClick={onClose}
                  title="Close Calendar (Esc / Click Outside)"
                  className="neo-btn px-3.5 py-2 bg-[#FF4D4D] hover:bg-red-400 text-black flex items-center gap-1.5 cursor-pointer ml-1"
                >
                  <X className="w-4 h-4 stroke-[3]" />
                  <span className="font-mono text-xs font-black">CLOSE</span>
                </button>
              </div>
            </div>

            {/* Scrollable / Scalable Grid Container */}
            <div className="overflow-y-auto pr-1">
              {/* Day of Week Headers */}
              <div className="grid grid-cols-7 gap-2 mb-2 text-center">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                  <div key={day} className="font-mono font-black text-xs text-black uppercase py-1 bg-neutral-100 border border-black/10 rounded-lg">
                    {day}
                  </div>
                ))}
              </div>

              {/* Days Grid with responsive height */}
              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: leadingBlanks }).map((_, i) => (
                  <div key={`blank-${i}`} className="min-h-[58px] sm:min-h-[68px] rounded-xl bg-neutral-50 border border-neutral-200/50 opacity-20" />
                ))}

                {days.map(({ dayNumber, dayIndex, dateStr, isToday, isBeforeStart, isFuture, entry }) => {
                  const rating = entry?.rating;
                  const meta = rating ? ratingMeta[rating] : null;
                  const SvgIcon = meta ? IconMap[meta.icon] : null;
                  const isEditable = !isBeforeStart && !isFuture;

                  return (
                    <div
                      key={dateStr}
                      onClick={() => {
                        if (isEditable && onEditDay) {
                          onEditDay({ dateStr, dayIndex, entry });
                        }
                      }}
                      className={`min-h-[58px] sm:min-h-[68px] p-2 rounded-xl border-2 border-black flex flex-col justify-between transition-all relative group ${
                        isToday ? 'bg-[#FFFDF5] ring-2 ring-black shadow-[2px_2px_0px_#000000]' : 'bg-white'
                      } ${isBeforeStart ? 'opacity-25 bg-neutral-100' : ''} ${isEditable ? 'cursor-pointer hover:scale-[1.03]' : ''}`}
                      style={{ backgroundColor: meta ? meta.bg : undefined }}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`font-mono text-[11px] font-black ${isToday ? 'bg-black text-white px-1.5 rounded' : 'text-black'}`}>
                          {dayNumber}
                        </span>

                        {isEditable && (
                          <PenLine className="w-3 h-3 text-black opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                      </div>

                      <div className="my-auto text-center">
                        {SvgIcon && (
                          <SvgIcon className="w-4 h-4 sm:w-5 sm:h-5 text-black stroke-[2.5] mx-auto" />
                        )}
                      </div>

                      <div className="text-[8px] sm:text-[9px] font-mono font-bold text-black uppercase truncate text-right">
                        {meta ? meta.title : isBeforeStart ? '—' : ''}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Legend */}
            <div className="mt-4 pt-3.5 border-t-2 border-black/10 flex flex-wrap items-center justify-between gap-2.5 text-xs font-mono font-bold shrink-0">
              <span className="text-neutral-700">RATING SCALE:</span>
              <div className="flex flex-wrap items-center gap-2.5">
                {[1, 2, 3, 4, 5].map((val) => {
                  const m = ratingMeta[val];
                  return (
                    <div key={val} className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full border border-black" style={{ backgroundColor: m.bg }} />
                      <span className="text-[11px]">{m.title}</span>
                    </div>
                  );
                })}
              </div>
            </div>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

