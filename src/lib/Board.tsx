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

    let hero = new Hero(4, 20, 10, 2, 100);

    const loop = () => {
      if (!mounted) {
        return;
      }
      clear(ctx, width, height);

      hero = hero.tick(mouse.current.x, mouse.current.y);
      hero.draw(ctx);

      requestAnimationFrame(loop);
    };

    loop();

    return () => {
      mounted = false;
    };
  }, [board]);

  return <canvas onMouseMove={handleMouseMove} ref={board}></canvas>;
}
