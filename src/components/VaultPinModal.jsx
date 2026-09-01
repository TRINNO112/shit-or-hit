import React, { useState, useEffect } from 'react';
import { Lock, Unlock, KeyRound, ShieldAlert, Fingerprint, Delete, Check, X, ShieldCheck, Cloud, RefreshCcw } from 'lucide-react';
import { soundEngine } from '../services/soundEngine';
import { getCurrentUser } from '../services/firebase';
import { 
  encryptVaultPin, 
  decryptVaultPin, 
  saveVaultPinDualLayer, 
  fetchVaultPinDualLayer, 
  removeVaultPinDualLayer,
  verifyStoredVaultPin
} from '../services/cipherEngine';

export const VAULT_PIN_CIPHER_KEY = 'daily_verdict_vault_pin_cipher';

export function isVaultPinActive() {
  if (typeof window === 'undefined') return false;
  return !!(
    localStorage.getItem('daily_verdict_vault_pin_hash') ||
    localStorage.getItem('daily_verdict_vault_pin') || 
    localStorage.getItem(VAULT_PIN_CIPHER_KEY)
  );
}

export function getStoredVaultPinCipher() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('daily_verdict_vault_pin_hash') || localStorage.getItem('daily_verdict_vault_pin') || localStorage.getItem(VAULT_PIN_CIPHER_KEY) || null;
}

export async function setVaultPin(pin) {
  if (pin) {
    await saveVaultPinDualLayer(pin);
  } else {
    await removeVaultPinDualLayer();
    localStorage.removeItem(VAULT_PIN_CIPHER_KEY);
    localStorage.removeItem('daily_verdict_vault_pin_hash');
    localStorage.removeItem('daily_verdict_vault_pin');
  }
}

