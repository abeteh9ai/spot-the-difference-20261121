// Mouse and keyboard input. Clicks on either panel become panel-space points
// for the game's hit test; the arrow keys steer a crosshair so the whole
// hunt can be played from the keyboard, Enter marks the spot, and Space, H,
// P and M are one-shot actions the main loop drains each frame.

import { VIEW, PANEL } from './config.js';

export class Input {
  constructor(canvas) {
    this.canvas = canvas;
    this.clicks = [];
    this.actions = [];
    this.cursor = { active: false, side: 1, x: PANEL.width / 2, y: PANEL.height / 2 };
    this.keys = new Set();

    canvas.addEventListener('pointerdown', (e) => {
      const p = this.toLogical(e.clientX, e.clientY);
      this.clicks.push(p);
      this.cursor.active = false;
    });

    window.addEventListener('keydown', (e) => {
      const k = e.key.toLowerCase();
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(k)) e.preventDefault();
      this.keys.add(k);
      if (k === ' ') this.actions.push('advance');
      else if (k === 'enter') this.actions.push('mark');
      else if (k === 'h') this.actions.push('hint');
      else if (k === 'p') this.actions.push('pause');
      else if (k === 'm') this.actions.push('mute');
      else if (k === 'tab') {
        e.preventDefault();
        this.cursor.side = this.cursor.side === 0 ? 1 : 0;
        this.cursor.active = true;
      }
    });
    window.addEventListener('keyup', (e) => this.keys.delete(e.key.toLowerCase()));
  }

  toLogical(clientX, clientY) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: ((clientX - rect.left) / rect.width) * VIEW.width,
      y: ((clientY - rect.top) / rect.height) * VIEW.height,
    };
  }

  // Which panel a logical point falls in, and where inside it. Null outside.
  panelPoint(p) {
    if (p.y < PANEL.top || p.y > PANEL.top + PANEL.height) return null;
    if (p.x >= PANEL.leftX && p.x <= PANEL.leftX + PANEL.width) {
      return { side: 0, x: p.x - PANEL.leftX, y: p.y - PANEL.top };
    }
    if (p.x >= PANEL.rightX && p.x <= PANEL.rightX + PANEL.width) {
      return { side: 1, x: p.x - PANEL.rightX, y: p.y - PANEL.top };
    }
    return null;
  }

  // Steer the keyboard crosshair; called once per fixed step.
  updateCursor(dt) {
    const speed = 340;
    let moved = false;
    if (this.keys.has('arrowleft')) { this.cursor.x -= speed * dt; moved = true; }
    if (this.keys.has('arrowright')) { this.cursor.x += speed * dt; moved = true; }
    if (this.keys.has('arrowup')) { this.cursor.y -= speed * dt; moved = true; }
    if (this.keys.has('arrowdown')) { this.cursor.y += speed * dt; moved = true; }
    if (moved) this.cursor.active = true;
    this.cursor.x = Math.max(0, Math.min(PANEL.width, this.cursor.x));
    this.cursor.y = Math.max(0, Math.min(PANEL.height, this.cursor.y));
  }

  drainClicks() {
    const out = this.clicks;
    this.clicks = [];
    return out;
  }

  drainActions() {
    const out = this.actions;
    this.actions = [];
    return out;
  }
}
