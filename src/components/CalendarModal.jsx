import React, { useState } from 'react';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalIcon,
  AlertCircle,
  CloudRain,
  MinusCircle,
  Zap,
  Sparkles
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
  todayStr 
}) {
  if (!isOpen) return null;

  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrev = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNext = () => setCurrentDate(new Date(year, month + 1, 1));

  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const totalDays = lastDay.getDate();

  const startDay = firstDay.getDay();
  const leadingBlanks = (startDay === 0 ? 6 : startDay - 1);

  const days = [];
  for (let d = 1; d <= totalDays; d++) {
    const dObj = new Date(year, month, d);
    const yStr = dObj.getFullYear();
    const mStr = String(dObj.getMonth() + 1).padStart(2, '0');
    const dStr = String(dObj.getDate()).padStart(2, '0');
    const dateStr = `${yStr}-${mStr}-${dStr}`;
    
    // Check if before start date
    const isBeforeStart = dateStr < startDate;
    const entry = entries[dateStr] || null;

    days.push({
      dayNumber: d,
      dateStr,
      isToday: dateStr === todayStr,
      isBeforeStart,
      entry
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="neo-card w-full max-w-3xl bg-white animate-slide-up" style={{ padding: '32px 36px' }}>
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-6 border-b-2 border-black/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FDC800] border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_#000000]">
              <CalIcon className="w-5 h-5 text-black stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-display font-black text-xl text-black uppercase">
                {monthName}
              </h3>
              <span className="text-xs font-mono font-bold text-neutral-500">
                Monthly quality overview
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              className="neo-btn p-2 text-black"
            >
              <ChevronLeft className="w-4 h-4 stroke-[3]" />
            </button>

            <button
              onClick={handleNext}
              className="neo-btn p-2 text-black"
            >
              <ChevronRight className="w-4 h-4 stroke-[3]" />
            </button>

            <button
              onClick={onClose}
              className="neo-btn p-2 bg-red-100 hover:bg-red-200 text-black ml-2"
            >
              <X className="w-4 h-4 stroke-[3]" />
            </button>
          </div>
        </div>

        {/* Day of Week Headers */}
        <div className="grid grid-cols-7 gap-2.5 mb-2.5 text-center">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
            <div key={day} className="font-mono font-black text-xs text-black uppercase py-1">
              {day}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-2.5">
          {Array.from({ length: leadingBlanks }).map((_, i) => (
            <div key={`blank-${i}`} className="min-h-[70px] rounded-xl bg-neutral-50 border border-neutral-200 opacity-30" />
          ))}

          {days.map(({ dayNumber, dateStr, isToday, isBeforeStart, entry }) => {
            const rating = entry?.rating;
            const meta = rating ? ratingMeta[rating] : null;
            const SvgIcon = meta ? IconMap[meta.icon] : null;

            return (
              <div
                key={dateStr}
                className={`min-h-[75px] p-2.5 rounded-xl border-2 border-black flex flex-col justify-between transition-all ${
                  isToday ? 'bg-[#FFFDF5] ring-2 ring-black shadow-[2px_2px_0px_#000000]' : 'bg-white'
                } ${isBeforeStart ? 'opacity-30 bg-neutral-100' : ''}`}
                style={{ backgroundColor: meta ? meta.bg : undefined }}
              >
                <div className="flex items-center justify-between">
                  <span className={`font-mono text-xs font-black ${isToday ? 'bg-black text-white px-1.5 rounded' : 'text-black'}`}>
                    {dayNumber}
                  </span>
                </div>

                <div className="my-auto text-center">
                  {SvgIcon && (
                    <SvgIcon className="w-5 h-5 text-black stroke-[2.5] mx-auto" />
                  )}
                </div>

                <div className="text-[9px] font-mono font-bold text-black uppercase truncate text-right">
                  {meta ? meta.title : isBeforeStart ? '—' : ''}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-6 pt-4 border-t-2 border-black/10 flex flex-wrap items-center justify-between gap-3 text-xs font-mono font-bold">
          <span>RATING SCALE:</span>
          <div className="flex items-center gap-3">
            {[1, 2, 3, 4, 5].map((val) => {
              const m = ratingMeta[val];
              return (
                <div key={val} className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full border border-black" style={{ backgroundColor: m.bg }} />
                  <span>{m.title}</span>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
