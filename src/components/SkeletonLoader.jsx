import React, { useEffect, useState } from 'react';
import { 
  AlertCircle,
  CloudRain,
  MinusCircle,
  Zap,
  Sparkles,
  Flame, 
  Calendar, 
  Clock, 
  Settings, 
  BarChart2, 
  Printer,
  PenLine,
  Cloud,
  Check
} from 'lucide-react';
import ShieldVoltIcon from './ShieldVoltIcon';

/* ------------------------------------------------------------------
   🏛️ GROUND-TRUTH NEOBRUTALIST SKELETON ARCHITECTURE:
   1. Structure (cards, borders, shadows, logo) is STATIC & 100% 1:1
      matching the exact layout shown on live desktop & mobile screens.
   2. Only dynamic data placeholders ("bones") shimmer with linear gradient.
   3. Screen readers receive one polite status announcement.
   4. Motion is disabled for people with prefers-reduced-motion.
   5. Fast loads never flash a skeleton (delayMs).
------------------------------------------------------------------- */

const SHIMMER_CSS = `
.sk-bone { position: relative; overflow: hidden; }
.sk-bone::after {
  content: '';
  position: absolute;
  inset: 0;
  transform: translateX(-100%);
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.75), transparent);
  animation: sk-shimmer 1.4s ease-in-out infinite;
}
@keyframes sk-shimmer { to { transform: translateX(100%); } }
@media (prefers-reduced-motion: reduce) {
  .sk-bone::after { animation: none; }
}
`;

function Bone({ className = '', strong = false, children }) {
  return (
    <div
      aria-hidden="true"
      className={`sk-bone flex items-center justify-center ${strong ? 'bg-neutral-300' : 'bg-neutral-200'} ${className}`}
    >
      {children}
    </div>
  );
}

