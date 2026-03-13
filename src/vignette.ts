import { Container, Sprite, Texture } from 'pixi.js';

import { GameState } from './gameState';

export class Vignette {
  public static add(scene: Container, gameState: GameState) {
    const W = gameState.width;
    const H = gameState.height;

    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;

    const ctx = canvas.getContext('2d')!;
    const cx = W / 2;
    const cy = H / 2;
    const innerR = Math.min(W, H) * 0.15;
    const outerR = Math.sqrt(cx * cx + cy * cy);

    const gradient = ctx.createRadialGradient(cx, cy, innerR, cx, cy, outerR);
    gradient.addColorStop(0, 'rgba(0,0,0,0)');
    gradient.addColorStop(1, 'rgba(0,0,0,0.48)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, W, H);

    const sprite = new Sprite(Texture.from(canvas));
    scene.addChild(sprite);
  }
}
