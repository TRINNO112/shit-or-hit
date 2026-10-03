import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  X, 
  Lock, 
  ShieldCheck, 
  HeartHandshake, 
  Bell, 
  Clock, 
  Sliders, 
  Target, 
  Volume2, 
  VolumeX, 
  Download, 
  Sparkles, 
  Send, 
  Check, 
  AlertTriangle, 
  CheckCircle2, 
  User, 
  Trash2, 
  LogIn, 
  RotateCcw, 
  Eye, 
  ArrowRight, 
  Shield, 
  Layers, 
  History, 
  Printer, 
  KeyRound, 
  AlertOctagon, 
  Undo2,
  Calendar
} from 'lucide-react';
import { soundEngine } from '../services/soundEngine';
import { 
  isSphereModeEnabled, 
  setSphereModeEnabled, 
  getSphereConfig, 
  saveSphereConfig,
  isRehabilitationActive,
  getRehabilitationConfig,
  exportEntriesToCsv,
  exportEntriesToDiaryDigest,
  exportDatabaseBackup,
  getRollingSnapshots,
  getSnapshotDetails,
  restoreSnapshot,
  getSafetyStashMeta,
  revertToLiveSafetyStash
} from '../services/api';
import { isBannerEnabled, setBannerEnabled } from './MoodReactionBanner';
import { 
  isNotificationEnabled, 
  requestNotificationPermission, 
  disableNotifications, 
  getReminderTime, 
  setReminderTime, 
  showInstantReminderNotification 
} from '../services/notifications';
import { loginWithGoogle, logoutUser } from '../services/firebase';
import { VaultPinSettings, isVaultPinActive } from './VaultPinModal';

