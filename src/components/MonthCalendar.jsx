import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
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

export default function MonthCalendar({ 
  entries, 
  onSelectDate, 
  todayStr 
}) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

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
    const entry = entries[dateStr] || null;

    days.push({
      dayNumber: d,
      dateStr,
      isToday: dateStr === todayStr,
      entry
    });
  }

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevMonth}
            className="w-8 h-8 rounded-lg bg-white/[0.03] hover:bg-white/10 flex items-center justify-center text-[#8e95a5] hover:text-white border border-white/[0.06]"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-2.5 py-1 rounded-lg bg-white/[0.03] hover:bg-white/10 text-xs font-mono text-[#8e95a5] hover:text-white border border-white/[0.06]"
          >
            This Month
          </button>

          <button
            onClick={handleNextMonth}
            className="w-8 h-8 rounded-lg bg-white/[0.03] hover:bg-white/10 flex items-center justify-center text-[#8e95a5] hover:text-white border border-white/[0.06]"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <h3 className="font-serif text-xl font-medium text-[#f5f2ea]">
          {monthName}
        </h3>
      </div>

      {/* Grid */}
      <div className="minimal-card p-4 sm:p-6">
        
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-2 mb-3 text-center">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
            <div key={d} className="text-xs font-mono text-[#8e95a5] uppercase py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: leadingBlanks }).map((_, i) => (
            <div key={`blank-${i}`} className="min-h-[70px] rounded-xl bg-transparent" />
          ))}

          {days.map(({ dayNumber, dateStr, isToday, entry }) => {
            const meta = entry?.rating ? ratingMeta[entry.rating] : null;
            const IconComp = meta ? IconMap[meta.icon] : null;

            return (
              <div
                key={dateStr}
                onClick={() => onSelectDate(dateStr)}
                className={`min-h-[70px] sm:min-h-[85px] p-2 rounded-xl border flex flex-col justify-between cursor-pointer transition-all hover:border-white/20 ${
                  isToday 
                    ? 'border-amber-400/50 bg-white/[0.04]' 
                    : 'border-white/[0.05] bg-white/[0.01]'
                }`}
                style={{
                  backgroundColor: meta ? meta.bg : undefined,
                  borderColor: meta ? meta.border : undefined
                }}
              >
                <div className="flex items-center justify-between">
                  <span className={`font-mono text-xs ${isToday ? 'text-amber-300 font-bold' : 'text-[#8e95a5]'}`}>
                    {dayNumber}
                  </span>
                </div>

                <div className="my-auto text-center">
                  {IconComp && (
                    <div className="inline-block" style={{ color: meta.color }}>
                      <IconComp className="w-5 h-5 stroke-[1.75]" />
                    </div>
                  )}
                </div>

                <div className="text-[10px] font-mono text-[#8e95a5] text-right truncate">
                  {meta ? meta.title : ''}
                </div>
              </div>
            );
          })}
        </div>

      </div>

    </div>
  );
}
