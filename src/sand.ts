import { Graphics } from 'pixi.js';
import { createNoise2D } from 'simplex-noise';

import { MainGameScene } from './mainGameScene';
import { GameState } from './gameState';

const noise2D = createNoise2D();
const SAND_DARK = { r: 0xbe, g: 0x90, b: 0x5a };
const SAND_LIGHT = { r: 0xe2, g: 0xcc, b: 0x97 };

export class Sand {
  public static addSand(scene: MainGameScene, gameState: GameState) {
    Object.keys(gameState.mainMap)
      .filter((k: string) => gameState.mainMap[k] === 'S')
      .forEach((k) => {
        const graphics = new Graphics();

        const x = parseInt(k.split('|')[0]);
        const y = parseInt(k.split('|')[1]);
        const px = x * 50;
        const py = y * 50;

        const n = (noise2D(px * 0.025, py * 0.025) + 1) / 2;
        const r = Math.round(SAND_DARK.r + (SAND_LIGHT.r - SAND_DARK.r) * n);
        const g = Math.round(SAND_DARK.g + (SAND_LIGHT.g - SAND_DARK.g) * n);
        const b = Math.round(SAND_DARK.b + (SAND_LIGHT.b - SAND_DARK.b) * n);

        graphics.roundRect(px, py, 50, 50, 8);
        graphics.fill((r << 16) | (g << 8) | b);

        scene.addChild(graphics);
      });
  }
}
