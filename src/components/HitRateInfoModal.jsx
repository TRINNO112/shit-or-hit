import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, X, Percent, ShieldCheck, Flame, AlertCircle, ArrowUpRight, HelpCircle } from 'lucide-react';
import soundEngine from '../services/soundEngine';

/**
 * 🎯 HitRateInfoModal
 * Explains the SHIT OR HIT "Hit Rate" metric, calculation formula,
 * why 3★ counts as a Hit, and the performance tiers.
 * 
 * Strict UI Standard: Zero raw emojis, Pure Neobrutalism, 320px mobile-first.
 */
export default function HitRateInfoModal({ isOpen, onClose }) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-90 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="w-full max-w-lg bg-[#FFFDF5] border-3 border-black rounded-3xl p-4 sm:p-6 shadow-[5px_5px_0px_#000000] max-h-[92vh] flex flex-col gap-4 text-black overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b-2 border-black/10 shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-[#FDC800] border-2 border-black flex items-center justify-center shadow-[1.5px_1.5px_0px_#000000] shrink-0">
                <Target className="w-5 h-5 text-black stroke-[2.5]" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-display font-black text-base sm:text-lg uppercase tracking-tight leading-none">
                    Hit Rate Explained
                  </h3>
                  <span className="px-1.5 py-0.5 rounded bg-black text-[#00E599] font-mono text-[9px] font-black uppercase">
                    METRIC GUIDE
                  </span>
                </div>
                <p className="font-mono text-[10px] sm:text-xs text-neutral-600 truncate mt-0.5">
                  The primary compass measuring life momentum
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                onClose();
              }}
              className="p-1.5 rounded-xl border-2 border-black bg-white hover:bg-neutral-100 shadow-[1.5px_1.5px_0px_#000000] cursor-pointer active:translate-x-px active:translate-y-px shrink-0"
              title="Close guide"
              aria-label="Close guide"
            >
              <X className="w-4 h-4 stroke-3 text-black" />
            </button>
          </div>

          {/* Scrollable Body */}
          <div className="space-y-4 overflow-y-auto flex-1 pr-1 font-mono text-xs text-neutral-800 leading-relaxed">
            
            {/* Quick Summary Pill */}
            <div className="p-3 bg-[#FDC800]/20 border-2 border-black rounded-2xl shadow-[2px_2px_0px_#000000]">
              <div className="flex items-start gap-2">
                <HelpCircle className="w-4 h-4 text-black stroke-[2.5] shrink-0 mt-0.5" />
                <div>
                  <span className="font-black text-black uppercase block text-[11px]">
                    What is the Hit Rate?
                  </span>
                  <p className="text-[11px] text-neutral-700 mt-0.5 font-bold">
                    Hit Rate is the percentage of your logged days that were successful (rated 3★, 4★, or 5★) versus days lost to slumps (1★ or 2★).
                  </p>
                </div>
              </div>
            </div>

            {/* Mathematical Formula Card */}
            <div className="p-3.5 bg-white border-2 border-black rounded-2xl shadow-[2.5px_2.5px_0px_#000000] space-y-2">
              <div className="flex items-center justify-between border-b border-black/10 pb-1.5">
                <span className="font-display font-black text-xs uppercase text-neutral-600">
                  Mathematical Formula
                </span>
                <span className="px-1.5 py-0.5 bg-neutral-100 border border-black rounded text-[9px] font-black uppercase">
                  INVARIANT
                </span>
              </div>
              <div className="p-2.5 bg-[#FFFDF5] border border-black rounded-xl text-center font-black text-xs sm:text-sm text-black shadow-inner">
                Hit Rate (%) = (Total Hit Days / Total Logged Days) × 100
              </div>
              <p className="text-[10px] text-neutral-500 font-bold">
                Note: Unlogged days are excluded from the denominator so you are strictly evaluated on verified evidence.
              </p>
            </div>

            {/* Why 3★ Counts as a Hit */}
            <div className="p-3.5 bg-white border-2 border-black rounded-2xl shadow-[2.5px_2.5px_0px_#000000] space-y-2">
              <span className="font-display font-black text-xs uppercase text-black block">
                Why does 3★ (Okay) count as a "Hit"?
              </span>
              <p className="text-[11px] text-neutral-700 font-medium">
                In the SHIT OR HIT philosophy, life is divided into two distinct zones:
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {/* 1★ & 2★ Zone */}
                <div className="p-2.5 bg-red-50 border-2 border-red-500 rounded-xl space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="px-1.5 py-0.5 bg-[#FF4D4D] text-white border border-black rounded text-[9px] font-black uppercase">
                      1★ & 2★ = SHIT
                    </span>
                  </div>
                  <p className="text-[10px] text-red-950 font-bold">
                    Slump & friction zone. Days derailed by avoidance, breakdown, or severe deficits.
                  </p>
                </div>

                {/* 3★, 4★, 5★ Zone */}
                <div className="p-2.5 bg-emerald-50 border-2 border-emerald-600 rounded-xl space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="px-1.5 py-0.5 bg-[#00E599] text-black border border-black rounded text-[9px] font-black uppercase">
                      3★, 4★, 5★ = HIT
                    </span>
                  </div>
                  <p className="text-[10px] text-emerald-950 font-bold">
                    Holding the line or dominating. A 3★ day is a defensive victory—you showed up and did not relapse.
                  </p>
                </div>
              </div>
            </div>

            {/* Performance Benchmark Scale */}
            <div className="p-3.5 bg-white border-2 border-black rounded-2xl shadow-[2.5px_2.5px_0px_#000000] space-y-2">
              <span className="font-display font-black text-xs uppercase text-black block">
                Momentum Velocity Tiers
              </span>
              
              <div className="space-y-1.5">
                <div className="flex items-center justify-between p-2 rounded-xl bg-neutral-50 border border-black/20 text-[11px]">
                  <div className="flex items-center gap-2">
                    <Flame className="w-3.5 h-3.5 text-black stroke-[2.5]" />
                    <span className="font-black text-black">80% – 100%</span>
                  </div>
                  <span className="font-bold text-emerald-700 uppercase">Apex Execution (Elite)</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-xl bg-neutral-50 border border-black/20 text-[11px]">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-black stroke-[2.5]" />
                    <span className="font-black text-black">65% – 79%</span>
                  </div>
                  <span className="font-bold text-blue-700 uppercase">Disciplined Momentum</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-xl bg-neutral-50 border border-black/20 text-[11px]">
                  <div className="flex items-center gap-2">
                    <Percent className="w-3.5 h-3.5 text-black stroke-[2.5]" />
                    <span className="font-black text-black">50% – 64%</span>
                  </div>
                  <span className="font-bold text-amber-700 uppercase">Holding the Baseline</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-xl bg-neutral-50 border border-black/20 text-[11px]">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-3.5 h-3.5 text-red-600 stroke-[2.5]" />
                    <span className="font-black text-black">&lt; 50%</span>
                  </div>
                  <span className="font-bold text-red-600 uppercase">Friction Alert (Autopsy Needed)</span>
                </div>
              </div>
            </div>

          </div>

          {/* Footer CTA */}
          <div className="pt-2 border-t-2 border-black/10 shrink-0">
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                onClose();
              }}
              className="w-full py-2.5 sm:py-3 bg-[#FDC800] hover:bg-amber-400 text-black border-2 border-black rounded-xl font-display font-black text-xs uppercase shadow-[2px_2px_0px_#000000] cursor-pointer active:translate-x-px active:translate-y-px transition-all"
            >
              GOT IT • RETURN TO TRACKING
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
