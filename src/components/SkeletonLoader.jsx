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
  ListTodo
} from 'lucide-react';
import ShieldVoltIcon from './ShieldVoltIcon';

/* ------------------------------------------------------------------
   🏛️ GROUND-TRUTH NEOBRUTALIST SKELETON ARCHITECTURE:
   1. Visual Predictability & Cognitive Continuity (Laws of UX):
      The skeleton matches the target view (Today, Dossier, Timeline, Settings)
      and active modes (Multi-Sphere, Sanctuary, Habits) 1:1.
   2. Screen readers receive polite status announcements (aria-live="polite").
   3. Motion is disabled for people with prefers-reduced-motion.
   4. Fast loads never flash a skeleton (delayMs).
   5. Zero raw emojis: pure Lucide React icons + Neobrutalist design tokens.
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
// MOBILE BOTTOM NAVIGATION SKELETON (Reflects Active Tab Highlight)
// -------------------------------------------------------------
function MobileBottomNavSkeleton({ activeTab = 'log' }) {
  const normalized = activeTab === 'today' ? 'log' : activeTab;
  const tabs = [
    { id: 'log', label: 'TODAY', Icon: Calendar },
    { id: 'timeline', label: 'TIMELINE', Icon: Clock },
    { id: 'dossier', label: 'DOSSIER', Icon: Sparkles },
    { id: 'settings', label: 'SETTINGS', Icon: Settings }
  ];

  return (
    <nav
      aria-hidden="true"
      className="sticky sm:fixed bottom-0 inset-x-0 bg-white border-t-3 border-black px-4 pt-2 pb-3 flex justify-between z-30 shadow-[0_-2px_0px_#000000]"
      style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
    >
      {tabs.map((t) => {
        const isSelected = normalized === t.id;
        return (
          <div key={t.id} className="flex flex-col items-center gap-1 w-16">
            <div
              className={`p-1.5 rounded-xl border-2 border-black flex items-center justify-center transition-all ${
                isSelected
                  ? 'bg-[#FDC800] shadow-[1.5px_1.5px_0px_#000000]'
                  : 'bg-neutral-100'
              }`}
            >
              <t.Icon className="w-4 h-4 text-black stroke-[2.5]" />
            </div>
            <span
              className={`font-mono text-[9px] uppercase ${
                isSelected ? 'font-black text-black' : 'font-bold text-neutral-500'
              }`}
            >
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
        {/* Stasis Shield Banner */}
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

        {/* Vagus Nerve Breathing Orb Placeholder */}
        <div className="p-6 rounded-2xl border-2 border-black bg-white shadow-[3px_3px_0px_#000000] flex flex-col items-center justify-center space-y-3 text-center">
          <div className="w-32 h-32 rounded-full border-3 border-black bg-emerald-100 flex items-center justify-center shadow-[3px_3px_0px_#000000]">
            <Compass className="w-10 h-10 text-emerald-800 animate-pulse" />
          </div>
          <Bone strong className="h-4 w-32 rounded-lg" />
          <Bone className="h-2.5 w-48 rounded" />
        </div>

        {/* Reflection / Grounding Chronicle Textarea */}
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
        {/* Multi-Sphere Composite Header Banner */}
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

        {/* 3 Domain Cards */}
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

            {/* 1-5 Star Selection Buttons */}
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

        {/* Day Reflection Textarea */}
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

        {/* 3 Habit Anchor Checkbox Cards */}
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

        {/* Day Reflection Textarea */}
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

      {/* 5 Stacked Verdict Cards */}
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
  );
}

