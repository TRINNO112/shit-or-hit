import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Lock,
  ShieldCheck,
  Cpu,
  Layers,
  TrendingUp,
  HeartHandshake,
  Play,
  Pause,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  X,
  Zap,
  CheckCircle2,
  AlertCircle,
  Brain,
  Shield,
  Clock,
  Compass,
  FileText,
  Activity,
  Send,
  UserCheck
} from 'lucide-react';
import { soundEngine } from '../services/soundEngine';

// Hand-Drawn Wobbly Sketch Path Helpers
const WobblyBox = ({ children, className = '', color = '#000000', fill = '#FFFFFF', isDrawn = true }) => (
  <div className={`relative p-3.5 sm:p-5 rounded-2xl bg-white border-3 border-black shadow-[4px_4px_0px_#000000] ${className}`}>
    {/* Sketched Top-Right Pin / Doodle Corner */}
    <div className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-[#FDC800] border-2 border-black shadow-[1px_1px_0px_#000]" />
    {children}
  </div>
);

// Sketched Connecting Arrow with Continuous Drawing Stroke
const SketchedArrow = ({ active = false, direction = 'right' }) => (
  <div className="flex items-center justify-center py-2 sm:py-0 px-2 shrink-0">
    <svg
      className={`w-8 h-8 sm:w-12 sm:h-8 ${direction === 'down' ? 'rotate-90 sm:rotate-0' : ''}`}
      viewBox="0 0 60 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <motion.path
        d="M 5,20 C 20,16 35,24 50,20 M 38,10 C 44,15 48,18 52,20 C 47,23 43,27 38,30"
        stroke="#000000"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="1 1"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: active ? 1 : 0.4 }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
      />
      {active && (
        <motion.circle
          cx="25"
          cy="20"
          r="4"
          fill="#FDC800"
          stroke="#000000"
          strokeWidth="2"
          animate={{ x: [0, 20, 0] }}
          transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
        />
      )}
    </svg>
  </div>
);

