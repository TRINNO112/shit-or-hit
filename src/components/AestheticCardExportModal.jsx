import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Smartphone, Share2, Sparkles, X, Check, Image as ImageIcon, Flame, Zap } from 'lucide-react';
import { ratingMeta } from '../services/api';

export default function AestheticCardExportModal({
  isOpen,
  onClose,
  entry,
  dateStr,
  dayCount,
  displayName = 'Trinno Asphalt'
}) {
  const [format, setFormat] = useState('wallpaper'); // 'wallpaper' (9:16) | 'social' (1:1)
  const [downloading, setDownloading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const canvasRef = useRef(null);

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

  // Render canvas preview
  useEffect(() => {
    if (!isOpen) return;

    const canvas = document.createElement('canvas');
    const width = 1080;
    const height = format === 'wallpaper' ? 1920 : 1080;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // 1. Background Fill & Texture
    ctx.fillStyle = '#FFFDF5';
    ctx.fillRect(0, 0, width, height);

    // 2. High-Contrast Neo-Brutalist Grid Lines
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
    ctx.lineWidth = 2.5;
    const gridSize = 72;
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

    // 3. Thick Outer Double Border
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 18;
    ctx.strokeRect(36, 36, width - 72, height - 72);
    ctx.lineWidth = 4;
    ctx.strokeRect(54, 54, width - 108, height - 108);

    // 4. Header Section
    const headerY = format === 'wallpaper' ? 110 : 85;
    
    // Top Ribbon / Sticker
    ctx.fillStyle = '#000000';
    ctx.fillRect(80, headerY, 260, 44);
    ctx.fillStyle = '#FDC800';
    ctx.font = '900 20px monospace';
    ctx.fillText('⚡ DAILY ACCOUNTABILITY', 95, headerY + 28);

    // App Branding Block
    const brandY = headerY + 65;
    ctx.fillStyle = '#FDC800';
    ctx.fillRect(80, brandY, 96, 96);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 6;
    ctx.strokeRect(80, brandY, 96, 96);
    
    // Lightning Icon
    ctx.fillStyle = '#000000';
    ctx.font = '900 56px sans-serif';
    ctx.fillText('⚡', 100, brandY + 70);

    // Title
    ctx.fillStyle = '#000000';
    ctx.font = '900 52px sans-serif';
    ctx.fillText('DAILY VERDICT', 196, brandY + 50);

    ctx.fillStyle = '#555555';
    ctx.font = '800 24px monospace';
    ctx.fillText(formattedDate.toUpperCase(), 196, brandY + 86);

    // Day Streak Banner
    ctx.fillStyle = '#00E599';
    ctx.fillRect(width - 320, brandY, 240, 96);
    ctx.strokeRect(width - 320, brandY, 240, 96);
    ctx.fillStyle = '#000000';
    ctx.font = '900 38px monospace';
    ctx.fillText(`DAY ${dayCount}`, width - 290, brandY + 60);

    // Mood Character / Badge Metadata Map
    const moodMeta = {
      5: { emoji: '👑', tag: 'GOD MODE • UNSTOPPABLE', persona: '(⌐■_■) PEAK FLOW', color: '#FDC800' },
      4: { emoji: '🔥', tag: 'LOCKED IN • MOMENTUM', persona: '(•̀ᴗ•́)و FOCUS CHAD', color: '#00E599' },
      3: { emoji: '⚡', tag: 'SOLID BASELINE • HELD LINE', persona: '(•_•) STOIC SUSTAINER', color: '#CBD5E1' },
      2: { emoji: '🌧️', tag: 'LOW BATTERY • DRAGGING', persona: '(T_T) SLOW PROGRESS', color: '#FF8A00' },
      1: { emoji: '👺', tag: '3:45 AM DOPAMINE GOBLIN', persona: '(X_X) TRENCH SURVIVOR', color: '#FF4D4D' }
    };
    const currentMood = moodMeta[rating] || moodMeta[3];

    // 5. Massive Center Score Card with Drop Shadow
    const cardY = format === 'wallpaper' ? 330 : 270;
    const cardWidth = width - 160;
    const cardHeight = format === 'wallpaper' ? 440 : 330;

    // Drop Shadow
    ctx.fillStyle = '#000000';
    ctx.fillRect(88, cardY + 12, cardWidth, cardHeight);

    // Main Card
    ctx.fillStyle = meta.bg;
    ctx.fillRect(80, cardY, cardWidth, cardHeight);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 8;
    ctx.strokeRect(80, cardY, cardWidth, cardHeight);

    // Mood Pill Badge
    ctx.fillStyle = '#000000';
    ctx.fillRect(115, cardY + 36, 380, 48);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 22px monospace';
    ctx.fillText(`${currentMood.emoji} ${currentMood.tag}`, 135, cardY + 68);

    // Stars Rating
    ctx.fillStyle = '#000000';
    ctx.font = '900 48px sans-serif';
    const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating);
    ctx.fillText(stars, 115, cardY + 140);

    // Huge Verdict Title
    ctx.font = '900 84px sans-serif';
    ctx.fillText(verdict.toUpperCase(), 115, cardY + 240);

    // Score Details & Persona
    ctx.fillStyle = '#000000';
    ctx.font = '800 30px monospace';
    ctx.fillText(`QUALITY SCORE: ${rating}.0 / 5.0`, 115, cardY + 310);

    ctx.font = '700 24px monospace';
    ctx.fillStyle = '#222222';
    ctx.fillText(`ARCHETYPE: ${currentMood.persona}`, 115, cardY + 360);

    // 6. Reflection Quote / Raw Diary Section
    const quoteY = format === 'wallpaper' ? 820 : 640;
    const quoteHeight = format === 'wallpaper' ? 820 : 310;

    // Drop Shadow
    ctx.fillStyle = '#000000';
    ctx.fillRect(88, quoteY + 12, cardWidth, quoteHeight);

    // Quote Box Fill
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(80, quoteY, cardWidth, quoteHeight);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 8;
    ctx.strokeRect(80, quoteY, cardWidth, quoteHeight);

    // Quote Section Header Tape
    ctx.fillStyle = '#FDC800';
    ctx.fillRect(115, quoteY + 36, 320, 48);
    ctx.strokeRect(115, quoteY + 36, 320, 48);
    ctx.fillStyle = '#000000';
    ctx.font = '900 22px monospace';
    ctx.fillText('📖 RAW DIARY REFLECTION', 135, quoteY + 68);

    // Notes Multiline Wrap
    ctx.fillStyle = '#000000';
    ctx.font = format === 'wallpaper' ? '600 32px monospace' : '600 26px monospace';
    
    const maxTextWidth = cardWidth - 80;
    const words = notes.split(' ');
    let line = '';
    let textY = quoteY + 140;
    const lineHeight = format === 'wallpaper' ? 52 : 40;
    const maxLines = format === 'wallpaper' ? 12 : 4;
    let linesCount = 0;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxTextWidth && n > 0) {
        ctx.fillText(line, 120, textY);
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
    ctx.fillText(line, 120, textY);

    // 7. Footer: Barcode, Identity & Watermark
    const footerY = format === 'wallpaper' ? 1730 : 980;

    // Simulated Neo-Brutalist Barcode
    ctx.fillStyle = '#000000';
    const barcodeX = width - 260;
    const barcodeWidths = [4, 8, 2, 6, 12, 4, 8, 2, 10, 4, 6, 8, 4, 12, 6, 4];
    let curX = barcodeX;
    for (let b = 0; b < barcodeWidths.length; b++) {
      ctx.fillRect(curX, footerY - 40, barcodeWidths[b], 40);
      curX += barcodeWidths[b] + 4;
    }

    ctx.fillStyle = '#000000';
    ctx.font = '900 24px monospace';
    ctx.fillText(`LOGGED BY ${displayName.toUpperCase()}`, 80, footerY - 15);

    ctx.fillStyle = '#666666';
    ctx.font = '700 18px monospace';
    ctx.fillText('VERDICT OS • UNFILTERED ACCOUNTABILITY ENGINE', 80, footerY + 15);

    setPreviewUrl(canvas.toDataURL('image/png'));
    canvasRef.current = canvas;
  }, [isOpen, format, entry, dateStr, dayCount, displayName, rating, verdict, notes, meta, formattedDate]);

  if (!isOpen) return null;

  const handleDownload = () => {
    if (!canvasRef.current) return;
    setDownloading(true);
    try {
      const link = document.createElement('a');
      link.download = `daily_verdict_${format}_${dateStr || 'card'}.png`;
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
                  Aesthetic Card Export
                </h3>
                <span className="text-xs font-mono text-neutral-600">
                  Export high-res wallpaper or social media card
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

          {/* Format Selector Tabs */}
          <div className="grid grid-cols-2 gap-2 p-1.5 bg-neutral-100 rounded-2xl border-2 border-black">
            <button
              type="button"
              onClick={() => setFormat('wallpaper')}
              className={`py-2.5 rounded-xl font-display font-black text-xs uppercase flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                format === 'wallpaper'
                  ? 'bg-[#FDC800] border-2 border-black text-black shadow-[2px_2px_0px_#000000]'
                  : 'text-neutral-600 hover:text-black'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>9:16 Wallpaper (1080x1920)</span>
            </button>
            <button
              type="button"
              onClick={() => setFormat('social')}
              className={`py-2.5 rounded-xl font-display font-black text-xs uppercase flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                format === 'social'
                  ? 'bg-[#FDC800] border-2 border-black text-black shadow-[2px_2px_0px_#000000]'
                  : 'text-neutral-600 hover:text-black'
              }`}
            >
              <Share2 className="w-4 h-4" />
              <span>1:1 Social Card (1080x1080)</span>
            </button>
          </div>

          {/* Preview Container */}
          <div className="w-full flex items-center justify-center bg-neutral-900 rounded-2xl border-2 border-black p-3 max-h-[360px] overflow-hidden">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Aesthetic Card Preview"
                className={`rounded-xl border border-white/20 shadow-2xl object-contain ${
                  format === 'wallpaper' ? 'max-h-[330px] aspect-[9/16]' : 'max-h-[330px] aspect-square'
                }`}
              />
            ) : (
              <div className="text-white font-mono text-xs py-10">Rendering high-res canvas...</div>
            )}
          </div>

          {/* Action Footer */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading || !previewUrl}
              className="flex-1 py-3.5 bg-[#00E599] hover:bg-emerald-400 text-black font-display font-black text-sm uppercase rounded-2xl border-3 border-black shadow-[3px_3px_0px_#000000] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4 stroke-[3]" />
              <span>{downloading ? 'GENERATING PNG...' : 'DOWNLOAD HIGH-RES PNG'}</span>
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
