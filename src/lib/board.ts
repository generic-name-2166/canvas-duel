function detectCollision(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  radius: number,
): boolean {
  return radius >= Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

export class Hero {
  constructor(
    private readonly x: number,
    private y: number,
    private readonly radius: number,
    private velocity: number,
    private readonly height: number,
    // whether the hero is facing right
    private readonly direction: boolean,
  ) {}

  tick(mouseX: number, mouseY: number): void {
    const maybe = this.y + this.velocity;
    if (
      maybe + this.radius >= this.height ||
      maybe - this.radius <= 0 ||
      detectCollision(this.x, this.y, mouseX, mouseY, this.radius)
    ) {
      // Change direction on boundary
      // or on mouse collision
      this.velocity = -this.velocity;
    }

    this.y = this.y + this.velocity;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.beginPath();
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 3;
    ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    ctx.stroke();
  }
}

export function clear(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
): void {
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, width, height);
}
