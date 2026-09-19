import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  AlertOctagon, 
  CloudRain, 
  MinusCircle, 
  Zap, 
  Sparkles,
  Shield,
  Compass
} from 'lucide-react';
import { ratingMeta, isRehabilitationActive, getRehabilitationConfig } from '../services/api';

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
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const rehabConfig = getRehabilitationConfig();
  const isSabbatical = Boolean(rehabConfig?.isSabbatical) || (rehabConfig?.freezeDays && rehabConfig.freezeDays > 30);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Shift for Monday start: Mon=0, Sun=6
  const leadingBlanks = (firstDayOfMonth + 6) % 7;

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const days = [];
  for (let i = 1; i <= daysInMonth; i++) {
    const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    days.push({
      dayNumber: i,
      dateStr: dStr,
      isToday: dStr === todayStr,
      entry: entries[dStr] || null
    });
  }

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  return (
    <div className="w-full bg-[#12141a] rounded-2xl border border-white/10 p-5 shadow-2xl text-white">
      {/* Header controls */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
        <h3 className="font-mono text-lg font-bold tracking-tight">
          {monthNames[month]} <span className="text-white/40">{year}</span>
        </h3>
        <div className="flex gap-2">
          <button
            onClick={prevMonth}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={nextMonth}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="w-full">
        {/* Days of week */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => (
            <div key={idx} className="text-center font-mono text-xs font-bold text-white/40 py-1">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: leadingBlanks }).map((_, i) => (
            <div key={`blank-${i}`} className="min-h-17.5 rounded-xl bg-transparent" />
          ))}

          {days.map(({ dayNumber, dateStr, isToday, entry }) => {
            const meta = entry?.rating ? ratingMeta[entry.rating] : null;
            const inStasis = !entry?.rating && isRehabilitationActive(dateStr);
            const IconComp = meta ? IconMap[meta.icon] : inStasis ? (isSabbatical ? Compass : Shield) : null;

            return (
              <div
                key={dateStr}
                onClick={() => onSelectDate(dateStr)}
                className={`min-h-17.5 sm:min-h-21.25 p-2 rounded-xl border flex flex-col justify-between cursor-pointer transition-all hover:border-white/20 ${
                  isToday 
                    ? 'border-amber-400/50 bg-white/4' 
                    : inStasis
                    ? (isSabbatical ? 'border-amber-500/50 bg-amber-950/20' : 'border-emerald-500/50 bg-emerald-950/20')
                    : 'border-white/5 bg-white/1'
                }`}
                style={{
                  backgroundColor: meta ? meta.bg : inStasis ? (isSabbatical ? 'rgba(255, 184, 0, 0.15)' : 'rgba(0, 229, 153, 0.12)') : undefined,
                  borderColor: meta ? meta.border : inStasis ? (isSabbatical ? '#FFB800' : '#00E599') : undefined
                }}
              >
                <div className="flex items-center justify-between">
                  <span className={`font-mono text-xs ${isToday ? 'text-amber-300 font-bold' : inStasis ? (isSabbatical ? 'text-amber-400 font-bold' : 'text-emerald-400 font-bold') : 'text-[#8e95a5]'}`}>
                    {dayNumber}
                  </span>
                </div>

                <div className="my-auto text-center">
                  {IconComp && (
                    <div className="inline-block" style={{ color: meta ? meta.color : inStasis ? (isSabbatical ? '#FFB800' : '#00E599') : undefined }}>
                      <IconComp className="w-5 h-5 stroke-[1.75]" />
                    </div>
                  )}
                </div>

                <div className="text-[10px] font-mono text-[#8e95a5] text-right truncate">
                  {meta ? meta.title : inStasis ? (isSabbatical ? 'SABBATICAL' : 'SANCTUARY') : ''}
                </div>
              </div>
            );
          })}
        </div>

      </div>

    </div>
  );
}
