// 🎵 Unified Zero-Asset Procedural Web Audio Sound Synthesizer (0 kb external files)
// Organic tactile micro-acoustics, haptics, and responsive audio for Verdict OS

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.enabled = typeof window !== 'undefined' && localStorage.getItem('daily_verdict_sound_fx') === 'enabled';
  }

  initContext() {
    if (typeof window === 'undefined') return false;
    try {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      return !!this.ctx;
    } catch (e) {
      return false;
    }
  }

  isSoundEnabled() {
    if (typeof window === 'undefined') return false;
    // Default OFF: Only true if explicitly set to 'enabled'
    return localStorage.getItem('daily_verdict_sound_fx') === 'enabled';
  }

  setSoundEnabled(enable) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('daily_verdict_sound_fx', enable ? 'enabled' : 'muted');
      this.enabled = enable;
      if (enable) {
        this.initContext();
        this.playClick();
      }
    }
  }

  // Haptic feedback trigger for tactile mobile satisfaction
  triggerHaptic(pattern = [15, 25, 15]) {
    if (typeof window !== 'undefined' && typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(pattern);
      } catch (e) {}
    }
  }

  cleanupNodes(...nodes) {
    nodes.forEach(n => {
      if (n && typeof n.disconnect === 'function') {
        try { n.disconnect(); } catch (e) {}
      }
    });
  }

  // Standard tactile UI tap / Nintendo Switch-style click
  playClick() {
    this.triggerHaptic(12);
    if (!this.isSoundEnabled()) return;
    try {
      if (!this.initContext()) return;
      const t = this.ctx.currentTime;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800, t);
      osc.frequency.exponentialRampToValueAtTime(120, t + 0.04);

      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.onended = () => this.cleanupNodes(osc, gain);
      osc.start(t);
      osc.stop(t + 0.04);
    } catch (e) {}
  }

  // 1★ Rough: Muffled Organic Wood Thud / Low-Pass Impact
  playRough() {
    this.triggerHaptic([30, 20]);
    if (!this.isSoundEnabled()) return;
    try {
      if (!this.initContext()) return;
      const t = this.ctx.currentTime;

      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(140, t);
      osc.frequency.exponentialRampToValueAtTime(45, t + 0.07);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(220, t);
      filter.frequency.exponentialRampToValueAtTime(60, t + 0.07);

      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.onended = () => this.cleanupNodes(osc, filter, gain);
      osc.start(t);
      osc.stop(t + 0.07);
    } catch (e) {}
  }

  // 2★ Down: Gentle Dual Teardrop Bubble Pop
  playDown() {
    this.triggerHaptic([20, 15]);
    if (!this.isSoundEnabled()) return;
    try {
      if (!this.initContext()) return;
      const t = this.ctx.currentTime;

      // Blip 1
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(280, t);
      osc1.frequency.exponentialRampToValueAtTime(180, t + 0.04);
      gain1.gain.setValueAtTime(0.12, t);
      gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
      osc1.connect(gain1);
      gain1.connect(this.ctx.destination);
      osc1.onended = () => this.cleanupNodes(osc1, gain1);
      osc1.start(t);
      osc1.stop(t + 0.04);

      // Blip 2
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(220, t + 0.035);
      osc2.frequency.exponentialRampToValueAtTime(130, t + 0.08);
      gain2.gain.setValueAtTime(0.1, t + 0.035);
      gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
      osc2.connect(gain2);
      gain2.connect(this.ctx.destination);
      osc2.onended = () => this.cleanupNodes(osc2, gain2);
      osc2.start(t + 0.035);
      osc2.stop(t + 0.08);
    } catch (e) {}
  }

  // 3★ Okay: Crisp Nintendo Switch-style Tactile Mechanical Click
  playOkay() {
    this.triggerHaptic(14);
    if (!this.isSoundEnabled()) return;
    try {
      if (!this.initContext()) return;
      const t = this.ctx.currentTime;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, t);
      osc.frequency.exponentialRampToValueAtTime(220, t + 0.025);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(800, t);
      filter.Q.setValueAtTime(3, t);

      gain.gain.setValueAtTime(0.14, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.028);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.onended = () => this.cleanupNodes(osc, filter, gain);
      osc.start(t);
      osc.stop(t + 0.028);
    } catch (e) {}
  }

  // 4★ Good: Warm Wooden Kalimba / Marimba Pop
  playGood() {
    this.triggerHaptic([15, 25, 15]);
    if (!this.isSoundEnabled()) return;
    try {
      if (!this.initContext()) return;
      const t = this.ctx.currentTime;

      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(783.99, t);
      osc1.frequency.exponentialRampToValueAtTime(392.00, t + 0.06);
      gain1.gain.setValueAtTime(0.16, t);
      gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
      osc1.connect(gain1);
      gain1.connect(this.ctx.destination);
      osc1.onended = () => this.cleanupNodes(osc1, gain1);
      osc1.start(t);
      osc1.stop(t + 0.06);

      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(1174.66, t + 0.015);
      osc2.frequency.exponentialRampToValueAtTime(587.33, t + 0.075);
      gain2.gain.setValueAtTime(0.12, t + 0.015);
      gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.075);
      osc2.connect(gain2);
      gain2.connect(this.ctx.destination);
      osc2.onended = () => this.cleanupNodes(osc2, gain2);
      osc2.start(t + 0.015);
      osc2.stop(t + 0.075);
    } catch (e) {}
  }

  // 5★ Peak: Sparkling Crystalline Chime Bloom
  playPeak() {
    this.triggerHaptic([20, 30, 40]);
    if (!this.isSoundEnabled()) return;
    try {
      if (!this.initContext()) return;
      const t = this.ctx.currentTime;
      const notes = [523.25, 659.25, 1046.50];

      notes.forEach((freq, idx) => {
        const startT = t + idx * 0.025;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startT);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.05, startT + 0.08);

        gain.gain.setValueAtTime(0.12, startT);
        gain.gain.exponentialRampToValueAtTime(0.001, startT + 0.1);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.onended = () => this.cleanupNodes(osc, gain);
        osc.start(startT);
        osc.stop(startT + 0.1);
      });
    } catch (e) {}
  }

  // Mood Dispatcher: Maps 1-5 rating cleanly to acoustic tone
  playMood(rating) {
    switch (Number(rating)) {
      case 1:
        this.playRough();
        break;
      case 2:
        this.playDown();
        break;
      case 3:
        this.playOkay();
        break;
      case 4:
        this.playGood();
        break;
      case 5:
        this.playPeak();
        break;
      default:
        this.playClick();
    }
  }

  // Success Chime Alias
  playSuccess() {
    this.playSuccessChime();
  }

  // High-Performance Glass Resonance Chime (Used for Good / Peak verdicts)
  playSuccessChime() {
    this.triggerHaptic([20, 30, 40]);
    if (!this.isSoundEnabled()) return;
    try {
      if (!this.initContext()) return;
      const now = this.ctx.currentTime;
      [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.04);
        gain.gain.setValueAtTime(0.15, now + i * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.04 + 0.35);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.onended = () => this.cleanupNodes(osc, gain);
        osc.start(now + i * 0.04);
        osc.stop(now + i * 0.04 + 0.35);
      });
    } catch (e) {}
  }

  // Low Somber Resonance (Used for Rough / Down verdicts)
  playRoughTone() {
    this.triggerHaptic([40, 20, 40]);
    if (!this.isSoundEnabled()) return;
    try {
      if (!this.initContext()) return;
      const now = this.ctx.currentTime;
      [220, 196, 174.61].forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now + i * 0.06);
        gain.gain.setValueAtTime(0.12, now + i * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.4);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.onended = () => this.cleanupNodes(osc, gain);
        osc.start(now + i * 0.06);
        osc.stop(now + i * 0.06 + 0.4);
      });
    } catch (e) {}
  }

  // Triumphant Milestone Arpeggio
  playMilestoneArpeggio() {
    this.triggerHaptic([30, 20, 30, 20, 40]);
    if (!this.isSoundEnabled()) return;
    try {
      if (!this.initContext()) return;
      const now = this.ctx.currentTime;
      [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.06);
        gain.gain.setValueAtTime(0.18, now + i * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.5);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.onended = () => this.cleanupNodes(osc, gain);
        osc.start(now + i * 0.06);
        osc.stop(now + i * 0.06 + 0.5);
      });
    } catch (e) {}
  }

  // Camera Shutter Synthesizer
  playCameraShutter() {
    this.triggerHaptic([10, 30, 10]);
    if (!this.isSoundEnabled()) return;
    try {
      if (!this.initContext()) return;
      const now = this.ctx.currentTime;
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.05);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(1000, now);
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.04);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      noise.onended = () => this.cleanupNodes(noise, filter, gain);
      noise.start(now);
      noise.stop(now + 0.04);

      const osc = this.ctx.createOscillator();
      const clickGain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140, now + 0.03);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.07);
      clickGain.gain.setValueAtTime(0.2, now + 0.03);
      clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
      osc.connect(clickGain);
      clickGain.connect(this.ctx.destination);
      osc.onended = () => this.cleanupNodes(osc, clickGain);
      osc.start(now + 0.03);
      osc.stop(now + 0.07);
    } catch (e) {}
  }

  // Capsule Unlock Mechanical Tumbler
  playCapsuleUnlock() {
    this.triggerHaptic([25, 15, 35]);
    if (!this.isSoundEnabled()) return;
    try {
      if (!this.initContext()) return;
      const now = this.ctx.currentTime;
      [350, 480, 620, 880].forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, now + idx * 0.05);
        gain.gain.setValueAtTime(0.08, now + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.08);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.onended = () => this.cleanupNodes(osc, gain);
        osc.start(now + idx * 0.05);
        osc.stop(now + idx * 0.05 + 0.08);
      });
    } catch (e) {}
  }

  // Capsule Seal Wax Clack
  playCapsuleSeal() {
    this.triggerHaptic([35, 20, 35]);
    if (!this.isSoundEnabled()) return;
    try {
      if (!this.initContext()) return;
      const now = this.ctx.currentTime;
      [220, 180, 120].forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.04);
        gain.gain.setValueAtTime(0.18, now + idx * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.04 + 0.1);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.onended = () => this.cleanupNodes(osc, gain);
        osc.start(now + idx * 0.04);
        osc.stop(now + idx * 0.04 + 0.1);
      });
    } catch (e) {}
  }

  // Mechanical Typewriter Key Clack
  playTypewriterKey() {
    this.triggerHaptic(8);
    if (!this.isSoundEnabled()) return;
    try {
      if (!this.initContext()) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(950, now);
      osc.frequency.exponentialRampToValueAtTime(250, now + 0.02);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.onended = () => this.cleanupNodes(osc, gain);
      osc.start(now);
      osc.stop(now + 0.02);
    } catch (e) {}
  }

  // Thermal Receipt Printer Buzz
  playThermalPrint() {
    this.triggerHaptic([10, 10, 10]);
    if (!this.isSoundEnabled()) return;
    try {
      if (!this.initContext()) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, now);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.onended = () => this.cleanupNodes(osc, gain);
      osc.start(now);
      osc.stop(now + 0.08);
    } catch (e) {}
  }
}

export const soundEngine = new SoundEngine();
export const soundFx = soundEngine;
export default soundEngine;
