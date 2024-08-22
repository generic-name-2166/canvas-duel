"use client";

import {
  type MouseEventHandler,
  type MutableRefObject,
  useEffect,
  useRef,
  type JSX,
  type ChangeEventHandler,
} from "react";
import { BoardManager, HeroColours, Paused } from "./board.ts";
import styles from "./Board.module.scss";
import Control, {
  type ControlProps,
  INITIAL_FIRERATE,
  INITIAL_VELOCITY,
} from "./Control.tsx";
import ColourDialog from "./ColourDialog.tsx";

function handleChange(
  ref: MutableRefObject<number>,
): ControlProps["changeFirerate"] {
  return (value: number) => (ref.current = value);
}

export default function Board(): JSX.Element {
  const board = useRef<HTMLDivElement | null>(null);
  const canvas = useRef<HTMLCanvasElement | null>(null);
  const dialog1 = useRef<HTMLDialogElement | null>(null);
  const dialog2 = useRef<HTMLDialogElement | null>(null);
  const paused = useRef<Paused>(Paused.None);
  const hero1colour = useRef<HeroColours>(HeroColours.Default);
  const hero2colour = useRef<HeroColours>(HeroColours.Default);
  const mouse = useRef({ x: 0, y: 0 });

  const changeColour1 = (colour: HeroColours): void => {
    hero1colour.current = colour;
  };
  const changeColour2 = (colour: HeroColours): void => {
    hero2colour.current = colour;
  };

  /**
   * hero shoots every `firerate` microseconds
   * the lower, the faster hero shoots
   */
  const hero1firerate = useRef(INITIAL_FIRERATE);
  const changeHero1Firerate = handleChange(hero1firerate);
  const hero1velocity = useRef(INITIAL_VELOCITY);
  const changeHero1Velocity = handleChange(hero1velocity);

  const hero2firerate = useRef(INITIAL_FIRERATE);
  const changeHero2Firerate = handleChange(hero2firerate);
  const hero2velocity = useRef(INITIAL_VELOCITY);
  const changeHero2Velocity = handleChange(hero2velocity);

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

  const handleClick = useRef<MouseEventHandler<HTMLCanvasElement>>(() => {});
  const closeDialog = () => {
    paused.current = Paused.None;
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

    handleClick.current = (event) => {
      const rect = canvas.current!.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;
      const p = manager.pauseHero(mouseX, mouseY);
      paused.current = p;
      switch (p) {
        case Paused.None:
          if (dialog1.current?.open) {
            dialog1.current.close();
          }
          if (dialog2.current?.open) {
            dialog2.current.close();
          }
          return;
        case Paused.Hero1:
          dialog1.current!.show();
          dialog1.current!.style.left = `${-width + 300}px`;
          dialog1.current!.style.top = `${manager.getHero1Y()}px`;
          if (dialog2.current!.open) {
            dialog2.current!.close();
          }
          return;
        case Paused.Hero2:
          dialog2.current!.show();
          dialog2.current!.style.left = `${width - 300}px`;
          dialog2.current!.style.top = `${manager.getHero2Y()}px`;
          if (dialog1.current!.open) {
            dialog1.current!.close();
          }
          return;
      }
    };

    const loop = (time: DOMHighResTimeStamp) => {
      if (!mounted) {
        return;
      }

      canvas.current!.width = width;
      canvas.current!.height = height;

      manager.tick(
        time,
        width,
        height,
        mouse.current.x,
        mouse.current.y,
        hero1firerate.current,
        hero1velocity.current,
        hero2firerate.current,
        hero2velocity.current,
        paused.current,
      );
      manager.draw(hero1colour.current, hero2colour.current);

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
        // wrapper closure so that the ref is dynamic
        onClick={(e) => handleClick.current(e)}
        ref={canvas}
      ></canvas>

      <ColourDialog
        ref={dialog1}
        changeColour={changeColour1}
        closeDialog={closeDialog}
      />
      <ColourDialog
        ref={dialog2}
        changeColour={changeColour2}
        closeDialog={closeDialog}
      />

      <div className={styles.control}>
        <Control
          name="Hero 1"
          changeFirerate={changeHero1Firerate}
          changeVelocity={changeHero1Velocity}
        />
        <Control
          name="Hero 2"
          changeFirerate={changeHero2Firerate}
          changeVelocity={changeHero2Velocity}
        />
        <p className={styles.p}>
          Change the heroes&apos; firerate and velocity. The lower the firerate,
          the faster the hero attacks. Click on the heroes to change their
          colour.
        </p>
      </div>
    </div>
  );
}
