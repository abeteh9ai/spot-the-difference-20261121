// Every tuning number for Double Take in one place: the logical canvas, the two
// scene panels, the level table (scene, difference count, clock), scoring, and
// the palette the scene painter and the HUD share.

export const VIEW = { width: 1280, height: 720 };

// Scene panels in logical pixels. The harbor scene is painted into a panel of
// this size; difference hotspots are stored in the same panel coordinates.
export const PANEL = { width: 596, height: 448, leftX: 24, rightX: 660, top: 118 };

// The three hunts. Each level repaints the harbor at a different hour with a
// different set of differences and a tighter clock.
export const LEVELS = [
  { name: 'Harbor Dawn', hour: 'dawn', differences: 5, seconds: 150 },
  { name: 'Market Noon', hour: 'noon', differences: 7, seconds: 180 },
  { name: 'Festival Dusk', hour: 'dusk', differences: 9, seconds: 210 },
];

export const SCORE = {
  perFind: 100,
  perSecondLeft: 2,
  misclickPenaltySeconds: 5,
  hintCost: 150,
  hintsPerLevel: 2,
};

// Palette per hour of day: sky gradient stops, sea, sand, rooftops, accents.
export const PALETTES = {
  dawn: {
    skyTop: '#7fb2d9', skyMid: '#f2c98a', skyLow: '#f7e3b0',
    sun: '#ffd76e', sea: '#3e7ca6', seaDeep: '#2f5f82', sand: '#e8d9a8',
    roofA: '#c65b4e', roofB: '#7a9e7e', wallA: '#f4ead2', wallB: '#e8d5b5',
    wood: '#8a6242', woodDark: '#6b4a30', flag: '#e4572e', lantern: '#ffb347',
    cloud: '#ffffff', rock: '#8d99ae',
  },
  noon: {
    skyTop: '#4aa3e8', skyMid: '#8fd0f5', skyLow: '#d8f3ff',
    sun: '#fff3a0', sea: '#2f8fc4', seaDeep: '#22719e', sand: '#f2e3ae',
    roofA: '#d64541', roofB: '#4f9d69', wallA: '#fff6dd', wallB: '#f0dcb0',
    wood: '#96683f', woodDark: '#744d2c', flag: '#f4b41a', lantern: '#ffd166',
    cloud: '#ffffff', rock: '#9aa5b1',
  },
  dusk: {
    skyTop: '#3d348b', skyMid: '#c65d8f', skyLow: '#f7a072',
    sun: '#ff9e5e', sea: '#4a5d8f', seaDeep: '#37477a', sand: '#d9b98a',
    roofA: '#8e4a56', roofB: '#5d7a68', wallA: '#e8d8c0', wallB: '#d3bd97',
    wood: '#75502f', woodDark: '#573a20', flag: '#ffd166', lantern: '#ffcf6e',
    cloud: '#e8c8d8', rock: '#6b7a99',
  },
};

// HUD colours, shared by render.js so the frame reads as one style.
export const HUD = {
  frame: '#16202b',
  panelEdge: '#f4ead2',
  ink: '#f7f3e8',
  dim: '#b9c4ce',
  accent: '#ffb347',
  good: '#7bd88a',
  bad: '#ff7a6e',
  marker: '#ffd23f',
  markerEdge: '#8a5a00',
};
