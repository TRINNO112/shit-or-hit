import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Bell, BellOff, X, Check } from 'lucide-react';

// ---- design tokens -------------------------------------------------------
const COLORS = {
  bg: '#0A0B10',
  panel: '#14161F',
  panelBorder: '#242635',
  track: '#242737',
  textPrimary: '#F3EFE6',
  textMuted: '#82869B',
  amber: '#FFB454',
  amberSoft: 'rgba(255,180,84,0.16)',
  amberGlow: 'rgba(255,180,84,0.55)',
  cyan: '#57E2C9',
  cyanSoft: 'rgba(87,226,201,0.16)',
  cyanGlow: 'rgba(87,226,201,0.5)',
  alert: '#FF8A5B',
  alertGlow: 'rgba(255,138,91,0.55)',
};

// ---- geometry -------------------------------------------------------------
const SIZE = 400;
const CENTER = 200;
const R_TRACK = 130;
const STROKE = 16;
const CIRC = 2 * Math.PI * R_TRACK;

// ---- audio ------------------------------------------------------------
function useBeeper() {
  const ctxRef = useRef(null);
  const ensure = useCallback(() => {
    if (!ctxRef.current && typeof window !== 'undefined') {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) ctxRef.current = new AC();
    }
    if (ctxRef.current && ctxRef.current.state === 'suspended') ctxRef.current.resume();
    return ctxRef.current;
  }, []);
  const beep = useCallback((times = 3, freq = 880) => {
    const ctx = ensure();
    if (!ctx) return;
    let t = ctx.currentTime;
    for (let i = 0; i < times; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.28, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.28);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.3);
      t += 0.38;
    }
  }, [ensure]);
  return { ensure, beep };
}

// ---- helpers ----------------------------------------------------------
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

function formatRingsIn(now, hour24, minute) {
  const target = new Date(now);
  target.setHours(hour24, minute, 0, 0);
  if (target <= now) target.setDate(target.getDate() + 1);
  const diffMin = Math.round((target - now) / 60000);
  const h = Math.floor(diffMin / 60);
  const m = diffMin % 60;
  if (h > 0) return `rings in ${h}h ${m}m`;
  if (m > 0) return `rings in ${m}m`;
  return 'rings in under a minute';
}

