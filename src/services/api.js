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

export async function fetchMonthlyReport(year, month) {
  try {
    const res = await fetch(`${API_BASE}/monthly-report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ year, month })
    });
    if (!res.ok) throw new Error('Failed to generate monthly report');
    const json = await res.json();
    return json.data;
  } catch (err) {
    console.error('fetchMonthlyReport error:', err);
    throw err;
  }
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
