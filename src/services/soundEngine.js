// Zero-Asset Procedural Web Audio Sound Synthesizer (0 kb external files)

class SoundEngine {
  constructor() {
    this.ctx = null;
    // Default to OFF (muted) unless user explicitly turned it ON
    this.enabled = typeof window !== 'undefined' && localStorage.getItem('daily_verdict_sound_fx') === 'enabled';
  }

  initContext() {
    if (typeof window === 'undefined') return;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  isSoundEnabled() {
    if (typeof window === 'undefined') return false;
    // Default OFF: Only true if explicitly set to 'enabled'
    return localStorage.getItem('daily_verdict_sound_fx') === 'enabled';
  }

  setSoundEnabled(enable) {
    if (typeof window !== 'undefined') {
      if (enable) {
        localStorage.setItem('daily_verdict_sound_fx', 'enabled');
        this.enabled = true;
        this.initContext();
        this.playClick();
      } else {
        localStorage.setItem('daily_verdict_sound_fx', 'muted');
        this.enabled = false;
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

  // 1. Crisp Mechanical Switch Click
  playClick() {
    this.triggerHaptic(12);
    if (!this.isSoundEnabled()) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.04);
    } catch (e) {
      // Audio autoplay policy fallback
    }
  }

  // 2. High-Performance Glass Resonance Chime (Used for Good / Peak verdicts)
  playSuccessChime() {
    this.triggerHaptic([20, 30, 40]);
    if (!this.isSoundEnabled()) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.05);

        gain.gain.setValueAtTime(0, now + i * 0.05);
        gain.gain.linearRampToValueAtTime(0.18, now + i * 0.05 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.45);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + i * 0.05);
        osc.stop(now + i * 0.05 + 0.45);
      });
    } catch (e) {}
  }

  // 3. Low Sub-Bass Thud (Used for Rough / Down verdicts)
  playRoughTone() {
    this.triggerHaptic([35, 45]);
    if (!this.isSoundEnabled()) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(140, this.ctx.currentTime + 0.3);

      gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.3);
    } catch (e) {}
  }

  // 4. Milestone Victory Arpeggio (For 100% tasks locked or streak milestones)
  playMilestoneArpeggio() {
    if (!this.isSoundEnabled()) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const notes = [440, 554.37, 659.25, 880, 1108.73];
      notes.forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        const start = this.ctx.currentTime + i * 0.07;
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.15, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.3);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(start);
        osc.stop(start + 0.3);
      });
    } catch (e) {}
  }
  // 5. Crisp Camera Shutter / Poster Capture Sound (For Wallpaper exports & card saves)
  playCameraShutter() {
    this.triggerHaptic([15, 20]);
    if (!this.isSoundEnabled()) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      // White noise burst simulating camera mechanical shutter
      const bufferSize = this.ctx.sampleRate * 0.05;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1400, now);
      filter.Q.setValueAtTime(3, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start(now);
    } catch (e) {}
  }
}

export const soundEngine = new SoundEngine();
