import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Sparkles, Heart, Zap, ArrowRight, X, Moon, RefreshCw, CheckCircle2, Flame, Coffee, Compass } from 'lucide-react';
import { soundEngine } from '../services/soundEngine';
import mascot1 from '../assets/mascots/mascot_1_rough.png';

const BROTHERLY_INSIGHTS = [
  {
    tag: "STOIC PERSPECTIVE",
    quote: "Listen bro: two rough days is just brief friction on a 10-year chart. You don't need to rebuild Rome by midnight. Clear the mental noise, protect your sleep tonight, and we take tomorrow one clean win at a time.",
    action: "Tomorrow: Win just 1 core anchor first."
  },
  {
    tag: "ENERGY RESET",
    quote: "Burnout doesn't mean you're weak — it means your battery is at 4%. Stop fighting tired brain cells. Cut the doomscrolling, drink water, hit the pillow early, and wake up with a fresh slate.",
    action: "Tonight: Zero screen in bed after 11 PM."
  },
  {
    tag: "RESILIENCE MINDSET",
    quote: "The gap between a bad week and a champion is simply not letting 2 bad days turn into 10. You had a dip. Accept the data point, drop the guilt, and step back on the mat tomorrow.",
    action: "Protocol: Bad days are just training data."
  }
];

export default function MotivationalRecoveryModal({ isOpen, onClose }) {
  const [insightIdx, setInsightIdx] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setInsightIdx(Math.floor(Math.random() * BROTHERLY_INSIGHTS.length));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentInsight = BROTHERLY_INSIGHTS[insightIdx];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-6 bg-black/75 backdrop-blur-xs"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          transition={{ type: 'spring', stiffness: 420, damping: 30 }}
          className="bg-[#FFFDF5] border-3 border-black rounded-3xl p-5 sm:p-7 max-w-lg w-full shadow-[8px_8px_0px_#000000] relative space-y-4 sm:space-y-5 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Decorative Neo Bar */}
          <div className="flex items-center justify-between gap-2 border-b-2 border-black/10 pb-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border-2 border-black bg-[#FDC800] font-mono text-[10px] sm:text-xs font-black uppercase shadow-[1.5px_1.5px_0px_#000000]">
                <Shield className="w-3.5 h-3.5 text-black stroke-[2.5]" />
                <span>RECOVERY PROTOCOL</span>
              </span>
              <span className="text-[10px] font-mono font-bold text-neutral-500 uppercase tracking-widest hidden sm:inline">
                {currentInsight.tag}
              </span>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                onClose();
              }}
              className="w-8 h-8 rounded-xl bg-neutral-100 hover:bg-neutral-200 border-2 border-black flex items-center justify-center text-black cursor-pointer shadow-[2px_2px_0px_#000000] active:scale-95 transition-all"
              title="Close"
            >
              <X className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>

          {/* Header Banner with Cozy Mascot */}
          <div className="flex items-center gap-3.5 sm:gap-4 bg-[#FFF8E7] border-2 border-black rounded-2xl p-3.5 shadow-[3px_3px_0px_#000000]">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border-3 border-black bg-[#FF8A00] overflow-hidden shrink-0 shadow-[2px_2px_0px_#000000] flex items-center justify-center relative group">
              <img 
                src={mascot1} 
                alt="Recovery Mascot" 
                className="w-12 h-12 sm:w-14 sm:h-14 object-contain transition-transform group-hover:scale-110" 
              />
              <div className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-[#00E599] border border-black flex items-center justify-center">
                <Sparkles className="w-2.5 h-2.5 text-black" />
              </div>
            </div>

            <div className="min-w-0">
              <h3 className="font-display font-black text-lg sm:text-2xl uppercase tracking-tight text-black leading-tight">
                Bhai, Take a Breath & Reset
              </h3>
              <p className="text-xs font-mono font-bold text-neutral-600 mt-0.5">
                Two rough days don't define your trajectory.
              </p>
            </div>
          </div>

          {/* Real Brotherly Letter Card */}
          <div className="p-4 sm:p-5 bg-white border-2 border-black rounded-2xl shadow-[3px_3px_0px_#000000] space-y-2 relative">
            <p className="text-xs sm:text-sm font-mono font-bold text-neutral-900 leading-relaxed">
              "{currentInsight.quote}"
            </p>
            <div className="pt-2 border-t border-black/10 flex items-center justify-between text-[10px] sm:text-xs font-mono font-black text-[#FF8A00]">
              <span className="flex items-center gap-1">
                <Flame className="w-3.5 h-3.5" />
                <span>KEY ACTION: {currentInsight.action}</span>
              </span>
              <button
                type="button"
                onClick={() => setInsightIdx((prev) => (prev + 1) % BROTHERLY_INSIGHTS.length)}
                className="hover:underline text-neutral-500 cursor-pointer flex items-center gap-1 font-bold"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Next Advice</span>
              </button>
            </div>
          </div>

          {/* 3-Step Tactical Reset Pillars */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-black text-neutral-500 uppercase tracking-wider">
                3-Step Decompression Plan
              </span>
              <span className="text-[10px] font-mono font-bold text-neutral-400">
                Tonight & Tomorrow Morning
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {/* Step 1 */}
              <div className="p-3 bg-[#F4F0FF] border-2 border-black rounded-xl shadow-[2px_2px_0px_#000000] flex sm:flex-col items-start gap-2">
                <div className="w-7 h-7 rounded-lg bg-purple-500 border border-black flex items-center justify-center shrink-0">
                  <Moon className="w-3.5 h-3.5 text-white stroke-[2.5]" />
                </div>
                <div>
                  <h4 className="font-display font-black text-xs uppercase text-black">1. Digital Blackout</h4>
                  <p className="text-[10px] font-mono font-bold text-neutral-700 leading-tight mt-0.5">
                    Phone off 30m before sleep. Let your cortisol settle.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="p-3 bg-[#E6F9F2] border-2 border-black rounded-xl shadow-[2px_2px_0px_#000000] flex sm:flex-col items-start gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#00E599] border border-black flex items-center justify-center shrink-0">
                  <Shield className="w-3.5 h-3.5 text-black stroke-[2.5]" />
                </div>
                <div>
                  <h4 className="font-display font-black text-xs uppercase text-black">2. Zero Guilt Mode</h4>
                  <p className="text-[10px] font-mono font-bold text-neutral-700 leading-tight mt-0.5">
                    Slip-ups are raw data points, not your identity.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="p-3 bg-[#FFF9E6] border-2 border-black rounded-xl shadow-[2px_2px_0px_#000000] flex sm:flex-col items-start gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#FDC800] border border-black flex items-center justify-center shrink-0">
                  <Compass className="w-3.5 h-3.5 text-black stroke-[2.5]" />
                </div>
                <div>
                  <h4 className="font-display font-black text-xs uppercase text-black">3. Single Anchor</h4>
                  <p className="text-[10px] font-mono font-bold text-neutral-700 leading-tight mt-0.5">
                    Execute just 1 morning habit to get momentum back.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <button
            type="button"
            onClick={() => {
              soundEngine.playSuccessChime();
              onClose();
            }}
            className="w-full py-3.5 bg-[#00E599] hover:bg-emerald-400 border-3 border-black rounded-2xl font-display font-black text-sm sm:text-base uppercase text-black shadow-[4px_4px_0px_#000000] cursor-pointer flex items-center justify-center gap-2 active:scale-98 transition-all"
          >
            <span>Got This Bhai — I'm Locked In</span>
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 stroke-3" />
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
