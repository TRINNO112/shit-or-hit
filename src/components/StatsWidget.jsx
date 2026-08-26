import React from 'react';
import { 
  BarChart2, 
  Flame, 
  Zap, 
  Award,
  AlertCircle,
  CloudRain,
  MinusCircle,
  Sparkles
} from 'lucide-react';
import { ratingMeta } from '../services/api';

const IconMap = {
  AlertCircle,
  CloudRain,
  MinusCircle,
  Zap,
  Sparkles
};

export default function StatsWidget({ entries, dayCount, onOpenTelemetry }) {
  const entryList = Object.values(entries);
  const total = entryList.length;

  const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  entryList.forEach(e => {
    if (counts[e.rating] !== undefined) counts[e.rating]++;
  });

  const hitCount = (counts[4] || 0) + (counts[5] || 0);
  const hitRate = total > 0 ? Math.round((hitCount / total) * 100) : 0;
  const avgScore = total > 0 ? (entryList.reduce((acc, e) => acc + Number(e.rating || 0), 0) / total).toFixed(1) : '-';

  return (
    <div className="neo-card bg-white flex flex-col justify-between h-full" style={{ padding: '32px 36px' }}>
      
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-2 border-b-2 border-black/10">
          <div className="flex items-center gap-2.5">
            <BarChart2 className="w-5 h-5 text-black stroke-[2.5]" />
            <h3 className="font-display font-black text-lg text-black uppercase tracking-wider">
              LIFETIME METRICS
            </h3>
          </div>
          <span className="text-xs font-mono font-black px-3 py-1 bg-[#FDC800] border-2 border-black rounded-md shadow-[2px_2px_0px_#000000]">
            STATS
          </span>
        </div>

        {/* Top 2 Metric Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-4 rounded-xl border-2 border-black bg-[#FFFDF5] shadow-[2px_2px_0px_#000000]">
            <span className="text-xs font-mono font-black text-neutral-600 uppercase block">
              HIT RATE %
            </span>
            <div className="font-display font-black text-3xl text-black mt-1">
              {hitRate}%
            </div>
            <span className="text-[11px] font-mono font-bold text-neutral-500 mt-0.5 block">
              {hitCount}/{total} logged days
            </span>
          </div>

          <div className="p-4 rounded-xl border-2 border-black bg-[#FFFDF5] shadow-[2px_2px_0px_#000000]">
            <span className="text-xs font-mono font-black text-neutral-600 uppercase block">
              AVG QUALITY
            </span>
            <div className="font-display font-black text-3xl text-black mt-1">
              {avgScore} <span className="text-sm font-mono text-neutral-500">/ 5.0</span>
            </div>
            <span className="text-[11px] font-mono font-bold text-neutral-500 mt-0.5 block">
              Overall score
            </span>
          </div>
        </div>

        {/* Verdict Distribution Bars */}
        <div className="space-y-3">
          <span className="text-xs font-mono font-black text-neutral-800 uppercase block tracking-wider">
            VERDICT BREAKDOWN
          </span>

          {[5, 4, 3, 2, 1].map((val) => {
            const m = ratingMeta[val];
            const SvgIcon = IconMap[m.icon];
            const count = counts[val] || 0;
            const pct = total > 0 ? Math.round((count / total) * 100) : 0;

            return (
              <div key={val} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-mono font-bold">
                  <span className="flex items-center gap-1.5 text-black uppercase font-bold">
                    <SvgIcon className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>{m.title}</span>
                  </span>
                  <span className="text-neutral-700 font-bold">{count}d ({pct}%)</span>
                </div>
                <div className="w-full h-3.5 bg-neutral-100 border-2 border-black rounded-lg overflow-hidden">
                  <div
                    className="h-full border-r border-black transition-all duration-500"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: m.bg
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-6 pt-4 border-t-2 border-black/10 space-y-3">
        {onOpenTelemetry && (
          <button
            type="button"
            onClick={onOpenTelemetry}
            className="w-full py-2.5 bg-[#00E599] hover:bg-emerald-400 border-2 border-black rounded-xl font-display font-black text-xs text-black uppercase shadow-[2px_2px_0px_#000000] cursor-pointer flex items-center justify-center gap-1.5 transition-all hover:translate-x-[-1px] hover:translate-y-[-1px]"
          >
            <Zap className="w-3.5 h-3.5 stroke-[3]" />
            <span>FORENSIC TELEMETRY HUB</span>
          </button>
        )}
        <p className="text-xs font-mono text-neutral-600 font-bold text-center">
          Database updates into <code className="text-black bg-yellow-200 px-1 rounded border border-black font-black">data/entries.json</code>
        </p>
      </div>

    </div>
  );
}
