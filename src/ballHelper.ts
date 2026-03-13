import { FederatedPointerEvent, Graphics, Sprite, Ticker } from 'pixi.js';

import { GameState } from './gameState';
import { MotionSimulator } from './motionSimulator';

export class BallHelper extends Graphics {
  private gameState: GameState;
  private ballSprite: Sprite;

  private forceTimer: NodeJS.Timeout | null = null;
  private simulator: MotionSimulator | null = null;

  constructor(gameState: GameState, ballSprite: Sprite) {
    super();

    this.gameState = gameState;
    this.ballSprite = ballSprite;

    // Event setup
    this.eventMode = 'static';

    this.on('pointerenter', () => {
      this.onEnter();
    });
    this.on('pointermove', (e) => {
      this.onMove(e);
    });
    this.on('pointerleave', () => {
      this.onLeave();
    });
    this.on('pointerdown', () => {
      this.onPress();
    });
    this.on('pointerup', () => {
      this.onRelease();
    });

    this.draw();
  }

  private powerColor(pct: number): number {
    if (pct < 0.33) return 0x00ff04;
    if (pct < 0.55) return 0xfffe00;
    if (pct < 0.78) return 0xff5700;
    return 0xff0000;
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

    // Power arc — shown when force has been charged above default
    if (this.gameState.hitForce > 10) {
      const pct = (this.gameState.hitForce - 10) / 90;
      const startAngle = -Math.PI / 2;
      const endAngle = startAngle + pct * Math.PI * 2;

      // Background ring — moveTo prevents stray line from origin
      this.moveTo(cx + 42, cy);
      this.arc(cx, cy, 42, 0, Math.PI * 2);
      this.stroke({ width: 4, color: 0xffffff, alpha: 0.15 });

      // Charged arc
      this.moveTo(cx + 42 * Math.cos(startAngle), cy + 42 * Math.sin(startAngle));
      this.arc(cx, cy, 42, startAngle, endAngle);
      this.stroke({ width: 4, color: this.powerColor(pct), alpha: 0.9 });
    }
  }

  public hide() {
    if (this.destroyed || !this.ballSprite || this.ballSprite.destroyed) return;
    this.clear();
    this.ballSprite.alpha = 0;
  }

  private onEnter() {
    this.gameState.autoRotation = false;
    this.gameState.manualRotation = true;
  }

  private onMove(e: FederatedPointerEvent) {
    if (this.gameState.manualRotation) {
      const angleRadians = Math.atan2(
        e.globalY - (this.gameState.ballPositionY + GameState.ballRadius),
        e.globalX - (this.gameState.ballPositionX + GameState.ballRadius),
      );

      const angleDegrees = angleRadians * (180 / Math.PI);
      this.gameState.hitAngle = angleDegrees;
    }
  }

  private onLeave() {
    this.gameState.autoRotation = true;
    this.gameState.manualRotation = false;

    if (this.forceTimer) {
      clearInterval(this.forceTimer!);
      this.forceTimer = null;
    }

    this.gameState.hitForce = 10;
  }

  private onPress() {
    this.forceTimer = setInterval(() => {
      if (this.gameState.hitForce < 100) {
        this.gameState.hitForce = this.gameState.hitForce + 10;
      }
    }, 200);
  }

  private onRelease() {
    if (this.forceTimer) {
      clearInterval(this.forceTimer!);
      this.forceTimer = null;
    }

    this.clear(); // do not show helper circle when ball is in motion
    this.gameState.addScoringEvent('hit');
    this.gameState.ballInMotion = true;

    this.simulator = new MotionSimulator(this.gameState.ballPositionX, this.gameState.ballPositionY);
    this.simulator.applyForce(this.gameState.hitForce, this.gameState.hitAngle);
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
      this.draw();
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

      // redraw the ball hit helper now
      this.draw();
    }
  }
}
