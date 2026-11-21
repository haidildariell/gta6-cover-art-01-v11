# Tideline Cover Press — VELVET TIDE

[![Make GTA 6 Cover Art](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01)
[![Rank](https://make.fun/badge/gta6-cover-art-01/haidildariell/gta6-cover-art-01-v11/rank.svg)](https://make.fun/bounty/gta6-cover-art-01)
[![Reward](https://make.fun/badge/gta6-cover-art-01/haidildariell/gta6-cover-art-01-v11/reward.svg)](https://make.fun/bounty/gta6-cover-art-01)

An offline web app that turns any photo and caption into GTA 6-style cover art: a six-panel golden-hour poster with bold chrome lettering, exported as a PNG to share.

## Run it

```sh
node serve.ts
# open http://localhost:8080
```

No build step, no network requests, no uploads — photos never leave the machine. Requires Node.js 22+ and a desktop browser.

## What it does

- **Six-panel mosaic cover** — one tall hero panel (the Boss, face ~30% of the frame wide and 100% visible) flanked by five cast panels: the Driver, the Courier, the Rider, the Mechanic and the Lookout. All six faces fully visible; the chrome title sits in a band *below* the hero's chin, never over a face.
- **One hard sunset grade, every panel** — the same Golden Hour grade (saturation, contrast, warm wash) is forced onto all six panels and verified by pixel sampling, so the cover reads as one poster, not a collage.
- **Any photo** — click a panel to replace its photo with one of yours, then crop it with zoom and pan sliders. Undo/redo included.
- **Lettering you can edit** — title, press quote, script line and tagline are all editable in the editor; the title renders as opaque chrome with a magenta slab and black outline.
- **Three post sizes in one click** — Landscape 1920 × 1080, Square 1080 × 1080 and Story 1080 × 1350, each exported as a PNG.
- **Three layouts, four grades** — Mosaic Tilt (default), Straight Grid and Cinema Hero; Golden Hour (default), Neon Dusk, Palm Heat and Vintage Fade.
- **Poster furniture** — press strip with quote and gazette, gold "Best Cover" seal, 18+ box, barcode and billing block.

## The default cover

**VELVET TIDE** — *"EVERY FRAME DRIPS WITH SUNLIGHT AND SIN" — Tideline Gazette*, script line *"salt on the wind"*, tagline *"SIX STRANGERS · ONE BURNING COAST · EVERY DEBT COMES DUE"*. The six cast photos were generated for this cover in the build session; the app ships with them as its default cast, and any of them can be swapped for the user's own photo.

## Files

- `app/` — the static web app (`index.html`, `style.css`, `src/cover.js` the cover engine, `src/main.js` the editor, `src/shots.js` the screenshot scenes, `cast/` the six default cast photos)
- `screenshots/` — the cover (landscape), the editor with a photo loaded, the story cover and the square cover
- `main.ts` — the program that hands the app in (copies `app/` + `screenshots/` and writes `dossier.json`)
- `serve.ts` — a tiny static server for local use

## Originality

All art, lettering and photos in this entry are original work made for it. No Rockstar Games logo, official artwork, character or font is used anywhere.

## License

MIT — see [LICENSE](LICENSE).

---

Built for [Make GTA 6 Cover Art](https://make.fun/bounty/gta6-cover-art-01) on make.fun.
