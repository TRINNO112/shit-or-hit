import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Check, X, Moon, Sun } from 'lucide-react';

export default function RadialClockPicker({
  isOpen,
  onClose,
  initialTime = '21:00',
  onSave
}) {
  // Parse initial 24h time into 12h + AM/PM
  const parseTime = (timeStr) => {
    const [h, m] = (timeStr || '21:00').split(':').map(Number);
    const isPM = h >= 12;
    const hour12 = h % 12 === 0 ? 12 : h % 12;
    return {
      hour: hour12,
      minute: m || 0,
      period: isPM ? 'PM' : 'AM'
    };
  };

  const [timeState, setTimeState] = useState(() => parseTime(initialTime));
  const [activeMode, setActiveMode] = useState('hours'); // 'hours' | 'minutes'

  if (!isOpen) return null;

  const hoursList = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  const minutesList = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

  // Calculate clock hand angle in degrees from 12 o'clock
  const currentAngle = activeMode === 'hours'
    ? ((timeState.hour % 12) / 12) * 360
    : ((timeState.minute % 60) / 60) * 360;

  const handleConfirm = () => {
    let finalHour = timeState.hour;
    if (timeState.period === 'PM' && finalHour < 12) finalHour += 12;
    if (timeState.period === 'AM' && finalHour === 12) finalHour = 0;

    const formatted = `${String(finalHour).padStart(2, '0')}:${String(timeState.minute).padStart(2, '0')}`;
    onSave(formatted);
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.92, y: 15 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.92, y: 15 }}
          className="w-full max-w-xs bg-[#FFFDF5] rounded-3xl border-3 border-black p-5 shadow-[6px_6px_0px_#000000] space-y-4 text-center select-none"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b-2 border-black/10 pb-2.5">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-black stroke-[2.5]" />
              <h3 className="font-display font-black text-base uppercase text-black">
                Set Reminder Clock
              </h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-neutral-200 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Digital Time Preview & Mode Selector */}
          <div className="flex items-center justify-center gap-2 bg-neutral-100 border-2 border-black p-2 rounded-2xl">
            {/* Hours Box */}
            <button
              type="button"
              onClick={() => setActiveMode('hours')}
              className={`px-3 py-1.5 rounded-xl font-display font-black text-2xl cursor-pointer transition-all ${
                activeMode === 'hours'
                  ? 'bg-[#FDC800] text-black border-2 border-black shadow-[2px_2px_0px_#000000]'
                  : 'bg-white text-neutral-600 border border-black/20'
              }`}
            >
              {String(timeState.hour).padStart(2, '0')}
            </button>

            <span className="font-display font-black text-2xl text-black">:</span>

            {/* Minutes Box */}
            <button
              type="button"
              onClick={() => setActiveMode('minutes')}
              className={`px-3 py-1.5 rounded-xl font-display font-black text-2xl cursor-pointer transition-all ${
                activeMode === 'minutes'
                  ? 'bg-[#FDC800] text-black border-2 border-black shadow-[2px_2px_0px_#000000]'
                  : 'bg-white text-neutral-600 border border-black/20'
              }`}
            >
              {String(timeState.minute).padStart(2, '0')}
            </button>

            {/* AM / PM Toggle */}
            <div className="flex flex-col gap-1 ml-1.5">
              <button
                type="button"
                onClick={() => setTimeState(prev => ({ ...prev, period: 'AM' }))}
                className={`px-2 py-0.5 rounded-lg font-mono text-xs font-black cursor-pointer border ${
                  timeState.period === 'AM'
                    ? 'bg-black text-[#FDC800] border-black'
                    : 'bg-white text-neutral-500 border-black/20'
                }`}
              >
                AM
              </button>
              <button
                type="button"
                onClick={() => setTimeState(prev => ({ ...prev, period: 'PM' }))}
                className={`px-2 py-0.5 rounded-lg font-mono text-xs font-black cursor-pointer border ${
                  timeState.period === 'PM'
                    ? 'bg-black text-[#FDC800] border-black'
                    : 'bg-white text-neutral-500 border-black/20'
                }`}
              >
                PM
              </button>
            </div>
          </div>

          {/* ⏰ Radial Dial Clock Face (220px Diameter, Exact 80px Radius) */}
          <div className="relative w-56 h-56 mx-auto rounded-full bg-white border-3 border-black shadow-[3px_3px_0px_#000000] flex items-center justify-center overflow-visible">
            
            {/* Rotating Clock Hand with Center-Pivot & Pointer Bulb */}
            <div
              className="absolute pointer-events-none transition-transform duration-200 z-10"
              style={{
                left: '50%',
                top: '50%',
                width: '2px',
                height: '80px',
                transformOrigin: '50% 100%',
                transform: `translate(-50%, -100%) rotate(${currentAngle}deg)`
              }}
            >
              {/* Hand Line */}
              <div className="w-full h-full bg-black" />

              {/* Hand Tip Glowing Pointer Bulb (Centered dead on radius) */}
              <div 
                className="absolute w-8 h-8 rounded-full bg-[#00E599] border-2 border-black shadow-[1.5px_1.5px_0px_#000000] flex items-center justify-center -top-4 -left-[15px]"
              >
                <div className="w-2 h-2 rounded-full bg-black" />
              </div>
            </div>

            {/* Center Pin */}
            <div className="absolute w-3.5 h-3.5 rounded-full bg-black z-20 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

            {/* Circular Number Markers (Precise Geometry) */}
            {(activeMode === 'hours' ? hoursList : minutesList).map((val, idx) => {
              // 12 o'clock is index 0 -> angle -90deg
              const angleDeg = (idx * 30) - 90;
              const angleRad = (angleDeg * Math.PI) / 180;
              const radius = 80;
              const x = Math.round(radius * Math.cos(angleRad));
              const y = Math.round(radius * Math.sin(angleRad));

              const isSelected = activeMode === 'hours'
                ? timeState.hour === val
                : timeState.minute === val;

              return (
                <button
                  key={val}
                  type="button"
                  onClick={() => {
                    if (activeMode === 'hours') {
                      setTimeState(prev => ({ ...prev, hour: val }));
                      setActiveMode('minutes');
                    } else {
                      setTimeState(prev => ({ ...prev, minute: val }));
                    }
                  }}
                  style={{
                    left: '50%',
                    top: '50%',
                    transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`
                  }}
                  className={`absolute w-8 h-8 rounded-full flex items-center justify-center font-mono text-xs font-black cursor-pointer transition-all z-20 ${
                    isSelected
                      ? 'text-black font-black scale-110'
                      : 'text-neutral-800 hover:bg-neutral-100/80'
                  }`}
                >
                  {val === 0 ? '00' : val}
                </button>
              );
            })}
          </div>

          {/* Quick Presets */}
          <div className="grid grid-cols-4 gap-1.5 pt-1">
            {[
              { l: '8 PM', h: 8, p: 'PM' },
              { l: '9 PM', h: 9, p: 'PM' },
              { l: '10 PM', h: 10, p: 'PM' },
              { l: '11 PM', h: 11, p: 'PM' }
            ].map(item => (
              <button
                key={item.l}
                type="button"
                onClick={() => setTimeState({ hour: item.h, minute: 0, period: item.p })}
                className="py-1 bg-neutral-100 hover:bg-[#FDC800] border border-black rounded-lg font-mono text-[10px] font-black cursor-pointer"
              >
                {item.l}
              </button>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-1 border-t border-black/10">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 bg-neutral-200 hover:bg-neutral-300 text-black font-mono text-xs font-bold rounded-xl border border-black cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="flex-1 py-2 bg-[#00E599] hover:bg-emerald-400 text-black font-display font-black text-xs uppercase rounded-xl border-2 border-black shadow-[2px_2px_0px_#000000] cursor-pointer"
            >
              SET TIME
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
