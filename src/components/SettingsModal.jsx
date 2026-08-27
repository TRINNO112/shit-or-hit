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
  Clock
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
  DEFAULT_SPHERES
} from '../services/api';
import RadialClockPicker from './RadialClockPicker';
import { Layers, Plus, Trash2 } from 'lucide-react';

export default function SettingsModal({
  isOpen,
  onClose,
  user,
  onOpenIconLab,
  onSettingsChanged
}) {
  const [notificationsOn, setNotificationsOn] = useState(false);
  const [reminderTimeVal, setReminderTimeVal] = useState('21:00');
  const [isClockPickerOpen, setIsClockPickerOpen] = useState(false);
  const [aiLanguage, setAiLanguage] = useState('auto');
  const [notificationMsg, setNotificationMsg] = useState('');

  // Multi-Sphere Settings State
  const [sphereModeOn, setSphereModeOn] = useState(false);
  const [spheresList, setSpheresList] = useState([]);
  const [isAddingSphere, setIsAddingSphere] = useState(false);
  const [newSphereName, setNewSphereName] = useState('');
  const [newSphereIcon, setNewSphereIcon] = useState('⚡');
  const [newSphereColor, setNewSphereColor] = useState('#FDC800');

  useEffect(() => {
    if (isOpen) {
      setNotificationsOn(isNotificationEnabled());
      setReminderTimeVal(getReminderTime());
      setAiLanguage(localStorage.getItem('daily_verdict_ai_language') || 'auto');
      setSphereModeOn(isSphereModeEnabled());
      setSpheresList(getSphereConfig());
      setNotificationMsg('');
      setIsAddingSphere(false);
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

  const handleDeleteCustomSphere = (id) => {
    const updated = spheresList.filter(s => s.id !== id);
    setSpheresList(updated);
    saveSphereConfig(updated);
    if (onSettingsChanged) onSettingsChanged();
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
      desc: 'Custom life classification sphere',
      enabled: true,
      isCustom: true
    };
    const updated = [...spheresList, newSphere];
    setSpheresList(updated);
    saveSphereConfig(updated);
    setNewSphereName('');
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
                className="p-2 rounded-xl bg-white hover:bg-neutral-200 border-2 border-black cursor-pointer shadow-[1.5px_1.5px_0px_#000000] active:scale-95 transition-all"
                title="Close Settings"
              >
                <X className="w-5 h-5 text-black stroke-[2.5]" />
              </button>
            </div>

            {/* Scrollable Settings Body */}
            <div className="space-y-3.5 overflow-y-auto flex-1 pr-1">
              
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
                      <span>Active Life Spheres</span>
                      <span className="text-[10px] text-neutral-500">{spheresList.filter(s => s.enabled).length} Enabled</span>
                    </div>

                    {/* Spheres List */}
                    <div className="space-y-1.5">
                      {spheresList.map((sphere) => (
                        <div
                          key={sphere.id}
                          className={`flex items-center justify-between p-2 rounded-xl border-2 border-black transition-all ${
                            sphere.enabled ? 'bg-[#FFFDF0]' : 'bg-neutral-100 opacity-60'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-base">{sphere.icon}</span>
                            <div>
                              <div className="font-display font-black text-xs uppercase leading-tight">
                                {sphere.name}
                              </div>
                              <div className="text-[9px] font-mono text-neutral-500 leading-tight">
                                {sphere.desc}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {sphere.isCustom && (
                              <button
                                type="button"
                                onClick={() => handleDeleteCustomSphere(sphere.id)}
                                className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg cursor-pointer"
                                title="Delete custom sphere"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => handleToggleSphereItem(sphere.id)}
                              className={`w-6 h-6 rounded-lg border-2 border-black flex items-center justify-center font-mono text-[10px] font-black cursor-pointer transition-all ${
                                sphere.enabled ? 'bg-[#00E599] text-black' : 'bg-white text-transparent'
                              }`}
                            >
                              ✓
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Add Custom Sphere Section */}
                    {isAddingSphere ? (
                      <form onSubmit={handleAddCustomSphere} className="p-3 bg-neutral-50 border-2 border-dashed border-black rounded-xl space-y-2">
                        <div className="text-xs font-mono font-black uppercase text-neutral-800">
                          Add New Life Sphere
                        </div>
                        
                        <div className="flex gap-1.5">
                          <input
                            type="text"
                            placeholder="Emoji (e.g. 🏋️)"
                            value={newSphereIcon}
                            onChange={(e) => setNewSphereIcon(e.target.value)}
                            maxLength={3}
                            className="w-14 px-2 py-1.5 border-2 border-black rounded-lg text-center text-sm bg-white font-mono"
                          />
                          <input
                            type="text"
                            placeholder="Sphere Name (e.g. Fitness & Gym)"
                            value={newSphereName}
                            onChange={(e) => setNewSphereName(e.target.value)}
                            className="flex-1 px-2.5 py-1.5 border-2 border-black rounded-lg text-xs font-bold bg-white font-display uppercase"
                            autoFocus
                          />
                        </div>

                        {/* Color Selector */}
                        <div className="flex items-center gap-2 pt-1">
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
                        onClick={() => setIsAddingSphere(true)}
                        className="w-full py-2 border-2 border-dashed border-black/40 hover:border-black rounded-xl bg-neutral-50 hover:bg-neutral-100 font-mono text-xs font-black text-neutral-700 flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-98"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>+ ADD CUSTOM CLASSIFICATION SPHERE</span>
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
    </>
  );
}
