import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HardDrive,
  ShieldCheck,
  Lock,
  Mail,
  FileText,
  CheckCircle2,
  Sparkles,
  Database,
  KeyRound,
  Copy,
  ArrowLeft,
  Zap,
  Download,
  Upload,
  AlertCircle,
  Eye,
  Check,
  RefreshCw,
  FolderSync,
  Info
} from 'lucide-react';
import { soundEngine } from '../services/soundEngine';
import { getDbStorageKey } from '../services/api';
import {
  getStorageStatus,
  requestPersistentStorage
} from '../services/storageManager';
import {
  isFileSystemAccessSupported,
  getFileMirrorFormatPreference,
  setFileMirrorFormatPreference,
  getPersistedFileHandle,
  clearPersistedFileHandle,
  pickDeviceFileMirror,
  writeToFileHandle,
  parseMirrorFileContent,
  triggerManualFileDownload
} from '../services/fileMirrorEngine';

export default function StorageSovereigntyPage({
  onBack,
  user = null,
  entries = {},
  onDataRestored = null
}) {
  const developerEmail = 'kaushtubh457@gmail.com';

  // Storage states
  const [storageState, setStorageState] = useState({
    supported: false,
    persisted: false,
    usageKb: 0,
    quotaMb: 0
  });
  const [persistenceMsg, setPersistenceMsg] = useState('');

  // Device File Mirror states
  const [fsSupported, setFsSupported] = useState(false);
  const [activeHandle, setActiveHandle] = useState(null);
  const [formatPref, setFormatPref] = useState(() => getFileMirrorFormatPreference());
  const [mirrorStatusMsg, setMirrorStatusMsg] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  // Email copying
  const [copiedEmail, setCopiedEmail] = useState(false);

  // Restore & Decryption Station states
  const [restoreStatus, setRestoreStatus] = useState(null);
  const [pendingContainer, setPendingContainer] = useState(null);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [isDecrypting, setIsDecrypting] = useState(false);

  // Raw Database Inspector
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [copiedRaw, setCopiedRaw] = useState(false);

  // Initialize status on mount
  useEffect(() => {
    soundEngine.playClick();
    getStorageStatus().then(status => setStorageState(status));
    setFsSupported(isFileSystemAccessSupported());
    getPersistedFileHandle().then(handle => setActiveHandle(handle));
  }, []);

  const handleRequestPersistence = async () => {
    soundEngine.playClick();
    setPersistenceMsg('Requesting browser eviction protection...');
    const res = await requestPersistentStorage();
    setStorageState(res);
    if (res.persisted) {
      soundEngine.playSuccessChime();
      setPersistenceMsg('Eviction protection granted! Your browser will never auto-delete your data.');
    } else {
      soundEngine.playRoughTone();
      setPersistenceMsg('Browser deferred persistence. Installing as PWA will lock persistence permanently.');
    }
    setTimeout(() => setPersistenceMsg(''), 4500);
  };

  const handleCopyEmail = () => {
    soundEngine.playClick();
    navigator.clipboard.writeText(developerEmail);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  const handleFormatChange = (newFormat) => {
    soundEngine.playClick();
    setFormatPref(newFormat);
    setFileMirrorFormatPreference(newFormat);
  };

  const handleConnectMirror = async () => {
    soundEngine.playClick();
    setMirrorStatusMsg('');
    try {
      const handle = await pickDeviceFileMirror();
      setActiveHandle(handle);
      // Immediately mirror existing entries to the file
      const currentDb = {
        version: 'TRINNO_MIRROR_V1',
        user: user?.email || 'guest',
        updatedAt: new Date().toISOString(),
        entries
      };
      await writeToFileHandle(handle, currentDb, formatPref, pinInput || '0000');
      soundEngine.playSuccessChime();
      setMirrorStatusMsg(`Connected! Mirrored ${Object.keys(entries).length} days directly into ${handle.name}.`);
    } catch (err) {
      if (err.name !== 'AbortError') {
        soundEngine.playRoughTone();
        setMirrorStatusMsg(`Failed to connect file mirror: ${err.message}`);
      }
    }
  };

  const handleDisconnectMirror = async () => {
    soundEngine.playClick();
    await clearPersistedFileHandle();
    setActiveHandle(null);
    setMirrorStatusMsg('Disconnected file mirror. App is now saving only to browser memory.');
    setTimeout(() => setMirrorStatusMsg(''), 4000);
  };

  const handleSyncMirrorNow = async () => {
    if (!activeHandle) return;
    soundEngine.playClick();
    setIsSyncing(true);
    try {
      const currentDb = {
        version: 'TRINNO_MIRROR_V1',
        user: user?.email || 'guest',
        updatedAt: new Date().toISOString(),
        entries
      };
      await writeToFileHandle(activeHandle, currentDb, formatPref, pinInput || '0000');
      soundEngine.playSuccessChime();
      setMirrorStatusMsg(`Successfully synchronized ${Object.keys(entries).length} entries to ${activeHandle.name}!`);
    } catch (err) {
      soundEngine.playRoughTone();
      setMirrorStatusMsg(`Sync error: ${err.message}`);
    } finally {
      setIsSyncing(false);
      setTimeout(() => setMirrorStatusMsg(''), 4500);
    }
  };

  const handleManualDownloadFallback = async () => {
    soundEngine.playClick();
    const currentDb = {
      version: 'TRINNO_MIRROR_V1',
      user: user?.email || 'guest',
      updatedAt: new Date().toISOString(),
      entries
    };
    try {
      await triggerManualFileDownload(currentDb, formatPref, pinInput || '0000');
      soundEngine.playSuccessChime();
      setMirrorStatusMsg('File downloaded directly to your device Downloads folder!');
    } catch (err) {
      soundEngine.playRoughTone();
      setMirrorStatusMsg(`Download failed: ${err.message}`);
    }
  };

  // -------------------------------------------------------------
  // File Upload & Restore Handler
  // -------------------------------------------------------------
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    soundEngine.playClick();
    setRestoreStatus(null);
    setPinError('');
    setPendingContainer(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result;
      try {
        const result = await parseMirrorFileContent(text);
        if (result.needsPin) {
          setPendingContainer(result.encryptedContainer);
          soundEngine.playClick();
        } else if (result.success) {
          applyRestoredData(result.data);
        }
      } catch (err) {
        soundEngine.playRoughTone();
        setRestoreStatus({
          type: 'error',
          message: err.message || 'Corrupted file format.'
        });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleUnlockAndRestore = async () => {
    if (!pinInput || pinInput.length < 4) {
      setPinError('Please enter your 4-digit PIN.');
      soundEngine.playRoughTone();
      return;
    }

    setIsDecrypting(true);
    setPinError('');

    try {
      const { decryptDiaryPayload } = await import('../services/fileMirrorEngine');
      const decryptedData = await decryptDiaryPayload(pendingContainer, pinInput);
      applyRestoredData(decryptedData);
      setPendingContainer(null);
      setPinInput('');
    } catch (err) {
      soundEngine.playRoughTone();
      setPinError(err.message || 'Incorrect PIN. Decryption failed.');
    } finally {
      setIsDecrypting(false);
    }
  };

  const applyRestoredData = (data) => {
    const restoredEntries = data?.entries || {};
    const count = Object.keys(restoredEntries).length;

    if (count === 0) {
      soundEngine.playRoughTone();
      setRestoreStatus({
        type: 'error',
        message: 'The file was decrypted, but contains 0 diary entries.'
      });
      return;
    }

    // Save into active local storage key
    const key = getDbStorageKey(user);
    const existingRaw = localStorage.getItem(key);
    let existingObj = { entries: {} };
    try {
      if (existingRaw) existingObj = JSON.parse(existingRaw);
    } catch (e) {}

    const mergedEntries = { ...existingObj.entries, ...restoredEntries };
    const newDb = { ...existingObj, entries: mergedEntries, updatedAt: new Date().toISOString() };
    localStorage.setItem(key, JSON.stringify(newDb));

    soundEngine.playSuccessChime();
    setRestoreStatus({
      type: 'success',
      message: `Restored ${count} entries into your active diary!`
    });

    if (onDataRestored) {
      onDataRestored(mergedEntries);
    }
  };

  const handleCopyRawData = () => {
    soundEngine.playClick();
    navigator.clipboard.writeText(JSON.stringify({ entries }, null, 2));
    setCopiedRaw(true);
    setTimeout(() => setCopiedRaw(false), 2500);
  };

  return (
    <div className="min-h-screen bg-[#FFFDF8] text-black font-sans selection:bg-[#FDC800] selection:text-black py-8 px-4 sm:px-6 md:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Top Header Navigation */}
        <div className="flex items-center justify-between gap-4 flex-wrap pb-4 border-b-3 border-black">
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2 bg-white hover:bg-neutral-100 border-2 border-black rounded-xl font-mono text-xs font-black uppercase text-black flex items-center gap-2 cursor-pointer transition-all shadow-[2px_2px_0px_#000000] active:translate-x-px active:translate-y-px"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
            <span>Back to Diary</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-[#FDC800] border-2 border-black rounded-xl font-mono text-xs font-black uppercase shadow-[1.5px_1.5px_0px_#000000]">
              Storage Sovereignty Portal
            </span>
          </div>
        </div>

        {/* 1. Developer's Honest Apology & Whitelist Enlistment Letter */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 sm:p-6 bg-[#FFF9E6] border-3 border-black rounded-2xl shadow-[4px_4px_0px_#000000] space-y-4"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FDC800] border-2 border-black flex items-center justify-center shrink-0 shadow-[2px_2px_0px_#000000]">
              <Mail className="w-5 h-5 text-black stroke-[2.5]" />
            </div>
            <div className="space-y-1">
              <h2 className="font-display font-black text-lg uppercase tracking-tight text-black">
                A Personal Note From The Developer
              </h2>
              <span className="font-mono text-xs font-black uppercase text-neutral-600 block">
                Why Firebase Cloud Sync Requires Whitelist Enlistment
              </span>
            </div>
          </div>

          <div className="font-mono text-xs sm:text-sm text-neutral-900 leading-relaxed space-y-3 bg-white/80 p-4 border-2 border-black rounded-xl">
            <p>
              Hey homie, I am <strong>genuinely sorry</strong> that I cannot enable Firebase cloud sync for every single visitor automatically. Cloud databases charge per read/write query, and keeping high-performance cloud databases open to the public without limits risks unsustainable costs.
            </p>
            <p>
              However, <strong>I actively whitelist authentic daily users!</strong> If you want your diary synced seamlessly to Firebase Cloud across all your phones and laptops, simply send me your Google email address.
            </p>
            <p className="text-black font-bold">
              If I find the time to review my inbox, I typically reply within <strong>24 hours</strong> and add your Google account directly to the authorized cloud whitelist.
            </p>
          </div>

          {/* Contact / Mailto Actions */}
          <div className="flex items-center gap-2.5 flex-wrap pt-1">
            <a
              href={`mailto:${developerEmail}?subject=SHIT%20OR%20HIT%20-%20Cloud%20Sync%20Whitelist%20Enlistment%20Request&body=Hey%20Kaustubh%2C%0A%0AI%20would%20love%20to%20apply%20for%20cloud%20sync%20whitelist%20enlistment%20on%20SHIT%20OR%20HIT.%0A%0AMy%20Google%20Account%20Email%3A%20%5BInsert%20your%20Gmail%20here%5D%0A%0AThank%20you!`}
              className="px-4 py-2.5 bg-[#00E599] hover:bg-emerald-400 border-2 border-black rounded-xl font-mono text-xs font-black uppercase text-black flex items-center gap-2 cursor-pointer shadow-[2px_2px_0px_#000000] active:translate-x-px transition-all"
            >
              <Mail className="w-4 h-4 stroke-[2.5]" />
              <span>Apply for Cloud Whitelist (Email Me)</span>
            </a>

            <button
              type="button"
              onClick={handleCopyEmail}
              className="px-4 py-2.5 bg-white hover:bg-neutral-100 border-2 border-black rounded-xl font-mono text-xs font-black uppercase text-black flex items-center gap-2 cursor-pointer shadow-[2px_2px_0px_#000000] active:translate-x-px transition-all"
            >
              {copiedEmail ? <Check className="w-4 h-4 stroke-[2.5]" /> : <Copy className="w-4 h-4 stroke-[2.5]" />}
              <span>{copiedEmail ? 'Email Copied!' : `Copy: ${developerEmail}`}</span>
            </button>
          </div>
        </motion.div>

        {/* 2. Primary Sovereign Storage: Persistent Browser Memory */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="p-5 sm:p-6 bg-white border-3 border-black rounded-2xl shadow-[4px_4px_0px_#000000] space-y-4"
        >
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#00E599]/30 border-2 border-black flex items-center justify-center shrink-0 shadow-[2px_2px_0px_#000000]">
                <HardDrive className="w-5 h-5 text-black stroke-[2.5]" />
              </div>
              <div>
                <h3 className="font-display font-black text-base uppercase tracking-tight text-black">
                  Mode 1: Persistent Storage (Browser Sandbox)
                </h3>
                <span className="font-mono text-xs text-neutral-600 block">
                  Built-in zero-setup storage protected from automatic disk cache eviction
                </span>
              </div>
            </div>

            {storageState.persisted ? (
              <span className="px-3 py-1 bg-[#00E599] border-2 border-black rounded-xl font-mono text-xs font-black uppercase text-black flex items-center gap-1.5 shadow-[1.5px_1.5px_0px_#000000]">
                <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
                <span>Eviction Shield Active</span>
              </span>
            ) : (
              <button
                type="button"
                onClick={handleRequestPersistence}
                className="px-3.5 py-1.5 bg-[#FDC800] hover:bg-amber-400 border-2 border-black rounded-xl font-mono text-xs font-black uppercase text-black flex items-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_#000000] active:translate-x-px"
              >
                <Lock className="w-4 h-4 stroke-[2.5]" />
                <span>Lock Eviction Protection</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
            <div className="p-3 bg-[#FFFDF8] border border-black rounded-xl space-y-1">
              <span className="text-neutral-500 font-bold block">BROWSER QUOTA STATUS:</span>
              <span className="text-black font-black">
                {storageState.quotaMb > 0 
                  ? `~${storageState.usageKb} KB used of ~${storageState.quotaMb} MB assigned`
                  : 'Unlimited Local Origin Quota'}
              </span>
            </div>
            <div className="p-3 bg-[#FFFDF8] border border-black rounded-xl space-y-1">
              <span className="text-neutral-500 font-bold block">ACTIVE ENTRIES STORED:</span>
              <span className="text-black font-black">
                {Object.keys(entries).length} daily records in browser memory
              </span>
            </div>
          </div>

          {persistenceMsg && (
            <div className="p-2.5 bg-[#FFF5C2] border-2 border-black rounded-xl font-mono text-xs font-black text-black flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
              <span>{persistenceMsg}</span>
            </div>
          )}
        </motion.div>

        {/* 3. Secondary Sovereign Storage: Device File Mirror (Direct Physical Disk Sync) */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-5 sm:p-6 bg-white border-3 border-black rounded-2xl shadow-[4px_4px_0px_#000000] space-y-4"
        >
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FDC800] border-2 border-black flex items-center justify-center shrink-0 shadow-[2px_2px_0px_#000000]">
                <FolderSync className="w-5 h-5 text-black stroke-[2.5]" />
              </div>
              <div>
                <h3 className="font-display font-black text-base uppercase tracking-tight text-black">
                  Mode 2: Device File Mirror (Physical Hard Drive Sync)
                </h3>
                <span className="font-mono text-xs text-neutral-600 block">
                  Mirrors your diary to a real .json file in your Documents or Desktop folder
                </span>
              </div>
            </div>

            {activeHandle ? (
              <span className="px-3 py-1 bg-[#00E599] border-2 border-black rounded-xl font-mono text-xs font-black uppercase text-black flex items-center gap-1.5 shadow-[1.5px_1.5px_0px_#000000]">
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>Connected: {activeHandle.name}</span>
              </span>
            ) : (
              <span className="px-3 py-1 bg-neutral-200 border-2 border-black rounded-xl font-mono text-xs font-black uppercase text-neutral-700 shadow-[1.5px_1.5px_0px_#000000]">
                Not Connected
              </span>
            )}
          </div>

          <div className="p-3 bg-[#FFFDF5] border border-black/20 rounded-xl font-mono text-xs text-neutral-800 leading-relaxed space-y-1.5">
            <p>
              • <strong>100% History-Proof:</strong> Because this file lives in your physical computer/phone storage, it will <strong>never be deleted</strong> even if you clear all browser cookies or uninstall Chrome.
            </p>
            <p>
              • <strong>Real-Time Synchronization:</strong> Every time you record or update a day, the app automatically updates your file on disk.
            </p>
          </div>

          {/* Storage Format Selector */}
          <div className="space-y-2 pt-1">
            <label className="font-mono text-xs font-black uppercase text-neutral-700 block">
              Choose Mirror File Format:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleFormatChange('plaintext')}
                className={`p-3 rounded-xl border-2 border-black font-mono text-xs font-black uppercase cursor-pointer transition-all shadow-[2px_2px_0px_#000000] text-left flex items-start gap-2.5 ${
                  formatPref === 'plaintext'
                    ? 'bg-[#FDC800] text-black ring-2 ring-black'
                    : 'bg-white hover:bg-neutral-50 text-neutral-700'
                }`}
              >
                <FileText className="w-4 h-4 stroke-[2.5] shrink-0 mt-0.5" />
                <div>
                  <span className="block">Plaintext JSON (Default)</span>
                  <span className="text-[10px] font-medium text-neutral-700 block font-sans">
                    Open in Notepad anytime. Easy to read, search, and backup.
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleFormatChange('encrypted')}
                className={`p-3 rounded-xl border-2 border-black font-mono text-xs font-black uppercase cursor-pointer transition-all shadow-[2px_2px_0px_#000000] text-left flex items-start gap-2.5 ${
                  formatPref === 'encrypted'
                    ? 'bg-[#00E599] text-black ring-2 ring-black'
                    : 'bg-white hover:bg-neutral-50 text-neutral-700'
                }`}
              >
                <Lock className="w-4 h-4 stroke-[2.5] shrink-0 mt-0.5" />
                <div>
                  <span className="block">Encrypted AES-256 Vault</span>
                  <span className="text-[10px] font-medium text-neutral-700 block font-sans">
                    Scrambled with your 4-digit PIN. Zero-knowledge on shared PCs.
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2.5 flex-wrap pt-2">
            {fsSupported ? (
              <>
                {!activeHandle ? (
                  <button
                    type="button"
                    onClick={handleConnectMirror}
                    className="px-4 py-2.5 bg-[#FDC800] hover:bg-amber-400 border-2 border-black rounded-xl font-mono text-xs font-black uppercase text-black flex items-center gap-2 cursor-pointer shadow-[2px_2px_0px_#000000] active:translate-x-px"
                  >
                    <FolderSync className="w-4 h-4 stroke-[2.5]" />
                    <span>Connect Local File Mirror</span>
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={handleSyncMirrorNow}
                      disabled={isSyncing}
                      className="px-4 py-2.5 bg-[#00E599] hover:bg-emerald-400 border-2 border-black rounded-xl font-mono text-xs font-black uppercase text-black flex items-center gap-2 cursor-pointer shadow-[2px_2px_0px_#000000] active:translate-x-px disabled:opacity-50"
                    >
                      <RefreshCw className={`w-4 h-4 stroke-[2.5] ${isSyncing ? 'animate-spin' : ''}`} />
                      <span>{isSyncing ? 'Synchronizing...' : 'Sync To File Now'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleDisconnectMirror}
                      className="px-4 py-2.5 bg-white hover:bg-red-50 text-red-600 border-2 border-black rounded-xl font-mono text-xs font-black uppercase flex items-center gap-2 cursor-pointer shadow-[2px_2px_0px_#000000] active:translate-x-px"
                    >
                      <span>Disconnect Mirror</span>
                    </button>
                  </>
                )}
              </>
            ) : (
              <button
                type="button"
                onClick={handleManualDownloadFallback}
                className="px-4 py-2.5 bg-[#FDC800] hover:bg-amber-400 border-2 border-black rounded-xl font-mono text-xs font-black uppercase text-black flex items-center gap-2 cursor-pointer shadow-[2px_2px_0px_#000000] active:translate-x-px"
              >
                <Download className="w-4 h-4 stroke-[2.5]" />
                <span>Download Diary File Backup</span>
              </button>
            )}
          </div>

          {mirrorStatusMsg && (
            <div className="p-2.5 bg-[#FFF5C2] border-2 border-black rounded-xl font-mono text-xs font-black text-black flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
              <span>{mirrorStatusMsg}</span>
            </div>
          )}
        </motion.div>

        {/* 4. Restore & Decryption Station */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="p-5 sm:p-6 bg-white border-3 border-black rounded-2xl shadow-[4px_4px_0px_#000000] space-y-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 border-2 border-black flex items-center justify-center shrink-0 shadow-[2px_2px_0px_#000000]">
              <Upload className="w-5 h-5 text-black stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-display font-black text-base uppercase tracking-tight text-black">
                File Restore & Decryption Station
              </h3>
              <span className="font-mono text-xs text-neutral-600 block">
                Upload any past Plaintext or Encrypted diary file to render all your entries instantly
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <label className="px-4 py-2.5 bg-[#00E599] hover:bg-emerald-400 border-2 border-black rounded-xl font-mono text-xs font-black uppercase text-black flex items-center gap-2 cursor-pointer shadow-[2px_2px_0px_#000000] active:translate-x-px">
              <Upload className="w-4 h-4 stroke-[2.5]" />
              <span>Select & Restore File (.json)</span>
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* Encrypted File PIN Unlock Card */}
          {pendingContainer && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 bg-[#FFF5C2] border-2 border-black rounded-xl space-y-3 shadow-[2px_2px_0px_#000000]"
            >
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-black stroke-[2.5]" />
                <span className="font-mono text-xs font-black uppercase text-black">
                  Encrypted File Detected (AES-256 GCM)
                </span>
              </div>
              <p className="font-mono text-xs text-neutral-800">
                This file is locked behind a security PIN. Enter your 4-digit PIN to decrypt and render your diary entries:
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="password"
                  maxLength={6}
                  placeholder="Enter PIN..."
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  className="px-3 py-2 bg-white border-2 border-black rounded-xl font-mono text-xs font-black text-black w-36 outline-none focus:ring-2 focus:ring-black"
                />
                <button
                  type="button"
                  onClick={handleUnlockAndRestore}
                  disabled={isDecrypting}
                  className="px-4 py-2 bg-black text-[#00E599] hover:bg-neutral-800 border-2 border-black rounded-xl font-mono text-xs font-black uppercase cursor-pointer disabled:opacity-50"
                >
                  {isDecrypting ? 'Decrypting...' : 'Unlock & Restore'}
                </button>
              </div>
              {pinError && (
                <div className="text-xs font-mono font-black text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{pinError}</span>
                </div>
              )}
            </motion.div>
          )}

          {restoreStatus && (
            <div
              className={`p-3 border-2 border-black rounded-xl font-mono text-xs font-black flex items-center gap-2 ${
                restoreStatus.type === 'success'
                  ? 'bg-[#00E599] text-black'
                  : 'bg-[#FF4D4D] text-white'
              }`}
            >
              {restoreStatus.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
              ) : (
                <AlertCircle className="w-4 h-4 stroke-[2.5]" />
              )}
              <span>{restoreStatus.message}</span>
            </div>
          )}
        </motion.div>

        {/* 5. Live Raw Database Inspector */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-5 sm:p-6 bg-white border-3 border-black rounded-2xl shadow-[4px_4px_0px_#000000] space-y-3"
        >
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setIsInspectorOpen(!isInspectorOpen)}
              className="font-display font-black text-base uppercase tracking-tight text-black flex items-center gap-2 cursor-pointer"
            >
              <Database className="w-4 h-4 stroke-[2.5]" />
              <span>Live Database & Memory Inspector</span>
              <span className="text-xs font-mono text-neutral-500 font-bold">
                {isInspectorOpen ? '▲ COLLAPSE' : '▼ EXPAND'}
              </span>
            </button>

            <button
              type="button"
              onClick={handleCopyRawData}
              className="px-3 py-1 bg-white hover:bg-neutral-100 border border-black rounded-lg font-mono text-[11px] font-black uppercase flex items-center gap-1.5 cursor-pointer shadow-[1px_1px_0px_#000000]"
            >
              <Copy className="w-3 h-3 stroke-[2.5]" />
              <span>{copiedRaw ? 'COPIED!' : 'COPY LIVE JSON'}</span>
            </button>
          </div>

          <AnimatePresence>
            {isInspectorOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2 overflow-hidden"
              >
                <pre className="p-3 bg-neutral-900 text-[#00E599] border-2 border-black rounded-xl font-mono text-[11px] max-h-48 overflow-auto select-all leading-tight">
                  {JSON.stringify({ user: user?.email || 'guest', count: Object.keys(entries).length, entries }, null, 2)}
                </pre>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

      </div>
    </div>
  );
}
