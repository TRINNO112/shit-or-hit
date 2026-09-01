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
  AlertCircle,
  FileText,
  CheckCircle2, 
  Copy, 
  Check, 
  Layers, 
  Compass,
  Calendar,
  Lock,
  Play,
  Activity,
  Smartphone,
  BookOpen,
  Users,
  MessageSquareQuote
} from 'lucide-react';
import { fetchMonthlyReport, getSavedMonthlyReport } from '../services/api';
import confetti from 'canvas-confetti';

export default function MonthlyReportModal({ 
  isOpen, 
  onClose, 
  initialYear, 
  initialMonth,
  isEmbedded = false
}) {
  const [year, setYear] = useState(initialYear || new Date().getFullYear());
  const [month, setMonth] = useState(initialMonth || new Date().getMonth() + 1);
  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [copied, setCopied] = useState(false);
  const [activeDayNote, setActiveDayNote] = useState(null);

  const scrollContainerRef = useRef(null);

  // Sync initial month/year if changed
  useEffect(() => {
    if (initialYear) setYear(initialYear);
    if (initialMonth) setMonth(initialMonth);
  }, [initialYear, initialMonth]);

  // Check and load saved report from database when modal opens or month changes
  useEffect(() => {
    let isMounted = true;
    if (isOpen) {
      getSavedMonthlyReport(year, month).then((saved) => {
        if (isMounted) {
          if (saved && saved.executiveSummary) {
            setReport(saved);
          } else {
            setReport(null);
          }
        }
      }).catch(() => {
        if (isMounted) setReport(null);
      });
    }
    return () => { isMounted = false; };
  }, [isOpen, year, month]);

  // Load / Re-evaluate report
  const loadReportData = async (currentYear = year, currentMonth = month, forceReevaluate = true) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchMonthlyReport(currentYear, currentMonth, null, null, forceReevaluate);
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
      setError(err.message || 'Failed to generate monthly intelligence report.');
    } finally {
      setIsLoading(false);
    }
  };

  // Close and clean up state
  const handleClose = () => {
    setReport(null);
    onClose();
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
    const newMonth = month === 1 ? 12 : month - 1;
    const newYear = month === 1 ? year - 1 : year;
    setYear(newYear);
    setMonth(newMonth);
    setReport(null);
  };

  const handleNextMonth = () => {
    const newMonth = month === 12 ? 1 : month + 1;
    const newYear = month === 12 ? year + 1 : year;
    setYear(newYear);
    setMonth(newMonth);
    setReport(null);
  };

  const handleCopyMarkdown = () => {
    if (!report) return;
    const text = `# 📊 MONTHLY PERFORMANCE INTELLIGENCE DOSSIER: ${report.monthName}
**Persona Archetype:** ${report.personaTitle}
**Hit Rate:** ${report.hitRate}% | **Average Quality:** ${report.avgScore}/5.0 (${report.totalLogged} days logged)
**Longest Slump:** ${report.longestSlump || 0} consecutive rough days

## 📌 Executive Summary
${report.executiveSummary}

## 💬 Real Talk From Your Bro (Deep Dive)
${report.homieLetter?.map(p => `${p}\n\n`).join('') || ''}

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

  const contentJSX = (
    <div 
      className={`w-full ${
        isEmbedded 
          ? 'rounded-3xl border-3 border-black shadow-[6px_6px_0px_#000000] bg-[#FFFDF5] flex flex-col overflow-hidden relative' 
          : 'w-[96vw] max-w-350 h-[92vh] max-h-[92vh] rounded-3xl border-3 border-black shadow-[8px_8px_0px_#000000] bg-[#FFFDF5] flex flex-col overflow-hidden relative'
      }`}
      style={{ padding: '0px' }}
      onClick={(e) => e.stopPropagation()}
    >
      
      {/* Top Sticky Reading Progress Tracker */}
      <div className="bg-black text-white px-5 sm:px-7 py-1.5 flex items-center justify-between border-b-2 border-black shrink-0">
        <div className="flex items-center gap-2 font-mono text-[11px] font-black">
          <Compass className="w-3.5 h-3.5 text-[#FDC800] animate-spin" style={{ animationDuration: '6s' }} />
          <span>MONTHLY PERFORMANCE INTELLIGENCE DOSSIER</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-36 sm:w-64 h-2 bg-neutral-800 rounded-full overflow-hidden border border-white/20">
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

      {/* Mobile-Optimized Clean Header */}
      <div className="px-3.5 sm:px-7 py-2 sm:py-3 border-b-2 border-black/10 flex flex-col gap-2 shrink-0 bg-[#FFFDF5]">
        {/* Row 1: Title & Optional Close Button */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#FDC800] border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_#000000] shrink-0">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-black stroke-[2.5]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h3 className="font-display font-black text-sm sm:text-lg text-black uppercase leading-none tracking-tight truncate">
                  MONTHLY DOSSIER
                </h3>
                <span className="px-1.5 py-0.5 rounded bg-black text-[#FDC800] font-mono text-[9px] font-black uppercase shrink-0">
                  GEMINI AI
                </span>
              </div>
              <span className="text-[10px] font-mono font-bold text-neutral-500 hidden md:block truncate mt-0.5">
                Deep behavioral intelligence, root-cause forensics & tactical battle plan.
              </span>
            </div>
          </div>

          {/* Optional Close Button (Only in Modal Mode) */}
          {!isEmbedded && (
            <button
              onClick={handleClose}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#FF4D4D] hover:bg-red-400 border-2 border-black flex items-center justify-center text-black cursor-pointer shadow-[2px_2px_0px_#000000] shrink-0"
              title="Close Dossier"
            >
              <X className="w-4 h-4 stroke-3" />
            </button>
          )}
        </div>

        {/* Row 2: Controls (Month Switcher, Evaluate Button, Copy Button) */}
        <div className="flex flex-wrap items-center justify-between gap-2">
              {/* Month Navigator */}
              <div className="h-8 sm:h-9 flex items-center bg-white border-2 border-black rounded-xl px-1 shadow-[2px_2px_0px_#000000]">
                <button
                  onClick={handlePrevMonth}
                  title="Previous Month"
                  className="p-1 rounded-lg hover:bg-neutral-100 text-black cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5 stroke-3" />
                </button>

                <span className="px-2 font-mono font-black text-xs text-black uppercase select-none">
                  {report?.monthName || new Date(year, month - 1, 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </span>

                <button
                  onClick={handleNextMonth}
                  title="Next Month"
                  className="p-1 rounded-lg hover:bg-neutral-100 text-black cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5 stroke-3" />
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  onClick={() => loadReportData(selectedArchetype, year, month, true)}
                  disabled={isLoading}
                  title={report ? "Re-evaluate Gemini AI with latest data" : "Run Gemini AI Performance Evaluation"}
                  className={`h-8 sm:h-9 neo-btn px-2.5 sm:px-4 text-black font-mono font-black text-xs flex items-center gap-1.5 shadow-[2px_2px_0px_#000000] cursor-pointer disabled:opacity-50 shrink-0 ${
                    report ? 'bg-[#FDC800] hover:bg-amber-300' : 'bg-[#00E599] hover:bg-emerald-400'
                  }`}
                >
                  <Wand2 className={`w-3.5 h-3.5 stroke-[2.5] ${isLoading ? 'animate-spin' : ''}`} />
                  <span>{isLoading ? 'EVALUATING...' : report ? '🔄 RE-EVALUATE' : '⚡ RUN EVALUATION'}</span>
                </button>

                {report && (
                  <button
                    onClick={handleCopyMarkdown}
                    title="Copy Dossier Markdown to Clipboard"
                    className="h-8 sm:h-9 neo-btn px-2.5 sm:px-3 bg-white hover:bg-[#FDC800] text-black font-mono font-black text-xs flex items-center gap-1 shadow-[2px_2px_0px_#000000] cursor-pointer shrink-0"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 stroke-3" /> : <Copy className="w-3.5 h-3.5 stroke-[2.5]" />}
                    <span className="hidden sm:inline">{copied ? 'COPIED' : 'COPY'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Scrollable Dossier Content Area */}
          <div 
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex-1 min-h-0 overflow-y-auto px-3 sm:px-7 py-3 sm:py-4 space-y-3 sm:space-y-4"
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
                    Synthesizing Performance Intelligence...
                  </h4>
                  <p className="text-xs font-mono text-neutral-600">
                    Gemini AI is reading your diary entries, calculating telemetry, and drafting real-talk analysis.
                  </p>
                </div>
              </div>
            ) : error ? (
              <div className="p-6 rounded-2xl border-2 border-black bg-red-100 shadow-[3px_3px_0px_#000000] text-center space-y-3">
                <AlertCircle className="w-8 h-8 text-red-600 mx-auto" />
                <h4 className="font-display font-black text-sm text-black uppercase">
                  Could Not Generate Monthly Intelligence
                </h4>
                <p className="text-xs font-mono text-neutral-700 max-w-md mx-auto">
                  {error}
                </p>
                <button
                  onClick={() => loadReportData(year, month)}
                  className="neo-btn px-4 py-2 bg-black text-[#FDC800] text-xs font-mono font-black shadow-[2px_2px_0px_#000000] cursor-pointer"
                >
                  RETRY SYNTHESIS
                </button>
              </div>
            ) : !report ? (
              /* Ready to Synthesize Launcher Screen */
              <div className="p-8 sm:p-12 rounded-3xl border-3 border-black bg-[#FFFDF5] shadow-[6px_6px_0px_#000000] text-center space-y-6 max-w-2xl mx-auto my-6">
                <div className="w-16 h-16 rounded-2xl bg-[#00E599] border-3 border-black flex items-center justify-center mx-auto shadow-[3px_3px_0px_#000000]">
                  <Sparkles className="w-8 h-8 text-black stroke-[2.5]" />
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-display font-black text-2xl uppercase text-black">
                    READY FOR MONTHLY EVALUATION
                  </h4>
                  <p className="text-xs font-mono text-neutral-700 max-w-lg mx-auto leading-relaxed">
                    Generate comprehensive behavioral forensics, hit-rate curves, and candid homie advice for <strong>{new Date(year, month - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</strong>.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => loadReportData(year, month)}
                    className="neo-btn px-6 py-3 bg-[#00E599] hover:bg-emerald-400 text-black font-display font-black text-sm uppercase flex items-center gap-2 shadow-[3px_3px_0px_#000000] cursor-pointer"
                  >
                    <Wand2 className="w-4 h-4 stroke-[2.5]" />
                    <span>⚡ RUN EVALUATION ({new Date(year, month - 1, 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })})</span>
                  </button>
                </div>
              </div>
            ) : report.totalLogged === 0 ? (
              /* Clean Empty Month State */
              <div className="p-8 sm:p-12 rounded-3xl border-3 border-black bg-white shadow-[6px_6px_0px_#000000] text-center space-y-5 max-w-2xl mx-auto my-6">
                <div className="w-16 h-16 rounded-2xl bg-neutral-100 border-3 border-black flex items-center justify-center mx-auto shadow-[3px_3px_0px_#000000]">
                  <Calendar className="w-8 h-8 text-neutral-600 stroke-[2.5]" />
                </div>
                <div className="space-y-2">
                  <h4 className="font-display font-black text-xl uppercase text-black">
                    NO ENTRIES LOGGED FOR {new Date(year, month - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase()}
                  </h4>
                  <p className="text-xs font-mono text-neutral-600 max-w-md mx-auto leading-relaxed">
                    You have not logged any daily verdicts for this month yet. Log your days on the dashboard or calendar to generate your monthly performance dossier.
                  </p>
                </div>
              </div>
            ) : report ? (
              <>
                {/* Persona Archetype Banner with Homie Tough-Love Styling */}
                <div className={`p-3.5 sm:p-5 rounded-2xl border-2 border-black flex flex-col md:flex-row items-start md:items-center justify-between gap-3 sm:gap-4 shrink-0 ${
                  report.hitRate < 50 
                    ? 'bg-[#1C1917] text-white shadow-[3px_3px_0px_#FDC800]' 
                    : report.hitRate >= 80 
                    ? 'bg-[#FDC800] text-black shadow-[3px_3px_0px_#000000]' 
                    : 'bg-[#00E599] text-black shadow-[3px_3px_0px_#000000]'
                }`}>
                  <div>
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                      <span className={`text-[9px] font-mono font-black px-2 py-0.5 rounded uppercase tracking-wider ${
                        report.hitRate < 50 ? 'bg-[#FDC800] text-black' : 'bg-black text-white'
                      }`}>
                        MONTHLY PERSONA ARCHETYPE
                      </span>
                      {report.hitRate < 50 && (
                        <span className="text-[9px] font-mono font-black bg-red-950 text-red-300 border border-red-800 px-2 py-0.5 rounded uppercase">
                          RAW TRENCH SURVIVAL
                        </span>
                      )}
                      {report.evaluatedAt && (
                        <span className="text-[9px] font-mono font-bold bg-black/40 text-neutral-200 border border-white/20 px-2 py-0.5 rounded">
                          💾 SAVED IN LOCAL DB ({new Date(report.evaluatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                        </span>
                      )}
                    </div>

                    <h4 className={`font-display font-black text-lg sm:text-2xl uppercase tracking-tight mt-1.5 ${
                      report.hitRate < 50 ? 'text-white' : 'text-black'
                    }`}>
                      "{report.personaTitle}"
                    </h4>
                    <p className={`text-xs font-mono font-bold mt-1 leading-relaxed max-w-3xl ${
                      report.hitRate < 50 ? 'text-neutral-300' : 'text-neutral-800'
                    }`}>
                      {report.executiveSummary}
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-2 w-full md:w-auto shrink-0 pt-1 md:pt-0">
                    <div className={`px-2 py-1.5 sm:px-3 rounded-xl border-2 border-black text-center shadow-[2px_2px_0px_#000000] ${
                      report.hitRate < 50 ? 'bg-neutral-900 text-white' : 'bg-white text-black'
                    }`}>
                      <span className="block text-[8px] font-mono font-bold text-neutral-400">HIT RATE</span>
                      <span className={`font-display font-black text-base sm:text-lg leading-none mt-0.5 ${
                        report.hitRate < 50 ? 'text-[#FF4D4D]' : 'text-black'
                      }`}>
                        {report.hitRate}%
                      </span>
                    </div>

                    <div className={`px-2 py-1.5 sm:px-3 rounded-xl border-2 border-black text-center shadow-[2px_2px_0px_#000000] ${
                      report.hitRate < 50 ? 'bg-neutral-900 text-white' : 'bg-white text-black'
                    }`}>
                      <span className="block text-[8px] font-mono font-bold text-neutral-400">AVG SCORE</span>
                      <span className="font-display font-black text-base sm:text-lg leading-none mt-0.5 text-black">
                        {report.avgScore}
                      </span>
                    </div>

                    <div className={`px-2 py-1.5 sm:px-3 rounded-xl border-2 border-black text-center shadow-[2px_2px_0px_#000000] ${
                      report.hitRate < 50 ? 'bg-neutral-900 text-white' : 'bg-white text-black'
                    }`}>
                      <span className="block text-[8px] font-mono font-bold text-neutral-400">MAX SLUMP</span>
                      <span className="font-display font-black text-base sm:text-lg leading-none mt-0.5 text-[#FF8A00]">
                        {report.longestSlump || 0}d
                      </span>
                    </div>
                  </div>
                </div>

                {/* 💬 REAL TALK FROM YOUR BRO: DEEP-DIVE PARAGRAPHS */}
                {report.homieLetter && report.homieLetter.length > 0 && (
                  <div className="p-5 sm:p-6 rounded-2xl border-2 border-black bg-[#FFFBEA] shadow-[3px_3px_0px_#000000] space-y-3">
                    <div className="flex items-center gap-2 pb-2 border-b border-black/10">
                      <span className="text-xl">💬</span>
                      <h4 className="font-display font-black text-sm uppercase text-black flex items-center gap-2">
                        <span>REAL TALK FROM YOUR BRO: THE UNFILTERED DEEP DIVE</span>
                        <span className="px-1.5 py-0.5 rounded bg-black text-[#FDC800] font-mono text-[9px] font-black uppercase">
                          LISTENING TO YOU
                        </span>
                      </h4>
                    </div>

                    <div className="space-y-3">
                      {report.homieLetter.map((paragraph, pIdx) => (
                        <p key={pIdx} className="text-xs sm:text-[13px] font-mono text-neutral-900 leading-relaxed font-semibold">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {/* 📊 DEEP ANALYTICS ROW: Weekly Trajectory & Friction Leak Factors */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
                  
                  {/* Left: Weekly Phase Trajectory (7 cols) */}
                  <div className="md:col-span-7 p-4 rounded-xl border-2 border-black bg-white shadow-[2px_2px_0px_#000000] flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-black/10">
                      <span className="font-display font-black text-xs uppercase text-black flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5 text-black stroke-[2.5]" />
                        <span>WEEKLY PHASE VELOCITY TRAJECTORY</span>
                      </span>
                      <span className="text-[10px] font-mono font-bold text-neutral-500">
                        Avg Score / 5.0
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 pt-1">
                      {report.weeklyAnalytics?.map((week, idx) => (
                        <div key={idx} className="p-2.5 rounded-lg border border-black/20 bg-neutral-50 flex flex-col justify-between">
                          <span className="text-[10px] font-mono font-black uppercase text-neutral-600 truncate">
                            Week {idx + 1}
                          </span>
                          <div className="my-1.5 flex items-baseline gap-1">
                            <span className="font-display font-black text-xl text-black">
                              {week.avgScore || '—'}
                            </span>
                            <span className="text-[9px] font-mono font-bold text-neutral-500">
                              / 5.0
                            </span>
                          </div>
                          <div className="h-1.5 w-full bg-neutral-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${week.avgScore >= 3.5 ? 'bg-[#00E599]' : week.avgScore >= 2.5 ? 'bg-[#FDC800]' : 'bg-[#FF8A00]'}`}
                              style={{ width: `${Math.min(100, (week.avgScore / 5.0) * 100)}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right: Friction Root-Cause Leak Distribution (5 cols) */}
                  <div className="md:col-span-5 p-4 rounded-xl border-2 border-black bg-white shadow-[2px_2px_0px_#000000] flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-black/10">
                      <span className="font-display font-black text-xs uppercase text-black flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-[#FF4D4D] stroke-[2.5]" />
                        <span>FRICTION ROOT-CAUSE LEAK FACTOR</span>
                      </span>
                      <span className="text-[10px] font-mono font-bold text-neutral-500">
                        DIARY KEYWORDS
                      </span>
                    </div>

                    <div className="space-y-2 pt-1">
                      <div>
                        <div className="flex justify-between text-[10px] font-mono font-bold text-black mb-0.5">
                          <span className="flex items-center gap-1">
                            <Smartphone className="w-3 h-3 text-purple-600" />
                            <span>Screen Doomscrolling & 3 AM Traps</span>
                          </span>
                          <span>{report.frictionBreakdown?.screenDoomscrollPct || 0}%</span>
                        </div>
                        <div className="h-2 w-full bg-neutral-100 rounded-full border border-black/20 overflow-hidden">
                          <div className="h-full bg-purple-500" style={{ width: `${report.frictionBreakdown?.screenDoomscrollPct || 0}%` }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[10px] font-mono font-bold text-black mb-0.5">
                          <span className="flex items-center gap-1">
                            <BookOpen className="w-3 h-3 text-red-600" />
                            <span>Academic Pressure & Balance Sheets</span>
                          </span>
                          <span>{report.frictionBreakdown?.academicStressPct || 0}%</span>
                        </div>
                        <div className="h-2 w-full bg-neutral-100 rounded-full border border-black/20 overflow-hidden">
                          <div className="h-full bg-[#FF4D4D]" style={{ width: `${report.frictionBreakdown?.academicStressPct || 0}%` }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[10px] font-mono font-bold text-black mb-0.5">
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3 text-amber-600" />
                            <span>Family Chores, Chaos & Canteen FOMO</span>
                          </span>
                          <span>{report.frictionBreakdown?.householdSocialPct || 0}%</span>
                        </div>
                        <div className="h-2 w-full bg-neutral-100 rounded-full border border-black/20 overflow-hidden">
                          <div className="h-full bg-[#FF8A00]" style={{ width: `${report.frictionBreakdown?.householdSocialPct || 0}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>

                </div>

                {/* 🗓️ 31-DAY HIGH-DENSITY MICRO-VERDICT MATRIX */}
                {report.dayMatrix && report.dayMatrix.length > 0 && (
                  <div className="p-4 rounded-xl border-2 border-black bg-white shadow-[2px_2px_0px_#000000] space-y-2">
                    <div className="flex items-center justify-between pb-1 border-b border-black/10">
                      <span className="font-display font-black text-xs uppercase text-black flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-black stroke-[2.5]" />
                        <span>31-DAY MICRO-VERDICT MATRIX (CLICK ANY DAY TO INSPECT NOTES)</span>
                      </span>
                      <span className="text-[10px] font-mono font-bold text-neutral-500">
                        {report.dayMatrix.length} DAYS LOGGED
                      </span>
                    </div>

                    <div className="grid grid-cols-7 sm:grid-cols-11 md:grid-cols-16 lg:grid-cols-31 gap-1.5 pt-1">
                      {report.dayMatrix.map((item) => {
                        const isSelected = activeDayNote?.day === item.day;
                        const bg = item.rating === 5 ? 'bg-[#FDC800]' : item.rating === 4 ? 'bg-[#00E599]' : item.rating === 3 ? 'bg-neutral-300' : item.rating === 2 ? 'bg-[#FF8A00]' : 'bg-[#FF4D4D]';
                        return (
                          <button
                            key={item.day}
                            type="button"
                            onClick={() => setActiveDayNote(isSelected ? null : item)}
                            className={`p-1 rounded-lg border-2 border-black flex flex-col items-center justify-center transition-all cursor-pointer ${bg} ${
                              isSelected ? 'ring-2 ring-black scale-110 shadow-[2px_2px_0px_#000000]' : 'hover:scale-105'
                            }`}
                            title={`Day ${item.day}: Rating ${item.rating}/5`}
                          >
                            <span className="text-[9px] font-mono font-black text-black leading-none">
                              {item.day}
                            </span>
                            <span className="text-[8px] font-mono font-bold text-black mt-0.5">
                              {item.rating}★
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Expandable Day Note Inspector */}
                    {activeDayNote && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="p-3.5 rounded-lg border-2 border-black bg-amber-50 shadow-[2px_2px_0px_#000000] mt-2 flex items-start justify-between gap-3"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded bg-black text-[#FDC800] font-mono font-black text-[10px]">
                              DAY {activeDayNote.day} ({activeDayNote.date})
                            </span>
                            <span className="font-mono font-black text-xs text-black">
                              Rating: {activeDayNote.rating}/5.0
                            </span>
                          </div>
                          <p className="text-xs font-mono text-neutral-800 leading-snug">
                            {activeDayNote.notes || "No extra diary notes logged for this day."}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setActiveDayNote(null)}
                          className="p-1 rounded bg-black text-white hover:bg-neutral-800 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </motion.div>
                    )}
                  </div>
                )}

                {/* 2-Column Weekday Heatmap & Rating Breakdown */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
                  
                  {/* Left: Weekday Heatmap */}
                  <div className="lg:col-span-7 p-3.5 rounded-xl border-2 border-black bg-white shadow-[2px_2px_0px_#000000] flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-2 pb-1 border-b border-black/10">
                      <span className="font-display font-black text-xs uppercase text-black flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5 text-black stroke-[2.5]" />
                        <span>WEEKDAY MOMENTUM DISTRIBUTION</span>
                      </span>
                      <span className="text-[10px] font-mono font-bold text-neutral-500">
                        Score / 5.0
                      </span>
                    </div>

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

                  {/* Right: Verdict Breakdown */}
                  <div className="lg:col-span-5 p-3.5 rounded-xl border-2 border-black bg-white shadow-[2px_2px_0px_#000000] flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-2 pb-1 border-b border-black/10">
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

                {/* 🔍 Hidden Behavioral Patterns & Homie Observations (Full 6 Items) */}
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-black stroke-[2.5]" />
                    <h5 className="font-display font-black text-xs text-black uppercase tracking-wider">
                      HIDDEN BEHAVIORAL CORRELATIONS & HOMIE OBSERVATIONS
                    </h5>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {report.hiddenFacts?.map((fact, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.08, duration: 0.35 }}
                        className="p-3.5 rounded-xl border-2 border-black bg-[#FFFDF5] shadow-[2px_2px_0px_#000000] flex items-start gap-2.5"
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

                {/* 🎯 Next Month Homie Battle Directives */}
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

        </div>
  );

  if (isEmbedded) {
    return contentJSX;
  }

  return (
    <AnimatePresence>
      <motion.div 
        key="dossier-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-5 bg-black/75 backdrop-blur-xs"
        onClick={handleClose}
      >
        {contentJSX}
      </motion.div>
    </AnimatePresence>
  );
}
