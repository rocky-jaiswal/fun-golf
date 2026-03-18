import { Graphics } from 'pixi.js';

import { MainGameScene } from './mainGameScene';
import { GameState } from './gameState';
import { getRandomInt } from './util';

const MARKER_COLORS = [0xdd2222, 0xffffff, 0x2255cc]; // red = 100yd, white = 150yd, blue = 200yd

export class YardageMarkers {
  public static add(scene: MainGameScene, gameState: GameState) {
    const grassCells = Object.keys(gameState.mainMap).filter((k) => gameState.mainMap[k] === 'G');

    const count = Math.max(3, Math.min(6, Math.floor(grassCells.length / 15)));
    const placed = new Set<string>();

    let attempts = 0;
    while (placed.size < count && attempts < grassCells.length * 2) {
      attempts++;
      const key = grassCells[getRandomInt(grassCells.length)];
      if (placed.has(key)) continue;
      placed.add(key);
    }

    let colorIndex = 0;
    placed.forEach((key) => {
      const col = parseInt(key.split('|')[0]);
      const row = parseInt(key.split('|')[1]);

      // Center of the cell
      const cx = col * 50 + 25;
      const cy = row * 50 + 25;

      const color = MARKER_COLORS[colorIndex % MARKER_COLORS.length];
      colorIndex++;

      const g = new Graphics();

      // Post: thin dark rectangle
      g.rect(cx - 1, cy - 10, 2, 14);
      g.fill(0x4a3728);

      // Colored ball on top
      g.circle(cx, cy - 12, 4);
      g.fill(color);

      // Thin outline on white marker so it's visible on grass
      if (color === 0xffffff) {
        g.circle(cx, cy - 12, 4);
        g.stroke({ color: 0x888888, width: 0.5 });
      }

      scene.addChild(g);
    });
  }
}
