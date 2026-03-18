import { Graphics } from 'pixi.js';

import { MainGameScene } from './mainGameScene';
import { GameState } from './gameState';

export class Hole {
  public static addHole(scene: MainGameScene, gameState: GameState) {
    const hole = new Graphics();
    hole.circle(gameState.holePositionX, gameState.holePositionY, GameState.holeRadius);
    hole.fill('#000000');
    scene.addChild(hole);
  }
}
