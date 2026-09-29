import React, { useState, useEffect } from 'react';
import { playMood } from '../services/soundEffects';
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

// ✨ UPGRADED: Prestigious Neobrutalist Grand Olympic Victory Medal
// Features bold faceted ribbon drape, polished suspension ring, and 5-point star relief
export const PeakMedal = (p) => (
  <Base {...p}>
    {/* Symmetrical Folded Grosgrain Ribbon */}
    <path d="M6 2 L12 9 L18 2" strokeWidth="2.5" strokeLinecap="square" />
    <path d="M4 2 L12 10.5 L20 2" strokeWidth="1.5" strokeOpacity="0.4" />
    {/* Suspension Ring Clasp */}
    <circle cx="12" cy="9.5" r="1.5" {...SOLID} stroke="none" />
    {/* Heavy Medallion Disc */}
    <circle cx="12" cy="15" r="6.5" {...SOFT} strokeWidth="2.2" />
    <circle cx="12" cy="15" r="4.8" strokeWidth="1" strokeDasharray="1.2 0.8" strokeOpacity="0.6" />
    {/* Embossed 5-Point Victory Star */}
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
  5: { star: PeakStar, trophy: PeakTrophy, medal: PeakMedal },
};

export const DEFAULT_VARIANTS = {
  1: 'seal',
  2: 'rain',
  3: 'balance',
  4: 'charged',
  5: 'medal', // Upgraded prestigious medal as hero default
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
  medal: 'Olympic Grand Medal',
};

export const TIER_META = {
  1: { name: 'Rough', color: '#FF4D4D', text: 'text-black', key: '1' },
  2: { name: 'Down', color: '#FF8A00', text: 'text-black', key: '2' },
  3: { name: 'Okay', color: '#CBD5E1', text: 'text-black', key: '3' },
  4: { name: 'Good', color: '#00E599', text: 'text-black', key: '4' },
  5: { name: 'Peak', color: '#FDC800', text: 'text-black', key: '5' },
};

export function getSavedVerdictVariants() {
  if (typeof window === 'undefined') return DEFAULT_VARIANTS;
  try {
    const raw = localStorage.getItem('verdict_icon_variants');
    if (raw) return { ...DEFAULT_VARIANTS, ...JSON.parse(raw) };
  } catch (e) {}
  return DEFAULT_VARIANTS;
}

export function saveVerdictVariants(variants) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('verdict_icon_variants', JSON.stringify(variants));
  } catch (e) {}
}

export function VerdictIcon({ rating, variant, ...props }) {
  const set = VERDICT_ICONS[rating];
  if (!set) return null;
  const saved = getSavedVerdictVariants();
  const Icon = set[variant] || set[saved[rating]] || set[DEFAULT_VARIANTS[rating]];
  return <Icon {...props} />;
}

/* ================== 3 NOTIFICATION MENU SETTER DESIGNS ================= */

