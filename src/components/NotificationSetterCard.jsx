import React, { useState, useEffect } from 'react';
import { Bell, Send, Check, Sparkles, Smartphone, Keyboard, CheckCircle2, AlertCircle } from 'lucide-react';
import { playMood } from '../services/soundEffects';
import { soundEngine } from '../services/soundEngine';
import { showInstantReminderNotification } from '../services/notifications';

/* ------------------------------------------------------------------
   NOTIFICATION STAR SETTER & SMARTPHONE SIMULATOR
   Zero complex SVGs in push shade — Pure Unicode Stars & Neobrutalist
   High-Contrast Color Tokens for 100% native mobile OS compatibility.
------------------------------------------------------------------- */

const STAR_TIERS = [
  { rating: 1, label: 'ROUGH', stars: '★', count: '1★', color: '#FF4D4D', textColor: '#000000', key: '1' },
  { rating: 2, label: 'DOWN', stars: '★★', count: '2★', color: '#FF9500', textColor: '#000000', key: '2' },
  { rating: 3, label: 'OKAY', stars: '★★★', count: '3★', color: '#FDC800', textColor: '#000000', key: '3' },
  { rating: 4, label: 'GOOD', stars: '★★★★', count: '4★', color: '#00D4FF', textColor: '#000000', key: '4' },
  { rating: 5, label: 'PEAK', stars: '★★★★★', count: '5★', color: '#00E599', textColor: '#000000', key: '5' }
];

const DESIGN_OPTIONS = [
  { id: 'lockscreen', name: '1. OS NOTIFICATION DRAWER', desc: 'Realistic PC & Mobile OS Push Shade with 1-Tap Star Actions' },
  { id: 'tactile_chips', name: '2. TACTILE STAR CHIPS', desc: 'Chunky Neobrutalist buttons with star glyphs & keyboard acceleration' },
  { id: 'cyber_bar', name: '3. COMPACT CYBER DOCK', desc: 'Ultra-dense horizontal bar optimized for narrow mobile viewports' }
];

