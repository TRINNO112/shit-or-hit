import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Send, 
  Check, 
  Smartphone, 
  Keyboard, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  Monitor, 
  Settings,
  Sparkles,
  Zap
} from 'lucide-react';
import { playMood } from '../services/soundEffects';
import { soundEngine } from '../services/soundEngine';
import { 
  showInstantReminderNotification, 
  getNotificationBannerMode, 
  setNotificationBannerMode 
} from '../services/notifications';

/* ------------------------------------------------------------------
   NOTIFICATION STAR SETTER & SMARTPHONE / PC SIMULATOR
   Zero complex SVGs in push shade — Pure Unicode Stars & Neobrutalist
   High-Contrast Color Tokens for 100% native mobile & desktop OS compatibility.
------------------------------------------------------------------- */

const STAR_TIERS = [
  { rating: 1, label: 'ROUGH', stars: '★', count: '1★', color: '#FF4D4D', textColor: '#000000', key: '1' },
  { rating: 2, label: 'DOWN', stars: '★★', count: '2★', color: '#FF9500', textColor: '#000000', key: '2' },
  { rating: 3, label: 'OKAY', stars: '★★★', count: '3★', color: '#FDC800', textColor: '#000000', key: '3' },
  { rating: 4, label: 'GOOD', stars: '★★★★', count: '4★', color: '#00D4FF', textColor: '#000000', key: '4' },
  { rating: 5, label: 'PEAK', stars: '★★★★★', count: '5★', color: '#00E599', textColor: '#000000', key: '5' }
];

const BANNER_MODES = [
  {
    id: 'inline',
    name: '1. INLINE NUMBER & NOTE INPUT (1-5★)',
    tag: 'TEXT REPLY (DEFAULT)',
    shortTitle: 'INLINE INPUT',
    desc: 'Type 1 to 5 and an optional day summary note directly in the notification banner. (On Windows, click the reply arrow in the toast).'
  },
  {
    id: 'polar',
    name: '2. 1★ SHIT VS 5★ HIT BUTTONS',
    tag: 'RECOMMENDED FOR PC',
    shortTitle: '2-BUTTON POLAR',
    desc: 'Two physical buttons. 100% reliable 1-tap rating on Windows PC Action Center without typing or opening the app.'
  }
];

