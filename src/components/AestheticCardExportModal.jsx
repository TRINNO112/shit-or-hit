import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Smartphone, Share2, Sparkles, X, Check, Image as ImageIcon, Flame, Zap, Palette, Upload, Calendar, ChevronLeft, ChevronRight, Layers, RotateCcw } from 'lucide-react';
import { ratingMeta, getStickerVault, getActiveStickerId } from '../services/api';
import StickerVaultModal from './StickerVaultModal';

// Direct ES6 Module Imports for 100% Guaranteed Asset Resolution
import mascot1 from '../assets/mascots/mascot_1_rough.png';
import mascot2 from '../assets/mascots/mascot_2_down.png';
import mascot3 from '../assets/mascots/mascot_3_okay.png';
import mascot4 from '../assets/mascots/mascot_4_good.png';
import mascot5 from '../assets/mascots/mascot_5_peak.png';

const THEMES = [
  {
    id: 'streetwear',
    name: '⚡ Gold',
    bg: '#FFFDF0',
    accent: '#FDC800',
    subAccent: '#00E599',
    text: '#000000',
    cardBg: '#FFFFFF',
    glow: 'rgba(253, 200, 0, 0.4)'
  },
  {
    id: 'cyberpunk',
    name: '🖤 Obsidian',
    bg: '#080A0F',
    accent: '#00E599',
    subAccent: '#00D8F6',
    text: '#FFFFFF',
    cardBg: 'rgba(18, 24, 38, 0.95)',
    glow: 'rgba(0, 229, 153, 0.4)'
  },
  {
    id: 'sunset',
    name: '🔥 Crimson',
    bg: '#140C1D',
    accent: '#FF4D6D',
    subAccent: '#FF9E00',
    text: '#FFFFFF',
    cardBg: 'rgba(34, 18, 48, 0.95)',
    glow: 'rgba(255, 77, 109, 0.45)'
  }
];

const MASCOT_MAP = {
  5: mascot5,
  4: mascot4,
  3: mascot3,
  2: mascot2,
  1: mascot1
};

// Global Preloaded Image Cache to Guarantee Instant Canvas Rendering
const PRELOADED_MASCOTS = {};
if (typeof window !== 'undefined') {
  [
    [1, mascot1],
    [2, mascot2],
    [3, mascot3],
    [4, mascot4],
    [5, mascot5]
  ].forEach(([star, src]) => {
    const img = new Image();
    img.src = src;
    PRELOADED_MASCOTS[star] = img;
  });
}

const MOOD_PUNCHLINES = {
  5: 'ABSOLUTE PEAK. UNSTOPPABLE MOMENTUM & VELOCITY.',
  4: 'LOCKED IN & FOCUSED. DEEP FLOW EXECUTED.',
  3: 'BASELINE HELD. DISCIPLINE OVER MOTIVATION.',
  2: 'LOW BATTERY DAY. CHARGE UP & RELOAD FOR TOMORROW.',
  1: 'SURVIVED THE TRENCHES. DUST OFF, WE GO AGAIN.'
};

