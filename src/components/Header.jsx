import React, { useState, useEffect, useRef } from 'react';
import { Zap, Flame, Download, Calendar, Sparkles, Cloud, LogIn, LogOut, User, CheckCircle2, Settings } from 'lucide-react';
import { exportDatabaseBackup } from '../services/api';
import { loginWithGoogle, logoutUser, isEmailWhitelisted, subscribeAuthState } from '../services/firebase';
import MagneticButton from './MagneticButton';

import ShieldVoltIcon from './ShieldVoltIcon';

export default function Header({ 
  startDate = '2026-08-01', 
  entries = {}, 
  dayCount = 1,
  todayStr = '2026-08-01',
  activeTab = 'today',
  onTabChange,
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

  const TABS = [
    { id: 'today', label: 'TODAY', icon: Zap },
    { id: 'timeline', label: 'TIMELINE & GRID', icon: Calendar },
    { id: 'dossier', label: 'DOSSIER', icon: Sparkles },
    { id: 'studio', label: 'CREATIVE STUDIO', icon: Sparkles },
  ];

  return (
    <header className="w-full max-w-[1380px] mx-auto px-4 sm:px-6 py-3.5 sm:py-4 flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
      
      {/* 1. Left: Brand & Day Streak */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-10 h-10 rounded-2xl bg-white border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_#000000] shrink-0 p-1">
          <ShieldVoltIcon className="w-full h-full" color="#FDC800" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display font-black text-lg sm:text-xl text-black tracking-tight leading-none uppercase whitespace-nowrap">
              SHIT OR HIT
            </h1>
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#00E599] border-2 border-black text-black text-[10px] font-mono font-black shadow-[1.5px_1.5px_0px_#000000]">
              <Flame className="w-3 h-3 text-black fill-black" />
              <span>DAY {dayCount}</span>
            </div>
          </div>
          <span className="text-[10px] font-mono font-bold text-neutral-500 block mt-0.5 whitespace-nowrap">
            {isWhitelisted ? `☁️ Cloud Sync (${user.displayName || 'Trinno'})` : 'Daily Verdict OS'}
          </span>
        </div>
      </div>

      {/* 2. Center: Segmented Navigation Tabs */}
      <nav className="flex items-center bg-[#F4F2E6] p-1 rounded-2xl border-2 border-black shadow-[2.5px_2.5px_0px_#000000] gap-1 shrink-0">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange && onTabChange(tab.id)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-display font-black text-xs uppercase transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#FDC800] text-black border-2 border-black shadow-[1.5px_1.5px_0px_#000000]'
                  : 'text-neutral-700 hover:text-black hover:bg-black/5 border-2 border-transparent'
              }`}
            >
              <Icon className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* 3. Right: Subtle Cloud Status, Backup & Settings */}
      <div className="flex items-center gap-2 shrink-0">
        
        {/* Minimal Cloud Status Pill / Dropdown */}
        {user ? (
          <div className="relative shrink-0" ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className={`px-2.5 py-1.5 rounded-xl border-2 border-black font-mono text-xs font-black flex items-center gap-1.5 shadow-[1.5px_1.5px_0px_#000000] cursor-pointer transition-all ${
                isWhitelisted ? 'bg-[#00E599] text-black' : 'bg-neutral-100 text-neutral-700'
              }`}
              title={isWhitelisted ? `Cloud Synced (${user.displayName || 'Trinno'})` : `Local mode`}
            >
              <div className="w-2 h-2 rounded-full bg-emerald-700 animate-pulse shrink-0" />
              <Cloud className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="truncate max-w-[90px]">{user.displayName || 'Trinno'}</span>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-60 bg-white border-2 border-black rounded-xl p-3 shadow-[4px_4px_0px_#000000] z-50 space-y-2 text-left">
                <div className="text-[11px] font-mono font-bold text-black border-b border-black/10 pb-2">
                  <div className="font-black truncate">{user.displayName || 'Trinno'}</div>
                  <div className="text-neutral-500 text-[10px] truncate">
                    {user.displayName === 'Trinno' ? 'trinno@cloud.sync' : user.email}
                  </div>
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
            className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-white hover:bg-[#FDC800] border-2 border-black text-black text-xs font-mono font-black flex items-center gap-1.5 shadow-[1.5px_1.5px_0px_#000000] cursor-pointer shrink-0"
            title="Connect Google Cloud Sync"
          >
            <Cloud className="w-3.5 h-3.5 stroke-[2.5]" />
            <span className="hidden sm:inline">{authLoading ? 'Signing In...' : 'SYNC'}</span>
          </button>
        )}

        {/* Backup Button */}
        <button
          onClick={handleExport}
          title="Backup JSON Data"
          className="p-2 rounded-xl bg-white hover:bg-neutral-100 border-2 border-black text-black shadow-[1.5px_1.5px_0px_#000000] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all cursor-pointer shrink-0"
        >
          <Download className="w-4 h-4 stroke-[2.5]" />
        </button>

        {/* Settings Button */}
        {onOpenSettings && (
          <button
            onClick={onOpenSettings}
            title="App Settings & Customizations"
            className="p-2 rounded-xl bg-white hover:bg-[#FDC800] border-2 border-black text-black shadow-[1.5px_1.5px_0px_#000000] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all cursor-pointer shrink-0"
          >
            <Settings className="w-4 h-4 text-black" />
          </button>
        )}

      </div>

    </header>
  );
}
