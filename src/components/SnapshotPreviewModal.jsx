import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Database, RotateCcw, X, Calendar, Star, FileText, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { ratingMeta } from '../services/api';
import soundEngine from '../services/soundEngine';

/**
 * 📂 SnapshotPreviewModal
 * Safe, zero-risk inspection modal for Time Machine rolling snapshots.
 * Lets users read what entries and notes are contained inside a backup
 * without modifying their live database.
 * 
 * Strict UI Standard: Zero raw emojis, Pure Neobrutalism, 320px mobile-first.
 */
export default function SnapshotPreviewModal({
  isOpen,
  onClose,
  snapshot,
  onRestore
}) {
  if (!isOpen || !snapshot) return null;

  const entriesList = Object.entries(snapshot.entries || {})
    .map(([date, entry]) => ({ date, ...entry }))
    .sort((a, b) => b.date.localeCompare(a.date));

  const dateObj = new Date(snapshot.timestamp);
  const timeStr = isNaN(dateObj.getTime()) ? snapshot.timestamp : dateObj.toLocaleString();

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-90 flex items-center justify-center p-3 sm:p-5 bg-black/65 backdrop-blur-xs"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="w-full max-w-xl bg-[#FFFDF5] border-3 border-black rounded-3xl p-4 sm:p-6 shadow-[5px_5px_0px_#000000] max-h-[90vh] flex flex-col gap-3.5 text-black overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b-2 border-black/10 shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-[#00E599] border-2 border-black flex items-center justify-center shadow-[1.5px_1.5px_0px_#000000] shrink-0">
                <Database className="w-5 h-5 text-black stroke-[2.5]" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-display font-black text-base sm:text-lg uppercase tracking-tight leading-none truncate">
                    Snapshot #{snapshot.id} Preview
                  </h3>
                  <span className="px-1.5 py-0.5 rounded bg-black text-[#00E599] font-mono text-[9px] font-black uppercase shrink-0">
                    READ ONLY
                  </span>
                </div>
                <p className="font-mono text-[10px] sm:text-xs text-neutral-600 truncate mt-0.5">
                  Captured: {timeStr}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                onClose();
              }}
              className="p-1.5 rounded-xl border-2 border-black bg-white hover:bg-neutral-100 shadow-[1.5px_1.5px_0px_#000000] cursor-pointer active:translate-x-px active:translate-y-px shrink-0"
              title="Close preview"
              aria-label="Close preview"
            >
              <X className="w-4 h-4 stroke-3 text-black" />
            </button>
          </div>

          {/* Safety Notification */}
          <div className="p-2.5 bg-blue-50 border-2 border-blue-600 rounded-2xl flex items-center gap-2 shrink-0">
            <ShieldAlert className="w-4 h-4 text-blue-700 stroke-[2.5] shrink-0" />
            <p className="font-mono text-[10px] sm:text-[11px] text-blue-950 font-bold leading-tight">
              Safe Preview: Your live database is completely untouched. Restoring will auto-stash your current live data so you can revert anytime.
            </p>
          </div>

          {/* Snapshot Summary Strip */}
          <div className="grid grid-cols-2 gap-2 shrink-0 font-mono">
            <div className="p-2.5 bg-white border-2 border-black rounded-xl text-center shadow-[1.5px_1.5px_0px_#000]">
              <span className="text-[9px] uppercase font-bold text-neutral-500 block">TOTAL ENTRIES</span>
              <span className="font-display font-black text-base text-black">
                {entriesList.length} {entriesList.length === 1 ? 'DAY' : 'DAYS'}
              </span>
            </div>
            <div className="p-2.5 bg-white border-2 border-black rounded-xl text-center shadow-[1.5px_1.5px_0px_#000]">
              <span className="text-[9px] uppercase font-bold text-neutral-500 block">DATE HORIZON</span>
              <span className="font-display font-black text-xs sm:text-sm text-black truncate block mt-0.5">
                {entriesList.length > 0 ? `${entriesList[entriesList.length - 1].date} → ${entriesList[0].date}` : 'EMPTY'}
              </span>
            </div>
          </div>

          {/* Scrollable Entries List */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-36">
            {entriesList.length === 0 ? (
              <div className="p-4 bg-white border-2 border-black rounded-xl text-center font-mono text-xs text-neutral-500">
                This snapshot contains no recorded entries.
              </div>
            ) : (
              entriesList.map((entry) => {
                const meta = ratingMeta[entry.rating] || {};
                return (
                  <div
                    key={entry.date}
                    className="p-3 bg-white border-2 border-black rounded-xl shadow-[1.5px_1.5px_0px_#000000] space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-neutral-600" />
                        <span className="font-mono text-xs font-black text-black">
                          {entry.date}
                        </span>
                      </div>

                      <div 
                        className="px-2 py-0.5 rounded-lg border border-black font-mono text-[10px] font-black uppercase shadow-[1px_1px_0px_#000]"
                        style={{ backgroundColor: meta.bg || '#FDC800' }}
                      >
                        {entry.rating}★ {meta.title || entry.verdict}
                      </div>
                    </div>

                    {entry.notes ? (
                      <p className="font-mono text-[11px] text-neutral-800 line-clamp-3 bg-neutral-50 p-2 rounded-lg border border-black/10 leading-relaxed whitespace-pre-wrap">
                        {typeof entry.notes === 'string' ? entry.notes : JSON.stringify(entry.notes)}
                      </p>
                    ) : (
                      <span className="font-mono text-[10px] text-neutral-400 italic block">
                        No reflection note recorded.
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Action Footer (Vertical-First Stacking on 320px) */}
          <div className="pt-2 border-t-2 border-black/10 flex flex-col sm:flex-row gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                soundEngine.playSuccessChime();
                onRestore(snapshot.id);
                onClose();
              }}
              className="w-full sm:flex-1 py-2.5 sm:py-3 bg-[#00E599] hover:bg-emerald-400 text-black border-2 border-black rounded-xl font-display font-black text-xs uppercase shadow-[2px_2px_0px_#000000] cursor-pointer active:translate-x-px active:translate-y-px transition-all flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4 stroke-3" />
              <span>SWITCH TO THIS BACKUP</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                onClose();
              }}
              className="w-full sm:w-auto px-4 py-2.5 sm:py-3 bg-white hover:bg-neutral-100 text-black border-2 border-black rounded-xl font-mono font-bold text-xs uppercase shadow-[1.5px_1.5px_0px_#000000] cursor-pointer active:translate-x-px active:translate-y-px"
            >
              CLOSE
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
