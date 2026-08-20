import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5001;

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

// Save entry
app.post('/api/entries', (req, res) => {
  const { date, rating, verdict, notes } = req.body;

  if (!date || !rating) {
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