export default function MobileSettingsView({
  user,
  isWhitelisted = false,
  todayStr,
  dayCount = 1,
  startDate,
  entries = {},
  onClose,
  onOpenNotificationStudio,
  onOpenExportStudio,
  onOpenRehab,
  onOpenArchitectureProjection,
  onOpenWallpaperEngine,
  triggerHaptic = () => {}
}) {
  // Active Category Tab
  const [activeCategory, setActiveCategory] = useState('privacy'); // 'privacy' | 'cadence' | 'behavioral' | 'sensory' | 'data' | 'science'

  // Sensory Settings
  const [soundEnabled, setSoundEnabled] = useState(() => {
    try {
      return soundEngine.isSoundEnabled ? soundEngine.isSoundEnabled() : false;
    } catch (e) {
      return false;
    }
  });

  const [bannerEnabled, setBannerState] = useState(() => isBannerEnabled());

  // Notification Settings
  const [notifActive, setNotifActive] = useState(() => isNotificationEnabled());
  const [reminderTimeVal, setReminderTimeVal] = useState(() => getReminderTime() || '21:30');

  // Multi-Sphere Settings
  const [sphereMode, setSphereMode] = useState(() => isSphereModeEnabled());
  const [spheresList, setSpheresList] = useState(() => getSphereConfig());

  // Vault PIN Status
  const [vaultActive, setVaultActive] = useState(() => isVaultPinActive());

  // Behavioral Trilogy Preferences (Stored in LocalStorage)
  const [ransomCapsuleOn, setRansomCapsuleOn] = useState(() => localStorage.getItem('daily_verdict_ransom_capsule') === 'true');
  const [autopsyChamberOn, setAutopsyChamberOn] = useState(() => localStorage.getItem('daily_verdict_autopsy_chamber') === 'true');
  const [receiptOfTruthOn, setReceiptOfTruthOn] = useState(() => localStorage.getItem('daily_verdict_receipt_truth') === 'true');

  // Guardian SOS Emergency Contact Settings (Stored in LocalStorage)
  const [guardianName, setGuardianName] = useState(() => localStorage.getItem('daily_verdict_guardian_name') || '');
  const [guardianEmail, setGuardianEmail] = useState(() => localStorage.getItem('daily_verdict_guardian_email') || '');
  const [guardianPhone, setGuardianPhone] = useState(() => localStorage.getItem('daily_verdict_guardian_phone') || '');
  const [guardianSavedFlash, setGuardianSavedFlash] = useState(false);
  const [sosTestSuccess, setSosTestSuccess] = useState(false);

  // Time Machine Snapshots
  const [snapshots, setSnapshots] = useState(() => getRollingSnapshots(user));
  const [safetyStash, setSafetyStash] = useState(() => getSafetyStashMeta(user));
  const [snapshotMsg, setSnapshotMsg] = useState('');

  // Handlers
  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    try {
      if (soundEngine.setSoundEnabled) soundEngine.setSoundEnabled(next);
      if (next) soundEngine.playClick();
    } catch (e) {}
  };

  const handleToggleBanner = () => {
    const next = !bannerEnabled;
    setBannerState(next);
    setBannerEnabled(next);
    try { soundEngine.playClick(); } catch (e) {}
  };

  const handleToggleNotif = async () => {
    try { soundEngine.playClick(); } catch (e) {}
    if (notifActive) {
      disableNotifications();
      setNotifActive(false);
    } else {
      const granted = await requestNotificationPermission();
      setNotifActive(granted);
    }
  };

  const handleSaveReminderTime = (timeStr) => {
    setReminderTimeVal(timeStr);
    setReminderTime(timeStr);
    try { soundEngine.playClick(); } catch (e) {}
  };

  const handleToggleSphereMode = () => {
    const next = !sphereMode;
    setSphereMode(next);
    setSphereModeEnabled(next);
    try { soundEngine.playClick(); } catch (e) {}
  };

  const handleToggleRansomCapsule = () => {
    const next = !ransomCapsuleOn;
    setRansomCapsuleOn(next);
    localStorage.setItem('daily_verdict_ransom_capsule', String(next));
    try { soundEngine.playClick(); } catch (e) {}
  };

  const handleToggleAutopsy = () => {
    const next = !autopsyChamberOn;
    setAutopsyChamberOn(next);
    localStorage.setItem('daily_verdict_autopsy_chamber', String(next));
    try { soundEngine.playClick(); } catch (e) {}
  };

  const handleToggleReceipt = () => {
    const next = !receiptOfTruthOn;
    setReceiptOfTruthOn(next);
    localStorage.setItem('daily_verdict_receipt_truth', String(next));
    try { soundEngine.playClick(); } catch (e) {}
  };

  const handleSaveGuardian = (e) => {
    if (e) e.preventDefault();
    localStorage.setItem('daily_verdict_guardian_name', guardianName);
    localStorage.setItem('daily_verdict_guardian_email', guardianEmail);
    localStorage.setItem('daily_verdict_guardian_phone', guardianPhone);
    setGuardianSavedFlash(true);
    try { soundEngine.playSuccessChime(); } catch (err) {}
    setTimeout(() => setGuardianSavedFlash(false), 2000);
  };

  const handleTestGuardianSOS = () => {
    try { soundEngine.playClick(); } catch (e) {}
    setSosTestSuccess(true);
    const subject = encodeURIComponent(`[Daily Verdict Wellness Notification] Support Check-in for ${user?.displayName || 'Student'}`);
    const body = encodeURIComponent(
      `Dear ${guardianName || 'Guardian'},\n\n` +
      `This is an automated wellness notification from the Daily Verdict behavioral telemetry system.\n\n` +
      `Over recent days, behavioral telemetry indicates compounding cognitive fatigue and academic stress. Rather than disciplinary friction, what they need right now is restful recovery, hydration, and compassionate understanding.\n\n` +
      `Actionable Suggestion: Check in gently with them tonight without discussing marks or deadlines.\n\n` +
      `Warm regards,\nDaily Verdict System`
    );
    if (guardianEmail) {
      window.open(`mailto:${guardianEmail}?subject=${subject}&body=${body}`, '_blank');
    }
    setTimeout(() => setSosTestSuccess(false), 3000);
  };

  const handleRestoreSnapshotMobile = (snapId) => {
    try { soundEngine.playClick(); } catch (e) {}
    const result = restoreSnapshot(snapId, user);
    if (result.success) {
      setSafetyStash(getSafetyStashMeta(user));
      setSnapshotMsg(`Restored Snapshot #${snapId}! Reloading...`);
      setTimeout(() => {
        window.location.reload();
      }, 1200);
    }
  };

  const handleRevertToLiveMobile = () => {
    try { soundEngine.playClick(); } catch (e) {}
    const result = revertToLiveSafetyStash(user);
    if (result.success) {
      setSafetyStash(getSafetyStashMeta(user));
      setSnapshotMsg('Returned to live database! Reloading...');
      setTimeout(() => {
        window.location.reload();
      }, 1200);
    }
  };

  const timePresets = [
    { label: '8:00 PM', value: '20:00' },
    { label: '9:00 PM', value: '21:00' },
    { label: '10:00 PM', value: '22:00' },
    { label: '10:30 PM', value: '22:30' }
  ];

  const categories = [
    { id: 'privacy', label: 'Personal & Privacy', Icon: Lock, badge: vaultActive ? 'PIN ACTIVE' : 'OPEN' },
    { id: 'cadence', label: 'Cadence & Alarms', Icon: Bell, badge: notifActive ? reminderTimeVal : 'OFF' },
    { id: 'behavioral', label: 'Behavioral Modes', Icon: Target, badge: sphereMode ? 'SPHERES' : 'CLASSIC' },
    { id: 'sensory', label: 'Audio & Sensory', Icon: Volume2, badge: soundEnabled ? 'ON' : 'MUTED' },
    { id: 'data', label: 'Data Sovereignty', Icon: Download, badge: 'EXPORTS' },
    { id: 'science', label: 'Science Blueprint', Icon: Sparkles, badge: 'GCERT' }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#FFFDF8] pb-16">
      {/* 🏛️ STICKY TOP APP BAR (Back Button + Category Title + Close X) */}
      <header className="sticky top-0 z-40 bg-white border-b-3 border-black shadow-[0_3px_0px_#000000] px-3.5 sm:px-5 py-3 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={onClose}
          className="px-3 py-1.5 rounded-xl bg-[#FDC800] hover:bg-amber-300 border-2 border-black font-mono text-xs font-black uppercase text-black flex items-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_#000000] active:translate-x-px active:translate-y-px"
        >
          <ChevronLeft className="w-4 h-4 stroke-[3]" />
          <span>BACK TO APP</span>
        </button>

        <div className="text-center min-w-0 flex-1">
          <span className="font-display font-black text-sm uppercase text-black block truncate">
            Settings &amp; Architecture
          </span>
          <span className="font-mono text-[9px] font-bold text-neutral-500 uppercase block">
            {categories.find(c => c.id === activeCategory)?.label}
          </span>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-xl bg-neutral-100 hover:bg-[#FF4D4D] hover:text-white border-2 border-black cursor-pointer shadow-[2px_2px_0px_#000000] active:scale-95 transition-all shrink-0"
          title="Close Settings"
        >
          <X className="w-4 h-4 stroke-[2.5]" />
        </button>
      </header>

      {/* 🧭 HORIZONTAL CATEGORY NAVIGATION BAR */}
      <div className="sticky top-[53px] z-30 bg-[#FFFDF5] border-b-2 border-black px-3 py-2 overflow-x-auto no-scrollbar flex items-center gap-2 shadow-xs">
        {categories.map(({ id, label, Icon, badge }) => (
          <button
            key={id}
            type="button"
            onClick={() => {
              try { soundEngine.playClick(); } catch (e) {}
              triggerHaptic('light');
              setActiveCategory(id);
            }}
            className={`px-3 py-1.5 rounded-xl font-mono text-xs font-black uppercase flex items-center gap-1.5 shrink-0 border-2 border-black transition-all cursor-pointer ${
              activeCategory === id
                ? 'bg-[#FDC800] text-black shadow-[2px_2px_0px_#000000] scale-[1.02]'
                : 'bg-white hover:bg-neutral-100 text-neutral-700 shadow-[1px_1px_0px_#000000]'
            }`}
          >
            <Icon className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>{label}</span>
            <span className="text-[9px] px-1 py-0.2 rounded border border-black/30 bg-black/5 font-black">
              {badge}
            </span>
          </button>
        ))}
      </div>

      {/* 📄 FULL-PAGE SCROLLABLE CONTENT AREA */}
      <main className="flex-1 px-3.5 sm:px-6 py-4 max-w-lg mx-auto w-full space-y-4">

        {/* ================================================================= */}
        {/* 🔒 1. PERSONAL & PRIVACY TAB */}
        {/* ================================================================= */}
        {activeCategory === 'privacy' && (
          <div className="space-y-4 animate-fade-in">
            {/* Account & Partition Status */}
            <div className="p-4 rounded-3xl border-3 border-black bg-white shadow-[4px_4px_0px_#000000] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-[#00E599] border-2 border-black flex items-center justify-center shadow-[1px_1px_0px_#000]">
                    <User className="w-4 h-4 text-black stroke-[2.5]" />
                  </div>
                  <div>
                    <h3 className="font-display font-black text-sm uppercase text-black">
                      Identity &amp; Cloud Sync
                    </h3>
                    <span className="text-[10px] font-mono text-neutral-500 font-bold">
                      Storage Partitioning
                    </span>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded-lg border border-black font-mono text-[9px] font-black uppercase ${
                  isWhitelisted ? 'bg-[#00E599] text-black' : 'bg-amber-100 text-amber-950'
                }`}>
                  {isWhitelisted ? 'WHITELISTED' : 'GUEST / LOCAL'}
                </span>
              </div>

              {user ? (
                <div className="p-3 bg-neutral-50 border-2 border-black/20 rounded-2xl flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <span className="font-display font-black text-xs block text-black truncate">
                      {user.displayName || 'Authorized User'}
                    </span>
                    <span className="font-mono text-[10px] text-neutral-600 truncate block">
                      {user.email}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => logoutUser()}
                    className="px-2.5 py-1 bg-[#FF4D4D] text-white border-2 border-black rounded-xl font-mono text-[10px] font-black uppercase hover:bg-red-600 cursor-pointer shadow-[1px_1px_0px_#000] shrink-0"
                  >
                    SIGN OUT
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => loginWithGoogle()}
                  className="w-full py-2.5 bg-[#00E599] hover:bg-emerald-400 text-black font-display font-black text-xs uppercase rounded-xl border-2 border-black shadow-[2px_2px_0px_#000] cursor-pointer flex items-center justify-center gap-2"
                >
                  <LogIn className="w-4 h-4 stroke-[2.5]" />
                  <span>SIGN IN WITH GOOGLE (SYNC TO PC)</span>
                </button>
              )}
            </div>

            {/* AES-256 PIN Vault Security */}
            <div className="p-4 rounded-3xl border-3 border-black bg-white shadow-[4px_4px_0px_#000000] space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-[#A78BFA] border-2 border-black flex items-center justify-center shadow-[1px_1px_0px_#000]">
                  <Lock className="w-4 h-4 text-black stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="font-display font-black text-sm uppercase text-black">
                    AES-256 Client PIN Vault
                  </h3>
                  <span className="text-[10px] font-mono text-neutral-500 font-bold">
                    PBKDF2 100,000 Rounds Encryption
                  </span>
                </div>
              </div>
              <p className="text-xs font-mono text-neutral-700 leading-snug">
                Lock sensitive diary notes with a 4-digit PIN. Encryption keys never leave this device.
              </p>
              <div className="pt-1 border-t-2 border-black/10">
                <VaultPinSettings onPinUpdated={() => setVaultActive(isVaultPinActive())} />
              </div>
            </div>

            {/* Guardian SOS Family Triage */}
            <form onSubmit={handleSaveGuardian} className="p-4 rounded-3xl border-3 border-black bg-white shadow-[4px_4px_0px_#000000] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-[#FF4D4D] border-2 border-black flex items-center justify-center shadow-[1px_1px_0px_#000]">
                    <HeartHandshake className="w-4 h-4 text-white stroke-[2.5]" />
                  </div>
                  <div>
                    <h3 className="font-display font-black text-sm uppercase text-black">
                      Guardian SOS &amp; Family Triage
                    </h3>
                    <span className="text-[10px] font-mono text-neutral-500 font-bold">
                      Autonomous Burnout Parental Briefing
                    </span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-lg border border-black bg-[#FFF0F0] text-[#FF4D4D] font-mono text-[9px] font-black uppercase">
                  SAFETY
                </span>
              </div>

              <p className="text-xs font-mono text-neutral-700 leading-snug">
                Designate a trusted parent or guardian. When severe cognitive fatigue or slump is detected, the system prepares a compassionate, dignified explanation.
              </p>

              <div className="space-y-2.5 pt-1">
                <div>
                  <label className="font-mono text-[10px] font-black uppercase text-black block mb-1">
                    Guardian Name
                  </label>
                  <input
                    type="text"
                    value={guardianName}
                    onChange={(e) => setGuardianName(e.target.value)}
                    placeholder="e.g., Mom / Dad"
                    className="w-full px-3 py-2 rounded-xl border-2 border-black font-mono text-xs text-black bg-neutral-50 shadow-inner focus:outline-none focus:ring-2 focus:ring-[#FF4D4D]"
                  />
                </div>

                <div>
                  <label className="font-mono text-[10px] font-black uppercase text-black block mb-1">
                    Guardian Email Address
                  </label>
                  <input
                    type="email"
                    value={guardianEmail}
                    onChange={(e) => setGuardianEmail(e.target.value)}
                    placeholder="parent@example.com"
                    className="w-full px-3 py-2 rounded-xl border-2 border-black font-mono text-xs text-black bg-neutral-50 shadow-inner focus:outline-none focus:ring-2 focus:ring-[#FF4D4D]"
                  />
                </div>

                <div>
                  <label className="font-mono text-[10px] font-black uppercase text-black block mb-1">
                    Emergency Phone / WhatsApp
                  </label>
                  <input
                    type="tel"
                    value={guardianPhone}
                    onChange={(e) => setGuardianPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2 rounded-xl border-2 border-black font-mono text-xs text-black bg-neutral-50 shadow-inner focus:outline-none focus:ring-2 focus:ring-[#FF4D4D]"
                  />
                </div>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl border-2 border-black font-display font-black text-xs uppercase bg-[#00E599] text-black shadow-[2px_2px_0px_#000] cursor-pointer active:translate-x-px"
                >
                  {guardianSavedFlash ? 'SAVED SUCCESSFULLY!' : 'SAVE GUARDIAN CONTACT'}
                </button>

                <button
                  type="button"
                  onClick={handleTestGuardianSOS}
                  className="w-full py-2 rounded-xl border-2 border-black font-mono text-xs font-black uppercase bg-[#FFF0F0] text-[#FF4D4D] hover:bg-[#ffe5e5] shadow-[2px_2px_0px_#000] cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{sosTestSuccess ? 'DISPATCH LAUNCHED!' : 'TEST EMERGENCY BRIEFING DISPATCH'}</span>
                </button>
              </div>
            </form>

            {/* Indian DPDPA 2023 Statutory Notice */}
            <div className="p-4 rounded-3xl border-3 border-black bg-neutral-50 shadow-[4px_4px_0px_#000000] space-y-2">
              <span className="px-2 py-0.5 rounded bg-black text-white font-mono text-[10px] font-black uppercase">
                STATUTORY COMPLIANCE: DPDPA 2023
              </span>
              <p className="text-xs font-mono text-neutral-700 leading-relaxed font-bold">
                Under Section 12 &amp; 13 of the Indian Digital Personal Data Protection Act, you possess the absolute right to data sovereignty, grievance redressal, and permanent erasure.
              </p>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* 🔔 2. CADENCE & ALARMS TAB */}
        {/* ================================================================= */}
        {activeCategory === 'cadence' && (
          <div className="space-y-4 animate-fade-in">
            <div className="p-4 rounded-3xl border-3 border-black bg-white shadow-[4px_4px_0px_#000000] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-[#FDC800] border-2 border-black flex items-center justify-center shadow-[1px_1px_0px_#000]">
                    <Bell className="w-4 h-4 text-black stroke-[2.5]" />
                  </div>
                  <div>
                    <h3 className="font-display font-black text-sm uppercase text-black">
                      Daily Check-in Reminder
                    </h3>
                    <span className="text-[10px] font-mono text-neutral-500 font-bold">
                      Lockscreen Notification
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleToggleNotif}
                  className={`px-3 py-1 rounded-xl border-2 border-black font-mono text-xs font-black uppercase shadow-[1.5px_1.5px_0px_#000] cursor-pointer ${
                    notifActive ? 'bg-[#00E599] text-black' : 'bg-neutral-200 text-neutral-600'
                  }`}
                >
                  {notifActive ? 'ENABLED' : 'DISABLED'}
                </button>
              </div>

              <p className="text-xs font-mono text-neutral-700 leading-snug">
                Receive a daily prompt to rate your equilibrium index and reflect on your friction points without opening the app.
              </p>

              {/* Time Presets */}
              <div className="pt-2">
                <span className="font-mono text-[10px] font-black uppercase text-black block mb-1.5">
                  Quick Time Presets:
                </span>
                <div className="grid grid-cols-4 gap-1.5">
                  {timePresets.map(preset => (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() => handleSaveReminderTime(preset.value)}
                      className={`py-1.5 rounded-xl border-2 border-black font-mono text-xs font-black text-center cursor-pointer transition-all ${
                        reminderTimeVal === preset.value
                          ? 'bg-[#FDC800] text-black shadow-[2px_2px_0px_#000]'
                          : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-700'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Time Input */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-neutral-50 border-2 border-black mt-2">
                <span className="font-mono text-xs font-black uppercase text-black">
                  Exact Reminder Time
                </span>
                <input
                  type="time"
                  value={reminderTimeVal}
                  onChange={(e) => handleSaveReminderTime(e.target.value)}
                  className="px-2.5 py-1 rounded-lg border-2 border-black font-mono text-xs font-black bg-white shadow-inner"
                />
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => {
                    try { soundEngine.playClick(); } catch (e) {}
                    showInstantReminderNotification(dayCount);
                  }}
                  className="w-full py-2 bg-neutral-100 hover:bg-neutral-200 border-2 border-black rounded-xl font-mono text-xs font-black uppercase shadow-[2px_2px_0px_#000] cursor-pointer"
                >
                  TEST INSTANT LOCKSCREEN NOTIFICATION
                </button>

                {onOpenNotificationStudio && (
                  <button
                    type="button"
                    onClick={() => {
                      try { soundEngine.playClick(); } catch (e) {}
                      onOpenNotificationStudio();
                    }}
                    className="w-full py-2.5 bg-[#FDC800] hover:bg-amber-300 text-black font-display font-black text-xs uppercase rounded-xl border-2 border-black shadow-[2px_2px_0px_#000] cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Clock className="w-4 h-4 stroke-[2.5]" />
                    <span>OPEN MECHANICAL RADIAL CLOCK DIAL</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* ⚓ 3. BEHAVIORAL FRAMEWORKS TAB */}
        {/* ================================================================= */}
        {activeCategory === 'behavioral' && (
          <div className="space-y-4 animate-fade-in">
            {/* Multi-Sphere Domain Mode */}
            <div className="p-4 rounded-3xl border-3 border-black bg-white shadow-[4px_4px_0px_#000000] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-[#00D4FF] border-2 border-black flex items-center justify-center shadow-[1px_1px_0px_#000]">
                    <Target className="w-4 h-4 text-black stroke-[2.5]" />
                  </div>
                  <div>
                    <h3 className="font-display font-black text-sm uppercase text-black">
                      Multi-Sphere Matrix
                    </h3>
                    <span className="text-[10px] font-mono text-neutral-500 font-bold">
                      Domain-Specific Rating
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleToggleSphereMode}
                  className={`px-3 py-1 rounded-xl border-2 border-black font-mono text-xs font-black uppercase shadow-[1.5px_1.5px_0px_#000] cursor-pointer ${
                    sphereMode ? 'bg-[#00E599] text-black' : 'bg-neutral-200 text-neutral-600'
                  }`}
                >
                  {sphereMode ? 'ACTIVE' : 'OFF'}
                </button>
              </div>

              <p className="text-xs font-mono text-neutral-700 leading-snug">
                Rate your day across 4 distinct domains rather than a single number. Composite equilibrium is mathematically computed.
              </p>

              <div className="space-y-1.5 pt-1">
                {spheresList.map(sp => (
                  <div key={sp.id} className="flex items-center justify-between p-2 rounded-xl bg-neutral-50 border border-black/30">
                    <span className="font-mono text-xs font-black uppercase text-black">
                      {sp.name}
                    </span>
                    <span className="font-mono text-[11px] font-bold text-neutral-500">
                      Weight: {Math.round(sp.weight * 100)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Behavioral Trilogy Toggles */}
            <div className="p-4 rounded-3xl border-3 border-black bg-white shadow-[4px_4px_0px_#000000] space-y-3">
              <h3 className="font-display font-black text-sm uppercase text-black flex items-center gap-2">
                <Sliders className="w-4 h-4 text-black" />
                <span>Behavioral Trilogy Controls</span>
              </h3>

              <div className="space-y-2 pt-1">
                {/* Ransom Capsule */}
                <div className="flex items-center justify-between p-2.5 rounded-xl border border-black/30 bg-neutral-50">
                  <div className="min-w-0 pr-2">
                    <span className="font-mono text-xs font-black uppercase text-black block">
                      Ransom Time-Lock Capsule
                    </span>
                    <span className="font-mono text-[10px] text-neutral-500 block truncate">
                      Wax-sealed letters to future self
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleToggleRansomCapsule}
                    className={`px-2.5 py-1 rounded-lg border border-black font-mono text-[10px] font-black uppercase cursor-pointer ${
                      ransomCapsuleOn ? 'bg-[#00E599] text-black' : 'bg-neutral-200 text-neutral-600'
                    }`}
                  >
                    {ransomCapsuleOn ? 'ON' : 'OFF'}
                  </button>
                </div>

                {/* Autopsy Chamber */}
                <div className="flex items-center justify-between p-2.5 rounded-xl border border-black/30 bg-neutral-50">
                  <div className="min-w-0 pr-2">
                    <span className="font-mono text-xs font-black uppercase text-black block">
                      Post-Mortem Autopsy Chamber
                    </span>
                    <span className="font-mono text-[10px] text-neutral-500 block truncate">
                      Forensic inquest on 1★ and 2★ rough days
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleToggleAutopsy}
                    className={`px-2.5 py-1 rounded-lg border border-black font-mono text-[10px] font-black uppercase cursor-pointer ${
                      autopsyChamberOn ? 'bg-[#00E599] text-black' : 'bg-neutral-200 text-neutral-600'
                    }`}
                  >
                    {autopsyChamberOn ? 'ON' : 'OFF'}
                  </button>
                </div>

                {/* Receipt of Truth */}
                <div className="flex items-center justify-between p-2.5 rounded-xl border border-black/30 bg-neutral-50">
                  <div className="min-w-0 pr-2">
                    <span className="font-mono text-xs font-black uppercase text-black block">
                      Thermal Receipt Slip of Truth
                    </span>
                    <span className="font-mono text-[10px] text-neutral-500 block truncate">
                      Japanese street thermal slip generator
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleToggleReceipt}
                    className={`px-2.5 py-1 rounded-lg border border-black font-mono text-[10px] font-black uppercase cursor-pointer ${
                      receiptOfTruthOn ? 'bg-[#00E599] text-black' : 'bg-neutral-200 text-neutral-600'
                    }`}
                  >
                    {receiptOfTruthOn ? 'ON' : 'OFF'}
                  </button>
                </div>
              </div>

              {onOpenRehab && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      try { soundEngine.playClick(); } catch (e) {}
                      onOpenRehab();
                    }}
                    className="w-full py-2.5 bg-[#E8F5E9] hover:bg-emerald-100 text-[#1B5E20] font-display font-black text-xs uppercase rounded-xl border-2 border-black shadow-[2px_2px_0px_#000] cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Shield className="w-4 h-4 stroke-[2.5]" />
                    <span>OPEN TRANQUILITY SANCTUARY &amp; STASIS</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* 🔊 4. AUDIO & SENSORY TAB */}
        {/* ================================================================= */}
        {activeCategory === 'sensory' && (
          <div className="space-y-4 animate-fade-in">
            <div className="p-4 rounded-3xl border-3 border-black bg-white shadow-[4px_4px_0px_#000000] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-[#FFD000] border-2 border-black flex items-center justify-center shadow-[1px_1px_0px_#000]">
                    <Volume2 className="w-4 h-4 text-black stroke-[2.5]" />
                  </div>
                  <div>
                    <h3 className="font-display font-black text-sm uppercase text-black">
                      Procedural Web Audio
                    </h3>
                    <span className="text-[10px] font-mono text-neutral-500 font-bold">
                      Zero Network Audio
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleToggleSound}
                  className={`px-3 py-1 rounded-xl border-2 border-black font-mono text-xs font-black uppercase shadow-[1.5px_1.5px_0px_#000] cursor-pointer ${
                    soundEnabled ? 'bg-[#00E599] text-black' : 'bg-neutral-200 text-neutral-600'
                  }`}
                >
                  {soundEnabled ? 'ENABLED' : 'MUTED'}
                </button>
              </div>

              <p className="text-xs font-mono text-neutral-700 leading-snug">
                Zero network bandwidth audio. Sine, triangle, and square waveforms synthesized in real-time in device audio hardware.
              </p>

              <div className="space-y-2 pt-1">
                <span className="font-mono text-[11px] font-black uppercase text-black block">
                  Test Oscillator Frequencies:
                </span>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { label: 'Click', fn: () => soundEngine.playClick() },
                    { label: 'Chime', fn: () => soundEngine.playSuccessChime() },
                    { label: 'Haptic', fn: () => triggerHaptic([30, 40, 30]) }
                  ].map(t => (
                    <button
                      key={t.label}
                      type="button"
                      onClick={() => { try { t.fn(); } catch(e){} }}
                      className="py-2 rounded-xl border-2 border-black font-mono text-xs font-black uppercase bg-neutral-100 hover:bg-[#FDC800] cursor-pointer shadow-[1.5px_1.5px_0px_#000]"
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Letterpress Verdict Banner Toggle */}
            <div className="p-4 rounded-3xl border-3 border-black bg-white shadow-[4px_4px_0px_#000000] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display font-black text-sm uppercase text-black">
                    Letterpress Editorial Banner
                  </h3>
                  <span className="text-[10px] font-mono text-neutral-500 font-bold">
                    Deckle-Edge Mood Card Display
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleToggleBanner}
                  className={`px-3 py-1 rounded-xl border-2 border-black font-mono text-xs font-black uppercase shadow-[1.5px_1.5px_0px_#000] cursor-pointer ${
                    bannerEnabled ? 'bg-[#FDC800] text-black' : 'bg-neutral-200 text-neutral-600'
                  }`}
                >
                  {bannerEnabled ? 'ACTIVE' : 'OFF'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* 💾 5. DATA SOVEREIGNTY & BACKUPS TAB */}
        {/* ================================================================= */}
        {activeCategory === 'data' && (
          <div className="space-y-4 animate-fade-in">
            {/* 1-Tap Direct Downloads */}
            <div className="p-4 rounded-3xl border-3 border-black bg-white shadow-[4px_4px_0px_#000000] space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-[#FF9900] border-2 border-black flex items-center justify-center shadow-[1px_1px_0px_#000]">
                  <Download className="w-4 h-4 text-black stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="font-display font-black text-sm uppercase text-black">
                    Direct 1-Tap Data Exports
                  </h3>
                  <span className="text-[10px] font-mono text-neutral-500 font-bold">
                    Zero Cloud Dependency
                  </span>
                </div>
              </div>

              <p className="text-xs font-mono text-neutral-700 leading-snug">
                Export your diary entries, telemetry scores, and forensic records into open standard formats at any time.
              </p>

              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    try { soundEngine.playClick(); } catch (e) {}
                    exportEntriesToCsv(entries, startDate);
                  }}
                  className="w-full py-2.5 bg-neutral-100 hover:bg-[#FDC800] text-black font-mono font-black text-xs uppercase rounded-xl border-2 border-black shadow-[2px_2px_0px_#000] cursor-pointer flex items-center justify-center gap-2 active:translate-x-px"
                >
                  <Download className="w-4 h-4" />
                  <span>DOWNLOAD SPREADSHEET (CSV)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    try { soundEngine.playClick(); } catch (e) {}
                    exportEntriesToDiaryDigest(entries, startDate);
                  }}
                  className="w-full py-2.5 bg-neutral-100 hover:bg-[#00E599] text-black font-mono font-black text-xs uppercase rounded-xl border-2 border-black shadow-[2px_2px_0px_#000] cursor-pointer flex items-center justify-center gap-2 active:translate-x-px"
                >
                  <Download className="w-4 h-4" />
                  <span>DOWNLOAD DIARY DIGEST (MARKDOWN)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    try { soundEngine.playClick(); } catch (e) {}
                    exportDatabaseBackup(startDate, entries);
                  }}
                  className="w-full py-2.5 bg-neutral-100 hover:bg-amber-300 text-black font-mono font-black text-xs uppercase rounded-xl border-2 border-black shadow-[2px_2px_0px_#000] cursor-pointer flex items-center justify-center gap-2 active:translate-x-px"
                >
                  <Download className="w-4 h-4" />
                  <span>DOWNLOAD RAW DATABASE BACKUP (JSON)</span>
                </button>
              </div>
            </div>

            {/* Time Machine Automated Snapshots */}
            <div className="p-4 rounded-3xl border-3 border-black bg-white shadow-[4px_4px_0px_#000000] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-black" />
                  <h3 className="font-display font-black text-sm uppercase text-black">
                    Time Machine Snapshots
                  </h3>
                </div>
                <span className="font-mono text-[9px] font-black uppercase px-2 py-0.5 rounded bg-neutral-200">
                  {snapshots.length} BACKUPS
                </span>
              </div>

              {snapshotMsg && (
                <div className="p-2 bg-[#00E599] border-2 border-black rounded-xl text-xs font-mono font-black uppercase text-black flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{snapshotMsg}</span>
                </div>
              )}

              {safetyStash.exists && (
                <button
                  type="button"
                  onClick={handleRevertToLiveMobile}
                  className="w-full py-2 bg-[#00E599] text-black border-2 border-black rounded-xl font-mono text-xs font-black uppercase cursor-pointer flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_#000]"
                >
                  <Undo2 className="w-3.5 h-3.5 stroke-3" />
                  <span>RETURN TO LIVE DATABASE ({safetyStash.count} ENTRIES)</span>
                </button>
              )}

              <div className="space-y-1.5 pt-1">
                {snapshots.length === 0 ? (
                  <p className="text-xs font-mono text-neutral-500 text-center py-2">
                    No snapshots recorded yet. Snapshots generate automatically on save.
                  </p>
                ) : (
                  snapshots.slice(0, 3).map(snap => (
                    <div key={snap.id} className="flex items-center justify-between p-2 rounded-xl bg-neutral-50 border border-black/30">
                      <div>
                        <span className="font-mono text-xs font-black uppercase text-black block">
                          Snapshot #{snap.id} ({snap.entryCount} Entries)
                        </span>
                        <span className="font-mono text-[10px] text-neutral-500">
                          {new Date(snap.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRestoreSnapshotMobile(snap.id)}
                        className="px-2.5 py-1 bg-[#00E599] hover:bg-emerald-400 text-black border border-black rounded-lg font-mono text-[10px] font-black uppercase cursor-pointer"
                      >
                        Restore
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {onOpenWallpaperEngine && (
              <button
                type="button"
                onClick={() => {
                  try { soundEngine.playClick(); } catch (e) {}
                  onClose();
                  onOpenWallpaperEngine();
                }}
                className="w-full py-3 bg-[#FDC800] hover:bg-amber-400 text-black font-display font-black text-xs uppercase rounded-2xl border-3 border-black shadow-[3px_3px_0px_#000] cursor-pointer flex items-center justify-between px-4"
              >
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 stroke-[2.5]" />
                  <span>365-DAY YEAR IN PIXELS WALLPAPER</span>
                </div>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            )}
          </div>
        )}

        {/* ================================================================= */}
        {/* 🎓 6. SCIENCE FAIR EXHIBITION TAB (GCERT RBVP 2026-27) */}
        {/* ================================================================= */}
        {activeCategory === 'science' && (
          <div className="space-y-4 animate-fade-in">
            <div className="p-4 rounded-3xl border-3 border-black bg-white shadow-[4px_4px_0px_#000000] space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-black text-[#FDC800] border-2 border-black flex items-center justify-center shadow-[1px_1px_0px_#000]">
                  <Sparkles className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="font-display font-black text-sm uppercase text-black">
                    GCERT RBVP 2026-27 Science Fair
                  </h3>
                  <span className="text-[10px] font-mono text-neutral-500 font-bold">
                    Subtheme 1(A): AI for Better Life
                  </span>
                </div>
              </div>

              <p className="text-xs font-mono text-neutral-700 leading-snug">
                Official competition presentation suite. Hand-drawn chalkboard cartoon architecture explaining the 6-stage cognitive telemetry pipeline for judges.
              </p>

              {onOpenArchitectureProjection && (
                <button
                  type="button"
                  onClick={() => {
                    try { soundEngine.playClick(); } catch (e) {}
                    onOpenArchitectureProjection();
                  }}
                  className="w-full py-3 bg-black hover:bg-neutral-800 text-[#FDC800] font-display font-black text-xs uppercase rounded-xl border-2 border-black shadow-[3px_3px_0px_#000] cursor-pointer flex items-center justify-center gap-2 active:translate-x-px active:translate-y-px"
                >
                  <Sparkles className="w-4 h-4 text-[#FDC800]" />
                  <span>LAUNCH ANIMATED SKETCH ARCHITECTURE PROJECTOR</span>
                </button>
              )}
            </div>

            {/* Academic Defense Quick Summary */}
            <div className="p-4 rounded-3xl border-3 border-black bg-neutral-50 shadow-[4px_4px_0px_#000000] space-y-2">
              <span className="px-2 py-0.5 rounded bg-[#FDC800] text-black font-mono text-[10px] font-black uppercase border border-black">
                CORE TECHNICAL DEFENSE
              </span>
              <ul className="text-xs font-mono text-neutral-800 space-y-1.5 font-bold pt-1">
                <li>• 100% Client-Side PBKDF2/AES-GCM Zero-Knowledge Encryption</li>
                <li>• Dynamic Temperature Regulation (0.2 for Autopsy, 0.7 for Sabbatical)</li>
                <li>• Zero-Network Procedural Web Audio Hardware Synthesis</li>
                <li>• Autonomous Guardian SOS Compassionate Burnout Dispatch</li>
              </ul>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
