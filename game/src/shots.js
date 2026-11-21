// The ?shot= staging scenes. Each one plays the real game — starting hunts
// and clicking the actual difference hotspots through game.clickAt — then
// freezes the clock at a fixed moment, so the screenshots are honest renders
// of the game's own rules and identical on every load.

import { LEVELS } from './config.js';

// Click the first n differences of the current level through the real rules.
function findFirst(game, n) {
  for (const d of game.differences.slice(0, n)) game.clickAt(d.x, d.y);
}

// Finish the current level by finding everything that is left.
function finishLevel(game) {
  for (const d of game.differences) {
    if (!game.found.has(d.key)) game.clickAt(d.x, d.y);
  }
}

// Stage a named scene on a fresh game. The clock is frozen afterwards by
// main.js, which stops advancing update() in shot mode.
export function stageShot(game, name) {
  game.start();
  if (name === 'play') {
    // Level 1 mid-hunt: three found and marked, two still hidden.
    findFirst(game, 3);
    game.secondsLeft = 95;
  } else if (name === 'hint') {
    // Level 2 with a hint pulsing on the next difference.
    finishLevel(game);
    game.nextLevel();
    findFirst(game, 2);
    game.useHint();
    game.secondsLeft = 130;
  } else if (name === 'level') {
    // Level 3 at dusk: five found, four still hidden.
    finishLevel(game);
    game.nextLevel();
    finishLevel(game);
    game.nextLevel();
    findFirst(game, 5);
    game.secondsLeft = 140;
  } else if (name === 'win') {
    // All three hunts completed through real clicks.
    for (let i = 0; i < LEVELS.length; i++) {
      finishLevel(game);
      if (game.screen === 'clear') game.nextLevel();
    }
  }
  // Freeze at a fixed moment so the shared shimmer phase is deterministic,
  // and let any find-flash settle.
  game.elapsed = 12.5;
  game.flashUntil = 0;
  if (game.hintKey) game.hintUntil = game.elapsed + 3;
  return game;
}
