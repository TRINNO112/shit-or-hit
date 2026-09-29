import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Download, Smartphone, Monitor, Square, Check, Eye } from 'lucide-react';
import { soundEngine } from '../services/soundEngine';

/* ------------------------------------------------------------------
   VERDICT DIAL — a year is not a calendar, it's a verdict.
   365 spokes around a dial. Spoke LENGTH = how good the day was.
   Tall spikes = HIT days. Stubs = SHIT days. Your year becomes a
   sunburst / heartbeat that is unique to you. Same shape language as
   the app's radial clock.
------------------------------------------------------------------- */

const MONTH_SHORT = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

const FONT_D = '"Cabinet Grotesk","Plus Jakarta Sans",Impact,sans-serif';
const FONT_M = '"JetBrains Mono",ui-monospace,monospace';

const TIERS = {
  1: { color: '#FF4D4D', emoji: '👺', name: 'ROUGH' },
  2: { color: '#FF8A00', emoji: '🧟', name: 'DOWN' },
  3: { color: '#94A3B8', emoji: '🦥', name: 'OKAY' },
  4: { color: '#00E599', emoji: '⚡', name: 'GOOD' },
  5: { color: '#FDC800', emoji: '👑', name: 'PEAK' },
};

const THEMES = {
  cream: { id: 'cream', name: 'Neo-Gold', bg: '#FFFDF5', card: '#FFFFFF', border: '#000000', shadow: '#000000', text: '#000000', sub: '#4B5563', accent: '#FDC800', empty: '#D9DEE6', future: '#E9EDF2', light: true },
  darkroom: { id: 'darkroom', name: 'Cyberpunk', bg: '#0A0D14', card: '#111726', border: '#1E293B', shadow: 'rgba(0,0,0,0.85)', text: '#F8FAFC', sub: '#94A3B8', accent: '#00E599', empty: '#263047', future: '#151C2C' },
  monolith: { id: 'monolith', name: 'Monolith', bg: '#050505', card: '#0D0D0D', border: '#2A2A2A', shadow: 'rgba(0,0,0,0.95)', text: '#FFFFFF', sub: '#737373', accent: '#FDC800', empty: '#262626', future: '#111111' },
  sunset: { id: 'sunset', name: 'Tokyo Sunset', bg: '#120917', card: '#1E1026', border: '#381E48', shadow: 'rgba(0,0,0,0.9)', text: '#FFFFFF', sub: '#A892B7', accent: '#FF4D6D', empty: '#3A2148', future: '#1A0D22' },
};

const yearArchetype = (ratio) =>
  ratio >= 70 ? { emoji: '👑', name: 'GOD MODE YEAR' }
    : ratio >= 50 ? { emoji: '⚡', name: 'FLOW WARRIOR YEAR' }
      : ratio >= 35 ? { emoji: '🦥', name: 'STOIC SUSTAINER YEAR' }
        : { emoji: '👺', name: 'TRENCH SURVIVOR YEAR' };

