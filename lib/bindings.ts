import type { Action, Bindings, Trigger } from "./types";

export const ACTIONS: { action: Action; label: string }[] = [
  { action: "undo", label: "Undo" },
  { action: "nextBoard", label: "Next canvas" },
  { action: "prevBoard", label: "Previous canvas" },
  { action: "newBoard", label: "New canvas" },
  { action: "color1", label: "Black" },
  { action: "color2", label: "Blue" },
  { action: "color3", label: "Red" },
  { action: "color4", label: "Green" },
  { action: "color5", label: "Yellow" },
  { action: "sizeUp", label: "Bigger pen" },
  { action: "sizeDown", label: "Smaller pen" },
  { action: "help", label: "Help" },
];

const key = (code: string, mods: Omit<Extract<Trigger, { type: "key" }>, "type" | "code"> = {}): Trigger => ({
  type: "key",
  code,
  ...mods,
});

export const DEFAULT_BINDINGS: Bindings = {
  undo: [key("KeyZ", { ctrl: true }), key("KeyZ", { meta: true }), { type: "mouse", button: 2 }],
  nextBoard: [key("ArrowRight"), key("PageDown"), { type: "mouse", button: 4 }],
  prevBoard: [key("ArrowLeft"), key("PageUp"), { type: "mouse", button: 3 }],
  newBoard: [key("KeyN")],
  color1: [key("Digit1")],
  color2: [key("Digit2")],
  color3: [key("Digit3")],
  color4: [key("Digit4")],
  color5: [key("Digit5")],
  sizeUp: [key("BracketRight")],
  sizeDown: [key("BracketLeft")],
  help: [key("Slash", { shift: true })],
};

export function cloneBindings(b: Bindings): Bindings {
  return Object.fromEntries(
    Object.entries(b).map(([a, ts]) => [a, ts.map((t) => ({ ...t }))]),
  ) as Bindings;
}

const MODIFIER_CODES = new Set([
  "ShiftLeft", "ShiftRight", "ControlLeft", "ControlRight",
  "AltLeft", "AltRight", "MetaLeft", "MetaRight",
]);

/** Null for bare modifier presses, which are never a trigger on their own. */
export function triggerFromKey(e: KeyboardEvent): Trigger | null {
  if (MODIFIER_CODES.has(e.code) || !e.code) return null;
  const t: Trigger = { type: "key", code: e.code };
  if (e.ctrlKey) t.ctrl = true;
  if (e.shiftKey) t.shift = true;
  if (e.altKey) t.alt = true;
  if (e.metaKey) t.meta = true;
  return t;
}

/** Pen eraser tips report button 5 on most hardware; some only set buttons & 32. */
export function triggerFromPointer(e: PointerEvent): Trigger {
  const button = e.pointerType === "pen" && e.buttons & 32 ? 5 : e.button;
  return e.pointerType === "pen" ? { type: "pen", button } : { type: "mouse", button };
}

export function sameTrigger(a: Trigger, b: Trigger): boolean {
  if (a.type !== b.type) return false;
  if (a.type === "key" && b.type === "key") {
    return (
      a.code === b.code &&
      !!a.ctrl === !!b.ctrl &&
      !!a.shift === !!b.shift &&
      !!a.alt === !!b.alt &&
      !!a.meta === !!b.meta
    );
  }
  return (a as { button: number }).button === (b as { button: number }).button;
}

export function findAction(bindings: Bindings, t: Trigger): Action | null {
  for (const { action } of ACTIONS) {
    if (bindings[action].some((b) => sameTrigger(b, t))) return action;
  }
  return null;
}

/** Assign `t` to `action`, removing it from any other action first. */
export function withBinding(bindings: Bindings, action: Action, t: Trigger): Bindings {
  const next = cloneBindings(bindings);
  for (const a of Object.keys(next) as Action[]) {
    next[a] = next[a].filter((b) => !sameTrigger(b, t));
  }
  next[action].push(t);
  return next;
}

export function withoutBinding(bindings: Bindings, action: Action, t: Trigger): Bindings {
  const next = cloneBindings(bindings);
  next[action] = next[action].filter((b) => !sameTrigger(b, t));
  return next;
}

const KEY_NAMES: Record<string, string> = {
  ArrowRight: "→", ArrowLeft: "←", ArrowUp: "↑", ArrowDown: "↓",
  BracketLeft: "[", BracketRight: "]", Slash: "/", Backslash: "\\",
  Comma: ",", Period: ".", Semicolon: ";", Quote: "'", Backquote: "`",
  Minus: "-", Equal: "=", Space: "Space", Escape: "Esc", Enter: "Enter",
  Backspace: "Backspace", Tab: "Tab", PageUp: "PgUp", PageDown: "PgDn",
};

const MOUSE_NAMES = ["Left click", "Middle click", "Right click", "Mouse back", "Mouse forward"];
const PEN_NAMES: Record<number, string> = { 0: "Pen tip", 1: "Pen button 2", 2: "Pen barrel", 5: "Pen eraser" };

export function triggerLabel(t: Trigger): string {
  if (t.type === "mouse") return MOUSE_NAMES[t.button] ?? `Mouse ${t.button}`;
  if (t.type === "pen") return PEN_NAMES[t.button] ?? `Pen button ${t.button}`;
  const parts: string[] = [];
  if (t.ctrl) parts.push("Ctrl");
  if (t.meta) parts.push("Cmd");
  if (t.alt) parts.push("Alt");
  let name = KEY_NAMES[t.code] ?? t.code.replace(/^Key|^Digit|^Numpad/, (m) => (m === "Numpad" ? "Num " : ""));
  if (t.shift && t.code === "Slash") name = "?";
  else if (t.shift) parts.push("Shift");
  parts.push(name);
  return parts.join("+");
}
