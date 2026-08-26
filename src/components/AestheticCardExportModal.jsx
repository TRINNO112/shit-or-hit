import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Smartphone, Share2, Sparkles, X, Check, Image as ImageIcon, Flame, Zap, Palette, Upload } from 'lucide-react';
import { ratingMeta } from '../services/api';

const THEMES = [
  { id: 'neobrutal', name: '⚡ Neo-Brutalist Gold', bg: '#FFFDF5', primary: '#FDC800', text: '#000000', border: '#000000' },
  { id: 'cyberdark', name: '🖤 Cyber Stealth Dark', bg: '#090B0E', primary: '#00E599', text: '#FFFFFF', border: '#00E599' },
  { id: 'swissmono', name: '📰 Swiss Minimalist', bg: '#F4F4F0', primary: '#111111', text: '#111111', border: '#111111' }
];

export default function AestheticCardExportModal({
  isOpen,
  onClose,
  entry,
  dateStr,
  dayCount,
  displayName = 'Trinno Asphalt'
}) {
  const [format, setFormat] = useState('wallpaper'); // 'wallpaper' (9:16) | 'social' (1:1)
  const [activeTheme, setActiveTheme] = useState('neobrutal');
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

  // Master Canvas Renderer
  useEffect(() => {
    if (!isOpen) return;

    const theme = THEMES.find(t => t.id === activeTheme) || THEMES[0];
    const canvas = document.createElement('canvas');
    const width = 1080;
    const height = format === 'wallpaper' ? 1920 : 1080;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    const isDark = activeTheme === 'cyberdark';
    const isSwiss = activeTheme === 'swissmono';

    // 1. Background Fill
    ctx.fillStyle = theme.bg;
    ctx.fillRect(0, 0, width, height);

    // 2. Aesthetic Grid Pattern
    ctx.strokeStyle = isDark ? 'rgba(0, 229, 153, 0.08)' : 'rgba(0, 0, 0, 0.06)';
    ctx.lineWidth = 2;
    const gridSize = 64;
    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // 3. Technical Crosshairs & Corner Registration Marks
    const crossColor = isDark ? '#00E599' : '#000000';
    ctx.fillStyle = crossColor;
    ctx.font = '700 20px monospace';
    ctx.fillText('+ + +', 70, 70);
    ctx.fillText('+ + +', width - 140, 70);
    ctx.fillText('+ + +', 70, height - 60);
    ctx.fillText('+ + +', width - 140, height - 60);

    // 4. Double Outer Border
    ctx.strokeStyle = isDark ? '#00E599' : '#000000';
    ctx.lineWidth = isDark ? 8 : 16;
    ctx.strokeRect(36, 36, width - 72, height - 72);
    ctx.lineWidth = 3;
    ctx.strokeRect(52, 52, width - 104, height - 104);

    // 5. Header Bar
    const headerY = format === 'wallpaper' ? 100 : 80;
    
    // Top Archival Tape
    ctx.fillStyle = isDark ? '#00E599' : '#000000';
    ctx.fillRect(76, headerY, 280, 42);
    ctx.fillStyle = isDark ? '#000000' : '#FDC800';
    ctx.font = '900 18px monospace';
    ctx.fillText('⚡ DAILY ACCOUNTABILITY', 92, headerY + 27);

    // App Branding Box
    const brandY = headerY + 58;
    ctx.fillStyle = isDark ? '#141A23' : '#FDC800';
    ctx.fillRect(76, brandY, 90, 90);
    ctx.strokeStyle = isDark ? '#00E599' : '#000000';
    ctx.lineWidth = 5;
    ctx.strokeRect(76, brandY, 90, 90);

    // Lightning Icon
    ctx.fillStyle = isDark ? '#00E599' : '#000000';
    ctx.font = '900 50px sans-serif';
    ctx.fillText('⚡', 95, brandY + 65);

    // App Title
    ctx.fillStyle = isDark ? '#FFFFFF' : '#000000';
    ctx.font = '900 48px sans-serif';
    ctx.fillText('DAILY VERDICT', 184, brandY + 46);

    ctx.fillStyle = isDark ? '#8E9BAE' : '#666666';
    ctx.font = '800 22px monospace';
    ctx.fillText(formattedDate.toUpperCase(), 184, brandY + 80);

    // Day Streak Pill
    ctx.fillStyle = isDark ? '#00E599' : '#00E599';
    ctx.fillRect(width - 310, brandY, 230, 90);
    ctx.strokeStyle = isDark ? '#000000' : '#000000';
    ctx.lineWidth = 5;
    ctx.strokeRect(width - 310, brandY, 230, 90);
    ctx.fillStyle = '#000000';
    ctx.font = '900 36px monospace';
    ctx.fillText(`DAY ${dayCount}`, width - 275, brandY + 58);

    // 6. Mood Metadata Map
    const moodMeta = {
      5: { emoji: '👑', tag: 'GOD MODE • UNSTOPPABLE', persona: 'PEAK VELOCITY', color: '#FDC800' },
      4: { emoji: '🔥', tag: 'LOCKED IN • MOMENTUM', persona: 'FOCUS CHAD', color: '#00E599' },
      3: { emoji: '⚡', tag: 'SOLID BASELINE • HELD LINE', persona: 'STOIC SUSTAINER', color: '#CBD5E1' },
      2: { emoji: '🌧️', tag: 'LOW BATTERY • DRAGGING', persona: 'SLOW PROGRESS', color: '#FF8A00' },
      1: { emoji: '👺', tag: '3:45 AM DOPAMINE GOBLIN', persona: 'TRENCH SURVIVOR', color: '#FF4D4D' }
    };
    const currentMood = moodMeta[rating] || moodMeta[3];

    // 7. Center Verdict Score Card
    const cardY = format === 'wallpaper' ? 310 : 250;
    const cardWidth = width - 152;
    const cardHeight = format === 'wallpaper' ? 460 : 330;

    // Drop Shadow
    ctx.fillStyle = isDark ? '#00E599' : '#000000';
    ctx.fillRect(84, cardY + 12, cardWidth, cardHeight);

    // Card Surface
    ctx.fillStyle = isDark ? '#12161E' : isSwiss ? '#FFFFFF' : meta.bg;
    ctx.fillRect(76, cardY, cardWidth, cardHeight);
    ctx.strokeStyle = isDark ? '#00E599' : '#000000';
    ctx.lineWidth = 6;
    ctx.strokeRect(76, cardY, cardWidth, cardHeight);

    // Mood Tag Badge
    ctx.fillStyle = isDark ? '#00E599' : '#000000';
    ctx.fillRect(110, cardY + 32, 400, 46);
    ctx.fillStyle = isDark ? '#000000' : '#FFFFFF';
    ctx.font = '900 20px monospace';
    ctx.fillText(`${currentMood.emoji} ${currentMood.tag}`, 126, cardY + 62);

    // Stars
    ctx.fillStyle = isDark ? '#00E599' : '#000000';
    ctx.font = '900 46px sans-serif';
    const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating);
    ctx.fillText(stars, 110, cardY + 135);

    // Huge Verdict Title
    ctx.fillStyle = isDark ? '#FFFFFF' : '#000000';
    ctx.font = '900 86px sans-serif';
    ctx.fillText(verdict.toUpperCase(), 110, cardY + 235);

    // Quality Score Metric
    ctx.font = '800 28px monospace';
    ctx.fillStyle = isDark ? '#00E599' : '#000000';
    ctx.fillText(`QUALITY SCORE: ${rating}.0 / 5.0`, 110, cardY + 300);

    // Archetype Label
    ctx.font = '700 22px monospace';
    ctx.fillStyle = isDark ? '#8E9BAE' : '#333333';
    ctx.fillText(`ARCHETYPE: [ ${currentMood.persona} ]`, 110, cardY + 348);

    // Progress / Quality Level Gauge Bar
    const gaugeY = cardY + 380;
    ctx.fillStyle = isDark ? '#202836' : 'rgba(0,0,0,0.15)';
    ctx.fillRect(110, gaugeY, cardWidth - 68, 22);
    ctx.fillStyle = isDark ? '#00E599' : '#000000';
    ctx.fillRect(110, gaugeY, (cardWidth - 68) * (rating / 5), 22);
    ctx.strokeStyle = isDark ? '#00E599' : '#000000';
    ctx.lineWidth = 3;
    ctx.strokeRect(110, gaugeY, cardWidth - 68, 22);

    // Draw Custom Mascot / Character Illustration
    if (customMascotImg) {
      const mascotSize = format === 'wallpaper' ? 240 : 180;
      const mascotX = width - mascotSize - 110;
      const mascotY = cardY + (format === 'wallpaper' ? 90 : 60);
      ctx.drawImage(customMascotImg, mascotX, mascotY, mascotSize, mascotSize);
    } else {
      // Dynamic Vector Badge Mascot Graphic
      const mascotX = width - 240;
      const mascotY = cardY + 90;
      
      // Vector Mascot Badge Box
      ctx.fillStyle = isDark ? '#1C2330' : '#FFFFFF';
      ctx.fillRect(mascotX, mascotY, 150, 150);
      ctx.strokeStyle = isDark ? '#00E599' : '#000000';
      ctx.lineWidth = 4;
      ctx.strokeRect(mascotX, mascotY, 150, 150);

      ctx.fillStyle = isDark ? '#00E599' : '#000000';
      ctx.font = '900 70px sans-serif';
      const vectorIcon = rating >= 4 ? '⚡' : rating === 3 ? '☕' : '👺';
      ctx.fillText(vectorIcon, mascotX + 35, mascotY + 105);
    }

    // 8. Raw Diary Reflection Section
    const quoteY = format === 'wallpaper' ? 820 : 620;
    const quoteHeight = format === 'wallpaper' ? 820 : 330;

    // Drop Shadow
    ctx.fillStyle = isDark ? '#00E599' : '#000000';
    ctx.fillRect(84, quoteY + 12, cardWidth, quoteHeight);

    // Quote Box Fill
    ctx.fillStyle = isDark ? '#12161E' : '#FFFFFF';
    ctx.fillRect(76, quoteY, cardWidth, quoteHeight);
    ctx.strokeStyle = isDark ? '#00E599' : '#000000';
    ctx.lineWidth = 6;
    ctx.strokeRect(76, quoteY, cardWidth, quoteHeight);

    // Tape Header
    ctx.fillStyle = isDark ? '#00E599' : '#FDC800';
    ctx.fillRect(110, quoteY + 32, 330, 46);
    ctx.strokeStyle = isDark ? '#000000' : '#000000';
    ctx.lineWidth = 3;
    ctx.strokeRect(110, quoteY + 32, 330, 46);
    ctx.fillStyle = '#000000';
    ctx.font = '900 20px monospace';
    ctx.fillText('📖 RAW DIARY REFLECTION', 126, quoteY + 62);

    // Monospace Wrapped Notes
    ctx.fillStyle = isDark ? '#E2E8F0' : '#111111';
    ctx.font = format === 'wallpaper' ? '600 32px monospace' : '600 26px monospace';
    
    const maxTextWidth = cardWidth - 80;
    const words = notes.split(' ');
    let line = '';
    let textY = quoteY + 140;
    const lineHeight = format === 'wallpaper' ? 52 : 42;
    const maxLines = format === 'wallpaper' ? 12 : 4;
    let linesCount = 0;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxTextWidth && n > 0) {
        ctx.fillText(line, 115, textY);
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
    ctx.fillText(line, 115, textY);

    // 9. Technical Footer & Barcode
    const footerY = format === 'wallpaper' ? 1730 : 990;

    // Simulated Barcode
    ctx.fillStyle = isDark ? '#00E599' : '#000000';
    const barcodeX = width - 260;
    const barcodeWidths = [4, 8, 2, 6, 12, 4, 8, 2, 10, 4, 6, 8, 4, 12, 6, 4];
    let curX = barcodeX;
    for (let b = 0; b < barcodeWidths.length; b++) {
      ctx.fillRect(curX, footerY - 40, barcodeWidths[b], 40);
      curX += barcodeWidths[b] + 4;
    }

    ctx.fillStyle = isDark ? '#FFFFFF' : '#000000';
    ctx.font = '900 24px monospace';
    ctx.fillText(`LOGGED BY ${displayName.toUpperCase()}`, 76, footerY - 15);

    ctx.fillStyle = isDark ? '#8E9BAE' : '#666666';
    ctx.font = '700 18px monospace';
    ctx.fillText('VERDICT OS • UNFILTERED ACCOUNTABILITY ENGINE', 76, footerY + 15);

    setPreviewUrl(canvas.toDataURL('image/png'));
    canvasRef.current = canvas;
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
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
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
                <ImageIcon className="w-5 h-5 text-black stroke-[2.5]" />
              </div>
              <div>
                <h3 className="font-display font-black text-lg sm:text-xl uppercase leading-none">
                  Aesthetic Wallpaper Studio
                </h3>
                <span className="text-xs font-mono text-neutral-600">
                  Export museum-grade phone wallpaper or social card
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

          {/* Format Tabs & Theme Selector */}
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
                <span>9:16 Wallpaper</span>
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

            {/* Aesthetic Theme Selector Buttons */}
            <div className="grid grid-cols-3 gap-1.5">
              {THEMES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveTheme(t.id)}
                  className={`py-1.5 px-2 rounded-xl border-2 border-black font-mono text-[11px] font-black truncate cursor-pointer transition-all ${
                    activeTheme === t.id
                      ? 'bg-black text-white shadow-[2px_2px_0px_#000000]'
                      : 'bg-white text-black hover:bg-neutral-100'
                  }`}
                >
                  {t.name}
                </button>
              ))}
            </div>
          </div>

          {/* Mascot Upload Button */}
          <div className="flex items-center justify-between bg-neutral-100 border-2 border-black p-2.5 rounded-2xl">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-black" />
              <span className="text-xs font-mono font-bold text-neutral-800">
                {customMascotImg ? 'Custom Mascot Active ✅' : 'Custom Sticker / Mascot:'}
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
              <span>{customMascotImg ? 'CHANGE MASCOT' : 'UPLOAD STICKER'}</span>
            </button>
          </div>

          {/* Preview Container */}
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
              <div className="text-white font-mono text-xs py-10">Rendering high-res canvas...</div>
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
              <span>{downloading ? 'GENERATING MASTER PNG...' : 'DOWNLOAD HIGH-RES PNG'}</span>
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
