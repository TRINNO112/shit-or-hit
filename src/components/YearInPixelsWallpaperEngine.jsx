import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Download,
  Sparkles,
  RefreshCw,
  Smartphone,
  Monitor,
  Square,
  Calendar,
  Check,
  ShieldCheck,
  Flame,
  Palette,
  Eye,
  Trophy,
  Zap,
  ArrowRight
} from 'lucide-react';
import { soundEngine } from '../services/soundEngine';

const MONTH_NAMES = [
  'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
  'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
];

const MONTH_SHORT = [
  'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
  'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'
];

const WEEKDAY_HEADERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

const THEMES = {
  cream: {
    id: 'cream',
    name: 'Neo-Gold',
    badge: 'SIGNATURE',
    bg: '#FFFDF5',
    cardBg: '#FFFFFF',
    cardBorder: '#000000',
    cardShadow: '#000000',
    textMain: '#000000',
    textSub: '#4B5563',
    accent: '#FDC800',
    borderWidth: 3,
    emptyTile: '#E2E8F0',
    futureTile: '#F1F5F9',
    hudBg: '#FFFDF8'
  },
  darkroom: {
    id: 'darkroom',
    name: 'Cyberpunk',
    badge: 'DARKROOM',
    bg: '#0A0D14',
    cardBg: '#111726',
    cardBorder: '#1E293B',
    cardShadow: 'rgba(0,0,0,0.85)',
    textMain: '#F8FAFC',
    textSub: '#94A3B8',
    accent: '#00E599',
    borderWidth: 2.5,
    emptyTile: '#1E2638',
    futureTile: '#131A29',
    hudBg: '#0F1626'
  },
  monolith: {
    id: 'monolith',
    name: 'Monolith',
    badge: 'STEALTH',
    bg: '#050505',
    cardBg: '#0D0D0D',
    cardBorder: '#262626',
    cardShadow: 'rgba(0,0,0,0.95)',
    textMain: '#FFFFFF',
    textSub: '#737373',
    accent: '#FDC800',
    borderWidth: 2.5,
    emptyTile: '#1A1A1A',
    futureTile: '#0F0F0F',
    hudBg: '#0A0A0A'
  },
  sunset: {
    id: 'sunset',
    name: 'Tokyo Sunset',
    badge: 'VIBRANT',
    bg: '#120917',
    cardBg: '#1E1026',
    cardBorder: '#381E48',
    cardShadow: 'rgba(0,0,0,0.9)',
    textMain: '#FFFFFF',
    textSub: '#A892B7',
    accent: '#FF4D6D',
    borderWidth: 2.5,
    emptyTile: '#2B1736',
    futureTile: '#170C1E',
    hudBg: '#190D21'
  }
};

const RATING_COLORS = {
  5: '#FDC800', // Peak Gold
  4: '#00E599', // Good Emerald
  3: '#94A3B8', // Okay Slate
  2: '#FF8A00', // Down Orange
  1: '#FF4D4D', // Rough Crimson
};

