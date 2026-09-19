import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, X, Check, ShieldCheck, Sparkles, Moon, Sun, Clock, Coffee, Plus, Trash2 } from 'lucide-react';
import { 
  getRehabilitationConfig, 
  activateRehabilitation, 
  extendRehabilitation, 
  exitRehabilitation,
  getCompassionAnchors,
  saveCompassionAnchors
} from '../services/api';

/**
 * 🌿 Rehabilitation & Streak Freeze Modal ("The Sanctuary")
 * Protects users from burnout: 7-day initial freeze, Day 7 empathetic check-in prompt,
 * up to 14 days maximum ceiling, and customizable compassion anchors.
 */
export const INITIAL_REHAB_DAYS = 7;
export const MAX_DAYS = 14;

export default function RehabilitationModal({ isOpen, onClose, onStateChange }) {
  const [config, setConfig] = useState(() => getRehabilitationConfig());
  const [anchors, setAnchors] = useState(() => getCompassionAnchors());
  const [newAnchorText, setNewAnchorText] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      setConfig(getRehabilitationConfig());
      setAnchors(getCompassionAnchors());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const showToast = (msg) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(''), 2500);
  };

  const handleActivate7Days = () => {
    const res = activateRehabilitation(7);
    setConfig(res);
    showToast('7-Day Rehabilitation Sanctuary Activated!');
    if (onStateChange) onStateChange();
  };

  const handleExtendTo14Days = () => {
    const res = extendRehabilitation(7);
    setConfig(res);
    showToast('Sanctuary Extended to 14 Days Maximum!');
    if (onStateChange) onStateChange();
  };

  const handleExitRehab = () => {
    exitRehabilitation();
    setConfig(getRehabilitationConfig());
    showToast('Welcome Back! Regular Tracking Restored.');
    if (onStateChange) onStateChange();
  };

  const handleAddAnchor = (e) => {
    e.preventDefault();
    if (!newAnchorText.trim()) return;
    const newAnchor = {
      id: `compassion_${Date.now()}`,
      title: newAnchorText.trim(),
      desc: 'Gentle self-care action',
      utils: 1.0
    };
    const updated = [...anchors, newAnchor];
    setAnchors(updated);
    saveCompassionAnchors(updated);
    setNewAnchorText('');
  };

  const handleDeleteAnchor = (id) => {
    const updated = anchors.filter(a => a.id !== id);
    setAnchors(updated);
    saveCompassionAnchors(updated);
  };

  const allowedDays = config.freezeDays || 7;
  const daysUsed = config.elapsedDays || 0;
  const daysRemaining = config.daysRemaining !== undefined ? config.daysRemaining : (allowedDays - daysUsed);
  const canExtend = config.active && allowedDays < 14;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          transition={{ duration: 0.18 }}
          className="relative w-full max-w-xl bg-[#FFFDF8] border-3 border-black shadow-[6px_6px_0px_#000000] p-5 sm:p-7 my-8 max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-4 border-b-3 border-black pb-4 mb-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-[#A8E6CF] border-2 border-black shadow-[2px_2px_0px_#000000]">
                <Heart className="w-6 h-6 text-black stroke-[2.5]" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest bg-black text-white px-2 py-0.5 font-bold">
                  ANTI-BURNOUT PROTOCOL • STREAK SANCTUARY
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-black tracking-tight mt-1">
                  Rehabilitation Phase
                </h2>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 bg-[#FF4D4D] text-black border-2 border-black hover:bg-black hover:text-white transition-colors shadow-[2px_2px_0px_#000000] shrink-0 cursor-pointer"
              aria-label="Close Rehabilitation Modal"
            >
              <X className="w-5 h-5 stroke-3" />
            </button>
          </div>

          {/* Status Alert */}
          {feedbackMsg && (
            <div className="mb-4 p-3 bg-[#A8E6CF] border-2 border-black shadow-[2px_2px_0px_#000000] text-xs sm:text-sm font-mono font-black text-black flex items-center gap-2">
              <Sparkles className="w-4 h-4 stroke-[2.5]" />
              {feedbackMsg}
            </div>
          )}

          {/* Description */}
          <div className="p-3.5 bg-[#A8E6CF]/30 border-2 border-black shadow-[2px_2px_0px_#000000] mb-5 text-xs sm:text-sm font-mono leading-relaxed text-black/90">
            <p>
              Life gets intense, fatigue accumulates, and burnout is real. 
              The <strong>Rehabilitation Sanctuary</strong> gives you permission to pause your demanding goals without breaking your hard-earned streak.
            </p>
          </div>

          {/* Active Status Card vs Activation Card */}
          {config.active ? (
            <div className="p-4 bg-white border-2 border-black shadow-[3px_3px_0px_#000000] mb-5">
              <div className="flex items-center justify-between gap-2 border-b-2 border-black pb-2 mb-3">
                <span className="text-xs font-mono font-black text-black flex items-center gap-1.5 uppercase">
                  <span className="w-2.5 h-2.5 bg-[#00E599] rounded-full inline-block animate-pulse"></span>
                  Active Sanctuary Status
                </span>
                <span className="text-xs font-mono font-bold bg-[#A8E6CF] px-2 py-0.5 border border-black">
                  Day {daysUsed + 1} of {allowedDays}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-3 bg-[#FFFDF8] border-2 border-black text-center">
                  <span className="text-[10px] font-mono text-black/60 uppercase block">Days Remaining</span>
                  <span className="text-2xl font-black text-black font-display">{daysRemaining}</span>
                </div>
                <div className="p-3 bg-[#FFFDF8] border-2 border-black text-center">
                  <span className="text-[10px] font-mono text-black/60 uppercase block">Hard Ceiling</span>
                  <span className="text-2xl font-black text-black font-display">{14 - allowedDays} Days Left</span>
                </div>
              </div>

              {/* Day 7 Check-in Notice */}
              {config.needsDay7CheckIn && (
                <div className="p-3 bg-[#FDC800]/25 border-2 border-black mb-4 text-xs font-mono">
                  <span className="font-black block uppercase text-black mb-1">
                    7-Day Rest Check-in
                  </span>
                  You have completed your first 7 days of rest. How are you feeling? If you need more time, you can extend up to 14 days total.
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                {canExtend && (
                  <button
                    onClick={handleExtendTo14Days}
                    className="flex-1 py-2 px-3 bg-[#FDC800] text-black font-black uppercase text-xs border-2 border-black shadow-[2px_2px_0px_#000000] hover:translate-x-px hover:translate-y-px hover:shadow-[1px_1px_0px_#000000] transition-all cursor-pointer text-center"
                  >
                    Extend to 14 Days Max
                  </button>
                )}
                <button
                  onClick={handleExitRehab}
                  className="flex-1 py-2 px-3 bg-[#FF4D4D] text-black font-black uppercase text-xs border-2 border-black shadow-[2px_2px_0px_#000000] hover:translate-x-px hover:translate-y-px hover:shadow-[1px_1px_0px_#000000] transition-all cursor-pointer text-center"
                >
                  Exit Sanctuary (Resume Normal)
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-white border-2 border-black shadow-[3px_3px_0px_#000000] mb-5">
              <div className="flex items-center gap-2 mb-2 font-black text-sm uppercase text-black">
                <Clock className="w-4 h-4 stroke-[2.5]" />
                Initiate 7-Day Sanctuary Freeze
              </div>
              <p className="text-xs font-mono text-black/80 mb-4">
                Locks your streak in place for the next 7 days. Your app interface will shift to a calm restorative tone, and your daily demands will be swapped with compassion anchors.
              </p>
              <button
                onClick={handleActivate7Days}
                className="w-full py-3 bg-[#A8E6CF] hover:bg-[#88D49E] text-black font-black uppercase text-xs sm:text-sm border-2 border-black shadow-[3px_3px_0px_#000000] hover:translate-x-px hover:translate-y-px hover:shadow-[2px_2px_0px_#000000] transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Heart className="w-4 h-4 stroke-[2.5]" />
                ACTIVATE 7-DAY REHABILITATION
              </button>
            </div>
          )}

          {/* Compassion Anchors Section */}
          <div className="p-4 bg-white border-2 border-black shadow-[3px_3px_0px_#000000]">
            <div className="flex items-center justify-between border-b-2 border-black pb-2 mb-3">
              <span className="text-xs font-mono font-black uppercase tracking-wider text-black flex items-center gap-1.5">
                <Coffee className="w-4 h-4 stroke-[2.5]" />
                Compassion Anchors (Gentle Habits)
              </span>
              <span className="text-[10px] font-mono bg-black text-white px-1.5 py-0.5 font-bold">
                {anchors.length} ACTIVE
              </span>
            </div>

            <p className="text-xs font-mono text-black/70 mb-3">
              When in the Sanctuary, these basic restorative anchors replace intense workouts and productivity checklists:
            </p>

            <div className="space-y-2 mb-4">
              {anchors.map(anchor => (
                <div 
                  key={anchor.id}
                  className="flex items-center justify-between p-2.5 bg-[#FFFDF8] border-2 border-black shadow-[2px_2px_0px_#000000] text-xs font-mono"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-[#A8E6CF] border border-black inline-block"></span>
                    <div>
                      <span className="font-bold text-black block">{anchor.title}</span>
                      {anchor.desc && <span className="text-[10px] text-black/60 block">{anchor.desc}</span>}
                    </div>
                  </div>
                  {anchors.length > 1 && (
                    <button
                      onClick={() => handleDeleteAnchor(anchor.id)}
                      className="p-1 hover:bg-[#FF4D4D]/20 text-black border border-transparent hover:border-black transition-colors"
                      title="Remove anchor"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Add Custom Anchor */}
            <form onSubmit={handleAddAnchor} className="flex gap-2">
              <input
                type="text"
                placeholder="Add custom restorative habit..."
                value={newAnchorText}
                onChange={(e) => setNewAnchorText(e.target.value)}
                className="flex-1 px-3 py-1.5 bg-white border-2 border-black text-xs font-mono text-black placeholder-neutral-400 outline-none focus:ring-1 focus:ring-black"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-[#A8E6CF] text-black font-black uppercase text-xs border-2 border-black shadow-[2px_2px_0px_#000000] hover:translate-x-px hover:translate-y-px hover:shadow-[1px_1px_0px_#000000] transition-all cursor-pointer flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5 stroke-3" />
                ADD
              </button>
            </form>
          </div>

          {/* Footer Note */}
          <div className="mt-5 pt-3 border-t-2 border-black flex justify-between items-center text-xs font-mono text-black/60">
            <span>Hard ceiling: 14 days maximum</span>
            <button
              onClick={onClose}
              className="font-bold underline text-black hover:text-black/80 cursor-pointer"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
