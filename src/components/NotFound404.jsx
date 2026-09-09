import React, { useState, useEffect } from 'react';
import { Home, Calendar, Sparkles, ArrowLeft } from 'lucide-react';
import Blob3DCanvas from './Blob3DCanvas';
import { soundEngine } from '../services/soundEngine';

const BLOB_THEMES = [
  {
    id: 'cyan',
    name: 'Electric Cyan ("SY-an")',
    base: '#00FFFF',
    highlight: '#E0FFFF',
    shadow: '#008B8B',
    deepShadow: '#003B46',
    glow: 'rgba(0, 255, 255, 0.28)',
    blush: 'rgba(0, 255, 255, 0.45)',
  },
  {
    id: 'violet',
    name: 'Void Violet',
    base: '#8B5CF6',
    highlight: '#DDD6FE',
    shadow: '#6D28D9',
    deepShadow: '#2E1065',
    glow: 'rgba(139, 92, 246, 0.28)',
    blush: 'rgba(196, 181, 253, 0.45)',
  },
  {
    id: 'emerald',
    name: 'Emerald Hit',
    base: '#00E599',
    highlight: '#A7F3D0',
    shadow: '#059669',
    deepShadow: '#064E3B',
    glow: 'rgba(0, 229, 153, 0.28)',
    blush: 'rgba(110, 231, 183, 0.45)',
  },
  {
    id: 'gold',
    name: 'Solar Gold',
    base: '#FDC800',
    highlight: '#FEF08A',
    shadow: '#D97706',
    deepShadow: '#78350F',
    glow: 'rgba(253, 200, 0, 0.28)',
    blush: 'rgba(253, 224, 71, 0.45)',
  },
  {
    id: 'coral',
    name: 'Neon Coral',
    base: '#FF4D4D',
    highlight: '#FECACA',
    shadow: '#DC2626',
    deepShadow: '#7F1D1D',
    glow: 'rgba(255, 77, 77, 0.28)',
    blush: 'rgba(248, 113, 113, 0.45)',
  },
];

const TRICKY_QUIPS = [
  "Poke the jelly blob to probe the temporal disturbance...",
  "Hey! Don't take your 404 frustration out on me, you typed the URL! 😅",
  "⚠️ Paradox Detected: If a day is never recorded, does it judge you in secret?",
  "Analyzing cursor trajectory... Verdict: 100% lost, but 100% aesthetic.",
  "Quantum Verdict: This day is simultaneously a Hit and a Shit until observed.",
  "Stop poking! The 'Return to Today' button is literally right below me!",
  "Are you truly lost, or are you just avoiding logging today's verdict? 🤔",
  "🎉 Secret Unlocked: Master of Procrastination in the 4th Dimension!",
];

