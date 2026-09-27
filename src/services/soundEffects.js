// Re-export unified SoundEngine instance as soundFx for backwards compatibility
// All callers across Verdict OS now share a single, robust, mute-compliant audio engine

import { soundEngine, soundFx } from './soundEngine.js';

export const playMood = (rating) => soundEngine.playMood(rating);
export const playPeak = () => soundEngine.playPeak();
export const playRough = () => soundEngine.playRough();
export const playDown = () => soundEngine.playDown();
export const playOkay = () => soundEngine.playOkay();
export const playGood = () => soundEngine.playGood();

export { soundEngine, soundFx };
export default soundFx;
