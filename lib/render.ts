import { getStroke } from "perfect-freehand";
import type { Stroke } from "./types";

// How much pressure affects width for pen strokes. At pressure 1 a pen stroke
// is exactly `stroke.size` wide (same as a mouse stroke); at 0 it is ~18%.
const PEN_THINNING = 0.7;

function toTuples(flat: number[]): number[][] {
  const out: number[][] = [];
  for (let i = 0; i < flat.length; i += 3) out.push([flat[i], flat[i + 1], flat[i + 2]]);
  return out;
}

/** Build the filled outline of a stroke. `complete` = the pointer has lifted. */
export function strokePath(stroke: Stroke, complete = true): Path2D {
  const outline = getStroke(toTuples(stroke.points), {
    // perfect-freehand's radius at pressure p is size * (0.5 - thinning * (0.5 - p)),
    // so dividing by (1 + thinning) makes full pressure match the nominal size.
    size: stroke.pressure ? stroke.size / (1 + PEN_THINNING) : stroke.size,
    thinning: stroke.pressure ? PEN_THINNING : 0,
    smoothing: 0.5,
    streamline: stroke.pressure ? 0.35 : 0.5,
    simulatePressure: false,
    last: complete,
  });
  const path = new Path2D();
  if (outline.length === 0) return path;
  path.moveTo(outline[0][0], outline[0][1]);
  for (let i = 1; i < outline.length; i++) {
    const [x0, y0] = outline[i];
    const [x1, y1] = outline[(i + 1) % outline.length];
    path.quadraticCurveTo(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
  }
  path.closePath();
  return path;
}

export function renderStroke(ctx: CanvasRenderingContext2D, stroke: Stroke, complete = true) {
  ctx.fillStyle = stroke.color;
  ctx.fill(strokePath(stroke, complete));
}

/** Draws strokes in the context's current transform (apply ctx.scale for thumbnails). */
export function renderStrokes(ctx: CanvasRenderingContext2D, strokes: Stroke[]) {
  for (const s of strokes) renderStroke(ctx, s);
}
