# Variable Binding Fix - Apply Tokens Plugin

## Problem
The plugin was setting direct color/pixel values instead of binding Figma variables. This meant components weren't actually using variables from Figma collections, making theme switching and updates impossible.

## Solution
Completely rewrote the token application logic to properly bind Figma variables using the correct API methods.

## Key Changes

### 1. Variable Finding Function
Added `findVariable()` function that:
- Searches for variables by token reference (e.g., `{color.background.neutral.base}`)
- Tries multiple naming patterns:
  - `component / category / state / property` (e.g., `content-switcher-item / color / selected / background`)
  - `component / category / property` (for dimensions)
  - `component / property`
  - Property name alone (fallback)
- Handles variable name formats with slashes (`/`), dots (`.`), or dashes (`-`)

### 2. Proper Variable Binding

#### Colors (Fills & Strokes)
- **Before**: `node.fills = [{ type: 'SOLID', color: ... }]` (direct value)
- **After**: Uses `figma.variables.setBoundVariableForPaint()` to bind variables
  ```typescript
  const boundPaint = figma.variables.setBoundVariableForPaint(
    firstFill,
    'color',
    variable
  );
  node.fills = [boundPaint, ...node.fills.slice(1)];
  ```

#### Border Radius
- **Before**: `node.cornerRadius = radius` (direct value)
- **After**: Binds to individual corner radii (since `cornerRadius` isn't directly bindable):
  ```typescript
  node.setBoundVariable('topLeftRadius', variable);
  node.setBoundVariable('topRightRadius', variable);
  node.setBoundVariable('bottomLeftRadius', variable);
  node.setBoundVariable('bottomRightRadius', variable);
  ```

#### Padding
- **Before**: `node.paddingLeft = px` (direct value)
- **After**: Uses `setBoundVariable()` for each padding property:
  ```typescript
  node.setBoundVariable('paddingLeft', variable);
  node.setBoundVariable('paddingRight', variable);
  ```

### 3. Fallback Behavior
If a variable isn't found, the plugin falls back to applying direct values. This ensures components still get updated even if variables don't exist yet.

## How It Works Now

1. **Token Reference Matching**: When a token has a reference like `{color.background.neutral.base}`, the plugin searches for a matching variable in Figma collections.

2. **Variable Name Patterns**: The plugin tries multiple patterns to find variables:
   - Exact match by reference path
   - Component-based patterns: `{component} / {category} / {state} / {property}`
   - Property-based patterns

3. **Variable Binding**: Once found, variables are bound using the correct API:
   - Colors → `setBoundVariableForPaint()` on paint objects
   - Dimensions → `setBoundVariable()` on node properties
   - Individual corners → `setBoundVariable()` on corner-specific properties

4. **Console Logging**: Detailed logs show:
   - Which variables were found
   - Which variables couldn't be found
   - What patterns were searched
   - Available variables for debugging

## Testing

To test the plugin:

1. **Ensure variables exist** in Figma Variables panel (use the semantic-colors plugin to create them)

2. **Load mapping files** in the plugin UI

3. **Select components** you want to update

4. **Click "Apply Tokens to Selection"**

5. **Check the console** (Plugins → Development → Open Console) for:
   - `✓ Found variable by...` messages (success)
   - `✗ Variable not found...` messages (needs investigation)
   - Available variables list (for debugging)

6. **Verify in Figma**: 
   - Select a component
   - Check the Properties panel
   - Colors/fills should show a variable icon (🔗) instead of a solid color
   - Border radius should show variable binding
   - Padding should show variable binding

## Variable Naming Recommendations

For best results, name variables using this pattern:
```
{component-name} / {category} / {state} / {property}
```

Examples:
- `content-switcher-item / color / selected / background`
- `content-switcher-item / color / default / text`
- `content-switcher-item / padding / horizontal`
- `content-switcher-item / border / radius`

The plugin will also find variables with:
- Dots instead of slashes: `content-switcher-item.color.selected.background`
- Dashes: `content-switcher-item-color-selected-background`
- Just the property name (if unique)

## Troubleshooting

### Variables Not Binding
1. Check console logs to see what patterns were searched
2. Verify variable names match expected patterns
3. Ensure variable types match (COLOR for colors, FLOAT for dimensions)
4. Check that variables exist in the current file (not just in libraries)

### Variables Found But Not Applied
1. Check console for error messages
2. Verify node types support the property (e.g., padding only works on auto-layout frames)
3. Ensure the node isn't locked or in a read-only component

### Fallback to Direct Values
If variables aren't found, the plugin applies direct values as a fallback. Check console logs to see why variables weren't found and create them if needed.
