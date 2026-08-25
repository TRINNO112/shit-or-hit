import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, 
  Flame, 
  Sparkles, 
  Cloud, 
  Download, 
  Calendar, 
  BarChart2, 
  Clock, 
  Check, 
  PenLine, 
  ChevronRight, 
  CheckCircle2,
  LogIn,
  LogOut,
  AlertCircle,
  CloudRain,
  MinusCircle
} from 'lucide-react';
import { ratingMeta, exportDatabaseBackup } from '../services/api';
import { loginWithGoogle, logoutUser, isEmailWhitelisted, subscribeAuthState } from '../services/firebase';
import confetti from 'canvas-confetti';
import JourneyTimeline from './JourneyTimeline';
import StatsWidget from './StatsWidget';

const IconMap = {
  AlertCircle,
  CloudRain,
  MinusCircle,
  Zap,
  Sparkles
};

export default function MobileAppView({
  startDate,
  entries,
  dayCount,
  todayStr,
  onSaveToday,
  onOpenMonthlyReport,
  onEditDay
}) {
  const [activeTab, setActiveTab] = useState('log'); // 'log' | 'timeline' | 'stats'
  const [user, setUser] = useState(null);
  const [showNoteDrawer, setShowNoteDrawer] = useState(false);
  const [noteText, setNoteText] = useState(entries[todayStr]?.notes || '');
  const [savedFlash, setSavedFlash] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);

  useEffect(() => {
    const unsub = subscribeAuthState((currentUser) => {
      setUser(currentUser);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (entries[todayStr]?.notes !== undefined) {
      setNoteText(entries[todayStr].notes);
    }
  }, [entries, todayStr]);

  const selectedRating = entries[todayStr]?.rating || null;
  const isWhitelisted = user && isEmailWhitelisted(user.email);

  const now = new Date();
  const dayName = now.toLocaleDateString('en-US', { weekday: 'long' });
  const fullDate = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const handleRate = async (val) => {
    if (val === 5) {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 }, colors: ['#FDC800', '#000000', '#00E599'] });
    } else if (val === 4) {
      confetti({ particleCount: 25, spread: 45, origin: { y: 0.75 }, colors: ['#00E599', '#000000'] });
    }

    setSavedFlash(true);
    await onSaveToday({
      date: todayStr,
      rating: val,
      verdict: ratingMeta[val]?.title || 'Verdict',
      notes: noteText
    });
    setTimeout(() => setSavedFlash(false), 2000);
  };

  const handleSaveNote = async () => {
    const ratingToUse = selectedRating || 3;
    await onSaveToday({
      date: todayStr,
      rating: ratingToUse,
      verdict: ratingMeta[ratingToUse]?.title || 'Verdict',
      notes: noteText
    });
    setShowNoteDrawer(false);
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 2000);
  };

  const handleGoogleLogin = async () => {
    setAuthLoading(true);
    try {
      await loginWithGoogle();
    } catch (err) {
      console.error('Login error:', err);
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#FFFDF5] text-black font-sans pb-24 select-none">
      
      {/* 📱 TOP COMPACT APP BAR */}
      <header className="sticky top-0 z-40 bg-[#FFFDF5]/95 backdrop-blur-md border-b-2 border-black px-4 py-3 flex items-center justify-between shadow-[0_2px_0px_#000000]">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#FDC800] border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_#000000]">
            <Zap className="w-5 h-5 text-black stroke-[3] fill-black" />
          </div>
          <div>
            <h1 className="font-display font-black text-base uppercase leading-none tracking-tight">
              Daily Verdict
            </h1>
            <span className="text-[10px] font-mono font-bold text-neutral-500 block mt-0.5">
              {isWhitelisted ? `☁️ ${user.displayName?.split(' ')[0] || 'Cloud'}` : 'Offline Mode'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Day Streak Pill */}
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#00E599] border-2 border-black font-mono text-[11px] font-black shadow-[1.5px_1.5px_0px_#000000]">
            <Flame className="w-3.5 h-3.5 fill-black text-black" />
            <span>D{dayCount}</span>
          </div>

          {/* Cloud Auth / Profile */}
          {user ? (
            <button
              onClick={() => setShowUserModal(true)}
              className={`p-1.5 rounded-lg border-2 border-black shadow-[1.5px_1.5px_0px_#000000] cursor-pointer ${
                isWhitelisted ? 'bg-[#00E599]' : 'bg-neutral-200'
              }`}
              title={user.email}
            >
              <Cloud className="w-4 h-4 text-black stroke-[2.5]" />
            </button>
          ) : (
            <button
              onClick={handleGoogleLogin}
              disabled={authLoading}
              className="px-2.5 py-1 rounded-lg bg-white border-2 border-black font-mono text-[10px] font-black flex items-center gap-1 shadow-[1.5px_1.5px_0px_#000000] cursor-pointer"
            >
              <LogIn className="w-3 h-3 stroke-[2.5]" />
              <span>SYNC</span>
            </button>
          )}

          {/* Backup Button */}
          <button
            onClick={() => exportDatabaseBackup(startDate, entries)}
            className="p-1.5 rounded-lg bg-white border-2 border-black shadow-[1.5px_1.5px_0px_#000000] cursor-pointer"
            title="Download JSON Backup"
          >
            <Download className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      </header>

      {/* ⚡ TAB 1: RAPID 1-TAP MOOD LOGGER */}
      {activeTab === 'log' && (
        <main className="flex-1 px-4 py-4 space-y-4 max-w-lg mx-auto w-full">
          
          {/* Hero Date Banner */}
          <div className="p-4 rounded-2xl border-2 border-black bg-white shadow-[3px_3px_0px_#000000] flex items-center justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-black text-white text-[10px] font-mono font-black mb-1">
                <span>TODAY</span>
                <span>•</span>
                <span>DAY {dayCount}</span>
              </div>
              <h2 className="font-display font-black text-2xl uppercase tracking-tight leading-none text-black">
                {dayName}
              </h2>
              <p className="text-xs font-mono font-bold text-neutral-600 mt-1">
                {fullDate}
              </p>
            </div>

            {selectedRating && (
              <div 
                className="w-12 h-12 rounded-xl border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_#000000]"
                style={{ backgroundColor: ratingMeta[selectedRating]?.bg }}
              >
                {React.createElement(IconMap[ratingMeta[selectedRating]?.icon] || Sparkles, {
                  className: "w-6 h-6 text-black stroke-[2.5]"
                })}
              </div>
            )}
          </div>

          {/* 5 Prominent 1-Tap Tactile Cards (NO Truncated Text) */}
          <div className="space-y-2.5">
            {[5, 4, 3, 2, 1].map((val) => {
              const m = ratingMeta[val];
              const SvgIcon = IconMap[m.icon];
              const isSelected = selectedRating === val;

              return (
                <motion.button
                  key={val}
                  type="button"
                  whileTap={{ scale: 0.96 }}
                  onClick={() => handleRate(val)}
                  className={`w-full p-3.5 rounded-2xl border-2 border-black flex items-center justify-between shadow-[3px_3px_0px_#000000] cursor-pointer transition-all ${
                    isSelected ? 'ring-3 ring-black scale-[1.01]' : 'hover:bg-neutral-50'
                  }`}
                  style={{ 
                    backgroundColor: isSelected ? m.bg : '#FFFFFF'
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-xl border-2 border-black flex items-center justify-center shadow-[1.5px_1.5px_0px_#000000] shrink-0"
                      style={{ backgroundColor: m.bg }}
                    >
                      <SvgIcon className="w-5 h-5 text-black stroke-[2.5]" />
                    </div>

                    <div className="text-left">
                      <div className="flex items-center gap-2">
                        <span className="font-display font-black text-base uppercase text-black leading-tight">
                          {m.title}
                        </span>
                        <span className="text-xs font-mono font-black text-neutral-800">
                          ({val}/5★)
                        </span>
                      </div>
                      <span className="text-[11px] font-mono font-bold text-neutral-600 block">
                        {m.desc}
                      </span>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center shrink-0 shadow-[1px_1px_0px_#000000]">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Active Verdict Status & Optional Note Button */}
          <div className="pt-2 space-y-2.5">
            {selectedRating ? (
              <div 
                className="p-3 rounded-xl border-2 border-black text-xs font-mono font-bold text-black flex items-center justify-between shadow-[2px_2px_0px_#000000]"
                style={{ backgroundColor: ratingMeta[selectedRating]?.bg }}
              >
                <div className="flex items-center gap-2 truncate">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-black stroke-[2.5]" />
                  <span className="truncate">
                    <strong>{ratingMeta[selectedRating]?.title.toUpperCase()}</strong>: {ratingMeta[selectedRating]?.desc}
                  </span>
                </div>
                {savedFlash && (
                  <span className="px-2 py-0.5 rounded bg-black text-white text-[10px] font-black uppercase shrink-0">
                    SAVED ⚡
                  </span>
                )}
              </div>
            ) : (
              <div className="p-3 rounded-xl border-2 border-black bg-neutral-100 text-neutral-600 text-xs font-mono font-bold text-center">
                Tap any card above to lock in today's verdict.
              </div>
            )}

            {/* Reflection Drawer Trigger */}
            <button
              onClick={() => setShowNoteDrawer(true)}
              className="w-full py-2.5 px-4 rounded-xl border-2 border-black bg-white hover:bg-[#FDC800] text-black font-mono font-black text-xs flex items-center justify-center gap-2 shadow-[2px_2px_0px_#000000] cursor-pointer"
            >
              <PenLine className="w-3.5 h-3.5" />
              <span>{entries[todayStr]?.notes ? '✏️ EDIT DIARY NOTE' : '+ ADD OPTIONAL NOTE'}</span>
            </button>
          </div>

        </main>
      )}

      {/* 📜 TAB 2: JOURNEY TIMELINE */}
      {activeTab === 'timeline' && (
        <main className="flex-1 px-4 py-4 max-w-lg mx-auto w-full">
          <div className="mb-3">
            <h2 className="font-display font-black text-xl uppercase tracking-tight text-black">
              Journey Timeline
            </h2>
            <p className="text-xs font-mono font-bold text-neutral-600">
              Scroll through all your recorded daily verdicts.
            </p>
          </div>
          <JourneyTimeline
            startDate={startDate}
            todayStr={todayStr}
            entries={entries}
            onEditDay={onEditDay}
          />
        </main>
      )}

      {/* 📊 TAB 3: STATS & MATRIX */}
      {activeTab === 'stats' && (
        <main className="flex-1 px-4 py-4 max-w-lg mx-auto w-full space-y-4">
          <div className="mb-2">
            <h2 className="font-display font-black text-xl uppercase tracking-tight text-black">
              Performance Metrics
            </h2>
            <p className="text-xs font-mono font-bold text-neutral-600">
              Real-time analytics and verdict distribution.
            </p>
          </div>
          <StatsWidget entries={entries} dayCount={dayCount} />
        </main>
      )}

      {/* 🧠 OPTIONAL REFLECTION NOTE MODAL DRAWER */}
      <AnimatePresence>
        {showNoteDrawer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-end justify-center p-0"
            onClick={() => setShowNoteDrawer(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="w-full max-w-lg bg-[#FFFDF5] rounded-t-3xl border-t-3 border-x-3 border-black p-5 shadow-[0_-5px_0px_#000000] space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-1.5 bg-black/20 rounded-full mx-auto" />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <PenLine className="w-4 h-4 stroke-[2.5]" />
                  <h3 className="font-display font-black text-base uppercase">
                    Daily Reflection Note
                  </h3>
                </div>
                <button
                  onClick={() => setShowNoteDrawer(false)}
                  className="px-2 py-1 rounded-lg bg-neutral-200 text-xs font-mono font-bold"
                >
                  Cancel
                </button>
              </div>

              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="How did your day really go? (Optional)"
                className="w-full h-36 p-3 rounded-xl border-2 border-black bg-white font-mono text-xs text-black resize-none focus:outline-none focus:ring-2 focus:ring-[#FDC800]"
              />

              <button
                onClick={handleSaveNote}
                className="w-full py-3 bg-[#00E599] hover:bg-emerald-400 text-black font-display font-black text-sm uppercase rounded-xl border-2 border-black shadow-[3px_3px_0px_#000000] cursor-pointer"
              >
                Save Reflection
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 👤 CLOUD USER STATUS MODAL */}
      <AnimatePresence>
        {showUserModal && user && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4"
            onClick={() => setShowUserModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 15 }}
              className="w-full max-w-sm bg-white rounded-2xl border-3 border-black p-5 shadow-[5px_5px_0px_#000000] space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 border-b-2 border-black/10 pb-3">
                <div className="w-10 h-10 rounded-xl bg-[#00E599] border-2 border-black flex items-center justify-center">
                  <Cloud className="w-5 h-5 text-black stroke-[2.5]" />
                </div>
                <div>
                  <h4 className="font-display font-black text-base leading-none">
                    {user.displayName || 'Google Account'}
                  </h4>
                  <span className="text-xs font-mono text-neutral-500 block mt-0.5">
                    {user.email}
                  </span>
                </div>
              </div>

              <div>
                {isWhitelisted ? (
                  <div className="p-2.5 rounded-xl bg-[#00E599]/20 border border-[#00E599] text-xs font-mono font-bold text-emerald-950 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Whitelisted Account • Full Firestore Cloud Sync Active</span>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-xl bg-neutral-100 border border-neutral-300 text-xs font-mono font-bold text-neutral-700">
                    Local Mode • Data saved on this device.
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    logoutUser();
                    setShowUserModal(false);
                  }}
                  className="w-full py-2 bg-[#FF4D4D] text-black font-mono font-black text-xs uppercase rounded-xl border-2 border-black shadow-[2px_2px_0px_#000000]"
                >
                  Sign Out
                </button>
                <button
                  onClick={() => setShowUserModal(false)}
                  className="w-full py-2 bg-neutral-200 text-black font-mono font-bold text-xs uppercase rounded-xl border-2 border-black"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 📱 BOTTOM STICKY NATIVE APP NAVIGATION BAR */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t-3 border-black py-2 px-3 flex items-center justify-around shadow-[0_-3px_0px_#000000]">
        
        {/* Tab 1: Log Today */}
        <button
          onClick={() => setActiveTab('log')}
          className={`flex flex-col items-center justify-center px-4 py-1 rounded-xl transition-all cursor-pointer ${
            activeTab === 'log' 
              ? 'bg-[#FDC800] text-black border-2 border-black shadow-[2px_2px_0px_#000000]' 
              : 'text-neutral-500 hover:text-black'
          }`}
        >
          <Zap className="w-5 h-5 stroke-[2.5]" />
          <span className="font-mono font-black text-[10px] uppercase mt-0.5">Log</span>
        </button>

        {/* Tab 2: Timeline */}
        <button
          onClick={() => setActiveTab('timeline')}
          className={`flex flex-col items-center justify-center px-4 py-1 rounded-xl transition-all cursor-pointer ${
            activeTab === 'timeline' 
              ? 'bg-[#FDC800] text-black border-2 border-black shadow-[2px_2px_0px_#000000]' 
              : 'text-neutral-500 hover:text-black'
          }`}
        >
          <Clock className="w-5 h-5 stroke-[2.5]" />
          <span className="font-mono font-black text-[10px] uppercase mt-0.5">Timeline</span>
        </button>

        {/* Tab 3: Stats */}
        <button
          onClick={() => setActiveTab('stats')}
          className={`flex flex-col items-center justify-center px-4 py-1 rounded-xl transition-all cursor-pointer ${
            activeTab === 'stats' 
              ? 'bg-[#FDC800] text-black border-2 border-black shadow-[2px_2px_0px_#000000]' 
              : 'text-neutral-500 hover:text-black'
          }`}
        >
          <BarChart2 className="w-5 h-5 stroke-[2.5]" />
          <span className="font-mono font-black text-[10px] uppercase mt-0.5">Stats</span>
        </button>

        {/* Tab 4: AI Monthly Dossier Trigger */}
        <button
          onClick={onOpenMonthlyReport}
          className="flex flex-col items-center justify-center px-4 py-1 rounded-xl bg-[#00E599] text-black border-2 border-black shadow-[2px_2px_0px_#000000] cursor-pointer"
        >
          <Sparkles className="w-5 h-5 stroke-[2.5]" />
          <span className="font-mono font-black text-[10px] uppercase mt-0.5">Dossier</span>
        </button>

      </nav>

    </div>
  );
}
