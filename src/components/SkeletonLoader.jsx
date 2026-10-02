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
  Check,
  CheckCircle2,
  Wand2,
  Database,
  Target,
  Shield,
  ShieldCheck,
  Layers,
  Compass,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Sliders,
  HelpCircle,
  Lock,
  Bell,
  ListTodo,
  TrendingUp,
  Activity,
  Wind,
  MessageSquareQuote
} from 'lucide-react';
import ShieldVoltIcon from './ShieldVoltIcon';

/* ------------------------------------------------------------------
   🏛️ GROUND-TRUTH NEOBRUTALIST SKELETON ARCHITECTURE:
   1. Visual Predictability & Cognitive Continuity (Laws of UX):
      The skeleton matches the target view (Today, Dossier, Timeline, Stats, Settings)
      and active modes (Standard, Multi-Sphere, Sanctuary, Habits) 1:1 on both Desktop & Mobile.
   2. Absolute Viewport Containment:
      Bottom navigation bars use sticky inside their relative wrapper so they NEVER
      break out of smartphone frames into desktop viewports.
   3. Screen readers receive polite status announcements (aria-live="polite").
   4. Motion is disabled for people with prefers-reduced-motion.
   5. Fast loads never flash a skeleton (delayMs).
   6. Zero raw emojis: pure Lucide React icons + Neobrutalist design tokens.
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

// Synchronously detect user's active mobile tab
export function getSavedActiveTab(isMobile) {
  if (typeof window === 'undefined') return isMobile ? 'log' : 'today';
  if (isMobile) {
    return localStorage.getItem('daily_verdict_mobile_active_tab') || 'log';
  }
  return localStorage.getItem('daily_verdict_desktop_active_tab') || 'today';
}

// Synchronously detect user's active behavioral modes
export function getSavedActiveModes() {
  if (typeof window === 'undefined') {
    return { isSphere: false, isRehab: false, isNonNegotiables: false };
  }
  let isSphere = false;
  let isRehab = false;
  let isNonNegotiables = false;
  try {
    isSphere = localStorage.getItem('daily_verdict_sphere_mode') === 'true';
    const rehab = localStorage.getItem('daily_verdict_rehabilitation');
    if (rehab) {
      const parsed = JSON.parse(rehab);
      isRehab = Boolean(parsed && parsed.active);
    }
    const nnMode = localStorage.getItem('daily_verdict_non_negotiables_mode');
    isNonNegotiables = Boolean(nnMode && nnMode !== 'off');
  } catch (_) { }
  return { isSphere, isRehab, isNonNegotiables };
}

// -------------------------------------------------------------
// MOBILE HEADER SKELETON
// -------------------------------------------------------------
function MobileHeaderSkeleton() {
  return (
    <header className="sticky top-0 z-40 bg-[#FFFDF5]/95 backdrop-blur-md border-b-2 border-black px-2.5 py-2 sm:px-4 sm:py-3 flex items-center justify-between shadow-[0_2px_0px_#000000] gap-1.5 shrink-0">
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
        <div className="flex items-center gap-1 px-2 py-1 rounded-xl bg-[#00E599] border-2 border-black font-mono text-[10px] sm:text-xs font-black shadow-[1.5px_1.5px_0px_#000000] shrink-0">
          <Flame className="w-3.5 h-3.5 fill-black text-black shrink-0" />
          <Bone className="h-2.5 w-10 rounded bg-black/20" />
        </div>

        <div className="px-2 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-white border-2 border-black shadow-[1.5px_1.5px_0px_#000000] flex items-center gap-1 shrink-0">
          <Cloud className="w-3.5 h-3.5 text-neutral-400" />
          <Bone className="h-2 w-6 rounded" />
        </div>

        <div className="p-1.5 sm:p-2 rounded-xl bg-white border-2 border-black shadow-[1.5px_1.5px_0px_#000000] shrink-0">
          <Settings className="w-4 h-4 text-neutral-400" />
        </div>
      </div>
    </header>
  );
}

// -------------------------------------------------------------
// MOBILE BOTTOM NAVIGATION SKELETON (Strictly Contained in Phone Frame)
// -------------------------------------------------------------
function MobileBottomNavSkeleton({ activeTab = 'log' }) {
  const normalized = activeTab === 'today' ? 'log' : activeTab === 'history' ? 'timeline' : activeTab;
  const tabs = [
    { id: 'log', label: 'Log', Icon: Zap },
    { id: 'timeline', label: 'Calendar', Icon: Calendar },
    { id: 'dossier', label: 'Dossier', Icon: Sparkles },
    { id: 'stats', label: 'Stats', Icon: BarChart2 }
  ];

  return (
    <nav
      aria-hidden="true"
      className="sticky bottom-0 left-0 right-0 w-full bg-white border-t-3 border-black py-2.5 px-4 flex items-center justify-around z-30 shadow-[0_-4px_0px_#000000] shrink-0"
      style={{ paddingBottom: 'max(0.625rem, env(safe-area-inset-bottom))' }}
    >
      {tabs.map((t) => {
        const isSelected = normalized === t.id;
        return (
          <div
            key={t.id}
            className={`flex flex-col items-center justify-center px-4 py-1.5 rounded-xl transition-all ${
              isSelected
                ? t.id === 'dossier'
                  ? 'bg-[#00E599] text-black border-2 border-black shadow-[2px_2px_0px_#000000]'
                  : 'bg-[#FDC800] text-black border-2 border-black shadow-[2px_2px_0px_#000000]'
                : 'text-neutral-500'
            }`}
          >
            <t.Icon className="w-5 h-5 stroke-[2.5]" />
            <span className="font-mono font-black text-[11px] uppercase mt-0.5">
              {t.label}
            </span>
          </div>
        );
      })}
    </nav>
  );
}

// -------------------------------------------------------------
// TAB 1 SKELETON: TODAY / LOG (Optimized to active mode)
// -------------------------------------------------------------
function MobileTodaySkeleton({ modes = {} }) {
  // 1. Sanctuary or Sabbatical Stasis Mode
  if (modes.isRehab) {
    return (
      <main className="flex-1 px-4 py-3.5 space-y-4 max-w-lg mx-auto w-full">
        <div className="p-4 rounded-2xl border-2 border-black bg-emerald-50 shadow-[3px_3px_0px_#000000] space-y-2">
          <div className="flex items-center justify-between">
            <span className="px-2 py-0.5 rounded bg-emerald-400 border border-black font-mono text-[10px] font-black uppercase text-black">
              SANCTUARY STASIS
            </span>
            <div className="flex items-center gap-1 font-mono text-[10px] font-black text-emerald-800">
              <Shield className="w-3.5 h-3.5" />
              <span>STREAK FROZEN</span>
            </div>
          </div>
          <h3 className="font-display font-black text-xl uppercase tracking-tight text-black">
            Nervous System Recovery
          </h3>
          <Bone className="h-3 w-5/6 rounded" />
        </div>

        <div className="p-6 rounded-2xl border-2 border-black bg-white shadow-[3px_3px_0px_#000000] flex flex-col items-center justify-center space-y-3 text-center">
          <div className="w-32 h-32 rounded-full border-3 border-black bg-emerald-100 flex items-center justify-center shadow-[3px_3px_0px_#000000]">
            <Compass className="w-10 h-10 text-emerald-800 animate-pulse" />
          </div>
          <Bone strong className="h-4 w-32 rounded-lg" />
          <Bone className="h-2.5 w-48 rounded" />
        </div>

        <div className="p-3.5 rounded-2xl border-2 border-black bg-white shadow-[3px_3px_0px_#000000] space-y-3">
          <Bone strong className="h-3 w-32 rounded" />
          <div className="h-24 bg-neutral-50 border-2 border-dashed border-black/20 rounded-xl p-2.5 space-y-2">
            <Bone className="h-2.5 w-3/4 rounded" />
            <Bone className="h-2.5 w-1/2 rounded" />
          </div>
          <Bone strong className="h-11 w-full rounded-xl bg-[#00E599] border-2 border-black shadow-[2px_2px_0px_#000000]" />
        </div>
      </main>
    );
  }

  // 2. Multi-Sphere Life Domains Mode
  if (modes.isSphere) {
    return (
      <main className="flex-1 px-4 py-3.5 space-y-3.5 max-w-lg mx-auto w-full">
        <div className="flex items-center justify-between bg-white border-2 border-black p-3.5 rounded-2xl shadow-[3px_3px_0px_#000000]">
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded bg-[#FDC800] border border-black font-mono text-[10px] font-black uppercase text-black">
                MULTI-SPHERE
              </span>
              <Bone className="h-4 w-16 rounded-full bg-neutral-200 border border-black" />
            </div>
            <Bone className="h-2.5 w-36 rounded" />
          </div>
          <div className="w-9 h-9 rounded-xl bg-[#FDC800] border-2 border-black flex items-center justify-center shadow-[1.5px_1.5px_0px_#000000] shrink-0">
            <Target className="w-5 h-5 text-black" />
          </div>
        </div>

        {[
          { title: 'Career & Craft', color: '#00E599' },
          { title: 'Body & Vitality', color: '#FF9500' },
          { title: 'Mind & Sanctuary', color: '#00D4FF' }
        ].map((sphere, idx) => (
          <div
            key={idx}
            className="p-3.5 rounded-2xl border-2 border-black bg-white shadow-[3px_3px_0px_#000000] space-y-2.5"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-7 h-7 rounded-lg border-2 border-black flex items-center justify-center shadow-[1px_1px_0px_#000]"
                  style={{ backgroundColor: sphere.color }}
                >
                  <Sparkles className="w-3.5 h-3.5 text-black stroke-[2.5]" />
                </div>
                <span className="font-display font-black text-xs uppercase text-black">
                  {sphere.title}
                </span>
              </div>
              <Bone className="h-4 w-12 rounded bg-neutral-100 border border-black/20" />
            </div>

            <div className="grid grid-cols-5 gap-1.5 pt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <div
                  key={star}
                  className="py-1.5 rounded-xl border border-black bg-neutral-50 flex items-center justify-center text-xs font-mono font-bold text-neutral-400"
                >
                  {star}★
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="p-3.5 rounded-2xl border-2 border-black bg-white shadow-[3px_3px_0px_#000000] space-y-3">
          <Bone strong className="h-3 w-28 rounded" />
          <div className="h-20 bg-neutral-50 border-2 border-dashed border-black/20 rounded-xl p-2.5 space-y-2">
            <Bone className="h-2.5 w-3/4 rounded" />
            <Bone className="h-2.5 w-1/2 rounded" />
          </div>
          <Bone strong className="h-11 w-full rounded-xl bg-[#FDC800] border-2 border-black shadow-[2px_2px_0px_#000000]" />
        </div>
      </main>
    );
  }

  // 3. Non-Negotiable Daily Habits Mode
  if (modes.isNonNegotiables) {
    return (
      <main className="flex-1 px-4 py-3.5 space-y-3.5 max-w-lg mx-auto w-full">
        <div className="flex items-center justify-between bg-white border-2 border-black p-3.5 rounded-2xl shadow-[3px_3px_0px_#000000]">
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded bg-[#FF9500] border border-black font-mono text-[10px] font-black uppercase text-black">
                NON-NEGOTIABLES
              </span>
              <Bone className="h-4 w-14 rounded-full bg-neutral-200 border border-black" />
            </div>
            <Bone className="h-2.5 w-40 rounded" />
          </div>
          <div className="w-9 h-9 rounded-xl bg-[#FF9500] border-2 border-black flex items-center justify-center shadow-[1.5px_1.5px_0px_#000000] shrink-0">
            <ListTodo className="w-5 h-5 text-black" />
          </div>
        </div>

        {[1, 2, 3].map((idx) => (
          <div
            key={idx}
            className="p-3 rounded-2xl border-2 border-black bg-white flex items-center justify-between shadow-[2px_2px_0px_#000000]"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-lg border-2 border-black bg-neutral-100 flex items-center justify-center">
                <Check className="w-3.5 h-3.5 text-neutral-300 stroke-3" />
              </div>
              <Bone strong className="h-3 w-32 rounded" />
            </div>
            <Bone className="h-4 w-10 rounded bg-neutral-100 border border-black/20" />
          </div>
        ))}

        <div className="p-3.5 rounded-2xl border-2 border-black bg-white shadow-[3px_3px_0px_#000000] space-y-3">
          <Bone strong className="h-3 w-28 rounded" />
          <div className="h-20 bg-neutral-50 border-2 border-dashed border-black/20 rounded-xl p-2.5 space-y-2">
            <Bone className="h-2.5 w-3/4 rounded" />
          </div>
          <Bone strong className="h-11 w-full rounded-xl bg-[#FDC800] border-2 border-black shadow-[2px_2px_0px_#000000]" />
        </div>
      </main>
    );
  }

  // 4. Default: Standard Single-Verdict (5 Stacked Cards)
  return (
    <main className="flex-1 px-4 py-3.5 space-y-3.5 max-w-lg mx-auto w-full">
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
  );
}

// -------------------------------------------------------------
// TAB 2 SKELETON: TIMELINE & CALENDAR MATRIX
// -------------------------------------------------------------
function MobileTimelineSkeleton() {
  return (
    <main className="flex-1 px-4 py-3.5 space-y-4 max-w-lg mx-auto w-full">
      <div className="flex items-center justify-center p-1 bg-neutral-200 border-2 border-black rounded-2xl shadow-[2px_2px_0px_#000000] gap-1">
        <div className="flex-1 py-1.5 rounded-xl bg-[#FDC800] border-2 border-black font-mono text-xs font-black text-center text-black shadow-[1px_1px_0px_#000]">
          CALENDAR MATRIX
        </div>
        <div className="flex-1 py-1.5 rounded-xl bg-transparent font-mono text-xs font-bold text-center text-neutral-600">
          TIMELINE STREAM
        </div>
      </div>

      <div className="p-4 rounded-2xl border-2 border-black bg-white shadow-[3px_3px_0px_#000000] space-y-3">
        <div className="flex items-center justify-between pb-1 border-b border-black/10">
          <Bone strong className="h-5 w-28 rounded-lg" />
          <div className="flex items-center gap-1">
            <div className="w-7 h-7 rounded-lg border border-black bg-neutral-100 flex items-center justify-center">
              <ChevronLeft className="w-3.5 h-3.5" />
            </div>
            <div className="w-7 h-7 rounded-lg border border-black bg-neutral-100 flex items-center justify-center">
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {['All', 'Peak 5★', 'Rough 1★', 'With Notes'].map((label, idx) => (
            <div
              key={idx}
              className={`px-2.5 py-1 rounded-lg border border-black font-mono text-[10px] font-black shrink-0 ${
                idx === 0 ? 'bg-[#FDC800] text-black shadow-[1px_1px_0px_#000]' : 'bg-neutral-100 text-neutral-500'
              }`}
            >
              {label}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1 text-center font-mono font-black text-xs text-neutral-600">
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
            <span key={i} className="py-0.5">{d}</span>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 35 }).map((_, i) => (
            <div
              key={i}
              className="aspect-square rounded-xl border-2 border-black bg-neutral-50 flex items-center justify-center shadow-[1.5px_1.5px_0px_#000000]"
            >
              <Bone className="h-2.5 w-3.5 rounded" />
            </div>
          ))}
        </div>

        <div className="text-center pt-1 border-t border-black/10">
          <Bone className="h-2.5 w-48 rounded mx-auto" />
        </div>
      </div>
    </main>
  );
}

// -------------------------------------------------------------
// TAB 3 SKELETON: COMPLETE RICH MONTHLY DOSSIER
// -------------------------------------------------------------
function MobileDossierSkeleton() {
  return (
    <main className="flex-1 px-4 py-3.5 space-y-4 max-w-lg mx-auto w-full">
      <div className="p-4 rounded-2xl border-2 border-black bg-[#FFFDF5] shadow-[3px_3px_0px_#000000] space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded bg-[#FDC800] border border-black inline-block">
              MONTHLY INTELLIGENCE
            </span>
            <h2 className="font-display font-black text-xl uppercase tracking-tight text-black mt-1">
              Performance Dossier
            </h2>
          </div>

          <div className="flex items-center bg-white border-2 border-black rounded-xl px-1.5 py-0.5 shadow-[1.5px_1.5px_0px_#000000]">
            <ChevronLeft className="w-3.5 h-3.5 stroke-3 text-neutral-400 p-0.5" />
            <Bone className="h-3 w-16 rounded mx-1.5" />
            <ChevronRight className="w-3.5 h-3.5 stroke-3 text-neutral-400 p-0.5" />
          </div>
        </div>

        <div className="pt-1.5 border-t border-black/10">
          <div className="w-full py-2.5 bg-[#00E599] text-black font-mono font-black text-xs uppercase rounded-xl border-2 border-black shadow-[2px_2px_0px_#000000] flex items-center justify-center gap-1.5">
            <Wand2 className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Re-Evaluate Dossier</span>
          </div>
        </div>
      </div>

      <div className="p-4 rounded-2xl border-2 border-black bg-[#FDC800] text-black space-y-2.5 shadow-[3px_3px_0px_#000000]">
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-mono font-black px-2 py-0.5 rounded-md uppercase bg-black text-white">
            MONTHLY PERSONA
          </span>
          <span className="text-[10px] font-mono font-bold flex items-center gap-1 text-black/80">
            <Database className="w-3 h-3" />
            <span>Saved in Local DB</span>
          </span>
        </div>

        <Bone strong className="h-6 w-52 rounded-lg bg-black/20" />
        <div className="space-y-1.5 pt-0.5">
          <Bone className="h-2.5 w-full rounded bg-black/15" />
          <Bone className="h-2.5 w-4/5 rounded bg-black/15" />
        </div>

        <div className="grid grid-cols-3 gap-2 pt-1">
          {['HIT RATE', 'STREAK', 'FRICTION'].map((label, idx) => (
            <div key={idx} className="p-2 rounded-xl border-2 border-black bg-white text-center shadow-[1px_1px_0px_#000]">
              <span className="block text-[9px] font-mono font-bold text-neutral-400">{label}</span>
              <Bone strong className="h-4 w-10 rounded mx-auto my-1" />
              <Bone className="h-2 w-12 rounded mx-auto" />
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 rounded-2xl border-2 border-black bg-white shadow-[3px_3px_0px_#000000] space-y-2.5">
        <div className="flex items-center gap-1.5 text-xs font-mono font-black uppercase text-black">
          <ShieldCheck className="w-4 h-4 text-black stroke-[2.5]" />
          <span>Strategic Behavioral Breakdown</span>
        </div>
        <div className="space-y-2 pt-1">
          <Bone className="h-3 w-full rounded" />
          <Bone className="h-3 w-5/6 rounded" />
          <Bone className="h-3 w-3/4 rounded" />
        </div>
      </div>
    </main>
  );
}

// -------------------------------------------------------------
// TAB 4 SKELETON: STATS & METRICS
// -------------------------------------------------------------
function MobileStatsSkeleton() {
  return (
    <main className="flex-1 px-4 py-3.5 space-y-4 max-w-lg mx-auto w-full">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-black text-xl uppercase tracking-tight text-black">
            Performance Metrics
          </h2>
          <Bone className="h-2.5 w-44 rounded mt-1" />
        </div>
        <div className="px-3 py-1 bg-[#00E599] border-2 border-black rounded-xl font-mono text-[10px] font-black uppercase shadow-[1.5px_1.5px_0px_#000]">
          TELEMETRY
        </div>
      </div>

      {/* 2 Big Top Metric Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 rounded-2xl border-2 border-black bg-white shadow-[2px_2px_0px_#000] space-y-1">
          <span className="font-mono text-[10px] font-black uppercase text-neutral-500">HIT RATE %</span>
          <Bone strong className="h-7 w-20 rounded" />
          <Bone className="h-2 w-24 rounded" />
        </div>
        <div className="p-4 rounded-2xl border-2 border-black bg-white shadow-[2px_2px_0px_#000] space-y-1">
          <span className="font-mono text-[10px] font-black uppercase text-neutral-500">MAX STREAK</span>
          <Bone strong className="h-7 w-20 rounded" />
          <Bone className="h-2 w-24 rounded" />
        </div>
      </div>

      {/* Verdict Breakdown Card */}
      <div className="p-4 rounded-2xl border-2 border-black bg-white shadow-[3px_3px_0px_#000] space-y-3">
        <div className="flex items-center justify-between pb-1 border-b border-black/10">
          <span className="font-mono text-xs font-black uppercase text-black">VERDICT DISTRIBUTION</span>
          <Bone className="h-3 w-16 rounded" />
        </div>
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="space-y-1">
              <div className="flex justify-between text-xs font-mono font-bold">
                <Bone className="h-2.5 w-20 rounded" />
                <Bone className="h-2.5 w-12 rounded" />
              </div>
              <div className="h-2.5 w-full bg-neutral-100 rounded-full border border-black/20 overflow-hidden">
                <div className="h-full bg-[#FDC800]" style={{ width: `${i * 18}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

// -------------------------------------------------------------
// TAB 5 SKELETON: SETTINGS MENU
// -------------------------------------------------------------
function MobileSettingsSkeleton() {
  return (
    <main className="flex-1 px-4 py-3.5 space-y-3.5 max-w-lg mx-auto w-full">
      <div className="p-3.5 rounded-2xl border-2 border-black bg-white shadow-[3px_3px_0px_#000000] space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cloud className="w-5 h-5 text-black" />
            <h3 className="font-display font-black text-sm uppercase text-black">
              Cloud Sync &amp; Identity
            </h3>
          </div>
          <span className="px-2 py-0.5 bg-[#00E599] border border-black rounded font-mono text-[9px] font-black uppercase">
            ACTIVE
          </span>
        </div>
        <div className="p-2.5 bg-neutral-50 border border-black/20 rounded-xl space-y-1">
          <Bone strong className="h-3 w-28 rounded" />
          <Bone className="h-2.5 w-40 rounded" />
        </div>
      </div>

      <div className="p-3.5 rounded-2xl border-2 border-black bg-white shadow-[3px_3px_0px_#000000] space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-black" />
            <h3 className="font-display font-black text-sm uppercase text-black">
              Daily Check-in Cadence
            </h3>
          </div>
          <Bone className="h-4 w-16 rounded bg-[#FDC800] border border-black" />
        </div>
        <Bone className="h-2.5 w-4/5 rounded" />
      </div>

      <div className="p-3.5 rounded-2xl border-2 border-black bg-white shadow-[3px_3px_0px_#000000] space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-black" />
            <h3 className="font-display font-black text-sm uppercase text-black">
              AES PIN Vault Security
            </h3>
          </div>
          <Bone className="h-4 w-12 rounded bg-neutral-200 border border-black/20" />
        </div>
        <Bone className="h-2.5 w-3/4 rounded" />
      </div>

      <div className="p-3.5 rounded-2xl border-2 border-black bg-white shadow-[3px_3px_0px_#000000] space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-black" />
            <h3 className="font-display font-black text-sm uppercase text-black">
              Behavioral Modes
            </h3>
          </div>
          <Bone className="h-4 w-14 rounded bg-neutral-200 border border-black/20" />
        </div>
        <Bone className="h-2.5 w-5/6 rounded" />
      </div>
    </main>
  );
}

// -------------------------------------------------------------
// MOBILE SKELETON ROUTER (Strictly contained inside smartphone frame)
// -------------------------------------------------------------
function MobileSkeleton({ tab = null, modes = {} }) {
  const activeTab = tab || getSavedActiveTab(true);
  const normalized = activeTab === 'today' ? 'log' : activeTab === 'history' ? 'timeline' : activeTab;

  return (
    <div className="flex flex-col min-h-screen max-w-full bg-[#FFFDF5] text-black font-sans pb-0 select-none relative overflow-x-hidden">
      <MobileHeaderSkeleton />

      {/* Render matching view based on active tab to maintain zero cognitive shift */}
      {normalized === 'dossier' && <MobileDossierSkeleton />}
      {normalized === 'timeline' && <MobileTimelineSkeleton />}
      {normalized === 'stats' && <MobileStatsSkeleton />}
      {normalized === 'settings' && <MobileSettingsSkeleton />}
      {normalized !== 'dossier' && normalized !== 'timeline' && normalized !== 'stats' && normalized !== 'settings' && (
        <MobileTodaySkeleton modes={modes} />
      )}

      <MobileBottomNavSkeleton activeTab={normalized} />
    </div>
  );
}

// -------------------------------------------------------------
// DESKTOP SKELETON VARIANTS: Comprehensive varieties for Desktop
// -------------------------------------------------------------

function DesktopTodaySkeleton({ modes = {} }) {
  // 1. Sanctuary or Sabbatical Desktop Stasis Arena
  if (modes.isRehab) {
    return (
      <div className="space-y-6">
        <div className="bg-white border-3 border-black rounded-4xl p-6 sm:p-8 shadow-[4px_4px_0px_#000000] space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-4 border-b border-black/10">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl border-3 border-black bg-emerald-100 flex items-center justify-center shadow-[2px_2px_0px_#000000] shrink-0">
                <Compass className="w-8 h-8 text-emerald-800 animate-pulse" />
              </div>
              <div className="space-y-1">
                <div className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-600 text-white font-mono text-[10px] font-black tracking-wider uppercase">
                  SANCTUARY STASIS • STREAK SHIELDED
                </div>
                <h2 className="font-display font-black text-3xl sm:text-4xl uppercase tracking-tight text-black leading-none">
                  Nervous System Recovery
                </h2>
                <div className="font-mono text-xs text-neutral-600">
                  Daily ratings paused. Vagus nerve breathing and somatic grounding active.
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-28 h-28 rounded-full border-3 border-black bg-emerald-50 flex items-center justify-center shadow-[2px_2px_0px_#000]">
                <Bone strong className="h-4 w-16 rounded" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3 pt-2">
            {['Hydration', 'Barefoot Walk', 'Deep Rest', 'Unplugged'].map((item, idx) => (
              <div key={idx} className="p-3 rounded-2xl border-2 border-black bg-neutral-50 text-center space-y-1 shadow-[1.5px_1.5px_0px_#000]">
                <Bone className="h-3 w-16 rounded mx-auto" />
                <span className="text-[10px] font-mono font-bold text-neutral-500">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Reflection text card */}
        <div className="bg-white border-3 border-black rounded-4xl p-6 shadow-[4px_4px_0px_#000000] space-y-3">
          <Bone strong className="h-4 w-40 rounded" />
          <div className="h-24 bg-neutral-50 border-2 border-dashed border-black/20 rounded-2xl p-3 space-y-2">
            <Bone className="h-3 w-3/4 rounded" />
            <Bone className="h-3 w-1/2 rounded" />
          </div>
        </div>
      </div>
    );
  }

  // 2. Multi-Sphere 3-Domain Desktop Arena
  if (modes.isSphere) {
    return (
      <div className="space-y-6">
        <div className="bg-white border-3 border-black rounded-4xl p-6 sm:p-8 shadow-[4px_4px_0px_#000000] space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-black/10">
            <div>
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#FDC800] border-2 border-black font-mono text-[10px] font-black uppercase shadow-[1px_1px_0px_#000]">
                MULTI-SPHERE LIFE DOMAINS
              </span>
              <h2 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight text-black mt-1">
                Composite Daily Velocity
              </h2>
            </div>
            <div className="px-4 py-2 bg-neutral-100 border-2 border-black rounded-2xl flex items-center gap-2 shadow-[2px_2px_0px_#000]">
              <Bone strong className="h-6 w-14 rounded" />
            </div>
          </div>

          {/* 3 Domain Columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { title: 'Career & Craft', color: '#00E599' },
              { title: 'Body & Vitality', color: '#FF9500' },
              { title: 'Mind & Sanctuary', color: '#00D4FF' }
            ].map((d, idx) => (
              <div key={idx} className="p-4 rounded-2xl border-2 border-black bg-white shadow-[2px_2px_0px_#000] space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl border-2 border-black flex items-center justify-center shadow-[1px_1px_0px_#000]" style={{ backgroundColor: d.color }}>
                    <Sparkles className="w-4 h-4 text-black stroke-[2.5]" />
                  </div>
                  <span className="font-display font-black text-sm uppercase text-black">{d.title}</span>
                </div>
                <div className="grid grid-cols-5 gap-1 pt-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <div key={s} className="py-2 rounded-xl border border-black bg-neutral-50 flex items-center justify-center font-mono text-xs font-bold text-neutral-400">
                      {s}★
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Lifetime Metrics Card */}
        <DesktopLifetimeMetricsSkeleton />
      </div>
    );
  }

  // 3. Non-Negotiable Habits Desktop Arena
  if (modes.isNonNegotiables) {
    return (
      <div className="space-y-6">
        <div className="bg-white border-3 border-black rounded-4xl p-6 sm:p-8 shadow-[4px_4px_0px_#000000] space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-black/10">
            <div>
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#FF9500] border-2 border-black font-mono text-[10px] font-black uppercase shadow-[1px_1px_0px_#000]">
                HABIT ANCHORS &bull; 100% DETERMINISTIC
              </span>
              <h2 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight text-black mt-1">
                Daily Non-Negotiable Execution
              </h2>
            </div>
            <Bone strong className="h-8 w-24 rounded-xl" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 rounded-2xl border-2 border-black bg-white flex items-center justify-between shadow-[2px_2px_0px_#000]">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-xl border-2 border-black bg-neutral-100 flex items-center justify-center">
                    <Check className="w-4 h-4 text-neutral-300 stroke-3" />
                  </div>
                  <Bone strong className="h-4 w-32 rounded" />
                </div>
                <Bone className="h-4 w-12 rounded" />
              </div>
            ))}
          </div>
        </div>

        <DesktopLifetimeMetricsSkeleton />
      </div>
    );
  }

  // 4. Default Standard 5-Verdict Arena
  return (
    <div className="space-y-6">
      <div className="bg-white border-3 border-black rounded-4xl p-6 sm:p-8 shadow-[4px_4px_0px_#000000] space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-4 border-b border-black/10">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl border-3 border-black bg-neutral-100 flex items-center justify-center shadow-[2px_2px_0px_#000000] shrink-0">
              <MinusCircle className="w-8 h-8 text-neutral-400/40" />
            </div>
            <div className="space-y-1">
              <div className="inline-block px-2.5 py-0.5 rounded-full bg-black text-white font-mono text-[10px] font-black tracking-wider uppercase">
                TODAY &bull; DAY 41
              </div>
              <h2 className="font-display font-black text-3xl sm:text-4xl uppercase tracking-tight text-black leading-none">
                TUESDAY
              </h2>
              <div className="font-sans text-xs text-neutral-600 font-medium">
                September 29, 2026
              </div>
              <div className="font-mono text-[11px] text-neutral-500 pt-0.5">
                Hover &amp; punch an icon to log your verdict.
              </div>
            </div>
          </div>

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

      <DesktopLifetimeMetricsSkeleton />
    </div>
  );
}

function DesktopLifetimeMetricsSkeleton() {
  return (
    <div className="bg-white border-3 border-black rounded-4xl p-6 sm:p-8 shadow-[4px_4px_0px_#000000] space-y-6">
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
    </div>
  );
}

function DesktopTimelineSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Column 1 (lg:col-span-7): CalendarModal Embedded Month Matrix Wireframe */}
      <div className="lg:col-span-7 space-y-4 bg-white border-3 border-black rounded-4xl p-6 sm:p-7 shadow-[4px_4px_0px_#000000]">
        {/* Month Header & Quick Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-black/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#FDC800] border-2 border-black flex items-center justify-center shadow-[1.5px_1.5px_0px_#000]">
              <Calendar className="w-4 h-4 text-black" />
            </div>
            <div>
              <Bone strong className="h-6 w-36 rounded-lg" />
              <span className="text-[10px] font-mono font-bold text-neutral-500 block mt-0.5">
                Click any active day to view or edit reflection
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 bg-[#FDC800] border-2 border-black rounded-xl font-mono text-xs font-black uppercase shadow-[1.5px_1.5px_0px_#000] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>AI REPORT</span>
            </div>
            <div className="p-1.5 rounded-xl border-2 border-black bg-white shadow-[1.5px_1.5px_0px_#000]">
              <ChevronLeft className="w-4 h-4 text-black" />
            </div>
            <div className="p-1.5 rounded-xl border-2 border-black bg-white shadow-[1.5px_1.5px_0px_#000]">
              <ChevronRight className="w-4 h-4 text-black" />
            </div>
          </div>
        </div>

        {/* 7 Days of the Week Headers */}
        <div className="grid grid-cols-7 gap-2 text-center font-mono font-black text-xs text-neutral-500 uppercase">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
            <div key={day} className="py-1 bg-neutral-100 border border-black/10 rounded-lg">
              {day}
            </div>
          ))}
        </div>

        {/* 7x5 Days Grid Matrix Wireframe */}
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 35 }).map((_, i) => (
            <div
              key={i}
              className={`min-h-16 sm:min-h-20 p-2 rounded-xl border-2 border-black flex flex-col justify-between ${
                i === 14 ? 'bg-[#FFFDF5] ring-2 ring-black shadow-[2px_2px_0px_#000]' : 'bg-white shadow-[1px_1px_0px_#000]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-black text-neutral-400">
                  {i < 31 ? i + 1 : ''}
                </span>
                {i < 15 && (
                  <div
                    className="w-3.5 h-3.5 rounded-full border border-black"
                    style={{ backgroundColor: i % 4 === 0 ? '#00E599' : i % 3 === 0 ? '#FDC800' : '#FF4D4D' }}
                  />
                )}
              </div>
              {i < 15 && <Bone className="h-2 w-full rounded" />}
            </div>
          ))}
        </div>
      </div>

      {/* Column 2 (lg:col-span-5): JourneyTimeline Stream Wireframe */}
      <div className="lg:col-span-5 space-y-4">
        <div className="bg-white border-3 border-black rounded-4xl p-5 sm:p-6 shadow-[4px_4px_0px_#000000] space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-black/10">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-black" />
              <h3 className="font-display font-black text-lg uppercase tracking-tight text-black">
                JOURNEY TIMELINE
              </h3>
            </div>
            <Bone className="h-4 w-20 rounded" />
          </div>

          {/* List of Day Cards Wireframe */}
          <div className="space-y-2.5">
            {[1, 2, 3, 4, 5].map((idx) => (
              <div
                key={idx}
                className="p-3 rounded-2xl border-2 border-black bg-white flex items-center justify-between shadow-[2px_2px_0px_#000000] gap-3"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-xl bg-[#FDC800] border-2 border-black flex flex-col items-center justify-center shrink-0 shadow-[1px_1px_0px_#000]">
                    <span className="text-[8px] font-mono font-black">DAY</span>
                    <span className="font-display font-black text-xs leading-none">
                      {42 - idx}
                    </span>
                  </div>
                  <div className="space-y-1 min-w-0 flex-1">
                    <Bone strong className="h-3 w-28 rounded" />
                    <Bone className="h-2.5 w-3/4 rounded" />
                  </div>
                </div>

                <div className="w-16 h-7 rounded-xl border-2 border-black bg-neutral-100 flex items-center justify-center shrink-0 shadow-[1px_1px_0px_#000]">
                  <Bone className="h-3 w-8 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function DesktopDossierSkeleton() {
  return (
    <div className="space-y-6">
      {/* Month Header Card Wireframe */}
      <div className="bg-white border-3 border-black rounded-4xl p-6 shadow-[4px_4px_0px_#000000] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="px-2.5 py-0.5 bg-[#FDC800] border-2 border-black rounded font-mono text-[10px] font-black uppercase shadow-[1px_1px_0px_#000]">
            MONTHLY DOSSIER
          </span>
          <h2 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight text-black mt-1">
            Performance Intelligence
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-white border-2 border-black rounded-xl px-2 py-1 shadow-[1.5px_1.5px_0px_#000]">
            <ChevronLeft className="w-4 h-4 text-black cursor-pointer" />
            <Bone className="h-4 w-24 rounded mx-2" />
            <ChevronRight className="w-4 h-4 text-black cursor-pointer" />
          </div>
          <div className="px-4 py-2 bg-[#00E599] border-2 border-black rounded-xl font-mono text-xs font-black uppercase shadow-[2px_2px_0px_#000] flex items-center gap-1.5">
            <Wand2 className="w-4 h-4" />
            <span>Re-Evaluate</span>
          </div>
        </div>
      </div>

      {/* Persona Archetype Banner Wireframe */}
      <div className="bg-[#FDC800] border-3 border-black rounded-4xl p-6 sm:p-8 shadow-[4px_4px_0px_#000000] space-y-4">
        <span className="px-3 py-1 bg-black text-white rounded-lg font-mono text-xs font-black uppercase">
          MONTHLY PERSONA ARCHETYPE
        </span>
        <Bone strong className="h-8 w-64 rounded-xl bg-black/20" />
        <div className="space-y-2 max-w-2xl">
          <Bone className="h-3.5 w-full rounded bg-black/15" />
          <Bone className="h-3.5 w-4/5 rounded bg-black/15" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-2">
          {['HIT RATE %', 'LONGEST STREAK', 'FRICTION SCORE', 'HABIT COMPLETION'].map((label, idx) => (
            <div key={idx} className="p-4 rounded-2xl border-2 border-black bg-white shadow-[2px_2px_0px_#000] space-y-1">
              <span className="font-mono text-[10px] font-bold text-neutral-500">{label}</span>
              <Bone strong className="h-6 w-16 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* 2-Column Intelligence Grid Wireframe */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Homie Tough Love Letter */}
        <div className="lg:col-span-7 bg-[#FFFDF5] border-3 border-black rounded-4xl p-6 sm:p-7 shadow-[4px_4px_0px_#000000] space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-black/10">
            <MessageSquareQuote className="w-5 h-5 text-black" />
            <h3 className="font-display font-black text-lg uppercase tracking-tight text-black">
              STRAIGHT TALK FROM TRINNO
            </h3>
          </div>
          <div className="space-y-2.5">
            <Bone className="h-3.5 w-full rounded" />
            <Bone className="h-3.5 w-11/12 rounded" />
            <Bone className="h-3.5 w-4/5 rounded" />
            <Bone className="h-3.5 w-full rounded" />
            <Bone className="h-3.5 w-2/3 rounded" />
          </div>
        </div>

        {/* 4-Week Phase Velocity */}
        <div className="lg:col-span-5 bg-white border-3 border-black rounded-4xl p-6 shadow-[4px_4px_0px_#000000] space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-black/10">
            <Activity className="w-5 h-5 text-black" />
            <h3 className="font-display font-black text-lg uppercase tracking-tight text-black">
              WEEKLY VELOCITY
            </h3>
          </div>
          <div className="space-y-2">
            {[1, 2, 3, 4].map((wk) => (
              <div key={wk} className="p-3 bg-neutral-50 border-2 border-black rounded-2xl flex items-center justify-between shadow-[1.5px_1.5px_0px_#000]">
                <span className="font-mono text-xs font-black text-black">WEEK {wk}</span>
                <Bone className="h-4 w-20 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function DesktopStudioSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white border-3 border-black rounded-4xl p-6 shadow-[4px_4px_0px_#000000] space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-black/10">
          <Bell className="w-5 h-5 text-black" />
          <h3 className="font-display font-black text-xl uppercase text-black">
            Notification Studio
          </h3>
        </div>
        <div className="space-y-3">
          <Bone className="h-4 w-48 rounded" />
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 border-2 border-black rounded-xl bg-neutral-50 flex items-center justify-center">
                <Bone className="h-3 w-14 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white border-3 border-black rounded-4xl p-6 shadow-[4px_4px_0px_#000000] space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-black/10">
          <Lock className="w-5 h-5 text-black" />
          <h3 className="font-display font-black text-xl uppercase text-black">
            Vault &amp; Cloud Sovereignty
          </h3>
        </div>
        <Bone className="h-4 w-56 rounded" />
        <div className="p-4 bg-neutral-50 border border-black/20 rounded-2xl space-y-2">
          <Bone strong className="h-5 w-32 rounded" />
          <Bone className="h-3 w-3/4 rounded" />
        </div>
      </div>
    </div>
  );
}

function DesktopSettingsSkeleton() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Settings Modal Header Card */}
      <div className="bg-white border-3 border-black rounded-4xl p-6 sm:p-8 shadow-[4px_4px_0px_#000000] space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-black/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#FDC800] border-2 border-black shadow-[2px_2px_0px_#000000]">
              <Settings className="w-6 h-6 text-black" />
            </div>
            <div>
              <h2 className="font-display font-black text-2xl uppercase tracking-tight text-black">
                System Control &amp; Privacy Vault
              </h2>
              <p className="font-mono text-xs text-neutral-600">
                Local cryptographic sovereignty, Firestore cloud sync, and behavioral frameworks.
              </p>
            </div>
          </div>
          <div className="px-3 py-1 bg-black text-[#FDC800] font-mono text-xs font-black rounded-xl uppercase">
            STABLE v2.4
          </div>
        </div>

        {/* Grid of Settings Cards mirroring SettingsModal */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Card 1: Cloud Sync & Storage Sovereignty */}
          <div className="p-5 rounded-3xl border-2 border-black bg-[#FFFDF5] shadow-[2px_2px_0px_#000000] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cloud className="w-5 h-5 text-black" />
                <span className="font-display font-black text-sm uppercase text-black">Storage Sovereignty</span>
              </div>
              <span className="px-2 py-0.5 bg-[#00E599] border border-black rounded font-mono text-[9px] font-black uppercase">
                CONNECTED
              </span>
            </div>
            <div className="p-3 bg-white border border-black/20 rounded-2xl space-y-1.5">
              <Bone strong className="h-3 w-32 rounded" />
              <Bone className="h-2.5 w-44 rounded" />
            </div>
          </div>

          {/* Card 2: Lockscreen Reminders */}
          <div className="p-5 rounded-3xl border-2 border-black bg-[#FFFDF5] shadow-[2px_2px_0px_#000000] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-black" />
                <span className="font-display font-black text-sm uppercase text-black">Daily Check-in Cadence</span>
              </div>
              <span className="px-2 py-0.5 bg-[#FDC800] border border-black rounded font-mono text-[9px] font-black uppercase">
                ARMED
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Bone className="h-6 w-20 rounded-lg bg-neutral-200" />
              <Bone className="h-6 w-20 rounded-lg bg-neutral-200" />
            </div>
          </div>

          {/* Card 3: AES-256 PIN Vault */}
          <div className="p-5 rounded-3xl border-2 border-black bg-[#FFFDF5] shadow-[2px_2px_0px_#000000] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-black" />
                <span className="font-display font-black text-sm uppercase text-black">AES-256 PIN Vault</span>
              </div>
              <span className="px-2 py-0.5 bg-neutral-200 border border-black rounded font-mono text-[9px] font-black uppercase">
                PBKDF2
              </span>
            </div>
            <Bone className="h-2.5 w-4/5 rounded" />
            <Bone strong className="h-7 w-28 rounded-xl" />
          </div>

          {/* Card 4: Behavioral Frameworks */}
          <div className="p-5 rounded-3xl border-2 border-black bg-[#FFFDF5] shadow-[2px_2px_0px_#000000] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-black" />
                <span className="font-display font-black text-sm uppercase text-black">Behavioral Modes</span>
              </div>
              <span className="px-2 py-0.5 bg-[#00E599] border border-black rounded font-mono text-[9px] font-black uppercase">
                3 ACTIVE
              </span>
            </div>
            <div className="space-y-1.5">
              <Bone className="h-2.5 w-full rounded" />
              <Bone className="h-2.5 w-5/6 rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DesktopSkeleton({ tab = 'today', modes = {} }) {
  const activeTab = tab || getSavedActiveTab(false);
  const normalized = activeTab === 'log' ? 'today' : activeTab;

  return (
    <div className="min-h-screen bg-[#FFFDF5] text-black font-sans flex flex-col select-none">
      {/* 1. Sticky Header Bar with Synchronized Nav Pill */}
      <header className="border-b-3 border-black bg-white sticky top-0 z-30">
        <div className="w-full max-w-7xl 2xl:max-w-8xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
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

          <nav className="hidden md:flex items-center justify-center bg-[#F4F2E6] px-2 py-1.5 rounded-full border-2 border-black shadow-[2px_2px_0px_#000000] gap-2 shrink-0">
            {[
              { id: 'today', label: 'TODAY', Icon: Zap },
              { id: 'timeline', label: 'TIMELINE', Icon: Calendar },
              { id: 'dossier', label: 'DOSSIER', Icon: Sparkles },
              { id: 'studio', label: 'STUDIO', Icon: BarChart2 }
            ].map((t) => {
              const isSelected = normalized === t.id;
              return (
                <div
                  key={t.id}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-display font-black text-xs uppercase transition-all ${
                    isSelected
                      ? 'bg-[#FDC800] border-2 border-black shadow-[1px_1px_0px_#000000] text-black'
                      : 'text-neutral-700'
                  }`}
                >
                  <t.Icon className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>{t.label}</span>
                </div>
              );
            })}
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#00E599] border-2 border-black text-black font-mono text-xs font-black shadow-[1.5px_1.5px_0px_#000000] shrink-0">
              <Flame className="w-3.5 h-3.5 fill-black text-black" />
              <span>DAY 41</span>
            </div>
            <div className="p-2 rounded-xl bg-white border-2 border-black shadow-[1.5px_1.5px_0px_#000000]">
              <Settings className="w-4 h-4 text-black" />
            </div>
          </div>
        </div>
      </header>

      {/* 2. Main Workspace: Renders matching variety for desktop */}
      <main className="flex-1 w-full max-w-7xl 2xl:max-w-8xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {normalized === 'timeline' && <DesktopTimelineSkeleton />}
        {normalized === 'dossier' && <DesktopDossierSkeleton />}
        {normalized === 'studio' && <DesktopStudioSkeleton />}
        {normalized === 'settings' && <DesktopSettingsSkeleton />}
        {normalized !== 'timeline' && normalized !== 'dossier' && normalized !== 'studio' && normalized !== 'settings' && (
          <DesktopTodaySkeleton modes={modes} />
        )}
      </main>

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
 * @param tab       explicit active tab ('log', 'timeline', 'dossier', 'stats', 'settings')
 */
export default function SkeletonLoader({ isMobile = false, delayMs = 0, tab = null }) {
  const [visible, setVisible] = useState(delayMs <= 0);
  const [modes, setModes] = useState(() => getSavedActiveModes());

  useEffect(() => {
    if (delayMs <= 0) return undefined;
    const t = setTimeout(() => setVisible(true), delayMs);
    return () => clearTimeout(t);
  }, [delayMs]);

  useEffect(() => {
    setModes(getSavedActiveModes());
  }, []);

  return (
    <div role="status" aria-live="polite" aria-busy="true">
      <style>{SHIMMER_CSS}</style>
      <span className="sr-only">Loading your daily verdict…</span>
      {visible ? (
        isMobile ? (
          <MobileSkeleton tab={tab} modes={modes} />
        ) : (
          <DesktopSkeleton tab={tab} modes={modes} />
        )
      ) : (
        <div className="min-h-screen bg-[#FFFDF5]" aria-hidden="true" />
      )}
    </div>
  );
}
