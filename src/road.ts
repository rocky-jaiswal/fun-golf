import { Graphics } from 'pixi.js';

import { MainGameScene } from './mainGameScene';
import { GameState } from './gameState';
import { getRandomInt } from './util';

type Point = { x: number; y: number };
type Edge = 'top' | 'right' | 'bottom' | 'left';

// Each pair is adjacent; the corner object is the screen corner they curve toward
const ADJACENT_PAIRS: { edges: [Edge, Edge]; corner: [number, number] }[] = [
  { edges: ['top', 'right'],    corner: [0.8, 0.2] },
  { edges: ['right', 'bottom'], corner: [0.8, 0.8] },
  { edges: ['bottom', 'left'],  corner: [0.2, 0.8] },
  { edges: ['left', 'top'],     corner: [0.2, 0.2] },
];

const ROAD_WIDTH = 25;
const ROAD_COLOR = 0xc5ab5e;
const EDGE_COLOR  = 0xe8cb74;
const DASH_COLOR  = 0xc8ad72;

export class Road {
  public static add(scene: MainGameScene, gameState: GameState) {
    const { width, height } = gameState;

    const { edges, corner } = ADJACENT_PAIRS[getRandomInt(4)];
    const [edgeA, edgeB] = edges;

    const pointOnEdge = (edge: Edge): Point => {
      const mid = 0.3 + Math.random() * 0.4; // keep entry points away from corners
      switch (edge) {
        case 'top':    return { x: width  * mid, y: 0 };
        case 'bottom': return { x: width  * mid, y: height };
        case 'left':   return { x: 0,            y: height * mid };
        case 'right':  return { x: width,         y: height * mid };
      }
    };

    const p0 = pointOnEdge(edgeA);
    const p2 = pointOnEdge(edgeB);

    // Control point near the shared corner, nudged randomly for variety
    const cp: Point = {
      x: width  * corner[0] + (getRandomInt(60) - 30),
      y: height * corner[1] + (getRandomInt(60) - 30),
    };

    const bezier = (t: number): Point => ({
      x: (1 - t) * (1 - t) * p0.x + 2 * (1 - t) * t * cp.x + t * t * p2.x,
      y: (1 - t) * (1 - t) * p0.y + 2 * (1 - t) * t * cp.y + t * t * p2.y,
    });

    // Road body
    const road = new Graphics();
    road.moveTo(p0.x, p0.y);
    road.quadraticCurveTo(cp.x, cp.y, p2.x, p2.y);
    road.stroke({ color: ROAD_COLOR, width: ROAD_WIDTH });
    scene.addChild(road);

    // Slightly lighter road surface (inner lane)
    const surface = new Graphics();
    surface.moveTo(p0.x, p0.y);
    surface.quadraticCurveTo(cp.x, cp.y, p2.x, p2.y);
    surface.stroke({ color: EDGE_COLOR, width: ROAD_WIDTH - 5 });
    scene.addChild(surface);

    // Dashed centre line sampled along the bezier
    const STEPS = 60;
    const dashes = new Graphics();
    for (let i = 0; i <= STEPS; i++) {
      const t = i / STEPS;
      if (Math.floor(t * 18) % 2 === 0) {
        const pt = bezier(t);
        dashes.circle(pt.x, pt.y, 1.2);
      }
    }
    dashes.fill(DASH_COLOR);
    scene.addChild(dashes);
  }
}
