import React, { useEffect, useState } from 'react';
import ShieldVoltIcon from './ShieldVoltIcon';

/* ------------------------------------------------------------------
   Skeleton rules used here:
   1. Structure (cards, borders, shadows, logo) is STATIC, so the page
      feels like the real app instantly and the layout doesn't jump.
   2. Only the content placeholders ("bones") shimmer, and they are all
      neutral grey. Nothing looks like a real, clickable button.
   3. Screen readers get one polite "loading" message, not 40 empty divs.
   4. Motion is disabled for people with prefers-reduced-motion.
   5. Fast loads never flash a skeleton (delayMs).
------------------------------------------------------------------- */

const SHIMMER_CSS = `
.sk-bone { position: relative; overflow: hidden; }
.sk-bone::after {
  content: '';
  position: absolute;
  inset: 0;
  transform: translateX(-100%);
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.65), transparent);
  animation: sk-shimmer 1.4s ease-in-out infinite;
}
@keyframes sk-shimmer { to { transform: translateX(100%); } }
@media (prefers-reduced-motion: reduce) {
  .sk-bone::after { animation: none; }
}
`;

// A single grey placeholder block
function Bone({ className = '', strong = false }) {
  return (
    <div
      aria-hidden="true"
      className={`sk-bone ${strong ? 'bg-neutral-300' : 'bg-neutral-200'} ${className}`}
    />
  );
}

// Static neobrutalist container (kept solid so the layout is recognisable)
function Panel({ className = '', children }) {
  return (
    <div aria-hidden="true" className={`bg-white border-black ${className}`}>
      {children}
    </div>
  );
}

function LogoTile({ size = 'w-11 h-11', radius = 'rounded-2xl', shadow = 'shadow-[2px_2px_0px_#000000]' }) {
  return (
    <div
      aria-hidden="true"
      className={`${size} ${radius} bg-[#FDC800] border-2 border-black flex items-center justify-center p-1 ${shadow}`}
    >
      <ShieldVoltIcon className="w-full h-full" color="#FDC800" />
    </div>
  );
}

function MobileSkeleton() {
  return (
    <div className="min-h-screen bg-[#FFFDF5] text-black font-sans flex flex-col select-none">
      <div className="flex-1 p-4 space-y-4 pb-28">
        {/* Header */}
        <Panel className="flex items-center justify-between border-2 p-3 rounded-2xl shadow-[2px_2px_0px_#000000]">
          <div className="flex items-center gap-2.5">
            <LogoTile size="w-9 h-9" radius="rounded-xl" shadow="shadow-[1px_1px_0px_#000000]" />
            <div className="space-y-1.5">
              <Bone strong className="h-4 w-28 rounded-md" />
              <Bone className="h-2.5 w-20 rounded-md" />
            </div>
          </div>
          <Bone className="h-7 w-16 rounded-xl" />
        </Panel>

        {/* Today hero */}
        <Panel className="border-3 rounded-3xl p-5 shadow-[5px_5px_0px_#000000] space-y-4">
          <div className="flex items-center justify-between">
            <Bone strong className="h-5 w-32 rounded-md" />
            <Bone className="h-5 w-16 rounded-md" />
          </div>

          <div className="h-24 bg-neutral-50 border-2 border-dashed border-black/25 rounded-2xl flex items-center justify-center">
            <Bone strong className="h-10 w-44 rounded-xl" />
          </div>

          <div className="flex justify-between gap-1.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <Bone key={i} className="h-11 flex-1 rounded-xl" />
            ))}
          </div>

          <div className="h-28 bg-neutral-50 border-2 border-black/80 rounded-2xl p-3 space-y-2.5">
            <Bone strong className="h-3.5 w-3/4 rounded-sm" />
            <Bone className="h-3.5 w-1/2 rounded-sm" />
            <Bone className="h-3.5 w-2/3 rounded-sm" />
          </div>

          <Bone strong className="h-11 w-full rounded-2xl" />
        </Panel>

        {/* History */}
        <div className="space-y-3">
          <Bone strong className="h-4 w-28 rounded-md" />
          {[1, 2].map((i) => (
            <Panel
              key={i}
              className="border-2 rounded-2xl p-3.5 shadow-[3px_3px_0px_#000000] flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <Bone className="w-10 h-10 rounded-xl" />
                <div className="space-y-1.5">
                  <Bone strong className="h-3.5 w-24 rounded" />
                  <Bone className="h-2.5 w-36 rounded" />
                </div>
              </div>
              <Bone className="h-6 w-12 rounded-lg" />
            </Panel>
          ))}
        </div>
      </div>

      {/* Bottom tab bar: Today / History / Dossier / Settings (prevents a jump when the app loads) */}
      <nav
        aria-hidden="true"
        className="fixed bottom-0 inset-x-0 bg-white border-t-3 border-black px-4 pt-2.5 flex justify-between"
        style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
      >
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex flex-col items-center gap-1.5 w-16">
            <Bone strong className="w-7 h-7 rounded-lg" />
            <Bone className="h-2 w-10 rounded" />
          </div>
        ))}
      </nav>
    </div>
  );
}

