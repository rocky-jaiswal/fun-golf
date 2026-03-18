import { Container, Graphics, Ticker } from 'pixi.js';
import { GameState } from './gameState';

interface Cloud {
  graphics: Graphics;
  x: number;
  y: number;
  speed: number;
  width: number;
}

export class Clouds {
  private readonly gameState: GameState;
  public readonly container = new Container();
  private clouds: Cloud[] = [];

  constructor(gameState: GameState) {
    this.gameState = gameState;
  }

  public init() {
    const screenSize = Math.min(this.gameState.width, this.gameState.height);
    // 1 cluster on mobile, 2 on small screens, 3 on desktop
    const numClouds = screenSize < 600 ? 1 : screenSize < 900 ? 2 : 3;
    const maxY = this.gameState.height * 0.7;

    for (let i = 0; i < numClouds; i++) {
      this.createCloud(
        Math.random() * this.gameState.width,
        Math.random() * maxY,
        Math.random() * 0.35 + 0.08,
      );
    }
  }

  private createCloud(x: number, y: number, speed: number) {
    const cloud = new Graphics();
    const baseWidth = 150 + Math.random() * 120;
    const baseHeight = 60 + Math.random() * 40;
    const numPuffs = 3 + Math.floor(Math.random() * 3);

    for (let i = 0; i < numPuffs; i++) {
      const puffX = (i / (numPuffs - 1)) * baseWidth - baseWidth / 2;
      const puffY = (Math.random() - 0.5) * baseHeight * 0.4;
      const puffRadius = baseHeight * (0.5 + Math.random() * 0.3);
      cloud.circle(puffX, puffY, puffRadius);
    }

    cloud.fill({ color: 0xffffff, alpha: 0.05 + Math.random() * 0.05 });
    cloud.x = x;
    cloud.y = y;
    this.container.addChild(cloud);
    this.clouds.push({ graphics: cloud, x, y, speed, width: baseWidth });
  }

  public update(delta: Ticker) {
    const dt = delta.deltaTime / 60;
    for (const cloud of this.clouds) {
      cloud.x += cloud.speed * dt * 60;
      cloud.graphics.x = cloud.x;
      if (cloud.x - cloud.width / 2 > this.gameState.width) {
        cloud.x = -cloud.width / 2;
        cloud.y = Math.random() * this.gameState.height * 0.7;
        cloud.graphics.x = cloud.x;
        cloud.graphics.y = cloud.y;
      }
    }
  }

  public destroy() {
    this.container.destroy({ children: true });
  }
}
