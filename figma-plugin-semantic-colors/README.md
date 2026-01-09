# Semantic Colors Figma Plugin

This plugin creates a **single Figma Variable collection with Light and Dark modes** from your Semantic Colors JSON files. This solves the issue where Tokens Studio Free tier exports create 2 separate collections instead of 1 collection with 2 modes.

## Problem Solved

When exporting from Tokens Studio Free tier, the folder structure (`Semantic-Colors/Light.json` and `Dark.json`) creates **2 separate collections** in Figma Variables. This plugin creates **1 collection with 2 modes** instead.

## Setup

1. **Install dependencies:**
   ```bash
   cd figma-plugin-semantic-colors
   npm install
   ```

2. **Build the plugin:**
   ```bash
   npm run build
   ```

3. **Load the plugin in Figma:**
   - Open **Figma Desktop App** (plugin won't work in browser)
   - Go to **Plugins** → **Development** → **Import plugin from manifest...**
   - Navigate to `figma-plugin-semantic-colors` folder
   - Select the `manifest.json` file
   - The plugin will appear in your plugins list

## Usage

1. **Open the plugin:**
   - In Figma, go to **Plugins** → **Development** → **Semantic Colors Variable Creator**
   - The plugin UI will open

2. **Load your JSON files:**
   - Click "Choose File" for **Light Theme JSON** → Select `tokens/Semantics/Semantic-Colors/Light.json`
   - Click "Choose File" for **Dark Theme JSON** → Select `tokens/Semantics/Semantic-Colors/Dark.json`
   - (Optional) Click "Choose File" for **Primitive.json** → Select `tokens/Primitive.json` for better token reference resolution

3. **Create Variables:**
   - Click the **"Create Variables"** button
   - Wait for the process to complete (you'll see a success message)

4. **Result:**
   - A single Variable collection named **"Semantic-Colors"** will be created
   - It will have **Light** and **Dark** modes
   - All color tokens will be available as variables with mode-specific values
   - You can switch between modes in Figma's Variables panel

## How It Works

1. Reads both Light and Dark JSON files
2. Flattens the nested token structure into paths (e.g., `color.background.neutral.base`)
3. Creates or finds the "Semantic-Colors" collection
4. Creates Light and Dark modes (if they don't exist)
5. Creates Figma Variables for each color token path
6. Sets Light mode values from `Light.json`
7. Sets Dark mode values from `Dark.json`
8. Resolves token references (like `{color.neutral.gray.0}`) if Primitive.json is provided

## Features

- ✅ Creates single collection with 2 modes (not 2 separate collections)
- ✅ Handles token reference resolution
- ✅ Skips non-color tokens (boxShadow, etc.)
- ✅ Won't create duplicates (checks for existing variables)
- ✅ Works with Tokens Studio Free tier

## File Structure

```
figma-plugin-semantic-colors/
├── manifest.json          # Plugin configuration
├── code.ts               # Plugin logic (TypeScript)
├── code.js               # Compiled JavaScript (generated)
├── ui.html               # Plugin UI
├── package.json          # Dependencies
├── tsconfig.json         # TypeScript config
└── README.md            # This file
```

## Troubleshooting

- **Plugin doesn't appear:** 
  - Make sure you've built the plugin (`npm run build`)
  - Make sure you're using Figma Desktop App (not browser)
  - Try restarting Figma

- **Variables not created:** 
  - Check that your JSON files are valid JSON
  - Make sure files contain color tokens (type: "color")
  - Check the status message in the plugin UI

- **Colors look wrong:** 
  - Load Primitive.json for better token reference resolution
  - Some complex nested references might need manual adjustment
  - Check that token values are valid hex colors or rgba() format

- **"Collection already exists" warning:** 
  - This is normal - the plugin will use the existing collection
  - Existing variables won't be overwritten

## Alternative: Preprocessing Script

If you want to resolve all token references before using the plugin, run:

```bash
node preprocess-tokens.js
```

This creates resolved JSON files in the `resolved/` folder that have all references already resolved to actual color values.

