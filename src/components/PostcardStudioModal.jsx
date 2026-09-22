import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, 
  X, 
  CheckCircle2, 
  RotateCw, 
  Layers, 
  Sparkles, 
  Compass, 
  Calendar, 
  Quote, 
  ShieldCheck,
  Flame,
  Award,
  Share2,
  Copy
} from 'lucide-react';
import { soundEngine } from '../services/soundEngine';
import mascotSanctuaryRain from '../assets/mascots/mascot_sanctuary_rain.webp';
import mascotSabbaticalSummit from '../assets/mascots/mascot_sabbatical_summit.webp';

export default function PostcardStudioModal({
  isOpen,
  onClose,
  entry = null,
  dateStr = new Date().toISOString().slice(0, 10),
  activeStreak = 14
}) {
  const [activeDesign, setActiveDesign] = useState('polaroid'); // 'polaroid' | 'tokyo' | 'airmail'
  const [artChoice, setArtChoice] = useState('rain'); // 'rain' | 'summit'
  const [previewRating, setPreviewRating] = useState(entry?.rating || 5);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentArt = artChoice === 'rain' ? mascotSanctuaryRain : mascotSabbaticalSummit;
  const currentArtTitle = artChoice === 'rain' ? 'Rainy Veranda Sanctuary' : 'Mountain Summit Sabbatical';
  const currentArtSubtitle = artChoice === 'rain' ? 'Quiet restorative contemplation' : 'Elevated horizon & stoic discipline';

  const entryNote = entry?.notes?.trim() 
    || "Today was about holding the line. Faced friction head-on, stuck to non-negotiable habits, and reclaimed momentum before nightfall.";

  const formattedDate = new Date(`${dateStr}T00:00:00`).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const ratingTitles = {
    5: 'ABSOLUTE HIT • MASTERCLASS',
    4: 'GOOD PROGRESS • SOLID WIN',
    3: 'BALANCED EQUILIBRIUM',
    2: 'HEAVY RESISTANCE • DOWN',
    1: 'ROUGH FRICTION • INQUEST'
  };

  const handleCopyQuote = () => {
    soundEngine.playSuccess();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`"${entryNote}" — Daily Verdict (${dateStr}, ${previewRating}★)`);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-xs overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.94, opacity: 0, y: 18 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.94, opacity: 0, y: 18 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-4xl bg-[#FFFDF8] border-3 border-black shadow-[10px_10px_0px_#000000] flex flex-col max-h-[92vh] overflow-hidden my-auto"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between border-b-3 border-black p-4 sm:p-5 bg-[#FDC800] shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-black text-[#FDC800] border-2 border-black shadow-[2px_2px_0px_#000000]">
                <Camera className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-black text-white font-mono text-[9px] font-black uppercase tracking-wider mb-0.5">
                  <Sparkles className="w-3 h-3 text-[#00E599]" />
                  <span>DEV LAB SHOWCASE • POLAROID CONCEPTS</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-black tracking-tight leading-none uppercase">
                  Daily Postcard Memory Studio
                </h2>
              </div>
            </div>

            <button
              onClick={() => {
                soundEngine.playClick();
                onClose();
              }}
              className="p-1.5 sm:p-2 bg-[#FF4D4D] text-black border-2 border-black hover:bg-black hover:text-white transition-colors shadow-[2px_2px_0px_#000000] active:translate-x-px active:translate-y-px cursor-pointer"
              aria-label="Close studio"
            >
              <X className="w-5 h-5 stroke-3" />
            </button>
          </div>

          {/* Dev Lab Controls Toolbar */}
          <div className="p-3 sm:px-6 sm:py-3.5 bg-white border-b-2 border-black flex flex-wrap items-center justify-between gap-3 shrink-0">
            {/* Style Selector Tabs */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-mono font-black text-neutral-500 uppercase mr-1">DESIGN STYLE:</span>
              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  setActiveDesign('polaroid');
                }}
                className={`px-3 py-1.5 text-xs font-mono font-black border-2 border-black rounded-lg transition-all cursor-pointer ${
                  activeDesign === 'polaroid'
                    ? 'bg-[#00E599] text-black shadow-[2px_2px_0px_#000000] -translate-y-0.5'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                }`}
              >
                1. CLASSIC POLAROID
              </button>
              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  setActiveDesign('tokyo');
                }}
                className={`px-3 py-1.5 text-xs font-mono font-black border-2 border-black rounded-lg transition-all cursor-pointer ${
                  activeDesign === 'tokyo'
                    ? 'bg-[#00D8F6] text-black shadow-[2px_2px_0px_#000000] -translate-y-0.5'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                }`}
              >
                2. TOKYO DISPATCH
              </button>
              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  setActiveDesign('airmail');
                }}
                className={`px-3 py-1.5 text-xs font-mono font-black border-2 border-black rounded-lg transition-all cursor-pointer ${
                  activeDesign === 'airmail'
                    ? 'bg-[#FF4D6D] text-black shadow-[2px_2px_0px_#000000] -translate-y-0.5'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                }`}
              >
                3. AIRMAIL THERMAL
              </button>
            </div>

            {/* Test Harness Modifiers */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  setArtChoice(prev => prev === 'rain' ? 'summit' : 'rain');
                }}
                className="px-2.5 py-1 bg-[#FFF9E6] hover:bg-[#FFF3CC] text-black border border-black rounded-md font-mono text-[11px] font-black uppercase flex items-center gap-1.5 shadow-[1px_1px_0px_#000000] cursor-pointer"
              >
                <RotateCw className="w-3 h-3 stroke-[2.5]" />
                <span>ART: {artChoice === 'rain' ? 'VERANDA' : 'SUMMIT'}</span>
              </button>

              <div className="flex items-center gap-1 border border-black p-0.5 bg-neutral-100 rounded-md">
                {[1, 2, 3, 4, 5].map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => {
                      soundEngine.playClick();
                      setPreviewRating(val);
                    }}
                    className={`w-6 h-6 text-xs font-mono font-black rounded flex items-center justify-center transition-all cursor-pointer ${
                      previewRating === val ? 'bg-black text-[#FDC800] font-black' : 'text-neutral-600 hover:bg-white'
                    }`}
                  >
                    {val}★
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Interactive Card Canvas Stage */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-8 bg-[#F4EFE6] flex items-center justify-center min-h-[420px]">

            {/* ========================================================= */}
            {/* DESIGN A: CLASSIC NEOBRUTALIST POLAROID */}
            {/* ========================================================= */}
            {activeDesign === 'polaroid' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.18 }}
                className="w-full max-w-sm bg-white border-3 border-black shadow-[8px_8px_0px_#000000] p-4 pb-6 flex flex-col gap-3 relative"
              >
                {/* Top Tape Accent */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-6 bg-[#FDC800]/90 border border-black/40 rotate-[-1.5deg] shadow-[1px_1px_0px_rgba(0,0,0,0.15)] pointer-events-none" />

                {/* Polaroid Photographic Window */}
                <div className="w-full aspect-[4/3] bg-neutral-900 border-2 border-black overflow-hidden relative shadow-[inset_0_0_12px_rgba(0,0,0,0.4)]">
                  <img 
                    src={currentArt} 
                    alt={currentArtTitle}
                    className="w-full h-full object-cover"
                  />
                  {/* Stamp Cancellation Overlay */}
                  <div className="absolute top-2.5 right-2.5 px-2 py-0.5 bg-black/85 backdrop-blur-xs text-white border border-white/40 font-mono text-[9px] font-black tracking-widest uppercase rotate-2">
                    POSTMARK • {dateStr}
                  </div>
                  {/* Rating Tag */}
                  <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-[#FDC800] text-black border-2 border-black font-mono text-[10px] font-black tracking-wider shadow-[2px_2px_0px_#000000]">
                    {'★'.repeat(previewRating)}{'☆'.repeat(5 - previewRating)} {previewRating}/5
                  </div>
                </div>

                {/* Polaroid Bezel Bottom Section */}
                <div className="pt-2 px-1 space-y-2">
                  <div className="flex items-center justify-between border-b-2 border-black/15 pb-1.5">
                    <span className="font-mono text-xs font-black text-black uppercase tracking-tight">
                      {currentArtTitle}
                    </span>
                    <span className="text-[10px] font-mono font-black bg-[#00E599] text-black px-1.5 py-0.5 border border-black">
                      DAY {activeStreak} STREAK
                    </span>
                  </div>

                  <p className="text-xs font-mono text-black leading-relaxed italic line-clamp-3">
                    "{entryNote}"
                  </p>

                  <div className="pt-1 flex items-center justify-between text-[10px] font-mono text-neutral-500 font-bold">
                    <span>{formattedDate}</span>
                    <span>SHIT OR HIT • DAILY ARCHIVE</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ========================================================= */}
            {/* DESIGN B: TOKYO CYBER-EDITORIAL DISPATCH */}
            {/* ========================================================= */}
            {activeDesign === 'tokyo' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.18 }}
                className="w-full max-w-lg bg-[#FFFDF5] border-3 border-black shadow-[8px_8px_0px_#000000] p-5 flex flex-col sm:flex-row gap-4 relative overflow-hidden"
              >
                {/* Left Photo Column */}
                <div className="sm:w-5/12 shrink-0 flex flex-col gap-2">
                  <div className="w-full aspect-[4/5] bg-black border-2 border-black overflow-hidden relative shadow-[2px_2px_0px_#000000]">
                    <img 
                      src={currentArt} 
                      alt={currentArtTitle}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-2 left-2 right-2 text-white font-mono text-[9px] font-black leading-tight">
                      {currentArtTitle}
                    </div>
                  </div>
                  <div className="bg-black text-[#00D8F6] p-2 font-mono text-[10px] font-black flex items-center justify-between border border-black">
                    <span>LOC: VERANDA_01</span>
                    <span>STASIS_OK</span>
                  </div>
                </div>

                {/* Right Editorial Info Column */}
                <div className="flex-1 min-w-0 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="font-mono text-[10px] font-black bg-black text-white px-2 py-0.5 uppercase">
                        CHRONICLE DISPATCH
                      </span>
                      <span className="font-mono text-[10px] font-black text-neutral-500">
                        {dateStr}
                      </span>
                    </div>

                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="font-display font-black text-3xl text-black leading-none">
                        0{previewRating}
                      </span>
                      <div className="leading-tight">
                        <div className="text-xs font-mono font-black text-black">
                          {ratingTitles[previewRating]}
                        </div>
                        <div className="text-[10px] font-mono text-[#00E599] font-bold">
                          {'★'.repeat(previewRating)}{'☆'.repeat(5 - previewRating)} CONFIRMED
                        </div>
                      </div>
                    </div>

                    <div className="p-2.5 bg-white border-2 border-black shadow-[2px_2px_0px_#000000] text-xs font-mono text-black leading-relaxed">
                      "{entryNote}"
                    </div>
                  </div>

                  {/* Micro Barcode Strip */}
                  <div className="border-t-2 border-black pt-2 flex items-center justify-between text-[9px] font-mono text-neutral-600 font-black uppercase">
                    <span>STREAK: {activeStreak} DAYS</span>
                    <span className="tracking-widest">||| | |||| | |||</span>
                    <span>SHA-256 VAULT</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ========================================================= */}
            {/* DESIGN C: AIRMAIL THERMAL KEEPSAKE */}
            {/* ========================================================= */}
            {activeDesign === 'airmail' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.18 }}
                className="w-full max-w-md bg-[#FFFDF8] border-3 border-black shadow-[8px_8px_0px_#000000] p-5 relative overflow-hidden"
                style={{
                  backgroundImage: 'repeating-linear-gradient(45deg, #FF4D4D 0, #FF4D4D 10px, transparent 10px, transparent 20px, #00D8F6 20px, #00D8F6 30px, transparent 30px, transparent 40px)',
                  backgroundSize: '100% 8px',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'top'
                }}
              >
                {/* Airmail Header */}
                <div className="pt-2 pb-3 border-b-2 border-dashed border-black/30 flex items-center justify-between">
                  <div>
                    <div className="font-mono text-[9px] font-black uppercase tracking-widest text-[#FF4D4D]">
                      AIRMAIL PAR AVION • KEEPSAKE
                    </div>
                    <h3 className="font-display font-black text-base text-black uppercase">
                      Daily Verdict Airmail
                    </h3>
                  </div>
                  {/* Postal Stamp Badge */}
                  <div className="w-12 h-14 bg-[#FFF9E6] border-2 border-black p-1 flex flex-col items-center justify-between shadow-[2px_2px_0px_#000000] rotate-2">
                    <span className="font-mono text-[8px] font-black text-black">2026</span>
                    <Award className="w-4 h-4 text-[#FDC800] stroke-[2.5]" />
                    <span className="font-mono text-[8px] font-black text-[#00E599]">{previewRating}★</span>
                  </div>
                </div>

                {/* Body Content with Stamp Picture */}
                <div className="py-3.5 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-xl border-2 border-black overflow-hidden shrink-0 shadow-[2px_2px_0px_#000000] bg-black">
                      <img 
                        src={currentArt} 
                        alt={currentArtTitle}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="font-mono text-xs font-black text-black uppercase truncate">
                        {currentArtTitle}
                      </div>
                      <div className="font-mono text-[10px] text-neutral-600 mt-0.5">
                        Logged on {formattedDate}
                      </div>
                      <div className="inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 bg-[#FDC800] border border-black font-mono text-[9px] font-black">
                        <Flame className="w-3 h-3 text-black" />
                        <span>ACTIVE STREAK: {activeStreak} DAYS</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-[#FFFDF5] border-2 border-black rounded-lg text-xs font-mono text-black leading-relaxed">
                    <Quote className="w-3.5 h-3.5 text-black mb-1 opacity-40" />
                    "{entryNote}"
                  </div>
                </div>

                {/* Footer Slip Metadata */}
                <div className="pt-2 border-t-2 border-dashed border-black/30 flex items-center justify-between font-mono text-[10px] text-black/70">
                  <span>CLIENT-SIDE CRYPTO • SHIT OR HIT</span>
                  <span className="font-black text-black">100% VERIFIED</span>
                </div>
              </motion.div>
            )}

          </div>

          {/* Footer Bar */}
          <div className="p-4 sm:px-6 sm:py-3.5 border-t-3 border-black bg-[#FFFDF8] shrink-0 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2 font-mono text-xs text-neutral-600">
              <ShieldCheck className="w-4 h-4 text-[#00E599] stroke-[2.5]" />
              <span>
                <strong>Dev Note:</strong> This feature will be <strong>OFF by default in Settings</strong> and only enabled by choice.
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyQuote}
                className="px-4 py-2 bg-white hover:bg-neutral-100 text-black font-mono font-black text-xs uppercase tracking-wider border-2 border-black shadow-[2px_2px_0px_#000000] active:translate-x-px active:translate-y-px cursor-pointer flex items-center gap-1.5"
              >
                {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-[#00E599] stroke-3" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'COPIED!' : 'COPY QUOTE'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  onClose();
                }}
                className="px-5 py-2 bg-black text-white hover:bg-[#FDC800] hover:text-black font-mono font-black text-xs uppercase tracking-wider border-2 border-black shadow-[3px_3px_0px_#000000] active:translate-x-px active:translate-y-px cursor-pointer"
              >
                Done Previewing
              </button>
            </div>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
