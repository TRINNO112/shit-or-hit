import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertOctagon, 
  Activity, 
  Target, 
  Sparkles, 
  Check, 
  X, 
  ShieldAlert, 
  Flame, 
  Zap, 
  ArrowRight, 
  HelpCircle, 
  FileSearch, 
  Stethoscope,
  Crosshair,
  RotateCcw,
  CheckCircle2,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { soundEngine } from '../services/soundEngine';

export function AutopsyBadge({ autopsy, onClick, className = '' }) {
  if (!autopsy) return null;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl border-2 border-black bg-[#FF4D4D] text-white font-mono text-[10px] font-black uppercase shadow-[1.5px_1.5px_0px_#000000] hover:scale-105 active:scale-95 transition-all cursor-pointer ${className}`}
      title="View AI Forensic Autopsy Diagnosis"
    >
      <AlertOctagon className="w-3.5 h-3.5 stroke-[2.5]" />
      <span>CRIME SCENE: AUTOPSY REPORT</span>
    </button>
  );
}

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

  // Fetch AI Autopsy from backend API
  const fetchAutopsyAnalysis = async () => {
    setIsLoading(true);
    setErrorMsg('');
    setStage('scanning');
    soundEngine.playRoughTone();

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

      if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
      }

      const data = await res.json();
      if (data?.success && data?.autopsy) {
        setAutopsyData(data.autopsy);
        setStage('interrogating');
        soundEngine.playSuccessChime();
      } else {
        throw new Error(data?.error || 'Failed to parse autopsy');
      }
    } catch (err) {
      console.warn('Autopsy API failed, falling back to local diagnosis:', err);
      // Fallback local diagnosis
      const fallback = {
        causeOfDeath: 'Acute Executive Breakdown: Frictionless distraction loops severed momentum and derailed morning discipline.',
        questions: [
          {
            id: 'q1',
            question: 'What triggered the primary breakdown of momentum?',
            options: ['Late night screen loop / doomscrolling', 'Procrastination on critical task', 'Emotional exhaustion / interpersonal friction']
          },
          {
            id: 'q2',
            question: 'Did you execute morning non-negotiables before checking notifications?',
            options: ['Skipped completely', 'Partial effort', 'Completed morning anchor, lost afternoon']
          },
          {
            id: 'q3',
            question: 'What is your primary countermeasure for tomorrow morning?',
            options: ['60-minute phone quarantine upon waking', 'Complete hardest milestone before 10:00 AM', 'Zero screens in bed tonight']
          }
        ],
        recoveryAntidote: 'Protocol Reset: 1L cold water upon waking, keep phone in another room for 60 minutes, execute morning anchor before opening browser.'
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
    soundEngine.playClick();
    setUserAnswers(prev => ({
      ...prev,
      [qId]: optionText
    }));
  };

  const handleSaveAndSeal = () => {
    soundEngine.playCapsuleSeal();
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
    soundEngine.playSuccessChime();
  };

  if (!isOpen) return null;

  const questionsList = autopsyData?.questions || [];
  const allQuestionsAnswered = questionsList.length === 0 || questionsList.every(q => !!userAnswers[q.id]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-90 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.94, y: 15 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.94, y: 15 }}
          className="w-full max-w-xl bg-[#FFFDF5] rounded-3xl border-3 border-black p-4 sm:p-6 shadow-[8px_8px_0px_#000000] space-y-4 text-left max-h-[94vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between border-b-2 border-black/10 pb-3 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-[#FF4D4D] border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_#000000]">
                <AlertOctagon className="w-5 h-5 text-white stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display font-black text-lg uppercase leading-none">
                    AI FORENSIC AUTOPSY CHAMBER
                  </h3>
                  <span className="px-1.5 py-0.5 rounded bg-black text-[#FF4D4D] text-[9px] font-mono font-black uppercase border border-black">
                    CRIME SCENE
                  </span>
                </div>
                <span className="text-xs font-mono text-neutral-600">
                  Coroner's Investigation for {entryDate} ({rating}★ Rough)
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 border-2 border-black cursor-pointer shadow-[1.5px_1.5px_0px_#000000] active:scale-95"
            >
              <X className="w-4 h-4 text-black stroke-[2.5]" />
            </button>
          </div>

          {/* STAGE 1: SCANNING / LOADING */}
          {stage === 'scanning' && (
            <div className="py-16 text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-[#FF4D4D] border-3 border-black flex items-center justify-center shadow-[4px_4px_0px_#000000] animate-pulse">
                <Crosshair className="w-8 h-8 text-white stroke-[2.5] animate-spin" />
              </div>
              <div className="space-y-1 font-mono">
                <h4 className="font-black text-base uppercase text-black">
                  CORONER AI INVESTIGATING CRIME SCENE...
                </h4>
                <p className="text-xs text-neutral-600 max-w-sm mx-auto">
                  Cross-referencing reflection notes, habit anchors, and behavioral failure points...
                </p>
              </div>
            </div>
          )}

          {/* STAGE 2: INTERROGATION & CAUSE OF DEATH */}
          {stage === 'interrogating' && autopsyData && (
            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {/* Official Cause of Death Box */}
              <div className="p-4 bg-red-50 border-3 border-black rounded-2xl shadow-[3px_3px_0px_#000000] space-y-2">
                <div className="flex items-center gap-2 font-display font-black text-xs uppercase text-[#D90429]">
                  <ShieldAlert className="w-4 h-4 stroke-[2.5]" />
                  <span>OFFICIAL FORENSIC CAUSE OF DEATH</span>
                </div>
                <p className="font-mono font-bold text-xs sm:text-sm text-neutral-900 leading-relaxed">
                  "{autopsyData.causeOfDeath}"
                </p>
              </div>

              {/* Detective Interrogation Questions */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 font-display font-black text-xs uppercase text-neutral-800">
                  <FileSearch className="w-4 h-4 stroke-[2.5]" />
                  <span>DETECTIVE INTERROGATION (SELECT YOUR ANSWERS)</span>
                </div>

                {questionsList.map((q, idx) => (
                  <div key={q.id || idx} className="p-3 bg-white border-2 border-black rounded-2xl shadow-[2px_2px_0px_#000000] space-y-2">
                    <div className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-md bg-black text-white font-mono text-[10px] font-black flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <h5 className="font-mono font-bold text-xs text-black leading-snug">
                        {q.question}
                      </h5>
                    </div>

                    <div className="space-y-1.5 pt-1 pl-7">
                      {(q.options || []).map((opt, oIdx) => {
                        const isSelected = userAnswers[q.id] === opt;
                        return (
                          <button
                            key={oIdx}
                            type="button"
                            onClick={() => handleSelectAnswer(q.id, opt)}
                            className={`w-full p-2 rounded-xl border-2 border-black font-mono text-[11px] text-left transition-all cursor-pointer flex items-center justify-between gap-2 ${
                              isSelected
                                ? 'bg-[#FF4D4D] text-white font-black shadow-[2px_2px_0px_#000000]'
                                : 'bg-[#FFFDF5] text-neutral-800 font-medium hover:bg-neutral-100'
                            }`}
                          >
                            <span>{opt}</span>
                            {isSelected && <Check className="w-4 h-4 stroke-[3] shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Coroner's Recovery Antidote */}
              {autopsyData.recoveryAntidote && (
                <div className="p-4 bg-emerald-50 border-3 border-black rounded-2xl shadow-[3px_3px_0px_#000000] space-y-1.5">
                  <div className="flex items-center gap-2 font-display font-black text-xs uppercase text-emerald-800">
                    <Stethoscope className="w-4 h-4 stroke-[2.5]" />
                    <span>CORONER'S RECOVERY PRESCRIPTION FOR TOMORROW</span>
                  </div>
                  <p className="font-mono font-bold text-xs sm:text-sm text-emerald-950 leading-relaxed">
                    {autopsyData.recoveryAntidote}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-black/10">
                <button
                  type="button"
                  onClick={onClose}
                  className="py-2.5 px-4 bg-neutral-100 hover:bg-neutral-200 text-black font-mono text-xs font-black uppercase rounded-xl border-2 border-black cursor-pointer"
                >
                  DISMISS
                </button>

                <button
                  type="button"
                  onClick={handleSaveAndSeal}
                  className="py-2.5 px-6 bg-[#00E599] hover:bg-emerald-400 text-black font-display font-black text-xs uppercase rounded-xl border-3 border-black shadow-[3px_3px_0px_#000000] active:scale-95 transition-all cursor-pointer flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                  <span>SEAL & SAVE AUTOPSY REPORT</span>
                </button>
              </div>
            </div>
          )}

          {/* STAGE 3: COMPLETED REPORT VIEW */}
          {stage === 'completed' && autopsyData && (
            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {/* Sealed Banner */}
              <div className="p-3 bg-black text-[#00E599] rounded-2xl border-2 border-black flex items-center justify-between gap-3 font-mono text-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#00E599]" />
                  <span className="font-black uppercase">AUTOPSY REPORT SEALED & RECORDED</span>
                </div>
                <button
                  type="button"
                  onClick={fetchAutopsyAnalysis}
                  className="text-[10px] text-neutral-300 hover:text-white underline cursor-pointer"
                >
                  RE-RUN AI
                </button>
              </div>

              {/* Cause of Death */}
              <div className="p-4 bg-red-50 border-3 border-black rounded-2xl shadow-[3px_3px_0px_#000000] space-y-2">
                <div className="flex items-center gap-2 font-display font-black text-xs uppercase text-[#D90429]">
                  <AlertOctagon className="w-4 h-4 stroke-[2.5]" />
                  <span>DIAGNOSED CAUSE OF DEATH</span>
                </div>
                <p className="font-mono font-bold text-xs sm:text-sm text-neutral-900 leading-relaxed">
                  "{autopsyData.causeOfDeath}"
                </p>
              </div>

              {/* User Interrogation Confessions */}
              {questionsList.length > 0 && (
                <div className="space-y-2">
                  <div className="font-display font-black text-xs uppercase text-neutral-800">
                    INTERROGATION RECORD:
                  </div>
                  <div className="space-y-2">
                    {questionsList.map((q, idx) => (
                      <div key={q.id || idx} className="p-3 bg-white border-2 border-black rounded-xl text-xs font-mono">
                        <div className="text-neutral-500 font-bold mb-1">
                          Q{idx + 1}: {q.question}
                        </div>
                        <div className="text-black font-black flex items-center gap-1.5">
                          <ArrowRight className="w-3.5 h-3.5 text-[#FF4D4D]" />
                          <span>{userAnswers[q.id] || 'No answer recorded'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Antidote */}
              {autopsyData.recoveryAntidote && (
                <div className="p-4 bg-emerald-50 border-3 border-black rounded-2xl shadow-[3px_3px_0px_#000000] space-y-1.5">
                  <div className="flex items-center gap-2 font-display font-black text-xs uppercase text-emerald-800">
                    <Stethoscope className="w-4 h-4 stroke-[2.5]" />
                    <span>CORONER'S RECOVERY PRESCRIPTION</span>
                  </div>
                  <p className="font-mono font-bold text-xs sm:text-sm text-emerald-950 leading-relaxed">
                    {autopsyData.recoveryAntidote}
                  </p>
                </div>
              )}

              {/* Footer */}
              <div className="pt-2 flex items-center justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="py-2.5 px-6 bg-black text-white font-display font-black text-xs uppercase rounded-xl border-2 border-black shadow-[2px_2px_0px_#000000] cursor-pointer"
                >
                  CLOSE REPORT
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