export default function NotFound404({ onGoHome, onGoTimeline }) {
  const [activeTheme, setActiveTheme] = useState(BLOB_THEMES[0]);
  const [pokeCount, setPokeCount] = useState(0);
  const [confetti, setConfetti] = useState([]);

  const currentQuip = TRICKY_QUIPS[Math.min(pokeCount, TRICKY_QUIPS.length - 1)];
  const reachedSecret = pokeCount >= TRICKY_QUIPS.length - 1;

  const handlePoke = () => {
    setPokeCount((prev) => prev + 1);
    soundEngine.playClick();
  };

  const handleSelectTheme = (theme) => {
    setActiveTheme(theme);
    soundEngine.playClick();
  };

  // Small confetti burst the moment the person unlocks the last quip.
  useEffect(() => {
    if (pokeCount === TRICKY_QUIPS.length - 1) {
      const pieces = Array.from({ length: 26 }, (_, i) => ({
        id: `${Date.now()}-${i}`,
        left: Math.random() * 100,
        color: BLOB_THEMES[Math.floor(Math.random() * BLOB_THEMES.length)].base,
        delay: Math.random() * 300,
        duration: 1400 + Math.random() * 900,
      }));
      setConfetti(pieces);
      const timer = setTimeout(() => setConfetti([]), 2600);
      return () => clearTimeout(timer);
    }
  }, [pokeCount]);

  return (
    <div className="relative min-h-screen bg-[#FFFDF5] text-black font-sans flex flex-col justify-between p-4 md:p-8 overflow-hidden">
      {/* Local keyframes for the quip transition, confetti fall, and nudge cue */}
      <style>{`
        @keyframes quipIn {
          0% { opacity: 0; transform: translateY(4px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .quip-enter { animation: quipIn 260ms ease-out; }

        @keyframes confettiFall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(540deg); opacity: 0; }
        }
        .confetti-piece {
          animation-name: confettiFall;
          animation-timing-function: ease-in;
          animation-fill-mode: forwards;
        }

        @keyframes nudgeCue {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        .nudge-cue { animation: nudgeCue 1.6s ease-in-out infinite; }
      `}</style>

      {/* Faint dot-grid texture, purely decorative */}
      <div
        className="pointer-events-none fixed inset-0 -z-10 opacity-[0.35]"
        style={{ backgroundImage: 'radial-gradient(circle, #00000022 1px, transparent 1px)', backgroundSize: '22px 22px' }}
        aria-hidden="true"
      />

      {/* Confetti overlay, fires once when the last quip unlocks */}
      {confetti.length > 0 && (
        <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden" aria-hidden="true">
          {confetti.map((c) => (
            <span
              key={c.id}
              className="absolute top-[-10px] w-2.5 h-2.5 rounded-sm border border-black confetti-piece"
              style={{
                left: `${c.left}%`,
                backgroundColor: c.color,
                animationDelay: `${c.delay}ms`,
                animationDuration: `${c.duration}ms`,
              }}
            />
          ))}
        </div>
      )}

      {/* Top Header Bar */}
      <header className="max-w-5xl w-full mx-auto flex items-center justify-between py-2 border-b-2 border-black pb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 border-2 border-black rounded-xl shadow-[3px_3px_0px_#000000] flex items-center justify-center font-black text-xl transition-colors duration-500"
            style={{ backgroundColor: activeTheme.base }}
          >
            ⚡
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black uppercase tracking-wider font-display">
              Shit Or Hit
            </h1>
            <p className="text-xs font-mono font-bold text-neutral-600">Daily Life Verdict Tracker</p>
          </div>
        </div>

        <button
          onClick={onGoHome}
          className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-black rounded-xl shadow-[3px_3px_0px_#000000] hover:shadow-[5px_5px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] font-bold text-xs uppercase cursor-pointer transition-all"
        >
          <ArrowLeft size={16} />
          <span>Back to App</span>
        </button>
      </header>

      {/* Main 404 Stage */}
      <main className="max-w-3xl w-full mx-auto my-8 flex flex-col items-center text-center">
        {/* Error Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#FF4D4D] text-white border-2 border-black rounded-full shadow-[3px_3px_0px_#000000] font-mono text-xs font-black uppercase tracking-widest mb-4">
          <span className="w-2 h-2 rounded-full bg-white animate-ping" />
          HTTP 404 • Lost in the Verdict Void
        </div>

        <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight font-display mb-3">
          Day Not Found
        </h2>

        {/* Tricky Mind-Bending Message */}
        <div className="max-w-xl mx-auto space-y-2 mb-6">
          <p className="text-sm md:text-base font-mono text-neutral-800 font-bold leading-relaxed">
            Did this day never exist, or did your verdict collapse the continuum? You've stumbled into the unrecorded space between yesterday's hit and tomorrow's shit.
          </p>
          <p className="text-xs font-mono text-neutral-600 bg-[#FFFDF5] border border-neutral-300 rounded-lg p-2 inline-block">
            🔮 <span className="font-bold">Void Paradox:</span> If time never stops, why did this page? (Watch out: the 3D jelly sentinel is tracking your cursor's every hesitation.)
          </p>
        </div>

        {/* 3D Interactive Canvas Container */}
        <div className="relative p-6 bg-white border-2 border-black rounded-3xl shadow-[6px_6px_0px_#000000] mb-6 flex flex-col items-center">
          <Blob3DCanvas
            width={380}
            height={320}
            baseColor={activeTheme.base}
            highlightColor={activeTheme.highlight}
            shadowColor={activeTheme.shadow}
            deepShadowColor={activeTheme.deepShadow}
            glowColor={activeTheme.glow}
            blushColor={activeTheme.blush}
            onPoke={handlePoke}
          />

          {/* Color Palettes Switcher */}
          <div className="mt-4 pt-4 border-t-2 border-black w-full flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-neutral-600">
              <Sparkles size={14} className="text-[#FDC800]" />
              <span>Blob Essence:</span>
            </div>
            <div className="flex items-center gap-2">
              {BLOB_THEMES.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => handleSelectTheme(theme)}
                  title={theme.name}
                  aria-label={`Switch blob theme to ${theme.name}`}
                  style={{ backgroundColor: theme.base }}
                  className={`w-7 h-7 rounded-full border-2 border-black cursor-pointer transition-transform ${
                    activeTheme.id === theme.id
                      ? 'scale-125 shadow-[2px_2px_0px_#000000] ring-2 ring-black'
                      : 'hover:scale-110 opacity-80'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Interactive Tricky Quip Bubble — re-animates in on every new quip */}
        <div className="w-full max-w-md my-4 p-3 bg-white border-2 border-black rounded-2xl shadow-[3px_3px_0px_#000000] flex items-center gap-3">
          <span className="text-xl select-none">💬</span>
          <p key={pokeCount} className="quip-enter text-xs font-mono font-bold text-neutral-800 text-left leading-relaxed">
            {currentQuip}
          </p>
        </div>

        {/* Quick Action Navigation Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 w-full max-w-md">
          <button
            onClick={onGoHome}
            className={`flex-1 min-w-[200px] flex items-center justify-center gap-2 px-6 py-3.5 bg-[#FDC800] border-2 border-black rounded-2xl shadow-[4px_4px_0px_#000000] hover:shadow-[6px_6px_0px_#000000] hover:-translate-y-0.5 active:translate-x-[2px] active:translate-y-[2px] font-black uppercase text-sm tracking-wide cursor-pointer transition-all ${
              pokeCount >= 6 && !reachedSecret ? 'nudge-cue' : ''
            }`}
          >
            <Home size={18} />
            <span>Return to Today</span>
          </button>

          <button
            onClick={onGoTimeline}
            className="flex-1 min-w-[180px] flex items-center justify-center gap-2 px-6 py-3.5 bg-white border-2 border-black rounded-2xl shadow-[4px_4px_0px_#000000] hover:shadow-[6px_6px_0px_#000000] hover:-translate-y-0.5 active:translate-x-[2px] active:translate-y-[2px] font-black uppercase text-sm tracking-wide cursor-pointer transition-all"
          >
            <Calendar size={18} />
            <span>Open Timeline</span>
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-5xl w-full mx-auto text-center py-4 border-t-2 border-black text-xs font-mono text-neutral-500">
        Shit-or-Hit v1.0.0 • 100% Offline-First Verdict Engine • Built with React 18 & HTML5 3D Canvas
      </footer>
    </div>
  );
}
