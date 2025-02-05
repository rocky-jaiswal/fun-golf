import { Graphics } from 'pixi.js';

import { MainGameScene } from './mainGameScene';
import { GameState } from './gameState';

export class Hole {
  public static addHole(scene: MainGameScene, gameState: GameState) {
    Object.keys(gameState.mainMap)
      .filter((k: string) => gameState.mainMap[k] === 'H')
      .forEach((k) => {
        const green = new Graphics();

        const x = parseInt(k.split('|')[0]);
        const y = parseInt(k.split('|')[1]);

        green.roundRect(x * 50, y * 50, 50, 50, 20);
        green.fill('#7fbb88');

        scene.addChild(green);

        const hole = new Graphics();

        hole.circle(gameState.holePositionX, gameState.holePositionY, GameState.holeRadius);
        hole.fill('#000000');

        scene.addChild(hole);
      });
  }
}
