// The harbor scene painter. It draws one 596x448 panel of a small fishing
// harbor at a given hour, entirely from canvas paths. The left panel is
// painted with an empty mutation set; the right panel gets the level's set,
// and each mutation key changes exactly one element (a missing gull, a flag
// in another colour, a boat shifted along the water, ...). Both panels share
// the same animation phase, so the gentle water shimmer never reads as a
// difference.

import { PANEL } from './config.js';

// Where the mutable elements sit, in panel coordinates. differences.js reads
// these to place its hotspots, so the two files can never drift apart.
export const POS = {
  gull2: { x: 252, y: 66 },
  flag: { x: 64, y: 52 },
  rowboat: { x: 296, y: 288 },
  crateStack: { x: 472, y: 398 },
  lantern1: { x: 152, y: 352 },
  windowB: { x: 502, y: 252 },
  cat: { x: 212, y: 404 },
  sail: { x: 182, y: 238 },
  buoy1: { x: 424, y: 318 },
};

function ellipse(ctx, x, y, rx, ry, fill) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
}

function rect(ctx, x, y, w, h, fill) {
  ctx.fillStyle = fill;
  ctx.fillRect(x, y, w, h);
}

function tri(ctx, x1, y1, x2, y2, x3, y3, fill) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.lineTo(x3, y3);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
}

function cloud(ctx, x, y, s, fill) {
  ellipse(ctx, x, y, 34 * s, 13 * s, fill);
  ellipse(ctx, x + 24 * s, y + 3 * s, 26 * s, 11 * s, fill);
  ellipse(ctx, x - 26 * s, y + 4 * s, 22 * s, 10 * s, fill);
  ellipse(ctx, x + 4 * s, y - 8 * s, 22 * s, 12 * s, fill);
}

function gull(ctx, x, y, s, ink) {
  ctx.strokeStyle = ink;
  ctx.lineWidth = 2.2 * s;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x - 11 * s, y);
  ctx.quadraticCurveTo(x - 4 * s, y - 6 * s, x, y);
  ctx.quadraticCurveTo(x + 4 * s, y - 6 * s, x + 11 * s, y);
  ctx.stroke();
}

function house(ctx, x, y, w, h, wall, roof, lit, darkWindow) {
  rect(ctx, x, y, w, h, wall);
  tri(ctx, x - 6, y, x + w + 6, y, x + w / 2, y - h * 0.62, roof);
  rect(ctx, x + w * 0.42, y + h * 0.45, w * 0.18, h * 0.55, '#5d4630');
  const win = (wx, wy, on) => rect(ctx, wx, wy, w * 0.16, h * 0.2, on ? lit : '#33404f');
  win(x + w * 0.12, y + h * 0.22, true);
  win(x + w * 0.7, y + h * 0.22, !darkWindow);
  win(x + w * 0.12, y + h * 0.58, true);
  // chimney with a curl of smoke
  rect(ctx, x + w * 0.72, y - h * 0.62, w * 0.12, h * 0.3, '#7a6a5a');
  ellipse(ctx, x + w * 0.78, y - h * 0.72, 6, 5, 'rgba(255,255,255,0.75)');
  ellipse(ctx, x + w * 0.84, y - h * 0.86, 8, 6, 'rgba(255,255,255,0.55)');
}

function boat(ctx, x, y, s, hull, sailFill) {
  // hull
  ctx.beginPath();
  ctx.moveTo(x - 34 * s, y);
  ctx.lineTo(x + 34 * s, y);
  ctx.lineTo(x + 24 * s, y + 12 * s);
  ctx.lineTo(x - 24 * s, y + 12 * s);
  ctx.closePath();
  ctx.fillStyle = hull;
  ctx.fill();
  // mast and sail
  rect(ctx, x - 1.5 * s, y - 52 * s, 3 * s, 52 * s, '#6b4a30');
  tri(ctx, x + 3 * s, y - 50 * s, x + 3 * s, y - 4 * s, x + 28 * s, y - 4 * s, sailFill);
  tri(ctx, x - 3 * s, y - 44 * s, x - 3 * s, y - 4 * s, x - 20 * s, y - 4 * s, '#e8e2d2');
}

