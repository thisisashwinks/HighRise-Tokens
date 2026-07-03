# Variable Binding Guide

## How It Works

The plugin now binds Figma variables to component properties based on the variable naming structure in your Figma collections.

## Variable Naming Structure

Based on your Figma Variables panel, variables are named like:

```
{component-name} / {category} / {state} / {property}
```

### Examples:

**Color variables (with state):**
- `content-switcher-item / color / selected / background`
- `content-switcher-item / color / selected / text`
- `content-switcher-item / color / selected / icon`
- `content-switcher-item / color / selected / border`
- `content-switcher-item / color / selected / subtext`
- `content-switcher-item / color / default / background`
- `content-switcher-item / color / default / text`
- etc.

**Dimension variables (usually no state):**
- `content-switcher-item / padding / horizontal`
- `content-switcher-item / padding / vertical`
- `content-switcher-item / border / radius`

## Variable Matching Logic

The plugin searches for variables in this order:

1. **Exact match with state**: `content-switcher-item / color / selected / background`
2. **Exact match without state**: `content-switcher-item / padding / horizontal` (for padding/border)
3. **Flexible matching**: Finds variables containing component name + property name

## Supported Properties

### Colors (COLOR variables)
- **Background** → `fills` property
- **Border** → `strokes` property
- **Text** → `fills` property on TEXT nodes
- **Icon** → `fills` property on VECTOR/BOOLEAN_OPERATION nodes
- **Subtext** → `fills` property on TEXT nodes

### Dimensions (FLOAT variables)
- **Border Radius** → `cornerRadius` property
- **Padding Horizontal** → `paddingLeft` and `paddingRight` properties
- **Padding Vertical** → `paddingTop` and `paddingBottom` properties

## How to Use

1. **Ensure variables exist** in Figma Variables panel
2. **Load mapping files** in the plugin
3. **Select components** you want to update
4. **Click "Apply Tokens to Selection"**
5. **Check console** (Plugins → Development → Open Console) for variable matching logs

## Debugging

The plugin logs detailed information:

- `✓ Found variable: "variable-name"` - Variable found and bound
- `✗ Variable not found: ...` - Variable not found, will use fallback value
- `Available variables for "component-name": [...]` - Lists available variables for troubleshooting

## Fallback Behavior

If a variable is not found, the plugin will:
1. Try to find the variable with different naming patterns
2. If still not found, apply the direct token value (hex color or pixel value)
3. Log the issue to console for debugging

## Troubleshooting

### Variables not binding

1. **Check variable names** match the expected pattern
2. **Check variable type** (COLOR for colors, FLOAT for dimensions)
3. **Check console logs** to see what variables are being searched
4. **Verify component name** matches exactly (case-insensitive, but structure matters)

### Common Issues

- **Variable name mismatch**: Variable names must include component name, category, state (if applicable), and property
- **Wrong variable type**: Colors need COLOR variables, dimensions need FLOAT variables
- **Node type**: Some properties only work on specific node types (e.g., padding only on auto-layout frames)
