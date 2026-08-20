import React from 'react';
import { Flame, Download } from 'lucide-react';
import { exportDatabaseBackup } from '../services/api';

export default function Header({ 
  startDate, 
  entries, 
  dayCount 
}) {
  const handleExport = () => {
    exportDatabaseBackup(startDate, entries);
  };

  return (
    <header className="w-full max-w-3xl mx-auto px-4 pt-6 pb-2 flex items-center justify-between">
      
      {/* Brand */}
      <div className="flex items-center gap-2.5">
        <div className="w-10 h-10 rounded-xl bg-[#FDC800] border-2 border-black flex items-center justify-center font-display font-black text-lg text-black shadow-[3px_3px_0px_#000000]">
          ⚡
        </div>
        <div>
          <h1 className="font-display font-black text-xl text-black tracking-tight leading-none uppercase">
            Daily Verdict
          </h1>
          <span className="text-[11px] font-mono font-bold text-neutral-600">
            Day 1 starts today
          </span>
        </div>
      </div>

      {/* Streak Pill & Backup */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#00E599] border-2 border-black text-black text-xs font-mono font-black shadow-[3px_3px_0px_#000000]">
          <Flame className="w-4 h-4 text-black fill-black" />
          <span>DAY {dayCount}</span>
        </div>

        <button
          onClick={handleExport}
          title="Backup JSON Data"
          className="w-9 h-9 rounded-xl bg-white border-2 border-black text-black flex items-center justify-center shadow-[3px_3px_0px_#000000] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_#000000] transition-all cursor-pointer"
        >
          <Download className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>

    </header>
  );
}
