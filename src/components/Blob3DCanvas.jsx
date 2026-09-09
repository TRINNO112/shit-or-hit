import React, { useRef, useEffect, useState, useCallback } from 'react';

/**
 * Blob3DCanvas (Harmonious Multi-Theme Edition, v2)
 * - Dynamically adapts aura, 3D volume shading, inner rim, and cheek blush to the chosen theme,
 *   now with a smooth animated color cross-fade when the theme changes instead of a hard cut.
 * - Gentle, tactile squeeze physics with a touch of spring overshoot for a jellier bounce.
 * - Bioluminescent floating internal energy particles matching theme palette, plus a short-lived
 *   particle burst on poke.
 * - Conic-gradient rim light that tracks the light source / cursor tilt for a wet-glass look.
 * - Smoothed (quadratic-curve) silhouette instead of a straight-segment polygon.
 * - Mood system: expression (mouth + eyebrows) escalates with how many times it's been poked.
 * - Idle/drowsy state: after a stretch of no interaction the blob's eyes droop and it yawns.
 * - Tiny synthesized "boop" on poke (Web Audio, no assets), pitch rising slightly with pokes.
 * - Keyboard accessible: focusable, Enter/Space pokes it, screen-reader label included.
 */

// ---------- color helpers (support "#rrggbb" and "rgb(a)(...)" strings) ----------
function parseColor(str) {
  if (!str) return { r: 0, g: 0, b: 0, a: 1 };
  if (str[0] === '#') {
    const hex = str.slice(1);
    const full = hex.length === 3 ? hex.split('').map((c) => c + c).join('') : hex;
    const bigint = parseInt(full, 16);
    return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255, a: 1 };
  }
  const m = str.match(/rgba?\(([^)]+)\)/);
  if (m) {
    const parts = m[1].split(',').map((s) => parseFloat(s.trim()));
    return { r: parts[0] || 0, g: parts[1] || 0, b: parts[2] || 0, a: parts.length > 3 ? parts[3] : 1 };
  }
  return { r: 0, g: 0, b: 0, a: 1 };
}
function lerpColor(a, b, t) {
  return {
    r: a.r + (b.r - a.r) * t,
    g: a.g + (b.g - a.g) * t,
    b: a.b + (b.b - a.b) * t,
    a: a.a + (b.a - a.a) * t,
  };
}
function toRgba(c, overrideAlpha) {
  return `rgba(${Math.round(c.r)}, ${Math.round(c.g)}, ${Math.round(c.b)}, ${
    overrideAlpha !== undefined ? overrideAlpha : c.a
  })`;
}
function clamp01(v) {
  return Math.max(0, Math.min(1, v));
}
function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

// ---------- mood system (escalates with poke count) ----------
const MOOD_PARAMS = {
  neutral: { start: 0.22, end: 0.78, smileWMult: 1, browBias: 0, asymmetric: false, invert: false },
  amused: { start: 0.15, end: 0.85, smileWMult: 1.15, browBias: 0.05, asymmetric: false, invert: false },
  skeptical: { start: 0.26, end: 0.7, smileWMult: 0.8, browBias: 0, asymmetric: true, invert: false },
  annoyed: { start: 0.22, end: 0.78, smileWMult: 0.85, browBias: -0.12, asymmetric: false, invert: true },
  delighted: { start: 0.08, end: 0.92, smileWMult: 1.3, browBias: 0.12, asymmetric: false, invert: false },
};
function getMood(pokeCount) {
  if (pokeCount >= 7) return 'delighted';
  if (pokeCount >= 5) return 'annoyed';
  if (pokeCount >= 3) return 'skeptical';
  if (pokeCount >= 1) return 'amused';
  return 'neutral';
}

// ---------- tiny synthesized poke sound (no audio assets needed) ----------
function playBoop(audioCtxRef, pitchMultiplier) {
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    if (!audioCtxRef.current) audioCtxRef.current = new AC();
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    const baseFreq = 220 * pitchMultiplier;
    osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.55, ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.16, ctx.currentTime + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.22);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.25);
  } catch (e) {
    // Audio unavailable (autoplay policy, unsupported browser, etc.) — fail silently.
  }
}

