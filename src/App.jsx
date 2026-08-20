import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import TodayHero from './components/TodayHero';
import JourneyTimeline from './components/JourneyTimeline';
import { fetchDatabase, saveEntry } from './services/api';

export default function App() {
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [entries, setEntries] = useState({});

  // Today formatted as YYYY-MM-DD
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const todayStr = `${y}-${m}-${d}`;

  // Load database on start
  const loadData = useCallback(async () => {
    try {
      const db = await fetchDatabase();
      setStartDate(db.startDate || todayStr);
      setEntries(db.entries || {});
    } catch (err) {
      console.error('Failed to load database:', err);
    }
  }, [todayStr]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Calculate day count (e.g. Day 1, Day 2...)
  const startObj = new Date(`${startDate}T00:00:00`);
  const todayObj = new Date(`${todayStr}T00:00:00`);
  const diffDays = Math.max(0, Math.floor((todayObj - startObj) / (1000 * 60 * 60 * 24)));
  const dayCount = diffDays + 1;

  // Handle 1-click rating for today
  const handleSaveToday = async (entryData) => {
    const saved = await saveEntry(entryData);
    setEntries(prev => ({
      ...prev,
      [saved.date]: saved
    }));
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#f8fafc] text-slate-900 pb-12">
      
      {/* Top Header */}
      <Header
        startDate={startDate}
        entries={entries}
        dayCount={dayCount}
      />

      {/* Main Focus Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6">
        
        {/* Centered Today Card */}
        <TodayHero
          todayStr={todayStr}
          currentEntry={entries[todayStr] || null}
          onSaveToday={handleSaveToday}
          dayCount={dayCount}
        />

        {/* Clean Timeline (Only starting from Day 1 / today) */}
        <JourneyTimeline
          startDate={startDate}
          todayStr={todayStr}
          entries={entries}
        />

      </main>

      {/* Subtle Footer */}
      <footer className="w-full text-center text-xs font-mono text-slate-400 py-4">
        <span>Daily Quality • All data saved locally in <code className="text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">data/entries.json</code></span>
      </footer>

    </div>
  );
}
