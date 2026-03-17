export class MotionSimulator {
  private x: number;
  private y: number;
  private vx: number;
  private vy: number;
  private dampingCoefficient: number = 0.94;
  private readonly restitutionCoefficient: number = 0.86;

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
  }

  applyForce(force: number, angle: number, multiplier: number = 2.7) {
    const angleRad = (angle * Math.PI) / 180;
    this.vx = force * Math.cos(angleRad) * multiplier;
    this.vy = force * Math.sin(angleRad) * multiplier;
  }

  update(_angle: number) {
    this.x += this.vx * this.dt;
    this.y += this.vy * this.dt;

    this.vx *= this.dampingCoefficient;
    this.vy *= this.dampingCoefficient;

    // Stop motion if it's below threshold
    if (Math.abs(this.vx) < this.minThreshold) this.vx = 0;
    if (Math.abs(this.vy) < this.minThreshold) this.vy = 0;

    return {
      x: this.x,
      y: this.y,
      vx: this.vx,
      vy: this.vy,
    };
  }

  public reflectX() {
    this.vx *= -this.restitutionCoefficient;
  }

  public reflectY() {
    this.vy *= -this.restitutionCoefficient;
  }

  public getHeading() {
    return (Math.atan2(this.vy, this.vx) * 180) / Math.PI;
  }

  public deflect(degrees: number) {
    const rad = (degrees * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const newVx = this.vx * cos - this.vy * sin;
    const newVy = this.vx * sin + this.vy * cos;
    this.vx = newVx;
    this.vy = newVy;
  }

  public setPosition(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}
