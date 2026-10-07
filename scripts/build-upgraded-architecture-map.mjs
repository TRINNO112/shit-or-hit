import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.join(__dirname, '..');

const buildHtml = () => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>Daily Verdict — Master System Architecture & Defense Blueprint (v9)</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Caveat:wght@600;700&family=Kalam:wght@400;700&family=Plus+Jakarta+Sans:wght@700;800;900&family=JetBrains+Mono:wght@700;800&display=swap" rel="stylesheet">
<style>
:root {
  --bg: #07080F;
  --paper: #FFFDF8;
  --ink: #111111;
  --wire: #F4EBD9;
  --sub: #9E9BB5;
  --grid: #1D2038;
  --card-bg: rgba(16, 14, 34, 0.94);
  --card-border: #F4EBD9;
  --card-text: #F4EBD9;
  --card-tech: #A9A6C0;
  --theme-trans: 0.3s ease;
}

body.theme-light {
  --bg: #FFF9EE;
  --paper: #FFFDF8;
  --ink: #111111;
  --wire: #111111;
  --sub: #555555;
  --grid: #E8DEC8;
  --card-bg: #FFE86B;
  --card-border: #111111;
  --card-text: #111111;
  --card-tech: #2B2A33;
}

html, body {
  height: 100%;
  margin: 0;
  background: var(--bg);
  overflow: hidden;
  touch-action: none;
  font-family: 'Kalam', 'Caveat', cursive;
  color: #111;
  user-select: none;
  -webkit-user-select: none;
  transition: background var(--theme-trans);
}

#c {
  display: block;
  width: 100%;
  height: 100%;
  cursor: grab;
}
#c.hov { cursor: pointer; }
#c.drag { cursor: grabbing; }

/* Cinematic Letterbox */
.lb {
  position: fixed;
  left: 0;
  right: 0;
  height: 0;
  background: #000;
  z-index: 8;
  transition: height 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  pointer-events: none;
}
#lb1 { top: 0; }
#lb2 { bottom: 0; }
body.cin .lb { height: 4.5vh; }
@media (max-width: 640px) { body.cin .lb { height: 0; } }

/* Ambient Film Grain & Vignette */
#vig {
  position: fixed;
  inset: 0;
  pointer-events: none;
  box-shadow: inset 0 0 220px 60px rgba(0,0,0,0.85);
  z-index: 2;
  transition: box-shadow var(--theme-trans);
}
body.theme-light #vig {
  box-shadow: inset 0 0 160px 30px rgba(216, 200, 160, 0.45);
}

#gr {
  position: fixed;
  inset: -50%;
  pointer-events: none;
  z-index: 2;
  opacity: 0.055;
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)'/%3E%3C/svg%3E");
  animation: gr 0.6s steps(6) infinite;
}
@keyframes gr {
  0% { transform: translate(0,0); }
  25% { transform: translate(-3%, 2%); }
  50% { transform: translate(2%, -3%); }
  75% { transform: translate(3%, 3%); }
  100% { transform: translate(0,0); }
}

/* Neobrutalist Detail Note Modal */
#note {
  position: fixed;
  width: min(340px, 92vw);
  box-sizing: border-box;
  padding: 18px 20px 16px;
  background: var(--card-bg);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  color: var(--card-text);
  border: 3px solid var(--card-border);
  border-radius: 255px 18px 225px 18px/18px 225px 18px 255px;
  box-shadow: 6px 6px 0 #111, 0 0 50px -8px var(--ac, #FDC800);
  transform: rotate(-1.4deg);
  display: none;
  z-index: 10;
  font-size: 15px;
  line-height: 1.38;
  max-height: min(680px, calc(100vh - 84px));
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: thin;
  scrollbar-color: var(--card-border) transparent;
}
#note.on {
  display: block;
  animation: pop 0.32s cubic-bezier(0.34, 1.56, 0.64, 1);
}
@keyframes pop {
  from { transform: rotate(-7deg) scale(0.65); opacity: 0; }
  to { transform: rotate(-1.4deg) scale(1); opacity: 1; }
}

#note:before {
  content: "";
  position: absolute;
  top: -13px;
  left: 50%;
  width: 88px;
  height: 24px;
  margin-left: -44px;
  background: var(--ac, #FDC800);
  border: 2px solid #111;
  transform: rotate(2.5deg);
  box-shadow: 2px 2px 0 #111;
}

#note h2 {
  margin: 6px 0 4px;
  font-family: 'Caveat', cursive;
  font-size: 32px;
  line-height: 1.05;
}
#note h3 {
  margin: 10px 0 4px;
  font-size: 15px;
  text-decoration: underline wavy var(--ac, #FF4D4D);
}
#note p { margin: 0; }
#ni {
  float: left;
  margin: 3px 12px 4px 0;
  border-radius: 12px;
  background: #FFFDF8;
  border: 2px solid #111;
  box-shadow: 2px 2px 0 #111;
}
#note .tag {
  font: 800 11px/1 'JetBrains Mono', monospace;
  letter-spacing: 0.08em;
  display: table;
  padding: 4px 8px;
  border: 2px solid #111;
  background: var(--ac, #FDC800);
  color: #111;
  box-shadow: 2px 2px 0 #111;
}
#note .tech {
  margin-top: 10px;
  font: 700 11px/1.4 'JetBrains Mono', monospace;
  border-top: 2px dashed rgba(255,255,255,0.25);
  padding-top: 8px;
  word-break: break-word;
  color: var(--card-tech);
}
body.theme-light #note .tech {
  border-top-color: rgba(0,0,0,0.25);
}

#x {
  position: absolute;
  right: 12px;
  top: 10px;
  border: 2px solid #111;
  background: #FF4D4D;
  color: #fff;
  font: 800 16px 'JetBrains Mono', monospace;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 8px;
  box-shadow: 2px 2px 0 #111;
  transition: transform 0.1s, box-shadow 0.1s;
}
#x:hover { transform: translate(-1px, -1px); box-shadow: 3px 3px 0 #111; }
#x:active { transform: translate(1px, 1px); box-shadow: 0 0 0 #111; }

.fx {
  margin-top: 10px;
  background: rgba(255,255,255,0.06);
  border: 2px dashed rgba(255,255,255,0.3);
  border-radius: 10px;
  transition: background 0.2s, border 0.2s;
}
body.theme-light .fx {
  background: rgba(255,255,255,0.5);
  border-color: rgba(0,0,0,0.3);
}
.fx[open] {
  background: rgba(255,255,255,0.12);
  border-style: solid;
  border-color: var(--ac, #00E599);
}
.fx summary {
  list-style: none;
  cursor: pointer;
  font-family: 'Caveat', cursive;
  font-size: 20px;
  font-weight: 700;
  padding: 6px 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.fx summary::-webkit-details-marker { display: none; }
.fx-arrow {
  font-size: 14px;
  font-weight: 900;
  transition: transform 0.25s ease;
}
.fx[open] .fx-arrow { transform: rotate(-180deg); color: #FF4D4D; }
.facts {
  margin: 0;
  padding: 4px 14px 10px 24px;
  font-size: 13.5px;
}
.facts li { margin: 3px 0; line-height: 1.35; }

.aip .st {
  border-left: 3.5px solid var(--ac, #00E599);
  padding: 3px 0 4px 10px;
  margin: 6px 0;
  display: flex;
  flex-direction: column;
  background: rgba(255,255,255,0.04);
  border-radius: 0 8px 8px 0;
}
.aip .st b {
  font: 800 10.5px/1.2 'JetBrains Mono', monospace;
  letter-spacing: 0.1em;
  color: var(--ac, #00E599);
}
.aip .st span { font-size: 13.5px; line-height: 1.3; }

/* Interactive HUD Controls (Prominent & Mobile-Optimized) */
#hud {
  position: fixed;
  left: 50%;
  bottom: calc(18px + env(safe-area-inset-bottom, 0px));
  transform: translateX(-50%);
  z-index: 12;
  display: flex;
  align-items: center;
  gap: 8px;
  background: #FFFDF8;
  border: 3px solid #111;
  border-radius: 18px;
  padding: 6px 10px;
  box-shadow: 4px 4px 0 #111;
  max-width: 96vw;
  box-sizing: border-box;
}

.btn {
  border: 2.5px solid #111;
  background: #00E599;
  box-shadow: 2.5px 2.5px 0 #111;
  font: 700 17px 'Caveat', cursive;
  padding: 3px 12px;
  cursor: pointer;
  border-radius: 10px;
  color: #111;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: transform 0.1s, box-shadow 0.1s;
  white-space: nowrap;
}
.btn:hover { transform: translate(-1px, -1px); box-shadow: 3.5px 3.5px 0 #111; }
.btn:active { transform: translate(2px, 2px); box-shadow: 0.5px 0.5px 0 #111; }
.btn:disabled { opacity: 0.4; cursor: not-allowed; }
.btn.alt { background: #FDC800; }
.btn.purple { background: #B388FF; }
.btn.coral { background: #FF4D4D; color: #fff; }

#dots {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 0 4px;
  max-width: min(440px, 45vw);
  overflow-x: auto;
  scrollbar-width: none;
}
#dots::-webkit-scrollbar { display: none; }
#dots button {
  width: 13px;
  height: 13px;
  border: 2px solid #111;
  border-radius: 50%;
  background: #fff;
  padding: 0;
  cursor: pointer;
  transition: transform 0.2s, background 0.2s;
  flex-shrink: 0;
}
#dots button.seen { background: var(--c); }
#dots button.cur {
  transform: scale(1.6);
  background: var(--c);
  box-shadow: 1.5px 1.5px 0 #111;
}

#hud-counter {
  font: 800 11px/1 'JetBrains Mono', monospace;
  color: #111;
  padding: 0 4px;
  white-space: nowrap;
}

/* Secondary Toolbar (Top Right / Bottom Right) */
#ctl {
  position: fixed;
  right: 14px;
  top: 14px;
  z-index: 12;
  display: flex;
  gap: 8px;
}
#menu {
  position: fixed;
  right: 14px;
  top: 60px;
  z-index: 13;
  display: none;
  flex-direction: column;
  gap: 7px;
  background: #FFFDF8;
  border: 3px solid #111;
  border-radius: 16px;
  padding: 10px;
  box-shadow: 5px 5px 0 #111;
}
#menu.on { display: flex; }

/* Interactive Minimap */
#mm {
  position: fixed;
  left: 14px;
  top: 14px;
  width: 170px;
  height: 170px;
  z-index: 11;
  background: #0D0F1C;
  border: 2.5px solid rgba(255,255,255,0.4);
  border-radius: 14px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.6), 0 0 25px rgba(179,136,255,0.3);
  cursor: pointer;
  transition: opacity 0.3s, transform 0.3s;
}
body.theme-light #mm {
  background: #FFFDF8;
  border-color: #111;
  box-shadow: 4px 4px 0 #111;
}
@media (max-width: 768px) {
  #mm { display: none; }
}

