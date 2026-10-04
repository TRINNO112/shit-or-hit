import React, { useEffect, useState, useCallback } from 'react';
import {
  ArrowLeft,
  X,
  ExternalLink,
  Maximize2,
  Minimize2,
  Workflow,
  Sparkles
} from 'lucide-react';

export default function ArchitectureFlowchartModal({ onClose }) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Close handlers
  const handleClose = useCallback(() => {
    if (onClose) onClose();
  }, [onClose]);

  // Fullscreen toggle handler
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Keyboard shortcut listener (Escape or Ctrl+Shift+A)
  // Keyboard shortcut listener (Escape, Alt+A, Ctrl+Shift+M, Ctrl+Shift+A)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleClose();
        return;
      }
      const isCloseKey =
        (e.altKey && (e.key === 'a' || e.key === 'A')) ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'm' || e.key === 'M' || e.key === 'f' || e.key === 'F' || e.key === 'a' || e.key === 'A'));

      if (isCloseKey) {
        e.preventDefault();
        e.stopPropagation();
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleClose]);

  // Listen to messages from the embedded iframe
  useEffect(() => {
    const handleMessage = (e) => {
      if (e.data?.type === 'CLOSE_FLOWCHART') {
        handleClose();
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [handleClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="System Architecture Flowchart"
      className="fixed inset-0 z-90 flex flex-col bg-[#FFFDF8] text-black overflow-hidden select-none animate-in fade-in duration-200"
    >
      {/* Neobrutalist Header Toolbar */}
      <header className="shrink-0 flex items-center justify-between px-3 sm:px-6 py-2.5 sm:py-3 bg-[#FFFDF5] border-b-3 border-black shadow-[0_2px_0px_#000000] z-20">
        <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
          <button
            type="button"
            onClick={handleClose}
            aria-label="Back to Diary"
            className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 bg-[#FDC800] text-black border-2 border-black font-mono font-black text-xs uppercase shadow-[2px_2px_0px_#000000] hover:translate-x-px hover:translate-y-px hover:shadow-[1px_1px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer shrink-0"
          >
            <ArrowLeft className="w-4 h-4 stroke-3" />
            <span className="hidden xs:inline">BACK TO DIARY</span>
            <span className="xs:hidden">BACK</span>
          </button>

          <div className="flex items-center gap-2 min-w-0">
            <div className="hidden md:flex p-1.5 bg-[#00E599] border-2 border-black shadow-[2px_2px_0px_#000000] shrink-0">
              <Workflow className="w-4 h-4 text-black stroke-3" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="font-mono font-black text-xs sm:text-sm tracking-tight uppercase truncate">
                  ARCHITECTURE MAP
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 bg-[#00C2FF]/20 border border-black font-mono font-black text-[10px] uppercase text-[#006699]">
                  <Sparkles className="w-2.5 h-2.5" />
                  GCERT RBVP 2026
                </span>
              </div>
              <p className="hidden md:block font-mono text-[10px] text-zinc-600 truncate">
                Interactive Hand-Drawn Flowchart • Dual-Mode Lifecycle &amp; Security Specs
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Keyboard shortcut hint */}
          <span className="hidden lg:inline-flex px-2 py-1 bg-zinc-100 border border-black font-mono font-bold text-[10px] text-zinc-700">
            HOTKEY: ALT + A (OR CTRL + SHIFT + M)
          </span>

          {/* Open in Dedicated Window (Essential for Multi-Screen Presentations) */}
          <a
            href="/architecture-flowchart.html"
            target="_blank"
            rel="noopener noreferrer"
            title="Open in dedicated tab for multi-screen projection"
            className="flex items-center gap-1 px-2 sm:px-3 py-1.5 bg-[#FFFDF8] text-black border-2 border-black font-mono font-black text-xs uppercase shadow-[2px_2px_0px_#000000] hover:bg-zinc-100 active:translate-x-px active:translate-y-px active:shadow-none transition-all cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5 stroke-3" />
            <span className="hidden sm:inline">NEW TAB</span>
          </a>

          {/* Fullscreen Button */}
          <button
            type="button"
            onClick={toggleFullscreen}
            aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            className="p-1.5 bg-[#FFFDF8] text-black border-2 border-black shadow-[2px_2px_0px_#000000] hover:bg-zinc-100 active:translate-x-px active:translate-y-px active:shadow-none transition-all cursor-pointer"
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4 stroke-3" />
            ) : (
              <Maximize2 className="w-4 h-4 stroke-3" />
            )}
          </button>

          {/* Exit Button */}
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close Architecture Map"
            title="Close [Esc]"
            className="p-1.5 bg-[#FF4D4D] text-black border-2 border-black shadow-[2px_2px_0px_#000000] hover:brightness-110 active:translate-x-px active:translate-y-px active:shadow-none transition-all cursor-pointer"
          >
            <X className="w-4 h-4 stroke-3" />
          </button>
        </div>
      </header>

      {/* Full-Screen Isolated Canvas Iframe */}
      <main className="relative flex-1 w-full h-full bg-[#FFF9EE] overflow-hidden">
        <iframe
          src="/architecture-flowchart.html"
          title="Daily Verdict Architecture Flowchart"
          className="w-full h-full border-0 select-none"
          loading="eager"
        />
      </main>
    </div>
  );
}
