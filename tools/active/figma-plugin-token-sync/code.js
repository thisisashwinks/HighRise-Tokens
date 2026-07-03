// ════════════════════════════════════════════════════════════════════════════
// HighRise Token Sync — main thread (Figma plugin sandbox)
// ----------------------------------------------------------------------------
// Responsibilities (Figma-side only; all GitHub I/O happens in the UI iframe):
//   • Read every local variable collection in the current file into a snapshot
//   • Resolve full alias chains (component → semantic → primitive → raw value)
//   • Apply a "push" plan (create/update local variables, alias or raw)
//   • Reassign an alias / set a raw value for a single variable (Inspector)
//   • Persist user settings (PAT, repo, mappings) in per-user clientStorage
//
// The UI thread owns: GitHub calls, JSON<->tree conversion, 3-way reconcile,
// conflict resolution, baseline. Main and UI communicate via postMessage.
// ════════════════════════════════════════════════════════════════════════════

figma.showUI(__html__, { width: 920, height: 760, title: 'HighRise Token Sync' });

const SETTINGS_KEY = 'highrise-token-sync-settings-v1';
const CHAIN_MAX_DEPTH = 24;

function send(type, payload) {
  figma.ui.postMessage(Object.assign({ type: type }, payload || {}));
}
function log(message) { send('log', { message: message }); }

// ─── type mapping (mirrors the Component Token Linker) ────────────────────────
const FLOAT_TYPES = [
  'dimension', 'spacing', 'sizing', 'borderradius', 'borderwidth',
  'gap', 'padding', 'position', 'number', 'size', 'opacity',
  'float', 'integer', 'percent', 'linehheight', 'lineheight'
];
const UNSUPPORTED_TYPES = [
  'typography', 'fontfamilies', 'fontfamily', 'fontweights', 'fontweight',
  'fontsizes', 'fontsize', 'lineheights', 'letterspacing',
  'paragraphspacing', 'textdecoration', 'textcase',
  'shadow', 'boxshadow', 'dropshadow', 'innershadow'
];
function isUnsupportedType(t) { return UNSUPPORTED_TYPES.indexOf((t || '').toLowerCase()) !== -1; }
function tokenTypeToFigmaType(t) {
  const x = (t || '').toLowerCase();
  if (x === 'color') return 'COLOR';
  if (x === 'boolean') return 'BOOLEAN';
  if (FLOAT_TYPES.indexOf(x) !== -1) return 'FLOAT';
  return 'STRING';
}
function figmaTypeToTokenType(rt) {
  if (rt === 'COLOR') return 'color';
  if (rt === 'FLOAT') return 'dimension';
  if (rt === 'BOOLEAN') return 'boolean';
  return 'string';
}

// ─── color helpers ────────────────────────────────────────────────────────────
function hexToFigmaColor(hex) {
  hex = String(hex).replace(/^#/, '');
  if (hex.length === 3) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
  if (hex.length === 4) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2]+hex[3]+hex[3];
  if (hex.length === 6) hex = hex + 'ff';
  if (hex.length !== 8) return null;
  return {
    r: parseInt(hex.slice(0,2),16)/255,
    g: parseInt(hex.slice(2,4),16)/255,
    b: parseInt(hex.slice(4,6),16)/255,
    a: parseInt(hex.slice(6,8),16)/255
  };
}
function rgbaToFigmaColor(str) {
  const m = String(str).match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)/i);
  if (!m) return null;
  return { r: +m[1]/255, g: +m[2]/255, b: +m[3]/255, a: m[4] !== undefined ? +m[4] : 1 };
}
function chan(n) { return ('0' + Math.round(Math.max(0, Math.min(1, n)) * 255).toString(16)).slice(-2); }
function figmaColorToHex(c) {
  if (!c) return null;
  const base = '#' + chan(c.r) + chan(c.g) + chan(c.b);
  return (c.a === undefined || c.a >= 0.999) ? base : base + chan(c.a);
}

