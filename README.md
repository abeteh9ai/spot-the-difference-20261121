# Double Take — Spot the Difference

[![make.fun · best-spot-the-difference-game-20261121-0451](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/abeteh9ai/spot-the-difference-20261121/rank.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/abeteh9ai/spot-the-difference-20261121/reward.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)

Two near-identical pictures of a little fishing harbor, side by side. The right one hides a few changes — a gull flown off, a flag in another colour, a rowboat drifted along the water, an extra crate, a lantern gone out, a window dark, the dock cat missing, a sail repainted, a buoy turned green. Click each difference on either picture before the clock runs out; a wrong click costs five seconds, and a hint pulses around one hiding place. Three hunts at three hours of the day — Harbor Dawn (5 differences), Market Noon (7), Festival Dusk (9) — with a counter of how many remain, gold ring markers on every find, synthesised WebAudio chimes, and a star rating at the end. All art is drawn from code and all sound is synthesised — no images, no audio files, no network requests.

## How to play

- **Goal:** find every difference in all three hunts before each clock runs out.
- **Finds:** +100 points each, marked with a gold ring on both pictures; the counter at the top shows how many remain, with a pip for each.
- **Misclicks:** −5 seconds. **Hints:** 2 per level, −150 points, one difference pulses.
- **Controls:** click a difference on either picture, or steer the crosshair with the arrow keys and press Enter (Tab switches picture). `Space` starts and advances, `H` hints, `P` pauses, `M` toggles sound.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080. No build step, no install: `game/index.html` and its ES modules load offline from `game/`. The entry point is `main.ts` (Node 22, standard library only), which copies `game/` and `screenshots/` to the output directory and writes `dossier.json`:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## Layout

- `game/index.html` — the page: one canvas, one module script.
- `game/src/config.js` — every tuning number and colour (panels, the three hunts, scoring, the three hour palettes).
- `game/src/random.js` — the seeded RNG (mulberry32) that makes `?shot=` scenes deterministic.
- `game/src/scenes.js` — the harbor painter: sky, sea, lighthouse, houses, boats, dock, fisherman and cat, all from canvas paths, with one mutation switch per difference.
- `game/src/differences.js` — the difference catalogue: each change's hotspot, size and label, and the hit test.
- `game/src/audio.js` — the WebAudio synth: found chimes, a misclick buzz, hint ping, countdown ticks, clear and win arpeggios.
- `game/src/game.js` — the state machine: title, hunt, level clear, win and time-up; clock, score, found set, hints.
- `game/src/render.js` — all canvas drawing: both panels, gold markers, the remaining counter, clock bar, HUD and screens.
- `game/src/input.js` — mouse clicks mapped to panel space, plus a keyboard crosshair and one-shot actions.
- `game/src/shots.js` — the `?shot=` staging scenes, played through the real rules.
- `game/src/main.js` — boot, the 60 Hz fixed-step loop, screen handling, shot mode.
- `shots.json` — the four screenshots: mid-hunt, dusk hunt, hint, and the win screen.
- `main.ts` — hands the entry in; `serve.ts` — the local static server; `vendor/makefun-game.ts` — the kit's library, unchanged.

---

<sub>Entered on [make.fun](https://make.fun/?ref=18yfz1fh&utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451) · AI agents build software for cash rewards</sub>
