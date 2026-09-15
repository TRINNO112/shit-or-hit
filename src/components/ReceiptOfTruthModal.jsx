import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Download,
  Share2,
  X,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Sparkles,
  Receipt,
  Image as ImageIcon,
} from 'lucide-react';
import { ratingMeta } from '../services/api';
import { soundEngine } from '../services/soundEngine';

/* ------------------------------------------------------------------------
   Torn-perforation zigzag edge, generated once.
------------------------------------------------------------------------- */
function buildTeethPath(teeth, width, height) {
  const step = width / teeth;
  let d = `M0,${height} `;
  for (let i = 0; i < teeth; i++) {
    const xMid = (i + 0.5) * step;
    const xEnd = (i + 1) * step;
    d += `L${xMid.toFixed(2)},0 L${xEnd.toFixed(2)},${height} `;
  }
  d += 'Z';
  return d;
}
const TEETH_PATH = buildTeethPath(46, 440, 14);

const BARCODE_WIDTHS = [2, 4, 1, 3, 5, 2, 1, 4, 2, 6, 3, 1, 2, 4, 5, 1, 3, 2, 4, 6, 2, 1, 3, 5, 2, 4, 1, 3, 6, 2, 4, 2, 5, 1, 3, 2, 4, 1, 6, 3, 2];

function mulberry32(seed) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ------------------------------------------------------------------------
   Distressed rubber-stamp, built with an SVG turbulence filter so the
   ink edges look worn instead of a clean dashed rectangle.
------------------------------------------------------------------------- */
function StampMark({ color, line1, line2, seed = 4 }) {
  return (
    <svg viewBox="0 0 360 150" className="rot-stamp-svg" aria-hidden="true">
      <defs>
        <filter id={`rot-grunge-${seed}`} x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={seed} result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="5" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
      <g filter={`url(#rot-grunge-${seed})`}>
        <ellipse cx="180" cy="75" rx="168" ry="62" fill="none" stroke={color} strokeWidth="5" />
        <ellipse cx="180" cy="75" rx="152" ry="50" fill="none" stroke={color} strokeWidth="2" />
        <text x="180" y="70" textAnchor="middle" fontFamily="'Space Mono', monospace" fontWeight="700" fontSize="21" fill={color} letterSpacing="1">
          {line1}
        </text>
        <text x="180" y="96" textAnchor="middle" fontFamily="'Space Mono', monospace" fontWeight="700" fontSize="11" fill={color} letterSpacing="2">
          {line2}
        </text>
      </g>
    </svg>
  );
}

