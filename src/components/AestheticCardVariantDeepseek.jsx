import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download, Smartphone, Share2, Sparkles, X, Upload, ChevronLeft, ChevronRight
} from 'lucide-react';
import mascot1 from '../assets/mascots/mascot_1_rough.png';
import mascot2 from '../assets/mascots/mascot_2_down.png';
import mascot3 from '../assets/mascots/mascot_3_okay.png';
import mascot4 from '../assets/mascots/mascot_4_good.png';
import mascot5 from '../assets/mascots/mascot_5_peak.png';

const ratingMeta = {
  1: { title: 'Trench Survivor' },
  2: { title: 'Low Battery' },
  3: { title: 'Baseline Held' },
  4: { title: 'Locked In' },
  5: { title: 'Absolute Peak' },
};

const MASCOT_MAP = {
  1: mascot1,
  2: mascot2,
  3: mascot3,
  4: mascot4,
  5: mascot5,
};

const THEMES = [
  {
    id: 'streetwear',
    name: '⚡ Gold',
    bg: '#FFFDF0',
    accent: '#FDC800',
    subAccent: '#00E599',
    text: '#000000',
    cardBg: '#FFFFFF',
    glow: 'rgba(253, 200, 0, 0.4)',
  },
  {
    id: 'cyberpunk',
    name: '🖤 Obsidian',
    bg: '#080A0F',
    accent: '#00E599',
    subAccent: '#00D8F6',
    text: '#FFFFFF',
    cardBg: 'rgba(18, 24, 38, 0.95)',
    glow: 'rgba(0, 229, 153, 0.4)',
  },
  {
    id: 'sunset',
    name: '🔥 Crimson',
    bg: '#140C1D',
    accent: '#FF4D6D',
    subAccent: '#FF9E00',
    text: '#FFFFFF',
    cardBg: 'rgba(34, 18, 48, 0.95)',
    glow: 'rgba(255, 77, 109, 0.45)',
  },
];

