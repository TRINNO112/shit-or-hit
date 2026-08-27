import React, { useState } from 'react';
import {
  Flame, Crown, Skull, Crosshair, Swords, Target, Terminal,
  Zap, Sparkles, Ghost, ShieldAlert, Cpu, Activity,
  Compass, ShieldCheck, Trophy, Radio, Gem, Eye,
  Layers, Check, Copy, ArrowLeft, Download, RefreshCw
} from 'lucide-react';

export function MedalRibbonIcon({ className = "w-14 h-14", color = "#FDC800" }) {
  return (
    <svg viewBox="0 0 1024 1024" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M841.7 915.2L518.5 797.3 183.1 915.2V107.1h658.6z" fill="#FFFDF5" />
      <path d="M849.7 926.7L518.4 805.8 175.1 926.5V99.1h674.5v827.6zM191.1 115.1v788.8l327.4-115.1 315.1 115V115.1H191.1z" fill="#000000" />
      <path d="M752.2 791.2l-235.4-85.9-244.2 85.9V196.6h479.6z" fill={color} />
      <path d="M512.4 305.7l42.9 86.8 95.8 13.9-69.4 67.6 16.4 95.5-85.7-45.1-85.7 45.1 16.4-95.5-69.4-67.6 95.8-13.9z" fill="#FFFFFF" />
      <path d="M608.7 584.1l-96.3-50.6-96.3 50.6 18.4-107.3-77.9-76 107.7-15.7 48.2-97.6 48.2 97.6 107.7 15.7-77.9 76 18.2 107.3z m-96.3-68.7l75.1 39.5-14.3-83.6 60.7-59.2-83.9-12.2-37.5-76.1-37.5 76.1-84.1 12.1 60.7 59.2-14.3 83.6 75.1-39.4z" fill="#000000" />
      <path d="M205.7 140h50.9v50.9h-50.9z" fill="#FF4D4D" />
      <path d="M264.6 198.9h-66.9V132h66.9v66.9z m-50.9-16h34.9V148h-34.9v34.9z" fill="#000000" />
      <path d="M768.2 140h50.9v50.9h-50.9z" fill="#FF4D4D" />
      <path d="M827.1 198.9h-66.9V132h66.9v66.9z m-50.9-16h34.9V148h-34.9v34.9z" fill="#000000" />
    </svg>
  );
}

export function MechaVoltIcon({ className = "w-14 h-14", color = "#FDC800" }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M58 8L24 54H46L36 94L82 44H56L72 8H58Z"
        fill="#000000"
        transform="translate(4, 4)"
      />
      <path
        d="M56 6L22 52H44L34 92L80 42H54L70 6H56Z"
        fill={color}
        stroke="#000000"
        strokeWidth="4"
        strokeLinejoin="bevel"
      />
      <path
        d="M56 6L38 48H52L34 92L52 52H38L56 6Z"
        fill="rgba(255, 255, 255, 0.45)"
      />
      <path
        d="M48 24L58 24M42 36L52 36"
        stroke="#000000"
        strokeWidth="3"
        strokeLinecap="square"
      />
    </svg>
  );
}

export function GlitchVoltIcon({ className = "w-14 h-14", color = "#00E599" }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M55 4L22 46H42L32 88L76 40H52L66 4H55Z"
        fill="#FF4D4D"
        opacity="0.75"
        transform="translate(-3, 2)"
      />
      <path
        d="M55 4L22 46H42L32 88L76 40H52L66 4H55Z"
        fill={color}
        stroke="#000000"
        strokeWidth="3.5"
        strokeLinejoin="miter"
      />
      <rect x="15" y="32" width="70" height="4" fill="#000000" />
      <rect x="25" y="60" width="55" height="3" fill="#000000" />
      <circle cx="70" cy="22" r="3" fill="#FFFFFF" stroke="#000000" strokeWidth="1.5" />
      <circle cx="28" cy="72" r="2.5" fill="#FFFFFF" stroke="#000000" strokeWidth="1.5" />
    </svg>
  );
}

