// All canvas drawing for Double Take: the frame, the two harbor panels with
// their found markers and hint pulse, the HUD (counter, clock bar, score,
// level), and the title, level-clear, win and time-up screens. Everything is
// painted from code; the only art is the scene painter in scenes.js.

import { VIEW, PANEL, HUD, PALETTES, LEVELS, SCORE } from './config.js';
import { paintScene } from './scenes.js';

function text(ctx, str, x, y, size, fill, align = 'left', weight = '700') {
  ctx.font = `${weight} ${size}px system-ui, 'Segoe UI', sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillStyle = fill;
  ctx.fillText(str, x, y);
}

function panelFrame(ctx, x, y, w, h) {
  ctx.fillStyle = HUD.panelEdge;
  ctx.fillRect(x - 5, y - 5, w + 10, h + 10);
  ctx.strokeStyle = 'rgba(0,0,0,0.35)';
  ctx.lineWidth = 2;
  ctx.strokeRect(x - 5, y - 5, w + 10, h + 10);
}

// A found marker: a gold ring with a check, drawn on both panels.
function marker(ctx, x, y, r, pop) {
  const rr = r * (1 + pop * 0.25);
  ctx.beginPath();
  ctx.arc(x, y, rr, 0, Math.PI * 2);
  ctx.strokeStyle = HUD.markerEdge;
  ctx.lineWidth = 5;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x, y, rr, 0, Math.PI * 2);
  ctx.strokeStyle = HUD.marker;
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - rr * 0.45, y);
  ctx.lineTo(x - rr * 0.12, y + rr * 0.38);
  ctx.lineTo(x + rr * 0.5, y - rr * 0.35);
  ctx.strokeStyle = HUD.marker;
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.stroke();
}

// A red X flash where a misclick landed.
function missFlash(ctx, x, y) {
  ctx.strokeStyle = HUD.bad;
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x - 10, y - 10);
  ctx.lineTo(x + 10, y + 10);
  ctx.moveTo(x + 10, y - 10);
  ctx.lineTo(x - 10, y + 10);
  ctx.stroke();
}

// The hint: a pulsing ring around one unfound difference.
function hintPulse(ctx, x, y, r, phase) {
  const pulse = 1 + Math.sin(phase * Math.PI * 2 * 2) * 0.12;
  ctx.beginPath();
  ctx.arc(x, y, r * pulse, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(255,255,255,0.9)';
  ctx.lineWidth = 3;
  ctx.setLineDash([8, 6]);
  ctx.stroke();
  ctx.setLineDash([]);
}

function drawPanels(ctx, game, phase) {
  const palette = PALETTES[game.level.hour];
  const origins = [
    { x: PANEL.leftX, mutations: new Set() },
    { x: PANEL.rightX, mutations: game.mutations },
  ];
  for (const o of origins) {
    panelFrame(ctx, o.x, PANEL.top, PANEL.width, PANEL.height);
    paintScene(ctx, o.x, PANEL.top, palette, o.mutations, phase);
    // markers on every found difference, on both pictures
    for (const d of game.differences) {
      if (!game.found.has(d.key)) continue;
      const pop = game.flashAt && game.flashAt.x === d.x && game.elapsed < game.flashUntil ? 1 : 0;
      marker(ctx, o.x + d.x, PANEL.top + d.y, d.r * 0.82, pop);
    }
    if (game.hintKey && game.elapsed < game.hintUntil) {
      const d = game.differences.find((dd) => dd.key === game.hintKey);
      if (d) hintPulse(ctx, o.x + d.x, PANEL.top + d.y, d.r, phase);
    }
  }
  // the misclick flash, on the panel that was clicked (stored in panel space
  // with a side flag by input.js through game.flashSide)
  if (game.flashAt && game.elapsed < game.flashUntil && game.flashSide !== undefined) {
    const ox = game.flashSide === 0 ? PANEL.leftX : PANEL.rightX;
    missFlash(ctx, ox + game.flashAt.x, PANEL.top + game.flashAt.y);
  }
  // labels under each panel
  text(ctx, 'ORIGINAL', PANEL.leftX + PANEL.width / 2, PANEL.top + PANEL.height + 26, 17, HUD.dim, 'center');
  text(ctx, 'SPOT THE CHANGES', PANEL.rightX + PANEL.width / 2, PANEL.top + PANEL.height + 26, 17, HUD.dim, 'center');
}

function drawHud(ctx, game) {
  const left = game.remaining;
  // Title + level on the left
  text(ctx, 'DOUBLE TAKE', 24, 34, 30, HUD.ink);
  text(ctx, `Level ${game.levelIndex + 1} of ${LEVELS.length} — ${game.level.name}`, 24, 66, 17, HUD.dim, 'left', '600');

  // The counter the brief asks for: how many differences remain.
  const counter = `${left} difference${left === 1 ? '' : 's'} left`;
  text(ctx, counter, VIEW.width / 2, 34, 30, left === 0 ? HUD.good : HUD.accent, 'center');
  // found pips under the counter
  const total = game.differences.length;
  const pipW = 22;
  const startX = VIEW.width / 2 - (total * pipW) / 2;
  for (let i = 0; i < total; i++) {
    ctx.beginPath();
    ctx.arc(startX + i * pipW + pipW / 2, 62, 7, 0, Math.PI * 2);
    ctx.fillStyle = i < game.found.size ? HUD.good : 'rgba(255,255,255,0.25)';
    ctx.fill();
  }

  // Score, hints and best on the right
  text(ctx, `Score ${game.score}`, VIEW.width - 24, 30, 24, HUD.ink, 'right');
  text(ctx, `Hints ${game.hintsLeft}  ·  Best ${game.best}`, VIEW.width - 24, 58, 16, HUD.dim, 'right', '600');

  // Clock bar across the top of the panels
  const frac = Math.max(0, game.secondsLeft / game.level.seconds);
  const barX = PANEL.leftX;
  const barW = PANEL.rightX + PANEL.width - PANEL.leftX;
  ctx.fillStyle = 'rgba(255,255,255,0.18)';
  ctx.fillRect(barX, 88, barW, 14);
  ctx.fillStyle = frac < 0.2 ? HUD.bad : HUD.good;
  ctx.fillRect(barX, 88, barW * frac, 14);
  const secs = Math.ceil(game.secondsLeft);
  text(ctx, `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`, VIEW.width / 2, 95, 15, '#101820', 'center');

  // Last found label / controls line at the bottom
  const msg = game.lastFound && game.elapsed < game.flashUntil + 1.2
    ? `Found: ${game.lastFound.label}  +${SCORE.perFind}`
    : 'Click a difference on either picture · H hint · P pause · M sound';
  text(ctx, msg, VIEW.width / 2, VIEW.height - 24, 17, game.lastFound && game.elapsed < game.flashUntil + 1.2 ? HUD.good : HUD.dim, 'center', '600');
}

function dim(ctx) {
  ctx.fillStyle = 'rgba(10,16,24,0.72)';
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
}

function drawTitle(ctx, game) {
  dim(ctx);
  text(ctx, 'DOUBLE TAKE', VIEW.width / 2, 210, 64, HUD.ink, 'center');
  text(ctx, 'Spot the difference in the little harbor', VIEW.width / 2, 262, 24, HUD.accent, 'center', '600');
  const lines = [
    'Two near-identical pictures. The right one hides a few changes:',
    'something missing, something moved, something in another colour.',
    'Click each difference on either picture before the clock runs out.',
    `A wrong click costs ${SCORE.misclickPenaltySeconds} seconds. H spends a hint.`,
    'Three hunts: Harbor Dawn, Market Noon, Festival Dusk.',
  ];
  lines.forEach((line, i) => text(ctx, line, VIEW.width / 2, 330 + i * 34, 19, HUD.ink, 'center', '500'));
  text(ctx, 'Click or press Space to start', VIEW.width / 2, 560, 24, HUD.good, 'center');
  if (game.best > 0) text(ctx, `Best score ${game.best}`, VIEW.width / 2, 600, 18, HUD.dim, 'center', '600');
}

function drawClear(ctx, game) {
  dim(ctx);
  text(ctx, `${game.level.name} cleared!`, VIEW.width / 2, 250, 44, HUD.good, 'center');
  text(ctx, `All ${game.differences.length} differences found`, VIEW.width / 2, 308, 22, HUD.ink, 'center', '600');
  text(ctx, `Time bonus +${game.lastBonus || 0}`, VIEW.width / 2, 346, 20, HUD.accent, 'center', '600');
  text(ctx, `Score ${game.score}`, VIEW.width / 2, 396, 26, HUD.ink, 'center');
  text(ctx, 'Click or press Space for the next hunt', VIEW.width / 2, 480, 22, HUD.good, 'center');
}

function drawWin(ctx, game) {
  dim(ctx);
  text(ctx, 'HARBOR MASTER!', VIEW.width / 2, 220, 52, HUD.accent, 'center');
  text(ctx, 'Every difference in all three hunts, found.', VIEW.width / 2, 276, 22, HUD.ink, 'center', '600');
  const stars = game.stars();
  for (let i = 0; i < 3; i++) {
    text(ctx, '★', VIEW.width / 2 + (i - 1) * 56, 340, 48, i < stars ? HUD.marker : 'rgba(255,255,255,0.25)', 'center');
  }
  text(ctx, `Final score ${game.score}`, VIEW.width / 2, 410, 30, HUD.ink, 'center');
  text(ctx, `Misclicks ${game.misclicks}  ·  Best ${game.best}`, VIEW.width / 2, 452, 19, HUD.dim, 'center', '600');
  text(ctx, 'Click or press Space to play again', VIEW.width / 2, 540, 22, HUD.good, 'center');
}

function drawOver(ctx, game) {
  dim(ctx);
  text(ctx, 'TIME UP', VIEW.width / 2, 240, 52, HUD.bad, 'center');
  text(ctx, `${game.remaining} difference${game.remaining === 1 ? '' : 's'} still hidden in ${game.level.name}`, VIEW.width / 2, 300, 22, HUD.ink, 'center', '600');
  text(ctx, `Score ${game.score}`, VIEW.width / 2, 356, 28, HUD.ink, 'center');
  text(ctx, 'Click or press Space to try again', VIEW.width / 2, 460, 22, HUD.good, 'center');
}

// The keyboard crosshair, drawn when the player steers with the arrow keys.
function drawCrosshair(ctx, cursor) {
  if (!cursor.active) return;
  const ox = cursor.side === 0 ? PANEL.leftX : PANEL.rightX;
  const x = ox + cursor.x;
  const y = PANEL.top + cursor.y;
  ctx.strokeStyle = HUD.marker;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(x, y, 16, 0, Math.PI * 2);
  ctx.moveTo(x - 24, y);
  ctx.lineTo(x - 8, y);
  ctx.moveTo(x + 8, y);
  ctx.lineTo(x + 24, y);
  ctx.moveTo(x, y - 24);
  ctx.lineTo(x, y - 8);
  ctx.moveTo(x, y + 8);
  ctx.lineTo(x, y + 24);
  ctx.stroke();
}

// Draw the whole frame for the current game state.
export function render(ctx, game, cursor, paused) {
  ctx.fillStyle = HUD.frame;
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  const phase = (game.elapsed % 8) / 8;
  drawPanels(ctx, game, phase);
  drawHud(ctx, game);
  drawCrosshair(ctx, cursor);
  if (game.screen === 'title') drawTitle(ctx, game);
  else if (game.screen === 'clear') drawClear(ctx, game);
  else if (game.screen === 'win') drawWin(ctx, game);
  else if (game.screen === 'over') drawOver(ctx, game);
  else if (paused) {
    dim(ctx);
    text(ctx, 'PAUSED', VIEW.width / 2, VIEW.height / 2, 44, HUD.ink, 'center');
    text(ctx, 'P to resume', VIEW.width / 2, VIEW.height / 2 + 48, 20, HUD.dim, 'center', '600');
  }
}