function rowboat(ctx, x, y, s) {
  ctx.beginPath();
  ctx.moveTo(x - 26 * s, y);
  ctx.lineTo(x + 26 * s, y);
  ctx.lineTo(x + 18 * s, y + 9 * s);
  ctx.lineTo(x - 18 * s, y + 9 * s);
  ctx.closePath();
  ctx.fillStyle = '#a34a3a';
  ctx.fill();
  rect(ctx, x - 20 * s, y - 3 * s, 40 * s, 3 * s, '#c46a52');
  // one oar resting across
  ctx.strokeStyle = '#8a6242';
  ctx.lineWidth = 2.4 * s;
  ctx.beginPath();
  ctx.moveTo(x - 6 * s, y - 2 * s);
  ctx.lineTo(x + 16 * s, y + 10 * s);
  ctx.stroke();
}

function crate(ctx, x, y, s, wood, dark) {
  rect(ctx, x, y, 26 * s, 22 * s, wood);
  ctx.strokeStyle = dark;
  ctx.lineWidth = 1.6 * s;
  ctx.strokeRect(x + 1, y + 1, 26 * s - 2, 22 * s - 2);
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + 26 * s, y + 22 * s);
  ctx.moveTo(x + 26 * s, y);
  ctx.lineTo(x, y + 22 * s);
  ctx.stroke();
}

function barrel(ctx, x, y, s, wood, dark) {
  ellipse(ctx, x, y, 11 * s, 4 * s, dark);
  rect(ctx, x - 11 * s, y, 22 * s, 20 * s, wood);
  ellipse(ctx, x, y + 20 * s, 11 * s, 4 * s, dark);
  rect(ctx, x - 11 * s, y + 5 * s, 22 * s, 2.4 * s, dark);
  rect(ctx, x - 11 * s, y + 13 * s, 22 * s, 2.4 * s, dark);
}

function lantern(ctx, x, y, lit, glow, dark) {
  rect(ctx, x - 2, y, 4, 34, dark);
  rect(ctx, x - 7, y - 14, 14, 14, '#3a3f47');
  rect(ctx, x - 5, y - 12, 10, 10, lit ? glow : '#5a6068');
  if (lit) {
    const g = ctx.createRadialGradient(x, y - 7, 2, x, y - 7, 30);
    g.addColorStop(0, 'rgba(255,190,90,0.55)');
    g.addColorStop(1, 'rgba(255,190,90,0)');
    ctx.fillStyle = g;
    ctx.fillRect(x - 30, y - 37, 60, 60);
  }
}

function cat(ctx, x, y, s) {
  ellipse(ctx, x, y, 13 * s, 8 * s, '#3d3d46'); // body
  ellipse(ctx, x + 11 * s, y - 6 * s, 7 * s, 6.5 * s, '#3d3d46'); // head
  tri(ctx, x + 6 * s, y - 11 * s, x + 9 * s, y - 16 * s, x + 11 * s, y - 10 * s, '#3d3d46');
  tri(ctx, x + 13 * s, y - 11 * s, x + 16 * s, y - 16 * s, x + 17 * s, y - 9 * s, '#3d3d46');
  ctx.strokeStyle = '#3d3d46';
  ctx.lineWidth = 3 * s;
  ctx.beginPath();
  ctx.moveTo(x - 12 * s, y + 2 * s);
  ctx.quadraticCurveTo(x - 22 * s, y - 4 * s, x - 20 * s, y - 12 * s);
  ctx.stroke();
  ellipse(ctx, x + 13.5 * s, y - 6.5 * s, 1.1 * s, 1.4 * s, '#ffd76e'); // eye
}

