import React from 'react';
import { Flame, Download, Sparkles } from 'lucide-react';
import { exportDatabaseBackup } from '../services/api';

export default function Header({ 
  startDate, 
  entries, 
  dayCount,
  currentStreak 
}) {
  const handleExport = () => {
    exportDatabaseBackup(startDate, entries);
  };

  return (
    <header className="w-full max-w-[1440px] mx-auto px-6 md:px-10 pt-6 pb-2 flex items-center justify-between">
      
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-[#FDC800] border-2 border-black flex items-center justify-center font-display font-black text-xl text-black shadow-[3px_3px_0px_#000000]">
          ⚡
        </div>
        <div>
          <h1 className="font-display font-black text-2xl text-black tracking-tight leading-none uppercase">
            Daily Verdict
          </h1>
          <span className="text-xs font-mono font-bold text-neutral-600">
            Day 1 starts today • Pure local persistence
          </span>
        </div>
      </div>

      {/* Streak Pill & Backup Button */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#00E599] border-2 border-black text-black text-xs font-mono font-black shadow-[3px_3px_0px_#000000]">
          <Flame className="w-4 h-4 text-black fill-black" />
          <span>DAY {dayCount}</span>
        </div>

        <button
          onClick={handleExport}
          title="Backup JSON Data"
          className="px-4 py-2 rounded-xl bg-white border-2 border-black text-black text-xs font-mono font-black flex items-center gap-2 shadow-[3px_3px_0px_#000000] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_#000000] transition-all cursor-pointer"
        >
          <Download className="w-4 h-4 stroke-[2.5]" />
          <span>BACKUP</span>
        </button>
      </div>

    </header>
  );
}
