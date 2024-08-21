"use client";

import { MouseEventHandler, useEffect, useRef, type JSX } from "react";
import { clear, Hero } from "./board.ts";
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

    const hero1 = new Hero(10, 20, 10, 2, 100, true);
    const hero2 = new Hero(90, 20, 10, 2, 100, false);

    const loop = () => {
      if (!mounted) {
        return;
      }
      clear(ctx, width, height);

      hero1.tick(mouse.current.x, mouse.current.y);
      hero1.draw(ctx);
      hero2.tick(mouse.current.x, mouse.current.y);
      hero2.draw(ctx);

      requestAnimationFrame(loop);
    };

    loop();

    return () => {
      mounted = false;
    };
  }, [board]);

  return <canvas onMouseMove={handleMouseMove} ref={board}></canvas>;
}
