import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Upload,
  Trash2,
  Check,
  Sparkles,
  Image as ImageIcon,
  Plus,
  ShieldAlert,
  Flame,
  Zap,
  Star,
  Layers
} from 'lucide-react';
import {
  getStickerVault,
  saveCustomSticker,
  deleteCustomSticker,
  getActiveStickerId,
  setActiveStickerId
} from '../services/api';

import mascot1 from '../assets/mascots/mascot_1_rough.png';
import mascot2 from '../assets/mascots/mascot_2_down.png';
import mascot3 from '../assets/mascots/mascot_3_okay.png';
import mascot4 from '../assets/mascots/mascot_4_good.png';
import mascot5 from '../assets/mascots/mascot_5_peak.png';
import minecraftHeart from '../assets/stickers/minecraft_heart.png';

const DEFAULT_MASCOTS = [
  { id: 'sticker_mc_heart', name: 'Minecraft Hardcore Heart', src: minecraftHeart, tag: 'official', rating: 5, color: '#FF4D4D' },
  { id: 'mascot_5', name: '5★ God Mode / Peak Velocity', src: mascot5, tag: 'official', rating: 5, color: '#FDC800' },
  { id: 'mascot_4', name: '4★ Locked In / Focus Warrior', src: mascot4, tag: 'official', rating: 4, color: '#00E599' },
  { id: 'mascot_3', name: '3★ Solid Baseline / Stoic', src: mascot3, tag: 'official', rating: 3, color: '#CBD5E1' },
  { id: 'mascot_2', name: '2★ Low Battery / Recovery', src: mascot2, tag: 'official', rating: 2, color: '#FF8A00' },
  { id: 'mascot_1', name: '1★ Trench Survivor / Goblin', src: mascot1, tag: 'official', rating: 1, color: '#FF4D4D' },
];

