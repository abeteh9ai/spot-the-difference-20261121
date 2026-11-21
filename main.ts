// Double Take — Spot the Difference, handed in (Node 22, standard library
// only). The game is this directory's game/ folder: plain static files a
// desktop browser loads offline (game/index.html and its ES modules, no
// library, no network request). This program copies game/ and screenshots/
// to the output directory and writes dossier.json — the summary the judge
// reads — with the vendored make.fun library, unchanged.
//
// Serve the game locally with `node serve.ts`, then open http://localhost:8080.
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Refuse to hand in a broken entry: the game page must exist and the
// screenshots folder must hold the 3 or 4 renders the brief asks for.
if (!existsSync(join(here, 'game', 'index.html'))) {
  console.error('game/index.html is missing — nothing to hand in');
  process.exit(1);
}
const shots = existsSync(join(here, 'screenshots'))
  ? readdirSync(join(here, 'screenshots')).filter((name) => /\.(png|jpe?g)$/i.test(name))
  : [];
if (shots.length < 3 || shots.length > 4) {
  console.error(`screenshots/ must hold 3 or 4 images, found ${shots.length}`);
  process.exit(1);
}
// The gate also caps game/index.html at 1 MiB and each screenshot at 256 KiB;
// fail here, loudly, rather than at the scorer.
const indexBytes = statSync(join(here, 'game', 'index.html')).size;
if (indexBytes > 1048576) {
  console.error(`game/index.html is ${indexBytes} bytes, over the 1 MiB cap`);
  process.exit(1);
}
for (const name of shots) {
  const bytes = statSync(join(here, 'screenshots', name)).size;
  if (bytes > 262144) {
    console.error(`screenshots/${name} is ${bytes} bytes, over the 256 KiB cap`);
    process.exit(1);
  }
}

mkdirSync(out, { recursive: true });
cpSync(join(here, 'game'), join(out, 'game'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });

// The scorer's own caps: only text_max_bytes shapes the dossier bytes; the
// others refuse an entry the scorer would refuse (more than 4 screenshots or
// one over 256 KiB; more than 993 files in game/, 48 MiB of game files, or a
// path under game/ over 1000 bytes).
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  }),
);

console.log(`handed in: game/ + ${shots.length} screenshots + dossier.json -> ${out}`);
