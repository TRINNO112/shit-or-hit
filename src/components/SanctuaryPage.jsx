import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  ShieldCheck, 
  Sparkles, 
  Clock, 
  Droplets, 
  EyeOff, 
  UtensilsCrossed, 
  Wind, 
  Check, 
  Compass, 
  RefreshCw,
  Activity,
  HeartPulse,
  Sliders,
  CheckCircle2,
  ChevronRight,
  Info
} from 'lucide-react';
import { 
  getRehabilitationConfig, 
  activateRehabilitation, 
  extendRehabilitation, 
  activateSabbatical,
  exitRehabilitation,
  getSanctuaryInquiryResponses,
  saveSanctuaryInquiryResponse,
  isAutoSanctuaryAssumed,
  dismissAutoSanctuaryAssumption
} from '../services/api';
import { soundEngine } from '../services/soundEngine';

export const SANCTUARY_VECTOR_INQUIRIES = [
  { 
    id: 'water', 
    title: 'Hydration & Cellular Replenishment',
    question: 'Have you replenished with clean water or herbal infusion today?',
    category: 'VITAL_HOMEOSTASIS',
    icon: Droplets,
    color: '#00D8F6',
    affirmLabel: 'AFFIRMED',
    deferLabel: 'DEFER — NO RUSH'
  },
  { 
    id: 'screens', 
    title: 'Retinal & Prefrontal Decompression',
    question: 'Did you step away from glowing screens to gaze at a distant horizon?',
    category: 'OPTIC_RECOVERY',
    icon: EyeOff,
    color: '#00E599',
    affirmLabel: 'AFFIRMED',
    deferLabel: 'DEFER — NO RUSH'
  },
  { 
    id: 'nourish', 
    title: 'Metabolic Sustenance',
    question: 'Have you provided your body with wholesome, unhurried nourishment?',
    category: 'NUTRITIVE_FUEL',
    icon: UtensilsCrossed,
    color: '#FDC800',
    affirmLabel: 'AFFIRMED',
    deferLabel: 'DEFER — NO RUSH'
  },
  { 
    id: 'sigh', 
    title: 'Stanford Physiological Sigh',
    question: 'Performed two rapid nasal inhales followed by one prolonged oral exhale?',
    category: 'AUTONOMIC_REGULATION',
    icon: Wind,
    color: '#A855F7',
    affirmLabel: 'COMPLETED',
    deferLabel: 'WILL ATTEMPT'
  }
];

