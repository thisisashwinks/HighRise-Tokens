# Apply Component Tokens - Figma Plugin

Automatically bind Figma variables to component properties based on design token mappings.

## Features

✅ **Variable Binding** - Binds existing Figma variables to component properties (not direct values)
✅ **Batch Processing** - Apply tokens to all components at once
✅ **All Token Types** - Colors, dimensions, typography, shadows
✅ **State-Aware** - Handles selected/default/hover/active states
✅ **Recursive Updates** - Updates nested components automatically
✅ **Smart Matching** - Automatically finds matching components
✅ **Progress Feedback** - See what's being updated

## Important: Variables Must Exist First

⚠️ **This plugin binds existing Figma variables to components. Variables must already exist in your Figma file collections.**

If you need to create variables first, use the `figma-plugin-semantic-colors` plugin or create them manually in Figma.

## Setup

### 1. Generate Mapping Files

First, generate mapping files for all your components:

```bash
# Generate mappings for all components
python3 scripts/batch-generate-mappings.py
```

This creates mapping files in `figma-mappings/` directory.

### 2. Build the Plugin

```bash
cd figma-plugin-apply-tokens
npm install
npm run build
```

### 3. Load Plugin in Figma

1. Open **Figma Desktop App** (plugin won't work in browser)
2. Go to **Plugins** → **Development** → **Import plugin from manifest...**
3. Navigate to `figma-plugin-apply-tokens` folder
4. Select `manifest.json`
5. Plugin will appear in your plugins list

## Usage

### Step 1: Load Mapping Files

1. Open the plugin: **Plugins** → **Development** → **Apply Component Tokens**
2. Click **"Choose File"** and select your mapping files
   - You can select individual files or the entire `figma-mappings/` folder
   - Plugin will load all `*-mapping.json` files

### Step 2: Configure Options

Choose what to update:
- ✅ **Update Colors** - Background, border, text, icon colors
- ✅ **Update Dimensions** - Padding, margin, border radius
- ✅ **Update Typography** - Font size, weight
- ✅ **Update Shadows** - Box shadows
- ✅ **Update nested components** - Recursively update children

### Step 3: Apply Tokens

**Option A: Apply to Selection**
- Select components/frames in Figma
- Click **"Apply Tokens to Selection"**
- Only selected nodes will be updated

**Option B: Apply to All**
- Click **"Apply Tokens to All Components"**
- Plugin scans entire page and updates all matching components

### Step 4: Verify

Check that tokens were applied correctly:
- Colors should match token values
- Dimensions should match token values
- Typography should match token values

## How It Works

1. **Load Mappings** - Plugin reads all mapping JSON files
2. **Find Variables** - Searches for Figma variables matching token references (e.g., `{color.background.neutral.base}`)
3. **Scan Components** - Finds components matching mapping patterns
4. **Match States** - Identifies selected/default states from node names
5. **Bind Variables** - Uses `setBoundVariable` API to bind variables to component properties
6. **Report Results** - Shows how many nodes were updated

### Variable Matching

The plugin searches for variables using multiple patterns:
- Exact match: `color.background.neutral.base`
- With slashes: `color/background/neutral/base`
- With dashes: `color-background-neutral-base`
- Case-insensitive matching
- Partial matching (last 2-3 parts of path)

## Token Application Logic

The plugin binds Figma variables to component properties:

### Colors
- **Background** → Binds COLOR variable to `fills` property using `setBoundVariable('fills', variable)`
- **Border** → Binds COLOR variable to `strokes` property using `setBoundVariable('strokes', variable)`
- **Text** → Binds COLOR variable to `fills` property on text nodes
- **Icon** → Binds COLOR variable to `fills` property on icon/vector nodes

### Dimensions
- **Border Radius** → Binds FLOAT variable to `cornerRadius` property using `setBoundVariable('cornerRadius', variable)`
- **Padding** → Binds FLOAT variables to `paddingLeft/Right/Top/Bottom` (for auto-layout frames)
  - Uses VariableAlias for padding properties (may not support setBoundVariable)

### Typography
- **Font Size** → `fontSize` property
- **Font Weight** → Requires font to be loaded

### Shadows
- **Box Shadows** → `effects` array (complex, may need custom handling)

## Troubleshooting

### Plugin doesn't appear
- Make sure you've built the plugin (`npm run build`)
- Use Figma Desktop App (not browser)
- Try restarting Figma

### No components updated
- Check that mapping files are loaded (should show count)
- Verify component names match mapping patterns
- Try "Scan for Components" to see what's found

### Variables not found
- **Most common issue**: Variables don't exist in Figma collections
- Verify variables exist: Open Variables panel in Figma and check collections
- Check variable names match token references (e.g., `color.background.neutral.base` or `color/background/neutral/base`)
- Use "Scan for Components" to see what components are found
- Check plugin console for variable search patterns

### Colors not updating
- Verify COLOR variables exist in Figma collections
- Check that variable names match token references in mapping files
- Verify node type supports `fills` property (FRAME, COMPONENT, TEXT, VECTOR)
- Check console for variable binding errors

### Dimensions not updating
- Verify FLOAT variables exist in Figma collections
- Verify node is a FRAME or COMPONENT with auto-layout enabled (for padding)
- Check that variable names match token references
- Padding properties may use VariableAlias directly (not setBoundVariable)

## File Structure

```
figma-plugin-apply-tokens/
├── manifest.json      # Plugin configuration
├── code.ts           # Plugin logic (TypeScript)
├── code.js           # Compiled JavaScript (generated)
├── ui.html           # Plugin UI
├── package.json      # Dependencies
└── README.md         # This file
```

## Development

### Build
```bash
npm run build
```

### Watch Mode
```bash
npm run watch
```

### TypeScript Config
Uses standard Figma plugin TypeScript configuration.

## Limitations

- **Shadows**: Complex shadow objects may need manual handling
- **Font Weight**: Requires fonts to be loaded in Figma
- **Nested References**: Very deep token references may not resolve
- **Custom Properties**: Non-standard Figma properties not supported

## Next Steps

1. Generate mappings: `python3 scripts/batch-generate-mappings.py`
2. Load plugin in Figma
3. Load mapping files
4. Apply tokens to all components
5. Regenerate mappings when tokens change

