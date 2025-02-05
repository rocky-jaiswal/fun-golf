import A11yDialog from 'a11y-dialog';

import './css/style.css';

import { createApp } from './app';
import { EventEmitter } from 'pixi.js';

const startApp = async () => {
  const dialogEl = document.getElementById('my-dialog');
  new A11yDialog(dialogEl!);

  const elem = document.querySelector<HTMLDivElement>('#app');

  if (!elem) {
    throw new Error('#app must be provided!');
  }

  let par = 3;
  let score = 0;

  const parContainer = document.getElementById('par-score');
  const scoreContainer = document.getElementById('player-score');

  parContainer!.innerHTML = `Par: ${par}`;
  scoreContainer!.innerHTML = `Score: ${score}`;

  const eventEmitter = new EventEmitter();

  eventEmitter.addListener('parSet', (arg: number) => {
    par = arg;
    parContainer!.innerHTML = `Par: ${par}`;
  });

  eventEmitter.addListener('scoreChanged', () => {
    score += 1;
    scoreContainer!.innerHTML = `Score: ${score}`;
  });

  const app = await createApp(elem, eventEmitter);

  elem.appendChild(app.canvas);
};

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
