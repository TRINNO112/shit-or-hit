import React, { useState } from 'react';
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
  TrendingDown,
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
  Play
} from 'lucide-react';
import { soundEngine } from '../services/soundEngine';

/**
 * 🧪 EXHIBITION MASTER DEMO & AI SHOWCASE STUDIO
 * Single-tap control hub to demonstrate every AI engine, behavioral mechanism,
 * emergency protocol, and stasis mode live for evaluators, judges, and exhibitions.
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
        className="fixed inset-0 z-85 bg-black/80 backdrop-blur-md flex items-center justify-center p-2.5 sm:p-5 overflow-y-auto select-none"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.94, y: 15 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.94, y: 15 }}
          transition={{ type: 'spring', stiffness: 420, damping: 28 }}
          className="w-full max-w-3xl bg-[#FFFDF8] rounded-3xl border-3 border-black p-4 sm:p-7 shadow-[8px_8px_0px_#000000] space-y-4 sm:space-y-6 text-left max-h-[92vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b-2 border-black/15 pb-3.5 sm:pb-4 shrink-0">
            <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#FFE66D] border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_#000000] text-black shrink-0">
                <FlaskConical className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-0.5 rounded bg-black text-[#FFE66D] text-[9px] font-mono font-black uppercase">
                    GCERT SUBTHEME 1(A)
                  </span>
                  <span className="px-2 py-0.5 rounded bg-[#00E599] text-black border border-black text-[9px] font-mono font-black uppercase">
                    EXHIBITION SUITE
                  </span>
                </div>
                <h2 className="font-display font-black text-base sm:text-xl uppercase tracking-tight text-black leading-tight mt-0.5 truncate">
                  EXHIBITION DEMO &amp; AI SHOWCASE STUDIO
                </h2>
                <p className="text-[11px] sm:text-xs font-mono text-neutral-600 truncate mt-0.5">
                  1-Tap instant live simulation of all AI engines &amp; behavioral protocols
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                try { soundEngine.playClick(); } catch (e) {}
                onClose();
              }}
              className="p-2 rounded-xl bg-neutral-100 hover:bg-[#FF4D4D] hover:text-white border-2 border-black text-black cursor-pointer shadow-[2px_2px_0px_#000000] active:translate-x-px active:translate-y-px transition-colors shrink-0"
            >
              <X className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>

          {/* Body Content - Scrollable */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-black">

            {/* SHOWCASE 1: AI FORENSIC AUTOPSY CHAMBER */}
            <div className="bg-white border-2 border-black rounded-2xl p-4 shadow-[3px_3px_0px_#000000] space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-black/10 pb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-lg bg-red-100 border border-black text-red-600">
                    <AlertOctagon className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <h3 className="font-mono font-black text-xs sm:text-sm uppercase text-black">
                    1. AI Forensic Autopsy Chamber
                  </h3>
                </div>
                <span className="text-[10px] font-mono bg-neutral-100 px-2 py-0.5 rounded border border-black/20 font-bold self-start sm:self-auto">
                  Gemini Interrogator + 3-Step Antidote
                </span>
              </div>
              <p className="text-xs text-neutral-600 leading-relaxed font-mono">
                Investigates rough day collapses without touching authentic user data. Pinpoints root cause of failure and prescribes a structured recovery antidote.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    try { soundEngine.playClick(); } catch (e) {}
                    if (onOpenAutopsy) onOpenAutopsy('questioning');
                  }}
                  className="p-3 bg-[#FF4D4D]/15 hover:bg-[#FF4D4D]/25 border-2 border-black rounded-xl text-left font-mono transition-all cursor-pointer shadow-[2px_2px_0px_#000000] active:translate-x-px active:translate-y-px"
                >
                  <div className="flex items-center gap-1.5 text-xs font-black text-red-950 mb-0.5">
                    <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 stroke-[2.5]" />
                    <span>LAUNCH INTERROGATION (LIVE)</span>
                  </div>
                  <div className="text-[10px] text-red-800 leading-normal">
                    Loads simulated phone doomscroll &amp; sleep deficit telemetry to generate 3 dynamic questions.
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    try { soundEngine.playClick(); } catch (e) {}
                    if (onOpenAutopsy) onOpenAutopsy('verdict');
                  }}
                  className="p-3 bg-[#FDC800]/20 hover:bg-[#FDC800]/35 border-2 border-black rounded-xl text-left font-mono transition-all cursor-pointer shadow-[2px_2px_0px_#000000] active:translate-x-px active:translate-y-px"
                >
                  <div className="flex items-center gap-1.5 text-xs font-black text-neutral-900 mb-0.5">
                    <CheckCircle2 className="w-4 h-4 text-amber-700 shrink-0 stroke-[2.5]" />
                    <span>CORONER VERDICT &amp; ANTIDOTE</span>
                  </div>
                  <div className="text-[10px] text-neutral-700 leading-normal">
                    Displays classified forensic inquest findings and 3-step action recovery blueprint.
                  </div>
                </button>
              </div>
            </div>

            {/* SHOWCASE 2: GUARDIAN SOS & FAMILY EMERGENCY TRIAGE */}
            <div className="bg-white border-2 border-black rounded-2xl p-4 shadow-[3px_3px_0px_#000000] space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-black/10 pb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-lg bg-emerald-100 border border-black text-emerald-700">
                    <HeartHandshake className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <h3 className="font-mono font-black text-xs sm:text-sm uppercase text-black">
                    2. Guardian SOS &amp; Family Triage Protocol
                  </h3>
                </div>
                <span className="text-[10px] font-mono bg-[#00E599]/20 text-emerald-950 px-2 py-0.5 rounded border border-black/20 font-bold self-start sm:self-auto">
                  Two-Phase AI + Zero Quota Burn
                </span>
              </div>
              <p className="text-xs text-neutral-600 leading-relaxed font-mono">
                Automated zero-device crisis notification. Simulates a 2-day academic/health slump to showcase parent briefings without sending unneeded emails.
              </p>

              <button
                type="button"
                onClick={() => {
                  try { soundEngine.playClick(); } catch (e) {}
                  if (onOpenGuardianSimulation) onOpenGuardianSimulation();
                }}
                className="w-full p-3 bg-[#FFE66D]/30 hover:bg-[#FFE66D]/50 border-2 border-black rounded-xl text-left font-mono transition-all cursor-pointer shadow-[2px_2px_0px_#000000] active:translate-x-px active:translate-y-px flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-black text-neutral-950 mb-0.5">
                    <HeartHandshake className="w-4 h-4 text-emerald-700 shrink-0 stroke-[2.5]" />
                    <span>LAUNCH SLUMP SIMULATION (2-DAY COLLAPSE &amp; BRIEFING)</span>
                  </div>
                  <div className="text-[10px] text-neutral-700">
                    Ingests mock Oct 14 1★ fever + Oct 15 2★ insomnia notes. Generates full confidential family briefing instantly.
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-black shrink-0 ml-2" />
              </button>
            </div>

            {/* SHOWCASE 3: AI DIARY GHOSTWRITER LIVE POLISH */}
            <div className="bg-white border-2 border-black rounded-2xl p-4 shadow-[3px_3px_0px_#000000] space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-black/10 pb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-lg bg-yellow-100 border border-black text-amber-700">
                    <Bot className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <h3 className="font-mono font-black text-xs sm:text-sm uppercase text-black">
                    3. AI Diary Ghostwriter (First-Person Stoic Polish)
                  </h3>
                </div>
                <span className="text-[10px] font-mono bg-neutral-100 px-2 py-0.5 rounded border border-black/20 font-bold self-start sm:self-auto">
                  Multi-Pass Peeling Pipeline
                </span>
              </div>
              <p className="text-xs text-neutral-600 leading-relaxed font-mono">
                Populates today&apos;s reflection drawer with messy, stream-of-consciousness raw thought so you can click &ldquo;AI POLISH&rdquo; live in front of evaluators.
              </p>

              <button
                type="button"
                onClick={() => {
                  try { soundEngine.playClick(); } catch (e) {}
                  if (onInjectGhostwriterSample) onInjectGhostwriterSample();
                }}
                className="w-full p-3 bg-[#00E599]/20 hover:bg-[#00E599]/35 border-2 border-black rounded-xl text-left font-mono transition-all cursor-pointer shadow-[2px_2px_0px_#000000] active:translate-x-px active:translate-y-px flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-black text-emerald-950 mb-0.5">
                    <Sparkles className="w-4 h-4 text-emerald-700 shrink-0 stroke-[2.5]" />
                    <span>LOAD SAMPLE DRAFT &amp; OPEN TODAY&apos;S JOURNAL</span>
                  </div>
                  <div className="text-[10px] text-emerald-900">
                    Loads unedited student draft (&ldquo;bro today was cooked woke up 90 mins late...&rdquo;) ready for 2-second polish.
                  </div>
                </div>
                <Play className="w-4 h-4 text-emerald-950 fill-emerald-950 shrink-0 ml-2" />
              </button>
            </div>

            {/* SHOWCASE 4: MONTHLY AI DOSSIER & VELOCITY CURVES */}
            <div className="bg-white border-2 border-black rounded-2xl p-4 shadow-[3px_3px_0px_#000000] space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-black/10 pb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-lg bg-blue-100 border border-black text-blue-700">
                    <BarChart3 className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <h3 className="font-mono font-black text-xs sm:text-sm uppercase text-black">
                    4. Monthly AI Dossier &amp; Executive Intelligence
                  </h3>
                </div>
                <span className="text-[10px] font-mono bg-neutral-100 px-2 py-0.5 rounded border border-black/20 font-bold self-start sm:self-auto">
                  September 2026 Exemplary Month
                </span>
              </div>
              <p className="text-xs text-neutral-600 leading-relaxed font-mono">
                Launches the complete 30-day dossier featuring Homie tough-love mentor feedback, behavioral persona archetype, weekly velocity, and live AI re-evaluation.
              </p>

              <button
                type="button"
                onClick={() => {
                  try { soundEngine.playClick(); } catch (e) {}
                  if (onOpenMonthlyDossier) onOpenMonthlyDossier(2026, 9);
                }}
                className="w-full p-3 bg-blue-50 hover:bg-blue-100 border-2 border-black rounded-xl text-left font-mono transition-all cursor-pointer shadow-[2px_2px_0px_#000000] active:translate-x-px active:translate-y-px flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-black text-blue-950 mb-0.5">
                    <BarChart3 className="w-4 h-4 text-blue-700 shrink-0 stroke-[2.5]" />
                    <span>OPEN SEPTEMBER 2026 MASTER DOSSIER</span>
                  </div>
                  <div className="text-[10px] text-blue-800">
                    Comprehensive month-end executive review with 30-day trajectory data and friction diagnostic breakdowns.
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-black shrink-0 ml-2" />
              </button>
            </div>

            {/* SHOWCASE 5: TRANQUILITY SANCTUARY & VAGUS PACER */}
            <div className="bg-white border-2 border-black rounded-2xl p-4 shadow-[3px_3px_0px_#000000] space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-black/10 pb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-lg bg-emerald-100 border border-black text-emerald-700">
                    <Shield className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <h3 className="font-mono font-black text-xs sm:text-sm uppercase text-black">
                    5. Life Pause Architecture (Tranquility Sanctuary)
                  </h3>
                </div>
                <span className="text-[10px] font-mono bg-neutral-100 px-2 py-0.5 rounded border border-black/20 font-bold self-start sm:self-auto">
                  Streak Frozen &amp; Shielded
                </span>
              </div>
              <p className="text-xs text-neutral-600 leading-relaxed font-mono">
                Calm technology recovery space featuring the Vagus Nerve 4-2-6 Pacer Orb, Somatic Grounding Garden, and zero dopamine pressure.
              </p>

              <button
                type="button"
                onClick={() => {
                  try { soundEngine.playClick(); } catch (e) {}
                  if (onOpenSanctuary) onOpenSanctuary();
                }}
                className="w-full p-3 bg-emerald-50 hover:bg-emerald-100 border-2 border-black rounded-xl text-left font-mono transition-all cursor-pointer shadow-[2px_2px_0px_#000000] active:translate-x-px active:translate-y-px flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-black text-emerald-950 mb-0.5">
                    <Compass className="w-4 h-4 text-emerald-700 shrink-0 stroke-[2.5]" />
                    <span>ENTER TRANQUILITY SANCTUARY (STASIS PREVIEW)</span>
                  </div>
                  <div className="text-[10px] text-emerald-800">
                    Demonstrate nervous system reset, breath orb pacing, and indefinite streak freeze architecture.
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-black shrink-0 ml-2" />
              </button>
            </div>

            {/* SHOWCASE 6: TIME & MOOD CAPSULE VAULT */}
            <div className="bg-white border-2 border-black rounded-2xl p-4 shadow-[3px_3px_0px_#000000] space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-black/10 pb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-lg bg-amber-100 border border-black text-amber-700">
                    <Hourglass className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <h3 className="font-mono font-black text-xs sm:text-sm uppercase text-black">
                    6. Ransom Time-Lock Capsule Vault
                  </h3>
                </div>
                <span className="text-[10px] font-mono bg-neutral-100 px-2 py-0.5 rounded border border-black/20 font-bold self-start sm:self-auto">
                  Zero-Knowledge AES Cipher
                </span>
              </div>
              <p className="text-xs text-neutral-600 leading-relaxed font-mono">
                Confidential letters to future self sealed with wax. Unlocked only by specific triggers: Calendar Date, Slump Detection, or Milestone Streaks.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    try { soundEngine.playClick(); } catch (e) {}
                    if (onOpenCapsule) onOpenCapsule('vault');
                  }}
                  className="p-2.5 bg-[#FDC800]/20 hover:bg-[#FDC800]/35 border-2 border-black rounded-xl text-left font-mono transition-all cursor-pointer shadow-[2px_2px_0px_#000000] active:translate-x-px active:translate-y-px"
                >
                  <div className="flex items-center gap-1.5 text-xs font-black text-neutral-900 mb-0.5">
                    <KeyRound className="w-4 h-4 text-neutral-800 shrink-0 stroke-[2.5]" />
                    <span>VAULT GALLERY</span>
                  </div>
                  <div className="text-[10px] text-neutral-700">
                    Browse sealed wax letters &amp; live countdown locks
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    try { soundEngine.playClick(); } catch (e) {}
                    if (onOpenCapsule) onOpenCapsule('create');
                  }}
                  className="p-2.5 bg-neutral-100 hover:bg-neutral-200 border-2 border-black rounded-xl text-left font-mono transition-all cursor-pointer shadow-[2px_2px_0px_#000000] active:translate-x-px active:translate-y-px"
                >
                  <div className="flex items-center gap-1.5 text-xs font-black text-neutral-900 mb-0.5">
                    <FileText className="w-4 h-4 text-neutral-800 shrink-0 stroke-[2.5]" />
                    <span>CRAFT CAPSULE</span>
                  </div>
                  <div className="text-[10px] text-neutral-700">
                    Configure date/slump triggers &amp; seal types
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    try { soundEngine.playClick(); } catch (e) {}
                    if (onOpenCapsule) onOpenCapsule('release');
                  }}
                  className="p-2.5 bg-[#00E599]/20 hover:bg-[#00E599]/35 border-2 border-black rounded-xl text-left font-mono transition-all cursor-pointer shadow-[2px_2px_0px_#000000] active:translate-x-px active:translate-y-px"
                >
                  <div className="flex items-center gap-1.5 text-xs font-black text-emerald-900 mb-0.5">
                    <Sparkles className="w-4 h-4 text-emerald-700 shrink-0 stroke-[2.5]" />
                    <span>UNSEAL TYPEWRITER</span>
                  </div>
                  <div className="text-[10px] text-emerald-800">
                    Interactive audio typewriter letter unsealing
                  </div>
                </button>
              </div>
            </div>

            {/* SHOWCASE 7: THERMAL RECEIPT OF TRUTH */}
            <div className="bg-white border-2 border-black rounded-2xl p-4 shadow-[3px_3px_0px_#000000] space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-black/10 pb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-lg bg-neutral-100 border border-black text-neutral-800">
                    <Receipt className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <h3 className="font-mono font-black text-xs sm:text-sm uppercase text-black">
                    7. Receipt of Truth (Monthly Life Debt &amp; Equity)
                  </h3>
                </div>
                <span className="text-[10px] font-mono bg-neutral-100 px-2 py-0.5 rounded border border-black/20 font-bold self-start sm:self-auto">
                  Tactile Thermal Slip
                </span>
              </div>
              <p className="text-xs text-neutral-600 leading-relaxed font-mono">
                Evaluates discipline balance sheets: Net Equity = Assets (God-mode hits, habit anchors) minus Liabilities (trench fines, slump taxes).
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    try { soundEngine.playClick(); } catch (e) {}
                    if (onOpenReceipt) onOpenReceipt('solvent');
                  }}
                  className="p-2.5 bg-[#00E599]/20 hover:bg-[#00E599]/35 border-2 border-black rounded-xl text-left font-mono transition-all cursor-pointer shadow-[2px_2px_0px_#000000] active:translate-x-px active:translate-y-px"
                >
                  <div className="flex items-center gap-1.5 text-xs font-black text-emerald-950 mb-0.5">
                    <TrendingUp className="w-4 h-4 text-emerald-700 shrink-0 stroke-[2.5]" />
                    <span>SOLVENT (+140 EQ)</span>
                  </div>
                  <div className="text-[10px] text-emerald-800">
                    Green paid stamp &amp; high consistency equity
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    try { soundEngine.playClick(); } catch (e) {}
                    if (onOpenReceipt) onOpenReceipt('debt');
                  }}
                  className="p-2.5 bg-[#FF4D4D]/20 hover:bg-[#FF4D4D]/35 border-2 border-black rounded-xl text-left font-mono transition-all cursor-pointer shadow-[2px_2px_0px_#000000] active:translate-x-px active:translate-y-px"
                >
                  <div className="flex items-center gap-1.5 text-xs font-black text-red-950 mb-0.5">
                    <TrendingDown className="w-4 h-4 text-red-700 shrink-0 stroke-[2.5]" />
                    <span>IN LIFE DEBT (-85 EQ)</span>
                  </div>
                  <div className="text-[10px] text-red-800">
                    Red tilted debt stamp &amp; slump taxes
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    try { soundEngine.playClick(); } catch (e) {}
                    if (onOpenReceipt) onOpenReceipt('live');
                  }}
                  className="p-2.5 bg-[#FFE66D]/30 hover:bg-[#FFE66D]/50 border-2 border-black rounded-xl text-left font-mono transition-all cursor-pointer shadow-[2px_2px_0px_#000000] active:translate-x-px active:translate-y-px"
                >
                  <div className="flex items-center gap-1.5 text-xs font-black text-neutral-900 mb-0.5">
                    <Sparkles className="w-4 h-4 text-amber-700 shrink-0 stroke-[2.5]" />
                    <span>LIVE USER MONTH</span>
                  </div>
                  <div className="text-[10px] text-neutral-700">
                    Calculates ledger directly from active entries
                  </div>
                </button>
              </div>
            </div>

            {/* SHOWCASE 8: MASTER 30-DAY SANDBOX TOGGLE */}
            <div className="bg-[#FFF9E6] border-2 border-black rounded-2xl p-4 shadow-[3px_3px_0px_#000000] space-y-2.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-lg bg-black text-[#FFE66D]">
                    <Zap className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <h3 className="font-mono font-black text-xs sm:text-sm uppercase text-black">
                    8. Master 30-Day Isolated Sandbox
                  </h3>
                </div>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded border border-black font-black uppercase self-start sm:self-auto ${
                  isDemoSandboxActive ? 'bg-[#00E599] text-black' : 'bg-neutral-200 text-neutral-700'
                }`}>
                  {isDemoSandboxActive ? 'SANDBOX ACTIVE' : 'REAL DIARY ACTIVE'}
                </span>
              </div>
              <p className="text-xs text-neutral-700 leading-relaxed font-mono">
                Instantly switch the entire application between your authentic diary and the complete 30-day September 2026 dataset. Zero cloud upload.
              </p>

              <button
                type="button"
                onClick={() => {
                  try { soundEngine.playClick(); } catch (e) {}
                  if (onToggleDemoSandbox) onToggleDemoSandbox();
                }}
                className={`w-full py-2.5 px-4 font-mono text-xs font-black uppercase rounded-xl border-2 border-black shadow-[2px_2px_0px_#000000] active:translate-x-px active:translate-y-px transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  isDemoSandboxActive 
                    ? 'bg-[#FF4D4D] text-white hover:bg-red-600' 
                    : 'bg-[#FDC800] text-black hover:bg-yellow-400'
                }`}
              >
                <Zap className="w-4 h-4 stroke-[2.5]" />
                <span>{isDemoSandboxActive ? 'EXIT DEMO SANDBOX (RESTORE REAL DIARY)' : 'ENTER 30-DAY DEMO SANDBOX (SEPTEMBER 2026)'}</span>
              </button>
            </div>

            {/* SHOWCASE 9: REACTOR CORE ERROR TEST */}
            <div className="bg-neutral-50 border-2 border-dashed border-black/30 rounded-2xl p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Skull className="w-4 h-4 text-neutral-600" />
                  <span className="font-mono text-xs font-black uppercase text-neutral-700">
                    9. Graceful Error Boundary Test
                  </span>
                </div>
                <span className="text-[9px] font-mono bg-neutral-200 px-2 py-0.5 rounded font-bold text-neutral-700">
                  DEVELOPER DIAGNOSTIC
                </span>
              </div>
              <p className="text-[11px] font-mono text-neutral-600">
                Trigger a simulated render exception to verify the Nerdy Reactor Core recovery screen.
              </p>
              <button
                type="button"
                onClick={() => {
                  try { soundEngine.playRoughTone(); } catch (e) {}
                  if (onTriggerErrorTest) onTriggerErrorTest();
                }}
                className="py-1.5 px-3 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 font-mono text-[10px] font-black uppercase rounded-lg border border-black cursor-pointer shadow-[1px_1px_0px_#000000] active:translate-x-px active:translate-y-px transition-all"
              >
                SIMULATE EXCEPTION
              </button>
            </div>

          </div>

          {/* Footer note */}
          <div className="border-t-2 border-black/10 pt-3 flex items-center justify-between text-[11px] font-mono text-neutral-600 shrink-0">
            <span>Shortcut: Press Ctrl+Shift+D for Demo Sandbox</span>
            <span className="font-bold text-black">TRINNO EXHIBITION ENGINE</span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
