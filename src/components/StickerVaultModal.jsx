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
        className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs select-none"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.93, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.93, y: 20 }}
          transition={{ type: 'spring', stiffness: 360, damping: 26 }}
          className="w-full max-w-5xl min-h-[580px] sm:min-h-[660px] max-h-[92vh] h-[85vh] flex flex-col bg-white border-3 border-black rounded-3xl shadow-[10px_10px_0px_#000000] overflow-hidden p-6 sm:p-8"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 mb-4 border-b-2 border-black/10 shrink-0">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[#FDC800] border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_#000000]">
                <Sparkles className="w-6 h-6 text-black stroke-[2.5]" />
              </div>
              <div>
                <h3 className="font-display font-black text-xl sm:text-2xl text-black uppercase leading-tight">
                  STICKER & MASCOT VAULT
                </h3>
                <p className="text-xs font-mono font-bold text-neutral-600 mt-0.5">
                  Official collection & custom PNG stickers for your high-res wallpapers
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2.5 rounded-xl bg-red-100 hover:bg-red-200 border-2 border-black text-black cursor-pointer shadow-[2px_2px_0px_#000000] active:scale-95 transition-all"
              title="Close"
            >
              <X className="w-4 h-4 stroke-[3]" />
            </button>
          </div>

          {/* Active Mode Banner: Auto vs Fixed Custom Sticker */}
          <div className="p-4 bg-[#FFFDF5] border-2 border-black rounded-2xl shadow-[2.5px_2.5px_0px_#000000] mb-4 flex flex-wrap items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-mono font-black text-neutral-700 uppercase">
                Active Wallpaper Sticker:
              </span>
              {activeId === 'auto' ? (
                <span className="px-3 py-1 bg-[#00E599] border border-black rounded-lg font-mono text-xs font-black text-black">
                  ⚡ Auto-Linked to Day Mood Rating
                </span>
              ) : (
                <span className="px-3 py-1 bg-[#FDC800] border border-black rounded-lg font-mono text-xs font-black text-black">
                  🎨 Fixed Custom Sticker Selected
                </span>
              )}
            </div>

            {activeId !== 'auto' && (
              <button
                type="button"
                onClick={() => handleSelectActive('auto')}
                className="px-3.5 py-1.5 bg-white hover:bg-neutral-100 border border-black rounded-xl font-mono text-xs font-black text-black shadow-[1.5px_1.5px_0px_#000000] cursor-pointer active:scale-95 transition-all"
              >
                Reset to Auto Mood Mascots
              </button>
            )}
          </div>

          {/* Category Filter Tabs */}
          <div className="flex items-center gap-2 border-b-2 border-black/10 pb-3 mb-4 shrink-0">
            {[
              { id: 'all', label: 'All Stickers' },
              { id: 'official', label: `Official & Featured (${DEFAULT_MASCOTS.length})` },
              { id: 'custom', label: `My Uploads (${customStickers.length})` }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl border-2 border-black font-mono text-xs font-black cursor-pointer transition-all ${
                  selectedCategory === tab.id
                    ? 'bg-black text-[#FDC800] shadow-[2px_2px_0px_#000000]'
                    : 'bg-white text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Scrollable Main Content Grid */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden pr-1 space-y-5">
            
            {/* Upload Box */}
            <div className="p-4 border-2 border-dashed border-black/50 rounded-2xl bg-[#F8FAFC] flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white border-2 border-black flex items-center justify-center shadow-[1.5px_1.5px_0px_#000000] shrink-0">
                  <Upload className="w-5 h-5 text-black" />
                </div>
                <div>
                  <h4 className="font-display font-black text-xs sm:text-sm uppercase text-black">
                    Upload Custom Sticker (PNG / SVG / WebP)
                  </h4>
                  <p className="text-[10px] font-mono text-neutral-500">
                    Transparent backgrounds work best for wallpapers and aesthetic cards.
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

            {/* Stickers Grid */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
                
                {/* Auto-Mood Default Option */}
                {(selectedCategory === 'all' || selectedCategory === 'official') && (
                  <div
                    onClick={() => handleSelectActive('auto')}
                    className={`p-3.5 rounded-2xl border-2 border-black flex flex-col items-center justify-between text-center cursor-pointer transition-all hover:-translate-y-1 ${
                      activeId === 'auto'
                        ? 'bg-[#FFFDF0] ring-2.5 ring-black shadow-[4px_4px_0px_#000000]'
                        : 'bg-white hover:bg-neutral-50 shadow-[2px_2px_0px_#000000]'
                    }`}
                  >
                    <div className="w-16 h-16 rounded-xl border-2 border-black bg-gradient-to-br from-amber-200 to-emerald-200 flex items-center justify-center p-2 shadow-[1.5px_1.5px_0px_#000000] mb-2">
                      <Sparkles className="w-8 h-8 text-black" />
                    </div>
                    <div className="min-w-0 w-full mb-1">
                      <span className="font-display font-black text-xs uppercase block text-black truncate">
                        ⚡ Auto Mood Mascot
                      </span>
                      <span className="text-[10px] font-mono text-neutral-500 block">
                        Changes with 1★–5★
                      </span>
                    </div>
                    {activeId === 'auto' ? (
                      <span className="mt-1 px-2 py-0.5 bg-[#00E599] border border-black rounded-md font-mono text-[9px] font-black text-black">
                        ✓ ACTIVE
                      </span>
                    ) : (
                      <span className="mt-1 text-[9px] font-mono text-neutral-400 font-bold">
                        Click to Use
                      </span>
                    )}
                  </div>
                )}

                {/* Official Mascots */}
                {(selectedCategory === 'all' || selectedCategory === 'official') &&
                  DEFAULT_MASCOTS.map(m => {
                    const isSelected = activeId === m.id;
                    return (
                      <div
                        key={m.id}
                        onClick={() => handleSelectActive(m.id)}
                        className={`p-3.5 rounded-2xl border-2 border-black flex flex-col items-center justify-between text-center cursor-pointer transition-all hover:-translate-y-1 ${
                          isSelected
                            ? 'bg-[#FFFDF0] ring-2.5 ring-black shadow-[4px_4px_0px_#000000]'
                            : 'bg-white hover:bg-neutral-50 shadow-[2px_2px_0px_#000000]'
                        }`}
                      >
                        <div 
                          className="w-16 h-16 rounded-xl border-2 border-black flex items-center justify-center p-1 shadow-[1.5px_1.5px_0px_#000000] mb-2"
                          style={{ backgroundColor: m.color }}
                        >
                          <img src={m.src} alt={m.name} className="w-full h-full object-contain" />
                        </div>
                        <div className="min-w-0 w-full mb-1">
                          <span className="font-display font-black text-xs uppercase block text-black truncate">
                            {m.name}
                          </span>
                          <span className="text-[10px] font-mono text-neutral-500 block">
                            Official {m.rating}★
                          </span>
                        </div>
                        {isSelected ? (
                          <span className="mt-1 px-2 py-0.5 bg-[#00E599] border border-black rounded-md font-mono text-[9px] font-black text-black">
                            ✓ ACTIVE
                          </span>
                        ) : (
                          <span className="mt-1 text-[9px] font-mono text-neutral-400 font-bold">
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
                        className={`p-3.5 rounded-2xl border-2 border-black flex flex-col items-center justify-between text-center cursor-pointer transition-all relative group hover:-translate-y-1 ${
                          isSelected
                            ? 'bg-[#FFFDF0] ring-2.5 ring-black shadow-[4px_4px_0px_#000000]'
                            : 'bg-white hover:bg-neutral-50 shadow-[2px_2px_0px_#000000]'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={(e) => handleDelete(s.id, e)}
                          className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-100 hover:bg-red-200 border border-black text-red-700 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-[1px_1px_0px_#000000]"
                          title="Delete Sticker"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        <div className="w-16 h-16 rounded-xl border-2 border-black bg-neutral-100 flex items-center justify-center p-1.5 shadow-[1.5px_1.5px_0px_#000000] mb-2">
                          <img src={s.dataUrl} alt={s.name} className="w-full h-full object-contain" />
                        </div>
                        <div className="min-w-0 w-full mb-1">
                          <span className="font-display font-black text-xs uppercase block text-black truncate">
                            {s.name}
                          </span>
                          <span className="text-[10px] font-mono text-neutral-500 block">
                            Custom Upload
                          </span>
                        </div>
                        {isSelected ? (
                          <span className="mt-1 px-2 py-0.5 bg-[#00E599] border border-black rounded-md font-mono text-[9px] font-black text-black">
                            ✓ ACTIVE
                          </span>
                        ) : (
                          <span className="mt-1 text-[9px] font-mono text-neutral-400 font-bold">
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
