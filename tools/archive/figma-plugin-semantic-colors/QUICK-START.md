# Quick Start Guide

## Step 1: Build the Plugin
```bash
cd figma-plugin-semantic-colors
npm install
npm run build
```

## Step 2: Load Plugin in Figma
1. Open **Figma Desktop App** (required - won't work in browser)
2. Go to **Plugins** → **Development** → **Import plugin from manifest...**
3. Select `figma-plugin-semantic-colors/manifest.json`
4. Plugin is now installed!

## Step 3: Run the Plugin
1. In Figma, go to **Plugins** → **Development** → **Semantic Colors Variable Creator**
2. Load files:
   - **Light Theme:** `tokens/Semantics/Semantic-Colors/Light.json`
   - **Dark Theme:** `tokens/Semantics/Semantic-Colors/Dark.json`
   - **Primitive (optional):** `tokens/Primitive.json` (for better reference resolution)
3. Click **"Create Variables"**
4. Done! You now have a single "Semantic-Colors" collection with Light and Dark modes.

## What You Get
- ✅ Single Variable collection: "Semantic-Colors"
- ✅ Two modes: Light and Dark
- ✅ All color tokens as variables
- ✅ Mode-specific values automatically set

## Troubleshooting
- **Plugin not showing?** Make sure you built it (`npm run build`) and are using Figma Desktop App
- **Colors not resolving?** Load Primitive.json for better token reference resolution
- **Variables not created?** Check that your JSON files are valid and contain color tokens

