# How Tokens-to-Figma Mapping Works - Detailed Explanation

## Overview

This document provides a detailed explanation of how the `tokens-to-figma-mapper.py` script automatically generates mapping files that can be used to apply design tokens to Figma designs.

## The Problem

Design tokens are stored in JSON files with references like `{color.background.neutral.base}`. To apply these to Figma designs, you need:
1. **Resolved values** (actual hex codes, pixel values, etc.)
2. **Mapping instructions** (which Figma properties to apply tokens to)
3. **Node identification** (how to find the right Figma elements)

## The Solution: Three-Step Process

### Step 1: Token Extraction and Resolution

The script reads your component token JSON file and extracts all token definitions:

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

**Resolution Strategy:**

1. **Extract from Description** (Primary Method)
   - The description contains the actual value: `"#ffffff"`
   - Uses regex patterns to extract:
     - Colors: `#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})` → `#ffffff` or `#FFFFFF00`
     - Dimensions: `(\d+(?:\.\d+)?)px` → `16px`
     - Typography: `(\d+)px\s+(\w+)` → `14px semibold`

2. **Resolve References** (Fallback Method)
   - If description extraction fails, follows the reference chain:
     - `{color.background.neutral.base}` → checks Semantic.json
     - If found, extracts value from semantic token description
     - If not found, checks Primitive.json
     - Recursively resolves nested references

3. **Return Reference** (Last Resort)
   - If all else fails, returns the original reference
   - Can be resolved later by Figma plugins

**Example Resolution:**

```
Input: {color.background.neutral.base}
↓
Description: "Mobile content switcher item selected background - gray/0 - #ffffff"
↓
Extracted: #ffffff
↓
Output: {
  "value": "#ffffff",
  "type": "color",
  "reference": "{color.background.neutral.base}"
}
```

### Step 2: Figma Property Mapping

Each token is mapped to Figma API properties based on its path and type:

**Color Tokens:**
- `color.background.*` → `fills` property (SOLID type)
- `color.border.*` → `strokes` property (SOLID type)
- `color.text.*` → `fills` property on text nodes
- `color.icon.*` → `fills` property on icon nodes

**Dimension Tokens:**
- `border.radius.*` → `cornerRadius` property
- `padding.horizontal.*` → `paddingLeft` and `paddingRight`
- `padding.vertical.*` → `paddingTop` and `paddingBottom`
- `gap.*` → `itemSpacing` (for auto-layout frames)
- `sizing.icon.*` → `width` and `height` on icon nodes

**Typography Tokens:**
- `typography.*` → `fontName`, `fontSize`, `fontWeight`

**Shadow Tokens:**
- `shadow.*` → `effects` array

**Example Mapping:**

```json
{
  "content-switcher-item.color.selected.background": {
    "value": "#ffffff",
    "type": "color",
    "figma_property": {
      "property": "fills",
      "type": "SOLID",
      "target": "container"
    }
  }
}
```

### Step 3: Instruction Generation

The script generates structured instructions for applying tokens to different states:

**State-Based Instructions:**

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

**Node Matching Patterns:**

The script also generates patterns to identify which Figma nodes to apply tokens to:

```json
{
  "node_matching": {
    "selected": {
      "patterns": ["State=Selected", "state=selected", "Selected"],
      "data_attribute": "data-name"
    }
  }
}
```

## Complete Workflow

### 1. Input: Component Token File

```bash
python scripts/tokens-to-figma-mapper.py \
    --component tokens/mobile-components/content-switcher-item.json
```

**What happens:**
- Script reads the JSON file
- Extracts component name (`content-switcher-item`)
- Traverses all token definitions

### 2. Processing: Token Resolution

For each token:
1. Check if it has a `value` field
2. If value is a reference (`{...}`):
   - Extract actual value from description
   - If extraction fails, resolve through Semantic/Primitive tokens
3. Map token path to Figma property
4. Store resolved token with metadata

### 3. Output: Mapping File

The script generates `figma-mappings/content-switcher-item-mapping.json` with:

**A. Resolved Tokens:**
```json
{
  "tokens": {
    "content-switcher-item.color.selected.background": {
      "value": "#ffffff",
      "type": "color",
      "reference": "{color.background.neutral.base}",
      "description": "...",
      "figma_property": {
        "property": "fills",
        "type": "SOLID",
        "target": "container"
      }
    }
  }
}
```

**B. Application Instructions:**
```json
{
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

**C. Node Matching:**
```json
{
  "node_matching": {
    "selected": {
      "patterns": ["State=Selected"],
      "data_attribute": "data-name"
    }
  }
}
```

## Using the Mapping File

### Option 1: Figma Plugin

A Figma plugin can read the mapping file and apply tokens automatically:

```typescript
// Load mapping file
const mapping = await fetch('figma-mappings/content-switcher-item-mapping.json')
  .then(r => r.json());

// Find nodes matching patterns
const selectedNodes = figma.currentPage.findAll(node => 
  mapping.node_matching.selected.patterns.some(pattern => 
    node.name.includes(pattern)
  )
);

// Apply tokens
selectedNodes.forEach(node => {
  const instructions = mapping.instructions.selected;
  
  // Apply background
  if (instructions.container.background) {
    const tokenPath = instructions.container.background;
    const token = mapping.tokens[tokenPath];
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
    const token = mapping.tokens[tokenPath];
    if (token && 'cornerRadius' in node) {
      node.cornerRadius = parseFloat(token.value);
    }
  }
});
```

### Option 2: Manual Application

Use the mapping file as a reference:

1. **Open mapping file** in text editor
2. **Select Figma frame** (e.g., "State=Selected")
3. **Apply values**:
   - Background: `#ffffff` → Apply to frame fills
   - Border radius: `8px` → Apply to corner radius
   - Padding: `16px` horizontal, `8px` vertical → Apply to auto-layout padding

## Key Features

### 1. Smart Value Extraction

The script intelligently extracts values from descriptions:
- **Colors**: Finds hex codes (`#ffffff`, `#FFFFFF00`)
- **Dimensions**: Finds pixel values (`16px`, `8px`)
- **Typography**: Extracts size and weight (`14px semibold`)

### 2. Multi-Layer Resolution

If description extraction fails:
1. Check Semantic.json
2. Check Primitive.json
3. Follow nested references recursively
4. Return reference as fallback

### 3. Comprehensive Mapping

Every token is mapped to:
- **Figma property** (fills, strokes, cornerRadius, etc.)
- **Target element** (container, text, icon, etc.)
- **Property type** (SOLID, dimension, etc.)

### 4. State-Based Instructions

Instructions are organized by state:
- `selected` state tokens
- `default` state tokens
- Easy to apply conditionally

### 5. Node Matching Patterns

Patterns help identify which Figma nodes to update:
- Matches node names
- Supports data attributes
- Flexible pattern matching

## Example: Complete Flow

```
1. Component Token File
   ↓
   content-switcher-item.json
   {
     "color": {
       "selected": {
         "background": {
           "value": "{color.background.neutral.base}",
           "description": "... - #ffffff"
         }
       }
     }
   }

2. Script Processing
   ↓
   - Extract: #ffffff from description
   - Map: fills property on container
   - Generate: instruction for selected state

3. Mapping File Output
   ↓
   figma-mappings/content-switcher-item-mapping.json
   {
     "tokens": {
       "content-switcher-item.color.selected.background": {
         "value": "#ffffff",
         "figma_property": {
           "property": "fills",
           "target": "container"
         }
       }
     },
     "instructions": {
       "selected": {
         "container": {
           "background": "{color.background.neutral.base}"
         }
       }
     }
   }

4. Application to Figma
   ↓
   - Plugin reads mapping file
   - Finds nodes matching "State=Selected"
   - Applies #ffffff to frame.fills[0]
   - Result: Figma design updated with token values
```

## Benefits

1. **Automated**: No manual copying of values
2. **Accurate**: Extracts exact values from descriptions
3. **Comprehensive**: Maps all token types to Figma properties
4. **Flexible**: Works with plugins or manual application
5. **Maintainable**: Regenerate when tokens change

## Next Steps

1. **Generate mappings** for all components
2. **Create Figma plugin** to apply tokens automatically
3. **Set up automation** to regenerate on token changes
4. **Integrate with CI/CD** for design-token sync