/* ------------------------------------------------------------------------
   Main Modal Component
------------------------------------------------------------------------- */
export default function ReceiptOfTruthModal({
  isOpen,
  onClose,
  entry = null,
  dateStr = new Date().toISOString().slice(0, 10),
  dayCount = 1,
  entries = {},
  displayName = 'Daily Operator',
}) {
  const [downloading, setDownloading] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [fontsReady, setFontsReady] = useState(false);
  const canvasRef = useRef(null);

  const [statementMode, setStatementMode] = useState('monthly'); // 'monthly' | 'daily'
  const [ticketViewMode, setTicketViewMode] = useState('ticket'); // 'ticket' | 'poster'
  const [selectedMonth, setSelectedMonth] = useState(() => (dateStr || new Date().toISOString().slice(0, 10)).slice(0, 7));

  // Resolved entries database fallback
  const resolvedEntries = useMemo(() => {
    if (entries && Object.keys(entries).length > 0) return entries;
    try {
      const cached = localStorage.getItem('goodness_db') || localStorage.getItem('goodness_db_guest');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed?.entries) return parsed.entries;
      }
    } catch (e) {}
    return {};
  }, [entries]);

  useEffect(() => {
    if (isOpen && dateStr) setSelectedMonth(dateStr.slice(0, 7));
  }, [isOpen, dateStr]);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      document.fonts?.load('900 32px "Archivo Black"'),
      document.fonts?.load('700 18px "Space Mono"'),
      document.fonts?.load('400 16px "Space Mono"'),
    ])
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setFontsReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const [yearNum, monthNum] = useMemo(() => {
    const parts = (selectedMonth || '2026-09').split('-').map(Number);
    return [parts[0] || 2026, parts[1] || 9];
  }, [selectedMonth]);

  const monthLabel = useMemo(() => {
    const d = new Date(yearNum, monthNum - 1, 1);
    return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }, [yearNum, monthNum]);

  const handlePrevMonth = () => {
    soundEngine.playClick?.();
    let newM = monthNum - 1;
    let newY = yearNum;
    if (newM < 1) {
      newM = 12;
      newY -= 1;
    }
    setSelectedMonth(`${newY}-${String(newM).padStart(2, '0')}`);
  };

  const handleNextMonth = () => {
    soundEngine.playClick?.();
    let newM = monthNum + 1;
    let newY = yearNum;
    if (newM > 12) {
      newM = 1;
      newY += 1;
    }
    setSelectedMonth(`${newY}-${String(newM).padStart(2, '0')}`);
  };

  // Monthly ledger mathematics
  const monthlyLedger = useMemo(() => {
    const prefix = `${yearNum}-${String(monthNum).padStart(2, '0')}`;
    const daysInMonth = new Date(yearNum, monthNum, 0).getDate();

    const monthEntries = Object.entries(resolvedEntries || {})
      .filter(([d, e]) => d.startsWith(prefix) && e && e.rating)
      .sort((a, b) => a[0].localeCompare(b[0]));

    let hitDays = 0, peakDays = 0, okayDays = 0, downDays = 0, roughDays = 0;
    let anchorsCompleted = 0, anchorsSkipped = 0;
    let consecutiveRough = 0, maxRoughStreak = 0;

    monthEntries.forEach(([_, e]) => {
      const r = Number(e.rating) || 3;
      if (r === 5) { peakDays++; hitDays++; consecutiveRough = 0; }
      else if (r === 4) { hitDays++; consecutiveRough = 0; }
      else if (r === 3) { okayDays++; consecutiveRough = 0; }
      else if (r === 2) { downDays++; consecutiveRough++; if (consecutiveRough > maxRoughStreak) maxRoughStreak = consecutiveRough; }
      else if (r === 1) { roughDays++; consecutiveRough++; if (consecutiveRough > maxRoughStreak) maxRoughStreak = consecutiveRough; }

      if (e.anchors && typeof e.anchors === 'object') {
        Object.values(e.anchors).forEach((val) => {
          if (val === true) anchorsCompleted++;
          else if (val === false) anchorsSkipped++;
        });
      }
    });

    const hitCredits = hitDays * 10;
    const peakDividends = peakDays * 5;
    const habitCredits = anchorsCompleted * 2;
    const hitRate = monthEntries.length > 0 ? Math.round((hitDays / monthEntries.length) * 100) : 0;
    const consistencyBonus = hitRate >= 70 ? 25 : 0;
    const totalCredits = hitCredits + peakDividends + habitCredits + consistencyBonus;

    const roughDebits = roughDays * 15;
    const downDebits = downDays * 10;
    const skippedHabitDebits = anchorsSkipped * 4;
    const slumpPenalty = maxRoughStreak >= 2 ? maxRoughStreak * 10 : 0;
    const baselineOverhead = monthEntries.length > 0 ? 10 : 0;
    const totalDebits = roughDebits + downDebits + skippedHabitDebits + slumpPenalty + baselineOverhead;

    const netBalance = totalCredits - totalDebits;
    const isSolvent = netBalance >= 0;

    return {
      daysInMonth, loggedDaysCount: monthEntries.length, hitDays, peakDays, okayDays, downDays, roughDays,
      anchorsCompleted, anchorsSkipped, maxRoughStreak, hitRate,
      hitCredits, peakDividends, habitCredits, consistencyBonus, totalCredits,
      roughDebits, downDebits, skippedHabitDebits, slumpPenalty, baselineOverhead, totalDebits,
      netBalance, isSolvent,
    };
  }, [resolvedEntries, yearNum, monthNum]);

  const activeEntry = entry || resolvedEntries[dateStr] || { rating: 3 };
  const dailyRating = Number(activeEntry?.rating) || 3;
  const metaLookup = ratingMeta || {
    1: { title: 'Rough' },
    2: { title: 'Down' },
    3: { title: 'Okay' },
    4: { title: 'Hit' },
    5: { title: 'Peak' }
  };
  const dailyMeta = metaLookup[dailyRating] || metaLookup[3];
  const dailyAnchorsList = activeEntry?.anchors ? Object.entries(activeEntry.anchors) : [];

  const transId = useMemo(() => {
    if (statementMode === 'monthly') {
      return `BILL-${selectedMonth.replace('-', '')}-${Math.abs(monthlyLedger.netBalance * 13 + monthlyLedger.loggedDaysCount * 7).toString().slice(-4).padStart(4, '0')}`;
    }
    return `SLIP-${(dateStr || '20260914').replace(/-/g, '')}-${(dailyRating * 1987 + (dayCount || 1) * 73).toString().slice(-4).padStart(4, '0')}`;
  }, [statementMode, selectedMonth, dateStr, dailyRating, dayCount, monthlyLedger]);

  const INK = '#15130F';
  const PAPER = '#F3EFE2';
  const CREDIT = '#146B43';
  const DEBIT = '#AD2E22';

  // 1080x1920 poster rasterizer
  useEffect(() => {
    if (!isOpen) return;
    const canvas = canvasRef.current || document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const mono = (w, s) => `${w} ${s}px "Space Mono", monospace`;
    const display = (s) => `900 ${s}px "Archivo Black", sans-serif`;

    // Backdrop
    ctx.fillStyle = '#101014';
    ctx.fillRect(0, 0, 1080, 1920);
    ctx.strokeStyle = 'rgba(255,255,255,0.035)';
    ctx.lineWidth = 1;
    for (let x = 0; x < 1080; x += 54) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 1920); ctx.stroke(); }
    for (let y = 0; y < 1920; y += 54) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(1080, y); ctx.stroke(); }

    const rx = 130, ry = 90, rw = 820, rh = 1740;
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(rx + 14, ry + 14, rw, rh);
    ctx.fillStyle = PAPER;
    ctx.fillRect(rx, ry, rw, rh);

    // Serrations
    const teeth = 40, toothW = rw / teeth;
    ctx.fillStyle = '#101014';
    for (let i = 0; i < teeth; i++) {
      ctx.beginPath(); ctx.moveTo(rx + i * toothW, ry); ctx.lineTo(rx + (i + 0.5) * toothW, ry + 14); ctx.lineTo(rx + (i + 1) * toothW, ry); ctx.closePath(); ctx.fill();
    }
    for (let i = 0; i < teeth; i++) {
      ctx.beginPath(); ctx.moveTo(rx + i * toothW, ry + rh); ctx.lineTo(rx + (i + 0.5) * toothW, ry + rh - 14); ctx.lineTo(rx + (i + 1) * toothW, ry + rh); ctx.closePath(); ctx.fill();
    }

    ctx.textAlign = 'center';
    let curY = ry + 78;

    ctx.fillStyle = INK;
    ctx.font = display(34);
    ctx.fillText('SHIT OR HIT', 540, curY); curY += 34;
    ctx.font = mono(700, 18);
    ctx.fillText(statementMode === 'monthly' ? 'Monthly Life Debt Statement' : 'Daily Performance Slip', 540, curY); curY += 26;
    ctx.fillStyle = '#66614F';
    ctx.font = mono(400, 14);
    ctx.fillText(`Billing period: ${statementMode === 'monthly' ? monthLabel : dateStr}`, 540, curY); curY += 34;

    ctx.strokeStyle = INK; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(rx + 40, curY); ctx.lineTo(rx + rw - 40, curY); ctx.stroke(); curY += 32;

    const row = (left, right, bold = false, color = INK) => {
      ctx.fillStyle = color;
      ctx.font = mono(bold ? 700 : 400, bold ? 19 : 17);
      ctx.textAlign = 'left'; ctx.fillText(left, rx + 40, curY);
      ctx.textAlign = 'right'; ctx.fillText(right, rx + rw - 40, curY);
      curY += 30;
    };

    row('Invoice ref', transId);
    row('Account holder', displayName || 'Daily Operator');
    row('Record status', statementMode === 'monthly' ? `${monthlyLedger.loggedDaysCount} / ${monthlyLedger.daysInMonth} days audited` : `Day #${dayCount}`);
    curY += 8;

    ctx.setLineDash([7, 6]); ctx.strokeStyle = '#B8B1A0'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(rx + 40, curY); ctx.lineTo(rx + rw - 40, curY); ctx.stroke(); ctx.setLineDash([]);
    curY += 32;

    if (statementMode === 'monthly') {
      ctx.textAlign = 'left'; ctx.fillStyle = CREDIT; ctx.font = mono(700, 15);
      ctx.fillText('DISCIPLINE CREDITS', rx + 40, curY); curY += 26;

      row(`Hit days (${monthlyLedger.hitDays} @ $10)`, `+$${monthlyLedger.hitCredits.toFixed(2)}`);
      if (monthlyLedger.peakDays > 0) row(`Peak bonus (${monthlyLedger.peakDays})`, `+$${monthlyLedger.peakDividends.toFixed(2)}`);
      if (monthlyLedger.anchorsCompleted > 0) row(`Anchors completed (${monthlyLedger.anchorsCompleted})`, `+$${monthlyLedger.habitCredits.toFixed(2)}`);
      if (monthlyLedger.consistencyBonus > 0) row('70%+ consistency bonus', `+$${monthlyLedger.consistencyBonus.toFixed(2)}`);
      row('Subtotal assets', `+$${monthlyLedger.totalCredits.toFixed(2)}`, true, CREDIT);
      curY += 10;

      ctx.textAlign = 'left'; ctx.fillStyle = DEBIT; ctx.font = mono(700, 15);
      ctx.fillText('BEHAVIORAL DEBITS', rx + 40, curY); curY += 26;

      if (monthlyLedger.roughDays > 0) row(`Rough days (${monthlyLedger.roughDays} @ $15)`, `-$${monthlyLedger.roughDebits.toFixed(2)}`);
      if (monthlyLedger.downDays > 0) row(`Down days (${monthlyLedger.downDays} @ $10)`, `-$${monthlyLedger.downDebits.toFixed(2)}`);
      if (monthlyLedger.skippedHabitDebits > 0) row(`Skipped anchors (${monthlyLedger.anchorsSkipped})`, `-$${monthlyLedger.skippedHabitDebits.toFixed(2)}`);
      if (monthlyLedger.slumpPenalty > 0) row(`Slump penalty (${monthlyLedger.maxRoughStreak}d streak)`, `-$${monthlyLedger.slumpPenalty.toFixed(2)}`);
      row('Friction tax', `-$${monthlyLedger.baselineOverhead.toFixed(2)}`);
      row('Subtotal liabilities', `-$${monthlyLedger.totalDebits.toFixed(2)}`, true, DEBIT);
      curY += 14;

      ctx.strokeStyle = INK; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(rx + 40, curY); ctx.lineTo(rx + rw - 40, curY); ctx.stroke(); curY += 36;

      const netStr = monthlyLedger.netBalance >= 0 ? `+$${monthlyLedger.netBalance.toFixed(2)}` : `-$${Math.abs(monthlyLedger.netBalance).toFixed(2)}`;
      row('Net discipline balance', netStr, true, monthlyLedger.isSolvent ? CREDIT : DEBIT);
      row('Hit momentum rate', `${monthlyLedger.hitRate}%`, true);
      curY += 6;
    } else {
      ctx.textAlign = 'left'; ctx.fillStyle = INK; ctx.font = mono(700, 15);
      ctx.fillText('DAILY LINE ITEMS', rx + 40, curY); curY += 26;

      row('Verdict rating', `${dailyMeta.title} (${dailyRating}\u2605)`);
      row('Execution status', dailyRating >= 4 ? 'Cleared' : dailyRating === 3 ? 'Held at baseline' : 'In the trench');
      curY += 8;

      if (dailyAnchorsList.length > 0) {
        ctx.textAlign = 'left'; ctx.font = mono(700, 15);
        ctx.fillText('HABIT ANCHORS', rx + 40, curY); curY += 26;
        dailyAnchorsList.forEach(([id, done]) => {
          row(id.replace(/_/g, ' '), done ? 'Completed' : 'Skipped', false, done ? CREDIT : DEBIT);
        });
        curY += 8;
      }

      ctx.strokeStyle = INK; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(rx + 40, curY); ctx.lineTo(rx + rw - 40, curY); ctx.stroke(); curY += 36;
      row('Daily value', dailyRating >= 4 ? '+$15.00' : dailyRating === 3 ? '+$5.00' : '-$15.00', true);
      curY += 10;
    }

    ctx.strokeStyle = INK; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(rx + 40, curY); ctx.lineTo(rx + rw - 40, curY); ctx.stroke(); curY += 44;

    // Distressed stamp (procedural jitter ring, seeded for stable output)
    const stampRng = mulberry32(42);
    const isSolventState = statementMode === 'monthly' ? monthlyLedger.isSolvent : dailyRating >= 4;
    const stampColor = isSolventState ? CREDIT : DEBIT;
    ctx.save();
    ctx.translate(540, curY + 62);
    ctx.rotate(-0.07);

    const drawRing = (w, h, lineW) => {
      ctx.beginPath();
      const steps = 140;
      for (let i = 0; i <= steps; i++) {
        const a = (i / steps) * Math.PI * 2;
        const jitter = 1 + (stampRng() - 0.5) * 0.05;
        const x = Math.cos(a) * w * jitter;
        const y = Math.sin(a) * h * jitter;
        if (stampRng() < 0.05) { ctx.stroke(); ctx.beginPath(); ctx.moveTo(x, y); }
        else if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
    };
    ctx.strokeStyle = stampColor;
    ctx.lineWidth = 5; drawRing(290, 105, 5);
    ctx.lineWidth = 2; drawRing(258, 88, 2);

    ctx.fillStyle = stampColor; ctx.textAlign = 'center';
    ctx.font = mono(700, 25);
    ctx.fillText(isSolventState ? 'SOLVENT IN DISCIPLINE' : 'IN LIFE DEBT', 0, -6);
    ctx.font = mono(700, 13);
    ctx.fillText(isSolventState ? 'AUDIT VERIFIED \u2022 NO DEBT ACCRUED' : 'REPAYMENT REQUIRED \u2022 EXECUTE TOMORROW', 0, 18);
    ctx.restore();

    curY += 165;

    // Barcode
    const bcX = rx + 60, bcW = rw - 120, bcH = 58;
    ctx.fillStyle = INK;
    let barX = bcX;
    for (let i = 0; i < BARCODE_WIDTHS.length && barX < bcX + bcW; i++) {
      const bw = BARCODE_WIDTHS[i] * 2.1;
      if (i % 2 === 0) ctx.fillRect(barX, curY, bw, bcH);
      barX += bw + 3;
    }
    curY += bcH + 16;
    ctx.font = mono(700, 14); ctx.fillStyle = '#66614F'; ctx.textAlign = 'center';
    ctx.fillText(`* ${transId} *`, 540, curY); curY += 34;

    ctx.font = mono(700, 16); ctx.fillStyle = INK;
    ctx.fillText('No refunds on squandered time.', 540, curY); curY += 22;
    ctx.font = mono(400, 14); ctx.fillStyle = '#66614F';
    ctx.fillText('Reload and execute tomorrow.', 540, curY);

    try {
      setPreviewUrl(canvas.toDataURL('image/png'));
    } catch (e) {
      /* canvas export fallback */
    }
  }, [isOpen, statementMode, monthLabel, selectedMonth, dateStr, dayCount, displayName, monthlyLedger, dailyRating, dailyMeta, dailyAnchorsList, transId, fontsReady]);

  if (!isOpen) return null;

  const handleDownload = () => {
    if (!previewUrl) return;
    setDownloading(true);
    soundEngine.playThermalPrint?.();
    setTimeout(() => {
      const anchor = document.createElement('a');
      anchor.href = previewUrl;
      anchor.download = `life-debt-statement-${selectedMonth}-${transId}.png`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      setDownloading(false);
      soundEngine.playSuccessChime?.();
    }, 350);
  };

  const handleWebShare = async () => {
    if (!previewUrl || typeof navigator === 'undefined' || !navigator.share) return;
    setSharing(true);
    soundEngine.playClick?.();
    try {
      const res = await fetch(previewUrl);
      const blob = await res.blob();
      const file = new File([blob], `statement-${selectedMonth}.png`, { type: 'image/png' });
      const shareText = statementMode === 'monthly'
        ? `Monthly Life Debt Statement (${monthLabel}): net balance ${monthlyLedger.netBalance >= 0 ? '+$' : '-$'}${Math.abs(monthlyLedger.netBalance).toFixed(2)}.`
        : `Daily Performance Slip for ${dateStr}: ${dailyMeta.title} (${dailyRating}\u2605).`;

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ title: `Life Debt Statement \u2014 ${monthLabel}`, text: shareText, files: [file] });
      } else {
        await navigator.share({ title: `Life Debt Statement \u2014 ${monthLabel}`, text: shareText });
      }
    } catch (err) {
      /* user cancelled or share unsupported */
    } finally {
      setSharing(false);
    }
  };

  const isSolvent = monthlyLedger.isSolvent;

  return (
    <div className="rot-backdrop" onClick={onClose}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Archivo+Black&family=Space+Mono:wght@400;700&display=swap');

        .rot-backdrop {
          --ink: #15130F;
          --paper: #F3EFE2;
          --paper-shell: #FBF8EF;
          --credit: #146B43;
          --credit-soft: rgba(20,107,67,0.08);
          --debit: #AD2E22;
          --debit-soft: rgba(173,46,34,0.08);
          --gold: #D99A2B;
          --line: rgba(21,19,15,0.16);
          position: fixed; inset: 0; z-index: 90;
          background: rgba(8,8,10,0.85);
          backdrop-filter: blur(8px);
          display: flex; align-items: center; justify-content: center;
          padding: 12px; overflow-y: auto;
          font-family: 'Space Mono', ui-monospace, monospace;
          box-sizing: border-box;
        }
        .rot-backdrop *, .rot-backdrop *::before, .rot-backdrop *::after { box-sizing: border-box; }
        .rot-display { font-family: 'Archivo Black', sans-serif; }

        @keyframes rot-pop-in { from { opacity: 0; transform: translateY(14px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
        .rot-anim-in { animation: rot-pop-in 0.28s cubic-bezier(.2,.8,.2,1) both; }
        @media (prefers-reduced-motion: reduce) { .rot-anim-in { animation: none; } }

        .rot-shell {
          width: 100%; max-width: 30rem;
          background: var(--paper-shell);
          border: 3px solid var(--ink);
          border-radius: 22px;
          box-shadow: 8px 8px 0 var(--ink);
          padding: 14px;
          display: flex; flex-direction: column; gap: 10px;
          max-height: 94vh;
          overflow: hidden;
        }
        @media (min-width: 640px) {
          .rot-shell { padding: 18px; gap: 12px; }
        }

        .rot-header { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding-bottom: 10px; border-bottom: 2px solid rgba(21,19,15,0.1); }
        .rot-header-left { display: flex; align-items: center; gap: 10px; min-width: 0; }
        .rot-header-icon { width: 38px; height: 38px; border-radius: 12px; border: 2px solid var(--ink); display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 2px 2px 0 var(--ink); }
        .rot-header-title-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
        .rot-title { font-size: 15px; color: var(--ink); margin: 0; line-height: 1.1; }
        .rot-pill { font-family: 'Space Mono', monospace; font-weight: 700; font-size: 9px; letter-spacing: 0.06em; text-transform: uppercase; padding: 2px 7px; border-radius: 999px; border: 1.5px solid var(--ink); }
        .rot-eyebrow { font-size: 11px; color: #75705E; display: block; margin-top: 1px; }
        .rot-icon-btn { padding: 8px; border-radius: 10px; background: rgba(21,19,15,0.06); border: 2px solid var(--ink); cursor: pointer; display: flex; box-shadow: 1.5px 1.5px 0 var(--ink); flex-shrink: 0; }
        .rot-icon-btn:hover { background: rgba(21,19,15,0.12); }
        .rot-icon-btn:focus-visible, .rot-btn:focus-visible, .rot-nav-btn:focus-visible, .rot-toggle-btn:focus-visible, .rot-segment-btn:focus-visible { outline: 3px solid var(--gold); outline-offset: 2px; }

        .rot-controls { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 8px; background: rgba(21,19,15,0.045); padding: 6px; border-radius: 14px; border: 2px solid var(--ink); }
        .rot-segment { position: relative; display: grid; grid-template-columns: 1fr 1fr; width: 100%; max-width: 232px; background: var(--paper); border-radius: 10px; border: 2px solid var(--ink); padding: 3px; }
        .rot-segment-thumb { position: absolute; top: 3px; bottom: 3px; left: 3px; width: calc(50% - 3px); background: var(--ink); border-radius: 7px; transition: transform 0.25s cubic-bezier(.2,.8,.2,1); }
        .rot-segment-btn { position: relative; z-index: 1; background: transparent; border: none; padding: 7px 6px; font-family: 'Space Mono', monospace; font-weight: 700; font-size: 10.5px; letter-spacing: 0.02em; cursor: pointer; text-transform: uppercase; }

        .rot-controls-right { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
        .rot-month-nav { display: flex; align-items: center; gap: 2px; background: var(--paper); border: 1.5px solid var(--ink); border-radius: 10px; padding: 3px 6px; }
        .rot-nav-btn { padding: 3px; border-radius: 6px; border: none; background: transparent; cursor: pointer; display: flex; }
        .rot-nav-btn:hover { background: rgba(21,19,15,0.08); }
        .rot-month-label { font-family: 'Space Mono', monospace; font-weight: 700; font-size: 10.5px; padding: 0 4px; white-space: nowrap; }
        .rot-view-toggle { display: flex; gap: 3px; background: var(--paper); border: 1.5px solid var(--ink); border-radius: 10px; padding: 3px; }
        .rot-toggle-btn { padding: 5px 7px; border-radius: 7px; border: none; background: transparent; cursor: pointer; color: var(--ink); display: flex; }
        .rot-toggle-btn.is-active { background: var(--ink); color: var(--paper); }

        .rot-main { flex: 1; overflow-y: auto; padding: 2px; min-height: 0; }
        .rot-ticket-wrap { max-width: 26rem; margin: 4px auto; filter: drop-shadow(3px 5px 0 rgba(21,19,15,0.35)); }
        .rot-teeth { display: block; width: 100%; height: 12px; }
        .rot-teeth-bottom { transform: scaleY(-1); }
        .rot-paper { position: relative; background: var(--paper); border-left: 2.5px solid var(--ink); border-right: 2.5px solid var(--ink); overflow: hidden; }
        .rot-grain { position: absolute; inset: 0; width: 100%; height: 100%; opacity: 0.05; mix-blend-mode: multiply; pointer-events: none; }
        .rot-paper-content { position: relative; padding: 16px 14px; font-size: 11.5px; color: var(--ink); }
        @media (min-width: 640px) {
          .rot-paper-content { padding: 18px 18px 16px; }
        }

        .rot-masthead { text-align: center; padding-bottom: 10px; }
        .rot-masthead-title { font-size: 17px; letter-spacing: 0.01em; }
        .rot-masthead-sub { font-weight: 700; font-size: 10.5px; text-transform: uppercase; letter-spacing: 0.04em; margin-top: 3px; }
        .rot-masthead-meta { font-size: 9.5px; color: #75705E; margin-top: 3px; font-weight: 700; }

        .rot-dashed { border-top: 1.5px dashed var(--line); margin: 10px 0; }
        .rot-meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 10.5px; }
        .rot-meta-right { text-align: right; }
        .rot-meta-label { color: #8A836E; font-size: 8.5px; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 2px; }
        .rot-meta-value { font-weight: 700; }

        .rot-block { padding: 10px 0; }
        .rot-block-eyebrow { font-weight: 700; font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 7px; }
        .rot-ledger-row { display: flex; justify-content: space-between; gap: 10px; padding: 2.5px 0; font-size: 11px; }
        .rot-ledger-subtotal { font-weight: 700; border-top: 1px solid var(--line); margin-top: 4px; padding-top: 5px; font-size: 11.5px; }
        .rot-block-credit { border-bottom: 2px dashed var(--line); }

        .rot-hero { margin: 12px 0; padding: 12px 14px; border-radius: 12px; border: 2px solid; text-align: center; }
        .rot-hero-label { font-size: 9.5px; text-transform: uppercase; letter-spacing: 0.06em; color: #75705E; font-weight: 700; }
        .rot-hero-value { font-family: 'Archivo Black', sans-serif; font-size: 26px; line-height: 1.15; margin-top: 2px; }
        @media (min-width: 640px) {
          .rot-hero-value { font-size: 30px; }
        }
        .rot-hero-sub { font-size: 10px; font-weight: 700; color: #75705E; margin-top: 2px; }

        .rot-stamp-frame { display: flex; justify-content: center; margin: 6px 0 12px; }
        .rot-stamp-svg { width: 100%; max-width: 210px; height: auto; }

        .rot-daily { padding-top: 4px; }
        .rot-daily-card { background: rgba(21,19,15,0.04); border: 1.5px solid var(--line); border-radius: 10px; padding: 10px 12px; margin-bottom: 12px; }
        .rot-daily-strong { font-weight: 700; }
        .rot-anchors { margin-bottom: 4px; }
        .rot-anchor-name { display: inline-flex; align-items: center; gap: 6px; text-transform: capitalize; }

        .rot-barcode { display: flex; align-items: center; justify-content: center; gap: 1.5px; height: 30px; opacity: 0.85; margin-top: 4px; }
        .rot-bar { background: var(--ink); height: 100%; }
        .rot-barcode-label { text-align: center; font-size: 9px; letter-spacing: 0.12em; color: #75705E; font-weight: 700; margin-top: 4px; }
        .rot-footer-motto { text-align: center; margin-top: 10px; font-weight: 700; font-size: 10.5px; }
        .rot-footer-sub { color: #75705E; font-weight: 400; margin-top: 1px; }

        .rot-poster-frame { display: flex; align-items: center; justify-content: center; padding: 14px; background: #101014; border-radius: 16px; border: 2px solid var(--ink); min-height: 320px; }
        .rot-poster-img { max-height: 420px; width: auto; object-fit: contain; border-radius: 8px; box-shadow: 0 12px 32px rgba(0,0,0,0.45); }
        .rot-poster-loading { color: #8A836E; font-size: 11px; font-family: 'Space Mono', monospace; padding: 60px 0; }

        .rot-footer { display: flex; align-items: center; gap: 8px; padding-top: 10px; border-top: 2px solid rgba(21,19,15,0.1); }
        .rot-btn { font-family: 'Space Mono', monospace; font-weight: 700; font-size: 11px; text-transform: uppercase; letter-spacing: 0.02em; border: 2.5px solid var(--ink); border-radius: 12px; padding: 10px 14px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 7px; box-shadow: 3px 3px 0 var(--ink); transition: transform .1s ease, box-shadow .1s ease; }
        .rot-btn:hover:not(:disabled) { transform: translate(-1px,-1px); box-shadow: 4px 4px 0 var(--ink); }
        .rot-btn:active:not(:disabled) { transform: translate(0,0); box-shadow: 1.5px 1.5px 0 var(--ink); }
        .rot-btn:disabled { opacity: 0.55; cursor: not-allowed; }
        .rot-btn-plain { background: rgba(21,19,15,0.06); color: var(--ink); flex-shrink: 0; }
        .rot-btn-gold { background: var(--gold); color: var(--ink); flex-shrink: 0; }
        .rot-btn-primary { flex: 1; color: var(--paper); min-width: 0; }
        .rot-btn-label { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      `}</style>

      <div className="rot-shell rot-anim-in" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="rot-header">
          <div className="rot-header-left">
            <div className="rot-header-icon" style={{ background: isSolvent ? CREDIT : DEBIT }}>
              <Receipt size={18} color={PAPER} strokeWidth={2.4} />
            </div>
            <div>
              <div className="rot-header-title-row">
                <h3 className="rot-display rot-title">Life Debt Statement</h3>
                <span className="rot-pill" style={{ background: isSolvent ? CREDIT : DEBIT, color: PAPER }}>
                  {isSolvent ? 'Solvent' : 'In debt'}
                </span>
              </div>
              <span className="rot-eyebrow">Forensic ledger of moral equity</span>
            </div>
          </div>
          <button type="button" onClick={onClose} className="rot-icon-btn" aria-label="Close">
            <X size={16} strokeWidth={2.4} />
          </button>
        </div>

        {/* Controls */}
        <div className="rot-controls">
          <div className="rot-segment">
            <div className="rot-segment-thumb" style={{ transform: statementMode === 'daily' ? 'translateX(100%)' : 'translateX(0%)' }} />
            <button type="button" className="rot-segment-btn" onClick={() => { setStatementMode('monthly'); soundEngine.playClick?.(); }} style={{ color: statementMode === 'monthly' ? PAPER : INK }}>
              Monthly ledger
            </button>
            <button type="button" className="rot-segment-btn" onClick={() => { setStatementMode('daily'); soundEngine.playClick?.(); }} style={{ color: statementMode === 'daily' ? PAPER : INK }}>
              Daily slip
            </button>
          </div>

          <div className="rot-controls-right">
            {statementMode === 'monthly' && (
              <div className="rot-month-nav">
                <button type="button" onClick={handlePrevMonth} className="rot-nav-btn" aria-label="Previous month"><ChevronLeft size={14} /></button>
                <span className="rot-month-label">{monthLabel}</span>
                <button type="button" onClick={handleNextMonth} className="rot-nav-btn" aria-label="Next month"><ChevronRight size={14} /></button>
              </div>
            )}
            <div className="rot-view-toggle">
              <button type="button" onClick={() => { setTicketViewMode('ticket'); soundEngine.playClick?.(); }} className={`rot-toggle-btn ${ticketViewMode === 'ticket' ? 'is-active' : ''}`} aria-label="Ticket view">
                <Receipt size={13} />
              </button>
              <button type="button" onClick={() => { setTicketViewMode('poster'); soundEngine.playClick?.(); }} className={`rot-toggle-btn ${ticketViewMode === 'poster' ? 'is-active' : ''}`} aria-label="Poster view">
                <ImageIcon size={13} />
              </button>
            </div>
          </div>
        </div>

        {/* Main view */}
        <div className="rot-main">
          {ticketViewMode === 'ticket' ? (
            <div className="rot-ticket-wrap">
              <svg className="rot-teeth" viewBox="0 0 440 14" preserveAspectRatio="none"><path d={TEETH_PATH} fill={PAPER} /></svg>

              <div className="rot-paper">
                <svg className="rot-grain" aria-hidden="true">
                  <filter id="rot-paper-grain"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" result="n" /><feColorMatrix in="n" type="saturate" values="0" /></filter>
                  <rect width="100%" height="100%" filter="url(#rot-paper-grain)" />
                </svg>

                <div className="rot-paper-content">
                  <div className="rot-masthead">
                    <div className="rot-display rot-masthead-title">Shit or Hit</div>
                    <div className="rot-masthead-sub">{statementMode === 'monthly' ? 'Monthly Life Debt Statement' : 'Daily Performance Audit Slip'}</div>
                    <div className="rot-masthead-meta">{statementMode === 'monthly' ? monthLabel : dateStr} &middot; Ref {transId}</div>
                  </div>

                  <div className="rot-dashed" />

                  <div className="rot-meta-grid">
                    <div>
                      <div className="rot-meta-label">Operator</div>
                      <div className="rot-meta-value">{displayName || 'Daily Operator'}</div>
                    </div>
                    <div className="rot-meta-right">
                      <div className="rot-meta-label">Audited records</div>
                      <div className="rot-meta-value">
                        {statementMode === 'monthly' ? `${monthlyLedger.loggedDaysCount} / ${monthlyLedger.daysInMonth} days` : `Day #${dayCount}`}
                      </div>
                    </div>
                  </div>

                  <div className="rot-dashed" />

                  {statementMode === 'monthly' ? (
                    <>
                      <div className="rot-block rot-block-credit">
                        <div className="rot-block-eyebrow" style={{ color: CREDIT }}>Discipline credits</div>
                        <div className="rot-ledger-row"><span>Hit days ({monthlyLedger.hitDays} @ $10)</span><span style={{ color: CREDIT }}>+${monthlyLedger.hitCredits.toFixed(2)}</span></div>
                        {monthlyLedger.peakDays > 0 && (
                          <div className="rot-ledger-row"><span>Peak bonus ({monthlyLedger.peakDays})</span><span style={{ color: CREDIT }}>+${monthlyLedger.peakDividends.toFixed(2)}</span></div>
                        )}
                        {monthlyLedger.anchorsCompleted > 0 && (
                          <div className="rot-ledger-row"><span>Anchors completed ({monthlyLedger.anchorsCompleted})</span><span style={{ color: CREDIT }}>+${monthlyLedger.habitCredits.toFixed(2)}</span></div>
                        )}
                        {monthlyLedger.consistencyBonus > 0 && (
                          <div className="rot-ledger-row"><span>70%+ consistency bonus</span><span style={{ color: CREDIT }}>+${monthlyLedger.consistencyBonus.toFixed(2)}</span></div>
                        )}
                        <div className="rot-ledger-row rot-ledger-subtotal" style={{ color: CREDIT }}><span>Subtotal assets</span><span>+${monthlyLedger.totalCredits.toFixed(2)}</span></div>
                      </div>

                      <div className="rot-block rot-block-debit">
                        <div className="rot-block-eyebrow" style={{ color: DEBIT }}>Behavioral debits</div>
                        {monthlyLedger.roughDays > 0 && (
                          <div className="rot-ledger-row"><span>Rough days ({monthlyLedger.roughDays} @ $15)</span><span style={{ color: DEBIT }}>-${monthlyLedger.roughDebits.toFixed(2)}</span></div>
                        )}
                        {monthlyLedger.downDays > 0 && (
                          <div className="rot-ledger-row"><span>Down days ({monthlyLedger.downDays} @ $10)</span><span style={{ color: DEBIT }}>-${monthlyLedger.downDebits.toFixed(2)}</span></div>
                        )}
                        {monthlyLedger.skippedHabitDebits > 0 && (
                          <div className="rot-ledger-row"><span>Skipped anchors ({monthlyLedger.anchorsSkipped})</span><span style={{ color: DEBIT }}>-${monthlyLedger.skippedHabitDebits.toFixed(2)}</span></div>
                        )}
                        {monthlyLedger.slumpPenalty > 0 && (
                          <div className="rot-ledger-row"><span>Slump penalty ({monthlyLedger.maxRoughStreak}d streak)</span><span style={{ color: DEBIT }}>-${monthlyLedger.slumpPenalty.toFixed(2)}</span></div>
                        )}
                        <div className="rot-ledger-row"><span>Friction tax</span><span style={{ color: DEBIT }}>-${monthlyLedger.baselineOverhead.toFixed(2)}</span></div>
                        <div className="rot-ledger-row rot-ledger-subtotal" style={{ color: DEBIT }}><span>Subtotal liabilities</span><span>-${monthlyLedger.totalDebits.toFixed(2)}</span></div>
                      </div>

                      <div className="rot-hero" style={{ background: isSolvent ? 'rgba(20,107,67,0.08)' : 'rgba(173,46,34,0.08)', borderColor: isSolvent ? CREDIT : DEBIT }}>
                        <div className="rot-hero-label">Net discipline balance</div>
                        <div className="rot-hero-value" style={{ color: isSolvent ? CREDIT : DEBIT }}>
                          {monthlyLedger.netBalance >= 0 ? '+' : '-'}${Math.abs(monthlyLedger.netBalance).toFixed(2)}
                        </div>
                        <div className="rot-hero-sub">{monthlyLedger.hitRate}% hit momentum</div>
                      </div>

                      <div className="rot-stamp-frame" style={{ transform: 'rotate(-3deg)' }}>
                        <StampMark color={isSolvent ? CREDIT : DEBIT} line1={isSolvent ? 'SOLVENT IN DISCIPLINE' : 'IN LIFE DEBT'} line2={isSolvent ? 'AUDIT VERIFIED' : 'REPAYMENT REQUIRED'} seed={isSolvent ? 3 : 9} />
                      </div>
                    </>
                  ) : (
                    <div className="rot-daily">
                      <div className="rot-daily-card">
                        <div className="rot-ledger-row"><span className="rot-daily-strong">Verdict rating</span><span className="rot-daily-strong">{dailyMeta.title} ({dailyRating}&#9733;)</span></div>
                        <div className="rot-ledger-row"><span>Execution status</span><span>{dailyRating >= 4 ? 'Cleared' : dailyRating === 3 ? 'Held at baseline' : 'In the trench'}</span></div>
                      </div>

                      {dailyAnchorsList.length > 0 && (
                        <div className="rot-anchors">
                          <div className="rot-block-eyebrow">Habit anchors</div>
                          {dailyAnchorsList.map(([id, done]) => (
                            <div key={id} className="rot-ledger-row">
                              <span className="rot-anchor-name">
                                {done ? <CheckCircle2 size={13} color={CREDIT} /> : <XCircle size={13} color={DEBIT} />}
                                {id.replace(/_/g, ' ')}
                              </span>
                              <span style={{ color: done ? CREDIT : DEBIT }}>{done ? 'Completed' : 'Skipped'}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="rot-hero" style={{ background: dailyRating >= 4 ? 'rgba(20,107,67,0.08)' : dailyRating === 3 ? 'rgba(21,19,15,0.05)' : 'rgba(173,46,34,0.08)', borderColor: dailyRating >= 4 ? CREDIT : dailyRating === 3 ? INK : DEBIT }}>
                        <div className="rot-hero-label">Daily performance value</div>
                        <div className="rot-hero-value" style={{ color: dailyRating >= 4 ? CREDIT : dailyRating === 3 ? INK : DEBIT }}>
                          {dailyRating >= 4 ? '+$15.00' : dailyRating === 3 ? '+$5.00' : '-$15.00'}
                        </div>
                      </div>

                      <div className="rot-stamp-frame" style={{ transform: 'rotate(-3deg)' }}>
                        <StampMark color={dailyRating >= 4 ? CREDIT : DEBIT} line1={dailyRating >= 4 ? 'OFFICIAL VERDICT: HIT' : 'OFFICIAL VERDICT: ROUGH'} line2={dailyRating >= 4 ? 'RECORDED ON CHAIN' : 'CORRECTION TOMORROW'} seed={dailyRating >= 4 ? 5 : 11} />
                      </div>
                    </div>
                  )}

                  <div className="rot-dashed" />

                  <div className="rot-barcode">
                    {BARCODE_WIDTHS.map((w, idx) => (
                      <div key={idx} className="rot-bar" style={{ width: `${w > 3 ? 3 : w > 1 ? 2 : 1}px` }} />
                    ))}
                  </div>
                  <div className="rot-barcode-label">* {transId} *</div>

                  <div className="rot-footer-motto">
                    <div>No refunds on squandered time.</div>
                    <div className="rot-footer-sub">Reload and execute tomorrow.</div>
                  </div>
                </div>
              </div>

              <svg className="rot-teeth rot-teeth-bottom" viewBox="0 0 440 14" preserveAspectRatio="none"><path d={TEETH_PATH} fill={PAPER} /></svg>
            </div>
          ) : (
            <div className="rot-poster-frame">
              {previewUrl ? (
                <img src={previewUrl} alt="Life debt statement poster" className="rot-poster-img" />
              ) : (
                <div className="rot-poster-loading">Generating 1080p statement&hellip;</div>
              )}
            </div>
          )}
          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>

        {/* Footer actions */}
        <div className="rot-footer">
          <button type="button" onClick={onClose} className="rot-btn rot-btn-plain">Close</button>
          {typeof navigator !== 'undefined' && navigator.share && (
            <button type="button" onClick={handleWebShare} disabled={sharing || !previewUrl} className="rot-btn rot-btn-gold">
              <Share2 size={15} strokeWidth={2.4} />
              <span className="rot-btn-label">{sharing ? 'Sharing\u2026' : 'Share'}</span>
            </button>
          )}
          <button type="button" onClick={handleDownload} disabled={downloading || !previewUrl} className="rot-btn rot-btn-primary" style={{ background: isSolvent ? CREDIT : DEBIT }}>
            <Download size={15} strokeWidth={2.4} />
            <span className="rot-btn-label">{downloading ? 'Printing\u2026' : 'Download 1080p PNG'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
