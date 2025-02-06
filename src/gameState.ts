import { Application, EventEmitter } from 'pixi.js';

import { getRandomInt } from './util';
import { GameArea, GameCircle, GamePoint } from './types';

interface Props {
  width: number;
  height: number;
  application: Application;
  eventEmitter: EventEmitter;
}

export class GameState {
  public static readonly gridSize = 50.0;
  public static readonly holeRadius = 10;
  public static readonly ballRadius = 6;

  public readonly application: Application;
  public readonly eventEmitter: EventEmitter;

  public readonly width: number;
  public readonly height: number;
  public readonly noOfCols: number;
  public readonly noOfRows: number;

  public readonly numberOfTrees: number;
  public readonly mainMap: Record<string, string> = {};

  // dynamic state parts
  public parScore: number = 4;
  private scoringEvents: Record<string, number>[] = [];
  public score: number = 0;

  public waterAreas: GameArea[] = [];
  public sandAreas: GameArea[] = [];
  public treeAreas: GameArea[] = [];

  public holePositionX: number = 0;
  public holePositionY: number = 0;

  public autoRotation: boolean = true;
  public manualRotation: boolean = false;

  public ballInMotion: boolean = false;
  public ballInHole: boolean = false;
  public ballInHazard: boolean = false;
  public calculatingNewBallPosition: boolean = false;

  public ballPositionX = 0;
  public ballPositionY = 0;
  public ballVelocityX: number = 0;
  public ballVelocityY: number = 0;

  public hitForce: number = 10;
  public hitAngle: number = 0;

  public gameEnded: boolean = false;

  constructor(props: Props) {
    this.application = props.application;
    this.eventEmitter = props.eventEmitter;

    this.width = props.width;
    this.height = props.height;

    this.noOfCols = Math.floor(this.width / GameState.gridSize);
    this.noOfRows = Math.floor(this.height / GameState.gridSize);

    this.numberOfTrees = Math.floor(this.width / GameState.gridSize) + getRandomInt(7); // based on random experiments

    this.init();
  }

  private init() {
    Array(this.noOfCols)
      .fill(null)
      .forEach((_, x) => {
        Array(this.noOfRows)
          .fill(null)
          .forEach((_, y) => {
            this.mainMap[`${x}|${y}`] = 'G';
          });
      });

    console.log({ width: this.width, height: this.height });
    console.log({ noOfCols: this.noOfCols, noOfRows: this.noOfRows });

    this.addHole();
    this.addBall();

    this.addWater();
    this.addSand();
    this.addTrees();

    this.finalizeBallPosAndParScore();

    this.assignWaterAreas();
    this.assignSandAreas();
    this.assignTreeAreas();

    this.eventEmitter.addListener('scoreChanged', (arg: number) => {
      this.score += 1;
    });

    // console.log(this.mainMap);
    console.log({ par: this.parScore });
    this.eventEmitter.emit('parSet', this.parScore);
  }

  private addHole() {
    let x = Math.ceil(this.noOfCols / 2);
    let y = Math.ceil(this.noOfRows / 2);

    let iter = 0;

    while (iter < 1) {
      if (this.mainMap[`${x}|${y}`] === 'G') {
        this.mainMap[`${x}|${y}`] = 'H';
        iter += 1;
        break;
      }

      x = x + 1;
      y = y - 1;
    }

    this.holePositionX = x * 50 + 25;
    this.holePositionY = y * 50 + 25;
  }

  private addBall() {
    [
      [1, 1],
      [1, this.noOfRows - 1],
      [this.noOfCols - 1, 1],
      [this.noOfCols - 1, this.noOfRows - 1],
    ].map((arr) => {
      this.mainMap[`${arr[0]}|${arr[1]}`] = 'B';
    });
  }

