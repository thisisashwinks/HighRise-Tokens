# HighRise Component Tokens

> **Systematic design token generation for the HighRise Design System**

[![HighRise Design System](https://img.shields.io/badge/HighRise-Design%20System-1c6dff)](https://highrise.gohighlevel.com/)
[![Token Standard](https://img.shields.io/badge/Standard-Design%20Tokens-00d4aa)](https://design-tokens.github.io/community-group/format/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## 🎯 Project Overview

The HighRise Component Tokens project generates comprehensive, component-specific design tokens for all components in the [HighRise Design System](https://highrise.gohighlevel.com/). This systematic approach ensures consistent visual design across all GHL ecosystem applications while maintaining scalability and maintainability.

### Key Features

- **🎨 Component-Specific Tokens**: Individual token files for each HighRise component
- **📱 Responsive Design**: Mobile, tablet, and large screen variants
- **🌗 Theme Support**: Light and dark theme tokens nested within same structure
- **🔄 Semantic Hierarchy**: Prioritizes semantic values over primitive tokens
- **🤖 Automated Generation**: Scripts to analyze patterns and generate tokens
- **📊 Usage Analysis**: Identifies common patterns for semantic token creation

## 📋 Token Hierarchy

The project follows a hierarchical token structure with three main levels:

### 1. Primitive Tokens
**Structure**: `Category` → `Sub-category` → `Concept` → `Property` → `Variant` → `Scale`

```json
{
  "color": {
    "primary": {
      "blue": {
        "500": {
          "value": "#1c6dff",
          "type": "color"
        }
      }
    }
  }
}
```

### 2. Semantic Tokens
**Structure**: `Category` → `Sub-Category` → `Concept` → `Property` → `Variant` → `State` → `Scale`

```json
{
  "color": {
    "background": {
      "surface": {
        "primary": {
          "default": {
            "value": "{color.primary.blue.500}",
            "type": "color"
          }
        }
      }
    }
  }
}
```

### 3. Component-Specific Tokens
**Structure**: `Component` → `Element` → `Category` → `Sub-Category` → `Concept` → `Property` → `Variant` → `State` → `Scale`

```json
{
  "button": {
    "primary": {
      "background": {
        "color": {
          "default": {
            "hover": {
              "value": "{color.background.surface.primary.hover}",
              "type": "color"
            }
          }
        }
      }
    }
  }
}
```

### 4. Responsive Tokens
**Structure**: `Component` → `Element` → `Category` → `Sub-Category` → `Concept` → `Property` → `Variant` → `State` → `Breakpoint`

```json
{
  "button": {
    "primary": {
      "size": {
        "padding": {
          "horizontal": {
            "default": {
              "mobile": {
                "value": "{size.spacing.padding.sm}",
                "type": "dimension"
              }
            }
          }
        }
      }
    }
  }
}
```

## 🏗️ Project Structure

```
HighRise-Tokens/
├── README.md                          # This file
├── HighRise-Component-Tokens-Project.md  # Project tracking document
├── tokens/
│   ├── primitive/
│   │   └── Default.json              # Base primitive tokens (3,140 lines)
│   ├── Semantic.json                 # Semantic layer tokens (4,508 lines)
│   ├── web-components/               # Web component-specific tokens
│   │   ├── component-token-template.json
│   │   ├── icon.json                 # Generated component tokens
│   │   ├── button.json
│   │   ├── input.json
│   │   └── ...
│   ├── mobile-components/            # Mobile component-specific tokens
│   │   ├── button.json
│   │   ├── input.json
│   │   ├── tab.json
│   │   ├── tab-item.json
│   │   └── ...
│   ├── generated-highrise-scales/    # Generated color scales
│   │   ├── light.json
│   │   ├── dark.json
│   │   └── ...
│   └── Component Specific/           # Legacy component tokens
│       └── Mode 1.json              # Existing tag component
├── scripts/
│   └── token-generator.py           # Token generation automation
└── remove_tokens_wrapper.py         # Utility script
```

## 🚀 Getting Started

### Prerequisites

- Python 3.6 or higher
- Access to HighRise Design System Figma files

### Installation

1. Clone this repository
2. Ensure Python dependencies are available (json, os, argparse, collections)
3. Review the project tracking document for current status

### Usage

#### Analyze Token Usage Patterns

```bash
python3 scripts/token-generator.py --analyze
```

This will show:
- Total unique tokens referenced
- Top 10 most used tokens
- Semantic token candidates (3+ usage)

#### Generate Component Tokens

```bash
python3 scripts/token-generator.py --component ButtonComponent
```

This creates a new component token file with:
- Light/dark theme variants
- Responsive breakpoint tokens
- All standard states and variants

#### Custom Component Configuration

Create a JSON config file:

```json
{
  "elements": ["container", "icon", "label"],
  "properties": ["background", "color", "border", "padding"],
  "variants": ["primary", "secondary", "tertiary"],
  "states": ["default", "hover", "active", "focused", "disabled"]
}
```

Then generate:

```bash
python3 scripts/token-generator.py --component MyComponent --config my-config.json
```

## 🎨 Component Processing Workflow

### For Each Component:

1. **📋 Figma Analysis**
   - Extract all visual properties (colors, sizes, spacing, etc.)
   - Identify different states (default, hover, active, focused, disabled)
   - Document variants and element hierarchy

2. **🔧 Token Generation**
   - Follow naming convention structure
   - Prioritize semantic token references
   - Create fallback to primitive tokens when semantic unavailable

3. **🔍 Pattern Identification**
   - Look for repeated patterns across components
   - Create new semantic tokens for common design decisions
   - Update semantic token library

4. **💾 File Creation**
   - Generate JSON file following established structure
   - Include all states, variants, and responsive breakpoints
   - Add comprehensive documentation

## 📱 Responsive Breakpoints

The system uses three responsive breakpoints:

- **Mobile**: 320px - 767px
- **Tablet**: 768px - 1024px  
- **Large**: 1025px+

Responsive tokens are generated for properties that need scaling across different screen sizes, primarily:
- Padding and margins
- Font sizes and line heights
- Component dimensions

## 🎯 Component Priority Order

Components are processed in the following priority order:

### Phase 1 - Core Components
1. **Icon** - Base visual element
2. **Button** - Primary interactive component
3. **Input Field** - Form component
4. **Select** - Form component
5. **Avatar** - Display component
6. **Tag** - Already implemented

### Phase 2 - Extended Components
7. Card, Modal, Dropdown, Alert/Banner

### Phase 3 - Layout & Navigation
11. Navigation, Tabs, Sidebar, Header, Breadcrumb

### Phase 4 - Data & Utility
16. Table, Form, Tooltip, Badge, Progress Bar, Pagination, Footer

## 🔄 Semantic Token Strategy

The project uses a **3+ usage rule** for creating semantic tokens:

- **Automatic Detection**: Tokens used in 3+ components become semantic token candidates
- **Pattern Recognition**: Common design patterns are identified and abstracted
- **Utility Creation**: Frequently used patterns (focus rings, shadows) become utility tokens

## 🤝 Contributing

### Adding New Components

1. Share the Figma design link for the component
2. The token generator will analyze the design and extract properties
3. Component tokens will be generated following the established structure
4. New semantic tokens will be created for any 3+ usage patterns

### Updating Existing Components

1. Modify the component's JSON file in `tokens/components/`
2. Run the analyzer to check for new semantic token opportunities
3. Update the project tracking document with changes

## 📊 Project Status & Progress

### 🎯 Current Phase: **Component Token Generation (Active)**

### ✅ Completed Infrastructure
- [x] Project setup and documentation
- [x] Existing token analysis (3,140 primitive + 4,508 semantic tokens)
- [x] Component token template structure
- [x] Token generation automation scripts
- [x] File organization structure established

### 📈 **Component Status Summary**

#### **Completed Component Token Files (42 Files)**

**Web Components (35 files):**

**Core Interactive Components:**
- ✅ `button.json` - Primary button component with all variants
- ✅ `link-button.json` - Link-styled button component
- ✅ `action-icon.json` - Icon button component
- ✅ `icon.json` - Base icon component

**Form Components:**
- ✅ `input.json` - Input field component
- ✅ `input-form.json` - Form input wrapper
- ✅ `textarea.json` - Textarea input component
- ✅ `select.json` - Select dropdown component
- ✅ `checkbox-element.json` - Checkbox component
- ✅ `radio.json` - Radio button component

**Avatar Components:**
- ✅ `avatar.json` - Base avatar component
- ✅ `avatar-profile-photo.json` - Avatar with profile photo
- ✅ `avatar-company-icon.json` - Avatar with company icon
- ✅ `avatar-online-indicator.json` - Online status indicator
- ✅ `avatar-add-button.json` - Avatar add button
- ✅ `avatar-with-label.json` - Avatar with label
- ✅ `avatar-group.json` - Avatar group component

**Tag Components:**
- ✅ `tag.json` - Base tag component
- ✅ `tag-close.json` - Tag close button
- ✅ `tag-count.json` - Tag count indicator
- ✅ `tag-group.json` - Tag group component
- ✅ `badge-group.json` - Badge group component

**Navigation & Menu Components:**
- ✅ `tab.json` - Base tab component
- ✅ `tab-item.json` - Individual tab item
- ✅ `dropdown-menu.json` - Dropdown menu container
- ✅ `dropdown-list-item.json` - Dropdown menu item
- ✅ `content-switcher.json` - Content switcher container
- ✅ `content-switcher-item.json` - Content switcher item
- ✅ `pagination.json` - Pagination component
- ✅ `pagination-item.json` - Pagination item
- ✅ `pagination-button-group.json` - Pagination button group

**Feedback Components:**
- ✅ `alert.json` - Alert/banner component
- ✅ `tooltip.json` - Tooltip component

**Other Components:**
- ✅ `action-group.json` - Action group component
- ✅ `time-picker.json` - Time picker component

**Template:**
- ✅ `component-token-template.json` - Standard template for new components

**Mobile Components (7 files):**
- ✅ `button.json` - Mobile button component
- ✅ `input.json` - Mobile input field component
- ✅ `tab.json` - Mobile tab container component
- ✅ `tab-item.json` - Mobile tab item component
- ✅ `content-switcher.json` - Mobile content switcher container
- ✅ `content-switcher-item.json` - Mobile content switcher item
- ✅ `no-badge.json` - Mobile no badge component

#### **Progress Overview:**
```
Component Token Files: 42 completed
├── Web Components: 35 files
│   ├── Core Components: 4 files (button, link-button, action-icon, icon)
│   ├── Form Components: 6 files (input, input-form, textarea, select, checkbox, radio)
│   ├── Avatar System: 7 files (avatar variants, indicators, group)
│   ├── Tag System: 5 files (tag, close, count, group, badge-group)
│   ├── Navigation: 9 files (tabs, dropdown, content-switcher, pagination)
│   ├── Feedback: 2 files (alert, tooltip)
│   └── Other: 2 files (action-group, time-picker)
└── Mobile Components: 7 files
    ├── Core: 1 file (button)
    ├── Forms: 1 file (input)
    ├── Navigation: 4 files (tab, tab-item, content-switcher, content-switcher-item)
    └── Other: 1 file (no-badge)
```

### 🎯 **Core Component Coverage**

| Component Category | Web Files | Mobile Files | Total | Status |
|-------------------|-----------|--------------|-------|---------|
| **Buttons** | 3 files | 1 file | 4 files | ✅ Complete |
| **Forms** | 6 files | 1 file | 7 files | ✅ Complete |
| **Avatars** | 7 files | - | 7 files | ✅ Complete |
| **Tags** | 5 files | - | 5 files | ✅ Complete |
| **Navigation** | 9 files | 4 files | 13 files | ✅ Complete |
| **Icons** | 2 files | - | 2 files | ✅ Complete |
| **Feedback** | 2 files | - | 2 files | ✅ Complete |
| **Other** | 1 file | 1 file | 2 files | ✅ Complete |

### 📈 **Progress Metrics**
- **Primitive Tokens**: 3,140 (Complete) ✅
- **Semantic Tokens**: 4,508 (Complete) ✅
- **Component Token Files**: **42 files generated** ✅
  - Web components: 35 files
  - Mobile components: 7 files
  - Button variants: 4 files (3 web + 1 mobile)
  - Form components: 7 files (6 web + 1 mobile)
  - Avatar system: 7 files
  - Tag system: 5 files
  - Navigation: 13 files (9 web + 4 mobile)
  - Feedback: 2 files
  - Icons: 2 files

### 📋 **Detailed Status Reference**
For complete component breakdown and detailed tracking, see: [📊 PROJECT_STATUS_TRACKER.md](./PROJECT_STATUS_TRACKER.md)

## 🔗 Related Links

- [📊 **Detailed Project Status Tracker**](./PROJECT_STATUS_TRACKER.md) - Complete component breakdown with interactive charts
- [HighRise Design System](https://highrise.gohighlevel.com/)
- [Design Tokens Community Group](https://design-tokens.github.io/community-group/)
- [Project Tracking Document](./HighRise-Component-Tokens-Project.md)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ for the GHL ecosystem**

*For questions or support, please refer to the project tracking document or contact the development team.* 