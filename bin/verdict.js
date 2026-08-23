#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec, spawn } from 'child_process';
import net from 'net';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '..');
const DATA_FILE = path.join(ROOT_DIR, 'data', 'entries.json');

const args = process.argv.slice(2);
const command = args[0] ? args[0].toLowerCase() : 'open';

function getTodayString() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function readData() {
  if (!fs.existsSync(DATA_FILE)) {
    return { version: '1.0', startDate: getTodayString(), entries: {} };
  }
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
}

function saveData(data) {
  data.lastUpdated = new Date().toISOString();
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

const ratingTitles = {
  1: 'Rough (1/5)',
  2: 'Down (2/5)',
  3: 'Okay (3/5)',
  4: 'Good (4/5)',
  5: 'Peak (5/5)'
};

// Help menu
if (command === 'help' || command === '--help' || command === '-h') {
  console.log(`
⚡ DAILY VERDICT CLI ⚡

Usage:
  verdict                          Auto-start dev servers & launch web app in browser
  verdict dev                      Start development servers and launch browser
  verdict log <1-5> [note...]      Quickly record today's mood rating & note
  verdict status                   View streak and today's logged verdict
  verdict help                     Display this help message

Examples:
  verdict
  verdict log 5 Crushed all goals today!
  verdict log 1 Rough day, reset tomorrow
  verdict status
`);
  process.exit(0);
}

// Log mood directly from CLI
if (command === 'log' || command === 'rate' || command === 'set') {
  const rating = parseInt(args[1], 10);
  if (isNaN(rating) || rating < 1 || rating > 5) {
    console.log(`❌ Invalid rating. Please choose 1 to 5:`);
    console.log(`  1: Rough | 2: Down | 3: Okay | 4: Good | 5: Peak`);
    console.log(`Example: verdict log 4 Had a dialed-in day!`);
    process.exit(1);
  }

  const notes = args.slice(2).join(' ') || '';
  const todayStr = getTodayString();
  const db = readData();

  if (!db.entries) db.entries = {};
  if (!db.startDate) db.startDate = todayStr;

  const existing = db.entries[todayStr] || {};
  db.entries[todayStr] = {
    ...existing,
    date: todayStr,
    rating,
    verdict: ratingTitles[rating].split(' ')[0],
    notes: notes || existing.notes || '',
    updatedAt: new Date().toISOString(),
    createdAt: existing.createdAt || new Date().toISOString()
  };

  saveData(db);
  console.log(`\n⚡ Verdict recorded for today (${todayStr})!`);
  console.log(`Rating: ${ratingTitles[rating]}`);
  if (notes) console.log(`Reflection: "${notes}"`);
  console.log(`Database saved into: ${DATA_FILE}\n`);
  process.exit(0);
}

// Check status
if (command === 'status' || command === 'info') {
  const todayStr = getTodayString();
  const db = readData();
  const entry = db.entries?.[todayStr];
  const total = Object.keys(db.entries || {}).length;

  console.log(`\n⚡ DAILY VERDICT STATUS`);
  console.log(`------------------------------`);
  console.log(`Start Date: ${db.startDate || todayStr}`);
  console.log(`Total Days Logged: ${total}`);
  if (entry) {
    console.log(`Today's Verdict: ${entry.verdict} (${entry.rating}/5)`);
    if (entry.notes) console.log(`Today's Note: "${entry.notes}"`);
  } else {
    console.log(`Today's Verdict: PENDING (use 'verdict log <1-5> [note]')`);
  }
  console.log(`------------------------------\n`);
  process.exit(0);
}

// Helper: check if port is open
function checkPortOpen(port, host = '127.0.0.1') {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(400);
    socket.on('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.on('error', () => {
      socket.destroy();
      resolve(false);
    });
    socket.connect(port, host);
  });
}

function openBrowser(url) {
  const startCmd = process.platform === 'win32'
    ? `start ${url}`
    : process.platform === 'darwin'
    ? `open ${url}`
    : `xdg-open ${url}`;

  exec(startCmd, (err) => {
    if (err) {
      console.log(`⚠️  Could not launch browser automatically. Please open ${url} manually.`);
    } else {
      console.log(`🌐 Browser launched: ${url}`);
    }
  });
}

// Main Launcher
async function launchApp() {
  const APP_PORT = 5173;
  const BACKEND_PORT = 5001;
  const APP_URL = `http://localhost:${APP_PORT}`;

  const isFrontendRunning = await checkPortOpen(APP_PORT);
  const isBackendRunning = await checkPortOpen(BACKEND_PORT);

  if (isFrontendRunning && isBackendRunning) {
    console.log(`⚡ Daily Verdict dev servers are already active!`);
    console.log(`🌐 Opening ${APP_URL}...`);
    openBrowser(APP_URL);
    return;
  }

  console.log(`\n==================================================`);
  console.log(`⚡ STARTING DAILY VERDICT DEVELOPMENT ENVIRONMENT`);
  console.log(`==================================================`);
  console.log(`🚀 Booting Frontend (Vite) & Backend (Express)...`);
  console.log(`🌐 Web App:  ${APP_URL}`);
  console.log(`📡 Backend:  http://localhost:${BACKEND_PORT}`);
  console.log(`--------------------------------------------------\n`);

  const nodeExec = process.execPath;
  const viteBin = path.join(ROOT_DIR, 'node_modules', 'vite', 'bin', 'vite.js');
  const serverScript = path.join(ROOT_DIR, 'server', 'index.js');

  const children = [];

  // Start Backend Express Server
  if (!isBackendRunning) {
    const backendChild = spawn(nodeExec, [serverScript], {
      cwd: ROOT_DIR,
      stdio: 'inherit',
      env: { ...process.env }
    });
    children.push(backendChild);
  }

  // Start Frontend Vite Server
  if (!isFrontendRunning) {
    let frontendChild;
    if (fs.existsSync(viteBin)) {
      frontendChild = spawn(nodeExec, [viteBin, '--force'], {
        cwd: ROOT_DIR,
        stdio: 'inherit',
        env: { ...process.env }
      });
    } else {
      frontendChild = spawn('npx', ['vite', '--force'], {
        cwd: ROOT_DIR,
        stdio: 'inherit',
        shell: true,
        env: { ...process.env }
      });
    }
    children.push(frontendChild);
  }

  // Watch for server to be ready and trigger browser
  let browserOpened = false;
  const pollTimer = setInterval(async () => {
    if (browserOpened) {
      clearInterval(pollTimer);
      return;
    }
    const ready = await checkPortOpen(APP_PORT);
    if (ready) {
      browserOpened = true;
      clearInterval(pollTimer);
      console.log(`\n🟢 Dev server is live! Opening browser...`);
      openBrowser(APP_URL);
    }
  }, 400);

  // Safety fallback after 15s
  setTimeout(() => {
    if (!browserOpened) {
      clearInterval(pollTimer);
      console.log(`\n⚠️  Opening browser at ${APP_URL}...`);
      openBrowser(APP_URL);
    }
  }, 15000);

  // Handle termination signals
  const cleanup = () => {
    children.forEach((child) => {
      if (child && !child.killed) {
        if (process.platform === 'win32') {
          try {
            exec(`taskkill /pid ${child.pid} /T /F`, () => {});
          } catch (e) {}
        } else {
          child.kill('SIGINT');
        }
      }
    });
    process.exit(0);
  };

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
}

launchApp();