// Convert a raw JSON token value → a Figma variable value of the given figma type.
function parseRawValue(rawStr, figmaType) {
  const s = String(rawStr).trim();
  if (figmaType === 'COLOR') {
    let c = null;
    if (s.charAt(0) === '#') c = hexToFigmaColor(s);
    else if (/^rgba?/i.test(s)) c = rgbaToFigmaColor(s);
    else if (s.toLowerCase() === 'transparent') c = { r:0, g:0, b:0, a:0 };
    if (c) return { figmaType: 'COLOR', figmaValue: c };
    return { figmaType: 'STRING', figmaValue: s, warning: 'Unrecognised color, stored as STRING' };
  }
  if (figmaType === 'FLOAT') {
    const n = parseFloat(s.replace(/[a-z%]+$/i, ''));
    if (!isNaN(n)) return { figmaType: 'FLOAT', figmaValue: n };
    return { figmaType: 'STRING', figmaValue: s, warning: 'Not a number, stored as STRING' };
  }
  if (figmaType === 'BOOLEAN') return { figmaType: 'BOOLEAN', figmaValue: (s === 'true' || s === '1') };
  return { figmaType: 'STRING', figmaValue: s };
}

function isReference(v) { return typeof v === 'string' && /^\{.+\}$/.test(v); }
function refToVarName(ref) { return ref.replace(/^\{/, '').replace(/\}$/, '').replace(/\./g, '/').trim(); }
function varNameToRef(name) { return '{' + name.replace(/\//g, '.') + '}'; }

// Format a resolved Figma variable VALUE (not alias) into a JSON-friendly string.
function figmaValueToJson(value, resolvedType) {
  if (value && typeof value === 'object' && value.type === 'VARIABLE_ALIAS') return null; // handled separately
  if (resolvedType === 'COLOR') return figmaColorToHex(value);
  if (resolvedType === 'FLOAT') return value;            // emit number as-is
  if (resolvedType === 'BOOLEAN') return value;
  return value;                                          // STRING
}

// ════════════════════════════════════════════════════════════════════════════
// SNAPSHOT — read every local collection + a library index for alias targets
// ════════════════════════════════════════════════════════════════════════════
async function buildSnapshot() {
  const collections = await figma.variables.getLocalVariableCollectionsAsync();
  const out = { fileName: figma.root.name, collections: [], libraryCollections: [] };

  // id → {name, collectionName} cache for naming alias targets fast
  const varNameCache = new Map();

  for (const coll of collections) {
    const modes = coll.modes.map(m => ({ modeId: m.modeId, name: m.name }));
    const variables = [];
    for (const vid of coll.variableIds) {
      const v = await figma.variables.getVariableByIdAsync(vid);
      if (!v) continue;
      varNameCache.set(v.id, { name: v.name, collectionName: coll.name, resolvedType: v.resolvedType });
      const valuesByMode = {};
      for (const m of coll.modes) {
        const raw = v.valuesByMode[m.modeId];
        if (raw && typeof raw === 'object' && raw.type === 'VARIABLE_ALIAS') {
          valuesByMode[m.modeId] = { alias: true, targetId: raw.id };
        } else if (v.resolvedType === 'COLOR') {
          valuesByMode[m.modeId] = { alias: false, value: figmaColorToHex(raw) };
        } else {
          valuesByMode[m.modeId] = { alias: false, value: raw };
        }
      }
      variables.push({
        id: v.id, name: v.name, resolvedType: v.resolvedType,
        description: v.description || '', valuesByMode: valuesByMode
      });
    }
    out.collections.push({
      id: coll.id, name: coll.name, defaultModeId: coll.defaultModeId,
      modes: modes, variables: variables
    });
  }

  // Resolve alias target display names (target may be a local var or an imported library var)
  for (const coll of out.collections) {
    for (const v of coll.variables) {
      for (const modeId in v.valuesByMode) {
        const slot = v.valuesByMode[modeId];
        if (slot.alias) {
          let info = varNameCache.get(slot.targetId);
          if (!info) {
            try {
              const tv = await figma.variables.getVariableByIdAsync(slot.targetId);
              if (tv) {
                let cn = '(library)';
                try {
                  const tc = await figma.variables.getVariableCollectionByIdAsync(tv.variableCollectionId);
                  if (tc) cn = tc.name;
                } catch (e) {}
                info = { name: tv.name, collectionName: cn, resolvedType: tv.resolvedType };
                varNameCache.set(slot.targetId, info);
              }
            } catch (e) {}
          }
          slot.targetName = info ? info.name : '(unresolved)';
          slot.targetCollection = info ? info.collectionName : '(unknown)';
        }
      }
    }
  }

  // Library index (published Foundations etc.) — names + keys for reassignment search
  try {
    const libColls = await figma.teamLibrary.getAvailableLibraryVariableCollectionsAsync();
    for (const lc of libColls) {
      let vars = [];
      try {
        const libVars = await figma.teamLibrary.getVariablesInLibraryCollectionAsync(lc.key);
        vars = libVars.map(lv => ({ name: lv.name, key: lv.key, resolvedType: lv.resolvedType }));
      } catch (e) {}
      out.libraryCollections.push({ name: lc.name, key: lc.key, libraryName: lc.libraryName, variables: vars });
    }
  } catch (e) {
    out.libraryWarning = 'Could not read team libraries: ' + e.message + ' (Foundations alias targets will be limited).';
  }

  return out;
}

// ════════════════════════════════════════════════════════════════════════════
// CHAIN RESOLVER — follow aliases to the final raw value, for the Inspector
// ════════════════════════════════════════════════════════════════════════════
async function resolveChain(variableId, modeId) {
  const steps = [];
  let curId = variableId, curMode = modeId, depth = 0;
  while (curId && depth < CHAIN_MAX_DEPTH) {
    depth++;
    const v = await figma.variables.getVariableByIdAsync(curId);
    if (!v) { steps.push({ kind: 'broken', note: 'Variable not found: ' + curId }); break; }
    let collName = '(unknown)';
    try {
      const c = await figma.variables.getVariableCollectionByIdAsync(v.variableCollectionId);
      if (c) collName = c.name;
    } catch (e) {}
    // pick a mode: requested mode if present, else first available
    let mId = (curMode && v.valuesByMode[curMode] !== undefined) ? curMode : Object.keys(v.valuesByMode)[0];
    const raw = v.valuesByMode[mId];
    if (raw && typeof raw === 'object' && raw.type === 'VARIABLE_ALIAS') {
      steps.push({ kind: 'alias', id: v.id, name: v.name, collection: collName, type: v.resolvedType });
      curId = raw.id; curMode = mId; // continue following (alias targets keep their own mode mapping)
    } else {
      let display;
      if (v.resolvedType === 'COLOR') display = figmaColorToHex(raw);
      else display = raw;
      steps.push({ kind: 'raw', id: v.id, name: v.name, collection: collName, type: v.resolvedType, value: display });
      break;
    }
  }
  return steps;
}

// ════════════════════════════════════════════════════════════════════════════
// PUSH — apply a plan of token collections into local variables (idempotent)
//   plan = [{ collectionName, tokens: [{ path, type, isRef, ref?, value?, description? }] }]
//   modeName (optional) — which mode to write; defaults to the collection's default mode
// Reference resolution order: local variable (any local collection) → library variable.
// ════════════════════════════════════════════════════════════════════════════
async function applyPush(plan, modeName) {
  const summary = { collections: [], totalCreated: 0, totalReused: 0, totalErrors: 0, warnings: [] };

  // Build a lookup of ALL local variables by name (for cross-collection aliasing).
  const localColls = await figma.variables.getLocalVariableCollectionsAsync();
  const localByName = new Map();
  for (const c of localColls) {
    for (const vid of c.variableIds) {
      const v = await figma.variables.getVariableByIdAsync(vid);
      if (v) localByName.set(v.name, v);
    }
  }

  // Library index for fallback alias targets.
  const libByName = new Map();
  try {
    const libColls = await figma.teamLibrary.getAvailableLibraryVariableCollectionsAsync();
    // priority: Semantic-Colors > Semantic > Primitive > other
    const prio = (n) => {
      n = n.toLowerCase();
      if (n.indexOf('semantic') !== -1 && (n.indexOf('color') !== -1 || n.indexOf('colour') !== -1)) return 3;
      if (n.indexOf('semantic') !== -1) return 2;
      if (n.indexOf('primitive') !== -1) return 1;
      return 0;
    };
    for (const lc of libColls) {
      let vars = [];
      try { vars = await figma.teamLibrary.getVariablesInLibraryCollectionAsync(lc.key); } catch (e) {}
      for (const lv of vars) {
        const ex = libByName.get(lv.name);
        if (!ex || prio(lc.name) > prio(ex.collName)) {
          libByName.set(lv.name, { key: lv.key, resolvedType: lv.resolvedType, collName: lc.name });
        }
      }
    }
  } catch (e) { summary.warnings.push('Library index unavailable: ' + e.message); }

  const importedCache = new Map();

  for (const cdef of plan) {
    const cName = cdef.collectionName;
    let created = 0, reused = 0; const errors = [];

    // create or reuse the collection
    let coll = localColls.find(c => c.name === cName);
    if (!coll) { coll = figma.variables.createVariableCollection(cName); localColls.push(coll); }
    const modeId = modeName
      ? (coll.modes.find(m => m.name === modeName) || { modeId: coll.defaultModeId }).modeId
      : coll.defaultModeId;

    // index this collection's existing variables
    const existingByName = new Map();
    for (const vid of coll.variableIds) {
      const v = await figma.variables.getVariableByIdAsync(vid);
      if (v) existingByName.set(v.name, v);
    }

    for (const tok of cdef.tokens) {
      const figmaType = tokenTypeToFigmaType(tok.type);
      if (isUnsupportedType(tok.type)) continue; // typography/shadow → styles, not variables

      try {
        const refStr = tok.isRef ? tok.ref : (isReference(tok.value) ? tok.value : null);

        if (refStr) {
          // ALIAS
          const targetName = refToVarName(refStr);
          let targetVar = localByName.get(targetName);
          if (!targetVar) {
            const lib = libByName.get(targetName);
            if (lib) {
              let imp = importedCache.get(lib.key);
              if (!imp) { imp = await figma.variables.importVariableByKeyAsync(lib.key); importedCache.set(lib.key, imp); }
              targetVar = imp;
            }
          }
          if (!targetVar) {
            // unresolved reference → store the ref string as a STRING so nothing is lost
            let lv = existingByName.get(tok.path);
            if (!lv) { lv = figma.variables.createVariable(tok.path, coll, 'STRING'); existingByName.set(tok.path, lv); localByName.set(tok.path, lv); created++; } else reused++;
            lv.setValueForMode(modeId, refStr);
            if (tok.description) lv.description = tok.description;
            errors.push('Unresolved reference "' + refStr + '" for "' + tok.path + '" (stored as string).');
            continue;
          }
          let lv = existingByName.get(tok.path);
          if (!lv) { lv = figma.variables.createVariable(tok.path, coll, targetVar.resolvedType); existingByName.set(tok.path, lv); localByName.set(tok.path, lv); created++; } else reused++;
          lv.setValueForMode(modeId, { type: 'VARIABLE_ALIAS', id: targetVar.id });
          if (tok.description) lv.description = tok.description;
        } else {
          // RAW
          const parsed = parseRawValue(tok.value, figmaType);
          let lv = existingByName.get(tok.path);
          if (!lv) { lv = figma.variables.createVariable(tok.path, coll, parsed.figmaType); existingByName.set(tok.path, lv); localByName.set(tok.path, lv); created++; } else reused++;
          lv.setValueForMode(modeId, parsed.figmaValue);
          if (tok.description) lv.description = tok.description;
          if (parsed.warning) errors.push(tok.path + ': ' + parsed.warning);
        }
      } catch (e) {
        errors.push('"' + tok.path + '": ' + e.message);
      }
    }

    summary.collections.push({ name: cName, created: created, reused: reused, errors: errors });
    summary.totalCreated += created; summary.totalReused += reused; summary.totalErrors += errors.length;
  }
  return summary;
}

// ════════════════════════════════════════════════════════════════════════════
// INSPECTOR EDITS — reassign an alias, or set a raw value, for one variable
// ════════════════════════════════════════════════════════════════════════════
async function reassignAlias(variableId, modeId, targetName, targetKey) {
  const v = await figma.variables.getVariableByIdAsync(variableId);
  if (!v) throw new Error('Variable not found.');

  // find target: local first, then library by key (import)
  let target = null;
  const localColls = await figma.variables.getLocalVariableCollectionsAsync();
  for (const c of localColls) {
    for (const vid of c.variableIds) {
      const lv = await figma.variables.getVariableByIdAsync(vid);
      if (lv && lv.name === targetName) { target = lv; break; }
    }
    if (target) break;
  }
  if (!target && targetKey) target = await figma.variables.importVariableByKeyAsync(targetKey);
  if (!target) throw new Error('Target variable "' + targetName + '" not found locally or in library.');

  v.setValueForMode(modeId, { type: 'VARIABLE_ALIAS', id: target.id });
  return { ok: true, name: v.name, target: target.name };
}

async function setRawValue(variableId, modeId, rawValue) {
  const v = await figma.variables.getVariableByIdAsync(variableId);
  if (!v) throw new Error('Variable not found.');
  const parsed = parseRawValue(rawValue, v.resolvedType);
  v.setValueForMode(modeId, parsed.figmaValue);
  return { ok: true, name: v.name, value: rawValue, warning: parsed.warning };
}

// ════════════════════════════════════════════════════════════════════════════
// SETTINGS persistence (per-user clientStorage — PAT never goes in the repo)
// ════════════════════════════════════════════════════════════════════════════
async function loadSettings() {
  try { return (await figma.clientStorage.getAsync(SETTINGS_KEY)) || null; } catch (e) { return null; }
}
async function saveSettings(s) {
  try { await figma.clientStorage.setAsync(SETTINGS_KEY, s); return true; } catch (e) { return false; }
}

// ════════════════════════════════════════════════════════════════════════════
// MESSAGE ROUTER
// ════════════════════════════════════════════════════════════════════════════
figma.ui.onmessage = async function (msg) {
  try {
    switch (msg.type) {
      case 'ui-ready': {
        const settings = await loadSettings();
        send('settings', { settings: settings });
        const snap = await buildSnapshot();
        send('snapshot', { snapshot: snap });
        break;
      }
      case 'refresh-snapshot': {
        const snap = await buildSnapshot();
        send('snapshot', { snapshot: snap });
        log('Snapshot refreshed: ' + snap.collections.length + ' local collection(s).');
        break;
      }
      case 'save-settings': {
        const ok = await saveSettings(msg.settings);
        send('settings-saved', { ok: ok });
        break;
      }
      case 'resolve-chain': {
        const steps = await resolveChain(msg.variableId, msg.modeId);
        send('chain', { variableId: msg.variableId, modeId: msg.modeId, steps: steps });
        break;
      }
      case 'apply-push': {
        log('Applying push to Figma…');
        const summary = await applyPush(msg.plan, msg.modeName);
        send('push-done', { summary: summary });
        const snap = await buildSnapshot();
        send('snapshot', { snapshot: snap });
        break;
      }
      case 'reassign-alias': {
        const r = await reassignAlias(msg.variableId, msg.modeId, msg.targetName, msg.targetKey);
        send('edit-done', { result: r });
        const snap = await buildSnapshot();
        send('snapshot', { snapshot: snap });
        break;
      }
      case 'set-raw': {
        const r = await setRawValue(msg.variableId, msg.modeId, msg.rawValue);
        send('edit-done', { result: r });
        const snap = await buildSnapshot();
        send('snapshot', { snapshot: snap });
        break;
      }
      case 'notify': {
        figma.notify(msg.message);
        break;
      }
      case 'close': {
        figma.closePlugin(msg.message || undefined);
        break;
      }
      default:
        log('Unknown message type: ' + msg.type);
    }
  } catch (e) {
    send('error', { message: (e && e.message) ? e.message : String(e), stack: e && e.stack });
  }
};
