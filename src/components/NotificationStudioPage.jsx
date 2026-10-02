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
  Shield,
  Clock,
  Flame,
  Info,
  ExternalLink,
  Keyboard,
  Compass,
  HeartHandshake,
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
  ArrowRight,
  Terminal,
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
    name: '1. INLINE NUMBER & NOTE REPLY',
    badge: 'RECOMMENDED • UNIVERSAL',
    badgeColor: '#00E599',
    shortTitle: 'INLINE NUMBER & NOTE',
    description: 'Type 1 to 5 and an optional day summary note directly inside the notification banner (e.g. "5 Finished workout and studied"). Works on Windows and Android.',
    technicalDetails: 'Uses native reply action (OS text input). Captures both your 1-5 numerical score and day journal note in a single submission without opening the app.'
  },
  {
    id: 'polar',
    name: '2. 1★ SHIT VS 5★ HIT BUTTONS',
    badge: '100% 1-TAP PC COMPATIBLE',
    badgeColor: '#FDC800',
    shortTitle: '2-BUTTON POLAR VERDICT',
    description: 'Two physical action buttons for instantaneous 1-tap rating. Fits 100% within Windows Action Center 2-button limit and Android notifications.',
    technicalDetails: 'Windows Action Center strictly enforces a 2-action maximum. This mode guarantees zero button truncation or missing actions.'
  }
];

const ENGINES = [
  {
    id: 'standard',
    name: 'STANDARD VERDICT',
    tag: 'CORE ENGINE',
    icon: Flame,
    color: '#FDC800',
    description: 'Standard daily mood tracking. Rate your day 1-5★ and record your evening diary entry.'
  },
  {
    id: 'spheres',
    name: 'MULTI-SPHERE LIFE',
    tag: '5 LIFE DOMAINS',
    icon: Layers,
    color: '#38BDF8',
    description: 'Life sphere balance engine (Code, Health, Wealth, Mind, Tribe). Captures overall day verdict and domain reflections.'
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
    description: 'Open-ended horizon pause (>30 days). Streaks are shielded & frozen. Focuses on freeform sabbatical chronicle notes.'
  },
  {
    id: 'sanctuary',
    name: 'TRANQUILITY SANCTUARY',
    tag: 'ACUTE 7-14D RESET',
    icon: Heart,
    color: '#00E599',
    description: 'Short-term nervous system reset. Vagus nerve 4-2-6 calming pacing and somatic comfort check-in.'
  }
];

const TIME_PRESETS = [
  { label: '8:00 PM', value: '20:00' },
  { label: '9:00 PM', value: '21:00' },
  { label: '10:00 PM', value: '22:00' },
  { label: '11:00 PM', value: '23:00' }
];

