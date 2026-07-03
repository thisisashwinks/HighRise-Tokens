# HighRise Component Tokens — Authoring Convention

This repo holds design-token JSON for HighRise components under `tokens/`. This file is the
**always-on** rule for writing or editing any token JSON. The `/generate-tokens` slash command is
the guided entry point for creating a brand-new component; it follows these same rules.

## The one rule that matters most

**A design value is NEVER inlined. It is always a token reference in braces.**

```jsonc
// ❌ WRONG — raw hex or raw primitive
{ "value": "#ffffff", "type": "color" }
{ "value": "3px",     "type": "dimension" }
{ "value": "22px",    "type": "borderRadius" }

// ✅ RIGHT — reference an existing Primitive / Semantic / Semantic-Color token
{ "value": "{color.text.neutral.base}",  "type": "color" }
{ "value": "{border.width.0[75]}",       "type": "borderWidth" }
{ "value": "{border.radius.full}",       "type": "borderRadius" }
```

This is the mistake being corrected across the mobile components: values had been written as hex
codes or raw pixel primitives instead of token references. Do not reintroduce it.

### Which types MUST be references
Any leaf whose `type` is one of these **must** have a `{…}` reference as its `value`:
`color`, `dimension`, `borderColor`, `borderWidth`, `borderRadius`, `shadow`, `boxShadow`,
`typography`, `outline`, `opacity`.

### Which values stay literal (do NOT wrap in braces)
Non-design, non-tokenizable values stay raw. These use `type` `string`, `number`, or `duration`:
- Layout keywords — `center`, `row`, `column`, `start`, `flex-1`, `clip`, `right`
- Icon names — `info-circle`, `check-circle`, `x-circle`, `plus`, `minus`
- Animation keywords — `linear`, `infinite`
- Counts / raw numbers — `3`, `10`
- Durations / percentages — `1s`, `4.69%`

If you are ever unsure whether something is a design value, it is: prefer a token reference.

## Reference resolution — where `{…}` points

References resolve against these namespaces (root key = first segment of the path):

| Root | Source file | Examples |
|---|---|---|
| `color`, `boxShadow` | `tokens/Semantics/Semantic-Colors/Light.json` (+ `Dark.json`) | `{color.background.primary.moderate.1}`, `{color.text.neutral.base}`, `{color.border.neutral.subtle.1}`, `{color.icon.neutral.base}` |
| `size`, `padding`, `margin`, `gap`, `border`, `font`, `position`, `backdrop-filter`, `motion` | `tokens/Semantics/Semantic.json` | `{size.icon.3xs}`, `{padding.x.4xs}`, `{gap.2}`, `{font.body.medium.sm}`, `{border.radius.full}` |
| `color`, `spacing`, `border`, `font`, `size`, `opacity`, `blur`, `spread`, `z-index`, `breakpoint`, `position`, `color-shadow`, `motion` | `tokens/Primitive.json` | `{border.width.0[75]}`, `{blur.2}`, `{opacity.60}` |

**Prefer the semantic token over the primitive** whenever an equivalent semantic exists (e.g. use
`{color.background.primary.moderate.1}`, not a raw primitive blue). Fall back to a primitive
(`{border.width.0[75]}`, `{size.icon.3xs}`) only when no semantic token maps to the value.

**Every reference must resolve to a real path.** Before using `{a.b.c}`, confirm `a.b.c` exists in
one of the files above. Bracketed numeric segments (`0[75]`, `0[375]`, `4[5]`) are real key names —
match them exactly. Never invent a path.

## Leaf shape — always these three keys

```jsonc
"radius": {
  "value": "{border.radius.full}",
  "type": "borderRadius",
  "description": "Mobile badge border radius - full - 100%"
}
```

- **`value`** — a `{…}` reference (design values) or a literal (keywords/counts, see above).
- **`type`** — one of: `color`, `dimension`, `typography`, `borderRadius`, `borderWidth`,
  `borderColor`, `boxShadow`, `shadow`, `outline`, `opacity`, `string`, `number`, `duration`.
- **`description`** — plain-English meaning, then a traceability trail ending in
  `- <token short name> - <resolved value>`. Example: `Mobile badge hint size - 3xs - 12px`.
  The trailing resolved value is documentation only; the real value lives in the reference.

## File-level metadata (top of every component file)

```jsonc
{
  "$comment": "Design token file for the <Component> component",
  "$description": "<what it is, its types/sizes/themes, and any nested-component notes>",
  "$component": {
    "name": "<Component>",
    "figmaNodeId": "<node-id from Figma>",
    "figmaFile": "HighRise Mobile Components",
    "variants": { "type": [...], "size": [...], "theme": [...] }
  },
  "<component-key>": { /* token tree */ }
}
```

## Structure & naming

- File path: `tokens/mobile-components/<category>/<component>/<component>.json`.
  Categories: `avatar`, `badge`, `display`, `feedback`, `form`, `header`, `navigation`,
  `overlay`, `progress`, `sub-account-switcher`, `tag`.
- Keys are lowercase kebab-case (`padding-x`, `border-radius`, `icon-size`).
- Group by anatomy → state/variant → property (e.g. `theme.primary.background`,
  `label.md.padding-x`). Mirror the Figma variant axes.

## Before you finish — self-check
1. Every `color`/`dimension`/`border*`/`*shadow`/`typography`/`outline`/`opacity` value is a `{…}` reference — zero raw hex, zero raw `px`/`rem`.
2. Every reference path exists in Primitive / Semantic / Semantic-Color (spot-check the tricky ones).
3. Semantic chosen over primitive where one exists.
4. Every leaf has `value` + `type` + `description`, and each `description` ends with the `- name - resolved` trail.
5. Valid JSON (no trailing commas), file-level `$comment`/`$description`/`$component` present.
