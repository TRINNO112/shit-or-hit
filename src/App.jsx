import React, { useState, useEffect, useCallback } from 'react';
import { Zap, Calendar } from 'lucide-react';
import Header from './components/Header';
import TodayHero from './components/TodayHero';
import JourneyTimeline from './components/JourneyTimeline';
import StatsWidget from './components/StatsWidget';
import CalendarModal from './components/CalendarModal';
import EditDayModal from './components/EditDayModal';
import MonthlyReportModal from './components/MonthlyReportModal';
import MobileAppView from './components/MobileAppView';
import AestheticCardExportModal from './components/AestheticCardExportModal';
import ForensicStatsModal from './components/ForensicStatsModal';
import PWAInstallBanner from './components/PWAInstallBanner';
import SettingsModal from './components/SettingsModal';
import IconLab from './components/IconLab';
import StickerVaultModal from './components/StickerVaultModal';
import SkeletonLoader from './components/SkeletonLoader';
import { fetchDatabase, saveEntry } from './services/api';
import { scheduleLocalEveningReminder } from './services/notifications';
import { subscribeAuthState, getUserDisplayName, fetchCloudUserSettings } from './services/firebase';

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
  const [showIconLab, setShowIconLab] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.location.search.includes('view=icons') || window.location.hash.includes('icons');
  });
  const [showSkeletonPreview, setShowSkeletonPreview] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.location.search.includes('view=skeleton') || window.location.hash.includes('skeleton');
  });
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [entries, setEntries] = useState({});
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isMonthlyReportOpen, setIsMonthlyReportOpen] = useState(false);
  const [isWallpaperModalOpen, setIsWallpaperModalOpen] = useState(false);
  const [isTelemetryOpen, setIsTelemetryOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isStickerVaultOpen, setIsStickerVaultOpen] = useState(false);
  const [wallpaperTarget, setWallpaperTarget] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [reportTargetMonth, setReportTargetMonth] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1
  });
  const [editingDay, setEditingDay] = useState(null); // { dateStr, dayIndex, entry }
  const [sphereSettingsVer, setSphereSettingsVer] = useState(0);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [activeDesktopTab, setActiveDesktopTab] = useState('today');

  // Secret developer key sequence listener (type "iconlab" or "skeleton" anywhere)
  useEffect(() => {
    let keyBuffer = '';
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
      
      keyBuffer = (keyBuffer + e.key.toLowerCase()).slice(-10);
      if (keyBuffer.endsWith('iconlab')) {
        setShowIconLab(prev => !prev);
        keyBuffer = '';
      } else if (keyBuffer.endsWith('skeleton')) {
        setShowSkeletonPreview(prev => !prev);
        keyBuffer = '';
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const checkHash = () => {
      setShowIconLab(window.location.search.includes('view=icons') || window.location.hash.includes('icons'));
      setShowSkeletonPreview(window.location.search.includes('view=skeleton') || window.location.hash.includes('skeleton'));
    };
    window.addEventListener('popstate', checkHash);
    window.addEventListener('hashchange', checkHash);
    return () => {
      window.removeEventListener('popstate', checkHash);
      window.removeEventListener('hashchange', checkHash);
    };
  }, []);

  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const todayStr = `${y}-${m}-${d}`;

  useEffect(() => {
    scheduleLocalEveningReminder();
    const unsubscribe = subscribeAuthState((u) => {
      setCurrentUser(u);
      if (u?.uid) {
        fetchCloudUserSettings(u.uid).then(cloudSettings => {
          if (cloudSettings) {
            if (cloudSettings.spheresConfig && Array.isArray(cloudSettings.spheresConfig)) {
              localStorage.setItem('daily_verdict_spheres_config', JSON.stringify(cloudSettings.spheresConfig));
            }
            if (cloudSettings.sphereModeEnabled !== undefined) {
              localStorage.setItem('daily_verdict_sphere_mode_enabled', cloudSettings.sphereModeEnabled ? 'true' : 'false');
            }
            setSphereSettingsVer(v => v + 1);
          }
        }).catch(() => {});
      }
    });
    return () => unsubscribe();
  }, []);

  const loadData = useCallback(async () => {
    try {
      const db = await fetchDatabase();
      if (db.startDate) setStartDate(db.startDate);
      if (db.entries) {
        setEntries(prev => ({
          ...db.entries,
          ...(prev || {}) // Preserve latest in-memory edits
        }));
      }
    } catch (err) {
      console.error('Failed to load database in App:', err);
    } finally {
      setIsInitialLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSaveEntry = async (entryData) => {
    const formatted = {
      ...entryData,
      rating: Number(entryData.rating),
      verdict: entryData.verdict || ratingMeta[entryData.rating]?.title || 'Verdict',
      updatedAt: new Date().toISOString()
    };

    // 1. Immediate optimistic UI update (zero lag, works 100% offline)
    setEntries(prev => {
      const next = {
        ...(prev || {}),
        [formatted.date]: {
          ...(prev?.[formatted.date] || {}),
          ...formatted
        }
      };
      try {
        const cached = JSON.parse(localStorage.getItem('goodness_db') || '{}');
        localStorage.setItem('goodness_db', JSON.stringify({
          ...cached,
          entries: next
        }));
      } catch (e) {}
      return next;
    });

    // 2. Safe background network sync
    try {
      await saveEntry(formatted);
    } catch (err) {
      console.warn('Network sync pending, saved to local cache:', err);
    }
  };

  const handleOpenMonthlyReport = (target) => {
    if (target) {
      setReportTargetMonth(target);
    } else {
      setReportTargetMonth({
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1
      });
    }
    setIsMonthlyReportOpen(true);
  };

  const handleOpenWallpaper = (entry = null, date = null) => {
    setWallpaperTarget({
      entry: entry || entries[date || todayStr] || null,
      dateStr: date || todayStr
    });
    setIsWallpaperModalOpen(true);
  };

  const startObj = new Date(`${startDate}T00:00:00`);
  const todayObj = new Date(`${todayStr}T00:00:00`);
  const dayCount = Math.max(1, Math.floor((todayObj - startObj) / (1000 * 60 * 60 * 24)) + 1);
  const userDisplayName = currentUser ? getUserDisplayName(currentUser.email, currentUser.displayName) : 'Daily Operator';

  if (showIconLab) {
    return (
      <IconLab
        onBack={() => {
          setShowIconLab(false);
          window.history.replaceState(null, '', window.location.pathname);
        }}
      />
    );
  }

  if (showSkeletonPreview) {
    return (
      <div className="relative">
        <div className="fixed top-3 right-4 z-50 flex items-center gap-2 bg-black text-white px-3.5 py-2 rounded-2xl border-2 border-white shadow-[4px_4px_0px_#000000]">
          <span className="font-mono text-xs font-bold text-[#FDC800]">🦴 SKELETON PREVIEW ACTIVE</span>
          <button
            type="button"
            onClick={() => {
              setShowSkeletonPreview(false);
              window.history.replaceState(null, '', window.location.pathname);
            }}
            className="px-2.5 py-1 bg-[#FF4D4D] hover:bg-red-600 text-black hover:text-white rounded-xl font-mono text-xs font-black cursor-pointer ml-1"
          >
            EXIT PREVIEW
          </button>
        </div>
        <SkeletonLoader isMobile={isMobile} />
      </div>
    );
  }

  if (isInitialLoading) {
    return <SkeletonLoader isMobile={isMobile} />;
  }

  const handleDesktopTabChange = (tabId) => {
    setActiveDesktopTab(tabId);
  };

  return (
    <div className="min-h-screen bg-[#FFFDF5] text-black font-sans selection:bg-[#FDC800] selection:text-black">
      
      {/* 📲 PWA 1-Tap Native Install Prompt Banner */}
      <PWAInstallBanner />

      {isMobile ? (
        <MobileAppView
          startDate={startDate}
          entries={entries}
          dayCount={dayCount}
          todayStr={todayStr}
          onSaveToday={handleSaveEntry}
          onOpenMonthlyReport={handleOpenMonthlyReport}
          onEditDay={(dayInfo) => setEditingDay(dayInfo)}
          onOpenWallpaper={(entry, date) => handleOpenWallpaper(entry, date)}
          onOpenTelemetry={() => setIsTelemetryOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenStickerVault={() => setIsStickerVaultOpen(true)}
          sphereSettingsVer={sphereSettingsVer}
        />
      ) : (
        <div className="flex flex-col min-h-screen">
          <div className="border-b-3 border-black bg-white sticky top-0 z-30">
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6">
              <Header
                startDate={startDate}
                entries={entries}
                dayCount={dayCount}
                todayStr={todayStr}
                activeTab={activeDesktopTab}
                onTabChange={handleDesktopTabChange}
                onOpenSettings={() => setIsSettingsOpen(true)}
                onSyncRefresh={loadData}
              />
            </div>
          </div>

          <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
            {/* VIEW 1: TODAY ACTIVE WORKSPACE & STATS */}
            {activeDesktopTab === 'today' && (
              <div className="space-y-6">
                <TodayHero
                  todayStr={todayStr}
                  dayCount={dayCount}
                  todayEntry={entries[todayStr] || null}
                  currentEntry={entries[todayStr] || null}
                  onSaveToday={handleSaveEntry}
                  onSave={handleSaveEntry}
                  onOpenWallpaper={() => handleOpenWallpaper(null, todayStr)}
                  sphereSettingsVer={sphereSettingsVer}
                />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* Left (7 cols): Full Lifetime Metrics Widget */}
                  <div className="lg:col-span-7">
                    <StatsWidget
                      entries={entries}
                      dayCount={dayCount}
                      onOpenTelemetry={() => setIsTelemetryOpen(true)}
                    />
                  </div>

                  {/* Right (5 cols): Deep Forensic Telemetry & Momentum Hub */}
                  <div className="lg:col-span-5 space-y-4">
                    <div className="p-5 bg-white border-2 border-black rounded-2xl shadow-[3px_3px_0px_#000000] space-y-4">
                      <div className="flex items-center justify-between border-b border-black/10 pb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-xl bg-[#00E599] border-2 border-black flex items-center justify-center shadow-[1px_1px_0px_#000000]">
                            <Zap className="w-4 h-4 text-black fill-black" />
                          </div>
                          <div>
                            <h4 className="font-display font-black text-sm uppercase">Forensic Telemetry Hub</h4>
                            <span className="text-[10px] font-mono text-neutral-500 font-bold">Deep behavioral analytics & momentum radar</span>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-black text-[#FDC800] text-[9px] font-mono font-black">
                          PRO
                        </span>
                      </div>

                      <p className="text-xs font-mono text-neutral-700 leading-relaxed">
                        Track streak velocity, volatility index, peak performance clusters, and multi-sphere distribution across your whole journey.
                      </p>

                      <button
                        type="button"
                        onClick={() => setIsTelemetryOpen(true)}
                        className="w-full py-3 bg-[#00E599] hover:bg-emerald-400 font-display font-black text-xs uppercase border-2 border-black rounded-xl shadow-[2.5px_2.5px_0px_#000000] cursor-pointer flex items-center justify-center gap-2 transition-all hover:-translate-x-0.5 hover:-translate-y-0.5"
                      >
                        <Zap className="w-4 h-4 text-black fill-black" />
                        <span>LAUNCH FULL FORENSIC SUITE</span>
                      </button>
                    </div>

                    <div className="p-5 bg-[#FFFDF5] border-2 border-black rounded-2xl shadow-[3px_3px_0px_#000000] space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-black" />
                          <h4 className="font-display font-black text-xs uppercase">Calendar & Timeline Stream</h4>
                        </div>
                        <span className="text-[10px] font-mono font-bold text-neutral-500">{Object.keys(entries).length} days logged</span>
                      </div>

                      <p className="text-xs font-mono text-neutral-600">
                        View your full month-by-month heatmap grid, past reflections, and chronological day stream.
                      </p>

                      <button
                        type="button"
                        onClick={() => setActiveDesktopTab('timeline')}
                        className="w-full py-2.5 bg-white hover:bg-[#FDC800] font-display font-black text-xs uppercase border-2 border-black rounded-xl shadow-[2px_2px_0px_#000000] cursor-pointer transition-all flex items-center justify-center gap-1.5"
                      >
                        <span>OPEN CALENDAR & TIMELINE</span>
                        <span>→</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* VIEW 2: CALENDAR MATRIX & JOURNEY TIMELINE */}
            {activeDesktopTab === 'timeline' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-7">
                  <CalendarModal
                    isOpen={true}
                    isEmbedded={true}
                    entries={entries}
                    startDate={startDate}
                    todayStr={todayStr}
                    onEditDay={(dayInfo) => setEditingDay(dayInfo)}
                    onOpenMonthlyReport={handleOpenMonthlyReport}
                  />
                </div>

                <div className="lg:col-span-5 space-y-6">
                  <JourneyTimeline
                    startDate={startDate}
                    entries={entries}
                    todayStr={todayStr}
                    onEditDay={(dayInfo) => setEditingDay(dayInfo)}
                    onOpenWallpaper={(entry, date) => handleOpenWallpaper(entry, date)}
                  />
                </div>
              </div>
            )}

            {/* VIEW 3: FULL IN-PAGE MONTHLY DOSSIER */}
            {activeDesktopTab === 'dossier' && (
              <div className="w-full">
                <MonthlyReportModal
                  isOpen={true}
                  isEmbedded={true}
                  initialYear={reportTargetMonth.year}
                  initialMonth={reportTargetMonth.month}
                />
              </div>
            )}

            {/* VIEW 4: FULL IN-PAGE CREATIVE STUDIO */}
            {activeDesktopTab === 'studio' && (
              <div className="w-full">
                <AestheticCardExportModal
                  isOpen={true}
                  isEmbedded={true}
                  entry={entries[todayStr] || null}
                  dateStr={todayStr}
                  dayCount={dayCount}
                  startDate={startDate}
                  entries={entries}
                  displayName={userDisplayName}
                />
              </div>
            )}
          </main>

          <footer className="w-full max-w-7xl mx-auto text-center text-xs font-mono font-bold text-neutral-600 py-10 px-6 border-t-2 border-black/10 mt-14 mb-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
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
        onOpenWallpaper={(entry, date) => handleOpenWallpaper(entry, date)}
        sphereSettingsVer={sphereSettingsVer}
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
        entries={entries}
        startDate={startDate}
        displayName={userDisplayName}
      />

      {/* ⚡ Forensic Telemetry & Analytics Modal */}
      <ForensicStatsModal
        isOpen={isTelemetryOpen}
        onClose={() => setIsTelemetryOpen(false)}
        entries={entries}
        startDate={startDate}
        todayStr={todayStr}
      />

      {/* ⚙️ App Settings & Notification Hub Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        user={currentUser}
        onSettingsChanged={() => setSphereSettingsVer(v => v + 1)}
      />

      {/* 🎭 Sticker & Mascot Vault Modal */}
      <StickerVaultModal
        isOpen={isStickerVaultOpen}
        onClose={() => setIsStickerVaultOpen(false)}
      />

    </div>
  );
}
