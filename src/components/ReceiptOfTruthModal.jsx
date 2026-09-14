import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Download, 
  Share2, 
  Printer, 
  X, 
  Check, 
  Calendar,
  Layers,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Scale,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  Flame,
  Zap,
  Sparkles
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

  // Mode: 'monthly' (Default) or 'daily'
  const [statementMode, setStatementMode] = useState('monthly');

  // Fallback to local cached database entries if prop is empty
  const allLedgerEntries = useMemo(() => {
    if (entries && Object.keys(entries).length > 0) return entries;
    try {
      const cached = localStorage.getItem('goodness_db');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed?.entries) return parsed.entries;
      }
    } catch (e) {}
    return {};
  }, [entries]);

  // View presentation mode: 'ticket' (interactive Neobrutalist receipt) or 'poster' (1080p canvas image)
  const [ticketViewMode, setTicketViewMode] = useState('ticket');

  // Month navigation state: e.g. "2026-09"
  const [selectedMonth, setSelectedMonth] = useState(() => dateStr.slice(0, 7));

  // Update selectedMonth if dateStr changes and modal opens
  useEffect(() => {
    if (isOpen && dateStr) {
      setSelectedMonth(dateStr.slice(0, 7));
    }
  }, [isOpen, dateStr]);

  const [yearNum, monthNum] = useMemo(() => {
    const parts = (selectedMonth || '2026-09').split('-').map(Number);
    return [parts[0] || 2026, parts[1] || 9];
  }, [selectedMonth]);

  const monthLabel = useMemo(() => {
    const d = new Date(yearNum, monthNum - 1, 1);
    return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase();
  }, [yearNum, monthNum]);

  const handlePrevMonth = () => {
    soundEngine.playClick();
    let newM = monthNum - 1;
    let newY = yearNum;
    if (newM < 1) {
      newM = 12;
      newY -= 1;
    }
    setSelectedMonth(`${newY}-${String(newM).padStart(2, '0')}`);
  };

  const handleNextMonth = () => {
    soundEngine.playClick();
    let newM = monthNum + 1;
    let newY = yearNum;
    if (newM > 12) {
      newM = 1;
      newY += 1;
    }
    setSelectedMonth(`${newY}-${String(newM).padStart(2, '0')}`);
  };

  // 🧮 Monthly Ledger Mathematics
  const monthlyLedger = useMemo(() => {
    const prefix = `${yearNum}-${String(monthNum).padStart(2, '0')}`;
    const daysInMonth = new Date(yearNum, monthNum, 0).getDate();

    const monthEntries = Object.entries(allLedgerEntries || {})
      .filter(([d, e]) => d.startsWith(prefix) && e && e.rating)
      .sort((a, b) => a[0].localeCompare(b[0]));

    let hitDays = 0;
    let peakDays = 0;
    let okayDays = 0;
    let downDays = 0;
    let roughDays = 0;
    let anchorsCompleted = 0;
    let anchorsSkipped = 0;
    let consecutiveRough = 0;
    let maxRoughStreak = 0;

    monthEntries.forEach(([_, e]) => {
      const r = Number(e.rating) || 3;
      if (r === 5) {
        peakDays++;
        hitDays++;
        consecutiveRough = 0;
      } else if (r === 4) {
        hitDays++;
        consecutiveRough = 0;
      } else if (r === 3) {
        okayDays++;
        consecutiveRough = 0;
      } else if (r === 2) {
        downDays++;
        consecutiveRough++;
        if (consecutiveRough > maxRoughStreak) maxRoughStreak = consecutiveRough;
      } else if (r === 1) {
        roughDays++;
        consecutiveRough++;
        if (consecutiveRough > maxRoughStreak) maxRoughStreak = consecutiveRough;
      }

      if (e.anchors && typeof e.anchors === 'object') {
        Object.values(e.anchors).forEach(val => {
          if (val === true) anchorsCompleted++;
          else if (val === false) anchorsSkipped++;
        });
      }
    });

    // Financial Values
    // Credits (Income)
    const hitCredits = hitDays * 10;
    const peakDividends = peakDays * 5;
    const habitCredits = anchorsCompleted * 2;
    const hitRate = monthEntries.length > 0 ? Math.round((hitDays / monthEntries.length) * 100) : 0;
    const consistencyBonus = hitRate >= 70 ? 25 : 0;
    const totalCredits = hitCredits + peakDividends + habitCredits + consistencyBonus;

    // Debits (Liabilities & Penalties)
    const roughDebits = roughDays * 15;
    const downDebits = downDays * 10;
    const skippedHabitDebits = anchorsSkipped * 4;
    const slumpPenalty = maxRoughStreak >= 2 ? maxRoughStreak * 10 : 0;
    const baselineOverhead = monthEntries.length > 0 ? 10 : 0;
    const totalDebits = roughDebits + downDebits + skippedHabitDebits + slumpPenalty + baselineOverhead;

    const netBalance = totalCredits - totalDebits;
    const isSolvent = netBalance >= 0;

    return {
      daysInMonth,
      loggedDaysCount: monthEntries.length,
      hitDays,
      peakDays,
      okayDays,
      downDays,
      roughDays,
      anchorsCompleted,
      anchorsSkipped,
      maxRoughStreak,
      hitRate,
      hitCredits,
      peakDividends,
      habitCredits,
      consistencyBonus,
      totalCredits,
      roughDebits,
      downDebits,
      skippedHabitDebits,
      slumpPenalty,
      baselineOverhead,
      totalDebits,
      netBalance,
      isSolvent
    };
  }, [allLedgerEntries, yearNum, monthNum]);

  // Single Day Lookup
  const activeEntry = entry || allLedgerEntries[dateStr] || { rating: 3, verdict: 'Okay' };
  const dailyRating = Number(activeEntry?.rating) || 3;
  const dailyMeta = ratingMeta[dailyRating] || ratingMeta[3];
  const dailyAnchorsList = activeEntry?.anchors ? Object.entries(activeEntry.anchors) : [];

  // Unique invoice / statement transaction code
  const transId = useMemo(() => {
    if (statementMode === 'monthly') {
      return `BILL-${selectedMonth.replace('-', '')}-${Math.abs(monthlyLedger.netBalance * 13 + monthlyLedger.loggedDaysCount * 7).toString().slice(-4)}`;
    }
    return `SLIP-${dateStr.replace(/-/g, '')}-${(dailyRating * 1987 + dayCount * 73).toString().slice(-4)}`;
  }, [statementMode, selectedMonth, dateStr, dailyRating, dayCount, monthlyLedger]);

  // 🎨 High-Resolution 1080p Canvas Rasterizer
  useEffect(() => {
    if (!isOpen) return;

    const canvas = canvasRef.current || document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 1. Streetwear Studio Grid Background
    ctx.fillStyle = '#0E1015';
    ctx.fillRect(0, 0, 1080, 1920);

    ctx.strokeStyle = '#181C24';
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

    // 2. Thermal Paper Base
    const rx = 130;
    const ry = 90;
    const rw = 820;
    const rh = 1740;

    // Soft Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(rx + 16, ry + 16, rw, rh);

    // Off-white thermal paper
    ctx.fillStyle = '#F4F2EC';
    ctx.fillRect(rx, ry, rw, rh);

    // Jagged Top Serration (Thermal tear teeth)
    const teethCount = 36;
    const toothWidth = rw / teethCount;
    ctx.fillStyle = '#0E1015';
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

    // 3. Typography & Financial Rows
    ctx.fillStyle = '#111111';
    ctx.textAlign = 'center';

    let curY = ry + 75;

    // Header Logo & Meta
    ctx.font = '900 36px "Space Mono", monospace, monospace';
    ctx.fillText('SHIT OR HIT FINANCIAL OS', 540, curY);
    curY += 38;

    ctx.font = '700 22px "Space Mono", monospace';
    ctx.fillText(statementMode === 'monthly' ? 'MONTHLY LIFE DEBT STATEMENT' : 'DAILY PERFORMANCE SLIP', 540, curY);
    curY += 28;

    ctx.font = '600 16px "Space Mono", monospace';
    ctx.fillStyle = '#555555';
    ctx.fillText(`BILLING PERIOD: ${statementMode === 'monthly' ? monthLabel : dateStr}`, 540, curY);
    curY += 38;

    // Solid Divider
    ctx.strokeStyle = '#222222';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(rx + 40, curY);
    ctx.lineTo(rx + rw - 40, curY);
    ctx.stroke();
    curY += 35;

    // Draw row helper
    const drawRow = (left, right, isBold = false, color = '#111111') => {
      ctx.fillStyle = color;
      ctx.font = isBold ? '900 20px "Space Mono", monospace' : '600 19px "Space Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText(left, rx + 40, curY);
      ctx.textAlign = 'right';
      ctx.fillText(right, rx + rw - 40, curY);
      curY += 32;
    };

    // Meta Header Information
    drawRow('INVOICE REF:', transId);
    drawRow('ACCOUNT HOLDER:', (displayName || 'TRINNO').toUpperCase());
    drawRow('RECORD STATUS:', statementMode === 'monthly' ? `${monthlyLedger.loggedDaysCount} / ${monthlyLedger.daysInMonth} DAYS AUDITED` : `DAY COUNT #${dayCount}`);
    curY += 10;

    // Dashed Divider
    ctx.setLineDash([8, 6]);
    ctx.strokeStyle = '#444444';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(rx + 40, curY);
    ctx.lineTo(rx + rw - 40, curY);
    ctx.stroke();
    ctx.setLineDash([]);
    curY += 35;

    if (statementMode === 'monthly') {
      // 🏦 MONTHLY STATEMENT LEDGER
      // Credits Section
      ctx.font = '900 18px "Space Mono", monospace';
      ctx.fillStyle = '#00875A';
      ctx.textAlign = 'left';
      ctx.fillText('+ DISCIPLINE CREDITS (ASSETS)', rx + 40, curY);
      curY += 28;

      drawRow(`  • Hit Days (${monthlyLedger.hitDays} days @ $10.00)`, `+$${monthlyLedger.hitCredits.toFixed(2)}`, false, '#111111');
      if (monthlyLedger.peakDays > 0) {
        drawRow(`  • Peak God-Mode Bonus (${monthlyLedger.peakDays} days)`, `+$${monthlyLedger.peakDividends.toFixed(2)}`, false, '#111111');
      }
      if (monthlyLedger.anchorsCompleted > 0) {
        drawRow(`  • Habit Anchors Executed (${monthlyLedger.anchorsCompleted})`, `+$${monthlyLedger.habitCredits.toFixed(2)}`, false, '#111111');
      }
      if (monthlyLedger.consistencyBonus > 0) {
        drawRow(`  • 70%+ Velocity Bonus`, `+$${monthlyLedger.consistencyBonus.toFixed(2)}`, false, '#111111');
      }
      drawRow('  SUBTOTAL ASSETS:', `+$${monthlyLedger.totalCredits.toFixed(2)}`, true, '#00875A');
      curY += 14;

      // Debits Section
      ctx.font = '900 18px "Space Mono", monospace';
      ctx.fillStyle = '#D90429';
      ctx.textAlign = 'left';
      ctx.fillText('- BEHAVIORAL DEBITS (LIABILITIES)', rx + 40, curY);
      curY += 28;

      if (monthlyLedger.roughDays > 0) {
        drawRow(`  • Rough Days In Trench (${monthlyLedger.roughDays} @ $15.00)`, `-$${monthlyLedger.roughDebits.toFixed(2)}`, false, '#111111');
      }
      if (monthlyLedger.downDays > 0) {
        drawRow(`  • Low-Battery Down Days (${monthlyLedger.downDays} @ $10.00)`, `-$${monthlyLedger.downDebits.toFixed(2)}`, false, '#111111');
      }
      if (monthlyLedger.skippedHabitDebits > 0) {
        drawRow(`  • Skipped Anchors Fee (${monthlyLedger.anchorsSkipped})`, `-$${monthlyLedger.skippedHabitDebits.toFixed(2)}`, false, '#111111');
      }
      if (monthlyLedger.slumpPenalty > 0) {
        drawRow(`  • Multi-Day Slump Penalty (${monthlyLedger.maxRoughStreak}d)`, `-$${monthlyLedger.slumpPenalty.toFixed(2)}`, false, '#111111');
      }
      drawRow('  • Procrastination / Friction Tax', `-$${monthlyLedger.baselineOverhead.toFixed(2)}`, false, '#111111');
      drawRow('  SUBTOTAL LIABILITIES:', `-$${monthlyLedger.totalDebits.toFixed(2)}`, true, '#D90429');
      curY += 18;

      // Net Totals Box
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(rx + 40, curY);
      ctx.lineTo(rx + rw - 40, curY);
      ctx.stroke();
      curY += 38;

      const formattedNet = monthlyLedger.netBalance >= 0 
        ? `+$${monthlyLedger.netBalance.toFixed(2)}` 
        : `-$${Math.abs(monthlyLedger.netBalance).toFixed(2)}`;

      drawRow('NET DISCIPLINE BALANCE:', formattedNet, true, monthlyLedger.isSolvent ? '#00875A' : '#D90429');
      drawRow('HIT MOMENTUM RATE:', `${monthlyLedger.hitRate}%`, true);
      curY += 10;
    } else {
      // 📄 DAILY SINGLE SLIP
      ctx.font = '900 18px "Space Mono", monospace';
      ctx.fillStyle = '#111111';
      ctx.textAlign = 'left';
      ctx.fillText('-- DAILY LINE ITEMS --', rx + 40, curY);
      curY += 30;

      drawRow(`VERDICT RATING:`, `${dailyMeta.title.toUpperCase()} (${dailyRating}★)`);
      drawRow(`EXECUTION STATUS:`, dailyRating >= 4 ? 'CLEARED [HIT]' : dailyRating === 3 ? 'HELD [BASELINE]' : 'ROUGH [TRENCH]');
      curY += 10;

      if (dailyAnchorsList.length > 0) {
        ctx.font = '900 18px "Space Mono", monospace';
        ctx.textAlign = 'left';
        ctx.fillText('-- HABIT ANCHORS --', rx + 40, curY);
        curY += 28;
        dailyAnchorsList.forEach(([id, done]) => {
          drawRow(`  • ${id.replace(/_/g, ' ').toUpperCase().slice(0, 20)}`, done ? '[✓ COMPLETED]' : '[✕ SKIPPED]');
        });
        curY += 10;
      }

      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(rx + 40, curY);
      ctx.lineTo(rx + rw - 40, curY);
      ctx.stroke();
      curY += 38;

      drawRow('DAILY VALUE:', dailyRating >= 4 ? '+$15.00 (CREDIT)' : dailyRating === 3 ? '+$5.00 (MAINTAINED)' : '-$15.00 (DEBT)', true);
      curY += 15;
    }

    // Double Rule
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(rx + 40, curY);
    ctx.lineTo(rx + rw - 40, curY);
    ctx.stroke();
    curY += 6;
    ctx.beginPath();
    ctx.moveTo(rx + 40, curY);
    ctx.lineTo(rx + rw - 40, curY);
    ctx.stroke();
    curY += 45;

    // 4. OFFICIAL NEOBRUTALIST RUBBER STAMP
    ctx.save();
    ctx.translate(540, curY + 60);
    ctx.rotate(-0.13); // -7.5 degrees tilt

    const stampW = 600;
    const stampH = 120;
    const stampX = -stampW / 2;
    const stampY = -stampH / 2;

    if (statementMode === 'monthly') {
      if (monthlyLedger.isSolvent) {
        // Solvent Stamp (Deep Emerald Green)
        ctx.strokeStyle = '#00875A';
        ctx.lineWidth = 4.5;
        ctx.setLineDash([12, 6]);
        ctx.strokeRect(stampX, stampY, stampW, stampH);
        ctx.setLineDash([]);

        ctx.strokeStyle = '#00875A';
        ctx.lineWidth = 2;
        ctx.strokeRect(stampX + 8, stampY + 8, stampW - 16, stampH - 16);

        ctx.fillStyle = '#00875A';
        ctx.textAlign = 'center';
        ctx.font = '900 28px "Space Mono", monospace';
        ctx.fillText('SOLVENT IN DISCIPLINE', 0, -6);
        ctx.font = '700 16px "Space Mono", monospace';
        ctx.fillText('AUDIT VERIFIED • NO LIFE DEBT ACCRUED', 0, 26);
      } else {
        // Debt Stamp (Vibrant Crimson Red)
        ctx.strokeStyle = '#D90429';
        ctx.lineWidth = 5;
        ctx.setLineDash([12, 6]);
        ctx.strokeRect(stampX, stampY, stampW, stampH);
        ctx.setLineDash([]);

        ctx.strokeStyle = '#D90429';
        ctx.lineWidth = 2;
        ctx.strokeRect(stampX + 8, stampY + 8, stampW - 16, stampH - 16);

        ctx.fillStyle = '#D90429';
        ctx.textAlign = 'center';
        ctx.font = '900 28px "Space Mono", monospace';
        ctx.fillText('IN LIFE DEBT: REPAYMENT REQUIRED', 0, -6);
        ctx.font = '700 16px "Space Mono", monospace';
        ctx.fillText('MORAL DEFICIT • NO EXCUSES ACCEPTED', 0, 26);
      }
    } else {
      const isDailyHit = dailyRating >= 4;
      ctx.strokeStyle = isDailyHit ? '#00875A' : '#D90429';
      ctx.lineWidth = 4;
      ctx.setLineDash([10, 5]);
      ctx.strokeRect(stampX, stampY, stampW, stampH);
      ctx.setLineDash([]);

      ctx.fillStyle = isDailyHit ? '#00875A' : '#D90429';
      ctx.textAlign = 'center';
      ctx.font = '900 28px "Space Mono", monospace';
      ctx.fillText(isDailyHit ? 'OFFICIAL VERDICT: HIT' : 'OFFICIAL VERDICT: ROUGH', 0, -4);
      ctx.font = '700 16px "Space Mono", monospace';
      ctx.fillText(isDailyHit ? 'EXECUTION RECORDED ON CHAIN' : 'CORRECTION MANDATORY TOMORROW', 0, 26);
    }
    ctx.restore();

    curY += 150;

    // 5. Authentic Barcode Graphics
    const bcX = rx + 60;
    const bcW = rw - 120;
    const bcH = 65;
    ctx.fillStyle = '#111111';

    let barX = bcX;
    const barWidths = [2, 4, 1, 3, 5, 2, 1, 4, 2, 6, 3, 1, 2, 4, 5, 1, 3, 2, 4, 6, 2, 1, 3, 5, 2, 4, 1, 3, 6, 2, 4, 2, 5, 1, 3, 2, 4, 1, 6, 3, 2];
    for (let i = 0; i < barWidths.length && barX < bcX + bcW; i++) {
      const bw = barWidths[i] * 2.2;
      if (i % 2 === 0) {
        ctx.fillRect(barX, curY, bw, bcH);
      }
      barX += bw + 3;
    }
    curY += bcH + 18;

    // Barcode serial label
    ctx.font = '700 16px "Space Mono", monospace';
    ctx.fillStyle = '#444444';
    ctx.textAlign = 'center';
    ctx.fillText(`* ${transId} *`, 540, curY);
    curY += 36;

    // Footer Moto
    ctx.font = '900 17px "Space Mono", monospace';
    ctx.fillStyle = '#111111';
    ctx.fillText('NO REFUNDS ON SQUANDERED TIME.', 540, curY);
    curY += 24;
    ctx.font = '600 15px "Space Mono", monospace';
    ctx.fillStyle = '#555555';
    ctx.fillText('RELOAD AND EXECUTE TOMORROW.', 540, curY);

    // Generate high-res image URL
    try {
      const url = canvas.toDataURL('image/png');
      setPreviewUrl(url);
    } catch (e) {
      console.warn('Thermal preview notice:', e);
    }
  }, [
    isOpen, 
    statementMode, 
    monthLabel, 
    selectedMonth, 
    dateStr, 
    dayCount, 
    displayName, 
    monthlyLedger, 
    activeEntry, 
    dailyRating, 
    dailyMeta, 
    dailyAnchorsList, 
    transId
  ]);

  if (!isOpen) return null;

  const handleDownload = () => {
    if (!previewUrl) return;
    setDownloading(true);
    soundEngine.playThermalPrint();

    setTimeout(() => {
      const anchor = document.createElement('a');
      anchor.href = previewUrl;
      anchor.download = `MONTHLY_LIFE_DEBT_INVOICE_${selectedMonth}_${transId}.png`;
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
      const file = new File([blob], `invoice_${selectedMonth}.png`, { type: 'image/png' });

      const shareText = statementMode === 'monthly'
        ? `Monthly Life Debt Statement (${monthLabel}): Net Balance ${monthlyLedger.netBalance >= 0 ? '+$' : '-$'}${Math.abs(monthlyLedger.netBalance).toFixed(2)}. ${monthlyLedger.isSolvent ? 'Solvent in discipline!' : 'In life debt.'}`
        : `Daily Performance Slip for ${dateStr}: ${dailyMeta.title} (${dailyRating}★). No refunds on time!`;

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `Life Debt Statement — ${monthLabel}`,
          text: shareText,
          files: [file]
        });
      } else {
        await navigator.share({
          title: `Life Debt Statement — ${monthLabel}`,
          text: shareText,
          url: window.location.href
        });
      }
    } catch (err) {
      console.warn('Share notice:', err);
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
        className="fixed inset-0 z-90 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.94, y: 15 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.94, y: 15 }}
          className="w-full max-w-xl bg-[#FFFDF5] rounded-3xl border-3 border-black p-3.5 sm:p-5 shadow-[8px_8px_0px_#000000] space-y-3 text-left max-h-[96vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b-2 border-black/10 pb-2.5 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className={`w-10 h-10 rounded-2xl border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_#000000] ${
                monthlyLedger.isSolvent ? 'bg-[#00E599]' : 'bg-[#FF4D4D]'
              }`}>
                <Scale className="w-5 h-5 text-black stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display font-black text-base sm:text-lg uppercase leading-none">
                    MONTHLY LIFE DEBT STATEMENT
                  </h3>
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-black uppercase border border-black ${
                    monthlyLedger.isSolvent ? 'bg-[#00E599] text-black' : 'bg-[#FF4D4D] text-white'
                  }`}>
                    {monthlyLedger.isSolvent ? 'SOLVENT' : 'IN DEBT'}
                  </span>
                </div>
                <span className="text-xs font-mono text-neutral-600">
                  Forensic Financial Ledger of Moral Equity
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 border-2 border-black cursor-pointer shadow-[1.5px_1.5px_0px_#000000] active:scale-95"
            >
              <X className="w-4 h-4 text-black stroke-[2.5]" />
            </button>
          </div>

          {/* Controls: Mode Switcher + Month Navigator + View Mode */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 bg-neutral-100 p-2 rounded-2xl border-2 border-black shrink-0">
            {/* Mode Switcher */}
            <div className="flex items-center gap-1 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => {
                  setStatementMode('monthly');
                  soundEngine.playClick();
                }}
                className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-xl border-2 border-black font-mono text-xs font-black uppercase transition-all cursor-pointer ${
                  statementMode === 'monthly'
                    ? 'bg-[#FDC800] text-black shadow-[2px_2px_0px_#000000]'
                    : 'bg-white text-neutral-700 hover:bg-neutral-50'
                }`}
              >
                MONTHLY LEDGER
              </button>
              <button
                type="button"
                onClick={() => {
                  setStatementMode('daily');
                  soundEngine.playClick();
                }}
                className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-xl border-2 border-black font-mono text-xs font-black uppercase transition-all cursor-pointer ${
                  statementMode === 'daily'
                    ? 'bg-[#FDC800] text-black shadow-[2px_2px_0px_#000000]'
                    : 'bg-white text-neutral-700 hover:bg-neutral-50'
                }`}
              >
                DAILY SLIP
              </button>
            </div>

            {/* Month Navigator (for Monthly Mode) & View Toggle */}
            <div className="flex items-center gap-1.5 w-full sm:w-auto justify-between sm:justify-end">
              {statementMode === 'monthly' && (
                <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-xl border border-black">
                  <button
                    type="button"
                    onClick={handlePrevMonth}
                    className="p-1 rounded-lg hover:bg-neutral-200 cursor-pointer"
                    title="Previous Month"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-mono font-black text-[11px] px-1 text-black whitespace-nowrap">
                    {monthLabel}
                  </span>
                  <button
                    type="button"
                    onClick={handleNextMonth}
                    className="p-1 rounded-lg hover:bg-neutral-200 cursor-pointer"
                    title="Next Month"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* View Presentation Switcher: Ticket vs Poster Preview */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setTicketViewMode('ticket');
                    soundEngine.playClick();
                  }}
                  className={`px-2 py-1 rounded-lg border border-black font-mono text-[10px] font-black uppercase cursor-pointer ${
                    ticketViewMode === 'ticket' ? 'bg-black text-white' : 'bg-white text-black hover:bg-neutral-100'
                  }`}
                >
                  TICKET
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTicketViewMode('poster');
                    soundEngine.playClick();
                  }}
                  className={`px-2 py-1 rounded-lg border border-black font-mono text-[10px] font-black uppercase cursor-pointer ${
                    ticketViewMode === 'poster' ? 'bg-black text-white' : 'bg-white text-black hover:bg-neutral-100'
                  }`}
                >
                  1080P POSTER
                </button>
              </div>
            </div>
          </div>

          {/* MAIN VIEW AREA */}
          <div className="flex-1 overflow-y-auto pr-1">
            {ticketViewMode === 'ticket' ? (
              /* 🧾 AUTHENTIC NEOBRUTALIST THERMAL PAPER TICKET COMPONENT */
              <div className="max-w-md mx-auto my-2 filter drop-shadow-[4px_4px_0px_#000000]">
                {/* Serrated Top Edge */}
                <div className="w-full overflow-hidden leading-none h-3 -mb-[1px]">
                  <svg className="w-full h-3" preserveAspectRatio="none" viewBox="0 0 300 12">
                    <path 
                      d="M0,12 L5,0 L10,12 L15,0 L20,12 L25,0 L30,12 L35,0 L40,12 L45,0 L50,12 L55,0 L60,12 L65,0 L70,12 L75,0 L80,12 L85,0 L90,12 L95,0 L100,12 L105,0 L110,12 L115,0 L120,12 L125,0 L130,12 L135,0 L140,12 L145,0 L150,12 L155,0 L160,12 L165,0 L170,12 L175,0 L180,12 L185,0 L190,12 L195,0 L200,12 L205,0 L210,12 L215,0 L220,12 L225,0 L230,12 L235,0 L240,12 L245,0 L250,12 L255,0 L260,12 L265,0 L270,12 L275,0 L280,12 L285,0 L290,12 L295,0 L300,12 Z" 
                      fill="#FAF9F5" 
                    />
                  </svg>
                </div>

                {/* Ticket Body */}
                <div className="bg-[#FAF9F5] border-x-3 border-black text-black font-mono p-4 sm:p-5 space-y-4 text-xs">
                  {/* Ticket Header */}
                  <div className="text-center space-y-1 pb-2 border-b-2 border-dashed border-black/40">
                    <div className="font-display font-black text-sm uppercase tracking-wider">
                      SHIT OR HIT FINANCIAL OS
                    </div>
                    <div className="font-black text-xs text-neutral-800 uppercase">
                      {statementMode === 'monthly' ? 'OFFICIAL MONTHLY LIFE DEBT STATEMENT' : 'DAILY PERFORMANCE AUDIT SLIP'}
                    </div>
                    <div className="text-[10px] text-neutral-600 font-bold">
                      PERIOD: {statementMode === 'monthly' ? monthLabel : dateStr} • REF: {transId}
                    </div>
                  </div>

                  {/* Operator Info */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] pb-2 border-b-2 border-dashed border-black/40">
                    <div>
                      <span className="text-neutral-500 block text-[9px]">OPERATOR</span>
                      <span className="font-black uppercase truncate block">{displayName || 'TRINNO'}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-neutral-500 block text-[9px]">AUDITED RECORDS</span>
                      <span className="font-black">
                        {statementMode === 'monthly' 
                          ? `${monthlyLedger.loggedDaysCount} / ${monthlyLedger.daysInMonth} DAYS` 
                          : `DAY #${dayCount}`}
                      </span>
                    </div>
                  </div>

                  {statementMode === 'monthly' ? (
                    <>
                      {/* SECTION 1: ASSETS / CREDITS */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between font-black text-emerald-800 text-[11px]">
                          <span>+ DISCIPLINE CREDITS (ASSETS)</span>
                          <span>RATE</span>
                        </div>

                        <div className="space-y-1 text-neutral-800 text-[11px]">
                          <div className="flex justify-between">
                            <span>• Hit Days ({monthlyLedger.hitDays} days @ $10)</span>
                            <span className="font-black text-emerald-700">+${monthlyLedger.hitCredits.toFixed(2)}</span>
                          </div>
                          {monthlyLedger.peakDays > 0 && (
                            <div className="flex justify-between">
                              <span>• Peak God-Mode Bonus ({monthlyLedger.peakDays} days)</span>
                              <span className="font-black text-emerald-700">+${monthlyLedger.peakDividends.toFixed(2)}</span>
                            </div>
                          )}
                          {monthlyLedger.anchorsCompleted > 0 && (
                            <div className="flex justify-between">
                              <span>• Anchors Executed ({monthlyLedger.anchorsCompleted} @ $2)</span>
                              <span className="font-black text-emerald-700">+${monthlyLedger.habitCredits.toFixed(2)}</span>
                            </div>
                          )}
                          {monthlyLedger.consistencyBonus > 0 && (
                            <div className="flex justify-between">
                              <span>• 70%+ Consistency Velocity Bonus</span>
                              <span className="font-black text-emerald-700">+${monthlyLedger.consistencyBonus.toFixed(2)}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex justify-between pt-1 border-t border-black/20 font-black text-emerald-900 text-xs">
                          <span>SUBTOTAL ASSETS:</span>
                          <span>+${monthlyLedger.totalCredits.toFixed(2)}</span>
                        </div>
                      </div>

                      {/* SECTION 2: LIABILITIES / DEBITS */}
                      <div className="space-y-1.5 pt-2 border-t-2 border-dashed border-black/40">
                        <div className="flex items-center justify-between font-black text-red-800 text-[11px]">
                          <span>- BEHAVIORAL DEBITS (LIABILITIES)</span>
                          <span>PENALTY</span>
                        </div>

                        <div className="space-y-1 text-neutral-800 text-[11px]">
                          {monthlyLedger.roughDays > 0 && (
                            <div className="flex justify-between">
                              <span>• Trench Days ({monthlyLedger.roughDays} @ $15)</span>
                              <span className="font-black text-red-700">-${monthlyLedger.roughDebits.toFixed(2)}</span>
                            </div>
                          )}
                          {monthlyLedger.downDays > 0 && (
                            <div className="flex justify-between">
                              <span>• Low-Battery Days ({monthlyLedger.downDays} @ $10)</span>
                              <span className="font-black text-red-700">-${monthlyLedger.downDebits.toFixed(2)}</span>
                            </div>
                          )}
                          {monthlyLedger.skippedHabitDebits > 0 && (
                            <div className="flex justify-between">
                              <span>• Skipped Habit Fee ({monthlyLedger.anchorsSkipped} missed @ $4)</span>
                              <span className="font-black text-red-700">-${monthlyLedger.skippedHabitDebits.toFixed(2)}</span>
                            </div>
                          )}
                          {monthlyLedger.slumpPenalty > 0 && (
                            <div className="flex justify-between">
                              <span>• Multi-Day Slump Penalty ({monthlyLedger.maxRoughStreak}d streak)</span>
                              <span className="font-black text-red-700">-${monthlyLedger.slumpPenalty.toFixed(2)}</span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span>• Procrastination & Inertia Baseline Tax</span>
                            <span className="font-black text-red-700">-${monthlyLedger.baselineOverhead.toFixed(2)}</span>
                          </div>
                        </div>

                        <div className="flex justify-between pt-1 border-t border-black/20 font-black text-red-900 text-xs">
                          <span>SUBTOTAL LIABILITIES:</span>
                          <span>-${monthlyLedger.totalDebits.toFixed(2)}</span>
                        </div>
                      </div>

                      {/* SECTION 3: NET PERFORMANCE BALANCE */}
                      <div className={`p-3 rounded-xl border-2 border-black space-y-1 ${
                        monthlyLedger.isSolvent ? 'bg-[#00E599]/20' : 'bg-[#FF4D4D]/20'
                      }`}>
                        <div className="flex justify-between items-center">
                          <span className="font-black text-xs uppercase">NET DISCIPLINE BALANCE:</span>
                          <span className={`text-base font-black ${
                            monthlyLedger.isSolvent ? 'text-emerald-950' : 'text-red-950'
                          }`}>
                            {monthlyLedger.netBalance >= 0 
                              ? `+$${monthlyLedger.netBalance.toFixed(2)}` 
                              : `-$${Math.abs(monthlyLedger.netBalance).toFixed(2)}`}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] text-neutral-700 font-bold">
                          <span>HIT MOMENTUM VELOCITY:</span>
                          <span>{monthlyLedger.hitRate}% EXECUTION</span>
                        </div>
                      </div>

                      {/* SECTION 4: AUTHENTIC TILTED RUBBER STAMP */}
                      <div className={`my-3 p-3 rounded-xl border-3 border-dashed font-mono font-black text-center uppercase transform -rotate-3 select-none ${
                        monthlyLedger.isSolvent 
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-[3px_3px_0px_#00875A]' 
                          : 'border-red-600 bg-red-50 text-red-900 shadow-[3px_3px_0px_#D90429]'
                      }`}>
                        <div className="text-sm sm:text-base tracking-wider font-black">
                          {monthlyLedger.isSolvent ? '★ SOLVENT IN DISCIPLINE ★' : '⚠ IN LIFE DEBT: REPAYMENT REQUIRED ⚠'}
                        </div>
                        <div className="text-[9px] tracking-tight text-neutral-600 mt-0.5 font-bold">
                          {monthlyLedger.isSolvent 
                            ? 'OFFICIAL AUDIT VERIFIED • MORAL CAPITAL IN SURPLUS' 
                            : 'DEFICIT CONFIRMED • COMPOUND PENALTIES APPLY • EXECUTE TOMORROW'}
                        </div>
                      </div>
                    </>
                  ) : (
                    /* DAILY MODE TICKET */
                    <div className="space-y-3">
                      <div className="p-3 bg-white border-2 border-black rounded-xl space-y-1.5">
                        <div className="flex justify-between">
                          <span className="font-black">VERDICT RATING:</span>
                          <span className="font-black uppercase">{dailyMeta.title} ({dailyRating}★)</span>
                        </div>
                        <div className="flex justify-between text-[11px]">
                          <span>EXECUTION STATE:</span>
                          <span className="font-bold">{dailyRating >= 4 ? 'CLEARED [HIT]' : dailyRating === 3 ? 'HELD [BASELINE]' : 'TRENCH [ROUGH]'}</span>
                        </div>
                      </div>

                      {dailyAnchorsList.length > 0 && (
                        <div className="space-y-1">
                          <span className="font-black text-[11px] block">HABIT ANCHORS:</span>
                          {dailyAnchorsList.map(([id, done]) => (
                            <div key={id} className="flex justify-between text-[11px]">
                              <span>• {id.replace(/_/g, ' ').toUpperCase()}</span>
                              <span className={done ? 'text-emerald-700 font-bold' : 'text-red-700 font-bold'}>
                                {done ? '[COMPLETED]' : '[SKIPPED]'}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="p-2.5 bg-neutral-100 border-2 border-black rounded-xl flex justify-between font-black">
                        <span>DAILY PERFORMANCE VALUE:</span>
                        <span>{dailyRating >= 4 ? '+$15.00' : dailyRating === 3 ? '+$5.00' : '-$15.00'}</span>
                      </div>
                    </div>
                  )}

                  {/* SECTION 5: REALISTIC VECTOR BARCODE */}
                  <div className="pt-2 text-center space-y-1 border-t-2 border-dashed border-black/40">
                    <div className="h-8 flex items-center justify-center gap-0.5 max-w-[240px] mx-auto opacity-80">
                      {[3, 2, 5, 1, 3, 4, 2, 6, 3, 1, 4, 5, 2, 4, 3, 5, 2, 4, 6, 2, 3, 4, 1, 4, 3, 5, 2, 4, 3, 5, 2, 4].map((w, idx) => (
                        <div 
                          key={idx} 
                          className="bg-black h-full" 
                          style={{ width: `${w > 3 ? 3 : w > 1 ? 2 : 1}px` }} 
                        />
                      ))}
                    </div>
                    <div className="text-[9px] tracking-widest text-neutral-600 font-bold">
                      * {transId} *
                    </div>
                  </div>

                  {/* SECTION 6: FORENSIC FOOTER */}
                  <div className="text-center pt-1 font-bold text-[10px] text-neutral-700 space-y-0.5">
                    <div>NO REFUNDS ON SQUANDERED TIME.</div>
                    <div className="text-neutral-500">RELOAD AND EXECUTE TOMORROW.</div>
                  </div>
                </div>

                {/* Serrated Bottom Edge */}
                <div className="w-full overflow-hidden leading-none h-3 -mt-[1px]">
                  <svg className="w-full h-3" preserveAspectRatio="none" viewBox="0 0 300 12">
                    <path 
                      d="M0,0 L5,12 L10,0 L15,12 L20,0 L25,12 L30,0 L35,12 L40,0 L45,12 L50,0 L55,12 L60,0 L65,12 L70,0 L75,12 L80,0 L85,12 L90,0 L95,12 L100,0 L105,12 L110,0 L115,12 L120,0 L125,12 L130,0 L135,12 L140,0 L145,12 L150,0 L155,12 L160,0 L165,12 L170,0 L175,12 L180,0 L185,12 L190,0 L195,12 L200,0 L205,12 L210,0 L215,12 L220,0 L225,12 L230,0 L235,12 L240,0 L245,12 L250,0 L255,12 L260,0 L265,12 L270,0 L275,12 L280,0 L285,12 L290,0 L295,12 L300,0 Z" 
                      fill="#FAF9F5" 
                    />
                  </svg>
                </div>
              </div>
            ) : (
              /* 🖼️ 1080P POSTER CANVAS PREVIEW */
              <div className="flex items-center justify-center p-3 bg-neutral-900 rounded-2xl border-2 border-black shadow-[3px_3px_0px_#000000] min-h-[360px]">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Monthly Life Debt Invoice Poster"
                    className="max-h-[440px] w-auto object-contain rounded-lg shadow-2xl"
                  />
                ) : (
                  <div className="text-neutral-400 font-mono text-xs py-20 text-center">
                    Generating 1080p thermal canvas poster...
                  </div>
                )}
              </div>
            )}
            <canvas ref={canvasRef} className="hidden" />
          </div>

          {/* Action Footer */}
          <div className="flex items-center gap-2 pt-2 border-t-2 border-black/10 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-3.5 bg-neutral-100 hover:bg-neutral-200 text-black font-display font-black text-xs uppercase rounded-xl border-2 border-black shadow-[2px_2px_0px_#000000] cursor-pointer shrink-0"
            >
              CLOSE
            </button>

            {typeof navigator !== 'undefined' && navigator.share && (
              <button
                type="button"
                onClick={handleWebShare}
                disabled={sharing || !previewUrl}
                className="py-2.5 px-3.5 bg-[#FDC800] hover:bg-amber-400 text-black font-display font-black text-xs uppercase rounded-xl border-2 border-black shadow-[2px_2px_0px_#000000] cursor-pointer shrink-0 flex items-center gap-1.5"
                title="Share Statement"
              >
                <Share2 className="w-4 h-4 stroke-[2.5]" />
                <span className="hidden sm:inline">{sharing ? 'SHARING...' : 'SHARE'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading || !previewUrl}
              className={`flex-1 py-2.5 px-3.5 font-display font-black text-xs uppercase rounded-xl border-3 border-black shadow-[3px_3px_0px_#000000] active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 min-w-0 ${
                monthlyLedger.isSolvent ? 'bg-[#00E599] hover:bg-emerald-400 text-black' : 'bg-[#FF4D4D] hover:bg-red-500 text-white'
              }`}
            >
              <Download className="w-4 h-4 stroke-[2.5] shrink-0" />
              <span className="truncate">
                {downloading ? 'PRINTING STATEMENT...' : 'PRINT / DOWNLOAD 1080P PNG'}
              </span>
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
