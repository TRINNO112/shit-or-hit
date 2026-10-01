import React, { useState, useEffect } from 'react';
import { Loader2, Check, Sparkles, RotateCcw, Copy, AlertCircle } from 'lucide-react';
import { soundEngine } from '../services/soundEngine';

/* ------------------------------------------------------------------
   VERDICT ICONS: 3 handcrafted vector variants for every rating tier.
   Pure Neobrutalist SVG vectors (Zero Raw Emojis).
   Shared style rules: 24x24 grid, round caps & joins, 2px line,
   18% soft fill of currentColor for authentic depth.
------------------------------------------------------------------- */

const SOFT = { fill: 'currentColor', fillOpacity: 0.18 };
const SOLID = { fill: 'currentColor' };

function Base({ size = 24, strokeWidth = 2, className = '', children, ...props }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      {...props}
    >
      {children}
    </svg>
  );
}

const CLOUD = 'M7 16a4 4 0 0 1-.6-7.95A5.5 5.5 0 0 1 17 8.5 3.75 3.75 0 0 1 17.5 16z';
const SHIELD = 'M12 2.5 20 5.5v6c0 4.8-3.3 8.3-8 10-4.7-1.7-8-5.2-8-10v-6z';

/* ============================ 1 · ROUGH ============================ */

// Warning seal with an exclamation mark
export const RoughSeal = (p) => (
  <Base {...p}>
    <path
      d="M12 2 14.9 4.98 19.07 4.93 19.02 9.09 22 12 19.02 14.91 19.07 19.07 14.9 19.02 12 22 9.1 19.02 4.93 19.07 4.98 14.91 2 12 4.98 9.09 4.93 4.93 9.1 4.98z"
      {...SOFT}
    />
    <path d="M12 7.5v5M12 16.5h.01" />
  </Base>
);

// Thundercloud with a lightning strike and rain
export const RoughStorm = (p) => (
  <Base {...p}>
    <path d="M7 14a4 4 0 0 1-.6-7.95A5.5 5.5 0 0 1 17 6.5 3.75 3.75 0 0 1 17.5 14z" {...SOFT} />
    <path d="M13 14 10.5 18h3L11.5 22" />
    <path d="M6.5 17.5l-.7 2M17.5 17.5l-.7 2" />
  </Base>
);

// Shield mark, cracked in two
export const RoughCracked = (p) => (
  <Base {...p}>
    <path d={SHIELD} {...SOFT} />
    <path d="M12 2.5 10.5 7 13.5 10 10.8 13.5 13 16.5 12 21.5" />
  </Base>
);

/* ============================= 2 · DOWN ============================ */

// Rain cloud
export const DownRain = (p) => (
  <Base {...p}>
    <path d={CLOUD} {...SOFT} />
    <path d="M8 19l-1 2.5M12 19l-1 2.5M16 19l-1 2.5" />
  </Base>
);

// Battery on its last sliver, with a warning mark
export const DownBattery = (p) => (
  <Base {...p}>
    <rect x="2" y="7" width="17" height="10" rx="2.5" {...SOFT} />
    <path d="M21.5 10.5v3" />
    <rect x="4.5" y="9.5" width="3" height="5" rx="1" {...SOLID} strokeWidth="1" />
    <path d="M13.5 10v2.2M13.5 14.6h.01" />
  </Base>
);

// Area chart sliding down
export const DownTrend = (p) => (
  <Base {...p}>
    <path d="M2 7l6.5 6.5 4-4L22 19V22H2z" {...SOFT} stroke="none" />
    <path d="M2 7l6.5 6.5 4-4L22 19" />
    <path d="M16 19h6v-6" />
  </Base>
);

/* ============================= 3 · OKAY ============================ */

// Equals sign: even, steady balance
export const OkayBalance = (p) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="10" {...SOFT} />
    <path d="M8 10.2h8M8 13.8h8" />
  </Base>
);

// Sun peeking from behind a cloud
export const OkayPartly = (p) => (
  <Base {...p}>
    <circle cx="18.5" cy="6" r="2.8" {...SOFT} strokeWidth="1.6" />
    <path d="M8 20a4 4 0 0 1-.4-7.98A5 5 0 0 1 17.3 13a3.5 3.5 0 0 1 .2 7z" {...SOFT} />
  </Base>
);

// Spirit level with the bubble dead center
export const OkayLevel = (p) => (
  <Base {...p}>
    <rect x="2" y="7" width="20" height="10" rx="5" {...SOFT} />
    <path d="M8.5 9.5v5M15.5 9.5v5" />
    <circle cx="12" cy="12" r="1.8" {...SOLID} strokeWidth="1" />
  </Base>
);

