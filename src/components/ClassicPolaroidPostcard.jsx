import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { 
  Camera, 
  Sparkles, 
  Flame, 
  CheckCircle2, 
  AlertCircle, 
  Compass, 
  ShieldCheck, 
  Zap 
} from 'lucide-react';

/**
 * 📸 Classic Neobrutalist Polaroid Keepsake
 * Authentic instant photo aesthetic fused with high-voltage Neobrutalism:
 * - Thick card stock with solid black drop shadow
 * - Neon washi tape header accent
 * - High-contrast photographic window with postmark cancellation
 * - Bold tactile verdict pill & streak badge
 * - Marker reflection block with barcode archival serial
 */
export function ClassicPolaroidPostcard({
  artImage,
  artTitle = "Rainy Veranda Sanctuary",
  rating = 5,
  dateStr = "2026-09-22",
  formattedDate = "Tue, Sep 22, 2026",
  streakCount = 14,
  noteText = "Faced friction head-on, stuck to non-negotiable habits, and reclaimed momentum before nightfall."
}) {
  const prefersReducedMotion = useReducedMotion();

  // Mood configuration based on rating
  const isHit = rating >= 4;
  const isMid = rating === 3;
  const verdictLabel = isHit ? 'VERDICT: HIT' : isMid ? 'VERDICT: MID' : 'VERDICT: ROUGH';
  const verdictBg = isHit ? '#00E599' : isMid ? '#FDC800' : '#FF4D4D';
  const verdictText = isHit ? 'text-black' : isMid ? 'text-black' : 'text-white';
  const VerdictIcon = isHit ? Flame : isMid ? Zap : AlertCircle;

  return (
    <div className="relative w-full max-w-sm mx-auto select-none">
      
      {/* 1. Underlying stacked photo cards for physical depth */}
      <div 
        className="absolute inset-0 translate-x-2 translate-y-3 -rotate-2 rounded-2xl bg-[#FDC800] border-3 border-black shadow-[4px_4px_0px_#000000]"
        aria-hidden="true"
      />
      <div 
        className="absolute inset-0 -translate-x-1.5 translate-y-1.5 rotate-1 rounded-2xl bg-[#00E599] border-3 border-black"
        aria-hidden="true"
      />

      {/* 2. Main Polaroid Card */}
      <motion.article
        initial={prefersReducedMotion ? false : { opacity: 0, y: 15, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 380, damping: 26 }}
        className="relative bg-[#FFFDF8] border-3 border-black rounded-2xl shadow-[8px_8px_0px_#000000] p-3.5 sm:p-4.5 pb-5 flex flex-col gap-3.5 z-10"
      >
        {/* Top Tactile Neon Washi Tape Accent */}
        <div 
          className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#FDC800] border-2 border-black font-mono text-[9px] font-black uppercase tracking-widest text-black shadow-[2px_2px_0px_#000000] -rotate-1 z-20 flex items-center gap-1.5"
          aria-hidden="true"
        >
          <Sparkles className="w-3 h-3 stroke-[2.5]" />
          <span>DAILY VERDICT • MEMORY KEEPSAKE</span>
        </div>

        {/* Photographic Window Frame */}
        <div className="relative w-full aspect-[4/3] bg-[#111318] border-2.5 border-black rounded-xl overflow-hidden shadow-[inset_0_0_16px_rgba(0,0,0,0.6)] mt-1">
          {/* Main Photo Artwork */}
          <img
            src={artImage}
            alt={artTitle}
            className="w-full h-full object-cover"
          />

          {/* Top-Left: Day Streak Pill */}
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1 px-2.5 py-1 bg-black text-[#FDC800] border-2 border-[#FDC800] rounded-lg font-mono text-[10px] font-black uppercase tracking-wider shadow-[2px_2px_0px_rgba(0,0,0,0.5)]">
            <Flame className="w-3 h-3 stroke-[2.5] text-[#00E599]" />
            <span>DAY {streakCount} STREAK</span>
          </div>

          {/* Top-Right: Camera Stamp Cancellation Ring */}
          <div className="absolute top-2.5 right-2.5 px-2 py-0.5 bg-black/80 backdrop-blur-xs text-white border border-white/50 rounded-md font-mono text-[9px] font-black tracking-wider uppercase rotate-2 flex items-center gap-1">
            <Camera className="w-3 h-3 text-[#00E599] stroke-[2.5]" />
            <span>{dateStr}</span>
          </div>

          {/* Bottom-Left: Punchy Verdict Pill */}
          <div 
            className={`absolute bottom-2.5 left-2.5 flex items-center gap-1.5 px-3 py-1 rounded-lg border-2 border-black font-mono text-[11px] font-black uppercase tracking-wider shadow-[2px_2px_0px_#000000] ${verdictText}`}
            style={{ backgroundColor: verdictBg }}
          >
            <VerdictIcon className="w-3.5 h-3.5 stroke-[3]" />
            <span>{verdictLabel} • {rating}/5</span>
          </div>

          {/* Bottom-Right: Star Meter */}
          <div className="absolute bottom-2.5 right-2.5 px-2 py-1 bg-black/85 border border-black/40 rounded-lg text-[#FDC800] font-mono text-[11px] font-black tracking-widest">
            {'★'.repeat(rating)}{'☆'.repeat(5 - rating)}
          </div>
        </div>

        {/* Polaroid Bezel Bottom Section (The Wide Chin) */}
        <div className="space-y-3 pt-0.5">
          {/* Card Title & Coordinates */}
          <div className="flex items-center justify-between border-b-2 border-black/15 pb-2">
            <div>
              <h3 className="font-display font-black text-sm sm:text-base uppercase tracking-tight text-black leading-tight">
                {artTitle}
              </h3>
              <div className="text-[10px] font-mono font-bold text-neutral-500 uppercase flex items-center gap-1 mt-0.5">
                <Compass className="w-3 h-3 stroke-[2.5] text-black" />
                <span>{formattedDate}</span>
              </div>
            </div>

            {/* Circular Authenticity Seal */}
            <div className="w-9 h-9 rounded-full bg-[#00E599] border-2 border-black flex items-center justify-center shadow-[1.5px_1.5px_0px_#000000] shrink-0 rotate-6">
              <ShieldCheck className="w-5 h-5 text-black stroke-[2.5]" />
            </div>
          </div>

          {/* Handwritten Reflection Box */}
          <div className="p-3 bg-[#FFF9E6] border-2 border-black rounded-xl shadow-[2px_2px_0px_#000000] relative">
            <span className="font-mono text-xs text-neutral-800 leading-relaxed font-bold italic line-clamp-3 block">
              "{noteText}"
            </span>
          </div>

          {/* Archival Barcode & Serial Number Ribbon */}
          <div className="pt-1 flex items-center justify-between">
            {/* SVG Visual Barcode */}
            <div className="flex items-center gap-0.75" aria-hidden="true">
              {[4, 2, 6, 3, 5, 2, 7, 3, 2, 6, 4, 3, 5, 2, 8, 3, 4, 2, 6, 3].map((height, i) => (
                <div 
                  key={i} 
                  className="w-0.75 bg-black" 
                  style={{ height: `${height * 2.2}px` }} 
                />
              ))}
            </div>

            {/* Archival Monospace Metadata */}
            <div className="text-right font-mono text-[9px] font-black uppercase text-neutral-600 tracking-wider">
              <span>SHIT OR HIT // ARCHIVE</span>
              <div className="text-black font-extrabold text-[8px] tracking-tight">
                TOKEN #{dateStr.replace(/-/g, '')}-{streakCount}
              </div>
            </div>
          </div>
        </div>
      </motion.article>
    </div>
  );
}

export default ClassicPolaroidPostcard;
