import React from 'react';
import { 
  AlertOctagon, 
  CloudRain, 
  MinusCircle, 
  Zap, 
  Sparkles 
} from 'lucide-react';
import { ratingMeta } from '../services/api';

const IconMap = {
  AlertOctagon,
  CloudRain,
  MinusCircle,
  Zap,
  Sparkles
};

export default function AnalyticsPanel({ entries }) {
  const entryList = Object.values(entries);
  const total = entryList.length;

  if (total === 0) {
    return (
      <div className="minimal-card p-10 text-center max-w-md mx-auto my-8">
        <h3 className="font-serif text-xl font-medium text-[#f5f2ea] mb-2">No entries yet</h3>
        <p className="text-xs font-mono text-[#8e95a5]">
          Log your first few days to start revealing your goodness patterns and hit rates.
        </p>
      </div>
    );
  }

  const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  entryList.forEach(e => {
    if (counts[e.rating] !== undefined) counts[e.rating]++;
  });

  const hitCount = (counts[4] || 0) + (counts[5] || 0);
  const hitRate = Math.round((hitCount / total) * 100);
  const avgScore = (entryList.reduce((acc, e) => acc + Number(e.rating || 0), 0) / total).toFixed(2);

  // Day of week stats
  const dayStats = {
    1: { name: 'Mon', sum: 0, count: 0 },
    2: { name: 'Tue', sum: 0, count: 0 },
    3: { name: 'Wed', sum: 0, count: 0 },
    4: { name: 'Thu', sum: 0, count: 0 },
    5: { name: 'Fri', sum: 0, count: 0 },
    6: { name: 'Sat', sum: 0, count: 0 },
    0: { name: 'Sun', sum: 0, count: 0 }
  };

  entryList.forEach(e => {
    const d = new Date(`${e.date}T00:00:00`);
    if (!isNaN(d.getTime())) {
      const idx = d.getDay();
      dayStats[idx].sum += Number(e.rating);
      dayStats[idx].count++;
    }
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Top 3 Metric Blocks */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        
        <div className="minimal-card p-5">
          <span className="text-[11px] font-mono text-[#8e95a5] uppercase">Hit Rate</span>
          <div className="font-serif text-3xl font-semibold text-[#f5f2ea] mt-1">
            {hitRate}%
          </div>
          <span className="text-xs font-mono text-[#8e95a5]">
            {hitCount} good/peak days out of {total}
          </span>
        </div>

        <div className="minimal-card p-5">
          <span className="text-[11px] font-mono text-[#8e95a5] uppercase">Goodness Index</span>
          <div className="font-serif text-3xl font-semibold text-[#e5c07b] mt-1">
            {avgScore} <span className="text-sm font-sans font-normal text-[#8e95a5]">/ 5.0</span>
          </div>
          <span className="text-xs font-mono text-[#8e95a5]">
            All-time quality average
          </span>
        </div>

        <div className="minimal-card p-5">
          <span className="text-[11px] font-mono text-[#8e95a5] uppercase">Days Tracked</span>
          <div className="font-serif text-3xl font-semibold text-[#f5f2ea] mt-1">
            {total}
          </div>
          <span className="text-xs font-mono text-[#8e95a5]">
            Persisted in local database
          </span>
        </div>

      </div>

      {/* Breakdown Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Rating Breakdown */}
        <div className="minimal-card p-5">
          <h4 className="font-serif text-base font-medium text-[#f5f2ea] mb-4">
            Rating Distribution
          </h4>
          
          <div className="space-y-3">
            {[5, 4, 3, 2, 1].map((val) => {
              const meta = ratingMeta[val];
              const IconComp = IconMap[meta.icon];
              const count = counts[val] || 0;
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;

              return (
                <div key={val} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="flex items-center gap-1.5" style={{ color: meta.color }}>
                      <IconComp className="w-3.5 h-3.5" />
                      <span>{meta.title}</span>
                    </span>
                    <span className="text-[#8e95a5]">{count} ({pct}%)</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all"
                      style={{ width: `${pct}%`, backgroundColor: meta.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Day of Week */}
        <div className="minimal-card p-5">
          <h4 className="font-serif text-base font-medium text-[#f5f2ea] mb-4">
            Day-of-Week Rhythm
          </h4>

          <div className="space-y-2.5">
            {[1, 2, 3, 4, 5, 6, 0].map((idx) => {
              const stat = dayStats[idx];
              const avg = stat.count > 0 ? (stat.sum / stat.count).toFixed(1) : 0;
              const pct = (avg / 5) * 100;

              return (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-[#c8c4bc]">{stat.name}</span>
                    <span className="text-[#8e95a5]">
                      {stat.count > 0 ? `${avg}/5 (${stat.count}d)` : '—'}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-[#e5c07b]/70"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
}
