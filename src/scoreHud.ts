import { Container, Graphics, Text, TextStyle } from 'pixi.js';

import { GameState } from './gameState';

const PAD = 16;
const HUD_H = 60;
const BTN_R = 20; // circle radius
const BTN_GAP = 10;
const HUD_W_MAX = 360;
const HUD_W_MIN = 140;
const ACCENT = 0x52b788;
const CORNER = 14;

interface HudLayout {
  hudX: number;
  hudY: number;
  hudW: number;
  titleDividerX: number;
  sectionDividerX: number;
  parCx: number;
  scoreCx: number;
  titleValueFontSize: number;
  labelFontSize: number;
  valueFontSize: number;
  btn1Cx: number;
  btn2Cx: number;
}

export class ScoreHud extends Container {
  private readonly gameState: GameState;
  private parText: Text | null = null;
  private scoreText: Text | null = null;
  private layout: HudLayout;
  private readonly onParSet = (par: number) => {
    if (!this.parText) return;
    this.parText.text = `${par}`;
    this.positionText();
  };
  private readonly onScoreChanged = () => {
    if (!this.scoreText) return;
    this.scoreText.text = `${this.gameState.score}`;
    this.positionText();
  };

  constructor(gameState: GameState, onReset: () => void, onHelp: () => void) {
    super();
    this.gameState = gameState;
    this.layout = this.calculateLayout();
    this.build(onReset, onHelp);
    this.listen();
  }

  private calculateLayout(): HudLayout {
    const hudW = Math.max(HUD_W_MIN, Math.min(HUD_W_MAX, this.gameState.width - PAD * 2));
    const hudX = Math.max(0, this.gameState.width - hudW - PAD);
    const hudY = PAD;

    const controlsW = BTN_R * 2 + BTN_GAP + BTN_R + PAD;
    const leftSectionW = Math.max(54, Math.min(78, Math.floor(hudW * 0.24)));
    const middleStart = hudX + PAD + leftSectionW + 10;
    const middleEnd = hudX + hudW - PAD - controlsW;
    const middleSpan = Math.max(0, middleEnd - middleStart);
    const safeSpan = Math.max(1, middleSpan);
    const clamp = (x: number) => Math.max(middleStart, Math.min(middleEnd, x));

    const parCx = clamp(middleStart + safeSpan * 0.34);
    const scoreCx = clamp(middleStart + safeSpan * 0.72);
    const titleDividerX = Math.min(hudX + hudW - 1, Math.max(hudX, hudX + PAD + leftSectionW));
    const sectionDividerX = clamp(hudX + PAD + leftSectionW + 10 + safeSpan / 2);

    const titleValueFontSize = Math.max(12, Math.min(22, Math.floor(hudW * 0.062)));
    const labelFontSize = Math.max(9, Math.min(11, Math.floor(hudW * 0.028)));
    const valueFontSize = Math.max(16, Math.min(26, Math.floor(hudW * 0.072)));

    const btn2Cx = hudX + hudW - PAD - BTN_R;
    const btn1Cx = btn2Cx - BTN_R * 2 - BTN_GAP;

    return {
      hudX,
      hudY,
      hudW,
      titleDividerX,
      sectionDividerX,
      parCx,
      scoreCx,
      titleValueFontSize,
      labelFontSize,
      valueFontSize,
      btn1Cx,
      btn2Cx,
    };
  }

