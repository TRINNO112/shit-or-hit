import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Shield, 
  Check, 
  Sparkles, 
  RotateCcw, 
  Plus, 
  Trash2, 
  Sliders, 
  CheckCircle2,
  ListTodo,
  Scale,
  Gauge,
  Award,
  Flame
} from 'lucide-react';
import { soundEngine } from '../services/soundEngine';
import { 
  CUSTOM_TEMPLATES_KEY,
  DEFAULT_ANCHORS,
  ANCHOR_ICON_OPTIONS,
  isNonNegotiablesActive,
  setNonNegotiablesActive,
  getNonNegotiablesMode,
  setNonNegotiablesMode,
  renderAnchorIcon
} from './NonNegotiableCard';

export default function NonNegotiablesStudioModal({ isOpen, onClose, onSettingsChanged }) {
  const [active, setActive] = useState(() => isNonNegotiablesActive());
  const [currentMode, setCurrentMode] = useState(() => getNonNegotiablesMode());
  const [anchors, setAnchors] = useState(() => {
    try {
      const saved = localStorage.getItem(CUSTOM_TEMPLATES_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_ANCHORS;
    } catch {
      return DEFAULT_ANCHORS;
    }
  });
  const [activeIconPickerIdx, setActiveIconPickerIdx] = useState(null);
  const [activeTab, setActiveTab] = useState('modes'); // 'modes' | 'tasks' | 'math'

  useEffect(() => {
    if (isOpen) {
      setActive(isNonNegotiablesActive());
      setCurrentMode(getNonNegotiablesMode());
      try {
        const saved = localStorage.getItem(CUSTOM_TEMPLATES_KEY);
        setAnchors(saved ? JSON.parse(saved) : DEFAULT_ANCHORS);
      } catch {
        setAnchors(DEFAULT_ANCHORS);
      }
      setActiveIconPickerIdx(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleToggle = () => {
    const next = !active;
    setActive(next);
    setNonNegotiablesActive(next);
    soundEngine.playClick();
    if (onSettingsChanged) onSettingsChanged();
  };

  const handleModeSelect = (modeId) => {
    setCurrentMode(modeId);
    setNonNegotiablesMode(modeId);
    soundEngine.playClick();
    if (onSettingsChanged) onSettingsChanged();
  };

  const handleEqualSplit = () => {
    soundEngine.playClick();
    if (anchors.length === 0) return;
    const splitVal = Number((5.0 / anchors.length).toFixed(2));
    const equalized = anchors.map(a => ({
      ...a,
      utils: splitVal
    }));
    setAnchors(equalized);
    localStorage.setItem(CUSTOM_TEMPLATES_KEY, JSON.stringify(equalized));
    if (onSettingsChanged) onSettingsChanged();
  };

  const handleAddNewAnchor = () => {
    soundEngine.playClick();
    const newId = `anchor_${Date.now()}`;
    const defaultSplit = Number((5.0 / (anchors.length + 1)).toFixed(2));
    const updated = [
      ...anchors.map(a => ({ ...a, utils: defaultSplit })),
      { 
        id: newId, 
        title: 'New Habit Task', 
        iconId: 'zap', 
        color: '#FFD166', 
        utils: defaultSplit 
      }
    ];
    setAnchors(updated);
    localStorage.setItem(CUSTOM_TEMPLATES_KEY, JSON.stringify(updated));
    if (onSettingsChanged) onSettingsChanged();
  };

  const handleDeleteAnchor = (id) => {
    soundEngine.playClick();
    const updated = anchors.filter(a => a.id !== id);
    setAnchors(updated);
    localStorage.setItem(CUSTOM_TEMPLATES_KEY, JSON.stringify(updated));
    if (onSettingsChanged) onSettingsChanged();
  };

  const handleUpdateAnchor = (idx, field, value) => {
    const updated = [...anchors];
    updated[idx][field] = value;
    setAnchors(updated);
    localStorage.setItem(CUSTOM_TEMPLATES_KEY, JSON.stringify(updated));
    if (onSettingsChanged) onSettingsChanged();
  };

  const totalUtils = anchors.reduce((acc, curr) => acc + (Number(curr.utils) || 0), 0);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-5 bg-black/80 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.94, y: 15 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.94, y: 15 }}
          transition={{ type: 'spring', stiffness: 380, damping: 28 }}
          className="bg-[#FFFDF5] border-3 border-black rounded-3xl w-full max-w-2xl h-[94vh] sm:h-auto sm:max-h-[90vh] flex flex-col shadow-[8px_8px_0px_#000000] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
        
        {/* Clean, Non-Cramped Top Header */}
        <div className="p-3.5 sm:p-5 flex items-center justify-between bg-white border-b-3 border-black shrink-0">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-[#00E599] border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_#000000] shrink-0">
              <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-black stroke-[2.5]" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-display font-black text-base sm:text-lg uppercase tracking-tight text-black truncate">
                Non-Negotiables Studio
              </h3>
              <p className="text-[10px] sm:text-xs font-mono font-bold text-neutral-600 truncate">
                Habit accountability & point calibration
              </p>
            </div>
          </div>

          {/* Unified Single Switch & Close on Right */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleToggle}
              className={`px-3 py-1.5 rounded-xl border-2 border-black font-mono text-[11px] sm:text-xs font-black cursor-pointer shadow-[2px_2px_0px_#000000] active:scale-95 transition-all ${
                active ? 'bg-[#00E599] text-black' : 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300'
              }`}
            >
              {active ? 'SYSTEM ON' : 'SYSTEM OFF'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 sm:p-2 bg-white hover:bg-[#FF4D4D] hover:text-white border-2 border-black rounded-xl cursor-pointer shadow-[2px_2px_0px_#000000] active:scale-95 transition-all"
              title="Close"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* Horizontal Scrollable Pill Navigation Strip */}
        <div className="px-3 sm:px-6 py-2.5 bg-[#FAF8ED] border-b-3 border-black shrink-0 overflow-x-auto">
          <div className="flex items-center gap-1.5 min-w-max">
            {[
              { id: 'modes', label: '1. Modes', fullLabel: '1. Operating Modes', icon: Sliders },
              { id: 'tasks', label: '2. Habits', fullLabel: '2. Habit Templates', icon: CheckCircle2 },
              { id: 'math', label: '3. Points Guide', fullLabel: '3. Points Guide', icon: Sparkles }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id);
                  soundEngine.playClick();
                }}
                className={`py-1.5 px-3 sm:px-4 rounded-xl border-2 border-black font-display font-black text-[11px] sm:text-xs uppercase flex items-center gap-1.5 cursor-pointer transition-all ${
                  activeTab === tab.id
                    ? 'bg-black text-white shadow-[2px_2px_0px_#FDC800]'
                    : 'bg-white text-neutral-700 hover:text-black shadow-[1.5px_1.5px_0px_#000000]'
                }`}
              >
                <tab.icon className={`w-3.5 h-3.5 ${activeTab === tab.id ? 'text-[#FDC800]' : 'text-neutral-500'}`} />
                <span className="hidden sm:inline">{tab.fullLabel}</span>
                <span className="sm:hidden">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-3.5 sm:p-6 overflow-y-auto space-y-3.5 flex-1">
          
          {/* TAB 1: OPERATING MODES */}
          {activeTab === 'modes' && (
            <div className="space-y-3">
              {[
                {
                  id: 'checklist',
                  title: 'Mode 1: Standalone Checklist',
                  tag: '0% RATING IMPACT',
                  tagColor: 'bg-neutral-100 text-neutral-800',
                  icon: ListTodo,
                  accentColor: '#CBD5E1',
                  bullets: [
                    'Track habits for personal discipline only.',
                    'Zero change to your main 1-tap rating buttons.',
                    'Best if you just want a clean daily checklist.'
                  ]
                },
                {
                  id: 'hybrid_50_50',
                  title: 'Mode 2: 50/50 Hybrid Blend',
                  tag: '50% FEELING + 50% TASKS',
                  tagColor: 'bg-[#FDC800] text-black',
                  icon: Scale,
                  accentColor: '#FDC800',
                  bullets: [
                    '50% from how you emotionally felt (your star rating).',
                    '50% from completed habits score.',
                    'Best balance of emotional and practical execution.'
                  ]
                },
                {
                  id: 'deterministic_100',
                  title: 'Mode 3: 100% Task-Driven Engine',
                  tag: 'STRICT ACCOUNTABILITY',
                  tagColor: 'bg-[#FF4D4D] text-white',
                  icon: Gauge,
                  accentColor: '#FF6B6B',
                  bullets: [
                    'Your day rating is 100% calculated by tasks.',
                    'No guessing — completed habits tell the truth.',
                    'Gives exact decimal ratings like 3.5★, 4.0★, 5.0★.'
                  ]
                }
              ].map(m => {
                const isSelected = currentMode === m.id;
                const IconComponent = m.icon;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => handleModeSelect(m.id)}
                    className={`w-full p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl border-3 border-black text-left cursor-pointer transition-all relative ${
                      isSelected
                        ? 'bg-white shadow-[4px_4px_0px_#000000] ring-3 ring-black'
                        : 'bg-[#FAF8ED] hover:bg-white shadow-[2px_2px_0px_#000000] opacity-90'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Left Icon Box */}
                      <div 
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl border-2 border-black flex items-center justify-center shrink-0 shadow-[2px_2px_0px_#000000]"
                        style={{ backgroundColor: m.accentColor }}
                      >
                        <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 text-black stroke-[2.5]" />
                      </div>

                      {/* Info & Bullets */}
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center justify-between gap-1.5 flex-wrap">
                          <h4 className="font-display font-black text-xs sm:text-base uppercase text-black tracking-tight">
                            {m.title}
                          </h4>
                          <span className={`px-2 py-0.5 rounded-lg border border-black text-[8px] sm:text-[9px] font-mono font-black uppercase ${m.tagColor}`}>
                            {m.tag}
                          </span>
                        </div>

                        <ul className="text-[11px] sm:text-xs font-mono font-bold text-neutral-600 space-y-0.5">
                          {m.bullets.map((b, bIdx) => (
                            <li key={bIdx} className="flex items-center gap-1.5">
                              <span className="text-[#00E599] font-black">✔</span>
                              <span>{b}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Selected Radio Badge */}
                      {isSelected && (
                        <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-black text-white flex items-center justify-center shrink-0 shadow-[1px_1px_0px_#000000] mt-0.5">
                          <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-3" />
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* TAB 2: HABIT TEMPLATES MANAGER */}
          {activeTab === 'tasks' && (
            <div className="space-y-3.5">
              
              {/* Header Summary Card (Responsive Stacking to prevent wrapped text) */}
              <div className="p-3 sm:p-4 bg-white border-2 border-black rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-[2px_2px_0px_#000000]">
                <div className="flex items-center justify-between sm:justify-start gap-2">
                  <span className="font-display font-black text-xs sm:text-sm uppercase text-black">
                    Habits ({anchors.length})
                  </span>
                  <span className="text-xs font-mono font-black bg-[#FDC800] text-black px-2 py-0.5 rounded-lg border border-black">
                    Score: {totalUtils.toFixed(1)} / 5.0 PTS
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleEqualSplit}
                  className="w-full sm:w-auto px-3 py-1.5 bg-[#FAF8ED] hover:bg-[#FDC800] border-2 border-black rounded-xl text-xs font-mono font-black cursor-pointer flex items-center justify-center gap-1.5 shadow-[1.5px_1.5px_0px_#000000] active:scale-95 transition-all"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Equalize (5.0 Split)</span>
                </button>
              </div>

              {/* Task Cards List */}
              <div className="space-y-2.5">
                {anchors.map((item, idx) => (
                  <div key={item.id} className="p-2.5 sm:p-3 bg-white border-2 border-black rounded-2xl space-y-2 shadow-[2px_2px_0px_#000000]">
                    <div className="flex items-center gap-2">
                      
                      {/* Icon Selector Button */}
                      <button
                        type="button"
                        onClick={() => setActiveIconPickerIdx(activeIconPickerIdx === idx ? null : idx)}
                        className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl border-2 border-black flex items-center justify-center shrink-0 shadow-[1.5px_1.5px_0px_#000000] cursor-pointer hover:scale-105 transition-all"
                        style={{ backgroundColor: item.color || '#FDC800' }}
                        title="Click to Change Icon"
                      >
                        {renderAnchorIcon(item.iconId, "w-4 h-4 sm:w-5 sm:h-5 text-black stroke-[2.5]")}
                      </button>

                      {/* Title Input */}
                      <input
                        type="text"
                        value={item.title}
                        onChange={(e) => handleUpdateAnchor(idx, 'title', e.target.value)}
                        className="flex-1 px-2.5 py-1.5 sm:py-2 text-xs font-mono font-black border-2 border-black rounded-xl bg-[#FAF8ED] min-w-0 focus:bg-white"
                        placeholder={`Habit #${idx + 1}`}
                      />

                      {/* Utils Points */}
                      <div className="flex items-center gap-1 shrink-0">
                        <input
                          type="number"
                          step="0.1"
                          min="0.1"
                          max="5.0"
                          value={item.utils}
                          onChange={(e) => handleUpdateAnchor(idx, 'utils', Number(e.target.value))}
                          className="w-14 sm:w-16 px-1.5 py-1.5 sm:py-2 text-xs font-mono font-black text-center border-2 border-black rounded-xl bg-[#FAF8ED]"
                          title="Point Value"
                        />
                        <span className="text-[11px] sm:text-xs font-mono font-black text-neutral-700">pts</span>
                      </div>

                      {/* Delete Button */}
                      {anchors.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleDeleteAnchor(item.id)}
                          className="p-1.5 sm:p-2 text-red-600 hover:bg-red-100 rounded-xl border-2 border-red-300 cursor-pointer shrink-0 active:scale-95"
                          title="Delete task"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Infographic Vector Icon Picker */}
                    {activeIconPickerIdx === idx && (
                      <div className="p-2.5 bg-[#FAF8ED] border-2 border-black rounded-xl grid grid-cols-5 sm:grid-cols-9 gap-1.5 animate-fade-in shadow-[1.5px_1.5px_0px_#000000]">
                        {ANCHOR_ICON_OPTIONS.map((opt) => (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => {
                              handleUpdateAnchor(idx, 'iconId', opt.id);
                              handleUpdateAnchor(idx, 'color', opt.color);
                              setActiveIconPickerIdx(null);
                            }}
                            className={`p-2 rounded-xl border-2 border-black flex flex-col items-center justify-center gap-1 cursor-pointer transition-all hover:scale-105 ${
                              item.iconId === opt.id ? 'bg-black text-white shadow-[1.5px_1.5px_0px_#FDC800]' : 'bg-white text-black'
                            }`}
                            title={opt.label}
                          >
                            <opt.icon className={`w-4 h-4 ${item.iconId === opt.id ? 'text-[#FDC800]' : 'text-black'}`} />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Add Button */}
              <button
                type="button"
                onClick={handleAddNewAnchor}
                className="w-full py-2.5 sm:py-3 bg-white hover:bg-neutral-100 border-2 sm:border-3 border-dashed border-black rounded-2xl text-xs font-display font-black uppercase text-black flex items-center justify-center gap-2 cursor-pointer shadow-[2px_2px_0px_#000000] active:scale-95"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>+ ADD ANOTHER HABIT TASK</span>
              </button>
            </div>
          )}

          {/* TAB 3: EASY POINTS GUIDE */}
          {activeTab === 'math' && (
            <div className="space-y-3.5">
              
              {/* Game Analogy Box */}
              <div className="p-3.5 sm:p-5 bg-[#FAF8ED] border-3 border-black rounded-2xl sm:rounded-3xl space-y-2.5 shadow-[3px_3px_0px_#000000]">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🎮</span>
                  <div>
                    <h4 className="font-display font-black text-sm sm:text-base uppercase text-black">
                      How Points Work (Like a Quest!)
                    </h4>
                    <p className="text-[11px] sm:text-xs font-mono font-bold text-neutral-600">
                      Your full day score is calibrated out of 5.0 Stars.
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-white border-2 border-black rounded-xl space-y-1.5 text-[11px] sm:text-xs font-mono font-bold text-neutral-800">
                  <p>🌟 <strong>Full Quest = 5.0 Points (5 Stars)</strong>.</p>
                  <p>⚡ Each completed habit adds points to your score.</p>
                  <p>🏆 3 tasks = 1.67 points each.</p>
                  <p className="text-black bg-[#FDC800]/30 p-1.5 rounded-lg border border-black/20">
                    🚀 Finish all 3 tasks ➔ You collect <strong>1.67 + 1.67 + 1.67 = 5.0 Stars!</strong>
                  </p>
                </div>
              </div>

              {/* Two Examples */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="p-3.5 bg-[#EBFBF5] border-2 border-black rounded-2xl space-y-1 shadow-[2px_2px_0px_#000000]">
                  <div className="flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-emerald-700" />
                    <span className="font-display font-black text-xs uppercase text-emerald-950">
                      Example: Equal Split
                    </span>
                  </div>
                  <p className="text-[11px] sm:text-xs font-mono text-emerald-900 leading-relaxed">
                    Gym = 1.67 pts<br />
                    Water = 1.67 pts<br />
                    Study = 1.67 pts<br />
                    <strong>Total = 5.0 Stars</strong>
                  </p>
                </div>

                <div className="p-3.5 bg-[#FFF5F5] border-2 border-black rounded-2xl space-y-1 shadow-[2px_2px_0px_#000000]">
                  <div className="flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-red-600" />
                    <span className="font-display font-black text-xs uppercase text-red-950">
                      Example: Boss Priority
                    </span>
                  </div>
                  <p className="text-[11px] sm:text-xs font-mono text-red-900 leading-relaxed">
                    Gym (Heavy) = 2.5 pts<br />
                    Read 30m = 1.5 pts<br />
                    Water = 1.0 pt<br />
                    <strong>Total = 5.0 Stars</strong>
                  </p>
                </div>
              </div>

            </div>
          )}
        </div>

        {/* Fixed Footer Bar */}
        <div className="p-3 sm:p-4 border-t-3 border-black bg-white flex items-center justify-between shrink-0">
          <span className="text-[11px] font-mono font-bold text-neutral-600">
            💾 Auto-saved
          </span>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 sm:px-6 sm:py-2.5 bg-[#00E599] hover:bg-emerald-400 font-display font-black text-xs uppercase rounded-xl border-2 border-black shadow-[2.5px_2.5px_0px_#000000] cursor-pointer active:scale-95 transition-all flex items-center gap-1.5 text-black"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>SAVE & RETURN</span>
          </button>
        </div>

        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
