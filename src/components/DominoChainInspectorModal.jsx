import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GitBranch, 
  X, 
  ArrowRight, 
  ArrowDown, 
  ShieldCheck, 
  Calendar, 
  Flame, 
  Layers
} from 'lucide-react';

/**
 * 🏛️ DominoChainInspectorModal
 * Dedicated Neobrutalist Dialog for deep forensic inspection of
 * multi-card (2 to 6+ days) Behavioral Domino Chains & Causal Cascades.
 * Displays the entire domino stream map in full panoramic layout.
 * 
 * Strict UI Standards:
 * - Zero raw Unicode emojis (Lucide icons only)
 * - Pure Neobrutalism (border-2/3 border-black, shadow-[5px_5px_0px_#000000])
 * - 320px mobile-first responsive architecture
 */
export default function DominoChainInspectorModal({
  isOpen,
  onClose,
  chain,
  allChains = [],
  currentIndex = 0,
  onSelectChainIndex
}) {
  // Extract nodes / links reliably
  const nodes = chain?.nodes || chain?.links || [];
  const chainTitle = chain?.title || chain?.chainTitle || 'Causal Domino Chain';
  const rootTrigger = chain?.frictionPattern || chain?.rootTrigger || 'Unknown Trigger';
  const circuitBreaker = chain?.circuitBreaker;

  // Keyboard escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !chain) return null;

  const getStageColor = (stage = '') => {
    const upper = stage.toUpperCase();
    if (upper.includes('ROOT') || upper.includes('TRIGGER')) {
      return { bg: 'bg-[#FF4D4D]', text: 'text-white' };
    }
    if (upper.includes('RIPPLE') || upper.includes('ACCELERATION')) {
      return { bg: 'bg-[#FF8A00]', text: 'text-black' };
    }
    if (upper.includes('DRAG') || upper.includes('CRITICAL')) {
      return { bg: 'bg-[#FDC800]', text: 'text-black' };
    }
    if (upper.includes('COLLAPSE') || upper.includes('RESET')) {
      return { bg: 'bg-black', text: 'text-[#FF4D4D]' };
    }
    if (upper.includes('RECOVERY') || upper.includes('RESOLUTION') || upper.includes('BROKEN')) {
      return { bg: 'bg-[#00E599]', text: 'text-black' };
    }
    return { bg: 'bg-neutral-800', text: 'text-white' };
  };

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-90 flex items-center justify-center p-2.5 sm:p-5 bg-black/70 backdrop-blur-xs"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 14 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 14 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="w-full max-w-4xl bg-[#FFFDF5] border-3 border-black rounded-3xl p-3.5 sm:p-6 shadow-[6px_6px_0px_#000000] max-h-[92vh] flex flex-col gap-4 text-black overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between pb-3 border-b-2 border-black/10 shrink-0 gap-2">
            <div className="flex items-start gap-2.5 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-[#FDC800] border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_#000000] shrink-0 mt-0.5">
                <GitBranch className="w-5 h-5 text-black stroke-[2.5]" />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded bg-black text-[#FDC800] font-mono text-[9px] font-black uppercase tracking-wider">
                    DOMINO EFFECT INSPECTOR
                  </span>
                  <span className="px-2 py-0.5 rounded bg-neutral-200 border border-black font-mono text-[9px] font-black uppercase text-neutral-800">
                    {nodes.length} STAGES LINKED
                  </span>
                </div>
                <h3 className="font-display font-black text-sm sm:text-lg uppercase tracking-tight text-black leading-tight mt-1 wrap-break-word">
                  {chainTitle}
                </h3>
                {rootTrigger && (
                  <p className="font-mono text-[10px] text-neutral-600 truncate mt-0.5">
                    ORIGIN TRIGGER: <span className="font-bold text-black">{rootTrigger}</span>
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 rounded-xl border-2 border-black bg-white hover:bg-neutral-100 active:translate-x-px active:translate-y-px shadow-[2px_2px_0px_#000000] shrink-0 transition-transform"
              aria-label="Close Inspector"
            >
              <X className="w-4 h-4 text-black stroke-[2.5]" />
            </button>
          </div>

          {/* Switch Chain Tabs if multiple chains exist */}
          {allChains.length > 1 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 shrink-0">
              <span className="text-[9px] font-mono font-black text-neutral-500 uppercase shrink-0">
                ALL CHAINS:
              </span>
              {allChains.map((c, idx) => (
                <button
                  key={idx}
                  onClick={() => onSelectChainIndex && onSelectChainIndex(idx)}
                  className={`px-2.5 py-1 rounded-lg border-2 border-black font-mono text-[9px] font-black uppercase shrink-0 transition-all ${
                    idx === currentIndex 
                      ? 'bg-[#FDC800] text-black shadow-[2px_2px_0px_#000000]' 
                      : 'bg-white text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  CHAIN #{idx + 1} ({c.nodes?.length || c.links?.length || 0} STAGES)
                </button>
              ))}
            </div>
          )}

          {/* Main Panoramic Architectural Map View */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-4">
            {/* The Connected Domino Stream Map */}
            <div className="p-3.5 sm:p-5 rounded-2xl border-2 border-black bg-white shadow-[3px_3px_0px_#000000] space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-black/10">
                <span className="text-[10px] font-mono font-black uppercase tracking-wider text-neutral-600">
                  SYSTEMATIC CAUSAL STREAM FLOW
                </span>
                <span className="text-[9px] font-mono font-bold text-neutral-500">
                  {nodes.length} SEQUENTIAL DOMINOES
                </span>
              </div>

              {/* Horizontal Scroll on Large Screens / Connected Flow on Small Screens */}
              <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 overflow-x-auto py-2 px-1 scrollbar-thin">
                {nodes.map((node, nIdx, arr) => {
                  const isLast = nIdx === arr.length - 1;
                  const nodeColor = getStageColor(node.stage);

                  return (
                    <React.Fragment key={nIdx}>
                      {/* Individual Domino Node Card */}
                      <div className="w-full md:w-[260px] md:min-w-[240px] md:shrink-0 p-3 sm:p-4 rounded-xl border-2 border-black bg-[#FFFDF8] shadow-[2px_2px_0px_#000000] flex flex-col justify-between gap-3">
                        {/* Top: Stage & Rating */}
                        <div className="flex items-center justify-between gap-1 pb-1 border-b border-black/10">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="w-5 h-5 rounded-full bg-black text-white font-mono text-[9px] font-black flex items-center justify-center shrink-0">
                              {nIdx + 1}
                            </span>
                            <span className={`text-[9px] font-mono font-black px-1.5 py-0.5 rounded border border-black/30 uppercase truncate ${nodeColor.bg} ${nodeColor.text}`}>
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

                        {/* Middle: Rich Summary Text */}
                        <p className="text-xs font-mono font-bold text-neutral-900 leading-relaxed break-words">
                          {node.summary}
                        </p>

                        {/* Bottom: Tag & Sequencing Note */}
                        <div className="flex items-center justify-between gap-1 pt-1.5 border-t border-black/10 text-[8px] font-mono font-black">
                          <span className="text-neutral-500 uppercase">
                            {nIdx === 0 ? 'ORIGIN' : isLast ? 'TERMINATION' : `PROPAGATION #${nIdx + 1}`}
                          </span>
                          {node.frictionTag && (
                            <span className="text-neutral-700 uppercase truncate max-w-[120px]">
                              {node.frictionTag}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Directional Connector Arrow */}
                      {!isLast && (
                        <div className="flex items-center justify-center py-1 md:py-0 md:px-0.5 shrink-0 self-center">
                          <div className="w-8 h-8 rounded-full bg-[#FFFDF8] border-2 border-black flex items-center justify-center shadow-[1.5px_1.5px_0px_#000000]">
                            <ArrowRight className="hidden md:block w-4 h-4 text-black stroke-[3]" />
                            <ArrowDown className="block md:hidden w-4 h-4 text-black stroke-[3]" />
                          </div>
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>

            {/* Tactical Circuit Breaker Section */}
            {circuitBreaker && (
              <div className="p-3.5 sm:p-5 rounded-2xl border-2 sm:border-3 border-[#00A86B] bg-[#00E599]/15 flex items-start gap-3 shadow-[3px_3px_0px_#00A86B]">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#00E599] border-2 border-black flex items-center justify-center shrink-0 mt-0.5 shadow-[1.5px_1.5px_0px_#000000]">
                  <ShieldCheck className="w-4 h-4 text-black stroke-[2.5]" />
                </div>
                <div className="space-y-0.5 text-left min-w-0">
                  <span className="block text-[10px] font-mono font-black uppercase text-[#007038] tracking-wider leading-tight">
                    TACTICAL CIRCUIT BREAKER • PROVEN INTERVENTION
                  </span>
                  <p className="text-xs sm:text-sm font-mono font-bold text-neutral-950 leading-relaxed break-words mt-0.5">
                    {circuitBreaker}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer - Vertical Stacking on Mobile */}
          <div className="pt-2 border-t-2 border-black/10 shrink-0 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span className="text-[10px] font-mono font-bold text-neutral-500 hidden sm:block">
              Forensic behavioral causal cascade synthesized across consecutive diary records
            </span>
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl border-2 border-black bg-black text-white hover:bg-neutral-800 active:translate-x-px active:translate-y-px shadow-[2px_2px_0px_#000000] font-mono text-xs font-black uppercase transition-all"
            >
              CLOSE INSPECTOR
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
