#!/usr/bin/env node
/**
 * 🗄️ DATABASE INTEGRITY & RECONCILIATION INVARIANT AUDIT
 * Strictly read-only analysis of data/entries.json & data/reports.json,
 * verifying schema invariants, data integrity, and conflict resolution rules.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '..');
const DATA_DIR = path.join(ROOT_DIR, 'data');
const ENTRIES_PATH = path.join(DATA_DIR, 'entries.json');
const REPORTS_PATH = path.join(DATA_DIR, 'reports.json');

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ [DB-AUDIT] PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ❌ [DB-AUDIT] FAIL: ${message}`);
    failed++;
  }
}

console.log('\n======================================================================');
console.log('🏛️  EXECUTING DATABASE SCHEMA & RECONCILIATION INTEGRITY AUDIT');
console.log('======================================================================\n');

// ---------------------------------------------------------------------------
// SUITE 1: Active User Diary Database (data/entries.json) Schema Invariants
// ---------------------------------------------------------------------------
console.log('📖 [1/3] Auditing data/entries.json Schema & Type Invariants (READ-ONLY)...');

assert(fs.existsSync(ENTRIES_PATH), 'data/entries.json exists on disk');

const rawEntries = fs.readFileSync(ENTRIES_PATH, 'utf-8');
let entriesDb;
try {
  entriesDb = JSON.parse(rawEntries);
  assert(true, 'data/entries.json is valid parseable JSON');
} catch (err) {
  assert(false, `data/entries.json JSON parse failed: ${err.message}`);
}

assert(entriesDb?.version === '1.0', 'Database format version is 1.0');
assert(typeof entriesDb?.entries === 'object' && entriesDb?.entries !== null, 'Entries container is a valid dictionary object');

const entryKeys = Object.keys(entriesDb?.entries || {});
assert(entryKeys.length > 0, `Database contains ${entryKeys.length} logged diary entries`);

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const VALID_VERDICTS = new Set(['Rough', 'Down', 'Okay', 'Good', 'Hit', 'Peak']);

let malformedDates = 0;
let keyMismatches = 0;
let invalidRatings = 0;
let invalidVerdicts = 0;
let sphereAnomalies = 0;
let timestampAnomalies = 0;

entryKeys.forEach(dateKey => {
  const item = entriesDb.entries[dateKey];

  // 1. Date string matches YYYY-MM-DD
  if (!DATE_REGEX.test(dateKey) || !DATE_REGEX.test(item.date)) {
    malformedDates++;
  }

  // 2. Key matches internal date
  if (dateKey !== item.date) {
    keyMismatches++;
  }

  // 3. Rating is integer 1..5
  const r = item.rating;
  if (!Number.isInteger(r) || r < 1 || r > 5) {
    invalidRatings++;
  }

  // 4. Verdict is valid
  if (!VALID_VERDICTS.has(item.verdict)) {
    invalidVerdicts++;
  }

  // 5. Spheres invariant
  if (item.spheres !== undefined) {
    if (typeof item.spheres !== 'object' || item.spheres === null) {
      sphereAnomalies++;
    } else {
      Object.entries(item.spheres).forEach(([sId, sData]) => {
        if (!sData || typeof sData !== 'object' || !sData.id) {
          sphereAnomalies++;
        }
        if (sData.rating !== null && sData.rating !== undefined) {
          const sR = Number(sData.rating);
          if (isNaN(sR) || sR < 1 || sR > 5) {
            sphereAnomalies++;
          }
        }
      });
    }
  }

  // 6. Timestamps
  if (item.createdAt && isNaN(new Date(item.createdAt).getTime())) {
    timestampAnomalies++;
  }
  if (item.updatedAt && isNaN(new Date(item.updatedAt).getTime())) {
    timestampAnomalies++;
  }
});

assert(malformedDates === 0, 'All entry keys & internal dates match ISO YYYY-MM-DD pattern');
assert(keyMismatches === 0, 'All entry keys strictly equal internal entry.date property');
assert(invalidRatings === 0, 'All entry ratings are valid discrete integers in range [1..5]');
assert(invalidVerdicts === 0, 'All entry verdicts conform to standard taxonomy (Rough, Down, Okay, Good, Hit, Peak)');
assert(sphereAnomalies === 0, 'All life sphere objects conform to schema with null-safe or [1..5] ratings');
assert(timestampAnomalies === 0, 'All createdAt/updatedAt fields are valid parseable ISO timestamps');

// ---------------------------------------------------------------------------
// SUITE 2: Monthly Intelligence Reports Database (data/reports.json)
// ---------------------------------------------------------------------------
console.log('\n📊 [2/3] Auditing data/reports.json Dossier Schema Invariants (READ-ONLY)...');

assert(fs.existsSync(REPORTS_PATH), 'data/reports.json exists on disk');

const rawReports = fs.readFileSync(REPORTS_PATH, 'utf-8');
let reportsDb;
try {
  reportsDb = JSON.parse(rawReports);
  assert(true, 'data/reports.json is valid parseable JSON');
} catch (err) {
  assert(false, `data/reports.json JSON parse failed: ${err.message}`);
}

const reportKeys = Object.keys(reportsDb || {});
assert(reportKeys.length > 0, `Database contains ${reportKeys.length} monthly intelligence dossiers`);

let reportSchemaErrors = 0;
reportKeys.forEach(rKey => {
  const rep = reportsDb[rKey];
  if (!rep.monthName || typeof rep.year !== 'number' || typeof rep.month !== 'number') {
    reportSchemaErrors++;
  }
  if (typeof rep.hitRate === 'number' && (rep.hitRate < 0 || rep.hitRate > 100)) {
    reportSchemaErrors++;
  }
  if (typeof rep.avgScore === 'number' && (rep.avgScore < 1.0 || rep.avgScore > 5.0) && rep.avgScore !== 0) {
    reportSchemaErrors++;
  }
  if (!rep.ratingCounts || typeof rep.ratingCounts !== 'object') {
    reportSchemaErrors++;
  }
});

assert(reportSchemaErrors === 0, 'All monthly intelligence reports satisfy schema, hitRate (0..100), and avgScore (1..5)');

// ---------------------------------------------------------------------------
// SUITE 3: Reconciliation Engine Mathematical & Data Protection Proofs
// ---------------------------------------------------------------------------
console.log('\n🛡️ [3/3] Verifying Multi-Source Conflict Reconciliation Rules...');

function reconcileEntryItems(baseItem, candidateItem) {
  if (!baseItem) return candidateItem;
  if (!candidateItem) return baseItem;

  const baseNotes = (baseItem.notes || '').trim();
  const candNotes = (candidateItem.notes || '').trim();

  // Rule 1: Base has rich notes, candidate has blank notes -> NEVER wipe base notes!
  if (baseNotes && !candNotes) {
    const baseRating = Number(baseItem.rating);
    const candRating = Number(candidateItem.rating);
    return {
      ...candidateItem,
      notes: baseItem.notes, // Absolute note protection
      rating: (candRating === 3 && baseRating !== 3) ? baseRating : (candidateItem.rating ?? baseItem.rating),
      verdict: (candRating === 3 && baseRating !== 3) ? baseItem.verdict : (candidateItem.verdict ?? baseItem.verdict),
      spheres: candidateItem.spheres || baseItem.spheres
    };
  }

  // Rule 2: Base has blank notes, candidate has rich notes -> candidate has authentic new notes
  if (!baseNotes && candNotes) {
    return candidateItem;
  }

  // Rule 3: Both have notes -> timestamp determines the winner
  if (baseNotes && candNotes) {
    const baseTime = new Date(baseItem.updatedAt || baseItem.createdAt || 0).getTime();
    const candTime = new Date(candidateItem.updatedAt || candidateItem.createdAt || 0).getTime();
    if (baseTime >= candTime) {
      return baseItem;
    }
    return candidateItem;
  }

  // Rule 4: Neither has notes -> non-default rating protection
  const baseRating = Number(baseItem.rating);
  const candRating = Number(candidateItem.rating);
  if (baseRating && baseRating !== 3 && candRating === 3) {
    return baseItem;
  }

  const baseTime = new Date(baseItem.updatedAt || baseItem.createdAt || 0).getTime();
  const candTime = new Date(candidateItem.updatedAt || candidateItem.createdAt || 0).getTime();
  return candTime > baseTime ? candidateItem : baseItem;
}

// Invariant R1: Rich notes can NEVER be erased by empty incoming notes
const protectedEntry = reconcileEntryItems(
  { date: '2026-09-01', rating: 1, verdict: 'Rough', notes: 'Very important diary entry with deep reflection' },
  { date: '2026-09-01', rating: 3, verdict: 'Okay', notes: '' }
);
assert(
  protectedEntry.notes === 'Very important diary entry with deep reflection' && protectedEntry.rating === 1,
  'Reconciliation Rule 1: Candidate with empty notes cannot wipe base reflection notes or demote rating'
);

// Invariant R2: Fresh incoming notes replace blank base notes
const upgradedEntry = reconcileEntryItems(
  { date: '2026-09-02', rating: 4, verdict: 'Good', notes: '' },
  { date: '2026-09-02', rating: 4, verdict: 'Good', notes: 'New authentic notes typed on mobile' }
);
assert(
  upgradedEntry.notes === 'New authentic notes typed on mobile',
  'Reconciliation Rule 2: Candidate with new reflection notes seamlessly upgrades empty base'
);

// Invariant R3: Timestamp conflict resolution when both have notes
const olderBase = { date: '2026-09-03', rating: 4, notes: 'Old draft', updatedAt: '2026-09-03T10:00:00Z' };
const newerCand = { date: '2026-09-03', rating: 5, notes: 'Refined draft', updatedAt: '2026-09-03T12:00:00Z' };
const resolvedWinner = reconcileEntryItems(olderBase, newerCand);
assert(
  resolvedWinner.notes === 'Refined draft' && resolvedWinner.rating === 5,
  'Reconciliation Rule 3: Later timestamp accurately supersedes earlier draft'
);

// Invariant R4: Rating protection when neither has notes and candidate defaults to 3
const ratingProtected = reconcileEntryItems(
  { date: '2026-09-04', rating: 5, verdict: 'Peak', notes: '' },
  { date: '2026-09-04', rating: 3, verdict: 'Okay', notes: '' }
);
assert(
  ratingProtected.rating === 5 && ratingProtected.verdict === 'Peak',
  'Reconciliation Rule 4: Non-default rating 5★ protected against demotion to default 3★'
);

// ---------------------------------------------------------------------------
// REPORT
// ---------------------------------------------------------------------------
console.log('\n======================================================================');
console.log(`📊 DATABASE INTEGRITY AUDIT: ${passed} PASSED | ${failed} FAILED`);
console.log('======================================================================\n');

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
