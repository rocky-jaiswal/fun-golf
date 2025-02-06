import { Application, EventEmitter } from 'pixi.js';

import { Game } from './game';
import { GameState } from './gameState';

export const createApp = async (elem: HTMLDivElement, eventEmitter: EventEmitter) => {
  const width = elem.getBoundingClientRect().width;
  const height = elem.getBoundingClientRect().height;

  // Create a PixiJS application.
  const application = new Application();

  // Intialize the application.
  await application.init({
    background: '#4d8c57',
    antialias: true,
    width,
    height,
  });

  const startGame = async () => {
    // Create game & state
    const gameState = new GameState({ application, width, height, eventEmitter });
    const game = new Game(gameState);
    await game.init();
  };

  eventEmitter.addListener('resetGame', async () => startGame());

  // start game now
  eventEmitter.emit('resetGame');

  return application;
};
