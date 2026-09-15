import React from 'react';
import { AlertOctagon } from 'lucide-react';

export default function AutopsyBadge({ autopsy, onClick, className = '' }) {
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

export { AutopsyBadge };
