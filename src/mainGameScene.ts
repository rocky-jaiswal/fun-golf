import { Container, Ticker } from 'pixi.js';

import { GameArea, GameState } from './gameState';

import { Water } from './water';
import { Sand } from './sand';
import { Tree } from './tree';
import { Hole } from './hole';
import { Ball } from './ball';
import { RotatingLine } from './rotatingLine';

import { getRandomInt } from './util';

export class MainGameScene extends Container {
  private readonly gameState: GameState;
  private ball: Ball | null = null;
  private helpLine: RotatingLine | null = null;

  constructor(gameState: GameState) {
    super();

    this.gameState = gameState;
  }

  public init() {
    Hole.addHole(this, this.gameState);
    Water.addWater(this, this.gameState);
    Sand.addSand(this, this.gameState);
    Tree.addTrees(this, this.gameState);

    this.ball = new Ball(this.gameState).addBall(this);
    this.helpLine = new RotatingLine(this.gameState).addHelpLine(this);
  }

  private handleHazards(isInWater: boolean, isInSand: boolean) {
    // this is called a few times in less than a millisecond
    // so this causes glitching
    const resetBall = (areas: GameArea[]) => {
      // console.log(1);
      this.gameState.ballVelocityX = 0;
      this.gameState.ballVelocityY = 0;

      let x = this.gameState.ballPositionX;
      let y = this.gameState.ballPositionY;

      while (this.gameState.ballInHazard) {
        this.gameState.ballInHazard = areas.some((area) => {
          return this.gameState.isPointInArea({ x: x, y: y }, area);
        });

        const rand = getRandomInt(4);
        x = x + 12 * (rand % 2 === 0 ? 1 : -1);
        y = y + 12 * (rand % 2 === 0 ? 1 : -1);
      }

      this.gameState.ballPositionX = x;
      this.gameState.ballPositionY = y;
      this.gameState.calculatingNewBallPosition = this.gameState.ballInHazard;
    };

    if (isInWater && !this.gameState.calculatingNewBallPosition) {
      this.gameState.calculatingNewBallPosition = true; // by the time this is set resetBall is called a few times
      this.gameState.addScoringEvent('water');
      console.log('plop!');
      resetBall(this.gameState.waterAreas);
    }

    if (isInSand && !this.gameState.calculatingNewBallPosition) {
      this.gameState.calculatingNewBallPosition = true;
      this.gameState.addScoringEvent('sand');
      console.log('thud!');
      resetBall(this.gameState.sandAreas);
    }
  }

  private handleBallInHole() {
    this.gameState.ballPositionX = this.gameState.holePositionX - GameState.ballRadius;
    this.gameState.ballPositionY = this.gameState.holePositionY - GameState.ballRadius;
    this.gameState.ballInHole = true;
  }

  public update(delta: Ticker) {
    const isInHole =
      Math.abs(this.gameState.ballVelocityX) < 30 &&
      Math.abs(this.gameState.ballVelocityY) < 30 &&
      this.gameState.doCirclesIntersectSignificantly(
        {
          x: this.gameState.ballPositionX + GameState.ballRadius,
          y: this.gameState.ballPositionY + GameState.ballRadius,
          r: GameState.ballRadius,
        },
        { x: this.gameState.holePositionX, y: this.gameState.holePositionY, r: GameState.holeRadius },
      );

    if (isInHole) {
      this.handleBallInHole();
      this.ball?.update(delta);
      this.helpLine?.update(delta);
      return;
    }

    const hasHitEdge =
      this.gameState.ballPositionX <= 0 ||
      this.gameState.ballPositionY <= 0 ||
      this.gameState.ballPositionX + GameState.ballRadius >= this.gameState.width ||
      this.gameState.ballPositionY + GameState.ballRadius >= this.gameState.height;

    if (hasHitEdge) {
      console.log('ping!');

      if (this.gameState.ballPositionX <= 0) {
        this.gameState.ballPositionX = 1;
      }
      if (this.gameState.ballPositionY <= 0) {
        this.gameState.ballPositionY = 1;
      }
      if (this.gameState.ballPositionX + GameState.ballRadius >= this.gameState.width) {
        this.gameState.ballPositionX = this.gameState.width - 2 * GameState.ballRadius;
      }
      if (this.gameState.ballPositionY + GameState.ballRadius >= this.gameState.height) {
        this.gameState.ballPositionY = this.gameState.height - 2 * GameState.ballRadius;
      }

      this.gameState.ballVelocityX = 0;
      this.gameState.ballVelocityY = 0;
      this.gameState.ballInMotion = false;
      this.gameState.hitForce = 20;

      // Update game objects
      this.ball?.update(delta);
      this.helpLine?.update(delta);

      return;
    }

    const hasHitTree =
      // Math.abs(this.gameState.ballVelocityX) > 0 &&
      // Math.abs(this.gameState.ballVelocityY) > 0 &&
      this.gameState.treeAreas.some((area) =>
        this.gameState.isPointInArea({ x: this.gameState.ballPositionX, y: this.gameState.ballPositionY }, area),
      );

    if (hasHitTree) {
      this.gameState.hitAngle = this.gameState.hitAngle + 60;

      // move the ball a bit
      const rand = getRandomInt(4);
      this.gameState.ballPositionX = this.gameState.ballPositionX + 12 * (rand % 2 === 0 ? 1 : -1);
      this.gameState.ballPositionY = this.gameState.ballPositionY + 12 * (rand % 2 === 0 ? 1 : -1);

      // Update game objects
      this.ball?.update(delta);
      this.helpLine?.update(delta);

      return;
    }

    const isInWater =
      Math.abs(this.gameState.ballVelocityX) < 30 &&
      Math.abs(this.gameState.ballVelocityY) < 30 &&
      this.gameState.waterAreas.some((area) =>
        this.gameState.isPointInArea({ x: this.gameState.ballPositionX, y: this.gameState.ballPositionY }, area),
      );

    const isInSand =
      Math.abs(this.gameState.ballVelocityX) < 30 &&
      Math.abs(this.gameState.ballVelocityY) < 30 &&
      this.gameState.sandAreas.some((area) =>
        this.gameState.isPointInArea({ x: this.gameState.ballPositionX, y: this.gameState.ballPositionY }, area),
      );

    if (isInWater || isInSand || this.gameState.ballInHazard || this.gameState.calculatingNewBallPosition) {
      this.gameState.ballInHazard = true;
      this.ball?.hide();
      this.helpLine?.hide();
      this.handleHazards(isInWater, isInSand);

      return;
    }

    // Update game objects
    this.ball?.update(delta);
    this.helpLine?.update(delta);
  }

  public cleanup() {
    this.ball?.destroy();
    this.helpLine?.destroy();

    // Clean up resources when scene is destroyed
    this.removeAllListeners();
    this.removeChildren();
  }
}
