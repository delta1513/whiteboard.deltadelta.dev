"use client";

import { useEffect, useRef, useState } from "react";
import {
  ACTIONS,
  cloneBindings,
  DEFAULT_BINDINGS,
  findAction,
  triggerFromKey,
  triggerFromPointer,
  triggerLabel,
  withBinding,
  withoutBinding,
} from "@/lib/bindings";
import { actions, getState, useStore } from "@/lib/store";
import type { Action, Trigger } from "@/lib/types";
import styles from "./HelpModal.module.css";

const FIXED = [
  ["Draw", "Left click / pen tip"],
  ["Switch canvas", "Scroll wheel"],
  ["Close this", "Esc"],
];

// Events that follow a pointer press. Eaten after a pointer capture so the
// press does nothing else (e.g. "Mouse back" would navigate the page).
const FOLLOW_UPS = ["mousedown", "mouseup", "click", "auxclick", "contextmenu"];

const labelOf = (a: Action) => ACTIONS.find((x) => x.action === a)?.label ?? a;

export default function HelpModal() {
  const open = useStore((s) => s.helpOpen);
  // Mounting the panel only while open resets capture state on every close.
  return open ? <Panel /> : null;
}

function Panel() {
  const bindings = useStore((s) => s.bindings);
  const [capturing, setCapturing] = useState<Action | null>(null);
  const [note, setNote] = useState<{ action: Action; text: string } | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => panelRef.current?.focus(), []);

  // Bubble phase: while capturing, the capture listeners below stop Esc first.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") actions.setHelpOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!note) return;
    const t = setTimeout(() => setNote(null), 2000);
    return () => clearTimeout(t);
  }, [note]);

  useEffect(() => {
    if (!capturing) return;
    const action = capturing;
    let fromPointer = false;

    const block = (e: Event) => {
      e.preventDefault();
      e.stopImmediatePropagation();
    };

    const finish = (t: Trigger | null) => {
      if (t) {
        const { bindings } = getState();
        const prev = findAction(bindings, t);
        actions.setBindings(withBinding(bindings, action, t));
        if (prev && prev !== action) setNote({ action, text: `moved from ${labelOf(prev)}` });
      }
      setCapturing(null);
    };

    const onKey = (e: KeyboardEvent) => {
      block(e);
      if (e.key === "Escape" && !e.ctrlKey && !e.shiftKey && !e.altKey && !e.metaKey) return finish(null);
      const t = triggerFromKey(e);
      if (t) finish(t);
    };

    const onPointer = (e: PointerEvent) => {
      block(e);
      fromPointer = true;
      const t = triggerFromPointer(e);
      // Left click and pen tip draw, so they cannot be bound; they cancel instead.
      const draws = e.pointerType === "touch" || (t.type !== "key" && t.button === 0);
      finish(draws ? null : t);
    };

    const removeFollowUps = () => FOLLOW_UPS.forEach((type) => window.removeEventListener(type, block, true));

    // Start on the next tick so the click that pressed "+" is not captured.
    const start = setTimeout(() => {
      window.addEventListener("keydown", onKey, true);
      window.addEventListener("pointerdown", onPointer, true);
      FOLLOW_UPS.forEach((type) => window.addEventListener(type, block, true));
    }, 0);

    return () => {
      clearTimeout(start);
      window.removeEventListener("keydown", onKey, true);
      window.removeEventListener("pointerdown", onPointer, true);
      if (!fromPointer) return removeFollowUps();
      // The button is still down: keep eating its follow-up events until release.
      const fallback = setTimeout(removeFollowUps, 5000);
      const onUp = () => {
        clearTimeout(fallback);
        setTimeout(removeFollowUps, 50);
      };
      window.addEventListener("pointerup", onUp, { capture: true, once: true });
      window.addEventListener("pointercancel", onUp, { capture: true, once: true });
    };
  }, [capturing]);

  const close = () => actions.setHelpOpen(false);

  return (
    <div
      className={styles.backdrop}
      onPointerDown={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div
        ref={panelRef}
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="help-title"
        tabIndex={-1}
      >
        <header className={styles.header}>
          <h2 id="help-title" className={styles.title}>Shortcuts</h2>
          <button className={styles.iconButton} onClick={close} aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="1.75" strokeLinecap="round" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </header>

        <section className={styles.section}>
          <h3 className={styles.heading}>Fixed</h3>
          {FIXED.map(([label, value]) => (
            <div key={label} className={styles.row}>
              <span className={styles.label}>{label}</span>
              <span className={styles.muted}>{value}</span>
            </div>
          ))}
        </section>

        <section className={styles.section}>
          <h3 className={styles.heading}>Bindings</h3>
          {ACTIONS.map(({ action, label }) => (
            <div key={action} className={styles.row}>
              <span className={styles.label}>
                {label}
                {note?.action === action && <span className={styles.note}>{note.text}</span>}
              </span>
              <span className={styles.triggers}>
                {bindings[action].map((t) => {
                  const name = triggerLabel(t);
                  return (
                    <span key={JSON.stringify(t)} className={styles.chip}>
                      {name}
                      <button
                        className={styles.chipRemove}
                        aria-label={`Remove ${name} from ${label}`}
                        onClick={() => actions.setBindings(withoutBinding(getState().bindings, action, t))}
                      >
                        ×
                      </button>
                    </span>
                  );
                })}
                {capturing === action ? (
                  <span className={`${styles.chip} ${styles.capturing}`}>Press a key, mouse or pen button…</span>
                ) : (
                  <button
                    className={styles.add}
                    aria-label={`Add binding for ${label}`}
                    onClick={() => setCapturing(action)}
                  >
                    +
                  </button>
                )}
              </span>
            </div>
          ))}
          <p className={styles.hint}>
            Tablet express keys: map them to keys in your tablet driver, or bind the pen&apos;s buttons here.
          </p>
        </section>

        <footer className={styles.footer}>
          <button className={styles.textButton} onClick={() => actions.setBindings(cloneBindings(DEFAULT_BINDINGS))}>
            Reset to defaults
          </button>
          <span className={styles.hint}>Bindings are saved in this browser.</span>
        </footer>
      </div>
    </div>
  );
}
