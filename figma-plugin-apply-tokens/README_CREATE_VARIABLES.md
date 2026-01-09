# Create Component Variables - Plugin Guide

## What This Plugin Does

When you upload a component token file (e.g., `button.json`) and click "Create Variables", the plugin will:

1. **Create a Collection**: Creates a collection named after the component (e.g., "Button" for `button.json`)
2. **Create Variables**: Creates Figma variables for each token in the JSON file
3. **Skip Typography/Shadows**: Automatically skips typography and shadow tokens (can't create variables for these in Figma)
4. **Alias to Foundation Variables**: Each variable is aliased to the corresponding Foundation variable from "HighRise 1.2 Foundations" file

## How It Works

### Step 1: Upload Component Token File
- Click "Choose File" in the plugin UI
- Select your component token file (e.g., `tokens/mobile-components/button.json`)

### Step 2: Click "Create Variables"
- The plugin will:
  1. Extract all tokens from the JSON file
  2. Filter out typography and shadow tokens
  3. Create a collection named after the component
  4. For each token:
     - Create a variable in the collection
     - Find the matching Foundation variable from "HighRise 1.2 Foundations"
     - Alias the component variable to the Foundation variable

### Step 3: Verify Results
- Check the console logs for:
  - How many variables were created
  - Which Foundation variables were found/aliased
  - Any variables that couldn't be aliased (will have placeholder values)

## Variable Naming

Component variables are named using this pattern:
```
{component-name} / {category} / {state} / {property}
```

Examples:
- `button / color / default / background`
- `button / color / hover / text`
- `button / padding / horizontal`
- `button / border / radius`

## Foundation Variable Lookup

The plugin searches for Foundation variables in this order:

1. **Foundation Collections First**: Prioritizes variables from collections containing "Foundation", "HighRise", "Semantic", or "Primitive" in the name
2. **Multiple Patterns**: Tries various naming patterns:
   - `color.background.primary.default`
   - `color/background/primary/default`
   - `color-background-primary-default`
   - Case-insensitive matching
   - Partial matching (last segments)
   - Fuzzy matching (all keywords)

## What Gets Created

### ✅ Created
- Color variables (background, text, icon, border)
- Dimension variables (padding, border radius, gap, width, height)
- All variables are aliased to Foundation variables when found

### ⏭️ Skipped
- Typography tokens (use Figma Text Styles instead)
- Shadow tokens (use Figma Effect Styles instead)

### ⚠️ Placeholder Variables
If a Foundation variable isn't found:
- Color variables: Created with light gray placeholder (r: 0.9, g: 0.9, b: 0.9)
- Dimension variables: Created with 0 placeholder
- You can manually alias these later in Figma

## Console Output

The plugin logs detailed information:
- `✓ Found Foundation variable`: Successfully found and aliased
- `✗ Foundation variable not found`: Will create placeholder (first 5 failures logged)
- `✅ Created variable`: Variable created successfully
- `✅ Updated variable`: Variable updated (if it already existed)

## Requirements

- **HighRise 1.2 Foundations file must be open** in Figma (or published as a library)
- Foundation variables must exist in Figma Variables panel
- Component token file must be valid JSON

## Example Workflow

1. Open Figma file with "HighRise 1.2 Foundations" file/library available
2. Open plugin: Plugins → Development → Apply Component Tokens
3. Load `tokens/mobile-components/button.json`
4. Click "Create Variables"
5. Wait for completion (check console for progress)
6. Verify: Collection "Button" created with variables aliased to Foundation variables

---

**Last Updated**: December 22, 2024
**Status**: ✅ Ready for testing

