import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, 
  Flame, 
  Sparkles, 
  Cloud, 
  Download, 
  Calendar, 
  BarChart2, 
  Clock, 
  Check, 
  PenLine, 
  ChevronRight, 
  ChevronLeft,
  CheckCircle2,
  LogIn,
  AlertCircle,
  CloudRain,
  MinusCircle,
  Wand2,
  Lock,
  Activity,
  Layers,
  TrendingUp,
  AlertTriangle,
  Smartphone,
  BookOpen,
  Users,
  Compass,
  X
} from 'lucide-react';
import { ratingMeta, exportDatabaseBackup, fetchMonthlyReport, getSavedMonthlyReport } from '../services/api';
import { loginWithGoogle, logoutUser, isEmailWhitelisted, subscribeAuthState } from '../services/firebase';
import confetti from 'canvas-confetti';
import JourneyTimeline from './JourneyTimeline';
import StatsWidget from './StatsWidget';

const IconMap = {
  AlertCircle,
  CloudRain,
  MinusCircle,
  Zap,
  Sparkles
};

export default function MobileAppView({
  startDate,
  entries,
  dayCount,
  todayStr,
  onSaveToday,
  onOpenMonthlyReport,
  onEditDay
}) {
  const [activeTab, setActiveTab] = useState('log'); // 'log' | 'history' | 'dossier' | 'stats'
  const [historySubView, setHistorySubView] = useState('calendar'); // 'calendar' | 'timeline'
  
  const [user, setUser] = useState(null);
  const [showNoteDrawer, setShowNoteDrawer] = useState(false);
  const [noteText, setNoteText] = useState(entries[todayStr]?.notes || '');
  const [savedFlash, setSavedFlash] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);

  // Embedded Calendar State
  const [calendarDate, setCalendarDate] = useState(new Date());
  
  // Embedded Dossier State
  const [dossierYear, setDossierYear] = useState(new Date().getFullYear());
  const [dossierMonth, setDossierMonth] = useState(new Date().getMonth() + 1);
  const [dossierArchetype, setDossierArchetype] = useState(null);
  const [dossierReport, setDossierReport] = useState(null);
  const [dossierLoading, setDossierLoading] = useState(false);
  const [dossierError, setDossierError] = useState(null);
  const [activeDayNote, setActiveDayNote] = useState(null);

  useEffect(() => {
    const unsub = subscribeAuthState((currentUser) => {
      setUser(currentUser);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (entries[todayStr]?.notes !== undefined) {
      setNoteText(entries[todayStr].notes);
    }
  }, [entries, todayStr]);

  // Auto-load saved dossier when switching to Dossier tab
  useEffect(() => {
    if (activeTab === 'dossier') {
      loadDossier(dossierArchetype, dossierYear, dossierMonth, false);
    }
  }, [activeTab, dossierArchetype, dossierYear, dossierMonth]);

  const loadDossier = async (archId, yr, mo, force = false) => {
    setDossierLoading(true);
    setDossierError(null);
    try {
      if (!force) {
        const saved = await getSavedMonthlyReport(yr, mo, archId);
        if (saved) {
          setDossierReport(saved);
          setDossierLoading(false);
          return;
        }
      }
      const data = await fetchMonthlyReport(yr, mo, null, archId, force);
      setDossierReport(data);
    } catch (err) {
      console.error('Failed to load mobile dossier:', err);
      setDossierError('Could not load evaluation. Tap Retry below.');
    } finally {
      setDossierLoading(false);
    }
  };

  const selectedRating = entries[todayStr]?.rating || null;
  const isWhitelisted = user && isEmailWhitelisted(user.email);

  const now = new Date();
  const dayName = now.toLocaleDateString('en-US', { weekday: 'long' });
  const fullDate = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const handleRate = async (val) => {
    if (val === 5) {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 }, colors: ['#FDC800', '#000000', '#00E599'] });
    } else if (val === 4) {
      confetti({ particleCount: 25, spread: 45, origin: { y: 0.75 }, colors: ['#00E599', '#000000'] });
    }

    setSavedFlash(true);
    await onSaveToday({
      date: todayStr,
      rating: val,
      verdict: ratingMeta[val]?.title || 'Verdict',
      notes: noteText
    });
    setTimeout(() => setSavedFlash(false), 2000);
  };

  const handleSaveNote = async () => {
    const ratingToUse = selectedRating || 3;
    await onSaveToday({
      date: todayStr,
      rating: ratingToUse,
      verdict: ratingMeta[ratingToUse]?.title || 'Verdict',
      notes: noteText
    });
    setShowNoteDrawer(false);
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 2000);
  };

  const handleGoogleLogin = async () => {
    setAuthLoading(true);
    try {
      await loginWithGoogle();
    } catch (err) {
      console.error('Login error:', err);
    } finally {
      setAuthLoading(false);
    }
  };

  // Calendar Calculation Helpers
  const calYear = calendarDate.getFullYear();
  const calMonth = calendarDate.getMonth() + 1;
  const calMonthName = calendarDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const firstDay = new Date(calYear, calMonth - 1, 1);
  const lastDay = new Date(calYear, calMonth, 0);
  const totalDaysInMonth = lastDay.getDate();
  const startDayOfWeek = firstDay.getDay();
  const leadingBlanks = (startDayOfWeek === 0 ? 6 : startDayOfWeek - 1);

  const calDays = [];
  for (let d = 1; d <= totalDaysInMonth; d++) {
    const dObj = new Date(calYear, calMonth - 1, d);
    const yStr = dObj.getFullYear();
    const mStr = String(dObj.getMonth() + 1).padStart(2, '0');
    const dStr = String(dObj.getDate()).padStart(2, '0');
    const dateStr = `${yStr}-${mStr}-${dStr}`;
    const isBeforeStart = dateStr < startDate;
    const isFuture = dateStr > todayStr;
    const entry = entries[dateStr] || null;
    calDays.push({ dayNum: d, dateStr, entry, isBeforeStart, isFuture, isToday: dateStr === todayStr });
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#FFFDF5] text-black font-sans pb-28 select-none relative">
      
      {/* 📱 TOP COMPACT APP BAR */}
      <header className="sticky top-0 z-40 bg-[#FFFDF5]/95 backdrop-blur-md border-b-2 border-black px-4 py-2.5 flex items-center justify-between shadow-[0_2px_0px_#000000]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#FDC800] border-2 border-black flex items-center justify-center shadow-[1.5px_1.5px_0px_#000000]">
            <Zap className="w-4 h-4 text-black stroke-[3] fill-black" />
          </div>
          <div>
            <h1 className="font-display font-black text-sm uppercase leading-none tracking-tight">
              Daily Verdict
            </h1>
            <span className="text-[9px] font-mono font-bold text-neutral-500 block mt-0.5">
              {isWhitelisted ? `☁️ ${user.displayName?.split(' ')[0] || 'Cloud Synced'}` : 'Offline Local Mode'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Day Streak Pill */}
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#00E599] border-2 border-black font-mono text-[10px] font-black shadow-[1px_1px_0px_#000000]">
            <Flame className="w-3 h-3 fill-black text-black" />
            <span>DAY {dayCount}</span>
          </div>

          {/* Cloud Auth / Profile */}
          {user ? (
            <button
              onClick={() => setShowUserModal(true)}
              className={`p-1.5 rounded-lg border-2 border-black shadow-[1px_1px_0px_#000000] cursor-pointer ${
                isWhitelisted ? 'bg-[#00E599]' : 'bg-neutral-200'
              }`}
              title={user.email}
            >
              <Cloud className="w-3.5 h-3.5 text-black stroke-[2.5]" />
            </button>
          ) : (
            <button
              onClick={handleGoogleLogin}
              disabled={authLoading}
              className="px-2 py-0.5 rounded-lg bg-white border-2 border-black font-mono text-[10px] font-black flex items-center gap-1 shadow-[1px_1px_0px_#000000] cursor-pointer"
            >
              <LogIn className="w-3 h-3 stroke-[2.5]" />
              <span>SYNC</span>
            </button>
          )}

          {/* Backup Button */}
          <button
            onClick={() => exportDatabaseBackup(startDate, entries)}
            className="p-1.5 rounded-lg bg-white border-2 border-black shadow-[1px_1px_0px_#000000] cursor-pointer"
            title="Download JSON Backup"
          >
            <Download className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
        </div>
      </header>

      {/* ========================================================= */}
      {/* ⚡ TAB 1: RAPID 1-TAP MOOD LOGGER */}
      {/* ========================================================= */}
      {activeTab === 'log' && (
        <main className="flex-1 px-3.5 py-3 space-y-3 max-w-lg mx-auto w-full">
          
          {/* Hero Date Banner */}
          <div className="p-3.5 rounded-2xl border-2 border-black bg-white shadow-[2.5px_2.5px_0px_#000000] flex items-center justify-between">
            <div>
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-black text-white text-[9px] font-mono font-black mb-1">
                <span>TODAY</span>
                <span>•</span>
                <span>DAY {dayCount}</span>
              </div>
              <h2 className="font-display font-black text-xl uppercase tracking-tight leading-none text-black">
                {dayName}
              </h2>
              <p className="text-[11px] font-mono font-bold text-neutral-600 mt-1">
                {fullDate}
              </p>
            </div>

            {selectedRating && (
              <div 
                className="w-11 h-11 rounded-xl border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_#000000]"
                style={{ backgroundColor: ratingMeta[selectedRating]?.bg }}
              >
                {React.createElement(IconMap[ratingMeta[selectedRating]?.icon] || Sparkles, {
                  className: "w-5 h-5 text-black stroke-[2.5]"
                })}
              </div>
            )}
          </div>

          {/* 5 Prominent 1-Tap Tactile Cards (NO Truncated Text) */}
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((val) => {
              const m = ratingMeta[val];
              const SvgIcon = IconMap[m.icon];
              const isSelected = selectedRating === val;

              return (
                <motion.button
                  key={val}
                  type="button"
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleRate(val)}
                  className={`w-full p-3 rounded-2xl border-2 border-black flex items-center justify-between shadow-[2.5px_2.5px_0px_#000000] cursor-pointer transition-all ${
                    isSelected ? 'ring-2.5 ring-black scale-[1.01]' : 'hover:bg-neutral-50'
                  }`}
                  style={{ 
                    backgroundColor: isSelected ? m.bg : '#FFFFFF'
                  }}
                >
                  <div className="flex items-center gap-2.5">
                    <div 
                      className="w-9 h-9 rounded-xl border-2 border-black flex items-center justify-center shadow-[1px_1px_0px_#000000] shrink-0"
                      style={{ backgroundColor: m.bg }}
                    >
                      <SvgIcon className="w-4 h-4 text-black stroke-[2.5]" />
                    </div>

                    <div className="text-left">
                      <div className="flex items-center gap-1.5">
                        <span className="font-display font-black text-sm uppercase text-black leading-tight">
                          {m.title}
                        </span>
                        <span className="text-[11px] font-mono font-black text-neutral-800">
                          ({val}/5★)
                        </span>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-neutral-600 block">
                        {m.desc}
                      </span>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-black text-white flex items-center justify-center shrink-0 shadow-[1px_1px_0px_#000000]">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Active Verdict Status & 60% Screen Space Reflection Drawer */}
          <div className="pt-1 space-y-2">
            {selectedRating ? (
              <div 
                className="p-2.5 rounded-xl border-2 border-black text-[11px] font-mono font-bold text-black flex items-center justify-between shadow-[1.5px_1.5px_0px_#000000]"
                style={{ backgroundColor: ratingMeta[selectedRating]?.bg }}
              >
                <div className="flex items-center gap-1.5 truncate">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-black stroke-[2.5]" />
                  <span className="truncate">
                    <strong>{ratingMeta[selectedRating]?.title.toUpperCase()}</strong>: {ratingMeta[selectedRating]?.desc}
                  </span>
                </div>
                {savedFlash && (
                  <span className="px-1.5 py-0.5 rounded bg-black text-white text-[9px] font-black uppercase shrink-0">
                    SAVED ⚡
                  </span>
                )}
              </div>
            ) : (
              <div className="p-2.5 rounded-xl border-2 border-black bg-neutral-100 text-neutral-600 text-[11px] font-mono font-bold text-center">
                Tap any card above to record today.
              </div>
            )}

            {/* Reflection Drawer Trigger */}
            <button
              onClick={() => setShowNoteDrawer(true)}
              className="w-full py-2.5 px-4 rounded-xl border-2 border-black bg-white hover:bg-[#FDC800] text-black font-mono font-black text-xs flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_#000000] cursor-pointer"
            >
              <PenLine className="w-3.5 h-3.5" />
              <span>{entries[todayStr]?.notes ? '✏️ EDIT DIARY NOTE' : '+ ADD OPTIONAL NOTE'}</span>
            </button>
          </div>

        </main>
      )}

      {/* ========================================================= */}
      {/* 📅 TAB 2: HISTORY (CALENDAR GRID + TIMELINE LIST) */}
      {/* ========================================================= */}
      {activeTab === 'history' && (
        <main className="flex-1 px-3.5 py-3 space-y-3 max-w-lg mx-auto w-full">
          
          {/* Sub-View Switcher: Calendar Grid vs Timeline */}
          <div className="flex items-center justify-between bg-white border-2 border-black p-1 rounded-xl shadow-[2px_2px_0px_#000000]">
            <button
              onClick={() => setHistorySubView('calendar')}
              className={`flex-1 py-1.5 rounded-lg font-mono text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                historySubView === 'calendar' ? 'bg-[#FDC800] text-black shadow-[1px_1px_0px_#000000]' : 'text-neutral-600 hover:text-black'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>CALENDAR GRID</span>
            </button>
            <button
              onClick={() => setHistorySubView('timeline')}
              className={`flex-1 py-1.5 rounded-lg font-mono text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                historySubView === 'timeline' ? 'bg-[#FDC800] text-black shadow-[1px_1px_0px_#000000]' : 'text-neutral-600 hover:text-black'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>TIMELINE LIST</span>
            </button>
          </div>

          {/* Sub-View 1: Native Calendar Grid */}
          {historySubView === 'calendar' && (
            <div className="bg-white border-2 border-black rounded-2xl p-3.5 shadow-[3px_3px_0px_#000000] space-y-3">
              {/* Month Switcher */}
              <div className="flex items-center justify-between border-b-2 border-black/10 pb-2.5">
                <button
                  onClick={() => setCalendarDate(new Date(calYear, calMonth - 2, 1))}
                  className="p-1.5 rounded-lg border-2 border-black bg-white shadow-[1px_1px_0px_#000000] cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4 stroke-[3]" />
                </button>
                <h3 className="font-display font-black text-base uppercase text-black">
                  {calMonthName}
                </h3>
                <button
                  onClick={() => setCalendarDate(new Date(calYear, calMonth, 1))}
                  className="p-1.5 rounded-lg border-2 border-black bg-white shadow-[1px_1px_0px_#000000] cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4 stroke-[3]" />
                </button>
              </div>

              {/* Day Headers (Mon - Sun) */}
              <div className="grid grid-cols-7 gap-1 text-center font-mono font-black text-[10px] text-neutral-500">
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                  <span key={i} className="py-0.5">{d}</span>
                ))}
              </div>

              {/* Day Grid */}
              <div className="grid grid-cols-7 gap-1.5">
                {Array.from({ length: leadingBlanks }).map((_, i) => (
                  <div key={`blank-${i}`} className="aspect-square opacity-0" />
                ))}

                {calDays.map(({ dayNum, dateStr, entry, isBeforeStart, isFuture, isToday }) => {
                  const rating = entry?.rating || null;
                  const m = rating ? ratingMeta[rating] : null;

                  return (
                    <button
                      key={dateStr}
                      disabled={isFuture || isBeforeStart}
                      onClick={() => onEditDay({ dateStr, dayIndex: dayNum, entry })}
                      className={`aspect-square rounded-xl border-2 border-black flex flex-col items-center justify-center p-1 relative transition-all cursor-pointer shadow-[1.5px_1.5px_0px_#000000] disabled:opacity-25 disabled:shadow-none ${
                        isToday ? 'ring-2 ring-black font-black' : ''
                      }`}
                      style={{
                        backgroundColor: m ? m.bg : '#F8FAFC'
                      }}
                    >
                      <span className="text-[11px] font-mono font-black leading-none text-black">
                        {dayNum}
                      </span>
                      {entry?.notes && (
                        <div className="w-1.5 h-1.5 rounded-full bg-black mt-1" />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="text-center pt-1 border-t border-black/10">
                <span className="text-[10px] font-mono font-bold text-neutral-500">
                  Tap any past day to edit mood rating or diary reflections.
                </span>
              </div>
            </div>
          )}

          {/* Sub-View 2: Timeline Stream */}
          {historySubView === 'timeline' && (
            <JourneyTimeline
              startDate={startDate}
              todayStr={todayStr}
              entries={entries}
              onEditDay={onEditDay}
            />
          )}

        </main>
      )}

      {/* ========================================================= */}
      {/* 🧠 TAB 3: COMPLETE RICH NATIVE MONTHLY DOSSIER */}
      {/* ========================================================= */}
      {activeTab === 'dossier' && (
        <main className="flex-1 px-3.5 py-3 space-y-3 max-w-lg mx-auto w-full">
          
          {/* Dossier Header Card */}
          <div className="p-3.5 rounded-2xl border-2 border-black bg-[#FFFDF5] shadow-[2.5px_2.5px_0px_#000000] space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#FDC800] border-2 border-black flex items-center justify-center shadow-[1.5px_1.5px_0px_#000000]">
                  <Sparkles className="w-4 h-4 text-black stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="font-display font-black text-sm uppercase text-black leading-none">
                    Monthly Dossier
                  </h3>
                  <span className="text-[9px] font-mono font-bold text-neutral-500">
                    Gemini AI Behavioral Intelligence
                  </span>
                </div>
              </div>

              {/* Month Switcher */}
              <div className="flex items-center bg-white border-2 border-black rounded-lg px-1 shadow-[1px_1px_0px_#000000]">
                <button
                  onClick={() => {
                    const prevMo = dossierMonth === 1 ? 12 : dossierMonth - 1;
                    const prevYr = dossierMonth === 1 ? dossierYear - 1 : dossierYear;
                    setDossierMonth(prevMo);
                    setDossierYear(prevYr);
                  }}
                  className="p-1 text-black cursor-pointer"
                >
                  <ChevronLeft className="w-3 h-3 stroke-[3]" />
                </button>
                <span className="px-1.5 font-mono font-black text-[11px] text-black uppercase">
                  {new Date(dossierYear, dossierMonth - 1, 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </span>
                <button
                  onClick={() => {
                    const nextMo = dossierMonth === 12 ? 1 : dossierMonth + 1;
                    const nextYr = dossierMonth === 12 ? dossierYear + 1 : dossierYear;
                    setDossierMonth(nextMo);
                    setDossierYear(nextYr);
                  }}
                  className="p-1 text-black cursor-pointer"
                >
                  <ChevronRight className="w-3 h-3 stroke-[3]" />
                </button>
              </div>
            </div>

            {/* Target Dataset & Re-evaluate Buttons */}
            <div className="flex items-center justify-between gap-1.5 pt-1 border-t border-black/10">
              <button
                onClick={() => {
                  const nextArch = dossierArchetype ? null : 'strugglingStudent';
                  setDossierArchetype(nextArch);
                }}
                className={`px-2 py-1 rounded-lg border-2 border-black font-mono text-[10px] font-black cursor-pointer ${
                  dossierArchetype ? 'bg-[#FF8A00] text-black shadow-[1.5px_1.5px_0px_#000000]' : 'bg-white text-neutral-700'
                }`}
              >
                {dossierArchetype ? "🎓 Aryan's 30d Test" : "↩️ My Real DB"}
              </button>

              <button
                onClick={() => loadDossier(dossierArchetype, dossierYear, dossierMonth, true)}
                disabled={dossierLoading}
                className="px-3 py-1 bg-[#00E599] hover:bg-emerald-400 text-black font-mono font-black text-[11px] uppercase rounded-lg border-2 border-black shadow-[1.5px_1.5px_0px_#000000] flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                <Wand2 className={`w-3 h-3 stroke-[2.5] ${dossierLoading ? 'animate-spin' : ''}`} />
                <span>{dossierLoading ? 'Evaluating...' : dossierReport ? '🔄 Re-Evaluate' : '⚡ Run Evaluation'}</span>
              </button>
            </div>
          </div>

          {/* Dossier Content Body */}
          {dossierLoading ? (
            <div className="p-8 rounded-2xl border-2 border-black bg-white text-center space-y-2 shadow-[2px_2px_0px_#000000]">
              <Sparkles className="w-8 h-8 text-[#FDC800] animate-bounce mx-auto" />
              <h4 className="font-display font-black text-sm uppercase text-black">
                Synthesizing Monthly Dossier...
              </h4>
              <p className="text-[10px] font-mono text-neutral-600">
                Gemini AI is analyzing behavioral patterns, calculating forensics, and drafting real-talk advice.
              </p>
            </div>
          ) : dossierError ? (
            <div className="p-4 rounded-2xl border-2 border-black bg-red-100 text-center space-y-2">
              <AlertCircle className="w-6 h-6 text-red-600 mx-auto" />
              <p className="text-xs font-mono font-bold text-red-900">{dossierError}</p>
              <button
                onClick={() => loadDossier(dossierArchetype, dossierYear, dossierMonth, true)}
                className="px-3 py-1 bg-black text-[#FDC800] font-mono text-xs font-black rounded-lg"
              >
                Retry
              </button>
            </div>
          ) : dossierReport ? (
            <div className="space-y-3">
              
              {/* 1. Persona Archetype Card */}
              <div className={`p-3.5 rounded-2xl border-2 border-black space-y-2 shadow-[2.5px_2.5px_0px_#000000] ${
                dossierReport.hitRate < 50 ? 'bg-[#1C1917] text-white' : 'bg-[#FDC800] text-black'
              }`}>
                <div className="flex items-center justify-between">
                  <span className={`text-[8px] font-mono font-black px-1.5 py-0.5 rounded uppercase ${
                    dossierReport.hitRate < 50 ? 'bg-[#FDC800] text-black' : 'bg-black text-white'
                  }`}>
                    MONTHLY PERSONA
                  </span>
                  <span className="text-[9px] font-mono font-bold opacity-80">
                    💾 Saved in Local DB
                  </span>
                </div>

                <h4 className="font-display font-black text-lg uppercase tracking-tight leading-tight">
                  "{dossierReport.personaTitle}"
                </h4>

                <p className={`text-[11px] font-mono font-bold leading-relaxed ${
                  dossierReport.hitRate < 50 ? 'text-neutral-300' : 'text-neutral-900'
                }`}>
                  {dossierReport.executiveSummary}
                </p>

                <div className="grid grid-cols-3 gap-1.5 pt-1">
                  <div className={`p-1.5 rounded-xl border-2 border-black text-center ${
                    dossierReport.hitRate < 50 ? 'bg-neutral-900 text-white' : 'bg-white text-black'
                  }`}>
                    <span className="block text-[7px] font-mono font-bold text-neutral-400">HIT RATE</span>
                    <span className="font-display font-black text-base leading-none text-[#FF4D4D]">
                      {dossierReport.hitRate}%
                    </span>
                  </div>

                  <div className={`p-1.5 rounded-xl border-2 border-black text-center ${
                    dossierReport.hitRate < 50 ? 'bg-neutral-900 text-white' : 'bg-white text-black'
                  }`}>
                    <span className="block text-[7px] font-mono font-bold text-neutral-400">AVG SCORE</span>
                    <span className="font-display font-black text-base leading-none">
                      {dossierReport.avgScore}
                    </span>
                  </div>

                  <div className={`p-1.5 rounded-xl border-2 border-black text-center ${
                    dossierReport.hitRate < 50 ? 'bg-neutral-900 text-white' : 'bg-white text-black'
                  }`}>
                    <span className="block text-[7px] font-mono font-bold text-neutral-400">MAX SLUMP</span>
                    <span className="font-display font-black text-base leading-none text-[#FF8A00]">
                      {dossierReport.longestSlump || 0}d
                    </span>
                  </div>
                </div>
              </div>

              {/* 2. Real Talk Homie Letter */}
              {dossierReport.homieLetter && dossierReport.homieLetter.length > 0 && (
                <div className="p-3.5 rounded-2xl border-2 border-black bg-[#FFFBEA] shadow-[2.5px_2.5px_0px_#000000] space-y-2">
                  <div className="flex items-center gap-1.5 pb-1.5 border-b border-black/10">
                    <span className="text-base">💬</span>
                    <h4 className="font-display font-black text-xs uppercase text-black">
                      REAL TALK FROM YOUR BRO
                    </h4>
                  </div>
                  <div className="space-y-2">
                    {dossierReport.homieLetter.map((p, idx) => (
                      <p key={idx} className="text-[11px] font-mono text-neutral-900 leading-relaxed font-semibold">
                        {p}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. Weekly Phase Velocity Trajectory */}
              {dossierReport.weeklyAnalytics && dossierReport.weeklyAnalytics.length > 0 && (
                <div className="p-3.5 rounded-2xl border-2 border-black bg-white shadow-[2px_2px_0px_#000000] space-y-2">
                  <div className="flex items-center justify-between pb-1 border-b border-black/10">
                    <span className="font-display font-black text-xs uppercase text-black flex items-center gap-1">
                      <Activity className="w-3.5 h-3.5" />
                      <span>WEEKLY PHASE VELOCITY</span>
                    </span>
                    <span className="text-[9px] font-mono font-bold text-neutral-500">
                      Score / 5.0
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-1.5 pt-1">
                    {dossierReport.weeklyAnalytics.map((week, idx) => (
                      <div key={idx} className="p-2 rounded-lg border border-black/20 bg-neutral-50 text-center">
                        <span className="text-[9px] font-mono font-black uppercase text-neutral-600 block">
                          Wk {idx + 1}
                        </span>
                        <span className="font-display font-black text-base text-black block my-0.5">
                          {week.avgScore || '—'}
                        </span>
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
              )}

              {/* 4. Friction Root-Cause Leak Breakdown */}
              {dossierReport.frictionBreakdown && (
                <div className="p-3.5 rounded-2xl border-2 border-black bg-white shadow-[2px_2px_0px_#000000] space-y-2">
                  <div className="flex items-center justify-between pb-1 border-b border-black/10">
                    <span className="font-display font-black text-xs uppercase text-black flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-[#FF4D4D]" />
                      <span>FRICTION LEAK FACTOR</span>
                    </span>
                    <span className="text-[9px] font-mono font-bold text-neutral-500">
                      DIARY KEYWORDS
                    </span>
                  </div>

                  <div className="space-y-2 pt-0.5">
                    <div>
                      <div className="flex justify-between text-[10px] font-mono font-bold text-black mb-0.5">
                        <span className="flex items-center gap-1">
                          <Smartphone className="w-3 h-3 text-purple-600" />
                          <span>Screen Doomscrolling & 3 AM</span>
                        </span>
                        <span>{dossierReport.frictionBreakdown.screenDoomscrollPct || 0}%</span>
                      </div>
                      <div className="h-2 w-full bg-neutral-100 rounded-full border border-black/20 overflow-hidden">
                        <div className="h-full bg-purple-500" style={{ width: `${dossierReport.frictionBreakdown.screenDoomscrollPct || 0}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[10px] font-mono font-bold text-black mb-0.5">
                        <span className="flex items-center gap-1">
                          <BookOpen className="w-3 h-3 text-red-600" />
                          <span>Academic Pressure & Accounts</span>
                        </span>
                        <span>{dossierReport.frictionBreakdown.academicStressPct || 0}%</span>
                      </div>
                      <div className="h-2 w-full bg-neutral-100 rounded-full border border-black/20 overflow-hidden">
                        <div className="h-full bg-[#FF4D4D]" style={{ width: `${dossierReport.frictionBreakdown.academicStressPct || 0}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[10px] font-mono font-bold text-black mb-0.5">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3 text-amber-600" />
                          <span>Social Friction & Canteen FOMO</span>
                        </span>
                        <span>{dossierReport.frictionBreakdown.householdSocialPct || 0}%</span>
                      </div>
                      <div className="h-2 w-full bg-neutral-100 rounded-full border border-black/20 overflow-hidden">
                        <div className="h-full bg-[#FF8A00]" style={{ width: `${dossierReport.frictionBreakdown.householdSocialPct || 0}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 5. 31-Day Micro-Verdict Matrix */}
              {dossierReport.dayMatrix && dossierReport.dayMatrix.length > 0 && (
                <div className="p-3.5 rounded-2xl border-2 border-black bg-white shadow-[2px_2px_0px_#000000] space-y-2">
                  <div className="flex items-center justify-between pb-1 border-b border-black/10">
                    <span className="font-display font-black text-xs uppercase text-black flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-black" />
                      <span>31-DAY MICRO-VERDICT MATRIX</span>
                    </span>
                    <span className="text-[9px] font-mono font-bold text-neutral-500">
                      {dossierReport.dayMatrix.length}d Logged
                    </span>
                  </div>

                  <div className="grid grid-cols-7 gap-1 pt-1">
                    {dossierReport.dayMatrix.map((item) => {
                      const isSelected = activeDayNote?.day === item.day;
                      const bg = item.rating === 5 ? 'bg-[#FDC800]' : item.rating === 4 ? 'bg-[#00E599]' : item.rating === 3 ? 'bg-neutral-300' : item.rating === 2 ? 'bg-[#FF8A00]' : 'bg-[#FF4D4D]';
                      return (
                        <button
                          key={item.day}
                          type="button"
                          onClick={() => setActiveDayNote(isSelected ? null : item)}
                          className={`p-1 rounded-lg border-2 border-black flex flex-col items-center justify-center transition-all cursor-pointer ${bg} ${
                            isSelected ? 'ring-2 ring-black scale-105 shadow-[2px_2px_0px_#000000]' : ''
                          }`}
                        >
                          <span className="text-[9px] font-mono font-black text-black leading-none">
                            {item.day}
                          </span>
                          <span className="text-[8px] font-mono font-bold text-black">
                            {item.rating}★
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Active Note Inspector Card */}
                  {activeDayNote && (
                    <div className="p-2.5 rounded-xl border-2 border-black bg-amber-50 shadow-[1.5px_1.5px_0px_#000000] mt-2 flex items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="px-1.5 py-0.2 rounded bg-black text-[#FDC800] font-mono font-black text-[9px]">
                            DAY {activeDayNote.day} ({activeDayNote.date})
                          </span>
                          <span className="font-mono font-black text-[10px] text-black">
                            Rating: {activeDayNote.rating}/5.0
                          </span>
                        </div>
                        <p className="text-[11px] font-mono text-neutral-800 leading-snug">
                          {activeDayNote.notes || "No extra diary notes logged."}
                        </p>
                      </div>
                      <button
                        onClick={() => setActiveDayNote(null)}
                        className="p-1 rounded bg-black text-white cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* 6. Weekday Momentum Distribution */}
              {dossierReport.weekdayAverages && (
                <div className="p-3.5 rounded-2xl border-2 border-black bg-white shadow-[2px_2px_0px_#000000] space-y-2">
                  <div className="flex items-center justify-between pb-1 border-b border-black/10">
                    <span className="font-display font-black text-xs uppercase text-black flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>WEEKDAY MOMENTUM</span>
                    </span>
                    <span className="text-[9px] font-mono font-bold text-neutral-500">
                      Score / 5.0
                    </span>
                  </div>

                  <div className="grid grid-cols-7 gap-1 items-end pt-1 h-24">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => {
                      const score = dossierReport.weekdayAverages?.[day] || 0;
                      const heightPct = Math.max(15, Math.round((score / 5.0) * 100));

                      return (
                        <div key={day} className="flex flex-col items-center gap-0.5 h-full justify-end">
                          <span className="text-[8px] font-mono font-black text-black">
                            {score > 0 ? score : '—'}
                          </span>
                          <div 
                            style={{ height: `${heightPct}%` }}
                            className={`w-full rounded-t-md border border-black ${
                              score >= 4 ? 'bg-[#00E599]' : score >= 3 ? 'bg-[#FDC800]' : score > 0 ? 'bg-[#FF8A00]' : 'bg-neutral-100'
                            }`}
                          />
                          <span className="text-[8px] font-mono font-black uppercase text-neutral-700">
                            {day}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 7. Verdict Breakdown */}
              {dossierReport.ratingCounts && (
                <div className="p-3.5 rounded-2xl border-2 border-black bg-white shadow-[2px_2px_0px_#000000] space-y-2">
                  <div className="flex items-center justify-between pb-1 border-b border-black/10">
                    <span className="font-display font-black text-xs uppercase text-black flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5" />
                      <span>VERDICT BREAKDOWN</span>
                    </span>
                    <span className="text-[9px] font-mono font-bold text-neutral-500">
                      {dossierReport.totalLogged} Days
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    {[
                      { label: 'Peak (5/5)', count: dossierReport.ratingCounts?.[5] || 0, bg: '#FDC800' },
                      { label: 'Good (4/5)', count: dossierReport.ratingCounts?.[4] || 0, bg: '#00E599' },
                      { label: 'Okay (3/5)', count: dossierReport.ratingCounts?.[3] || 0, bg: '#CBD5E1' },
                      { label: 'Down (2/5)', count: dossierReport.ratingCounts?.[2] || 0, bg: '#FF8A00' },
                      { label: 'Rough (1/5)', count: dossierReport.ratingCounts?.[1] || 0, bg: '#FF4D4D' }
                    ].map(item => {
                      const pct = dossierReport.totalLogged > 0 ? Math.round((item.count / dossierReport.totalLogged) * 100) : 0;
                      return (
                        <div key={item.label} className="space-y-0.5">
                          <div className="flex justify-between text-[10px] font-mono font-bold text-black">
                            <span>{item.label}</span>
                            <span>{item.count}d ({pct}%)</span>
                          </div>
                          <div className="h-1.5 w-full bg-neutral-100 rounded-full border border-black/20 overflow-hidden">
                            <div className="h-full" style={{ width: `${pct}%`, backgroundColor: item.bg }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 8. 6 Hidden Behavioral Correlations */}
              {dossierReport.hiddenCorrelations && dossierReport.hiddenCorrelations.length > 0 && (
                <div className="p-3.5 rounded-2xl border-2 border-black bg-white shadow-[2px_2px_0px_#000000] space-y-2">
                  <div className="flex items-center gap-1.5 pb-1 border-b border-black/10">
                    <Compass className="w-3.5 h-3.5 text-black" />
                    <h4 className="font-display font-black text-xs uppercase text-black">
                      HIDDEN BEHAVIORAL DISCOVERIES
                    </h4>
                  </div>
                  <div className="space-y-2 pt-0.5">
                    {dossierReport.hiddenCorrelations.map((c, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl border border-black/20 bg-neutral-50 flex items-start gap-2">
                        <span className="w-5 h-5 rounded-full bg-black text-[#FDC800] font-mono font-black text-[9px] flex items-center justify-center shrink-0">
                          #{idx + 1}
                        </span>
                        <p className="text-[11px] font-mono font-semibold text-neutral-900 leading-snug">
                          {c}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          ) : (
            <div className="p-6 rounded-2xl border-2 border-black bg-white text-center space-y-3 shadow-[2px_2px_0px_#000000]">
              <Lock className="w-8 h-8 text-[#00E599] mx-auto stroke-[2.5]" />
              <h4 className="font-display font-black text-sm uppercase text-black">
                Ready for Evaluation
              </h4>
              <p className="text-[11px] font-mono text-neutral-600">
                Tap the button above to run Gemini AI performance forensics for this month.
              </p>
            </div>
          )}

        </main>
      )}

      {/* ========================================================= */}
      {/* 📊 TAB 4: STATS & MATRIX */}
      {/* ========================================================= */}
      {activeTab === 'stats' && (
        <main className="flex-1 px-3.5 py-3 max-w-lg mx-auto w-full space-y-3">
          <div className="mb-1">
            <h2 className="font-display font-black text-lg uppercase tracking-tight text-black">
              Performance Metrics
            </h2>
            <p className="text-[11px] font-mono font-bold text-neutral-600">
              Real-time score distribution and momentum analytics.
            </p>
          </div>
          <StatsWidget entries={entries} dayCount={dayCount} />
        </main>
      )}

      {/* ========================================================= */}
      {/* 📝 60% SCREEN HEIGHT REFLECTION NOTE DRAWER */}
      {/* ========================================================= */}
      <AnimatePresence>
        {showNoteDrawer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-end justify-center p-0"
            onClick={() => setShowNoteDrawer(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 350 }}
              className="w-full max-w-lg bg-[#FFFDF5] rounded-t-3xl border-t-3 border-x-3 border-black p-4 shadow-[0_-6px_0px_#000000] space-y-3 h-[62vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Drag Handle */}
              <div className="w-12 h-1.5 bg-black/20 rounded-full mx-auto shrink-0" />
              
              <div className="flex items-center justify-between shrink-0">
                <div className="flex items-center gap-1.5">
                  <PenLine className="w-4 h-4 stroke-[2.5]" />
                  <h3 className="font-display font-black text-sm uppercase">
                    Daily Reflection Note
                  </h3>
                </div>
                <button
                  onClick={() => setShowNoteDrawer(false)}
                  className="px-2 py-0.5 rounded-lg bg-neutral-200 text-[11px] font-mono font-bold cursor-pointer"
                >
                  Cancel
                </button>
              </div>

              {/* Generous 60% Space Textarea */}
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="What happened today? (Optional reflection note — no essay required!)"
                className="flex-1 w-full p-3 rounded-xl border-2 border-black bg-white font-mono text-xs text-black resize-none focus:outline-none focus:ring-2 focus:ring-[#FDC800]"
              />

              <div className="flex items-center justify-between text-[10px] font-mono font-bold text-neutral-500 shrink-0">
                <span>{noteText.length} characters</span>
                <span>Auto-saved to device</span>
              </div>

              <button
                onClick={handleSaveNote}
                className="w-full py-3 bg-[#00E599] hover:bg-emerald-400 text-black font-display font-black text-sm uppercase rounded-xl border-2 border-black shadow-[3px_3px_0px_#000000] cursor-pointer shrink-0"
              >
                Save Reflection Note
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 👤 CLOUD USER STATUS MODAL */}
      <AnimatePresence>
        {showUserModal && user && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4"
            onClick={() => setShowUserModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 15 }}
              className="w-full max-w-sm bg-white rounded-2xl border-3 border-black p-4 shadow-[4px_4px_0px_#000000] space-y-3"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-2.5 border-b-2 border-black/10 pb-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#00E599] border-2 border-black flex items-center justify-center">
                  <Cloud className="w-4 h-4 text-black stroke-[2.5]" />
                </div>
                <div>
                  <h4 className="font-display font-black text-sm leading-none">
                    {user.displayName || 'Google Account'}
                  </h4>
                  <span className="text-[10px] font-mono text-neutral-500 block mt-0.5">
                    {user.email}
                  </span>
                </div>
              </div>

              <div>
                {isWhitelisted ? (
                  <div className="p-2 rounded-xl bg-[#00E599]/20 border border-[#00E599] text-[11px] font-mono font-bold text-emerald-950 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Whitelisted Account • Cloud Sync Active</span>
                  </div>
                ) : (
                  <div className="p-2 rounded-xl bg-neutral-100 border border-neutral-300 text-[11px] font-mono font-bold text-neutral-700">
                    Local Storage Mode • Stored on this device.
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    logoutUser();
                    setShowUserModal(false);
                  }}
                  className="w-full py-2 bg-[#FF4D4D] text-black font-mono font-black text-xs uppercase rounded-xl border-2 border-black shadow-[2px_2px_0px_#000000] cursor-pointer"
                >
                  Sign Out
                </button>
                <button
                  onClick={() => setShowUserModal(false)}
                  className="w-full py-2 bg-neutral-200 text-black font-mono font-bold text-xs uppercase rounded-xl border-2 border-black cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 📱 SOLID OPAQUE BOTTOM NATIVE APP NAVIGATION BAR (0px Bleed Barrier) */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#FFFFFF] border-t-3 border-black py-2 px-3 flex items-center justify-around shadow-[0_-4px_0px_#000000]">
        
        {/* Tab 1: Log Today */}
        <button
          onClick={() => setActiveTab('log')}
          className={`flex flex-col items-center justify-center px-3 py-1 rounded-xl transition-all cursor-pointer ${
            activeTab === 'log' 
              ? 'bg-[#FDC800] text-black border-2 border-black shadow-[1.5px_1.5px_0px_#000000]' 
              : 'text-neutral-500 hover:text-black'
          }`}
        >
          <Zap className="w-4 h-4 stroke-[2.5]" />
          <span className="font-mono font-black text-[9px] uppercase mt-0.5">Log</span>
        </button>

        {/* Tab 2: Calendar & Timeline History */}
        <button
          onClick={() => setActiveTab('history')}
          className={`flex flex-col items-center justify-center px-3 py-1 rounded-xl transition-all cursor-pointer ${
            activeTab === 'history' 
              ? 'bg-[#FDC800] text-black border-2 border-black shadow-[1.5px_1.5px_0px_#000000]' 
              : 'text-neutral-500 hover:text-black'
          }`}
        >
          <Calendar className="w-4 h-4 stroke-[2.5]" />
          <span className="font-mono font-black text-[9px] uppercase mt-0.5">Calendar</span>
        </button>

        {/* Tab 3: Monthly Dossier */}
        <button
          onClick={() => setActiveTab('dossier')}
          className={`flex flex-col items-center justify-center px-3 py-1 rounded-xl transition-all cursor-pointer ${
            activeTab === 'dossier' 
              ? 'bg-[#00E599] text-black border-2 border-black shadow-[1.5px_1.5px_0px_#000000]' 
              : 'text-neutral-500 hover:text-black'
          }`}
        >
          <Sparkles className="w-4 h-4 stroke-[2.5]" />
          <span className="font-mono font-black text-[9px] uppercase mt-0.5">Dossier</span>
        </button>

        {/* Tab 4: Stats */}
        <button
          onClick={() => setActiveTab('stats')}
          className={`flex flex-col items-center justify-center px-3 py-1 rounded-xl transition-all cursor-pointer ${
            activeTab === 'stats' 
              ? 'bg-[#FDC800] text-black border-2 border-black shadow-[1.5px_1.5px_0px_#000000]' 
              : 'text-neutral-500 hover:text-black'
          }`}
        >
          <BarChart2 className="w-4 h-4 stroke-[2.5]" />
          <span className="font-mono font-black text-[9px] uppercase mt-0.5">Stats</span>
        </button>

      </nav>

    </div>
  );
}
