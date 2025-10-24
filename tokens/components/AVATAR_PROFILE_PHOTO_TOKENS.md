# Avatar Profile Photo Component Tokens

## Overview
Component tokens for the Avatar Profile Photo component, which displays large circular profile pictures with optional verified badges, placeholder icons, or text initials.

**Figma Reference**: Node ID `26683-72284`

## Component Variants

### Sizes
- **Small (sm)**: 90px
- **Medium (md)**: 144px  
- **Large (lg)**: 346px

### States
1. **Image**: Displays actual profile photo
2. **Placeholder Icon**: Shows user icon placeholder
3. **Text/Initials**: Displays text initials (e.g., "OR")

### Features
- **Verified Badge**: Optional blue checkmark badge
- **White Border**: Consistent border around the avatar (3px for sm, 4px for md/lg)
- **Circular Shape**: Full border radius for perfect circles

## Token Structure

### Container
- **Background Colors**:
  - `text-type`: Gray background for text/initials state
  - `image`: Transparent background for image state
  - `placeholder`: Gray background for placeholder icon state
  
- **Border**:
  - `radius`: Full (circular) for all sizes
  - `width`: 3px (sm), 4px (md, lg)
  - `color`: White border

- **Sizes**: 90px, 144px, 346px for sm, md, lg respectively

### Text (Initials)
- **Color**: Neutral body text color (gray-600)
- **Typography**: 
  - sm: 30px Display Medium
  - md: 36px Display Medium  
  - lg: 60px Display Medium

### Placeholder Icon
- **Color**: Neutral moderate icon color
- **Sizes**: 54px (sm), 96px (md), 266px (lg)
- **Position**: Centered within container with appropriate offsets

### Verified Tick Badge
- **Sizes**: 20px (sm), 24px (md), 32px (lg)
- **Position**: Bottom-right corner with size-specific offsets
  - sm: 0px from bottom/right
  - md: 2px from bottom/right
  - lg: 4px from bottom/right

### Image
- **Fit**: Cover (fills container while maintaining aspect ratio)
- **Position**: Center

## Design Notes

1. **Border Treatment**: Unlike standard avatars, profile photos have a prominent white border that creates visual separation from backgrounds

2. **Verified Badge Positioning**: The verified checkmark is positioned in the bottom-right corner with consistent spacing relative to the avatar size

3. **Three Display Modes**: 
   - Real photos for authenticated users
   - User icon placeholder for accounts without photos
   - Text initials as an alternative placeholder

4. **Typography Scale**: Uses Display font family (not Body) for the larger text sizes needed for initials

5. **Icon Scaling**: Placeholder icons are sized proportionally to maintain visual balance across all avatar sizes

## Usage in Design System

These tokens ensure consistency across:
- User profile pages
- Account settings
- Large format avatar displays
- Verification badge positioning
- Placeholder states

## Related Components
- `avatar.json`: Standard avatar component (smaller sizes, different use cases)
- `avatar-online-indicator.json`: Online status indicator
- `avatar-company-icon.json`: Company badge overlay

