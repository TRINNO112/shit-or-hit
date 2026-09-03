import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings, 
  X, 
  Bell, 
  BellOff, 
  Cloud, 
  Smartphone, 
  Check, 
  Sparkles, 
  ShieldCheck,
  Moon,
  Info,
  Clock,
  Layers,
  Plus,
  Trash2,
  Pencil,
  RotateCcw,
  Code,
  Zap,
  Target,
  ListOrdered,
  Terminal,
  BookOpen,
  Volume2,
  VolumeX,
  KeyRound,
  Tag,
  Languages,
  Bot,
  Sliders
} from 'lucide-react';
import { 
  isNotificationSupported, 
  isNotificationEnabled, 
  requestNotificationPermission, 
  disableNotifications,
  getReminderTime,
  setReminderTime,
  showInstantReminderNotification
} from '../services/notifications';
import { soundEngine } from '../services/soundEngine';
import { VaultPinSettings } from './VaultPinModal';
import { isNonNegotiablesActive } from './NonNegotiableCard';
import { isBannerEnabled, setBannerEnabled } from './MoodReactionBanner';
import NonNegotiablesStudioModal from './NonNegotiablesStudioModal';
import AIDirectivesModal from './AIDirectivesModal';
import {
  isSphereModeEnabled,
  setSphereModeEnabled,
  getSphereConfig,
  saveSphereConfig,
  DEFAULT_SPHERES,
  getStickerVault,
  getActiveStickerId
} from '../services/api';
import RadialClockPicker from './RadialClockPicker';
import SphereIcon, { SPHERE_INFOGRAPHIC_ICONS } from './SphereIcon';
import StickerVaultModal from './StickerVaultModal';

