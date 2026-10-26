"use client";

import { useEffect } from "react";
import { findAction, triggerFromKey } from "@/lib/bindings";
import { getState, runAction } from "@/lib/store";
import type { Action } from "@/lib/types";
import CanvasBar from "./CanvasBar";
import DrawingSurface from "./DrawingSurface";
import HelpModal from "./HelpModal";
import Toolbar from "./Toolbar";

/** Actions that keep firing while their key is held down. */
const REPEATABLE = new Set<Action>(["undo", "sizeUp", "sizeDown"]);

const WHEEL_STEP = 50; // px of scroll per canvas switch
const WHEEL_COOLDOWN = 220; // ms before another wheel notch can switch again
const WHEEL_IDLE = 200; // ms without wheel events that ends a gesture

function isEditable(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);
}

export default function Whiteboard() {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (isEditable(e.target)) return;
      const t = triggerFromKey(e);
      const action = t && findAction(getState().bindings, t);
      if (!action) return;
      e.preventDefault();
      if (e.repeat && !REPEATABLE.has(action)) return;
      // While help is open only its own toggle works, so nothing changes behind the modal.
      if (getState().helpOpen && action !== "help") return;
      runAction(action);
    };

    let accum = 0;
    let lastWheel = -Infinity;
    let lastMag = 0;
    let cooldownUntil = 0;
    // After a switch the rest of the gesture is ignored, so trackpad momentum (a long
    // stream of shrinking deltas) moves one canvas only. The gesture ends after a pause,
    // or when a full wheel notch arrives after the cooldown.
    let locked = false;
    const onWheel = (e: WheelEvent) => {
      if (getState().helpOpen) {
        // Let the modal scroll, but never zoom the page.
        if (e.ctrlKey) e.preventDefault();
        return;
      }
      e.preventDefault();
      const now = e.timeStamp;
      const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? window.innerHeight : 1;
      const delta = (Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY) * unit;
      const mag = Math.abs(delta);
      const prevMag = lastMag;
      lastMag = mag;
      if (now - lastWheel > WHEEL_IDLE) {
        accum = 0;
        locked = false;
      } else if (locked && now >= cooldownUntil && mag >= WHEEL_STEP && mag >= prevMag) {
        locked = false;
      }
      lastWheel = now;
      if (locked) return;
      accum += delta;
      if (Math.abs(accum) < WHEEL_STEP) return;
      runAction(accum > 0 ? "nextBoard" : "prevBoard");
      accum = 0;
      locked = true;
      cooldownUntil = now + WHEEL_COOLDOWN;
    };

    const prevent = (e: Event) => e.preventDefault();
    // Mouse back/forward are bindable; stop them from navigating the page.
    const preventNav = (e: MouseEvent) => {
      if (e.button === 3 || e.button === 4) e.preventDefault();
    };

    const listeners: [string, EventListener, AddEventListenerOptions?][] = [
      ["keydown", onKeyDown as EventListener],
      ["wheel", onWheel as EventListener, { passive: false }],
      ["contextmenu", prevent],
      ["auxclick", prevent],
      ["mouseup", preventNav as EventListener],
      ["pointerup", preventNav as EventListener],
      ["gesturestart", prevent],
      ["gesturechange", prevent],
    ];
    for (const [type, fn, opts] of listeners) window.addEventListener(type, fn, opts);
    return () => {
      for (const [type, fn] of listeners) window.removeEventListener(type, fn);
    };
  }, []);

  return (
    <>
      <DrawingSurface />
      <CanvasBar />
      <Toolbar />
      <HelpModal />
    </>
  );
}
