import React from 'react';
import * as Sentry from '@sentry/react';
import { AlertTriangle, RotateCcw, Copy, Check, ChevronDown, ChevronUp, ShieldCheck, Terminal } from 'lucide-react';

/**
 * 🛡️ Neobrutalist Production React Error Boundary
 * Protects users from White Screen of Death crashes, guarantees local diary safety,
 * offers 1-tap reload, diagnostics copying, and optional Sentry monitoring.
 */
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      copied: false,
      showDetails: false
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error('🛡️ [ErrorBoundary Caught Exception]:', error, errorInfo);

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

  handleCopyDiagnostics = () => {
    const { error, errorInfo } = this.state;
    const diagnostics = `=== SHIT OR HIT CRASH REPORT ===
Timestamp: ${new Date().toISOString()}
URL: ${window.location.href}
Error: ${error?.name}: ${error?.message}
Stack:
${error?.stack || 'No JS stack available'}
Component Stack:
${errorInfo?.componentStack || 'No component stack available'}
User Agent: ${navigator.userAgent}
================================`;

    navigator.clipboard.writeText(diagnostics).then(() => {
      this.setState({ copied: true });
      setTimeout(() => this.setState({ copied: false }), 2500);
    }).catch(() => {
      // Fallback if clipboard API restricted
      alert('Report copied to console.');
      console.log(diagnostics);
    });
  };

  toggleDetails = () => {
    this.setState(prev => ({ showDetails: !prev.showDetails }));
  };

  render() {
    if (this.state.hasError) {
      const { error, errorInfo, copied, showDetails } = this.state;

      return (
        <div className="min-h-screen bg-[#FFFDF8] text-black font-sans flex flex-col items-center justify-center p-4 sm:p-6 select-none">
          <div className="w-full max-w-xl bg-[#FFF9E6] border-3 border-black shadow-[6px_6px_0px_#000000] rounded-2xl p-6 sm:p-8 flex flex-col gap-6 relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Top Accent Stripe */}
            <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-[#FF6B6B] via-[#FFE66D] to-[#4ECDC4] border-b-2 border-black" />

            {/* Header section with Neobrutalist Badges */}
            <div className="flex items-start justify-between gap-4 mt-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#FF6B6B] border-2 border-black shadow-[3px_3px_0px_#000000] flex items-center justify-center text-white shrink-0">
                  <AlertTriangle className="w-7 h-7 stroke-[2.5]" />
                </div>
                <div>
                  <span className="inline-block px-2.5 py-0.5 bg-black text-[#FFE66D] text-[10px] font-black tracking-wider uppercase rounded-md border border-black mb-1">
                    CONTAINED RESILIENCE
                  </span>
                  <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-black leading-tight">
                    Something went wonky!
                  </h1>
                </div>
              </div>
            </div>

            {/* Calming Reassurance Card */}
            <div className="bg-[#4ECDC4]/20 border-2 border-black rounded-xl p-4 flex items-center gap-3 shadow-[2px_2px_0px_#000000]">
              <ShieldCheck className="w-6 h-6 text-[#1A535C] shrink-0 stroke-[2.5]" />
              <p className="text-sm font-bold text-black leading-snug">
                Rest easy homie: your local diary records, reflections, and habit streaks are safe and untouched.
              </p>
            </div>

            {/* Error Message Summary */}
            <div className="bg-white border-2 border-black rounded-xl p-4 shadow-[3px_3px_0px_#000000]">
              <div className="text-xs font-mono font-bold text-gray-500 uppercase mb-1">Error Signal:</div>
              <div className="text-sm font-mono font-black text-[#D90429] break-words">
                {error?.message || 'Unexpected application runtime exception'}
              </div>
            </div>

            {/* Primary Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={this.handleReload}
                className="flex-1 py-3 px-5 bg-[#FFE66D] hover:bg-[#FFDE4D] border-2 border-black font-black uppercase tracking-wider text-sm rounded-xl shadow-[3px_3px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4 stroke-[2.5]" />
                Reload App
              </button>

              <button
                onClick={this.handleCopyDiagnostics}
                className="py-3 px-5 bg-white hover:bg-gray-50 border-2 border-black font-black uppercase tracking-wider text-sm rounded-xl shadow-[3px_3px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all flex items-center justify-center gap-2"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-green-600 stroke-[3]" />
                    <span className="text-green-700">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 stroke-[2.5]" />
                    <span>Copy Report</span>
                  </>
                )}
              </button>
            </div>

            {/* Expandable Technical Guts */}
            <div className="border-t-2 border-black/20 pt-3">
              <button
                onClick={this.toggleDetails}
                className="flex items-center justify-between w-full text-xs font-mono font-black uppercase tracking-wider text-gray-700 hover:text-black transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Terminal className="w-3.5 h-3.5" />
                  {showDetails ? 'Hide Technical Stack Trace' : 'Inspect Technical Guts'}
                </span>
                {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showDetails && (
                <div className="mt-3 p-3 bg-black text-[#A7FFEB] font-mono text-[11px] rounded-lg border-2 border-black max-h-48 overflow-auto whitespace-pre-wrap select-text leading-relaxed">
                  <div className="text-[#FFD166] font-bold mb-1">
                    {error?.name}: {error?.message}
                  </div>
                  {error?.stack}
                  {errorInfo?.componentStack && (
                    <div className="mt-2 pt-2 border-t border-gray-700 text-gray-400">
                      Component Stack:
                      {errorInfo.componentStack}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
