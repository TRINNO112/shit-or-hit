import React from 'react';
import { Shield, Sparkles, Heart, Zap, ArrowRight, X, BatteryCharging, Moon, Compass } from 'lucide-react';
import { soundEngine } from '../services/soundEngine';
import mascot1 from '../assets/mascots/mascot_1_rough.png';

export default function MotivationalRecoveryModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#FFFDF5] border-3 border-black rounded-3xl p-5 sm:p-7 max-w-md w-full shadow-[6px_6px_0px_#000000] relative space-y-4 animate-scale-up">
        {/* Close Button */}
        <button
          type="button"
          onClick={() => {
            soundEngine.playClick();
            onClose();
          }}
          className="absolute top-4 right-4 p-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 border-2 border-black text-black cursor-pointer shadow-[1px_1px_0px_#000000] active:scale-95 transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Mascot & Badge */}
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-2xl border-3 border-black bg-[#FF4D4D] overflow-hidden shrink-0 shadow-[2px_2px_0px_#000000] flex items-center justify-center">
            <img src={mascot1} alt="Recovery Mascot" className="w-12 h-12 object-contain" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-black bg-[#FDC800] font-mono text-[10px] font-black uppercase shadow-[1px_1px_0px_#000000]">
              <Shield className="w-3 h-3 text-black stroke-[2.5]" />
              <span>RECOVERY PROTOCOL</span>
            </div>
            <h3 className="font-display font-black text-lg sm:text-xl uppercase tracking-tight text-black mt-0.5">
              Bhai, Reload & Reset!
            </h3>
          </div>
        </div>

        {/* Brotherly Message */}
        <div className="p-3.5 bg-neutral-100 border-2 border-black rounded-2xl space-y-2">
          <p className="text-xs sm:text-sm font-mono font-bold text-neutral-800 leading-relaxed">
            "Bhai sun, 2 din rough gaye toh kya hua? Machine restart kar, reload and strike back tomorrow! Consistency beats perfection."
          </p>
        </div>

        {/* 3 Quick Resets */}
        <div className="space-y-2">
          <span className="text-[10px] font-mono font-black text-neutral-500 uppercase tracking-widest block">
            3-Step Tactical Reset
          </span>
          <div className="grid grid-cols-1 gap-2">
            <div className="flex items-center gap-2.5 p-2.5 bg-white border-2 border-black rounded-xl text-xs font-mono font-bold shadow-[1px_1px_0px_#000000]">
              <Moon className="w-4 h-4 text-purple-600 shrink-0 stroke-[2.5]" />
              <span>Sleep 30 mins early tonight — zero phone in bed.</span>
            </div>
            <div className="flex items-center gap-2.5 p-2.5 bg-white border-2 border-black rounded-xl text-xs font-mono font-bold shadow-[1px_1px_0px_#000000]">
              <BatteryCharging className="w-4 h-4 text-emerald-600 shrink-0 stroke-[2.5]" />
              <span>Zero guilt mode — bad days are just data points.</span>
            </div>
            <div className="flex items-center gap-2.5 p-2.5 bg-white border-2 border-black rounded-xl text-xs font-mono font-bold shadow-[1px_1px_0px_#000000]">
              <Compass className="w-4 h-4 text-blue-600 shrink-0 stroke-[2.5]" />
              <span>Tomorrow win just 1 small anchor habit.</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={() => {
            soundEngine.playSuccessChime();
            onClose();
          }}
          className="w-full py-3 bg-[#00E599] hover:bg-emerald-400 border-3 border-black rounded-2xl font-display font-black text-sm uppercase text-black shadow-[3px_3px_0px_#000000] cursor-pointer flex items-center justify-center gap-2 active:scale-98 transition-all"
        >
          <span>Got This Bhai — I'm Ready</span>
          <ArrowRight className="w-4 h-4 stroke-[3]" />
        </button>
      </div>
    </div>
  );
}
