import { Container, Ticker } from 'pixi.js';

import { GameState } from './gameState';

import { Water } from './water';
import { Sand } from './sand';
import { Tree } from './tree';
import { Hole } from './hole';
import { GrassBackground } from './grassBackground';
import { Fairway } from './fairway';
// import { Road } from './road';
import { Vignette } from './vignette';
import { YardageMarkers } from './yardageMarkers';
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
    // Road.add(this, this.gameState);
    Fairway.add(this, this.gameState);
    Hole.addHole(this, this.gameState);
    this.water = Water.addWater(this, this.gameState);
    Sand.addSand(this, this.gameState);
    YardageMarkers.add(this, this.gameState);
    Tree.addTrees(this, this.gameState);
    Vignette.add(this, this.gameState);

    this.ball = new Ball(this.gameState).addBall(this);
    this.helpLine = new RotatingLine(this.gameState).addHelpLine(this);
  }

  private handleHazards(isInWater: boolean, isInSand: boolean) {
    if (this.gameState.calculatingNewBallPosition || (!isInWater && !isInSand)) {
      return;
    }

    this.gameState.calculatingNewBallPosition = true;
    this.gameState.ballInHazard = true;

    this.ball?.hide();
    this.helpLine?.hide();

    this.gameState.addScoringEvent(isInWater ? 'water' : 'sand');

    const areas: GameArea[] = isInWater ? this.gameState.waterAreas : this.gameState.sandAreas;

    const resetBall = (areas: GameArea[]) => {
      let x = this.gameState.ballPositionX;
      let y = this.gameState.ballPositionY;
      let safety = 0;
      const isInHazard = () => areas.some((area) => this.gameState.isPointInArea({ x, y }, area));

      while (isInHazard() && safety < 60) {
        safety++;
        const rand = getRandomInt(4);
        x = x + 12 * (rand % 2 === 0 ? 1 : -1);
        y = y + 12 * (rand % 2 === 0 ? 1 : -1);

        x = Math.min(Math.max(0, x), this.gameState.width - GameState.ballRadius * 2);
        y = Math.min(Math.max(0, y), this.gameState.height - GameState.ballRadius * 2);
      }

      if (isInHazard()) {
        x = Math.min(Math.max(0, this.gameState.width / 2), this.gameState.width - GameState.ballRadius * 2);
        y = Math.min(Math.max(0, this.gameState.height / 2), this.gameState.height - GameState.ballRadius * 2);
      }

      this.ball?.stopMotion(x, y);
      return { x, y };
    };

    resetBall(areas);

    this.gameState.ballInHazard = false;
    this.gameState.calculatingNewBallPosition = false;
  }

  private handleBallInHole() {
    this.gameState.ballPositionX = this.gameState.holePositionX - GameState.ballRadius;
    this.gameState.ballPositionY = this.gameState.holePositionY - GameState.ballRadius;
    this.gameState.ballInHole = true;
  }

  public update(delta: Ticker) {
    const ballCenter = {
      x: this.gameState.ballPositionX + GameState.ballRadius,
      y: this.gameState.ballPositionY + GameState.ballRadius,
    };

    const holeCenter = {
      x: this.gameState.holePositionX,
      y: this.gameState.holePositionY,
    };

    const dx = ballCenter.x - holeCenter.x;
    const dy = ballCenter.y - holeCenter.y;
    const distToHole = Math.sqrt(dx * dx + dy * dy);
    const isSlowEnough = Math.abs(this.gameState.ballVelocityX) < 35 && Math.abs(this.gameState.ballVelocityY) < 35;
    const isCloseEnoughForHole = distToHole <= GameState.holeRadius + GameState.ballRadius;

    const isInHole =
      isSlowEnough &&
      (this.gameState.doCirclesIntersectSignificantly(
        {
          x: ballCenter.x,
          y: ballCenter.y,
          r: GameState.ballRadius,
        },
        {
          x: this.gameState.holePositionX,
          y: this.gameState.holePositionY,
          r: GameState.holeRadius,
        },
      ) ||
        isCloseEnoughForHole);

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

        // Rotate the velocity vector 35° so the ball actually deflects
        this.ball?.treeDeflect();

        // Push ball to the nearest edge of the tree cell it's inside
        const hitArea = this.gameState.treeAreas.find((area) =>
          this.gameState.isPointInArea({ x: this.gameState.ballPositionX, y: this.gameState.ballPositionY }, area),
        );

        if (hitArea) {
          const bx = this.gameState.ballPositionX;
          const by = this.gameState.ballPositionY;
          const margin = GameState.ballRadius + 2;

          const distLeft   = bx - hitArea.x;
          const distRight  = hitArea.x + hitArea.width  - bx;
          const distTop    = by - hitArea.y;
          const distBottom = hitArea.y + hitArea.height - by;

          const min = Math.min(distLeft, distRight, distTop, distBottom);

          let newX = bx;
          let newY = by;
          if      (min === distLeft)   newX = hitArea.x - margin;
          else if (min === distRight)  newX = hitArea.x + hitArea.width  + margin;
          else if (min === distTop)    newY = hitArea.y - margin;
          else                         newY = hitArea.y + hitArea.height + margin;

          this.ball?.correctPosition(newX, newY);
        }
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

    if (isInWater || isInSand) {
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
