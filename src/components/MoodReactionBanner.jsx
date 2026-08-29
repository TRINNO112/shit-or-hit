import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertCircle, 
  CloudRain, 
  MinusCircle, 
  Zap, 
  Sparkles,
  Shield,
  BatteryCharging,
  Compass,
  Flame,
  Crown,
  X
} from 'lucide-react';

import mascot1 from '../assets/mascots/mascot_1_rough.png';
import mascot2 from '../assets/mascots/mascot_2_down.png';
import mascot3 from '../assets/mascots/mascot_3_okay.png';
import mascot4 from '../assets/mascots/mascot_4_good.png';
import mascot5 from '../assets/mascots/mascot_5_peak.png';

const MOOD_CONFIG = {
  1: {
    mascot: mascot1,
    title: 'IN THE TRENCHES',
    protocol: 'RESILIENCE MODE',
    quote: 'We take the hit. Rest, reload, and strike back tomorrow.',
    gradientClass: 'bg-gradient-to-r from-[#FF4D4D] via-[#FF3B30] to-[#DC2626]',
    textColor: 'text-white',
    quoteColor: 'text-rose-100',
    badgeText: 'ROUGH (1★)',
    icon: AlertCircle,
    accentIcon: Shield,
    tag: 'BATTLE TESTED'
  },
  2: {
    mascot: mascot2,
    title: 'LOW BATTERY MODE',
    protocol: 'RECOVERY PROTOCOL',
    quote: 'Recovery is active discipline. Unplug, recalibrate, and reset.',
    gradientClass: 'bg-gradient-to-r from-[#FF8A00] via-[#FF7A00] to-[#EA580C]',
    textColor: 'text-black',
    quoteColor: 'text-orange-950 font-bold',
    badgeText: 'DOWN (2★)',
    icon: CloudRain,
    accentIcon: BatteryCharging,
    tag: 'RECHARGING'
  },
  3: {
    mascot: mascot3,
    title: 'EQUILIBRIUM LOCKED',
    protocol: 'BASELINE DISCIPLINE',
    quote: 'Consistency beats intensity. Showing up keeps the machine running.',
    gradientClass: 'bg-gradient-to-r from-[#E2E8F0] via-[#CBD5E1] to-[#94A3B8]',
    textColor: 'text-black',
    quoteColor: 'text-slate-900 font-bold',
    badgeText: 'OKAY (3★)',
    icon: MinusCircle,
    accentIcon: Compass,
    tag: 'LOCKED IN'
  },
  4: {
    mascot: mascot4,
    title: 'MOMENTUM UNLOCKED',
    protocol: 'FLOW STATE',
    quote: 'High quality flow state. Keep the flame burning and stack the wins.',
    gradientClass: 'bg-gradient-to-r from-[#00E599] via-[#10B981] to-[#059669]',
    textColor: 'text-black',
    quoteColor: 'text-emerald-950 font-bold',
    badgeText: 'GOOD (4★)',
    icon: Zap,
    accentIcon: Flame,
    tag: 'ON FIRE'
  },
  5: {
    mascot: mascot5,
    title: 'APEX PERFORMANCE',
    protocol: 'ABSOLUTE MASTERY',
    quote: 'Unstoppable execution across all spheres. Today was legendary.',
    gradientClass: 'bg-gradient-to-r from-[#FDC800] via-[#FBBF24] to-[#F59E0B]',
    textColor: 'text-black',
    quoteColor: 'text-amber-950 font-bold',
    badgeText: 'PEAK APEX (5★)',
    icon: Sparkles,
    accentIcon: Crown,
    tag: 'CHAMPION'
  }
};

