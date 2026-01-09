# Plugin Fixes - Apply Component Tokens

## What Was Fixed

The plugin was previously only applying padding values directly, not binding Figma variables. It has been completely rewritten to properly bind existing Figma variables to component properties.

## Key Changes

### 1. Variable Binding Instead of Direct Values
- **Before**: Plugin set direct pixel/color values
- **After**: Plugin binds Figma variables using `setBoundVariable` API
- **Benefit**: Components now use variables, allowing for easy theme switching and updates

### 2. Improved Variable Finding
- **Before**: Limited search patterns
- **After**: Multiple search patterns:
  - Exact match: `color.background.neutral.base`
  - With slashes: `color/background/neutral/base`
  - With dashes: `color-background-neutral-base`
  - Case-insensitive matching
  - Partial matching (last 2-3 parts)

### 3. Complete Property Support
- **Before**: Only padding was applied
- **After**: All properties supported:
  - Colors (fills, strokes) - uses `setBoundVariable('fills', variable)`
  - Border radius - uses `setBoundVariable('cornerRadius', variable)`
  - Padding - uses VariableAlias (may not support setBoundVariable)
  - Text colors
  - Icon colors

## How to Use

### Prerequisites
1. **Variables must exist in Figma collections first**
   - Use `figma-plugin-semantic-colors` to create variables, OR
   - Create variables manually in Figma Variables panel

2. **Variable names should match token references**
   - Token reference: `{color.background.neutral.base}`
   - Variable name can be: `color.background.neutral.base` or `color/background/neutral/base`

### Steps

1. **Build the plugin** (if not already built):
   ```bash
   cd figma-plugin-apply-tokens
   npm install
   npm run build
   ```

2. **Load plugin in Figma**:
   - Open Figma Desktop App
   - Plugins → Development → Import plugin from manifest...
   - Select `manifest.json` from `figma-plugin-apply-tokens` folder

3. **Load mapping files**:
   - Run plugin: Plugins → Development → Apply Component Tokens
   - Click "Choose File" and select mapping files from `figma-mappings/` folder
   - Plugin will show how many mappings were loaded

4. **Select components**:
   - Select the components you want to apply tokens to
   - Or leave nothing selected to apply to all components

5. **Apply tokens**:
   - Click "Apply Tokens to Selection" (or "Apply Tokens to All Components")
   - Plugin will:
     - Find matching components
     - Search for Figma variables matching token references
     - Bind variables to component properties
     - Show results in the log

## Troubleshooting

### "No variables found" errors
- **Check**: Variables exist in Figma Variables panel
- **Check**: Variable names match token references (try different naming patterns)
- **Check**: Variables are in the correct collection (Semantic/Primitive)

### Variables found but not binding
- **Check**: Node type supports the property (e.g., fills only on certain node types)
- **Check**: Auto-layout is enabled for padding properties
- **Check**: Console for specific error messages

### Components not matching
- Use "Scan for Components" button to see what components are found
- Check component names match mapping patterns
- Check parent frame names (plugin matches by parent hierarchy)

## Testing

To test the plugin:

1. Create a simple component in Figma:
   - Frame named "Content Switcher Item" or "State=Selected"
   - Add a fill color
   - Enable auto-layout

2. Ensure variables exist:
   - Variable named `color.background.neutral.base` (or similar)
   - Variable type: COLOR
   - Value: Any color

3. Load mapping file:
   - Use `content-switcher-item-mapping.json` from `figma-mappings/` folder

4. Apply tokens:
   - Select the component
   - Click "Apply Tokens to Selection"
   - Check that the fill color now shows a variable binding (chain icon)

## API Usage

The plugin uses the following Figma Plugin API methods:

- `figma.variables.getLocalVariables()` - Get all variables
- `node.setBoundVariable(property, variable)` - Bind variable to property
- `VariableAlias` - For properties that don't support setBoundVariable

Supported properties:
- `fills` - COLOR variables
- `strokes` - COLOR variables  
- `cornerRadius` - FLOAT variables
- `paddingLeft/Right/Top/Bottom` - FLOAT variables (via VariableAlias)

## Next Steps

If the plugin still doesn't work:

1. Check Figma console for errors (Plugins → Development → Open Console)
2. Verify variables exist and are accessible
3. Try with a simple test component first
4. Check that mapping files are correctly formatted
5. Ensure component names match mapping patterns
