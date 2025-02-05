import { Graphics, Ticker } from 'pixi.js';

import { MainGameScene } from './mainGameScene';
import { GameState } from './gameState';

const colorForceMap: Record<number, string> = {
  0: '#CCC',
  10: '#00FF04',
  20: '#00FF04',
  30: '#00FF04',
  40: '#FFFE00',
  50: '#FFFE00',
  60: '#FFAF00',
  70: '#FFAF00',
  80: '#FF5700',
  90: '#FF5700',
  100: '#FF0000',
  110: '#FF0000',
};

export class RotatingLine {
  private graphics: Graphics;

  private length: number;
  private thickness: number;

  private gameState: GameState;
  private scene: MainGameScene | null = null;

  constructor(gameState: GameState) {
    this.gameState = gameState;
    this.graphics = new Graphics();

    this.length = 50;
    this.thickness = 2;
  }

  public drawLine() {
    this.graphics.clear();

    const x = this.gameState.ballPositionX + GameState.ballRadius;
    const y = this.gameState.ballPositionY + GameState.ballRadius;

    // calculate end point based on rotation
    const rad = (this.gameState.hitAngle * Math.PI) / 180;
    const endX: number = x + Math.cos(rad) * this.length;
    const endY: number = y + Math.sin(rad) * this.length;

    // Draw the line
    this.graphics.moveTo(x, y);
    this.graphics.lineTo(endX, endY);
    this.graphics.stroke({ width: this.thickness, color: colorForceMap[this.gameState.hitForce] });

    this.scene?.addChild(this.graphics);
  }

  public addHelpLine(scene: MainGameScene) {
    this.scene = scene;

    this.drawLine();

    return this;
  }

  public update(_delta: Ticker) {
    if (this.gameState.ballInMotion || this.gameState.ballInHazard) {
      this.hide();
      return;
    }

    if (this.gameState.manualRotation) {
      this.drawLine();
    }

    if (this.gameState.autoRotation) {
      if (this.gameState.hitAngle === 360) {
        this.gameState.hitAngle = 0;
      } else {
        this.gameState.hitAngle += 1.5;
      }

      this.drawLine();
    }
  }

  public hide() {
    this.graphics.clear();
  }

  public destroy(): void {
    // this.app.stage.removeChild(this.graphics);
    this.graphics.destroy();
  }
}
