import React from 'react';
import { Zap, Flame, Download, Calendar } from 'lucide-react';
import { exportDatabaseBackup } from '../services/api';

export default function Header({ 
  startDate, 
  entries, 
  dayCount,
  onToggleCalendar,
  isCalendarOpen
}) {
  const handleExport = () => {
    exportDatabaseBackup(startDate, entries);
  };

  return (
    <header className="w-full max-w-[1380px] mx-auto px-6 sm:px-10 pt-10 pb-6 flex items-center justify-between">
      
      {/* Brand: 100% Vector Lucide Icon, ZERO emojis */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-[#FDC800] border-2 border-black flex items-center justify-center text-black shadow-[3px_3px_0px_#000000]">
          <Zap className="w-7 h-7 text-black stroke-[3] fill-black" />
        </div>
        <div>
          <h1 className="font-display font-black text-2xl text-black tracking-tight leading-none uppercase">
            Daily Verdict
          </h1>
          <span className="text-xs font-mono font-bold text-neutral-600 block mt-1.5">
            Day 1 starts today • Local database active
          </span>
        </div>
      </div>

      {/* Actions: Streak, Calendar Toggle, Backup */}
      <div className="flex items-center gap-3.5">
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#00E599] border-2 border-black text-black text-xs font-mono font-black shadow-[3px_3px_0px_#000000]">
          <Flame className="w-4 h-4 text-black fill-black" />
          <span>DAY {dayCount}</span>
        </div>

        {/* Calendar Toggle Button */}
        <button
          onClick={onToggleCalendar}
          className={`px-4 py-2.5 rounded-xl border-2 border-black text-black text-xs font-mono font-black flex items-center gap-2 shadow-[3px_3px_0px_#000000] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_#000000] transition-all cursor-pointer ${
            isCalendarOpen ? 'bg-[#FDC800]' : 'bg-white'
          }`}
        >
          <Calendar className="w-4 h-4 stroke-[2.5]" />
          <span>{isCalendarOpen ? 'CLOSE CALENDAR' : 'CALENDAR'}</span>
        </button>

        {/* Backup Button */}
        <button
          onClick={handleExport}
          title="Backup JSON Data"
          className="px-4 py-2.5 rounded-xl bg-white border-2 border-black text-black text-xs font-mono font-black flex items-center gap-2 shadow-[3px_3px_0px_#000000] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_#000000] transition-all cursor-pointer"
        >
          <Download className="w-4 h-4 stroke-[2.5]" />
          <span className="hidden sm:inline">BACKUP</span>
        </button>
      </div>

    </header>
  );
}
