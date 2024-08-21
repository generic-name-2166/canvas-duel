const MOUSE_RADIUS = 5;
const PROJECTILE_VELOCITY = 5;
const PROJECTILE_RADIUS = 3;
const MAX_PROJECTILES = 1000;

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

export class BoardManager {
  private hero1: Hero;
  private projectiles1: Projectile[] = [];
  private hero2: Hero;
  private projectiles2: Projectile[] = [];

  constructor(
    private ctx: CanvasRenderingContext2D,
    width: number,
  ) {
    // Saving clean canvas to reset to on every tick
    this.ctx.save();
    this.hero1 = new Hero(50, 20, 10, 100, 2, true);
    this.hero2 = new Hero(width - 50, 20, 10, 100, 2, false);
  }

  tick(
    time: DOMHighResTimeStamp,
    width: number,
    height: number,
    mouseX: number,
    mouseY: number,
  ): void {
    const proj1 = this.hero1.tick(time, mouseX, mouseY, height);
    if (this.projectiles1.length >= MAX_PROJECTILES) {
      this.projectiles1.shift();
    }
    if (proj1 !== null) {
      this.projectiles1.push(proj1);
    }

    const proj2 = this.hero2.tick(time, mouseX, mouseY, height);
    if (this.projectiles2.length >= MAX_PROJECTILES) {
      this.projectiles2.shift();
    }
    if (proj2 !== null) {
      this.projectiles2.push(proj2);
    }

    // side effects in filter :(
    this.projectiles1 = this.projectiles1.filter(
      (proj) =>
        !proj.tick(this.hero2.x, this.hero2.y, this.hero2.radius, width),
    );
    this.projectiles2 = this.projectiles2.filter(
      (proj) =>
        !proj.tick(this.hero1.x, this.hero1.y, this.hero1.radius, width),
    );
  }

  draw(): void {
    this.ctx.restore();

    this.hero1.draw(this.ctx);
    this.hero2.draw(this.ctx);

    for (const proj of this.projectiles1) {
      proj.draw(this.ctx);
    }
    for (const proj of this.projectiles2) {
      proj.draw(this.ctx);
    }
  }
}

class Projectile {
  constructor(
    private x: number,
    private readonly y: number,
    private readonly velocity: number,
    private readonly radius: number,
  ) {}

  /**
   * @returns whether projectile has been destroyed on this tick
   */
  tick(
    heroX: number,
    heroY: number,
    heroRadius: number,
    width: number,
  ): boolean {
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

class Hero {
  /* milliseconds since last shot */
  private lastShot: DOMHighResTimeStamp = 0;

  constructor(
    public x: number,
    public y: number,
    public readonly radius: number,
    /**
     * hero shoots every `firerate` microseconds
     * the lower, the faster hero shoots
     */
    private firerate: number,
    private velocity: number,
    /** whether the hero is facing right */
    private readonly direction: boolean,
  ) {}

  /**
   * @returns a new projectile if it fires one, otherwise null
   */
  tick(
    time: DOMHighResTimeStamp,
    mouseX: number,
    mouseY: number,
    height: number,
  ): Projectile | null {
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

    if (time - this.lastShot >= this.firerate) {
      const projVelocity = this.direction
        ? PROJECTILE_VELOCITY
        : -PROJECTILE_VELOCITY;
      this.lastShot = time;
      return new Projectile(this.x, this.y, projVelocity, PROJECTILE_RADIUS);
    }

    return null;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.beginPath();
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 3;
    ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    ctx.stroke();
  }
}
