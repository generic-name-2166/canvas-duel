import type { JSX } from "react";
import Board from "@/lib/Board.tsx";
import styles from "./page.module.scss";

export default function Home(): JSX.Element {
  return (
    <main className={styles.main}>
      <Board />
    </main>
  );
}