// Paint one panel. (ox, oy) is the panel's top-left corner on the canvas;
// palette is the hour's colours; mutations is a Set of difference keys;
// phase in [0,1) drives the shared shimmer so both panels animate together.
export function paintScene(ctx, ox, oy, palette, mutations, phase) {
  const W = PANEL.width;
  const H = PANEL.height;
  const has = (key) => mutations.has(key);
  ctx.save();
  ctx.beginPath();
  ctx.rect(ox, oy, W, H);
  ctx.clip();
  ctx.translate(ox, oy);

  // Sky
  const sky = ctx.createLinearGradient(0, 0, 0, 200);
  sky.addColorStop(0, palette.skyTop);
  sky.addColorStop(0.55, palette.skyMid);
  sky.addColorStop(1, palette.skyLow);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, 205);

  // Sun with a soft halo
  const sunX = 470, sunY = 62;
  const halo = ctx.createRadialGradient(sunX, sunY, 6, sunX, sunY, 70);
  halo.addColorStop(0, 'rgba(255,225,150,0.8)');
  halo.addColorStop(1, 'rgba(255,225,150,0)');
  ctx.fillStyle = halo;
  ctx.fillRect(sunX - 70, sunY - 70, 140, 140);
  ellipse(ctx, sunX, sunY, 24, 24, palette.sun);

  // Clouds drift a few pixels with the shared phase
  const drift = Math.sin(phase * Math.PI * 2) * 4;
  cloud(ctx, 120 + drift, 46, 1, palette.cloud);
  cloud(ctx, 330 - drift, 30, 0.8, palette.cloud);
  cloud(ctx, 520 + drift, 96, 0.7, palette.cloud);

  // Gulls — five of them; the mutation removes the second
  const ink = '#2c3e50';
  gull(ctx, 210, 88, 1, ink);
  if (!has('gull-missing')) gull(ctx, POS.gull2.x, POS.gull2.y, 1.1, ink);
  gull(ctx, 300, 102, 0.85, ink);
  gull(ctx, 392, 58, 0.95, ink);
  gull(ctx, 150, 120, 0.8, ink);

  // Distant hills
  ctx.beginPath();
  ctx.moveTo(0, 205);
  ctx.quadraticCurveTo(140, 150, 300, 196);
  ctx.quadraticCurveTo(440, 160, 596, 200);
  ctx.lineTo(596, 205);
  ctx.closePath();
  ctx.fillStyle = palette.seaDeep;
  ctx.globalAlpha = 0.35;
  ctx.fill();
  ctx.globalAlpha = 1;

  // Sea
  const sea = ctx.createLinearGradient(0, 200, 0, 335);
  sea.addColorStop(0, palette.sea);
  sea.addColorStop(1, palette.seaDeep);
  ctx.fillStyle = sea;
  ctx.fillRect(0, 200, W, 135);
  // wave strokes + sparkles, shimmering with the shared phase
  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.lineWidth = 1.6;
  for (let i = 0; i < 26; i++) {
    const wx = 18 + ((i * 67) % 560);
    const wy = 214 + ((i * 37) % 108);
    const wob = Math.sin(phase * Math.PI * 2 + i * 1.7) * 3;
    ctx.beginPath();
    ctx.moveTo(wx + wob, wy);
    ctx.quadraticCurveTo(wx + 8 + wob, wy - 3, wx + 16 + wob, wy);
    ctx.stroke();
  }
  ctx.fillStyle = 'rgba(255,240,190,0.5)';
  for (let i = 0; i < 14; i++) {
    const sx = 430 + ((i * 23) % 90);
    const sy = 208 + ((i * 29) % 110);
    ctx.fillRect(sx, sy, 7, 2);
  }

  // Lighthouse on the left rocks
  ellipse(ctx, 58, 330, 62, 20, palette.rock);
  ellipse(ctx, 30, 338, 40, 14, palette.rock);
  rect(ctx, 44, 120, 30, 200, '#f2ede0');
  rect(ctx, 44, 152, 30, 26, '#c64541');
  rect(ctx, 44, 204, 30, 26, '#c64541');
  rect(ctx, 44, 256, 30, 26, '#c64541');
  rect(ctx, 40, 104, 38, 16, '#3a3f47');
  rect(ctx, 50, 108, 18, 9, palette.lantern);
  tri(ctx, 38, 104, 80, 104, 59, 86, '#3a3f47');
  // flag on the lighthouse — the mutation recolours it
  rect(ctx, POS.flag.x - 1, 60, 2.4, 28, '#3a3f47');
  tri(ctx, POS.flag.x + 1, 60, POS.flag.x + 1, 72, POS.flag.x + 18, 66,
    has('flag-color') ? '#2f6fd0' : palette.flag);
  // keeper's cottage at the base
  house(ctx, 86, 286, 52, 40, palette.wallB, palette.roofB, palette.lantern, false);

  // Houses on the right shore; one window can go dark
  house(ctx, 396, 262, 62, 52, palette.wallA, palette.roofA, palette.lantern, false);
  house(ctx, 468, 250, 70, 60, palette.wallB, palette.roofB, palette.lantern, has('window-dark'));
  house(ctx, 540, 272, 48, 42, palette.wallA, palette.roofA, palette.lantern, false);

  // Sailboat — the mutation recolours its sail
  boat(ctx, POS.sail.x, 292, 1, '#7a4a2b', has('sail-color') ? '#2ea6a0' : '#f7f2e2');
  // Rowboat — the mutation shifts it along the water
  rowboat(ctx, POS.rowboat.x + (has('boat-moved') ? 48 : 0), POS.rowboat.y, 1);
  // A second small boat far off
  boat(ctx, 520, 226, 0.55, '#5d6d7e', '#e8e2d2');

  // Buoys — the mutation recolours the first
  const buoy = (x, y, fill) => {
    tri(ctx, x - 8, y + 8, x + 8, y + 8, x, y - 8, fill);
    rect(ctx, x - 8, y + 8, 16, 4, '#3a3f47');
  };
  buoy(POS.buoy1.x, POS.buoy1.y, has('buoy-color') ? '#3fae5a' : '#d64541');
  buoy(120, 300, '#d64541');

  // Sand strip and the wooden dock in the foreground
  ctx.fillStyle = palette.sand;
  ctx.fillRect(0, 335, W, 30);
  ctx.fillStyle = palette.wood;
  ctx.fillRect(0, 362, W, 86);
  ctx.strokeStyle = palette.woodDark;
  ctx.lineWidth = 2;
  for (let x = 0; x < W; x += 42) {
    ctx.beginPath();
    ctx.moveTo(x, 362);
    ctx.lineTo(x - 10, 448);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.moveTo(0, 386);
  ctx.lineTo(W, 386);
  ctx.moveTo(0, 414);
  ctx.lineTo(W, 414);
  ctx.stroke();
  // dock posts
  for (const px of [40, 180, 330, 470, 560]) rect(ctx, px, 340, 10, 30, palette.woodDark);

  // Crates on the dock — the mutation adds one more to the stack
  crate(ctx, POS.crateStack.x - 40, POS.crateStack.y, 1, palette.wood, palette.woodDark);
  crate(ctx, POS.crateStack.x - 12, POS.crateStack.y, 1, palette.wood, palette.woodDark);
  crate(ctx, POS.crateStack.x - 26, POS.crateStack.y - 23, 1, palette.wood, palette.woodDark);
  if (has('crate-extra')) crate(ctx, POS.crateStack.x + 16, POS.crateStack.y, 1, palette.wood, palette.woodDark);
  crate(ctx, 300, 402, 0.9, palette.wood, palette.woodDark);

  // Barrels and a rope coil
  barrel(ctx, 96, 398, 1, palette.wood, palette.woodDark);
  barrel(ctx, 122, 402, 0.9, palette.wood, palette.woodDark);
  ctx.strokeStyle = '#c9a86a';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(380, 420, 18, 7, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(380, 417, 12, 5, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Lanterns on posts — the mutation leaves the first unlit
  lantern(ctx, POS.lantern1.x, POS.lantern1.y + 14, !has('lantern-off'), palette.lantern, palette.woodDark);
  lantern(ctx, 430, 366, true, palette.lantern, palette.woodDark);
  lantern(ctx, 548, 362, true, palette.lantern, palette.woodDark);

  // Fisherman with a rod at the dock edge
  const fx = 262, fy = 392;
  ellipse(ctx, fx, fy - 26, 7, 8, '#e8b48c'); // head
  rect(ctx, fx - 9, fy - 36, 18, 5, '#c64541'); // cap
  rect(ctx, fx - 6, fy - 18, 12, 20, '#3e6b8f'); // coat
  rect(ctx, fx - 6, fy + 2, 5, 16, '#4a4a55');
  rect(ctx, fx + 2, fy + 2, 5, 16, '#4a4a55');
  ctx.strokeStyle = '#6b4a30';
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(fx + 8, fy - 12);
  ctx.lineTo(fx + 44, fy - 34);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.7)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(fx + 44, fy - 34);
  ctx.lineTo(fx + 44, fy + 16);
  ctx.stroke();
  ellipse(ctx, fx + 44, fy + 18, 3, 2, '#ffd76e');

  // The dock cat — the mutation removes it
  if (!has('cat-missing')) cat(ctx, POS.cat.x, POS.cat.y, 1);

  // A gull perched on a post, and shells on the sand
  gull(ctx, 335, 336, 1.3, '#2c3e50');
  ctx.fillStyle = '#fff4e0';
  for (const [sx, sy] of [[60, 348], [150, 356], [240, 346], [350, 352], [500, 348], [560, 356]]) {
    ellipse(ctx, sx, sy, 5, 3, '#fff4e0');
  }

  ctx.restore();
}