export default function SettingsModal({
  isOpen,
  onClose,
  user,
  onSettingsChanged
}) {
  const [notificationsOn, setNotificationsOn] = useState(false);
  const [reminderTimeVal, setReminderTimeVal] = useState('22:00');
  const [soundFxOn, setSoundFxOn] = useState(() => soundEngine.isSoundEnabled());
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState('');
  const [activeTab, setActiveTab] = useState('general'); // 'general' | 'notifications' | 'about'
  const [isClockPickerOpen, setIsClockPickerOpen] = useState(false);
  const [isStickerVaultOpen, setIsStickerVaultOpen] = useState(false);
  const [isDirectivesModalOpen, setIsDirectivesModalOpen] = useState(false);
  const [aiLanguage, setAiLanguage] = useState('auto');
  
  // Segmented Multi-Sphere Matrix Settings
  const [sphereModeOn, setSphereModeOn] = useState(false);
  const [spheresList, setSpheresList] = useState([]);
  const [isAddingSphere, setIsAddingSphere] = useState(false);
  const [newSphereName, setNewSphereName] = useState('');
  const [newSphereIcon, setNewSphereIcon] = useState('Briefcase');
  const [newSphereColor, setNewSphereColor] = useState('#FDC800');
  const [newSphereDesc, setNewSphereDesc] = useState('');

  // Editing existing sphere
  const [editingSphereId, setEditingSphereId] = useState(null);
  const [editSphereName, setEditSphereName] = useState('');
  const [editSphereIcon, setEditSphereIcon] = useState('Briefcase');
  const [editSphereColor, setEditSphereColor] = useState('#FDC800');
  const [editSphereDesc, setEditSphereDesc] = useState('');

  // Custom Context Tags Management
  const [tagsList, setTagsList] = useState([]);
  const [newTagInput, setNewTagInput] = useState('');

  const getSavedTags = () => {
    try {
      const saved = localStorage.getItem('daily_verdict_custom_tags');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      'Deep Work',
      'Screen Trap',
      'High Energy',
      'Study Grind',
      'Sleep Deficit',
      'Locked In',
      'Burnout'
    ];
  };

  // Letterpress Verdict Banner Toggle
  const [bannerEnabled, setBannerState] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setNotificationsOn(isNotificationEnabled());
      setReminderTimeVal(getReminderTime());
      setAiLanguage(localStorage.getItem('daily_verdict_ai_language') || 'auto');
      setSphereModeOn(isSphereModeEnabled());
      setSpheresList(getSphereConfig());
      setTagsList(getSavedTags());
      setSoundFxOn(soundEngine.isSoundEnabled());
      setBannerState(isBannerEnabled());
      setNotificationMsg('');
      setIsAddingSphere(false);
      setEditingSphereId(null);
    }
  }, [isOpen]);

  const handleAddTag = (e) => {
    e.preventDefault();
    if (!newTagInput.trim()) return;
    const clean = newTagInput.trim();
    if (tagsList.includes(clean)) return;
    const updated = [...tagsList, clean];
    setTagsList(updated);
    localStorage.setItem('daily_verdict_custom_tags', JSON.stringify(updated));
    setNewTagInput('');
  };

  const handleDeleteTag = (tagToDelete) => {
    const updated = tagsList.filter(t => t !== tagToDelete);
    setTagsList(updated);
    localStorage.setItem('daily_verdict_custom_tags', JSON.stringify(updated));
  };

  const handleToggleSphereMode = () => {
    const next = !sphereModeOn;
    setSphereModeOn(next);
    setSphereModeEnabled(next);
    if (onSettingsChanged) onSettingsChanged();
  };

  const handleToggleSphereItem = (id) => {
    const updated = spheresList.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s);
    setSpheresList(updated);
    saveSphereConfig(updated);
    if (onSettingsChanged) onSettingsChanged();
  };

  const handleDeleteSphere = (id) => {
    const updated = spheresList.filter(s => s.id !== id);
    setSpheresList(updated);
    saveSphereConfig(updated);
    if (onSettingsChanged) onSettingsChanged();
  };

  const handleStartEditSphere = (sphere) => {
    setEditingSphereId(sphere.id);
    setEditSphereName(sphere.name);
    setEditSphereIcon(sphere.icon || '⚡');
    setEditSphereColor(sphere.color || '#FDC800');
    setEditSphereDesc(sphere.desc || '');
    setIsAddingSphere(false);
  };

  const handleSaveEditSphere = (e) => {
    e.preventDefault();
    if (!editSphereName.trim()) return;
    const updated = spheresList.map(s => {
      if (s.id === editingSphereId) {
        return {
          ...s,
          name: editSphereName.trim(),
          icon: editSphereIcon.trim() || '⚡',
          color: editSphereColor,
          desc: editSphereDesc.trim() || s.desc
        };
      }
      return s;
    });
    setSpheresList(updated);
    saveSphereConfig(updated);
    setEditingSphereId(null);
    if (onSettingsChanged) onSettingsChanged();
  };

  const handleResetDefaultSpheres = () => {
    if (window.confirm('Reset all spheres to default 3 domains (Work/School, Home, Social)?')) {
      setSpheresList(DEFAULT_SPHERES);
      saveSphereConfig(DEFAULT_SPHERES);
      setEditingSphereId(null);
      setIsAddingSphere(false);
      if (onSettingsChanged) onSettingsChanged();
    }
  };

  const handleAddCustomSphere = (e) => {
    e.preventDefault();
    if (!newSphereName.trim()) return;
    const newId = `sphere_${Date.now()}_${newSphereName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
    const newSphere = {
      id: newId,
      name: newSphereName.trim(),
      icon: newSphereIcon.trim() || '⚡',
      color: newSphereColor,
      desc: newSphereDesc.trim() || 'Custom life classification sphere',
      enabled: true,
      isCustom: true
    };
    const updated = [...spheresList, newSphere];
    setSpheresList(updated);
    saveSphereConfig(updated);
    setNewSphereName('');
    setNewSphereDesc('');
    setIsAddingSphere(false);
    if (onSettingsChanged) onSettingsChanged();
  };

  const handleAiLanguageChange = (lang) => {
    setAiLanguage(lang);
    localStorage.setItem('daily_verdict_ai_language', lang);
  };

  if (!isOpen) return null;

  const handleToggleNotifications = async () => {
    if (notificationsOn) {
      disableNotifications();
      setNotificationsOn(false);
      setNotificationMsg('Daily reminders disabled.');
    } else {
      const granted = await requestNotificationPermission();
      if (granted) {
        setNotificationsOn(true);
        setNotificationMsg(`✅ Daily reminders active for ${formatDisplayTime(reminderTimeVal)}!`);
      } else {
        setNotificationMsg('⚠️ Permission denied. Please enable notifications in your browser settings.');
      }
    }
  };

  const handleTimeChange = (newTime) => {
    setReminderTimeVal(newTime);
    setReminderTime(newTime);
    if (notificationsOn) {
      setNotificationMsg(`⏰ Reminder time updated to ${formatDisplayTime(newTime)}`);
    }
  };

  const formatDisplayTime = (timeStr) => {
    const [h, m] = (timeStr || '21:00').split(':').map(Number);
    const isPM = h >= 12;
    const hour12 = h % 12 === 0 ? 12 : h % 12;
    return `${hour12}:${String(m).padStart(2, '0')} ${isPM ? 'PM' : 'AM'}`;
  };

  const timePresets = [
    { label: '8:00 PM', value: '20:00' },
    { label: '9:00 PM', value: '21:00' },
    { label: '10:00 PM', value: '22:00' },
    { label: '11:00 PM', value: '23:00' }
  ];

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-6"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.94, y: 15 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.94, y: 15 }}
            className="w-full max-w-2xl lg:max-w-3xl xl:max-w-4xl bg-[#FFFDF5] rounded-3xl border-3 border-black p-4 sm:p-7 shadow-[8px_8px_0px_#000000] space-y-4 h-[94vh] sm:h-auto sm:max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Pinned Header with High-Contrast Desktop & Mobile Close ✕ Button */}
            <div className="flex items-center justify-between border-b-2 border-black/10 pb-3 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#FDC800] border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_#000000]">
                  <Settings className="w-5 h-5 text-black stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="font-display font-black text-lg uppercase leading-none">
                    App Settings
                  </h3>
                  <span className="text-xs font-mono text-neutral-600">
                    Preferences & Clock Reminders
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-2 sm:p-2.5 rounded-xl bg-[#FF4D4D] hover:bg-red-600 border-2 border-black text-black hover:text-white cursor-pointer shadow-[2px_2px_0px_#000000] active:scale-95 transition-all"
                title="Close Settings"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5 stroke-3" />
              </button>
            </div>

            {/* Scrollable Settings Body */}
            <div className="space-y-3.5 overflow-y-auto overflow-x-hidden flex-1 pr-1">              {/* 1. Notifications & Reminder Time */}
              <div className="bg-white border-2 border-black rounded-2xl p-4 shadow-[3px_3px_0px_#000000] space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                    <div className="w-10 h-10 shrink-0 aspect-square rounded-xl bg-[#00E599] border-2 border-black flex items-center justify-center shadow-[1px_1px_0px_#000000]">
                      {notificationsOn ? (
                        <Bell className="w-4 h-4 text-black stroke-[2.5]" />
                      ) : (
                        <BellOff className="w-4 h-4 text-neutral-500 stroke-[2.5]" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-display font-black text-sm uppercase text-black">
                        Daily Streak Reminder
                      </h4>
                      <p className="text-[11px] font-mono text-neutral-600 leading-snug">
                        Evening alert if today's log is empty
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleToggleNotifications}
                    className={`w-full sm:w-auto px-4 py-2 rounded-xl border-2 border-black font-mono text-xs font-black cursor-pointer transition-all shadow-[1.5px_1.5px_0px_#000000] active:scale-95 shrink-0 text-center ${
                      notificationsOn 
                        ? 'bg-[#00E599] text-black' 
                        : 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300'
                    }`}
                  >
                    {notificationsOn ? 'ACTIVE (ON)' : 'MUTED (OFF)'}
                  </button>
                </div>

                {/* ⏰ Radial Clock Trigger & Time Display */}
                <div className="pt-2 border-t border-black/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-neutral-700 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-black stroke-[2.5]" />
                      <span>REMINDER TIME</span>
                    </span>

                    <button
                      type="button"
                      onClick={() => setIsClockPickerOpen(true)}
                      className="px-3 py-1.5 bg-[#FFFDF0] hover:bg-[#FDC800] border-2 border-black rounded-xl font-display font-black text-sm text-black shadow-[1.5px_1.5px_0px_#000000] cursor-pointer flex items-center gap-1.5 active:scale-95 transition-all shrink-0"
                      title="Open Interactive Clock Dial"
                    >
                      <span>{formatDisplayTime(reminderTimeVal)}</span>
                      <span className="text-[10px] font-mono bg-black text-[#FDC800] px-1 rounded">DIAL</span>
                    </button>
                  </div>

                  {/* Quick-Pick Time Chips */}
                  <div className="grid grid-cols-4 gap-1.5 pt-1">
                    {timePresets.map((preset) => (
                      <button
                        key={preset.value}
                        type="button"
                        onClick={() => handleTimeChange(preset.value)}
                        className={`py-1 rounded-xl border border-black font-mono text-[10px] font-black cursor-pointer transition-all ${
                          reminderTimeVal === preset.value
                            ? 'bg-[#FDC800] text-black shadow-[1.5px_1.5px_0px_#000000] border-2 border-black'
                            : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-600'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 2. Tactile Procedural Sound FX Synthesizer (Default OFF) */}
              <div className="bg-white border-2 border-black rounded-2xl p-4 shadow-[3px_3px_0px_#000000] space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                    <div className="w-10 h-10 shrink-0 aspect-square min-w-10 min-h-10 rounded-xl bg-[#00E599] border-2 border-black flex items-center justify-center shadow-[1px_1px_0px_#000000]">
                      {soundFxOn ? (
                        <Volume2 className="w-4 h-4 text-black stroke-[2.5]" />
                      ) : (
                        <VolumeX className="w-4 h-4 text-black stroke-[2.5]" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-display font-black text-sm uppercase text-black">
                        Tactile Web Audio Sound FX
                      </h4>
                      <p className="text-[11px] font-mono text-neutral-600 leading-snug">
                        Procedural mechanical clicks & rating chimes
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const next = !soundFxOn;
                      setSoundFxOn(next);
                      soundEngine.setSoundEnabled(next);
                    }}
                    className={`w-full sm:w-auto px-4 py-2 rounded-xl border-2 border-black font-mono text-xs font-black cursor-pointer transition-all shadow-[1.5px_1.5px_0px_#000000] active:scale-95 shrink-0 text-center ${
                      soundFxOn 
                        ? 'bg-[#00E599] text-black' 
                        : 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300'
                    }`}
                  >
                    {soundFxOn ? 'ACTIVE (ON)' : 'MUTED (OFF)'}
                  </button>
                </div>
              </div>

              {/* 3. Letterpress Editorial Verdict Banner (PC Screens - Default ON) */}
              <div className="bg-white border-2 border-black rounded-2xl p-4 shadow-[3px_3px_0px_#000000] space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                    <div className="w-10 h-10 shrink-0 aspect-square min-w-10 min-h-10 rounded-xl bg-[#FDC800] border-2 border-black flex items-center justify-center shadow-[1px_1px_0px_#000000]">
                      <Sparkles className="w-4 h-4 text-black stroke-[2.5]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-display font-black text-sm uppercase text-black">
                        Letterpress Verdict Banner (PC)
                      </h4>
                      <p className="text-[11px] font-mono text-neutral-600 leading-snug">
                        Display deckle-edge editorial mood card and wax seal rating on desktop
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const next = !bannerEnabled;
                      setBannerState(next);
                      setBannerEnabled(next);
                    }}
                    className={`w-full sm:w-auto px-4 py-2 rounded-xl border-2 border-black font-mono text-xs font-black cursor-pointer transition-all shadow-[1.5px_1.5px_0px_#000000] active:scale-95 shrink-0 text-center ${
                      bannerEnabled 
                        ? 'bg-[#FDC800] text-black' 
                        : 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300'
                    }`}
                  >
                    {bannerEnabled ? 'ENABLED (ON)' : 'DISABLED (OFF)'}
                  </button>
                </div>
              </div>

              {/* 4. Private 4-Digit Vault PIN Gatekeeper */}
              <VaultPinSettings />

              {/* 4. Daily Non-Negotiables Studio */}
              <div className="bg-white border-2 border-black rounded-2xl p-4 shadow-[3px_3px_0px_#000000] space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                    <div className="w-10 h-10 shrink-0 aspect-square min-w-10 min-h-10 rounded-xl bg-[#00E599] border-2 border-black flex items-center justify-center shadow-[1px_1px_0px_#000000]">
                      <ShieldCheck className="w-4 h-4 text-black stroke-[2.5]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-display font-black text-sm uppercase text-black">
                          Daily Non-Negotiables Studio
                        </h4>
                        <span className={`px-2 py-0.5 rounded-lg border border-black text-[9px] font-mono font-black uppercase ${
                          isNonNegotiablesActive() ? 'bg-[#00E599] text-black' : 'bg-neutral-200 text-neutral-600'
                        }`}>
                          {isNonNegotiablesActive() ? 'ACTIVE' : 'OFF'}
                        </span>
                      </div>
                      <p className="text-[11px] font-mono text-neutral-600 leading-snug">
                        Configure 3 rating modes, habit templates, and economic utils points
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playClick();
                      setIsStudioOpen(true);
                    }}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl border-2 border-black font-mono text-xs font-black bg-[#FDC800] text-black hover:bg-[#ffe169] shadow-[1.5px_1.5px_0px_#000000] cursor-pointer shrink-0 active:scale-95 transition-all flex items-center justify-center gap-1.5 text-center"
                  >
                    <span>CONFIGURE ➔</span>
                  </button>
                </div>
              </div>              

              {/* 5. AI Ghostwriter Preferred Language */}
              <div className="bg-white border-2 border-black rounded-2xl p-4 shadow-[3px_3px_0px_#000000] space-y-3">
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="w-10 h-10 shrink-0 aspect-square rounded-xl bg-purple-50 border-2 border-black flex items-center justify-center shadow-[1px_1px_0px_#000000]">
                    <Languages className="w-4 h-4 text-purple-700 stroke-[2.5]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-display font-black text-sm uppercase truncate">
                      AI Diary Ghostwriter Language
                    </h4>
                    <p className="text-[11px] font-mono text-neutral-600 truncate">
                      Prevent accidental language translation
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'auto', label: '🌐 Auto-Detect', desc: 'Preserves your language' },
                    { id: 'english', label: '🇬🇧 English Only', desc: 'Forces clean UK/US English' },
                    { id: 'hinglish', label: '🇮🇳 Hinglish', desc: 'Preserves Hindi/English blend' }
                  ].map((lang) => (
                    <button
                      key={lang.id}
                      type="button"
                      onClick={() => handleAiLanguageChange(lang.id)}
                      className={`py-2 px-1.5 rounded-xl border-2 border-black font-mono text-xs font-black text-center cursor-pointer transition-all ${
                        (aiLanguage === lang.id || (lang.id === 'english' && aiLanguage === 'en'))
                          ? 'bg-[#FDC800] text-black shadow-[2px_2px_0px_#000000] scale-[1.02]'
                          : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-700'
                      }`}
                    >
                      <span className="block">{lang.label}</span>
                      <span className="block text-[9px] font-normal text-neutral-600">{lang.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 📖 Tactical AI Directives & Style Configuration Card */}
              <div className="bg-white border-2 border-black rounded-2xl p-4 shadow-[3px_3px_0px_#000000] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 shrink-0 aspect-square rounded-xl bg-amber-50 border-2 border-black flex items-center justify-center shadow-[1.5px_1.5px_0px_#000000]">
                    <Bot className="w-5 h-5 text-black stroke-[2.5]" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-display font-black text-sm uppercase truncate">
                        AI Ghostwriter & Directives
                      </h4>
                      <span className="px-1.5 py-0.5 rounded border border-black bg-neutral-100 text-[9px] font-mono font-black uppercase">
                        {localStorage.getItem('daily_verdict_default_directive') === 'root_causes' ? 'Root Causes' : localStorage.getItem('daily_verdict_default_directive') === 'stoic' ? 'Stoic Grit' : localStorage.getItem('daily_verdict_default_directive') === 'bullets' ? 'Action Bullets' : localStorage.getItem('daily_verdict_default_directive') === 'custom' ? 'Custom' : 'Auto Polish'}
                      </span>
                    </div>
                    <p className="text-[11px] font-mono text-neutral-600 truncate">
                      Manage polish tone, view reference guide & custom commands
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playClick();
                    setIsDirectivesModalOpen(true);
                  }}
                  className="px-4 py-2 bg-[#FDC800] hover:bg-amber-400 border-2 border-black rounded-xl font-display font-black text-xs uppercase text-black cursor-pointer shadow-[2px_2px_0px_#000000] active:scale-95 transition-all flex items-center justify-center gap-1.5 shrink-0"
                >
                  <Sliders className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>CONFIGURE AI DIRECTIVES</span>
                </button>
              </div>

              {/* 🏷️ Context Tags Manager Setting */}
              <div className="bg-white border-2 border-black rounded-2xl p-4 shadow-[3px_3px_0px_#000000] space-y-3">
                <div className="flex items-start justify-between gap-2.5">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="w-10 h-10 shrink-0 aspect-square rounded-xl bg-emerald-50 border-2 border-black flex items-center justify-center shadow-[1px_1px_0px_#000000]">
                      <Tag className="w-4 h-4 text-emerald-700 stroke-[2.5]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-display font-black text-sm uppercase truncate">
                        Diary Context Tags
                      </h4>
                      <p className="text-[11px] font-mono text-neutral-600 truncate">
                        Manage 1-tap badges for mobile & web diary
                      </p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-lg border border-black bg-neutral-100 text-black font-mono text-[9px] font-black uppercase shrink-0">
                    {tagsList.length} TAGS
                  </span>
                </div>

                {/* Tags List */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {tagsList.map((tag) => (
                    <div
                      key={tag}
                      className="px-2.5 py-1 bg-neutral-50 border-2 border-black rounded-xl text-[11px] font-mono font-bold text-black flex items-center gap-1.5 shadow-[1px_1px_0px_#000000]"
                    >
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => handleDeleteTag(tag)}
                        className="text-neutral-400 hover:text-red-600 cursor-pointer text-xs font-black"
                        title={`Remove ${tag}`}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add Tag Input Form - strictly bounded */}
                <form onSubmit={handleAddTag} className="flex items-center gap-1.5 pt-1 w-full min-w-0">
                  <input
                    type="text"
                    placeholder="New tag (e.g. Gym Beast)"
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    className="flex-1 min-w-0 px-2.5 py-1.5 bg-neutral-50 border-2 border-black rounded-xl text-xs font-mono font-bold text-black focus:outline-none placeholder:text-neutral-400 shadow-[1px_1px_0px_#000000]"
                  />
                  <button
                    type="submit"
                    disabled={!newTagInput.trim()}
                    className="px-2.5 py-1.5 bg-[#00E599] hover:bg-emerald-400 disabled:opacity-50 border-2 border-black rounded-xl font-display font-black text-xs text-black uppercase cursor-pointer shadow-[1px_1px_0px_#000000] active:scale-95 transition-all shrink-0 whitespace-nowrap"
                  >
                    + ADD TAG
                  </button>
                </form>
              </div>

              {/* 3. Segmented Day Matrix (Multi-Sphere Classification Mode) */}
              <div className="bg-white border-2 border-black rounded-2xl p-4 shadow-[3px_3px_0px_#000000] space-y-3.5">
                <div className="flex items-start justify-between gap-2.5">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="w-10 h-10 shrink-0 aspect-square min-w-10 min-h-10 rounded-xl bg-[#FDC800] border-2 border-black flex items-center justify-center shadow-[1px_1px_0px_#000000]">
                      <Layers className="w-4 h-4 text-black stroke-[2.5]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-display font-black text-sm uppercase flex items-center gap-1.5 truncate">
                        <span>Segmented Day Matrix</span>
                        <span className="text-[9px] font-mono bg-black text-[#FDC800] px-1.5 py-0.5 rounded font-black shrink-0">PRO</span>
                      </h4>
                      <p className="text-[11px] font-mono text-neutral-600 truncate">
                        Classify Work, Home, Social & Custom spheres
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleToggleSphereMode}
                    className={`px-3 py-1.5 rounded-xl border-2 border-black font-mono text-xs font-black cursor-pointer transition-all shadow-[1.5px_1.5px_0px_#000000] active:scale-95 shrink-0 ${
                      sphereModeOn 
                        ? 'bg-[#00E599] text-black' 
                        : 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300'
                    }`}
                  >
                    {sphereModeOn ? 'ACTIVE' : 'OFF'}
                  </button>
                </div>

                {sphereModeOn && (
                  <div className="pt-2 border-t border-black/10 space-y-2.5">
                    <div className="text-[11px] font-mono font-bold text-neutral-700 uppercase flex items-center justify-between">
                      <span>Configured Life Spheres</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-neutral-500">{spheresList.filter(s => s.enabled).length} Enabled</span>
                        <button
                          type="button"
                          onClick={handleResetDefaultSpheres}
                          className="text-[10px] font-mono text-neutral-700 hover:text-black flex items-center gap-1 underline cursor-pointer"
                          title="Reset to 3 standard defaults"
                        >
                          <RotateCcw className="w-2.5 h-2.5" />
                          <span>Reset</span>
                        </button>
                      </div>
                    </div>

                    {/* Spheres List */}
                    <div className="space-y-2">
                      {spheresList.map((sphere) => {
                        const isEditingThis = editingSphereId === sphere.id;

                        if (isEditingThis) {
                          return (
                            <form key={sphere.id} onSubmit={handleSaveEditSphere} className="p-3.5 bg-amber-50 border-2 border-black rounded-xl space-y-2.5">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-mono font-black uppercase text-neutral-800 flex items-center gap-1.5">
                                  <Pencil className="w-3.5 h-3.5" />
                                  <span>Edit Sphere: {sphere.name}</span>
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setEditingSphereId(null)}
                                  className="text-xs font-mono text-neutral-500 hover:text-black cursor-pointer"
                                >
                                  ✕
                                </button>
                              </div>

                              <div>
                                <label className="block text-[10px] font-mono font-bold text-neutral-600 uppercase mb-1">
                                  Select Infographic Icon:
                                </label>
                                <div className="grid grid-cols-6 gap-1 p-1.5 bg-white border-2 border-black rounded-lg max-h-28 overflow-y-auto">
                                  {SPHERE_INFOGRAPHIC_ICONS.map(item => {
                                    const Svg = item.icon;
                                    const isSel = editSphereIcon === item.id;
                                    return (
                                      <button
                                        key={item.id}
                                        type="button"
                                        onClick={() => setEditSphereIcon(item.id)}
                                        className={`p-1.5 rounded flex flex-col items-center justify-center border cursor-pointer transition-all ${
                                          isSel ? 'bg-[#FDC800] border-black shadow-[1px_1px_0px_#000000]' : 'border-transparent hover:bg-neutral-100'
                                        }`}
                                        title={item.label}
                                      >
                                        <Svg className="w-4 h-4 text-black stroke-[2.5]" />
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>

                              <input
                                type="text"
                                placeholder="Sphere Name (e.g. Academics / College)"
                                value={editSphereName}
                                onChange={(e) => setEditSphereName(e.target.value)}
                                className="w-full px-2.5 py-1.5 border-2 border-black rounded-lg text-xs font-bold bg-white font-display uppercase"
                                autoFocus
                              />

                              <input
                                type="text"
                                placeholder="Short description (e.g. Household & personal rest)"
                                value={editSphereDesc}
                                onChange={(e) => setEditSphereDesc(e.target.value)}
                                className="w-full px-2.5 py-1 border-2 border-black rounded-lg text-[11px] bg-white font-mono"
                              />

                              {/* Color Selector */}
                              <div className="flex items-center gap-2 pt-0.5">
                                <span className="text-[10px] font-mono text-neutral-600">Accent:</span>
                                <div className="flex gap-1.5">
                                  {['#FDC800', '#00E599', '#FF8A00', '#FF4D4D', '#A855F7', '#38BDF8'].map(c => (
                                    <button
                                      key={c}
                                      type="button"
                                      onClick={() => setEditSphereColor(c)}
                                      className={`w-5 h-5 rounded-full border-2 border-black cursor-pointer ${
                                        editSphereColor === c ? 'scale-125 ring-2 ring-black' : ''
                                      }`}
                                      style={{ backgroundColor: c }}
                                    />
                                  ))}
                                </div>
                              </div>

                              <div className="flex justify-end gap-1.5 pt-1">
                                <button
                                  type="button"
                                  onClick={() => setEditingSphereId(null)}
                                  className="px-2.5 py-1 text-[11px] font-mono border border-black rounded-lg bg-white hover:bg-neutral-100 cursor-pointer"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="submit"
                                  className="px-3 py-1 text-[11px] font-display font-black uppercase bg-[#00E599] border-2 border-black rounded-lg shadow-[1px_1px_0px_#000000] cursor-pointer active:scale-95"
                                >
                                  Save Changes
                                </button>
                              </div>
                            </form>
                          );
                        }

                        return (
                          <div
                            key={sphere.id}
                            className={`flex items-center justify-between p-2.5 rounded-xl border-2 border-black transition-all ${
                              sphere.enabled ? 'bg-[#FFFDF0]' : 'bg-neutral-100 opacity-60'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div 
                                className="w-8 h-8 rounded-lg border-2 border-black flex items-center justify-center shrink-0 shadow-[1px_1px_0px_#000000]"
                                style={{ backgroundColor: sphere.color || '#FDC800' }}
                              >
                                <SphereIcon icon={sphere.icon} className="w-4 h-4 text-black stroke-[2.5]" />
                              </div>
                              <div className="min-w-0">
                                <div className="font-display font-black text-xs uppercase leading-tight truncate">
                                  {sphere.name}
                                </div>
                                <div className="text-[9px] font-mono text-neutral-500 leading-tight truncate">
                                  {sphere.desc}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0 ml-2">
                              {/* Edit Button */}
                              <button
                                type="button"
                                onClick={() => handleStartEditSphere(sphere)}
                                className="p-1.5 text-neutral-700 hover:text-black hover:bg-black/5 rounded-lg border border-black/20 cursor-pointer"
                                title="Edit sphere name, icon & color"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>

                              {/* Delete Button */}
                              {sphere.isCustom && (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteSphere(sphere.id)}
                                  className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg border border-red-200 cursor-pointer"
                                  title="Delete this sphere"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}

                              {/* Toggle Enable Button */}
                              <button
                                type="button"
                                onClick={() => handleToggleSphereItem(sphere.id)}
                                className={`w-7 h-7 rounded-lg border-2 border-black flex items-center justify-center font-mono text-xs font-black cursor-pointer transition-all ${
                                  sphere.enabled ? 'bg-[#00E599] text-black shadow-[1px_1px_0px_#000000]' : 'bg-white text-transparent'
                                }`}
                                title={sphere.enabled ? 'Enabled' : 'Disabled'}
                              >
                                ✓
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Add Custom Sphere Section */}
                    {isAddingSphere ? (
                      <form onSubmit={handleAddCustomSphere} className="p-3 bg-neutral-100 rounded-xl border-2 border-black space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="font-display font-black text-xs uppercase">Add Life Sphere</span>
                          <button
                            type="button"
                            onClick={() => setIsAddingSphere(false)}
                            className="text-neutral-500 hover:text-black text-xs font-mono cursor-pointer"
                          >
                            ✕
                          </button>
                        </div>

                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="Sphere Name (e.g. Fitness)"
                            value={newSphereName}
                            onChange={(e) => setNewSphereName(e.target.value)}
                            className="flex-1 px-3 py-1.5 text-xs font-mono font-bold border-2 border-black rounded-xl bg-white focus:outline-none"
                            autoFocus
                          />
                          <input
                            type="text"
                            maxLength={2}
                            placeholder="⚡"
                            value={newSphereIcon}
                            onChange={(e) => setNewSphereIcon(e.target.value)}
                            className="w-12 text-center px-1 py-1.5 text-xs font-mono font-bold border-2 border-black rounded-xl bg-white focus:outline-none"
                            title="Emoji icon"
                          />
                        </div>

                        <input
                          type="text"
                          placeholder="Short description (e.g. Work projects, gym)"
                          value={newSphereDesc}
                          onChange={(e) => setNewSphereDesc(e.target.value)}
                          className="w-full px-3 py-1.5 text-[11px] font-mono border-2 border-black rounded-xl bg-white focus:outline-none"
                        />

                        {/* Color Picker Chips */}
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[10px] font-mono text-neutral-600 uppercase">Accent Theme:</span>
                          <div className="flex items-center gap-1.5">
                            {['#FDC800', '#00E599', '#3B82F6', '#EC4899', '#A855F7', '#FF4D4D', '#14B8A6'].map((c) => (
                              <button
                                key={c}
                                type="button"
                                onClick={() => setNewSphereColor(c)}
                                className={`w-5 h-5 rounded-full border border-black cursor-pointer transition-transform ${
                                  newSphereColor === c ? 'scale-125 ring-2 ring-black' : ''
                                }`}
                                style={{ backgroundColor: c }}
                              />
                            ))}
                          </div>
                        </div>

                        <div className="flex justify-end gap-1.5 pt-1">
                          <button
                            type="button"
                            onClick={() => setIsAddingSphere(false)}
                            className="px-2.5 py-1 text-[11px] font-mono border border-black rounded-lg bg-white hover:bg-neutral-100 cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-3 py-1 text-[11px] font-display font-black uppercase bg-[#00E599] border-2 border-black rounded-lg shadow-[1px_1px_0px_#000000] cursor-pointer active:scale-95"
                          >
                            + Save Sphere
                          </button>
                        </div>
                      </form>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingSphere(true);
                          setEditingSphereId(null);
                        }}
                        className="w-full py-2 border-2 border-dashed border-black/40 hover:border-black rounded-xl bg-neutral-50 hover:bg-neutral-100 font-mono text-xs font-black text-neutral-700 flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-98"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>+ ADD NEW CLASSIFICATION SPHERE</span>
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* 3. Cloud Sync Profile */}
              <div className="bg-white border-2 border-black rounded-2xl p-3.5 shadow-[3px_3px_0px_#000000] flex items-center justify-between gap-2.5">
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="w-10 h-10 shrink-0 aspect-square rounded-xl bg-neutral-100 border-2 border-black flex items-center justify-center shadow-[1px_1px_0px_#000000]">
                    <Cloud className="w-4 h-4 text-blue-600 stroke-[2.5]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-display font-black text-sm uppercase truncate">
                      Cloud Sync
                    </h4>
                    <p className="text-[11px] font-mono text-neutral-600 truncate">
                      {user ? `Connected as ${user.displayName || 'Trinno'}` : 'Offline Local Storage'}
                    </p>
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-xl border-2 border-black font-mono text-[10px] font-black shrink-0 ${
                  user ? 'bg-[#00E599] text-black' : 'bg-neutral-200 text-neutral-600'
                }`}>
                  {user ? 'SYNCED' : 'LOCAL'}
                </span>
              </div>

              {/* 4. PWA Status */}
              <div className="bg-white border-2 border-black rounded-2xl p-3.5 shadow-[3px_3px_0px_#000000] flex items-center justify-between gap-2.5">
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="w-10 h-10 shrink-0 aspect-square rounded-xl bg-neutral-100 border-2 border-black flex items-center justify-center shadow-[1px_1px_0px_#000000]">
                    <Smartphone className="w-4 h-4 text-purple-600 stroke-[2.5]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-display font-black text-sm uppercase truncate">
                      PWA App Mode
                    </h4>
                    <p className="text-[11px] font-mono text-neutral-600 truncate">
                      Android & iOS Standalone Ready
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-xl border-2 border-black bg-[#FDC800] text-black font-mono text-[10px] font-black shrink-0">
                  PWA v1.0
                </span>
              </div>

              {/* 5. Custom Sticker Vault & Mascots */}
              <div className="bg-white border-2 border-black rounded-2xl p-3.5 shadow-[3px_3px_0px_#000000] flex items-center justify-between gap-2.5">
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="w-10 h-10 shrink-0 aspect-square rounded-xl bg-[#FDC800] border-2 border-black flex items-center justify-center shadow-[1px_1px_0px_#000000]">
                    <Sparkles className="w-4 h-4 text-black stroke-[2.5]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-display font-black text-sm uppercase truncate">
                      Sticker & Mascot Vault
                    </h4>
                    <p className="text-[11px] font-mono text-neutral-600 truncate">
                      Upload custom PNG stickers
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsStickerVaultOpen(true)}
                  className="py-1.5 px-3 bg-[#FDC800] hover:bg-amber-400 border-2 border-black rounded-xl font-mono text-xs font-black shadow-[1.5px_1.5px_0px_#000000] cursor-pointer transition-all active:scale-95 shrink-0 whitespace-nowrap"
                >
                  MANAGE VAULT
                </button>
              </div>

            </div>

            {/* Pinned Footer */}
            <div className="pt-2 border-t-2 border-black/10 flex justify-end shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="py-2.5 px-6 bg-black text-white hover:bg-neutral-800 font-display font-black text-xs uppercase rounded-xl border-2 border-black shadow-[2px_2px_0px_#000000] cursor-pointer"
              >
                DONE
              </button>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* Radial Dial Clock Picker Modal */}
      <RadialClockPicker
        isOpen={isClockPickerOpen}
        onClose={() => setIsClockPickerOpen(false)}
        initialTime={reminderTimeVal}
        onSave={handleTimeChange}
      />

      {/* Sticker Vault Modal */}
      {isStickerVaultOpen && (
        <StickerVaultModal
          isOpen={isStickerVaultOpen}
          onClose={() => setIsStickerVaultOpen(false)}
        />
      )}

      {/* Dedicated Non-Negotiables Studio Modal */}
      <NonNegotiablesStudioModal
        isOpen={isStudioOpen}
        onClose={() => setIsStudioOpen(false)}
        onSettingsChanged={onSettingsChanged}
      />

      {/* Dedicated AI Directives & Style Configuration Modal */}
      <AIDirectivesModal
        isOpen={isDirectivesModalOpen}
        onClose={() => setIsDirectivesModalOpen(false)}
        activeDirective={localStorage.getItem('daily_verdict_default_directive') || 'auto'}
        onSelectDirective={(dirId, customText) => {
          localStorage.setItem('daily_verdict_default_directive', dirId);
          if (customText !== undefined) {
            localStorage.setItem('daily_verdict_custom_prompt', customText.trim());
          }
          setNotificationMsg(`✅ AI Directive updated: ${dirId.toUpperCase()}`);
          setTimeout(() => setNotificationMsg(''), 2500);
        }}
        customPrompt={localStorage.getItem('daily_verdict_custom_prompt') || ''}
        onSaveCustomPrompt={(val) => {
          localStorage.setItem('daily_verdict_custom_prompt', val.trim());
        }}
      />
    </>
  );
}
