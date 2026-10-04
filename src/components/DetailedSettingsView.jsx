import React, { useState, useEffect, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  X, 
  Cloud, 
  Trophy, 
  Languages, 
  Bot, 
  Tag, 
  History, 
  Download, 
  Database, 
  HardDrive, 
  AlertOctagon, 
  Copy, 
  ArrowRight, 
  Landmark, 
  Compass, 
  LogIn, 
  LogOut, 
  FolderSync, 
  KeyRound, 
  Printer,
  ShieldCheck,
  Shield,
  RefreshCw,
  Radio,
  RotateCcw,
  Sparkles,
  HeartHandshake
} from 'lucide-react';
import { soundEngine } from '../services/soundEngine';
import { 
  isRansomCapsuleEnabled, 
  setRansomCapsuleEnabled, 
  getRansomCapsuleSensitivity, 
  setRansomCapsuleSensitivity,
  isAutopsyChamberEnabled, 
  setAutopsyChamberEnabled,
  isReceiptOfTruthEnabled, 
  setReceiptOfTruthEnabled,
  getRehabilitationConfig,
  activateRehabilitation,
  activateSabbatical,
  exitRehabilitation,
  getRollingSnapshots,
  getSnapshotDetails,
  restoreSnapshot,
  getSafetyStashMeta,
  revertToLiveSafetyStash,
  exportDatabaseBackup,
  getDbStorageKey
} from '../services/api';
import { getStorageStatus } from '../services/storageManager';
import { getMutualPeerBackupMeta, restoreFromMutualPeerBackup } from '../services/p2pSyncEngine';
import { loginWithGoogle, logoutUser } from '../services/firebase';
import { isVaultPinActive } from './VaultPinModal';
import VerdictIconGallery from './VerdictIconGallery';
import AIDirectivesModal from './AIDirectivesModal';
import SnapshotPreviewModal from './SnapshotPreviewModal';
import PrivacyPolicyModal from './PrivacyPolicyModal';
import RehabilitationModal from './RehabilitationModal';

const RansomCapsuleModal = lazy(() => import('./RansomCapsuleModal'));
const P2PDeviceSyncModal = lazy(() => import('./P2PDeviceSyncModal'));

