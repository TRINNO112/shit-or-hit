/**
 * ⚡ EXEMPLARY BEHAVIORAL DATA & AI DOSSIER DEMO ENGINE
 * Generates an authentic, richly populated 30-day behavioral dataset
 * with realistic diary entries, multi-sphere vectors, non-negotiable habit anchors,
 * and a complete executive intelligence dossier (with domino causal chains).
 *
 * Activated exclusively via keyboard shortcuts (Ctrl+Shift+D / Alt+Shift+D)
 * or typing the secret buffer 'demo' / 'fakedata'.
 */

import { fetchMonthlyReport } from './api';
import { getCurrentUser, getEffectiveUserId } from './firebase';

const SAMPLE_DAILY_THEMES = [
  {
    rating: 4,
    verdict: 'Good',
    notes: 'Started the month with crisp morning discipline. Completed a 45-minute sprint and knocked out the core architecture specs for the app. Maintained zero-tab clutter throughout the afternoon.',
    spheres: { deepwork: 4, fitness: 4, discipline: 4, peace: 4 },
    anchors: { 'Morning Workout': true, 'Deep Work Block': true, 'Zero Doomscroll': true, 'Sleep by 11PM': true }
  },
  {
    rating: 5,
    verdict: 'Peak',
    notes: 'Absolute flow state from 8:00 AM to 1:00 PM. Solved the tricky state reconciliation bug that had been stalling progress for days. Hit the gym in the evening—new deadlift personal record.',
    spheres: { deepwork: 5, fitness: 5, discipline: 5, peace: 4 },
    anchors: { 'Morning Workout': true, 'Deep Work Block': true, 'Zero Doomscroll': true, 'Sleep by 11PM': true }
  },
  {
    rating: 3,
    verdict: 'Okay',
    notes: 'A bit fragmented. Spent too much time responding to routine messages instead of deep work. Still managed 2 focused hours in the late afternoon. Evening walk restored mental clarity.',
    spheres: { deepwork: 3, fitness: 3, discipline: 3, peace: 3 },
    anchors: { 'Morning Workout': true, 'Deep Work Block': false, 'Zero Doomscroll': true, 'Sleep by 11PM': false }
  },
  {
    rating: 4,
    verdict: 'Good',
    notes: 'Solid comeback. Structured the day with 90-minute Pomodoro intervals. Finished all academic assignments before dinner. Felt deeply grounded before bed.',
    spheres: { deepwork: 4, fitness: 3, discipline: 4, peace: 4 },
    anchors: { 'Morning Workout': false, 'Deep Work Block': true, 'Zero Doomscroll': true, 'Sleep by 11PM': true }
  },
  {
    rating: 4,
    verdict: 'Good',
    notes: 'Friday velocity. Polished mobile responsive viewports and tested edge cases on the 320px screen. Strong gym session focused on mobility and core.',
    spheres: { deepwork: 4, fitness: 4, discipline: 4, peace: 4 },
    anchors: { 'Morning Workout': true, 'Deep Work Block': true, 'Zero Doomscroll': true, 'Sleep by 11PM': true }
  },
  {
    rating: 3,
    verdict: 'Okay',
    notes: 'Weekend recovery pace. Took care of household chores, cleaned workspace, and organized study notes. Did not push on heavy creative work today.',
    spheres: { deepwork: 2, fitness: 3, discipline: 3, peace: 4 },
    anchors: { 'Morning Workout': false, 'Deep Work Block': false, 'Zero Doomscroll': true, 'Sleep by 11PM': true }
  },
  {
    rating: 4,
    verdict: 'Good',
    notes: 'Sunday strategic planning. Mapped out weekly deliverables and reviewed last month telemetry. Felt proactive rather than reactive heading into Monday.',
    spheres: { deepwork: 4, fitness: 3, discipline: 4, peace: 5 },
    anchors: { 'Morning Workout': true, 'Deep Work Block': true, 'Zero Doomscroll': true, 'Sleep by 11PM': true }
  },
  {
    rating: 2,
    verdict: 'Down',
    notes: 'Post-exam exhaustion caught up with me. Lost 2 hours late at night down a YouTube rabbit hole. Delayed sleep until 2:30 AM, setting a fragile tone for tomorrow.',
    spheres: { deepwork: 2, fitness: 1, discipline: 2, peace: 2 },
    anchors: { 'Morning Workout': false, 'Deep Work Block': false, 'Zero Doomscroll': false, 'Sleep by 11PM': false }
  },
  {
    rating: 1,
    verdict: 'Rough',
    notes: 'Woke up late with heavy brain fog from last night sleep deficit. Struggled through classes and snapped at my brother over something trivial. Total energy collapse by 5:00 PM.',
    spheres: { deepwork: 1, fitness: 1, discipline: 1, peace: 1 },
    anchors: { 'Morning Workout': false, 'Deep Work Block': false, 'Zero Doomscroll': false, 'Sleep by 11PM': false }
  },
  {
    rating: 2,
    verdict: 'Down',
    notes: 'Slowly recovering from the slump. Managed to sit down and finish minimal homework, but cognitive stamina was depleted. Decided to shut off screens early and reset.',
    spheres: { deepwork: 2, fitness: 2, discipline: 2, peace: 3 },
    anchors: { 'Morning Workout': false, 'Deep Work Block': false, 'Zero Doomscroll': true, 'Sleep by 11PM': true }
  },
  {
    rating: 3,
    verdict: 'Okay',
    notes: 'Baseline regained. 8 hours of solid sleep made a noticeable difference. Attended all lectures with full focus and cleared the backlog of economics questions.',
    spheres: { deepwork: 3, fitness: 3, discipline: 3, peace: 3 },
    anchors: { 'Morning Workout': true, 'Deep Work Block': false, 'Zero Doomscroll': true, 'Sleep by 11PM': true }
  },
  {
    rating: 4,
    verdict: 'Good',
    notes: 'Building upward momentum again. Ran 5k in the morning mist. Knocked out chapter 6 revision in one sitting. Felt the discipline engine click back into gear.',
    spheres: { deepwork: 4, fitness: 4, discipline: 4, peace: 4 },
    anchors: { 'Morning Workout': true, 'Deep Work Block': true, 'Zero Doomscroll': true, 'Sleep by 11PM': true }
  },
  {
    rating: 3,
    verdict: 'Okay',
    notes: 'Mixed day. Strong morning focus derailed slightly by surprise family errands in the afternoon. Still preserved evening reading time before lights out.',
    spheres: { deepwork: 3, fitness: 2, discipline: 3, peace: 4 },
    anchors: { 'Morning Workout': false, 'Deep Work Block': true, 'Zero Doomscroll': true, 'Sleep by 11PM': true }
  },
  {
    rating: 4,
    verdict: 'Good',
    notes: 'Productive Saturday session at the library. Focused uninterrupted for 3 hours on web performance and token optimization. Felt thoroughly fulfilled.',
    spheres: { deepwork: 5, fitness: 3, discipline: 4, peace: 4 },
    anchors: { 'Morning Workout': true, 'Deep Work Block': true, 'Zero Doomscroll': true, 'Sleep by 11PM': true }
  },
  {
    rating: 3,
    verdict: 'Okay',
    notes: 'Mid-month breather. Spent quality time with family, helped with household grocery run, and took an afternoon nap. Kept digital device usage minimal.',
    spheres: { deepwork: 2, fitness: 3, discipline: 3, peace: 5 },
    anchors: { 'Morning Workout': false, 'Deep Work Block': false, 'Zero Doomscroll': true, 'Sleep by 11PM': true }
  },
  {
    rating: 4,
    verdict: 'Good',
    notes: 'Monday started with high vigor. Reviewed flashcards on the morning commute and nailed the accounts practice quiz. Energy levels remained stable all day.',
    spheres: { deepwork: 4, fitness: 4, discipline: 4, peace: 4 },
    anchors: { 'Morning Workout': true, 'Deep Work Block': true, 'Zero Doomscroll': true, 'Sleep by 11PM': true }
  },
  {
    rating: 2,
    verdict: 'Down',
    notes: 'Unexpected power outage in the evening threw off my study schedule. Frustration crept in and I spent too long grumbling instead of finding an offline alternative.',
    spheres: { deepwork: 2, fitness: 2, discipline: 2, peace: 2 },
    anchors: { 'Morning Workout': false, 'Deep Work Block': false, 'Zero Doomscroll': false, 'Sleep by 11PM': true }
  },
  {
    rating: 4,
    verdict: 'Good',
    notes: 'Broke out of yesterday funk with an aggressive 6:30 AM workout and ice-cold shower. That single tactile decision flipped the entire momentum of the week.',
    spheres: { deepwork: 4, fitness: 5, discipline: 4, peace: 4 },
    anchors: { 'Morning Workout': true, 'Deep Work Block': true, 'Zero Doomscroll': true, 'Sleep by 11PM': true }
  },
  {
    rating: 5,
    verdict: 'Peak',
    notes: 'Supercharged performance. High somatic energy fueled 4 hours of clean code. Resolved all linting warnings and verified the entire test suite.',
    spheres: { deepwork: 5, fitness: 4, discipline: 5, peace: 5 },
    anchors: { 'Morning Workout': true, 'Deep Work Block': true, 'Zero Doomscroll': true, 'Sleep by 11PM': true }
  },
  {
    rating: 5,
    verdict: 'Peak',
    notes: 'Velocity continued unabated. Finished the project milestone 2 days ahead of target. Teachers commended the depth of research during seminar.',
    spheres: { deepwork: 5, fitness: 4, discipline: 5, peace: 5 },
    anchors: { 'Morning Workout': true, 'Deep Work Block': true, 'Zero Doomscroll': true, 'Sleep by 11PM': true }
  },
  {
    rating: 4,
    verdict: 'Good',
    notes: 'Maintained the streak. Kept focus sharp during long afternoon lectures. Cooked a nutritious dinner with family and read 30 pages of history.',
    spheres: { deepwork: 4, fitness: 3, discipline: 4, peace: 5 },
    anchors: { 'Morning Workout': true, 'Deep Work Block': true, 'Zero Doomscroll': true, 'Sleep by 11PM': true }
  },
  {
    rating: 5,
    verdict: 'Peak',
    notes: '4th consecutive green day. Everything clicked: intense morning training, effortless academic recall, and deep conversation with close friends.',
    spheres: { deepwork: 5, fitness: 5, discipline: 5, peace: 4 },
    anchors: { 'Morning Workout': true, 'Deep Work Block': true, 'Zero Doomscroll': true, 'Sleep by 11PM': true }
  },
  {
    rating: 5,
    verdict: 'Peak',
    notes: 'Hit the apex of the month. 6-day uninterrupted streak! Zero hesitation, zero wasted hours. Felt completely in control of my time and attention.',
    spheres: { deepwork: 5, fitness: 4, discipline: 5, peace: 5 },
    anchors: { 'Morning Workout': true, 'Deep Work Block': true, 'Zero Doomscroll': true, 'Sleep by 11PM': true }
  },
  {
    rating: 3,
    verdict: 'Okay',
    notes: 'High streak ended gracefully with a planned recharge day. Long walk in the park with friends. Light reading only, giving the mind room to decompress.',
    spheres: { deepwork: 2, fitness: 3, discipline: 3, peace: 5 },
    anchors: { 'Morning Workout': false, 'Deep Work Block': false, 'Zero Doomscroll': true, 'Sleep by 11PM': true }
  },
  {
    rating: 4,
    verdict: 'Good',
    notes: 'Back to the forge. Clean transition from rest day into high-leverage execution. Handled all administrative errands before lunch without procrastination.',
    spheres: { deepwork: 4, fitness: 4, discipline: 4, peace: 4 },
    anchors: { 'Morning Workout': true, 'Deep Work Block': true, 'Zero Doomscroll': true, 'Sleep by 11PM': true }
  },
  {
    rating: 1,
    verdict: 'Rough',
    notes: 'Sudden onset of seasonal cold and headache. Body felt feverish and eyes burned. Had to cancel evening plans and stay under blankets with herbal tea.',
    spheres: { deepwork: 1, fitness: 1, discipline: 2, peace: 2 },
    anchors: { 'Morning Workout': false, 'Deep Work Block': false, 'Zero Doomscroll': true, 'Sleep by 11PM': true }
  },
  {
    rating: 2,
    verdict: 'Down',
    notes: 'Still dealing with the congestion and cough. Did not push to do strenuous workouts. Took medicine, slept for 10 hours, and focused strictly on recovery.',
    spheres: { deepwork: 1, fitness: 1, discipline: 3, peace: 3 },
    anchors: { 'Morning Workout': false, 'Deep Work Block': false, 'Zero Doomscroll': true, 'Sleep by 11PM': true }
  },
  {
    rating: 4,
    verdict: 'Good',
    notes: 'Fever broke and energy returned. Was cautious not to overexert, but managed 3 solid hours of studying and went for a light evening walk.',
    spheres: { deepwork: 4, fitness: 2, discipline: 4, peace: 4 },
    anchors: { 'Morning Workout': false, 'Deep Work Block': true, 'Zero Doomscroll': true, 'Sleep by 11PM': true }
  },
  {
    rating: 4,
    verdict: 'Good',
    notes: 'Finishing the month strong. Re-engaged full physical training routine. Reviewed month-end goals and confirmed all primary targets were attained.',
    spheres: { deepwork: 4, fitness: 4, discipline: 4, peace: 4 },
    anchors: { 'Morning Workout': true, 'Deep Work Block': true, 'Zero Doomscroll': true, 'Sleep by 11PM': true }
  },
  {
    rating: 5,
    verdict: 'Peak',
    notes: 'Crowning conclusion to September. 30 days completed. Looked back at the telemetry and felt deep pride in how the slumps were contained and resolved quickly.',
    spheres: { deepwork: 5, fitness: 5, discipline: 5, peace: 5 },
    anchors: { 'Morning Workout': true, 'Deep Work Block': true, 'Zero Doomscroll': true, 'Sleep by 11PM': true }
  }
];

