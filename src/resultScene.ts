import { Container, Graphics, Text, TextStyle, Ticker } from 'pixi.js';
import { GameState } from './gameState';
import { GameScene } from './types';
import { getRandomIntBetween } from './util';

export class ResultScene extends Container implements GameScene {
  private readonly gameState: GameState;
  private container: Text[] = [];

  constructor(gameState: GameState) {
    super();

    this.gameState = gameState;
  }

  public init() {
    const rect = new Graphics();
    rect.roundRect(50, 50, this.gameState.width - 100, 100, 8);
    rect.fill({ color: '#f1f1f1', alpha: 0.5 });

    const totalEmjois = 4;

    const text = this.gameState.score <= this.gameState.parScore ? '⛳' : '👋';

    const style = new TextStyle({
      fontFamily: 'Bangers',
      fontSize: 36,
      fill: '#f26f6f',
      stroke: { color: '#333', width: 3, join: 'round' },
    });

    const over = new Text({ text: 'Game Over', style });
    over.x = (this.gameState.width - 100) / 2 - 45;
    over.y = 75;

    Array(totalEmjois)
      .fill(null)
      .forEach(() => {
        const t = new Text({ text });

        t.x = getRandomIntBetween(getRandomIntBetween(0, 50), this.gameState.width - 100);
        t.y = getRandomIntBetween(getRandomIntBetween(0, 50), 100);
        this.container.push(t);
      });

    this.addChild(rect);
    this.addChild(over);
    this.container.forEach((c) => this.addChild(c));
  }

  public update(_delta: Ticker) {
    this.container.forEach((t) => {
      let newX = t.x;
      let newY = t.y;

      if (t.x >= this.gameState.width - 100) {
        newX = 50;
      } else {
        newX = t.x + 0.35;
      }

      if (t.y >= 100) {
        newY = 50;
      } else {
        newY = t.y + 0.35;
      }

      t.x = newX;
      t.y = newY;
    });
  }
}
