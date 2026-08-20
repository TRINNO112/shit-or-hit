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

export default function StatsWidget({ entries, dayCount }) {
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
    <div className="neo-card p-6 bg-white flex flex-col justify-between h-full">
      
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-black stroke-[2.5]" />
            <h3 className="font-display font-black text-base text-black uppercase tracking-wider">
              LIFETIME METRICS
            </h3>
          </div>
          <span className="text-xs font-mono font-black px-2 py-0.5 bg-[#FDC800] border-2 border-black rounded-md shadow-[2px_2px_0px_#000000]">
            STATS
          </span>
        </div>

        {/* Top 2 Metric Cards */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="p-3.5 rounded-xl border-2 border-black bg-[#FFFDF5] shadow-[2px_2px_0px_#000000]">
            <span className="text-[10px] font-mono font-black text-neutral-600 uppercase block">
              HIT RATE %
            </span>
            <div className="font-display font-black text-2xl text-black mt-0.5">
              {hitRate}%
            </div>
            <span className="text-[10px] font-mono text-neutral-500">
              {hitCount}/{total} days
            </span>
          </div>

          <div className="p-3.5 rounded-xl border-2 border-black bg-[#FFFDF5] shadow-[2px_2px_0px_#000000]">
            <span className="text-[10px] font-mono font-black text-neutral-600 uppercase block">
              AVG QUALITY
            </span>
            <div className="font-display font-black text-2xl text-black mt-0.5">
              {avgScore} <span className="text-xs font-mono text-neutral-500">/ 5.0</span>
            </div>
            <span className="text-[10px] font-mono text-neutral-500">
              Overall score
            </span>
          </div>
        </div>

        {/* Verdict Distribution Bars */}
        <div className="space-y-2.5">
          <span className="text-[11px] font-mono font-black text-neutral-700 uppercase block">
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
                  <span className="flex items-center gap-1.5 text-black uppercase">
                    <SvgIcon className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>{m.title}</span>
                  </span>
                  <span className="text-neutral-600">{count}d ({pct}%)</span>
                </div>
                <div className="w-full h-3 bg-neutral-100 border-2 border-black rounded-md overflow-hidden">
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

      <div className="mt-6 pt-4 border-t-2 border-black/10 text-center">
        <p className="text-[11px] font-mono text-neutral-500 font-bold">
          Database automatically updates into <span className="text-black">data/entries.json</span>
        </p>
      </div>

    </div>
  );
}
