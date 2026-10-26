# Whiteboard

A minimalist whiteboard for mouse and pen tablets.

- The whole window is the canvas. No panning, no zooming.
- Multiple canvases. Switch between them from the thumbnail bar at the top, or with the scroll wheel.
- Five colours and a pen-size slider in the bottom toolbar.
- Undo only. No eraser, no clearing, no deleting canvases.
- Pen pressure controls stroke width. Mouse strokes have a constant width.
- Session only. Nothing is saved: a reload starts with a blank canvas.

## Default controls

| Action | Mouse | Keyboard | Pen |
| --- | --- | --- | --- |
| Draw | Left click | | Tip |
| Undo | Right click | Ctrl+Z / Cmd+Z | |
| Next canvas | Scroll down, forward button | → / Page Down | |
| Previous canvas | Scroll up, back button | ← / Page Up | |
| New canvas | | N | |
| Colours | | 1–5 | |
| Bigger / smaller pen | | ] / [ | |
| Help and bindings | | ? | |

Open the help panel (the `?` button or key) to bind any key, mouse button or pen button to any action. Pen buttons have no default bindings. Tablet express keys usually send keyboard shortcuts, so map them to keys in your tablet driver. Bindings reset when the page reloads.

## Development

```sh
npm install
npm run dev       # local dev server
npm run build     # static export to out/
npm run preview   # build, then serve out/ with wrangler dev
npm run lint
```

Built with Next.js (App Router, static export) and TypeScript.

## Deployment

The site is a static export served by a Cloudflare Worker (`wrangler.jsonc`, Worker name `whiteboard-deltadelta-dev`). Cloudflare builds and deploys it on every push to `main`.
