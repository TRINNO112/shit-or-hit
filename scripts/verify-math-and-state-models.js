#!/usr/bin/env node
/**
 * 🧮 MATHEMATICAL & DYNAMIC STATE MODEL VERIFICATION ENGINE
 * Offline evaluation of Life Spheres, Non-Negotiables, and Modal Lifecycle State Reducers.
 * Executes mathematical proofs and invariant assertions without opening a browser.
 */

const ratingMeta = {
  1: { title: 'Rough', bg: '#FF4D4D' },
  2: { title: 'Down', bg: '#FFAA00' },
  3: { title: 'Okay', bg: '#FDC800' },
  4: { title: 'Hit', bg: '#00E599' },
  5: { title: 'Peak', bg: '#00D8F6' }
};

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ [MATH-MODEL] PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ❌ [MATH-MODEL] FAIL: ${message}`);
    failed++;
  }
}

console.log('\n======================================================================');
console.log('📐 EXECUTING MATHEMATICAL & COMPONENT STATE INVARIANT AUDIT');
console.log('======================================================================\n');

// ---------------------------------------------------------------------------
// SUITE A: Life Spheres Component Lifecycle & Empty Void Prevention
// ---------------------------------------------------------------------------
console.log('🌐 [A] Evaluating Life Spheres State Initializer & Void-Prevention Model...');

const DEFAULT_SPHERES_CFG = [
  { id: 'health_vitality', name: 'Health & Energy', icon: 'Zap', color: '#00E599', desc: 'Sleep, workouts, nutrition', enabled: true },
  { id: 'work_school', name: 'Work / School', icon: 'Flame', color: '#FF7A00', desc: 'Grind, output, career focus', enabled: true },
  { id: 'social_event', name: 'Social & Connection', icon: 'Sparkles', color: '#00D8F6', desc: 'Friends, networking, squad', enabled: true }
];

/**
 * Pure state reducer mimicking EditDayModal / MobileAppView / TodayHero initialization
 */
function simulateModalSphereInit(entryData, cfg = DEFAULT_SPHERES_CFG) {
  const activeEntry = entryData || {};
  const initialSpheres = {};

  const enabledCfg = cfg.filter(s => s.enabled);
  enabledCfg.forEach(s => {
    initialSpheres[s.id] = {
      id: s.id,
      name: s.name,
      icon: s.icon,
      color: s.color,
      desc: s.desc,
      rating: activeEntry?.spheres?.[s.id]?.rating || null,
      notes: activeEntry?.spheres?.[s.id]?.notes || ''
    };
  });

  // Restore ad-hoc outlier events
  if (activeEntry?.spheres) {
    Object.entries(activeEntry.spheres).forEach(([sId, sVal]) => {
      if (!initialSpheres[sId] && sVal && (sVal.isDayEvent || sVal.rating || sVal.notes)) {
        initialSpheres[sId] = {
          id: sId,
          name: sVal.name || sId,
          icon: sVal.icon || 'Sparkles',
          color: sVal.color || '#FF4D6D',
          desc: sVal.desc || 'Day-specific outlier event',
          rating: sVal.rating || null,
          notes: sVal.notes || '',
          isDayEvent: true
        };
      }
    });
  }

  return {
    rating: activeEntry.rating || 3,
    notes: activeEntry.notes || '',
    spheresData: initialSpheres,
    totalSpheresCount: Object.keys(initialSpheres).length
  };
}

// Invariant 1: Unrecorded day (null entryData) MUST NEVER produce empty sphere list
const nullDayState = simulateModalSphereInit(null);
assert(
  nullDayState.totalSpheresCount === DEFAULT_SPHERES_CFG.length && nullDayState.spheresData['health_vitality'] !== undefined,
  `Unrecorded day (null entryData) initializes all ${DEFAULT_SPHERES_CFG.length} active spheres (NO BLANK VOID)`
);
assert(
  nullDayState.rating === 3 && nullDayState.notes === '',
  'Unrecorded day safely defaults rating to 3 and notes to empty string'
);

// Invariant 2: Partially populated day (legacy entry with rating only, no spheres)
const legacyDayState = simulateModalSphereInit({ rating: 4, notes: 'Solid day' });
assert(
  legacyDayState.totalSpheresCount === DEFAULT_SPHERES_CFG.length && legacyDayState.rating === 4,
  'Legacy day without spheres retains rating 4 and initializes empty standard spheres'
);

// Invariant 3: Outlier dynamic event restoration
const outlierDayState = simulateModalSphereInit({
  rating: 5,
  spheres: {
    health_vitality: { rating: 5 },
    event_party_123: { id: 'event_party_123', name: '🎉 Rave', rating: 5, isDayEvent: true }
  }
});
assert(
  outlierDayState.totalSpheresCount === 4 && outlierDayState.spheresData['event_party_123']?.isDayEvent === true,
  'Outlier dynamic event restored alongside standard spheres (3 standard + 1 event = 4 total)'
);

// ---------------------------------------------------------------------------
// SUITE B: Life Spheres Mathematical Invariants & Precision Calculations
// ---------------------------------------------------------------------------
console.log('\n📊 [B] Evaluating Composite Sphere Mathematical Invariants & Precision...');

function calculateCompositeScore(spheres) {
  if (!spheres || typeof spheres !== 'object') return null;
  const entries = Object.values(spheres).filter(s => s && s.rating && Number(s.rating) > 0);
  if (entries.length === 0) return null;
  const sum = entries.reduce((acc, curr) => acc + Number(curr.rating), 0);
  const avg = sum / entries.length;
  const rounded = Math.round(avg * 10) / 10;
  const tier = Math.min(5, Math.max(1, Math.round(avg)));
  return {
    score: rounded,
    rating: tier,
    verdict: ratingMeta[tier]?.title || 'Verdict',
    ratedCount: entries.length,
    totalSpheres: Object.keys(spheres).length
  };
}

// Invariant B1: All unrated spheres return null (never NaN or crashed calculation)
const allUnrated = calculateCompositeScore(nullDayState.spheresData);
assert(allUnrated === null, 'All unrated spheres return null without throwing NaN');

// Invariant B2: Single rated sphere produces exact discrete value
const singleRated = calculateCompositeScore({
  s1: { rating: 4 },
  s2: { rating: null },
  s3: { rating: null }
});
assert(singleRated.score === 4.0 && singleRated.rating === 4 && singleRated.ratedCount === 1, 'Single rated sphere gives exact score 4.0');

// Invariant B3: 100-permutation Monte Carlo mathematical consistency check
let mathDeviations = 0;
for (let i = 0; i < 100; i++) {
  const r1 = Math.floor(Math.random() * 5) + 1;
  const r2 = Math.floor(Math.random() * 5) + 1;
  const r3 = Math.floor(Math.random() * 5) + 1;
  const expectedAvg = (r1 + r2 + r3) / 3;
  const expectedScore = Math.round(expectedAvg * 10) / 10;
  const expectedTier = Math.min(5, Math.max(1, Math.round(expectedAvg)));

  const result = calculateCompositeScore({
    s1: { rating: r1 },
    s2: { rating: r2 },
    s3: { rating: r3 }
  });

  if (result.score !== expectedScore || result.rating !== expectedTier || isNaN(result.score)) {
    mathDeviations++;
  }
}
assert(mathDeviations === 0, '100 random Monte Carlo rating permutations verified with 0 mathematical deviations');

// ---------------------------------------------------------------------------
// SUITE C: Non-Negotiables Mathematical Model & Mode Permutation Matrix
// ---------------------------------------------------------------------------
console.log('\n⚓ [C] Evaluating Daily Non-Negotiables Utility Calculations & Modes...');

const TEST_ANCHORS = [
  { id: 'w1', title: 'Gym Workout', utils: 2.0 },
  { id: 'h1', title: '3L Hydration', utils: 1.0 },
  { id: 'f1', title: 'Deep Work 4h', utils: 2.0 }
];

function evaluateNonNegotiablesMath(anchors, checkedState, mode, userRating = 3) {
  const totalUtils = anchors.reduce((acc, curr) => acc + (Number(curr.utils) || 0), 0);
  const achievedUtils = anchors.reduce((acc, curr) => {
    return acc + (checkedState[curr.id] ? (Number(curr.utils) || 0) : 0);
  }, 0);
  const completedCount = anchors.filter(a => checkedState[a.id]).length;

  const normalizedRating = totalUtils > 0 ? Number(((achievedUtils / totalUtils) * 5.0).toFixed(1)) : 0;

  let finalRating = userRating;
  let finalCalculatedScore = normalizedRating;

  if (mode === 'deterministic_100') {
    finalRating = Math.max(1, Math.min(5, Math.round(normalizedRating) || 1));
  } else if (mode === 'hybrid_50_50') {
    const blended = Number(((0.5 * userRating) + (0.5 * normalizedRating)).toFixed(1));
    finalRating = Math.max(1, Math.min(5, Math.round(blended) || 1));
    finalCalculatedScore = blended;
  }

  return {
    totalUtils: Number(totalUtils.toFixed(2)),
    achievedUtils: Number(achievedUtils.toFixed(2)),
    completedCount,
    normalizedRating,
    finalRating,
    finalCalculatedScore
  };
}

// Invariant C1: Total Utils = 0 guard (zero division prevention)
const zeroUtilResult = evaluateNonNegotiablesMath([], {}, 'deterministic_100', 3);
assert(zeroUtilResult.normalizedRating === 0 && !isNaN(zeroUtilResult.normalizedRating), 'Empty anchors safely produce 0 normalized rating (no division by zero)');

// Invariant C2: Deterministic 100% boundary checks
const detZero = evaluateNonNegotiablesMath(TEST_ANCHORS, {}, 'deterministic_100');
const detFull = evaluateNonNegotiablesMath(TEST_ANCHORS, { w1: true, h1: true, f1: true }, 'deterministic_100');
const detHalf = evaluateNonNegotiablesMath(TEST_ANCHORS, { w1: true, h1: false, f1: false }, 'deterministic_100'); // 2.0 / 5.0 = 40% -> 2★
assert(detZero.finalRating === 1, 'Deterministic: 0% completion clamps to 1★');
assert(detFull.finalRating === 5, 'Deterministic: 100% completion computes 5★');
assert(detHalf.finalRating === 2 && detHalf.normalizedRating === 2.0, 'Deterministic: 40% completion computes exact 2★');

// Invariant C3: Hybrid 50/50 Mathematical Symmetry
// User rating = 1, Habit = 5 (100%) -> blended = 0.5*1 + 0.5*5 = 3.0 -> 3★
const hybridTest1 = evaluateNonNegotiablesMath(TEST_ANCHORS, { w1: true, h1: true, f1: true }, 'hybrid_50_50', 1);
assert(hybridTest1.finalRating === 3 && hybridTest1.finalCalculatedScore === 3.0, 'Hybrid: 1★ user + 5★ anchors yields exactly 3.0 blended score (3★)');

// User rating = 5, Habit = 0 (0%) -> blended = 0.5*5 + 0.5*0 = 2.5 -> 3★
const hybridTest2 = evaluateNonNegotiablesMath(TEST_ANCHORS, {}, 'hybrid_50_50', 5);
assert(hybridTest2.finalRating === 3 && hybridTest2.finalCalculatedScore === 2.5, 'Hybrid: 5★ user + 0★ anchors yields exactly 2.5 blended score (3★)');

// Invariant C4: Checklist mode preserves subjective user rating
const checklistTest = evaluateNonNegotiablesMath(TEST_ANCHORS, { w1: true }, 'checklist', 4);
assert(checklistTest.finalRating === 4, 'Checklist: Preserves manual user rating');

// ---------------------------------------------------------------------------
// SUITE D: Dual-Mode Synergy & Firestore Database Hygiene Model
// ---------------------------------------------------------------------------
console.log('\n🔒 [D] Evaluating Dual-Mode Synergy & Firestore Payload Sanitization...');

function cleanFirestorePayload(obj) {
  if (obj === null || obj === undefined) return undefined;
  if (typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(cleanFirestorePayload).filter(i => i !== undefined);
  const cleaned = {};
  Object.keys(obj).forEach(k => {
    const v = cleanFirestorePayload(obj[k]);
    if (v !== undefined) cleaned[k] = v;
  });
  return cleaned;
}

function simulateEntrySavePayload(sphereActive, nonNegActive, dayState) {
  const comp = sphereActive ? calculateCompositeScore(dayState.spheres) : null;
  const payload = {
    date: dayState.date,
    rating: comp ? comp.rating : Number(dayState.rating || 3),
    verdict: comp ? comp.verdict : 'Verdict',
    notes: dayState.notes || '',
    spheres: sphereActive ? dayState.spheres : undefined,
    calculatedScore: nonNegActive ? dayState.calculatedScore : (comp ? comp.score : undefined),
    anchors: nonNegActive ? dayState.anchors : undefined
  };
  return cleanFirestorePayload(payload);
}

// Test dual mode active
const dualActivePayload = simulateEntrySavePayload(true, true, {
  date: '2026-09-16',
  rating: 3,
  notes: 'Locked in testing',
  spheres: { s1: { rating: 5 }, s2: { rating: 5 } },
  calculatedScore: 4.5,
  anchors: { w1: true }
});
assert(dualActivePayload.spheres !== undefined && dualActivePayload.anchors !== undefined, 'Dual Active: Preserves both spheres and anchor telemetry');
assert(dualActivePayload.rating === 5 && dualActivePayload.verdict === 'Peak', 'Dual Active: Rating calculated dynamically from spheres composite score');

// Test dual mode inactive (simple mode)
const dualInactivePayload = simulateEntrySavePayload(false, false, {
  date: '2026-09-16',
  rating: 4,
  notes: 'Simple day',
  spheres: { s1: { rating: 5 } },
  calculatedScore: 4.5,
  anchors: { w1: true }
});
assert(dualInactivePayload.spheres === undefined && dualInactivePayload.anchors === undefined, 'Dual Inactive: Strips disabled mode fields cleanly');
assert(!JSON.stringify(dualInactivePayload).includes('undefined'), 'Firestore Hygiene: JSON string contains zero undefined values');

// ---------------------------------------------------------------------------
// SUITE E: Anti-Burnout Rehabilitation Sanctuary & Streak Freeze Mathematics
// ---------------------------------------------------------------------------
console.log('\n🌿 [E] Evaluating Anti-Burnout Rehabilitation & Streak Freeze Mathematical Model...');

function simulateStreakCalculation(entries, rehabActive, todayStr, yestStr) {
  const dates = Object.keys(entries || {});
  if (dates.length === 0) return 0;

  if (!entries[todayStr]?.rating && !entries[yestStr]?.rating && !rehabActive) {
    return 0;
  }

  let streak = 0;
  let curr = entries[todayStr]?.rating ? new Date(`${todayStr}T00:00:00`) : new Date(`${yestStr}T00:00:00`);
  if (!entries[todayStr]?.rating && rehabActive) {
    curr = new Date(`${yestStr}T00:00:00`);
  }

  let safety = 0;
  while (safety < 365) {
    safety++;
    const ds = `${curr.getFullYear()}-${String(curr.getMonth() + 1).padStart(2, '0')}-${String(curr.getDate()).padStart(2, '0')}`;
    const entry = entries[ds];
    const isRehabDay = (entry && (entry.isRehabilitation || entry.isStreakFreeze));

    if (entry && Number(entry.rating) >= 3) {
      streak++;
      curr.setDate(curr.getDate() - 1);
    } else if (isRehabDay) {
      // 🌿 Rehabilitation: Bridge without resetting to zero
      curr.setDate(curr.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

// Invariant 1: Unrated days normally reset streak to 0
const brokenStreak = simulateStreakCalculation({
  '2026-09-10': { rating: 4 },
  '2026-09-11': { rating: 5 },
  // 2026-09-12 unrated
  // 2026-09-13 unrated
}, false, '2026-09-13', '2026-09-12');
assert(brokenStreak === 0, 'Rehabilitation Invariant: Missing rating without freeze breaks streak to 0');

// Invariant 2: Active streak freeze bridges across unrated days
const bridgedStreak = simulateStreakCalculation({
  '2026-09-10': { rating: 4 },
  '2026-09-11': { rating: 5 },
  '2026-09-12': { isRehabilitation: true }, // Freeze day 1
  '2026-09-13': { isRehabilitation: true }, // Freeze day 2
}, true, '2026-09-13', '2026-09-12');
assert(bridgedStreak === 2, 'Rehabilitation Invariant: Active freeze preserves unbroken 2-day streak across unrated recovery period');

// Invariant 3: Hard Ceiling of 14 days maximum
function simulateRehabDurationCap(startDateStr, extendDays) {
  const initialDays = 7;
  const totalDays = initialDays + extendDays;
  return Math.min(14, totalDays);
}
assert(simulateRehabDurationCap('2026-09-01', 7) === 14, 'Rehabilitation Invariant: 7 initial + 7 extension reaches exact 14-day limit');
assert(simulateRehabDurationCap('2026-09-01', 14) === 14, 'Rehabilitation Invariant: Hard ceiling stops at 14 days maximum');

// Invariant 4: RFC 4180 CSV Serialization
function simulateRfc4180Escape(value) {
  const str = String(value ?? '');
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}
assert(simulateRfc4180Escape('Normal text') === 'Normal text', 'Export Invariant: Normal string unchanged in CSV');
assert(simulateRfc4180Escape('Hello, world') === '"Hello, world"', 'Export Invariant: String with comma wrapped in quotes');
assert(simulateRfc4180Escape('He said "yes"') === '"He said ""yes"""', 'Export Invariant: Double quotes properly escaped as double-double-quotes');
assert(simulateRfc4180Escape('Line 1\nLine 2') === '"Line 1\nLine 2"', 'Export Invariant: Multiline text wrapped in quotes');

// Invariant 5: Auto-Sanctuary Assumption Engine
function simulateAutoSanctuaryEligibility(entries, todayStr, yestStr) {
  if (!entries || typeof entries !== 'object') return false;
  if (entries[yestStr]?.rating) return false; // Yesterday was rated

  let consecutiveRough = 0;
  const now = new Date(`${todayStr}T00:00:00`);
  for (let i = 2; i <= 5; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const ds = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const entry = entries[ds];
    if (entry && entry.rating && Number(entry.rating) <= 2) {
      consecutiveRough++;
    } else if (entry && entry.rating && Number(entry.rating) > 2) {
      break;
    } else {
      break;
    }
  }
  return consecutiveRough >= 2;
}

const eligibleEntries = {
  '2026-09-10': { rating: 1 }, // 2 days before yesterday: rough
  '2026-09-11': { rating: 2 }, // 1 day before yesterday: rough
  // 2026-09-12 unrated (yesterday)
  // 2026-09-13 unrated (today)
};
assert(
  simulateAutoSanctuaryEligibility(eligibleEntries, '2026-09-13', '2026-09-12') === true,
  'Auto-Sanctuary Invariant: 2 consecutive rough days before missed day triggers automatic freeze safeguard'
);

const normalEntries = {
  '2026-09-10': { rating: 4 },
  '2026-09-11': { rating: 4 },
  // 2026-09-12 unrated
};
assert(
  simulateAutoSanctuaryEligibility(normalEntries, '2026-09-13', '2026-09-12') === false,
  'Auto-Sanctuary Invariant: Normal/hit streak before missed day does not spuriously trigger auto-sanctuary'
);

// Invariant 6: Sabbatical Mode indefinite holding pattern
function simulateSabbaticalBridge(streakBeforeSabbatical, isSabbatical) {
  if (isSabbatical) {
    return streakBeforeSabbatical; // Milestone frozen in amber without reset
  }
  return 0;
}
assert(simulateSabbaticalBridge(42, true) === 42, 'Sabbatical Invariant: Infinite sabbatical pause preserves 42-day milestone intact');

// Invariant 7: 7-Day Cooling-Off Erasure Model
function simulateCoolingOffHolding(nowMs, scheduledAtMs, graceDays = 7) {
  const executeAtMs = scheduledAtMs + (graceDays * 86400000);
  const isPending = nowMs < executeAtMs;
  const isPurged = nowMs >= executeAtMs;
  const daysRemaining = Math.max(0, Math.ceil((executeAtMs - nowMs) / 86400000));
  return { isPending, isPurged, daysRemaining };
}
const day1State = simulateCoolingOffHolding(1000000, 1000000, 7);
assert(day1State.isPending === true && day1State.daysRemaining === 7, 'Erasure Invariant: Immediate schedule gives 7-day pending cooling-off window');

const day8State = simulateCoolingOffHolding(1000000 + 8 * 86400000, 1000000, 7);
assert(day8State.isPurged === true && day8State.daysRemaining === 0, 'Erasure Invariant: Day 8 after cooling-off triggers permanent purge');


// ---------------------------------------------------------------------------
// REPORT
// ---------------------------------------------------------------------------
console.log('\n======================================================================');
console.log(`📊 MATHEMATICAL MODEL AUDIT COMPLETE: ${passed} PASSED | ${failed} FAILED`);
console.log('======================================================================\n');

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
