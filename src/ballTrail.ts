import { Graphics, Ticker } from 'pixi.js';

import { GameState } from './gameState';

interface TrailPoint {
  x: number;
  y: number;
  age: number;
}

const MAX_TRAIL = 18;
const MAX_AGE = 18;

export class BallTrail extends Graphics {
  private trail: TrailPoint[] = [];
  private gameState: GameState;

  constructor(gameState: GameState) {
    super();
    this.gameState = gameState;
  }

  public update(_delta: Ticker) {
    if (!this.gameState.ballInMotion) {
      if (this.trail.length > 0) {
        this.trail = [];
        this.clear();
      }
      return;
    }

    this.trail.push({
      x: this.gameState.ballPositionX + GameState.ballRadius,
      y: this.gameState.ballPositionY + GameState.ballRadius,
      age: 0,
    });

    for (const p of this.trail) p.age++;
    this.trail = this.trail.filter((p) => p.age < MAX_AGE);
    if (this.trail.length > MAX_TRAIL) this.trail.shift();

    this.clear();
    for (const p of this.trail) {
      const t = 1 - p.age / MAX_AGE;
      this.circle(p.x, p.y, 2.5 * t);
      this.fill({ color: 0xffffff, alpha: t * 0.55 });
    }
  }
}
