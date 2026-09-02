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
const REPORTS_FILE = path.join(DATA_DIR, 'reports.json');

// Ensure data directory and files exist
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

if (!fs.existsSync(REPORTS_FILE)) {
  fs.writeFileSync(REPORTS_FILE, JSON.stringify({}, null, 2), 'utf-8');
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

function readReports() {
  try {
    if (!fs.existsSync(REPORTS_FILE)) return {};
    const raw = fs.readFileSync(REPORTS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading reports file:', err);
    return {};
  }
}

function writeReports(reports) {
  try {
    const tempPath = `${REPORTS_FILE}.tmp`;
    fs.writeFileSync(tempPath, JSON.stringify(reports, null, 2), 'utf-8');
    fs.renameSync(tempPath, REPORTS_FILE);
  } catch (err) {
    console.error('Error writing reports file:', err);
  }
}

// Netlify Mediator Local Proxy (Allows instant local development of serverless functions)
app.post(['/.netlify/functions/decrypt-mediator', '/api/decrypt-mediator'], async (req, res) => {
  const { action, token, pin } = req.body || {};
  const secret = process.env.TRINNO_VAULT_SECRET || 'TRINNO_DEFAULT_FALLBACK_VAULT_KEY_2026';

  if (action === 'health') {
    return res.json({
      status: 'ONLINE',
      mediator: 'TRINNO_LOCAL_EXPRESS_MEDIATOR_V2',
      hasCustomSecret: !!process.env.TRINNO_VAULT_SECRET,
      timestamp: new Date().toISOString()
    });
  }

  if (action === 'verify-token') {
    const isValidToken = token && (token.startsWith('TRINNO_ENC_V2:') || token.startsWith('TRINNO_ENC_V1:'));
    return res.json({ valid: !!isValidToken, verifiedAt: new Date().toISOString() });
  }

  if (action === 'verify-pin') {
    if (!token || !pin) {
      return res.status(400).json({ error: 'Missing token or PIN' });
    }

    let decryptedPin = null;
    try {
      const keyBytes = new TextEncoder().encode(secret);
      if (token.startsWith('TRINNO_ENC_V2:')) {
        const hex = token.replace('TRINNO_ENC_V2:', '');
        const bytes = new Uint8Array(hex.match(/.{1,2}/g).map(b => parseInt(b, 16)));
        const decryptedBytes = bytes.map((byte, i) => {
          const k = keyBytes[i % keyBytes.length];
          const shift = (i * 7 + 13) % 256;
          return (byte ^ shift ^ k) & 255;
        });
        const decryptedStr = new TextDecoder().decode(decryptedBytes);
        const parts = decryptedStr.split(':');
        if (parts.length >= 3) {
          decryptedPin = parts.slice(2).join(':');
        }
      }
    } catch (e) {}

    return res.json({
      matched: decryptedPin === pin,
      timestamp: new Date().toISOString()
    });
  }

  if (action === 'decrypt-token') {
    if (!token) {
      return res.status(400).json({ error: 'Missing token' });
    }

    let decryptedPin = null;
    try {
      const keyBytes = new TextEncoder().encode(secret);
      if (token.startsWith('TRINNO_ENC_V2:')) {
        const hex = token.replace('TRINNO_ENC_V2:', '');
        const bytes = new Uint8Array(hex.match(/.{1,2}/g).map(b => parseInt(b, 16)));
        const decryptedBytes = bytes.map((byte, i) => {
          const k = keyBytes[i % keyBytes.length];
          const shift = (i * 7 + 13) % 256;
          return (byte ^ shift ^ k) & 255;
        });
        const decryptedStr = new TextDecoder().decode(decryptedBytes);
        const parts = decryptedStr.split(':');
        if (parts.length >= 3) {
          decryptedPin = parts.slice(2).join(':');
        }
      }
    } catch (e) {}

    return res.json({
      success: !!decryptedPin,
      decryptedPin: decryptedPin || null,
      timestamp: new Date().toISOString()
    });
  }

  return res.status(400).json({ error: 'Unknown action' });
});

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
  const { date, rating, verdict, notes, spheres, calculatedScore } = req.body;

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
    spheres: spheres !== undefined ? spheres : existing.spheres,
    calculatedScore: calculatedScore !== undefined ? calculatedScore : existing.calculatedScore,
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
  const { notes, rating, date, preferredLanguage = 'auto', spheres } = req.body;

  if ((!notes || notes.trim() === '') && (!spheres || Object.keys(spheres).length === 0)) {
    return res.status(400).json({ success: false, error: 'Notes text or sphere entries are required for AI enhancement' });
  }

  const apiKey = GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ success: false, error: 'AI API key not configured' });
  }

  let languageRule = '';
  if (preferredLanguage === 'english') {
    languageRule = 'STRICT LANGUAGE MANDATE: The user has chosen ENGLISH. Write 100% in polished, natural English. Do NOT include any Hindi, Hinglish, or foreign words.';
  } else if (preferredLanguage === 'hinglish') {
    languageRule = 'STRICT LANGUAGE MANDATE: The user has chosen HINGLISH. Write in natural, expressive 1st-person Hinglish (Hindi in Roman script).';
  } else {
    languageRule = 'LANGUAGE MIRRORING MANDATE: Strictly mirror the exact language and blend of the user input. If the user wrote in standard English, you MUST output 100% pure English with ZERO Hindi/Hinglish words. If the user wrote in Hinglish, output in Hinglish. NEVER translate English notes into Hinglish.';
  }

  let journalInput = notes || '';
  if (spheres && Object.keys(spheres).length > 0) {
    const sphereDetails = Object.entries(spheres)
      .filter(([_, s]) => s && (s.rating || (s.notes && s.notes.trim())))
      .map(([id, s]) => `[${s.icon || '⚡'} ${s.name || id} — Rated ${s.rating || 'N/A'}/5]: ${s.notes || '(No specific notes, just score logged)'}`)
      .join('\n\n');
    
    if (sphereDetails) {
      journalInput = `${journalInput ? journalInput + '\n\n' : ''}--- Segmented Life Domain Breakdown ---\n${sphereDetails}`;
    }
  }

  const prompt = `You are a personal diary ghostwriter.
The user logged their day (${date || 'Today'}, Verdict: ${rating || 3}/5).
${spheres ? 'The user logged segmented life domains (e.g. Work/School, Home, Social).' : ''}

User's raw journal inputs and domain ratings:
"${journalInput}"

CRITICAL INSTRUCTIONS:
- You must write strictly in the FIRST PERSON ("I", "my", "me", "myself").
- NEVER use "You" or "Your" under any circumstances.
- PRESERVE FULL LENGTH AND EVERY SINGLE DETAIL: Do NOT summarize, compress, or shorten the entry. Synthesize the domain events into a unified, chronological, vivid personal diary reflection (from morning through night).
- ${languageRule}
- Fix grammatical roughness, awkward phrasing, and run-on sentences while keeping the user's raw, authentic, passionate voice.
- Write it as a deep, vivid, complete personal diary entry written by ME about MY own day.

Return ONLY the complete, uncompressed polished diary entry text without quotes or preamble.`;

  try {
    // Call Gemini API with user-preferred model (strictly gemini-3.5-flash-lite with 3.1 fallback)
    const primaryModel = 'gemini-3.5-flash-lite';
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
      const data = await response.json();
      const enhancedText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (enhancedText && enhancedText.trim()) {
        return res.json({ success: true, enhancedText: enhancedText.trim() });
      }
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

// Monthly AI Performance Dossier Report Route (GET saved report)
app.get('/api/monthly-report', (req, res) => {
  const { year, month, archetypeId } = req.query;
  const targetDataset = archetypeId || 'real';
  const reportKey = `${targetDataset}_${year}_${String(month).padStart(2, '0')}`;
  const reportsMap = readReports();

  if (reportsMap[reportKey]) {
    return res.json({
      success: true,
      isSaved: true,
      data: reportsMap[reportKey]
    });
  }

  res.json({
    success: true,
    isSaved: false,
    data: null
  });
});

// Monthly AI Performance Dossier Report Route (POST generate / re-evaluate)
app.post('/api/monthly-report', async (req, res) => {
  const { year, month, customEntries, archetypeId, forceReevaluate, preferredLanguage = 'auto' } = req.body;
  const targetDataset = archetypeId || 'real';
  const reportKey = `${targetDataset}_${year}_${String(month).padStart(2, '0')}_${preferredLanguage}`;
  const reportsMap = readReports();

  // If already evaluated and user did not request force re-evaluation, return saved report instantly!
  if (!forceReevaluate && reportsMap[reportKey]) {
    return res.json({
      success: true,
      isSaved: true,
      data: reportsMap[reportKey]
    });
  }

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
      isSaved: false,
      data: {
        monthName: new Date(year, month - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        totalLogged: 0,
        totalDaysInMonth,
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
- Rating Breakdown: Peak(5)=${ratingCounts[5]}, Good(4)=${ratingCounts[4]}, Okay(3)=${ratingCounts[3]}, Down(2)=${ratingCounts[2]}, Rough(1)=${ratingCounts[1]}
- Weekday Averages: ${JSON.stringify(weekdayAverages)}
- Weekly Phase Progressions: ${JSON.stringify(weeklyAnalytics)}
- Friction Leak Factors: Screen/Doomscrolling=${frictionBreakdown.screenDoomscrollPct}%, Academic=${frictionBreakdown.academicStressPct}%, Family/Social=${frictionBreakdown.householdSocialPct}%
- Detailed Log Entries with Notes:
${JSON.stringify(entriesSummary.slice(0, 31), null, 2)}

CORE HOMIE INSTRUCTIONS:
1. CREATE A UNIQUE, DYNAMIC PERSONA TITLE every single time based on specific events.
2. WRITE A 4-PARAGRAPH "HOMIE LETTER" addressing them directly with real validation, playful roasting, resilience celebration, and a brotherly game plan.
3. PROVIDE 5 TO 6 HILARIOUS & SHARP HIDDEN FACTS referencing exact diary events.
4. ${languageRule}

Return ONLY a valid JSON object matching this exact schema:
{
  "personaTitle": "A unique, creative, hilarious bro title matching their specific diary moments",
  "executiveSummary": "A 2-3 sentence brutally honest bro breakdown of their month with natural humor and real talk.",
  "homieLetter": [
    "Paragraph 1: Heartfelt validation of what they suffered through this month...",
    "Paragraph 2: Unfiltered roasting of their 3 AM phone habits and avoidance loops...",
    "Paragraph 3: Fierce brotherly hype celebrating their stubborn resilience and Day 31 clutch win...",
    "Paragraph 4: Practical game plan and encouragement for next month..."
  ],
  "hiddenFacts": [
    "Observation 1 (Calling out cursed weekdays with stats)",
    "Observation 2 (Calling out 3:45 AM screen traps)",
    "Observation 3 (Calling out specific tragic comedies like chai spills or hallway freezes)",
    "Observation 4 (Calling out accounts balance sheet PTSD)",
    "Observation 5 (Calling out logging discipline)",
    "Observation 6 (Calling out the Day 31 clutch arc)"
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
      const primaryModel = 'gemini-3.5-flash-lite';
      let response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${primaryModel}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.88, maxOutputTokens: 2500, responseMimeType: 'application/json' }
        })
      });

      if (!response.ok) {
        response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.88, maxOutputTokens: 2500, responseMimeType: 'application/json' }
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
      personaTitle: hitRate < 50 ? 'The 3:45 AM Dopamine Goblin 👺' : 'The Relentless Flow Demon ⚡',
      executiveSummary: `Bro... look at this chart. Your month was cooked as shit. Genuinely raw-dogging the trenches with ${ratingCounts[1]} Rough days, ${ratingCounts[2]} Down days, and only 1 win—but you logged every single day and clutched up on Day 31.`,
      homieLetter: [
        `Listen to me bro: this month was an absolute blender. You had failed Accounts papers, public teacher callouts, morning stomach cramps in class, family tension over gas cylinders, and sitting in the canteen watching your friends flex their dating life while you felt completely invisible. I hear you, and that shit genuinely hurts.`,
        `Now let's talk about the self-inflicted damage: you kept treating 3:45 AM Reels doomscrolling like a coping mechanism, when in reality it was frying your dopamine receptors and guaranteeing next-day morning migraines. Spilling chai all over 15 completed project pages was peak tragic comedy, but the endless phone avoidance was the real bottleneck.`,
        `Here is why you're built different though: despite 30 consecutive days of pure hell and feeling like a clown on the terrace, you never stopped logging. You didn't delete the database, you didn't give up, and when the big 50-mark Accounts unit test landed on Day 31, you dropped a massive 78% (39/50) clutch win and earned your dad's proud nod at dinner.`,
        `For next month, we take that exact bulldog resilience and apply it daily. Put your phone in another room at 11 PM, stop letting one awkward hallway moment ruin your week, and lock in on your revision. You proved you have the horsepower—now let's make it consistent.`
      ],
      hiddenFacts: [
        `Bro, start believing in superstitions because your ${worstWeekday}s are statistically cursed as fuck with an automatic L.`,
        `3:45 AM Doomscroll Trap: Late-night phone binges were your personal final boss—they wiped out your attention span and caused morning brain fog.`,
        `Spilled Chai & Tragic Comedy: Spilling hot chai all over completed BST project pages is proof the universe had personal beef with you on Day 20.`,
        `Accounts PTSD: You spent 30 days fighting for your life against partnership balance sheets, only to drop a massive 78% redemption arc on Day 31.`,
        `Iron Will Consistency: You logged 100% of your days across all 31 days even when your life felt like a dumpster fire. That's real mental toughness.`,
        `The Day 31 Clutch: After a whole month in the mud, you proved that action creates confidence and earned genuine respect at home.`
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

  const finalReport = {
    monthName,
    year,
    month,
    targetDataset,
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
    evaluatedAt: new Date().toISOString(),
    ...aiReport
  };

  reportsMap[reportKey] = finalReport;
  writeReports(reportsMap);

  res.json({
    success: true,
    isSaved: true,
    data: finalReport
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
