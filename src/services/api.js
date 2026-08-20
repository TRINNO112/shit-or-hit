const API_BASE = '/api';

export const ratingMeta = {
  1: {
    rating: 1,
    icon: 'AlertCircle',
    title: 'Rough',
    desc: 'Tough, exhausting or chaotic',
    color: '#ef4444',
    bg: '#fef2f2',
    border: '#fecaca',
    activeClass: 'active-rough'
  },
  2: {
    rating: 2,
    icon: 'CloudRain',
    title: 'Down',
    desc: 'Heavy, low energy or friction',
    color: '#f97316',
    bg: '#fff7ed',
    border: '#ffedd5',
    activeClass: 'active-down'
  },
  3: {
    rating: 3,
    icon: 'MinusCircle',
    title: 'Okay',
    desc: 'Normal baseline, surviving',
    color: '#64748b',
    bg: '#f8fafc',
    border: '#e2e8f0',
    activeClass: 'active-okay'
  },
  4: {
    rating: 4,
    icon: 'Zap',
    title: 'Good',
    desc: 'Solid hit, productive & clear',
    color: '#10b981',
    bg: '#ecfdf5',
    border: '#a7f3d0',
    activeClass: 'active-good'
  },
  5: {
    rating: 5,
    icon: 'Sparkles',
    title: 'Peak',
    desc: 'Elite momentum, peak state!',
    color: '#f59e0b',
    bg: '#fffbeb',
    border: '#fde68a',
    activeClass: 'active-peak'
  }
};

export async function checkServerHealth() {
  try {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error('Health check failed');
    return await res.json();
  } catch (err) {
    return { status: 'offline' };
  }
}

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

export function exportDatabaseBackup(startDate, entries) {
  const payload = {
    exportedAt: new Date().toISOString(),
    appName: 'Daily Quality Tracker',
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
