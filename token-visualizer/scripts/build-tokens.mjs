// ════════════════════════════════════════════════════════════════════════════
// build-tokens.mjs — bundle the repo's token JSON into src/data/graph.json
// Runs on `predev` and `prebuild` (so Vercel rebuilds pick up token pushes).
// Reads:  Primitive.json, Semantics/Semantic.json, mobile-components/**, web-components/**
// Writes: src/data/graph.json  { base, components }
// ════════════════════════════════════════════════════════════════════════════
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname, basename, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const APP_ROOT = join(__dirname, '..');

function findTokensDir() {
  const candidates = [
    process.env.TOKENS_DIR,
    join(APP_ROOT, '..', 'tokens'),   // app lives in repo/token-visualizer → repo/tokens
    join(APP_ROOT, 'tokens'),
    join(APP_ROOT, '..', '..', 'tokens'),
  ].filter(Boolean);
  for (const c of candidates) {
    if (existsSync(join(c, 'Primitive.json'))) return c;
  }
  return null;
}

function readJson(p) {
  try { return JSON.parse(readFileSync(p, 'utf8')); }
  catch (e) { console.warn('  ⚠ could not read ' + p + ': ' + e.message); return null; }
}

function walkJson(dir) {
  const out = [];
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) out.push(...walkJson(full));
    else if (/\.json$/i.test(name)) out.push(full);
  }
  return out;
}

// flatten a token tree into { "dot.path": {value,type,description} }
function flatten(obj, prefix, out) {
  out = out || {}; prefix = prefix || '';
  if (!obj || typeof obj !== 'object') return out;
  for (const k of Object.keys(obj)) {
    if (k.startsWith('$')) continue;
    const v = obj[k];
    if (!v || typeof v !== 'object') continue;
    const path = prefix ? prefix + '.' + k : k;
    if (typeof v.value !== 'undefined') {
      out[path] = { value: v.value, type: (v.type || 'unknown'), description: (v.description || '') };
    } else {
      flatten(v, path, out);
    }
  }
  return out;
}

function main() {
  const TOK = findTokensDir();
  if (!TOK) {
    console.error('✗ Could not locate a tokens directory (looked for Primitive.json). Set TOKENS_DIR.');
    // still emit an empty graph so the app builds
    emit({ base: {}, components: [], error: 'tokens directory not found at build time' });
    return;
  }
  console.log('• tokens dir: ' + TOK);

  // ── base layer: primitives + semantics ──────────────────────────────────────
  const base = {};
  const prim = readJson(join(TOK, 'Primitive.json'));
  if (prim) for (const [p, def] of Object.entries(flatten(prim))) base[p] = { ...def, layer: 'primitive' };

  // non-color semantics (size, spacing, border, motion, …)
  let semPath = join(TOK, 'Semantics', 'Semantic.json');
  if (!existsSync(semPath) && existsSync(join(TOK, 'Semantic.json'))) semPath = join(TOK, 'Semantic.json');
  const sem = readJson(semPath);
  if (sem) for (const [p, def] of Object.entries(flatten(sem))) base[p] = { ...def, layer: 'semantic' };

  // semantic COLORS are mode-split (Light/Dark) — merge with per-mode values
  const scDir = join(TOK, 'Semantics', 'Semantic-Colors');
  const lightF = readJson(join(scDir, 'Light.json'));
  const darkF = readJson(join(scDir, 'Dark.json'));
  if (lightF) {
    const lf = flatten(lightF);
    const df = darkF ? flatten(darkF) : {};
    let n = 0;
    for (const [p, def] of Object.entries(lf)) {
      base[p] = {
        value: def.value,                          // default = Light (used by simple resolution)
        type: def.type, description: def.description, layer: 'semantic',
        modes: { Light: def.value, Dark: (df[p] ? df[p].value : def.value) },
      };
      n++;
    }
    console.log('• semantic colors (Light/Dark): ' + n);
  } else {
    console.warn('  ⚠ no Semantic-Colors/Light.json found — color semantics will be unresolved.');
  }

  console.log('• base tokens: ' + Object.keys(base).length +
    ' (primitive ' + Object.values(base).filter(b => b.layer === 'primitive').length +
    ', semantic ' + Object.values(base).filter(b => b.layer === 'semantic').length + ')');

  // ── component layer: mobile + web ───────────────────────────────────────────
  const components = [];
  for (const [platform, dir] of [['mobile', join(TOK, 'mobile-components')], ['web', join(TOK, 'web-components')]]) {
    const files = walkJson(dir);
    for (const f of files) {
      const json = readJson(f);
      if (!json) continue;
      const rel = relative(TOK, f).replace(/\\/g, '/');
      // skip mapping/template helper files
      if (/mapping|template/i.test(basename(f))) continue;
      const name = (json.$component && json.$component.name)
        || basename(f, '.json').replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      const tokens = Object.entries(flatten(json)).map(([path, def]) => ({
        path, value: def.value, type: def.type, description: def.description,
      }));
      if (!tokens.length) continue;
      components.push({
        id: platform + ':' + rel,
        name, platform, file: rel, tokenCount: tokens.length, tokens,
      });
    }
  }
  components.sort((a, b) => a.platform.localeCompare(b.platform) || a.name.localeCompare(b.name));
  console.log('• components: ' + components.length +
    ' (mobile ' + components.filter(c => c.platform === 'mobile').length +
    ', web ' + components.filter(c => c.platform === 'web').length + ')');

  emit({ generatedAt: new Date().toISOString(), base, components });
}

function emit(data) {
  const dataDir = join(APP_ROOT, 'src', 'data');
  if (!existsSync(dataDir)) mkdirSync(dataDir, { recursive: true });
  writeFileSync(join(dataDir, 'graph.json'), JSON.stringify(data));
  console.log('✓ wrote src/data/graph.json');
}

main();
