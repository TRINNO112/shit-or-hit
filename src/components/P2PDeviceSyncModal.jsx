import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Radio,
  QrCode,
  Smartphone,
  Laptop,
  Check,
  X,
  Copy,
  Download,
  Upload,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Zap,
  ArrowRight,
  Sparkles,
  Monitor,
  Wifi,
  LogIn,
  ShieldAlert,
  HardDrive,
  CheckCircle2,
  Info,
  KeyRound,
  Shield,
  RotateCcw,
  Lock,
  Layers,
  Cpu,
  Cloud,
  CheckCheck
} from 'lucide-react';
import { soundEngine } from '../services/soundEngine';
import { generateQRCodeSVG } from '../services/qrGenerator';
import { isOwnerAccount, isEmailWhitelisted } from '../services/firebase';
import { fetchDatabase } from '../services/api';
import {
  generatePairingCode,
  startSenderSession,
  joinReceiverSession,
  getLocalSyncPayload,
  importSyncPayload,
  getAccountRoomId,
  checkAccountHostActive,
  getGuestSyncKey,
  setGuestSyncKey,
  generateMeshSyncKey,
  getMeshRoomId,
  getMutualPeerBackupMeta,
  restoreFromMutualPeerBackup,
  getCurrentDeviceInfo
} from '../services/p2pSyncEngine';

