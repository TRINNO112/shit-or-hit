import React, { useState } from 'react';
import {
  Flame, Crown, Skull, Crosshair, Swords, Target, Terminal,
  Zap, Sparkles, Ghost, ShieldAlert, Cpu, Activity,
  Compass, ShieldCheck, Trophy, Radio, Gem, Eye,
  Layers, Check, Copy, ArrowLeft, Download, RefreshCw
} from 'lucide-react';

const ICON_PRESETS = [
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

export default function IconLab({ onBack }) {
  const [selectedIconId, setSelectedIconId] = useState('flame');
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
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Top Header */}
        <div className="flex items-center justify-between border-b-3 border-black pb-5">
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
                🧪 Icon Laboratory & PWA Testing Ground
              </h1>
              <p className="text-xs font-mono text-neutral-600">
                Explore custom streetwear icons, live mockups, and test your own SVG code.
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <span className="px-3 py-1 bg-black text-[#FDC800] font-mono text-xs font-black rounded-xl border-2 border-black">
              ROUTE: /?view=icons
            </span>
          </div>
        </div>

        {/* 2-Column Lab Studio */}
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
                  className="flex-1 py-3 bg-[#00E599] hover:bg-emerald-400 text-black font-display font-black text-xs uppercase rounded-2xl border-3 border-black shadow-[3px_3px_0px_#000000] cursor-pointer active:scale-98 flex items-center justify-center gap-2"
                >
                  {copied ? <Check className="w-4 h-4 stroke-[3]" /> : <Copy className="w-4 h-4 stroke-[3]" />}
                  <span>{copied ? 'COPIED TO CLIPBOARD!' : 'COPY SVG CODE'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT: Curated Icon Gallery & Custom SVG Code Tester (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Custom SVG Paste Playground */}
            <div className="bg-white border-3 border-black rounded-3xl p-5 sm:p-6 shadow-[6px_6px_0px_#000000] space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-black text-base uppercase">
                  📥 Paste Your Downloaded SVG
                </h3>
                {customSvgInput && (
                  <button
                    type="button"
                    onClick={() => setCustomSvgInput('')}
                    className="text-xs font-mono font-bold text-red-600 underline cursor-pointer"
                  >
                    Clear Custom SVG
                  </button>
                )}
              </div>
              <p className="text-xs font-mono text-neutral-600">
                Downloaded an SVG from SVG Repo or Tabler Icons? Paste its raw code here to see it live-rendered in our PWA frame!
              </p>
              <textarea
                value={customSvgInput}
                onChange={(e) => setCustomSvgInput(e.target.value)}
                placeholder='<svg viewBox="0 0 24 24" ...> ... </svg>'
                rows={3}
                className="w-full bg-neutral-50 border-2 border-black rounded-xl p-3 font-mono text-xs text-black focus:outline-none focus:bg-white"
              />
            </div>

            {/* Curated Streetwear & Cyberpunk Icon Vault */}
            <div className="bg-white border-3 border-black rounded-3xl p-5 sm:p-6 shadow-[6px_6px_0px_#000000] space-y-4">
              <div className="flex items-center justify-between border-b-2 border-black/10 pb-3">
                <div>
                  <h3 className="font-display font-black text-base uppercase">
                    ⚡ Curated Streetwear Icon Vault
                  </h3>
                  <span className="text-xs font-mono text-neutral-600">
                    Click any icon to test in the live PWA mobile frame
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
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

      </div>
    </div>
  );
}