  private build(onReset: () => void, onHelp: () => void) {
    const {
      hudX,
      hudY,
      hudW,
      titleDividerX,
      sectionDividerX,
      parCx,
      scoreCx,
      titleValueFontSize,
      labelFontSize,
      valueFontSize,
      btn1Cx,
      btn2Cx,
    } = this.layout;
    const btnCy = hudY + HUD_H / 2;

    // Drop shadow
    const shadow = new Graphics();
    shadow.roundRect(hudX + 4, hudY + 4, hudW, HUD_H, CORNER);
    shadow.fill({ color: 0x000000, alpha: 0.18 });
    this.addChild(shadow);

    // Background panel
    const bg = new Graphics();
    bg.roundRect(hudX, hudY, hudW, HUD_H, CORNER);
    bg.fill({ color: 0x0d1f14, alpha: 0.25 });
    this.addChild(bg);

    // Green border stroke
    const border = new Graphics();
    border.roundRect(hudX, hudY, hudW, HUD_H, CORNER);
    border.stroke({ color: ACCENT, alpha: 0.55, width: 1.5 });
    this.addChild(border);

    // Top highlight (glass sheen)
    const sheen = new Graphics();
    sheen.roundRect(hudX + 2, hudY + 2, hudW - 4, HUD_H / 2 - 2, CORNER - 2);
    sheen.fill({ color: 0xffffff, alpha: 0.04 });
    this.addChild(sheen);

    // Game title (left brand)
    const titleStyle = new TextStyle({ fontFamily: 'Bangers', fontSize: titleValueFontSize + 10, fill: '#ffc947', letterSpacing: 1 });
    const titleTop = new Text({ text: '⛳ FUN', style: titleStyle });
    const titleBot = new Text({
      text: 'GOLF',
      style: new TextStyle({ fontFamily: 'Bangers', fontSize: titleValueFontSize, fill: '#74c69d', letterSpacing: 1 }),
    });
    titleTop.x = hudX + PAD;
    titleTop.y = hudY - 4;
    titleBot.x = hudX + PAD + 42;
    titleBot.y = hudY + 30;
    this.addChild(titleTop);
    this.addChild(titleBot);

    // Title divider
    const titleDiv = new Graphics();
    titleDiv.rect(titleDividerX + 20, hudY + 10, 1, HUD_H - 20);
    titleDiv.fill({ color: ACCENT, alpha: 0.3 });
    this.addChild(titleDiv);

    const labelStyle = new TextStyle({
      fontFamily: 'Bangers',
      fontSize: labelFontSize,
      fill: '#74c69d',
      letterSpacing: 2,
    });
    const valueStyle = new TextStyle({
      fontFamily: 'Bangers',
      fontSize: valueFontSize,
      fill: '#ffffff',
    });

    // --- Par section ---
    const parLabel = new Text({ text: 'PAR', style: labelStyle });
    parLabel.x = parCx - parLabel.width / 2;
    parLabel.y = hudY + 8;
    this.addChild(parLabel);

    this.parText = new Text({ text: `${this.gameState.parScore}`, style: valueStyle });
    this.parText.y = hudY + 20;
    this.addChild(this.parText);

    // Divider
    const div = new Graphics();
    div.rect(sectionDividerX, hudY + 10, 1, HUD_H - 20);
    div.fill({ color: ACCENT, alpha: 0.3 });
    this.addChild(div);

    // --- Score section ---
    const scoreLabel = new Text({ text: 'SCORE', style: labelStyle });
    scoreLabel.x = scoreCx - scoreLabel.width / 2;
    scoreLabel.y = hudY + 8;
    this.addChild(scoreLabel);

    this.scoreText = new Text({ text: '0', style: valueStyle });
    this.scoreText.y = hudY + 19;
    this.addChild(this.scoreText);

    this.positionText();

    // --- Buttons (circular, right side) ---
    this.addCircleButton('↺', btn1Cx, btnCy, 0x2d6a4f, onReset);
    this.addCircleButton('?', btn2Cx, btnCy, 0x1a4874, onHelp);
  }

  private positionText() {
    if (!this.parText || !this.scoreText) return;
    const { parCx, scoreCx } = this.layout;

    this.parText.x = parCx - this.parText.width / 2;
    this.scoreText.x = scoreCx - this.scoreText.width / 2;
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
    btn.on('pointerover', () => {
      face.tint = 0xcccccc;
    });
    btn.on('pointerout', () => {
      face.tint = 0xffffff;
    });

    this.addChild(btn);
  }

  private listen() {
    this.gameState.eventEmitter.on('parSet', this.onParSet);
    this.gameState.eventEmitter.on('scoreChanged', this.onScoreChanged);
  }

  public destroy(options?: boolean | Record<string, any>) {
    this.gameState.eventEmitter.off('parSet', this.onParSet);
    this.gameState.eventEmitter.off('scoreChanged', this.onScoreChanged);
    this.removeChildren();
    super.destroy(options);
  }
}
