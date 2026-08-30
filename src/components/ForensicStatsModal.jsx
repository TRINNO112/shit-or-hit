import React from 'react';
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
import { ratingMeta, isSphereModeEnabled } from '../services/api';
import SphereIcon from './SphereIcon';

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
  const dayColors = ['#FF4D6D', '#FDC800', '#00E599', '#00D8F6', '#A855F7', '#EC4899', '#F97316'];
  
  const dayStats = [0, 1, 2, 3, 4, 5, 6].map(dayIndex => {
    const matching = entryList.filter(e => {
      const d = new Date(`${e.date}T00:00:00`);
      return d.getDay() === dayIndex;
    });
    const avgNum = matching.length > 0
      ? (matching.reduce((acc, c) => acc + (c.rating || 0), 0) / matching.length)
      : 0;
    return {
      day: weekdays[dayIndex],
      color: dayColors[dayIndex],
      count: matching.length,
      avgNum: avgNum,
      avg: avgNum > 0 ? avgNum.toFixed(1) : '0.0'
    };
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.94, y: 15 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.94, y: 15 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
            className="w-full max-w-2xl bg-[#FFFDF5] rounded-3xl border-3 border-black p-5 sm:p-6 shadow-[8px_8px_0px_#000000] space-y-4 max-h-[88vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
          {/* Pinned Header */}
          <div className="flex items-center justify-between border-b-2 border-black/10 pb-3 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#00E599] border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_#000000] shrink-0">
                <Activity className="w-5 h-5 text-black stroke-[2.5]" />
              </div>
              <div>
                <h3 className="font-display font-black text-lg uppercase leading-tight text-black">
                  Forensic Telemetry Hub
                </h3>
                <p className="text-xs font-mono text-neutral-600">
                  Unfiltered performance forensics & momentum analytics
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 sm:p-2.5 rounded-xl bg-[#FF4D4D] hover:bg-red-600 border-2 border-black text-black hover:text-white cursor-pointer shadow-[2px_2px_0px_#000000] active:scale-95 transition-all shrink-0"
              title="Close Telemetry Hub"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5 stroke-3" />
            </button>
          </div>

          {/* Scrollable Telemetry Body */}
          <div className="space-y-4 overflow-y-auto flex-1 pr-1">

            {/* SECTION 1: CORE TELEMETRY BENTO */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="bg-white border-2 border-black rounded-2xl p-3 shadow-[2.5px_2.5px_0px_#000000]">
                <span className="text-[10px] font-mono font-bold text-neutral-500 uppercase">Streak</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="font-display font-black text-xl text-black">{currentStreak}</span>
                  <span className="text-[10px] font-mono font-bold text-neutral-600">DAYS</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-600 font-bold">🔥 Active</span>
              </div>

              <div className="bg-white border-2 border-black rounded-2xl p-3 shadow-[2.5px_2.5px_0px_#000000]">
                <span className="text-[10px] font-mono font-bold text-neutral-500 uppercase">Hit Rate</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="font-display font-black text-xl text-black">{hitPercentage}%</span>
                </div>
                <span className="text-[10px] font-mono text-neutral-600 font-bold">{hits}/{totalLogged} hits</span>
              </div>

              <div className="bg-white border-2 border-black rounded-2xl p-3 shadow-[2.5px_2.5px_0px_#000000]">
                <span className="text-[10px] font-mono font-bold text-neutral-500 uppercase">Avg Quality</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="font-display font-black text-xl text-black">{avgScore}</span>
                  <span className="text-[10px] font-mono text-neutral-500">/5.0</span>
                </div>
                <span className="text-[10px] font-mono text-[#FDC800] font-black">★ Velocity</span>
              </div>

              <div className="bg-white border-2 border-black rounded-2xl p-3 shadow-[2.5px_2.5px_0px_#000000]">
                <span className="text-[10px] font-mono font-bold text-neutral-500 uppercase">Total Logs</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="font-display font-black text-xl text-black">{totalLogged}</span>
                  <span className="text-[10px] font-mono font-bold text-neutral-600">DAYS</span>
                </div>
                <span className="text-[10px] font-mono text-blue-600 font-bold">⚡ Verified</span>
              </div>
            </div>

            {/* SECTION 2: WEEKDAY VELOCITY HORIZON VISUALIZER */}
            <div className="bg-white border-2 border-black rounded-2xl p-4 shadow-[3px_3px_0px_#000000] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-black stroke-[2.5]" />
                  <h4 className="font-display font-black text-xs uppercase text-black">
                    Weekday Momentum Horizon (Sun – Sat)
                  </h4>
                </div>
                <span className="text-[10px] font-mono text-neutral-500 font-bold">
                  Scale: 1.0 – 5.0
                </span>
              </div>

              {/* Graphic Bar Visualizer Grid */}
              <div className="grid grid-cols-7 gap-2 pt-2 items-end h-36 border-b-2 border-black/10 pb-2">
                {dayStats.map((d) => {
                  const heightPercent = d.avgNum > 0 ? Math.max(18, (d.avgNum / 5.0) * 100) : 10;
                  return (
                    <div key={d.day} className="flex flex-col items-center justify-end h-full group">
                      {/* Score Tooltip Pill */}
                      <span className="text-[10px] font-mono font-black text-black mb-1 opacity-80 group-hover:opacity-100 transition-opacity">
                        {d.avg}★
                      </span>
                      
                      {/* Vertical Graphic Bar */}
                      <div className="w-full max-w-8 bg-neutral-100 rounded-t-xl border-2 border-black overflow-hidden flex flex-col justify-end p-0.5 shadow-[1px_1px_0px_#000000]">
                        <div 
                          className="w-full rounded-t-lg transition-all duration-300"
                          style={{
                            height: `${heightPercent}%`,
                            backgroundColor: d.avgNum >= 4 ? '#00E599' : d.avgNum >= 3 ? '#FDC800' : d.avgNum >= 2 ? '#FF8A00' : '#FF4D4D'
                          }}
                        />
                      </div>

                      {/* Day Label */}
                      <span className="font-mono text-[11px] font-black text-neutral-800 uppercase mt-2">
                        {d.day}
                      </span>
                      <span className="text-[9px] font-mono text-neutral-500 font-bold">
                        {d.count}d
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* SECTION 3: ARCHETYPE BREAKDOWN */}
            <div className="bg-white border-2 border-black rounded-2xl p-4 shadow-[3px_3px_0px_#000000] space-y-3">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-black stroke-[2.5]" />
                <h4 className="font-display font-black text-xs uppercase text-black">
                  Mood Archetype Distribution
                </h4>
              </div>

              <div className="space-y-2">
                {[
                  { star: 5, title: 'God Mode / Peak Velocity', count: peakDays, color: '#FDC800', mascot: mascot5 },
                  { star: 4, title: 'Locked In / Focus Warrior', count: goodDays, color: '#00E599', mascot: mascot4 },
                  { star: 3, title: 'Solid Baseline / Stoic Sustainer', count: baselineDays, color: '#CBD5E1', mascot: mascot3 },
                  { star: 2, title: 'Low Battery / Recovery Agent', count: slumpDays, color: '#FF8A00', mascot: mascot2 },
                  { star: 1, title: 'Trench Survivor / Dopamine Goblin', count: roughDays, color: '#FF4D4D', mascot: mascot1 }
                ].map(item => {
                  const percent = totalLogged > 0 ? Math.round((item.count / totalLogged) * 100) : 0;
                  return (
                    <div key={item.star} className="bg-neutral-50 border border-black/20 rounded-xl p-2.5 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img src={item.mascot} alt={item.title} className="w-8 h-8 object-contain rounded-lg border border-black/10 bg-white p-0.5 shrink-0" />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 truncate">
                            <span className="font-display font-black text-xs uppercase truncate text-black">{item.title}</span>
                            <span className="text-[10px] font-mono font-bold text-neutral-500 shrink-0">({item.star}★)</span>
                          </div>
                          <div className="w-24 sm:w-44 bg-neutral-200 h-1.5 rounded-full overflow-hidden mt-1 border border-black/10">
                            <div className="h-full rounded-full transition-all" style={{ width: `${percent}%`, backgroundColor: item.color }} />
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-display font-black text-xs text-black">{item.count} DAYS</span>
                        <div className="text-[9px] font-mono text-neutral-500 font-bold">{percent}%</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* SECTION 4: LIFE SPHERES DOMAIN FORENSICS (if sphere data exists and sphere mode is on) */}
            {(() => {
              if (!isSphereModeEnabled()) return null;
              const sphereAggregates = {};
              entryList.forEach(e => {
                if (e.spheres && typeof e.spheres === 'object') {
                  Object.values(e.spheres).forEach(s => {
                    if (s && s.id && s.rating && Number(s.rating) > 0) {
                      if (!sphereAggregates[s.id]) {
                        sphereAggregates[s.id] = {
                          id: s.id,
                          name: s.name || s.id,
                          icon: s.icon || '⚡',
                          total: 0,
                          count: 0
                        };
                      }
                      sphereAggregates[s.id].total += Number(s.rating);
                      sphereAggregates[s.id].count += 1;
                    }
                  });
                }
              });

              const sphereList = Object.values(sphereAggregates);
              if (sphereList.length === 0) return null;

              return (
                <div className="bg-white border-2 border-black rounded-2xl p-4 shadow-[3px_3px_0px_#000000] space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-black stroke-[2.5]" />
                      <h4 className="font-display font-black text-xs uppercase text-black">
                        Life Spheres Performance Matrix
                      </h4>
                    </div>
                    <span className="text-[10px] font-mono bg-black text-[#FDC800] px-2 py-0.5 rounded font-black">
                      MULTI-SPHERE
                    </span>
                  </div>

                  <div className="space-y-2">
                    {sphereList.map(s => {
                      const avg = (s.total / s.count).toFixed(1);
                      const avgNum = Number(avg);
                      const percent = Math.min(100, Math.round((avgNum / 5) * 100));
                      const tierColor = avgNum >= 4 ? '#00E599' : avgNum >= 3 ? '#FDC800' : avgNum >= 2 ? '#FF8A00' : '#FF4D4D';

                      return (
                        <div key={s.id} className="bg-neutral-50 border border-black/20 rounded-xl p-2.5 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-lg border-2 border-black flex items-center justify-center bg-white shrink-0 shadow-[1px_1px_0px_#000000]">
                              <SphereIcon icon={s.icon} className="w-4 h-4 text-black stroke-[2.5]" />
                            </div>
                            <div className="min-w-0">
                              <span className="font-display font-black text-xs uppercase truncate text-black block">
                                {s.name}
                              </span>
                              <div className="w-24 sm:w-44 bg-neutral-200 h-1.5 rounded-full overflow-hidden mt-1 border border-black/10">
                                <div className="h-full rounded-full transition-all" style={{ width: `${percent}%`, backgroundColor: tierColor }} />
                              </div>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="font-display font-black text-xs text-black">{avg}★ AVG</span>
                            <div className="text-[9px] font-mono text-neutral-500 font-bold">{s.count} logs</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

          </div>

          {/* Pinned Action Footer */}
          <div className="pt-2 border-t-2 border-black/10 flex justify-end shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-6 bg-black text-white hover:bg-neutral-800 font-display font-black text-xs uppercase rounded-xl border-2 border-black shadow-[2px_2px_0px_#000000] cursor-pointer"
            >
              DONE
            </button>
          </div>
        </motion.div>
      </motion.div>
      )}
    </AnimatePresence>
  );
}
