import { Container, Graphics } from 'pixi.js';
import { createNoise2D } from 'simplex-noise';

import { GameState } from './gameState';

const TILE = 12;

// 3-stop gradient: medium green → bright fairway → light lime
const GRADIENT = [
  { r: 0x55, g: 0x8b, b: 0x4a }, // medium green
  { r: 0x70, g: 0x9e, b: 0x51 }, // bright fairway
  { r: 0x6b, g: 0x92, b: 0x51 }, // light lime
  // '#5e9b52'
];

function lerpColor(t: number): number {
  const scaled = t * (GRADIENT.length - 1);
  const lo = Math.floor(scaled);
  const hi = Math.min(lo + 1, GRADIENT.length - 1);
  const f = scaled - lo;
  const a = GRADIENT[lo], b = GRADIENT[hi];
  const r = Math.round(a.r + (b.r - a.r) * f);
  const g = Math.round(a.g + (b.g - a.g) * f);
  const bl = Math.round(a.b + (b.b - a.b) * f);
  return (r << 16) | (g << 8) | bl;
}

export class GrassBackground {
  public static add(scene: Container, gameState: GameState) {
    const noise2D = createNoise2D();
    const gfx = new Graphics();

    const W = gameState.width;
    const H = gameState.height;

    for (let x = 0; x < W; x += TILE) {
      for (let y = 0; y < H; y += TILE) {
        const n = (noise2D(x * 0.001, y * 0.001) + 1) / 2;
        gfx.rect(x, y, TILE, TILE);
        gfx.fill(lerpColor(n));
      }
    }

    scene.addChild(gfx);
  }
}
