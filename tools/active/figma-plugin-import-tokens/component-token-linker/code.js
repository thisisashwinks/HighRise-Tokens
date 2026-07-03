// Component Token Linker — plugin main thread
// Runs inside Mobile Components (with Foundations library enabled).
// Takes a component token JSON and creates a local variable collection
// whose variables are cross-file aliases to the published Foundations library.
// Raw (non-reference) values are written directly as Figma variable values.

figma.showUI(__html__, { width: 640, height: 740, title: 'Import Tokens' });

// ─── Flatten token JSON into leaf entries ─────────────────────────────────────
// A leaf is any object that has a direct "value" key.
// Keys starting with "$" are skipped at every depth level.
function flattenTokens(obj, pathParts, results) {
  if (!pathParts) pathParts = [];
  if (!results) results = [];

  for (var i = 0, keys = Object.keys(obj); i < keys.length; i++) {
    var key = keys[i];
    if (key.charAt(0) === '$') continue;

    var val = obj[key];
    if (!val || typeof val !== 'object') continue;

    if (typeof val.value !== 'undefined') {
      results.push({
        name: pathParts.concat(key).join('/'),
        reference: String(val.value).trim(),
        tokenType: val.type || 'unknown',
        description: val.description || ''
      });
    } else {
      flattenTokens(val, pathParts.concat(key), results);
    }
  }
  return results;
}

// ─── Token types Figma doesn't support as variables ───────────────────────────
// Figma uses text/effect styles for these — skip them entirely.
var UNSUPPORTED_TYPES = [
  'typography', 'fontfamilies', 'fontfamily', 'fontweights', 'fontweight',
  'fontsizes', 'fontsize', 'lineheights', 'lineheight', 'letterspacing',
  'paragraphspacing', 'textdecoration', 'textcase',
  'shadow', 'boxshadow', 'dropshadow', 'innershadow'
];

function isUnsupportedType(tokenType) {
  return UNSUPPORTED_TYPES.indexOf((tokenType || '').toLowerCase()) !== -1;
}

// ─── Detect reference vs raw value ───────────────────────────────────────────
// A reference looks like "{some.dot.path}". Anything else is a raw value.
function isReference(value) {
  return /^\{.+\}$/.test(value);
}

// ─── Map JSON token type → Figma resolvedType ─────────────────────────────────
var FLOAT_TYPES = [
  'dimension', 'spacing', 'sizing', 'borderradius', 'borderwidth',
  'gap', 'padding', 'position', 'number', 'size', 'opacity',
  'float', 'integer', 'percent'
];

function tokenTypeToFigmaType(tokenType) {
  var t = (tokenType || '').toLowerCase();
  if (t === 'color') return 'COLOR';
  if (FLOAT_TYPES.indexOf(t) !== -1) return 'FLOAT';
  return 'STRING';
}

// ─── Parse a hex color string → Figma {r,g,b,a} (0–1 range) ─────────────────
function hexToFigmaColor(hex) {
  hex = hex.replace(/^#/, '');
  if (hex.length === 3) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
  if (hex.length === 4) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2]+hex[3]+hex[3];
  if (hex.length === 6) hex = hex + 'ff';
  if (hex.length !== 8) return null;
  return {
    r: parseInt(hex.slice(0,2), 16) / 255,
    g: parseInt(hex.slice(2,4), 16) / 255,
    b: parseInt(hex.slice(4,6), 16) / 255,
    a: parseInt(hex.slice(6,8), 16) / 255
  };
}

// ─── Parse rgba(r,g,b,a) → Figma {r,g,b,a} (0–1 range) ──────────────────────
function rgbaToFigmaColor(str) {
  var m = str.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)/i);
  if (!m) return null;
  return {
    r: parseFloat(m[1]) / 255,
    g: parseFloat(m[2]) / 255,
    b: parseFloat(m[3]) / 255,
    a: m[4] !== undefined ? parseFloat(m[4]) : 1
  };
}

