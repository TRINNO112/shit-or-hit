const API_BASE = '/api';

export const ratingMeta = {
  1: {
    rating: 1,
    icon: 'AlertCircle',
    title: 'Rough',
    desc: 'Heavy friction, chaos or struggle',
    bg: '#FF4D4D',
    color: '#000000',
    selectedClass: 'neo-selected-1'
  },
  2: {
    rating: 2,
    icon: 'CloudRain',
    title: 'Down',
    desc: 'Low battery, slow progress',
    bg: '#FF8A00',
    color: '#000000',
    selectedClass: 'neo-selected-2'
  },
  3: {
    rating: 3,
    icon: 'MinusCircle',
    title: 'Okay',
    desc: 'Solid baseline, held the line',
    bg: '#CBD5E1',
    color: '#000000',
    selectedClass: 'neo-selected-3'
  },
  4: {
    rating: 4,
    icon: 'Zap',
    title: 'Good',
    desc: 'Sharp, dialed-in & productive',
    bg: '#00E599',
    color: '#000000',
    selectedClass: 'neo-selected-4'
  },
  5: {
    rating: 5,
    icon: 'Sparkles',
    title: 'Peak',
    desc: 'Absolute God Mode momentum!',
    bg: '#FDC800',
    color: '#000000',
    selectedClass: 'neo-selected-5'
  }
};

export async function fetchDatabase() {
  try {
    const res = await fetch(`${API_BASE}/entries`);
    if (!res.ok) throw new Error('Failed to fetch entries');
    const json = await res.json();
    return {
      startDate: json.startDate || new Date().toISOString().slice(0, 10),
      entries: json.data || {}
    };
  } catch (err) {
    const cached = localStorage.getItem('goodness_db');
    if (cached) return JSON.parse(cached);
    return {
      startDate: new Date().toISOString().slice(0, 10),
      entries: {}
    };
  }
}

export async function saveEntry(entryData) {
  try {
    const res = await fetch(`${API_BASE}/entries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entryData)
    });
    if (!res.ok) throw new Error('Failed to save entry');
    const json = await res.json();
    return json.entry;
  } catch (err) {
    return {
      ...entryData,
      rating: Number(entryData.rating),
      verdict: ratingMeta[entryData.rating]?.title || 'Custom',
      updatedAt: new Date().toISOString()
    };
  }
}

export async function enhanceReflectionWithAI(notes, rating, date) {
  try {
    const res = await fetch(`${API_BASE}/ai/enhance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes, rating, date })
    });
    if (!res.ok) throw new Error('AI service error');
    const data = await res.json();
    return data.enhancedText || notes;
  } catch (err) {
    console.error('Enhance reflection failed:', err);
    return notes;
  }
}

