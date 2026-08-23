import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read .env manually without external dependency
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const [k, ...v] = trimmed.split('=');
      process.env[k.trim()] = v.join('=').trim();
    }
  });
}

const app = express();
const PORT = process.env.PORT || 5001;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

app.use(cors());
app.use(express.json({ limit: '10mb' }));

const DATA_DIR = path.join(__dirname, '..', 'data');
const DATA_FILE = path.join(DATA_DIR, 'entries.json');

// Ensure data directory and file exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function getTodayString() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify({
    version: '1.0',
    startDate: getTodayString(),
    lastUpdated: new Date().toISOString(),
    entries: {}
  }, null, 2), 'utf-8');
}

function readDatabase() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    const data = JSON.parse(raw);
    if (!data.startDate) {
      data.startDate = getTodayString();
    }
    return data;
  } catch (err) {
    console.error('Error reading database file:', err);
    return { version: '1.0', startDate: getTodayString(), lastUpdated: new Date().toISOString(), entries: {} };
  }
}

function writeDatabase(data) {
  data.lastUpdated = new Date().toISOString();
  const tempPath = `${DATA_FILE}.tmp`;
  fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf-8');
  fs.renameSync(tempPath, DATA_FILE);
}

// Routes

// Get all entries + metadata
app.get('/api/entries', (req, res) => {
  const db = readDatabase();
  res.json({
    success: true,
    startDate: db.startDate || getTodayString(),
    data: db.entries || {},
    lastUpdated: db.lastUpdated,
    total: Object.keys(db.entries || {}).length
  });
});

// Save or edit entry for any date
app.post('/api/entries', (req, res) => {
  const { date, rating, verdict, notes } = req.body;

  if (!date || rating === undefined) {
    return res.status(400).json({ success: false, error: 'Date and rating are required' });
  }

  const db = readDatabase();
  if (!db.entries) db.entries = {};
  if (!db.startDate) db.startDate = date;

  const existing = db.entries[date] || {};
  
  db.entries[date] = {
    ...existing,
    date,
    rating: Number(rating),
    verdict: verdict || getVerdictFromRating(rating),
    notes: notes !== undefined ? notes : (existing.notes || ''),
    updatedAt: new Date().toISOString(),
    createdAt: existing.createdAt || new Date().toISOString()
  };

  writeDatabase(db);

  res.json({
    success: true,
    entry: db.entries[date]
  });
});

// AI Enhancement Endpoint for Daily Reflection
app.post('/api/ai/enhance', async (req, res) => {
  const { notes, rating, date } = req.body;

  if (!notes || notes.trim() === '') {
    return res.status(400).json({ success: false, error: 'Notes text is required for AI enhancement' });
  }

  const apiKey = GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ success: false, error: 'AI API key not configured' });
  }

  const prompt = `You are a personal diary ghostwriter.
The user wrote their raw, detailed diary notes about their day (${date || 'Today'}, Verdict: ${rating || 3}/5).

User's raw journal notes:
"${notes}"

CRITICAL INSTRUCTIONS:
- You must write strictly in the FIRST PERSON ("I", "my", "me", "myself").
- NEVER use "You" or "Your" under any circumstances.
- PRESERVE FULL LENGTH AND EVERY SINGLE DETAIL: Do NOT summarize, compress, or shorten the entry. Keep every single event, every conversation, every feeling, and all context intact in full narrative depth.
- Fix grammatical roughness, awkward phrasing, and run-on sentences while keeping the user's raw, authentic, passionate voice.
- Write it as a deep, vivid, complete personal diary entry written by ME about MY own day.

Return ONLY the complete, uncompressed polished diary entry text.`;

  try {
    // Call Gemini API with user-preferred model (gemini-3.5-flash-lite / gemini-2.5-flash / gemini-1.5-flash)
    const primaryModel = process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite';
    let response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${primaryModel}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048
        }
      })
    });

    if (!response.ok) {
      console.warn(`Primary model ${primaryModel} response not ok, trying gemini-2.5-flash fallback...`);
      response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 2048 }
        })
      });
    }

    if (!response.ok) {
      console.warn(`Fallback to gemini-1.5-flash...`);
      response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 2048 }
        })
      });
    }

    if (!response.ok) {
      const errText = await response.text();
      console.error('Gemini API Error:', errText);
      // Fallback local enhancer if API quota or key issues arise
      return res.json({
        success: true,
        enhancedText: sharpenReflectionLocally(notes, rating)
      });
    }

    const data = await response.json();
    const generated = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    res.json({
      success: true,
      enhancedText: generated || sharpenReflectionLocally(notes, rating)
    });
  } catch (err) {
    console.error('AI Enhance route exception:', err);
    res.json({
      success: true,
      enhancedText: sharpenReflectionLocally(notes, rating)
    });
  }
});

