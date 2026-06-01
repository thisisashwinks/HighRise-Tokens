# Import Tokens — Figma Plugin

Eliminates the manual Tokens Studio → Foundations staging → ZIP → re-import round-trip.
Running inside **Mobile Components V2 Exp 2** (with Foundations published and enabled),
the plugin reads a component token JSON, resolves every `{dot.path}` reference directly
against the live Foundations library variables, and creates a local collection whose
variables are **cross-file aliases** — no staging file, no ZIP, no cleanup.

---

## How to load (Figma desktop)

1. Open **Figma desktop app** (the plugin API requires the desktop app for team library access).
2. Menu → **Plugins → Development → Import plugin from manifest…**
3. Navigate to this folder and select `manifest.json`.
4. The plugin appears under **Plugins → Development → Component Token Linker**.

---

## How to use

### Prerequisites
- You must be inside the **Mobile Components V2 Exp 2** file.
- The **HighRise 1.2 Foundations** library must be **enabled** in this file:
  Assets panel (`Shift + I`) → Libraries → enable "HighRise 1.2 Foundations".
- The Foundations library must have **published** its variable collections.

### Workflow

1. Open the plugin (Plugins → Development → Component Token Linker).
2. **Paste** the contents of a component token file (e.g. `tokens/mobile-components/menu-item-navbar.json`) into the textarea.
   - The **Collection name** field auto-fills from `$component.name` in the JSON (e.g. "Menu Item Navbar"). Override it if needed.
3. **Dry run is ON by default.** Click **Run** to preview:
   - Every token leaf is shown with its resolved Foundations variable, type, and source collection.
   - Unresolved references are listed clearly — they will block a live run.
   - The final "Go/no-go" line tells you if it's safe to proceed.
4. When the dry run shows 0 unresolved, **uncheck Dry run** and click **Run** again.
   - The plugin creates the local collection and sets every variable as a `VARIABLE_ALIAS` pointing to the imported Foundations variable.
   - Existing variables in the collection are reused (idempotent — safe to re-run).
5. Verify the collection appears in the Variables panel with blue alias chips.

---

## Schema locked from this repo (Step 0 findings)

### Token file format

Confirmed from `tokens/mobile-components/menu-item-navbar.json` and `button.json`:

**Leaf token shape:**
```json
{
  "value": "{color.background.neutral.base}",
  "type": "color",
  "description": "Human-readable description (optional)"
}
```

A leaf is any object that has a direct `"value"` key. The `value` is always a string
containing a reference in `{dot.separated.path}` format.

**Metadata block** (top-level, skipped entirely):
```json
{
  "$comment": "plain string — skipped",
  "$description": "plain string — skipped",
  "$component": {
    "name": "Menu Item Navbar",
    "description": "...",
    "structure": "...",
    "sizes": {},
    "variants": {},
    "usage": {}
  }
}
```
All keys starting with `$` are skipped at every depth level.

**Intermediate nodes** (non-leaf groups) may have a `$comment` sibling alongside real
token children. Example from `menu-item-navbar.json`:
```json
"gap": {
  "$comment": "Gap tokens for mobile menu item navbar",
  "value": "{gap.xs}",
  "type": "dimension",
  "description": "..."
}
```
The plugin correctly identifies this as a leaf (it has `"value"` at this level) even
though `$comment` is present.

**Token types seen in component files:**
`color`, `dimension`, `position`, `typography`, `unknown`

These are JSON-level labels only. The plugin ignores them when creating Figma variables —
it uses `importedVar.resolvedType` (one of `COLOR`, `FLOAT`, `STRING`, `BOOLEAN`) instead,
ensuring the local variable type matches the target and the alias is valid.

### Variable naming convention

**In token JSON:** dot-separated path, e.g. `{color.background.neutral.base}`

**In Figma library:** slash-separated, e.g. `color/background/neutral/base`

The plugin converts by: strip `{ }`, replace `.` with `/`.

**Collection structure confirmed from `tokens/Semantics/Semantic.json`:**
Foundation variables use consistent groupings: `size/`, `padding/`, `gap/`, `border/`,
`color/`, `font/`, `position/`, and `size/height/`, `size/width/` sub-groups.

### Reference resolution priority (collision handling)

When the same variable name exists in multiple enabled library collections:

| Priority | Collection type         |
|----------|-------------------------|
| 3 (highest) | Semantic-Colors     |
| 2           | Semantic            |
| 1           | Primitive           |
| 0 (lowest)  | Any other collection |

---

## Assumptions made

1. **Single mode.** The plugin writes all aliases to `collection.defaultModeId`. If your
   Mobile Components file later needs multiple modes (e.g. Light / Dark), you will need
   to extend the plugin to copy values across additional modes.

2. **Collection name as identity.** Idempotency is based on matching the collection name
   exactly. If you rename a collection in Figma and re-run the plugin, it will create a
   second collection rather than updating the renamed one.

3. **Library variable names use "/" separators.** This is Figma's documented convention.
   If any library collection uses a non-standard separator (e.g. ".", "—"), those variables
   will appear as unresolved in the dry-run report.

4. **No multi-mode token files.** The component token JSON files in this repo define a
   single value per token (no `$value` multi-mode object). If that changes, the `flattenTokens`
   function will need updating.

5. **`typography` tokens may not resolve.** If the Foundations library exposes typography
   tokens as STRING variables, they will resolve. If there are no matching library variables,
   they appear in the unresolved list in dry run — which is safe and expected.

6. **`position` tokens** (`position.x.*`, `position.y.*`) are expected to resolve to FLOAT
   variables in the library. If they don't exist in Foundations as published variables, they
   show as unresolved.

---

## How to test with `menu-item-navbar.json`

1. Open **Mobile Components V2 Exp 2** in the Figma desktop app.
2. Confirm the Foundations library is enabled (Assets → Libraries).
3. Launch the plugin (Plugins → Development → Component Token Linker).
4. Copy the full contents of `tokens/mobile-components/menu-item-navbar.json` and paste into the textarea. The collection name should auto-fill to **"Menu Item Navbar"**.
5. With **Dry run checked**, click **Run**. Expect: all `color/*` references resolve to `COLOR` variables in Semantic-Colors; `gap/*`, `border/*`, `size/*`, `padding/*` resolve to `FLOAT` variables in Semantic or Primitive. Any `position.*` or `font.*` tokens that lack library entries appear in the unresolved list — note them for follow-up, but the color variables still work.
6. If the go/no-go line shows all resolved (or only acceptable unresolvable types), **uncheck Dry run** and click **Run**. The "Menu Item Navbar" collection appears in the Figma Variables panel with blue alias badges pointing to the Foundations library.

---

## File structure

```
figma-plugin/component-token-linker/
├── manifest.json   — plugin manifest (Figma config, no build step)
├── code.js         — plugin main thread (plain JS, all logic)
├── ui.html         — single-file plugin UI (textarea, controls, log)
└── README.md       — this file
```

No Node.js, no bundler, no TypeScript. Load directly from `manifest.json`.
