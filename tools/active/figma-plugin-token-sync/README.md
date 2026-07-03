# HighRise Token Sync — Figma plugin

Two-way sync between your **design-token JSON in GitHub** and **Figma variable collections**, plus an **Inspector** that visualizes a token's full alias chain (component → semantic → primitive → value) and lets you **reassign the alias inline** — solving the "I don't remember which semantic/primitive this points to" workflow without opening a second plugin or hopping files.

One plugin, four tabs: **Sync · Inspector · Settings · Log**.

---

## Load it (Figma desktop app)

1. Open the **Figma desktop app** (team-library access requires desktop).
2. Menu → **Plugins → Development → Import plugin from manifest…**
3. Select `figma-plugin-token-sync/manifest.json`.
4. Run it from **Plugins → Development → HighRise Token Sync**, inside a file that has variable collections (e.g. **HighRise Mobile Components**, with **HighRise 1.2 Foundations** enabled & published).

No build step — `code.js` and `ui.html` run directly.

---

## First-time setup (Settings tab)

1. **GitHub** — paste a fine-scoped **personal access token** (`repo`, or contents read/write), then **Owner**, **Repository**, **Default branch** (`main`), **Tokens directory** (`tokens`). Click **Save settings**, then **Test connection** (should report the repo name).
   - The PAT is stored only in Figma `clientStorage` on your machine — never committed.
2. **Mapping** — each local collection in the current file gets a row. Click **Auto-map from repo** (lists `.json` under the tokens dir and fuzzy-matches by name), review the paths, then **Save settings**.

---

## The four flows

### Sync tab
- **Refresh** — re-read variables from the current file.
- **Scan & diff** — for each ticked collection, compares Figma (default mode) vs the mapped JSON. If a baseline exists it's a **3-way** diff: `figma` / `git` / `conflict` / `*-add`. Conflicts get **Keep Figma / Keep Git** buttons.
- **Pull → open PR** — writes the current Figma state into the JSON files on a new branch and opens a PR (Figma → JSON). Preserves `$`-metadata and untouched leaves (merge, not overwrite).
- **Push ← JSON** — reads the JSON and applies it to Figma variables (create/alias/raw, idempotent) — JSON → Figma.
- **Apply resolutions** — pushes the "Keep Git" winners to Figma and pulls the "Keep Figma" winners to JSON.
- **Save baseline** — records the converged state to `.sync/baseline.json` (via PR) so future diffs are 3-way and real conflicts get detected.

### Inspector tab (the designer workflow)
1. Pick a **collection**, **mode**, and a **token** (filterable list).
2. The **Resolved chain** shows every hop with swatches and the final raw value — so you instantly see what semantic/primitive it points at and what color/number that resolves to.
3. **Reassign alias** — search any semantic or primitive (local or Foundations library) and click to point this token at it (applies to the selected mode). Or **set a raw value**.
4. Changes write straight to Figma; the snapshot refreshes. Then use **Pull** to land them in JSON.

---

## How it's wired

- **Main thread (`code.js`)** — all `figma.variables.*` read/write, chain resolution, push, inspector edits, settings persistence. No network.
- **UI thread (`ui.html`)** — all GitHub calls (`fetch` → `api.github.com`, multi-file commit via the Git Trees API + PR), JSON↔tree conversion, the 3-way reconcile engine, all rendering.
- They talk over `postMessage`. GitHub is the reconciliation hub; the PR is the review gate.

---

## Known limitations (v1 — by design, for the first test)

- **Multi-mode collections** (e.g. Foundations light/dark): diff/pull use the **default mode only**. Multi-mode JSON round-trip is the next iteration (the Inspector still shows/edits per selected mode).
- **Typography & shadow** tokens are skipped from variable sync (Figma stores them as styles, not variables) — same as the Component Token Linker.
- **`transparent`**: Figma `{0,0,0,0}` serializes to `#00000000` while JSON may have `#FFFFFF00` — shows as a (harmless) diff. Normalize if it's noisy.
- **Pull never deletes** JSON leaves that disappeared from Figma — it only adds/updates (safety). Removals are a manual follow-up.
- **Reused variable with a changed type** (e.g. was STRING, now aliasing a COLOR) may error on that one token — caught and logged, not fatal.
- Requires the **desktop app** (Professional plan → no headless REST path; this is expected).

---

## What to capture during your test

Run it once and note: (1) any red `✗ ERROR` lines in the **Log** tab (copy them verbatim), (2) whether Scan & diff matches what you expect, (3) whether Pull opens a correct PR, (4) whether Push updates the right variables, (5) whether the Inspector chain resolves fully and reassignment sticks. Paste that back and we iterate.
