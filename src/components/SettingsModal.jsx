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
  RotateCcw
} from 'lucide-react';
import { 
  isNotificationSupported, 
  isNotificationEnabled, 
  requestNotificationPermission, 
  disableNotifications,
  getReminderTime,
  setReminderTime
} from '../services/notifications';
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
  onOpenIconLab,
  onOpenDevLab,
  onPreviewSkeleton,
  onSettingsChanged
}) {
  const [notificationsOn, setNotificationsOn] = useState(false);
  const [reminderTimeVal, setReminderTimeVal] = useState('22:00');
  const [notificationMsg, setNotificationMsg] = useState('');
  const [activeTab, setActiveTab] = useState('general'); // 'general' | 'notifications' | 'about'
  const [isClockPickerOpen, setIsClockPickerOpen] = useState(false);
  const [isStickerVaultOpen, setIsStickerVaultOpen] = useState(false);
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

  useEffect(() => {
    if (isOpen) {
      setNotificationsOn(isNotificationEnabled());
      setReminderTimeVal(getReminderTime());
      setAiLanguage(localStorage.getItem('daily_verdict_ai_language') || 'auto');
      setSphereModeOn(isSphereModeEnabled());
      setSpheresList(getSphereConfig());
      setNotificationMsg('');
      setIsAddingSphere(false);
      setEditingSphereId(null);
    }
  }, [isOpen]);

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
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.94, y: 15 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.94, y: 15 }}
            className="w-full max-w-md bg-[#FFFDF5] rounded-3xl border-3 border-black p-5 sm:p-6 shadow-[6px_6px_0px_#000000] space-y-4 max-h-[88vh] flex flex-col"
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
                <X className="w-4 h-4 sm:w-5 sm:h-5 stroke-[3]" />
              </button>
            </div>

            {/* Scrollable Settings Body */}
            <div className="space-y-3.5 overflow-y-auto overflow-x-hidden flex-1 pr-1">
              
              {/* 1. Daily Reminder & Radial Clock Setting */}
              <div className="bg-white border-2 border-black rounded-2xl p-4 shadow-[3px_3px_0px_#000000] space-y-3.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-neutral-100 border-2 border-black flex items-center justify-center">
                      {notificationsOn ? (
                        <Bell className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
                      ) : (
                        <BellOff className="w-4 h-4 text-neutral-500" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-display font-black text-sm uppercase">
                        Daily Streak Reminder
                      </h4>
                      <p className="text-[11px] font-mono text-neutral-600">
                        Evening alert if today's log is empty
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleToggleNotifications}
                    className={`px-3 py-1.5 rounded-xl border-2 border-black font-mono text-xs font-black cursor-pointer transition-all shadow-[1.5px_1.5px_0px_#000000] active:scale-95 ${
                      notificationsOn 
                        ? 'bg-[#00E599] text-black' 
                        : 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300'
                    }`}
                  >
                    {notificationsOn ? 'ACTIVE' : 'OFF'}
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
                      className="px-3 py-1.5 bg-[#FFFDF0] hover:bg-[#FDC800] border-2 border-black rounded-xl font-display font-black text-sm text-black shadow-[1.5px_1.5px_0px_#000000] cursor-pointer flex items-center gap-1.5 active:scale-95 transition-all"
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

                {notificationMsg && (
                  <div className="p-2 bg-neutral-100 border border-black/20 rounded-xl text-[11px] font-mono font-bold text-neutral-800">
                    {notificationMsg}
                  </div>
                )}
              </div>

              {/* 2. AI Ghostwriter Preferred Language */}
              <div className="bg-white border-2 border-black rounded-2xl p-4 shadow-[3px_3px_0px_#000000] space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-neutral-100 border-2 border-black flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-purple-600 stroke-[2.5]" />
                  </div>
                  <div>
                    <h4 className="font-display font-black text-sm uppercase">
                      AI Diary Ghostwriter Language
                    </h4>
                    <p className="text-[11px] font-mono text-neutral-600">
                      Prevent accidental language translation
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-1.5 pt-1">
                  {[
                    { id: 'auto', label: '⚡ Auto-Match', desc: 'Mirror Input' },
                    { id: 'english', label: '🇬🇧 English', desc: 'Strict English' },
                    { id: 'hinglish', label: '🇮🇳 Hinglish', desc: 'Hindi+English' }
                  ].map((lang) => (
                    <button
                      key={lang.id}
                      type="button"
                      onClick={() => handleAiLanguageChange(lang.id)}
                      className={`py-2 px-1 rounded-xl border-2 border-black font-mono text-xs font-black text-center cursor-pointer transition-all ${
                        aiLanguage === lang.id
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

              {/* 3. Segmented Day Matrix (Multi-Sphere Classification Mode) */}
              <div className="bg-white border-2 border-black rounded-2xl p-4 shadow-[3px_3px_0px_#000000] space-y-3.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[#FDC800] border-2 border-black flex items-center justify-center shadow-[1px_1px_0px_#000000]">
                      <Layers className="w-4 h-4 text-black stroke-[2.5]" />
                    </div>
                    <div>
                      <h4 className="font-display font-black text-sm uppercase flex items-center gap-1.5">
                        <span>Segmented Day Matrix</span>
                        <span className="text-[9px] font-mono bg-black text-[#FDC800] px-1.5 py-0.5 rounded font-black">PRO</span>
                      </h4>
                      <p className="text-[11px] font-mono text-neutral-600">
                        Classify Work, Home, Social & Custom spheres
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleToggleSphereMode}
                    className={`px-3 py-1.5 rounded-xl border-2 border-black font-mono text-xs font-black cursor-pointer transition-all shadow-[1.5px_1.5px_0px_#000000] active:scale-95 ${
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
                              <button
                                type="button"
                                onClick={() => handleDeleteSphere(sphere.id)}
                                className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg border border-red-200 cursor-pointer"
                                title="Delete this sphere"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>

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
                      <form onSubmit={handleAddCustomSphere} className="p-3.5 bg-neutral-50 border-2 border-dashed border-black rounded-xl space-y-2.5">
                        <div className="text-xs font-mono font-black uppercase text-neutral-800 flex items-center gap-1.5">
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add New Life Sphere</span>
                        </div>
                        
                        <div>
                          <label className="block text-[10px] font-mono font-bold text-neutral-600 uppercase mb-1">
                            Choose Infographic Icon:
                          </label>
                          <div className="grid grid-cols-6 gap-1 p-1.5 bg-white border-2 border-black rounded-lg max-h-28 overflow-y-auto">
                            {SPHERE_INFOGRAPHIC_ICONS.map(item => {
                              const Svg = item.icon;
                              const isSel = newSphereIcon === item.id;
                              return (
                                <button
                                  key={item.id}
                                  type="button"
                                  onClick={() => setNewSphereIcon(item.id)}
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
                          placeholder="Sphere Name (e.g. Fitness & Gym)"
                          value={newSphereName}
                          onChange={(e) => setNewSphereName(e.target.value)}
                          className="w-full px-2.5 py-1.5 border-2 border-black rounded-lg text-xs font-bold bg-white font-display uppercase"
                          autoFocus
                        />

                        <input
                          type="text"
                          placeholder="Short description (e.g. Workouts & physical training)"
                          value={newSphereDesc}
                          onChange={(e) => setNewSphereDesc(e.target.value)}
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
                                onClick={() => setNewSphereColor(c)}
                                className={`w-5 h-5 rounded-full border-2 border-black cursor-pointer ${
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
              <div className="bg-white border-2 border-black rounded-2xl p-3.5 shadow-[3px_3px_0px_#000000] flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-neutral-100 border-2 border-black flex items-center justify-center">
                    <Cloud className="w-4 h-4 text-blue-600 stroke-[2.5]" />
                  </div>
                  <div>
                    <h4 className="font-display font-black text-sm uppercase">
                      Cloud Sync
                    </h4>
                    <p className="text-[11px] font-mono text-neutral-600">
                      {user ? `Connected as ${user.displayName || 'Trinno'}` : 'Offline Local Storage'}
                    </p>
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-xl border-2 border-black font-mono text-[10px] font-black ${
                  user ? 'bg-[#00E599] text-black' : 'bg-neutral-200 text-neutral-600'
                }`}>
                  {user ? 'SYNCED' : 'LOCAL'}
                </span>
              </div>

              {/* 4. PWA Status */}
              <div className="bg-white border-2 border-black rounded-2xl p-3.5 shadow-[3px_3px_0px_#000000] flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-neutral-100 border-2 border-black flex items-center justify-center">
                    <Smartphone className="w-4 h-4 text-purple-600 stroke-[2.5]" />
                  </div>
                  <div>
                    <h4 className="font-display font-black text-sm uppercase">
                      PWA App Mode
                    </h4>
                    <p className="text-[11px] font-mono text-neutral-600">
                      Android & iOS Standalone Ready
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-xl border-2 border-black bg-[#FDC800] text-black font-mono text-[10px] font-black">
                  PWA v1.0
                </span>
              </div>

              {/* 5. Icon Laboratory & SVG Customizer */}
              <div className="bg-white border-2 border-black rounded-2xl p-3.5 shadow-[3px_3px_0px_#000000] flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#FDC800] border-2 border-black flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-black stroke-[2.5]" />
                  </div>
                  <div>
                    <h4 className="font-display font-black text-sm uppercase">
                      Icon Lab & SVG Studio
                    </h4>
                    <p className="text-[11px] font-mono text-neutral-600">
                      Test, customize & preview PWA app icons
                    </p>
                  </div>
                </div>
                {onOpenIconLab && (
                  <button
                    type="button"
                    onClick={onOpenIconLab}
                    className="py-1.5 px-3 bg-[#00E599] hover:bg-emerald-400 border-2 border-black rounded-xl font-mono text-xs font-black shadow-[1.5px_1.5px_0px_#000000] cursor-pointer transition-all active:scale-95"
                  >
                    OPEN LAB
                  </button>
                )}
              </div>

              {/* 6. Custom Sticker Vault & Mascots */}
              <div className="bg-white border-2 border-black rounded-2xl p-3.5 shadow-[3px_3px_0px_#000000] flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#FDC800] border-2 border-black flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-black stroke-[2.5]" />
                  </div>
                  <div>
                    <h4 className="font-display font-black text-sm uppercase">
                      Sticker & Mascot Vault
                    </h4>
                    <p className="text-[11px] font-mono text-neutral-600">
                      Upload custom PNG stickers for wallpapers & exports
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsStickerVaultOpen(true)}
                  className="py-1.5 px-3 bg-[#FDC800] hover:bg-amber-400 border-2 border-black rounded-xl font-mono text-xs font-black shadow-[1.5px_1.5px_0px_#000000] cursor-pointer transition-all active:scale-95 shrink-0"
                >
                  MANAGE VAULT
                </button>
              </div>

              {/* 7. Developer Academy & Architectural Lab */}
              <div className="bg-white border-2 border-black rounded-2xl p-3.5 shadow-[3px_3px_0px_#000000] flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#00D8F6] border-2 border-black flex items-center justify-center">
                    <Code className="w-4 h-4 text-black stroke-[2.5]" />
                  </div>
                  <div>
                    <h4 className="font-display font-black text-sm uppercase">
                      Developer Academy & Lab
                    </h4>
                    <p className="text-[11px] font-mono text-neutral-600">
                      Learn React state, Canvas 2D math & PWA architectures
                    </p>
                  </div>
                </div>
                {onOpenDevLab && (
                  <button
                    type="button"
                    onClick={onOpenDevLab}
                    className="py-1.5 px-3 bg-[#00D8F6] hover:bg-cyan-400 border-2 border-black rounded-xl font-mono text-xs font-black shadow-[1.5px_1.5px_0px_#000000] cursor-pointer transition-all active:scale-95 shrink-0"
                  >
                    DEV LAB
                  </button>
                )}
              </div>

              {/* 8. Skeleton Screen Inspector */}
              <div className="bg-white border-2 border-black rounded-2xl p-3.5 shadow-[3px_3px_0px_#000000] flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#FF4D6D] border-2 border-black flex items-center justify-center">
                    <Layers className="w-4 h-4 text-white stroke-[2.5]" />
                  </div>
                  <div>
                    <h4 className="font-display font-black text-sm uppercase">
                      Loading Skeletons Tester
                    </h4>
                    <p className="text-[11px] font-mono text-neutral-600">
                      Test and inspect Desktop & Mobile skeleton screens
                    </p>
                  </div>
                </div>
                {onPreviewSkeleton && (
                  <button
                    type="button"
                    onClick={onPreviewSkeleton}
                    className="py-1.5 px-3 bg-[#FF4D6D] hover:bg-rose-500 text-white border-2 border-black rounded-xl font-mono text-xs font-black shadow-[1.5px_1.5px_0px_#000000] cursor-pointer transition-all active:scale-95 shrink-0"
                  >
                    PREVIEW
                  </button>
                )}
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
    </>
  );
}
