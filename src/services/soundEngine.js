// Zero-Asset Procedural Web Audio Sound Synthesizer (0 kb external files)

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.enabled = typeof window !== 'undefined' && localStorage.getItem('daily_verdict_sound_fx') === 'enabled';
  }

  initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
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
        localStorage.removeItem('daily_verdict_sound_fx');
        this.enabled = false;
      }
    }
  }

  // 1. Crisp Mechanical Switch Click
  playClick() {
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

  // 2. High-Energy Hit/Peak Chime (For 4★ / 5★ ratings & task completions)
  playSuccessChime() {
    if (!this.isSoundEnabled()) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.06);

        const startTime = this.ctx.currentTime + idx * 0.06;
        gain.gain.setValueAtTime(0.15, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.25);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.25);
      });
    } catch (e) {}
  }

  // 3. Low Grounding Frequency (For 1★ / 2★ ratings)
  playRoughTone() {
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
}

export const soundEngine = new SoundEngine();