/* Modal Bottom Sheets & Overlays */
#scrim {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.65);
  z-index: 18;
  display: none;
  backdrop-filter: blur(4px);
}
#sheet {
  position: fixed;
  left: 50%;
  top: 50%;
  width: min(760px, 92vw);
  max-height: 86vh;
  overflow: auto;
  box-sizing: border-box;
  padding: 24px 28px;
  background: #FFE86B;
  border: 3.5px solid #111;
  border-radius: 255px 18px 225px 18px/18px 225px 18px 255px;
  box-shadow: 8px 8px 0 #111;
  z-index: 19;
  display: none;
  transform: translate(-50%, -50%) rotate(-0.6deg);
}
#sheet.on { display: block; animation: popc 0.28s cubic-bezier(0.3, 1.5, 0.5, 1); }
@keyframes popc {
  from { transform: translate(-50%, -50%) rotate(-5deg) scale(0.7); opacity: 0; }
  to { transform: translate(-50%, -50%) rotate(-0.6deg) scale(1); opacity: 1; }
}
#sheet h2 { font-family: 'Caveat', cursive; font-size: 38px; margin: 0 0 4px; }
#sheet .sub { font-size: 16px; margin: 0 0 14px; }
#sheet .cl { position: absolute; right: 16px; top: 16px; background: #FF4D4D; color: #fff; }
#sheet .row { display: grid; grid-template-columns: 130px 1fr; gap: 14px; padding: 10px 0; border-top: 2px dashed #111; }
#sheet .row b { font-family: 'Caveat', cursive; font-size: 24px; }

/* Interactive Gentle Intro (Dismissible Instantly) */
#intro {
  position: fixed;
  inset: 0;
  z-index: 25;
  background: radial-gradient(#141230, #05060C);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #F4EBD9;
  text-align: center;
  cursor: pointer;
  transition: opacity 0.4s ease, visibility 0.4s;
}
#intro.hidden { opacity: 0; pointer-events: none; visibility: hidden; }
#intro h1 {
  font: 700 clamp(48px, 9vw, 110px)/1 'Caveat', cursive;
  margin: 0;
  text-shadow: 0 0 40px #B388FF;
}
#intro p {
  font: 800 clamp(11px, 1.4vw, 16px) 'JetBrains Mono', monospace;
  letter-spacing: 0.4em;
  text-transform: uppercase;
  color: #FDC800;
  margin: 14px 0 0;
}
#intro .tap-prompt {
  margin-top: 40px;
  font: 700 13px 'JetBrains Mono', monospace;
  letter-spacing: 0.25em;
  background: #00E599;
  color: #111;
  padding: 8px 18px;
  border: 2px solid #111;
  border-radius: 10px;
  box-shadow: 3px 3px 0 #111;
  animation: pulse 1.5s infinite;
}
@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

/* Act Banner */
#act {
  position: fixed;
  inset: 0;
  z-index: 15;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  opacity: 0;
  color: #F4EBD9;
  background: radial-gradient(rgba(0,0,0,0.65), rgba(0,0,0,0) 70%);
}
#act small {
  font: 800 clamp(11px, 1.8vw, 18px) 'JetBrains Mono', monospace;
  letter-spacing: 0.5em;
  color: var(--c, #FDC800);
}
#act b {
  font: 700 clamp(36px, 7vw, 84px)/1.1 'Caveat', cursive;
  text-shadow: 0 0 35px var(--c, #FDC800);
}
#act.on { animation: act 2.2s both; }
@keyframes act {
  0% { opacity: 0; transform: scale(1.08); }
  20%, 75% { opacity: 1; transform: none; }
  100% { opacity: 0; }
}

/* Hint Toast */
#hint {
  position: fixed;
  left: 50%;
  top: 14px;
  transform: translateX(-50%);
  z-index: 9;
  font: 700 13px 'JetBrains Mono', monospace;
  color: #CFCBE6;
  background: rgba(7, 8, 15, 0.85);
  border: 1.5px solid rgba(255,255,255,0.2);
  padding: 4px 14px;
  border-radius: 10px;
  text-align: center;
  pointer-events: none;
  box-shadow: 0 4px 15px rgba(0,0,0,0.5);
  transition: opacity 0.4s;
}
body.theme-light #hint {
  color: #111;
  background: rgba(255, 253, 248, 0.9);
  border-color: #111;
  box-shadow: 2px 2px 0 #111;
}

@media (max-width: 640px) {
  #note {
    left: 8px !important;
    right: 8px !important;
    top: auto !important;
    bottom: 74px !important;
    width: auto;
    max-height: 52vh;
    border-radius: 16px;
  }
  #hud {
    bottom: 8px;
    padding: 4px 8px;
    gap: 5px;
  }
  .btn { font-size: 15px; padding: 2px 8px; }
  #ctl { top: 8px; right: 8px; }
}
</style>
</head>
<body>
<canvas id="c"></canvas>
<div class="lb" id="lb1"></div>
<div class="lb" id="lb2"></div>

<!-- Note Detail Modal -->
<div id="note" role="dialog" aria-live="polite">
  <button id="x" aria-label="Close note">✕</button>
  <span class="tag"></span>
  <canvas id="ni" width="52" height="52"></canvas>
  <h2></h2>
  <p class="do"></p>
  <h3>Why It Matters</h3>
  <p class="why"></p>
  <div class="aip"></div>
  <details class="fx">
    <summary>
      <span>Technical Invariants</span>
      <span class="fx-arrow">▾</span>
    </summary>
    <div class="fx-body">
      <ul class="facts"></ul>
    </div>
  </details>
  <div class="tech"></div>
</div>

<!-- Interactive Minimap Canvas -->
<canvas id="mm" width="340" height="340" aria-label="Minimap"></canvas>

<!-- Overlays -->
<div id="gr"></div>
<div id="vig"></div>
<div id="hint">Arrow Keys steer the camera • Click any node to fly • Drag to pan freely</div>

<!-- Dismissible Intro -->
<div id="intro">
  <h1>Daily Verdict</h1>
  <p>One honest minute every night</p>
  <div class="tap-prompt">TAP OR PRESS ANY KEY TO EXPLORE BLUEPRINT</div>
</div>

<div id="act"><small></small><b></b></div>

<!-- Prominent Neobrutalist HUD Controls -->
<div id="hud">
  <button class="btn" id="pv" title="Previous Stop (Left Arrow)">◀ BACK</button>
  <div id="dots"></div>
  <span id="hud-counter">1 / 20</span>
  <button class="btn" id="nx" title="Next Stop (Right Arrow)">NEXT ▶</button>
  <button class="btn alt" id="ov" title="Master Overview (O)">MAP</button>
  <button class="btn purple" id="au" title="Toggle Auto-Tour (A)">AUTO: OFF</button>