export async function fetchMonthlyReport(year, month, customEntries = null) {
  try {
    const res = await fetch(`${API_BASE}/monthly-report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ year, month, customEntries })
    });
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) return json.data;
    }
  } catch (err) {
    console.warn('Backend /api/monthly-report unavailable, synthesizing client-side analytics fallback:', err);
  }

  // Self-healing client-side computation fallback
  return generateClientMonthlyReport(year, month, customEntries);
}

function generateClientMonthlyReport(year, month, customEntries = null) {
  let allEntries = {};
  if (customEntries) {
    if (Array.isArray(customEntries)) {
      allEntries = customEntries.reduce((acc, e) => {
        if (e && e.date) acc[e.date] = e;
        return acc;
      }, {});
    } else if (typeof customEntries === 'object') {
      allEntries = customEntries;
    }
  } else {
    const cached = localStorage.getItem('goodness_db');
    allEntries = cached ? JSON.parse(cached).entries || {} : {};
  }

  const monthPrefix = `${year}-${String(month).padStart(2, '0')}`;
  const monthEntries = Object.entries(allEntries || {})
    .filter(([date]) => date.startsWith(monthPrefix))
    .sort(([a], [b]) => a.localeCompare(b));

  const totalDaysInMonth = new Date(year, month, 0).getDate();
  const loggedCount = monthEntries.length;
  const monthName = new Date(year, month - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  if (loggedCount === 0) {
    return {
      monthName,
      year,
      month,
      totalLogged: 0,
      totalDaysInMonth,
      hitRate: 0,
      avgScore: 0,
      ratingCounts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      weekdayAverages: { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 },
      personaTitle: 'The New Explorer',
      executiveSummary: `No entries have been logged yet for ${monthName}. Start logging daily verdicts or select a test archetype to unlock deep intelligence.`,
      hiddenFacts: ['Log at least 3 days to reveal hidden behavioral patterns.'],
      frictionAnalysis: 'No friction points recorded.',
      goldenHabits: 'Consistent daily logging will reveal your peak momentum triggers.',
      nextMonthDirectives: ['Log your verdict daily for 7 consecutive days.', 'Write raw unfiltered notes.', 'Aim for a 75%+ Hit Rate.']
    };
  }

  const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  const weekdayTotals = { Mon: { sum: 0, count: 0 }, Tue: { sum: 0, count: 0 }, Wed: { sum: 0, count: 0 }, Thu: { sum: 0, count: 0 }, Fri: { sum: 0, count: 0 }, Sat: { sum: 0, count: 0 }, Sun: { sum: 0, count: 0 } };
  const weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  let totalScoreSum = 0;
  let hitsCount = 0;

  monthEntries.forEach(([date, entry]) => {
    const r = Number(entry.rating) || 3;
    ratingCounts[r] = (ratingCounts[r] || 0) + 1;
    totalScoreSum += r;
    if (r >= 3) hitsCount++;

    const dayOfWeek = weekdayNames[new Date(`${date}T00:00:00`).getDay()];
    if (weekdayTotals[dayOfWeek]) {
      weekdayTotals[dayOfWeek].sum += r;
      weekdayTotals[dayOfWeek].count++;
    }
  });

  const hitRate = Math.round((hitsCount / loggedCount) * 100);
  const avgScore = Number((totalScoreSum / loggedCount).toFixed(1));

  const weekdayAverages = {};
  ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].forEach(day => {
    const item = weekdayTotals[day];
    weekdayAverages[day] = item.count > 0 ? Number((item.sum / item.count).toFixed(1)) : 0;
  });

  const bestWeekday = Object.entries(weekdayAverages).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Wed';
  const worstWeekday = Object.entries(weekdayAverages).filter(([, score]) => score > 0).sort((a, b) => a[1] - b[1])[0]?.[0] || 'Mon';

  let personaTitle = 'The Disciplined Sustainer';
  let executiveSummary = '';
  let hiddenFacts = [];
  let frictionAnalysis = '';
  let goldenHabits = '';
  let nextMonthDirectives = [];

  if (hitRate >= 80) {
    personaTitle = 'The Relentless Velocity Builder';
    executiveSummary = `Dominated ${monthName} with an exceptional ${hitRate}% Hit Rate across ${loggedCount} days. Maintained relentless forward momentum and deep flow-state consistency.`;
    hiddenFacts = [
      `Peak Power Velocity: ${bestWeekday}s were your highest-output days with an average score of ${weekdayAverages[bestWeekday] || 4.8}/5.0.`,
      `Flow-State Mastery: Logged ${ratingCounts[5]} Peak (5/5) and ${ratingCounts[4]} Good (4/5) days with zero compounding slumps.`,
      `Discipline Defense: Successfully avoided multi-day friction loops throughout the entire month.`
    ];
    frictionAnalysis = `Minor friction accounted for only ${Math.round(((ratingCounts[1] + ratingCounts[2]) / loggedCount) * 100)}% of the month, immediately neutralized within 24 hours.`;
    goldenHabits = `Peak momentum was driven by uninterrupted deep work blocks, early morning execution, and proactive planning.`;
    nextMonthDirectives = [
      `Protect high-leverage flow blocks on ${bestWeekday}s.`,
      `Raise baseline targets to expand on this elite momentum.`,
      `Maintain clean nutrition and recovery to sustain high velocity.`
    ];
  } else if (hitRate >= 50) {
    personaTitle = 'The Resilient Equilibrium Builder';
    executiveSummary = `Maintained steady discipline in ${monthName} with a ${hitRate}% Hit Rate. Balanced standard routines while holding the baseline through fluctuating demands.`;
    hiddenFacts = [
      `Mid-Week Momentum: ${bestWeekday} delivered your strongest performance (${weekdayAverages[bestWeekday] || 3.8}/5.0).`,
      `Baseline Defense: Logged ${ratingCounts[3]} Okay (3/5) days, ensuring consistent output without severe crashes.`,
      `Recovery Window: Managed to bounce back from ${worstWeekday} fatigue within 1–2 days.`
    ];
    frictionAnalysis = `Friction points occurred during ${worstWeekday} context-switching and late afternoon fatigue.`;
    goldenHabits = `Good days were achieved when tasks were prioritized into single-focus execution blocks.`;
    nextMonthDirectives = [
      `Eliminate multi-tasking bottlenecks on ${worstWeekday}s.`,
      `Turn 3/5 baseline days into 4/5 Good days by scheduling single-task sprints.`,
      `Aim for an 80%+ Hit Rate next month.`
    ];
  } else {
    personaTitle = 'The Battle-Hardened Survivor';
    executiveSummary = `Navigated intense adversity in ${monthName} with ${ratingCounts[1] + ratingCounts[2]} friction days. Showed fierce resilience fighting through blockers and burnout.`;
    hiddenFacts = [
      `Adversity Endurance: Fought through ${ratingCounts[1]} Rough (1/5) and ${ratingCounts[2]} Down (2/5) days without giving up.`,
      `Recovery Spike: Achieved your highest rebound performance on ${bestWeekday}s (${weekdayAverages[bestWeekday] || 3.2}/5.0).`,
      `Resilience Factor: Despite heavy blockers, recorded ${hitsCount} winning battle days.`
    ];
    frictionAnalysis = `Heavy friction was driven by unexpected blockers, production outages, and cognitive overload.`;
    goldenHabits = `Turnaround moments happened when you simplified scope and tackled one single blocker at a time.`;
    nextMonthDirectives = [
      `Implement the 24-Hour Reset Rule: Never allow consecutive Rough days without a hard pause.`,
      `Protect sleep and mental bandwidth during heavy outage weeks.`,
      `Focus on micro-wins to rebuild momentum from 1/5 to 3/5 baseline.`
    ];
  }

  return {
    monthName,
    year,
    month,
    totalLogged: loggedCount,
    totalDaysInMonth,
    hitRate,
    avgScore,
    ratingCounts,
    weekdayAverages,
    personaTitle,
    executiveSummary,
    hiddenFacts,
    frictionAnalysis,
    goldenHabits,
    nextMonthDirectives
  };
}

export function exportDatabaseBackup(startDate, entries) {
  const payload = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    startDate,
    totalEntries: Object.keys(entries).length,
    entries
  };

  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(payload, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `daily_verdict_backup_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}
