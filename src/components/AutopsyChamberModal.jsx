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
  FolderLock,
  ChevronRight,
  ShieldCheck,
  Crosshair,
  AlertTriangle,
  AlertCircle,
  RotateCw,
  Skull,
  ShieldAlert,
  Radio
} from 'lucide-react';
import { soundEngine } from '../services/soundEngine';
import { AutopsyBadge } from './AutopsyBadge';
import { getAutopsyAnalysis, generateLocalAutopsy } from '../services/autopsyIntelligence';
import { formatAiErrorMessage } from '../services/api';

// Re-export for seamless backward compatibility
export { AutopsyBadge };

/* ------------------------------------------------------------------------
   Distressed Top Secret / Declassified Rubber Ink Stamp
------------------------------------------------------------------------- */
function TopSecretStamp({ text = "DAY STATUS: CRITICALLY SCREWED", isDeclassified = false }) {
  const color = isDeclassified ? '#00A86B' : '#D92D20';
  const bg = isDeclassified ? '#E8F8F0' : '#FFF0F0';
  const label = isDeclassified ? 'DECLASSIFIED // ANTIDOTE COMMITTED' : text;

  return (
    <div className="inline-block select-none" style={{ transform: 'rotate(-2.5deg)' }}>
      <div
        className="px-2.5 sm:px-3 py-1 border-3 border-dashed font-mono font-black text-[10px] sm:text-xs tracking-widest uppercase rounded-md shadow-[2px_2px_0px_#000000] flex items-center gap-1.5"
        style={{ color, borderColor: color, backgroundColor: bg }}
      >
        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
        <span>{label}</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------------
   Main Modal: Forensic Autopsy Chamber & Inquest Dossier (Light Neobrutalism)
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
  // States: 'scanning' | 'interrogating' | 'completed' | 'failed'
  const [stage, setStage] = useState(existingAutopsy ? 'completed' : 'scanning');
  const [autopsyData, setAutopsyData] = useState(existingAutopsy || null);
  const [userAnswers, setUserAnswers] = useState(existingAutopsy?.userAnswers || {});
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Fetch AI or On-Device Heuristic Forensic Autopsy
  const fetchAutopsyAnalysis = async () => {
    setIsLoading(true);
    setErrorMsg('');
    setStage('scanning');
    try { soundEngine?.playRoughTone?.(); } catch (e) { }

    try {
      const res = await getAutopsyAnalysis({
        date: entryDate,
        rating: Number(rating) || 1,
        notes: notes || '',
        spheres: spheres || {},
        anchors: anchors || {},
        isWhitelisted: typeof window !== 'undefined' && !!window.__USER_IS_WHITELISTED__
      });

      if (res?.success && res?.autopsy) {
        setAutopsyData(res.autopsy);
        setStage('interrogating');
        try { soundEngine?.playSuccessChime?.(); } catch (e) { }
      } else {
        throw new Error('Could not parse autopsy response');
      }
    } catch (err) {
      console.warn('Autopsy retrieval exception:', err);
      setErrorMsg(formatAiErrorMessage(err, 'autopsy'));
      setStage('failed');
      try { soundEngine?.playRoughTone?.(); } catch (e) { }
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
    try { soundEngine?.playClick?.(); } catch (e) { }
    setUserAnswers(prev => ({
      ...prev,
      [qId]: optionText
    }));
  };

  const handleSaveAndSeal = () => {
    try { soundEngine?.playCapsuleSeal?.(); } catch (e) { }
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
    try { soundEngine?.playSuccessChime?.(); } catch (e) { }
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
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-85 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2.5 sm:p-5 overflow-y-auto select-none"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.94, y: 15, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.94, y: 15, opacity: 0 }}
            transition={{ type: 'spring', damping: 26, stiffness: 380 }}
            className="w-full max-w-2xl bg-[#FFFDF5] rounded-3xl border-4 border-black shadow-[10px_10px_0px_#000000] p-4 sm:p-7 text-left max-h-[94vh] flex flex-col relative overflow-hidden text-black"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Hazard Caution Tape Banner */}
            <div className="absolute top-0 left-0 right-0 h-3 bg-[repeating-linear-gradient(45deg,#000_0,#000_12px,#FDC800_12px,#FDC800_24px)] shrink-0 border-b-2 border-black" />

            {/* Dossier Header & Classification Row */}
            <div className="pt-2.5 flex items-center justify-between border-b-2 border-black/15 pb-3.5 shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#FF4D4D] border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_#000000] text-black shrink-0">
                  <Skull className="w-6 h-6 stroke-[2.5]" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-[9px] font-black uppercase px-2 py-0.5 bg-black text-[#FF4D4D] rounded">
                      FORENSIC INQUEST
                    </span>
                    <span className="font-mono text-[9px] font-black uppercase px-2 py-0.5 bg-[#FDC800] border border-black rounded text-black">
                      INCIDENT CASE #{entryDate.replace(/-/g, '')}
                    </span>
                    <span className="font-mono text-[9px] font-black uppercase px-2 py-0.5 bg-[#FF4D4D] text-black border border-black rounded">
                      {rating}★ MELTDOWN
                    </span>
                  </div>
                  <h2 className="font-display font-black text-base sm:text-xl uppercase tracking-tight text-black leading-tight mt-0.5 truncate">
                    CRIME SCENE AUTOPSY CHAMBER
                  </h2>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <TopSecretStamp isDeclassified={stage === 'completed'} />
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 sm:p-2 rounded-xl bg-white hover:bg-[#FF4D4D] hover:text-white border-2 border-black text-black cursor-pointer shadow-[2px_2px_0px_#000000] active:translate-x-px active:translate-y-px transition-colors shrink-0"
                  aria-label="Close"
                >
                  <X className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>
            </div>

            {/* Vital Signs / Flatline Telemetry Ticker */}
            <div className="mt-3 px-3 py-1.5 rounded-xl bg-[#FFF0F0] border-2 border-black flex items-center justify-between text-[10px] font-mono shadow-[2px_2px_0px_#000000] shrink-0">
              <div className="flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-red-600 animate-pulse stroke-[2.5]" />
                <span className="text-red-700 font-black uppercase tracking-wider">
                  VITAL SIGNS: FLATLINE (0% MOMENTUM)
                </span>
              </div>
              <span className="text-neutral-700 font-bold hidden sm:inline">
                DOWNWARD SLUMP CIRCUIT DETECTED
              </span>
            </div>

            {/* STAGE 1: SCANNING / FORENSIC INVESTIGATION */}
            {stage === 'scanning' && (
              <div className="flex-1 py-14 flex flex-col items-center justify-center text-center space-y-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-3xl bg-black border-3 border-black flex items-center justify-center shadow-[4px_4px_0px_#FF4D4D] animate-pulse">
                    <Crosshair className="w-8 h-8 text-[#FF4D4D] stroke-[2.5]" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#00E599] border-2 border-black animate-ping" />
                </div>
                <div className="space-y-1 max-w-sm">
                  <h4 className="font-mono font-black text-sm uppercase text-black tracking-wide">
                    CONDUCTING FORENSIC BALLISTICS SCAN...
                  </h4>
                  <p className="font-mono text-xs text-neutral-600 leading-relaxed">
                    Deconstructing diary notes, circadian rhythm breaches, and collapsed habit anchors.
                  </p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-100 border-2 border-black font-mono text-[10px] font-bold text-neutral-800">
                  <div className="w-2 h-2 rounded-full bg-[#FF4D4D] animate-pulse" />
                  <span>AI CORONER DECOMPOSING INCIDENT DATA</span>
                </div>
              </div>
            )}

            {/* STAGE: FAILED / OFFLINE ERROR STATE */}
            {stage === 'failed' && (
              <div className="flex-1 py-10 flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-[#FF4D4D] border-3 border-black flex items-center justify-center shadow-[3px_3px_0px_#000000] text-black">
                  <AlertCircle className="w-7 h-7 stroke-[2.5]" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-mono font-black text-base uppercase text-black">
                    Forensic Inquest Evaluation Failed
                  </h4>
                  <p className="font-mono text-xs text-neutral-700 max-w-sm mx-auto leading-relaxed">
                    {errorMsg || 'AI servers are temporarily unreachable. You can retry or execute the offline forensic heuristic.'}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-2 pt-2 w-full max-w-xs">
                  <button
                    type="button"
                    onClick={fetchAutopsyAnalysis}
                    className="w-full sm:flex-1 py-2.5 px-3 bg-[#FDC800] hover:bg-yellow-400 text-black border-2 border-black rounded-xl font-mono text-xs font-black uppercase shadow-[2px_2px_0px_#000000] active:translate-x-px active:translate-y-px flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <RotateCw className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Retry Inquest</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const fallback = generateLocalAutopsy({ notes, rating, spheres, anchors, date: entryDate });
                      if (fallback) {
                        setAutopsyData({ ...fallback, engine: 'OFFLINE HEURISTIC' });
                        setStage('interrogating');
                      }
                    }}
                    className="w-full sm:flex-1 py-2.5 px-3 bg-white hover:bg-neutral-100 text-black border-2 border-black rounded-xl font-mono text-xs font-black uppercase shadow-[2px_2px_0px_#000000] active:translate-x-px active:translate-y-px cursor-pointer"
                  >
                    Offline Diagnostic
                  </button>
                </div>
              </div>
            )}

            {/* STAGE 2: VISCERAL INTERROGATION INQUEST */}
            {stage === 'interrogating' && (
              <div className="flex-1 overflow-y-auto space-y-4 pr-1 mt-3 min-h-0 text-black">

                {/* Visual Evidence Toe-Tag */}
                <div className="relative bg-white border-2 border-dashed border-red-400 rounded-2xl p-3.5 sm:p-4 text-xs font-mono space-y-2 shadow-[2px_2px_0px_#000000]">
                  <div className="absolute top-3 right-3 w-4 h-4 rounded-full bg-[#FFFDF5] border-2 border-red-500 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  </div>
                  <div className="flex items-center gap-2 text-red-600 font-black uppercase text-[11px] tracking-wider">
                    <FileSearch className="w-4 h-4 shrink-0" />
                    <span>MORTALITY EVIDENCE TOE-TAG • CASE #{entryDate.replace(/-/g, '')}</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-black/10 text-[10px] font-mono">
                    <div>
                      <span className="text-neutral-500 block uppercase">TIME OF DEATH</span>
                      <span className="text-black font-black">{entryDate} (CURFEW)</span>
                    </div>
                    <div>
                      <span className="text-neutral-500 block uppercase">FAILURE LEVEL</span>
                      <span className="text-red-600 font-black uppercase">{rating}★ CATASTROPHIC</span>
                    </div>
                    <div>
                      <span className="text-neutral-500 block uppercase">ANCHORS MISSED</span>
                      <span className="text-amber-800 font-black">
                        {Object.values(anchors).filter(v => !v).length || 'CRITICAL DEFICIT'}
                      </span>
                    </div>
                    <div>
                      <span className="text-neutral-500 block uppercase">STATUS</span>
                      <span className="text-red-600 font-black uppercase">SCREWED</span>
                    </div>
                  </div>
                </div>

                {/* Trauma Diagnosis Card (Cause of Failure) */}
                <div className="bg-[#FFEBEB] border-3 border-black rounded-2xl p-4 shadow-[4px_4px_0px_#FF4D4D] space-y-2">
                  <div className="flex items-center justify-between border-b border-black/15 pb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded-lg bg-black text-[#FF4D4D]">
                        <AlertOctagon className="w-4 h-4 stroke-[2.5]" />
                      </div>
                      <span className="font-mono text-xs font-black uppercase text-black">
                        CORONER PRIMARY CAUSE OF DEATH
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-[#FF4D4D] text-black font-mono text-[9px] font-black uppercase border border-black">
                      CRITICAL FAILURE
                    </span>
                  </div>

                  <p className="font-mono text-xs sm:text-sm font-black text-black leading-relaxed">
                    {autopsyData?.causeOfDeath}
                  </p>
                </div>

                {/* The 3 Interrogation Exhibits */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Crosshair className="w-4 h-4 text-red-600 stroke-[2.5]" />
                      <span className="font-mono text-xs font-black uppercase text-black">
                        MANDATORY INQUEST EXHIBITS ({Object.keys(userAnswers).length}/{questionsList.length} ANSWERED)
                      </span>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-neutral-600">
                      EXHIBIT A-C
                    </span>
                  </div>

                  {questionsList.map((q, idx) => {
                    const hasAnswered = !!userAnswers[q.id];
                    return (
                      <div
                        key={q.id}
                        className={`border-2 border-black rounded-2xl p-3.5 sm:p-4 shadow-[3px_3px_0px_#000000] transition-colors space-y-2.5 ${hasAnswered
                            ? 'bg-[#F0FDF4] border-black'
                            : 'bg-white'
                          }`}
                      >
                        <div className="font-mono text-xs sm:text-sm font-black text-black flex items-start gap-2">
                          <span className={`w-5 h-5 rounded-md border border-black text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5 ${hasAnswered
                              ? 'bg-[#00E599] text-black'
                              : 'bg-black text-white'
                            }`}>
                            {idx + 1}
                          </span>
                          <span className="leading-snug">{q.question}</span>
                        </div>

                        <div className="space-y-1.5 pl-7">
                          {q.options.map((opt, optIdx) => {
                            const isSelected = userAnswers[q.id] === opt;
                            return (
                              <button
                                key={optIdx}
                                type="button"
                                onClick={() => handleSelectAnswer(q.id, opt)}
                                className={`w-full text-left p-2.5 rounded-xl border-2 font-mono text-[11px] sm:text-xs transition-all cursor-pointer flex items-center justify-between gap-2 active:translate-x-px ${isSelected
                                    ? 'bg-[#FFE66D] text-black border-black shadow-[3px_3px_0px_#000000] font-black'
                                    : 'bg-[#FFFDF8] text-neutral-800 border-black/30 hover:border-black hover:bg-neutral-50 shadow-[1.5px_1.5px_0px_#000000]'
                                  }`}
                              >
                                <span className="leading-snug">{opt}</span>
                                {isSelected && <Check className="w-4 h-4 text-black shrink-0 stroke-3" />}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Tactical Resuscitation Antidote Prescription */}
                <div className="bg-[#E8F8F0] border-3 border-black rounded-2xl p-4 shadow-[4px_4px_0px_#00E599] space-y-2">
                  <div className="flex items-center justify-between border-b border-black/15 pb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded-lg bg-[#00E599] text-black border border-black">
                        <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
                      </div>
                      <span className="font-mono text-xs font-black uppercase text-emerald-950">
                        CORONER BINDING RESUSCITATION ORDER (FOR TOMORROW)
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-[#00E599] text-black font-mono text-[9px] font-black uppercase border border-black">
                      BINDING
                    </span>
                  </div>

                  <p className="font-mono text-xs sm:text-sm font-black text-emerald-950 leading-relaxed">
                    {solutionParagraph}
                  </p>
                </div>

                {/* Seal Action Button */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={handleSaveAndSeal}
                    disabled={!allQuestionsAnswered}
                    className="w-full py-3.5 px-4 enabled:bg-[#FF4D4D] enabled:hover:bg-red-500 disabled:bg-neutral-200 enabled:text-black disabled:text-neutral-400 font-mono font-black text-xs sm:text-sm uppercase tracking-wider rounded-2xl border-3 border-black shadow-[4px_4px_0px_#000000] enabled:active:translate-x-1 enabled:active:translate-y-1 transition-all flex items-center justify-center gap-2 enabled:cursor-pointer disabled:cursor-not-allowed"
                  >
                    <FolderLock className="w-4 h-4 stroke-[2.5]" />
                    <span>
                      {allQuestionsAnswered ? 'SEAL AUTOPSY DOSSIER & COMMIT RESUSCITATION' : 'ANSWER ALL INQUEST QUESTIONS TO SEAL'}
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* STAGE 3: COMPLETED / DECLASSIFIED CASE RECORD */}
            {stage === 'completed' && (
              <div className="flex-1 overflow-y-auto space-y-4 pr-1 mt-3 min-h-0 flex flex-col text-black">
                {/* Declassified Hero Card */}
                <div className="bg-white border-3 border-black rounded-2xl p-4 shadow-[4px_4px_0px_#00E599] space-y-2">
                  <div className="flex items-center justify-between border-b border-black/15 pb-2">
                    <span className="font-mono text-xs font-black uppercase text-emerald-900 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 stroke-[2.5] text-[#00A86B]" />
                      <span>DECLASSIFIED POST-MORTEM VERDICT</span>
                    </span>
                    <span className="font-mono text-[10px] font-bold text-neutral-600">
                      INCIDENT DATE: {entryDate}
                    </span>
                  </div>
                  <p className="font-mono text-xs sm:text-sm font-black text-black leading-relaxed">
                    {autopsyData?.causeOfDeath}
                  </p>
                </div>

                {/* Recorded Testimony Grid */}
                {Object.keys(userAnswers).length > 0 && (
                  <div className="space-y-2">
                    <span className="font-mono text-xs font-black text-black uppercase tracking-wider block">
                      RECORDED INQUEST TESTIMONIES &amp; ROOT TRIGGERS:
                    </span>
                    <div className="space-y-2">
                      {Object.entries(userAnswers).map(([qid, ans], i) => (
                        <div
                          key={qid}
                          className="p-3 rounded-xl border-2 border-black bg-white shadow-[2px_2px_0px_#000000] font-mono text-xs flex items-center gap-2.5"
                        >
                          <span className="w-5 h-5 rounded-md bg-[#FDC800] text-black border border-black text-[10px] font-black flex items-center justify-center shrink-0">
                            #{i + 1}
                          </span>
                          <span className="font-black text-black leading-snug">{ans}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Committed Antidote */}
                <div className="bg-[#E8F8F0] border-3 border-black rounded-2xl p-4 shadow-[4px_4px_0px_#000000] space-y-2">
                  <span className="font-mono text-xs font-black uppercase text-emerald-950 flex items-center gap-1.5 border-b border-black/15 pb-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#00A86B] stroke-[2.5]" />
                    <span>COMMITTED RESUSCITATION PROTOCOL:</span>
                  </span>
                  <p className="font-mono text-xs sm:text-sm font-black text-emerald-950 leading-relaxed">
                    {solutionParagraph}
                  </p>
                </div>

                {/* Footer Actions */}
                <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2 mt-auto shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setStage('interrogating');
                      try { soundEngine?.playClick?.(); } catch (e) { }
                    }}
                    className="w-full sm:flex-1 py-3 px-4 bg-white hover:bg-neutral-100 text-black border-2 border-black rounded-xl font-mono text-xs font-black uppercase shadow-[2px_2px_0px_#000000] cursor-pointer flex items-center justify-center gap-2 active:translate-x-px"
                  >
                    <RotateCcw className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Re-Open Inquest</span>
                  </button>

                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full sm:flex-1 py-3 px-4 bg-[#00E599] text-black hover:bg-emerald-400 border-2 border-black rounded-xl font-mono text-xs font-black uppercase shadow-[2px_2px_0px_#000000] cursor-pointer flex items-center justify-center gap-2 active:translate-x-px"
                  >
                    <Check className="w-3.5 h-3.5 stroke-3" />
                    <span>Close Case File</span>
                  </button>
                </div>
              </div>
            )}

            {/* Bottom Hazard Tape Accent */}
            <div className="absolute bottom-0 left-0 right-0 h-2 bg-[repeating-linear-gradient(45deg,#000_0,#000_10px,#FF4D4D_10px,#FF4D4D_20px)] border-t border-black pointer-events-none" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
