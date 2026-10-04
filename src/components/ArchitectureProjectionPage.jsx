import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Lock,
  ShieldCheck,
  Cpu,
  Layers,
  TrendingUp,
  HeartHandshake,
  Activity,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Brain,
  Shield,
  Clock,
  FileText,
  Send,
  Zap,
  Sliders,
  Code2,
  HelpCircle,
  Info,
  Terminal,
  Key,
  Maximize2,
  Minimize2,
  Check,
  Flame,
  LifeBuoy,
  Calculator,
  Search,
  BookOpen
} from 'lucide-react';
import { soundEngine } from '../services/soundEngine';

// 6 Core Architectural Processing Stages
const NODES = [
  {
    id: 'input',
    stageNumber: '01',
    title: 'Cognitive Ingestion',
    subtitle: 'Raw Chaotic Thought Stream',
    badge: 'INGESTION LAYER',
    badgeColor: 'bg-[#FDC800]',
    borderColor: 'border-[#FDC800]',
    icon: FileText,
    summary: 'The student scribbles raw, emotionally fatigued diary text with fragmented grammar, emotional distortion, and exam distress.',
    formula: 'Input = TokenStream(Raw_User_Journal) + Context_Metadata',
    scientificDomain: 'Natural Language Processing & Semantic Tokenization',
    scenarios: {
      exhausted: {
        input: 'Woke up late, missed the morning bus. Accounts exam was a total catastrophe, messed up 7 balance sheet entries. Feel like a hopeless failure. Fought with mom.',
        output: 'Parsed 32 tokens • Raw Sentiment: -0.82 • Distortion Flags: Catastrophizing, All-or-Nothing',
        status: 'Unprocessed Raw Distress'
      },
      flow: {
        input: 'Woke up at 5:15 AM, finished 3 chapters of economics, aced group presentation, cooked breakfast with dad. Energy levels sky high.',
        output: 'Parsed 28 tokens • Raw Sentiment: +0.91 • Distortion Flags: None Detected',
        status: 'Unprocessed High Velocity'
      },
      crisis: {
        input: 'Day 4 of non-stop panic. Cannot sleep, chest feels tight, grades plummeting, parents disappointed. Feel like disappearing completely.',
        output: 'Parsed 24 tokens • Raw Sentiment: -0.96 • Critical Alert: Acute Psychological Fatigue',
        status: 'Unprocessed Critical Shock'
      }
    },
    codeSnippet: `// src/components/TodayView.jsx
const handleSave = (rawContent, rating) => {
  const sanitizedText = sanitizeInput(rawContent);
  const telemetryVector = extractSpheres(sanitizedText);
  passToZeroKnowledgeVault(sanitizedText, telemetryVector);
};`,
    judgeDefense: {
      q: 'Why not force structured multiple-choice surveys instead of raw text journaling?',
      a: 'Structured surveys induce cognitive friction and clinical alienation in fatigued adolescents. Allowing raw, unvarnished journaling honors authentic student expression while our downstream NLP extracts deterministic signals safely.'
    }
  },
  {
    id: 'crypto',
    stageNumber: '02',
    title: 'Zero-Knowledge Vault',
    subtitle: 'Client-Side Cryptographic Shield',
    badge: 'DPDPA 2023 SECURITY',
    badgeColor: 'bg-[#00E599]',
    borderColor: 'border-[#00E599]',
    icon: Lock,
    summary: 'Client-side AES-256-GCM encryption with 100,000 PBKDF2 salt rounds. Ciphertext is locked in the browser before network transit. The server stores zero raw plaintext.',
    formula: 'Ciphertext = AES_256_GCM(Plaintext, K_derived), K_derived = PBKDF2(PIN, Salt, 100k)',
    scientificDomain: 'Applied Cryptography & Indian DPDPA 2023 §12/13 Statutory Protection',
    scenarios: {
      exhausted: {
        input: 'Raw Distress Plaintext [Length: 148 chars]',
        output: 'U2FsdGVkX1+9sP2l...[256-bit AES-GCM Ciphertext + 12-byte IV + 16-byte AuthTag]',
        status: 'Cryptographically Sealed'
      },
      flow: {
        input: 'Peak Momentum Plaintext [Length: 132 chars]',
        output: 'U2FsdGVkX18m3A9q...[256-bit AES-GCM Ciphertext + 12-byte IV + 16-byte AuthTag]',
        status: 'Cryptographically Sealed'
      },
      crisis: {
        input: 'Critical Distress Plaintext [Length: 126 chars]',
        output: 'U2FsdGVkX19z4K1v...[256-bit AES-GCM Ciphertext + 12-byte IV + 16-byte AuthTag]',
        status: 'Cryptographically Sealed'
      }
    },
    codeSnippet: `// src/services/cipherEngine.js
export async function encryptDiaryPayload(plaintext, userPin) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(userPin, salt, 100000);
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv }, key, new TextEncoder().encode(plaintext)
  );
  return { ciphertext: toBase64(ciphertext), iv: toBase64(iv), salt: toBase64(salt) };
}`,
    judgeDefense: {
      q: 'Can school administrators or cloud engineers intercept and read student diaries?',
      a: 'Mathematically impossible. The encryption key never leaves the client device. Decryption requires the student 4-digit PIN running PBKDF2 in the local Web Cryptography API. Even with a cloud database breach, attackers receive only high-entropy random ciphertext.'
    }
  },
  {
    id: 'cognitive_ai',
    stageNumber: '03',
    title: 'Cognitive Mirror AI',
    subtitle: 'CBT Restructuring & Distortion Removal',
    badge: 'PSYCHOLOGICAL NLP',
    badgeColor: 'bg-[#38BDF8]',
    borderColor: 'border-[#38BDF8]',
    icon: Brain,
    summary: 'Restructures run-on distress into 3 structured thematic paragraphs. Identifies and strips cognitive distortions (catastrophizing, mind reading) while preserving authentic effort.',
    formula: 'ReflectedText = Synthesize_CBT_Mirror(DeDistorted(Text), Homie_Mentor_Tone)',
    scientificDomain: 'Cognitive Behavioral Therapy (CBT) & Natural Language Generation',
    scenarios: {
      exhausted: {
        input: '"Messed up 7 balance sheet entries, feel like a hopeless failure, fought with mom."',
        output: '1. Exam Friction: Encountered 7 non-trivial balance sheet snags under acute time pressure.\n2. Effort Affirmation: Completed the exam paper without quitting.\n3. Tactical Recovery: Reconcile with mom over tea; execute 8-hour sleep reset tonight.',
        status: 'Distortion Filter Applied'
      },
      flow: {
        input: '"Woke up at 5:15 AM, finished 3 chapters, aced presentation, energy sky high."',
        output: '1. Morning Discipline: 5:15 AM launch established strong cognitive velocity.\n2. Academic Milestone: 3 Economics chapters consolidated.\n3. Momentum Preservation: Guard evening rest to prevent rebound burnout.',
        status: 'Constructive Reinforcement'
      },
      crisis: {
        input: '"Day 4 panic, tight chest, grades plummeting, feel like disappearing."',
        output: '1. Autonomous Stress De-Escalation: Immediate academic pressure decoupled.\n2. Somatic Prioritization: Nervous system overload recognized.\n3. Support Bridging: Gentle Guardian communication channel primed.',
        status: 'Crisis De-escalation Protocol'
      }
    },
    codeSnippet: `// server/routes/enhance.js
const prompt = \`Role: Empathetic, grounded older sibling mentor.
1. Strip cognitive catastrophizing ("total failure" -> "acute exam friction").
2. Format into exactly 3 clean semantic paragraphs with actionable recovery steps.
3. Zero clinical buzzwords. Strictly maintain adolescent dignity.\`;`,
    judgeDefense: {
      q: 'Does the AI replace professional mental health therapy?',
      a: 'No. The AI functions as a first-line psychological mirror and friction triage engine, de-escalating catastrophic thinking in the moment. When acute distress patterns persist, it autonomously connects the student to human family guardians and professional resources.'
    }
  },
  {
    id: 'telemetry_matrix',
    stageNumber: '04',
    title: 'Telemetry Matrix',
    subtitle: 'Deterministic Multi-Sphere Equilibrium',
    badge: 'DETERMINISTIC MATH',
    badgeColor: 'bg-[#A78BFA]',
    borderColor: 'border-[#A78BFA]',
    icon: Activity,
    summary: 'Zero LLM hallucination. Computes composite daily score via 100% deterministic weighted arithmetic across 4 distinct life spheres: Academics, Sleep, Physical Health, and Family Logistics.',
    formula: 'Composite Score = (Academics × 0.40) + (Sleep × 0.25) + (Health × 0.20) + (Family × 0.15)',
    scientificDomain: 'Multi-Criteria Decision Analysis & Deterministic Metric Systems',
    scenarios: {
      exhausted: {
        input: 'Academics: 1.5/5.0 • Sleep: 1.0/5.0 • Health: 2.0/5.0 • Family: 2.0/5.0',
        output: 'Computed Index: 1.55 / 5.00 • Classification: 2★ OVERWHELMED / ROUGH DAY',
        status: 'Deficit Detected in Sleep & Academics'
      },
      flow: {
        input: 'Academics: 5.0/5.0 • Sleep: 4.5/5.0 • Health: 4.5/5.0 • Family: 5.0/5.0',
        output: 'Computed Index: 4.77 / 5.00 • Classification: 5★ PEAK FLOW / HIT',
        status: 'Harmonious Equilibrium'
      },
      crisis: {
        input: 'Academics: 1.0/5.0 • Sleep: 1.0/5.0 • Health: 1.0/5.0 • Family: 1.5/5.0',
        output: 'Computed Index: 1.07 / 5.00 • Classification: 1★ CRITICAL DEFICIT',
        status: 'Autopsy & SOS Trigger Condition Met'
      }
    },
    codeSnippet: `// src/utils/telemetryMath.js
export function computeDailyEquilibrium(spheres) {
  const weights = { academics: 0.40, sleep: 0.25, health: 0.20, family: 0.15 };
  let weightedSum = 0;
  for (const [sphere, val] of Object.entries(spheres)) {
    weightedSum += (val * weights[sphere]);
  }
  return {
    score: Number(weightedSum.toFixed(2)),
    starRating: Math.max(1, Math.min(5, Math.round(weightedSum)))
  };
}`,
    judgeDefense: {
      q: 'Why use deterministic mathematics instead of letting an AI calculate the score?',
      a: 'Scientific reproducibility. LLM scoring is non-deterministic, prone to prompt variance and hallucinations. By isolating subjective text to NLP reframing and reserving scoring to deterministic math, our verdicts are 100% mathematically verifiable across all test runs.'
    }
  },
  {
    id: 'forensics',
    stageNumber: '05',
    title: 'Longitudinal Forensics',
    subtitle: '30-Day Velocity & Slump Detection',
    badge: 'BEHAVIORAL FORENSICS',
    badgeColor: 'bg-[#F472B6]',
    borderColor: 'border-[#F472B6]',
    icon: TrendingUp,
    summary: 'Analyzes rolling 30-day momentum. Identifies chronic avoidance loops, compounding sleep deficits, and impending burnout before academic failure occurs.',
    formula: 'Velocity(V_30) = (Mean(Week_Current) - Mean(Week_Prior)) / Standard_Deviation',
    scientificDomain: 'Longitudinal Time-Series Analysis & Behavioral Pattern Mining',
    scenarios: {
      exhausted: {
        input: 'Prior 7 Days: [4★, 4★, 3★, 3★, 2★, 2★, 2★] • Sleep Deficit: -7.5 hours',
        output: 'Velocity: -18.4% • Diagnostic: Acute Exam Sprint Aftermath • Slump Risk: Elevated',
        status: 'Avoidance Loop Warning'
      },
      flow: {
        input: 'Prior 7 Days: [4★, 5★, 5★, 4★, 5★, 5★, 5★] • Sleep Deficit: 0.0 hours',
        output: 'Velocity: +24.2% • Diagnostic: Sustained High Velocity Discipline • Slump Risk: Zero',
        status: 'Positive Reinforcement Loop'
      },
      crisis: {
        input: 'Prior 7 Days: [2★, 2★, 1★, 1★, 1★, 1★, 1★] • Sleep Deficit: -16.0 hours',
        output: 'Velocity: -52.8% • Diagnostic: 4-Day Critical Slump Threshold Breached',
        status: 'Mandatory Triage Trigger'
      }
    },
    codeSnippet: `// src/services/slumpDetector.js
export function evaluateSlumpThreshold(entries, windowDays = 7) {
  const recent = entries.slice(-windowDays);
  const roughDays = recent.filter(e => e.rating <= 2).length;
  const avgScore = recent.reduce((sum, e) => sum + e.rating, 0) / recent.length;
  return {
    isSlump: roughDays >= 2 && avgScore < 2.5,
    isCrisis: roughDays >= 4 || avgScore < 1.6,
    roughDayCount: roughDays
  };
}`,
    judgeDefense: {
      q: 'How does this prevent students from quitting when they get a bad score?',
      a: 'Conventional trackers penalize broken streaks, causing guilt and abandonment. Daily Verdict uses behavioral forensics: a slump triggers proactive shield protection rather than punishment, validating rest as an essential scientific component of high performance.'
    }
  },
  {
    id: 'sanctuary_sos',
    stageNumber: '06',
    title: 'Sanctuary & Guardian SOS',
    subtitle: 'Autonomic Pacing & Family Briefing',
    badge: 'COMPASSIONATE TRIAGE',
    badgeColor: 'bg-[#FF4D4D]',
    borderColor: 'border-[#FF4D4D]',
    icon: HeartHandshake,
    summary: 'Halts toxic streak pressure. Deploys Vagus Nerve 4-2-6 somatic breathing and dispatches a dignified, mature briefing email to parents with actionable conversation starters.',
    formula: 'Intervention = VagusPacer(4s_in, 2s_hold, 6s_out) + DispatchGuardianEmail(Context)',
    scientificDomain: 'Polyvagal Autonomic Regulation & Intergenerational Support Protocols',
    scenarios: {
      exhausted: {
        input: 'Slump Detected (2 rough days) • High academic fatigue',
        output: 'Sanctuary Mode Offered: Streak frozen for 7 days. Vagus nerve 4-2-6 pacer recommended.',
        status: 'Preventative Autonomic Reset'
      },
      flow: {
        input: 'Peak Flow • Zero fatigue flags',
        output: 'Nominal State: Daily record sealed. Streak incremented to 14 days. Zero intervention required.',
        status: 'All Systems Optimal'
      },
      crisis: {
        input: 'Critical Slump (4 rough days) • Severe sleep deficit',
        output: 'DISPATCH ENGAGED: Autonomous Guardian Email generated. Non-alarmist talking points delivered to parents.',
        status: 'Active Guardian Escort'
      }
    },
    codeSnippet: `// server/routes/guardianSos.js
export async function dispatchGuardianBriefing(studentContext, guardianEmail) {
  const briefing = generateDignifiedParentBriefing({
    coreStressors: studentContext.frictionSummary,
    sleepDeficitHours: studentContext.sleepDeficit,
    conversationStarters: [
      "Avoid asking about exam marks tonight.",
      "Offer warm food and 9 hours of uninterrupted sleep.",
      "Acknowledge the heavy preparation load."
    ]
  });
  return await sendBrevoEmail(guardianEmail, briefing);
}`,
    judgeDefense: {
      q: 'Will parents receive private diary text or embarrassing secrets?',
      a: 'Never. The zero-knowledge privacy architecture guarantees that private journal text remains encrypted. The Guardian briefing contains only high-level stress categories (e.g. "Exam Preparation Fatigue", "Sleep Disruption") and constructive conversation prompts.'
    }
  }
];

