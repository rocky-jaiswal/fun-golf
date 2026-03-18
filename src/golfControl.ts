import { Container, FillGradient, Graphics, Text, Ticker } from 'pixi.js';
import { GameState } from './gameState';

export class GolfControl {
  private readonly gameState: GameState;
  private readonly container: Container;

  // Direction wheel
  private readonly wheelCx: number;
  private readonly wheelCy: number;
  private readonly wheelR = 32;
  private wheelAngle: number;
  private wheelRotDir: number;
  private readonly wheelSpeed = 0.032; // radians per frame
  private dirLocked = false;
  private wheelBg!: Graphics;
  private wheelIndicator!: Graphics;

  // Power gauge (horizontal oscillating bar)
  private readonly barX: number;
  private readonly barY: number;
  private readonly barW = 110;
  private readonly barH = 14;
  private powerPos: number; // 0 to 1
  private powerDir: number; // 1 or -1
  private powerSpeed = 0.01; // varies slightly each shot
  private powerLocked = false;
  private powerMarker!: Graphics;

  // Hit button
  private readonly btnCx: number;
  private readonly btnCy: number;
  private readonly btnW = 70;
  private readonly btnH = 70;
  private btnBg!: Graphics;
  private ring1!: Graphics;
  private ring2!: Graphics;

  // Click state
  private clickCount = 0;
  private prevShouldHide = false;

  constructor(gameState: GameState) {
    this.gameState = gameState;
    this.container = new Container();

    // Randomise starting positions so it feels fresh each shot
    this.wheelAngle = Math.random() * Math.PI * 2;
    this.wheelRotDir = Math.random() > 0.5 ? 1 : -1;
    this.powerPos = 0.2 + Math.random() * 0.4;
    this.powerDir = Math.random() > 0.5 ? 1 : -1;

    // Place the panel centered at the bottom of the screen.
    // Layout left-to-right: wheel | bar | button (total width 284px)
    this.btnCy   = gameState.height - 65 - this.btnH / 2;
    this.wheelCx = Math.round(gameState.width / 2 - 110);
    this.barX    = Math.round(gameState.width / 2 - 58);
    this.btnCx   = Math.round(gameState.width / 2 + 107);

    this.barY    = this.btnCy - this.barH / 2;
    this.wheelCy = this.btnCy;

    this.build();
  }

