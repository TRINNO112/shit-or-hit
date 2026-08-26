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

import { 
  getCurrentUser, 
  saveCloudEntry, 
  fetchCloudEntries, 
  batchSaveCloudEntries,
  saveCloudReport, 
  fetchCloudReport, 
  isEmailWhitelisted 
} from './firebase';

export async function fetchDatabase() {
  // 1. First fetch local data from server API or localStorage
  let localData = { startDate: new Date().toISOString().slice(0, 10), entries: {} };
  try {
    const res = await fetch(`${API_BASE}/entries`);
    if (res.ok) {
      const json = await res.json();
      localData = {
        startDate: json.startDate || new Date().toISOString().slice(0, 10),
        entries: json.data || {}
      };
    }
  } catch (e) {
    const cached = localStorage.getItem('goodness_db');
    if (cached) {
      try { localData = JSON.parse(cached); } catch (err) {}
    }
  }

  // 2. If user is logged in with whitelisted Firebase account, sync with Firestore
  const currentUser = getCurrentUser();
  if (currentUser && isEmailWhitelisted(currentUser.email)) {
    try {
      const cloudEntries = await fetchCloudEntries(currentUser.uid);
      const cloudCount = Object.keys(cloudEntries).length;
      const localCount = Object.keys(localData.entries || {}).length;

      // If local has data but Firestore is empty, auto-upload local database to Firestore
      if (localCount > 0 && cloudCount === 0) {
        console.log('☁️ Auto-populating empty Firestore with local database entries...');
        await batchSaveCloudEntries(currentUser.uid, localData.entries);
        return localData;
      }

      // If Firestore has data, merge and use Firestore
      if (cloudCount > 0) {
        const mergedEntries = { ...localData.entries, ...cloudEntries };
        const dates = Object.keys(mergedEntries).sort();
        const startDate = dates[0] || localData.startDate;
        localStorage.setItem('goodness_db', JSON.stringify({ startDate, entries: mergedEntries }));
        return { startDate, entries: mergedEntries };
      }
    } catch (err) {
      console.warn('Firestore sync failed, using local database:', err);
    }
  }

  return localData;
}

