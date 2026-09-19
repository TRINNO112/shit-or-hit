import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertOctagon,
  Activity,
  Check,
  X,
  FileSearch,
  RotateCcw,
  CheckCircle2,
  FileText,
  HelpCircle,
  FolderLock,
  ChevronRight,
  ShieldCheck,
  Terminal,
  Crosshair,
  AlertTriangle
} from 'lucide-react';
import { soundEngine } from '../services/soundEngine';
import { AutopsyBadge } from './AutopsyBadge';

// Re-export for seamless backward compatibility
export { AutopsyBadge };

/* ------------------------------------------------------------------------
   Distressed CIA Top Secret Stamp
------------------------------------------------------------------------- */
function TopSecretStamp({ text = "TOP SECRET // EYES ONLY", isDeclassified = false }) {
  const color = isDeclassified ? '#146B43' : '#B91C1C';
  const label = isDeclassified ? 'DECLASSIFIED // ACTION REQUIRED' : text;

  return (
    <div className="inline-block select-none" style={{ transform: 'rotate(-4deg)' }}>
      <div
        className="px-3 py-1 border-3 border-dashed font-mono font-black text-xs sm:text-sm tracking-widest uppercase rounded-sm shadow-[2px_2px_0px_rgba(0,0,0,0.15)] flex items-center gap-1.5"
        style={{ color, borderColor: color }}
      >
        <AlertTriangle className="w-3.5 h-3.5" />
        <span>{label}</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------------
   Main Modal: Classified CIA Forensic Inquest Dossier
------------------------------------------------------------------------- */
export default function AutopsyChamberModal({
  isOpen,
  onClose,
  entryDate = new Date().toISOString().slice(0, 10),
  rating = 1,
  notes = '',
  spheres = {},
  anchors = {},
  existingAutopsy = null,
  onSaveAutopsy
}) {
  // States: 'scanning' | 'interrogating' | 'completed'
  const [stage, setStage] = useState(existingAutopsy ? 'completed' : 'scanning');
  const [autopsyData, setAutopsyData] = useState(existingAutopsy || null);
  const [userAnswers, setUserAnswers] = useState(existingAutopsy?.userAnswers || {});
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch AI Autopsy from backend API or local intelligent engine
  const fetchAutopsyAnalysis = async () => {
    setIsLoading(true);
    setErrorMsg('');
    setStage('scanning');
    soundEngine?.playRoughTone?.();

    try {
      const res = await fetch('/api/ai/autopsy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: entryDate,
          rating: Number(rating) || 1,
          notes: notes || '',
          spheres: spheres || {},
          anchors: anchors || {}
        })
      });

      if (!res.ok) throw new Error(`API error: ${res.status}`);

      const data = await res.json();
      if (data?.success && data?.autopsy) {
        setAutopsyData(data.autopsy);
        setStage('interrogating');
        soundEngine?.playSuccessChime?.();
      } else {
        throw new Error(data?.error || 'Failed to parse autopsy');
      }
    } catch (err) {
      // Intelligent fallback dossier
      const fallback = {
        causeOfDeath: 'Acute Operational Derailment: Morning friction loops compromised discipline, allowing screen stimulation and avoidance behavior to dominate the day.',
        questions: [],
        recoveryAntidote: 'Execute a strict 60-minute digital curfew before sleep tonight, consume 750ml of water immediately upon waking tomorrow, and complete your primary anchor before opening any browser or social media feed.'
      };
      setAutopsyData(fallback);
      setStage('interrogating');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    if (existingAutopsy && existingAutopsy.causeOfDeath) {
      setAutopsyData(existingAutopsy);
      setUserAnswers(existingAutopsy.userAnswers || {});
      setStage('completed');
    } else {
      fetchAutopsyAnalysis();
    }
  }, [isOpen, existingAutopsy, entryDate, rating]);

  const handleSelectAnswer = (qId, optionText) => {
    soundEngine?.playClick?.();
    setUserAnswers(prev => ({
      ...prev,
      [qId]: optionText
    }));
  };

  const handleSaveAndSeal = () => {
    soundEngine?.playCapsuleSeal?.();
    const finalReport = {
      ...autopsyData,
      userAnswers,
      savedAt: new Date().toISOString(),
      entryDate
    };

    if (onSaveAutopsy) {
      onSaveAutopsy(finalReport);
    }
    setStage('completed');
    soundEngine?.playSuccessChime?.();
  };

  // Dynamically tailor interrogations according to user's notes and skipped anchors
  const questionsList = useMemo(() => {
    if (autopsyData?.questions && autopsyData.questions.length > 0) {
      return autopsyData.questions;
    }
    const notesLower = (notes || '').toLowerCase();

    let q1Text = 'What breach of protocol initiated the morning momentum collapse?';
    let q1Options = [
      'Late night screen scrolling / doom loop past curfew',
      'Procrastination and friction when initiating high-leverage work',
      'Physical lethargy / untreated emotional overwhelm'
    ];

    if (notesLower.includes('sleep') || notesLower.includes('night') || notesLower.includes('bed') || notesLower.includes('screen') || notesLower.includes('scroll')) {
      q1Text = 'Circadian Breach: When did the sleep and digital perimeter collapse?';
      q1Options = [
        'Passive doomscrolling in bed past midnight',
        'Working late without hard mental boundaries',
        'Dopamine spike keeping cognitive nervous system awake'
      ];
    } else if (notesLower.includes('tired') || notesLower.includes('exhaust') || notesLower.includes('energy') || notesLower.includes('burnout')) {
      q1Text = 'Biological Deficit: What compromised your physical endurance today?';
      q1Options = [
        'Severe sleep debt accumulated from previous nights',
        'Dehydration, poor nutrition, or skipping movement',
        'Mental exhaustion from prolonged unaddressed stress'
      ];
    }

    let q2Text = 'Anchor Audit: Which core non-negotiable anchor was abandoned first?';
    let q2Options = [
      'Morning physical movement / workout block',
      'Deep distraction-free academic / work session',
      'Evening wind-down & intentional reflection'
    ];

    if (anchors && Object.keys(anchors).some(k => !anchors[k])) {
      const missed = Object.keys(anchors).filter(k => !anchors[k]);
      q2Text = `Anchor Breach: Why was "${missed[0].replace(/_/g, ' ')}" abandoned?`;
      q2Options = [
        'Postponed until late and ran completely out of willpower',
        'Allowed trivial distractions to consume the designated window',
        'Felt mental resistance and opted for immediate low-effort comfort'
      ];
    }

    let q3Text = 'Root Mechanism: What allowed one rough trigger to compromise the entire day?';
    let q3Options = [
      'Zero barrier of friction placed around phone and social feeds',
      'All-or-nothing cognitive distortion ("day is already ruined")',
      'Failing to execute an immediate 5-minute emergency reset'
    ];

    return [
      { id: 'q1', question: q1Text, options: q1Options },
      { id: 'q2', question: q2Text, options: q2Options },
      { id: 'q3', question: q3Text, options: q3Options }
    ];
  }, [autopsyData, notes, anchors]);

  // Single Authoritative Paragraph Solution Prescription
  const solutionParagraph = useMemo(() => {
    const raw = autopsyData?.recoveryAntidote || autopsyData?.antidote;
    if (!raw) {
      return "Enforce an absolute digital lockdown 60 minutes before sleep tonight, hydrate with cold water immediately upon waking, execute your non-negotiable anchor before opening any screen or browser tab, and secure a decisive hit rating tomorrow to permanently terminate the downward momentum loop.";
    }
    if (Array.isArray(raw)) {
      return raw
        .map(s => s.trim().replace(/[.;,]+$/, ''))
        .filter(Boolean)
        .join('. ') + '.';
    }
    if (typeof raw === 'string') {
      return raw
        .split(/\n+/)
        .map(s => s.replace(/^[-*•\d.]+\s*/, '').trim())
        .filter(Boolean)
        .join(' ')
        .replace(/\s+/g, ' ');
    }
    return String(raw);
  }, [autopsyData]);

  if (!isOpen) return null;

  const allQuestionsAnswered = questionsList.length === 0 || questionsList.every(q => !!userAnswers[q.id]);

  return (
    <div
      className="fixed inset-0 z-[85] bg-[#0C0A09]/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
      onClick={onClose}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Courier+Prime:ital,wght@0,400;0,700;1,400&display=swap');

        .cia-manila-folder {
          background-color: #E6D7B8;
          background-image: radial-gradient(#D5C4A1 1px, transparent 1px);
          background-size: 14px 14px;
        }

        .cia-tab {
          background-color: #D8C7A5;
          clip-path: polygon(0 0, 88% 0, 100% 100%, 0% 100%);
        }

        .cia-paper-sheet {
          background-color: #FAF6ED;
          box-shadow: inset 0 0 40px rgba(180, 150, 110, 0.2);
        }

        .cia-redacted {
          background-color: #1C1917;
          color: #1C1917;
          user-select: none;
          padding: 0 4px;
        }
      `}</style>

      <div
        className="w-full max-w-xl cia-manila-folder rounded-3xl border-3 border-[#1C1917] shadow-[8px_8px_0px_#1C1917] p-4 sm:p-6 text-left max-h-[94vh] flex flex-col relative overflow-hidden text-[#1C1917]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Manila Folder File Tab */}
        <div className="flex items-center justify-between border-b-2 border-[#1C1917] pb-2.5 shrink-0">
          <div className="flex items-center gap-2">
            <div className="cia-tab px-4 py-1 border-t-2 border-l-2 border-r-2 border-[#1C1917] font-mono text-[10px] font-black tracking-wider uppercase text-[#1C1917]">
              DOSSIER // REF-{entryDate.replace(/-/g, '')}
            </div>
            <span className="hidden sm:inline-block font-mono text-[10px] font-bold text-neutral-600">
              [BEHAVIORAL FORENSICS]
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#FAF6ED] hover:bg-[#EAE0CD] border-2 border-[#1C1917] cursor-pointer shadow-[1.5px_1.5px_0px_#1C1917] active:scale-95 transition-all"
            aria-label="Close"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Dossier Header & Stamped Title */}
        <div className="pt-3 pb-2 shrink-0 space-y-2">
          {/* Metadata & Stamp Row */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-[#1C1917] text-[#FAF6ED] text-[9px] font-mono font-black uppercase tracking-wider">
                CLEARANCE LEVEL 5
              </span>
              <span className="text-[10px] font-mono font-bold text-[#854D0E] bg-[#D8C7A5]/50 px-2 py-0.5 rounded border border-[#1C1917]/20">
                SUBJECT VERDICT: {rating === 1 ? '1★ ROUGH' : '2★ DOWN'}
              </span>
            </div>

            <div className="shrink-0">
              <TopSecretStamp isDeclassified={stage === 'completed'} />
            </div>
          </div>

          {/* Full-width Title & Subtitle */}
          <div className="w-full">
            <h3 className="font-mono font-black text-xl sm:text-2xl uppercase tracking-tight text-[#1C1917] leading-tight">
              CRIME SCENE FORENSIC INQUEST
            </h3>
            <p className="text-xs sm:text-sm font-mono text-neutral-700 mt-1 leading-normal">
              Auditing the cognitive chain-of-events that fractured daily momentum.
            </p>
          </div>
        </div>

        {/* -------------------------------------------------------------
            STAGE 1: SCANNING / LOADING
        -------------------------------------------------------------- */}
        {stage === 'scanning' && (
          <div className="flex-1 py-12 flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#FAF6ED] border-2 border-[#1C1917] flex items-center justify-center shadow-[3px_3px_0px_#1C1917] animate-pulse">
              <FileSearch className="w-6 h-6 text-[#B91C1C]" />
            </div>
            <h4 className="font-mono font-black text-sm uppercase text-[#1C1917]">
              Conducting Ballistics & Forensic Audit...
            </h4>
            <p className="font-mono text-xs text-neutral-600 max-w-xs">
              Deconstructing entry notes, failed habit anchors, and friction triggers.
            </p>
          </div>
        )}

        {/* -------------------------------------------------------------
            STAGE 2: INTERROGATION DOSSIER
        -------------------------------------------------------------- */}
        {stage === 'interrogating' && (
          <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 mt-2 min-h-0">
            {/* Primary Cause of Breakdown Card */}
            <div className="cia-paper-sheet border-2 border-[#1C1917] rounded-2xl p-3.5 sm:p-4 shadow-[3px_3px_0px_#1C1917]">
              <div className="text-[10px] font-mono font-black text-[#B91C1C] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <AlertOctagon className="w-3.5 h-3.5" />
                <span>PRIMARY CAUSE OF FAILURE:</span>
              </div>
              <p className="font-mono text-xs sm:text-sm font-bold text-[#1C1917] leading-relaxed">
                {autopsyData?.causeOfDeath}
              </p>
            </div>

            {/* Inquest Interrogation Questions */}
            <div className="space-y-3">
              <div className="text-[11px] font-mono font-black text-[#1C1917] uppercase tracking-wider flex items-center gap-1.5">
                <Crosshair className="w-3.5 h-3.5 text-[#B91C1C]" />
                <span>MANDATORY INQUEST DEBRIEFING ({Object.keys(userAnswers).length}/{questionsList.length}):</span>
              </div>

              {questionsList.map((q, idx) => (
                <div
                  key={q.id}
                  className="bg-[#FAF6ED] border-2 border-[#1C1917] rounded-2xl p-3 sm:p-3.5 shadow-[2px_2px_0px_#1C1917]"
                >
                  <div className="font-mono text-xs font-bold text-[#1C1917] mb-2 flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#1C1917] text-[#FAF6ED] text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{q.question}</span>
                  </div>

                  <div className="space-y-1.5 pl-7">
                    {q.options.map((opt, optIdx) => {
                      const isSelected = userAnswers[q.id] === opt;
                      return (
                        <button
                          key={optIdx}
                          type="button"
                          onClick={() => handleSelectAnswer(q.id, opt)}
                          className={`w-full text-left p-2 rounded-xl border-2 font-mono text-[11px] sm:text-xs transition-all cursor-pointer flex items-center justify-between gap-2 ${
                            isSelected
                              ? 'bg-[#1C1917] text-[#FAF6ED] border-[#1C1917] shadow-[2px_2px_0px_#854D0E]'
                              : 'bg-white text-neutral-800 border-[#1C1917]/30 hover:border-[#1C1917] hover:bg-neutral-50'
                          }`}
                        >
                          <span>{opt}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-[#FDE047] shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Single Paragraph Tactical Countermeasure */}
            <div className="cia-paper-sheet border-2 border-[#1C1917] rounded-2xl p-4 shadow-[3px_3px_0px_#1C1917]">
              <div className="text-[10px] font-mono font-black text-[#146B43] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#146B43]" />
                <span>TACTICAL PRESCRIPTION FOR TOMORROW:</span>
              </div>
              <p className="font-mono text-xs sm:text-sm font-bold text-[#1C1917] leading-relaxed">
                {solutionParagraph}
              </p>
            </div>

            {/* Seal and Complete Button */}
            <div className="pt-1">
              <button
                type="button"
                onClick={handleSaveAndSeal}
                disabled={!allQuestionsAnswered}
                className="w-full py-3 px-4 bg-[#B91C1C] hover:bg-[#991B1B] text-[#FAF6ED] font-mono font-black text-xs sm:text-sm uppercase tracking-wider rounded-xl border-2 border-[#1C1917] shadow-[3px_3px_0px_#1C1917] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_#1C1917] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FolderLock className="w-4 h-4" />
                <span>
                  {allQuestionsAnswered ? 'Seal Autopsy Dossier & Commit Protocol' : 'Answer Inquest Questions to Seal'}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------
            STAGE 3: COMPLETED / DECLASSIFIED RECORD
        -------------------------------------------------------------- */}
        {stage === 'completed' && (
          <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 mt-2 min-h-0 flex flex-col">
            {/* Sealed File Hero Banner */}
            <div className="cia-paper-sheet border-2 border-[#1C1917] rounded-2xl p-4 shadow-[3px_3px_0px_#1C1917]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-black text-[#146B43] uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#146B43]" />
                  <span>DECLASSIFIED CASE DOSSIER:</span>
                </span>
                <span className="text-[10px] font-mono font-bold text-neutral-500">
                  {entryDate}
                </span>
              </div>
              <p className="font-mono text-xs sm:text-sm font-bold text-[#1C1917] leading-relaxed">
                {autopsyData?.causeOfDeath}
              </p>
            </div>

            {/* User Testimonies recorded */}
            {Object.keys(userAnswers).length > 0 && (
              <div className="space-y-2">
                <div className="text-[10px] font-mono font-black text-neutral-600 uppercase tracking-wider">
                  RECORDED TESTIMONY &amp; ROOT TRIGGERS:
                </div>
                <div className="space-y-1.5">
                  {Object.entries(userAnswers).map(([qid, ans], i) => (
                    <div
                      key={qid}
                      className="p-2.5 rounded-xl border-2 border-[#1C1917]/30 bg-[#FAF6ED] font-mono text-xs flex items-center gap-2"
                    >
                      <span className="font-bold text-[#B91C1C]">#{i + 1}:</span>
                      <span className="font-bold text-[#1C1917]">{ans}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Single Paragraph Tactical Countermeasure */}
            <div className="cia-paper-sheet border-2 border-[#1C1917] rounded-2xl p-4 shadow-[3px_3px_0px_#1C1917]">
              <div className="text-[10px] font-mono font-black text-[#146B43] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#146B43]" />
                <span>BINDING RECOVERY PRESCRIPTION:</span>
              </div>
              <p className="font-mono text-xs sm:text-sm font-bold text-[#1C1917] leading-relaxed">
                {solutionParagraph}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-1 mt-auto shrink-0">
              <button
                type="button"
                onClick={() => {
                  setStage('interrogating');
                  soundEngine?.playClick?.();
                }}
                className="flex-1 py-2.5 px-3 bg-[#FAF6ED] hover:bg-[#EAE0CD] border-2 border-[#1C1917] rounded-xl font-mono text-xs font-bold uppercase shadow-[2px_2px_0px_#1C1917] cursor-pointer flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Re-interrogate</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 px-3 bg-[#1C1917] text-[#FAF6ED] hover:bg-neutral-800 border-2 border-[#1C1917] rounded-xl font-mono text-xs font-bold uppercase shadow-[2px_2px_0px_#1C1917] cursor-pointer flex items-center justify-center gap-2"
              >
                <Check className="w-3.5 h-3.5 text-[#FDE047]" />
                <span>Close Case File</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