// -------------------------------------------------------------
// TAB 2 SKELETON: TIMELINE & CALENDAR MATRIX
// -------------------------------------------------------------
function MobileTimelineSkeleton() {
  return (
    <main className="flex-1 px-4 py-3.5 space-y-4 max-w-lg mx-auto w-full">
      {/* Subview Selector Pill */}
      <div className="flex items-center justify-center p-1 bg-neutral-200 border-2 border-black rounded-2xl shadow-[2px_2px_0px_#000000] gap-1">
        <div className="flex-1 py-1.5 rounded-xl bg-[#FDC800] border-2 border-black font-mono text-xs font-black text-center text-black shadow-[1px_1px_0px_#000]">
          CALENDAR MATRIX
        </div>
        <div className="flex-1 py-1.5 rounded-xl bg-transparent font-mono text-xs font-bold text-center text-neutral-600">
          TIMELINE STREAM
        </div>
      </div>

      {/* Calendar Card Frame */}
      <div className="p-4 rounded-2xl border-2 border-black bg-white shadow-[3px_3px_0px_#000000] space-y-3">
        {/* Month Title & Nav */}
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

        {/* Filter Badges */}
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

        {/* Weekday Row (M T W T F S S) */}
        <div className="grid grid-cols-7 gap-1 text-center font-mono font-black text-xs text-neutral-600">
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
            <span key={i} className="py-0.5">{d}</span>
          ))}
        </div>

        {/* 7x5 Date Squares Grid */}
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
      {/* Dossier Header Card */}
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

          {/* Month Switcher Skeleton */}
          <div className="flex items-center bg-white border-2 border-black rounded-xl px-1.5 py-0.5 shadow-[1.5px_1.5px_0px_#000000]">
            <ChevronLeft className="w-3.5 h-3.5 stroke-3 text-neutral-400 p-0.5" />
            <Bone className="h-3 w-16 rounded mx-1.5" />
            <ChevronRight className="w-3.5 h-3.5 stroke-3 text-neutral-400 p-0.5" />
          </div>
        </div>

        {/* Action Button: Re-Evaluate Dossier */}
        <div className="pt-1.5 border-t border-black/10">
          <div className="w-full py-2.5 bg-[#00E599] text-black font-mono font-black text-xs uppercase rounded-xl border-2 border-black shadow-[2px_2px_0px_#000000] flex items-center justify-center gap-1.5">
            <Wand2 className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Re-Evaluate Dossier</span>
          </div>
        </div>
      </div>

      {/* Monthly Persona Archetype Card */}
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

        {/* 3 Metric Pills */}
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

      {/* Tactical Intelligence / Homie Directives Card */}
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
// TAB 4 SKELETON: SETTINGS & PREFERENCES
// -------------------------------------------------------------
function MobileSettingsSkeleton() {
  return (
    <main className="flex-1 px-4 py-3.5 space-y-4 max-w-lg mx-auto w-full">
      {/* Account & Cloud Sync Card */}
      <div className="p-4 rounded-2xl border-2 border-black bg-white shadow-[3px_3px_0px_#000000] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cloud className="w-5 h-5 text-black" />
            <h3 className="font-display font-black text-base uppercase text-black">
              Cloud Sync &amp; Identity
            </h3>
          </div>
          <span className="px-2 py-0.5 bg-[#00E599] border border-black rounded font-mono text-[10px] font-black uppercase">
            ACTIVE
          </span>
        </div>
        <div className="p-3 bg-neutral-50 border border-black/20 rounded-xl space-y-1">
          <Bone strong className="h-3 w-32 rounded" />
          <Bone className="h-2.5 w-44 rounded" />
        </div>
      </div>

      {/* PIN Vault Security Card */}
      <div className="p-4 rounded-2xl border-2 border-black bg-white shadow-[3px_3px_0px_#000000] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-black" />
            <h3 className="font-display font-black text-base uppercase text-black">
              AES PIN Vault
            </h3>
          </div>
          <Bone className="h-4 w-12 rounded bg-neutral-200 border border-black/20" />
        </div>
        <Bone className="h-2.5 w-4/5 rounded" />
      </div>

      {/* Notification Studio Card */}
      <div className="p-4 rounded-2xl border-2 border-black bg-white shadow-[3px_3px_0px_#000000] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-black" />
            <h3 className="font-display font-black text-base uppercase text-black">
              Daily Check-in Cadence
            </h3>
          </div>
          <Bone className="h-4 w-16 rounded bg-[#FDC800] border border-black" />
        </div>
        <Bone className="h-2.5 w-3/4 rounded" />
      </div>
    </main>
  );
}

