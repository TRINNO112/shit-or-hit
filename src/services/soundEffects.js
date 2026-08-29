// Organic Tactile UI Micro-Acoustics Engine for Verdict OS
// Synthesized using Web Audio API: Zero latency, ultra-short (<80ms), satisfying ASMR clicks & organic pops

class SoundEngine {
  constructor() {
    this.ctx = null;
  }

  init() {
    if (typeof window === 'undefined') return false;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return false;
      if (!this.ctx || this.ctx.state === 'suspended') {
        this.ctx = new AudioCtx();
      }
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return true;
    } catch (e) {
      return false;
    }
  }

  // 1★ Rough: Muffled Organic Wood Thud / Low-Pass Impact (Subtle, grounding, non-jarring)
  playRough() {
    if (!this.init()) return;
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

    osc.start(t);
    osc.stop(t + 0.07);
  }

  // 2★ Down: Gentle Dual Teardrop Bubble Pop (Soft, organic, soothing)
  playDown() {
    if (!this.init()) return;
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
    osc1.start(t);
    osc1.stop(t + 0.04);

    // Blip 2 (gentle low settle)
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(220, t + 0.035);
    osc2.frequency.exponentialRampToValueAtTime(130, t + 0.08);
    gain2.gain.setValueAtTime(0.1, t + 0.035);
    gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
    osc2.connect(gain2);
    gain2.connect(this.ctx.destination);
    osc2.start(t + 0.035);
    osc2.stop(t + 0.08);
  }

  // 3★ Okay: Crisp Nintendo Switch-style Tactile Mechanical Click
  playOkay() {
    if (!this.init()) return;
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

    osc.start(t);
    osc.stop(t + 0.028);
  }

  // 4★ Good: Warm Wooden Kalimba / Marimba Pop (Uplifting, clean, joyful)
  playGood() {
    if (!this.init()) return;
    const t = this.ctx.currentTime;

    // Harmonic Fundamental (G5)
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(783.99, t);
    osc1.frequency.exponentialRampToValueAtTime(392.00, t + 0.06);
    gain1.gain.setValueAtTime(0.16, t);
    gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
    osc1.connect(gain1);
    gain1.connect(this.ctx.destination);
    osc1.start(t);
    osc1.stop(t + 0.06);

    // Warm Overtone
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(1174.66, t + 0.015);
    osc2.frequency.exponentialRampToValueAtTime(587.33, t + 0.075);
    gain2.gain.setValueAtTime(0.12, t + 0.015);
    gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.075);
    osc2.connect(gain2);
    gain2.connect(this.ctx.destination);
    osc2.start(t + 0.015);
    osc2.stop(t + 0.075);
  }

  // 5★ Peak: Sparkling Crystalline Chime Bloom (Pleasant, bright, celebratory, non-screeching)
  playPeak() {
    if (!this.init()) return;
    const t = this.ctx.currentTime;
    const notes = [523.25, 659.25, 1046.50]; // C5, E5, C6 clean bloom

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

      osc.start(startT);
      osc.stop(startT + 0.1);
    });
  }

  // Standard tactile UI tap
  playClick() {
    if (!this.init()) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(160, t + 0.02);

    gain.gain.setValueAtTime(0.06, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.02);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.02);
  }

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
}

export const soundFx = new SoundEngine();
