# Figma Plugin Setup Guide

Complete guide for setting up the "Apply Component Tokens" Figma plugin.

## Quick Start

```bash
# 1. Generate all mapping files
python3 scripts/batch-generate-mappings.py

# 2. Build the plugin
cd figma-plugin-apply-tokens
npm install
npm run build

# 3. Load plugin in Figma Desktop App
# Plugins → Development → Import plugin from manifest...
# Select: figma-plugin-apply-tokens/manifest.json
```

## Detailed Setup

### Step 1: Generate Mapping Files

Generate mapping files for all components:

```bash
# All components
python3 scripts/batch-generate-mappings.py

# Only mobile components
python3 scripts/batch-generate-mappings.py --mobile-only

# Only web components
python3 scripts/batch-generate-mappings.py --web-only
```

**Output:** Mapping files in `figma-mappings/` directory

### Step 2: Install Plugin Dependencies

```bash
cd figma-plugin-apply-tokens
npm install
```

### Step 3: Build the Plugin

```bash
npm run build
```

This compiles TypeScript to JavaScript (`code.ts` → `code.js`).

### Step 4: Load Plugin in Figma

1. **Open Figma Desktop App** (required - browser won't work)
2. **Open your Figma file** with components
3. **Go to:** Plugins → Development → Import plugin from manifest...
4. **Navigate to:** `figma-plugin-apply-tokens/` folder
5. **Select:** `manifest.json` file
6. **Plugin appears** in: Plugins → Development → Apply Component Tokens

### Step 5: Use the Plugin

1. **Open Plugin:** Plugins → Development → Apply Component Tokens
2. **Load Mappings:** Click "Choose File" → Select `figma-mappings/` folder
3. **Configure Options:** Check what you want to update
4. **Apply Tokens:**
   - **To Selection:** Select components → Click "Apply Tokens to Selection"
   - **To All:** Click "Apply Tokens to All Components"

## Workflow

### Initial Setup (One-Time)

1. Generate mappings: `python3 scripts/batch-generate-mappings.py`
2. Build plugin: `cd figma-plugin-apply-tokens && npm install && npm run build`
3. Load plugin in Figma

### Regular Use

1. **When tokens change:**
   ```bash
   python3 scripts/batch-generate-mappings.py
   ```

2. **In Figma:**
   - Open plugin
   - Reload mapping files (if needed)
   - Apply tokens to all components

## Troubleshooting

### Plugin doesn't appear

**Solution:**
- Make sure you've run `npm run build`
- Use Figma Desktop App (not browser)
- Restart Figma
- Check that `manifest.json` exists

### Mapping files not loading

**Solution:**
- Verify files are in `figma-mappings/` directory
- Check file names end with `-mapping.json`
- Try selecting individual files instead of folder

### Components not updating

**Solution:**
- Use "Scan for Components" to see what's detected
- Check component names match mapping patterns
- Verify node types (FRAME, COMPONENT, INSTANCE)
- Check console for errors

### Colors not applying

**Solution:**
- Verify color tokens have hex values (#ffffff)
- Check node supports `fills` property
- Try updating one component manually first

## Advanced Usage

### Custom Node Matching

Edit mapping files to customize node matching patterns:

```json
{
  "node_matching": {
    "selected": {
      "patterns": ["State=Selected", "Selected", "Active"],
      "data_attribute": "data-name"
    }
  }
}
```

### Selective Updates

Use the plugin options to update only specific token types:
- Uncheck "Update Colors" to skip color updates
- Uncheck "Update Dimensions" to skip size updates
- etc.

### Batch Processing

For large files, apply to selection first to test, then apply to all.

## Integration with CI/CD

You can automate mapping generation:

```bash
# In your CI/CD pipeline
python3 scripts/batch-generate-mappings.py
# Commit updated mappings
git add figma-mappings/
git commit -m "Update token mappings"
```

Then designers just reload mappings in Figma plugin.

## Next Steps

1. ✅ Generate mappings
2. ✅ Build plugin
3. ✅ Load in Figma
4. ✅ Test with one component
5. ✅ Apply to all components
6. ✅ Set up automation

