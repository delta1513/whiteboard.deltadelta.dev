"use client";

import type { CSSProperties, MouseEvent, PointerEvent } from "react";
import { actions, COLORS, MAX_SIZE, MIN_SIZE, useStore } from "@/lib/store";
import styles from "./Toolbar.module.css";

const PREVIEW_MAX = 22;

// Keep focus off buttons on mouse click so Space/Enter never re-trigger them.
const keepFocus = (e: MouseEvent) => e.preventDefault();

// Blur the slider once the drag ends (wherever the pointer is released) so
// arrow keys go back to switching canvases.
function blurOnRelease(e: PointerEvent<HTMLInputElement>) {
  const el = e.currentTarget;
  const done = () => {
    el.blur();
    window.removeEventListener("pointerup", done);
    window.removeEventListener("pointercancel", done);
  };
  window.addEventListener("pointerup", done);
  window.addEventListener("pointercancel", done);
}

export default function Toolbar() {
  const color = useStore((s) => s.color);
  const size = useStore((s) => s.size);
  const dot = Math.min(size, PREVIEW_MAX);

  return (
    <div className={styles.bar}>
      <button
        type="button"
        className={styles.icon}
        aria-label="Help & shortcuts"
        title="Help & shortcuts"
        onMouseDown={keepFocus}
        onClick={() => actions.setHelpOpen(true)}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="9" />
          <path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .8-1 1.5v.4" />
          <path d="M12 16.8h.01" />
        </svg>
      </button>

      <span className={styles.divider} />

      {COLORS.map((c) => (
        <button
          key={c.value}
          type="button"
          className={styles.swatch}
          aria-label={c.name}
          aria-pressed={color === c.value}
          title={c.name}
          onMouseDown={keepFocus}
          onClick={() => actions.setColor(c.value)}
        >
          <span style={{ background: c.value }} />
        </button>
      ))}

      <span className={styles.divider} />

      <input
        type="range"
        className={styles.slider}
        min={MIN_SIZE}
        max={MAX_SIZE}
        step={1}
        value={size}
        aria-label="Pen size"
        style={{ "--fill": (size - MIN_SIZE) / (MAX_SIZE - MIN_SIZE), "--color": color } as CSSProperties}
        onChange={(e) => actions.setSize(Number(e.target.value))}
        onPointerDown={blurOnRelease}
      />
      <span className={styles.preview} aria-hidden="true">
        <span style={{ width: dot, height: dot, background: color }} />
      </span>
    </div>
  );
}
