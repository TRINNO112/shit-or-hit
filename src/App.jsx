import React, { useState, useEffect, useCallback, useMemo, lazy, Suspense, startTransition } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Zap, Calendar, FlaskConical, Clock, Layers, CheckCircle2, X } from 'lucide-react';
import { playMood } from './services/soundEffects';
import Header from './components/Header';
import TodayHero from './components/TodayHero';
import JourneyTimeline from './components/JourneyTimeline';
import StatsWidget from './components/StatsWidget';
import MobileAppView from './components/MobileAppView';
import PWAInstallBanner from './components/PWAInstallBanner';
import SkeletonLoader from './components/SkeletonLoader';
import { VaultLockGatekeeper, isVaultPinActive } from './components/VaultPinModal';
import ErrorBoundary from './components/ErrorBoundary';
import FaultBoundary from './components/FaultBoundary';
import OfflineShelterBadge from './components/OfflineShelterBadge';

// ⚡ Self-Healing Dynamic Import for Vite Chunks:
// When new code is deployed to the server, stale open tabs might fail to fetch old chunk hashes.
// This wrapper intercepts chunk load errors and reloads the page once cleanly in the background.
function safeLazy(importFn) {
  return lazy(async () => {
    try {
      return await importFn();
    } catch (err) {
      const isChunkError = err?.message?.includes('Failed to fetch dynamically imported module') ||
                           err?.message?.includes('Loading chunk') ||
                           err?.name === 'ChunkLoadError';
      if (isChunkError && typeof window !== 'undefined') {
        const reloadKey = 'shit_or_hit_chunk_reload_lock';
        const lastReload = sessionStorage.getItem(reloadKey);
        if (!lastReload || Date.now() - Number(lastReload) > 10000) {
          sessionStorage.setItem(reloadKey, Date.now().toString());
          console.warn('🔄 Deploy update detected! Refreshing client for latest code release...');
          window.location.reload();
        }
      }
      throw err;
    }
  });
}

// ⚡ Self-Healing Code Splitting for Heavy Modals & Sub-Views
const CalendarModal = safeLazy(() => import('./components/CalendarModal'));
const EditDayModal = safeLazy(() => import('./components/EditDayModal'));
const MonthlyReportModal = safeLazy(() => import('./components/MonthlyReportModal'));
const AestheticCardExportModal = safeLazy(() => import('./components/AestheticCardExportModal'));
const ForensicStatsModal = safeLazy(() => import('./components/ForensicStatsModal'));
const SettingsModal = safeLazy(() => import('./components/SettingsModal'));
const IconLab = safeLazy(() => import('./components/IconLab'));
const StickerVaultModal = safeLazy(() => import('./components/StickerVaultModal'));
const MotivationalRecoveryModal = safeLazy(() => import('./components/MotivationalRecoveryModal'));
const NotFound404 = safeLazy(() => import('./components/NotFound404'));
const GuestDisclaimerModal = safeLazy(() => import('./components/GuestDisclaimerModal'));
const RansomCapsuleModal = safeLazy(() => import('./components/RansomCapsuleModal'));
const ReceiptOfTruthModal = safeLazy(() => import('./components/ReceiptOfTruthModal'));
const AutopsyChamberModal = safeLazy(() => import('./components/AutopsyChamberModal'));
const BehavioralLabModal = safeLazy(() => import('./components/BehavioralLabModal'));
const ExportStudioModal = safeLazy(() => import('./components/ExportStudioModal'));
const RehabilitationModal = safeLazy(() => import('./components/RehabilitationModal'));
const SanctuaryInvitationModal = safeLazy(() => import('./components/SanctuaryInvitationModal'));
const SanctuaryPage = safeLazy(() => import('./components/SanctuaryPage'));
const PrivacyPolicyPage = safeLazy(() => import('./components/PrivacyPolicyPage'));
const DataErasurePage = safeLazy(() => import('./components/DataErasurePage'));
const StorageSovereigntyPage = safeLazy(() => import('./components/StorageSovereigntyPage'));
const NotificationStudioPage = safeLazy(() => import('./components/NotificationStudioPage'));
const P2PDeviceSyncModal = safeLazy(() => import('./components/P2PDeviceSyncModal'));
const SovereignGuestBanner = safeLazy(() => import('./components/SovereignGuestBanner'));
const ArchitectureProjectionModal = safeLazy(() => import('./components/ArchitectureProjectionModal'));
import { soundEngine } from './services/soundEngine';
import {
  fetchDatabase,
  saveEntry,
  ratingMeta,
  getDbStorageKey,
  isRansomCapsuleEnabled,
  getRansomCapsuleSensitivity,
  getActiveSealedCapsule,
  isReceiptOfTruthEnabled,
  checkCapsuleUnlockConditions,
  calculateStreak,
  getRansomCapsules,
  hydrateTimeCapsulesFromCloud,
  isGuestDisclaimerDismissed,
  checkSanctuaryInvitationNeeded,
  declineSanctuaryInvitation,
  acceptSanctuaryInvitation,
  getPendingDeletionStatus,
  cancelAccountDeletion,
  normalizeNotesString,
  repairAndSanitizeDatabase
} from './services/api';
import { syncStoragePersistenceWithPreference } from './services/storageManager';
import { scheduleLocalEveningReminder } from './services/notifications';
import { subscribeAuthState, getUserDisplayName, fetchCloudUserSettings, getEffectiveUserId, getCurrentUser, loginWithGoogle } from './services/firebase';
import { decryptVaultPin, hashPinWithSalt } from './services/cipherEngine';

// Simulated crash test harness for ErrorBoundary verification
function SimulatedCrashTrigger({ shouldCrash }) {
  if (shouldCrash) {
    throw new Error("Simulated Reactor Core Trip: High-temperature entropy spike detected in V8 execution pipeline!");
  }
  return null;
}

function useIsMobile() {
  const checkMobile = () => {
    if (typeof window === 'undefined') return false;
    const isNarrow = window.innerWidth <= 768;
    const isMqlMobile = window.matchMedia ? window.matchMedia('(max-width: 768px)').matches : false;
    return isNarrow || isMqlMobile;
  };

  const [isMobile, setIsMobile] = useState(() => checkMobile());

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const update = () => setIsMobile(checkMobile());

    window.addEventListener('resize', update, { passive: true });
    window.addEventListener('orientationchange', update, { passive: true });

    const mql = window.matchMedia ? window.matchMedia('(max-width: 768px)') : null;
    if (mql) {
      if (mql.addEventListener) {
        mql.addEventListener('change', update);
      } else if (mql.addListener) {
        mql.addListener(update);
      }
    }

    update();

    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('orientationchange', update);
      if (mql) {
        if (mql.removeEventListener) {
          mql.removeEventListener('change', update);
        } else if (mql.removeListener) {
          mql.removeListener(update);
        }
      }
    };
  }, []);

  return isMobile;
}

