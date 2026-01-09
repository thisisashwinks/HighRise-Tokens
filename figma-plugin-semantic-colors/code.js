"use strict";
// This plugin creates Figma Variables from Semantic Colors JSON files
// It creates a single collection with Light and Dark modes
// Sanitize variable name to meet Figma's requirements
// Figma variable names: Use forward slashes for hierarchy (Figma supports this)
// Keep numeric segments as-is (Figma allows numbers in variable names)
function sanitizeVariableName(path) {
    // Split by dots and process each segment
    const segments = path.split('.');
    const sanitized = segments.map((segment) => {
        // Keep valid characters (letters, numbers, underscores, hyphens)
        // Replace any other invalid characters with underscores
        // Note: Figma allows numeric segments in variable names, so we keep them as-is
        return segment.replace(/[^a-zA-Z0-9_-]/g, '_');
    });
    // Join with forward slashes (Figma supports this for variable names)
    return sanitized.join('/');
}
// Flatten nested token structure to paths
function flattenTokens(obj, prefix = '', result = new Map()) {
    for (const [key, value] of Object.entries(obj)) {
        const path = prefix ? `${prefix}.${key}` : key;
        if (value && typeof value === 'object' && 'value' in value && 'type' in value) {
            // This is a token value
            result.set(path, value);
        }
        else if (value && typeof value === 'object') {
            // This is a nested object, recurse
            flattenTokens(value, path, result);
        }
    }
    return result;
}
// Extract hex color from description (fallback when references can't be resolved)
function extractHexFromDescription(description) {
    if (!description)
        return null;
    // Look for hex pattern in description like "#ffffff" or "#FFFFFF00"
    const hexMatch = description.match(/#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})/);
    return hexMatch ? '#' + hexMatch[1] : null;
}
// Extract color value from token reference or direct value
function extractColorValue(value) {
    if (!value)
        return null;
    // Handle direct hex values like #ffffff or #FFFFFF00
    if (value.startsWith('#')) {
        const hex = value.slice(1).toUpperCase();
        if (hex.length === 6) {
            const r = parseInt(hex.slice(0, 2), 16) / 255;
            const g = parseInt(hex.slice(2, 4), 16) / 255;
            const b = parseInt(hex.slice(4, 6), 16) / 255;
            return { r, g, b };
        }
        else if (hex.length === 8) {
            const r = parseInt(hex.slice(0, 2), 16) / 255;
            const g = parseInt(hex.slice(2, 4), 16) / 255;
            const b = parseInt(hex.slice(4, 6), 16) / 255;
            const a = parseInt(hex.slice(6, 8), 16) / 255;
            return { r, g, b, a };
        }
    }
    // Handle rgba() format
    const rgbaMatch = value.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
    if (rgbaMatch) {
        const r = parseInt(rgbaMatch[1]) / 255;
        const g = parseInt(rgbaMatch[2]) / 255;
        const b = parseInt(rgbaMatch[3]) / 255;
        const a = rgbaMatch[4] ? parseFloat(rgbaMatch[4]) : 1;
        if (a < 1) {
            return { r, g, b, a };
        }
        return { r, g, b };
    }
    return null;
}
// Build a lookup map from primitive tokens
function buildPrimitiveMap(obj, prefix = '', result = new Map()) {
    for (const [key, value] of Object.entries(obj)) {
        const path = prefix ? `${prefix}.${key}` : key;
        if (value && typeof value === 'object' && 'value' in value && 'type' in value) {
            result.set(path, value);
        }
        else if (value && typeof value === 'object') {
            buildPrimitiveMap(value, path, result);
        }
    }
    return result;
}
// Find primitive variable in Figma by path
function findPrimitiveVariable(refPath) {
    // Sanitize the reference path to match Figma variable naming
    const sanitizedName = sanitizeVariableName(refPath);
    // Look for the variable in all collections, prioritizing "Primitive" collection
    const primitiveCollection = figma.variables.getLocalVariableCollections()
        .find(c => c.name === 'Primitive' || c.name === 'Primitives');
    if (primitiveCollection) {
        const variable = figma.variables.getLocalVariables()
            .find(v => v.name === sanitizedName && v.variableCollectionId === primitiveCollection.id);
        if (variable) {
            return variable;
        }
    }
    // Fallback: search all collections
    const allVariables = figma.variables.getLocalVariables();
    return allVariables.find(v => v.name === sanitizedName) || null;
}
function parseBoxShadowValue(value) {
    if (!value || value === 'none') {
        return [];
    }
    // Parse format: [{position.x.0, position.y.0[25], blur.0[5], spread.0, color-shadow.default.0[05]}]
    const shadows = [];
    // Extract array content between [{...}]
    const arrayMatch = value.match(/\[(.*)\]/);
    if (!arrayMatch)
        return [];
    const content = arrayMatch[1];
    // Split by }, { to get individual shadow objects, but preserve the structure
    // Handle cases like: [{...}, {...}] or just [{...}]
    const shadowMatches = content.match(/\{[^}]+\}/g);
    if (!shadowMatches)
        return [];
    for (const shadowStr of shadowMatches) {
        // Clean up brackets
        const cleanStr = shadowStr.replace(/^\{|\}$/g, '').trim();
        // Extract properties using regex - be more flexible with matching
        const xMatch = cleanStr.match(/position\.x\.([^,}]+)/);
        const yMatch = cleanStr.match(/position\.y\.([^,}]+)/);
        const blurMatch = cleanStr.match(/blur\.([^,}]+)/);
        const spreadMatch = cleanStr.match(/spread\.([^,}]+)/);
        // Color can be color-shadow.default.0[05] or color.primary.blue.100
        const colorMatch = cleanStr.match(/(color[^,}]+)/);
        const insetMatch = cleanStr.match(/color-shadow\.inset\.true/);
        if (xMatch && yMatch && blurMatch && spreadMatch && colorMatch) {
            // Extract color value, excluding inset if present
            let colorValue = colorMatch[1].trim();
            // Remove inset from color if it's a separate property
            if (colorValue.includes('color-shadow.inset')) {
                // Find the actual color reference before inset
                const colorParts = cleanStr.split(',').filter(p => p.includes('color') && !p.includes('inset'));
                if (colorParts.length > 0) {
                    colorValue = colorParts[0].trim();
                }
            }
            shadows.push({
                x: xMatch[1].trim(),
                y: yMatch[1].trim(),
                blur: blurMatch[1].trim(),
                spread: spreadMatch[1].trim(),
                color: colorValue,
                inset: !!insetMatch || cleanStr.includes('inset')
            });
        }
    }
    return shadows;
}
// Convert decimal notation like "0[25]" to "0.25" for parsing
function parseDecimalNotation(value) {
    // Handle format like "0[25]" -> 0.25, "1[5]" -> 1.5, "-0[5]" -> -0.5
    const decimalMatch = value.match(/^(-?\d+)\[(\d+)\]$/);
    if (decimalMatch) {
        const whole = parseFloat(decimalMatch[1]);
        const decimal = parseFloat('0.' + decimalMatch[2]);
        return whole + (whole >= 0 ? decimal : -decimal);
    }
    return parseFloat(value) || 0;
}
// Get primitive variable for numeric properties (returns VariableAlias if exists, otherwise null)
function getPrimitiveVariableAlias(refPath) {
    const variable = findPrimitiveVariable(refPath);
    if (variable && variable.resolvedType === 'FLOAT') {
        return {
            type: 'VARIABLE_ALIAS',
            id: variable.id
        };
    }
    return null;
}
// Get primitive variable value as number (for position, blur, spread)
// Returns the value if primitive variable exists, otherwise returns null to use raw value
function getPrimitiveNumberValue(refPath) {
    const variable = findPrimitiveVariable(refPath);
    if (variable && variable.resolvedType === 'FLOAT') {
        // Get the collection to access modes
        const collection = figma.variables.getVariableCollectionById(variable.variableCollectionId);
        if (collection && collection.modes.length > 0) {
            const defaultValue = variable.valuesByMode[collection.modes[0].modeId];
            if (typeof defaultValue === 'number') {
                return defaultValue;
            }
            // If it's a VariableAlias, resolve it
            if (defaultValue && typeof defaultValue === 'object' && 'type' in defaultValue && defaultValue.type === 'VARIABLE_ALIAS') {
                const refVar = figma.variables.getVariableById(defaultValue.id);
                if (refVar && refVar.resolvedType === 'FLOAT') {
                    const refCollection = figma.variables.getVariableCollectionById(refVar.variableCollectionId);
                    if (refCollection && refCollection.modes.length > 0) {
                        const refValue = refVar.valuesByMode[refCollection.modes[0].modeId];
                        if (typeof refValue === 'number') {
                            return refValue;
                        }
                    }
                }
            }
        }
    }
    // Return null to indicate no primitive variable found - will use raw parsed value
    return null;
}
// Resolve primitive variable to RGB/RGBA value (recursively resolves VariableAlias)
function resolveColorValueRecursive(colorValue, depth = 0) {
    // Prevent infinite recursion
    if (depth > 10)
        return null;
    if (!colorValue || typeof colorValue !== 'object')
        return null;
    // If it's already RGB/RGBA, return it
    if ('r' in colorValue && 'g' in colorValue && 'b' in colorValue) {
        return colorValue;
    }
    // If it's a VariableAlias, resolve it
    if ('type' in colorValue && colorValue.type === 'VARIABLE_ALIAS') {
        try {
            const refVar = figma.variables.getVariableById(colorValue.id);
            if (refVar && refVar.resolvedType === 'COLOR') {
                const refCollection = figma.variables.getVariableCollectionById(refVar.variableCollectionId);
                if (refCollection && refCollection.modes.length > 0) {
                    const refColorValue = refVar.valuesByMode[refCollection.modes[0].modeId];
                    if (refColorValue) {
                        return resolveColorValueRecursive(refColorValue, depth + 1);
                    }
                }
            }
        }
        catch (error) {
            // Variable not found or error resolving
            return null;
        }
    }
    return null;
}
// Find semantic variable in Figma by path (checks Semantic collection first)
function findSemanticVariable(refPath) {
    // Sanitize the reference path to match Figma variable naming
    const sanitizedName = sanitizeVariableName(refPath);
    // Check Semantic collection first (where semantic tokens are stored)
    const semanticCollection = figma.variables.getLocalVariableCollections()
        .find(c => c.name === 'Semantic' || c.name === 'Semantics');
    if (semanticCollection) {
        const variable = figma.variables.getLocalVariables()
            .find(v => v.name === sanitizedName && v.variableCollectionId === semanticCollection.id);
        if (variable) {
            return variable;
        }
    }
    // Also check Semantic-Colors collection
    const semanticColorsCollection = figma.variables.getLocalVariableCollections()
        .find(c => c.name === 'Semantic-Colors');
    if (semanticColorsCollection) {
        const variable = figma.variables.getLocalVariables()
            .find(v => v.name === sanitizedName && v.variableCollectionId === semanticColorsCollection.id);
        if (variable) {
            return variable;
        }
    }
    return null;
}
// Find semantic position variable in Figma by path (checks Semantic collection first)
function findSemanticPositionVariable(refPath) {
    return findSemanticVariable(refPath);
}
// Get all font token variables from Semantic collection
function getSemanticFontTokens() {
    const semanticCollection = figma.variables.getLocalVariableCollections()
        .find(c => c.name === 'Semantic' || c.name === 'Semantics');
    if (!semanticCollection) {
        return [];
    }
    const fontTokens = [];
    const allVariables = figma.variables.getLocalVariables();
    for (const variable of allVariables) {
        // Check if variable is in Semantic collection
        if (variable.variableCollectionId !== semanticCollection.id) {
            continue;
        }
        // Check if variable name starts with "font/" (sanitized path)
        const varName = variable.name.toLowerCase();
        if (!varName.startsWith('font/')) {
            continue;
        }
        // Check if variable is STRING type (font tokens are strings)
        if (variable.resolvedType !== 'STRING') {
            continue;
        }
        // Get the value from the first mode
        if (semanticCollection.modes.length === 0) {
            continue;
        }
        const modeId = semanticCollection.modes[0].modeId;
        const value = variable.valuesByMode[modeId];
        if (typeof value === 'string' && value.includes('font.')) {
            // Convert sanitized name back to path format for processing
            const path = variable.name.replace(/\//g, '.');
            fontTokens.push({
                variable,
                path,
                value
            });
        }
    }
    return fontTokens;
}
// Process font tokens as Text Styles - read directly from Semantic collection in Figma
// This function is reused by both 'create-variables' and 'create-font-styles' handlers
async function processFontStylesFromSemantic(primitiveMap) {
    const semanticFontTokens = getSemanticFontTokens();
    if (semanticFontTokens.length === 0) {
        return { textStylesCreated: 0, textStylesUpdated: 0, textStylesSkipped: 0, noTokensFound: true };
    }
    console.log(`Found ${semanticFontTokens.length} font token variables in Semantic collection`);
    let textStylesCreated = 0;
    let textStylesUpdated = 0;
    let textStylesSkipped = 0;
    let processedCount = 0;
    for (const { variable, path, value } of semanticFontTokens) {
        processedCount++;
        // Send progress update every 10 tokens
        if (processedCount % 10 === 0) {
            figma.ui.postMessage({
                type: 'status',
                message: `Processing font styles... (${processedCount}/${semanticFontTokens.length})`,
                error: false
            });
        }
        // Skip "none" tokens
        if (value === 'none' || !value) {
            textStylesSkipped++;
            continue;
        }
        // Parse font values from the token value string
        const fontProps = parseFontValue(value);
        if (!fontProps) {
            console.log(`Failed to parse font properties for variable: ${variable.name}, value: ${value}`);
            textStylesSkipped++;
            continue;
        }
        // Create style name from variable name (e.g., "font/heading/regular/display" -> "heading/regular/display")
        const styleName = variable.name.replace(/^font\//, '');
        // Check if style already exists before creating
        const existingStyle = figma.getLocalTextStyles().find(s => s.name === styleName);
        const wasExisting = !!existingStyle;
        // Create/update text style
        try {
            const style = await createTextStyleFromFont(styleName, fontProps, primitiveMap);
            if (style) {
                if (wasExisting) {
                    // Style was updated
                    textStylesUpdated++;
                }
                else {
                    // Style was created
                    textStylesCreated++;
                }
            }
            else {
                console.log(`Failed to create text style for variable: ${variable.name}, styleName: ${styleName}`);
                textStylesSkipped++;
            }
        }
        catch (error) {
            console.log(`Error creating text style for variable: ${variable.name}, error: ${error}`);
            textStylesSkipped++;
        }
    }
    console.log(`Font styles: Created ${textStylesCreated}, Updated ${textStylesUpdated}, Skipped ${textStylesSkipped}`);
    return { textStylesCreated, textStylesUpdated, textStylesSkipped, noTokensFound: false };
}
// Resolve primitive variable to RGB/RGBA value
function resolvePrimitiveColorToRGB(refPath) {
    // Try to find the primitive variable
    const variable = findPrimitiveVariable(refPath);
    if (variable && variable.resolvedType === 'COLOR') {
        // Get the collection to access modes
        const collection = figma.variables.getVariableCollectionById(variable.variableCollectionId);
        if (collection && collection.modes.length > 0) {
            const colorValue = variable.valuesByMode[collection.modes[0].modeId];
            if (colorValue) {
                const resolved = resolveColorValueRecursive(colorValue);
                if (resolved) {
                    return resolved;
                }
            }
        }
    }
    // Fallback for color-shadow tokens: extract opacity and use base shadow color
    if (refPath.startsWith('color-shadow.')) {
        const opacityMatch = refPath.match(/\.(\d+\[\d+\])$/);
        let opacity = 0.05; // default
        if (opacityMatch) {
            opacity = parseDecimalNotation(opacityMatch[1]);
        }
        // Base shadow color rgba(16, 24, 40, opacity)
        return { r: 0.063, g: 0.094, b: 0.157, a: opacity };
    }
    return null;
}
// Ensure variable exists for shadow properties, creating it if needed
// This ensures variables are available in Figma UI for manual attachment
function ensureShadowVariable(refPath, resolvedValue, variableType, primitiveMap) {
    // Check if variable already exists (Semantic first, then Primitive)
    let variable = findSemanticPositionVariable(refPath);
    if (!variable && variableType === 'FLOAT') {
        variable = findPrimitiveVariable(refPath);
    }
    else if (!variable && variableType === 'COLOR') {
        variable = findPrimitiveVariable(refPath);
    }
    // If variable exists, return it
    if (variable) {
        return variable;
    }
    // Variable doesn't exist - try to create it
    // Determine which collection to use (prioritize Semantic, then Primitive)
    let collection = figma.variables.getLocalVariableCollections()
        .find(c => c.name === 'Semantic' || c.name === 'Semantics');
    if (!collection) {
        collection = figma.variables.getLocalVariableCollections()
            .find(c => c.name === 'Primitive' || c.name === 'Primitives');
    }
    // If no collection found, skip creation (variables should be created separately)
    if (!collection) {
        return null;
    }
    const sanitizedName = sanitizeVariableName(refPath);
    // Check if variable exists with this name in any collection
    const existingVar = figma.variables.getLocalVariables()
        .find(v => v.name === sanitizedName);
    if (existingVar) {
        return existingVar;
    }
    // Create the variable
    try {
        const newVar = figma.variables.createVariable(sanitizedName, collection, variableType);
        // Set value for all modes in the collection
        for (const mode of collection.modes) {
            if (variableType === 'FLOAT' && typeof resolvedValue === 'number') {
                newVar.setValueForMode(mode.modeId, resolvedValue);
            }
            else if (variableType === 'COLOR' && typeof resolvedValue === 'object' && resolvedValue !== null && ('r' in resolvedValue)) {
                newVar.setValueForMode(mode.modeId, resolvedValue);
            }
        }
        return newVar;
    }
    catch (error) {
        // Variable creation failed (might already exist or invalid name)
        return null;
    }
}
function parseFontValue(value) {
    if (!value || value === 'none') {
        return null;
    }
    // Parse format: {font.fontFamily.Inter, font.size.10xl, font.letter-spacing.closest, font.line-height.10xl, font.weight.regular}
    // Extract content between { and }
    const contentMatch = value.match(/\{([^}]+)\}/);
    if (!contentMatch)
        return null;
    const content = contentMatch[1];
    const properties = {};
    // Extract fontFamily
    const fontFamilyMatch = content.match(/font\.fontFamily\.([^,]+)/);
    if (fontFamilyMatch) {
        properties.fontFamily = `font.fontFamily.${fontFamilyMatch[1].trim()}`;
    }
    // Extract fontSize
    const fontSizeMatch = content.match(/font\.size\.([^,]+)/);
    if (fontSizeMatch) {
        properties.fontSize = `font.size.${fontSizeMatch[1].trim()}`;
    }
    // Extract fontWeight
    const fontWeightMatch = content.match(/font\.weight\.([^,]+)/);
    if (fontWeightMatch) {
        properties.fontWeight = `font.weight.${fontWeightMatch[1].trim()}`;
    }
    // Extract lineHeight
    const lineHeightMatch = content.match(/font\.line-height\.([^,]+)/);
    if (lineHeightMatch) {
        properties.lineHeight = `font.line-height.${lineHeightMatch[1].trim()}`;
    }
    // Extract letterSpacing
    const letterSpacingMatch = content.match(/font\.letter-spacing\.([^,]+)/);
    if (letterSpacingMatch) {
        properties.letterSpacing = `font.letter-spacing.${letterSpacingMatch[1].trim()}`;
    }
    // Extract paragraphSpacing
    const paragraphSpacingMatch = content.match(/font\.paragraph-spacing\.([^,]+)/);
    if (paragraphSpacingMatch) {
        properties.paragraphSpacing = `font.paragraph-spacing.${paragraphSpacingMatch[1].trim()}`;
    }
    return Object.keys(properties).length > 0 ? properties : null;
}
// Get primitive variable value as number (for fontSize, lineHeight, letterSpacing, fontWeight)
function getPrimitiveFontValue(refPath) {
    const variable = findPrimitiveVariable(refPath);
    if (variable && variable.resolvedType === 'FLOAT') {
        const collection = figma.variables.getVariableCollectionById(variable.variableCollectionId);
        if (collection && collection.modes.length > 0) {
            const defaultValue = variable.valuesByMode[collection.modes[0].modeId];
            if (typeof defaultValue === 'number') {
                return defaultValue;
            }
            // If it's a VariableAlias, resolve it
            if (defaultValue && typeof defaultValue === 'object' && 'type' in defaultValue && defaultValue.type === 'VARIABLE_ALIAS') {
                const refVar = figma.variables.getVariableById(defaultValue.id);
                if (refVar && refVar.resolvedType === 'FLOAT') {
                    const refCollection = figma.variables.getVariableCollectionById(refVar.variableCollectionId);
                    if (refCollection && refCollection.modes.length > 0) {
                        const refValue = refVar.valuesByMode[refCollection.modes[0].modeId];
                        if (typeof refValue === 'number') {
                            return refValue;
                        }
                    }
                }
            }
        }
    }
    return null;
}
// Get primitive variable value as string (for fontFamily)
function getPrimitiveFontFamilyValue(refPath) {
    const variable = findPrimitiveVariable(refPath);
    if (variable && variable.resolvedType === 'STRING') {
        const collection = figma.variables.getVariableCollectionById(variable.variableCollectionId);
        if (collection && collection.modes.length > 0) {
            const defaultValue = variable.valuesByMode[collection.modes[0].modeId];
            if (typeof defaultValue === 'string') {
                return defaultValue;
            }
        }
    }
    return null;
}
// Get primitive variable alias for font properties
function getPrimitiveFontVariableAlias(refPath, type) {
    const variable = findPrimitiveVariable(refPath);
    if (variable && variable.resolvedType === type) {
        return {
            type: 'VARIABLE_ALIAS',
            id: variable.id
        };
    }
    return null;
}
// Create text style from font properties
// Note: Figma Text Style API supports VariableAlias for font properties
async function createTextStyleFromFont(styleName, fontProps, primitiveMap, existingStyle) {
    console.log(`[createTextStyleFromFont] Creating style: ${styleName}`);
    console.log(`[createTextStyleFromFont] Font props:`, fontProps);
    if (!fontProps.fontSize) {
        console.log(`[createTextStyleFromFont] ERROR: No fontSize provided for ${styleName}`);
        return null; // Need at least fontSize to create a text style
    }
    // Get font size (required)
    console.log(`[createTextStyleFromFont] Looking for fontSize variable: ${fontProps.fontSize}`);
    const fontSizeAlias = getPrimitiveFontVariableAlias(fontProps.fontSize, 'FLOAT');
    const fontSizeValue = getPrimitiveFontValue(fontProps.fontSize);
    console.log(`[createTextStyleFromFont] fontSizeAlias: ${fontSizeAlias ? 'found' : 'not found'}, fontSizeValue: ${fontSizeValue}`);
    // If we can't find the variable, try to resolve from primitive map
    let resolvedFontSize = fontSizeValue;
    if (resolvedFontSize === null && primitiveMap) {
        console.log(`[createTextStyleFromFont] Trying primitive map for fontSize: ${fontProps.fontSize}`);
        const fontSizeToken = primitiveMap.get(fontProps.fontSize);
        if (fontSizeToken && typeof fontSizeToken.value === 'number') {
            resolvedFontSize = fontSizeToken.value;
            console.log(`[createTextStyleFromFont] Found fontSize in primitive map: ${resolvedFontSize}`);
        }
        else if (fontSizeToken && typeof fontSizeToken.value === 'string') {
            // Try to parse number from string
            const parsed = parseFloat(fontSizeToken.value);
            if (!isNaN(parsed)) {
                resolvedFontSize = parsed;
                console.log(`[createTextStyleFromFont] Parsed fontSize from string: ${resolvedFontSize}`);
            }
        }
        else {
            console.log(`[createTextStyleFromFont] fontSize not found in primitive map`);
        }
    }
    if (!fontSizeAlias && resolvedFontSize === null) {
        console.log(`[createTextStyleFromFont] ERROR: Cannot create text style ${styleName}: No font size found for ${fontProps.fontSize}`);
        return null; // Can't create style without font size
    }
    // Get font family (required)
    let fontFamily = 'Inter'; // default
    if (fontProps.fontFamily) {
        const fontFamilyValue = getPrimitiveFontFamilyValue(fontProps.fontFamily);
        if (fontFamilyValue) {
            // Extract font name from "Inter, sans-serif" format
            const fontNameMatch = fontFamilyValue.match(/^([^,]+)/);
            if (fontNameMatch) {
                fontFamily = fontNameMatch[1].trim();
            }
            else {
                fontFamily = fontFamilyValue.trim();
            }
        }
    }
    // Get font weight
    let fontWeight = 400; // default
    let fontWeightStyle = 'Regular'; // default style name
    if (fontProps.fontWeight) {
        let fontWeightValue = getPrimitiveFontValue(fontProps.fontWeight);
        // If not found, try primitive map
        if (fontWeightValue === null && primitiveMap) {
            const fontWeightToken = primitiveMap.get(fontProps.fontWeight);
            if (fontWeightToken && typeof fontWeightToken.value === 'number') {
                fontWeightValue = fontWeightToken.value;
            }
            else if (fontWeightToken && typeof fontWeightToken.value === 'string') {
                const parsed = parseFloat(fontWeightToken.value);
                if (!isNaN(parsed)) {
                    fontWeightValue = parsed;
                }
            }
        }
        if (fontWeightValue !== null) {
            fontWeight = fontWeightValue;
            // Map numeric weight to style name
            if (fontWeight === 100)
                fontWeightStyle = 'Thin';
            else if (fontWeight === 200)
                fontWeightStyle = 'Extra Light';
            else if (fontWeight === 300)
                fontWeightStyle = 'Light';
            else if (fontWeight === 400)
                fontWeightStyle = 'Regular';
            else if (fontWeight === 500)
                fontWeightStyle = 'Medium';
            else if (fontWeight === 600)
                fontWeightStyle = 'Semi Bold';
            else if (fontWeight === 700)
                fontWeightStyle = 'Bold';
            else if (fontWeight === 800)
                fontWeightStyle = 'Extra Bold';
            else if (fontWeight === 900)
                fontWeightStyle = 'Black';
            else
                fontWeightStyle = fontWeight.toString();
        }
    }
    // Get line height - Always resolve to actual pixel value (never use VariableAlias)
    let lineHeight = null;
    if (fontProps.lineHeight) {
        // First try to get value from Figma Primitive variables
        let lineHeightValue = getPrimitiveFontValue(fontProps.lineHeight);
        // If not found in Figma, try primitive map
        if (lineHeightValue === null && primitiveMap) {
            const lineHeightToken = primitiveMap.get(fontProps.lineHeight);
            if (lineHeightToken && typeof lineHeightToken.value === 'number') {
                lineHeightValue = lineHeightToken.value;
            }
            else if (lineHeightToken && typeof lineHeightToken.value === 'string') {
                const parsed = parseFloat(lineHeightToken.value);
                if (!isNaN(parsed)) {
                    lineHeightValue = parsed;
                }
            }
        }
        // Always set pixel value if we have it
        if (lineHeightValue !== null) {
            lineHeight = { value: lineHeightValue, unit: 'PIXELS' };
            console.log(`[createTextStyleFromFont] Resolved lineHeight: ${lineHeightValue}px`);
        }
        else {
            console.log(`[createTextStyleFromFont] WARNING: Could not resolve lineHeight for ${fontProps.lineHeight}`);
        }
    }
    // Get letter spacing - Always resolve to percentage value (never use VariableAlias)
    let letterSpacing = null;
    if (fontProps.letterSpacing) {
        // First try to get value from Figma Primitive variables
        let letterSpacingValue = getPrimitiveFontValue(fontProps.letterSpacing);
        // If not found in Figma, try primitive map
        if (letterSpacingValue === null && primitiveMap) {
            const letterSpacingToken = primitiveMap.get(fontProps.letterSpacing);
            if (letterSpacingToken && typeof letterSpacingToken.value === 'number') {
                letterSpacingValue = letterSpacingToken.value;
            }
            else if (letterSpacingToken && typeof letterSpacingToken.value === 'string') {
                const parsed = parseFloat(letterSpacingToken.value);
                if (!isNaN(parsed)) {
                    letterSpacingValue = parsed;
                }
            }
        }
        // Always set percentage value if we have it
        if (letterSpacingValue !== null) {
            letterSpacing = { value: letterSpacingValue, unit: 'PERCENT' };
            console.log(`[createTextStyleFromFont] Resolved letterSpacing: ${letterSpacingValue}%`);
        }
        else {
            console.log(`[createTextStyleFromFont] WARNING: Could not resolve letterSpacing for ${fontProps.letterSpacing}`);
        }
    }
    // Get paragraph spacing - Always resolve to pixel value
    let paragraphSpacing = null;
    if (fontProps.paragraphSpacing) {
        // Handle decimal notation like "7[5]" -> "7.5"
        const normalizedPath = fontProps.paragraphSpacing.replace(/\[/g, '.').replace(/\]/g, '');
        // First try to get value from Figma Primitive variables
        let paragraphSpacingValue = getPrimitiveFontValue(normalizedPath);
        // If not found, try with original path
        if (paragraphSpacingValue === null) {
            paragraphSpacingValue = getPrimitiveFontValue(fontProps.paragraphSpacing);
        }
        // If not found in Figma, try primitive map
        if (paragraphSpacingValue === null && primitiveMap) {
            // Try normalized path first
            let paragraphSpacingToken = primitiveMap.get(normalizedPath);
            if (!paragraphSpacingToken) {
                paragraphSpacingToken = primitiveMap.get(fontProps.paragraphSpacing);
            }
            if (paragraphSpacingToken && typeof paragraphSpacingToken.value === 'number') {
                paragraphSpacingValue = paragraphSpacingToken.value;
            }
            else if (paragraphSpacingToken && typeof paragraphSpacingToken.value === 'string') {
                const parsed = parseFloat(paragraphSpacingToken.value);
                if (!isNaN(parsed)) {
                    paragraphSpacingValue = parsed;
                }
            }
        }
        // Set pixel value if we have it
        if (paragraphSpacingValue !== null) {
            paragraphSpacing = paragraphSpacingValue;
            console.log(`[createTextStyleFromFont] Resolved paragraphSpacing: ${paragraphSpacingValue}px`);
        }
        else {
            console.log(`[createTextStyleFromFont] WARNING: Could not resolve paragraphSpacing for ${fontProps.paragraphSpacing}`);
        }
    }
    // Use existing style if provided, otherwise create new one
    let textStyle;
    if (existingStyle) {
        textStyle = existingStyle;
        console.log(`[createTextStyleFromFont] Updating existing style: ${styleName}`);
    }
    else {
        // Check if style with this name already exists
        const foundStyle = figma.getLocalTextStyles().find(s => s.name === styleName);
        if (foundStyle) {
            textStyle = foundStyle;
            console.log(`[createTextStyleFromFont] Found existing style with name: ${styleName}`);
        }
        else {
            textStyle = figma.createTextStyle();
            textStyle.name = styleName;
            console.log(`[createTextStyleFromFont] Creating new style: ${styleName}`);
        }
    }
    // Set font properties
    try {
        console.log(`[createTextStyleFromFont] Loading font: ${fontFamily} ${fontWeightStyle}`);
        // Load font first - try the specific style, fallback to Regular if not available
        try {
            await figma.loadFontAsync({ family: fontFamily, style: fontWeightStyle });
            console.log(`[createTextStyleFromFont] ✓ Loaded font: ${fontFamily} ${fontWeightStyle}`);
        }
        catch (styleError) {
            console.log(`[createTextStyleFromFont] Style ${fontWeightStyle} not available, trying Regular...`);
            // If specific style not available, try Regular
            try {
                await figma.loadFontAsync({ family: fontFamily, style: 'Regular' });
                fontWeightStyle = 'Regular';
                console.log(`[createTextStyleFromFont] ✓ Loaded font: ${fontFamily} Regular`);
            }
            catch (regularError) {
                console.log(`[createTextStyleFromFont] Regular not available, searching for any available style...`);
                // If Regular not available, try any available style
                const availableFonts = await figma.listAvailableFontsAsync();
                const fontMatch = availableFonts.find(f => f.fontName.family === fontFamily);
                if (fontMatch) {
                    await figma.loadFontAsync(fontMatch.fontName);
                    fontWeightStyle = fontMatch.fontName.style;
                    console.log(`[createTextStyleFromFont] ✓ Loaded font: ${fontMatch.fontName.family} ${fontMatch.fontName.style}`);
                }
                else {
                    throw new Error(`Font ${fontFamily} not available`);
                }
            }
        }
        // Set font name
        console.log(`[createTextStyleFromFont] Setting fontName: ${fontFamily} ${fontWeightStyle}`);
        textStyle.fontName = { family: fontFamily, style: fontWeightStyle };
        // Set font size - Figma API only accepts numbers, not VariableAlias directly
        // Note: Variables can be attached manually in Figma UI after creation
        if (resolvedFontSize !== null) {
            console.log(`[createTextStyleFromFont] Setting fontSize to number: ${resolvedFontSize}`);
            textStyle.fontSize = resolvedFontSize;
            if (fontSizeAlias) {
                console.log(`[createTextStyleFromFont] Note: fontSize variable exists (${fontProps.fontSize}) - attach manually in Figma UI`);
            }
        }
        else {
            console.log(`[createTextStyleFromFont] ERROR: No fontSize value available`);
            return null;
        }
        // Set line height - Always set actual pixel values, never leave as AUTO
        if (lineHeight) {
            textStyle.lineHeight = lineHeight;
            console.log(`[createTextStyleFromFont] ✓ Set lineHeight to ${lineHeight.value}px`);
        }
        else {
            // Try one more time to get from primitive map if we have the reference
            if (fontProps.lineHeight && primitiveMap) {
                const lineHeightToken = primitiveMap.get(fontProps.lineHeight);
                if (lineHeightToken && typeof lineHeightToken.value === 'number') {
                    textStyle.lineHeight = { value: lineHeightToken.value, unit: 'PIXELS' };
                    console.log(`[createTextStyleFromFont] ✓ Set lineHeight from primitive map: ${lineHeightToken.value}px`);
                }
                else if (lineHeightToken && typeof lineHeightToken.value === 'string') {
                    const parsed = parseFloat(lineHeightToken.value);
                    if (!isNaN(parsed)) {
                        textStyle.lineHeight = { value: parsed, unit: 'PIXELS' };
                        console.log(`[createTextStyleFromFont] ✓ Set lineHeight from primitive map (parsed): ${parsed}px`);
                    }
                }
            }
            // Final check - warn if still not set
            if (!textStyle.lineHeight) {
                console.log(`[createTextStyleFromFont] WARNING: No lineHeight value available for ${fontProps.lineHeight} - style will have AUTO line height`);
            }
        }
        // Set letter spacing - Always set as percentage
        if (letterSpacing) {
            textStyle.letterSpacing = letterSpacing;
            console.log(`[createTextStyleFromFont] ✓ Set letterSpacing to ${letterSpacing.value}%`);
        }
        else {
            // Try one more time to get from primitive map if we have the reference
            if (fontProps.letterSpacing && primitiveMap) {
                const letterSpacingToken = primitiveMap.get(fontProps.letterSpacing);
                if (letterSpacingToken && typeof letterSpacingToken.value === 'number') {
                    textStyle.letterSpacing = { value: letterSpacingToken.value, unit: 'PERCENT' };
                    console.log(`[createTextStyleFromFont] ✓ Set letterSpacing from primitive map: ${letterSpacingToken.value}%`);
                }
                else if (letterSpacingToken && typeof letterSpacingToken.value === 'string') {
                    const parsed = parseFloat(letterSpacingToken.value);
                    if (!isNaN(parsed)) {
                        textStyle.letterSpacing = { value: parsed, unit: 'PERCENT' };
                        console.log(`[createTextStyleFromFont] ✓ Set letterSpacing from primitive map (parsed): ${parsed}%`);
                    }
                }
            }
            // Final check - warn if still not set
            if (!textStyle.letterSpacing) {
                console.log(`[createTextStyleFromFont] WARNING: No letterSpacing value available for ${fontProps.letterSpacing}`);
            }
        }
        // Set paragraph spacing - Figma TextStyle has paragraphSpacing property
        if (paragraphSpacing !== null) {
            textStyle.paragraphSpacing = paragraphSpacing;
            console.log(`[createTextStyleFromFont] ✓ Set paragraphSpacing to ${paragraphSpacing}px`);
        }
        else {
            // Try one more time to get from primitive map if we have the reference
            if (fontProps.paragraphSpacing && primitiveMap) {
                const normalizedPath = fontProps.paragraphSpacing.replace(/\[/g, '.').replace(/\]/g, '');
                let paragraphSpacingToken = primitiveMap.get(normalizedPath);
                if (!paragraphSpacingToken) {
                    paragraphSpacingToken = primitiveMap.get(fontProps.paragraphSpacing);
                }
                if (paragraphSpacingToken && typeof paragraphSpacingToken.value === 'number') {
                    textStyle.paragraphSpacing = paragraphSpacingToken.value;
                    console.log(`[createTextStyleFromFont] ✓ Set paragraphSpacing from primitive map: ${paragraphSpacingToken.value}px`);
                }
                else if (paragraphSpacingToken && typeof paragraphSpacingToken.value === 'string') {
                    const parsed = parseFloat(paragraphSpacingToken.value);
                    if (!isNaN(parsed)) {
                        textStyle.paragraphSpacing = parsed;
                        console.log(`[createTextStyleFromFont] ✓ Set paragraphSpacing from primitive map (parsed): ${parsed}px`);
                    }
                }
            }
            // Final check - warn if still not set
            if (paragraphSpacing === null && fontProps.paragraphSpacing) {
                console.log(`[createTextStyleFromFont] WARNING: No paragraphSpacing value available for ${fontProps.paragraphSpacing}`);
            }
        }
        console.log(`[createTextStyleFromFont] ✓ Successfully created text style: ${styleName}`);
        return textStyle;
    }
    catch (error) {
        // Font loading failed, skip this style
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.log(`[createTextStyleFromFont] ERROR: Failed to load font ${fontFamily} ${fontWeightStyle}: ${errorMsg}`);
        return null;
    }
}
// Create effect style from shadow objects
// Note: Figma Effect Style API doesn't support VariableAlias for effect properties
// So we ensure variables exist and use resolved values, making variables available for manual attachment in UI
function createEffectStyleFromShadows(styleName, shadows, isInner, primitiveMap) {
    if (shadows.length === 0) {
        return null;
    }
    const effects = [];
    for (const shadow of shadows) {
        // Get resolved numeric values (Effect Styles require numbers, not VariableAlias)
        const xValue = getPrimitiveNumberValue(`position.x.${shadow.x}`);
        const x = xValue !== null ? xValue : parseDecimalNotation(shadow.x);
        const yValue = getPrimitiveNumberValue(`position.y.${shadow.y}`);
        const y = yValue !== null ? yValue : parseDecimalNotation(shadow.y);
        const blurValue = getPrimitiveNumberValue(`blur.${shadow.blur}`);
        const blur = blurValue !== null ? blurValue : parseDecimalNotation(shadow.blur);
        const spreadValue = getPrimitiveNumberValue(`spread.${shadow.spread}`);
        const spread = spreadValue !== null ? spreadValue : parseDecimalNotation(shadow.spread);
        // Resolve color to RGB/RGBA
        let color = { r: 0, g: 0, b: 0, a: 1 }; // default to black
        const resolvedColor = resolvePrimitiveColorToRGB(shadow.color);
        if (resolvedColor) {
            color = resolvedColor;
        }
        else {
            // Fallback: try to parse from description or use defaults
            if (shadow.color.startsWith('color-shadow.')) {
                // Extract opacity from the path (e.g., 0[05] = 0.05)
                const opacityMatch = shadow.color.match(/\.(\d+\[\d+\])$/);
                let opacity = 0.05; // default
                if (opacityMatch) {
                    opacity = parseDecimalNotation(opacityMatch[1]);
                }
                // Base shadow color rgba(16, 24, 40, opacity)
                color = { r: 0.063, g: 0.094, b: 0.157, a: opacity };
            }
        }
        // Ensure color has alpha channel
        if (!('a' in color)) {
            color = Object.assign(Object.assign({}, color), { a: 1 });
        }
        // Ensure variables exist so they're available in Figma UI for manual attachment
        // Check Semantic first, then Primitive
        ensureShadowVariable(`position.x.${shadow.x}`, x, 'FLOAT', primitiveMap);
        ensureShadowVariable(`position.y.${shadow.y}`, y, 'FLOAT', primitiveMap);
        ensureShadowVariable(`blur.${shadow.blur}`, blur, 'FLOAT', primitiveMap);
        ensureShadowVariable(`spread.${shadow.spread}`, spread, 'FLOAT', primitiveMap);
        ensureShadowVariable(shadow.color, color, 'COLOR', primitiveMap);
        // Create effect with resolved values (numbers/RGB)
        if (isInner || shadow.inset) {
            effects.push({
                type: 'INNER_SHADOW',
                color: color,
                offset: { x, y },
                radius: blur,
                spread: spread,
                visible: true,
                blendMode: 'NORMAL'
            });
        }
        else {
            effects.push({
                type: 'DROP_SHADOW',
                color: color,
                offset: { x, y },
                radius: blur,
                spread: spread,
                visible: true,
                blendMode: 'NORMAL'
            });
        }
    }
    if (effects.length === 0) {
        return null;
    }
    // Check if style already exists
    const existingStyle = figma.getLocalEffectStyles().find(s => s.name === styleName);
    if (existingStyle) {
        // Update existing style
        existingStyle.effects = effects;
        return existingStyle;
    }
    else {
        // Create new style
        const style = figma.createEffectStyle();
        style.name = styleName;
        style.effects = effects;
        return style;
    }
}
// Resolve token reference to either a primitive variable alias or RGB value
function resolveTokenValue(value, tokens, primitiveMap, originalToken) {
    if (!value) {
        // If value is empty, try to extract from description
        if (originalToken && originalToken.description) {
            const hexFromDesc = extractHexFromDescription(originalToken.description);
            if (hexFromDesc) {
                return extractColorValue(hexFromDesc);
            }
        }
        return null;
    }
    // If it's a reference like {color.neutral.gray.0}, try to find primitive variable first
    const refMatch = value.match(/\{([^}]+)\}/);
    if (refMatch) {
        const refPath = refMatch[1];
        // First, try to find the primitive variable in Figma
        const primitiveVariable = findPrimitiveVariable(refPath);
        if (primitiveVariable) {
            // Return a variable alias to reference the primitive variable
            return {
                type: 'VARIABLE_ALIAS',
                id: primitiveVariable.id
            };
        }
        // If primitive variable not found, try to resolve from primitive map
        let resolvedValue = null;
        let resolvedToken;
        if (primitiveMap) {
            resolvedToken = primitiveMap.get(refPath);
            if (resolvedToken && resolvedToken.value) {
                resolvedValue = resolvedToken.value;
            }
        }
        // If not found in primitive, try tokens map
        if (!resolvedValue) {
            resolvedToken = tokens.get(refPath);
            if (resolvedToken && resolvedToken.value) {
                resolvedValue = resolvedToken.value;
            }
        }
        // If we found a resolved value, recursively resolve if it's another reference
        if (resolvedValue) {
            if (resolvedValue.includes('{')) {
                // Recursively resolve nested references
                return resolveTokenValue(resolvedValue, tokens, primitiveMap, resolvedToken);
            }
            else {
                // Direct value found - extract color
                const color = extractColorValue(resolvedValue);
                if (color)
                    return color;
                // If extraction failed, try description fallback
                if (resolvedToken && resolvedToken.description) {
                    const hexFromDesc = extractHexFromDescription(resolvedToken.description);
                    if (hexFromDesc) {
                        return extractColorValue(hexFromDesc);
                    }
                }
            }
        }
        else {
            // Reference not found - try description fallback from original token
            if (originalToken && originalToken.description) {
                const hexFromDesc = extractHexFromDescription(originalToken.description);
                if (hexFromDesc) {
                    return extractColorValue(hexFromDesc);
                }
            }
        }
    }
    // Try direct extraction
    const directColor = extractColorValue(value);
    if (directColor)
        return directColor;
    // Last resort: try description fallback
    if (originalToken && originalToken.description) {
        const hexFromDesc = extractHexFromDescription(originalToken.description);
        if (hexFromDesc) {
            return extractColorValue(hexFromDesc);
        }
    }
    return null;
}
// Test function to attempt attaching variables to effect properties
// Note: This will likely fail as Figma API doesn't support VariableAlias for effect properties
function testAttachVariablesToEffects() {
    const effectStyles = figma.getLocalEffectStyles();
    const results = [];
    results.push(`Found ${effectStyles.length} effect styles to test`);
    // Test if we can modify effect properties at all
    let testAttempts = 0;
    let readOnlyDetected = false;
    for (const style of effectStyles) {
        if (testAttempts >= 3)
            break; // Test first 3 styles only
        const effects = style.effects;
        for (const effect of effects) {
            if (effect.type !== 'DROP_SHADOW' && effect.type !== 'INNER_SHADOW') {
                continue;
            }
            testAttempts++;
            const shadowEffect = effect;
            // Note: Properties are read-only, so we can't test direct assignment
            readOnlyDetected = true;
            results.push(`⚠ ${style.name}: Effect properties are read-only`);
            // Test: Try creating new effect object with VariableAlias
            try {
                const testVar = figma.variables.getLocalVariables()
                    .find(v => v.resolvedType === 'FLOAT');
                if (testVar) {
                    const alias = {
                        type: 'VARIABLE_ALIAS',
                        id: testVar.id
                    };
                    // Try creating new effect with alias
                    const newEffect = {
                        type: 'DROP_SHADOW',
                        color: shadowEffect.color,
                        offset: {
                            // @ts-ignore - Try VariableAlias
                            x: alias,
                            y: shadowEffect.offset.y
                        },
                        radius: shadowEffect.radius,
                        spread: shadowEffect.spread,
                        visible: shadowEffect.visible,
                        blendMode: shadowEffect.blendMode
                    };
                    // Check if it accepted the alias
                    if (typeof newEffect.offset.x === 'object' && 'type' in newEffect.offset.x) {
                        results.push(`✓ ${style.name}: VariableAlias accepted in new effect object`);
                    }
                    else {
                        results.push(`✗ ${style.name}: VariableAlias rejected in new effect object`);
                    }
                }
            }
            catch (error) {
                results.push(`✗ ${style.name}: Error creating effect with alias - ${error instanceof Error ? error.message : String(error)}`);
            }
            break; // Test one effect per style
        }
    }
    if (readOnlyDetected) {
        results.push('');
        results.push('CONCLUSION: Effect properties are read-only. Variables cannot be attached programmatically.');
        results.push('SOLUTION: Attach variables manually in Figma UI using the hexagonal icon.');
    }
    return {
        success: 0,
        failed: testAttempts,
        results: results
    };
}
figma.ui.onmessage = async (msg) => {
    // Log ALL incoming messages - this should ALWAYS show
    console.log('=== PLUGIN MESSAGE RECEIVED ===');
    console.log('Message type:', msg.type);
    console.log('Message keys:', Object.keys(msg));
    // Don't log full message if it's huge (semanticData can be very large)
    if (msg.type === 'create-font-styles') {
        console.log('create-font-styles message - semanticData:', msg.semanticData ? `PRESENT (${Object.keys(msg.semanticData).length} top-level keys)` : 'MISSING');
        console.log('create-font-styles message - primitiveData:', msg.primitiveData ? 'PRESENT' : 'MISSING');
        // Immediate response
        figma.notify('Message received!', { timeout: 1000 });
    }
    else {
        console.log('Full message:', JSON.stringify(msg, null, 2));
    }
    if (msg.type === 'test-attach-variables') {
        try {
            const result = testAttachVariablesToEffects();
            figma.ui.postMessage({
                type: 'test-result',
                message: `Test complete. Success: ${result.success}, Failed: ${result.failed}`,
                results: result.results,
                error: false
            });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            figma.ui.postMessage({
                type: 'test-result',
                message: `Error: ${errorMessage}`,
                results: [],
                error: true
            });
        }
    }
    if (msg.type === 'create-variables') {
        try {
            const { lightData, darkData, primitiveData } = msg;
            // Build primitive map if provided
            let primitiveMap;
            if (primitiveData) {
                primitiveMap = buildPrimitiveMap(primitiveData);
            }
            // Flatten both token structures
            const lightTokens = flattenTokens(lightData);
            const darkTokens = flattenTokens(darkData);
            // Get all unique paths (should be the same for both)
            const allPaths = new Set([...lightTokens.keys(), ...darkTokens.keys()]);
            // Create or get the collection
            let collection = figma.variables.getLocalVariableCollections()
                .find(c => c.name === 'Semantic-Colors');
            if (!collection) {
                collection = figma.variables.createVariableCollection('Semantic-Colors');
                // Remove the default mode that Figma creates automatically
                // We only want Light and Dark modes
                const defaultMode = collection.modes[0];
                if (defaultMode && defaultMode.name !== 'Light' && defaultMode.name !== 'Dark') {
                    collection.removeMode(defaultMode.modeId);
                }
            }
            // Create or get modes
            let lightMode = collection.modes.find(m => m.name === 'Light');
            let darkMode = collection.modes.find(m => m.name === 'Dark');
            if (!lightMode) {
                const lightModeId = collection.addMode('Light');
                lightMode = collection.modes.find(m => m.modeId === lightModeId);
            }
            if (!darkMode) {
                const darkModeId = collection.addMode('Dark');
                darkMode = collection.modes.find(m => m.modeId === darkModeId);
            }
            // Remove any modes that aren't Light or Dark (e.g., default "Mode 1")
            const modesToRemove = collection.modes.filter(m => m.name !== 'Light' && m.name !== 'Dark');
            for (const mode of modesToRemove) {
                collection.removeMode(mode.modeId);
            }
            // Re-fetch modes after cleanup
            lightMode = collection.modes.find(m => m.name === 'Light');
            darkMode = collection.modes.find(m => m.name === 'Dark');
            if (!lightMode || !darkMode) {
                throw new Error('Failed to create modes');
            }
            // Remove any existing boxShadow variables from Semantic-Colors collection
            const boxShadowVariables = figma.variables.getLocalVariables()
                .filter(v => {
                if (v.variableCollectionId !== collection.id)
                    return false;
                const sanitizedName = v.name.toLowerCase();
                return sanitizedName.includes('boxshadow') || sanitizedName.includes('box-shadow');
            });
            for (const boxShadowVar of boxShadowVariables) {
                try {
                    boxShadowVar.remove();
                }
                catch (error) {
                    // Variable might be in use, skip it
                }
            }
            // Remove any existing Dark mode shadow styles (not needed)
            const darkShadowStyles = figma.getLocalEffectStyles()
                .filter(s => s.name.includes(' (Dark)'));
            for (const darkStyle of darkShadowStyles) {
                try {
                    darkStyle.remove();
                }
                catch (error) {
                    // Style might be in use, skip it
                }
            }
            // Remove any existing Light mode shadow styles and recreate without suffix
            const lightShadowStyles = figma.getLocalEffectStyles()
                .filter(s => s.name.includes(' (Light)'));
            for (const lightStyle of lightShadowStyles) {
                try {
                    lightStyle.remove();
                }
                catch (error) {
                    // Style might be in use, skip it
                }
            }
            // Sync variables for each token path
            let created = 0;
            let updated = 0;
            let skipped = 0;
            let effectStylesCreated = 0;
            let effectStylesUpdated = 0;
            for (const path of allPaths) {
                const lightToken = lightTokens.get(path);
                const darkToken = darkTokens.get(path);
                if (!lightToken || !darkToken) {
                    skipped++;
                    continue;
                }
                // Skip boxShadow tokens - they will be handled separately as Effect Styles
                if (path.includes('boxShadow')) {
                    continue;
                }
                // Skip font tokens - they will be handled separately as Text Styles
                if (path.includes('font.') && lightToken.type === 'string' && darkToken.type === 'string') {
                    continue;
                }
                // Sanitize the variable name to meet Figma's requirements
                const sanitizedName = sanitizeVariableName(path);
                // Check if variable already exists
                const existingVar = figma.variables.getLocalVariables()
                    .find(v => v.name === sanitizedName && v.variableCollectionId === collection.id);
                // Handle color tokens
                if (lightToken.type === 'color' && darkToken.type === 'color') {
                    // Resolve color values (returns VariableAlias or RGB/RGBA)
                    const lightColor = resolveTokenValue(lightToken.value, lightTokens, primitiveMap, lightToken);
                    const darkColor = resolveTokenValue(darkToken.value, darkTokens, primitiveMap, darkToken);
                    if (lightColor && darkColor) {
                        if (existingVar) {
                            // Update existing variable
                            try {
                                existingVar.setValueForMode(lightMode.modeId, lightColor);
                                existingVar.setValueForMode(darkMode.modeId, darkColor);
                                updated++;
                            }
                            catch (error) {
                                skipped++;
                            }
                        }
                        else {
                            // Create new variable
                            try {
                                const variable = figma.variables.createVariable(sanitizedName, collection, 'COLOR');
                                variable.setValueForMode(lightMode.modeId, lightColor);
                                variable.setValueForMode(darkMode.modeId, darkColor);
                                created++;
                            }
                            catch (error) {
                                skipped++;
                            }
                        }
                    }
                    else {
                        skipped++;
                    }
                }
                else {
                    skipped++;
                }
            }
            // Process boxShadow tokens as Effect Styles (use Light token values, same for both modes)
            const boxShadowPaths = Array.from(allPaths).filter(path => path.includes('boxShadow'));
            for (const path of boxShadowPaths) {
                const lightToken = lightTokens.get(path);
                const darkToken = darkTokens.get(path);
                if (!lightToken || !darkToken)
                    continue;
                // Skip "none" tokens
                if (lightToken.value === 'none' || darkToken.value === 'none')
                    continue;
                // Determine if it's inner shadow based on path or value
                const isInner = path.includes('inner') || lightToken.value.includes('inset') || darkToken.value.includes('inset');
                // Parse shadow values (use Light token, same for both modes)
                const shadows = parseBoxShadowValue(lightToken.value);
                // Create style name from path (e.g., "boxShadow/outer/xs") - no (Light) or (Dark) suffix
                const stylePath = path.replace(/^boxShadow\./, '');
                const styleName = sanitizeVariableName(stylePath);
                // Create/update single style (same for both modes)
                if (shadows.length > 0) {
                    const style = createEffectStyleFromShadows(styleName, shadows, isInner, primitiveMap);
                    if (style) {
                        const existing = figma.getLocalEffectStyles().find(s => s.name === styleName);
                        if (existing) {
                            effectStylesUpdated++;
                        }
                        else {
                            effectStylesCreated++;
                        }
                    }
                }
            }
            // Process font tokens as Text Styles - read directly from Semantic collection in Figma
            const fontStyleResults = await processFontStylesFromSemantic(primitiveMap);
            const { textStylesCreated, textStylesUpdated, textStylesSkipped } = fontStyleResults;
            const totalProcessed = created + updated;
            figma.ui.postMessage({
                type: 'status',
                message: `Success! Created ${created} variables, updated ${updated} variables. Created ${effectStylesCreated} effect styles, updated ${effectStylesUpdated} effect styles. Created ${textStylesCreated} text styles, updated ${textStylesUpdated} text styles. Skipped ${skipped} tokens.`,
                error: false
            });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            figma.ui.postMessage({
                type: 'status',
                message: `Error: ${errorMessage}`,
                error: true
            });
        }
    }
    if (msg.type === 'create-font-styles') {
        console.log('=== CREATE-FONT-STYLES HANDLER STARTING ===');
        // Show notification immediately - this should always work
        figma.notify('Processing font styles...', { timeout: 2000 });
        // Send immediate status update
        figma.ui.postMessage({
            type: 'status',
            message: 'Plugin received message. Starting processing...',
            error: false,
            logs: ['Handler triggered']
        });
        const logs = [];
        const addLog = (logMsg) => {
            const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
            const formatted = `[${timestamp}] ${logMsg}`;
            console.log(formatted);
            logs.push(formatted);
        };
        addLog('=== Starting font style creation ===');
        addLog(`semanticData: ${msg.semanticData ? 'PRESENT' : 'MISSING'}`);
        addLog(`primitiveData: ${msg.primitiveData ? 'PRESENT' : 'MISSING'}`);
        try {
            addLog('=== Starting font style creation ===');
            addLog(`Message type: ${msg.type}`);
            const { semanticData, primitiveData } = msg;
            addLog(`semanticData present: ${!!semanticData}`);
            addLog(`primitiveData present: ${!!primitiveData}`);
            if (!semanticData) {
                const errorMsg = 'Semantic.json file is required. Please upload Semantic.json first.';
                addLog(`ERROR: ${errorMsg}`);
                figma.notify(errorMsg, { error: true });
                figma.ui.postMessage({
                    type: 'status',
                    message: errorMsg,
                    error: true,
                    logs: logs
                });
                return;
            }
            addLog('✓ Semantic.json received');
            // Send initial status with immediate feedback
            addLog('Sending initial status update...');
            figma.ui.postMessage({
                type: 'status',
                message: 'Extracting font tokens from Semantic.json...',
                error: false,
                logs: logs.slice(-5)
            });
            // Force UI update
            await new Promise(resolve => setTimeout(resolve, 100));
            // Build primitive map if provided (for fallback resolution)
            let primitiveMap;
            if (primitiveData) {
                addLog('Building primitive map from uploaded Primitive.json...');
                primitiveMap = buildPrimitiveMap(primitiveData);
                addLog(`✓ Primitive map built with ${primitiveMap.size} tokens`);
            }
            else {
                addLog('⚠ No Primitive.json provided - will only use Figma Primitive variables');
            }
            // Flatten semantic tokens to find font tokens
            addLog('Flattening semantic tokens...');
            addLog(`semanticData keys: ${Object.keys(semanticData).slice(0, 10).join(', ')}`);
            let semanticTokens;
            let fontPaths = [];
            try {
                semanticTokens = flattenTokens(semanticData);
                addLog(`✓ Flattened ${semanticTokens.size} total tokens from Semantic.json`);
                // Send progress update
                figma.ui.postMessage({
                    type: 'status',
                    message: `Flattened ${semanticTokens.size} tokens. Looking for font tokens...`,
                    error: false,
                    logs: logs.slice(-10)
                });
                await new Promise(resolve => setTimeout(resolve, 100));
                // Filter for font tokens (paths starting with "font.")
                addLog('Filtering for font tokens...');
                const allPaths = Array.from(semanticTokens.keys());
                addLog(`Total paths: ${allPaths.length}`);
                addLog(`Sample paths: ${allPaths.slice(0, 10).join(', ')}`);
                fontPaths = allPaths.filter(path => {
                    return path.startsWith('font.') && path !== 'font' && path.split('.').length > 1;
                });
                addLog(`Found ${fontPaths.length} font token paths`);
                if (fontPaths.length > 0) {
                    addLog(`Sample font paths: ${fontPaths.slice(0, 5).join(', ')}`);
                }
                else {
                    addLog('WARNING: No font paths found! Checking if "font" key exists...');
                    const hasFontKey = 'font' in semanticData;
                    addLog(`Has "font" key: ${hasFontKey}`);
                    if (hasFontKey) {
                        addLog(`Font object keys: ${Object.keys(semanticData.font || {}).slice(0, 10).join(', ')}`);
                    }
                    addLog(`All available paths (first 20): ${allPaths.slice(0, 20).join(', ')}`);
                }
            }
            catch (flattenError) {
                const errorMsg = flattenError instanceof Error ? flattenError.message : String(flattenError);
                addLog(`ERROR flattening tokens: ${errorMsg}`);
                figma.notify(`Error: ${errorMsg}`, { error: true });
                figma.ui.postMessage({
                    type: 'status',
                    message: `Error: ${errorMsg}`,
                    error: true,
                    logs: logs
                });
                return;
            }
            if (fontPaths.length === 0) {
                const errorMsg = 'No font tokens found in Semantic.json. Make sure the file contains font tokens under the "font" key.';
                addLog(`ERROR: ${errorMsg}`);
                figma.notify(errorMsg, { error: true });
                figma.ui.postMessage({
                    type: 'status',
                    message: errorMsg,
                    error: true,
                    logs: logs
                });
                return;
            }
            figma.ui.postMessage({
                type: 'status',
                message: `Found ${fontPaths.length} font tokens. Processing font styles...`,
                error: false,
                logs: logs.slice(-10) // Send last 10 logs
            });
            // Check Primitive collection in Figma
            addLog('Checking Primitive collection in Figma...');
            const primitiveCollection = figma.variables.getLocalVariableCollections()
                .find(c => c.name === 'Primitive' || c.name === 'Primitives');
            if (primitiveCollection) {
                const primitiveVars = figma.variables.getLocalVariables()
                    .filter(v => v.variableCollectionId === primitiveCollection.id);
                addLog(`✓ Found Primitive collection with ${primitiveVars.length} variables`);
            }
            else {
                addLog('⚠ WARNING: No Primitive collection found in Figma. Font styles may not reference variables correctly.');
            }
            // Process font tokens from Semantic.json
            let textStylesCreated = 0;
            let textStylesUpdated = 0;
            let textStylesSkipped = 0;
            let processedCount = 0;
            const skippedReasons = {};
            addLog(`Starting to process ${fontPaths.length} font tokens...`);
            for (const path of fontPaths) {
                const token = semanticTokens.get(path);
                if (!token) {
                    skippedReasons['no token'] = (skippedReasons['no token'] || 0) + 1;
                    textStylesSkipped++;
                    continue;
                }
                // Skip if not a string type
                if (token.type !== 'string') {
                    skippedReasons[`type: ${token.type}`] = (skippedReasons[`type: ${token.type}`] || 0) + 1;
                    textStylesSkipped++;
                    continue;
                }
                // Skip "none" tokens
                if (token.value === 'none' || !token.value) {
                    skippedReasons['none value'] = (skippedReasons['none value'] || 0) + 1;
                    textStylesSkipped++;
                    continue;
                }
                processedCount++;
                // Send progress update every 5 tokens
                if (processedCount % 5 === 0) {
                    const progressMsg = `Processing... ${processedCount}/${fontPaths.length} (Created: ${textStylesCreated}, Updated: ${textStylesUpdated}, Skipped: ${textStylesSkipped})`;
                    addLog(progressMsg);
                    figma.ui.postMessage({
                        type: 'status',
                        message: progressMsg,
                        error: false,
                        logs: logs.slice(-15) // Send last 15 logs
                    });
                }
                // Parse font values from the token value string
                const fontProps = parseFontValue(token.value);
                if (!fontProps) {
                    addLog(`✗ Failed to parse font properties for path: ${path}`);
                    addLog(`  Value: ${token.value}`);
                    skippedReasons['parse failed'] = (skippedReasons['parse failed'] || 0) + 1;
                    textStylesSkipped++;
                    continue;
                }
                addLog(`✓ Parsed font properties for: ${path}`);
                addLog(`  fontSize: ${fontProps.fontSize || 'missing'}, fontWeight: ${fontProps.fontWeight || 'missing'}, fontFamily: ${fontProps.fontFamily || 'missing'}`);
                // Create style name with new structure: category/size/weight
                // e.g., "font.body.regular.2xl" -> "body/2xl/regular"
                // e.g., "font.subheading.regular.lg" -> "subheading/lg/regular"
                // e.g., "font.heading.regular.display" -> "heading/display/regular"
                const pathParts = path.replace(/^font\./, '').split('.');
                // Determine structure: if last part is a size, then structure is: category/size/weight
                let styleName;
                if (pathParts.length >= 3) {
                    // Check if last part looks like a size
                    // Body sizes: 2xl, xl, base, md, sm, xs, 2xs, 3xs, 4xs
                    // Heading sizes: display, h1-h6
                    // Subheading sizes: lg, md, sm
                    const lastPart = pathParts[pathParts.length - 1];
                    const sizePattern = /^(2xl|xl|base|md|sm|xs|2xs|3xs|4xs|display|h[1-6]|lg)$/i;
                    if (sizePattern.test(lastPart)) {
                        // Structure: category/size/weight
                        // e.g., ["body", "regular", "2xl"] -> "body/2xl/regular"
                        // e.g., ["subheading", "regular", "lg"] -> "subheading/lg/regular"
                        const category = pathParts[0]; // body, heading, subheading
                        const weight = pathParts[1]; // regular, medium, semibold, bold
                        const size = lastPart;
                        styleName = `${category}/${size}/${weight}`;
                    }
                    else {
                        // Keep original structure for other cases
                        styleName = sanitizeVariableName(path.replace(/^font\./, ''));
                    }
                }
                else {
                    // Fallback to original structure
                    styleName = sanitizeVariableName(path.replace(/^font\./, ''));
                }
                addLog(`  Style name: ${styleName} (from path: ${path})`);
                // Find existing style by new name or old name pattern
                // First try to find by new name
                let existingStyle = figma.getLocalTextStyles().find(s => s.name === styleName);
                // If not found, try to find by old naming pattern and update it
                if (!existingStyle && pathParts.length >= 3) {
                    // Try old pattern: category/weight/size (e.g., "body/regular/2xl")
                    const oldStyleName = `${pathParts[0]}/${pathParts[1]}/${pathParts[pathParts.length - 1]}`;
                    existingStyle = figma.getLocalTextStyles().find(s => s.name === oldStyleName);
                    if (existingStyle) {
                        addLog(`  Found existing style with old name: ${oldStyleName}, will rename to: ${styleName}`);
                    }
                }
                const wasExisting = !!existingStyle;
                // Create/update text style (references Primitive variables from Figma)
                try {
                    addLog(`  Creating/updating text style...`);
                    const style = await createTextStyleFromFont(styleName, fontProps, primitiveMap, existingStyle);
                    if (style) {
                        // If style existed with old name, rename it
                        if (existingStyle && existingStyle.name !== styleName) {
                            style.name = styleName;
                            addLog(`  ✓ Renamed style from ${existingStyle.name} to ${styleName}`);
                        }
                        if (wasExisting) {
                            addLog(`  ✓ Updated existing text style: ${styleName}`);
                            textStylesUpdated++;
                        }
                        else {
                            addLog(`  ✓ Created new text style: ${styleName}`);
                            textStylesCreated++;
                        }
                    }
                    else {
                        addLog(`  ✗ Failed to create text style: ${styleName} (createTextStyleFromFont returned null)`);
                        skippedReasons['creation failed'] = (skippedReasons['creation failed'] || 0) + 1;
                        textStylesSkipped++;
                    }
                }
                catch (error) {
                    const errorMsg = error instanceof Error ? error.message : String(error);
                    addLog(`  ✗ ERROR creating text style: ${styleName}`);
                    addLog(`    Error: ${errorMsg}`);
                    skippedReasons['error'] = (skippedReasons['error'] || 0) + 1;
                    textStylesSkipped++;
                }
            }
            addLog('=== Font style creation complete ===');
            addLog(`Results: Created ${textStylesCreated}, Updated ${textStylesUpdated}, Skipped ${textStylesSkipped}`);
            if (Object.keys(skippedReasons).length > 0) {
                addLog('Skipped reasons:');
                for (const [reason, count] of Object.entries(skippedReasons)) {
                    addLog(`  ${reason}: ${count}`);
                }
            }
            // Show notification in Figma
            const successMsg = `Font styles: ${textStylesCreated} created, ${textStylesUpdated} updated, ${textStylesSkipped} skipped`;
            figma.notify(successMsg, { timeout: 5000 });
            // Send detailed status to UI with all logs
            const detailedMsg = `Success! Created ${textStylesCreated} text styles, updated ${textStylesUpdated} text styles. Skipped ${textStylesSkipped} tokens.`;
            figma.ui.postMessage({
                type: 'status',
                message: detailedMsg,
                error: false,
                logs: logs
            });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            const stackTrace = error instanceof Error ? error.stack : '';
            const fullError = `Error creating font styles: ${errorMessage}`;
            addLog(`=== FATAL ERROR ===`);
            addLog(`Error: ${errorMessage}`);
            if (stackTrace) {
                addLog(`Stack: ${stackTrace}`);
            }
            // Show error notification in Figma
            figma.notify(fullError, { error: true });
            // Send error to UI with logs
            figma.ui.postMessage({
                type: 'status',
                message: fullError,
                error: true,
                logs: logs
            });
        }
    }
    if (msg.type === 'close') {
        figma.closePlugin();
    }
};
// Show the UI
figma.showUI(__html__, { width: 400, height: 300 });
// Test log to verify plugin code is loaded
console.log('=== PLUGIN CODE LOADED ===');
console.log('Plugin ready. Waiting for messages...');
figma.notify('Plugin loaded successfully', { timeout: 2000 });
