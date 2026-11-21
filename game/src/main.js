// Boot and the fixed-step loop. Wires the canvas, the game and the input
// together, drains clicks and one-shot actions into the state machine, and
// renders every frame. With ?shot=<scene> it stages a deterministic scene
// (see shots.js) and freezes the clock for screenshots.

import { VIEW } from './config.js';
import { Game } from './game.js';
import { Input } from './input.js';
import { render } from './render.js';
import { stageShot } from './shots.js';
import { ensureAudio, setMuted, isMuted } from './audio.js';

const canvas = document.getElementById('game');
canvas.width = VIEW.width;
canvas.height = VIEW.height;
const ctx = canvas.getContext('2d');
const statusEl = document.getElementById('status');

const params = new URLSearchParams(location.search);
const shotName = params.get('shot');

const game = new Game();
const input = new Input(canvas);
let paused = false;

if (shotName) stageShot(game, shotName);

function announce() {
  if (!statusEl) return;
  if (game.screen === 'play') {
    statusEl.textContent = `${game.remaining} differences left in ${game.level.name}. Score ${game.score}.`;
  } else if (game.screen === 'win') {
    statusEl.textContent = `You found every difference. Final score ${game.score}.`;
  } else if (game.screen === 'over') {
    statusEl.textContent = `Time up. ${game.remaining} differences were still hidden.`;
  }
}

function advance() {
  ensureAudio();
  if (game.screen === 'title' || game.screen === 'win' || game.screen === 'over') game.start();
  else if (game.screen === 'clear') game.nextLevel();
}

function handleClick(p) {
  ensureAudio();
  if (game.screen !== 'play') {
    advance();
    return;
  }
  if (paused) return;
  const pp = input.panelPoint(p);
  if (!pp) return;
  game.flashSide = pp.side;
  game.clickAt(pp.x, pp.y);
  announce();
}

function handleAction(action) {
  if (action === 'advance') advance();
  else if (action === 'pause') paused = !paused;
  else if (action === 'mute') setMuted(!isMuted());
  else if (action === 'hint') {
    ensureAudio();
    game.useHint();
  } else if (action === 'mark') {
    if (game.screen !== 'play') {
      advance();
      return;
    }
    if (paused) return;
    ensureAudio();
    game.flashSide = input.cursor.side;
    game.clickAt(input.cursor.x, input.cursor.y);
    announce();
  }
}

const STEP = 1 / 60;
let last = performance.now();
let acc = 0;

function frame(now) {
  requestAnimationFrame(frame);
  let dt = (now - last) / 1000;
  last = now;
  if (dt > 0.25) dt = 0.25;
  if (!shotName) {
    acc += dt;
    while (acc >= STEP) {
      if (!paused) game.update(STEP);
      input.updateCursor(STEP);
      acc -= STEP;
    }
    for (const p of input.drainClicks()) handleClick(p);
    for (const a of input.drainActions()) handleAction(a);
  }
  render(ctx, game, input.cursor, paused);
}

announce();
requestAnimationFrame(frame);
