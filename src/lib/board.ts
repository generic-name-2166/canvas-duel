const HERO_RADIUS = 15;
const MOUSE_RADIUS = 5;
const PROJECTILE_VELOCITY = 5;
const PROJECTILE_RADIUS = 5;
const MAX_PROJECTILES = 1000;
const SCORE_OFFSET = 60;
export const COLOUR = "#ddd";

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

const enum ProjectileResult {
  None,
  Hit,
  Miss,
}

class Projectile {
  constructor(
    private x: number,
    private readonly y: number,
    private readonly velocity: number,
    private readonly radius: number,
  ) {}

  tick(
    heroX: number,
    heroY: number,
    heroRadius: number,
    width: number,
  ): ProjectileResult {
    const maybe = this.x + this.velocity;
    if (
      detectCollision(this.x, this.y, heroX, heroY, this.radius, heroRadius)
    ) {
      // hero takes damage
      return ProjectileResult.Hit;
    } else if (maybe + this.radius >= width || maybe - this.radius <= 0) {
      // Projectile reached the board boundary
      return ProjectileResult.Miss;
    }
    this.x = maybe;
    return ProjectileResult.None;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.beginPath();
    ctx.fillStyle = COLOUR;
    ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    ctx.fill();
  }
}

class Hero {
  /** milliseconds since last shot */
  private lastShot: DOMHighResTimeStamp = 0;
  /** number of times hero hit the target */
  public hits: number = 0;
  /** whether the hero is moving upwards */
  private up: boolean = false;

  constructor(
    public x: number,
    public y: number,
    public readonly radius: number,
    /** whether the hero is facing right */
    private readonly direction: boolean,
  ) {}

  /**
   * @returns a new projectile if it fires one, otherwise null
   */
  tick(
    time: DOMHighResTimeStamp,
    firerate: number,
    velocity: number,
    mouseX: number,
    mouseY: number,
    height: number,
    paused: boolean,
  ): Projectile | null {
    if (paused) {
      return null;
    }

    if (this.up) {
      if (
        this.y - velocity - this.radius <= 0 ||
        detectCollision(
          this.x,
          this.y,
          mouseX,
          mouseY,
          this.radius,
          MOUSE_RADIUS,
        )
      ) {
        // hit upper boundary or the mouse cursor
        this.up = false;
        this.y = this.y + velocity;
      } else {
        this.y = this.y - velocity;
      }
    } else {
      if (
        this.y + velocity + this.radius >= height ||
        detectCollision(
          this.x,
          this.y,
          mouseX,
          mouseY,
          this.radius,
          MOUSE_RADIUS,
        )
      ) {
        // hit lower boundary or the mnouse cursor
        this.up = true;
        this.y = this.y - velocity;
      } else {
        this.y = this.y + velocity;
      }
    }

    if (time - this.lastShot >= firerate) {
      const projVelocity = this.direction
        ? PROJECTILE_VELOCITY
        : -PROJECTILE_VELOCITY;
      this.lastShot = time;
      return new Projectile(this.x, this.y, projVelocity, PROJECTILE_RADIUS);
    }

    return null;
  }

  draw(ctx: CanvasRenderingContext2D, colour: string): void {
    ctx.beginPath();
    ctx.fillStyle = colour;
    ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    ctx.fill();

    const score = `${this.hits} hits`;
    ctx.font = "48px Helvetica";
    if (this.direction) {
      ctx.fillText(score, this.x + SCORE_OFFSET, SCORE_OFFSET);
      return;
    }
    const offset = ctx.measureText(score).width;
    ctx.fillText(score, this.x - offset - SCORE_OFFSET, SCORE_OFFSET);
  }
}

export const enum Paused {
  None,
  Hero1,
  Hero2,
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
    this.hero1 = new Hero(50, 20, HERO_RADIUS, true);
    this.hero2 = new Hero(width - 50, 20, HERO_RADIUS, false);
  }

  tick(
    time: DOMHighResTimeStamp,
    width: number,
    height: number,
    mouseX: number,
    mouseY: number,
    hero1firerate: number,
    hero1velocity: number,
    hero2firerate: number,
    hero2velocity: number,
    paused: Paused,
  ): void {
    this.hero2.x = width - 50;

    const proj1 = this.hero1.tick(
      time,
      hero1firerate,
      hero1velocity,
      mouseX,
      mouseY,
      height,
      paused === Paused.Hero1,
    );
    if (this.projectiles1.length >= MAX_PROJECTILES) {
      this.projectiles1.shift();
    }
    if (proj1 !== null) {
      this.projectiles1.push(proj1);
    }

    const proj2 = this.hero2.tick(
      time,
      hero2firerate,
      hero2velocity,
      mouseX,
      mouseY,
      height,
      paused === Paused.Hero2,
    );
    if (this.projectiles2.length >= MAX_PROJECTILES) {
      this.projectiles2.shift();
    }
    if (proj2 !== null) {
      this.projectiles2.push(proj2);
    }

    // side effects in filter :(
    this.projectiles1 = this.projectiles1.filter((proj) => {
      const result = proj.tick(
        this.hero2.x,
        this.hero2.y,
        this.hero2.radius,
        width,
      );
      switch (result) {
        case ProjectileResult.None:
          return true;
        case ProjectileResult.Hit:
          this.hero1.hits += 1;
          return false;
        case ProjectileResult.Miss:
          return false;
      }
    });
    this.projectiles2 = this.projectiles2.filter((proj) => {
      const result = proj.tick(
        this.hero1.x,
        this.hero1.y,
        this.hero1.radius,
        width,
      );
      switch (result) {
        case ProjectileResult.None:
          return true;
        case ProjectileResult.Hit:
          this.hero2.hits += 1;
          return false;
        case ProjectileResult.Miss:
          return false;
      }
    });
  }

  draw(hero1colour: string, hero2colour: string): void {
    this.ctx.restore();

    this.hero1.draw(this.ctx, hero1colour);
    this.hero2.draw(this.ctx, hero2colour);

    for (const proj of this.projectiles1) {
      proj.draw(this.ctx);
    }
    for (const proj of this.projectiles2) {
      proj.draw(this.ctx);
    }
  }

  pauseHero(mouseX: number, mouseY: number): Paused {
    if (detectCollision(this.hero1.x, this.hero1.y, mouseX, mouseY, this.hero1.radius, 0)) {
      return Paused.Hero1;
    } else if (detectCollision(this.hero2.x, this.hero2.y, mouseX, mouseY, this.hero2.radius, 0)) {
      return Paused.Hero2;
    }
    return Paused.None;
  }
}
