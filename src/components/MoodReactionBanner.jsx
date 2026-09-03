import React, { useState, useEffect } from 'react';
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

const THEME_LETTERPRESS = {
  1: { ink: "#8C3B2E", kicker: "COMBAT TELEMETRY", verdict: "In The Trenches", blurb: "We take the hit. Rest, reload, and strike back tomorrow.", tag: "BATTLE TESTED" },
  2: { ink: "#C25E00", kicker: "RECOVERY PROTOCOL", verdict: "Low Battery Mode", blurb: "Recovery is active discipline. Unplug, recalibrate, and reset.", tag: "RECHARGING" },
  3: { ink: "#6E5E4E", kicker: "BASELINE DISCIPLINE", verdict: "Equilibrium Locked", blurb: "Consistency beats intensity. Showing up keeps the machine running.", tag: "LOCKED IN" },
  4: { ink: "#1E7B54", kicker: "MOMENTUM FLOW", verdict: "Momentum Unlocked", blurb: "High quality flow state. Keep the flame burning and stack the wins.", tag: "ON FIRE" },
  5: { ink: "#B07D08", kicker: "ABSOLUTE MASTERY", verdict: "Apex Performance", blurb: "Unstoppable execution across all spheres. Today was legendary.", tag: "CHAMPION" }
};

const PAPER = "#F5EFE0";
const INK_DARK = "#241F1A";
const BRASS = "#AD8A54";

function StarScore({ score, size = 15, color = "currentColor" }) {
  const full = Math.floor(score);
  return (
    <span style={{ display: "inline-flex", gap: 3 }}>
      {Array.from({ length: 5 }).map((_, i) => {
        const isFilled = i < full;
        return (
          <svg key={i} width={size} height={size} viewBox="0 0 20 20">
            <path
              d="M10 1.5l2.6 5.6 6.1.6-4.6 4.1 1.3 6-5.4-3.2-5.4 3.2 1.3-6-4.6-4.1 6.1-.6z"
              fill={isFilled ? color : "none"}
              stroke={color}
              strokeWidth="1.5"
              strokeLinejoin="round"
              opacity={isFilled ? 1 : 0.25}
            />
          </svg>
        );
      })}
    </span>
  );
}

