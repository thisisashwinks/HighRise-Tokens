# Complete Setup Guide: Apply Component Tokens Plugin

Step-by-step guide to set up and use the custom Figma plugin for automatically applying design tokens.

## Prerequisites

- ✅ Python 3.x installed
- ✅ Node.js and npm installed
- ✅ Figma Desktop App (required - browser won't work)
- ✅ Your component token files ready

## Step 1: Generate Mapping Files

Generate mapping files for all your components:

```bash
# From project root directory
python3 scripts/batch-generate-mappings.py
```

**What this does:**
- Scans all component token files (mobile + web)
- Generates mapping files for each component
- Creates `figma-mappings/` directory structure
- Generates `index.json` with all mappings

**Expected output:**
```
📱 Found 15 mobile component files
🌐 Found 35 web component files
🚀 Processing 50 component files...
...
✅ Successful: 50/50
```

**Output location:**
```
figma-mappings/
├── index.json
├── mobile/
│   ├── button-mapping.json
│   ├── input-mapping.json
│   └── ... (all mobile components)
└── web/
    ├── button-mapping.json
    ├── input-mapping.json
    └── ... (all web components)
```

## Step 2: Build the Plugin

```bash
# Navigate to plugin directory
cd figma-plugin-apply-tokens

# Install dependencies
npm install

# Build the plugin
npm run build
```

**What this does:**
- Installs TypeScript and Figma plugin types
- Compiles `code.ts` → `code.js`
- Prepares plugin for loading in Figma

**Expected output:**
```
> figma-plugin-apply-tokens@1.0.0 build
> tsc

✅ Build successful
```

## Step 3: Load Plugin in Figma

1. **Open Figma Desktop App** (⚠️ Must be desktop app, not browser)

2. **Open your Figma file** with components

3. **Go to:** Plugins → Development → Import plugin from manifest...

4. **Navigate to:** `figma-plugin-apply-tokens/` folder

5. **Select:** `manifest.json` file

6. **Plugin appears** in: Plugins → Development → Apply Component Tokens

## Step 4: Use the Plugin

### 4.1 Open the Plugin

1. In Figma, go to: **Plugins** → **Development** → **Apply Component Tokens**
2. Plugin UI window opens

### 4.2 Load Mapping Files

**Option A: Load Folder (Recommended)**
1. Click the file input
2. Navigate to `figma-mappings/` folder
3. Select the entire folder
4. Plugin loads all `*-mapping.json` files

**Option B: Load Individual Files**
1. Click the file input
2. Select specific mapping files
3. Can select multiple files at once

**Verify:**
- Status should show: "Loaded X mapping file(s)"
- Log shows each loaded component

### 4.3 Configure Options

Check what you want to update:
- ✅ **Update Colors** - Background, border, text, icon colors
- ✅ **Update Dimensions** - Padding, margin, border radius, sizes
- ✅ **Update Typography** - Font size, weight, line height
- ✅ **Update Shadows** - Box shadows and effects
- ✅ **Update nested components** - Recursively update children

### 4.4 Apply Tokens

**Option A: Apply to Selection**
1. Select components/frames in Figma
2. Click **"Apply Tokens to Selection"**
3. Only selected nodes are updated
4. Status shows: "Updated X node(s)"

**Option B: Apply to All (Recommended)**
1. Click **"Apply Tokens to All Components"**
2. Plugin scans entire page
3. Updates all matching components
4. Status shows: "Updated X node(s)"

**Option C: Scan First**
1. Click **"Scan for Components"**
2. See what components are detected
3. Then apply tokens

## Step 5: Verify Results

Check that tokens were applied:

1. **Colors** - Check background, border, text colors match tokens
2. **Dimensions** - Check padding, border radius match tokens
3. **Typography** - Check font sizes match tokens
4. **Shadows** - Check shadows match tokens

## Troubleshooting

### Plugin doesn't appear

**Check:**
- ✅ Built plugin: `npm run build`
- ✅ Using Figma Desktop App (not browser)
- ✅ Selected correct `manifest.json` file
- ✅ Restart Figma if needed

**Solution:**
```bash
cd figma-plugin-apply-tokens
npm run build
# Then reload plugin in Figma
```

### Mapping files not loading

**Check:**
- ✅ Files are in `figma-mappings/` directory
- ✅ File names end with `-mapping.json`
- ✅ Files are valid JSON

**Solution:**
- Try selecting individual files instead of folder
- Check browser console for errors
- Verify file paths are correct

### Components not updating

**Check:**
- ✅ Mapping files loaded (status shows count)
- ✅ Component names match patterns
- ✅ Node types are FRAME, COMPONENT, or INSTANCE

**Solution:**
1. Use "Scan for Components" to see what's detected
2. Check component names match mapping patterns
3. Verify node types support the properties being updated

### Colors not applying

**Check:**
- ✅ Color tokens have valid hex values (#ffffff)
- ✅ Node supports `fills` property
- ✅ "Update Colors" option is checked

**Solution:**
- Check console for errors
- Verify color values in mapping files
- Try updating one component manually first

### Dimensions not applying

**Check:**
- ✅ Node is FRAME or COMPONENT
- ✅ Auto-layout enabled for padding
- ✅ Pixel values in correct format

**Solution:**
- Enable auto-layout on frames
- Check dimension values in mapping files
- Verify node types

## Regular Workflow

### When Tokens Change

1. **Regenerate mappings:**
   ```bash
   python3 scripts/batch-generate-mappings.py
   ```

2. **In Figma:**
   - Open plugin
   - Reload mapping files (if needed)
   - Apply tokens to all components

### Daily Use

1. Open Figma file
2. Open plugin
3. Load mappings (if not already loaded)
4. Click "Apply Tokens to All Components"
5. ✅ Done!

## Advanced Usage

### Custom Node Matching

Edit mapping files to customize patterns:

```json
{
  "node_matching": {
    "selected": {
      "patterns": ["State=Selected", "Selected", "Active", "Checked"]
    }
  }
}
```

### Selective Updates

Uncheck options to update only specific token types:
- Uncheck "Update Colors" → Skip color updates
- Uncheck "Update Dimensions" → Skip size updates
- etc.

### Batch Processing

For large files:
1. Test with "Apply to Selection" first
2. Then use "Apply to All" for full update

## File Structure Reference

```
HighRise-Tokens/
├── scripts/
│   ├── batch-generate-mappings.py    # Generate all mappings
│   └── tokens-to-figma-mapper.py     # Single component mapper
│
├── figma-plugin-apply-tokens/
│   ├── manifest.json                  # Plugin config
│   ├── code.ts                       # Plugin logic
│   ├── code.js                       # Compiled (generated)
│   ├── ui.html                       # Plugin UI
│   ├── package.json                  # Dependencies
│   └── SETUP_GUIDE.md               # This file
│
└── figma-mappings/                   # Generated mappings
    ├── index.json
    ├── mobile/
    └── web/
```

## Next Steps

1. ✅ Generate mappings
2. ✅ Build plugin
3. ✅ Load in Figma
4. ✅ Test with one component
5. ✅ Apply to all components
6. ✅ Set up regular workflow

## Support

For issues:
- Check `scripts/ANSWERS.md` for detailed answers
- Check `figma-plugin-apply-tokens/README.md` for plugin docs
- Review console logs for errors
- Verify mapping files are valid JSON

---

**You're all set! The plugin is ready to automatically apply tokens to all your components.** 🎉

