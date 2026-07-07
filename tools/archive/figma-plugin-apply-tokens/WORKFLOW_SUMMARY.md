# Figma Plugin Token Application Workflow - Summary

## Current Status

The plugin is failing to create component variables because **Foundation variables don't exist in Figma yet**. Component tokens reference Foundation variables (from `Semantic.json` and `Primitive.json`), but those need to be created first.

## The Problem

When trying to create variables for the `button` component:
- ✅ Plugin successfully extracts 536 tokens from component token file
- ❌ All 536 tokens fail because Foundation variables don't exist
- Error: `Foundation variable not found for: "color.background.primary.default"`

## The Solution: Two-Step Process

### Step 1: Create Foundation Variables (REQUIRED FIRST)

**Use the `figma-plugin-semantic-colors` plugin:**

1. Build the semantic-colors plugin:
   ```bash
   cd figma-plugin-semantic-colors
   npm install
   npm run build
   ```

2. Load plugin in Figma:
   - Plugins → Development → Import plugin from manifest...
   - Select `figma-plugin-semantic-colors/manifest.json`

3. Create Foundation variables:
   - Open plugin: Plugins → Development → Semantic Colors Variable Creator
   - Load `tokens/Semantics/Semantic-Colors/Light.json`
   - Load `tokens/Semantics/Semantic-Colors/Dark.json`
   - (Optional) Load `tokens/Primitive.json` for better reference resolution
   - Click "Create Variables"
   - This creates the "Semantic-Colors" collection with Light/Dark modes

### Step 2: Create Component Variables

**Use the `figma-plugin-apply-tokens` plugin:**

1. Build the apply-tokens plugin:
   ```bash
   cd figma-plugin-apply-tokens
   npm install
   npm run build
   ```

2. Load plugin in Figma:
   - Plugins → Development → Import plugin from manifest...
   - Select `figma-plugin-apply-tokens/manifest.json`

3. Create component variables:
   - Open plugin: Plugins → Development → Apply Component Tokens
   - Load component token file (e.g., `tokens/mobile-components/button.json`)
   - Click "Create Variables"
   - Plugin will:
     - Create component-specific variables
     - Alias them to Foundation variables (when found)
     - Use fallback values from descriptions (when Foundation vars don't exist)

## Current Plugin Behavior

The `apply-tokens` plugin has fallback logic (lines 604-655 in `code.ts`):
- ✅ If Foundation variable found → Creates component variable aliased to Foundation variable
- ✅ If Foundation variable NOT found → Creates placeholder variable with:
  - Color: Light gray placeholder (r: 0.9, g: 0.9, b: 0.9) - can be manually aliased later
  - Dimension: 0 placeholder - can be manually aliased later
  - Tries to extract value from description if available
- ✅ Improved error handling and logging for debugging

## Recent Improvements (Dec 22, 2024)

1. ✅ **Better Fallback Logic**: Plugin now creates placeholder variables even when Foundation variables don't exist
2. ✅ **Improved Error Handling**: Better try-catch blocks with detailed error messages
3. ✅ **Better Logging**: More detailed console logs to diagnose issues
4. ✅ **Placeholder Variables**: Creates variables with placeholder values that can be manually aliased to Foundation variables later

## Next Steps

1. ✅ **Create Foundation Variables First** (REQUIRED):
   - Use `figma-plugin-semantic-colors` plugin
   - Load `Semantic-Colors/Light.json` and `Dark.json`
   - Create Foundation variables
   
2. ✅ **Then Create Component Variables**:
   - Use `figma-plugin-apply-tokens` plugin
   - Load component token file (e.g., `button.json`)
   - Create component variables (will alias to Foundation variables automatically)
   
3. 🧪 **Test End-to-End**:
   - Test with button component
   - Verify variables are created and aliased correctly
   - Verify components can be updated with tokens

## Files Involved

- `figma-plugin-semantic-colors/` - Creates Foundation variables from Semantic.json/Primitive.json
- `figma-plugin-apply-tokens/` - Creates component variables that alias to Foundation variables
- `tokens/Semantics/Semantic.json` - Foundation semantic tokens
- `tokens/Primitive.json` - Foundation primitive tokens
- `tokens/mobile-components/button.json` - Component tokens (example)

## Workflow Diagram

```
1. Semantic.json + Primitive.json
   ↓ (figma-plugin-semantic-colors)
2. Foundation Variables in Figma
   ↓ (figma-plugin-apply-tokens)
3. Component Variables (aliased to Foundation)
   ↓
4. Apply to Figma Components
```

---

**Last Updated**: December 22, 2024
**Status**: Foundation variables need to be created first before component variables can be created

