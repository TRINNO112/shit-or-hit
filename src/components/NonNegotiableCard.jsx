import React, { useState, useEffect, useMemo } from 'react';
import { 
  Dumbbell, 
  Droplet, 
  Brain, 
  Code, 
  BookOpen, 
  Target, 
  Moon, 
  Flame, 
  Zap, 
  CheckCircle2, 
  Square, 
  Plus, 
  Trash2, 
  RotateCcw, 
  Shield, 
  Check, 
  Sparkles,
  Sliders
} from 'lucide-react';
import { soundEngine } from '../services/soundEngine';

export const NON_NEGOTIABLES_ENABLED_KEY = 'daily_verdict_non_negotiables_enabled';
export const NON_NEGOTIABLES_MODE_KEY = 'daily_verdict_non_negotiables_mode'; // 'checklist' | 'hybrid_50_50' | 'deterministic_100'
export const CUSTOM_TEMPLATES_KEY = 'daily_verdict_custom_anchor_templates';

export const ANCHOR_ICON_OPTIONS = [
  { id: 'dumbbell', label: 'Fitness / Gym', icon: Dumbbell, color: '#FF6B6B' },
  { id: 'droplet', label: 'Hydration / Health', icon: Droplet, color: '#4D96FF' },
  { id: 'brain', label: 'Deep Focus / Study', icon: Brain, color: '#9B51E0' },
  { id: 'code', label: 'Coding / Tech', icon: Code, color: '#00E599' },
  { id: 'book', label: 'Reading / Learning', icon: BookOpen, color: '#FDC800' },
  { id: 'target', label: 'Key Objectives', icon: Target, color: '#FF8008' },
  { id: 'moon', label: 'Sleep & Recovery', icon: Moon, color: '#3A86FF' },
  { id: 'flame', label: 'Discipline / Workout', icon: Flame, color: '#FF3366' },
  { id: 'zap', label: 'Speed & Productivity', icon: Zap, color: '#FFD166' }
];

export const DEFAULT_ANCHORS = [
  { id: 'anchor_1', title: 'Physical Training / Workout', iconId: 'dumbbell', color: '#FF6B6B', utils: 2.0 },
  { id: 'anchor_2', title: '3L Hydration & Clean Diet', iconId: 'droplet', color: '#4D96FF', utils: 1.5 },
  { id: 'anchor_3', title: '30m Deep Focus / Learning', iconId: 'brain', color: '#9B51E0', utils: 1.5 }
];

export function isNonNegotiablesActive() {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(NON_NEGOTIABLES_ENABLED_KEY) === 'true';
}

export function setNonNegotiablesActive(enabled) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(NON_NEGOTIABLES_ENABLED_KEY, enabled ? 'true' : 'false');
  }
}

export function getNonNegotiablesMode() {
  if (typeof window === 'undefined') return 'checklist';
  return localStorage.getItem(NON_NEGOTIABLES_MODE_KEY) || 'checklist';
}

export function setNonNegotiablesMode(mode) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(NON_NEGOTIABLES_MODE_KEY, mode);
  }
}

export function renderAnchorIcon(iconId, className = "w-4 h-4 text-black stroke-[2.5]") {
  const item = ANCHOR_ICON_OPTIONS.find(opt => opt.id === iconId) || ANCHOR_ICON_OPTIONS[0];
  const IconComponent = item.icon;
  return <IconComponent className={className} />;
}

