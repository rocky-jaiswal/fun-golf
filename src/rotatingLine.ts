import { Graphics, Ticker } from 'pixi.js';

import { MainGameScene } from './mainGameScene';
import { GameState } from './gameState';

function colorForForce(force: number): string {
  if (force < 30) return '#00FF04';
  if (force < 55) return '#FFFE00';
  if (force < 78) return '#FF5700';
  return '#FF0000';
}

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

    const rad = (this.gameState.hitAngle * Math.PI) / 180;
    const endX: number = x + Math.cos(rad) * this.length;
    const endY: number = y + Math.sin(rad) * this.length;

    this.graphics.moveTo(x, y);
    this.graphics.lineTo(endX, endY);
    this.graphics.stroke({ width: this.thickness, color: colorForForce(this.gameState.hitForce) });

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

    this.drawLine();
  }

  public hide() {
    this.graphics.clear();
  }

  public destroy(): void {
    this.graphics.destroy();
  }
}
