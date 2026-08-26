import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Smartphone, Share2, Sparkles, X, Check, Image as ImageIcon, Flame, Zap, Palette, Upload } from 'lucide-react';
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
    glow: 'rgba(253, 200, 0, 0.35)'
  },
  { 
    id: 'cyberpunk', 
    name: '🖤 Cyber Obsidian', 
    bg: '#080A0F', 
    accent: '#00E599', 
    subAccent: '#00D8F6',
    text: '#FFFFFF',
    cardBg: 'rgba(18, 24, 38, 0.95)',
    glow: 'rgba(0, 229, 153, 0.35)'
  },
  { 
    id: 'sunset', 
    name: '🔥 Sunset Crimson', 
    bg: '#140C1D', 
    accent: '#FF4D6D', 
    subAccent: '#FF9E00',
    text: '#FFFFFF',
    cardBg: 'rgba(34, 18, 48, 0.95)',
    glow: 'rgba(255, 77, 109, 0.4)'
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
  displayName = 'Trinno Asphalt'
}) {
  const [format, setFormat] = useState('wallpaper'); // 'wallpaper' (9:16) | 'social' (1:1)
  const [activeTheme, setActiveTheme] = useState('streetwear');
  const [customMascotImg, setCustomMascotImg] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const rating = entry?.rating || 3;
  const verdict = entry?.verdict || ratingMeta[rating]?.title || 'Verdict';
  const notes = entry?.notes || 'Solid day holding the baseline. Another day logged on the board.';
  const meta = ratingMeta[rating] || ratingMeta[3];

  const dateObj = new Date(dateStr ? `${dateStr}T00:00:00` : new Date());
  const formattedDate = dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

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

    // 1. Background Atmosphere & Gradients
    if (activeTheme === 'streetwear') {
      ctx.fillStyle = '#FFFDF0';
      ctx.fillRect(0, 0, width, height);

      // Halftone Polka Dots Pattern
      ctx.fillStyle = 'rgba(0, 0, 0, 0.04)';
      for (let x = 30; x < width; x += 36) {
        for (let y = 30; y < height; y += 36) {
          ctx.beginPath();
          ctx.arc(x, y, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Top Diagonal Color Accent Slash
      ctx.fillStyle = '#FDC800';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(width, 0);
      ctx.lineTo(width, 180);
      ctx.lineTo(0, 320);
      ctx.closePath();
      ctx.fill();
    } else if (activeTheme === 'cyberpunk') {
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, '#06080D');
      grad.addColorStop(0.5, '#0B111A');
      grad.addColorStop(1, '#040508');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Glowing Cyan/Emerald Radial Glow behind Mascot
      const glow = ctx.createRadialGradient(width / 2, format === 'wallpaper' ? 820 : 540, 50, width / 2, format === 'wallpaper' ? 820 : 540, 500);
      glow.addColorStop(0, 'rgba(0, 229, 153, 0.28)');
      glow.addColorStop(0.7, 'rgba(0, 216, 246, 0.08)');
      glow.addColorStop(1, 'transparent');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, width, height);

      // Cyber Matrix Grid Lines
      ctx.strokeStyle = 'rgba(0, 229, 153, 0.07)';
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

      // Glowing Sunset Crimson Radial Glow behind Mascot
      const glow = ctx.createRadialGradient(width / 2, format === 'wallpaper' ? 820 : 540, 50, width / 2, format === 'wallpaper' ? 820 : 540, 540);
      glow.addColorStop(0, 'rgba(255, 77, 109, 0.35)');
      glow.addColorStop(0.6, 'rgba(255, 158, 0, 0.12)');
      glow.addColorStop(1, 'transparent');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, width, height);
    }

    // 2. Poster Top Section: Giant Day Watermark & Header
    const topY = format === 'wallpaper' ? 90 : 70;

    // Archival Header Badge
    ctx.fillStyle = isDark ? theme.accent : '#000000';
    ctx.fillRect(60, topY, 260, 42);
    ctx.fillStyle = isDark ? '#000000' : '#FDC800';
    ctx.font = '900 18px monospace';
    ctx.fillText('⚡ DAILY VERDICT OS', 76, topY + 27);

    // Date Text
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
    ctx.fillText(`DAY ${dayCount}`, width - 245, topY + 31);

    // Giant Background Typographic Number (Poster Art)
    ctx.fillStyle = isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.05)';
    ctx.font = '900 320px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`0${dayCount}`.slice(-2), width / 2, format === 'wallpaper' ? 520 : 420);
    ctx.textAlign = 'left';

    // 3. Huge Hero Verdict Title & Rating Stars
    const heroY = format === 'wallpaper' ? 240 : 180;
    
    // Rating Stars Banner
    ctx.fillStyle = isDark ? theme.accent : '#000000';
    ctx.font = '900 44px sans-serif';
    const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating);
    ctx.fillText(stars, 60, heroY);

    // Huge Bold Stylized Title
    ctx.fillStyle = isDark ? '#FFFFFF' : '#000000';
    ctx.font = '900 96px sans-serif';
    ctx.fillText(verdict.toUpperCase(), 60, heroY + 95);

    // Score Subtitle & Archetype
    const moodMeta = {
      5: { tag: 'GOD MODE • UNSTOPPABLE VELOCITY', persona: 'PEAK VELOCITY DEMON' },
      4: { tag: 'LOCKED IN • MOMENTUM FLOW', persona: 'FOCUS WARRIOR' },
      3: { tag: 'SOLID BASELINE • HELD THE LINE', persona: 'STOIC SUSTAINER' },
      2: { tag: 'LOW BATTERY • HEAVY DRAG', persona: 'RECOVERY AGENT' },
      1: { tag: 'TRENCH SURVIVOR • 3:45 AM GOBLIN', persona: 'DOPAMINE GOBLIN' }
    };
    const currentMood = moodMeta[rating] || moodMeta[3];

    ctx.fillStyle = isDark ? theme.accent : '#000000';
    ctx.font = '800 24px monospace';
    ctx.fillText(`QUALITY: ${rating}.0/5.0  •  ${currentMood.tag}`, 60, heroY + 140);

    // 4. Center Mascot Rendering (Hero Character Art)
    const mascotPath = MASCOT_MAP[rating] || MASCOT_MAP[3];
    const mascotImg = customMascotImg || new Image();
    
    const drawMascotAndContent = () => {
      // Mascot Center Position
      const mascotSize = format === 'wallpaper' ? 620 : 460;
      const mascotX = (width - mascotSize) / 2;
      const mascotY = format === 'wallpaper' ? 440 : 250;

      // Mascot Soft Shadow / Glow
      ctx.save();
      ctx.shadowColor = isDark ? theme.accent : 'rgba(0, 0, 0, 0.25)';
      ctx.shadowBlur = isDark ? 45 : 25;
      ctx.shadowOffsetY = 15;
      
      try {
        ctx.drawImage(mascotImg, mascotX, mascotY, mascotSize, mascotSize);
      } catch (err) {
        console.warn('Mascot draw fallback:', err);
      }
      ctx.restore();

      // 5. Floating Editorial Reflection Quote Card (Below Mascot)
      const quoteY = format === 'wallpaper' ? 1160 : 730;
      const quoteWidth = width - 120;
      const quoteHeight = format === 'wallpaper' ? 560 : 240;

      // Card Drop Shadow
      ctx.fillStyle = isDark ? 'rgba(0, 0, 0, 0.6)' : '#000000';
      ctx.fillRect(68, quoteY + 12, quoteWidth, quoteHeight);

      // Card Fill
      ctx.fillStyle = isDark ? theme.cardBg : '#FFFFFF';
      ctx.fillRect(60, quoteY, quoteWidth, quoteHeight);
      ctx.strokeStyle = isDark ? theme.accent : '#000000';
      ctx.lineWidth = isDark ? 4 : 6;
      ctx.strokeRect(60, quoteY, quoteWidth, quoteHeight);

      // Tape Badge Header
      ctx.fillStyle = isDark ? theme.accent : '#FDC800';
      ctx.fillRect(90, quoteY + 28, 300, 44);
      ctx.strokeStyle = isDark ? '#000000' : '#000000';
      ctx.lineWidth = 3;
      ctx.strokeRect(90, quoteY + 28, 300, 44);
      ctx.fillStyle = '#000000';
      ctx.font = '900 18px monospace';
      ctx.fillText('📖 RAW DIARY REFLECTION', 106, quoteY + 56);

      // Notes Text with Typography
      ctx.fillStyle = isDark ? '#F1F5F9' : '#111111';
      ctx.font = format === 'wallpaper' ? '600 32px monospace' : '600 24px monospace';

      const maxTextWidth = quoteWidth - 70;
      const words = notes.split(' ');
      let line = '';
      let textY = quoteY + 125;
      const lineHeight = format === 'wallpaper' ? 50 : 38;
      const maxLines = format === 'wallpaper' ? 8 : 3;
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

      // 6. Technical Poster Footer
      const footerY = format === 'wallpaper' ? 1830 : 1010;

      // Barcode
      ctx.fillStyle = isDark ? theme.accent : '#000000';
      const barcodeX = width - 260;
      const barcodeWidths = [4, 8, 2, 6, 12, 4, 8, 2, 10, 4, 6, 8, 4, 12, 6, 4];
      let curX = barcodeX;
      for (let b = 0; b < barcodeWidths.length; b++) {
        ctx.fillRect(curX, footerY - 40, barcodeWidths[b], 40);
        curX += barcodeWidths[b] + 4;
      }

      // Creator Brand
      ctx.fillStyle = isDark ? '#FFFFFF' : '#000000';
      ctx.font = '900 24px monospace';
      ctx.fillText(`LOGGED BY ${displayName.toUpperCase()}`, 60, footerY - 15);

      ctx.fillStyle = isDark ? '#94A3B8' : '#666666';
      ctx.font = '700 18px monospace';
      ctx.fillText('VERDICT OS • UNFILTERED ACCOUNTABILITY ENGINE', 60, footerY + 15);

      setPreviewUrl(canvas.toDataURL('image/png'));
      canvasRef.current = canvas;
    };

    if (!customMascotImg) {
      mascotImg.crossOrigin = 'anonymous';
      mascotImg.onload = drawMascotAndContent;
      mascotImg.onerror = drawMascotAndContent;
      mascotImg.src = mascotPath;
    } else {
      drawMascotAndContent();
    }

  }, [isOpen, format, activeTheme, customMascotImg, entry, dateStr, dayCount, displayName, rating, verdict, notes, meta, formattedDate]);

  if (!isOpen) return null;

  const handleDownload = () => {
    if (!canvasRef.current) return;
    setDownloading(true);
    try {
      const link = document.createElement('a');
      link.download = `daily_verdict_${activeTheme}_${format}_${dateStr || 'card'}.png`;
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
          className="w-full max-w-xl bg-[#FFFDF5] rounded-3xl border-3 border-black p-5 sm:p-6 shadow-[6px_6px_0px_#000000] space-y-4"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b-2 border-black/10 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-[#FDC800] border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_#000000]">
                <Sparkles className="w-5 h-5 text-black stroke-[2.5]" />
              </div>
              <div>
                <h3 className="font-display font-black text-lg sm:text-xl uppercase leading-none">
                  Aesthetic Wallpaper Studio
                </h3>
                <span className="text-xs font-mono text-neutral-600">
                  Featuring your custom mood mascot & streetwear artwork
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-neutral-200 border-2 border-transparent hover:border-black cursor-pointer transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Format Tabs & Distinct Themes */}
          <div className="space-y-2.5">
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
            <div className="grid grid-cols-3 gap-2">
              {THEMES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveTheme(t.id)}
                  className={`py-2.5 px-2 rounded-xl border-2 border-black font-mono text-[11px] font-black truncate cursor-pointer transition-all ${
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
          <div className="flex items-center justify-between bg-neutral-100 border-2 border-black p-2.5 rounded-2xl">
            <div className="flex items-center gap-2">
              <span className="text-base">🎭</span>
              <span className="text-xs font-mono font-bold text-neutral-800">
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
              className="px-2.5 py-1 bg-white hover:bg-neutral-200 border-2 border-black rounded-xl font-mono text-xs font-black text-black shadow-[1.5px_1.5px_0px_#000000] cursor-pointer flex items-center gap-1"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>CUSTOM STICKER</span>
            </button>
          </div>

          {/* Live Preview Container */}
          <div className="w-full flex items-center justify-center bg-neutral-950 rounded-2xl border-2 border-black p-3 max-h-[380px] overflow-hidden">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Aesthetic Card Preview"
                className={`rounded-xl border border-white/20 shadow-2xl object-contain ${
                  format === 'wallpaper' ? 'max-h-[350px] aspect-[9/16]' : 'max-h-[350px] aspect-square'
                }`}
              />
            ) : (
              <div className="text-white font-mono text-xs py-14">Rendering high-res mascot artwork...</div>
            )}
          </div>

          {/* Action Footer */}
          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading || !previewUrl}
              className="flex-1 py-3.5 bg-[#00E599] hover:bg-emerald-400 text-black font-display font-black text-sm uppercase rounded-2xl border-3 border-black shadow-[3px_3px_0px_#000000] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4 stroke-[3]" />
              <span>{downloading ? 'GENERATING POSTER PNG...' : 'DOWNLOAD HIGH-RES WALLPAPER'}</span>
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