  private build() {
    // ── Panel background ──────────────────────────────────────────
    // Content edges — works regardless of which side the button/wheel sits on.
    // Ring2 extends 10px beyond button edges; label text sits ~22px below wheel bottom.
    const contentLeft  = Math.min(this.wheelCx - this.wheelR, this.btnCx - this.btnW / 2 - 10);
    const contentRight = Math.max(this.wheelCx + this.wheelR, this.btnCx + this.btnW / 2 + 10);
    const contentTop   = this.btnCy - this.btnH / 2 - 10; // ring above button (tallest element)
    const contentBot   = this.wheelCy + this.wheelR + 22;  // label below wheel

    const pad = 14;
    const panelLeft   = contentLeft  - pad;
    const panelRight  = contentRight + pad;
    const panelTop    = contentTop   - pad;
    const panelBottom = contentBot   + pad;

    const panel = new Graphics();
    panel.roundRect(panelLeft, panelTop, panelRight - panelLeft, panelBottom - panelTop, 16);
    panel.fill({ color: 0x0a0a1a, alpha: 0.25 });
    panel.roundRect(panelLeft, panelTop, panelRight - panelLeft, panelBottom - panelTop, 16);
    panel.stroke({ color: 0x2255aa, width: 1.5, alpha: 0.55 });
    this.container.addChild(panel);

    // ── Direction wheel ──────────────────────────────────────────
    this.wheelBg = new Graphics();
    this.wheelBg.circle(this.wheelCx, this.wheelCy, this.wheelR);
    this.wheelBg.fill({ color: 0x111122 });
    this.wheelBg.circle(this.wheelCx, this.wheelCy, this.wheelR);
    this.wheelBg.stroke({ color: 0x4499dd, width: 2 });
    this.container.addChild(this.wheelBg);
    this.wheelBg.alpha = 0.88;

    this.wheelIndicator = new Graphics();
    this.container.addChild(this.wheelIndicator);

    const aimLabel = new Text({
      text: 'AIM',
      style: { fontFamily: 'Arial', fontSize: 11, fill: 0x88bbdd },
    });
    aimLabel.anchor.set(0.5);
    aimLabel.x = this.wheelCx;
    aimLabel.y = this.wheelCy + this.wheelR + 9;
    this.container.addChild(aimLabel);

    // ── Power gauge ───────────────────────────────────────────────
    const powerBg = new Graphics();
    powerBg.rect(this.barX, this.barY, this.barW, this.barH);
    powerBg.fill({ color: 0x111122 });
    powerBg.alpha = 0.88;
    this.container.addChild(powerBg);

    const gradient = new FillGradient({
      type: 'linear',
      start: { x: 0, y: 0 },
      end:   { x: 1, y: 0 },
      colorStops: [
        { offset: 0,    color: 0x22aa44 }, // green
        { offset: 0.45, color: 0xccbb00 }, // yellow
        { offset: 1,    color: 0xcc3311 }, // red
      ],
    });

    const zones = new Graphics();
    zones.rect(this.barX, this.barY, this.barW, this.barH);
    zones.fill(gradient);
    zones.alpha = 0.88;
    this.container.addChild(zones);

    this.powerMarker = new Graphics();
    this.container.addChild(this.powerMarker);

    const powerLabel = new Text({
      text: 'POWER',
      style: { fontFamily: 'Arial', fontSize: 11, fill: 0x88bbdd },
    });
    powerLabel.anchor.set(0.5);
    powerLabel.x = this.barX + this.barW / 2;
    powerLabel.y = this.barY + this.barH + 9;
    this.container.addChild(powerLabel);

    // ── Hit button ────────────────────────────────────────────────
    const r = 10;

    this.ring2 = new Graphics();
    this.ring2.roundRect(
      this.btnCx - this.btnW / 2 - 10,
      this.btnCy - this.btnH / 2 - 10,
      this.btnW + 20,
      this.btnH + 20,
      r + 6,
    );
    this.ring2.stroke({ color: 0x4488cc, width: 2.5 });
    this.container.addChild(this.ring2);

    this.ring1 = new Graphics();
    this.ring1.roundRect(
      this.btnCx - this.btnW / 2 - 5,
      this.btnCy - this.btnH / 2 - 5,
      this.btnW + 10,
      this.btnH + 10,
      r + 3,
    );
    this.ring1.stroke({ color: 0x00ccff, width: 2.5 });
    this.container.addChild(this.ring1);

    this.btnBg = new Graphics();
    this.btnBg.roundRect(this.btnCx - this.btnW / 2, this.btnCy - this.btnH / 2, this.btnW, this.btnH, r);
    this.btnBg.fill({ color: 0x0055aa });
    this.btnBg.alpha = 0.8;
    this.btnBg.eventMode = 'static';
    this.btnBg.cursor = 'pointer';
    this.btnBg.on('pointerdown', () => this.onClick());
    this.container.addChild(this.btnBg);

    this.drawGolfBall();
  }

  private drawGolfBall() {
    const ball = new Graphics();
    const cx = this.btnCx;
    const cy = this.btnCy;
    const ballR = 22;

    // Base white sphere
    ball.circle(cx, cy, ballR);
    ball.fill({ color: 0xffffff });

    // Subtle highlight — off-centre circle to give a 3-D feel
    ball.circle(cx - 5, cy - 6, ballR * 0.55);
    ball.fill({ color: 0xffffff, alpha: 0.35 });

    // Shadow arc at the bottom-right
    ball.circle(cx + 5, cy + 6, ballR * 0.8);
    ball.fill({ color: 0xdddddd, alpha: 0.25 });

    // Dimples — small indentation circles
    const dimpleR = 2.4;
    const dimpleColor = 0xaaaaaa;
    const dimpleAlpha = 0.65;

    // Arranged in a classic 5-row hex-offset pattern, all within the ball
    const positions: [number, number][] = [
      // row top
      [-8, -14], [0, -14], [8, -14],
      // row upper-mid
      [-12, -7], [-4, -7], [4, -7], [12, -7],
      // row centre
      [-14, 0], [-7, 0], [0, 0], [7, 0], [14, 0],
      // row lower-mid
      [-12, 7], [-4, 7], [4, 7], [12, 7],
      // row bottom
      [-8, 14], [0, 14], [8, 14],
    ];

    for (const [dx, dy] of positions) {
      ball.circle(cx + dx, cy + dy, dimpleR);
      ball.fill({ color: dimpleColor, alpha: dimpleAlpha });
    }

    this.container.addChild(ball);
  }

