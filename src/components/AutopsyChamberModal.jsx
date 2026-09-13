import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertOctagon, 
  Activity, 
  Moon, 
  Smartphone, 
  Target, 
  Sparkles, 
  Check, 
  X, 
  ShieldAlert, 
  Flame, 
  Zap, 
  ArrowRight,
  HelpCircle,
  FileSearch,
  BatteryLow
} from 'lucide-react';
import { soundEngine } from '../services/soundEngine';

export const FRICTION_SOURCES = [
  { id: 'digital_trap', label: '📱 Digital / Screen Trap', desc: 'Doomscrolling, binge-watching, Reels paralysis' },
  { id: 'academic_work', label: '💼 Work / Academic Wall', desc: 'Overwhelming deadlines, burnout, complex friction' },
  { id: 'emotional_distraction', label: '🧠 Emotional Turmoil', desc: 'Anxiety, interpersonal drama, mental fog' },
  { id: 'physical_exhaustion', label: '⚡ Physical Depletion', desc: 'Sickness, overtraining, zero physical battery' }
];

export const AUTOPSY_TAGS = [
  'Doomscroll Loop',
  'Bedtime Delayed',
  'Skipped Anchors',
  'Brain Fog',
  'Sugar / Junk Crash',
  'Procrastination',
  'Social Drama',
  'No Deep Work',
  'Travel / Disruption'
];

export function AutopsyBadge({ autopsy, onClick, className = '' }) {
  if (!autopsy) return null;

  const sabotageCount = (autopsy.sleepSabotage ? 1 : 0) + (autopsy.skippedAnchors ? 1 : 0);
  const frictionLabel = FRICTION_SOURCES.find(f => f.id === autopsy.frictionSource)?.label || 'Friction';

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl border-2 border-black bg-[#FF4D4D] text-black font-mono text-[10px] font-black uppercase shadow-[1.5px_1.5px_0px_#000000] hover:scale-105 active:scale-95 transition-all cursor-pointer ${className}`}
      title="View Forensic Autopsy Diagnosis"
    >
      <AlertOctagon className="w-3.5 h-3.5 stroke-[2.5]" />
      <span>CRIME SCENE: {frictionLabel.split(' ')[1] || 'AUTOPSY'}</span>
      {sabotageCount > 0 && (
        <span className="bg-black text-[#FF4D4D] px-1 py-0.2 rounded text-[9px]">
          {sabotageCount}🚩
        </span>
      )}
    </button>
  );
}

