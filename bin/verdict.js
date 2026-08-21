#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';

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
  verdict                          Open the app directly in your browser
  verdict log <1-5> [note...]      Quickly record today's mood rating & note
  verdict status                   View streak and today's logged verdict
  verdict dev                      Start background servers & launch browser

Examples:
  verdict log 5 Crushed all goals today!
  verdict log 1 Failed accounts exam, terrible morning
  verdict status
  verdict
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

// Open Browser / Start Server
console.log(`⚡ Launching Daily Verdict...`);
const startCmd = process.platform === 'win32' ? 'start http://localhost:5173' : 'open http://localhost:5173';
exec(startCmd, (err) => {
  if (err) {
    console.log(`Could not launch browser automatically. Open http://localhost:5173 in your browser.`);
  } else {
    console.log(`Opened http://localhost:5173`);
  }
});
