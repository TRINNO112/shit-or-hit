import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Smartphone, Share2, Sparkles, X, Check, Image as ImageIcon, Flame, Zap, Palette, Upload, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { ratingMeta } from '../services/api';

const THEMES = [
  { 
    id: 'streetwear', 
    name: '⚡ Streetwear Gold', 
    bg: '#FFFDF0', 
    accent: '#FDC800', 
    subAccent: '#00E599',
    text: '#000000',
    cardBg: '#FFFFFF',
    glow: 'rgba(253, 200, 0, 0.4)'
  },
  { 
    id: 'cyberpunk', 
    name: '🖤 Cyber Obsidian', 
    bg: '#080A0F', 
    accent: '#00E599', 
    subAccent: '#00D8F6',
    text: '#FFFFFF',
    cardBg: 'rgba(18, 24, 38, 0.95)',
    glow: 'rgba(0, 229, 153, 0.4)'
  },
  { 
    id: 'sunset', 
    name: '🔥 Sunset Crimson', 
    bg: '#140C1D', 
    accent: '#FF4D6D', 
    subAccent: '#FF9E00',
    text: '#FFFFFF',
    cardBg: 'rgba(34, 18, 48, 0.95)',
    glow: 'rgba(255, 77, 109, 0.45)'
  }
];

const MASCOT_MAP = {
  5: '/mascots/mascot_5_peak.png',
  4: '/mascots/mascot_4_good.png',
  3: '/mascots/mascot_3_okay.png',
  2: '/mascots/mascot_1_rough.png',
  1: '/mascots/mascot_1_rough.png'
};

