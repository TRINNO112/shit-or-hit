import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ShieldVoltIcon from './ShieldVoltIcon';
import AIDirectivesModal, { DIRECTIVES } from './AIDirectivesModal';
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
  Settings,
  Target,
  ShieldCheck,
  ListOrdered,
  Terminal
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
import MoodReactionBanner from './MoodReactionBanner';
import { soundFx } from '../services/soundEffects';
import { loginWithGoogle, logoutUser, isEmailWhitelisted, subscribeAuthState } from '../services/firebase';
import confetti from 'canvas-confetti';
import JourneyTimeline from './JourneyTimeline';
import StatsWidget from './StatsWidget';
import SphereIcon from './SphereIcon';
import AutoExpandTextarea from './AutoExpandTextarea';
import NonNegotiableCard from './NonNegotiableCard';
import { soundEngine } from '../services/soundEngine';

const IconMap = {
  AlertCircle,
  CloudRain,
  MinusCircle,
  Zap,
  Sparkles
};

function GrowingTextarea({ minHeight = 42, maxHeight = 260, placeholder, value, onChange, className }) {
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(maxHeight, Math.max(minHeight, textareaRef.current.scrollHeight))}px`;
    }
  }, [value, minHeight, maxHeight]);

  return (
    <textarea
      ref={textareaRef}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={className}
      rows={1}
      style={{ minHeight: `${minHeight}px`, maxHeight: `${maxHeight}px`, resize: 'none' }}
    />
  );
}

export default function MobileAppView({
  startDate = new Date().toISOString().slice(0, 10),
  entries = {},
  dayCount = 1,
  todayStr = new Date().toISOString().slice(0, 10),
  onSaveToday,
  onOpenMonthlyReport,
  onEditDay,
  onOpenWallpaper,
  onOpenTelemetry,
  onOpenSettings,
  onOpenStickerVault,
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
  const [noteText, setNoteText] = useState(() => {
    if (typeof window !== 'undefined') {
      const draft = sessionStorage.getItem(`daily_verdict_draft_notes_${todayStr}`);
      if (draft) return draft;
    }
    return entries?.[todayStr]?.notes || '';
  });
  const [savedFlash, setSavedFlash] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);

  // Auto-debounce draft notes in sessionStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const draftKey = `daily_verdict_draft_notes_${todayStr}`;
    const t = setTimeout(() => {
      if (noteText && (!entries?.[todayStr]?.notes || noteText !== entries[todayStr].notes)) {
        sessionStorage.setItem(draftKey, noteText);
      } else if (!noteText) {
        sessionStorage.removeItem(draftKey);
      }
    }, 400);
    return () => clearTimeout(t);
  }, [noteText, todayStr, entries]);

  // AI Polish State & History Stack
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [historyStack, setHistoryStack] = useState([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const [originalDraft, setOriginalDraft] = useState('');
  const [mobileCustomPrompt, setMobileCustomPrompt] = useState('');
  const [showMobileCustomPrompt, setShowMobileCustomPrompt] = useState(false);
  const [isDirectivesModalOpen, setIsDirectivesModalOpen] = useState(false);
  const [activeDirective, setActiveDirective] = useState('auto');
  const [selectedTags, setSelectedTags] = useState([]);

  // Embedded Calendar State
  const [calendarDate, setCalendarDate] = useState(new Date());
  
  // Embedded Dossier State
  const [dossierYear, setDossierYear] = useState(new Date().getFullYear());
  const [dossierMonth, setDossierMonth] = useState(new Date().getMonth() + 1);
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

    const currentEntry = entries?.[todayStr] || {};
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
      console.log('📱 [MobileAppView] Active User:', currentUser ? `${currentUser.displayName} (${currentUser.email})` : 'Anonymous Local');
      setUser(currentUser);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (entries?.[todayStr]?.notes !== undefined) {
      setNoteText(entries?.[todayStr]?.notes || '');
      setOriginalDraft(entries?.[todayStr]?.notes || '');
      setHistoryStack([entries?.[todayStr]?.notes || '']);
      setHistoryIdx(0);
    }
  }, [entries, todayStr]);

  // Auto-load saved dossier when switching to Dossier tab
  useEffect(() => {
    if (activeTab === 'dossier') {
      loadDossier(dossierYear, dossierMonth, false);
    }
  }, [activeTab, dossierYear, dossierMonth]);

  const loadDossier = async (yr, mo, force = false) => {
    setDossierLoading(true);
    setDossierError(null);
    try {
      if (!force) {
        const saved = await getSavedMonthlyReport(yr, mo);
        if (saved && saved.executiveSummary) {
          setDossierReport(saved);
          setDossierLoading(false);
          return;
        }
      }
      const data = await fetchMonthlyReport(yr, mo, null, null, force);
      setDossierReport(data);
    } catch (err) {
      console.error('Failed to load mobile monthly report:', err);
      setDossierError(err.message || 'Failed to synthesize dossier.');
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

  // Web Audio Mechanical Synthesizer using custom soundFx engine
  const playSound = (type = 'click') => {
    if (type === 'chime') {
      soundFx.playPeak();
    } else {
      soundFx.playClick();
    }
  };

  const selectedRating = entries?.[todayStr]?.rating || null;
  const isWhitelisted = user && isEmailWhitelisted(user.email);

  const now = new Date();
  const dayName = now.toLocaleDateString('en-US', { weekday: 'long' });
  const fullDate = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const [customTags, setCustomTags] = useState(() => {
    try {
      const saved = localStorage.getItem('daily_verdict_custom_tags');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      'Deep Work',
      'Screen Trap',
      'High Energy',
      'Study Grind',
      'Sleep Deficit',
      'Locked In',
      'Burnout'
    ];
  });

  const handleToggleTag = (tag) => {
    triggerHaptic('light');
    soundFx.playClick();
    setSelectedTags(prev => {
      if (prev.includes(tag)) {
        return prev.filter(t => t !== tag);
      }
      return [...prev, tag];
    });
  };

  const handleAIEnhance = async (overridePrompt = null) => {
    const hasSphereNotes = Object.values(spheresData).some(s => s.notes && s.notes.trim());
    if ((!noteText || noteText.trim() === '') && !hasSphereNotes) return;
    
    // Pull active preferences directly from SettingsModal / localStorage
    const savedDirective = localStorage.getItem('daily_verdict_default_directive') || 'auto';
    const savedCustomPrompt = localStorage.getItem('daily_verdict_custom_prompt') || '';
    
    triggerHaptic('medium');
    soundFx.playClick();
    const currentVal = noteText;
    const foundPreset = DIRECTIVES.find(d => d.id === savedDirective);
    const activePrompt = overridePrompt || (savedCustomPrompt ? savedCustomPrompt : (foundPreset ? foundPreset.instruction : null));
    setIsEnhancing(true);
    try {
      const comp = calculateCompositeScore(spheresData);
      const enhanced = await enhanceReflectionWithAI(
        currentVal, 
        comp?.rating || selectedRating || 3, 
        todayStr,
        sphereModeActive ? spheresData : null,
        activePrompt
      );
      if (enhanced && enhanced !== currentVal) {
        triggerHaptic('success');
        soundFx.playPeak();
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

  const triggerRatingExpressionMobile = (val, originY = 0.7) => {
    if (val === 5) {
      confetti({ particleCount: 65, spread: 70, origin: { y: originY }, colors: ['#FDC800', '#000000', '#00E599', '#FFFFFF'] });
    } else if (val === 4) {
      confetti({ particleCount: 35, spread: 50, origin: { y: originY }, colors: ['#00E599', '#FDC800', '#000000'] });
    }
  };

  const handleRate = async (val) => {
    triggerHaptic(val >= 4 ? 'success' : 'medium');
    if (val >= 4) {
      soundEngine.playSuccessChime();
    } else if (val <= 2) {
      soundEngine.playRoughTone();
    } else {
      soundEngine.playClick();
    }
    triggerRatingExpressionMobile(val, 0.7);

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
    soundFx.playMood(val);
    triggerRatingExpressionMobile(val, 0.7);

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

  const handleRateSphere = handleRateSphereMobile;

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

  const handleAnchorScoreUpdateMobile = async (scoreInfo) => {
    if (!scoreInfo) return;
    if (scoreInfo.mode === 'deterministic_100') {
      const roundedRating = Math.max(1, Math.min(5, Math.round(scoreInfo.calculatedRating) || 1));
      await onSaveToday({
        date: todayStr,
        rating: roundedRating,
        verdict: ratingMeta[roundedRating]?.title || 'Verdict',
        notes: noteText,
        calculatedScore: scoreInfo.calculatedRating,
        spheres: spheresData
      });
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 2000);
    } else if (scoreInfo.mode === 'hybrid_50_50' && selectedRating) {
      const blended = Number(((0.5 * selectedRating) + (0.5 * scoreInfo.calculatedRating)).toFixed(1));
      const roundedRating = Math.max(1, Math.min(5, Math.round(blended) || 1));
      await onSaveToday({
        date: todayStr,
        rating: roundedRating,
        verdict: ratingMeta[roundedRating]?.title || 'Verdict',
        notes: noteText,
        calculatedScore: blended,
        spheres: spheresData
      });
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 2000);
    }
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

    // Accurate day count relative to challenge start date (e.g. Day 8)
    const startMs = new Date(startDate + 'T00:00:00').getTime();
    const currentMs = new Date(dateStr + 'T00:00:00').getTime();
    const computedDayIndex = Math.floor((currentMs - startMs) / (1000 * 60 * 60 * 24)) + 1;
    const dayIndex = isBeforeStart ? d : Math.max(1, computedDayIndex);

    let isDimmed = false;
    if (calendarFilter === 'hits' && (!entry?.rating || entry.rating < 4)) isDimmed = true;
    if (calendarFilter === 'leaks' && (!entry?.rating || entry.rating > 2)) isDimmed = true;
    if (calendarFilter === 'notes' && !entry?.notes) isDimmed = true;

    calDays.push({ 
      dayNum: d, 
      dayIndex, 
      dateStr, 
      entry, 
      isBeforeStart, 
      isFuture, 
      isToday: dateStr === todayStr, 
      isDimmed 
    });
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
              VERDICT
            </h1>
            <span className="text-[10px] sm:text-xs font-mono font-bold text-neutral-600 block mt-0.5 truncate max-w-28 sm:max-w-40">
              {isWhitelisted ? `☁️ ${user.displayName || 'Cloud Synced'}` : 'Life Matrix OS'}
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
          <button
            onClick={() => {
              triggerHaptic('light');
              if (onOpenSettings) onOpenSettings();
            }}
            className="p-1.5 sm:p-2 rounded-xl bg-white hover:bg-[#FDC800] border-2 border-black shadow-[1.5px_1.5px_0px_#000000] cursor-pointer"
            title="Settings & Reminders"
          >
            <Settings className="w-4 h-4 text-black" />
          </button>

          {/* Sticker Vault Button */}
          {onOpenStickerVault && (
            <button
              onClick={() => {
                triggerHaptic('light');
                onOpenStickerVault();
              }}
              className="p-1.5 sm:p-2 rounded-xl bg-white hover:bg-[#FDC800] border-2 border-black shadow-[1.5px_1.5px_0px_#000000] cursor-pointer"
              title="Sticker & Mascot Vault"
            >
              <Sparkles className="w-4 h-4 text-black" />
            </button>
          )}
        </div>
      </header>

      {/* ========================================================= */}
      {/* ⚡ TAB 1: TODAY ACTIVE WORKSPACE */}
      {/* ========================================================= */}
      {(activeTab === 'log' || activeTab === 'today') && (
        <main className="flex-1 px-4 py-3.5 space-y-3.5 max-w-lg mx-auto w-full">
          
          {/* Header Context Banner */}
          <div className="flex items-center justify-between bg-white border-2 border-black p-3 rounded-2xl shadow-[3px_3px_0px_#000000]">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display font-black text-lg text-black uppercase leading-tight">
                  {dayName}
                </span>
                <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded-full bg-[#FDC800] border border-black shadow-[1px_1px_0px_#000000]">
                  DAY {dayCount}
                </span>
              </div>
              <span className="text-xs font-mono font-bold text-neutral-600 block mt-0.5">
                {fullDate} • {sphereModeActive ? 'Multi-Sphere Matrix Active' : 'Unified Verdict Mode'}
              </span>
            </div>

            <div className="w-9 h-9 rounded-xl bg-[#00E599] border-2 border-black flex items-center justify-center shadow-[1.5px_1.5px_0px_#000000] shrink-0">
              <Zap className="w-5 h-5 text-black fill-black" />
            </div>
          </div>

          {/* Rating Engine: Segmented Sphere Cards vs Standard Verdict */}
          {sphereModeActive ? (
            /* Multi-Sphere Segmentation Cards */
            <div className="space-y-3">
              {spheresConfig.map((sphere) => {
                const sData = spheresData[sphere.id] || { rating: null, notes: '' };
                const currentSphereRating = sData.rating;

                return (
                  <div 
                    key={sphere.id}
                    className="p-3.5 rounded-2xl border-2 border-black bg-white shadow-[3px_3px_0px_#000000] space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-8 h-8 rounded-lg border-2 border-black flex items-center justify-center shadow-[1px_1px_0px_#000000] shrink-0"
                          style={{ backgroundColor: sphere.color || '#FDC800' }}
                        >
                          <SphereIcon icon={sphere.icon} className="w-4 h-4 text-black stroke-[2.5]" />
                        </div>
                        <div>
                          <div className="font-display font-black text-sm uppercase leading-tight">
                            {sphere.name}
                          </div>
                          <div className="text-[10px] font-mono text-neutral-500 leading-tight">
                            {sphere.desc}
                          </div>
                        </div>
                      </div>

                      {currentSphereRating && (
                        <div 
                          className="px-2 py-0.5 rounded-lg border-2 border-black font-display font-black text-xs uppercase shadow-[1px_1px_0px_#000000]"
                          style={{ backgroundColor: ratingMeta[currentSphereRating]?.bg }}
                        >
                          {ratingMeta[currentSphereRating]?.title} ({currentSphereRating}/5)
                        </div>
                      )}
                    </div>

                    {/* Compact 1-5 Radio Buttons for Sphere */}
                    <div className="grid grid-cols-5 gap-1.5 pt-1">
                      {[1, 2, 3, 4, 5].map((val) => {
                        const m = ratingMeta[val];
                        const isR = currentSphereRating === val;
                        return (
                          <button
                            key={val}
                            type="button"
                            onClick={() => handleRateSphere(sphere.id, val)}
                            className={`py-2 px-1 rounded-xl border-2 border-black font-mono text-xs font-black flex flex-col items-center justify-center transition-all cursor-pointer ${
                              isR 
                                ? 'scale-105 shadow-[2px_2px_0px_#000000] ring-2 ring-black font-black' 
                                : 'bg-neutral-50 hover:bg-neutral-100 shadow-[1px_1px_0px_#000000]'
                            }`}
                            style={{ backgroundColor: isR ? m.bg : undefined }}
                          >
                            <span className="leading-none text-black">{val}★</span>
                            <span className="text-[9px] font-display font-bold leading-none mt-1 truncate max-w-full text-black">
                              {m.title}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Optional Inline Sphere Note */}
                    <div className="pt-1">
                      <GrowingTextarea
                        minHeight={42}
                        maxHeight={260}
                        placeholder={`What happened at ${sphere.name}? (Wins, struggles, events)`}
                        value={sData.notes || ''}
                        onChange={(e) => handleSaveSphereNoteMobile(sphere.id, e.target.value)}
                        className="w-full p-3 text-xs font-mono bg-white border-2 border-black rounded-2xl placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-black leading-relaxed"
                      />
                    </div>
                  </div>
                );
              })}
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
                        <Check className="w-3.5 h-3.5 stroke-3" />
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          )}

          {/* 3 Daily Non-Negotiables Card */}
          <div className="pt-1">
            <NonNegotiableCard dateStr={todayStr} onScoreUpdate={handleAnchorScoreUpdateMobile} />
          </div>

          {/* Active Verdict Status & Reflection Button */}
          <div className="pt-1.5 space-y-2.5">
            {(() => {
              const comp = calculateCompositeScore(spheresData);
              const activeR = comp ? comp.rating : selectedRating;
              const activeScore = comp ? comp.score : null;

              if (activeR) {
                return (
                  <div className="space-y-2.5">
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
                  </div>
                );
              }
              return (
                <div className="p-3 rounded-xl border-2 border-black bg-neutral-100 text-neutral-700 text-xs font-mono font-bold text-center">
                  Tap any card above to record today.
                </div>
              );
            })()}

            {/* Action Row: Reflection Drawer Trigger (Single Mode only) & Wallpaper Export */}
            <div className={`grid ${sphereModeActive ? 'grid-cols-1' : 'grid-cols-2'} gap-2`}>
              {!sphereModeActive && (
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
              )}

              <button
                type="button"
                onClick={() => {
                  triggerHaptic('medium');
                  if (onOpenWallpaper) onOpenWallpaper(entries[todayStr], todayStr);
                }}
                className="py-3 px-2 rounded-xl border-2 border-black bg-[#FDC800] hover:bg-amber-400 text-black font-mono font-black text-xs flex items-center justify-center gap-1.5 shadow-[2.5px_2.5px_0px_#000000] cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-black" />
                <span>EXPORT WALLPAPER</span>
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
                  <ChevronLeft className="w-4 h-4 stroke-3" />
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
                  <ChevronRight className="w-4 h-4 stroke-3" />
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

                {calDays.map(({ dayNum, dayIndex, dateStr, entry, isBeforeStart, isFuture, isToday, isDimmed }) => {
                  const rating = entry?.rating || null;
                  const m = rating ? ratingMeta[rating] : null;

                  return (
                    <button
                      key={dateStr}
                      disabled={isFuture || isBeforeStart}
                      onClick={() => {
                        triggerHaptic('light');
                        onEditDay({ dateStr, dayIndex, entry });
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
              <div>
                <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded bg-[#FDC800] border border-black">
                  MONTHLY INTELLIGENCE
                </span>
                <h2 className="font-display font-black text-xl uppercase tracking-tight text-black mt-1">
                  Performance Dossier
                </h2>
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
                  <ChevronLeft className="w-3.5 h-3.5 stroke-3" />
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
                  <ChevronRight className="w-3.5 h-3.5 stroke-3" />
                </button>
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-1.5 border-t border-black/10">
              <button
                onClick={() => loadDossier(dossierYear, dossierMonth, true)}
                disabled={dossierLoading}
                className="w-full py-2.5 bg-[#00E599] hover:bg-emerald-400 text-black font-mono font-black text-xs uppercase rounded-xl border-2 border-black shadow-[2px_2px_0px_#000000] flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 active:scale-98 transition-all"
              >
                <Wand2 className={`w-3.5 h-3.5 stroke-[2.5] ${dossierLoading ? 'animate-spin' : ''}`} />
                <span>{dossierLoading ? 'Synthesizing...' : dossierReport ? '🔄 Re-Evaluate Dossier' : '⚡ Run Monthly Evaluation'}</span>
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
          ) : dossierReport && dossierReport.totalLogged === 0 ? (
            <div className="p-6 rounded-2xl border-2 border-black bg-white text-center space-y-3 shadow-[3px_3px_0px_#000000]">
              <Calendar className="w-9 h-9 text-neutral-600 mx-auto stroke-[2.5]" />
              <h4 className="font-display font-black text-base uppercase text-black">
                No Entries Logged Yet
              </h4>
              <p className="text-xs font-mono text-neutral-600">
                Log your daily verdicts on the Today tab or Calendar to unlock monthly performance intelligence.
              </p>
            </div>
          ) : (
            <div className="p-6 rounded-2xl border-2 border-black bg-white text-center space-y-3 shadow-[3px_3px_0px_#000000]">
              <Sparkles className="w-9 h-9 text-[#00E599] mx-auto stroke-[2.5]" />
              <h4 className="font-display font-black text-base uppercase text-black">
                Ready for Evaluation
              </h4>
              <p className="text-xs font-mono text-neutral-600">
                Tap the button above to synthesize Gemini AI performance forensics for this month.
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
                <Zap className="w-3.5 h-3.5 stroke-3" />
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
            className="fixed inset-0 z-100 bg-black/75 backdrop-blur-xs flex items-end justify-center p-0"
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
                {/* 1-Tap Quick Context & Tag Chips */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-mono font-black text-neutral-600 uppercase">
                      DAY CONTEXT TAGS:
                    </span>
                    {selectedTags.length > 0 && (
                      <span className="text-[9px] font-mono font-bold bg-black text-[#00E599] px-1.5 py-0.5 rounded">
                        {selectedTags.length} SELECTED
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                    {customTags.map((tag) => {
                      const isSelected = selectedTags.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => handleToggleTag(tag)}
                          className={`px-2.5 py-1 rounded-xl font-mono text-[10px] font-black shrink-0 border-2 border-black cursor-pointer active:scale-95 transition-all flex items-center gap-1 ${
                            isSelected
                              ? 'bg-[#00E599] text-black shadow-[1.5px_1.5px_0px_#000000] ring-1 ring-black'
                              : 'bg-white hover:bg-[#FDC800] text-neutral-800 shadow-[1px_1px_0px_#000000]'
                          }`}
                        >
                          {isSelected && <span>✓</span>}
                          <span>{tag}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Textarea with Enhanced Text Size & Line Height */}
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="What went wrong? What went right? Write your unfiltered thoughts..."
                  className="flex-1 w-full p-4 rounded-2xl border-2 border-black bg-white font-mono text-sm sm:text-base text-black resize-none focus:outline-none focus:ring-2 focus:ring-[#FDC800] leading-relaxed shadow-[inset_1.5px_1.5px_0px_rgba(0,0,0,0.1)] overflow-y-auto"
                />

                {/* AI Directives Modal Trigger & Polish Toolbar */}
                <div className="flex items-center justify-between gap-2 pt-0.5 shrink-0">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleAIEnhance()}
                      disabled={isEnhancing || !noteText || !noteText.trim()}
                      className={`px-3.5 py-1.5 rounded-xl border-2 border-black font-mono text-xs font-black flex items-center gap-1.5 shadow-[2px_2px_0px_#000000] cursor-pointer transition-all ${
                        isEnhancing ? 'bg-amber-100 opacity-70 animate-pulse' : 'bg-[#FDC800] hover:bg-amber-400'
                      } disabled:opacity-40 disabled:cursor-not-allowed`}
                      title="Polish and organize your diary entry with Gemini AI using your Settings directive (maintains 1st person)"
                    >
                      <Wand2 className={`w-3.5 h-3.5 ${isEnhancing ? 'animate-spin' : ''}`} />
                      <span>{isEnhancing ? 'POLISHING...' : 'AI POLISH DIARY'}</span>
                    </button>
                  </div>

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
                  <Check className="w-4 h-4 stroke-3" />
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
          onClick={() => {
            soundEngine.playClick();
            triggerHaptic('light');
            setActiveTab('log');
          }}
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
          onClick={() => {
            soundEngine.playClick();
            triggerHaptic('light');
            setActiveTab('history');
          }}
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
          onClick={() => {
            soundEngine.playClick();
            triggerHaptic('medium');
            setActiveTab('dossier');
          }}
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
          type="button"
          onClick={() => {
            soundEngine.playClick();
            triggerHaptic('light');
            setActiveTab('stats');
          }}
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
