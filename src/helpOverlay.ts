import { Container, Graphics, Text, TextStyle } from 'pixi.js';

import { GameState } from './gameState';

export class HelpOverlay extends Container {
  constructor(gameState: GameState, onClose: () => void) {
    super();

    const W = gameState.width;
    const H = gameState.height;

    // Dim background
    const dim = new Graphics();
    dim.rect(0, 0, W, H);
    dim.fill({ color: 0x000000, alpha: 0.72 });
    dim.eventMode = 'static'; // block clicks through to game
    this.addChild(dim);

    // Panel
    const PW = Math.min(620, W - 40);
    const PH = 420;
    const px = (W - PW) / 2;
    const py = (H - PH) / 2;

    const panel = new Graphics();
    panel.roundRect(px, py, PW, PH, 14);
    panel.fill(0x1a3a24);
    panel.stroke({ color: 0x4ade80, width: 2 });
    this.addChild(panel);

    // Title
    const titleStyle = new TextStyle({ fontFamily: 'Bangers', fontSize: 30, fill: '#ffc947' });
    const title = new Text({ text: 'How to Play ⛳', style: titleStyle });
    title.x = px + PW / 2 - title.width / 2;
    title.y = py + 16;
    this.addChild(title);

    // Instructions
    const lines = [
      '• Get the ball into the hole in as few strokes as possible',
      '• Hover over the ball to aim, or let the line auto-rotate to your desired direction',
      '• Click & hold to charge power: Green = low power & Red = max power',
      '• Water or sand resets your ball and costs a stroke',
      '• Trees deflect the ball — use them or avoid them!',
      '• Finish at or under par for a perfect round',
    ];

    const lineStyle = new TextStyle({
      fontFamily: 'Arial',
      fontSize: 15,
      fill: '#dddddd',
      wordWrap: true,
      wordWrapWidth: PW - 48,
    });

    lines.forEach((line, i) => {
      const t = new Text({ text: line, style: lineStyle });
      t.x = px + 20;
      t.y = py + 72 + i * 42;
      this.addChild(t);
    });

    // Close button
    const CLOSE_SIZE = 34;
    const closeBtn = new Graphics();
    closeBtn.roundRect(px + PW - CLOSE_SIZE - 10, py + 10, CLOSE_SIZE, CLOSE_SIZE, 6);
    closeBtn.fill(0x7f1d1d);
    closeBtn.eventMode = 'static';
    closeBtn.cursor = 'pointer';
    closeBtn.on('pointerdown', onClose);
    this.addChild(closeBtn);

    const closeX = new Text({
      text: '✕',
      style: new TextStyle({ fontSize: 16, fill: '#ffffff', fontWeight: 'bold' }),
    });
    closeX.x = px + PW - CLOSE_SIZE - 10 + CLOSE_SIZE / 2 - closeX.width / 2;
    closeX.y = py + 10 + CLOSE_SIZE / 2 - closeX.height / 2;
    this.addChild(closeX);
  }
}