  private onClick() {
    if (this.gameState.ballInMotion) return;

    this.clickCount++;

    if (this.clickCount === 1) {
      // Lock direction — power gauge keeps oscillating
      this.dirLocked = true;
      this.ring1.visible = false;
    } else if (this.clickCount === 2) {
      // Lock power and fire
      this.powerLocked = true;
      this.ring2.visible = false;
      this.btnBg.alpha = 0.3;
      this.btnBg.cursor = 'default';
      this.gameState.eventEmitter.emit('shotFired');
    }
  }

  public update(_delta: Ticker) {
    const shouldHide =
      this.gameState.ballInMotion ||
      this.gameState.ballInHazard ||
      this.gameState.calculatingNewBallPosition ||
      this.gameState.ballInHole;

    // Reset gauges when ball comes to rest
    if (this.prevShouldHide && !shouldHide) {
      this.reset();
    }
    this.prevShouldHide = shouldHide;

    if (shouldHide) {
      this.container.visible = false;
      return;
    }

    this.container.visible = true;

    // Animate direction wheel
    if (!this.dirLocked) {
      this.wheelAngle += this.wheelSpeed * this.wheelRotDir;
      if (this.wheelAngle >= Math.PI * 2) this.wheelAngle -= Math.PI * 2;
      else if (this.wheelAngle < 0) this.wheelAngle += Math.PI * 2;
      this.gameState.hitAngle = (this.wheelAngle * 180) / Math.PI;
    }
    this.redrawWheelIndicator();

    // Animate power gauge (oscillates so timing matters)
    if (!this.powerLocked) {
      this.powerPos += this.powerSpeed * this.powerDir;
      if (this.powerPos >= 1) {
        this.powerPos = 1;
        this.powerDir = -1;
      } else if (this.powerPos <= 0) {
        this.powerPos = 0;
        this.powerDir = 1;
      }
      this.gameState.hitForce = Math.round(10 + this.powerPos * 90);
    }
    this.redrawPowerMarker();
  }

  private redrawWheelIndicator() {
    this.wheelIndicator.clear();
    const len = this.wheelR - 5;
    const ex = this.wheelCx + Math.cos(this.wheelAngle) * len;
    const ey = this.wheelCy + Math.sin(this.wheelAngle) * len;
    this.wheelIndicator.moveTo(this.wheelCx, this.wheelCy);
    this.wheelIndicator.lineTo(ex, ey);
    this.wheelIndicator.stroke({ color: 0xff8800, width: 3 });
    this.wheelIndicator.circle(this.wheelCx, this.wheelCy, 3);
    this.wheelIndicator.fill({ color: 0xff8800 });
  }

  private redrawPowerMarker() {
    this.powerMarker.clear();
    const mw = 4;
    const mx = this.barX + this.powerPos * (this.barW - mw);
    this.powerMarker.rect(mx, this.barY - 3, mw, this.barH + 6);
    this.powerMarker.fill({ color: 0xffff00 });
  }

  private reset() {
    this.clickCount = 0;
    this.dirLocked = false;
    this.powerLocked = false;
    this.ring1.visible = true;
    this.ring2.visible = true;
    this.btnBg.alpha = 0.8;
    this.btnBg.cursor = 'pointer';
    // Fresh random starting positions + slightly varied speed each shot
    this.wheelAngle = Math.random() * Math.PI * 2;
    this.wheelRotDir = Math.random() > 0.5 ? 1 : -1;
    this.powerPos = 0.2 + Math.random() * 0.4;
    this.powerDir = Math.random() > 0.5 ? 1 : -1;
    this.powerSpeed = 0.008 + Math.random() * 0.005; // 0.008–0.013 per frame
  }

  public raise(stage: Container) {
    stage.addChild(this.container); // re-adds to top if already a child
  }

  public destroy() {
    this.btnBg.removeAllListeners();
    if (this.container.parent) {
      this.container.parent.removeChild(this.container);
    }
    this.container.destroy({ children: true });
  }
}
