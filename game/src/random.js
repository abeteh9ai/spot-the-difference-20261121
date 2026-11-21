// The seeded RNG (mulberry32). The harbor scene and the ?shot= staging both
// draw from it, so a given seed always paints the same scene and stages the
// same screenshot.

export function makeRng(seed) {
  let state = (seed >>> 0) || 1;
  return function next() {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// A small range helper over an rng stream: uniform in [lo, hi).
export function range(rng, lo, hi) {
  return lo + rng() * (hi - lo);
}

// Pick one element of a list with the rng stream.
export function pick(rng, list) {
  return list[Math.floor(rng() * list.length) % list.length];
}
