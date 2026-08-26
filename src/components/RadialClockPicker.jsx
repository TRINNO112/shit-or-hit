import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, X, Check, Plus, Minus } from 'lucide-react';

// ---- Streetwear Design Tokens -------------------------------------------
const THEME = {
  bg: '#FFFDF5',
  card: '#FFFFFF',
  border: '#000000',
  track: '#E2E8F0',
  yellow: '#FDC800',
  emerald: '#00E599',
  black: '#000000',
  muted: '#64748B'
};

// ---- Geometry Configuration ---------------------------------------------
const SIZE = 320;
const CENTER = 160;
const R_TRACK = 100;
const STROKE = 12;
const CIRC = 2 * Math.PI * R_TRACK;

const pad = (n) => String(n).padStart(2, '0');

function pointOnCircle(radius, angleDeg) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: CENTER + radius * Math.cos(rad),
    y: CENTER + radius * Math.sin(rad),
  };
}

function angleFromClientPoint(svgEl, clientX, clientY) {
  const rect = svgEl.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  let deg = (Math.atan2(clientY - cy, clientX - cx) * 180) / Math.PI + 90;
  if (deg < 0) deg += 360;
  return deg;
}

export default function RadialClockPicker({
  isOpen,
  onClose,
  initialTime = '21:00',
  onSave
}) {
  // Parse initial 24h time into 12h + AM/PM
  const parseTime = (timeStr) => {
    const [h, m] = (timeStr || '21:00').split(':').map(Number);
    const pm = h >= 12;
    const hour12 = h % 12 === 0 ? 12 : h % 12;
    return {
      hour: hour12,
      minute: m || 0,
      isPM: pm
    };
  };

  const initialParsed = parseTime(initialTime);
  const [hour, setHour] = useState(initialParsed.hour);
  const [minute, setMinute] = useState(initialParsed.minute);
  const [isPM, setIsPM] = useState(initialParsed.isPM);
  const [activeUnit, setActiveUnit] = useState('hour'); // 'hour' | 'minute'
  const autoSwitchTimerRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      const p = parseTime(initialTime);
      setHour(p.hour);
      setMinute(p.minute);
      setIsPM(p.isPM);
      setActiveUnit('hour');
    }
  }, [isOpen, initialTime]);

  // ---------------- Dial Drag Math ----------------
  const svgRef = useRef(null);
  const draggingRef = useRef(false);

  const applyAngle = useCallback((deg) => {
    if (activeUnit === 'hour') {
      let hVal = Math.round(deg / 30);
      if (hVal === 0) hVal = 12;
      setHour(hVal);
    } else {
      // Exact continuous 60 minutes: 1 minute = 6 degrees
      let mVal = Math.round(deg / 6);
      if (mVal >= 60) mVal = 0;
      setMinute(mVal);
    }
  }, [activeUnit]);

  const handleMove = useCallback((e) => {
    if (!draggingRef.current || !svgRef.current) return;
    const p = e.touches ? e.touches[0] : e;
    applyAngle(angleFromClientPoint(svgRef.current, p.clientX, p.clientY));
  }, [applyAngle]);

  const handleUp = useCallback(() => {
    if (draggingRef.current && activeUnit === 'hour') {
      // Auto-teleport to minutes section after selecting hour
      if (autoSwitchTimerRef.current) clearTimeout(autoSwitchTimerRef.current);
      autoSwitchTimerRef.current = setTimeout(() => {
        setActiveUnit('minute');
      }, 320);
    }
    draggingRef.current = false;
    window.removeEventListener('pointermove', handleMove);
    window.removeEventListener('pointerup', handleUp);
  }, [activeUnit, handleMove]);

  const handleDown = (e) => {
    if (!svgRef.current) return;
    draggingRef.current = true;
    const p = e.touches ? e.touches[0] : e;
    applyAngle(angleFromClientPoint(svgRef.current, p.clientX, p.clientY));
    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
  };

  useEffect(() => () => {
    window.removeEventListener('pointermove', handleMove);
    window.removeEventListener('pointerup', handleUp);
    if (autoSwitchTimerRef.current) clearTimeout(autoSwitchTimerRef.current);
  }, [handleMove, handleUp]);

  // Fine-tune minute adjustments (+1, -1)
  const adjustMinute = (delta) => {
    setMinute((prev) => {
      let next = prev + delta;
      if (next < 0) next = 59;
      if (next >= 60) next = 0;
      return next;
    });
  };

  // ---------------- Visual Math ----------------
  let fraction;
  if (activeUnit === 'hour') {
    fraction = (hour % 12) / 12;
  } else {
    fraction = minute / 60;
  }
  const dashOffset = CIRC * (1 - fraction);
  const handlePt = pointOnCircle(R_TRACK, fraction * 360);

  // 12 Outer Number Labels
  const ticks = Array.from({ length: 12 }, (_, i) => {
    const deg = i * 30;
    const inner = pointOnCircle(116, deg);
    const outer = pointOnCircle(124, deg);
    const label = pointOnCircle(139, deg);
    const labelText = activeUnit === 'hour'
      ? String(i === 0 ? 12 : i)
      : pad(i * 5 === 60 ? 0 : i * 5);
    return { deg, inner, outer, label, labelText, i };
  });

  const handleConfirm = () => {
    let finalHour24 = hour;
    if (isPM && finalHour24 < 12) finalHour24 += 12;
    if (!isPM && finalHour24 === 12) finalHour24 = 0;

    const formatted = `${pad(finalHour24)}:${pad(minute)}`;
    if (onSave) onSave(formatted);
    if (onClose) onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.94, y: 12 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.94, y: 12 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-[340px] bg-[#FFFDF5] rounded-3xl border-3 border-black p-4 sm:p-3.5 shadow-[6px_6px_0px_#000000] space-y-3 text-center select-none my-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b-2 border-black/10 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#FDC800] border-2 border-black flex items-center justify-center shadow-[1px_1px_0px_#000000]">
                <Clock className="w-4 h-4 text-black stroke-[2.5]" />
              </div>
              <div className="text-left">
                <h3 className="font-display font-black text-sm sm:text-base uppercase leading-none text-black">
                  Set Reminder
                </h3>
                <span className="text-[10px] font-mono text-neutral-500">
                  {activeUnit === 'hour' ? '1. Pick Hour' : '2. Pick Exact Minute'}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white hover:bg-neutral-200 border-2 border-black cursor-pointer shadow-[1px_1px_0px_#000000] active:scale-95 transition-all"
            >
              <X className="w-4 h-4 text-black stroke-[2.5]" />
            </button>
          </div>

          {/* Digital Time Readout + Unit Switcher */}
          <div className="bg-white border-2 border-black p-2 rounded-2xl shadow-[2px_2px_0px_#000000] flex items-center justify-between gap-1.5">

            {/* Hours Box */}
            <button
              type="button"
              onClick={() => setActiveUnit('hour')}
              className={`flex-1 py-1 rounded-xl font-display font-black text-xl transition-all cursor-pointer ${activeUnit === 'hour'
                ? 'bg-[#FDC800] text-black border-2 border-black shadow-[1.5px_1.5px_0px_#000000] scale-[1.02]'
                : 'bg-neutral-100 text-neutral-600 hover:text-black border border-black/10'
                }`}
            >
              {pad(hour)}
            </button>

            <span className="font-display font-black text-xl text-black">:</span>

            {/* Minutes Box with Stepper Controls for Precise 10:47 / 10:38 */}
            <div className="flex-1 flex items-center gap-1">
              <button
                type="button"
                onClick={() => adjustMinute(-1)}
                className="w-6 h-7 bg-neutral-100 hover:bg-neutral-200 border border-black rounded-lg font-mono text-xs font-black flex items-center justify-center cursor-pointer active:scale-90"
                title="Subtract 1 minute"
              >
                <Minus className="w-3 h-3" />
              </button>

              <button
                type="button"
                onClick={() => setActiveUnit('minute')}
                className={`flex-1 py-1 rounded-xl font-display font-black text-xl transition-all cursor-pointer ${activeUnit === 'minute'
                  ? 'bg-[#00E599] text-black border-2 border-black shadow-[1.5px_1.5px_0px_#000000] scale-[1.02]'
                  : 'bg-neutral-100 text-neutral-600 hover:text-black border border-black/10'
                  }`}
              >
                {pad(minute)}
              </button>

              <button
                type="button"
                onClick={() => adjustMinute(1)}
                className="w-6 h-7 bg-neutral-100 hover:bg-neutral-200 border border-black rounded-lg font-mono text-xs font-black flex items-center justify-center cursor-pointer active:scale-90"
                title="Add 1 minute"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>

            {/* AM / PM Toggle */}
            <div className="flex flex-col gap-1 shrink-0 ml-1">
              <button
                type="button"
                onClick={() => setIsPM(false)}
                className={`px-2 py-0.5 rounded-lg font-mono text-[11px] font-black cursor-pointer transition-all border ${!isPM
                  ? 'bg-black text-[#FDC800] border-black shadow-[1px_1px_0px_#000000]'
                  : 'bg-neutral-100 text-neutral-500 border-black/20 hover:bg-neutral-200'
                  }`}
              >
                AM
              </button>
              <button
                type="button"
                onClick={() => setIsPM(true)}
                className={`px-2 py-0.5 rounded-lg font-mono text-[11px] font-black cursor-pointer transition-all border ${isPM
                  ? 'bg-black text-[#FDC800] border-black shadow-[1px_1px_0px_#000000]'
                  : 'bg-neutral-100 text-neutral-500 border-black/20 hover:bg-neutral-200'
                  }`}
              >
                PM
              </button>
            </div>
          </div>

          {/* SVG Radial Drag Dial (Compact & Precise) */}
          <div className="relative w-full max-w-[245px] mx-auto touch-none select-none py-1">
            <svg
              ref={svgRef}
              viewBox={`0 0 ${SIZE} ${SIZE}`}
              className="w-full block cursor-grab active:cursor-grabbing"
              onPointerDown={handleDown}
            >
              {/* Background Dial Base */}
              <circle
                cx={CENTER}
                cy={CENTER}
                r={150}
                fill="#FFFFFF"
                stroke="#000000"
                strokeWidth={2.5}
              />

              {/* Number Ticks & Labels */}
              {ticks.map((t) => (
                <g key={t.i}>
                  <line
                    x1={t.inner.x}
                    y1={t.inner.y}
                    x2={t.outer.x}
                    y2={t.outer.y}
                    stroke="#000000"
                    strokeWidth={1.75}
                    strokeLinecap="round"
                  />
                  <text
                    x={t.label.x}
                    y={t.label.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="font-mono font-black"
                    fontSize="13"
                    fill="#111111"
                  >
                    {t.labelText}
                  </text>
                </g>
              ))}

              {/* Inactive Track Ring */}
              <circle
                cx={CENTER}
                cy={CENTER}
                r={R_TRACK}
                fill="none"
                stroke={THEME.track}
                strokeWidth={STROKE}
              />

              {/* Active Progress Arc */}
              <circle
                cx={CENTER}
                cy={CENTER}
                r={R_TRACK}
                fill="none"
                stroke={activeUnit === 'hour' ? THEME.yellow : THEME.emerald}
                strokeWidth={STROKE}
                strokeLinecap="round"
                strokeDasharray={CIRC}
                strokeDashoffset={dashOffset}
                transform={`rotate(-90 ${CENTER} ${CENTER})`}
                style={{ transition: draggingRef.current ? 'none' : 'stroke-dashoffset 0.15s ease' }}
              />

              {/* Wide Invisible Hit-Area for Touch/Pointer Drag */}
              <circle
                cx={CENTER}
                cy={CENTER}
                r={R_TRACK}
                fill="none"
                stroke="transparent"
                strokeWidth={55}
                style={{ cursor: 'grab' }}
              />

              {/* Center Pivot Hub */}
              <circle
                cx={CENTER}
                cy={CENTER}
                r={9}
                fill="#000000"
              />

              {/* Rotating Pointer Handle */}
              <circle
                cx={handlePt.x}
                cy={handlePt.y}
                r={13}
                fill="#FFFFFF"
                stroke="#000000"
                strokeWidth={3}
                style={{ pointerEvents: 'none' }}
              />
              <circle
                cx={handlePt.x}
                cy={handlePt.y}
                r={5.5}
                fill={activeUnit === 'hour' ? THEME.yellow : THEME.emerald}
                style={{ pointerEvents: 'none' }}
              />
            </svg>

            {/* Dial Center Helper Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="px-2 py-0.5 rounded-full bg-neutral-100 border border-black/20 font-mono text-[9px] font-black uppercase text-neutral-700">
                {activeUnit === 'hour' ? 'DRAG HOUR' : 'DRAG MINUTE'}
              </span>
            </div>
          </div>

          {/* 4 Quick Presets */}
          <div className="grid grid-cols-4 gap-1.5 pt-0.5">
            {[
              { label: '8:00 PM', h: 8, m: 0, pm: true },
              { label: '9:00 PM', h: 9, m: 0, pm: true },
              { label: '10:00 PM', h: 10, m: 0, pm: true },
              { label: '11:00 PM', h: 11, m: 0, pm: true }
            ].map(item => (
              <button
                key={item.label}
                type="button"
                onClick={() => {
                  setHour(item.h);
                  setMinute(item.m);
                  setIsPM(item.pm);
                }}
                className={`py-1 rounded-xl border border-black font-mono text-[10px] font-black cursor-pointer transition-all ${hour === item.h && minute === item.m && isPM === item.pm
                  ? 'bg-[#FDC800] text-black border-2 border-black shadow-[1px_1px_0px_#000000]'
                  : 'bg-white hover:bg-neutral-100 text-neutral-700'
                  }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Action Footer */}
          <div className="flex items-center gap-2 pt-2 border-t-2 border-black/10">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-3.5 bg-neutral-100 hover:bg-neutral-200 text-black font-mono text-xs font-black rounded-xl border-2 border-black shadow-[1.5px_1.5px_0px_#000000] cursor-pointer"
            >
              CANCEL
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="flex-1 py-2.5 bg-[#00E599] hover:bg-emerald-400 text-black font-display font-black text-xs uppercase rounded-xl border-3 border-black shadow-[2px_2px_0px_#000000] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>SET TIME</span>
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
