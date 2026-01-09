# Attaching Variables to Shadow Effects - Testing Guide

## Problem

Figma's Effect Style API doesn't natively support `VariableAlias` for effect properties (offset.x, offset.y, radius, spread, color). However, we want to attach token variables to these properties.

## Testing Script

I've created a test script (`test-attach-variables.js`) that attempts multiple methods to attach variables programmatically.

### How to Test

1. **As a Plugin Script:**
   - Copy the contents of `test-attach-variables.js`
   - Create a new plugin in Figma
   - Paste the code into the plugin's `code.ts` or `code.js`
   - Run the plugin
   - Check the console for results

2. **In Figma Console:**
   - Open Figma Desktop
   - Go to Plugins → Development → Open Console
   - Copy and paste the script
   - Run it

### What the Script Tests

The script attempts 4 different methods:

1. **Direct VariableAlias Assignment**: Tries to assign a VariableAlias directly to the property
2. **setBoundVariable Method**: Checks if a `setBoundVariable` method exists on effect objects
3. **Object Structure Modification**: Tries to modify the effect object structure
4. **Object.defineProperty**: Uses property descriptors to set the value

### Expected Results

Most likely, **none of these methods will work** because Figma's API doesn't support VariableAlias for effect properties. However, the script will:
- Test all possible methods
- Report which (if any) methods succeed
- Provide detailed console output

## Alternative Solution: Manual Attachment

Since programmatic attachment likely won't work, here's the manual process:

### Step 1: Ensure Variables Exist

The plugin already creates/ensures variables exist for:
- `position.x.*` (Semantic or Primitive)
- `position.y.*` (Semantic or Primitive)
- `blur.*` (Primitive)
- `spread.*` (Primitive)
- `color-shadow.*` or color variables (Primitive/Semantic)

### Step 2: Manual Attachment in Figma UI

1. Select an element with a shadow effect style applied
2. Open the Effects panel (right sidebar)
3. Click on the shadow effect
4. For each property (X, Y, Blur, Spread, Color):
   - Hover over the value input field
   - Look for the hexagonal icon (token attachment icon)
   - Click it and select the appropriate variable from Semantic or Primitive collection

### Step 3: Update Effect Style

After attaching variables to individual elements:
1. The effect style should update automatically
2. Or manually update the style from the element

## Current Plugin Behavior

The plugin currently:
- ✅ Creates effect styles with resolved numeric/RGB values
- ✅ Ensures all required variables exist (Semantic first, then Primitive)
- ✅ Makes variables available in Figma UI
- ❌ Cannot programmatically attach variables (API limitation)

## Future Considerations

If Figma adds support for VariableAlias in effect properties, we can update the plugin to automatically attach variables. Until then, manual attachment is required.

## Testing Results

After running the test script, please share:
- Which methods (if any) succeeded
- Any error messages
- Figma version you're using

This will help determine if there's a workaround or if we need to wait for API support.

