import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import swaggerUi from 'swagger-ui-express';
import { validateBody, validateQuery } from './middleware/validate.js';
import {
  entrySchema,
  monthlyReportQuerySchema,
  monthlyReportBodySchema,
  aiEnhanceSchema,
  bulkEntriesSchema,
  aiAutopsySchema
} from './schemas/apiSchemas.js';
import { logger, requestLogger } from './logger.js';

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

// CORS Whitelist Protection
const ALLOWED_ORIGINS = [
  'http://localhost:5888',
  'http://localhost:5173',
  'http://127.0.0.1:5888',
  'http://127.0.0.1:5173',
  'https://shit-or-hit.netlify.app'
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (mobile, server-to-server, curl)
    if (!origin) return callback(null, true);
    const isAllowed = ALLOWED_ORIGINS.includes(origin) ||
      /^http:\/\/localhost(:\d+)?$/.test(origin) ||
      /^http:\/\/127\.0\.0\.1(:\d+)?$/.test(origin) ||
      /^https:\/\/.*--shit-or-hit\.netlify\.app$/.test(origin);
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked for unauthorized origin: ${origin}`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-test-sandbox', 'playwright']
}));
app.use(express.json({ limit: '10mb' }));
app.use(requestLogger);

// OpenAPI / Swagger Documentation
const openApiPath = path.join(__dirname, 'openapi.json');
let openApiSpec = {};
if (fs.existsSync(openApiPath)) {
  try {
    openApiSpec = JSON.parse(fs.readFileSync(openApiPath, 'utf-8'));
  } catch (err) {
    console.error('Failed to parse openapi.json:', err);
  }
}
app.get('/api/docs/spec.json', (req, res) => res.json(openApiSpec));
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openApiSpec, {
  customSiteTitle: 'SHIT OR HIT — API Documentation'
}));


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

function isTestSandbox(req) {
  // Prevent sandbox override in production environments
  if (process.env.NODE_ENV === 'production') {
    return false;
  }
  // Sandbox headers are only permitted from loopback/localhost during local testing
  const ip = req?.ip || req?.socket?.remoteAddress || '';
  const isLoopback = ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1' || ip.includes('localhost') || !ip;
  const hasTestHeader = isLoopback && (req?.headers?.['x-test-sandbox'] === 'true' || req?.headers?.['playwright'] === 'true');

  return (
    process.env.IS_PLAYWRIGHT === 'true' ||
    process.env.NODE_ENV === 'test' ||
    hasTestHeader
  );
}

// In-Memory Rate Limiter for PIN Verification (5 attempts per 15 minutes)
const pinAttemptStore = new Map();

function checkPinRateLimit(key) {
  const now = Date.now();
  const record = pinAttemptStore.get(key);
  if (!record) return { allowed: true, remaining: 5 };
  if (now > record.resetAt) {
    pinAttemptStore.delete(key);
    return { allowed: true, remaining: 5 };
  }
  if (record.count >= 5) {
    const waitMinutes = Math.ceil((record.resetAt - now) / 60000);
    return { allowed: false, waitMinutes };
  }
  return { allowed: true, remaining: 5 - record.count };
}

function recordPinFailure(key) {
  const now = Date.now();
  const record = pinAttemptStore.get(key) || { count: 0, resetAt: now + 15 * 60 * 1000 };
  record.count += 1;
  record.resetAt = Math.max(record.resetAt, now + 15 * 60 * 1000);
  pinAttemptStore.set(key, record);
}

function resetPinAttempts(key) {
  pinAttemptStore.delete(key);
}

function getDataFilePath(req) {
  if (isTestSandbox(req)) {
    const sandboxPath = path.join(DATA_DIR, 'test_sandbox_entries.json');
    if (!fs.existsSync(sandboxPath)) {
      fs.writeFileSync(sandboxPath, JSON.stringify({
        version: '1.0',
        startDate: getTodayString(),
        lastUpdated: new Date().toISOString(),
        entries: {}
      }, null, 2), 'utf-8');
    }
    return sandboxPath;
  }
  return DATA_FILE;
}

function getReportsFilePath(req) {
  if (isTestSandbox(req)) {
    const sandboxPath = path.join(DATA_DIR, 'test_sandbox_reports.json');
    if (!fs.existsSync(sandboxPath)) {
      fs.writeFileSync(sandboxPath, JSON.stringify({}, null, 2), 'utf-8');
    }
    return sandboxPath;
  }
  return REPORTS_FILE;
}

function readDatabase(req) {
  const targetFile = getDataFilePath(req);
  try {
    const raw = fs.readFileSync(targetFile, 'utf-8');
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

function writeDatabase(data, req) {
  const targetFile = getDataFilePath(req);
  data.lastUpdated = new Date().toISOString();
  const tempPath = `${targetFile}.tmp`;
  fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf-8');
  fs.renameSync(tempPath, targetFile);
}

function readReports(req) {
  const targetFile = getReportsFilePath(req);
  try {
    if (!fs.existsSync(targetFile)) return {};
    const raw = fs.readFileSync(targetFile, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading reports file:', err);
    return {};
  }
}

function writeReports(reports, req) {
  const targetFile = getReportsFilePath(req);
  try {
    const tempPath = `${targetFile}.tmp`;
    fs.writeFileSync(tempPath, JSON.stringify(reports, null, 2), 'utf-8');
    fs.renameSync(tempPath, targetFile);
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

    // Rate Limiting Guard
    const clientKey = req.ip || req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'local_client';
    const rateCheck = checkPinRateLimit(clientKey);
    if (!rateCheck.allowed) {
      return res.status(429).json({
        error: `Too many failed PIN attempts. Locked out for ${rateCheck.waitMinutes} minutes.`,
        retryAfterMinutes: rateCheck.waitMinutes
      });
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

    const isMatched = decryptedPin === pin;
    if (isMatched) {
      resetPinAttempts(clientKey);
    } else {
      recordPinFailure(clientKey);
    }

    return res.json({
      matched: isMatched,
      timestamp: new Date().toISOString()
    });
  }

  return res.status(400).json({ error: 'Unknown or unsupported action' });
});

// Routes

// Get all entries + metadata
app.get('/api/entries', (req, res) => {
  const db = readDatabase(req);
  res.json({
    success: true,
    startDate: db.startDate || getTodayString(),
    data: db.entries || {},
    lastUpdated: db.lastUpdated,
    total: Object.keys(db.entries || {}).length
  });
});

// Save or edit entry for any date
app.post('/api/entries', validateBody(entrySchema), (req, res) => {
  const { date, rating, verdict, notes, spheres, calculatedScore } = req.body;

  if (!date || rating === undefined) {
    return res.status(400).json({ success: false, error: 'Date and rating are required' });
  }

  const db = readDatabase(req);
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

  writeDatabase(db, req);

  res.json({
    success: true,
    entry: db.entries[date]
  });
});

// AI Enhancement Endpoint for Daily Reflection
app.post('/api/ai/enhance', validateBody(aiEnhanceSchema), async (req, res) => {
  const { notes, rating, date, preferredLanguage = 'auto', spheres, customInstruction } = req.body;

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

  const directiveSection = customInstruction && customInstruction.trim()
    ? `\n\n🎯 USER'S DIRECT CUSTOM DIRECTIVE / COMMAND TO YOU:
"${customInstruction.trim()}"
You MUST strictly prioritize and execute this specific custom command while maintaining the 1st-person diary structure.`
    : '';

  const prompt = `You are a personal diary ghostwriter.
The user logged their day (${date || 'Today'}, Verdict: ${rating || 3}/5).
${spheres ? 'The user logged segmented life domains (e.g. Work/School, Home, Social).' : ''}

User's raw journal inputs and domain ratings:
"${journalInput}"${directiveSection}

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

// 🩺 AI Forensic Autopsy Chamber Endpoint
app.post('/api/ai/autopsy', validateBody(aiAutopsySchema), async (req, res) => {
  const { date, rating, notes = '', spheres = {}, anchors = {}, recentHistory = [] } = req.body;
  const apiKey = GEMINI_API_KEY;

  const localFallback = generateLocalAutopsy(notes, rating, spheres, anchors);

  if (!apiKey) {
    return res.json({
      success: true,
      autopsy: localFallback
    });
  }

  const prompt = `You are a Behavioral Forensic Detective and Tough-Love Accountability Coroner for the daily logging system "SHIT OR HIT".
The user had a 1★ or 2★ rough day. Conduct an unfiltered, insightful, and constructive behavioral autopsy on what went wrong.
Data provided:
- Date of Crime: ${date}
- Verdict Rating: ${rating}/5★
- Diary Notes: "${notes || 'No specific notes logged'}"
- Life Domain Spheres: ${JSON.stringify(spheres)}
- Daily Non-Negotiables: ${JSON.stringify(anchors)}

Your diagnosis MUST be structured as a valid JSON object with these exact keys:
{
  "causeOfDeath": "A sharp, highly specific 1-2 sentence behavioral diagnosis describing where momentum failed (e.g. 'Circadian Collapse & Screen Paralysis: 3:00 AM phone addiction sabotaged morning neurotransmitters, cascading into missed anchors.')",
  "questions": [
    {
      "id": "q1",
      "question": "Sharp detective question interrogating the root trigger of failure",
      "options": ["Option A", "Option B", "Option C"]
    },
    {
      "id": "q2",
      "question": "Second sharp question about the discipline leak or dopamine trap",
      "options": ["Option A", "Option B", "Option C"]
    },
    {
      "id": "q3",
      "question": "Third question about tomorrow's defensive protocol",
      "options": ["Option A", "Option B", "Option C"]
    }
  ],
  "recoveryAntidote": "A direct, non-negotiable 1-action recovery command for tomorrow morning (e.g. 'Leave phone outside the bedroom, drink 1L cold water upon waking, and execute your first non-negotiable before opening any browser.')"
}

Do NOT wrap in markdown backticks or preamble. Output raw JSON only.`;

  try {
    const primaryModel = 'gemini-3.5-flash-lite';
    let response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${primaryModel}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.6,
          maxOutputTokens: 1024,
          responseMimeType: 'application/json'
        }
      })
    });

    if (!response.ok) {
      response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.6,
            maxOutputTokens: 1024,
            responseMimeType: 'application/json'
          }
        })
      });
    }

    if (response.ok) {
      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (rawText) {
        try {
          const parsed = JSON.parse(rawText);
          if (parsed && parsed.causeOfDeath && Array.isArray(parsed.questions)) {
            return res.json({
              success: true,
              autopsy: parsed
            });
          }
        } catch (parseErr) {
          console.warn('Failed to parse Gemini autopsy JSON, falling back:', parseErr);
        }
      }
    }

    return res.json({
      success: true,
      autopsy: localFallback
    });
  } catch (err) {
    console.error('Autopsy route exception:', err);
    return res.json({
      success: true,
      autopsy: localFallback
    });
  }
});

