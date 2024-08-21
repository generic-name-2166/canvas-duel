"use client";

import { MouseEventHandler, useEffect, useRef, type JSX } from "react";
import { Hero, Projectile } from "./board.ts";
import styles from "./Board.module.scss";

export default function Board(): JSX.Element {
  const board = useRef<HTMLDivElement | null>(null);
  const canvas = useRef<HTMLCanvasElement | null>(null);
  const mouse = useRef({ x: 0, y: 0 });

  const handleMouseMove: MouseEventHandler<HTMLCanvasElement> = (event) => {
    const rect = canvas.current?.getBoundingClientRect();
    if (!rect) {
      return;
    }
    mouse.current = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  };

  useEffect(() => {
    if (!board?.current || !canvas?.current) {
      return;
    }
    const ctx = canvas.current.getContext("2d");
    if (!ctx) {
      return;
    }
    ctx.save();

    canvas.current.height = board.current.clientHeight - 300;
    canvas.current.width = board.current.clientWidth;
    let height = canvas.current.clientHeight - 300;
    let width = canvas.current.clientWidth;

    // resizing the canvas
    // https://stackoverflow.com/a/73831830
    const observer = new ResizeObserver((_entries) => {
      height = canvas.current?.clientHeight ?? 300;
      width = canvas.current?.clientWidth ?? 150;
    });
    observer.observe(canvas.current);

    let mounted = true;

    const hero1 = new Hero(50, 20, 10, 100, 2, true);
    const hero2 = new Hero(width - 50, 20, 10, 100, 2, false);
    let projectiles1: Projectile[] = [];
    let projectiles2: Projectile[] = [];

    const loop = (_time: DOMHighResTimeStamp) => {
      if (!mounted) {
        return;
      }

      canvas.current!.width = width;
      canvas.current!.height = height;

      const proj1 = hero1.tick(mouse.current.x, mouse.current.y, width, height);
      hero1.draw(ctx);
      if (projectiles1.length > 10) {
        projectiles1.shift();
      }
      if (proj1 !== null) {
        projectiles1.push(proj1);
      }

      const proj2 = hero2.tick(mouse.current.x, mouse.current.y, width, height);
      hero2.draw(ctx);
      if (projectiles2.length > 10) {
        projectiles2.shift();
      }
      if (proj2 !== null) {
        projectiles2.push(proj2);
      }

      // side effects in filter :(
      projectiles1 = projectiles1.filter(
        (proj) => !proj.tick(hero2.x, hero2.y, hero2.radius, width),
      );
      projectiles2 = projectiles2.filter(
        (proj) => !proj.tick(hero1.x, hero1.y, hero1.radius, width),
      );
      for (const proj of projectiles1) {
        proj.draw(ctx);
      }
      for (const proj of projectiles2) {
        proj.draw(ctx);
      }

      // Clearing canvas before next tick
      ctx.restore();

      requestAnimationFrame(loop);
    };

    requestAnimationFrame(loop);

    return () => {
      mounted = false;
    };
  }, [board, canvas]);

  return (
    <div className={styles.board} ref={board}>
      <canvas
        className={styles.canvas}
        onMouseMove={handleMouseMove}
        ref={canvas}
      ></canvas>
    </div>
  );
}
