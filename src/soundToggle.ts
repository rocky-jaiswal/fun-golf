import { Container, Graphics, Text } from 'pixi.js';

import { GameState } from './gameState';

const STORAGE_KEY = 'fg_soundEnabled';

// Match ScoreHud layout constants so toggle sits snugly to its left
const HUD_W_MAX = 360;
const HUD_W_MIN = 140;
const PAD = 16;

export class SoundToggle {
  public readonly container: Container;
  private bg: Graphics;
  private label: Text;
  private enabled: boolean;

  private readonly size    = 32;
  private readonly padding = PAD;

  constructor(gameState: GameState) {
    this.container = new Container();

    // Restore saved preference (default: on)
    this.enabled = localStorage.getItem(STORAGE_KEY) !== 'false';

    // Notify SoundManager of the initial state immediately
    gameState.eventEmitter.emit('soundToggle', this.enabled);

    this.bg = new Graphics();
    this.drawBackground();

    this.label = new Text({
      text: this.enabled ? '🔊' : '🔇',
      style: { fontSize: 16 },
    });
    this.label.anchor.set(0.5);
    this.label.x = this.size / 2;
    this.label.y = this.size / 2;

    // Position just to the left of the ScoreHud
    const hudW = Math.max(HUD_W_MIN, Math.min(HUD_W_MAX, gameState.width - PAD * 2));
    const hudX = Math.max(0, gameState.width - hudW - this.padding);
    this.container.x = hudX - this.size - 8;
    this.container.y = this.padding;

    this.container.eventMode = 'static';
    this.container.cursor = 'pointer';
    this.container.on('pointerdown', () => {
      this.enabled = !this.enabled;
      this.label.text = this.enabled ? '🔊' : '🔇';
      this.drawBackground();
      localStorage.setItem(STORAGE_KEY, String(this.enabled));
      gameState.eventEmitter.emit('soundToggle', this.enabled);
    });

    this.container.addChild(this.bg);
    this.container.addChild(this.label);
  }

  private drawBackground() {
    this.bg.clear();
    this.bg.roundRect(0, 0, this.size, this.size, 6);
    this.bg.fill({ color: 0x1a1a2e, alpha: 0.85 });
    this.bg.stroke({ color: 0x333355, width: 1.5, alpha: 0.8 });
  }

  public destroy() {
    this.container.destroy({ children: true });
  }
}