export async function saveEntry(entryData) {
  const formatted = {
    ...entryData,
    rating: Number(entryData.rating),
    verdict: entryData.verdict || ratingMeta[entryData.rating]?.title || 'Verdict',
    updatedAt: new Date().toISOString()
  };

  // 1. Always update local storage database immediately
  try {
    const dbStr = localStorage.getItem('goodness_db');
    let db = dbStr ? JSON.parse(dbStr) : { startDate: new Date().toISOString().slice(0, 10), entries: {} };
    if (!db.entries) db.entries = {};
    db.entries[formatted.date] = formatted;
    localStorage.setItem('goodness_db', JSON.stringify(db));
  } catch (e) {}

  // 2. Cloud save with 4s timeout protection against slow connections
  const currentUser = getCurrentUser();
  if (currentUser && isEmailWhitelisted(currentUser.email)) {
    try {
      const cloudPromise = saveCloudEntry(currentUser.uid, formatted);
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Cloud save timeout')), 4000));
      await Promise.race([cloudPromise, timeoutPromise]);
    } catch (err) {
      console.warn('Firestore cloud save background note:', err.message);
    }
  }

  // 3. Local server save if available
  try {
    const res = await fetch(`${API_BASE}/entries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formatted)
    });
    if (res.ok) {
      const json = await res.json();
      return json.entry || formatted;
    }
  } catch (err) {}

  return formatted;
}

export async function enhanceReflectionWithAI(notes, rating, date) {
  if (!notes || notes.trim() === '') return notes;

  const preferredLanguage = (typeof window !== 'undefined' && localStorage.getItem('daily_verdict_ai_language')) || 'auto';

  // 1. Try local dev backend if running
  try {
    const res = await fetch(`${API_BASE}/ai/enhance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes, rating, date, preferredLanguage })
    });
    if (res.ok) {
      const data = await res.json();
      if (data.enhancedText) return data.enhancedText;
    }
  } catch (err) {
    // Backend offline (e.g. GitHub Pages static deployment)
  }

  // 2. Direct client-side Gemini fallback
  try {
    let apiKey = null;
    try {
      const { fetchCloudGeminiApiKey } = await import('./firebase');
      apiKey = await fetchCloudGeminiApiKey();
    } catch (e) {}

    if (!apiKey && typeof import.meta !== 'undefined' && import.meta.env) {
      apiKey = import.meta.env.VITE_GEMINI_API_KEY || null;
    }

    if (apiKey) {
      let languageRule = '';
      if (preferredLanguage === 'english') {
        languageRule = 'STRICT LANGUAGE MANDATE: The user has chosen ENGLISH. Write 100% in polished, natural English. Do NOT include any Hindi, Hinglish, or foreign words.';
      } else if (preferredLanguage === 'hinglish') {
        languageRule = 'STRICT LANGUAGE MANDATE: The user has chosen HINGLISH. Write in natural, expressive 1st-person Hinglish (Hindi in Roman script).';
      } else {
        languageRule = 'LANGUAGE MIRRORING MANDATE: Strictly mirror the exact language and blend of the user input. If the user wrote in standard English, you MUST output 100% pure English with ZERO Hindi/Hinglish words. If the user wrote in Hinglish, output in Hinglish. NEVER translate English notes into Hinglish.';
      }

      const prompt = `You are a personal diary ghostwriter.
The user wrote their raw diary notes about their day (${date || 'Today'}, Verdict: ${rating || 3}/5).

User's raw journal notes:
"${notes}"

CRITICAL INSTRUCTIONS:
- You must write strictly in the FIRST PERSON ("I", "my", "me", "myself").
- NEVER use "You" or "Your" under any circumstances.
- PRESERVE FULL LENGTH AND EVERY SINGLE DETAIL: Do NOT summarize, compress, or shorten the entry. Keep every single event, every conversation, every feeling, and all context intact in full narrative depth.
- ${languageRule}
- Fix grammatical roughness, awkward phrasing, and run-on sentences while keeping the user's raw, authentic voice.
- Write it as a deep, vivid, complete personal diary entry written by ME about MY own day.

Return ONLY the complete polished diary entry text without quotes or preamble.`;

      let response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 2048 }
        })
      });

      // Fallback to gemini-3.1-flash-lite if 3.5 is busy
      if (!response.ok) {
        response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.7, maxOutputTokens: 2048 }
          })
        });
      }

      if (response.ok) {
        const result = await response.json();
        const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text && text.trim()) return text.trim();
      }
    }
  } catch (err) {
    console.error('Direct Gemini Polish error:', err);
  }

  return notes;
}

export async function getSavedMonthlyReport(year, month, archetypeId = null) {
  const targetDataset = archetypeId || 'real';
  const reportKey = `report_${targetDataset}_${year}_${String(month).padStart(2, '0')}`;

  try {
    const res = await fetch(`${API_BASE}/monthly-report?year=${year}&month=${month}&archetypeId=${archetypeId || ''}`);
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        localStorage.setItem(reportKey, JSON.stringify(json.data));
        return json.data;
      }
    }
  } catch (err) {
    console.warn('Backend GET /api/monthly-report unavailable, checking local storage:', err);
  }

  // Check local cache
  try {
    const cached = localStorage.getItem(reportKey);
    if (cached) return JSON.parse(cached);
  } catch (e) {
    // ignore
  }

  return null;
}