export function ShieldVoltIcon({ className = "w-14 h-14", color = "#FDC800" }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* 1. Neobrutalist 3D Solid Drop Shadow Base */}
      <polygon
        points="50,6 94,26 94,74 50,98 6,74 6,26"
        fill="#000000"
        transform="translate(4, 4)"
      />

      {/* 2. Outer Hexagonal Armor Shield Frame */}
      <polygon
        points="50,4 94,24 94,74 50,98 6,74 6,24"
        fill="#111622"
        stroke="#000000"
        strokeWidth="4"
        strokeLinejoin="bevel"
      />

      {/* 3. Inner Armor Bevel Layer (Cream & Streetwear Contrast) */}
      <polygon
        points="50,11 87,28 87,69 50,90 13,69 13,28"
        fill="#FFFDF5"
        stroke="#000000"
        strokeWidth="2.5"
        strokeLinejoin="bevel"
      />

      {/* 4. Deep Tech Matrix Chamber */}
      <polygon
        points="50,17 80,32 80,64 50,82 20,64 20,32"
        fill="#1E2638"
        stroke="#000000"
        strokeWidth="2"
      />

      {/* 5. Cyber Matrix Grid Lines & Chevron Warning Stripes */}
      <line x1="50" y1="17" x2="50" y2="82" stroke="rgba(253, 200, 0, 0.25)" strokeWidth="1.5" strokeDasharray="3 3" />
      <line x1="20" y1="48" x2="80" y2="48" stroke="rgba(253, 200, 0, 0.25)" strokeWidth="1.5" strokeDasharray="3 3" />
      
      {/* Top Armor Warning Chevrons */}
      <path d="M44 24L50 20L56 24" stroke="#FDC800" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M44 28L50 24L56 28" stroke="#FDC800" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />

      {/* Corner Mechanical Rivets */}
      <circle cx="50" cy="9" r="2" fill="#000000" />
      <circle cx="90" cy="27" r="2" fill="#000000" />
      <circle cx="90" cy="71" r="2" fill="#000000" />
      <circle cx="50" cy="93" r="2" fill="#000000" />
      <circle cx="10" cy="71" r="2" fill="#000000" />
      <circle cx="10" cy="27" r="2" fill="#000000" />

      {/* 6. Kinetic Electric Sparks (Breaking Out of Frame) */}
      <path d="M84 16L87 20L91 17L88 23L93 25L87 26L88 31L83 27L80 32L81 26L76 24L82 22Z" fill="#FDC800" stroke="#000000" strokeWidth="1" />
      <path d="M12 70L15 73L18 69L16 75L21 77L15 78L16 83L12 79L8 83L10 77L5 76L11 74Z" fill="#00E599" stroke="#000000" strokeWidth="1" />

      {/* 7. Bursting Overdrive Mecha Thunderbolt (Breaking Boundary) */}
      {/* Bolt 3D Shadow Base */}
      <path
        d="M60 2L22 48H44L30 96L82 42H56L72 2H60Z"
        fill="#000000"
        transform="translate(3, 3)"
      />

      {/* Main Lightning Body */}
      <path
        d="M58 0L20 46H42L28 94L80 40H54L70 0H58Z"
        fill={color}
        stroke="#000000"
        strokeWidth="3.5"
        strokeLinejoin="bevel"
      />

      {/* High-Voltage Dynamic Core Bevel (Dual Tone) */}
      <path
        d="M58 0L36 44H50L28 94L52 46H38L58 0Z"
        fill="rgba(255, 255, 255, 0.6)"
      />

      {/* Cyber Mechanical Etchings on Bolt */}
      <line x1="48" y1="20" x2="58" y2="20" stroke="#000000" strokeWidth="2" strokeLinecap="round" />
      <line x1="42" y1="32" x2="52" y2="32" stroke="#000000" strokeWidth="2" strokeLinecap="round" />
      <line x1="38" y1="62" x2="48" y2="62" stroke="#000000" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function SerratedStreetBoltIcon({ className = "w-14 h-14", color = "#FDC800" }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M62 4L42 28H56L34 54H48L20 96L46 64H32L54 38H40L68 4H62Z"
        fill="#000000"
        transform="translate(4, 4)"
      />
      <path
        d="M60 2L40 26H54L32 52H46L18 94L44 62H30L52 36H38L66 2H60Z"
        fill={color}
        stroke="#000000"
        strokeWidth="3.5"
        strokeLinejoin="bevel"
      />
      <path
        d="M52 10L38 28H48L32 52L26 80L38 62H28L44 38H34L56 10H52Z"
        fill="rgba(255, 255, 255, 0.4)"
      />
    </svg>
  );
}