export function NotificationStripPreview({ design = 'tactile', selectedRating, onSelectRating, variants = DEFAULT_VARIANTS }) {
  // DESIGN 1: "The Neobrutalist Tactile Strip"
  if (design === 'tactile') {
    return (
      <div className="bg-[#FFFDF5] border-3 border-black rounded-2xl p-4 shadow-[6px_6px_0px_#000000]">
        <div className="flex items-center justify-between mb-3 border-b-2 border-black pb-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF4D4D] animate-ping" />
            <span className="font-mono font-black text-xs uppercase tracking-wider">
              NOTIFICATION SHADE // 1-TAP QUICK VERDICT
            </span>
          </div>
          <span className="font-mono text-[10px] bg-black text-white px-2 py-0.5 rounded font-black">
            KEYS: 1-5
          </span>
        </div>

        <div className="grid grid-cols-5 gap-2 sm:gap-3">
          {[1, 2, 3, 4, 5].map((r) => {
            const isSelected = selectedRating === r;
            const meta = TIER_META[r];
            const Icon = VERDICT_ICONS[r][variants[r]] || VERDICT_ICONS[r][DEFAULT_VARIANTS[r]];
            return (
              <button
                key={r}
                type="button"
                onClick={() => onSelectRating(r)}
                className={`relative flex flex-col items-center justify-center py-2.5 sm:py-3.5 rounded-xl border-2 border-black transition-all cursor-pointer select-none ${
                  isSelected
                    ? 'translate-x-0.5 translate-y-0.5 shadow-none ring-2 ring-black'
                    : 'shadow-[3px_3px_0px_#000000] hover:-translate-y-0.5'
                }`}
                style={{ backgroundColor: meta.color }}
              >
                <div className="absolute top-1 left-1.5 font-mono text-[9px] font-black text-black/60 bg-white/60 px-1 rounded border border-black/40">
                  {meta.key}
                </div>
                <Icon size={26} className="text-black stroke-[2.2] my-1" />
                <span className="font-mono font-black text-[11px] uppercase tracking-tight text-black">
                  {meta.name}
                </span>
                <span className="font-mono font-black text-[9px] text-black/70">
                  {r}★
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // DESIGN 2: "The Minimalist Cyber Dock"
  if (design === 'cyber_dock') {
    return (
      <div className="bg-[#121214] border-3 border-black rounded-2xl p-4 shadow-[6px_6px_0px_#00E599] text-white">
        <div className="flex items-center justify-between mb-3 text-neutral-400 font-mono text-xs uppercase">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00E599]" />
            <span className="text-white font-black tracking-wider">CYBER DOCK // LOCKSCREEN MENU</span>
          </div>
          <span className="text-[#00E599] font-black text-[10px]">TAP OR PRESS [1-5]</span>
        </div>

        <div className="flex items-center bg-black/80 p-1.5 rounded-xl border-2 border-neutral-700 gap-1 sm:gap-2">
          {[1, 2, 3, 4, 5].map((r) => {
            const isSelected = selectedRating === r;
            const meta = TIER_META[r];
            const Icon = VERDICT_ICONS[r][variants[r]] || VERDICT_ICONS[r][DEFAULT_VARIANTS[r]];
            return (
              <button
                key={r}
                type="button"
                onClick={() => onSelectRating(r)}
                className={`flex-1 flex flex-col items-center py-2 sm:py-2.5 rounded-lg transition-all cursor-pointer border ${
                  isSelected
                    ? 'border-white bg-white/20 text-white shadow-[0_0_12px_rgba(255,255,255,0.4)] -translate-y-0.5'
                    : 'border-transparent text-neutral-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center mb-1 border"
                  style={{
                    backgroundColor: isSelected ? meta.color : 'rgba(255,255,255,0.06)',
                    borderColor: isSelected ? '#000' : 'rgba(255,255,255,0.2)'
                  }}
                >
                  <Icon size={18} className={isSelected ? 'text-black stroke-[2.5]' : 'text-white stroke-[2]'} />
                </div>
                <span className="font-mono font-bold text-[10px] uppercase">
                  {meta.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // DESIGN 3: "Mechanical Keycap Matrix"
  return (
    <div className="bg-[#EAE5D9] border-3 border-black rounded-2xl p-4 shadow-[6px_6px_0px_#000000]">
      <div className="flex items-center justify-between mb-3 border-b-2 border-black/30 pb-2">
        <span className="font-mono font-black text-xs uppercase text-neutral-800 tracking-wider">
          CHERRY MX VERDICT BAR // KEYBOARD ACCELERATED
        </span>
        <span className="font-mono text-[10px] bg-[#FDC800] border border-black text-black px-2 py-0.5 rounded font-black shadow-[1px_1px_0px_#000]">
          PHYSICAL SPRING TRAVEL
        </span>
      </div>

      <div className="grid grid-cols-5 gap-2 sm:gap-3">
        {[1, 2, 3, 4, 5].map((r) => {
          const isSelected = selectedRating === r;
          const meta = TIER_META[r];
          const Icon = VERDICT_ICONS[r][variants[r]] || VERDICT_ICONS[r][DEFAULT_VARIANTS[r]];
          return (
            <button
              key={r}
              type="button"
              onClick={() => onSelectRating(r)}
              className={`p-2 sm:p-3 rounded-xl border-2 border-black flex flex-col items-center justify-between cursor-pointer transition-all select-none ${
                isSelected
                  ? 'bg-white translate-y-1.5 shadow-[1px_1px_0px_#000000] border-t-4 border-t-black'
                  : 'bg-[#FFFDF5] shadow-[0px_6px_0px_#000000] hover:translate-y-0.5 hover:shadow-[0px_4px_0px_#000000]'
              }`}
            >
              <div
                className="w-full py-1 rounded-md text-center font-mono font-black text-xs border border-black mb-1.5"
                style={{ backgroundColor: meta.color }}
              >
                [{meta.key}]
              </div>
              <Icon size={24} className="text-black stroke-[2.2] my-1" />
              <span className="font-mono font-black text-[10px] uppercase text-black mt-1">
                {meta.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ============================= Main Gallery ============================= */

export default function VerdictIconGallery({ onSelectCustomVariant }) {
  const [picks, setPicks] = useState(getSavedVerdictVariants);
  const [selectedDesign, setSelectedDesign] = useState('tactile'); // 'tactile' | 'cyber_dock' | 'keycap'
  const [activePreviewRating, setActivePreviewRating] = useState(5);
  const [lastKeyPressed, setLastKeyPressed] = useState(null);
  const [copied, setCopied] = useState(false);

  // Global Keyboard listener for [1, 2, 3, 4, 5]
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't intercept if user is typing in an input or textarea
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

      const num = parseInt(e.key, 10);
      if (num >= 1 && num <= 5) {
        e.preventDefault();
        setActivePreviewRating(num);
        setLastKeyPressed(num);
        try {
          playMood(num);
        } catch (err) {
          soundEngine.playClick();
        }
        setTimeout(() => setLastKeyPressed(null), 600);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handlePickVariant = (tier, variant) => {
    const updated = { ...picks, [tier]: variant };
    setPicks(updated);
    saveVerdictVariants(updated);
    soundEngine.playClick();
    if (onSelectCustomVariant) onSelectCustomVariant(updated);
  };

  const handleRatingSelect = (rating) => {
    setActivePreviewRating(rating);
    try {
      playMood(rating);
    } catch (e) {
      soundEngine.playClick();
    }
  };

  const code = `export const DEFAULT_VARIANTS = ${JSON.stringify(picks, null, 2).replace(/"(\d)":/g, '$1:')};`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {}
  };

  return (
    <div className="bg-[#FFFDF8] border-3 border-black rounded-3xl p-4 sm:p-7 text-black shadow-[6px_6px_0px_#000000] space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-3 border-black pb-4">
        <div>
          <div className="inline-block px-2.5 py-0.5 bg-[#FDC800] border-2 border-black rounded-lg font-mono font-black text-[10px] uppercase shadow-[2px_2px_0px_#000] mb-1.5">
            FREEDOM ENGINE // USER PREFERENCE VAULT
          </div>
          <h2 className="font-display font-black text-2xl uppercase tracking-tight">
            Verdict Vector Icons & Notification Setter
          </h2>
          <p className="text-xs font-mono text-black/70">
            3 vector variants for each mood tier + 3 interactive Notification Bar designs with keyboard shortcuts.
          </p>
        </div>

        {/* Keyboard status pill */}
        <div className="flex items-center gap-2 bg-black text-[#00E599] font-mono text-xs px-3 py-2 rounded-xl border-2 border-black shadow-[2px_2px_0px_#000]">
          <span className="w-2 h-2 rounded-full bg-[#00E599] animate-pulse" />
          <span>KEYBOARD: PRESS 1-5</span>
          {lastKeyPressed && (
            <span className="bg-[#FF4D4D] text-white px-1.5 py-0.2 rounded font-black text-[10px]">
              [{lastKeyPressed}★]
            </span>
          )}
        </div>
      </div>

      {/* Part 1: Interactive Notification Setter Designs Preview */}
      <div className="space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="text-xs font-mono font-black uppercase text-black/80 flex items-center gap-1.5">
            <span>PREVIEW NOTIFICATION SHADE LAYOUT:</span>
          </span>

          <div className="flex items-center gap-1.5 bg-neutral-200 p-1 rounded-xl border-2 border-black">
            {[
              { id: 'tactile', label: '1. Tactile Strip' },
              { id: 'cyber_dock', label: '2. Cyber Dock' },
              { id: 'keycap', label: '3. Cherry Keycap' },
            ].map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => setSelectedDesign(d.id)}
                className={`px-2.5 py-1 rounded-lg font-mono font-black text-[10px] uppercase cursor-pointer transition-all ${
                  selectedDesign === d.id
                    ? 'bg-[#FDC800] text-black border border-black shadow-[1.5px_1.5px_0px_#000]'
                    : 'text-neutral-700 hover:text-black'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* Live Notification Strip */}
        <NotificationStripPreview
          design={selectedDesign}
          selectedRating={activePreviewRating}
          onSelectRating={handleRatingSelect}
          variants={picks}
        />
      </div>

      {/* Part 2: Vector Icon Freedom Picker */}
      <div className="space-y-4 pt-2 border-t-2 border-black/20">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display font-black text-lg uppercase tracking-tight">
              Vector Icon Freedom (Choose Your Style)
            </h3>
            <p className="text-[11px] font-mono text-black/60">
              Click any vector icon to set it as your active theme across the app and notification bar.
            </p>
          </div>
          <button
            type="button"
            onClick={copy}
            className="px-3 py-1.5 bg-[#00E599] border-2 border-black rounded-xl font-mono font-black text-[10px] uppercase shadow-[2px_2px_0px_#000000] cursor-pointer hover:bg-[#00c785] active:translate-x-px active:translate-y-px"
          >
            {copied ? 'COPIED TO CLIPBOARD!' : 'COPY CONFIG'}
          </button>
        </div>

        {/* 5 Tiers Grid */}
        {[1, 2, 3, 4, 5].map((r) => {
          const meta = TIER_META[r];
          return (
            <div key={r} className="p-3.5 rounded-2xl border-2 border-black bg-white shadow-[3px_3px_0px_#000]">
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-black"
                    style={{ backgroundColor: meta.color }}
                  />
                  <span className="font-mono font-black text-xs uppercase text-black">
                    {r}★ {meta.name}
                  </span>
                </div>
                <span className="font-mono text-[10px] text-neutral-500 font-bold uppercase">
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
                      className={`p-2.5 sm:p-3 rounded-xl border-2 border-black flex flex-col items-center gap-2 cursor-pointer transition-all ${
                        active
                          ? 'bg-[#FFFDF5] shadow-[4px_4px_0px_#000000] -translate-y-0.5 ring-2 ring-black'
                          : 'bg-neutral-50 hover:bg-white shadow-[2px_2px_0px_#000000]'
                      }`}
                    >
                      <div
                        className="w-full aspect-square max-w-[76px] rounded-lg border-2 border-black flex items-center justify-center transition-all"
                        style={{ backgroundColor: meta.color }}
                      >
                        <Icon size={44} className="text-black stroke-[2]" />
                      </div>
                      <span className="font-mono font-black text-[10px] uppercase text-center truncate max-w-full">
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
