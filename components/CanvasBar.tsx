"use client";

import { memo, useEffect, useRef, useSyncExternalStore } from "react";
import type { MouseEvent } from "react";
import { renderStrokes } from "@/lib/render";
import { actions, useStore } from "@/lib/store";
import type { Stroke } from "@/lib/types";
import styles from "./CanvasBar.module.css";

const THUMB_H = 30;
const THUMB_MIN_LINE = 1; // thumbnail CSS px

// Viewport size as an external store, so thumbnails keep the window's aspect ratio.
type Viewport = { w: number; h: number };
const SERVER_VIEWPORT: Viewport = { w: 16, h: 10 };
let viewport = SERVER_VIEWPORT;

function subscribeViewport(cb: () => void) {
  window.addEventListener("resize", cb);
  return () => window.removeEventListener("resize", cb);
}

function getViewport() {
  if (viewport.w !== window.innerWidth || viewport.h !== window.innerHeight) {
    viewport = { w: window.innerWidth, h: window.innerHeight };
  }
  return viewport;
}

// Keep focus off buttons on mouse click so Space/Enter never re-trigger them.
const keepFocus = (e: MouseEvent) => e.preventDefault();

interface ThumbProps {
  index: number;
  strokes: Stroke[];
  active: boolean;
  width: number;
  /** Thumbnail px per viewport CSS px. */
  scale: number;
}

const Thumb = memo(function Thumb({ index, strokes, active, width, scale }: ThumbProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Redraw at most once per frame; a burst of changes cancels the pending draw.
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!canvas || !ctx) return;
      const dpr = window.devicePixelRatio || 1;
      const w = Math.round(width * dpr);
      const h = Math.round(THUMB_H * dpr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, w, h);
      ctx.setTransform(dpr * scale, 0, 0, dpr * scale, 0, 0);
      // At thumbnail scale normal pens are a fraction of a pixel; keep every stroke visible.
      const minSize = THUMB_MIN_LINE / scale;
      renderStrokes(ctx, strokes.map((s) => (s.size >= minSize ? s : { ...s, size: minSize })));
    });
    return () => cancelAnimationFrame(id);
  }, [strokes, width, scale]);

  useEffect(() => {
    if (active) buttonRef.current?.scrollIntoView({ behavior: "smooth", inline: "nearest", block: "nearest" });
  }, [active]);

  return (
    <button
      ref={buttonRef}
      type="button"
      className={styles.thumb}
      aria-label={`Canvas ${index + 1}`}
      aria-current={active ? "true" : undefined}
      title={`Canvas ${index + 1}`}
      onMouseDown={keepFocus}
      onClick={() => actions.goTo(index)}
    >
      <canvas ref={canvasRef} style={{ width, height: THUMB_H }} />
    </button>
  );
});

export default function CanvasBar() {
  const boards = useStore((s) => s.boards);
  const active = useStore((s) => s.active);
  const vp = useSyncExternalStore(subscribeViewport, getViewport, () => SERVER_VIEWPORT);
  const width = Math.round((THUMB_H * vp.w) / vp.h);
  const scale = width / vp.w;

  return (
    <div className={styles.bar}>
      <div className={styles.thumbs}>
        {boards.map((b, i) => (
          <Thumb key={b.id} index={i} strokes={b.strokes} active={i === active} width={width} scale={scale} />
        ))}
      </div>
      <button
        type="button"
        className={styles.add}
        aria-label="New canvas"
        title="New canvas"
        onMouseDown={keepFocus}
        onClick={() => actions.newBoard()}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </button>
    </div>
  );
}