export default function StickerVaultModal({
  isOpen,
  onClose,
  onSelectSticker, // optional callback when picking directly for an export
  currentActiveId
}) {
  const [customStickers, setCustomStickers] = useState([]);
  const [activeId, setActiveId] = useState('auto');
  const [selectedCategory, setSelectedCategory] = useState('all'); // 'all' | 'custom' | 'official'
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [stickerNameInput, setStickerNameInput] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      loadVault();
      setActiveId(currentActiveId || getActiveStickerId());
      setUploadError(null);
    }
  }, [isOpen, currentActiveId]);

  const loadVault = () => {
    const vault = getStickerVault();
    setCustomStickers(vault);
  };

  const handleSelectActive = (id) => {
    setActiveId(id);
    setActiveStickerId(id);
    if (onSelectSticker) {
      // Find sticker object
      if (id === 'auto') {
        onSelectSticker(null);
      } else {
        const foundCustom = customStickers.find(s => s.id === id);
        if (foundCustom) {
          onSelectSticker(foundCustom);
        } else {
          const foundOfficial = DEFAULT_MASCOTS.find(m => m.id === id);
          if (foundOfficial) onSelectSticker(foundOfficial);
        }
      }
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (PNG, WebP, SVG, JPG).');
      return;
    }

    // Limit to 4MB for localStorage resilience
    if (file.size > 4 * 1024 * 1024) {
      setUploadError('File size is too large (max 4MB). Transparent PNG works best!');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const dataUrl = event.target.result;
        const defaultName = file.name.replace(/\.[^/.]+$/, '').slice(0, 30) || 'Custom Sticker';
        const saved = saveCustomSticker({
          name: stickerNameInput.trim() || defaultName,
          dataUrl,
          tag: 'custom'
        });
        loadVault();
        handleSelectActive(saved.id);
        setStickerNameInput('');
        setIsUploading(false);
      } catch (err) {
        console.error('Error saving sticker:', err);
        setUploadError('Storage full or failed to save. Try deleting older stickers.');
        setIsUploading(false);
      }
    };
    reader.onerror = () => {
      setUploadError('Failed to read image file.');
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleDelete = (id, e) => {
    e.stopPropagation();
    if (window.confirm('Delete this custom sticker from your vault?')) {
      const updated = deleteCustomSticker(id);
      setCustomStickers(updated);
      if (activeId === id) {
        handleSelectActive('auto');
      }
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs select-none"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.93, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.93, y: 20 }}
          transition={{ type: 'spring', stiffness: 360, damping: 26 }}
          className="w-full max-w-5xl min-h-[580px] sm:min-h-[540px] max-h-[92vh] h-[85vh] flex flex-col bg-white border-3 border-black rounded-3xl shadow-[10px_10px_0px_#000000] overflow-hidden p-6 sm:p-8"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b-2 border-black/10 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-[#FDC800] border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_#000000] shrink-0 p-2">
                <Sparkles className="w-5 h-5 text-black stroke-[2.5]" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-display font-black text-lg sm:text-2xl text-black uppercase leading-tight truncate">
                  STICKER & MASCOT VAULT
                </h3>
                <p className="text-[11px] sm:text-xs font-mono font-bold text-neutral-600 mt-0.5 leading-tight truncate">
                  <span className="sm:hidden">Custom & official wallpaper stickers</span>
                  <span className="hidden sm:inline">Official collection & custom PNG stickers for high-res wallpapers</span>
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 sm:p-2.5 rounded-xl bg-[#FF4D4D] hover:bg-red-600 border-2 border-black text-black hover:text-white cursor-pointer shadow-[2px_2px_0px_#000000] active:scale-95 transition-all shrink-0 ml-2"
              title="Close"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5 stroke-[3]" />
            </button>
          </div>

          {/* Active Mode Banner: Auto vs Fixed Custom Sticker */}
          <div className="p-3 sm:p-3.5 bg-[#FFFDF5] border-2 border-black rounded-2xl shadow-[2px_2px_0px_#000000] mb-3.5 flex flex-wrap items-center justify-between gap-2.5 shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-[11px] sm:text-xs font-mono font-black text-neutral-700 uppercase">
                Active Sticker:
              </span>
              {activeId === 'auto' ? (
                <span className="px-2.5 py-0.5 bg-[#00E599] border border-black rounded-lg font-mono text-[11px] sm:text-xs font-black text-black">
                  ⚡ Auto-Linked to Mood Rating
                </span>
              ) : (
                <span className="px-2.5 py-0.5 bg-[#FDC800] border border-black rounded-lg font-mono text-[11px] sm:text-xs font-black text-black truncate max-w-[170px] sm:max-w-xs">
                  🎨 Fixed Custom Sticker Selected
                </span>
              )}
            </div>

            {activeId !== 'auto' && (
              <button
                type="button"
                onClick={() => handleSelectActive('auto')}
                className="px-3 py-1 bg-white hover:bg-neutral-100 border border-black rounded-lg font-mono text-[11px] sm:text-xs font-black text-black shadow-[1px_1px_0px_#000000] cursor-pointer active:scale-95 transition-all shrink-0"
              >
                Reset to Auto Mood
              </button>
            )}
          </div>

          {/* Category Filter Tabs with Guaranteed Equal Heights */}
          <div className="flex items-center gap-2 border-b-2 border-black/10 pb-3 mb-3.5 shrink-0 overflow-x-auto no-scrollbar">
            {[
              { id: 'all', label: 'All Stickers', count: 1 + DEFAULT_MASCOTS.length + customStickers.length },
              { id: 'official', label: 'Official & Featured', count: DEFAULT_MASCOTS.length },
              { id: 'custom', label: 'My Uploads', count: customStickers.length }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id)}
                className={`h-9 sm:h-10 px-3 sm:px-4 rounded-xl border-2 border-black font-mono text-xs font-black flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer transition-all ${selectedCategory === tab.id
                  ? 'bg-black text-[#FDC800] shadow-[2px_2px_0px_#000000]'
                  : 'bg-white text-neutral-700 hover:bg-neutral-100'
                  }`}
              >
                <span>{tab.label}</span>
                <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${selectedCategory === tab.id ? 'bg-[#FDC800] text-black' : 'bg-neutral-200 text-neutral-800'}`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Scrollable Main Content Grid */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden pr-1 space-y-4">

            {/* Upload Box */}
            <div className="p-3.5 border-2 border-dashed border-black/50 rounded-2xl bg-[#F8FAFC] flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white border-2 border-black flex items-center justify-center shadow-[1.5px_1.5px_0px_#000000] shrink-0">
                  <Upload className="w-4 h-4 text-black" />
                </div>
                <div>
                  <h4 className="font-display font-black text-xs sm:text-sm uppercase text-black">
                    Upload Custom Sticker (PNG / SVG / WebP)
                  </h4>
                  <p className="text-[10px] font-mono text-neutral-500">
                    Transparent backgrounds work best for wallpapers and cards.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/png,image/webp,image/svg+xml,image/jpeg"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <button
                  type="button"
                  disabled={isUploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full sm:w-auto px-4 py-2 bg-[#FDC800] hover:bg-amber-400 border-2 border-black rounded-xl font-mono text-xs font-black text-black flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_#000000] active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>{isUploading ? 'Uploading...' : 'CHOOSE FILE'}</span>
                </button>
              </div>
            </div>

            {uploadError && (
              <div className="p-3 rounded-xl bg-red-100 border-2 border-red-500 text-red-800 text-xs font-mono font-bold flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            {/* Stickers Grid with Uniform Card Dimensions */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">

                {/* Auto-Mood Default Option */}
                {(selectedCategory === 'all' || selectedCategory === 'official') && (
                  <div
                    onClick={() => handleSelectActive('auto')}
                    className={`h-[160px] sm:h-[175px] p-3 rounded-2xl border-2 border-black flex flex-col items-center justify-between text-center cursor-pointer transition-all hover:-translate-y-1 ${activeId === 'auto'
                      ? 'bg-[#FFFDF0] ring-2.5 ring-black shadow-[4px_4px_0px_#000000]'
                      : 'bg-white hover:bg-neutral-50 shadow-[2px_2px_0px_#000000]'
                      }`}
                  >
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl border-2 border-black bg-gradient-to-br from-amber-200 to-emerald-200 flex items-center justify-center p-2 shadow-[1.5px_1.5px_0px_#000000] mb-1 shrink-0">
                      <Sparkles className="w-7 h-7 text-black" />
                    </div>
                    <div className="min-w-0 w-full mb-1">
                      <span className="font-display font-black text-xs uppercase block text-black truncate leading-tight">
                        ⚡ Auto Mood
                      </span>
                      <span className="text-[10px] font-mono text-neutral-500 block truncate mt-0.5">
                        Dynamic 1★–5★
                      </span>
                    </div>
                    {activeId === 'auto' ? (
                      <span className="px-2 py-0.5 bg-[#00E599] border border-black rounded-md font-mono text-[9px] font-black text-black shrink-0">
                        ✓ ACTIVE
                      </span>
                    ) : (
                      <span className="text-[9px] font-mono text-neutral-400 font-bold shrink-0">
                        Click to Use
                      </span>
                    )}
                  </div>
                )}

                {/* Official Mascots & Featured Stickers */}
                {(selectedCategory === 'all' || selectedCategory === 'official') &&
                  DEFAULT_MASCOTS.map(m => {
                    const isSelected = activeId === m.id;
                    return (
                      <div
                        key={m.id}
                        onClick={() => handleSelectActive(m.id)}
                        className={`h-[160px] sm:h-[175px] p-3 rounded-2xl border-2 border-black flex flex-col items-center justify-between text-center cursor-pointer transition-all hover:-translate-y-1 ${isSelected
                          ? 'bg-[#FFFDF0] ring-2.5 ring-black shadow-[4px_4px_0px_#000000]'
                          : 'bg-white hover:bg-neutral-50 shadow-[2px_2px_0px_#000000]'
                          }`}
                      >
                        <div
                          className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl border-2 border-black flex items-center justify-center p-1 shadow-[1.5px_1.5px_0px_#000000] mb-1 shrink-0 overflow-hidden"
                          style={{ backgroundColor: m.color }}
                        >
                          <img src={m.src} alt={m.name} className="w-full h-full object-contain max-w-full max-h-full" />
                        </div>
                        <div className="min-w-0 w-full mb-1">
                          <span className="font-display font-black text-xs uppercase block text-black truncate leading-tight" title={m.name}>
                            {m.name}
                          </span>
                          <span className="text-[10px] font-mono text-neutral-500 block truncate mt-0.5">
                            {m.id === 'sticker_mc_heart' ? 'Featured Game Icon' : `Official ${m.rating}★`}
                          </span>
                        </div>
                        {isSelected ? (
                          <span className="px-2 py-0.5 bg-[#00E599] border border-black rounded-md font-mono text-[9px] font-black text-black shrink-0">
                            ✓ ACTIVE
                          </span>
                        ) : (
                          <span className="text-[9px] font-mono text-neutral-400 font-bold shrink-0">
                            Click to Use
                          </span>
                        )}
                      </div>
                    );
                  })}

                {/* Custom User Uploaded Stickers */}
                {(selectedCategory === 'all' || selectedCategory === 'custom') &&
                  customStickers.map(s => {
                    const isSelected = activeId === s.id;
                    return (
                      <div
                        key={s.id}
                        onClick={() => handleSelectActive(s.id)}
                        className={`h-[160px] sm:h-[175px] p-3 rounded-2xl border-2 border-black flex flex-col items-center justify-between text-center cursor-pointer transition-all relative group hover:-translate-y-1 ${isSelected
                          ? 'bg-[#FFFDF0] ring-2.5 ring-black shadow-[4px_4px_0px_#000000]'
                          : 'bg-white hover:bg-neutral-50 shadow-[2px_2px_0px_#000000]'
                          }`}
                      >
                        <button
                          type="button"
                          onClick={(e) => handleDelete(s.id, e)}
                          className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-100 hover:bg-red-200 border border-black text-red-700 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-[1px_1px_0px_#000000] z-10"
                          title="Delete Sticker"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl border-2 border-black bg-neutral-100 flex items-center justify-center p-1 shadow-[1.5px_1.5px_0px_#000000] mb-1 shrink-0 overflow-hidden">
                          <img src={s.dataUrl} alt={s.name} className="w-full h-full object-contain max-w-full max-h-full" />
                        </div>
                        <div className="min-w-0 w-full mb-1">
                          <span className="font-display font-black text-xs uppercase block text-black truncate leading-tight" title={s.name}>
                            {s.name}
                          </span>
                          <span className="text-[10px] font-mono text-neutral-500 block truncate mt-0.5">
                            Custom Upload
                          </span>
                        </div>
                        {isSelected ? (
                          <span className="px-2 py-0.5 bg-[#00E599] border border-black rounded-md font-mono text-[9px] font-black text-black shrink-0">
                            ✓ ACTIVE
                          </span>
                        ) : (
                          <span className="text-[9px] font-mono text-neutral-400 font-bold shrink-0">
                            Click to Use
                          </span>
                        )}
                      </div>
                    );
                  })}
              </div>

              {selectedCategory === 'custom' && customStickers.length === 0 && (
                <div className="py-12 text-center text-neutral-500 font-mono text-xs border-2 border-dashed border-black/20 rounded-2xl">
                  No custom stickers uploaded yet. Click "CHOOSE FILE" above to add your first sticker!
                </div>
              )}
            </div>

          </div>

          {/* Footer */}
          <div className="pt-3.5 mt-4 border-t-2 border-black/10 flex items-center justify-between shrink-0">
            <span className="text-xs font-mono text-neutral-600">
              Selected sticker will be rendered on all wallpaper exports.
            </span>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 bg-black text-white hover:bg-neutral-800 font-mono font-black text-xs uppercase rounded-xl cursor-pointer shadow-[2px_2px_0px_#000000] active:scale-95"
            >
              DONE
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
