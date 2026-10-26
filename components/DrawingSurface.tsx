"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { findAction, triggerFromPointer } from "@/lib/bindings";
import { renderStroke, renderStrokes } from "@/lib/render";
import { actions, getState, runAction, useStore } from "@/lib/store";
import type { Board, Stroke, Trigger } from "@/lib/types";
import styles from "./DrawingSurface.module.css";

const PALM_MS = 1500; // ignore touch for this long after any pen activity
const MIN_DIST_SQ = 0.25; // drop points closer than 0.5px to the previous one
const MIN_RING = 4;

function ctx2d(canvas: HTMLCanvasElement) {
  return canvas.getContext("2d")!;
}

function clear(canvas: HTMLCanvasElement) {
  // The context is scaled by DPR, so this over-covers the backing store, which is fine.
  ctx2d(canvas).clearRect(0, 0, canvas.width, canvas.height);
}

function paintAll(canvas: HTMLCanvasElement, board: Board) {
  clear(canvas);
  renderStrokes(ctx2d(canvas), board.strokes);
}

function addPoint(stroke: Stroke, e: PointerEvent) {
  const pts = stroke.points;
  const n = pts.length;
  if (n) {
    const dx = e.clientX - pts[n - 3];
    const dy = e.clientY - pts[n - 2];
    if (dx * dx + dy * dy < MIN_DIST_SQ) return;
  }
  // Some pen drivers report 0 on the first contact events; reuse the last known pressure.
  const p = !stroke.pressure ? 1 : e.pressure > 0 ? e.pressure : n ? pts[n - 1] : 0.5;
  pts.push(e.clientX, e.clientY, p);
}

export default function DrawingSurface() {
  const committedRef = useRef<HTMLCanvasElement>(null);
  const liveRef = useRef<HTMLCanvasElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  /** The board whose strokes are currently painted on the committed canvas. */
  const drawn = useRef<Board | null>(null);

  const board = useStore((s) => s.boards[s.active]);
  const color = useStore((s) => s.color);
  const size = useStore((s) => s.size);
  const helpOpen = useStore((s) => s.helpOpen);

  // Sizing and pointer input. All per-move state lives in this closure, never in React.
  useLayoutEffect(() => {
    const committed = committedRef.current!;
    const live = liveRef.current!;
    const ring = ringRef.current!;
    let current: { id: number; type: string; stroke: Stroke } | null = null;
    let frame = 0;
    let lastPen = -Infinity;
    let dprQuery: MediaQueryList | undefined;

    const drawLive = () => {
      frame = 0;
      clear(live);
      if (current) renderStroke(ctx2d(live), current.stroke, false);
    };
    const scheduleLive = () => {
      if (!frame) frame = requestAnimationFrame(drawLive);
    };

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      for (const c of [committed, live]) {
        c.width = Math.round(c.clientWidth * dpr);
        c.height = Math.round(c.clientHeight * dpr);
        ctx2d(c).setTransform(dpr, 0, 0, dpr, 0, 0);
      }
      const s = getState();
      drawn.current = s.boards[s.active];
      paintAll(committed, drawn.current);
      drawLive();
      // Moving to a monitor with a different DPR does not always fire `resize`.
      dprQuery?.removeEventListener("change", resize);
      dprQuery = matchMedia(`(resolution: ${dpr}dppx)`);
      dprQuery.addEventListener("change", resize);
    };

    const hideRing = () => {
      ring.style.visibility = "hidden";
    };
    const moveRing = (e: PointerEvent) => {
      if (e.pointerType === "touch" || getState().helpOpen) return hideRing();
      ring.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
      ring.style.visibility = "visible";
    };

    const onDown = (e: PointerEvent) => {
      const pen = e.pointerType === "pen";
      if (pen) lastPen = e.timeStamp;
      if (getState().helpOpen) return;
      if (e.pointerType === "touch") {
        hideRing();
        if (current || e.timeStamp - lastPen < PALM_MS) return;
      } else if (current) {
        if (!(pen && current.type === "touch")) return;
        // A palm often lands before the pen: drop its stroke and let the pen take over.
        current = null;
        drawLive();
      }

      const eraser = pen && (e.button === 5 || (e.buttons & 32) !== 0);
      if (e.button !== 0 || eraser) {
        e.preventDefault();
        const t: Trigger = eraser ? { type: "pen", button: 5 } : triggerFromPointer(e);
        const action = findAction(getState().bindings, t);
        if (action) runAction(action);
        return;
      }

      e.preventDefault();
      if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
      live.setPointerCapture(e.pointerId);
      const { color, size } = getState();
      current = { id: e.pointerId, type: e.pointerType, stroke: { color, size, points: [], pressure: pen } };
      addPoint(current.stroke, e);
      scheduleLive();
      moveRing(e);
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "pen") lastPen = e.timeStamp;
      if (current && e.pointerId !== current.id) return;
      moveRing(e);
      if (!current) return;
      const coalesced = e.getCoalescedEvents?.() ?? [];
      for (const ce of coalesced.length ? coalesced : [e]) addPoint(current.stroke, ce);
      scheduleLive();
    };

    const onEnd = (e: PointerEvent) => {
      if (!current || e.pointerId !== current.id) return;
      const { stroke } = current;
      current = null;
      cancelAnimationFrame(frame);
      frame = 0;
      // The committed canvas paints the stroke from the store update before the next frame.
      clear(live);
      actions.addStroke(stroke);
    };

    const listeners: [string, (e: PointerEvent) => void][] = [
      ["pointerdown", onDown],
      ["pointermove", onMove],
      ["pointerup", onEnd],
      ["pointercancel", onEnd],
      ["lostpointercapture", onEnd],
      ["pointerleave", hideRing],
    ];
    for (const [type, fn] of listeners) live.addEventListener(type, fn as EventListener);
    window.addEventListener("resize", resize);
    resize();

    return () => {
      for (const [type, fn] of listeners) live.removeEventListener(type, fn as EventListener);
      window.removeEventListener("resize", resize);
      dprQuery?.removeEventListener("change", resize);
      cancelAnimationFrame(frame);
    };
  }, []);

  // Committed canvas: paint just the appended stroke when possible, else repaint everything.
  useLayoutEffect(() => {
    const canvas = committedRef.current!;
    const prev = drawn.current;
    drawn.current = board;
    if (prev?.id === board.id) {
      if (prev.strokes === board.strokes) return;
      const n = prev.strokes.length;
      if (board.strokes.length === n + 1 && prev.strokes.every((s, i) => s === board.strokes[i])) {
        renderStroke(ctx2d(canvas), board.strokes[n]);
        return;
      }
    }
    paintAll(canvas, board);
  }, [board]);

  useEffect(() => {
    if (helpOpen) ringRef.current!.style.visibility = "hidden";
  }, [helpOpen]);

  const d = Math.max(MIN_RING, size);
  return (
    <>
      <canvas ref={committedRef} className={styles.canvas} />
      <canvas ref={liveRef} className={styles.canvas} />
      <div
        ref={ringRef}
        className={styles.ring}
        style={{ width: d, height: d, marginLeft: -d / 2, marginTop: -d / 2, borderColor: color }}
      />
    </>
  );
}
