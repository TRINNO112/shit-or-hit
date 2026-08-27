import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ShieldVoltIcon from './ShieldVoltIcon';
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
  X,
  RotateCcw,
  Undo2,
  Redo2,
  Settings
} from 'lucide-react';
import { 
  ratingMeta, 
  exportDatabaseBackup, 
  fetchMonthlyReport, 
  getSavedMonthlyReport, 
  enhanceReflectionWithAI,
  isSphereModeEnabled,
  getSphereConfig,
  calculateCompositeScore
} from '../services/api';
import { loginWithGoogle, logoutUser, isEmailWhitelisted, subscribeAuthState } from '../services/firebase';
import confetti from 'canvas-confetti';
import JourneyTimeline from './JourneyTimeline';
import StatsWidget from './StatsWidget';
import SphereIcon from './SphereIcon';

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
  onEditDay,
  onOpenWallpaper,
  onOpenTelemetry,
  onOpenSettings,
  sphereSettingsVer = 0
}) {
  const [activeTab, setActiveTabState] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('daily_verdict_mobile_active_tab') || 'log';
    }
    return 'log';
  });
  const [historySubView, setHistorySubViewState] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('daily_verdict_mobile_history_subview') || 'calendar';
    }
    return 'calendar';
  });

  const setActiveTab = (tab) => {
    setActiveTabState(tab);
    if (typeof window !== 'undefined') {
      localStorage.setItem('daily_verdict_mobile_active_tab', tab);
    }
  };

  const setHistorySubView = (view) => {
    setHistorySubViewState(view);
    if (typeof window !== 'undefined') {
      localStorage.setItem('daily_verdict_mobile_history_subview', view);
    }
  };
  
  // Multi-Sphere State for Mobile
  const [sphereModeActive, setSphereModeActive] = useState(false);
  const [spheresConfig, setSpheresConfig] = useState([]);
  const [activeSphereId, setActiveSphereId] = useState('');
  const [spheresData, setSpheresData] = useState({});

  const [user, setUser] = useState(null);
  const [showNoteDrawer, setShowNoteDrawer] = useState(false);
  const [noteText, setNoteText] = useState(entries[todayStr]?.notes || '');
  const [savedFlash, setSavedFlash] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);

  // AI Polish State & History Stack
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [historyStack, setHistoryStack] = useState([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const [originalDraft, setOriginalDraft] = useState('');

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
    const isEnabled = isSphereModeEnabled();
    setSphereModeActive(isEnabled);
    const cfg = getSphereConfig().filter(s => s.enabled);
    setSpheresConfig(cfg);
    if (cfg.length > 0 && !activeSphereId) {
      setActiveSphereId(cfg[0].id);
    }

    const currentEntry = entries[todayStr] || {};
    const initialSpheres = {};
    cfg.forEach(s => {
      initialSpheres[s.id] = {
        id: s.id,
        name: s.name,
        icon: s.icon,
        color: s.color,
        rating: currentEntry?.spheres?.[s.id]?.rating || null,
        notes: currentEntry?.spheres?.[s.id]?.notes || ''
      };
    });
    setSpheresData(initialSpheres);
  }, [entries, todayStr, sphereSettingsVer]);

  useEffect(() => {
    const unsub = subscribeAuthState((currentUser) => {
      setUser(currentUser);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (entries[todayStr]?.notes !== undefined) {
      setNoteText(entries[todayStr].notes);
      setOriginalDraft(entries[todayStr].notes);
      setHistoryStack([entries[todayStr].notes]);
      setHistoryIdx(0);
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

  // Native Haptic Feedback Helper
  const triggerHaptic = (type = 'light') => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        if (type === 'light') navigator.vibrate(10);
        else if (type === 'medium') navigator.vibrate(25);
        else if (type === 'success') navigator.vibrate([15, 30, 20]);
        else if (type === 'heavy') navigator.vibrate([30, 50, 30]);
      } catch (e) {}
    }
  };

  // Web Audio Mechanical Click / Chime Synthesizer
  const playSound = (type = 'click') => {
    if (typeof window === 'undefined') return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'chime') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.35);
      } else {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(320, ctx.currentTime);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.05);
      }
    } catch (e) {}
  };

  const selectedRating = entries[todayStr]?.rating || null;
  const isWhitelisted = user && isEmailWhitelisted(user.email);

  const now = new Date();
  const dayName = now.toLocaleDateString('en-US', { weekday: 'long' });
  const fullDate = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const QUICK_TAGS = [
    '🔥 Deep Work',
    '📱 Screen Trap',
    '⚡ High Energy',
    '☕ Canteen Vibe',
    '📚 Study Grind',
    '💤 Sleep Deficit',
    '🎯 Locked In',
    '😤 Burnout'
  ];

  const handleAddTag = (tag) => {
    triggerHaptic('light');
    playSound('click');
    setNoteText(prev => {
      const cleanPrev = prev ? prev.trim() : '';
      if (cleanPrev.includes(tag)) return prev;
      return cleanPrev ? `${cleanPrev} • [${tag}]` : `[${tag}]`;
    });
  };

  const handleAIEnhance = async () => {
    const hasSphereNotes = Object.values(spheresData).some(s => s.notes && s.notes.trim());
    if ((!noteText || noteText.trim() === '') && !hasSphereNotes) return;
    triggerHaptic('medium');
    playSound('click');
    const currentVal = noteText;
    setIsEnhancing(true);
    try {
      const comp = calculateCompositeScore(spheresData);
      const enhanced = await enhanceReflectionWithAI(
        currentVal, 
        comp?.rating || selectedRating || 3, 
        todayStr,
        sphereModeActive ? spheresData : null
      );
      if (enhanced && enhanced !== currentVal) {
        triggerHaptic('success');
        playSound('chime');
        confetti({ particleCount: 35, spread: 55, origin: { y: 0.6 }, colors: ['#FDC800', '#00E599', '#000000'] });
        const newStack = historyStack.slice(0, historyIdx + 1);
        newStack.push(enhanced);
        setHistoryStack(newStack);
        setHistoryIdx(newStack.length - 1);
        setNoteText(enhanced);
      }
    } catch (err) {
      console.error('AI Enhance error:', err);
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleUndo = () => {
    if (historyIdx > 0) {
      triggerHaptic('light');
      playSound('click');
      const target = historyIdx - 1;
      setHistoryIdx(target);
      setNoteText(historyStack[target]);
    }
  };

  const handleRedo = () => {
    if (historyIdx < historyStack.length - 1) {
      triggerHaptic('light');
      playSound('click');
      const target = historyIdx + 1;
      setHistoryIdx(target);
      setNoteText(historyStack[target]);
    }
  };

  const handleRevertOriginal = () => {
    if (originalDraft !== undefined) {
      triggerHaptic('medium');
      playSound('click');
      setNoteText(originalDraft);
      const newStack = [...historyStack, originalDraft];
      setHistoryStack(newStack);
      setHistoryIdx(newStack.length - 1);
    }
  };

  const handleRate = async (val) => {
    triggerHaptic(val >= 4 ? 'success' : 'medium');
    playSound(val === 5 ? 'chime' : 'click');

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
      notes: noteText,
      spheres: spheresData
    });
    setTimeout(() => setSavedFlash(false), 2000);
  };

  const handleRateSphereMobile = async (sphereId, val) => {
    triggerHaptic(val >= 4 ? 'success' : 'medium');
    playSound(val === 5 ? 'chime' : 'click');

    if (val === 5) {
      confetti({ particleCount: 35, spread: 50, origin: { y: 0.7 }, colors: ['#FDC800', '#000000'] });
    }

    const updated = {
      ...spheresData,
      [sphereId]: {
        ...(spheresData[sphereId] || {}),
        id: sphereId,
        rating: val
      }
    };
    setSpheresData(updated);

    const comp = calculateCompositeScore(updated);
    const finalRating = comp ? comp.rating : (selectedRating || val);
    const finalVerdict = comp ? comp.verdict : (ratingMeta[val]?.title || 'Verdict');

    setSavedFlash(true);
    await onSaveToday({
      date: todayStr,
      rating: finalRating,
      verdict: finalVerdict,
      notes: noteText,
      spheres: updated,
      calculatedScore: comp?.score
    });
    setTimeout(() => setSavedFlash(false), 2000);
  };

  const handleSaveSphereNoteMobile = async (sphereId, note) => {
    const updated = {
      ...spheresData,
      [sphereId]: {
        ...(spheresData[sphereId] || {}),
        notes: note
      }
    };
    setSpheresData(updated);
    const comp = calculateCompositeScore(updated);
    await onSaveToday({
      date: todayStr,
      rating: comp?.rating || selectedRating || 3,
      verdict: comp?.verdict || ratingMeta[selectedRating || 3]?.title || 'Verdict',
      notes: noteText,
      spheres: updated,
      calculatedScore: comp?.score
    });
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 2000);
  };

  const handleSaveNote = async () => {
    triggerHaptic('success');
    playSound('click');
    const comp = calculateCompositeScore(spheresData);
    const ratingToUse = comp ? comp.rating : (selectedRating || 3);
    await onSaveToday({
      date: todayStr,
      rating: ratingToUse,
      verdict: comp ? comp.verdict : (ratingMeta[ratingToUse]?.title || 'Verdict'),
      notes: noteText,
      spheres: spheresData,
      calculatedScore: comp?.score
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
  const [calendarFilter, setCalendarFilter] = useState('all'); // 'all' | 'hits' | 'leaks' | 'notes'
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

    let isDimmed = false;
    if (calendarFilter === 'hits' && (!entry?.rating || entry.rating < 4)) isDimmed = true;
    if (calendarFilter === 'leaks' && (!entry?.rating || entry.rating > 2)) isDimmed = true;
    if (calendarFilter === 'notes' && !entry?.notes) isDimmed = true;

    calDays.push({ dayNum: d, dateStr, entry, isBeforeStart, isFuture, isToday: dateStr === todayStr, isDimmed });
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#FFFDF5] text-black font-sans pb-28 select-none relative">
      
      {/* 📱 TOP COMPACT APP BAR (Guaranteed Single-Line Layout) */}
      <header className="sticky top-0 z-40 bg-[#FFFDF5]/95 backdrop-blur-md border-b-2 border-black px-3.5 py-2.5 sm:px-4 sm:py-3 flex items-center justify-between shadow-[0_2px_0px_#000000]">
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white border-2 border-black flex items-center justify-center shadow-[1.5px_1.5px_0px_#000000] shrink-0 p-0.5">
            <ShieldVoltIcon className="w-full h-full" color="#FDC800" />
          </div>
          <div className="min-w-0">
            <h1 className="font-display font-black text-sm sm:text-base uppercase leading-none tracking-tight whitespace-nowrap">
              SHIT OR HIT
            </h1>
            <span className="text-[10px] sm:text-xs font-mono font-bold text-neutral-600 block mt-0.5 truncate max-w-[120px] sm:max-w-[200px]">
              {isWhitelisted ? `☁️ ${user.displayName || 'Cloud Synced'}` : 'Daily Verdict OS'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Day Streak Pill */}
          <div className="flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-xl bg-[#00E599] border-2 border-black font-mono text-[11px] sm:text-xs font-black shadow-[1.5px_1.5px_0px_#000000]">
            <Flame className="w-3.5 h-3.5 fill-black text-black" />
            <span>DAY {dayCount}</span>
          </div>

          {/* Cloud Auth / Profile */}
          {user ? (
            <button
              onClick={() => {
                triggerHaptic('light');
                setShowUserModal(true);
              }}
              className={`p-1.5 sm:p-2 rounded-xl border-2 border-black shadow-[1.5px_1.5px_0px_#000000] cursor-pointer ${
                isWhitelisted ? 'bg-[#00E599]' : 'bg-neutral-200'
              }`}
              title={user.email}
            >
              <Cloud className="w-4 h-4 text-black stroke-[2.5]" />
            </button>
          ) : (
            <button
              onClick={() => {
                triggerHaptic('medium');
                handleGoogleLogin();
              }}
              disabled={authLoading}
              className="px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-white hover:bg-[#FDC800] border-2 border-black font-mono text-xs font-black flex items-center gap-1 shadow-[1.5px_1.5px_0px_#000000] cursor-pointer transition-colors"
            >
              <LogIn className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>SYNC</span>
            </button>
          )}

          {/* Backup Button */}
          <button
            onClick={() => {
              triggerHaptic('light');
              exportDatabaseBackup(startDate, entries);
            }}
            className="p-1.5 sm:p-2 rounded-xl bg-white hover:bg-neutral-100 border-2 border-black shadow-[1.5px_1.5px_0px_#000000] cursor-pointer"
            title="Download JSON Backup"
          >
            <Download className="w-4 h-4 stroke-[2.5]" />
          </button>

          {/* Settings Button */}
          {onOpenSettings && (
            <button
              onClick={() => {
                triggerHaptic('light');
                onOpenSettings();
              }}
              className="p-1.5 sm:p-2 rounded-xl bg-white hover:bg-[#FDC800] border-2 border-black shadow-[1.5px_1.5px_0px_#000000] cursor-pointer"
              title="App Settings & Reminders"
            >
              <Settings className="w-4 h-4 text-black" />
            </button>
          )}
        </div>
      </header>

      {/* ========================================================= */}
      {/* ⚡ TAB 1: RAPID 1-TAP MOOD LOGGER / MULTI-SPHERE MATRIX */}
      {/* ========================================================= */}
      {activeTab === 'log' && (
        <main className="flex-1 px-4 py-3.5 space-y-3.5 max-w-lg mx-auto w-full">
          
          {/* Hero Date Banner */}
          <div className="p-4 rounded-2xl border-2 border-black bg-white shadow-[3px_3px_0px_#000000] flex items-center justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-black text-white text-[10px] font-mono font-black mb-1.5">
                <span>TODAY</span>
                <span>•</span>
                <span>DAY {dayCount}</span>
                {sphereModeActive && <span>• MATRIX</span>}
              </div>
              <h2 className="font-display font-black text-2xl uppercase tracking-tight leading-none text-black">
                {dayName}
              </h2>
              <p className="text-xs font-mono font-bold text-neutral-700 mt-1.5">
                {fullDate}
              </p>
            </div>

            {selectedRating && (
              <div 
                className="w-13 h-13 rounded-2xl border-2 border-black flex items-center justify-center shadow-[2.5px_2.5px_0px_#000000]"
                style={{ backgroundColor: ratingMeta[selectedRating]?.bg }}
              >
                {React.createElement(IconMap[ratingMeta[selectedRating]?.icon] || Sparkles, {
                  className: "w-7 h-7 text-black stroke-[2.5]"
                })}
              </div>
            )}
          </div>

          {/* If Multi-Sphere Mode is Active: Segmented Tab Bar + Active Sphere Rating Cards */}
          {sphereModeActive ? (
            <div className="space-y-3">
              
              {/* Horizontal Scrollable Segmented Sphere Switcher */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                {spheresConfig.map((sphere) => {
                  const sRating = spheresData[sphere.id]?.rating;
                  const isCurrent = (activeSphereId || spheresConfig[0]?.id) === sphere.id;

                  return (
                    <button
                      key={sphere.id}
                      type="button"
                      onClick={() => {
                        triggerHaptic('light');
                        setActiveSphereId(sphere.id);
                      }}
                      className={`px-3 py-2 rounded-xl border-2 border-black font-display font-black text-xs uppercase flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-all ${
                        isCurrent
                          ? 'bg-[#FDC800] text-black shadow-[2.5px_2.5px_0px_#000000] scale-[1.02]'
                          : 'bg-white text-neutral-700 hover:bg-neutral-100'
                      }`}
                    >
                      <SphereIcon icon={sphere.icon} className="w-3.5 h-3.5 text-black stroke-[2.5]" />
                      <span>{sphere.name}</span>
                      {sRating ? (
                        <span 
                          className="px-1.5 py-0.2 rounded text-[10px] font-mono border border-black"
                          style={{ backgroundColor: ratingMeta[sRating]?.bg }}
                        >
                          {sRating}★
                        </span>
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-neutral-300" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Active Sphere View Card */}
              {(() => {
                const currentSphere = spheresConfig.find(s => s.id === (activeSphereId || spheresConfig[0]?.id)) || spheresConfig[0];
                if (!currentSphere) return null;
                const currentSphereData = spheresData[currentSphere.id] || {};
                const sphereRating = currentSphereData.rating;

                return (
                  <div className="bg-[#FFFDF8] rounded-2xl border-2 border-black p-3.5 shadow-[3px_3px_0px_#000000] space-y-3">
                    <div className="flex items-center justify-between border-b-2 border-black/10 pb-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div 
                          className="w-12 h-12 rounded-2xl border-2.5 border-black flex items-center justify-center shadow-[2.5px_2.5px_0px_#000000] shrink-0"
                          style={{ backgroundColor: currentSphere.color || '#FDC800' }}
                        >
                          <SphereIcon icon={currentSphere.icon} className="w-6 h-6 text-black stroke-[2.5]" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-display font-black text-base uppercase text-black leading-tight truncate">
                            {currentSphere.name}
                          </h3>
                          <p className="text-xs font-mono text-neutral-600 truncate">
                            {currentSphere.desc}
                          </p>
                        </div>
                      </div>

                      {sphereRating ? (
                        <span 
                          className="px-2.5 py-1 rounded-xl border-2 border-black font-mono text-xs font-black shadow-[1.5px_1.5px_0px_#000000] shrink-0"
                          style={{ backgroundColor: ratingMeta[sphereRating]?.bg }}
                        >
                          {sphereRating}★ {ratingMeta[sphereRating]?.title}
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-neutral-400 font-black shrink-0">UNRATED</span>
                      )}
                    </div>

                    {/* 5 Rating Buttons for this Sphere */}
                    <div className="space-y-2">
                      {[5, 4, 3, 2, 1].map((val) => {
                        const m = ratingMeta[val];
                        const SvgIcon = IconMap[m.icon];
                        const isSelected = sphereRating === val;

                        return (
                          <motion.button
                            key={val}
                            type="button"
                            whileTap={{ scale: 0.97 }}
                            onClick={() => handleRateSphereMobile(currentSphere.id, val)}
                            className={`w-full p-3 rounded-2xl border-2 border-black flex items-center justify-between shadow-[2.5px_2.5px_0px_#000000] cursor-pointer transition-all ${
                              isSelected ? 'ring-2 ring-black scale-[1.01]' : 'hover:bg-neutral-50'
                            }`}
                            style={{ 
                              backgroundColor: isSelected ? m.bg : '#FFFFFF'
                            }}
                          >
                            <div className="flex items-center gap-3">
                              <div 
                                className="w-9 h-9 rounded-xl border-2 border-black flex items-center justify-center shadow-[1px_1px_0px_#000000] shrink-0"
                                style={{ backgroundColor: m.bg }}
                              >
                                <SvgIcon className="w-4.5 h-4.5 text-black stroke-[2.5]" />
                              </div>

                              <div className="text-left">
                                <span className="font-display font-black text-xs uppercase text-black leading-none">
                                  {m.title} ({val}/5★)
                                </span>
                                <span className="text-[10px] font-mono text-neutral-600 block leading-tight mt-0.5">
                                  {m.desc}
                                </span>
                              </div>
                            </div>

                            {isSelected && (
                              <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center shrink-0 shadow-[1px_1px_0px_#000000]">
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                              </div>
                            )}
                          </motion.button>
                        );
                      })}
                    </div>

                    {/* Sphere Note Multi-Line Field */}
                    <div className="pt-2.5 border-t-2 border-black/10 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-mono font-bold text-neutral-700">
                        <span className="uppercase">Reflection Notes: {currentSphere.name}</span>
                        {currentSphereData.notes && <span className="text-emerald-700 font-bold">✓ Saved</span>}
                      </div>
                      <textarea
                        rows={3}
                        placeholder={`What happened at ${currentSphere.name}? (Wins, struggles, highlights)`}
                        value={currentSphereData.notes || ''}
                        onChange={(e) => handleSaveSphereNoteMobile(currentSphere.id, e.target.value)}
                        className="w-full px-3 py-2 text-xs font-mono bg-white border-2 border-black rounded-xl placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-black resize-none leading-relaxed"
                      />
                    </div>
                  </div>
                );
              })()}

            </div>
          ) : (
            /* Single-Verdict Standard 5 Tactile Cards */
            <div className="space-y-2.5">
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
                    className={`w-full p-3.5 rounded-2xl border-2 border-black flex items-center justify-between shadow-[3px_3px_0px_#000000] cursor-pointer transition-all ${
                      isSelected ? 'ring-3 ring-black scale-[1.01]' : 'hover:bg-neutral-50'
                    }`}
                    style={{ 
                      backgroundColor: isSelected ? m.bg : '#FFFFFF'
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-xl border-2 border-black flex items-center justify-center shadow-[1.5px_1.5px_0px_#000000] shrink-0"
                        style={{ backgroundColor: m.bg }}
                      >
                        <SvgIcon className="w-5 h-5 text-black stroke-[2.5]" />
                      </div>

                      <div className="text-left">
                        <div className="flex items-center gap-2">
                          <span className="font-display font-black text-base uppercase text-black leading-tight">
                            {m.title}
                          </span>
                          <span className="text-xs font-mono font-black text-neutral-900">
                            ({val}/5★)
                          </span>
                        </div>
                        <span className="text-xs font-mono font-bold text-neutral-700 block mt-0.5">
                          {m.desc}
                        </span>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center shrink-0 shadow-[1.5px_1.5px_0px_#000000]">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          )}

          {/* Active Verdict Status & Reflection Button */}
          <div className="pt-1.5 space-y-2.5">
            {(() => {
              const comp = calculateCompositeScore(spheresData);
              const activeR = comp ? comp.rating : selectedRating;
              const activeScore = comp ? comp.score : null;

              if (activeR) {
                return (
                  <div 
                    className="p-3 rounded-xl border-2 border-black text-xs font-mono font-bold text-black flex items-center justify-between shadow-[2px_2px_0px_#000000]"
                    style={{ backgroundColor: ratingMeta[activeR]?.bg }}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-black stroke-[2.5]" />
                      <span className="truncate">
                        <strong>{ratingMeta[activeR]?.title.toUpperCase()}</strong>
                        {activeScore && ` (${activeScore}/5.0)`}: {ratingMeta[activeR]?.desc}
                      </span>
                    </div>
                    {savedFlash && (
                      <span className="px-2 py-0.5 rounded bg-black text-white text-[10px] font-black uppercase shrink-0">
                        SAVED ⚡
                      </span>
                    )}
                  </div>
                );
              }
              return (
                <div className="p-3 rounded-xl border-2 border-black bg-neutral-100 text-neutral-700 text-xs font-mono font-bold text-center">
                  Tap any card above to record today.
                </div>
              );
            })()}

            {/* Action Row: Reflection Drawer Trigger & Wallpaper Export */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  setShowNoteDrawer(true);
                }}
                className="py-3 px-2 rounded-xl border-2 border-black bg-white hover:bg-[#FDC800] text-black font-mono font-black text-xs flex items-center justify-center gap-1.5 shadow-[2.5px_2.5px_0px_#000000] cursor-pointer"
              >
                <PenLine className="w-4 h-4" />
                <span className="truncate">{entries[todayStr]?.notes ? '✏️ MASTER DIARY' : '+ MASTER DIARY'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  triggerHaptic('medium');
                  if (onOpenWallpaper) onOpenWallpaper(entries[todayStr], todayStr);
                }}
                className="py-3 px-2 rounded-xl border-2 border-black bg-[#FDC800] hover:bg-amber-400 text-black font-mono font-black text-xs flex items-center justify-center gap-1.5 shadow-[2.5px_2.5px_0px_#000000] cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-black" />
                <span>WALLPAPER</span>
              </button>
            </div>
          </div>

        </main>
      )}

      {/* ========================================================= */}
      {/* 📅 TAB 2: HISTORY (CALENDAR GRID + TIMELINE LIST) */}
      {/* ========================================================= */}
      {activeTab === 'history' && (
        <main className="flex-1 px-4 py-3.5 space-y-3.5 max-w-lg mx-auto w-full">
          
          {/* Sub-View Switcher: Calendar Grid vs Timeline */}
          <div className="flex items-center justify-between bg-white border-2 border-black p-1.5 rounded-xl shadow-[2.5px_2.5px_0px_#000000]">
            <button
              onClick={() => setHistorySubView('calendar')}
              className={`flex-1 py-2 rounded-lg font-mono text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
                historySubView === 'calendar' ? 'bg-[#FDC800] text-black shadow-[1.5px_1.5px_0px_#000000]' : 'text-neutral-600 hover:text-black'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>CALENDAR GRID</span>
            </button>
            <button
              onClick={() => setHistorySubView('timeline')}
              className={`flex-1 py-2 rounded-lg font-mono text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
                historySubView === 'timeline' ? 'bg-[#FDC800] text-black shadow-[1.5px_1.5px_0px_#000000]' : 'text-neutral-600 hover:text-black'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>TIMELINE LIST</span>
            </button>
          </div>

          {/* Sub-View 1: Native Calendar Grid */}
          {historySubView === 'calendar' && (
            <div className="bg-white border-2 border-black rounded-2xl p-4 shadow-[3px_3px_0px_#000000] space-y-3.5">
              {/* Month Switcher */}
              <div className="flex items-center justify-between border-b-2 border-black/10 pb-3">
                <button
                  onClick={() => {
                    triggerHaptic('light');
                    setCalendarDate(new Date(calYear, calMonth - 2, 1));
                  }}
                  className="p-2 rounded-xl border-2 border-black bg-white shadow-[1.5px_1.5px_0px_#000000] cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4 stroke-[3]" />
                </button>
                <h3 className="font-display font-black text-lg uppercase text-black">
                  {calMonthName}
                </h3>
                <button
                  onClick={() => {
                    triggerHaptic('light');
                    setCalendarDate(new Date(calYear, calMonth, 1));
                  }}
                  className="p-2 rounded-xl border-2 border-black bg-white shadow-[1.5px_1.5px_0px_#000000] cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4 stroke-[3]" />
                </button>
              </div>

              {/* Quick Mood Filter Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                {[
                  { id: 'all', label: 'All Days' },
                  { id: 'hits', label: '🔥 Hits (4-5★)' },
                  { id: 'leaks', label: '⚠️ Misses (1-2★)' },
                  { id: 'notes', label: '✏️ With Notes' }
                ].map(f => (
                  <button
                    key={f.id}
                    onClick={() => {
                      triggerHaptic('light');
                      setCalendarFilter(f.id);
                    }}
                    className={`px-2.5 py-1 rounded-lg border border-black font-mono text-[10px] font-black shrink-0 transition-all cursor-pointer ${
                      calendarFilter === f.id ? 'bg-[#FDC800] text-black shadow-[1px_1px_0px_#000000]' : 'bg-neutral-100 text-neutral-600'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Day Headers (Mon - Sun) */}
              <div className="grid grid-cols-7 gap-1 text-center font-mono font-black text-xs text-neutral-600">
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                  <span key={i} className="py-0.5">{d}</span>
                ))}
              </div>

              {/* Day Grid */}
              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: leadingBlanks }).map((_, i) => (
                  <div key={`blank-${i}`} className="aspect-square opacity-0" />
                ))}

                {calDays.map(({ dayNum, dateStr, entry, isBeforeStart, isFuture, isToday, isDimmed }) => {
                  const rating = entry?.rating || null;
                  const m = rating ? ratingMeta[rating] : null;

                  return (
                    <button
                      key={dateStr}
                      disabled={isFuture || isBeforeStart}
                      onClick={() => {
                        triggerHaptic('light');
                        onEditDay({ dateStr, dayIndex: dayNum, entry });
                      }}
                      className={`aspect-square rounded-xl border-2 border-black flex flex-col items-center justify-center p-1 relative transition-all cursor-pointer shadow-[2px_2px_0px_#000000] disabled:opacity-20 disabled:shadow-none ${
                        isToday ? 'ring-2.5 ring-black font-black' : ''
                      } ${isDimmed ? 'opacity-25 grayscale' : ''}`}
                      style={{
                        backgroundColor: m ? m.bg : '#F8FAFC'
                      }}
                    >
                      <span className="text-xs font-mono font-black leading-none text-black">
                        {dayNum}
                      </span>
                      {entry?.notes && (
                        <div className="w-1.5 h-1.5 rounded-full bg-black mt-1" />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="text-center pt-2 border-t border-black/10">
                <span className="text-[11px] font-mono font-bold text-neutral-600">
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
        <main className="flex-1 px-4 py-3.5 space-y-4 max-w-lg mx-auto w-full">
          
          {/* Dossier Header Card */}
          <div className="p-4 rounded-2xl border-2 border-black bg-[#FFFDF5] shadow-[3px_3px_0px_#000000] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#FDC800] border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_#000000]">
                  <Sparkles className="w-5 h-5 text-black stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="font-display font-black text-base uppercase text-black leading-none">
                    Monthly Dossier
                  </h3>
                  <span className="text-[11px] font-mono font-bold text-neutral-600">
                    Gemini AI Behavioral Intelligence
                  </span>
                </div>
              </div>

              {/* Month Switcher */}
              <div className="flex items-center bg-white border-2 border-black rounded-xl px-1.5 py-0.5 shadow-[1.5px_1.5px_0px_#000000]">
                <button
                  onClick={() => {
                    const prevMo = dossierMonth === 1 ? 12 : dossierMonth - 1;
                    const prevYr = dossierMonth === 1 ? dossierYear - 1 : dossierYear;
                    setDossierMonth(prevMo);
                    setDossierYear(prevYr);
                  }}
                  className="p-1 text-black cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5 stroke-[3]" />
                </button>
                <span className="px-2 font-mono font-black text-xs text-black uppercase">
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
                  <ChevronRight className="w-3.5 h-3.5 stroke-[3]" />
                </button>
              </div>
            </div>

            {/* Target Dataset & Re-evaluate Buttons */}
            <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-black/10">
              <button
                onClick={() => {
                  const nextArch = dossierArchetype ? null : 'strugglingStudent';
                  setDossierArchetype(nextArch);
                }}
                className={`px-3 py-1.5 rounded-xl border-2 border-black font-mono text-xs font-black cursor-pointer ${
                  dossierArchetype ? 'bg-[#FF8A00] text-black shadow-[2px_2px_0px_#000000]' : 'bg-white text-neutral-800'
                }`}
              >
                {dossierArchetype ? "🎓 Aryan's 30d Test" : "↩️ My Real DB"}
              </button>

              <button
                onClick={() => loadDossier(dossierArchetype, dossierYear, dossierMonth, true)}
                disabled={dossierLoading}
                className="px-3.5 py-1.5 bg-[#00E599] hover:bg-emerald-400 text-black font-mono font-black text-xs uppercase rounded-xl border-2 border-black shadow-[2px_2px_0px_#000000] flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Wand2 className={`w-3.5 h-3.5 stroke-[2.5] ${dossierLoading ? 'animate-spin' : ''}`} />
                <span>{dossierLoading ? 'Evaluating...' : dossierReport ? '🔄 Re-Evaluate' : '⚡ Run Evaluation'}</span>
              </button>
            </div>
          </div>

          {/* Dossier Content Body */}
          {dossierLoading ? (
            <div className="p-8 rounded-2xl border-2 border-black bg-white text-center space-y-2.5 shadow-[3px_3px_0px_#000000]">
              <Sparkles className="w-9 h-9 text-[#FDC800] animate-bounce mx-auto" />
              <h4 className="font-display font-black text-base uppercase text-black">
                Synthesizing Monthly Dossier...
              </h4>
              <p className="text-xs font-mono text-neutral-600">
                Gemini AI is analyzing behavioral patterns, calculating forensics, and drafting real-talk advice.
              </p>
            </div>
          ) : dossierError ? (
            <div className="p-5 rounded-2xl border-2 border-black bg-red-100 text-center space-y-2.5">
              <AlertCircle className="w-7 h-7 text-red-600 mx-auto" />
              <p className="text-xs font-mono font-bold text-red-900">{dossierError}</p>
              <button
                onClick={() => loadDossier(dossierArchetype, dossierYear, dossierMonth, true)}
                className="px-4 py-1.5 bg-black text-[#FDC800] font-mono text-xs font-black rounded-xl"
              >
                Retry
              </button>
            </div>
          ) : dossierReport ? (
            <div className="space-y-4">
              
              {/* 1. Persona Archetype Card */}
              <div className={`p-4 rounded-2xl border-2 border-black space-y-2.5 shadow-[3px_3px_0px_#000000] ${
                dossierReport.hitRate < 50 ? 'bg-[#1C1917] text-white' : 'bg-[#FDC800] text-black'
              }`}>
                <div className="flex items-center justify-between">
                  <span className={`text-[9px] font-mono font-black px-2 py-0.5 rounded-md uppercase ${
                    dossierReport.hitRate < 50 ? 'bg-[#FDC800] text-black' : 'bg-black text-white'
                  }`}>
                    MONTHLY PERSONA
                  </span>
                  <span className="text-[10px] font-mono font-bold opacity-80">
                    💾 Saved in Local DB
                  </span>
                </div>

                <h4 className="font-display font-black text-xl uppercase tracking-tight leading-tight">
                  "{dossierReport.personaTitle}"
                </h4>

                <p className={`text-xs sm:text-sm font-mono font-bold leading-relaxed ${
                  dossierReport.hitRate < 50 ? 'text-neutral-300' : 'text-neutral-900'
                }`}>
                  {dossierReport.executiveSummary}
                </p>

                <div className="grid grid-cols-3 gap-2 pt-1">
                  <div className={`p-2 rounded-xl border-2 border-black text-center ${
                    dossierReport.hitRate < 50 ? 'bg-neutral-900 text-white' : 'bg-white text-black'
                  }`}>
                    <span className="block text-[9px] font-mono font-bold text-neutral-400">HIT RATE</span>
                    <span className="font-display font-black text-lg leading-none text-[#FF4D4D]">
                      {dossierReport.hitRate}%
                    </span>
                  </div>

                  <div className={`p-2 rounded-xl border-2 border-black text-center ${
                    dossierReport.hitRate < 50 ? 'bg-neutral-900 text-white' : 'bg-white text-black'
                  }`}>
                    <span className="block text-[9px] font-mono font-bold text-neutral-400">AVG SCORE</span>
                    <span className="font-display font-black text-lg leading-none">
                      {dossierReport.avgScore}
                    </span>
                  </div>

                  <div className={`p-2 rounded-xl border-2 border-black text-center ${
                    dossierReport.hitRate < 50 ? 'bg-neutral-900 text-white' : 'bg-white text-black'
                  }`}>
                    <span className="block text-[9px] font-mono font-bold text-neutral-400">MAX SLUMP</span>
                    <span className="font-display font-black text-lg leading-none text-[#FF8A00]">
                      {dossierReport.longestSlump || 0}d
                    </span>
                  </div>
                </div>
              </div>

              {/* 2. Real Talk Homie Letter */}
              {dossierReport.homieLetter && dossierReport.homieLetter.length > 0 && (
                <div className="p-4 rounded-2xl border-2 border-black bg-[#FFFBEA] shadow-[3px_3px_0px_#000000] space-y-2.5">
                  <div className="flex items-center gap-2 pb-2 border-b border-black/10">
                    <span className="text-lg">💬</span>
                    <h4 className="font-display font-black text-xs uppercase text-black tracking-wide">
                      REAL TALK FROM YOUR BRO
                    </h4>
                  </div>
                  <div className="space-y-2.5">
                    {dossierReport.homieLetter.map((p, idx) => (
                      <p key={idx} className="text-xs sm:text-sm font-mono text-neutral-900 leading-relaxed font-semibold">
                        {p}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. Weekly Phase Velocity Trajectory */}
              {dossierReport.weeklyAnalytics && dossierReport.weeklyAnalytics.length > 0 && (
                <div className="p-4 rounded-2xl border-2 border-black bg-white shadow-[2.5px_2.5px_0px_#000000] space-y-2.5">
                  <div className="flex items-center justify-between pb-1.5 border-b border-black/10">
                    <span className="font-display font-black text-xs uppercase text-black flex items-center gap-1.5">
                      <Activity className="w-4 h-4" />
                      <span>WEEKLY PHASE VELOCITY</span>
                    </span>
                    <span className="text-[10px] font-mono font-bold text-neutral-500">
                      Score / 5.0
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-2 pt-1">
                    {dossierReport.weeklyAnalytics.map((week, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl border border-black/20 bg-neutral-50 text-center">
                        <span className="text-[10px] font-mono font-black uppercase text-neutral-700 block">
                          Wk {idx + 1}
                        </span>
                        <span className="font-display font-black text-lg text-black block my-0.5">
                          {week.avgScore || '—'}
                        </span>
                        <div className="h-2 w-full bg-neutral-200 rounded-full overflow-hidden">
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
                <div className="p-4 rounded-2xl border-2 border-black bg-white shadow-[2.5px_2.5px_0px_#000000] space-y-2.5">
                  <div className="flex items-center justify-between pb-1.5 border-b border-black/10">
                    <span className="font-display font-black text-xs uppercase text-black flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-[#FF4D4D]" />
                      <span>FRICTION LEAK FACTOR</span>
                    </span>
                    <span className="text-[10px] font-mono font-bold text-neutral-500">
                      DIARY KEYWORDS
                    </span>
                  </div>

                  <div className="space-y-2.5 pt-1">
                    <div>
                      <div className="flex justify-between text-xs font-mono font-bold text-black mb-1">
                        <span className="flex items-center gap-1.5">
                          <Smartphone className="w-3.5 h-3.5 text-purple-600" />
                          <span>Screen Doomscrolling & 3 AM</span>
                        </span>
                        <span>{dossierReport.frictionBreakdown.screenDoomscrollPct || 0}%</span>
                      </div>
                      <div className="h-2.5 w-full bg-neutral-100 rounded-full border border-black/20 overflow-hidden">
                        <div className="h-full bg-purple-500" style={{ width: `${dossierReport.frictionBreakdown.screenDoomscrollPct || 0}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-mono font-bold text-black mb-1">
                        <span className="flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-red-600" />
                          <span>Academic Pressure & Accounts</span>
                        </span>
                        <span>{dossierReport.frictionBreakdown.academicStressPct || 0}%</span>
                      </div>
                      <div className="h-2.5 w-full bg-neutral-100 rounded-full border border-black/20 overflow-hidden">
                        <div className="h-full bg-[#FF4D4D]" style={{ width: `${dossierReport.frictionBreakdown.academicStressPct || 0}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-mono font-bold text-black mb-1">
                        <span className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-amber-600" />
                          <span>Social Friction & Canteen FOMO</span>
                        </span>
                        <span>{dossierReport.frictionBreakdown.householdSocialPct || 0}%</span>
                      </div>
                      <div className="h-2.5 w-full bg-neutral-100 rounded-full border border-black/20 overflow-hidden">
                        <div className="h-full bg-[#FF8A00]" style={{ width: `${dossierReport.frictionBreakdown.householdSocialPct || 0}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 5. 31-Day Micro-Verdict Matrix */}
              {dossierReport.dayMatrix && dossierReport.dayMatrix.length > 0 && (
                <div className="p-4 rounded-2xl border-2 border-black bg-white shadow-[2.5px_2.5px_0px_#000000] space-y-2.5">
                  <div className="flex items-center justify-between pb-1.5 border-b border-black/10">
                    <span className="font-display font-black text-xs uppercase text-black flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-black" />
                      <span>31-DAY MICRO-VERDICT MATRIX</span>
                    </span>
                    <span className="text-[10px] font-mono font-bold text-neutral-500">
                      {dossierReport.dayMatrix.length}d Logged
                    </span>
                  </div>

                  <div className="grid grid-cols-7 gap-1.5 pt-1">
                    {dossierReport.dayMatrix.map((item) => {
                      const isSelected = activeDayNote?.day === item.day;
                      const bg = item.rating === 5 ? 'bg-[#FDC800]' : item.rating === 4 ? 'bg-[#00E599]' : item.rating === 3 ? 'bg-neutral-300' : item.rating === 2 ? 'bg-[#FF8A00]' : 'bg-[#FF4D4D]';
                      return (
                        <button
                          key={item.day}
                          type="button"
                          onClick={() => setActiveDayNote(isSelected ? null : item)}
                          className={`p-1.5 rounded-xl border-2 border-black flex flex-col items-center justify-center transition-all cursor-pointer ${bg} ${
                            isSelected ? 'ring-2.5 ring-black scale-105 shadow-[2px_2px_0px_#000000]' : ''
                          }`}
                        >
                          <span className="text-[10px] font-mono font-black text-black leading-none">
                            {item.day}
                          </span>
                          <span className="text-[9px] font-mono font-bold text-black mt-0.5">
                            {item.rating}★
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Active Note Inspector Card */}
                  {activeDayNote && (
                    <div className="p-3 rounded-xl border-2 border-black bg-amber-50 shadow-[2px_2px_0px_#000000] mt-2.5 flex items-start justify-between gap-2.5">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-black text-[#FDC800] font-mono font-black text-[10px]">
                            DAY {activeDayNote.day} ({activeDayNote.date})
                          </span>
                          <span className="font-mono font-black text-xs text-black">
                            Rating: {activeDayNote.rating}/5.0
                          </span>
                        </div>
                        <p className="text-xs font-mono text-neutral-900 leading-snug">
                          {activeDayNote.notes || "No extra diary notes logged."}
                        </p>
                      </div>
                      <button
                        onClick={() => setActiveDayNote(null)}
                        className="p-1 rounded bg-black text-white cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* 6. Weekday Momentum Distribution */}
              {dossierReport.weekdayAverages && (
                <div className="p-4 rounded-2xl border-2 border-black bg-white shadow-[2.5px_2.5px_0px_#000000] space-y-2.5">
                  <div className="flex items-center justify-between pb-1.5 border-b border-black/10">
                    <span className="font-display font-black text-xs uppercase text-black flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4" />
                      <span>WEEKDAY MOMENTUM</span>
                    </span>
                    <span className="text-[10px] font-mono font-bold text-neutral-500">
                      Score / 5.0
                    </span>
                  </div>

                  <div className="grid grid-cols-7 gap-1.5 items-end pt-1 h-28">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => {
                      const score = dossierReport.weekdayAverages?.[day] || 0;
                      const heightPct = Math.max(15, Math.round((score / 5.0) * 100));

                      return (
                        <div key={day} className="flex flex-col items-center gap-1 h-full justify-end">
                          <span className="text-[10px] font-mono font-black text-black">
                            {score > 0 ? score : '—'}
                          </span>
                          <div 
                            style={{ height: `${heightPct}%` }}
                            className={`w-full rounded-t-md border-2 border-black ${
                              score >= 4 ? 'bg-[#00E599]' : score >= 3 ? 'bg-[#FDC800]' : score > 0 ? 'bg-[#FF8A00]' : 'bg-neutral-100'
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
              )}

              {/* 7. Verdict Breakdown */}
              {dossierReport.ratingCounts && (
                <div className="p-4 rounded-2xl border-2 border-black bg-white shadow-[2.5px_2.5px_0px_#000000] space-y-2.5">
                  <div className="flex items-center justify-between pb-1.5 border-b border-black/10">
                    <span className="font-display font-black text-xs uppercase text-black flex items-center gap-1.5">
                      <Layers className="w-4 h-4" />
                      <span>VERDICT BREAKDOWN</span>
                    </span>
                    <span className="text-[10px] font-mono font-bold text-neutral-500">
                      {dossierReport.totalLogged} Days
                    </span>
                  </div>

                  <div className="space-y-2">
                    {[
                      { label: 'Peak (5/5)', count: dossierReport.ratingCounts?.[5] || 0, bg: '#FDC800' },
                      { label: 'Good (4/5)', count: dossierReport.ratingCounts?.[4] || 0, bg: '#00E599' },
                      { label: 'Okay (3/5)', count: dossierReport.ratingCounts?.[3] || 0, bg: '#CBD5E1' },
                      { label: 'Down (2/5)', count: dossierReport.ratingCounts?.[2] || 0, bg: '#FF8A00' },
                      { label: 'Rough (1/5)', count: dossierReport.ratingCounts?.[1] || 0, bg: '#FF4D4D' }
                    ].map(item => {
                      const pct = dossierReport.totalLogged > 0 ? Math.round((item.count / dossierReport.totalLogged) * 100) : 0;
                      return (
                        <div key={item.label} className="space-y-1">
                          <div className="flex justify-between text-xs font-mono font-bold text-black">
                            <span>{item.label}</span>
                            <span>{item.count}d ({pct}%)</span>
                          </div>
                          <div className="h-2 w-full bg-neutral-100 rounded-full border border-black/20 overflow-hidden">
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
                <div className="p-4 rounded-2xl border-2 border-black bg-white shadow-[2.5px_2.5px_0px_#000000] space-y-2.5">
                  <div className="flex items-center gap-2 pb-1.5 border-b border-black/10">
                    <Compass className="w-4 h-4 text-black" />
                    <h4 className="font-display font-black text-xs uppercase text-black">
                      HIDDEN BEHAVIORAL DISCOVERIES
                    </h4>
                  </div>
                  <div className="space-y-2.5 pt-1">
                    {dossierReport.hiddenCorrelations.map((c, idx) => (
                      <div key={idx} className="p-3 rounded-xl border border-black/20 bg-neutral-50 flex items-start gap-2.5">
                        <span className="w-6 h-6 rounded-full bg-black text-[#FDC800] font-mono font-black text-xs flex items-center justify-center shrink-0">
                          #{idx + 1}
                        </span>
                        <p className="text-xs sm:text-sm font-mono font-semibold text-neutral-900 leading-snug">
                          {c}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          ) : (
            <div className="p-6 rounded-2xl border-2 border-black bg-white text-center space-y-3 shadow-[3px_3px_0px_#000000]">
              <Lock className="w-9 h-9 text-[#00E599] mx-auto stroke-[2.5]" />
              <h4 className="font-display font-black text-base uppercase text-black">
                Ready for Evaluation
              </h4>
              <p className="text-xs font-mono text-neutral-600">
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
        <main className="flex-1 px-4 py-3.5 max-w-lg mx-auto w-full space-y-3.5">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div>
              <h2 className="font-display font-black text-xl uppercase tracking-tight text-black">
                Performance Metrics
              </h2>
              <p className="text-xs font-mono font-bold text-neutral-600">
                Real-time score distribution and momentum analytics.
              </p>
            </div>
            {onOpenTelemetry && (
              <button
                onClick={onOpenTelemetry}
                className="px-3 py-2 bg-[#00E599] text-black border-2 border-black rounded-xl font-display font-black text-xs uppercase shadow-[2px_2px_0px_#000000] cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                <Zap className="w-3.5 h-3.5 stroke-[3]" />
                <span>TELEMETRY</span>
              </button>
            )}
          </div>
          <StatsWidget entries={entries} dayCount={dayCount} />
        </main>
      )}

      {/* ========================================================= */}
      {/* 📝 FULLY VISIBLE MOBILE REFLECTION NOTE DRAWER (PINNED SAVE BUTTON) */}
      {/* ========================================================= */}
      <AnimatePresence>
        {showNoteDrawer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-xs flex items-end justify-center p-0"
            onClick={() => setShowNoteDrawer(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 360 }}
              className="w-full max-w-lg bg-[#FFFDF5] rounded-t-3xl border-t-3 border-x-3 border-black shadow-[0_-8px_0px_#000000] h-[80vh] max-h-[85vh] flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Drag Handle & Top Header */}
              <div className="px-4 pt-3 pb-2.5 border-b-2 border-black/10 bg-[#FFFDF5] shrink-0">
                <button 
                  onClick={() => setShowNoteDrawer(false)}
                  className="w-14 h-1.5 bg-black/30 hover:bg-black rounded-full mx-auto block mb-2 cursor-pointer transition-colors"
                  title="Swipe or tap to close"
                />
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#FDC800] border-2 border-black flex items-center justify-center shadow-[1px_1px_0px_#000000]">
                      <PenLine className="w-3.5 h-3.5 stroke-[2.5]" />
                    </div>
                    <div>
                      <h3 className="font-display font-black text-sm uppercase leading-none">
                        Daily Reflection Note
                      </h3>
                      <span className="text-[9px] font-mono text-neutral-500 font-bold">
                        {todayStr} • Day {dayCount}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowNoteDrawer(false)}
                    className="px-3 py-1 rounded-xl bg-neutral-100 hover:bg-neutral-200 border-2 border-black font-mono text-xs font-black text-black shadow-[1px_1px_0px_#000000] cursor-pointer"
                  >
                    ✕ CLOSE
                  </button>
                </div>
              </div>

              {/* Scrollable Textarea Body */}
              <div className="flex-1 p-4 flex flex-col overflow-hidden min-h-0 space-y-2.5">
                {/* 1-Tap Quick Mood & Context Chips */}
                <div>
                  <span className="text-[10px] font-mono font-black text-neutral-500 uppercase block mb-1.5">
                    1-Tap Quick Tags (Appends to note):
                  </span>
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                    {QUICK_TAGS.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleAddTag(tag)}
                        className="px-2.5 py-1 rounded-lg border border-black bg-white hover:bg-[#FDC800] text-black font-mono text-[10px] font-bold shrink-0 shadow-[1px_1px_0px_#000000] cursor-pointer active:scale-95 transition-all"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Textarea */}
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="What went wrong? What went right? Write your unfiltered thoughts..."
                  className="flex-1 w-full p-3.5 rounded-2xl border-2 border-black bg-white font-mono text-xs text-black resize-none focus:outline-none focus:ring-2 focus:ring-[#FDC800] leading-relaxed shadow-[inset_1.5px_1.5px_0px_rgba(0,0,0,0.1)] overflow-y-auto"
                />

                {/* AI Polish Toolbar & History Controls */}
                <div className="flex items-center justify-between gap-2 pt-0.5">
                  <button
                    type="button"
                    onClick={handleAIEnhance}
                    disabled={isEnhancing || !noteText || !noteText.trim()}
                    className={`px-3 py-1.5 rounded-xl border-2 border-black font-mono text-xs font-black flex items-center gap-1.5 shadow-[2px_2px_0px_#000000] cursor-pointer transition-all ${
                      isEnhancing ? 'bg-amber-100 opacity-70 animate-pulse' : 'bg-[#FDC800] hover:bg-amber-400'
                    } disabled:opacity-40 disabled:cursor-not-allowed`}
                    title="Polish and organize your diary entry with Gemini AI (maintains 1st person)"
                  >
                    <Wand2 className={`w-3.5 h-3.5 ${isEnhancing ? 'animate-spin' : ''}`} />
                    <span>{isEnhancing ? 'POLISHING...' : '✨ AI POLISH DIARY'}</span>
                  </button>

                  {/* History controls (Undo, Redo, Revert) */}
                  {historyStack.length > 1 && (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={handleUndo}
                        disabled={historyIdx <= 0}
                        className="p-1.5 rounded-lg border border-black bg-white hover:bg-neutral-100 disabled:opacity-30 cursor-pointer shadow-[1px_1px_0px_#000000]"
                        title="Undo AI edit"
                      >
                        <Undo2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={handleRedo}
                        disabled={historyIdx >= historyStack.length - 1}
                        className="p-1.5 rounded-lg border border-black bg-white hover:bg-neutral-100 disabled:opacity-30 cursor-pointer shadow-[1px_1px_0px_#000000]"
                        title="Redo AI edit"
                      >
                        <Redo2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={handleRevertOriginal}
                        disabled={noteText === originalDraft}
                        className="px-2 py-1 rounded-lg border border-black bg-neutral-100 hover:bg-neutral-200 text-[10px] font-mono font-bold disabled:opacity-30 cursor-pointer flex items-center gap-1 shadow-[1px_1px_0px_#000000]"
                        title="Revert to original raw draft"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Revert</span>
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono font-bold text-neutral-500 pt-0.5 shrink-0">
                  <span>{noteText.length} characters</span>
                  <span>💾 Auto-synced with rating</span>
                </div>
              </div>

              {/* Pinned Bottom Action Footer (ALWAYS Visible above any navigation) */}
              <div className="p-4 pt-2 bg-[#FFFDF5] border-t-2 border-black/10 shrink-0 pb-[max(1rem,env(safe-area-inset-bottom))]">
                <button
                  type="button"
                  onClick={handleSaveNote}
                  className="w-full py-3.5 bg-[#00E599] hover:bg-emerald-400 text-black font-display font-black text-sm uppercase rounded-2xl border-3 border-black shadow-[3px_3px_0px_#000000] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>SAVE REFLECTION NOTE</span>
                </button>
              </div>
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
                    {user.displayName || 'Trinno'}
                  </h4>
                  <span className="text-[10px] font-mono text-neutral-500 block mt-0.5">
                    {user.displayName === 'Trinno' ? 'trinno@cloud.sync' : user.email}
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

      {/* 📱 SOLID OPAQUE BOTTOM NATIVE APP NAVIGATION BAR (Large Bold Badges) */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#FFFFFF] border-t-3 border-black py-2.5 px-4 flex items-center justify-around shadow-[0_-4px_0px_#000000]">
        
        {/* Tab 1: Log Today */}
        <button
          onClick={() => setActiveTab('log')}
          className={`flex flex-col items-center justify-center px-4 py-1.5 rounded-xl transition-all cursor-pointer ${
            activeTab === 'log' 
              ? 'bg-[#FDC800] text-black border-2 border-black shadow-[2px_2px_0px_#000000]' 
              : 'text-neutral-500 hover:text-black'
          }`}
        >
          <Zap className="w-5 h-5 stroke-[2.5]" />
          <span className="font-mono font-black text-[11px] uppercase mt-0.5">Log</span>
        </button>

        {/* Tab 2: Calendar & Timeline History */}
        <button
          onClick={() => setActiveTab('history')}
          className={`flex flex-col items-center justify-center px-4 py-1.5 rounded-xl transition-all cursor-pointer ${
            activeTab === 'history' 
              ? 'bg-[#FDC800] text-black border-2 border-black shadow-[2px_2px_0px_#000000]' 
              : 'text-neutral-500 hover:text-black'
          }`}
        >
          <Calendar className="w-5 h-5 stroke-[2.5]" />
          <span className="font-mono font-black text-[11px] uppercase mt-0.5">Calendar</span>
        </button>

        {/* Tab 3: Monthly Dossier */}
        <button
          onClick={() => setActiveTab('dossier')}
          className={`flex flex-col items-center justify-center px-4 py-1.5 rounded-xl transition-all cursor-pointer ${
            activeTab === 'dossier' 
              ? 'bg-[#00E599] text-black border-2 border-black shadow-[2px_2px_0px_#000000]' 
              : 'text-neutral-500 hover:text-black'
          }`}
        >
          <Sparkles className="w-5 h-5 stroke-[2.5]" />
          <span className="font-mono font-black text-[11px] uppercase mt-0.5">Dossier</span>
        </button>

        {/* Tab 4: Stats */}
        <button
          onClick={() => setActiveTab('stats')}
          className={`flex flex-col items-center justify-center px-4 py-1.5 rounded-xl transition-all cursor-pointer ${
            activeTab === 'stats' 
              ? 'bg-[#FDC800] text-black border-2 border-black shadow-[2px_2px_0px_#000000]' 
              : 'text-neutral-500 hover:text-black'
          }`}
        >
          <BarChart2 className="w-5 h-5 stroke-[2.5]" />
          <span className="font-mono font-black text-[11px] uppercase mt-0.5">Stats</span>
        </button>

      </nav>

    </div>
  );
}
