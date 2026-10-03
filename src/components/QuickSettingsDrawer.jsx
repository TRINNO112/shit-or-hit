import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings, 
  X, 
  Bell, 
  Layers, 
  Volume2, 
  VolumeX, 
  ShieldCheck, 
  ArrowRight, 
  Sliders, 
  RotateCcw,
  Target,
  RefreshCw,
  Radio
} from 'lucide-react';
import { soundEngine } from '../services/soundEngine';
import { 
  isSphereModeEnabled, 
  setSphereModeEnabled, 
  getSphereConfig, 
  saveSphereConfig,
  DEFAULT_SPHERES
} from '../services/api';
import { isNotificationEnabled, disableNotifications, requestNotificationPermission } from '../services/notifications';
import { VaultPinSettings } from './VaultPinModal';
import { isNonNegotiablesActive } from './NonNegotiableCard';
import { getMutualPeerBackupMeta } from '../services/p2pSyncEngine';

export default function QuickSettingsDrawer({
  isOpen = false,
  onClose = () => {},
  onOpenDetailedSettings = () => {},
  onOpenNotificationStudio = () => {},
  onOpenNonNegotiablesStudio = () => {},
  onOpenSync = null,
  user = null,
  onSettingsChanged = () => {},
  triggerHaptic = () => {}
}) {
  // Notification State
  const [notifActive, setNotifActive] = useState(() => isNotificationEnabled());

  // Multi-Sphere Domain State
  const [sphereMode, setSphereMode] = useState(() => isSphereModeEnabled());
  const [spheresList, setSpheresList] = useState(() => getSphereConfig());
  const [newDomainName, setNewDomainName] = useState('');

  // Sensory State (Tactile Audio only, Mood Banner purged for mobile)
  const [soundEnabled, setSoundEnabled] = useState(() => {
    try {
      return soundEngine.isSoundEnabled ? soundEngine.isSoundEnabled() : false;
    } catch (e) {
      return false;
    }
  });

  // Data Transfer & Peer Backup State
  const [peerBackupMeta, setPeerBackupMeta] = useState(() => getMutualPeerBackupMeta());

  useEffect(() => {
    if (isOpen) {
      setPeerBackupMeta(getMutualPeerBackupMeta());
    }
  }, [isOpen]);

  // Synchronize sphere mode updates from outside
  useEffect(() => {
    const handleSphereUpdate = () => {
      setSphereMode(isSphereModeEnabled());
      setSpheresList(getSphereConfig());
    };
    window.addEventListener('sphere-mode-updated', handleSphereUpdate);
    window.addEventListener('storage', handleSphereUpdate);
    return () => {
      window.removeEventListener('sphere-mode-updated', handleSphereUpdate);
      window.removeEventListener('storage', handleSphereUpdate);
    };
  }, []);

  // Handlers
  const handleToggleNotif = async () => {
    try { soundEngine.playClick(); } catch (e) {}
    if (notifActive) {
      disableNotifications();
      setNotifActive(false);
      triggerHaptic('light');
    } else {
      const granted = await requestNotificationPermission();
      if (granted) {
        setNotifActive(true);
        triggerHaptic('success');
      } else {
        triggerHaptic('warning');
        alert('Please allow notification permissions in your browser settings.');
      }
    }
    if (onSettingsChanged) onSettingsChanged();
  };

  const handleToggleSphereMode = () => {
    try { soundEngine.playClick(); } catch (e) {}
    const next = !sphereMode;
    setSphereMode(next);
    setSphereModeEnabled(next);
    window.dispatchEvent(new Event('sphere-mode-updated'));
    window.dispatchEvent(new Event('storage'));
    if (onSettingsChanged) onSettingsChanged();
    triggerHaptic('medium');
  };

  const handleToggleSphereDomain = (id) => {
    try { soundEngine.playClick(); } catch (e) {}
    const updated = spheresList.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s);
    setSpheresList(updated);
    saveSphereConfig(updated);
    window.dispatchEvent(new Event('sphere-mode-updated'));
    window.dispatchEvent(new Event('storage'));
    if (onSettingsChanged) onSettingsChanged();
    triggerHaptic('light');
  };

  const handleSphereWeightChange = (id, newWeight) => {
    const updated = spheresList.map(s => s.id === id ? { ...s, weight: Number(newWeight) } : s);
    setSpheresList(updated);
    saveSphereConfig(updated);
    window.dispatchEvent(new Event('sphere-mode-updated'));
    window.dispatchEvent(new Event('storage'));
    if (onSettingsChanged) onSettingsChanged();
  };

  const handleAddDomain = (e) => {
    e.preventDefault();
    if (!newDomainName.trim()) return;
    try { soundEngine.playClick(); } catch (e) {}
    const id = newDomainName.trim().toLowerCase().replace(/[^a-z0-9]/g, '_') + '_' + Date.now().toString(36);
    const newDomain = {
      id,
      name: newDomainName.trim(),
      icon: 'Target',
      color: '#00E599',
      desc: `${newDomainName.trim()} Life Domain`,
      weight: 0.25,
      enabled: true
    };
    const updated = [...spheresList, newDomain];
    setSpheresList(updated);
    saveSphereConfig(updated);
    setNewDomainName('');
    window.dispatchEvent(new Event('sphere-mode-updated'));
    window.dispatchEvent(new Event('storage'));
    if (onSettingsChanged) onSettingsChanged();
    triggerHaptic('success');
  };

  const handleResetSpheres = () => {
    if (window.confirm('Reset all life spheres to standard defaults?')) {
      try { soundEngine.playClick(); } catch (e) {}
      const fallback = DEFAULT_SPHERES || [];
      setSpheresList(fallback);
      saveSphereConfig(fallback);
      window.dispatchEvent(new Event('sphere-mode-updated'));
      window.dispatchEvent(new Event('storage'));
      if (onSettingsChanged) onSettingsChanged();
      triggerHaptic('medium');
    }
  };

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    try {
      if (soundEngine.setSoundEnabled) soundEngine.setSoundEnabled(next);
      if (next) soundEngine.playClick();
    } catch (e) {}
    triggerHaptic('light');
    if (onSettingsChanged) onSettingsChanged();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-100 bg-black/75 backdrop-blur-xs flex items-end justify-center p-0"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="w-full max-w-lg bg-[#FFFDF8] border-t-3 border-x-3 sm:border-3 sm:rounded-t-3xl border-black shadow-[0px_-4px_0px_#000000] rounded-t-3xl max-h-[88vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 1. Drag Handle Indicator */}
            <div className="w-12 h-1.5 bg-black/25 rounded-full mx-auto my-2.5 shrink-0" />

            {/* 2. Drawer Header */}
            <header className="px-4 py-3 border-b-2 border-black bg-white flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-[#FDC800] border-2 border-black flex items-center justify-center shadow-[1.5px_1.5px_0px_#000000] shrink-0">
                  <Settings className="w-4 h-4 text-black" />
                </div>
                <div className="min-w-0">
                  <h2 className="font-display font-black text-sm uppercase text-black truncate leading-tight">
                    Quick Controls
                  </h2>
                  <p className="font-mono text-[9px] font-bold text-neutral-500 uppercase truncate">
                    Daily Essentials • 1-Tap Toggles
                  </p>
                </div>
              </div>

              {/* Single Close Button */}
              <button
                type="button"
                onClick={() => {
                  try { soundEngine.playClick(); } catch (e) {}
                  onClose();
                }}
                className="p-1.5 rounded-xl bg-neutral-100 hover:bg-[#FF4D4D] hover:text-white border-2 border-black shadow-[2px_2px_0px_#000000] active:translate-x-px active:translate-y-px transition-colors cursor-pointer shrink-0"
                title="Close"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
              </button>
            </header>

            {/* 3. Quick Settings Body */}
            <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 pb-6">

              {/* A. NOTIFICATIONS: Status Toggle + Direct Studio Portal */}
              <div className="p-3 bg-white border-2 border-black rounded-2xl shadow-[2px_2px_0px_#000000] space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-[#00E599] border-2 border-black flex items-center justify-center shadow-[1px_1px_0px_#000000] shrink-0">
                      <Bell className="w-4 h-4 text-black stroke-[2.5]" />
                    </div>
                    <div className="min-w-0">
                      <span className="font-display font-black text-xs uppercase text-black block truncate">
                        Daily Notifications
                      </span>
                      <span className="font-mono text-[9px] text-neutral-500 block truncate">
                        Streak reminders &amp; lockscreen quick-log
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleToggleNotif}
                    className={`px-3 py-1 rounded-lg border-2 border-black font-mono text-[10px] font-black uppercase transition-all shadow-[1px_1px_0px_#000000] cursor-pointer shrink-0 ${
                      notifActive ? 'bg-[#00E599] text-black' : 'bg-neutral-100 text-neutral-600'
                    }`}
                  >
                    {notifActive ? 'ACTIVE' : 'MUTED'}
                  </button>
                </div>

                {/* Direct 1-Tap Portal to Notification Studio & Preview Lab */}
                <button
                  type="button"
                  onClick={() => {
                    try { soundEngine.playClick(); } catch (e) {}
                    onClose();
                    onOpenNotificationStudio();
                  }}
                  className="w-full py-2 px-3 bg-[#FFFDF0] hover:bg-[#FDC800] border-2 border-black rounded-xl font-mono text-xs font-black uppercase text-black flex items-center justify-between shadow-[1.5px_1.5px_0px_#000000] cursor-pointer active:translate-x-px transition-colors"
                >
                  <span className="flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5" />
                    <span>OPEN NOTIFICATION STUDIO &amp; LAB</span>
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>
              </div>

              {/* B. MULTI-SPHERE MODE STUDIO (Dedicated Box) */}
              <div className="p-3.5 bg-white border-2 border-black rounded-2xl shadow-[2px_2px_0px_#000000] space-y-3">
                {/* Instant Master Toggle Switch */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-[#FDC800] border-2 border-black flex items-center justify-center shadow-[1px_1px_0px_#000000] shrink-0">
                      <Layers className="w-4 h-4 text-black stroke-[2.5]" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-display font-black text-xs uppercase text-black truncate">
                          Multi-Sphere Mode
                        </span>
                        <span className="font-mono text-[8px] bg-black text-[#FDC800] px-1 py-0.2 rounded font-black">
                          PRO
                        </span>
                      </div>
                      <span className="font-mono text-[9px] text-neutral-500 block truncate">
                        Segment day into distinct life spheres
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleToggleSphereMode}
                    className={`px-3 py-1 rounded-lg border-2 border-black font-mono text-[10px] font-black uppercase transition-all shadow-[1px_1px_0px_#000000] cursor-pointer shrink-0 ${
                      sphereMode ? 'bg-[#00E599] text-black ring-1 ring-black' : 'bg-neutral-100 text-neutral-600'
                    }`}
                  >
                    {sphereMode ? 'ENABLED' : 'DISABLED'}
                  </button>
                </div>

                {/* Domain Manager Controls (Visible when Sphere Mode is ENABLED) */}
                {sphereMode && (
                  <div className="pt-2 border-t border-black/10 space-y-2.5">
                    <div className="flex items-center justify-between text-[10px] font-mono font-bold text-neutral-600 uppercase">
                      <span>Configured Life Domains ({spheresList.filter(s => s.enabled).length} Active)</span>
                      <button
                        type="button"
                        onClick={handleResetSpheres}
                        className="text-neutral-500 hover:text-black flex items-center gap-1 cursor-pointer"
                        title="Reset domains to defaults"
                      >
                        <RotateCcw className="w-2.5 h-2.5" />
                        <span>RESET</span>
                      </button>
                    </div>

                    {/* Spheres List with 1-tap toggles & sliders */}
                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                      {spheresList.map(sphere => (
                        <div 
                          key={sphere.id} 
                          className={`p-2 rounded-xl border border-black/30 flex flex-col gap-1.5 transition-colors ${
                            sphere.enabled ? 'bg-amber-50/40' : 'bg-neutral-50 opacity-60'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <button
                              type="button"
                              onClick={() => handleToggleSphereDomain(sphere.id)}
                              className="flex items-center gap-1.5 min-w-0 text-left cursor-pointer"
                            >
                              <span 
                                className="w-2.5 h-2.5 rounded-full shrink-0 border border-black" 
                                style={{ backgroundColor: sphere.color || '#FDC800' }} 
                              />
                              <span className="font-mono text-xs font-black uppercase truncate text-black">
                                {sphere.name}
                              </span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleToggleSphereDomain(sphere.id)}
                              className={`px-1.5 py-0.5 rounded border border-black font-mono text-[9px] font-black uppercase cursor-pointer shrink-0 ${
                                sphere.enabled ? 'bg-[#00E599] text-black' : 'bg-neutral-200 text-neutral-600'
                              }`}
                            >
                              {sphere.enabled ? 'ON' : 'OFF'}
                            </button>
                          </div>

                          {sphere.enabled && (
                            <div className="flex items-center gap-2 pt-0.5">
                              <span className="text-[9px] font-mono text-neutral-500">Weight:</span>
                              <input
                                type="range"
                                min="0.05"
                                max="1.0"
                                step="0.05"
                                value={sphere.weight || 0.25}
                                onChange={(e) => handleSphereWeightChange(sphere.id, e.target.value)}
                                className="flex-1 accent-black h-1 cursor-pointer"
                              />
                              <span className="font-mono text-[9px] font-black text-black w-8 text-right">
                                {Math.round((sphere.weight || 0.25) * 100)}%
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Quick Add Domain Form */}
                    <form onSubmit={handleAddDomain} className="flex items-center gap-1.5 pt-1">
                      <input
                        type="text"
                        placeholder="Add domain (e.g. Deep Work, Fitness)"
                        value={newDomainName}
                        onChange={(e) => setNewDomainName(e.target.value)}
                        className="flex-1 min-w-0 px-2.5 py-1.5 bg-neutral-50 border-2 border-black rounded-xl text-xs font-mono font-bold focus:outline-none placeholder-neutral-400 shadow-[1px_1px_0px_#000000]"
                        style={{ color: '#000000' }}
                      />
                      <button
                        type="submit"
                        disabled={!newDomainName.trim()}
                        className="px-3 py-1.5 bg-[#00E599] hover:bg-emerald-400 disabled:opacity-40 border-2 border-black rounded-xl font-mono text-xs font-black text-black uppercase cursor-pointer shadow-[1px_1px_0px_#000000] active:scale-95 transition-all shrink-0"
                      >
                        + ADD
                      </button>
                    </form>
                  </div>
                )}
              </div>

              {/* C. DAILY NON-NEGOTIABLES & HABIT ANCHORS (Dedicated Box) */}
              <div className="p-3.5 bg-white border-2 border-black rounded-2xl shadow-[2px_2px_0px_#000000] space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-[#00E599] border-2 border-black flex items-center justify-center shadow-[1px_1px_0px_#000000] shrink-0">
                      <ShieldCheck className="w-4 h-4 text-black stroke-[2.5]" />
                    </div>
                    <div className="min-w-0">
                      <span className="font-display font-black text-xs uppercase text-black block truncate">
                        Non-Negotiables Studio
                      </span>
                      <span className="font-mono text-[9px] text-neutral-500 block truncate">
                        Deterministic 100%, Hybrid 50/50 &amp; Checklist scoring
                      </span>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded border border-black text-[9px] font-mono font-black uppercase shrink-0 ${
                    isNonNegotiablesActive() ? 'bg-[#00E599] text-black' : 'bg-neutral-200 text-neutral-600'
                  }`}>
                    {isNonNegotiablesActive() ? 'ACTIVE' : 'OFF'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    try { soundEngine.playClick(); } catch (e) {}
                    onClose();
                    onOpenNonNegotiablesStudio();
                  }}
                  className="w-full py-2.5 px-3 bg-[#FFFDF0] hover:bg-[#FDC800] border-2 border-black rounded-xl font-mono text-xs font-black uppercase text-black flex items-center justify-between shadow-[1.5px_1.5px_0px_#000000] cursor-pointer active:translate-x-px transition-colors"
                >
                  <span className="flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5" />
                    <span>CONFIGURE HABIT ANCHORS &amp; ALGORITHMS</span>
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>
              </div>

              {/* D. DATA TRANSFER & DEVICE SYNC (High-Impact Fast Access) */}
              <div className="p-3.5 bg-white border-2 border-black rounded-2xl shadow-[2px_2px_0px_#000000] space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-[#FDC800] border-2 border-black flex items-center justify-center shadow-[1px_1px_0px_#000000] shrink-0">
                      <RefreshCw className="w-4 h-4 text-black stroke-[2.5]" />
                    </div>
                    <div className="min-w-0">
                      <span className="font-display font-black text-xs uppercase text-black block truncate">
                        Data Transfer &amp; Device Sync
                      </span>
                      <span className="font-mono text-[9px] text-neutral-500 block truncate">
                        Direct P2P Beam &amp; Google Multi-Device Hub
                      </span>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded border border-black text-[9px] font-mono font-black uppercase shrink-0 ${
                    user?.email ? 'bg-[#00E599] text-black' : (peerBackupMeta?.hasPayload ? 'bg-[#00E599] text-black' : 'bg-neutral-200 text-neutral-700')
                  }`}>
                    {user?.email ? 'GOOGLE SYNC' : (peerBackupMeta?.hasPayload ? 'PEER GUARD' : 'P2P READY')}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      try { soundEngine.playClick(); } catch (e) {}
                      onClose();
                      if (onOpenSync) onOpenSync('sync');
                      else if (typeof window !== 'undefined' && window.__openP2PSync) window.__openP2PSync('sync');
                      else if (typeof window !== 'undefined') window.location.href = '/?view=sync';
                    }}
                    className="w-full py-2.5 px-3 bg-[#00E599] hover:bg-emerald-400 border-2 border-black rounded-xl font-mono text-xs font-black uppercase text-black flex items-center justify-center gap-1.5 shadow-[1.5px_1.5px_0px_#000000] cursor-pointer active:translate-x-px transition-all"
                  >
                    <RefreshCw className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>DEVICE SYNC</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      try { soundEngine.playClick(); } catch (e) {}
                      onClose();
                      if (onOpenSync) onOpenSync('transfer');
                      else if (typeof window !== 'undefined' && window.__openP2PSync) window.__openP2PSync('transfer');
                      else if (typeof window !== 'undefined') window.location.href = '/?view=sync';
                    }}
                    className="w-full py-2.5 px-3 bg-[#FDC800] hover:bg-yellow-400 border-2 border-black rounded-xl font-mono text-xs font-black uppercase text-black flex items-center justify-center gap-1.5 shadow-[1.5px_1.5px_0px_#000000] cursor-pointer active:translate-x-px transition-all"
                  >
                    <Radio className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>DATA TRANSFER</span>
                  </button>
                </div>
              </div>

              {/* E. TACTILE WEB AUDIO (Clean Full-Width Box, Mood Banner Purged) */}
              <div className={`p-3.5 rounded-2xl border-2 border-black shadow-[2px_2px_0px_#000000] flex items-center justify-between transition-all ${
                soundEnabled ? 'bg-[#00E599]/20' : 'bg-white'
              }`}>
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-white border-2 border-black flex items-center justify-center shrink-0">
                    {soundEnabled ? (
                      <Volume2 className="w-4 h-4 text-black stroke-[2.5]" />
                    ) : (
                      <VolumeX className="w-4 h-4 text-neutral-400 stroke-[2.5]" />
                    )}
                  </div>
                  <div>
                    <span className="font-display font-black text-xs uppercase block text-black">Tactile Web Audio</span>
                    <span className="font-mono text-[9px] text-neutral-500 block">Mechanical click &amp; chime oscillators</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleToggleSound}
                  className={`px-3.5 py-1.5 rounded-xl border-2 border-black font-mono text-xs font-black uppercase transition-all shadow-[1.5px_1.5px_0px_#000000] cursor-pointer active:scale-95 ${
                    soundEnabled ? 'bg-[#00E599] text-black' : 'bg-neutral-100 text-neutral-600'
                  }`}
                >
                  {soundEnabled ? 'ON' : 'MUTED'}
                </button>
              </div>

              {/* E. AES-256 PIN VAULT (Fully Integrated & Self-Contained) */}
              <VaultPinSettings onPinUpdated={() => {
                triggerHaptic('success');
                if (onSettingsChanged) onSettingsChanged();
              }} />

              {/* 4. PROMINENT BOTTOM CTA: MORE SETTINGS & ADVANCED ARCHITECTURE */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    try { soundEngine.playClick(); } catch (e) {}
                    onOpenDetailedSettings();
                    onClose();
                  }}
                  className="w-full py-3 px-4 bg-black text-[#FDC800] hover:bg-neutral-900 border-2 border-black rounded-2xl font-mono text-xs font-black uppercase flex items-center justify-between shadow-[3px_3px_0px_#000000] active:translate-x-px active:translate-y-px cursor-pointer"
                >
                  <span>MORE SETTINGS &amp; ARCHITECTURE</span>
                  <ArrowRight className="w-4 h-4 stroke-[3]" />
                </button>
              </div>

            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
