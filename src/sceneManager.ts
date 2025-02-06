import gsap from 'gsap';
import { Container, Graphics } from 'pixi.js';

import { GameState } from './gameState';
import { GameScene } from './types';

export class SceneManager {
  public readonly gameState: GameState;
  public readonly allScenes: Map<string, Container>;

  private currentScene: Container | null = null;

  constructor(gameState: GameState) {
    this.gameState = gameState;

    this.allScenes = new Map();
  }

  addScene(name: string, scene: Container) {
    this.allScenes.set(name, scene);
  }

  switchTo(sceneName: string): GameScene {
    const newScene = this.allScenes.get(sceneName);

    if (!newScene) {
      throw new Error('No such scene exists!');
    }

    const fade = new Graphics();
    fade.rect(0, 0, this.gameState.width, this.gameState.height);
    fade.fill({ color: '#444', alpha: 0.5 });
    fade.alpha = 0;

    this.gameState.application.stage.addChild(fade);

    gsap.to(fade, {
      alpha: 1,
      duration: 0.25,
      onComplete: () => {
        if (this.currentScene) {
          this.gameState.application.stage.removeChild(this.currentScene);
        }
        this.gameState.application.stage.addChild(newScene);
        this.currentScene = newScene;

        gsap.to(fade, {
          alpha: 0,
          duration: 0.25,
          onComplete: () => {
            this.gameState.application.stage.removeChild(fade);
          },
        });
      },
    });

    // Direct switch
    // if (this.currentScene) {
    //   this.gameState.application.stage.removeChild(this.currentScene);
    // }

    // this.gameState.application.stage.addChild(newScene);

    this.currentScene = newScene!;

    return this.currentScene as unknown as GameScene;
  }
}