const ICON_PRESETS = [
  { id: 'shield_volt', name: 'Aegis Lightning Shield ⚡', icon: ShieldVoltIcon, category: 'Supreme Armor', vibe: 'Hexagonal defense armor sliced by mecha thunderbolt' },
  { id: 'mecha_volt', name: 'Mecha Cyber Bolt', icon: MechaVoltIcon, category: 'Streetwear Volt', vibe: 'Chamfered 3D bevels, mechanical notches & street shadow' },
  { id: 'serrated_bolt', name: 'Serrated Overdrive Bolt', icon: SerratedStreetBoltIcon, category: 'Streetwear Volt', vibe: 'Triple-tier aggressive lightning with inner core' },
  { id: 'glitch_volt', name: 'Cyber Glitch Bolt', icon: GlitchVoltIcon, category: 'Cyberpunk', vibe: 'Matrix split data lines & chromatic aberration shift' },
  { id: 'medal', name: 'Honor Medal Ribbon', icon: MedalRibbonIcon, category: 'Military & Glory', vibe: 'Daily Verdict discipline badge & victory star' },
  { id: 'flame', name: 'Inferno Flame', icon: Flame, category: 'Energy & Heat', vibe: 'Raw streak momentum & intensity' },
  { id: 'crown', name: 'Godmode Crown', icon: Crown, category: 'Dominance', vibe: 'Peak 5-star daily mastery' },
  { id: 'skull', name: 'Streetwear Skull', icon: Skull, category: 'Chaos & Trench', vibe: '1★ Cooked Goblin & combat resilience' },
  { id: 'crosshair', name: 'Tactical Crosshair', icon: Crosshair, category: 'Focus', vibe: 'Sniper dialed-in productivity' },
  { id: 'swords', name: 'Gladiator Swords', icon: Swords, category: 'Combat', vibe: 'Trench survivor fighting friction' },
  { id: 'target', name: 'Bullseye Target', icon: Target, category: 'Focus', vibe: 'Hit vs Shit daily verdict hunter' },
  { id: 'terminal', name: 'Hacker Terminal', icon: Terminal, category: 'Cyberpunk', vibe: 'Forensic OS & habit diagnostics' },
  { id: 'ghost', name: 'Phantasm Ghost', icon: Ghost, category: 'Chaos & Trench', vibe: 'Late night 3:45 AM dopamine loops' },
  { id: 'shield', name: 'Aegis Shield', icon: ShieldCheck, category: 'Dominance', vibe: 'Held the line & defense unbroken' },
  { id: 'cpu', name: 'Cyber Matrix Core', icon: Cpu, category: 'Cyberpunk', vibe: 'High-velocity neural execution' },
  { id: 'activity', name: 'Pulse Waveform', icon: Activity, category: 'Energy & Heat', vibe: 'Daily momentum telemetry' },
  { id: 'compass', name: 'Stoic Compass', icon: Compass, category: 'Focus', vibe: 'True north discipline over motivation' },
  { id: 'gem', name: 'Diamond Relic', icon: Gem, category: 'Dominance', vibe: 'Rare, unbreakable daily consistency' },
  { id: 'eye', name: 'Forensic Eye', icon: Eye, category: 'Focus', vibe: 'Brutally honest habit surveillance' },
  { id: 'radio', name: 'Rebel Transmitter', icon: Radio, category: 'Cyberpunk', vibe: 'Underground accountability broadcast' }
];

import AestheticCardExportModal from './AestheticCardExportModal';
import AestheticCardVariantDeepseek from './AestheticCardVariantDeepseek';

