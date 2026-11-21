// The game state machine for Double Take: title, hunt, level clear, win and
// time-up. It owns the clock, the score, the found set, misclicks and hints,
// and answers the one question input asks — was that click a difference?

import { LEVELS, SCORE } from './config.js';
import { differencesForLevel, mutationSet, differenceAt } from './differences.js';
import { playFound, playMiss, playHint, playLevelClear, playWin, playTimeUp, playTick } from './audio.js';

export class Game {
  constructor() {
    this.screen = 'title'; // title | play | clear | win | over
    this.levelIndex = 0;
    this.score = 0;
    this.best = Number(localStorage.getItem('double-take-best') || 0);
    this.resetLevel(0);
    this.screen = 'title';
  }

  resetLevel(index) {
    this.levelIndex = index;
    this.level = LEVELS[index];
    this.differences = differencesForLevel(this.level.differences);
    this.mutations = mutationSet(this.differences);
    this.found = new Set();
    this.secondsLeft = this.level.seconds;
    this.hintsLeft = SCORE.hintsPerLevel;
    this.hintKey = null;
    this.hintUntil = 0;
    this.streak = 0;
    this.misclicks = 0;
    this.lastFound = null;
    this.flashAt = null;
    this.flashUntil = 0;
    this.tickSecond = -1;
    this.elapsed = 0;
  }

  start() {
    this.score = 0;
    this.resetLevel(0);
    this.screen = 'play';
  }

  get remaining() {
    return this.differences.length - this.found.size;
  }

  // Advance the clock by dt seconds. Returns nothing; screens change in place.
  update(dt) {
    this.elapsed += dt;
    if (this.screen !== 'play') return;
    this.secondsLeft -= dt;
    const whole = Math.ceil(this.secondsLeft);
    if (whole <= 5 && whole >= 1 && whole !== this.tickSecond) {
      this.tickSecond = whole;
      playTick();
    }
    if (this.secondsLeft <= 0) {
      this.secondsLeft = 0;
      this.screen = 'over';
      playTimeUp();
      this.saveBest();
    }
  }

  // A click in panel coordinates on either picture. Returns 'found', 'miss'
  // or 'ignored' (already found, or not playing).
  clickAt(x, y) {
    if (this.screen !== 'play') return 'ignored';
    const hit = differenceAt(this.differences, this.found, x, y);
    if (hit) {
      this.found.add(hit.key);
      this.streak += 1;
      this.score += SCORE.perFind;
      this.lastFound = hit;
      this.flashAt = { x: hit.x, y: hit.y };
      this.flashUntil = this.elapsed + 0.6;
      if (this.hintKey === hit.key) this.hintKey = null;
      playFound(this.streak);
      if (this.remaining === 0) this.clearLevel();
      return 'found';
    }
    // Clicking a marker that is already found is not a misclick.
    for (const d of this.differences) {
      if (!this.found.has(d.key)) continue;
      const dx = x - d.x;
      const dy = y - d.y;
      if (dx * dx + dy * dy <= d.r * d.r) return 'ignored';
    }
    this.misclicks += 1;
    this.streak = 0;
    this.secondsLeft = Math.max(0, this.secondsLeft - SCORE.misclickPenaltySeconds);
    this.flashAt = { x, y };
    this.flashUntil = this.elapsed + 0.35;
    playMiss();
    return 'miss';
  }

  // Spend a hint: pulse one unfound difference for a few seconds.
  useHint() {
    if (this.screen !== 'play' || this.hintsLeft <= 0) return false;
    const unfound = this.differences.filter((d) => !this.found.has(d.key));
    if (unfound.length === 0) return false;
    this.hintsLeft -= 1;
    this.score = Math.max(0, this.score - SCORE.hintCost);
    this.hintKey = unfound[0].key;
    this.hintUntil = this.elapsed + 3;
    playHint();
    return true;
  }

  clearLevel() {
    const bonus = Math.floor(this.secondsLeft) * SCORE.perSecondLeft;
    this.score += bonus;
    this.lastBonus = bonus;
    if (this.levelIndex + 1 >= LEVELS.length) {
      this.screen = 'win';
      playWin();
    } else {
      this.screen = 'clear';
      playLevelClear();
    }
    this.saveBest();
  }

  nextLevel() {
    if (this.screen !== 'clear') return;
    this.resetLevel(this.levelIndex + 1);
    this.screen = 'play';
  }

  saveBest() {
    if (this.score > this.best) {
      this.best = this.score;
      localStorage.setItem('double-take-best', String(this.best));
    }
  }

  // Stars for the win screen: by misclicks across the whole hunt.
  stars() {
    if (this.misclicks === 0) return 3;
    if (this.misclicks <= 4) return 2;
    return 1;
  }
}