export default function YearInPixelsWallpaperEngine({ userEntries = {} }) {
  const canvasRef = useRef(null);
  const [selectedFormat, setSelectedFormat] = useState('phone'); // 'phone' | 'desktop' | 'square'
  const [selectedTheme, setSelectedTheme] = useState('cream'); // 'cream' | 'darkroom' | 'monolith' | 'sunset'
  const [useDemoData, setUseDemoData] = useState(() => Object.keys(userEntries).length === 0);
  const [targetYear, setTargetYear] = useState(() => new Date().getFullYear());
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Generate Year Architecture (12 Month Cards)
  const yearData = useMemo(() => {
    const isLeap = (targetYear % 4 === 0 && targetYear % 100 !== 0) || (targetYear % 400 === 0);
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const currentDay = now.getDate();

    let totalLogged = 0;
    let totalHits = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

    const months = [];

    for (let m = 0; m < 12; m++) {
      const daysInMonth = new Date(targetYear, m + 1, 0).getDate();
      // Monday = 0, Sunday = 6
      const startDayOfWeek = (new Date(targetYear, m, 1).getDay() + 6) % 7;
      const days = [];
      let monthLogged = 0;
      let monthHits = 0;

      for (let d = 1; d <= daysInMonth; d++) {
        const mStr = String(m + 1).padStart(2, '0');
        const dStr = String(d).padStart(2, '0');
        const dateStr = `${targetYear}-${mStr}-${dStr}`;

        const isPast = targetYear < currentYear || (targetYear === currentYear && (m < currentMonth || (m === currentMonth && d <= currentDay)));
        const isToday = targetYear === currentYear && m === currentMonth && d === currentDay;

        let rating = null;

        if (userEntries[dateStr]?.rating) {
          rating = Number(userEntries[dateStr].rating);
          totalLogged++;
          monthLogged++;
          ratingCounts[rating] = (ratingCounts[rating] || 0) + 1;
          if (rating >= 4) {
            totalHits++;
            monthHits++;
            tempStreak++;
            if (tempStreak > longestStreak) longestStreak = tempStreak;
          } else {
            tempStreak = 0;
          }
        } else if (useDemoData && isPast) {
          // Generative high-discipline sample pattern for preview
          const seed = (m * 31 + d * 17) % 100;
          if (seed > 50) rating = 5;
          else if (seed > 25) rating = 4;
          else if (seed > 12) rating = 3;
          else if (seed > 4) rating = 2;
          else rating = 1;

          totalLogged++;
          monthLogged++;
          ratingCounts[rating] = (ratingCounts[rating] || 0) + 1;
          if (rating >= 4) {
            totalHits++;
            monthHits++;
            tempStreak++;
            if (tempStreak > longestStreak) longestStreak = tempStreak;
          } else {
            tempStreak = 0;
          }
        }

        days.push({
          day: d,
          dateStr,
          isPast,
          isToday,
          rating
        });
      }

      months.push({
        monthIndex: m,
        name: MONTH_NAMES[m],
        shortName: MONTH_SHORT[m],
        startDayOfWeek,
        daysInMonth,
        days,
        monthLogged,
        monthHits,
        hitRatio: monthLogged > 0 ? Math.round((monthHits / monthLogged) * 100) : 0
      });
    }

    const hitRatio = totalLogged > 0 ? Math.round((totalHits / totalLogged) * 100) : 0;

    return {
      year: targetYear,
      isLeap,
      totalDays: isLeap ? 366 : 365,
      totalLogged,
      totalHits,
      hitRatio,
      longestStreak,
      ratingCounts,
      months
    };
  }, [targetYear, userEntries, useDemoData]);

  // Master Canvas Drawing Engine
  const drawWallpaper = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });

    const theme = THEMES[selectedTheme] || THEMES.cream;

    // Resolutions (Ultra-Crisp Retina/4K Standards)
    let width = 1290;
    let height = 2796; // iPhone 16 Pro Max 9:19.5 lockscreen standard

    if (selectedFormat === 'desktop') {
      width = 3840;
      height = 2160; // 4K 16:9
    } else if (selectedFormat === 'square') {
      width = 2048;
      height = 2048; // High-Res 1:1
    }

    canvas.width = width;
    canvas.height = height;

    // Fill Base Background
    ctx.fillStyle = theme.bg;
    ctx.fillRect(0, 0, width, height);

    // Subtle Architectural Grid Dots
    ctx.save();
    ctx.fillStyle = selectedTheme === 'cream' ? 'rgba(0,0,0,0.035)' : 'rgba(255,255,255,0.035)';
    const gridDotSpacing = width / 40;
    for (let gx = 0; gx < width; gx += gridDotSpacing) {
      for (let gy = 0; gy < height; gy += gridDotSpacing) {
        ctx.beginPath();
        ctx.arc(gx, gy, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();

    // Helper: Rounded Rectangle
    const drawRoundedRect = (x, y, w, h, r) => {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
    };

    // Helper: Neobrutalist Shadowed Card
    const drawCard = (x, y, w, h, r, bg, borderCol, borderW, shadowOffset = 6, shadowCol = theme.cardShadow) => {
      // 1. Drop Shadow
      if (shadowOffset > 0) {
        ctx.save();
        ctx.fillStyle = shadowCol;
        drawRoundedRect(x + shadowOffset, y + shadowOffset, w, h, r);
        ctx.fill();
        ctx.restore();
      }

      // 2. Card Body
      ctx.save();
      ctx.fillStyle = bg;
      drawRoundedRect(x, y, w, h, r);
      ctx.fill();

      // 3. Card Border
      if (borderW > 0 && borderCol) {
        ctx.strokeStyle = borderCol;
        ctx.lineWidth = borderW;
        ctx.stroke();
      }
      ctx.restore();
    };

    // Helper: Render Single Month Card
    const renderMonthCard = (monthObj, cardX, cardY, cardW, cardH, tileGap, tileRadius) => {
      // Card Container
      drawCard(cardX, cardY, cardW, cardH, 18, theme.cardBg, theme.cardBorder, theme.borderWidth, 4);

      // Card Header Banner
      const headerH = 46;
      ctx.save();
      ctx.fillStyle = selectedTheme === 'cream' ? '#F8FAFC' : 'rgba(255,255,255,0.04)';
      ctx.beginPath();
      ctx.moveTo(cardX + 18, cardY);
      ctx.lineTo(cardX + cardW - 18, cardY);
      ctx.quadraticCurveTo(cardX + cardW, cardY, cardX + cardW, cardY + 18);
      ctx.lineTo(cardX + cardW, cardY + headerH);
      ctx.lineTo(cardX, cardY + headerH);
      ctx.lineTo(cardX, cardY + 18);
      ctx.quadraticCurveTo(cardX, cardY, cardX + 18, cardY);
      ctx.closePath();
      ctx.fill();

      // Bottom header separator line
      ctx.strokeStyle = theme.cardBorder;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(cardX, cardY + headerH);
      ctx.lineTo(cardX + cardW, cardY + headerH);
      ctx.stroke();
      ctx.restore();

      // Month Title (e.g., "01 // JAN")
      ctx.save();
      ctx.font = '900 16px "Cabinet Grotesk", "Plus Jakarta Sans", monospace';
      ctx.fillStyle = theme.textMain;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      const monthNumStr = String(monthObj.monthIndex + 1).padStart(2, '0');
      ctx.fillText(`${monthNumStr} // ${monthObj.shortName}`, cardX + 14, cardY + headerH / 2);

      // Month Hit Rate Pill
      const hitPillText = `${monthObj.hitRatio}% HIT`;
      ctx.font = '800 11px monospace';
      const pillW = ctx.measureText(hitPillText).width + 14;
      const pillH = 20;
      const pillX = cardX + cardW - pillW - 12;
      const pillY = cardY + (headerH - pillH) / 2;

      ctx.fillStyle = monthObj.hitRatio >= 70 ? '#00E599' : (monthObj.hitRatio >= 40 ? '#FDC800' : (selectedTheme === 'cream' ? '#E2E8F0' : '#1E293B'));
      ctx.strokeStyle = theme.cardBorder;
      ctx.lineWidth = 1.5;
      drawRoundedRect(pillX, pillY, pillW, pillH, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#000000';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(hitPillText, pillX + pillW / 2, pillY + pillH / 2);
      ctx.restore();

      // Weekday Row: M T W T F S S
      const gridPaddingX = 14;
      const innerW = cardW - gridPaddingX * 2;
      const colW = (innerW - tileGap * 6) / 7;
      const weekdayY = cardY + headerH + 16;

      ctx.save();
      ctx.font = '800 11px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = theme.textSub;
      WEEKDAY_HEADERS.forEach((wChar, idx) => {
        const wx = cardX + gridPaddingX + idx * (colW + tileGap) + colW / 2;
        ctx.fillText(wChar, wx, weekdayY);
      });
      ctx.restore();

      // Day Tiles (7 Cols x up to 6 Rows)
      const gridStartY = weekdayY + 14;
      const tileH = colW; // Square tiles

      let currentDayIndex = 0;
      const startOffset = monthObj.startDayOfWeek;

      for (let r = 0; r < 6; r++) {
        for (let c = 0; c < 7; c++) {
          const slotIndex = r * 7 + c;

          if (slotIndex < startOffset || currentDayIndex >= monthObj.days.length) {
            continue; // Empty slot before 1st or after end of month
          }

          const dayData = monthObj.days[currentDayIndex];
          currentDayIndex++;

          const tileX = cardX + gridPaddingX + c * (colW + tileGap);
          const tileY = gridStartY + r * (tileH + tileGap);

          // Determine Tile Color
          let tileBg = theme.futureTile;
          let tileStroke = null;

          if (dayData.rating) {
            tileBg = RATING_COLORS[dayData.rating] || theme.emptyTile;
          } else if (dayData.isPast) {
            tileBg = theme.emptyTile;
          }

          // Draw Day Tile
          ctx.save();
          ctx.fillStyle = tileBg;
          drawRoundedRect(tileX, tileY, colW, tileH, tileRadius);
          ctx.fill();

          // Border for active rating or today
          if (dayData.isToday) {
            ctx.strokeStyle = theme.accent;
            ctx.lineWidth = 2.5;
            ctx.stroke();
          } else if (dayData.rating && selectedTheme === 'cream') {
            ctx.strokeStyle = 'rgba(0,0,0,0.2)';
            ctx.lineWidth = 1;
            ctx.stroke();
          }
          ctx.restore();
        }
        if (currentDayIndex >= monthObj.days.length) break;
      }
    };

    // ==========================================
    // 1. PHONE LOCKSCREEN MODE (9:19.5 - 1290x2796)
    // ==========================================
    if (selectedFormat === 'phone') {
      // SAFE ZONE AT TOP: Y: 0 to 520 (Clock, Widgets, Island)
      // Subtle watermark in clock safe zone
      ctx.save();
      ctx.fillStyle = selectedTheme === 'cream' ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)';
      ctx.font = '900 13px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('• LOCKSCREEN SAFE ZONE • CLOCK & WIDGETS ANCHOR •', width / 2, 280);
      ctx.restore();

      // HEADER CARD (Y: 520 to 710)
      const headerCardX = 54;
      const headerCardW = width - headerCardX * 2;
      drawCard(headerCardX, 520, headerCardW, 170, 24, theme.hudBg, theme.cardBorder, theme.borderWidth, 6);

      // Title & Subtitle inside Header Card
      ctx.save();
      ctx.font = '900 14px monospace';
      ctx.fillStyle = theme.accent;
      ctx.textAlign = 'left';
      ctx.fillText('SHIT OR HIT • 365-DAY LIFE MATRIX', headerCardX + 28, 565);

      ctx.font = '900 44px "Cabinet Grotesk", "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = theme.textMain;
      ctx.fillText(`${yearData.year} YEAR IN PIXELS`, headerCardX + 28, 620);

      // Quick Stat Badges
      const statX = headerCardX + 28;
      const statY = 660;
      ctx.font = '800 13px monospace';
      ctx.fillStyle = theme.textSub;
      ctx.fillText(`${yearData.totalLogged} DAYS LOGGED`, statX, statY);
      ctx.fillText(`•`, statX + 155, statY);
      ctx.fillStyle = '#00E599';
      ctx.fillText(`${yearData.hitRatio}% HIT RATIO`, statX + 175, statY);
      ctx.fillStyle = theme.textSub;
      ctx.fillText(`•`, statX + 310, statY);
      ctx.fillStyle = theme.accent;
      ctx.fillText(`🔥 ${yearData.longestStreak}D STREAK`, statX + 330, statY);
      ctx.restore();

      // 12 MONTHS GRID (3 Columns x 4 Rows)
      // Y: 720 to 2480 (Plenty of vertical breathing room)
      const cols = 3;
      const rows = 4;
      const gridStartX = 54;
      const gridStartY = 730;
      const gridGapX = 26;
      const gridGapY = 24;
      const monthCardW = (width - gridStartX * 2 - (cols - 1) * gridGapX) / cols; // ~376px
      const monthCardH = 390;

      yearData.months.forEach((mObj, idx) => {
        const c = idx % cols;
        const r = Math.floor(idx / cols);
        const mx = gridStartX + c * (monthCardW + gridGapX);
        const my = gridStartY + r * (monthCardH + gridGapY);
        renderMonthCard(mObj, mx, my, monthCardW, monthCardH, 6, 5);
      });

      // BOTTOM LEGEND & WATERMARK CARD (Y: 2460 to 2640)
      const footerY = 2470;
      drawCard(headerCardX, footerY, headerCardW, 110, 20, theme.hudBg, theme.cardBorder, theme.borderWidth, 4);

      // Rating Legend Items
      const legendItems = [
        { label: '5★ PEAK', color: '#FDC800' },
        { label: '4★ GOOD', color: '#00E599' },
        { label: '3★ OKAY', color: '#94A3B8' },
        { label: '2★ DOWN', color: '#FF8A00' },
        { label: '1★ ROUGH', color: '#FF4D4D' }
      ];

      const itemSpacing = headerCardW / 5;
      legendItems.forEach((item, lIdx) => {
        const lx = headerCardX + lIdx * itemSpacing + itemSpacing / 2;
        const ly = footerY + 40;

        ctx.save();
        ctx.fillStyle = item.color;
        drawRoundedRect(lx - 45, ly - 10, 20, 20, 5);
        ctx.fill();
        ctx.strokeStyle = theme.cardBorder;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.font = '900 12px monospace';
        ctx.fillStyle = theme.textMain;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(item.label, lx - 18, ly);
        ctx.restore();
      });

      // Bottom Telemetry Seal
      ctx.save();
      ctx.font = '800 11px monospace';
      ctx.fillStyle = theme.textSub;
      ctx.textAlign = 'center';
      ctx.fillText('ENGINEERED FOR DAILY DISCIPLINE • DAILY VERDICT OS • ZERO COMPROMISE', width / 2, footerY + 86);
      ctx.restore();
    }

    // ==========================================
    // 2. DESKTOP 4K MODE (16:9 - 3840x2160)
    // ==========================================
    else if (selectedFormat === 'desktop') {
      const padding = 80;

      // LEFT SIDEBAR HUD (Width: 920px, Height: 2000px)
      const hudW = 900;
      const hudH = height - padding * 2;
      drawCard(padding, padding, hudW, hudH, 32, theme.hudBg, theme.cardBorder, theme.borderWidth + 1, 8);

      // HUD Contents
      const hudX = padding + 50;
      let hudY = padding + 80;

      // Brand Pill
      ctx.save();
      ctx.font = '900 18px monospace';
      ctx.fillStyle = theme.accent;
      ctx.fillText('DAILY VERDICT // EXECUTIVE DOSSIER', hudX, hudY);
      hudY += 80;

      // Year Title
      ctx.font = '900 110px "Cabinet Grotesk", sans-serif';
      ctx.fillStyle = theme.textMain;
      ctx.fillText(`${yearData.year}`, hudX, hudY);
      hudY += 45;

      ctx.font = '900 30px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = theme.textSub;
      ctx.fillText('365-DAY LIFE MATRIX', hudX, hudY);
      hudY += 90;

      // Metric Card 1: Hit Ratio
      drawCard(hudX, hudY, hudW - 100, 160, 20, theme.cardBg, theme.cardBorder, 2, 4);
      ctx.font = '900 14px monospace';
      ctx.fillStyle = theme.textSub;
      ctx.fillText('YEAR VELOCITY & HIT RATIO', hudX + 28, hudY + 42);
      ctx.font = '900 64px "Cabinet Grotesk", monospace';
      ctx.fillStyle = '#00E599';
      ctx.fillText(`${yearData.hitRatio}%`, hudX + 28, hudY + 115);
      hudY += 200;

      // Metric Card 2: Logged Days & Longest Streak
      drawCard(hudX, hudY, (hudW - 120) / 2, 140, 20, theme.cardBg, theme.cardBorder, 2, 4);
      ctx.font = '900 13px monospace';
      ctx.fillStyle = theme.textSub;
      ctx.fillText('DAYS LOGGED', hudX + 24, hudY + 38);
      ctx.font = '900 42px monospace';
      ctx.fillStyle = theme.textMain;
      ctx.fillText(`${yearData.totalLogged}/${yearData.totalDays}`, hudX + 24, hudY + 95);

      const streakCardX = hudX + (hudW - 120) / 2 + 20;
      drawCard(streakCardX, hudY, (hudW - 120) / 2, 140, 20, theme.cardBg, theme.cardBorder, 2, 4);
      ctx.font = '900 13px monospace';
      ctx.fillStyle = theme.textSub;
      ctx.fillText('MAX STREAK', streakCardX + 24, hudY + 38);
      ctx.font = '900 42px monospace';
      ctx.fillStyle = theme.accent;
      ctx.fillText(`${yearData.longestStreak} DAYS`, streakCardX + 24, hudY + 95);
      hudY += 180;

      // Metric Card 3: Rating Distribution Breakdown
      drawCard(hudX, hudY, hudW - 100, 360, 24, theme.cardBg, theme.cardBorder, 2, 4);
      ctx.font = '900 15px monospace';
      ctx.fillStyle = theme.textMain;
      ctx.fillText('STAR RATING DISTRIBUTION', hudX + 28, hudY + 45);

      const ratings = [
        { star: 5, label: '5★ PEAK', color: '#FDC800' },
        { star: 4, label: '4★ GOOD', color: '#00E599' },
        { star: 3, label: '3★ OKAY', color: '#94A3B8' },
        { star: 2, label: '2★ DOWN', color: '#FF8A00' },
        { star: 1, label: '1★ ROUGH', color: '#FF4D4D' }
      ];

      ratings.forEach((r, rIdx) => {
        const ry = hudY + 90 + rIdx * 52;
        const count = yearData.ratingCounts[r.star] || 0;
        const barMaxW = 440;
        const barW = Math.max(8, (count / (yearData.totalLogged || 1)) * barMaxW);

        ctx.fillStyle = r.color;
        drawRoundedRect(hudX + 28, ry - 6, 20, 20, 5);
        ctx.fill();

        ctx.font = '800 13px monospace';
        ctx.fillStyle = theme.textMain;
        ctx.fillText(r.label, hudX + 58, ry + 8);

        // Bar Track
        ctx.fillStyle = selectedTheme === 'cream' ? '#E2E8F0' : '#1E293B';
        drawRoundedRect(hudX + 160, ry - 4, barMaxW, 16, 8);
        ctx.fill();

        // Bar Fill
        ctx.fillStyle = r.color;
        drawRoundedRect(hudX + 160, ry - 4, barW, 16, 8);
        ctx.fill();

        // Count Text
        ctx.font = '900 13px monospace';
        ctx.fillStyle = theme.textSub;
        ctx.fillText(`${count}d`, hudX + 160 + barMaxW + 18, ry + 9);
      });
      hudY += 400;

      // Bottom Cryptographic Seal
      ctx.font = '800 13px monospace';
      ctx.fillStyle = theme.textSub;
      ctx.fillText('100% CLIENT-SIDE CRYPTOGRAPHIC VAULT', hudX, height - padding - 60);
      ctx.fillText('DESIGNED FOR 4K WORKSTATIONS • ZERO TRACKERS', hudX, height - padding - 35);
      ctx.restore();

      // RIGHT 12 MONTHS MATRIX (4 Columns x 3 Rows)
      const matrixX = padding + hudW + 40;
      const matrixW = width - matrixX - padding;
      const mCols = 4;
      const mRows = 3;
      const mGapX = 28;
      const mGapY = 28;
      const mCardW = (matrixW - (mCols - 1) * mGapX) / mCols; // ~640px
      const mCardH = (hudH - (mRows - 1) * mGapY) / mRows; // ~635px

      yearData.months.forEach((mObj, idx) => {
        const c = idx % mCols;
        const r = Math.floor(idx / mCols);
        const mx = matrixX + c * (mCardW + mGapX);
        const my = padding + r * (mCardH + mGapY);
        renderMonthCard(mObj, mx, my, mCardW, mCardH, 8, 7);
      });
    }

    // ==========================================
    // 3. SQUARE FORMAT MODE (1:1 - 2048x2048)
    // ==========================================
    else {
      const pad = 60;
      // Header Card Across Top (H: 150)
      const topH = 150;
      drawCard(pad, pad, width - pad * 2, topH, 24, theme.hudBg, theme.cardBorder, theme.borderWidth, 6);

      ctx.save();
      ctx.font = '900 15px monospace';
      ctx.fillStyle = theme.accent;
      ctx.fillText('DAILY VERDICT • 365-DAY LIFE MATRIX', pad + 30, pad + 45);

      ctx.font = '900 52px "Cabinet Grotesk", sans-serif';
      ctx.fillStyle = theme.textMain;
      ctx.fillText(`${yearData.year} YEAR IN PIXELS`, pad + 30, pad + 105);

      const rightStatX = width - pad - 420;
      ctx.font = '900 14px monospace';
      ctx.fillStyle = theme.textSub;
      ctx.fillText(`${yearData.totalLogged} DAYS LOGGED`, rightStatX, pad + 60);
      ctx.fillStyle = '#00E599';
      ctx.fillText(`${yearData.hitRatio}% HIT RATIO`, rightStatX + 160, pad + 60);
      ctx.fillStyle = theme.accent;
      ctx.fillText(`🔥 ${yearData.longestStreak}D STREAK`, rightStatX + 290, pad + 60);
      ctx.restore();

      // 12 Months Grid: 4 Cols x 3 Rows
      const sCols = 4;
      const sRows = 3;
      const sGap = 20;
      const gridTopY = pad + topH + 25;
      const sCardW = (width - pad * 2 - (sCols - 1) * sGap) / sCols;
      const sCardH = 500;

      yearData.months.forEach((mObj, idx) => {
        const c = idx % sCols;
        const r = Math.floor(idx / sCols);
        const mx = pad + c * (sCardW + sGap);
        const my = gridTopY + r * (sCardH + sGap);
        renderMonthCard(mObj, mx, my, sCardW, sCardH, 7, 6);
      });
    }
  };

  useEffect(() => {
    drawWallpaper();
  }, [selectedFormat, selectedTheme, targetYear, useDemoData, yearData]);

  const handleDownload = () => {
    soundEngine.playSuccess();
    setIsGenerating(true);

    setTimeout(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const link = document.createElement('a');
      link.download = `365_days_${targetYear}_${selectedFormat}_${selectedTheme}.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();

      setIsGenerating(false);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 2500);
    }, 150);
  };

  return (
    <div className="bg-[#FFFDF8] border-3 border-black rounded-3xl p-5 sm:p-7 text-black shadow-[6px_6px_0px_#000000] space-y-6">
      
      {/* Top Bar: Title, Year Badge & Instant Download */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-black/15 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-[#FDC800] text-black font-mono font-black text-[10px] px-2 py-0.5 border border-black uppercase shadow-[1px_1px_0px_#000000]">
              4K ULTRA-HD WALLPAPER ENGINE
            </span>
            <span className="bg-black text-white font-mono font-black text-[10px] px-2 py-0.5 border border-black uppercase">
              12-MONTH MATRIX
            </span>
          </div>
          <h2 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight">
            365-Day Year in Pixels
          </h2>
          <p className="text-xs font-mono text-black/60">
            Export high-density lockscreens & 4K desktop wallpapers formatted with zero clock collisions.
          </p>
        </div>

        {/* 1-Tap Download Action */}
        <button
          type="button"
          onClick={handleDownload}
          disabled={isGenerating}
          className="px-6 py-3 bg-[#00E599] hover:bg-emerald-400 border-3 border-black rounded-2xl font-mono font-black text-xs uppercase tracking-wider text-black shadow-[4px_4px_0px_#000000] hover:shadow-[2px_2px_0px_#000000] hover:translate-x-px hover:translate-y-px active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 disabled:opacity-50"
        >
          {downloadSuccess ? (
            <>
              <Check className="w-4 h-4 stroke-[3]" />
              <span>WALLPAPER SAVED!</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4 stroke-[2.5]" />
              <span>DOWNLOAD 4K PNG</span>
            </>
          )}
        </button>
      </div>

      {/* Control Strip: Format, Themes & Source Data */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* 1. Device Format Switcher */}
        <div className="p-3.5 bg-white border-2 border-black rounded-2xl shadow-[2px_2px_0px_#000000] space-y-2">
          <span className="text-[11px] font-mono font-black text-black/70 uppercase block">
            1. Select Device Viewport
          </span>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                setSelectedFormat('phone');
              }}
              className={`py-2 px-2 rounded-xl font-mono font-black text-[10px] uppercase border-2 border-black flex flex-col items-center gap-1 cursor-pointer transition-all ${
                selectedFormat === 'phone'
                  ? 'bg-[#FDC800] text-black shadow-[2px_2px_0px_#000000]'
                  : 'bg-neutral-50 hover:bg-neutral-100 text-black/80'
              }`}
            >
              <Smartphone className="w-4 h-4 stroke-[2.5]" />
              <span>PHONE (9:16)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                setSelectedFormat('desktop');
              }}
              className={`py-2 px-2 rounded-xl font-mono font-black text-[10px] uppercase border-2 border-black flex flex-col items-center gap-1 cursor-pointer transition-all ${
                selectedFormat === 'desktop'
                  ? 'bg-[#FDC800] text-black shadow-[2px_2px_0px_#000000]'
                  : 'bg-neutral-50 hover:bg-neutral-100 text-black/80'
              }`}
            >
              <Monitor className="w-4 h-4 stroke-[2.5]" />
              <span>4K DESKTOP</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                setSelectedFormat('square');
              }}
              className={`py-2 px-2 rounded-xl font-mono font-black text-[10px] uppercase border-2 border-black flex flex-col items-center gap-1 cursor-pointer transition-all ${
                selectedFormat === 'square'
                  ? 'bg-[#FDC800] text-black shadow-[2px_2px_0px_#000000]'
                  : 'bg-neutral-50 hover:bg-neutral-100 text-black/80'
              }`}
            >
              <Square className="w-4 h-4 stroke-[2.5]" />
              <span>SQUARE (1:1)</span>
            </button>
          </div>
        </div>

        {/* 2. Color Palette & Aesthetics */}
        <div className="p-3.5 bg-white border-2 border-black rounded-2xl shadow-[2px_2px_0px_#000000] space-y-2">
          <span className="text-[11px] font-mono font-black text-black/70 uppercase block">
            2. Color Palette Theme
          </span>
          <div className="grid grid-cols-2 gap-1.5">
            {Object.values(THEMES).map((thm) => (
              <button
                key={thm.id}
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  setSelectedTheme(thm.id);
                }}
                className={`py-1.5 px-2.5 rounded-xl font-mono font-black text-[10px] uppercase border-2 border-black flex items-center justify-between cursor-pointer transition-all ${
                  selectedTheme === thm.id
                    ? 'bg-black text-white shadow-[2px_2px_0px_#000000]'
                    : 'bg-neutral-50 hover:bg-neutral-100 text-black'
                }`}
              >
                <span>{thm.name}</span>
                <span
                  className="w-3.5 h-3.5 rounded-full border border-black shrink-0"
                  style={{ backgroundColor: thm.accent }}
                />
              </button>
            ))}
          </div>
        </div>

        {/* 3. Year Selector & Data Source */}
        <div className="p-3.5 bg-white border-2 border-black rounded-2xl shadow-[2px_2px_0px_#000000] space-y-2">
          <span className="text-[11px] font-mono font-black text-black/70 uppercase block">
            3. Target Year & Data Mode
          </span>
          <div className="flex items-center gap-2">
            <select
              value={targetYear}
              onChange={(e) => setTargetYear(Number(e.target.value))}
              className="flex-1 px-3 py-1.5 bg-neutral-100 border-2 border-black rounded-xl font-mono font-black text-xs cursor-pointer"
            >
              {[2024, 2025, 2026, 2027].map((yr) => (
                <option key={yr} value={yr}>
                  YEAR {yr}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                setUseDemoData(!useDemoData);
              }}
              className={`px-3 py-1.5 border-2 border-black rounded-xl font-mono font-black text-[10px] uppercase transition-all cursor-pointer ${
                useDemoData
                  ? 'bg-[#FDC800] text-black shadow-[1px_1px_0px_#000000]'
                  : 'bg-[#00E599] text-black shadow-[1px_1px_0px_#000000]'
              }`}
            >
              {useDemoData ? 'DEMO DATA' : 'MY REAL DIARY'}
            </button>
          </div>
        </div>
      </div>

      {/* Live High-DPI Canvas Rendering Container */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-mono text-black/60 px-1">
          <span className="flex items-center gap-1 font-bold">
            <Eye className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>LIVE INTERACTIVE PREVIEW</span>
          </span>
          <span className="font-bold">
            {selectedFormat === 'phone' ? '1290 × 2796 (RETINA 9:19.5)' : selectedFormat === 'desktop' ? '3840 × 2160 (4K 16:9)' : '2048 × 2048 (1:1)'}
          </span>
        </div>

        <div className="max-w-full overflow-auto flex justify-center p-3 sm:p-5 rounded-2xl bg-neutral-900 border-3 border-black shadow-[inset_0px_0px_10px_rgba(0,0,0,0.5)]">
          <canvas
            ref={canvasRef}
            className="max-h-[65vh] w-auto rounded-xl shadow-2xl border-2 border-black/40"
          />
        </div>
      </div>

    </div>
  );
}