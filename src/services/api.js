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
    console.error('AI Enhance error:', err);
    return notes;
  }
}

export function exportDatabaseBackup(startDate, entries) {
  const payload = {
    exportedAt: new Date().toISOString(),
    appName: 'Daily Quality Tracker (Neobrutalism Edition)',
    startDate,
    totalEntries: Object.keys(entries).length,
    entries
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `daily-quality-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
