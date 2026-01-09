#!/usr/bin/env node
/**
 * Preprocesses Semantic Colors tokens by resolving all token references
 * This creates resolved JSON files that the Figma plugin can use directly
 */

const fs = require('fs');
const path = require('path');

// Load all token files
const tokensDir = path.join(__dirname, '..', 'tokens');
const primitiveFile = path.join(tokensDir, 'Primitive.json');
const lightFile = path.join(tokensDir, 'Semantics', 'Semantic-Colors', 'Light.json');
const darkFile = path.join(tokensDir, 'Semantics', 'Semantic-Colors', 'Dark.json');

// Load JSON files
const primitive = JSON.parse(fs.readFileSync(primitiveFile, 'utf8'));
const light = JSON.parse(fs.readFileSync(lightFile, 'utf8'));
const dark = JSON.parse(fs.readFileSync(darkFile, 'utf8'));

// Create a lookup map for primitive tokens
const primitiveMap = new Map();
function buildPrimitiveMap(obj, prefix = '') {
  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object' && 'value' in value) {
      primitiveMap.set(path, value);
    } else if (value && typeof value === 'object') {
      buildPrimitiveMap(value, path);
    }
  }
}
buildPrimitiveMap(primitive);

// Resolve a token reference like {color.neutral.gray.0}
function resolveToken(value) {
  if (typeof value !== 'string') return value;
  
  const refMatch = value.match(/\{([^}]+)\}/);
  if (!refMatch) return value;
  
  const refPath = refMatch[1];
  const token = primitiveMap.get(refPath);
  
  if (token && token.value) {
    // Recursively resolve if it's another reference
    if (token.value.includes('{')) {
      return resolveToken(token.value);
    }
    return token.value;
  }
  
  return value;
}

// Resolve all tokens in an object
function resolveTokens(obj) {
  const resolved = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value && typeof value === 'object' && 'value' in value) {
      resolved[key] = {
        ...value,
        value: resolveToken(value.value)
      };
    } else if (value && typeof value === 'object') {
      resolved[key] = resolveTokens(value);
    } else {
      resolved[key] = value;
    }
  }
  return resolved;
}

// Resolve both files
const lightResolved = resolveTokens(light);
const darkResolved = resolveTokens(dark);

// Save resolved files
const outputDir = path.join(__dirname, 'resolved');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

fs.writeFileSync(
  path.join(outputDir, 'Light-resolved.json'),
  JSON.stringify(lightResolved, null, 2)
);
fs.writeFileSync(
  path.join(outputDir, 'Dark-resolved.json'),
  JSON.stringify(darkResolved, null, 2)
);

console.log('✓ Resolved token references');
console.log(`✓ Created resolved files in ${outputDir}`);
console.log('\nUse the resolved files in the Figma plugin for better color extraction.');

