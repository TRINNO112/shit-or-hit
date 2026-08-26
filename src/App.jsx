import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import TodayHero from './components/TodayHero';
import JourneyTimeline from './components/JourneyTimeline';
import StatsWidget from './components/StatsWidget';
import CalendarModal from './components/CalendarModal';
import EditDayModal from './components/EditDayModal';
import MonthlyReportModal from './components/MonthlyReportModal';
import MobileAppView from './components/MobileAppView';
import ReminderBanner from './components/ReminderBanner';
import AestheticCardExportModal from './components/AestheticCardExportModal';
import { fetchDatabase, saveEntry } from './services/api';
import { scheduleLocalEveningReminder } from './services/notifications';

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return isMobile;
}

export default function App() {
  const isMobile = useIsMobile();
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [entries, setEntries] = useState({});
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isMonthlyReportOpen, setIsMonthlyReportOpen] = useState(false);
  const [isWallpaperModalOpen, setIsWallpaperModalOpen] = useState(false);
  const [wallpaperTarget, setWallpaperTarget] = useState(null);
  const [reportTargetMonth, setReportTargetMonth] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1
  });
  const [editingDay, setEditingDay] = useState(null); // { dateStr, dayIndex, entry }

  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const todayStr = `${y}-${m}-${d}`;

  useEffect(() => {
    scheduleLocalEveningReminder();
  }, []);

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

  const handleSaveEntry = async (entryData) => {
    const saved = await saveEntry(entryData);
    setEntries(prev => ({
      ...prev,
      [saved.date]: saved
    }));
  };

  const handleOpenMonthlyReport = (customTarget) => {
    if (customTarget?.year && customTarget?.month) {
      setReportTargetMonth(customTarget);
    } else {
      setReportTargetMonth({
        year: now.getFullYear(),
        month: now.getMonth() + 1
      });
    }
    setIsMonthlyReportOpen(true);
  };

  const handleQuickRateFromBanner = async (val) => {
    await handleSaveEntry({
      date: todayStr,
      rating: val,
      notes: entries[todayStr]?.notes || ''
    });
  };

  const handleOpenWallpaper = (customEntry = null, customDate = null) => {
    setWallpaperTarget({
      entry: customEntry || entries[todayStr] || null,
      dateStr: customDate || todayStr
    });
    setIsWallpaperModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#FFFDF5] text-black">
      
      {/* ⏰ SMART 9 PM BROTHERLY HINGLISH REMINDER BANNER */}
      <ReminderBanner
        todayEntry={entries[todayStr]}
        onQuickRate={handleQuickRateFromBanner}
        onOpenDiary={() => {}}
      />

      {/* 📱 DEDICATED NATIVE MOBILE APP INTERFACE (Screens < 768px) */}
      {isMobile ? (
        <MobileAppView
          startDate={startDate}
          entries={entries}
          dayCount={dayCount}
          todayStr={todayStr}
          onSaveToday={handleSaveEntry}
          onOpenMonthlyReport={() => handleOpenMonthlyReport()}
          onEditDay={(dayInfo) => setEditingDay(dayInfo)}
          onOpenWallpaper={(entry, date) => handleOpenWallpaper(entry, date)}
        />
      ) : (
        /* 💻 FULL PANORAMIC DESKTOP EXPERIENCE (Screens >= 768px) */
        <div className="min-h-screen flex flex-col justify-between">
          <Header
            startDate={startDate}
            entries={entries}
            dayCount={dayCount}
            isCalendarOpen={isCalendarOpen}
            onToggleCalendar={() => setIsCalendarOpen(!isCalendarOpen)}
            onOpenMonthlyReport={() => handleOpenMonthlyReport()}
            onOpenWallpaper={() => handleOpenWallpaper()}
            onSyncRefresh={loadData}
          />

          <main className="flex-1 w-full max-w-[1380px] mx-auto px-6 sm:px-10 py-6">
            <TodayHero
              todayStr={todayStr}
              currentEntry={entries[todayStr] || null}
              onSaveToday={handleSaveEntry}
              dayCount={dayCount}
              onOpenWallpaper={() => handleOpenWallpaper()}
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch mt-4">
              <div className="lg:col-span-7">
                <JourneyTimeline
                  startDate={startDate}
                  todayStr={todayStr}
                  entries={entries}
                  onEditDay={(dayInfo) => setEditingDay(dayInfo)}
                />
              </div>

              <div className="lg:col-span-5">
                <StatsWidget
                  entries={entries}
                  dayCount={dayCount}
                />
              </div>
            </div>
          </main>

          <footer className="w-full max-w-[1380px] mx-auto text-center text-xs font-mono font-bold text-neutral-600 py-10 px-6 border-t-2 border-black/10 mt-14 mb-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <span className="px-3 py-1 bg-black text-[#FDC800] rounded-lg text-[11px] font-black uppercase shadow-[2px_2px_0px_#000000]">
              DAILY QUALITY
            </span>
            <span className="text-neutral-700 font-bold">
              All data persisted locally into <code className="text-black bg-[#FDC800] px-2 py-0.5 rounded-md border border-black font-black">data/entries.json</code>
            </span>
          </footer>
        </div>
      )}

      {/* Shared Modals */}
      <CalendarModal
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        entries={entries}
        startDate={startDate}
        todayStr={todayStr}
        onEditDay={(dayInfo) => setEditingDay(dayInfo)}
        onOpenMonthlyReport={(target) => handleOpenMonthlyReport(target)}
      />

      <EditDayModal
        isOpen={Boolean(editingDay)}
        onClose={() => setEditingDay(null)}
        entryData={editingDay?.entry || entries[editingDay?.dateStr] || null}
        dateStr={editingDay?.dateStr}
        dayIndex={editingDay?.dayIndex || 1}
        onSave={handleSaveEntry}
      />

      <MonthlyReportModal
        isOpen={isMonthlyReportOpen}
        onClose={() => setIsMonthlyReportOpen(false)}
        initialYear={reportTargetMonth.year}
        initialMonth={reportTargetMonth.month}
      />

      {/* 🖼️ Aesthetic Wallpaper & Social Card Export Modal */}
      <AestheticCardExportModal
        isOpen={isWallpaperModalOpen}
        onClose={() => setIsWallpaperModalOpen(false)}
        entry={wallpaperTarget?.entry || entries[todayStr] || null}
        dateStr={wallpaperTarget?.dateStr || todayStr}
        dayCount={dayCount}
      />

    </div>
  );
}
