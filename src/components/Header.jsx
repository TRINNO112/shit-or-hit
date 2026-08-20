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
    <header className="w-full max-w-4xl mx-auto px-4 pt-6 pb-2 flex items-center justify-between">
      
      {/* Brand */}
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-display font-black text-base shadow-sm">
          ⚡
        </div>
        <div>
          <h1 className="font-display font-bold text-base text-slate-900 tracking-tight leading-none">
            Daily Quality
          </h1>
          <span className="text-[11px] font-mono text-slate-400">
            Day 1 starts today
          </span>
        </div>
      </div>

      {/* Streak Pill & Backup */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200/80 text-amber-900 text-xs font-mono font-bold shadow-xs">
          <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
          <span>Day {dayCount}</span>
        </div>

        <button
          onClick={handleExport}
          title="Backup JSON Data"
          className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-500 hover:text-slate-900 hover:border-slate-300 flex items-center justify-center shadow-xs transition-all"
        >
          <Download className="w-3.5 h-3.5" />
        </button>
      </div>

    </header>
  );
}
