# Quick Start: Tokens to Figma Mapping

## One-Command Setup

Generate a mapping file for any component:

```bash
python3 scripts/tokens-to-figma-mapper.py \
    --component tokens/mobile-components/content-switcher-item.json
```

## What You Get

The script generates a mapping file at:
```
figma-mappings/content-switcher-item-mapping.json
```

This file contains:
- ✅ All resolved token values (hex codes, pixel values, etc.)
- ✅ Figma property mappings (fills, strokes, cornerRadius, etc.)
- ✅ Application instructions for each state
- ✅ Node matching patterns

## How to Use

### Option 1: Review the Mapping File

```bash
cat figma-mappings/content-switcher-item-mapping.json
```

Use it as a reference to manually apply tokens in Figma.

### Option 2: Use with Figma Plugin

1. Install a design tokens plugin in Figma
2. Load the mapping file
3. Select your frames/components
4. Apply tokens automatically

### Option 3: Build Custom Plugin

Use the mapping file structure to create a Figma plugin that reads and applies tokens.

## Example Output

```json
{
  "tokens": {
    "content-switcher-item.color.selected.background": {
      "value": "#ffffff",
      "type": "color",
      "figma_property": {
        "property": "fills",
        "target": "container"
      }
    }
  },
  "instructions": {
    "selected": {
      "container": {
        "background": "{color.background.neutral.base}",
        "borderRadius": "{border.radius.sm}"
      }
    }
  }
}
```

## Full Documentation

- **Detailed Guide**: `scripts/TOKENS_TO_FIGMA_GUIDE.md`
- **How It Works**: `scripts/HOW_IT_WORKS.md`