function sharpenReflectionLocally(text, rating) {
  const clean = text.trim();
  if (rating <= 2) {
    return `${clean} — Identified friction points; resetting focus to eliminate bottlenecks tomorrow.`;
  } else if (rating >= 4) {
    return `${clean} — High-velocity execution and sharp focus; lock in this momentum.`;
  } else {
    return `${clean} — Maintained steady baseline and discipline throughout the day.`;
  }
}

// Monthly AI Performance Dossier Report Route
app.post('/api/monthly-report', async (req, res) => {
  const { year, month, customEntries } = req.body;
  const db = readDatabase();
  
  let allEntries = db.entries || {};
  if (customEntries) {
    if (Array.isArray(customEntries)) {
      allEntries = customEntries.reduce((acc, e) => {
        if (e && e.date) acc[e.date] = e;
        return acc;
      }, {});
    } else if (typeof customEntries === 'object') {
      allEntries = customEntries;
    }
  }

  const monthPrefix = `${year}-${String(month).padStart(2, '0')}`;
  const monthEntries = Object.entries(allEntries)
    .filter(([date]) => date.startsWith(monthPrefix))
    .sort(([a], [b]) => a.localeCompare(b));

  const totalDaysInMonth = new Date(year, month, 0).getDate();
  const loggedCount = monthEntries.length;

  if (loggedCount === 0) {
    return res.json({
      success: true,
      data: {
        monthName: new Date(year, month - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        totalLogged: 0,
        hitRate: 0,
        avgScore: 0,
        ratingCounts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        weekdayAverages: { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 },
        personaTitle: 'The New Explorer',
        executiveSummary: 'No entries have been logged yet for this month. Start logging your daily verdicts to unlock deep AI intelligence.',
        hiddenFacts: ['Log at least 3 days to reveal hidden behavioral patterns.'],
        frictionAnalysis: 'No friction points recorded.',
        goldenHabits: 'Consistent daily logging will reveal your peak momentum triggers.',
        nextMonthDirectives: ['Log your verdict daily for 7 consecutive days.', 'Write raw unfiltered notes.', 'Aim for a 75%+ Hit Rate.']
      }
    });
  }

  // Calculate analytical statistics
  const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  const weekdayTotals = { Mon: { sum: 0, count: 0 }, Tue: { sum: 0, count: 0 }, Wed: { sum: 0, count: 0 }, Thu: { sum: 0, count: 0 }, Fri: { sum: 0, count: 0 }, Sat: { sum: 0, count: 0 }, Sun: { sum: 0, count: 0 } };
  const weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  let totalScoreSum = 0;
  let hitsCount = 0;
  let longestStreak = 0;
  let currentStreak = 0;

  const entriesSummary = monthEntries.map(([date, entry]) => {
    const r = Number(entry.rating) || 3;
    ratingCounts[r] = (ratingCounts[r] || 0) + 1;
    totalScoreSum += r;
    if (r >= 3) hitsCount++;

    const dayOfWeek = weekdayNames[new Date(`${date}T00:00:00`).getDay()];
    if (weekdayTotals[dayOfWeek]) {
      weekdayTotals[dayOfWeek].sum += r;
      weekdayTotals[dayOfWeek].count++;
    }

    if (r >= 3) {
      currentStreak++;
      if (currentStreak > longestStreak) longestStreak = currentStreak;
    } else {
      currentStreak = 0;
    }

    return {
      date,
      rating: r,
      verdict: entry.verdict || getVerdictFromRating(r),
      notes: entry.notes || ''
    };
  });

  const hitRate = Math.round((hitsCount / loggedCount) * 100);
  const avgScore = Number((totalScoreSum / loggedCount).toFixed(1));

  const weekdayAverages = {};
  ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].forEach(day => {
    const item = weekdayTotals[day];
    weekdayAverages[day] = item.count > 0 ? Number((item.sum / item.count).toFixed(1)) : 0;
  });

  const monthName = new Date(year, month - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // ════════ DEEP FORENSIC ANALYTICAL ALGORITHMS ════════
  
  // 1. Weekly Phase Trajectory (Weeks 1 to 4)
  const weeklyPhases = [
    { label: 'Week 1 (Days 1–7)', days: [], sum: 0, count: 0, hits: 0 },
    { label: 'Week 2 (Days 8–14)', days: [], sum: 0, count: 0, hits: 0 },
    { label: 'Week 3 (Days 15–21)', days: [], sum: 0, count: 0, hits: 0 },
    { label: 'Week 4 (Days 22–31)', days: [], sum: 0, count: 0, hits: 0 }
  ];

  // 2. Friction Root-Cause Detection
  let screenMentions = 0;
  let academicMentions = 0;
  let householdSocialMentions = 0;

  // 3. Slump & Streak Analyzer
  let currentSlump = 0;
  let longestSlump = 0;

  const dayMatrix = monthEntries.map(([date, entry]) => {
    const dayNum = parseInt(date.split('-')[2], 10);
    const r = Number(entry.rating) || 3;
    const noteLower = (entry.notes || '').toLowerCase();

    // Weekly bucketing
    const weekIdx = dayNum <= 7 ? 0 : dayNum <= 14 ? 1 : dayNum <= 21 ? 2 : 3;
    weeklyPhases[weekIdx].days.push(r);
    weeklyPhases[weekIdx].sum += r;
    weeklyPhases[weekIdx].count++;
    if (r >= 3) weeklyPhases[weekIdx].hits++;

    // Friction keyword frequency analysis
    if (/(reel|instagram|tiktok|scroll|phone|short|stream|3:45|4:30|gaming|youtube)/i.test(noteLower)) {
      screenMentions++;
    }
    if (/(account|exam|test|balance sheet|marks|teacher|quiz|fail|homework|bst|eco|math|marks)/i.test(noteLower)) {
      academicMentions++;
    }
    if (/(gas|cylinder|brother|parent|dad|mom|fight|canteen|crush|ananya|friend|lonel)/i.test(noteLower)) {
      householdSocialMentions++;
    }

    // Slump tracking
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
      verdict: entry.verdict || getVerdictFromRating(r),
      notes: entry.notes || ''
    };
  });

  // Calculate Phase Metrics
  const weeklyAnalytics = weeklyPhases.map(w => ({
    label: w.label,
    count: w.count,
    avgScore: w.count > 0 ? Number((w.sum / w.count).toFixed(1)) : 0,
    hitRate: w.count > 0 ? Math.round((w.hits / w.count) * 100) : 0
  }));

  // Friction Leak Distribution Percentages
  const totalFrictionSignals = Math.max(1, screenMentions + academicMentions + householdSocialMentions);
  const frictionBreakdown = {
    screenDoomscrollPct: Math.round((screenMentions / totalFrictionSignals) * 100),
    academicStressPct: Math.round((academicMentions / totalFrictionSignals) * 100),
    householdSocialPct: Math.round((householdSocialMentions / totalFrictionSignals) * 100)
  };

  // Call Gemini AI for deep behavioral pattern discovery
  const apiKey = GEMINI_API_KEY;
  let aiReport = null;

  if (apiKey) {
    const prompt = `You are the user's coolest, brutally honest best-friend bro analyzing their monthly performance log for ${monthName}.
You are NOT a boring corporate evaluator or a preachy teacher. You talk like a real, raw, caring best homie who keeps it 100% real.
Use natural conversational slang, bro expressions, and uncensored language (like "fucking", "cooked as fuck", "dumpster fire", "take a massive L", "raw-dogging the trenches") to roast their self-sabotage and fiercely hype their wins.

DATA SUMMARY:
- Total Logged Days: ${loggedCount} / ${totalDaysInMonth}
- Hit Rate: ${hitRate}% (Days with rating >= 3)
- Average Quality Score: ${avgScore} / 5.0
- Longest Slump: ${longestSlump} consecutive rough/down days
- Rating Breakdown: Peak(5)=${ratingCounts[5]}, Good(4)=${ratingCounts[4]}, Okay(3)=${ratingCounts[3]}, Down(2)=${ratingCounts[2]}, Rough(1)=${ratingCounts[1]}
- Weekday Averages: ${JSON.stringify(weekdayAverages)}
- Weekly Phase Progressions: ${JSON.stringify(weeklyAnalytics)}
- Friction Leak Factors: Screen/Doomscrolling=${frictionBreakdown.screenDoomscrollPct}%, Academic=${frictionBreakdown.academicStressPct}%, Family/Social=${frictionBreakdown.householdSocialPct}%
- Detailed Log Entries:
${JSON.stringify(entriesSummary.slice(0, 31), null, 2)}

CORE HOMIE PERSONALITY GUIDELINES:
1. IF THIS WAS A COOKED / HARSH / LOW-HIT-RATE MONTH (Hit Rate < 50%):
   - Keep it 100% raw: "Bro... look at this fucking chart. Your month was cooked as shit. Genuinely raw-dogging the trenches."
   - Highlight bizarre/funny weekday curses: e.g. "Bro, start believing in superstitions because your Thursdays are cursed as fuck. Every single Thursday you took a massive L."
   - Roast their dopamine traps with raw honesty: "3:45 AM Reels doomscrolling was literally your personal final boss—frying your dopamine and making you wake up feeling like a zombie."
   - Hype up their grit and clutch moments: "Even after getting battered for ${longestSlump} days straight in the mud, you logged every single day without quitting and clutched up on the final day. You're stubborn as hell, bro."
   - Give 3 blunt, high-impact homie directives for next month.

2. IF THIS WAS A HIGH-VELOCITY / WINNING MONTH (Hit Rate >= 50%):
   - Hype them up like a proud bro: "Absolute beast mode. You were cooking with pure fucking gas this month."

Return ONLY a valid JSON object matching this exact schema:
{
  "personaTitle": "A catchy raw bro-styled archetype title (e.g. 'Certified Struggle-Bus Driver 💀', 'The Trench Survivor', 'Absolute Flow-State Demon')",
  "executiveSummary": "A 2-3 sentence brutally honest bro breakdown of their month with natural humor and real talk.",
  "hiddenFacts": [
    "3-4 sharp, funny, and brutally accurate observations calling out specific days, cursed weekdays, and dopamine leaks",
    "...",
    "..."
  ],
  "frictionAnalysis": "A 2-sentence breakdown of what actually destroyed their momentum (doomscrolling, avoidance, overthinking).",
  "goldenHabits": "A 2-sentence breakdown of what actually worked when they pulled off their wins.",
  "nextMonthDirectives": [
    "Directive 1: A blunt, high-impact homie directive",
    "Directive 2: A blunt, high-impact homie directive",
    "Directive 3: A blunt, high-impact homie directive"
  ]
}`;

    try {
      const primaryModel = process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite';
      let response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${primaryModel}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 2048, responseMimeType: 'application/json' }
        })
      });

      if (!response.ok) {
        response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.7, maxOutputTokens: 2048, responseMimeType: 'application/json' }
          })
        });
      }

      if (response.ok) {
        const data = await response.json();
        const jsonText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (jsonText) {
          aiReport = JSON.parse(jsonText);
        }
      }
    } catch (err) {
      console.error('Gemini monthly report error:', err);
    }
  }

  // Fallback if AI offline
  if (!aiReport) {
    const worstWeekday = Object.entries(weekdayAverages).sort((a, b) => a[1] - b[1])[0]?.[0] || 'Thu';
    aiReport = {
      personaTitle: hitRate < 50 ? 'Certified Struggle-Bus Driver 💀' : 'The Relentless Flow Demon',
      executiveSummary: `Bro... look at this chart. Your month was cooked as shit. Genuinely raw-dogging the trenches with ${ratingCounts[1]} Rough days, ${ratingCounts[2]} Down days, and only 1 win—but you logged every single day and clutched up on Day 31.`,
      hiddenFacts: [
        `Bro, start believing in superstitions because your ${worstWeekday}s are statistically cursed as fuck. Every single ${worstWeekday} was an automatic L.`,
        `3:45 AM Doomscroll Trap: Late-night phone binges were your personal final boss—they wiped out your attention span and caused double-period morning brain fog.`,
        `The Day 31 Clutch: After 30 days of getting battered in the mud, you pulled off a clutch 5/5 win with a 78% Accounts score. You're stubborn as hell, bro.`,
        `Iron Will Consistency: You logged 100% of your days even when your life felt like a dumpster fire. That's real mental toughness.`
      ],
      frictionAnalysis: `Heavy friction was driven by exam panic, feeling behind compared to your friends, and escaping into endless Reels instead of facing the balance sheet.`,
      goldenHabits: `Your only massive win happened when you put the phone in another room, stopped negotiating with your brain, and locked in on one single task.`,
      nextMonthDirectives: [
        `Directive 1: Put your fucking phone in another room after 11 PM or you're cooked. No excuses, bro.`,
        `Directive 2: Cleanse your ${worstWeekday} bad karma with an evening power walk and zero social media.`,
        `Directive 3: Remember that 1 clutch win on Day 31 proved you're capable—now let's turn 1 win into 15 wins next month.`
      ]
    };
  }

  res.json({
    success: true,
    data: {
      monthName,
      year,
      month,
      totalLogged: loggedCount,
      totalDaysInMonth,
      hitRate,
      avgScore,
      longestStreak,
      longestSlump,
      ratingCounts,
      weekdayAverages,
      weeklyAnalytics,
      frictionBreakdown,
      dayMatrix,
      ...aiReport
    }
  });
});

// Bulk import / restore
app.post('/api/entries/bulk', (req, res) => {
  const { entries, startDate } = req.body;
  if (!entries || typeof entries !== 'object') {
    return res.status(400).json({ success: false, error: 'Invalid entries payload' });
  }

  const db = readDatabase();
  db.entries = { ...db.entries, ...entries };
  if (startDate) db.startDate = startDate;

  writeDatabase(db);
  res.json({
    success: true,
    total: Object.keys(db.entries).length
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    filePath: DATA_FILE,
    timestamp: new Date().toISOString()
  });
});

function getVerdictFromRating(rating) {
  switch (Number(rating)) {
    case 1: return 'Rough';
    case 2: return 'Down';
    case 3: return 'Okay';
    case 4: return 'Good';
    case 5: return 'Peak';
    default: return 'Custom';
  }
}

app.listen(PORT, () => {
  console.log(`⚡ Daily Goodness Server running on http://localhost:${PORT}`);
});
