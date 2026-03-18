# Claude

## Game

A browser-based mini golf game built with Pixi.js. Player aims and hits a ball across a procedurally generated course, avoiding hazards and getting the ball into the hole in as few strokes as possible.

## Tech

- **Pixi.js v8** — rendering engine, all game visuals are Pixi (no React, no DOM UI)
- **Vite** — build / dev tooling
- **Howler.js** — sound effects
- **GSAP** — scene transition fade animations
- **TypeScript** throughout

## Core Gameplay

- **Aiming** — a direction wheel in the control panel spins automatically; click HIT once to lock the aim angle
- **Power** — an oscillating bar (green → yellow → red gradient) shows power; click HIT again to fire. Speed varies slightly each shot for unpredictability
- **Physics** — `MotionSimulator` applies force + angle, updates velocity each frame with damping (0.94 per frame); force is screen-size scaled so full power travels ~1/3 of the smaller screen dimension
- **Hazards** — water and sand stop the ball and reset its position (+1 stroke penalty); trees deflect the velocity vector by 60° (true rotation, not just angle change); walls bounce the ball
- **Scoring** — par (3/4/5) is calculated from obstacle count between the random start position and the hole

## Architecture

### Entry point
`main.ts` → `app.ts` → creates Pixi `Application` (full-screen via `resizeTo: window`), creates a fresh `EventEmitter` + `GameState` + `Game` on every reset.

### Key modules

| File | Purpose |
|------|---------|
| `gameState.ts` | Central state: grid map, ball position/velocity, hazard areas, par/score, `forceMultiplier`, geometry helpers |
| `game.ts` | Top-level controller: loads assets, sets up sounds, owns `SceneManager`, adds HUD elements to stage, `destroy()` cleans up ticker |
| `mainGameScene.ts` | Primary gameplay scene: renders course, runs hazard/hole/edge/tree detection each frame |
| `resultScene.ts` | End-game scene: floating emojis full-screen, centred Game Over panel, Play Again button |
| `scoreHud.ts` | Pixi HUD (top-right): Par, Score, ↺ restart button, ? help button — always on top of stage |
| `helpOverlay.ts` | Pixi instructions panel toggled by ? button; dim overlay blocks clicks through to game |
| `golfControl.ts` | Bottom-corner control panel: direction wheel + oscillating power gauge + golf-ball HIT button; placed in the corner opposite the ball spawn; emits `shotFired` event |
| `sceneManager.ts` | GSAP fade transition between `game` and `result` scenes |
| `motionSimulator.ts` | Pure physics class — no Pixi dependency; `applyForce(force, angle, multiplier)`, `update()`, `deflect(degrees)` for true velocity rotation |
| `ball.ts` + `ballHelper.ts` | Ball sprite + yellow highlight circle; listens for `shotFired` event and delegates physics to `MotionSimulator` |
| `ballTrail.ts` | Fading white-dot trail drawn behind the ball while it is in motion |
| `rotatingLine.ts` | Direction indicator line drawn from ball center; color-coded by `hitForce`; hidden while ball is in motion |
| `clouds.ts` | Slowly drifting cloud sprites; count scales with screen size (1 mobile → 3 desktop) |
| `wind.ts` | Animated sine-wave wind streaks; count scales with screen size; redrawn each frame with phase offset |
| `grassBackground.ts` | Procedural grass texture: 12px tiles, 3-stop simplex-noise gradient (dark forest → fairway → olive) at very low frequency (0.001) |
| `vignette.ts` | One-shot canvas radial-gradient overlay (transparent centre → dark edges) added above terrain, below ball |
| `hole.ts` / `sand.ts` / `tree.ts` | Static course element renderers; sand uses per-cell noise for colour variation |
| `water.ts` | Animated water: redraws each frame with simplex noise + elapsed time for a shimmer effect |

### Grid map system
`GameState.mainMap` is a `Record<string, string>` keyed by `"col|row"`.
Cell values: `'G'` grass, `'H'` hole, `'B'` ball start, `'W'` water, `'S'` sand, `'T'` tree.
Grid size = 50px. Course is procedurally generated fresh on every game start.

### Control system
`GolfControl` is a 2-click panel added directly to the stage (above the scene, below ScoreHud):
1. **Click 1** — locks the direction wheel angle → sets `gameState.hitAngle`
2. **Click 2** — locks the power gauge → emits `shotFired` → `BallHelper.fire()` creates the `MotionSimulator` and launches the ball

Panel is placed in the bottom corner **opposite** the ball spawn (ball on right → panel on left, and vice versa). Vertical lift only applied when ball spawns in the bottom-right corner.

### Force scaling
`gameState.forceMultiplier = Math.min(width, height) / 400`
At full power (100), ball travels `~min(width, height) / 3` pixels. Derivation: `dist ≈ force × multiplier × dt / (1 − damping)`.

### Reset flow
`onReset` callback flows: `app.ts (startGame)` → `Game` constructor → `ScoreHud` + `ResultScene`.
On reset: `currentGame.destroy()` (removes ticker listener) → `stage.removeChildren()` → fresh `EventEmitter` + `GameState` + `Game`.
No `window.location.reload()` — everything resets in-place.

### Event system
Pixi `EventEmitter` is used for cross-module communication:

| Event | Emitted by | Consumed by |
|-------|-----------|------------|
| `parSet` | `gameState.ts` (init) | `scoreHud.ts` |
| `scoreChanged` | `gameState.ts` | `scoreHud.ts` |
| `hit` | `gameState.addScoringEvent` | `game.ts` (hit sound) |
| `inHole` | `mainGameScene.ts` | `game.ts` (hole sound) |
| `shotFired` | `golfControl.ts` | `ballHelper.ts` |

### Scene z-order (within MainGameScene)
`GrassBackground` → `Hole` → `Water` → `Sand` → `Trees` → `Vignette` → `BallTrail` → `BallHelper` → `BallSprite` → `RotatingLine`

### Stage z-order
`[game/result scene]` → `[Clouds]` → `[Wind]` → `[GolfControl]` → `[ScoreHud]` → `[HelpOverlay (when open)]`
All HUD elements are re-raised inside `raiseHud()` after each scene switch to maintain correct z-order.

### simplex-noise usage
- `grassBackground.ts` — static, sampled once at init; frequency `0.001`, 12 px tiles, 3-stop colour gradient
- `water.ts` — dynamic, resampled every frame with `elapsed * 0.5` time offset for shimmer
- `sand.ts` — static, one sample per cell at `0.025` frequency for colour variation
