import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Download, 
  Share2, 
  Printer, 
  X, 
  Check, 
  Sparkles, 
  Flame, 
  Zap, 
  Calendar,
  Layers,
  Clock
} from 'lucide-react';
import { ratingMeta } from '../services/api';
import { soundEngine } from '../services/soundEngine';

export default function ReceiptOfTruthModal({
  isOpen,
  onClose,
  entry = null,
  dateStr = new Date().toISOString().slice(0, 10),
  dayCount = 1,
  entries = {},
  displayName = 'Daily Operator'
}) {
  const [downloading, setDownloading] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const canvasRef = useRef(null);

  const activeEntry = entry || entries[dateStr] || { rating: 3, verdict: 'Okay' };
  const rating = Number(activeEntry?.rating) || 3;
  const meta = ratingMeta[rating] || ratingMeta[3];

  // Calculate anchors and spheres
  const anchorsList = activeEntry?.anchors ? Object.entries(activeEntry.anchors) : [];
  const spheresList = activeEntry?.spheres ? Object.values(activeEntry.spheres).filter(s => s && s.rating) : [];

  // Generate unique transaction reference
  const transId = `TRN-${dateStr.replace(/-/g, '')}-${(rating * 1987 + dayCount * 73).toString().slice(-4)}`;

  useEffect(() => {
    if (!isOpen) return;

    // Render Canvas to generate high-resolution rasterized preview
    const canvas = canvasRef.current || document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 1. Streetwear Noir / Dark Slate Studio Backdrop
    ctx.fillStyle = '#0F1115';
    ctx.fillRect(0, 0, 1080, 1920);

    // Subtle dark grid aesthetic
    ctx.strokeStyle = '#1E232D';
    ctx.lineWidth = 1.5;
    for (let x = 0; x < 1080; x += 60) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 1920);
      ctx.stroke();
    }
    for (let y = 0; y < 1920; y += 60) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(1080, y);
      ctx.stroke();
    }

    // 2. Realistic Thermal Paper Dimensions
    const rx = 140;
    const ry = 100;
    const rw = 800;
    const rh = 1720;

    // Paper Drop Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(rx + 16, ry + 16, rw, rh);

    // Paper Base
    ctx.fillStyle = '#F4F2EC';
    ctx.fillRect(rx, ry, rw, rh);

    // Jagged Top Serration (Thermal tear line)
    const teethCount = 32;
    const toothWidth = rw / teethCount;
    ctx.fillStyle = '#0F1115';
    for (let i = 0; i < teethCount; i++) {
      ctx.beginPath();
      ctx.moveTo(rx + i * toothWidth, ry);
      ctx.lineTo(rx + (i + 0.5) * toothWidth, ry + 16);
      ctx.lineTo(rx + (i + 1) * toothWidth, ry);
      ctx.closePath();
      ctx.fill();
    }

    // Jagged Bottom Serration
    for (let i = 0; i < teethCount; i++) {
      ctx.beginPath();
      ctx.moveTo(rx + i * toothWidth, ry + rh);
      ctx.lineTo(rx + (i + 0.5) * toothWidth, ry + rh - 16);
      ctx.lineTo(rx + (i + 1) * toothWidth, ry + rh);
      ctx.closePath();
      ctx.fill();
    }

    // 3. Thermal Text Typography Engine
    ctx.fillStyle = '#111111';
    ctx.textAlign = 'center';

    let curY = ry + 80;

    // Header Store Logo
    ctx.font = '900 40px "Space Mono", monospace, monospace';
    ctx.fillText('⚡ SHIT OR HIT STORE ⚡', 540, curY);
    curY += 40;

    ctx.font = '700 24px "Space Mono", monospace';
    ctx.fillText('DAILY TRUTH THERMAL RECEIPT', 540, curY);
    curY += 30;

    ctx.font = '500 18px "Space Mono", monospace';
    ctx.fillStyle = '#555555';
    ctx.fillText('TOKYO • NEW YORK • BERLIN • LOCALHOST', 540, curY);
    curY += 45;

    // Divider Line
    ctx.strokeStyle = '#222222';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(rx + 40, curY);
    ctx.lineTo(rx + rw - 40, curY);
    ctx.stroke();
    curY += 40;

    // Transaction Metadata (Left / Right aligned)
    ctx.fillStyle = '#111111';
    ctx.font = '700 20px "Space Mono", monospace';

    const drawRow = (left, right, isBold = false) => {
      ctx.font = isBold ? '900 22px "Space Mono", monospace' : '600 20px "Space Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText(left, rx + 40, curY);
      ctx.textAlign = 'right';
      ctx.fillText(right, rx + rw - 40, curY);
      curY += 36;
    };

    drawRow('TRANS ID:', transId);
    drawRow('TERMINAL:', '01-DAILY-VERDICT-OS');
    drawRow('OPERATOR:', (displayName || 'TRINNO').toUpperCase());
    drawRow('DATE LOGGED:', dateStr);
    drawRow('DAY COUNT:', `DAY #${dayCount}`);
    curY += 15;

    // Itemized Divider
    ctx.setLineDash([8, 6]);
    ctx.strokeStyle = '#444444';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(rx + 40, curY);
    ctx.lineTo(rx + rw - 40, curY);
    ctx.stroke();
    ctx.setLineDash([]);
    curY += 40;

    // Column Headers
    ctx.font = '900 20px "Space Mono", monospace';
    ctx.textAlign = 'left';
    ctx.fillText('ITEM / HABIT', rx + 40, curY);
    ctx.textAlign = 'center';
    ctx.fillText('QTY', 540, curY);
    ctx.textAlign = 'right';
    ctx.fillText('VALUE', rx + rw - 40, curY);
    curY += 35;

    // Items
    ctx.font = '700 20px "Space Mono", monospace';
    const verdictText = `${meta.title.toUpperCase()} (${rating}★)`;
    drawRow(`VERDICT: [${verdictText}]`, rating >= 4 ? 'HIT' : 'SLUMP');
    drawRow('STREAK CONTINUITY', `${dayCount} DAYS`);

    // Non-Negotiable Habits
    if (anchorsList.length > 0) {
      curY += 10;
      ctx.font = '900 18px "Space Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText('-- DAILY NON-NEGOTIABLES --', rx + 40, curY);
      curY += 30;

      anchorsList.forEach(([anchorId, completed]) => {
        const cleanName = anchorId.replace(/_/g, ' ').toUpperCase();
        drawRow(`  • ${cleanName.slice(0, 20)}`, completed ? '[✓ LOCKED]' : '[✕ SKIPPED]');
      });
    }

    // Segmented Life Spheres
    if (spheresList.length > 0) {
      curY += 10;
      ctx.font = '900 18px "Space Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText('-- LIFE DOMAIN SPHERES --', rx + 40, curY);
      curY += 30;

      spheresList.forEach((s) => {
        drawRow(`  • ${(s.name || s.id).toUpperCase()}`, `${s.rating} / 5★`);
      });
    }

    // Subtotal Divider
    curY += 15;
    ctx.strokeStyle = '#222222';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(rx + 40, curY);
    ctx.lineTo(rx + rw - 40, curY);
    ctx.stroke();
    curY += 40;

    // Totals
    const truthScore = rating >= 4 ? '100% (HIT)' : rating === 3 ? '60% (HELD)' : '20% (ROUGH)';
    drawRow('SUBTOTAL SCORE:', truthScore, true);
    drawRow('EXCUSES TAX:', '$0.00 (ZERO TOLERANCE)', false);
    drawRow('FINAL ACCOUNTABILITY:', rating >= 3 ? 'CLEARED' : 'PENDING RECOVERY', true);
    curY += 25;

    // Double Line for Totals
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(rx + 40, curY);
    ctx.lineTo(rx + rw - 40, curY);
    ctx.stroke();
    curY += 45;

    // 4. Barcode Simulation (Variable width vertical stripes)
    ctx.textAlign = 'center';
    const barcodeStartX = rx + 80;
    const barcodeWidth = rw - 160;
    const barcodeHeight = 70;

    // Generate deterministic barcode pattern from transId
    let bx = barcodeStartX;
    const barcodeSeed = transId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    while (bx < barcodeStartX + barcodeWidth) {
      const w = ((bx * 7 + barcodeSeed) % 5) + 2;
      const gap = ((bx * 3) % 4) + 2;
      ctx.fillStyle = '#111111';
      ctx.fillRect(bx, curY, w, barcodeHeight);
      bx += w + gap;
    }

    curY += barcodeHeight + 25;
    ctx.font = '700 16px "Space Mono", monospace';
    ctx.fillText(`* ${transId} *`, 540, curY);
    curY += 45;

    // Footer Motto
    ctx.font = '900 18px "Space Mono", monospace';
    ctx.fillText('NO REFUNDS ON SQUANDERED TIME.', 540, curY);
    curY += 26;
    ctx.font = '600 16px "Space Mono", monospace';
    ctx.fillStyle = '#555555';
    ctx.fillText('RELOAD AND ATTACK TOMORROW.', 540, curY);

    // Generate high-res image URL
    try {
      const url = canvas.toDataURL('image/png');
      setPreviewUrl(url);
    } catch (e) {
      console.warn('Thermal preview generation notice:', e);
    }
  }, [isOpen, activeEntry, dateStr, dayCount, displayName, rating, meta, anchorsList, spheresList, transId]);

  if (!isOpen) return null;

  const handleDownload = () => {
    if (!previewUrl) return;
    setDownloading(true);
    soundEngine.playThermalPrint();

    setTimeout(() => {
      const anchor = document.createElement('a');
      anchor.href = previewUrl;
      anchor.download = `RECEIPT_OF_TRUTH_${dateStr}_${transId}.png`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      setDownloading(false);
      soundEngine.playSuccessChime();
    }, 400);
  };

  const handleWebShare = async () => {
    if (!previewUrl || typeof navigator === 'undefined' || !navigator.share) return;
    setSharing(true);
    soundEngine.playClick();

    try {
      const res = await fetch(previewUrl);
      const blob = await res.blob();
      const file = new File([blob], `receipt_${dateStr}.png`, { type: 'image/png' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `Receipt of Truth — ${dateStr}`,
          text: `Daily Verdict: ${rating}★ ${meta.title} on Day ${dayCount}. No refunds on time!`,
          files: [file]
        });
      } else {
        await navigator.share({
          title: `Receipt of Truth — ${dateStr}`,
          text: `Daily Verdict: ${rating}★ ${meta.title} on Day ${dayCount}. No refunds on time!`,
          url: window.location.href
        });
      }
    } catch (err) {
      console.warn('Web Share dismiss note:', err);
    } finally {
      setSharing(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-90 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.94, y: 15 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.94, y: 15 }}
          className="w-full max-w-lg bg-[#FFFDF5] rounded-3xl border-3 border-black p-4 sm:p-6 shadow-[8px_8px_0px_#000000] space-y-4 text-left max-h-[94vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b-2 border-black/10 pb-3 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-[#00E599] border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_#000000]">
                <Printer className="w-5 h-5 text-black stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display font-black text-lg uppercase leading-none">
                    RECEIPT OF TRUTH
                  </h3>
                  <span className="px-1.5 py-0.5 rounded bg-black text-[#00E599] text-[9px] font-mono font-black uppercase">
                    THERMAL 1080P
                  </span>
                </div>
                <span className="text-xs font-mono text-neutral-600">
                  Streetwear Itemized Daily Slip
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 border-2 border-black cursor-pointer shadow-[1.5px_1.5px_0px_#000000]"
            >
              <X className="w-4 h-4 text-black stroke-[2.5]" />
            </button>
          </div>

          {/* Receipt Preview Canvas / Image container */}
          <div className="flex-1 overflow-y-auto flex items-center justify-center p-2 bg-neutral-900 rounded-2xl border-2 border-black shadow-[3px_3px_0px_#000000] min-h-[360px]">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Receipt of Truth Thermal Preview"
                className="max-h-[500px] w-auto object-contain rounded-lg shadow-xl"
              />
            ) : (
              <div className="text-neutral-400 font-mono text-xs py-20 text-center">
                Rasterizing thermal supermarket slip...
              </div>
            )}
            <canvas ref={canvasRef} className="hidden" />
          </div>

          {/* Action Footer */}
          <div className="flex items-center gap-2 pt-2 border-t-2 border-black/10 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 bg-neutral-100 hover:bg-neutral-200 text-black font-display font-black text-xs uppercase rounded-xl border-2 border-black shadow-[2px_2px_0px_#000000] cursor-pointer shrink-0"
            >
              CLOSE
            </button>

            {typeof navigator !== 'undefined' && navigator.share && (
              <button
                type="button"
                onClick={handleWebShare}
                disabled={sharing || !previewUrl}
                className="py-2.5 px-4 bg-[#FDC800] hover:bg-amber-400 text-black font-display font-black text-xs uppercase rounded-xl border-2 border-black shadow-[2px_2px_0px_#000000] cursor-pointer shrink-0 flex items-center gap-1.5"
                title="Share to Instagram Stories or WhatsApp"
              >
                <Share2 className="w-4 h-4 stroke-[2.5]" />
                <span className="hidden sm:inline">{sharing ? 'SHARING...' : 'SHARE'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading || !previewUrl}
              className="flex-1 py-2.5 px-4 bg-[#00E599] hover:bg-emerald-400 text-black font-display font-black text-xs uppercase rounded-xl border-3 border-black shadow-[3px_3px_0px_#000000] active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 min-w-0"
            >
              <Download className="w-4 h-4 stroke-[2.5] shrink-0" />
              <span className="truncate">
                {downloading ? 'PRINTING THERMAL SLIP...' : 'PRINT / DOWNLOAD PNG'}
              </span>
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
