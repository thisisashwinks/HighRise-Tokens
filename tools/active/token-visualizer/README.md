# HighRise Token Visualizer

A web app that shows your design tokens as a **node graph**: component tokens → semantic tokens → primitive tokens, with the resolved value (and a Light/Dark mode toggle). Pick any component from a dropdown, filter tokens, click a node to trace its full chain, and use the **Q&A / lookup** sidebar to answer "what semantic/primitive does this point to, and what value does it resolve to?" — without hopping between Figma files or JSON.

Read-only. Token data is **bundled at build** from the repo's `tokens/` folder, so a push that changes tokens + a redeploy refreshes the graph. Built with Next.js + React Flow, deployable to Vercel.

---

## Run locally

```bash
cd tools/active/token-visualizer
npm install
npm run dev        # runs the token build step, then starts on http://localhost:3000
```

`npm run dev` / `npm run build` first run `scripts/build-tokens.mjs`, which reads the repo's `tokens/` folder (`../../../tokens` relative to this app) and writes `src/data/graph.json`. To rebuild token data only: `npm run tokens`.

---

## What it reads

| Source | Becomes |
|---|---|
| `tokens/Primitive.json` | primitive nodes (raw hex / numbers) |
| `tokens/Semantics/Semantic.json` | non-color semantics (size, spacing, border, motion…) |
| `tokens/Semantics/Semantic-Colors/{Light,Dark}.json` | semantic color nodes, with per-mode values |
| `tokens/mobile-components/**` and `tokens/web-components/**` | component nodes (the dropdown) |

References (`{color.background.primary.default}`) are resolved across all layers. Unresolved refs render as red **"Unresolved"** nodes — useful for spotting the exact drift your sanity pass is fixing.

---

## Deploy to Vercel

1. Push the repo to GitHub (the app lives in `tools/active/token-visualizer/`).
2. In Vercel → **New Project** → import the repo → set **Root Directory = `tools/active/token-visualizer`**.
3. Framework preset: **Next.js** (auto-detected). Build command and output are default.
   - The build runs `prebuild` → reads `../../../tokens` (present because Vercel checks out the whole repo). If your tokens live elsewhere, set env `TOKENS_DIR`.
4. **Password gate** (recommended — token data is internal): add env vars
   - `VIZ_USER` = e.g. `highrise`
   - `VIZ_PASS` = a shared password
   - With both set, `middleware.ts` requires Basic Auth on every route. Leave either empty to make it public.
5. Deploy. Re-deploy (or push) whenever tokens change to refresh the graph.

---

## Roadmap (kept intentionally out of v1)

- **All components** view — the dropdown has the entry; it renders every component + shared nodes at once and is heavy, so it's stubbed for now.
- **Editing / write-back** — reassigning aliases from the web app and opening a GitHub PR (that lives in the Figma sync plugin for now).
- **Multi-mode beyond Light/Dark**, deep-linking to a token, and saved views.

---

## Known data issues found at build (your sanity list)

These three token files currently fail to parse and are skipped (the other ~130 components work):

- `tokens/mobile-components/display/empty-state/empty state.json` — empty / truncated file
- `tokens/mobile-components/form/checkbox/checkbox.json` — extra content after JSON (~line 256)
- `tokens/mobile-components/tag/tag.json` — missing `,` or `}` (~line 3095)

Fix those and they'll appear automatically on the next build.
