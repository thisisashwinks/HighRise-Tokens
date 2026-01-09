// Figma Plugin: Apply Component Tokens
// Automatically applies design tokens from component token JSON files to Figma components
// Font styles and shadow styles are applied from Figma text styles and effect styles (Foundations library)

/// <reference types="@figma/plugin-typings" />

interface TokenMapping {
  component: string;
  tokens: Record<string, TokenValue>;
  instructions: Record<string, ComponentInstructions>;
  node_matching: Record<string, NodeMatching>;
}

// Component token JSON structure (from component token files)
interface ComponentTokenFile {
  [componentName: string]: {
    typography?: Record<string, TokenValue | Record<string, TokenValue>>;
    effects?: {
      shadow?: Record<string, TokenValue | Record<string, TokenValue>>;
    };
    [key: string]: any; // Other component properties
  };
}

interface TokenValue {
  value: string | { size: string; weight: string };
  type: string;
  reference?: string;
  description?: string;
  figma_property?: {
    property: string;
    type?: string;
    target: string;
  };
}

interface ComponentInstructions {
  container?: {
    background?: string;
    border?: string;
    borderRadius?: string;
    padding?: {
      horizontal?: string;
      vertical?: string;
    };
    gap?: {
      content?: string;
      horizontal?: string;
    };
    width?: string;
    height?: string;
    shadow?: string;
  };
  text?: {
    color?: string;
    typography?: string;
  };
  icon?: {
    color?: string;
    size?: string;
  };
  subtext?: {
    color?: string;
    typography?: string;
  };
}

interface NodeMatching {
  patterns: string[];
  data_attribute?: string;
}

interface ApplyOptions {
  updateColors: boolean;
  updateDimensions: boolean;
  updateTypography: boolean;
  updateShadows: boolean;
  recursive: boolean;
}

// Component token data loaded from JSON files
let componentTokenFiles: Record<string, ComponentTokenFile> = {};

// Mapping rules loaded from mapping-rules.json
let mappingRules: any = null;

// Track logging state for findFoundationVariable
let foundationVariableSearchLogged = false;
let foundationVariableFailureCount = 0;

// Load mapping rules
async function loadMappingRules(): Promise<void> {
  try {
    // In a real plugin, we'd load this from a file or embed it
    // For now, we'll define it inline but structure it to match the JSON file
    mappingRules = {
      rules: {
        dimensions: {
          width: {
            excludeComponents: ["button"]
          },
          height: {
            requireSize: true
          },
          borderRadius: {
            requireSize: true,
            excludeFor: ["icon", "placeholder"]
          },
          padding: {
            horizontal: { requireSize: true },
            vertical: { requireSize: true }
          },
          gap: {
            requireSize: true
          }
        },
        iconComponent: {
          parent: {
            apply: ["size"],
            exclude: ["color", "borderRadius"]
          },
          child: {
            apply: ["color"],
            exclude: ["size", "borderRadius"]
          }
        }
      }
    };
  } catch (e) {
    console.error('Error loading mapping rules:', e);
  }
}

// Helper: Convert RGB/RGBA to hex string
function rgbToHex(rgb: RGB | RGBA): string {
  const r = Math.round(rgb.r * 255).toString(16).padStart(2, '0');
  const g = Math.round(rgb.g * 255).toString(16).padStart(2, '0');
  const b = Math.round(rgb.b * 255).toString(16).padStart(2, '0');
  const a = 'a' in rgb && rgb.a !== undefined 
    ? Math.round(rgb.a * 255).toString(16).padStart(2, '0')
    : '';
  return `#${r}${g}${b}${a}`.toUpperCase();
}

// Helper: Find Foundation variable by matching actual value
// Searches Semantic Colors and Semantics collections for variables with matching values
// EXCLUDES component collections (like "Button") - only searches Foundation collections
function findFoundationVariableByValue(
  value: RGB | RGBA | number,
  variableType: 'COLOR' | 'FLOAT',
  modeId: string,
  excludeCollectionId?: string  // Exclude this collection (e.g., Button collection)
): Variable | null {
  const allVariables = figma.variables.getLocalVariables();
  const allCollections = figma.variables.getLocalVariableCollections();
  
  // Find Semantic Colors, Semantics, and Primitive collections
  // These should come from the HiRISE 1.2 Foundations published library
  // EXCLUDE component collections (like "Button")
  const semanticCollections = allCollections.filter(c => {
    // Skip the component collection we're updating
    if (excludeCollectionId && c.id === excludeCollectionId) return false;
    
    const nameLower = c.name.toLowerCase();
    // Exclude component collections (they usually match component names)
    if (nameLower === 'button' || nameLower === 'input' || nameLower === 'select') return false;
    
    return nameLower === 'semantic colors' || 
           nameLower === 'semantic-colors' ||
           nameLower === 'semantics' ||
           nameLower === 'semantic' ||
           nameLower === 'primitive' ||
           nameLower === 'primitives' ||
           nameLower.includes('foundation') ||
           nameLower.includes('highrise') ||
           nameLower.includes('hirise') ||
           (nameLower.includes('semantic') && (nameLower.includes('color') || nameLower.includes('foundation')));
  });
  
  if (semanticCollections.length === 0) {
    // Log available collections for debugging (only once)
    if (!foundationVariableSearchLogged) {
      console.log(`⚠️  No Foundation collections found!`);
      console.log(`   Available collections: ${allCollections.map(c => c.name).join(', ') || 'None'}`);
      console.log(`   Total variables: ${allVariables.length}`);
      console.log(`\n   📌 IMPORTANT: To access HiRISE 1.2 Foundations variables:`);
      console.log(`   1. Open the HiRISE 1.2 Foundations file`);
      console.log(`   2. Publish it as a library (Right-click → Publish as library)`);
      console.log(`   3. In your current file, enable the library (Assets panel → Libraries → Enable)`);
      console.log(`   4. Then run this plugin again`);
    }
    return null;
  }
  
  // Log found collections (only once)
  if (!foundationVariableSearchLogged && semanticCollections.length > 0) {
    console.log(`✅ Found Foundation collections: ${semanticCollections.map(c => c.name).join(', ')}`);
    const foundationVars = allVariables.filter(v => {
      const collection = allCollections.find(c => c.id === v.variableCollectionId);
      return collection && semanticCollections.includes(collection);
    });
    console.log(`   Total Foundation variables: ${foundationVars.length}`);
  }
  
  // Get all variables from Semantic collections
  const semanticVariables = allVariables.filter(v => {
    const collection = allCollections.find(c => c.id === v.variableCollectionId);
    return collection && semanticCollections.includes(collection) && v.resolvedType === variableType;
  });
  
  if (semanticVariables.length === 0) {
    if (!foundationVariableSearchLogged) {
      console.log(`⚠️  No ${variableType} variables found in Foundation collections`);
    }
    return null;
  }
  
  // Match by value
  for (const semanticVar of semanticVariables) {
    try {
      const semanticCollection = allCollections.find(c => c.id === semanticVar.variableCollectionId);
      if (!semanticCollection || !semanticCollection.modes.length) continue;
      
      // Get value from the specified mode (or first mode if modeId doesn't match)
      const targetMode = semanticCollection.modes.find(m => m.modeId === modeId) || semanticCollection.modes[0];
      const semanticValue = semanticVar.valuesByMode[targetMode.modeId];
      
      if (variableType === 'COLOR' && (typeof value === 'object' && 'r' in value)) {
        // Compare RGB/RGBA values
        if (semanticValue && typeof semanticValue === 'object' && 'r' in semanticValue) {
          const rgb1 = value as RGB | RGBA;
          const rgb2 = semanticValue as RGB | RGBA;
          
          // Compare RGB values (allow small floating point differences)
          if (Math.abs(rgb1.r - rgb2.r) < 0.001 &&
              Math.abs(rgb1.g - rgb2.g) < 0.001 &&
              Math.abs(rgb1.b - rgb2.b) < 0.001) {
            // Compare alpha if both have it
            const a1 = 'a' in rgb1 ? rgb1.a : 1;
            const a2 = 'a' in rgb2 ? rgb2.a : 1;
            if (Math.abs(a1 - a2) < 0.001) {
              const collection = allCollections.find(c => c.id === semanticVar.variableCollectionId);
              console.log(`✓ Found Foundation variable by VALUE: "${semanticVar.name}" (${rgbToHex(rgb1)}) from "${collection?.name || 'Unknown'}"`);
              return semanticVar;
            }
          }
        }
      } else if (variableType === 'FLOAT' && typeof value === 'number') {
        // Compare numeric values (allow small floating point differences)
        if (typeof semanticValue === 'number' && Math.abs(value - semanticValue) < 0.001) {
          const collection = allCollections.find(c => c.id === semanticVar.variableCollectionId);
          console.log(`✓ Found Foundation variable by VALUE: "${semanticVar.name}" (${value}) from "${collection?.name || 'Unknown'}"`);
          return semanticVar;
        }
      }
    } catch (e) {
      // Skip variables that can't be read
      continue;
    }
  }
  
  return null;
}

// Helper: Find Foundation variable by token reference path
// Searches all variables from Foundations library (HighRise 1.2 Foundations)
function findFoundationVariable(refPath: string, variableType: 'COLOR' | 'FLOAT'): Variable | null {
  // Remove curly braces if present
  const cleanPath = refPath.replace(/[{}]/g, '');
  
  // Get all variables from all collections (includes published library variables)
  const allVariables = figma.variables.getLocalVariables();
  const allCollections = figma.variables.getLocalVariableCollections();
  
  // Find Foundation collections (prioritize HighRise/Foundations collections)
  // Look for "HiRISE Foundations 1.0", "HighRise 1.2 Foundations", "Semantic-Colors" or similar
  const foundationCollections = allCollections.filter(c => {
    const nameLower = c.name.toLowerCase();
    return nameLower.includes('foundation') || 
           nameLower.includes('highrise') || 
           nameLower.includes('hirise') ||
           nameLower.includes('semantic') ||
           nameLower.includes('primitive') ||
           nameLower.includes('1.0') ||
           nameLower.includes('1.2') ||
           nameLower.includes('1.25');
  });
  
  // Prioritize "Semantic-Colors" collection if it exists
  const semanticColorsCollection = foundationCollections.find(c => 
    c.name.toLowerCase().includes('semantic') && c.name.toLowerCase().includes('color')
  );
  
  // Reorder to put Semantic-Colors first if found
  if (semanticColorsCollection) {
    const otherCollections = foundationCollections.filter(c => c.id !== semanticColorsCollection.id);
    foundationCollections.length = 0;
    foundationCollections.push(semanticColorsCollection, ...otherCollections);
  }
  
  // Also check if variables themselves indicate Foundation source
  // Published library variables should be accessible via getLocalVariables()
  
  // Log available collections and variable count for debugging (only first time)
  if (!foundationVariableSearchLogged) {
    console.log(`🔍 Available collections (${allCollections.length}):`, allCollections.map(c => `${c.name} (${figma.variables.getLocalVariables().filter(v => v.variableCollectionId === c.id).length} vars)`).join(', '));
    console.log(`🔍 Foundation collections found: ${foundationCollections.length}`, foundationCollections.map(c => c.name).join(', '));
    console.log(`🔍 Total variables: ${allVariables.length}`);
    
    // Group variables by collection for better visibility
    const varsByCollection: Record<string, Variable[]> = {};
    allVariables.forEach(v => {
      const collection = allCollections.find(c => c.id === v.variableCollectionId);
      const collectionName = collection ? collection.name : 'Unknown';
      if (!varsByCollection[collectionName]) {
        varsByCollection[collectionName] = [];
      }
      varsByCollection[collectionName].push(v);
    });
    
    console.log(`🔍 Variables by collection:`);
    Object.entries(varsByCollection).forEach(([name, vars]) => {
      console.log(`  ${name}: ${vars.length} variables`);
      if (vars.length > 0 && vars.length <= 10) {
        console.log(`    Sample: ${vars.slice(0, 5).map(v => `${v.name} (${v.resolvedType})`).join(', ')}`);
      }
    });
    
    // Log Foundation variable samples if found
    if (foundationCollections.length > 0) {
      const foundationVars = allVariables.filter(v => {
        const collection = allCollections.find(c => c.id === v.variableCollectionId);
        return collection && foundationCollections.includes(collection);
      });
      console.log(`🔍 Foundation variables found: ${foundationVars.length}`);
      if (semanticColorsCollection) {
        const semanticVars = foundationVars.filter(v => v.variableCollectionId === semanticColorsCollection.id);
        console.log(`   ✅ Prioritizing "Semantic-Colors" collection: ${semanticVars.length} variables`);
      }
      if (foundationVars.length > 0 && foundationVars.length <= 10) {
        console.log(`    Sample Foundation vars: ${foundationVars.slice(0, 5).map(v => v.name).join(', ')}`);
      }
    } else {
      console.log(`⚠️  No Foundation collections found. Make sure "HighRise 1.2 Foundations" file/library is available.`);
    }
    
    foundationVariableSearchLogged = true;
  }
  
  // Filter variables by type first (more efficient)
  const typedVariables = allVariables.filter(v => v.resolvedType === variableType);
  
  // Prioritize variables from Foundation collections
  const foundationVariables = typedVariables.filter(v => {
    const collection = allCollections.find(c => c.id === v.variableCollectionId);
    return collection && foundationCollections.includes(collection);
  });
  
  // Further prioritize variables from Semantic-Colors collection if it exists
  let searchVariables: Variable[];
  if (semanticColorsCollection) {
    const semanticColorsVariables = foundationVariables.filter(v => 
      v.variableCollectionId === semanticColorsCollection.id
    );
    const otherFoundationVariables = foundationVariables.filter(v => 
      v.variableCollectionId !== semanticColorsCollection.id
    );
    // Order: Semantic-Colors first, then other Foundation collections, then all variables
    searchVariables = semanticColorsVariables.length > 0 
      ? [...semanticColorsVariables, ...otherFoundationVariables, ...typedVariables]
      : foundationVariables.length > 0 
        ? foundationVariables 
        : typedVariables;
  } else {
    // Use Foundation variables first, then fall back to all variables
    searchVariables = foundationVariables.length > 0 ? foundationVariables : typedVariables;
  }
  
  // Try multiple naming patterns - PRIORITIZE SLASH-SEPARATED (Figma format)
  const patterns: string[] = [];
  
  // Pattern 1: With slashes (e.g., "color/background/primary/default") - PRIORITY: Figma uses slashes
  patterns.push(cleanPath.replace(/\./g, '/'));
  
  // Pattern 2: Direct path with dots (e.g., "color.background.primary.default")
  patterns.push(cleanPath);
  
  // Pattern 3: Sanitized with slashes (replaces special chars)
  const sanitized = sanitizeVariableName(cleanPath);
  patterns.push(sanitized);
  
  // Pattern 4: With dashes (e.g., "color-background-primary-default")
  patterns.push(cleanPath.replace(/\./g, '-'));
  
  // Pattern 5: Space-slash-space format (e.g., "color / background / primary / default")
  patterns.push(cleanPath.replace(/\./g, ' / '));
  
  // Pattern 6: Remove dots entirely (e.g., "colorbackgroundprimarydefault")
  patterns.push(cleanPath.replace(/\./g, ''));
  
  // Normalize function to handle whitespace and case differences
  const normalizeName = (name: string): string => {
    return name.trim().replace(/\s+/g, ' ').toLowerCase();
  };
  
  // Try exact matches first (case-sensitive) - prioritize Foundation collections
  for (const pattern of patterns) {
    const variable = searchVariables.find(v => v.name === pattern);
    if (variable) {
      const collection = allCollections.find(c => c.id === variable.variableCollectionId);
      console.log(`✓ Found Foundation variable (exact): "${variable.name}" from "${collection?.name || 'Unknown'}" for "${refPath}"`);
      return variable;
    }
  }
  
  // Try normalized exact matches (handles whitespace differences)
  for (const pattern of patterns) {
    const normalizedPattern = normalizeName(pattern);
    const variable = searchVariables.find(v => 
      normalizeName(v.name) === normalizedPattern
    );
    if (variable) {
      const collection = allCollections.find(c => c.id === variable.variableCollectionId);
      console.log(`✓ Found Foundation variable (normalized): "${variable.name}" from "${collection?.name || 'Unknown'}" for "${refPath}"`);
      return variable;
    }
  }
  
  // Try case-insensitive exact matches (fallback)
  for (const pattern of patterns) {
    const variable = searchVariables.find(v => 
      v.name.toLowerCase() === pattern.toLowerCase()
    );
    if (variable) {
      const collection = allCollections.find(c => c.id === variable.variableCollectionId);
      console.log(`✓ Found Foundation variable (case-insensitive): "${variable.name}" from "${collection?.name || 'Unknown'}" for "${refPath}"`);
      return variable;
    }
  }
  
  // Try partial matches - check if variable name contains all segments
  const segments = cleanPath.split('.');
  if (segments.length >= 2) {
    // Try matching all segments in order
    const segmentPattern = segments.join('/');
    const partialMatch = searchVariables.find(v => {
      const varNameLower = v.name.toLowerCase();
      return varNameLower.includes(segmentPattern.toLowerCase()) ||
             varNameLower.includes(segments.join(' ').toLowerCase()) ||
             varNameLower.includes(segments.join('-').toLowerCase());
    });
    if (partialMatch) {
      const collection = allCollections.find(c => c.id === partialMatch.variableCollectionId);
      console.log(`✓ Found Foundation variable (partial): "${partialMatch.name}" from "${collection?.name || 'Unknown'}" for "${refPath}"`);
      return partialMatch;
    }
    
    // Try matching last 2-3 segments
    if (segments.length >= 2) {
      const lastSegments = segments.slice(-2).join('/');
      const lastSegmentsMatch = searchVariables.find(v => 
        v.name.toLowerCase().includes(lastSegments.toLowerCase())
      );
      if (lastSegmentsMatch) {
        const collection = allCollections.find(c => c.id === lastSegmentsMatch.variableCollectionId);
        console.log(`✓ Found Foundation variable (last segments): "${lastSegmentsMatch.name}" from "${collection?.name || 'Unknown'}" for "${refPath}"`);
        return lastSegmentsMatch;
      }
    }
    
    // Try matching last segment only (as fallback)
    const lastSegment = segments[segments.length - 1];
    const lastSegmentMatch = searchVariables.find(v => 
      v.name.toLowerCase().endsWith(`/${lastSegment.toLowerCase()}`) ||
      v.name.toLowerCase().endsWith(`.${lastSegment.toLowerCase()}`) ||
      v.name.toLowerCase() === lastSegment.toLowerCase()
    );
    if (lastSegmentMatch) {
      const collection = allCollections.find(c => c.id === lastSegmentMatch.variableCollectionId);
      console.log(`✓ Found Foundation variable (last segment): "${lastSegmentMatch.name}" from "${collection?.name || 'Unknown'}" for "${refPath}"`);
      return lastSegmentMatch;
    }
  }
  
  // Try fuzzy matching - check if all key words from refPath appear in variable name
  const keyWords = cleanPath.split(/[.\/_-]/).filter(w => w.length > 2);
  if (keyWords.length > 0) {
    const fuzzyMatch = searchVariables.find(v => {
      const varNameLower = v.name.toLowerCase();
      return keyWords.every(word => varNameLower.includes(word.toLowerCase()));
    });
    if (fuzzyMatch) {
      const collection = allCollections.find(c => c.id === fuzzyMatch.variableCollectionId);
      console.log(`✓ Found Foundation variable (fuzzy): "${fuzzyMatch.name}" from "${collection?.name || 'Unknown'}" for "${refPath}"`);
      return fuzzyMatch;
    }
  }
  
  // Last resort: log what we're looking for vs what's available (only for first few failures)
  foundationVariableFailureCount++;
  
  if (foundationVariableFailureCount <= 5) {
    console.log(`✗ Foundation variable not found for: "${refPath}" (type: ${variableType})`);
    console.log(`  Searched patterns: ${patterns.slice(0, 3).join(', ')}`);
    console.log(`  Available ${variableType} variables in Foundation collections (first 10):`, 
      foundationVariables.slice(0, 10).map(v => v.name).join(', ') || 'None found');
    console.log(`  Available ${variableType} variables total (first 10):`, 
      typedVariables.slice(0, 10).map(v => v.name).join(', '));
  }
  
  return null;
}

