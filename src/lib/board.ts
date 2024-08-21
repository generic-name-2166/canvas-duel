const MOUSE_RADIUS = 5;
const PROJECTILE_VELOCITY = 5;
const PROJECTILE_RADIUS = 3;

function detectCollision(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  radius1: number,
  radius2: number,
): boolean {
  return radius1 + radius2 >= Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

export class Projectile {
  constructor(
    private x: number,
    private readonly y: number,
    private readonly velocity: number,
    private readonly radius: number,
  ) {}

  /**
   * @returns whether projectile has been destroyed on this tick
   */
  tick(heroX: number, heroY: number, heroRadius: number, width: number): boolean {
    const maybe = this.x + this.velocity;
    if (
      detectCollision(this.x, this.y, heroX, heroY, this.radius, heroRadius)
    ) {
      // hero takes damage
      return true;
    } else if (maybe + this.radius >= width || maybe - this.radius <= 0) {
      // Projectile reached the board boundary
      return true;
    }
    this.x = maybe;
    return false;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.beginPath();
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 3;
    ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    ctx.stroke();
  }
}

export class Hero {
  private cooldown: number = 0;

  constructor(
    public readonly x: number,
    public y: number,
    public readonly radius: number,
    /** the lower, the faster hero shoots */
    private firerate: number,
    private velocity: number,
    /** whether the hero is facing right */
    private readonly direction: boolean,
  ) {}

  /**
   * @returns a new projectile if it fires one, otherwise null
   */
  tick(mouseX: number, mouseY: number, width: number, height: number): Projectile | null {
    const maybe = this.y + this.velocity;
    if (
      maybe + this.radius >= height ||
      maybe - this.radius <= 0 ||
      detectCollision(this.x, this.y, mouseX, mouseY, this.radius, MOUSE_RADIUS)
    ) {
      // Change direction on boundary
      // or on mouse collision
      this.velocity = -this.velocity;
    }

    this.y = this.y + this.velocity;

    if (this.cooldown >= this.firerate) {
      this.cooldown = 0;
      const projVelocity = this.direction
        ? PROJECTILE_VELOCITY
        : -PROJECTILE_VELOCITY;
      return new Projectile(
        this.x,
        this.y,
        projVelocity,
        PROJECTILE_RADIUS,
      );
    } else {
      this.cooldown += 1;
      return null;
    }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.beginPath();
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 3;
    ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    ctx.stroke();
  }
}
