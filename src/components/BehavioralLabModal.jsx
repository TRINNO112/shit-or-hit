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
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { soundEngine } from '../services/soundEngine';

/**
 * 🧪 Behavioral Trilogy State Inspector & Dev Lab
 * Allows pair programmer & user to preview, test, and verify all visual and functional states
 * of the 3 new behavioral components + upgraded ErrorBoundary.
 */
export default function BehavioralLabModal({
  isOpen,
  onClose,
  onOpenReceipt,
  onOpenCapsule,
  onOpenAutopsy,
  onTriggerErrorTest
}) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[80] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.94, y: 15 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.94, y: 15 }}
          className="w-full max-w-2xl bg-[#FFFDF5] rounded-3xl border-3 border-black p-5 sm:p-7 shadow-[8px_8px_0px_#000000] space-y-6 text-left max-h-[92vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Hazard Accent */}
          <div className="flex items-center justify-between border-b-2 border-black/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#FFE66D] border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_#000000] text-black shrink-0">
                <FlaskConical className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-display font-black text-xl uppercase tracking-tight text-black leading-none">
                    BEHAVIORAL TRILOGY STATE LAB
                  </h2>
                  <span className="px-2 py-0.5 rounded bg-black text-[#FFE66D] text-[9px] font-mono font-black uppercase">
                    DEV SHOWCASE
                  </span>
                </div>
                <p className="text-xs font-mono text-neutral-600 mt-1">
                  Instant interactive preview of all component states, ciphers &amp; diagnostics
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                onClose();
              }}
              className="p-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 border-2 border-black text-black cursor-pointer shadow-2px_2px_0px_#000000 active:translate-x-1px active:translate-y-1px"
            >
              <X className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>

          {/* Body Content - Scrollable */}
          <div className="flex-1 overflow-y-auto space-y-5 pr-1 text-black">

            {/* COMPONENT 1: MONTHLY LIFE DEBT INVOICE */}
            <div className="bg-white border-2 border-black rounded-2xl p-4 shadow-[3px_3px_0px_#000000] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-neutral-800" />
                  <h3 className="font-mono font-black text-sm uppercase">
                    1. Receipt of Truth (Monthly Life Debt)
                  </h3>
                </div>
                <span className="text-[10px] font-mono bg-neutral-100 px-2 py-0.5 rounded border border-black/20 font-bold">
                  Tactile Thermal Paper + Rubber Stamps
                </span>
              </div>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Evaluates month-long discipline ledger. Calculates Net Equity = Assets (Hits, God-Mode, Habit Anchors) minus Liabilities (Trench fines, Slump taxes).
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playClick();
                    onOpenReceipt('solvent');
                  }}
                  className="p-2.5 bg-[#00E599]/20 hover:bg-[#00E599]/35 border-2 border-black rounded-xl text-left font-mono transition-all cursor-pointer shadow-[2px_2px_0px_#000000] active:scale-95"
                >
                  <div className="flex items-center gap-1.5 text-xs font-black text-emerald-900 mb-0.5">
                    <TrendingUp className="w-4 h-4 text-emerald-700" />
                    <span>SOLVENT (+140 EQ)</span>
                  </div>
                  <div className="text-[10px] text-emerald-800">
                    High consistency, green stamp, God-mode velocity bonus
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playClick();
                    onOpenReceipt('debt');
                  }}
                  className="p-2.5 bg-[#FF4D4D]/20 hover:bg-[#FF4D4D]/35 border-2 border-black rounded-xl text-left font-mono transition-all cursor-pointer shadow-[2px_2px_0px_#000000] active:scale-95"
                >
                  <div className="flex items-center gap-1.5 text-xs font-black text-red-900 mb-0.5">
                    <TrendingDown className="w-4 h-4 text-red-700" />
                    <span>IN LIFE DEBT (-85 EQ)</span>
                  </div>
                  <div className="text-[10px] text-red-800">
                    Rough days, missed anchors, red tilted debt rubber stamp
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playClick();
                    onOpenReceipt('live');
                  }}
                  className="p-2.5 bg-[#FFE66D]/30 hover:bg-[#FFE66D]/50 border-2 border-black rounded-xl text-left font-mono transition-all cursor-pointer shadow-[2px_2px_0px_#000000] active:scale-95"
                >
                  <div className="flex items-center gap-1.5 text-xs font-black text-neutral-900 mb-0.5">
                    <Sparkles className="w-4 h-4 text-amber-700" />
                    <span>LIVE USER MONTH</span>
                  </div>
                  <div className="text-[10px] text-neutral-700">
                    Loads current active month directly from your database
                  </div>
                </button>
              </div>
            </div>

            {/* COMPONENT 2: TIME & MOOD CAPSULE VAULT */}
            <div className="bg-white border-2 border-black rounded-2xl p-4 shadow-[3px_3px_0px_#000000] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Hourglass className="w-5 h-5 text-amber-600" />
                  <h3 className="font-mono font-black text-sm uppercase">
                    2. Time &amp; Mood Capsule Vault
                  </h3>
                </div>
                <span className="text-[10px] font-mono bg-neutral-100 px-2 py-0.5 rounded border border-black/20 font-bold">
                  Zero-Knowledge AES Cipher + Cloud Sync
                </span>
              </div>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Letters sealed for future dates or triggered by mood slumps/streaks. Strict zero-knowledge lockout prevents reading until unlocked.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playClick();
                    onOpenCapsule('vault');
                  }}
                  className="p-2.5 bg-[#FDC800]/20 hover:bg-[#FDC800]/35 border-2 border-black rounded-xl text-left font-mono transition-all cursor-pointer shadow-[2px_2px_0px_#000000] active:scale-95"
                >
                  <div className="flex items-center gap-1.5 text-xs font-black text-neutral-900 mb-0.5">
                    <KeyRound className="w-4 h-4 text-neutral-800" />
                    <span>VAULT GALLERY</span>
                  </div>
                  <div className="text-[10px] text-neutral-700">
                    Browse sealed capsules, live countdowns &amp; breach buttons
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playClick();
                    onOpenCapsule('create');
                  }}
                  className="p-2.5 bg-neutral-100 hover:bg-neutral-200 border-2 border-black rounded-xl text-left font-mono transition-all cursor-pointer shadow-[2px_2px_0px_#000000] active:scale-95"
                >
                  <div className="flex items-center gap-1.5 text-xs font-black text-neutral-900 mb-0.5">
                    <FileText className="w-4 h-4 text-neutral-800" />
                    <span>CRAFT CAPSULE</span>
                  </div>
                  <div className="text-[10px] text-neutral-700">
                    Configure date, slump, streak triggers &amp; seal styles
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playClick();
                    onOpenCapsule('release');
                  }}
                  className="p-2.5 bg-[#00E599]/20 hover:bg-[#00E599]/35 border-2 border-black rounded-xl text-left font-mono transition-all cursor-pointer shadow-[2px_2px_0px_#000000] active:scale-95"
                >
                  <div className="flex items-center gap-1.5 text-xs font-black text-emerald-900 mb-0.5">
                    <Sparkles className="w-4 h-4 text-emerald-700" />
                    <span>BREACH TYPEWRITER</span>
                  </div>
                  <div className="text-[10px] text-emerald-800">
                    Interactive audio-tactile unsealing letter typewriter
                  </div>
                </button>
              </div>
            </div>

            {/* COMPONENT 3: FORENSIC AUTOPSY CHAMBER */}
            <div className="bg-white border-2 border-black rounded-2xl p-4 shadow-[3px_3px_0px_#000000] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertOctagon className="w-5 h-5 text-red-600" />
                  <h3 className="font-mono font-black text-sm uppercase">
                    3. AI Forensic Autopsy Chamber
                  </h3>
                </div>
                <span className="text-[10px] font-mono bg-neutral-100 px-2 py-0.5 rounded border border-black/20 font-bold">
                  Gemini Interrogator + Recovery Antidote
                </span>
              </div>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Investigates rough day collapse with 3 diagnostic questions, pinpoints root cause of death, and issues a 3-step coroner recovery protocol.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playClick();
                    onOpenAutopsy('questioning');
                  }}
                  className="p-2.5 bg-[#FF4D4D]/15 hover:bg-[#FF4D4D]/25 border-2 border-black rounded-xl text-left font-mono transition-all cursor-pointer shadow-[2px_2px_0px_#000000] active:scale-95"
                >
                  <div className="flex items-center gap-1.5 text-xs font-black text-red-900 mb-0.5">
                    <ShieldAlert className="w-4 h-4 text-red-600" />
                    <span>INTERROGATION MODE</span>
                  </div>
                  <div className="text-[10px] text-red-800">
                    3 diagnostic questions investigating friction &amp; dopamine traps
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playClick();
                    onOpenAutopsy('verdict');
                  }}
                  className="p-2.5 bg-[#FDC800]/20 hover:bg-[#FDC800]/35 border-2 border-black rounded-xl text-left font-mono transition-all cursor-pointer shadow-[2px_2px_0px_#000000] active:scale-95"
                >
                  <div className="flex items-center gap-1.5 text-xs font-black text-neutral-900 mb-0.5">
                    <CheckCircle2 className="w-4 h-4 text-amber-700" />
                    <span>CORONER&apos;S VERDICT &amp; ANTIDOTE</span>
                  </div>
                  <div className="text-[10px] text-neutral-700">
                    Full cause of death diagnosis + 3-step action recovery plan
                  </div>
                </button>
              </div>
            </div>

            {/* UPGRADED ERROR BOUNDARY TEST */}
            <div className="bg-[#FFF9E6] border-2 border-black rounded-2xl p-4 shadow-[3px_3px_0px_#000000] space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Skull className="w-5 h-5 text-[#FF4D4D]" />
                  <h3 className="font-mono font-black text-sm uppercase">
                    4. Upgraded Error Boundary &amp; Reactor Core
                  </h3>
                </div>
                <span className="text-[10px] font-mono bg-[#FF4D4D] text-white px-2 py-0.5 rounded font-black">
                  TEST CRASH SIMULATOR
                </span>
              </div>
              <p className="text-xs text-neutral-700 leading-relaxed">
                Test the new sarcastic nerdy technical guts, hazard stripes, copyable crash report, and the &ldquo;IT IS BEYOND MY LIMITS — DISMISS&rdquo; emergency exit.
              </p>

              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  onTriggerErrorTest();
                }}
                className="w-full py-2.5 px-4 bg-[#FF4D4D] hover:bg-red-500 text-white font-mono text-xs font-black uppercase rounded-xl border-2 border-black shadow-[3px_3px_0px_#000000] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Skull className="w-4 h-4" />
                <span>SIMULATE REACTOR CORE CRASH (TEST ERROR BOUNDARY)</span>
              </button>
            </div>

          </div>

          {/* Footer note */}
          <div className="border-t-2 border-black/10 pt-3 flex items-center justify-between text-[11px] font-mono text-neutral-600">
            <span>Shortcut: Type &ldquo;lab&rdquo; or &ldquo;showcase&rdquo; anywhere</span>
            <span className="font-bold text-black">TRINNO v2026.9</span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
