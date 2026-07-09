// Build-time data pipeline for the HighRise design system docs.
// Reads token JSON from ../../../tokens (read-only) and emits src/data/*.json.
//
// Curation model: only "main" components (matching a page in the HighRise Mobile
// Components Figma file, plus two mandated extras) get their own docs page. Every
// other token file is a BASE component folded into its parent page — its tokens
// appear grouped on the parent's Tokens tab, and it is listed in the parent's
// anatomy section. Nothing is dropped: unmatched files roll up to a Utilities page.
import { readFileSync, writeFileSync, readdirSync, statSync, mkdirSync } from "node:fs";
import { join, relative, basename, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const TOKENS = join(ROOT, "..", "..", "..", "tokens");
const OUT = join(ROOT, "src", "data");
mkdirSync(OUT, { recursive: true });

const readJson = (p) => JSON.parse(readFileSync(p, "utf8"));

// ---------- flatten ----------
function isToken(node) {
  return (
    node &&
    typeof node === "object" &&
    "value" in node &&
    (typeof node.value !== "object" || Array.isArray(node.value) || node.type === "boxShadow" || node.type === "typography")
  );
}

function flatten(obj, prefix = [], out = []) {
  for (const [key, node] of Object.entries(obj)) {
    if (key.startsWith("$")) continue;
    if (node === null || typeof node !== "object") continue;
    if (isToken(node)) {
      out.push({
        path: [...prefix, key].join("/"),
        value: node.value,
        type: node.type ?? "",
        description: node.description ?? "",
      });
    } else {
      flatten(node, [...prefix, key], out);
    }
  }
  return out;
}

// ---------- primitives ----------
const primitiveRaw = readJson(join(TOKENS, "Primitive.json"));
const primitives = flatten(primitiveRaw);

// Lookup map keyed by dot path for {reference} resolution.
const primitiveByDot = new Map();
for (const t of primitives) primitiveByDot.set(t.path.replaceAll("/", "."), t);

function resolveRef(value, extra) {
  // Resolves {a.b.c} chains to a final scalar value; returns { value, ref }.
  let ref = null;
  let v = value;
  let guard = 0;
  while (typeof v === "string" && /^\{[^}]+\}$/.test(v.trim()) && guard++ < 12) {
    const key = v.trim().slice(1, -1);
    if (ref === null) ref = key;
    const hit = (extra && extra.get(key)) || primitiveByDot.get(key);
    if (!hit) break;
    v = hit.value;
  }
  return { value: v, ref };
}

// Resolve any primitive values that reference other primitives.
const primitivesOut = primitives.map((t) => ({
  ...t,
  resolved: resolveRef(t.value).value,
}));
writeFileSync(join(OUT, "primitives.json"), JSON.stringify(primitivesOut, null, 1));

// ---------- semantic colors (light + dark) ----------
const lightFlat = flatten(readJson(join(TOKENS, "Semantics", "Semantic-Colors", "Light.json")));
const darkFlat = flatten(readJson(join(TOKENS, "Semantics", "Semantic-Colors", "Dark.json")));
const darkByPath = new Map(darkFlat.map((t) => [t.path, t]));

// Semantic lookup (dot keyed, light values) so component refs can resolve through semantics.
const semanticLightByDot = new Map();
for (const t of lightFlat) semanticLightByDot.set(t.path.replaceAll("/", "."), t);

const semanticColors = lightFlat.map((t) => {
  const d = darkByPath.get(t.path);
  return {
    path: t.path,
    light: resolveRef(t.value).value,
    dark: d ? resolveRef(d.value).value : null,
    lightRef: typeof t.value === "string" ? t.value.replace(/[{}]/g, "") : null,
    darkRef: d && typeof d.value === "string" ? d.value.replace(/[{}]/g, "") : null,
    description: t.description,
  };
});
writeFileSync(join(OUT, "semantic-colors.json"), JSON.stringify(semanticColors, null, 1));

// ---------- semantic (non-color: spacing, size, font, border...) ----------
const semanticFlat = flatten(readJson(join(TOKENS, "Semantics", "Semantic.json")));
const semanticByDot = new Map();
const semanticOut = semanticFlat.map((t) => {
  const r = resolveRef(t.value);
  const row = { ...t, resolved: r.value };
  semanticByDot.set(t.path.replaceAll("/", "."), { value: t.value });
  return row;
});
writeFileSync(join(OUT, "semantic.json"), JSON.stringify(semanticOut, null, 1));

// ---------- components ----------
function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (name.endsWith(".json")) out.push(p);
  }
  return out;
}

const MOBILE = join(TOKENS, "mobile-components");
const files = walk(MOBILE).filter((p) => !/mapping|template/i.test(basename(p)));