// Helper: Recursively extract all tokens from component token structure
// Returns tokens with their full path and metadata (category, state, property)
function extractTokensFromComponent(
  obj: any,
  prefix: string = '',
  tokens: Array<{ 
    path: string; 
    token: TokenValue;
    category?: string;
    state?: string;
    property?: string;
    variant?: string;
  }> = [],
  metadata: { category?: string; state?: string; variant?: string; property?: string } = {}
): Array<{ 
  path: string; 
  token: TokenValue;
  category?: string;
  state?: string;
  property?: string;
  variant?: string;
}> {
  for (const [key, value] of Object.entries(obj)) {
    const currentPath = prefix ? `${prefix}.${key}` : key;
    
    // Detect category, state, and property from path
    let newMetadata: { category?: string; state?: string; variant?: string; property?: string } = { ...metadata };
    const keyLower = key.toLowerCase();
    
    // Detect states
    if (['default', 'hover', 'active', 'focused', 'disabled', 'selected', 'unselected'].includes(keyLower)) {
      newMetadata.state = key;
    }
    
    // Detect categories
    if (['color', 'border', 'typography', 'effects', 'spacing', 'sizing'].includes(keyLower)) {
      newMetadata.category = key;
    }
    
    // Detect properties
    if (['background', 'text', 'icon', 'border', 'shadow', 'radius', 'padding', 'gap'].includes(keyLower)) {
      newMetadata.property = key;
    }
    
    if (value && typeof value === 'object' && 'value' in value && 'type' in value) {
      // This is a token
      tokens.push({ 
        path: currentPath, 
        token: value as TokenValue,
        category: newMetadata.category,
        state: newMetadata.state,
        property: newMetadata.property,
        variant: newMetadata.variant
      });
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      // Recursively process nested objects
      extractTokensFromComponent(value, currentPath, tokens, newMetadata);
    }
  }
  
  return tokens;
}

// Helper: Build variable name from token metadata
// Format: component / category / state / property (or component / category / property if no state)
function buildVariableName(
  componentName: string,
  category: string | undefined,
  state: string | undefined,
  property: string | undefined
): string {
  const parts: string[] = [componentName];
  
  if (category) {
    parts.push(category);
  }
  
  if (state && state !== 'default') {
    parts.push(state);
  }
  
  if (property) {
    parts.push(property);
  }
  
  return parts.join(' / ');
}

// Update existing component variables to alias Foundation variables from HighRise 1.2 Foundations
async function createComponentVariables(
  componentName: string, 
  componentTokenData: ComponentTokenFile,
  onProgress?: (progress: number, message: string, estimatedTime?: number) => void
): Promise<boolean> {
  const startTime = Date.now();
  console.log(`\n🔍 Updating existing variables for component: ${componentName}`);
  console.log(`🔍 Component token data keys:`, Object.keys(componentTokenData));
  console.log(`🔍 Component token data:`, componentTokenData);
  
  try {
    // Get component tokens object
    console.log(`🔍 Looking for component: ${componentName}`);
    const componentTokens = componentTokenData[componentName] || componentTokenData[Object.keys(componentTokenData)[0]];
    console.log(`🔍 Found component tokens:`, componentTokens ? 'YES' : 'NO');
    console.log(`🔍 Component tokens structure:`, componentTokens ? Object.keys(componentTokens).slice(0, 10) : 'N/A');
    
    if (!componentTokens) {
      const errorMsg = `No component data found for ${componentName}`;
      console.error(`❌ ${errorMsg}`);
      console.error(`Available keys:`, Object.keys(componentTokenData));
      figma.notify(errorMsg);
      onProgress?.(0, errorMsg, 0);
      return false;
    }
    
    // Extract all tokens first (like semantic-colors plugin does)
    console.log(`📊 Starting token extraction...`);
    onProgress?.(5, `Extracting tokens from ${componentName}...`);
    
    const extractStartTime = Date.now();
    const allTokens = extractTokensFromComponent(componentTokens);
    const extractTime = Date.now() - extractStartTime;
    
    console.log(`📋 Found ${allTokens.length} tokens in component ${componentName} (took ${extractTime}ms)`);
    if (allTokens.length > 0) {
      console.log(`📋 First few tokens:`, allTokens.slice(0, 5).map(t => ({ path: t.path, type: t.token.type })));
    } else {
      console.log(`⚠️  No tokens extracted! Component structure:`, Object.keys(componentTokens).slice(0, 10));
    }
    
    if (allTokens.length === 0) {
      const errorMsg = `No tokens found in component ${componentName}`;
      console.error(`❌ ${errorMsg}`);
      figma.notify(errorMsg);
      return false;
    }
    
    // Filter out typography and shadow tokens
    console.log(`🔍 Filtering tokens...`);
    const processableTokens = allTokens.filter(({ token }) => 
      token.type !== 'typography' && token.type !== 'boxShadow' && token.type !== 'shadow'
    );
    
    const skippedCount = allTokens.length - processableTokens.length;
    console.log(`📊 Processable tokens: ${processableTokens.length}, Skipped: ${skippedCount}`);
    
    if (processableTokens.length === 0) {
      const errorMsg = `No processable tokens found in component ${componentName} (all ${allTokens.length} tokens are typography/shadows or invalid)`;
      console.error(`❌ ${errorMsg}`);
      figma.notify(errorMsg);
      onProgress?.(0, errorMsg, 0);
      return false;
    }
    
    // Normalize component name for collection name
    const collectionName = componentName.charAt(0).toUpperCase() + componentName.slice(1).replace(/-/g, ' ');
    console.log(`📁 Looking for collection: "${collectionName}"`);
    
    onProgress?.(10, `Finding collection "${collectionName}"...`);
    
    // Find existing collection (DO NOT CREATE)
    const allCollections = figma.variables.getLocalVariableCollections();
    const collection = allCollections.find(c => 
      c.name.toLowerCase() === collectionName.toLowerCase()
    );
    
    if (!collection) {
      const errorMsg = `Collection "${collectionName}" not found. Please create variables first using Token Studio plugin.`;
      console.error(`❌ ${errorMsg}`);
      figma.notify(errorMsg);
      onProgress?.(0, errorMsg, 0);
      return false;
    }
    
    console.log(`✅ Found existing collection: "${collectionName}"`);
    
    // Log available variables in collection for debugging
    const collectionVariables = figma.variables.getLocalVariables().filter(v => 
      v.variableCollectionId === collection.id
    );
    console.log(`📋 Collection "${collectionName}" has ${collectionVariables.length} variables`);
    if (collectionVariables.length > 0 && collectionVariables.length <= 20) {
      console.log(`📋 Sample variables:`, collectionVariables.slice(0, 10).map(v => v.name).join(', '));
    } else if (collectionVariables.length > 20) {
      console.log(`📋 First 10 variables:`, collectionVariables.slice(0, 10).map(v => v.name).join(', '));
      console.log(`📋 Last 10 variables:`, collectionVariables.slice(-10).map(v => v.name).join(', '));
    }
    
    // Get default mode (must exist)
    const defaultMode = collection.modes[0];
    if (!defaultMode) {
      const errorMsg = `Collection "${collectionName}" has no modes. Please ensure variables are properly set up.`;
      console.error(`❌ ${errorMsg}`);
      figma.notify(errorMsg);
      onProgress?.(0, errorMsg, 0);
      return false;
    }
    
    // Estimate time: ~30ms per token (lookup + update)
    const estimatedTimeMs = processableTokens.length * 30;
    const estimatedSeconds = Math.ceil(estimatedTimeMs / 1000);
    
    onProgress?.(15, `Updating ${processableTokens.length} variables (estimated ${estimatedSeconds}s)...`, estimatedSeconds);
    
    let updatedCount = 0;
    let notFoundCount = 0;
    let errorCount = 0;
    let runtimeSkippedCount = 0;
    
    // Process tokens in batches for progress updates
    const batchSize = Math.max(10, Math.floor(processableTokens.length / 20)); // Update progress ~20 times
    
    for (let i = 0; i < processableTokens.length; i++) {
      const { path, token } = processableTokens[i];
      
      // Declare variables in outer scope for error handling
      let variableName: string = '';
      let variableType: 'COLOR' | 'FLOAT' | 'STRING' | null = null;
      let refPath: string | null = null;
      let directValue: string | number | null = null;
      
      // Update progress every batch
      if (i > 0 && i % batchSize === 0) {
        const progress = 15 + Math.floor((i / processableTokens.length) * 80);
        const remaining = processableTokens.length - i;
        const elapsed = Date.now() - startTime;
        const avgTimePerToken = elapsed / i;
        const estimatedRemaining = Math.ceil((remaining * avgTimePerToken) / 1000);
        onProgress?.(progress, `Processing token ${i + 1}/${processableTokens.length} (${Math.floor((i / processableTokens.length) * 100)}%)...`, estimatedRemaining);
      }
      
      try {
        // Determine variable type from token type
        variableType = null;
        if (token.type === 'color') {
          variableType = 'COLOR';
        } else if (token.type === 'dimension' || token.type === 'spacing' || token.type === 'number') {
          variableType = 'FLOAT';
        } else {
          runtimeSkippedCount++;
          continue;
        }
        
        // Extract token reference from value
        refPath = null;
        directValue = null;
        
        if (typeof token.value === 'string') {
          const refMatch = token.value.match(/\{([^}]+)\}/);
          if (refMatch) {
            refPath = refMatch[1];
          } else {
            // Direct value (hex color or number)
            directValue = token.value;
          }
        } else if (typeof token.value === 'number') {
          directValue = token.value;
        }
        
        // Build variable name from path structure
        // Token Studio typically creates variables preserving the full path structure
        // Convert dot-separated path to slash-separated variable name
        // Example: "button.color.primary.primary.background.default" -> "button / color / primary / primary / background / default"
        const pathParts = path.split('.');
        const componentIndex = pathParts.findIndex(p => p.toLowerCase() === componentName.toLowerCase());
        
        if (componentIndex === -1) {
          // Component name not found in path, use full path
          variableName = path.replace(/\./g, ' / ');
        } else {
          // Build variable name from path parts after component name
          // Preserve all parts to match Token Studio's naming convention
          const nameParts = pathParts.slice(componentIndex).map(p => p);
          variableName = nameParts.join(' / ');
        }
        
        // Find existing variable in collection (DO NOT CREATE)
        // Use the collectionVariables we already fetched above
        
        // Try multiple naming patterns (Token Studio may use different formats)
        const searchPatterns = [
          variableName, // Exact match: "button / color / primary / primary / background / default"
          variableName.toLowerCase(), // Lowercase
          variableName.replace(/\s+\/\s+/g, '/'), // No spaces: "button/color/primary/primary/background/default"
          variableName.replace(/\s+\/\s+/g, ' / '), // Normalized spaces
          // Try without component name prefix (in case Token Studio doesn't include it)
          pathParts.slice(componentIndex + 1).join(' / '), // "color / primary / primary / background / default"
          pathParts.slice(componentIndex + 1).join('/'), // "color/primary/primary/background/default"
        ];
        
        let existingVariable: Variable | null = null;
        
        // First try exact matches (case-sensitive)
        for (const pattern of searchPatterns) {
          const found = collectionVariables.find(v => v.name === pattern);
          if (found) {
            existingVariable = found;
            if (i < 10) {
              console.log(`   ✓ Found variable (exact): "${existingVariable.name}"`);
            }
            break;
          }
        }
        
        // If not found, try case-insensitive matches
        if (!existingVariable) {
          for (const pattern of searchPatterns) {
            const found = collectionVariables.find(v => 
              v.name.toLowerCase() === pattern.toLowerCase()
            );
            if (found) {
              existingVariable = found;
              if (i < 10) {
                console.log(`   ✓ Found variable (case-insensitive): "${existingVariable.name}" (searched for "${pattern}")`);
              }
              break;
            }
          }
        }
        
        // If still not found, try partial matches (contains all key parts)
        if (!existingVariable) {
          const keyParts = pathParts.slice(componentIndex + 1).filter(p => 
            !['default', 'hover', 'active', 'focused', 'disabled'].includes(p.toLowerCase())
          );
          if (keyParts.length > 0) {
            const found = collectionVariables.find(v => {
              const varNameLower = v.name.toLowerCase();
              return keyParts.every(part => varNameLower.includes(part.toLowerCase()));
            });
            if (found) {
              existingVariable = found;
              if (i < 10) {
                console.log(`   ✓ Found variable (partial): "${existingVariable.name}"`);
              }
            }
          }
        }
        
        if (!existingVariable) {
          // Variable doesn't exist - skip
          notFoundCount++;
          if (i < 10) {
            console.log(`   ⏭️  Variable not found for path: "${path}"`);
            console.log(`      Searched patterns: ${searchPatterns.slice(0, 3).join(', ')}...`);
            // Show similar variable names for debugging
            const similarVars = collectionVariables.filter(v => {
              const varParts = v.name.toLowerCase().split(/[\/\s]+/);
              const searchParts = pathParts.slice(Math.max(0, componentIndex)).map(p => p.toLowerCase());
              return searchParts.some(part => varParts.includes(part));
            }).slice(0, 3);
            if (similarVars.length > 0) {
              console.log(`      Similar variables found: ${similarVars.map(v => v.name).join(', ')}`);
            }
          }
          continue;
        }
        
        // Get the actual value from the Button variable (in Light mode)
        // We'll match Foundation variables by VALUE, not by name
        let foundationVariable: Variable | null = null;
        
        try {
          const currentValue = existingVariable.valuesByMode[defaultMode.modeId];
          
          // Helper function to resolve variable value recursively
          const resolveVariableValue = (value: VariableAlias | RGB | RGBA | number, depth: number = 0): RGB | RGBA | number | null => {
            if (depth > 10) return null; // Prevent infinite recursion
            
            if (!value) return null;
            
            // If it's already RGB/RGBA, return it
            if (typeof value === 'object' && 'r' in value) {
              return value as RGB | RGBA;
            }
            
            // If it's already a number, return it
            if (typeof value === 'number') {
              return value;
            }
            
            // If it's a VariableAlias, resolve it
            if (typeof value === 'object' && 'type' in value && value.type === 'VARIABLE_ALIAS') {
              const aliasedVar = figma.variables.getVariableById((value as VariableAlias).id);
              if (aliasedVar) {
                const aliasedCollection = allCollections.find(c => c.id === aliasedVar.variableCollectionId);
                if (aliasedCollection && aliasedCollection.modes.length > 0) {
                  const targetMode = aliasedCollection.modes.find(m => m.modeId === defaultMode.modeId) || aliasedCollection.modes[0];
                  const resolvedValue = aliasedVar.valuesByMode[targetMode.modeId];
                  if (resolvedValue) {
                    return resolveVariableValue(resolvedValue as VariableAlias | RGB | RGBA | number, depth + 1);
                  }
                }
              }
            }
            
            return null;
          };
          
          // Resolve the actual value
          const actualValue = resolveVariableValue(currentValue as VariableAlias | RGB | RGBA | number);
          
          // Now find Foundation variable by matching the actual value
          // Exclude the Button collection from the search
          if (actualValue !== null) {
            foundationVariable = findFoundationVariableByValue(actualValue, variableType, defaultMode.modeId, collection.id);
          }
          
          // Fallback: try by reference path if value matching didn't work
          if (!foundationVariable && refPath) {
            foundationVariable = findFoundationVariable(refPath, variableType);
          }
        } catch (valueError) {
          // If we can't get the value, fall back to name-based matching
          if (refPath) {
            foundationVariable = findFoundationVariable(refPath, variableType);
          }
        }
        
        // Update existing variable
        if (foundationVariable) {
          // Alias to Foundation variable
          try {
            const alias: VariableAlias = {
              type: 'VARIABLE_ALIAS',
              id: foundationVariable.id
            };
            existingVariable.setValueForMode(defaultMode.modeId, alias);
            updatedCount++;
            if (i < 10 || updatedCount % 50 === 0) {
              const collection = allCollections.find(c => c.id === foundationVariable!.variableCollectionId);
              console.log(`   ✅ Updated "${variableName}" -> aliased to "${foundationVariable.name}" from "${collection?.name || 'Unknown'}"`);
            }
          } catch (aliasError) {
            console.error(`   ❌ Error aliasing variable "${variableName}" to "${foundationVariable.name}":`, aliasError);
            errorCount++;
            continue;
          }
        } else {
          // Foundation variable not found
          notFoundCount++;
          if (i < 10) {
            console.log(`   ⚠️  Foundation variable not found for "${variableName}" (ref: "${refPath || 'none'}") - skipping`);
          }
          continue;
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.error(`   ❌ Error creating variable for path "${path}":`, errorMsg);
        if (i < 10) {
          console.error(`   ❌ Token details:`, {
            path,
            variableName: variableName || 'unknown',
            variableType,
            refPath,
            directValue,
            tokenType: token.type,
            hasDescription: !!token.description
          });
        }
        errorCount++;
      }
    }
    
    const elapsedSeconds = ((Date.now() - startTime) / 1000).toFixed(1);
    const summary = `\n📊 Summary for ${componentName}:
   ✅ Updated: ${updatedCount} (aliased to Foundation variables)
   ⏭️  Not Found: ${notFoundCount} (variables don't exist - create via Token Studio)
   ⏭️  Skipped: ${skippedCount} (typography/shadows) + ${runtimeSkippedCount} (runtime)
   ❌ Errors: ${errorCount}
   ⏱️  Time: ${elapsedSeconds}s`;
    
    console.log(summary);
    
    onProgress?.(100, `Complete! Updated ${updatedCount} variables`, 0);
    
    const notifyMsg = `${componentName}: ${updatedCount} updated, ${notFoundCount} not found in ${elapsedSeconds}s`;
    figma.notify(notifyMsg);
    
    return updatedCount > 0;
  } catch (error) {
    const errorMsg = `Error creating variables for ${componentName}: ${error}`;
    console.error(`❌ ${errorMsg}`);
    console.error('Full error:', error);
    figma.notify(errorMsg);
    onProgress?.(0, `Error: ${errorMsg}`, 0);
    return false;
  }
}

