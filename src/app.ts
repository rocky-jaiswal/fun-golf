import { Application, EventEmitter } from 'pixi.js';

import { Game } from './game';
import { GameState } from './gameState';

export const createApp = async () => {
  const application = new Application();

  await application.init({
    background: '#4d8c57',
    antialias: true,
    resizeTo: window,
  });

  document.getElementById('app')!.appendChild(application.canvas);

  let currentGame: Game | null = null;
  let isStarting = false;
  let pendingRestart = false;
  let resizeTimer: ReturnType<typeof setTimeout> | null = null;

  const startGame = async () => {
    if (isStarting) {
      pendingRestart = true;
      return;
    }

    isStarting = true;

    try {
      if (currentGame) {
        currentGame.destroy();
      }
      application.stage.removeChildren();

      const width = window.innerWidth;
      const height = window.innerHeight;
      const eventEmitter = new EventEmitter();

      const gameState = new GameState({ application, width, height, eventEmitter });
      currentGame = new Game(gameState, startGame);
      await currentGame.init();
    } finally {
      isStarting = false;
      if (pendingRestart) {
        pendingRestart = false;
        void startGame();
      }
    }
  };

  const scheduleRestart = () => {
    if (resizeTimer) {
      window.clearTimeout(resizeTimer);
    }

    resizeTimer = window.setTimeout(() => {
      void startGame();
      resizeTimer = null;
    }, 160);
  };

  window.addEventListener('resize', scheduleRestart, { passive: true });

  await startGame();
};
