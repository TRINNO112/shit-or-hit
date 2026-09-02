import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, X, Heart } from 'lucide-react';
import { soundEngine } from '../services/soundEngine';
import capyMascot from '../assets/mascots/recovery_capybara.png';

export default function MotivationalRecoveryModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-100 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md select-none"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ type: 'spring', stiffness: 350, damping: 28 }}
          className="bg-[#FFFDF9] border-3 border-black rounded-[2.5rem] p-6 sm:p-8 max-w-md w-full shadow-[12px_12px_0px_#000000] relative flex flex-col items-center text-center overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Subtle Top Close Button */}
          <button
            type="button"
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 border-2 border-black flex items-center justify-center text-black cursor-pointer shadow-[1px_1px_0px_#000000] active:scale-90 transition-all z-10"
            title="Close"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>

          {/* Calming Organic Mascot Showcase (No heavy nested box) */}
          <div className="relative pt-1 pb-1 w-full flex flex-col items-center">
            <motion.div 
              animate={{ y: [0, -6, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="w-52 h-52 sm:w-60 sm:h-60 flex items-center justify-center relative"
            >
              <img 
                src={capyMascot} 
                alt="Chill Recovery Capybara" 
                className="w-full h-full object-contain filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.12)]" 
              />
            </motion.div>

            {/* Pill Tag */}
            <div className="mt-1 px-3 py-1 rounded-full bg-[#00E599] border-2 border-black font-mono text-[11px] font-black uppercase shadow-[2px_2px_0px_#000000] flex items-center gap-1.5 text-black">
              <Heart className="w-3.5 h-3.5 fill-black" />
              <span>BREATHE & RESET</span>
            </div>
          </div>

          {/* Emotional, Grounding Typography */}
          <div className="space-y-2 mt-4 px-1">
            <h3 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight text-black leading-tight">
              You've Carried A Lot.
            </h3>
            <p className="text-sm font-mono text-neutral-800 font-bold leading-relaxed">
              Don't be hard on yourself today. Two rough days don't define your worth or erase what you're capable of.
            </p>
          </div>

          {/* Genuine Brotherly Belief Banner */}
          <div className="w-full mt-4 p-4 rounded-2xl bg-[#FFF8E7] border-2 border-black text-left shadow-[2px_2px_0px_#000000]">
            <p className="font-mono text-xs text-neutral-800 leading-relaxed font-bold">
              Bhai, you are not broken. You are the solution. Sip some water, rest easy tonight, and let's take tomorrow one calm win at a time. I believe in you.
            </p>
          </div>

          {/* Decisive Single Button */}
          <button
            type="button"
            onClick={() => {
              soundEngine.playSuccessChime();
              onClose();
            }}
            className="w-full mt-5 py-3.5 sm:py-4 bg-[#FDC800] hover:bg-amber-400 border-3 border-black rounded-2xl font-display font-black text-sm uppercase text-black shadow-[4px_4px_0px_#000000] cursor-pointer flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <span>I'm Ready — Let's Fix This Bhai</span>
            <ArrowRight className="w-4 h-4 stroke-3" />
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