export default function P2PDeviceSyncModal({
  isOpen,
  onClose,
  user = null,
  onLogin = null,
  onSyncComplete,
  initialSection = 'sync'
}) {
  const isOwner = Boolean(user?.email && isOwnerAccount(user.email));
  const isWhitelisted = Boolean(user?.email && isEmailWhitelisted(user.email));
  const currentDevice = getCurrentDeviceInfo();

  const [localEntryCount, setLocalEntryCount] = useState(() => {
    try {
      const payload = getLocalSyncPayload();
      return Object.keys(payload?.entries || {}).length;
    } catch {
      return 0;
    }
  });

  const [activeSection, setActiveSection] = useState(() => initialSection || (user?.email ? 'sync' : 'transfer'));
  const [mode, setMode] = useState(() => {
    if (initialSection === 'transfer') return 'send';
    return user?.email ? 'account' : 'send';
  });
  const [pairingCode, setPairingCode] = useState(() => generatePairingCode());
  const [guestMeshKey, setGuestMeshKey] = useState(() => getGuestSyncKey());
  const [inputMeshKey, setInputMeshKey] = useState('');
  const [peerBackupMeta, setPeerBackupMeta] = useState(() => getMutualPeerBackupMeta());

  const maxDeviceQuota = isOwner ? 10 : user?.email ? 5 : 3;
  const activeSlotsCount = peerBackupMeta?.hasPayload ? 2 : 1;

  const [isCopiedMeshKey, setIsCopiedMeshKey] = useState(false);
  const [syncSubTab, setSyncSubTab] = useState(() => (user?.email ? 'google' : 'mesh'));
  const [syncStatus, setSyncStatus] = useState('Idle');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isHostingAccount, setIsHostingAccount] = useState(false);
  const [isCloudSyncing, setIsCloudSyncing] = useState(false);
  const [successResult, setSuccessResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [receiveInputCode, setReceiveInputCode] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [rawTextPayload, setRawTextPayload] = useState('');
  const [toast, setToast] = useState(null);
  const [pendingApproval, setPendingApproval] = useState(null);

  const cleanupRef = useRef(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4500);
  };

  const handleForceCloudSync = async () => {
    soundEngine.playClick();
    setIsCloudSyncing(true);
    showToast('Syncing entries with Firebase Firestore...', 'info');
    try {
      const db = await fetchDatabase(user);
      const count = Object.keys(db?.entries || {}).length;
      setLocalEntryCount(count);
      soundEngine.playSuccessChime();
      showToast(`Cloud sync complete! ${count} entries synchronized.`, 'success');
      if (onSyncComplete) onSyncComplete();
    } catch (err) {
      soundEngine.playRoughTone();
      showToast('Cloud sync failed: ' + (err.message || 'Network error'), 'error');
    } finally {
      setIsCloudSyncing(false);
    }
  };

  // Keep activeSection and mode in sync when modal opens or initialSection changes
  useEffect(() => {
    if (isOpen) {
      setPeerBackupMeta(getMutualPeerBackupMeta());
      try {
        const payload = getLocalSyncPayload();
        setLocalEntryCount(Object.keys(payload?.entries || {}).length);
      } catch {
        setLocalEntryCount(0);
      }
      const section = initialSection || (user?.email ? 'sync' : 'transfer');
      setActiveSection(section);
      if (section === 'sync') {
        setSyncSubTab(user?.email ? 'google' : 'mesh');
      } else {
        setMode(user?.email ? 'account' : 'send');
      }
    }
  }, [isOpen, initialSection, user?.email]);

  // Auto-detect sync parameter in URL
  useEffect(() => {
    if (typeof window !== 'undefined' && isOpen) {
      const urlParams = new URLSearchParams(window.location.search);
      const urlSyncCode = urlParams.get('sync');
      if (urlSyncCode) {
        setActiveSection('transfer');
        setMode('receive');
        setReceiveInputCode(urlSyncCode.toUpperCase());
      }
    }
  }, [isOpen]);

  // Clean up any active peer sessions on unmount or modal close
  useEffect(() => {
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
    };
  }, []);

  if (!isOpen) return null;

  const syncUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}?sync=${pairingCode}`
    : `https://daily-verdict.netlify.app/?sync=${pairingCode}`;

  const qrSvgHtml = generateQRCodeSVG(syncUrl, 200);

  // Stop any active connection
  const stopActiveSession = () => {
    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
    }
    setIsProcessing(false);
    setIsHostingAccount(false);
    setPendingApproval(null);
    setSyncStatus('Idle');
  };

  // 1. QR / Code Sender Session
  const handleStartSender = async () => {
    soundEngine.playClick();
    setIsProcessing(true);
    setErrorMessage('');
    setSuccessResult(null);
    setPendingApproval(null);

    stopActiveSession();
    setIsProcessing(true);
    showToast('Sender antenna active! Awaiting receiver connection...', 'info');

    const session = await startSenderSession(
      pairingCode,
      (status) => setSyncStatus(status),
      (result) => {
        soundEngine.playSuccessChime();
        setIsProcessing(false);
        setPendingApproval(null);
        setSuccessResult(result);
        setSyncStatus('Transfer Complete!');
        showToast('Transfer Complete! Database beamed to receiver.', 'success');
        if (onSyncComplete) onSyncComplete();
      },
      (err) => {
        soundEngine.playRoughTone();
        setIsProcessing(false);
        setPendingApproval(null);
        const msg = err.message || 'Peer-to-peer connection timed out.';
        setErrorMessage(msg);
        showToast(`Transfer Failed: ${msg}`, 'error');
      },
      (conn) => {
        soundEngine.playSuccessChime();
        setPendingApproval(conn);
        setSyncStatus('Receiver connected! Awaiting your approval...');
        showToast('Receiver connected! Tap Approve to beam diary.', 'info');
      }
    );

    cleanupRef.current = session?.cleanup;
  };

  // 2. Code Receiver Session
  const handleStartReceiver = async () => {
    if (!receiveInputCode.trim()) {
      setErrorMessage('Please enter the 6-character code from the sending device.');
      showToast('Please enter the 6-character code from the sending device.', 'error');
      return;
    }

    soundEngine.playClick();
    setIsProcessing(true);
    setErrorMessage('');
    setSuccessResult(null);

    stopActiveSession();
    setIsProcessing(true);
    showToast('Locating sending device...', 'info');

    const session = await joinReceiverSession(
      receiveInputCode.trim(),
      (status) => setSyncStatus(status),
      (result) => {
        soundEngine.playSuccessChime();
        setIsProcessing(false);
        setSuccessResult(result);
        setSyncStatus('Sync Successful!');
        showToast(`Sync Successful! Imported ${result.importedCount || 0} entries.`, 'success');
        if (onSyncComplete) onSyncComplete();
      },
      (err) => {
        soundEngine.playRoughTone();
        setIsProcessing(false);
        const msg = err.message || 'Failed to connect to sender device.';
        setErrorMessage(msg);
        showToast(`Sync Failed: ${msg}`, 'error');
      }
    );

    cleanupRef.current = session?.cleanup;
  };

  // 3. Account-Based Host Session (Broadcast from Office PC)
  const handleStartAccountHost = async () => {
    if (!user?.email) return;
    soundEngine.playClick();
    setIsProcessing(true);
    setIsHostingAccount(true);
    setErrorMessage('');
    setSuccessResult(null);

    stopActiveSession();

    const roomCode = getAccountRoomId(user.email);
    setIsHostingAccount(true);
    setIsProcessing(true);
    showToast('Broadcasting started! Keep this browser tab open on your Office PC.', 'info');

    const session = await startSenderSession(
      roomCode,
      (status) => setSyncStatus(status),
      (result) => {
        soundEngine.playSuccessChime();
        setIsProcessing(false);
        setIsHostingAccount(false);
        setSuccessResult(result);
        setSyncStatus('Beamed successfully to your remote device!');
        showToast('Transfer Complete! Beamed successfully to your remote device.', 'success');
        if (onSyncComplete) onSyncComplete();
      },
      (err) => {
        soundEngine.playRoughTone();
        setIsProcessing(false);
        setIsHostingAccount(false);
        const msg = err.message || 'Account session timed out.';
        setErrorMessage(msg);
        showToast(`Host Session Error: ${msg}`, 'error');
      }
    );

    cleanupRef.current = session?.cleanup;
  };

  // 4. Account-Based Fetch Session (Pull from Laptop / Phone)
  const handleFetchFromAccountHost = async () => {
    if (!user?.email) return;
    soundEngine.playClick();
    setIsProcessing(true);
    setIsHostingAccount(false);
    setErrorMessage('');
    setSuccessResult(null);

    stopActiveSession();
    setIsProcessing(true);

    const roomCode = getAccountRoomId(user.email);
    setSyncStatus('Contacting your other active device...');
    showToast('Locating your active office PC...', 'info');

    const session = await joinReceiverSession(
      roomCode,
      (status) => setSyncStatus(status),
      (result) => {
        soundEngine.playSuccessChime();
        setIsProcessing(false);
        setSuccessResult(result);
        setSyncStatus('Successfully fetched from your other device!');
        showToast(`Sync Successful! Imported ${result.importedCount || 0} entries.`, 'success');
        if (onSyncComplete) onSyncComplete();
      },
      (err) => {
        soundEngine.playRoughTone();
        setIsProcessing(false);
        const errorDetail = 'Could not connect to your other device. Ensure your office computer has Daily Verdict open in an active browser tab with "Broadcast As Host" running.';
        setErrorMessage(errorDetail);
        showToast('Sync Failed: Remote device was not reachable or tab was closed.', 'error');
      }
    );

    cleanupRef.current = session?.cleanup;
  };

  const handleCopyMeshKey = () => {
    soundEngine.playClick();
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(guestMeshKey);
      setIsCopiedMeshKey(true);
      showToast('Mesh Sync Key copied to clipboard!', 'success');
      setTimeout(() => setIsCopiedMeshKey(false), 2000);
    }
  };

  const handleGenerateNewMeshKey = () => {
    soundEngine.playClick();
    if (window.confirm('Generate a new Mesh Sync Key? You will need to enter this new key on your secondary device to keep syncing.')) {
      const nextKey = generateMeshSyncKey();
      setGuestSyncKey(nextKey);
      setGuestMeshKey(nextKey);
      showToast('Generated fresh Mesh Sync Key!', 'info');
    }
  };

  const handleSavePairedMeshKey = (e) => {
    e.preventDefault();
    if (!inputMeshKey.trim()) return;
    const clean = inputMeshKey.trim().toUpperCase();
    setGuestSyncKey(clean);
    setGuestMeshKey(clean);
    setInputMeshKey('');
    soundEngine.playSuccessChime();
    showToast('Paired Mesh Sync Key saved on this device!', 'success');
  };

  const handleStartMeshHost = async () => {
    soundEngine.playClick();
    setIsProcessing(true);
    setIsHostingAccount(true);
    setErrorMessage('');
    setSuccessResult(null);

    stopActiveSession();

    const roomCode = getMeshRoomId(guestMeshKey);
    setIsHostingAccount(true);
    setIsProcessing(true);
    showToast('Mesh Antenna active! Keep this browser tab open.', 'info');

    const session = await startSenderSession(
      roomCode,
      (status) => setSyncStatus(status),
      (result) => {
        soundEngine.playSuccessChime();
        setIsProcessing(false);
        setIsHostingAccount(false);
        setSuccessResult(result);
        setSyncStatus('Mesh Sync Complete! Beamed to paired device.');
        showToast('Transfer Complete! Beamed to paired device.', 'success');
        setPeerBackupMeta(getMutualPeerBackupMeta());
        if (onSyncComplete) onSyncComplete();
      },
      (err) => {
        soundEngine.playRoughTone();
        setIsProcessing(false);
        setIsHostingAccount(false);
        const msg = err.message || 'Mesh session timed out.';
        setErrorMessage(msg);
        showToast(`Host Error: ${msg}`, 'error');
      }
    );

    cleanupRef.current = session?.cleanup;
  };

  const handleFetchFromMeshHost = async () => {
    soundEngine.playClick();
    setIsProcessing(true);
    setIsHostingAccount(false);
    setErrorMessage('');
    setSuccessResult(null);

    stopActiveSession();
    setIsProcessing(true);

    const roomCode = getMeshRoomId(guestMeshKey);
    setSyncStatus('Connecting to paired device over private mesh...');
    showToast('Connecting to paired device...', 'info');

    const session = await joinReceiverSession(
      roomCode,
      (status) => setSyncStatus(status),
      (result) => {
        soundEngine.playSuccessChime();
        setIsProcessing(false);
        setSuccessResult(result);
        setSyncStatus('Mesh Sync Successful!');
        showToast(`Mesh Sync Successful! Imported ${result.importedCount || 0} entries.`, 'success');
        setPeerBackupMeta(getMutualPeerBackupMeta());
        if (onSyncComplete) onSyncComplete();
      },
      (err) => {
        soundEngine.playRoughTone();
        setIsProcessing(false);
        const msg = err.message || 'Failed to connect to paired device.';
        setErrorMessage(msg);
        showToast(`Sync Failed: ${msg}`, 'error');
      }
    );

    cleanupRef.current = session?.cleanup;
  };

  const handleDisasterRecovery = () => {
    soundEngine.playClick();
    const res = restoreFromMutualPeerBackup();
    if (res.success) {
      soundEngine.playSuccessChime();
      showToast(`Disaster Recovery complete! Restored ${res.count} entries.`, 'success');
      setPeerBackupMeta(getMutualPeerBackupMeta());
      if (onSyncComplete) onSyncComplete();
    } else {
      soundEngine.playRoughTone();
      showToast(`Recovery failed: ${res.error || 'No backup found'}`, 'error');
    }
  };

  const handleCopyLink = () => {
    soundEngine.playClick();
    navigator.clipboard.writeText(syncUrl);
    setCopiedLink(true);
    showToast('Pairing link copied to clipboard!', 'info');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleGenerateNewCode = () => {
    soundEngine.playClick();
    stopActiveSession();
    setPairingCode(generatePairingCode());
    setSuccessResult(null);
    setErrorMessage('');
    showToast('Generated fresh 6-character pairing code.', 'info');
  };

  const handleImportRawText = () => {
    try {
      soundEngine.playClick();
      const parsed = JSON.parse(rawTextPayload);
      const res = importSyncPayload(parsed);
      soundEngine.playSuccessChime();
      setSuccessResult(res);
      showToast(`Success! Imported ${res.importedCount || 0} entries from JSON.`, 'success');
      if (onSyncComplete) onSyncComplete();
    } catch (e) {
      soundEngine.playRoughTone();
      const msg = 'Invalid JSON payload. Please paste a valid export.';
      setErrorMessage(msg);
      showToast(msg, 'error');
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-100 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md select-none overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.93, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.93, y: 20 }}
          transition={{ type: 'spring', stiffness: 350, damping: 28 }}
          className="bg-[#FFFDF8] border-3 border-black rounded-3xl p-3.5 sm:p-6 max-w-xl w-full shadow-[8px_8px_0px_#000000] relative space-y-4 text-black my-auto max-h-[92vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Right Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3.5 right-3.5 w-8 h-8 rounded-xl bg-neutral-100 hover:bg-neutral-200 border-2 border-black flex items-center justify-center text-black cursor-pointer shadow-[1.5px_1.5px_0px_#000000] active:scale-90 transition-all z-10"
            title="Close P2P Beam"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>

          {/* Header */}
          <div className="space-y-1.5 border-b-2 border-black pb-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-lg bg-[#00E599] text-black border-2 border-black font-mono text-[10px] font-black uppercase tracking-wider shadow-[1.5px_1.5px_0px_#000000] inline-flex items-center gap-1">
                <Radio className="w-3 h-3 stroke-[2.5] animate-pulse" />
                {activeSection === 'sync'
                  ? (isOwner ? 'OWNER MULTI-DEVICE MESH' : user?.email ? 'ACCOUNT MULTI-DEVICE SYNC' : 'OFFLINE PRIVATE MESH')
                  : 'WEBRTC DIRECT TUNNEL'}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-[#FDC800] text-black border border-black font-mono text-[10px] font-black uppercase shadow-[1px_1px_0px_#000000] inline-flex items-center gap-1">
                {activeSection === 'sync'
                  ? (isOwner ? 'CLOUD & P2P ACTIVE' : 'ZERO CLOUD STORAGE')
                  : 'ON-DEMAND TRANSFER'}
              </span>
            </div>
            <h3 className="font-display font-black text-xl sm:text-2xl uppercase tracking-tight text-black leading-tight">
              {activeSection === 'sync' ? 'Multi-Device Sync Hub' : 'Direct Data Transfer'}
            </h3>
            <p className="text-xs font-mono text-neutral-600 font-bold">
              {activeSection === 'sync'
                ? (isOwner
                    ? 'Continuous bidirectional cloud sync active. Real-time parity across up to 10 stations with zero-cloud P2P mesh fallback.'
                    : user?.email
                      ? 'Keep your phone, laptop, and office PC synchronized over direct P2P tunnels (up to 5 devices).'
                      : 'Private peer-to-peer sync using your 16-character cryptographic Mesh Key (up to 3 devices).')
                : (user?.email
                    ? 'Transfer your diary directly browser-to-browser via Google Account Beam, QR code, Pairing Code, or Offline Text.'
                    : 'One-time encrypted peer-to-peer transfer between devices. No Google account required.')}
            </p>
          </div>

          {/* Top-Level Toggle Menu: Device Sync vs Data Transfer */}
          <div className="grid grid-cols-2 gap-2 p-1.5 bg-neutral-100 border-2 border-black rounded-2xl shadow-[2.5px_2.5px_0px_#000000]">
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                stopActiveSession();
                setActiveSection('sync');
                setSyncSubTab(user?.email ? 'google' : 'mesh');
              }}
              className={`py-2 px-3 rounded-xl border-2 font-mono text-xs font-black uppercase transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeSection === 'sync'
                  ? 'bg-[#00E599] text-black border-black shadow-[2px_2px_0px_#000000]'
                  : 'bg-transparent text-neutral-600 border-transparent hover:text-black'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 stroke-[2.5] ${activeSection === 'sync' ? 'animate-spin-slow' : ''}`} />
              <span>Device Sync</span>
              <span className="text-[9px] px-1.5 py-0.5 bg-black text-white rounded font-mono font-black shrink-0">
                {isOwner ? 'Cloud' : user?.email ? 'Google' : 'Mesh'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                stopActiveSession();
                setActiveSection('transfer');
                if (mode !== 'account' && mode !== 'send' && mode !== 'receive' && mode !== 'raw') {
                  setMode(user?.email ? 'account' : 'send');
                } else if (!user?.email && mode === 'account') {
                  setMode('send');
                }
              }}
              className={`py-2 px-3 rounded-xl border-2 font-mono text-xs font-black uppercase transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeSection === 'transfer'
                  ? 'bg-[#FDC800] text-black border-black shadow-[2px_2px_0px_#000000]'
                  : 'bg-transparent text-neutral-600 border-transparent hover:text-black'
              }`}
            >
              <Radio className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Data Transfer</span>
              <span className="text-[9px] px-1.5 py-0.5 bg-black text-white rounded font-mono font-black shrink-0">P2P Beam</span>
            </button>
          </div>

          {/* Sub-Tabs for Data Transfer */}
          {activeSection === 'transfer' && (
            <div className={`grid ${user?.email ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-3'} gap-2 pt-0.5`}>
              {user?.email && (
                <button
                  type="button"
                  onClick={() => { soundEngine.playClick(); stopActiveSession(); setMode('account'); }}
                  className={`py-2 px-2 rounded-xl border-2 border-black font-mono text-[11px] font-black uppercase cursor-pointer transition-all shadow-[1.5px_1.5px_0px_#000000] flex items-center justify-center gap-1.5 ${
                    mode === 'account'
                      ? 'bg-[#FDC800] text-black'
                      : 'bg-white hover:bg-neutral-50 text-neutral-700'
                  }`}
                >
                  <Laptop className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>With Google</span>
                  <span className="text-[8px] px-1 py-0.2 bg-black text-[#00E599] rounded font-mono font-black">BEAM</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => { soundEngine.playClick(); stopActiveSession(); setMode('send'); }}
                className={`py-2 px-2 rounded-xl border-2 border-black font-mono text-[11px] font-black uppercase cursor-pointer transition-all shadow-[1.5px_1.5px_0px_#000000] flex items-center justify-center gap-1.5 ${
                  mode === 'send'
                    ? 'bg-[#FDC800] text-black'
                    : 'bg-white hover:bg-neutral-50 text-neutral-700'
                }`}
              >
                <Upload className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>QR Beam</span>
              </button>

              <button
                type="button"
                onClick={() => { soundEngine.playClick(); stopActiveSession(); setMode('receive'); }}
                className={`py-2 px-2 rounded-xl border-2 border-black font-mono text-[11px] font-black uppercase cursor-pointer transition-all shadow-[1.5px_1.5px_0px_#000000] flex items-center justify-center gap-1.5 ${
                  mode === 'receive'
                    ? 'bg-[#00E599] text-black'
                    : 'bg-white hover:bg-neutral-50 text-neutral-700'
                }`}
              >
                <Download className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Receive Code</span>
              </button>

              <button
                type="button"
                onClick={() => { soundEngine.playClick(); stopActiveSession(); setMode('raw'); }}
                className={`py-2 px-2 rounded-xl border-2 border-black font-mono text-[11px] font-black uppercase cursor-pointer transition-all shadow-[1.5px_1.5px_0px_#000000] flex items-center justify-center gap-1.5 ${
                  mode === 'raw'
                    ? 'bg-neutral-900 text-white'
                    : 'bg-white hover:bg-neutral-50 text-neutral-700'
                }`}
              >
                <Copy className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Offline Text</span>
              </button>
            </div>
          )}

          {/* ⚡ Live UX Feedback Toast HUD */}
          <AnimatePresence>
            {toast && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.96 }}
                className={`p-3 rounded-xl border-2 border-black font-mono text-xs font-black shadow-[2.5px_2.5px_0px_#000000] flex items-center gap-2 ${toast.type === 'success' ? 'bg-[#00E599] text-black' :
                    toast.type === 'error' ? 'bg-[#FF4D4D] text-white' :
                      'bg-[#FFF5C2] text-black'
                  }`}
              >
                {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0 stroke-[2.5]" /> :
                  toast.type === 'error' ? <AlertTriangle className="w-4 h-4 shrink-0 stroke-[2.5]" /> :
                    <Info className="w-4 h-4 shrink-0 stroke-[2.5]" />}
                <span className="truncate">{toast.message}</span>
              </motion.div>
            )}
          </AnimatePresence>          {/* SECTION 1: DEVICE SYNC (Google Account or Private Mesh Key) */}
          {activeSection === 'sync' && (
            <div className="space-y-3 pt-1">
              {/* 1. Sub-Tab Switcher: PLACED AT THE VERY TOP OF DEVICE SYNC */}
              {user?.email ? (
                <div className="flex items-center gap-2 p-1.5 bg-neutral-100 border-2 border-black rounded-2xl shadow-[2px_2px_0px_#000000]">
                  <button
                    type="button"
                    onClick={() => { soundEngine.playClick(); setSyncSubTab('google'); }}
                    className={`flex-1 py-2 px-2.5 rounded-xl font-mono text-xs font-black uppercase transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      syncSubTab === 'google'
                        ? 'bg-[#00E599] text-black border-2 border-black shadow-[1.5px_1.5px_0px_#000000]'
                        : 'text-neutral-600 hover:text-black border-2 border-transparent'
                    }`}
                  >
                    <Monitor className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Google Account Sync</span>
                    {isOwner && (
                      <span className="text-[9px] px-1.5 py-0.5 bg-black text-[#00E599] rounded font-mono font-black shrink-0">CLOUD LIVE</span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => { soundEngine.playClick(); setSyncSubTab('mesh'); }}
                    className={`flex-1 py-2 px-2.5 rounded-xl font-mono text-xs font-black uppercase transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      syncSubTab === 'mesh'
                        ? 'bg-[#FDC800] text-black border-2 border-black shadow-[1.5px_1.5px_0px_#000000]'
                        : 'text-neutral-600 hover:text-black border-2 border-transparent'
                    }`}
                  >
                    <KeyRound className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Private Mesh Key (Offline)</span>
                  </button>
                </div>
              ) : (
                <div className="p-2.5 bg-neutral-100 border-2 border-black rounded-2xl font-mono text-xs font-black uppercase text-center flex items-center justify-center gap-2 shadow-[2px_2px_0px_#000000]">
                  <KeyRound className="w-4 h-4 stroke-[2.5]" />
                  <span>PRIVATE MESH KEY (OFFLINE GUEST SYNC)</span>
                </div>
              )}

              {/* VIEW A: Google Account Sync */}
              {user?.email && syncSubTab === 'google' && (
                <div className="space-y-3">
                  {/* TIER 1 OWNER CLOUD SYNC HERO CARD */}
                  {isOwner ? (
                    <div className="p-4 bg-linear-to-br from-[#FFFDF0] via-[#F4FFF8] to-[#E6F9F0] rounded-2xl border-3 border-black shadow-[4px_4px_0px_#000000] space-y-3">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="px-2.5 py-1 rounded-lg bg-[#00E599] text-black border-2 border-black font-mono text-[10px] font-black uppercase tracking-wider shadow-[1.5px_1.5px_0px_#000000] inline-flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 stroke-[2.5]" />
                          TIER 1 VERIFIED OWNER
                        </span>
                        <span className="px-2.5 py-1 bg-[#FDC800] border-2 border-black rounded-lg text-[10px] font-mono font-black uppercase text-black shadow-[1.5px_1.5px_0px_#000000] inline-flex items-center gap-1.5">
                          <Cloud className="w-3.5 h-3.5 stroke-[2.5]" />
                          FIRESTORE CLOUD ACTIVE
                        </span>
                      </div>

                      <div className="space-y-1.5 font-mono">
                        <h4 className="font-display font-black text-sm sm:text-base uppercase text-black leading-snug">
                          THIS ACCOUNT IS AUTOMATICALLY SYNCED ON ALL YOUR DEVICES
                        </h4>
                        <div className="flex items-center gap-2 pt-0.5">
                          <div className="w-5 h-5 rounded bg-[#00E599] border border-black flex items-center justify-center shrink-0">
                            <Check className="w-3 h-3 text-black stroke-3" />
                          </div>
                          <span className="text-xs text-black font-black uppercase underline truncate">
                            {user.email}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-800 leading-relaxed font-bold pt-1">
                          Because your account is whitelisted with Tier 1 Cloud privileges, <strong>every phone, laptop, or desktop where you log into this Google account is continuously synchronized in real-time</strong>.
                        </p>
                        <p className="text-[11px] text-neutral-600 font-medium">
                          Any entry created or updated on any device is automatically saved to Firebase Firestore. Manual transfers are not required.
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-xs">
                        <div className="p-2.5 bg-white rounded-xl border border-black/30 shadow-[1px_1px_0px_#000000]">
                          <span className="text-[9px] font-black uppercase text-neutral-500 block">CLOUD VAULT</span>
                          <span className="font-black text-black text-xs truncate block">trinno_owner_vault</span>
                        </div>
                        <div className="p-2.5 bg-white rounded-xl border border-black/30 shadow-[1px_1px_0px_#000000]">
                          <span className="text-[9px] font-black uppercase text-neutral-500 block">LOCAL CACHE</span>
                          <span className="font-black text-emerald-700 text-xs truncate block">{localEntryCount} Synchronized</span>
                        </div>
                      </div>

                      {/* 1-Tap Cloud Re-Sync Button */}
                      <button
                        type="button"
                        disabled={isCloudSyncing}
                        onClick={handleForceCloudSync}
                        className="w-full py-2.5 px-4 bg-[#00E599] hover:bg-emerald-400 border-2 border-black rounded-xl font-mono text-xs font-black uppercase text-black shadow-[2px_2px_0px_#000000] cursor-pointer flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 stroke-[2.5] ${isCloudSyncing ? 'animate-spin' : ''}`} />
                        <span>{isCloudSyncing ? 'Syncing With Firestore...' : 'Force Re-Sync Cloud Now'}</span>
                      </button>
                    </div>
                  ) : (
                    /* Standard Google Account Mesh Section */
                    <div className="p-4 bg-white rounded-2xl border-3 border-black shadow-[3px_3px_0px_#000000] space-y-2.5 font-mono">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="px-2 py-0.5 bg-[#FFF5C2] border border-black rounded text-[9px] font-mono font-black uppercase text-black">
                          GOOGLE ACCOUNT MESH
                        </span>
                        <span className="text-[9px] text-neutral-500 font-bold uppercase">
                          AUTHENTICATED
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-[#00E599] border border-black flex items-center justify-center shrink-0">
                          <Check className="w-3.5 h-3.5 text-black stroke-[2.5]" />
                        </div>
                        <span className="font-mono text-xs font-black uppercase truncate text-black">
                          {user.email}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-800 leading-relaxed font-bold">
                        Your personal devices signed into this Google account maintain continuous mesh synchronization and mutual offline mirrors.
                      </p>
                      <p className="text-[11px] text-neutral-600 font-medium">
                        To perform a direct 1-time database copy between your devices, switch to the <strong>Data Transfer</strong> tab above.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* VIEW B: Private Mesh Sync Key (Continuous Guest Sync & Cryptographic Isolation) */}
              {(!user?.email || syncSubTab === 'mesh') && (
                <div className="space-y-3">
                  {/* Security Assurance Banner */}
                  <div className="p-3 bg-neutral-900 text-white rounded-2xl border-2 border-black shadow-[2.5px_2.5px_0px_#000000] space-y-1.5">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-[#00E599] stroke-[2.5]" />
                      <span className="font-mono text-xs font-black uppercase tracking-wider text-[#00E599]">
                        CONTINUOUS ENCRYPTED MESH • UP TO 3 DEVICES
                      </span>
                    </div>
                    <p className="font-mono text-[11px] text-neutral-300 leading-relaxed">
                      Continuous guest sync uses a shared 16-character cryptographic Mesh Key. Supports up to 3 personal devices (e.g. Phone, Laptop, Work PC). When your devices hold this key, they discover each other privately and maintain mutual offline safety backups with zero cloud servers.
                    </p>
                  </div>

                  {/* Device Mesh Key Display */}
                  <div className="p-3.5 bg-white rounded-2xl border-2 border-black shadow-[3px_3px_0px_#000000] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-black text-neutral-500 uppercase tracking-wider">
                        THIS DEVICE'S MESH SYNC KEY
                      </span>
                      <span className="px-1.5 py-0.5 bg-[#FFF5C2] border border-black rounded text-[9px] font-mono font-black text-black">
                        CONTINUOUS PAIRING
                      </span>
                    </div>

                    <div className="p-3 bg-[#FFFDF5] border-2 border-black rounded-xl flex items-center justify-between gap-2 shadow-[1.5px_1.5px_0px_#000000]">
                      <span className="font-mono font-black text-sm sm:text-base tracking-widest text-black select-all truncate">
                        {guestMeshKey}
                      </span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={handleCopyMeshKey}
                          className="py-1 px-2.5 bg-white hover:bg-neutral-100 border border-black rounded-lg font-mono text-[10px] font-black uppercase cursor-pointer flex items-center gap-1 shadow-[1px_1px_0px_#000000] active:scale-95"
                        >
                          <Copy className="w-3 h-3 stroke-[2.5]" />
                          <span>{isCopiedMeshKey ? 'Copied!' : 'Copy'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleGenerateNewMeshKey}
                          className="py-1 px-2 bg-neutral-100 hover:bg-neutral-200 border border-black rounded-lg font-mono text-[10px] font-black uppercase cursor-pointer shadow-[1px_1px_0px_#000000] active:scale-95"
                          title="Generate New Mesh Key"
                        >
                          <RefreshCw className="w-3 h-3 stroke-[2.5]" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Pair Secondary Device Input */}
                  <form onSubmit={handleSavePairedMeshKey} className="p-3.5 bg-white rounded-2xl border-2 border-black shadow-[3px_3px_0px_#000000] space-y-2">
                    <label className="text-[10px] font-mono font-black text-neutral-500 uppercase tracking-wider block">
                      PAIR WITH OTHER DEVICE (ENTER THEIR MESH KEY)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="e.g. MESH-7F3A-9B2C-1E4D"
                        value={inputMeshKey}
                        onChange={(e) => setInputMeshKey(e.target.value.toUpperCase())}
                        className="flex-1 p-2.5 bg-[#FFFDF5] border-2 border-black rounded-xl font-mono text-xs font-black uppercase focus:outline-none focus:ring-2 focus:ring-black shadow-[1.5px_1.5px_0px_#000000]"
                      />
                      <button
                        type="submit"
                        disabled={!inputMeshKey.trim()}
                        className="py-2.5 px-3 bg-[#FDC800] hover:bg-yellow-400 disabled:opacity-50 border-2 border-black rounded-xl font-mono text-xs font-black uppercase text-black shadow-[1.5px_1.5px_0px_#000000] cursor-pointer active:scale-95 shrink-0"
                      >
                        Link Key
                      </button>
                    </div>
                  </form>

                  {!user?.email && onLogin && (
                    <div className="p-3 bg-neutral-50 rounded-2xl border-2 border-black flex items-center justify-between gap-2 flex-wrap">
                      <div className="min-w-0">
                        <span className="font-mono text-xs font-black uppercase text-black block">
                          Prefer zero-config automatic sync?
                        </span>
                        <span className="font-mono text-[10px] text-neutral-600">
                          Sign into Google on both devices for automatic account pairing without keys
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={onLogin}
                        className="py-1.5 px-3 bg-[#FDC800] hover:bg-amber-400 border-2 border-black rounded-xl font-mono text-[11px] font-black uppercase text-black shadow-[1.5px_1.5px_0px_#000000] cursor-pointer flex items-center gap-1.5 active:scale-95"
                      >
                        <LogIn className="w-3 h-3 stroke-[2.5]" />
                        <span>Sign In With Google</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* LIVE DEVICE NETWORK & PAIRING STATUS TOPOLOGY */}
              <div className="p-3.5 sm:p-4 bg-white rounded-2xl border-3 border-black shadow-[4px_4px_0px_#000000] space-y-3">
                <div className="flex items-center justify-between gap-2 flex-wrap border-b-2 border-black pb-2.5">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-black stroke-[2.5]" />
                    <span className="font-mono text-xs font-black uppercase tracking-wider text-black">
                      DEVICE MESH & PAIRING TOPOLOGY
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-[#FFF5C2] border border-black rounded text-[9px] font-mono font-black uppercase text-black">
                      {isOwner
                        ? '10 MASTER STATIONS'
                        : user?.email
                          ? '5 AUTHORIZED DEVICES'
                          : '3 PERSONAL DEVICES'}
                    </span>
                  </div>
                </div>

                {/* Device Quota Meter & Slots Indicator */}
                <div className="p-2.5 bg-[#FFFDF5] rounded-xl border-2 border-black flex items-center justify-between gap-3 flex-wrap shadow-[1.5px_1.5px_0px_#000000]">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2 font-mono text-[11px] font-black uppercase text-black">
                      <span>DEVICE SLOTS:</span>
                      <span className="text-emerald-700">{activeSlotsCount} OF {maxDeviceQuota} CONNECTED</span>
                    </div>
                    <p className="text-[10px] font-mono text-neutral-600">
                      {isOwner
                        ? 'Master Cluster: Live Firestore cloud sync across all your hardware.'
                        : user?.email
                          ? 'Optimal P2P WebRTC Quota: Connect up to 5 personal laptops and phones.'
                          : 'Offline Mesh Quota: Connect up to 3 personal devices without central servers.'}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0" title={`${activeSlotsCount} of ${maxDeviceQuota} device slots active`}>
                    {Array.from({ length: maxDeviceQuota }).map((_, idx) => (
                      <div
                        key={idx}
                        className={`w-3.5 h-3.5 rounded-full border-2 border-black transition-all ${
                          idx < activeSlotsCount
                            ? 'bg-[#00E599] shadow-[1px_1px_0px_#000000]'
                            : 'bg-neutral-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Dual Node Mesh Visualizer (This Device <-> Companion Device) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {/* Node 1: Local Device */}
                  <div className="p-3 bg-neutral-50 rounded-xl border-2 border-black shadow-[2px_2px_0px_#000000] space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-mono font-black uppercase text-neutral-500">
                        LOCAL NODE • THIS DEVICE
                      </span>
                      <span className="px-1.5 py-0.5 bg-[#00E599] border border-black rounded text-[8px] font-mono font-black uppercase text-black">
                        CURRENT ACTIVE
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center shrink-0">
                        {currentDevice.type === 'mobile' ? (
                          <Smartphone className="w-4 h-4 stroke-[2.5]" />
                        ) : (
                          <Monitor className="w-4 h-4 stroke-[2.5]" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <span className="font-display font-black text-xs uppercase text-black block truncate">
                          {currentDevice.label}
                        </span>
                        <span className="font-mono text-[10px] text-neutral-600 block">
                          {localEntryCount} entries saved locally
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Node 2: Paired Companion Device */}
                  <div className="p-3 bg-neutral-50 rounded-xl border-2 border-black shadow-[2px_2px_0px_#000000] space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-mono font-black uppercase text-neutral-500">
                        COMPANION NODE • REMOTE
                      </span>
                      <span className={`px-1.5 py-0.5 border border-black rounded text-[8px] font-mono font-black uppercase ${
                        isOwner || peerBackupMeta?.hasPayload ? 'bg-[#00E599] text-black' : 'bg-neutral-200 text-neutral-700'
                      }`}>
                        {isOwner ? 'CLOUD SYNCHRONIZED' : peerBackupMeta?.hasPayload ? 'PAIRED & MIRRORED' : 'STANDBY'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-lg border border-black flex items-center justify-center shrink-0 ${
                        isOwner || peerBackupMeta?.hasPayload ? 'bg-[#FDC800] text-black' : 'bg-neutral-200 text-neutral-600'
                      }`}>
                        {peerBackupMeta?.hasPayload && peerBackupMeta.peerDeviceName.includes('Mobile') ? (
                          <Smartphone className="w-4 h-4 stroke-[2.5]" />
                        ) : (
                          <Laptop className="w-4 h-4 stroke-[2.5]" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <span className="font-display font-black text-xs uppercase text-black block truncate">
                          {isOwner
                            ? 'All Signed-In Stations'
                            : peerBackupMeta?.hasPayload
                              ? peerBackupMeta.peerDeviceName
                              : (user?.email ? 'Second Account Station' : 'Second Mesh Device')}
                        </span>
                        <span className="font-mono text-[10px] text-neutral-600 block truncate">
                          {isOwner
                            ? 'Instant Firestore cloud parity'
                            : peerBackupMeta?.hasPayload
                              ? `${peerBackupMeta.entryCount} entries mirrored • Safe`
                              : 'Open Daily Verdict on 2nd device to pair'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* MUTUAL DISASTER RECOVERY SAFETY NET (For both Google and Guest modes) */}
              <div className="p-3.5 bg-white rounded-2xl border-2 border-black shadow-[3px_3px_0px_#000000] space-y-2.5">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-black stroke-[2.5]" />
                    <h4 className="font-display font-black text-xs uppercase text-black">
                      Mutual Disaster Recovery Safety Net
                    </h4>
                  </div>
                  {peerBackupMeta && peerBackupMeta.hasPayload ? (
                    <span className="px-2 py-0.5 bg-[#00E599] border border-black rounded text-[9px] font-mono font-black uppercase text-black">
                      SAFETY BACKUP READY
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-neutral-200 border border-black rounded text-[9px] font-mono font-black uppercase text-neutral-700">
                      NO BACKUP DETECTED
                    </span>
                  )}
                </div>

                <p className="text-[11px] font-mono text-neutral-600 leading-relaxed">
                  {peerBackupMeta && peerBackupMeta.hasPayload
                    ? `Holds an offline replica containing ${peerBackupMeta.entryCount} entries from "${peerBackupMeta.peerDeviceName}". If this device is wiped, recover everything in 1 tap.`
                    : 'Whenever your devices sync, they save an offline safety backup of each other so you can recover if this device is ever lost or wiped.'}
                </p>

                {peerBackupMeta && peerBackupMeta.hasPayload && (
                  <button
                    type="button"
                    onClick={handleDisasterRecovery}
                    className="w-full py-2.5 px-3 bg-[#FDC800] hover:bg-yellow-400 text-black border-2 border-black rounded-xl font-mono text-xs font-black uppercase shadow-[2px_2px_0px_#000000] cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
                  >
                    <RotateCcw className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Restore All Entries from Paired Peer</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TAB 1: GOOGLE BEAM (DIRECT BROWSER-TO-BROWSER) */}
          {activeSection === 'transfer' && mode === 'account' && (
            <div className="space-y-3.5 pt-1">
              <div className="p-3.5 bg-[#FFF5C2] rounded-2xl border-2 border-black shadow-[2.5px_2.5px_0px_#000000] space-y-1.5 font-mono text-xs text-neutral-900 font-bold leading-relaxed">
                <div className="flex items-center justify-between gap-2 flex-wrap text-black font-black uppercase text-[11px]">
                  <div className="flex items-center gap-2">
                    <Laptop className="w-4 h-4 text-black stroke-[2.5] shrink-0" />
                    <span>DIRECT GOOGLE ACCOUNT BEAM (WEBRTC)</span>
                  </div>
                  <span className="px-2 py-0.5 bg-black text-[#00E599] rounded text-[9px] font-mono font-black">
                    PEER-TO-PEER
                  </span>
                </div>
                <p>
                  Beam your complete database directly browser-to-browser between any two devices signed into <span className="text-black font-black underline">{user?.email}</span> over an encrypted WebRTC tunnel.
                </p>
                <p className="text-[11px] text-neutral-700 font-medium">
                  • Step 1: Open this tab on Device A and tap <strong>Broadcast As Host</strong>.<br />
                  • Step 2: Open this tab on Device B and tap <strong>1-Tap Fetch Entries</strong>.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 bg-white rounded-2xl border-2 border-black shadow-[3px_3px_0px_#000000] space-y-2 flex flex-col justify-between">
                  <div className="space-y-1">
                    <span className="px-2 py-0.5 bg-neutral-100 border border-black rounded text-[9px] font-mono font-black uppercase text-neutral-700 inline-block">
                      STEP 1: SENDER (DEVICE A)
                    </span>
                    <h4 className="font-display font-black text-sm uppercase text-black">
                      Broadcast As Host
                    </h4>
                    <p className="text-[11px] font-mono text-neutral-600 leading-snug">
                      Activate this device so your second device can discover and fetch entries.
                    </p>
                  </div>

                  {isHostingAccount ? (
                    <div className="space-y-2 pt-2">
                      <div className="p-2 bg-[#00E599] border-2 border-black rounded-xl font-mono text-[11px] font-black uppercase text-black text-center shadow-[1.5px_1.5px_0px_#000000] animate-pulse">
                        HOST ACTIVE • AWAITING REMOTE DEVICE
                      </div>
                      <button
                        type="button"
                        onClick={stopActiveSession}
                        className="w-full py-1.5 px-3 bg-red-100 hover:bg-red-200 text-red-900 border border-black rounded-xl font-mono text-[10px] font-black uppercase cursor-pointer"
                      >
                        Stop Broadcasting
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={handleStartAccountHost}
                      className="w-full py-2.5 px-3 bg-[#FDC800] hover:bg-amber-400 border-2 border-black rounded-xl font-mono text-xs font-black uppercase text-black shadow-[2px_2px_0px_#000000] cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-50"
                    >
                      <Zap className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Broadcast As Host</span>
                    </button>
                  )}
                </div>

                <div className="p-3.5 bg-white rounded-2xl border-2 border-black shadow-[3px_3px_0px_#000000] space-y-2 flex flex-col justify-between">
                  <div className="space-y-1">
                    <span className="px-2 py-0.5 bg-neutral-100 border border-black rounded text-[9px] font-mono font-black uppercase text-neutral-700 inline-block">
                      STEP 2: RECEIVER (DEVICE B)
                    </span>
                    <h4 className="font-display font-black text-sm uppercase text-black">
                      Fetch From Host
                    </h4>
                    <p className="text-[11px] font-mono text-neutral-600 leading-snug">
                      Connect to your broadcasting host device and pull all entries directly.
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={handleFetchFromAccountHost}
                    className="w-full py-2.5 px-3 bg-[#00E599] hover:bg-emerald-400 border-2 border-black rounded-xl font-mono text-xs font-black uppercase text-black shadow-[2px_2px_0px_#000000] cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-50"
                  >
                    <Download className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>1-Tap Fetch Entries</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: QR BEAM (SENDER MODE) */}
          {activeSection === 'transfer' && mode === 'send' && (
            <div className="space-y-3.5 pt-1">
              <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-2xl border-2 border-black shadow-[3px_3px_0px_#000000]">
                {/* QR Code Container */}
                <div
                  className="w-44 h-44 bg-[#FFFDF8] p-2 border-2 border-black rounded-xl shadow-[2px_2px_0px_#000000] flex items-center justify-center shrink-0"
                  dangerouslySetInnerHTML={{ __html: qrSvgHtml }}
                />

                <div className="space-y-2 text-center sm:text-left flex-1">
                  <span className="text-[10px] font-mono font-black text-neutral-500 uppercase tracking-wider block">
                    Pairing Code
                  </span>
                  <div className="inline-block px-3.5 py-1.5 bg-[#FFF9E6] border-2 border-black rounded-xl font-mono text-xl font-black tracking-widest text-black shadow-[2px_2px_0px_#000000]">
                    {pairingCode}
                  </div>

                  <p className="text-xs font-mono text-neutral-700 font-medium leading-relaxed">
                    1. Scan with phone camera, or open on second device.<br />
                    2. Tap <strong>Activate Sender Antenna</strong> to listen for connection.
                  </p>

                  <div className="flex flex-wrap items-center gap-2 pt-1 justify-center sm:justify-start">
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="px-3 py-1 bg-white hover:bg-neutral-100 border border-black rounded-lg font-mono text-[11px] font-black uppercase cursor-pointer shadow-[1px_1px_0px_#000000] flex items-center gap-1 active:translate-x-px"
                    >
                      <Copy className="w-3 h-3 stroke-[2.5]" />
                      <span>{copiedLink ? 'Link Copied!' : 'Copy Link'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleGenerateNewCode}
                      className="px-3 py-1 bg-neutral-100 hover:bg-neutral-200 border border-black rounded-lg font-mono text-[11px] font-black uppercase cursor-pointer shadow-[1px_1px_0px_#000000] flex items-center gap-1 active:translate-x-px"
                    >
                      <RefreshCw className="w-3 h-3 stroke-[2.5]" />
                      <span>New Code</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Approval Gate Banner */}
              {pendingApproval && (
                <div className="p-4 bg-[#00E599] rounded-2xl border-3 border-black shadow-[4px_4px_0px_#000000] space-y-2.5">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-black stroke-2" />
                    <h4 className="font-display font-black text-xs uppercase text-black">
                      Receiver Connected — Approve Egress?
                    </h4>
                  </div>
                  <p className="font-mono text-[11px] text-black leading-snug">
                    A peer device with code <strong>{pairingCode}</strong> has paired over WebRTC. Confirm to beam your local entries.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playClick();
                      pendingApproval.approve();
                      setPendingApproval(null);
                    }}
                    className="w-full py-2.5 bg-black text-[#00E599] hover:bg-neutral-800 border-2 border-black rounded-xl font-mono text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_#000000] cursor-pointer"
                  >
                    Approve & Beam Diary
                  </button>
                </div>
              )}

              {/* Action Button */}
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleStartSender}
                className="w-full py-3 px-4 bg-[#FDC800] hover:bg-amber-400 border-2 border-black rounded-xl font-mono text-xs sm:text-sm font-black uppercase text-black shadow-[3px_3px_0px_#000000] cursor-pointer flex items-center justify-center gap-2 active:scale-98 transition-all disabled:opacity-50"
              >
                <Zap className="w-4 h-4 stroke-[2.5]" />
                <span>{isProcessing ? 'Listening for Receiver...' : 'Activate Sender Antenna'}</span>
              </button>
            </div>
          )}

          {/* TAB 3: RECEIVE BY CODE */}
          {activeSection === 'transfer' && mode === 'receive' && (
            <div className="space-y-3.5 pt-1">
              <div className="p-4 bg-white rounded-2xl border-2 border-black shadow-[3px_3px_0px_#000000] space-y-2.5">
                <span className="text-[10px] font-mono font-black text-neutral-500 uppercase tracking-wider block">
                  Enter 6-Digit Code from Sending Device
                </span>

                <input
                  type="text"
                  placeholder="e.g. BEAM-482"
                  value={receiveInputCode}
                  onChange={(e) => setReceiveInputCode(e.target.value.toUpperCase())}
                  className="w-full p-3.5 bg-[#FFFDF5] border-2 border-black rounded-xl font-mono text-lg font-black tracking-widest text-center uppercase focus:outline-none focus:ring-2 focus:ring-black shadow-[2px_2px_0px_#000000]"
                />

                <p className="text-xs font-mono text-neutral-600 font-medium leading-relaxed">
                  Make sure the sender device has the modal open and has clicked <strong>Activate Sender Antenna</strong>.
                </p>
              </div>

              <button
                type="button"
                disabled={isProcessing || !receiveInputCode.trim()}
                onClick={handleStartReceiver}
                className="w-full py-3 px-4 bg-[#00E599] hover:bg-emerald-400 border-2 border-black rounded-xl font-mono text-xs sm:text-sm font-black uppercase text-black shadow-[3px_3px_0px_#000000] cursor-pointer flex items-center justify-center gap-2 active:scale-98 transition-all disabled:opacity-50"
              >
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                <span>{isProcessing ? 'Connecting to Sender...' : 'Connect & Import Entries'}</span>
              </button>
            </div>
          )}

          {/* TAB 4: OFFLINE RAW JSON TRANSIT BEAM */}
          {activeSection === 'transfer' && mode === 'raw' && (
            <div className="space-y-3 pt-1">
              <div className="p-3.5 bg-neutral-50 rounded-2xl border-2 border-black shadow-[2px_2px_0px_#000000] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-black uppercase text-neutral-500">
                    100% Offline AirDrop Transfer
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const payload = getLocalSyncPayload();
                      setRawTextPayload(JSON.stringify(payload, null, 2));
                      navigator.clipboard.writeText(JSON.stringify(payload));
                      soundEngine.playSuccessChime();
                      showToast('Database copied to clipboard!', 'info');
                    }}
                    className="px-2.5 py-1 bg-black text-white rounded-lg font-mono text-[10px] font-black uppercase cursor-pointer"
                  >
                    Copy My Database
                  </button>
                </div>

                <textarea
                  rows={5}
                  placeholder="Paste database JSON payload here to restore on this device..."
                  value={rawTextPayload}
                  onChange={(e) => setRawTextPayload(e.target.value)}
                  className="w-full p-3 bg-white border-2 border-black rounded-xl font-mono text-xs focus:outline-none focus:ring-2 focus:ring-black leading-relaxed"
                />
              </div>

              <button
                type="button"
                disabled={!rawTextPayload.trim()}
                onClick={handleImportRawText}
                className="w-full py-3 px-4 bg-[#00E599] hover:bg-emerald-400 border-2 border-black rounded-xl font-mono text-xs sm:text-sm font-black uppercase text-black shadow-[3px_3px_0px_#000000] cursor-pointer flex items-center justify-center gap-2 active:scale-98 transition-all disabled:opacity-50"
              >
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>Import Pasted Database</span>
              </button>
            </div>
          )}

          {/* Status & Feedback Area */}
          {syncStatus !== 'Idle' && (
            <div className="p-3 bg-[#FFF9E6] border-2 border-black rounded-xl font-mono text-xs font-black text-amber-950 flex items-center gap-2 shadow-[2px_2px_0px_#000000]">
              <Radio className="w-3.5 h-3.5 stroke-[2.5] animate-spin" />
              <span>STATUS: {syncStatus}</span>
            </div>
          )}

          {/* Detailed Success Box */}
          {successResult && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="p-4 bg-[#00E599] border-3 border-black rounded-2xl shadow-[4px_4px_0px_#000000] space-y-1.5"
            >
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-black text-white flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4 stroke-3" />
                </div>
                <span className="font-display font-black text-sm uppercase tracking-wider text-black">
                  TRANSFER SUCCESSFUL!
                </span>
              </div>
              <div className="pl-9 space-y-1 font-mono text-xs font-black text-black">
                <p>
                  {successResult.importedCount !== undefined
                    ? `Successfully synchronized and verified ${successResult.importedCount} entries into local storage.`
                    : 'All diary records synchronized successfully.'}
                </p>
                <p className="text-[11px] font-bold text-emerald-950/80">
                  Zero records were uploaded to the cloud. Direct encrypted WebRTC tunnel closed.
                </p>
              </div>
            </motion.div>
          )}

          {/* Detailed Error / Failure Box */}
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="p-4 bg-[#FF4D4D] border-3 border-black rounded-2xl shadow-[4px_4px_0px_#000000] space-y-2 text-white"
            >
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-black text-white flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-4 h-4 text-white stroke-[2.5]" />
                </div>
                <span className="font-display font-black text-sm uppercase tracking-wider text-white">
                  TRANSFER FAILED
                </span>
              </div>
              <div className="pl-9 space-y-2 font-mono text-xs font-bold text-white">
                <p className="font-black text-white text-xs">{errorMessage}</p>
                <div className="p-2.5 bg-black/35 rounded-xl text-[11px] font-mono leading-relaxed space-y-1">
                  <span className="font-black text-amber-300 block uppercase">HOW TO FIX THIS:</span>
                  <p>1. Ensure <strong>both devices</strong> are actively connected to the internet.</p>
                  <p>2. Keep Daily Verdict open in a visible browser tab on the sending device (do not allow the computer to sleep).</p>
                  <p>3. If using strict corporate Wi-Fi or VPN, switch to the <strong>Offline Text</strong> tab to copy/paste directly.</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Footer Safety Notice */}
          <div className="pt-1 text-center">
            <span className="text-[10px] font-mono text-neutral-500 font-bold">
              Direct WebRTC RTCDataChannel • AES-GCM Encrypted Transit • Disconnects automatically on completion
            </span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
