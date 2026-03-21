import { Container, Graphics } from 'pixi.js';

import { GameState } from './gameState';
import { getRandomInt } from './util';

const PETAL_COLORS = [0xFF8C7A, 0xFFB347, 0xFF85C0, 0xFFFF66, 0xABDEFF, 0xFF6E6E, 0xFFCCDD, 0xE8A0FF];
const BUSH_COLOR   = 0x3d7a2a;

// Scale factor: 0–1 based on smallest screen dimension
function screenScale(gameState: GameState): number {
  const dim = Math.min(gameState.width, gameState.height);
  if (dim < 450) return 0.25;
  if (dim < 600) return 0.45;
  if (dim < 800) return 0.65;
  if (dim < 1000) return 0.85;
  return 1.0;
}

export class Flowers {
  public static add(scene: Container, gameState: GameState) {
    const scale = screenScale(gameState);

    const grassCells = Object.keys(gameState.mainMap).filter((k) => {
      if (gameState.mainMap[k] !== 'G') return false;
      const col = parseInt(k.split('|')[0]);
      const row = parseInt(k.split('|')[1]);
      const dx = col * 50 + 25 - gameState.holePositionX;
      const dy = row * 50 + 25 - gameState.holePositionY;
      return Math.sqrt(dx * dx + dy * dy) > gameState.fairwayRadius * 1.1;
    });

    const clusterCount = Math.round(Math.min(18, grassCells.length / 12) * scale);
    const bushCount    = Math.round(Math.min(10, grassCells.length / 22) * scale);

    const used = new Set<string>();
    let attempts = 0;
    const max = grassCells.length * 4;

    // ── Compact dark bushes ──────────────────────────────────────────────────
    while (used.size < bushCount && attempts < max) {
      attempts++;
      const key = grassCells[getRandomInt(grassCells.length)];
      if (used.has(key)) continue;
      used.add(key);
      const col = parseInt(key.split('|')[0]);
      const row = parseInt(key.split('|')[1]);
      Flowers.drawBush(scene, col * 50 + 25, row * 50 + 25);
    }

    // ── Flower clusters ──────────────────────────────────────────────────────
    attempts = 0;
    let placed = 0;
    while (placed < clusterCount && attempts < max) {
      attempts++;
      const key = grassCells[getRandomInt(grassCells.length)];
      if (used.has(key)) continue;
      used.add(key);
      placed++;

      const col = parseInt(key.split('|')[0]);
      const row = parseInt(key.split('|')[1]);
      const cx = col * 50 + 25;
      const cy = row * 50 + 25;

      // 3–6 flowers scattered within a small radius; dominant shared colour
      const count         = 3 + getRandomInt(4);
      const radius        = 16 + Math.random() * 18;
      const dominantColor = PETAL_COLORS[getRandomInt(PETAL_COLORS.length)];

      for (let f = 0; f < count; f++) {
        const angle = Math.random() * Math.PI * 2;
        const d     = Math.random() * radius;
        const fx    = cx + Math.cos(angle) * d;
        const fy    = cy + Math.sin(angle) * d;
        // 70% chance to use the cluster's dominant colour, 30% random
        const color = Math.random() < 0.7 ? dominantColor : PETAL_COLORS[getRandomInt(PETAL_COLORS.length)];
        Flowers.drawFlower(scene, fx, fy, color, scale);
      }
    }
  }

  private static drawBush(scene: Container, cx: number, cy: number) {
    const g = new Graphics();
    const n = 3 + getRandomInt(3); // 3–5 circles
    for (let i = 0; i < n; i++) {
      const bx = cx + (Math.random() - 0.5) * 14;
      const by = cy + (Math.random() - 0.5) * 9;
      const br = 4 + Math.random() * 4;
      g.circle(bx, by, br);
      g.fill(BUSH_COLOR);
    }
    scene.addChild(g);
  }

  private static drawFlower(scene: Container, cx: number, cy: number, color: number, scale: number) {
    const numPetals = 5 + getRandomInt(2);
    const dist      = (2 + Math.random() * 1.5) * Math.max(0.6, scale);
    const pr        = (1.5 + Math.random() * 1) * Math.max(0.6, scale);

    const g = new Graphics();
    for (let i = 0; i < numPetals; i++) {
      const angle = (i / numPetals) * Math.PI * 2;
      g.circle(cx + Math.cos(angle) * dist, cy + Math.sin(angle) * dist, pr);
      g.fill(color);
    }
    g.circle(cx, cy, 1.2 * Math.max(0.6, scale));
    g.fill(0xFFEE22);
    scene.addChild(g);
  }
}
