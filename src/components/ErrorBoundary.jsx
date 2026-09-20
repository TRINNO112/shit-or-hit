import React from 'react';
import * as Sentry from '@sentry/react';
import {
  AlertTriangle,
  RotateCcw,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Terminal,
  Skull,
  Glasses,
  DoorOpen,
  Bug,
  Download
} from 'lucide-react';

/**
 * 🛡️ Neobrutalist Production React Error Boundary & Reactor Core Shield
 * Protects users from White Screen of Death crashes, traps uncaught window & promise errors,
 * provides sarcastic nerdy diagnostics, and includes safe recovery actions.
 */
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      copied: false,
      showDetails: false,
      errorOrigin: 'react' // 'react' | 'promise' | 'window'
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error, errorOrigin: 'react' };
  }

  componentDidMount() {
    // Only capture fatal global script syntax errors, do NOT trip reactor on background promise rejections
    window.addEventListener('unhandledrejection', this.handleUnhandledRejection);
    window.addEventListener('error', this.handleWindowError);
  }

  componentWillUnmount() {
    window.removeEventListener('unhandledrejection', this.handleUnhandledRejection);
    window.removeEventListener('error', this.handleWindowError);
  }

  handleUnhandledRejection = (event) => {
    // Log and report to Sentry silently, do NOT unmount the entire application
    console.warn('🛡️ [ErrorBoundary Observed Background Promise Rejection]:', event.reason);
    try {
      if (Sentry?.captureException) {
        Sentry.captureException(event.reason, {
          tags: { mechanism: 'unhandledrejection_silent' }
        });
      }
    } catch (e) {}
  };

  handleWindowError = (event) => {
    // Ignore benign cross-origin, ResizeObserver, or 3rd party script noise
    if (
      event.message?.includes('ResizeObserver') || 
      event.message?.includes('Script error') ||
      event.filename?.includes('chrome-extension')
    ) {
      return;
    }
    console.warn('🛡️ [ErrorBoundary Global Window Event]:', event.error || event.message);
  };

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo, errorOrigin: 'react' });
    console.error('🛡️ [ErrorBoundary Caught React Exception]:', error, errorInfo);

    // Sentry telemetry hook
    try {
      if (Sentry?.captureException) {
        Sentry.captureException(error, {
          extra: {
            componentStack: errorInfo?.componentStack,
            url: window.location.href,
            timestamp: new Date().toISOString()
          }
        });
      }
    } catch (e) {
      // Sentry hook failure should never break UI containment
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  handleRebootSafeMode = () => {
    try {
      sessionStorage.setItem('daily_verdict_safe_mode', 'true');
      window.location.href = '/';
    } catch (e) {
      window.location.reload();
    }
  };

  handleEmergencyDownload = () => {
    try {
      let mergedEntries = {};
      let foundStartDate = null;
      
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && (k.startsWith('goodness_db') || k.includes('verdict'))) {
          try {
            const val = JSON.parse(localStorage.getItem(k));
            if (val && typeof val === 'object') {
              if (val.entries && typeof val.entries === 'object') {
                mergedEntries = { ...mergedEntries, ...val.entries };
              }
              if (val.startDate && !foundStartDate) foundStartDate = val.startDate;
            }
          } catch (e) {}
        }
      }
      
      const rescuePayload = {
        rescueTimestamp: new Date().toISOString(),
        startDate: foundStartDate || new Date().toISOString().slice(0, 10),
        totalEntriesRescued: Object.keys(mergedEntries).length,
        entries: mergedEntries,
        systemStatus: 'RESCUED_VIA_EMERGENCY_REACTOR_CORE'
      };
      
      const blob = new Blob([JSON.stringify(rescuePayload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `shit_or_hit_emergency_rescue_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      this.setState({ rescueDownloaded: true });
    } catch (err) {
      alert('Emergency export failed. Your data is still safely in localStorage.');
    }
  };

  handleRestoreSnapshot = () => {
    try {
      let targetKey = 'goodness_db_guest';
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith('goodness_db_') && !k.includes('_snapshot_')) {
          targetKey = k;
          break;
        }
      }

      let restoredData = null;
      for (let ring = 1; ring <= 3; ring++) {
        const raw = localStorage.getItem(`${targetKey}_snapshot_${ring}`);
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            if (parsed && typeof parsed === 'object') {
              restoredData = parsed.db || parsed;
              break;
            }
          } catch (e) {}
        }
      }

      if (restoredData) {
        localStorage.setItem(targetKey, JSON.stringify(restoredData));
        sessionStorage.removeItem('daily_verdict_safe_mode');
        window.location.reload();
      } else {
        alert('No valid Time Machine snapshots found. Please use Emergency Rescue to download raw diary JSON.');
      }
    } catch (err) {
      alert('Snapshot restore failed: ' + err.message);
    }
  };

  hasAvailableSnapshot = () => {
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.includes('_snapshot_')) {
          return true;
        }
      }
    } catch (e) {}
    return false;
  };

  handleDismiss = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false
    });
    try {
      if (window.location.search || window.location.hash) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    } catch (e) { }
  };

  handleCopyDiagnostics = () => {
    const { error, errorInfo, errorOrigin } = this.state;
    const diagnostics = `=== SHIT OR HIT CRASH REPORT ===
Timestamp: ${new Date().toISOString()}
Origin: ${errorOrigin.toUpperCase()} REACTOR FAULT
URL: ${window.location.href}
Error: ${error?.name}: ${error?.message}
Stack:
${error?.stack || 'No JS stack available'}
Component / Trace Stack:
${errorInfo?.componentStack || 'No component stack available'}
User Agent: ${navigator.userAgent}
================================`;

    navigator.clipboard.writeText(diagnostics).then(() => {
      this.setState({ copied: true });
      setTimeout(() => this.setState({ copied: false }), 2500);
    }).catch(() => {
      alert('Report dumped to console.');
      console.log(diagnostics);
    });
  };

  toggleDetails = () => {
    this.setState(prev => ({ showDetails: !prev.showDetails }));
  };

  render() {
    if (this.state.hasError) {
      const { error, errorInfo, copied, showDetails, errorOrigin } = this.state;

      return (
        <div className="min-h-screen bg-[#FFFDF8] text-black font-sans flex flex-col items-center justify-center p-4 sm:p-6 select-none">
          <div className="w-full max-w-xl bg-[#FFF9E6] border-3 border-black shadow-[8px_8px_0px_#000000] rounded-3xl p-6 sm:p-8 flex flex-col gap-5 relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Top Hazard Accent Stripe */}
            <div className="absolute top-0 left-0 right-0 h-3.5 bg-[repeating-linear-gradient(45deg,#000000,#000000_12px,#FFE66D_12px,#FFE66D_24px)] border-b-2 border-black" />

            {/* Header section with Neobrutalist Badges */}
            <div className="flex items-start justify-between gap-4 mt-2">
              <div className="flex items-center gap-3">
                <div className="w-13 h-13 rounded-2xl bg-[#FF4D4D] border-2 border-black shadow-[3px_3px_0px_#000000] flex items-center justify-center text-white shrink-0">
                  <Skull className="w-7 h-7 stroke-[2.5]" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="inline-block px-2 py-0.5 bg-black text-[#FFE66D] text-[10px] font-mono font-black tracking-wider uppercase rounded border border-black">
                      CONTAINED RESILIENCE
                    </span>
                    <span className="inline-block px-2 py-0.5 bg-[#FF4D4D] text-white text-[10px] font-mono font-black tracking-wider uppercase rounded border border-black">
                      {errorOrigin.toUpperCase()} TRIP
                    </span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-black leading-tight">
                    REACTOR TRIPPED: DON&apos;T PANIC!
                  </h1>
                </div>
              </div>
            </div>

            {/* Calming Reassurance Card */}
            <div className="bg-[#00E599]/20 border-2 border-black rounded-2xl p-4 flex items-center gap-3 shadow-[3px_3px_0px_#000000]">
              <ShieldCheck className="w-6 h-6 text-[#006644] shrink-0 stroke-[2.5]" />
              <p className="text-xs sm:text-sm font-bold text-black leading-snug">
                Rest easy homie: your local diary records, reflections, and habit streaks are safe, untouched, and fully secured.
              </p>
            </div>

            {/* Error Message Summary */}
            <div className="bg-white border-2 border-black rounded-2xl p-4 shadow-[3px_3px_0px_#000000]">
              <div className="text-[10px] font-mono font-black text-neutral-500 uppercase mb-1 flex items-center gap-1.5">
                <Bug className="w-3.5 h-3.5 text-[#FF4D4D]" />
                <span>FAULT SIGNAL DETECTED:</span>
              </div>
              <div className="text-xs sm:text-sm font-mono font-black text-[#D90429] wrap-break-words">
                {error?.name ? `${error.name}: ` : ''}{error?.message || 'Unexpected application runtime exception'}
              </div>
            </div>

            {/* Primary Action Buttons */}
            <div className="space-y-2.5">
              {/* Emergency Diary Rescue Download Button */}
              <button
                type="button"
                onClick={this.handleEmergencyDownload}
                className="w-full py-3.5 px-4 bg-[#00E599] hover:bg-emerald-400 border-2 border-black font-mono font-black uppercase tracking-wider text-xs rounded-xl shadow-[3px_3px_0px_#000000] active:translate-x-px active:translate-y-px transition-all flex items-center justify-center gap-2 cursor-pointer text-black"
              >
                {this.state.rescueDownloaded ? (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>DIARY BACKUP DOWNLOADED SUCCESSFULLY</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 stroke-[2.5]" />
                    <span>EMERGENCY RESCUE: DOWNLOAD MY DIARY (JSON)</span>
                  </>
                )}
              </button>

              {/* Time Machine Snapshot 1-Tap Recovery Button */}
              {this.hasAvailableSnapshot() && (
                <button
                  type="button"
                  onClick={this.handleRestoreSnapshot}
                  className="w-full py-3 px-4 bg-[#FDC800] hover:bg-yellow-400 border-2 border-black font-mono font-black uppercase tracking-wider text-xs rounded-xl shadow-[3px_3px_0px_#000000] active:translate-x-px active:translate-y-px transition-all flex items-center justify-center gap-2 cursor-pointer text-black"
                >
                  <RotateCcw className="w-4 h-4 stroke-[2.5]" />
                  <span>TIME MACHINE: RESTORE FROM LATEST SNAPSHOT</span>
                </button>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={this.handleReload}
                  className="py-2.5 px-3 bg-[#FFE66D] hover:bg-[#FFDE4D] border-2 border-black font-black uppercase tracking-wider text-[11px] rounded-xl shadow-[2px_2px_0px_#000000] active:translate-x-px active:translate-y-px transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Reboot</span>
                </button>

                <button
                  type="button"
                  onClick={this.handleRebootSafeMode}
                  className="py-2.5 px-3 bg-white hover:bg-neutral-100 border-2 border-black font-black uppercase tracking-wider text-[11px] rounded-xl shadow-[2px_2px_0px_#000000] active:translate-x-px active:translate-y-px transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5 stroke-[2.5] text-emerald-700" />
                  <span>Safe Mode</span>
                </button>

                <button
                  type="button"
                  onClick={this.handleCopyDiagnostics}
                  className="py-2.5 px-3 bg-white hover:bg-neutral-100 border-2 border-black font-black uppercase tracking-wider text-[11px] rounded-xl shadow-[2px_2px_0px_#000000] active:translate-x-px active:translate-y-px transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600 stroke-3" />
                      <span className="text-emerald-700">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Copy Incident</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Expandable Technical Details Drawer */}
            <div className="border-t-2 border-black/15 pt-2">
              <button
                type="button"
                onClick={this.toggleDetails}
                className={`flex items-center justify-between w-full py-3 px-4 rounded-xl border-2 border-black text-xs font-mono font-black uppercase tracking-wide transition-all cursor-pointer shadow-[2px_2px_0px_#000000] active:scale-[0.99] ${
                  showDetails 
                    ? 'bg-[#FFE66D] hover:bg-[#FFDE4D] text-black' 
                    : 'bg-white hover:bg-neutral-50 text-neutral-800 hover:text-black'
                }`}
                title="Toggle raw stack trace diagnostics"
              >
                <span className="flex items-center gap-2">
                  <Glasses className="w-4 h-4 text-black stroke-[2.5]" />
                  <span>
                    {showDetails
                      ? '🙈 "IT IS BEYOND MY LIMITS" (HIDE TECHNICAL DETAILS)'
                      : '🔍 INSPECT TECHNICAL ERROR DETAILS'}
                  </span>
                </span>
                {showDetails ? <ChevronUp className="w-4 h-4 stroke-[2.5]" /> : <ChevronDown className="w-4 h-4 stroke-[2.5]" />}
              </button>
            </div>

            {showDetails && (
              <div className="mt-3 p-3.5 bg-black text-[#A7FFEB] font-mono text-[11px] rounded-xl border-2 border-black max-h-56 overflow-auto whitespace-pre-wrap select-text leading-relaxed">
                <div className="text-[#FFD166] font-bold pb-2 mb-2 border-b border-neutral-700 flex flex-col gap-1">
                  <span className="text-[10px] text-[#FF6B6B] uppercase font-black">
                      // ⚠️ ADVISORY WARNING: 99.4% OF MORTALS CLOSE THIS BOX IN UNDER 3 SECONDS.
                  </span>
                  <span className="text-neutral-400 text-[10px]">
                      // Inspecting raw V8 stack traces without a double espresso may induce existential dread.
                  </span>
                  <span className="text-neutral-400 text-[10px]">
                      // If you are an engineer: Yes, undefined is not a function. No, rewriting it in Rust won&apos;t fix your posture.
                  </span>
                </div>

                <div className="text-[#FFE66D] font-bold mb-1">
                  {error?.name}: {error?.message}
                </div>
                {error?.stack}
                {errorInfo?.componentStack && (
                  <div className="mt-2 pt-2 border-t border-neutral-700 text-neutral-400">
                    Component Stack:
                    {errorInfo.componentStack}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