export default function AutopsyChamberModal({
  isOpen,
  onClose,
  entryDate = new Date().toISOString().slice(0, 10),
  rating = 1,
  existingAutopsy = null,
  onSaveAutopsy
}) {
  const [sleepSabotage, setSleepSabotage] = useState(false);
  const [frictionSource, setFrictionSource] = useState('digital_trap');
  const [skippedAnchors, setSkippedAnchors] = useState(true);
  const [selectedTags, setSelectedTags] = useState([]);
  const [notes, setNotes] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (existingAutopsy) {
        setSleepSabotage(Boolean(existingAutopsy.sleepSabotage));
        setFrictionSource(existingAutopsy.frictionSource || 'digital_trap');
        setSkippedAnchors(Boolean(existingAutopsy.skippedAnchors));
        setSelectedTags(Array.isArray(existingAutopsy.tags) ? existingAutopsy.tags : []);
        setNotes(existingAutopsy.notes || '');
      } else {
        setSleepSabotage(false);
        setFrictionSource('digital_trap');
        setSkippedAnchors(true);
        setSelectedTags([]);
        setNotes('');
      }
      setIsSaved(false);
    }
  }, [isOpen, existingAutopsy]);

  if (!isOpen) return null;

  const handleToggleTag = (tag) => {
    soundEngine.playClick();
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleSave = (e) => {
    e.preventDefault();
    soundEngine.playSuccessChime();

    const payload = {
      sleepSabotage,
      frictionSource,
      skippedAnchors,
      tags: selectedTags,
      notes: notes.trim(),
      diagnosedAt: new Date().toISOString()
    };

    setIsSaved(true);
    if (onSaveAutopsy) {
      onSaveAutopsy(payload);
    }

    setTimeout(() => {
      onClose();
    }, 600);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-90 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.94, y: 15 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.94, y: 15 }}
          className="w-full max-w-xl bg-[#FFFDF5] rounded-3xl border-3 border-black p-5 sm:p-7 shadow-[8px_8px_0px_#000000] space-y-4 text-left relative overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Hazard Warning Tape Ribbon */}
          <div className="bg-[#FDC800] border-b-2 border-black -mx-5 sm:-mx-7 -mt-5 sm:-mt-7 px-4 py-1.5 flex items-center justify-between text-black font-mono font-black text-[10px] tracking-wider uppercase">
            <span className="flex items-center gap-1.5">
              <span>⚠️</span>
              <span>FORENSIC AUTOPSY CHAMBER • CRIME SCENE INVESTIGATION</span>
            </span>
            <span>DATE: {entryDate}</span>
          </div>

          {/* Header */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2.5">
              <div className="w-11 h-11 rounded-2xl bg-[#FF4D4D] border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_#000000]">
                <AlertOctagon className="w-6 h-6 text-black stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display font-black text-lg sm:text-xl uppercase leading-none text-black">
                    THE AUTOPSY CHAMBER
                  </h3>
                  <span className="px-1.5 py-0.5 rounded bg-black text-[#FF4D4D] text-[9px] font-mono font-black uppercase">
                    {rating === 1 ? '1★ ROUGH' : '2★ DOWN'}
                  </span>
                </div>
                <span className="text-xs font-mono text-neutral-600">
                  Rapid 3-Switch Forensic Interrogator
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 border-2 border-black cursor-pointer shadow-[1.5px_1.5px_0px_#000000]"
            >
              <X className="w-4 h-4 text-black stroke-[2.5]" />
            </button>
          </div>

          <p className="text-xs font-mono text-neutral-600 leading-snug">
            The day failed. Don't hide from it. Perform the 30-second post-mortem to isolate where the wheels came off so it cannot recur tomorrow.
          </p>

          <form onSubmit={handleSave} className="space-y-3.5 pt-1">
            {/* SWITCH 1: Sleep Sabotage */}
            <div className="p-3.5 bg-white border-2 border-black rounded-2xl shadow-[2px_2px_0px_#000000] flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className={`w-9 h-9 rounded-xl border-2 border-black flex items-center justify-center shrink-0 ${
                  sleepSabotage ? 'bg-[#FF4D4D] text-black' : 'bg-neutral-100 text-neutral-600'
                }`}>
                  <Moon className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-display font-black text-xs uppercase text-black">
                    1. Sleep Sabotage
                  </h4>
                  <p className="text-[11px] font-mono text-neutral-600 truncate">
                    Late night phone, insomnia, or broken wake-up cycle?
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  setSleepSabotage(!sleepSabotage);
                }}
                className={`px-3.5 py-1.5 rounded-xl border-2 border-black font-mono text-xs font-black cursor-pointer transition-all shadow-[1.5px_1.5px_0px_#000000] shrink-0 active:scale-95 ${
                  sleepSabotage ? 'bg-[#FF4D4D] text-black' : 'bg-neutral-100 text-neutral-600'
                }`}
              >
                {sleepSabotage ? 'YES (SABOTAGED)' : 'NO (RESTED)'}
              </button>
            </div>

            {/* SWITCH 2: Friction Source */}
            <div className="p-3.5 bg-white border-2 border-black rounded-2xl shadow-[2px_2px_0px_#000000] space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-[#FDC800] border border-black flex items-center justify-center font-display font-black text-xs text-black">
                  2
                </div>
                <h4 className="font-display font-black text-xs uppercase text-black">
                  Primary Friction Origin
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {FRICTION_SOURCES.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => {
                      soundEngine.playClick();
                      setFrictionSource(f.id);
                    }}
                    className={`p-2.5 rounded-xl border-2 border-black text-left cursor-pointer transition-all active:scale-98 ${
                      frictionSource === f.id
                        ? 'bg-[#FDC800] text-black shadow-[2px_2px_0px_#000000]'
                        : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-700'
                    }`}
                  >
                    <div className="font-display font-black text-xs uppercase leading-tight">
                      {f.label}
                    </div>
                    <div className="text-[10px] font-mono text-neutral-600 leading-tight mt-0.5">
                      {f.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* SWITCH 3: Habit Anchors Skipped */}
            <div className="p-3.5 bg-white border-2 border-black rounded-2xl shadow-[2px_2px_0px_#000000] flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className={`w-9 h-9 rounded-xl border-2 border-black flex items-center justify-center shrink-0 ${
                  skippedAnchors ? 'bg-[#FF4D4D] text-black' : 'bg-[#00E599] text-black'
                }`}>
                  <Target className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-display font-black text-xs uppercase text-black">
                    3. Non-Negotiable Anchors
                  </h4>
                  <p className="text-[11px] font-mono text-neutral-600 truncate">
                    Were core daily habit anchors skipped or abandoned?
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  setSkippedAnchors(!skippedAnchors);
                }}
                className={`px-3.5 py-1.5 rounded-xl border-2 border-black font-mono text-xs font-black cursor-pointer transition-all shadow-[1.5px_1.5px_0px_#000000] shrink-0 active:scale-95 ${
                  skippedAnchors ? 'bg-[#FF4D4D] text-black' : 'bg-[#00E599] text-black'
                }`}
              >
                {skippedAnchors ? 'SKIPPED (0/N)' : 'LOCKED (HELD)'}
              </button>
            </div>

            {/* Forensic Crime Scene Quick Tags */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono font-bold text-neutral-600 uppercase">
                Forensic Culprit Tags:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {AUTOPSY_TAGS.map((tag) => {
                  const isSel = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleToggleTag(tag)}
                      className={`px-2.5 py-1 rounded-xl border-2 border-black font-mono text-[10px] font-bold cursor-pointer transition-all active:scale-95 ${
                        isSel 
                          ? 'bg-black text-[#FF4D4D] shadow-[1.5px_1.5px_0px_#000000]' 
                          : 'bg-white text-neutral-700 hover:bg-neutral-100'
                      }`}
                    >
                      {isSel ? `✓ ${tag}` : `+ ${tag}`}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Optional Diagnostic Note */}
            <div>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional reality note (e.g. Lost 4 hours to YouTube algorithm after lunch)"
                className="w-full px-3 py-2 bg-white border-2 border-black rounded-xl font-mono text-xs text-black focus:outline-none focus:ring-2 focus:ring-black placeholder-neutral-400"
              />
            </div>

            {/* Submit Bar */}
            <div className="pt-2 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border-2 border-black font-display font-black text-xs uppercase bg-neutral-100 hover:bg-neutral-200 text-black cursor-pointer"
              >
                Skip For Now
              </button>

              <button
                type="submit"
                className="flex-1 py-3 px-4 bg-[#FF4D4D] hover:bg-red-500 text-black font-display font-black text-xs uppercase rounded-xl border-3 border-black shadow-[3px_3px_0px_#000000] active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {isSaved ? (
                  <>
                    <Check className="w-4 h-4 stroke-3" />
                    <span>DIAGNOSIS FILED!</span>
                  </>
                ) : (
                  <>
                    <FileSearch className="w-4 h-4 stroke-[2.5]" />
                    <span>LOG FORENSIC AUTOPSY</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