export default function AestheticCardExportModal({
  isOpen,
  onClose,
  entry,
  dateStr,
  dayCount,
  entries = {},
  startDate = '2026-08-01',
  displayName = 'Daily Operator',
  isEmbedded = false
}) {
  const [format, setFormat] = useState('wallpaper'); // 'wallpaper' (Story Poster) | 'social' (Feed Card)
  const [activeTheme, setActiveTheme] = useState('streetwear');
  const [selectedDateStr, setSelectedDateStr] = useState(dateStr || new Date().toISOString().slice(0, 10));
  const [customMascotImg, setCustomMascotImg] = useState(null);
  const [loadedMascotImg, setLoadedMascotImg] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [showStickerVault, setShowStickerVault] = useState(false);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Sync selected date & active sticker from vault when modal opens
  useEffect(() => {
    if (dateStr) {
      setSelectedDateStr(dateStr);
    }
  }, [dateStr, isOpen]);

  useEffect(() => {
    if (isOpen) {
      const activeId = getActiveStickerId();
      if (activeId && activeId !== 'auto') {
        const vault = getStickerVault();
        const found = vault.find(s => s.id === activeId);
        if (found && found.dataUrl) {
          const img = new Image();
          img.onload = () => setCustomMascotImg(img);
          img.src = found.dataUrl;
        }
      }
    }
  }, [isOpen]);

  // Derive active day entry and day index
  const activeEntry = entries[selectedDateStr] || (selectedDateStr === dateStr ? entry : null);
  const rating = activeEntry?.rating || 3;
  const verdict = activeEntry?.verdict || ratingMeta[rating]?.title || 'Verdict';
  const rawNotes = activeEntry?.notes ? activeEntry.notes.trim() : '';
  const hasNotes = Boolean(rawNotes.length > 0);
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

  const mascotUrl = MASCOT_MAP[rating] || MASCOT_MAP[3];

  // Foolproof Mascot Preload Engine with Synchronous Complete Check
  useEffect(() => {
    if (customMascotImg) {
      setLoadedMascotImg(customMascotImg);
      return;
    }

    const preloaded = PRELOADED_MASCOTS[rating] || PRELOADED_MASCOTS[3];
    if (preloaded && preloaded.complete && preloaded.naturalWidth > 0) {
      setLoadedMascotImg(preloaded);
      return;
    }

    let active = true;
    const img = new Image();
    const handleReady = () => {
      if (active) setLoadedMascotImg(img);
    };

    img.onload = handleReady;
    img.onerror = (e) => {
      console.error('Failed to load mascot sticker:', mascotUrl, e);
    };
    img.src = mascotUrl;

    if (img.complete && img.naturalWidth > 0) {
      handleReady();
    }

    return () => {
      active = false;
    };
  }, [rating, mascotUrl, customMascotImg]);

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

  // Master Canvas Drawing Engine
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

    // 1. Background Fill & Textures
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

      // Dynamic Diagonal Streetwear Ribbon (Overshot by 20px to eliminate any subpixel corner/border seam)
      ctx.fillStyle = '#FDC800';
      ctx.beginPath();
      ctx.moveTo(-20, -20);
      ctx.lineTo(width + 20, -20);
      ctx.lineTo(width + 20, format === 'wallpaper' ? 220 : 160);
      ctx.lineTo(-20, format === 'wallpaper' ? 340 : 260);
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
        format === 'wallpaper' ? width / 2 : 780,
        format === 'wallpaper' ? 820 : 520,
        60,
        format === 'wallpaper' ? width / 2 : 780,
        format === 'wallpaper' ? 820 : 520,
        format === 'wallpaper' ? 580 : 460
      );
      glow.addColorStop(0, 'rgba(0, 229, 153, 0.35)');
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
        format === 'wallpaper' ? width / 2 : 780,
        format === 'wallpaper' ? 820 : 520,
        60,
        format === 'wallpaper' ? width / 2 : 780,
        format === 'wallpaper' ? 820 : 520,
        format === 'wallpaper' ? 600 : 460
      );
      glow.addColorStop(0, 'rgba(255, 77, 109, 0.42)');
      glow.addColorStop(0.6, 'rgba(255, 158, 0, 0.16)');
      glow.addColorStop(1, 'transparent');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, width, height);
    }

    const moodMeta = {
      5: { tag: 'PEAK VELOCITY • UNSTOPPABLE', persona: 'GOD MODE DEMON', color: '#FDC800' },
      4: { tag: 'LOCKED IN • MOMENTUM FLOW', persona: 'FOCUS WARRIOR', color: '#00E599' },
      3: { tag: 'SOLID BASELINE • HELD THE LINE', persona: 'STOIC SUSTAINER', color: '#CBD5E1' },
      2: { tag: 'LOW BATTERY • 23% CHARGE', persona: 'RECOVERY AGENT', color: '#FF8A00' },
      1: { tag: 'TRENCH SURVIVOR • 3:45 AM GOBLIN', persona: 'DOPAMINE GOBLIN', color: '#FF4D4D' }
    };
    const currentMood = moodMeta[rating] || moodMeta[3];
    const punchline = MOOD_PUNCHLINES[rating] || MOOD_PUNCHLINES[3];
    const authorWatermark = (displayName && displayName.trim()) ? displayName.trim().toUpperCase() : 'DAILY OPERATOR';

    // Guaranteed Image Target (Loaded State or Preloaded Cache)
    const targetMascot = loadedMascotImg || PRELOADED_MASCOTS[rating] || PRELOADED_MASCOTS[3];

    // =========================================================================
    // 📱 FORMAT A: 9:16 STORY POSTER (1080 x 1920)
    // =========================================================================
    if (format === 'wallpaper') {
      const topY = 90;

      // Top Status Badge & Tape
      ctx.fillStyle = isDark ? theme.accent : '#000000';
      ctx.fillRect(60, topY, 260, 44);
      ctx.fillStyle = isDark ? '#000000' : '#FDC800';
      ctx.font = '900 18px "JetBrains Mono", monospace';
      ctx.fillText('⚡ DAILY VERDICT OS', 76, topY + 28);

      // Date Display
      ctx.fillStyle = isDark ? '#A0AEC0' : '#111111';
      ctx.font = '800 24px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(formattedDate.toUpperCase(), 340, topY + 30);

      // Day Streak Pill on Top Right
      ctx.fillStyle = isDark ? theme.accent : '#00E599';
      ctx.fillRect(width - 280, topY - 10, 220, 64);
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 4;
      ctx.strokeRect(width - 280, topY - 10, 220, 64);
      ctx.fillStyle = '#000000';
      ctx.font = '900 32px "Outfit", sans-serif';
      ctx.fillText(`DAY ${activeDayCount}`, width - 250, topY + 33);

      // Giant Background Day Typographic Watermark
      ctx.fillStyle = isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.05)';
      ctx.font = '900 320px "Outfit", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`0${activeDayCount}`.slice(-2), width / 2, 500);
      ctx.textAlign = 'left';

      // Rating Stars Banner
      const heroY = 230;
      ctx.fillStyle = isDark ? theme.accent : '#000000';
      ctx.font = '900 48px sans-serif';
      const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating);
      ctx.fillText(stars, 60, heroY);

      // Massive Stylized Verdict Title
      ctx.fillStyle = isDark ? '#FFFFFF' : '#000000';
      ctx.font = '900 108px "Outfit", sans-serif';
      ctx.fillText(verdict.toUpperCase(), 60, heroY + 105);

      // Score & Archetype Pill
      ctx.fillStyle = isDark ? theme.accent : '#000000';
      ctx.font = '800 24px "JetBrains Mono", monospace';
      ctx.fillText(`SCORE: ${rating}.0 / 5.0  •  ${currentMood.tag}`, 60, heroY + 155);

      // -----------------------------------------------------------------------
      // CASE 1: USER HAS NO DIARY NOTES -> MEGA MASCOT SPOTLIGHT POSTER
      // (Lowered to 475px as requested)
      // -----------------------------------------------------------------------
      if (!hasNotes) {
        const megaSize = 780;
        const megaX = (width - megaSize) / 2;
        const megaY = 475;

        if (targetMascot) {
          ctx.save();
          ctx.shadowColor = isDark ? theme.accent : 'rgba(0, 0, 0, 0.3)';
          ctx.shadowBlur = isDark ? 55 : 30;
          ctx.shadowOffsetY = 15;
          try {
            ctx.drawImage(targetMascot, megaX, megaY, megaSize, megaSize);
          } catch (err) { }
          ctx.restore();
        }

        // Punchline Banner
        const punchY = 1320;
        const punchWidth = width - 120;
        const punchHeight = 160;

        ctx.fillStyle = isDark ? 'rgba(0,0,0,0.6)' : '#000000';
        ctx.fillRect(68, punchY + 10, punchWidth, punchHeight);

        ctx.fillStyle = isDark ? theme.cardBg : '#FFFFFF';
        ctx.fillRect(60, punchY, punchWidth, punchHeight);
        ctx.strokeStyle = isDark ? theme.accent : '#000000';
        ctx.lineWidth = isDark ? 4 : 5;
        ctx.strokeRect(60, punchY, punchWidth, punchHeight);

        // Punchline Tape Header
        ctx.fillStyle = isDark ? theme.accent : '#FDC800';
        ctx.fillRect(90, punchY + 22, 280, 40);
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2.5;
        ctx.strokeRect(90, punchY + 22, 280, 40);
        ctx.fillStyle = '#000000';
        ctx.font = '900 17px "JetBrains Mono", monospace';
        ctx.fillText('⚡ DAILY DIRECTIVE', 106, punchY + 48);

        // High-Energy Punchline Text
        ctx.fillStyle = isDark ? '#FFFFFF' : '#000000';
        ctx.font = '900 32px "Outfit", sans-serif';
        ctx.fillText(punchline, 95, punchY + 115);

        // 3 Metric Pills below Punchline
        const statsY = 1520;
        const pillWidth = (width - 160) / 3;

        const statPills = [
          { label: 'STREAK', val: `${activeDayCount} DAYS`, bg: isDark ? '#161F2E' : '#FFFFFF', border: isDark ? theme.accent : '#000000' },
          { label: 'SCORE', val: `${rating}.0 / 5.0`, bg: isDark ? '#161F2E' : '#FFFFFF', border: isDark ? theme.accent : '#000000' },
          { label: 'ARCHETYPE', val: currentMood.persona, bg: isDark ? '#161F2E' : '#FFFFFF', border: isDark ? theme.accent : '#000000' }
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
          ctx.font = '800 16px "JetBrains Mono", monospace';
          ctx.fillText(p.label, px + 16, statsY + 28);

          ctx.fillStyle = isDark ? '#FFFFFF' : '#000000';
          ctx.font = '900 20px "Outfit", sans-serif';
          ctx.fillText(p.val, px + 16, statsY + 56);
        });
      }

      // -----------------------------------------------------------------------
      // CASE 2: USER HAS WRITTEN DIARY REFLECTION
      // (Lowered to 425px as requested)
      // -----------------------------------------------------------------------
      else {
        const mascotSize = 560;
        const mascotX = (width - mascotSize) / 2;
        const mascotY = 425;

        if (targetMascot) {
          ctx.save();
          ctx.shadowColor = isDark ? theme.accent : 'rgba(0, 0, 0, 0.25)';
          ctx.shadowBlur = isDark ? 45 : 25;
          ctx.shadowOffsetY = 12;
          try {
            ctx.drawImage(targetMascot, mascotX, mascotY, mascotSize, mascotSize);
          } catch (err) { }
          ctx.restore();
        }

        // 3 Metric Pills
        const statsY = 1010;
        const pillWidth = (width - 160) / 3;

        const statPills = [
          { label: 'STREAK', val: `${activeDayCount} DAYS`, bg: isDark ? '#161F2E' : '#FFFFFF', border: isDark ? theme.accent : '#000000' },
          { label: 'SCORE', val: `${rating}.0 / 5.0`, bg: isDark ? '#161F2E' : '#FFFFFF', border: isDark ? theme.accent : '#000000' },
          { label: 'TIER', val: currentMood.persona, bg: isDark ? '#161F2E' : '#FFFFFF', border: isDark ? theme.accent : '#000000' }
        ];

        statPills.forEach((p, idx) => {
          const px = 60 + idx * (pillWidth + 20);
          ctx.fillStyle = '#000000';
          ctx.fillRect(px + 4, statsY + 4, pillWidth, 72);
          ctx.fillStyle = p.bg;
          ctx.fillRect(px, statsY, pillWidth, 72);
          ctx.strokeStyle = p.border;
          ctx.lineWidth = 3.5;
          ctx.strokeRect(px, statsY, pillWidth, 72);

          ctx.fillStyle = isDark ? '#8E9BAE' : '#666666';
          ctx.font = '800 15px "JetBrains Mono", monospace';
          ctx.fillText(p.label, px + 16, statsY + 26);

          ctx.fillStyle = isDark ? '#FFFFFF' : '#000000';
          ctx.font = '900 19px "Outfit", sans-serif';
          ctx.fillText(p.val, px + 16, statsY + 52);
        });

        // Reflection Box
        const quoteY = 1110;
        const quoteWidth = width - 120;
        const quoteHeight = 580;

        ctx.fillStyle = isDark ? 'rgba(0,0,0,0.6)' : '#000000';
        ctx.fillRect(68, quoteY + 10, quoteWidth, quoteHeight);

        ctx.fillStyle = isDark ? theme.cardBg : '#FFFFFF';
        ctx.fillRect(60, quoteY, quoteWidth, quoteHeight);
        ctx.strokeStyle = isDark ? theme.accent : '#000000';
        ctx.lineWidth = isDark ? 4 : 5;
        ctx.strokeRect(60, quoteY, quoteWidth, quoteHeight);

        // Header Tape
        ctx.fillStyle = isDark ? theme.accent : '#FDC800';
        ctx.fillRect(90, quoteY + 26, 300, 42);
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.strokeRect(90, quoteY + 26, 300, 42);
        ctx.fillStyle = '#000000';
        ctx.font = '900 18px "JetBrains Mono", monospace';
        ctx.fillText('📖 RAW DIARY REFLECTION', 106, quoteY + 53);

        // Big Quotation Mark
        ctx.fillStyle = isDark ? 'rgba(0, 229, 153, 0.15)' : 'rgba(0, 0, 0, 0.08)';
        ctx.font = '900 140px Georgia, serif';
        ctx.fillText('“', 90, quoteY + 160);

        // Notes Wrap
        ctx.fillStyle = isDark ? '#F1F5F9' : '#111111';
        ctx.font = '600 30px "Plus Jakarta Sans", monospace';
        const maxTextWidth = quoteWidth - 80;
        const words = rawNotes.split(' ');
        let line = '';
        let textY = quoteY + 130;
        const lineHeight = 48;
        const maxLines = 8;
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
      }

      // Footer Barcode & Dynamic Creator Identity
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
      ctx.font = '900 24px "Outfit", sans-serif';
      ctx.fillText(`LOGGED BY ${authorWatermark}`, 60, footerY - 15);

      ctx.fillStyle = isDark ? '#94A3B8' : '#666666';
      ctx.font = '700 18px "JetBrains Mono", monospace';
      ctx.fillText('VERDICT OS • UNFILTERED ACCOUNTABILITY ENGINE', 60, footerY + 15);
    }

    // =========================================================================
    // 📸 FORMAT B: 1:1 FEED CARD (1080 x 1080)
    // =========================================================================
    else {
      const topY = 70;

      // Top Status Header
      ctx.fillStyle = isDark ? theme.accent : '#000000';
      ctx.fillRect(50, topY, 230, 40);
      ctx.fillStyle = isDark ? '#000000' : '#FDC800';
      ctx.font = '900 17px "JetBrains Mono", monospace';
      ctx.fillText('⚡ DAILY VERDICT', 64, topY + 26);

      // Date Display
      ctx.fillStyle = isDark ? '#A0AEC0' : '#111111';
      ctx.font = '800 22px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(formattedDate.toUpperCase(), 300, topY + 27);

      // Left Column
      const leftX = 50;
      const leftY = 150;

      // Day Streak Badge
      ctx.fillStyle = isDark ? theme.accent : '#00E599';
      ctx.fillRect(leftX, leftY, 180, 52);
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3.5;
      ctx.strokeRect(leftX, leftY, 180, 52);
      ctx.fillStyle = '#000000';
      ctx.font = '900 30px "Outfit", sans-serif';
      ctx.fillText(`DAY ${activeDayCount}`, leftX + 26, leftY + 37);

      // Stars
      ctx.fillStyle = isDark ? theme.accent : '#000000';
      ctx.font = '900 40px sans-serif';
      const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating);
      ctx.fillText(stars, leftX + 205, leftY + 38);

      // Huge Verdict Title
      ctx.fillStyle = isDark ? '#FFFFFF' : '#000000';
      ctx.font = '900 92px "Outfit", sans-serif';
      ctx.fillText(verdict.toUpperCase(), leftX, leftY + 135);

      // Subtitle
      ctx.fillStyle = isDark ? theme.accent : '#000000';
      ctx.font = '800 22px "JetBrains Mono", monospace';
      ctx.fillText(`SCORE: ${rating}.0/5.0  •  ${currentMood.persona}`, leftX, leftY + 180);

      // Left Box Content (Either Notes or Punchline Directive)
      const boxY = leftY + 215;
      const boxWidth = 470;
      const boxHeight = 485;

      ctx.fillStyle = isDark ? 'rgba(0,0,0,0.5)' : '#000000';
      ctx.fillRect(leftX + 6, boxY + 6, boxWidth, boxHeight);

      ctx.fillStyle = isDark ? theme.cardBg : '#FFFFFF';
      ctx.fillRect(leftX, boxY, boxWidth, boxHeight);
      ctx.strokeStyle = isDark ? theme.accent : '#000000';
      ctx.lineWidth = 4;
      ctx.strokeRect(leftX, boxY, boxWidth, boxHeight);

      if (hasNotes) {
        // Tape Badge
        ctx.fillStyle = isDark ? theme.accent : '#FDC800';
        ctx.fillRect(leftX + 20, boxY + 20, 250, 38);
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2.5;
        ctx.strokeRect(leftX + 20, boxY + 20, 250, 38);
        ctx.fillStyle = '#000000';
        ctx.font = '900 16px "JetBrains Mono", monospace';
        ctx.fillText('📖 RAW REFLECTION', leftX + 32, boxY + 45);

        // Notes
        ctx.fillStyle = isDark ? '#F1F5F9' : '#111111';
        ctx.font = '600 25px "Plus Jakarta Sans", monospace';
        const maxTextWidth = boxWidth - 45;
        const words = rawNotes.split(' ');
        let line = '';
        let textY = boxY + 105;
        const lineHeight = 40;
        const maxLines = 7;
        let linesCount = 0;

        for (let n = 0; n < words.length; n++) {
          const testLine = line + words[n] + ' ';
          const metrics = ctx.measureText(testLine);
          if (metrics.width > maxTextWidth && n > 0) {
            ctx.fillText(line, leftX + 22, textY);
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
        ctx.fillText(line, leftX + 22, textY);
      } else {
        // No Notes -> Render Directive Punchline in Left Card
        ctx.fillStyle = isDark ? theme.accent : '#FDC800';
        ctx.fillRect(leftX + 20, boxY + 24, 250, 38);
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2.5;
        ctx.strokeRect(leftX + 20, boxY + 24, 250, 38);
        ctx.fillStyle = '#000000';
        ctx.font = '900 16px "JetBrains Mono", monospace';
        ctx.fillText('⚡ DAILY DIRECTIVE', leftX + 32, boxY + 49);

        ctx.fillStyle = isDark ? '#FFFFFF' : '#000000';
        ctx.font = '900 32px "Outfit", sans-serif';

        const words = punchline.split(' ');
        let line = '';
        let textY = boxY + 130;
        const lineHeight = 46;
        for (let n = 0; n < words.length; n++) {
          const testLine = line + words[n] + ' ';
          const metrics = ctx.measureText(testLine);
          if (metrics.width > (boxWidth - 45) && n > 0) {
            ctx.fillText(line, leftX + 22, textY);
            line = words[n] + ' ';
            textY += lineHeight;
          } else {
            line = testLine;
          }
        }
        ctx.fillText(line, leftX + 22, textY);
      }

      // Mini Matrix Equalizer in Left Box
      const eqY = boxY + boxHeight - 55;
      for (let i = 0; i < 7; i++) {
        const dotX = leftX + 22 + i * 36;
        const isFilled = i <= (rating + 1);
        ctx.fillStyle = isFilled ? (isDark ? theme.accent : '#000000') : (isDark ? '#2A3447' : '#E2E8F0');
        ctx.fillRect(dotX, eqY, 24, 18);
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(dotX, eqY, 24, 18);
      }

      // Right Column: Mascot Aligned Harmoniously with Left Box Level (Lowered to y: 236 as requested)
      const mascotSize = 560;
      const mascotX = 510;
      const mascotY = 300;

      if (targetMascot) {
        ctx.save();
        ctx.shadowColor = isDark ? theme.accent : 'rgba(0, 0, 0, 0.25)';
        ctx.shadowBlur = isDark ? 40 : 20;
        ctx.shadowOffsetY = 10;
        try {
          ctx.drawImage(targetMascot, mascotX, mascotY, mascotSize, mascotSize);
        } catch (err) { }
        ctx.restore();
      }

      // Footer Barcode & Identity
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
      ctx.font = '900 24px "Outfit", sans-serif';
      ctx.fillText(`LOGGED BY ${authorWatermark} • DAILY VERDICT`, 50, footerY - 5);
    }

    setPreviewUrl(canvas.toDataURL('image/png'));
    canvasRef.current = canvas;

  }, [isOpen, format, activeTheme, loadedMascotImg, selectedDateStr, displayName, activeEntry, activeDayCount, rating, verdict, rawNotes, hasNotes, meta, formattedDate]);

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

  if (!isOpen) return null;

  const contentJSX = (
    <div
      className={`w-full bg-[#FFFDF5] rounded-3xl border-3 border-black p-4 sm:p-6 shadow-[6px_6px_0px_#000000] space-y-4 ${
        isEmbedded ? '' : 'max-w-4xl max-h-[90vh] flex flex-col my-auto'
      }`}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Pinned Header */}
      <div className="flex items-center justify-between border-b-2 border-black/10 pb-3 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-[#FDC800] border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_#000000]">
            <Sparkles className="w-5 h-5 text-black stroke-[2.5]" />
          </div>
          <div>
            <h3 className="font-display font-black text-lg sm:text-xl uppercase leading-none">
              Wallpaper Studio
            </h3>
            <span className="text-xs font-mono text-neutral-600">
              Streetwear story posters & feed cards
            </span>
          </div>
        </div>
        {!isEmbedded && (
          <button
            type="button"
            onClick={onClose}
            className="p-2 sm:p-2.5 rounded-xl bg-[#FF4D4D] hover:bg-red-600 border-2 border-black text-black hover:text-white cursor-pointer shadow-[2px_2px_0px_#000000] active:scale-95 transition-all shrink-0"
            title="Close Wallpaper Studio"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5 stroke-3" />
          </button>
        )}
      </div>

          {/* Scrollable Middle Container with Responsive 2-Column Grid on Desktop */}
          <div className="overflow-y-auto flex-1 pr-1">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
              
              {/* LEFT COLUMN: Controls (6 cols on desktop, aligned to top) */}
              <div className="md:col-span-6 space-y-3.5">

                {/* 📅 Date Navigator (Spacious with Wide Gap between Date and Day) */}
                <div className="flex items-center justify-between bg-white border-2 border-black p-2 rounded-2xl shadow-[2px_2px_0px_#000000]">
                  <button
                    type="button"
                    onClick={() => handleShiftDay(-1)}
                    className="px-2.5 py-1.5 bg-neutral-100 hover:bg-[#FDC800] border-2 border-black rounded-xl font-mono text-xs font-black shadow-[1px_1px_0px_#000000] cursor-pointer flex items-center gap-1 transition-all shrink-0"
                    title="Previous Day"
                  >
                    <ChevronLeft className="w-3.5 h-3.5 stroke-3" />
                    <span className="hidden sm:inline">PREV</span>
                  </button>

                  {/* Centered with Distinct Wide Gap */}
                  <div className="flex items-center justify-center gap-4 sm:gap-6 flex-1 px-2">
                    <input
                      type="date"
                      value={selectedDateStr}
                      onChange={(e) => setSelectedDateStr(e.target.value)}
                      className="bg-neutral-100 border-2 border-black rounded-xl px-2.5 py-1.5 font-mono text-xs font-black text-black shadow-[1.5px_1.5px_0px_#000000] cursor-pointer focus:outline-none"
                    />
                    <span className="px-3 py-1.5 rounded-xl bg-black text-[#FDC800] text-xs font-mono font-black shrink-0 shadow-[1.5px_1.5px_0px_#000000]">
                      DAY {activeDayCount}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleShiftDay(1)}
                    className="px-2.5 py-1.5 bg-neutral-100 hover:bg-[#FDC800] border-2 border-black rounded-xl font-mono text-xs font-black shadow-[1px_1px_0px_#000000] cursor-pointer flex items-center gap-1 transition-all shrink-0"
                    title="Next Day"
                  >
                    <span className="hidden sm:inline">NEXT</span>
                    <ChevronRight className="w-3.5 h-3.5 stroke-3" />
                  </button>
                </div>

                {/* Format Tabs - Seamless Segmented Control */}
                <div className="grid grid-cols-2 bg-neutral-100 rounded-2xl border-2 border-black overflow-hidden shadow-[2px_2px_0px_#000000]">
                  <button
                    type="button"
                    onClick={() => setFormat('wallpaper')}
                    className={`py-2.5 px-3 font-display font-black text-xs uppercase flex items-center justify-center gap-2 cursor-pointer transition-all ${format === 'wallpaper'
                      ? 'bg-[#FDC800] text-black shadow-inner'
                      : 'bg-transparent text-neutral-600 hover:text-black hover:bg-neutral-200'
                      }`}
                  >
                    <Smartphone className="w-4 h-4 stroke-[2.5]" />
                    <span>STORY POSTER</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormat('social')}
                    className={`py-2.5 px-3 font-display font-black text-xs uppercase flex items-center justify-center gap-2 cursor-pointer transition-all border-l-2 border-black ${format === 'social'
                      ? 'bg-[#FDC800] text-black shadow-inner'
                      : 'bg-transparent text-neutral-600 hover:text-black hover:bg-neutral-200'
                      }`}
                  >
                    <Share2 className="w-4 h-4 stroke-[2.5]" />
                    <span>FEED CARD</span>
                  </button>
                </div>

                {/* 3 Themes - Seamless Segmented Control */}
                <div className="grid grid-cols-3 bg-neutral-100 rounded-2xl border-2 border-black overflow-hidden shadow-[2px_2px_0px_#000000]">
                  {THEMES.map((t, idx) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setActiveTheme(t.id)}
                      className={`py-2 px-2 font-mono text-xs font-black text-center cursor-pointer transition-all ${
                        idx > 0 ? 'border-l-2 border-black' : ''
                      } ${activeTheme === t.id
                        ? 'bg-black text-[#FDC800]'
                        : 'bg-white text-neutral-700 hover:bg-neutral-100'
                        }`}
                    >
                      {t.name}
                    </button>
                  ))}
                </div>

                {/* Sticker Module & Mascot Manager Bar */}
                <div className="bg-white border-2 border-black p-3 rounded-2xl shadow-[2px_2px_0px_#000000] space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-8 h-8 rounded-lg border border-black bg-[#FDC800] flex items-center justify-center shrink-0 shadow-[1px_1px_0px_#000000] p-0.5 overflow-hidden">
                        {loadedMascotImg ? (
                          <img src={loadedMascotImg.src} alt="Active Sticker" className="w-full h-full object-contain" />
                        ) : (
                          <Sparkles className="w-4 h-4 text-black" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <span className="font-display font-black text-xs uppercase text-black block truncate">
                          {customMascotImg ? 'Custom Sticker Active' : `Mood: ${rating}★ Auto-Linked`}
                        </span>
                        <span className="text-[10px] font-mono text-neutral-500 block truncate">
                          {customMascotImg ? 'Using custom sticker from vault' : 'Adapts automatically to mood rating'}
                        </span>
                      </div>
                    </div>

                    {customMascotImg && (
                      <button
                        type="button"
                        onClick={() => setCustomMascotImg(null)}
                        className="px-2 py-1 bg-neutral-100 hover:bg-neutral-200 border border-black rounded-lg text-[10px] font-mono font-bold text-neutral-700 cursor-pointer flex items-center gap-1 active:scale-95 transition-all"
                        title="Reset to default mood mascot"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>RESET</span>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-1 border-t border-black/10">
                    <button
                      type="button"
                      onClick={() => setShowStickerVault(true)}
                      className="flex-1 py-1.5 px-2 bg-[#FDC800] hover:bg-amber-400 border-2 border-black rounded-xl font-mono text-xs font-black text-black shadow-[1.5px_1.5px_0px_#000000] cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>STICKER VAULT</span>
                    </button>

                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/png,image/webp,image/svg+xml,image/jpeg"
                      className="hidden"
                      onChange={handleMascotUpload}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="py-1.5 px-3 bg-white hover:bg-neutral-100 border-2 border-black rounded-xl font-mono text-xs font-black text-black shadow-[1.5px_1.5px_0px_#000000] cursor-pointer flex items-center gap-1 active:scale-95 transition-all shrink-0"
                      title="Upload any PNG transparent sticker"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>UPLOAD</span>
                    </button>
                  </div>
                </div>

                {/* Info Callout */}
                <div className="hidden md:block bg-neutral-100 border-2 border-black rounded-2xl p-3 text-xs font-mono text-neutral-700">
                  ⚡ <span className="font-bold text-black">High-Res Export:</span> Rendered in 1080p lossless PNG, ready for wallpaper lockscreen or social status updates.
                </div>

              </div>

              {/* RIGHT COLUMN: Full Natural Aspect Ratio Preview (6 cols on desktop) */}
              <div className="md:col-span-6 flex items-center justify-center p-1">
                {previewUrl ? (
                  <div className={`rounded-2xl border-3 border-black shadow-[6px_6px_0px_#000000] overflow-hidden bg-black flex items-center justify-center ${
                    format === 'wallpaper'
                      ? 'max-h-115 aspect-9/16'
                      : 'max-h-105 aspect-square'
                  }`}>
                    <img
                      src={previewUrl}
                      alt="Aesthetic Card Preview"
                      className="w-full h-full object-contain block"
                    />
                  </div>
                ) : (
                  <div className="text-neutral-500 font-mono text-xs py-16 text-center">
                    Rendering high-res poster artwork...
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* Pinned Action Footer */}
          <div className="flex items-center gap-2 sm:gap-3 pt-2.5 sm:pt-3 border-t-2 border-black/10 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 sm:py-3 px-3.5 sm:px-5 bg-neutral-100 hover:bg-neutral-200 text-black font-display font-black text-xs uppercase rounded-2xl border-2 border-black shadow-[2px_2px_0px_#000000] cursor-pointer shrink-0"
            >
              CLOSE
            </button>

            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading || !previewUrl}
              className="flex-1 py-2.5 sm:py-3 px-3 sm:px-4 bg-[#00E599] hover:bg-emerald-400 text-black font-display font-black text-xs uppercase rounded-2xl border-3 border-black shadow-[3px_3px_0px_#000000] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-1.5 sm:gap-2 min-w-0"
            >
              <Download className="w-4 h-4 stroke-3 shrink-0" />
              <span className="truncate">
                {downloading ? 'GENERATING POSTER...' : (
                  <>
                    <span className="hidden sm:inline">DOWNLOAD HIGH-RES POSTER</span>
                    <span className="sm:hidden">DOWNLOAD POSTER</span>
                  </>
                )}
              </span>
            </button>
          </div>
        </div>
  );

  return (
    <>
      {isEmbedded ? (
        contentJSX
      ) : (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
            onClick={onClose}
          >
            {contentJSX}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Embedded Sticker Vault Modal */}
      {showStickerVault && (
        <StickerVaultModal
          isOpen={showStickerVault}
          onClose={() => setShowStickerVault(false)}
          onSelectSticker={(stickerObj) => {
            if (!stickerObj) {
              setCustomMascotImg(null);
            } else if (stickerObj.dataUrl || stickerObj.src) {
              const img = new Image();
              img.onload = () => setCustomMascotImg(img);
              img.src = stickerObj.dataUrl || stickerObj.src;
            }
            setShowStickerVault(false);
          }}
        />
      )}
    </>
  );
}
