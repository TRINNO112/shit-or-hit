import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Wand2, 
  Loader2, 
  Sparkles, 
  TrendingUp, 
  Flame, 
  Award, 
  Zap, 
  AlertTriangle, 
  CheckCircle2, 
  Copy, 
  Check, 
  Layers, 
  Compass,
  Calendar
} from 'lucide-react';
import { fetchMonthlyReport } from '../services/api';
import { mockArchetypes } from '../data/mockArchetypes';
import confetti from 'canvas-confetti';

export default function MonthlyReportModal({ 
  isOpen, 
  onClose, 
  initialYear, 
  initialMonth 
}) {
  const [year, setYear] = useState(initialYear || new Date().getFullYear());
  const [month, setMonth] = useState(initialMonth || new Date().getMonth() + 1);
  const [report, setReport] = useState(null);
  const [selectedArchetype, setSelectedArchetype] = useState(null); // null = real data
  const [isLoading, setIsLoading] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [copied, setCopied] = useState(false);

  const scrollContainerRef = useRef(null);

  // Sync initial month/year if changed
  useEffect(() => {
    if (initialYear) setYear(initialYear);
    if (initialMonth) setMonth(initialMonth);
  }, [initialYear, initialMonth]);

  // Load report with real data or custom archetype
  const loadReportData = async (archetypeId = selectedArchetype, currentYear = year, currentMonth = month) => {
    setIsLoading(true);
    try {
      let customEntries = null;
      if (archetypeId && mockArchetypes[archetypeId]) {
        customEntries = mockArchetypes[archetypeId].generateEntries(currentYear, currentMonth);
      }
      const data = await fetchMonthlyReport(currentYear, currentMonth, customEntries);
      setReport(data);
      if (data?.hitRate >= 75) {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.5 },
          colors: ['#FDC800', '#00E599', '#000000']
        });
      }
    } catch (err) {
      console.error('Failed to load monthly report:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch report on mount or when year/month changes
  useEffect(() => {
    if (!isOpen) return;
    loadReportData(selectedArchetype, year, month);
  }, [isOpen, year, month]);

  const handleSelectArchetype = (archetypeId) => {
    setSelectedArchetype(archetypeId);
    loadReportData(archetypeId, year, month);
  };

  // Handle scroll tracking
  const handleScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const totalScroll = el.scrollHeight - el.clientHeight;
    if (totalScroll <= 0) {
      setScrollProgress(100);
      return;
    }
    const currentProgress = Math.min(100, Math.max(0, Math.round((el.scrollTop / totalScroll) * 100)));
    setScrollProgress(currentProgress);
  };

  const handlePrevMonth = () => {
    if (month === 1) {
      setYear(y => y - 1);
      setMonth(12);
    } else {
      setMonth(m => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 12) {
      setYear(y => y + 1);
      setMonth(1);
    } else {
      setMonth(m => m + 1);
    }
  };

  const handleCopyMarkdown = () => {
    if (!report) return;
    const text = `# 📊 MONTHLY PERFORMANCE INTELLIGENCE DOSSIER: ${report.monthName}
**Persona Archetype:** ${report.personaTitle}
**Hit Rate:** ${report.hitRate}% | **Average Quality:** ${report.avgScore}/5.0 (${report.totalLogged} days logged)

## 📌 Executive Summary
${report.executiveSummary}

## 🔍 Hidden Behavioral Patterns & Facts
${report.hiddenFacts?.map(f => `- ${f}`).join('\n')}

## ⚡ Peak Golden Triggers
${report.goldenHabits}

## ⚠️ Friction Point Analysis
${report.frictionAnalysis}

## 🎯 Tactical Directives for Next Month
${report.nextMonthDirectives?.map(d => `1. ${d}`).join('\n')}
`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/75 backdrop-blur-xs"
        onClick={onClose}
      >
        <motion.div 
          initial={{ opacity: 0, scale: 0.93, y: 25 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.93, y: 25 }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          className="neo-card w-full max-w-5xl bg-white my-auto h-[92vh] max-h-[92vh] flex flex-col overflow-hidden relative shadow-[8px_8px_0px_#000000]"
          style={{ padding: '0px' }}
          onClick={(e) => e.stopPropagation()}
        >
          
          {/* Top Sticky Reading Progress Tracker */}
          <div className="sticky top-0 z-20 bg-black text-white px-5 sm:px-8 py-1.5 flex items-center justify-between border-b-2 border-black shrink-0">
            <div className="flex items-center gap-2 font-mono text-xs font-black">
              <Compass className="w-3.5 h-3.5 text-[#FDC800] animate-spin" style={{ animationDuration: '6s' }} />
              <span>DOSSIER PROGRESS</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-32 sm:w-56 h-2 bg-neutral-800 rounded-full overflow-hidden border border-white/20">
                <motion.div 
                  className="h-full bg-[#FDC800]"
                  style={{ width: `${scrollProgress}%` }}
                  transition={{ ease: 'easeOut', duration: 0.15 }}
                />
              </div>
              <span className="font-mono text-xs font-black text-[#FDC800] w-12 text-right">
                {scrollProgress}%
              </span>
            </div>
          </div>

          {/* Compact Sleek Dossier Header */}
          <div className="px-5 sm:px-8 py-3 border-b-2 border-black/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shrink-0 bg-[#FFFDF5]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FDC800] border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_#000000] shrink-0">
                <Sparkles className="w-5 h-5 text-black stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display font-black text-lg sm:text-xl text-black uppercase leading-tight">
                    MONTHLY PERFORMANCE DOSSIER
                  </h3>
                  <span className="px-2 py-0.5 rounded bg-black text-[#FDC800] font-mono text-[10px] font-black uppercase">
                    GEMINI AI
                  </span>
                </div>
                <span className="text-[11px] font-mono font-bold text-neutral-600">
                  Deep behavioral intelligence & tactical directives.
                </span>
              </div>
            </div>

            {/* Controls: Evaluate Action, Month Switcher & Close */}
            <div className="flex flex-wrap items-center gap-2 self-end sm:self-auto">
              <button
                onClick={() => loadReportData(selectedArchetype, year, month)}
                disabled={isLoading}
                title="Run or re-generate Gemini AI Performance Evaluation"
                className="neo-btn px-3 py-1.5 bg-[#00E599] hover:bg-emerald-400 text-black font-mono font-black text-xs flex items-center gap-1.5 shadow-[2px_2px_0px_#000000] cursor-pointer disabled:opacity-50"
              >
                <Wand2 className={`w-3.5 h-3.5 stroke-[2.5] ${isLoading ? 'animate-spin' : ''}`} />
                <span>{isLoading ? 'EVALUATING...' : 'RUN EVALUATION'}</span>
              </button>

              <div className="flex items-center bg-white border-2 border-black rounded-xl p-1 shadow-[2px_2px_0px_#000000]">
                <button
                  onClick={handlePrevMonth}
                  title="Previous Month"
                  className="p-1 rounded-lg hover:bg-neutral-100 text-black cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5 stroke-[3]" />
                </button>

                <span className="px-2.5 font-mono font-black text-xs text-black uppercase">
                  {report?.monthName || `${month}/${year}`}
                </span>

                <button
                  onClick={handleNextMonth}
                  title="Next Month"
                  className="p-1 rounded-lg hover:bg-neutral-100 text-black cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5 stroke-[3]" />
                </button>
              </div>

              <button
                onClick={onClose}
                className="neo-btn p-1.5 bg-[#FF4D4D] hover:bg-red-400 text-black cursor-pointer shadow-[2px_2px_0px_#000000]"
              >
                <X className="w-4 h-4 stroke-[3]" />
              </button>
            </div>
          </div>

          {/* 🧪 TEST DATA ARCHETYPES QUICK SWITCHER BAR */}
          <div className="bg-neutral-100 border-b-2 border-black px-5 sm:px-8 py-2 flex flex-wrap items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2 font-mono text-xs font-black text-black">
              <span>🧪 DATASET:</span>
              {selectedArchetype ? (
                <span className="px-2 py-0.5 rounded bg-[#FDC800] text-black text-[10px] font-black uppercase border border-black shadow-[1px_1px_0px_#000000]">
                  TESTING: {mockArchetypes[selectedArchetype]?.name.split(' ')[1]}
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded bg-black text-white text-[10px] font-black uppercase shadow-[1px_1px_0px_#FDC800]">
                  MY REAL DATABASE
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleSelectArchetype('highPerformer')}
                className={`px-2.5 py-1 rounded-lg border-2 border-black font-mono text-[11px] font-black cursor-pointer transition-all ${
                  selectedArchetype === 'highPerformer'
                    ? 'bg-[#00E599] text-black shadow-[2px_2px_0px_#000000] scale-[1.03]'
                    : 'bg-white hover:bg-neutral-50 text-neutral-800 opacity-80'
                }`}
              >
                👑 High-Performer
              </button>

              <button
                type="button"
                onClick={() => handleSelectArchetype('steadyBaseline')}
                className={`px-2.5 py-1 rounded-lg border-2 border-black font-mono text-[11px] font-black cursor-pointer transition-all ${
                  selectedArchetype === 'steadyBaseline'
                    ? 'bg-[#FDC800] text-black shadow-[2px_2px_0px_#000000] scale-[1.03]'
                    : 'bg-white hover:bg-neutral-50 text-neutral-800 opacity-80'
                }`}
              >
                🔘 Steady Baseline
              </button>

              <button
                type="button"
                onClick={() => handleSelectArchetype('fightingUnderdog')}
                className={`px-2.5 py-1 rounded-lg border-2 border-black font-mono text-[11px] font-black cursor-pointer transition-all ${
                  selectedArchetype === 'fightingUnderdog'
                    ? 'bg-[#FF4D4D] text-black shadow-[2px_2px_0px_#000000] scale-[1.03]'
                    : 'bg-white hover:bg-neutral-50 text-neutral-800 opacity-80'
                }`}
              >
                🔥 Fighting Underdog
              </button>

              <button
                type="button"
                onClick={() => handleSelectArchetype(null)}
                className={`px-2.5 py-1 rounded-lg border-2 border-black font-mono text-[11px] font-black cursor-pointer transition-all ${
                  selectedArchetype === null
                    ? 'bg-black text-white shadow-[2px_2px_0px_#FDC800] scale-[1.03]'
                    : 'bg-white hover:bg-neutral-50 text-neutral-800 opacity-80'
                }`}
              >
                ↩️ My Real Data
              </button>
            </div>
          </div>

          {/* Scrollable Content Body with min-h-0 and flex-1 */}
          <div 
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="overflow-y-auto px-5 sm:px-8 py-5 space-y-5 flex-1 min-h-0"
          >
            {isLoading ? (
              <div className="py-24 flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-10 h-10 text-black animate-spin stroke-[2.5]" />
                <p className="font-mono text-sm font-black uppercase text-black">
                  Synthesizing Deep Monthly Intelligence with Gemini...
                </p>
                <span className="text-xs font-mono text-neutral-500">
                  Correlating ratings, note reflections, weekday heatmaps, and streak momentum
                </span>
              </div>
            ) : report?.totalLogged === 0 ? (
              /* High-impact Empty State with 1-Click Launchers */
              <div className="p-8 sm:p-10 rounded-2xl border-2 border-black bg-[#FFFDF5] shadow-[6px_6px_0px_#000000] text-center space-y-6">
                <div className="w-16 h-16 rounded-2xl bg-[#FDC800] border-2 border-black flex items-center justify-center mx-auto shadow-[3px_3px_0px_#000000]">
                  <Sparkles className="w-8 h-8 text-black stroke-[2.5]" />
                </div>

                <div>
                  <h4 className="font-display font-black text-2xl uppercase text-black">
                    NO REAL LOGS FOR {report.monthName} YET
                  </h4>
                  <p className="text-xs font-mono font-bold text-neutral-600 max-w-md mx-auto mt-1.5">
                    You haven't logged entries for this month yet. You can either log verdicts in the tracker or test the Gemini AI evaluation right now using one of the 3 pre-built trial archetypes below!
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <button
                    onClick={() => handleSelectArchetype('highPerformer')}
                    className="neo-btn p-5 bg-white hover:bg-emerald-50 text-left flex flex-col justify-between border-2 border-black rounded-xl shadow-[3px_3px_0px_#000000] cursor-pointer"
                  >
                    <div>
                      <span className="text-xl">👑</span>
                      <h5 className="font-display font-black text-sm uppercase text-black mt-2">
                        HIGH-PERFORMER
                      </h5>
                      <p className="text-[11px] font-mono text-neutral-600 mt-1">
                        85% Peak/Good days, intense flow states, fast shipping.
                      </p>
                    </div>
                    <span className="text-[10px] font-mono font-black bg-[#00E599] text-black px-2 py-1 rounded mt-4 text-center">
                      TEST THIS PROFILE →
                    </span>
                  </button>

                  <button
                    onClick={() => handleSelectArchetype('steadyBaseline')}
                    className="neo-btn p-5 bg-white hover:bg-amber-50 text-left flex flex-col justify-between border-2 border-black rounded-xl shadow-[3px_3px_0px_#000000] cursor-pointer"
                  >
                    <div>
                      <span className="text-xl">🔘</span>
                      <h5 className="font-display font-black text-sm uppercase text-black mt-2">
                        STEADY BASELINE
                      </h5>
                      <p className="text-[11px] font-mono text-neutral-600 mt-1">
                        70% Okay days, standard work routines, consistent pace.
                      </p>
                    </div>
                    <span className="text-[10px] font-mono font-black bg-[#FDC800] text-black px-2 py-1 rounded mt-4 text-center">
                      TEST THIS PROFILE →
                    </span>
                  </button>

                  <button
                    onClick={() => handleSelectArchetype('fightingUnderdog')}
                    className="neo-btn p-5 bg-white hover:bg-red-50 text-left flex flex-col justify-between border-2 border-black rounded-xl shadow-[3px_3px_0px_#000000] cursor-pointer"
                  >
                    <div>
                      <span className="text-xl">🔥</span>
                      <h5 className="font-display font-black text-sm uppercase text-black mt-2">
                        FIGHTING UNDERDOG
                      </h5>
                      <p className="text-[11px] font-mono text-neutral-600 mt-1">
                        75% Rough/Down days, outage battles, burnout resistance.
                      </p>
                    </div>
                    <span className="text-[10px] font-mono font-black bg-[#FF4D4D] text-black px-2 py-1 rounded mt-4 text-center">
                      TEST THIS PROFILE →
                    </span>
                  </button>
                </div>
              </div>
            ) : report ? (
              <>
                {/* Persona Archetype Banner */}
                <div className="p-6 rounded-2xl border-2 border-black bg-[#FDC800] shadow-[4px_4px_0px_#000000] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-mono font-black bg-black text-white px-2.5 py-1 rounded-md uppercase tracking-wider">
                      MONTHLY PERSONA ARCHETYPE
                    </span>
                    <h4 className="font-display font-black text-2xl sm:text-3xl text-black uppercase tracking-tight mt-2">
                      "{report.personaTitle}"
                    </h4>
                    <p className="text-xs font-mono font-bold text-neutral-800 mt-1 max-w-xl leading-relaxed">
                      {report.executiveSummary}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="px-4 py-3 rounded-xl border-2 border-black bg-white text-center shadow-[2px_2px_0px_#000000]">
                      <span className="block text-[10px] font-mono font-bold text-neutral-500">HIT RATE</span>
                      <span className="font-display font-black text-2xl text-black leading-none mt-0.5">
                        {report.hitRate}%
                      </span>
                    </div>

                    <div className="px-4 py-3 rounded-xl border-2 border-black bg-white text-center shadow-[2px_2px_0px_#000000]">
                      <span className="block text-[10px] font-mono font-bold text-neutral-500">AVG SCORE</span>
                      <span className="font-display font-black text-2xl text-black leading-none mt-0.5">
                        {report.avgScore}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2-Column Analytics Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  
                  {/* Left Col: Weekday Momentum Heatmap (7 cols) */}
                  <div className="lg:col-span-7 p-5 rounded-2xl border-2 border-black bg-white shadow-[3px_3px_0px_#000000] flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4 pb-2 border-b border-black/10">
                      <span className="font-display font-black text-xs uppercase text-black flex items-center gap-1.5">
                        <TrendingUp className="w-4 h-4 text-black stroke-[2.5]" />
                        <span>WEEKDAY MOMENTUM DISTRIBUTION</span>
                      </span>
                      <span className="text-[10px] font-mono font-bold text-neutral-500">
                        Score / 5.0
                      </span>
                    </div>

                    {/* Bar chart for Mon - Sun */}
                    <div className="grid grid-cols-7 gap-2 items-end pt-4 h-36">
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => {
                        const score = report.weekdayAverages?.[day] || 0;
                        const heightPct = Math.max(12, Math.round((score / 5.0) * 100));
                        const isHigh = score >= 4.0;

                        return (
                          <div key={day} className="flex flex-col items-center gap-1.5 h-full justify-end">
                            <span className="text-[10px] font-mono font-black text-black">
                              {score > 0 ? score : '—'}
                            </span>
                            <motion.div 
                              initial={{ height: 0 }}
                              animate={{ height: `${heightPct}%` }}
                              transition={{ duration: 0.6, ease: 'easeOut' }}
                              className={`w-full rounded-t-lg border-2 border-black shadow-[2px_2px_0px_#000000] ${
                                isHigh ? 'bg-[#00E599]' : score >= 3 ? 'bg-[#FDC800]' : score > 0 ? 'bg-[#FF8A00]' : 'bg-neutral-100'
                              }`}
                            />
                            <span className="text-[10px] font-mono font-black uppercase text-neutral-700">
                              {day}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right Col: Rating Breakdown (5 cols) */}
                  <div className="lg:col-span-5 p-5 rounded-2xl border-2 border-black bg-white shadow-[3px_3px_0px_#000000] flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4 pb-2 border-b border-black/10">
                      <span className="font-display font-black text-xs uppercase text-black flex items-center gap-1.5">
                        <Layers className="w-4 h-4 text-black stroke-[2.5]" />
                        <span>VERDICT BREAKDOWN</span>
                      </span>
                      <span className="text-[10px] font-mono font-black text-black">
                        {report.totalLogged} DAYS
                      </span>
                    </div>

                    <div className="space-y-2">
                      {[
                        { label: 'Peak (5/5)', count: report.ratingCounts?.[5] || 0, bg: '#FDC800' },
                        { label: 'Good (4/5)', count: report.ratingCounts?.[4] || 0, bg: '#00E599' },
                        { label: 'Okay (3/5)', count: report.ratingCounts?.[3] || 0, bg: '#CBD5E1' },
                        { label: 'Down (2/5)', count: report.ratingCounts?.[2] || 0, bg: '#FF8A00' },
                        { label: 'Rough (1/5)', count: report.ratingCounts?.[1] || 0, bg: '#FF4D4D' }
                      ].map(item => {
                        const pct = report.totalLogged > 0 ? Math.round((item.count / report.totalLogged) * 100) : 0;
                        return (
                          <div key={item.label} className="space-y-1">
                            <div className="flex justify-between text-[11px] font-mono font-bold text-black">
                              <span>{item.label}</span>
                              <span>{item.count}d ({pct}%)</span>
                            </div>
                            <div className="h-2 w-full bg-neutral-100 rounded-full border border-black/20 overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${pct}%` }}
                                transition={{ duration: 0.5, ease: 'easeOut' }}
                                className="h-full"
                                style={{ backgroundColor: item.bg }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>

                {/* 🔍 Hidden Behavioral Patterns & Correlations (The Star Feature!) */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-black stroke-[2.5]" />
                    <h5 className="font-display font-black text-sm text-black uppercase tracking-wider">
                      HIDDEN BEHAVIORAL CORRELATIONS & DISCOVERIES
                    </h5>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {report.hiddenFacts?.map((fact, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1, duration: 0.4 }}
                        className="p-4 rounded-xl border-2 border-black bg-[#FFFDF5] shadow-[3px_3px_0px_#000000] flex items-start gap-3"
                      >
                        <div className="w-7 h-7 rounded-lg bg-black text-white flex items-center justify-center font-mono font-black text-xs shrink-0 shadow-[1px_1px_0px_#FDC800]">
                          #{idx + 1}
                        </div>
                        <p className="text-xs font-mono font-bold text-neutral-800 leading-relaxed">
                          {fact}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Side-by-Side: Friction Analysis vs Golden Triggers */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Friction Breakdown */}
                  <div className="p-5 rounded-2xl border-2 border-black bg-red-50/50 shadow-[3px_3px_0px_#000000] space-y-2">
                    <div className="flex items-center gap-2 text-xs font-display font-black uppercase text-black">
                      <AlertTriangle className="w-4 h-4 text-[#FF4D4D] stroke-[2.5]" />
                      <span>FRICTION & BOTTLENECK ANALYSIS</span>
                    </div>
                    <p className="text-xs font-mono font-semibold text-neutral-800 leading-relaxed">
                      {report.frictionAnalysis}
                    </p>
                  </div>

                  {/* Peak Triggers */}
                  <div className="p-5 rounded-2xl border-2 border-black bg-emerald-50/50 shadow-[3px_3px_0px_#000000] space-y-2">
                    <div className="flex items-center gap-2 text-xs font-display font-black uppercase text-black">
                      <Zap className="w-4 h-4 text-[#00E599] stroke-[2.5] fill-[#00E599]" />
                      <span>PEAK (5/5) MOMENTUM TRIGGERS</span>
                    </div>
                    <p className="text-xs font-mono font-semibold text-neutral-800 leading-relaxed">
                      {report.goldenHabits}
                    </p>
                  </div>
                </div>

                {/* 🎯 Next Month Tactical Directives */}
                <div className="p-6 rounded-2xl border-2 border-black bg-black text-white shadow-[4px_4px_0px_#FDC800] space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-display font-black text-sm uppercase text-[#FDC800]">
                      <Award className="w-5 h-5 stroke-[2.5]" />
                      <span>NEXT MONTH TACTICAL BATTLE DIRECTIVES</span>
                    </div>
                    <span className="text-[10px] font-mono font-black bg-[#FDC800] text-black px-2 py-0.5 rounded">
                      ACTION PLAN
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {report.nextMonthDirectives?.map((directive, idx) => (
                      <div key={idx} className="flex items-start gap-3 bg-neutral-900 p-3 rounded-xl border border-white/20">
                        <CheckCircle2 className="w-4 h-4 text-[#00E599] shrink-0 mt-0.5 stroke-[2.5]" />
                        <span className="text-xs font-mono font-bold text-neutral-200">
                          <strong>Directive {idx + 1}:</strong> {directive}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

              </>
            ) : null}
          </div>

          {/* Dossier Footer */}
          <div className="px-6 sm:px-8 py-4 border-t-2 border-black/10 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 bg-[#FFFDF5]">
            <span className="text-xs font-mono font-bold text-neutral-600">
              💡 Intelligence derived from {report?.totalLogged || 0} logged days in {report?.monthName}.
            </span>

            <div className="flex items-center gap-3">
              <button
                onClick={handleCopyMarkdown}
                className="neo-btn px-4 py-2 bg-white hover:bg-[#FDC800] text-black text-xs font-mono font-black flex items-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_#000000]"
              >
                {copied ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Copy className="w-3.5 h-3.5 stroke-[2.5]" />}
                <span>{copied ? 'COPIED TO CLIPBOARD' : 'COPY DOSSIER'}</span>
              </button>

              <button
                onClick={onClose}
                className="neo-btn px-6 py-2 bg-[#00E599] text-black text-xs font-mono font-black cursor-pointer shadow-[2px_2px_0px_#000000]"
              >
                CLOSE DOSSIER
              </button>
            </div>
          </div>

        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