const ENGINE_GUIDES = {
  standard: {
    id: 'standard',
    engineName: 'Standard Daily Verdict',
    badge: '1-5★ Rating + Diary Note',
    badgeColor: '#FDC800',
    summary: 'The simplest way to log your day. Rate your day from 1 to 5 stars, followed by your evening diary reflection.',
    howItReads: 'The app checks the very first character of your message. If it is a number from 1 to 5, that number becomes your daily star rating (1 = Shit, 5 = Hit). Everything after the number is automatically saved as your daily diary entry.',
    whatGetsSaved: '1. Star Rating (1-5★) • 2. Full Diary Note text • 3. Automatic streak and sentiment analysis updates.',
    chips: [
      { label: 'RATING DIGIT (1-5)', color: '#FDC800', textColor: 'text-black', example: '5' },
      { label: 'SPACE / DASH', color: '#E5E7EB', textColor: 'text-neutral-700', example: ' ' },
      { label: 'EVENING JOURNAL NOTE', color: '#00E599', textColor: 'text-black', example: 'Shipped auth engine, hit gym, great focus' }
    ],
    samples: [
      { text: '5 Shipped auth engine, hit gym, great focus', label: '5★ Hit + Full Diary Note', desc: '5★ Peak Rating + Note' },
      { text: '1 Severe headache, missed client deadline, rough day', label: '1★ Shit + Autopsy Note', desc: '1★ Rough Rating + Note' },
      { text: '4 Great day overall, steady progress', label: '4★ Good + Brief Note', desc: '4★ Good Rating + Note' },
      { text: '5', label: 'Quick 5★ Only (No Note)', desc: '5★ Rating without text' }
    ],
    mistakeGuard: {
      invalidExamples: ['7 Great day', 'No rating just text'],
      explanation: 'Ratings must be between 1★ and 5★. If you type a number outside 1-5 (like "7" or "0") or enter text without a number, the safety validator flags it immediately and blocks entry saving.',
      fallbackAction: 'Your entry will not be saved until corrected. This ensures your diary and streak data are never corrupted by accidental typos.'
    }
  },
  spheres: {
    id: 'spheres',
    engineName: 'Multi-Sphere Life Engine',
    badge: 'Multi-Domain Scores + Notes',
    badgeColor: '#38BDF8',
    summary: 'Rate multiple areas of your life (e.g. Work/Code, Health, Mind/Tribe) with a single string of numbers.',
    howItReads: 'The app reads the starting sequence of digits (e.g. "321" or "453"). Each digit is assigned in order to one of your active life domains (1st digit = Domain 1, 2nd digit = Domain 2, etc.). The app calculates your overall day verdict by averaging the scores, and saves any remaining text as your diary note.',
    whatGetsSaved: '1. Individual Sphere breakdown (each 1-5★) • 2. Composite average day score • 3. Diary note reflection.',
    chips: [
      { label: 'DOMAIN DIGITS (1-5 EACH)', color: '#38BDF8', textColor: 'text-black', example: '321' },
      { label: 'SPACE / DASH', color: '#E5E7EB', textColor: 'text-neutral-700', example: ' ' },
      { label: 'DOMAIN REFLECTIONS & NOTES', color: '#00E599', textColor: 'text-black', example: 'Work sprint done, gym felt heavy, rested early' }
    ],
    samples: [
      { text: '432 Work sprint done (4★), gym was solid (3★), mind exhausted (2★)', label: '3-Sphere Balanced Entry', desc: 'Spheres: 4★, 3★, 2★ (Avg: 3★)' },
      { text: '555 Crushed every single life domain today!', label: '555 Perfect Flow State', desc: 'Spheres: 5★, 5★, 5★ (Avg: 5★)' },
      { text: '212 Rough day across work and health', label: '212 Triage State', desc: 'Spheres: 2★, 1★, 2★ (Avg: 1.7★)' }
    ],
    mistakeGuard: {
      invalidExamples: ['89 Work was fine', '302 Gym was bad'],
      explanation: 'Every domain score must be between 1★ and 5★. If any digit is outside this range (e.g. "8", "9", or "0"), the safety validator rejects the message immediately.',
      fallbackAction: 'The app shows a clear syntax error notice and prevents corrupt domain logs from entering your database.'
    }
  },
  'non-negotiables': {
    id: 'non-negotiables',
    engineName: 'Non-Negotiable Habit Anchors',
    badge: 'Binary 1s & 0s + Notes',
    badgeColor: '#FF9500',
    summary: 'Audit your daily non-negotiable habits using binary numbers: 1 for Completed and 0 for Skipped.',
    howItReads: 'The app checks the starting digits for 1s and 0s (e.g. "101" or "111"). Each digit maps directly to one of your daily anchor habits in order (1 = Done, 0 = Skipped). The completion percentage determines your day rating, and trailing text becomes your diary note.',
    whatGetsSaved: '1. Individual habit checkmarks • 2. Completion score (e.g. 2/3 done = 3.3★) • 3. Evening note.',
    chips: [
      { label: 'BINARY DIGITS (1=DONE, 0=SKIP)', color: '#FF9500', textColor: 'text-black', example: '101' },
      { label: 'SPACE / DASH', color: '#E5E7EB', textColor: 'text-neutral-700', example: ' ' },
      { label: 'HABIT LOG & SUMMARY', color: '#00E599', textColor: 'text-black', example: 'Crushed workout and deep work, skipped cold shower' }
    ],
    samples: [
      { text: '101 Crushed workout and deep work, skipped cold shower', label: '101 (2 of 3 Done)', desc: '2/3 Habits Done (3.3★)' },
      { text: '111 100% execution on all 3 non-negotiables today!', label: '111 (All Done 5★)', desc: '3/3 Habits Done (5.0★)' },
      { text: '010 Only managed morning meditation today', label: '010 (1 of 3 Done)', desc: '1/3 Habits Done (1.7★)' }
    ],
    mistakeGuard: {
      invalidExamples: ['234 Crushed workout', 'Finished gym'],
      explanation: 'Habits are strictly binary. Only digits 1 and 0 are accepted at the start. Typing numbers like "2" or "3" will be flagged as an invalid format.',
      fallbackAction: 'The entry is blocked until valid binary digits are provided, protecting your streak and habit history.'
    }
  },
  sabbatical: {
    id: 'sabbatical',
    engineName: 'Sabbatical Stasis Engine',
    badge: 'Freeform Reflections • No Scores',
    badgeColor: '#00D4FF',
    summary: 'Macro open-ended life transition. Streaks are shielded and frozen indefinitely. Capture reflections without scoring pressure.',
    howItReads: 'In Sabbatical mode, ratings and numbers are intentionally disabled. Anything you type is captured directly as a freeform Sabbatical Chronicle entry. No numbers, codes, or formats are required.',
    whatGetsSaved: '1. Sabbatical Chronicle journal entry • 2. Preserved shielded streak • 3. Open horizon timeline.',
    chips: [
      { label: 'FREEFORM CHRONICLE TEXT', color: '#00D4FF', textColor: 'text-black', example: 'Spent the morning writing by the river, completely unplugged from work' }
    ],
    samples: [
      { text: 'Spent the morning writing by the river, completely unplugged from work', label: 'Writing Reflection', desc: 'Chronicle Saved • Streaks Frozen' },
      { text: 'Long walk through the forest. Feeling deeply restored and grounded.', label: 'Nature Walk Chronicle', desc: 'Chronicle Saved • Streaks Frozen' }
    ],
    mistakeGuard: {
      invalidExamples: ['(Empty message)'],
      explanation: 'Sabbatical mode accepts any text reflection. Only completely empty submissions are rejected.',
      fallbackAction: 'Ensures accidental empty taps do not create blank diary entries.'
    }
  },
  sanctuary: {
    id: 'sanctuary',
    engineName: 'Tranquility Sanctuary',
    badge: 'Somatic Check-In • Vagus Nerve Recovery',
    badgeColor: '#00E599',
    summary: 'Acute 7 to 14-day nervous system reset. Focuses on vagus nerve recovery and somatic comfort check-ins.',
    howItReads: 'During sanctuary, daily performance ratings are suspended. Share a grounding note, breathing exercise check-in, or recovery reflection. No numerical rating is needed.',
    whatGetsSaved: '1. Somatic grounding log • 2. Sanctuary timeline progress (Day X of 7) • 3. Restored calm state.',
    chips: [
      { label: 'SOMATIC CHECK-IN / GROUNDING NOTE', color: '#00E599', textColor: 'text-black', example: 'Practiced 4-2-6 breathing for 10 minutes, anxiety eased, rested' }
    ],
    samples: [
      { text: 'Practiced 4-2-6 breathing for 10 minutes, anxiety eased, rested well', label: 'Vagus Breathing Check-In', desc: 'Grounding Log Saved' },
      { text: 'Walked barefoot on grass, took warm bath, nervous system calm', label: 'Somatic Grounding Note', desc: 'Grounding Log Saved' }
    ],
    mistakeGuard: {
      invalidExamples: ['(Empty message)'],
      explanation: 'Sanctuary accepts any calm reflection or check-in. Numerical scores are omitted by design.',
      fallbackAction: 'Empty submissions are caught to avoid blank logs.'
    }
  }
};

