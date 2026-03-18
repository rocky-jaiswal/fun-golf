import { Graphics, Sprite, Ticker } from 'pixi.js';

import { GameState } from './gameState';
import { MotionSimulator } from './motionSimulator';



export class BallHelper extends Graphics {
  private gameState: GameState;
  private ballSprite: Sprite;

  private simulator: MotionSimulator | null = null;
  private readonly fireBound: () => void;

  constructor(gameState: GameState, ballSprite: Sprite) {
    super();

    this.gameState = gameState;
    this.ballSprite = ballSprite;

    this.fireBound = this.fire.bind(this);
    this.gameState.eventEmitter.on('shotFired', this.fireBound);

    this.draw();
  }

  public draw() {
    if (this.destroyed || !this.ballSprite || this.ballSprite.destroyed) return;
    this.clear();

    if (this.ballSprite.alpha === 0) {
      this.ballSprite.alpha = 1;
    }

    const cx = this.gameState.ballPositionX + GameState.ballRadius;
    const cy = this.gameState.ballPositionY + GameState.ballRadius;

    this.circle(cx, cy, 33);
    this.fill({ color: '#f4de66', alpha: 0.5 });
  }

  public hide() {
    if (this.destroyed || !this.ballSprite || this.ballSprite.destroyed) return;
    this.clear();
    this.ballSprite.alpha = 0;
  }

  public stopTrajectory(options: { x?: number; y?: number; force?: number } = {}) {
    const { x, y, force = 20 } = options;

    if (this.simulator) {
      this.simulator.setVelocity(0, 0);
      if (x !== undefined && y !== undefined) {
        this.simulator.setPosition(x, y);
      }
    }

    this.ballSprite.alpha = 1;
    this.gameState.ballVelocityX = 0;
    this.gameState.ballVelocityY = 0;
    this.gameState.ballInMotion = false;
    this.gameState.calculatingNewBallPosition = false;
    this.gameState.hitForce = force;

    if (x !== undefined && y !== undefined) {
      this.gameState.ballPositionX = x;
      this.gameState.ballPositionY = y;
    }

    this.draw();
  }

  private fire() {
    if (this.gameState.ballInMotion) return;

    this.clear();
    this.gameState.addScoringEvent('hit');
    this.gameState.ballInMotion = true;
    const force = Number.isFinite(this.gameState.hitForce) ? this.gameState.hitForce : 0;
    const clampedForce = Math.max(5, Math.min(100, force));
    this.gameState.hitForce = clampedForce;

    this.simulator = new MotionSimulator(this.gameState.ballPositionX, this.gameState.ballPositionY);
    const multiplier = this.gameState.hitForce === 100
      ? this.gameState.forceMultiplier * 1.1
      : this.gameState.forceMultiplier;
    this.simulator.applyForce(clampedForce, this.gameState.hitAngle, multiplier);
  }

  public treeDeflect() {
    if (!this.simulator) return;
    this.simulator.deflect(35);
    this.gameState.hitAngle = this.simulator.getHeading();
  }

  public bounceHorizontal() {
    if (!this.simulator) return;
    this.simulator.reflectY();
    this.gameState.hitAngle = this.simulator.getHeading();
  }

  public bounceVertical() {
    if (!this.simulator) return;
    this.simulator.reflectX();
    this.gameState.hitAngle = this.simulator.getHeading();
  }

  public correctPosition(x: number, y: number) {
    if (!this.ballSprite || this.ballSprite.destroyed) return;
    this.gameState.ballPositionX = x;
    this.gameState.ballPositionY = y;
    this.simulator?.setPosition(x, y);
  }

  public cleanup() {
    this.gameState.eventEmitter.off('shotFired', this.fireBound);
  }

  public update(_delta: Ticker) {
    if (this.destroyed || !this.ballSprite || this.ballSprite.destroyed) return;

    if (this.gameState.ballInHole) {
      this.ballSprite.x = this.gameState.ballPositionX + GameState.ballRadius;
      this.ballSprite.y = this.gameState.ballPositionY + GameState.ballRadius;

      this.draw();

      this.gameState.ballVelocityX = 0;
      this.gameState.ballVelocityY = 0;

      this.gameState.hitForce = 0;
      this.gameState.ballInMotion = false;
    }

    if (!this.gameState.ballInHazard && !this.gameState.calculatingNewBallPosition) {
      this.ballSprite.x = this.gameState.ballPositionX + GameState.ballRadius;
      this.ballSprite.y = this.gameState.ballPositionY + GameState.ballRadius;

      // Only draw the helper circle when the ball is stationary
      if (!this.gameState.ballInMotion) {
        this.draw();
      } else {
        this.clear();
      }
    }

    if (!this.gameState.ballInMotion) return;

    const frameDelta = this.getFrameDelta(_delta);
    const state = this.simulator?.update(frameDelta);
    if (!state) {
      this.gameState.ballInMotion = false;
      this.gameState.hitForce = 20;
      return;
    }

    if (!Number.isFinite(state.x) || !Number.isFinite(state.y)) {
      this.stopTrajectory();
      return;
    }

    this.gameState.ballPositionX = Math.round(state.x);
    this.gameState.ballPositionY = Math.round(state.y);

    this.gameState.ballVelocityX = state.vx;
    this.gameState.ballVelocityY = state.vy;

    this.ballSprite.x = this.gameState.ballPositionX + GameState.ballRadius;
    this.ballSprite.y = this.gameState.ballPositionY + GameState.ballRadius;

    // Stop if object has essentially stopped moving
    if (this.gameState.ballVelocityX === 0 && this.gameState.ballVelocityY === 0) {
      this.gameState.ballInMotion = false;
      this.gameState.hitForce = 20;

      this.draw();
    }
  }

  private getFrameDelta(delta: Ticker): number {
    const asObject = delta as unknown as { deltaTime?: number; deltaMS?: number };

    if (typeof asObject.deltaTime === 'number' && Number.isFinite(asObject.deltaTime) && asObject.deltaTime > 0) {
      // Newer Pixi versions expose a frame-multiplier here (~1.0 at 60 FPS).
      // Older versions and some runtimes can expose elapsed ms (~16 at 60 FPS).
      if (asObject.deltaTime > 5) {
        return asObject.deltaTime / 16.6666666667;
      }

      return asObject.deltaTime;
    }

    if (typeof asObject.deltaMS === 'number' && Number.isFinite(asObject.deltaMS) && asObject.deltaMS > 0) {
      return asObject.deltaMS / 16.6666666667;
    }

    return 1;
  }
}
