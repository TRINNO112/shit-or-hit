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

  // Call Gemini AI for deep behavioral pattern discovery
  const apiKey = GEMINI_API_KEY;
  let aiReport = null;

  if (apiKey) {
    const prompt = `You are the Master Performance Intelligence Analyst for Daily Verdict.
Analyze the following user monthly log data for ${monthName}:

DATA SUMMARY:
- Total Logged Days: ${loggedCount} / ${totalDaysInMonth}
- Hit Rate: ${hitRate}% (Days with rating >= 3)
- Average Quality Score: ${avgScore} / 5.0
- Rating Breakdown: Peak(5)=${ratingCounts[5]}, Good(4)=${ratingCounts[4]}, Okay(3)=${ratingCounts[3]}, Down(2)=${ratingCounts[2]}, Rough(1)=${ratingCounts[1]}
- Weekday Average Scores: ${JSON.stringify(weekdayAverages)}
- Detailed Log Entries with Notes:
${JSON.stringify(entriesSummary.slice(0, 31), null, 2)}

CORE PSYCHOLOGICAL & ANALYTICAL GUIDELINES:
1. IF THIS WAS A HARSH / ROUGH / LOW-SCORE MONTH (Hit Rate < 50% or High Rough/Down counts):
   - DO NOT shame, lecture, or sound alarmed.
   - FRAME WITH STOIC DIGNITY: Commend the user for staying in the arena and logging honestly (e.g. Archetypes like 'The Battle-Tested Stoic', 'The Storm Navigator', 'The Resilient Fighter').
   - ROOT-CAUSE FORENSICS: Identify the real systemic leaks (e.g., fatigue spillover, context switching, outage firefights, broken sleep).
   - HIGHLIGHT HIDDEN MICRO-WINS: Spot the days they fought back (rebound spikes, streak resets, perseverance).
   - EMERGENCY TURNAROUND DIRECTIVES: Provide 3 concrete, low-friction recovery rules (e.g. The 24-Hour Circuit Breaker, Lowering baseline target to 3/5 Okay first, Single Non-Negotiable Anchor Win).

2. IF THIS WAS A BALANCED OR HIGH-VELOCITY MONTH (Hit Rate >= 50%):
   - Highlight flow-state mastery, peak power weekdays, and proactive momentum defense.

Return ONLY a valid JSON object matching this exact schema:
{
  "personaTitle": "A powerful 2-4 word archetype title (e.g. 'The Battle-Tested Stoic', 'The Relentless Velocity Builder')",
  "executiveSummary": "A 2-3 sentence executive synthesis focusing on resilience, momentum, and truth-to-reality.",
  "hiddenFacts": [
    "3-4 surprising, specific facts or behavioral correlations (e.g. 'Tuesday Fatigue Drag: Tuesdays triggered a 30% momentum dip that spilled into Wednesday mornings', 'Rebound Velocity: On Day 14, after 3 rough days, you snapped the slump with a 4/5 Good rating', 'Honesty Consistency: Maintained 100% daily logging during heavy crisis weeks')",
    "...",
    "..."
  ],
  "frictionAnalysis": "A 2-sentence forensic breakdown of what triggered Down/Rough days and the underlying bottleneck.",
  "goldenHabits": "A 2-sentence breakdown of what triggered turnaround moments, micro-wins, or Peak (5/5) days.",
  "nextMonthDirectives": [
    "Directive 1: Concrete tactical rule for next month",
    "Directive 2: Concrete tactical rule for next month",
    "Directive 3: Concrete tactical rule for next month"
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
    const bestWeekday = Object.entries(weekdayAverages).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Wed';
    aiReport = {
      personaTitle: hitRate >= 80 ? 'The High-Velocity Strategist' : hitRate >= 60 ? 'The Resilient Builder' : 'The Disciplined Fighter',
      executiveSummary: `Logged ${loggedCount} days in ${monthName} with an impressive ${hitRate}% Hit Rate and an average quality rating of ${avgScore}/5.0.`,
      hiddenFacts: [
        `Peak Power Day: ${bestWeekday} was your highest momentum day of the week with an average score of ${weekdayAverages[bestWeekday] || 4.0}/5.0.`,
        `Hit Consistency: You maintained a solid ${hitRate}% winning day ratio across ${loggedCount} recorded days.`,
        `Recovery Resilience: Logged ${ratingCounts[1] + ratingCounts[2]} friction days with fast mental resets.`
      ],
      frictionAnalysis: `Friction days accounted for ${Math.round(((ratingCounts[1] + ratingCounts[2]) / loggedCount) * 100)}% of your month, mostly driven by task fatigue or context switching.`,
      goldenHabits: `Your ${ratingCounts[5]} Peak days and ${ratingCounts[4]} Good days occurred when focus was concentrated on uninterrupted priority blocks.`,
      nextMonthDirectives: [
        `Protect peak momentum on ${bestWeekday}s for high-leverage tasks.`,
        `Maintain the 24-hour rule: Never allow two consecutive Down/Rough days.`,
        `Aim to increase monthly Hit Rate to ${Math.min(100, hitRate + 5)}%.`
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
      ratingCounts,
      weekdayAverages,
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