const DEFAULT_PRESET_TEXTS = {
  standard: '5 Shipped auth feature, crushed gym, feeling unstoppable',
  spheres: '321 Code went great, workout felt heavy, reading pending',
  'non-negotiables': '101 Crushed workout and deep work, skipped cold shower',
  sabbatical: 'Spent the afternoon writing by the river, completely unplugged from work',
  sanctuary: 'Practiced 4-2-6 vagus nerve breathing for 10 minutes, anxiety eased, deeply rested'
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

  const handleTimeChange = (newTime) => {
    setReminderTimeVal(newTime);
    setReminderTime(newTime);
    setReminderTimesState(getReminderTimes());
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
  const activeGuide = ENGINE_GUIDES[selectedEngine] || ENGINE_GUIDES.standard;
  const engineContent = getEngineNotificationContent(selectedEngine);

  return (
    <div className="min-h-screen bg-[#FFFDF8] text-black pb-20 selection:bg-[#FDC800]">
      {/* Sticky Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#FFFDF8]/95 backdrop-blur-md border-b-3 border-black px-3.5 sm:px-6 py-3.5 shadow-[0_2px_0px_#000000]">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onBack}
            className="px-3 py-2 bg-white hover:bg-neutral-100 border-2 border-black rounded-xl font-mono font-black text-xs uppercase shadow-[2px_2px_0px_#000000] cursor-pointer flex items-center gap-1.5 active:translate-x-px active:translate-y-px transition-all shrink-0"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
            <span>BACK</span>
          </button>

          <div className="flex items-center gap-2 flex-wrap justify-end">
            <span className="hidden sm:inline-flex px-2.5 py-1 bg-[#00E599] border-2 border-black rounded-lg font-mono font-black text-[10px] uppercase shadow-[2px_2px_0px_#000000]">
              ZERO-PII OFFLINE SCHEDULER
            </span>
            <span className="px-2.5 py-1 bg-black text-[#FDC800] border-2 border-black rounded-lg font-mono font-black text-[10px] uppercase flex items-center gap-1 shadow-[2px_2px_0px_#000000]">
              <Bell className="w-3 h-3 text-[#FDC800]" />
              <span>{permissionState === 'granted' ? 'NOTIFICATIONS ARMED' : 'PERMISSION NEEDED'}</span>
            </span>
          </div>
        </div>
      </header>

      {/* Main Studio Workspace Container */}
      <main className="max-w-5xl mx-auto px-3.5 sm:px-6 pt-6 sm:pt-8 space-y-6 sm:space-y-8">
        
        {/* Hero Section */}
        <section className="bg-white border-3 border-black rounded-3xl p-4 sm:p-7 shadow-[6px_6px_0px_#000000] space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 bg-[#FDC800] border-2 border-black rounded-md font-mono font-black text-[10px] uppercase shadow-[1.5px_1.5px_0px_#000000]">
              OS NOTIFICATION ARCHITECTURE
            </span>
            <span className="px-2 py-0.5 bg-neutral-100 border border-black rounded font-mono font-black text-[10px] uppercase text-neutral-700">
              WINDOWS 11 • ANDROID PWA
            </span>
          </div>
          <h1 className="font-display font-black text-2xl sm:text-4xl uppercase tracking-tight text-black">
            Notification Studio &amp; Preview Lab
          </h1>
          <p className="text-xs sm:text-sm font-mono text-neutral-700 max-w-3xl leading-relaxed">
            Configure zero-app-open daily verdicts. Log your daily rating and day journal note directly from your Windows Action Center or smartphone lockscreen shade.
          </p>

          {/* Quick Permission Bar (If not granted) */}
          {permissionState !== 'granted' && (
            <div className="mt-3 p-3 bg-[#FFFDF5] border-2 border-black rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-[3px_3px_0px_#000000]">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-neutral-800">
                <Info className="w-4 h-4 text-black shrink-0" />
                <span>Browser notification permission is currently: <strong>{permissionState.toUpperCase()}</strong></span>
              </div>
              <button
                type="button"
                onClick={handleRequestPermission}
                className="w-full sm:w-auto px-4 py-2 bg-[#00E599] hover:bg-[#00c785] border-2 border-black rounded-xl font-mono font-black text-xs uppercase cursor-pointer shadow-[2px_2px_0px_#000000] active:translate-x-px active:translate-y-px transition-all"
              >
                GRANT PERMISSION
              </button>
            </div>
          )}
        </section>

        {/* Section 1: Notification Mode Selector (The 2 Reliable Tested Modes) */}
        <section className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="font-display font-black text-lg sm:text-xl uppercase tracking-tight text-black flex items-center gap-2">
                <Sliders className="w-5 h-5 text-black" />
                <span>1. Select Notification Action Mode</span>
              </h2>
              <p className="text-xs font-mono text-neutral-600">
                Choose how notifications interact with your operating system shade.
              </p>
            </div>
            <span className="font-mono text-[10px] bg-black text-[#00E599] px-2.5 py-1 rounded-lg font-black self-start sm:self-auto">
              ACTIVE: {bannerMode === 'inline' ? 'INLINE STAR & NOTE' : '2-BUTTON POLAR'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {NOTIFICATION_MODES.map((mode) => {
              const isSelected = bannerMode === mode.id;
              return (
                <div
                  key={mode.id}
                  onClick={() => handleModeSelect(mode.id)}
                  className={`p-4 sm:p-5 rounded-2xl border-3 border-black cursor-pointer transition-all flex flex-col justify-between gap-4 ${
                    isSelected
                      ? 'bg-[#FFFDF5] shadow-[6px_6px_0px_#000000] ring-2 ring-black'
                      : 'bg-white hover:bg-neutral-50 shadow-[3px_3px_0px_#000000]'
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
                      {isSelected ? (
                        <span className="px-2 py-0.5 bg-black text-[#00E599] rounded font-mono font-black text-[10px] uppercase flex items-center gap-1">
                          <Check className="w-3 h-3 stroke-3 text-[#00E599]" />
                          <span>SELECTED</span>
                        </span>
                      ) : (
                        <span className="font-mono text-[10px] text-neutral-400 font-bold uppercase">
                          TAP TO SELECT
                        </span>
                      )}
                    </div>

                    <h3 className="font-display font-black text-base uppercase tracking-tight text-black">
                      {mode.name}
                    </h3>
                    <p className="text-xs font-mono text-neutral-700 leading-snug">
                      {mode.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-black/15 text-[11px] font-mono text-neutral-500 leading-tight">
                    {mode.technicalDetails}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Transparent Cross-Platform OS Reality & Architecture */}
          <div className="bg-white border-3 border-black rounded-3xl p-4 sm:p-6 shadow-[5px_5px_0px_#000000] space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#FDC800] border-2 border-black flex items-center justify-center shrink-0 shadow-[2px_2px_0px_#000]">
                <HelpCircle className="w-5 h-5 text-black stroke-[2.5]" />
              </div>
              <div>
                <h3 className="font-display font-black text-base sm:text-lg uppercase tracking-tight text-black">
                  Why Can&apos;t We Have All 5 Separate Buttons (1★ 2★ 3★ 4★ 5★)?
                </h3>
                <p className="text-xs font-mono text-neutral-600 mt-0.5">
                  Operating system architectural limits across Windows, Android, Apple iOS, and Linux.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* Windows */}
              <div className="p-3.5 bg-[#FFFDF5] border-2 border-black rounded-2xl space-y-1.5 shadow-[2px_2px_0px_#000]">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-black text-xs uppercase flex items-center gap-1.5 text-black">
                    <Monitor className="w-3.5 h-3.5 text-black" />
                    <span>Windows 10 &amp; 11</span>
                  </span>
                  <span className="px-2 py-0.5 bg-[#FF4D4D] text-black font-mono font-black text-[9px] rounded border border-black uppercase">
                    Max 2 Buttons
                  </span>
                </div>
                <p className="text-[11px] font-mono text-neutral-700 leading-snug">
                  Windows Action Center strictly enforces an architectural ceiling of <strong>2 action buttons</strong> per toast. Supplying 5 buttons causes Windows to silently discard buttons 3, 4, and 5 or fail toast rendering entirely.
                </p>
              </div>

              {/* Android */}
              <div className="p-3.5 bg-[#FFFDF5] border-2 border-black rounded-2xl space-y-1.5 shadow-[2px_2px_0px_#000]">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-black text-xs uppercase flex items-center gap-1.5 text-black">
                    <Smartphone className="w-3.5 h-3.5 text-black" />
                    <span>Android Shade</span>
                  </span>
                  <span className="px-2 py-0.5 bg-[#FF4D4D] text-black font-mono font-black text-[9px] rounded border border-black uppercase">
                    Max 2-3 Actions
                  </span>
                </div>
                <p className="text-[11px] font-mono text-neutral-700 leading-snug">
                  Android restricts notification actions to 2 or 3 slots. The OS reserves remaining slots for system actions (snooze, settings, channels). A 5-button row gets truncated or hidden in an inaccessible sub-menu.
                </p>
              </div>

              {/* Apple iOS & macOS */}
              <div className="p-3.5 bg-[#FFFDF5] border-2 border-black rounded-2xl space-y-1.5 shadow-[2px_2px_0px_#000]">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-black text-xs uppercase flex items-center gap-1.5 text-black">
                    <Shield className="w-3.5 h-3.5 text-black" />
                    <span>Apple iOS &amp; Safari</span>
                  </span>
                  <span className="px-2 py-0.5 bg-[#FF4D4D] text-black font-mono font-black text-[9px] rounded border border-black uppercase">
                    Strict 2 Buttons
                  </span>
                </div>
                <p className="text-[11px] font-mono text-neutral-700 leading-snug">
                  Apple Push Notification service (APNs) and WebKit Web Push standards cap notification actions at <strong>2 buttons</strong> per category. Extra actions are rejected at the WebKit push registration layer.
                </p>
              </div>

              {/* Linux */}
              <div className="p-3.5 bg-[#FFFDF5] border-2 border-black rounded-2xl space-y-1.5 shadow-[2px_2px_0px_#000]">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-black text-xs uppercase flex items-center gap-1.5 text-black">
                    <Sliders className="w-3.5 h-3.5 text-black" />
                    <span>Linux Desktops</span>
                  </span>
                  <span className="px-2 py-0.5 bg-[#FDC800] text-black font-mono font-black text-[9px] rounded border border-black uppercase">
                    Variable Limits
                  </span>
                </div>
                <p className="text-[11px] font-mono text-neutral-700 leading-snug">
                  Under the FreeDesktop.org notification spec (GNOME, KDE, XFCE), notification daemons display at most 2 prominent actions. Additional actions collapse unpredictably or are ignored by minimal window managers.
                </p>
              </div>
            </div>

            {/* Why our 2 modes are superior */}
            <div className="p-3.5 bg-[#00E599]/15 border-2 border-black rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-[2px_2px_0px_#000]">
              <div className="space-y-0.5">
                <div className="font-mono font-black text-xs uppercase text-black flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-black stroke-[2.5]" />
                  <span>The Universal Solution: Inline Reply + Polar Fallback</span>
                </div>
                <p className="text-xs font-mono text-neutral-800 leading-snug">
                  <strong>Mode 1 (Inline Number &amp; Note)</strong> solves this universally: type any rating (1-5★) and a journal note in a single field. <strong>Mode 2 (Polar 1★ vs 5★)</strong> provides 100% reliable 1-tap buttons within every OS limit.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: 5-Engine Notification Adaptation Showcase */}
        <section className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <div>
              <h2 className="font-display font-black text-lg sm:text-xl uppercase tracking-tight text-black flex items-center gap-2">
                <Compass className="w-5 h-5 text-black" />
                <span>2. Engine-Aware Content Adapter</span>
              </h2>
              <p className="text-xs font-mono text-neutral-600">
                Preview how notification prompts adapt dynamically to whichever behavioral engine is active.
              </p>
            </div>
            <span className="font-mono text-[10px] bg-neutral-200 border border-black px-2 py-0.5 rounded font-black self-start sm:self-auto">
              5 ENGINES READY
            </span>
          </div>

          {/* Engine Selector Pills */}
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

          {/* Active Engine Summary Pill */}
          <div className="p-3 bg-white border-2 border-black rounded-xl flex items-center justify-between gap-2 shadow-[2px_2px_0px_#000000]">
            <div className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full border border-black shrink-0"
                style={{ backgroundColor: activeEngineObj.color }}
              />
              <span className="font-mono font-black text-xs uppercase">
                {activeEngineObj.name}: {activeEngineObj.description}
              </span>
            </div>
            <span className="font-mono text-[10px] bg-neutral-100 border border-black px-2 py-0.5 rounded font-bold text-neutral-700 shrink-0">
              {activeEngineObj.tag}
            </span>
          </div>
        </section>

        {/* Section 2.5: Interactive Engine Reply Anatomy & Visual Guide */}
        <section className="bg-white border-3 border-black rounded-3xl p-4 sm:p-7 shadow-[6px_6px_0px_#000000] space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span
                  className="px-2.5 py-0.5 rounded border border-black font-mono font-black text-[10px] uppercase shadow-[1.5px_1.5px_0px_#000]"
                  style={{ backgroundColor: activeGuide.badgeColor }}
                >
                  {activeGuide.badge}
                </span>
                <span className="font-mono text-[10px] bg-neutral-100 border border-black px-2 py-0.5 rounded font-black text-neutral-700">
                  VISUAL SYNTAX GUIDE
                </span>
              </div>
              <h2 className="font-display font-black text-lg sm:text-2xl uppercase tracking-tight text-black flex items-center gap-2">
                <Terminal className="w-5 h-5 text-black" />
                <span>How To Reply For: {activeGuide.engineName}</span>
              </h2>
              <p className="text-xs sm:text-sm font-mono text-neutral-700 mt-1 max-w-2xl leading-relaxed">
                {activeGuide.summary}
              </p>
            </div>

            <span className="font-mono text-[10px] bg-black text-[#FDC800] px-2.5 py-1 rounded-lg font-black self-start sm:self-auto shrink-0">
              ACTIVE ENGINE: {selectedEngine.toUpperCase()}
            </span>
          </div>

          {/* Visual Message Anatomy Chips */}
          <div className="space-y-2">
            <div className="font-mono font-black text-[11px] uppercase text-neutral-600 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-black" />
              <span>Message Anatomy Breakdown:</span>
            </div>
            <div className="p-3.5 sm:p-4 bg-[#FFFDF5] border-2 border-black rounded-2xl flex flex-col sm:flex-row sm:items-center gap-2 flex-wrap shadow-[3px_3px_0px_#000]">
              {activeGuide.chips.map((chip, idx) => (
                <React.Fragment key={idx}>
                  <div
                    className={`px-3 py-1.5 rounded-xl border-2 border-black font-mono font-black text-xs uppercase shadow-[2px_2px_0px_#000] flex items-center gap-2 ${chip.textColor}`}
                    style={{ backgroundColor: chip.color }}
                  >
                    <span>{chip.label}</span>
                    <span className="px-1.5 py-0.5 bg-black text-white text-[10px] rounded font-bold">
                      e.g. &quot;{chip.example}&quot;
                    </span>
                  </div>
                  {idx < activeGuide.chips.length - 1 && (
                    <span className="font-mono font-black text-sm text-neutral-400 self-center hidden sm:inline">
                      +
                    </span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Google-Grade Plain English Explanation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 bg-neutral-50 border-2 border-black rounded-2xl space-y-1 shadow-[2px_2px_0px_#000]">
              <div className="font-mono font-black text-xs uppercase text-black flex items-center gap-1.5">
                <Info className="w-4 h-4 text-black" />
                <span>How The App Reads Your Reply:</span>
              </div>
              <p className="text-xs font-mono text-neutral-700 leading-relaxed">
                {activeGuide.howItReads}
              </p>
            </div>

            <div className="p-3.5 bg-neutral-50 border-2 border-black rounded-2xl space-y-1 shadow-[2px_2px_0px_#000]">
              <div className="font-mono font-black text-xs uppercase text-black flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-black" />
                <span>What Gets Saved To Your Diary:</span>
              </div>
              <p className="text-xs font-mono text-neutral-700 leading-relaxed">
                {activeGuide.whatGetsSaved}
              </p>
            </div>
          </div>

          {/* Interactive 1-Tap Sample Chips (Pre-fills simulator) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-1">
              <span className="font-mono font-black text-[11px] uppercase text-neutral-600 flex items-center gap-1.5">
                <Keyboard className="w-3.5 h-3.5 text-black" />
                <span>Click To Test Sample Replies in Simulator:</span>
              </span>
              <span className="font-mono text-[10px] text-neutral-500">
                Tap any button to auto-fill input below
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {activeGuide.samples.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setInlineInputVal(sample.text);
                    soundEngine.playClick();
                  }}
                  className="p-3 bg-[#FFFDF5] hover:bg-[#FDC800] border-2 border-black rounded-2xl font-mono text-left cursor-pointer transition-all shadow-[2px_2px_0px_#000] active:translate-x-px active:translate-y-px group flex flex-col justify-between gap-2"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-black text-xs uppercase text-black group-hover:text-black">
                        {sample.label}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-black shrink-0 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                    <div className="text-[11px] text-neutral-700 line-clamp-2 italic group-hover:text-black">
                      &quot;{sample.text}&quot;
                    </div>
                  </div>
                  <div className="pt-1.5 border-t border-black/15 text-[10px] font-bold text-neutral-500 group-hover:text-black">
                    {sample.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Built-in Mistake Guardrail & Error Fallback Safety Box */}
          <div className="p-4 bg-[#FFFDF5] border-2 border-black rounded-2xl space-y-2 shadow-[3px_3px_0px_#000]">
            <div className="flex items-center gap-2 font-mono text-xs font-black uppercase text-black">
              <Shield className="w-4 h-4 text-black stroke-[2.5]" />
              <span>Mistake Guardrail &amp; Error Safety Net:</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-black text-neutral-500">Common Typo Examples:</span>
                <div className="flex items-center gap-2 flex-wrap">
                  {activeGuide.mistakeGuard.invalidExamples.map((ex, i) => (
                    <span key={i} className="px-2 py-0.5 bg-[#FF4D4D]/20 text-neutral-800 border border-black rounded font-bold text-[11px]">
                      &quot;{ex}&quot;
                    </span>
                  ))}
                </div>
                <p className="text-[11px] text-neutral-700 leading-snug">
                  {activeGuide.mistakeGuard.explanation}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] uppercase font-black text-[#00E599] bg-black px-1.5 py-0.2 rounded">
                  Your Data Protection:
                </span>
                <p className="text-[11px] text-neutral-700 leading-snug">
                  {activeGuide.mistakeGuard.fallbackAction}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Interactive Dual-Device Simulator (Windows Toast vs Smartphone Shade) */}
        <section className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="font-display font-black text-lg sm:text-xl uppercase tracking-tight text-black flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-black" />
                <span>3. Live Interactive Device Simulator</span>
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
                <span>SMARTPHONE SHADE</span>
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
                <span>WINDOWS TOAST</span>
              </button>
            </div>
          </div>

          {/* The Simulator Canvas */}
          <div className="p-4 sm:p-7 rounded-3xl border-3 border-black bg-[#1C1814] text-white shadow-[6px_6px_0px_#000000] space-y-4">
            
            {/* Simulator Header / Meta */}
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
                    {simulatorDevice === 'windows' ? 'Windows 11 Action Center' : 'Android Notification Shade'} • Now
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
                              <span>Syntax Error Detected • Entry Will Not Be Recorded</span>
                            </div>
                            <span className="px-1.5 py-0.5 bg-black text-white text-[9px] rounded font-bold">
                              ENTRY BLOCKED
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
                              <span>Restore Pre-Made Example (&quot;{DEFAULT_PRESET_TEXTS[selectedEngine]}&quot;)</span>
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
                              VALID SYNTAX • READY TO SAVE
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                            {/* Numerical / Anchor Part */}
                            <div className="p-2.5 bg-white border border-black rounded-xl space-y-1">
                              <span className="text-[10px] font-black uppercase text-neutral-500 block">
                                1. Rating / Execution Value:
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
                                    {currentValidation.parsed.rating === 5 ? '5★ Hit (Peak Execution)' : currentValidation.parsed.rating === 1 ? '1★ Shit (Rough Day)' : `${currentValidation.parsed.rating}★ Daily Mood Verdict`}
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
                                2. Saved Diary Note:
                              </span>
                              <div className="font-bold italic text-neutral-800 line-clamp-2">
                                &quot;{currentValidation.parsed.notes || '(No text note entered — rating only)'}&quot;
                              </div>
                            </div>
                          </div>

                          <div className="text-[10px] text-neutral-600 flex items-center justify-between flex-wrap gap-1 pt-1">
                            <span className="flex items-center gap-1">
                              <Lightbulb className="w-3 h-3 text-black shrink-0" />
                              <span>You can edit or type anything in this input to test your custom message format.</span>
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
        </section>

        {/* Section 4: Live Instant Push Test & Schedule Setting */}
        <section className="bg-white border-3 border-black rounded-3xl p-4 sm:p-7 shadow-[6px_6px_0px_#000000] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-display font-black text-lg sm:text-xl uppercase tracking-tight text-black flex items-center gap-2">
                <Send className="w-5 h-5 text-black" />
                <span>4. Test On Your Actual Physical Device</span>
              </h2>
              <p className="text-xs font-mono text-neutral-600">
                Fire a real push notification to your Windows tray or smartphone shade right now.
              </p>
            </div>

            <button
              type="button"
              onClick={handleFireTestNotification}
              disabled={isSendingTest}
              className={`w-full sm:w-auto px-6 py-3.5 border-2 border-black rounded-xl font-mono font-black text-xs uppercase shadow-[3px_3px_0px_#000000] cursor-pointer transition-all flex items-center justify-center gap-2 active:translate-x-px active:translate-y-px ${
                testSent
                  ? 'bg-[#00E599] text-black'
                  : 'bg-[#FDC800] hover:bg-[#ffe066] text-black'
              }`}
            >
              {isSendingTest ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-black border-t-transparent animate-spin" />
                  <span>DISPATCHING TO OS TRAY...</span>
                </>
              ) : testSent ? (
                <>
                  <Check className="w-4 h-4 stroke-3 text-black" />
                  <span>NOTIFICATION DISPATCHED!</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 stroke-[2.5]" />
                  <span>SEND TEST NOTIFICATION TO DEVICE</span>
                </>
              )}
            </button>
          </div>

          {testSent && (
            <div className="p-3 bg-[#00E599] border-2 border-black rounded-xl font-mono text-xs font-black text-black flex items-center justify-between gap-2 shadow-[2px_2px_0px_#000]">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 stroke-3 text-black shrink-0" />
                <span>Test notification sent with [{bannerMode.toUpperCase()}] mode and [{selectedEngine.toUpperCase()}] engine! Check your notification shade.</span>
              </div>
              <span className="px-2 py-0.5 bg-black text-white rounded text-[10px] uppercase font-bold shrink-0">
                CHECK SHADE
              </span>
            </div>
          )}

          {testError && (
            <div className="p-3 bg-[#FF4D4D] border-2 border-black rounded-xl font-mono text-xs font-black text-black flex items-center gap-2 shadow-[2px_2px_0px_#000]">
              <Info className="w-4 h-4 text-black shrink-0" />
              <span>{testError}</span>
            </div>
          )}

          {/* Multi-Pump Reminder Scheduler & Stand-Down Setting */}
          <div className="pt-4 border-t-2 border-black/15 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-black" />
                <span className="font-mono font-black text-xs uppercase text-neutral-800">
                  Multi-Pump Daily Reminder Slots (Up to 5):
                </span>
              </div>
              {todayRated ? (
                <div className="flex items-center gap-1 font-mono text-[10px] font-black bg-[#00E599] text-black px-2 py-0.5 rounded border border-black">
                  <VolumeX className="w-3.5 h-3.5 text-black" />
                  <span>STAND-DOWN ACTIVE: TODAY RECORDED • ALARMS MUTED</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 font-mono text-[10px] font-black bg-[#FDC800] text-black px-2 py-0.5 rounded border border-black">
                  <Volume2 className="w-3.5 h-3.5 text-black" />
                  <span>PUMP ARMED: NEXT SLOT ACTIVE</span>
                </div>
              )}
            </div>

            {/* Configured Slots List */}
            <div className="flex items-center gap-2 flex-wrap">
              {reminderTimes.map((timeStr) => (
                <div
                  key={timeStr}
                  className="px-3 py-1.5 bg-[#FFFDF5] border-2 border-black rounded-xl font-mono text-xs font-black flex items-center gap-2 shadow-[2px_2px_0px_#000]"
                >
                  <Clock className="w-3 h-3 text-black/70" />
                  <span>{timeStr}</span>
                  {reminderTimes.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveSlot(timeStr)}
                      className="p-1 hover:bg-[#FF4D4D] hover:text-white rounded border border-transparent hover:border-black cursor-pointer transition-all"
                      title="Remove this slot"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Add New Slot Input */}
            {reminderTimes.length < 5 && (
              <div className="flex items-center gap-2 flex-wrap">
                <input
                  type="time"
                  value={newReminderTime}
                  onChange={(e) => setNewReminderTime(e.target.value)}
                  className="px-3 py-1.5 bg-neutral-50 border-2 border-black rounded-xl font-mono font-black text-xs text-black focus:outline-none focus:ring-2 focus:ring-[#FDC800] shadow-[1.5px_1.5px_0px_#000]"
                />
                <button
                  type="button"
                  onClick={handleAddSlot}
                  className="px-3.5 py-1.5 bg-[#00E599] hover:bg-[#00c785] border-2 border-black rounded-xl font-mono font-black text-xs text-black uppercase cursor-pointer shadow-[2px_2px_0px_#000] active:translate-x-px active:translate-y-px flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5 stroke-3" />
                  <span>ADD SLOT</span>
                </button>
              </div>
            )}

            {/* Quick Multi-Pump Presets */}
            <div className="pt-2 border-t border-black/10 space-y-1.5">
              <span className="font-mono text-[10px] font-black uppercase text-neutral-600">
                QUICK CADENCE PRESETS:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleApplyPreset(['21:00'])}
                  className="p-2 bg-neutral-50 hover:bg-neutral-100 border border-black rounded-xl font-mono text-xs font-black text-left cursor-pointer transition-all shadow-[1px_1px_0px_#000]"
                >
                  <div className="text-[11px] font-black text-black">1. Standard Evening (9:00 PM)</div>
                  <div className="text-[9px] text-neutral-600">Single slot reminder</div>
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPreset(['14:00', '20:00', '22:30'])}
                  className="p-2 bg-neutral-50 hover:bg-neutral-100 border border-black rounded-xl font-mono text-xs font-black text-left cursor-pointer transition-all shadow-[1px_1px_0px_#000]"
                >
                  <div className="text-[11px] font-black text-black">2. 3x Daily Pump</div>
                  <div className="text-[9px] text-neutral-600">2:00 PM • 8:00 PM • 10:30 PM</div>
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPreset(['20:00', '21:00', '22:00', '23:00'])}
                  className="p-2 bg-neutral-50 hover:bg-neutral-100 border border-black rounded-xl font-mono text-xs font-black text-left cursor-pointer transition-all shadow-[1px_1px_0px_#000]"
                >
                  <div className="text-[11px] font-black text-black">3. Evening Blitz (Hourly)</div>
                  <div className="text-[9px] text-neutral-600">8 PM • 9 PM • 10 PM • 11 PM</div>
                </button>
              </div>
            </div>
          </div>

        </section>

      </main>
    </div>
  );
}
