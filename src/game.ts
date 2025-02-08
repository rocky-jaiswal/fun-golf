import { Howl } from 'howler';
import { Ticker, Assets } from 'pixi.js';

import ballPNG from './assets/images/ball.png';
import tree3PNG from './assets/images/tree3.png';
import tree4PNG from './assets/images/tree4.png';
import tree5PNG from './assets/images/tree5.png';

import hitSound from './assets/sounds/hit.mp3';
import holeSound from './assets/sounds/hole.mp3';

import { MainGameScene } from './mainGameScene';
import { GameState } from './gameState';
import { SceneManager } from './sceneManager';
import { ResultScene } from './resultScene';
import { GameScene } from './types';

export class Game {
  public readonly gameState: GameState;
  public readonly sceneManager: SceneManager;
  private currentScene: GameScene | null = null;

  constructor(gameState: GameState) {
    this.gameState = gameState;
    this.sceneManager = new SceneManager(gameState);

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

    const htSound = new Howl({
      src: hitSound,
    });

    const hoSound = new Howl({
      src: holeSound,
    });

    this.gameState.eventEmitter.on('hit', () => {
      htSound.play();
    });

    this.gameState.eventEmitter.on('inHole', () => {
      hoSound.play();
    });

    this.startGame();
  }

  private startGame() {
    // Set up initial scenes
    this.sceneManager.addScene('game', new MainGameScene(this.gameState));
    this.sceneManager.addScene('result', new ResultScene(this.gameState));

    this.currentScene = this.sceneManager.switchTo('game');
    this.currentScene.init();
  }

  update(delta: Ticker) {
    if (this.sceneManager.allScenes.size === 0) {
      return;
    }

    if (this.gameState.ballInHole && !this.gameState.gameEnded) {
      console.log('game over...');
      this.gameState.gameEnded = true;
      this.currentScene = this.sceneManager.switchTo('result');
      this.currentScene.init();
    }

    if (this.currentScene) {
      this.currentScene.update(delta);
    }
  }
}
