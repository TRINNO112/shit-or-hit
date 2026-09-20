#!/usr/bin/env node
/**
 * ⚡ TRINNO LIVE PRODUCTION BENCHMARK & COMPARISON PIPELINE
 * Benchmarks live deployed URLs (e.g. https://daily-verdict.netlify.app)
 * against industry standards set by Google & Amazon.
 *
 * Metrics Measured:
 * - TTFB (Time To First Byte)
 * - FCP (First Contentful Paint)
 * - DOMContentLoaded (DCL)
 * - Window Load Event (LOAD)
 * - Network Idle Duration
 * - Resource breakdown & critical path bottlenecks
 */

import { chromium } from '@playwright/test';

const TARGET_URL = process.argv[2] || 'https://daily-verdict.netlify.app';

// Industry benchmark thresholds (Google Core Web Vitals & Amazon speed goals)
const BENCHMARKS = {
  GOOGLE: {
    ttfb: 200,      // < 200ms
    fcp: 800,       // < 800ms (Good)
    dcl: 1000,      // < 1000ms
    load: 1500      // < 1500ms
  },
  AMAZON: {
    ttfb: 300,      // < 300ms
    fcp: 1000,      // < 1000ms (Sub-second target)
    dcl: 1400,      // < 1400ms
    load: 2000      // < 2000ms
  }
};

