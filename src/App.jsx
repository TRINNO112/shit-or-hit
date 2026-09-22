import React, { useState, useEffect, useCallback, useMemo, lazy, Suspense, startTransition } from 'react';
import { Zap, Calendar, FlaskConical, Clock, Layers } from 'lucide-react';
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
const SanctuaryPage = safeLazy(() => import('./components/SanctuaryPage'));
const PrivacyPolicyPage = safeLazy(() => import('./components/PrivacyPolicyPage'));
const DataErasurePage = safeLazy(() => import('./components/DataErasurePage'));
const StorageSovereigntyPage = safeLazy(() => import('./components/StorageSovereigntyPage'));
const P2PDeviceSyncModal = safeLazy(() => import('./components/P2PDeviceSyncModal'));
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
  autoActivateSanctuaryIfEligible,
  getPendingDeletionStatus,
  cancelAccountDeletion
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
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(max-width: 767px)').matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mql = window.matchMedia('(max-width: 767px)');
    const onChange = (e) => setIsMobile(e.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
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
  const [showSanctuary, setShowSanctuary] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.location.search.includes('view=sanctuary') || window.location.hash.includes('sanctuary');
  });
  const [showPrivacy, setShowPrivacy] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.location.search.includes('view=privacy') || window.location.hash.includes('privacy');
  });
  const [showErasure, setShowErasure] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.location.search.includes('view=erasure') || window.location.hash.includes('erasure');
  });
  const [showStoragePage, setShowStoragePage] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.location.search.includes('view=storage') || window.location.hash.includes('storage');
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

  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isMonthlyReportOpen, setIsMonthlyReportOpen] = useState(false);
  const [isWallpaperModalOpen, setIsWallpaperModalOpen] = useState(false);
  const [isTelemetryOpen, setIsTelemetryOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isStickerVaultOpen, setIsStickerVaultOpen] = useState(false);
  const [isExportStudioOpen, setIsExportStudioOpen] = useState(false);
  const [isRehabModalOpen, setIsRehabModalOpen] = useState(false);
  const [wallpaperTarget, setWallpaperTarget] = useState(null);
  const [reportTargetMonth, setReportTargetMonth] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1
  });
  const [editingDay, setEditingDay] = useState(null); // { dateStr, dayIndex, entry }
  const [sphereSettingsVer, setSphereSettingsVer] = useState(0);
  const [isInitialLoading, setIsInitialLoading] = useState(false);
  const [activeDesktopTab, setActiveDesktopTab] = useState('today');
  const [isVaultLocked, setIsVaultLocked] = useState(() => isVaultPinActive());
  const [isMotivationalOpen, setIsMotivationalOpen] = useState(false);

  // ⏱️ Guest Disclaimer evaluates with a 3-second grace buffer to allow Firebase Auth to initialize
  const [isGuestDisclaimerOpen, setIsGuestDisclaimerOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      const u = getCurrentUser();
      if (!u && !isGuestDisclaimerDismissed()) {
        setIsGuestDisclaimerOpen(true);
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  // Behavioral Trilogy Modal States & Dev Lab
  const [isCapsuleModalOpen, setIsCapsuleModalOpen] = useState(false);
  const [capsuleModalMode, setCapsuleModalMode] = useState('vault'); // 'vault' | 'capture' | 'release'
  const [capsuleTarget, setCapsuleTarget] = useState(null);
  const isCapsuleReleaseOpen = isCapsuleModalOpen;
  const releasedCapsule = capsuleTarget;
  const setIsCapsuleReleaseOpen = setIsCapsuleModalOpen;
  const setReleasedCapsule = setCapsuleTarget;

  const [isGlobalReceiptOpen, setIsGlobalReceiptOpen] = useState(false);
  const [receiptPreviewEntries, setReceiptPreviewEntries] = useState(null);
  const [isAutopsyOpen, setIsAutopsyOpen] = useState(false);
  const [autopsyDate, setAutopsyDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [autopsyRating, setAutopsyRating] = useState(1);
  const [autopsyExistingData, setAutopsyExistingData] = useState(null);
  const [isBehavioralLabOpen, setIsBehavioralLabOpen] = useState(false);
  const [simulatedCrash, setSimulatedCrash] = useState(false);
  const [isP2PSyncOpen, setIsP2PSyncOpen] = useState(false);

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
    window.__openP2PSync = () => setIsP2PSyncOpen(true);

    let keyBuffer = '';
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

      keyBuffer = (keyBuffer + e.key.toLowerCase()).slice(-12);
      if (keyBuffer.endsWith('iconlab')) {
        setShowIconLab(prev => !prev);
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
      setShowIconLab(window.location.search.includes('view=icons') || window.location.hash.includes('icons'));
      setShowSkeletonPreview(window.location.search.includes('view=skeleton') || window.location.hash.includes('skeleton'));
      setShowSanctuary(window.location.search.includes('view=sanctuary') || window.location.hash.includes('sanctuary'));
      setShowPrivacy(window.location.search.includes('view=privacy') || window.location.hash.includes('privacy'));
      setShowErasure(window.location.search.includes('view=erasure') || window.location.hash.includes('erasure'));
      setPendingDeletion(getPendingDeletionStatus());
      if (window.location.search.includes('view=recovery') || window.location.search.includes('test=recovery')) {
        setIsMotivationalOpen(true);
      }
      if (window.location.search.includes('view=guest') || window.location.search.includes('view=disclaimer')) {
        setIsGuestDisclaimerOpen(true);
      }
      if (window.location.search.includes('sync=') || window.location.search.includes('view=sync') || window.location.hash.includes('sync')) {
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

  // 🤖 Auto-Sanctuary Assumption Engine: Safeguard streak automatically on load
  useEffect(() => {
    try {
      if (entries && Object.keys(entries).length > 0) {
        autoActivateSanctuaryIfEligible(entries);
      }
    } catch (e) {
      console.warn('Auto-sanctuary trigger check note:', e);
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
    scheduleLocalEveningReminder();
    // ⚡ Instant local hydration: sync local storage/server immediately on mount
    loadData();

    const unsubscribe = subscribeAuthState(async (u) => {
      console.log('🛡️ [App Engine] Auth Hydration:', u ? `Logged in as ${u.displayName} (${u.email}) [UID: ${u.uid}]` : 'Local Mode');
      setCurrentUser(u);
      if (u) {
        setIsGuestDisclaimerOpen(false);
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
            if (cloudSettings.vaultPinEncrypted) {
              const decrypted = decryptVaultPin(cloudSettings.vaultPinEncrypted);
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

    // Calculate yesterday's date
    const yestObj = new Date(`${todayStr}T00:00:00`);
    yestObj.setDate(yestObj.getDate() - 1);
    const yestStr = yestObj.toISOString().slice(0, 10);
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
        <SkeletonLoader isMobile={isMobile} />
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

  if (isInitialLoading) {
    return <SkeletonLoader isMobile={isMobile} />;
  }

  const handleDesktopTabChange = (tabId) => {
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
            onOpenStickerVault={() => setIsStickerVaultOpen(true)}
            onOpenExportStudio={() => setIsExportStudioOpen(true)}
            onOpenRehab={() => setShowSanctuary(true)}
            sphereSettingsVer={sphereSettingsVer}
          />
        </FaultBoundary>
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
                onOpenReceipt={() => setIsGlobalReceiptOpen(true)}
                onOpenExportStudio={() => setIsExportStudioOpen(true)}
                onOpenRehab={() => setShowSanctuary(true)}
                onSyncRefresh={loadData}
              />
            </div>
          </div>

          <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
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

      {/* Shared Modals with Suspense Code Splitting */}
      <ErrorBoundary>
        <Suspense fallback={null}>
          {isCalendarOpen && (
            <CalendarModal
              isOpen={isCalendarOpen}
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
              isOpen={Boolean(editingDay)}
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
              isOpen={isMonthlyReportOpen}
              onClose={() => setIsMonthlyReportOpen(false)}
              initialYear={reportTargetMonth.year}
              initialMonth={reportTargetMonth.month}
            />
          )}

          {/* 🖼️ Aesthetic Wallpaper & Social Card Export Modal */}
          {isWallpaperModalOpen && (
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
          )}

          {/* ⚡ Forensic Telemetry & Analytics Modal */}
          {isTelemetryOpen && (
            <ForensicStatsModal
              isOpen={isTelemetryOpen}
              onClose={() => setIsTelemetryOpen(false)}
              entries={entries}
              startDate={startDate}
              todayStr={todayStr}
            />
          )}

          {/* ⚙️ App Settings & Notification Hub Modal */}
          {isSettingsOpen && (
            <SettingsModal
              isOpen={isSettingsOpen}
              onClose={() => setIsSettingsOpen(false)}
              user={currentUser}
              onSettingsChanged={() => setSphereSettingsVer(v => v + 1)}
              onOpenSanctuaryPage={() => setShowSanctuary(true)}
              onOpenPrivacyPage={() => setShowPrivacy(true)}
              onOpenErasurePage={() => setShowErasure(true)}
              onOpenStoragePage={() => setShowStoragePage(true)}
              onOpenExportStudio={() => setIsExportStudioOpen(true)}
            />
          )}

          {/* 🎭 Sticker & Mascot Vault Modal */}
          {isStickerVaultOpen && (
            <StickerVaultModal
              isOpen={isStickerVaultOpen}
              onClose={() => setIsStickerVaultOpen(false)}
            />
          )}

          {/* 📊 Multi-Format Data Export Studio Modal */}
          {isExportStudioOpen && (
            <ExportStudioModal
              isOpen={isExportStudioOpen}
              onClose={() => setIsExportStudioOpen(false)}
              entries={entries}
              startDate={startDate}
            />
          )}

          {/* 🌿 Anti-Burnout Rehabilitation Sanctuary Modal */}
          {isRehabModalOpen && (
            <RehabilitationModal
              isOpen={isRehabModalOpen}
              onClose={() => {
                setIsRehabModalOpen(false);
                setSphereSettingsVer(v => v + 1);
              }}
            />
          )}

          {/* 🛡️ 2-Consecutive Rough Days Motivational Recovery Modal */}
          {isMotivationalOpen && (
            <MotivationalRecoveryModal
              isOpen={isMotivationalOpen}
              onClose={() => setIsMotivationalOpen(false)}
            />
          )}

          {/* ⚠️ Neobrutalist Guest Mode & Two-Tier Safety Disclaimer */}
          {isGuestDisclaimerOpen && (
            <GuestDisclaimerModal
              isOpen={isGuestDisclaimerOpen}
              onClose={() => setIsGuestDisclaimerOpen(false)}
              onLogin={handleGuestLogin}
            />
          )}

          {/* 📡 WebRTC P2P Direct Device-to-Device Sync Modal */}
          {isP2PSyncOpen && (
            <P2PDeviceSyncModal
              isOpen={isP2PSyncOpen}
              onClose={() => setIsP2PSyncOpen(false)}
              user={currentUser}
              onLogin={handleGuestLogin}
              onSyncComplete={() => loadData()}
            />
          )}

          {/* 🩸 Time & Mood Capsule Modal */}
          {isCapsuleModalOpen && (
            <RansomCapsuleModal
              isOpen={isCapsuleModalOpen}
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
              isOpen={isGlobalReceiptOpen}
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
              isOpen={isBehavioralLabOpen}
              onClose={() => setIsBehavioralLabOpen(false)}
              onOpenReceipt={handleOpenReceiptFromLab}
              onOpenCapsule={handleOpenCapsuleFromLab}
              onOpenAutopsy={handleOpenAutopsyFromLab}
              onTriggerErrorTest={handleTriggerErrorTest}
            />
          )}

          {/* Simulated Crash Harness for ErrorBoundary */}
          {simulatedCrash && (
            <SimulatedCrashTrigger shouldCrash={simulatedCrash} />
          )}
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
