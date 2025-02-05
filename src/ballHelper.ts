import { FederatedPointerEvent, Graphics, Sprite, Ticker } from 'pixi.js';

import { GameState } from './gameState';
import { MotionSimulator } from './motionSimulator';

export class BallHelper extends Graphics {
  private gameState: GameState;
  private ballSprite: Sprite;

  private forceTimer: number | null = null;
  private simulator: MotionSimulator | null = null;

  private ballHelperX = 0;
  private ballHelperY = 0;

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

  public draw() {
    this.clear();

    if (this.ballSprite.alpha === 0) {
      this.ballSprite.alpha = 1;
    }

    this.circle(
      this.gameState.ballPositionX + GameState.ballRadius,
      this.gameState.ballPositionY + GameState.ballRadius,
      33,
    );
    this.fill({ color: '#6bae53de', alpha: 0.95 });
  }

  public hide() {
    this.clear();
    this.ballSprite.alpha = 0;
  }

  private onEnter() {
    this.gameState.autoRotation = false;
    this.gameState.manualRotation = true;
  }

  private onMove(e: FederatedPointerEvent) {
    if (this.ballHelperY < e.client.y || this.ballHelperX < e.client.x) {
      this.gameState.hitAngle = this.gameState.hitAngle + 3;
    } else {
      this.gameState.hitAngle = this.gameState.hitAngle - 3;
    }

    this.ballHelperX = e.client.x;
    this.ballHelperY = e.client.y;
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
        // console.log(this.gameState.hitForce);
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

  public update(_delta: Ticker) {
    if (this.gameState.ballInHole) {
      this.ballSprite!.x = this.gameState.ballPositionX + GameState.ballRadius;
      this.ballSprite!.y = this.gameState.ballPositionY + GameState.ballRadius;

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

    if (this.gameState.ballInMotion) {
      const state = this.simulator?.update(this.gameState.hitAngle);

      this.gameState.ballPositionX = Math.ceil(state!.x);
      this.gameState.ballPositionY = Math.ceil(state!.y);

      this.gameState.ballVelocityX = state?.vx ?? 0;
      this.gameState.ballVelocityY = state?.vy ?? 0;

      this.ballSprite.x = this.gameState.ballPositionX + GameState.ballRadius;
      this.ballSprite.y = this.gameState.ballPositionY + GameState.ballRadius;

      // Stop if object has essentially stopped moving
      if (Math.abs(this.gameState.ballVelocityX) <= 0 || Math.abs(this.gameState.ballVelocityY) <= 0) {
        this.gameState.ballVelocityX = 0;
        this.gameState.ballVelocityY = 0;

        this.gameState.ballInMotion = false;
        this.gameState.hitForce = 20;

        // redraw the ball hit helper now
        this.draw();
      }
    }
  }
}
