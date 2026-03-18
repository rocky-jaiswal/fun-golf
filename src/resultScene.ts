import { Container, Graphics, Text, TextStyle, Ticker } from 'pixi.js';

import { GameState } from './gameState';
import { GameScene } from './types';
import { getRandomInt, getRandomIntBetween } from './util';

export class ResultScene extends Container implements GameScene {
  private readonly gameState: GameState;
  private readonly onReset: () => void;
  private emojis: Text[] = [];
  private directionsX: Record<number, string> = {};
  private directionsY: Record<number, string> = {};

  constructor(gameState: GameState, onReset: () => void) {
    super();
    this.gameState = gameState;
    this.onReset = onReset;
  }

  public init() {
    this.removeChildren();
    this.emojis = [];
    this.directionsX = {};
    this.directionsY = {};

    const W = this.gameState.width;
    const H = this.gameState.height;

    const dimOverlay = new Graphics();
    dimOverlay.rect(0, 0, W, H);
    dimOverlay.fill({ color: 0x000000, alpha: 0.45 });
    this.addChild(dimOverlay);

    const isAtOrUnderPar = this.gameState.score <= this.gameState.parScore;
    const emoji = isAtOrUnderPar ? '⛳' : '👍';

    // Floating emojis spread across full screen
    Array(24).fill(null).forEach((_, i) => {
      const t = new Text({ text: emoji });
      t.x = getRandomIntBetween(20, W - 40);
      t.y = getRandomIntBetween(20, H - 40);
      this.emojis.push(t);
      this.directionsX[i] = getRandomInt(2) === 0 ? 'left' : 'right';
      this.directionsY[i] = getRandomInt(2) === 0 ? 'up' : 'down';
      this.addChild(t);
    });

    // Centered result panel
    const PW = Math.min(340, W - 40);
    const PH = 190;
    const px = (W - PW) / 2;
    const py = (H - PH) / 2;

    const panel = new Graphics();
    panel.roundRect(px, py, PW, PH, 14);
    panel.fill({ color: 0x000000, alpha: 0.78 });
    panel.stroke({ color: isAtOrUnderPar ? 0x4ade80 : 0xffc947, width: 2 });
    this.addChild(panel);

    const titleStyle = new TextStyle({
      fontFamily: 'Bangers',
      fontSize: 44,
      fill: '#f26f6f',
      stroke: { color: '#333', width: 3, join: 'round' },
    });
    const title = new Text({ text: 'Game Over!', style: titleStyle });
    title.x = px + PW / 2 - title.width / 2;
    title.y = py + 16;
    this.addChild(title);

    const resultText = isAtOrUnderPar
      ? `At or under par! ${emoji}`
      : `Score: ${this.gameState.score}  /  Par: ${this.gameState.parScore}`;
    const subStyle = new TextStyle({
      fontFamily: 'Bangers',
      fontSize: 22,
      fill: isAtOrUnderPar ? '#4ade80' : '#ffc947',
    });
    const sub = new Text({ text: resultText, style: subStyle });
    sub.x = px + PW / 2 - sub.width / 2;
    sub.y = py + 74;
    this.addChild(sub);

    // Play Again button
    const btnW = 170;
    const btnH = 44;
    const btnX = px + (PW - btnW) / 2;
    const btnY = py + PH - btnH - 16;

    const btnShadow = new Graphics();
    btnShadow.roundRect(btnX, btnY + 4, btnW, btnH, 8);
    btnShadow.fill(0x1a4a30);
    this.addChild(btnShadow);

    const btn = new Graphics();
    btn.roundRect(btnX, btnY, btnW, btnH, 8);
    btn.fill(0x2d6a4f);
    btn.eventMode = 'static';
    btn.cursor = 'pointer';
    btn.on('pointerdown', this.onReset);
    this.addChild(btn);

    const btnText = new Text({
      text: 'Play Again 🔁',
      style: new TextStyle({ fontFamily: 'Bangers', fontSize: 20, fill: '#ffffff' }),
    });
    btnText.x = btnX + btnW / 2 - btnText.width / 2;
    btnText.y = btnY + btnH / 2 - btnText.height / 2;
    this.addChild(btnText);
  }

  public update(_delta: Ticker) {
    const W = this.gameState.width;
    const H = this.gameState.height;

    this.emojis.forEach((t, i) => {
      if (this.directionsX[i] === 'right' && t.x >= W - 40) this.directionsX[i] = 'left';
      if (this.directionsX[i] === 'left' && t.x <= 20) this.directionsX[i] = 'right';
      if (this.directionsY[i] === 'down' && t.y >= H - 40) this.directionsY[i] = 'up';
      if (this.directionsY[i] === 'up' && t.y <= 20) this.directionsY[i] = 'down';

      t.x += this.directionsX[i] === 'right' ? 0.35 : -0.35;
      t.y += this.directionsY[i] === 'down' ? 0.35 : -0.35;
    });
  }
}