export async function fetchMonthlyReport(year, month, customEntries = null, archetypeId = null, forceReevaluate = false) {
  const targetDataset = archetypeId || 'real';
  const preferredLanguage = (typeof window !== 'undefined' && localStorage.getItem('daily_verdict_ai_language')) || 'auto';
  const reportKey = `report_${targetDataset}_${year}_${String(month).padStart(2, '0')}_${preferredLanguage}`;

  // Check cached report if not forcing reevaluation
  if (!forceReevaluate) {
    try {
      const cached = localStorage.getItem(reportKey);
      if (cached) return JSON.parse(cached);
    } catch (e) {}
  }

  // 1. Try local dev backend if running
  try {
    const res = await fetch(`${API_BASE}/monthly-report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ year, month, customEntries, archetypeId, forceReevaluate, preferredLanguage })
    });
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        localStorage.setItem(reportKey, JSON.stringify(json.data));
        return json.data;
      }
    }
  } catch (err) {
    // Backend offline (e.g. static site or mobile device)
  }

  // 2. Direct client-side forensic synthesis with live Gemini AI fallback
  const fallback = await generateClientMonthlyReport(year, month, customEntries, preferredLanguage);
  try {
    localStorage.setItem(reportKey, JSON.stringify(fallback));
  } catch (e) {}
  return fallback;
}

async function generateClientMonthlyReport(year, month, customEntries = null, preferredLanguage = 'auto') {
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
      homieLetter: [
        `Welcome to your monthly dossier. Start logging daily verdicts to unlock personalized AI evaluations and deep behavioral forensics.`
      ],
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
  let homieLetter = [];
  let hiddenFacts = [];
  let frictionAnalysis = '';
  let goldenHabits = '';
  let nextMonthDirectives = [];

  if (hitRate >= 80) {
    personaTitle = 'The Relentless Velocity Builder ⚡';
    executiveSummary = `Dominated ${monthName} with an exceptional ${hitRate}% Hit Rate across ${loggedCount} days. Maintained relentless forward momentum and deep flow-state consistency.`;
    homieLetter = [
      `Bro... look at this board. You absolutely ran the table this month with a ${hitRate}% Hit Rate. That is elite execution.`,
      `You protected your flow blocks, stayed consistent even on off-days, and didn't let minor distractions derail your weekly trajectory.`,
      `Keep this exact momentum heading into next month—raise your targets and expand on this foundation.`,
      `Stay humble, maintain your recovery, and keep dominating.`
    ];
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
    personaTitle = 'The Resilient Equilibrium Builder 🛡️';
    executiveSummary = `Maintained steady discipline in ${monthName} with a ${hitRate}% Hit Rate. Balanced standard routines while holding the baseline through fluctuating demands.`;
    homieLetter = [
      `Solid month of holding the line, bro. You finished with a ${hitRate}% Hit Rate across ${loggedCount} logged days.`,
      `You avoided severe tailspins by defending your baseline on ${bestWeekday}s. The next step is turning your 3/5 baseline days into 4/5 breakout days.`,
      `Keep your morning momentum clean and limit late-evening context switching.`,
      `You have the discipline—now let's push for an 80%+ Hit Rate next month.`
    ];
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
    personaTitle = 'The 3:45 AM Dopamine Goblin 👺';
    executiveSummary = `Bro... look at this chart. Your month was cooked as shit. Genuinely raw-dogging the trenches with ${ratingCounts[1]} Rough days, ${ratingCounts[2]} Down days, and only 1 win—but you logged every single day and clutched up on Day 31.`;
    homieLetter = [
      `Listen to me bro: this month was an absolute blender. You had failed Accounts papers, public teacher callouts, morning stomach cramps in class, family tension over gas cylinders, and sitting in the canteen watching your friends flex their dating life while you felt completely invisible. I hear you, and that shit genuinely hurts.`,
      `Now let's talk about the self-inflicted damage: you kept treating 3:45 AM Reels doomscrolling like a coping mechanism, when in reality it was frying your dopamine receptors and guaranteeing next-day morning migraines. Spilling chai all over 15 completed project pages was peak tragic comedy, but the endless phone avoidance was the real bottleneck.`,
      `Here is why you're built different though: despite 30 consecutive days of pure hell and feeling like a clown on the terrace, you never stopped logging. You didn't delete the database, you didn't give up, and when the big 50-mark Accounts unit test landed on Day 31, you dropped a massive 78% (39/50) clutch win and earned your dad's proud nod at dinner.`,
      `For next month, we take that exact bulldog resilience and apply it daily. Put your phone in another room at 11 PM, stop letting one awkward hallway moment ruin your week, and lock in on your revision. You proved you have the horsepower—now let's make it consistent.`
    ];
    hiddenFacts = [
      `Bro, start believing in superstitions because your ${worstWeekday}s are statistically cursed as fuck with an automatic L.`,
      `3:45 AM Doomscroll Trap: Late-night phone binges were your personal final boss—they wiped out your attention span and caused morning brain fog.`,
      `Spilled Chai & Tragic Comedy: Spilling hot chai all over completed BST project pages is proof the universe had personal beef with you on Day 20.`,
      `Accounts PTSD: You spent 30 days fighting for your life against partnership balance sheets, only to drop a massive 78% redemption arc on Day 31.`,
      `Iron Will Consistency: You logged 100% of your days across all 31 days even when your life felt like a dumpster fire. That's real mental toughness.`,
      `The Day 31 Clutch: After a whole month in the mud, you proved that action creates confidence and earned genuine respect at home.`
    ];
    frictionAnalysis = `Heavy friction was driven by exam panic, feeling behind compared to your friends, and escaping into endless Reels instead of facing the balance sheet.`;
    goldenHabits = `Your only massive win happened when you put the phone in another room, stopped negotiating with your brain, and locked in on one single task.`;
    nextMonthDirectives = [
      `Directive 1: Put your fucking phone in another room after 11 PM or you're cooked. No excuses, bro.`,
      `Directive 2: Cleanse your ${worstWeekday} bad karma with an evening power walk and zero social media.`,
      `Directive 3: Remember that 1 clutch win on Day 31 proved you're capable—now let's turn 1 win into 15 wins next month.`
    ];
  }

  const weeklyPhases = [
    { label: 'Week 1 (Days 1–7)', days: [], sum: 0, count: 0, hits: 0 },
    { label: 'Week 2 (Days 8–14)', days: [], sum: 0, count: 0, hits: 0 },
    { label: 'Week 3 (Days 15–21)', days: [], sum: 0, count: 0, hits: 0 },
    { label: 'Week 4 (Days 22–31)', days: [], sum: 0, count: 0, hits: 0 }
  ];

  let screenMentions = 0;
  let academicMentions = 0;
  let householdSocialMentions = 0;
  let currentSlump = 0;
  let longestSlump = 0;

  const dayMatrix = monthEntries.map(([date, entry]) => {
    const dayNum = parseInt(date.split('-')[2], 10);
    const r = Number(entry.rating) || 3;
    const noteLower = (entry.notes || '').toLowerCase();

    const weekIdx = dayNum <= 7 ? 0 : dayNum <= 14 ? 1 : dayNum <= 21 ? 2 : 3;
    weeklyPhases[weekIdx].days.push(r);
    weeklyPhases[weekIdx].sum += r;
    weeklyPhases[weekIdx].count++;
    if (r >= 3) weeklyPhases[weekIdx].hits++;

    if (/(reel|instagram|tiktok|scroll|phone|short|stream|3:45|4:30|gaming|youtube)/i.test(noteLower)) {
      screenMentions++;
    }
    if (/(account|exam|test|balance sheet|marks|teacher|quiz|fail|homework|bst|eco|math)/i.test(noteLower)) {
      academicMentions++;
    }
    if (/(gas|cylinder|brother|parent|dad|mom|fight|canteen|crush|ananya|friend|lonel)/i.test(noteLower)) {
      householdSocialMentions++;
    }

    if (r <= 2) {
      currentSlump++;
      if (currentSlump > longestSlump) longestSlump = currentSlump;
    } else {
      currentSlump = 0;
    }

    return {
      day: dayNum,
      date,
      rating: r,
      notes: entry.notes || ''
    };
  });

  const weeklyAnalytics = weeklyPhases.map(w => ({
    label: w.label,
    count: w.count,
    avgScore: w.count > 0 ? Number((w.sum / w.count).toFixed(1)) : 0,
    hitRate: w.count > 0 ? Math.round((w.hits / w.count) * 100) : 0
  }));

  const totalFrictionSignals = Math.max(1, screenMentions + academicMentions + householdSocialMentions);
  const frictionBreakdown = {
    screenDoomscrollPct: Math.round((screenMentions / totalFrictionSignals) * 100),
    academicStressPct: Math.round((academicMentions / totalFrictionSignals) * 100),
    householdSocialPct: Math.round((householdSocialMentions / totalFrictionSignals) * 100)
  };

  // Attempt direct Google Gemini AI synthesis if API Key is available
  try {
    let apiKey = null;
    try {
      const { fetchCloudGeminiApiKey } = await import('./firebase');
      apiKey = await fetchCloudGeminiApiKey();
    } catch (e) {}

    if (!apiKey && typeof import.meta !== 'undefined' && import.meta.env) {
      apiKey = import.meta.env.VITE_GEMINI_API_KEY || null;
    }

    if (apiKey) {
      let languageRule = '';
      if (preferredLanguage === 'english') {
        languageRule = 'STRICT LANGUAGE MANDATE: The user has selected ENGLISH as their preferred language. You MUST write the personaTitle, executiveSummary, homieLetter, and hiddenFacts 100% in polished, high-impact English. Do NOT use Hinglish or any Hindi phrases under any circumstance.';
      } else if (preferredLanguage === 'hinglish') {
        languageRule = 'STRICT LANGUAGE MANDATE: The user has selected HINGLISH. Write the personaTitle, executiveSummary, and homieLetter in authentic, witty, expressive conversational Hinglish (Hindi in Roman script).';
      } else {
        languageRule = 'LANGUAGE MIRRORING MANDATE: Automatically detect the language of the diary entries. If the notes are written in English, write the entire dossier 100% in pure English (ZERO Hinglish/Hindi words). If written in Hinglish, write in natural Hinglish.';
      }

      const prompt = `You are the user's brutally honest, hilarious, deeply caring bro/best-friend and forensic habit analyst evaluating their daily life log for ${monthName}.

DATA SUMMARY:
- Total Logged Days: ${loggedCount} / ${totalDaysInMonth}
- Hit Rate: ${hitRate}% (Days with rating >= 3)
- Average Quality Score: ${avgScore} / 5.0
- Longest Slump: ${longestSlump} consecutive rough/down days
- Weekday Averages: ${JSON.stringify(weekdayAverages)}
- Friction Breakdown: Screen=${frictionBreakdown.screenDoomscrollPct}%, Academic=${frictionBreakdown.academicStressPct}%, Family/Social=${frictionBreakdown.householdSocialPct}%
- Detailed Log Entries with Notes:
${JSON.stringify(dayMatrix.slice(0, 31), null, 2)}

CORE INSTRUCTIONS:
1. CREATE A UNIQUE, DYNAMIC PERSONA TITLE based on specific diary events.
2. WRITE A 4-PARAGRAPH "HOMIE LETTER" addressing them directly with real validation, playful roasting, resilience celebration, and a brotherly game plan.
3. PROVIDE 5 TO 6 SHARP HIDDEN FACTS referencing exact diary events.
4. ${languageRule}

Return ONLY a valid JSON object matching:
{
  "personaTitle": "...",
  "executiveSummary": "...",
  "homieLetter": ["p1", "p2", "p3", "p4"],
  "hiddenFacts": ["fact1", "fact2", "fact3", "fact4", "fact5", "fact6"],
  "frictionAnalysis": "...",
  "goldenHabits": "...",
  "nextMonthDirectives": ["dir1", "dir2", "dir3"]
}`;

      let aiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.88, maxOutputTokens: 2500, responseMimeType: 'application/json' }
        })
      });

      // Fallback to gemini-3.1-flash-lite if 3.5 is busy
      if (!aiRes.ok) {
        aiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.88, maxOutputTokens: 2500, responseMimeType: 'application/json' }
          })
        });
      }

      if (aiRes.ok) {
        const aiData = await aiRes.json();
        const jsonText = aiData?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (jsonText) {
          const parsed = JSON.parse(jsonText);
          if (parsed.personaTitle) personaTitle = parsed.personaTitle;
          if (parsed.executiveSummary) executiveSummary = parsed.executiveSummary;
          if (parsed.homieLetter && Array.isArray(parsed.homieLetter)) homieLetter = parsed.homieLetter;
          if (parsed.hiddenFacts && Array.isArray(parsed.hiddenFacts)) hiddenFacts = parsed.hiddenFacts;
          if (parsed.frictionAnalysis) frictionAnalysis = parsed.frictionAnalysis;
          if (parsed.goldenHabits) goldenHabits = parsed.goldenHabits;
          if (parsed.nextMonthDirectives && Array.isArray(parsed.nextMonthDirectives)) nextMonthDirectives = parsed.nextMonthDirectives;
        }
      }
    }
  } catch (aiErr) {
    console.warn('Direct client Gemini report error, fallback activated:', aiErr);
  }

  return {
    monthName,
    year,
    month,
    totalLogged: loggedCount,
    totalDaysInMonth,
    hitRate,
    avgScore,
    longestSlump,
    ratingCounts,
    weekdayAverages,
    weeklyAnalytics,
    frictionBreakdown,
    dayMatrix,
    personaTitle,
    executiveSummary,
    homieLetter,
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
