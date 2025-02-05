export class MotionSimulator {
  private x: number;
  private y: number;
  private vx: number;
  private vy: number;
  private ax: number;
  private ay: number;
  private angle: number;
  private dampingCoefficient: number = 0.94;

  // Constants
  private readonly minThreshold: number = 0.9;
  private readonly dt: number = 0.08;

  constructor(initialX: number, initialY: number) {
    // Position
    this.x = initialX;
    this.y = initialY;

    // Velocity
    this.vx = 0;
    this.vy = 0;

    // Acceleration
    this.ax = 0;
    this.ay = 0;

    // Angle
    this.angle = 0;
  }

  applyForce(force: number, angle: number) {
    this.ax = force;
    this.ay = force;

    this.angle = angle;
  }

  update(angle: number) {
    // console.log({ ax: this.ax, ay: this.ay });
    const angleRad = (angle * Math.PI) / 180;
    const velocityX = this.ax * Math.cos(angleRad) * 2.7; // we multiply velocity for better UX
    const velocityY = this.ay * Math.sin(angleRad) * 2.7;

    this.vx = velocityX + this.ax * this.dt;
    this.vy = velocityY + this.ay * this.dt;

    this.ax *= this.dampingCoefficient;
    this.ay *= this.dampingCoefficient;

    // console.log({ newax: this.ax, neway: this.ay });

    this.x += this.vx * this.dt;
    this.y += this.vy * this.dt;

    // console.log({ x: this.x, y: this.y });
    // console.log({ newv: this.vx, newvy: this.vy });

    // Stop motion if it's below threshold
    if (Math.abs(this.vx) < this.minThreshold || this.ax < this.minThreshold) this.vx = 0;
    if (Math.abs(this.vy) < this.minThreshold || this.ax < this.minThreshold) this.vy = 0;

    return {
      x: this.x,
      y: this.y,
      vx: this.vx,
      vy: this.vy,
    };
  }
}
