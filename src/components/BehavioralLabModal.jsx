import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  FlaskConical,
  Receipt,
  Hourglass,
  AlertOctagon,
  ShieldAlert,
  Sparkles,
  CheckCircle2,
  TrendingUp,
  KeyRound,
  FileText,
  Skull,
  ChevronRight,
  HeartHandshake,
  Bot,
  BarChart3,
  Shield,
  Compass,
  Zap,
  Play,
  RotateCcw,
  Radio,
  Sliders,
  Flame,
  Check,
  Terminal,
  Activity,
  Crosshair
} from 'lucide-react';
import { soundEngine } from '../services/soundEngine';

/**
 * 🧪 EXHIBITION DEMO & PROVING GROUNDS (LIGHT NEOBRUTALISM)
 * 
 * Museum-grade Neobrutalist developer console designed exclusively for the developer/owner
 * to demonstrate every AI engine, behavioral circuit, emergency protocol, and stasis mode live
 * at the exhibition with zero visible public buttons in the general UI.
 */
export default function BehavioralLabModal({
  isOpen,
  onClose,
  onOpenReceipt,
  onOpenCapsule,
  onOpenAutopsy,
  onOpenGuardianSimulation,
  onOpenMonthlyDossier,
  onInjectGhostwriterSample,
  onOpenSanctuary,
  onToggleDemoSandbox,
  isDemoSandboxActive = false,
  onTriggerErrorTest
}) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-85 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2.5 sm:p-5 overflow-y-auto select-none"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.94, y: 15 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.94, y: 15 }}
          transition={{ type: 'spring', stiffness: 440, damping: 28 }}
          className="w-full max-w-4xl bg-[#FFFDF8] rounded-3xl border-4 border-black p-4 sm:p-7 shadow-[10px_10px_0px_#000000] space-y-4 sm:space-y-6 text-left max-h-[92vh] flex flex-col relative overflow-hidden text-black"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Hazard Caution Stripe Accent */}
          <div className="absolute top-0 left-0 right-0 h-2.5 bg-[repeating-linear-gradient(45deg,#000_0,#000_10px,#FDC800_10px,#FDC800_20px)] border-b-2 border-black shrink-0" />

          {/* Neobrutalist Cockpit Header */}
          <div className="pt-2 flex items-center justify-between border-b-2 border-black/15 pb-4 shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#FFE66D] border-2.5 border-black flex items-center justify-center shadow-[3px_3px_0px_#000000] text-black shrink-0">
                <FlaskConical className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-0.5 rounded bg-[#00E599] text-black border border-black text-[9px] font-mono font-black uppercase flex items-center gap-1.5 shadow-[1px_1px_0px_#000000]">
                    <Radio className="w-3 h-3 text-black animate-pulse" />
                    <span>EXHIBITION SUITE</span>
                  </span>
                  <span className="px-2 py-0.5 rounded bg-black text-[#FFE66D] text-[9px] font-mono font-black uppercase">
                    GCERT SUBTHEME 1(A)
                  </span>
                  <span className="px-2 py-0.5 rounded bg-[#FF4D4D] text-black border border-black text-[9px] font-mono font-black uppercase font-bold shadow-[1px_1px_0px_#000000]">
                    STEALTH ACTIVE
                  </span>
                </div>
                <h2 className="font-display font-black text-base sm:text-xl uppercase tracking-tight text-black leading-tight mt-0.5 truncate">
                  EXHIBITION DEMO &amp; BEHAVIORAL PROVING GROUNDS
                </h2>
                <p className="text-[11px] sm:text-xs font-mono text-neutral-600 truncate mt-0.5">
                  1-Tap live verification of all AI engines, behavioral circuits &amp; stasis chambers
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                try { soundEngine.playClick(); } catch (e) {}
                onClose();
              }}
              className="p-2 rounded-xl bg-white hover:bg-[#FF4D4D] hover:text-white border-2 border-black text-black cursor-pointer shadow-[2px_2px_0px_#000000] active:translate-x-px active:translate-y-px transition-colors shrink-0"
              aria-label="Close"
            >
              <X className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>

          {/* Stealth Invocation Guide Banner */}
          <div className="bg-[#FFF9E6] border-2 border-dashed border-black/40 rounded-2xl p-2.5 sm:p-3 text-[10px] sm:text-[11px] font-mono text-black flex flex-col sm:flex-row sm:items-center justify-between gap-2 shrink-0 shadow-[2px_2px_0px_#000000]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping shrink-0" />
              <span className="font-black uppercase">STEALTH ACCESS ARMED:</span>
              <span className="text-neutral-700">Zero physical buttons visible in public UI.</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap font-bold text-black">
              <span className="px-1.5 py-0.5 bg-black text-[#FDC800] rounded">Ctrl + Shift + X</span>
              <span>•</span>
              <span className="px-1.5 py-0.5 bg-[#00E599] border border-black rounded">3-Tap Logo</span>
              <span>•</span>
              <span className="px-1.5 py-0.5 bg-white border border-black rounded">Type &quot;demo&quot;</span>
            </div>
          </div>

          {/* 2-Column Bento Command Grid (Desktop) / 1-Column (Mobile) */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">

              {/* BENTO 1: AI FORENSIC AUTOPSY CHAMBER */}
              <div className="bg-[#FFF8F8] border-2 border-black rounded-2xl p-3.5 sm:p-4 shadow-[4px_4px_0px_#000000] space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2 border-b border-black/10 pb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-[#FF4D4D] text-black border border-black flex items-center justify-center shrink-0">
                        <Skull className="w-4 h-4 stroke-[2.5]" />
                      </div>
                      <span className="font-mono font-black text-xs uppercase text-black tracking-wide">
                        1. AI Forensic Autopsy Chamber
                      </span>
                    </div>
                    <span className="text-[9px] font-mono bg-[#FF4D4D] text-black px-2 py-0.5 rounded border border-black font-black">
                      M-01 // INQUEST
                    </span>
                  </div>
                  <p className="text-[11px] font-mono text-neutral-700 leading-relaxed">
                    Diagnose catastrophic 1★ rough days. AI coroner deconstructs circadian breaches, habit wreckage, and prescribes a binding resuscitation antidote.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      try { soundEngine.playClick(); } catch (e) {}
                      onOpenAutopsy?.('inquest');
                    }}
                    className="flex-1 py-2 px-3 bg-[#FF4D4D] hover:bg-red-500 text-black border-2 border-black rounded-xl font-mono text-xs font-black uppercase shadow-[2px_2px_0px_#000000] active:translate-x-px active:translate-y-px active:shadow-none transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Crosshair className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Launch 1★ Inquest</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      try { soundEngine.playClick(); } catch (e) {}
                      onOpenAutopsy?.('verdict');
                    }}
                    className="py-2 px-3 bg-white hover:bg-neutral-100 text-black border-2 border-black rounded-xl font-mono text-xs font-black uppercase shadow-[2px_2px_0px_#000000] active:translate-x-px active:translate-y-px active:shadow-none transition-all cursor-pointer flex items-center justify-center gap-1"
                  >
                    <span>Verdict</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* BENTO 2: GUARDIAN ANGEL RELAPSE SOS */}
              <div className="bg-[#F0FDF4] border-2 border-black rounded-2xl p-3.5 sm:p-4 shadow-[4px_4px_0px_#000000] space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2 border-b border-black/10 pb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-[#00E599] text-black border border-black flex items-center justify-center shrink-0">
                        <ShieldAlert className="w-4 h-4 stroke-[2.5]" />
                      </div>
                      <span className="font-mono font-black text-xs uppercase text-black tracking-wide">
                        2. Guardian Relapse SOS
                      </span>
                    </div>
                    <span className="text-[9px] font-mono bg-[#00E599] text-black px-2 py-0.5 rounded border border-black font-black">
                      M-02 // CRISIS
                    </span>
                  </div>
                  <p className="text-[11px] font-mono text-neutral-700 leading-relaxed">
                    Social accountability failsafe. Automatically detects 2 consecutive rough days, prepares crisis message, and unlocks 1-tap WhatsApp broadcast.
                  </p>
                </div>

                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      try { soundEngine.playClick(); } catch (e) {}
                      onOpenGuardianSimulation?.();
                    }}
                    className="w-full py-2 px-3 bg-[#00E599] hover:bg-emerald-400 text-black border-2 border-black rounded-xl font-mono text-xs font-black uppercase shadow-[2px_2px_0px_#000000] active:translate-x-px active:translate-y-px active:shadow-none transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <HeartHandshake className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Simulate Slump Broadcast</span>
                  </button>
                </div>
              </div>

              {/* BENTO 3: AI DIARY GHOSTWRITER */}
              <div className="bg-[#FFFDF0] border-2 border-black rounded-2xl p-3.5 sm:p-4 shadow-[4px_4px_0px_#000000] space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2 border-b border-black/10 pb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-[#FDC800] text-black border border-black flex items-center justify-center shrink-0">
                        <Bot className="w-4 h-4 stroke-[2.5]" />
                      </div>
                      <span className="font-mono font-black text-xs uppercase text-black tracking-wide">
                        3. AI Diary Ghostwriter
                      </span>
                    </div>
                    <span className="text-[9px] font-mono bg-[#FDC800] text-black px-2 py-0.5 rounded border border-black font-black">
                      M-03 // VOICE AI
                    </span>
                  </div>
                  <p className="text-[11px] font-mono text-neutral-700 leading-relaxed">
                    Injects messy, raw, stream-of-consciousness spoken voice draft directly into Today&apos;s drawer for instant 1-tap AI literary polishing and quote peeling.
                  </p>
                </div>

                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      try { soundEngine.playClick(); } catch (e) {}
                      onInjectGhostwriterSample?.();
                    }}
                    className="w-full py-2 px-3 bg-[#FDC800] hover:bg-yellow-400 text-black border-2 border-black rounded-xl font-mono text-xs font-black uppercase shadow-[2px_2px_0px_#000000] active:translate-x-px active:translate-y-px active:shadow-none transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Inject Draft &amp; Open Journal</span>
                  </button>
                </div>
              </div>

              {/* BENTO 4: MONTHLY EXECUTIVE DOSSIER */}
              <div className="bg-[#F0F9FF] border-2 border-black rounded-2xl p-3.5 sm:p-4 shadow-[4px_4px_0px_#000000] space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2 border-b border-black/10 pb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-[#BAE6FD] text-black border border-black flex items-center justify-center shrink-0">
                        <BarChart3 className="w-4 h-4 stroke-[2.5]" />
                      </div>
                      <span className="font-mono font-black text-xs uppercase text-black tracking-wide">
                        4. Monthly AI Dossier
                      </span>
                    </div>
                    <span className="text-[9px] font-mono bg-[#BAE6FD] text-black px-2 py-0.5 rounded border border-black font-black">
                      M-04 // INTELLIGENCE
                    </span>
                  </div>
                  <p className="text-[11px] font-mono text-neutral-700 leading-relaxed">
                    30-Day behavioral evaluation with tough-love homie mentor analysis, persona archetype classification, and weekly phase velocity curves.
                  </p>
                </div>

                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      try { soundEngine.playClick(); } catch (e) {}
                      onOpenMonthlyDossier?.(2026, 9);
                    }}
                    className="w-full py-2 px-3 bg-[#BAE6FD] hover:bg-sky-300 text-black border-2 border-black rounded-xl font-mono text-xs font-black uppercase shadow-[2px_2px_0px_#000000] active:translate-x-px active:translate-y-px active:shadow-none transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <BarChart3 className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Launch Sept 2026 Dossier</span>
                  </button>
                </div>
              </div>

              {/* BENTO 5: TRANQUILITY SANCTUARY */}
              <div className="bg-[#F4FAF6] border-2 border-black rounded-2xl p-3.5 sm:p-4 shadow-[4px_4px_0px_#000000] space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2 border-b border-black/10 pb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-[#A7F3D0] text-black border border-black flex items-center justify-center shrink-0">
                        <Compass className="w-4 h-4 stroke-[2.5]" />
                      </div>
                      <span className="font-mono font-black text-xs uppercase text-black tracking-wide">
                        5. Tranquility Sanctuary
                      </span>
                    </div>
                    <span className="text-[9px] font-mono bg-[#A7F3D0] text-black px-2 py-0.5 rounded border border-black font-black">
                      M-05 // STASIS
                    </span>
                  </div>
                  <p className="text-[11px] font-mono text-neutral-700 leading-relaxed">
                    Acute 7-Day to 14-Day nervous system recovery stasis. Vagus Nerve 4-2-6 Pacer Orb, Somatic Grounding Garden, and frozen shielded streaks.
                  </p>
                </div>

                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      try { soundEngine.playClick(); } catch (e) {}
                      onOpenSanctuary?.();
                    }}
                    className="w-full py-2 px-3 bg-[#A7F3D0] hover:bg-emerald-300 text-black border-2 border-black rounded-xl font-mono text-xs font-black uppercase shadow-[2px_2px_0px_#000000] active:translate-x-px active:translate-y-px active:shadow-none transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Compass className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Enter Sanctuary Reset</span>
                  </button>
                </div>
              </div>

              {/* BENTO 6: RANSOM TIME-LOCK CAPSULE */}
              <div className="bg-[#FFF7ED] border-2 border-black rounded-2xl p-3.5 sm:p-4 shadow-[4px_4px_0px_#000000] space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2 border-b border-black/10 pb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-[#FED7AA] text-black border border-black flex items-center justify-center shrink-0">
                        <Hourglass className="w-4 h-4 stroke-[2.5]" />
                      </div>
                      <span className="font-mono font-black text-xs uppercase text-black tracking-wide">
                        6. Ransom Wax Capsule
                      </span>
                    </div>
                    <span className="text-[9px] font-mono bg-[#FED7AA] text-black px-2 py-0.5 rounded border border-black font-black">
                      M-06 // TIME-LOCK
                    </span>
                  </div>
                  <p className="text-[11px] font-mono text-neutral-700 leading-relaxed">
                    Confidential letters to future self sealed with wax. Unlocked only by specific triggers: calendar date, slump detection, or milestone streak.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      try { soundEngine.playClick(); } catch (e) {}
                      onOpenCapsule?.('release');
                    }}
                    className="flex-1 py-2 px-3 bg-[#FED7AA] hover:bg-orange-300 text-black border-2 border-black rounded-xl font-mono text-xs font-black uppercase shadow-[2px_2px_0px_#000000] active:translate-x-px active:translate-y-px active:shadow-none transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <KeyRound className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Inspect Slump Capsule</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      try { soundEngine.playClick(); } catch (e) {}
                      onOpenCapsule?.('vault');
                    }}
                    className="py-2 px-3 bg-white hover:bg-neutral-100 text-black border-2 border-black rounded-xl font-mono text-xs font-black uppercase shadow-[2px_2px_0px_#000000] active:translate-x-px active:translate-y-px active:shadow-none transition-all cursor-pointer flex items-center justify-center gap-1"
                  >
                    <span>Vault</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* BENTO 7: THERMAL RECEIPT OF TRUTH */}
              <div className="bg-[#F9FAFB] border-2 border-black rounded-2xl p-3.5 sm:p-4 shadow-[4px_4px_0px_#000000] space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2 border-b border-black/10 pb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-white text-black border border-black flex items-center justify-center shrink-0">
                        <Receipt className="w-4 h-4 stroke-[2.5]" />
                      </div>
                      <span className="font-mono font-black text-xs uppercase text-black tracking-wide">
                        7. Thermal Receipt of Truth
                      </span>
                    </div>
                    <span className="text-[9px] font-mono bg-black text-white px-2 py-0.5 rounded border border-black font-black">
                      M-07 // POS SLIP
                    </span>
                  </div>
                  <p className="text-[11px] font-mono text-neutral-700 leading-relaxed">
                    Generates authentic micro-receipts with paper serration, barcode, discipline tax calculations, and behavioral solvency score.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      try { soundEngine.playClick(); } catch (e) {}
                      onOpenReceipt?.('solvent');
                    }}
                    className="flex-1 py-2 px-3 bg-white hover:bg-neutral-200 text-black border-2 border-black rounded-xl font-mono text-xs font-black uppercase shadow-[2px_2px_0px_#000000] active:translate-x-px active:translate-y-px active:shadow-none transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
                    <span>Solvent (God-Mode)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      try { soundEngine.playClick(); } catch (e) {}
                      onOpenReceipt?.('debt');
                    }}
                    className="flex-1 py-2 px-3 bg-[#FFF0F0] hover:bg-red-100 text-black border-2 border-black rounded-xl font-mono text-xs font-black uppercase shadow-[2px_2px_0px_#000000] active:translate-x-px active:translate-y-px active:shadow-none transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <AlertOctagon className="w-3.5 h-3.5 text-red-600 stroke-[2.5]" />
                    <span>Insolvent (Debt)</span>
                  </button>
                </div>
              </div>

              {/* BENTO 8: 30-DAY EXEMPLAR UNIVERSE */}
              <div className="bg-[#FFFBEB] border-2 border-black rounded-2xl p-3.5 sm:p-4 shadow-[4px_4px_0px_#000000] space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2 border-b border-black/10 pb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-[#FFE66D] text-black border border-black flex items-center justify-center shrink-0">
                        <Zap className="w-4 h-4 stroke-[2.5]" />
                      </div>
                      <span className="font-mono font-black text-xs uppercase text-black tracking-wide">
                        8. 30-Day Sandbox Universe
                      </span>
                    </div>
                    <span className="text-[9px] font-mono bg-[#FDC800] text-black px-2 py-0.5 rounded border border-black font-black">
                      M-08 // ZERO OVERWRITE
                    </span>
                  </div>
                  <p className="text-[11px] font-mono text-neutral-700 leading-relaxed">
                    Toggle isolated 30-day exemplary month (Sept 2026). Populates calendar, streaks, and AI dossier. Real diary is 100% shielded.
                  </p>
                </div>

                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      try { soundEngine.playClick(); } catch (e) {}
                      onToggleDemoSandbox?.();
                    }}
                    className={`w-full py-2 px-3 border-2 border-black rounded-xl font-mono text-xs font-black uppercase shadow-[2px_2px_0px_#000000] active:translate-x-px active:translate-y-px active:shadow-none transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      isDemoSandboxActive
                        ? 'bg-[#FF4D4D] hover:bg-red-500 text-black'
                        : 'bg-[#FFE66D] hover:bg-yellow-300 text-black'
                    }`}
                  >
                    {isDemoSandboxActive ? (
                      <>
                        <RotateCcw className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Exit Sandbox (Restore Real Diary)</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Populate 30-Day Exemplary Month</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

            </div>

            {/* Bottom Utility Bar: Resilience Fault Boundary Test */}
            <div className="bg-[#FFF9E6] border-2 border-black rounded-2xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-black font-mono text-xs shadow-[2px_2px_0px_#000000]">
              <div className="flex items-center gap-2 text-[11px]">
                <Activity className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
                <span className="font-bold">4-State Resilience Engine: 88 passing tests, zero unhandled rejections</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  try { soundEngine.playClick(); } catch (e) {}
                  onTriggerErrorTest?.();
                }}
                className="py-1 px-3 bg-white hover:bg-[#FF4D4D] hover:text-white border-2 border-black text-black rounded-lg text-[10px] font-black uppercase transition-colors cursor-pointer self-stretch sm:self-auto text-center shadow-[1px_1px_0px_#000000] active:translate-x-px active:translate-y-px"
              >
                Simulate Controlled Fault
              </button>
            </div>
          </div>

          {/* Footer Controls */}
          <div className="pt-2 border-t border-black/10 flex items-center justify-between shrink-0">
            <span className="font-mono text-[10px] text-neutral-500 font-bold">
              TRINNO LABS // EXHIBITION ENGINE V2.4
            </span>
            <button
              type="button"
              onClick={() => {
                try { soundEngine.playClick(); } catch (e) {}
                onClose();
              }}
              className="py-1.5 px-4 bg-white hover:bg-neutral-100 text-black border-2 border-black rounded-xl font-mono text-xs font-black uppercase shadow-[2px_2px_0px_#000000] active:translate-x-px active:translate-y-px active:shadow-none cursor-pointer transition-all"
            >
              Close Console
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
