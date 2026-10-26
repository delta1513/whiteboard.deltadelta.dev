// Shared types for the whiteboard. All coordinates are CSS pixels relative to
// the top-left of the viewport (the drawing surface fills the whole viewport).

export interface Stroke {
  color: string;
  /** Base diameter in CSS px (the pen-size slider value when the stroke began). */
  size: number;
  /** Flat list of [x, y, pressure] triples. Pressure is 0..1; mouse strokes use 1. */
  points: number[];
  /** True when drawn with a pressure-sensitive pen, so width follows pressure. */
  pressure: boolean;
}

export interface Board {
  id: string;
  /** Replaced (never mutated) on every change so React can diff by reference. */
  strokes: Stroke[];
}

export type Action =
  | "undo"
  | "nextBoard"
  | "prevBoard"
  | "newBoard"
  | "color1"
  | "color2"
  | "color3"
  | "color4"
  | "color5"
  | "sizeUp"
  | "sizeDown"
  | "help";

/**
 * Something the user can press. `mouse` and `pen` use PointerEvent.button
 * (0 primary, 1 middle, 2 right / pen barrel, 3 back, 4 forward, 5 pen eraser).
 */
export type Trigger =
  | { type: "key"; code: string; ctrl?: boolean; shift?: boolean; alt?: boolean; meta?: boolean }
  | { type: "mouse"; button: number }
  | { type: "pen"; button: number };

export type Bindings = Record<Action, Trigger[]>;

export interface State {
  boards: Board[];
  /** Index into `boards` of the board being drawn on. */
  active: number;
  color: string;
  size: number;
  helpOpen: boolean;
  bindings: Bindings;
}
