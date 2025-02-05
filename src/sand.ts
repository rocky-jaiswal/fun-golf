import { Graphics } from 'pixi.js';

import { MainGameScene } from './mainGameScene';
import { GameState } from './gameState';

export class Sand {
  public static addSand(scene: MainGameScene, gameState: GameState) {
    Object.keys(gameState.mainMap)
      .filter((k: string) => gameState.mainMap[k] === 'S')
      .forEach((k) => {
        const graphics = new Graphics();

        const x = parseInt(k.split('|')[0]);
        const y = parseInt(k.split('|')[1]);

        graphics.roundRect(x * 50, y * 50, 50, 50, 8);
        graphics.fill('#D6B588');

        scene.addChild(graphics);
      });
  }
}
