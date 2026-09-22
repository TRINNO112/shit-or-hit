import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, FileSpreadsheet, BookOpen, Code, CheckCircle2, Sparkles, ShieldCheck } from 'lucide-react';
import { exportEntriesToCsv, exportEntriesToExcel, exportEntriesToDiaryDigest, exportDatabaseBackup } from '../services/api';
import soundEngine from '../services/soundEngine';

/**
 * 📦 Neobrutalist Multi-Format Export Studio Modal
 * Allows exporting user diary data to Styled Excel (.XLS), Universal CSV, readable Diary Digest (.MD), or Complete JSON.
 * Engineered with pinned header/footer and scrollable core to prevent clipping under DevTools or mobile screens.
 */
export default function ExportStudioModal({ isOpen, onClose, entries = {}, startDate = '' }) {
  const [downloadState, setDownloadState] = useState(null); // 'excel' | 'csv' | 'digest' | 'json' | null
  const totalEntries = Object.keys(entries || {}).length;

  if (!isOpen) return null;

  const handleExportExcel = () => {
    soundEngine.playSuccess();
    setDownloadState('excel');
    exportEntriesToExcel(entries, startDate);
    setTimeout(() => setDownloadState(null), 1800);
  };

  const handleExportCsv = () => {
    soundEngine.playSuccess();
    setDownloadState('csv');
    exportEntriesToCsv(entries, startDate);
    setTimeout(() => setDownloadState(null), 1800);
  };

  const handleExportDigest = () => {
    soundEngine.playSuccess();
    setDownloadState('digest');
    exportEntriesToDiaryDigest(entries, startDate);
    setTimeout(() => setDownloadState(null), 1800);
  };

  const handleExportJson = () => {
    soundEngine.playSuccess();
    setDownloadState('json');
    exportDatabaseBackup(startDate, entries);
    setTimeout(() => setDownloadState(null), 1800);
  };

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-xs overflow-hidden"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          transition={{ duration: 0.18 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-xl bg-[#FFFDF8] border-3 border-black shadow-[8px_8px_0px_#000000] flex flex-col max-h-[92vh] sm:max-h-[88vh] overflow-hidden"
        >
          {/* Pinned Header (Guaranteed Never Cut Off) */}
          <div className="flex items-start justify-between gap-4 border-b-3 border-black p-5 sm:p-6 pb-4 bg-[#FFFDF8] shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2.5 sm:p-3 bg-[#FDC800] border-2 border-black shadow-[3px_3px_0px_#000000] shrink-0">
                <Download className="w-6 h-6 text-black stroke-[2.5]" />
              </div>
              <div className="min-w-0">
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-black text-white font-mono text-[10px] sm:text-[11px] font-black uppercase tracking-wider mb-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#00E599] stroke-[2.5]" />
                  <span>DATA SOVEREIGNTY • {totalEntries} RECORDED {totalEntries === 1 ? 'DAY' : 'DAYS'}</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-black tracking-tight leading-snug py-0.5 truncate">
                  Export Studio
                </h2>
              </div>
            </div>
            <button
              onClick={() => {
                soundEngine.playClick();
                onClose();
              }}
              className="p-2 bg-[#FF4D4D] text-black border-2 border-black hover:bg-black hover:text-white transition-colors shadow-[2px_2px_0px_#000000] active:translate-x-px active:translate-y-px active:shadow-none shrink-0 cursor-pointer"
              aria-label="Close Export Studio"
            >
              <X className="w-5 h-5 stroke-3" />
            </button>
          </div>

          {/* Scrollable Export Options Core (DevTools-Proof & Mobile-Optimized) */}
          <div className="flex-1 overflow-y-auto overscroll-contain p-5 sm:p-6 space-y-3.5">
            {/* Context Notice */}
            <div className="bg-[#FFF9E6] border-2 border-black p-3 text-xs sm:text-sm font-mono text-black leading-relaxed flex items-center gap-2.5 shadow-[2px_2px_0px_#000000]">
              <Sparkles className="w-4 h-4 text-black shrink-0 stroke-[2.5]" />
              <span>
                Export your diary records directly from browser sandbox memory. Zero server telemetry.
              </span>
            </div>

            {/* 1. Styled Microsoft Excel Spreadsheet (.XLS) - RECOMMENDED */}
            <button
              onClick={handleExportExcel}
              disabled={downloadState !== null}
              className="w-full text-left p-4 bg-[#FFF9E6] hover:bg-[#FFF3CC] border-3 border-black shadow-[4px_4px_0px_#000000] hover:shadow-[2px_2px_0px_#000000] hover:translate-x-px hover:translate-y-px active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-start gap-3.5 cursor-pointer group"
            >
              <div className="p-2.5 bg-[#FDC800] border-2 border-black shrink-0 mt-0.5 shadow-[2px_2px_0px_#000000]">
                <FileSpreadsheet className="w-5 h-5 text-black stroke-[2.5]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between flex-wrap gap-1.5 mb-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-black text-sm text-black uppercase tracking-wide">
                      Styled Excel Workbook (.XLS)
                    </span>
                    <span className="text-[9px] font-mono font-black bg-[#00E599] text-black px-1.5 py-0.5 border border-black shadow-[1px_1px_0px_#000000]">
                      RECOMMENDED
                    </span>
                  </div>
                  {downloadState === 'excel' && (
                    <span className="text-[10px] font-mono font-black bg-[#00E599] text-black px-2 py-0.5 border border-black flex items-center gap-1 shadow-[1px_1px_0px_#000000]">
                      <CheckCircle2 className="w-3.5 h-3.5 stroke-3" /> DOWNLOADED
                    </span>
                  )}
                </div>
                <p className="text-xs font-mono text-black/80 mb-2 leading-relaxed">
                  Pre-formatted auto-width columns (eliminates <code className="bg-white px-1 py-0.2 border border-black/40 font-bold">########</code>), Gold headers, styled verdict cells, and formatted stars.
                </p>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[9px] font-mono font-black bg-white text-black px-1.5 py-0.5 border border-black">
                    AUTO-FIT COLUMNS
                  </span>
                  <span className="text-[9px] font-mono font-black bg-white text-black px-1.5 py-0.5 border border-black">
                    GOLD HEADERS
                  </span>
                  <span className="text-[9px] font-mono font-black bg-white text-black px-1.5 py-0.5 border border-black">
                    COLOR VERDICTS
                  </span>
                </div>
              </div>
            </button>

            {/* 2. Standard CSV (.CSV) */}
            <button
              onClick={handleExportCsv}
              disabled={downloadState !== null}
              className="w-full text-left p-4 bg-white hover:bg-neutral-50 border-2 border-black shadow-[3px_3px_0px_#000000] hover:shadow-[1px_1px_0px_#000000] hover:translate-x-px hover:translate-y-px active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-start gap-3.5 cursor-pointer group"
            >
              <div className="p-2.5 bg-[#00E599] border-2 border-black shrink-0 mt-0.5 shadow-[1px_1px_0px_#000000]">
                <FileSpreadsheet className="w-5 h-5 text-black stroke-[2.5]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between flex-wrap gap-1.5 mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-sm text-black uppercase tracking-wide">
                      Standard CSV (.CSV)
                    </span>
                    <span className="text-[9px] font-mono font-black bg-neutral-200 text-neutral-800 px-1.5 py-0.5 border border-black">
                      RFC 4180
                    </span>
                  </div>
                  {downloadState === 'csv' && (
                    <span className="text-[10px] font-mono font-black bg-[#00E599] text-black px-2 py-0.5 border border-black flex items-center gap-1 shadow-[1px_1px_0px_#000000]">
                      <CheckCircle2 className="w-3.5 h-3.5 stroke-3" /> DOWNLOADED
                    </span>
                  )}
                </div>
                <p className="text-xs font-mono text-black/70 mb-2 leading-relaxed">
                  Plain RFC 4180 CSV with UTF-8 BOM and formula-protected date cells. Universal compatibility with Python, Sheets, and R.
                </p>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[9px] font-mono font-black bg-neutral-100 text-black px-1.5 py-0.5 border border-black">
                    UTF-8 BOM
                  </span>
                  <span className="text-[9px] font-mono font-black bg-neutral-100 text-black px-1.5 py-0.5 border border-black">
                    GOOGLE SHEETS
                  </span>
                  <span className="text-[9px] font-mono font-black bg-neutral-100 text-black px-1.5 py-0.5 border border-black">
                    DATA SCIENCE
                  </span>
                </div>
              </div>
            </button>

            {/* 3. Personal Diary Digest (Markdown / Text) */}
            <button
              onClick={handleExportDigest}
              disabled={downloadState !== null}
              className="w-full text-left p-4 bg-white hover:bg-neutral-50 border-2 border-black shadow-[3px_3px_0px_#000000] hover:shadow-[1px_1px_0px_#000000] hover:translate-x-px hover:translate-y-px active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-start gap-3.5 cursor-pointer group"
            >
              <div className="p-2.5 bg-[#FDC800] border-2 border-black shrink-0 mt-0.5 shadow-[1px_1px_0px_#000000]">
                <BookOpen className="w-5 h-5 text-black stroke-[2.5]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between flex-wrap gap-1.5 mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-sm text-black uppercase tracking-wide">
                      Diary Digest Journal (.MD)
                    </span>
                    <span className="text-[9px] font-mono font-black bg-[#FDC800]/40 text-black px-1.5 py-0.5 border border-black">
                      MARKDOWN
                    </span>
                  </div>
                  {downloadState === 'digest' && (
                    <span className="text-[10px] font-mono font-black bg-[#FDC800] text-black px-2 py-0.5 border border-black flex items-center gap-1 shadow-[1px_1px_0px_#000000]">
                      <CheckCircle2 className="w-3.5 h-3.5 stroke-3" /> DOWNLOADED
                    </span>
                  )}
                </div>
                <p className="text-xs font-mono text-black/70 mb-2 leading-relaxed">
                  Clean, human-readable journal with headers, star icons, habit checklists, and written reflections.
                </p>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[9px] font-mono font-black bg-neutral-100 text-black px-1.5 py-0.5 border border-black">
                    OBSIDIAN / NOTION
                  </span>
                  <span className="text-[9px] font-mono font-black bg-neutral-100 text-black px-1.5 py-0.5 border border-black">
                    PRINT READY
                  </span>
                </div>
              </div>
            </button>

            {/* 4. Complete Machine Backup (.JSON) */}
            <button
              onClick={handleExportJson}
              disabled={downloadState !== null}
              className="w-full text-left p-4 bg-white hover:bg-neutral-50 border-2 border-black shadow-[3px_3px_0px_#000000] hover:shadow-[1px_1px_0px_#000000] hover:translate-x-px hover:translate-y-px active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-start gap-3.5 cursor-pointer group"
            >
              <div className="p-2.5 bg-[#00D8F6] border-2 border-black shrink-0 mt-0.5 shadow-[1px_1px_0px_#000000]">
                <Code className="w-5 h-5 text-black stroke-[2.5]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between flex-wrap gap-1.5 mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-sm text-black uppercase tracking-wide">
                      Complete Machine Backup (.JSON)
                    </span>
                    <span className="text-[9px] font-mono font-black bg-[#00D8F6]/30 text-black px-1.5 py-0.5 border border-black">
                      SNAPSHOT
                    </span>
                  </div>
                  {downloadState === 'json' && (
                    <span className="text-[10px] font-mono font-black bg-[#00D8F6] text-black px-2 py-0.5 border border-black flex items-center gap-1 shadow-[1px_1px_0px_#000000]">
                      <CheckCircle2 className="w-3.5 h-3.5 stroke-3" /> DOWNLOADED
                    </span>
                  )}
                </div>
                <p className="text-xs font-mono text-black/70 mb-2 leading-relaxed">
                  Full developer backup payload containing all data points, life spheres, timestamps, and schema metadata for 1-click restoration.
                </p>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[9px] font-mono font-black bg-neutral-100 text-black px-1.5 py-0.5 border border-black">
                    1-CLICK RESTORE
                  </span>
                  <span className="text-[9px] font-mono font-black bg-neutral-100 text-black px-1.5 py-0.5 border border-black">
                    FULL METADATA
                  </span>
                </div>
              </div>
            </button>
          </div>

          {/* Pinned Footer (Guaranteed Never Cut Off) */}
          <div className="p-4 sm:px-6 sm:py-4 border-t-3 border-black bg-[#FFFDF5] shrink-0 flex items-center justify-between gap-3">
            <span className="flex items-center gap-1.5 text-xs font-mono text-black/70">
              <ShieldCheck className="w-4 h-4 text-[#00E599] stroke-[2.5]" />
              <span className="font-bold">100% Client-Side Cryptography</span>
            </span>
            <button
              onClick={() => {
                soundEngine.playClick();
                onClose();
              }}
              className="px-5 py-2.5 bg-black text-white hover:bg-[#FDC800] hover:text-black font-mono font-black text-xs uppercase tracking-wider border-2 border-black shadow-[3px_3px_0px_#000000] hover:shadow-[1px_1px_0px_#000000] hover:translate-x-px hover:translate-y-px active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
