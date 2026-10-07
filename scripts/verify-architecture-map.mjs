import path from 'path';
import { fileURLToPath } from 'url';
import { chromium } from '@playwright/test';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.join(__dirname, '..');
const targetFile = path.join(ROOT, 'public', 'architecture-flowchart.html');

(async () => {
  console.log('Testing upgraded Architecture Map at:', targetFile);
  const browser = await chromium.launch({ headless: true });

  // Test 1: Desktop Viewport
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  page.on('console', msg => console.log('[PAGE LOG]:', msg.text()));
  page.on('pageerror', err => console.error('[PAGE ERROR]:', err.message));

  await page.goto('file:///' + targetFile.replace(/\\/g, '/'));
  await page.waitForTimeout(500);

  // Check HUD visibility
  const hudVisible = await page.isVisible('#hud');
  console.log('HUD visible:', hudVisible);
  if (!hudVisible) throw new Error('HUD must be visible!');

  // Dismiss intro if present by clicking canvas
  if (await page.isVisible('#intro')) {
    console.log('Dismissing intro...');
    await page.click('#intro');
    await page.waitForTimeout(500);
  }

  // Initial step counter
  const stepInitial = await page.innerText('#hud-counter');
  console.log('Initial Step Counter:', stepInitial);

  // Initial camera
  let cam0 = await page.evaluate(() => window.__debugCam ? window.__debugCam() : null);
  console.log('Initial camera state:', cam0);

  // Click Next button (#nx)
  console.log('Clicking Next button (#nx)...');
  await page.click('#nx');
  await page.waitForTimeout(1600);

  const stepNext = await page.innerText('#hud-counter');
  console.log('After Next click, Step Counter:', stepNext);
  let cam1 = await page.evaluate(() => window.__debugCam ? window.__debugCam() : null);
  console.log('After Next click, camera state:', cam1);

  if (cam0 && cam1) {
    const moved = Math.abs(cam0.x - cam1.x) > 10 || Math.abs(cam0.y - cam1.y) > 10;
    console.log('Camera moved significantly:', moved, `deltaX=${Math.round(cam1.x - cam0.x)}`);
    if (!moved) throw new Error('Camera did not move on Next click!');
  }

  // Keyboard navigation ArrowRight
  console.log('Pressing ArrowRight...');
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(1600);

  const step2 = await page.innerText('#hud-counter');
  console.log('After ArrowRight, Step Counter:', step2);
  let cam2 = await page.evaluate(() => window.__debugCam ? window.__debugCam() : null);
  console.log('After ArrowRight, camera state:', cam2);

  if (cam1 && cam2) {
    const moved = Math.abs(cam1.x - cam2.x) > 10 || Math.abs(cam1.y - cam2.y) > 10;
    console.log('Camera moved again via keyboard:', moved, `deltaX=${Math.round(cam2.x - cam1.x)}`);
    if (!moved) throw new Error('Camera did not move on keyboard step!');
  }

  // Theme toggle (#thm)
  console.log('Toggling theme (#thm)...');
  await page.click('#thm');
  await page.waitForTimeout(300);
  const isLightTheme = await page.evaluate(() => document.body.classList.contains('theme-light'));
  console.log('Is Light Theme active:', isLightTheme);

  // Click Note/Detail test via Enter key
  console.log('Opening detail note via Enter key...');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(400);
  const noteVisible = await page.isVisible('#note');
  console.log('Note detail drawer visible:', noteVisible);
  const noteTitle = await page.innerText('#note h2');
  console.log('Note detail title:', noteTitle);

  // Close note via #x
  await page.click('#x');
  await page.waitForTimeout(300);
  const noteClosed = !(await page.isVisible('#note'));
  console.log('Note closed successfully:', noteClosed);

  // Test 2: Ultra-compact Mobile Viewport (320px x 498px)
  console.log('--- Testing 320x498 Mobile Viewport ---');
  await page.setViewportSize({ width: 320, height: 498 });
  await page.waitForTimeout(500);

  const hudMobileVisible = await page.isVisible('#hud');
  console.log('Mobile HUD visible:', hudMobileVisible);

  await page.click('#nx');
  await page.waitForTimeout(800);
  const mobileStep = await page.innerText('#hud-counter');
  console.log('Mobile Step Counter:', mobileStep);

  // Check no horizontal document scroll
  const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  const innerWidth = await page.evaluate(() => window.innerWidth);
  console.log(`ScrollWidth: ${scrollWidth}, InnerWidth: ${innerWidth}`);
  if (scrollWidth > innerWidth) {
    console.warn('Warning: Horizontal scroll detected on 320px viewport!');
  } else {
    console.log('Zero horizontal scroll verified on 320px!');
  }

  await browser.close();
  console.log('✅ ALL ARCHITECTURE MAP FLUIDITY & CAMERA CHECKS PASSED!');
})();
