"use client";

import {
  type ChangeEventHandler,
  type ForwardedRef,
  forwardRef,
  type JSX,
  useState,
} from "react";
import { HeroColours } from "./board.ts";
import styles from "./ColourDialog.module.scss";

export interface ColourDialog {
  changeColour(colour: HeroColours): void;
  closeDialog(): void;
}

export default forwardRef(function ColourDialog(
  { changeColour, closeDialog }: ColourDialog,
  ref: ForwardedRef<HTMLDialogElement>,
): JSX.Element {
  const [colour, setColour] = useState<HeroColours>(HeroColours.Default);

  const onChange: ChangeEventHandler<HTMLSelectElement> = (event) => {
    const c = event.target.value as HeroColours;
    setColour(c);
    changeColour(c);
  };

  return (
    <dialog ref={ref} className={styles.dialog}>
      <form className={styles.form}>
        <select value={colour} onChange={onChange}>
          <option disabled defaultValue="">
            Colour
          </option>
          <option value={HeroColours.Default}>Default</option>
          <option value={HeroColours.Red}>Red</option>
          <option value={HeroColours.Blue}>Blue</option>
          <option value={HeroColours.Green}>Green</option>
        </select>
        <button formMethod="dialog" type="submit" onClick={closeDialog}>
          Close
        </button>
      </form>
    </dialog>
  );
});