export default function MoodReactionBanner({ rating }) {
  const [isZoomed, setIsZoomed] = useState(false);

  if (!rating || !MOOD_CONFIG[rating]) return null;

  const config = MOOD_CONFIG[rating];
  const pressTheme = THEME_LETTERPRESS[rating] || THEME_LETTERPRESS[3];
  const ink = pressTheme.ink;

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300..900&family=Space+Grotesk:wght@400;500;700&display=swap');`}</style>

      {/* SVG DEFS FOR AUTHENTIC LETTERPRESS GRAIN AND DECKLE EDGE */}
      <svg width="0" height="0" style={{ position: "absolute", pointerEvents: "none" }}>
        <defs>
          <clipPath id="deckleEdge" clipPathUnits="objectBoundingBox">
            <path d="M0,0 L1,0 L1,0.95 L0.965,0.975 L0.93,0.945 L0.895,0.975 L0.86,0.945 L0.825,0.975 L0.79,0.945 L0.755,0.975 L0.72,0.945 L0.685,0.975 L0.65,0.945 L0.615,0.975 L0.58,0.945 L0.545,0.975 L0.51,0.945 L0.475,0.975 L0.44,0.945 L0.405,0.975 L0.37,0.945 L0.335,0.975 L0.3,0.945 L0.265,0.975 L0.23,0.945 L0.195,0.975 L0.16,0.945 L0.125,0.975 L0.09,0.945 L0.055,0.975 L0.02,0.945 L0,0.96 Z" />
          </clipPath>
          <filter id="paperGrain">
            <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" result="noise" />
            <feColorMatrix in="noise" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.45 0" />
          </filter>
        </defs>
      </svg>

      <AnimatePresence mode="wait">
        <motion.div
          key={rating}
          initial={{ opacity: 0, y: 12, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 400, damping: 28 }}
          className="relative w-full my-1 select-none"
        >
          {/* 1. Deep Inked Solid Drop-Shadow Under Deckle Paper */}
          <div
            className="absolute inset-0 bg-[#1E1B17] rounded-3xl translate-x-1.5 translate-y-2 pointer-events-none"
            style={{ clipPath: "url(#deckleEdge)" }}
          />

          {/* 2. Premium Tactile Cotton Rag Letterpress Paper Body */}
          <div
            className="relative border-2 border-[#1E1B17] rounded-3xl p-5 sm:p-7 overflow-hidden"
            style={{
              backgroundColor: PAPER,
              clipPath: "url(#deckleEdge)"
            }}
          >
            {/* Paper Grain Micro-Texture */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                filter: "url(#paperGrain)",
                mixBlendMode: "multiply",
                opacity: 0.45
              }}
            />

            {/* Inner Content Layout */}
            <div className="relative z-10 flex flex-col sm:flex-row items-start justify-between gap-6 sm:gap-8">
              {/* Left Column: Letterpress Typography */}
              <div className="flex-1 min-w-0 space-y-2 text-left">
                
                {/* Vintage Editorial Kicker Tag */}
                <div className="flex items-center gap-2">
                  <span
                    className="font-mono text-[11px] font-black tracking-widest uppercase"
                    style={{ color: "#7A7160" }}
                  >
                    + + [ {pressTheme.kicker} ] + +
                  </span>
                </div>

                {/* Subtitle / System Topic */}
                <h3
                  className="font-serif font-medium text-lg sm:text-xl tracking-tight"
                  style={{ color: INK_DARK, fontFamily: "'Fraunces', serif" }}
                >
                  {config.title}
                </h3>

                {/* Classical Brass Filigree Divider */}
                <div className="flex items-center gap-2 py-0.5 max-w-sm">
                  <div className="h-[1px] w-6" style={{ backgroundColor: BRASS }} />
                  <div className="w-1.5 h-1.5 rotate-45" style={{ backgroundColor: BRASS }} />
                  <div className="h-[1px] flex-1" style={{ backgroundColor: BRASS }} />
                </div>

                {/* Big Rich Hand-Pressed Editorial Title */}
                <h2
                  className="font-serif italic font-extrabold text-3xl sm:text-4xl tracking-tight leading-tight pt-1"
                  style={{
                    color: ink,
                    fontFamily: "'Fraunces', serif"
                  }}
                >
                  {pressTheme.verdict}
                </h2>

                {/* Atmospheric Reviewer Note / Blurb */}
                <p
                  className="text-xs sm:text-sm leading-relaxed max-w-xl font-medium pt-1"
                  style={{
                    color: "#3B352B",
                    fontFamily: "'Space Grotesk', sans-serif"
                  }}
                >
                  "{pressTheme.blurb}"
                </p>

                {/* Star Score & Protocol Rating Row */}
                <div className="flex items-center gap-4 pt-3">
                  <StarScore score={rating} size={15} color={ink} />
                  <span
                    className="text-xs font-mono font-bold"
                    style={{ color: "#7A7160" }}
                  >
                    {config.badgeText} • {pressTheme.tag}
                  </span>
                </div>
              </div>

              {/* Right Column: High-Res Mascot Illustration in Letterpress Mat-Board Frame */}
              <motion.div
                whileHover={{ scale: 1.04, rotate: 1 }}
                whileTap={{ scale: 0.96 }}
                transition={{ type: 'spring', stiffness: 450, damping: 20 }}
                onClick={() => setIsZoomed(true)}
                className="shrink-0 flex flex-col items-center justify-center relative cursor-pointer self-center sm:self-start group pt-2 sm:pt-0"
                title="Click to inspect original artwork"
              >
                <div
                  className="w-28 h-28 sm:w-34 sm:h-34 rounded-2xl border-2 border-[#1E1B17] p-2.5 flex items-center justify-center relative overflow-hidden transition-all shadow-[3px_3px_0px_#1E1B17] group-hover:shadow-[5px_5px_0px_#1E1B17]"
                  style={{ backgroundColor: "#FFFFFF" }}
                >
                  <img
                    src={config.mascot}
                    alt={config.title}
                    className="w-full h-full object-contain filter drop-shadow-md transition-transform duration-300 group-hover:scale-110"
                  />
                </div>

                <span
                  className="mt-2.5 px-3 py-1 rounded-xl text-white text-[10px] font-mono font-black uppercase tracking-wider shadow-[1.5px_1.5px_0px_#000000] transition-all"
                  style={{
                    backgroundColor: ink,
                    border: `1.5px solid #1E1B17`
                  }}
                >
                  {config.tag}
                </span>
              </motion.div>
            </div>
          </div>

          {/* 3. Floating Vintage Wax Stamp Rating Seal (Upper-Right Offset) */}
          <div
            className="absolute -top-3.5 right-6 sm:right-10 w-16 h-16 sm:w-18 sm:h-18 rounded-full flex flex-col items-center justify-center text-center shadow-[3px_3px_0px_#1E1B17] z-20 pointer-events-none transform -rotate-6"
            style={{
              backgroundColor: ink,
              border: `2px solid ${PAPER}`,
              outline: `2px solid ${ink}`,
              outlineOffset: 2,
              color: PAPER
            }}
          >
            <span
              className="font-serif text-lg sm:text-xl font-bold leading-none"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              {Number(rating).toFixed(1)}
            </span>
            <span className="text-[8px] font-mono uppercase tracking-widest mt-0.5 opacity-90">
              OF 5★
            </span>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Clean Full-Size Lightbox Modal */}
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
              initial={{ scale: 0.85, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.85, y: 20 }}
              transition={{ type: 'spring', stiffness: 450, damping: 25 }}
              className="w-full max-w-md p-7 rounded-3xl border-3 border-black shadow-[10px_10px_0px_#000000] flex flex-col items-center text-center relative cursor-default"
              style={{ backgroundColor: PAPER }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setIsZoomed(false)}
                className="absolute top-4 right-4 p-2 bg-black text-white hover:bg-neutral-800 border-2 border-black rounded-xl cursor-pointer shadow-[2px_2px_0px_#000000]"
                title="Close"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
              </button>

              <div className="w-56 h-56 sm:w-64 sm:h-64 bg-white rounded-2xl border-2 border-black p-4 shadow-[4px_4px_0px_#000000] flex items-center justify-center mb-4">
                <img
                  src={config.mascot}
                  alt={config.title}
                  className="w-full h-full object-contain filter drop-shadow-xl"
                />
              </div>

              <h3
                className="font-serif italic font-extrabold text-2xl uppercase tracking-tight"
                style={{ color: ink, fontFamily: "'Fraunces', serif" }}
              >
                {pressTheme.verdict}
              </h3>
              <span className="mt-1 px-3 py-1 rounded-xl bg-black text-[#FDC800] text-xs font-mono font-black uppercase shadow-[1.5px_1.5px_0px_#000000]">
                {config.badgeText} • {pressTheme.tag}
              </span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
