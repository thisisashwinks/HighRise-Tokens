# Tokens to Figma Mapping Guide

## Overview

This guide explains how the `tokens-to-figma-mapper.py` script works and how to use it to automatically apply design tokens to Figma designs.

## How It Works

### 1. **Input: Component Token JSON File**

The script reads your component token JSON file (e.g., `content-switcher-item.json`) which contains:
- Token references like `{color.background.neutral.base}`
- Token types (color, dimension, typography, etc.)
- Descriptions with actual values (e.g., "#ffffff", "16px")

**Example token structure:**
```json
{
  "content-switcher-item": {
    "color": {
      "selected": {
        "background": {
          "value": "{color.background.neutral.base}",
          "type": "color",
          "description": "Mobile content switcher item selected background - gray/0 - #ffffff"
        }
      }
    }
  }
}
```

### 2. **Processing: Token Resolution**

The script processes tokens through these steps:

#### Step 1: Extract Values from Descriptions
- **For colors**: Extracts hex codes from descriptions (e.g., "#ffffff" from "gray/0 - #ffffff")
- **For dimensions**: Extracts pixel values (e.g., "16px" from "horizontal padding - 16px")
- **For typography**: Extracts font size and weight (e.g., "14px semibold")

#### Step 2: Resolve Token References (Optional)
If description extraction fails, the script attempts to resolve references:
- Checks `Semantic.json` for semantic token definitions
- Checks `Primitive.json` for primitive token definitions
- Follows nested references recursively

#### Step 3: Map to Figma Properties
Each token is mapped to Figma API properties:
- `color.background` → `fills` property
- `color.border` → `strokes` property
- `border.radius` → `cornerRadius` property
- `padding.horizontal` → `paddingLeft` and `paddingRight`
- `typography` → `fontName`, `fontSize`, `fontWeight`

### 3. **Output: Mapping JSON File**

The script generates a comprehensive mapping file with:

#### A. Resolved Token Values
```json
{
  "tokens": {
    "color.selected.background": {
      "value": "#ffffff",
      "type": "color",
      "reference": "{color.background.neutral.base}",
      "description": "Mobile content switcher item selected background - gray/0 - #ffffff",
      "figma_property": {
        "property": "fills",
        "type": "SOLID",
        "target": "container"
      }
    }
  }
}
```

#### B. Application Instructions
Structured instructions for applying tokens to different states:
```json
{
  "instructions": {
    "selected": {
      "container": {
        "background": "{color.background.neutral.base}",
        "border": "{color.border.transparent}",
        "borderRadius": "{border.radius.sm}",
        "padding": {
          "horizontal": "{padding.x.md}",
          "vertical": "{padding.y.sm}"
        }
      },
      "text": {
        "color": "{color.text.primary.body.1}",
        "typography": "{font.body.semibold.base}"
      }
    }
  }
}
```

#### C. Node Matching Patterns
Patterns to identify which Figma nodes to apply tokens to:
```json
{
  "node_matching": {
    "selected": {
      "patterns": ["State=Selected", "state=selected", "Selected"],
      "data_attribute": "data-name"
    },
    "default": {
      "patterns": ["State=Unselected", "State=Default", "Unselected"],
      "data_attribute": "data-name"
    }
  }
}
```

## Usage

### Basic Usage

```bash
python scripts/tokens-to-figma-mapper.py \
    --component tokens/mobile-components/content-switcher-item.json
```

This will:
1. Read the component token file
2. Generate a mapping file at `figma-mappings/content-switcher-item-mapping.json`

### With Custom Output Path

```bash
python scripts/tokens-to-figma-mapper.py \
    --component tokens/mobile-components/content-switcher-item.json \
    --output my-custom-mapping.json
```

### With Token Reference Files

```bash
python scripts/tokens-to-figma-mapper.py \
    --component tokens/mobile-components/content-switcher-item.json \
    --semantic tokens/Semantics/Semantic.json \
    --primitive tokens/Primitive.json
```

## Applying Tokens to Figma

### Option 1: Using a Figma Plugin

1. **Install a Design Tokens Plugin** (e.g., "Design Tokens" or "Figma Tokens")
2. **Load the mapping file** into the plugin
3. **Select your Figma frames/components**
4. **Apply tokens** using the plugin's interface