// ─── Convert a raw token value → a Figma VariableValue ───────────────────────
// Returns { figmaValue, figmaType, warning? } or null if it can't be parsed.
function parseRawValue(rawStr, tokenType) {
  var figmaType = tokenTypeToFigmaType(tokenType);
  var s = rawStr.trim();

  if (figmaType === 'COLOR') {
    var color = null;
    if (s.charAt(0) === '#') {
      color = hexToFigmaColor(s);
    } else if (/^rgba?/i.test(s)) {
      color = rgbaToFigmaColor(s);
    } else if (s.toLowerCase() === 'transparent') {
      color = { r: 0, g: 0, b: 0, a: 0 };
    }
    if (color) return { figmaType: 'COLOR', figmaValue: color };
    // Unrecognised color format — store as STRING with a warning
    return { figmaType: 'STRING', figmaValue: s, warning: 'Unrecognised color format, stored as STRING' };
  }

  if (figmaType === 'FLOAT') {
    // Strip units (px, rem, em, pt, %, vw, vh, etc.) and parse the number
    var num = parseFloat(s.replace(/[a-z%]+$/i, ''));
    if (!isNaN(num)) return { figmaType: 'FLOAT', figmaValue: num };
    // Couldn't parse as number — fall through to STRING
    return { figmaType: 'STRING', figmaValue: s, warning: 'Could not parse as number, stored as STRING' };
  }

  // STRING — pass through as-is
  return { figmaType: 'STRING', figmaValue: s };
}

// ─── Convert "{dot.path}" → "slash/path" ──────────────────────────────────────
function refToVarName(ref) {
  return ref.replace(/^\{/, '').replace(/\}$/, '').replace(/\./g, '/').trim();
}

// ─── Case-insensitive fallback map lookup ─────────────────────────────────────
function findCaseInsensitive(map, name) {
  var lower = name.toLowerCase();
  var entries = Array.from(map.entries());
  for (var i = 0; i < entries.length; i++) {
    if (entries[i][0].toLowerCase() === lower) {
      return { entry: entries[i][1], foundKey: entries[i][0] };
    }
  }
  return null;
}

// ─── Index all enabled library variables ──────────────────────────────────────
// Builds Map: varName → { key, resolvedType, libCollectionName }
// Collision priority: Semantic-Colors > Semantic > Primitive > other
async function indexLibraryVariables(send) {
  var collections;
  try {
    collections = await figma.teamLibrary.getAvailableLibraryVariableCollectionsAsync();
  } catch (e) {
    send('error', {
      message: 'Failed to query team libraries: ' + e.message +
        '\n\nMake sure you are running this plugin in a Figma design file (not FigJam or Slides).'
    });
    return null;
  }

  if (!collections || collections.length === 0) {
    send('error', {
      message: [
        'No library variable collections found.',
        '',
        'Action required: enable the Foundations library in this file:',
        '  → Assets panel (Shift + I) → Libraries → enable "HighRise 1.2 Foundations"',
        '',
        'If it is already enabled, confirm it publishes variable collections.'
      ].join('\n')
    });
    return null;
  }

  function getPrio(collName) {
    var n = collName.toLowerCase();
    if (n.indexOf('semantic') !== -1 && (n.indexOf('color') !== -1 || n.indexOf('colour') !== -1)) return 3;
    if (n.indexOf('semantic') !== -1) return 2;
    if (n.indexOf('primitive') !== -1) return 1;
    return 0;
  }

  var map = new Map();
  var collisions = [];

  for (var ci = 0; ci < collections.length; ci++) {
    var coll = collections[ci];
    var vars;
    try {
      vars = await figma.teamLibrary.getVariablesInLibraryCollectionAsync(coll.key);
    } catch (e) {
      send('log', { message: '  ⚠ Could not fetch variables for "' + coll.name + '": ' + e.message });
      continue;
    }

    for (var vi = 0; vi < vars.length; vi++) {
      var v = vars[vi];
      var normName = v.name;
      if (map.has(normName)) {
        var existing = map.get(normName);
        if (getPrio(coll.name) > getPrio(existing.libCollectionName)) {
          collisions.push('"' + normName + '": "' + coll.name + '" overrides "' + existing.libCollectionName + '"');
          map.set(normName, { key: v.key, resolvedType: v.resolvedType, libCollectionName: coll.name });
        } else {
          collisions.push('"' + normName + '": keeping "' + existing.libCollectionName + '"');
        }
      } else {
        map.set(normName, { key: v.key, resolvedType: v.resolvedType, libCollectionName: coll.name });
      }
    }
  }

  if (collisions.length > 0) {
    send('log', { message: '  ⚠ ' + collisions.length + ' collision(s):\n    ' + collisions.join('\n    ') });
  }

  return map;
}

