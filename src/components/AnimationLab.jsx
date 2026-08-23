import React, { useState, useRef, useEffect } from 'react';
import { 
  motion, 
  AnimatePresence, 
  useMotionValue, 
  useTransform, 
  useSpring 
} from 'framer-motion';
import { 
  X, 
  Sparkles, 
  Zap, 
  Flame, 
  AlertCircle, 
  CloudRain, 
  MinusCircle, 
  Check, 
  PenLine, 
  Compass, 
  Layers, 
  Move3d, 
  Volume2, 
  VolumeX,
  ChevronRight,
  Maximize2
} from 'lucide-react';
import confetti from 'canvas-confetti';

// ==========================================
// 1. DIRECTION 1: KINETIC CYBER-PUNCH
// ==========================================

function KineticCyberPunchDemo() {
  const [selectedMood, setSelectedMood] = useState(5);
  const [streakCount, setStreakCount] = useState(14);
  const [hitRate, setHitRate] = useState(88);
  const [shockwaves, setShockwaves] = useState([]);

  // 3D Magnetic Tilt Values
  const cardRef = useRef(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-150, 150], [12, -12]), { stiffness: 200, damping: 20 });
  const rotateY = useSpring(useTransform(mouseX, [-200, 200], [-14, 14]), { stiffness: 200, damping: 20 });

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    mouseX.set(e.clientX - centerX);
    mouseY.set(e.clientY - centerY);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const handleMoodClick = (val, e) => {
    setSelectedMood(val);
    
    // Trigger Shockwave ring
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const newWave = { id: Date.now(), x, y, color: moods[val].bg };
      setShockwaves(prev => [...prev, newWave]);
      setTimeout(() => {
        setShockwaves(prev => prev.filter(w => w.id !== newWave.id));
      }, 700);
    }

    if (val >= 4) {
      confetti({
        particleCount: val === 5 ? 60 : 35,
        spread: 60,
        origin: { y: 0.6 },
        colors: [moods[val].bg, '#000000', '#FDC800', '#00E599']
      });
    }
  };

  const moods = {
    1: { title: 'Rough', icon: AlertCircle, bg: '#FF4D4D', desc: 'Friction point day' },
    2: { title: 'Down', icon: CloudRain, bg: '#FF8A00', desc: 'Low energy day' },
    3: { title: 'Okay', icon: MinusCircle, bg: '#E2E8F0', desc: 'Steady baseline' },
    4: { title: 'Good', icon: Zap, bg: '#00E599', desc: 'Sharp high momentum' },
    5: { title: 'Peak', icon: Sparkles, bg: '#FDC800', desc: 'Flawless execution' }
  };

  return (
    <div className="space-y-6">
      {/* Description Banner */}
      <div className="p-4 rounded-xl border-2 border-black bg-[#FFFDF5] shadow-[3px_3px_0px_#000000]">
        <div className="flex items-center gap-2 font-display font-black text-sm text-black uppercase">
          <Move3d className="w-4 h-4 text-black stroke-[3]" />
          <span>Direction 1: Kinetic Cyber-Punch Highlights</span>
        </div>
        <p className="text-xs font-mono text-neutral-700 mt-1">
          • Hover over the card to experience <strong>True 3D Cursor Perspective Tilting</strong>.<br />
          • Click the chunky rating buttons for <strong>Spring Squash-and-Stretch</strong> and <strong>Expanding Shockwave Rings</strong>.<br />
          • The verdict pill uses <strong>Framer Motion layoutId Morphing</strong>.
        </p>
      </div>

      {/* 3D Interactive Card Container */}
      <div style={{ perspective: 1000 }} className="flex justify-center">
        <motion.div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
          className="neo-card w-full max-w-2xl bg-white relative overflow-hidden select-none cursor-crosshair"
        >
          {/* Reactive Shockwaves */}
          {shockwaves.map(wave => (
            <motion.span
              key={wave.id}
              initial={{ scale: 0, opacity: 0.8 }}
              animate={{ scale: 6, opacity: 0 }}
              transition={{ duration: 0.65, ease: 'easeOut' }}
              style={{
                position: 'absolute',
                left: wave.x - 25,
                top: wave.y - 25,
                width: 50,
                height: 50,
                borderRadius: '50%',
                border: `4px solid ${wave.color}`,
                backgroundColor: `${wave.color}22`,
                pointerEvents: 'none',
                zIndex: 20
              }}
            />
          ))}

          {/* Top Row: Date & Flame Booster */}
          <div className="flex items-center justify-between mb-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black text-white text-xs font-mono font-black shadow-[2px_2px_0px_#FDC800]">
              <span>TODAY</span>
              <span>•</span>
              <span>DAY 14</span>
            </div>

            {/* Alive Flame Badge with Spring Bounce */}
            <motion.button
              whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setStreakCount(c => c + 1)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#00E599] border-2 border-black text-xs font-mono font-black shadow-[3px_3px_0px_#000000] cursor-pointer"
            >
              <motion.div
                animate={{ scale: [1, 1.25, 1], rotate: [0, 8, -8, 0] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
              >
                <Flame className="w-4 h-4 text-black fill-black" />
              </motion.div>
              <span>{streakCount} DAY STREAK (TAP +)</span>
            </motion.button>
          </div>

          <h3 className="font-display font-black text-3xl sm:text-4xl text-black uppercase tracking-tight">
            SUNDAY, AUGUST 23
          </h3>
          <p className="text-xs font-mono text-neutral-600 font-bold mt-1 mb-6">
            Tap a mood below to test kinetic squash & stretch physics
          </p>

          {/* 5 Tactile Spring Rating Buttons */}
          <div className="grid grid-cols-5 gap-3 mb-8">
            {[1, 2, 3, 4, 5].map((val) => {
              const m = moods[val];
              const SvgIcon = m.icon;
              const isSelected = selectedMood === val;

              return (
                <motion.button
                  key={val}
                  type="button"
                  whileHover={{ scale: 1.08, y: -4, rotate: (val - 3) * 1.5 }}
                  whileTap={{ scale: 0.85, rotate: (val - 3) * -3 }}
                  transition={{ type: 'spring', stiffness: 450, damping: 15 }}
                  onClick={(e) => handleMoodClick(val, e)}
                  className={`neo-btn flex flex-col items-center justify-center p-3 relative cursor-pointer ${
                    isSelected ? 'ring-4 ring-black' : ''
                  }`}
                  style={{ backgroundColor: isSelected ? m.bg : '#FFFFFF' }}
                >
                  {/* Selection Indicator Ring */}
                  {isSelected && (
                    <motion.div
                      layoutId="cyber-outline"
                      className="absolute inset-0 rounded-2xl border-[3px] border-black pointer-events-none"
                      transition={{ type: 'spring', stiffness: 500, damping: 28 }}
                    />
                  )}

                  <div 
                    className="w-10 h-10 rounded-xl border-2 border-black flex items-center justify-center mb-1.5 shadow-[2px_2px_0px_#000000]"
                    style={{ backgroundColor: m.bg }}
                  >
                    <SvgIcon className="w-5 h-5 text-black stroke-[2.5]" />
                  </div>

                  <span className="font-display font-black text-xs uppercase">{m.title}</span>
                  <span className="text-[10px] font-mono font-bold text-neutral-700">{val}/5</span>
                </motion.button>
              );
            })}
          </div>

          {/* Morphing LayoutId Active Verdict Indicator */}
          <div className="pt-4 border-t-2 border-black/10 flex items-center justify-between">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedMood}
                initial={{ opacity: 0, y: 15, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -15, scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-black text-xs font-mono font-bold text-black shadow-[3px_3px_0px_#000000]"
                style={{ backgroundColor: moods[selectedMood]?.bg }}
              >
                <span>VERDICT: <strong className="uppercase">{moods[selectedMood]?.title}</strong> — {moods[selectedMood]?.desc}</span>
              </motion.div>
            </AnimatePresence>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setHitRate(h => Math.min(100, h + 2))}
              className="text-xs font-mono font-black text-black bg-[#FDC800] border-2 border-black px-3 py-1.5 rounded-lg shadow-[2px_2px_0px_#000000] cursor-pointer"
            >
              HIT RATE: {hitRate}%
            </motion.button>
          </div>

        </motion.div>
      </div>
    </div>
  );
}

// ==========================================
// 2. DIRECTION 2: MORPHING VECTOR ART & CINEMA
// ==========================================

function MorphingVectorArtDemo() {
  const [sliderVal, setSliderVal] = useState(3);
  const [isNotesExpanded, setIsNotesExpanded] = useState(false);

  // SVG Paths for morphing moods
  const moodPaths = {
    1: "M12 2L2 22h20L12 2zm0 6l1 7h-2l1-7zm0 10a1.5 1.5 0 110-3 1.5 1.5 0 010 3z", // Warning Triangle
    2: "M6 19a4 4 0 01-4-4 4 4 0 014-4h.5A6 6 0 0118 9a4.5 4.5 0 014 4.5 4.5 4.5 0 01-4.5 4.5H6z", // Cloud
    3: "M4 12h16M4 12a8 8 0 1016 0A8 8 0 004 12z", // Neutral Circle
    4: "M13 2L3 14h9l-1 8 10-12h-9l1-8z", // Lightning Bolt
    5: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" // Glowing Star
  };

  const moodColors = {
    1: '#FF4D4D',
    2: '#FF8A00',
    3: '#E2E8F0',
    4: '#00E599',
    5: '#FDC800'
  };

  const moodNames = {
    1: 'Rough Storm (1/5)',
    2: 'Downpour (2/5)',
    3: 'Equilibrium (3/5)',
    4: 'High Current (4/5)',
    5: 'Apex Zenith (5/5)'
  };

  const sampleJournalText = [
    "• Focused deeply for 4 straight hours without context switching.",
    "• Eliminated bottlenecks in production builds.",
    "• Maintained steady discipline through challenging milestones."
  ];

  return (
    <div className="space-y-6">
      {/* Description Banner */}
      <div className="p-4 rounded-xl border-2 border-black bg-[#FFFDF5] shadow-[3px_3px_0px_#000000]">
        <div className="flex items-center gap-2 font-display font-black text-sm text-black uppercase">
          <Compass className="w-4 h-4 text-black stroke-[3]" />
          <span>Direction 2: Morphing Vector Art Highlights</span>
        </div>
        <p className="text-xs font-mono text-neutral-700 mt-1">
          • Drag the slider below to witness <strong>Fluid Dynamic SVG Path Morphing</strong>.<br />
          • Toggle the reflection card for <strong>Kinetic Stagger Typography Reveals</strong>.<br />
          • Elastic spring-unrolling container physics.
        </p>
      </div>

      <div className="neo-card bg-white w-full max-w-2xl mx-auto space-y-6">
        
        {/* Morphing Vector Graphic Stage */}
        <div className="flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-black bg-[#FFFDF5] shadow-[3px_3px_0px_#000000] relative">
          
          <motion.div
            animate={{ 
              scale: [1, 1.05, 1],
              rotate: (sliderVal - 3) * 6
            }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="w-24 h-24 rounded-2xl border-2 border-black flex items-center justify-center shadow-[4px_4px_0px_#000000] mb-4"
            style={{ backgroundColor: moodColors[sliderVal] }}
          >
            <svg viewBox="0 0 24 24" className="w-12 h-12 stroke-black fill-black" strokeWidth="2">
              <motion.path
                d={moodPaths[sliderVal]}
                animate={{ d: moodPaths[sliderVal] }}
                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              />
            </svg>
          </motion.div>

          <motion.h4
            key={sliderVal}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display font-black text-2xl uppercase tracking-tight"
          >
            {moodNames[sliderVal]}
          </motion.h4>

          {/* Interactive Mood Slider */}
          <div className="w-full max-w-md mt-6 space-y-2">
            <div className="flex justify-between text-xs font-mono font-bold text-neutral-600">
              <span>1: Rough</span>
              <span>3: Okay</span>
              <span>5: Peak</span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              step="1"
              value={sliderVal}
              onChange={(e) => setSliderVal(Number(e.target.value))}
              className="w-full accent-black cursor-pointer h-3 bg-neutral-200 border-2 border-black rounded-lg"
            />
          </div>

        </div>

        {/* Kinetic Stagger Typography Reflection Card */}
        <div className="border-t-2 border-black/10 pt-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-black uppercase text-black">
              Kinetic Typography Unroll Demo
            </span>
            <button
              onClick={() => setIsNotesExpanded(!isNotesExpanded)}
              className="neo-btn text-xs font-mono font-black px-3 py-1 bg-[#FDC800] text-black cursor-pointer shadow-[2px_2px_0px_#000000]"
            >
              {isNotesExpanded ? 'Collapse' : 'Expand Reflection'}
            </button>
          </div>

          <AnimatePresence>
            {isNotesExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="overflow-hidden p-4 rounded-xl border-2 border-black bg-neutral-50 shadow-[2px_2px_0px_#000000] space-y-2"
              >
                {sampleJournalText.map((line, idx) => (
                  <motion.p
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.15, type: 'spring', stiffness: 350, damping: 20 }}
                    className="text-xs font-mono font-bold text-black"
                  >
                    {line}
                  </motion.p>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}

// ==========================================
// 3. DIRECTION 3: LINEAR / RAYCAST PRECISION
// ==========================================

function LinearPrecisionDemo() {
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [magneticPos, setMagneticPos] = useState({ x: 0, y: 0 });
  const magnetButtonRef = useRef(null);

  const sampleDays = [
    { id: 'd1', day: 12, rating: 5, mood: 'Peak', bg: '#FDC800', note: 'Crushed the sprint release without bugs.' },
    { id: 'd2', day: 13, rating: 4, mood: 'Good', bg: '#00E599', note: 'Refactored backend architecture.' },
    { id: 'd3', day: 14, rating: 2, mood: 'Down', bg: '#FF8A00', note: 'Heavy meeting fatigue afternoon.' }
  ];

  const handleMagneticMove = (e) => {
    if (!magnetButtonRef.current) return;
    const rect = magnetButtonRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const distanceX = e.clientX - centerX;
    const distanceY = e.clientY - centerY;
    
    // Magnetic pull threshold: 80px
    const distance = Math.hypot(distanceX, distanceY);
    if (distance < 80) {
      setMagneticPos({ x: distanceX * 0.35, y: distanceY * 0.35 });
    } else {
      setMagneticPos({ x: 0, y: 0 });
    }
  };

  const handleMagneticLeave = () => {
    setMagneticPos({ x: 0, y: 0 });
  };

  return (
    <div className="space-y-6" onMouseMove={handleMagneticMove} onMouseLeave={handleMagneticLeave}>
      {/* Description Banner */}
      <div className="p-4 rounded-xl border-2 border-black bg-[#FFFDF5] shadow-[3px_3px_0px_#000000]">
        <div className="flex items-center gap-2 font-display font-black text-sm text-black uppercase">
          <Layers className="w-4 h-4 text-black stroke-[3]" />
          <span>Direction 3: Linear / Raycast Precision Highlights</span>
        </div>
        <p className="text-xs font-mono text-neutral-700 mt-1">
          • Click any mini day card below to test <strong>Shared-Element LayoutId Expansion</strong> (the card physically morphs into the modal with zero jarring jumps).<br />
          • Hover around the Magnetic Button below to test <strong>Magnetic Cursor Physics</strong>.
        </p>
      </div>

      {/* Shared Element Day Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {sampleDays.map((day) => (
          <motion.div
            key={day.id}
            layoutId={`card-${day.id}`}
            onClick={() => setSelectedCardId(day.id)}
            whileHover={{ y: -4, shadow: '6px 6px 0px #000000' }}
            whileTap={{ scale: 0.96 }}
            className="p-5 rounded-2xl border-2 border-black bg-white shadow-[3px_3px_0px_#000000] cursor-pointer flex flex-col justify-between h-36 relative"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-black bg-black text-white px-2 py-0.5 rounded">
                DAY {day.day}
              </span>
              <span 
                className="text-[10px] font-display font-black uppercase px-2 py-0.5 rounded border border-black"
                style={{ backgroundColor: day.bg }}
              >
                {day.mood}
              </span>
            </div>

            <p className="text-xs font-mono text-neutral-700 line-clamp-2 font-semibold">
              "{day.note}"
            </p>

            <div className="flex items-center justify-between text-[10px] font-mono font-bold text-neutral-500">
              <span>Click to expand</span>
              <Maximize2 className="w-3 h-3 text-black" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Expanded Shared-Element Modal */}
      <AnimatePresence>
        {selectedCardId && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
            onClick={() => setSelectedCardId(null)}
          >
            {sampleDays.filter(d => d.id === selectedCardId).map(day => (
              <motion.div
                key={day.id}
                layoutId={`card-${day.id}`}
                className="neo-card w-full max-w-lg bg-white relative z-50"
                style={{ padding: '32px 36px' }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between pb-4 mb-4 border-b-2 border-black/10">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center font-mono font-black text-xs shadow-[2px_2px_0px_#FDC800]">
                      D{day.day}
                    </span>
                    <div>
                      <h4 className="font-display font-black text-xl text-black uppercase">
                        DAY {day.day} REFLECTION
                      </h4>
                      <span className="text-xs font-mono font-bold text-neutral-600">
                        Shared Element Morph Active
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedCardId(null)}
                    className="neo-btn p-2 bg-red-100 hover:bg-red-200 text-black cursor-pointer"
                  >
                    <X className="w-4 h-4 stroke-[3]" />
                  </button>
                </div>

                <div 
                  className="p-4 rounded-xl border-2 border-black mb-4 font-mono text-xs font-bold"
                  style={{ backgroundColor: day.bg }}
                >
                  VERDICT: {day.mood} ({day.rating}/5)
                </div>

                <div className="p-4 rounded-xl border-2 border-black bg-neutral-50 mb-6 font-mono text-xs text-neutral-800 leading-relaxed font-semibold">
                  "{day.note}"
                </div>

                <button
                  onClick={() => setSelectedCardId(null)}
                  className="neo-btn w-full py-2.5 bg-[#00E599] text-black font-mono font-black text-xs cursor-pointer shadow-[3px_3px_0px_#000000]"
                >
                  CLOSE DIALOG (SMOOTH RE-COLLAPSE)
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Magnetic Cursor Pull Demo Button */}
      <div className="p-6 rounded-2xl border-2 border-black bg-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="font-display font-black text-sm text-black uppercase block">
            Magnetic Cursor Attraction Demo
          </span>
          <span className="text-xs font-mono text-neutral-600">
            Move cursor near the button to feel magnetic attraction
          </span>
        </div>

        <motion.button
          ref={magnetButtonRef}
          animate={{ x: magneticPos.x, y: magneticPos.y }}
          transition={{ type: 'spring', stiffness: 350, damping: 18 }}
          className="neo-btn px-6 py-3 bg-[#FDC800] text-black font-mono font-black text-xs shadow-[3px_3px_0px_#000000] cursor-pointer"
        >
          MAGNETIC PULL BUTTON
        </motion.button>
      </div>

    </div>
  );
}

// ==========================================
// MAIN ANIMATION LAB MODAL CONTAINER
// ==========================================

export default function AnimationLab({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState(1);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 30 }}
        transition={{ type: 'spring', stiffness: 320, damping: 24 }}
        className="neo-card w-full max-w-4xl bg-white my-auto max-h-[92vh] flex flex-col justify-between overflow-hidden relative"
        style={{ padding: '28px 32px' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Studio Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 mb-6 border-b-2 border-black/10 gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#FDC800] border-2 border-black flex items-center justify-center shadow-[3px_3px_0px_#000000]">
              <Zap className="w-6 h-6 text-black stroke-[3] fill-black" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display font-black text-2xl text-black uppercase leading-none">
                  ANIMATION STUDIO LAB
                </h2>
                <span className="px-2 py-0.5 rounded bg-black text-white font-mono text-[10px] font-black">
                  FRAMER MOTION
                </span>
              </div>
              <p className="text-xs font-mono font-bold text-neutral-600 mt-1">
                Interact with all 3 distinct animation directions live to pick the best fit.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="neo-btn px-4 py-2 bg-[#FF4D4D] hover:bg-red-400 text-black flex items-center gap-1.5 cursor-pointer self-end sm:self-auto shadow-[2px_2px_0px_#000000]"
          >
            <X className="w-4 h-4 stroke-[3]" />
            <span className="font-mono text-xs font-black">CLOSE LAB</span>
          </button>
        </div>

        {/* 3 Tab Switchers */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-6 shrink-0">
          <button
            onClick={() => setActiveTab(1)}
            className={`neo-btn py-3 px-4 flex items-center justify-center gap-2 text-xs font-mono font-black cursor-pointer transition-all ${
              activeTab === 1 
                ? 'bg-[#FDC800] ring-2 ring-black shadow-[3px_3px_0px_#000000]' 
                : 'bg-white hover:bg-neutral-50 opacity-75'
            }`}
          >
            <Move3d className="w-4 h-4" />
            <span>1. KINETIC CYBER-PUNCH</span>
          </button>

          <button
            onClick={() => setActiveTab(2)}
            className={`neo-btn py-3 px-4 flex items-center justify-center gap-2 text-xs font-mono font-black cursor-pointer transition-all ${
              activeTab === 2 
                ? 'bg-[#00E599] ring-2 ring-black shadow-[3px_3px_0px_#000000]' 
                : 'bg-white hover:bg-neutral-50 opacity-75'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>2. MORPHING VECTOR ART</span>
          </button>

          <button
            onClick={() => setActiveTab(3)}
            className={`neo-btn py-3 px-4 flex items-center justify-center gap-2 text-xs font-mono font-black cursor-pointer transition-all ${
              activeTab === 3 
                ? 'bg-[#00D8F6] ring-2 ring-black shadow-[3px_3px_0px_#000000]' 
                : 'bg-white hover:bg-neutral-50 opacity-75'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>3. LINEAR PRECISION</span>
          </button>
        </div>

        {/* Active Playground Viewport */}
        <div className="overflow-y-auto pr-1 flex-1">
          {activeTab === 1 && <KineticCyberPunchDemo />}
          {activeTab === 2 && <MorphingVectorArtDemo />}
          {activeTab === 3 && <LinearPrecisionDemo />}
        </div>

        {/* Footer Guidance */}
        <div className="mt-4 pt-3.5 border-t-2 border-black/10 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-mono font-bold text-neutral-600 shrink-0">
          <span>💡 Test each tab above, then let me know which style you'd like to roll out across the app!</span>
          <span className="bg-black text-white px-2 py-0.5 rounded font-black text-[10px]">
            ACTIVE: DIRECTION {activeTab}
          </span>
        </div>

      </motion.div>
    </div>
  );
}