// ---- main component -----------------------------------------------------
export default function RadialClockPicker({
  isOpen,
  onClose,
  initialTime = '21:00',
  onSave
}) {
  const [mode, setMode] = useState('alarm'); // 'timer' | 'alarm'
  const { ensure, beep } = useBeeper();

  // live clock, ticks every second regardless of mode
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // ---------------- timer state ----------------
  const [durationMin, setDurationMin] = useState(10);
  const [remainingSec, setRemainingSec] = useState(10 * 60);
  const [phase, setPhase] = useState('idle'); // idle | running | paused | finished
  const totalSecRef = useRef(10 * 60);

  useEffect(() => {
    if (phase !== 'running') return;
    const id = setInterval(() => {
      setRemainingSec((prev) => {
        if (prev <= 1) {
          clearInterval(id);
          setPhase('finished');
          beep(4, 740);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [phase, beep]);

  const setDuration = (min) => {
    setDurationMin(min);
    setRemainingSec(min * 60);
  };

  const handleStartPause = () => {
    ensure();
    if (phase === 'running') {
      setPhase('paused');
    } else if (phase === 'idle' || phase === 'paused') {
      totalSecRef.current = phase === 'idle' ? durationMin * 60 : totalSecRef.current;
      setPhase('running');
    } else if (phase === 'finished') {
      setPhase('idle');
      setRemainingSec(durationMin * 60);
    }
  };

  const handleReset = () => {
    setPhase('idle');
    setRemainingSec(durationMin * 60);
    totalSecRef.current = durationMin * 60;
  };

  // ---------------- alarm state ----------------
  const parseInitialAlarm = () => {
    const [h, m] = (initialTime || '21:00').split(':').map(Number);
    const pm = h >= 12;
    const h12 = h % 12;
    return {
      raw: h12 * 60 + (m || 0),
      pm
    };
  };

  const [alarmMinutesRaw, setAlarmMinutesRaw] = useState(() => parseInitialAlarm().raw); // 0..719, 12h dial, snapped to 5
  const [isPM, setIsPM] = useState(() => parseInitialAlarm().pm);
  const [alarmOn, setAlarmOn] = useState(true);
  const [ringing, setRinging] = useState(false);
  const ringIntervalRef = useRef(null);

  const hourPart = Math.floor(alarmMinutesRaw / 60); // 0..11
  const alarmMinute = alarmMinutesRaw % 60;
  const displayHour = hourPart === 0 ? 12 : hourPart;
  const hour24 = (hourPart % 12) + (isPM ? 12 : 0);

  const triggerRing = useCallback(() => {
    setRinging(true);
    beep(2, 660);
    ringIntervalRef.current = setInterval(() => beep(2, 660), 2000);
  }, [beep]);

  const dismissRing = useCallback(() => {
    setRinging(false);
    if (ringIntervalRef.current) {
      clearInterval(ringIntervalRef.current);
      ringIntervalRef.current = null;
    }
  }, []);

  useEffect(() => () => {
    if (ringIntervalRef.current) clearInterval(ringIntervalRef.current);
  }, []);

  useEffect(() => {
    if (!alarmOn || ringing) return;
    if (now.getSeconds() === 0 && now.getHours() === hour24 && now.getMinutes() === alarmMinute) {
      triggerRing();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [now]);

  const toggleAlarmOn = () => {
    ensure();
    if (ringing) dismissRing();
    setAlarmOn((v) => !v);
  };

  // ---------------- dial drag handling ----------------
  const svgRef = useRef(null);
  const draggingRef = useRef(false);

  const applyAngle = useCallback((deg) => {
    if (mode === 'timer') {
      let val = Math.round(deg / 6);
      if (val === 0) val = 60;
      setDuration(val);
    } else {
      let raw = Math.round((deg / 360) * 720 / 5) * 5;
      raw = raw % 720;
      setAlarmMinutesRaw(raw);
    }
  }, [mode]);

  const dialLocked =
    (mode === 'timer' && phase !== 'idle') || (mode === 'alarm' && ringing);

  const handleMove = useCallback((e) => {
    if (!draggingRef.current || !svgRef.current) return;
    const p = e.touches ? e.touches[0] : e;
    applyAngle(angleFromClientPoint(svgRef.current, p.clientX, p.clientY));
  }, [applyAngle]);

  const handleUp = useCallback(() => {
    draggingRef.current = false;
    window.removeEventListener('pointermove', handleMove);
    window.removeEventListener('pointerup', handleUp);
  }, [handleMove]);

  const handleDown = (e) => {
    if (dialLocked || !svgRef.current) return;
    draggingRef.current = true;
    const p = e.touches ? e.touches[0] : e;
    applyAngle(angleFromClientPoint(svgRef.current, p.clientX, p.clientY));
    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
  };

  useEffect(() => () => {
    window.removeEventListener('pointermove', handleMove);
    window.removeEventListener('pointerup', handleUp);
  }, [handleMove, handleUp]);

  // ---------------- derived visual values ----------------
  const accent = mode === 'timer' ? COLORS.amber : COLORS.cyan;
  const accentSoft = mode === 'timer' ? COLORS.amberSoft : COLORS.cyanSoft;
  const accentGlow = mode === 'timer' ? COLORS.amberGlow : COLORS.cyanGlow;

  const alerting = (mode === 'timer' && phase === 'finished') || (mode === 'alarm' && ringing);
  const dialColor = alerting ? COLORS.alert : accent;
  const dialGlow = alerting ? COLORS.alertGlow : accentGlow;

  let fraction;
  if (mode === 'timer') {
    fraction = phase === 'running' || phase === 'paused'
      ? remainingSec / (totalSecRef.current || 1)
      : durationMin / 60;
  } else {
    fraction = alarmMinutesRaw / 720;
  }
  fraction = Math.max(0, Math.min(1, fraction));
  const dashOffset = CIRC * (1 - fraction);
  const handlePt = pointOnCircle(R_TRACK, fraction * 360);

  const active = (mode === 'timer' && phase === 'running') || (mode === 'alarm' && (alarmOn || ringing));

  // tick marks
  const ticks = Array.from({ length: 12 }, (_, i) => {
    const deg = i * 30;
    const major = mode === 'alarm' ? true : i % 3 === 0;
    const inner = pointOnCircle(148, deg);
    const outer = pointOnCircle(major ? 168 : 158, deg);
    const label = pointOnCircle(186, deg);
    const labelText = mode === 'timer' ? String(i * 5) : String(i === 0 ? 12 : i);
    return { deg, major, inner, outer, label, labelText, i };
  });

  const timerLabel =
    phase === 'finished'
      ? "time's up"
      : phase === 'running'
      ? 'counting down'
      : phase === 'paused'
      ? 'paused'
      : 'drag dial to set minutes';

  if (!isOpen) return null;

  const handleSaveSelectedTime = () => {
    const formatted = `${String(hour24).padStart(2, '0')}:${String(alarmMinute).padStart(2, '0')}`;
    if (onSave) onSave(formatted);
    if (onClose) onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 overflow-y-auto"
        onClick={onClose}
      >
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&family=Space+Mono:wght@400;700&display=swap');
          @keyframes rc-pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.45; } }
          @keyframes rc-blink { 0%,100% { opacity: 1; } 50% { opacity: 0.2; } }
          .rc-pulse { animation: rc-pulse 1.3s ease-in-out infinite; }
          .rc-blink { animation: rc-blink 1s steps(1) infinite; }
          .rc-mono { font-family: 'Space Mono', monospace; }
          .rc-btn { transition: transform .12s ease, background .2s ease, border-color .2s ease; }
          .rc-btn:active { transform: scale(0.94); }
        `}</style>

        <motion.div
          initial={{ scale: 0.92, y: 15 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.92, y: 15 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            width: '100%',
            maxWidth: 400,
            background: `linear-gradient(180deg, #171922, ${COLORS.panel})`,
            border: `2px solid ${COLORS.panelBorder}`,
            borderRadius: 28,
            padding: '24px 24px 26px',
            boxShadow: '0 30px 60px -20px rgba(0,0,0,0.8)',
            fontFamily: "'Space Grotesk', sans-serif",
            color: COLORS.textPrimary
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <span style={{
              fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase',
              color: COLORS.textMuted, fontWeight: 700,
            }}>
              LATE&nbsp;NIGHT&nbsp;DIAL
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span className="rc-mono" style={{ fontSize: 12, color: COLORS.textMuted }}>
                {pad(now.getHours() % 12 === 0 ? 12 : now.getHours() % 12)}:{pad(now.getMinutes())}:{pad(now.getSeconds())}
                <span style={{ marginLeft: 4 }}>{now.getHours() >= 12 ? 'pm' : 'am'}</span>
              </span>
              <button
                type="button"
                onClick={onClose}
                className="rc-btn"
                style={{
                  background: COLORS.track,
                  border: `1px solid ${COLORS.panelBorder}`,
                  borderRadius: 10,
                  padding: 4,
                  cursor: 'pointer',
                  color: COLORS.textMuted,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Mode Toggle */}
          <div style={{
            display: 'flex', background: COLORS.track, borderRadius: 14, padding: 4, marginBottom: 18,
          }}>
            {['timer', 'alarm'].map((m) => (
              <button
                key={m}
                type="button"
                className="rc-btn"
                onClick={() => setMode(m)}
                style={{
                  flex: 1, border: 'none', cursor: 'pointer', padding: '9px 0',
                  borderRadius: 10, fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: 13, fontWeight: 600, letterSpacing: '0.03em',
                  textTransform: 'uppercase',
                  background: mode === m ? (m === 'timer' ? COLORS.amberSoft : COLORS.cyanSoft) : 'transparent',
                  color: mode === m ? (m === 'timer' ? COLORS.amber : COLORS.cyan) : COLORS.textMuted,
                }}
              >
                {m}
              </button>
            ))}
          </div>

          {/* Dial View */}
          <div style={{ position: 'relative', width: '100%', touchAction: 'none' }}>
            <svg
              ref={svgRef}
              viewBox={`0 0 ${SIZE} ${SIZE}`}
              style={{ width: '100%', display: 'block', cursor: dialLocked ? 'default' : 'grab' }}
            >
              <defs>
                <radialGradient id="rcGlow" cx="50%" cy="50%" r="65%">
                  <stop offset="0%" stopColor={dialColor} stopOpacity="0.14" />
                  <stop offset="100%" stopColor={dialColor} stopOpacity="0" />
                </radialGradient>
                <filter id="rcBlur" x="-60%" y="-60%" width="220%" height="220%">
                  <feGaussianBlur stdDeviation="7" result="b" />
                  <feMerge>
                    <feMergeNode in="b" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              <circle cx={CENTER} cy={CENTER} r={190} fill="url(#rcGlow)" />

              {/* Ticks */}
              {ticks.map((t) => (
                <g key={t.i}>
                  <line
                    x1={t.inner.x} y1={t.inner.y} x2={t.outer.x} y2={t.outer.y}
                    stroke={t.major ? COLORS.textMuted : COLORS.panelBorder}
                    strokeWidth={t.major ? 2 : 1.5}
                    strokeLinecap="round"
                  />
                  {t.major && (
                    <text
                      x={t.label.x} y={t.label.y}
                      textAnchor="middle" dominantBaseline="middle"
                      className="rc-mono"
                      fontSize="13"
                      fill={COLORS.textMuted}
                    >
                      {t.labelText}
                    </text>
                  )}
                </g>
              ))}

              {/* Track */}
              <circle
                cx={CENTER} cy={CENTER} r={R_TRACK} fill="none"
                stroke={COLORS.track} strokeWidth={STROKE}
              />

              {/* Progress */}
              <circle
                cx={CENTER} cy={CENTER} r={R_TRACK} fill="none"
                stroke={dialColor} strokeWidth={STROKE} strokeLinecap="round"
                strokeDasharray={CIRC} strokeDashoffset={dashOffset}
                transform={`rotate(-90 ${CENTER} ${CENTER})`}
                filter={active || alerting ? 'url(#rcBlur)' : undefined}
                className={alerting ? 'rc-pulse' : undefined}
                style={{ transition: draggingRef.current ? 'none' : 'stroke-dashoffset 0.25s ease' }}
              />

              {/* Invisible wide hit-ring for dragging */}
              <circle
                cx={CENTER} cy={CENTER} r={R_TRACK} fill="none"
                stroke="transparent" strokeWidth={70}
                onPointerDown={handleDown}
                style={{ cursor: dialLocked ? 'default' : 'grab', pointerEvents: dialLocked ? 'none' : 'stroke' }}
              />

              {/* Handle */}
              <circle
                cx={handlePt.x} cy={handlePt.y} r={13}
                fill={COLORS.panel} stroke={dialColor} strokeWidth={4}
                filter={active || alerting ? 'url(#rcBlur)' : undefined}
                className={alerting ? 'rc-pulse' : undefined}
                style={{ pointerEvents: 'none' }}
              />
            </svg>

            {/* Center Readout */}
            <div style={{
              position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', pointerEvents: 'none',
            }}>
              {mode === 'timer' ? (
                <>
                  <div className="rc-mono" style={{ fontSize: 46, fontWeight: 700, color: COLORS.textPrimary, letterSpacing: '0.02em' }}>
                    {pad(Math.floor(remainingSec / 60))}:{pad(remainingSec % 60)}
                  </div>
                  <div style={{
                    marginTop: 6, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase',
                    color: phase === 'finished' ? COLORS.alert : COLORS.textMuted,
                  }} className={phase === 'finished' ? 'rc-blink' : undefined}>
                    {timerLabel}
                  </div>
                </>
              ) : (
                <>
                  <div className="rc-mono" style={{ fontSize: 40, fontWeight: 700, color: COLORS.textPrimary, letterSpacing: '0.02em' }}>
                    {displayHour}:{pad(alarmMinute)}
                    <span style={{ fontSize: 16, marginLeft: 6, color: COLORS.textMuted }}>{isPM ? 'PM' : 'AM'}</span>
                  </div>
                  <div style={{
                    marginTop: 6, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase',
                    color: ringing ? COLORS.alert : COLORS.textMuted,
                  }} className={ringing ? 'rc-blink' : undefined}>
                    {ringing ? 'wake up' : alarmOn ? formatRingsIn(now, hour24, alarmMinute) : 'alarm off'}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Controls */}
          {mode === 'timer' ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18, marginTop: 20 }}>
              <button
                type="button"
                className="rc-btn"
                onClick={handleReset}
                aria-label="Reset timer"
                style={{
                  width: 46, height: 46, borderRadius: '50%', border: `1px solid ${COLORS.panelBorder}`,
                  background: COLORS.track, color: COLORS.textMuted, display: 'flex',
                  alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                }}
              >
                <RotateCcw size={18} />
              </button>
              <button
                type="button"
                className="rc-btn"
                onClick={handleStartPause}
                aria-label={phase === 'running' ? 'Pause timer' : 'Start timer'}
                style={{
                  width: 64, height: 64, borderRadius: '50%', border: 'none', cursor: 'pointer',
                  background: alerting ? COLORS.alert : COLORS.amber,
                  color: '#1A1300', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: `0 0 24px ${alerting ? COLORS.alertGlow : COLORS.amberGlow}`,
                }}
              >
                {phase === 'running'
                  ? <Pause size={24} fill="#1A1300" />
                  : <Play size={24} fill="#1A1300" style={{ marginLeft: 3 }} />}
              </button>
              <div style={{ width: 46 }} />
            </div>
          ) : (
            <div style={{ marginTop: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 14 }}>
                {['AM', 'PM'].map((p) => (
                  <button
                    key={p}
                    type="button"
                    className="rc-btn"
                    onClick={() => setIsPM(p === 'PM')}
                    disabled={ringing}
                    style={{
                      padding: '7px 18px', borderRadius: 10, cursor: ringing ? 'default' : 'pointer',
                      fontFamily: "'Space Mono', monospace", fontSize: 12, letterSpacing: '0.05em',
                      border: `1.5px solid ${(p === 'PM') === isPM ? COLORS.cyan : COLORS.panelBorder}`,
                      background: (p === 'PM') === isPM ? COLORS.cyanSoft : 'transparent',
                      color: (p === 'PM') === isPM ? COLORS.cyan : COLORS.textMuted,
                      fontWeight: 700
                    }}
                  >
                    {p}
                  </button>
                ))}
              </div>

              {ringing ? (
                <button
                  type="button"
                  className="rc-btn rc-pulse"
                  onClick={dismissRing}
                  style={{
                    width: '100%', padding: '12px 0', borderRadius: 14, border: 'none', cursor: 'pointer',
                    background: COLORS.alert, color: '#2A0F00', fontWeight: 700, fontSize: 14,
                    letterSpacing: '0.04em', textTransform: 'uppercase',
                    boxShadow: `0 0 24px ${COLORS.alertGlow}`,
                  }}
                >
                  DISMISS
                </button>
              ) : (
                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    type="button"
                    className="rc-btn"
                    onClick={toggleAlarmOn}
                    style={{
                      flex: 1, padding: '12px 0', borderRadius: 14, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      border: `1px solid ${alarmOn ? COLORS.cyan : COLORS.panelBorder}`,
                      background: alarmOn ? COLORS.cyanSoft : COLORS.track,
                      color: alarmOn ? COLORS.cyan : COLORS.textMuted,
                      fontWeight: 600, fontSize: 13,
                    }}
                  >
                    {alarmOn ? <Bell size={15} /> : <BellOff size={15} />}
                    {alarmOn ? 'ALARM ON' : 'ALARM OFF'}
                  </button>

                  <button
                    type="button"
                    className="rc-btn"
                    onClick={handleSaveSelectedTime}
                    style={{
                      flex: 1.2, padding: '12px 0', borderRadius: 14, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                      border: 'none',
                      background: COLORS.cyan,
                      color: '#0A0B10',
                      fontWeight: 800, fontSize: 13,
                      boxShadow: `0 0 20px ${COLORS.cyanGlow}`
                    }}
                  >
                    <Check size={16} strokeWidth={3} />
                    SET REMINDER
                  </button>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
