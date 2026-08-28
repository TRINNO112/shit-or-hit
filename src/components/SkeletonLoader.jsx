import React from 'react';
import ShieldVoltIcon from './ShieldVoltIcon';

export default function SkeletonLoader({ isMobile = false }) {
  if (isMobile) {
    return (
      <div className="min-h-screen bg-[#FFFDF5] text-black font-sans flex flex-col p-4 space-y-4 select-none animate-pulse">
        {/* Mobile Header Skeleton */}
        <div className="flex items-center justify-between bg-white border-2 border-black p-3 rounded-2xl shadow-[2px_2px_0px_#000000]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#FDC800] border-2 border-black flex items-center justify-center p-0.5 shadow-[1px_1px_0px_#000000]">
              <ShieldVoltIcon className="w-full h-full" color="#FDC800" />
            </div>
            <div className="space-y-1.5">
              <div className="h-4 w-28 bg-neutral-300 rounded-md border border-black/20" />
              <div className="h-2.5 w-20 bg-neutral-200 rounded-md" />
            </div>
          </div>
          <div className="h-7 w-16 bg-[#00E599] border-2 border-black rounded-xl" />
        </div>

        {/* Mobile Today Hero Skeleton */}
        <div className="bg-white border-3 border-black rounded-3xl p-5 shadow-[5px_5px_0px_#000000] space-y-4">
          <div className="flex items-center justify-between">
            <div className="h-5 w-32 bg-neutral-300 rounded-md border border-black/20" />
            <div className="h-5 w-16 bg-neutral-200 rounded-md" />
          </div>

          <div className="h-24 bg-neutral-100 border-2 border-dashed border-black/30 rounded-2xl flex items-center justify-center">
            <div className="h-10 w-44 bg-neutral-300 rounded-xl" />
          </div>

          {/* Rating Stars Skeleton */}
          <div className="flex justify-between gap-1.5 py-1">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-11 flex-1 bg-neutral-200 border-2 border-black rounded-xl" />
            ))}
          </div>

          {/* Textarea Skeleton */}
          <div className="h-28 bg-neutral-100 border-2 border-black rounded-2xl p-3 space-y-2">
            <div className="h-3.5 w-3/4 bg-neutral-300 rounded-sm" />
            <div className="h-3.5 w-1/2 bg-neutral-300 rounded-sm" />
            <div className="h-3.5 w-2/3 bg-neutral-200 rounded-sm" />
          </div>

          <div className="h-11 w-full bg-[#00E599] border-2 border-black rounded-2xl shadow-[2px_2px_0px_#000000]" />
        </div>

        {/* Mobile History Cards Skeleton */}
        <div className="space-y-3">
          <div className="h-4 w-28 bg-neutral-300 rounded-md" />
          {[1, 2].map(i => (
            <div key={i} className="bg-white border-2 border-black rounded-2xl p-3.5 shadow-[3px_3px_0px_#000000] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-neutral-200 border-2 border-black" />
                <div className="space-y-1.5">
                  <div className="h-3.5 w-24 bg-neutral-300 rounded" />
                  <div className="h-2.5 w-36 bg-neutral-200 rounded" />
                </div>
              </div>
              <div className="h-6 w-12 bg-neutral-200 border border-black rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFDF5] text-black font-sans flex flex-col select-none animate-pulse">
      {/* Desktop Header Skeleton */}
      <header className="sticky top-0 z-30 bg-[#FFFDF5] border-b-3 border-black py-3 px-4 sm:px-6 shadow-[0_4px_0_#000000]">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#FDC800] border-2 border-black flex items-center justify-center p-1 shadow-[2px_2px_0px_#000000]">
              <ShieldVoltIcon className="w-full h-full" color="#FDC800" />
            </div>
            <div className="space-y-1.5">
              <div className="h-5 w-36 bg-neutral-300 rounded-lg border border-black/20" />
              <div className="h-3 w-28 bg-neutral-200 rounded-md" />
            </div>
          </div>

          {/* Header Action Pills Skeleton */}
          <div className="flex items-center gap-2">
            <div className="h-9 w-20 bg-[#00E599] border-2 border-black rounded-xl shadow-[2px_2px_0px_#000000]" />
            <div className="h-9 w-24 bg-[#FDC800] border-2 border-black rounded-xl shadow-[2px_2px_0px_#000000]" />
            <div className="h-9 w-24 bg-white border-2 border-black rounded-xl shadow-[2px_2px_0px_#000000]" />
            <div className="h-9 w-24 bg-white border-2 border-black rounded-xl shadow-[2px_2px_0px_#000000]" />
            <div className="h-9 w-24 bg-white border-2 border-black rounded-xl shadow-[2px_2px_0px_#000000]" />
            <div className="h-9 w-9 bg-white border-2 border-black rounded-xl shadow-[2px_2px_0px_#000000]" />
          </div>
        </div>
      </header>

      {/* Desktop Main Workspace Skeleton */}
      <main className="max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left / Main Column (8 cols): Today's Verdict & Diary */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white border-3 border-black rounded-3xl p-6 shadow-[8px_8px_0px_#000000] space-y-5">
            <div className="flex items-center justify-between border-b-2 border-black/10 pb-4">
              <div className="space-y-1.5">
                <div className="h-6 w-48 bg-neutral-300 rounded-lg" />
                <div className="h-3.5 w-32 bg-neutral-200 rounded" />
              </div>
              <div className="h-8 w-24 bg-[#FDC800] border-2 border-black rounded-xl" />
            </div>

            {/* Verdict Display Skeleton */}
            <div className="h-28 bg-neutral-50 border-2 border-dashed border-black/30 rounded-2xl flex items-center justify-center">
              <div className="h-12 w-64 bg-neutral-300 rounded-2xl" />
            </div>

            {/* Rating Selector Matrix */}
            <div className="grid grid-cols-5 gap-3">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-16 bg-neutral-100 border-2 border-black rounded-2xl" />
              ))}
            </div>

            {/* Diary Input Area */}
            <div className="h-44 bg-neutral-50 border-2 border-black rounded-2xl p-4 space-y-2.5">
              <div className="h-4 w-3/4 bg-neutral-300 rounded" />
              <div className="h-4 w-1/2 bg-neutral-300 rounded" />
              <div className="h-4 w-2/3 bg-neutral-200 rounded" />
              <div className="h-4 w-5/6 bg-neutral-200 rounded" />
            </div>

            <div className="h-12 w-full bg-[#00E599] border-3 border-black rounded-2xl shadow-[3px_3px_0px_#000000]" />
          </div>
        </div>

        {/* Right Column (4 cols): Stats & Telemetry */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border-3 border-black rounded-3xl p-5 shadow-[6px_6px_0px_#000000] space-y-4">
            <div className="h-5 w-36 bg-neutral-300 rounded-lg" />
            <div className="grid grid-cols-2 gap-3">
              <div className="h-24 bg-neutral-100 border-2 border-black rounded-2xl" />
              <div className="h-24 bg-neutral-100 border-2 border-black rounded-2xl" />
            </div>
            <div className="h-32 bg-neutral-50 border-2 border-black rounded-2xl" />
          </div>

          <div className="bg-white border-3 border-black rounded-3xl p-5 shadow-[6px_6px_0px_#000000] space-y-3">
            <div className="h-5 w-28 bg-neutral-300 rounded-lg" />
            {[1, 2, 3].map(i => (
              <div key={i} className="h-14 bg-neutral-100 border-2 border-black rounded-2xl" />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
