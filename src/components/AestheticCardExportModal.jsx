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
    const width = format === 'wallpaper' ? 1080 : 1080;
    const height = format === 'wallpaper' ? 1920 : 1080;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // 1. Background Fill
    ctx.fillStyle = '#FFFDF5';
    ctx.fillRect(0, 0, width, height);

    // 2. Subtle Neo-Brutalist Grid Pattern
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.lineWidth = 2;
    const gridSize = 60;
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

    // 3. Thick Outer Border & Shadow Frame
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 16;
    ctx.strokeRect(40, 40, width - 80, height - 80);

    // 4. Header Top Badge: DAILY VERDICT & DAY NUMBER
    const headerY = format === 'wallpaper' ? 160 : 120;
    
    // Zap Logo Box
    ctx.fillStyle = '#FDC800';
    ctx.fillRect(80, headerY, 90, 90);
    ctx.strokeRect(80, headerY, 90, 90);
    ctx.fillStyle = '#000000';
    ctx.font = '900 52px monospace';
    ctx.fillText('⚡', 95, headerY + 65);

    // App Title
    ctx.fillStyle = '#000000';
    ctx.font = '900 48px sans-serif';
    ctx.fillText('DAILY VERDICT', 190, headerY + 45);

    ctx.fillStyle = '#666666';
    ctx.font = '700 24px monospace';
    ctx.fillText(formattedDate.toUpperCase(), 190, headerY + 80);

    // Day Streak Pill on Right
    ctx.fillStyle = '#00E599';
    ctx.fillRect(width - 290, headerY, 210, 80);
    ctx.strokeRect(width - 290, headerY, 210, 80);
    ctx.fillStyle = '#000000';
    ctx.font = '900 32px monospace';
    ctx.fillText(`DAY ${dayCount}`, width - 265, headerY + 52);

    // 5. Huge Center Verdict Score Badge
    const centerY = format === 'wallpaper' ? 640 : 420;
    const cardWidth = width - 160;
    const cardHeight = format === 'wallpaper' ? 380 : 280;

    // Card drop shadow
    ctx.fillStyle = '#000000';
    ctx.fillRect(88, centerY + 8, cardWidth, cardHeight);

    // Card fill
    ctx.fillStyle = meta.bg;
    ctx.fillRect(80, centerY, cardWidth, cardHeight);
    ctx.strokeRect(80, centerY, cardWidth, cardHeight);

    // Score Stars
    ctx.fillStyle = '#000000';
    ctx.font = '900 42px sans-serif';
    const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating);
    ctx.fillText(stars, 120, centerY + 80);

    // Huge Verdict Title
    ctx.font = '900 76px sans-serif';
    ctx.fillText(verdict.toUpperCase(), 120, centerY + 180);

    // Score Subtitle
    ctx.font = '700 30px monospace';
    ctx.fillText(`SCORE: ${rating}.0 / 5.0 • ${meta.desc.toUpperCase()}`, 120, centerY + 240);

    // 6. Reflection Quote Section
    const quoteY = format === 'wallpaper' ? 1100 : 740;
    const quoteHeight = format === 'wallpaper' ? 560 : 220;

    ctx.fillStyle = '#000000';
    ctx.fillRect(88, quoteY + 8, cardWidth, quoteHeight);

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(80, quoteY, cardWidth, quoteHeight);
    ctx.strokeRect(80, quoteY, cardWidth, quoteHeight);

    // Quote Tag
    ctx.fillStyle = '#FDC800';
    ctx.fillRect(110, quoteY + 30, 260, 44);
    ctx.strokeRect(110, quoteY + 30, 260, 44);
    ctx.fillStyle = '#000000';
    ctx.font = '900 20px monospace';
    ctx.fillText('RAW REFLECTION', 130, quoteY + 60);

    // Multiline Text Wrap for Notes
    ctx.fillStyle = '#000000';
    ctx.font = '600 28px monospace';
    
    const maxTextWidth = cardWidth - 80;
    const words = notes.split(' ');
    let line = '';
    let textY = quoteY + 130;
    const lineHeight = 44;
    const maxLines = format === 'wallpaper' ? 9 : 2;
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

    // 7. Footer: User Brand & Watermark
    const footerY = format === 'wallpaper' ? 1800 : 1010;
    ctx.fillStyle = '#888888';
    ctx.font = '700 22px monospace';
    ctx.fillText(`LOGGED BY ${displayName.toUpperCase()} • DAILY VERDICT`, 80, footerY);

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