function DesktopSkeleton() {
  return (
    <div className="min-h-screen bg-[#FFFDF5] text-black font-sans flex flex-col select-none">
      {/* Header */}
      <header
        aria-hidden="true"
        className="sticky top-0 z-30 bg-[#FFFDF5] border-b-3 border-black py-3 px-4 sm:px-6 shadow-[0_4px_0_#000000]"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <LogoTile />
            <div className="space-y-1.5">
              <Bone strong className="h-5 w-36 rounded-lg" />
              <Bone className="h-3 w-28 rounded-md" />
            </div>
          </div>

          {/* Nav pills: fewer on narrow screens so nothing overflows */}
          <div className="flex items-center gap-2">
            <Bone className="h-9 w-20 rounded-xl border-2 border-black shadow-[2px_2px_0px_#000000]" />
            <Bone className="h-9 w-24 rounded-xl border-2 border-black shadow-[2px_2px_0px_#000000] hidden sm:block" />
            <Bone className="h-9 w-24 rounded-xl border-2 border-black shadow-[2px_2px_0px_#000000] hidden md:block" />
            <Bone className="h-9 w-24 rounded-xl border-2 border-black shadow-[2px_2px_0px_#000000] hidden lg:block" />
            <Bone className="h-9 w-24 rounded-xl border-2 border-black shadow-[2px_2px_0px_#000000] hidden lg:block" />
            <Bone className="h-9 w-9 rounded-xl border-2 border-black shadow-[2px_2px_0px_#000000]" />
          </div>
        </div>
      </header>

      {/* Workspace */}
      <main className="max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Today's verdict & diary */}
        <div className="lg:col-span-8 space-y-6">
          <Panel className="border-3 rounded-3xl p-6 shadow-[8px_8px_0px_#000000] space-y-5">
            <div className="flex items-center justify-between border-b-2 border-black/10 pb-4">
              <div className="space-y-1.5">
                <Bone strong className="h-6 w-48 rounded-lg" />
                <Bone className="h-3.5 w-32 rounded" />
              </div>
              <Bone className="h-8 w-24 rounded-xl" />
            </div>

            <div className="h-28 bg-neutral-50 border-2 border-dashed border-black/25 rounded-2xl flex items-center justify-center">
              <Bone strong className="h-12 w-64 rounded-2xl" />
            </div>

            <div className="grid grid-cols-5 gap-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Bone key={i} className="h-16 rounded-2xl" />
              ))}
            </div>

            <div className="h-44 bg-neutral-50 border-2 border-black/80 rounded-2xl p-4 space-y-3">
              <Bone strong className="h-4 w-3/4 rounded" />
              <Bone className="h-4 w-1/2 rounded" />
              <Bone className="h-4 w-2/3 rounded" />
              <Bone className="h-4 w-5/6 rounded" />
            </div>

            <Bone strong className="h-12 w-full rounded-2xl" />
          </Panel>
        </div>

        {/* Stats & telemetry */}
        <div className="lg:col-span-4 space-y-6">
          <Panel className="border-3 rounded-3xl p-5 shadow-[6px_6px_0px_#000000] space-y-4">
            <Bone strong className="h-5 w-36 rounded-lg" />
            <div className="grid grid-cols-2 gap-3">
              <Bone className="h-24 rounded-2xl" />
              <Bone className="h-24 rounded-2xl" />
            </div>
            <Bone className="h-32 rounded-2xl" />
          </Panel>

          <Panel className="border-3 rounded-3xl p-5 shadow-[6px_6px_0px_#000000] space-y-3">
            <Bone strong className="h-5 w-28 rounded-lg" />
            {[1, 2, 3].map((i) => (
              <Bone key={i} className="h-14 rounded-2xl" />
            ))}
          </Panel>
        </div>
      </main>
    </div>
  );
}

/**
 * @param isMobile  render the compact mobile layout
 * @param delayMs   wait this long before showing the skeleton, so fast loads never flash it
 */
export default function SkeletonLoader({ isMobile = false, delayMs = 0 }) {
  const [visible, setVisible] = useState(delayMs <= 0);

  useEffect(() => {
    if (delayMs <= 0) return undefined;
    const t = setTimeout(() => setVisible(true), delayMs);
    return () => clearTimeout(t);
  }, [delayMs]);

  return (
    <div role="status" aria-live="polite" aria-busy="true">
      <style>{SHIMMER_CSS}</style>
      <span className="sr-only">Loading your daily verdict…</span>
      {visible ? (
        isMobile ? <MobileSkeleton /> : <DesktopSkeleton />
      ) : (
        <div className="min-h-screen bg-[#FFFDF5]" aria-hidden="true" />
      )}
    </div>
  );
}