</div>

<!-- Secondary Actions -->
<div id="ctl">
  <button class="btn alt" id="thm" title="Toggle Theme">☀ THEME</button>
  <button class="btn purple" id="sn" title="Audio Atmosphere">♫ SOUND: OFF</button>
  <button class="btn" id="mn" title="System Menu">MENU ▾</button>
</div>

<div id="menu">
  <button class="btn alt" id="bg">The Big Picture</button>
  <button class="btn alt" id="wd">Who Does What</button>
  <button class="btn alt" id="ai-jump">Jump to AI Brain</button>
  <button class="btn alt" id="sec-jump">Jump to Security</button>
  <button class="btn alt" id="hp">Keyboard Shortcuts</button>
  <button class="btn alt" id="fs">Fullscreen</button>
</div>

<div id="scrim"></div>
<div id="sheet"></div>

<script>
(() => {
  const cv = document.getElementById('c');
  const ctx = cv.getContext('2d');
  const INK = '#111111';
  const PAPER = '#FFFDF8';
  
  // Palette Tokens
  const C = {
    y: '#FDC800', // Neo Gold
    m: '#00E599', // Emerald Mint
    r: '#FF4D4D', // Coral Red
    c: '#00C2FF', // Cyan Blue
    l: '#B388FF', // Lavender Purple
    dark: '#07080F'
  };

  const F = (weight, size) => weight + ' ' + size + 'px Caveat, Kalam, cursive';
  const MONO = (weight, size) => weight + ' ' + size + 'px "JetBrains Mono", ui-monospace, monospace';

  let W, H, DPR;
  let isLightTheme = false;

  // ----------------------------------------------------
  // Dynamic 2.5D Camera Model with Perspective Gimbal
  // ----------------------------------------------------
  let cam = {
    x: 0,
    y: 0,
    k: 0.5,
    targetK: 0.5,
    // Dynamic perspective tilt
    pitch: 0,
    yaw: 0,
    roll: 0,
    targetPitch: 0,
    targetRoll: 0,
    // Inertial gliding
    vx: 0,
    vy: 0
  };

  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    cv.width = W * DPR;
    cv.height = H * DPR;
  }
  window.addEventListener('resize', () => { resize(); fit(); });
  resize();

  // Pseudo-random seeded hash
  const mul = a => () => {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };

  function md(a, b, r, amp, out, d) {
    const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1;
    if (d <= 0 || L < 40) { out.push(b); return; }
    const o = (r() - 0.5) * 2 * amp;
    const m = [(a[0] + b[0]) / 2 - dy / L * o, (a[1] + b[1]) / 2 + dx / L * o];
    md(a, m, r, amp * 0.62, out, d - 1);
    md(m, b, r, amp * 0.62, out, d - 1);
  }

  function sm(p, P) {
    P.moveTo(p[0][0], p[0][1]);
    for (let i = 1; i < p.length - 1; i++) {
      P.quadraticCurveTo(p[i][0], p[i][1], (p[i][0] + p[i+1][0]) / 2, (p[i][1] + p[i+1][1]) / 2);
    }
    P.lineTo(p[p.length - 1][0], p[p.length - 1][1]);
  }

  // ----------------------------------------------------
  // Master Architecture Nodes: 20 Core Systems
  // ----------------------------------------------------
  const D = [
    // ACT I: THE NIGHTLY VERDICT & SPHERES
    ['n1', 300, 380, 'u', 'c', '1-Tap Nightly Entry', 'Phone or laptop, end of day.', 'Zero barrier, instant guest slot.', 'moon',
     'You open the app on phone or PC. A private isolated guest space launches instantly without sign-up friction.',
     'Tired brains skip hard habits. Removing sign-up barriers guarantees you show up tonight.', 'Header, MobileAppView, PWAInstallBanner, OfflineShelterBadge'],

    ['n2', 1000, 380, 'u', 'y', 'The 5-Tier Daily Verdict', 'Rough, Down, Okay, Good, Peak.', 'One honest tap, 1 to 5 stars.', 'star',
     'You name the mood across 5 tactile pedals. Each star carries dedicated color tokens, mascot archetypes, and directives.',
     'Replaces 30 tedious checkboxes with a single honest assessment to protect mental bandwidth.', 'TodayHero, DayRatingModal, 5-tier mood pedals'],

    ['n3', 1700, 380, 'u', 'm', 'Life Spheres Engine', 'Work, School, Home, Social.', 'Blended into one composite score.', 'sphere',
     'Optionally rate individual life domains and outlier event spheres. The mathematical algorithm computes a fair composite score.',
     'A rough evening should not erase a productive morning. Isolating spheres shows where friction truly lives.', 'SphereIcon, Multi-Sphere Engine, calculateCompositeScore()'],

    ['n4', 2400, 380, 'u', 'y', 'Daily Non-Negotiable Anchors', 'Deterministic, Hybrid, Checklist.', 'Mathematical habit weighting.', 'check',
     'Configure foundational daily anchors. Choose Deterministic 100% (tasks govern rating), Hybrid 50/50, or Subjective Checklist.',
     'Bridges personal feeling with objective execution, keeping accountability honest.', 'NonNegotiableCard, NonNegotiablesStudioModal, BehavioralLabModal'],

    ['n5', 3100, 380, 'ai', 'l', 'AI Diary Ghostwriter', 'Dump your tired shorthand.', 'Polished in your authentic voice.', 'pen',
     'Dump raw fragments or tired notes. Gemini converts them into vivid first-person prose while strictly preserving 100% of facts and names.',
     'Takes away the cognitive chore of writing prose late at night, ensuring you record your story.', 'AutoExpandTextarea, Gemini flash-lite, no-invention rule'],

    ['n6', 3800, 380, 'ai', 'y', 'Five Mental Lenses', 'Stoic, Root Causes, Action Bullets.', 'Reflect through your philosophy.', 'sphere',
     'Switch how AI views your day: Auto Polish for natural flow, Tactical Stoic Dossier for radical ownership, or Root Causes for friction isolation.',
     'Reframing your day through intentional lenses turns passive journaling into active mental fortitude.', 'Tactical AI Directives, custom prompt system'],

    // ACT II: FORENSIC INTELLIGENCE & SLUMP ESCROW
    ['n7', 3800, 1260, 'ai', 'r', 'Post-Mortem Autopsy Chamber', 'Rough or Down day inquest.', 'CIA Manila folder diagnosis.', 'lens',
     'Triggered on 1★ or 2★ days. Forensic triage diagnoses the friction leak, poses 3 targeted questions, and issues one non-negotiable antidote.',
     'Stops the spiral into shame or denial. Objective forensic diagnosis breaks negative momentum immediately.', 'AutopsyChamberModal, autopsyIntelligence.js'],

    ['n8', 3100, 1260, 'ai', 'c', 'Ransom Time-Lock Capsule', 'Written on 5★ Peak God Mode.', 'Unlocked only after slumps.', 'lock',
     'On a peak day, write a reality-check letter sealed with wax. AI escrow holds it, unlocking only when 2 consecutive rough days occur.',
     'Clear-headed you knows what low you forgets. Your best self coaches your worst self when resilience is lowest.', 'RansomCapsuleModal, Slump Escrow Engine'],

    ['n9', 2400, 1260, 'ai', 'l', 'Monthly Intelligence Dossier', 'Homie letter + Persona Archetype.', 'Domino effect causal chains.', 'mail',
     'At month end, the AI reviews all entries. Produces an archetype, a tough-love Homie letter, domino behavioral cascades, and 3 directives.',
     'Fights recency bias by synthesizing the macro narrative of your habits, victories, and friction leaks.', 'MonthlyReportModal, Domino Cascade Analyzer'],

    ['n10', 1700, 1260, 'u', 'r', '4K Wallpaper & Creative Studio', '365-day Year in Pixels dial.', '1080p story & 4K poster rasterizer.', 'poster',
     'Transforms your daily history into circular radar dials and aesthetic cards in DeepSeek, Neo-Gold, or Tokyo Sunset palettes.',
     'Tangible visual evidence of your consistency reinforces commitment and celebrates small victories.', 'AestheticCardExportModal, YearInPixelsWallpaperEngine'],

    // ACT III: LIFE PAUSE & NERVOUS SYSTEM STASIS
    ['n11', 1000, 1260, 'u', 'm', 'Tranquility Sanctuary', 'Acute 7-14 Day Reset.', 'Vagus Nerve 4-2-6 & Streak Freeze.', 'moon',
     'Emergency pause for nervous system recovery and burnout triage. Structured 7-14 day arc with 4-2-6 pacer orb and somatic grounding.',
     'Prevents burnout from shattering long streaks. Rest is an active component of discipline.', 'SanctuaryPage, RehabilitationModal, Blob3DCanvas'],

    ['n12', 300, 1260, 'u', 'm', 'Grand Sabbatical Horizon', 'Macro open-ended life transition.', 'Streak shielded & indefinite.', 'compass',
     'Months or years-long life transition (gap year, travel, creative sabbatical). Open horizon with zero daily score pressure.',
     'Life evolves beyond daily metrics. The system steps back while holding your legacy intact.', 'Grand Sabbatical Engine, Compass Mode'],

    // ACT IV: SOVEREIGN DEFENSE & DATA INFRASTRUCTURE
    ['n13', 300, 2140, 'f', 'c', 'Local-First Sovereign Storage', 'Device-partitioned slots.', 'goodness_db_guest vs uid.', 'disk',
     'Every verdict saves in ~1ms directly into local storage. Multi-tenant partitioning isolates guests from verified accounts.',
     'Zero server latency and offline resilience guarantee you never lose an entry.', 'getDbStorageKey(), localStorage isolation, storageManager.js'],

    ['n14', 1000, 2140, 'f', 'r', 'Client-Side AES-256 PIN Vault', 'Zero-knowledge encryption.', 'PBKDF2 key derivation & GCM.', 'lock',
     'Optional 4-digit PIN derives an AES-GCM key in the browser. Stored diary text is encrypted locally before touching any storage.',
     'True privacy allows radical honesty. Without the PIN, stored data is mathematical gibberish.', 'VaultPinModal, cipherEngine.js'],

    ['n15', 1700, 2140, 'f', 'm', 'Indian DPDPA 2023 Sovereignty', 'Statutory Section 12/13 compliance.', '7-Day regret-proof cooling off.', 'shield',
     'Full statutory Indian Digital Personal Data Protection Act compliance. Zero-third-party tracking, nuclear purge, and designated grievance officer.',
     'Data sovereignty is a human right. Your reflections remain your private property forever.', 'DataErasurePage, PrivacyPolicyPage, grievance officer'],

    ['n16', 2400, 2140, 'f', 'c', 'Device File Mirror', 'File System Access API.', 'Physical JSON file mirror on disk.', 'stack',
     'Browser connects directly to a physical file on your hard drive (D:\\, Documents). Auto-saves every entry as raw JSON.',
     'Permanent offline backup that survives browser cache purges or cookie clearing.', 'fileMirrorEngine.js, StorageSovereigntyPage'],

    ['n17', 3100, 2140, 'f', 'y', 'Encrypted P2P Device Beam', 'AirDrop-style QR antenna.', 'Direct peer-to-peer data beam.', 'spark',
     'Transfer complete diaries between phone and PC via local pairing codes and QR codes with zero cloud upload.',
     'Seamless multi-device sync without requiring account creation or third-party cloud trust.', 'P2PDeviceSyncModal, p2pSyncEngine.js'],

    ['n18', 3800, 2140, 'f', 'c', 'Cloud Backup & 4s Race Timeout', 'Firebase Firestore sync.', 'Queued writes never freeze.', 'cloud',
     'Verified owners sync bidirectionally to Firebase Firestore. If the network lags, save gives up after 4s and queues locally.',
     'You get multi-device synchronization without ever waiting for a spinner.', 'firebase.js, cleanFirestorePayload, 4s race timeout'],

    ['n19', 3800, 2980, 'f', 'l', 'Procedural Web Audio Engine', 'Zero audio asset dependencies.', 'Oscillator clicks, chimes & drones.', 'bell',
     'Synthesizes mechanical shutter clicks, haptic pulses, and mood chord progressions entirely via procedural Web Audio oscillators.',
     'Micro-interactions feel physical and alive without downloading heavy audio files.', 'soundEngine.js, soundEffects.js'],

    ['n20', 2100, 2980, 'f', 'm', 'Master 14-Suite Audit Gate', '69 verified tests across 33 parts.', 'Zero-error production mandate.', 'check',
     'Automated gatekeeper audits navigation, calendar, analytics, dossier, audio, DPDPA, and JSX imports before every commit.',
     'Trust is built on invariants. A daily accountability companion must never fail.', 'audit-system.js, verify-math-and-state-models.js']
  ];

  const FACTS = {
    n1: ['Installs as offline PWA on iOS, Android, and Desktop', 'Sub-1ms instant guest partition (goodness_db_guest)', 'Terminal CLI logging: node bin/verdict.js 5 "Peak day"'],
    n2: ['5 Mood Tiers: Rough (1★), Down (2★), Okay (3★), Good (4★), Peak (5★)', 'Tactile button offset drop-shadows with active physics', 'Deterministic directives mapped to each tier'],
    n3: ['Multi-sphere domains: Work & School, Home, Social, Outlier Events', 'Handles partial ratings and null payloads gracefully', 'Custom sphere creator with dynamic color tokens'],
    n4: ['Deterministic 100%: 0% done = 1★, 100% done = 5★ (manual lock)', 'Hybrid 50/50: 0.5 * feeling + 0.5 * habit math', 'Checklist Mode: preserves subjective 1-tap rating'],
    n5: ['First-person narrative voice preservation (I, my, me)', 'Zero invention of events, dates, or names', 'Dual-mode language isolation (English & Hinglish)'],
    n6: ['Tactical Stoic Dossier: radical ownership without self-pity', 'Root Causes: isolates exact catalyst behind wins/losses', 'Custom Lens: user-defined prompt philosophy'],
    n7: ['Automatic trigger on 1★ and 2★ rough days', '3-question root cause diagnostic interrogator', 'One non-negotiable morning recovery antidote'],
    n8: ['Written exclusively on 5★ God Mode days', 'Cryptographic wax seal & slump escrow algorithm', 'Unlocks only on 2 consecutive rough days'],
    n9: ['Persona Archetype analysis (e.g. Overextended Architect)', 'Domino Effect causal chains with circuit-breaker actions', 'Four-act month chronicle + 3 next-month directives'],
    n10: ['Year-in-pixels 365-day circular radar dial', 'Lossless 1080x1920 story poster rasterization', 'Custom mascot sticker vault with official badges'],
    n11: ['Acute 7-14 day burnout reset with hard ceiling', 'Vagus Nerve 4-2-6 breathing pacer with lotus geometry', 'Somatic garden grounding (Water, Walks, Sleep, Unplug)'],
    n12: ['Indefinite open horizon life transition pause', 'Streak shielded & frozen indefinitely', 'Freeform sabbatical chronicles without daily rating pressure'],
    n13: ['Local-first architecture operates 100% offline', 'Partitioned keys prevent cross-account cache leakage', 'Memory purge on logout prevents shared device snooping'],
    n14: ['PBKDF2 key derivation with 100,000 salt iterations', 'AES-GCM client-side authenticated encryption', 'Zero-knowledge design: server never sees PIN'],
    n15: ['Statutory compliance with Indian DPDPA 2023 Section 12 & 13', 'Grievance officer contact declared (kaushtubh457@gmail.com)', '7-day regret-proof cooling-off data deletion hold'],
    n16: ['Direct disk mirror via Chromium File System Access API', 'Auto-syncs local JSON file on every save', 'Zero cloud risk: lives in your local filesystem'],
    n17: ['Local encrypted P2P data beam without cloud intermediary', 'QR code transmitter & receiver antenna modes', 'DOMPurify sanitized SVG rendering for zero XSS risk'],
    n18: ['Firebase Firestore cloud synchronization for verified users', '4-second race timeout prevents network freeze', 'Offline queue auto-reconciles upon reconnection'],
    n19: ['Procedural Web Audio API sound synthesizer', 'Biquad filter sweeps and dual oscillator chords', 'Tactile haptic vibration triggers on supported devices'],
    n20: ['Master 14-suite automated audit pipeline', '69 automated test checks across 33 frontend components', 'Mandatory pre-push gate blocks broken code']
  };

  const N = D.map((a, i) => ({
    i,
    id: a[0],
    x: a[1],
    y: a[2],
    k: a[3],
    col: C[a[4]],
    t: a[5],
    s: [a[6], a[7]],
    ic: a[8],
    does: a[9],
    why: a[10],
    tech: a[11],
    w: 390,
    h: 155,
    sc: 1,
    vs: 0,
    ang: 0,
    va: 0,
    rv: 1,
    sh: []
  }));

  const byId = Object.fromEntries(N.map(n => [n.id, n]));
  const TOUR = N.map(n => n.id);
  const TI = Object.fromEntries(TOUR.map((id, i) => [id, i]));
  const seen = new Set();

  // ----------------------------------------------------
  // Bézier Connections & Flow Wires
  // ----------------------------------------------------
  const E = [];
  function mkEdge(aId, bId, sa, sb, l1, l2, dash = 0) {
    const a = byId[aId], b = byId[bId];
    if (!a || !b) return;
    const A = sa === 'l' ? [a.x - a.w/2, a.y] : sa === 'r' ? [a.x + a.w/2, a.y] : sa === 't' ? [a.x, a.y - a.h/2] : [a.x, a.y + a.h/2];
    const B = sb === 'l' ? [b.x - b.w/2, b.y] : sb === 'r' ? [b.x + b.w/2, b.y] : sb === 't' ? [b.x, b.y - b.h/2] : [b.x, b.y + b.h/2];
    const n1 = sa === 'l' ? [-1,0] : sa === 'r' ? [1,0] : sa === 't' ? [0,-1] : [0,1];
    const n2 = sb === 'l' ? [-1,0] : sb === 'r' ? [1,0] : sb === 't' ? [0,-1] : [0,1];
    const c1 = [A[0] + n1[0] * l1, A[1] + n1[1] * l1];
    const c2 = [B[0] + n2[0] * l2, B[1] + n2[1] * l2];

    const base = [];
    for (let i = 0; i <= 60; i++) {
      const t = i / 60, u = 1 - t;
      base.push([
        u*u*u*A[0] + 3*u*u*t*c1[0] + 3*u*t*t*c2[0] + t*t*t*B[0],
        u*u*u*A[1] + 3*u*u*t*c1[1] + 3*u*t*t*c2[1] + t*t*t*B[1]
      ]);
    }

    let len = 0;
    for (let i = 1; i <= 60; i++) len += Math.hypot(base[i][0] - base[i-1][0], base[i][1] - base[i-1][1]);
    const halo = dash ? C.m : (a.k === 'ai' || b.k === 'ai') ? C.l : C.y;

    const sh = [];
    for (let k = 0; k < 3; k++) {
      const r = mul(E.length * 47 + k * 11 + 7);
      const P = [new Path2D(), new Path2D(), new Path2D()];
      [0, 1].forEach(pi => {
        const q = base.filter((p, i) => i % 3 === 0 || i === 60).map((p, i, arr) =>
          i === 0 || i === arr.length - 1 ? p : [p[0] + (r() - 0.5) * 6, p[1] + (r() - 0.5) * 6]
        );
        sm(q, P[pi]);
      });
      sh.push(P);
    }

    const cnt = Math.max(2, Math.round(len / 280));
    const ph = Array.from({ length: cnt }, (_, i) => i / cnt);
    E.push({ a, b, base, len, dash, halo, sh, ph });
  }

  // Act I Wires
  mkEdge('n1', 'n2', 'r', 'l', 140, 140);
  mkEdge('n2', 'n3', 'r', 'l', 140, 140);
  mkEdge('n3', 'n4', 'r', 'l', 140, 140);
  mkEdge('n4', 'n5', 'r', 'l', 140, 140);
  mkEdge('n5', 'n6', 'r', 'l', 140, 140);

  // Act I -> Act II
  mkEdge('n6', 'n7', 'b', 't', 240, 240);
  mkEdge('n7', 'n8', 'l', 'r', 140, 140);
  mkEdge('n8', 'n9', 'l', 'r', 140, 140);
  mkEdge('n9', 'n10', 'l', 'r', 140, 140);

  // Act II -> Act III
  mkEdge('n10', 'n11', 'l', 'r', 140, 140);
  mkEdge('n11', 'n12', 'l', 'r', 140, 140);

  // Act III -> Act IV
  mkEdge('n12', 'n13', 'b', 't', 240, 240);
  mkEdge('n13', 'n14', 'r', 'l', 140, 140);
  mkEdge('n14', 'n15', 'r', 'l', 140, 140);
  mkEdge('n15', 'n16', 'r', 'l', 140, 140);
  mkEdge('n16', 'n17', 'r', 'l', 140, 140);
  mkEdge('n17', 'n18', 'r', 'l', 140, 140);
  mkEdge('n18', 'n19', 'b', 't', 240, 240);
  mkEdge('n19', 'n20', 'l', 'r', 240, 240);
  mkEdge('n20', 'n1', 't', 'b', 600, 600, 1);

  // ----------------------------------------------------
  // Vector Icons Dictionary
  // ----------------------------------------------------
  const IC = {
    moon: c => { c.arc(0,0,15,0.7,5.6); c.arc(6,-5,12,5.0,1.2,true); },
    star: c => { for(let i=0;i<10;i++){ const a=-1.57+i*0.628, r=i%2?7:16; c.lineTo(Math.cos(a)*r,Math.sin(a)*r); } c.closePath(); },
    sphere: c => { c.arc(0,0,15,0,6.3); c.moveTo(-15,0); c.quadraticCurveTo(0,-14,15,0); c.moveTo(-15,0); c.quadraticCurveTo(0,14,15,0); c.moveTo(0,-15); c.lineTo(0,15); },
    check: c => { c.rect(-14,-14,28,28); c.moveTo(-7,0); c.lineTo(-2,6); c.lineTo(8,-8); },
    pen: c => { c.moveTo(-12,14); c.lineTo(-14,6); c.lineTo(8,-16); c.lineTo(14,-10); c.lineTo(-8,12); c.closePath(); },
    lens: c => { c.arc(-3,-3,12,0,6.3); c.moveTo(6,6); c.lineTo(15,15); },
    lock: c => { c.rect(-11,-2,22,16); c.moveTo(-7,-2); c.arc(0,-6,7,3.14,0); },
    mail: c => { c.rect(-16,-11,32,22); c.moveTo(-16,-11); c.lineTo(0,3); c.lineTo(16,-11); },
    poster: c => { c.rect(-11,-16,22,32); c.moveTo(-6,8); c.lineTo(6,8); c.moveTo(-6,-2); c.arc(0,-4,5,3.1,9.4); },
    compass: c => { c.arc(0,0,15,0,6.3); c.moveTo(0,-9); c.lineTo(5,0); c.lineTo(0,9); c.lineTo(-5,0); c.closePath(); },
    disk: c => { c.rect(-14,-14,28,28); c.rect(-8,-14,16,9); c.rect(-8,3,16,11); },
    shield: c => { c.moveTo(0,-16); c.lineTo(14,-10); c.lineTo(12,6); c.quadraticCurveTo(8,14,0,17); c.quadraticCurveTo(-8,14,-12,6); c.lineTo(-14,-10); c.closePath(); },
    cloud: c => { c.moveTo(-12,10); c.arc(-9,3,7,1.6,4.7); c.arc(0,-4,9,3.5,6.1); c.arc(10,3,7,4.7,1.6); c.closePath(); },
    spark: c => { c.moveTo(0,-17); c.quadraticCurveTo(2,-2,17,0); c.quadraticCurveTo(2,2,0,17); c.quadraticCurveTo(-2,2,-17,0); c.quadraticCurveTo(-2,-2,0,-17); },
    stack: c => { c.moveTo(0,-15); c.lineTo(15,-7); c.lineTo(0,1); c.lineTo(-15,-7); c.closePath(); c.moveTo(-15,1); c.lineTo(0,9); c.lineTo(15,1); c.moveTo(-15,9); c.lineTo(0,17); c.lineTo(15,9); },
    bell: c => { c.moveTo(-13,10); c.quadraticCurveTo(-9,2,-9,-6); c.arc(0,-6,9,3.14,0); c.quadraticCurveTo(9,2,13,10); c.closePath(); c.moveTo(-4,14); c.lineTo(4,14); }
  };

  function drawIcon(n, x, y, t) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(n.ic === 'spark' || n.ic === 'sphere' ? t * 0.7 : Math.sin(t * 2 + n.i) * 0.08);
    const z = 1.1 + Math.sin(t * 2.2 + n.i) * 0.04;
    ctx.scale(z, z);

    if (n.k === 'ai') {
      ctx.save();
      ctx.setLineDash([3, 5]);
      ctx.lineDashOffset = -t * 16;
      ctx.beginPath();
      ctx.arc(0, 0, 26, 0, 6.3);
      ctx.strokeStyle = C.l;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
    }

    ctx.beginPath();
    if (IC[n.ic]) IC[n.ic](ctx);
    ctx.fillStyle = n.col;
    ctx.fill();
    ctx.lineWidth = 2.6;
    ctx.lineJoin = ctx.lineCap = 'round';
    ctx.strokeStyle = INK;
    ctx.stroke();
    ctx.restore();
  }

  // ----------------------------------------------------
  // Node Shape Generator (Wobbly Neobrutalism)
  // ----------------------------------------------------
  function shape(n, b) {
    const r = mul(n.i * 131 + b * 17 + 1);
    const w = n.w / 2, h = n.h / 2;
    const cs = [[-w, -h], [w, -h], [w, h], [-w, h]];
    const cl = [cs[0]];
    const o = [new Path2D(), new Path2D()];

    for (let i = 0; i < 4; i++) {
      const a = cs[i], c = cs[(i+1)%4], pts = [a];
      md(a, c, r, 3, pts, 5);
      for (let j = 1; j < pts.length; j++) cl.push(pts[j]);
      o.forEach(P => {
        const dx = c[0] - a[0], dy = c[1] - a[1], L = Math.hypot(dx, dy);
        const ux = dx/L, uy = dy/L, e1 = (r() - 0.3) * 12, e2 = (r() - 0.3) * 12;
        const A = [a[0] - ux*e1 + (r() - 0.5)*4, a[1] - uy*e1 + (r() - 0.5)*4];
        const B = [c[0] + ux*e2 + (r() - 0.5)*4, c[1] + uy*e2 + (r() - 0.5)*4];
        const q = [A];
        md(A, B, r, 3, q, 5);
        sm(q, P);
      });
    }

    const cp = new Path2D();
    cp.moveTo(cl[0][0], cl[0][1]);
    cl.forEach(p => cp.lineTo(p[0], p[1]));
    cp.closePath();
    return { cl: cp, o };
  }

  // ----------------------------------------------------
  // Camera & Navigation Controller
  // ----------------------------------------------------
  let mode = 'tour'; // 'tour', 'over', 'free'
  let cur = 0;
  let TW = null; // Flight tween
  let autoPlay = false;
  let lastTime = 0;
  let arriveAt = 0;
  let hoveredNode = null;
  let noteNode = null;

  function targetFor(idx) {
    if (idx < 0) {
      // Overview mode
      return {
        cx: 2100,
        cy: 1680,
        k: Math.min(W / 4500, H / 3600) * 0.95,
        sx: W / 2,
        sy: H / 2
      };
    }
    const n = byId[TOUR[idx]];
    const wide = W > 900;
    // Dynamic close-up framing
    const idealK = Math.min(1.22, Math.max(0.75, (W * (wide ? 0.38 : 0.82)) / n.w));
    return {
      cx: n.x,
      cy: n.y,
      k: idealK,
      sx: wide ? W * 0.35 : W / 2,
      sy: wide ? H * 0.45 : H * 0.32
    };
  }

  function fit() {
    const t = targetFor(mode === 'over' ? -1 : cur);
    cam.k = t.k;
    cam.x = t.sx - t.cx * t.k;
    cam.y = t.sy - t.cy * t.k;
  }

  function flyTo(toIdx, fromIdx) {
    const f = {
      cx: (W / 2 - cam.x) / cam.k,
      cy: (H / 2 - cam.y) / cam.k,
      k: cam.k
    };
    const g = targetFor(toIdx);
    const d = Math.hypot(g.cx - f.cx, g.cy - f.cy);

    // Calculate flight angle for 2.5D perspective tilt
    const flightAngle = Math.atan2(g.cy - f.cy, g.cx - f.cx);

    TW = {
      to: toIdx,
      from: f,
      s: 0,
      dur: Math.min(2.2, Math.max(0.8, 0.6 + d / 2200)),
      dip: toIdx < 0 || d < 250 ? 0 : Math.min(0.35, d / 3600),
      flightAngle
    };
    closeNote();
  }

  function camStep(dt) {
    if (mode === 'free') {
      // Apply momentum inertia in free drag
      cam.x += cam.vx * dt * 60;
      cam.y += cam.vy * dt * 60;
      cam.vx *= 0.92;
      cam.vy *= 0.92;
      // Spring decay on perspective tilt
      cam.roll += (0 - cam.roll) * 0.1;
      cam.pitch += (0 - cam.pitch) * 0.1;
      return;
    }

    const g = targetFor(TW ? TW.to : mode === 'over' ? -1 : cur);

    if (!TW) {
      // Smooth subtle damping towards target in idle tour mode
      const speed = 10 * dt;
      cam.k += (g.k - cam.k) * speed;
      const targetX = g.sx - g.cx * cam.k;
      const targetY = g.sy - g.cy * cam.k;
      cam.x += (targetX - cam.x) * speed;
      cam.y += (targetY - cam.y) * speed;
      cam.roll += (0 - cam.roll) * speed;
      cam.pitch += (0 - cam.pitch) * speed;
      return;
    }

    TW.s = Math.min(1, TW.s + dt / TW.dur);
    const s = TW.s;
    // Smooth cubic bezier easing
    const e = s < 0.5 ? 4 * s * s * s : 1 - Math.pow(-2 * s + 2, 3) / 2;

    const f = TW.from;
    const cx = f.cx + (g.cx - f.cx) * e;
    const cy = f.cy + (g.cy - f.cy) * e;

    // Flight camera perspective banking / dynamic tilt
    const speedCurve = Math.sin(Math.PI * s);
    const maxRoll = 0.06;
    const maxPitch = 0.04;
    cam.targetRoll = Math.sin(TW.flightAngle) * maxRoll * speedCurve;
    cam.targetPitch = Math.cos(TW.flightAngle) * maxPitch * speedCurve;
    cam.roll += (cam.targetRoll - cam.roll) * 0.2;
    cam.pitch += (cam.targetPitch - cam.pitch) * 0.2;

    const k = (f.k + (g.k - f.k) * e) * (1 - TW.dip * speedCurve);
    const sx = W / 2 + (g.sx - W / 2) * e;
    const sy = H / 2 + (g.sy - H / 2) * e;

    cam.k = k;
    cam.x = sx - cx * k;
    cam.y = sy - cy * k;

    if (s >= 1) {
      const to = TW.to;
      TW = null;
      if (to >= 0 && mode === 'tour') {
        arrive();
      }
    }
  }

  function arrive() {
    const n = byId[TOUR[cur]];
    seen.add(cur);
    n.vs += 1.4;
    n.va += 1.6;
    arriveAt = performance.now() / 1000;
    openNote(n);
    updateHud();
    playSfx('chime');
  }

  function goToStep(idx) {
    idx = Math.max(0, Math.min(TOUR.length - 1, idx));
    const prev = mode === 'tour' ? cur : -1;
    mode = 'tour';
    cur = idx;
    for (let j = 0; j <= idx; j++) seen.add(j);
    flyTo(idx, prev);
    updateHud();
    playSfx('whoosh');
  }

  function setFreeMode() {
    if (mode !== 'free') {
      mode = 'free';
      TW = null;
      closeNote();
      updateHud();
    }
  }

  function setOverviewMode() {
    closeNote();
    mode = 'over';
    flyTo(-1, cur);
    updateHud();
  }

  // ----------------------------------------------------
  // Note Modal & Detail Drawer
  // ----------------------------------------------------
  const noteEl = document.getElementById('note');
  const fxEl = noteEl.querySelector('.fx');

  function openNote(n) {
    noteNode = n;
    noteEl.style.setProperty('--ac', n.col);
    noteEl.querySelector('.tag').textContent = 'SYSTEM ' + (TI[n.id] + 1) + ' OF ' + TOUR.length;
    noteEl.querySelector('h2').textContent = n.t;
    noteEl.querySelector('.do').textContent = n.does;
    noteEl.querySelector('.why').textContent = n.why;
    noteEl.querySelector('.tech').textContent = 'UNDER THE HOOD: ' + n.tech;

    // Mini icon canvas
    const ni = document.getElementById('ni');
    const nx = ni.getContext('2d');
    nx.clearRect(0, 0, 52, 52);
    nx.save();
    nx.translate(26, 26);
    nx.scale(1.2, 1.2);
    nx.beginPath();
    if (IC[n.ic]) IC[n.ic](nx);
    nx.fillStyle = n.col;
    nx.fill();
    nx.lineWidth = 2.2;
    nx.strokeStyle = INK;
    nx.stroke();
    nx.restore();

    // Facts list
    const ul = noteEl.querySelector('.facts');
    ul.innerHTML = '';
    (FACTS[n.id] || []).forEach(f => {
      const li = document.createElement('li');
      li.textContent = f;
      ul.appendChild(li);
    });

    fxEl.open = false;
    positionNote();
    noteEl.classList.remove('on');
    void noteEl.offsetWidth;
    noteEl.classList.add('on');
  }

  function closeNote() {
    noteNode = null;
    noteEl.classList.remove('on');
  }

  function positionNote() {
    if (!noteNode || W <= 640) return;
    const n = noteNode;
    const screenX = n.x * cam.k + cam.x;
    const screenY = n.y * cam.k + cam.y;

    let left = screenX + (n.w / 2) * cam.k + 30;
    let top = screenY - (n.h / 2) * cam.k;

    if (left + 350 > W) {
      left = screenX - (n.w / 2) * cam.k - 360;
    }
    left = Math.max(12, Math.min(W - 355, left));
    top = Math.max(12, Math.min(H - noteEl.offsetHeight - 12, top));

    noteEl.style.left = left + 'px';
    noteEl.style.top = top + 'px';
  }

  document.getElementById('x').onclick = closeNote;

  // ----------------------------------------------------
  // Interactive HUD Elements
  // ----------------------------------------------------
  const dotsEl = document.getElementById('dots');
  const counterEl = document.getElementById('hud-counter');
  const pvB = document.getElementById('pv');
  const nxB = document.getElementById('nx');
  const ovB = document.getElementById('ov');
  const auB = document.getElementById('au');
  const hintEl = document.getElementById('hint');

  TOUR.forEach((id, i) => {
    const btn = document.createElement('button');
    btn.style.setProperty('--c', byId[id].col);
    btn.title = byId[id].t;
    btn.setAttribute('aria-label', 'Stop ' + (i+1) + ': ' + byId[id].t);
    btn.onclick = () => goToStep(i);
    dotsEl.appendChild(btn);
  });

  function updateHud() {
    [...dotsEl.children].forEach((b, i) => {
      b.className = (mode === 'tour' && i === cur ? 'cur ' : '') + (seen.has(i) ? 'seen' : '');
    });
    counterEl.textContent = (mode === 'tour' ? (cur + 1) : '-') + ' / ' + TOUR.length;
    pvB.disabled = mode === 'tour' && cur === 0;
    nxB.disabled = mode === 'tour' && cur === TOUR.length - 1;
    auB.textContent = 'AUTO: ' + (autoPlay ? 'ON' : 'OFF');

    if (mode === 'free') {
      hintEl.textContent = 'Free Camera Mode • Click any node or press Arrow Keys to rejoin tour';
    } else if (mode === 'over') {
      hintEl.textContent = 'Master Blueprint Overview • Click any stop or press NEXT to start';
    } else {
      hintEl.textContent = 'Stop ' + (cur + 1) + ' of ' + TOUR.length + ' • ' + byId[TOUR[cur]].t;
    }
  }

  pvB.onclick = () => goToStep(cur - 1);
  nxB.onclick = () => goToStep(cur + 1);
  ovB.onclick = () => mode === 'over' ? goToStep(cur) : setOverviewMode();
  auB.onclick = () => {
    autoPlay = !autoPlay;
    if (autoPlay && mode !== 'tour') goToStep(cur);
    updateHud();
  };

  // ----------------------------------------------------
  // Theme Toggle (Neo-Gold Paper vs Cyberpunk Dark)
  // ----------------------------------------------------
  const thmB = document.getElementById('thm');
  thmB.onclick = () => {
    isLightTheme = !isLightTheme;
    document.body.classList.toggle('theme-light', isLightTheme);
    thmB.textContent = isLightTheme ? '☾ DARK' : '☀ THEME';
  };

  // ----------------------------------------------------
  // Audio Atmosphere (Web Audio Procedural Oscillator)
  // ----------------------------------------------------
  let audioCtx = null, audioMaster = null, isSoundOn = false;
  function initAudio() {
    if (audioCtx) return;
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      audioMaster = audioCtx.createGain();
      audioMaster.gain.value = 0.2;
      audioMaster.connect(audioCtx.destination);
    } catch (e) {}
  }

  function playSfx(type) {
    if (!isSoundOn || !audioCtx) return;
    try {
      const t = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioMaster);

      if (type === 'whoosh') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(140, t);
        osc.frequency.exponentialRampToValueAtTime(420, t + 0.35);
        gain.gain.setValueAtTime(0.3, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
        osc.start(t);
        osc.stop(t + 0.5);
      } else if (type === 'chime') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(587.33, t); // D5
        osc.frequency.setValueAtTime(880, t + 0.08); // A5
        gain.gain.setValueAtTime(0.25, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.8);
        osc.start(t);
        osc.stop(t + 0.85);
      }
    } catch (e) {}
  }

  const snB = document.getElementById('sn');
  snB.onclick = () => {
    initAudio();
    isSoundOn = !isSoundOn;
    snB.textContent = isSoundOn ? '♫ SOUND: ON' : '♫ SOUND: OFF';
    if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
  };

  // ----------------------------------------------------
  // Pointer & Gesture Input System (Drag, Zoom, Pinch)
  // ----------------------------------------------------
  const pointers = new Map();
  let dragMoved = 0;
  let lastPinchDist = 0;

  function pickNode(sx, sy) {
    const wx = (sx - cam.x) / cam.k;
    const wy = (sy - cam.y) / cam.k;
    for (let i = N.length - 1; i >= 0; i--) {
      const n = N[i];
      if (Math.abs(wx - n.x) < n.w / 2 && Math.abs(wy - n.y) < n.h / 2) {
        return n;
      }
    }
    return null;
  }

  cv.addEventListener('pointerdown', e => {
    cv.setPointerCapture(e.pointerId);
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    dragMoved = 0;

    if (pointers.size === 2) {
      const pts = [...pointers.values()];
      lastPinchDist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      setFreeMode();
    }
  });

  cv.addEventListener('pointermove', e => {
    if (!pointers.has(e.pointerId)) {
      // Hover detection
      hoveredNode = pickNode(e.clientX, e.clientY);
      cv.classList.toggle('hov', !!hoveredNode);
      return;
    }

    const prev = pointers.get(e.pointerId);
    const dx = e.clientX - prev.x;
    const dy = e.clientY - prev.y;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    dragMoved += Math.hypot(dx, dy);

    if (pointers.size === 2) {
      const pts = [...pointers.values()];
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      if (lastPinchDist > 0) {
        const factor = dist / lastPinchDist;
        zoomAt((pts[0].x + pts[1].x) / 2, (pts[0].y + pts[1].y) / 2, factor);
      }
      lastPinchDist = dist;
      cam.x += dx / 2;
      cam.y += dy / 2;
    } else if (dragMoved > 4) {
      setFreeMode();
      cam.x += dx;
      cam.y += dy;
      cam.vx = dx;
      cam.vy = dy;
      cv.classList.add('drag');
    }
  });

  const onPointerUp = e => {
    if (pointers.size === 1) {
      if (dragMoved <= 6) {
        // Tap / Click action
        const clicked = pickNode(e.clientX, e.clientY);
        if (clicked) {
          goToStep(TI[clicked.id]);
        } else {
          closeNote();
        }
      }
    }
    pointers.delete(e.pointerId);
    cv.classList.remove('drag');
  };

  cv.addEventListener('pointerup', onPointerUp);
  cv.addEventListener('pointercancel', onPointerUp);

  function zoomAt(sx, sy, factor) {
    setFreeMode();
    const newK = Math.max(0.18, Math.min(2.5, cam.k * factor));
    const ratio = newK / cam.k;
    cam.x = sx - (sx - cam.x) * ratio;
    cam.y = sy - (sy - cam.y) * ratio;
    cam.k = newK;
  }

  cv.addEventListener('wheel', e => {
    e.preventDefault();
    const factor = Math.exp(-e.deltaY * 0.0018);
    zoomAt(e.clientX, e.clientY, factor);
  }, { passive: false });

  // Keyboard Navigation
  window.addEventListener('keydown', e => {
    if (e.repeat || e.metaKey || e.ctrlKey || e.altKey) return;
    const key = e.key;

    // Dismiss intro instantly
    dismissIntro();

    if (key === 'ArrowRight' || key === ' ' || key === 'Enter' || key === 'n') {
      e.preventDefault();
      goToStep(cur + 1);
    } else if (key === 'ArrowLeft' || key === 'p' || key === 'Backspace') {
      e.preventDefault();
      goToStep(cur - 1);
    } else if (key === 'o' || key === 'O') {
      e.preventDefault();
      ovB.click();
    } else if (key === 'a' || key === 'A') {
      e.preventDefault();
      auB.click();
    } else if (key === 'Escape') {
      closeNote();
    }
  });

  // ----------------------------------------------------
  // Intro Dismissal
  // ----------------------------------------------------
  const introEl = document.getElementById('intro');
  function dismissIntro() {
    if (!introEl.classList.contains('hidden')) {
      introEl.classList.add('hidden');
      goToStep(0);
    }
  }
  introEl.onclick = dismissIntro;
  setTimeout(dismissIntro, 4000); // Gentle auto-start

  // ----------------------------------------------------
  // Minimap Navigation
  // ----------------------------------------------------
  const mm = document.getElementById('mm');
  const mx = mm.getContext('2d');
  const MS = 170 / 4400;

  mm.onclick = e => {
    const r = mm.getBoundingClientRect();
    const wx = (e.clientX - r.left) / MS - 400;
    const wy = (e.clientY - r.top) / MS - 100;
    let closest = 0, minDist = 1e9;
    N.forEach(n => {
      const d = Math.hypot(n.x - wx, n.y - wy);
      if (d < minDist) { minDist = d; closest = n; }
    });
    goToStep(TI[closest.id]);
  };

  function drawMinimap() {
    mx.setTransform(DPR, 0, 0, DPR, 0, 0);
    mx.clearRect(0, 0, 170, 170);
    mx.fillStyle = isLightTheme ? '#FFFDF8' : '#0B0D1A';
    mx.fillRect(0, 0, 170, 170);

    const mapX = x => (x + 400) * MS;
    const mapY = y => (y + 100) * MS;

    // Draw wires
    E.forEach(e => {
      mx.beginPath();
      e.base.forEach((p, idx) => mx[idx ? 'lineTo' : 'moveTo'](mapX(p[0]), mapY(p[1])));
      mx.strokeStyle = e.halo + '66';
      mx.lineWidth = 1;
      mx.stroke();
    });

    // Draw nodes
    N.forEach(n => {
      const isCur = mode === 'tour' && n === byId[TOUR[cur]];
      const nw = Math.max(8, n.w * MS);
      const nh = 6;
      mx.fillStyle = n.col;
      mx.fillRect(mapX(n.x) - nw/2, mapY(n.y) - nh/2, nw, nh);
      if (isCur) {
        mx.strokeStyle = '#fff';
        mx.lineWidth = 1.5;
        mx.strokeRect(mapX(n.x) - nw/2 - 1, mapY(n.y) - nh/2 - 1, nw + 2, nh + 2);
      }
    });

    // Draw viewport bounds
    const v1 = [-cam.x / cam.k, -cam.y / cam.k];
    const v2 = [(W - cam.x) / cam.k, (H - cam.y) / cam.k];
    const vx = mapX(v1[0]);
    const vy = mapY(v1[1]);
    const vw = (v2[0] - v1[0]) * MS;
    const vh = (v2[1] - v1[1]) * MS;

    mx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    mx.fillRect(vx, vy, vw, vh);
    mx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    mx.lineWidth = 1.2;
    mx.strokeRect(vx, vy, vw, vh);
  }

  // ----------------------------------------------------
  // Main Render Engine (Canvas 2D with 2.5D Perspective)
  // ----------------------------------------------------
  function render(time) {
    const t = time / 1000;
    const dt = Math.min(0.05, t - (lastTime || t));
    lastTime = t;

    camStep(dt);

    // Auto-tour pacing
    if (autoPlay && mode === 'tour' && !TW && t - arriveAt > 7.5) {
      goToStep((cur + 1) % TOUR.length);
    }

    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

    // Dynamic background fill
    ctx.fillStyle = isLightTheme ? '#FFF9EE' : '#07080F';
    ctx.fillRect(0, 0, W, H);

    // Celestial Grid / Blueprint Dot Matrix
    const stepGrid = 40 * cam.k;
    const ox = ((cam.x % stepGrid) + stepGrid) % stepGrid;
    const oy = ((cam.y % stepGrid) + stepGrid) % stepGrid;
    ctx.fillStyle = isLightTheme ? '#E5DCC5' : '#1D2038';
    for (let x = ox; x < W; x += stepGrid) {
      for (let y = oy; y < H; y += stepGrid) {
        ctx.fillRect(x - 1, y - 1, 2, 2);
      }
    }

    // ----------------------------------------------------
    // Apply 2.5D Camera Perspective Gimbal Matrix
    // ----------------------------------------------------
    ctx.save();
    // Center at viewport origin
    ctx.translate(W / 2, H / 2);
    // Apply dynamic flight banking (roll)
    ctx.rotate(cam.roll);
    // Apply 2.5D perspective shear/tilt
    ctx.transform(1, cam.pitch * 0.4, cam.roll * 0.4, 1, 0, 0);
    // Apply scale & camera pan
    ctx.scale(cam.k, cam.k);
    ctx.translate((cam.x - W/2) / cam.k, (cam.y - H/2) / cam.k);

    const b = Math.floor(t * 4) % 3;

    // Draw Connecting Energy Cables
    E.forEach(e => {
      const isTourEdge = mode === 'tour' && (e.a === byId[TOUR[cur]] || e.b === byId[TOUR[cur]]);
      ctx.save();
      ctx.lineJoin = ctx.lineCap = 'round';

      // Animated glowing halo
      if (isTourEdge) {
        ctx.shadowColor = e.halo;
        ctx.shadowBlur = 24;
        ctx.strokeStyle = e.halo;
        ctx.lineWidth = 10;
        ctx.globalAlpha = 0.6;
        ctx.stroke(e.sh[b][0]);
        ctx.shadowBlur = 0;
      }

      ctx.globalAlpha = isTourEdge ? 1 : 0.65;
      ctx.strokeStyle = isLightTheme ? '#111' : '#F4EBD9';
      ctx.lineWidth = 2.8;
      ctx.stroke(e.sh[b][0]);

      // Flowing energy comets along wire
      e.ph.forEach((p, pIdx) => {
        const prog = (p + t * 0.35) % 1;
        const ptIdx = Math.min(59, Math.floor(prog * 60));
        const pt = e.base[ptIdx];
        if (pt) {
          ctx.beginPath();
          ctx.arc(pt[0], pt[1], isTourEdge ? 5.5 : 3.5, 0, 6.3);
          ctx.fillStyle = e.halo;
          ctx.fill();
        }
      });
      ctx.restore();
    });

    // Draw Architecture Nodes
    N.forEach(n => {
      if (!n.sh[b]) n.sh[b] = shape(n, b);
      const s = n.sh[b];
      const isFocused = mode === 'tour' && n === byId[TOUR[cur]];
      const isHover = n === hoveredNode;

      ctx.save();
      ctx.translate(n.x, n.y);

      // Node shadow offset (Neobrutalism)
      ctx.save();
      ctx.translate(6, 6);
      ctx.fillStyle = '#111';
      ctx.fill(s.cl);
      ctx.restore();

      // Card body
      if (isFocused) {
        ctx.shadowColor = n.col;
        ctx.shadowBlur = 40;
      }
      ctx.fillStyle = PAPER;
      ctx.fill(s.cl);
      ctx.shadowBlur = 0;

      // Tint fill
      ctx.fillStyle = n.col + '35';
      ctx.fill(s.cl);

      // Borders
      ctx.strokeStyle = INK;
      ctx.lineWidth = isFocused ? 3.6 : 2.6;
      ctx.lineJoin = ctx.lineCap = 'round';
      ctx.stroke(s.o[0]);

      // Category / Step Tag
      const w = n.w / 2, h = n.h / 2;
      ctx.save();
      ctx.translate(-w + 24, -h + 20);
      ctx.fillStyle = n.col;
      ctx.fillRect(0, 0, 48, 20);
      ctx.strokeStyle = INK;
      ctx.lineWidth = 1.8;
      ctx.strokeRect(0, 0, 48, 20);
      ctx.font = MONO(800, 11);
      ctx.fillStyle = INK;
      ctx.textAlign = 'center';
      ctx.fillText(String(n.i + 1).padStart(2, '0'), 24, 14);
      ctx.restore();

      // Icon
      drawIcon(n, w - 36, -h + 36, t);

      // Text labels
      ctx.font = F(700, 27);
      ctx.fillStyle = INK;
      ctx.textAlign = 'left';
      ctx.fillText(n.t, -w + 84, -h + 36);

      ctx.font = F(600, 21);
      ctx.fillStyle = '#222';
      ctx.fillText(n.s[0], -w + 24, -h + 84);
      ctx.fillText(n.s[1], -w + 24, -h + 116);

      ctx.restore();
    });

    ctx.restore();

    // Update active note position smoothly
    positionNote();

    // Render Minimap
    drawMinimap();

    requestAnimationFrame(render);
  }

  // Keyboard shortcut listener for closing inside iframe
  window.addEventListener('keydown', e => {
    const isClose = e.key === 'Escape' ||
      (e.altKey && (e.key === 'a' || e.key === 'A')) ||
      ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'm' || e.key === 'M' || e.key === 'a' || e.key === 'A'));
    if (isClose) {
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({ type: 'CLOSE_FLOWCHART' }, '*');
      }
    }
  });

  // Telemetry hook
  window.__debugCam = () => ({ ...cam, mode, cur, isNoteOpen: noteEl.classList.contains('on') });

  // Start loop
  fit();
  updateHud();
  requestAnimationFrame(render);
})();
</script>
</body>
</html>
`;

const targetFiles = [
  path.join(ROOT, 'public', 'architecture-flowchart.html'),
  path.join(ROOT, 'public', 'daily-verdict-flowchart-v8.html'),
  path.join(ROOT, 'Daily Verdict_ one evening, one honest minute.html')
];

const htmlContent = buildHtml();
targetFiles.forEach(file => {
  fs.writeFileSync(file, htmlContent, 'utf-8');
  console.log(`✅ Updated ${file}`);
});
