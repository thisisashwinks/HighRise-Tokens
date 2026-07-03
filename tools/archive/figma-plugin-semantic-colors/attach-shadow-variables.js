// Script to attach token variables to shadow effect properties
// This script attempts to programmatically attach variables to effect styles

// Parse boxShadow token value string into shadow objects
function parseBoxShadowValue(value) {
    if (!value || value === 'none') {
        return [];
    }
    const shadows = [];
    const arrayMatch = value.match(/\[(.*)\]/);
    if (!arrayMatch)
        return [];
    const content = arrayMatch[1];
    const shadowMatches = content.match(/\{[^}]+\}/g);
    if (!shadowMatches)
        return [];
    for (const shadowStr of shadowMatches) {
        const cleanStr = shadowStr.replace(/^\{|\}$/g, '').trim();
        const xMatch = cleanStr.match(/position\.x\.([^,}]+)/);
        const yMatch = cleanStr.match(/position\.y\.([^,}]+)/);
        const blurMatch = cleanStr.match(/blur\.([^,}]+)/);
        const spreadMatch = cleanStr.match(/spread\.([^,}]+)/);
        const colorMatch = cleanStr.match(/(color[^,}]+)/);
        const insetMatch = cleanStr.match(/color-shadow\.inset\.true/);
        if (xMatch && yMatch && blurMatch && spreadMatch && colorMatch) {
            let colorValue = colorMatch[1].trim();
            if (colorValue.includes('color-shadow.inset')) {
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

// Sanitize variable name
function sanitizeVariableName(path) {
    const segments = path.split('.');
    const sanitized = segments.map((segment) => {
        return segment.replace(/[^a-zA-Z0-9_-]/g, '_');
    });
    return sanitized.join('/');
}

// Find variable by path (checks Semantic first, then Primitive)
function findVariable(refPath) {
    const sanitizedName = sanitizeVariableName(refPath);
    // Check Semantic collection first
    const semanticCollection = figma.variables.getLocalVariableCollections()
        .find(c => c.name === 'Semantic' || c.name === 'Semantics');
    if (semanticCollection) {
        const variable = figma.variables.getLocalVariables()
            .find(v => v.name === sanitizedName && v.variableCollectionId === semanticCollection.id);
        if (variable)
            return variable;
    }
    // Check Semantic-Colors collection
    const semanticColorsCollection = figma.variables.getLocalVariableCollections()
        .find(c => c.name === 'Semantic-Colors');
    if (semanticColorsCollection) {
        const variable = figma.variables.getLocalVariables()
            .find(v => v.name === sanitizedName && v.variableCollectionId === semanticColorsCollection.id);
        if (variable)
            return variable;
    }
    // Check Primitive collection
    const primitiveCollection = figma.variables.getLocalVariableCollections()
        .find(c => c.name === 'Primitive' || c.name === 'Primitives');
    if (primitiveCollection) {
        const variable = figma.variables.getLocalVariables()
            .find(v => v.name === sanitizedName && v.variableCollectionId === primitiveCollection.id);
        if (variable)
            return variable;
    }
    // Fallback: search all collections
    const allVariables = figma.variables.getLocalVariables();
    return allVariables.find(v => v.name === sanitizedName) || null;
}

// Main function to attach variables to effect styles based on token references
function attachVariablesToEffectStyles() {
    const effectStyles = figma.getLocalEffectStyles();
    let attachedCount = 0;
    let failedCount = 0;
    const results = [];
    for (const style of effectStyles) {
        const effects = [...style.effects]; // Create a copy to modify
        let styleModified = false;
        for (let i = 0; i < effects.length; i++) {
            const effect = effects[i];
            // Only process drop shadows and inner shadows
            if (effect.type !== 'DROP_SHADOW' && effect.type !== 'INNER_SHADOW') {
                continue;
            }
            const shadowEffect = effect;
            // Try to extract token path from style name or description
            // Style names are like "outer/xs" which corresponds to "boxShadow.outer.xs"
            // We need to reconstruct the token path
            const styleName = style.name;
            const fullPath = `boxShadow.${styleName.replace(/\//g, '.')}`;
            // For now, we'll try a different approach:
            // Check if we can find variables that match the effect values
            // and try to attach them
            // This is experimental and may not work due to API limitations
            try {
                // Try Method 1: Direct property assignment with VariableAlias
                // This likely won't work but we'll try
                if ('offset' in shadowEffect) {
                    // Try to find position.x variable
                    const xVars = figma.variables.getLocalVariables()
                        .filter(v => v.resolvedType === 'FLOAT' && v.name.includes('position') && v.name.includes('x'));
                    for (const xVar of xVars) {
                        const collection = figma.variables.getVariableCollectionById(xVar.variableCollectionId);
                        if (collection && collection.modes.length > 0) {
                            const varValue = xVar.valuesByMode[collection.modes[0].modeId];
                            if (typeof varValue === 'number' && typeof shadowEffect.offset.x === 'number') {
                                if (Math.abs(varValue - shadowEffect.offset.x) < 0.001) {
                                    // Try to attach
                                    try {
                                        // @ts-ignore - Experimental: Try to set VariableAlias
                                        shadowEffect.offset.x = {
                                            type: 'VARIABLE_ALIAS',
                                            id: xVar.id
                                        };
                                        styleModified = true;
                                        attachedCount++;
                                        results.push(`✓ Attached ${xVar.name} to ${styleName}.offset.x`);
                                        break;
                                    }
                                    catch (e) {
                                        // This will likely fail
                                    }
                                }
                            }
                        }
                    }
                }
            }
            catch (error) {
                failedCount++;
                results.push(`✗ Failed to attach variables to ${styleName}: ${error.message}`);
            }
        }
        // Try to update the style if modified
        if (styleModified) {
            try {
                style.effects = effects;
            }
            catch (error) {
                failedCount++;
                results.push(`✗ Failed to update style ${style.name}: ${error.message}`);
            }
        }
    }
    // Show results
    console.log('Results:', results);
    figma.notify(`Attempted to attach variables. Attached: ${attachedCount}, Failed: ${failedCount}. Check console for details.`);
    // Return results for UI display
    return {
        attached: attachedCount,
        failed: failedCount,
        results: results
    };
}

// Export for use in plugin
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { attachVariablesToEffectStyles, findVariable, parseBoxShadowValue };
}

// If running directly in Figma plugin context
if (typeof figma !== 'undefined') {
    attachVariablesToEffectStyles();
}

