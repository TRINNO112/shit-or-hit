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
  Download
} from 'lucide-react';
import { ratingMeta } from '../services/api';
import { soundEngine } from '../services/soundEngine';

/**
 * 🛡️ FaultBoundary — Component-Level Fault Isolation & Fallback Engine
 * Prevents local errors in complex UI components (e.g. TodayHero, CalendarModal, SettingsModal)
 * from crashing the entire application.
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
      fallbackSaved: false
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error(`🛡️ [FaultBoundary Caught Exception in ${this.props.name || 'Component'}]:`, error, errorInfo);

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

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
    if (this.props.onReset) {
      this.props.onReset();
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
          notes: fallbackNote,
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

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    const { variant = 'default', name = 'Feature' } = this.props;
    const { error, fallbackRating, fallbackNote, fallbackSaved } = this.state;

    // 1. HERO FALLBACK: Ultra-reliable Neobrutalist emergency rating strip
    if (variant === 'hero') {
      return (
        <div className="neo-card w-full mb-8 border-3 border-black shadow-[6px_6px_0px_#000000] bg-[#FFFDF5] rounded-3xl p-6 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b-2 border-black/15">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#FDC800] border-2 border-black flex items-center justify-center font-black">
                <AlertTriangle className="w-4 h-4 text-black stroke-[2.5]" />
              </div>
              <div>
                <span className="font-mono text-xs font-black uppercase text-black block">
                  Self-Healing Mode Active • {name} Safeguard
                </span>
                <span className="text-[11px] font-sans text-neutral-600 block">
                  A minor UI update glitch occurred. Your historical diary is safe and untouched.
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={this.handleEmergencyDownload}
                className="px-3 py-1.5 bg-white hover:bg-neutral-100 text-black border-2 border-black rounded-xl font-mono text-[11px] font-black uppercase cursor-pointer shadow-[2px_2px_0px_#000000] active:translate-x-px active:translate-y-px flex items-center gap-1.5"
                title="Download raw diary JSON"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Rescue JSON</span>
              </button>
              <button
                type="button"
                onClick={this.handleReset}
                className="px-3 py-1.5 bg-[#00E599] hover:bg-emerald-400 text-black border-2 border-black rounded-xl font-mono text-[11px] font-black uppercase cursor-pointer shadow-[2px_2px_0px_#000000] active:translate-x-px active:translate-y-px flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retry Render</span>
              </button>
            </div>
          </div>

          {/* Emergency 1-Tap Rating Strip */}
          <div className="pt-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-black uppercase text-black">
                Record Today's Verdict (Safe Mode):
              </span>
              <span className="font-mono text-xs font-bold text-neutral-600">
                Selected: {fallbackRating}★ {ratingMeta[fallbackRating]?.title}
              </span>
            </div>

            <div className="grid grid-cols-5 gap-2">
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
                    className={`py-3 rounded-2xl border-2 border-black font-display font-black text-sm uppercase flex flex-col items-center justify-center cursor-pointer transition-all ${
                      isSelected 
                        ? 'shadow-[3px_3px_0px_#000000] scale-102 ring-2 ring-black' 
                        : 'shadow-[1.5px_1.5px_0px_#000000] hover:scale-101 opacity-80'
                    }`}
                    style={{ backgroundColor: meta?.bg || '#fff' }}
                  >
                    <span>{star}★</span>
                    <span className="text-[10px] font-mono font-bold mt-0.5">{meta?.title}</span>
                  </button>
                );
              })}
            </div>

            <div className="space-y-2">
              <textarea
                rows={3}
                placeholder="Write your quick reflection here (auto-isolated from rendering faults)..."
                value={fallbackNote}
                onChange={(e) => this.setState({ fallbackNote: e.target.value })}
                className="w-full p-3 text-xs font-mono bg-white border-2 border-black rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
              />

              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-neutral-500">
                  {fallbackSaved ? '✓ Saved safely to local database' : 'Ready to record'}
                </span>
                <button
                  type="button"
                  onClick={this.handleEmergencySave}
                  className="px-5 py-2 bg-[#00E599] hover:bg-emerald-400 text-black border-2 border-black rounded-xl font-mono text-xs font-black uppercase cursor-pointer shadow-[2px_2px_0px_#000000] active:translate-x-px active:translate-y-px flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5 stroke-3" />
                  <span>Save Verdict</span>
                </button>
              </div>
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
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
          <span className="font-bold text-neutral-800">
            {name} rendered in safe mode ({error?.message || 'Component anomaly'}).
          </span>
        </div>
        <button
          type="button"
          onClick={this.handleReset}
          className="px-3 py-1 bg-white hover:bg-neutral-100 border border-black rounded-lg font-black uppercase cursor-pointer shrink-0"
        >
          Retry
        </button>
      </div>
    );
  }
}