export default function MoodReactionBanner({ rating }) {
  const [isZoomed, setIsZoomed] = useState(false);

  if (!rating || !MOOD_CONFIG[rating]) return null;

  const config = MOOD_CONFIG[rating];
  const Icon = config.icon;
  const AccentIcon = config.accentIcon;

  return (
    <>
      <AnimatePresence mode="wait">
        <motion.div
          key={rating}
          initial={{ opacity: 0, y: 10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -6, scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 450, damping: 28 }}
          className={`w-full rounded-3xl border-3 border-black ${config.gradientClass} ${config.textColor} p-5 sm:p-6 shadow-[5px_5px_0px_#000000] relative overflow-hidden`}
        >
          {/* Subtle Ambient Glow */}
          <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-white/20 blur-3xl pointer-events-none" />

          {/* Neobrutalist Architectural Blueprint Grid & Cross-Hatch Pattern */}
          <div className="absolute inset-0 pointer-events-none opacity-15 overflow-hidden">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="neoTechGrid" width="28" height="28" patternUnits="userSpaceOnUse">
                  <path d="M 28 0 L 0 0 0 28" fill="none" stroke="currentColor" strokeWidth="0.9" />
                  <path d="M 0 28 L 28 0" fill="none" stroke="currentColor" strokeWidth="0.6" strokeDasharray="3 3" />
                  <circle cx="0" cy="0" r="1.5" fill="currentColor" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#neoTechGrid)" />
            </svg>
          </div>

          {/* Technical Corner Crosshairs */}
          <div className="absolute top-3 right-3 text-[9px] font-mono font-black opacity-35 select-none tracking-widest">
            + + [ VERDICT OS // SPEC ]
          </div>

          {/* Top-Aligned Content Row with Generous Spacing */}
          <div className="flex flex-col sm:flex-row items-start justify-between gap-6 sm:gap-8 relative z-10">
            {/* Left Content Area (Top-Aligned) */}
            <div className="flex-1 min-w-0 space-y-3 text-left w-full sm:w-auto">
              
              {/* Badges Row */}
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="px-3 py-1 rounded-xl border-2 border-black font-mono font-black text-xs text-black uppercase shadow-[1.5px_1.5px_0px_#000000] flex items-center gap-1.5 bg-white">
                  <Icon className="w-4 h-4 stroke-3 text-black" />
                  <span>{config.badgeText}</span>
                </span>

                <span className="px-3 py-1 rounded-xl bg-black text-white font-mono font-bold text-[11px] uppercase tracking-wider flex items-center gap-1.5 shadow-[1.5px_1.5px_0px_#000000]">
                  <AccentIcon className="w-3.5 h-3.5 text-[#FDC800]" />
                  <span>{config.protocol}</span>
                </span>
              </div>

              {/* Title */}
              <h4 className="font-display font-black text-xl sm:text-3xl tracking-tight uppercase leading-tight">
                {config.title}
              </h4>

              {/* Street Quote */}
              <p className={`text-sm sm:text-base font-mono ${config.quoteColor} leading-relaxed max-w-2xl`}>
                "{config.quote}"
              </p>
            </div>

            {/* Right: Big, High-Impact Artwork Frame */}
            <motion.div 
              initial={{ scale: 0.9, rotate: -2 }}
              animate={{ scale: 1, rotate: 0 }}
              whileHover={{ scale: 1.06, rotate: 2 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 450, damping: 20 }}
              onClick={() => setIsZoomed(true)}
              className="shrink-0 flex flex-col items-center justify-center relative cursor-pointer group"
              title="Click to view full-size mascot illustration"
            >
              <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl bg-white border-3 border-black p-2.5 shadow-[4px_4px_0px_#000000] flex items-center justify-center relative overflow-hidden group-hover:shadow-[6px_6px_0px_#000000] transition-shadow">
                <img
                  src={config.mascot}
                  alt={config.title}
                  className="w-full h-full object-contain filter drop-shadow-md transition-transform duration-300 group-hover:scale-112"
                />
              </div>

              <motion.span 
                whileHover={{ scale: 1.15, y: -2 }}
                transition={{ type: 'spring', stiffness: 400 }}
                className="mt-2.5 px-3 py-1 rounded-xl bg-black text-white text-[10px] font-mono font-black uppercase tracking-wider shadow-[1.5px_1.5px_0px_#000000] group-hover:bg-[#FDC800] group-hover:text-black group-hover:shadow-[2.5px_2.5px_0px_#000000] transition-all"
              >
                {config.tag}
              </motion.span>
            </motion.div>

          </div>
        </motion.div>
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 🖼️ CLEAN FULL-SIZE ARTWORK LIGHTBOX (PURE IMAGE VIEW) */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isZoomed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-100 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-xs cursor-pointer"
            onClick={() => setIsZoomed(false)}
          >
            <motion.div
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 20 }}
              transition={{ type: 'spring', stiffness: 450, damping: 25 }}
              className={`w-full max-w-lg ${config.gradientClass} p-8 rounded-3xl border-3 border-black shadow-[10px_10px_0px_#000000] flex flex-col items-center text-center relative cursor-default`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setIsZoomed(false)}
                className="absolute top-4 right-4 p-2.5 bg-black text-white hover:bg-neutral-800 border-2 border-white rounded-2xl cursor-pointer shadow-[2px_2px_0px_#000000]"
                title="Close"
              >
                <X className="w-5 h-5 stroke-3" />
              </button>

              {/* Big High-Res Artwork */}
              <div className="w-64 h-64 sm:w-80 sm:h-80 bg-white/90 rounded-3xl border-3 border-black p-6 shadow-[5px_5px_0px_#000000] flex items-center justify-center mb-4">
                <img
                  src={config.mascot}
                  alt={config.title}
                  className="w-full h-full object-contain filter drop-shadow-2xl"
                />
              </div>

              {/* Character Title & Tag */}
              <h3 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight text-black">
                {config.title}
              </h3>
              <span className="mt-1 px-3 py-1 rounded-xl bg-black text-[#FDC800] text-xs font-mono font-black uppercase shadow-[1.5px_1.5px_0px_#000000]">
                {config.badgeText} • {config.tag}
              </span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