export default function YearInPixelsWallpaperEngine({ userEntries = {} }) {
  const canvasRef = useRef(null);
  const [selectedFormat, setSelectedFormat] = useState('phone');
  const [selectedTheme, setSelectedTheme] = useState('cream');
  const [useDemoData, setUseDemoData] = useState(() => Object.keys(userEntries).length === 0);
  const [targetYear, setTargetYear] = useState(() => new Date().getFullYear());
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // ---------- Data ----------
  const yearData = useMemo(() => {
    const isLeap = (targetYear % 4 === 0 && targetYear % 100 !== 0) || targetYear % 400 === 0;
    const now = new Date();
    const cy = now.getFullYear(), cm = now.getMonth(), cd = now.getDate();

    let totalLogged = 0, totalHits = 0, longestStreak = 0, streak = 0;
    const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    const months = [];
    const days = [];

    for (let m = 0; m < 12; m++) {
      const dim = new Date(targetYear, m + 1, 0).getDate();
      let mLogged = 0, mHits = 0;
      const monthStart = days.length;

      for (let d = 1; d <= dim; d++) {
        const key = `${targetYear}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const isPast = targetYear < cy || (targetYear === cy && (m < cm || (m === cm && d <= cd)));
        const isToday = targetYear === cy && m === cm && d === cd;

        let rating = null;
        if (userEntries[key]?.rating) rating = Number(userEntries[key].rating);
        else if (useDemoData && isPast) {
          const seed = (m * 31 + d * 17) % 100;
          rating = seed > 50 ? 5 : seed > 25 ? 4 : seed > 12 ? 3 : seed > 4 ? 2 : 1;
        }

        if (rating) {
          totalLogged++; mLogged++;
          ratingCounts[rating]++;
          if (rating >= 4) { totalHits++; mHits++; streak++; longestStreak = Math.max(longestStreak, streak); }
          else streak = 0;
        }
        days.push({ rating, isPast, isToday });
      }
      months.push({
        index: m, start: monthStart, length: dim,
        logged: mLogged,
        ratio: mLogged ? Math.round((mHits / mLogged) * 100) : 0,
      });
    }

    const withData = months.filter((mo) => mo.logged > 0);
    const best = withData.length ? withData.reduce((a, b) => (b.ratio > a.ratio ? b : a)) : null;

    return {
      year: targetYear,
      days, months, ratingCounts,
      totalDays: days.length,
      totalLogged, longestStreak,
      hitRatio: totalLogged ? Math.round((totalHits / totalLogged) * 100) : 0,
      best,
    };
  }, [targetYear, userEntries, useDemoData]);

  // ---------- Canvas ----------
  const drawWallpaper = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    const th = THEMES[selectedTheme] || THEMES.cream;

    let W = 1290, H = 2796;
    if (selectedFormat === 'desktop') { W = 3840; H = 2160; }
    else if (selectedFormat === 'square') { W = 2048; H = 2048; }
    canvas.width = W; canvas.height = H;

    ctx.fillStyle = th.bg;
    ctx.fillRect(0, 0, W, H);

    // ----- helpers -----
    const rr = (x, y, w, h, r) => {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
    };

    const T = (str, x, y, size, color, o = {}) => {
      ctx.save();
      ctx.font = `${o.weight || 900} ${size}px ${o.font || FONT_D}`;
      ctx.fillStyle = color;
      ctx.textAlign = o.align || 'left';
      ctx.textBaseline = o.base || 'alphabetic';
      ctx.fillText(str, x, y);
      ctx.restore();
    };

    const card = (x, y, w, h, r, off = 8) => {
      ctx.save();
      ctx.fillStyle = th.shadow;
      rr(x + off, y + off, w, h, r); ctx.fill();
      ctx.fillStyle = th.card;
      rr(x, y, w, h, r); ctx.fill();
      ctx.strokeStyle = th.border; ctx.lineWidth = 4;
      ctx.stroke();
      ctx.restore();
    };

    // Streetwear caution tape, slightly tilted
    const tape = (x, y, w, h, deg) => {
      ctx.save();
      ctx.translate(x + w / 2, y + h / 2);
      ctx.rotate((deg * Math.PI) / 180);
      ctx.beginPath(); ctx.rect(-w / 2, -h / 2, w, h); ctx.clip();
      ctx.fillStyle = th.accent; ctx.fillRect(-w / 2, -h / 2, w, h);
      ctx.fillStyle = '#000';
      ctx.font = `900 ${h * 0.46}px ${FONT_M}`;
      ctx.textBaseline = 'middle';
      const unit = 'HIT OR SHIT  ///  NO EXCUSES  ///  ';
      const uw = ctx.measureText(unit).width;
      for (let tx = -w / 2 - (uw / 2); tx < w / 2; tx += uw) ctx.fillText(unit, tx, 2);
      ctx.strokeStyle = '#000'; ctx.lineWidth = 6;
      ctx.strokeRect(-w / 2, -h / 2, w, h);
      ctx.restore();
    };

    // Stacked SHIT ◀ ▶ HIT distribution bar
    const splitBar = (x, y, w, h) => {
      const total = yearData.totalLogged || 1;
      ctx.save();
      rr(x, y, w, h, h / 2); ctx.clip();
      let cx = x;
      const spans = [];
      [1, 2, 3, 4, 5].forEach((r) => {
        const sw = (yearData.ratingCounts[r] / total) * w;
        ctx.fillStyle = TIERS[r].color; ctx.fillRect(cx, y, sw, h);
        if (sw > 0 && r > 1) { ctx.fillStyle = th.card; ctx.fillRect(cx - 2, y, 4, h); }
        spans.push({ r, x: cx, w: sw });
        cx += sw;
      });
      if (!yearData.totalLogged) { ctx.fillStyle = th.empty; ctx.fillRect(x, y, w, h); }
      ctx.restore();
      ctx.save();
      ctx.strokeStyle = th.light ? '#000' : th.border; ctx.lineWidth = 4;
      rr(x, y, w, h, h / 2); ctx.stroke();
      ctx.restore();
      return spans;
    };

    const statChips = (x, y, w, h, gap) => {
      const cw = (w - gap * 2) / 3;
      const best = yearData.best;
      const items = [
        { l: 'DAYS LOGGED', v: `${yearData.totalLogged}/${yearData.totalDays}`, c: th.text },
        { l: 'HIT STREAK', v: `${yearData.longestStreak}D`, c: th.light ? '#B38F00' : th.accent },
        { l: 'BEST MONTH', v: best ? `${MONTH_SHORT[best.index]} ${best.ratio}%` : '--', c: th.light ? '#00A870' : '#00E599' },
      ];
      items.forEach((it, i) => {
        const cx = x + i * (cw + gap);
        card(cx, y, cw, h, 22, 6);
        T(it.l, cx + 26, y + h * 0.3, h * 0.15, th.sub, { font: FONT_M, weight: 800 });
        T(it.v, cx + 26, y + h * 0.78, h * 0.36, it.c);
      });
    };

    // ----- THE DIAL -----
    const drawDial = (cx, cy, R) => {
      const s = R / 480;
      const r0 = R * 0.46;
      const span = R - r0;
      const N = yearData.totalDays;
      const step = (Math.PI * 2) / N;
      const angle = (i) => -Math.PI / 2 + i * step;

      // level rings (rating 1..5). Outer ring = peak line
      [1, 2, 3, 4, 5].forEach((lv) => {
        ctx.save();
        ctx.strokeStyle = lv === 5 ? TIERS[5].color : th.sub;
        ctx.globalAlpha = lv === 5 ? 0.7 : 0.22;
        ctx.lineWidth = (lv === 5 ? 3 : 2) * s;
        ctx.setLineDash(lv === 5 ? [10 * s, 12 * s] : [3 * s, 9 * s]);
        ctx.beginPath(); ctx.arc(cx, cy, r0 + span * (lv / 5), 0, Math.PI * 2); ctx.stroke();
        ctx.restore();
      });

      const wedge = (i, rOut) => {
        const a0 = angle(i) + step * 0.1;
        const a1 = angle(i) + step * 0.9;
        ctx.beginPath();
        ctx.arc(cx, cy, rOut, a0, a1);
        ctx.arc(cx, cy, r0, a1, a0, true);
        ctx.closePath();
      };

      // spokes
      let todayIdx = -1;
      yearData.days.forEach((d, i) => {
        if (d.isToday) todayIdx = i;
        let rOut, col;
        if (d.rating) { rOut = r0 + span * (d.rating / 5); col = TIERS[d.rating].color; }
        else if (d.isPast) { rOut = r0 + span * 0.07; col = th.empty; }
        else { rOut = r0 + span * 0.035; col = th.future; }
        ctx.fillStyle = col;
        wedge(i, rOut); ctx.fill();
        if (d.rating && th.light) { ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = 1 * s; ctx.stroke(); }
      });

      // today marker: full-length ghost spoke
      if (todayIdx >= 0) {
        ctx.save();
        ctx.strokeStyle = th.light ? '#000' : th.accent; ctx.lineWidth = 3 * s;
        wedge(todayIdx, R + 10 * s); ctx.stroke();
        ctx.restore();
      }

      // month ticks + labels
      yearData.months.forEach((mo) => {
        const a = angle(mo.start);
        ctx.save();
        ctx.strokeStyle = th.sub; ctx.globalAlpha = 0.55; ctx.lineWidth = 2.5 * s;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * (R + 14 * s), cy + Math.sin(a) * (R + 14 * s));
        ctx.lineTo(cx + Math.cos(a) * (R + 34 * s), cy + Math.sin(a) * (R + 34 * s));
        ctx.stroke();
        ctx.restore();

        const am = angle(mo.start + mo.length / 2);
        T(MONTH_SHORT[mo.index],
          cx + Math.cos(am) * (R + 62 * s), cy + Math.sin(am) * (R + 62 * s),
          22 * s, th.sub, { font: FONT_M, weight: 800, align: 'center', base: 'middle' });
      });

      // center hub
      const hubR = r0 - 16 * s;
      ctx.save();
      ctx.fillStyle = th.shadow; ctx.beginPath(); ctx.arc(cx + 7 * s, cy + 7 * s, hubR, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = th.card; ctx.beginPath(); ctx.arc(cx, cy, hubR, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = th.light ? '#000' : th.border; ctx.lineWidth = 5 * s; ctx.stroke();
      ctx.restore();

      T(`${yearData.hitRatio}%`, cx, cy + 22 * s, 112 * s, th.text, { align: 'center', base: 'middle' });
      T('OF DAYS WERE A HIT', cx, cy + 92 * s, 17 * s, th.sub, { font: FONT_M, weight: 800, align: 'center', base: 'middle' });
      T(TIERS[yearData.hitRatio >= 50 ? 5 : 1].emoji, cx, cy - 78 * s, 56 * s, th.text, { align: 'center', base: 'middle' });
    };

    const arch = yearArchetype(yearData.hitRatio);
    const distribution = (x, y, w, h, s) => {
      T('THE VERDICT SPLIT', x + 30 * s, y + 48 * s, 24 * s, th.text, { font: FONT_M, weight: 800 });
      T('SHIT  ◀  ▶  HIT', x + w - 30 * s, y + 48 * s, 24 * s, th.sub, { font: FONT_M, weight: 800, align: 'right' });
      const spans = splitBar(x + 30 * s, y + 72 * s, w - 60 * s, 54 * s);
      spans.forEach((sp) => {
        if (sp.w < 44 * s) return;
        const c = sp.x + sp.w / 2;
        T(TIERS[sp.r].emoji, c, y + 168 * s, 34 * s, th.text, { align: 'center', base: 'middle' });
        T(`${yearData.ratingCounts[sp.r]}d`, c, y + 206 * s, 20 * s, th.sub, { font: FONT_M, weight: 800, align: 'center', base: 'middle' });
      });
    };

    // ===== PHONE =====
    if (selectedFormat === 'phone') {
      // top ~560px is reserved for the lockscreen clock
      tape(-40, 610, W + 80, 74, -2.5);
      T(`SHIT OR HIT  /  ${yearData.year}`, 70, 790, 32, th.sub, { font: FONT_M, weight: 800 });
      T(String(yearData.year), 62, 985, 250, th.text);
      T(arch.emoji, W - 70, 950, 190, th.text, { align: 'right' });
      T(arch.name, 70, 1060, 50, th.light ? '#B38F00' : th.accent);

      drawDial(W / 2, 1600, 470);

      card(60, 2215, W - 120, 230, 28, 8);
      distribution(60, 2215, W - 120, 230, 1);
      statChips(60, 2480, W - 120, 140, 24);
      T('NO CALENDAR. NO EXCUSES. JUST VERDICTS.', W / 2, 2700, 26, th.sub, { font: FONT_M, weight: 800, align: 'center' });
    }

    // ===== DESKTOP 4K =====
    else if (selectedFormat === 'desktop') {
      const L = 200;
      T(`SHIT OR HIT  /  DAILY VERDICT OS`, L, 300, 46, th.sub, { font: FONT_M, weight: 800 });
      T(String(yearData.year), L - 12, 760, 520, th.text);
      T(`${arch.emoji}  ${arch.name}`, L, 900, 96, th.light ? '#B38F00' : th.accent);

      card(L, 1010, 1500, 330, 34, 10);
      distribution(L, 1010, 1500, 330, 1.55);
      statChips(L, 1420, 1500, 240, 36);
      tape(-60, 1830, 1800, 120, -2);

      drawDial(2760, 1080, 780);
    }

    // ===== SQUARE =====
    else {
      T('SHIT OR HIT  /  DAILY VERDICT OS', 70, 96, 28, th.sub, { font: FONT_M, weight: 800 });
      T(String(yearData.year), 62, 250, 170, th.text);
      T(arch.emoji, W - 70, 235, 130, th.text, { align: 'right' });
      T(`${arch.name}  •  ${yearData.totalLogged} LOGGED  •  ${yearData.longestStreak}D HIT STREAK`, 70, 305, 28, th.light ? '#B38F00' : th.accent, { font: FONT_M, weight: 800 });

      drawDial(W / 2, 1000, 530);

      card(60, 1615, W - 120, 190, 26, 7);
      distribution(60, 1615, W - 120, 190, 0.8);
      tape(-40, 1900, W + 80, 78, -1.5);
    }
  };

  useEffect(() => {
    drawWallpaper();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFormat, selectedTheme, yearData]);

  const handleDownload = () => {
    soundEngine.playSuccess();
    setIsGenerating(true);
    setTimeout(() => {
      const canvas = canvasRef.current;
      if (canvas) {
        const link = document.createElement('a');
        link.download = `verdict_dial_${targetYear}_${selectedFormat}_${selectedTheme}.png`;
        link.href = canvas.toDataURL('image/png', 1.0);
        link.click();
        setDownloadSuccess(true);
        setTimeout(() => setDownloadSuccess(false), 2500);
      }
      setIsGenerating(false);
    }, 150);
  };

  const formats = [
    { id: 'phone', label: 'PHONE (9:19.5)', Icon: Smartphone },
    { id: 'desktop', label: '4K DESKTOP', Icon: Monitor },
    { id: 'square', label: 'SQUARE (1:1)', Icon: Square },
  ];

  return (
    <div className="bg-[#FFFDF8] border-3 border-black rounded-3xl p-5 sm:p-7 text-black shadow-[6px_6px_0px_#000000] space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-black/15 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-[#FDC800] text-black font-mono font-black text-[10px] px-2 py-0.5 border border-black uppercase shadow-[1px_1px_0px_#000000]">
              VERDICT DIAL
            </span>
            <span className="bg-black text-white font-mono font-black text-[10px] px-2 py-0.5 border border-black uppercase">
              365 SPOKES
            </span>
          </div>
          <h2 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight">
            Your Year, As A Verdict
          </h2>
          <p className="text-xs font-mono text-black/60">
            Every day is a spoke. The taller it stands, the harder you hit.
          </p>
        </div>

        <button
          type="button"
          onClick={handleDownload}
          disabled={isGenerating}
          className="px-6 py-3 bg-[#00E599] hover:bg-emerald-400 border-3 border-black rounded-2xl font-mono font-black text-xs uppercase tracking-wider text-black shadow-[4px_4px_0px_#000000] hover:shadow-[2px_2px_0px_#000000] hover:translate-x-px hover:translate-y-px active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 disabled:opacity-50"
        >
          {downloadSuccess ? (
            <><Check className="w-4 h-4 stroke-[3]" /><span>WALLPAPER SAVED!</span></>
          ) : (
            <><Download className="w-4 h-4 stroke-[2.5]" /><span>DOWNLOAD PNG</span></>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-3.5 bg-white border-2 border-black rounded-2xl shadow-[2px_2px_0px_#000000] space-y-2">
          <span className="text-[11px] font-mono font-black text-black/70 uppercase block">1. Device</span>
          <div className="grid grid-cols-3 gap-1.5">
            {formats.map(({ id, label, Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => { soundEngine.playClick(); setSelectedFormat(id); }}
                className={`py-2 px-2 rounded-xl font-mono font-black text-[10px] uppercase border-2 border-black flex flex-col items-center gap-1 cursor-pointer transition-all ${selectedFormat === id ? 'bg-[#FDC800] text-black shadow-[2px_2px_0px_#000000]' : 'bg-neutral-50 hover:bg-neutral-100 text-black/80'
                  }`}
              >
                <Icon className="w-4 h-4 stroke-[2.5]" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="p-3.5 bg-white border-2 border-black rounded-2xl shadow-[2px_2px_0px_#000000] space-y-2">
          <span className="text-[11px] font-mono font-black text-black/70 uppercase block">2. Palette</span>
          <div className="grid grid-cols-2 gap-1.5">
            {Object.values(THEMES).map((thm) => (
              <button
                key={thm.id}
                type="button"
                onClick={() => { soundEngine.playClick(); setSelectedTheme(thm.id); }}
                className={`py-1.5 px-2.5 rounded-xl font-mono font-black text-[10px] uppercase border-2 border-black flex items-center justify-between cursor-pointer transition-all ${selectedTheme === thm.id ? 'bg-black text-white shadow-[2px_2px_0px_#000000]' : 'bg-neutral-50 hover:bg-neutral-100 text-black'
                  }`}
              >
                <span>{thm.name}</span>
                <span className="w-3.5 h-3.5 rounded-full border border-black shrink-0" style={{ backgroundColor: thm.accent }} />
              </button>
            ))}
          </div>
        </div>

        <div className="p-3.5 bg-white border-2 border-black rounded-2xl shadow-[2px_2px_0px_#000000] space-y-2">
          <span className="text-[11px] font-mono font-black text-black/70 uppercase block">3. Year & Data</span>
          <div className="flex items-center gap-2">
            <select
              value={targetYear}
              onChange={(e) => setTargetYear(Number(e.target.value))}
              className="flex-1 px-3 py-1.5 bg-neutral-100 border-2 border-black rounded-xl font-mono font-black text-xs cursor-pointer"
            >
              {[2024, 2025, 2026, 2027].map((yr) => (
                <option key={yr} value={yr}>YEAR {yr}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => { soundEngine.playClick(); setUseDemoData(!useDemoData); }}
              className={`px-3 py-1.5 border-2 border-black rounded-xl font-mono font-black text-[10px] uppercase transition-all cursor-pointer shadow-[1px_1px_0px_#000000] ${useDemoData ? 'bg-[#FDC800] text-black' : 'bg-[#00E599] text-black'
                }`}
            >
              {useDemoData ? 'DEMO DATA' : 'MY REAL DIARY'}
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-mono text-black/60 px-1">
          <span className="flex items-center gap-1 font-bold">
            <Eye className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>LIVE PREVIEW</span>
          </span>
          <span className="font-bold">
            {selectedFormat === 'phone' ? '1290 × 2796' : selectedFormat === 'desktop' ? '3840 × 2160 (4K)' : '2048 × 2048'}
          </span>
        </div>
        <div className="max-w-full overflow-auto flex justify-center p-3 sm:p-5 rounded-2xl bg-neutral-900 border-3 border-black shadow-[inset_0px_0px_10px_rgba(0,0,0,0.5)]">
          <canvas ref={canvasRef} className="max-h-[65vh] w-auto rounded-xl shadow-2xl border-2 border-black/40" />
        </div>
      </div>
    </div>
  );
}