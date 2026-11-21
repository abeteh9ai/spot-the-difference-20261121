// The difference catalogue. Each entry names one mutation the scene painter
// can apply to the right-hand panel, where it sits (panel coordinates, read
// from the painter's own layout so hotspots always match the art), how wide
// its click target is, and what to call it when it is found. Levels take the
// first N entries, so later hunts hide more, and smaller, changes.

import { POS } from './scenes.js';

export const DIFFERENCES = [
  { key: 'gull-missing', label: 'A gull has flown off', ...POS.gull2, r: 30 },
  { key: 'flag-color', label: 'The lighthouse flag changed colour', ...POS.flag, r: 28 },
  { key: 'boat-moved', label: 'The rowboat drifted along', x: POS.rowboat.x + 24, y: POS.rowboat.y, r: 44 },
  { key: 'crate-extra', label: 'An extra crate on the dock', x: POS.crateStack.x + 6, y: POS.crateStack.y, r: 40 },
  { key: 'lantern-off', label: 'A lantern went out', x: POS.lantern1.x, y: POS.lantern1.y + 4, r: 30 },
  { key: 'window-dark', label: 'A window went dark', ...POS.windowB, r: 30 },
  { key: 'cat-missing', label: 'The dock cat is gone', ...POS.cat, r: 32 },
  { key: 'sail-color', label: 'The sail changed colour', ...POS.sail, r: 40 },
  { key: 'buoy-color', label: 'A buoy changed colour', ...POS.buoy1, r: 28 },
];

// The differences in play for a level: the first `count` catalogue entries.
export function differencesForLevel(count) {
  return DIFFERENCES.slice(0, count);
}

// The mutation set the right panel is painted with for those differences.
export function mutationSet(differences) {
  return new Set(differences.map((d) => d.key));
}

// The difference whose hotspot holds a panel-space point, or null. Found
// differences are skipped so a second click on a marker is not a misclick.
export function differenceAt(differences, foundKeys, x, y) {
  for (const d of differences) {
    if (foundKeys.has(d.key)) continue;
    const dx = x - d.x;
    const dy = y - d.y;
    if (dx * dx + dy * dy <= d.r * d.r) return d;
  }
  return null;
}