export default function App() {
  const isMobile = useIsMobile();
  const [showIconLab, setShowIconLab] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.location.search.includes('view=icons') || 
           window.location.hash.includes('icons') ||
           window.location.search.includes('view=wallpaper') ||
           window.location.hash.includes('wallpaper') ||
           window.location.search.includes('view=pixels') ||
           window.location.hash.includes('pixels') ||
           window.location.search.includes('view=skeleton') ||
           window.location.hash.includes('skeleton');
  });
  const [iconLabTab, setIconLabTab] = useState(() => {
    if (typeof window === 'undefined') return 'year_pixels';
    const s = window.location.search;
    const h = window.location.hash;
    if (s.includes('view=skeleton') || h.includes('skeleton') || s.includes('tab=skeleton')) {
      return 'skeleton';
    }
    if (s.includes('view=wallpaper') || h.includes('wallpaper') || s.includes('view=pixels') || h.includes('pixels')) {
      return 'year_pixels';
    }
    if (s.includes('view=icons') || h.includes('icons')) {
      return 'icons';
    }
    return 'year_pixels';
  });
  const [showSkeletonPreview, setShowSkeletonPreview] = useState(false);
  const [showSanctuary, setShowSanctuary] = useState(() => {
    if (typeof window === 'undefined') return false;
    const params = new URLSearchParams(window.location.search);
    const view = params.get('view') || params.get('preview') || '';
    if (view === 'sanctuary-invitation' || view === 'invitation') return false;
    return view === 'sanctuary' || window.location.hash === '#sanctuary' || window.location.hash === '#/sanctuary';
  });
  const [showPrivacy, setShowPrivacy] = useState(() => {
    if (typeof window === 'undefined') return false;
    const params = new URLSearchParams(window.location.search);
    const view = params.get('view') || params.get('preview') || '';
    return view === 'privacy' || window.location.hash === '#privacy';
  });
  const [showErasure, setShowErasure] = useState(() => {
    if (typeof window === 'undefined') return false;
    const params = new URLSearchParams(window.location.search);
    const view = params.get('view') || params.get('preview') || '';
    return view === 'erasure' || window.location.hash === '#erasure';
  });
  const [showStoragePage, setShowStoragePage] = useState(() => {
    if (typeof window === 'undefined') return false;
    const params = new URLSearchParams(window.location.search);
    const view = params.get('view') || params.get('preview') || '';
    return view === 'storage' || window.location.hash === '#storage';
  });
  const [showNotificationStudio, setShowNotificationStudio] = useState(() => {
    if (typeof window === 'undefined') return false;
    const params = new URLSearchParams(window.location.search);
    const view = params.get('view') || params.get('preview') || '';
    return view === 'notifications' || view === 'notification-studio' || window.location.hash === '#notifications' || window.location.hash === '#notification-studio';
  });
  const [pendingDeletion, setPendingDeletion] = useState(() => getPendingDeletionStatus());
  const [showNotFound, setShowNotFound] = useState(() => {
    if (typeof window === 'undefined') return false;
    const path = window.location.pathname;
    const isInvalidPath = path !== '/' && path !== '' && !path.endsWith('/index.html');
    return isInvalidPath || window.location.search.includes('view=404') || window.location.hash.includes('404');
  });

  // ⚡ INSTANT FRAME-0 STATE INITIALIZATION (Sub-1ms Synchronous Cache Hydration)
  const [currentUser, setCurrentUser] = useState(() => getCurrentUser());
  const [startDate, setStartDate] = useState(() => {
    try {
      const u = getCurrentUser();
      const storageKey = getDbStorageKey(u);
      const cached = localStorage.getItem(storageKey) || localStorage.getItem('goodness_db');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.startDate) return parsed.startDate;
      }
    } catch (e) { }
    return new Date().toISOString().slice(0, 10);
  });
  const [entries, setEntries] = useState(() => {
    try {
      const u = getCurrentUser();
      const storageKey = getDbStorageKey(u);
      const cached = localStorage.getItem(storageKey) || localStorage.getItem('goodness_db');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.entries && typeof parsed.entries === 'object') return parsed.entries;
      }
    } catch (e) { }
    return {};
  });

  const previewModal = (() => {
    if (typeof window === 'undefined') return '';
    const params = new URLSearchParams(window.location.search);
    return params.get('preview') || params.get('view') || '';
  })();

  const [isCalendarOpen, setIsCalendarOpen] = useState(() => previewModal === 'calendar');
  const [isMonthlyReportOpen, setIsMonthlyReportOpen] = useState(false);
  const [isWallpaperModalOpen, setIsWallpaperModalOpen] = useState(false);
  const [isTelemetryOpen, setIsTelemetryOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(() => previewModal === 'settings');
  const [isStickerVaultOpen, setIsStickerVaultOpen] = useState(() => previewModal === 'stickers');
  const [isExportStudioOpen, setIsExportStudioOpen] = useState(() => previewModal === 'export');
  const [isRehabModalOpen, setIsRehabModalOpen] = useState(false);
  const [isArchitectureProjectionOpen, setIsArchitectureProjectionOpen] = useState(false);
  const [isAcademicMode, setIsAcademicMode] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('daily_verdict_academic_mode') === 'true' || window.location.search.includes('mode=academic');
  });

  const toggleAcademicMode = useCallback(() => {
    setIsAcademicMode(prev => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        localStorage.setItem('daily_verdict_academic_mode', next ? 'true' : 'false');
      }
      try {
        if (next) soundEngine.playSuccessChime();
        else soundEngine.playClick();
      } catch (e) {}
      return next;
    });
  }, []);

  useEffect(() => {
    const handleGlobalHotkeys = (e) => {
      // Ctrl + Shift + P: Academic Presentation Mode Toggle
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'P' || e.key === 'p')) {
        e.preventDefault();
        toggleAcademicMode();
      }
      // Ctrl + Shift + A: Architecture Blueprint Projection Modal
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        setIsArchitectureProjectionOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalHotkeys);
    return () => window.removeEventListener('keydown', handleGlobalHotkeys);
  }, [toggleAcademicMode]);

  const [wallpaperTarget, setWallpaperTarget] = useState(null);
  const [reportTargetMonth, setReportTargetMonth] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1
  });
  const [editingDay, setEditingDay] = useState(null); // { dateStr, dayIndex, entry }
  const [sphereSettingsVer, setSphereSettingsVer] = useState(0);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [activeDesktopTab, setActiveDesktopTab] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('daily_verdict_desktop_active_tab') || 'today';
    }
    return 'today';
  });
  const [isVaultLocked, setIsVaultLocked] = useState(() => isVaultPinActive());
  const [isMotivationalOpen, setIsMotivationalOpen] = useState(false);
  const [notificationVerdictFeedback, setNotificationVerdictFeedback] = useState(null);

  const triggerNotificationFeedback = useCallback((rating, source = 'System Notification') => {
    const meta = {
      1: { label: isAcademicMode ? '1★ DYSREGULATED' : '1★ ROUGH (SHIT)', color: '#FF4D4D' },
      2: { label: isAcademicMode ? '2★ OVERWHELMED' : '2★ DOWN', color: '#FF9500' },
      3: { label: isAcademicMode ? '3★ EQUILIBRIUM' : '3★ OKAY', color: '#FDC800' },
      4: { label: isAcademicMode ? '4★ PROGRESSION' : '4★ GOOD', color: '#00D4FF' },
      5: { label: isAcademicMode ? '5★ PEAK FLOW' : '5★ PEAK (HIT)', color: '#00E599' }
    }[rating] || { label: `${rating}★`, color: '#FDC800' };

    setNotificationVerdictFeedback({ rating, label: meta.label, color: meta.color, source });
    try {
      playMood(rating);
      soundEngine.playSuccess();
    } catch (e) {
      console.warn('Audio feedback error:', e);
    }
    setTimeout(() => setNotificationVerdictFeedback(null), 5500);
  }, []);

  // ⏱️ Guest Disclaimer evaluates with a 3-second grace buffer to allow Firebase Auth to initialize
  const [isGuestDisclaimerOpen, setIsGuestDisclaimerOpen] = useState(() => previewModal === 'disclaimer' || previewModal === 'guest');

  useEffect(() => {
    if (previewModal === 'disclaimer' || previewModal === 'guest') return;
    const timer = setTimeout(() => {
      const u = getCurrentUser();
      if (!u && !isGuestDisclaimerDismissed()) {
        setIsGuestDisclaimerOpen(true);
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, [previewModal]);

  // Behavioral Trilogy Modal States & Dev Lab
  const [isCapsuleModalOpen, setIsCapsuleModalOpen] = useState(() => previewModal === 'capsule');
  const [capsuleModalMode, setCapsuleModalMode] = useState('vault'); // 'vault' | 'capture' | 'release'
  const [capsuleTarget, setCapsuleTarget] = useState(null);
  const isCapsuleReleaseOpen = isCapsuleModalOpen;
  const releasedCapsule = capsuleTarget;
  const setIsCapsuleReleaseOpen = setIsCapsuleModalOpen;
  const setReleasedCapsule = setCapsuleTarget;

  const [isGlobalReceiptOpen, setIsGlobalReceiptOpen] = useState(() => previewModal === 'receipt');
  const [receiptPreviewEntries, setReceiptPreviewEntries] = useState(null);
  const [isAutopsyOpen, setIsAutopsyOpen] = useState(() => previewModal === 'autopsy');
  const [autopsyDate, setAutopsyDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [autopsyRating, setAutopsyRating] = useState(1);
  const [autopsyExistingData, setAutopsyExistingData] = useState(null);
  const [isBehavioralLabOpen, setIsBehavioralLabOpen] = useState(() => previewModal === 'lab');
  const [simulatedCrash, setSimulatedCrash] = useState(false);
  const [isP2PSyncOpen, setIsP2PSyncOpen] = useState(() => previewModal === 'sync' || previewModal === 'transfer' || previewModal === 'data-transfer');
  const [p2pSyncSection, setP2PSyncSection] = useState(() => (previewModal === 'transfer' || previewModal === 'data-transfer') ? 'transfer' : 'sync');
  const [isSanctuaryInvitationOpen, setIsSanctuaryInvitationOpen] = useState(() => previewModal === 'sanctuary-invitation' || previewModal === 'invitation');
  const [sanctuaryInvitationRoughCount, setSanctuaryInvitationRoughCount] = useState(2);
  const [showSovereignBanner, setShowSovereignBanner] = useState(() => {
    if (typeof window === 'undefined') return false;
    const params = new URLSearchParams(window.location.search);
    const v = params.get('view') || params.get('preview') || '';
    return v === 'banner' || v === 'guest-banner' || v === 'sovereign-banner';
  });

  // 🔐 Configurable Auto-Lock Gatekeeper (Default 5 min inactivity + Tab Blur/Visibility)
  useEffect(() => {
    let inactivityTimer = null;

    const resetInactivityTimer = () => {
      if (inactivityTimer) clearTimeout(inactivityTimer);
      if (!isVaultPinActive()) return;

      // Import timeout minutes from localStorage
      const savedMinutes = parseInt(localStorage.getItem('daily_verdict_vault_auto_lock_minutes') ?? '5', 10);
      if (savedMinutes === -1) return; // 'Off'

      const ms = savedMinutes === 0 ? 30000 : savedMinutes * 60 * 1000;
      inactivityTimer = setTimeout(() => {
        if (isVaultPinActive()) {
          setIsVaultLocked(true);
        }
      }, ms);
    };

    const handleBlurOrVisibility = () => {
      if (!isVaultPinActive()) return;
      const savedMinutes = parseInt(localStorage.getItem('daily_verdict_vault_auto_lock_minutes') ?? '5', 10);
      if (savedMinutes === -1) return; // 'Off'

      // Instant lock on blur if configured as Instant (0 mins) or if tab switched
      if (savedMinutes === 0 || document.hidden) {
        setIsVaultLocked(true);
      }
    };

    const handlePinUpdated = () => {
      if (isVaultPinActive()) {
        setIsVaultLocked(true);
      }
    };

    // User interaction events to keep active session alive
    const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    activityEvents.forEach(evt => window.addEventListener(evt, resetInactivityTimer, { passive: true }));
    window.addEventListener('blur', handleBlurOrVisibility);
    document.addEventListener('visibilitychange', handleBlurOrVisibility);
    window.addEventListener('vault-pin-updated', handlePinUpdated);
    window.addEventListener('vault-autolock-updated', resetInactivityTimer);

    resetInactivityTimer();

    return () => {
      if (inactivityTimer) clearTimeout(inactivityTimer);
      activityEvents.forEach(evt => window.removeEventListener(evt, resetInactivityTimer));
      window.removeEventListener('blur', handleBlurOrVisibility);
      document.removeEventListener('visibilitychange', handleBlurOrVisibility);
      window.removeEventListener('vault-pin-updated', handlePinUpdated);
      window.removeEventListener('vault-autolock-updated', resetInactivityTimer);
    };
  }, []);

  // Secret developer key sequence listener (type "lab", "iconlab", "skeleton", "recovery" anywhere)
  useEffect(() => {
    // Expose global developer testing helpers in console
    window.__openBehavioralLab = () => setIsBehavioralLabOpen(true);
    window.__openReceiptOfTruth = () => setIsGlobalReceiptOpen(true);
    window.__openTimeCapsule = () => {
      setCapsuleModalMode('vault');
      setIsCapsuleModalOpen(true);
    };
    window.__openAutopsyChamber = () => setIsAutopsyOpen(true);
    window.__simulateCrash = () => setSimulatedCrash(true);
    window.__testRecoveryModal = () => setIsMotivationalOpen(true);
    window.__testGuestDisclaimer = () => setIsGuestDisclaimerOpen(true);
    window.__openP2PSync = (section = 'sync') => {
      setP2PSyncSection(section);
      setIsP2PSyncOpen(true);
    };

    let keyBuffer = '';
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

      keyBuffer = (keyBuffer + e.key.toLowerCase()).slice(-12);
      if (keyBuffer.endsWith('iconlab')) {
        setShowIconLab(prev => !prev);
        keyBuffer = '';
      } else if (keyBuffer.endsWith('verdict')) {
        setShowIconLab(prev => !prev);
        setIconLabTab('verdict_strip');
        keyBuffer = '';
      } else if (keyBuffer.endsWith('skeleton')) {
        setShowSkeletonPreview(prev => !prev);
        keyBuffer = '';
      } else if (keyBuffer.endsWith('recovery')) {
        setIsMotivationalOpen(prev => !prev);
        keyBuffer = '';
      } else if (keyBuffer.endsWith('disclaimer') || keyBuffer.endsWith('guest')) {
        setIsGuestDisclaimerOpen(prev => !prev);
        keyBuffer = '';
      } else if (keyBuffer.endsWith('sync') || keyBuffer.endsWith('beam') || keyBuffer.endsWith('p2p')) {
        setIsP2PSyncOpen(prev => !prev);
        keyBuffer = '';
      } else if (keyBuffer.endsWith('404')) {
        setShowNotFound(prev => !prev);
        keyBuffer = '';
      } else if (keyBuffer.endsWith('lab') || keyBuffer.endsWith('showcase') || keyBuffer.endsWith('trilogy')) {
        setIsBehavioralLabOpen(prev => !prev);
        keyBuffer = '';
      } else if (keyBuffer.endsWith('receipt')) {
        setIsGlobalReceiptOpen(prev => !prev);
        keyBuffer = '';
      } else if (keyBuffer.endsWith('capsule')) {
        setCapsuleModalMode('vault');
        setIsCapsuleModalOpen(prev => !prev);
        keyBuffer = '';
      } else if (keyBuffer.endsWith('autopsy')) {
        setIsAutopsyOpen(prev => !prev);
        keyBuffer = '';
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const checkHash = () => {
      const isLab = window.location.search.includes('view=icons') || 
                    window.location.hash.includes('icons') ||
                    window.location.search.includes('view=wallpaper') ||
                    window.location.hash.includes('wallpaper') ||
                    window.location.search.includes('view=pixels') ||
                    window.location.hash.includes('pixels') ||
                    window.location.search.includes('view=skeleton') ||
                    window.location.hash.includes('skeleton') ||
                    window.location.search.includes('view=verdict') ||
                    window.location.hash.includes('verdict') ||
                    window.location.search.includes('view=notification') ||
                    window.location.hash.includes('notification') ||
                    window.location.search.includes('view=lab');
      setShowIconLab(isLab);
      if (isLab) {
        const s = window.location.search;
        const h = window.location.hash;
        if (s.includes('view=skeleton') || h.includes('skeleton') || s.includes('tab=skeleton')) {
          setIconLabTab('skeleton');
        } else if (s.includes('view=verdict') || h.includes('verdict') || s.includes('tab=verdict') || s.includes('notification')) {
          setIconLabTab('verdict_strip');
        } else if (s.includes('view=wallpaper') || h.includes('wallpaper') || s.includes('view=pixels') || h.includes('pixels')) {
          setIconLabTab('year_pixels');
        } else if (s.includes('view=icons') || h.includes('icons')) {
          setIconLabTab('icons');
        } else {
          setIconLabTab('year_pixels');
        }
      }
      const params = new URLSearchParams(window.location.search);
      const v = params.get('view') || params.get('preview') || '';
      setShowSanctuary((v === 'sanctuary' || window.location.hash === '#sanctuary' || window.location.hash === '#/sanctuary') && v !== 'sanctuary-invitation' && v !== 'invitation');
      setShowPrivacy(v === 'privacy' || window.location.hash === '#privacy');
      setShowErasure(v === 'erasure' || window.location.hash === '#erasure');
      setShowStoragePage(v === 'storage' || window.location.hash === '#storage');
      setPendingDeletion(getPendingDeletionStatus());
      if (window.location.search.includes('view=recovery') || window.location.search.includes('test=recovery')) {
        setIsMotivationalOpen(true);
      }
      if (window.location.search.includes('view=guest') || window.location.search.includes('view=disclaimer') || window.location.search.includes('preview=disclaimer')) {
        setIsGuestDisclaimerOpen(true);
      }
      if (window.location.search.includes('view=banner') || window.location.search.includes('preview=banner') || window.location.search.includes('guest-banner')) {
        setShowSovereignBanner(true);
      }
      if (window.location.search.includes('view=sanctuary-invitation') || window.location.search.includes('preview=sanctuary-invitation') || window.location.search.includes('view=invitation') || window.location.search.includes('preview=invitation')) {
        setIsSanctuaryInvitationOpen(true);
      }
      if (window.location.search.includes('view=calendar') || window.location.search.includes('preview=calendar')) {
        setIsCalendarOpen(true);
      }
      if (window.location.search.includes('view=settings') || window.location.search.includes('preview=settings')) {
        setIsSettingsOpen(true);
      }
      if (window.location.search.includes('view=export') || window.location.search.includes('preview=export')) {
        setIsExportStudioOpen(true);
      }
      if (window.location.search.includes('view=stickers') || window.location.search.includes('preview=stickers')) {
        setIsStickerVaultOpen(true);
      }
      if (window.location.search.includes('sync=') || window.location.search.includes('view=sync') || window.location.search.includes('preview=sync') || window.location.hash.includes('sync')) {
        if (window.location.search.includes('sync=') || window.location.search.includes('view=transfer') || window.location.search.includes('preview=transfer') || window.location.search.includes('preview=data-transfer')) {
          setP2PSyncSection('transfer');
        }
        setIsP2PSyncOpen(true);
      }
      if (window.location.search.includes('view=lab') || window.location.search.includes('view=showcase') || window.location.hash.includes('lab')) {
        setIsBehavioralLabOpen(true);
      }
      if (window.location.search.includes('view=receipt') || window.location.hash.includes('receipt')) {
        setIsGlobalReceiptOpen(true);
      }
      if (window.location.search.includes('view=capsule') || window.location.hash.includes('capsule')) {
        setCapsuleModalMode('vault');
        setIsCapsuleModalOpen(true);
      }
      if (window.location.search.includes('view=autopsy') || window.location.hash.includes('autopsy')) {
        setIsAutopsyOpen(true);
      }
      const path = window.location.pathname;
      const isInvalidPath = path !== '/' && path !== '' && !path.endsWith('/index.html');
      setShowNotFound(isInvalidPath || window.location.search.includes('view=404') || window.location.hash.includes('404'));
    };
    checkHash();
    window.addEventListener('popstate', checkHash);
    window.addEventListener('hashchange', checkHash);
    return () => {
      window.removeEventListener('popstate', checkHash);
      window.removeEventListener('hashchange', checkHash);
    };
  }, []);

  // 🧘 Sanctuary Stasis Consent Engine: Prompt user with invitation dialog if eligible (NEVER auto-transfer silently)
  useEffect(() => {
    try {
      if (entries && Object.keys(entries).length > 0) {
        const invCheck = checkSanctuaryInvitationNeeded(entries);
        if (invCheck.needed) {
          setSanctuaryInvitationRoughCount(invCheck.roughCount || 2);
          setIsSanctuaryInvitationOpen(true);
        }
      }
    } catch (e) {
      console.warn('Sanctuary invitation check note:', e);
    }
  }, [entries]);

  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const todayStr = `${y}-${m}-${d}`;

  const loadData = useCallback(async (userOverride = null) => {
    try {
      syncStoragePersistenceWithPreference();
      const db = await fetchDatabase(userOverride);
      if (db.startDate) setStartDate(db.startDate);
      if (db.entries) {
        setEntries(db.entries);
        const streak = calculateStreak(db.entries);
        checkAndTriggerCapsules(db.entries, streak);
      }
    } catch (err) {
      console.error('Failed to load database in App:', err);
    } finally {
      setIsInitialLoading(false);
    }
  }, []);

  useEffect(() => {
    const handleDbRestoredOrReverted = () => {
      loadData();
    };
    window.addEventListener('goodness_db_restored', handleDbRestoredOrReverted);
    window.addEventListener('goodness_db_reverted', handleDbRestoredOrReverted);
    return () => {
      window.removeEventListener('goodness_db_restored', handleDbRestoredOrReverted);
      window.removeEventListener('goodness_db_reverted', handleDbRestoredOrReverted);
    };
  }, [loadData]);

  useEffect(() => {
    scheduleLocalEveningReminder();
    // ⚡ Instant local hydration: sync local storage/server immediately on mount
    loadData();

    const unsubscribe = subscribeAuthState(async (u) => {
      console.log('🛡️ [App Engine] Auth Hydration:', u ? `Logged in as ${u.displayName} (${u.email}) [UID: ${u.uid}]` : 'Local Mode');
      setCurrentUser(u);
      if (u) {
        const isPreviewingDisclaimer = typeof window !== 'undefined' && (() => {
          const params = new URLSearchParams(window.location.search);
          const val = params.get('view') || params.get('preview') || '';
          return val === 'disclaimer' || val === 'guest';
        })();
        if (!isPreviewingDisclaimer) {
          setIsGuestDisclaimerOpen(false);
        }
      }

      // Re-fetch database entries immediately for the active user
      loadData(u);

      if (u) {
        try {
          const effectiveId = getEffectiveUserId(u);
          const cloudSettings = await fetchCloudUserSettings(effectiveId);
          if (cloudSettings) {
            console.log('☁️ [Cloud Settings] Loaded preferences for user:', effectiveId);
            if (cloudSettings.spheresConfig && Array.isArray(cloudSettings.spheresConfig)) {
              localStorage.setItem('daily_verdict_spheres_config', JSON.stringify(cloudSettings.spheresConfig));
            }
            if (cloudSettings.sphereModeEnabled !== undefined) {
              localStorage.setItem('daily_verdict_sphere_mode_enabled', cloudSettings.sphereModeEnabled ? 'true' : 'false');
            }
            if (cloudSettings.enableRansomCapsule !== undefined) {
              localStorage.setItem('daily_verdict_ransom_capsule_enabled', cloudSettings.enableRansomCapsule ? 'true' : 'false');
            }
            if (cloudSettings.ransomCapsuleSensitivity !== undefined) {
              localStorage.setItem('daily_verdict_ransom_capsule_sensitivity', cloudSettings.ransomCapsuleSensitivity.toString());
            }
            if (cloudSettings.enableAutopsyChamber !== undefined) {
              localStorage.setItem('daily_verdict_autopsy_chamber_enabled', cloudSettings.enableAutopsyChamber ? 'true' : 'false');
            }
            if (cloudSettings.enableReceiptOfTruth !== undefined) {
              localStorage.setItem('daily_verdict_receipt_of_truth_enabled', cloudSettings.enableReceiptOfTruth ? 'true' : 'false');
              window.dispatchEvent(new Event('receipt-of-truth-updated'));
            }
            if (cloudSettings.vaultPinEncrypted) {
              const decrypted = await decryptVaultPin(cloudSettings.vaultPinEncrypted);
              if (decrypted) {
                const salt = Math.floor(100000 + Math.random() * 900000).toString();
                const hash = hashPinWithSalt(decrypted, salt);
                localStorage.setItem('daily_verdict_vault_pin_hash', `TRINNO_SALTED_HASH:${salt}:${hash}`);
                setIsVaultLocked(true);
              }
            } else if (cloudSettings.vaultSecurityActive === false) {
              localStorage.removeItem('daily_verdict_vault_pin_hash');
              localStorage.removeItem('daily_verdict_vault_pin_cipher');
              localStorage.removeItem('daily_verdict_vault_pin');
              setIsVaultLocked(false);
            }
            setSphereSettingsVer(v => v + 1);
          }
          // ☁️ Cross-Device Cloud Capsules Hydration & Decryption Engine
          await hydrateTimeCapsulesFromCloud(u);
        } catch (err) {
          console.warn('Cloud settings fetch error:', err);
        }
      }
    });
    return () => unsubscribe();
  }, [loadData]);

  // ⚡ Predictive Idle Chunk Preloader: Preload common modal JS chunks on idle so mobile taps open in 0ms
  useEffect(() => {
    const preloadCommonModals = () => {
      import('./components/EditDayModal');
      import('./components/CalendarModal');
      import('./components/SettingsModal');
      import('./components/ReceiptOfTruthModal');
      import('./components/RansomCapsuleModal');
      import('./components/AutopsyChamberModal');
      import('./components/ForensicStatsModal');
    };
    if (typeof window !== 'undefined') {
      if ('requestIdleCallback' in window) {
        window.requestIdleCallback(preloadCommonModals, { timeout: 2500 });
      } else {
        setTimeout(preloadCommonModals, 1000);
      }
    }
  }, []);

  const currentStreak = useMemo(() => calculateStreak(entries), [entries]);

  // ⏳ Check and trigger ready Time & Mood Capsules automatically
  const checkAndTriggerCapsules = useCallback((allEntries, streak = 0) => {
    if (!allEntries || Object.keys(allEntries).length === 0) return;
    try {
      const readyCapsules = checkCapsuleUnlockConditions(allEntries, streak);
      if (readyCapsules && readyCapsules.length > 0) {
        // Find first ready capsule not already popped or dismissed in this session
        const target = readyCapsules.find(c => {
          const key = `capsule_triggered_${c.id}_${todayStr}`;
          return !sessionStorage.getItem(key);
        });
        if (target) {
          sessionStorage.setItem(`capsule_triggered_${target.id}_${todayStr}`, 'true');
          setTimeout(() => {
            setCapsuleTarget(target);
            setCapsuleModalMode('release');
            setIsCapsuleModalOpen(true);
          }, 1500);
        }
      }
    } catch (e) {
      console.warn('Capsule trigger check warning:', e);
    }
  }, [todayStr]);

  const checkConsecutiveRoughDays = (allEntries) => {
    if (!allEntries) return;
    const todayRating = allEntries[todayStr]?.rating;

    // Calculate yesterday's date (local timezone safe)
    const yestObj = new Date(`${todayStr}T00:00:00`);
    yestObj.setDate(yestObj.getDate() - 1);
    const yestY = yestObj.getFullYear();
    const yestM = String(yestObj.getMonth() + 1).padStart(2, '0');
    const yestD = String(yestObj.getDate()).padStart(2, '0');
    const yestStr = `${yestY}-${yestM}-${yestD}`;
    const yestRating = allEntries[yestStr]?.rating;

    const alreadyShown = sessionStorage.getItem('daily_verdict_motivational_shown') === todayStr;
    if (!alreadyShown && todayRating && yestRating && Number(todayRating) <= 2 && Number(yestRating) <= 2) {
      sessionStorage.setItem('daily_verdict_motivational_shown', todayStr);
      setTimeout(() => {
        setIsMotivationalOpen(true);
      }, 5000);
    }
  };

  const handleCapsuleDismissed = () => {
    if (capsuleTarget?.id) {
      sessionStorage.setItem(`capsule_triggered_${capsuleTarget.id}_${todayStr}`, 'true');
    }
    setIsCapsuleModalOpen(false);
    setCapsuleTarget(null);
    setCapsuleModalMode('vault');
  };

  // 🧪 Behavioral Lab State Launchers
  const handleOpenReceiptFromLab = useCallback((variant) => {
    soundEngine.playClick();
    const currYear = new Date().getFullYear();
    const currMonth = String(new Date().getMonth() + 1).padStart(2, '0');
    
    if (variant === 'solvent') {
      const mockSolvent = {};
      for (let i = 1; i <= 25; i++) {
        const dStr = `${currYear}-${currMonth}-${String(i).padStart(2, '0')}`;
        const isGod = i % 4 === 0;
        mockSolvent[dStr] = {
          date: dStr,
          rating: isGod ? 5 : 4,
          dayRating: isGod ? 5 : 4,
          notes: isGod ? '⚡ Complete God-mode execution. Deep flow state unlocked.' : 'Disciplined execution across all daily non-negotiables.',
          anchors: { 'Morning Workout': true, 'Deep Work Session': true, 'Read 20 Pages': true },
          spheres: { discipline: 5, health: 4, career: 5 }
        };
      }
      setReceiptPreviewEntries(mockSolvent);
    } else if (variant === 'debt') {
      const mockDebt = {};
      for (let i = 1; i <= 25; i++) {
        const dStr = `${currYear}-${currMonth}-${String(i).padStart(2, '0')}`;
        const isTrench = i % 2 === 0;
        mockDebt[dStr] = {
          date: dStr,
          rating: isTrench ? 1 : 2,
          dayRating: isTrench ? 1 : 2,
          notes: isTrench ? 'Heavy friction day, distraction loops and missed anchors.' : 'Felt behind and struggled with focus.',
          anchors: { 'Morning Workout': false, 'Deep Work Session': false, 'Read 20 Pages': false },
          spheres: { discipline: 1, health: 2, career: 2 }
        };
      }
      setReceiptPreviewEntries(mockDebt);
    } else {
      setReceiptPreviewEntries(null);
    }
    setIsBehavioralLabOpen(false);
    setIsGlobalReceiptOpen(true);
  }, []);

  const handleOpenCapsuleFromLab = useCallback((mode) => {
    soundEngine.playClick();
    setIsBehavioralLabOpen(false);
    if (mode === 'release') {
      const mockReleaseCapsule = {
        id: 'capsule_showcase_demo',
        title: 'To Future Ashish — Read When You Stumble',
        createdAt: '2026-03-14T09:00:00.000Z',
        createdDate: '2026-03-14',
        status: 'unlocked',
        triggerType: 'slump',
        sealStyle: 'wax',
        category: 'motivation',
        streakAtCapture: 14,
        cipher: 'TRINNO_CAPSULE_MOCK',
        decryptedMessage: "Homie, if you are reading this, you are probably doubting the grind. Remember the late nights in early 2026 when you rebuilt this entire system from scratch? You didn't come this far just to fold over a bad week. Stand up, close the browser, do 20 pushups, and reclaim tomorrow's verdict."
      };
      setCapsuleTarget(mockReleaseCapsule);
      setCapsuleModalMode('release');
    } else {
      setCapsuleTarget(null);
      setCapsuleModalMode(mode === 'create' ? 'capture' : 'vault');
    }
    setIsCapsuleModalOpen(true);
  }, []);

  const handleOpenAutopsyFromLab = useCallback((mode) => {
    soundEngine.playClick();
    setIsBehavioralLabOpen(false);
    setAutopsyDate(todayStr);
    setAutopsyRating(1);
    if (mode === 'verdict') {
      setAutopsyExistingData({
        causeOfDeath: 'Acute Executive Breakdown: Frictionless distraction loops severed morning momentum and derailed habit anchors.',
        severity: 'CRITICAL',
        primaryDeficit: 'Sleep & Discipline Momentum',
        questions: [
          { id: 'q1', question: 'What triggered the primary breakdown of momentum?' },
          { id: 'q2', question: 'Which anchor collapsed under evening fatigue?' },
          { id: 'q3', question: 'What is the immediate root cause of the friction?' }
        ],
        userAnswers: {
          q1: 'Doomscrolling until 2 AM without sleep curfew',
          q2: 'Skipped morning workout and felt behind all day',
          q3: 'Low physical energy, dopamine distraction loops'
        },
        antidote: [
          'Lock phone in physical drawer at 10:30 PM tonight with zero exceptions.',
          'Complete mandatory 15-minute morning mobility anchor before touching any screen.',
          'Score minimum 3-stars tomorrow to sever the consecutive rough day chain.'
        ],
        recoveryAntidote: [
          'Lock phone in physical drawer at 10:30 PM tonight with zero exceptions.',
          'Complete mandatory 15-minute morning mobility anchor before touching any screen.',
          'Score minimum 3-stars tomorrow to sever the consecutive rough day chain.'
        ]
      });
    } else {
      setAutopsyExistingData(null);
    }
    setIsAutopsyOpen(true);
  }, [todayStr]);

  const handleTriggerErrorTest = useCallback(() => {
    soundEngine.playRoughTone();
    setIsBehavioralLabOpen(false);
    setSimulatedCrash(true);
  }, []);

  const handleGuestLogin = async () => {
    try {
      const userObj = await loginWithGoogle();
      if (userObj) {
        setIsGuestDisclaimerOpen(false);
        loadData(userObj);
      }
      return userObj;
    } catch (err) {
      console.error('Failed to log in from guest disclaimer:', err);
      throw err;
    }
  };

  const handleSaveEntry = async (entryData) => {
    const formatted = {
      ...entryData,
      rating: Number(entryData.rating),
      verdict: entryData.verdict || ratingMeta[entryData.rating]?.title || 'Verdict',
      notes: normalizeNotesString(entryData.notes),
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
        const u = getCurrentUser();
        const storageKey = getDbStorageKey(u);
        const cached = JSON.parse(localStorage.getItem(storageKey) || localStorage.getItem('goodness_db') || '{}');
        const updatedPayload = JSON.stringify({
          ...cached,
          entries: next
        });
        localStorage.setItem(storageKey, updatedPayload);
        localStorage.setItem('goodness_db', updatedPayload);
      } catch (e) { }

      // Check consecutive rough days & time capsule auto-triggers
      checkConsecutiveRoughDays(next);
      const s = calculateStreak(next);
      checkAndTriggerCapsules(next, s);

      return next;
    });

    // 2. Safe background network sync
    try {
      await saveEntry(formatted);
    } catch (err) {
      console.warn('Network sync pending, saved to local cache:', err);
    }
  };

  // ⚡ Remote 1-Tap Notification Bar Verdict Listener (Zero App Opening Sync)
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      const handleRemoteRating = (event) => {
        if (!event.data) return;
        if (event.data.type === 'REMOTE_NOTIFICATION_RATING') {
          const { dateStr, rating, notes, spheres, nonNegotiables } = event.data;
          const targetDate = dateStr || todayStr;
          console.log(`🔔 [Remote Notification Rating] Saving: ${rating !== null ? rating + '★' : 'note-only'} for ${targetDate}`);
          const payload = { date: targetDate };
          if (rating !== null && rating !== undefined) payload.rating = rating;
          if (notes) payload.notes = notes;

          // Map spheres if passed as digit array or object
          if (spheres) {
            if (Array.isArray(spheres)) {
              let sphereList = [
                { id: 'work_school' },
                { id: 'home_personal' },
                { id: 'social_event' }
              ];
              try {
                const saved = localStorage.getItem('daily_verdict_spheres_config');
                if (saved) {
                  const parsed = JSON.parse(saved);
                  if (Array.isArray(parsed) && parsed.length > 0) {
                    sphereList = parsed.filter(s => s && s.enabled !== false);
                  }
                }
              } catch (e) {}
              const mapped = {};
              spheres.forEach((val, idx) => {
                const sObj = sphereList[idx] || { id: `sphere_${idx + 1}` };
                mapped[sObj.id] = { rating: Number(val), notes: '' };
              });
              payload.spheres = mapped;
            } else if (typeof spheres === 'object') {
              payload.spheres = spheres;
            }
          }

          // Map non-negotiables if passed
          if (nonNegotiables) {
            let checkedState = nonNegotiables.checkedState;
            if (!checkedState && Array.isArray(nonNegotiables.checked)) {
              let anchorList = [
                { id: 'anchor_1' },
                { id: 'anchor_2' },
                { id: 'anchor_3' }
              ];
              try {
                const saved = localStorage.getItem('daily_verdict_custom_anchor_templates');
                if (saved) {
                  const parsed = JSON.parse(saved);
                  if (Array.isArray(parsed) && parsed.length > 0) anchorList = parsed;
                }
              } catch (e) {}
              checkedState = {};
              nonNegotiables.checked.forEach((isDone, idx) => {
                const aObj = anchorList[idx] || { id: `anchor_${idx + 1}` };
                checkedState[aObj.id] = Boolean(isDone);
              });
            }
            if (checkedState) {
              try {
                localStorage.setItem(`daily_verdict_anchors_${targetDate}`, JSON.stringify(checkedState));
                window.dispatchEvent(new CustomEvent('daily_anchors_updated', { detail: { date: targetDate, checked: checkedState } }));
              } catch (e) {}
            }
          }

          handleSaveEntry(payload);
          setActiveDesktopTab('today');
          triggerNotificationFeedback(rating || 5, notes ? '1-Tap Notification & Note' : '1-Tap Notification');
        } else if (event.data.type === 'NOTIFICATION_OPEN_URL') {
          console.log('🔔 [Notification Open URL] Focusing Today workspace');
          setActiveDesktopTab('today');
        }
      };
      navigator.serviceWorker.addEventListener('message', handleRemoteRating);
      return () => navigator.serviceWorker.removeEventListener('message', handleRemoteRating);
    }
  }, [todayStr, triggerNotificationFeedback]);

  // ⚡ In-App Simulator Listener for NotificationSetterCard & NotificationStudioPage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleSimulatedRating = (event) => {
      if (event.detail) {
        const payload = { date: todayStr };
        if (event.detail.rating) payload.rating = Number(event.detail.rating);
        if (event.detail.notes) payload.notes = event.detail.notes;
        if (event.detail.spheres) payload.spheres = event.detail.spheres;
        if (event.detail.nonNegotiables && event.detail.nonNegotiables.checkedState) {
          try {
            localStorage.setItem(`daily_verdict_anchors_${todayStr}`, JSON.stringify(event.detail.nonNegotiables.checkedState));
            window.dispatchEvent(new CustomEvent('daily_anchors_updated', { detail: { date: todayStr, checked: event.detail.nonNegotiables.checkedState } }));
          } catch (e) {}
        }
        console.log(`⚡ [Simulated Notification] Saving for ${todayStr}:`, payload);
        handleSaveEntry(payload);
        setActiveDesktopTab('today');
        triggerNotificationFeedback(payload.rating || 5, payload.notes ? 'Notification Simulator & Note' : 'Notification Simulator');
      }
    };
    window.addEventListener('remote_notification_verdict', handleSimulatedRating);
    return () => window.removeEventListener('remote_notification_verdict', handleSimulatedRating);
  }, [todayStr, triggerNotificationFeedback]);

  // ⚡ URL Query Parameter 1-Tap Notification Quick-Rate Receiver
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const params = new URLSearchParams(window.location.search);
      const qRate = params.get('quickRate') || params.get('rate');
      const qNotes = params.get('notes');
      const qDate = params.get('date');
      const qSpheres = params.get('spheres');
      const qAnchors = params.get('anchors');

      if (qRate || qNotes || qSpheres || qAnchors) {
        const targetDate = qDate || todayStr;
        const payload = { date: targetDate };
        if (qRate) {
          const ratingNum = parseInt(qRate, 10);
          if (ratingNum >= 1 && ratingNum <= 5) {
            payload.rating = ratingNum;
          }
        }
        if (qNotes) {
          payload.notes = decodeURIComponent(qNotes);
        }
        if (qSpheres) {
          try {
            const parsed = JSON.parse(decodeURIComponent(qSpheres));
            if (Array.isArray(parsed)) {
              let sphereList = [
                { id: 'work_school' },
                { id: 'home_personal' },
                { id: 'social_event' }
              ];
              const mapped = {};
              parsed.forEach((val, idx) => {
                const sObj = sphereList[idx] || { id: `sphere_${idx + 1}` };
                mapped[sObj.id] = { rating: Number(val), notes: '' };
              });
              payload.spheres = mapped;
            } else if (typeof parsed === 'object') {
              payload.spheres = parsed;
            }
          } catch (e) {}
        }
        if (qAnchors) {
          try {
            const parsed = JSON.parse(decodeURIComponent(qAnchors));
            const checked = parsed.checkedState || (parsed.checked ? parsed.checked.reduce((acc, curr, idx) => ({ ...acc, [`anchor_${idx + 1}`]: curr }), {}) : null);
            if (checked) {
              localStorage.setItem(`daily_verdict_anchors_${targetDate}`, JSON.stringify(checked));
              window.dispatchEvent(new CustomEvent('daily_anchors_updated', { detail: { date: targetDate, checked } }));
            }
          } catch (e) {}
        }

        console.log(`⚡ [URL Quick Rate] Recording for ${targetDate}:`, payload);
        handleSaveEntry(payload);
        setActiveDesktopTab('today');
        triggerNotificationFeedback(payload.rating || 5, '1-Tap Notification Link');
        // Clean URL so refresh doesn't re-trigger
        const url = new URL(window.location.href);
        url.searchParams.delete('quickRate');
        url.searchParams.delete('rate');
        url.searchParams.delete('notes');
        url.searchParams.delete('date');
        url.searchParams.delete('spheres');
        url.searchParams.delete('anchors');
        window.history.replaceState({}, '', url.toString());
      }
    } catch (e) {
      console.warn('URL quick rate parse error:', e);
    }
  }, [todayStr, triggerNotificationFeedback]);

  const handleOpenMonthlyReport = (target) => {
    startTransition(() => {
      if (target) {
        setReportTargetMonth(target);
      } else {
        setReportTargetMonth({
          year: new Date().getFullYear(),
          month: new Date().getMonth() + 1
        });
      }
      setIsMonthlyReportOpen(true);
    });
  };

  const handleOpenWallpaper = (entry = null, date = null) => {
    startTransition(() => {
      setWallpaperTarget({
        entry: entry || entries[date || todayStr] || null,
        dateStr: date || todayStr
      });
      setIsWallpaperModalOpen(true);
    });
  };

  const safeStartDate = startDate || todayStr;
  const startObj = new Date(`${safeStartDate}T00:00:00`);
  const todayObj = new Date(`${todayStr}T00:00:00`);
  const diffDays = Math.floor((todayObj - startObj) / (1000 * 60 * 60 * 24));
  const dayCount = Math.max(1, isNaN(diffDays) ? 1 : diffDays + 1);
  const userDisplayName = currentUser ? getUserDisplayName(currentUser.email, currentUser.displayName) : 'Daily Operator';

  if (showIconLab) {
    return (
      <ErrorBoundary>
        <Suspense fallback={<div className="min-h-screen bg-[#FFFDF5] flex items-center justify-center font-mono text-sm font-black">LOADING ICON STUDIO...</div>}>
          <IconLab
            defaultTab={iconLabTab}
            entries={entries}
            onBack={() => {
              setShowIconLab(false);
              window.history.replaceState(null, '', window.location.pathname);
            }}
          />
        </Suspense>
      </ErrorBoundary>
    );
  }

  if (showSkeletonPreview) {
    return (
      <div className="relative">
        <div className="fixed top-3 right-4 z-50 flex items-center gap-2 bg-black text-white px-3.5 py-2 rounded-2xl border-2 border-white shadow-[4px_4px_0px_#000000]">
          <Layers className="w-4 h-4 text-[#FDC800]" />
          <span className="font-mono text-xs font-bold text-[#FDC800]">SKELETON PREVIEW ACTIVE</span>
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
        <SkeletonLoader
          isMobile={isMobile}
          tab={
            isMobile
              ? (typeof window !== 'undefined' ? (localStorage.getItem('daily_verdict_mobile_active_tab') || 'log') : 'log')
              : activeDesktopTab
          }
        />
      </div>
    );
  }

  if (showNotFound) {
    return (
      <ErrorBoundary>
        <Suspense fallback={<SkeletonLoader isMobile={isMobile} />}>
          <NotFound404
            onGoHome={() => {
              window.history.replaceState(null, '', '/');
              setShowNotFound(false);
              startTransition(() => {
                setActiveDesktopTab('today');
              });
            }}
            onGoTimeline={() => {
              window.history.replaceState(null, '', '/');
              setShowNotFound(false);
              startTransition(() => {
                setActiveDesktopTab('timeline');
              });
            }}
          />
        </Suspense>
      </ErrorBoundary>
    );
  }

  if (showSanctuary) {
    return (
      <ErrorBoundary>
        <Suspense fallback={<div className="min-h-screen bg-[#F4FAF6] flex items-center justify-center font-mono text-sm font-black">ENTERING REHABILITATION SANCTUARY...</div>}>
          <SanctuaryPage
            onBack={() => {
              setShowSanctuary(false);
              window.history.replaceState(null, '', window.location.pathname);
            }}
            isDemo={window.location.search.includes('demo=true')}
            activeStreak={currentStreak}
          />
        </Suspense>
      </ErrorBoundary>
    );
  }

  if (showPrivacy) {
    return (
      <ErrorBoundary>
        <Suspense fallback={<div className="min-h-screen bg-[#FFFDF8] flex items-center justify-center font-mono text-sm font-black">LOADING PRIVACY CHARTER...</div>}>
          <PrivacyPolicyPage
            onBack={() => {
              setShowPrivacy(false);
              window.history.replaceState(null, '', window.location.pathname);
            }}
          />
        </Suspense>
      </ErrorBoundary>
    );
  }

  if (showErasure) {
    return (
      <ErrorBoundary>
        <Suspense fallback={<div className="min-h-screen bg-[#FFFDF8] flex items-center justify-center font-mono text-sm font-black">LOADING ERASURE PORTAL...</div>}>
          <DataErasurePage
            onBack={() => {
              setShowErasure(false);
              window.history.replaceState(null, '', window.location.pathname);
            }}
            isDemo={window.location.search.includes('demo=true')}
            entries={entries}
          />
        </Suspense>
      </ErrorBoundary>
    );
  }

  if (showStoragePage) {
    return (
      <ErrorBoundary>
        <Suspense fallback={<div className="min-h-screen bg-[#FFFDF8] flex items-center justify-center font-mono text-sm font-black">LOADING STORAGE SOVEREIGNTY PORTAL...</div>}>
          <StorageSovereigntyPage
            onBack={() => {
              setShowStoragePage(false);
              window.history.replaceState(null, '', window.location.pathname);
            }}
            user={currentUser}
            entries={entries}
            onDataRestored={(restoredEntries) => {
              setEntries(restoredEntries);
            }}
          />
        </Suspense>
      </ErrorBoundary>
    );
  }

  if (showNotificationStudio) {
    return (
      <ErrorBoundary>
        <Suspense fallback={<div className="min-h-screen bg-[#FFFDF8] flex items-center justify-center font-mono text-sm font-black">ENTERING NOTIFICATION STUDIO...</div>}>
          <NotificationStudioPage
            onBack={() => {
              setShowNotificationStudio(false);
              window.history.replaceState(null, '', window.location.pathname);
            }}
            entries={entries}
            todayStr={todayStr}
          />
        </Suspense>
      </ErrorBoundary>
    );
  }

  if (isInitialLoading) {
    const currentTab = isMobile
      ? (typeof window !== 'undefined' ? (localStorage.getItem('daily_verdict_mobile_active_tab') || 'log') : 'log')
      : activeDesktopTab;
    return <SkeletonLoader isMobile={isMobile} tab={currentTab} />;
  }

  const handleDesktopTabChange = (tabId) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('daily_verdict_desktop_active_tab', tabId);
    }
    startTransition(() => {
      setActiveDesktopTab(tabId);
    });
  };

  return (
    <div className="min-h-screen bg-[#FFFDF5] text-black font-sans selection:bg-[#FDC800] selection:text-black">

      {/* DPDPA 2023 7-Day Cooling-Off Erasure Banner */}
      {pendingDeletion?.pending && (
        <div className="bg-[#FF4D4D] border-b-3 border-black py-2.5 px-4 text-black font-mono font-black text-xs shadow-[0_2px_0px_#000000] sticky top-0 z-50">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-black shrink-0" />
              <span>ACCOUNT SCHEDULED FOR PURGE IN {pendingDeletion.daysRemaining} DAYS ({pendingDeletion.executeDateStr})</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  cancelAccountDeletion();
                  setPendingDeletion(getPendingDeletionStatus());
                }}
                className="px-3 py-1 bg-black text-[#00E599] rounded-lg border border-black hover:bg-neutral-800 cursor-pointer text-[11px]"
              >
                CANCEL ERASURE
              </button>
              <button
                type="button"
                onClick={() => setShowErasure(true)}
                className="px-3 py-1 bg-white text-black rounded-lg border border-black hover:bg-neutral-100 cursor-pointer text-[11px]"
              >
                VIEW PORTAL
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🔔 1-Tap Notification Verdict Tactile Confirmation Toast */}
      {notificationVerdictFeedback && (
        <aside 
          role="status"
          aria-live="polite"
          className="fixed top-4 left-1/2 -translate-x-1/2 z-90 w-[94%] max-w-lg p-3.5 sm:p-4 bg-black border-3 border-[#00E599] rounded-2xl shadow-[6px_6px_0px_#000000] text-white flex items-center justify-between gap-3 animate-fade-in"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div 
              className="w-10 h-10 rounded-xl border-2 border-black flex items-center justify-center font-display font-black text-black text-sm shrink-0 shadow-[2px_2px_0px_#FFF]"
              style={{ backgroundColor: notificationVerdictFeedback.color }}
            >
              <CheckCircle2 className="w-6 h-6 text-black stroke-[2.5]" />
            </div>
            <div className="min-w-0">
              <div className="font-mono font-black text-xs uppercase tracking-tight text-[#00E599] flex items-center gap-1.5">
                <span>VERDICT APPLIED VIA {notificationVerdictFeedback.source.toUpperCase()}</span>
              </div>
              <div className="font-mono text-xs text-white font-bold truncate mt-0.5">
                Today is locked as {notificationVerdictFeedback.label}. Local diary updated &amp; synced!
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setNotificationVerdictFeedback(null)}
            className="p-1.5 hover:bg-white/20 rounded-xl text-white/70 hover:text-white cursor-pointer shrink-0 transition-colors"
            aria-label="Close notification"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </aside>
      )}

      {/* 🛫 Verified Offline Airplane Shelter Status Badge */}
      <OfflineShelterBadge />

      {/* 📲 PWA 1-Tap Native Install Prompt Banner */}
      <PWAInstallBanner />

      {isMobile ? (
        <FaultBoundary
          name="MobileAppView"
          variant="hero"
          todayStr={todayStr}
          onEmergencySave={handleSaveEntry}
        >
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
            onOpenNotificationStudio={() => setShowNotificationStudio(true)}
            onOpenStickerVault={() => setIsStickerVaultOpen(true)}
            onOpenExportStudio={() => setIsExportStudioOpen(true)}
            onOpenRehab={() => setShowSanctuary(true)}
            onOpenWallpaperEngine={() => handleOpenWallpaper(null, todayStr)}
            onOpenArchitectureProjection={() => setIsArchitectureProjectionOpen(true)}
            sphereSettingsVer={sphereSettingsVer}
          />
        </FaultBoundary>
      ) : (
        <div className="flex flex-col min-h-screen">
          <div className="border-b-3 border-black bg-white sticky top-0 z-30">
            <div className="w-full max-w-7xl 2xl:max-w-8xl 3xl:max-w-[1880px] 4k:max-w-[2400px] mx-auto px-4 sm:px-6 3xl:px-8 4k:px-12">
              <Header
                startDate={startDate}
                entries={entries}
                dayCount={dayCount}
                todayStr={todayStr}
                activeTab={activeDesktopTab}
                onTabChange={handleDesktopTabChange}
                onOpenSettings={() => setIsSettingsOpen(true)}
                onOpenReceipt={() => setIsGlobalReceiptOpen(true)}
                onOpenExportStudio={() => setIsExportStudioOpen(true)}
                onOpenRehab={() => setShowSanctuary(true)}
                onSyncRefresh={loadData}
              />
            </div>
          </div>

          <main className="flex-1 w-full max-w-7xl 2xl:max-w-8xl 3xl:max-w-[1880px] 4k:max-w-[2400px] mx-auto p-4 sm:p-6 3xl:p-8 4k:p-12 space-y-6 3xl:space-y-8">
            {/* 🛡️ Sovereign Guest Intelligence Banner (Cleanly seated beneath sticky Navigation Panel) */}
            {showSovereignBanner && (
              <Suspense fallback={null}>
                <SovereignGuestBanner
                  onOpenP2PSync={() => {
                    setP2PSyncSection('sync');
                    setIsP2PSyncOpen(true);
                  }}
                  onExportData={() => setIsExportStudioOpen(true)}
                  onOpenCloudAuth={handleGuestLogin}
                  onDismiss={() => setShowSovereignBanner(false)}
                />
              </Suspense>
            )}

            {/* VIEW 1: TODAY ACTIVE WORKSPACE & STATS */}
            {activeDesktopTab === 'today' && (
              <div className="space-y-6">
                <FaultBoundary
                  name="TodayHero"
                  variant="hero"
                  todayStr={todayStr}
                  onEmergencySave={handleSaveEntry}
                >
                  <TodayHero
                    todayStr={todayStr}
                    dayCount={dayCount}
                    todayEntry={entries[todayStr] || null}
                    currentEntry={entries[todayStr] || null}
                    onSaveToday={handleSaveEntry}
                    onSave={handleSaveEntry}
                    onOpenWallpaper={() => handleOpenWallpaper(null, todayStr)}
                    onOpenRehab={() => setShowSanctuary(true)}
                    sphereSettingsVer={sphereSettingsVer}
                  />
                </FaultBoundary>

                {/* Full Width Lifetime Metrics Widget */}
                <div className="w-full">
                  <FaultBoundary name="StatsWidget" variant="widget">
                    <StatsWidget
                      entries={entries}
                      dayCount={dayCount}
                      onOpenTelemetry={() => setIsTelemetryOpen(true)}
                    />
                  </FaultBoundary>
                </div>
              </div>
            )}

            {/* VIEW 2: CALENDAR MATRIX & JOURNEY TIMELINE */}
            {activeDesktopTab === 'timeline' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-7">
                  <FaultBoundary name="CalendarModal" variant="view">
                    <Suspense fallback={<div className="min-h-400px flex items-center justify-center font-mono text-sm font-black">LOADING CALENDAR MATRIX...</div>}>
                      <CalendarModal
                        isOpen={true}
                        isEmbedded={true}
                        entries={entries}
                        startDate={startDate}
                        todayStr={todayStr}
                        onEditDay={(dayInfo) => setEditingDay(dayInfo)}
                        onOpenMonthlyReport={handleOpenMonthlyReport}
                      />
                    </Suspense>
                  </FaultBoundary>
                </div>

                <div className="lg:col-span-5 space-y-6">
                  <FaultBoundary name="JourneyTimeline" variant="view">
                    <JourneyTimeline
                      startDate={startDate}
                      entries={entries}
                      todayStr={todayStr}
                      onEditDay={(dayInfo) => setEditingDay(dayInfo)}
                      onOpenWallpaper={(entry, date) => handleOpenWallpaper(entry, date)}
                    />
                  </FaultBoundary>
                </div>
              </div>
            )}

            {/* VIEW 3: FULL IN-PAGE MONTHLY DOSSIER */}
            {activeDesktopTab === 'dossier' && (
              <div className="w-full">
                <Suspense fallback={<div className="min-h-400px flex items-center justify-center font-mono text-sm font-black">LOADING MONTHLY DOSSIER...</div>}>
                  <MonthlyReportModal
                    isOpen={true}
                    isEmbedded={true}
                    initialYear={reportTargetMonth.year}
                    initialMonth={reportTargetMonth.month}
                  />
                </Suspense>
              </div>
            )}

            {/* VIEW 4: FULL IN-PAGE CREATIVE STUDIO */}
            {activeDesktopTab === 'studio' && (
              <div className="w-full">
                <Suspense fallback={<div className="min-h-400px flex items-center justify-center font-mono text-sm font-black">LOADING STUDIO...</div>}>
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
                </Suspense>
              </div>
            )}
          </main>

          <footer className="w-full max-w-7xl 2xl:max-w-8xl 3xl:max-w-[1880px] 4k:max-w-[2400px] mx-auto text-center text-xs 3xl:text-sm font-mono font-bold text-neutral-600 py-10 3xl:py-14 px-6 3xl:px-8 border-t-2 border-black/10 mt-14 mb-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <span className="px-3 py-1 bg-black text-[#FDC800] rounded-lg text-[11px] font-black uppercase shadow-[2px_2px_0px_#000000]">
              DAILY QUALITY
            </span>
            <span className="text-neutral-700 font-bold">
              All data persisted locally into <code className="text-black bg-[#FDC800] px-2 py-0.5 rounded-md border border-black font-black">data/entries.json</code>
            </span>
          </footer>
        </div>
      )}

      {/* Shared Modals with Suspense Code Splitting */}
      <ErrorBoundary>
        <Suspense fallback={null}>
          <AnimatePresence>
            {isCalendarOpen && (
              <CalendarModal
                key="calendar-modal"
                isOpen={true}
                onClose={() => setIsCalendarOpen(false)}
                entries={entries}
                startDate={startDate}
                todayStr={todayStr}
                onEditDay={(dayInfo) => setEditingDay(dayInfo)}
                onOpenMonthlyReport={(target) => handleOpenMonthlyReport(target)}
              />
            )}

            {Boolean(editingDay) && (
              <EditDayModal
                key="edit-day-modal"
                isOpen={true}
                onClose={() => setEditingDay(null)}
                entryData={editingDay?.entry || entries[editingDay?.dateStr] || null}
                dateStr={editingDay?.dateStr}
                dayIndex={editingDay?.dayIndex || 1}
                onSave={handleSaveEntry}
                onOpenWallpaper={(entry, date) => handleOpenWallpaper(entry, date)}
                sphereSettingsVer={sphereSettingsVer}
              />
            )}

            {isMonthlyReportOpen && (
              <MonthlyReportModal
                key="monthly-report-modal"
                isOpen={true}
                onClose={() => setIsMonthlyReportOpen(false)}
                initialYear={reportTargetMonth.year}
                initialMonth={reportTargetMonth.month}
              />
            )}

            {/* 🖼️ Aesthetic Wallpaper & Social Card Export Modal */}
            {isWallpaperModalOpen && (
              <AestheticCardExportModal
                key="wallpaper-modal"
                isOpen={true}
                onClose={() => setIsWallpaperModalOpen(false)}
                entry={wallpaperTarget?.entry || entries[todayStr] || null}
                dateStr={wallpaperTarget?.dateStr || todayStr}
                dayCount={dayCount}
                entries={entries}
                startDate={startDate}
                displayName={userDisplayName}
              />
            )}

            {/* ⚡ Forensic Telemetry & Analytics Modal */}
            {isTelemetryOpen && (
              <ForensicStatsModal
                key="telemetry-modal"
                isOpen={true}
                onClose={() => setIsTelemetryOpen(false)}
                entries={entries}
                startDate={startDate}
                todayStr={todayStr}
              />
            )}

            {/* ⚙️ App Settings & Notification Hub Modal */}
            {isSettingsOpen && (
              <SettingsModal
                key="settings-modal"
                isOpen={true}
                onClose={() => setIsSettingsOpen(false)}
                user={currentUser}
                onSettingsChanged={() => setSphereSettingsVer(v => v + 1)}
                onOpenSanctuaryPage={() => setShowSanctuary(true)}
                onOpenNotificationStudio={() => {
                  setIsSettingsOpen(false);
                  setShowNotificationStudio(true);
                }}
                onOpenPrivacyPage={() => setShowPrivacy(true)}
                onOpenErasurePage={() => setShowErasure(true)}
                onOpenStoragePage={() => setShowStoragePage(true)}
                onOpenExportStudio={() => setIsExportStudioOpen(true)}
              />
            )}

            {/* 🎭 Sticker & Mascot Vault Modal */}
            {isStickerVaultOpen && (
              <StickerVaultModal
                key="sticker-vault-modal"
                isOpen={true}
                onClose={() => setIsStickerVaultOpen(false)}
              />
            )}

            {/* 📊 Multi-Format Data Export Studio Modal */}
            {isExportStudioOpen && (
              <ExportStudioModal
                key="export-studio-modal"
                isOpen={true}
                onClose={() => setIsExportStudioOpen(false)}
                entries={entries}
                startDate={startDate}
              />
            )}

            {/* 🌿 Anti-Burnout Rehabilitation Sanctuary Modal */}
            {isRehabModalOpen && (
              <RehabilitationModal
                key="rehab-modal"
                isOpen={true}
                onClose={() => {
                  setIsRehabModalOpen(false);
                  setSphereSettingsVer(v => v + 1);
                }}
              />
            )}

            {/* 🛡️ 2-Consecutive Rough Days Motivational Recovery Modal */}
            {isMotivationalOpen && (
              <MotivationalRecoveryModal
                key="motivational-modal"
                isOpen={true}
                onClose={() => setIsMotivationalOpen(false)}
              />
            )}

            {/* ⚠️ Neobrutalist Guest Mode & Two-Tier Safety Disclaimer */}
            {isGuestDisclaimerOpen && (
              <GuestDisclaimerModal
                key="guest-disclaimer-modal"
                isOpen={true}
                onClose={() => setIsGuestDisclaimerOpen(false)}
                onLogin={handleGuestLogin}
              />
            )}

            {/* 📡 WebRTC P2P Direct Device-to-Device Sync Modal */}
            {isP2PSyncOpen && (
              <P2PDeviceSyncModal
                key="p2p-sync-modal"
                isOpen={true}
                onClose={() => setIsP2PSyncOpen(false)}
                user={currentUser}
                initialSection={p2pSyncSection}
                onLogin={handleGuestLogin}
                onSyncComplete={() => loadData()}
              />
            )}

            {/* 🩸 Time & Mood Capsule Modal */}
            {isCapsuleModalOpen && (
              <RansomCapsuleModal
                key="ransom-capsule-modal"
                isOpen={true}
                onClose={handleCapsuleDismissed}
                mode={capsuleModalMode}
                targetCapsule={capsuleTarget}
                activeDate={todayStr}
                activeStreak={currentStreak}
                onCapsuleDismissed={handleCapsuleDismissed}
              />
            )}

            {/* 🧾 Global Receipt of Truth Thermal Slip Modal */}
            {isGlobalReceiptOpen && (
              <ReceiptOfTruthModal
                key="receipt-modal"
                isOpen={true}
                onClose={() => {
                  setIsGlobalReceiptOpen(false);
                  setReceiptPreviewEntries(null);
                }}
                entry={entries[todayStr] || null}
                dateStr={todayStr}
                dayCount={dayCount}
                entries={receiptPreviewEntries || entries}
                displayName={userDisplayName}
              />
            )}

            {/* 🔬 AI Forensic Autopsy Chamber Modal */}
            {isAutopsyOpen && (
              <AutopsyChamberModal
                key="autopsy-modal"
                isOpen={isAutopsyOpen}
                onClose={() => setIsAutopsyOpen(false)}
                entryDate={autopsyDate}
                rating={autopsyRating}
                existingAutopsy={autopsyExistingData}
                onSaveAutopsy={() => setIsAutopsyOpen(false)}
              />
            )}

            {/* 🧪 Behavioral Trilogy State Inspector & Dev Lab */}
            {isBehavioralLabOpen && (
              <BehavioralLabModal
                key="behavioral-lab-modal"
                isOpen={isBehavioralLabOpen}
                onClose={() => setIsBehavioralLabOpen(false)}
                onOpenReceipt={handleOpenReceiptFromLab}
                onOpenCapsule={handleOpenCapsuleFromLab}
                onOpenAutopsy={handleOpenAutopsyFromLab}
                onTriggerErrorTest={handleTriggerErrorTest}
              />
            )}

            {/* 🧘 Burnout Radar Sanctuary Invitation Dialog (Explicit Consent Required) */}
            {isSanctuaryInvitationOpen && (
              <SanctuaryInvitationModal
                key="sanctuary-invitation-modal"
                isOpen={isSanctuaryInvitationOpen}
                roughDaysCount={sanctuaryInvitationRoughCount}
                onAccept={() => {
                  acceptSanctuaryInvitation(7);
                  setIsSanctuaryInvitationOpen(false);
                  loadData();
                }}
                onDecline={() => {
                  declineSanctuaryInvitation();
                  setIsSanctuaryInvitationOpen(false);
                }}
              />
            )}

            {/* 🎓 GCERT RBVP Science Fair Animated Sketch Architecture Projector */}
            {isArchitectureProjectionOpen && (
              <ArchitectureProjectionModal
                key="architecture-projection-modal"
                isOpen={isArchitectureProjectionOpen}
                onClose={() => setIsArchitectureProjectionOpen(false)}
              />
            )}

            {/* Simulated Crash Harness for ErrorBoundary */}
            {simulatedCrash && (
              <SimulatedCrashTrigger shouldCrash={simulatedCrash} />
            )}
          </AnimatePresence>
        </Suspense>
      </ErrorBoundary>


      {/* 🔐 Private 4-Digit Vault PIN Gatekeeper */}
      <VaultLockGatekeeper
        isLocked={isVaultLocked}
        onUnlock={() => setIsVaultLocked(false)}
      />

    </div>
  );
}
