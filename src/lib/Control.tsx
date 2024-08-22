"use client";

import { type ChangeEventHandler, useId, useState, type JSX } from "react";
import styles from "./Control.module.scss";

export const INITIAL_FIRERATE: number = 150;
export const INITIAL_VELOCITY: number = 2;

export interface ControlProps {
  name: string;
  changeFirerate(value: number): void;
  changeVelocity(value: number): void;
}

export default function Control({
  name,
  changeFirerate,
  changeVelocity,
}: ControlProps): JSX.Element {
  const [firerate, setFirerate] = useState(INITIAL_FIRERATE);
  const firerateId = useId();
  const onFirerate: ChangeEventHandler<HTMLInputElement> = (event) => {
    const value = parseInt(event.target.value);
    setFirerate(value);
    changeFirerate(value);
  };

  const [velocity, setVelocity] = useState(INITIAL_VELOCITY);
  const velocityId = useId();
  const onVelocity: ChangeEventHandler<HTMLInputElement> = (event) => {
    const value = parseInt(event.target.value);
    setVelocity(value);
    changeVelocity(value);
  };

  return (
    <fieldset className={styles.fieldset}>
      <legend>{name}</legend>

      <label htmlFor={firerateId}>Firerate {firerate}</label>
      <input
        id={firerateId}
        type="range"
        min="1"
        max="1000"
        value={firerate}
        onChange={onFirerate}
      />

      <label htmlFor={velocityId}>Velocity {velocity}</label>
      <input
        id={velocityId}
        type="range"
        min="0"
        max="100"
        value={velocity}
        onChange={onVelocity}
      />
    </fieldset>
  );
}
