import React, { useRef, useEffect, useState, useCallback } from 'react';

/**
 * Blob3DCanvas (Next-Gen High-Aesthetic Edition)
 * Features:
 * - True Electric Radiant Cyan (#00FFFF) with teal/petrol depth shading (#005F73)
 * - Bioluminescent floating internal energy particles / bubbles
 * - 3D Spherical volume with neon rim lighting & specular glass curvature
 * - Dual responsive 3D eyes with expressive emotive eyebrows
 * - Cursor-reactive pupil dilation (curiosity zoom) + gaze angle calculation
 * - Fluid harmonic liquid ripples & multi-frequency jello spring wobble
 * - Anime-style double specular reflection dots & eyelid blink transitions
 */
export default function Blob3DCanvas({
  width = 440,
  height = 380,
  baseColor = '#00FFFF',      // Pure Radiant Electric Cyan
  highlightColor = '#E0FFFF', // Ultra-bright neon white-cyan specular
  shadowColor = '#005F73',    // Deep petrol-teal cyan shadow (never dull sky blue)
  glowColor = '#00FFFF',      // Radiant neon cyan corona
  accentEyeColor = '#000000',
  className = '',
  onPoke,
}) {
  const canvasRef = useRef(null);
  const stateRef = useRef({
    // Cursor coords relative to canvas
    mouseX: width / 2,
    mouseY: height / 2,
    targetMouseX: width / 2,
    targetMouseY: height / 2,
    prevMouseX: width / 2,
    prevMouseY: height / 2,
    mouseSpeed: 0,
    isHovered: false,
    isPressed: false,

    // Squish spring physics (multi-frequency jello)
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

    // Bioluminescent energy particles floating inside
    particles: Array.from({ length: 8 }, (_, i) => ({
      x: (Math.random() - 0.5) * 60,
      y: (Math.random() - 0.5) * 60,
      radius: 2 + Math.random() * 3,
      speedY: 0.4 + Math.random() * 0.6,
      wobbleFreq: 1.5 + Math.random() * 2,
      wobbleOffset: Math.random() * Math.PI * 2,
      opacity: 0.3 + Math.random() * 0.5,
    })),

    // Master timer
    t: 0,
  });

  const [pokedCount, setPokedCount] = useState(0);

  // Pointer movement listener
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

    // Impart liquid ripple when cursor moves close to center
    const centerX = width / 2;
    const centerY = height / 2;
    const angle = Math.atan2(y - centerY, x - centerX);
    s.rippleAngle = angle;
    s.rippleStrength = Math.min(1, s.rippleStrength + 0.2);
  }, [width, height]);

  const handlePointerDown = useCallback(() => {
    const s = stateRef.current;
    s.isPressed = true;
    // Violent squish + high frequency secondary jello oscillation
    s.velY -= 0.45;
    s.velX += 0.35;
    s.wobbleAmp = 0.3;
    s.wobblePhase = 0;
    s.isBlinking = true;
    s.blinkProgress = 1;

    setPokedCount((c) => c + 1);
    if (onPoke) onPoke();
  }, [onPoke]);

  const handlePointerUp = useCallback(() => {
    const s = stateRef.current;
    s.isPressed = false;
    // Release rebound
    s.velY += 0.25;
    s.velX -= 0.15;
  }, []);

  const handlePointerLeave = useCallback(() => {
    const s = stateRef.current;
    s.isHovered = false;
    s.isPressed = false;
    s.targetMouseX = width / 2;
    s.targetMouseY = height / 2;
  }, [width, height]);

  // Global window cursor tracker for seamless tracking everywhere on page
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

  // Main 60 FPS Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    // Retina DPR scaling for crisp lines
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const centerX = width / 2;
    const centerY = height / 2 + 10;
    const baseRadius = Math.min(width, height) * 0.29;

    const render = () => {
      const s = stateRef.current;
      s.t += 0.038;

      // Mouse smoothing & speed estimation
      const dMouseX = s.targetMouseX - s.mouseX;
      const dMouseY = s.targetMouseY - s.mouseY;
      s.mouseX += dMouseX * 0.14;
      s.mouseY += dMouseY * 0.14;
      s.mouseSpeed = Math.hypot(dMouseX, dMouseY);

      // Multi-harmonic Jello Spring Physics
      const targetScaleX = s.isPressed ? 1.32 : 1;
      const targetScaleY = s.isPressed ? 0.72 : 1;
      const springTension = 0.24;
      const springDamping = 0.74;

      s.velX += (targetScaleX - s.scaleX) * springTension;
      s.velX *= springDamping;
      s.scaleX += s.velX;

      s.velY += (targetScaleY - s.scaleY) * springTension;
      s.velY *= springDamping;
      s.scaleY += s.velY;

      // Secondary high-frequency wobble decay
      if (s.wobbleAmp > 0.005) {
        s.wobblePhase += 0.35;
        s.wobbleAmp *= 0.93;
      } else {
        s.wobbleAmp = 0;
      }
      const jelloWobble = Math.sin(s.wobblePhase) * s.wobbleAmp;

      // Ripple decay
      s.rippleStrength *= 0.94;

      // 3D Tilt calculation
      const tiltTargetX = (s.mouseX - centerX) / (width * 0.48);
      const tiltTargetY = (s.mouseY - centerY) / (height * 0.48);
      s.tiltX += (tiltTargetX - s.tiltX) * 0.09;
      s.tiltY += (tiltTargetY - s.tiltY) * 0.09;

      // Natural Eyelid Blinking
      const now = Date.now();
      if (now > s.nextBlinkTime && !s.isBlinking) {
        s.isBlinking = true;
        s.blinkProgress = 0;
      }
      if (s.isBlinking) {
        s.blinkProgress += 0.2;
        if (s.blinkProgress >= 1) {
          s.blinkProgress = 0;
          s.isBlinking = false;
          s.nextBlinkTime = now + 2400 + Math.random() * 3000;
        }
      }

      ctx.clearRect(0, 0, width, height);

      // --- 1. Neon Radial Corona Aura ---
      const blobOriginX = centerX + s.tiltX * 16;
      const blobOriginY = centerY + s.tiltY * 12;

      ctx.save();
      const auraGrad = ctx.createRadialGradient(
        blobOriginX,
        blobOriginY,
        baseRadius * 0.5,
        blobOriginX,
        blobOriginY,
        baseRadius * 1.6
      );
      auraGrad.addColorStop(0, 'rgba(0, 255, 255, 0.28)');
      auraGrad.addColorStop(0.5, 'rgba(0, 245, 212, 0.12)');
      auraGrad.addColorStop(1, 'rgba(0, 255, 255, 0)');
      ctx.fillStyle = auraGrad;
      ctx.beginPath();
      ctx.arc(blobOriginX, blobOriginY, baseRadius * 1.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // --- 2. Contact Ground Drop Shadow ---
      const shadowY = centerY + baseRadius * s.scaleY + 26;
      const shadowRadiusX = baseRadius * (s.scaleX + jelloWobble) * 1.1;
      const shadowRadiusY = 16 * s.scaleY;

      ctx.save();
      ctx.beginPath();
      ctx.ellipse(centerX + s.tiltX * 14, shadowY, shadowRadiusX, shadowRadiusY, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 40, 50, 0.22)';
      ctx.fill();
      ctx.restore();

      // --- 3. Compute 3D Organic Harmonic Mesh Points ---
      const numPoints = 140;
      const points = [];

      for (let i = 0; i < numPoints; i++) {
        const theta = (i / numPoints) * Math.PI * 2;

        // Fluid liquid harmonic wave superposition
        const w1 = Math.sin(theta * 3 + s.t * 1.6) * 8;
        const w2 = Math.cos(theta * 2 - s.t * 1.3) * 6;
        const w3 = Math.sin(theta * 5 + s.t * 2.4) * 3.5;
        const breath = Math.sin(s.t * 1.8) * 3.5;

        // Dynamic mouse ripple deformation
        const angleDiff = Math.cos(theta - s.rippleAngle);
        const ripple = Math.sin(theta * 8 - s.t * 6) * 6 * s.rippleStrength * Math.max(0, angleDiff);

        const currentR = baseRadius + w1 + w2 + w3 + breath + ripple;
        const effScaleX = (s.scaleX + jelloWobble);
        const effScaleY = (s.scaleY - jelloWobble);

        const px = blobOriginX + Math.cos(theta) * currentR * effScaleX;
        const py = blobOriginY + Math.sin(theta) * currentR * effScaleY;
        points.push({ x: px, y: py });
      }

      // --- 4. Outer Black Neobrutalist Stroke & Neon Edge ---
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.closePath();

      // Solid bold black Neobrutalist outline
      ctx.lineWidth = 6.5;
      ctx.strokeStyle = '#000000';
      ctx.stroke();

      // --- 5. True 3D Volume Spherical Shading (Electric Cyan) ---
      // Light angle is top-left
      const lightSourceX = blobOriginX - baseRadius * 0.38 + s.tiltX * 12;
      const lightSourceY = blobOriginY - baseRadius * 0.44 + s.tiltY * 10;

      const radialGrad = ctx.createRadialGradient(
        lightSourceX,
        lightSourceY,
        baseRadius * 0.08,
        blobOriginX,
        blobOriginY,
        baseRadius * 1.4
      );
      // Bright white-cyan highlight -> Pure radiant cyan -> Teal petrol depth
      radialGrad.addColorStop(0, highlightColor);    // Pure vibrant #E0FFFF / #FFFFFF
      radialGrad.addColorStop(0.25, '#00FFFF');       // Radiant 100% Electric Cyan
      radialGrad.addColorStop(0.55, baseColor);       // Core Body Cyan
      radialGrad.addColorStop(0.85, shadowColor);     // Deep petrol teal #005F73
      radialGrad.addColorStop(1, '#002B36');           // Dark abyssal teal edge

      ctx.fillStyle = radialGrad;
      ctx.fill();

      // Inner Neon Glow Rim / Iridescence
      ctx.lineWidth = 4;
      ctx.strokeStyle = 'rgba(0, 255, 255, 0.4)';
      ctx.stroke();

      // --- 6. Bioluminescent Internal Energy Bubbles ---
      s.particles.forEach((p) => {
        p.y -= p.speedY;
        // Wrap around inside radius
        if (p.y < -baseRadius * 0.6) {
          p.y = baseRadius * 0.6;
          p.x = (Math.random() - 0.5) * baseRadius * 0.8;
        }
        const px = blobOriginX + p.x + Math.sin(s.t * p.wobbleFreq + p.wobbleOffset) * 4;
        const py = blobOriginY + p.y;

        ctx.beginPath();
        ctx.arc(px, py, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity * 0.65})`;
        ctx.fill();
      });

      // --- 7. Glossy Curved Specular Highlights (Glass/Jelly Reflection) ---
      const specX = blobOriginX - baseRadius * 0.46 * s.scaleX;
      const specY = blobOriginY - baseRadius * 0.5 * s.scaleY;

      // Primary crescent shine
      ctx.beginPath();
      ctx.ellipse(specX, specY, baseRadius * 0.32 * s.scaleX, baseRadius * 0.16 * s.scaleY, -Math.PI / 4.8, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
      ctx.fill();

      // Secondary pinpoint glint
      ctx.beginPath();
      ctx.arc(specX - 12, specY - 8, 7, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.fill();
      ctx.restore();

      // --- 8. Dual 3D Eyes with Gaze Vector & Dynamic Pupil Dilation ---
      const eyeSpacing = 38 * s.scaleX;
      const eyeBaseY = blobOriginY - 16 * s.scaleY;
      const eyeRadiusX = 23 * s.scaleX;
      const eyeRadiusY = 26 * s.scaleY;

      const eyeOffsetX = s.tiltX * 15;
      const eyeOffsetY = s.tiltY * 11;

      // Distance from cursor to center determines pupil dilation curiosity factor
      const cursorDist = Math.hypot(s.mouseX - centerX, s.mouseY - centerY);
      const curiosityDilation = Math.max(0.85, Math.min(1.4, 1.4 - cursorDist / (width * 0.9)));

      const eyes = [
        { id: 'left', x: blobOriginX - eyeSpacing + eyeOffsetX, y: eyeBaseY + eyeOffsetY },
        { id: 'right', x: blobOriginX + eyeSpacing + eyeOffsetX, y: eyeBaseY + eyeOffsetY },
      ];

      // Draw expressive eyebrows
      eyes.forEach((eye, index) => {
        ctx.save();
        const browOffset = index === 0 ? -1 : 1;
        const browTilt = s.isPressed ? 0.35 * browOffset : (s.tiltX * 0.15 - 0.1 * browOffset);
        const browY = eye.y - eyeRadiusY - (s.isPressed ? 2 : 7);

        ctx.beginPath();
        ctx.moveTo(eye.x - 14, browY - browTilt * 8);
        ctx.quadraticCurveTo(eye.x, browY - 4, eye.x + 14, browY + browTilt * 8);
        ctx.lineWidth = 3.5;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#000000';
        ctx.stroke();
        ctx.restore();
      });

      // Draw eyeballs & pupils
      eyes.forEach((eye) => {
        ctx.save();

        // Eye Sclera (White base)
        ctx.beginPath();
        const blinkScale = s.isBlinking ? Math.max(0.06, 1 - Math.sin(s.blinkProgress * Math.PI)) : 1;
        ctx.ellipse(eye.x, eye.y, eyeRadiusX, eyeRadiusY * blinkScale, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();
        ctx.lineWidth = 3.5;
        ctx.strokeStyle = '#000000';
        ctx.stroke();

        if (blinkScale > 0.22) {
          // Gaze vector: project mouse angle & depth
          const dx = s.mouseX - eye.x;
          const dy = s.mouseY - eye.y;
          const angle = Math.atan2(dy, dx);
          const dist = Math.min(Math.hypot(dx, dy) * 0.085, eyeRadiusX * 0.58);

          const pupilX = eye.x + Math.cos(angle) * dist;
          const pupilY = eye.y + Math.sin(angle) * dist * blinkScale;
          const basePupilR = 10 * Math.min(s.scaleX, s.scaleY) * blinkScale;
          const pupilRadius = basePupilR * (s.isHovered ? curiosityDilation : 1);

          // Deep Black Glossy Pupil
          ctx.beginPath();
          ctx.arc(pupilX, pupilY, pupilRadius, 0, Math.PI * 2);
          ctx.fillStyle = accentEyeColor;
          ctx.fill();

          // Anime-style Double Specular Reflection Glints
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

      // --- 9. Expressive Mouth ---
      ctx.save();
      const mouthY = eyeBaseY + 32 * s.scaleY + eyeOffsetY;
      const mouthX = blobOriginX + eyeOffsetX;

      ctx.beginPath();
      if (s.isPressed) {
        // Shocked/delighted open 'O' on poke
        ctx.ellipse(mouthX, mouthY + 3, 8 * s.scaleX, 12 * s.scaleY, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#002B36';
        ctx.fill();
        ctx.lineWidth = 2.8;
        ctx.strokeStyle = '#000000';
        ctx.stroke();
      } else {
        // Playful smiling arc
        const smileW = (13 + Math.sin(s.t * 2) * 2) * s.scaleX;
        ctx.arc(mouthX, mouthY - 4, smileW, 0.22 * Math.PI, 0.78 * Math.PI);
        ctx.lineWidth = 3.5;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#000000';
        ctx.stroke();
      }
      ctx.restore();

      // --- 10. Neon Cyan Cheek Blush ---
      const blushY = eyeBaseY + 18 * s.scaleY + eyeOffsetY;
      const blushLeftX = blobOriginX - eyeSpacing * 1.55 + eyeOffsetX;
      const blushRightX = blobOriginX + eyeSpacing * 1.55 + eyeOffsetX;

      ctx.save();
      ctx.beginPath();
      ctx.ellipse(blushLeftX, blushY, 9 * s.scaleX, 5 * s.scaleY, -0.1, 0, Math.PI * 2);
      ctx.ellipse(blushRightX, blushY, 9 * s.scaleX, 5 * s.scaleY, 0.1, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 245, 212, 0.45)'; // Electric Aqua-cyan blush
      ctx.fill();
      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationFrameId);
  }, [width, height, baseColor, highlightColor, shadowColor, glowColor, accentEyeColor]);

  return (
    <div className={`relative flex flex-col items-center select-none ${className}`}>
      <canvas
        ref={canvasRef}
        style={{ width: `${width}px`, height: `${height}px` }}
        onPointerMove={handlePointerMove}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        className="cursor-pointer touch-none filter drop-shadow-[4px_4px_0px_#000000] active:scale-95 transition-transform duration-75"
        title="Interactive 3D Electric Cyan Void Blob - Click to poke!"
      />

      {/* Floating Neobrutalist Tracking Pill */}
      <div className="mt-3 flex items-center gap-2 px-3 py-1.5 bg-[#FFFDF5] border-2 border-black rounded-full shadow-[2px_2px_0px_#000000] text-xs font-mono font-bold text-neutral-800">
        <span className="w-2.5 h-2.5 rounded-full bg-[#00FFFF] animate-pulse border border-black" />
        <span>Gaze: {stateRef.current.isHovered ? 'Active Vector Tracking' : 'Idle Scanning'}</span>
        {pokedCount > 0 && (
          <span className="ml-1 px-1.5 py-0.5 bg-[#00FFFF] text-black font-black border border-black rounded-md text-[10px]">
            {pokedCount} {pokedCount === 1 ? 'Poke' : 'Pokes'}!
          </span>
        )}
      </div>
    </div>
  );
}