/**
 * Generates an exemplary 30-day map of diary entries for a given year & month.
 */
export function generateExemplaryMonthEntries(year = 2026, month = 9) {
  const entries = {};
  const daysInMonth = new Date(year, month, 0).getDate();
  const monthStr = String(month).padStart(2, '0');

  for (let d = 1; d <= daysInMonth; d++) {
    const dayStr = String(d).padStart(2, '0');
    const dateStr = `${year}-${monthStr}-${dayStr}`;
    const themeIdx = (d - 1) % SAMPLE_DAILY_THEMES.length;
    const theme = SAMPLE_DAILY_THEMES[themeIdx];

    entries[dateStr] = {
      date: dateStr,
      rating: theme.rating,
      verdict: theme.verdict,
      notes: `${new Date(year, month - 1, d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}\n\n${theme.notes}`,
      spheres: { ...theme.spheres },
      anchors: { ...theme.anchors },
      highlights: theme.rating >= 4 ? 'Consistent focus and high agency execution' : '',
      lowlights: theme.rating <= 2 ? 'Friction loop and energy drainage' : '',
      tags: theme.rating >= 4 ? ['deepwork', 'fitness', 'flow'] : ['recovery', 'triage'],
      createdAt: new Date(year, month - 1, d, 20, 30, 0).toISOString(),
      updatedAt: new Date(year, month - 1, d, 21, 15, 0).toISOString()
    };
  }

  return entries;
}