// Resolver for component token references: semantic colors -> semantic -> primitives.
function resolveComponentValue(value) {
  let v = value;
  let guard = 0;
  while (typeof v === "string" && /^\{[^}]+\}$/.test(v.trim()) && guard++ < 12) {
    const key = v.trim().slice(1, -1);
    const hit = semanticLightByDot.get(key) || semanticByDot.get(key) || primitiveByDot.get(key);
    if (!hit) break;
    v = hit.value;
  }
  return v;
}

// ---------- Figma page map: HighRise Mobile Components (daEnmg5XxPvZ0Cn6mjyCNf) ----------
// One page per component. Node IDs are authoritative — do not invent new ones.
const FIGMA_PAGES = {
  "Toggle": "17:70088",
  "Content Switcher": "22:8533",
  "Tabs": "24:12525",
  "Button": "0:1",
  "Tag": "392:788",
  "Tag Group": "5975:10109",
  "Input Field": "4:2215",
  "List Item": "121:19996",
  "Bottom Navbar": "67:4988",
  "Input Form": "7:4427",
  "Checkbox": "126:27149",
  "Radio": "126:27358",
  "Icon": "225:20468",
  "Avatar": "365:5161",
  "Avatar Group": "5975:5601",
  "Select": "4485:36927",
  "Mobile Header": "52:29022",
  "Popover": "307:4293",
  "Input Stepper": "126:23659",
  "Modal": "292:3901",
  "Slider": "348:20775",
  "Progress Steps": "364:4714",
  "Progress Indicator": "383:1321",
  "Snackbar": "531:26406",
  "Alert": "429:10485",
  "Filter": "396:48092",
  "Tooltip": "531:56980",
  "Date Picker": "191:34530",
  "Date Range Selector": "309:17972",
  "Accordion": "413:3556",
  "File Uploader": "445:24219",
  "Drag Item": "437:19615",
  "OTP Input": "421:25135",
  "Rich Text Editor": "473:6452",
  "Time Picker": "467:5723",
  "Mobile Footer": "455:5401",
  "Text Area": "528:18668",
  "Empty State": "521:910",
  "System Alert": "603:53228",
  "Badge": "586:24631",
  "Message Card": "619:5572",
  "Sliding Button": "635:19738",
  "Timed Button": "641:1985",
  "Carousel": "737:9675",
  "Tile": "543:21231",
  "Toolbar": "858:16567",
  "Menu": "883:42478",
  "Breadcrumb": "911:34408",
  "Video Player": "926:784",
};

// Main components: raw slug (category--basename) -> { figma page name, optional display
// name override, optional slug override }. Everything not listed here is a base component.
const MAIN = {
  "avatar--avatar": { figma: "Avatar" },
  "avatar--avatar-group": { figma: "Avatar Group" },
  // User-mandated extras — they live on the Avatar page in Figma.
  "avatar--avatar-action-icon": { figma: "Avatar", name: "Avatar Action Icon" },
  "avatar--avatar-with-label": { figma: "Avatar", name: "Avatar With Label" },
  "badge--badge": { figma: "Badge" },
  "date-picker--date-picker": { figma: "Date Picker", name: "Date Picker" },
  "display--accordion": { figma: "Accordion" },
  "display--carousel": { figma: "Carousel" },
  "display--drag-item": { figma: "Drag Item" },
  "display--icon": { figma: "Icon" },
  "display--list-item": { figma: "List Item" },
  "display--message-card": { figma: "Message Card" },
  "display--system-alert": { figma: "System Alert" },
  "display--tile": { figma: "Tile" },
  "display--tooltip": { figma: "Tooltip" },
  "display--video-player": { figma: "Video Player" },
  "feedback--empty-state": { figma: "Empty State" },
  "form--button": { figma: "Button" },
  "form--checkbox": { figma: "Checkbox" },
  "form--file-upload": { figma: "File Uploader", name: "File Uploader" },
  "form--input": { figma: "Input Field", name: "Input Field" },
  "form--input-form": { figma: "Input Form" },
  "form--input-stepper": { figma: "Input Stepper" },
  "form--otp-input-mobile": { figma: "OTP Input", name: "OTP Input", slug: "form--otp-input" },
  "form--radio": { figma: "Radio" },
  "form--select": { figma: "Select" },
  "form--slider": { figma: "Slider" },
  "form--sliding-button": { figma: "Sliding Button" },
  "form--text-area": { figma: "Text Area" },
  "form--timed-button": { figma: "Timed Button" },
  "form--toggle": { figma: "Toggle" },
  "header--header": { figma: "Mobile Header", name: "Mobile Header" },
  "navigation--breadcrumb": { figma: "Breadcrumb" },
  "navigation--content-switcher": { figma: "Content Switcher", name: "Content Switcher" },
  "navigation--mobile-footer": { figma: "Mobile Footer" },
  "navigation--bottom-navigation-bar": { figma: "Bottom Navbar", name: "Bottom Navbar" },
  "navigation--tab": { figma: "Tabs", name: "Tabs" },
  "navigation--toolbar": { figma: "Toolbar" },
  "overlay--alert": { figma: "Alert" },
  "overlay--date-range-selector": { figma: "Date Range Selector" },
  "overlay--menu": { figma: "Menu" },
  "overlay--mobile-filter": { figma: "Filter", name: "Filter" },
  "overlay--modal": { figma: "Modal" },
  "overlay--popover": { figma: "Popover" },
  "overlay--snackbar": { figma: "Snackbar" },
  "overlay--time-picker-android": { figma: "Time Picker", name: "Time Picker", slug: "overlay--time-picker" },
  "progress--progress-indicator": { figma: "Progress Indicator" },
  "progress--progress-step": { figma: "Progress Steps", name: "Progress Steps" },
  "tag--tag": { figma: "Tag" },
  "tag--tag-group": { figma: "Tag Group" },
};

