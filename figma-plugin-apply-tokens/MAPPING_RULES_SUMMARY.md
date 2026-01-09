# Component Token Mapping Rules - Summary

This document lists all mapping rules for applying design tokens to Figma components.

## 1. Dimensions

### Width
- **Exclude**: Border width (Border width variables are for stroke width, not component width)
- **Patterns**:
  - `{component}/{category}/{variant}/width/{state}/{size}`
  - `{component}/{category}/width/{state}/{size}`
- **Note**: Only apply if explicitly defined for component

### Height
- **Requires Size**: Yes
- **Patterns**:
  - `button/regular/height/{state}/{size}` (e.g., `button/regular/height/default/sm`)
  - `button/icon/height/{size}` (for icon buttons)
  - `{component}/height/{state}/{size}`
- **Examples**:
  - `button/regular/height/default/sm` → 32px
  - `button/regular/height/link/sm` → 24px
  - `button/icon/height/sm` → 32px

### Border Radius
- **Requires Size**: Yes
- **Exclude For**: Icon components, placeholder components
- **Patterns**:
  - `button/border/{variant}/radius/{state}/{size}`
  - `button/border/default/radius/{state}/{size}`
  - `button/border/{variant}/radius/{size}`
- **Examples**:
  - `button/border/default/radius/sm` → 8px
  - `button/border/link/radius` → 0px
  - `button/border/ghost/radius` → 0px

### Border Width (Stroke Width)
- **Requires Size**: No
- **Note**: This is for stroke width, NOT component width
- **Patterns**:
  - `button/border/{variant}/width/{state}`
  - `button/border/default/width/{state}`
- **Examples**:
  - `button/border/default/width/default` → 1px
  - `button/border/link/width` → 0px

### Padding
- **Requires Size**: Yes
- **Horizontal Patterns**:
  - `button/regular/padding/{state}/x/{size}` (e.g., `button/regular/padding/default/x/sm`)
  - `button/padding/{variant}/x/{state}/{size}`
- **Vertical Patterns**:
  - `button/regular/padding/{state}/y/{size}` (e.g., `button/regular/padding/default/y/sm`)
  - `button/padding/{variant}/y/{state}/{size}`
  - **Both Horizontal & Vertical Patterns**:
  - `button/regular/padding/{state}/{size}` (e.g., `button/regular/padding/default/sm`)
  - `button/padding/{variant}/{state}/{size}`
- **Icon Button Padding** (uniform):
  - `button/icon/padding/{size}` (e.g., `button/icon/padding/sm`)
- **Examples**:
  - `button/regular/padding/default/x/sm` → 18px horizontal
  - `button/regular/padding/default/y/sm` → 10px vertical
  - `button/icon/padding/sm` → 12px (all sides)

### Gap (Item Spacing)
- **Requires Size**: Yes
- **Patterns**:
  - `button/regular/gap/{size}` (e.g., `button/regular/gap/sm`)
  - `button/gap/{variant}/{size}`
- **Examples**:
  - `button/regular/gap/sm` → 8px
  - `button/regular/gap/md` → 8px
  - `button/regular/gap/lg` → 12px

### Icon Size
- **Requires Size**: Yes
- **Apply To**: Icon placeholder component (parent container)
- **Note**: This is for icon component width/height, NOT button container dimensions
- **Patterns**:
  - `button/regular/icon/size/{size}` (e.g., `button/regular/icon/size/sm`)
  - `button/icon/icon/size/{size}` (for icon buttons)
  - `button/icon/size/{size}`
- **Examples**:
  - `button/regular/icon/size/sm` → 20px (icon width & height)
  - `button/regular/icon/size/md` → 20px
  - `button/regular/icon/size/lg` → 24px

## 2. Colors

### Background
- **Requires Size**: No
- **Patterns**:
  - `button/color/{variant}/{variant}/background/{state}`
  - `button/color/{variant}/background/{state}`
- **Examples**:
  - `button/color/primary/primary/background/default`
  - `button/color/primary/primary/background/hover`
  - `button/color/error/primary/background/default`

### Border Color
- **Requires Size**: No
- **Patterns**:
  - `button/color/{variant}/{variant}/border/{state}`
  - `button/color/{variant}/border/{state}`
- **Examples**:
  - `button/color/primary/primary/border/default`
  - `button/color/error/primary/border/default`

### Text Color
- **Requires Size**: No
- **Apply To**: Text nodes
- **Patterns**:
  - `button/color/{variant}/{variant}/text/{state}`
  - `button/color/{variant}/text/{state}`
- **Examples**:
  - `button/color/primary/primary/text/default`
  - `button/color/link/primary/text/default`

### Icon Color
- **Requires Size**: No
- **Apply To**: Icon child layers (VECTOR/BOOLEAN_OPERATION | Layer Name (Most used, but can vary): "Icon (Stroke)")
- **Exclude From**: Icon placeholder components
- **Patterns**:
  - `button/color/{variant}/{variant}/icon/{state}`
  - `button/color/{variant}/icon/{state}`
- **Examples**:
  - `button/color/primary/primary/icon/default`
  - `button/color/error/primary/icon/default`

## 3. Icon Component Handling

### Icon Placeholder (Parent Container)
- **Apply**: Size only (width & height from icon size tokens)
- **Exclude**: Color, border radius
- **Size Source**: `button/regular/icon/size/{size}` or `button/icon/icon/size/{size}`
- **Note**: Icon placeholder gets dimensions from icon size tokens, NOT button height tokens

