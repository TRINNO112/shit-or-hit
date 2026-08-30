import React, { useState, useRef, useEffect } from 'react';
import { 
  Download, 
  Sparkles, 
  RefreshCw, 
  Smartphone, 
  Monitor, 
  Square, 
  Flame, 
  Calendar, 
  Check, 
  ShieldCheck,
  Layers,
  Palette,
  Eye
} from 'lucide-react';
import { ratingMeta } from '../services/api';
import { soundEngine } from '../services/soundEngine';

export default function YearInPixelsWallpaperEngine({ userEntries = {} }) {
  const canvasRef = useRef(null);
  const [selectedFormat, setSelectedFormat] = useState('phone'); // 'phone' (9:16) | 'desktop' (16:9) | 'square' (1:1)
  const [selectedTheme, setSelectedTheme] = useState('darkroom'); // 'darkroom' | 'matrix' | 'cream' | 'cyberpunk'
  const [useDemoData, setUseDemoData] = useState(true);
  const [targetYear, setTargetYear] = useState(new Date().getFullYear());
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Generate 365 days data for target year
  const daysData = React.useMemo(() => {
    const isLeap = (targetYear % 4 === 0 && targetYear % 100 !== 0) || (targetYear % 400 === 0);
    const totalDays = isLeap ? 366 : 365;
    const days = [];

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    const currentDay = now.getDate();

    let hitCount = 0;
    let loggedCount = 0;

    let dayCounter = 1;
    for (let month = 1; month <= 12; month++) {
      const daysInMonth = new Date(targetYear, month, 0).getDate();
      for (let d = 1; d <= daysInMonth; d++) {
        const mStr = String(month).padStart(2, '0');
        const dStr = String(d).padStart(2, '0');
        const dateStr = `${targetYear}-${mStr}-${dStr}`;

        const isPast = targetYear < currentYear || (targetYear === currentYear && (month < currentMonth || (month === currentMonth && d <= currentDay)));

        let rating = null;

        if (userEntries[dateStr]?.rating) {
          rating = Number(userEntries[dateStr].rating);
          loggedCount++;
          if (rating >= 4) hitCount++;
        } else if (useDemoData && isPast) {
          // Generative high-discipline sample pattern for preview
          const rand = Math.random();
          if (rand > 0.45) rating = 5; // 5★ Peak
          else if (rand > 0.25) rating = 4; // 4★ Good
          else if (rand > 0.12) rating = 3; // 3★ Okay
          else if (rand > 0.05) rating = 2; // 2★ Down
          else rating = 1; // 1★ Rough

          loggedCount++;
          if (rating >= 4) hitCount++;
        }

        days.push({
          dayOfYear: dayCounter++,
          month,
          day: d,
          dateStr,
          isPast,
          rating
        });
      }
    }

    return {
      days,
      totalDays,
      loggedCount,
      hitCount,
      hitRatio: loggedCount > 0 ? Math.round((hitCount / loggedCount) * 100) : 0
    };
  }, [targetYear, userEntries, useDemoData]);

  // Color mapping based on theme
  const getBlockColor = (rating, isPast, theme) => {
    if (!isPast) {
      return theme === 'cream' ? '#E5E7EB' : 'rgba(255, 255, 255, 0.08)';
    }
    if (!rating) {
      return theme === 'cream' ? '#D1D5DB' : 'rgba(255, 255, 255, 0.15)';
    }

    switch (rating) {
      case 5: return '#FDC800'; // Peak Gold
      case 4: return '#00E599'; // Good Emerald
      case 3: return '#CBD5E1'; // Okay Slate
      case 2: return '#FF8A00'; // Down Orange
      case 1: return '#FF4D4D'; // Rough Crimson
      default: return 'rgba(255, 255, 255, 0.2)';
    }
  };

  // Draw 365 Days on High-Resolution Canvas
  const drawWallpaper = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width = 1080;
    let height = 2400; // Default Mobile 9:16 (High-Res)

    if (selectedFormat === 'desktop') {
      width = 3840;
      height = 2160; // 4K 16:9
    } else if (selectedFormat === 'square') {
      width = 2048;
      height = 2048; // 1:1
    }

    canvas.width = width;
    canvas.height = height;

    // 1. Background Fill
    if (selectedTheme === 'darkroom') {
      ctx.fillStyle = '#0B0F17';
      ctx.fillRect(0, 0, width, height);

      // Ambient radial lighting
      const grad = ctx.createRadialGradient(width * 0.5, height * 0.45, 100, width * 0.5, height * 0.45, width * 0.8);
      grad.addColorStop(0, 'rgba(0, 229, 153, 0.08)');
      grad.addColorStop(0.6, 'rgba(253, 200, 0, 0.04)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    } else if (selectedTheme === 'matrix') {
      ctx.fillStyle = '#05080E';
      ctx.fillRect(0, 0, width, height);
    } else if (selectedTheme === 'cream') {
      ctx.fillStyle = '#FFFDF5';
      ctx.fillRect(0, 0, width, height);
    } else if (selectedTheme === 'cyberpunk') {
      ctx.fillStyle = '#120E24';
      ctx.fillRect(0, 0, width, height);
    }

    // 2. Header & Branding
    const isLight = selectedTheme === 'cream';
    const textColor = isLight ? '#000000' : '#FFFFFF';
    const subColor = isLight ? '#4B5563' : '#9CA3AF';
    const accentColor = '#FDC800';

    ctx.save();
    
    // Scale factor relative to 1080 base
    const scale = width / 1080;

    // Top Title & Badges
    const headerY = selectedFormat === 'phone' ? height * 0.12 : height * 0.14;
    
    ctx.textAlign = 'center';
    ctx.fillStyle = accentColor;
    ctx.font = `900 ${22 * scale}px "Plus Jakarta Sans", monospace`;
    ctx.fillText(`⚡ SHIT OR HIT • 365-DAY LIFE MATRIX`, width / 2, headerY - (45 * scale));

    ctx.fillStyle = textColor;
    ctx.font = `900 ${56 * scale}px "Cabinet Grotesk", "Plus Jakarta Sans", sans-serif`;
    ctx.fillText(`${targetYear} YEAR IN PIXELS`, width / 2, headerY + (10 * scale));

    ctx.fillStyle = subColor;
    ctx.font = `700 ${20 * scale}px monospace`;
    ctx.fillText(`${daysData.loggedCount} DAYS LOGGED • ${daysData.hitRatio}% HIT RATIO • 365 TOTAL TILES`, width / 2, headerY + (50 * scale));

    // 3. Grid Computation
    // Mobile: 14 cols x 27 rows (~378 slots for 365 days)
    // Desktop: 31 cols x 12 rows (Months x Days matrix)
    const isDesktop = selectedFormat === 'desktop';
    const cols = isDesktop ? 31 : 14;
    const rows = isDesktop ? 12 : 27;

    const gridWidth = width * (isDesktop ? 0.85 : 0.84);
    const gridHeight = height * (isDesktop ? 0.60 : 0.58);
    const startX = (width - gridWidth) / 2;
    const startY = headerY + (110 * scale);

    const gap = 8 * scale;
    const blockW = (gridWidth - (cols - 1) * gap) / cols;
    const blockH = (gridHeight - (rows - 1) * gap) / rows;
    const blockRadius = Math.min(blockW, blockH) * 0.22;

    // Render Blocks
    daysData.days.forEach((dayInfo, idx) => {
      let colIdx = 0;
      let rowIdx = 0;

      if (isDesktop) {
        // Month rows, Day cols
        colIdx = dayInfo.day - 1;
        rowIdx = dayInfo.month - 1;
      } else {
        colIdx = idx % cols;
        rowIdx = Math.floor(idx / cols);
      }

      const x = startX + colIdx * (blockW + gap);
      const y = startY + rowIdx * (blockH + gap);

      const color = getBlockColor(dayInfo.rating, dayInfo.isPast, selectedTheme);

      // Block Fill
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.roundRect(x, y, blockW, blockH, blockRadius);
      ctx.fill();

      // Block Border / Stroke
      if (isLight) {
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1.5 * scale;
        ctx.stroke();
      } else if (dayInfo.rating) {
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.lineWidth = 1.5 * scale;
        ctx.stroke();
      }
    });

    // 4. Legend Key at Bottom
    const legendY = startY + gridHeight + (65 * scale);
    const legendItems = [
      { label: '5★ Peak', color: '#FDC800' },
      { label: '4★ Good', color: '#00E599' },
      { label: '3★ Okay', color: '#CBD5E1' },
      { label: '2★ Down', color: '#FF8A00' },
      { label: '1★ Rough', color: '#FF4D4D' }
    ];

    const itemWidth = 140 * scale;
    const totalLegendWidth = legendItems.length * itemWidth;
    const legendStartX = (width - totalLegendWidth) / 2;

    legendItems.forEach((item, idx) => {
      const lx = legendStartX + idx * itemWidth;
      
      // Dot
      ctx.fillStyle = item.color;
      ctx.beginPath();
      ctx.arc(lx + (15 * scale), legendY, 9 * scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1.5 * scale;
      ctx.stroke();

      // Text
      ctx.textAlign = 'left';
      ctx.fillStyle = textColor;
      ctx.font = `800 ${15 * scale}px "Plus Jakarta Sans", sans-serif`;
      ctx.fillText(item.label, lx + (32 * scale), legendY + (5 * scale));
    });

    // 5. Watermark Footer
    ctx.textAlign = 'center';
    ctx.fillStyle = subColor;
    ctx.font = `700 ${14 * scale}px monospace`;
    ctx.fillText(`⚡ GENERATED VIA DAILY VERDICT OS • ZERO PRIVACY LEAKS`, width / 2, height - (40 * scale));

    ctx.restore();
  };

  useEffect(() => {
    drawWallpaper();
  }, [selectedFormat, selectedTheme, targetYear, useDemoData, daysData]);

  const handleDownload = () => {
    soundEngine.playSuccessChime();
    setIsGenerating(true);

    setTimeout(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const link = document.createElement('a');
      link.download = `365_days_${targetYear}_${selectedFormat}_wallpaper.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();

      setIsGenerating(false);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 2500);
    }, 150);
  };

  return (
    <div className="bg-neutral-900 border-3 border-black rounded-3xl p-5 sm:p-7 text-white shadow-[6px_6px_0px_#000000] space-y-6">
      
      {/* Engine Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#FDC800] animate-pulse" />
            <h3 className="font-display font-black text-lg sm:text-xl uppercase tracking-tight text-white">
              🗓️ 365-Day Year in Pixels 4K Wallpaper Engine
            </h3>
          </div>
          <p className="text-xs font-mono text-neutral-400 mt-1">
            Render your entire yearly momentum into an ultra-HD wallpaper for Mobile Lockscreen or 4K Desktop.
          </p>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={handleDownload}
          disabled={isGenerating}
          className="px-6 py-3.5 bg-[#00E599] hover:bg-[#00F0A0] text-black font-display font-black text-xs uppercase rounded-2xl border-2 border-black shadow-[3px_3px_0px_#000000] cursor-pointer flex items-center justify-center gap-2 transition-all active:scale-95 shrink-0"
        >
          {downloadSuccess ? (
            <>
              <Check className="w-4 h-4 stroke-[3]" />
              <span>WALLPAPER SAVED!</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4 stroke-[3]" />
              <span>DOWNLOAD HIGH-RES PNG</span>
            </>
          )}
        </button>
      </div>

      {/* Control Strip (Format + Themes + Demo Toggle) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* 1. Format Selector */}
        <div className="p-3 bg-black/50 border-2 border-white/10 rounded-2xl space-y-2">
          <span className="text-[11px] font-mono font-bold text-neutral-400 uppercase block">
            1. Wallpaper Aspect Ratio:
          </span>
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { id: 'phone', label: '📱 9:16 Phone' },
              { id: 'desktop', label: '🖥️ 16:9 4K' },
              { id: 'square', label: '🖨️ 1:1 Poster' }
            ].map(f => (
              <button
                key={f.id}
                type="button"
                onClick={() => setSelectedFormat(f.id)}
                className={`py-2 px-1 rounded-xl text-xs font-mono font-black text-center cursor-pointer transition-all ${
                  selectedFormat === f.id
                    ? 'bg-[#FDC800] text-black shadow-[2px_2px_0px_#000000] font-black'
                    : 'bg-white/10 text-neutral-300 hover:bg-white/20'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Theme Aesthetic */}
        <div className="p-3 bg-black/50 border-2 border-white/10 rounded-2xl space-y-2">
          <span className="text-[11px] font-mono font-bold text-neutral-400 uppercase block">
            2. Wallpaper Aesthetic Theme:
          </span>
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { id: 'darkroom', label: '🌌 Darkroom' },
              { id: 'matrix', label: '🖤 Matrix OLED' },
              { id: 'cream', label: '🍦 Cream Neobrut' }
            ].map(t => (
              <button
                key={t.id}
                type="button"
                onClick={() => setSelectedTheme(t.id)}
                className={`py-2 px-1 rounded-xl text-xs font-mono font-black text-center cursor-pointer transition-all ${
                  selectedTheme === t.id
                    ? 'bg-[#00E599] text-black shadow-[2px_2px_0px_#000000] font-black'
                    : 'bg-white/10 text-neutral-300 hover:bg-white/20'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Data Source */}
        <div className="p-3 bg-black/50 border-2 border-white/10 rounded-2xl space-y-2">
          <span className="text-[11px] font-mono font-bold text-neutral-400 uppercase block">
            3. Data Source:
          </span>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={() => setUseDemoData(false)}
              className={`py-2 px-1 rounded-xl text-xs font-mono font-black text-center cursor-pointer transition-all ${
                !useDemoData
                  ? 'bg-[#00E599] text-black font-black'
                  : 'bg-white/10 text-neutral-300 hover:bg-white/20'
              }`}
            >
              📊 My Actual Logs
            </button>
            <button
              type="button"
              onClick={() => setUseDemoData(true)}
              className={`py-2 px-1 rounded-xl text-xs font-mono font-black text-center cursor-pointer transition-all ${
                useDemoData
                  ? 'bg-[#FDC800] text-black font-black'
                  : 'bg-white/10 text-neutral-300 hover:bg-white/20'
              }`}
            >
              ⚡ Full 365 Demo
            </button>
          </div>
        </div>

      </div>

      {/* Live Canvas Preview Card */}
      <div className="p-4 bg-black border-2 border-white/10 rounded-3xl flex flex-col items-center justify-center space-y-4">
        <div className="text-xs font-mono font-bold text-neutral-400 flex items-center gap-2">
          <Eye className="w-4 h-4 text-[#00E599]" />
          <span>Live High-DPI Canvas Rendering ({selectedFormat.toUpperCase()} Mode)</span>
        </div>

        <div className="max-w-full overflow-auto flex justify-center p-2 rounded-2xl bg-neutral-950 border border-white/10">
          <canvas
            ref={canvasRef}
            className="max-h-[520px] w-auto rounded-xl shadow-2xl border border-white/20"
          />
        </div>
      </div>

    </div>
  );
}