  private addWater() {
    let iter = 0;

    while (iter < 6) {
      let x = getRandomInt(this.noOfCols);
      let y = getRandomInt(this.noOfRows);

      iter += 1;
      let iter2 = 0;

      while (iter2 < 10) {
        const randomx = getRandomInt(1000) % 5;
        const randomy = getRandomInt(1000) % 5;

        const map: Record<number, number> = {
          0: 0,
          1: 1,
          2: -1,
          4: 1,
          5: 0,
        };

        iter2 += 1;
        if (x < this.width && y < this.height && this.mainMap[`${x}|${y}`] === 'G') {
          this.mainMap[`${x}|${y}`] = 'W';
          // console.log(1);

          x = x + map[randomx] * 1;
          y = y + map[randomy] * 1;
        }
      }
    }
  }

  private addSand() {
    let iter = 0;

    while (iter < 6) {
      let x = getRandomInt(this.noOfCols);
      let y = getRandomInt(this.noOfRows);

      iter += 1;
      let iter2 = 0;

      while (iter2 < 20) {
        const randomx = getRandomInt(1000) % 5;
        const randomy = getRandomInt(1000) % 5;

        const map: Record<number, number> = {
          0: 0,
          1: 1,
          2: -1,
          4: 1,
          5: 0,
        };

        iter2 += 1;
        if (x < this.width && y < this.height && this.mainMap[`${x}|${y}`] === 'G') {
          this.mainMap[`${x}|${y}`] = 'S';
          // console.log(1);

          x = x + map[randomx] * 1;
          y = y + map[randomy] * 1;
        }
      }
    }
  }

  private addTrees() {
    let iter = 0;

    while (iter < this.numberOfTrees) {
      let x = getRandomInt(this.noOfCols);
      let y = getRandomInt(this.noOfRows);

      if (this.mainMap[`${x}|${y}`] === 'G') {
        this.mainMap[`${x}|${y}`] = 'T';
        iter += 1;
      }
    }
  }

  private finalizeBallPosAndParScore() {
    const holePos = Object.keys(this.mainMap).find((k: string) => this.mainMap[k] === 'H')!;
    const ballPos = Object.keys(this.mainMap).filter((k: string) => this.mainMap[k] === 'B');

    const hx = parseInt(holePos.split('|')[0]);
    const hy = parseInt(holePos.split('|')[1]);

    const obstacles: number[] = [];

    ballPos.forEach((k) => {
      const pathToHole = [];

      let x = parseInt(k.split('|')[0]);
      let y = parseInt(k.split('|')[1]);

      // console.log({ x, y });
      // console.log({ hx, hy });

      if (x < hx && y < hy) {
        while (x <= hx && y <= hy) {
          pathToHole.push(`${x}|${y}`);
          x += 1;
          y += 1;
        }
      }

      if (x < hx && y > hy) {
        while (x <= hx && y >= hy) {
          pathToHole.push(`${x}|${y}`);
          x += 1;
          y -= 1;
        }
      }

      if (x > hx && y < hy) {
        while (x >= hx && y <= hy) {
          pathToHole.push(`${x}|${y}`);
          x -= 1;
          y += 1;
        }
      }

      if (x > hx && y > hy) {
        while (x >= hx && y >= hy) {
          pathToHole.push(`${x}|${y}`);
          x -= 1;
          y -= 1;
        }
      }

      // console.log({ pathToHole });

      obstacles.push(pathToHole.map((pos) => this.mainMap[pos]).filter((val) => val !== 'G').length);
    });

    // console.log(obstacles);

    const max = Math.max(...obstacles);
    const finalPos = getRandomInt(4); // obstacles.findIndex((o) => o === max);

    ballPos.forEach((p, i) => {
      if (i !== finalPos) {
        this.mainMap[p] = 'G';
      }
    });

    if (max < 2) {
      this.parScore = 3;
    }

    if (max >= 2 && max <= 4) {
      this.parScore = 4;
    }

    if (max >= 5) {
      this.parScore = 5;
    }

    const pos = Object.keys(this.mainMap).find((k: string) => this.mainMap[k] === 'B');

    const x = parseInt(pos!.split('|')[0]);
    const y = parseInt(pos!.split('|')[1]);

    this.ballPositionX = x * 50 + 25;
    this.ballPositionY = y * 50 + 25;
  }