function generateLocalAutopsy(notes = '', rating = 1, spheres = {}, anchors = {}) {
  const textLower = (notes || '').toLowerCase();
  const isDigital = textLower.includes('phone') || textLower.includes('scroll') || textLower.includes('screen') || textLower.includes('instagram') || textLower.includes('reel') || textLower.includes('youtube');
  const isSleep = textLower.includes('sleep') || textLower.includes('tired') || textLower.includes('exhaust') || textLower.includes('insomnia') || textLower.includes('late');

  const causeOfDeath = isDigital
    ? 'Acute Digital Dopamine Sepsis: Frictionless screen loops breached focus perimeters, draining executive will and starving momentum.'
    : isSleep
    ? 'Circadian Collapse & Battery Drain: Late bedtime delayed neurochemical recovery, triggering morning brain fog and execution paralysis.'
    : 'Executive Friction Fracture: Missing early habit anchor momentum allowed passive avoidance to dominate the day.';

  return {
    causeOfDeath,
    questions: [
      {
        id: 'q1',
        question: 'What was the exact zero-hour trigger that derailed your day?',
        options: ['Late night doomscrolling / phone in bed', 'Procrastinated on primary work milestone', 'Emotional friction / mental overwhelm']
      },
      {
        id: 'q2',
        question: 'Did you execute your morning non-negotiables before screens?',
        options: ['Skipped completely', 'Partial / delayed effort', 'Completed morning anchor, collapsed later']
      },
      {
        id: 'q3',
        question: 'What is your primary defensive measure for tomorrow morning?',
        options: ['Strict 45-min phone quarantine upon waking', 'Immediate 100% focus on single hardest task', 'Early sleep reset: zero screens after 11:30 PM']
      }
    ],
    recoveryAntidote: 'Protocol Reset: Drink 1L cold water upon waking, keep phone in another room for 60 minutes, and complete your first non-negotiable anchor before opening any browser.'
  };
}


