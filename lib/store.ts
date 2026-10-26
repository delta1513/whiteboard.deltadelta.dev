import { useSyncExternalStore } from "react";
import { cloneBindings, DEFAULT_BINDINGS } from "./bindings";
import type { Action, Bindings, Board, State, Stroke } from "./types";

// Session-only state: nothing is persisted, a reload starts fresh.

export const COLORS = [
  { name: "Black", value: "#1c1c1e" },
  { name: "Blue", value: "#2563eb" },
  { name: "Red", value: "#e11d48" },
  { name: "Green", value: "#16a34a" },
  { name: "Yellow", value: "#f5b301" },
] as const;

export const MIN_SIZE = 1;
export const MAX_SIZE = 40;

let nextId = 1;
const newBoard = (): Board => ({ id: `b${nextId++}`, strokes: [] });

let state: State = {
  boards: [newBoard()],
  active: 0,
  color: COLORS[0].value,
  size: 4,
  helpOpen: false,
  bindings: cloneBindings(DEFAULT_BINDINGS),
};
const initialState = state;

const listeners = new Set<() => void>();

function set(patch: Partial<State>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export const getState = () => state;

export function useStore<T>(selector: (s: State) => T): T {
  return useSyncExternalStore(
    subscribe,
    () => selector(state),
    () => selector(initialState),
  );
}

const clampSize = (n: number) => Math.min(MAX_SIZE, Math.max(MIN_SIZE, Math.round(n)));

function updateBoard(index: number, fn: (strokes: Stroke[]) => Stroke[]) {
  const boards = state.boards.slice();
  const b = boards[index];
  boards[index] = { ...b, strokes: fn(b.strokes) };
  set({ boards });
}

const updateActive = (fn: (strokes: Stroke[]) => Stroke[]) => updateBoard(state.active, fn);

export const actions = {
  /** `boardId` is the board the stroke began on, in case the user switched mid-stroke. */
  addStroke(stroke: Stroke, boardId = state.boards[state.active].id) {
    const i = state.boards.findIndex((b) => b.id === boardId);
    if (i !== -1) updateBoard(i, (s) => [...s, stroke]);
  },
  undo() {
    if (state.boards[state.active].strokes.length === 0) return;
    updateActive((s) => s.slice(0, -1));
  },
  goTo(index: number) {
    if (index < 0 || index >= state.boards.length || index === state.active) return;
    set({ active: index });
  },
  nextBoard() {
    actions.goTo(state.active + 1);
  },
  prevBoard() {
    actions.goTo(state.active - 1);
  },
  newBoard() {
    set({ boards: [...state.boards, newBoard()], active: state.boards.length });
  },
  setColor(color: string) {
    set({ color });
  },
  setSize(size: number) {
    set({ size: clampSize(size) });
  },
  setHelpOpen(helpOpen: boolean) {
    set({ helpOpen });
  },
  setBindings(bindings: Bindings) {
    set({ bindings });
  },
};

const step = (size: number) => (size < 10 ? 1 : size < 20 ? 2 : 4);

/** Run a bindable action. Used by keyboard, mouse and pen dispatch alike. */
export function runAction(action: Action) {
  switch (action) {
    case "undo": return actions.undo();
    case "nextBoard": return actions.nextBoard();
    case "prevBoard": return actions.prevBoard();
    case "newBoard": return actions.newBoard();
    case "sizeUp": return actions.setSize(state.size + step(state.size));
    case "sizeDown": return actions.setSize(state.size - step(state.size - 1));
    case "help": return actions.setHelpOpen(!state.helpOpen);
    default: {
      const i = Number(action.slice(5)) - 1; // "colorN"
      if (COLORS[i]) actions.setColor(COLORS[i].value);
    }
  }
}