// Base components: raw slug -> raw slug of the main component that absorbs them.
// "utilities" routes to the synthetic Utilities page.
const PARENT = {
  "avatar--avatar-company-indicator": "avatar--avatar",
  "avatar--avatar-mask": "avatar--avatar",
  "avatar--avatar-online-indicator": "avatar--avatar",
  "date-picker--date-picker-dates": "date-picker--date-picker",
  "date-picker--date-picker-gap": "date-picker--date-picker",
  "date-picker--date-picker-menu": "date-picker--date-picker",
  "date-picker--date-picker-pin-wheel": "date-picker--date-picker",
  "date-picker--date-picker-pin-wheel-selector": "date-picker--date-picker",
  "display--carousel-arrow": "display--carousel",
  "display--carousel-dot-group": "display--carousel",
  "display--carousel-dot-indicator": "display--carousel",
  "display--carousel-empty-container": "display--carousel",
  "display--carousel-number-indicator": "display--carousel",
  "display--custom-slot": "utilities",
  "display--no-badge": "badge--badge",
  "display--notification": "utilities",
  "display--notification-action": "utilities",
  "display--video-player-controls": "display--video-player",
  "display--video-player-media": "display--video-player",
  "form--icon-knob": "form--slider",
  "form--knob": "form--slider",
  "form--knob-container": "form--slider",
  "form--input-form-hint-text": "form--input-form",
  "form--input-form-label": "form--input-form",
  "form--otp-input-field": "form--otp-input-mobile",
  "form--otp-loader": "form--otp-input-mobile",
  "form--stepper-action": "form--input-stepper",
  "header--header-action-group": "header--header",
  "header--header-lite": "header--header",
  "header--header-lite-left": "header--header",
  "navigation--breadcrumb-item": "navigation--breadcrumb",
  "navigation--content-switcher-item": "navigation--content-switcher",
  "navigation--menu-item-navbar": "navigation--bottom-navigation-bar",
  "navigation--tab-item": "navigation--tab",
  "overlay--date-range-selector-dates": "overlay--date-range-selector",
  "overlay--date-rage-selector-picker-footer": "overlay--date-range-selector",
  "overlay--date-range-selector-dates-gap": "overlay--date-range-selector",
  "overlay--date-time-range-picker": "overlay--date-range-selector",
  "overlay--filter-item": "overlay--mobile-filter",
  "overlay--filter-sub-item": "overlay--mobile-filter",
  "overlay--mobile-filter-base": "overlay--mobile-filter",
  "overlay--menu-item": "overlay--menu",
  "overlay--modal-footer": "overlay--modal",
  "overlay--modal-header": "overlay--modal",
  "overlay--pin-wheel-time-picker": "overlay--time-picker-android",
  "overlay--stepper-time-picker": "overlay--time-picker-android",
  "progress--progress-bar": "progress--progress-indicator",
  "progress--progress-bar-intermediate": "progress--progress-indicator",
  "progress--progress-circle": "progress--progress-indicator",
  "progress--progress-pill": "progress--progress-indicator",
  "progress--progress-single-step": "progress--progress-step",
  "progress--progress-step-bar": "progress--progress-step",
  "sub-account-switcher--sub-account-switcher": "utilities",
  "tag--tag-close": "tag--tag",
  "tag--tag-count": "tag--tag",
  "tag--tag-loader": "tag--tag",
};

