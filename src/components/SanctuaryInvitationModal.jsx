import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, ShieldCheck, Flame, X, HeartPulse, Clock, Sparkles, Wind, CheckCircle2 } from 'lucide-react';
import { soundEngine } from '../services/soundEngine';

export default function SanctuaryInvitationModal({
  isOpen,
  roughDaysCount = 2,
  onAccept,
  onDecline
}) {
  if (!isOpen) return null;

  const handleAccept = () => {
    soundEngine.playSuccess();
    onAccept();
  };

  const handleDecline = () => {
    soundEngine.playClick();
    onDecline();
  };

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-xs overflow-y-auto"
        onClick={handleDecline}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 16 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 16 }}
          transition={{ duration: 0.18 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-lg bg-[#FFFDF8] border-3 border-black shadow-[8px_8px_0px_#000000] overflow-hidden"
        >
          {/* Top Banner Notice */}
          <div className="bg-[#FDC800] border-b-3 border-black px-4 py-2 sm:px-6 sm:py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2 font-mono text-[10px] sm:text-xs font-black uppercase tracking-wider text-black">
              <ShieldAlert className="w-4 h-4 stroke-[2.5]" />
              <span>BURNOUT RADAR • STASIS INVITATION</span>
            </div>
            <button
              onClick={handleDecline}
              className="p-1 bg-black text-white hover:bg-[#FF4D4D] hover:text-black border border-black transition-colors shadow-[1px_1px_0px_#000000] active:translate-x-px active:translate-y-px cursor-pointer"
              aria-label="Dismiss invitation"
            >
              <X className="w-3.5 h-3.5 stroke-3" />
            </button>
          </div>

          {/* Main Body */}
          <div className="p-4 sm:p-6 space-y-4">
            <div className="flex items-start gap-3.5">
              <div className="p-3 bg-[#FF4D4D] border-2 border-black shadow-[3px_3px_0px_#000000] shrink-0">
                <HeartPulse className="w-6 h-6 text-black stroke-[2.5]" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-black tracking-tight uppercase leading-snug">
                  Protect Your Streak?
                </h3>
                <p className="text-xs font-mono font-bold text-neutral-600 mt-0.5">
                  {roughDaysCount >= 2
                    ? `${roughDaysCount} consecutive rough days detected (1★ or 2★)`
                    : 'Consecutive rough days or missed reflections detected'}
                </p>
              </div>
            </div>

            <p className="text-xs sm:text-sm font-mono text-black leading-relaxed">
              In SHIT OR HIT, your nervous system always trumps streak vanity. Sanctuary Mode shields your hard-earned streak for{' '}
              <strong className="bg-[#FDC800] px-1 py-0.5 border border-black">7 days</strong>{' '}
              with zero streak loss and complete peace of mind.
            </p>

            {/* 3 Structured Benefit Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-2.5">
              <div className="p-2.5 bg-white border-2 border-black shadow-[2px_2px_0px_#000000] space-y-1">
                <div className="flex items-center gap-1.5 text-black">
                  <ShieldCheck className="w-3.5 h-3.5 stroke-[2.5] text-emerald-600" />
                  <span className="font-mono text-[10px] font-black uppercase">Streak Shield</span>
                </div>
                <p className="text-[10px] font-mono text-neutral-600 leading-tight">
                  Frozen in place. Zero resets, zero score drops.
                </p>
              </div>

              <div className="p-2.5 bg-white border-2 border-black shadow-[2px_2px_0px_#000000] space-y-1">
                <div className="flex items-center gap-1.5 text-black">
                  <Wind className="w-3.5 h-3.5 stroke-[2.5] text-blue-600" />
                  <span className="font-mono text-[10px] font-black uppercase">Vagus Pacer</span>
                </div>
                <p className="text-[10px] font-mono text-neutral-600 leading-tight">
                  Guided 4-2-6 somatic breathing orb for recovery.
                </p>
              </div>

              <div className="p-2.5 bg-white border-2 border-black shadow-[2px_2px_0px_#000000] space-y-1">
                <div className="flex items-center gap-1.5 text-black">
                  <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5] text-amber-600" />
                  <span className="font-mono text-[10px] font-black uppercase">Zero Pressure</span>
                </div>
                <p className="text-[10px] font-mono text-neutral-600 leading-tight">
                  No daily verdicts or score demands for 7 days.
                </p>
              </div>
            </div>

            {/* 7-Day Memory / Respect Guarantee */}
            <div className="bg-[#FFF9E6] border-2 border-black p-3 text-[11px] sm:text-xs font-mono text-black leading-relaxed flex items-start gap-2 shadow-[2px_2px_0px_#000000]">
              <Clock className="w-4 h-4 text-black shrink-0 mt-0.5 stroke-[2.5]" />
              <span>
                <strong>Respect Guarantee:</strong> If you decline, we respect your grind and will{' '}
                <strong>NOT prompt you again for 7 full days</strong>.
              </span>
            </div>

            {/* Action Buttons (Strict Vertical-First Stacking) */}
            <div className="pt-1 flex flex-col gap-2.5">
              <button
                type="button"
                onClick={handleAccept}
                className="w-full py-3 px-4 bg-[#00E599] hover:bg-[#00c985] text-black font-mono font-black text-xs sm:text-sm uppercase tracking-wide border-2 border-black shadow-[3px_3px_0px_#000000] active:translate-x-px active:translate-y-px transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
                <span>YES, FREEZE STREAK (ENTER 7-DAY SANCTUARY)</span>
              </button>

              <button
                type="button"
                onClick={handleDecline}
                className="w-full py-2.5 px-4 bg-white hover:bg-neutral-100 text-black font-mono font-bold text-xs uppercase tracking-wide border-2 border-black shadow-[2px_2px_0px_#000000] active:translate-x-px active:translate-y-px transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Flame className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>NOT NOW, KEEP TRACKING MY DAYS</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
