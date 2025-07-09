# HighRise Design Token Rules

## Token Structure Cleanup Guidelines

### Schema and Metadata Removal
- Remove all schema references and metadata from token files
- Remove documentation sections from component tokens
- Use component names as root keys in token files
- Eliminate unnecessary nesting and wrapper objects

### Token Hierarchy Workflow
**CRITICAL**: Always follow this hierarchy:
1. **Primitive tokens** → Basic values (colors, sizes, etc.)
2. **Semantic tokens** → Contextual references to primitive tokens
3. **Component tokens** → References to semantic tokens (NEVER arbitrary values)

### Token Reference Patterns

#### Colors
- Background colors: `{semantic.color.background.primary}`
- Text colors: `{semantic.color.text.primary}`
- Border colors: `{semantic.color.border.primary}`
- State colors: `{semantic.color.state.error}`

#### Spacing
- Padding: `{semantic.spacing.padding.md}`
- Margin: `{semantic.spacing.margin.lg}`
- Gap: `{semantic.spacing.gap.sm}`
- Position: `{semantic.spacing.position.xs}`

#### Sizing
- Width: `{semantic.size.width.md}`
- Height: `{semantic.size.height.lg}`
- Icon sizes: `{semantic.size.icon.sm}`
- Component dimensions: `{semantic.size.component.button.md}`

#### Typography
- Font sizes: `{semantic.typography.size.body}`
- Line heights: `{semantic.typography.lineHeight.body}`
- Font weights: `{semantic.typography.weight.medium}`
- Letter spacing: `{semantic.typography.letterSpacing.normal}`

### Size Optimization Rules for Icons and Dimensions

#### Icon Sizing
- `xs`: 12px
- `sm`: 16px  
- `md`: 20px
- `lg`: 24px
- `xl`: 32px

#### Component Dimensions
- Use consistent sizing scale across all components
- Reference semantic tokens for all size values
- Maintain aspect ratios through token references

### Spacing References

#### Padding Tokens
- `xs`: 4px
- `sm`: 8px
- `md`: 12px
- `lg`: 16px
- `xl`: 24px

#### Margin Tokens
- `xs`: 4px
- `sm`: 8px
- `md`: 12px
- `lg`: 16px
- `xl`: 24px

#### Gap Tokens
- `xs`: 4px
- `sm`: 8px
- `md`: 12px
- `lg`: 16px
- `xl`: 24px

#### Position Tokens
- `xs`: 4px
- `sm`: 8px
- `md`: 12px
- `lg`: 16px
- `xl`: 24px

### Component Context Clarity

#### Component Token Structure
```json
{
  "component-name": {
    "element": {
      "category": {
        "property": {
          "variant": {
            "state": {
              "value": "{semantic.token.reference}",
              "type": "color|dimension|typography|shadow|border"
            }
          }
        }
      }
    }
  }
}
```

#### Element Categories
- `container`: Wrapper elements
- `content`: Text and media content
- `interactive`: Buttons, links, form elements
- `decorative`: Borders, shadows, backgrounds

#### Property Types
- `color`: All color-related properties
- `dimension`: Size, spacing, positioning
- `typography`: Font, text styling
- `shadow`: Drop shadows, box shadows
- `border`: Border styles and colors

### Figma Import Optimization Guidelines

#### Token Naming Convention
- Use kebab-case for all token names
- Include component context in token names
- Use semantic references, not primitive values
- Maintain consistency across theme variants

#### Theme Structure
```json
{
  "component-name": {
    "theme": {
      "light": { /* light theme tokens */ },
      "dark": { /* dark theme tokens */ }
    }
  }
}
```

#### State Management
- `default`: Base state
- `hover`: Mouse hover state
- `active`: Active/pressed state
- `focused`: Keyboard focus state
- `disabled`: Disabled state
- `loading`: Loading state

#### Variant Management
- `primary`: Primary variant
- `secondary`: Secondary variant
- `tertiary`: Tertiary variant
- `error`: Error state variant
- `warning`: Warning state variant
- `success`: Success state variant
- `info`: Info state variant

### File Organization Rules

#### Directory Structure
```
tokens/
├── primitive/
│   └── Default.json
├── semantic/
│   └── Semantic.json
└── components/
    ├── component-name.json
    └── component-token-template.json
```

#### File Naming
- Use lowercase with hyphens for component tokens
- Use PascalCase for semantic and primitive files
- Include component context in filename

### Quality Assurance Rules

#### Token Validation
- All component tokens must reference semantic tokens
- No arbitrary values in component tokens
- Consistent naming patterns across all files
- Proper type definitions for all tokens

#### Reference Validation
- Ensure all referenced tokens exist
- Check for circular references
- Validate token hierarchy compliance
- Verify theme consistency

### Development Integration

#### CSS Variable Generation
- Generate CSS custom properties from tokens
- Use semantic naming for CSS variables
- Maintain theme switching capability
- Ensure fallback values for missing tokens

#### Component Integration
- Use tokens for all styling properties
- Avoid hardcoded values in components
- Implement theme-aware styling
- Support responsive token variations

## Important Notes

- **NEVER** use arbitrary values in component tokens
- **ALWAYS** reference semantic tokens from component tokens
- **MAINTAIN** consistent hierarchy: primitive → semantic → component
- **REMOVE** all schema and metadata from production tokens
- **USE** component names as root keys in token files
- **FOLLOW** the established spacing and sizing scales
- **ENSURE** all tokens have proper type definitions
- **VALIDATE** token references before deployment 