import { Container, Ticker } from 'pixi.js';

import { GameState } from './gameState';

import { Water } from './water';
import { Sand } from './sand';
import { Tree } from './tree';
import { Hole } from './hole';
import { GrassBackground } from './grassBackground';
import { Vignette } from './vignette';
import { Ball } from './ball';
import { RotatingLine } from './rotatingLine';

import { getRandomInt } from './util';
import { GameArea, GameScene } from './types';

export class MainGameScene extends Container implements GameScene {
  private readonly gameState: GameState;
  private ball: Ball | null = null;
  private helpLine: RotatingLine | null = null;
  private water: Water | null = null;
  private treeCollisionActive: boolean = false;

  constructor(gameState: GameState) {
    super();

    this.gameState = gameState;
  }

  public init() {
    GrassBackground.add(this, this.gameState);
    Hole.addHole(this, this.gameState);
    this.water = Water.addWater(this, this.gameState);
    Sand.addSand(this, this.gameState);
    Tree.addTrees(this, this.gameState);
    Vignette.add(this, this.gameState);

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

      let safety = 0;
      while (this.gameState.ballInHazard && safety < 60) {
        safety++;
        this.gameState.ballInHazard = areas.some((area) => {
          return this.gameState.isPointInArea({ x: x, y: y }, area);
        });

        const rand = getRandomInt(4);
        x = x + 12 * (rand % 2 === 0 ? 1 : -1);
        y = y + 12 * (rand % 2 === 0 ? 1 : -1);
      }

      if (this.gameState.ballInHazard) {
        x = this.gameState.width / 2;
        y = this.gameState.height / 2;
        this.gameState.ballInHazard = false;
      }

      this.gameState.ballPositionX = x;
      this.gameState.ballPositionY = y;
      this.gameState.calculatingNewBallPosition = this.gameState.ballInHazard;
    };

    if (isInWater && !this.gameState.calculatingNewBallPosition) {
      this.gameState.calculatingNewBallPosition = true; // by the time this is set resetBall is called a few times
      this.gameState.addScoringEvent('water');
      resetBall(this.gameState.waterAreas);
    }

    if (isInSand && !this.gameState.calculatingNewBallPosition) {
      this.gameState.calculatingNewBallPosition = true;
      this.gameState.addScoringEvent('sand');
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
      this.gameState.eventEmitter.emit('inHole');
      this.handleBallInHole();
      this.water?.update(delta);
      this.ball?.update(delta);
      this.helpLine?.update(delta);
      return;
    }

    const hasHitEdge =
      this.gameState.ballPositionX <= 0 ||
      this.gameState.ballPositionY <= 0 ||
      this.gameState.ballPositionX + GameState.ballRadius * 2 >= this.gameState.width ||
      this.gameState.ballPositionY + GameState.ballRadius * 2 >= this.gameState.height;

    if (hasHitEdge) {
      let newX = this.gameState.ballPositionX;
      let newY = this.gameState.ballPositionY;

      if (this.gameState.ballPositionX <= 0) {
        newX = 1;
        this.ball?.bounceVertical();
      } else if (this.gameState.ballPositionX + GameState.ballRadius * 2 >= this.gameState.width) {
        newX = this.gameState.width - 2 * GameState.ballRadius;
        this.ball?.bounceVertical();
      }

      if (this.gameState.ballPositionY <= 0) {
        newY = 1;
        this.ball?.bounceHorizontal();
      } else if (this.gameState.ballPositionY + GameState.ballRadius * 2 >= this.gameState.height) {
        newY = this.gameState.height - 2 * GameState.ballRadius;
        this.ball?.bounceHorizontal();
      }

      this.ball?.correctPosition(newX, newY);

      // Update game objects
      this.water?.update(delta);
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
      if (!this.treeCollisionActive) {
        this.treeCollisionActive = true;

        // Rotate the velocity vector 60° so the ball actually deflects
        this.ball?.treeDeflect();

        // Nudge position out of the tree cell (independent x/y randomness)
        const newX = this.gameState.ballPositionX + 14 * (Math.random() > 0.5 ? 1 : -1);
        const newY = this.gameState.ballPositionY + 14 * (Math.random() > 0.5 ? 1 : -1);
        this.ball?.correctPosition(newX, newY);
      }

      // Update game objects
      this.water?.update(delta);
      this.ball?.update(delta);
      this.helpLine?.update(delta);

      return;
    }

    this.treeCollisionActive = false;

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
    this.water?.update(delta);
    this.ball?.update(delta);
    this.helpLine?.update(delta);
  }

  public cleanup() {
    this.ball?.destroy();
    this.helpLine?.destroy();
    this.ball = null;
    this.helpLine = null;
    this.water = null;

    // Clean up resources when scene is destroyed
    this.removeAllListeners();
    this.removeChildren();
  }
}