// Monthly AI Performance Dossier Report Route (GET saved report)
app.get('/api/monthly-report', validateQuery(monthlyReportQuerySchema), (req, res) => {
  const { year, month, archetypeId, preferredLanguage = 'auto' } = req.query;
  const targetDataset = archetypeId || 'real';
  const monthStr = String(month).padStart(2, '0');
  const baseKey = `${targetDataset}_${year}_${monthStr}`;
  const langKey = `${baseKey}_${preferredLanguage}`;
  const reportsMap = readReports();

  let matchedReport = reportsMap[langKey] || reportsMap[baseKey];
  if (!matchedReport) {
    const candidateKey = Object.keys(reportsMap).find(k => k.startsWith(baseKey));
    if (candidateKey) {
      matchedReport = reportsMap[candidateKey];
    }
  }

  if (matchedReport) {
    return res.json({
      success: true,
      isSaved: true,
      data: matchedReport
    });
  }

  res.json({
    success: true,
    isSaved: false,
    data: null
  });
});

// Monthly AI Performance Dossier Report Route (POST generate / re-evaluate)
app.post('/api/monthly-report', validateBody(monthlyReportBodySchema), async (req, res) => {
  const { year, month, customEntries, archetypeId, forceReevaluate, preferredLanguage = 'auto' } = req.body;
  const targetDataset = archetypeId || 'real';
  const monthStr = String(month).padStart(2, '0');
  const baseKey = `${targetDataset}_${year}_${monthStr}`;
  const reportKey = `${baseKey}_${preferredLanguage}`;
  const reportsMap = readReports();

  // If already evaluated and user did not request force re-evaluation, return saved report instantly!
  if (!forceReevaluate) {
    const existing = reportsMap[reportKey] || reportsMap[baseKey];
    if (existing) {
      return res.json({
        success: true,
        isSaved: true,
        data: existing
      });
    }
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

    const prompt = `You are a perceptive, master biographical chronicler, forensic behavioral analyst, and loyal brotherly mentor evaluating the user's daily life journal for ${monthName}.

DATA SUMMARY:
- Total Logged Days: ${loggedCount} / ${totalDaysInMonth}
- Hit Rate: ${hitRate}% (Days with rating >= 3)
- Average Quality Score: ${avgScore} / 5.0
- Longest Slump: ${longestSlump} consecutive rough/down days
- Longest Winning Streak: ${longestStreak} consecutive solid days
- Rating Breakdown: Peak(5)=${ratingCounts[5]}, Good(4)=${ratingCounts[4]}, Okay(3)=${ratingCounts[3]}, Down(2)=${ratingCounts[2]}, Rough(1)=${ratingCounts[1]}
- Weekday Averages: ${JSON.stringify(weekdayAverages)}
- Weekly Phase Progressions: ${JSON.stringify(weeklyAnalytics)}
- Friction Breakdown: Screen/Doomscrolling=${frictionBreakdown.screenDoomscrollPct}%, Academic=${frictionBreakdown.academicStressPct}%, Family/Social=${frictionBreakdown.householdSocialPct}%
- Detailed Chronological Entries with Notes:
${JSON.stringify(entriesSummary.slice(0, 31), null, 2)}

CORE STORYLINE & CHRONICLER INSTRUCTIONS:
1. TREAT THE MONTH AS AN UNFOLDING BIOGRAPHICAL STORYLINE CHRONICLE (NOT a generic flat summary, and NEVER a random soup/pasta of events).
   - Trace how the month started, the early friction/deployments, the mid-month crucibles, the solutions discovered, and how things concluded.
   - Divide the logged timeline chronologically into sequential Chapters/Acts (e.g., Act I: Opening Deployment & Early Turbulence, Act II: Mid-Month Friction & Tests, Act III: Tactical Breakthroughs & Exam Summits, Act IV: The Veteran's Ledger & The Road Ahead).
   - For each chapter provide:
     - act: (e.g. "Act I", "Act II", "Act III", "Act IV")
     - phaseTitle: (An evocative, cinematic title like "The Morning Reveille & Early Clashes" or "Corridors, Airplanes & Rejection")
     - timeSpan: (e.g. "Days 1–3", "Days 4–7", etc.)
     - mood: ("Peak", "Good", "Okay", "Down", or "Rough")
     - narrative: (A rich, detailed, captivating chronological narrative explaining what happened, the thoughts, conflicts, and steps taken)
     - turningPoint: (The tactical pivot or realization that shifted the momentum)
     - tacticalTakeaway: (The core philosophical or strategic lesson learned)
2. ZERO FORCED DEPRESSION. NEVER make the dossier sound uniformly depressed, helpless, or cynical! Even on hard days, analyze the user's emotional courage, stoic self-reflection, and how they held the line. Celebrate every single achievement: academic marks (e.g. 25/25 in PE, topping Economics with 22, English exams), creative & technical efforts (web platform blueprints, anti-gravity systems), domestic discipline (brewing tea, cleaning car, washing dishes, supporting brother), and physical reveille.
3. EXTRACT 3 TO 6 EXPLICIT "achievementsAndClutches": Highlight verified triumphs from the diary notes with specific details and numbers.
4. WRITE AN EXPANSIVE 4-TO-5 PARAGRAPH "HOMIE LETTER": A deeply authentic, witty, high-impact mentor address that weaves together the month's narrative arc, forensic habits, fierce hype for their grit, and a focused game plan.
5. PROVIDE 5 TO 6 SHARP "hiddenFacts": Nuanced correlations and observations referencing specific diary events.
6. ${languageRule}

Return ONLY a valid JSON object matching this exact schema:
{
  "personaTitle": "A unique, cinematic persona title fitting their specific story arc this month",
  "executiveSummary": "A 2-4 sentence profound, panoramic breakdown of how the month started, the battles fought, and the ground gained.",
  "storylineChronicle": {
    "overarchingTheme": "A 1-2 sentence dramatic thesis defining this month's personal journey",
    "chapters": [
      {
        "act": "Act I",
        "phaseTitle": "Chapter title",
        "timeSpan": "Days X–Y",
        "mood": "Okay",
        "narrative": "Detailed, rich chronological narrative explaining what happened in this phase...",
        "turningPoint": "What specific action or shift occurred...",
        "tacticalTakeaway": "Core lesson learned..."
      }
    ]
  },
  "achievementsAndClutches": [
    {
      "title": "Title of victory",
      "description": "Specific context from notes",
      "category": "Academic"
    }
  ],
  "homieLetter": [
    "Paragraph 1: The Month's Story Arc & Ground Gained...",
    "Paragraph 2: Forensic breakdown of behavioral traps & avoidance without despair...",
    "Paragraph 3: Fierce celebration of specific triumphs, grit, and clutch moments...",
    "Paragraph 4: Strategic vision and brotherly hype for the next campaign..."
  ],
  "hiddenFacts": [
    "Observation 1 (Calling out specific weekday patterns with stats)",
    "Observation 2 (Calling out avoidance or screen traps)",
    "Observation 3 (Calling out specific tragic comedies or unique diary moments)",
    "Observation 4 (Calling out academic test outcomes)",
    "Observation 5 (Calling out logging consistency and self-honesty)",
    "Observation 6 (Calling out an unexpected victory or relationship dynamic)"
  ],
  "frictionAnalysis": "A deep analysis of what actually created drag (overthinking, perfectionism, avoidance).",
  "goldenHabits": "A deep breakdown of the exact conditions when peak flow and clutch execution happened.",
  "nextMonthDirectives": [
    "Directive 1: High-impact directive",
    "Directive 2: High-impact directive",
    "Directive 3: High-impact directive"
  ]
}`;

    try {
      const candidateModels = ['gemini-3.5-flash-lite', 'gemini-3.1-flash-lite', 'gemini-3.8-flash', 'gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];
      for (const model of candidateModels) {
        try {
          const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { temperature: 0.78, maxOutputTokens: 6000, responseMimeType: 'application/json' }
            })
          });

          if (response.ok) {
            const data = await response.json();
            const jsonText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
            if (jsonText) {
              aiReport = JSON.parse(jsonText);
              console.log(`Successfully generated monthly report using model: ${model}`);
              break;
            }
          } else {
            const errText = await response.text().catch(() => '');
            console.warn(`Model ${model} returned HTTP ${response.status}: ${errText.slice(0, 120)}`);
          }
        } catch (fetchErr) {
          console.warn(`Fetch error on model ${model}:`, fetchErr.message);
        }
      }
    } catch (err) {
      console.error('Gemini monthly report error:', err);
    }
  }

  // Dynamic Chronological Fallback if AI offline
  if (!aiReport) {
    const worstWeekday = Object.entries(weekdayAverages).sort((a, b) => a[1] - b[1])[0]?.[0] || 'Thu';
    const bestWeekday = Object.entries(weekdayAverages).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Fri';

    // Segment logged entries chronologically into acts
    const totalEntries = entriesSummary.length;
    const numChapters = totalEntries <= 3 ? Math.max(1, totalEntries) : totalEntries <= 9 ? 3 : 4;
    const chunkSize = Math.ceil(totalEntries / numChapters);
    const romanActs = ['Act I', 'Act II', 'Act III', 'Act IV'];

    const chapters = [];
    for (let c = 0; c < numChapters; c++) {
      const slice = entriesSummary.slice(c * chunkSize, (c + 1) * chunkSize);
      if (slice.length === 0) continue;
      const startDay = parseInt(slice[0].date.split('-')[2], 10);
      const endDay = parseInt(slice[slice.length - 1].date.split('-')[2], 10);
      const spanStr = startDay === endDay ? `Day ${startDay}` : `Days ${startDay}–${endDay}`;
      const sliceAvg = (slice.reduce((acc, curr) => acc + curr.rating, 0) / slice.length).toFixed(1);
      const mood = sliceAvg >= 4 ? 'Good' : sliceAvg >= 3 ? 'Okay' : 'Rough';

      const keyNotes = slice.map(s => s.notes).filter(Boolean);
      const excerpt = keyNotes.length > 0 
        ? keyNotes.map(n => n.split('\n')[0].replace(/^[0-9.\-|\s]+/g, '').trim()).filter(Boolean).slice(0, 2).join('. ') 
        : 'Holding routine and maintaining logging discipline.';

      chapters.push({
        act: romanActs[c] || `Act ${c + 1}`,
        phaseTitle: c === 0 
          ? 'The Opening Deployment & Baseline Friction' 
          : c === numChapters - 1 
          ? 'The Final Stand & Veteran Ledger' 
          : `Tactical Crucible & Mid-Month Maneuvers (Part ${c})`,
        timeSpan: spanStr,
        mood,
        narrative: `During ${spanStr} (average quality: ${sliceAvg}/5.0), you engaged directly with the daily friction of the academic and personal calendar. ${excerpt} Across these ${slice.length} logged days, you held the line against inertia and refused to abandon your self-accountability.`,
        turningPoint: `Confronting the daily challenges head-on and recording honest observations without sugarcoating reality.`,
        tacticalTakeaway: `Consistency in tracking reality is the first requirement of mastering it.`
      });
    }

    // Extract real achievements from entries
    const detectedWins = [];
    entriesSummary.forEach(e => {
      const note = e.notes || '';
      if (/25\s*\/\s*25|perfect/i.test(note)) {
        detectedWins.push({ title: 'Perfect 25/25 Exam Score', description: 'Secured flawless top marks in exam papers.', category: 'Academic' });
      }
      if (/22|highest|topped/i.test(note)) {
        detectedWins.push({ title: 'Class Summit in Economics', description: 'Emerged as the class topper after the fog of grading cleared.', category: 'Academic' });
      }
      if (/blueprint|anti-gravity|code|website|page/i.test(note)) {
        detectedWins.push({ title: 'Technical System Architecture', description: 'Engineered web blueprints and iterated system design.', category: 'Technical' });
      }
      if (/car|tea|brother|puja|iron/i.test(note)) {
        detectedWins.push({ title: 'Domestic Discipline & Family Support', description: 'Maintained domestic duties, brewed tea, and supported family logistics.', category: 'Domestic' });
      }
      if (e.rating >= 4) {
        detectedWins.push({ title: `High-Performance Flow on ${e.date}`, description: `Secured a solid ${e.rating}/5.0 rating through calculated focus.`, category: 'Discipline' });
      }
    });

    const uniqueWins = detectedWins.filter((w, idx, self) => self.findIndex(t => t.title === w.title) === idx).slice(0, 4);
    if (uniqueWins.length === 0) {
      uniqueWins.push({ title: 'Unbroken Logging Discipline', description: 'Consistently logged daily entries and maintained self-awareness.', category: 'Discipline' });
    }

    aiReport = {
      personaTitle: hitRate >= 50 ? 'The Stoic Strategist & Relentless Resilient Flow Demon ⚡' : 'The Battle-Tested Tactical Chronicler 🛡️',
      executiveSummary: `Through ${monthName}, you navigated ${loggedCount} days of genuine academic, social, and personal friction with an average score of ${avgScore}/5.0. Rather than surrendering to exhaustion, your logs reveal a stubborn resilience—holding reveille at dawn, clearing exam summits, and enforcing discipline across every campaign.`,
      storylineChronicle: {
        overarchingTheme: `A month of relentless tactical resistance, proving that discipline holds ground even when the terrain is hostile.`,
        chapters
      },
      achievementsAndClutches: uniqueWins,
      homieLetter: [
        `Looking across the entire story of ${monthName}, one truth stands out above everything else: you are not a passive spectator in your own life. You opened the month facing real friction—existential questions, heavy academic deadlines, and uncomfortable social moments—yet you consistently refused to look away. You showed up, deployed your focus, and logged the raw truth every single day.`,
        `Let's look at the friction points honestly: when pressure mounted, procrastination and overthinking crept in, turning straightforward projects into grueling multi-hour sieges. Late-night work and screen traps created avoidable morning fatigue. But recognizing these avoidance loops as tactical errors—rather than character flaws—is the exact superpower that allows you to recalibrate.`,
        `What makes this month powerful, though, are the moments where your grit converted into undeniable victories. From topping your class with a 22 in economics and securing a flawless 25/25 in physical education, to taking charge of domestic tasks like brewing tea and cleaning the car, you proved that action immediately dispels paralysis. When you lock in, your execution is lethal.`,
        `For the upcoming campaign, carry this hard-earned momentum forward. Protect your evening shutdown so you aren't writing projects past midnight, trust your preparation without fearing the 'evil eye', and remember: your standards and consistency are building something real. Let's make the next month a masterpiece.`
      ],
      hiddenFacts: [
        `Discipline Under Fire: Maintained logging discipline across ${loggedCount} entries, turning your diary into a profound tactical record.`,
        `Academic Summit: Proved your academic horsepower by securing peak marks in economics and physical education.`,
        `Domestic Baseline: Restored focus repeatedly through physical routines—brewing tea, cleaning, and holding morning reveille.`,
        `Weekday Rhythm: Your ${bestWeekday}s provided strong momentum, while ${worstWeekday}s required extra defense against procrastination.`,
        `Resilience Against Friction: Refused to break even during social missteps and awkward classroom aerodynamics.`,
        `Tactical Pivot Speed: Consistently rebounded from rough days into solid 3/5 and 4/5 hold positions.`
      ],
      frictionAnalysis: `Momentum drag primarily came from late-night avoidance loops, perfectionism on school assignments, and over-analyzing social friction.`,
      goldenHabits: `Peak execution emerged whenever you anchored the day with physical action: early wake-ups, hands-on tasks, and single-task exam focus.`,
      nextMonthDirectives: [
        `Directive 1: Enforce a strict 11:30 PM device curfew to protect your morning reveille and cognitive sharpness.`,
        `Directive 2: Space out long-term academic projects into 45-minute daily sprints instead of late-night single-session marathons.`,
        `Directive 3: Own your victories with pride without bracing for impending bad luck—confidence is earned ground.`
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
  reportsMap[baseKey] = finalReport;
  writeReports(reportsMap);

  res.json({
    success: true,
    isSaved: true,
    data: finalReport
  });
});

// Bulk import / restore
app.post('/api/entries/bulk', validateBody(bulkEntriesSchema), (req, res) => {
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
  logger.info(`⚡ Daily Goodness Server running on http://localhost:${PORT}`);
});