// ---------- read all component files ----------
const rawComponents = files.map((p) => {
  const rel = relative(MOBILE, p);
  const category = rel.split("/")[0];
  const json = readJson(p);
  const meta = json.$component ?? {};
  const tokens = flatten(json).map((t) => ({
    ...t,
    resolved: resolveComponentValue(t.value),
  }));
  const rawSlug = `${category}--${basename(p, ".json")}`.toLowerCase().replace(/\s+/g, "-");
  const fallbackName = basename(p, ".json")
    .split("-")
    .join(" ")
    .replace(/^./, (c) => c.toUpperCase());
  return {
    rawSlug,
    name: meta.name || fallbackName,
    category,
    file: rel,
    figmaNodeId: meta.figmaNodeId ?? null,
    description: meta.description || json.$description || "",
    structure: meta.structure || "",
    sizes: meta.sizes ?? null,
    variants: meta.variants ?? null,
    usage: meta.usage ?? null,
    tokens,
  };
});

const byRawSlug = new Map(rawComponents.map((c) => [c.rawSlug, c]));

// Sanity: every file must be either a main or a base with a known parent.
for (const c of rawComponents) {
  if (!MAIN[c.rawSlug] && !PARENT[c.rawSlug]) {
    throw new Error(`build-data: unmapped component file ${c.file} (${c.rawSlug}) — add it to MAIN or PARENT`);
  }
}
for (const [child, parent] of Object.entries(PARENT)) {
  if (!byRawSlug.has(child)) console.warn(`build-data: PARENT entry ${child} has no matching file`);
  if (parent !== "utilities" && !MAIN[parent]) throw new Error(`build-data: parent ${parent} is not a MAIN component`);
}

// ---------- assemble curated main components ----------
function toBase(c) {
  return {
    key: c.rawSlug,
    name: c.name,
    file: c.file,
    description: c.description,
    structure: c.structure,
    variants: c.variants,
    tokenCount: c.tokens.length,
    tokens: c.tokens,
  };
}

const mains = [];
for (const [rawSlug, cfg] of Object.entries(MAIN)) {
  const c = byRawSlug.get(rawSlug);
  if (!c) {
    console.warn(`build-data: MAIN entry ${rawSlug} has no matching file`);
    continue;
  }
  const bases = Object.entries(PARENT)
    .filter(([, parent]) => parent === rawSlug)
    .map(([child]) => byRawSlug.get(child))
    .filter(Boolean)
    .map(toBase)
    .sort((a, b) => a.name.localeCompare(b.name));
  const figmaPageId = FIGMA_PAGES[cfg.figma] ?? null;
  mains.push({
    slug: cfg.slug ?? rawSlug,
    name: cfg.name ?? c.name,
    category: c.category,
    file: c.file,
    figmaPage: cfg.figma,
    figmaPageId,
    figmaNodeId: c.figmaNodeId,
    description: c.description,
    structure: c.structure,
    sizes: c.sizes,
    variants: c.variants,
    usage: c.usage,
    ownTokenCount: c.tokens.length,
    tokenCount: c.tokens.length + bases.reduce((n, b) => n + b.tokenCount, 0),
    tokens: c.tokens,
    bases,
  });
}

// Synthetic Utilities page for unmatched token files — nothing is dropped.
const utilityBases = Object.entries(PARENT)
  .filter(([, parent]) => parent === "utilities")
  .map(([child]) => byRawSlug.get(child))
  .filter(Boolean)
  .map(toBase)
  .sort((a, b) => a.name.localeCompare(b.name));
if (utilityBases.length) {
  mains.push({
    slug: "utilities--utilities",
    name: "Utilities",
    category: "utilities",
    file: "",
    figmaPage: null,
    figmaPageId: null,
    figmaNodeId: null,
    description:
      "Supporting token sets that don't belong to a single published component: custom slots, notifications, and the sub-account switcher. Their tokens are kept here so nothing in the token source goes undocumented.",
    structure: "",
    sizes: null,
    variants: null,
    usage: null,
    ownTokenCount: 0,
    tokenCount: utilityBases.reduce((n, b) => n + b.tokenCount, 0),
    tokens: [],
    bases: utilityBases,
  });
}

mains.sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));
writeFileSync(join(OUT, "components.json"), JSON.stringify(mains, null, 1));

// Lightweight index for the sidebar and index page (avoid shipping every token list twice).
const componentIndex = mains.map((m) => ({
  slug: m.slug,
  name: m.name,
  category: m.category,
  file: m.file,
  tokenCount: m.tokenCount,
  baseCount: m.bases.length,
  hasFigma: Boolean(m.figmaPageId),
  description: m.description.slice(0, 220),
}));
writeFileSync(join(OUT, "component-index.json"), JSON.stringify(componentIndex, null, 1));

console.log(
  `build-data: ${primitivesOut.length} primitives, ${semanticColors.length} semantic colors, ${semanticOut.length} semantic tokens, ${mains.length} main components (${rawComponents.length} token files, ${rawComponents.length - Object.keys(MAIN).length} folded as bases)`
);
