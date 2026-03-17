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

  private fire() {
    if (this.gameState.ballInMotion) return;

    this.clear();
    this.gameState.addScoringEvent('hit');
    this.gameState.ballInMotion = true;

    this.simulator = new MotionSimulator(this.gameState.ballPositionX, this.gameState.ballPositionY);
    this.simulator.applyForce(this.gameState.hitForce, this.gameState.hitAngle, this.gameState.forceMultiplier);
  }

  public treeDeflect() {
    if (!this.simulator) return;
    this.simulator.deflect(60);
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

    const state = this.simulator?.update(this.gameState.hitAngle);
    if (!state) {
      this.gameState.ballInMotion = false;
      this.gameState.hitForce = 20;
      return;
    }

    this.gameState.ballPositionX = Math.ceil(state.x);
    this.gameState.ballPositionY = Math.ceil(state.y);

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
}
