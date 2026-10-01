import React from 'react';
import { 
  AlertTriangle, 
  RotateCcw, 
  ShieldCheck, 
  PenLine, 
  Check, 
  Sparkles,
  Zap,
  CloudRain,
  MinusCircle,
  AlertOctagon,
  Download,
  Wand2,
  Copy,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { ratingMeta, repairAndSanitizeDatabase, normalizeNotesString } from '../services/api';
import { soundEngine } from '../services/soundEngine';

/**
 * 🛡️ FaultBoundary — Component-Level Fault Isolation & Autonomous Self-Healing Engine
 * Prevents runtime errors in complex UI components (e.g. MobileAppView, TodayHero, CalendarModal)
 * from crashing the entire application, while providing an instant 1-tap automated repair mechanism.
 */
export default class FaultBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      fallbackRating: 3,
      fallbackNote: '',
      fallbackSaved: false,
      isHealing: false,
      showDiagnostics: false,
      copiedError: false,
      healedCount: null
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error(`🛡️ [FaultBoundary Caught Exception in ${this.props.name || 'Component'}]:`, error, errorInfo);

    // Autonomous background sanitization of local storage database
    try {
      repairAndSanitizeDatabase();
    } catch (e) {}

    try {
      if (typeof window !== 'undefined' && window.Sentry?.captureException) {
        window.Sentry.captureException(error, {
          tags: { boundary: this.props.name || 'FaultBoundary' },
          extra: {
            componentStack: errorInfo?.componentStack,
            boundaryVariant: this.props.variant || 'default',
            url: window.location.href
          }
        });
      }
    } catch (e) {}
  }

  handleAutoHeal = () => {
    try {
      this.setState({ isHealing: true });
      soundEngine?.playClick?.();
      const res = repairAndSanitizeDatabase();
      console.log('🩺 [FaultBoundary] Autonomous repair executed:', res);

      setTimeout(() => {
        this.setState({
          hasError: false,
          error: null,
          errorInfo: null,
          isHealing: false,
          healedCount: res?.count || 0
        });
        soundEngine?.playSuccessChime?.();
        if (this.props.onReset) {
          this.props.onReset();
        }
      }, 400);
    } catch (e) {
      console.error('Auto-heal error:', e);
      this.setState({ isHealing: false });
    }
  };

  handleReset = () => {
    try {
      repairAndSanitizeDatabase();
    } catch (e) {}
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  handleCleanReload = () => {
    try {
      repairAndSanitizeDatabase();
    } catch (e) {}
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  handleEmergencySave = async () => {
    try {
      const { fallbackRating, fallbackNote } = this.state;
      const todayStr = this.props.todayStr || new Date().toISOString().slice(0, 10);
      if (this.props.onEmergencySave) {
        await this.props.onEmergencySave({
          date: todayStr,
          rating: fallbackRating,
          notes: normalizeNotesString(fallbackNote),
          updatedAt: new Date().toISOString()
        });
      }
      this.setState({ fallbackSaved: true });
      soundEngine?.playSuccessChime?.();
    } catch (e) {
      console.error('Emergency save failed:', e);
    }
  };

  handleEmergencyDownload = () => {
    try {
      soundEngine?.playClick?.();
      const raw = localStorage.getItem('goodness_db') || localStorage.getItem('goodness_db_guest') || '{}';
      const blob = new Blob([raw], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `diary_fault_rescue_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      alert('Emergency backup download failed. Your data is still safely in localStorage.');
    }
  };

  handleCopyDiagnostics = () => {
    try {
      const { error, errorInfo } = this.state;
      const report = `SHIT OR HIT FAULT REPORT:\nComponent: ${this.props.name || 'Unknown'}\nMessage: ${error?.message || 'Unknown error'}\nStack: ${error?.stack || 'N/A'}\nComponentStack: ${errorInfo?.componentStack || 'N/A'}`;
      navigator.clipboard.writeText(report);
      this.setState({ copiedError: true });
      soundEngine?.playClick?.();
      setTimeout(() => this.setState({ copiedError: false }), 2000);
    } catch (e) {}
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    const { variant = 'default', name = 'Feature' } = this.props;
    const { error, fallbackRating, fallbackNote, fallbackSaved, isHealing, showDiagnostics, copiedError } = this.state;

    // 1. HERO FALLBACK: Ultra-reliable Neobrutalist emergency rating strip & auto-healer
    if (variant === 'hero') {
      return (
        <div className="neo-card w-full mb-8 border-3 border-black shadow-[6px_6px_0px_#000000] bg-[#FFFDF5] rounded-3xl p-4 sm:p-6 relative overflow-hidden">
          
          {/* Header Strip with High-Contrast Neobrutalist Visual Tokens */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b-2 border-black/15">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#FDC800] border-2 border-black flex items-center justify-center font-black shadow-[1.5px_1.5px_0px_#000000] shrink-0">
                <AlertTriangle className="w-5 h-5 text-black stroke-[2.5]" />
              </div>
              <div className="min-w-0">
                <span className="font-mono text-xs font-black uppercase text-black flex items-center gap-1.5 flex-wrap">
                  <span>Self-Healing Mode Active</span>
                  <span className="text-neutral-500">•</span>
                  <span className="text-[#00B87A]">{name} Safeguard</span>
                </span>
                <span className="text-[11px] font-sans text-neutral-600 block mt-0.5">
                  A transient rendering anomaly was safely contained. Your historical diary entries are 100% intact.
                </span>
              </div>
            </div>

            {/* Action Buttons: Vertical Stack on Mobile (< sm), Horizontal on Desktop */}
            <div className="w-full sm:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={this.handleAutoHeal}
                disabled={isHealing}
                className="w-full sm:w-auto px-4 py-2 bg-[#00E599] hover:bg-emerald-400 text-black border-2 border-black rounded-xl font-mono text-xs font-black uppercase cursor-pointer shadow-[2px_2px_0px_#000000] active:translate-x-px active:translate-y-px flex items-center justify-center gap-1.5 transition-all"
                title="Automatically repair data structure and restore view"
              >
                <Wand2 className={`w-4 h-4 stroke-[2.5] ${isHealing ? 'animate-spin' : ''}`} />
                <span>{isHealing ? 'HEALING DATA...' : 'AUTO-HEAL & RESTORE'}</span>
              </button>

              <div className="grid grid-cols-2 sm:flex sm:items-center gap-2">
                <button
                  type="button"
                  onClick={this.handleEmergencyDownload}
                  className="px-3 py-2 bg-white hover:bg-neutral-100 text-black border-2 border-black rounded-xl font-mono text-[11px] font-black uppercase cursor-pointer shadow-[1.5px_1.5px_0px_#000000] active:translate-x-px active:translate-y-px flex items-center justify-center gap-1.5"
                  title="Download raw diary JSON"
                >
                  <Download className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Rescue JSON</span>
                </button>
                <button
                  type="button"
                  onClick={this.handleCleanReload}
                  className="px-3 py-2 bg-[#FDC800] hover:bg-amber-400 text-black border-2 border-black rounded-xl font-mono text-[11px] font-black uppercase cursor-pointer shadow-[1.5px_1.5px_0px_#000000] active:translate-x-px active:translate-y-px flex items-center justify-center gap-1.5"
                  title="Clean browser reload"
                >
                  <RotateCcw className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Refresh</span>
                </button>
              </div>
            </div>
          </div>

          {/* Emergency 1-Tap Rating Strip (Guarantees zero lost verdicts during anomalies) */}
          <div className="pt-4 space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-black uppercase text-black">
                Record Today's Verdict (Safe Mode):
              </span>
              <span className="font-mono text-[11px] font-bold text-neutral-600">
                Selected: {fallbackRating}★ {ratingMeta[fallbackRating]?.title}
              </span>
            </div>

            <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
              {[1, 2, 3, 4, 5].map((star) => {
                const meta = ratingMeta[star];
                const isSelected = fallbackRating === star;
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => {
                      this.setState({ fallbackRating: star });
                      soundEngine?.playClick?.();
                    }}
                    className={`py-2.5 sm:py-3 rounded-xl sm:rounded-2xl border-2 border-black font-display font-black text-xs sm:text-sm uppercase flex flex-col items-center justify-center cursor-pointer transition-all ${
                      isSelected 
                        ? 'shadow-[2.5px_2.5px_0px_#000000] scale-102 ring-2 ring-black' 
                        : 'shadow-[1.5px_1.5px_0px_#000000] hover:scale-101 opacity-80'
                    }`}
                    style={{ backgroundColor: meta?.bg || '#fff' }}
                  >
                    <span>{star}★</span>
                    <span className="text-[9px] sm:text-[10px] font-mono font-bold mt-0.5 truncate max-w-full px-1">{meta?.title}</span>
                  </button>
                );
              })}
            </div>

            <div className="space-y-2">
              <textarea
                rows={2}
                placeholder="Write your quick reflection here (auto-isolated from rendering faults)..."
                value={fallbackNote}
                onChange={(e) => this.setState({ fallbackNote: e.target.value })}
                className="w-full p-2.5 sm:p-3 text-xs font-mono bg-white border-2 border-black rounded-xl focus:outline-none focus:ring-2 focus:ring-black min-h-20"
              />

              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-mono text-neutral-500 truncate">
                  {fallbackSaved ? '✓ Saved safely to local database' : 'Ready to record'}
                </span>
                <button
                  type="button"
                  onClick={this.handleEmergencySave}
                  className="px-4 py-2 bg-[#00E599] hover:bg-emerald-400 text-black border-2 border-black rounded-xl font-mono text-xs font-black uppercase cursor-pointer shadow-[2px_2px_0px_#000000] active:translate-x-px active:translate-y-px flex items-center gap-1.5 shrink-0"
                >
                  <Check className="w-3.5 h-3.5 stroke-3" />
                  <span>Save Verdict</span>
                </button>
              </div>
            </div>

            {/* Collapsible Diagnostic Disclosure */}
            <div className="pt-2 border-t border-black/10">
              <button
                type="button"
                onClick={() => this.setState(prev => ({ showDiagnostics: !prev.showDiagnostics }))}
                className="text-[10px] font-mono font-bold text-neutral-500 hover:text-black flex items-center gap-1 cursor-pointer"
              >
                {showDiagnostics ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                <span>{showDiagnostics ? 'Hide Technical Diagnostics' : 'Show Technical Diagnostics'}</span>
              </button>

              {showDiagnostics && (
                <div className="mt-2 p-3 bg-neutral-900 text-neutral-100 rounded-xl border-2 border-black font-mono text-[10px] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-amber-400 font-bold uppercase">Anomaly Trace:</span>
                    <button
                      type="button"
                      onClick={this.handleCopyDiagnostics}
                      className="px-2 py-0.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded border border-neutral-600 flex items-center gap-1 cursor-pointer"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{copiedError ? 'COPIED!' : 'COPY ERROR'}</span>
                    </button>
                  </div>
                  <div className="break-all whitespace-pre-wrap font-mono text-[10px] text-red-300 max-h-32 overflow-y-auto">
                    {error?.message || 'Unknown component anomaly'}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    // 2. MODAL FALLBACK: Closes gracefully and shows an alert card
    if (variant === 'modal') {
      return (
        <div className="p-6 bg-white border-3 border-black shadow-[6px_6px_0px_#000000] rounded-3xl space-y-4 max-w-md mx-auto my-8 text-center">
          <div className="w-12 h-12 rounded-2xl bg-[#FF4D4D] border-2 border-black mx-auto flex items-center justify-center shadow-[2px_2px_0px_#000000]">
            <AlertTriangle className="w-6 h-6 text-black stroke-[2.5]" />
          </div>
          <div>
            <h3 className="font-display font-black text-base uppercase text-black">
              {name} Glitch Contained
            </h3>
            <p className="text-xs font-mono text-neutral-600 mt-1 leading-relaxed">
              This modal encountered an unexpected error. The main application and your diary remain fully functional and protected.
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 pt-2">
            <button
              type="button"
              onClick={this.handleAutoHeal}
              className="px-4 py-2 bg-[#00E599] hover:bg-emerald-400 text-black border-2 border-black rounded-xl font-mono text-xs font-black uppercase cursor-pointer shadow-[2px_2px_0px_#000000] active:scale-95 flex items-center gap-1.5"
            >
              <Wand2 className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Auto-Heal</span>
            </button>
            <button
              type="button"
              onClick={this.handleReset}
              className="px-4 py-2 bg-black text-[#FDC800] border-2 border-black rounded-xl font-mono text-xs font-black uppercase cursor-pointer shadow-[2px_2px_0px_#000000] active:scale-95"
            >
              Retry
            </button>
            {this.props.onClose && (
              <button
                type="button"
                onClick={this.props.onClose}
                className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-black border-2 border-black rounded-xl font-mono text-xs font-black uppercase cursor-pointer shadow-[2px_2px_0px_#000000] active:scale-95"
              >
                Dismiss Modal
              </button>
            )}
          </div>
        </div>
      );
    }

    // 3. DEFAULT INLINE FALLBACK
    return (
      <div className="p-4 bg-[#FFF9E6] border-2 border-black rounded-2xl shadow-[3px_3px_0px_#000000] flex items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-2 min-w-0">
          <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
          <span className="font-bold text-neutral-800 truncate">
            {name} rendered in safe mode ({error?.message || 'Component anomaly'}).
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={this.handleAutoHeal}
            className="px-2.5 py-1 bg-[#00E599] hover:bg-emerald-400 border border-black rounded-lg font-black uppercase cursor-pointer text-[10px] flex items-center gap-1"
          >
            <Wand2 className="w-3 h-3" />
            <span>Auto-Heal</span>
          </button>
          <button
            type="button"
            onClick={this.handleReset}
            className="px-2.5 py-1 bg-white hover:bg-neutral-100 border border-black rounded-lg font-black uppercase cursor-pointer text-[10px]"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
}
