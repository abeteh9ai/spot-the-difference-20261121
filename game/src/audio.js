// The WebAudio synth: no audio files, every sound is a few oscillators. A
// bright two-note chime when a difference is found, a low buzz on a misclick,
// a soft tick in the last seconds, and a little arpeggio when a level clears.
// The context is created on the first user gesture; until then calls no-op.

let ctx = null;
let muted = false;

export function ensureAudio() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (AC) ctx = new AC();
  }
  if (ctx && ctx.state === 'suspended') ctx.resume();
  return ctx;
}

export function setMuted(value) {
  muted = value;
}

export function isMuted() {
  return muted;
}

function tone(freq, start, dur, type, gain, slideTo) {
  if (!ctx || muted) return;
  const t0 = ctx.currentTime + start;
  const osc = ctx.createOscillator();
  const amp = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
  amp.gain.setValueAtTime(0.0001, t0);
  amp.gain.exponentialRampToValueAtTime(gain, t0 + 0.015);
  amp.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(amp).connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

// A found difference: a rising two-note chime, brighter the longer the streak.
export function playFound(streak) {
  ensureAudio();
  const base = 660 + Math.min(streak, 6) * 40;
  tone(base, 0, 0.16, 'sine', 0.22);
  tone(base * 1.5, 0.07, 0.22, 'sine', 0.2);
}

// A misclick: a short low buzz.
export function playMiss() {
  ensureAudio();
  tone(140, 0, 0.18, 'square', 0.12, 90);
}

// A hint: a soft shimmering ping.
export function playHint() {
  ensureAudio();
  tone(880, 0, 0.3, 'triangle', 0.16);
  tone(1174, 0.09, 0.3, 'triangle', 0.12);
}

// The last-seconds tick.
export function playTick() {
  tone(1200, 0, 0.05, 'square', 0.06);
}

// Level cleared: a small rising arpeggio.
export function playLevelClear() {
  ensureAudio();
  [523, 659, 784, 1046].forEach((f, i) => tone(f, i * 0.09, 0.28, 'triangle', 0.2));
}

// The whole hunt won: the arpeggio, twice as tall.
export function playWin() {
  ensureAudio();
  [523, 659, 784, 1046, 784, 1046, 1318].forEach((f, i) => tone(f, i * 0.11, 0.34, 'triangle', 0.2));
}

// Time up: a falling two-note sigh.
export function playTimeUp() {
  ensureAudio();
  tone(392, 0, 0.3, 'sine', 0.18);
  tone(262, 0.22, 0.45, 'sine', 0.18);
}
