import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowLeft,
  Bell,
  Send,
  Check,
  CheckCircle2,
  Smartphone,
  Monitor,
  Sparkles,
  Sliders,
  Clock,
  Flame,
  Info,
  Compass,
  Heart,
  ListTodo,
  Layers,
  Plus,
  Trash2,
  VolumeX,
  Volume2,
  HelpCircle,
  AlertTriangle,
  RotateCcw,
  Lightbulb
} from 'lucide-react';
import { playMood } from '../services/soundEffects';
import { soundEngine } from '../services/soundEngine';
import {
  isNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
  isNotificationEnabled,
  getNotificationBannerMode,
  setNotificationBannerMode,
  showInstantReminderNotification,
  getReminderTime,
  setReminderTime,
  getReminderTimes,
  setReminderTimes,
  addReminderTime,
  removeReminderTime,
  isDayRated,
  parseNotificationReply,
  validateNotificationReply,
  detectActiveEngine,
  getEngineNotificationContent
} from '../services/notifications';

const NOTIFICATION_MODES = [
  {
    id: 'inline',
    name: '1. INLINE TEXT & NOTE (RECOMMENDED)',
    badge: 'UNIVERSAL • PHONES & PC',
    badgeColor: '#00E599',
    description: 'Type your star rating (1 to 5) and a diary note directly in the notification banner. Logs everything without opening the app.'
  },
  {
    id: 'polar',
    name: '2. TWO QUICK BUTTONS (1★ VS 5★)',
    badge: '1-TAP INSTANT VERDICT',
    badgeColor: '#FDC800',
    description: 'Two physical buttons (1★ Shit vs 5★ Hit) for instant 1-tap rating directly from your lockscreen or notification tray.'
  }
];

const ENGINES = [
  {
    id: 'standard',
    name: 'STANDARD VERDICT',
    tag: '1-5★ RATING',
    icon: Flame,
    color: '#FDC800',
    description: 'Standard daily mood tracking. Rate your day 1-5★ and record your evening diary entry.'
  },
  {
    id: 'spheres',
    name: 'MULTI-SPHERE LIFE',
    tag: 'LIFE DOMAINS',
    icon: Layers,
    color: '#38BDF8',
    description: 'Track multiple life spheres (Work, Health, Mind). Rate each domain and record reflections.'
  },
  {
    id: 'non-negotiables',
    name: 'NON-NEGOTIABLES',
    tag: 'HABIT ANCHORS',
    icon: ListTodo,
    color: '#FF9500',
    description: 'Daily habit execution engine. Audits daily anchors and records completion score.'
  },
  {
    id: 'sabbatical',
    name: 'SABBATICAL STASIS',
    tag: 'MACRO PAUSE',
    icon: Compass,
    color: '#00D4FF',
    description: 'Open-ended horizon pause (>30 days). Streaks are shielded & frozen. Write freeform reflections.'
  },
  {
    id: 'sanctuary',
    name: 'TRANQUILITY SANCTUARY',
    tag: '7-14D RESET',
    icon: Heart,
    color: '#00E599',
    description: 'Short-term nervous system reset. Vagus nerve calming pacing and somatic comfort check-in.'
  }
];

const DEFAULT_PRESET_TEXTS = {
  standard: '5 Shipped auth feature, crushed gym, feeling unstoppable',
  spheres: '3, 2, 1 Code sprint done, workout heavy, reading pending',
  'non-negotiables': '101 Crushed workout and deep work, skipped cold shower',
  sabbatical: 'Spent the afternoon writing by the river, completely unplugged from work',
  sanctuary: 'Practiced 4-2-6 vagus nerve breathing for 10 minutes, anxiety eased, deeply rested'
};

const ENGINE_FORMAT_TIPS = {
  standard: {
    id: 'standard',
    name: 'Standard Daily Verdict',
    color: '#FDC800',
    instruction: 'Start your message with your rating number (1 to 5), then write what happened today.',
    ratingPill: '5',
    noteExample: 'Shipped auth feature, crushed gym, feeling unstoppable',
    explanation: 'The first number sets your day rating (1 = Shit, 5 = Hit). Everything after the number is saved as your diary note.'
  },
  spheres: {
    id: 'spheres',
    name: 'Multi-Sphere Life',
    color: '#38BDF8',
    instruction: 'Type a rating for each life sphere (1 to 5). You can write them together (like 321) or separate them with commas (like 3, 2, 1), followed by your note.',
    ratingPill: '3, 2, 1',
    noteExample: 'Code sprint done, workout heavy, reading pending',
    explanation: 'Each number rates a domain in order. The app calculates your average score and saves your reflections.'
  },
  'non-negotiables': {
    id: 'non-negotiables',
    name: 'Non-Negotiables (Habits)',
    color: '#FF9500',
    instruction: 'Type 1 for completed habits and 0 for skipped habits (e.g. 101 or 1, 0, 1), followed by your note.',
    ratingPill: '101',
    noteExample: 'Crushed workout and deep work, skipped cold shower',
    explanation: '1 = Done, 0 = Skipped. The app calculates your habit percentage and checks them off in your diary.'
  },
  sabbatical: {
    id: 'sabbatical',
    name: 'Sabbatical Stasis',
    color: '#00D4FF',
    instruction: 'No numbers needed! Your streaks are frozen. Just write your thoughts, reading notes, or reflections.',
    ratingPill: 'NOTE',
    noteExample: 'Spent the afternoon writing by the river, completely unplugged from work',
    explanation: 'Everything you write is saved directly to your Sabbatical Chronicle with zero streak pressure.'
  },
  sanctuary: {
    id: 'sanctuary',
    name: 'Tranquility Sanctuary',
    color: '#00E599',
    instruction: 'No scores during recovery. Just write a quick check-in or note about how your body and mind feel.',
    ratingPill: 'REST',
    noteExample: 'Practiced 4-2-6 vagus nerve breathing for 10 minutes, anxiety eased, deeply rested',
    explanation: 'Focuses purely on rest and recovery. Saved as a somatic grounding note.'
  }
};

