"use client";

import { MouseEventHandler, useEffect, useRef, type JSX } from "react";
import { BoardManager } from "./board.ts";
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

    const manager = new BoardManager(ctx, width);

    const loop = (time: DOMHighResTimeStamp) => {
      if (!mounted) {
        return;
      }

      canvas.current!.width = width;
      canvas.current!.height = height;

      manager.tick(time, width, height, mouse.current.x, mouse.current.y);
      manager.draw();

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
