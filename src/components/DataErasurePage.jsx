import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Trash2, 
  AlertTriangle, 
  Clock, 
  Download, 
  RotateCcw, 
  ShieldAlert, 
  CheckCircle2, 
  FileText,
  FileSpreadsheet,
  FileCode,
  Terminal,
  AlertOctagon,
  Key,
  ExternalLink,
  Check,
  FlaskConical,
  Database,
  Lock
} from 'lucide-react';
import { 
  scheduleAccountDeletion, 
  cancelAccountDeletion, 
  getPendingDeletionStatus, 
  exportEntriesToCsv,
  exportDiaryDigestToMarkdown 
} from '../services/api';
import { soundEngine } from '../services/soundEngine';
import mascotCoolingOff from '../assets/mascots/mascot_cooling_off_guardian.png';
import mascotFarewell from '../assets/mascots/mascot_farewell_decommission.png';

export default function DataErasurePage({ onBack, isDemo = false, entries = {} }) {
  const isSandboxDemo = isDemo || (typeof window !== 'undefined' && window.location.search.includes('demo=true'));

  // Sandbox demo state
  const [demoPending, setDemoPending] = useState(false);
  const [demoStatus, setDemoStatus] = useState({
    pending: false,
    daysRemaining: 7,
    hoursRemaining: 168,
    minutesRemaining: 10080,
    scheduledDateStr: new Date().toISOString().slice(0, 10),
    executeDateStr: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10)
  });

  // Real status
  const [realStatus, setRealStatus] = useState(() => getPendingDeletionStatus());
  const [confirmText, setConfirmText] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [nowSec, setNowSec] = useState(Date.now());

  // Live ticking clock for countdown precision
  useEffect(() => {
    const timer = setInterval(() => {
      setNowSec(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const activeStatus = isSandboxDemo ? demoStatus : realStatus;
  const isDeletionPending = isSandboxDemo ? demoPending : Boolean(realStatus && realStatus.pending);

  const showToast = (msg) => {
    try { soundEngine.playClick(); } catch (e) {}
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const handleBack = () => {
    try { soundEngine.playClick(); } catch (e) {}
    if (onBack) {
      onBack();
    } else if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', '/');
      window.location.href = '/';
    }
  };

  const handleOpenPrivacy = () => {
    try { soundEngine.playClick(); } catch (e) {}
    if (typeof window !== 'undefined') {
      window.location.href = '/?view=privacy';
    }
  };

  const handleScheduleDeletion = () => {
    if (confirmText.trim().toUpperCase() !== 'DELETE') {
      showToast('CONFIRMATION REQUIRED: Please type DELETE in uppercase.');
      return;
    }
    if (!agreedToTerms) {
      showToast('CHECKBOX REQUIRED: Please confirm acknowledgment of the 7-day holding protocol.');
      return;
    }

    try { soundEngine.playRoughTone(); } catch (e) {}

    if (isSandboxDemo) {
      setDemoPending(true);
      setDemoStatus({
        pending: true,
        daysRemaining: 7,
        hoursRemaining: 168,
        minutesRemaining: 10080,
        scheduledDateStr: new Date().toISOString().slice(0, 10),
        executeDateStr: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10)
      });
      setConfirmText('');
      setAgreedToTerms(false);
      showToast('[SANDBOX DEMO] 7-Day Cooling-off deletion simulated. Zero real records touched.');
    } else {
      scheduleAccountDeletion(7);
      setRealStatus(getPendingDeletionStatus());
      setConfirmText('');
      setAgreedToTerms(false);
      showToast('7-Day Cooling-Off Period Activated. You have 7 days to cancel at any time.');
    }
  };

  const handleCancelDeletion = () => {
    try { soundEngine.playSuccess(); } catch (e) {}

    if (isSandboxDemo) {
      setDemoPending(false);
      setDemoStatus(prev => ({ ...prev, pending: false }));
      showToast('[SANDBOX DEMO] Deletion aborted. Account fully preserved.');
    } else {
      cancelAccountDeletion();
      setRealStatus(getPendingDeletionStatus());
      showToast('Account Deletion Aborted. All diary entries and habits remain fully intact.');
    }
  };

  const handleExportBackup = (format = 'json') => {
    try { soundEngine.playClick(); } catch (e) {}
    const sampleEntries = Object.keys(entries).length > 0 ? entries : {
      [new Date().toISOString().slice(0, 10)]: {
        rating: 4,
        notes: 'Backup export memory archive',
        verdict: 'Hit'
      }
    };

    if (format === 'csv') {
      exportEntriesToCsv(sampleEntries);
      showToast('RFC 4180 CSV export completed and downloaded.');
    } else if (format === 'markdown') {
      exportDiaryDigestToMarkdown(sampleEntries);
      showToast('Markdown diary digest generated and downloaded.');
    } else {
      const blob = new Blob([JSON.stringify(sampleEntries, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `shit_or_hit_vault_backup_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      showToast('Raw JSON vault archive generated and downloaded.');
    }
  };

  // Calculate live countdown
  const getCountdownParts = () => {
    if (!isDeletionPending) {
      return { days: '07', hours: '00', mins: '00', secs: '00' };
    }
    const targetMs = activeStatus?.executeDateStr 
      ? new Date(activeStatus.executeDateStr).getTime() 
      : Date.now() + 7 * 86400000;
    const diff = Math.max(0, targetMs - nowSec);

    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);

    return {
      days: String(d).padStart(2, '0'),
      hours: String(h).padStart(2, '0'),
      mins: String(m).padStart(2, '0'),
      secs: String(s).padStart(2, '0')
    };
  };

  const countdown = getCountdownParts();

  return (
    <div className="min-h-screen bg-[#0C0D11] text-white font-sans selection:bg-[#FF4D4D] selection:text-white">
      {/* Sandbox Isolation Header */}
      {isSandboxDemo && (
        <aside aria-label="Demo notice" className="bg-[#FFB800] text-black border-b-3 border-black py-2.5 px-4 sticky top-0 z-50 shadow-[0_2px_0px_#000000]">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-mono font-black">
            <div className="flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-black" />
              <span>ISOLATED VISUAL DEMO SANDBOX — ZERO PERSISTENT MUTATIONS OR DELETIONS OCCUR</span>
            </div>
            <span className="bg-black text-[#FFB800] px-2.5 py-0.5 rounded text-[11px] font-black uppercase tracking-wider">
              SAFE AUDIT MODE
            </span>
          </div>
        </aside>
      )}

      {/* Structural Industrial Header */}
      <header className="border-b-3 border-black bg-[#12141A] px-4 sm:px-8 py-3.5 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleBack}
              className="flex items-center gap-2 bg-[#1A1D26] hover:bg-[#FFB800] hover:text-black text-white px-3.5 py-1.5 rounded-xl border-2 border-black font-mono font-black text-xs cursor-pointer shadow-[2px_2px_0px_#000000] active:translate-x-px active:translate-y-px transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>RETURN TO DASHBOARD</span>
            </button>
            <span className="text-neutral-600 hidden md:inline font-mono">/</span>
            <span className="font-mono text-xs font-bold text-neutral-400 hidden md:inline tracking-wider uppercase">
              TERMINAL // SOVEREIGN_DECOMMISSIONING_GATE
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleOpenPrivacy}
              className="flex items-center gap-1.5 bg-[#1A1D26] hover:bg-neutral-800 text-neutral-300 px-3 py-1.5 rounded-xl border-2 border-black font-mono font-black text-xs cursor-pointer shadow-[2px_2px_0px_#000000]"
            >
              <span>DPDPA CHARTER</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Toast Notification HUD */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-6 z-50 bg-[#FFB800] text-black border-2 border-black px-5 py-3 rounded-2xl font-mono text-xs font-black shadow-[4px_4px_0px_#000000] flex items-center gap-3"
          >
            <Terminal className="w-4 h-4 text-black shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Panoramic Industrial Headline */}
      <section className="border-b-3 border-black bg-[#161821] px-4 sm:px-8 py-10 sm:py-12">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1 bg-[#FF4D4D] text-black border-2 border-black rounded-lg text-xs font-mono font-black uppercase shadow-[2px_2px_0px_#000000]">
                SECTION 12 RIGHT TO ERASURE
              </span>
              <span className="px-3 py-1 bg-[#FFB800] text-black border-2 border-black rounded-lg text-xs font-mono font-black uppercase shadow-[2px_2px_0px_#000000]">
                COOLING-OFF BUFFER: 7 DAYS
              </span>
              <span className="px-3 py-1 bg-white/10 text-neutral-300 border border-white/20 rounded-lg text-xs font-mono">
                ZERO VENDOR LOCK-IN GUARANTEE
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-display font-black tracking-tight text-white leading-tight">
              Air-Gapped Sovereign Decommissioning Terminal
            </h1>

            <p className="text-sm sm:text-base text-neutral-400 font-sans leading-relaxed">
              Under DPDPA 2023 Section 12, you hold the unconditional right to permanent data erasure. To safeguard against emotional burnout or accidental deletion, all requests enter a mandatory <strong>7-Day Regret-Proof Holding Pattern</strong> before physical cryptographic wipe.
            </p>
          </div>

          {/* Terminal State Status Box */}
          <div className="w-full lg:w-auto shrink-0 bg-[#0C0D11] border-2 border-neutral-700 rounded-2xl p-5 font-mono text-xs space-y-3">
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${isDeletionPending ? 'bg-[#FF4D4D] animate-ping' : 'bg-[#00E599]'}`} />
              <span className="font-black tracking-wider uppercase text-white">
                {isDeletionPending ? 'DECOMMISSIONING ARMED' : 'SOVEREIGN CUSTODY ACTIVE'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-neutral-400 pt-1 border-t border-neutral-800">
              <div>
                <span className="text-[10px] text-neutral-500 block uppercase">HOLD PROTOCOL</span>
                <span className="font-black text-white">7-DAY COOLING-OFF</span>
              </div>
              <div>
                <span className="text-[10px] text-neutral-500 block uppercase">ABORT RESTRICTION</span>
                <span className="font-black text-[#00E599]">NONE (1-CLICK)</span>
              </div>
              <div>
                <span className="text-[10px] text-neutral-500 block uppercase">LOCAL PURGE</span>
                <span className="font-black text-[#FFB800]">ALL STORAGE KEYS</span>
              </div>
              <div>
                <span className="text-[10px] text-neutral-500 block uppercase">CLOUD PURGE</span>
                <span className="font-black text-[#FFB800]">BATCH FIRESTORE</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Full-Screen Asymmetric Terminal Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Column A (Left): Mandatory Sovereign Data Salvage Bay (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="border-3 border-black rounded-3xl p-6 bg-[#161821] shadow-[5px_5px_0px_#000000] space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#FFB800] text-black flex items-center justify-center border-2 border-black shrink-0">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-mono font-black uppercase text-[#FFB800] block">
                    STAGE 01 // MANDATORY PRE-ERASURE SALVAGE
                  </span>
                  <h2 className="text-xl font-display font-black text-white">
                    Extract Your Sovereign Archive
                  </h2>
                </div>
              </div>

              <p className="text-xs text-neutral-400 font-sans leading-relaxed">
                Before decommissioning, exercise your Section 11 statutory right to download your complete behavioral history. Once the 7-day period expires, cryptographic recovery is mathematically impossible.
              </p>

              {/* 3 Download Pods */}
              <div className="space-y-3 pt-1">
                {/* JSON Pod */}
                <div className="border-2 border-black rounded-2xl p-4 bg-[#1C1F2B] hover:border-[#FFB800] transition-colors space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-white font-mono font-bold text-xs">
                      <FileCode className="w-4 h-4 text-[#00E599]" />
                      <span>COMPLETE VAULT JSON DUMP</span>
                    </div>
                    <span className="text-[10px] font-mono bg-black text-[#00E599] px-2 py-0.5 rounded border border-neutral-700">
                      RFC 8259
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-400 font-sans">
                    Raw encrypted and plaintext diary entries, habit anchor metrics, multi-sphere scores, and metadata.
                  </p>
                  <button
                    type="button"
                    onClick={() => handleExportBackup('json')}
                    className="w-full py-2 bg-black hover:bg-[#FFB800] hover:text-black text-[#FFB800] rounded-xl border border-neutral-700 font-mono font-black text-xs cursor-pointer flex items-center justify-center gap-2 transition-all shadow-[2px_2px_0px_#000000]"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>DOWNLOAD RAW JSON ARCHIVE</span>
                  </button>
                </div>

                {/* CSV Pod */}
                <div className="border-2 border-black rounded-2xl p-4 bg-[#1C1F2B] hover:border-[#FFB800] transition-colors space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-white font-mono font-bold text-xs">
                      <FileSpreadsheet className="w-4 h-4 text-[#FDC800]" />
                      <span>RFC 4180 CSV SPREADSHEET</span>
                    </div>
                    <span className="text-[10px] font-mono bg-black text-[#FDC800] px-2 py-0.5 rounded border border-neutral-700">
                      EXCEL / SHEETS
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-400 font-sans">
                    Formatted tabular matrix containing chronological dates, numerical ratings, verdicts, and reflections.
                  </p>
                  <button
                    type="button"
                    onClick={() => handleExportBackup('csv')}
                    className="w-full py-2 bg-black hover:bg-[#FFB800] hover:text-black text-[#FFB800] rounded-xl border border-neutral-700 font-mono font-black text-xs cursor-pointer flex items-center justify-center gap-2 transition-all shadow-[2px_2px_0px_#000000]"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>DOWNLOAD CSV SPREADSHEET</span>
                  </button>
                </div>

                {/* Markdown Digest Pod */}
                <div className="border-2 border-black rounded-2xl p-4 bg-[#1C1F2B] hover:border-[#FFB800] transition-colors space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-white font-mono font-bold text-xs">
                      <FileText className="w-4 h-4 text-[#00D8F6]" />
                      <span>MARKDOWN JOURNAL DIGEST</span>
                    </div>
                    <span className="text-[10px] font-mono bg-black text-[#00D8F6] px-2 py-0.5 rounded border border-neutral-700">
                      OBSIDIAN / NOTION
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-400 font-sans">
                    Chronological reader-friendly markdown digest compatible with personal knowledge management tools.
                  </p>
                  <button
                    type="button"
                    onClick={() => handleExportBackup('markdown')}
                    className="w-full py-2 bg-black hover:bg-[#FFB800] hover:text-black text-[#FFB800] rounded-xl border border-neutral-700 font-mono font-black text-xs cursor-pointer flex items-center justify-center gap-2 transition-all shadow-[2px_2px_0px_#000000]"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>DOWNLOAD MARKDOWN DIGEST</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Statutory Safety Note */}
            <div className="border-2 border-neutral-800 rounded-2xl p-4 bg-black/40 text-neutral-400 text-xs font-mono space-y-1.5">
              <div className="flex items-center gap-2 text-white font-bold">
                <ShieldAlert className="w-4 h-4 text-[#FFB800]" />
                <span>CRYPTOGRAPHIC LOSS NOTICE:</span>
              </div>
              <p className="leading-relaxed">
                Because client-side encryption uses zero-knowledge AES-256 keys derived from your secret, no admin bypass or master key exists. Once erased, data is mathematically irrecoverable.
              </p>
            </div>
          </div>

          {/* Column B (Right): Decommissioning Interlock Reactor & 7-Day Cooling-Off Console (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {isDeletionPending ? (
              /* State 1: Deletion is Pending (Active Cooling-Off Holding Pattern) */
              <div className="border-3 border-black rounded-3xl p-6 sm:p-8 bg-[#161821] shadow-[6px_6px_0px_#000000] space-y-6">
                {/* Hazard Bar */}
                <div className="h-4 rounded-full border-2 border-black overflow-hidden bg-[repeating-linear-gradient(45deg,#000,#000_10px,#FFB800_10px,#FFB800_20px)]" />

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#FF4D4D] animate-ping" />
                    <span className="text-xs font-mono font-black uppercase text-[#FF4D4D] tracking-wider">
                      COOLING-OFF HOLDING PATTERN ACTIVE
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-display font-black text-white">
                    Statutory 7-Day Cancellation Window
                  </h2>
                  <p className="text-xs sm:text-sm text-neutral-400 font-sans leading-relaxed">
                    Your deletion request is safely parked in our <strong>7-Day Regret-Proof Buffer</strong>. All diary entries remain completely intact and functional until the countdown reaches zero.
                  </p>
                </div>

                {/* 7-Day Custodian Anime Mascot Banner */}
                <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl bg-[#0C0D11] border-2 border-black shadow-[3px_3px_0px_#000000]">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 shrink-0 rounded-2xl border-2 border-black overflow-hidden bg-[#161821] shadow-[2px_2px_0px_#000000]">
                    <img src={mascotCoolingOff} alt="Cooling-off safe guardian" className="w-full h-full object-cover" />
                  </div>
                  <div className="space-y-1.5 text-center sm:text-left">
                    <span className="px-2.5 py-0.5 rounded bg-[#FFB800] text-black font-mono text-[10px] font-black uppercase inline-block">
                      7-Day Safe Custodian Active
                    </span>
                    <p className="text-xs text-neutral-300 font-sans leading-relaxed">
                      Your vault is parked in an air-gapped safe with a 7-day holding protocol. Zero records are touched. You can abort at any time with a single click.
                    </p>
                  </div>
                </div>

                {/* Mechanical Flip-Clock Matrix */}
                <div className="border-2 border-black rounded-3xl p-6 bg-[#0C0D11] space-y-4 shadow-[4px_4px_0px_#000000]">
                  <div className="flex items-center justify-between text-xs font-mono text-neutral-500 font-bold border-b border-neutral-800 pb-2">
                    <span>TIME REMAINING UNTIL CRYPTOGRAPHIC PURGE:</span>
                    <span className="text-[#FFB800] flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>TICKING LIVE</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-2 sm:gap-4 text-center font-mono">
                    {/* Days */}
                    <div className="bg-[#1C1F2B] border-2 border-black rounded-2xl p-3 sm:p-4 shadow-[2px_2px_0px_#000000]">
                      <span className="text-2xl sm:text-4xl font-black text-white block">
                        {countdown.days}
                      </span>
                      <span className="text-[10px] text-neutral-400 font-bold uppercase mt-1 block">
                        DAYS
                      </span>
                    </div>

                    {/* Hours */}
                    <div className="bg-[#1C1F2B] border-2 border-black rounded-2xl p-3 sm:p-4 shadow-[2px_2px_0px_#000000]">
                      <span className="text-2xl sm:text-4xl font-black text-white block">
                        {countdown.hours}
                      </span>
                      <span className="text-[10px] text-neutral-400 font-bold uppercase mt-1 block">
                        HOURS
                      </span>
                    </div>

                    {/* Minutes */}
                    <div className="bg-[#1C1F2B] border-2 border-black rounded-2xl p-3 sm:p-4 shadow-[2px_2px_0px_#000000]">
                      <span className="text-2xl sm:text-4xl font-black text-white block">
                        {countdown.mins}
                      </span>
                      <span className="text-[10px] text-neutral-400 font-bold uppercase mt-1 block">
                        MINS
                      </span>
                    </div>

                    {/* Seconds */}
                    <div className="bg-[#1C1F2B] border-2 border-black rounded-2xl p-3 sm:p-4 shadow-[2px_2px_0px_#000000]">
                      <span className="text-2xl sm:text-4xl font-black text-[#FFB800] block">
                        {countdown.secs}
                      </span>
                      <span className="text-[10px] text-neutral-400 font-bold uppercase mt-1 block">
                        SECS
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs font-mono text-neutral-400 pt-2 border-t border-neutral-800">
                    <div>
                      <span className="text-[10px] text-neutral-500 block">ARMED ON:</span>
                      <span className="text-white font-bold">{activeStatus.scheduledDateStr || 'Active Session'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-neutral-500 block">PURGE TARGET:</span>
                      <span className="text-[#FF4D4D] font-bold">{activeStatus.executeDateStr || 'In 7 Days'}</span>
                    </div>
                  </div>
                </div>

                {/* Hero 1-Click Abort Action Button */}
                <div className="space-y-3 pt-2">
                  <button
                    type="button"
                    onClick={handleCancelDeletion}
                    className="w-full py-4 px-6 bg-[#00E599] hover:bg-emerald-400 text-black rounded-2xl border-3 border-black font-mono font-black text-sm cursor-pointer shadow-[5px_5px_0px_#000000] active:translate-x-px active:translate-y-px flex items-center justify-center gap-3 transition-all uppercase tracking-wider"
                  >
                    <RotateCcw className="w-5 h-5 stroke-[2.5]" />
                    <span>ABORT ACCOUNT DELETION & RESTORE SOVEREIGNTY</span>
                  </button>
                  <p className="text-[11px] text-center text-neutral-400 font-mono">
                    Zero penalties. Your streak, journals, and encryption keys will remain permanently preserved.
                  </p>
                </div>
              </div>
            ) : (
              /* State 2: Deletion is NOT Scheduled (Armed Interlock Terminal) */
              <div className="border-3 border-black rounded-3xl p-6 sm:p-8 bg-[#161821] shadow-[6px_6px_0px_#000000] space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#FF4D4D] text-black flex items-center justify-center border-2 border-black shrink-0">
                    <AlertOctagon className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-black uppercase text-[#FF4D4D] block">
                      STAGE 02 // STATUTORY ERASURE INITIATION
                    </span>
                    <h2 className="text-xl sm:text-2xl font-display font-black text-white">
                      Arm 7-Day Cooling-Off Erasure
                    </h2>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-neutral-400 font-sans leading-relaxed">
                  Initiating this protocol schedules your complete account and journal dossier for irreversible cryptographic wiping. You will have exactly 7 days to cancel before execution.
                </p>

                {/* Farewell Decommission Anime Mascot Card */}
                <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl bg-[#0C0D11] border-2 border-black shadow-[3px_3px_0px_#000000]">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 shrink-0 rounded-2xl border-2 border-black overflow-hidden bg-[#161821] shadow-[2px_2px_0px_#000000]">
                    <img src={mascotFarewell} alt="Farewell anime protagonist" className="w-full h-full object-cover" />
                  </div>
                  <div className="space-y-1.5 text-center sm:text-left">
                    <span className="px-2.5 py-0.5 rounded bg-[#FF4D4D] text-black font-mono text-[10px] font-black uppercase inline-block">
                      Same Dreams • Different Place
                    </span>
                    <p className="text-xs text-neutral-300 font-sans leading-relaxed">
                      Zero dark patterns. If you ever choose to part ways, your data will be dismantled with total mathematical finality and zero digital footprints left behind.
                    </p>
                  </div>
                </div>

                {/* Industrial Confirmation Box */}
                <div className="border-2 border-black rounded-2xl p-5 bg-[#0C0D11] space-y-4 shadow-[3px_3px_0px_#000000]">
                  <div className="space-y-1.5 font-mono text-xs">
                    <label htmlFor="confirm-delete-input" className="text-neutral-400 font-bold block">
                      STEP 1: TYPE <span className="text-[#FF4D4D] font-black underline">DELETE</span> TO UNLOCK ARMING MECHANISM:
                    </label>
                    <input
                      id="confirm-delete-input"
                      type="text"
                      value={confirmText}
                      onChange={(e) => setConfirmText(e.target.value)}
                      placeholder="TYPE DELETE HERE..."
                      className="w-full bg-[#1A1D26] border-2 border-neutral-700 focus:border-[#FF4D4D] text-white px-3 py-2 rounded-xl font-mono text-xs tracking-widest uppercase outline-none"
                    />
                  </div>

                  <div className="space-y-2 pt-2 border-t border-neutral-800">
                    <label className="flex items-start gap-3 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={agreedToTerms}
                        onChange={(e) => setAgreedToTerms(e.target.checked)}
                        className="mt-1 w-4 h-4 accent-[#FF4D4D] cursor-pointer"
                      />
                      <span className="text-[11px] text-neutral-300 font-sans leading-relaxed">
                        STEP 2: I acknowledge that a <strong>7-Day Cooling-Off holding pattern</strong> will begin immediately. After 7 days, all diary entries and habit data across local and cloud storage will be permanently destroyed.
                      </span>
                    </label>
                  </div>
                </div>

                {/* Arm Action Button */}
                <div className="space-y-2 pt-1">
                  <button
                    type="button"
                    onClick={handleScheduleDeletion}
                    disabled={confirmText.trim().toUpperCase() !== 'DELETE' || !agreedToTerms}
                    className={`w-full py-3.5 px-6 rounded-2xl border-3 border-black font-mono font-black text-xs cursor-pointer shadow-[4px_4px_0px_#000000] active:translate-x-px active:translate-y-px flex items-center justify-center gap-2 transition-all uppercase tracking-wider ${
                      confirmText.trim().toUpperCase() === 'DELETE' && agreedToTerms
                        ? 'bg-[#FF4D4D] hover:bg-red-500 text-black cursor-pointer'
                        : 'bg-neutral-800 text-neutral-500 border-neutral-700 cursor-not-allowed shadow-none'
                    }`}
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>ARM 7-DAY COOLING-OFF ERASURE PROTOCOL</span>
                  </button>
                  <p className="text-[10px] text-neutral-500 font-mono text-center">
                    Protected by Section 12(3) DPDPA 2023. Cancelable at any time during the 7-day period.
                  </p>
                </div>
              </div>
            )}

            {/* Scope of Obliteration Matrix */}
            <div className="border-3 border-black rounded-3xl p-6 bg-[#161821] shadow-[4px_4px_0px_#000000] space-y-3">
              <div className="flex items-center gap-2 text-white font-mono text-xs font-bold">
                <Database className="w-4 h-4 text-[#00E599]" />
                <span>EXACT SCOPE OF PERMANENT OBLITERATION:</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 font-mono text-[11px]">
                <div className="p-2.5 bg-[#0C0D11] border border-neutral-800 rounded-xl text-neutral-300">
                  <span className="text-[#FF4D4D] font-bold block">&times; Local Storage Database</span>
                  <span>goodness_db_* and all cached ratings</span>
                </div>
                <div className="p-2.5 bg-[#0C0D11] border border-neutral-800 rounded-xl text-neutral-300">
                  <span className="text-[#FF4D4D] font-bold block">&times; Cloud Firestore Entries</span>
                  <span>Encrypted user document partitions</span>
                </div>
                <div className="p-2.5 bg-[#0C0D11] border border-neutral-800 rounded-xl text-neutral-300">
                  <span className="text-[#FF4D4D] font-bold block">&times; Habit Anchors & Spheres</span>
                  <span>Non-negotiables and daily checklists</span>
                </div>
                <div className="p-2.5 bg-[#0C0D11] border border-neutral-800 rounded-xl text-neutral-300">
                  <span className="text-[#FF4D4D] font-bold block">&times; AES Vault Credentials</span>
                  <span>Salted PBKDF2 hash & recovery salts</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
