import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Flame, 
  Zap, 
  Award, 
  Activity, 
  BarChart3, 
  TrendingUp, 
  Calendar, 
  ShieldCheck, 
  Sparkles,
  Layers,
  BatteryCharging
} from 'lucide-react';
import { ratingMeta } from '../services/api';

import mascot1 from '../assets/mascots/mascot_1_rough.png';
import mascot2 from '../assets/mascots/mascot_2_down.png';
import mascot3 from '../assets/mascots/mascot_3_okay.png';
import mascot4 from '../assets/mascots/mascot_4_good.png';
import mascot5 from '../assets/mascots/mascot_5_peak.png';

export default function ForensicStatsModal({
  isOpen,
  onClose,
  entries = {},
  startDate = '2026-08-01',
  todayStr
}) {
  const [activeTab, setActiveTab] = useState('telemetry'); // 'telemetry' | 'archetypes' | 'weekdays'

  if (!isOpen) return null;

  // 1. Calculate Core Analytics
  const entryList = Object.entries(entries).map(([date, data]) => ({
    date,
    ...data
  })).sort((a, b) => a.date.localeCompare(b.date));

  const totalLogged = entryList.length;
  const hits = entryList.filter(e => (e.rating || 0) >= 3).length;
  const peakDays = entryList.filter(e => e.rating === 5).length;
  const goodDays = entryList.filter(e => e.rating === 4).length;
  const baselineDays = entryList.filter(e => e.rating === 3).length;
  const slumpDays = entryList.filter(e => e.rating === 2).length;
  const roughDays = entryList.filter(e => e.rating === 1).length;

  const hitPercentage = totalLogged > 0 ? Math.round((hits / totalLogged) * 100) : 0;
  
  // Average Score
  const totalScore = entryList.reduce((acc, curr) => acc + (curr.rating || 0), 0);
  const avgScore = totalLogged > 0 ? (totalScore / totalLogged).toFixed(1) : '0.0';

  // Streak Calculation
  let currentStreak = 0;
  let maxStreak = 0;
  let tempStreak = 0;
  
  entryList.forEach(e => {
    if (e.rating && e.rating >= 3) {
      tempStreak++;
      if (tempStreak > maxStreak) maxStreak = tempStreak;
    } else {
      tempStreak = 0;
    }
  });
  currentStreak = tempStreak;

  // Day of Week Distribution
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayStats = [0, 1, 2, 3, 4, 5, 6].map(dayIndex => {
    const matching = entryList.filter(e => {
      const d = new Date(`${e.date}T00:00:00`);
      return d.getDay() === dayIndex;
    });
    const avg = matching.length > 0
      ? (matching.reduce((acc, c) => acc + (c.rating || 0), 0) / matching.length).toFixed(1)
      : '-';
    return {
      day: weekdays[dayIndex],
      count: matching.length,
      avg: avg
    };
  });

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.94, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.94, y: 20 }}
          className="w-full max-w-2xl bg-[#FFFDF5] rounded-3xl border-3 border-black p-5 sm:p-7 shadow-[8px_8px_0px_#000000] space-y-5 max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Clean Header with Zero Overlapping Badges */}
          <div className="flex items-center justify-between border-b-2 border-black/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-[#00E599] border-2 border-black flex items-center justify-center shadow-[2.5px_2.5px_0px_#000000] shrink-0">
                <Activity className="w-6 h-6 text-black stroke-[2.5]" />
              </div>
              <div>
                <h3 className="font-display font-black text-lg sm:text-xl uppercase leading-tight text-black">
                  Forensic Telemetry Hub
                </h3>
                <p className="text-xs font-mono text-neutral-600">
                  Unfiltered performance forensics & momentum diagnostics
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-neutral-200 border-2 border-transparent hover:border-black cursor-pointer transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Spacious, Uncluttered Tabs */}
          <div className="grid grid-cols-3 gap-2 p-1.5 bg-neutral-100 rounded-2xl border-2 border-black">
            <button
              type="button"
              onClick={() => setActiveTab('telemetry')}
              className={`py-2.5 px-2 rounded-xl font-display font-black text-xs uppercase flex items-center justify-center gap-2 cursor-pointer transition-all ${
                activeTab === 'telemetry'
                  ? 'bg-[#FDC800] border-2 border-black text-black shadow-[2px_2px_0px_#000000]'
                  : 'text-neutral-600 hover:text-black'
              }`}
            >
              <Zap className="w-4 h-4 shrink-0" />
              <span className="truncate">Telemetry</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('archetypes')}
              className={`py-2.5 px-2 rounded-xl font-display font-black text-xs uppercase flex items-center justify-center gap-2 cursor-pointer transition-all ${
                activeTab === 'archetypes'
                  ? 'bg-[#FDC800] border-2 border-black text-black shadow-[2px_2px_0px_#000000]'
                  : 'text-neutral-600 hover:text-black'
              }`}
            >
              <Award className="w-4 h-4 shrink-0" />
              <span className="truncate">Archetypes</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('weekdays')}
              className={`py-2.5 px-2 rounded-xl font-display font-black text-xs uppercase flex items-center justify-center gap-2 cursor-pointer transition-all ${
                activeTab === 'weekdays'
                  ? 'bg-[#FDC800] border-2 border-black text-black shadow-[2px_2px_0px_#000000]'
                  : 'text-neutral-600 hover:text-black'
              }`}
            >
              <BarChart3 className="w-4 h-4 shrink-0" />
              <span className="truncate">Weekdays</span>
            </button>
          </div>

          {/* TAB 1: CORE TELEMETRY BENTO */}
          {activeTab === 'telemetry' && (
            <div className="space-y-4">
              {/* 4-Bento Grid with Generous Padding */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white border-2 border-black rounded-2xl p-3.5 shadow-[3px_3px_0px_#000000]">
                  <span className="text-[10px] font-mono font-bold text-neutral-500 uppercase">Current Streak</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="font-display font-black text-2xl text-black">{currentStreak}</span>
                    <span className="text-xs font-mono font-bold text-neutral-600">DAYS</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-600 font-bold">🔥 Locked in</span>
                </div>

                <div className="bg-white border-2 border-black rounded-2xl p-3.5 shadow-[3px_3px_0px_#000000]">
                  <span className="text-[10px] font-mono font-bold text-neutral-500 uppercase">Hit Accuracy</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="font-display font-black text-2xl text-black">{hitPercentage}%</span>
                  </div>
                  <span className="text-[10px] font-mono text-neutral-600 font-bold">{hits} / {totalLogged} hits</span>
                </div>

                <div className="bg-white border-2 border-black rounded-2xl p-3.5 shadow-[3px_3px_0px_#000000]">
                  <span className="text-[10px] font-mono font-bold text-neutral-500 uppercase">Avg Quality</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="font-display font-black text-2xl text-black">{avgScore}</span>
                    <span className="text-xs font-mono text-neutral-500">/5.0</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#FDC800] font-black">★ Momentum</span>
                </div>

                <div className="bg-white border-2 border-black rounded-2xl p-3.5 shadow-[3px_3px_0px_#000000]">
                  <span className="text-[10px] font-mono font-bold text-neutral-500 uppercase">Total Days</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="font-display font-black text-2xl text-black">{totalLogged}</span>
                    <span className="text-xs font-mono font-bold text-neutral-600">LOGS</span>
                  </div>
                  <span className="text-[10px] font-mono text-blue-600 font-bold">⚡ Verifiable</span>
                </div>
              </div>

              {/* Dominant Archetype Banner */}
              <div className="bg-black text-white border-2 border-black rounded-2xl p-4 sm:p-5 shadow-[4px_4px_0px_#FDC800] flex items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <span className="px-2.5 py-0.5 rounded-md bg-[#FDC800] text-black text-[10px] font-mono font-black">
                    CURRENT DOMINANT ARCHETYPE
                  </span>
                  <h4 className="font-display font-black text-base sm:text-lg text-white">
                    {hitPercentage >= 75 ? '⚡ FOCUS WARRIOR (TIER IV)' : '☕ STOIC SUSTAINER (TIER III)'}
                  </h4>
                  <p className="text-xs font-mono text-neutral-400">
                    High consistency discipline profile with zero dopamine drift.
                  </p>
                </div>
                <div className="text-4xl shrink-0">
                  {hitPercentage >= 75 ? '🔥' : '☕'}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ARCHETYPE BREAKDOWN */}
          {activeTab === 'archetypes' && (
            <div className="space-y-3">
              {[
                { star: 5, title: 'God Mode / Peak Velocity', count: peakDays, color: '#FDC800', emoji: '👑', mascot: mascot5 },
                { star: 4, title: 'Locked In / Focus Warrior', count: goodDays, color: '#00E599', emoji: '🔥', mascot: mascot4 },
                { star: 3, title: 'Solid Baseline / Stoic Sustainer', count: baselineDays, color: '#CBD5E1', emoji: '☕', mascot: mascot3 },
                { star: 2, title: 'Low Battery / Recovery Agent', count: slumpDays, color: '#FF8A00', emoji: '🔋', mascot: mascot2 },
                { star: 1, title: 'Trench Survivor / Dopamine Goblin', count: roughDays, color: '#FF4D4D', emoji: '👺', mascot: mascot1 }
              ].map(item => {
                const percent = totalLogged > 0 ? Math.round((item.count / totalLogged) * 100) : 0;
                return (
                  <div key={item.star} className="bg-white border-2 border-black rounded-2xl p-3.5 shadow-[2.5px_2.5px_0px_#000000] flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <img src={item.mascot} alt={item.title} className="w-10 h-10 object-contain rounded-xl border border-black/10 bg-neutral-100 p-0.5 shrink-0" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="font-display font-black text-xs uppercase truncate">{item.title}</span>
                          <span className="text-[10px] font-mono font-bold text-neutral-500 shrink-0">({item.star}★)</span>
                        </div>
                        <div className="w-32 sm:w-48 bg-neutral-200 h-2.5 rounded-full overflow-hidden mt-1.5 border border-black/20">
                          <div className="h-full rounded-full transition-all" style={{ width: `${percent}%`, backgroundColor: item.color }} />
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-display font-black text-sm">{item.count} DAYS</span>
                      <div className="text-[10px] font-mono text-neutral-500 font-bold">{percent}%</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 3: WEEKDAY BREAKDOWN */}
          {activeTab === 'weekdays' && (
            <div className="space-y-4">
              <div className="grid grid-cols-7 gap-2">
                {dayStats.map((d) => (
                  <div key={d.day} className="bg-white border-2 border-black rounded-2xl py-3 px-1.5 text-center shadow-[2px_2px_0px_#000000]">
                    <span className="font-mono text-xs font-black text-neutral-600 block">{d.day}</span>
                    <span className="font-display font-black text-lg text-black mt-1 block">
                      {d.avg}
                    </span>
                    <span className="text-[10px] font-mono text-neutral-500 block mt-0.5">
                      {d.count}d
                    </span>
                  </div>
                ))}
              </div>
              <div className="bg-neutral-100 border-2 border-black rounded-2xl p-3.5 text-xs font-mono text-neutral-700 leading-relaxed">
                💡 <span className="font-bold">Forensic Insight:</span> Consistency across weekdays helps stabilize mood and avoids weekend velocity drops.
              </div>
            </div>
          )}

          {/* Action Footer */}
          <div className="pt-2 border-t-2 border-black/10 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="py-3 px-6 bg-black text-white hover:bg-neutral-800 font-display font-black text-xs uppercase rounded-xl border-2 border-black shadow-[2px_2px_0px_#000000] cursor-pointer"
            >
              CLOSE TELEMETRY
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
