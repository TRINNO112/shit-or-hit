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
  HardDrive
} from 'lucide-react';
import { soundEngine } from '../services/soundEngine';
import { generateQRCodeSVG } from '../services/qrGenerator';
import { 
  generatePairingCode, 
  startSenderSession, 
  joinReceiverSession,
  getLocalSyncPayload,
  importSyncPayload,
  getAccountRoomId,
  checkAccountHostActive
} from '../services/p2pSyncEngine';

export default function P2PDeviceSyncModal({ 
  isOpen, 
  onClose, 
  user = null, 
  onLogin = null, 
  onSyncComplete 
}) {
  const [mode, setMode] = useState(() => (user?.email ? 'account' : 'send'));
  const [pairingCode, setPairingCode] = useState(() => generatePairingCode());
  const [syncStatus, setSyncStatus] = useState('Idle');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isHostingAccount, setIsHostingAccount] = useState(false);
  const [successResult, setSuccessResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [receiveInputCode, setReceiveInputCode] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [rawTextPayload, setRawTextPayload] = useState('');

  const cleanupRef = useRef(null);

  // Auto-detect sync parameter in URL
  useEffect(() => {
    if (typeof window !== 'undefined' && isOpen) {
      const urlParams = new URLSearchParams(window.location.search);
      const urlSyncCode = urlParams.get('sync');
      if (urlSyncCode) {
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
    setSyncStatus('Idle');
  };

  // 1. QR / Code Sender Session
  const handleStartSender = async () => {
    soundEngine.playClick();
    setIsProcessing(true);
    setErrorMessage('');
    setSuccessResult(null);

    stopActiveSession();

    const session = await startSenderSession(
      pairingCode,
      (status) => setSyncStatus(status),
      (result) => {
        soundEngine.playSuccessChime();
        setIsProcessing(false);
        setSuccessResult(result);
        setSyncStatus('Transfer Complete!');
        if (onSyncComplete) onSyncComplete();
      },
      (err) => {
        soundEngine.playRoughTone();
        setIsProcessing(false);
        setErrorMessage(err.message || 'Peer-to-peer connection timed out.');
      }
    );

    cleanupRef.current = session?.cleanup;
  };

  // 2. Code Receiver Session
  const handleStartReceiver = async () => {
    if (!receiveInputCode.trim()) {
      setErrorMessage('Please enter the 6-character code from the sending device.');
      return;
    }

    soundEngine.playClick();
    setIsProcessing(true);
    setErrorMessage('');
    setSuccessResult(null);

    stopActiveSession();

    const session = await joinReceiverSession(
      receiveInputCode.trim(),
      (status) => setSyncStatus(status),
      (result) => {
        soundEngine.playSuccessChime();
        setIsProcessing(false);
        setSuccessResult(result);
        setSyncStatus('Sync Successful!');
        if (onSyncComplete) onSyncComplete();
      },
      (err) => {
        soundEngine.playRoughTone();
        setIsProcessing(false);
        setErrorMessage(err.message || 'Failed to connect to sender device.');
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

    const session = await startSenderSession(
      roomCode,
      (status) => setSyncStatus(status),
      (result) => {
        soundEngine.playSuccessChime();
        setIsProcessing(false);
        setIsHostingAccount(false);
        setSuccessResult(result);
        setSyncStatus('Beamed successfully to your remote device!');
        if (onSyncComplete) onSyncComplete();
      },
      (err) => {
        soundEngine.playRoughTone();
        setIsProcessing(false);
        setIsHostingAccount(false);
        setErrorMessage(err.message || 'Account session timed out.');
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

    const session = await joinReceiverSession(
      roomCode,
      (status) => setSyncStatus(status),
      (result) => {
        soundEngine.playSuccessChime();
        setIsProcessing(false);
        setSuccessResult(result);
        setSyncStatus('Successfully fetched from your other device!');
        if (onSyncComplete) onSyncComplete();
      },
      (err) => {
        soundEngine.playRoughTone();
        setIsProcessing(false);
        setErrorMessage(
          'Could not connect to your other device. Make sure your office computer has Daily Verdict open in an active tab and clicked "Broadcast as Host".'
        );
      }
    );

    cleanupRef.current = session?.cleanup;
  };

  const handleCopyLink = () => {
    soundEngine.playClick();
    navigator.clipboard.writeText(syncUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleGenerateNewCode = () => {
    soundEngine.playClick();
    stopActiveSession();
    setPairingCode(generatePairingCode());
    setSuccessResult(null);
    setErrorMessage('');
  };

  const handleImportRawText = () => {
    try {
      soundEngine.playClick();
      const parsed = JSON.parse(rawTextPayload);
      const res = importSyncPayload(parsed);
      soundEngine.playSuccessChime();
      setSuccessResult(res);
      if (onSyncComplete) onSyncComplete();
    } catch (e) {
      soundEngine.playRoughTone();
      setErrorMessage('Invalid JSON payload. Please paste a valid export.');
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-100 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md select-none overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.93, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.93, y: 20 }}
          transition={{ type: 'spring', stiffness: 350, damping: 28 }}
          className="bg-[#FFFDF8] border-3 border-black rounded-3xl p-5 sm:p-7 max-w-xl w-full shadow-[8px_8px_0px_#000000] relative space-y-4 text-black my-auto max-h-[92vh] overflow-y-auto"
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
                WEBRTC DIRECT TUNNEL
              </span>
              <span className="px-2 py-0.5 rounded-md bg-[#FDC800] text-black border border-black font-mono text-[10px] font-black uppercase shadow-[1px_1px_0px_#000000]">
                ZERO CLOUD STORAGE
              </span>
            </div>
            <h3 className="font-display font-black text-xl sm:text-2xl uppercase tracking-tight text-black leading-tight">
              P2P Direct Device Sync
            </h3>
            <p className="text-xs font-mono text-neutral-600 font-bold">
              Beam your diary database directly between phone & PC over an encrypted peer-to-peer tunnel.
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => { soundEngine.playClick(); stopActiveSession(); setMode('account'); }}
              className={`py-2 px-2 rounded-xl border-2 border-black font-mono text-[11px] font-black uppercase cursor-pointer transition-all shadow-[2px_2px_0px_#000000] flex items-center justify-center gap-1.5 ${
                mode === 'account' 
                  ? 'bg-[#00E599] text-black' 
                  : 'bg-white hover:bg-neutral-50 text-neutral-700'
              }`}
            >
              <Monitor className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Account Fetch</span>
            </button>

            <button
              type="button"
              onClick={() => { soundEngine.playClick(); stopActiveSession(); setMode('send'); }}
              className={`py-2 px-2 rounded-xl border-2 border-black font-mono text-[11px] font-black uppercase cursor-pointer transition-all shadow-[2px_2px_0px_#000000] flex items-center justify-center gap-1.5 ${
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
              className={`py-2 px-2 rounded-xl border-2 border-black font-mono text-[11px] font-black uppercase cursor-pointer transition-all shadow-[2px_2px_0px_#000000] flex items-center justify-center gap-1.5 ${
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
              className={`py-2 px-2 rounded-xl border-2 border-black font-mono text-[11px] font-black uppercase cursor-pointer transition-all shadow-[2px_2px_0px_#000000] flex items-center justify-center gap-1.5 ${
                mode === 'raw' 
                  ? 'bg-neutral-900 text-white' 
                  : 'bg-white hover:bg-neutral-50 text-neutral-700'
              }`}
            >
              <Copy className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Offline Text</span>
            </button>
          </div>

          {/* TAB 1: ACCOUNT-BASED 1-TAP REMOTE FETCH */}
          {mode === 'account' && (
            <div className="space-y-3 pt-1">
              {!user?.email ? (
                <div className="p-4 bg-amber-50 rounded-2xl border-2 border-black shadow-[3px_3px_0px_#000000] space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#FDC800] border-2 border-black flex items-center justify-center shrink-0 shadow-[1px_1px_0px_#000000]">
                      <LogIn className="w-4 h-4 text-black stroke-[2.5]" />
                    </div>
                    <div>
                      <h4 className="font-display font-black text-xs uppercase text-black">
                        Sign In Required for Account Fetch
                      </h4>
                      <p className="text-[10px] font-mono text-neutral-600">
                        Link your devices by signing into the same Google account
                      </p>
                    </div>
                  </div>

                  <p className="font-mono text-xs text-neutral-800 leading-relaxed">
                    Signing into the same Google account on your Office PC and Laptop allows 1-tap peer-to-peer discovery without scanning QR codes.
                  </p>

                  <div className="pt-1 flex flex-col sm:flex-row items-center gap-2">
                    {onLogin && (
                      <button
                        type="button"
                        onClick={onLogin}
                        className="w-full sm:w-auto py-2 px-4 bg-[#FDC800] hover:bg-amber-400 border-2 border-black rounded-xl font-mono text-xs font-black uppercase text-black shadow-[2px_2px_0px_#000000] cursor-pointer flex items-center justify-center gap-2 active:scale-95"
                      >
                        <LogIn className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Sign In With Google</span>
                      </button>
                    )}
                    <span className="text-[10px] font-mono text-neutral-500 font-bold">
                      Or use the QR Beam tab for anonymous guest sync
                    </span>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Account Status Badge */}
                  <div className="p-3 bg-white rounded-2xl border-2 border-black shadow-[2px_2px_0px_#000000] flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-6 h-6 rounded-md bg-[#00E599] border border-black flex items-center justify-center shrink-0 shadow-[1px_1px_0px_#000000]">
                        <Check className="w-3.5 h-3.5 text-black stroke-[2.5]" />
                      </div>
                      <span className="font-mono text-xs font-black uppercase truncate text-black">
                        ACCOUNT: {user.email}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 bg-[#FFF5C2] border border-black rounded text-[9px] font-mono font-black uppercase text-black">
                      P2P DISCOVERY ACTIVE
                    </span>
                  </div>

                  {/* 🚨 MANDATORY ACTIVE STATE ADVISORY */}
                  <div className="p-3 bg-[#FFF5C2] rounded-2xl border-2 border-black shadow-[2px_2px_0px_#000000] space-y-1.5 font-mono text-xs text-neutral-900 font-bold leading-relaxed">
                    <div className="flex items-center gap-2 text-black font-black uppercase text-[11px]">
                      <AlertTriangle className="w-4 h-4 text-amber-700 stroke-[2.5] shrink-0" />
                      CRITICAL: BOTH DEVICES MUST BE ACTIVE AT THE SAME TIME
                    </div>
                    <p>
                      Because your diaries are <strong>never stored on a cloud database</strong>, data travels directly between your devices over an encrypted WebRTC tunnel.
                    </p>
                    <p className="text-[11px] text-neutral-700 font-medium">
                      • Keep this browser tab open on your Office PC while fetching.<br />
                      • If the office PC is sleeping or the browser is closed, your laptop cannot fetch entries.
                    </p>
                  </div>

                  {/* Dual Action Matrix */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Action 1: Broadcast as Host */}
                    <div className="p-3.5 bg-white rounded-2xl border-2 border-black shadow-[3px_3px_0px_#000000] space-y-2 flex flex-col justify-between">
                      <div className="space-y-1">
                        <span className="px-2 py-0.5 bg-neutral-100 border border-black rounded text-[9px] font-mono font-black uppercase text-neutral-700 inline-block">
                          STEP 1: SENDER (OFFICE PC)
                        </span>
                        <h4 className="font-display font-black text-sm uppercase text-black">
                          Broadcast As Host
                        </h4>
                        <p className="text-[11px] font-mono text-neutral-600 leading-snug">
                          Activate this device so your other laptop can fetch its entries.
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

                    {/* Action 2: Fetch From Host */}
                    <div className="p-3.5 bg-white rounded-2xl border-2 border-black shadow-[3px_3px_0px_#000000] space-y-2 flex flex-col justify-between">
                      <div className="space-y-1">
                        <span className="px-2 py-0.5 bg-neutral-100 border border-black rounded text-[9px] font-mono font-black uppercase text-neutral-700 inline-block">
                          STEP 2: RECEIVER (LAPTOP/PHONE)
                        </span>
                        <h4 className="font-display font-black text-sm uppercase text-black">
                          Fetch From Host
                        </h4>
                        <p className="text-[11px] font-mono text-neutral-600 leading-snug">
                          Connect to your broadcasting office device and import entries.
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
            </div>
          )}

          {/* TAB 2: QR BEAM (SENDER MODE) */}
          {mode === 'send' && (
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
          {mode === 'receive' && (
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
          {mode === 'raw' && (
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

          {/* Success Box */}
          {successResult && (
            <div className="p-3.5 bg-[#F0FDF4] border-2 border-emerald-600 rounded-xl font-mono text-xs font-black text-emerald-950 flex items-center gap-2.5 shadow-[2px_2px_0px_#000000]">
              <ShieldCheck className="w-5 h-5 text-emerald-700 stroke-[2.5] shrink-0" />
              <div>
                <span>DIARY TRANSFERRED DIRECTLY VIA P2P TUNNEL!</span>
                <p className="text-[11px] font-medium text-emerald-800 mt-0.5">
                  {successResult.importedCount !== undefined 
                    ? `Synchronized ${successResult.importedCount} entries into local storage.`
                    : 'Entries synchronized safely.'} Zero records were uploaded or stored in the cloud.
                </p>
              </div>
            </div>
          )}

          {/* Error Box */}
          {errorMessage && (
            <div className="p-3.5 bg-red-100 border-2 border-red-500 rounded-xl font-mono text-xs font-black text-red-950 flex items-center gap-2 shadow-[2px_2px_0px_#000000]">
              <AlertTriangle className="w-4 h-4 text-red-700 stroke-[2.5] shrink-0" />
              <span>{errorMessage}</span>
            </div>
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