/* ============================= 4 · GOOD ============================ */

// Fully lit charge ring around a solid bolt
export const GoodCharged = (p) => (
  <Base {...p}>
    <circle
      cx="12"
      cy="12"
      r="9"
      pathLength="24"
      strokeDasharray="1.6 0.4"
      strokeLinecap="butt"
      {...SOFT}
    />
    <path d="M12.9 5.8 8.5 12.4h3l-.7 5.8 4.7-6.6h-3z" {...SOLID} strokeWidth="1.2" />
  </Base>
);

// Full battery cell with a bolt
export const GoodCell = (p) => (
  <Base {...p}>
    <path d="M9.5 2.5h5" />
    <rect x="6" y="4.5" width="12" height="17.5" rx="2.5" {...SOFT} />
    <path d="M13.2 7.6 9 13.6h2.8l-.8 5 4.3-6.4h-2.8z" {...SOLID} strokeWidth="1.2" />
  </Base>
);

// Bolt with speed streaks
export const GoodVelocity = (p) => (
  <Base {...p}>
    <path d="M17 2 9 13.5H14L13 22 21 10H16.5z" {...SOFT} />
    <path d="M5 8h5M2.5 12h5M5.5 16h5" />
  </Base>
);

/* ============================= 5 · PEAK ============================ */

// Big four-point star with two small ones
export const PeakStar = (p) => (
  <Base {...p}>
    <path d="M11 5Q11 13 19 13Q11 13 11 21Q11 13 3 13Q11 13 11 5z" {...SOFT} />
    <path d="M19 2.5Q19 5 21.5 5Q19 5 19 7.5Q19 5 16.5 5Q19 5 19 2.5z" {...SOLID} strokeWidth="1.5" />
    <path d="M19.5 17.5Q19.5 19.5 21.5 19.5Q19.5 19.5 19.5 21.5Q19.5 19.5 17.5 19.5Q19.5 19.5 19.5 17.5z" {...SOLID} strokeWidth="1.5" />
  </Base>
);

// Trophy with loop handles, star emblem and a weighted base
export const PeakTrophy = (p) => (
  <Base {...p}>
    <path d="M6.5 3h11v6.5a5.5 5.5 0 0 1-11 0z" {...SOFT} />
    <path d="M6.5 5.5H4.3A1.3 1.3 0 0 0 3 6.8v.7A3.5 3.5 0 0 0 6.5 11" />
    <path d="M17.5 5.5h2.2A1.3 1.3 0 0 1 21 6.8v.7A3.5 3.5 0 0 1 17.5 11" />
    <path d="M12 15v2.5" />
    <path d="M8.5 17.5h7l.8 4.5H7.7z" {...SOFT} />
    <path d="M12 6.2Q12 9.2 15 9.2Q12 9.2 12 12.2Q12 9.2 9 9.2Q12 9.2 12 6.2z" {...SOLID} strokeWidth="1" />
  </Base>
);

// Olympic Grand Victory Medal with folded ribbon, suspension ring, and 5-point star relief
export const PeakMedal = (p) => (
  <Base {...p}>
    <path d="M6 2 L12 9 L18 2" strokeWidth="2.5" strokeLinecap="square" />
    <path d="M4 2 L12 10.5 L20 2" strokeWidth="1.5" strokeOpacity="0.4" />
    <circle cx="12" cy="9.5" r="1.5" {...SOLID} stroke="none" />
    <circle cx="12" cy="15" r="6.5" {...SOFT} strokeWidth="2.2" />
    <circle cx="12" cy="15" r="4.8" strokeWidth="1" strokeDasharray="1.2 0.8" strokeOpacity="0.6" />
    <polygon
      points="12,12 12.9,13.8 14.8,14.1 13.4,15.4 13.8,17.2 12,16.2 10.2,17.2 10.6,15.4 9.2,14.1 11.1,13.8"
      {...SOLID}
      strokeWidth="0.8"
    />
  </Base>
);

/* ========================== Registry and API ======================= */

export const VERDICT_ICONS = {
  1: { seal: RoughSeal, storm: RoughStorm, cracked: RoughCracked },
  2: { rain: DownRain, battery: DownBattery, trend: DownTrend },
  3: { balance: OkayBalance, partly: OkayPartly, level: OkayLevel },
  4: { charged: GoodCharged, cell: GoodCell, velocity: GoodVelocity },
  5: { star: PeakStar, trophy: PeakTrophy, medal: PeakMedal }
};

export const DEFAULT_VARIANTS = {
  1: 'seal',
  2: 'rain',
  3: 'balance',
  4: 'charged',
  5: 'medal'
};

