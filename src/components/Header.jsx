import React, { useState, useEffect, useRef } from 'react';
import { Zap, Flame, Download, Calendar, Sparkles, Cloud, LogIn, LogOut, User, CheckCircle2, Settings } from 'lucide-react';
import { exportDatabaseBackup } from '../services/api';
import { loginWithGoogle, logoutUser, isEmailWhitelisted, subscribeAuthState } from '../services/firebase';
import MagneticButton from './MagneticButton';

export default function Header({ 
  startDate, 
  entries, 
  dayCount,
  onToggleCalendar,
  isCalendarOpen,
  onOpenMonthlyReport,
  onOpenWallpaper,
  onOpenSettings,
  onSyncRefresh
}) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [showUserMenu]);

  useEffect(() => {
    const unsubscribe = subscribeAuthState((currentUser) => {
      setUser(currentUser);
      if (currentUser && isEmailWhitelisted(currentUser.email)) {
        if (onSyncRefresh) onSyncRefresh();
      }
    });
    return () => unsubscribe();
  }, [onSyncRefresh]);

  const handleGoogleLogin = async () => {
    setAuthLoading(true);
    try {
      await loginWithGoogle();
      if (onSyncRefresh) onSyncRefresh();
    } catch (err) {
      console.error('Login error:', err);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      setShowUserMenu(false);
      if (onSyncRefresh) onSyncRefresh();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const handleExport = () => {
    exportDatabaseBackup(startDate, entries);
  };

  const isWhitelisted = user && isEmailWhitelisted(user.email);

  return (
    <header className="w-full max-w-[1380px] mx-auto px-4 sm:px-10 pt-6 sm:pt-10 pb-4 sm:pb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      
      {/* Brand */}
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#FDC800] border-2 border-black flex items-center justify-center text-black shadow-[3px_3px_0px_#000000] shrink-0">
          <Zap className="w-6 h-6 sm:w-7 sm:h-7 text-black stroke-[3] fill-black" />
        </div>
        <div>
          <h1 className="font-display font-black text-xl sm:text-2xl text-black tracking-tight leading-none uppercase">
            Daily Verdict
          </h1>
          <span className="text-[11px] sm:text-xs font-mono font-bold text-neutral-600 block mt-1">
            {isWhitelisted ? `☁️ Cloud Sync Active (${user.displayName || user.email.split('@')[0]})` : 'Day 1 starts today • Local Database Active'}
          </span>
        </div>
      </div>

      {/* Actions: Streak, Cloud Sync, Monthly Dossier, Calendar, Backup */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full md:w-auto">
        
        {/* Streak Badge */}
        <div className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl bg-[#00E599] border-2 border-black text-black text-xs font-mono font-black shadow-[2px_2px_0px_#000000]">
          <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-black fill-black" />
          <span>DAY {dayCount}</span>
        </div>

        {/* Firebase Cloud Sync Button */}
        {user ? (
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className={`px-3 py-2 rounded-xl border-2 border-black font-mono text-xs font-black flex items-center gap-1.5 shadow-[2px_2px_0px_#000000] cursor-pointer transition-all ${
                isWhitelisted ? 'bg-[#00E599] text-black' : 'bg-neutral-200 text-neutral-700'
              }`}
              title={isWhitelisted ? `Cloud Synced to ${user.email}` : `Guest mode (${user.email})`}
            >
              <Cloud className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="truncate max-w-[120px]">{user.displayName ? user.displayName.split(' ')[0] : 'Account'}</span>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-60 bg-white border-2 border-black rounded-xl p-3 shadow-[4px_4px_0px_#000000] z-50 space-y-2 text-left">
                <div className="text-[11px] font-mono font-bold text-black border-b border-black/10 pb-2">
                  <div className="font-black truncate">{user.displayName || 'Signed In User'}</div>
                  <div className="text-neutral-500 text-[10px] truncate">{user.email}</div>
                  <div className="mt-1">
                    {isWhitelisted ? (
                      <span className="px-1.5 py-0.5 rounded bg-[#00E599] text-black text-[9px] font-black uppercase inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Whitelisted Cloud Sync
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded bg-neutral-200 text-neutral-700 text-[9px] font-bold uppercase">
                        Local Storage Mode
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="w-full neo-btn py-1.5 px-3 bg-[#FF4D4D] text-black text-xs font-mono font-black rounded-lg flex items-center justify-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_#000000]"
                >
                  <LogOut className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={handleGoogleLogin}
            disabled={authLoading}
            className="px-3 py-2 rounded-xl bg-white hover:bg-[#FDC800] border-2 border-black text-black text-xs font-mono font-black flex items-center gap-1.5 shadow-[2px_2px_0px_#000000] cursor-pointer"
            title="Sign in with Google for Cloud Sync"
          >
            <LogIn className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>{authLoading ? 'Signing In...' : 'CLOUD SYNC'}</span>
          </button>
        )}

        {/* Monthly Performance Intelligence Dossier Button */}
        <MagneticButton
          onClick={onOpenMonthlyReport}
          title="Open Monthly AI Performance Intelligence Dossier"
          className="px-3 sm:px-4 py-2 rounded-xl bg-[#FDC800] border-2 border-black text-black text-xs font-mono font-black flex items-center gap-1.5 sm:gap-2 shadow-[2px_2px_0px_#000000] cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
          <span>DOSSIER</span>
        </MagneticButton>

        {/* Calendar Toggle Button */}
        <MagneticButton
          onClick={onToggleCalendar}
          className={`px-3 sm:px-4 py-2 rounded-xl border-2 border-black text-black text-xs font-mono font-black flex items-center gap-1.5 sm:gap-2 shadow-[2px_2px_0px_#000000] cursor-pointer ${
            isCalendarOpen ? 'bg-[#FDC800]' : 'bg-white'
          }`}
        >
          <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
          <span className="hidden sm:inline">{isCalendarOpen ? 'CLOSE CALENDAR' : 'CALENDAR'}</span>
          <span className="sm:hidden">GRID</span>
        </MagneticButton>

        {/* Wallpaper & Social Export Button */}
        <button
          onClick={onOpenWallpaper}
          title="Export Aesthetic Phone Wallpaper or Social Card"
          className="px-3 py-2 rounded-xl bg-white hover:bg-[#FDC800] border-2 border-black text-black text-xs font-mono font-black flex items-center gap-1.5 shadow-[2px_2px_0px_#000000] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_#000000] transition-all cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-black" />
          <span className="hidden sm:inline">WALLPAPER</span>
        </button>

        {/* Backup Button */}
        <button
          onClick={handleExport}
          title="Backup JSON Data"
          className="px-3 py-2 rounded-xl bg-white border-2 border-black text-black text-xs font-mono font-black flex items-center gap-1.5 shadow-[2px_2px_0px_#000000] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_#000000] transition-all cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
          <span className="hidden sm:inline">BACKUP</span>
        </button>

        {/* App Settings Button */}
        {onOpenSettings && (
          <button
            onClick={onOpenSettings}
            title="App Settings & Notifications"
            className="p-2 rounded-xl bg-white hover:bg-[#FDC800] border-2 border-black text-black shadow-[2px_2px_0px_#000000] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_#000000] transition-all cursor-pointer"
          >
            <Settings className="w-4 h-4 text-black" />
          </button>
        )}
      </div>

    </header>
  );
}