export default function AestheticCardExportModal({
  isOpen,
  onClose,
  entry,
  dateStr,
  dayCount,
  entries = {},
  startDate = '2026-08-01',
  displayName = 'Trinno Asphalt'
}) {
  const [format, setFormat] = useState('wallpaper'); // 'wallpaper' (9:16) | 'social' (1:1)
  const [activeTheme, setActiveTheme] = useState('streetwear');
  const [selectedDateStr, setSelectedDateStr] = useState(dateStr || new Date().toISOString().slice(0, 10));
  const [customMascotImg, setCustomMascotImg] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Sync selected date when modal opens with a specific date
  useEffect(() => {
    if (dateStr) {
      setSelectedDateStr(dateStr);
    }
  }, [dateStr, isOpen]);

  // Derive active day entry and day index
  const activeEntry = entries[selectedDateStr] || (selectedDateStr === dateStr ? entry : null);
  const rating = activeEntry?.rating || 3;
  const verdict = activeEntry?.verdict || ratingMeta[rating]?.title || 'Verdict';
  const notes = activeEntry?.notes || (activeEntry?.rating ? 'Solid day logged on the board.' : 'No diary reflection recorded for this day yet.');
  const meta = ratingMeta[rating] || ratingMeta[3];

  const startObj = new Date(`${startDate || '2026-08-01'}T00:00:00`);
  const currentObj = new Date(`${selectedDateStr}T00:00:00`);
  const activeDayCount = Math.max(1, Math.floor((currentObj - startObj) / (1000 * 60 * 60 * 24)) + 1);

  const formattedDate = currentObj.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const handleShiftDay = (delta) => {
    const cur = new Date(`${selectedDateStr}T00:00:00`);
    cur.setDate(cur.getDate() + delta);
    const y = cur.getFullYear();
    const m = String(cur.getMonth() + 1).padStart(2, '0');
    const d = String(cur.getDate()).padStart(2, '0');
    setSelectedDateStr(`${y}-${m}-${d}`);
  };

  const handleMascotUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          setCustomMascotImg(img);
        };
        img.src = event.target?.result;
      };
      reader.readAsDataURL(file);
    }
  };

  // Master Canvas Drawing Engine (Collision-Free & High-Density Poster Art)
  useEffect(() => {
    if (!isOpen) return;

    const theme = THEMES.find(t => t.id === activeTheme) || THEMES[0];
    const canvas = document.createElement('canvas');
    const width = 1080;
    const height = format === 'wallpaper' ? 1920 : 1080;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    const isDark = activeTheme === 'cyberpunk' || activeTheme === 'sunset';

    // 1. Background Fill & Textured Aesthetics
    if (activeTheme === 'streetwear') {
      ctx.fillStyle = '#FFFDF0';
      ctx.fillRect(0, 0, width, height);

      // Halftone Polka Dots Pattern
      ctx.fillStyle = 'rgba(0, 0, 0, 0.04)';
      for (let x = 30; x < width; x += 40) {
        for (let y = 30; y < height; y += 40) {
          ctx.beginPath();
          ctx.arc(x, y, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Dynamic Diagonal Streetwear Ribbon
      ctx.fillStyle = '#FDC800';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(width, 0);
      ctx.lineTo(width, format === 'wallpaper' ? 220 : 160);
      ctx.lineTo(0, format === 'wallpaper' ? 340 : 260);
      ctx.closePath();
      ctx.fill();
    } else if (activeTheme === 'cyberpunk') {
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, '#06080D');
      grad.addColorStop(0.5, '#0B111A');
      grad.addColorStop(1, '#040508');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Radial Spotlight Glow
      const glow = ctx.createRadialGradient(
        format === 'wallpaper' ? width / 2 : 750,
        format === 'wallpaper' ? 760 : 540,
        60,
        format === 'wallpaper' ? width / 2 : 750,
        format === 'wallpaper' ? 760 : 540,
        format === 'wallpaper' ? 520 : 420
      );
      glow.addColorStop(0, 'rgba(0, 229, 153, 0.32)');
      glow.addColorStop(0.7, 'rgba(0, 216, 246, 0.08)');
      glow.addColorStop(1, 'transparent');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, width, height);

      // Cyber Matrix Grid Lines
      ctx.strokeStyle = 'rgba(0, 229, 153, 0.08)';
      ctx.lineWidth = 2;
      for (let x = 0; x < width; x += 72) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 72) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
    } else if (activeTheme === 'sunset') {
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, '#1E0A2A');
      grad.addColorStop(0.4, '#381142');
      grad.addColorStop(1, '#110619');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Sunset Crimson Radial Glow
      const glow = ctx.createRadialGradient(
        format === 'wallpaper' ? width / 2 : 750,
        format === 'wallpaper' ? 760 : 540,
        60,
        format === 'wallpaper' ? width / 2 : 750,
        format === 'wallpaper' ? 760 : 540,
        format === 'wallpaper' ? 540 : 420
      );
      glow.addColorStop(0, 'rgba(255, 77, 109, 0.38)');
      glow.addColorStop(0.6, 'rgba(255, 158, 0, 0.14)');
      glow.addColorStop(1, 'transparent');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, width, height);
    }

    const moodMeta = {
      5: { tag: 'PEAK VELOCITY • UNSTOPPABLE', persona: 'GOD MODE DEMON', color: '#FDC800' },
      4: { tag: 'LOCKED IN • MOMENTUM FLOW', persona: 'FOCUS WARRIOR', color: '#00E599' },
      3: { tag: 'SOLID BASELINE • HELD THE LINE', persona: 'STOIC SUSTAINER', color: '#CBD5E1' },
      2: { tag: 'LOW BATTERY • HEAVY DRAG', persona: 'RECOVERY AGENT', color: '#FF8A00' },
      1: { tag: 'TRENCH SURVIVOR • 3:45 AM GOBLIN', persona: 'DOPAMINE GOBLIN', color: '#FF4D4D' }
    };
    const currentMood = moodMeta[rating] || moodMeta[3];

    const mascotPath = MASCOT_MAP[rating] || MASCOT_MAP[3];
    const mascotImg = customMascotImg || new Image();

    const drawCompleteCanvas = () => {

      // =========================================================================
      // 📱 FORMAT A: 9:16 PHONE WALLPAPER (1080 x 1920)
      // =========================================================================
      if (format === 'wallpaper') {
        const topY = 90;

        // Top Status Badge & Tape
        ctx.fillStyle = isDark ? theme.accent : '#000000';
        ctx.fillRect(60, topY, 260, 42);
        ctx.fillStyle = isDark ? '#000000' : '#FDC800';
        ctx.font = '900 18px monospace';
        ctx.fillText('⚡ DAILY VERDICT OS', 76, topY + 27);

        // Date Display
        ctx.fillStyle = isDark ? '#A0AEC0' : '#111111';
        ctx.font = '800 24px monospace';
        ctx.fillText(formattedDate.toUpperCase(), 340, topY + 28);

        // Day Streak Pill on Top Right
        ctx.fillStyle = isDark ? theme.accent : '#00E599';
        ctx.fillRect(width - 270, topY - 10, 210, 60);
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 4;
        ctx.strokeRect(width - 270, topY - 10, 210, 60);
        ctx.fillStyle = '#000000';
        ctx.font = '900 28px monospace';
        ctx.fillText(`DAY ${activeDayCount}`, width - 245, topY + 31);

        // Giant Background Day Typographic Watermark
        ctx.fillStyle = isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.05)';
        ctx.font = '900 320px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`0${activeDayCount}`.slice(-2), width / 2, 500);
        ctx.textAlign = 'left';

        // Rating Stars Banner
        const heroY = 230;
        ctx.fillStyle = isDark ? theme.accent : '#000000';
        ctx.font = '900 46px sans-serif';
        const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating);
        ctx.fillText(stars, 60, heroY);

        // Massive Stylized Verdict Title
        ctx.fillStyle = isDark ? '#FFFFFF' : '#000000';
        ctx.font = '900 96px sans-serif';
        ctx.fillText(verdict.toUpperCase(), 60, heroY + 95);

        // Score & Archetype Pill
        ctx.fillStyle = isDark ? theme.accent : '#000000';
        ctx.font = '800 24px monospace';
        ctx.fillText(`QUALITY: ${rating}.0/5.0  •  ${currentMood.tag}`, 60, heroY + 140);

        // Center Hero Mascot (600px, Perfectly Centered)
        const mascotSize = 600;
        const mascotX = (width - mascotSize) / 2;
        const mascotY = 420;

        ctx.save();
        ctx.shadowColor = isDark ? theme.accent : 'rgba(0, 0, 0, 0.25)';
        ctx.shadowBlur = isDark ? 45 : 25;
        ctx.shadowOffsetY = 12;
        try {
          ctx.drawImage(mascotImg, mascotX, mascotY, mascotSize, mascotSize);
        } catch (err) {}
        ctx.restore();

        // 3 Streetwear Metric Pills (Fills the Canvas Artistically!)
        const statsY = 1060;
        const pillWidth = (width - 160) / 3;

        const statPills = [
          { label: 'STREAK', val: `${activeDayCount} DAYS`, bg: isDark ? '#161F2E' : '#FFFFFF', border: isDark ? theme.accent : '#000000' },
          { label: 'SCORE', val: `${rating}.0 / 5.0`, bg: isDark ? '#161F2E' : '#FFFFFF', border: isDark ? theme.accent : '#000000' },
          { label: 'TIER', val: currentMood.persona, bg: isDark ? '#161F2E' : '#FFFFFF', border: isDark ? theme.accent : '#000000' }
        ];

        statPills.forEach((p, idx) => {
          const px = 60 + idx * (pillWidth + 20);
          ctx.fillStyle = '#000000';
          ctx.fillRect(px + 4, statsY + 4, pillWidth, 76);
          ctx.fillStyle = p.bg;
          ctx.fillRect(px, statsY, pillWidth, 76);
          ctx.strokeStyle = p.border;
          ctx.lineWidth = 3.5;
          ctx.strokeRect(px, statsY, pillWidth, 76);

          ctx.fillStyle = isDark ? '#8E9BAE' : '#666666';
          ctx.font = '800 16px monospace';
          ctx.fillText(p.label, px + 16, statsY + 28);

          ctx.fillStyle = isDark ? '#FFFFFF' : '#000000';
          ctx.font = '900 20px monospace';
          ctx.fillText(p.val, px + 16, statsY + 56);
        });

        // Reflection Card (Adaptive Height with Quotation Aesthetics)
        const quoteY = 1170;
        const quoteWidth = width - 120;
        const quoteHeight = 520;

        ctx.fillStyle = isDark ? 'rgba(0,0,0,0.6)' : '#000000';
        ctx.fillRect(68, quoteY + 10, quoteWidth, quoteHeight);

        ctx.fillStyle = isDark ? theme.cardBg : '#FFFFFF';
        ctx.fillRect(60, quoteY, quoteWidth, quoteHeight);
        ctx.strokeStyle = isDark ? theme.accent : '#000000';
        ctx.lineWidth = isDark ? 4 : 5;
        ctx.strokeRect(60, quoteY, quoteWidth, quoteHeight);

        // Header Tag
        ctx.fillStyle = isDark ? theme.accent : '#FDC800';
        ctx.fillRect(90, quoteY + 26, 300, 42);
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.strokeRect(90, quoteY + 26, 300, 42);
        ctx.fillStyle = '#000000';
        ctx.font = '900 18px monospace';
        ctx.fillText('📖 RAW DIARY REFLECTION', 106, quoteY + 53);

        // Big Aesthetic Quotation Mark
        ctx.fillStyle = isDark ? 'rgba(0, 229, 153, 0.15)' : 'rgba(0, 0, 0, 0.08)';
        ctx.font = '900 140px Georgia, serif';
        ctx.fillText('“', 90, quoteY + 160);

        // Monospace Notes Wrap
        ctx.fillStyle = isDark ? '#F1F5F9' : '#111111';
        ctx.font = '600 30px monospace';
        const maxTextWidth = quoteWidth - 80;
        const words = notes.split(' ');
        let line = '';
        let textY = quoteY + 130;
        const lineHeight = 48;
        const maxLines = 7;
        let linesCount = 0;

        for (let n = 0; n < words.length; n++) {
          const testLine = line + words[n] + ' ';
          const metrics = ctx.measureText(testLine);
          if (metrics.width > maxTextWidth && n > 0) {
            ctx.fillText(line, 95, textY);
            line = words[n] + ' ';
            textY += lineHeight;
            linesCount++;
            if (linesCount >= maxLines) {
              line += '...';
              break;
            }
          } else {
            line = testLine;
          }
        }
        ctx.fillText(line, 95, textY);

        // Mini 7-Day Performance Sparkline / Dot Matrix Equalizer
        const eqY = quoteY + quoteHeight - 65;
        ctx.fillStyle = isDark ? '#8E9BAE' : '#666666';
        ctx.font = '800 14px monospace';
        ctx.fillText('MOMENTUM MATRIX:', 95, eqY + 16);

        for (let i = 0; i < 7; i++) {
          const dotX = 270 + i * 40;
          const isFilled = i <= (rating + 1);
          ctx.fillStyle = isFilled ? (isDark ? theme.accent : '#000000') : (isDark ? '#2A3447' : '#E2E8F0');
          ctx.fillRect(dotX, eqY, 26, 22);
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(dotX, eqY, 26, 22);
        }

        // Footer Barcode & Identity
        const footerY = 1830;
        ctx.fillStyle = isDark ? theme.accent : '#000000';
        const barcodeX = width - 260;
        const barcodeWidths = [4, 8, 2, 6, 12, 4, 8, 2, 10, 4, 6, 8, 4, 12, 6, 4];
        let curX = barcodeX;
        for (let b = 0; b < barcodeWidths.length; b++) {
          ctx.fillRect(curX, footerY - 40, barcodeWidths[b], 40);
          curX += barcodeWidths[b] + 4;
        }

        ctx.fillStyle = isDark ? '#FFFFFF' : '#000000';
        ctx.font = '900 24px monospace';
        ctx.fillText(`LOGGED BY ${displayName.toUpperCase()}`, 60, footerY - 15);

        ctx.fillStyle = isDark ? '#94A3B8' : '#666666';
        ctx.font = '700 18px monospace';
        ctx.fillText('VERDICT OS • UNFILTERED ACCOUNTABILITY ENGINE', 60, footerY + 15);
      } 
      
      // =========================================================================
      // 📸 FORMAT B: 1:1 SOCIAL CARD (1080 x 1080) — SPLIT-COLUMN (ZERO COLLISIONS!)
      // =========================================================================
      else {
        const topY = 70;

        // Top Status Header
        ctx.fillStyle = isDark ? theme.accent : '#000000';
        ctx.fillRect(50, topY, 220, 38);
        ctx.fillStyle = isDark ? '#000000' : '#FDC800';
        ctx.font = '900 16px monospace';
        ctx.fillText('⚡ DAILY VERDICT', 62, topY + 25);

        // Date Display
        ctx.fillStyle = isDark ? '#A0AEC0' : '#111111';
        ctx.font = '800 20px monospace';
        ctx.fillText(formattedDate.toUpperCase(), 290, topY + 25);

        // Left Column (Width 520px): Typography, Rating, Stats & Reflection
        const leftX = 50;
        const leftY = 160;

        // Day Streak Badge
        ctx.fillStyle = isDark ? theme.accent : '#00E599';
        ctx.fillRect(leftX, leftY, 160, 48);
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.strokeRect(leftX, leftY, 160, 48);
        ctx.fillStyle = '#000000';
        ctx.font = '900 26px monospace';
        ctx.fillText(`DAY ${activeDayCount}`, leftX + 22, leftY + 34);

        // Stars
        ctx.fillStyle = isDark ? theme.accent : '#000000';
        ctx.font = '900 36px sans-serif';
        const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating);
        ctx.fillText(stars, leftX + 180, leftY + 36);

        // Huge Verdict Title
        ctx.fillStyle = isDark ? '#FFFFFF' : '#000000';
        ctx.font = '900 84px sans-serif';
        ctx.fillText(verdict.toUpperCase(), leftX, leftY + 125);

        // Subtitle
        ctx.fillStyle = isDark ? theme.accent : '#000000';
        ctx.font = '800 20px monospace';
        ctx.fillText(`SCORE: ${rating}.0/5.0  •  ${currentMood.persona}`, leftX, leftY + 165);

        // Compact Reflection Box in Left Column
        const boxY = leftY + 200;
        const boxWidth = 480;
        const boxHeight = 440;

        ctx.fillStyle = isDark ? 'rgba(0,0,0,0.5)' : '#000000';
        ctx.fillRect(leftX + 6, boxY + 6, boxWidth, boxHeight);

        ctx.fillStyle = isDark ? theme.cardBg : '#FFFFFF';
        ctx.fillRect(leftX, boxY, boxWidth, boxHeight);
        ctx.strokeStyle = isDark ? theme.accent : '#000000';
        ctx.lineWidth = 4;
        ctx.strokeRect(leftX, boxY, boxWidth, boxHeight);

        // Tape Badge
        ctx.fillStyle = isDark ? theme.accent : '#FDC800';
        ctx.fillRect(leftX + 20, boxY + 20, 240, 36);
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2.5;
        ctx.strokeRect(leftX + 20, boxY + 20, 240, 36);
        ctx.fillStyle = '#000000';
        ctx.font = '900 15px monospace';
        ctx.fillText('📖 RAW REFLECTION', leftX + 32, boxY + 44);

        // Wrapped Notes
        ctx.fillStyle = isDark ? '#F1F5F9' : '#111111';
        ctx.font = '600 24px monospace';
        const maxTextWidth = boxWidth - 40;
        const words = notes.split(' ');
        let line = '';
        let textY = boxY + 95;
        const lineHeight = 38;
        const maxLines = 7;
        let linesCount = 0;

        for (let n = 0; n < words.length; n++) {
          const testLine = line + words[n] + ' ';
          const metrics = ctx.measureText(testLine);
          if (metrics.width > maxTextWidth && n > 0) {
            ctx.fillText(line, leftX + 20, textY);
            line = words[n] + ' ';
            textY += lineHeight;
            linesCount++;
            if (linesCount >= maxLines) {
              line += '...';
              break;
            }
          } else {
            line = testLine;
          }
        }
        ctx.fillText(line, leftX + 20, textY);

        // Mini Matrix Equalizer in Left Box
        const eqY = boxY + boxHeight - 50;
        for (let i = 0; i < 7; i++) {
          const dotX = leftX + 20 + i * 36;
          const isFilled = i <= (rating + 1);
          ctx.fillStyle = isFilled ? (isDark ? theme.accent : '#000000') : (isDark ? '#2A3447' : '#E2E8F0');
          ctx.fillRect(dotX, eqY, 24, 18);
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(dotX, eqY, 24, 18);
        }

        // Right Column (Width 500px): Giant, Unobstructed Hero Mascot Art!
        const mascotSize = 510;
        const mascotX = 540;
        const mascotY = 160;

        ctx.save();
        ctx.shadowColor = isDark ? theme.accent : 'rgba(0, 0, 0, 0.25)';
        ctx.shadowBlur = isDark ? 40 : 20;
        ctx.shadowOffsetY = 10;
        try {
          ctx.drawImage(mascotImg, mascotX, mascotY, mascotSize, mascotSize);
        } catch (err) {}
        ctx.restore();

        // Footer Barcode & Identity (Bottom Full-Width)
        const footerY = 1010;
        ctx.fillStyle = isDark ? theme.accent : '#000000';
        const barcodeX = width - 240;
        const barcodeWidths = [4, 8, 2, 6, 12, 4, 8, 2, 10, 4, 6, 8, 4, 12, 6, 4];
        let curX = barcodeX;
        for (let b = 0; b < barcodeWidths.length; b++) {
          ctx.fillRect(curX, footerY - 35, barcodeWidths[b], 35);
          curX += barcodeWidths[b] + 3.5;
        }

        ctx.fillStyle = isDark ? '#FFFFFF' : '#000000';
        ctx.font = '900 22px monospace';
        ctx.fillText(`LOGGED BY ${displayName.toUpperCase()} • DAILY VERDICT`, 50, footerY - 5);
      }

      setPreviewUrl(canvas.toDataURL('image/png'));
      canvasRef.current = canvas;
    };

    if (!customMascotImg) {
      mascotImg.crossOrigin = 'anonymous';
      mascotImg.onload = drawCompleteCanvas;
      mascotImg.onerror = drawCompleteCanvas;
      mascotImg.src = mascotPath;
    } else {
      drawCompleteCanvas();
    }

  }, [isOpen, format, activeTheme, customMascotImg, selectedDateStr, activeEntry, activeDayCount, displayName, rating, verdict, notes, meta, formattedDate]);

  if (!isOpen) return null;

  const handleDownload = () => {
    if (!canvasRef.current) return;
    setDownloading(true);
    try {
      const link = document.createElement('a');
      link.download = `daily_verdict_${activeTheme}_${format}_${selectedDateStr || 'card'}.png`;
      link.href = canvasRef.current.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setTimeout(() => setDownloading(false), 1000);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="w-full max-w-xl bg-[#FFFDF5] rounded-3xl border-3 border-black p-4 sm:p-6 shadow-[6px_6px_0px_#000000] space-y-3"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b-2 border-black/10 pb-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-[#FDC800] border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_#000000]">
                <Sparkles className="w-5 h-5 text-black stroke-[2.5]" />
              </div>
              <div>
                <h3 className="font-display font-black text-base sm:text-xl uppercase leading-none">
                  Aesthetic Wallpaper Studio
                </h3>
                <span className="text-[11px] sm:text-xs font-mono text-neutral-600">
                  Streetwear poster & social media card generator
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-neutral-200 border-2 border-transparent hover:border-black cursor-pointer transition-all"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 📅 Date Navigator (Switch to Any Day!) */}
          <div className="flex items-center justify-between bg-white border-2 border-black p-1.5 sm:p-2 rounded-2xl shadow-[2px_2px_0px_#000000]">
            <button
              type="button"
              onClick={() => handleShiftDay(-1)}
              className="px-2.5 py-1.5 bg-neutral-100 hover:bg-[#FDC800] border-2 border-black rounded-xl font-mono text-xs font-black shadow-[1px_1px_0px_#000000] cursor-pointer flex items-center gap-1 transition-all"
              title="Previous Day"
            >
              <ChevronLeft className="w-4 h-4 stroke-[3]" />
              <span className="hidden sm:inline">PREV</span>
            </button>

            <div className="flex items-center gap-1.5 sm:gap-2">
              <Calendar className="w-4 h-4 text-black hidden sm:inline" />
              <input
                type="date"
                value={selectedDateStr}
                onChange={(e) => setSelectedDateStr(e.target.value)}
                className="bg-neutral-100 border-2 border-black rounded-xl px-2 py-1 font-mono text-xs font-black text-black shadow-[1px_1px_0px_#000000] cursor-pointer focus:outline-none"
              />
              <span className="px-2 py-1 rounded-lg bg-black text-[#FDC800] text-xs font-mono font-black">
                DAY {activeDayCount}
              </span>
            </div>

            <button
              type="button"
              onClick={() => handleShiftDay(1)}
              className="px-2.5 py-1.5 bg-neutral-100 hover:bg-[#FDC800] border-2 border-black rounded-xl font-mono text-xs font-black shadow-[1px_1px_0px_#000000] cursor-pointer flex items-center gap-1 transition-all"
              title="Next Day"
            >
              <span className="hidden sm:inline">NEXT</span>
              <ChevronRight className="w-4 h-4 stroke-[3]" />
            </button>
          </div>

          {/* Format Tabs & Distinct Themes */}
          <div className="space-y-2">
            {/* Format Selector */}
            <div className="grid grid-cols-2 gap-2 p-1.5 bg-neutral-100 rounded-2xl border-2 border-black">
              <button
                type="button"
                onClick={() => setFormat('wallpaper')}
                className={`py-2 rounded-xl font-display font-black text-xs uppercase flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                  format === 'wallpaper'
                    ? 'bg-[#FDC800] border-2 border-black text-black shadow-[2px_2px_0px_#000000]'
                    : 'text-neutral-600 hover:text-black'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span>9:16 Phone Wallpaper</span>
              </button>
              <button
                type="button"
                onClick={() => setFormat('social')}
                className={`py-2 rounded-xl font-display font-black text-xs uppercase flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                  format === 'social'
                    ? 'bg-[#FDC800] border-2 border-black text-black shadow-[2px_2px_0px_#000000]'
                    : 'text-neutral-600 hover:text-black'
                }`}
              >
                <Share2 className="w-4 h-4" />
                <span>1:1 Social Card</span>
              </button>
            </div>

            {/* 3 Radically Distinct Aesthetic Themes */}
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
              {THEMES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveTheme(t.id)}
                  className={`py-2 px-1.5 sm:px-2 rounded-xl border-2 border-black font-mono text-[10px] sm:text-[11px] font-black truncate cursor-pointer transition-all ${
                    activeTheme === t.id
                      ? 'bg-black text-white shadow-[2.5px_2.5px_0px_#000000] scale-[1.02]'
                      : 'bg-white text-black hover:bg-neutral-100'
                  }`}
                >
                  {t.name}
                </button>
              ))}
            </div>
          </div>

          {/* Mascot Info / Custom Swap */}
          <div className="flex items-center justify-between bg-neutral-100 border-2 border-black p-2 rounded-2xl">
            <div className="flex items-center gap-2">
              <span className="text-sm sm:text-base">🎭</span>
              <span className="text-[11px] sm:text-xs font-mono font-bold text-neutral-800 truncate">
                {customMascotImg ? 'Custom Mascot Active ✅' : `Mood Mascot: ${rating}★ Auto-Linked`}
              </span>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleMascotUpload}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-2.5 py-1 bg-white hover:bg-neutral-200 border-2 border-black rounded-xl font-mono text-[11px] sm:text-xs font-black text-black shadow-[1.5px_1.5px_0px_#000000] cursor-pointer flex items-center gap-1 shrink-0"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>CUSTOM STICKER</span>
            </button>
          </div>

          {/* Live Preview Container */}
          <div className="w-full flex items-center justify-center bg-neutral-950 rounded-2xl border-2 border-black p-3 max-h-[350px] overflow-hidden">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Aesthetic Card Preview"
                className={`rounded-xl border border-white/20 shadow-2xl object-contain ${
                  format === 'wallpaper' ? 'max-h-[320px] aspect-[9/16]' : 'max-h-[320px] aspect-square'
                }`}
              />
            ) : (
              <div className="text-white font-mono text-xs py-14">Rendering high-res poster artwork...</div>
            )}
          </div>

          {/* Action Footer (With Dedicated Mobile Close Button) */}
          <div className="flex items-center gap-2.5 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="py-3.5 px-4 bg-neutral-100 hover:bg-neutral-200 text-black font-display font-black text-xs uppercase rounded-2xl border-2 border-black shadow-[2px_2px_0px_#000000] cursor-pointer"
            >
              CLOSE
            </button>

            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading || !previewUrl}
              className="flex-1 py-3.5 bg-[#00E599] hover:bg-emerald-400 text-black font-display font-black text-xs sm:text-sm uppercase rounded-2xl border-3 border-black shadow-[3px_3px_0px_#000000] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4 stroke-[3]" />
              <span>{downloading ? 'GENERATING POSTER PNG...' : 'DOWNLOAD HIGH-RES POSTER'}</span>
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
