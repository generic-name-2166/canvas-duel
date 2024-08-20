"use client";

import { useEffect, useRef, type JSX } from "react";
/* import styles from "./Board.module.scss"; */

export default function Board(): JSX.Element {
  const board = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!board?.current) {
      return;
    }
    const ctx = board.current.getContext("2d");
    if (!ctx) {
      return;
    }

    let mounted = true;

    const loop = () => {
      if (!mounted) {
        return;
      }

      ctx.beginPath();
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 3;
      ctx.arc(100, 100, 50, 0, 2 * Math.PI);
      ctx.stroke();

      requestAnimationFrame(loop);
    };

    loop();

    return () => {
      mounted = false;
    };
  }, [board]);

  return <canvas ref={board}></canvas>;
}
