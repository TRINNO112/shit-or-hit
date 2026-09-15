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
  Bug
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
    window.addEventListener('unhandledrejection', this.handleUnhandledRejection);
    window.addEventListener('error', this.handleWindowError);
  }

  componentWillUnmount() {
    window.removeEventListener('unhandledrejection', this.handleUnhandledRejection);
    window.removeEventListener('error', this.handleWindowError);
  }

  handleUnhandledRejection = (event) => {
    console.error('🛡️ [ErrorBoundary Trapped Unhandled Promise Rejection]:', event.reason);
    const reason = event.reason;
    const err = reason instanceof Error ? reason : new Error(typeof reason === 'string' ? reason : JSON.stringify(reason || 'Unhandled Promise Rejection'));
    this.setState({
      hasError: true,
      error: err,
      errorInfo: { componentStack: 'Trapped via window.unhandledrejection listener' },
      errorOrigin: 'promise'
    });
  };

  handleWindowError = (event) => {
    // Ignore benign cross-origin or resize observer noise
    if (event.message?.includes('ResizeObserver') || event.message?.includes('Script error')) {
      return;
    }
    console.error('🛡️ [ErrorBoundary Trapped Global Window Error]:', event.error || event.message);
    const err = event.error instanceof Error ? event.error : new Error(event.message || 'Global uncaught script error');
    this.setState({
      hasError: true,
      error: err,
      errorInfo: { componentStack: `Line ${event.lineno}, Column ${event.colno} in ${event.filename}` },
      errorOrigin: 'window'
    });
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

  handleDismiss = () => {
    // Sarcastic exit: User confesses it is beyond their limits
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false
    });
    // If on a broken route or URL query, clear query params
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={this.handleReload}
                className="py-3 px-4 bg-[#FFE66D] hover:bg-[#FFDE4D] border-2 border-black font-black uppercase tracking-wider text-xs rounded-xl shadow-3px_3px_0px_#000000 active:translate-x-1px active:translate-y-1px active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 stroke-[2.5]" />
                <span>Reboot Reactor</span>
              </button>

              <button
                type="button"
                onClick={this.handleCopyDiagnostics}
                className="py-3 px-4 bg-white hover:bg-neutral-50 border-2 border-black font-black uppercase tracking-wider text-xs rounded-xl shadow-3px_3px_0px_#000000 active:translate-x-1px active:translate-y-1px active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600 stroke-3" />
                    <span className="text-emerald-700">Report Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 stroke-[2.5]" />
                    <span>Copy Incident Dossier</span>
                  </>
                )}
              </button>
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