export default function AestheticCardVariantDeepseek({
  isOpen,
  onClose,
  entry,
  dateStr,
  dayCount = 8,
  entries = {},
  startDate = '2026-08-01',
  displayName = 'Daily Operator',
}) {
  const [format, setFormat] = useState('wallpaper');
  const [activeTheme, setActiveTheme] = useState('streetwear');
  const [selectedDateStr, setSelectedDateStr] = useState(dateStr || new Date().toISOString().slice(0, 10));
  const [customMascotImg, setCustomMascotImg] = useState(null);
  const [loadedMascotImg, setLoadedMascotImg] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (dateStr) setSelectedDateStr(dateStr);
  }, [dateStr, isOpen]);

  const activeEntry = entries[selectedDateStr] || (selectedDateStr === dateStr ? entry : null);
  const rating = activeEntry?.rating || 5;
  const verdict = activeEntry?.verdict || ratingMeta[rating]?.title || 'Absolute Peak';

  const startObj = new Date(`${startDate || '2026-08-01'}T00:00:00`);
  const currentObj = new Date(`${selectedDateStr}T00:00:00`);
  const activeDayCount = Math.max(1, Math.floor((currentObj - startObj) / (1000 * 60 * 60 * 24)) + 1);

  const mascotUrl = MASCOT_MAP[rating] || MASCOT_MAP[5];

  useEffect(() => {
    if (customMascotImg) {
      setLoadedMascotImg(customMascotImg);
      return;
    }
    const img = new Image();
    img.src = mascotUrl;
    img.onload = () => setLoadedMascotImg(img);
    img.onerror = () => console.error('Failed to load mascot');
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
        img.onload = () => setCustomMascotImg(img);
        img.src = event.target?.result;
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    const theme = THEMES.find(t => t.id === activeTheme) || THEMES[0];
    const width = 1080;
    const height = format === 'wallpaper' ? 1920 : 1080;

    const placeholder = document.createElement('canvas');
    placeholder.width = width;
    placeholder.height = height;
    const pctx = placeholder.getContext('2d');
    
    // Background
    pctx.fillStyle = theme.bg;
    pctx.fillRect(0, 0, width, height);

    // Decorative gradient circle
    const grad = pctx.createRadialGradient(width / 2, height * 0.45, 50, width / 2, height * 0.45, 450);
    grad.addColorStop(0, theme.accent + '55');
    grad.addColorStop(1, 'transparent');
    pctx.fillStyle = grad;
    pctx.fillRect(0, 0, width, height);

    // Mascot
    if (loadedMascotImg) {
      const mSize = format === 'wallpaper' ? 440 : 380;
      pctx.drawImage(loadedMascotImg, width / 2 - mSize / 2, height * 0.3, mSize, mSize);
    }

    // Typography
    pctx.fillStyle = theme.text;
    pctx.font = '900 64px sans-serif';
    pctx.textAlign = 'center';
    pctx.fillText(`DAY ${activeDayCount} • ${verdict.toUpperCase()}`, width / 2, height * 0.72);

    pctx.font = '700 36px monospace';
    pctx.fillStyle = theme.text + '99';
    pctx.fillText(`SCORE: ${rating}.0 / 5.0 • DAILY VERDICT OS`, width / 2, height * 0.78);

    setPreviewUrl(placeholder.toDataURL('image/png'));
    canvasRef.current = placeholder;
  }, [isOpen, format, activeTheme, loadedMascotImg, selectedDateStr, activeDayCount, rating, verdict]);

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

  const theme = THEMES.find(t => t.id === activeTheme) || THEMES[0];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-80 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
          className="w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden border border-black/20"
          style={{ backgroundColor: theme.bg, color: theme.text }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-black/10">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl" style={{ backgroundColor: theme.accent }}>
                <Sparkles className="w-5 h-5 text-black" />
              </div>
              <div>
                <h3 className="text-xl font-bold tracking-tight">Wallpaper Studio (DeepSeek Design)</h3>
                <p className="text-xs opacity-60">Story posters & feed cards • Soft Pill UI</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-black/10 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Main content */}
          <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Controls - left */}
            <div className="lg:col-span-5 space-y-4">
              {/* Date navigator */}
              <div className="flex items-center gap-2 bg-white/30 backdrop-blur-sm rounded-xl p-1.5 border border-black/10">
                <button
                  onClick={() => handleShiftDay(-1)}
                  className="p-1.5 rounded-lg hover:bg-black/10 transition cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <input
                  type="date"
                  value={selectedDateStr}
                  onChange={(e) => setSelectedDateStr(e.target.value)}
                  className="flex-1 text-center text-sm font-medium bg-transparent border-0 focus:ring-0 outline-none"
                />
                <button
                  onClick={() => handleShiftDay(1)}
                  className="p-1.5 rounded-lg hover:bg-black/10 transition cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ backgroundColor: theme.accent, color: '#000' }}>
                  Day {activeDayCount}
                </span>
              </div>

              {/* Format & Theme pills */}
              <div className="flex flex-wrap gap-2">
                <div className="flex rounded-xl bg-white/30 backdrop-blur-sm p-1 border border-black/10">
                  <button
                    onClick={() => setFormat('wallpaper')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition flex items-center gap-1 cursor-pointer ${
                      format === 'wallpaper'
                        ? 'bg-black text-white shadow-md'
                        : 'hover:bg-black/5'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    Story
                  </button>
                  <button
                    onClick={() => setFormat('social')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition flex items-center gap-1 cursor-pointer ${
                      format === 'social'
                        ? 'bg-black text-white shadow-md'
                        : 'hover:bg-black/5'
                    }`}
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    Feed
                  </button>
                </div>

                <div className="flex rounded-xl bg-white/30 backdrop-blur-sm p-1 border border-black/10">
                  {THEMES.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setActiveTheme(t.id)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition cursor-pointer ${
                        activeTheme === t.id
                          ? 'bg-black text-white shadow-md'
                          : 'hover:bg-black/5'
                      }`}
                    >
                      {t.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mascot upload */}
              <div className="flex items-center gap-3 bg-white/30 backdrop-blur-sm rounded-xl p-2 border border-black/10">
                <span className="text-sm font-medium">Mascot</span>
                {customMascotImg ? (
                  <img
                    src={customMascotImg.src}
                    alt="custom"
                    className="w-8 h-8 rounded-full border-2 border-black/20 object-cover"
                  />
                ) : (
                  <span className="text-xs opacity-60">auto ({rating}★)</span>
                )}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-1.5 rounded-lg hover:bg-black/10 transition cursor-pointer ml-auto"
                >
                  <Upload className="w-4 h-4" />
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={handleMascotUpload}
                />
              </div>

              <p className="text-xs opacity-60 hidden lg:block">
                ⚡ High‑res 1080p PNG – perfect for lockscreen or social status.
              </p>
            </div>

            {/* Preview - right */}
            <div className="lg:col-span-7 flex items-center justify-center">
              <motion.div
                key={previewUrl}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="relative w-full max-w-70 lg:max-w-85 mx-auto"
              >
                {/* Device mockup */}
                <div
                  className={`relative rounded-3xl overflow-hidden shadow-2xl ${
                    format === 'wallpaper' ? 'aspect-9/16' : 'aspect-square'
                  }`}
                  style={{
                    border: '4px solid white',
                    backgroundColor: theme.bg,
                  }}
                >
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Card preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-sm opacity-50">
                      Rendering…
                    </div>
                  )}
                  <div className="absolute inset-0 shadow-inner pointer-events-none" />
                </div>
              </motion.div>
            </div>
          </div>

          {/* Footer actions */}
          <div className="px-6 py-4 border-t border-black/10 flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-black/5 hover:bg-black/10 transition text-sm font-medium cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={handleDownload}
              disabled={downloading || !previewUrl}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition active:scale-95 disabled:opacity-50 cursor-pointer"
              style={{ backgroundColor: theme.accent, color: '#000' }}
            >
              <Download className="w-4 h-4" />
              {downloading ? 'Generating…' : 'Download High‑Res Poster'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
