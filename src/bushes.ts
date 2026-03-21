import { Container, Graphics } from 'pixi.js';

import { GameState } from './gameState';
import { getRandomInt } from './util';

const CORE_COLORS = [0x3d742b, 0x477f31];

function screenScale(gameState: GameState): number {
  const dim = Math.min(gameState.width, gameState.height);
  if (dim < 450) return 0.55;
  if (dim < 700) return 0.75;
  if (dim < 950) return 0.92;
  return 1.05;
}

export class Bushes {
  public static add(scene: Container, gameState: GameState) {
    const scale = screenScale(gameState);

    const grassCells = Object.keys(gameState.mainMap).filter((key) => {
      if (gameState.mainMap[key] !== 'G') return false;

      const [colText, rowText] = key.split('|');
      const col = parseInt(colText, 10);
      const row = parseInt(rowText, 10);
      const x = col * GameState.gridSize + GameState.gridSize / 2;
      const y = row * GameState.gridSize + GameState.gridSize / 2;

      const dx = x - gameState.holePositionX;
      const dy = y - gameState.holePositionY;
      const distanceToHole = Math.sqrt(dx * dx + dy * dy);

      return distanceToHole > gameState.fairwayRadius * 1.45;
    });

    const bushCount = Math.max(1, Math.round(Math.min(5, grassCells.length / 42) * scale));
    const used = new Set<string>();
    let attempts = 0;
    const maxAttempts = grassCells.length * 6;

    while (used.size < bushCount && attempts < maxAttempts) {
      attempts++;

      const key = grassCells[getRandomInt(grassCells.length)];
      if (!key || used.has(key)) continue;

      const [colText, rowText] = key.split('|');
      const col = parseInt(colText, 10);
      const row = parseInt(rowText, 10);

      // Favor bushes a bit lower on the course so they feel like a foreground layer.
      const rowBias = (row + 1) / gameState.noOfRows;
      if (Math.random() > 0.35 + rowBias * 0.75) continue;

      used.add(key);
      Bushes.drawBushCluster(
        scene,
        col * GameState.gridSize + GameState.gridSize / 2,
        row * GameState.gridSize + GameState.gridSize / 2,
        scale * (0.9 + Math.random() * 0.35),
      );
    }
  }

  private static drawBushCluster(scene: Container, cx: number, cy: number, scale: number) {
    const bush = new Container();

    const leafPuffs = 3 + getRandomInt(2);
    for (let i = 0; i < leafPuffs; i++) {
      const puff = new Graphics();
      const radius = (8 + Math.random() * 8) * scale;
      const x = (Math.random() - 0.5) * 34 * scale;
      const y = (Math.random() - 0.5) * 16 * scale - 4 * scale;
      const color = CORE_COLORS[getRandomInt(CORE_COLORS.length)];

      puff.circle(x, y, radius);
      puff.fill(color);
      bush.addChild(puff);
    }

    bush.position.set(cx, cy);
    scene.addChild(bush);
  }
}
