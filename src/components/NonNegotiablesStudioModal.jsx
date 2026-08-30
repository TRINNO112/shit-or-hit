import React, { useState, useEffect } from 'react';
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
  Zap,
  Flame,
  Dumbbell,
  Droplet,
  Brain,
  Code,
  BookOpen,
  Target,
  Moon,
  ListTodo,
  Scale,
  Gauge,
  HelpCircle,
  Award
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
        title: 'New Cornerstone Habit', 
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#FFFDF5] border-3 border-black rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-[8px_8px_0px_#000000] overflow-hidden">
        
        {/* Top Header Bar */}
        <div className="p-4 sm:p-5 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#00E599] border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_#000000] shrink-0">
              <Shield className="w-6 h-6 text-black stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-black text-lg uppercase tracking-tight text-black">
                  Non-Negotiables Studio
                </h3>
                <span className={`px-2.5 py-0.5 rounded-lg border-2 border-black text-[10px] font-mono font-black uppercase shadow-[1px_1px_0px_#000000] ${
                  active ? 'bg-[#00E599] text-black' : 'bg-neutral-200 text-neutral-600'
                }`}>
                  {active ? 'ACTIVE' : 'OFF'}
                </span>
              </div>
              <p className="text-xs font-mono font-bold text-neutral-600">
                Cornerstone habit engines & satisfaction calibration
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleToggle}
              className={`px-3.5 py-2 rounded-xl border-2 border-black font-mono text-xs font-black cursor-pointer shadow-[2px_2px_0px_#000000] active:scale-95 transition-all ${
                active ? 'bg-[#00E599] text-black' : 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300'
              }`}
            >
              {active ? 'SYSTEM ON' : 'SYSTEM OFF'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 bg-white hover:bg-[#FF4D4D] hover:text-white border-2 border-black rounded-xl cursor-pointer shadow-[2px_2px_0px_#000000] active:scale-95 transition-all"
            >
              <X className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* Seamless Unified Tab Pill Bar (No Horizontal Divider Stripes) */}
        <div className="px-4 sm:px-6 pb-3 bg-white border-b-3 border-black">
          <div className="flex items-center p-1.5 bg-[#FAF8ED] border-2 border-black rounded-2xl gap-1.5 overflow-x-auto shadow-[2px_2px_0px_#000000]">
            {[
              { id: 'modes', label: '1. Operating Modes', icon: Sliders },
              { id: 'tasks', label: '2. Habit Templates', icon: CheckCircle2 },
              { id: 'math', label: '3. Easy Points Guide', icon: Sparkles }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id);
                  soundEngine.playClick();
                }}
                className={`flex-1 min-w-max py-2 px-3.5 rounded-xl font-display font-black text-xs uppercase flex items-center justify-center gap-2 cursor-pointer transition-all ${
                  activeTab === tab.id
                    ? 'bg-black text-white shadow-[2px_2px_0px_#FDC800]'
                    : 'text-neutral-700 hover:text-black hover:bg-white/60'
                }`}
              >
                <tab.icon className={`w-3.5 h-3.5 ${activeTab === tab.id ? 'text-[#FDC800]' : 'text-neutral-500'}`} />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Studio Body Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          
          {/* TAB 1: OPERATING MODES */}
          {activeTab === 'modes' && (
            <div className="space-y-3.5">
              {[
                {
                  id: 'checklist',
                  title: 'Mode 1: Standalone Checklist',
                  tag: '0% RATING IMPACT',
                  tagColor: 'bg-neutral-100 text-neutral-800',
                  icon: ListTodo,
                  accentColor: '#CBD5E1',
                  bullets: [
                    'Track anchor habits for discipline only.',
                    'Zero change to your main 1-tap rating buttons.',
                    'Best if you just want a daily to-do checklist.'
                  ]
                },
                {
                  id: 'hybrid_50_50',
                  title: 'Mode 2: 50/50 Hybrid Blend Engine',
                  tag: '50% FEELING + 50% TASKS',
                  tagColor: 'bg-[#FDC800] text-black',
                  icon: Scale,
                  accentColor: '#FDC800',
                  bullets: [
                    'Half your score comes from how you emotionally felt (your star rating).',
                    'Half your score comes from tasks completed.',
                    'Best for balanced days where mindset + execution both matter.'
                  ]
                },
                {
                  id: 'deterministic_100',
                  title: 'Mode 3: 100% Task-Driven Engine',
                  tag: 'STRICT TASK ACCOUNTABILITY',
                  tagColor: 'bg-[#FF4D4D] text-white',
                  icon: Gauge,
                  accentColor: '#FF6B6B',
                  bullets: [
                    'Your day rating is 100% calculated by your tasks.',
                    'No guessing how your day went — tasks tell the truth.',
                    'Supports precise ratings like 3.5★, 4.0★, 4.5★, 5.0★.'
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
                    className={`w-full p-4 rounded-3xl border-3 border-black text-left cursor-pointer transition-all relative ${
                      isSelected
                        ? 'bg-white shadow-[5px_5px_0px_#000000] scale-[1.01] ring-3 ring-black'
                        : 'bg-[#FAF8ED] hover:bg-white shadow-[2.5px_2.5px_0px_#000000] opacity-85'
                    }`}
                  >
                    <div className="flex items-start gap-3.5">
                      {/* Chunky Left Icon Box */}
                      <div 
                        className="w-12 h-12 rounded-2xl border-2 border-black flex items-center justify-center shrink-0 shadow-[2px_2px_0px_#000000]"
                        style={{ backgroundColor: m.accentColor }}
                      >
                        <IconComponent className="w-6 h-6 text-black stroke-[2.5]" />
                      </div>

                      {/* Info & Bullets */}
                      <div className="min-w-0 flex-1 space-y-1.5">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <h4 className="font-display font-black text-sm sm:text-base uppercase text-black tracking-tight">
                            {m.title}
                          </h4>
                          <span className={`px-2 py-0.5 rounded-lg border-2 border-black text-[9px] font-mono font-black uppercase shadow-[1px_1px_0px_#000000] ${m.tagColor}`}>
                            {m.tag}
                          </span>
                        </div>

                        <ul className="text-xs font-mono font-bold text-neutral-600 space-y-0.5">
                          {m.bullets.map((b, bIdx) => (
                            <li key={bIdx} className="flex items-center gap-1.5">
                              <span className="text-[#00E599] font-black">✔</span>
                              <span>{b}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Selected Radio Pill */}
                      {isSelected && (
                        <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center shrink-0 shadow-[1.5px_1.5px_0px_#000000] mt-1">
                          <Check className="w-3.5 h-3.5 stroke-3" />
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
            <div className="space-y-4">
              <div className="p-3.5 bg-white border-2 border-black rounded-2xl flex items-center justify-between shadow-[2px_2px_0px_#000000]">
                <div>
                  <h4 className="font-display font-black text-xs sm:text-sm uppercase text-black">
                    Anchor Habit Templates ({anchors.length})
                  </h4>
                  <p className="text-[11px] font-mono font-bold text-neutral-600">
                    Total Score: <span className="text-black bg-[#FDC800] px-1.5 py-0.5 rounded border border-black">{totalUtils.toFixed(1)} / 5.0 Points</span>
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleEqualSplit}
                  className="px-3 py-1.5 bg-[#FAF8ED] hover:bg-[#FDC800] border-2 border-black rounded-xl text-xs font-mono font-black cursor-pointer flex items-center gap-1.5 shadow-[1.5px_1.5px_0px_#000000] active:scale-95 transition-all"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Equalize (5.0 Split)</span>
                </button>
              </div>

              <div className="space-y-2.5">
                {anchors.map((item, idx) => (
                  <div key={item.id} className="p-3.5 bg-white border-2 border-black rounded-2xl space-y-2.5 shadow-[3px_3px_0px_#000000]">
                    <div className="flex items-center gap-2.5">
                      
                      {/* Icon Selector Button */}
                      <button
                        type="button"
                        onClick={() => setActiveIconPickerIdx(activeIconPickerIdx === idx ? null : idx)}
                        className="w-11 h-11 rounded-2xl border-2 border-black flex items-center justify-center shrink-0 shadow-[2px_2px_0px_#000000] cursor-pointer hover:scale-105 transition-all"
                        style={{ backgroundColor: item.color || '#FDC800' }}
                        title="Click to Change Icon"
                      >
                        {renderAnchorIcon(item.iconId, "w-5 h-5 text-black stroke-[2.5]")}
                      </button>

                      {/* Title Input */}
                      <input
                        type="text"
                        value={item.title}
                        onChange={(e) => handleUpdateAnchor(idx, 'title', e.target.value)}
                        className="flex-1 px-3 py-2 text-xs font-mono font-black border-2 border-black rounded-xl bg-[#FAF8ED] min-w-0 focus:bg-white"
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
                          className="w-16 px-2 py-2 text-xs font-mono font-black text-center border-2 border-black rounded-xl bg-[#FAF8ED]"
                          title="Point Value"
                        />
                        <span className="text-xs font-mono font-black text-neutral-700">pts</span>
                      </div>

                      {/* Delete Button */}
                      {anchors.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleDeleteAnchor(item.id)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-xl border-2 border-red-300 cursor-pointer shrink-0 active:scale-95"
                          title="Delete task"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Infographic Vector Icon Picker */}
                    {activeIconPickerIdx === idx && (
                      <div className="p-3 bg-[#FAF8ED] border-2 border-black rounded-2xl grid grid-cols-5 sm:grid-cols-9 gap-2 animate-fade-in shadow-[2px_2px_0px_#000000]">
                        {ANCHOR_ICON_OPTIONS.map((opt) => (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => {
                              handleUpdateAnchor(idx, 'iconId', opt.id);
                              handleUpdateAnchor(idx, 'color', opt.color);
                              setActiveIconPickerIdx(null);
                            }}
                            className={`p-2.5 rounded-xl border-2 border-black flex flex-col items-center justify-center gap-1 cursor-pointer transition-all hover:scale-105 ${
                              item.iconId === opt.id ? 'bg-black text-white shadow-[2px_2px_0px_#FDC800]' : 'bg-white text-black'
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

              <button
                type="button"
                onClick={handleAddNewAnchor}
                className="w-full py-3 bg-white hover:bg-neutral-100 border-3 border-dashed border-black rounded-2xl text-xs font-display font-black uppercase text-black flex items-center justify-center gap-2 cursor-pointer shadow-[3px_3px_0px_#000000] active:scale-95"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>+ ADD ANOTHER HABIT TASK</span>
              </button>
            </div>
          )}

          {/* TAB 3: EASY 10-YEAR OLD MATH GUIDE */}
          {activeTab === 'math' && (
            <div className="space-y-4">
              
              {/* Analogy Hero Box */}
              <div className="p-4 sm:p-5 bg-[#FAF8ED] border-3 border-black rounded-3xl space-y-3 shadow-[4px_4px_0px_#000000]">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-[#FDC800] border-2 border-black flex items-center justify-center shadow-[1.5px_1.5px_0px_#000000] text-lg">
                    🎮
                  </div>
                  <div>
                    <h4 className="font-display font-black text-base uppercase text-black">
                      How It Works (Like a Video Game!)
                    </h4>
                    <p className="text-xs font-mono font-bold text-neutral-600">
                      Think of your day like a Quest Score out of 5.0 Stars.
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-white border-2 border-black rounded-2xl space-y-2 text-xs font-mono font-bold text-neutral-800">
                  <p>
                    🌟 <strong>Full Quest = 5.0 Points (5 Stars)</strong>.
                  </p>
                  <p>
                    ⚡ Each habit gives you <strong>Points</strong> when you check it off.
                  </p>
                  <p>
                    🏆 If you have <strong>3 tasks</strong>, each task gives you <strong>1.67 Points</strong>.
                  </p>
                  <p>
                    🚀 Finish all 3 tasks ➔ You collect <strong>1.67 + 1.67 + 1.67 = 5.0 Stars!</strong>
                  </p>
                </div>
              </div>

              {/* Two Easy Examples */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 bg-[#EBFBF5] border-2 border-black rounded-2xl space-y-1.5 shadow-[3px_3px_0px_#000000]">
                  <div className="flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-emerald-700" />
                    <span className="font-display font-black text-xs uppercase text-emerald-950">
                      Example 1: Equal Tasks
                    </span>
                  </div>
                  <p className="text-xs font-mono text-emerald-900 leading-relaxed">
                    Gym = 1.67 pts<br />
                    Water = 1.67 pts<br />
                    Study = 1.67 pts<br />
                    <strong>Total = 5.0 Stars</strong>
                  </p>
                </div>

                <div className="p-4 bg-[#FFF5F5] border-2 border-black rounded-2xl space-y-1.5 shadow-[3px_3px_0px_#000000]">
                  <div className="flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-red-600" />
                    <span className="font-display font-black text-xs uppercase text-red-950">
                      Example 2: Big Boss Task
                    </span>
                  </div>
                  <p className="text-xs font-mono text-red-900 leading-relaxed">
                    Gym (Heavy) = 2.5 pts<br />
                    Read 30m = 1.5 pts<br />
                    Hydration = 1.0 pt<br />
                    <strong>Total = 5.0 Stars</strong>
                  </p>
                </div>
              </div>

            </div>
          )}
        </div>

        {/* Modal Footer Bar */}
        <div className="p-4 border-t-3 border-black bg-white flex items-center justify-between">
          <span className="text-xs font-mono font-bold text-neutral-600">
            💾 Auto-saved to your device
          </span>

          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 bg-[#00E599] hover:bg-emerald-400 font-display font-black text-xs uppercase rounded-xl border-2 border-black shadow-[3px_3px_0px_#000000] cursor-pointer active:scale-95 transition-all flex items-center gap-1.5 text-black"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>SAVE & RETURN</span>
          </button>
        </div>

      </div>
    </div>
  );
}