// -------------------------------------------------------------
// MOBILE SKELETON: Matches MobileAppView.jsx 1:1
// -------------------------------------------------------------
function MobileSkeleton() {
  return (
    <div className="flex flex-col min-h-screen bg-[#FFFDF5] text-black font-sans pb-28 select-none relative">
      {/* Top Header App Bar */}
      <header className="sticky top-0 z-40 bg-[#FFFDF5]/95 backdrop-blur-md border-b-2 border-black px-2.5 py-2 sm:px-4 sm:py-3 flex items-center justify-between shadow-[0_2px_0px_#000000] gap-1.5">
        <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0 shrink-0">
          <div className="w-8 h-8 rounded-xl bg-white border-2 border-black flex items-center justify-center shadow-[1.5px_1.5px_0px_#000000] shrink-0 p-0.5">
            <ShieldVoltIcon className="w-full h-full" color="#FDC800" />
          </div>
          <div className="min-w-0 space-y-1">
            <div className="h-3.5 w-16 bg-neutral-900 rounded font-display font-black text-xs uppercase" />
            <div className="h-2 w-20 bg-neutral-300 rounded hidden xs:block" />
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Day Streak Pill */}
          <div className="flex items-center gap-1 px-2 py-1 rounded-xl bg-[#00E599] border-2 border-black font-mono text-[10px] sm:text-xs font-black shadow-[1.5px_1.5px_0px_#000000] shrink-0">
            <Flame className="w-3.5 h-3.5 fill-black text-black shrink-0" />
            <Bone className="h-2.5 w-10 rounded bg-black/20" />
          </div>

          {/* Sync Button Placeholder */}
          <div className="px-2 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-white border-2 border-black shadow-[1.5px_1.5px_0px_#000000] flex items-center gap-1 shrink-0">
            <Cloud className="w-3.5 h-3.5 text-neutral-400" />
            <Bone className="h-2 w-6 rounded" />
          </div>

          {/* Settings Button Placeholder */}
          <div className="p-1.5 sm:p-2 rounded-xl bg-white border-2 border-black shadow-[1.5px_1.5px_0px_#000000] shrink-0">
            <Settings className="w-4 h-4 text-neutral-400" />
          </div>
        </div>
      </header>

      {/* Main Workspace matching MobileAppView */}
      <main className="flex-1 px-4 py-3.5 space-y-3.5 max-w-lg mx-auto w-full">
        {/* Context Banner */}
        <div className="flex items-center justify-between bg-white border-2 border-black p-3 rounded-2xl shadow-[3px_3px_0px_#000000]">
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <Bone strong className="h-5 w-24 rounded-lg" />
              <Bone className="h-4 w-14 rounded-full bg-[#FDC800]/50 border border-black" />
            </div>
            <Bone className="h-2.5 w-44 rounded" />
          </div>
          <div className="w-9 h-9 rounded-xl bg-[#00E599] border-2 border-black flex items-center justify-center shadow-[1.5px_1.5px_0px_#000000] shrink-0">
            <Zap className="w-5 h-5 text-black fill-black" />
          </div>
        </div>

        {/* 5 Stacked Verdict Cards (1:1 with single-verdict mode) */}
        <div className="space-y-2.5">
          {[
            { star: 5, label: 'PEAK', color: '#FDC800', Icon: Sparkles },
            { star: 4, label: 'GOOD', color: '#00E599', Icon: Zap },
            { star: 3, label: 'OKAY', color: '#B8E986', Icon: MinusCircle },
            { star: 2, label: 'DOWN', color: '#FF9966', Icon: CloudRain },
            { star: 1, label: 'ROUGH', color: '#FF4D4D', Icon: AlertCircle }
          ].map((item) => (
            <div
              key={item.star}
              className="w-full p-3.5 rounded-2xl border-2 border-black bg-white flex items-center justify-between shadow-[3px_3px_0px_#000000]"
            >
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-xl border-2 border-black flex items-center justify-center shadow-[1.5px_1.5px_0px_#000000] shrink-0"
                  style={{ backgroundColor: item.color }}
                >
                  <item.Icon className="w-5 h-5 text-black stroke-[2.5]" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-display font-black text-sm uppercase text-black">{item.label}</span>
                    <span className="text-xs font-mono font-black text-neutral-400">({item.star}/5★)</span>
                  </div>
                  <Bone className="h-2.5 w-32 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Textarea / Journal Action Card */}
        <div className="p-3.5 rounded-2xl border-2 border-black bg-white shadow-[3px_3px_0px_#000000] space-y-3">
          <div className="flex items-center justify-between">
            <Bone strong className="h-3 w-28 rounded" />
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg border border-black bg-neutral-100">
              <Printer className="w-3 h-3 text-neutral-400" />
              <Bone className="h-2 w-12 rounded" />
            </div>
          </div>
          <div className="h-20 bg-neutral-50 border-2 border-dashed border-black/20 rounded-xl p-2.5 space-y-2">
            <Bone className="h-2.5 w-3/4 rounded" />
            <Bone className="h-2.5 w-1/2 rounded" />
          </div>
          <Bone strong className="h-11 w-full rounded-xl bg-[#FDC800] border-2 border-black shadow-[2px_2px_0px_#000000]" />
        </div>
      </main>

      {/* Bottom Navigation matching MobileAppView */}
      <nav
        aria-hidden="true"
        className="sticky sm:fixed bottom-0 inset-x-0 bg-white border-t-3 border-black px-4 pt-2 pb-3 flex justify-between z-30 shadow-[0_-2px_0px_#000000]"
        style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
      >
        {[
          { label: 'TODAY', Icon: Calendar },
          { label: 'TIMELINE', Icon: Clock },
          { label: 'DOSSIER', Icon: Sparkles },
          { label: 'SETTINGS', Icon: Settings }
        ].map((t, idx) => (
          <div key={idx} className="flex flex-col items-center gap-1 w-16">
            <div className={`p-1.5 rounded-xl border-2 border-black flex items-center justify-center ${idx === 0 ? 'bg-[#FDC800]' : 'bg-neutral-100'}`}>
              <t.Icon className="w-4 h-4 text-black stroke-[2.5]" />
            </div>
            <span className="font-mono text-[9px] font-black text-neutral-600 uppercase">{t.label}</span>
          </div>
        ))}
      </nav>
    </div>
  );
}

// -------------------------------------------------------------
// DESKTOP SKELETON: Matches Exact Live Ground-Truth Screenshot 1:1
// -------------------------------------------------------------
function DesktopSkeleton() {
  return (
    <div className="min-h-screen bg-[#FFFDF5] text-black font-sans flex flex-col select-none">
      
      {/* 1. Header (Sticky Top Bar, max-w-7xl) */}
      <header className="border-b-3 border-black bg-white sticky top-0 z-30">
        <div className="w-full max-w-7xl 2xl:max-w-8xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          
          {/* Left: Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-2xl bg-white border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_#000000] shrink-0 p-1">
              <ShieldVoltIcon className="w-full h-full" color="#FDC800" />
            </div>
            <div>
              <div className="font-display font-black text-lg sm:text-xl text-black tracking-tight leading-none uppercase">
                SHIT OR HIT
              </div>
              <span className="text-[10px] font-mono font-bold text-neutral-500 block mt-0.5">
                Cloud Sync (Trinno)
              </span>
            </div>
          </div>

          {/* Center: Long Segmented Nav Bar */}
          <nav className="hidden md:flex items-center justify-center bg-[#F4F2E6] px-2 py-1.5 rounded-full border-2 border-black shadow-[2px_2px_0px_#000000] gap-2 shrink-0">
            <div className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#FDC800] border-2 border-black font-display font-black text-xs uppercase shadow-[1px_1px_0px_#000000]">
              <Zap className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>TODAY</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 text-neutral-700 font-display font-black text-xs uppercase">
              <Calendar className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>TIMELINE</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 text-neutral-700 font-display font-black text-xs uppercase">
              <Sparkles className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>DOSSIER</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 text-neutral-700 font-display font-black text-xs uppercase">
              <BarChart2 className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>STUDIO</span>
            </div>
          </nav>

          {/* Right: Controls Pill */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Day Streak Pill */}
            <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#00E599] border-2 border-black text-black font-mono text-xs font-black shadow-[1.5px_1.5px_0px_#000000] shrink-0">
              <Flame className="w-3.5 h-3.5 fill-black text-black" />
              <span>DAY 41</span>
            </div>

            {/* Cloud User Pill */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#00E599] border-2 border-black text-black font-mono text-xs font-black shadow-[1.5px_1.5px_0px_#000000] shrink-0">
              <div className="w-2 h-2 rounded-full bg-emerald-700 animate-pulse" />
              <span>Trinno</span>
            </div>

            {/* Receipt Button */}
            <div className="p-2 rounded-xl bg-white border-2 border-black shadow-[1.5px_1.5px_0px_#000000]">
              <Printer className="w-4 h-4 text-black stroke-[2.5]" />
            </div>

            {/* Settings Button */}
            <div className="p-2 rounded-xl bg-white border-2 border-black shadow-[1.5px_1.5px_0px_#000000]">
              <Settings className="w-4 h-4 text-black" />
            </div>
          </div>
        </div>
      </header>

      {/* 2. Main Workspace: Exact 1:1 layout from ground truth */}
      <main className="flex-1 w-full max-w-7xl 2xl:max-w-8xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        
        {/* ========================================================= */}
        {/* CARD 1: TODAY HERO ARENA                                  */}
        {/* ========================================================= */}
        <div className="bg-white border-3 border-black rounded-4xl p-6 sm:p-8 shadow-[4px_4px_0px_#000000] space-y-6">
          
          {/* Top Row: Left Context + Right 5 Rating Buttons */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-4 border-b border-black/10">
            
            {/* Left Context: Big Mood Box + Titles */}
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl border-3 border-black bg-neutral-100 flex items-center justify-center shadow-[2px_2px_0px_#000000] shrink-0">
                <MinusCircle className="w-8 h-8 text-neutral-400/40" />
              </div>

              <div className="space-y-1">
                <div className="inline-block px-2.5 py-0.5 rounded-full bg-black text-white font-mono text-[10px] font-black tracking-wider uppercase">
                  TODAY • DAY 41
                </div>
                <h2 className="font-display font-black text-3xl sm:text-4xl uppercase tracking-tight text-black leading-none">
                  TUESDAY
                </h2>
                <div className="font-sans text-xs text-neutral-600 font-medium">
                  September 29, 2026
                </div>
                <div className="font-mono text-[11px] text-neutral-500 pt-0.5">
                  Hover & punch an icon to log your verdict.
                </div>
              </div>
            </div>

            {/* Right: 5 Tactile Rating Buttons */}
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap sm:flex-nowrap">
              {[
                { star: '1/5', label: 'ROUGH', color: '#FF4D4D', Icon: AlertCircle },
                { star: '2/5', label: 'DOWN', color: '#FF9966', Icon: CloudRain },
                { star: '3/5', label: 'OKAY', color: '#6E5E4E', Icon: MinusCircle },
                { star: '4/5', label: 'GOOD', color: '#00E599', Icon: Zap },
                { star: '5/5', label: 'PEAK', color: '#FDC800', Icon: Sparkles }
              ].map((btn, idx) => (
                <div
                  key={idx}
                  className="w-18 sm:w-20 p-2.5 sm:p-3 rounded-2xl border-2 border-black bg-white shadow-[2px_2px_0px_#000000] flex flex-col items-center justify-center text-center gap-1.5 shrink-0"
                >
                  <div 
                    className="w-9 h-9 rounded-full border-2 border-black flex items-center justify-center shadow-[1px_1px_0px_#000000]"
                    style={{ backgroundColor: btn.color }}
                  >
                    <btn.Icon className="w-4 h-4 text-black stroke-[2.5]" />
                  </div>
                  <div className="font-display font-black text-[11px] uppercase text-black leading-tight">
                    {btn.label}
                  </div>
                  <div className="font-mono text-[10px] text-neutral-500 leading-tight">
                    {btn.star}
                  </div>
                </div>
              ))}
            </div>

          </div>

          {/* Bottom Action Row: Status Message + Receipt & Journal Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <div className="font-mono text-xs text-neutral-500">
              No verdict logged yet for today.
            </div>

            <div className="flex items-center gap-2.5">
              <div className="px-3.5 py-2 rounded-xl bg-white border-2 border-black font-display font-black text-xs uppercase flex items-center gap-1.5 shadow-[1.5px_1.5px_0px_#000000]">
                <Printer className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>RECEIPT</span>
              </div>
              <div className="px-4 py-2 rounded-xl bg-white border-2 border-black font-display font-black text-xs uppercase flex items-center gap-1.5 shadow-[1.5px_1.5px_0px_#000000]">
                <PenLine className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>+ Unified Day Journal</span>
              </div>
            </div>
          </div>

        </div>

        {/* ========================================================= */}
        {/* CARD 2: LIFETIME METRICS (StatsWidget Ground Truth)       */}
        {/* ========================================================= */}
        <div className="bg-white border-3 border-black rounded-4xl p-6 sm:p-8 shadow-[4px_4px_0px_#000000] space-y-6">
          
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-black/10">
            <div className="flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-black stroke-[2.5]" />
              <h3 className="font-display font-black text-lg uppercase tracking-tight text-black">
                LIFETIME METRICS
              </h3>
            </div>
            <div className="px-3.5 py-1 rounded-xl bg-[#FDC800] border-2 border-black font-display font-black text-xs uppercase shadow-[1.5px_1.5px_0px_#000000]">
              STATS
            </div>
          </div>

          {/* Top 2 Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl border-2 border-black bg-white shadow-[2px_2px_0px_#000000] space-y-1">
              <span className="font-mono text-xs font-black uppercase text-neutral-600 block">HIT RATE %</span>
              <Bone strong className="h-8 w-24 rounded-lg my-1" />
              <span className="font-mono text-[11px] text-neutral-500 block">4/40 logged days</span>
            </div>
            <div className="p-5 rounded-2xl border-2 border-black bg-white shadow-[2px_2px_0px_#000000] space-y-1">
              <span className="font-mono text-xs font-black uppercase text-neutral-600 block">AVG QUALITY</span>
              <Bone strong className="h-8 w-28 rounded-lg my-1" />
              <span className="font-mono text-[11px] text-neutral-500 block">Overall score</span>
            </div>
          </div>

          {/* Verdict Breakdown Progress Bars */}
          <div className="space-y-2.5 pt-2">
            <div className="font-mono text-xs font-black uppercase text-neutral-700 pb-1">
              VERDICT BREAKDOWN
            </div>

            {[
              { icon: Sparkles, name: 'PEAK', count: '0d (0%)', width: 'w-0', color: '#FDC800' },
              { icon: Zap, name: 'GOOD', count: '4d (10%)', width: 'w-[10%]', color: '#00E599' },
              { icon: MinusCircle, name: 'OKAY', count: '9d (23%)', width: 'w-[23%]', color: '#C5D0E6' },
              { icon: CloudRain, name: 'DOWN', count: '23d (57%)', width: 'w-[57%]', color: '#FF9966' },
              { icon: AlertCircle, name: 'ROUGH', count: '4d (10%)', width: 'w-[10%]', color: '#FF4D4D' }
            ].map((row, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-mono font-bold">
                  <div className="flex items-center gap-1.5">
                    <row.icon className="w-3.5 h-3.5 text-black stroke-[2.5]" />
                    <span className="font-black text-[11px]">{row.name}</span>
                  </div>
                  <span className="text-[10px] text-neutral-600">{row.count}</span>
                </div>
                <div className="h-3 w-full bg-neutral-100 border-2 border-black rounded-full overflow-hidden">
                  <div className={`h-full ${row.width}`} style={{ backgroundColor: row.color }} />
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Emerald Action Button */}
          <div className="pt-2 space-y-2">
            <div className="w-full py-3.5 px-4 rounded-2xl bg-[#00E599] border-2 border-black font-display font-black text-sm uppercase flex items-center justify-center gap-2 shadow-[2px_2px_0px_#000000]">
              <Zap className="w-4 h-4 fill-black text-black" />
              <span>OPEN FORENSIC TELEMETRY HUB</span>
            </div>
            <div className="text-center font-mono text-[11px] text-neutral-600">
              Database updates into <span className="bg-[#FDC800] border border-black px-1.5 py-0.5 rounded font-bold text-black">data/entries.json</span>
            </div>
          </div>

        </div>

      </main>

      {/* 3. Bottom Ground Truth Micro Footer */}
      <footer className="py-6 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-black/30 rounded-xl shadow-xs">
          <span className="px-1.5 py-0.5 rounded bg-black text-[#FDC800] font-mono text-[9px] font-black uppercase">
            DAILY QUALITY
          </span>
          <span className="font-mono text-[11px] text-neutral-700">
            All data persisted locally into <span className="bg-[#FDC800] border border-black px-1 py-0.2 rounded font-bold text-black">data/entries.json</span>
          </span>
        </div>
      </footer>

    </div>
  );
}

/**
 * @param isMobile  render the compact mobile layout
 * @param delayMs   wait this long before showing the skeleton, so fast loads never flash it
 */
export default function SkeletonLoader({ isMobile = false, delayMs = 0 }) {
  const [visible, setVisible] = useState(delayMs <= 0);

  useEffect(() => {
    if (delayMs <= 0) return undefined;
    const t = setTimeout(() => setVisible(true), delayMs);
    return () => clearTimeout(t);
  }, [delayMs]);

  return (
    <div role="status" aria-live="polite" aria-busy="true">
      <style>{SHIMMER_CSS}</style>
      <span className="sr-only">Loading your daily verdict…</span>
      {visible ? (
        isMobile ? <MobileSkeleton /> : <DesktopSkeleton />
      ) : (
        <div className="min-h-screen bg-[#FFFDF5]" aria-hidden="true" />
      )}
    </div>
  );
}