// 1. Full-Screen Gatekeeper Lock Screen
export function VaultLockGatekeeper({ isLocked, onUnlock }) {
  const [pinInput, setPinInput] = useState('');
  const [errorShake, setErrorShake] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const currentUser = getCurrentUser();

  useEffect(() => {
    if (pinInput.length === 4) {
      const isCorrect = verifyStoredVaultPin(pinInput);
      if (isCorrect) {
        soundEngine.playSuccessChime();
        setPinInput('');
        onUnlock();
      } else {
        soundEngine.playRoughTone();
        setErrorShake(true);
        setTimeout(() => {
          setPinInput('');
          setErrorShake(false);
        }, 500);
      }
    }
  }, [pinInput, onUnlock]);

  const handleDigit = (digit) => {
    if (pinInput.length < 4) {
      soundEngine.playClick();
      setPinInput(prev => prev + digit);
    }
  };

  const handleDelete = () => {
    soundEngine.playClick();
    setPinInput(prev => prev.slice(0, -1));
  };

  const handleEmergencyReset = async () => {
    if (!currentUser) {
      alert('You must be logged in with your Google account to perform an emergency PIN reset.');
      return;
    }
    if (window.confirm(`Reset Vault PIN for ${currentUser.email}? This will remove the PIN lock and let you set a new one.`)) {
      setIsResetting(true);
      await setVaultPin(null);
      soundEngine.playSuccessChime();
      setIsResetting(false);
      onUnlock();
    }
  };

  if (!isLocked) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-[#FFFDF5] animate-fade-in">
      <div className={`max-w-xs w-full text-center space-y-6 ${errorShake ? 'animate-shake' : ''}`}>
        {/* Shield Icon */}
        <div className="w-16 h-16 mx-auto rounded-3xl bg-[#FDC800] border-3 border-black flex items-center justify-center shadow-[4px_4px_0px_#000000]">
          <Lock className="w-8 h-8 text-black stroke-[2.5]" />
        </div>

        <div>
          <h2 className="font-display font-black text-2xl uppercase tracking-tight text-black">
            Vault Locked
          </h2>
          <p className="text-xs font-mono text-neutral-600 mt-1 font-bold">
            Enter 4-digit PIN to access reflections
          </p>
        </div>

        {/* PIN Indicator Dots */}
        <div className="flex justify-center gap-4 py-2">
          {[0, 1, 2, 3].map((idx) => {
            const isFilled = pinInput.length > idx;
            return (
              <div
                key={idx}
                className={`w-5 h-5 rounded-full border-2 border-black transition-all duration-200 ${
                  isFilled 
                    ? 'bg-[#00E599] scale-110 shadow-[1px_1px_0px_#000000]' 
                    : 'bg-white'
                }`}
              />
            );
          })}
        </div>

        {/* Numpad */}
        <div className="grid grid-cols-3 gap-2.5 max-w-[240px] mx-auto pt-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleDigit(String(digit))}
              className="py-3 bg-white hover:bg-neutral-100 border-2 border-black rounded-2xl font-display font-black text-lg text-black shadow-[2px_2px_0px_#000000] cursor-pointer active:scale-95 transition-all"
            >
              {digit}
            </button>
          ))}
          <div />
          <button
            type="button"
            onClick={() => handleDigit('0')}
            className="py-3 bg-white hover:bg-neutral-100 border-2 border-black rounded-2xl font-display font-black text-lg text-black shadow-[2px_2px_0px_#000000] cursor-pointer active:scale-95 transition-all"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="py-3 bg-neutral-100 hover:bg-neutral-200 border-2 border-black rounded-2xl font-mono font-bold text-sm text-black shadow-[2px_2px_0px_#000000] cursor-pointer flex items-center justify-center active:scale-95 transition-all"
            title="Delete digit"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-center gap-1.5 text-[10px] font-mono text-neutral-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Salted SHA-256 Cryptographic Hash Active</span>
          </div>

          {currentUser && (
            <button
              type="button"
              onClick={handleEmergencyReset}
              disabled={isResetting}
              className="text-[10px] font-mono font-bold text-neutral-500 hover:text-black underline cursor-pointer"
            >
              Forgot PIN? Reset with {currentUser.displayName || currentUser.email}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// 2. Settings Modal PIN Setup Component with Dedicated Warning Dialog
export function VaultPinSettings({ onPinUpdated }) {
  const isEnabled = isVaultPinActive();
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');

  const handleSavePin = async (e) => {
    e.preventDefault();
    if (newPin.length !== 4) {
      setError('PIN must be exactly 4 digits');
      return;
    }
    if (newPin !== confirmPin) {
      setError('PINs do not match. Please re-enter.');
      return;
    }
    await setVaultPin(newPin);
    setShowSetupModal(false);
    setNewPin('');
    setConfirmPin('');
    setError('');
    soundEngine.playSuccessChime();
    if (onPinUpdated) onPinUpdated();
  };

  const handleDisablePin = async () => {
    if (window.confirm('Are you sure you want to disable your vault PIN? Your reflections will no longer be locked.')) {
      await setVaultPin(null);
      setShowSetupModal(false);
      soundEngine.playClick();
      if (onPinUpdated) onPinUpdated();
    }
  };

  return (
    <>
      <div className="bg-white border-2 border-black rounded-2xl p-4 shadow-[3px_3px_0px_#000000] space-y-3">
        <div className="flex items-start justify-between gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="w-10 h-10 shrink-0 aspect-square min-w-10 min-h-10 rounded-xl bg-[#FDC800] border-2 border-black flex items-center justify-center shadow-[1px_1px_0px_#000000]">
              <KeyRound className="w-4 h-4 text-black stroke-[2.5]" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-display font-black text-sm uppercase truncate">
                Private 4-Digit Vault PIN
              </h4>
              <p className="text-[11px] font-mono text-neutral-600 truncate">
                {isEnabled ? 'Vault locked with SHA-256 cryptographic protection' : 'Set a private PIN to lock your reflections'}
              </p>
            </div>
          </div>

          {isEnabled ? (
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setShowSetupModal(true)}
                className="px-2.5 py-1.5 rounded-xl border-2 border-black font-mono text-xs font-black bg-[#FDC800] text-black shadow-[1.5px_1.5px_0px_#000000] cursor-pointer active:scale-95 transition-all"
              >
                CHANGE
              </button>
              <button
                type="button"
                onClick={handleDisablePin}
                className="px-2.5 py-1.5 rounded-xl border-2 border-black font-mono text-xs font-black bg-neutral-200 text-neutral-800 hover:bg-red-100 hover:text-red-700 shadow-[1.5px_1.5px_0px_#000000] cursor-pointer active:scale-95 transition-all"
              >
                DISABLE
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                setError('');
                setNewPin('');
                setConfirmPin('');
                setShowSetupModal(true);
              }}
              className="px-3 py-1.5 rounded-xl border-2 border-black font-display font-black text-xs uppercase bg-[#00E599] text-black shadow-[2px_2px_0px_#000000] cursor-pointer shrink-0 active:scale-95 transition-all"
            >
              SETUP PIN
            </button>
          )}
        </div>
      </div>

      {/* Prominent High-Contrast Security Warning & PIN Setup Dialog */}
      {showSetupModal && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-[#FFFDF5] border-3 border-black rounded-3xl p-5 sm:p-7 max-w-md w-full shadow-[8px_8px_0px_#000000] relative space-y-4">
            
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setShowSetupModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 border-2 border-black text-black cursor-pointer shadow-[1px_1px_0px_#000000] active:scale-95"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#FF4D4D] border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_#000000] shrink-0">
                <ShieldAlert className="w-6 h-6 text-white stroke-[2.5]" />
              </div>
              <div>
                <span className="px-2 py-0.5 rounded-md bg-[#FF4D4D] text-white border border-black font-mono text-[9px] font-black uppercase">
                  SECURITY NOTICE
                </span>
                <h3 className="font-display font-black text-lg sm:text-xl uppercase tracking-tight text-black mt-0.5">
                  Vault PIN Gatekeeper
                </h3>
              </div>
            </div>

            {/* BOLD CRITICAL WARNING BANNER */}
            <div className="p-4 bg-red-50 border-3 border-red-600 rounded-2xl space-y-2 text-red-950">
              <div className="flex items-center gap-2 font-display font-black text-sm uppercase text-red-700">
                <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 stroke-3" />
                <span>IMPORTANT: READ CAREFULLY</span>
              </div>
              <p className="font-mono font-black text-xs leading-relaxed uppercase">
                ⚠️ IF YOU FORGET THIS PIN, YOUR VAULT IS PERMANENTLY LOCKED. THERE IS NO "FORGOT PIN" RECOVERY.
              </p>
              <p className="font-mono text-[11px] text-neutral-700 leading-tight">
                Your PIN is hashed with <strong>SHA-256 + Salt</strong>. Nobody (not even administrators) can decrypt or recover your PIN. Write it down in a safe location.
              </p>
            </div>

            {/* PIN Entry Form */}
            <form onSubmit={handleSavePin} className="space-y-3 pt-1">
              <div className="space-y-2">
                <div>
                  <label className="block text-[11px] font-mono font-black uppercase text-black mb-1">
                    1. Enter 4-Digit PIN
                  </label>
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={4}
                    placeholder="••••"
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-4 py-2.5 text-center text-lg font-mono font-black tracking-widest border-2 border-black rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-black shadow-[2px_2px_0px_#000000]"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono font-black uppercase text-black mb-1">
                    2. Re-Confirm 4-Digit PIN
                  </label>
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={4}
                    placeholder="••••"
                    value={confirmPin}
                    onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-4 py-2.5 text-center text-lg font-mono font-black tracking-widest border-2 border-black rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-black shadow-[2px_2px_0px_#000000]"
                  />
                </div>
              </div>

              {error && (
                <div className="p-2.5 bg-red-100 border-2 border-red-500 rounded-xl text-red-800 text-xs font-mono font-black text-center">
                  {error}
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowSetupModal(false)}
                  className="px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 border-2 border-black rounded-xl font-mono text-xs font-bold text-black cursor-pointer"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={newPin.length !== 4 || confirmPin.length !== 4}
                  className="px-5 py-2.5 bg-[#00E599] hover:bg-emerald-400 disabled:opacity-40 border-2 border-black rounded-xl font-display font-black text-xs uppercase text-black shadow-[2.5px_2.5px_0px_#000000] cursor-pointer active:scale-95 flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4 stroke-3" />
                  <span>ACTIVATE VAULT PIN</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </>
  );
}
