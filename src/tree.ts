import { Sprite } from 'pixi.js';

import { getRandomInt } from './util';
import { MainGameScene } from './mainGameScene';
import { GameState } from './gameState';

export class Tree {
  public static addTrees(scene: MainGameScene, gameState: GameState) {
    Object.keys(gameState.mainMap)
      .filter((k: string) => gameState.mainMap[k] === 'T')
      .forEach((k) => {
        const idx = getRandomInt(3);

        let graphics = Sprite.from(`tree${idx}`);

        const x = parseInt(k.split('|')[0]);
        const y = parseInt(k.split('|')[1]);

        // console.log({ x, y });

        graphics.width = 50;
        graphics.height = 50;

        graphics.position.set(x * 50, y * 50);

        scene.addChild(graphics);
      });
  }
}
