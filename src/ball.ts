import { Sprite, Ticker } from 'pixi.js';

import { MainGameScene } from './mainGameScene';
import { GameState } from './gameState';
import { BallHelper } from './ballHelper';
import { BallTrail } from './ballTrail';

export class Ball {
  private gameState: GameState;
  private ballSprite: Sprite | null = null;
  private ballHelper: BallHelper | null = null;
  private ballTrail: BallTrail | null = null;

  constructor(gameState: GameState) {
    this.gameState = gameState;
  }

  public addBall(scene: MainGameScene) {
    this.ballSprite = Sprite.from('ball');

    this.ballSprite.width = 12;
    this.ballSprite.height = 12;

    this.ballSprite.x = this.gameState.ballPositionX + GameState.ballRadius;
    this.ballSprite.y = this.gameState.ballPositionY + GameState.ballRadius;
    this.ballSprite.anchor.set(0.5);

    this.ballHelper = new BallHelper(this.gameState, this.ballSprite);
    this.ballTrail = new BallTrail(this.gameState);

    scene.addChild(this.ballTrail);
    scene.addChild(this.ballHelper);
    scene.addChild(this.ballSprite);

    return this;
  }

  public update(delta: Ticker) {
    this.ballTrail?.update(delta);
    this.ballHelper?.update(delta);
  }

  public hide() {
    this.ballHelper?.hide();
  }

  public correctPosition(x: number, y: number) {
    this.ballHelper?.correctPosition(x, y);
  }

  public bounceHorizontal() {
    this.ballHelper?.bounceHorizontal();
  }

  public bounceVertical() {
    this.ballHelper?.bounceVertical();
  }

  public destroy(): void {
    this.ballSprite?.removeAllListeners();
    this.ballSprite?.destroy();
    this.ballSprite = null;

    this.ballHelper?.removeAllListeners();
    this.ballHelper?.destroy();
    this.ballHelper = null;

    this.ballTrail?.destroy();
    this.ballTrail = null;
  }
}
