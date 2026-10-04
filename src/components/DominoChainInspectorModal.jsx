import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GitBranch, 
  X, 
  ArrowRight, 
  ArrowLeft, 
  ArrowDown, 
  ShieldCheck, 
  Calendar, 
  Zap, 
  Flame, 
  Layers,
  ChevronLeft,
  ChevronRight,
  ListFilter
} from 'lucide-react';
import soundEngine from '../services/soundEngine';

/**
 * 🏛️ DominoChainInspectorModal
 * Dedicated Neobrutalist Dialog for deep forensic inspection of
 * multi-card (2 to 6+ days) Behavioral Domino Chains & Causal Cascades.
 * 
 * Strict UI Standards:
 * - Zero raw Unicode emojis (Lucide icons only)
 * - Pure Neobrutalism (border-2/3 border-black, shadow-[4px_4px_0px_#000000])
 * - 320px mobile-first vertical stacking architecture
 */
export default function DominoChainInspectorModal({
  isOpen,
  onClose,
  chain,
  allChains = [],
  currentIndex = 0,
  onSelectChainIndex
}) {
  const [activeStep, setActiveStep] = useState(0);
  const [viewMode, setViewMode] = useState('stepper'); // 'stepper' | 'full'

  // Extract nodes / links reliably
  const nodes = chain?.nodes || chain?.links || [];
  const chainTitle = chain?.title || chain?.chainTitle || 'Causal Domino Chain';
  const rootTrigger = chain?.frictionPattern || chain?.rootTrigger || 'Unknown Trigger';
  const circuitBreaker = chain?.circuitBreaker;

  // Reset active step when chain changes
  useEffect(() => {
    setActiveStep(0);
  }, [chain]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        handleNextStep();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        handlePrevStep();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, activeStep, nodes.length]);

  if (!isOpen || !chain) return null;

  const handleNextStep = () => {
    if (activeStep < nodes.length - 1) {
      setActiveStep((prev) => prev + 1);
      soundEngine?.playSelect?.();
    }
  };

  const handlePrevStep = () => {
    if (activeStep > 0) {
      setActiveStep((prev) => prev - 1);
      soundEngine?.playSelect?.();
    }
  };

  const getStageColor = (stage = '') => {
    const upper = stage.toUpperCase();
    if (upper.includes('ROOT') || upper.includes('TRIGGER')) {
      return { bg: 'bg-[#FF4D4D]', text: 'text-white', border: 'border-black' };
    }
    if (upper.includes('RIPPLE') || upper.includes('ACCELERATION')) {
      return { bg: 'bg-[#FF8A00]', text: 'text-black', border: 'border-black' };
    }
    if (upper.includes('DRAG') || upper.includes('CRITICAL')) {
      return { bg: 'bg-[#FDC800]', text: 'text-black', border: 'border-black' };
    }
    if (upper.includes('COLLAPSE') || upper.includes('RESET')) {
      return { bg: 'bg-black', text: 'text-[#FF4D4D]', border: 'border-black' };
    }
    if (upper.includes('RECOVERY') || upper.includes('RESOLUTION') || upper.includes('BROKEN')) {
      return { bg: 'bg-[#00E599]', text: 'text-black', border: 'border-black' };
    }
    return { bg: 'bg-neutral-800', text: 'text-white', border: 'border-black' };
  };

  const activeNode = nodes[activeStep] || nodes[0];
  const activeColor = getStageColor(activeNode?.stage);

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-90 flex items-center justify-center p-2.5 sm:p-4 bg-black/65 backdrop-blur-xs"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 14 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 14 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="w-full max-w-2xl bg-[#FFFDF5] border-3 border-black rounded-3xl p-3.5 sm:p-6 shadow-[5px_5px_0px_#000000] max-h-[92vh] flex flex-col gap-3.5 text-black overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between pb-3 border-b-2 border-black/10 shrink-0 gap-2">
            <div className="flex items-start gap-2.5 min-w-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-[#FDC800] border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_#000000] shrink-0 mt-0.5">
                <GitBranch className="w-5 h-5 text-black stroke-[2.5]" />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="px-1.5 py-0.5 rounded bg-black text-[#FDC800] font-mono text-[9px] font-black uppercase tracking-wider">
                    CHAIN INSPECTOR
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-neutral-200 border border-black font-mono text-[9px] font-black uppercase text-neutral-800">
                    {nodes.length} STAGES LINKED
                  </span>
                </div>
                <h3 className="font-display font-black text-sm sm:text-base uppercase tracking-tight text-black leading-tight mt-1 wrap-break-word">
                  {chainTitle}
                </h3>
                {rootTrigger && (
                  <p className="font-mono text-[10px] text-neutral-600 truncate mt-0.5">
                    TRIGGER: <span className="font-bold text-black">{rootTrigger}</span>
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 rounded-xl border-2 border-black bg-white hover:bg-neutral-100 active:translate-x-px active:translate-y-px shadow-[2px_2px_0px_#000000] shrink-0 transition-transform"
              aria-label="Close Domino Chain Inspector"
            >
              <X className="w-4 h-4 text-black stroke-[2.5]" />
            </button>
          </div>

          {/* Switch Chain Tabs if multiple chains exist */}
          {allChains.length > 1 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 shrink-0">
              <span className="text-[9px] font-mono font-black text-neutral-500 uppercase shrink-0">
                CHAINS:
              </span>
              {allChains.map((c, idx) => (
                <button
                  key={idx}
                  onClick={() => onSelectChainIndex && onSelectChainIndex(idx)}
                  className={`px-2 py-1 rounded-lg border-2 border-black font-mono text-[9px] font-black uppercase shrink-0 transition-all ${
                    idx === currentIndex 
                      ? 'bg-[#FDC800] text-black shadow-[2px_2px_0px_#000000]' 
                      : 'bg-white text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  CHAIN #{idx + 1}
                </button>
              ))}
            </div>
          )}

          {/* View Mode Toggle & Step Pills */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 shrink-0 pt-0.5">
            {/* Step Pills Navigator */}
            <div className="flex items-center gap-1 overflow-x-auto py-0.5">
              {nodes.map((node, sIdx) => {
                const isCurrent = sIdx === activeStep;
                const nodeColor = getStageColor(node.stage);
                return (
                  <button
                    key={sIdx}
                    onClick={() => {
                      setActiveStep(sIdx);
                      soundEngine?.playSelect?.();
                    }}
                    className={`flex items-center gap-1 px-2 py-1 rounded-lg border-2 border-black font-mono text-[9px] font-black uppercase shrink-0 transition-all active:translate-x-px active:translate-y-px ${
                      isCurrent
                        ? `${nodeColor.bg} ${nodeColor.text} shadow-[2px_2px_0px_#000000] scale-105`
                        : 'bg-white text-neutral-600 hover:bg-neutral-100 shadow-[1px_1px_0px_#000000]'
                    }`}
                  >
                    <span>STEP {sIdx + 1}</span>
                    {node.rating && (
                      <span className="text-[8px] opacity-80">
                        {node.rating}★
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Mode switch: Stepper vs All */}
            <div className="flex items-center gap-1 self-start sm:self-auto shrink-0">
              <button
                onClick={() => setViewMode('stepper')}
                className={`px-2 py-1 rounded-lg border border-black font-mono text-[9px] font-black uppercase transition-all ${
                  viewMode === 'stepper' 
                    ? 'bg-black text-white shadow-[1px_1px_0px_#000000]' 
                    : 'bg-white text-black hover:bg-neutral-100'
                }`}
              >
                FOCUSED STEP
              </button>
              <button
                onClick={() => setViewMode('full')}
                className={`px-2 py-1 rounded-lg border border-black font-mono text-[9px] font-black uppercase transition-all ${
                  viewMode === 'full' 
                    ? 'bg-black text-white shadow-[1px_1px_0px_#000000]' 
                    : 'bg-white text-black hover:bg-neutral-100'
                }`}
              >
                FULL TIMELINE
              </button>
            </div>
          </div>

          {/* Modal Body */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-3.5">
            {viewMode === 'stepper' ? (
              /* FOCUSED STEP CARD */
              <div className="space-y-3">
                <div className="p-4 sm:p-5 rounded-2xl border-3 border-black bg-white shadow-[4px_4px_0px_#000000] space-y-3.5">
                  {/* Top Bar of Card */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b-2 border-black/10">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-lg border-2 border-black font-mono text-[10px] font-black uppercase shadow-[1.5px_1.5px_0px_#000000] ${activeColor.bg} ${activeColor.text}`}>
                        {activeNode.stage || `STAGE ${activeStep + 1}`}
                      </span>
                      <span className="font-mono text-[10px] font-black text-neutral-500 uppercase">
                        STEP {activeStep + 1} OF {nodes.length}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded border border-black bg-neutral-100 font-mono text-[10px] font-black">
                        <Calendar className="w-3 h-3 text-neutral-600" />
                        <span>{activeNode.date || 'UNDATED'}</span>
                      </div>
                      {activeNode.rating && (
                        <span className={`px-2 py-0.5 rounded border border-black font-mono text-[10px] font-black ${
                          activeNode.rating >= 4 ? 'bg-[#00E599] text-black' : activeNode.rating === 3 ? 'bg-neutral-200 text-black' : 'bg-[#FF4D4D] text-white'
                        }`}>
                          {activeNode.rating}★
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Summary / Causal Logic */}
                  <div className="space-y-1.5">
                    <span className="block font-mono text-[9px] font-black text-neutral-500 uppercase tracking-wider">
                      BEHAVIORAL FRICTION & DOWNSTREAM RIPPLE:
                    </span>
                    <p className="text-xs sm:text-sm font-mono font-bold text-neutral-900 leading-relaxed wrap-break-word">
                      {activeNode.summary || 'No summary recorded for this domino node.'}
                    </p>
                  </div>

                  {activeNode.frictionTag && (
                    <div className="inline-block px-2 py-0.5 rounded bg-neutral-100 border border-black font-mono text-[9px] font-bold text-neutral-700 uppercase">
                      TAG: {activeNode.frictionTag}
                    </div>
                  )}

                  {/* Ripple Progression Footnote */}
                  <div className="pt-2 border-t border-black/10 flex items-center justify-between text-[9px] font-mono font-bold text-neutral-500">
                    <span>
                      {activeStep === 0 
                        ? 'ORIGIN: Primary catalyst of this cascade' 
                        : activeStep === nodes.length - 1 
                        ? 'TERMINATION: Final stage of the cascade' 
                        : `PROPAGATION: Day ${activeStep + 1} in the cascade sequence`}
                    </span>
                    <span>
                      {activeStep < nodes.length - 1 ? `➔ RIPPLES INTO STEP ${activeStep + 2}` : 'END OF RECORDED CHAIN'}
                    </span>
                  </div>
                </div>

                {/* Step Controls (Prev / Next) */}
                <div className="flex items-center justify-between gap-2">
                  <button
                    onClick={handlePrevStep}
                    disabled={activeStep === 0}
                    className="flex-1 py-2 sm:py-2.5 px-3 rounded-xl border-2 border-black bg-white hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed font-mono text-xs font-black uppercase flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_#000000] active:translate-x-px active:translate-y-px transition-all"
                  >
                    <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
                    <span>PREVIOUS STEP</span>
                  </button>

                  <button
                    onClick={handleNextStep}
                    disabled={activeStep === nodes.length - 1}
                    className="flex-1 py-2 sm:py-2.5 px-3 rounded-xl border-2 border-black bg-[#FDC800] hover:bg-[#ebd000] disabled:opacity-40 disabled:cursor-not-allowed font-mono text-xs font-black uppercase flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_#000000] active:translate-x-px active:translate-y-px transition-all"
                  >
                    <span>NEXT STEP</span>
                    <ChevronRight className="w-4 h-4 stroke-[2.5]" />
                  </button>
                </div>
              </div>
            ) : (
              /* FULL CASCADE TIMELINE VIEW (All 2 to 6+ cards) */
              <div className="space-y-3 py-1">
                {nodes.map((node, nIdx, arr) => {
                  const isLast = nIdx === arr.length - 1;
                  const nodeColor = getStageColor(node.stage);

                  return (
                    <div key={nIdx} className="space-y-2">
                      <div className="p-3 sm:p-4 rounded-xl border-2 border-black bg-white shadow-[2px_2px_0px_#000000] space-y-2">
                        <div className="flex items-center justify-between gap-1">
                          <div className="flex items-center gap-1.5">
                            <span className="w-5 h-5 rounded-full bg-black text-white font-mono text-[9px] font-black flex items-center justify-center shrink-0">
                              {nIdx + 1}
                            </span>
                            <span className={`text-[9px] font-mono font-black px-1.5 py-0.5 rounded border border-black/30 uppercase ${nodeColor.bg} ${nodeColor.text}`}>
                              {node.stage || `STAGE ${nIdx + 1}`}
                            </span>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <span className="font-mono text-[10px] font-black text-neutral-500">
                              {node.date}
                            </span>
                            {node.rating && (
                              <span className={`text-[9px] font-mono font-black px-1.5 py-0.2 rounded border border-black ${
                                node.rating >= 4 ? 'bg-[#00E599] text-black' : node.rating === 3 ? 'bg-neutral-200 text-black' : 'bg-[#FF4D4D] text-white'
                              }`}>
                                {node.rating}★
                              </span>
                            )}
                          </div>
                        </div>

                        <p className="text-xs font-mono font-bold text-neutral-800 leading-snug wrap-break-word">
                          {node.summary}
                        </p>

                        {node.frictionTag && (
                          <span className="inline-block text-[8px] font-mono font-black text-neutral-500 uppercase">
                            TAG: {node.frictionTag}
                          </span>
                        )}
                      </div>

                      {!isLast && (
                        <div className="flex items-center justify-center py-0.5">
                          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-neutral-200 border border-black/20 text-[8px] font-mono font-bold text-neutral-600 uppercase">
                            <ArrowDown className="w-3 h-3 text-black stroke-[2.5]" />
                            <span>RIPPLED INTO NEXT DAY</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Tactical Circuit Breaker Section */}
            {circuitBreaker && (
              <div className="p-3.5 sm:p-4 rounded-2xl border-2 sm:border-3 border-[#00A86B] bg-[#00E599]/15 flex items-start gap-2.5 sm:gap-3 shadow-[2px_2px_0px_#00A86B]">
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-[#00E599] border-2 border-black flex items-center justify-center shrink-0 mt-0.5 shadow-[1px_1px_0px_#000000]">
                  <ShieldCheck className="w-4 h-4 text-black stroke-[2.5]" />
                </div>
                <div className="space-y-0.5 text-left min-w-0">
                  <span className="block text-[9px] font-mono font-black uppercase text-[#007038] tracking-wider leading-tight">
                    TACTICAL CIRCUIT BREAKER • PROVEN INTERVENTION
                  </span>
                  <p className="text-xs sm:text-sm font-mono font-bold text-neutral-950 leading-relaxed wrap-break-word mt-0.5">
                    {circuitBreaker}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer - Vertical Stacking on Mobile */}
          <div className="pt-2 border-t-2 border-black/10 shrink-0 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span className="text-[9px] font-mono font-bold text-neutral-500 hidden sm:block">
              Use arrow keys or click steps to inspect causal friction
            </span>
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border-2 border-black bg-black text-white hover:bg-neutral-800 active:translate-x-px active:translate-y-px shadow-[2px_2px_0px_#000000] font-mono text-xs font-black uppercase transition-all"
            >
              CLOSE INSPECTOR
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
