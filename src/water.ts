import { Graphics } from 'pixi.js';

import { GameState } from './gameState';
import { MainGameScene } from './mainGameScene';

export class Water {
  public static addWater(scene: MainGameScene, gameState: GameState) {
    Object.keys(gameState.mainMap)
      .filter((k: string) => gameState.mainMap[k] === 'W')
      .forEach((k) => {
        const graphics = new Graphics();

        const x = parseInt(k.split('|')[0]);
        const y = parseInt(k.split('|')[1]);

        graphics.roundRect(x * 50, y * 50, 50, 50, 8);
        graphics.fill('#80C5DE');

        scene.addChild(graphics);
      });
  }
}
