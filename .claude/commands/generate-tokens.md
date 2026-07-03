---
description: Generate token JSON for a new HighRise mobile component from a Figma node
argument-hint: <Figma node link or id> [component name / category]
---

Generate the design-token JSON file for a new mobile component. The source of truth for values is
Figma; every design value must land as a token **reference**, never a raw hex or primitive.

**Follow the convention in `CLAUDE.md` at the repo root exactly. It governs value references,
allowed `type`s, the `value`/`type`/`description` leaf shape, and file placement.**

Input: `$ARGUMENTS` (a Figma node link/id, optionally followed by the component name/category).

## Steps

1. **Read the Figma node.** Use the Figma MCP (`get_design_context` / `get_variable_defs` /
   `get_screenshot`) on the provided node to extract its anatomy, variants (type/size/theme),
   states, and every visual property (colors, spacing, radii, borders, typography, shadows, icons).
   If the argument is missing or ambiguous, ask for the Figma link before generating anything.

2. **Load the token vocabulary.** Read `tokens/Primitive.json`, `tokens/Semantics/Semantic.json`,
   and `tokens/Semantics/Semantic-Colors/Light.json` so you know which paths exist. You will map
   each Figma value to one of these.

3. **Map each value to a reference.** For every property, find the token whose resolved value
   matches the Figma value:
   - **Prefer the semantic token** (`{color.*}`, `{padding.*}`, `{gap.*}`, `{size.*}`, `{font.*}`,
     `{border.radius.*}`) when one matches.
   - Fall back to a **primitive** (`{border.width.0[75]}`, `{size.icon.3xs}`, `{opacity.60}`) only
     when no semantic maps to it.
   - **Verify the path exists** before writing it — never invent a path. Match bracketed keys
     (`0[75]`, `0[375]`) exactly.
   - If a Figma value has **no matching token**, do NOT inline a hex/px. Stop and flag it: list the
     value and ask whether to add a primitive/semantic token or pick the nearest existing one.
   - Keep layout keywords, icon names, counts, and durations as **literals** (`type` `string` /
     `number` / `duration`) — see CLAUDE.md.

4. **Write the file** to `tokens/mobile-components/<category>/<component>/<component>.json`:
   - Top-level `$comment`, `$description`, and `$component` (with `name`, `figmaNodeId`,
     `figmaFile`, and the `variants` axes read from Figma).
   - Token tree grouped by anatomy → state/variant → property, keys in lowercase kebab-case.
   - Each leaf = `value` (reference or literal) + `type` + `description`, where `description` ends
     with the `- <token short name> - <resolved value>` traceability trail.

5. **Self-check before finishing** (the checklist at the bottom of CLAUDE.md):
   no raw hex or raw `px`/`rem` in any design value; every reference resolves; semantic preferred
   over primitive; every leaf has all three keys; valid JSON.

Report a short summary: file written, variant axes covered, and any values you had to flag for a
missing token. Do not create extra files or scaffolding beyond the one component JSON.
