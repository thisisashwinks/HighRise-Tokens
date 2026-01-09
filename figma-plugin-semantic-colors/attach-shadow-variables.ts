// Script to attach token variables to shadow effect properties
// This script attempts to programmatically attach variables to effect styles

interface ShadowObject {
  x: string;
  y: string;
  blur: string;
  spread: string;
  color: string;
  inset?: boolean;
}

// Parse boxShadow token value string into shadow objects
function parseBoxShadowValue(value: string): ShadowObject[] {
  if (!value || value === 'none') {
    return [];
  }
  
  const shadows: ShadowObject[] = [];
  const arrayMatch = value.match(/\[(.*)\]/);
  if (!arrayMatch) return [];
  
  const content = arrayMatch[1];
  const shadowMatches = content.match(/\{[^}]+\}/g);
  
  if (!shadowMatches) return [];
  
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
function sanitizeVariableName(path: string): string {
  const segments = path.split('.');
  const sanitized = segments.map((segment) => {
    return segment.replace(/[^a-zA-Z0-9_-]/g, '_');
  });
  return sanitized.join('/');
}

// Find variable by path
function findVariable(refPath: string): Variable | null {
  const sanitizedName = sanitizeVariableName(refPath);
  
  // Check Semantic collection first
  const semanticCollection = figma.variables.getLocalVariableCollections()
    .find(c => c.name === 'Semantic' || c.name === 'Semantics');
  
  if (semanticCollection) {
    const variable = figma.variables.getLocalVariables()
      .find(v => v.name === sanitizedName && v.variableCollectionId === semanticCollection.id);
    if (variable) return variable;
  }
  
  // Check Semantic-Colors collection
  const semanticColorsCollection = figma.variables.getLocalVariableCollections()
    .find(c => c.name === 'Semantic-Colors');
  
  if (semanticColorsCollection) {
    const variable = figma.variables.getLocalVariables()
      .find(v => v.name === sanitizedName && v.variableCollectionId === semanticColorsCollection.id);
    if (variable) return variable;
  }
  
  // Check Primitive collection
  const primitiveCollection = figma.variables.getLocalVariableCollections()
    .find(c => c.name === 'Primitive' || c.name === 'Primitives');
  
  if (primitiveCollection) {
    const variable = figma.variables.getLocalVariables()
      .find(v => v.name === sanitizedName && v.variableCollectionId === primitiveCollection.id);
    if (variable) return variable;
  }
  
  // Fallback: search all collections
  const allVariables = figma.variables.getLocalVariables();
  return allVariables.find(v => v.name === sanitizedName) || null;
}

// Attempt to attach variable to effect property
// Note: This may not work if Figma API doesn't support it, but we'll try different methods
function attachVariableToEffectProperty(
  effect: DropShadowEffect | InnerShadowEffect,
  property: 'x' | 'y' | 'blur' | 'spread' | 'color',
  variable: Variable
): boolean {
  try {
    // Method 1: Try to use setBoundVariable if it exists (may not be available)
    // @ts-ignore - This method may not exist in the API
    if (effect.setBoundVariable && typeof effect.setBoundVariable === 'function') {
      effect.setBoundVariable(property, variable.id);
      return true;
    }
    
    // Method 2: Try to modify the effect object directly with VariableAlias
    const alias: VariableAlias = {
      type: 'VARIABLE_ALIAS',
      id: variable.id
    };
    
    if (property === 'x' && 'offset' in effect) {
      // @ts-ignore - Try to set VariableAlias
      effect.offset.x = alias;
      return true;
    }
    
    if (property === 'y' && 'offset' in effect) {
      // @ts-ignore - Try to set VariableAlias
      effect.offset.y = alias;
      return true;
    }
    
    if (property === 'blur' && 'radius' in effect) {
      // @ts-ignore - Try to set VariableAlias
      effect.radius = alias;
      return true;
    }
    
    if (property === 'spread' && 'spread' in effect) {
      // @ts-ignore - Try to set VariableAlias
      effect.spread = alias;
      return true;
    }
    
    if (property === 'color' && 'color' in effect) {
      // @ts-ignore - Try to set VariableAlias
      effect.color = alias;
      return true;
    }
    
    return false;
  } catch (error) {
    console.log(`Failed to attach variable to ${property}:`, error);
    return false;
  }
}

// Main function to attach variables to effect styles
function attachVariablesToEffectStyles() {
  const effectStyles = figma.getLocalEffectStyles();
  let attachedCount = 0;
  let failedCount = 0;
  
  for (const style of effectStyles) {
    const effects = style.effects;
    
    for (let i = 0; i < effects.length; i++) {
      const effect = effects[i];
      
      // Only process drop shadows and inner shadows
      if (effect.type !== 'DROP_SHADOW' && effect.type !== 'INNER_SHADOW') {
        continue;
      }
      
      // Try to extract token references from style description or name
      // This assumes the style was created with token references in the description
      const description = style.description || '';
      
      // Parse token references from description if available
      // Format: Token References: [{position.x: {position.x.0}, position.y: {position.y.0[25]}, ...}]
      const tokenRefs = description.match(/\{([^}]+)\}/g);
      
      if (tokenRefs) {
        // Try to attach variables based on description
        // This is a simplified approach - you may need to adjust based on your description format
        console.log(`Processing style: ${style.name}`);
        
        // For now, we'll try to attach variables based on common patterns
        // You may need to customize this based on your actual token structure
      }
      
      // Alternative: Try to attach variables by checking if values match existing variables
      // This is a heuristic approach
      if (effect.type === 'DROP_SHADOW' || effect.type === 'INNER_SHADOW') {
        const shadowEffect = effect as DropShadowEffect | InnerShadowEffect;
        
        // Try to find matching variables for each property
        // Note: This is a best-guess approach since we don't have the original token references
        
        // Try common position values
        if ('offset' in shadowEffect && typeof shadowEffect.offset.x === 'number') {
          const xValue = shadowEffect.offset.x;
          // Try to find a variable with this value
          const xVars = figma.variables.getLocalVariables()
            .filter(v => v.resolvedType === 'FLOAT');
          
          for (const xVar of xVars) {
            const collection = figma.variables.getVariableCollectionById(xVar.variableCollectionId);
            if (collection && collection.modes.length > 0) {
              const varValue = xVar.valuesByMode[collection.modes[0].modeId];
              if (typeof varValue === 'number' && Math.abs(varValue - xValue) < 0.001) {
                if (attachVariableToEffectProperty(shadowEffect, 'x', xVar)) {
                  attachedCount++;
                  console.log(`Attached variable ${xVar.name} to ${style.name} offset.x`);
                  break;
                }
              }
            }
          }
        }
        
        // Similar for y, blur, spread, color...
        // (Implement similar logic for other properties)
      }
    }
    
    // Update the style with modified effects
    try {
      style.effects = effects;
      console.log(`Updated style: ${style.name}`);
    } catch (error) {
      console.log(`Failed to update style ${style.name}:`, error);
      failedCount++;
    }
  }
  
  figma.notify(`Attached ${attachedCount} variables. Failed: ${failedCount}`);
}

// Run the script
attachVariablesToEffectStyles();

