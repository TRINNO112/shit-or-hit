import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Radio,
  HardDriveDownload,
  Lock,
  Cloud,
  Check,
  ArrowRight,
  X,
  Database
} from 'lucide-react';

export default function SovereignGuestBanner({
  onOpenP2PSync,
  onExportData,
  onOpenCloudAuth,
  onDismiss
}) {
  const [isPersisted, setIsPersisted] = useState(false);
  const [persisting, setPersisting] = useState(false);

  useEffect(() => {
    if (navigator.storage && navigator.storage.persisted) {
      navigator.storage.persisted().then(setIsPersisted);
    }
  }, []);

  const handlePersistStorage = async () => {
    if (!navigator.storage || !navigator.storage.persist) return;
    setPersisting(true);
    try {
      const granted = await navigator.storage.persist();
      setIsPersisted(granted);
    } catch (err) {
      console.error('Storage persistence request failed:', err);
    } finally {
      setPersisting(false);
    }
  };

  return (
    <section
      aria-label="Sovereign Local Mode Intelligence"
      className="relative w-full bg-[#FFFDF5] border-3 border-black shadow-[4px_4px_0px_#000000] p-4 sm:p-6 mb-6 transition-all"
    >
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b-2 border-black">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-[#00E599] border-2 border-black shadow-[2px_2px_0px_#000000]">
            <ShieldCheck className="w-5 h-5 text-black stroke-2" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] font-black uppercase tracking-wider bg-black text-white px-2 py-0.5">
                LOCAL SOVEREIGN MODE
              </span>
              {isPersisted && (
                <span className="font-mono text-[10px] font-black uppercase tracking-wider bg-[#00E599] text-black border border-black px-1.5 py-0.5 flex items-center gap-1">
                  <Check className="w-3 h-3 stroke-3" /> PERSISTED
                </span>
              )}
            </div>
            <h2 className="font-black text-base sm:text-lg tracking-tight uppercase text-black mt-0.5">
              YOUR DATA STAYS ON YOUR METAL
            </h2>
          </div>
        </div>

        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss sovereign vault banner"
            className="self-end sm:self-auto p-1.5 border-2 border-black bg-white hover:bg-neutral-100 shadow-[2px_2px_0px_#000000] active:translate-x-px active:translate-y-px active:shadow-none transition-transform cursor-pointer"
          >
            <X className="w-4 h-4 text-black stroke-2" />
          </button>
        )}
      </div>

      {/* Subhead Manifesto */}
      <p className="font-mono text-xs sm:text-sm text-neutral-800 font-bold uppercase mt-3 mb-4 leading-relaxed">
        Zero tracking scripts. Zero cloud telemetry. Your daily verdicts and journals live exclusively in your browser sandbox with zero external dependencies.
      </p>

      {/* 3 Benefit Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
        {/* Pillar 1 */}
        <div className="bg-white border-2 border-black p-3.5 shadow-[2px_2px_0px_#000000] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-[9px] font-black bg-[#FDC800] text-black border border-black px-1.5 py-0.5 uppercase">
                AIR-GAPPED
              </span>
              <Database className="w-4 h-4 text-black" />
            </div>
            <h3 className="font-mono text-xs font-black uppercase tracking-tight text-black mb-1">
              Client-Side Core
            </h3>
            <p className="font-mono text-[11px] text-neutral-700 leading-tight">
              Stored locally on device. Your raw thoughts never touch AI training sets or corporate data brokers.
            </p>
          </div>
        </div>

        {/* Pillar 2 */}
        <div className="bg-white border-2 border-black p-3.5 shadow-[2px_2px_0px_#000000] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-[9px] font-black bg-[#00E599] text-black border border-black px-1.5 py-0.5 uppercase">
                DIRECT MESH
              </span>
              <Radio className="w-4 h-4 text-black" />
            </div>
            <h3 className="font-mono text-xs font-black uppercase tracking-tight text-black mb-1">
              P2P Device Sync
            </h3>
            <p className="font-mono text-[11px] text-neutral-700 leading-tight">
              Pair desktop and mobile via encrypted WebRTC local tunnels without creating any central account.
            </p>
          </div>
        </div>

        {/* Pillar 3 */}
        <div className="bg-white border-2 border-black p-3.5 shadow-[2px_2px_0px_#000000] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-[9px] font-black bg-[#FF4D4D] text-white border border-black px-1.5 py-0.5 uppercase">
                ZERO LOCK-IN
              </span>
              <HardDriveDownload className="w-4 h-4 text-black" />
            </div>
            <h3 className="font-mono text-xs font-black uppercase tracking-tight text-black mb-1">
              Instant Liberation
            </h3>
            <p className="font-mono text-[11px] text-neutral-700 leading-tight">
              Cold export complete database snapshots in raw JSON or CSV format anytime with zero friction.
            </p>
          </div>
        </div>
      </div>

      {/* Action Footer: Golden Vertical Stacking on Mobile */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-3 border-t-2 border-black">
        {/* Primary Storage Pin CTA */}
        <button
          type="button"
          onClick={handlePersistStorage}
          disabled={isPersisted || persisting}
          className="w-full sm:w-auto font-mono text-xs font-black uppercase tracking-wider px-4 py-2.5 bg-[#00E599] hover:bg-[#00cc88] disabled:bg-neutral-200 border-2 border-black shadow-[3px_3px_0px_#000000] active:translate-x-px active:translate-y-px active:shadow-none enabled:cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-transform"
        >
          {isPersisted ? (
            <>
              <Check className="w-4 h-4 stroke-3 text-black" />
              <span>STORAGE PERMANENTLY PINNED</span>
            </>
          ) : (
            <>
              <Lock className="w-4 h-4 text-black" />
              <span>{persisting ? 'SECURING...' : 'LOCK PERSISTENT STORAGE'}</span>
            </>
          )}
        </button>

        {/* Secondary Sovereign Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {onOpenP2PSync && (
            <button
              type="button"
              onClick={onOpenP2PSync}
              className="w-full sm:w-auto font-mono text-xs font-black uppercase tracking-wider px-3.5 py-2.5 bg-white hover:bg-neutral-100 border-2 border-black shadow-[2px_2px_0px_#000000] active:translate-x-px active:translate-y-px active:shadow-none cursor-pointer flex items-center justify-center gap-2"
            >
              <Radio className="w-3.5 h-3.5 text-black" />
              <span>P2P SYNC</span>
            </button>
          )}

          {onExportData && (
            <button
              type="button"
              onClick={onExportData}
              className="w-full sm:w-auto font-mono text-xs font-black uppercase tracking-wider px-3.5 py-2.5 bg-[#FDC800] hover:bg-[#e0b200] border-2 border-black shadow-2px_2px_0px_#000000 active:translate-x-px active:translate-y-px active:shadow-none cursor-pointer flex items-center justify-center gap-2"
            >
              <HardDriveDownload className="w-3.5 h-3.5 text-black" />
              <span>EXPORT JSON</span>
            </button>
          )}

          {onOpenCloudAuth && (
            <button
              type="button"
              onClick={onOpenCloudAuth}
              className="w-full sm:w-auto font-mono text-[11px] font-black uppercase tracking-wider px-3 py-2 text-neutral-600 hover:text-black hover:underline flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Cloud className="w-3.5 h-3.5 text-neutral-600" />
              <span>OPTIONAL CLOUD SYNC</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
