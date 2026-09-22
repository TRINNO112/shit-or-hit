import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, FileSpreadsheet, BookOpen, Code, CheckCircle2, Sparkles, ShieldCheck } from 'lucide-react';
import { exportEntriesToCsv, exportEntriesToExcel, exportEntriesToDiaryDigest, exportDatabaseBackup } from '../services/api';

/**
 * 📦 Neobrutalist Multi-Format Export Studio Modal
 * Allows exporting user diary data to Excel CSV, readable Diary Digest (Markdown), or System JSON.
 */
export default function ExportStudioModal({ isOpen, onClose, entries = {}, startDate = '' }) {
  const [downloadState, setDownloadState] = useState(null); // 'csv' | 'digest' | 'json' | null
  const totalEntries = Object.keys(entries || {}).length;

  if (!isOpen) return null;

  const handleExportExcel = () => {
    setDownloadState('excel');
    exportEntriesToExcel(entries, startDate);
    setTimeout(() => setDownloadState(null), 1800);
  };

  const handleExportCsv = () => {
    setDownloadState('csv');
    exportEntriesToCsv(entries, startDate);
    setTimeout(() => setDownloadState(null), 1800);
  };

  const handleExportDigest = () => {
    setDownloadState('digest');
    exportEntriesToDiaryDigest(entries, startDate);
    setTimeout(() => setDownloadState(null), 1800);
  };

  const handleExportJson = () => {
    setDownloadState('json');
    exportDatabaseBackup(startDate, entries);
    setTimeout(() => setDownloadState(null), 1800);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          transition={{ duration: 0.18 }}
          className="relative w-full max-w-lg bg-[#FFFDF8] border-3 border-black shadow-[6px_6px_0px_#000000] p-5 sm:p-7 my-8"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-4 border-b-3 border-black pb-4 mb-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-[#FDC800] border-2 border-black shadow-[2px_2px_0px_#000000]">
                <Download className="w-6 h-6 text-black stroke-[2.5]" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest bg-black text-white px-2 py-0.5 font-bold">
                  DATA SOVEREIGNTY • {totalEntries} RECORDED DAYS
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-black tracking-tight mt-1">
                  Export Studio
                </h2>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 bg-[#FF4D4D] text-black border-2 border-black hover:bg-black hover:text-white transition-colors shadow-[2px_2px_0px_#000000] shrink-0"
              aria-label="Close Export Studio"
            >
              <X className="w-5 h-5 stroke-3" />
            </button>
          </div>

          <p className="text-xs sm:text-sm font-mono text-black/80 mb-5 leading-relaxed">
            Choose your preferred export format. Your diary records, ratings, habits, and notes will be packaged directly from your browser memory:
          </p>

          {/* Export Options Grid */}
          <div className="space-y-3">
            
            {/* 1. Styled Microsoft Excel Spreadsheet (.XLS) - RECOMMENDED */}
            <button
              onClick={handleExportExcel}
              disabled={downloadState !== null}
              className="w-full text-left p-4 bg-[#FFF9E6] hover:bg-[#FDC800]/30 border-3 border-black shadow-[4px_4px_0px_#000000] hover:translate-x-px hover:translate-y-px hover:shadow-[2px_2px_0px_#000000] transition-all flex items-start gap-3 cursor-pointer group"
            >
              <div className="p-2.5 bg-[#FDC800] border-2 border-black shrink-0 mt-0.5 shadow-[1px_1px_0px_#000000]">
                <FileSpreadsheet className="w-5 h-5 text-black stroke-[2.5]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between flex-wrap gap-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-sm text-black uppercase tracking-wide">
                      Styled Excel Workbook (.XLS)
                    </span>
                    <span className="text-[9px] font-mono font-black bg-[#00E599] text-black px-1.5 py-0.2 border border-black">
                      RECOMMENDED
                    </span>
                  </div>
                  {downloadState === 'excel' && (
                    <span className="text-[10px] font-mono font-black bg-[#00E599] text-black px-1.5 py-0.5 border border-black flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 stroke-3" /> DOWNLOADED
                    </span>
                  )}
                </div>
                <p className="text-xs font-mono text-black/80 mt-1">
                  Custom auto-fitted column widths (never shows <code className="bg-white px-1 py-0.5 border border-black/30 font-bold">########</code>), Gold headers, styled verdict badges, and formatted star ratings.
                </p>
              </div>
            </button>

            {/* 2. Excel Compatible CSV */}
            <button
              onClick={handleExportCsv}
              disabled={downloadState !== null}
              className="w-full text-left p-4 bg-white hover:bg-[#00E599]/20 border-2 border-black shadow-[3px_3px_0px_#000000] hover:translate-x-px hover:translate-y-px hover:shadow-[2px_2px_0px_#000000] transition-all flex items-start gap-3 cursor-pointer group"
            >
              <div className="p-2 bg-[#00E599] border-2 border-black shrink-0 mt-0.5">
                <FileSpreadsheet className="w-5 h-5 text-black stroke-[2.5]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-black text-sm text-black uppercase tracking-wide">
                    Standard CSV (.CSV)
                  </span>
                  {downloadState === 'csv' && (
                    <span className="text-[10px] font-mono font-black bg-[#00E599] text-black px-1.5 py-0.5 border border-black flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 stroke-3" /> DOWNLOADED
                    </span>
                  )}
                </div>
                <p className="text-xs font-mono text-black/70 mt-1">
                  Plain RFC 4180 CSV with UTF-8 BOM and text-formatted dates. Compatible with all spreadsheet tools.
                </p>
              </div>
            </button>

            {/* 2. Personal Diary Digest (Markdown / Text) */}
            <button
              onClick={handleExportDigest}
              disabled={downloadState !== null}
              className="w-full text-left p-4 bg-white hover:bg-[#FDC800]/25 border-2 border-black shadow-[3px_3px_0px_#000000] hover:translate-x-px hover:translate-y-px hover:shadow-[2px_2px_0px_#000000] transition-all flex items-start gap-3 cursor-pointer group"
            >
              <div className="p-2 bg-[#FDC800] border-2 border-black shrink-0 mt-0.5">
                <BookOpen className="w-5 h-5 text-black stroke-[2.5]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-black text-sm text-black uppercase tracking-wide">
                    Diary Digest Journal (.MD)
                  </span>
                  {downloadState === 'digest' && (
                    <span className="text-[10px] font-mono font-black bg-[#FDC800] text-black px-1.5 py-0.5 border border-black flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 stroke-3" /> DOWNLOADED
                    </span>
                  )}
                </div>
                <p className="text-xs font-mono text-black/70 mt-1">
                  Beautiful, human-readable journal with headers, star icons, habit checklists, and your written thoughts. Perfect for reading or printing.
                </p>
              </div>
            </button>

            {/* 3. Raw Machine JSON */}
            <button
              onClick={handleExportJson}
              disabled={downloadState !== null}
              className="w-full text-left p-4 bg-white hover:bg-[#00D8F6]/20 border-2 border-black shadow-[3px_3px_0px_#000000] hover:translate-x-px hover:translate-y-px hover:shadow-[2px_2px_0px_#000000] transition-all flex items-start gap-3 cursor-pointer group"
            >
              <div className="p-2 bg-[#00D8F6] border-2 border-black shrink-0 mt-0.5">
                <Code className="w-5 h-5 text-black stroke-[2.5]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-black text-sm text-black uppercase tracking-wide">
                    Complete Machine Backup (.JSON)
                  </span>
                  {downloadState === 'json' && (
                    <span className="text-[10px] font-mono font-black bg-[#00D8F6] text-black px-1.5 py-0.5 border border-black flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 stroke-3" /> DOWNLOADED
                    </span>
                  )}
                </div>
                <p className="text-xs font-mono text-black/70 mt-1">
                  Raw developer backup payload containing all data points, life spheres, timestamps, and schema metadata for complete system restoration.
                </p>
              </div>
            </button>

          </div>

          {/* Footer Note */}
          <div className="mt-6 pt-4 border-t-2 border-black flex items-center justify-between text-xs font-mono text-black/60">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-black stroke-[2.5]" />
              <span>100% Client-Side Generation</span>
            </span>
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
