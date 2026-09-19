import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  ShieldCheck, 
  Lock, 
  FileText, 
  ExternalLink, 
  Scale, 
  Key, 
  Check, 
  Copy, 
  Layers, 
  Cpu, 
  Mail, 
  Database, 
  EyeOff, 
  RefreshCw, 
  AlertCircle,
  Clock,
  UserCheck
} from 'lucide-react';
import { soundEngine } from '../services/soundEngine';

export default function PrivacyPolicyPage({ onBack }) {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [activeSection, setActiveSection] = useState('crypto');
  const [cipherInput, setCipherInput] = useState('Deep work session: 4.5 hours locked in.');
  const [simulatedNonce, setSimulatedNonce] = useState('a9f4c1e28b73');
  const [simulatedCipher, setSimulatedCipher] = useState('9b81f03d52cb66e1194ac5e802f6bb471e98d92a4e82b7');

  const grievanceEmail = 'kaushtubh457@gmail.com';

  const handleBack = () => {
    try { soundEngine.playClick(); } catch (e) {}
    if (onBack) {
      onBack();
    } else if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', '/');
      window.location.href = '/';
    }
  };

  const handleOpenErasure = () => {
    try { soundEngine.playClick(); } catch (e) {}
    if (typeof window !== 'undefined') {
      window.location.href = '/?view=erasure';
    }
  };

  const handleCopyEmail = () => {
    try { soundEngine.playClick(); } catch (e) {}
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(grievanceEmail);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2500);
    }
  };

  const handleRegenerateCipher = () => {
    try { soundEngine.playClick(); } catch (e) {}
    const chars = '0123456789abcdef';
    let newNonce = '';
    for (let i = 0; i < 12; i++) newNonce += chars[Math.floor(Math.random() * chars.length)];
    let newCipher = '';
    for (let i = 0; i < 48; i++) newCipher += chars[Math.floor(Math.random() * chars.length)];
    setSimulatedNonce(newNonce);
    setSimulatedCipher(newCipher);
  };

  const scrollToSection = (id) => {
    try { soundEngine.playClick(); } catch (e) {}
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDF9] text-black font-sans selection:bg-[#FDC800] selection:text-black">
      {/* Statutory Header Bar */}
      <header className="border-b-3 border-black bg-white/95 backdrop-blur-md px-4 sm:px-8 py-3.5 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleBack}
              className="flex items-center gap-2 bg-[#FFFDF9] hover:bg-[#FDC800] px-3.5 py-1.5 rounded-xl border-2 border-black font-mono font-black text-xs cursor-pointer shadow-[2px_2px_0px_#000000] active:translate-x-px active:translate-y-px transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>RETURN TO DASHBOARD</span>
            </button>
            <span className="text-neutral-300 hidden md:inline font-mono">/</span>
            <span className="font-mono text-xs font-bold text-neutral-500 hidden md:inline tracking-wider uppercase">
              LEGAL DOSSIER // DPDPA 2023 GAZETTE
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleOpenErasure}
              className="flex items-center gap-1.5 bg-[#FF4D4D] hover:bg-red-500 text-black px-3.5 py-1.5 rounded-xl border-2 border-black font-mono font-black text-xs cursor-pointer shadow-[2px_2px_0px_#000000] active:translate-x-px active:translate-y-px transition-all"
            >
              <span>RIGHT TO ERASURE PORTAL</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Panoramic Banner */}
      <section className="border-b-3 border-black bg-[#111622] text-white px-4 sm:px-8 py-10 sm:py-12">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1 bg-[#FDC800] text-black border-2 border-black rounded-lg text-xs font-mono font-black uppercase shadow-[2px_2px_0px_#000000]">
                STATUTORY COMPLIANCE ARCHIVE
              </span>
              <span className="px-3 py-1 bg-[#00E599] text-black border-2 border-black rounded-lg text-xs font-mono font-black uppercase shadow-[2px_2px_0px_#000000]">
                ACT NO. 22 OF 2023 (PARLIAMENT OF INDIA)
              </span>
              <span className="px-3 py-1 bg-white/10 text-neutral-300 border border-white/20 rounded-lg text-xs font-mono">
                VERSION 2.4 // ZERO-KNOWLEDGE MANDATE
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-display font-black tracking-tight text-white leading-tight">
              Statutory Privacy Policy & Cryptographic Architecture Charter
            </h1>

            <p className="text-sm sm:text-base text-neutral-300 font-sans leading-relaxed">
              This charter governs how <strong>SHIT OR HIT</strong> enforces cryptographic sovereignty, zero-knowledge isolation, and statutory user rights under the <em>Digital Personal Data Protection Act, 2023</em>. Your reflections belong solely to you.
            </p>
          </div>

          {/* Seal / Trust Metric Pod */}
          <div className="w-full lg:w-auto shrink-0 bg-black/50 border-2 border-white/20 rounded-2xl p-5 font-mono text-xs space-y-3">
            <div className="flex items-center gap-2 text-[#00E599]">
              <ShieldCheck className="w-5 h-5" />
              <span className="font-black tracking-wider uppercase">VERIFIED CRYPTOGRAPHIC POSTURE</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-neutral-300 pt-1 border-t border-white/10">
              <div>
                <span className="text-[10px] text-neutral-400 block uppercase">CIPHER SUITE</span>
                <span className="font-black text-white">AES-GCM (256-BIT)</span>
              </div>
              <div>
                <span className="text-[10px] text-neutral-400 block uppercase">KEY DERIVATION</span>
                <span className="font-black text-white">PBKDF2-SHA256</span>
              </div>
              <div>
                <span className="text-[10px] text-neutral-400 block uppercase">HASHING WORK</span>
                <span className="font-black text-[#FDC800]">100,000 ROUNDS</span>
              </div>
              <div>
                <span className="text-[10px] text-neutral-400 block uppercase">SERVER ACCESS</span>
                <span className="font-black text-[#00E599]">ZERO KNOWLEDGE</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Full-Screen Split Architecture */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ========================================================= */}
          {/* LEFT RAIL: STICKY NAVIGATION & CONTROL HUD (5 Columns)     */}
          {/* ========================================================= */}
          <div className="lg:col-span-5 space-y-5 lg:sticky lg:top-20 self-start">
            
            {/* Quick Navigation HUD */}
            <div className="border-3 border-black rounded-3xl p-5 bg-white shadow-[4px_4px_0px_#000000] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Scale className="w-4 h-4 text-black" />
                  <span className="text-xs font-mono font-black uppercase tracking-wider text-black">
                    STATUTORY ARTICLES INDEX
                  </span>
                </div>
                <span className="text-[10px] font-mono font-bold bg-neutral-100 px-2 py-0.5 rounded border border-black/30">
                  5 ARTICLES
                </span>
              </div>

              <nav className="space-y-1.5 font-mono text-xs font-bold">
                {[
                  { id: 'crypto', label: '01. Zero-Knowledge AES-GCM 256 Architecture' },
                  { id: 'tiers', label: '02. Two-Tier Sovereign Data Partitioning' },
                  { id: 'rights', label: '03. Data Principal Statutory Rights (Sec 11-14)' },
                  { id: 'retention', label: '04. Data Retention & Automatic Sunset Policy' },
                  { id: 'grievance', label: '05. Data Protection Grievance Officer' }
                ].map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => scrollToSection(item.id)}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl border-2 transition-all flex items-center justify-between cursor-pointer ${
                      activeSection === item.id 
                        ? 'bg-[#FDC800] border-black text-black shadow-[2px_2px_0px_#000000]' 
                        : 'bg-[#FFFDF9] border-black/10 hover:border-black text-neutral-800'
                    }`}
                  >
                    <span className="truncate pr-2">{item.label}</span>
                    <span className="text-neutral-400 shrink-0">&rarr;</span>
                  </button>
                ))}
              </nav>
            </div>

            {/* Interactive Client-Side Cryptographic Simulator */}
            <div className="border-3 border-black rounded-3xl p-5 bg-[#F0FAF4] shadow-[4px_4px_0px_#000000] space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-black text-[#00E599] flex items-center justify-center border border-black shrink-0">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-black uppercase text-emerald-800 block">
                      CLIENT-SIDE ENGINE
                    </span>
                    <h3 className="font-display font-black text-sm text-black">
                      Live Cipher Demonstration
                    </h3>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleRegenerateCipher}
                  title="Simulate dynamic key derivation and nonce cycle"
                  className="p-1.5 bg-white border-2 border-black rounded-lg hover:bg-[#FDC800] cursor-pointer shadow-[1px_1px_0px_#000000]"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-black" />
                </button>
              </div>

              <div className="space-y-2 font-mono text-[11px]">
                <div className="bg-white border-2 border-black rounded-xl p-2.5 space-y-1 shadow-[2px_2px_0px_#000000]">
                  <div className="flex items-center justify-between text-neutral-500 font-bold">
                    <span>1. PLAINTEXT INPUT</span>
                    <span className="text-emerald-600 font-black">LOCAL MEMORY</span>
                  </div>
                  <input
                    type="text"
                    value={cipherInput}
                    onChange={(e) => setCipherInput(e.target.value)}
                    className="w-full bg-[#FFFDF9] border-2 border-black rounded px-2 py-1 text-black font-mono text-[11px] outline-none focus:ring-1 focus:ring-black"
                  />
                </div>

                <div className="bg-white border-2 border-black rounded-xl p-2 space-y-0.5 shadow-[2px_2px_0px_#000000]">
                  <div className="flex items-center justify-between text-neutral-500 font-bold">
                    <span>2. NONCE / IV (96-BIT)</span>
                    <span className="text-[#A855F7]">DYNAMIC</span>
                  </div>
                  <div className="font-bold text-neutral-700 truncate text-[10px]">{simulatedNonce}</div>
                </div>

                <div className="bg-[#111622] text-[#00E599] border-2 border-black rounded-xl p-2.5 space-y-1 shadow-[2px_2px_0px_#000000]">
                  <div className="flex items-center justify-between text-neutral-400 font-bold">
                    <span>3. AES-GCM CIPHERTEXT</span>
                    <span className="text-[#00E599]">ENCRYPTED</span>
                  </div>
                  <div className="font-mono text-[10px] break-all text-neutral-200">
                    {simulatedCipher}...
                  </div>
                </div>
              </div>
            </div>

            {/* Quick DPO Redressal Capsule (Points to Article 05 in Right Column) */}
            <div className="border-2 border-black rounded-2xl p-4 bg-[#FFFDF0] shadow-[2px_2px_0px_#000000] flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-mono font-black uppercase text-neutral-500 block">
                  STATUTORY DPO (SEC 13)
                </span>
                <span className="font-mono font-black text-xs text-black block truncate">
                  {grievanceEmail}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopyEmail}
                className="shrink-0 px-2.5 py-1.5 bg-black text-[#FDC800] rounded-xl text-xs font-mono font-bold hover:bg-neutral-800 cursor-pointer flex items-center gap-1 shadow-[1px_1px_0px_#000000]"
              >
                {copiedEmail ? <Check className="w-3.5 h-3.5 text-[#00E599]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedEmail ? 'COPIED' : 'COPY'}</span>
              </button>
            </div>
          </div>

          {/* ========================================================= */}
          {/* RIGHT RAIL: STATUTORY GAZETTE ARTICLES (7 Columns)        */}
          {/* ========================================================= */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* Article 1: Zero-Knowledge AES-GCM Architecture */}
            <section id="crypto" className="scroll-mt-24 border-3 border-black rounded-3xl p-6 sm:p-8 bg-white shadow-[5px_5px_0px_#000000] space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-black text-[#00E599] flex items-center justify-center border-2 border-black shrink-0">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-800">
                    STATUTORY ARTICLE 01
                  </span>
                  <h2 className="text-xl sm:text-2xl font-display font-black text-black">
                    Zero-Knowledge AES-GCM 256 Cryptographic Architecture
                  </h2>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-neutral-700 font-sans leading-relaxed">
                Under the Data Protection Directives, <strong>SHIT OR HIT</strong> operates under a strict <em>Zero-Knowledge Trust Model</em>. All sensitive personal reflections, habit audits, and vault credentials undergo client-side encryption within your browser's execution thread before persistence.
              </p>

              <div className="border-2 border-black rounded-2xl p-4 bg-[#FFFDF5] space-y-3 font-mono text-xs">
                <div className="font-black text-black flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-black" />
                  <span>TECHNICAL IMPLEMENTATION SPECIFICATION:</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="p-3 bg-white border border-black rounded-xl">
                    <span className="text-[10px] text-neutral-400 block font-bold">SYMMETRIC CIPHER</span>
                    <span className="font-black text-black text-xs">AES-GCM (256-bit Key)</span>
                    <span className="text-[10px] text-neutral-500 block mt-1">Authenticated Galois/Counter Mode with 128-bit integrity tag.</span>
                  </div>
                  <div className="p-3 bg-white border border-black rounded-xl">
                    <span className="text-[10px] text-neutral-400 block font-bold">KEY DERIVATION FUNCTION</span>
                    <span className="font-black text-black text-xs">PBKDF2-SHA256</span>
                    <span className="text-[10px] text-neutral-500 block mt-1">100,000 iterations with cryptographically random 16-byte salt.</span>
                  </div>
                  <div className="p-3 bg-white border border-black rounded-xl">
                    <span className="text-[10px] text-neutral-400 block font-bold">INITIALIZATION VECTOR (IV)</span>
                    <span className="font-black text-black text-xs">96-bit Dynamic Nonce</span>
                    <span className="text-[10px] text-neutral-500 block mt-1">Generated anew for every single record mutation.</span>
                  </div>
                  <div className="p-3 bg-white border border-black rounded-xl">
                    <span className="text-[10px] text-neutral-400 block font-bold">STORAGE DISPOSITION</span>
                    <span className="font-black text-black text-xs">Ciphertext-Only Persistence</span>
                    <span className="text-[10px] text-neutral-500 block mt-1">Plaintext keys never written to disk or network payloads.</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-emerald-50 border-2 border-emerald-800/30 rounded-2xl text-xs font-sans text-emerald-950 space-y-1">
                <strong>Absolute Fiduciary Guarantee:</strong> Because decryption keys exist solely in volatile browser RAM derived from your sovereign passphrase, neither the application operators nor cloud infrastructure fiduciaries have the technical capability to decipher your journal entries.
              </div>
            </section>

            {/* Article 2: Two-Tier Sovereign Partitioning */}
            <section id="tiers" className="scroll-mt-24 border-3 border-black rounded-3xl p-6 sm:p-8 bg-white shadow-[5px_5px_0px_#000000] space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#FDC800] text-black flex items-center justify-center border-2 border-black shrink-0">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-500">
                    STATUTORY ARTICLE 02
                  </span>
                  <h2 className="text-xl sm:text-2xl font-display font-black text-black">
                    Two-Tier Sovereign Data Partitioning
                  </h2>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-neutral-700 font-sans leading-relaxed">
                To guarantee zero surveillance for unauthenticated users while maintaining robust resilience for authorized stakeholders, the application enforces two completely isolated operating tiers:
              </p>

              {/* Contrast Table */}
              <div className="border-2 border-black rounded-2xl overflow-hidden shadow-[2px_2px_0px_#000000]">
                <table className="w-full text-left font-mono text-xs border-collapse">
                  <thead>
                    <tr className="bg-black text-white">
                      <th className="p-3 border-r border-white/20">DIMENSION</th>
                      <th className="p-3 border-r border-white/20">TIER 1: GUEST MODE</th>
                      <th className="p-3">TIER 2: WHITELISTED CLOUD</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/10 bg-white">
                    <tr>
                      <td className="p-3 font-black bg-neutral-50 border-r border-black/10">Storage Medium</td>
                      <td className="p-3 border-r border-black/10 text-neutral-700">Client <code>localStorage</code> only</td>
                      <td className="p-3 text-neutral-700">Google Firestore + Local Mirror</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-black bg-neutral-50 border-r border-black/10">Network Footprint</td>
                      <td className="p-3 border-r border-black/10 text-emerald-700 font-bold">0 kb (Air-Gapped)</td>
                      <td className="p-3 text-neutral-700">Encrypted JSON over TLS 1.3</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-black bg-neutral-50 border-r border-black/10">Encryption Key Custody</td>
                      <td className="p-3 border-r border-black/10 text-neutral-700">100% User (PBKDF2 Salted)</td>
                      <td className="p-3 text-neutral-700">100% User (PBKDF2 Salted)</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-black bg-neutral-50 border-r border-black/10">Disaster Recovery</td>
                      <td className="p-3 border-r border-black/10 text-rose-700 font-bold">Manual JSON/CSV Backups</td>
                      <td className="p-3 text-neutral-700">Real-Time Cloud Synchronization</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-black bg-neutral-50 border-r border-black/10">Erasure Mechanism</td>
                      <td className="p-3 border-r border-black/10 text-neutral-700">Clear Cache or 7-Day Hold</td>
                      <td className="p-3 text-neutral-700">Section 12 7-Day Regret Hold</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Article 3: Data Principal Statutory Rights (Sec 11-14) */}
            <section id="rights" className="scroll-mt-24 border-3 border-black rounded-3xl p-6 sm:p-8 bg-white shadow-[5px_5px_0px_#000000] space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-black text-white flex items-center justify-center border-2 border-black shrink-0">
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-500">
                    STATUTORY ARTICLE 03
                  </span>
                  <h2 className="text-xl sm:text-2xl font-display font-black text-black">
                    Your Rights Under DPDPA 2023 (Sections 11 - 14)
                  </h2>
                </div>
              </div>

              <div className="space-y-4">
                <div className="border-2 border-black rounded-2xl p-5 bg-[#FFFDF5] space-y-2 shadow-[2px_2px_0px_#000000]">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-black text-xs text-black">
                      SECTION 11: RIGHT TO ACCESS, SUMMARY & PORTABILITY
                    </span>
                    <span className="text-[10px] font-mono font-bold bg-[#00E599] px-2 py-0.5 rounded border border-black">
                      INSTANT
                    </span>
                  </div>
                  <p className="text-xs text-neutral-700 font-sans leading-relaxed">
                    You possess the unrestricted statutory entitlement to view, inspect, and export every byte of behavioral data ever recorded. Via the <strong>Export Studio</strong>, you can download unconstrained archives in raw JSON, RFC 4180 CSV, or Chronological Markdown digests without vendor lock-in.
                  </p>
                </div>

                <div className="border-2 border-black rounded-2xl p-5 bg-[#FFFDF5] space-y-2 shadow-[2px_2px_0px_#000000]">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-black text-xs text-black">
                      SECTION 12: RIGHT TO CORRECTION, UPDATING & ERASURE
                    </span>
                    <span className="text-[10px] font-mono font-bold bg-[#FFD600] px-2 py-0.5 rounded border border-black">
                      7-DAY COOLING-OFF
                    </span>
                  </div>
                  <p className="text-xs text-neutral-700 font-sans leading-relaxed">
                    You may correct past entries at any time. Under Section 12(3), upon receiving your erasure request, all personal data must be permanently purged. To shield users from impulsive decisions during emotional burnout, erasure is buffered by our <strong>7-Day Regret-Proof Holding Pattern</strong>, cancelable at any moment.
                  </p>
                </div>

                <div className="border-2 border-black rounded-2xl p-5 bg-[#FFFDF5] space-y-2 shadow-[2px_2px_0px_#000000]">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-black text-xs text-black">
                      SECTION 13: RIGHT OF READILY AVAILABLE GRIEVANCE REDRESSAL
                    </span>
                    <span className="text-[10px] font-mono font-bold bg-black text-[#00E599] px-2 py-0.5 rounded border border-black">
                      48H SLA
                    </span>
                  </div>
                  <p className="text-xs text-neutral-700 font-sans leading-relaxed">
                    You have the right to readily available grievance redressal in respect of any act or omission by the Data Fiduciary regarding your personal data rights. Our designated officer must respond within 48 business hours.
                  </p>
                </div>

                <div className="border-2 border-black rounded-2xl p-5 bg-[#FFFDF5] space-y-2 shadow-[2px_2px_0px_#000000]">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-black text-xs text-black">
                      SECTION 14: RIGHT TO NOMINATE
                    </span>
                    <span className="text-[10px] font-mono font-bold bg-neutral-200 px-2 py-0.5 rounded border border-black">
                      SOVEREIGN
                    </span>
                  </div>
                  <p className="text-xs text-neutral-700 font-sans leading-relaxed">
                    You have the right to nominate any other individual who shall, in the event of your death or incapacity, exercise the rights of the Data Principal in accordance with statutory rules.
                  </p>
                </div>
              </div>
            </section>

            {/* Article 4: Data Retention & Automatic Sunset Policy */}
            <section id="retention" className="scroll-mt-24 border-3 border-black rounded-3xl p-6 sm:p-8 bg-white shadow-[5px_5px_0px_#000000] space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-neutral-900 text-white flex items-center justify-center border-2 border-black shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-500">
                    STATUTORY ARTICLE 04
                  </span>
                  <h2 className="text-xl sm:text-2xl font-display font-black text-black">
                    Data Retention & Automatic Sunset Policy
                  </h2>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-neutral-700 font-sans leading-relaxed">
                In compliance with the Data Minimization and Storage Limitation principles of Section 8, personal data is retained only for as long as necessary to satisfy the purpose of personal habit tracking and behavioral forensic analytics.
              </p>

              <div className="space-y-2 font-mono text-xs">
                <div className="p-3 bg-[#FFFDF9] border-2 border-black rounded-xl flex items-center justify-between">
                  <div>
                    <strong className="text-black block">Guest Local Journal</strong>
                    <span className="text-neutral-500 text-[11px]">Retained indefinitely in browser until cache wipe or explicit erasure.</span>
                  </div>
                  <span className="px-2 py-1 bg-neutral-100 border border-black rounded text-[10px] font-bold">CLIENT CONTROL</span>
                </div>

                <div className="p-3 bg-[#FFFDF9] border-2 border-black rounded-xl flex items-center justify-between">
                  <div>
                    <strong className="text-black block">Cloud Synchronized Encrypted Records</strong>
                    <span className="text-neutral-500 text-[11px]">Retained until Section 12 deletion request executes after 7-day hold.</span>
                  </div>
                  <span className="px-2 py-1 bg-neutral-100 border border-black rounded text-[10px] font-bold">7-DAY PURGE</span>
                </div>
              </div>
            </section>

            {/* Article 5: Data Protection & Grievance Officer (Located in Right Column) */}
            <section id="grievance" className="scroll-mt-24 border-3 border-black rounded-3xl p-6 sm:p-8 bg-[#FFFDF0] shadow-[5px_5px_0px_#000000] space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#00E599] text-black flex items-center justify-center border-2 border-black shrink-0">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-900">
                    STATUTORY ARTICLE 05 // RULE 14
                  </span>
                  <h2 className="text-xl sm:text-2xl font-display font-black text-black">
                    Data Protection & Grievance Officer
                  </h2>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-neutral-700 font-sans leading-relaxed">
                In accordance with Rule 14 and Section 13 of the Digital Personal Data Protection Act, 2023, inquiries, data portability requests, or statutory complaints should be directed to the designated Data Protection Grievance Officer:
              </p>

              <div className="bg-white border-2 border-black rounded-2xl p-5 font-mono text-xs space-y-3 shadow-[2px_2px_0px_#000000]">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-neutral-500">OFFICER DESIGNEE:</span>
                  <span className="font-black text-black text-sm">TRINNO (Lead Architect & Data Fiduciary)</span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-black/10">
                  <span className="font-bold text-neutral-500">JURISDICTION:</span>
                  <span className="font-black text-black">Republic of India</span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-black/10">
                  <span className="font-bold text-neutral-500">MAX RESPONSE SLA:</span>
                  <span className="font-black text-emerald-700">Within 48 Hours Guaranteed</span>
                </div>
                <div className="pt-2 border-t border-black/10">
                  <div className="text-[10px] font-bold text-neutral-400 mb-1.5">STATUTORY GRIEVANCE EMAIL:</div>
                  <div className="flex items-center gap-3">
                    <a
                      href={`mailto:${grievanceEmail}`}
                      className="font-mono font-black text-xs sm:text-sm text-black hover:text-emerald-700 underline truncate block"
                    >
                      {grievanceEmail}
                    </a>
                    <button
                      type="button"
                      onClick={handleCopyEmail}
                      className="ml-auto shrink-0 px-3 py-1.5 bg-black text-[#FDC800] rounded-xl text-xs font-mono font-black hover:bg-neutral-800 cursor-pointer flex items-center gap-1.5 shadow-[2px_2px_0px_#000000]"
                    >
                      {copiedEmail ? <Check className="w-4 h-4 text-[#00E599]" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedEmail ? 'COPIED TO CLIPBOARD' : 'COPY EMAIL'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Sovereign Erasure Direct Portal Box */}
            <div className="border-3 border-black rounded-3xl p-6 sm:p-8 bg-[#FF4D4D] text-black shadow-[6px_6px_0px_#000000] space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-black text-[#FF4D4D] flex items-center justify-center border-2 border-black shrink-0">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-mono font-black uppercase tracking-wider text-black/80">
                    SECTION 12 COMPLIANCE GATEWAY
                  </span>
                  <h3 className="text-xl sm:text-2xl font-display font-black text-black">
                    Need to Permanently Decommission Your Data?
                  </h3>
                </div>
              </div>

              <p className="text-xs sm:text-sm font-sans leading-relaxed text-black font-medium">
                Visit the dedicated <strong>Sovereign Decommissioning Terminal</strong> to initiate the statutory 7-day cooling-off erasure protocol or download your complete emergency memory archive.
              </p>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleOpenErasure}
                  className="w-full sm:w-auto px-6 py-3 bg-black text-white hover:bg-neutral-900 rounded-2xl border-2 border-black font-mono font-black text-xs cursor-pointer shadow-[3px_3px_0px_#000000] active:translate-x-px active:translate-y-px flex items-center justify-center gap-2 transition-all"
                >
                  <span>LAUNCH RIGHT TO ERASURE PORTAL (7-DAY HOLD)</span>
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
