import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HeartHandshake, 
  Send, 
  Mail, 
  User, 
  Sliders, 
  Printer, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ShieldCheck, 
  X, 
  Sparkles, 
  Zap, 
  Activity, 
  Check,
  FileText,
  ChevronRight,
  Info
} from 'lucide-react';
import { 
  getGuardianConfig, 
  saveGuardianConfig, 
  generateGuardianBriefing,
  generateTwoPhaseGuardianBriefing,
  dispatchGuardianSOS,
  getGuardianEmailQuota
} from '../services/api';
import { soundEngine } from '../services/soundEngine';

export default function GuardianContactModal({ 
  isOpen, 
  onClose, 
  entries = {}, 
  todayStr = null, 
  user = null 
}) {
  const [config, setConfig] = useState(() => getGuardianConfig());
  const [briefing, setBriefing] = useState(null);
  const [isDossierModalOpen, setIsDossierModalOpen] = useState(false);
  const [dispatchStatus, setDispatchStatus] = useState('idle'); // 'idle' | 'sending' | 'success' | 'error'
  const [statusMessage, setStatusMessage] = useState('');
  const [quota, setQuota] = useState(() => getGuardianEmailQuota());

  useEffect(() => {
    if (isOpen) {
      const currentConfig = getGuardianConfig();
      setConfig(currentConfig);
      const generated = generateGuardianBriefing(entries, currentConfig, todayStr);
      setBriefing(generated);
      setDispatchStatus('idle');
      setStatusMessage('');
      setQuota(getGuardianEmailQuota());
      setIsDossierModalOpen(false);
    }
  }, [isOpen, entries, todayStr]);

  const handleSaveConfig = (e) => {
    if (e) e.preventDefault();
    try {
      soundEngine.playClick();
      const updated = saveGuardianConfig(config);
      setConfig(updated);
      const regenerated = generateGuardianBriefing(entries, updated, todayStr);
      setBriefing(regenerated);
      setStatusMessage('Guardian protocol settings saved.');
      setTimeout(() => setStatusMessage(''), 3000);
    } catch (err) {
      setStatusMessage('Failed to save protocol.');
    }
  };

  const handleToggleCategory = (categoryKey) => {
    const updatedCategories = {
      ...(config.categories || {}),
      [categoryKey]: !(config.categories?.[categoryKey] ?? true)
    };
    const updatedConfig = { ...config, categories: updatedCategories };
    setConfig(updatedConfig);
    saveGuardianConfig(updatedConfig);
    const regenerated = generateGuardianBriefing(entries, updatedConfig, todayStr);
    setBriefing(regenerated);
  };

  const handleSetSlumpDays = (days) => {
    try { soundEngine.playClick(); } catch (e) {}
    const updatedConfig = { ...config, slumpThresholdDays: days };
    setConfig(updatedConfig);
    saveGuardianConfig(updatedConfig);
    const regenerated = generateGuardianBriefing(entries, updatedConfig, todayStr);
    setBriefing(regenerated);
  };

  const handleEmailDispatch = async (isTest = false) => {
    const currentQuota = getGuardianEmailQuota();
    if (!currentQuota.canSend) {
      setDispatchStatus('error');
      setStatusMessage(`Daily hard cap active (${currentQuota.sentCount}/${currentQuota.maxAllowed} sent). Automated emails locked (${currentQuota.resetInHours}h cooldown).`);
      setTimeout(() => {
        setDispatchStatus('idle');
        setStatusMessage('');
      }, 5000);
      return;
    }

    const targetEmail = (config.guardianEmail || user?.email || '').trim();
    if (!targetEmail) {
      setDispatchStatus('error');
      setStatusMessage('Please enter a target gated email address first.');
      setTimeout(() => {
        setDispatchStatus('idle');
        setStatusMessage('');
      }, 3500);
      return;
    }

    setDispatchStatus('sending');
    setStatusMessage('Executing Two-Phase Gemini AI analysis & approval...');
    try { soundEngine.playClick(); } catch (e) {}

    // Two-Phase Dispatch Mechanism:
    // Phase 1: Gemini analyzes notes & trigger context.
    // Phase 2: If underwhelmed/offline, deterministic hardcoded rule engine seamlessly executes.
    const activeBriefing = await generateTwoPhaseGuardianBriefing(entries, config, todayStr);
    setBriefing(activeBriefing);

    const res = await dispatchGuardianSOS({
      guardianConfig: {
        ...config,
        guardianEmail: targetEmail
      },
      briefing: {
        ...activeBriefing,
        isTest
      },
      user,
      isTest
    });

    const updatedQuota = getGuardianEmailQuota();
    setQuota(updatedQuota);

    if (res.success) {
      setDispatchStatus('success');
      try { soundEngine.playSuccess(); } catch (e) {}
      
      const engineLabel = activeBriefing.engine === 'gemini-cloud' ? 'Two-Phase Gemini AI Approved' : 'Deterministic Hardcoded Rule Engine';
      setStatusMessage(isTest 
        ? `[TEST DISPATCH] Delivered via ${engineLabel} to ${targetEmail} (${updatedQuota.sentCount}/${updatedQuota.maxAllowed} quota used)`
        : `Emergency briefing delivered via ${engineLabel} to ${targetEmail} (${updatedQuota.sentCount}/${updatedQuota.maxAllowed} quota used).`
      );
      setTimeout(() => {
        setDispatchStatus('idle');
        setStatusMessage('');
      }, 5000);
    } else if (res.capReached) {
      setDispatchStatus('error');
      setStatusMessage(res.error || 'Daily hard cap reached (2/2 emails). Rate limit protection active.');
      setTimeout(() => {
        setDispatchStatus('idle');
        setStatusMessage('');
      }, 5000);
    } else {
      setDispatchStatus('error');
      setStatusMessage(res.error || 'Dispatch failed. Ensure Resend API Key is set in server environment or Firestore config.');
      setTimeout(() => {
        setDispatchStatus('idle');
        setStatusMessage('');
      }, 5000);
    }
  };

  const handlePrintDossier = () => {
    try { soundEngine.playClick(); } catch (e) {}
    window.print();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-100 flex items-center justify-center p-2.5 sm:p-4 bg-black/80 backdrop-blur-xs overflow-y-auto select-none"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-2xl bg-[#FFFDF8] border-3 border-black rounded-3xl p-4 sm:p-7 shadow-[6px_6px_0px_#000000] space-y-4 my-auto relative max-h-[92vh] flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b-2 border-black/15 pb-3.5 shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-[#FF4D4D] border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_#000000] shrink-0 text-white">
                <HeartHandshake className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-[9px] font-black uppercase px-2 py-0.5 bg-black text-[#00E599] rounded">
                    GCERT SUBTHEME 1(A)
                  </span>
                  <span className="font-mono text-[9px] font-black uppercase px-2 py-0.5 bg-[#FDC800] border border-black rounded text-black">
                    PARENT EMERGENCY TRIAGE
                  </span>
                </div>
                <h3 className="font-display font-black text-base sm:text-xl uppercase text-black leading-tight truncate mt-0.5">
                  Guardian SOS &amp; Family Triage Protocol
                </h3>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl bg-neutral-100 hover:bg-[#FF4D4D] hover:text-white border-2 border-black shadow-[1.5px_1.5px_0px_#000000] cursor-pointer transition-colors shrink-0"
            >
              <X className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>

          {/* Scrollable Body */}
          <div className="overflow-y-auto flex-1 space-y-4 pr-1">
            {/* Top Section: Guardian Details & Open Dossier Action */}
            <div className="p-4 bg-white border-2 border-black rounded-2xl shadow-[2px_2px_0px_#000000] space-y-3.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-black/10 pb-3">
                <div>
                  <span className="font-mono text-xs font-black uppercase text-black block">
                    Confidential Guardian Contact Gateway
                  </span>
                  <span className="font-mono text-[10px] text-neutral-600 block mt-0.5">
                    Designated recipient for automated zero-device crisis briefings.
                  </span>
                </div>

                {/* Open Dossier in New Dedicated Modal */}
                <button
                  type="button"
                  onClick={() => {
                    try { soundEngine.playClick(); } catch (e) {}
                    setIsDossierModalOpen(true);
                  }}
                  className="py-2 px-3 bg-[#FDC800] hover:bg-yellow-400 text-black border-2 border-black rounded-xl font-mono text-xs font-black uppercase shadow-[2px_2px_0px_#000000] cursor-pointer flex items-center justify-center gap-1.5 shrink-0 active:translate-x-px"
                >
                  <FileText className="w-4 h-4 stroke-[2.5]" />
                  <span>OPEN GUARDIAN DOSSIER</span>
                </button>
              </div>

              {/* Top Input Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-mono text-xs font-black uppercase text-neutral-800 block">
                    Guardian / Parent Name:
                  </label>
                  <input
                    type="text"
                    value={config.guardianName || ''}
                    onChange={(e) => setConfig({ ...config, guardianName: e.target.value })}
                    onBlur={handleSaveConfig}
                    placeholder="e.g. Papa / Mom / Uncle Rajesh"
                    className="w-full px-3 py-2 bg-neutral-50 border-2 border-black rounded-xl font-mono text-xs focus:outline-none focus:ring-2 focus:ring-[#FDC800] text-black"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-mono text-xs font-black uppercase text-neutral-800 block">
                    Gated Alert Email Address:
                  </label>
                  <input
                    type="email"
                    value={config.guardianEmail || ''}
                    onChange={(e) => setConfig({ ...config, guardianEmail: e.target.value })}
                    onBlur={handleSaveConfig}
                    placeholder="parent@example.com"
                    className="w-full px-3 py-2 bg-neutral-50 border-2 border-black rounded-xl font-mono text-xs focus:outline-none focus:ring-2 focus:ring-[#FDC800] text-black"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 font-mono text-[10px] text-neutral-600">
                <span>Silent automated server dispatch via Resend API. Strict 2 emails / 24h hard cap.</span>
                <span className={`px-2 py-0.5 rounded border border-black font-black uppercase ${
                  quota.canSend ? 'bg-[#00E599] text-black' : 'bg-[#FF4D4D] text-white'
                }`}>
                  {quota.canSend ? `QUOTA: ${quota.sentCount}/${quota.maxAllowed} SENT (${quota.remaining} LEFT)` : `HARD CAP REACHED (2/2) • ${quota.resetInHours}H COOLDOWN`}
                </span>
              </div>
            </div>

            {/* The 5 Selectable Trigger Options */}
            <div className="space-y-2.5 p-4 bg-white border-2 border-black rounded-2xl shadow-[2px_2px_0px_#000000]">
              <div className="border-b border-black/15 pb-2">
                <span className="font-mono text-xs font-black uppercase text-black block">
                  Parent Opt-In Alert Triggers (5 Automated Scenarios):
                </span>
                <span className="font-mono text-[10px] text-neutral-600 block mt-0.5">
                  Select any combination. When active, Two-Phase AI and deterministic rule engines continuously monitor diary reflections.
                </span>
              </div>

              {/* Trigger 1: Severe Illness */}
              <label className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-neutral-50 cursor-pointer border border-transparent hover:border-black/15 transition-all">
                <input
                  type="checkbox"
                  checked={config.categories?.severeIllness ?? true}
                  onChange={() => handleToggleCategory('severeIllness')}
                  className="mt-1 w-4 h-4 rounded border-2 border-black text-[#00E599] focus:ring-0 cursor-pointer"
                />
                <div className="min-w-0 flex-1">
                  <span className="font-mono text-xs font-black text-black block">
                    1. Severe Physical Illness / Medical Sickness Alert
                  </span>
                  <span className="font-mono text-[10px] text-neutral-600 block leading-relaxed">
                    Triggers when daily reflections contain clinical distress keywords (fever, infection, hospital, vomiting, clinic, prescription).
                  </span>
                </div>
              </label>

              {/* Trigger 2: Mental Exhaustion */}
              <label className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-neutral-50 cursor-pointer border border-transparent hover:border-black/15 transition-all">
                <input
                  type="checkbox"
                  checked={config.categories?.repeatedBreakdown ?? true}
                  onChange={() => handleToggleCategory('repeatedBreakdown')}
                  className="mt-1 w-4 h-4 rounded border-2 border-black text-[#00E599] focus:ring-0 cursor-pointer"
                />
                <div className="min-w-0 flex-1">
                  <span className="font-mono text-xs font-black text-black block">
                    2. Mental Exhaustion &amp; Acute Academic Distress
                  </span>
                  <span className="font-mono text-[10px] text-neutral-600 block leading-relaxed">
                    Triggers when reflections indicate severe emotional overwhelm, test panic, or feelings of giving up.
                  </span>
                </div>
              </label>

              {/* Trigger 3: Chronic Sleep Deficit */}
              <label className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-neutral-50 cursor-pointer border border-transparent hover:border-black/15 transition-all">
                <input
                  type="checkbox"
                  checked={config.categories?.sleepDeficit ?? true}
                  onChange={() => handleToggleCategory('sleepDeficit')}
                  className="mt-1 w-4 h-4 rounded border-2 border-black text-[#00E599] focus:ring-0 cursor-pointer"
                />
                <div className="min-w-0 flex-1">
                  <span className="font-mono text-xs font-black text-black block">
                    3. Chronic Sleep Deficit &amp; Circadian Collapse
                  </span>
                  <span className="font-mono text-[10px] text-neutral-600 block leading-relaxed">
                    Triggers when persistent late-night study and sleep loss compromise physical and cognitive recovery.
                  </span>
                </div>
              </label>

              {/* Trigger 4: Manual 1-Tap SOS */}
              <label className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-neutral-50 cursor-pointer border border-transparent hover:border-black/15 transition-all">
                <input
                  type="checkbox"
                  checked={config.categories?.manualSos ?? true}
                  onChange={() => handleToggleCategory('manualSos')}
                  className="mt-1 w-4 h-4 rounded border-2 border-black text-[#00E599] focus:ring-0 cursor-pointer"
                />
                <div className="min-w-0 flex-1">
                  <span className="font-mono text-xs font-black text-black block">
                    4. Manual 1-Tap Emergency SOS Dispatch
                  </span>
                  <span className="font-mono text-[10px] text-neutral-600 block leading-relaxed">
                    Enables on-demand, instant emergency briefing dispatch anytime from the student dashboard or settings.
                  </span>
                </div>
              </label>

              {/* Trigger 5: Slump Sensitivity Trigger */}
              <div className="p-2.5 rounded-xl border border-black/15 bg-neutral-50 space-y-2">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.categories?.slumpTrigger ?? true}
                    onChange={() => handleToggleCategory('slumpTrigger')}
                    className="mt-1 w-4 h-4 rounded border-2 border-black text-[#00E599] focus:ring-0 cursor-pointer"
                  />
                  <div className="min-w-0 flex-1">
                    <span className="font-mono text-xs font-black text-black block">
                      5. Persistent Slump Sensitivity Trigger
                    </span>
                    <span className="font-mono text-[10px] text-neutral-600 block leading-relaxed">
                      Automatically alerts when student logs consecutive sub-2★ ratings, signaling compounding academic friction.
                    </span>
                  </div>
                </label>

                {/* Inline Slump Days Selector */}
                {(config.categories?.slumpTrigger ?? true) && (
                  <div className="pt-1.5 pl-7 flex items-center gap-2">
                    <span className="font-mono text-[10px] font-black uppercase text-neutral-600 shrink-0">
                      THRESHOLD:
                    </span>
                    <div className="grid grid-cols-3 gap-2 flex-1 max-w-xs">
                      {[2, 3, 4].map((days) => (
                        <button
                          key={days}
                          type="button"
                          onClick={() => handleSetSlumpDays(days)}
                          className={`py-1 px-2 rounded-lg font-mono text-[10px] font-black border-2 border-black cursor-pointer transition-all ${
                            config.slumpThresholdDays === days
                              ? 'bg-[#FDC800] text-black shadow-[1.5px_1.5px_0px_#000000]'
                              : 'bg-white hover:bg-neutral-100 text-neutral-600'
                          }`}
                        >
                          {days} ROUGH DAYS
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* In-Place Status Feedback */}
            {statusMessage && (
              <div className={`p-3 border-2 border-black rounded-xl font-mono text-xs font-black flex items-center gap-2 ${
                dispatchStatus === 'error'
                  ? 'bg-rose-100 text-rose-950 border-rose-900'
                  : 'bg-emerald-100 text-emerald-950 border-emerald-900'
              }`}>
                {dispatchStatus === 'error' ? (
                  <AlertCircle className="w-4 h-4 stroke-[2.5] shrink-0 text-rose-700" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 stroke-[2.5] shrink-0 text-emerald-700" />
                )}
                <span>{statusMessage}</span>
              </div>
            )}
          </div>

          {/* Action Toolbar */}
          <div className="pt-2 border-t-2 border-black/15 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleSaveConfig}
              className="py-2.5 px-4 bg-neutral-100 hover:bg-neutral-200 text-black border-2 border-black rounded-xl font-mono text-xs font-black uppercase shadow-[2px_2px_0px_#000000] cursor-pointer text-center active:translate-x-px"
            >
              SAVE PROTOCOL
            </button>

            <div className="flex flex-col sm:flex-row items-stretch gap-2 flex-1 sm:justify-end">
              <button
                type="button"
                onClick={() => handleEmailDispatch(false)}
                disabled={dispatchStatus === 'sending' || !quota.canSend}
                title={quota.canSend ? 'Dispatch emergency triage email via Two-Phase AI and Resend' : 'Daily hard cap reached'}
                className={`py-2.5 px-4 border-2 border-black rounded-xl font-mono text-xs font-black uppercase shadow-[2px_2px_0px_#000000] cursor-pointer flex items-center justify-center gap-2 active:translate-x-px ${
                  !quota.canSend
                    ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed border-neutral-400 shadow-none'
                    : 'bg-[#FDC800] hover:bg-yellow-400 text-black'
                }`}
              >
                <Mail className="w-4 h-4 stroke-[2.5]" />
                <span>{dispatchStatus === 'sending' ? 'DISPATCHING...' : 'DISPATCH SOS EMAIL'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleEmailDispatch(true)}
                disabled={dispatchStatus === 'sending' || !quota.canSend}
                title={quota.canSend ? 'Send verification test email to gated address' : 'Daily hard cap reached'}
                className={`py-2.5 px-3 border-2 border-black rounded-xl font-mono text-xs font-black uppercase shadow-[2px_2px_0px_#000000] cursor-pointer flex items-center justify-center gap-1.5 shrink-0 active:translate-x-px ${
                  !quota.canSend
                    ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed border-neutral-400 shadow-none'
                    : 'bg-[#00C2FF] hover:bg-[#00a6db] text-black'
                }`}
              >
                <Send className="w-4 h-4 stroke-[2.5]" />
                <span>TEST EMAIL</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Dedicated Secondary Modal: Full Guardian Health Dossier */}
        <AnimatePresence>
          {isDossierModalOpen && briefing && (
            <div 
              className="fixed inset-0 z-110 flex items-center justify-center p-2.5 sm:p-4 bg-black/85 backdrop-blur-xs overflow-y-auto select-none"
              onClick={() => setIsDossierModalOpen(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-2xl bg-[#FFFDF8] border-3 border-black rounded-3xl p-4 sm:p-7 shadow-[6px_6px_0px_#000000] space-y-4 my-auto relative max-h-[92vh] flex flex-col overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Dossier Header */}
                <div className="flex items-center justify-between border-b-2 border-black/15 pb-3 shrink-0">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-[#FDC800] border-2 border-black flex items-center justify-center shadow-[1.5px_1.5px_0px_#000000] shrink-0 text-black">
                      <FileText className="w-5 h-5 stroke-[2.5]" />
                    </div>
                    <div className="min-w-0">
                      <span className="font-mono text-[9px] font-black uppercase px-2 py-0.5 bg-black text-[#00E599] rounded">
                        CONFIDENTIAL HEALTH DOSSIER
                      </span>
                      <h4 className="font-display font-black text-base sm:text-lg uppercase text-black truncate mt-0.5">
                        {briefing.headline}
                      </h4>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsDossierModalOpen(false)}
                    className="p-1.5 rounded-xl bg-neutral-100 hover:bg-[#FF4D4D] hover:text-white border-2 border-black shadow-[1.5px_1.5px_0px_#000000] cursor-pointer transition-colors shrink-0"
                  >
                    <X className="w-4 h-4 stroke-[2.5]" />
                  </button>
                </div>

                {/* Dossier Content Body */}
                <div className="overflow-y-auto flex-1 space-y-3.5 pr-1">
                  {/* Category Status Banner */}
                  <div className={`p-3 rounded-2xl border-2 border-black shadow-[2px_2px_0px_#000000] flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                    briefing.category === 'SEVERE_ILLNESS'
                      ? 'bg-rose-100 text-rose-950 border-rose-900'
                      : briefing.category === 'REPEATED_BREAKDOWN'
                      ? 'bg-red-50 text-red-950'
                      : briefing.category === 'SLEEP_DEFICIT'
                      ? 'bg-amber-50 text-amber-950'
                      : briefing.category === 'SLUMP_TRIGGER'
                      ? 'bg-yellow-100 text-yellow-950 border-yellow-900'
                      : 'bg-emerald-50 text-emerald-950'
                  }`}>
                    <div className="flex items-center gap-2 min-w-0">
                      <Activity className="w-4 h-4 stroke-[2.5] shrink-0" />
                      <span className="font-mono font-black text-xs uppercase truncate">
                        {briefing.categoryLabel || briefing.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-mono text-[10px] font-black px-2 py-0.5 bg-black text-white rounded">
                        AVG SCORE: {briefing.avgScore}/5.0
                      </span>
                    </div>
                  </div>

                  {/* Addressee Info */}
                  <div className="p-3 bg-white border-2 border-black rounded-xl font-mono text-xs text-neutral-800 space-y-1 shadow-[1.5px_1.5px_0px_#000000]">
                    <div className="font-black uppercase text-black">
                      {briefing.salutation || 'Dear Guardian / Parent'},
                    </div>
                    <p className="text-[11px] text-neutral-600 leading-relaxed">
                      Generated under the GCERT RBVP Adolescent Wellness Framework. This dossier provides factual telemetry insights to assist compassionate home recovery.
                    </p>
                  </div>

                  {/* Clinical Observations */}
                  <div className="space-y-1.5 p-3.5 bg-white border-2 border-black rounded-2xl shadow-[2px_2px_0px_#000000]">
                    <span className="font-mono text-xs font-black uppercase text-black block border-b border-black/15 pb-1.5">
                      Diagnostic Observations:
                    </span>
                    <ul className="space-y-1.5 pt-1">
                      {(briefing.observations || []).map((obs, idx) => (
                        <li key={idx} className="font-mono text-xs text-neutral-800 flex items-start gap-2 leading-relaxed">
                          <span className="font-black text-[#FF4D4D]">•</span>
                          <span>{obs}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Suggested Restorative Actions */}
                  <div className="space-y-1.5 p-3.5 bg-emerald-50 border-2 border-black rounded-2xl shadow-[2px_2px_0px_#000000]">
                    <span className="font-mono text-xs font-black uppercase text-emerald-950 block border-b border-black/15 pb-1.5">
                      Recommended Restorative Support:
                    </span>
                    <ol className="space-y-1.5 pt-1">
                      {(briefing.suggestedActions || []).map((action, idx) => (
                        <li key={idx} className="font-mono text-xs text-emerald-950 flex items-start gap-2 leading-relaxed">
                          <span className="font-black bg-emerald-200 border border-black rounded-md px-1.5 py-0.5 text-[10px] shrink-0">
                            {idx + 1}
                          </span>
                          <span>{action}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>

                {/* Dossier Footer Toolbar */}
                <div className="pt-2 border-t-2 border-black/15 flex items-center justify-between gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handlePrintDossier}
                    className="py-2.5 px-4 bg-white hover:bg-neutral-100 text-black border-2 border-black rounded-xl font-mono text-xs font-black uppercase shadow-[2px_2px_0px_#000000] cursor-pointer flex items-center gap-1.5"
                  >
                    <Printer className="w-4 h-4 stroke-[2.5]" />
                    <span>PRINT DOSSIER</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsDossierModalOpen(false)}
                    className="py-2.5 px-4 bg-black text-[#00E599] border-2 border-black rounded-xl font-mono text-xs font-black uppercase shadow-[2px_2px_0px_#000000] cursor-pointer hover:bg-neutral-900 active:translate-x-px"
                  >
                    CLOSE DOSSIER
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </AnimatePresence>
  );
}
