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
import { ScoreHud } from './scoreHud';
import { HelpOverlay } from './helpOverlay';
import { GameScene } from './types';

export class Game {
  public readonly gameState: GameState;
  public readonly sceneManager: SceneManager;
  private currentScene: GameScene | null = null;
  private readonly onReset: () => void;
  private readonly boundUpdate: (delta: Ticker) => void;
  private helpOverlay: HelpOverlay | null = null;
  private htSound: Howl | null = null;
  private hoSound: Howl | null = null;

  constructor(gameState: GameState, onReset: () => void) {
    this.gameState = gameState;
    this.onReset = onReset;
    this.sceneManager = new SceneManager(gameState);
    this.boundUpdate = this.update.bind(this);
    this.gameState.application.ticker.add(this.boundUpdate);
  }

  public async init() {
    await Assets.load([
      { src: ballPNG, alias: 'ball' },
      { src: tree3PNG, alias: 'tree0' },
      { src: tree4PNG, alias: 'tree1' },
      { src: tree5PNG, alias: 'tree2' },
    ]);

    this.htSound = new Howl({ src: hitSound });
    this.hoSound = new Howl({ src: holeSound });

    this.gameState.eventEmitter.on('hit', () => this.htSound?.play());
    this.gameState.eventEmitter.on('inHole', () => this.hoSound?.play());

    this.startGame();
  }

  private scoreHud: ScoreHud | null = null;

  private startGame() {
    this.sceneManager.addScene('game', new MainGameScene(this.gameState));
    this.sceneManager.addScene('result', new ResultScene(this.gameState, this.onReset));

    this.scoreHud = new ScoreHud(this.gameState, this.onReset, () => this.toggleHelp());
    this.gameState.application.stage.addChild(this.scoreHud);

    this.currentScene = this.sceneManager.switchTo('game', () => this.raiseHud());
    this.currentScene.init();
  }

  private raiseHud() {
    if (this.scoreHud) this.gameState.application.stage.addChild(this.scoreHud);
    if (this.helpOverlay) this.gameState.application.stage.addChild(this.helpOverlay);
  }

  private toggleHelp() {
    if (this.helpOverlay) {
      this.gameState.application.stage.removeChild(this.helpOverlay);
      this.helpOverlay = null;
    } else {
      this.helpOverlay = new HelpOverlay(this.gameState, () => this.toggleHelp());
      this.gameState.application.stage.addChild(this.helpOverlay);
    }
  }

  public destroy() {
    this.gameState.application.ticker.remove(this.boundUpdate);
    this.htSound?.unload();
    this.hoSound?.unload();
  }

  update(delta: Ticker) {
    if (this.sceneManager.allScenes.size === 0) return;

    if (this.gameState.ballInHole && !this.gameState.gameEnded) {
      this.gameState.gameEnded = true;
      this.currentScene = this.sceneManager.switchTo('result', () => this.raiseHud());
      this.currentScene.init();
    }

    if (this.currentScene) {
      this.currentScene.update(delta);
    }
  }
}
