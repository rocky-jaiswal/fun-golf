import { Container, Graphics } from 'pixi.js';

import { GameState } from './gameState';

// Static warm-light overlay — no animation, just a soft golden glow in the
// upper area to make the scene feel bright and sunny.
export class Sunshine {
  public readonly container: Container;

  constructor(gameState: GameState) {
    this.container = new Container();

    const cx = gameState.width  * 0.14;
    const cy = gameState.height * 0.08;

    // Scale glow radius to screen size so it feels proportionate on mobile too
    const baseR = Math.min(gameState.width, gameState.height) * 0.32;

    const layers = [
      { r: baseR * 1.6, alpha: 0.012 },
      { r: baseR * 1.1, alpha: 0.022 },
      { r: baseR * 0.75, alpha: 0.038 },
      { r: baseR * 0.48, alpha: 0.058 },
      { r: baseR * 0.28, alpha: 0.075 },
    ];

    for (const layer of layers) {
      const g = new Graphics();
      g.circle(0, 0, layer.r);
      g.fill({ color: 0xFFE566, alpha: layer.alpha });
      g.position.set(cx, cy);
      this.container.addChild(g);
    }
  }

  public destroy() {
    this.container.destroy({ children: true });
  }
}
