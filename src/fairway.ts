import { Container, Graphics } from 'pixi.js';

import { MainGameScene } from './mainGameScene';
import { GameState } from './gameState';

const BASE_COLOR = '#83ad62';
const STRIPE_COLOR = '#92bc70';
const STRIPE_WIDTH = 55;

export class Fairway {
  public static add(scene: MainGameScene, gameState: GameState) {
    const r = gameState.fairwayRadius;
    const cx = gameState.holePositionX;
    const cy = gameState.holePositionY;

    const container = new Container();

    // Base green
    const base = new Graphics();
    base.roundRect(cx - r, cy - r, r * 2, r * 2, r * 0.4);
    base.fill(BASE_COLOR);
    container.addChild(base);

    // Mask to clip stripes to the rounded rect shape
    const mask = new Graphics();
    mask.roundRect(cx - r, cy - r, r * 2, r * 2, r * 0.4);
    mask.fill(0xffffff);
    container.addChild(mask);

    // Diagonal mow stripes: draw horizontal bands centred at origin,
    // then rotate 45° around the fairway centre.
    // R covers the full diagonal so corners aren't clipped before masking.
    const R = r * Math.SQRT2;
    const stripes = new Graphics();
    for (let sy = -R; sy < R; sy += STRIPE_WIDTH * 2) {
      stripes.rect(-R, sy, R * 2, STRIPE_WIDTH);
    }
    stripes.fill({ color: STRIPE_COLOR, alpha: 0.65 });
    stripes.position.set(cx, cy);
    stripes.rotation = Math.PI / 4;
    stripes.mask = mask;
    container.addChild(stripes);

    scene.addChild(container);
  }
}