export default function ArchitectureProjectionPage({ onBack }) {
  const [activeNodeIndex, setActiveNodeIndex] = useState(0);
  const [selectedScenario, setSelectedScenario] = useState('exhausted'); // 'exhausted' | 'flow' | 'crisis'
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(1); // 1x, 2x, 0.5x
  const [activeInspectorTab, setActiveInspectorTab] = useState('packet'); // 'packet' | 'math' | 'code' | 'defense'
  const [isFullscreen, setIsFullscreen] = useState(false);
  const autoPlayRef = useRef(null);

  // Auto-play progression loop across the flowchart nodes
  useEffect(() => {
    if (isAutoPlaying) {
      const interval = (3800 / playbackSpeed);
      autoPlayRef.current = setInterval(() => {
        setActiveNodeIndex(prev => {
          const next = (prev + 1) % NODES.length;
          try { soundEngine.playClick(); } catch (e) {}
          return next;
        });
      }, interval);
    } else {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    }
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [isAutoPlaying, playbackSpeed]);

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'Space') {
        if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
          e.preventDefault();
          try { soundEngine.playClick(); } catch (err) {}
          setActiveNodeIndex(prev => (prev + 1) % NODES.length);
        }
      } else if (e.key === 'ArrowLeft') {
        if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
          e.preventDefault();
          try { soundEngine.playClick(); } catch (err) {}
          setActiveNodeIndex(prev => (prev - 1 + NODES.length) % NODES.length);
        }
      } else if (e.key === 'Escape') {
        if (onBack) onBack();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onBack]);

  const activeNode = NODES[activeNodeIndex];
  const activeScenarioData = activeNode.scenarios[selectedScenario];
  const ActiveIcon = activeNode.icon;

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDF5] text-black font-sans selection:bg-[#FDC800] selection:text-black flex flex-col antialiased">
      
      {/* 🧭 Sticky Top Engineering Navigation Bar */}
      <header className="sticky top-0 z-50 bg-[#FFFDF5]/95 backdrop-blur-md border-b-3 border-black px-3.5 sm:px-8 py-3 shadow-[0_3px_0px_#000000]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Left: Back Button & Project Badges */}
          <div className="flex items-center gap-3 flex-wrap">
            <button
              type="button"
              onClick={() => {
                try { soundEngine.playClick(); } catch (e) {}
                if (onBack) onBack();
              }}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#FFFDF8] hover:bg-neutral-100 border-2 border-black rounded-xl font-mono font-black text-xs uppercase shadow-[2px_2px_0px_#000000] active:translate-x-px active:translate-y-px active:shadow-none transition-all cursor-pointer shrink-0"
              title="Return to Diary View"
            >
              <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
              <span>EXIT BLUEPRINT</span>
            </button>

            <div className="h-5 w-px bg-black/30 hidden sm:block" />

            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-1 bg-black text-[#FDC800] border-2 border-black rounded-lg font-mono font-black text-[10px] sm:text-xs uppercase tracking-wider shadow-[1px_1px_0px_#000]">
                GCERT RBVP 2026–27
              </span>
              <span className="px-2.5 py-1 bg-[#00E599] text-black border-2 border-black rounded-lg font-mono font-black text-[10px] sm:text-xs uppercase shadow-[1px_1px_0px_#000]">
                SUBTHEME 1(A): AI FOR BETTER LIFE
              </span>
              <span className="hidden lg:inline-block px-2 py-0.5 bg-neutral-200 border border-black rounded font-mono font-bold text-[10px] text-neutral-800">
                STATE EXHIBITION DEFENSE
              </span>
            </div>
          </div>

          {/* Right: Simulation Controls & Speed Switcher */}
          <div className="flex items-center gap-2 flex-wrap self-end md:self-auto">
            
            {/* Play/Pause Auto-Stream */}
            <button
              type="button"
              onClick={() => {
                try { soundEngine.playClick(); } catch (e) {}
                setIsAutoPlaying(prev => !prev);
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 border-2 border-black rounded-xl font-mono font-black text-xs uppercase shadow-[2px_2px_0px_#000000] active:translate-x-px active:translate-y-px active:shadow-none transition-all cursor-pointer ${
                isAutoPlaying ? 'bg-[#FDC800] text-black' : 'bg-white text-neutral-700'
              }`}
            >
              {isAutoPlaying ? (
                <>
                  <Pause className="w-3.5 h-3.5 fill-black" />
                  <span>PAUSE STREAM</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-black" />
                  <span>PLAY STREAM</span>
                </>
              )}
            </button>

            {/* Speed Toggle */}
            <button
              type="button"
              onClick={() => {
                try { soundEngine.playClick(); } catch (e) {}
                setPlaybackSpeed(prev => (prev === 1 ? 2 : prev === 2 ? 0.5 : 1));
              }}
              className="px-2.5 py-1.5 bg-white border-2 border-black rounded-xl font-mono font-black text-xs uppercase shadow-[2px_2px_0px_#000000] active:translate-x-px active:translate-y-px active:shadow-none cursor-pointer"
              title="Toggle Simulation Speed"
            >
              <span>{playbackSpeed}X</span>
            </button>

            {/* Reset Loop */}
            <button
              type="button"
              onClick={() => {
                try { soundEngine.playClick(); } catch (e) {}
                setActiveNodeIndex(0);
              }}
              className="p-1.5 bg-white hover:bg-neutral-100 border-2 border-black rounded-xl shadow-[2px_2px_0px_#000000] active:translate-x-px active:translate-y-px active:shadow-none cursor-pointer"
              title="Reset to Stage 1"
            >
              <RotateCcw className="w-4 h-4 stroke-[2.5]" />
            </button>

            {/* Fullscreen Toggle */}
            <button
              type="button"
              onClick={toggleFullscreen}
              className="p-1.5 bg-white hover:bg-neutral-100 border-2 border-black rounded-xl shadow-[2px_2px_0px_#000000] active:translate-x-px active:translate-y-px active:shadow-none cursor-pointer hidden sm:block"
              title="Toggle Fullscreen"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4 stroke-[2.5]" /> : <Maximize2 className="w-4 h-4 stroke-[2.5]" />}
            </button>
          </div>
        </div>
      </header>

      {/* 🚀 Main Page Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3.5 sm:p-8 space-y-6">
        
        {/* Title Hero Block */}
        <section className="bg-white border-3 sm:border-4 border-black rounded-3xl p-4 sm:p-7 shadow-[6px_6px_0px_#000000] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#00E599] border-2 border-black animate-pulse" />
              <span className="font-mono text-xs font-black text-neutral-600 uppercase tracking-widest">
                LIVE INTERACTIVE ARCHITECTURE CANVAS
              </span>
            </div>
            <h1 className="font-display font-black text-2xl sm:text-4xl text-black uppercase tracking-tight">
              DUAL-CORE COGNITIVE &amp; TELEMETRY ENGINE
            </h1>
            <p className="text-xs sm:text-sm font-mono text-neutral-700 font-bold max-w-3xl">
              End-to-end data pipeline combining client-side zero-knowledge cryptography, CBT-grounded psychological reflection, and 100% deterministic multi-sphere mathematical equilibrium.
            </p>
          </div>

          {/* Interactive Scenario Selector */}
          <div className="w-full md:w-auto shrink-0 bg-[#FFFDF5] border-2 border-black rounded-2xl p-2.5 shadow-[3px_3px_0px_#000000] space-y-2">
            <div className="flex items-center justify-between gap-2 px-1">
              <span className="font-mono text-[10px] font-black text-neutral-500 uppercase flex items-center gap-1">
                <Sliders className="w-3 h-3 stroke-[2.5]" />
                <span>INJECT STUDENT SCENARIO:</span>
              </span>
              <span className="font-mono text-[10px] font-black text-black uppercase">
                {selectedScenario.toUpperCase()}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => {
                  try { soundEngine.playClick(); } catch (e) {}
                  setSelectedScenario('exhausted');
                }}
                className={`px-2.5 py-1.5 rounded-xl border-2 border-black font-mono font-black text-[11px] uppercase transition-all cursor-pointer text-center ${
                  selectedScenario === 'exhausted'
                    ? 'bg-[#FDC800] text-black shadow-[2px_2px_0px_#000000]'
                    : 'bg-white text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                EXAM FATIGUE
              </button>

              <button
                type="button"
                onClick={() => {
                  try { soundEngine.playClick(); } catch (e) {}
                  setSelectedScenario('flow');
                }}
                className={`px-2.5 py-1.5 rounded-xl border-2 border-black font-mono font-black text-[11px] uppercase transition-all cursor-pointer text-center ${
                  selectedScenario === 'flow'
                    ? 'bg-[#00E599] text-black shadow-[2px_2px_0px_#000000]'
                    : 'bg-white text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                PEAK FLOW
              </button>

              <button
                type="button"
                onClick={() => {
                  try { soundEngine.playClick(); } catch (e) {}
                  setSelectedScenario('crisis');
                }}
                className={`px-2.5 py-1.5 rounded-xl border-2 border-black font-mono font-black text-[11px] uppercase transition-all cursor-pointer text-center ${
                  selectedScenario === 'crisis'
                    ? 'bg-[#FF4D4D] text-white shadow-[2px_2px_0px_#000000]'
                    : 'bg-white text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                ACUTE CRISIS
              </button>
            </div>
          </div>
        </section>

        {/* 🗺️ THE VISUAL ANIMATED FLOWCHART BOARD */}
        <section className="bg-[#FFFDF8] border-3 sm:border-4 border-black rounded-3xl p-4 sm:p-7 shadow-[8px_8px_0px_#000000] relative overflow-hidden space-y-6">
          
          <div className="flex items-center justify-between border-b-2 border-black pb-3 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-black text-[#00E599] rounded font-mono font-black text-xs uppercase">
                FLOWCHART TOPOLOGY
              </span>
              <span className="font-mono text-xs font-bold text-neutral-600">
                CLICK ANY NODE TO INSPECT LIVE DATA STREAM &amp; FORMULAS
              </span>
            </div>

            <div className="flex items-center gap-2 font-mono text-xs font-black">
              <span>ACTIVE PACKET AT:</span>
              <span className="px-2 py-0.5 bg-[#FDC800] border border-black rounded text-black uppercase">
                STAGE {activeNode.stageNumber} • {activeNode.title}
              </span>
            </div>
          </div>

          {/* Grid Layout of the 6 Nodes with Visual Connectors */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 relative">
            
            {NODES.map((node, idx) => {
              const isCurrent = idx === activeNodeIndex;
              const isPast = idx < activeNodeIndex;
              const NodeIcon = node.icon;
              const scenarioData = node.scenarios[selectedScenario];

              return (
                <div
                  key={node.id}
                  onClick={() => {
                    try { soundEngine.playClick(); } catch (e) {}
                    setActiveNodeIndex(idx);
                  }}
                  className={`relative p-4 sm:p-5 rounded-2xl border-3 border-black transition-all cursor-pointer flex flex-col justify-between ${
                    isCurrent
                      ? 'bg-white shadow-[6px_6px_0px_#000000] ring-4 ring-[#00E599]'
                      : isPast
                      ? 'bg-neutral-50 shadow-[3px_3px_0px_#000000] hover:bg-white'
                      : 'bg-white/80 shadow-[2px_2px_0px_#000000] opacity-85 hover:opacity-100'
                  }`}
                >
                  {/* Top Node Pin & Badges */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`px-2 py-0.5 border border-black rounded font-mono font-black text-[10px] uppercase shadow-[1px_1px_0px_#000] ${node.badgeColor} text-black`}>
                        {node.badge}
                      </span>
                      <span className="font-mono font-black text-xs text-neutral-500">
                        STAGE {node.stageNumber} / 06
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl border-2 border-black flex items-center justify-center shrink-0 shadow-[2px_2px_0px_#000000] ${
                        isCurrent ? 'bg-black text-[#00E599]' : 'bg-neutral-100 text-black'
                      }`}>
                        <NodeIcon className="w-5 h-5 stroke-[2.5]" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-display font-black text-base sm:text-lg uppercase tracking-tight text-black truncate">
                          {node.title}
                        </h3>
                        <p className="font-mono text-[11px] text-neutral-600 font-bold truncate">
                          {node.subtitle}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Node Transformation Snapshot */}
                  <div className="mt-4 p-2.5 bg-neutral-100 border-2 border-black rounded-xl space-y-1 text-left">
                    <div className="flex items-center justify-between text-[10px] font-mono font-black text-neutral-500 uppercase">
                      <span>DATA PACKET:</span>
                      <span className="text-black font-bold">{scenarioData.status}</span>
                    </div>
                    <p className="font-mono text-xs text-neutral-800 line-clamp-2 font-medium">
                      {scenarioData.output}
                    </p>
                  </div>

                  {/* Bottom Active Status / Next Connector Indicator */}
                  <div className="mt-4 pt-2 border-t-2 border-black/20 flex items-center justify-between text-xs font-mono font-black">
                    <div className="flex items-center gap-1.5">
                      {isCurrent ? (
                        <>
                          <span className="w-2.5 h-2.5 rounded-full bg-[#00E599] border border-black animate-ping" />
                          <span className="text-[#00A36C] uppercase">EXECUTING...</span>
                        </>
                      ) : isPast ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-[#00E599] stroke-[3]" />
                          <span className="text-neutral-600 uppercase">VERIFIED</span>
                        </>
                      ) : (
                        <span className="text-neutral-400 uppercase">STANDBY</span>
                      )}
                    </div>

                    <span className="text-neutral-500 font-bold hover:text-black">
                      INSPECT &rarr;
                    </span>
                  </div>

                  {/* Flow Pulse Marker on Current Node */}
                  {isCurrent && (
                    <motion.div
                      layoutId="flowPulse"
                      className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[#00E599] border-2 border-black shadow-[1px_1px_0px_#000]"
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ repeat: Infinity, duration: 1.2 }}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* 🔗 Directional Logic Gate & Circuit Proof */}
          <div className="bg-[#FFFDF5] border-3 border-black rounded-2xl p-4 sm:p-5 shadow-[4px_4px_0px_#000000] space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2 border-b-2 border-black pb-2">
              <span className="font-mono font-black text-xs uppercase flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#FDC800] fill-[#FDC800] stroke-black" />
                <span>DYNAMIC TRIAGE LOGIC &amp; SAFETY GATE ROUTING</span>
              </span>
              <span className="font-mono text-xs font-bold text-neutral-600">
                CONDITION EVALUATOR: STAGE 04 &rarr; STAGE 05/06
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-3 bg-white border-2 border-black rounded-xl space-y-1 shadow-[2px_2px_0px_#000000]">
                <div className="flex items-center gap-2 font-black text-[#00A36C] uppercase">
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>PATH A: EQUILIBRIUM ACHIEVED (SCORE &ge; 3.0)</span>
                </div>
                <p className="text-neutral-700">
                  Data routes to <strong>Longitudinal Velocity Accumulator</strong>. Daily streak safely increments. Zero parent alarms triggered. Authentic progress reinforced.
                </p>
              </div>

              <div className="p-3 bg-white border-2 border-black rounded-xl space-y-1 shadow-[2px_2px_0px_#000000]">
                <div className="flex items-center gap-2 font-black text-[#FF4D4D] uppercase">
                  <AlertCircle className="w-4 h-4 stroke-[3]" />
                  <span>PATH B: SLUMP OR BURNOUT FLAG (SCORE &lt; 2.0 OR 2 ROUGH DAYS)</span>
                </div>
                <p className="text-neutral-700">
                  Bypasses toxic streak penalty. Initiates <strong>Sanctuary Vagus Nerve 4-2-6 Pacing</strong> and autonomously packages dignified Parent Briefing to prevent adolescent crisis.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 🔬 DEEP-DIVE STAGE INSPECTOR */}
        <section className="bg-white border-3 sm:border-4 border-black rounded-3xl p-4 sm:p-7 shadow-[8px_8px_0px_#000000] space-y-6">
          
          {/* Header with Step Details */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-3 border-black pb-5">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-2xl border-3 border-black flex items-center justify-center shrink-0 shadow-[3px_3px_0px_#000000] ${activeNode.badgeColor} text-black`}>
                <ActiveIcon className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-xs text-neutral-500 uppercase">
                    STAGE {activeNode.stageNumber} SPECIFICATION
                  </span>
                  <span className="px-2 py-0.5 bg-black text-[#00E599] rounded font-mono font-black text-[10px] uppercase">
                    {activeNode.scientificDomain}
                  </span>
                </div>
                <h2 className="font-display font-black text-xl sm:text-3xl text-black uppercase tracking-tight">
                  {activeNode.title}: {activeNode.subtitle}
                </h2>
              </div>
            </div>

            {/* Navigation Between Nodes */}
            <div className="flex items-center gap-2 self-start md:self-auto">
              <button
                type="button"
                onClick={() => {
                  try { soundEngine.playClick(); } catch (e) {}
                  setActiveNodeIndex(prev => (prev - 1 + NODES.length) % NODES.length);
                }}
                className="px-3 py-1.5 bg-[#FFFDF5] hover:bg-neutral-100 border-2 border-black rounded-xl font-mono font-black text-xs uppercase shadow-[2px_2px_0px_#000000] active:translate-x-px active:translate-y-px active:shadow-none cursor-pointer"
              >
                &larr; PREV STAGE
              </button>
              <button
                type="button"
                onClick={() => {
                  try { soundEngine.playClick(); } catch (e) {}
                  setActiveNodeIndex(prev => (prev + 1) % NODES.length);
                }}
                className="px-3 py-1.5 bg-[#FDC800] hover:bg-[#e5b500] border-2 border-black rounded-xl font-mono font-black text-xs uppercase shadow-[2px_2px_0px_#000000] active:translate-x-px active:translate-y-px active:shadow-none cursor-pointer"
              >
                NEXT STAGE &rarr;
              </button>
            </div>
          </div>

          {/* Inspector Tab Switcher */}
          <div className="flex items-center gap-2 border-b-2 border-black pb-2 overflow-x-auto">
            <button
              type="button"
              onClick={() => {
                try { soundEngine.playClick(); } catch (e) {}
                setActiveInspectorTab('packet');
              }}
              className={`px-3 py-1.5 rounded-xl border-2 border-black font-mono font-black text-xs uppercase transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                activeInspectorTab === 'packet'
                  ? 'bg-black text-[#00E599] shadow-[2px_2px_0px_#000000]'
                  : 'bg-white text-neutral-700 hover:bg-neutral-100'
              }`}
            >
              <FileText className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>LIVE DATA PACKET</span>
            </button>

            <button
              type="button"
              onClick={() => {
                try { soundEngine.playClick(); } catch (e) {}
                setActiveInspectorTab('math');
              }}
              className={`px-3 py-1.5 rounded-xl border-2 border-black font-mono font-black text-xs uppercase transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                activeInspectorTab === 'math'
                  ? 'bg-black text-[#00E599] shadow-[2px_2px_0px_#000000]'
                  : 'bg-white text-neutral-700 hover:bg-neutral-100'
              }`}
            >
              <Calculator className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>MATHEMATICAL FORMULATION</span>
            </button>

            <button
              type="button"
              onClick={() => {
                try { soundEngine.playClick(); } catch (e) {}
                setActiveInspectorTab('code');
              }}
              className={`px-3 py-1.5 rounded-xl border-2 border-black font-mono font-black text-xs uppercase transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                activeInspectorTab === 'code'
                  ? 'bg-black text-[#00E599] shadow-[2px_2px_0px_#000000]'
                  : 'bg-white text-neutral-700 hover:bg-neutral-100'
              }`}
            >
              <Code2 className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>SOURCE CODE ARCHITECTURE</span>
            </button>

            <button
              type="button"
              onClick={() => {
                try { soundEngine.playClick(); } catch (e) {}
                setActiveInspectorTab('defense');
              }}
              className={`px-3 py-1.5 rounded-xl border-2 border-black font-mono font-black text-xs uppercase transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                activeInspectorTab === 'defense'
                  ? 'bg-black text-[#00E599] shadow-[2px_2px_0px_#000000]'
                  : 'bg-white text-neutral-700 hover:bg-neutral-100'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>JUDGE DEFENSE DEFENSIVE Q&amp;A</span>
            </button>
          </div>

          {/* Tab Content Display */}
          <div className="space-y-4">
            
            {/* TAB 1: Live Data Stream Transformation */}
            {activeInspectorTab === 'packet' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#FFFDF5] border-2 border-black rounded-2xl p-4 shadow-[3px_3px_0px_#000000] space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono font-black text-neutral-500 uppercase">
                    <span>STAGE INGESTION (INPUT)</span>
                    <span className="px-2 py-0.5 bg-neutral-200 text-black rounded text-[10px]">RAW PAYLOAD</span>
                  </div>
                  <div className="p-3 bg-white border border-black rounded-xl font-mono text-xs text-neutral-800 whitespace-pre-wrap leading-relaxed min-h-24">
                    {activeScenarioData.input}
                  </div>
                </div>

                <div className="bg-[#FFFDF5] border-2 border-black rounded-2xl p-4 shadow-[3px_3px_0px_#000000] space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono font-black text-[#00A36C] uppercase">
                    <span>STAGE RESOLUTION (OUTPUT)</span>
                    <span className="px-2 py-0.5 bg-[#00E599] text-black border border-black rounded text-[10px] font-black">
                      TRANSFORMED
                    </span>
                  </div>
                  <div className="p-3 bg-white border border-black rounded-xl font-mono text-xs text-neutral-900 whitespace-pre-wrap leading-relaxed min-h-24 font-bold">
                    {activeScenarioData.output}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: Mathematical & Empirical Formulation */}
            {activeInspectorTab === 'math' && (
              <div className="bg-[#FFFDF5] border-2 border-black rounded-2xl p-4 sm:p-6 shadow-[3px_3px_0px_#000000] space-y-4">
                <div className="space-y-1">
                  <span className="font-mono text-xs font-black text-neutral-500 uppercase">
                    SCIENTIFIC FORMULA &amp; INVARIANT EQUATION
                  </span>
                  <div className="p-4 bg-black text-[#00E599] rounded-xl font-mono text-sm sm:text-base font-bold shadow-[2px_2px_0px_#FFF] overflow-x-auto">
                    {activeNode.formula}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                  <div className="p-3 bg-white border border-black rounded-xl space-y-1">
                    <span className="font-black text-black uppercase">EMPIRICAL PURPOSE:</span>
                    <p className="text-neutral-700 leading-relaxed">{activeNode.summary}</p>
                  </div>
                  <div className="p-3 bg-white border border-black rounded-xl space-y-1">
                    <span className="font-black text-black uppercase">RESEARCH CITATION / STANDARD:</span>
                    <p className="text-neutral-700 leading-relaxed">{activeNode.scientificDomain}</p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: Real Source Code Evidence */}
            {activeInspectorTab === 'code' && (
              <div className="bg-black text-white border-2 border-black rounded-2xl p-4 shadow-[4px_4px_0px_#000000] space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-neutral-400">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-[#00E599]" />
                    <span>PRODUCTION REPOSITORY CODEBASE ARTIFACT</span>
                  </div>
                  <span className="text-[#00E599]">VERIFIED &amp; AUDITED</span>
                </div>
                <pre className="p-3 bg-neutral-900 border border-neutral-700 rounded-xl font-mono text-xs text-[#00E599] overflow-x-auto leading-relaxed">
                  <code>{activeNode.codeSnippet}</code>
                </pre>
              </div>
            )}

            {/* TAB 4: Science Exhibition Judge Defense Q&A */}
            {activeInspectorTab === 'defense' && (
              <div className="bg-[#FFFDF5] border-2 border-black rounded-2xl p-4 sm:p-6 shadow-[3px_3px_0px_#000000] space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 font-mono font-black text-xs text-[#FF4D4D] uppercase">
                    <HelpCircle className="w-4 h-4 stroke-[2.5]" />
                    <span>JUDGE SCRUTINY QUESTION:</span>
                  </div>
                  <p className="p-3 bg-white border border-black rounded-xl font-display font-black text-sm sm:text-base text-black uppercase">
                    "{activeNode.judgeDefense.q}"
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 font-mono font-black text-xs text-[#00A36C] uppercase">
                    <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                    <span>SCIENTIFIC DEFENSE PROTOCOL:</span>
                  </div>
                  <p className="p-3 bg-white border border-black rounded-xl font-mono text-xs sm:text-sm text-neutral-800 leading-relaxed font-medium">
                    {activeNode.judgeDefense.a}
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* 🏆 Bottom Project Accreditation Footer */}
        <footer className="border-t-3 border-black pt-5 pb-8 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs text-neutral-600">
          <div className="flex items-center gap-2">
            <span className="font-black text-black">DAILY VERDICT (SHIT OR HIT)</span>
            <span>&bull;</span>
            <span>GCERT RBVP 2026&ndash;27 STATE SCIENCE EXHIBITION</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-2 py-0.5 bg-black text-white rounded font-bold">SHA-256 ZERO KNOWLEDGE</span>
            <span className="px-2 py-0.5 bg-[#00E599] text-black border border-black rounded font-black">100% DETERMINISTIC</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