// -------------------------------------------------------------
// MOBILE SKELETON ROUTER (Selects matching tab layout)
// -------------------------------------------------------------
function MobileSkeleton({ tab = null, modes = {} }) {
  const activeTab = tab || getSavedActiveTab(true);
  const normalized = activeTab === 'today' ? 'log' : activeTab;

  return (
    <div className="flex flex-col min-h-screen bg-[#FFFDF5] text-black font-sans pb-28 select-none relative">
      <MobileHeaderSkeleton />

      {/* Render matching view based on active tab to maintain zero cognitive shift */}
      {normalized === 'dossier' && <MobileDossierSkeleton />}
      {normalized === 'timeline' && <MobileTimelineSkeleton />}
      {normalized === 'settings' && <MobileSettingsSkeleton />}
      {normalized !== 'dossier' && normalized !== 'timeline' && normalized !== 'settings' && (
        <MobileTodaySkeleton modes={modes} />
      )}

      <MobileBottomNavSkeleton activeTab={normalized} />
    </div>
  );
}

// -------------------------------------------------------------
// DESKTOP SKELETON: Matches Exact Live Ground-Truth Screenshot 1:1
// -------------------------------------------------------------
function DesktopSkeleton({ tab = 'today' }) {
  const activeTab = tab || getSavedActiveTab(false);

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

          {/* Center: Long Segmented Nav Bar with Active Highlight */}
          <nav className="hidden md:flex items-center justify-center bg-[#F4F2E6] px-2 py-1.5 rounded-full border-2 border-black shadow-[2px_2px_0px_#000000] gap-2 shrink-0">
            <div
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full font-display font-black text-xs uppercase ${
                activeTab === 'today'
                  ? 'bg-[#FDC800] border-2 border-black shadow-[1px_1px_0px_#000000] text-black'
                  : 'text-neutral-700'
              }`}
            >
              <Zap className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>TODAY</span>
            </div>
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-display font-black text-xs uppercase ${
                activeTab === 'timeline'
                  ? 'bg-[#FDC800] border-2 border-black shadow-[1px_1px_0px_#000000] text-black'
                  : 'text-neutral-700'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>TIMELINE</span>
            </div>
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-display font-black text-xs uppercase ${
                activeTab === 'dossier'
                  ? 'bg-[#FDC800] border-2 border-black shadow-[1px_1px_0px_#000000] text-black'
                  : 'text-neutral-700'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>DOSSIER</span>
            </div>
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-display font-black text-xs uppercase ${
                activeTab === 'studio'
                  ? 'bg-[#FDC800] border-2 border-black shadow-[1px_1px_0px_#000000] text-black'
                  : 'text-neutral-700'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>STUDIO</span>
            </div>
          </nav>

          {/* Right: Controls Pill */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#00E599] border-2 border-black text-black font-mono text-xs font-black shadow-[1.5px_1.5px_0px_#000000] shrink-0">
              <Flame className="w-3.5 h-3.5 fill-black text-black" />
              <span>DAY 41</span>
            </div>

            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#00E599] border-2 border-black text-black font-mono text-xs font-black shadow-[1.5px_1.5px_0px_#000000] shrink-0">
              <div className="w-2 h-2 rounded-full bg-emerald-700 animate-pulse" />
              <span>Trinno</span>
            </div>

            <div className="p-2 rounded-xl bg-white border-2 border-black shadow-[1.5px_1.5px_0px_#000000]">
              <Printer className="w-4 h-4 text-black stroke-[2.5]" />
            </div>

            <div className="p-2 rounded-xl bg-white border-2 border-black shadow-[1.5px_1.5px_0px_#000000]">
              <Settings className="w-4 h-4 text-black" />
            </div>
          </div>
        </div>
      </header>

      {/* 2. Main Workspace: Exact 1:1 layout from ground truth */}
      <main className="flex-1 w-full max-w-7xl 2xl:max-w-8xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* CARD 1: TODAY HERO ARENA */}
        <div className="bg-white border-3 border-black rounded-4xl p-6 sm:p-8 shadow-[4px_4px_0px_#000000] space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-4 border-b border-black/10">
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

        {/* CARD 2: LIFETIME METRICS */}
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
 * @param tab       explicit active tab ('log', 'timeline', 'dossier', 'settings')
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
          <DesktopSkeleton tab={tab} />
        )
      ) : (
        <div className="min-h-screen bg-[#FFFDF5]" aria-hidden="true" />
      )}
    </div>
  );
}
