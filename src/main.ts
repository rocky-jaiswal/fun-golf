import { EventEmitter } from 'pixi.js';
import A11yDialog from 'a11y-dialog';

import './css/style.css';
import { createApp } from './app';

const setupScoreboard = (eventEmitter: EventEmitter) => {
  let par = 3;
  let score = 0;

  const parContainer = document.getElementById('par-score');
  const scoreContainer = document.getElementById('player-score');

  parContainer!.innerHTML = `${par}`;
  scoreContainer!.innerHTML = `${score}`;

  eventEmitter.addListener('parSet', (arg: number) => {
    par = arg;
    parContainer!.innerHTML = `${par}`;
  });

  eventEmitter.addListener('scoreChanged', () => {
    score += 1;
    scoreContainer!.innerHTML = `${score}`;
  });
};

const startApp = async () => {
  const dialogEl = document.getElementById('my-dialog');
  new A11yDialog(dialogEl!);

  const elem = document.querySelector<HTMLDivElement>('#app');

  if (!elem) {
    throw new Error('#app must be provided!');
  }

  const eventEmitter = new EventEmitter();

  document.getElementById('reset-game-btn')?.addEventListener('click', () => {
    // eventEmitter.emit('resetGame');
    window.location.reload();
  });

  setupScoreboard(eventEmitter);

  const app = await createApp(elem, eventEmitter);

  elem.appendChild(app.canvas);
};

// it all starts here
document.addEventListener('DOMContentLoaded', (_event: unknown) => {
  startApp()
    .then(() => console.log('app started'))
    .catch((err) => console.error(err));
});

// Register service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('SW registered:', registration);
      })
      .catch((error) => {
        console.log('SW registration failed:', error);
      });
  });
}