// 🎯 Ultra-Clean Main Dashboard Checklist Card (ZERO Edit Clutter)
export default function NonNegotiableCard({ dateStr, onScoreUpdate }) {
  const isEnabled = isNonNegotiablesActive();
  const mode = getNonNegotiablesMode();
  const storageKey = `daily_verdict_anchors_${dateStr}`;

  const dayAnchorsKey = `daily_verdict_day_anchors_${dateStr}`;
  const [daySpecificAnchors, setDaySpecificAnchors] = useState(() => {
    try {
      const saved = localStorage.getItem(dayAnchorsKey);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [showAddDayAnchor, setShowAddDayAnchor] = useState(false);
  const [newDayAnchorTitle, setNewDayAnchorTitle] = useState('');
  const [newDayAnchorUtils, setNewDayAnchorUtils] = useState(1.5);

  // Load custom anchor templates
  const [anchors, setAnchors] = useState(() => {
    try {
      const saved = localStorage.getItem(CUSTOM_TEMPLATES_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_ANCHORS;
    } catch {
      return DEFAULT_ANCHORS;
    }
  });

  // Load checked state for target date
  const [checkedState, setCheckedState] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Refresh templates if updated in Settings
  useEffect(() => {
    try {
      const saved = localStorage.getItem(CUSTOM_TEMPLATES_KEY);
      if (saved) setAnchors(JSON.parse(saved));
    } catch {}
  }, []);

  // Sync state when date changes
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      setCheckedState(saved ? JSON.parse(saved) : {});
      const savedDayAnchors = localStorage.getItem(dayAnchorsKey);
      setDaySpecificAnchors(savedDayAnchors ? JSON.parse(savedDayAnchors) : []);
    } catch {
      setCheckedState({});
      setDaySpecificAnchors([]);
    }
    setShowAddDayAnchor(false);
    setNewDayAnchorTitle('');
  }, [dateStr, storageKey, dayAnchorsKey]);

  // Combined active anchor list (Global Template Anchors + Day-Specific Outlier Anchors)
  const combinedAnchors = useMemo(() => {
    return [...anchors, ...daySpecificAnchors];
  }, [anchors, daySpecificAnchors]);

  // Calculate total possible utils and achieved utils
  const { totalUtils, achievedUtils, completedCount, isAllCompleted } = useMemo(() => {
    const total = combinedAnchors.reduce((acc, curr) => acc + (Number(curr.utils) || 0), 0);
    const achieved = combinedAnchors.reduce((acc, curr) => {
      return acc + (checkedState[curr.id] ? (Number(curr.utils) || 0) : 0);
    }, 0);
    const count = combinedAnchors.filter(a => checkedState[a.id]).length;
    return {
      totalUtils: Number(total.toFixed(2)),
      achievedUtils: Number(achieved.toFixed(2)),
      completedCount: count,
      isAllCompleted: combinedAnchors.length > 0 && count === combinedAnchors.length
    };
  }, [combinedAnchors, checkedState]);

  // Compute calculated star rating (0.0 to 5.0)
  const calculatedRating = useMemo(() => {
    if (totalUtils === 0) return 0;
    const normalized = (achievedUtils / totalUtils) * 5.0;
    return Number(normalized.toFixed(1));
  }, [achievedUtils, totalUtils]);

  // If disabled in Settings, do not render on dashboard
  if (!isEnabled) {
    return null;
  }

  const handleAddDaySpecificTask = (e) => {
    e?.preventDefault();
    if (!newDayAnchorTitle.trim()) return;
    soundEngine.playClick();
    const newId = `day_anchor_${Date.now()}`;
    const newAnchor = {
      id: newId,
      title: newDayAnchorTitle.trim(),
      iconId: 'zap',
      color: '#FF8008',
      utils: Number(newDayAnchorUtils) || 1.5,
      isDaySpecific: true
    };
    const updated = [...daySpecificAnchors, newAnchor];
    setDaySpecificAnchors(updated);
    localStorage.setItem(dayAnchorsKey, JSON.stringify(updated));
    setNewDayAnchorTitle('');
    setShowAddDayAnchor(false);

    // Recompute and trigger score update immediately
    const nextCombined = [...anchors, ...updated];
    const nextTotal = nextCombined.reduce((acc, curr) => acc + (Number(curr.utils) || 0), 0);
    const nextAchieved = nextCombined.reduce((acc, curr) => {
      return acc + (checkedState[curr.id] ? (Number(curr.utils) || 0) : 0);
    }, 0);
    const nextRating = nextTotal > 0 ? Number(((nextAchieved / nextTotal) * 5.0).toFixed(1)) : 0;
    if (onScoreUpdate) {
      onScoreUpdate({
        mode,
        completedCount,
        totalCount: nextCombined.length,
        achievedUtils: Number(nextAchieved.toFixed(2)),
        totalUtils: Number(nextTotal.toFixed(2)),
        calculatedRating: nextRating
      });
    }
  };

  const handleDeleteDaySpecificTask = (taskToDeleteId, e) => {
    e?.stopPropagation();
    soundEngine.playClick();
    const updated = daySpecificAnchors.filter(a => a.id !== taskToDeleteId);
    setDaySpecificAnchors(updated);
    localStorage.setItem(dayAnchorsKey, JSON.stringify(updated));

    const nextCombined = [...anchors, ...updated];
    const nextTotal = nextCombined.reduce((acc, curr) => acc + (Number(curr.utils) || 0), 0);
    const nextAchieved = nextCombined.reduce((acc, curr) => {
      return acc + (checkedState[curr.id] ? (Number(curr.utils) || 0) : 0);
    }, 0);
    const nextRating = nextTotal > 0 ? Number(((nextAchieved / nextTotal) * 5.0).toFixed(1)) : 0;
    if (onScoreUpdate) {
      onScoreUpdate({
        mode,
        completedCount: nextCombined.filter(a => checkedState[a.id]).length,
        totalCount: nextCombined.length,
        achievedUtils: Number(nextAchieved.toFixed(2)),
        totalUtils: Number(nextTotal.toFixed(2)),
        calculatedRating: nextRating
      });
    }
  };

  const toggleAnchor = (id) => {
    soundEngine.playClick();
    const updated = {
      ...checkedState,
      [id]: !checkedState[id]
    };
    setCheckedState(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));

    const newCompletedCount = combinedAnchors.filter(a => updated[a.id]).length;
    if (newCompletedCount === combinedAnchors.length && combinedAnchors.length > 0) {
      soundEngine.playMilestoneArpeggio();
    }

    if (onScoreUpdate) {
      const newAchieved = combinedAnchors.reduce((acc, curr) => {
        return acc + (updated[curr.id] ? (Number(curr.utils) || 0) : 0);
      }, 0);
      const newRating = totalUtils > 0 ? Number(((newAchieved / totalUtils) * 5.0).toFixed(1)) : 0;
      
      onScoreUpdate({
        mode,
        completedCount: newCompletedCount,
        totalCount: combinedAnchors.length,
        achievedUtils: Number(newAchieved.toFixed(2)),
        totalUtils,
        calculatedRating: newRating
      });
    }
  };

  return (
    <div className="bg-white border-3 border-black rounded-3xl p-4 sm:p-5 shadow-[4px_4px_0px_#000000] space-y-3.5 relative overflow-hidden">
      
      {/* Top Header: Title, Mode Pill, and Utils Counter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-[#00E599] border-2 border-black flex items-center justify-center shrink-0 shadow-[2px_2px_0px_#000000]">
            <Shield className="w-5 h-5 text-black stroke-[2.5]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-display font-black text-sm sm:text-base uppercase tracking-tight text-black truncate">
                Daily Non-Negotiables
              </h4>
              <span className={`px-2 py-0.5 rounded-lg border border-black text-[9px] font-mono font-black uppercase shadow-[1px_1px_0px_#000000] ${
                mode === 'deterministic_100' ? 'bg-[#FF6B6B] text-white' :
                mode === 'hybrid_50_50' ? 'bg-[#FDC800] text-black' :
                'bg-neutral-100 text-neutral-800'
              }`}>
                {mode === 'deterministic_100' ? '🔒 100% Task Engine' :
                 mode === 'hybrid_50_50' ? '⚖️ 50/50 Hybrid' : '📋 Checklist'}
              </span>
            </div>
            <p className="text-[11px] font-mono text-neutral-600 truncate">
              {achievedUtils} / {totalUtils} Satisfaction Utils ({calculatedRating}★)
            </p>
          </div>
        </div>

        {/* Completion Progress Pill */}
        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <div className={`px-3 py-1 rounded-xl border-2 border-black font-mono text-xs font-black uppercase shadow-[1.5px_1.5px_0px_#000000] ${
            isAllCompleted ? 'bg-[#00E599] text-black' : 'bg-neutral-100 text-neutral-700'
          }`}>
            {completedCount}/{combinedAnchors.length} LOCKED ({isAllCompleted ? '100%' : `${Math.round((completedCount / Math.max(combinedAnchors.length, 1)) * 100)}%`})
          </div>
        </div>
      </div>

      {/* Dynamic Utility Progress Bar */}
      <div className="w-full bg-neutral-100 border-2 border-black rounded-full h-3 overflow-hidden shadow-[1px_1px_0px_#000000]">
        <div 
          className="h-full bg-linear-to-r from-[#00E599] to-[#FDC800] transition-all duration-300 rounded-full"
          style={{ width: `${totalUtils > 0 ? (achievedUtils / totalUtils) * 100 : 0}%` }}
        />
      </div>

      {/* Task List (Interactive Checkboxes with Day-Specific Task Badges) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
        {combinedAnchors.map((item) => {
          const isChecked = !!checkedState[item.id];
          return (
            <div
              key={item.id}
              onClick={() => toggleAnchor(item.id)}
              className={`p-3 rounded-2xl border-2 border-black flex items-center justify-between gap-2.5 text-left cursor-pointer transition-all active:scale-98 shadow-[2px_2px_0px_#000000] relative ${
                isChecked 
                  ? 'bg-[#EBFBF5] text-black border-black ring-1 ring-black' 
                  : 'bg-white hover:bg-neutral-50 text-neutral-900'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div 
                  className="w-8 h-8 rounded-xl border-2 border-black flex items-center justify-center shrink-0 shadow-[1px_1px_0px_#000000]"
                  style={{ backgroundColor: item.color || '#FDC800' }}
                >
                  {renderAnchorIcon(item.iconId, "w-4 h-4 text-black stroke-[2.5]")}
                </div>
                <div className="min-w-0 flex-1">
                  <div className={`text-xs font-mono font-black truncate leading-tight flex items-center gap-1 ${isChecked ? 'line-through opacity-70' : ''}`}>
                    <span>{item.title}</span>
                    {item.isDaySpecific && (
                      <span className="px-1 py-0.2 bg-[#FF8008] text-white text-[8px] font-black rounded uppercase">TODAY</span>
                    )}
                  </div>
                  <div className="text-[10px] font-mono text-neutral-500 font-bold mt-0.5 flex items-center justify-between">
                    <span>+{item.utils} Utils</span>
                    {item.isDaySpecific && (
                      <button
                        type="button"
                        onClick={(e) => handleDeleteDaySpecificTask(item.id, e)}
                        className="text-neutral-400 hover:text-red-500 cursor-pointer ml-2"
                        title="Remove today-only task"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="shrink-0">
                {isChecked ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                ) : (
                  <Square className="w-5 h-5 text-neutral-400" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 🌟 Day-Specific Outlier Anchor Adder (e.g. Essay, Exam, Doctor Appointment for TODAY only) */}
      <div className="pt-1 border-t border-neutral-200">
        {!showAddDayAnchor ? (
          <button
            type="button"
            onClick={() => setShowAddDayAnchor(true)}
            className="w-full py-2 px-3 bg-neutral-50 hover:bg-neutral-100 border-2 border-dashed border-black/40 hover:border-black rounded-xl font-mono text-[11px] font-black text-neutral-800 flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-98 shadow-[1px_1px_0px_#000000]"
          >
            <Plus className="w-3.5 h-3.5 text-black" />
            <span>+ ADD SPECIAL ONE-OFF TASK FOR TODAY (e.g. Essay Writing, Project, Medical)</span>
          </button>
        ) : (
          <form onSubmit={handleAddDaySpecificTask} className="p-3 bg-[#FFFDF5] border-2 border-black rounded-2xl space-y-2.5 shadow-[2px_2px_0px_#000000]">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] font-black text-black uppercase flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-[#FF8008]" />
                <span>Special Task For Today Only:</span>
              </span>
              <button
                type="button"
                onClick={() => setShowAddDayAnchor(false)}
                className="p-1 rounded-lg bg-neutral-200 hover:bg-neutral-300 text-black cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2">
              <input
                type="text"
                placeholder="e.g. 1500-word Essay, Presentation, Car Repair..."
                value={newDayAnchorTitle}
                onChange={(e) => setNewDayAnchorTitle(e.target.value)}
                className="w-full sm:flex-1 p-2 bg-white border-2 border-black rounded-xl font-mono text-xs focus:outline-none focus:ring-2 focus:ring-black"
                autoFocus
              />
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={newDayAnchorUtils}
                  onChange={(e) => setNewDayAnchorUtils(Number(e.target.value))}
                  className="p-2 bg-white border-2 border-black rounded-xl font-mono text-xs font-bold"
                >
                  <option value={1.0}>1.0 Util</option>
                  <option value={1.5}>1.5 Utils</option>
                  <option value={2.0}>2.0 Utils</option>
                  <option value={2.5}>2.5 Utils</option>
                </select>
                <button
                  type="submit"
                  disabled={!newDayAnchorTitle.trim()}
                  className="px-4 py-2 bg-[#00E599] disabled:opacity-40 hover:bg-emerald-400 border-2 border-black rounded-xl font-mono text-xs font-black text-black shadow-[1.5px_1.5px_0px_#000000] cursor-pointer whitespace-nowrap"
                >
                  + ADD TO TODAY
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// ⚙️ Dedicated Comprehensive Settings Hub for Non-Negotiables & Utility Editor
export function NonNegotiablesSettings({ onSettingsUpdated }) {
  const isEnabled = isNonNegotiablesActive();
  const [active, setActive] = useState(isEnabled);
  const [currentMode, setCurrentMode] = useState(() => getNonNegotiablesMode());
  const [isEditingTasks, setIsEditingTasks] = useState(false);
  const [activeIconPickerIdx, setActiveIconPickerIdx] = useState(null);

  const [anchors, setAnchors] = useState(() => {
    try {
      const saved = localStorage.getItem(CUSTOM_TEMPLATES_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_ANCHORS;
    } catch {
      return DEFAULT_ANCHORS;
    }
  });

  const [tempAnchors, setTempAnchors] = useState(anchors);

  const handleToggle = () => {
    const next = !active;
    setActive(next);
    setNonNegotiablesActive(next);
    soundEngine.playClick();
    if (onSettingsUpdated) onSettingsUpdated();
  };

  const handleModeChange = (newMode) => {
    setCurrentMode(newMode);
    setNonNegotiablesMode(newMode);
    soundEngine.playClick();
    if (onSettingsUpdated) onSettingsUpdated();
  };

  const handleEqualSplit = () => {
    soundEngine.playClick();
    if (tempAnchors.length === 0) return;
    const splitVal = Number((5.0 / tempAnchors.length).toFixed(2));
    const equalized = tempAnchors.map(a => ({
      ...a,
      utils: splitVal
    }));
    setTempAnchors(equalized);
  };

  const handleAddNewAnchor = () => {
    soundEngine.playClick();
    const newId = `anchor_${Date.now()}`;
    const defaultSplit = Number((5.0 / (tempAnchors.length + 1)).toFixed(2));
    setTempAnchors(prev => [
      ...prev.map(a => ({ ...a, utils: defaultSplit })),
      { 
        id: newId, 
        title: 'New Anchor Task', 
        iconId: 'zap', 
        color: '#FFD166', 
        utils: defaultSplit 
      }
    ]);
  };

  const handleDeleteAnchor = (id) => {
    soundEngine.playClick();
    setTempAnchors(prev => prev.filter(a => a.id !== id));
  };

  const handleSaveTasks = (e) => {
    e.preventDefault();
    setAnchors(tempAnchors);
    localStorage.setItem(CUSTOM_TEMPLATES_KEY, JSON.stringify(tempAnchors));
    setIsEditingTasks(false);
    setActiveIconPickerIdx(null);
    soundEngine.playSuccessChime();
    if (onSettingsUpdated) onSettingsUpdated();
  };

  return (
    <div className="bg-white border-2 border-black rounded-2xl p-4 shadow-[3px_3px_0px_#000000] space-y-3.5">
      {/* Header with Master Toggle */}
      <div className="flex items-start justify-between gap-2.5">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="w-10 h-10 shrink-0 aspect-square min-w-10 min-h-10 rounded-xl bg-[#00E599] border-2 border-black flex items-center justify-center shadow-[1px_1px_0px_#000000]">
            <Shield className="w-4 h-4 text-black stroke-[2.5]" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-display font-black text-sm uppercase truncate">
              Daily Non-Negotiables Mode
            </h4>
            <p className="text-[11px] font-mono text-neutral-600 truncate">
              Economic satisfaction points & habit accountability
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleToggle}
          className={`px-3 py-1.5 rounded-xl border-2 border-black font-mono text-xs font-black cursor-pointer transition-all shadow-[1.5px_1.5px_0px_#000000] active:scale-95 shrink-0 ${
            active 
              ? 'bg-[#00E599] text-black' 
              : 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300'
          }`}
        >
          {active ? 'ACTIVE (ON)' : 'DISABLED (OFF)'}
        </button>
      </div>

      {active && (
        <div className="space-y-3 pt-1 animate-fade-in">
          {/* 1. Operating Mode Radio Selector */}
          <div className="p-3 bg-neutral-50 rounded-xl border-2 border-black space-y-2">
            <span className="font-display font-black text-xs uppercase text-black block">
              1. Rating Integration Mode:
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[
                {
                  id: 'checklist',
                  label: 'Checklist Only',
                  desc: '0% impact on 1-tap rating',
                  bg: 'bg-white'
                },
                {
                  id: 'hybrid_50_50',
                  label: '50/50 Hybrid Blend',
                  desc: '50% Feeling + 50% Tasks',
                  bg: 'bg-[#FDC800]'
                },
                {
                  id: 'deterministic_100',
                  label: '100% Task-Driven',
                  desc: 'Tasks decide entire rating',
                  bg: 'bg-[#FF6B6B]'
                }
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => handleModeChange(m.id)}
                  className={`p-2.5 rounded-xl border-2 border-black text-left cursor-pointer transition-all ${
                    currentMode === m.id
                      ? `${m.bg} ${m.id === 'deterministic_100' ? 'text-white' : 'text-black'} shadow-[2px_2px_0px_#000000] scale-[1.02] ring-2 ring-black font-black`
                      : 'bg-white hover:bg-neutral-100 text-neutral-700 shadow-[1px_1px_0px_#000000]'
                  }`}
                >
                  <div className="font-display font-black text-xs uppercase leading-tight">
                    {m.label}
                  </div>
                  <div className={`text-[10px] font-mono leading-tight mt-0.5 ${
                    currentMode === m.id && m.id === 'deterministic_100' ? 'text-white/80' : 'text-neutral-500'
                  }`}>
                    {m.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Task & Utils Weight Customizer Drawer */}
          <div className="p-3 bg-neutral-50 rounded-xl border-2 border-black space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-display font-black text-xs uppercase text-black block">
                  2. Habit Templates & Satisfaction Points
                </span>
                <span className="text-[10px] font-mono text-neutral-600 block">
                  {anchors.length} tasks configured ({anchors.reduce((a, b) => a + (Number(b.utils) || 0), 0).toFixed(1)} total utils)
                </span>
              </div>

              {!isEditingTasks ? (
                <button
                  type="button"
                  onClick={() => {
                    setTempAnchors(JSON.parse(JSON.stringify(anchors)));
                    setIsEditingTasks(true);
                  }}
                  className="px-3 py-1 bg-white hover:bg-neutral-100 border-2 border-black rounded-lg text-xs font-mono font-bold cursor-pointer shadow-[1px_1px_0px_#000000]"
                >
                  Edit Tasks & Points
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleEqualSplit}
                  className="px-2 py-1 bg-white hover:bg-neutral-100 border border-black rounded-lg text-[10px] font-mono font-bold cursor-pointer flex items-center gap-1 shadow-[1px_1px_0px_#000000]"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Equalize (5.0 Split)</span>
                </button>
              )}
            </div>

            {isEditingTasks && (
              <form onSubmit={handleSaveTasks} className="space-y-2.5 pt-2 animate-fade-in">
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {tempAnchors.map((item, idx) => (
                    <div key={item.id} className="p-2 bg-white border border-black rounded-xl space-y-1.5 shadow-[1px_1px_0px_#000000]">
                      <div className="flex items-center gap-2">
                        {/* Icon Picker Trigger */}
                        <button
                          type="button"
                          onClick={() => setActiveIconPickerIdx(activeIconPickerIdx === idx ? null : idx)}
                          className="w-8 h-8 rounded-lg border-2 border-black flex items-center justify-center shrink-0 shadow-[1px_1px_0px_#000000] cursor-pointer hover:scale-105 transition-all"
                          style={{ backgroundColor: item.color || '#FDC800' }}
                          title="Change Icon"
                        >
                          {renderAnchorIcon(item.iconId, "w-4 h-4 text-black stroke-[2.5]")}
                        </button>

                        {/* Title Input */}
                        <input
                          type="text"
                          value={item.title}
                          onChange={(e) => {
                            const next = [...tempAnchors];
                            next[idx].title = e.target.value;
                            setTempAnchors(next);
                          }}
                          className="flex-1 px-2 py-1 text-xs font-mono font-bold border border-black rounded-lg bg-neutral-50 min-w-0"
                          placeholder={`Task #${idx + 1}`}
                        />

                        {/* Utils Points */}
                        <div className="flex items-center gap-1 shrink-0">
                          <input
                            type="number"
                            step="0.1"
                            min="0.1"
                            max="5.0"
                            value={item.utils}
                            onChange={(e) => {
                              const next = [...tempAnchors];
                              next[idx].utils = Number(e.target.value);
                              setTempAnchors(next);
                            }}
                            className="w-14 px-1.5 py-1 text-xs font-mono font-bold text-center border border-black rounded-lg bg-neutral-50"
                            title="Utils"
                          />
                          <span className="text-[10px] font-mono font-bold text-neutral-500">pts</span>
                        </div>

                        {/* Delete Button */}
                        {tempAnchors.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleDeleteAnchor(item.id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded-lg border border-red-200 cursor-pointer shrink-0"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Icon Picker Popover */}
                      {activeIconPickerIdx === idx && (
                        <div className="p-2 bg-neutral-100 border border-black rounded-xl grid grid-cols-5 gap-1.5 animate-fade-in">
                          {ANCHOR_ICON_OPTIONS.map((opt) => (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => {
                                const next = [...tempAnchors];
                                next[idx].iconId = opt.id;
                                next[idx].color = opt.color;
                                setTempAnchors(next);
                                setActiveIconPickerIdx(null);
                              }}
                              className={`p-1.5 rounded-lg border border-black flex flex-col items-center justify-center gap-1 cursor-pointer ${
                                item.iconId === opt.id ? 'bg-black text-white' : 'bg-white text-black'
                              }`}
                            >
                              <opt.icon className={`w-3.5 h-3.5 ${item.iconId === opt.id ? 'text-white' : 'text-black'}`} />
                              <span className="text-[8px] font-mono truncate max-w-full">{opt.id}</span>
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
                  className="w-full py-1.5 bg-white hover:bg-neutral-100 border border-dashed border-black/40 rounded-xl text-xs font-mono font-bold text-black flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Another Task</span>
                </button>

                <div className="flex justify-end gap-2 pt-1 border-t border-black/10">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingTasks(false);
                      setActiveIconPickerIdx(null);
                    }}
                    className="px-2.5 py-1 text-xs font-mono border border-black rounded-lg bg-white cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3.5 py-1 text-xs font-display font-black uppercase bg-[#00E599] border border-black rounded-lg shadow-[1px_1px_0px_#000000] cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