export default function NotificationStudioPage({ onBack, entries = {}, todayStr = '' }) {
  const [bannerMode, setBannerModeState] = useState(() => getNotificationBannerMode());
  const [selectedEngine, setSelectedEngine] = useState(() => detectActiveEngine());
  const [simulatorDevice, setSimulatorDevice] = useState('phone'); // 'phone' | 'windows'
  const [reminderTimeVal, setReminderTimeVal] = useState(() => getReminderTime());
  const [reminderTimes, setReminderTimesState] = useState(() => getReminderTimes());
  const [newReminderTime, setNewReminderTime] = useState('20:00');
  const [todayRated, setTodayRated] = useState(() => isDayRated());
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testSent, setTestSent] = useState(false);
  const [testError, setTestError] = useState(null);
  const [permissionState, setPermissionState] = useState(() => getNotificationPermission());
  const [inlineInputVal, setInlineInputVal] = useState(() => DEFAULT_PRESET_TEXTS[detectActiveEngine()] || DEFAULT_PRESET_TEXTS.standard);
  const [simulatorFeedback, setSimulatorFeedback] = useState(null);

  const currentValidation = useMemo(() => {
    return validateNotificationReply(inlineInputVal, selectedEngine);
  }, [inlineInputVal, selectedEngine]);

  // Sync mode changes & auto-silence status with localStorage & system
  useEffect(() => {
    const handleSync = () => {
      setSelectedEngine(detectActiveEngine());
      setReminderTimesState(getReminderTimes());
      setTodayRated(isDayRated());
    };
    window.addEventListener('storage', handleSync);
    window.addEventListener('verdict-sync-status', handleSync);
    window.addEventListener('remote_notification_verdict', handleSync);

    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('verdict-sync-status', handleSync);
      window.removeEventListener('remote_notification_verdict', handleSync);
    };
  }, []);

  const handleModeSelect = (modeId) => {
    setBannerModeState(modeId);
    setNotificationBannerMode(modeId);
    soundEngine.playClick();
  };

  const handleAddSlot = () => {
    if (reminderTimes.length >= 5) return;
    const ok = addReminderTime(newReminderTime);
    if (ok) {
      setReminderTimesState(getReminderTimes());
      soundEngine.playSuccess();
    }
  };

  const handleRemoveSlot = (t) => {
    removeReminderTime(t);
    setReminderTimesState(getReminderTimes());
    soundEngine.playClick();
  };

  const handleApplyPreset = (timesList) => {
    setReminderTimes(timesList);
    setReminderTimesState(getReminderTimes());
    soundEngine.playSuccess();
  };

  const handleRequestPermission = async () => {
    soundEngine.playClick();
    const granted = await requestNotificationPermission();
    setPermissionState(getNotificationPermission());
    if (granted) {
      soundEngine.playSuccess();
    }
  };

  const handleFireTestNotification = async () => {
    setIsSendingTest(true);
    setTestError(null);
    soundEngine.playClick();
    try {
      const ok = await showInstantReminderNotification(null, bannerMode, selectedEngine);
      setIsSendingTest(false);
      if (ok) {
        setTestSent(true);
        soundEngine.playSuccess();
        setTimeout(() => setTestSent(false), 4500);
      } else {
        setTestError('Notification dismissed or permission denied. Please allow notifications.');
      }
    } catch (err) {
      setIsSendingTest(false);
      setTestError(err.message || 'Failed to dispatch notification.');
    }
  };

  // Interactive Simulator Submission Handler
  const handleSimulatorSubmit = (simRating, simNotes = '', simSpheres = null, simNonNegotiables = null, engineType = null) => {
    try {
      if (simRating) playMood(simRating);
      soundEngine.playSuccess();
    } catch (e) {
      soundEngine.playClick();
    }

    const detail = {
      rating: simRating,
      notes: simNotes || undefined,
      spheres: simSpheres || undefined,
      nonNegotiables: simNonNegotiables || undefined,
      engine: engineType || selectedEngine,
      timestamp: new Date().toISOString()
    };

    let msg = simRating
      ? `RECORDED ${simRating}★ ${simNotes ? `WITH NOTE: "${simNotes}"` : ''} TO TODAY'S DIARY`
      : `SAVED DIARY NOTE: "${simNotes}" (ZERO APP OPEN NEEDED)`;
    if (engineType === 'spheres') {
      msg = `RECORDED SPHERES (${simRating}★ COMPOSITE) ${simNotes ? `NOTE: "${simNotes}"` : ''}`;
    } else if (engineType === 'non-negotiables' && simNonNegotiables) {
      msg = `RECORDED HABITS (${simNonNegotiables.completedCount}/${simNonNegotiables.totalCount} DONE, ${simRating}★) ${simNotes ? `NOTE: "${simNotes}"` : ''}`;
    }

    setSimulatorFeedback({
      rating: simRating,
      notes: simNotes,
      engine: engineType || selectedEngine,
      message: msg
    });

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('remote_notification_verdict', { detail }));
    }

    setTodayRated(true);
    setTimeout(() => setSimulatorFeedback(null), 5500);
  };

  const activeEngineObj = ENGINES.find((e) => e.id === selectedEngine) || ENGINES[0];
  const currentTip = ENGINE_FORMAT_TIPS[selectedEngine] || ENGINE_FORMAT_TIPS.standard;
  const engineContent = getEngineNotificationContent(selectedEngine);

  return (
    <div className="min-h-screen bg-[#FFFDF8] text-black pb-20 selection:bg-[#FDC800]">
      {/* Sticky Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#FFFDF8]/95 backdrop-blur-md border-b-3 border-black px-3.5 sm:px-6 py-3.5 shadow-[0_2px_0px_#000000]">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onBack}
            className="px-3 py-2 bg-white hover:bg-neutral-100 border-2 border-black rounded-xl font-mono font-black text-xs uppercase shadow-[2px_2px_0px_#000000] cursor-pointer flex items-center gap-1.5 active:translate-x-px active:translate-y-px transition-all shrink-0"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
            <span>BACK</span>
          </button>

          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 border-2 border-black rounded-xl font-mono font-black text-xs uppercase flex items-center gap-1.5 shadow-[2px_2px_0px_#000000] ${
                permissionState === 'granted'
                  ? 'bg-[#00E599] text-black'
                  : 'bg-[#FDC800] text-black'
              }`}
            >
              <Bell className="w-3.5 h-3.5 text-black" />
              <span>{permissionState === 'granted' ? 'Reminders Ready' : 'Permission Needed'}</span>
            </span>
          </div>
        </div>
      </header>

      {/* Main Studio Workspace Container */}
      <main className="max-w-4xl mx-auto px-3.5 sm:px-6 pt-6 sm:pt-8 space-y-6 sm:space-y-8">
        
        {/* Simple Clean Hero Section */}
        <section className="bg-white border-3 border-black rounded-3xl p-4 sm:p-6 shadow-[5px_5px_0px_#000000] space-y-2">
          <span className="px-2.5 py-0.5 bg-[#FDC800] border-2 border-black rounded-md font-mono font-black text-[10px] uppercase shadow-[1.5px_1.5px_0px_#000000] inline-block">
            DAILY NOTIFICATIONS
          </span>
          <h1 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight text-black">
            Daily Reminders &amp; Lockscreen Verdict
          </h1>
          <p className="text-xs sm:text-sm font-mono text-neutral-700 leading-relaxed">
            Set your reminder times and log your daily star rating and diary note directly from your notification banner without opening the app.
          </p>

          {/* Quick Permission Bar (If not granted) */}
          {permissionState !== 'granted' && (
            <div className="mt-3 p-3 bg-[#FFFDF5] border-2 border-black rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-[3px_3px_0px_#000000]">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-neutral-800">
                <Info className="w-4 h-4 text-black shrink-0" />
                <span>Notifications are currently disabled in this browser.</span>
              </div>
              <button
                type="button"
                onClick={handleRequestPermission}
                className="w-full sm:w-auto px-4 py-2 bg-[#00E599] hover:bg-[#00c785] border-2 border-black rounded-xl font-mono font-black text-xs uppercase cursor-pointer shadow-[2px_2px_0px_#000000] active:translate-x-px active:translate-y-px transition-all"
              >
                ENABLE NOTIFICATIONS
              </button>
            </div>
          )}
        </section>

        {/* SECTION 1: Daily Reminder Times (SHIFTED UP TO THE TOP) */}
        <section className="bg-white border-3 border-black rounded-3xl p-4 sm:p-6 shadow-[5px_5px_0px_#000000] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="font-display font-black text-lg sm:text-xl uppercase tracking-tight text-black flex items-center gap-2">
                <Clock className="w-5 h-5 text-black" />
                <span>1. Set Your Reminder Times</span>
              </h2>
              <p className="text-xs font-mono text-neutral-600">
                Choose the times you want to receive evening check-in reminders (up to 5).
              </p>
            </div>

            {todayRated ? (
              <div className="flex items-center gap-1 font-mono text-[10px] font-black bg-[#00E599] text-black px-2.5 py-1 rounded-xl border-2 border-black shadow-[1.5px_1.5px_0px_#000] self-start sm:self-auto">
                <VolumeX className="w-3.5 h-3.5 text-black" />
                <span>TODAY LOGGED • REMINDERS MUTED</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 font-mono text-[10px] font-black bg-[#FDC800] text-black px-2.5 py-1 rounded-xl border-2 border-black shadow-[1.5px_1.5px_0px_#000] self-start sm:self-auto">
                <Volume2 className="w-3.5 h-3.5 text-black" />
                <span>REMINDERS ARMED</span>
              </div>
            )}
          </div>

          {/* Active Time Slots */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center gap-2 flex-wrap">
              {reminderTimes.map((timeStr) => (
                <div
                  key={timeStr}
                  className="px-3 py-1.5 bg-[#FFFDF5] border-2 border-black rounded-xl font-mono text-xs font-black flex items-center gap-2 shadow-[2px_2px_0px_#000]"
                >
                  <Clock className="w-3.5 h-3.5 text-black/70" />
                  <span>{timeStr}</span>
                  {reminderTimes.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveSlot(timeStr)}
                      className="p-1 hover:bg-[#FF4D4D] hover:text-white rounded border border-transparent hover:border-black cursor-pointer transition-all"
                      title="Remove time"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}

              {/* Add New Time Slot */}
              {reminderTimes.length < 5 && (
                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    value={newReminderTime}
                    onChange={(e) => setNewReminderTime(e.target.value)}
                    className="px-2.5 py-1.5 bg-neutral-50 border-2 border-black rounded-xl font-mono font-black text-xs text-black focus:outline-none focus:ring-2 focus:ring-[#FDC800] shadow-[1.5px_1.5px_0px_#000]"
                  />
                  <button
                    type="button"
                    onClick={handleAddSlot}
                    className="px-3 py-1.5 bg-[#00E599] hover:bg-[#00c785] border-2 border-black rounded-xl font-mono font-black text-xs text-black uppercase cursor-pointer shadow-[2px_2px_0px_#000] active:translate-x-px active:translate-y-px flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-3" />
                    <span>ADD TIME</span>
                  </button>
                </div>
              )}
            </div>

            {/* Quick 1-Tap Presets */}
            <div className="pt-2 border-t border-black/10 flex items-center gap-2 flex-wrap">
              <span className="font-mono text-[10px] font-black uppercase text-neutral-500">
                QUICK PRESETS:
              </span>
              <button
                type="button"
                onClick={() => handleApplyPreset(['21:00'])}
                className="px-2.5 py-1 bg-neutral-100 hover:bg-[#FDC800] border border-black rounded-lg font-mono text-[11px] font-bold cursor-pointer transition-all shadow-[1px_1px_0px_#000]"
              >
                9:00 PM (Standard)
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset(['14:00', '20:00', '22:30'])}
                className="px-2.5 py-1 bg-neutral-100 hover:bg-[#FDC800] border border-black rounded-lg font-mono text-[11px] font-bold cursor-pointer transition-all shadow-[1px_1px_0px_#000]"
              >
                3x Daily (2 PM • 8 PM • 10:30 PM)
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset(['20:00', '21:00', '22:00', '23:00'])}
                className="px-2.5 py-1 bg-neutral-100 hover:bg-[#FDC800] border border-black rounded-lg font-mono text-[11px] font-bold cursor-pointer transition-all shadow-[1px_1px_0px_#000]"
              >
                Hourly Evening (8 - 11 PM)
              </button>
            </div>
          </div>
        </section>

        {/* SECTION 2: Notification Reply Mode */}
        <section className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <div>
              <h2 className="font-display font-black text-lg sm:text-xl uppercase tracking-tight text-black flex items-center gap-2">
                <Sliders className="w-5 h-5 text-black" />
                <span>2. Choose How You Reply</span>
              </h2>
              <p className="text-xs font-mono text-neutral-600">
                Choose how notifications interact with your lockscreen.
              </p>
            </div>
            <span className="font-mono text-[10px] bg-black text-[#00E599] px-2.5 py-1 rounded-lg font-black self-start sm:self-auto">
              ACTIVE: {bannerMode === 'inline' ? 'INLINE TEXT REPLY' : '2-BUTTON QUICK VERDICT'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {NOTIFICATION_MODES.map((mode) => {
              const isSelected = bannerMode === mode.id;
              return (
                <div
                  key={mode.id}
                  onClick={() => handleModeSelect(mode.id)}
                  className={`p-4 sm:p-5 rounded-2xl border-3 border-black cursor-pointer transition-all flex flex-col justify-between gap-3 ${
                    isSelected
                      ? 'bg-[#FFFDF5] shadow-[5px_5px_0px_#000000] ring-2 ring-black'
                      : 'bg-white hover:bg-neutral-50 shadow-[2px_2px_0px_#000000]'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className="px-2 py-0.5 rounded border border-black font-mono font-black text-[10px] uppercase shadow-[1px_1px_0px_#000]"
                        style={{ backgroundColor: mode.badgeColor }}
                      >
                        {mode.badge}
                      </span>
                      {isSelected && (
                        <span className="px-2 py-0.5 bg-black text-[#00E599] rounded font-mono font-black text-[10px] uppercase flex items-center gap-1">
                          <Check className="w-3 h-3 stroke-3 text-[#00E599]" />
                          <span>ACTIVE</span>
                        </span>
                      )}
                    </div>
                    <h3 className="font-display font-black text-base uppercase tracking-tight text-black">
                      {mode.name}
                    </h3>
                    <p className="text-xs font-mono text-neutral-700 leading-relaxed">
                      {mode.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* SECTION 3: Rating Engine & Format Guide */}
        <section className="bg-white border-3 border-black rounded-3xl p-4 sm:p-6 shadow-[5px_5px_0px_#000000] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <div>
              <h2 className="font-display font-black text-lg sm:text-xl uppercase tracking-tight text-black flex items-center gap-2">
                <Compass className="w-5 h-5 text-black" />
                <span>3. Choose Your Tracking Engine</span>
              </h2>
              <p className="text-xs font-mono text-neutral-600">
                Select your active tracking engine to see how to write your reply.
              </p>
            </div>
            <span className="font-mono text-[10px] bg-black text-[#FDC800] px-2.5 py-1 rounded-lg font-black self-start sm:self-auto">
              ENGINE: {selectedEngine.toUpperCase()}
            </span>
          </div>

          {/* Engine Selector Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {ENGINES.map((eng) => {
              const IconComp = eng.icon;
              const isActive = selectedEngine === eng.id;
              return (
                <button
                  key={eng.id}
                  type="button"
                  onClick={() => {
                    setSelectedEngine(eng.id);
                    setInlineInputVal(DEFAULT_PRESET_TEXTS[eng.id] || '');
                    soundEngine.playClick();
                  }}
                  className={`p-2.5 rounded-xl border-2 border-black font-mono font-black text-[11px] uppercase cursor-pointer transition-all flex flex-col items-center justify-center gap-1.5 text-center active:translate-x-px active:translate-y-px ${
                    isActive
                      ? 'bg-black text-[#FDC800] shadow-[3px_3px_0px_#000000]'
                      : 'bg-white hover:bg-neutral-100 text-black shadow-[2px_2px_0px_#000000]'
                  }`}
                >
                  <IconComp className={`w-4 h-4 ${isActive ? 'text-[#FDC800]' : 'text-black'}`} />
                  <span className="leading-tight">{eng.name}</span>
                </button>
              );
            })}
          </div>

          {/* Clean Format Guide with Highlighted Numbers */}
          <div className="p-4 bg-[#FFFDF5] border-2 border-black rounded-2xl space-y-3 shadow-[2px_2px_0px_#000]">
            <div className="space-y-1">
              <div className="font-mono font-black text-xs uppercase text-neutral-800 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-black" />
                <span>How to reply for: {currentTip.name}</span>
              </div>
              <p className="text-xs font-mono text-neutral-700 leading-relaxed">
                {currentTip.instruction}
              </p>
            </div>

            {/* Glowing / Highlighted Visual Example */}
            <div className="p-3 bg-white border-2 border-black rounded-xl shadow-[2px_2px_0px_#000] flex flex-col sm:flex-row sm:items-center gap-2">
              <span className="font-mono text-[10px] font-black uppercase text-neutral-400 sm:w-20 shrink-0">
                Example:
              </span>
              <div className="font-mono text-xs flex items-center gap-2 flex-wrap">
                <span
                  className="px-2.5 py-1 text-black font-black text-xs rounded-lg border-2 border-black shadow-[2px_2px_0px_#000]"
                  style={{ backgroundColor: currentTip.color }}
                >
                  {currentTip.ratingPill}
                </span>
                <span className="font-bold text-neutral-800">
                  {currentTip.noteExample}
                </span>
              </div>
            </div>

            <p className="text-[11px] font-mono text-neutral-500 leading-snug">
              {currentTip.explanation}
            </p>
          </div>
        </section>

        {/* SECTION 4: Live Device Simulator & Test */}
        <section className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="font-display font-black text-lg sm:text-xl uppercase tracking-tight text-black flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-black" />
                <span>4. Live Device Simulator</span>
              </h2>
              <p className="text-xs font-mono text-neutral-600">
                Test and interact with the notification exactly as it renders on your device.
              </p>
            </div>

            {/* Device Switcher Toggle */}
            <div className="flex items-center gap-1 bg-neutral-200 border-2 border-black rounded-xl p-1 shrink-0 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => {
                  setSimulatorDevice('phone');
                  soundEngine.playClick();
                }}
                className={`px-3 py-1 rounded-lg font-mono font-black text-xs uppercase cursor-pointer transition-all flex items-center gap-1 ${
                  simulatorDevice === 'phone'
                    ? 'bg-black text-[#00E599] shadow-[1px_1px_0px_#000]'
                    : 'text-neutral-700 hover:text-black'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>SMARTPHONE</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setSimulatorDevice('windows');
                  soundEngine.playClick();
                }}
                className={`px-3 py-1 rounded-lg font-mono font-black text-xs uppercase cursor-pointer transition-all flex items-center gap-1 ${
                  simulatorDevice === 'windows'
                    ? 'bg-black text-[#FDC800] shadow-[1px_1px_0px_#000]'
                    : 'text-neutral-700 hover:text-black'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>WINDOWS PC</span>
              </button>
            </div>
          </div>

          {/* The Simulator Canvas */}
          <div className="p-4 sm:p-7 rounded-3xl border-3 border-black bg-[#1C1814] text-white shadow-[6px_6px_0px_#000000] space-y-4">
            
            {/* Simulator Header */}
            <div className="flex items-center justify-between border-b border-white/15 pb-3 flex-wrap gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#FDC800] border-2 border-black flex items-center justify-center font-display font-black text-black text-xs shadow-[2px_2px_0px_#000]">
                  S
                </div>
                <div>
                  <div className="font-mono font-black text-xs uppercase text-[#FDC800] leading-none">
                    SHIT OR HIT • DAILY VERDICT
                  </div>
                  <div className="font-mono text-[10px] text-white/60 mt-0.5">
                    {simulatorDevice === 'windows' ? 'Windows 11 Action Center' : 'Smartphone Notification Shade'} • Now
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-mono text-[9px] bg-white/10 px-2 py-0.5 rounded text-[#00E599] font-bold uppercase">
                  MODE: {bannerMode.toUpperCase()}
                </span>
                <span className="font-mono text-[9px] bg-white/10 px-2 py-0.5 rounded text-[#FDC800] font-bold uppercase">
                  ENGINE: {selectedEngine.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Notification Title & Body */}
            <div className="space-y-1">
              <div className="font-display font-black text-sm uppercase text-white tracking-wide">
                {engineContent.title}
              </div>
              <p className="font-mono text-xs text-white/80 leading-relaxed">
                {engineContent.body}
              </p>
            </div>

            {/* SIMULATOR ACTION AREA */}
            <div className="pt-2 border-t border-white/10">
              
              {/* MODE 1: Inline Number & Note Text Reply */}
              {bannerMode === 'inline' && (
                <div className="space-y-3">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const raw = inlineInputVal.trim();
                      if (!raw) return;

                      const validation = validateNotificationReply(raw, selectedEngine);
                      if (!validation.isValid) {
                        soundEngine.playClick();
                        setSimulatorFeedback({
                          error: true,
                          message: validation.error || 'Syntax error in message. Entry was NOT recorded.'
                        });
                        setTimeout(() => setSimulatorFeedback(null), 5500);
                        return;
                      }

                      const parsed = validation.parsed || parseNotificationReply(raw, selectedEngine);
                      if (parsed) {
                        handleSimulatorSubmit(parsed.rating, parsed.notes, parsed.spheres, parsed.nonNegotiables, parsed.type);
                        setInlineInputVal(DEFAULT_PRESET_TEXTS[selectedEngine] || '');
                      }
                    }}
                    className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2"
                  >
                    <input
                      type="text"
                      value={inlineInputVal}
                      onChange={(e) => setInlineInputVal(e.target.value)}
                      placeholder={engineContent.placeholder}
                      className="flex-1 bg-black/70 border-2 border-white/30 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#FDC800]"
                    />
                    <button
                      type="submit"
                      className="w-full sm:w-auto px-5 py-2.5 bg-[#00E599] hover:bg-[#00c785] border-2 border-black rounded-xl font-mono font-black text-xs text-black uppercase cursor-pointer shadow-[2px_2px_0px_#000000] active:translate-x-px active:translate-y-px transition-all shrink-0"
                    >
                      SUBMIT DIRECTLY
                    </button>
                  </form>

                  {/* Real-time Syntax Diagnostic / Message Anatomy Card */}
                  {inlineInputVal.trim() && (
                    <div className="space-y-2">
                      {currentValidation.error ? (
                        <div className="p-3 bg-[#FF4D4D] border-2 border-black rounded-xl text-black font-mono text-xs space-y-1.5 shadow-[2px_2px_0px_#000] animate-fade-in">
                          <div className="flex items-center justify-between font-black uppercase text-[11px]">
                            <div className="flex items-center gap-1.5">
                              <AlertTriangle className="w-4 h-4 text-black stroke-[2.5] shrink-0" />
                              <span>Format Error • Entry Not Saved</span>
                            </div>
                            <span className="px-1.5 py-0.5 bg-black text-white text-[9px] rounded font-bold">
                              BLOCKED
                            </span>
                          </div>
                          <p className="text-[11px] font-bold leading-tight">
                            {currentValidation.error}
                          </p>
                          <div className="flex items-center gap-2 flex-wrap pt-1">
                            <button
                              type="button"
                              onClick={() => {
                                setInlineInputVal(DEFAULT_PRESET_TEXTS[selectedEngine] || '');
                                soundEngine.playClick();
                              }}
                              className="px-2.5 py-1 bg-white hover:bg-neutral-100 border border-black rounded-lg text-[10px] font-black uppercase cursor-pointer flex items-center gap-1 shadow-[1px_1px_0px_#000] active:translate-x-px active:translate-y-px"
                            >
                              <RotateCcw className="w-3 h-3 text-black" />
                              <span>Restore Example (&quot;{DEFAULT_PRESET_TEXTS[selectedEngine]}&quot;)</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="p-3.5 bg-[#FFFDF5] border-2 border-black rounded-2xl text-black font-mono text-xs space-y-2 shadow-[2px_2px_0px_#000] animate-fade-in">
                          <div className="flex items-center justify-between font-black uppercase text-[11px] border-b border-black/15 pb-1.5">
                            <div className="flex items-center gap-1.5">
                              <CheckCircle2 className="w-4 h-4 text-[#00c785] stroke-[2.5] shrink-0" />
                              <span>How The App Reads This Message:</span>
                            </div>
                            <span className="px-2 py-0.5 bg-[#00E599] text-black text-[9px] rounded font-black border border-black">
                              READY TO SAVE
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                            {/* Numerical / Anchor Part */}
                            <div className="p-2.5 bg-white border border-black rounded-xl space-y-1">
                              <span className="text-[10px] font-black uppercase text-neutral-500 block">
                                1. Star Rating / Habit Score:
                              </span>
                              {currentValidation.parsed.type === 'non-negotiables' && currentValidation.parsed.nonNegotiables ? (
                                <div>
                                  <span className="px-1.5 py-0.5 bg-[#FF9500] text-black font-black rounded text-[11px] border border-black mr-1">
                                    {currentValidation.parsed.nonNegotiables.digits}
                                  </span>
                                  <span className="font-bold">
                                    {currentValidation.parsed.nonNegotiables.completedCount} of {currentValidation.parsed.nonNegotiables.totalCount} Habits Completed ({currentValidation.parsed.rating}★)
                                  </span>
                                </div>
                              ) : currentValidation.parsed.type === 'spheres' && currentValidation.parsed.spheres ? (
                                <div>
                                  <span className="px-1.5 py-0.5 bg-[#38BDF8] text-black font-black rounded text-[11px] border border-black mr-1">
                                    {Object.values(currentValidation.parsed.spheres).map(s => s.score).join('')}
                                  </span>
                                  <span className="font-bold">
                                    Spheres [{Object.values(currentValidation.parsed.spheres).map(s => `${s.score}★`).join(', ')}] • Composite: {currentValidation.parsed.compositeScore}★
                                  </span>
                                </div>
                              ) : currentValidation.parsed.rating ? (
                                <div>
                                  <span className="px-2 py-0.5 bg-[#FDC800] text-black font-black rounded text-[11px] border border-black mr-1">
                                    {currentValidation.parsed.rating}★
                                  </span>
                                  <span className="font-bold">
                                    {currentValidation.parsed.rating === 5 ? '5★ Hit (Peak Execution)' : currentValidation.parsed.rating === 1 ? '1★ Shit (Rough Day)' : `${currentValidation.parsed.rating}★ Daily Verdict`}
                                  </span>
                                </div>
                              ) : (
                                <div className="font-bold text-[#00D4FF] bg-black px-2 py-0.5 rounded inline-block text-[11px]">
                                  Shielded Stasis • Zero Scores Required
                                </div>
                              )}
                            </div>

                            {/* Journal Note Part */}
                            <div className="p-2.5 bg-white border border-black rounded-xl space-y-1">
                              <span className="text-[10px] font-black uppercase text-neutral-500 block">
                                2. Diary Journal Note:
                              </span>
                              <div className="font-bold italic text-neutral-800 line-clamp-2">
                                &quot;{currentValidation.parsed.notes || '(No text note entered — rating only)'}&quot;
                              </div>
                            </div>
                          </div>

                          <div className="text-[10px] text-neutral-600 flex items-center justify-between flex-wrap gap-1 pt-1">
                            <span className="flex items-center gap-1">
                              <Lightbulb className="w-3 h-3 text-black shrink-0" />
                              <span>You can edit or type anything above to test your custom message format.</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setInlineInputVal(DEFAULT_PRESET_TEXTS[selectedEngine] || '');
                                soundEngine.playClick();
                              }}
                              className="text-[10px] font-black underline uppercase text-neutral-800 hover:text-black cursor-pointer"
                            >
                              Reset To Example
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[10px] font-mono text-white/50 flex-wrap gap-1">
                    <span className="flex items-center gap-1">
                      <Lightbulb className="w-3.5 h-3.5 text-[#FDC800] shrink-0" />
                      <span>Tip: Type a number alone (&quot;5&quot;) or with notes (&quot;5 Hit chest and closed sales&quot;).</span>
                    </span>
                    <span className="text-[#FDC800]">Keyboard shortcut 1-5 supported</span>
                  </div>
                </div>
              )}

              {/* MODE 2: 2-Button Polar Verdict */}
              {bannerMode === 'polar' && (
                <div className="space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleSimulatorSubmit(1, 'Recorded 1★ Shit via 1-tap notification button')}
                      className="w-full p-3 rounded-xl border-2 border-black bg-[#FF4D4D] hover:bg-[#ff3333] text-black font-mono font-black text-xs uppercase flex items-center justify-center gap-2 cursor-pointer shadow-[2px_2px_0px_#000000] active:translate-x-px active:translate-y-px transition-all"
                    >
                      <span>1★ SHIT (ROUGH DAY)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSimulatorSubmit(5, 'Recorded 5★ Hit via 1-tap notification button')}
                      className="w-full p-3 rounded-xl border-2 border-black bg-[#00E599] hover:bg-[#00c785] text-black font-mono font-black text-xs uppercase flex items-center justify-center gap-2 cursor-pointer shadow-[2px_2px_0px_#000000] active:translate-x-px active:translate-y-px transition-all"
                    >
                      <span>5★ HIT (PEAK EXECUTION)</span>
                    </button>
                  </div>
                  <p className="text-[10px] font-mono text-white/50 text-center sm:text-left flex items-center gap-1">
                    <Lightbulb className="w-3.5 h-3.5 text-[#FDC800] shrink-0" />
                    <span>Windows Action Center guarantees 2 buttons. Both buttons log today instantly with 1 tap.</span>
                  </p>
                </div>
              )}
            </div>

            {/* In-Simulator Feedback Toast */}
            {simulatorFeedback && (
              <div
                className={`p-3 rounded-xl border-2 border-black font-mono text-xs font-black flex items-center justify-between gap-2 shadow-[2px_2px_0px_#000] animate-fade-in ${
                  simulatorFeedback.error
                    ? 'bg-[#FF4D4D] text-black'
                    : 'bg-[#00E599] text-black'
                }`}
              >
                <div className="flex items-center gap-2">
                  {simulatorFeedback.error ? (
                    <AlertTriangle className="w-4 h-4 stroke-[2.5] text-black shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 stroke-[2.5] text-black shrink-0" />
                  )}
                  <span>{simulatorFeedback.message}</span>
                </div>
                {simulatorFeedback.rating && (
                  <span className="px-2 py-0.5 bg-black text-[#00E599] rounded font-bold text-[10px] shrink-0">
                    {simulatorFeedback.rating}★ SYNCED
                  </span>
                )}
              </div>
            )}

          </div>

          {/* Test On Real Device Button */}
          <div className="p-4 bg-white border-2 border-black rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-[3px_3px_0px_#000]">
            <div className="space-y-0.5">
              <div className="font-mono font-black text-xs uppercase text-black flex items-center gap-1.5">
                <Send className="w-4 h-4 text-black" />
                <span>Test On Your Actual Physical Device</span>
              </div>
              <p className="text-xs font-mono text-neutral-600">
                Fire a real push notification to your phone shade or PC tray right now.
              </p>
            </div>

            <button
              type="button"
              onClick={handleFireTestNotification}
              disabled={isSendingTest}
              className={`w-full sm:w-auto px-5 py-2.5 border-2 border-black rounded-xl font-mono font-black text-xs uppercase shadow-[2px_2px_0px_#000000] cursor-pointer transition-all flex items-center justify-center gap-2 active:translate-x-px active:translate-y-px shrink-0 ${
                testSent
                  ? 'bg-[#00E599] text-black'
                  : 'bg-[#FDC800] hover:bg-[#ffe066] text-black'
              }`}
            >
              {isSendingTest ? (
                <>
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-black border-t-transparent animate-spin" />
                  <span>DISPATCHING...</span>
                </>
              ) : testSent ? (
                <>
                  <Check className="w-3.5 h-3.5 stroke-3 text-black" />
                  <span>SENT TO DEVICE!</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>SEND TEST NOTIFICATION</span>
                </>
              )}
            </button>
          </div>

          {testSent && (
            <div className="p-3 bg-[#00E599] border-2 border-black rounded-xl font-mono text-xs font-black text-black flex items-center justify-between gap-2 shadow-[2px_2px_0px_#000]">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 stroke-3 text-black shrink-0" />
                <span>Test notification sent! Check your notification tray or lockscreen.</span>
              </div>
            </div>
          )}

          {testError && (
            <div className="p-3 bg-[#FF4D4D] border-2 border-black rounded-xl font-mono text-xs font-black text-black flex items-center gap-2 shadow-[2px_2px_0px_#000]">
              <Info className="w-4 h-4 text-black shrink-0" />
              <span>{testError}</span>
            </div>
          )}
        </section>

        {/* SECTION 5: Simple Bottom FAQ (Why only 2 buttons) */}
        <section className="bg-white border-3 border-black rounded-3xl p-4 sm:p-6 shadow-[5px_5px_0px_#000000] space-y-3">
          <div className="flex items-center gap-2 font-mono text-xs font-black uppercase text-black">
            <HelpCircle className="w-4 h-4 text-black stroke-[2.5]" />
            <span>Why Only 2 Buttons Instead of 5 Separate Star Buttons?</span>
          </div>
          <p className="text-xs font-mono text-neutral-700 leading-relaxed">
            Operating systems (Windows Action Center, Android lockscreen, and Apple iOS) strictly limit notification banners to at most <strong>2 action buttons</strong> so notifications don&apos;t clutter your screen. If an app tries to add 5 separate buttons, the operating system cuts them off or drops them.
          </p>
          <div className="p-3 bg-[#00E599]/15 border-2 border-black rounded-2xl flex items-center gap-2 text-xs font-mono font-bold text-neutral-900">
            <CheckCircle2 className="w-4 h-4 text-black shrink-0" />
            <span>That is why <strong>Mode 1 (Inline Text Reply)</strong> is the universal standard: you can type any score from 1 to 5 and write your journal note in one quick reply without ever opening the app!</span>
          </div>
        </section>

      </main>
    </div>
  );
}
