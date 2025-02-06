import { Ticker } from 'pixi.js';

export interface GameScene {
  init: () => void;
  update: (d: Ticker) => void;
}

export interface GameCircle {
  x: number;
  y: number;
  r: number;
}

export interface GamePoint {
  x: number;
  y: number;
}

export interface GameArea {
  x: number;
  y: number;
  width: number;
  height: number;
}