### Option 2: Custom Figma Plugin

Create a Figma plugin that reads the mapping file:

```typescript
// Example plugin code
const mapping = await fetch('figma-mappings/content-switcher-item-mapping.json')
  .then(r => r.json());

// Apply tokens to selected nodes
const selection = figma.currentPage.selection;
for (const node of selection) {
  if (node.name.includes('State=Selected')) {
    applyTokens(node, mapping.instructions.selected, mapping.tokens);
  }
}

function applyTokens(node, instructions, tokens) {
  // Apply container background
  if (instructions.container.background) {
    const tokenPath = instructions.container.background;
    const token = tokens[tokenPath];
    if (token && 'fills' in node) {
      node.fills = [{
        type: 'SOLID',
        color: hexToRgb(token.value)
      }];
    }
  }
  
  // Apply border radius
  if (instructions.container.borderRadius) {
    const tokenPath = instructions.container.borderRadius;
    const token = tokens[tokenPath];
    if (token && 'cornerRadius' in node) {
      node.cornerRadius = parseFloat(token.value);
    }
  }
  
  // ... apply other tokens
}
```

### Option 3: Manual Application

Use the mapping file as a reference guide:

1. **Open the mapping file** in a text editor
2. **Select the Figma frame** you want to update
3. **Apply values manually**:
   - Background: Copy hex value → Apply to frame fills
   - Border radius: Copy pixel value → Apply to corner radius
   - Padding: Copy pixel values → Apply to auto-layout padding
   - Text color: Copy hex value → Apply to text fills
   - Typography: Copy font info → Apply to text properties

## Mapping File Structure

The generated mapping file contains:

```json
{
  "component": "content-switcher-item",
  "version": "1.0.0",
  "description": "Figma mapping for content-switcher-item component tokens",
  
  "tokens": {
    // All resolved token values with metadata
  },
  
  "instructions": {
    // Structured instructions for each state
  },
  
  "node_matching": {
    // Patterns to identify nodes
  },
  
  "application_guide": {
    // Guide for applying tokens to Figma properties
  }
}
```

## Token Resolution Strategy

The script uses a **multi-layered resolution strategy**:

1. **Primary**: Extract from description (most reliable)
   - Descriptions contain actual values: "#ffffff", "16px", etc.

2. **Secondary**: Resolve through Semantic.json
   - Follows token reference chain
   - Extracts values from semantic token descriptions

3. **Tertiary**: Resolve through Primitive.json
   - Falls back to primitive tokens
   - Extracts base color values

4. **Fallback**: Return reference as-is
   - If all else fails, returns the original reference
   - Can be resolved later by Figma plugins

## Troubleshooting

### Issue: Token values not resolved

**Solution**: Ensure descriptions contain actual values:
```json
{
  "description": "Mobile content switcher item selected background - gray/0 - #ffffff"
}
```

### Issue: Mapping file not generated

**Solution**: Check file paths and permissions:
```bash
# Verify component file exists
ls tokens/mobile-components/content-switcher-item.json

# Check write permissions
touch figma-mappings/test.json
```

### Issue: Incorrect token values

**Solution**: Verify token descriptions follow the format:
- Colors: `... - #HEXCODE`
- Dimensions: `... - NUMBERpx`
- Typography: `... - NUMBERpx WEIGHT`

## Next Steps

1. **Generate mapping files** for all your components
2. **Create or use a Figma plugin** to apply tokens automatically
3. **Set up automation** to regenerate mappings when tokens change
4. **Integrate with CI/CD** to keep Figma designs in sync with tokens

## Example Workflow

```bash
# 1. Generate mapping for a component
python scripts/tokens-to-figma-mapper.py \
    --component tokens/mobile-components/content-switcher-item.json

# 2. Review the generated mapping
cat figma-mappings/content-switcher-item-mapping.json

# 3. Use Figma plugin or manual application
# (See "Applying Tokens to Figma" section above)

# 4. Verify tokens are applied correctly in Figma
```

## Support

For issues or questions:
- Check the mapping file structure
- Verify token descriptions contain actual values
- Review the application guide in the mapping file

