import React, { useRef, useEffect, useState, useCallback } from 'react';

/**
 * Blob3DCanvas (Harmonious Multi-Theme Edition)
 * - Dynamically adapts aura, 3D volume shading, inner rim, and cheek blush to the chosen theme
 *   (resolves unwanted color bleeding when switching from Cyan to Coral/Violet/Gold/Emerald).
 * - Gentle, tactile squeeze physics (subtle 7% deformation instead of flattening pancake squash).
 * - Bioluminescent floating internal energy particles matching theme palette.
 * - 3D dual eyes with cursor-vector gaze tracking, expressive eyebrows, and dynamic pupil dilation.
 */
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
  const stateRef = useRef({
    // Cursor coords relative to canvas
    mouseX: width / 2,
    mouseY: height / 2,
    targetMouseX: width / 2,
    targetMouseY: height / 2,
    mouseSpeed: 0,
    isHovered: false,
    isPressed: false,

    // Subtle tactile squish physics
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

    // Floating internal particles
    particles: Array.from({ length: 8 }, () => ({
      x: (Math.random() - 0.5) * 60,
      y: (Math.random() - 0.5) * 60,
      radius: 2 + Math.random() * 2.5,
      speedY: 0.35 + Math.random() * 0.5,
      wobbleFreq: 1.5 + Math.random() * 2,
      wobbleOffset: Math.random() * Math.PI * 2,
      opacity: 0.25 + Math.random() * 0.45,
    })),

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

    // Gentle liquid ripple
    const centerX = width / 2;
    const centerY = height / 2;
    const angle = Math.atan2(y - centerY, x - centerX);
    s.rippleAngle = angle;
    s.rippleStrength = Math.min(0.6, s.rippleStrength + 0.12);
  }, [width, height]);

  // Gentle, tactile poke handler (no extreme squeezing)
  const handlePointerDown = useCallback(() => {
    const s = stateRef.current;
    s.isPressed = true;
    
    // Gentle tactile impulse: subtle 8% squeeze and soft bounce
    s.velY -= 0.12;
    s.velX += 0.08;
    s.wobbleAmp = 0.09;
    s.wobblePhase = 0;
    s.isBlinking = true;
    s.blinkProgress = 0.8;

    setPokedCount((c) => c + 1);
    if (onPoke) onPoke();
  }, [onPoke]);

  const handlePointerUp = useCallback(() => {
    const s = stateRef.current;
    s.isPressed = false;
    // Gentle rebound
    s.velY += 0.08;
    s.velX -= 0.05;
  }, []);

  const handlePointerLeave = useCallback(() => {
    const s = stateRef.current;
    s.isHovered = false;
    s.isPressed = false;
    s.targetMouseX = width / 2;
    s.targetMouseY = height / 2;
  }, [width, height]);

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

  // Main 60 FPS Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    // Retina DPR scaling for crisp edges
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

      // Mouse smoothing
      const dMouseX = s.targetMouseX - s.mouseX;
      const dMouseY = s.targetMouseY - s.mouseY;
      s.mouseX += dMouseX * 0.14;
      s.mouseY += dMouseY * 0.14;
      s.mouseSpeed = Math.hypot(dMouseX, dMouseY);

      // Subtle, refined spring physics (no extreme squish)
      const targetScaleX = s.isPressed ? 1.07 : 1;
      const targetScaleY = s.isPressed ? 0.93 : 1;
      const springTension = 0.26;
      const springDamping = 0.76;

      s.velX += (targetScaleX - s.scaleX) * springTension;
      s.velX *= springDamping;
      s.scaleX += s.velX;

      s.velY += (targetScaleY - s.scaleY) * springTension;
      s.velY *= springDamping;
      s.scaleY += s.velY;

      // Subtle secondary jello wobble decay
      if (s.wobbleAmp > 0.003) {
        s.wobblePhase += 0.32;
        s.wobbleAmp *= 0.92;
      } else {
        s.wobbleAmp = 0;
      }
      const jelloWobble = Math.sin(s.wobblePhase) * s.wobbleAmp;

      // Ripple decay
      s.rippleStrength *= 0.94;

      // 3D Tilt based on cursor position
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
          s.nextBlinkTime = now + 2500 + Math.random() * 3200;
        }
      }

      ctx.clearRect(0, 0, width, height);

      const blobOriginX = centerX + s.tiltX * 14;
      const blobOriginY = centerY + s.tiltY * 11;

      // --- 1. Dynamic Matching Radial Corona Aura ---
      ctx.save();
      const auraGrad = ctx.createRadialGradient(
        blobOriginX,
        blobOriginY,
        baseRadius * 0.4,
        blobOriginX,
        blobOriginY,
        baseRadius * 1.55
      );
      auraGrad.addColorStop(0, glowColor);
      auraGrad.addColorStop(0.6, glowColor.replace(/[\d\.]+\)$/, '0.08)'));
      auraGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = auraGrad;
      ctx.beginPath();
      ctx.arc(blobOriginX, blobOriginY, baseRadius * 1.55, 0, Math.PI * 2);
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

        // Smooth liquid harmonic superposition
        const w1 = Math.sin(theta * 3 + s.t * 1.5) * 7.5;
        const w2 = Math.cos(theta * 2 - s.t * 1.2) * 5.5;
        const w3 = Math.sin(theta * 5 + s.t * 2.2) * 3;
        const breath = Math.sin(s.t * 1.7) * 3;

        // Subtle cursor ripple
        const angleDiff = Math.cos(theta - s.rippleAngle);
        const ripple = Math.sin(theta * 8 - s.t * 6) * 4 * s.rippleStrength * Math.max(0, angleDiff);

        const currentR = baseRadius + w1 + w2 + w3 + breath + ripple;
        const effScaleX = (s.scaleX + jelloWobble);
        const effScaleY = (s.scaleY - jelloWobble);

        const px = blobOriginX + Math.cos(theta) * currentR * effScaleX;
        const py = blobOriginY + Math.sin(theta) * currentR * effScaleY;
        points.push({ x: px, y: py });
      }

      // --- 4. Outer Black Neobrutalist Stroke ---
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.closePath();

      ctx.lineWidth = 6.5;
      ctx.strokeStyle = '#000000';
      ctx.stroke();

      // --- 5. True 3D Volume Spherical Shading (Harmonized to Chosen Theme) ---
      const lightSourceX = blobOriginX - baseRadius * 0.38 + s.tiltX * 10;
      const lightSourceY = blobOriginY - baseRadius * 0.44 + s.tiltY * 8;

      const radialGrad = ctx.createRadialGradient(
        lightSourceX,
        lightSourceY,
        baseRadius * 0.06,
        blobOriginX,
        blobOriginY,
        baseRadius * 1.35
      );
      // Clean harmonic gradient using only theme parameters (no foreign color contamination)
      radialGrad.addColorStop(0, highlightColor);
      radialGrad.addColorStop(0.35, baseColor);
      radialGrad.addColorStop(0.72, shadowColor);
      radialGrad.addColorStop(1, deepShadowColor || shadowColor);

      ctx.fillStyle = radialGrad;
      ctx.fill();

      // Harmonized Inner Rim Glow
      ctx.lineWidth = 3.5;
      ctx.strokeStyle = glowColor.replace(/[\d\.]+\)$/, '0.35)');
      ctx.stroke();

      // --- 6. Floating Internal Energy Particles (Harmonized Color) ---
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
      const eyeSpacing = 38 * s.scaleX;
      const eyeBaseY = blobOriginY - 16 * s.scaleY;
      const eyeRadiusX = 23 * s.scaleX;
      const eyeRadiusY = 26 * s.scaleY;

      const eyeOffsetX = s.tiltX * 14;
      const eyeOffsetY = s.tiltY * 10;

      const cursorDist = Math.hypot(s.mouseX - centerX, s.mouseY - centerY);
      const curiosityDilation = Math.max(0.9, Math.min(1.3, 1.3 - cursorDist / (width * 0.9)));

      const eyes = [
        { id: 'left', x: blobOriginX - eyeSpacing + eyeOffsetX, y: eyeBaseY + eyeOffsetY },
        { id: 'right', x: blobOriginX + eyeSpacing + eyeOffsetX, y: eyeBaseY + eyeOffsetY },
      ];

      // Expressive Eyebrows
      eyes.forEach((eye, index) => {
        ctx.save();
        const browOffset = index === 0 ? -1 : 1;
        const browTilt = s.isPressed ? 0.25 * browOffset : (s.tiltX * 0.14 - 0.08 * browOffset);
        const browY = eye.y - eyeRadiusY - (s.isPressed ? 3 : 7);

        ctx.beginPath();
        ctx.moveTo(eye.x - 14, browY - browTilt * 7);
        ctx.quadraticCurveTo(eye.x, browY - 4, eye.x + 14, browY + browTilt * 7);
        ctx.lineWidth = 3.5;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#000000';
        ctx.stroke();
        ctx.restore();
      });

      // Eyeballs & Pupils
      eyes.forEach((eye) => {
        ctx.save();

        // Eye Sclera
        ctx.beginPath();
        const blinkScale = s.isBlinking ? Math.max(0.06, 1 - Math.sin(s.blinkProgress * Math.PI)) : 1;
        ctx.ellipse(eye.x, eye.y, eyeRadiusX, eyeRadiusY * blinkScale, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();
        ctx.lineWidth = 3.5;
        ctx.strokeStyle = '#000000';
        ctx.stroke();

        if (blinkScale > 0.22) {
          // Gaze vector
          const dx = s.mouseX - eye.x;
          const dy = s.mouseY - eye.y;
          const angle = Math.atan2(dy, dx);
          const dist = Math.min(Math.hypot(dx, dy) * 0.085, eyeRadiusX * 0.58);

          const pupilX = eye.x + Math.cos(angle) * dist;
          const pupilY = eye.y + Math.sin(angle) * dist * blinkScale;
          const basePupilR = 10 * Math.min(s.scaleX, s.scaleY) * blinkScale;
          const pupilRadius = basePupilR * (s.isHovered ? curiosityDilation : 1);

          // Deep Black Pupil
          ctx.beginPath();
          ctx.arc(pupilX, pupilY, pupilRadius, 0, Math.PI * 2);
          ctx.fillStyle = accentEyeColor;
          ctx.fill();

          // Double Specular Glints
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
        // Cute surprised mouth on soft poke
        ctx.ellipse(mouthX, mouthY + 2, 7 * s.scaleX, 9 * s.scaleY, 0, 0, Math.PI * 2);
        ctx.fillStyle = deepShadowColor || '#1A1A1A';
        ctx.fill();
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = '#000000';
        ctx.stroke();
      } else {
        // Smiling arc
        const smileW = (13 + Math.sin(s.t * 2) * 1.5) * s.scaleX;
        ctx.arc(mouthX, mouthY - 4, smileW, 0.22 * Math.PI, 0.78 * Math.PI);
        ctx.lineWidth = 3.5;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#000000';
        ctx.stroke();
      }
      ctx.restore();

      // --- 10. Harmonized Cheek Blush (Matching Chosen Theme) ---
      const blushY = eyeBaseY + 18 * s.scaleY + eyeOffsetY;
      const blushLeftX = blobOriginX - eyeSpacing * 1.55 + eyeOffsetX;
      const blushRightX = blobOriginX + eyeSpacing * 1.55 + eyeOffsetX;

      ctx.save();
      ctx.beginPath();
      ctx.ellipse(blushLeftX, blushY, 9 * s.scaleX, 5 * s.scaleY, -0.1, 0, Math.PI * 2);
      ctx.ellipse(blushRightX, blushY, 9 * s.scaleX, 5 * s.scaleY, 0.1, 0, Math.PI * 2);
      ctx.fillStyle = blushColor;
      ctx.fill();
      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationFrameId);
  }, [width, height, baseColor, highlightColor, shadowColor, deepShadowColor, glowColor, blushColor, accentEyeColor]);

  return (
    <div className={`relative flex flex-col items-center select-none ${className}`}>
      <canvas
        ref={canvasRef}
        style={{ width: `${width}px`, height: `${height}px` }}
        onPointerMove={handlePointerMove}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        className="cursor-pointer touch-none filter drop-shadow-[4px_4px_0px_#000000] active:scale-98 transition-transform duration-75"
        title="Interactive 3D Void Blob - Click to poke gently!"
      />

      {/* Floating Neobrutalist Tracking Pill */}
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
