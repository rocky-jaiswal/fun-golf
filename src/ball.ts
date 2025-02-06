import { Sprite, Ticker } from 'pixi.js';

import { MainGameScene } from './mainGameScene';
import { GameState } from './gameState';
import { BallHelper } from './ballHelper';

export class Ball {
  private gameState: GameState;
  private ballSprite: Sprite | null = null;
  private ballHelper: BallHelper | null = null;

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

    scene.addChild(this.ballHelper);
    scene.addChild(this.ballSprite);

    return this;
  }

  public update(delta: Ticker) {
    this.ballHelper?.update(delta);
  }

  public hide() {
    this.ballHelper?.hide();
  }

  public destroy(): void {
    this.ballSprite?.removeAllListeners();
    this.ballSprite?.destroy();

    this.ballHelper?.removeAllListeners();
    this.ballHelper?.destroy();
  }
}