export default function SanctuaryPage({ onBack, isDemo = false, activeStreak = 7 }) {
  const isSandboxDemo = isDemo || (typeof window !== 'undefined' && window.location.search.includes('demo=true'));

  // Sandbox demo state
  const [demoConfig, setDemoConfig] = useState({
    active: true,
    isSabbatical: false,
    startDate: new Date().toISOString().slice(0, 10),
    freezeDays: 7,
    maxDays: 14,
    daysRemaining: 6,
    elapsedDays: 1,
    autoSanctuaryAssumed: true,
    roughCount: 2
  });
  const [demoResponses, setDemoResponses] = useState({});

  // Real state
  const [realConfig, setRealConfig] = useState(() => getRehabilitationConfig());
  const todayStr = new Date().toISOString().slice(0, 10);
  const [realResponses, setRealResponses] = useState(() => getSanctuaryInquiryResponses(todayStr));
  const [activeTab, setActiveTab] = useState('anchors'); // 'anchors' | 'neuroscience' | 'sabbatical'
  const [toastMessage, setToastMessage] = useState('');
  const [breathingPhase, setBreathingPhase] = useState('IDLE'); // 'IDLE' | 'INHALE_1' | 'INHALE_2' | 'EXHALE'
  const [breathingActive, setBreathingActive] = useState(false);

  const activeConfig = isSandboxDemo ? demoConfig : realConfig;
  const activeResponses = isSandboxDemo ? demoResponses : realResponses;
  const isAutoAssumed = isSandboxDemo ? Boolean(demoConfig.autoSanctuaryAssumed) : isAutoSanctuaryAssumed();

  const showFeedback = (msg) => {
    try { soundEngine.playClick(); } catch (e) {}
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3200);
  };

  const handleBack = () => {
    try { soundEngine.playClick(); } catch (e) {}
    if (onBack) {
      onBack();
    } else if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', '/');
      window.location.href = '/';
    }
  };

  // Interactive Stanford Sigh Animation Loop
  useEffect(() => {
    if (!breathingActive) {
      setBreathingPhase('IDLE');
      return;
    }
    let timer1, timer2, timer3;
    const cycle = () => {
      setBreathingPhase('INHALE_1');
      timer1 = setTimeout(() => {
        setBreathingPhase('INHALE_2');
        timer2 = setTimeout(() => {
          setBreathingPhase('EXHALE');
          timer3 = setTimeout(() => {
            cycle();
          }, 4500);
        }, 1500);
      }, 2000);
    };
    cycle();
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [breathingActive]);

  const handleInquiryResponse = (inquiryId, answer) => {
    try { soundEngine.playSuccess(); } catch (e) {}
    if (isSandboxDemo) {
      setDemoResponses(prev => ({
        ...prev,
        [inquiryId]: { answer, timestamp: new Date().toISOString() }
      }));
      showFeedback(answer.includes('AFFIRMED') || answer.includes('COMPLETED')
        ? 'Restorative milestone acknowledged. Momentum safely anchored.'
        : 'Zero penalty registered. Self-compassion prioritized.');
    } else {
      const updated = saveSanctuaryInquiryResponse(todayStr, inquiryId, answer);
      setRealResponses(updated || {});
      showFeedback(answer.includes('AFFIRMED') || answer.includes('COMPLETED')
        ? 'Restorative milestone acknowledged. Momentum safely anchored.'
        : 'Zero penalty registered. Self-compassion prioritized.');
    }
  };

  const handleActivate7Days = () => {
    if (isSandboxDemo) {
      setDemoConfig(prev => ({
        ...prev,
        active: true,
        isSabbatical: false,
        freezeDays: 7,
        daysRemaining: 7,
        elapsedDays: 0
      }));
      showFeedback('[SANDBOX] 7-Day Sanctuary Freeze Engaged.');
    } else {
      const res = activateRehabilitation(7);
      setRealConfig(res || getRehabilitationConfig());
      showFeedback('7-Day Sanctuary Freeze Engaged.');
    }
  };

  const handleExtend14Days = () => {
    if (isSandboxDemo) {
      setDemoConfig(prev => ({
        ...prev,
        freezeDays: 14,
        daysRemaining: 14 - (prev.elapsedDays || 0)
      }));
      showFeedback('[SANDBOX] Sanctuary Extended to 14-Day Strict Ceiling.');
    } else {
      const res = extendRehabilitation(7);
      setRealConfig(res || getRehabilitationConfig());
      showFeedback('Sanctuary Extended to 14-Day Strict Ceiling.');
    }
  };

  const handleActivateSabbatical = () => {
    if (isSandboxDemo) {
      setDemoConfig(prev => ({
        ...prev,
        active: true,
        isSabbatical: true,
        daysRemaining: '∞',
        freezeDays: 9999
      }));
      showFeedback('[SANDBOX] Sovereign Sabbatical Activated. Milestone locked in amber.');
    } else {
      const res = activateSabbatical();
      setRealConfig(res || getRehabilitationConfig());
      showFeedback('Sovereign Sabbatical Activated. Milestone locked in amber.');
    }
  };

  const handleResumeNormalLogging = () => {
    if (isSandboxDemo) {
      setDemoConfig(prev => ({
        ...prev,
        active: false,
        autoSanctuaryAssumed: false
      }));
      showFeedback('[SANDBOX] Welcome back. Normal forensic verdicts restored.');
    } else {
      dismissAutoSanctuaryAssumption();
      exitRehabilitation();
      setRealConfig(getRehabilitationConfig());
      showFeedback('Welcome back. Normal daily verdicts restored.');
    }
  };

  const answeredCount = Object.keys(activeResponses).filter(k => 
    activeResponses[k]?.answer?.includes('AFFIRMED') || activeResponses[k]?.answer?.includes('COMPLETED')
  ).length;

  return (
    <div className="min-h-screen bg-[#F4F9F5] text-black font-sans selection:bg-[#00E599] selection:text-black">
      {/* Sandbox Isolation Header */}
      {isSandboxDemo && (
        <aside aria-label="Demo notice" className="bg-[#111622] text-[#00E599] border-b-3 border-black py-2 px-4 sticky top-0 z-50 shadow-[0_2px_0px_#000000]">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-mono font-black">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00E599] animate-ping" />
              <span>ISOLATED VISUAL SANDBOX // ZERO PERSISTENT MUTATIONS</span>
            </div>
            <span className="bg-[#00E599] text-black px-2.5 py-0.5 rounded text-[11px] font-black tracking-wider uppercase">
              STATE PREVIEW
            </span>
          </div>
        </aside>
      )}

      {/* Main Structural Navbar */}
      <header className="border-b-3 border-black bg-white/95 backdrop-blur-md px-4 sm:px-8 py-3.5 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleBack}
              className="flex items-center gap-2 bg-[#F4FAF6] hover:bg-[#FDC800] px-3.5 py-1.5 rounded-xl border-2 border-black font-mono font-black text-xs cursor-pointer shadow-[2px_2px_0px_#000000] active:translate-x-[1px] active:translate-y-[1px] transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>RETURN TO DASHBOARD</span>
            </button>
            <span className="text-neutral-300 hidden md:inline font-mono">/</span>
            <span className="font-mono text-xs font-bold text-neutral-500 hidden md:inline tracking-wider">
              PROTOCOL // REHABILITATION_SANCTUARY
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1 bg-[#E8F7EE] border-2 border-black rounded-xl text-xs font-mono font-black text-emerald-950 shadow-[1.5px_1.5px_0px_#000000]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-pulse" />
              <span>{activeConfig.active ? 'SANCTUARY ACTIVE' : 'SANCTUARY STANDBY'}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Toast Notification HUD */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-6 z-50 bg-[#111622] text-[#00E599] border-2 border-black px-5 py-3 rounded-2xl font-mono text-xs font-black shadow-[4px_4px_0px_#000000] flex items-center gap-3"
          >
            <Sparkles className="w-4 h-4 text-[#FDC800] shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Architectural Panoramic Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
        
        {/* Row 1: The Asymmetric Command Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ========================================================= */}
          {/* LEFT RAIL: THE RESTORATIVE MONOLITH (5 Columns)           */}
          {/* ========================================================= */}
          <section aria-label="Restorative status" className="lg:col-span-5 space-y-6">
            
            {/* The Sanctuary Chassis */}
            <div className="bg-white border-3 border-black rounded-3xl p-6 sm:p-7 shadow-[6px_6px_0px_#000000] relative overflow-hidden">
              <div className="flex items-center justify-between border-b-2 border-black/10 pb-4 mb-5">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono font-black tracking-widest text-neutral-400 uppercase">
                    AUTONOMIC REST HAVEN
                  </span>
                  <h1 className="text-xl font-display font-black tracking-tight text-black">
                    Rehabilitation Sanctuary
                  </h1>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-[#00E599] border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_#000000]">
                  <HeartPulse className="w-5 h-5 text-black" />
                </div>
              </div>

              {/* Streak Milestone Amber Crystal */}
              <div className="bg-[#111622] text-white border-2 border-black rounded-2xl p-5 shadow-[4px_4px_0px_#000000] relative overflow-hidden space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#00E599]" />
                    <span className="text-[11px] font-mono font-black text-neutral-300 uppercase tracking-wider">
                      MILESTONE INTEGRITY
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-[#00E599] text-black font-mono text-[10px] font-black uppercase">
                    LOCKED IN AMBER
                  </span>
                </div>

                <div className="flex items-baseline justify-between border-y border-white/10 py-3">
                  <div>
                    <span className="text-[10px] font-mono text-neutral-400 block uppercase">
                      PROTECTED STREAK
                    </span>
                    <span className="text-4xl font-display font-black text-[#FDC800] tracking-tight">
                      {activeStreak}
                    </span>
                    <span className="font-mono text-xs font-bold text-neutral-400 ml-1.5">
                      DAYS
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-mono text-neutral-400 block uppercase">
                      SANCTUARY WINDOW
                    </span>
                    <span className="text-2xl font-mono font-black text-white">
                      {activeConfig.isSabbatical ? '∞' : `${activeConfig.daysRemaining ?? 7}D`}
                    </span>
                    <span className="font-mono text-[10px] text-[#00E599] block mt-0.5">
                      {activeConfig.isSabbatical ? 'PERMANENT PAUSE' : 'REMAINING'}
                    </span>
                  </div>
                </div>

                <p className="text-[11px] font-mono text-neutral-400 leading-relaxed">
                  Daily ratings are paused. Even if days pass unrated, your streak is shielded from resetting to 0.
                </p>
              </div>

              {/* Interactive Stanford Sigh Rhythm Guide */}
              <div className="mt-5 border-2 border-black rounded-2xl p-5 bg-[#F0FAF4] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wind className="w-4 h-4 text-emerald-800" />
                    <span className="text-xs font-mono font-black text-emerald-950 uppercase">
                      STANFORD SIGH PACER
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setBreathingActive(!breathingActive)}
                    className="px-2.5 py-1 bg-white hover:bg-neutral-100 rounded-lg border-2 border-black font-mono text-[10px] font-black uppercase cursor-pointer shadow-[1px_1px_0px_#000000]"
                  >
                    {breathingActive ? 'HALT PACER' : 'START PACER'}
                  </button>
                </div>

                <div className="h-16 flex items-center justify-center bg-white border-2 border-black rounded-xl overflow-hidden relative shadow-[2px_2px_0px_#000000]">
                  {breathingActive ? (
                    <motion.div
                      key={breathingPhase}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-center"
                    >
                      <span className="font-mono font-black text-xs text-black uppercase tracking-wider block">
                        {breathingPhase === 'INHALE_1' && '1. DEEP NASAL INHALE (70%)'}
                        {breathingPhase === 'INHALE_2' && '2. TOP-OFF RAPID INHALE (30%)'}
                        {breathingPhase === 'EXHALE' && '3. SLOW UNHURRIED ORAL EXHALE'}
                      </span>
                      <span className="text-[10px] font-mono text-neutral-500">
                        Stimulating parasympathetic vagal tone
                      </span>
                    </motion.div>
                  ) : (
                    <span className="text-xs font-mono text-neutral-400 font-bold">
                      Click 'Start Pacer' for 30-second autonomic reset
                    </span>
                  )}
                </div>
              </div>

              {/* Monolith Action Controls */}
              <div className="pt-5 mt-5 border-t-2 border-black/10 space-y-2.5">
                {!activeConfig.active ? (
                  <button
                    type="button"
                    onClick={handleActivate7Days}
                    className="w-full py-3 bg-[#00E599] hover:bg-[#00c984] text-black font-mono font-black text-xs rounded-xl border-2 border-black shadow-[3px_3px_0px_#000000] cursor-pointer transition-all active:translate-x-[1px] active:translate-y-[1px] flex items-center justify-center gap-2 uppercase"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>ENGAGE 7-DAY RECOVERY FREEZE</span>
                  </button>
                ) : (
                  <>
                    {!activeConfig.isSabbatical && (activeConfig.freezeDays || 7) < 14 && (
                      <button
                        type="button"
                        onClick={handleExtend14Days}
                        className="w-full py-2.5 bg-[#FDC800] hover:bg-[#ffd633] text-black font-mono font-black text-xs rounded-xl border-2 border-black shadow-[2px_2px_0px_#000000] cursor-pointer transition-all active:translate-x-[1px] active:translate-y-[1px] flex items-center justify-center gap-2 uppercase"
                      >
                        <Clock className="w-4 h-4" />
                        <span>EXTEND FREEZE TO 14-DAY MAXIMUM</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={handleResumeNormalLogging}
                      className="w-full py-2.5 bg-white hover:bg-neutral-100 text-black font-mono font-black text-xs rounded-xl border-2 border-black shadow-[2px_2px_0px_#000000] cursor-pointer transition-all active:translate-x-[1px] active:translate-y-[1px] flex items-center justify-center gap-2 uppercase"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>FEELING BETTER — RESUME STANDARD VERDICTS</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Auto-Assumption Clinical Dispatch Notice */}
            {isAutoAssumed && activeConfig.active && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[#FFFDF5] border-3 border-black rounded-3xl p-5 sm:p-6 shadow-[5px_5px_0px_#000000] space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 bg-black text-[#FDC800] rounded-lg font-mono text-[10px] font-black uppercase">
                    AUTONOMIC SAFEGUARD ENGAGED
                  </span>
                  <span className="font-mono text-[10px] text-neutral-500 font-bold">
                    DISPATCH #DV-084
                  </span>
                </div>
                <h3 className="font-display font-black text-base text-black">
                  Chronic Friction Preceded Yesterday. Your Streak Was Sheltered.
                </h3>
                <p className="text-xs font-sans text-neutral-700 leading-relaxed">
                  The system detected 2 or more consecutive low-velocity days before you took a day off. Instead of resetting your {activeStreak}-day momentum, the engine proactively sheltered your progress.
                </p>
                <div className="pt-2 flex items-center justify-between border-t border-black/10">
                  <span className="text-[11px] font-mono text-neutral-500">Take as long as you need.</span>
                  <button
                    type="button"
                    onClick={handleResumeNormalLogging}
                    className="px-3 py-1.5 bg-[#FDC800] hover:bg-[#ffd633] text-black rounded-xl border-2 border-black font-mono font-black text-[11px] cursor-pointer shadow-[2px_2px_0px_#000000]"
                  >
                    READY TO RESUME
                  </button>
                </div>
              </motion.div>
            )}
          </section>

          {/* ========================================================= */}
          {/* RIGHT DECK: ARCHITECTURAL RESTORATIVE SYSTEM (7 Columns)  */}
          {/* ========================================================= */}
          <section aria-label="Restorative anchors and clinical blueprint" className="lg:col-span-7 space-y-6">
            
            {/* Architectural Navigation Tabs */}
            <div className="flex flex-wrap items-center gap-2 border-b-3 border-black pb-3">
              <button
                type="button"
                onClick={() => setActiveTab('anchors')}
                className={`px-4 py-2 rounded-xl font-mono text-xs font-black border-2 border-black cursor-pointer transition-all ${
                  activeTab === 'anchors'
                    ? 'bg-black text-[#00E599] shadow-[3px_3px_0px_#000000]'
                    : 'bg-white text-black hover:bg-[#F0FAF4]'
                }`}
              >
                01 // RESTORATIVE INQUIRIES
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('sabbatical')}
                className={`px-4 py-2 rounded-xl font-mono text-xs font-black border-2 border-black cursor-pointer transition-all ${
                  activeTab === 'sabbatical'
                    ? 'bg-black text-[#00E599] shadow-[3px_3px_0px_#000000]'
                    : 'bg-white text-black hover:bg-[#F0FAF4]'
                }`}
              >
                02 // SABBATICAL PROTOCOL
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('neuroscience')}
                className={`px-4 py-2 rounded-xl font-mono text-xs font-black border-2 border-black cursor-pointer transition-all ${
                  activeTab === 'neuroscience'
                    ? 'bg-black text-[#00E599] shadow-[3px_3px_0px_#000000]'
                    : 'bg-white text-black hover:bg-[#F0FAF4]'
                }`}
              >
                03 // CLINICAL BLUEPRINT
              </button>
            </div>

            {/* TAB 1: Restorative Inquiries */}
            {activeTab === 'anchors' && (
              <div className="space-y-4">
                
                {/* Velocity Status Strip */}
                <div className="bg-white border-2 border-black rounded-2xl p-4 shadow-[3px_3px_0px_#000000] flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#00E599] border-2 border-black flex items-center justify-center font-display font-black text-sm text-black">
                      {answeredCount}/4
                    </div>
                    <div>
                      <span className="font-mono text-xs font-black uppercase text-black block">
                        COMPASSION ANCHORS NOTED
                      </span>
                      <span className="text-[11px] font-sans text-neutral-500 block">
                        Zero quota penalty • Deferring carries zero negative consequence
                      </span>
                    </div>
                  </div>

                  <span className="font-mono text-xs font-bold text-neutral-600 bg-[#F4FAF6] px-3 py-1 rounded-lg border border-black">
                    CYCLE: {todayStr}
                  </span>
                </div>

                {/* 4 Crisp Inquiry Cards */}
                <div className="space-y-3.5">
                  {SANCTUARY_VECTOR_INQUIRIES.map((inq) => {
                    const InqIcon = inq.icon;
                    const recorded = activeResponses[inq.id];
                    const isAffirmed = recorded?.answer?.includes(inq.affirmLabel);
                    const isDeferred = recorded?.answer?.includes(inq.deferLabel);

                    return (
                      <div 
                        key={inq.id}
                        className="bg-white border-3 border-black rounded-2xl p-5 shadow-[4px_4px_0px_#000000] space-y-3"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3.5">
                            <div 
                              className="w-10 h-10 rounded-xl border-2 border-black flex items-center justify-center shrink-0 shadow-[2px_2px_0px_#000000]"
                              style={{ backgroundColor: inq.color }}
                            >
                              <InqIcon className="w-5 h-5 text-black stroke-[2.5]" />
                            </div>
                            <div className="space-y-1">
                              <span className="text-[10px] font-mono font-black tracking-widest text-neutral-400 uppercase">
                                {inq.category}
                              </span>
                              <h3 className="font-display font-black text-sm text-black">
                                {inq.title}
                              </h3>
                              <p className="text-xs font-sans text-neutral-600 leading-relaxed">
                                {inq.question}
                              </p>
                            </div>
                          </div>

                          {recorded && (
                            <span className="px-2.5 py-1 rounded-lg border-2 border-black font-mono text-[10px] font-black uppercase shrink-0 shadow-[1px_1px_0px_#000000] bg-[#F4FAF6] text-black">
                              {recorded.answer}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 pt-2 border-t border-black/10">
                          <button
                            type="button"
                            onClick={() => handleInquiryResponse(inq.id, inq.affirmLabel)}
                            className={`flex-1 py-2.5 px-3 rounded-xl border-2 border-black font-mono font-black text-xs cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
                              isAffirmed
                                ? 'bg-[#00E599] text-black shadow-[2px_2px_0px_#000000]'
                                : 'bg-neutral-50 hover:bg-[#F0FAF4] text-neutral-800'
                            }`}
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>{inq.affirmLabel}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleInquiryResponse(inq.id, inq.deferLabel)}
                            className={`flex-1 py-2.5 px-3 rounded-xl border-2 border-black font-mono font-bold text-xs cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
                              isDeferred
                                ? 'bg-black text-white shadow-[2px_2px_0px_#000000]'
                                : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-600'
                            }`}
                          >
                            <span>{inq.deferLabel}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 2: Sabbatical Protocol */}
            {activeTab === 'sabbatical' && (
              <div className="bg-white border-3 border-black rounded-3xl p-6 sm:p-7 shadow-[6px_6px_0px_#000000] space-y-6">
                <div className="space-y-1.5 border-b-2 border-black/10 pb-5">
                  <span className="px-3 py-0.5 bg-[#FDC800] border-2 border-black rounded-lg text-xs font-mono font-black uppercase shadow-[1.5px_1.5px_0px_#000000] inline-block">
                    PERMANENT MOMENTUM ANCHOR
                  </span>
                  <h2 className="text-xl font-display font-black text-black">
                    Sovereign Sabbatical Protocol
                  </h2>
                  <p className="text-xs sm:text-sm text-neutral-700 font-sans leading-relaxed">
                    Designed for major life crossings where a 14-day window is clinically or personally insufficient: intense examinations, medical recuperation, family crises, or extended retreats.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="border-2 border-black rounded-2xl p-4 bg-[#F4FAF6] space-y-1.5 shadow-[2px_2px_0px_#000000]">
                    <span className="font-mono font-black text-xs text-black block uppercase">
                      INVARIANT // ZERO DECAY
                    </span>
                    <p className="text-xs text-neutral-600 leading-relaxed">
                      Your current milestone ({activeStreak} Days) is preserved indefinitely in amber. No timer counts down, and no streak zero-out triggers.
                    </p>
                  </div>

                  <div className="border-2 border-black rounded-2xl p-4 bg-[#F4FAF6] space-y-1.5 shadow-[2px_2px_0px_#000000]">
                    <span className="font-mono font-black text-xs text-black block uppercase">
                      INVARIANT // FRICTIONLESS RETURN
                    </span>
                    <p className="text-xs text-neutral-600 leading-relaxed">
                      Whenever you return — whether in 2 weeks or 6 months — a single click disengages the Sabbatical and restores normal verdicts with dignity intact.
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t-2 border-black/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-neutral-400 block uppercase">
                      ACTIVE SABBATICAL ENGAGEMENT
                    </span>
                    <span className="font-mono font-black text-sm text-black">
                      {activeConfig.isSabbatical ? 'ENGAGED — MILESTONE SAFELY FROZEN' : 'DISENGAGED — STANDARD MODE'}
                    </span>
                  </div>

                  {!activeConfig.isSabbatical ? (
                    <button
                      type="button"
                      onClick={handleActivateSabbatical}
                      className="w-full sm:w-auto px-5 py-2.5 bg-[#00E599] hover:bg-[#00c984] text-black font-mono font-black text-xs rounded-xl border-2 border-black shadow-[3px_3px_0px_#000000] cursor-pointer active:translate-x-[1px] active:translate-y-[1px]"
                    >
                      ACTIVATE SABBATICAL HOLD
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResumeNormalLogging}
                      className="w-full sm:w-auto px-5 py-2.5 bg-[#FDC800] hover:bg-[#ffd633] text-black font-mono font-black text-xs rounded-xl border-2 border-black shadow-[3px_3px_0px_#000000] cursor-pointer active:translate-x-[1px] active:translate-y-[1px]"
                    >
                      DISENGAGE SABBATICAL
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: Neurobiology Blueprint */}
            {activeTab === 'neuroscience' && (
              <div className="bg-white border-3 border-black rounded-3xl p-6 sm:p-7 shadow-[6px_6px_0px_#000000] space-y-6">
                <div className="space-y-1.5 border-b-2 border-black/10 pb-5">
                  <span className="px-3 py-0.5 bg-[#A8E6CF] border-2 border-black rounded-lg text-xs font-mono font-black uppercase shadow-[1.5px_1.5px_0px_#000000] inline-block">
                    CLINICAL NEUROBIOLOGY
                  </span>
                  <h2 className="text-xl font-display font-black text-black">
                    The Physiology of Restorative Pauses
                  </h2>
                  <p className="text-xs sm:text-sm text-neutral-700 font-sans leading-relaxed">
                    Most habit trackers rely on toxic shame loops that accelerate executive burnout. The Sanctuary engine is architected around peer-reviewed autonomic neurophysiology:
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Waveform 1: Stanford Sigh */}
                  <div className="border-2 border-black rounded-2xl p-5 bg-[#F4FAF6] space-y-2.5 shadow-[2px_2px_0px_#000000]">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-black text-xs text-black uppercase">
                        1. STANFORD PHYSIOLOGICAL SIGH // VAGAL DEPRESSION
                      </span>
                      <span className="text-[10px] font-mono text-emerald-800 font-bold bg-white px-2 py-0.5 rounded border border-black">
                        DR. ANDREW HUBERMAN
                      </span>
                    </div>
                    <p className="text-xs text-neutral-700 font-sans leading-relaxed">
                      Two rapid nasal inhales followed by one extended oral exhale maximally reinflates collapsed pulmonary alveoli, offloading CO2 and instantly stimulating the vagus nerve to reduce heart rate within 30 seconds.
                    </p>
                  </div>

                  {/* Waveform 2: Ultradian Dips */}
                  <div className="border-2 border-black rounded-2xl p-5 bg-[#FFFDF5] space-y-2.5 shadow-[2px_2px_0px_#000000]">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-black text-xs text-black uppercase">
                        2. 90-MINUTE ULTRADIAN RHYTHM DIPS (BRAC)
                      </span>
                      <span className="text-[10px] font-mono text-amber-800 font-bold bg-white px-2 py-0.5 rounded border border-black">
                        NATHANIEL KLEITMAN
                      </span>
                    </div>
                    <p className="text-xs text-neutral-700 font-sans leading-relaxed">
                      Human prefrontal cortex focus oscillates in strict 90-minute basic rest-activity cycles. Continuous effort past this threshold causes an accumulation of extracellular adenosine, resulting in irritability and cognitive friction.
                    </p>
                  </div>

                  {/* Waveform 3: NSDR Rebound */}
                  <div className="border-2 border-black rounded-2xl p-5 bg-[#FDF4FF] space-y-2.5 shadow-[2px_2px_0px_#000000]">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-black text-xs text-black uppercase">
                        3. DOPAMINERGIC RESENSITIZATION // NSDR
                      </span>
                      <span className="text-[10px] font-mono text-purple-800 font-bold bg-white px-2 py-0.5 rounded border border-black">
                        STRIATAL PLASTICITY
                      </span>
                    </div>
                    <p className="text-xs text-neutral-700 font-sans leading-relaxed">
                      Suspending gamified score punishment stops the chronic dopamine depletion loop in the basal ganglia. Within 7 to 14 days of judgment-free rest, intrinsic curiosity and drive naturally regenerate.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </section>

        </div>
      </main>
    </div>
  );
}
