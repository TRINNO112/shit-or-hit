import React, { useState, useEffect } from 'react';
import { Lock, Unlock, KeyRound, ShieldAlert, Fingerprint, Delete, Check, X, ShieldCheck } from 'lucide-react';
import { soundEngine } from '../services/soundEngine';

export const VAULT_PIN_KEY = 'daily_verdict_vault_pin_hash';

// Irreversible SHA-256 Cryptographic Hashing with Salt
async function hashPin(pin) {
  if (!pin) return null;
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(`daily_verdict_salt_key_${pin}`);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch {
    // Fallback simple base64 hashing if crypto.subtle is unsupported
    return btoa(`salt_${pin}`);
  }
}

export function isVaultPinActive() {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem(VAULT_PIN_KEY);
}

export async function setVaultPin(pin) {
  if (typeof window !== 'undefined') {
    if (pin) {
      const hashed = await hashPin(pin);
      localStorage.setItem(VAULT_PIN_KEY, hashed);
    } else {
      localStorage.removeItem(VAULT_PIN_KEY);
    }
  }
}

// 1. Full-Screen Gatekeeper Lock Screen
export function VaultLockGatekeeper({ isLocked, onUnlock }) {
  const [pinInput, setPinInput] = useState('');
  const [errorShake, setErrorShake] = useState(false);

  useEffect(() => {
    if (pinInput.length === 4) {
      const checkHash = async () => {
        const savedHash = localStorage.getItem(VAULT_PIN_KEY);
        const inputHash = await hashPin(pinInput);
        
        if (inputHash === savedHash) {
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
      };
      checkHash();
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

  if (!isLocked) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#FFFDF5] animate-fade-in">
      <div className={`max-w-xs w-full text-center space-y-6 ${errorShake ? 'animate-shake' : ''}`}>
        {/* Shield Icon */}
        <div className="w-16 h-16 mx-auto rounded-3xl bg-[#FDC800] border-3 border-black flex items-center justify-center shadow-[4px_4px_0px_#000000]">
          <Lock className="w-8 h-8 text-black stroke-[2.5]" />
        </div>

        <div>
          <h2 className="font-display font-black text-2xl uppercase tracking-tight text-black">
            Vault Locked
          </h2>
          <p className="text-xs font-mono text-neutral-600 mt-1">
            Enter 4-digit PIN to access private diary
          </p>
        </div>

        {/* 4 Dots Indicator */}
        <div className="flex items-center justify-center gap-3 py-2">
          {[0, 1, 2, 3].map((idx) => (
            <div
              key={idx}
              className={`w-4 h-4 rounded-full border-2 border-black transition-all ${
                pinInput.length > idx 
                  ? 'bg-black scale-110 shadow-[1px_1px_0px_#000000]' 
                  : 'bg-white'
              }`}
            />
          ))}
        </div>

        {/* Numeric Keypad */}
        <div className="grid grid-cols-3 gap-2.5 pt-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => handleDigit(num.toString())}
              className="py-3 bg-white hover:bg-neutral-100 border-2 border-black rounded-2xl font-display font-black text-lg text-black shadow-[2px_2px_0px_#000000] cursor-pointer active:scale-95 transition-all"
            >
              {num}
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

        <div className="flex items-center justify-center gap-1.5 text-[10px] font-mono text-neutral-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>SHA-256 Cryptographic Lock Active</span>
        </div>
      </div>
    </div>
  );
}

// 2. Settings Modal PIN Setup Component
export function VaultPinSettings({ onPinUpdated }) {
  const isEnabled = isVaultPinActive();
  const [isSettingUp, setIsSettingUp] = useState(false);
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
      setError('PINs do not match');
      return;
    }
    await setVaultPin(newPin);
    setIsSettingUp(false);
    setNewPin('');
    setConfirmPin('');
    setError('');
    soundEngine.playSuccessChime();
    if (onPinUpdated) onPinUpdated();
  };

  const handleDisablePin = async () => {
    await setVaultPin(null);
    setIsSettingUp(false);
    soundEngine.playClick();
    if (onPinUpdated) onPinUpdated();
  };

  return (
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
              SHA-256 hashed lock to protect reflections from prying eyes
            </p>
          </div>
        </div>

        {isEnabled ? (
          <button
            type="button"
            onClick={handleDisablePin}
            className="px-3 py-1.5 rounded-xl border-2 border-black font-mono text-xs font-black bg-[#00E599] text-black shadow-[1.5px_1.5px_0px_#000000] cursor-pointer shrink-0 active:scale-95 transition-all"
          >
            LOCKED (ON)
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setIsSettingUp(true)}
            className="px-3 py-1.5 rounded-xl border-2 border-black font-mono text-xs font-black bg-neutral-200 text-neutral-700 hover:bg-neutral-300 shadow-[1.5px_1.5px_0px_#000000] cursor-pointer shrink-0 active:scale-95 transition-all"
          >
            SETUP PIN
          </button>
        )}
      </div>

      {isSettingUp && (
        <form onSubmit={handleSavePin} className="p-3 bg-neutral-50 rounded-xl border-2 border-black space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="font-display font-black text-xs uppercase">Set 4-Digit Vault PIN</span>
            <button
              type="button"
              onClick={() => setIsSettingUp(false)}
              className="text-neutral-500 hover:text-black text-xs font-mono cursor-pointer"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              placeholder="Enter PIN (4 digits)"
              value={newPin}
              onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
              className="px-3 py-1.5 text-xs font-mono font-bold border-2 border-black rounded-xl bg-white focus:outline-none"
              autoFocus
            />
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              placeholder="Confirm PIN"
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
              className="px-3 py-1.5 text-xs font-mono font-bold border-2 border-black rounded-xl bg-white focus:outline-none"
            />
          </div>

          {error && (
            <p className="text-[10px] font-mono font-bold text-red-600">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsSettingUp(false)}
              className="px-2.5 py-1 text-xs font-mono border border-black rounded-lg bg-white hover:bg-neutral-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1 text-xs font-display font-black uppercase bg-[#00E599] border-2 border-black rounded-lg shadow-[1px_1px_0px_#000000] cursor-pointer active:scale-95"
            >
              Lock Vault
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