/**
 * Synthesizes a high-fidelity Neobrutalist Monthly Dossier report object.
 */
export function generateExemplaryDossier(year = 2026, month = 9, entries = null) {
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const monthName = `${monthNames[month - 1]} ${year}`;
  const daysInMonth = new Date(year, month, 0).getDate();
  const activeEntries = entries || generateExemplaryMonthEntries(year, month);

  const dayMatrix = [];
  let hitCount = 0;
  let totalScore = 0;
  let currentStreak = 0;
  let maxStreak = 0;
  let currentSlump = 0;
  let maxSlump = 0;
  const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  const weekdayTotals = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };
  const weekdayCounts = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };

  for (let d = 1; d <= daysInMonth; d++) {
    const dayStr = String(d).padStart(2, '0');
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${dayStr}`;
    const entry = activeEntries[dateStr] || { rating: 3, verdict: 'Okay', notes: '' };
    const r = entry.rating || 3;

    dayMatrix.push({
      day: d,
      date: dateStr,
      rating: r,
      verdict: entry.verdict || 'Okay',
      notes: entry.notes || ''
    });

    ratingCounts[r] = (ratingCounts[r] || 0) + 1;
    totalScore += r;
    if (r >= 4) {
      hitCount++;
      currentStreak++;
      if (currentStreak > maxStreak) maxStreak = currentStreak;
      currentSlump = 0;
    } else {
      currentSlump++;
      if (currentSlump > maxSlump) maxSlump = currentSlump;
      currentStreak = 0;
    }

    const dayObj = new Date(year, month - 1, d);
    const dayName = dayObj.toLocaleDateString('en-US', { weekday: 'short' });
    if (weekdayTotals[dayName] !== undefined) {
      weekdayTotals[dayName] += r;
      weekdayCounts[dayName] += 1;
    }
  }

  const weekdayAverages = {};
  Object.keys(weekdayTotals).forEach(day => {
    weekdayAverages[day] = weekdayCounts[day] ? Number((weekdayTotals[day] / weekdayCounts[day]).toFixed(1)) : 3.0;
  });

  const hitRate = Math.round((hitCount / daysInMonth) * 100);
  const avgScore = Number((totalScore / daysInMonth).toFixed(1));

  return {
    monthName,
    year,
    month,
    targetDataset: 'demo_exemplary',
    totalLogged: daysInMonth,
    totalDaysInMonth: daysInMonth,
    hitRate,
    avgScore,
    longestStreak: maxStreak,
    longestSlump: maxSlump,
    ratingCounts,
    weekdayAverages,
    weeklyAnalytics: [
      { label: 'Week 1 (Days 1–7)', count: 7, avgScore: 3.9, hitRate: 71 },
      { label: 'Week 2 (Days 8–14)', count: 7, avgScore: 2.6, hitRate: 29 },
      { label: 'Week 3 (Days 15–21)', count: 7, avgScore: 4.1, hitRate: 71 },
      { label: 'Week 4 (Days 22–30)', count: 9, avgScore: 4.2, hitRate: 78 }
    ],
    frictionBreakdown: {
      screenDoomscrollPct: 35,
      academicStressPct: 40,
      householdSocialPct: 25
    },
    dayMatrix,
    executiveSummary: `${monthName} stood out as a high-leverage case study in rapid slump containment and sustained velocity. After an acute post-exam fatigue dip in Week 2, rigorous circadian reset protocols and early morning physical workouts catalyzed an unbroken 6-day peak streak during the second half of the month, resulting in a commanding ${hitRate}% hit rate.`,
    homieMentorLetter: `Listen bro, this month was a masterclass in agency. Week 2 tried to pull you into a dark hole—late-night doomscrolling following exam fatigue almost derailed your momentum. But what sets you apart this month is that you didn't let a bad day become a bad fortnight. You hit the kettlebells at 6:30 AM on the 18th, flipped the script, and logged 6 straight green days. Keep that 10:30 PM screen curfew locked down, protect your mornings, and keep crushing.`,
    personaArchetype: {
      title: 'THE RELENTLESS ARCHITECT',
      icon: 'Hammer',
      motto: 'Build through friction. Let the compound interest of consistency speak.',
      breakdown: 'High technical execution capacity characterized by rapid somatic recovery and disciplined deep-work intervals once environmental triggers are isolated.'
    },
    dominoChains: [
      {
        chainTitle: 'Late-Night Doomscroll to Morning Cognitive Fog Cascade',
        rootTrigger: `${year}-${String(month).padStart(2, '0')}-08: 2-hour midnight screen rabbit hole following exam exhaustion.`,
        links: [
          {
            date: `${year}-${String(month).padStart(2, '0')}-08`,
            rating: 2,
            stage: 'ROOT TRIGGER',
            summary: 'Post-exam mental exhaustion led to an unchecked 2-hour midnight doomscroll session, delaying sleep until 2:30 AM.'
          },
          {
            date: `${year}-${String(month).padStart(2, '0')}-09`,
            rating: 1,
            stage: 'COMPOUNDING DRAG',
            summary: 'Woke up 90 minutes late with severe sleep debt, skipped morning workout, and suffered brain fog during classes.'
          },
          {
            date: `${year}-${String(month).padStart(2, '0')}-10`,
            rating: 2,
            stage: 'COLLAPSE / RECOVERY',
            summary: 'Fatigue carried forward into evening study session; completed bare minimum before enforcing emergency sleep protocol.'
          }
        ],
        circuitBreaker: 'Enforce physical phone dock outside the bedroom by 10:30 PM with zero-tolerance bedtime lock.'
      },
      {
        chainTitle: 'Morning Workout to Deep Work Hyperfocus Flow',
        rootTrigger: `${year}-${String(month).padStart(2, '0')}-18: 6:30 AM intense kettlebell session and cold shower reset.`,
        links: [
          {
            date: `${year}-${String(month).padStart(2, '0')}-18`,
            rating: 4,
            stage: 'ROOT TRIGGER',
            summary: 'Broke a 3-day slump with an aggressive early morning physical workout and cold shower.'
          },
          {
            date: `${year}-${String(month).padStart(2, '0')}-19`,
            rating: 5,
            stage: 'COMPOUNDING DRAG',
            summary: 'High somatic energy fueled 4 unbroken hours of clean software architecture and problem solving.'
          },
          {
            date: `${year}-${String(month).padStart(2, '0')}-20`,
            rating: 5,
            stage: 'COLLAPSE / RECOVERY',
            summary: 'Momentum achieved maximum velocity; completed weekly project milestone 2 days ahead of schedule.'
          }
        ],
        circuitBreaker: 'Anchor the day with morning physical movement before checking any notifications or emails.'
      }
    ],
    storylineChronicle: {
      overarchingTheme: `Your month reflected disciplined mastery over environmental adversity, transforming a mid-month dip into an unstoppable peak momentum arc.`,
      chapters: [
        {
          act: 'Act I',
          phaseTitle: 'Strong Foundation & Architecture Sprint',
          timeSpan: 'Days 1–7',
          mood: 'Peak',
          narrative: 'High initial enthusiasm and structured execution. Core architectural problems were solved with calm clarity.',
          turningPoint: 'Solving the state reconciliation bug on Day 2 with zero regressions.',
          tacticalTakeaway: 'When morning discipline is locked in, afternoon deep work follows effortlessly.'
        },
        {
          act: 'Act II',
          phaseTitle: 'The Exam Fatigue Crucible & Slump Triage',
          timeSpan: 'Days 8–14',
          mood: 'Rough',
          narrative: 'Exam stress triggered late-night doomscrolling, accumulating sleep debt and triggering consecutive rough days.',
          turningPoint: 'Recognizing the doomscroll trigger on Day 10 and choosing emergency sleep over late-night cramming.',
          tacticalTakeaway: 'Protect circadian rhythms ruthlessly when academic stress peaks.'
        },
        {
          act: 'Act III',
          phaseTitle: 'The 6-Day Golden Streak & Apex Finish',
          timeSpan: 'Days 15–30',
          mood: 'Peak',
          narrative: 'A decisive physical workout on Day 18 ignited a historic 6-day peak streak that carried through the entire month-end finish.',
          turningPoint: 'The 6:30 AM kettlebell reset on Day 18 that completely shattered the friction loop.',
          tacticalTakeaway: 'Action precedes motivation. Move the body first; the mind will align.'
        }
      ]
    },
    achievementsAndClutches: [
      {
        title: '6-Day Unbroken Apex Streak',
        description: 'Logged 6 consecutive 5-star peak days between Day 18 and Day 23 with zero missed habits.',
        category: 'Discipline'
      },
      {
        title: 'Tactical Slump Breaker',
        description: 'Terminated a potential 2-week collapse in just 48 hours using physical shock reset protocols.',
        category: 'Resilience'
      },
      {
        title: 'Production Architecture Delivery',
        description: 'Delivered core application enhancements and full responsive mobile optimization.',
        category: 'Deep Work'
      },
      {
        title: 'Circadian Shield Defense',
        description: 'Maintained 85% sleep schedule adherence despite shifting academic deadlines.',
        category: 'Health'
      }
    ],
    behavioralTriggers: {
      primaryFailureMode: 'Midnight screen dopamine loops post-exam exhaustion.',
      primaryRecoveryDriver: 'Cold water exposure and early morning kettlebell resistance training.',
      highVelocityWindow: '08:00 AM – 12:30 PM (Peak Cognitive Clarity)'
    }
  };
}

