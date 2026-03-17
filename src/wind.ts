import { Container, Graphics, Ticker } from 'pixi.js';
import { GameState } from './gameState';

interface WindWave {
  graphics: Graphics;
  x: number;
  y: number;
  speed: number;
  length: number;
  amplitude: number;
  frequency: number;
  phase: number;
  alpha: number;
  thickness: number;
}

export class Wind {
  private readonly gameState: GameState;
  public readonly container = new Container();
  private waves: WindWave[] = [];

  constructor(gameState: GameState) {
    this.gameState = gameState;
  }

  public init() {
    const screenSize = Math.min(this.gameState.width, this.gameState.height);
    // 1 cluster on mobile, 2 on small screens, 3 on desktop
    const numGroups = screenSize < 600 ? 1 : screenSize < 900 ? 2 : 3;
    const wavesPerGroup = screenSize < 600 ? 2 : 3;

    for (let g = 0; g < numGroups; g++) {
      const groupX = Math.random() * this.gameState.width;
      const groupY = Math.random() * this.gameState.height;
      const groupSpeed = Math.random() * 0.35 + 0.25;

      for (let i = 0; i < wavesPerGroup; i++) {
        const offsetX = (Math.random() - 0.5) * 40;
        const offsetY = i * 12 + (Math.random() - 0.5) * 8;
        this.createWave(groupX + offsetX, groupY + offsetY, groupSpeed + (Math.random() - 0.5) * 0.1);
      }
    }
  }

  private createWave(x: number, y: number, speed: number) {
    const wave = new Graphics();
    const length = 150 + Math.random() * 150;
    const amplitude = 6 + Math.random() * 2;
    const frequency = 0.015 + Math.random() * 0.01;
    const phase = Math.random() * Math.PI * 2;
    const alpha = 0.05 + Math.random() * 0.05;
    const thickness = Math.ceil(Math.random() * 8);

    this.drawWave(wave, length, amplitude, frequency, phase, alpha, thickness);
    wave.x = x;
    wave.y = y;
    this.container.addChild(wave);

    this.waves.push({ graphics: wave, x, y, speed, length, amplitude, frequency, phase, alpha, thickness });
  }

  private drawWave(
    graphics: Graphics,
    length: number,
    amplitude: number,
    frequency: number,
    phase: number,
    alpha: number,
    thickness: number,
  ) {
    graphics.clear();
    const segments = 40;
    const startY = Math.sin(phase) * amplitude;
    graphics.moveTo(0, startY);

    for (let i = 1; i <= segments; i++) {
      const t = i / segments;
      const xPos = t * length;
      const edgeFade = Math.sin(t * Math.PI);
      const yPos = Math.sin(t * Math.PI * 2 * frequency * length + phase) * amplitude * edgeFade;
      graphics.lineTo(xPos, yPos);
    }

    graphics.stroke({ color: 0xffffff, width: thickness, alpha });
  }

  public update(delta: Ticker) {
    const dt = delta.deltaTime / 60;
    for (const wave of this.waves) {
      wave.x += wave.speed * dt * 60;
      wave.phase += dt * 0.8;
      this.drawWave(wave.graphics, wave.length, wave.amplitude, wave.frequency, wave.phase, wave.alpha, wave.thickness);
      wave.graphics.x = wave.x;

      if (wave.x > this.gameState.width + 20) {
        wave.x = -wave.length;
        wave.y = Math.random() * this.gameState.height;
        wave.graphics.x = wave.x;
        wave.graphics.y = wave.y;
      }
    }
  }
}
