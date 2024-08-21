"use client";

import { MouseEventHandler, useEffect, useRef, type JSX } from "react";
import { clear, Hero, Projectile } from "./board.ts";
/* import styles from "./Board.module.scss"; */

export default function Board(): JSX.Element {
  const board = useRef<HTMLCanvasElement | null>(null);
  const mouse = useRef({ x: 0, y: 0 });

  const handleMouseMove: MouseEventHandler<HTMLCanvasElement> = (event) => {
    const rect = board.current?.getBoundingClientRect();
    if (!rect) {
      return;
    }
    mouse.current = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  };

  useEffect(() => {
    if (!board?.current) {
      return;
    }
    const ctx = board.current.getContext("2d");
    if (!ctx) {
      return;
    }

    const height = board.current.height;
    const width = board.current.width;

    let mounted = true;

    const hero1 = new Hero(10, 20, 10, 100, 2, 300, 150, true);
    const hero2 = new Hero(190, 20, 10, 100, 2, 300, 150, false);
    let projectiles1: Projectile[] = [];
    let projectiles2: Projectile[] = [];

    const loop = () => {
      if (!mounted) {
        return;
      }
      clear(ctx, width, height);

      const proj1 = hero1.tick(mouse.current.x, mouse.current.y);
      hero1.draw(ctx);
      if (projectiles1.length > 10) {
        projectiles1.shift();
      }
      if (proj1 !== null) {
        projectiles1.push(proj1);
      }

      const proj2 = hero2.tick(mouse.current.x, mouse.current.y);
      hero2.draw(ctx);
      if (projectiles2.length > 10) {
        projectiles2.shift();
      }
      if (proj2 !== null) {
        projectiles2.push(proj2);
      }

      // side effects in filter :(
      projectiles1 = projectiles1.filter(
        (proj) => !proj.tick(hero2.x, hero2.y, hero2.radius),
      );
      projectiles2 = projectiles2.filter(
        (proj) => !proj.tick(hero1.x, hero1.y, hero1.radius),
      );
      for (const proj of projectiles1) {
        proj.draw(ctx);
      }
      for (const proj of projectiles2) {
        proj.draw(ctx);
      }

      requestAnimationFrame(loop);
    };

    loop();

    return () => {
      mounted = false;
    };
  }, [board]);

  return <canvas onMouseMove={handleMouseMove} ref={board}></canvas>;
}