export default function NotificationSetterCard() {
  const [selectedDesign, setSelectedDesign] = useState('lockscreen');
  const [selectedRating, setSelectedRating] = useState(5);
  const [feedbackMessage, setFeedbackMessage] = useState(null);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testSent, setTestSent] = useState(false);

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
    } catch (e) {
      soundEngine.playClick();
    }
    const tier = STAR_TIERS.find((t) => t.rating === rating);
    setFeedbackMessage(`RECORDED ${tier.count} ${tier.label} TO DIARY (ZERO APP OPEN NEEDED)`);
    setTimeout(() => setFeedbackMessage(null), 3500);

    // Dispatch remote rating message to app if registered
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('remote_notification_verdict', { detail: { rating, timestamp: new Date().toISOString() } })
      );
    }
  };

  const handleSendTestNotification = async () => {
    setIsSendingTest(true);
    soundEngine.playClick();
    try {
      const ok = await showInstantReminderNotification();
      setIsSendingTest(false);
      if (ok) {
        setTestSent(true);
        soundEngine.playSuccess();
        setTimeout(() => setTestSent(false), 3000);
      }
    } catch (e) {
      setIsSendingTest(false);
    }
  };

  return (
    <div className="bg-[#FFFDF8] border-3 border-black rounded-3xl p-3.5 sm:p-7 text-black shadow-[6px_6px_0px_#000000] space-y-6">
      
      {/* Header & Test Push Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-3 border-black pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 bg-[#00E599] border-2 border-black rounded-lg font-mono font-black text-[10px] uppercase shadow-[2px_2px_0px_#000]">
              SYSTEM NOTIFICATION ENGINE
            </span>
            <span className="px-2 py-0.5 bg-black text-[#FDC800] rounded font-mono font-black text-[10px] uppercase flex items-center gap-1">
              <Smartphone className="w-3 h-3 text-[#FDC800]" />
              <span>PC & MOBILE SUPPORTED</span>
            </span>
          </div>
          <h2 className="font-display font-black text-xl sm:text-2xl uppercase tracking-tight">
            Daily Notification & Star Setter
          </h2>
          <p className="text-xs font-mono text-black/70">
            Log your daily mood directly from your PC or smartphone notification shade, or click to open the site.
          </p>
        </div>

        {/* Test Notification Trigger */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleSendTestNotification}
            disabled={isSendingTest}
            className={`w-full sm:w-auto px-4 py-2.5 border-2 border-black rounded-xl font-mono font-black text-xs uppercase shadow-[3px_3px_0px_#000000] cursor-pointer transition-all flex items-center justify-center gap-2 active:translate-x-px active:translate-y-px ${
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
                <span>SEND TEST NOTIFICATION (PC / MOBILE)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Design Option Tabs */}
      <div className="space-y-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="text-xs font-mono font-black uppercase text-neutral-800 tracking-wider">
            SELECT NOTIFICATION DESIGN OPTION:
          </span>
          <div className="flex items-center gap-1.5 font-mono text-[10px] bg-black text-[#00E599] px-2 py-0.5 rounded font-black">
            <Keyboard className="w-3 h-3 text-[#00E599]" />
            <span>KEYS: 1-5</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {DESIGN_OPTIONS.map((d) => {
            const isSelected = selectedDesign === d.id;
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => {
                  setSelectedDesign(d.id);
                  soundEngine.playClick();
                }}
                className={`p-3 rounded-xl border-2 border-black text-left cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-[#FDC800] text-black shadow-[3px_3px_0px_#000] ring-2 ring-black -translate-y-0.5 font-black'
                    : 'bg-white hover:bg-neutral-50 text-neutral-800 shadow-[2px_2px_0px_#000]'
                }`}
              >
                <div className="font-display font-black text-xs uppercase">{d.name}</div>
                <div className="text-[10px] font-mono text-neutral-700 line-clamp-1 mt-0.5">{d.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Interactive Preview Canvas */}
      <div className="p-4 sm:p-6 rounded-2xl border-3 border-black bg-[#241F1A] shadow-[4px_4px_0px_#000]">
        
        {/* DESIGN 1: OS LOCKSCREEN NOTIFICATION DRAWER */}
        {selectedDesign === 'lockscreen' && (
          <div className="max-w-xl mx-auto bg-[#1C1814] border-2 border-[#FDC800] rounded-2xl p-4 sm:p-5 text-white shadow-[0_8px_20px_rgba(0,0,0,0.6)] space-y-3.5">
            {/* Header info */}
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-[#FDC800] border border-black flex items-center justify-center font-display font-black text-black text-xs">
                  S
                </div>
                <div>
                  <div className="font-mono font-black text-xs uppercase text-[#FDC800] leading-none">
                    SHIT OR HIT • DAILY VERDICT
                  </div>
                  <div className="font-mono text-[9px] text-white/50 mt-0.5">
                    8:30 PM • LOCKSCREEN NOTIFICATION
                  </div>
                </div>
              </div>
              <span className="font-mono text-[9px] bg-white/10 px-2 py-0.5 rounded text-white/70">
                JUST NOW
              </span>
            </div>

            {/* Notification Body */}
            <div>
              <h4 className="font-display font-black text-sm uppercase text-white tracking-tight">
                How was your day? Log in 1 tap:
              </h4>
              <p className="text-[11px] font-mono text-white/70 mt-0.5">
                Hit or Shit? Tap a star action below to record your verdict without launching the app.
              </p>
            </div>

            {/* 5 Interactive Star Action Buttons */}
            <div className="grid grid-cols-5 gap-1.5 pt-1">
              {STAR_TIERS.map((tier) => {
                const isActive = selectedRating === tier.rating;
                return (
                  <button
                    key={tier.rating}
                    type="button"
                    onClick={() => handleSelectRating(tier.rating)}
                    className={`p-2 rounded-xl border-2 border-black flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-all active:scale-95 ${
                      isActive
                        ? 'ring-2 ring-white scale-105 shadow-[0_0_12px_rgba(253,200,0,0.5)]'
                        : 'opacity-90 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: tier.color }}
                  >
                    <span className="font-mono font-black text-xs text-black leading-none">
                      {tier.stars}
                    </span>
                    <span className="font-mono font-black text-[9px] text-black uppercase leading-none mt-0.5 truncate max-w-full">
                      {tier.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Feedback ticker */}
            {feedbackMessage && (
              <div className="p-2 rounded-lg bg-[#00E599]/20 border border-[#00E599] text-[#00E599] font-mono text-[10px] font-black text-center animate-fade-in flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>{feedbackMessage}</span>
              </div>
            )}
          </div>
        )}

        {/* DESIGN 2: TACTILE NEOBRUTALIST STAR CHIPS */}
        {selectedDesign === 'tactile_chips' && (
          <div className="bg-[#FFFDF5] border-2 border-black rounded-2xl p-4 sm:p-5 text-black space-y-4 shadow-[4px_4px_0px_#000]">
            <div className="flex items-center justify-between border-b-2 border-black/10 pb-2">
              <span className="font-mono font-black text-xs uppercase text-neutral-800">
                TACTILE STAR CHIP MATRIX
              </span>
              <span className="font-mono text-[10px] bg-[#00E599] border border-black px-2 py-0.5 rounded font-black">
                1-TAP LOGGING
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {STAR_TIERS.map((tier) => {
                const isActive = selectedRating === tier.rating;
                return (
                  <button
                    key={tier.rating}
                    type="button"
                    onClick={() => handleSelectRating(tier.rating)}
                    className={`p-3 rounded-xl border-2 border-black flex flex-col items-center justify-center gap-1 cursor-pointer transition-all active:translate-x-px active:translate-y-px ${
                      isActive
                        ? 'shadow-[4px_4px_0px_#000] ring-2 ring-black -translate-y-1'
                        : 'shadow-[2px_2px_0px_#000] hover:-translate-y-0.5'
                    }`}
                    style={{ backgroundColor: tier.color }}
                  >
                    <span className="font-mono text-[10px] bg-black text-white px-2 py-0.5 rounded-full font-black">
                      KEY: {tier.key}
                    </span>
                    <span className="text-sm font-black text-black tracking-widest my-0.5">
                      {tier.stars}
                    </span>
                    <span className="font-display font-black text-xs uppercase text-black">
                      {tier.count} {tier.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {feedbackMessage && (
              <div className="p-2.5 rounded-xl bg-black text-[#00E599] font-mono text-xs font-black text-center flex items-center justify-center gap-2">
                <Check className="w-4 h-4 text-[#00E599] stroke-3" />
                <span>{feedbackMessage}</span>
              </div>
            )}
          </div>
        )}

        {/* DESIGN 3: COMPACT CYBER DOCK */}
        {selectedDesign === 'cyber_bar' && (
          <div className="bg-black border-2 border-white/20 rounded-2xl p-4 text-white space-y-3 shadow-[0_4px_16px_rgba(0,0,0,0.8)]">
            <div className="flex items-center justify-between text-[11px] font-mono border-b border-white/10 pb-2">
              <span className="text-[#00E599] font-black uppercase flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#00E599] animate-pulse" />
                CYBER DOCK COMPACT BAR
              </span>
              <span className="text-white/50">MOBILE OPTIMIZED</span>
            </div>

            <div className="flex items-center justify-between gap-1.5 sm:gap-2">
              {STAR_TIERS.map((tier) => {
                const isActive = selectedRating === tier.rating;
                return (
                  <button
                    key={tier.rating}
                    type="button"
                    onClick={() => handleSelectRating(tier.rating)}
                    className={`flex-1 py-2 sm:py-2.5 px-1 rounded-xl border border-black flex flex-col items-center justify-center gap-1 cursor-pointer transition-all active:scale-95 ${
                      isActive ? 'ring-2 ring-white scale-105' : 'hover:scale-102'
                    }`}
                    style={{ backgroundColor: tier.color }}
                  >
                    <span className="font-mono font-black text-[11px] sm:text-xs text-black leading-none">
                      {tier.count}
                    </span>
                    <span className="font-mono font-black text-[8px] sm:text-[9px] text-black uppercase leading-none truncate max-w-full">
                      {tier.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {feedbackMessage && (
              <div className="p-2 rounded-lg bg-white/10 text-[#FDC800] font-mono text-[10px] font-black text-center">
                {feedbackMessage}
              </div>
            )}
          </div>
        )}

      </div>

      {/* Helpful OS Capabilities Callout */}
      <div className="p-4 bg-[#FDC800] border-2 border-black rounded-2xl shadow-[3px_3px_0px_#000] space-y-2">
        <div className="flex items-center gap-2 font-mono text-xs font-black uppercase text-black">
          <Smartphone className="w-4 h-4 stroke-[2.5]" />
          <span>DEVICE CAPABILITIES: WHY 2 BUTTONS ON WINDOWS PC?</span>
        </div>
        <div className="text-xs font-mono text-black space-y-1.5 leading-relaxed">
          <p>
            • <strong>PC Desktop (Google Chrome on Windows)</strong>: Windows Action Center strictly hard-caps all notification popups to <strong>2 action buttons</strong> (<code>1★ Shit</code> &amp; <code>5★ Hit</code>). Clicking either button instantly logs that score for <strong>Today</strong> in zero taps!
          </p>
          <p>
            • <strong>Rating 2★, 3★, or 4★ on PC</strong>: Simply click anywhere on the notification body itself! It immediately opens the app on your screen with all 5 mood icons ready to select.
          </p>
          <p>
            • <strong>Smartphones (Android)</strong>: Mobile notification shades support up to 5 actions, enabling complete 1-tap ratings (1★ through 5★) straight from your lockscreen.
          </p>
        </div>
      </div>

    </div>
  );
}
