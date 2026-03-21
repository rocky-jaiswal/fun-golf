import { Container, Graphics, Ticker } from 'pixi.js';
import { createNoise2D } from 'simplex-noise';

import { GameState } from './gameState';
import { MainGameScene } from './mainGameScene';

const WATER_DARK  = { r: 0x4a, g: 0x7e, b: 0xaa };
const WATER_LIGHT = { r: 0x85, g: 0xc6, b: 0xdf };

export class Water {
  private gfx: Graphics;
  private cells: Array<{ x: number; y: number }>;
  private elapsed = 0;
  private noise2D = createNoise2D();

  constructor(gameState: GameState) {
    this.gfx = new Graphics();
    this.cells = Object.keys(gameState.mainMap)
      .filter((k) => gameState.mainMap[k] === 'W')
      .map((k) => ({
        x: parseInt(k.split('|')[0]) * 50,
        y: parseInt(k.split('|')[1]) * 50,
      }));
  }

  private draw() {
    this.gfx.clear();
    for (const cell of this.cells) {
      const n = (this.noise2D(cell.x * 0.02, cell.y * 0.02 + this.elapsed * 0.05) + 1) / 2;
      const r = Math.round(WATER_DARK.r + (WATER_LIGHT.r - WATER_DARK.r) * n);
      const g = Math.round(WATER_DARK.g + (WATER_LIGHT.g - WATER_DARK.g) * n);
      const b = Math.round(WATER_DARK.b + (WATER_LIGHT.b - WATER_DARK.b) * n);
      this.gfx.roundRect(cell.x, cell.y, 50, 50, 8);
      this.gfx.fill((r << 16) | (g << 8) | b);
    }
  }

  public update(_delta: Ticker) {
    this.elapsed += 0.016;
    this.draw();
  }

  public static addWater(scene: MainGameScene | Container, gameState: GameState): Water {
    const water = new Water(gameState);
    water.draw();
    scene.addChild(water.gfx);
    return water;
  }
}