/**
 * 🚀 POPULATE EXEMPLARY MONTH AND TRIGGER AI DOSSIER SYNTHESIS
 */
export const DEMO_STORAGE_KEY = 'goodness_db_demo_sandbox';
export const DEMO_USER_ID = 'demo_sandbox';

/**
 * Checks if demo sandbox mode is currently active
 */
export function isDemoSandboxActive() {
  if (typeof window === 'undefined') return false;
  return Boolean(window.__DEMO_SANDBOX_ACTIVE__);
}

/**
 * Sets demo sandbox active state and window flag
 */
export function setDemoSandboxActive(active) {
  if (typeof window === 'undefined') return;
  window.__DEMO_SANDBOX_ACTIVE__ = Boolean(active);
  try {
    sessionStorage.setItem('shit_or_hit_demo_sandbox_active', active ? 'true' : 'false');
    if (active) {
      getDemoSandboxDb(2026, 9);
    }
  } catch (e) {}
}

/**
 * Returns the sandboxed demo database (or generates it if empty)
 */
export function getDemoSandboxDb(year = 2026, month = 9) {
  if (typeof window === 'undefined') return { startDate: `${year}-09-01`, entries: {} };
  try {
    const raw = localStorage.getItem(DEMO_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.entries && Object.keys(parsed.entries).length > 0) {
        return parsed;
      }
    }
  } catch (e) {}

  const demoEntries = generateExemplaryMonthEntries(year, month);
  const db = {
    startDate: `${year}-${String(month).padStart(2, '0')}-01`,
    isDemoSandbox: true,
    entries: demoEntries,
    lastUpdated: new Date().toISOString()
  };
  try {
    localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(db));
  } catch (e) {}
  return db;
}