### Icon Child Layers
- **Apply**: Color only
- **Exclude**: Size, border radius
- **Color Source**: `button/color/{variant}/{variant}/icon/{state}`
- **Note**: Size comes from parent placeholder, color comes from icon color tokens

## 4. Typography

### Source
- **From**: HighRise 1.2 Foundations File
- **Matching**: Semantic path matching (e.g., `{font.body.semibold.2xl}` → "Body Semibold 2XL")

### Token Structure
- **Pattern**: `button/typography/{size}`
- **Examples**:
  - `button/typography/sm` → `{font.body.semibold.2xl}` → 16px semibold
  - `button/typography/md` → `{font.body.semibold.2xl}` → 16px semibold
  - `button/typography/lg` → `{font.subheading.semibold.lg}` → 18px semibold
- **Use/Change (Change exisitng style to style name matching from HigRise 1.2 Foundations File)**:
  - `Text 2xl/Semibold` → `{body/2xl/semibold}` → 16px semibold
  - `Text lg/medium` → `{body/2xl/semibold}` → 14px medium
  - `Display 2xl/Regular ` → `{heading/display/regular}` → 72px regular


### Application
- **Apply To**: Text nodes
- **Method**: Text style matching from Foundations File

## 5. Shadows (Effects)

### Source
- **From**: HighRise 1.2 Foundations File
- **Matching**: Shadow path matching (e.g., `boxShadow.outer.xs` → "Outer/XS")

### Token Structure
- **Pattern**: `button/effects/shadow/{state}`
- **Variant Pattern**: `button/effects/shadow/{state}/{variant}` (for focused state)
- **Examples**:
  - `button/effects/shadow/default` → `boxShadow.outer.xs`
  - `button/effects/shadow/hover` → `boxShadow.outer.xs`
  - `button/effects/shadow/active` → `boxShadow.none`
  - `button/effects/shadow/focused/primary` → `boxShadow.focus.xs.primary.100`
  - `button/effects/shadow/focused/error` → `boxShadow.focus.xs.error.100`
- **Use/Change (Change exisitng style to style name matching from HigRise 1.2 Foundations File)**:
  - `Shadow/xs` → `outer/xs`
  - `Shadow/sm` → `outer/sm`
  - `Focus ring/xs focused 4px primary- 100` → `focus/xs/primary/100`

### Application
- **Apply To**: Container nodes
- **Method**: Effect style matching from Foundations File
- **Special**: `boxShadow.none` removes all shadows

## 6. Component-Specific Rules

### Component
- **Exclude Width**: Only if width variable name contains "border" in it (border width variables are for stroke width), don't apply if no variable exists for component width 
- **Height Patterns**:
  - Regular buttons: `button/regular/height/{state}/{size}`
  - Icon buttons: `button/icon/height/{size}`
- **Icon Size**: `button/regular/icon/size/{size}` (for icon component, not button)

## 7. Node Matching

### Size Extraction
- **Pattern**: `Size=({size})`
- **Examples**: `Size=sm`, `Size=md`, `Size=lg`

### Variant Extraction
- **Pattern**: `Variant=({variant})`
- **Examples**: `Variant=Primary`, `Variant=Secondary`, `Variant=Link`

### State Extraction
- **Pattern**: `State=({state})`
- **Examples**: `State=Default`, `State=Hover`, `State=Active`, `State=Focussed`, `State=Disabled`
- **Normalization**: `Focussed` → `focused`, `Default` → `default`

## 8. Application Order

1. Container colors (background, border)
2. Container dimensions (height, padding, gap, border radius)
3. Border width (stroke width)
4. Icon placeholder size
5. Text color and typography
6. Icon child color
7. Shadows/effects

## 9. Validation Rules

### Require Size
- Height
- Border radius
- Padding (horizontal & vertical)
- Gap
- Icon size

### Exclude Components
- **Width**: Component width if variable component width variable doesn't exist
- **Border Radius**: Icon components, placeholder components

### Exclude From
- **Icon Color**: Icon placeholder components
- **Border Radius**: Icon components, placeholder components

## 10. Variable Naming Conventions

### General Pattern
`{component}/{category}/{variant}/{property}/{state}/{size}`

### Common Patterns
- Colors: `button/color/{variant}/{variant}/{property}/{state}`
- Dimensions: `button/regular/{dimension}/{state}/{size}` or `button/regular/{dimension}/{size}`
- Icon: `button/regular/icon/size/{size}` (for icon dimensions)
- Typography: `{type}/{size}/{weight} - Eg: body/2xl/semibold` (references styles from Foundations File)
- Shadows: `{type}/{size} - Eg: outer/xs` (references styles from Foundations File. The pattern might change for focus styles)

## Notes

1. **Icon Size vs Button Height**: 
   - `button/regular/icon/size/{size}` → Icon component width/height
   - `button/regular/height/{state}/{size}` → Button container height
   - These are DIFFERENT and should NOT be confused

2. **Width Variables**: 
   - For buttons, width variables (`button/border/{variant}/width/{state}`) are for stroke width (border width), NOT component width
   - Do NOT apply border width variables to button containers

3. **Icon Components**:
   - Icon placeholder (parent) gets size from icon size tokens
   - Icon child layers get color from icon color tokens
   - Icon placeholder should NOT get color or border radius

4. **Typography & Shadows**:
   - These come from Foundations File, not from variables
   - Matching is done by semantic path (typography) or shadow path (effects)

