import React, { useMemo } from 'react';
import { Sparkles, Brain, CheckCircle2, ChevronRight, HelpCircle } from 'lucide-react';
import { soundEngine } from '../services/soundEngine';

/**
 * 🧠 Cognitive Distortion Scanner
 * Real-time semantic analysis engine for student journal reflections.
 * Detects common cognitive biases (Catastrophizing, All-or-Nothing, Emotional Reasoning)
 * and provides empirical Cognitive Behavioral Therapy (CBT) reframing suggestions.
 */

const DISTORTION_PATTERNS = [
  {
    type: 'catastrophizing',
    label: 'CATASTROPHIZING',
    color: '#FF4D4D',
    bg: '#FFF0F0',
    regex: /\b(ruined everything|it['’]?s over|always fail|total disaster|never recover|complete nightmare|worst day ever|everything is ruined|destroyed my life)\b/i,
    description: 'Blowing negative outcomes out of proportion and assuming the worst possible conclusion.',
    reframeAdvice: 'Extreme finality detected. What is one specific element or lesson that survived today?',
    sampleReframe: 'Today was tough, but a single setback does not define my entire trajectory.'
  },
  {
    type: 'all_or_nothing',
    label: 'ALL-OR-NOTHING',
    color: '#FF9500',
    bg: '#FFF8F0',
    regex: /\b(nothing worked|nobody cares|never do anything right|impossible to|total waste of time|everything went wrong|complete failure|100% useless)\b/i,
    description: 'Viewing situations in black-and-white extremes with zero middle ground.',
    reframeAdvice: 'Polarity bias detected. Can you identify one micro-win or neutral outcome today?',
    sampleReframe: 'Parts of today went poorly, but I still made progress on specific small tasks.'
  },
  {
    type: 'emotional_reasoning',
    label: 'EMOTIONAL REASONING',
    color: '#38BDF8',
    bg: '#F0F9FF',
    regex: /\b(feel like a failure|feel stupid|feel worthless|feel hopeless|feel like giving up|feel incompetent)\b/i,
    description: 'Assuming that negative emotions reflect objective truth ("I feel it, therefore it must be true").',
    reframeAdvice: 'Feelings are physiological signals, not objective permanent facts.',
    sampleReframe: 'I am experiencing mental fatigue right now, which is a state of body, not my innate worth.'
  },
  {
    type: 'mind_reading',
    label: 'MIND READING',
    color: '#A78BFA',
    bg: '#F8F5FF',
    regex: /\b(everyone hates me|they all think I am|they are judging me|everyone is laughing|disappointed in me)\b/i,
    description: 'Assuming you know what others are thinking without empirical evidence.',
    reframeAdvice: 'Mind-reading assumption. Do you have concrete proof, or is stress projecting fear?',
    sampleReframe: 'Most people are absorbed in their own challenges, not scrutinizing my performance.'
  }
];

export function scanForDistortions(text) {
  if (!text || typeof text !== 'string' || text.trim().length < 8) return [];
  const matches = [];
  for (const item of DISTORTION_PATTERNS) {
    const match = text.match(item.regex);
    if (match) {
      matches.push({
        ...item,
        matchedPhrase: match[0]
      });
    }
  }
  return matches;
}

export default function CognitiveDistortionScanner({ text, onApplyReframe = null, className = '' }) {
  const detectedDistortions = useMemo(() => scanForDistortions(text), [text]);

  if (!detectedDistortions || detectedDistortions.length === 0) return null;

  return (
    <div className={`space-y-2 select-none ${className}`}>
      {detectedDistortions.map((d) => (
        <div
          key={d.type}
          className="border-2 border-black rounded-xl p-2.5 sm:p-3 shadow-[2px_2px_0px_#000000] transition-all"
          style={{ backgroundColor: d.bg }}
        >
          <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
            <div className="flex items-center gap-1.5 min-w-0">
              <span 
                className="w-2.5 h-2.5 rounded-full border border-black shrink-0" 
                style={{ backgroundColor: d.color }} 
              />
              <span className="font-mono font-black text-[10px] sm:text-xs uppercase text-black tracking-tight">
                COGNITIVE MIRROR: {d.label}
              </span>
            </div>
            <span className="font-mono text-[9px] font-bold px-1.5 py-0.5 bg-black/10 text-neutral-800 rounded">
              &quot;{d.matchedPhrase}&quot;
            </span>
          </div>

          <p className="text-[11px] font-mono text-neutral-800 leading-relaxed mb-2">
            <strong className="text-black">Scientific Insight: </strong>
            {d.reframeAdvice}
          </p>

          {onApplyReframe && (
            <div className="flex items-center justify-between gap-2 pt-1 border-t border-black/10">
              <span className="text-[10px] font-mono text-neutral-600 truncate italic">
                Suggestion: &quot;{d.sampleReframe}&quot;
              </span>
              <button
                type="button"
                onClick={() => {
                  try { soundEngine.playClick(); } catch (e) {}
                  onApplyReframe(d.sampleReframe);
                }}
                className="px-2.5 py-1 bg-white hover:bg-[#FDC800] border border-black rounded-lg font-mono text-[10px] font-black uppercase text-black shadow-[1px_1px_0px_#000000] cursor-pointer active:translate-x-px shrink-0 flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3 stroke-[2.5]" />
                <span>INJECT REFRAME</span>
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