export default function DetailedSettingsView({
  user,
  onClose = () => {},
  onOpenStickerVault,
  onOpenPrivacyPage,
  onOpenErasurePage,
  onOpenStoragePage,
  onOpenExportStudio,
  onOpenRehab,
  onOpenGuardianContact = null,
  onSettingsChanged = () => {},
  triggerHaptic = () => {}
}) {
  // Behavioral Preferences
  const [ransomCapsuleOn, setRansomCapsuleOn] = useState(() => isRansomCapsuleEnabled());
  const [ransomSensitivity, setRansomSensitivity] = useState(() => getRansomCapsuleSensitivity() || 2);
  const [autopsyChamberOn, setAutopsyChamberOn] = useState(() => isAutopsyChamberEnabled());
  const [receiptOfTruthOn, setReceiptOfTruthOn] = useState(() => isReceiptOfTruthEnabled());
  const [isCapsuleVaultOpen, setIsCapsuleVaultOpen] = useState(false);

  // In-App Modals
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isRehabModalOpen, setIsRehabModalOpen] = useState(false);
  const [isP2PModalOpen, setIsP2PModalOpen] = useState(false);
  const [p2pModalSection, setP2PModalSection] = useState('sync');

  // Rehabilitation & Sabbatical
  const [rehabConfig, setRehabConfig] = useState(() => getRehabilitationConfig());
  const isSabbatical = Boolean(rehabConfig?.isSabbatical);
  const rehabActive = Boolean(rehabConfig?.active);

  // Themes & UI
  const [isVerdictGalleryOpen, setIsVerdictGalleryOpen] = useState(false);

  // AI Directives & Language
  const [aiLanguage, setAiLanguage] = useState(() => localStorage.getItem('daily_verdict_ai_language') || 'auto');
  const [isDirectivesModalOpen, setIsDirectivesModalOpen] = useState(false);

  // Tags
  const [tagsList, setTagsList] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('daily_verdict_custom_tags')) || ['Deep Work', 'Gym', 'Family', 'Reading', 'Code', 'Stressed'];
    } catch (e) {
      return ['Deep Work', 'Gym', 'Family', 'Reading', 'Code', 'Stressed'];
    }
  });
  const [newTagInput, setNewTagInput] = useState('');

  // Storage Sovereignty & Inspector
  const [storageTierState, setStorageTierState] = useState({
    quotaMb: 0,
    usageKb: 0,
    persisted: false
  });
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [rawDbData, setRawDbData] = useState(null);
  const [copiedDb, setCopiedDb] = useState(false);

  // Snapshots (Time Machine)
  const [snapshots, setSnapshots] = useState([]);
  const [safetyMeta, setSafetyMeta] = useState(null);
  const [previewSnapId, setPreviewSnapId] = useState(null);
  const [previewSnapData, setPreviewSnapData] = useState(null);

  // Data Transfer & Peer Backup State
  const [peerBackupMeta, setPeerBackupMeta] = useState(() => getMutualPeerBackupMeta());
  const [peerRestoreMsg, setPeerRestoreMsg] = useState('');

  useEffect(() => {
    getStorageStatus().then(status => {
      setStorageTierState(status);
    });
    setSnapshots(getRollingSnapshots());
    setSafetyMeta(getSafetyStashMeta());
    setPeerBackupMeta(getMutualPeerBackupMeta());
  }, []);

  // Handlers for Behavioral Intelligence
  const handleToggleCapsule = () => {
    try { soundEngine.playClick(); } catch (e) {}
    const next = !ransomCapsuleOn;
    setRansomCapsuleOn(next);
    setRansomCapsuleEnabled(next);
    window.dispatchEvent(new Event('storage'));
    if (onSettingsChanged) onSettingsChanged();
    triggerHaptic('medium');
  };

  const handleSensitivityChange = (val) => {
    try { soundEngine.playClick(); } catch (e) {}
    const clean = val === 3 ? 3 : 2;
    setRansomSensitivity(clean);
    setRansomCapsuleSensitivity(clean);
    window.dispatchEvent(new Event('storage'));
    if (onSettingsChanged) onSettingsChanged();
    triggerHaptic('light');
  };

  const handleToggleAutopsy = () => {
    try { soundEngine.playClick(); } catch (e) {}
    const next = !autopsyChamberOn;
    setAutopsyChamberOn(next);
    setAutopsyChamberEnabled(next);
    window.dispatchEvent(new Event('storage'));
    if (onSettingsChanged) onSettingsChanged();
    triggerHaptic('medium');
  };

  const handleToggleReceipt = () => {
    try { soundEngine.playClick(); } catch (e) {}
    const next = !receiptOfTruthOn;
    setReceiptOfTruthOn(next);
    setReceiptOfTruthEnabled(next);
    window.dispatchEvent(new Event('receipt-of-truth-updated'));
    window.dispatchEvent(new Event('storage'));
    if (onSettingsChanged) onSettingsChanged();
    triggerHaptic('medium');
  };

  const handleAiLanguageChange = (lang) => {
    try { soundEngine.playClick(); } catch (e) {}
    setAiLanguage(lang);
    localStorage.setItem('daily_verdict_ai_language', lang);
    triggerHaptic('light');
  };

  const handleAddTag = (e) => {
    e.preventDefault();
    const clean = newTagInput.trim();
    if (!clean || tagsList.includes(clean)) return;
    try { soundEngine.playClick(); } catch (e) {}
    const updated = [...tagsList, clean];
    setTagsList(updated);
    localStorage.setItem('daily_verdict_custom_tags', JSON.stringify(updated));
    setNewTagInput('');
    triggerHaptic('success');
  };

  const handleDeleteTag = (tag) => {
    try { soundEngine.playClick(); } catch (e) {}
    const updated = tagsList.filter(t => t !== tag);
    setTagsList(updated);
    localStorage.setItem('daily_verdict_custom_tags', JSON.stringify(updated));
    triggerHaptic('light');
  };

  // Peer Restore Handler
  const handleRestoreFromPeer = () => {
    try { soundEngine.playClick(); } catch (e) {}
    if (window.confirm(`Restore ${peerBackupMeta?.entryCount || 0} entries from paired device "${peerBackupMeta?.peerDeviceName || 'Paired Node'}"? Current entries will be updated.`)) {
      const success = restoreFromMutualPeerBackup();
      if (success) {
        setPeerRestoreMsg(`Restored ${peerBackupMeta?.entryCount || 0} entries from ${peerBackupMeta?.peerDeviceName}!`);
        soundEngine.playSuccessChime();
        if (onSettingsChanged) onSettingsChanged();
        window.dispatchEvent(new Event('storage'));
        setTimeout(() => setPeerRestoreMsg(''), 4000);
      } else {
        alert('Could not restore from peer backup.');
      }
    }
  };

  // Storage Inspector Handlers
  const handleToggleInspector = () => {
    try { soundEngine.playClick(); } catch (e) {}
    if (!isInspectorOpen) {
      try {
        const key = getDbStorageKey(user);
        const raw = localStorage.getItem(key);
        setRawDbData(raw ? JSON.parse(raw) : { entries: {} });
      } catch (e) {
        setRawDbData({ error: 'Failed to parse database records' });
      }
    }
    setIsInspectorOpen(!isInspectorOpen);
  };

  const handleCopyRawDb = () => {
    try { soundEngine.playClick(); } catch (e) {}
    if (rawDbData) {
      navigator.clipboard.writeText(JSON.stringify(rawDbData, null, 2));
      setCopiedDb(true);
      setTimeout(() => setCopiedDb(false), 2500);
      triggerHaptic('success');
    }
  };

  // Snapshot Handlers
  const handlePreviewSnapshot = (snapId) => {
    const details = getSnapshotDetails(snapId);
    if (details) {
      setPreviewSnapId(snapId);
      setPreviewSnapData(details);
    }
  };

  const handleRestoreSnapshot = (snapId) => {
    if (window.confirm(`Restore Database Snapshot #${snapId}? Your current data will be safely backed up into Safety Stash.`)) {
      restoreSnapshot(snapId);
      window.location.reload();
    }
  };

  const handleRevertSafetyStash = () => {
    if (window.confirm('Revert to pre-restore Safety Stash?')) {
      revertToLiveSafetyStash();
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDF5] text-black font-sans pb-28 select-none">
      {/* Sticky Top Header */}
      <header className="sticky top-0 z-40 bg-[#FFFDF5]/95 backdrop-blur-md border-b-3 border-black px-4 py-3 flex items-center justify-between shadow-[0_2px_0px_#000000]">
        <button
          type="button"
          onClick={() => {
            try { soundEngine.playClick(); } catch (e) {}
            onClose();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FFFDF0] hover:bg-[#FDC800] border-2 border-black rounded-xl font-mono text-xs font-black uppercase text-black shadow-[1.5px_1.5px_0px_#000000] active:translate-x-px cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4 stroke-[3]" />
          <span>BACK TO APP</span>
        </button>

        <div className="text-center min-w-0 px-2">
          <h1 className="font-display font-black text-sm uppercase text-black truncate leading-tight">
            Detailed Settings
          </h1>
          <p className="font-mono text-[9px] font-bold text-neutral-500 uppercase truncate">
            Deep Architecture &amp; Data Sovereignty
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            try { soundEngine.playClick(); } catch (e) {}
            onClose();
          }}
          className="p-1.5 rounded-xl bg-neutral-100 hover:bg-[#FF4D4D] hover:text-white border-2 border-black shadow-[2px_2px_0px_#000000] active:translate-x-px active:translate-y-px transition-colors cursor-pointer"
          title="Close Settings"
        >
          <X className="w-4 h-4 stroke-[2.5]" />
        </button>
      </header>

      {/* Main Settings Body */}
      <main className="max-w-2xl mx-auto p-4 space-y-4 pt-5">

        {/* ========================================================= */}
        {/* 1. BEHAVIORAL INTELLIGENCE TRILOGY */}
        {/* ========================================================= */}
        <div className="bg-white border-2 border-black rounded-2xl p-4 shadow-[3px_3px_0px_#000000] space-y-3.5">
          <div className="flex items-center justify-between border-b-2 border-black/10 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#FDC800] border-2 border-black flex items-center justify-center shadow-[1px_1px_0px_#000000]">
                <Landmark className="w-4 h-4 text-black stroke-[2.5]" />
              </div>
              <div>
                <h4 className="font-display font-black text-sm uppercase text-black">
                  Behavioral Intelligence Trilogy
                </h4>
                <p className="font-mono text-[9px] text-neutral-500 uppercase">
                  Tough-love forensic protocols &amp; commitment devices
                </p>
              </div>
            </div>
            <span className="font-mono text-[9px] bg-black text-[#FDC800] px-2 py-0.5 rounded font-black uppercase">
              PRO ENGINES
            </span>
          </div>

          {/* 1. Down-Bad Ransom Capsule */}
          <div className="bg-[#FFFDF8] border-2 border-black rounded-xl p-3.5 shadow-[1.5px_1.5px_0px_#000000] space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                <div className="w-9 h-9 shrink-0 rounded-xl bg-[#FDC800] border-2 border-black flex items-center justify-center shadow-[1px_1px_0px_#000000]">
                  <KeyRound className="w-4 h-4 text-black stroke-[2.5]" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h5 className="font-display font-black text-xs uppercase text-black">
                      Down-Bad Ransom Capsule
                    </h5>
                    <span className={`px-1.5 py-0.2 rounded border border-black text-[9px] font-mono font-black uppercase ${
                      ransomCapsuleOn ? 'bg-[#00E599] text-black' : 'bg-neutral-200 text-neutral-600'
                    }`}>
                      {ransomCapsuleOn ? 'ON' : 'OFF'}
                    </span>
                  </div>
                  <p className="text-[11px] font-mono text-neutral-600 leading-snug">
                    Cryptographically locks 5★ God Mode reality checks. Unlocks only on consecutive 1★ days.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleToggleCapsule}
                className={`w-full sm:w-auto px-3.5 py-1.5 rounded-xl border-2 border-black font-mono text-xs font-black cursor-pointer transition-all shadow-[1.5px_1.5px_0px_#000000] active:scale-95 shrink-0 text-center ${
                  ransomCapsuleOn ? 'bg-[#00E599] text-black' : 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300'
                }`}
              >
                {ransomCapsuleOn ? 'ACTIVE (ON)' : 'DISABLED (OFF)'}
              </button>
            </div>

            {ransomCapsuleOn && (
              <div className="pt-2 border-t border-black/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex flex-col sm:flex-row sm:items-center gap-1.5">
                  <span className="text-[10px] font-mono font-bold text-neutral-600 uppercase shrink-0">Trigger Sensitivity:</span>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {[2, 3].map((days) => (
                      <button
                        key={days}
                        type="button"
                        onClick={() => handleSensitivityChange(days)}
                        className={`px-2 py-0.5 rounded-lg border border-black font-mono text-[10px] font-black cursor-pointer ${
                          ransomSensitivity === days
                            ? 'bg-[#FDC800] text-black shadow-[1px_1px_0px_#000000]'
                            : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                        }`}
                      >
                        {days} ROUGH DAYS {days === 2 ? '(RECOMMENDED)' : ''}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    try { soundEngine.playClick(); } catch (e) {}
                    setIsCapsuleVaultOpen(true);
                  }}
                  className="self-start sm:self-auto px-2.5 py-1 bg-white hover:bg-neutral-100 border border-black rounded-lg font-mono text-[10px] font-black text-black cursor-pointer shadow-[1px_1px_0px_#000000] shrink-0 flex items-center gap-1"
                >
                  <span>VIEW CAPSULE VAULT</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          {/* 2. The Autopsy Chamber Interrogator */}
          <div className="bg-[#FFFDF8] border-2 border-black rounded-xl p-3.5 shadow-[1.5px_1.5px_0px_#000000] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
              <div className="w-9 h-9 shrink-0 rounded-xl bg-[#FF4D4D] border-2 border-black flex items-center justify-center shadow-[1px_1px_0px_#000000]">
                <AlertOctagon className="w-4 h-4 text-black stroke-[2.5]" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h5 className="font-display font-black text-xs uppercase text-black">
                    The Autopsy Chamber Interrogator
                  </h5>
                  <span className={`px-1.5 py-0.2 rounded border border-black text-[9px] font-mono font-black uppercase ${
                    autopsyChamberOn ? 'bg-[#00E599] text-black' : 'bg-neutral-200 text-neutral-600'
                  }`}>
                    {autopsyChamberOn ? 'ON' : 'OFF'}
                  </span>
                </div>
                <p className="text-[11px] font-mono text-neutral-600 leading-snug">
                  Rapid forensic inquest to diagnose friction, deficits, and relapse triggers when 1★ or 2★ days occur.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleToggleAutopsy}
              className={`w-full sm:w-auto px-3.5 py-1.5 rounded-xl border-2 border-black font-mono text-xs font-black cursor-pointer transition-all shadow-[1.5px_1.5px_0px_#000000] active:scale-95 shrink-0 text-center ${
                autopsyChamberOn ? 'bg-[#00E599] text-black' : 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300'
              }`}
            >
              {autopsyChamberOn ? 'ACTIVE (ON)' : 'DISABLED (OFF)'}
            </button>
          </div>

          {/* 3. The Receipt of Truth Generator */}
          <div className="bg-[#FFFDF8] border-2 border-black rounded-xl p-3.5 shadow-[1.5px_1.5px_0px_#000000] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
              <div className="w-9 h-9 shrink-0 rounded-xl bg-[#00E599] border-2 border-black flex items-center justify-center shadow-[1px_1px_0px_#000000]">
                <Printer className="w-4 h-4 text-black stroke-[2.5]" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h5 className="font-display font-black text-xs uppercase text-black">
                    Receipt of Truth Thermal Slip
                  </h5>
                  <span className={`px-1.5 py-0.2 rounded border border-black text-[9px] font-mono font-black uppercase ${
                    receiptOfTruthOn ? 'bg-[#00E599] text-black' : 'bg-neutral-200 text-neutral-600'
                  }`}>
                    {receiptOfTruthOn ? 'ON' : 'OFF'}
                  </span>
                </div>
                <p className="text-[11px] font-mono text-neutral-600 leading-snug">
                  Japanese streetwear &amp; supermarket thermal slip generator for daily reflections with 1080p export.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleToggleReceipt}
              className={`w-full sm:w-auto px-3.5 py-1.5 rounded-xl border-2 border-black font-mono text-xs font-black cursor-pointer transition-all shadow-[1.5px_1.5px_0px_#000000] active:scale-95 shrink-0 text-center ${
                receiptOfTruthOn ? 'bg-[#00E599] text-black' : 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300'
              }`}
            >
              {receiptOfTruthOn ? 'ACTIVE (ON)' : 'DISABLED (OFF)'}
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 2. ANTI-BURNOUT SANCTUARY & GRAND SABBATICAL (Interactive Suite) */}
        {/* ========================================================= */}
        <div className={`p-4 border-2 border-black rounded-2xl shadow-[3px_3px_0px_#000000] space-y-3 ${
          isSabbatical ? 'bg-[#FFFBEB]' : rehabActive ? 'bg-[#F0FDF4]' : 'bg-[#FFFDF5]'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-9 h-9 rounded-xl border-2 border-black flex items-center justify-center shrink-0 shadow-[1px_1px_0px_#000000] ${
                isSabbatical ? 'bg-[#FFB800]' : 'bg-[#00E599]'
              }`}>
                {isSabbatical ? <Compass className="w-5 h-5 text-black stroke-[2.5]" /> : <Shield className="w-5 h-5 text-black stroke-[2.5]" />}
              </div>
              <div>
                <h4 className="font-display font-black text-sm uppercase text-black">
                  {isSabbatical ? 'Grand Sabbatical' : 'Sanctuary Mode'}
                </h4>
                <p className="font-mono text-[9px] text-neutral-500 uppercase">
                  Nervous system recovery &amp; indefinite life transitions
                </p>
              </div>
            </div>
            <span className={`px-2 py-0.5 rounded border border-black text-[9px] font-mono font-black uppercase ${
              rehabActive ? (isSabbatical ? 'bg-[#FFB800] text-black' : 'bg-[#00E599] text-black') : 'bg-neutral-200 text-neutral-700'
            }`}>
              {rehabActive ? (isSabbatical ? 'SABBATICAL ACTIVE' : 'SANCTUARY ACTIVE') : 'INACTIVE'}
            </span>
          </div>

          <p className="text-[11px] font-mono text-neutral-600 leading-normal">
            {isSabbatical 
              ? 'Open-ended macro life pause. Daily grading suspended indefinitely. Streak shielded.'
              : rehabActive 
                ? 'Streak shielded & frozen. Daily verdicts paused for deep rest and recovery.' 
                : 'Pause demanding daily verdicts & protect your hard-earned streak during burnouts.'}
          </p>

          {/* Interactive Portal Launchers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                try { soundEngine.playClick(); } catch (e) {}
                if (onOpenRehab) {
                  onOpenRehab();
                  onClose();
                } else if (typeof window !== 'undefined') {
                  window.location.href = '/?view=sanctuary';
                }
              }}
              className="py-2.5 px-3 bg-[#00E599] hover:bg-emerald-400 text-black border-2 border-black rounded-xl font-mono text-xs font-black uppercase shadow-[1.5px_1.5px_0px_#000000] cursor-pointer flex items-center justify-center gap-1.5 active:translate-x-px"
            >
              <Compass className="w-4 h-4 stroke-[2.5]" />
              <span>OPEN SANCTUARY PORTAL</span>
            </button>

            <button
              type="button"
              onClick={() => {
                try { soundEngine.playClick(); } catch (e) {}
                setIsRehabModalOpen(true);
              }}
              className="py-2.5 px-3 bg-white hover:bg-neutral-100 text-black border-2 border-black rounded-xl font-mono text-xs font-black uppercase shadow-[1.5px_1.5px_0px_#000000] cursor-pointer flex items-center justify-center gap-1.5 active:translate-x-px"
            >
              <Shield className="w-4 h-4 stroke-[2.5]" />
              <span>CONFIGURE STASIS MODAL</span>
            </button>
          </div>

          {/* 1-Tap Stasis Quick Actions */}
          <div className="pt-2 border-t border-black/10">
            {rehabActive ? (
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={() => {
                    try { soundEngine.playClick(); } catch (e) {}
                    exitRehabilitation();
                    setRehabConfig(getRehabilitationConfig());
                    if (onSettingsChanged) onSettingsChanged();
                    window.dispatchEvent(new Event('storage'));
                    triggerHaptic('medium');
                  }}
                  className="flex-1 py-2 bg-[#FF4D4D] text-white border-2 border-black rounded-xl font-mono text-xs font-black uppercase shadow-[1.5px_1.5px_0px_#000000] cursor-pointer"
                >
                  RESUME DAILY VERDICTS
                </button>
                {!isSabbatical && (
                  <button
                    type="button"
                    onClick={() => {
                      try { soundEngine.playClick(); } catch (e) {}
                      activateSabbatical();
                      setRehabConfig(getRehabilitationConfig());
                      if (onSettingsChanged) onSettingsChanged();
                      window.dispatchEvent(new Event('storage'));
                      triggerHaptic('success');
                    }}
                    className="flex-1 py-2 bg-[#FFB800] text-black border-2 border-black rounded-xl font-mono text-xs font-black uppercase shadow-[1.5px_1.5px_0px_#000000] cursor-pointer"
                  >
                    SWITCH TO GRAND SABBATICAL
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    try { soundEngine.playClick(); } catch (e) {}
                    activateRehabilitation(7);
                    setRehabConfig(getRehabilitationConfig());
                    if (onSettingsChanged) onSettingsChanged();
                    window.dispatchEvent(new Event('storage'));
                    triggerHaptic('success');
                  }}
                  className="py-2 px-3 bg-[#00E599] border-2 border-black rounded-xl font-mono text-xs font-black uppercase shadow-[1.5px_1.5px_0px_#000000] cursor-pointer"
                >
                  7-DAY SANCTUARY
                </button>
                <button
                  type="button"
                  onClick={() => {
                    try { soundEngine.playClick(); } catch (e) {}
                    activateSabbatical();
                    setRehabConfig(getRehabilitationConfig());
                    if (onSettingsChanged) onSettingsChanged();
                    window.dispatchEvent(new Event('storage'));
                    triggerHaptic('success');
                  }}
                  className="py-2 px-3 bg-[#FFB800] border-2 border-black rounded-xl font-mono text-xs font-black uppercase shadow-[1.5px_1.5px_0px_#000000] cursor-pointer"
                >
                  GRAND SABBATICAL
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ========================================================= */}
        {/* 3. DAILY MOOD ICON THEMES */}
        {/* ========================================================= */}
        <div className="bg-white border-2 border-black rounded-2xl p-4 shadow-[3px_3px_0px_#000000] space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className="w-10 h-10 rounded-xl bg-[#FDC800] border-2 border-black flex items-center justify-center shrink-0 shadow-[1px_1px_0px_#000000]">
                <Trophy className="w-5 h-5 text-black stroke-[2.5]" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-display font-black text-sm uppercase text-black truncate">
                  Daily Mood Icon Themes
                </h4>
                <p className="text-[11px] font-mono text-neutral-600 truncate">
                  3 curated vector presets or freedom custom mix
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                try { soundEngine.playClick(); } catch (e) {}
                setIsVerdictGalleryOpen(true);
              }}
              className="py-1.5 px-3.5 bg-[#FDC800] hover:bg-yellow-400 border-2 border-black rounded-xl font-mono text-xs font-black uppercase text-black shadow-[1.5px_1.5px_0px_#000000] cursor-pointer shrink-0 active:translate-x-px"
            >
              CUSTOMIZE ICONS
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 4. CUSTOM STICKER & MASCOT VAULT (Separated Dedicated Card) */}
        {/* ========================================================= */}
        {onOpenStickerVault && (
          <div className="bg-white border-2 border-black rounded-2xl p-4 shadow-[3px_3px_0px_#000000] space-y-2.5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className="w-10 h-10 rounded-xl bg-[#FFF5C2] border-2 border-black flex items-center justify-center shrink-0 shadow-[1px_1px_0px_#000000]">
                  <Sparkles className="w-5 h-5 text-black stroke-[2.5]" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-display font-black text-sm uppercase text-black truncate">
                    Custom Sticker &amp; Mascot Vault
                  </h4>
                  <p className="text-[11px] font-mono text-neutral-600 truncate">
                    Manage personal PNG mascot overlays &amp; journal stickers
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  try { soundEngine.playClick(); } catch (e) {}
                  onOpenStickerVault();
                  onClose();
                }}
                className="py-1.5 px-3 bg-[#FFFDF0] hover:bg-[#FDC800] border-2 border-black rounded-xl font-mono text-xs font-black uppercase text-black shadow-[1.5px_1.5px_0px_#000000] cursor-pointer flex items-center gap-1.5 shrink-0 active:translate-x-px"
              >
                <span>OPEN VAULT</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 5. GUARDIAN SOS & COMPASSIONATE FAMILY TRIAGE PROTOCOL */}
        {/* ========================================================= */}
        {onOpenGuardianContact && (
          <div className="bg-white border-2 border-black rounded-2xl p-4 shadow-[3px_3px_0px_#000000] space-y-2.5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className="w-10 h-10 rounded-xl bg-[#FFE4E4] border-2 border-black flex items-center justify-center shrink-0 shadow-[1px_1px_0px_#000000] text-[#FF4D4D]">
                  <HeartHandshake className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h4 className="font-display font-black text-sm uppercase text-black truncate">
                      Guardian SOS &amp; Family Triage
                    </h4>
                    <span className="px-1.5 py-0.5 bg-black text-[#00E599] rounded font-mono text-[9px] font-black uppercase">
                      GCERT 1(A)
                    </span>
                  </div>
                  <p className="text-[11px] font-mono text-neutral-600 truncate">
                    Compassionate family check-ins during acute burnout
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  try { soundEngine.playClick(); } catch (e) {}
                  onOpenGuardianContact();
                }}
                className="py-1.5 px-3 bg-[#FF4D4D] hover:bg-red-500 text-white border-2 border-black rounded-xl font-mono text-xs font-black uppercase shadow-[1.5px_1.5px_0px_#000000] cursor-pointer flex items-center gap-1.5 shrink-0 active:translate-x-px"
              >
                <span>CONFIG SOS</span>
                <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 6. AI GHOSTWRITER LANGUAGE & DIRECTIVES */}
        {/* ========================================================= */}
        <div className="bg-white border-2 border-black rounded-2xl p-4 shadow-[3px_3px_0px_#000000] space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-purple-100 border-2 border-black flex items-center justify-center shrink-0 shadow-[1px_1px_0px_#000000]">
              <Languages className="w-5 h-5 text-purple-900 stroke-[2.5]" />
            </div>
            <div>
              <h4 className="font-display font-black text-sm uppercase text-black">AI Diary Ghostwriter Language</h4>
              <p className="text-[11px] font-mono text-neutral-600">Preserve your native expression &amp; style</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {[
              { id: 'auto', label: 'AUTO-DETECT', desc: 'Preserves your language' },
              { id: 'english', label: 'ENGLISH ONLY', desc: 'Forces clean UK/US English' },
              { id: 'hinglish', label: 'HINGLISH', desc: 'Preserves Hindi/English blend' }
            ].map((lang) => (
              <button
                key={lang.id}
                type="button"
                onClick={() => handleAiLanguageChange(lang.id)}
                className={`py-2 px-1.5 rounded-xl border-2 border-black font-mono text-xs font-black text-center cursor-pointer transition-all ${
                  aiLanguage === lang.id
                    ? 'bg-[#FDC800] text-black shadow-[2px_2px_0px_#000000]'
                    : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-700'
                }`}
              >
                <span className="block">{lang.label}</span>
                <span className="block text-[9px] font-normal text-neutral-600">{lang.desc}</span>
              </button>
            ))}
          </div>

          {/* AI Directives Button */}
          <div className="pt-2 border-t border-black/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-black stroke-[2.5]" />
              <span className="font-mono text-xs font-black uppercase">Tactical AI Directives &amp; Tone</span>
            </div>
            <button
              type="button"
              onClick={() => {
                try { soundEngine.playClick(); } catch (e) {}
                setIsDirectivesModalOpen(true);
              }}
              className="px-3 py-1.5 bg-[#FDC800] border-2 border-black rounded-xl font-mono text-xs font-black uppercase text-black shadow-[1.5px_1.5px_0px_#000000] cursor-pointer"
            >
              CONFIGURE
            </button>
          </div>

          {/* Context Tags Manager */}
          <div className="pt-2 border-t border-black/10 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono font-black uppercase text-neutral-700">
              <span className="flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5" />
                <span>Diary Context Tags ({tagsList.length})</span>
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {tagsList.map(tag => (
                <span
                  key={tag}
                  className="px-2.5 py-1 bg-neutral-100 border border-black rounded-lg font-mono text-[10px] font-bold flex items-center gap-1.5"
                >
                  <span>{tag}</span>
                  <button
                    type="button"
                    onClick={() => handleDeleteTag(tag)}
                    className="hover:text-red-600 cursor-pointer"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <form onSubmit={handleAddTag} className="flex gap-1.5 pt-1">
              <input
                type="text"
                placeholder="New context badge (e.g. Gym Beast)"
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                className="flex-1 px-2.5 py-1.5 bg-neutral-50 border border-black rounded-xl text-xs font-mono font-bold"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-[#00E599] border-2 border-black rounded-xl font-mono text-xs font-black uppercase cursor-pointer"
              >
                + ADD
              </button>
            </form>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 5. STATUTORY INDIAN DPDPA 2023 CHARTER & PRIVACY */}
        {/* ========================================================= */}
        <div className="p-3.5 bg-white border-2 border-black rounded-2xl shadow-[2px_2px_0px_#000000] space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-10 h-10 rounded-xl bg-[#FFFDF5] border-2 border-black flex items-center justify-center shrink-0 shadow-[1px_1px_0px_#000000]">
                <ShieldCheck className="w-5 h-5 text-black stroke-[2.5]" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-display font-black text-sm uppercase truncate text-black">
                    Privacy &amp; DPDPA 2023
                  </h4>
                  <span className="px-2 py-0.5 rounded-full bg-blue-100 border border-black text-[9px] font-mono font-black uppercase text-blue-800">
                    STATUTORY
                  </span>
                </div>
                <p className="text-[11px] font-mono text-neutral-600 truncate">
                  Digital Personal Data Protection Act compliance &amp; legal rights
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                try { soundEngine.playClick(); } catch (e) {}
                setIsPrivacyModalOpen(true);
              }}
              className="py-1.5 px-3 bg-[#FDC800] hover:bg-amber-400 border-2 border-black rounded-xl font-mono text-xs font-black uppercase shadow-[1.5px_1.5px_0px_#000000] cursor-pointer"
            >
              VIEW CHARTER
            </button>
          </div>

          <div className="pt-1">
            <button
              type="button"
              onClick={() => {
                if (onOpenPrivacyPage) {
                  onOpenPrivacyPage();
                  onClose();
                } else if (typeof window !== 'undefined') {
                  window.location.href = '/?view=privacy';
                }
              }}
              className="w-full py-2 px-3 bg-neutral-50 hover:bg-neutral-100 border border-black rounded-xl font-mono text-xs font-bold uppercase text-black flex items-center justify-between cursor-pointer"
            >
              <span>Open Full Privacy Portal Page</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 6. DATA TRANSFER & DEVICE SYNC SUITE */}
        {/* ========================================================= */}
        <div className="space-y-3">
          <div className="text-xs font-mono font-black uppercase text-neutral-700 px-1">
            Data Transfer &amp; Device Synchronization
          </div>

          {/* 6a. Device Sync (Google Account) */}
          <div className="p-3.5 bg-white border-2 border-black rounded-2xl shadow-[2px_2px_0px_#000000] space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className="w-10 h-10 rounded-xl bg-[#00E599] border-2 border-black flex items-center justify-center shrink-0 shadow-[1px_1px_0px_#000000]">
                  <RefreshCw className="w-5 h-5 text-black stroke-[2.5]" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-display font-black text-sm uppercase text-black">
                      Device Sync
                    </h4>
                    {user?.email ? (
                      <span className="px-1.5 py-0.5 bg-[#00E599] border border-black rounded text-[9px] font-mono font-black uppercase text-black shrink-0">
                        GOOGLE ACCOUNT ACTIVE
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 bg-neutral-200 border border-black rounded text-[9px] font-mono font-black uppercase text-neutral-700 shrink-0">
                        SIGN-IN REQUIRED
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] font-mono text-neutral-600">
                    {user?.email
                      ? `Syncs seamlessly with your phone & PC linked to ${user.email}. No QR codes needed.`
                      : 'Connect multiple devices under your Google account for automatic 1-tap synchronization.'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  try { soundEngine.playClick(); } catch (e) {}
                  setP2PModalSection('sync');
                  setIsP2PModalOpen(true);
                }}
                className="py-1.5 px-3 bg-[#00E599] hover:bg-emerald-400 text-black border-2 border-black rounded-xl font-mono text-xs font-black shadow-[1.5px_1.5px_0px_#000000] cursor-pointer transition-all active:scale-95 shrink-0 flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>{user?.email ? 'OPEN DEVICE SYNC' : 'SETUP SYNC (GOOGLE)'}</span>
              </button>
            </div>
          </div>

          {/* 6b. Data Transfer (Direct P2P Beam) */}
          <div className="p-3.5 bg-white border-2 border-black rounded-2xl shadow-[2px_2px_0px_#000000] space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className="w-10 h-10 rounded-xl bg-[#FDC800] border-2 border-black flex items-center justify-center shrink-0 shadow-[1px_1px_0px_#000000]">
                  <Radio className="w-5 h-5 text-black stroke-[2.5]" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-display font-black text-sm uppercase text-black">
                      Data Transfer (Direct Beam)
                    </h4>
                    <span className="px-1.5 py-0.5 bg-neutral-100 border border-black rounded text-[9px] font-mono font-black uppercase text-black shrink-0">
                      GUEST FRIENDLY • ZERO CLOUD
                    </span>
                  </div>
                  <p className="text-[11px] font-mono text-neutral-600">
                    One-time wireless transfer between phone &amp; PC using QR codes. Works for everyone without signing in.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  try { soundEngine.playClick(); } catch (e) {}
                  setP2PModalSection('transfer');
                  setIsP2PModalOpen(true);
                }}
                className="py-1.5 px-3 bg-[#FDC800] hover:bg-yellow-400 text-black border-2 border-black rounded-xl font-mono text-xs font-black shadow-[1.5px_1.5px_0px_#000000] cursor-pointer transition-all active:scale-95 shrink-0 flex items-center justify-center gap-1.5"
              >
                <Radio className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>TRANSFER DATA NOW</span>
              </button>
            </div>
          </div>

          {/* 6c. Mutual Device Safety Net */}
          <div className="p-3.5 bg-white border-2 border-black rounded-2xl shadow-[2px_2px_0px_#000000] space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className="w-10 h-10 rounded-xl bg-[#FFF5C2] border-2 border-black flex items-center justify-center shrink-0 shadow-[1px_1px_0px_#000000]">
                  <Shield className="w-5 h-5 text-black stroke-[2.5]" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-display font-black text-sm uppercase text-black">
                      Mutual Device Safety Net
                    </h4>
                    {peerBackupMeta && peerBackupMeta.hasPayload ? (
                      <span className="px-1.5 py-0.5 bg-[#00E599] border border-black rounded text-[9px] font-mono font-black uppercase text-black shrink-0">
                        BACKUP GUARD ACTIVE
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 bg-neutral-200 border border-black rounded text-[9px] font-mono font-black uppercase text-neutral-700 shrink-0">
                        NOT PAIRED YET
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] font-mono text-neutral-600">
                    {peerBackupMeta && peerBackupMeta.hasPayload
                      ? `Holds a safety backup of ${peerBackupMeta.entryCount} entries from "${peerBackupMeta.peerDeviceName}".`
                      : 'Stores a safety backup of your secondary device. If one device loses data, the other restores it.'}
                  </p>
                </div>
              </div>

              {peerBackupMeta && peerBackupMeta.hasPayload ? (
                <button
                  type="button"
                  onClick={handleRestoreFromPeer}
                  className="py-1.5 px-3 bg-[#FDC800] hover:bg-yellow-400 text-black border-2 border-black rounded-xl font-mono text-xs font-black shadow-[1.5px_1.5px_0px_#000000] cursor-pointer transition-all active:scale-95 shrink-0 flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>RESTORE FROM PAIRED DEVICE</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    try { soundEngine.playClick(); } catch (e) {}
                    setP2PModalSection('transfer');
                    setIsP2PModalOpen(true);
                  }}
                  className="py-1.5 px-3 bg-neutral-100 hover:bg-neutral-200 text-black border-2 border-black rounded-xl font-mono text-xs font-black shadow-[1.5px_1.5px_0px_#000000] cursor-pointer transition-all active:scale-95 shrink-0 flex items-center justify-center gap-1.5"
                >
                  <Radio className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>TRANSFER &amp; PAIR NOW</span>
                </button>
              )}
            </div>

            {peerRestoreMsg && (
              <div className="p-2 bg-[#00E599]/20 border border-black rounded-lg text-xs font-mono font-black text-black">
                {peerRestoreMsg}
              </div>
            )}
          </div>
        </div>

        {/* ========================================================= */}
        {/* 7. DEVICE STORAGE, PROTECTION & STORED DATA FILES INSPECTOR */}
        {/* ========================================================= */}
        <div className="p-3.5 bg-white border-2 border-black rounded-2xl shadow-[3px_3px_0px_#000000] space-y-3">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-[#FFF5C2] border-2 border-black flex items-center justify-center shrink-0 shadow-[1px_1px_0px_#000000]">
                <HardDrive className="w-5 h-5 text-black stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-display font-black text-sm uppercase text-black">
                    Device Storage &amp; Protection
                  </h4>
                  {storageTierState.persisted ? (
                    <span className="px-2 py-0.5 bg-[#00E599] border border-black rounded text-[9px] font-mono font-black uppercase text-black">
                      PROTECTED STORAGE
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-neutral-200 border border-black rounded text-[9px] font-mono font-black uppercase text-neutral-800">
                      STANDARD BROWSER STORAGE
                    </span>
                  )}
                </div>
                <p className="text-[11px] font-mono text-neutral-600">
                  {storageTierState.quotaMb > 0 
                    ? `Device Space: ~${storageTierState.usageKb} KB used of ~${storageTierState.quotaMb} MB available`
                    : 'Your diary entries are preserved securely on your local device.'}
                </p>
              </div>
            </div>
          </div>

          {/* Dedicated Storage Sovereignty Portal Launcher */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => {
                try { soundEngine.playClick(); } catch (e) {}
                if (onOpenStoragePage) {
                  onOpenStoragePage();
                  onClose();
                } else if (typeof window !== 'undefined') {
                  window.location.href = '/?view=storage';
                }
              }}
              className="w-full py-2.5 px-3 bg-[#FDC800] hover:bg-amber-400 border-2 border-black rounded-xl font-mono text-xs font-black uppercase text-black flex items-center justify-between cursor-pointer transition-all shadow-[2px_2px_0px_#000000] active:translate-x-px"
            >
              <div className="flex items-center gap-2">
                <FolderSync className="w-4 h-4 stroke-[2.5]" />
                <span>Open Storage Protection &amp; File Mirror Portal</span>
              </div>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>

          {/* Multi-Format Data Export Studio Launcher */}
          {onOpenExportStudio && (
            <div className="pt-1">
              <button
                type="button"
                onClick={() => {
                  try { soundEngine.playClick(); } catch (e) {}
                  onOpenExportStudio();
                  onClose();
                }}
                className="w-full py-2.5 px-3 bg-[#00E599] hover:bg-emerald-400 border-2 border-black rounded-xl font-mono text-xs font-black uppercase text-black flex items-center justify-between cursor-pointer transition-all shadow-[2px_2px_0px_#000000] active:translate-x-px"
              >
                <div className="flex items-center gap-2">
                  <Download className="w-4 h-4 stroke-[2.5]" />
                  <span>Data Export Studio (CSV, Digest &amp; JSON)</span>
                </div>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          )}


          {/* Stored Data Files Inspector Toggle */}
          <div className="pt-1 border-t border-black/15">
            <button
              type="button"
              onClick={handleToggleInspector}
              className="w-full py-2 px-3 bg-neutral-100 hover:bg-neutral-200 border border-black rounded-xl font-mono text-[11px] font-black uppercase text-black flex items-center justify-between cursor-pointer transition-all shadow-[1px_1px_0px_#000000] active:translate-x-px"
            >
              <div className="flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-black stroke-[2.5]" />
                <span>{isInspectorOpen ? 'Hide Stored Data Files' : 'View Stored Data Files (Memory & Space)'}</span>
              </div>
              <span className="text-[10px] font-mono text-neutral-500">
                {isInspectorOpen ? '▲ COLLAPSE' : '▼ EXPAND'}
              </span>
            </button>

            {/* Expandable Inspector Panel */}
            <AnimatePresence>
              {isInspectorOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-2 p-3 bg-[#FFFDF8] border-2 border-black rounded-xl space-y-2.5 shadow-[2px_2px_0px_#000000] overflow-hidden"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] font-mono">
                    <div className="p-2 bg-white border border-black/20 rounded-lg">
                      <span className="text-neutral-500 font-bold block">STORAGE SANDBOX:</span>
                      <span className="font-black text-black">Browser Origin Sandbox (IndexedDB/localStorage)</span>
                    </div>
                    <div className="p-2 bg-white border border-black/20 rounded-lg">
                      <span className="text-neutral-500 font-bold block">INTERNAL STORAGE KEY:</span>
                      <code className="font-black text-black">{getDbStorageKey(user)}</code>
                    </div>
                    <div className="p-2 bg-white border border-black/20 rounded-lg">
                      <span className="text-neutral-500 font-bold block">TOTAL STORED DAYS:</span>
                      <span className="font-black text-black">
                        {Object.keys(rawDbData?.entries || {}).length} recorded days
                      </span>
                    </div>
                    <div className="p-2 bg-white border border-black/20 rounded-lg">
                      <span className="text-neutral-500 font-bold block">ENCRYPTION STATE:</span>
                      <span className="font-black text-black">
                        {isVaultPinActive() ? 'AES-256 GCM (PIN Vault Active)' : 'Standard Readable JSON (Unencrypted)'}
                      </span>
                    </div>
                  </div>

                  <div className="p-2 bg-amber-50 border border-amber-300 rounded-lg font-mono text-[10px] text-amber-950 font-bold leading-relaxed">
                    <strong>Browser Sandbox Security:</strong> For user safety, web browsers prevent web pages from viewing private OS filesystem folders (e.g. C:\Users\... or Android root). All entries are held in your browser's dedicated storage sandbox. Click Copy or Export to save directly to your physical hard drive.
                  </div>

                  {/* Raw JSON Viewport */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] font-black uppercase text-neutral-600">
                        Live Raw JSON Database:
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyRawDb}
                        className="px-2 py-0.5 bg-white hover:bg-neutral-100 border border-black rounded font-mono text-[10px] font-black uppercase flex items-center gap-1 cursor-pointer"
                      >
                        <Copy className="w-3 h-3 stroke-[2.5]" />
                        <span>{copiedDb ? 'COPIED!' : 'COPY JSON'}</span>
                      </button>
                    </div>
                    <pre className="p-2.5 bg-neutral-900 text-[#00E599] border-2 border-black rounded-xl font-mono text-[10px] max-h-40 overflow-y-auto overflow-x-auto select-all leading-tight">
                      {rawDbData ? JSON.stringify(rawDbData, null, 2) : 'Loading records...'}
                    </pre>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 8. USER DATA & SOVEREIGNTY (Standard Non-Collapsible Cards) */}
        {/* ========================================================= */}
        {/* Card A: Time Machine Snapshots (Restore Data) */}
        <div className="bg-amber-50/85 border-2 border-black rounded-2xl p-4 shadow-[3px_3px_0px_#000000] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-black stroke-[2.5]" />
              <h4 className="font-display font-black text-sm uppercase text-black">Time Machine Snapshots</h4>
            </div>
            <span className="font-mono text-[9px] bg-black text-[#FDC800] px-2 py-0.5 rounded font-black uppercase">
              3 ROLLING COPIES
            </span>
          </div>
          <p className="text-[11px] font-mono text-neutral-700">
            Automated defensive rolling snapshots created on every write. Restore data safely at any time.
          </p>

          {safetyMeta && (
            <div className="p-2.5 bg-white border border-black rounded-xl flex items-center justify-between">
              <div>
                <span className="font-mono text-[10px] font-black uppercase text-amber-900 block">Active Safety Stash</span>
                <span className="font-mono text-[9px] text-neutral-500 block">Pre-restore fallback point</span>
              </div>
              <button
                type="button"
                onClick={handleRevertSafetyStash}
                className="px-2.5 py-1 bg-[#FDC800] border border-black rounded-lg font-mono text-[10px] font-black uppercase cursor-pointer"
              >
                Revert Stash
              </button>
            </div>
          )}

          <div className="space-y-1.5">
            {snapshots.map(snap => (
              <div key={snap.id} className="p-2.5 bg-white border border-black/30 rounded-xl flex items-center justify-between">
                <div>
                  <span className="font-mono text-[10px] font-black block">Snapshot #{snap.id} ({snap.entryCount} entries)</span>
                  <span className="font-mono text-[8px] text-neutral-500 block">{new Date(snap.timestamp).toLocaleTimeString()}</span>
                </div>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => handlePreviewSnapshot(snap.id)}
                    className="px-2 py-0.5 bg-neutral-100 hover:bg-neutral-200 border border-black rounded text-[9px] font-mono font-bold cursor-pointer"
                  >
                    Preview
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRestoreSnapshot(snap.id)}
                    className="px-2 py-0.5 bg-[#00E599] border border-black rounded text-[9px] font-mono font-black uppercase cursor-pointer"
                  >
                    Restore
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Card B: Download & Export Data */}
        <div className="bg-white border-2 border-black rounded-2xl p-4 shadow-[3px_3px_0px_#000000] space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Download className="w-4 h-4 text-black stroke-[2.5]" />
              <h4 className="font-display font-black text-sm uppercase text-black">Download &amp; Export Data</h4>
            </div>
          </div>
          <p className="text-[11px] font-mono text-neutral-600">
            Export your complete diary entries anytime without vendor lock-in.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                try { soundEngine.playClick(); } catch (e) {}
                exportDatabaseBackup(user);
                triggerHaptic('success');
              }}
              className="flex-1 py-2 bg-white hover:bg-neutral-100 border-2 border-black rounded-xl font-mono text-xs font-black uppercase shadow-[1.5px_1.5px_0px_#000000] cursor-pointer"
            >
              Download JSON DB
            </button>
            {onOpenExportStudio && (
              <button
                type="button"
                onClick={() => {
                  try { soundEngine.playClick(); } catch (e) {}
                  onOpenExportStudio();
                  onClose();
                }}
                className="flex-1 py-2 bg-[#00E599] hover:bg-emerald-400 border-2 border-black rounded-xl font-mono text-xs font-black uppercase shadow-[1.5px_1.5px_0px_#000000] cursor-pointer"
              >
                Export Studio (CSV/TXT)
              </button>
            )}
          </div>
        </div>

        {/* Card C: Identity & Cloud Account */}
        <div className="bg-white border-2 border-black rounded-2xl p-4 shadow-[3px_3px_0px_#000000] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cloud className="w-4 h-4 text-black stroke-[2.5]" />
              <h4 className="font-display font-black text-sm uppercase text-black">Identity &amp; Cloud Account</h4>
            </div>
            <span className={`px-2 py-0.5 rounded border border-black text-[9px] font-mono font-black uppercase ${
              user ? 'bg-[#00E599] text-black' : 'bg-neutral-100 text-neutral-600'
            }`}>
              {user ? 'AUTHENTICATED' : 'OFFLINE GUEST'}
            </span>
          </div>

          <p className="text-[11px] font-mono text-neutral-600">
            {user 
              ? `Connected as ${user.displayName || 'Authorized Owner'} (${user.email})`
              : 'Operating in guest local mode. Connect a Google account for cross-device cloud sync.'}
          </p>

          <div className="pt-1">
            {user ? (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Log out of this device? Local diary entries will remain preserved.')) {
                    logoutUser();
                  }
                }}
                className="py-2 px-3 bg-neutral-100 hover:bg-neutral-200 border-2 border-black rounded-xl font-mono text-xs font-black uppercase text-black cursor-pointer shadow-[1.5px_1.5px_0px_#000000] flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>SIGN OUT</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => loginWithGoogle()}
                className="py-2 px-4 bg-[#FDC800] hover:bg-amber-400 border-2 border-black rounded-xl font-mono text-xs font-black uppercase text-black cursor-pointer shadow-[2px_2px_0px_#000000] flex items-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span>SIGN IN WITH GOOGLE</span>
              </button>
            )}
          </div>
        </div>

        {/* Card D: Statutory Indian DPDPA Data Erasure */}
        <div className="bg-red-50/80 border-2 border-red-500 rounded-2xl p-4 shadow-[3px_3px_0px_#ef4444] space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertOctagon className="w-4 h-4 text-red-600 stroke-[2.5]" />
              <h4 className="font-display font-black text-sm uppercase text-red-900">DPDPA Nuclear Data Erasure</h4>
            </div>
          </div>
          <p className="text-[11px] font-mono text-red-800 leading-snug">
            Exercise statutory Right to Erasure under Indian DPDPA 2023. Purges all local storage and Firestore cloud records.
          </p>
          <div className="pt-1">
            <button
              type="button"
              onClick={() => {
                if (onOpenErasurePage) {
                  onOpenErasurePage();
                  onClose();
                } else if (typeof window !== 'undefined') {
                  window.location.href = '/?view=erasure';
                }
              }}
              className="py-2 px-3 bg-red-600 hover:bg-red-700 text-white border-2 border-black rounded-xl font-mono text-xs font-black uppercase shadow-[2px_2px_0px_#000000] cursor-pointer"
            >
              Start DPDPA Data Erasure Protocol
            </button>
          </div>
        </div>

      </main>

      {/* Snapshot Preview Modal */}
      {previewSnapId && previewSnapData && (
        <SnapshotPreviewModal
          isOpen={Boolean(previewSnapId)}
          snapshotId={previewSnapId}
          snapshotData={previewSnapData}
          onClose={() => {
            setPreviewSnapId(null);
            setPreviewSnapData(null);
          }}
          onRestoreConfirm={(id) => handleRestoreSnapshot(id)}
        />
      )}

      {/* Ransom Capsule Vault Management Modal */}
      <Suspense fallback={null}>
        {isCapsuleVaultOpen && (
          <RansomCapsuleModal
            isOpen={isCapsuleVaultOpen}
            onClose={() => setIsCapsuleVaultOpen(false)}
            mode="manage"
          />
        )}
      </Suspense>

      {/* Statutory Privacy Policy Modal */}
      <PrivacyPolicyModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
      />

      {/* Interactive Anti-Burnout Rehabilitation & Stasis Modal */}
      <RehabilitationModal
        isOpen={isRehabModalOpen}
        onClose={() => {
          setIsRehabModalOpen(false);
          setRehabConfig(getRehabilitationConfig());
          if (onSettingsChanged) onSettingsChanged();
          window.dispatchEvent(new Event('storage'));
        }}
      />

      {/* AI Directives Reference Modal */}
      {isDirectivesModalOpen && (
        <AIDirectivesModal
          isOpen={isDirectivesModalOpen}
          onClose={() => setIsDirectivesModalOpen(false)}
          activeDirective={localStorage.getItem('daily_verdict_default_directive') || 'auto'}
          onSelectDirective={(dirId, customText) => {
            localStorage.setItem('daily_verdict_default_directive', dirId);
            if (customText) {
              localStorage.setItem('daily_verdict_custom_prompt', customText.trim());
            }
          }}
          customPrompt={localStorage.getItem('daily_verdict_custom_prompt') || ''}
          onSaveCustomPrompt={(val) => {
            localStorage.setItem('daily_verdict_custom_prompt', val.trim());
          }}
        />
      )}

      {/* 📡 WebRTC P2P Direct Device-to-Device Sync Modal */}
      {isP2PModalOpen && (
        <Suspense fallback={null}>
          <P2PDeviceSyncModal
            isOpen={true}
            onClose={() => {
              setIsP2PModalOpen(false);
              setPeerBackupMeta(getMutualPeerBackupMeta());
            }}
            user={user}
            initialSection={p2pModalSection}
            onLogin={loginWithGoogle}
            onSyncComplete={() => {
              if (onSettingsChanged) onSettingsChanged();
              setPeerBackupMeta(getMutualPeerBackupMeta());
            }}
          />
        </Suspense>
      )}

      {/* 🎭 Daily Mood Icon Themes Studio Modal */}
      {isVerdictGalleryOpen && (
        <div
          className="fixed inset-0 z-100 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6"
          onClick={() => setIsVerdictGalleryOpen(false)}
        >
          <div
            className="bg-[#FFFDF8] border-3 border-black rounded-3xl p-4 sm:p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-[8px_8px_0px_#000000] relative space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b-2 border-black">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#FDC800] border-2 border-black flex items-center justify-center shadow-[1.5px_1.5px_0px_#000000]">
                  <Trophy className="w-4 h-4 text-black stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="font-display font-black text-sm uppercase text-black">
                    Daily Mood Icon Themes
                  </h3>
                  <p className="font-mono text-[9px] font-bold text-neutral-500 uppercase">
                    Vector Themes &amp; Custom Mix Studio
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsVerdictGalleryOpen(false)}
                className="p-1.5 rounded-xl bg-neutral-100 hover:bg-[#FF4D4D] hover:text-white border-2 border-black shadow-[1.5px_1.5px_0px_#000000] cursor-pointer"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

            <VerdictIconGallery isEmbedded={true} />
          </div>
        </div>
      )}
    </div>
  );
}
