import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, X, Lock, Database, Trash2, EyeOff, FileText, CheckCircle2 } from 'lucide-react';

/**
 * 🇮🇳 DPDPA 2023 Statutory Privacy Policy Modal
 * Built in accordance with Sections 5, 8, 12 & 13 of India's Digital Personal Data Protection Act, 2023.
 */
export default function PrivacyPolicyModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          transition={{ duration: 0.18 }}
          className="relative w-full max-w-2xl bg-[#FFFDF8] border-3 border-black shadow-[6px_6px_0px_#000000] p-5 sm:p-7 my-8 max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-4 border-b-3 border-black pb-4 mb-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-[#00E599] border-2 border-black shadow-[2px_2px_0px_#000000]">
                <ShieldCheck className="w-6 h-6 text-black stroke-[2.5]" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest bg-black text-white px-2 py-0.5 font-bold">
                  DPDPA 2023 COMPLIANT • INDIA
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-black tracking-tight mt-1">
                  Privacy Policy & Data Sovereignty
                </h2>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 bg-[#FF4D4D] text-black border-2 border-black hover:bg-black hover:text-white transition-colors shadow-[2px_2px_0px_#000000] shrink-0"
              aria-label="Close Privacy Policy"
            >
              <X className="w-5 h-5 stroke-[3]" />
            </button>
          </div>

          {/* Body Content */}
          <div className="space-y-4 text-xs sm:text-sm text-black/90 font-mono leading-relaxed">
            
            {/* 1. Core Philosophy */}
            <div className="p-3.5 bg-[#FDC800]/20 border-2 border-black shadow-[2px_2px_0px_#000000]">
              <div className="flex items-center gap-2 font-black text-black uppercase tracking-wider mb-1">
                <Lock className="w-4 h-4 text-black stroke-[2.5]" />
                1. Local-First & Zero-Surveillance Philosophy
              </div>
              <p>
                <strong>SHIT OR HIT</strong> is engineered as a private behavioral dossier. We believe your thoughts, 
                mood ratings, habits, and self-critiques belong solely to you. We do not sell, monetize, rent, or trade 
                your personal data with any third-party ad brokers or data aggregators.
              </p>
            </div>

            {/* 2. What Data Is Collected */}
            <div className="p-3.5 bg-white border-2 border-black shadow-[2px_2px_0px_#000000]">
              <div className="flex items-center gap-2 font-black text-black uppercase tracking-wider mb-1">
                <Database className="w-4 h-4 text-black stroke-[2.5]" />
                2. Data Collection & Processing (Section 5, DPDPA 2023)
              </div>
              <ul className="list-disc list-inside space-y-1 mt-1 text-black/80">
                <li><strong>Local Guest Mode</strong>: All habit records, daily ratings, and notes are stored strictly inside your browser's local sandbox (<code className="bg-black/10 px-1 py-0.5 font-bold">localStorage</code>). No cloud transmission occurs.</li>
                <li><strong>Authenticated Cloud Mode</strong>: For authorized users who choose Google Authentication, diary entries and settings synchronize to Google Firebase Firestore for multi-device recovery.</li>
                <li><strong>Cryptographic Vault</strong>: Diary notes locked behind your 4-digit PIN are encrypted locally using AES-GCM and PBKDF2 before storage.</li>
              </ul>
            </div>

            {/* 3. Right to Erasure */}
            <div className="p-3.5 bg-[#FF4D4D]/15 border-2 border-black shadow-[2px_2px_0px_#000000]">
              <div className="flex items-center gap-2 font-black text-black uppercase tracking-wider mb-1">
                <Trash2 className="w-4 h-4 text-[#FF4D4D] stroke-[2.5]" />
                3. The Statutory Right to Erasure (Section 12, DPDPA 2023)
              </div>
              <p>
                Under Section 12(3) of India's Digital Personal Data Protection Act, you have the absolute statutory right to request 
                the permanent erasure of all your data. You can trigger this at any time in <strong>Settings → Danger Zone → Erase All Data</strong>. 
                This immediately purges all local storage keys and batch-deletes all Firestore cloud documents associated with your account.
              </p>
            </div>

            {/* 4. Telemetry & AI Processing */}
            <div className="p-3.5 bg-white border-2 border-black shadow-[2px_2px_0px_#000000]">
              <div className="flex items-center gap-2 font-black text-black uppercase tracking-wider mb-1">
                <EyeOff className="w-4 h-4 text-black stroke-[2.5]" />
                4. AI Ghostwriting & Error Telemetry
              </div>
              <p className="mt-1">
                If you invoke the AI Diary Ghostwriter, text snippets are passed to Google Gemini APIs strictly for on-demand 
                enhancement. No personal diary entries are used to train external public foundation models. Sentry telemetry 
                is utilized solely to capture frontend crash traces and improve stability.
              </p>
            </div>

            {/* 5. Grievance Redressal */}
            <div className="p-3.5 bg-[#00E599]/20 border-2 border-black shadow-[2px_2px_0px_#000000]">
              <div className="flex items-center gap-2 font-black text-black uppercase tracking-wider mb-1">
                <FileText className="w-4 h-4 text-black stroke-[2.5]" />
                5. Grievance Officer & Contact Information
              </div>
              <p>
                For data privacy inquiries or formal DPDPA compliance requests, contact the developer directly at:
                <br />
                <span className="font-bold underline">support@trinno.local</span> • Repository: <strong>TRINNO112/shit-or-hit</strong>
              </p>
            </div>

          </div>

          {/* Footer Action */}
          <div className="mt-6 pt-4 border-t-2 border-black flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-[#00E599] text-black font-black uppercase tracking-wider border-2 border-black shadow-[3px_3px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_#000000] transition-all flex items-center gap-2 text-xs sm:text-sm cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
              UNDERSTOOD & ACKNOWLEDGED
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
