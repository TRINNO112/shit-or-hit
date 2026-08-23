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
          exit={{ opacity: 0, scale: 0.93, y: 20 }}
          transition={{ type: 'spring', stiffness: 380, damping: 26 }}
          className="neo-card w-[96vw] max-w-[1360px] my-auto h-[92vh] max-h-[92vh] rounded-3xl border-3 border-black shadow-[8px_8px_0px_#000000] bg-[#FFFDF5] flex flex-col overflow-hidden relative"
          style={{ padding: '0px' }}
          onClick={(e) => e.stopPropagation()}
        >
          
          {/* Top Sticky Reading Progress Tracker */}
          <div className="bg-black text-white px-5 sm:px-8 py-1.5 flex items-center justify-between border-b-2 border-black shrink-0">
            <div className="flex items-center gap-2 font-mono text-[11px] font-black">
              <Compass className="w-3.5 h-3.5 text-[#FDC800] animate-spin" style={{ animationDuration: '6s' }} />
              <span>MONTHLY DOSSIER INTELLIGENCE</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-36 sm:w-72 h-2 bg-neutral-800 rounded-full overflow-hidden border border-white/20">
                <motion.div 
                  className="h-full bg-[#FDC800]"
                  style={{ width: `${scrollProgress}%` }}
                  transition={{ ease: 'easeOut', duration: 0.15 }}
                />
              </div>
              <span className="font-mono text-[11px] font-black text-[#FDC800] w-12 text-right">
                {scrollProgress}%
              </span>
            </div>
          </div>

          {/* Compact Panoramic Dossier Header */}
          <div className="px-5 sm:px-8 py-2.5 border-b-2 border-black/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 shrink-0 bg-[#FFFDF5]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#FDC800] border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_#000000] shrink-0">
                <Sparkles className="w-5 h-5 text-black stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display font-black text-lg text-black uppercase leading-none">
                    MONTHLY PERFORMANCE DOSSIER
                  </h3>
                  <span className="px-1.5 py-0.5 rounded bg-black text-[#FDC800] font-mono text-[9px] font-black uppercase">
                    GEMINI AI
                  </span>
                </div>
                <span className="text-[10px] font-mono font-bold text-neutral-600">
                  Deep behavioral intelligence, root-cause forensics & tactical battle plan.
                </span>
              </div>
            </div>

            {/* Controls: Evaluate Action, Copy, Month Switcher & Close */}
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

              <button
                onClick={handleCopyMarkdown}
                title="Copy Dossier Markdown to Clipboard"
                className="neo-btn px-2.5 py-1.5 bg-white hover:bg-[#FDC800] text-black font-mono font-black text-xs flex items-center gap-1 shadow-[2px_2px_0px_#000000] cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Copy className="w-3.5 h-3.5 stroke-[2.5]" />}
                <span className="hidden sm:inline">{copied ? 'COPIED' : 'COPY'}</span>
              </button>

              <div className="flex items-center bg-white border-2 border-black rounded-xl p-0.5 shadow-[2px_2px_0px_#000000]">
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
                className="neo-btn px-3 py-1.5 bg-[#FF4D4D] hover:bg-red-400 text-black font-mono font-black text-xs flex items-center gap-1 cursor-pointer shadow-[2px_2px_0px_#000000]"
                title="Close Dossier"
              >
                <X className="w-4 h-4 stroke-[3]" />
                <span>CLOSE</span>
              </button>
            </div>
          </div>

          {/* 🧪 TEST DATASET QUICK SWITCHER BAR */}
          <div className="bg-neutral-100 border-b-2 border-black px-5 sm:px-8 py-1.5 flex flex-wrap items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2 font-mono text-xs font-black text-black">
              <span>🧪 DATASET:</span>
              {selectedArchetype ? (
                <span className="px-2 py-0.5 rounded bg-[#FF8A00] text-black text-[10px] font-black uppercase border border-black shadow-[1px_1px_0px_#000000]">
                  TESTING: ARYAN'S CHRONICLES (31 DAYS)
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded bg-black text-white text-[10px] font-black uppercase shadow-[1px_1px_0px_#FDC800]">
                  MY REAL DATABASE
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => handleSelectArchetype('strugglingStudent')}
                className={`px-3 py-1 rounded-lg border-2 border-black font-mono text-xs font-black cursor-pointer transition-all ${
                  selectedArchetype === 'strugglingStudent'
                    ? 'bg-[#FF8A00] text-black shadow-[2px_2px_0px_#000000] scale-[1.02]'
                    : 'bg-white hover:bg-neutral-50 text-neutral-800 opacity-80'
                }`}
              >
                🎓 Aryan's Chronicles (Struggling Student — 31 Days)
              </button>

              <button
                type="button"
                onClick={() => handleSelectArchetype(null)}
                className={`px-3 py-1 rounded-lg border-2 border-black font-mono text-xs font-black cursor-pointer transition-all ${
                  selectedArchetype === null
                    ? 'bg-black text-white shadow-[2px_2px_0px_#FDC800] scale-[1.02]'
                    : 'bg-white hover:bg-neutral-50 text-neutral-800 opacity-80'
                }`}
              >
                ↩️ My Real Data
              </button>
            </div>
          </div>

          {/* Scrollable Dossier Content Area */}
          <div 
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-4"
          >
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-[#FDC800] border-3 border-black flex items-center justify-center animate-bounce shadow-[4px_4px_0px_#000000]">
                    <Sparkles className="w-8 h-8 text-black" />
                  </div>
                </div>
                <div className="text-center space-y-1">
                  <h4 className="font-display font-black text-lg text-black uppercase">
                    Synthesizing Monthly Performance Intelligence...
                  </h4>
                  <p className="text-xs font-mono text-neutral-600">
                    Gemini AI is examining daily notes, friction points, and behavioral momentum.
                  </p>
                </div>
              </div>
            ) : error ? (
              <div className="p-6 rounded-2xl border-2 border-black bg-red-100 shadow-[4px_4px_0px_#000000] text-center space-y-3">
                <AlertCircle className="w-8 h-8 text-red-600 mx-auto" />
                <h4 className="font-display font-black text-base text-black uppercase">
                  Could Not Generate Monthly Intelligence
                </h4>
                <p className="text-xs font-mono text-neutral-700 max-w-md mx-auto">
                  {error}
                </p>
                <button
                  onClick={() => loadReportData(selectedArchetype, year, month)}
                  className="neo-btn px-4 py-2 bg-black text-[#FDC800] text-xs font-mono font-black shadow-[2px_2px_0px_#000000] cursor-pointer"
                >
                  RETRY SYNTHESIS
                </button>
              </div>
            ) : !report && (!monthEntries || monthEntries.length === 0) ? (
              <div className="p-8 rounded-2xl border-2 border-black bg-neutral-50 shadow-[4px_4px_0px_#000000] text-center space-y-4">
                <FileText className="w-10 h-10 text-neutral-400 mx-auto" />
                <div>
                  <h4 className="font-display font-black text-lg text-black uppercase">
                    No Logs Recorded For {report?.monthName || `${month}/${year}`}
                  </h4>
                  <p className="text-xs font-mono text-neutral-600 max-w-md mx-auto mt-1">
                    Log your daily verdicts in the calendar, or test the Gemini Intelligence engine using Aryan's 31-day struggling student story.
                  </p>
                </div>

                <div className="max-w-xl mx-auto pt-2">
                  <button
                    onClick={() => handleSelectArchetype('strugglingStudent')}
                    className="w-full neo-btn p-5 bg-white hover:bg-amber-50 text-left flex flex-col justify-between border-2 border-black rounded-xl shadow-[3px_3px_0px_#000000] cursor-pointer"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xl">🎓</span>
                        <h5 className="font-display font-black text-sm uppercase text-black">
                          ARYAN'S CHRONICLES (STRUGGLING STUDENT — 31 DAYS)
                        </h5>
                      </div>
                      <p className="text-[11px] font-mono text-neutral-600 mt-2 leading-relaxed">
                        Exam anxiety, 38/100 math failure, 3:30 AM Reels doomscrolling, chemistry lab rejection, turning point catalyst, and a Week 3 recovery up to 74%.
                      </p>
                    </div>
                    <span className="text-[10px] font-mono font-black bg-[#FF8A00] text-black px-3 py-1.5 rounded mt-4 text-center border border-black shadow-[1px_1px_0px_#000000]">
                      EVALUATE THIS 31-DAY STUDENT STORY →
                    </span>
                  </button>
                </div>
              </div>
            ) : report ? (
              <>
                {/* Persona Archetype Banner with Dynamic Stoic or High-Velocity Styling */}
                <div className={`p-3.5 sm:p-4 rounded-xl border-2 border-black flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shrink-0 ${
                  report.hitRate < 50 
                    ? 'bg-[#1C1917] text-white shadow-[3px_3px_0px_#FDC800]' 
                    : report.hitRate >= 80 
                    ? 'bg-[#FDC800] text-black shadow-[3px_3px_0px_#000000]' 
                    : 'bg-[#00E599] text-black shadow-[3px_3px_0px_#000000]'
                }`}>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] font-mono font-black px-2 py-0.5 rounded uppercase tracking-wider ${
                        report.hitRate < 50 ? 'bg-[#FDC800] text-black' : 'bg-black text-white'
                      }`}>
                        MONTHLY PERSONA ARCHETYPE
                      </span>
                      {report.hitRate < 50 && (
                        <span className="text-[9px] font-mono font-black bg-red-950 text-red-300 border border-red-800 px-2 py-0.5 rounded uppercase">
                          STOIC RESILIENCE
                        </span>
                      )}
                    </div>

                    <h4 className={`font-display font-black text-xl sm:text-2xl uppercase tracking-tight mt-1 ${
                      report.hitRate < 50 ? 'text-white' : 'text-black'
                    }`}>
                      "{report.personaTitle}"
                    </h4>
                    <p className={`text-xs font-mono font-bold mt-0.5 leading-relaxed ${
                      report.hitRate < 50 ? 'text-neutral-300' : 'text-neutral-800'
                    }`}>
                      {report.executiveSummary}
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0 self-end md:self-auto">
                    <div className={`px-3.5 py-1.5 rounded-lg border-2 border-black text-center shadow-[2px_2px_0px_#000000] ${
                      report.hitRate < 50 ? 'bg-neutral-900 text-white' : 'bg-white text-black'
                    }`}>
                      <span className="block text-[9px] font-mono font-bold text-neutral-400">HIT RATE</span>
                      <span className={`font-display font-black text-lg leading-none mt-0.5 ${
                        report.hitRate < 50 ? 'text-[#FF4D4D]' : 'text-black'
                      }`}>
                        {report.hitRate}%
                      </span>
                    </div>

                    <div className={`px-3.5 py-1.5 rounded-lg border-2 border-black text-center shadow-[2px_2px_0px_#000000] ${
                      report.hitRate < 50 ? 'bg-neutral-900 text-white' : 'bg-white text-black'
                    }`}>
                      <span className="block text-[9px] font-mono font-bold text-neutral-400">AVG SCORE</span>
                      <span className="font-display font-black text-lg leading-none mt-0.5 text-black">
                        {report.avgScore}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2-Column Analytics Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
                  
                  {/* Left Col: Weekday Momentum Heatmap (7 cols) */}
                  <div className="lg:col-span-7 p-3.5 sm:p-4 rounded-xl border-2 border-black bg-white shadow-[2px_2px_0px_#000000] flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-black/10">
                      <span className="font-display font-black text-xs uppercase text-black flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5 text-black stroke-[2.5]" />
                        <span>WEEKDAY MOMENTUM DISTRIBUTION</span>
                      </span>
                      <span className="text-[10px] font-mono font-bold text-neutral-500">
                        Score / 5.0
                      </span>
                    </div>

                    {/* Bar chart for Mon - Sun */}
                    <div className="grid grid-cols-7 gap-2 items-end pt-2 h-28">
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => {
                        const score = report.weekdayAverages?.[day] || 0;
                        const heightPct = Math.max(14, Math.round((score / 5.0) * 100));
                        const isHigh = score >= 4.0;

                        return (
                          <div key={day} className="flex flex-col items-center gap-1 h-full justify-end">
                            <span className="text-[9px] font-mono font-black text-black">
                              {score > 0 ? score : '—'}
                            </span>
                            <motion.div 
                              initial={{ height: 0 }}
                              animate={{ height: `${heightPct}%` }}
                              transition={{ duration: 0.5, ease: 'easeOut' }}
                              className={`w-full rounded-t-md border-2 border-black shadow-[1px_1px_0px_#000000] ${
                                isHigh ? 'bg-[#00E599]' : score >= 3 ? 'bg-[#FDC800]' : score > 0 ? 'bg-[#FF8A00]' : 'bg-neutral-100'
                              }`}
                            />
                            <span className="text-[9px] font-mono font-black uppercase text-neutral-700">
                              {day}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right Col: Rating Breakdown (5 cols) */}
                  <div className="lg:col-span-5 p-3.5 sm:p-4 rounded-xl border-2 border-black bg-white shadow-[2px_2px_0px_#000000] flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-black/10">
                      <span className="font-display font-black text-xs uppercase text-black flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-black stroke-[2.5]" />
                        <span>VERDICT BREAKDOWN</span>
                      </span>
                      <span className="text-[10px] font-mono font-black text-black">
                        {report.totalLogged} DAYS
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      {[
                        { label: 'Peak (5/5)', count: report.ratingCounts?.[5] || 0, bg: '#FDC800' },
                        { label: 'Good (4/5)', count: report.ratingCounts?.[4] || 0, bg: '#00E599' },
                        { label: 'Okay (3/5)', count: report.ratingCounts?.[3] || 0, bg: '#CBD5E1' },
                        { label: 'Down (2/5)', count: report.ratingCounts?.[2] || 0, bg: '#FF8A00' },
                        { label: 'Rough (1/5)', count: report.ratingCounts?.[1] || 0, bg: '#FF4D4D' }
                      ].map(item => {
                        const pct = report.totalLogged > 0 ? Math.round((item.count / report.totalLogged) * 100) : 0;
                        return (
                          <div key={item.label} className="space-y-0.5">
                            <div className="flex justify-between text-[10px] font-mono font-bold text-black">
                              <span>{item.label}</span>
                              <span>{item.count}d ({pct}%)</span>
                            </div>
                            <div className="h-1.5 w-full bg-neutral-100 rounded-full border border-black/20 overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${pct}%` }}
                                transition={{ duration: 0.4, ease: 'easeOut' }}
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

                {/* 🔍 Hidden Behavioral Patterns & Correlations */}
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-black stroke-[2.5]" />
                    <h5 className="font-display font-black text-xs text-black uppercase tracking-wider">
                      HIDDEN BEHAVIORAL CORRELATIONS & DISCOVERIES
                    </h5>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {report.hiddenFacts?.map((fact, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.08, duration: 0.35 }}
                        className="p-3 rounded-lg border-2 border-black bg-[#FFFDF5] shadow-[2px_2px_0px_#000000] flex items-start gap-2.5"
                      >
                        <div className="w-5 h-5 rounded bg-black text-white flex items-center justify-center font-mono font-black text-[10px] shrink-0 shadow-[1px_1px_0px_#FDC800]">
                          #{idx + 1}
                        </div>
                        <p className="text-[11px] font-mono font-bold text-neutral-800 leading-snug">
                          {fact}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Side-by-Side: Friction Analysis vs Golden Triggers */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Friction Breakdown */}
                  <div className="p-3.5 rounded-xl border-2 border-black bg-red-50/60 shadow-[2px_2px_0px_#000000] space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-display font-black uppercase text-black">
                      <AlertTriangle className="w-3.5 h-3.5 text-[#FF4D4D] stroke-[2.5]" />
                      <span>ROOT-CAUSE FRICTION & BOTTLENECK ANALYSIS</span>
                    </div>
                    <p className="text-[11px] font-mono font-semibold text-neutral-800 leading-relaxed">
                      {report.frictionAnalysis}
                    </p>
                  </div>

                  {/* Peak Triggers */}
                  <div className="p-3.5 rounded-xl border-2 border-black bg-emerald-50/60 shadow-[2px_2px_0px_#000000] space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-display font-black uppercase text-black">
                      <Zap className="w-3.5 h-3.5 text-[#00E599] stroke-[2.5] fill-[#00E599]" />
                      <span>{report.hitRate < 50 ? 'REBOUND MOMENTS & SURVIVAL TRIGGERS' : 'PEAK (5/5) MOMENTUM TRIGGERS'}</span>
                    </div>
                    <p className="text-[11px] font-mono font-semibold text-neutral-800 leading-relaxed">
                      {report.goldenHabits}
                    </p>
                  </div>
                </div>

                {/* 🎯 Next Month Tactical Directives */}
                <div className="p-4 rounded-xl border-2 border-black bg-black text-white shadow-[3px_3px_0px_#FDC800] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-display font-black text-xs uppercase text-[#FDC800]">
                      <Award className="w-4 h-4 stroke-[2.5]" />
                      <span>{report.hitRate < 50 ? 'EMERGENCY TURNAROUND & RECOVERY PROTOCOL' : 'NEXT MONTH TACTICAL BATTLE DIRECTIVES'}</span>
                    </div>
                    <span className="text-[9px] font-mono font-black bg-[#FDC800] text-black px-1.5 py-0.5 rounded">
                      ACTION PLAN
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    {report.nextMonthDirectives?.map((directive, idx) => (
                      <div key={idx} className="flex items-start gap-2 bg-neutral-900 p-2.5 rounded-lg border border-white/20">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#00E599] shrink-0 mt-0.5 stroke-[2.5]" />
                        <span className="text-[11px] font-mono font-bold text-neutral-200 leading-snug">
                          <strong>Directive {idx + 1}:</strong> {directive}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Subtitle attribution note */}
                <div className="text-center pt-1 pb-2">
                  <span className="text-[10px] font-mono font-bold text-neutral-500">
                    💡 Performance intelligence synthesized from {report?.totalLogged || 0} logged days in {report?.monthName}.
                  </span>
                </div>

              </>
            ) : null}
          </div>

        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