// Helper: Convert hex to RGB
function hexToRgb(hex: string): RGB {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (result) {
    return {
      r: parseInt(result[1], 16) / 255,
      g: parseInt(result[2], 16) / 255,
      b: parseInt(result[3], 16) / 255
    };
  }
  return { r: 0, g: 0, b: 0 };
}

// Helper: Convert hex with alpha to RGBA
function hexToRgba(hex: string): RGBA {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})?$/i.exec(hex);
  if (result) {
    return {
      r: parseInt(result[1], 16) / 255,
      g: parseInt(result[2], 16) / 255,
      b: parseInt(result[3], 16) / 255,
      a: result[4] ? parseInt(result[4], 16) / 255 : 1
    };
  }
  return { r: 0, g: 0, b: 0, a: 1 };
}

// Helper: Parse pixel value
function parsePixel(value: string): number {
  const match = value.match(/(\d+(?:\.\d+)?)px/);
  return match ? parseFloat(match[1]) : 0;
}

// Helper: Extract hex color from description (fallback when references can't be resolved)
function extractHexFromDescription(description: string | undefined): string | null {
  if (!description) return null;
  // Look for hex pattern in description like "#ffffff" or "#FFFFFF00"
  const hexMatch = description.match(/#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})/);
  return hexMatch ? '#' + hexMatch[1] : null;
}

// Helper: Extract pixel value from description
function extractPixelFromDescription(description: string | undefined): number | null {
  if (!description) return null;
  // Look for pixel pattern like "8px" or "16px" in description
  const pxMatch = description.match(/(\d+(?:\.\d+)?)px/);
  return pxMatch ? parseFloat(pxMatch[1]) : null;
}

// Helper: Sanitize variable name to match Figma variable naming patterns
// Variables can use forward slashes (/) for hierarchy
function sanitizeVariableName(path: string): string {
  // Remove curly braces if present
  let cleanPath = path.replace(/[{}]/g, '');
  
  // Split by dots and process each segment
  const segments = cleanPath.split('.');
  const sanitized = segments.map((segment) => {
    // Keep valid characters (letters, numbers, underscores, hyphens)
    return segment.replace(/[^a-zA-Z0-9_-]/g, '_');
  });
  
  // Join with forward slashes (Figma supports this for variable names)
  return sanitized.join('/');
}

// Helper: Find Figma text style matching typography token reference
// Looks for text styles from Foundations library (Highrise 1.2 Foundations)
// Uses style name pattern matching: {type}/{size}/{weight} -> e.g., body/2xl/semibold
function findTextStyle(typographyToken: TokenValue): TextStyle | null {
  if (!typographyToken || typeof typographyToken.value !== 'string') {
    return null;
  }

  const tokenValue = typographyToken.value;
  // Extract typography reference (e.g., "{font.body.semibold.2xl}" -> "font.body.semibold.2xl")
  const refPath = tokenValue.replace(/[{}]/g, '');
  
  // Get all text styles and filter for "HighRise 1.2 Foundations" library
  const allTextStyles = figma.getLocalTextStyles();
  
  // Filter styles to only use those from "HighRise 1.2 Foundations" library
  // Check style's remote property to identify library source
  const foundationsStyles = allTextStyles.filter(style => {
    // Check if style is from the Foundations library
    // Styles from libraries have remote: true and we can check the library name
    // For now, filter by style name patterns that match Foundations naming
    // Or check if style name doesn't match "1. HighRise" patterns
    const styleName = style.name.toLowerCase();
    
    // Exclude styles from "1. HighRise" file (they often have "Ag Text" prefix or similar)
    if (styleName.includes('ag text') || styleName.startsWith('ag ')) {
      return false;
    }
    
    // Include styles that match Foundations patterns: "Text {size}/{weight}" or "Body {size}/{weight}"
    // These are from HighRise 1.2 Foundations File
    return true; // We'll filter more specifically in the matching logic
  });
  
  // Use foundationsStyles for matching, but fallback to allTextStyles if needed
  const stylesToSearch = foundationsStyles.length > 0 ? foundationsStyles : allTextStyles;
  
  // Try multiple matching strategies
  // Strategy 1: Match by style name pattern {type}/{size}/{weight} -> e.g., body/2xl/semibold
  const pathSegments = refPath.split('.');
  if (pathSegments.length >= 3) {
    // Extract key parts: font.body.semibold.2xl -> body, semibold, 2xl
    const category = pathSegments[1]; // body, heading, subheading, display
    const weight = pathSegments[2]; // regular, medium, semibold, bold
    const size = pathSegments[3]; // 3xs, 2xs, xs, sm, md, lg, xl, 2xl, etc.
    
    // Build style name pattern: {type}/{size}/{weight}
    // Examples: body/2xl/semibold, heading/display/regular
    const styleNamePattern = `${category}/${size}/${weight}`;
    const styleNamePatternAlt = `${category}/${weight}/${size}`; // Alternative pattern
    
    // Build search patterns based on Foundations File naming
    const searchPatterns: string[] = [];
    
    // Pattern 1: body/2xl/semibold -> "Text 2xl/Semibold" (from Foundations File)
    // Match style name pattern: {type}/{size}/{weight} -> Style Name
    const capitalizedWeight = weight.charAt(0).toUpperCase() + weight.slice(1);
    const capitalizedSize = size.toUpperCase();
    
    // Primary pattern: Text {size}/{weight} (e.g., "Text 2xl/Semibold")
    searchPatterns.push(`Text ${capitalizedSize}/${capitalizedWeight}`);
    searchPatterns.push(`Text ${size}/${capitalizedWeight}`);
    
    // Pattern 2: For display/heading styles -> "Display 2xl/Regular"
    if (category === 'display' || category === 'heading' || category === 'subheading') {
      const capitalizedCategory = category.charAt(0).toUpperCase() + category.slice(1);
      searchPatterns.push(`${capitalizedCategory} ${capitalizedSize}/${capitalizedWeight}`);
      searchPatterns.push(`${capitalizedCategory} ${size}/${capitalizedWeight}`);
    }
    
    // Pattern 3: Body {size}/{weight} (alternative)
    if (category === 'body') {
      searchPatterns.push(`Body ${capitalizedSize}/${capitalizedWeight}`);
      searchPatterns.push(`Body ${size}/${capitalizedWeight}`);
    }
    
    // Pattern 4: Alternative format with weight first
    searchPatterns.push(`${category}/${weight}/${size}`);
    
    // Pattern 5: With spaces and capitalization variations
    const capitalizedCategory = category.charAt(0).toUpperCase() + category.slice(1);
    searchPatterns.push(`${capitalizedCategory} ${capitalizedSize}/${capitalizedWeight}`);
    
    // Try to find matching text style from Foundations library
    // Prioritize styles that match "Text {size}/{weight}" pattern from HighRise 1.2 Foundations
    for (const pattern of searchPatterns) {
      const style = stylesToSearch.find(s => {
        const styleNameLower = s.name.toLowerCase();
        const patternLower = pattern.toLowerCase();
        
        // Exclude styles from "1. HighRise" file (they have "Ag Text" prefix)
        if (styleNameLower.includes('ag text') || styleNameLower.startsWith('ag ')) {
          return false;
        }
        
        // Match if style name contains pattern or pattern contains style name
        return styleNameLower.includes(patternLower) || patternLower.includes(styleNameLower) ||
               // Or match by parts (e.g., "Text 2xl/Semibold" matches "body/2xl/semibold")
               (styleNameLower.includes(size.toLowerCase()) && 
                styleNameLower.includes(weight.toLowerCase()) &&
                (styleNameLower.includes(category.toLowerCase()) || styleNameLower.includes('text')));
      });
      if (style) {
        console.log(`✓ Found text style from Foundations: "${style.name}" for typography token "${refPath}" (pattern: ${pattern})`);
        return style;
      }
    }
    
    // Try partial matches (size + weight) - exclude "Ag Text" styles
    const style = stylesToSearch.find(s => {
      const styleName = s.name.toLowerCase();
      // Exclude "Ag Text" styles from 1. HighRise file
      if (styleName.includes('ag text') || styleName.startsWith('ag ')) {
        return false;
      }
      return styleName.includes(weight.toLowerCase()) && styleName.includes(size.toLowerCase());
    });
    if (style) {
      console.log(`✓ Found text style from Foundations (partial match): "${style.name}" for typography token "${refPath}"`);
      return style;
    }
  }
  
  // Strategy 2: Try exact match with sanitized name (exclude "Ag Text" styles)
  const sanitizedName = sanitizeVariableName(refPath);
  const exactMatch = stylesToSearch.find(s => {
    const styleName = s.name.toLowerCase();
    // Exclude "Ag Text" styles from 1. HighRise file
    if (styleName.includes('ag text') || styleName.startsWith('ag ')) {
      return false;
    }
    return styleName === sanitizedName.toLowerCase() ||
           styleName.replace(/[\/\s_-]/g, '') === sanitizedName.toLowerCase().replace(/[\/\s_-]/g, '');
  });
  if (exactMatch) {
    console.log(`✓ Found text style from Foundations (exact match): "${exactMatch.name}" for typography token "${refPath}"`);
    return exactMatch;
  }
  
  console.log(`✗ Text style not found for typography token: "${refPath}"`);
  console.log(`  Available text styles (first 20): ${allTextStyles.slice(0, 20).map(s => s.name).join(', ')}`);
  return null;
}

// Helper: Find Figma effect style matching shadow token reference
// Looks for effect styles from Foundations library (Highrise 1.2 Foundations)
function findEffectStyle(shadowToken: TokenValue): EffectStyle | null {
  if (!shadowToken || typeof shadowToken.value !== 'string') {
    return null;
  }

  const tokenValue = shadowToken.value;
  // Shadow tokens can be like "boxShadow.outer.xs" or "boxShadow.focus.xs.primary.100"
  // Remove "boxShadow." prefix if present
  let shadowPath = tokenValue.replace(/^boxShadow\./, '').replace(/^shadow\./, '');
  
  // Handle "none" shadow
  if (shadowPath === 'none' || shadowPath === 'boxShadow.none') {
    // Return null to indicate no shadow should be applied
    return null;
  }
  
  // Get all effect styles and filter for "HighRise 1.2 Foundations" library
  const allEffectStyles = figma.getLocalEffectStyles();
  
  // Filter styles to only use those from "HighRise 1.2 Foundations" library
  // We'll prioritize styles matching Foundations patterns
  const effectStylesToSearch = allEffectStyles;
  
  // Try multiple matching strategies
  // Strategy 1: Match by style name pattern {type}/{size} -> e.g., outer/xs, focus/xs/primary/100
  const pathSegments = shadowPath.split('.');
  
  if (pathSegments.length >= 2) {
    const category = pathSegments[0]; // outer, focus, inner, etc.
    const size = pathSegments[1]; // xs, sm, md, lg, xl, etc.
    
    // Build search patterns based on Foundations File naming
    const searchPatterns: string[] = [];
    
    // Pattern 1: outer/xs -> "Shadow/xs" (from Foundations File)
    // Match style name pattern: {type}/{size} -> Style Name
    const capitalizedCategory = category.charAt(0).toUpperCase() + category.slice(1);
    const capitalizedSize = size.toUpperCase();
    
    // Primary pattern: Shadow/{size} (e.g., "Shadow/xs", "Shadow/sm")
    searchPatterns.push(`Shadow/${size}`); // Shadow/xs
    searchPatterns.push(`Shadow/${capitalizedSize}`); // Shadow/XS
    
    // Pattern 2: Outer/{size} (alternative)
    searchPatterns.push(`${capitalizedCategory}/${capitalizedSize}`); // Outer/XS
    searchPatterns.push(`${capitalizedCategory} ${capitalizedSize}`); // Outer XS
    searchPatterns.push(`${category}/${size}`); // outer/xs
    
    // Pattern 3: For focus shadows with color: focus.xs.primary.100 -> focus/xs/primary/100 -> "Focus ring/xs focused 4px primary-100"
    if (pathSegments.length >= 4 && category === 'focus') {
      const color = pathSegments[2]; // primary, neutral, error, etc.
      const value = pathSegments[3]; // 100, etc.
      const capitalizedColor = color.charAt(0).toUpperCase() + color.slice(1);
      
      // Primary pattern: "Focus ring/xs focused 4px primary-100" (from Foundations File)
      searchPatterns.push(`Focus ring/${size} focused 4px ${color}-${value}`);
      searchPatterns.push(`Focus ring/${capitalizedSize} focused 4px ${capitalizedColor}-${value}`);
      
      // Alternative patterns
      searchPatterns.push(`Focus/${capitalizedColor} ${capitalizedSize}`);
      searchPatterns.push(`Focus ${capitalizedSize} ${capitalizedColor}`);
      searchPatterns.push(`Focus/${capitalizedColor}/${capitalizedSize}`);
      searchPatterns.push(`${category}/${size}/${color}/${value}`);
      searchPatterns.push(`focus/${size}/${color}/${value}`);
    }
    
    // Try to find matching effect style from Foundations library
    // Prioritize styles matching "Shadow/{size}" or "Outer/{size}" patterns
    for (const pattern of searchPatterns) {
      const style = effectStylesToSearch.find(s => {
        const styleName = s.name.toLowerCase();
        const patternLower = pattern.toLowerCase();
        
        // Prioritize exact matches for Foundations patterns
        // "Shadow/xs", "Shadow/sm", "Focus ring/xs focused 4px primary-100"
        // Match if style name contains pattern or pattern contains style name
        return styleName.includes(patternLower) || patternLower.includes(styleName);
      });
      if (style) {
        console.log(`✓ Found effect style from Foundations: "${style.name}" for shadow token "${tokenValue}" (pattern: ${pattern})`);
        return style;
      }
    }
    
    // Try partial matches (category + size) - prioritize Foundations patterns
    const style = effectStylesToSearch.find(s => {
      const styleName = s.name.toLowerCase();
      // Match "Shadow" or "Outer" with size
      const matchesCategory = styleName.includes(category.toLowerCase()) || 
                              (category === 'outer' && styleName.includes('shadow'));
      return matchesCategory && styleName.includes(size.toLowerCase());
    });
    if (style) {
      console.log(`✓ Found effect style from Foundations (partial match): "${style.name}" for shadow token "${tokenValue}"`);
      return style;
    }
  }
  
  // Strategy 2: Try exact match with sanitized name
  const sanitizedName = sanitizeVariableName(shadowPath);
  const exactMatch = allEffectStyles.find(s => 
    s.name.toLowerCase() === sanitizedName.toLowerCase() ||
    s.name.toLowerCase().replace(/[\/\s_-]/g, '') === sanitizedName.toLowerCase().replace(/[\/\s_-]/g, '')
  );
  if (exactMatch) {
    console.log(`✓ Found effect style (exact match): "${exactMatch.name}" for shadow token "${tokenValue}"`);
    return exactMatch;
  }
  
  console.log(`✗ Effect style not found for shadow token: "${tokenValue}"`);
  console.log(`  Available effect styles (first 20): ${allEffectStyles.slice(0, 20).map(s => s.name).join(', ')}`);
  return null;
}

// Helper: Find variable in Figma collections by reference or name
// PRIORITY: Component-specific variables FIRST, then semantic/primitive as fallback
function findVariable(token: TokenValue, componentName: string, property: string, state?: string): Variable | null {
  const allVariables = figma.variables.getLocalVariables();
  const allCollections = figma.variables.getLocalVariableCollections();
  
  // Normalize component name for matching
  const componentPart = componentName.toLowerCase().replace(/_/g, '-');
  
  // Determine category from property
  let category = 'color';
  let actualProperty = property;
  
  // Handle padding properties specially
  if (property.includes('padding horizontal') || property === 'horizontal') {
    category = 'padding';
    actualProperty = 'horizontal';
  } else if (property.includes('padding vertical') || property === 'vertical') {
    category = 'padding';
    actualProperty = 'vertical';
  } else if (property.includes('gap')) {
    category = 'gap';
    actualProperty = property.includes('horizontal') ? 'horizontal' : 'content';
  } else if (property.includes('radius') || property.includes('border')) {
    category = 'border';
    if (property.includes('radius')) {
      actualProperty = 'radius';
    }
  } else if (property === 'width') {
    category = 'sizing';
    actualProperty = 'width';
  } else if (property === 'height') {
    category = 'sizing';
    actualProperty = 'height';
  }
  
  // STRATEGY 1: PRIORITY - Look for component-specific variables in component's collection
  // First, try to find a collection named after the component
  const componentCollection = allCollections.find(c => 
    c.name.toLowerCase() === componentPart ||
    c.name.toLowerCase().includes(componentPart) ||
    componentPart.includes(c.name.toLowerCase())
  );
  
  if (componentCollection) {
    console.log(`🔍 Searching in component collection: "${componentCollection.name}"`);
    
    // Get variables from this collection
    const componentVariables = allVariables.filter(v => 
      v.variableCollectionId === componentCollection.id
    );
    
    // Build component-specific search patterns (HIGHEST PRIORITY)
    const componentPatterns: string[] = [];
    
    if (state) {
      // Pattern: component / category / state / property
      componentPatterns.push(`${componentPart} / ${category} / ${state} / ${actualProperty}`);
      componentPatterns.push(`${componentPart}/${category}/${state}/${actualProperty}`);
      // Pattern: component / state / property (without category)
      componentPatterns.push(`${componentPart} / ${state} / ${actualProperty}`);
      componentPatterns.push(`${componentPart}/${state}/${actualProperty}`);
    }
    
    // Pattern without state
    componentPatterns.push(`${componentPart} / ${category} / ${actualProperty}`);
    componentPatterns.push(`${componentPart}/${category}/${actualProperty}`);
    // Pattern: just component + property (e.g., "content-switcher-item / background")
    componentPatterns.push(`${componentPart} / ${actualProperty}`);
    componentPatterns.push(`${componentPart}/${actualProperty}`);
    componentPatterns.push(`${componentPart}.${actualProperty}`);
    
    // Try exact matches first in component collection
    for (const pattern of componentPatterns) {
      const variable = componentVariables.find(v => 
        v.name.toLowerCase() === pattern.toLowerCase()
      );
      if (variable) {
        console.log(`✓ Found component-specific variable: "${variable.name}" in collection "${componentCollection.name}"`);
        return variable;
      }
    }
    
    // Try partial matches in component collection
    for (const pattern of componentPatterns) {
      const variable = componentVariables.find(v => 
        v.name.toLowerCase().includes(pattern.toLowerCase()) ||
        pattern.toLowerCase().includes(v.name.toLowerCase())
      );
      if (variable) {
        console.log(`✓ Found component-specific variable (partial match): "${variable.name}" in collection "${componentCollection.name}"`);
        return variable;
      }
    }
  }
  
  // STRATEGY 2: Search ALL variables for component-specific patterns (even if not in component collection)
  // This catches cases where component variables might be in a different collection
  const allComponentPatterns: string[] = [];
  
  if (state) {
    allComponentPatterns.push(`${componentPart} / ${category} / ${state} / ${actualProperty}`);
    allComponentPatterns.push(`${componentPart}/${category}/${state}/${actualProperty}`);
    allComponentPatterns.push(`${componentPart} / ${state} / ${actualProperty}`);
    allComponentPatterns.push(`${componentPart}/${state}/${actualProperty}`);
  }
  
  allComponentPatterns.push(`${componentPart} / ${category} / ${actualProperty}`);
  allComponentPatterns.push(`${componentPart}/${category}/${actualProperty}`);
  allComponentPatterns.push(`${componentPart} / ${actualProperty}`);
  allComponentPatterns.push(`${componentPart}/${actualProperty}`);
  allComponentPatterns.push(`${componentPart}.${actualProperty}`);
  
  // Try exact matches across all variables
  for (const pattern of allComponentPatterns) {
    const variable = allVariables.find(v => 
      v.name.toLowerCase() === pattern.toLowerCase()
    );
    if (variable) {
      console.log(`✓ Found component-specific variable (all vars): "${variable.name}"`);
      return variable;
    }
  }
  
  // Try partial matches across all variables (component name must be in variable name)
  for (const pattern of allComponentPatterns) {
    const variable = allVariables.find(v => {
      const varName = v.name.toLowerCase();
      return varName.includes(componentPart) && 
             (varName.includes(actualProperty.toLowerCase()) || varName.includes(pattern.toLowerCase()));
    });
    if (variable) {
      console.log(`✓ Found component-specific variable (partial, all vars): "${variable.name}"`);
      return variable;
    }
  }
  
  // STRATEGY 3: Use token reference if available (semantic/primitive fallback)
  if (token.reference) {
    const refPath = token.reference.replace(/[{}]/g, '');
    const sanitizedName = sanitizeVariableName(refPath);
    
    // Try exact match
    let variable = allVariables.find(v => v.name === sanitizedName);
    if (variable) {
      console.log(`⚠ Found variable by reference (semantic/primitive): "${sanitizedName}" - consider creating component-specific variable`);
      return variable;
    }
    
    // Try with slashes replaced by dots
    const dotName = sanitizedName.replace(/\//g, '.');
    variable = allVariables.find(v => v.name === dotName);
    if (variable) {
      console.log(`⚠ Found variable by reference (semantic/primitive, dot format): "${dotName}" - consider creating component-specific variable`);
      return variable;
    }
  }
  
  // STRATEGY 4: Search by property name alone (LAST RESORT - semantic/primitive)
  const propertyOnly = actualProperty.toLowerCase();
  const variable = allVariables.find(v => 
    v.name.toLowerCase().endsWith(`/${propertyOnly}`) ||
    v.name.toLowerCase().endsWith(`.${propertyOnly}`) ||
    v.name.toLowerCase().includes(propertyOnly)
  );
  
  if (variable) {
    console.log(`⚠ Found variable by property only (semantic/primitive): "${variable.name}" - consider creating component-specific variable`);
    return variable;
  }
  
  console.log(`✗ Variable not found for: component="${componentPart}", property="${actualProperty}", category="${category}", state="${state || 'none'}"`);
  console.log(`  Searched component patterns: ${allComponentPatterns.join(', ')}`);
  console.log(`  Component collection searched: ${componentCollection ? componentCollection.name : 'none found'}`);
  console.log(`  Available variables in component collection: ${componentCollection ? allVariables.filter(v => v.variableCollectionId === componentCollection.id).map(v => v.name).join(', ') : 'N/A'}`);
  console.log(`  Available variables (first 20): ${allVariables.slice(0, 20).map(v => v.name).join(', ')}`);
  
  return null;
}

// Helper: Get typography token from component token file
function getTypographyToken(componentName: string, size?: string, state: string = 'default'): TokenValue | null {
  // Normalize component name (handle kebab-case, camelCase, etc.)
  const normalizedComponentName = componentName.toLowerCase().replace(/-/g, '').replace(/_/g, '');
  
  // Try to find component in loaded token files
  let componentTokens: any = null;
  for (const [key, value] of Object.entries(componentTokenFiles)) {
    const normalizedKey = key.toLowerCase().replace(/-/g, '').replace(/_/g, '');
    if (normalizedKey === normalizedComponentName || normalizedKey.includes(normalizedComponentName) || normalizedComponentName.includes(normalizedKey)) {
      componentTokens = value[key] || value[Object.keys(value)[0]];
      break;
    }
  }
  
  if (!componentTokens || !componentTokens.typography) {
    return null;
  }
  
  const typography = componentTokens.typography;
  
  // Try to find typography token by size (e.g., "sm", "md", "lg")
  if (size && typography[size]) {
    const token = typography[size];
    if (token && typeof token === 'object' && 'value' in token && token.type === 'typography') {
      return token as TokenValue;
    }
  }
  
  // Try to find typography token by state (e.g., "default", "hover", "active")
  if (typography[state]) {
    const token = typography[state];
    if (token && typeof token === 'object' && 'value' in token && token.type === 'typography') {
      return token as TokenValue;
    }
  }
  
  // Try default state
  if (typography['default']) {
    const token = typography['default'];
    if (token && typeof token === 'object' && 'value' in token && token.type === 'typography') {
      return token as TokenValue;
    }
  }
  
  // Try first available typography token
  const firstKey = Object.keys(typography)[0];
  if (firstKey) {
    const token = typography[firstKey];
    if (token && typeof token === 'object' && 'value' in token && token.type === 'typography') {
      return token as TokenValue;
    }
  }
  
  return null;
}

// Helper: Get shadow token from component token file
function getShadowToken(componentName: string, state: string = 'default', variant?: string): TokenValue | null {
  // Normalize component name (handle kebab-case, camelCase, etc.)
  const normalizedComponentName = componentName.toLowerCase().replace(/-/g, '').replace(/_/g, '');
  
  // Try to find component in loaded token files
  let componentTokens: any = null;
  for (const [key, value] of Object.entries(componentTokenFiles)) {
    const normalizedKey = key.toLowerCase().replace(/-/g, '').replace(/_/g, '');
    if (normalizedKey === normalizedComponentName || normalizedKey.includes(normalizedComponentName) || normalizedComponentName.includes(normalizedKey)) {
      componentTokens = value[key] || value[Object.keys(value)[0]];
      break;
    }
  }
  
  if (!componentTokens || !componentTokens.effects || !componentTokens.effects.shadow) {
    return null;
  }
  
  const shadowTokens = componentTokens.effects.shadow;
  
  // Try to find shadow token by state and variant (e.g., focused.primary)
  if (variant && shadowTokens[state] && typeof shadowTokens[state] === 'object' && variant in shadowTokens[state]) {
    const token = (shadowTokens[state] as Record<string, TokenValue>)[variant];
    if (token && typeof token === 'object' && 'value' in token && (token.type === 'boxShadow' || token.type === 'shadow')) {
      return token;
    }
  }
  
  // Try to find shadow token by state
  if (shadowTokens[state] && typeof shadowTokens[state] === 'object' && 'value' in shadowTokens[state]) {
    const token = shadowTokens[state] as TokenValue;
    if (token.type === 'boxShadow' || token.type === 'shadow') {
      return token;
    }
  }
  
  // Try default state
  if (shadowTokens['default'] && typeof shadowTokens['default'] === 'object' && 'value' in shadowTokens['default']) {
    const token = shadowTokens['default'] as TokenValue;
    if (token.type === 'boxShadow' || token.type === 'shadow') {
      return token;
    }
  }
  
  return null;
}

// Helper: Get token value
function getTokenValue(mapping: TokenMapping, tokenPath: string): TokenValue | null {
  // If tokenPath is a reference like {color.background.neutral.base}, search by reference
  if (tokenPath.startsWith('{') && tokenPath.endsWith('}')) {
    const ref = tokenPath;
    // Search through all tokens to find one with matching reference
    for (const [key, token] of Object.entries(mapping.tokens)) {
      if (token.reference === ref) {
        console.log(`Found token by reference: ${ref} → ${key} = ${token.value}`);
        return token;
      }
    }
    console.log(`Token reference not found: ${ref}`);
  }

  // Try direct path (full path like "content-switcher-item.border.radius")
  if (mapping.tokens[tokenPath]) {
    console.log(`Found token by direct path: ${tokenPath} = ${mapping.tokens[tokenPath].value}`);
    return mapping.tokens[tokenPath];
  }

  // Try with component name prefix (if tokenPath doesn't already include it)
  const componentName = mapping.component;
  if (!tokenPath.startsWith(componentName)) {
    const fullPath = `${componentName}.${tokenPath}`;
    if (mapping.tokens[fullPath]) {
      console.log(`Found token with component prefix: ${fullPath} = ${mapping.tokens[fullPath].value}`);
      return mapping.tokens[fullPath];
    }
  }

  // Try without component name prefix (if tokenPath already includes it)
  if (tokenPath.startsWith(`${componentName}.`)) {
    const withoutPrefix = tokenPath.substring(componentName.length + 1);
    if (mapping.tokens[withoutPrefix]) {
      console.log(`Found token without prefix: ${withoutPrefix} = ${mapping.tokens[withoutPrefix].value}`);
      return mapping.tokens[withoutPrefix];
    }
  }

  // Last resort: search for token key that ends with the path
  const pathParts = tokenPath.split('.');
  const lastPart = pathParts[pathParts.length - 1];
  for (const [key, token] of Object.entries(mapping.tokens)) {
    if (key.endsWith(`.${lastPart}`) || key === lastPart) {
      console.log(`Found token by partial match: ${key} = ${token.value}`);
      return token;
    }
  }

  console.log(`Token not found for path: ${tokenPath} (component: ${componentName})`);
  return null;
}

// Helper: Determine state from node name
function getNodeState(node: SceneNode): string {
  // PRIORITY 1: Read from component properties (most accurate)
  const stateFromProps = getComponentProperty(node, 'State');
  if (stateFromProps) {
    // Normalize state values
    const normalizedState = normalizeState(stateFromProps);
    console.log(`✓ Extracted state from component property: ${normalizedState} (node: ${node.name})`);
    return normalizedState;
  }
  
  // PRIORITY 2: Parse from node name (fallback)
  const name = node.name;
  
  // Parse "State=Default", "State=Hover", etc.
  const stateMatch = name.match(/State=([^,]+)/i);
  if (stateMatch) {
    const state = normalizeState(stateMatch[1].toLowerCase().trim());
    console.log(`✓ Extracted state from node name: ${state} (node: ${node.name})`);
    return state;
  }
  
  // PRIORITY 3: Fallback to pattern matching in name
  const nameLower = name.toLowerCase();
  if (nameLower.includes('selected') || nameLower.includes('state=selected')) {
    return 'selected';
  }
  
  if (nameLower.includes('hover')) {
    return 'hover';
  }
  
  if (nameLower.includes('active')) {
    return 'active';
  }
  
  if (nameLower.includes('focused') || nameLower.includes('focussed')) {
    return 'focused';
  }
  
  if (nameLower.includes('disabled')) {
    return 'disabled';
  }
  
  if (nameLower.includes('default') || nameLower.includes('unselected') || 
      nameLower.includes('state=default') || nameLower.includes('state=unselected')) {
    return 'default';
  }

  return 'default'; // Default fallback
}

// Helper: Normalize state values (e.g., "Focussed" -> "focused", "Default" -> "default")
function normalizeState(state: string): string {
  const stateLower = state.toLowerCase().trim();
  
  // Normalize common variations
  if (stateLower === 'focussed') return 'focused';
  if (stateLower === 'unselected') return 'default';
  if (stateLower === 'enabled') return 'default';
  
  // Return normalized state
  return stateLower;
}

// Helper: Check if node is a nested component instance
function isNestedComponent(node: SceneNode): boolean {
  if (node.type === 'INSTANCE' && node.mainComponent) {
    return true;
  }
  // Check if node name suggests it's a component (tag, badge, checkbox, etc.)
  const nodeName = node.name.toLowerCase();
  const nestedComponentNames = ['tag', 'badge', 'checkbox', 'button', 'icon', 'avatar', 'avatar-profile-photo'];
  return nestedComponentNames.some(name => nodeName.includes(name));
}

// Helper: Get component property value (case-insensitive search)
function getComponentProperty(node: SceneNode, propertyName: string): string | undefined {
  if (node.type === 'INSTANCE' && node.componentProperties) {
    // Try exact match first (case-sensitive)
    const exactProp = node.componentProperties[propertyName];
    if (exactProp !== undefined && exactProp !== null) {
      // ComponentPropertyValue can be string, boolean, or ComponentPropertyType
      const propValue = exactProp as any;
      if (typeof propValue === 'string') {
        return propValue.toLowerCase().trim();
      }
    }
    
    // Try case-insensitive search
    const propertyNameLower = propertyName.toLowerCase();
    for (const [key, value] of Object.entries(node.componentProperties)) {
      if (key.toLowerCase() === propertyNameLower) {
        // ComponentPropertyValue can be string, boolean, or ComponentPropertyType
        const propValue = value as any;
        if (typeof propValue === 'string') {
          return propValue.toLowerCase().trim();
        }
      }
    }
  }
  return undefined;
}

// Helper: Extract size from component properties OR node name
function extractSizeFromNode(node: SceneNode): string | undefined {
  // PRIORITY 1: Read from component properties (most accurate)
  const sizeFromProps = getComponentProperty(node, 'Size');
  if (sizeFromProps) {
    console.log(`✓ Extracted size from component property: ${sizeFromProps} (node: ${node.name})`);
    return sizeFromProps;
  }
  
  // PRIORITY 2: Parse from node name (fallback)
  const name = node.name;
  
  // Parse "Size=sm", "Size=md", etc.
  const sizeMatch = name.match(/Size=([^,]+)/i);
  if (sizeMatch) {
    const size = sizeMatch[1].toLowerCase().trim();
    console.log(`✓ Extracted size from node name: ${size} (node: ${node.name})`);
    return size;
  }
  
  // PRIORITY 3: Fallback to pattern matching in name
  const nameLower = name.toLowerCase();
  const sizePatterns = ['3xs', '2xs', 'xs', 'sm', 'md', 'lg', 'xl', '2xl'];
  for (const size of sizePatterns) {
    if (nameLower.includes(size)) {
      console.log(`✓ Extracted size from name pattern: ${size} (node: ${node.name})`);
      return size;
    }
  }
  
  return undefined;
}

// Helper: Extract variant from component properties OR node name
function extractVariantFromNode(node: SceneNode): string | undefined {
  // PRIORITY 1: Read from component properties (most accurate)
  const variantFromProps = getComponentProperty(node, 'Variant');
  if (variantFromProps) {
    console.log(`✓ Extracted variant from component property: ${variantFromProps} (node: ${node.name})`);
    return variantFromProps;
  }
  
  // PRIORITY 2: Parse from node name (fallback)
  const name = node.name;
  
  // Parse "Variant=Primary", "Variant=Secondary", etc.
  const variantMatch = name.match(/Variant=([^,]+)/i);
  if (variantMatch) {
    const variant = variantMatch[1].toLowerCase().trim();
    console.log(`✓ Extracted variant from node name: ${variant} (node: ${node.name})`);
    return variant;
  }
  
  // PRIORITY 3: Fallback to pattern matching in name
  const nameLower = name.toLowerCase();
  const variantPatterns = ['primary', 'secondary', 'tertiary', 'neutral', 'error', 'success', 'warning', 'info', 'ghost', 'outlined', 'destructive'];
  for (const variant of variantPatterns) {
    if (nameLower.includes(variant)) {
      console.log(`✓ Extracted variant from name pattern: ${variant} (node: ${node.name})`);
      return variant;
    }
  }
  
  return undefined;
}

// Extract theme from component properties OR node name
// Normalizes theme names (e.g., "destructive" -> "error", "warning" -> "warning", etc.)
function extractThemeFromNode(node: SceneNode): string | undefined {
  // PRIORITY 1: Read from component properties (most accurate)
  const themeFromProps = getComponentProperty(node, 'Theme');
  if (themeFromProps) {
    const normalizedTheme = normalizeTheme(themeFromProps);
    console.log(`✓ Extracted theme from component property: ${themeFromProps} -> ${normalizedTheme} (node: ${node.name})`);
    return normalizedTheme;
  }
  
  // PRIORITY 2: Parse from node name (fallback)
  const name = node.name;
  const themeMatch = name.match(/Theme=([^,]+)/i);
  if (themeMatch) {
    const theme = themeMatch[1].toLowerCase().trim();
    const normalizedTheme = normalizeTheme(theme);
    console.log(`✓ Extracted theme from node name: ${theme} -> ${normalizedTheme} (node: ${node.name})`);
    return normalizedTheme;
  }
  
  // PRIORITY 3: Check if name contains theme keywords
  const nameLower = name.toLowerCase();
  if (nameLower.includes('destructive') || nameLower.includes('error')) {
    console.log(`✓ Extracted theme from name pattern: destructive/error -> error (node: ${node.name})`);
    return 'error';
  }
  if (nameLower.includes('success')) {
    console.log(`✓ Extracted theme from name pattern: success (node: ${node.name})`);
    return 'success';
  }
  if (nameLower.includes('warning')) {
    console.log(`✓ Extracted theme from name pattern: warning (node: ${node.name})`);
    return 'warning';
  }
  if (nameLower.includes('neutral')) {
    console.log(`✓ Extracted theme from name pattern: neutral (node: ${node.name})`);
    return 'neutral';
  }
  
  return undefined;
}

// Normalize theme names to match variable naming conventions
// "destructive" -> "error" (for button/color/error/... variables)
// Other themes stay as-is: primary, neutral, success, warning
function normalizeTheme(theme: string): string {
  const themeLower = theme.toLowerCase().trim();
  
  // Map "destructive" to "error" (variable naming convention)
  if (themeLower === 'destructive' || themeLower === 'destructive/error' || themeLower.includes('destructive')) {
    return 'error';
  }
  
  // Return normalized theme (lowercase)
  return themeLower;
}

// Apply tokens to a node - BINDS VARIABLES instead of setting direct values
// Only applies properties relevant to the node type
// Generate basic instructions from tokens when instructions are missing
function generateInstructionsFromTokens(mapping: TokenMapping, state: 'selected' | 'default'): any {
  const instructions: any = { container: {}, text: {}, icon: {} };
  const tokens = mapping.tokens;
  
  // Find tokens for the given state (or default if state-specific not found)
  const stateKeys = Object.keys(tokens).filter(key => {
    const keyLower = key.toLowerCase();
    // Match tokens ending with .state or containing .state.
    const endsWithState = keyLower.endsWith(`.${state}`) || keyLower.endsWith(`=${state}`);
    const containsState = keyLower.includes(`.${state}.`) || keyLower.includes(`=${state}=`);
    
    if (state === 'default') {
      // For default, also match tokens that don't have selected/active/hover/focused/disabled
      const hasOtherState = keyLower.includes('.selected') || keyLower.includes('.active') || 
                           keyLower.includes('.hover') || keyLower.includes('.focused') || 
                           keyLower.includes('.disabled');
      return endsWithState || containsState || (!hasOtherState && (keyLower.includes('.default') || keyLower.includes('default')));
    }
    
    return endsWithState || containsState;
  });
  
  // Extract variant and size from node name if available
  // For now, use primary/default variant
  for (const tokenKey of stateKeys) {
    const token = tokens[tokenKey];
    if (!token || !token.figma_property) continue;
    
    const prop = token.figma_property;
    const target = prop.target || 'container';
    
    if (prop.property === 'fills' && target === 'container') {
      if (tokenKey.includes('.background.')) {
        instructions.container.background = tokenKey;
      }
    } else if (prop.property === 'strokes' && target === 'container') {
      if (tokenKey.includes('.border.')) {
        instructions.container.border = tokenKey;
      }
    } else if (prop.property === 'cornerRadius') {
      if (tokenKey.includes('.radius') || tokenKey.includes('.border.')) {
        instructions.container.borderRadius = tokenKey;
      }
    } else if (prop.property === 'fills' && target === 'text') {
      if (tokenKey.includes('.text.')) {
        instructions.text.color = tokenKey;
      }
    } else if (prop.property === 'fills' && target === 'icon') {
      if (tokenKey.includes('.icon.')) {
        instructions.icon.color = tokenKey;
      }
    }
  }
  
  // Return instructions only if we found at least one token
  return Object.keys(instructions.container).length > 0 || 
         Object.keys(instructions.text).length > 0 || 
         Object.keys(instructions.icon).length > 0 ? instructions : null;
}

// Find variable by path in Figma collections
// For colors: theme is the theme (primary, neutral, error, success, warning), variant is the button variant (primary, secondary, etc.)
// For dimensions: variant is typically 'regular' or empty, theme is not used
function findVariableByPath(componentName: string, category: string, variant: string, property: string, state: string, size?: string, theme?: string): Variable | null {
  const allVariables = figma.variables.getLocalVariables();
  const allCollections = figma.variables.getLocalVariableCollections();
  
  // Find component collection
  const componentCollection = allCollections.find(c => 
    c.name.toLowerCase() === componentName.toLowerCase() ||
    c.name.toLowerCase().includes(componentName.toLowerCase())
  );
  
  if (!componentCollection) {
    console.log(`⚠ Component collection "${componentName}" not found. Available collections: ${allCollections.map(c => c.name).join(', ')}`);
    return null;
  }
  
  const componentVariables = allVariables.filter(v => 
    v.variableCollectionId === componentCollection.id
  );
  
  // Debug: Log first few variable names to see the pattern
  if (componentVariables.length > 0 && componentVariables.length <= 20) {
    console.log(`📋 Available variables in "${componentCollection.name}": ${componentVariables.slice(0, 10).map(v => v.name).join(', ')}...`);
  }
  
  // Build possible variable name patterns
  // Handle special patterns like: button/regular/padding/default/x/sm
  // where category=regular, variant=padding, property=default, state=x, size=sm
  const patterns: string[] = [];
  
  // Special pattern: button/regular/padding/{state}/x/{size} or button/regular/padding/{state}/y/{size}
  if (category === 'regular' && size && property && (property === 'x' || property === 'y')) {
    patterns.push(
      `${componentName}/${category}/padding/${state}/${property}/${size}`, // button/regular/padding/default/x/sm
      `${componentName}/${category}/padding/${property}/${size}`, // button/regular/padding/x/sm (no state)
      `${componentName}/padding/${property}/${size}` // button/padding/x/sm (fallback)
    );
  }
  
  // Special pattern: button/regular/padding/{state}/{size} (combined horizontal & vertical)
  if (category === 'regular' && size && !property && state) {
    patterns.push(
      `${componentName}/${category}/padding/${state}/${size}`, // button/regular/padding/default/sm
      `${componentName}/padding/${state}/${size}` // button/padding/default/sm (fallback)
    );
  }
  
  // Special pattern: button/regular/gap/{size}
  if (category === 'regular' && size && !property && !variant) {
    patterns.push(
      `${componentName}/${category}/gap/${size}`, // button/regular/gap/sm
      `${componentName}/gap/${size}` // button/gap/sm (fallback)
    );
  }
  
  // Special pattern: button/regular/height/{state}/{size} or button/regular/icon/size/{size}
  if (category === 'regular' && size) {
    if (variant === 'height' && state) {
      patterns.push(
        `${componentName}/${category}/${variant}/${state}/${size}`, // button/regular/height/default/sm
        `${componentName}/${category}/${variant}/${size}`, // button/regular/height/sm
        `${componentName}/${variant}/${size}` // button/height/sm (fallback)
      );
    }
    if (variant === 'icon' && property === 'size') {
      patterns.push(
        `${componentName}/${category}/${variant}/${property}/${size}`, // button/regular/icon/size/sm
        `${componentName}/${variant}/${property}/${size}` // button/icon/size/sm (fallback)
      );
    }
  }
  
  // Standard patterns with all parts
  // For colors: use theme/variant pattern (button/color/{theme}/{variant}/{property}/{state})
  // For other categories: use variant pattern (button/{category}/{variant}/{property}/{state})
  if (variant && property && state) {
    if (category === 'color' && theme) {
      // Color pattern: button/color/{theme}/{variant}/{property}/{state}
      // e.g., button/color/neutral/secondary/text/default
      patterns.push(
        `${componentName}/${category}/${theme}/${variant}/${property}/${state}`, // button/color/neutral/secondary/text/default
        `${componentName}/${category}/${theme}/${property}/${state}`, // button/color/neutral/text/default (fallback)
        `${componentName}/${category}/${variant}/${property}/${state}`, // button/color/secondary/text/default (legacy fallback)
        `${componentName}/${category}/${property}/${state}` // button/color/text/default (final fallback)
      );
    } else {
      // Non-color pattern: button/{category}/{variant}/{property}/{state}
      patterns.push(
        `${componentName}/${category}/${variant}/${variant}/${property}/${state}`, // button/border/primary/primary/width/default (legacy)
        `${componentName}/${category}/${variant}/${property}/${state}`, // button/border/primary/width/default
        `${componentName}/${category}/${property}/${state}` // button/border/width/default
      );
    }
  }
  
  // Size-specific patterns (size can be part of path or at the end)
  if (size) {
    if (variant && property && state) {
      if (category === 'color' && theme) {
        // Color pattern with size: button/color/{theme}/{variant}/{property}/{state}/{size}
        patterns.unshift(
          `${componentName}/${category}/${theme}/${variant}/${property}/${state}/${size}`, // button/color/neutral/secondary/text/default/sm
          `${componentName}/${category}/${theme}/${property}/${state}/${size}`, // button/color/neutral/text/default/sm
          `${componentName}/${category}/${theme}/${variant}/${property}/${size}/${state}`, // button/color/neutral/secondary/text/sm/default
          `${componentName}/${category}/${variant}/${property}/${state}/${size}`, // button/color/secondary/text/default/sm (legacy fallback)
          `${componentName}/${category}/${property}/${state}/${size}` // button/color/text/default/sm (final fallback)
        );
      } else {
        // Non-color pattern with size
        patterns.unshift(
          `${componentName}/${category}/${variant}/${variant}/${property}/${state}/${size}`, // button/border/primary/primary/width/default/sm (legacy)
          `${componentName}/${category}/${variant}/${property}/${state}/${size}`, // button/border/primary/width/default/sm
          `${componentName}/${category}/${property}/${state}/${size}`, // button/border/width/default/sm
          `${componentName}/${category}/${variant}/${variant}/${property}/${size}/${state}`, // button/border/primary/primary/width/sm/default
          `${componentName}/${category}/${variant}/${property}/${size}/${state}`, // button/border/primary/width/sm/default
          `${componentName}/${category}/${property}/${size}/${state}` // button/border/width/sm/default
        );
      }
    }
    // Patterns where size replaces state (for dimension tokens like padding.x.sm)
    if (variant && property) {
      patterns.unshift(
        `${componentName}/${category}/${variant}/${property}/${size}`, // button/padding/primary/x/sm
        `${componentName}/${category}/${property}/${size}`, // button/padding/x/sm
        `${componentName}/${category}/${size}` // button/padding/sm (if property is empty)
      );
    }
  }
  
  // If property is empty or variant is used as property (e.g., gap.sm)
  // Also handle case where size is passed as the last parameter
  if (size && (!property || property === '')) {
    if (variant && variant !== '') {
      patterns.unshift(
        `${componentName}/${category}/${variant}/${size}`, // button/gap/primary/sm
        `${componentName}/${category}/${size}` // button/gap/sm
      );
    } else {
      patterns.unshift(
        `${componentName}/${category}/${size}` // button/gap/sm
      );
    }
  }
  
  // Handle case where size is the property (e.g., padding.x.sm where sm is size)
  if (size && property && property !== '' && variant === '') {
    patterns.unshift(
      `${componentName}/${category}/${property}/${size}`, // button/padding/x/sm
      `${componentName}/${category}/${size}` // button/padding/sm (fallback)
    );
  }
  
  // Also try with different state mappings (hover -> hover, active -> active, etc.)
  // But also try default as fallback
  const statePatterns = [state];
  if (state !== 'default') {
    statePatterns.push('default'); // Fallback to default state
  }
  
  // Try all state variations
  const allPatterns: string[] = [];
  for (const statePattern of statePatterns) {
    for (const basePattern of patterns) {
      allPatterns.push(basePattern.replace(`/${state}`, `/${statePattern}`));
    }
  }
  
  // Try exact match first (case-insensitive)
  for (const pattern of allPatterns) {
    const patternLower = pattern.toLowerCase();
    const variable = componentVariables.find(v => {
      const varNameLower = v.name.toLowerCase();
      return varNameLower === patternLower || 
             varNameLower.replace(/[\/\\]/g, '/') === patternLower.replace(/[\/\\]/g, '/');
    });
    if (variable) {
      console.log(`✓ Found variable by exact match: "${variable.name}" for pattern "${pattern}"`);
      return variable;
    }
  }
  
  // Try partial match (contains all key parts in order)
  const searchParts = [componentName, category, variant, property, state].filter(Boolean);
  for (const variable of componentVariables) {
    const varNameLower = variable.name.toLowerCase().replace(/[\/\\]/g, '/');
    // Check if all search parts appear in order
    let lastIndex = -1;
    let allFound = true;
    for (const part of searchParts) {
      const partLower = part.toLowerCase();
      const index = varNameLower.indexOf(partLower, lastIndex + 1);
      if (index === -1) {
        allFound = false;
        break;
      }
      lastIndex = index;
    }
    if (allFound) {
      console.log(`✓ Found variable by partial match: "${variable.name}" for parts [${searchParts.join(', ')}]`);
      return variable;
    }
  }
  
  // Last resort: try matching just category + property + state (ignore variant)
  const simpleParts = [componentName, category, property, state].filter(Boolean);
  for (const variable of componentVariables) {
    const varNameLower = variable.name.toLowerCase().replace(/[\/\\]/g, '/');
    if (simpleParts.every(part => varNameLower.includes(part.toLowerCase()))) {
      console.log(`✓ Found variable by simple match: "${variable.name}" for parts [${simpleParts.join(', ')}]`);
      return variable;
    }
  }
  
  return null;
}

async function applyTokensToNode(
  node: SceneNode,
  mapping: TokenMapping,
  state: 'selected' | 'default',
  options: ApplyOptions,
  isChildNode: boolean = false
): Promise<boolean> {
  let updated = false;
  const componentName = mapping.component;
  
  // Extract variant, theme, size, and state from component properties OR node name
  // For child nodes (text, icon), get properties from parent button component
  let nodeSize = extractSizeFromNode(node);
  let nodeVariant = extractVariantFromNode(node);
  let nodeTheme = extractThemeFromNode(node);
  let nodeState = getNodeState(node);
  
  // If variant/theme/size/state not found in current node, try parent (for text/icon nodes inside button)
  if (!nodeVariant || !nodeTheme || !nodeSize || !nodeState || nodeState === 'default') {
    let parent: BaseNode | null = node.parent;
    let depth = 0;
    while (parent && depth < 5) {
      if ('name' in parent) {
        const parentNode = parent as SceneNode;
        if (!nodeVariant) {
          const parentVariant = extractVariantFromNode(parentNode);
          if (parentVariant) {
            nodeVariant = parentVariant;
            console.log(`✓ Extracted variant from parent: ${nodeVariant} (node: ${node.name}, parent: ${parentNode.name})`);
          }
        }
        if (!nodeTheme) {
          const parentTheme = extractThemeFromNode(parentNode);
          if (parentTheme) {
            nodeTheme = parentTheme;
            console.log(`✓ Extracted theme from parent: ${nodeTheme} (node: ${node.name}, parent: ${parentNode.name})`);
          }
        }
        if (!nodeSize) {
          const parentSize = extractSizeFromNode(parentNode);
          if (parentSize) {
            nodeSize = parentSize;
            console.log(`✓ Extracted size from parent: ${nodeSize} (node: ${node.name}, parent: ${parentNode.name})`);
          }
        }
        if (!nodeState || nodeState === 'default') {
          const parentState = getNodeState(parentNode);
          if (parentState && parentState !== 'default') {
            nodeState = parentState;
            console.log(`✓ Extracted state from parent: ${nodeState} (node: ${node.name}, parent: ${parentNode.name})`);
          }
        }
      }
      parent = parent.parent;
      depth++;
    }
  }
  
  // Default fallbacks
  nodeVariant = nodeVariant || 'primary';
  nodeTheme = nodeTheme || 'primary'; // Default theme to 'primary' if not found
  nodeState = nodeState || 'default';
  
  // Log extracted properties for debugging
  console.log(`📋 Node: ${node.name} | Variant: ${nodeVariant} | Theme: ${nodeTheme} | State: ${nodeState} | Size: ${nodeSize}`);
  
  // If this is a child node and it's a nested component, skip applying parent tokens
  if (isChildNode && isNestedComponent(node)) {
    return false;
  }

  // Check if this is an icon placeholder component early (before applying container styles)
  // Icon placeholder: layer name "placeholder", "Icon Leading", "Icon Trailing", or instance from icon library
  const nodeNameLower = node.name.toLowerCase();
  const isIconPlaceholder = nodeNameLower === 'placeholder' || 
                            nodeNameLower.includes('placeholder') ||
                            (nodeNameLower.includes('icon') && (nodeNameLower.includes('leading') || nodeNameLower.includes('trailing'))) ||
                            (node.type === 'INSTANCE' && nodeNameLower.includes('icon') && 
                             node.mainComponent && node.mainComponent.name.toLowerCase().includes('icon'));
  
  // Apply container styles (only to frames/components)
  // Don't skip if it's the main button instance - we want to apply to it
  // BUT skip color application for icon placeholder components
  const shouldApplyContainer = !isChildNode && 
                                (node.type === 'FRAME' || node.type === 'COMPONENT' || node.type === 'INSTANCE');
  
  if (shouldApplyContainer) {
    // Background color - SKIP for icon placeholder components
    // Pattern: button/color/{theme}/{variant}/background/{state} (e.g., button/color/neutral/secondary/background/default)
    if (options.updateColors && 'fills' in node && !isIconPlaceholder) {
      console.log(`🔍 Searching background color for theme: ${nodeTheme}, variant: ${nodeVariant}, state: ${nodeState}`);
      
      // Try pattern: button/color/{theme}/{variant}/background/{state}
      let variable = findVariableByPath(componentName, 'color', nodeVariant, 'background', nodeState, nodeSize, nodeTheme);
      console.log(`🔍 Pattern (button/color/${nodeTheme}/${nodeVariant}/background/${nodeState}): ${variable ? `Found: ${variable.name}` : 'Not found'}`);
      
      if (variable) {
        console.log(`🔍 Found background variable: "${variable.name}" for node "${node.name}" (theme: ${nodeTheme}, variant: ${nodeVariant}, state: ${nodeState}, size: ${nodeSize})`);
        if (variable.resolvedType === 'COLOR') {
          try {
                if (!node.fills || (Array.isArray(node.fills) && node.fills.length === 0)) {
                  node.fills = [{ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }];
                }
                if (Array.isArray(node.fills) && node.fills.length > 0) {
                  const firstFill = node.fills[0];
                  if (firstFill.type === 'SOLID') {
                const boundPaint = figma.variables.setBoundVariableForPaint(firstFill, 'color', variable);
                    node.fills = [boundPaint, ...node.fills.slice(1)];
                    updated = true;
                console.log(`✓ Bound background variable "${variable.name}" to ${node.name}`);
          } else {
                console.log(`⚠ First fill is not SOLID type: ${firstFill.type}`);
                  }
                }
              } catch (e) {
            console.error(`❌ Error binding background variable "${variable.name}":`, e);
            }
          } else {
          console.log(`⚠ Background variable "${variable.name}" is not COLOR type: ${variable.resolvedType}`);
        }
      } else {
        console.log(`⚠ Background variable not found for: button/color/${nodeTheme}/${nodeVariant}/background/${nodeState}`);
      }
    }

    // Border color - SKIP for icon placeholder components
    // Pattern: button/color/{theme}/{variant}/border/{state} (e.g., button/color/neutral/secondary/border/default)
    if (options.updateColors && 'strokes' in node && !isIconPlaceholder) {
      console.log(`🔍 Searching border color for theme: ${nodeTheme}, variant: ${nodeVariant}, state: ${nodeState}`);
      
      // Try pattern: button/color/{theme}/{variant}/border/{state}
      let variable = findVariableByPath(componentName, 'color', nodeVariant, 'border', nodeState, nodeSize, nodeTheme);
      console.log(`🔍 Pattern (button/color/${nodeTheme}/${nodeVariant}/border/${nodeState}): ${variable ? `Found: ${variable.name}` : 'Not found'}`);
      
      if (variable) {
        console.log(`🔍 Found border variable: "${variable.name}" for node "${node.name}" (theme: ${nodeTheme}, variant: ${nodeVariant})`);
        if (variable.resolvedType === 'COLOR') {
          try {
                if (!node.strokes || (Array.isArray(node.strokes) && node.strokes.length === 0)) {
                  node.strokes = [{ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }];
                }
                if (Array.isArray(node.strokes) && node.strokes.length > 0) {
                  const firstStroke = node.strokes[0];
                  if (firstStroke.type === 'SOLID') {
                const boundPaint = figma.variables.setBoundVariableForPaint(firstStroke, 'color', variable);
                    node.strokes = [boundPaint, ...node.strokes.slice(1)];
                    updated = true;
                console.log(`✓ Bound border variable "${variable.name}" to ${node.name}`);
          } else {
                console.log(`⚠ First stroke is not SOLID type: ${firstStroke.type}`);
                  }
                }
              } catch (e) {
            console.error(`❌ Error binding border variable "${variable.name}":`, e);
          }
        } else {
          console.log(`⚠ Border variable "${variable.name}" is not COLOR type: ${variable.resolvedType}`);
        }
        } else {
        console.log(`⚠ Border variable not found for: button/color/${nodeVariant}/${nodeVariant}/border/${nodeState}`);
      }
    }

    // Border radius - size-specific, exclude for icon/placeholder
    if (options.updateDimensions && 'cornerRadius' in node && nodeSize) {
      // Skip border radius for icon/placeholder components
      const nodeNameLower = node.name.toLowerCase();
      if (nodeNameLower.includes('icon') && nodeNameLower.includes('placeholder')) {
        // Skip - icon placeholder shouldn't have border radius
        } else {
        // Try size-specific patterns: button/border/default/radius/{state}/{size} or button/border/{variant}/radius/{size}
        let variable = findVariableByPath(componentName, 'border', 'default', 'radius', nodeState, nodeSize);
        if (!variable) {
          variable = findVariableByPath(componentName, 'border', nodeVariant, 'radius', nodeState, nodeSize);
        }
        if (!variable) {
          // Try without state: button/border/default/radius/{size}
          variable = findVariableByPath(componentName, 'border', 'default', 'radius', '', nodeSize);
        }
        if (variable) {
          console.log(`🔍 Found borderRadius variable: "${variable.name}" for node "${node.name}"`);
          if (variable.resolvedType === 'FLOAT') {
            try {
              if ('topLeftRadius' in node) node.setBoundVariable('topLeftRadius', variable);
              if ('topRightRadius' in node) node.setBoundVariable('topRightRadius', variable);
              if ('bottomLeftRadius' in node) node.setBoundVariable('bottomLeftRadius', variable);
              if ('bottomRightRadius' in node) node.setBoundVariable('bottomRightRadius', variable);
              updated = true;
              console.log(`✓ Bound borderRadius variable "${variable.name}" to ${node.name}`);
            } catch (e) {
              console.error(`❌ Error binding borderRadius variable "${variable.name}":`, e);
            }
          } else {
            console.log(`⚠ BorderRadius variable "${variable.name}" is not FLOAT type: ${variable.resolvedType}`);
          }
        } else {
          console.log(`⚠ BorderRadius variable not found for: button/border/${nodeVariant}/radius/${nodeState}/${nodeSize}`);
        }
      }
    }

    // Padding (horizontal and vertical) - size-specific
    // Pattern: button/regular/padding/{state}/x/{size} (e.g., button/regular/padding/default/x/md)
    if (options.updateDimensions && 'paddingLeft' in node && nodeSize) {
      console.log(`🔍 Searching padding variables for size: ${nodeSize}, state: ${nodeState}`);
      
      // Try size-specific patterns: button/regular/padding/{state}/x/{size}
      // Parameters: componentName, category='regular', variant='padding', property='x', state=nodeState, size=nodeSize
      let paddingHVar = findVariableByPath(componentName, 'regular', 'padding', 'x', nodeState, nodeSize);
      console.log(`🔍 Pattern 1 (button/regular/padding/${nodeState}/x/${nodeSize}): ${paddingHVar ? `Found: ${paddingHVar.name}` : 'Not found'}`);
      
      if (!paddingHVar) {
        // Try: button/regular/padding/x/{size} (without state)
        paddingHVar = findVariableByPath(componentName, 'regular', 'padding', 'x', '', nodeSize);
        console.log(`🔍 Pattern 2 (button/regular/padding/x/${nodeSize}): ${paddingHVar ? `Found: ${paddingHVar.name}` : 'Not found'}`);
      }
      
      if (!paddingHVar) {
        // Try: button/padding/x/{size} (fallback)
        paddingHVar = findVariableByPath(componentName, 'padding', '', 'x', '', nodeSize);
        console.log(`🔍 Pattern 3 (button/padding/x/${nodeSize}): ${paddingHVar ? `Found: ${paddingHVar.name}` : 'Not found'}`);
      }
      
      // Vertical padding: button/regular/padding/{state}/y/{size}
      let paddingVVar = findVariableByPath(componentName, 'regular', 'padding', 'y', nodeState, nodeSize);
      console.log(`🔍 Pattern 1 (button/regular/padding/${nodeState}/y/${nodeSize}): ${paddingVVar ? `Found: ${paddingVVar.name}` : 'Not found'}`);
      
      if (!paddingVVar) {
        // Try: button/regular/padding/y/{size} (without state)
        paddingVVar = findVariableByPath(componentName, 'regular', 'padding', 'y', '', nodeSize);
        console.log(`🔍 Pattern 2 (button/regular/padding/y/${nodeSize}): ${paddingVVar ? `Found: ${paddingVVar.name}` : 'Not found'}`);
      }
      
      if (!paddingVVar) {
        // Try: button/padding/y/{size} (fallback)
        paddingVVar = findVariableByPath(componentName, 'padding', '', 'y', '', nodeSize);
        console.log(`🔍 Pattern 3 (button/padding/y/${nodeSize}): ${paddingVVar ? `Found: ${paddingVVar.name}` : 'Not found'}`);
      }
      
      // Try combined padding pattern: button/regular/padding/{state}/{size} (applies to both horizontal and vertical)
      if (!paddingHVar || !paddingVVar) {
        const combinedPaddingVar = findVariableByPath(componentName, 'regular', 'padding', nodeState, '', nodeSize);
        if (combinedPaddingVar && combinedPaddingVar.resolvedType === 'FLOAT') {
          if (!paddingHVar) {
            paddingHVar = combinedPaddingVar;
            console.log(`🔍 Using combined padding variable for horizontal: "${combinedPaddingVar.name}"`);
          }
          if (!paddingVVar) {
            paddingVVar = combinedPaddingVar;
            console.log(`🔍 Using combined padding variable for vertical: "${combinedPaddingVar.name}"`);
          }
        }
      }
      
      if (paddingHVar) {
        console.log(`🔍 Found padding horizontal variable: "${paddingHVar.name}" for node "${node.name}"`);
        if (paddingHVar.resolvedType === 'FLOAT') {
          try {
            node.setBoundVariable('paddingLeft', paddingHVar);
            node.setBoundVariable('paddingRight', paddingHVar);
                updated = true;
            console.log(`✓ Bound padding horizontal variable "${paddingHVar.name}" to ${node.name}`);
              } catch (e) {
            console.error(`❌ Error binding padding horizontal variable "${paddingHVar.name}":`, e);
            }
          } else {
          console.log(`⚠ Padding horizontal variable "${paddingHVar.name}" is not FLOAT type: ${paddingHVar.resolvedType}`);
        }
              } else {
        console.log(`⚠ Padding horizontal variable not found for: button/padding/${nodeVariant}/horizontal/${nodeState}`);
      }
      
      if (paddingVVar) {
        console.log(`🔍 Found padding vertical variable: "${paddingVVar.name}" for node "${node.name}"`);
        if (paddingVVar.resolvedType === 'FLOAT') {
          try {
            node.setBoundVariable('paddingTop', paddingVVar);
            node.setBoundVariable('paddingBottom', paddingVVar);
              updated = true;
            console.log(`✓ Bound padding vertical variable "${paddingVVar.name}" to ${node.name}`);
              } catch (e) {
            console.error(`❌ Error binding padding vertical variable "${paddingVVar.name}":`, e);
            }
          } else {
          console.log(`⚠ Padding vertical variable "${paddingVVar.name}" is not FLOAT type: ${paddingVVar.resolvedType}`);
        }
      } else {
        console.log(`⚠ Padding vertical variable not found for: button/padding/${nodeVariant}/vertical/${nodeState}`);
      }
    }

    // Gap (for auto-layout frames) - size-specific
    if (options.updateDimensions && 'itemSpacing' in node && nodeSize) {
      // Try size-specific patterns: button/regular/gap/{size}
      let gapVar = findVariableByPath(componentName, 'regular', 'gap', '', '', nodeSize);
      if (!gapVar) {
        gapVar = findVariableByPath(componentName, 'gap', nodeVariant, 'gap', nodeState, nodeSize);
      }
      if (!gapVar) {
        // Try: button/gap/{size} - use size as property, empty variant and state
        gapVar = findVariableByPath(componentName, 'gap', '', '', '', nodeSize);
      }
      if (gapVar) {
        console.log(`🔍 Found gap variable: "${gapVar.name}" for node "${node.name}"`);
        if (gapVar.resolvedType === 'FLOAT') {
          try {
            node.setBoundVariable('itemSpacing', gapVar);
              updated = true;
            console.log(`✓ Bound gap variable "${gapVar.name}" to ${node.name}`);
            } catch (e) {
            console.error(`❌ Error binding gap variable "${gapVar.name}":`, e);
            }
          } else {
          console.log(`⚠ Gap variable "${gapVar.name}" is not FLOAT type: ${gapVar.resolvedType}`);
        }
          } else {
        console.log(`⚠ Gap variable not found for: button/gap/${nodeVariant}/content/${nodeState}`);
      }
    }

    // Apply shadow/effect styles from Foundations File
    // Match style names from HighRise 1.2 Foundations File
    // Pattern: boxShadow.outer.xs -> outer/xs -> Shadow/xs
    // Pattern: boxShadow.focus.xs.primary.100 -> focus/xs/primary/100 -> Focus ring/xs focused 4px primary-100
    if (options.updateShadows && mapping && mapping.tokens && 'effects' in node) {
      // Look for shadow tokens - check button.effects.shadow.{state} pattern
      let shadowKeys: string[] = [];
      
      // For focused state, check variant-specific shadow first
      if (nodeState === 'focused' || nodeState === 'focussed') {
        const variantShadowKey = `${componentName}.effects.shadow.focused.${nodeVariant}`;
        if (mapping.tokens[variantShadowKey]) {
          shadowKeys.push(variantShadowKey);
        }
      }
      
      // Check for state-specific shadow tokens
      const stateShadowKey = `${componentName}.effects.shadow.${nodeState}`;
      if (mapping.tokens[stateShadowKey]) {
        shadowKeys.push(stateShadowKey);
      }
      
      // Also search for any shadow tokens
      shadowKeys.push(...Object.keys(mapping.tokens).filter(key => 
        key.includes('.shadow.') || 
        key.includes('.effects.shadow.') ||
        key.includes('effects.shadow.')
      ));
      
      for (const key of shadowKeys) {
        const token = mapping.tokens[key];
        if (token) {
          // Shadow tokens have value directly (e.g., "boxShadow.outer.xs")
          let shadowValue: string | null = null;
          
          if (typeof token.value === 'string') {
            shadowValue = token.value;
          } else if (token.reference && typeof token.reference === 'string') {
            shadowValue = token.reference;
          }
          
          if (shadowValue) {
            if (shadowValue === 'none' || shadowValue.includes('none')) {
              // Remove shadows if token is "none"
              try {
                node.effects = [];
                updated = true;
                console.log(`✓ Removed shadows from ${node.name} (token: none)`);
              } catch (e) {
                console.error(`Error removing shadows:`, e);
              }
              break;
            }
            
            // Create a token-like object for findEffectStyle
            const shadowToken: TokenValue = {
              value: shadowValue,
              type: 'boxShadow'
            };
            
            const effectStyle = findEffectStyle(shadowToken);
            if (effectStyle) {
              try {
                node.effects = effectStyle.effects;
              updated = true;
                console.log(`✓ Applied effect style "${effectStyle.name}" to ${node.name} (from token: ${key}, value: ${shadowValue})`);
            } catch (e) {
                console.error(`Error applying effect style "${effectStyle.name}":`, e);
            }
              break; // Apply first matching style
          } else {
              console.log(`⚠ Effect style not found for shadow token: ${shadowValue}`);
            }
          }
        }
      }
    }

    // Height - size-specific (exclude width only if variable name contains "border")
    if (options.updateDimensions && nodeSize) {
      // Only exclude width if variable name contains "border" (border width = stroke width, not component width)
      if ('width' in node) {
        const widthVar = findVariableByPath(componentName, 'width', nodeVariant, 'width', nodeState, nodeSize);
        if (widthVar && widthVar.resolvedType === 'FLOAT') {
          // Check if variable name contains "border" - if so, skip (it's for stroke width)
          if (widthVar.name.toLowerCase().includes('border')) {
            console.log(`⚠ Skipping width variable "${widthVar.name}" - it's for border width (stroke width), not component width`);
          } else {
            try {
              node.setBoundVariable('width', widthVar);
              updated = true;
              console.log(`✓ Bound width variable "${widthVar.name}" to ${node.name}`);
            } catch (e) {
              console.error(`❌ Error binding width variable "${widthVar.name}":`, e);
            }
          }
        }
      }
      
      // Height - size-specific: button/regular/height/{state}/{size} or button/height/{size}
      if ('height' in node) {
        // Pattern: button/regular/height/{state}/{size} (e.g., button/regular/height/default/md)
        // Parameters: componentName, category='regular', variant='height', property='', state=nodeState, size=nodeSize
        let heightVar = findVariableByPath(componentName, 'regular', 'height', '', nodeState, nodeSize);
        console.log(`🔍 Searching height variable: button/regular/height/${nodeState}/${nodeSize} (found: ${heightVar ? heightVar.name : 'none'})`);
        
        if (!heightVar) {
          // Try: button/regular/height/{size} (without state)
          heightVar = findVariableByPath(componentName, 'regular', 'height', '', '', nodeSize);
          console.log(`🔍 Searching height variable (no state): button/regular/height/${nodeSize} (found: ${heightVar ? heightVar.name : 'none'})`);
        }
        
        if (!heightVar) {
          // Try: button/height/{size} (fallback)
          heightVar = findVariableByPath(componentName, 'height', '', '', '', nodeSize);
          console.log(`🔍 Searching height variable (fallback): button/height/${nodeSize} (found: ${heightVar ? heightVar.name : 'none'})`);
        }
        if (heightVar) {
          console.log(`🔍 Found height variable: "${heightVar.name}" for node "${node.name}"`);
          if (heightVar.resolvedType === 'FLOAT') {
            try {
              node.setBoundVariable('height', heightVar);
                updated = true;
              console.log(`✓ Bound height variable "${heightVar.name}" to ${node.name}`);
            } catch (e) {
              console.error(`❌ Error binding height variable "${heightVar.name}":`, e);
            }
          }
          } else {
          console.log(`⚠ Height variable not found for: button/height/${nodeSize}`);
        }
      }
    }
  }

  // Apply text styles and colors
  if (node.type === 'TEXT') {
    // Apply text color
    // Pattern: button/color/{variant}/{variant}/text/{state} (e.g., button/color/secondary/secondary/text/default)
    if (options.updateColors) {
      console.log(`🔍 Searching text color for variant: ${nodeVariant}, state: ${nodeState}, size: ${nodeSize}`);
      
      // Try pattern: button/color/{variant}/{variant}/text/{state}
      let variable = findVariableByPath(componentName, 'color', nodeVariant, 'text', nodeState, nodeSize);
      console.log(`🔍 Pattern 1 (button/color/${nodeVariant}/${nodeVariant}/text/${nodeState}): ${variable ? `Found: ${variable.name}` : 'Not found'}`);
      
      if (!variable) {
        // Try pattern: button/color/{variant}/text/{state}
        variable = findVariableByPath(componentName, 'color', nodeVariant, 'text', nodeState, nodeSize);
        console.log(`🔍 Pattern 2 (button/color/${nodeVariant}/text/${nodeState}): ${variable ? `Found: ${variable.name}` : 'Not found'}`);
      }
      
      if (!variable) {
        // Try pattern: button/color/text/{state} (fallback)
        variable = findVariableByPath(componentName, 'color', '', 'text', nodeState, nodeSize);
        console.log(`🔍 Pattern 3 (button/color/text/${nodeState}): ${variable ? `Found: ${variable.name}` : 'Not found'}`);
      }
      
          if (variable && variable.resolvedType === 'COLOR') {
            try {
              if (!node.fills || (Array.isArray(node.fills) && node.fills.length === 0)) {
                node.fills = [{ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }];
              }
              if (Array.isArray(node.fills) && node.fills.length > 0) {
                const firstFill = node.fills[0];
                if (firstFill.type === 'SOLID') {
              const boundPaint = figma.variables.setBoundVariableForPaint(firstFill, 'color', variable);
                  node.fills = [boundPaint, ...node.fills.slice(1)];
                  updated = true;
              console.log(`✓ Bound text color variable "${variable.name}" to ${node.name}`);
                }
              }
            } catch (e) {
              console.error('Error binding text color variable:', e);
        }
      }
    }
    
    // Apply typography from Foundations File
    // Match style names from HighRise 1.2 Foundations File
    // Pattern: {font.body.semibold.2xl} -> body/2xl/semibold -> Text 2xl/Semibold
    if (options.updateTypography && mapping && mapping.tokens) {
      // Look for typography tokens - check button.typography.{size} pattern
      let typographyKeys: string[] = [];
      
      // Check if there's a typography token for the current size
      if (nodeSize) {
        const sizeSpecificKey = `${componentName}.typography.${nodeSize}`;
        if (mapping.tokens[sizeSpecificKey]) {
          typographyKeys.push(sizeSpecificKey);
        }
      }
      
      // Also search for any typography tokens
      typographyKeys.push(...Object.keys(mapping.tokens).filter(key => 
        key.includes('.typography.') || key.includes('typography.')
      ));
      
      for (const key of typographyKeys) {
        const token = mapping.tokens[key];
        if (token) {
          // Check both value and reference fields for font token
          let fontTokenValue: string | null = null;
          
          if (typeof token.value === 'string' && token.value.includes('{font.')) {
            fontTokenValue = token.value;
          } else if (token.reference && typeof token.reference === 'string' && token.reference.includes('{font.')) {
            fontTokenValue = token.reference;
          }
          
          if (fontTokenValue) {
            // Create a token-like object for findTextStyle
            const typographyToken: TokenValue = {
              value: fontTokenValue,
              type: 'typography'
            };
            
          const textStyle = findTextStyle(typographyToken);
          if (textStyle) {
            try {
              node.textStyleId = textStyle.id;
              updated = true;
                console.log(`✓ Applied text style "${textStyle.name}" to ${node.name} (from token: ${key}, reference: ${fontTokenValue})`);
            } catch (e) {
                console.error(`Error applying text style "${textStyle.name}":`, e);
            }
              break; // Apply first matching style
          } else {
              console.log(`⚠ Text style not found for typography token: ${fontTokenValue}`);
            }
          }
        }
      }
    }
  }

  // Apply icon styles
  // Icon placeholder component: apply size only, NO color
  // Icon child layers (e.g., "Icon (Stroke)"): apply color only
  // Note: isIconPlaceholder is already defined above, reuse it
  
  const isIconChild = (node.type === 'VECTOR' || node.type === 'BOOLEAN_OPERATION') && 
                      node.parent && 'name' in node.parent && 
                      (node.parent as SceneNode).name.toLowerCase().includes('icon');
  
  // Remove existing color bindings from icon placeholder components
  // Icon placeholder should have NO fill & stroke (no color variables)
  if (isIconPlaceholder && options.updateColors) {
    // Remove fill color bindings - set fills to empty array
    if ('fills' in node) {
      try {
        // Check if fills have variable bindings
        const hasFillBinding = Array.isArray(node.fills) && node.fills.length > 0 && 
                               node.fills[0].type === 'SOLID' && 
                               'boundVariableReferences' in node.fills[0];
        
        if (hasFillBinding || (Array.isArray(node.fills) && node.fills.length > 0)) {
          node.fills = [];
          console.log(`✓ Removed fill color from icon placeholder ${node.name}`);
              updated = true;
        }
            } catch (e) {
        console.error(`Error removing fill color:`, e);
      }
    }
    
    // Remove stroke color bindings - set strokes to empty array
    if ('strokes' in node) {
      try {
        // Check if strokes have variable bindings
        const hasStrokeBinding = Array.isArray(node.strokes) && node.strokes.length > 0 && 
                                 node.strokes[0].type === 'SOLID' && 
                                 'boundVariableReferences' in node.strokes[0];
        
        if (hasStrokeBinding || (Array.isArray(node.strokes) && node.strokes.length > 0)) {
          node.strokes = [];
          console.log(`✓ Removed stroke color from icon placeholder ${node.name}`);
              updated = true;
        }
            } catch (e) {
        console.error(`Error removing stroke color:`, e);
      }
    }
  }
  
  // Apply size to icon placeholder component
  // button/regular/icon/size/{size} -> applies to icon placeholder component width & height
  // NOT button container dimensions - for button height use: button/regular/height/{state}/{size}
  if (isIconPlaceholder && options.updateDimensions) {
    // Use nodeSize if available, otherwise try to extract from parent
    let iconSize = nodeSize;
    
    if (!iconSize) {
      console.log(`⚠ Icon placeholder detected but nodeSize is missing: ${node.name}`);
      // Try to extract size from parent or node name
      const parentNode = node.parent;
      if (parentNode && 'name' in parentNode) {
        const parentName = (parentNode as SceneNode).name;
        const sizeMatch = parentName.match(/Size=([a-z0-9]+)/i);
        if (sizeMatch) {
          iconSize = sizeMatch[1].toLowerCase();
          console.log(`✓ Extracted size from parent name: ${iconSize}`);
        }
      }
    }
    
    console.log(`🔍 Applying icon size to placeholder: ${node.name}, component: ${componentName}, size: ${iconSize}`);
    
    if (iconSize) {
      // Try patterns in order: button/regular/icon/size/{size}
      let iconSizeVar = findVariableByPath(componentName, 'regular', 'icon', 'size', '', iconSize);
      console.log(`🔍 Pattern 1 (button/regular/icon/size/${iconSize}): ${iconSizeVar ? `Found: ${iconSizeVar.name}` : 'Not found'}`);
      
      if (!iconSizeVar) {
        iconSizeVar = findVariableByPath(componentName, 'icon', 'icon', 'size', '', iconSize);
        console.log(`🔍 Pattern 2 (button/icon/icon/size/${iconSize}): ${iconSizeVar ? `Found: ${iconSizeVar.name}` : 'Not found'}`);
      }
      
      if (!iconSizeVar) {
        iconSizeVar = findVariableByPath(componentName, 'icon', 'size', '', '', iconSize);
        console.log(`🔍 Pattern 3 (button/icon/size/${iconSize}): ${iconSizeVar ? `Found: ${iconSizeVar.name}` : 'Not found'}`);
      }
      
      // Try direct search in all variables
      if (!iconSizeVar) {
        const allVariables = figma.variables.getLocalVariables();
        const searchPattern = `button/regular/icon/size/${iconSize}`;
        iconSizeVar = allVariables.find(v => 
          v.name.toLowerCase() === searchPattern.toLowerCase() ||
          v.name.toLowerCase().includes(`icon/size/${iconSize}`.toLowerCase())
        ) || null;
        console.log(`🔍 Pattern 4 (direct search): ${iconSizeVar ? `Found: ${iconSizeVar.name}` : 'Not found'}`);
      }
      
      if (iconSizeVar && iconSizeVar.resolvedType === 'FLOAT') {
        try {
          // Apply to icon placeholder component's width and height (NOT button container)
          if ('width' in node) {
            node.setBoundVariable('width', iconSizeVar);
            console.log(`✓ Bound icon width variable "${iconSizeVar.name}" to ${node.name}`);
          }
          if ('height' in node) {
            node.setBoundVariable('height', iconSizeVar);
            console.log(`✓ Bound icon height variable "${iconSizeVar.name}" to ${node.name}`);
          }
          updated = true;
          console.log(`✓ Applied icon size variable "${iconSizeVar.name}" to icon placeholder ${node.name}`);
        } catch (e) {
          console.error(`❌ Error binding icon size variable "${iconSizeVar.name}":`, e);
        }
      } else {
        console.log(`⚠ Icon size variable not found for: button/regular/icon/size/${iconSize} (node: ${node.name})`);
        // List available icon size variables for debugging
        const allVariables = figma.variables.getLocalVariables();
        const iconSizeVars = allVariables.filter(v => 
          v.name.toLowerCase().includes('icon') && 
          v.name.toLowerCase().includes('size') &&
          v.resolvedType === 'FLOAT'
        );
        if (iconSizeVars.length > 0) {
          console.log(`🔍 Available icon size variables: ${iconSizeVars.slice(0, 10).map(v => v.name).join(', ')}`);
        }
      }
    }
  }
  
  // Apply icon color to child layers (NOT placeholder)
  // Most common layer name: "Icon (Stroke)", but can vary
  // DO NOT apply color to placeholder layer - no fill & stroke for placeholder
  const isIconLayer = isIconChild || 
                      ((node.type === 'VECTOR' || node.type === 'BOOLEAN_OPERATION') &&
                       !isIconPlaceholder &&
                       (node.name.toLowerCase().includes('icon') || 
                        node.name.toLowerCase().includes('stroke') || 
                        node.name.toLowerCase().includes('fill')));
  
  if (isIconLayer && !isIconPlaceholder && options.updateColors && 'fills' in node) {
    console.log(`🔍 Searching icon color for theme: ${nodeTheme}, variant: ${nodeVariant}, state: ${nodeState}, size: ${nodeSize}`);
    
    // Try pattern: button/color/{theme}/{variant}/icon/{state}
    // The pattern matching in findVariableByPath will create: button/color/{theme}/{variant}/icon/{state}
    let variable = findVariableByPath(componentName, 'color', nodeVariant, 'icon', nodeState, nodeSize, nodeTheme);
    console.log(`🔍 Pattern search (button/color/${nodeTheme}/${nodeVariant}/icon/${nodeState}): ${variable ? `Found: ${variable.name}` : 'Not found'}`);
    
    // The findVariableByPath function already tries multiple patterns internally:
    // 1. button/color/{theme}/{variant}/icon/{state}
    // 2. button/color/{theme}/icon/{state}
    // 3. button/color/{variant}/icon/{state} (legacy fallback)
    // 4. button/color/icon/{state} (final fallback)
    
        if (variable && variable.resolvedType === 'COLOR') {
          try {
            if (!node.fills || (Array.isArray(node.fills) && node.fills.length === 0)) {
              node.fills = [{ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }];
            }
            if (Array.isArray(node.fills) && node.fills.length > 0) {
              const firstFill = node.fills[0];
              if (firstFill.type === 'SOLID') {
            const boundPaint = figma.variables.setBoundVariableForPaint(firstFill, 'color', variable);
                node.fills = [boundPaint, ...node.fills.slice(1)];
                updated = true;
            console.log(`✓ Bound icon color variable "${variable.name}" to ${node.name}`);
              }
            }
          } catch (e) {
        console.error('Error binding icon color variable:', e);
      }
    }
  }

  return updated;
}

// Helper: Check if component name appears in node or its parents
function nodeMatchesComponent(node: SceneNode, componentName: string): boolean {
  const normalizedComponentName = componentName.toLowerCase().replace(/-/g, ' ').replace(/_/g, ' ');
  const componentWords = normalizedComponentName.split(' ').filter(w => w.length > 2); // Filter out short words
  
  // For short component names (like "select", "icon", "tag"), require exact word match
  // This prevents "select" from matching "selected" or "selection"
  // Increase threshold to 7 to catch "select" (6 chars) and use word boundaries
  if (componentWords.length === 0 || (componentWords.length === 1 && componentWords[0].length < 7)) {
    const shortName = componentWords.length > 0 ? componentWords[0] : normalizedComponentName;
    
    // Check parent frames/components - require exact word boundary match
    let parent: BaseNode | null = node.parent;
    let depth = 0;
    while (parent && depth < 5) {
      if ('name' in parent) {
        const parentName = (parent as SceneNode).name.toLowerCase().replace(/-/g, ' ').replace(/_/g, ' ');
        // Use word boundary regex to ensure exact match (prevents "select" matching "selected")
        const wordBoundaryRegex = new RegExp(`\\b${shortName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`);
        if (wordBoundaryRegex.test(parentName) || parentName === normalizedComponentName) {
          return true;
        }
      }
      parent = parent.parent;
      depth++;
    }
    
    // Check main component
    if (node.type === 'INSTANCE' && node.mainComponent) {
      const mainComponentName = node.mainComponent.name.toLowerCase().replace(/-/g, ' ').replace(/_/g, ' ');
      const wordBoundaryRegex = new RegExp(`\\b${shortName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`);
      if (wordBoundaryRegex.test(mainComponentName) || mainComponentName === normalizedComponentName) {
        return true;
      }
    }
    
    // Check node name itself (for short component names)
    // Split by common separators (=, -, _, spaces) and check whole words
    const nodeName = node.name.toLowerCase().replace(/-/g, ' ').replace(/_/g, ' ');
    const separators = /[\s=_-]+/;
    const nodeParts = nodeName.split(separators);
    for (const part of nodeParts) {
      if (part === normalizedComponentName) {
        return true;
      }
    }
    // Also check word boundaries for exact match
    const wordBoundaryRegex = new RegExp(`\\b${shortName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`);
    if (wordBoundaryRegex.test(nodeName)) {
      return true;
    }
    
    return false;
  }
  
  // For longer component names, check if component name appears as a phrase
  // PRIORITY: Check parent frames/components FIRST (most reliable)
  // This prevents matching wrong components when node names contain state info
  let parent: BaseNode | null = node.parent;
  let depth = 0;
  while (parent && depth < 5) {
    if ('name' in parent) {
      const originalParentName = (parent as SceneNode).name;
      // Normalize parent name: lowercase, replace dashes/underscores with spaces, remove leading dots/punctuation
      let parentName = originalParentName.toLowerCase().replace(/-/g, ' ').replace(/_/g, ' ');
      // Remove leading dots and other punctuation for better matching
      parentName = parentName.replace(/^[.\s]+/, '').trim();
      
      // Reduced logging for performance - uncomment for debugging
      // console.log(`Checking parent "${originalParentName}" → normalized: "${parentName}", component: "${normalizedComponentName}"`);
      
      // Check if normalized component name appears as a phrase in parent name
      if (parentName.includes(normalizedComponentName)) {
        // Reduced logging for performance
        // console.log(`✓ Component match: "${componentName}" in parent "${originalParentName}"`);
        return true;
      }
      // Also check if all component words appear in order
      const parentWords = parentName.split(/\s+/).filter(w => w.length > 0);
      let wordIndex = 0;
      let matchedWords = 0;
      for (const componentWord of componentWords) {
        // For single-word components that are short (like "select" 6 chars), use word boundaries
        // This prevents "select" from matching "selected" or "selection"
        if (componentWords.length === 1 && componentWord.length < 7) {
          const wordBoundaryRegex = new RegExp(`\\b${componentWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`);
          for (let i = wordIndex; i < parentWords.length; i++) {
            if (wordBoundaryRegex.test(parentWords[i])) {
              matchedWords++;
              wordIndex = i + 1;
              break;
            }
          }
        } else {
          for (let i = wordIndex; i < parentWords.length; i++) {
            if (parentWords[i].includes(componentWord) || componentWord.includes(parentWords[i])) {
              matchedWords++;
              wordIndex = i + 1;
              break;
            }
          }
        }
      }
      // Require at least 2 words to match (or all if less than 2)
      if (matchedWords >= Math.min(2, componentWords.length)) {
        // Reduced logging for performance
        // console.log(`✓ Component match: "${componentName}" in parent "${(parent as SceneNode).name}" (${matchedWords}/${componentWords.length} words)`);
        return true;
      }
    }
    parent = parent.parent;
    depth++;
  }
  
  // Check node name itself (less reliable - can contain state names like "State=Selected")
  const nodeName = node.name.toLowerCase().replace(/-/g, ' ').replace(/_/g, ' ');
  // Only match if component name appears as a distinct phrase, not substring
  // This prevents "select" from matching "State=Selected"
  if (nodeName.includes(normalizedComponentName)) {
    // Split by common separators (=, -, _, spaces) and check whole words
    const separators = /[\s=_-]+/;
    const nodeParts = nodeName.split(separators);
    for (const part of nodeParts) {
      if (part === normalizedComponentName) {
        return true;
      }
    }
    // Also check word boundaries for single-word component names
    if (componentWords.length === 1) {
      const wordBoundaryRegex = new RegExp(`\\b${normalizedComponentName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`);
      if (wordBoundaryRegex.test(nodeName)) {
        return true;
      }
    }
  }
  
  // Check if node is an instance of a component with matching name
  if (node.type === 'INSTANCE' && node.mainComponent) {
    const mainComponentName = node.mainComponent.name.toLowerCase().replace(/-/g, ' ').replace(/_/g, ' ');
    if (mainComponentName.includes(normalizedComponentName)) {
      return true;
    }
  }
  
  return false;
}

// Find matching mapping for a node
function findMatchingMapping(node: SceneNode, mappings: Record<string, TokenMapping>): {
  mapping: TokenMapping;
  state: 'selected' | 'default';
} | null {
  const nodeName = node.name;
  const nodeNameLower = nodeName.toLowerCase();
  
  // Quick check: Direct case-insensitive match first (for simple cases like "Button" → "button")
  const normalizedNodeName = nodeNameLower.replace(/-/g, ' ').replace(/_/g, ' ').trim();
  for (const [componentName, mapping] of Object.entries(mappings)) {
    const normalizedComponentName = componentName.toLowerCase().replace(/-/g, ' ').replace(/_/g, ' ').trim();
    if (normalizedNodeName === normalizedComponentName) {
      console.log(`✓ Direct match: "${nodeName}" → "${componentName}"`);
      const nodeState = getNodeState(node);
      const canGenerateInstructions = Object.keys(mapping.tokens || {}).length > 0;
      // Normalize state to 'selected' or 'default' for return type
      const normalizedState: 'selected' | 'default' = (nodeState === 'selected') ? 'selected' : 'default';
      if (nodeState && (mapping.instructions[nodeState] || canGenerateInstructions)) {
        return { mapping, state: normalizedState };
      }
      if (mapping.instructions['default'] || canGenerateInstructions) {
        return { mapping, state: 'default' };
      }
    }
  }
  
  // Sort by component name length (longer = more specific, check first)
  const sortedMappings = Object.entries(mappings).sort((a, b) => b[0].length - a[0].length);
  
  // Debug: Log parent frame names
  let parent: BaseNode | null = node.parent;
  const parentNames: string[] = [];
  let depth = 0;
  while (parent && depth < 5) {
    if ('name' in parent) {
      parentNames.push((parent as SceneNode).name);
    }
    parent = parent.parent;
    depth++;
  }
  // Reduced logging - only log if debugging is needed
  // console.log(`Node: ${nodeName}, Parents: ${parentNames.join(' → ')}`);
  
  // First, try to match using node_matching patterns AND component name
  // Prioritize longer/more specific component names first
  for (const [componentName, mapping] of sortedMappings) {
    // Check if component name matches node or its parents
    const matchesComponent = nodeMatchesComponent(node, componentName);
    
    if (!matchesComponent) {
      continue; // Skip if component name doesn't match
    }
    
    // Reduced logging for performance
    // console.log(`Component "${componentName}" matches node "${nodeName}" - checking patterns...`);
    
    // Found a component name match - now check patterns
    let patternMatched = false;
    if (mapping.node_matching) {
      // Check selected state patterns
      if (mapping.node_matching.selected) {
        const patterns = mapping.node_matching.selected.patterns || [];
        for (const pattern of patterns) {
          if (nodeName.includes(pattern) || nodeNameLower.includes(pattern.toLowerCase())) {
            if (mapping.instructions['selected'] || Object.keys(mapping.tokens || {}).length > 0) {
              console.log(`✓ Matched ${componentName} (selected) - Node: ${nodeName}, Pattern: ${pattern}`);
              return { mapping, state: 'selected' };
            }
          }
        }
      }
      
      // Check default state patterns
      if (mapping.node_matching.default) {
        const patterns = mapping.node_matching.default.patterns || [];
        for (const pattern of patterns) {
          if (nodeName.includes(pattern) || nodeNameLower.includes(pattern.toLowerCase())) {
            if (mapping.instructions['default'] || Object.keys(mapping.tokens || {}).length > 0) {
              console.log(`✓ Matched ${componentName} (default) - Node: ${nodeName}, Pattern: ${pattern}`);
              return { mapping, state: 'default' };
            }
          }
        }
      }
    } else {
      // No node_matching patterns defined - use component name match with default state
      patternMatched = false; // Will fall through to use default
    }
    
    // If component name matches but no patterns matched (or no patterns defined),
    // still return a match using default state
    if (!patternMatched) {
      const nodeState = getNodeState(node);
      // Check if instructions exist OR if we can generate them from tokens
      const hasInstructions = (nodeState && mapping.instructions[nodeState]) || mapping.instructions['default'];
      const canGenerateInstructions = Object.keys(mapping.tokens || {}).length > 0;
      // Normalize state to 'selected' or 'default' for return type
      const normalizedState: 'selected' | 'default' = (nodeState === 'selected') ? 'selected' : 'default';
      
      if (nodeState && (mapping.instructions[nodeState] || canGenerateInstructions)) {
        console.log(`✓ Matched ${componentName} (${nodeState}) - Node: ${nodeName}, Component name match (no pattern)`);
        return { mapping, state: normalizedState };
      }
      // Fallback to default state if available or if we can generate instructions
      if (mapping.instructions['default'] || canGenerateInstructions) {
        console.log(`✓ Matched ${componentName} (default) - Node: ${nodeName}, Component name match (no pattern)`);
        return { mapping, state: 'default' };
      }
    }
  }
  
  // Fallback: Try component name matching (more precise) - use already sorted mappings
  for (const [componentName, mapping] of sortedMappings) {
    // Skip if we already checked this in pattern matching above
    if (!nodeMatchesComponent(node, componentName)) {
      continue;
    }
    
    // Normalize component name for matching
    const normalizedComponentName = componentName.toLowerCase().replace(/-/g, ' ').replace(/_/g, ' ');
    const normalizedNodeName = nodeNameLower.replace(/-/g, ' ').replace(/_/g, ' ');
    
    // More precise matching: component name should appear as a significant part of node name
    // Check if component name is a whole word/phrase in node name
    const componentWords = normalizedComponentName.split(' ');
    const nodeWords = normalizedNodeName.split(' ');
    
    // Check if all component words appear in node (in order, but not necessarily consecutive)
    let matchScore = 0;
    let nodeWordIndex = 0;
    for (const componentWord of componentWords) {
      if (componentWord.length < 2) continue; // Skip very short words
      for (let i = nodeWordIndex; i < nodeWords.length; i++) {
        if (nodeWords[i].includes(componentWord) || componentWord.includes(nodeWords[i])) {
          matchScore++;
          nodeWordIndex = i + 1;
          break;
        }
      }
    }
    
    // Require at least 50% of component words to match
    if (matchScore >= Math.ceil(componentWords.length * 0.5)) {
      const nodeState = getNodeState(node);
      const canGenerateInstructions = Object.keys(mapping.tokens || {}).length > 0;
      // Normalize state to 'selected' or 'default' for return type
      const normalizedState: 'selected' | 'default' = (nodeState === 'selected') ? 'selected' : 'default';
      if (nodeState && (mapping.instructions[nodeState] || canGenerateInstructions)) {
        return { mapping, state: normalizedState };
      }
      // If no state match, try default state
      if (mapping.instructions['default'] || canGenerateInstructions) {
        return { mapping, state: 'default' };
      }
    }
  }

  return null;
}

// Apply tokens to selection
async function applyToSelection(mappings: Record<string, TokenMapping>, options: ApplyOptions) {
  const selection = figma.currentPage.selection;
  
  if (selection.length === 0) {
    figma.notify('Please select at least one node');
    return;
  }

  // Calculate total nodes to process (including recursive children)
  let totalNodes = selection.length;
  if (options.recursive) {
    for (const node of selection) {
      if ('children' in node) {
        const children = node.findAll((n: SceneNode) => n !== node);
        totalNodes += children.length;
      }
    }
  }

  const startTime = Date.now();
  let updatedCount = 0;
  let processedCount = 0;
  const debugInfo: string[] = [];

  // Send initial progress
  figma.ui.postMessage({
    type: 'progress',
    progress: {
      percent: 0,
      message: `Processing ${totalNodes} node(s)...`,
      estimatedTime: 0
    }
  });

  for (let i = 0; i < selection.length; i++) {
    const node = selection[i];
    
    // Update progress
    const percent = Math.floor((processedCount / totalNodes) * 100);
    const elapsed = (Date.now() - startTime) / 1000;
    const avgTimePerNode = processedCount > 0 ? elapsed / processedCount : 0.5;
    const remainingNodes = totalNodes - processedCount;
    const estimatedTime = Math.ceil(remainingNodes * avgTimePerNode);
    
    figma.ui.postMessage({
      type: 'progress',
      progress: {
        percent: percent,
        message: `Processing ${node.name}... (${processedCount + 1}/${totalNodes})`,
        estimatedTime: estimatedTime
      }
    });

    const match = findMatchingMapping(node, mappings);
    if (match) {
      processedCount++;
      debugInfo.push(`Found match: ${node.name} → ${match.mapping.component} (${match.state})`);
      const updated = await applyTokensToNode(node, match.mapping, match.state, options);
      if (updated) {
        updatedCount++;
        debugInfo.push(`✓ Updated: ${node.name}`);
      } else {
        debugInfo.push(`✗ No updates: ${node.name} (check console for details)`);
      }
    } else {
      processedCount++;
      debugInfo.push(`No match: ${node.name} (available: ${Object.keys(mappings).join(', ')})`);
    }

    // Process children if recursive (limit to prevent excessive processing)
    if (options.recursive && 'children' in node && match && processedCount < 1000) {
      const children = node.findAll((n: SceneNode) => n !== node);
      // Limit children processing to prevent timeout
      const maxChildren = Math.min(children.length, 50);
      
      for (let j = 0; j < maxChildren; j++) {
        const child = children[j];
        
        // Update progress for children
        const childPercent = Math.floor((processedCount / totalNodes) * 100);
        const childElapsed = (Date.now() - startTime) / 1000;
        const childAvgTime = processedCount > 0 ? childElapsed / processedCount : 0.5;
        const childRemaining = totalNodes - processedCount;
        const childEstimatedTime = Math.ceil(childRemaining * childAvgTime);
        
        figma.ui.postMessage({
          type: 'progress',
          progress: {
            percent: childPercent,
            message: `Processing child: ${child.name}... (${processedCount + 1}/${totalNodes})`,
            estimatedTime: childEstimatedTime
          }
        });
        
        // First, check if child is a nested component - if so, try to find its own mapping
        if (isNestedComponent(child)) {
          const childMatch = findMatchingMapping(child, mappings);
          if (childMatch) {
            // Child has its own mapping - apply that instead
            processedCount++;
            const updated = await applyTokensToNode(child, childMatch.mapping, childMatch.state, options, false);
            if (updated) {
              updatedCount++;
              debugInfo.push(`✓ Updated nested component "${child.name}" with its own tokens`);
            }
          }
        } else {
          // Not a nested component - apply parent mapping selectively
          // Only apply properties relevant to the node type (text, icon, subtext)
          processedCount++;
          const updated = await applyTokensToNode(child, match.mapping, match.state, options, true);
          if (updated) {
            updatedCount++;
            debugInfo.push(`✓ Updated child: ${child.name}`);
          }
        }
      }
      
      if (children.length > maxChildren) {
        debugInfo.push(`⚠ Limited processing to ${maxChildren} children (${children.length} total)`);
      }
    }
  }

  // Send completion progress
  figma.ui.postMessage({
    type: 'progress',
    progress: {
      percent: 100,
      message: `Complete! Updated ${updatedCount} node(s) out of ${processedCount} processed`,
      estimatedTime: 0
    }
  });

  // Send debug info to UI
  figma.ui.postMessage({
    type: 'log',
    log: {
      message: debugInfo.join('\n'),
      type: updatedCount > 0 ? 'success' : 'info'
    }
  });

  figma.notify(`Updated ${updatedCount} node(s) out of ${processedCount} processed`);
}

// Apply tokens to all components
async function applyToAll(mappings: Record<string, TokenMapping>, options: ApplyOptions) {
  const allNodes = figma.currentPage.findAll();
  let updatedCount = 0;
  let processedCount = 0;
  const debugInfo: string[] = [];

  for (const node of allNodes) {
    const match = findMatchingMapping(node, mappings);
    if (match) {
      processedCount++;
      const updated = await applyTokensToNode(node, match.mapping, match.state, options);
      if (updated) {
        updatedCount++;
        if (debugInfo.length < 10) { // Limit debug output
          debugInfo.push(`✓ Updated: ${node.name}`);
        }
      }
      
      // Process children if recursive
      if (options.recursive && 'children' in node) {
        const children = node.findAll((n: SceneNode) => n !== node);
        for (const child of children) {
          // First, check if child is a nested component - if so, try to find its own mapping
          if (isNestedComponent(child)) {
            const childMatch = findMatchingMapping(child, mappings);
            if (childMatch) {
              // Child has its own mapping - apply that instead
              processedCount++;
              const childUpdated = await applyTokensToNode(child, childMatch.mapping, childMatch.state, options, false);
              if (childUpdated) {
                updatedCount++;
              }
            }
          } else {
            // Not a nested component - apply parent mapping selectively
            processedCount++;
            const childUpdated = await applyTokensToNode(child, match.mapping, match.state, options, true);
            if (childUpdated) {
              updatedCount++;
            }
          }
        }
      }
    }
  }

  // Send debug info to UI
  if (debugInfo.length > 0) {
    figma.ui.postMessage({
      type: 'log',
      log: {
        message: `Updated ${updatedCount} nodes:\n${debugInfo.join('\n')}${updatedCount > 10 ? '\n...' : ''}`,
        type: updatedCount > 0 ? 'success' : 'info'
      }
    });
  }

  figma.notify(`Updated ${updatedCount} node(s) out of ${processedCount} processed`);
}

// Scan for components
function scanComponents() {
  const components = figma.currentPage.findAll((node: SceneNode) => 
    node.type === 'COMPONENT' || node.type === 'INSTANCE' || node.type === 'FRAME'
  );

  const componentNames = new Set<string>();
  components.forEach((node: SceneNode) => {
    const name = node.name.split('=')[0].trim();
    componentNames.add(name);
  });

  figma.ui.postMessage({
    type: 'status',
    message: {
      text: `Found ${componentNames.size} unique component(s): ${Array.from(componentNames).join(', ')}`,
      type: 'info'
    }
  });
}

// Main message handler
// Initialize plugin
loadMappingRules();

figma.ui.onmessage = async (msg: { 
  type: string; 
  mappings?: Record<string, TokenMapping>; 
  componentTokens?: Record<string, ComponentTokenFile>;
  options?: ApplyOptions 
}) => {
  console.log('📨 Received message:', msg.type);
  
  // Log message details for debugging
  if (msg.componentTokens) {
    console.log('   Component tokens:', Object.keys(msg.componentTokens));
  }
  if (msg.mappings) {
    console.log('   Mappings:', Object.keys(msg.mappings));
  }
  // Load component token files
  if (msg.type === 'load-component-tokens' && msg.componentTokens) {
    componentTokenFiles = msg.componentTokens;
    const count = Object.keys(componentTokenFiles).length;
    figma.notify(`Loaded ${count} component token file(s)`);
    return;
  }

  if (msg.type === 'apply-to-selection') {
    // Load component tokens if provided
    if (msg.componentTokens) {
      componentTokenFiles = msg.componentTokens;
    }
    
    if ((!msg.mappings || Object.keys(msg.mappings).length === 0) && 
        (!componentTokenFiles || Object.keys(componentTokenFiles).length === 0)) {
      figma.notify('No mappings or component tokens loaded');
      return;
    }
    await applyToSelection(msg.mappings || {}, msg.options || {
      updateColors: true,
      updateDimensions: true,
      updateTypography: true,
      updateShadows: true,
      recursive: true
    });
  }

  if (msg.type === 'apply-to-all') {
    // Load component tokens if provided
    if (msg.componentTokens) {
      componentTokenFiles = msg.componentTokens;
    }
    
    if ((!msg.mappings || Object.keys(msg.mappings).length === 0) && 
        (!componentTokenFiles || Object.keys(componentTokenFiles).length === 0)) {
      figma.notify('No mappings or component tokens loaded');
      return;
    }
    await applyToAll(msg.mappings || {}, msg.options || {
      updateColors: true,
      updateDimensions: true,
      updateTypography: true,
      updateShadows: true,
      recursive: true
    });
  }

  if (msg.type === 'scan-components') {
    scanComponents();
  }

  if (msg.type === 'create-variables') {
    console.log('🚀 Starting variable creation process...');
    console.log('Received component tokens:', Object.keys(msg.componentTokens || {}));
    
    if (!msg.componentTokens || Object.keys(msg.componentTokens).length === 0) {
      const errorMsg = 'Please load component token files first';
      console.error('❌', errorMsg);
      figma.notify(errorMsg);
      figma.ui.postMessage({
        type: 'progress',
        progress: {
          percent: 0,
          message: errorMsg,
          estimatedTime: 0
        }
      });
      return;
    }
    
    // Store component tokens
    componentTokenFiles = msg.componentTokens;
    const componentNames = Object.keys(componentTokenFiles);
    
    console.log(`📦 Processing ${componentNames.length} component(s): ${componentNames.join(', ')}`);
    console.log(`📦 Component token files structure:`, componentTokenFiles);
    
    // Create variables for each component with progress tracking
    let successCount = 0;
    const totalCount = componentNames.length;
    
    for (let i = 0; i < componentNames.length; i++) {
      const componentName = componentNames[i];
      const componentProgress = (i / totalCount) * 100;
      
      console.log(`\n📝 Processing component ${i + 1}/${totalCount}: ${componentName}`);
      console.log(`📝 Component data:`, componentTokenFiles[componentName]);
      
      // Progress callback for this component
      const onProgress = (percent: number, message: string, estimatedTime?: number) => {
        // Calculate overall progress across all components
        const overallPercent = componentProgress + (percent / totalCount);
        const overallMessage = `[${i + 1}/${totalCount}] ${componentName}: ${message}`;
        
        console.log(`📊 Progress: ${Math.floor(overallPercent)}% - ${overallMessage}`);
        
        figma.ui.postMessage({
          type: 'progress',
          progress: {
            percent: Math.floor(overallPercent),
            message: overallMessage,
            estimatedTime: estimatedTime || 0
          }
        });
      };
      
      try {
        console.log(`🔄 About to call createComponentVariables for ${componentName}...`);
        console.log(`🔄 Component data type:`, typeof componentTokenFiles[componentName]);
        console.log(`🔄 Component data keys:`, Object.keys(componentTokenFiles[componentName] || {}));
        
        // Send initial progress
        onProgress(0, `Starting variable creation...`);
        
        const functionStartTime = Date.now();
        console.log(`🔄 Calling createComponentVariables at ${functionStartTime}...`);
        
        const success = await createComponentVariables(
          componentName, 
          componentTokenFiles[componentName],
          onProgress
        );
        
        const functionEndTime = Date.now();
        const functionDuration = functionEndTime - functionStartTime;
        console.log(`✅ createComponentVariables returned: ${success} (took ${functionDuration}ms)`);
        
        if (success) {
          successCount++;
          console.log(`✅ Successfully processed ${componentName}`);
        } else {
          console.log(`⚠️  ${componentName} returned false (check logs above)`);
        }
      } catch (error) {
        console.error(`❌ Error processing ${componentName}:`, error);
        console.error('Error type:', typeof error);
        console.error('Error message:', error instanceof Error ? error.message : String(error));
        console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
        figma.ui.postMessage({
          type: 'progress',
          progress: {
            percent: Math.floor(((i + 1) / totalCount) * 100),
            message: `Error processing ${componentName}: ${error instanceof Error ? error.message : String(error)}`,
            estimatedTime: 0
          }
        });
      }
    }
    
    const finalMessage = `Variable creation complete. ${successCount}/${totalCount} component(s) processed successfully.`;
    console.log(`\n✨ ${finalMessage}`);
    figma.notify(finalMessage);
    
    figma.ui.postMessage({
      type: 'progress',
      progress: {
        percent: 100,
        message: finalMessage,
        estimatedTime: 0
      }
    });
  }
};

// Show UI
figma.showUI(__html__, { width: 320, height: 500 });

// Log plugin initialization
console.log('🚀 Apply Component Tokens Plugin initialized');
console.log('📋 Available variable collections:', figma.variables.getLocalVariableCollections().map(c => c.name));
console.log('📦 Available variables:', figma.variables.getLocalVariables().length);