export const VARIANT_LABELS = {
  seal: 'Warning Seal',
  storm: 'Thunderstorm',
  cracked: 'Cracked Shield',
  rain: 'Rain Cloud',
  battery: 'Critical Battery',
  trend: 'Downtrend Fall',
  balance: 'Equilibrium',
  partly: 'Partly Sunny',
  level: 'Spirit Level',
  charged: 'Charged Orbit',
  cell: 'Full Battery',
  velocity: 'Sonic Velocity',
  star: 'Sparkle Star',
  trophy: 'Championship Trophy',
  medal: 'Olympic Grand Medal'
};

export const TIER_META = {
  1: { name: 'Rough', color: '#FF4D4D', text: 'text-black', key: '1' },
  2: { name: 'Down', color: '#FF8A00', text: 'text-black', key: '2' },
  3: { name: 'Okay', color: '#CBD5E1', text: 'text-black', key: '3' },
  4: { name: 'Good', color: '#00E599', text: 'text-black', key: '4' },
  5: { name: 'Peak', color: '#FDC800', text: 'text-black', key: '5' }
};

/* 3 Pre-made System Presets */
export const MOOD_ICON_PRESETS = [
  {
    id: 'signature',
    title: '1. SIGNATURE ESSENTIALS',
    tag: 'DEFAULT',
    desc: 'Warning Seal, Rain Cloud, Equilibrium, Charged Orbit & Grand Medal',
    variants: { 1: 'seal', 2: 'rain', 3: 'balance', 4: 'charged', 5: 'medal' }
  },
  {
    id: 'elements',
    title: '2. STORM & STRENGTH',
    tag: 'POWER',
    desc: 'Thunderstorm, Critical Battery, Partly Sunny, Full Battery & Victory Trophy',
    variants: { 1: 'storm', 2: 'battery', 3: 'partly', 4: 'cell', 5: 'trophy' }
  },
  {
    id: 'resilience',
    title: '3. STEADFAST RESILIENCE',
    tag: 'TACTICAL',
    desc: 'Cracked Shield, Downtrend Fall, Spirit Level, Sonic Velocity & Sparkle Star',
    variants: { 1: 'cracked', 2: 'trend', 3: 'level', 4: 'velocity', 5: 'star' }
  }
];

export function getSavedVerdictVariants() {
  if (typeof window === 'undefined') return DEFAULT_VARIANTS;
  try {
    const raw = localStorage.getItem('verdict_icon_variants');
    if (!raw) return DEFAULT_VARIANTS;
    const parsed = JSON.parse(raw);
    return {
      1: parsed[1] || DEFAULT_VARIANTS[1],
      2: parsed[2] || DEFAULT_VARIANTS[2],
      3: parsed[3] || DEFAULT_VARIANTS[3],
      4: parsed[4] || DEFAULT_VARIANTS[4],
      5: parsed[5] || DEFAULT_VARIANTS[5]
    };
  } catch (e) {
    return DEFAULT_VARIANTS;
  }
}

export function saveVerdictVariants(variants) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('verdict_icon_variants', JSON.stringify(variants));
  } catch (e) {
    console.error('Failed to save verdict icon variants:', e);
  }
}

/* Reusable VerdictIcon Component: Renders the active variant for rating tier */
export function VerdictIcon({ rating, size = 20, className = '', strokeWidth = 2, ...props }) {
  const r = Math.max(1, Math.min(5, Math.round(Number(rating) || 3)));
  const variants = getSavedVerdictVariants();
  const variantKey = variants[r] || DEFAULT_VARIANTS[r];
  const Component = (VERDICT_ICONS[r] && VERDICT_ICONS[r][variantKey]) || VERDICT_ICONS[r][DEFAULT_VARIANTS[r]];
  if (!Component) return null;
  return <Component size={size} className={className} strokeWidth={strokeWidth} {...props} />;
}

/* ============================= Main Gallery ============================= */

