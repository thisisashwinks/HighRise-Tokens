// Test script to attempt attaching variables to effect properties
// Run this in Figma's plugin console or as a standalone plugin

// This script tests different methods to attach variables to effect properties
// Note: Figma's API may not support this, but we'll try all possible methods

console.log('Starting variable attachment test...');

// Get all effect styles
const effectStyles = figma.getLocalEffectStyles();
console.log(`Found ${effectStyles.length} effect styles`);

let testResults = [];

for (const style of effectStyles) {
  console.log(`\nTesting style: ${style.name}`);
  
  const effects = [...style.effects]; // Copy to modify
  let modified = false;
  
  for (let i = 0; i < effects.length; i++) {
    const effect = effects[i];
    
    if (effect.type !== 'DROP_SHADOW' && effect.type !== 'INNER_SHADOW') {
      continue;
    }
    
    const shadowEffect = effect;
    console.log(`  Effect ${i}: ${effect.type}`);
    
    // Method 1: Try direct property assignment with VariableAlias
    console.log('  Method 1: Direct VariableAlias assignment...');
    try {
      // Find a test variable (use first FLOAT variable we find)
      const testVar = figma.variables.getLocalVariables()
        .find(v => v.resolvedType === 'FLOAT');
      
      if (testVar && 'offset' in shadowEffect) {
        const originalX = shadowEffect.offset.x;
        const alias = {
          type: 'VARIABLE_ALIAS',
          id: testVar.id
        };
        
        // Try to assign
        shadowEffect.offset.x = alias;
        
        // Check if it worked
        if (shadowEffect.offset.x === alias || 
            (typeof shadowEffect.offset.x === 'object' && shadowEffect.offset.x.type === 'VARIABLE_ALIAS')) {
          console.log('    ✓ Method 1 WORKED! VariableAlias assignment succeeded');
          testResults.push({ style: style.name, method: 1, success: true });
          modified = true;
        } else {
          console.log('    ✗ Method 1 failed - assignment reverted');
          shadowEffect.offset.x = originalX; // Restore
        }
      }
    } catch (error) {
      console.log(`    ✗ Method 1 error: ${error.message}`);
    }
    
    // Method 2: Try using setBoundVariable (if it exists)
    console.log('  Method 2: setBoundVariable method...');
    try {
      // @ts-ignore
      if (shadowEffect.setBoundVariable && typeof shadowEffect.setBoundVariable === 'function') {
        const testVar = figma.variables.getLocalVariables()
          .find(v => v.resolvedType === 'FLOAT');
        
        if (testVar) {
          shadowEffect.setBoundVariable('offset.x', testVar.id);
          console.log('    ✓ Method 2 WORKED! setBoundVariable exists and was called');
          testResults.push({ style: style.name, method: 2, success: true });
          modified = true;
        }
      } else {
        console.log('    ✗ Method 2 failed - setBoundVariable does not exist');
      }
    } catch (error) {
      console.log(`    ✗ Method 2 error: ${error.message}`);
    }
    
    // Method 3: Try modifying the effect object structure
    console.log('  Method 3: Object structure modification...');
    try {
      const testVar = figma.variables.getLocalVariables()
        .find(v => v.resolvedType === 'FLOAT');
      
      if (testVar && 'offset' in shadowEffect) {
        // Try creating a new offset object with VariableAlias
        const newOffset = {
          x: {
            type: 'VARIABLE_ALIAS',
            id: testVar.id
          },
          y: shadowEffect.offset.y
        };
        
        shadowEffect.offset = newOffset;
        
        // Check if it worked
        if (typeof shadowEffect.offset.x === 'object' && shadowEffect.offset.x.type === 'VARIABLE_ALIAS') {
          console.log('    ✓ Method 3 WORKED! Object structure modification succeeded');
          testResults.push({ style: style.name, method: 3, success: true });
          modified = true;
        } else {
          console.log('    ✗ Method 3 failed - structure reverted');
        }
      }
    } catch (error) {
      console.log(`    ✗ Method 3 error: ${error.message}`);
    }
    
    // Method 4: Try using Object.defineProperty
    console.log('  Method 4: Object.defineProperty...');
    try {
      const testVar = figma.variables.getLocalVariables()
        .find(v => v.resolvedType === 'FLOAT');
      
      if (testVar && 'offset' in shadowEffect) {
        const alias = {
          type: 'VARIABLE_ALIAS',
          id: testVar.id
        };
        
        Object.defineProperty(shadowEffect.offset, 'x', {
          value: alias,
          writable: true,
          enumerable: true,
          configurable: true
        });
        
        if (shadowEffect.offset.x === alias) {
          console.log('    ✓ Method 4 WORKED! Object.defineProperty succeeded');
          testResults.push({ style: style.name, method: 4, success: true });
          modified = true;
        } else {
          console.log('    ✗ Method 4 failed');
        }
      }
    } catch (error) {
      console.log(`    ✗ Method 4 error: ${error.message}`);
    }
  }
  
  // Try to update the style if modified
  if (modified) {
    try {
      style.effects = effects;
      console.log(`  ✓ Updated style: ${style.name}`);
    } catch (error) {
      console.log(`  ✗ Failed to update style: ${error.message}`);
    }
  }
}

// Summary
console.log('\n=== TEST SUMMARY ===');
const successful = testResults.filter(r => r.success);
const failed = testResults.filter(r => !r.success);

console.log(`Successful attachments: ${successful.length}`);
console.log(`Failed attempts: ${failed.length}`);

if (successful.length > 0) {
  console.log('\nSuccessful methods:');
  successful.forEach(r => {
    console.log(`  - Style: ${r.style}, Method: ${r.method}`);
  });
  figma.notify(`✓ Success! ${successful.length} variable attachments worked. Check console for details.`);
} else {
  console.log('\n⚠ No methods worked. Figma API does not support VariableAlias for effect properties.');
  console.log('Variables are available for manual attachment in Figma UI.');
  figma.notify('⚠ No automatic attachment method found. Variables available for manual attachment.');
}

// Export results
return {
  successful: successful.length,
  failed: failed.length,
  results: testResults
};

