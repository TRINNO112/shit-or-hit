import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import TodayHero from './components/TodayHero';
import JourneyTimeline from './components/JourneyTimeline';
import StatsWidget from './components/StatsWidget';
import { fetchDatabase, saveEntry } from './services/api';

export default function App() {
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [entries, setEntries] = useState({});

  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const todayStr = `${y}-${m}-${d}`;

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

  const startObj = new Date(`${startDate}T00:00:00`);
  const todayObj = new Date(`${todayStr}T00:00:00`);
  const diffDays = Math.max(0, Math.floor((todayObj - startObj) / (1000 * 60 * 60 * 24)));
  const dayCount = diffDays + 1;

  const handleSaveToday = async (entryData) => {
    const saved = await saveEntry(entryData);
    setEntries(prev => ({
      ...prev,
      [saved.date]: saved
    }));
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#FFFDF5] text-black">
      
      {/* Full-width Header */}
      <Header
        startDate={startDate}
        entries={entries}
        dayCount={dayCount}
      />

      {/* Main Panoramic Container */}
      <main className="flex-1 w-full max-w-[1440px] mx-auto px-6 md:px-10 py-6">
        
        {/* Full-Width Top Hero Today Banner */}
        <TodayHero
          todayStr={todayStr}
          currentEntry={entries[todayStr] || null}
          onSaveToday={handleSaveToday}
          dayCount={dayCount}
        />

        {/* Bottom 2-Column Panoramic Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Column: Journey Timeline (7 cols) */}
          <div className="lg:col-span-7">
            <JourneyTimeline
              startDate={startDate}
              todayStr={todayStr}
              entries={entries}
            />
          </div>

          {/* Right Column: Real-time Stats & Metrics (5 cols) */}
          <div className="lg:col-span-5">
            <StatsWidget
              entries={entries}
              dayCount={dayCount}
            />
          </div>

        </div>

      </main>

      {/* Subtle Footer */}
      <footer className="w-full text-center text-xs font-mono font-bold text-neutral-500 py-6 border-t-2 border-black/10 mt-8">
        <span>DAILY QUALITY • All data persisted locally into <code className="text-black bg-[#FDC800] px-2 py-0.5 rounded-md border border-black">data/entries.json</code></span>
      </footer>

    </div>
  );
}
