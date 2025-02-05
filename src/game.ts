import { Ticker, Assets } from 'pixi.js';

import ballPNG from './assets/ball.png';
import tree3PNG from './assets/tree3.png';
import tree4PNG from './assets/tree4.png';
import tree5PNG from './assets/tree5.png';

import { MainGameScene } from './mainGameScene';
import { GameState } from './gameState';

export class Game {
  public readonly gameState: GameState;
  private currentScene: MainGameScene | null = null;

  constructor(gameState: GameState) {
    this.gameState = gameState;

    // Set up game loop
    this.gameState.application.ticker.add(this.update.bind(this));
  }

  public async init() {
    await Assets.load([
      {
        src: ballPNG,
        alias: 'ball',
      },
      {
        src: tree3PNG,
        alias: 'tree0',
      },
      {
        src: tree4PNG,
        alias: 'tree1',
      },
      {
        src: tree5PNG,
        alias: 'tree2',
      },
    ]);

    this.startGame();
  }

  private startGame() {
    // Set up initial scene
    this.setScene(new MainGameScene(this.gameState));
  }

  private setScene(scene: MainGameScene) {
    // Clean up current scene
    if (this.currentScene) {
      this.currentScene.cleanup();
      this.gameState.application.stage.removeChild(this.currentScene);
    }

    // Set up new scene
    this.currentScene = scene;

    this.currentScene.init();

    this.gameState.application.stage.addChild(scene);
  }

  update(delta: Ticker) {
    if (this.currentScene) {
      this.currentScene.update(delta);
    }
  }
}