export default function IconLab({ onBack }) {
  const [activeLabTab, setActiveLabTab] = useState('wallpaper'); // Default to wallpaper tab per user request!
  const [selectedStudioDesign, setSelectedStudioDesign] = useState('darkroom'); // 'darkroom' | 'deepseek'
  const [isWallpaperModalOpen, setIsWallpaperModalOpen] = useState(false);
  const [selectedIconId, setSelectedIconId] = useState('shield_volt');
  const [customSvgInput, setCustomSvgInput] = useState('');
  const [iconColor, setIconColor] = useState('#FDC800');
  const [bgColor, setBgColor] = useState('#000000');
  const [strokeWidth, setStrokeWidth] = useState(2.5);
  const [copied, setCopied] = useState(false);

  const selectedPreset = ICON_PRESETS.find(i => i.id === selectedIconId) || ICON_PRESETS[0];
  const IconComponent = selectedPreset.icon;

  const handleCopySvg = () => {
    const svgCode = `<svg xmlns="http://www.w3.org/2000/svg" width="192" height="192" viewBox="0 0 192 192">
  <rect width="192" height="192" rx="44" fill="${bgColor}" stroke="#000000" stroke-width="8"/>
  <!-- Icon centered with ${iconColor} -->
</svg>`;
    navigator.clipboard.writeText(customSvgInput || svgCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#FFFDF5] text-black font-sans p-4 sm:p-8 selection:bg-[#FDC800]">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-3 border-black pb-5 gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack || (() => window.history.back())}
              className="p-2.5 rounded-2xl bg-white hover:bg-[#FDC800] border-3 border-black shadow-[3px_3px_0px_#000000] cursor-pointer active:scale-95 transition-all flex items-center gap-1.5 font-display font-black text-xs uppercase"
            >
              <ArrowLeft className="w-4 h-4 stroke-[3]" />
              <span>BACK TO APP</span>
            </button>
            <div>
              <h1 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight">
                🧪 Experimental Studio & Lab
              </h1>
              <p className="text-xs font-mono text-neutral-600">
                Live sandbox for PWA App Icons, SVGs, and Wallpaper / Story Poster layouts.
              </p>
            </div>
          </div>

          {/* Tab Selector */}
          <div className="flex items-center p-1 bg-neutral-200 border-2 border-black rounded-2xl shadow-[2px_2px_0px_#000000]">
            <button
              type="button"
              onClick={() => setActiveLabTab('icons')}
              className={`px-3.5 py-1.5 rounded-xl font-display font-black text-xs uppercase cursor-pointer transition-all ${
                activeLabTab === 'icons'
                  ? 'bg-[#FDC800] text-black border-2 border-black shadow-[1.5px_1.5px_0px_#000000]'
                  : 'text-neutral-700 hover:text-black border-2 border-transparent'
              }`}
            >
              ⚡ APP ICONS & SVG
            </button>
            <button
              type="button"
              onClick={() => setActiveLabTab('wallpaper')}
              className={`px-3.5 py-1.5 rounded-xl font-display font-black text-xs uppercase cursor-pointer transition-all ${
                activeLabTab === 'wallpaper'
                  ? 'bg-[#00E599] text-black border-2 border-black shadow-[1.5px_1.5px_0px_#000000]'
                  : 'text-neutral-700 hover:text-black border-2 border-transparent'
              }`}
            >
              🖼️ WALLPAPER STUDIO
            </button>
          </div>
        </div>

        {/* TAB 1: ICONS & SVG */}
        {activeLabTab === 'icons' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT: Live Phone & App Icon Mockup Preview (5 Cols) */}
            <div className="lg:col-span-5 space-y-5">
              <div className="bg-white border-3 border-black rounded-3xl p-6 shadow-[6px_6px_0px_#000000] space-y-6">
                <div className="flex items-center justify-between border-b-2 border-black/10 pb-3">
                  <span className="font-display font-black text-sm uppercase">📱 Live PWA Mockup Preview</span>
                  <span className="text-xs font-mono px-2 py-0.5 bg-neutral-100 rounded-lg font-bold">192 × 192</span>
                </div>

                {/* Mobile Phone Mockup */}
                <div className="bg-neutral-900 border-3 border-black rounded-3xl p-5 shadow-[4px_4px_0px_#000000] text-center space-y-4">
                  <div className="text-xs font-mono text-neutral-400">Android / iOS Home Screen Card</div>
                  
                  <div className="flex items-center justify-center py-4">
                    {/* PWA App Icon Box */}
                    <div
                      className="w-24 h-24 rounded-3xl border-3 border-black flex items-center justify-center shadow-[4px_4px_0px_rgba(0,0,0,0.5)] transition-all duration-200"
                      style={{ backgroundColor: bgColor }}
                    >
                      {customSvgInput ? (
                        <div
                          className="w-14 h-14 flex items-center justify-center"
                          dangerouslySetInnerHTML={{ __html: customSvgInput }}
                        />
                      ) : (
                        <IconComponent
                          className="w-14 h-14 transition-all"
                          style={{ color: iconColor, strokeWidth }}
                        />
                      )}
                    </div>
                  </div>

                  <div className="font-display font-black text-white text-sm tracking-wide">
                    SHIT OR HIT
                  </div>
                  <div className="text-[11px] font-mono text-neutral-400">
                    {selectedPreset.name} • {selectedPreset.vibe}
                  </div>
                </div>

                {/* Color & Stroke Customizers */}
                <div className="space-y-4 pt-2">
                  <div className="font-display font-black text-xs uppercase text-neutral-700">🎨 Live Icon Calibration</div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-mono font-bold block mb-1">ICON COLOR</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={iconColor}
                          onChange={(e) => setIconColor(e.target.value)}
                          className="w-8 h-8 rounded-lg border-2 border-black cursor-pointer p-0"
                        />
                        <span className="font-mono text-xs font-bold">{iconColor}</span>
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-mono font-bold block mb-1">BACKGROUND</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={bgColor}
                          onChange={(e) => setBgColor(e.target.value)}
                          className="w-8 h-8 rounded-lg border-2 border-black cursor-pointer p-0"
                        />
                        <span className="font-mono text-xs font-bold">{bgColor}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-[11px] font-mono font-bold mb-1">
                      <span>STROKE THICKNESS</span>
                      <span>{strokeWidth}px</span>
                    </div>
                    <input
                      type="range"
                      min="1.5"
                      max="3.5"
                      step="0.5"
                      value={strokeWidth}
                      onChange={(e) => setStrokeWidth(Number(e.target.value))}
                      className="w-full cursor-pointer accent-[#FDC800]"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={handleCopySvg}
                    className="flex-1 py-3 bg-[#00E599] hover:bg-[#00F0A0] text-black font-display font-black text-xs uppercase rounded-2xl border-2 border-black shadow-[3px_3px_0px_#000000] cursor-pointer flex items-center justify-center gap-1.5 transition-all active:scale-95"
                  >
                    {copied ? <Check className="w-4 h-4 stroke-[3]" /> : <Copy className="w-4 h-4 stroke-[2.5]" />}
                    <span>{copied ? 'COPIED TO CLIPBOARD!' : 'COPY SVG CODE'}</span>
                  </button>
                </div>
              </div>

              {/* Custom SVG Paste Playground */}
              <div className="bg-white border-3 border-black rounded-3xl p-5 shadow-[4px_4px_0px_#000000] space-y-3">
                <div className="font-display font-black text-xs uppercase flex items-center justify-between">
                  <span>📥 Paste External SVG Code</span>
                  {customSvgInput && (
                    <button
                      type="button"
                      onClick={() => setCustomSvgInput('')}
                      className="text-[10px] font-mono text-red-600 underline cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <textarea
                  value={customSvgInput}
                  onChange={(e) => setCustomSvgInput(e.target.value)}
                  placeholder="Paste your raw <svg>...</svg> code here to preview it live in the phone mockup above..."
                  className="w-full h-24 p-3 bg-neutral-50 border-2 border-black rounded-xl font-mono text-[11px] outline-none focus:bg-white resize-none"
                />
                <p className="text-[10px] font-mono text-neutral-500">
                  Tip: Any valid SVG path or XML string will be rendered automatically.
                </p>
              </div>
            </div>

            {/* RIGHT: Curated Streetwear Vault (7 Cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-white border-3 border-black rounded-3xl p-6 shadow-[6px_6px_0px_#000000] space-y-5">
                <div className="flex items-center justify-between border-b-2 border-black/10 pb-3">
                  <div>
                    <h3 className="font-display font-black text-base uppercase">Curated Streetwear Icon Vault</h3>
                    <p className="text-xs font-mono text-neutral-500">Click any icon to test it inside the live PWA mockup</p>
                  </div>
                  <span className="px-2.5 py-1 bg-black text-[#FDC800] rounded-xl font-mono text-xs font-black">
                    {ICON_PRESETS.length} ICONS
                  </span>
                </div>

                {/* Grid of Icons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[560px] overflow-y-auto pr-1">
                  {ICON_PRESETS.map((item) => {
                    const Icon = item.icon;
                    const isSelected = selectedIconId === item.id && !customSvgInput;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setSelectedIconId(item.id);
                          setCustomSvgInput('');
                        }}
                        className={`p-3.5 rounded-2xl border-2 border-black text-left cursor-pointer transition-all flex flex-col justify-between gap-3 ${
                          isSelected
                            ? 'bg-[#FDC800] text-black shadow-[3px_3px_0px_#000000] translate-y-[-2px]'
                            : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-800'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center border-2 border-black">
                            <Icon className="w-5 h-5 text-[#FDC800] stroke-[2.5]" />
                          </div>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/70 border border-black font-bold">
                            {item.category}
                          </span>
                        </div>

                        <div>
                          <div className="font-display font-black text-xs uppercase leading-tight">
                            {item.name}
                          </div>
                          <div className="text-[10px] font-mono text-neutral-600 truncate mt-0.5">
                            {item.vibe}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* TAB 2: WALLPAPER STUDIO SANDBOX */}
        {activeLabTab === 'wallpaper' && (
          <div className="space-y-6">
            
            {/* Top Action Bar */}
            <div className="bg-neutral-900 border-3 border-black rounded-3xl p-6 text-white shadow-[6px_6px_0px_#000000] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#00E599] animate-pulse" />
                    <h3 className="font-display font-black text-lg uppercase tracking-tight text-white">
                      🖼️ Wallpaper & Poster Studio Multi-Design Arena
                    </h3>
                  </div>
                  <p className="text-xs font-mono text-neutral-400 mt-1">
                    Compare different layout designs (Darkroom Studio vs DeepSeek Soft Glass) live in the browser.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsWallpaperModalOpen(true)}
                  className="w-full sm:w-auto px-6 py-3.5 bg-[#00E599] hover:bg-[#00F0A0] text-black font-display font-black text-xs uppercase rounded-2xl border-2 border-black shadow-[3px_3px_0px_#000000] cursor-pointer flex items-center justify-center gap-2 transition-all active:scale-95 shrink-0"
                >
                  <Sparkles className="w-4 h-4 stroke-[3]" />
                  <span>🚀 LAUNCH {selectedStudioDesign === 'darkroom' ? 'DARKROOM' : 'DEEPSEEK'} MODAL</span>
                </button>
              </div>

              {/* Design Selector Pill Strip */}
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/10">
                <span className="text-xs font-mono font-bold text-neutral-400">ACTIVE DESIGN VARIANT:</span>
                
                <button
                  type="button"
                  onClick={() => setSelectedStudioDesign('darkroom')}
                  className={`px-3.5 py-1.5 rounded-xl font-display font-black text-xs uppercase cursor-pointer transition-all ${
                    selectedStudioDesign === 'darkroom'
                      ? 'bg-[#FDC800] text-black border-2 border-black shadow-[2px_2px_0px_#000000]'
                      : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
                  }`}
                >
                  🌌 DESIGN 1: DARKROOM STUDIO (CYBERPUNK / EDITORIAL)
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedStudioDesign('deepseek')}
                  className={`px-3.5 py-1.5 rounded-xl font-display font-black text-xs uppercase cursor-pointer transition-all ${
                    selectedStudioDesign === 'deepseek'
                      ? 'bg-[#00E599] text-black border-2 border-black shadow-[2px_2px_0px_#000000]'
                      : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
                  }`}
                >
                  💎 DESIGN 2: DEEPSEEK SOFT FROSTED GLASS
                </button>
              </div>
            </div>

            {/* Design Comparison Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Card 1: Darkroom Studio */}
              <div className={`bg-white border-3 border-black rounded-3xl p-6 shadow-[5px_5px_0px_#000000] space-y-4 flex flex-col justify-between ${
                selectedStudioDesign === 'darkroom' ? 'ring-4 ring-[#FDC800]' : 'opacity-85'
              }`}>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-black text-black bg-[#FDC800] px-2.5 py-0.5 rounded-md border border-black">
                      DESIGN 01
                    </span>
                    {selectedStudioDesign === 'darkroom' && (
                      <span className="text-xs font-mono font-bold text-[#00E599] bg-black px-2 py-0.5 rounded-md">
                        ✓ SELECTED
                      </span>
                    )}
                  </div>
                  <h4 className="font-display font-black text-base uppercase">🌌 Darkroom Masterpiece Studio</h4>
                  <p className="text-xs font-mono text-neutral-600 leading-relaxed">
                    High-contrast darkroom environment with ambient neon radial glows, segmented seamless controls, live 1080p canvas engine, and lossless PNG export dock.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedStudioDesign('darkroom');
                    setIsWallpaperModalOpen(true);
                  }}
                  className="w-full py-3 bg-neutral-900 hover:bg-black text-white font-display font-black text-xs uppercase rounded-xl border-2 border-black shadow-[2px_2px_0px_#000000] cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>TEST DESIGN 1 (DARKROOM)</span>
                </button>
              </div>

              {/* Card 2: DeepSeek Design */}
              <div className={`bg-white border-3 border-black rounded-3xl p-6 shadow-[5px_5px_0px_#000000] space-y-4 flex flex-col justify-between ${
                selectedStudioDesign === 'deepseek' ? 'ring-4 ring-[#00E599]' : 'opacity-85'
              }`}>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-black text-black bg-[#00E599] px-2.5 py-0.5 rounded-md border border-black">
                      DESIGN 02
                    </span>
                    {selectedStudioDesign === 'deepseek' && (
                      <span className="text-xs font-mono font-bold text-[#00E599] bg-black px-2 py-0.5 rounded-md">
                        ✓ SELECTED
                      </span>
                    )}
                  </div>
                  <h4 className="font-display font-black text-base uppercase">💎 DeepSeek Soft Frosted Glass</h4>
                  <p className="text-xs font-mono text-neutral-600 leading-relaxed">
                    Lightweight pill navigation, glassmorphic frosted cards, responsive device mockup border, and streamlined theme switching.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedStudioDesign('deepseek');
                    setIsWallpaperModalOpen(true);
                  }}
                  className="w-full py-3 bg-[#00E599] hover:bg-[#00F0A0] text-black font-display font-black text-xs uppercase rounded-xl border-2 border-black shadow-[2px_2px_0px_#000000] cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>TEST DESIGN 2 (DEEPSEEK)</span>
                </button>
              </div>

            </div>

            {/* Render the Active Modal Design */}
            {selectedStudioDesign === 'darkroom' ? (
              <AestheticCardExportModal
                isOpen={isWallpaperModalOpen}
                onClose={() => setIsWallpaperModalOpen(false)}
                entries={{
                  [new Date().toISOString().slice(0, 10)]: {
                    rating: 5,
                    notes: 'Crushed the daily workout, 4 hours deep work, finished AI integrations.'
                  }
                }}
                dateStr={new Date().toISOString().slice(0, 10)}
                dayCount={8}
                startDate="2026-08-20"
                displayName="Daily Operator"
              />
            ) : (
              <AestheticCardVariantDeepseek
                isOpen={isWallpaperModalOpen}
                onClose={() => setIsWallpaperModalOpen(false)}
                entries={{
                  [new Date().toISOString().slice(0, 10)]: {
                    rating: 5,
                    notes: 'Crushed the daily workout, 4 hours deep work, finished AI integrations.'
                  }
                }}
                dateStr={new Date().toISOString().slice(0, 10)}
                dayCount={8}
                startDate="2026-08-20"
                displayName="Daily Operator"
              />
            )}

          </div>
        )}

      </div>
    </div>
  );
}