function formatDuration(ms) {
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

function gradeMetric(value, targetGoogle, targetAmazon) {
  if (value <= targetGoogle) {
    return '[EXCEEDS GOOGLE TIER]';
  } else if (value <= targetAmazon) {
    return '[EXCEEDS AMAZON TIER]';
  } else {
    return '[NEEDS ATTENTION]';
  }
}

async function runLiveBenchmark() {
  console.log('\n======================================================================');
  console.log('⚡ TRINNO AUTOMATED PRODUCTION SPEED BENCHMARK');
  console.log(`🌐 Target Deployment: ${TARGET_URL}`);
  console.log(`🕒 Timestamp:         ${new Date().toISOString()}`);
  console.log('======================================================================\n');

  console.log('🚀 Launching Headless Chromium & Profiling Network Activity...');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'
  });

  const page = await context.newPage();

  const resources = [];
  page.on('response', async (response) => {
    try {
      const request = response.request();
      const timing = request.timing();
      const url = response.url();
      const status = response.status();
      const contentType = response.headers()['content-type'] || '';
      const size = (await response.body().catch(() => Buffer.alloc(0))).length;

      resources.push({
        url,
        status,
        contentType,
        size,
        duration: timing ? Math.max(0, timing.responseEnd) : 0
      });
    } catch (e) {}
  });

  const wallClockStart = Date.now();

  try {
    await page.goto(TARGET_URL, { waitUntil: 'load', timeout: 30000 });
  } catch (err) {
    console.error(`❌ Failed to navigate to ${TARGET_URL}:`, err.message);
    await browser.close();
    process.exit(1);
  }

  const pageLoadWallTime = Date.now() - wallClockStart;

  // Measure performance timings via Navigation & Paint Timing API
  const metrics = await page.evaluate(() => {
    const nav = performance.getEntriesByType('navigation')[0] || {};
    const paints = performance.getEntriesByType('paint') || [];
    const fcpEntry = paints.find(p => p.name === 'first-contentful-paint');
    const fpEntry = paints.find(p => p.name === 'first-paint');

    const ttfb = nav.responseStart ? nav.responseStart - nav.requestStart : 0;
    const domInteractive = nav.domInteractive ? nav.domInteractive - nav.requestStart : 0;
    const domContentLoaded = nav.domContentLoadedEventEnd ? nav.domContentLoadedEventEnd - nav.requestStart : 0;
    const loadEvent = nav.loadEventEnd ? nav.loadEventEnd - nav.requestStart : 0;
    const fcp = fcpEntry ? fcpEntry.startTime : (domInteractive || ttfb);
    const fp = fpEntry ? fpEntry.startTime : fcp;

    return {
      ttfb: Math.max(0, ttfb),
      fp: Math.max(0, fp),
      fcp: Math.max(0, fcp),
      domInteractive: Math.max(0, domInteractive),
      domContentLoaded: Math.max(0, domContentLoaded),
      loadEvent: Math.max(0, loadEvent),
      transferSize: nav.transferSize || 0,
      encodedBodySize: nav.encodedBodySize || 0
    };
  });

  await browser.close();

  // Sort resources by duration
  resources.sort((a, b) => b.duration - a.duration);

  console.log('\n--- [1/3] REAL-USER WEB VITALS TIMINGS ---');
  console.log(`  - Time To First Byte (TTFB):   ${formatDuration(metrics.ttfb).padEnd(10)} ${gradeMetric(metrics.ttfb, BENCHMARKS.GOOGLE.ttfb, BENCHMARKS.AMAZON.ttfb)}`);
  console.log(`  - First Paint (FP):             ${formatDuration(metrics.fp).padEnd(10)}`);
  console.log(`  - First Contentful Paint (FCP): ${formatDuration(metrics.fcp).padEnd(10)} ${gradeMetric(metrics.fcp, BENCHMARKS.GOOGLE.fcp, BENCHMARKS.AMAZON.fcp)}`);
  console.log(`  - DOM Content Loaded (DCL):     ${formatDuration(metrics.domContentLoaded).padEnd(10)} ${gradeMetric(metrics.domContentLoaded, BENCHMARKS.GOOGLE.dcl, BENCHMARKS.AMAZON.dcl)}`);
  console.log(`  - Complete Window Load (LOAD):  ${formatDuration(metrics.loadEvent).padEnd(10)} ${gradeMetric(metrics.loadEvent, BENCHMARKS.GOOGLE.load, BENCHMARKS.AMAZON.load)}`);
  console.log(`  - Total Wall-Clock Navigation:  ${formatDuration(pageLoadWallTime).padEnd(10)}`);

  console.log('\n--- [2/3] COMPARISON AGAINST INDUSTRY STANDARDS ---');
  console.log('  METRIC               SHIT OR HIT     GOOGLE STANDARD   AMAZON TARGET     STATUS');
  console.log('  ---------------------------------------------------------------------------------');
  
  const printRow = (name, val, google, amazon) => {
    const vStr = formatDuration(val).padEnd(15);
    const gStr = (`< ${formatDuration(google)}`).padEnd(18);
    const aStr = (`< ${formatDuration(amazon)}`).padEnd(18);
    let status = 'OPTIMAL';
    if (val > amazon) status = 'OVER_BUDGET';
    else if (val > google) status = 'ACCEPTABLE';
    console.log(`  ${name.padEnd(20)} ${vStr} ${gStr} ${aStr} [${status}]`);
  };

  printRow('TTFB (Server Latency)', metrics.ttfb, BENCHMARKS.GOOGLE.ttfb, BENCHMARKS.AMAZON.ttfb);
  printRow('FCP (First Visual)', metrics.fcp, BENCHMARKS.GOOGLE.fcp, BENCHMARKS.AMAZON.fcp);
  printRow('DCL (DOM Ready)', metrics.domContentLoaded, BENCHMARKS.GOOGLE.dcl, BENCHMARKS.AMAZON.dcl);
  printRow('LOAD (Interactive)', metrics.loadEvent, BENCHMARKS.GOOGLE.load, BENCHMARKS.AMAZON.load);

  console.log('\n--- [3/3] HEAVIEST & SLOWEST ASSETS ANALYZED ---');
  const topSlow = resources.slice(0, 8);
  topSlow.forEach((r, idx) => {
    const shortUrl = r.url.length > 70 ? '...' + r.url.slice(-67) : r.url;
    const sizeKb = r.size ? `${Math.round(r.size / 1024)} KB` : 'Cached/0KB';
    const durStr = r.duration > 0 ? `${Math.round(r.duration)}ms` : 'N/A';
    console.log(`  [#${idx + 1}] ${durStr.padEnd(8)} | ${sizeKb.padEnd(12)} | ${shortUrl}`);
  });

  console.log('\n======================================================================');
  if (metrics.fcp <= BENCHMARKS.GOOGLE.fcp) {
    console.log('✨ OUTSTANDING: Your application First Contentful Paint beats Google standards!');
  } else if (metrics.fcp <= BENCHMARKS.AMAZON.fcp) {
    console.log('✅ EXCELLENT: Your application loading speed matches Amazon modern web targets!');
  } else {
    console.log('⚠️ ADVISORY: First paint has opportunities for optimization (see slowest assets above).');
  }
  console.log('======================================================================\n');
}

runLiveBenchmark().catch((err) => {
  console.error('Benchmark execution error:', err);
  process.exit(1);
});