export default function VerdictIconGallery({ onSelectCustomVariant }) {
  const [picks, setPicks] = useState(getSavedVerdictVariants);
  const [copied, setCopied] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [isApplied, setIsApplied] = useState(false);
  const [applyError, setApplyError] = useState(null);

  // Determine active preset (if current picks match one of the 3 presets)
  const activePresetId = React.useMemo(() => {
    for (const preset of MOOD_ICON_PRESETS) {
      const match = [1, 2, 3, 4, 5].every((r) => preset.variants[r] === picks[r]);
      if (match) return preset.id;
    }
    return 'custom';
  }, [picks]);

  const handleSelectPreset = (preset) => {
    setPicks(preset.variants);
    soundEngine.playClick();
  };

  const handlePickVariant = (tier, variant) => {
    const updated = { ...picks, [tier]: variant };
    setPicks(updated);
    soundEngine.playClick();
    if (onSelectCustomVariant) onSelectCustomVariant(updated);
  };

  const handleResetDefaults = () => {
    setPicks(DEFAULT_VARIANTS);
    soundEngine.playClick();
  };

  const handleApplyToApp = () => {
    setIsApplying(true);
    setApplyError(null);
    soundEngine.playClick();

    setTimeout(() => {
      try {
        saveVerdictVariants(picks);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('verdict-icons-updated', { detail: picks }));
        }
        setIsApplying(false);
        setIsApplied(true);
        soundEngine.playSuccess();
        setTimeout(() => setIsApplied(false), 2400);
      } catch (err) {
        setIsApplying(false);
        setApplyError('Failed to save settings');
        setTimeout(() => setApplyError(null), 3000);
      }
    }, 450);
  };

  const copyConfig = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(picks, null, 2));
      setCopied(true);
      soundEngine.playClick();
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {}
  };

  return (
    <div className="bg-[#FFFDF8] border-3 border-black rounded-3xl p-3.5 sm:p-7 text-black shadow-[6px_6px_0px_#000000] space-y-6">
      
      {/* Header & Main Primary Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-3 border-black pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 bg-[#FDC800] border-2 border-black rounded-lg font-mono font-black text-[10px] uppercase shadow-[2px_2px_0px_#000]">
              DAILY MOOD THEME ENGINE
            </span>
            <span className="px-2 py-0.5 bg-black text-[#00E599] rounded font-mono font-black text-[10px] uppercase">
              {activePresetId === 'custom' ? 'CUSTOM COMBINATION' : `THEME: ${activePresetId.toUpperCase()}`}
            </span>
          </div>
          <h2 className="font-display font-black text-xl sm:text-2xl uppercase tracking-tight">
            Daily Mood Icon Themes
          </h2>
          <p className="text-xs font-mono text-black/70">
            Select one of 3 pre-made settings or freely pick from your 15 vector variants.
          </p>
        </div>

        {/* Primary Activation CTA with In-Place Loading/Update Morph */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleApplyToApp}
            disabled={isApplying}
            className={`w-full sm:w-auto px-5 py-2.5 border-2 border-black rounded-xl font-mono font-black text-xs uppercase shadow-[3px_3px_0px_#000000] cursor-pointer transition-all flex items-center justify-center gap-2 active:translate-x-px active:translate-y-px ${
              isApplied
                ? 'bg-[#00E599] text-black ring-2 ring-black'
                : applyError
                ? 'bg-[#FF4D4D] text-white ring-2 ring-black'
                : 'bg-[#FDC800] hover:bg-[#ffe066] text-black'
            }`}
          >
            {isApplying ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin stroke-3" />
                <span>UPDATING APPLICATION...</span>
              </>
            ) : isApplied ? (
              <>
                <Check className="w-4 h-4 stroke-3 text-black" />
                <span>APPLIED TO DAILY PAGE!</span>
              </>
            ) : applyError ? (
              <>
                <AlertCircle className="w-4 h-4 stroke-3 text-white" />
                <span>ERROR: RETRY</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 stroke-[2.5]" />
                <span>ACTIVATE FOR DAILY PAGE</span>
              </>
            )}
          </button>

          {/* Quick Helper Tools */}
          <div className="flex items-center gap-1.5 self-center sm:self-auto">
            <button
              type="button"
              onClick={handleResetDefaults}
              title="Reset to default variants"
              className="p-2 bg-white border-2 border-black rounded-xl hover:bg-neutral-100 cursor-pointer shadow-[2px_2px_0px_#000] active:translate-x-px active:translate-y-px flex items-center gap-1 font-mono text-[10px] font-black uppercase"
            >
              <RotateCcw className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="hidden md:inline">RESET</span>
            </button>
            <button
              type="button"
              onClick={copyConfig}
              title="Copy configuration JSON"
              className="p-2 bg-white border-2 border-black rounded-xl hover:bg-neutral-100 cursor-pointer shadow-[2px_2px_0px_#000] active:translate-x-px active:translate-y-px flex items-center gap-1 font-mono text-[10px] font-black uppercase"
            >
              <Copy className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>{copied ? 'COPIED' : 'COPY'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Part 1: 3 Curated Preset Theme Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-mono font-black text-xs uppercase text-neutral-800 tracking-wider">
            3 PRE-MADE THEME SETTINGS (1-TAP SELECT):
          </span>
          <span className="font-mono text-[10px] text-neutral-500 font-bold uppercase hidden sm:inline">
            CLICK TO LOAD COMPLETE SET
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {MOOD_ICON_PRESETS.map((preset) => {
            const isSelected = activePresetId === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className={`p-3.5 rounded-2xl border-2 border-black text-left cursor-pointer transition-all flex flex-col justify-between gap-3 ${
                  isSelected
                    ? 'bg-[#FFFDF5] shadow-[4px_4px_0px_#000000] ring-2 ring-black -translate-y-0.5'
                    : 'bg-white hover:bg-neutral-50 shadow-[2px_2px_0px_#000000]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-display font-black text-xs uppercase tracking-tight">
                      {preset.title}
                    </span>
                    <span
                      className={`font-mono text-[9px] font-black px-1.5 py-0.5 rounded border border-black ${
                        isSelected ? 'bg-[#00E599] text-black' : 'bg-neutral-100 text-neutral-700'
                      }`}
                    >
                      {isSelected ? 'SELECTED' : preset.tag}
                    </span>
                  </div>
                  <p className="text-[11px] font-mono text-neutral-600 line-clamp-2">
                    {preset.desc}
                  </p>
                </div>

                {/* 5 Icons Row Preview */}
                <div className="flex items-center justify-between gap-1 pt-2 border-t border-black/10">
                  {[1, 2, 3, 4, 5].map((tier) => {
                    const variantKey = preset.variants[tier];
                    const IconComponent = VERDICT_ICONS[tier][variantKey];
                    const meta = TIER_META[tier];
                    return (
                      <div
                        key={tier}
                        className="w-7 h-7 rounded-lg border border-black flex items-center justify-center shrink-0"
                        style={{ backgroundColor: meta.color }}
                        title={`${tier}★ ${meta.name}: ${VARIANT_LABELS[variantKey]}`}
                      >
                        <IconComponent size={16} className="text-black stroke-[2.2]" />
                      </div>
                    );
                  })}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Part 2: 5-Tier Freedom Customization Grid (Original Handcrafted SVG Gallery) */}
      <div className="space-y-4 pt-4 border-t-2 border-black/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <div>
            <h3 className="font-display font-black text-base sm:text-lg uppercase tracking-tight">
              Individual Tier Customizer (Freedom Mode)
            </h3>
            <p className="text-[11px] font-mono text-black/60">
              Click any vector icon variant below to customize that tier. Then tap Activate to apply to your daily page.
            </p>
          </div>
          {activePresetId === 'custom' && (
            <span className="font-mono text-[10px] bg-[#FDC800] border border-black px-2 py-0.5 rounded font-black self-start sm:self-auto">
              CUSTOM MIX ACTIVE
            </span>
          )}
        </div>

        {/* 5 Tiers Grid */}
        {[1, 2, 3, 4, 5].map((r) => {
          const meta = TIER_META[r];
          return (
            <div key={r} className="p-3 sm:p-4 rounded-2xl border-2 border-black bg-white shadow-[3px_3px_0px_#000]">
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-black shrink-0"
                    style={{ backgroundColor: meta.color }}
                  />
                  <span className="font-mono font-black text-xs uppercase text-black">
                    {r}★ {meta.name}
                  </span>
                </div>
                <span className="font-mono text-[10px] text-neutral-600 font-black uppercase">
                  ACTIVE: {VARIANT_LABELS[picks[r]]}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {Object.keys(VERDICT_ICONS[r]).map((v) => {
                  const active = picks[r] === v;
                  const Icon = VERDICT_ICONS[r][v];
                  return (
                    <button
                      key={v}
                      type="button"
                      onClick={() => handlePickVariant(r, v)}
                      aria-pressed={active}
                      className={`p-2 sm:p-3 rounded-xl border-2 border-black flex flex-col items-center gap-1.5 sm:gap-2 cursor-pointer transition-all ${
                        active
                          ? 'bg-[#FFFDF5] shadow-[4px_4px_0px_#000000] -translate-y-0.5 ring-2 ring-black'
                          : 'bg-neutral-50 hover:bg-white shadow-[2px_2px_0px_#000000]'
                      }`}
                    >
                      <div
                        className="w-full aspect-square max-w-14 sm:max-w-17.5 rounded-lg border-2 border-black flex items-center justify-center transition-all"
                        style={{ backgroundColor: meta.color }}
                      >
                        <Icon size={32} className="text-black stroke-2" />
                      </div>
                      <span className="font-mono font-black text-[9px] sm:text-[10px] uppercase text-center truncate max-w-full">
                        {VARIANT_LABELS[v]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
