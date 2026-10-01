import React, { useState, useEffect } from 'react';
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
  Layers
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
  },
  {
    id: 'peer',
    name: 'PEER ACCOUNTABILITY',
    tag: 'P2P MIRROR',
    icon: HeartHandshake,
    color: '#A78BFA',
    description: 'Direct P2P mutual accountability. Logging daily keeps your mutual partner streak shield alive.'
  }
];

const TIME_PRESETS = [
  { label: '8:00 PM', value: '20:00' },
  { label: '9:00 PM', value: '21:00' },
  { label: '10:00 PM', value: '22:00' },
  { label: '11:00 PM', value: '23:00' }
];

export default function NotificationStudioPage({ onBack, entries = {}, todayStr = '' }) {
  const [bannerMode, setBannerModeState] = useState(() => getNotificationBannerMode());
  const [selectedEngine, setSelectedEngine] = useState(() => detectActiveEngine());
  const [simulatorDevice, setSimulatorDevice] = useState('phone'); // 'phone' | 'windows'
  const [reminderTimeVal, setReminderTimeVal] = useState(() => getReminderTime());
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testSent, setTestSent] = useState(false);
  const [testError, setTestError] = useState(null);
  const [permissionState, setPermissionState] = useState(() => getNotificationPermission());
  const [inlineInputVal, setInlineInputVal] = useState('');
  const [simulatorFeedback, setSimulatorFeedback] = useState(null);

  // Sync mode changes with localStorage & system
  const handleModeSelect = (modeId) => {
    setBannerModeState(modeId);
    setNotificationBannerMode(modeId);
    soundEngine.playClick();
  };

  const handleTimeChange = (newTime) => {
    setReminderTimeVal(newTime);
    setReminderTime(newTime);
    soundEngine.playClick();
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
  const handleSimulatorSubmit = (simRating, simNotes = '') => {
    try {
      if (simRating) playMood(simRating);
      soundEngine.playSuccess();
    } catch (e) {
      soundEngine.playClick();
    }

    const detail = {
      rating: simRating,
      notes: simNotes || undefined,
      engine: selectedEngine,
      timestamp: new Date().toISOString()
    };

    setSimulatorFeedback({
      rating: simRating,
      notes: simNotes,
      engine: selectedEngine,
      message: simRating
        ? `RECORDED ${simRating}★ ${simNotes ? `WITH NOTE: "${simNotes}"` : ''} TO TODAY'S DIARY`
        : `SAVED DIARY NOTE: "${simNotes}" (ZERO APP OPEN NEEDED)`
    });

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('remote_notification_verdict', { detail }));
    }

    setTimeout(() => setSimulatorFeedback(null), 5500);
  };

  const activeEngineObj = ENGINES.find((e) => e.id === selectedEngine) || ENGINES[0];
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

          {/* Transparent OS Limit Reality Callout */}
          <div className="p-3.5 sm:p-4 bg-[#FDC800] border-2 border-black rounded-2xl shadow-[3px_3px_0px_#000000] text-black space-y-1.5">
            <div className="flex items-center gap-2 font-mono text-xs font-black uppercase">
              <Shield className="w-4 h-4 stroke-[2.5]" />
              <span>Why 5 Separate Buttons Were Retired</span>
            </div>
            <p className="text-xs font-mono text-black/85 leading-relaxed">
              Operating system notification limits: Windows Action Center strictly caps notifications to <strong>2 action buttons</strong>. On Android smartphones, system controls (settings / unsubscribe) consume slots, causing 5 buttons to be cut off with only the first two visible. <strong>Mode 1 (Inline Number &amp; Note)</strong> is the robust universal standard because it lets you enter any score (1-5★) plus notes in a single field.
            </p>
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
                <div className="space-y-2">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const raw = inlineInputVal.trim();
                      if (!raw) return;

                      let simRating = null;
                      let simNotes = '';

                      const match = raw.match(/^([1-5])(?:\s*[-:,.]?\s*(.*))?$/s);
                      if (match) {
                        simRating = parseInt(match[1], 10);
                        simNotes = match[2]?.trim() || '';
                      } else {
                        // Word match fallback
                        const lower = raw.toLowerCase();
                        if (lower.startsWith('shit') || lower.startsWith('rough') || lower.startsWith('bad')) {
                          simRating = 1;
                          simNotes = raw.replace(/^(shit|rough|bad)\s*[-:,.]?\s*/i, '').trim();
                        } else if (lower.startsWith('down') || lower.startsWith('sad') || lower.startsWith('low')) {
                          simRating = 2;
                          simNotes = raw.replace(/^(down|sad|low)\s*[-:,.]?\s*/i, '').trim();
                        } else if (lower.startsWith('ok') || lower.startsWith('fine') || lower.startsWith('meh')) {
                          simRating = 3;
                          simNotes = raw.replace(/^(ok|fine|meh)\s*[-:,.]?\s*/i, '').trim();
                        } else if (lower.startsWith('good') || lower.startsWith('decent')) {
                          simRating = 4;
                          simNotes = raw.replace(/^(good|decent)\s*[-:,.]?\s*/i, '').trim();
                        } else if (lower.startsWith('hit') || lower.startsWith('peak') || lower.startsWith('great')) {
                          simRating = 5;
                          simNotes = raw.replace(/^(hit|peak|great)\s*[-:,.]?\s*/i, '').trim();
                        } else {
                          // Note only (e.g. Sabbatical chronicle)
                          simNotes = raw;
                        }
                      }

                      handleSimulatorSubmit(simRating, simNotes);
                      setInlineInputVal('');
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

                  <div className="flex items-center justify-between text-[10px] font-mono text-white/50 flex-wrap gap-1">
                    <span>💡 Tip: Type a number alone ("5") or with notes ("5 Hit chest and closed sales").</span>
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
                  <p className="text-[10px] font-mono text-white/50 text-center sm:text-left">
                    💡 Windows Action Center guarantees 2 buttons. Both buttons log today instantly with 1 tap.
                  </p>
                </div>
              )}
            </div>

            {/* In-Simulator Feedback Toast */}
            {simulatorFeedback && (
              <div className="p-3 rounded-xl bg-[#00E599] border-2 border-black text-black font-mono text-xs font-black flex items-center justify-between gap-2 shadow-[2px_2px_0px_#000] animate-fade-in">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 stroke-[2.5] text-black shrink-0" />
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

          {/* Evening Reminder Time Setting */}
          <div className="pt-4 border-t-2 border-black/15 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-black" />
                <span className="font-mono font-black text-xs uppercase text-neutral-800">
                  Scheduled Daily Reminder Time:
                </span>
              </div>
              <input
                type="time"
                value={reminderTimeVal}
                onChange={(e) => handleTimeChange(e.target.value)}
                className="w-full sm:w-auto px-3 py-1.5 bg-neutral-50 border-2 border-black rounded-xl font-mono font-black text-xs text-black focus:outline-none focus:ring-2 focus:ring-[#FDC800] shadow-[1.5px_1.5px_0px_#000]"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {TIME_PRESETS.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => handleTimeChange(preset.value)}
                  className={`py-2 rounded-xl border border-black font-mono text-xs font-black cursor-pointer transition-all active:translate-x-px active:translate-y-px ${
                    reminderTimeVal === preset.value
                      ? 'bg-[#FDC800] text-black shadow-[2px_2px_0px_#000000] border-2 border-black'
                      : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-700 shadow-[1px_1px_0px_#000]'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

        </section>

      </main>
    </div>
  );
}