export default function ArchitectureProjectionModal({ isOpen, onClose }) {
  const [activeStep, setActiveStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [simulationPrompt, setSimulationPrompt] = useState('exhausted'); // 'exhausted' | 'flow' | 'crisis'
  const autoPlayTimer = useRef(null);

  // 6 Progressive Architectural Nodes (Hand-Drawn Sketch Storyline)
  const steps = [
    {
      id: 'input',
      title: '01. Raw Thought Scribble',
      subtitle: 'Unstructured Emotional Stream',
      badge: 'COGNITIVE INGESTION',
      badgeColor: 'bg-[#FDC800]',
      icon: FileText,
      description: 'The student inputs chaotic, raw, unorganized reflections directly after school or exams. High stress, fragmented grammar, and emotional fatigue.',
      scientificConcept: 'Natural Language Processing (NLP) & Semantic Token Ingestion',
      sketchAnnotation: 'Human distress is messy. The system accepts raw unvarnished truth without demanding perfection.',
      sampleData: {
        exhausted: "Woke up late, missed the bus, Business Studies test went terrible. Messed up 7 MCQs, feel like a failure, argued with mom, head hurts.",
        flow: "Woke up at 5:30 AM, finished economics notes, nailed the oral presentation, brewed tea for family. Feeling unstoppable.",
        crisis: "Fourth bad day in a row. Can't sleep, laptop broke, constantly scolded, feel like giving up completely on school."
      }
    },
    {
      id: 'crypto',
      title: '02. Zero-Knowledge Vault',
      subtitle: 'Client-Side Cryptographic Shield',
      badge: 'DPDPA 2023 PRIVACY',
      badgeColor: 'bg-[#00E599]',
      icon: Lock,
      description: 'Before any transmission over the network, personal diaries are encrypted in the browser using client-side AES-256-GCM. The encryption key is derived from a 4-digit PIN via PBKDF2 with 100,000 salt rounds.',
      scientificConcept: 'Zero-Knowledge Architecture & Indian DPDPA 2023 Section 12/13 Statutory Protection',
      sketchAnnotation: 'The server stores only gibberish ciphertext. Even if the database is subpoenaed or breached, student secrets cannot be decrypted.',
      sampleData: {
        cipherPreview: "U2FsdGVkX19r9J8z...[256-bit AES-GCM Ciphertext Vector + 12-byte IV]"
      }
    },
    {
      id: 'nlp',
      title: '03. Cognitive Reflection AI',
      subtitle: 'Psychological Paragraph Refactoring',
      badge: 'SEMANTIC RESTRUCTURING',
      badgeColor: 'bg-[#38BDF8]',
      icon: Brain,
      description: 'The AI acts as an objective, non-judgmental cognitive mirror. It unescapes literal newlines, normalizes semantic paragraph breaks, strips catastrophizing distortions, and highlights genuine effort.',
      scientificConcept: 'LLM Cognitive Behavioral Synthesis & Distortion Elimination',
      sketchAnnotation: 'Turns "I am a total failure" into "Faced 7 tricky questions under test fatigue, yet completed the exam and engaged family responsibilities."',
      sampleData: {
        exhausted: "Paragraph 1: Academic Stressors & Fatigue Breakdown\nParagraph 2: Self-Accountability & Refusal to Surrender\nParagraph 3: Tactical Sleep Reset Protocol",
        flow: "Paragraph 1: High Velocity Momentum\nParagraph 2: Sustaining Disciplined Morning Habits",
        crisis: "Identified Critical Fatigue Loop: Compounding Sleep Debt + Acute Relational Friction"
      }
    },
    {
      id: 'telemetry',
      title: '04. Multi-Sphere Matrix',
      subtitle: 'Deterministic Mathematical Equilibrium',
      badge: 'MATHEMATICAL MODEL',
      badgeColor: 'bg-[#A78BFA]',
      icon: Activity,
      description: 'Unlike pure AI which can hallucinate, our scoring engine is 100% deterministic mathematics. It calculates equilibrium across 4 discrete life spheres: Academics, Physical Health, Sleep, and Family Logistics.',
      scientificConcept: 'Deterministic Multi-Variable Scoring Algorithms (No Probabilistic Guesswork)',
      sketchAnnotation: 'Calculates Weighted Composite Index: Score = (Academics × 0.40) + (Sleep × 0.25) + (Health × 0.20) + (Family × 0.15).',
      sampleData: {
        exhausted: "Score: 1.8 / 5.0 (Deficit in Sleep & Exam Friction) • Rating: 2★",
        flow: "Score: 4.6 / 5.0 (Optimal Discipline Across All Spheres) • Rating: 5★",
        crisis: "Score: 1.1 / 5.0 (Critical Multi-Sphere Slump) • Rating: 1★"
      }
    },
    {
      id: 'forensics',
      title: '05. Longitudinal Forensics',
      subtitle: '30-Day Velocity & Avoidance Detection',
      badge: 'BEHAVIORAL FORENSICS',
      badgeColor: 'bg-[#F472B6]',
      icon: TrendingUp,
      description: 'Conventional habit trackers judge a student on a single day. Daily Verdict tracks rolling 30-day velocity, identifying compounding sleep debt and chronic avoidance patterns over time.',
      scientificConcept: 'Longitudinal Trend Telemetry & Multi-Week Avoidance Loop Forensics',
      sketchAnnotation: 'Diagnoses the Root Cause: "Late-night laptop work past midnight directly induces next-morning classroom friction and exam fatigue."',
      sampleData: {
        exhausted: "Velocity: -14% dip across Week 3. Diagnosed 8-hour sleep deficit over 4 days.",
        flow: "Velocity: +22% momentum surge. Unbroken 9-day logging streak active.",
        crisis: "Critical Alert: 4 consecutive sub-2.0 days. System flags acute burnout threshold."
      }
    },
    {
      id: 'triage',
      title: '06. Sanctuary & Family SOS',
      subtitle: 'Autonomous Rest & Emergency Guardian Briefing',
      badge: 'COMPASSIONATE TRIAGE',
      badgeColor: 'bg-[#FF4D4D]',
      icon: HeartHandshake,
      description: 'When acute distress is detected, the app halts toxic streak pressure, initiates somatic Vagus Nerve pacing (4-2-6 breathing), and prepares a dignified, non-alarmist briefing email for parents.',
      scientificConcept: 'Autonomic Nervous System Recovery & Dignified Intergenerational Communication',
      sketchAnnotation: 'No panic, no humiliation. The AI explains student burnout to parents in mature, constructive language with actionable support tips.',
      sampleData: {
        exhausted: "Sanctuary Shield Activated: Streak frozen. Vagus nerve breathing orb initiated.",
        flow: "All Systems Operational: No emergency intervention required.",
        crisis: "DISPATCH READY: Guardian email drafted with compassionate conversation starter."
      }
    }
  ];

  // Auto-Play Step Sequence with Audio Chimes
  useEffect(() => {
    if (isPlaying) {
      autoPlayTimer.current = setInterval(() => {
        setActiveStep(prev => {
          const next = (prev + 1) % steps.length;
          try { soundEngine.playClick(); } catch (e) { }
          return next;
        });
      }, 4200);
    } else {
      if (autoPlayTimer.current) clearInterval(autoPlayTimer.current);
    }
    return () => {
      if (autoPlayTimer.current) clearInterval(autoPlayTimer.current);
    };
  }, [isPlaying, steps.length]);

  // Keyboard navigation during live judge defense
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'Space') {
        e.preventDefault();
        try { soundEngine.playClick(); } catch (err) { }
        setActiveStep(prev => (prev + 1) % steps.length);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        try { soundEngine.playClick(); } catch (err) { }
        setActiveStep(prev => (prev - 1 + steps.length) % steps.length);
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, steps.length, onClose]);

  if (!isOpen) return null;

  const current = steps[activeStep];
  const StepIcon = current.icon;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-99 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="w-full max-w-5xl bg-[#FFFDF8] border-3 sm:border-4 border-black rounded-3xl sm:rounded-4xl shadow-[8px_8px_0px_#000000] p-4 sm:p-7 space-y-5 my-auto max-h-[96vh] flex flex-col justify-between overflow-hidden relative"
        >
          {/* Top Hand-Drawn Blueprint Header */}
          <div className="flex items-start justify-between border-b-3 border-black pb-4 gap-3">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-lg bg-black text-[#FDC800] font-mono text-[10px] sm:text-xs font-black uppercase tracking-wider">
                  GCERT RBVP 2026–27 • SUBTHEME 1(A)
                </span>
                <span className="px-2.5 py-0.5 rounded-lg bg-[#00E599] border-2 border-black text-black font-mono text-[10px] sm:text-xs font-black uppercase shadow-[1px_1px_0px_#000]">
                  AI FOR BETTER LIFE
                </span>
              </div>
              <h2 className="font-display font-black text-xl sm:text-3xl text-black uppercase tracking-tight mt-1 flex items-center gap-2">
                <span>SYSTEM BLUEPRINT &amp; ARCHITECTURE</span>
              </h2>
              <p className="text-xs sm:text-sm font-mono text-neutral-600 font-bold">
                Deterministic Telemetry, Client-Side Cryptography &amp; Cognitive Reflection Pipeline
              </p>
            </div>

            <button
              onClick={() => {
                try { soundEngine.playClick(); } catch (e) { }
                onClose();
              }}
              className="p-2 sm:p-2.5 rounded-2xl bg-white border-2 border-black hover:bg-neutral-100 active:translate-x-px active:translate-y-px active:shadow-none shadow-2px_2px_0px_#000 transition-all cursor-pointer shrink-0"
              title="Close Blueprint"
            >
              <X className="w-5 h-5 text-black stroke-[2.5]" />
            </button>
          </div>

          {/* Interactive Simulation Switcher for Judges */}
          <div className="flex items-center justify-between bg-neutral-100 p-2 sm:p-3 rounded-2xl border-2 border-black flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-black text-black uppercase flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#FDC800] fill-black" />
                <span>TEST SCENARIO:</span>
              </span>
              <div className="flex items-center gap-1.5">
                {[
                  { id: 'exhausted', label: '1. Exam Fatigue & Friction' },
                  { id: 'flow', label: '2. High-Discipline Flow' },
                  { id: 'crisis', label: '3. Acute Slump (SOS)' }
                ].map(sc => (
                  <button
                    key={sc.id}
                    onClick={() => {
                      try { soundEngine.playClick(); } catch (e) { }
                      setSimulationPrompt(sc.id);
                    }}
                    className={`px-2.5 py-1 rounded-xl border-2 border-black font-mono text-[11px] font-black uppercase transition-all cursor-pointer shadow-[1.5px_1.5px_0px_#000] ${simulationPrompt === sc.id
                      ? 'bg-black text-white'
                      : 'bg-white text-black hover:bg-neutral-50'
                      }`}
                  >
                    {sc.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Auto-Play / Pause Controls */}
            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={() => {
                  try { soundEngine.playClick(); } catch (e) { }
                  setIsPlaying(!isPlaying);
                }}
                className={`px-3 py-1.5 rounded-xl border-2 border-black font-mono text-xs font-black uppercase flex items-center gap-1.5 shadow-[2px_2px_0px_#000] cursor-pointer transition-all ${isPlaying ? 'bg-[#FF4D4D] text-white' : 'bg-[#00E599] text-black'
                  }`}
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5 fill-white" /> : <Play className="w-3.5 h-3.5 fill-black" />}
                <span>{isPlaying ? 'PAUSE SKETCH' : 'AUTO-PLAY DEMO'}</span>
              </button>
              <button
                onClick={() => {
                  try { soundEngine.playClick(); } catch (e) { }
                  setActiveStep(0);
                  setIsPlaying(false);
                }}
                className="p-1.5 rounded-xl bg-white border-2 border-black shadow-[1.5px_1.5px_0px_#000] hover:bg-neutral-50 cursor-pointer"
                title="Restart Pipeline"
              >
                <RotateCcw className="w-4 h-4 text-black" />
              </button>
            </div>
          </div>

          {/* Continuous Hand-Drawn Sketch Navigation Strip (The 6 Stages) */}
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 sm:gap-2.5">
            {steps.map((st, idx) => {
              const IconComp = st.icon;
              const isSelected = activeStep === idx;
              const isPast = activeStep > idx;
              return (
                <button
                  key={st.id}
                  onClick={() => {
                    try { soundEngine.playClick(); } catch (e) { }
                    setActiveStep(idx);
                    setIsPlaying(false);
                  }}
                  className={`p-2.5 rounded-2xl border-2 sm:border-3 text-left transition-all cursor-pointer relative ${isSelected
                    ? 'border-black bg-white shadow-[4px_4px_0px_#000000] scale-[1.02]'
                    : isPast
                      ? 'border-black/50 bg-[#F4F4F0] opacity-80 hover:opacity-100 shadow-[1px_1px_0px_#000]'
                      : 'border-dashed border-neutral-400 bg-white/50 opacity-60 hover:opacity-90'
                    }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-[10px] font-black text-neutral-500">
                      STEP {idx + 1}
                    </span>
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-[#FF4D4D] animate-ping" />
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <IconComp className="w-4 h-4 text-black shrink-0" />
                    <span className="font-display font-black text-xs uppercase truncate text-black">
                      {st.title.split('. ')[1]}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* MAIN STAGE: Cartoonish Continuous Sketch Canvas */}
          <div className="p-4 sm:p-6 rounded-3xl border-3 border-black bg-white shadow-[6px_6px_0px_#000000] relative overflow-hidden flex-1 flex flex-col justify-between min-h-300px sm:min-h-360px">
            {/* Hand-drawn Grid Blueprint Background Lines */}
            <div
              className="absolute inset-0 opacity-[0.03] pointer-events-none"
              style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '16px 16px' }}
            />

            {/* Active Node Showcase */}
            <div className="space-y-4 relative z-10">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-12 h-12 rounded-2xl bg-[#FDC800] border-3 border-black flex items-center justify-center shadow-[3px_3px_0px_#000]">
                    <StepIcon className="w-6 h-6 text-black stroke-[2.5]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-lg border-2 border-black font-mono text-[10px] font-black uppercase shadow-[1px_1px_0px_#000] ${current.badgeColor}`}>
                        {current.badge}
                      </span>
                      <span className="font-mono text-xs font-bold text-neutral-500">
                        STAGE {activeStep + 1} OF {steps.length}
                      </span>
                    </div>
                    <h3 className="font-display font-black text-lg sm:text-2xl uppercase tracking-tight text-black mt-0.5">
                      {current.title}
                    </h3>
                  </div>
                </div>

                <div className="text-right hidden sm:block">
                  <span className="font-mono text-[11px] font-black text-neutral-400 uppercase block">
                    SCIENTIFIC FOUNDATION
                  </span>
                  <span className="font-mono text-xs font-bold text-neutral-900 bg-neutral-100 px-2.5 py-1 rounded-lg border border-black inline-block mt-0.5">
                    {current.scientificConcept}
                  </span>
                </div>
              </div>

              {/* Detailed Explanation Text */}
              <p className="font-mono text-xs sm:text-sm text-neutral-800 leading-relaxed font-semibold max-w-3xl">
                {current.description}
              </p>

              {/* The Hand-Drawn Sketch Box (Live Animated Output) */}
              <div className="p-3.5 sm:p-4 rounded-2xl border-2 sm:border-3 border-black bg-[#FFFDF5] shadow-[3px_3px_0px_#000000] relative">
                <div className="flex items-center justify-between mb-2 pb-1.5 border-b-2 border-neutral-200">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#FF4D4D] border border-black" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#FDC800] border border-black" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#00E599] border border-black" />
                    <span className="font-mono text-[10px] sm:text-xs font-black uppercase text-neutral-700 ml-1">
                      LIVE RUNTIME DATA PIPELINE
                    </span>
                  </div>
                  <span className="font-mono text-[10px] font-bold text-neutral-500 uppercase">
                    SCENARIO: {simulationPrompt}
                  </span>
                </div>

                {/* Animated Sketched Data Content */}
                <motion.div
                  key={`${activeStep}-${simulationPrompt}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="font-mono text-xs sm:text-sm text-black leading-relaxed whitespace-pre-wrap font-bold bg-white p-3 rounded-xl border border-black/30 shadow-inner"
                >
                  {typeof current.sampleData === 'object' && current.sampleData[simulationPrompt]
                    ? current.sampleData[simulationPrompt]
                    : current.sampleData.cipherPreview || JSON.stringify(current.sampleData)}
                </motion.div>

                {/* Hand-Drawn Pencil Note Annotation */}
                <div className="mt-2.5 flex items-start gap-2 text-neutral-600 font-mono text-[11px]">
                  <span className="font-black text-[#FF4D4D] shrink-0">✦ DEFENSE NOTE:</span>
                  <span className="italic">{current.sketchAnnotation}</span>
                </div>
              </div>
            </div>

            {/* Bottom Stepper Controls */}
            <div className="flex items-center justify-between pt-4 border-t-2 border-black/10 mt-4">
              <button
                onClick={() => {
                  try { soundEngine.playClick(); } catch (e) { }
                  setActiveStep(prev => Math.max(0, prev - 1));
                  setIsPlaying(false);
                }}
                disabled={activeStep === 0}
                className="px-3 sm:px-4 py-2 rounded-xl border-2 border-black font-mono text-xs font-black uppercase flex items-center gap-1.5 shadow-2px_2px_0px_#000 enabled:cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed bg-white hover:bg-neutral-50 active:translate-x-px active:translate-y-px active:shadow-none"
              >
                <ChevronLeft className="w-4 h-4 text-black" />
                <span>PREVIOUS</span>
              </button>

              <div className="flex items-center gap-1.5">
                {steps.map((_, i) => (
                  <div
                    key={i}
                    className={`w-2.5 h-2.5 rounded-full border border-black transition-all ${activeStep === i ? 'bg-black w-6' : 'bg-neutral-300'
                      }`}
                  />
                ))}
              </div>

              <button
                onClick={() => {
                  try { soundEngine.playClick(); } catch (e) { }
                  setActiveStep(prev => (prev + 1) % steps.length);
                  setIsPlaying(false);
                }}
                className="px-3 sm:px-4 py-2 rounded-xl border-2 border-black font-mono text-xs font-black uppercase flex items-center gap-1.5 shadow-2px_2px_0px_#000 cursor-pointer bg-[#FDC800] hover:bg-amber-300 active:translate-x-px active:translate-y-px active:shadow-none text-black"
              >
                <span>{activeStep === steps.length - 1 ? 'REPLAY FROM START' : 'NEXT STAGE'}</span>
                <ChevronRight className="w-4 h-4 text-black" />
              </button>
            </div>
          </div>

          {/* Quick Hotkey Defense Cheat Bar for the User */}
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-neutral-500 px-1 pt-1">
            <span>KEYBOARD SHORTCUTS: SPACEBAR / ARROWS TO ADVANCE • ESC TO EXIT</span>
            <span className="hidden sm:inline">STATE PRESENTATION DEFENSE PROTOCOL ACTIVE</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