function spawnBurst(s, count = 12) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 1.3 + Math.random() * 2.3;
    s.bursts.push({
      x: 0,
      y: 0,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
      decay: 0.018 + Math.random() * 0.02,
      radius: 1.4 + Math.random() * 2,
    });
  }
}

const THEME_KEYS = ['baseColor', 'highlightColor', 'shadowColor', 'deepShadowColor', 'glowColor', 'blushColor'];

export default function Blob3DCanvas({
  width = 440,
  height = 380,
  baseColor = '#00FFFF',
  highlightColor = '#E0FFFF',
  shadowColor = '#008B8B',
  deepShadowColor = '#003B46',
  glowColor = 'rgba(0, 255, 255, 0.28)',
  blushColor = 'rgba(0, 255, 255, 0.45)',
  accentEyeColor = '#000000',
  className = '',
  onPoke,
}) {
  const canvasRef = useRef(null);
  const audioCtxRef = useRef(null);
  const themePropsRef = useRef({ baseColor, highlightColor, shadowColor, deepShadowColor, glowColor, blushColor });

  // Lazily-initialized, mutated-in-place theme transition state (from -> to, cross-faded over time).
  const themeRef = useRef(null);
  if (themeRef.current === null) {
    const initial = {
      baseColor: parseColor(baseColor),
      highlightColor: parseColor(highlightColor),
      shadowColor: parseColor(shadowColor),
      deepShadowColor: parseColor(deepShadowColor || shadowColor),
      glowColor: parseColor(glowColor),
      blushColor: parseColor(blushColor),
    };
    themeRef.current = { from: initial, to: initial, current: initial, start: 0, duration: 450 };
  }

  const stateRef = useRef({
    // Cursor coords relative to canvas
    mouseX: width / 2,
    mouseY: height / 2,
    targetMouseX: width / 2,
    targetMouseY: height / 2,
    mouseSpeed: 0,
    isHovered: false,
    isPressed: false,

    // Tactile squish physics (tuned for a touch of jelly overshoot)
    scaleX: 1,
    scaleY: 1,
    velX: 0,
    velY: 0,
    wobblePhase: 0,
    wobbleAmp: 0,

    // Dynamic surface ripples
    rippleAngle: 0,
    rippleStrength: 0,

    // Blink timer & state
    blinkProgress: 0,
    isBlinking: false,
    nextBlinkTime: Date.now() + 2600,

    // 3D Tilt & rotation
    tiltX: 0,
    tiltY: 0,

    // Mood + interaction memory
    pokeCount: 0,
    mood: 'neutral',
    lastInteraction: Date.now(),
    drowsiness: 0,

    // Floating internal ambient particles
    particles: Array.from({ length: 8 }, () => ({
      x: (Math.random() - 0.5) * 60,
      y: (Math.random() - 0.5) * 60,
      radius: 2 + Math.random() * 2.5,
      speedY: 0.35 + Math.random() * 0.5,
      wobbleFreq: 1.5 + Math.random() * 2,
      wobbleOffset: Math.random() * Math.PI * 2,
      opacity: 0.25 + Math.random() * 0.45,
    })),

    // Short-lived poke / delight burst particles
    bursts: [],

    // Master timer
    t: 0,
  });

  const [pokedCount, setPokedCount] = useState(0);

  // Pointer move handler
  const handlePointerMove = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const s = stateRef.current;
    s.targetMouseX = x;
    s.targetMouseY = y;
    s.isHovered = true;
    s.lastInteraction = Date.now();

    const centerX = width / 2;
    const centerY = height / 2;
    const angle = Math.atan2(y - centerY, x - centerX);
    s.rippleAngle = angle;
    s.rippleStrength = Math.min(0.6, s.rippleStrength + 0.12);
  }, [width, height]);

  // Tactile poke handler — squeeze impulse, mood escalation, burst, and a synthesized boop.
  const handlePointerDown = useCallback(() => {
    const s = stateRef.current;
    s.isPressed = true;
    s.lastInteraction = Date.now();

    s.velY -= 0.13;
    s.velX += 0.09;
    s.wobbleAmp = 0.1;
    s.wobblePhase = 0;
    s.isBlinking = true;
    s.blinkProgress = 0.8;

    s.pokeCount += 1;
    s.mood = getMood(s.pokeCount);
    spawnBurst(s);
    playBoop(audioCtxRef, 1 + Math.min(s.pokeCount, 10) * 0.045);

    setPokedCount((c) => c + 1);
    if (onPoke) onPoke();
  }, [onPoke]);

  const handlePointerUp = useCallback(() => {
    const s = stateRef.current;
    s.isPressed = false;
    s.velY += 0.09;
    s.velX -= 0.06;
    s.wobbleAmp = Math.max(s.wobbleAmp, 0.05);
  }, []);

  const handlePointerLeave = useCallback(() => {
    const s = stateRef.current;
    s.isHovered = false;
    s.isPressed = false;
    s.targetMouseX = width / 2;
    s.targetMouseY = height / 2;
  }, [width, height]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
      e.preventDefault();
      handlePointerDown();
      window.setTimeout(() => handlePointerUp(), 90);
    }
  }, [handlePointerDown, handlePointerUp]);

  // Global window cursor tracker for gaze
  useEffect(() => {
    const handleGlobalPointer = (e) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      stateRef.current.targetMouseX = e.clientX - rect.left;
      stateRef.current.targetMouseY = e.clientY - rect.top;
    };
    window.addEventListener('pointermove', handleGlobalPointer, { passive: true });
    return () => window.removeEventListener('pointermove', handleGlobalPointer);
  }, []);

  // Smoothly cross-fade theme colors whenever the theme props change (instead of a hard cut).
  useEffect(() => {
    const prev = themePropsRef.current;
    const changed = THEME_KEYS.some((k) => {
      const val = { baseColor, highlightColor, shadowColor, deepShadowColor, glowColor, blushColor }[k];
      return prev[k] !== val;
    });
    themePropsRef.current = { baseColor, highlightColor, shadowColor, deepShadowColor, glowColor, blushColor };
    if (!changed) return;

    const target = {
      baseColor: parseColor(baseColor),
      highlightColor: parseColor(highlightColor),
      shadowColor: parseColor(shadowColor),
      deepShadowColor: parseColor(deepShadowColor || shadowColor),
      glowColor: parseColor(glowColor),
      blushColor: parseColor(blushColor),
    };
    const ts = themeRef.current;
    ts.from = ts.current;
    ts.to = target;
    ts.start = performance.now();
  }, [baseColor, highlightColor, shadowColor, deepShadowColor, glowColor, blushColor]);

  // Main 60 FPS Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const centerX = width / 2;
    const centerY = height / 2 + 10;
    const baseRadius = Math.min(width, height) * 0.29;
    const supportsConicGradient = typeof ctx.createConicGradient === 'function';

    const render = () => {
      const s = stateRef.current;

      // Idle / drowsy ramp — the blob gets sleepy after ~9s of no interaction.
      const now = Date.now();
      const idleFor = now - s.lastInteraction;
      const drowsyTarget = idleFor > 9000 ? clamp01((idleFor - 9000) / 5000) : 0;
      s.drowsiness += (drowsyTarget - s.drowsiness) * 0.02;

      s.t += 0.038 * (1 - s.drowsiness * 0.35);

      // Mouse smoothing
      const dMouseX = s.targetMouseX - s.mouseX;
      const dMouseY = s.targetMouseY - s.mouseY;
      s.mouseX += dMouseX * 0.14;
      s.mouseY += dMouseY * 0.14;
      s.mouseSpeed = Math.hypot(dMouseX, dMouseY);

      // Spring physics with a touch of overshoot for a jellier bounce
      const targetScaleX = s.isPressed ? 1.08 : 1;
      const targetScaleY = s.isPressed ? 0.92 : 1;
      const springTension = 0.3;
      const springDamping = 0.74;

      s.velX += (targetScaleX - s.scaleX) * springTension;
      s.velX *= springDamping;
      s.scaleX += s.velX;

      s.velY += (targetScaleY - s.scaleY) * springTension;
      s.velY *= springDamping;
      s.scaleY += s.velY;

      if (s.wobbleAmp > 0.003) {
        s.wobblePhase += 0.32;
        s.wobbleAmp *= 0.92;
      } else {
        s.wobbleAmp = 0;
      }
      const jelloWobble = Math.sin(s.wobblePhase) * s.wobbleAmp;

      s.rippleStrength *= 0.94;

      const tiltTargetX = (s.mouseX - centerX) / (width * 0.48);
      const tiltTargetY = (s.mouseY - centerY) / (height * 0.48);
      s.tiltX += (tiltTargetX - s.tiltX) * 0.09;
      s.tiltY += (tiltTargetY - s.tiltY) * 0.09;

      // Natural eyelid blinking
      if (now > s.nextBlinkTime && !s.isBlinking) {
        s.isBlinking = true;
        s.blinkProgress = 0;
      }
      if (s.isBlinking) {
        s.blinkProgress += 0.2;
        if (s.blinkProgress >= 1) {
          s.blinkProgress = 0;
          s.isBlinking = false;
          s.nextBlinkTime = now + 2500 + Math.random() * 3200;
        }
      }

      // Resolve the current cross-faded theme colors for this frame.
      const ts = themeRef.current;
      const elapsed = performance.now() - ts.start;
      const tt = ts.start === 0 ? 1 : clamp01(elapsed / ts.duration);
      const te = easeOutCubic(tt);
      const colors = {};
      for (const k of THEME_KEYS) colors[k] = lerpColor(ts.from[k], ts.to[k], te);
      ts.current = colors;

      // Occasional idle sparkle when delighted
      if (s.mood === 'delighted' && Math.random() < 0.02) spawnBurst(s, 1);

      ctx.clearRect(0, 0, width, height);

      const blobOriginX = centerX + s.tiltX * 14;
      const blobOriginY = centerY + s.tiltY * 11 + s.drowsiness * 3;

      // --- 1. Dynamic Matching Radial Corona Aura (breathing gently) ---
      ctx.save();
      const auraPulse = 1 + Math.sin(s.t * 0.9) * 0.04;
      const auraGrad = ctx.createRadialGradient(
        blobOriginX, blobOriginY, baseRadius * 0.4,
        blobOriginX, blobOriginY, baseRadius * 1.55 * auraPulse
      );
      auraGrad.addColorStop(0, toRgba(colors.glowColor));
      auraGrad.addColorStop(0.6, toRgba(colors.glowColor, 0.08));
      auraGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = auraGrad;
      ctx.beginPath();
      ctx.arc(blobOriginX, blobOriginY, baseRadius * 1.55 * auraPulse, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // --- 2. Neutral Dark Ground Drop Shadow ---
      const shadowY = centerY + baseRadius * s.scaleY + 26;
      const shadowRadiusX = baseRadius * (s.scaleX + jelloWobble) * 1.08;
      const shadowRadiusY = 15 * s.scaleY;

      ctx.save();
      ctx.beginPath();
      ctx.ellipse(centerX + s.tiltX * 12, shadowY, shadowRadiusX, shadowRadiusY, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.16)';
      ctx.fill();
      ctx.restore();

      // --- 3. Compute 3D Organic Harmonic Mesh Points ---
      const numPoints = 140;
      const points = [];
      for (let i = 0; i < numPoints; i++) {
        const theta = (i / numPoints) * Math.PI * 2;
        const w1 = Math.sin(theta * 3 + s.t * 1.5) * 7.5;
        const w2 = Math.cos(theta * 2 - s.t * 1.2) * 5.5;
        const w3 = Math.sin(theta * 5 + s.t * 2.2) * 3;
        const breath = Math.sin(s.t * 1.7) * 3;

        const angleDiff = Math.cos(theta - s.rippleAngle);
        const ripple = Math.sin(theta * 8 - s.t * 6) * 4 * s.rippleStrength * Math.max(0, angleDiff);

        const currentR = baseRadius + w1 + w2 + w3 + breath + ripple;
        const effScaleX = s.scaleX + jelloWobble;
        const effScaleY = s.scaleY - jelloWobble;

        const px = blobOriginX + Math.cos(theta) * currentR * effScaleX;
        const py = blobOriginY + Math.sin(theta) * currentR * effScaleY;
        points.push({ x: px, y: py });
      }

      // --- 4. Smoothed liquid silhouette (quadratic curves through midpoints) ---
      ctx.save();
      ctx.beginPath();
      const n = points.length;
      const startMid = { x: (points[n - 1].x + points[0].x) / 2, y: (points[n - 1].y + points[0].y) / 2 };
      ctx.moveTo(startMid.x, startMid.y);
      for (let i = 0; i < n; i++) {
        const cur = points[i];
        const next = points[(i + 1) % n];
        const mid = { x: (cur.x + next.x) / 2, y: (cur.y + next.y) / 2 };
        ctx.quadraticCurveTo(cur.x, cur.y, mid.x, mid.y);
      }
      ctx.closePath();

      ctx.lineWidth = 6.5;
      ctx.strokeStyle = '#000000';
      ctx.stroke();

      // --- 5. True 3D Volume Spherical Shading (harmonized, cross-faded theme) ---
      const lightSourceX = blobOriginX - baseRadius * 0.38 + s.tiltX * 10;
      const lightSourceY = blobOriginY - baseRadius * 0.44 + s.tiltY * 8;

      const radialGrad = ctx.createRadialGradient(
        lightSourceX, lightSourceY, baseRadius * 0.06,
        blobOriginX, blobOriginY, baseRadius * 1.35
      );
      radialGrad.addColorStop(0, toRgba(colors.highlightColor));
      radialGrad.addColorStop(0.35, toRgba(colors.baseColor));
      radialGrad.addColorStop(0.72, toRgba(colors.shadowColor));
      radialGrad.addColorStop(1, toRgba(colors.deepShadowColor));

      ctx.fillStyle = radialGrad;
      ctx.fill();

      // Harmonized inner rim glow
      ctx.lineWidth = 3.5;
      ctx.strokeStyle = toRgba(colors.glowColor, 0.35);
      ctx.stroke();

      // --- 5b. Conic rim light — a bright edge that tracks the light/tilt direction ---
      if (supportsConicGradient) {
        const lightAngle = Math.atan2(lightSourceY - blobOriginY, lightSourceX - blobOriginX);
        const rimGrad = ctx.createConicGradient(lightAngle, blobOriginX, blobOriginY);
        const hi = toRgba(colors.highlightColor, 0.85);
        const lo = toRgba(colors.highlightColor, 0);
        rimGrad.addColorStop(0, hi);
        rimGrad.addColorStop(0.12, lo);
        rimGrad.addColorStop(0.88, lo);
        rimGrad.addColorStop(1, hi);
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = rimGrad;
        ctx.stroke();
        ctx.restore();
      }

      // --- 6. Floating internal energy particles (ambient) ---
      s.particles.forEach((p) => {
        p.y -= p.speedY;
        if (p.y < -baseRadius * 0.6) {
          p.y = baseRadius * 0.6;
          p.x = (Math.random() - 0.5) * baseRadius * 0.8;
        }
        const px = blobOriginX + p.x + Math.sin(s.t * p.wobbleFreq + p.wobbleOffset) * 4;
        const py = blobOriginY + p.y;

        ctx.beginPath();
        ctx.arc(px, py, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity * 0.6})`;
        ctx.fill();
      });

      // --- 6b. Short-lived poke / delight burst particles ---
      s.bursts = s.bursts.filter((b) => b.life > 0);
      s.bursts.forEach((b) => {
        b.x += b.vx;
        b.y += b.vy;
        b.vx *= 0.94;
        b.vy *= 0.94;
        b.life -= b.decay;
        const px = blobOriginX + b.x;
        const py = blobOriginY + b.y;
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.beginPath();
        ctx.arc(px, py, b.radius, 0, Math.PI * 2);
        ctx.fillStyle = toRgba(colors.highlightColor, Math.max(0, b.life));
        ctx.fill();
        ctx.restore();
      });

      // --- 7. Glossy Curved Specular Highlights ---
      const specX = blobOriginX - baseRadius * 0.44 * s.scaleX;
      const specY = blobOriginY - baseRadius * 0.48 * s.scaleY;

      ctx.beginPath();
      ctx.ellipse(specX, specY, baseRadius * 0.3 * s.scaleX, baseRadius * 0.15 * s.scaleY, -Math.PI / 4.8, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(specX - 10, specY - 7, 6.5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.fill();
      ctx.restore();

      // --- 8. Dual 3D Eyes with Gaze Vector & Curiosity Dilation ---
      const droopMult = 1 - s.drowsiness * 0.55;
      const eyeSpacing = 38 * s.scaleX;
      const eyeBaseY = blobOriginY - 16 * s.scaleY;
      const eyeRadiusX = 23 * s.scaleX;
      const eyeRadiusY = 26 * s.scaleY * droopMult;

      const eyeOffsetX = s.tiltX * 14;
      const eyeOffsetY = s.tiltY * 10;

      const cursorDist = Math.hypot(s.mouseX - centerX, s.mouseY - centerY);
      const curiosityDilation = Math.max(0.9, Math.min(1.3, 1.3 - cursorDist / (width * 0.9)));

      const eyes = [
        { id: 'left', x: blobOriginX - eyeSpacing + eyeOffsetX, y: eyeBaseY + eyeOffsetY },
        { id: 'right', x: blobOriginX + eyeSpacing + eyeOffsetX, y: eyeBaseY + eyeOffsetY },
      ];

      const mood = MOOD_PARAMS[s.mood] || MOOD_PARAMS.neutral;

      // Expressive eyebrows (mood-aware, droop when drowsy)
      eyes.forEach((eye, index) => {
        ctx.save();
        const browOffset = index === 0 ? -1 : 1;
        let browTilt = s.isPressed
          ? 0.25 * browOffset
          : s.tiltX * 0.14 - 0.08 * browOffset + mood.browBias * browOffset;
        if (mood.asymmetric && index === 1) browTilt += 0.22;
        const browY = eye.y - eyeRadiusY - (s.isPressed ? 3 : 7) + s.drowsiness * 6;

        ctx.beginPath();
        ctx.moveTo(eye.x - 14, browY - browTilt * 7);
        ctx.quadraticCurveTo(eye.x, browY - 4, eye.x + 14, browY + browTilt * 7);
        ctx.lineWidth = 3.5;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#000000';
        ctx.stroke();
        ctx.restore();
      });

      // Eyeballs & pupils
      eyes.forEach((eye) => {
        ctx.save();
        ctx.beginPath();
        const blinkScale = s.isBlinking ? Math.max(0.06, 1 - Math.sin(s.blinkProgress * Math.PI)) : 1;
        ctx.ellipse(eye.x, eye.y, eyeRadiusX, eyeRadiusY * blinkScale, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();
        ctx.lineWidth = 3.5;
        ctx.strokeStyle = '#000000';
        ctx.stroke();

        if (blinkScale > 0.22) {
          const dx = s.mouseX - eye.x;
          const dy = s.mouseY - eye.y;
          const angle = Math.atan2(dy, dx);
          const dist = Math.min(Math.hypot(dx, dy) * 0.085, eyeRadiusX * 0.58);

          const pupilX = eye.x + Math.cos(angle) * dist;
          const pupilY = eye.y + Math.sin(angle) * dist * blinkScale;
          const basePupilR = 10 * Math.min(s.scaleX, s.scaleY) * blinkScale;
          const pupilRadius = basePupilR * (s.isHovered ? curiosityDilation : 1);

          ctx.beginPath();
          ctx.arc(pupilX, pupilY, pupilRadius, 0, Math.PI * 2);
          ctx.fillStyle = accentEyeColor;
          ctx.fill();

          ctx.beginPath();
          ctx.arc(pupilX - 4, pupilY - 4, 3.8 * blinkScale, 0, Math.PI * 2);
          ctx.fillStyle = '#FFFFFF';
          ctx.fill();

          ctx.beginPath();
          ctx.arc(pupilX + 3.8, pupilY + 3.8, 2 * blinkScale, 0, Math.PI * 2);
          ctx.fillStyle = '#FFFFFF';
          ctx.fill();
        }
        ctx.restore();
      });

      // --- 9. Expressive Mouth (pressed > yawning > mood) ---
      ctx.save();
      const mouthY = eyeBaseY + 32 * s.scaleY + eyeOffsetY;
      const mouthX = blobOriginX + eyeOffsetX;
      const yawnPulse = Math.max(0, Math.sin(s.t * 0.15)) * s.drowsiness;

      ctx.beginPath();
      if (s.isPressed) {
        ctx.ellipse(mouthX, mouthY + 2, 7 * s.scaleX, 9 * s.scaleY, 0, 0, Math.PI * 2);
        ctx.fillStyle = toRgba(colors.deepShadowColor);
        ctx.fill();
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = '#000000';
        ctx.stroke();
      } else if (yawnPulse > 0.6) {
        const yawnR = 5 + (yawnPulse - 0.6) * 20;
        ctx.ellipse(mouthX, mouthY + 2, yawnR * 0.6, yawnR, 0, 0, Math.PI * 2);
        ctx.fillStyle = toRgba(colors.deepShadowColor);
        ctx.fill();
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = '#000000';
        ctx.stroke();
      } else if (mood.invert) {
        const smileW = (11 + Math.sin(s.t * 2) * 1.2) * s.scaleX * mood.smileWMult;
        ctx.arc(mouthX, mouthY + 7, smileW, Math.PI * 1.2, Math.PI * 1.8);
        ctx.lineWidth = 3.5;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#000000';
        ctx.stroke();
      } else {
        const smileW = (13 + Math.sin(s.t * 2) * 1.5) * s.scaleX * mood.smileWMult;
        ctx.arc(mouthX, mouthY - 4, smileW, mood.start * Math.PI, mood.end * Math.PI);
        ctx.lineWidth = 3.5;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#000000';
        ctx.stroke();
      }
      ctx.restore();

      // --- 10. Harmonized Cheek Blush ---
      const blushY = eyeBaseY + 18 * s.scaleY + eyeOffsetY;
      const blushLeftX = blobOriginX - eyeSpacing * 1.55 + eyeOffsetX;
      const blushRightX = blobOriginX + eyeSpacing * 1.55 + eyeOffsetX;

      ctx.save();
      ctx.beginPath();
      ctx.ellipse(blushLeftX, blushY, 9 * s.scaleX, 5 * s.scaleY, -0.1, 0, Math.PI * 2);
      ctx.ellipse(blushRightX, blushY, 9 * s.scaleX, 5 * s.scaleY, 0.1, 0, Math.PI * 2);
      ctx.fillStyle = toRgba(colors.blushColor);
      ctx.fill();
      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationFrameId);
  }, [width, height, accentEyeColor]);

  return (
    <div className={`relative flex flex-col items-center select-none ${className}`}>
      <canvas
        ref={canvasRef}
        role="button"
        tabIndex={0}
        aria-label="Interactive jelly blob mascot. Press Enter or Space to poke it."
        style={{ width: `${width}px`, height: `${height}px` }}
        onPointerMove={handlePointerMove}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        onKeyDown={handleKeyDown}
        className="cursor-pointer touch-none filter drop-shadow-[4px_4px_0px_#000000] active:scale-98 transition-transform duration-75 focus:outline-none focus-visible:ring-4 focus-visible:ring-black/40 rounded-full"
        title="Interactive 3D Void Blob - Click to poke gently!"
      />

      <div className="mt-3 flex items-center gap-2 px-3 py-1.5 bg-[#FFFDF5] border-2 border-black rounded-full shadow-[2px_2px_0px_#000000] text-xs font-mono font-bold text-neutral-800">
        <span
          className="w-2.5 h-2.5 rounded-full animate-pulse border border-black"
          style={{ backgroundColor: baseColor }}
        />
        <span>Gaze: {stateRef.current.isHovered ? 'Active Vector Tracking' : 'Idle Scanning'}</span>
        {pokedCount > 0 && (
          <span
            className="ml-1 px-1.5 py-0.5 text-black font-black border border-black rounded-md text-[10px]"
            style={{ backgroundColor: baseColor }}
          >
            {pokedCount} {pokedCount === 1 ? 'Poke' : 'Pokes'}!
          </span>
        )}
      </div>
    </div>
  );
}