  private assignWaterAreas() {
    Object.keys(this.mainMap)
      .filter((k: string) => this.mainMap[k] === 'W')
      .forEach((k: string) => {
        const wx = parseInt(k.split('|')[0]);
        const wy = parseInt(k.split('|')[1]);

        this.waterAreas.push({ x: wx * 50, y: wy * 50, width: GameState.gridSize, height: GameState.gridSize });
      });
  }

  private assignSandAreas() {
    Object.keys(this.mainMap)
      .filter((k: string) => this.mainMap[k] === 'S')
      .forEach((k: string) => {
        const wx = parseInt(k.split('|')[0]);
        const wy = parseInt(k.split('|')[1]);

        this.sandAreas.push({ x: wx * 50, y: wy * 50, width: GameState.gridSize, height: GameState.gridSize });
      });
  }

  private assignTreeAreas() {
    Object.keys(this.mainMap)
      .filter((k: string) => this.mainMap[k] === 'T')
      .forEach((k: string) => {
        const wx = parseInt(k.split('|')[0]);
        const wy = parseInt(k.split('|')[1]);

        this.treeAreas.push({ x: wx * 50, y: wy * 50, width: GameState.gridSize, height: GameState.gridSize });
      });
  }

  public doCirclesIntersectSignificantly(circle1: GameCircle, circle2: GameCircle) {
    const { x: x1, y: y1, r: r1 } = circle1;
    const { x: x2, y: y2, r: r2 } = circle2;

    // console.log({ circle1: JSON.stringify(circle1), circle2: JSON.stringify(circle2) });

    const dist = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);

    if (dist <= Math.abs(r1 - r2)) {
      return true;
    }

    if (dist > r1 + r2) {
      return false;
    }

    // Calculate intersection area using the formula for two intersecting circles
    const a1 = Math.acos((r1 * r1 + dist * dist - r2 * r2) / (2 * r1 * dist));
    const a2 = Math.acos((r2 * r2 + dist * dist - r1 * r1) / (2 * r2 * dist));

    const intersectionArea =
      r1 * r1 * a1 +
      r2 * r2 * a2 -
      0.5 * Math.sqrt((-dist + r1 + r2) * (dist + r1 - r2) * (dist - r1 + r2) * (dist + r1 + r2));

    // Calculate areas of both circles
    const area1 = Math.PI * r1 * r1;
    const area2 = Math.PI * r2 * r2;

    return intersectionArea >= 0.49 * Math.min(area1, area2);
  }

  public isPointInArea(point: GamePoint, area: GameArea) {
    const { x: x1, y: y1 } = point;
    const { x, y, width, height } = area;

    const w = width ?? GameState.gridSize;
    const h = height ?? GameState.gridSize;

    // Check if point is within horizontal bounds
    const isWithinX = x1 >= x && x1 <= x + w;

    // Check if point is within vertical bounds
    const isWithinY = y1 >= y && y1 <= y + h;

    return isWithinX && isWithinY;
  }

  public addScoringEvent(event: string) {
    if (event === 'hit' || this.scoringEvents.length === 0) {
      this.scoringEvents.push({ [event]: Date.now() });
      this.eventEmitter.emit('scoreChanged');
      return;
    }

    if (event === 'sand') {
      const last = this.scoringEvents[this.scoringEvents.length - 1];

      if (Object.keys(last)[0] === 'sand') {
        const ts = Object.values(last)[0];
        if (Date.now() - ts > 5000) {
          this.scoringEvents.push({ [event]: Date.now() });
          this.eventEmitter.emit('scoreChanged');
        }
      } else {
        this.scoringEvents.push({ [event]: Date.now() });
        this.eventEmitter.emit('scoreChanged');
      }
      return;
    }

    if (event === 'water') {
      const last = this.scoringEvents[this.scoringEvents.length - 1];
      if (Object.keys(last)[0] === 'water') {
        const ts = Object.values(last)[0];
        if (Date.now() - ts > 5000) {
          this.scoringEvents.push({ [event]: Date.now() });
          this.eventEmitter.emit('scoreChanged');
        }
      } else {
        this.scoringEvents.push({ [event]: Date.now() });
        this.eventEmitter.emit('scoreChanged');
      }
      return;
    }
  }
}