// ─── Main ─────────────────────────────────────────────────────────────────────
figma.ui.onmessage = async function(msg) {
  if (msg.type !== 'run') return;

  var json           = msg.json;
  var collectionName = msg.collectionName;
  var dryRun         = msg.dryRun;

  function send(type, payload) {
    figma.ui.postMessage(Object.assign({ type: type }, payload || {}));
  }

  try {

    // ── Parse ────────────────────────────────────────────────────────────────
    var parsed;
    try { parsed = JSON.parse(json); }
    catch (e) { send('error', { message: 'JSON parse error: ' + e.message }); return; }

    var allLeaves = flattenTokens(parsed);

    // Split: skip unsupported types entirely
    var skipped = allLeaves.filter(function(l) { return isUnsupportedType(l.tokenType); });
    var leaves  = allLeaves.filter(function(l) { return !isUnsupportedType(l.tokenType); });

    if (skipped.length > 0) {
      send('log', {
        message: '  ↷ Skipped ' + skipped.length + ' unsupported token(s) (typography/shadow):\n    ' +
          skipped.map(function(l) { return l.name + ' (' + l.tokenType + ')'; }).join('\n    ')
      });
    }

    if (leaves.length === 0) {
      send('error', { message: 'No token leaves found after filtering unsupported types.' });
      return;
    }
    send('log', { message: '✓ Parsed ' + leaves.length + ' token(s) (after skipping ' + skipped.length + ' unsupported).' });

    // ── Index library ────────────────────────────────────────────────────────
    send('log', { message: 'Fetching library variable index…' });
    var libVarMap = await indexLibraryVariables(send);
    if (!libVarMap) return;
    send('log', { message: '✓ Indexed ' + libVarMap.size + ' library variables.' });

    // ── Classify each leaf into one of three buckets ─────────────────────────
    //
    //  resolved   — a {reference} that matched a library variable → will become an ALIAS
    //  rawValues  — a literal value (not a reference) OR a {reference} that wasn't found
    //               in the library → will be written as a plain Figma variable value
    //  (nothing is hard-blocked; every token becomes a variable one way or another)
    //
    var resolved  = [];  // { name, refName, match, caseFixed, tokenType, ... }
    var rawValues = [];  // { name, rawStr, tokenType, parsed: {figmaType, figmaValue, warning?}, isRef, refName? }

    for (var i = 0; i < leaves.length; i++) {
      var leaf = leaves[i];

      if (isReference(leaf.reference)) {
        // Try to resolve as a library alias
        var refName = refToVarName(leaf.reference);
        var match   = libVarMap.get(refName);
        var caseFixed = false;

        if (!match) {
          var ciResult = findCaseInsensitive(libVarMap, refName);
          if (ciResult) {
            match = ciResult.entry;
            caseFixed = true;
            send('log', { message: '  ⚠ Case match: "' + refName + '" → "' + ciResult.foundKey + '"' });
          }
        }

        if (match) {
          resolved.push({
            name: leaf.name, reference: leaf.reference, tokenType: leaf.tokenType,
            refName: refName, match: match, caseFixed: caseFixed
          });
        } else {
          // Reference not found in library — fall back to raw value using the reference
          // string as a STRING (keeps the token in the collection so nothing is lost)
          rawValues.push({
            name: leaf.name, tokenType: leaf.tokenType,
            rawStr: leaf.reference,
            isRef: true, refName: refName,
            parsed: { figmaType: 'STRING', figmaValue: leaf.reference,
                      warning: 'Reference not found in library — stored as raw string' }
          });
        }

      } else {
        // Literal raw value (number, hex color, etc.)
        var parsedRaw = parseRawValue(leaf.reference, leaf.tokenType);
        rawValues.push({
          name: leaf.name, tokenType: leaf.tokenType,
          rawStr: leaf.reference,
          isRef: false,
          parsed: parsedRaw
        });
      }
    }

    send('log', {
      message: 'Aliases: ' + resolved.length +
               '  Raw values: ' + rawValues.length +
               '  (0 blocked — every token will be created)'
    });

    // ── Dry run: emit report and stop ────────────────────────────────────────
    if (dryRun) {
      send('report', {
        dryRun: true,
        collectionName: collectionName,
        totalLeaves: leaves.length,
        resolvedCount: resolved.length,
        rawCount: rawValues.length,
        resolved: resolved,
        rawValues: rawValues
      });
      return;
    }

    // ── Live run ─────────────────────────────────────────────────────────────

    // Create or reuse collection
    send('log', { message: 'Creating/reusing collection "' + collectionName + '"…' });
    var existingColls = await figma.variables.getLocalVariableCollectionsAsync();
    var coll = null;
    for (var ci2 = 0; ci2 < existingColls.length; ci2++) {
      if (existingColls[ci2].name === collectionName) { coll = existingColls[ci2]; break; }
    }
    var collCreated = !coll;
    if (!coll) coll = figma.variables.createVariableCollection(collectionName);
    var modeId = coll.defaultModeId;

    send('log', {
      message: collCreated
        ? '✓ Created collection "' + collectionName + '".'
        : '✓ Reusing collection "' + collectionName + '" (idempotent).'
    });

    // Index pre-existing variables for idempotency
    var existingVarByName = new Map();
    for (var vi2 = 0; vi2 < coll.variableIds.length; vi2++) {
      var ev = await figma.variables.getVariableByIdAsync(coll.variableIds[vi2]);
      if (ev) existingVarByName.set(ev.name, ev);
    }

    var created = 0, reused = 0, writeErrors = [];

    // ── Write aliased variables ───────────────────────────────────────────────
    var importedCache = new Map();

    for (var ri = 0; ri < resolved.length; ri++) {
      var item = resolved[ri];
      try {
        var importedVar = importedCache.get(item.match.key);
        if (!importedVar) {
          importedVar = await figma.variables.importVariableByKeyAsync(item.match.key);
          importedCache.set(item.match.key, importedVar);
        }

        var localVar = existingVarByName.get(item.name);
        if (!localVar) {
          localVar = figma.variables.createVariable(item.name, coll, importedVar.resolvedType);
          existingVarByName.set(item.name, localVar);
          created++;
        } else {
          reused++;
        }

        localVar.setValueForMode(modeId, { type: 'VARIABLE_ALIAS', id: importedVar.id });
      } catch (e) {
        writeErrors.push('"' + item.name + '": ' + e.message);
      }
    }

    // ── Write raw-value variables ─────────────────────────────────────────────
    for (var rvi = 0; rvi < rawValues.length; rvi++) {
      var ritem = rawValues[rvi];
      try {
        var localRaw = existingVarByName.get(ritem.name);
        if (!localRaw) {
          localRaw = figma.variables.createVariable(ritem.name, coll, ritem.parsed.figmaType);
          existingVarByName.set(ritem.name, localRaw);
          created++;
        } else {
          reused++;
        }

        localRaw.setValueForMode(modeId, ritem.parsed.figmaValue);
      } catch (e) {
        writeErrors.push('"' + ritem.name + '": ' + e.message);
      }
    }

    if (writeErrors.length > 0) {
      send('log', { message: '  ⚠ ' + writeErrors.length + ' write error(s):\n    ' + writeErrors.join('\n    ') });
    }

    send('done', {
      collectionName: collectionName,
      created: created,
      reused: reused,
      total: resolved.length + rawValues.length,
      errors: writeErrors.length
    });

  } catch (e) {
    send('error', { message: 'Unexpected error: ' + e.message + '\n' + (e.stack || '') });
  }
};
