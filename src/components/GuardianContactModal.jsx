import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HeartHandshake, 
  Send, 
  Phone, 
  Mail, 
  User, 
  Sliders, 
  Printer, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ShieldCheck, 
  X, 
  MessageSquare,
  Sparkles,
  Zap,
  Activity,
  Check
} from 'lucide-react';
import { 
  getGuardianConfig, 
  saveGuardianConfig, 
  generateGuardianBriefing, 
  dispatchGuardianSOS 
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
  const [activeTab, setActiveTab] = useState('briefing'); // 'briefing' | 'configure'
  const [briefing, setBriefing] = useState(null);
  const [dispatchStatus, setDispatchStatus] = useState(null); // 'idle' | 'sending' | 'success' | 'error'
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      const currentConfig = getGuardianConfig();
      setConfig(currentConfig);
      const generated = generateGuardianBriefing(entries, currentConfig, todayStr);
      setBriefing(generated);
      setDispatchStatus('idle');
      setStatusMessage('');
    }
  }, [isOpen, entries, todayStr]);

  const handleSaveConfig = (e) => {
    e.preventDefault();
    try {
      soundEngine.playClick();
      const updated = saveGuardianConfig(config);
      setConfig(updated);
      const regenerated = generateGuardianBriefing(entries, updated, todayStr);
      setBriefing(regenerated);
      setStatusMessage('Guardian contact settings saved successfully.');
      setTimeout(() => setStatusMessage(''), 3000);
    } catch (err) {
      setStatusMessage('Failed to save settings.');
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

  const handleWhatsAppDispatch = () => {
    if (!briefing) return;
    try { soundEngine.playClick(); } catch (e) {}

    const text = `*${briefing.headline.toUpperCase()}*\n\n` +
      `${briefing.salutation},\n\n` +
      `*Observations:*\n` +
      briefing.observations.map(o => `• ${o}`).join('\n') +
      `\n\n*Suggested Support:*\n` +
      briefing.suggestedActions.map((a, i) => `${i + 1}. ${a}`).join('\n') +
      `\n\n_Generated via Daily Verdict Guardian SOS (GCERT Science Track)_`;

    const cleanPhone = (config.guardianPhone || '').replace(/[^0-9]/g, '');
    const url = cleanPhone 
      ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`
      : `https://wa.me/?text=${encodeURIComponent(text)}`;

    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleEmailDispatch = async (isTest = false) => {
    if (!briefing) return;
    setDispatchStatus('sending');
    try { soundEngine.playClick(); } catch (e) {}

    const targetEmail = config.guardianEmail || user?.email;
    const res = await dispatchGuardianSOS({
      guardianConfig: {
        ...config,
        guardianEmail: targetEmail
      },
      briefing: {
        ...briefing,
        isTest
      },
      user
    });

    if (res.success) {
      setDispatchStatus('success');
      try { soundEngine.playSuccess(); } catch (e) {}
      
      // Also open local mail client as instant zero-setup fallback
      if (targetEmail) {
        const subject = encodeURIComponent(`[Daily Verdict Triage] ${isTest ? '[TEST DISPATCH] ' : ''}${briefing.headline}`);
        const body = encodeURIComponent(
          `${briefing.salutation},\n\n` +
          `${isTest ? '*** THIS IS A VERIFICATION TEST DISPATCH ***\n\n' : ''}` +
          `Category: ${briefing.categoryLabel || briefing.category}\n` +
          (briefing.detectedKeywords?.length ? `Detected Indicators: ${briefing.detectedKeywords.join(', ')}\n\n` : '\n') +
          `Observations:\n` +
          briefing.observations.map(o => `- ${o}`).join('\n') +
          `\n\nSuggested Restorative Actions:\n` +
          briefing.suggestedActions.map((a, i) => `${i + 1}. ${a}`).join('\n') +
          `\n\nGenerated with zero-knowledge privacy protection (GCERT RBVP 2026-27).`
        );
        window.location.href = `mailto:${targetEmail}?subject=${subject}&body=${body}`;
      }
      setStatusMessage(isTest ? `Test dispatch sent to ${targetEmail}` : 'Emergency briefing dispatched.');
      setTimeout(() => {
        setDispatchStatus('idle');
        setStatusMessage('');
      }, 4000);
    } else {
      setDispatchStatus('error');
      setTimeout(() => setDispatchStatus('idle'), 4000);
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
                  <span className="font-mono text-[9px] font-black uppercase px-2 py-0.5 bg-[#FDC800] border border-black rounded">
                    PARENT EMERGENCY TRIAGE
                  </span>
                </div>
                <h3 className="font-display font-black text-base sm:text-xl uppercase text-black leading-tight truncate mt-0.5">
                  Guardian SOS &amp; Family Triage
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

          {/* Sub-Tab Navigation */}
          <div className="flex items-center gap-2 p-1.5 bg-neutral-100 border-2 border-black rounded-2xl shrink-0">
            <button
              type="button"
              onClick={() => { soundEngine.playClick(); setActiveTab('briefing'); }}
              className={`flex-1 py-1.5 px-3 rounded-xl font-mono text-xs font-black uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'briefing'
                  ? 'bg-[#FDC800] text-black border-2 border-black shadow-[1.5px_1.5px_0px_#000000]'
                  : 'text-neutral-600 hover:text-black'
              }`}
            >
              <HeartHandshake className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>LIVE BRIEFING</span>
            </button>
            <button
              type="button"
              onClick={() => { soundEngine.playClick(); setActiveTab('configure'); }}
              className={`flex-1 py-1.5 px-3 rounded-xl font-mono text-xs font-black uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'configure'
                  ? 'bg-[#00E599] text-black border-2 border-black shadow-[1.5px_1.5px_0px_#000000]'
                  : 'text-neutral-600 hover:text-black'
              }`}
            >
              <Sliders className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>OPT-IN CATEGORIES &amp; CONTACTS</span>
            </button>
          </div>

          {/* Content Body */}
          <div className="overflow-y-auto flex-1 space-y-4 pr-1">
            {activeTab === 'briefing' && briefing && (
              <div className="space-y-4">
                {/* Active Category Indicator Banner */}
                <div className={`p-3 rounded-2xl border-2 border-black shadow-[2px_2px_0px_#000000] flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                  briefing.category === 'SEVERE_ILLNESS'
                    ? 'bg-rose-100 text-rose-950 border-rose-900'
                    : briefing.category === 'REPEATED_BREAKDOWN'
                    ? 'bg-red-50 text-red-950'
                    : briefing.category === 'SLEEP_DEFICIT'
                    ? 'bg-amber-50 text-amber-950'
                    : 'bg-emerald-50 text-emerald-950'
                }`}>
                  <div className="flex items-center gap-2 min-w-0">
                    <Activity className="w-4 h-4 stroke-[2.5] shrink-0" />
                    <span className="font-mono font-black text-xs uppercase truncate">
                      {briefing.category === 'SEVERE_ILLNESS' && 'EMERGENCY: SEVERE ILLNESS / MEDICAL NOTICE'}
                      {briefing.category === 'REPEATED_BREAKDOWN' && `ACUTE SLUMP: ${briefing.lowDayStreak} CONSECUTIVE SUB-2★ DAYS`}
                      {briefing.category === 'SLEEP_DEFICIT' && 'ADVISORY: CRITICAL SLEEP DEFICIT'}
                      {briefing.category === 'EQUILIBRIUM_CHECKIN' && 'SYSTEM STABLE: NORMAL ROLLING VELOCITY'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-mono text-[10px] font-black px-2 py-0.5 bg-black text-white rounded">
                      AVG: {briefing.avgScore}/5.0
                    </span>
                  </div>
                </div>

                {/* Detected Keywords Tag Strip */}
                {briefing.detectedKeywords?.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap p-2 bg-[#FFFDF5] border border-black/20 rounded-xl">
                    <span className="font-mono text-[10px] font-black text-neutral-600 uppercase">
                      AI SPOTTED MARKERS:
                    </span>
                    {briefing.detectedKeywords.map((kw, i) => (
                      <span key={i} className="px-2 py-0.5 bg-black text-[#00E599] font-mono font-black text-[10px] uppercase rounded">
                        "{kw}"
                      </span>
                    ))}
                  </div>
                )}

                {/* Briefing Letter Preview Box */}
                <div className="p-4 sm:p-5 bg-white border-2 border-black rounded-2xl shadow-[3px_3px_0px_#000000] space-y-3.5">
                  <div className="border-b border-black/15 pb-2.5 flex items-center justify-between gap-2 flex-wrap">
                    <div>
                      <span className="font-mono text-[10px] font-black text-neutral-500 uppercase block">
                        OFFICIAL DIGNIFIED DISPATCH DRAFT
                      </span>
                      <h4 className="font-display font-black text-sm sm:text-base uppercase text-black mt-0.5">
                        {briefing.headline}
                      </h4>
                    </div>
                    <span className="px-2 py-0.5 bg-[#FDC800] border border-black font-mono font-black text-[10px] uppercase rounded">
                      {briefing.categoryLabel || briefing.category}
                    </span>
                  </div>

                  <p className="font-mono text-xs font-bold text-neutral-800">
                    {briefing.salutation},
                  </p>

                  <div className="space-y-1.5">
                    <span className="font-mono text-[10px] font-black text-neutral-500 uppercase block">
                      Empirical Telemetry Observations:
                    </span>
                    {briefing.observations.map((obs, idx) => (
                      <p key={idx} className="font-mono text-xs text-neutral-800 leading-relaxed pl-2 border-l-2 border-black/30">
                        {obs}
                      </p>
                    ))}
                  </div>

                  <div className="space-y-2 pt-2 border-t border-black/10">
                    <span className="font-mono text-[10px] font-black text-neutral-600 uppercase block">
                      Recommended Constructive Support:
                    </span>
                    {briefing.suggestedActions.map((act, idx) => (
                      <div key={idx} className="flex items-start gap-2 bg-[#FFFDF5] p-2 rounded-xl border border-black/20">
                        <span className="w-5 h-5 rounded-md bg-[#00E599] border border-black font-mono font-black text-[10px] flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <p className="font-mono text-[11px] text-neutral-800 leading-snug">
                          {act}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {statusMessage && (
                  <div className="p-2.5 bg-emerald-100 border-2 border-black rounded-xl font-mono text-xs font-black text-emerald-950 flex items-center gap-1.5 shadow-[2px_2px_0px_#000000]">
                    <CheckCircle2 className="w-4 h-4 stroke-[2.5] text-emerald-800" />
                    <span>{statusMessage}</span>
                  </div>
                )}

                {/* Dispatch Action Toolbar */}
                <div className="flex flex-col sm:flex-row items-stretch gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={handleWhatsAppDispatch}
                    className="flex-1 py-2.5 px-3 bg-[#00E599] hover:bg-[#00c985] text-black border-2 border-black rounded-xl font-mono text-xs font-black uppercase shadow-[2px_2px_0px_#000000] cursor-pointer flex items-center justify-center gap-2 active:translate-x-px"
                  >
                    <MessageSquare className="w-4 h-4 stroke-[2.5]" />
                    <span>WHATSAPP</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleEmailDispatch(false)}
                    disabled={dispatchStatus === 'sending'}
                    className="flex-1 py-2.5 px-3 bg-[#FDC800] hover:bg-yellow-400 text-black border-2 border-black rounded-xl font-mono text-xs font-black uppercase shadow-[2px_2px_0px_#000000] cursor-pointer flex items-center justify-center gap-2 active:translate-x-px disabled:opacity-60"
                  >
                    <Mail className="w-4 h-4 stroke-[2.5]" />
                    <span>{dispatchStatus === 'sending' ? 'DISPATCHING...' : 'DISPATCH EMAIL'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleEmailDispatch(true)}
                    disabled={dispatchStatus === 'sending'}
                    title="Send an immediate test dispatch to verify inbox delivery"
                    className="py-2.5 px-3 bg-[#00C2FF] hover:bg-[#00a6db] text-black border-2 border-black rounded-xl font-mono text-xs font-black uppercase shadow-[2px_2px_0px_#000000] cursor-pointer flex items-center justify-center gap-1.5 shrink-0 active:translate-x-px"
                  >
                    <Send className="w-4 h-4 stroke-[2.5]" />
                    <span>TEST EMAIL</span>
                  </button>

                  <button
                    type="button"
                    onClick={handlePrintDossier}
                    className="py-2.5 px-3 bg-white hover:bg-neutral-100 text-black border-2 border-black rounded-xl font-mono text-xs font-black uppercase shadow-[2px_2px_0px_#000000] cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
                    title="Print Family Health Dossier"
                  >
                    <Printer className="w-4 h-4 stroke-[2.5]" />
                    <span className="hidden sm:inline">PRINT</span>
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'configure' && (
              <form onSubmit={handleSaveConfig} className="space-y-4">
                {/* Explicit Parental Opt-In Banner */}
                <div className="p-3 bg-amber-50 border-2 border-black rounded-2xl font-mono text-xs text-neutral-800 leading-relaxed shadow-[1.5px_1.5px_0px_#000000]">
                  <strong>Non-Negotiable Privacy Policy:</strong> Emergency dispatch is strictly <strong>OFF by default</strong>. Zero automatic emails or messages are transmitted without explicit parental opt-in and student consent.
                </div>

                {/* Master Switch */}
                <div className="p-3 bg-white border-2 border-black rounded-2xl shadow-[2px_2px_0px_#000000] flex items-center justify-between gap-3">
                  <div>
                    <h5 className="font-mono text-xs font-black uppercase text-black">
                      Guardian Emergency AI Dispatch
                    </h5>
                    <p className="font-mono text-[10px] text-neutral-600 mt-0.5">
                      Enable AI triage detection and emergency notifications for designated categories.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setConfig({ ...config, enabled: !config.enabled })}
                    className={`px-3 py-1.5 rounded-xl border-2 border-black font-mono text-xs font-black uppercase cursor-pointer transition-all shadow-[1.5px_1.5px_0px_#000000] ${
                      config.enabled
                        ? 'bg-[#00E599] text-black'
                        : 'bg-neutral-200 text-neutral-700'
                    }`}
                  >
                    {config.enabled ? 'ACTIVE (OPTED-IN)' : 'OFF (DEFAULT)'}
                  </button>
                </div>

                {/* Explicit Opt-In Categories */}
                <div className="space-y-2 p-3.5 bg-white border-2 border-black rounded-2xl shadow-[2px_2px_0px_#000000]">
                  <span className="font-mono text-xs font-black uppercase text-black block border-b border-black/15 pb-1.5">
                    Parent Opt-In Notification Categories (4 Scenarios):
                  </span>

                  {/* 1. Severe Illness */}
                  <label className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-neutral-50 cursor-pointer border border-transparent hover:border-black/15 transition-all">
                    <input
                      type="checkbox"
                      checked={config.categories?.severeIllness ?? true}
                      onChange={() => handleToggleCategory('severeIllness')}
                      className="mt-0.5 w-4 h-4 rounded border-2 border-black text-[#00E599] focus:ring-0 cursor-pointer"
                    />
                    <div className="min-w-0">
                      <span className="font-mono text-xs font-black text-black block">
                        1. Severe Physical Illness / Medical Sickness Alert
                      </span>
                      <span className="font-mono text-[10px] text-neutral-600 block">
                        Triggers when diary reflections contain markers like fever, infection, clinic, hospital, severe pain, or vomiting.
                      </span>
                    </div>
                  </label>

                  {/* 2. Repeated Breakdown */}
                  <label className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-neutral-50 cursor-pointer border border-transparent hover:border-black/15 transition-all">
                    <input
                      type="checkbox"
                      checked={config.categories?.repeatedBreakdown ?? true}
                      onChange={() => handleToggleCategory('repeatedBreakdown')}
                      className="mt-0.5 w-4 h-4 rounded border-2 border-black text-[#00E599] focus:ring-0 cursor-pointer"
                    />
                    <div className="min-w-0">
                      <span className="font-mono text-xs font-black text-black block">
                        2. Repeated Breakdown &amp; Acute Slump Alert
                      </span>
                      <span className="font-mono text-[10px] text-neutral-600 block">
                        Triggers after consecutive 1★/2★ rough days or when diary mentions acute emotional overwhelm or panic.
                      </span>
                    </div>
                  </label>

                  {/* 3. Severe Sleep Deficit */}
                  <label className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-neutral-50 cursor-pointer border border-transparent hover:border-black/15 transition-all">
                    <input
                      type="checkbox"
                      checked={config.categories?.sleepDeficit ?? true}
                      onChange={() => handleToggleCategory('sleepDeficit')}
                      className="mt-0.5 w-4 h-4 rounded border-2 border-black text-[#00E599] focus:ring-0 cursor-pointer"
                    />
                    <div className="min-w-0">
                      <span className="font-mono text-xs font-black text-black block">
                        3. Chronic Sleep Deficit &amp; Cognitive Depletion
                      </span>
                      <span className="font-mono text-[10px] text-neutral-600 block">
                        Triggers when persistent late-night study and sleep loss compromise circadian recovery.
                      </span>
                    </div>
                  </label>

                  {/* 4. Manual SOS */}
                  <label className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-neutral-50 cursor-pointer border border-transparent hover:border-black/15 transition-all">
                    <input
                      type="checkbox"
                      checked={config.categories?.manualSos ?? true}
                      onChange={() => handleToggleCategory('manualSos')}
                      className="mt-0.5 w-4 h-4 rounded border-2 border-black text-[#00E599] focus:ring-0 cursor-pointer"
                    />
                    <div className="min-w-0">
                      <span className="font-mono text-xs font-black text-black block">
                        4. Manual 1-Tap SOS Dispatch
                      </span>
                      <span className="font-mono text-[10px] text-neutral-600 block">
                        Allows the student or parent to dispatch the compassionate briefing on-demand anytime.
                      </span>
                    </div>
                  </label>
                </div>

                {/* Contact Details */}
                <div className="space-y-1">
                  <label className="font-mono text-xs font-black uppercase text-black block">
                    Guardian / Parent Name:
                  </label>
                  <input
                    type="text"
                    value={config.guardianName || ''}
                    onChange={(e) => setConfig({ ...config, guardianName: e.target.value })}
                    placeholder="e.g. Papa / Mom / Uncle Rajesh"
                    className="w-full px-3 py-2 bg-white border-2 border-black rounded-xl font-mono text-xs focus:outline-none focus:ring-2 focus:ring-[#FDC800]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-mono text-xs font-black uppercase text-black block">
                      Target Email Address (or Your Test Email):
                    </label>
                    <input
                      type="email"
                      value={config.guardianEmail || ''}
                      onChange={(e) => setConfig({ ...config, guardianEmail: e.target.value })}
                      placeholder="parent@example.com (or test email)"
                      className="w-full px-3 py-2 bg-white border-2 border-black rounded-xl font-mono text-xs focus:outline-none focus:ring-2 focus:ring-[#FDC800]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-mono text-xs font-black uppercase text-black block">
                      WhatsApp Phone:
                    </label>
                    <input
                      type="tel"
                      value={config.guardianPhone || ''}
                      onChange={(e) => setConfig({ ...config, guardianPhone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full px-3 py-2 bg-white border-2 border-black rounded-xl font-mono text-xs focus:outline-none focus:ring-2 focus:ring-[#FDC800]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-mono text-xs font-black uppercase text-black block">
                    Slump Sensitivity Trigger:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[2, 3, 4].map((days) => (
                      <button
                        key={days}
                        type="button"
                        onClick={() => setConfig({ ...config, slumpThresholdDays: days })}
                        className={`py-2 rounded-xl font-mono text-xs font-black border-2 border-black cursor-pointer transition-all ${
                          config.slumpThresholdDays === days
                            ? 'bg-[#FDC800] text-black shadow-[2px_2px_0px_#000000]'
                            : 'bg-white hover:bg-neutral-50 text-neutral-600'
                        }`}
                      >
                        {days} ROUGH DAYS
                      </button>
                    ))}
                  </div>
                </div>

                {statusMessage && (
                  <div className="p-2.5 bg-emerald-100 border border-black rounded-xl font-mono text-xs font-black text-emerald-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                    <span>{statusMessage}</span>
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-black text-[#00E599] border-2 border-black rounded-xl font-mono text-xs font-black uppercase shadow-[2px_2px_0px_#000000] cursor-pointer hover:bg-neutral-900 active:translate-x-px"
                  >
                    SAVE GUARDIAN PROTOCOL
                  </button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
