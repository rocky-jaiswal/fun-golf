import { Container, Graphics, Text, TextStyle } from 'pixi.js';

import { GameState } from './gameState';

const PAD = 16;
const HUD_H = 60;
const BTN_R = 20; // circle radius
const BTN_GAP = 10;
const HUD_W = 360;
const ACCENT = 0x52b788;
const CORNER = 14;

export class ScoreHud extends Container {
  private readonly gameState: GameState;
  private parText: Text | null = null;
  private scoreText: Text | null = null;

  constructor(gameState: GameState, onReset: () => void, onHelp: () => void) {
    super();
    this.gameState = gameState;
    this.build(onReset, onHelp);
    this.listen();
  }

  private build(onReset: () => void, onHelp: () => void) {
    const x = this.gameState.width - HUD_W - PAD;
    const y = PAD;

    // Drop shadow
    const shadow = new Graphics();
    shadow.roundRect(x + 4, y + 4, HUD_W, HUD_H, CORNER);
    shadow.fill({ color: 0x000000, alpha: 0.18 });
    this.addChild(shadow);

    // Background panel
    const bg = new Graphics();
    bg.roundRect(x, y, HUD_W, HUD_H, CORNER);
    bg.fill({ color: 0x0d1f14, alpha: 0.25 });
    this.addChild(bg);

    // Green border stroke
    const border = new Graphics();
    border.roundRect(x, y, HUD_W, HUD_H, CORNER);
    border.stroke({ color: ACCENT, alpha: 0.55, width: 1.5 });
    this.addChild(border);

    // Top highlight (glass sheen)
    const sheen = new Graphics();
    sheen.roundRect(x + 2, y + 2, HUD_W - 4, HUD_H / 2 - 2, CORNER - 2);
    sheen.fill({ color: 0xffffff, alpha: 0.04 });
    this.addChild(sheen);

    // Game title (left brand)
    const titleStyle = new TextStyle({ fontFamily: 'Bangers', fontSize: 22, fill: '#ffc947', letterSpacing: 1 });
    const titleTop = new Text({ text: 'FUN', style: titleStyle });
    const titleBot = new Text({ text: 'GOLF ⛳', style: new TextStyle({ fontFamily: 'Bangers', fontSize: 15, fill: '#74c69d', letterSpacing: 1 }) });
    titleTop.x = x + PAD;
    titleTop.y = y + 6;
    titleBot.x = x + PAD;
    titleBot.y = y + 30;
    this.addChild(titleTop);
    this.addChild(titleBot);

    // Title divider
    const titleDiv = new Graphics();
    titleDiv.rect(x + PAD + 68, y + 10, 1, HUD_H - 20);
    titleDiv.fill({ color: ACCENT, alpha: 0.3 });
    this.addChild(titleDiv);

    const labelStyle = new TextStyle({
      fontFamily: 'Bangers',
      fontSize: 11,
      fill: '#74c69d',
      letterSpacing: 2,
    });
    const valueStyle = new TextStyle({
      fontFamily: 'Bangers',
      fontSize: 26,
      fill: '#ffffff',
    });

    // --- Par section ---
    const parCx = x + PAD + 68 + 38;

    const parLabel = new Text({ text: 'PAR', style: labelStyle });
    parLabel.x = parCx - parLabel.width / 2;
    parLabel.y = y + 8;
    this.addChild(parLabel);

    this.parText = new Text({ text: `${this.gameState.parScore}`, style: valueStyle });
    this.parText.x = parCx - this.parText.width / 2;
    this.parText.y = y + 20;
    this.addChild(this.parText);

    // Divider
    const div = new Graphics();
    div.rect(x + PAD + 68 + 80, y + 10, 1, HUD_H - 20);
    div.fill({ color: ACCENT, alpha: 0.3 });
    this.addChild(div);

    // --- Score section ---
    const scoreCx = x + PAD + 68 + 126;

    const scoreLabel = new Text({ text: 'SCORE', style: labelStyle });
    scoreLabel.x = scoreCx - scoreLabel.width / 2;
    scoreLabel.y = y + 8;
    this.addChild(scoreLabel);

    this.scoreText = new Text({ text: '0', style: valueStyle });
    this.scoreText.x = scoreCx - this.scoreText.width / 2;
    this.scoreText.y = y + 19;
    this.addChild(this.scoreText);

    // --- Buttons (circular, right side) ---
    const btnCy = y + HUD_H / 2;
    const btn2Cx = x + HUD_W - PAD - BTN_R;
    const btn1Cx = btn2Cx - BTN_R * 2 - BTN_GAP;

    this.addCircleButton('↺', btn1Cx, btnCy, 0x2d6a4f, onReset);
    this.addCircleButton('?', btn2Cx, btnCy, 0x1a4874, onHelp);
  }

  private addCircleButton(label: string, cx: number, cy: number, color: number, onClick: () => void) {
    const btn = new Container();
    btn.eventMode = 'static';
    btn.cursor = 'pointer';

    // Shadow circle
    const shadow = new Graphics();
    shadow.circle(cx, cy + 3, BTN_R);
    shadow.fill({ color: 0x000000, alpha: 0.4 });
    btn.addChild(shadow);

    // Face circle
    const face = new Graphics();
    face.circle(cx, cy, BTN_R);
    face.fill(color);
    btn.addChild(face);

    // Subtle border
    const ring = new Graphics();
    ring.circle(cx, cy, BTN_R);
    ring.stroke({ color: 0xffffff, alpha: 0.15, width: 1 });
    btn.addChild(ring);

    // Icon
    const t = new Text({
      text: label,
      style: new TextStyle({ fontFamily: 'Bangers', fontSize: 17, fill: '#ffffff' }),
    });
    t.x = cx - t.width / 2;
    t.y = cy - t.height / 2 - 4;
    btn.addChild(t);

    btn.on('pointerdown', onClick);

    // Hover effect
    btn.on('pointerover', () => { face.tint = 0xcccccc; });
    btn.on('pointerout', () => { face.tint = 0xffffff; });

    this.addChild(btn);
  }

  private listen() {
    this.gameState.eventEmitter.on('parSet', (par: number) => {
      if (this.parText) {
        this.parText.text = `${par}`;
        this.parText.x =
          this.gameState.width - HUD_W - PAD + PAD + 68 + 38 - this.parText.width / 2;
      }
    });

    this.gameState.eventEmitter.on('scoreChanged', () => {
      if (this.scoreText) {
        this.scoreText.text = `${this.gameState.score}`;
        this.scoreText.x =
          this.gameState.width - HUD_W - PAD + PAD + 68 + 126 - this.scoreText.width / 2;
      }
    });
  }
}
