import { Howl } from 'howler';
import { EventEmitter } from 'pixi.js';

import hitSound  from './assets/sounds/hit.mp3';
import holeSound from './assets/sounds/hole.mp3';

const STORAGE_KEY = 'fg_soundEnabled';

export class SoundManager {
  private hitSound:  Howl;
  private holeSound: Howl;
  private enabled: boolean = true;

  constructor(eventEmitter: EventEmitter) {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'false') this.enabled = false;

    this.hitSound  = new Howl({ src: [hitSound],  volume: 0.7, preload: true });
    this.holeSound = new Howl({ src: [holeSound], volume: 0.9, preload: true });

    eventEmitter.on('hit',         () => { if (this.enabled) this.hitSound.play();  });
    eventEmitter.on('inHole',      () => { if (this.enabled) this.holeSound.play(); });
    eventEmitter.on('soundToggle', (enabled: boolean) => { this.enabled = enabled; });
  }

  public setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public destroy() {
    this.hitSound.unload();
    this.holeSound.unload();
  }
}