/**
 * 🚀 POPULATE EXEMPLARY MONTH AND TRIGGER AI DOSSIER SYNTHESIS
 * Completely isolated in DEMO_STORAGE_KEY ('goodness_db_demo_sandbox').
 * NEVER touches or replaces user's authentic personal database or cloud Firestore.
 */
export async function populateExemplaryMonth({ year = 2026, month = 9, useAi = true } = {}) {
  try {
    // 1. Generate 30 daily entries
    const fakeEntries = generateExemplaryMonthEntries(year, month);

    // 2. Save strictly to isolated DEMO_STORAGE_KEY
    const demoDb = {
      startDate: `${year}-${String(month).padStart(2, '0')}-01`,
      isDemoSandbox: true,
      entries: fakeEntries,
      lastUpdated: new Date().toISOString()
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(demoDb));
    }

    // 3. Generate & Save Exemplary Dossier strictly to demo sandbox report key
    const exemplaryDossier = generateExemplaryDossier(year, month, fakeEntries);
    const monthStr = String(month).padStart(2, '0');
    const demoReportBaseKey = `report_${DEMO_USER_ID}_${year}_${monthStr}`;
    const demoReportAutoKey = `${demoReportBaseKey}_auto`;

    if (typeof window !== 'undefined') {
      localStorage.setItem(demoReportBaseKey, JSON.stringify(exemplaryDossier));
      localStorage.setItem(demoReportAutoKey, JSON.stringify(exemplaryDossier));
    }

    // 4. Mark sandbox active
    setDemoSandboxActive(true);

    // 5. Asynchronously trigger live AI evaluation for demo data if permitted
    if (useAi && typeof window !== 'undefined' && window.__ENABLE_CLOUD_AI__) {
      fetchMonthlyReport(year, month, fakeEntries, null, true)
        .then((aiReport) => {
          if (aiReport && aiReport.executiveSummary) {
            console.log('✨ Live AI Dossier synthesis completed for demo sandbox:', aiReport.monthName);
            localStorage.setItem(demoReportBaseKey, JSON.stringify(aiReport));
            localStorage.setItem(demoReportAutoKey, JSON.stringify(aiReport));
            window.dispatchEvent(new CustomEvent('shit_or_hit_report_ready', { detail: { year, month } }));
          }
        })
        .catch((err) => {
          console.warn('Live AI Dossier synthesis fallback used exemplary report:', err);
        });
    }

    // 6. Broadcast reload events so UI updates instantly
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('shit_or_hit_demo_sandbox_toggled', { detail: { active: true, count: 30, year, month } }));
    }

    return {
      success: true,
      count: Object.keys(fakeEntries).length,
      year,
      month,
      entries: fakeEntries,
      report: exemplaryDossier
    };
  } catch (err) {
    console.error('Failed to populate exemplary month into demo sandbox:', err);
    return { success: false, error: err.message };
  }
}
