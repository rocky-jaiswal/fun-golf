import { Container, Graphics, Text, TextStyle, Ticker } from 'pixi.js';
import { GameState } from './gameState';
import { GameScene } from './types';
import { getRandomInt, getRandomIntBetween } from './util';

export class ResultScene extends Container implements GameScene {
  private readonly gameState: GameState;

  private container: Text[] = [];
  private directionsX: Record<number, string> = {};
  private directionsY: Record<number, string> = {};

  constructor(gameState: GameState) {
    super();

    this.gameState = gameState;
  }

  public init() {
    const rect = new Graphics();
    rect.roundRect(50, 50, this.gameState.width - 100, 100, 8);
    rect.fill({ color: '#f1f1f1', alpha: 0.5 });

    const totalEmjois = 20;

    const text = this.gameState.score <= this.gameState.parScore ? '⛳' : '👍';

    const style = new TextStyle({
      fontFamily: 'Bangers',
      fontSize: 36,
      fill: '#f26f6f',
      stroke: { color: '#333', width: 3, join: 'round' },
    });

    const over = new Text({ text: 'Game Over!', style });
    over.x = (this.gameState.width - 100) / 2 - 45;
    over.y = 75;

    Array(totalEmjois)
      .fill(null)
      .forEach((_, i) => {
        const t = new Text({ text });

        t.x = getRandomIntBetween(getRandomIntBetween(0, 50), this.gameState.width - 100);
        t.y = getRandomIntBetween(getRandomIntBetween(0, 50), 100);

        this.container.push(t);
        this.directionsX[i] = getRandomInt(4) % 2 === 0 ? 'left' : 'right';
        this.directionsY[i] = getRandomInt(4) % 2 === 0 ? 'up' : 'down';
      });

    this.addChild(rect);
    this.container.forEach((c) => this.addChild(c));
    this.addChild(over);
  }

  public update(_delta: Ticker) {
    this.container.forEach((t, i) => {
      if (this.directionsX[i] === 'right') {
        if (t.x >= this.gameState.width - 100) {
          this.directionsX[i] = 'left';
        }
      }

      if (this.directionsX[i] === 'left') {
        if (t.x <= 50) {
          this.directionsX[i] = 'right';
        }
      }

      if (this.directionsY[i] === 'down') {
        if (t.y >= 120) {
          this.directionsY[i] = 'up';
        }
      }

      if (this.directionsY[i] === 'up') {
        if (t.y <= 50) {
          this.directionsY[i] = 'down';
        }
      }

      let newX = t.x;
      let newY = t.y;

      // console.log(this.directionsX[i]);
      if (this.directionsX[i] === 'left') {
        newX = t.x - 0.35;
      }

      if (this.directionsX[i] === 'right') {
        newX = t.x + 0.35;
      }

      if (this.directionsY[i] === 'down') {
        newY = t.y + 0.35;
      }

      if (this.directionsY[i] === 'up') {
        newY = t.y - 0.35;
      }

      t.x = newX;
      t.y = newY;
    });
  }
}
