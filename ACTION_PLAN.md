# Action Plan: Custom Figma Plugin Setup

Complete step-by-step action plan to get your custom Figma plugin working.

## ✅ What's Ready

1. ✅ **Batch Mapping Generator** - Processes all components automatically
2. ✅ **Figma Plugin** - Complete plugin code ready to build
3. ✅ **Documentation** - Complete guides and setup instructions
4. ✅ **Quick Start Script** - Automated setup script

## 🚀 Quick Start (Fastest Path)

### Option 1: Automated Script (Recommended)

```bash
# Run the quick start script
./scripts/quick-start.sh
```

This will:
1. Generate all mapping files
2. Install plugin dependencies
3. Build the plugin
4. Show next steps

### Option 2: Manual Steps

```bash
# Step 1: Generate mappings
python3 scripts/batch-generate-mappings.py

# Step 2: Build plugin
cd figma-plugin-apply-tokens
npm install
npm run build
cd ..
```

## 📋 Detailed Action Steps

### Phase 1: Generate Mappings (5 minutes)

**Goal:** Create mapping files for all components

```bash
# Generate all mappings
python3 scripts/batch-generate-mappings.py
```

**Verify:**
- Check `figma-mappings/` directory exists
- Check `figma-mappings/index.json` was created
- Check `figma-mappings/mobile/` and `figma-mappings/web/` have files

**Expected Output:**
```
📱 Found 15 mobile component files
🌐 Found 35 web component files
🚀 Processing 50 component files...
...
✅ Successful: 50/50
📑 Generated index file: figma-mappings/index.json
```

**If errors occur:**
- Check that token files are valid JSON
- Verify file paths are correct
- Check Python version (need 3.x)

### Phase 2: Build Plugin (5 minutes)

**Goal:** Compile plugin code for Figma

```bash
cd figma-plugin-apply-tokens
npm install
npm run build
```

**Verify:**
- Check `code.js` file exists (compiled from `code.ts`)
- Check no build errors in console

**If errors occur:**
- Check Node.js version (need 14+)
- Check npm is installed
- Try deleting `node_modules/` and reinstalling

### Phase 3: Load Plugin in Figma (2 minutes)

**Goal:** Make plugin available in Figma

1. **Open Figma Desktop App** (⚠️ Must be desktop, not browser)

2. **Open your Figma file** with components

3. **Go to:** Plugins → Development → Import plugin from manifest...

4. **Navigate to:** `figma-plugin-apply-tokens/` folder

5. **Select:** `manifest.json` file

6. **Verify:** Plugin appears in Plugins → Development → Apply Component Tokens

**If plugin doesn't appear:**
- Make sure you're using Figma Desktop App
- Check that `manifest.json` exists
- Try restarting Figma
- Check that `code.js` was built successfully

### Phase 4: Use Plugin (5 minutes)

**Goal:** Apply tokens to components

1. **Open Plugin:**
   - Plugins → Development → Apply Component Tokens

2. **Load Mappings:**
   - Click file input
   - Select `figma-mappings/` folder
   - Verify: Status shows "Loaded X mapping file(s)"

3. **Configure Options:**
   - ✅ Update Colors
   - ✅ Update Dimensions
   - ✅ Update Typography
   - ✅ Update Shadows
   - ✅ Update nested components

4. **Apply Tokens:**
   - **Test:** Select one component → "Apply Tokens to Selection"
   - **Full:** Click "Apply Tokens to All Components"

5. **Verify:**
   - Check colors match tokens
   - Check dimensions match tokens
   - Check typography matches tokens

## 🔄 Regular Workflow

### When Tokens Change

```bash
# 1. Regenerate mappings
python3 scripts/batch-generate-mappings.py

# 2. In Figma:
#    - Open plugin
#    - Reload mappings (if needed)
#    - Apply to all components
```

### Daily Use

1. Open Figma file
2. Open plugin
3. Load mappings (if not already loaded)
4. Click "Apply Tokens to All Components"
5. ✅ Done!

## 📁 File Structure

```
HighRise-Tokens/
├── scripts/
│   ├── batch-generate-mappings.py     ✅ Ready
│   ├── tokens-to-figma-mapper.py      ✅ Ready
│   └── quick-start.sh                 ✅ Ready
│
├── figma-plugin-apply-tokens/
│   ├── manifest.json                  ✅ Ready
│   ├── code.ts                       ✅ Ready
│   ├── ui.html                       ✅ Ready
│   ├── package.json                  ✅ Ready
│   ├── tsconfig.json                 ✅ Ready
│   ├── SETUP_GUIDE.md                ✅ Ready
│   └── README.md                     ✅ Ready
│
└── figma-mappings/                    ⏳ Generated when you run script
    ├── index.json
    ├── mobile/
    └── web/
```

## 🎯 Success Criteria

You'll know it's working when:

1. ✅ Mappings generated successfully (50+ files)
2. ✅ Plugin builds without errors
3. ✅ Plugin appears in Figma
4. ✅ Mappings load in plugin UI
5. ✅ Components update when tokens applied
6. ✅ Colors, dimensions, typography all update correctly

## 🐛 Troubleshooting

### Issue: Mappings not generating

**Check:**
- Token files are valid JSON
- File paths are correct
- Python 3.x is installed

**Solution:**
```bash
# Test with one component first
python3 scripts/tokens-to-figma-mapper.py \
    --component tokens/mobile-components/button.json
```

### Issue: Plugin won't build

**Check:**
- Node.js 14+ installed
- npm is working
- TypeScript compiles

**Solution:**
```bash
cd figma-plugin-apply-tokens
rm -rf node_modules
npm install
npm run build
```

### Issue: Plugin doesn't appear in Figma

**Check:**
- Using Figma Desktop App (not browser)
- `manifest.json` exists
- `code.js` was built

**Solution:**
- Restart Figma
- Rebuild plugin
- Check console for errors

### Issue: Components not updating

**Check:**
- Mappings loaded in plugin
- Component names match patterns
- Node types are correct

**Solution:**
- Use "Scan for Components" first
- Check mapping file structure
- Verify token values are correct

## 📚 Documentation Reference

- **Quick Setup:** `figma-plugin-apply-tokens/SETUP_GUIDE.md`
- **Detailed Answers:** `scripts/ANSWERS.md`
- **How It Works:** `scripts/HOW_IT_WORKS.md`
- **Plugin Docs:** `figma-plugin-apply-tokens/README.md`

## ✅ Next Actions

1. **Run quick start:**
   ```bash
   ./scripts/quick-start.sh
   ```

2. **Load plugin in Figma** (follow Phase 3 above)

3. **Test with one component** (follow Phase 4 above)

4. **Apply to all components** (use "Apply Tokens to All Components")

5. **Set up regular workflow** (regenerate mappings when tokens change)

---

**You're ready to go! Start with the quick start script and you'll be applying tokens automatically in minutes.** 🚀