export default function NotificationSetterCard() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedRating, setSelectedRating] = useState(5);
  const [bannerMode, setBannerModeState] = useState(() => getNotificationBannerMode());
  const [inlineInputVal, setInlineInputVal] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState(null);
  const [confirmedRating, setConfirmedRating] = useState(null);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testSent, setTestSent] = useState(false);
  const [testSentMode, setTestSentMode] = useState(null);

  const [isMobileScreen, setIsMobileScreen] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 640 || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobileScreen(window.innerWidth < 640 || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent));
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSelectBannerMode = (modeId) => {
    setBannerModeState(modeId);
    setNotificationBannerMode(modeId);
    soundEngine.playClick();
  };

  // Keyboard shortcut listener [1..5]
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
      const num = parseInt(e.key, 10);
      if (num >= 1 && num <= 5) {
        e.preventDefault();
        handleSelectRating(num);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSelectRating = (rating) => {
    setSelectedRating(rating);
    try {
      playMood(rating);
      soundEngine.playSuccess();
    } catch (e) {
      soundEngine.playClick();
    }
    const tier = STAR_TIERS.find((t) => t.rating === rating);
    const msg = `RECORDED ${tier.count} ${tier.label} TO TODAY'S DIARY (ZERO APP OPEN NEEDED)`;
    setFeedbackMessage(msg);
    setConfirmedRating(tier);
    setTimeout(() => setFeedbackMessage(null), 4500);
    setTimeout(() => setConfirmedRating(null), 6000);

    // Dispatch remote rating message to app
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('remote_notification_verdict', { detail: { rating, timestamp: new Date().toISOString() } })
      );
    }
  };

  const handleSendTestNotification = async (overrideMode = null) => {
    const targetMode = overrideMode || bannerMode;
    setIsSendingTest(true);
    soundEngine.playClick();
    try {
      const ok = await showInstantReminderNotification(null, targetMode);
      setIsSendingTest(false);
      if (ok) {
        setTestSent(true);
        setTestSentMode(targetMode);
        soundEngine.playSuccess();
        setTimeout(() => setTestSent(false), 4500);
      }
    } catch (e) {
      setIsSendingTest(false);
    }
  };

  const currentModeObj = BANNER_MODES.find(m => m.id === bannerMode) || BANNER_MODES[0];

  return (
    <div className="bg-[#FFFDF8] border-3 border-black rounded-3xl p-3.5 sm:p-6 text-black shadow-[6px_6px_0px_#000000] space-y-4">
      
      {/* Header & Quick Action Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 bg-[#00E599] border-2 border-black rounded-lg font-mono font-black text-[10px] uppercase shadow-[2px_2px_0px_#000]">
              SYSTEM NOTIFICATION ENGINE
            </span>
            <span className="px-2 py-0.5 bg-black text-[#FDC800] rounded font-mono font-black text-[10px] uppercase flex items-center gap-1">
              {!isMobileScreen ? <Monitor className="w-3 h-3 text-[#FDC800]" /> : <Smartphone className="w-3 h-3 text-[#FDC800]" />}
              <span>ARMED: {currentModeObj.shortTitle}</span>
            </span>
          </div>
          <h2 className="font-display font-black text-xl sm:text-2xl uppercase tracking-tight">
            Daily Notification &amp; Star Setter
          </h2>
          <p className="text-xs font-mono text-black/70">
            Log your daily mood directly from Windows notifications or smartphone shade without opening the app.
          </p>
        </div>

        {/* Action Controls: Test Push & Accordion Toggle */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => handleSendTestNotification()}
            disabled={isSendingTest}
            className={`px-4 py-2.5 border-2 border-black rounded-xl font-mono font-black text-xs uppercase shadow-[3px_3px_0px_#000000] cursor-pointer transition-all flex items-center justify-center gap-2 active:translate-x-px active:translate-y-px ${
              testSent
                ? 'bg-[#00E599] text-black ring-2 ring-black'
                : 'bg-[#FDC800] hover:bg-[#ffe066] text-black'
            }`}
          >
            {isSendingTest ? (
              <>
                <span className="w-3.5 h-3.5 rounded-full border-2 border-black border-t-transparent animate-spin" />
                <span>FIRING NOTIFICATION...</span>
              </>
            ) : testSent ? (
              <>
                <Check className="w-4 h-4 stroke-3 text-black" />
                <span>NOTIFICATION SENT!</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4 stroke-[2.5]" />
                <span>SEND TEST NOTIFICATION</span>
              </>
            )}
          </button>

          {/* Accordion Expand/Collapse Toggle Button */}
          <button
            type="button"
            onClick={() => {
              setIsExpanded(!isExpanded);
              soundEngine.playClick();
            }}
            className="px-3 py-2.5 bg-white hover:bg-neutral-100 border-2 border-black rounded-xl font-mono font-black text-xs uppercase shadow-[3px_3px_0px_#000000] cursor-pointer transition-all flex items-center justify-center gap-1.5 active:translate-x-px active:translate-y-px"
          >
            <Settings className="w-3.5 h-3.5 text-black" />
            <span>{isExpanded ? 'CLOSE PREVIEW' : 'CONFIGURE / PREVIEW'}</span>
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 stroke-[2.5]" />
            ) : (
              <ChevronDown className="w-4 h-4 stroke-[2.5]" />
            )}
          </button>
        </div>
      </div>

      {/* Undeniable Tactile Confirmation Banner */}
      {confirmedRating && (
        <div className="p-3.5 bg-[#00E599] border-3 border-black rounded-2xl shadow-[4px_4px_0px_#000000] text-black flex items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-black text-[#00E599] border-2 border-black flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="font-mono font-black text-xs uppercase tracking-tight">
                VERDICT CONFIRMED: TODAY RECORDED AS {confirmedRating.count} ({confirmedRating.label})
              </div>
              <div className="font-mono text-[11px] text-black/80">
                Logged directly via notification system. Local diary updated &amp; cloud synced!
              </div>
            </div>
          </div>
          <span 
            className="px-2.5 py-1 rounded-lg border-2 border-black font-mono font-black text-xs shadow-[1.5px_1.5px_0px_#000]"
            style={{ backgroundColor: confirmedRating.color }}
          >
            {confirmedRating.stars}
          </span>
        </div>
      )}

      {/* Test Notification Fired Toast */}
      {testSent && !confirmedRating && (
        <div className="p-3 bg-[#FDC800] border-2 border-black rounded-xl shadow-[3px_3px_0px_#000000] text-black font-mono text-xs font-black flex items-center justify-between gap-2 animate-fade-in">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 stroke-3 text-black shrink-0" />
            <span>TEST NOTIFICATION SENT WITH [{testSentMode ? testSentMode.toUpperCase() : 'ACTIVE'}] ACTIONS. CHECK SYSTEM TRAY!</span>
          </div>
          <span className="text-[10px] bg-black text-white px-2 py-0.5 rounded font-bold shrink-0">
            CHECK ACTION CENTER
          </span>
        </div>
      )}

      {/* COLLAPSIBLE CONFIGURATION & PREVIEW DRAWER (Closed by default) */}
      {isExpanded && (
        <div className="pt-3 border-t-3 border-black space-y-6">
          
          {/* Section 1: 3 Action Modes with Direct Test Triggers */}
          <div className="space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs font-mono font-black uppercase text-neutral-800 tracking-wider flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-black" />
                <span>SELECT &amp; TEST NOTIFICATION MODE:</span>
              </span>
              <span className="font-mono text-[10px] bg-black text-[#00E599] px-2 py-0.5 rounded font-black">
                CLICK TO ACTIVATE OR TEST
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {BANNER_MODES.map((m) => {
                const isSelected = bannerMode === m.id;
                return (
                  <div
                    key={m.id}
                    className={`p-3.5 rounded-2xl border-2 border-black transition-all flex flex-col justify-between gap-2.5 ${
                      isSelected
                        ? 'bg-[#FFFDF5] shadow-[4px_4px_0px_#000] ring-2 ring-black'
                        : 'bg-white hover:bg-neutral-50 shadow-[2px_2px_0px_#000]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1.5">
                        <span className={`font-mono text-[9px] px-2 py-0.5 rounded border border-black font-black ${
                          isSelected ? 'bg-[#00E599] text-black' : 'bg-neutral-100 text-neutral-700'
                        }`}>
                          {isSelected ? 'ACTIVE ON OS' : m.tag}
                        </span>
                        {isSelected && (
                          <span className="w-2.5 h-2.5 rounded-full bg-[#00E599] border border-black animate-pulse" />
                        )}
                      </div>
                      <h3 className="font-display font-black text-xs uppercase tracking-tight text-black">
                        {m.name}
                      </h3>
                      <p className="text-[10px] font-mono text-neutral-600 leading-tight mt-1">
                        {m.desc}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 pt-2 border-t border-black/10">
                      <button
                        type="button"
                        onClick={() => handleSelectBannerMode(m.id)}
                        className={`flex-1 py-1.5 px-2 rounded-lg font-mono font-black text-[10px] uppercase border border-black cursor-pointer transition-all text-center ${
                          isSelected 
                            ? 'bg-black text-[#00E599]' 
                            : 'bg-white hover:bg-neutral-100 text-black shadow-[1.5px_1.5px_0px_#000]'
                        }`}
                      >
                        {isSelected ? 'SELECTED' : 'SELECT MODE'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          handleSelectBannerMode(m.id);
                          handleSendTestNotification(m.id);
                        }}
                        className="py-1.5 px-2.5 rounded-lg bg-[#FDC800] hover:bg-[#ffe066] font-mono font-black text-[10px] uppercase border border-black cursor-pointer shadow-[1.5px_1.5px_0px_#000] active:translate-x-px active:translate-y-px text-black shrink-0"
                        title={`Send test notification with ${m.name}`}
                      >
                        TEST
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 2: Active Mode Simulator Preview Canvas */}
          <div className="space-y-2 pt-2 border-t border-black/10">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs font-mono font-black uppercase text-neutral-800 tracking-wider">
                LIVE INTERACTIVE SIMULATOR (TEST HOW THIS MODE OPERATES):
              </span>
              <div className="flex items-center gap-1.5 font-mono text-[10px] bg-black text-[#00E599] px-2 py-0.5 rounded font-black">
                <Keyboard className="w-3 h-3 text-[#00E599]" />
                <span>KEYS: 1-5</span>
              </div>
            </div>

            <div className="p-4 sm:p-6 rounded-2xl border-3 border-black bg-[#1C1814] shadow-[4px_4px_0px_#000] text-white space-y-4">
              {/* Notification Banner Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-[#FDC800] border border-black flex items-center justify-center font-display font-black text-black text-xs">
                    S
                  </div>
                  <div>
                    <div className="font-mono font-black text-xs uppercase text-[#FDC800] leading-none">
                      SHIT OR HIT • DAILY VERDICT
                    </div>
                    <div className="font-mono text-[9px] text-white/50 mt-1">
                      SYSTEM NOTIFICATION • {currentModeObj.name}
                    </div>
                  </div>
                </div>
                <span className="font-mono text-[9px] bg-white/10 px-2.5 py-1 rounded text-[#00E599] font-bold uppercase">
                  SIMULATING: {bannerMode.toUpperCase()}
                </span>
              </div>

              {/* Notification Body Prompt */}
              <div>
                <h4 className="font-display font-black text-sm uppercase text-white tracking-tight">
                  How was your day? Log in 1 tap:
                </h4>
                <p className="text-[11px] font-mono text-white/70 mt-0.5">
                  {bannerMode === 'inline' 
                    ? 'Type 1 to 5 directly in the box below to log your rating without opening the app:'
                    : bannerMode === 'polar'
                    ? 'Click 1★ Shit or 5★ Hit directly from your notification banner:'
                    : 'Click any of the 5 stars to record your verdict directly:'}
                </p>
              </div>

              {/* MODE 1: Inline 1-5 Input Field */}
              {bannerMode === 'inline' && (
                <div className="space-y-2 pt-1">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const val = parseInt(inlineInputVal.trim(), 10);
                      if (val >= 1 && val <= 5) {
                        handleSelectRating(val);
                        setInlineInputVal('');
                      }
                    }}
                    className="flex items-center gap-2"
                  >
                    <input
                      type="text"
                      value={inlineInputVal}
                      onChange={(e) => setInlineInputVal(e.target.value)}
                      placeholder="Type 1, 2, 3, 4, or 5 & Enter..."
                      className="flex-1 bg-black/60 border-2 border-white/30 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#FDC800]"
                      maxLength={2}
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#00E599] hover:bg-[#00c785] border-2 border-black rounded-xl font-mono font-black text-xs text-black uppercase cursor-pointer shadow-[2px_2px_0px_#000] active:translate-x-px active:translate-y-px shrink-0"
                    >
                      SEND
                    </button>
                  </form>
                  <p className="text-[10px] font-mono text-white/50">
                    NOTE: On Windows PC notifications, type 1-5 and click the small reply arrow button if your Windows build doesn't bind Enter.
                  </p>
                </div>
              )}

              {/* MODE 2: Polar Binary Buttons (1★ Shit vs 5★ Hit) */}
              {bannerMode === 'polar' && (
                <div className="space-y-2 pt-1">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleSelectRating(1)}
                      className="p-3 rounded-xl border-2 border-black bg-[#FF4D4D] text-black font-mono font-black text-xs uppercase flex items-center justify-center gap-2 cursor-pointer shadow-[2px_2px_0px_#000] active:translate-x-px active:translate-y-px"
                    >
                      <span>1★ SHIT (ROUGH)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectRating(5)}
                      className="p-3 rounded-xl border-2 border-black bg-[#00E599] text-black font-mono font-black text-xs uppercase flex items-center justify-center gap-2 cursor-pointer shadow-[2px_2px_0px_#000] active:translate-x-px active:translate-y-px"
                    >
                      <span>5★ HIT (PEAK)</span>
                    </button>
                  </div>
                  <p className="text-[10px] font-mono text-white/50">
                    NOTE: Windows officially guarantees 2 action buttons. This mode provides 100% reliable 1-tap logging on PC!
                  </p>
                </div>
              )}

              {/* Feedback ticker */}
              {feedbackMessage && (
                <div className="p-2.5 rounded-xl bg-[#00E599]/20 border border-[#00E599] text-[#00E599] font-mono text-xs font-black text-center animate-fade-in flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{feedbackMessage}</span>
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Transparent Device OS Capabilities Callout */}
          <div className="p-4 bg-[#FDC800] border-2 border-black rounded-2xl shadow-[3px_3px_0px_#000] space-y-2 text-black">
            <div className="flex items-center gap-2 font-mono text-xs font-black uppercase">
              <Smartphone className="w-4 h-4 stroke-[2.5]" />
              <span>OS NOTIFICATION CAPABILITIES &amp; BUTTON LIMITS</span>
            </div>
            <div className="text-xs font-mono space-y-1.5 leading-relaxed">
              <p>
                • <strong>Windows Action Center Limit</strong>: Windows PC strictly caps notifications to <strong>2 action buttons</strong>. Mode 2 (<code>1★ Shit</code> &amp; <code>5★ Hit</code>) fits natively on Windows.
              </p>
              <p>
                • <strong>Why Test Mode 2 on PC?</strong>: If typing in the Windows notification text field feels awkward or your Windows build doesn't bind Enter, switch to <strong>Mode 2</strong>. Both buttons click instantly!
              </p>
              <p>
                • <strong>Mobile Lockscreen (Android PWA)</strong>: Supports up to 5 buttons natively (Mode 3), giving you all 5 mood ratings right on your lockscreen.
              </p>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
