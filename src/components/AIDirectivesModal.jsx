import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Zap, Target, ShieldCheck, ListOrdered, Terminal, X, Check } from 'lucide-react';
import { soundEngine } from '../services/soundEngine';

export const DIRECTIVES = [
  {
    id: 'auto',
    name: 'Auto Polish',
    shortDesc: 'Flawless flow, vivid 1st-person storytelling, natural grammar fix',
    instruction: 'Standard full vivid diary polish with flawless flow',
    icon: Zap,
    color: '#FDC800'
  },
  {
    id: 'root_causes',
    name: 'Root Causes',
    shortDesc: 'Dissect the core behavioral friction or peak flow catalysts behind your day',
    instruction: 'Analyze and highlight the root causes of friction or success today, extracting key behavioral takeaways',
    icon: Target,
    color: '#00E599'
  },
  {
    id: 'stoic',
    name: 'Stoic Grit',
    shortDesc: 'Reframes your day through emotional calm, discipline, and battlefield grit',
    instruction: 'Write through a stoic, resilient lens emphasizing emotional mastery, calm discipline, and tactical battlefield focus',
    icon: ShieldCheck,
    color: '#CBD5E1'
  },
  {
    id: 'bullets',
    name: 'Action Bullets',
    shortDesc: 'Concise chronological bullet points with clear next-action takeaways',
    instruction: 'Format into concise, chronological bullet points with actionable takeaways',
    icon: ListOrdered,
    color: '#FF8A00'
  }
];

export default function AIDirectivesModal({
  isOpen,
  onClose,
  activeDirective = 'auto',
  onSelectDirective,
  customPrompt = '',
  onSaveCustomPrompt
}) {
  const [localDirective, setLocalDirective] = useState(activeDirective);
  const [localCustom, setLocalCustom] = useState(customPrompt);
  const [showCustomArea, setShowCustomArea] = useState(activeDirective === 'custom');

  if (!isOpen) return null;

  const handleSelect = (id) => {
    soundEngine.playClick();
    setLocalDirective(id);
    if (id !== 'custom') {
      setShowCustomArea(false);
    }
  };

  const handleApply = () => {
    soundEngine.playClick();
    onSelectDirective(localDirective, localCustom);
    if (onSaveCustomPrompt) onSaveCustomPrompt(localCustom);
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-100 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-xs select-none"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={{ type: 'spring', stiffness: 380, damping: 28 }}
          className="w-full max-w-lg bg-[#FFFDF5] border-3 border-black rounded-3xl shadow-[8px_8px_0px_#000000] p-4 sm:p-6 flex flex-col space-y-4 max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b-2 border-black/10 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-[#FDC800] border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_#000000] shrink-0">
                <Sparkles className="w-5 h-5 text-black stroke-[2.5]" />
              </div>
              <div>
                <h3 className="font-display font-black text-base sm:text-lg uppercase text-black leading-none">
                  AI Ghostwriter Directives
                </h3>
                <span className="text-xs font-mono text-neutral-600 mt-0.5 block">
                  Select how Gemini polishes your diary
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-[#FF4D4D] hover:bg-red-600 border-2 border-black text-black hover:text-white cursor-pointer shadow-[2px_2px_0px_#000000] active:scale-95 transition-all shrink-0"
            >
              <X className="w-4 h-4 stroke-3" />
            </button>
          </div>

          {/* Directive Cards */}
          <div className="space-y-2">
            {DIRECTIVES.map((d) => {
              const isSelected = localDirective === d.id && !showCustomArea;
              const Icon = d.icon;
              return (
                <div
                  key={d.id}
                  onClick={() => handleSelect(d.id)}
                  className={`p-3 rounded-2xl border-2 border-black cursor-pointer transition-all flex items-start justify-between gap-3 ${
                    isSelected
                      ? 'bg-white shadow-[3px_3px_0px_#000000] ring-2 ring-black'
                      : 'bg-white/70 hover:bg-white hover:shadow-[2px_2px_0px_#000000]'
                  }`}
                >
                  <div className="flex items-start gap-2.5 min-w-0 flex-1">
                    <div
                      className="w-9 h-9 rounded-xl border-2 border-black flex items-center justify-center shrink-0 shadow-[1px_1px_0px_#000000] mt-0.5"
                      style={{ backgroundColor: d.color }}
                    >
                      <Icon className="w-4.5 h-4.5 text-black stroke-[2.5]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-display font-black text-sm uppercase text-black">
                          {d.name}
                        </span>
                        {d.id === 'auto' && (
                          <span className="text-[9px] font-mono font-bold bg-neutral-200 px-1 rounded border border-black/30">
                            DEFAULT
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-mono text-neutral-600 mt-0.5 leading-relaxed">
                        {d.shortDesc}
                      </p>
                    </div>
                  </div>

                  <div className={`w-6 h-6 rounded-full border-2 border-black flex items-center justify-center shrink-0 mt-1 transition-all ${
                    isSelected ? 'bg-[#00E599]' : 'bg-neutral-100'
                  }`}>
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-3 text-black" />}
                  </div>
                </div>
              );
            })}

            {/* Custom Instruction Option */}
            <div
              onClick={() => {
                setShowCustomArea(true);
                handleSelect('custom');
              }}
              className={`p-3 rounded-2xl border-2 border-black cursor-pointer transition-all space-y-2.5 ${
                showCustomArea || localDirective === 'custom'
                  ? 'bg-white shadow-[3px_3px_0px_#000000] ring-2 ring-black'
                  : 'bg-white/70 hover:bg-white hover:shadow-[2px_2px_0px_#000000]'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-black text-white border-2 border-black flex items-center justify-center shrink-0 shadow-[1px_1px_0px_#000000]">
                    <Terminal className="w-4.5 h-4.5 stroke-[2.5]" />
                  </div>
                  <div>
                    <span className="font-display font-black text-sm uppercase text-black">
                      Custom Tactical Prompt
                    </span>
                    <p className="text-xs font-mono text-neutral-600">
                      Give your own exact instructions to Gemini
                    </p>
                  </div>
                </div>

                <div className={`w-6 h-6 rounded-full border-2 border-black flex items-center justify-center shrink-0 ${
                  showCustomArea || localDirective === 'custom' ? 'bg-[#00E599]' : 'bg-neutral-100'
                }`}>
                  {(showCustomArea || localDirective === 'custom') && <Check className="w-3.5 h-3.5 stroke-3 text-black" />}
                </div>
              </div>

              {(showCustomArea || localDirective === 'custom') && (
                <div onClick={(e) => e.stopPropagation()} className="pt-1">
                  <textarea
                    rows={3}
                    value={localCustom}
                    onChange={(e) => setLocalCustom(e.target.value)}
                    placeholder="e.g. Focus specifically on my gym PR, keep language punchy, and highlight my evening focus session..."
                    className="w-full p-2.5 rounded-xl border-2 border-black font-mono text-xs text-black bg-[#FAF8ED] resize-none focus:outline-none focus:ring-2 focus:ring-[#FDC800]"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t-2 border-black/10 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-4 rounded-xl border-2 border-black font-display font-black text-xs uppercase bg-neutral-100 hover:bg-neutral-200 cursor-pointer shadow-[1.5px_1.5px_0px_#000000]"
            >
              CANCEL
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="py-2 px-5 rounded-xl border-2 border-black font-display font-black text-xs uppercase bg-[#00E599] hover:bg-emerald-400 cursor-pointer shadow-[2px_2px_0px_#000000] active:scale-95"
            >
              APPLY DIRECTIVE
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
