import { Container, EventBoundary, FederatedPointerEvent, Graphics, Text, TextStyle } from 'pixi.js';

interface Props {
  width: number;
  height: number;
  text: string;
  textColor: string;
  backgroundColor: string;
  hoverColor: string;
  pressedColor: string;
  borderRadius: number;
}

export class Button extends Container {
  public readonly backgroundColor: string | number;
  public readonly hoverColor: string | number;
  public readonly pressedColor: string | number;
  public readonly borderRadius: number;

  public isPressed: boolean;
  public isHovered: boolean;
  public isEnabled: boolean;

  constructor(options: Props) {
    super();

    const {
      width = 200,
      height = 50,
      text = 'Button',
      textColor = 0xffffff,
      backgroundColor = 0x6495ed,
      hoverColor = 0x4169e1,
      pressedColor = 0x191970,
      borderRadius = 10,
    } = options;

    // Store colors and dimensions
    this.width = width;
    this.height = height;
    this.backgroundColor = backgroundColor;
    this.hoverColor = hoverColor;
    this.pressedColor = pressedColor;
    this.borderRadius = borderRadius;

    // State tracking
    this.isPressed = false;
    this.isHovered = false;
    this.isEnabled = true;

    // Enable interactivity
    this.eventMode = 'static';
    this.cursor = 'pointer';

    // Set up event listeners
    this.setupEvents();

    // Draw initial state
    this.draw();
  }

  setupEvents() {
    this.on('pointerdown', this.onPress.bind(this))
      .on('pointerup', this.onRelease.bind(this))
      .on('pointerupoutside', this.onRelease.bind(this))
      .on('pointerover', this.onHover.bind(this))
      .on('pointerout', this.onLeave.bind(this));
  }

  draw() {
    let color = this.backgroundColor;

    if (!this.isEnabled) {
      color = 0x666666; // Disabled state
    } else if (this.isPressed) {
      color = this.pressedColor;
    } else if (this.isHovered) {
      color = this.hoverColor;
    }

    const graphics = new Graphics();

    // Clear previous drawing
    graphics.clear();

    const style = new TextStyle({
      fontFamily: 'Arial',
      fontSize: 24,
      stroke: { color: '#4a1850', width: 1, join: 'round' },
    });

    const buttonText = new Text({ text: 'Button', style });
    buttonText.x = 100;
    buttonText.y = 100;

    // Draw rounded rectangle background
    graphics.roundRect(100, 100, 100, 100, this.borderRadius);
    graphics.fill('#ffffff');

    this.addChild(graphics);
    this.addChild(buttonText);
  }

  onPress() {
    if (!this.isEnabled) return;
    this.isPressed = true;
    this.draw();
  }

  onRelease() {
    if (!this.isEnabled) return;
    this.isPressed = false;
    this.draw();

    // Only emit click if we're still hovering
    if (this.isHovered) {
      this.emit('click', new FederatedPointerEvent(new EventBoundary()));
    }
  }

  onHover() {
    if (!this.isEnabled) return;
    this.isHovered = true;
    this.draw();
  }

  onLeave() {
    if (!this.isEnabled) return;
    this.isHovered = false;
    this.draw();
  }

  setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    this.eventMode = enabled ? 'static' : 'none';
    this.cursor = enabled ? 'pointer' : 'default';
    this.draw();
  }
}
