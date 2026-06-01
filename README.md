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
│   ├── mobile-components/            # Mobile component-specific tokens (34 files)
│   │   ├── button.json               # Core interactive
│   │   ├── input.json                # Forms
│   │   ├── text-area.json
│   │   ├── input-stepper.json
│   │   ├── modal.json                # Modal system
│   │   ├── modal-header.json
│   │   ├── modal-footer.json
│   │   ├── header.json               # Header system
│   │   ├── popover.json              # Feedback & overlay
│   │   ├── alert.json
│   │   ├── tab.json                  # Navigation
│   │   └── ...                       # 34 files total
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

#### **Completed Component Token Files (71 Files)**

**Web Components (37 files):**

**Core Interactive Components:**
- ✅ `button.json` - Primary button component with all variants
- ✅ `link-button.json` - Link-styled button component
- ✅ `action-icon.json` - Icon button component
- ✅ `icon.json` - Base icon component
- ✅ `toggle.json` - Toggle switch component

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

**Feedback & Overlay Components:**
- ✅ `alert.json` - Alert/banner component
- ✅ `tooltip.json` - Tooltip component
- ✅ `inline-text-container.json` - Inline editor text container

**Other Components:**
- ✅ `action-group.json` - Action group component
- ✅ `time-picker.json` - Time picker component

**Template:**
- ✅ `component-token-template.json` - Standard template for new components

**Mobile Components (34 files):**

**Core Interactive (6):**
- ✅ `button.json` - Mobile button component
- ✅ `checkbox.json` - Mobile checkbox component
- ✅ `radio.json` - Mobile radio button component
- ✅ `select.json` - Mobile select dropdown
- ✅ `toggle.json` - Mobile toggle switch
- ✅ `icon.json` - Mobile icon component

**Form (6):**
- ✅ `input.json` - Mobile input field
- ✅ `input-form.json` - Mobile form input wrapper
- ✅ `input-form-hint-text.json` - Mobile form hint text
- ✅ `text-area.json` - Mobile multiline text area
- ✅ `input-stepper.json` - Mobile numeric stepper (− value +)
- ✅ `stepper-action.json` - Mobile stepper +/− button

**Tags (4):**
- ✅ `tag.json` - Mobile base tag
- ✅ `tag-close.json` - Mobile tag close button
- ✅ `tag-count.json` - Mobile tag count indicator
- ✅ `tag-loader.json` - Mobile tag loading spinner

**Navigation (7):**
- ✅ `tab.json` - Mobile tab container
- ✅ `tab-item.json` - Mobile tab item
- ✅ `content-switcher.json` - Mobile content switcher container
- ✅ `content-switcher-item.json` - Mobile content switcher item
- ✅ `menu-item-navbar.json` - Mobile navbar menu item
- ✅ `no-badge.json` - Mobile no badge component
- ✅ `bottom navigation bar.json` - Mobile bottom navigation bar

**Modal (3):**
- ✅ `modal.json` - Mobile modal container
- ✅ `modal-header.json` - Mobile modal header
- ✅ `modal-footer.json` - Mobile modal footer

**Header (4):**
- ✅ `header.json` - Mobile header
- ✅ `header-lite.json` - Mobile header lite variant
- ✅ `header-lite-left.json` - Mobile header lite left panel
- ✅ `header-action-group.json` - Mobile header action group

**Feedback & Overlay (2):**
- ✅ `alert.json` - Mobile alert/notification banner
- ✅ `popover.json` - Mobile popover/onboarding tooltip

**Other (2):**
- ✅ `list-item.json` - Mobile list item
- ✅ `empty state.json` - Mobile empty state

#### **Progress Overview:**
```
Component Token Files: 71 completed
├── Web Components: 37 files
│   ├── Core/Interactive: 5 files (button, link-button, action-icon, icon, toggle)
│   ├── Form Components: 6 files (input, input-form, textarea, select, checkbox, radio)
│   ├── Avatar System: 7 files (avatar variants, indicators, group)
│   ├── Tag System: 5 files (tag, close, count, group, badge-group)
│   ├── Navigation: 9 files (tabs, dropdown, content-switcher, pagination)
│   ├── Feedback & Overlay: 3 files (alert, tooltip, inline-text-container)
│   └── Other: 2 files (action-group, time-picker)
└── Mobile Components: 34 files
    ├── Core/Interactive: 6 files (button, checkbox, radio, select, toggle, icon)
    ├── Forms: 6 files (input, input-form, hint-text, text-area, input-stepper, stepper-action)
    ├── Tags: 4 files (tag, tag-close, tag-count, tag-loader)
    ├── Navigation: 7 files (tab, tab-item, content-switcher ×2, menu-item-navbar, no-badge, bottom-nav-bar)
    ├── Modal: 3 files (modal, modal-header, modal-footer)
    ├── Header: 4 files (header, header-lite, header-lite-left, header-action-group)
    ├── Feedback & Overlay: 2 files (alert, popover)
    └── Other: 2 files (list-item, empty-state)
```

### 🎯 **Component Coverage**

| Component Category | Web Files | Mobile Files | Total | Status |
|-------------------|-----------|--------------|-------|---------|
| **Core/Interactive** | 5 files | 6 files | 11 files | ✅ Complete |
| **Forms** | 6 files | 6 files | 12 files | ✅ Complete |
| **Avatars** | 7 files | - | 7 files | ✅ Web complete |
| **Tags** | 5 files | 4 files | 9 files | ✅ Complete |
| **Navigation** | 9 files | 7 files | 16 files | ✅ Complete |
| **Modal** | - | 3 files | 3 files | ✅ Mobile complete |
| **Header** | - | 4 files | 4 files | ✅ Mobile complete |
| **Feedback & Overlay** | 3 files | 2 files | 5 files | ✅ Complete |
| **Other** | 2 files | 2 files | 4 files | ✅ Complete |

### 📈 **Progress Metrics**
- **Primitive Tokens**: 3,140 (Complete) ✅
- **Semantic Tokens**: 4,508 (Complete) ✅
- **Component Token Files**: **71 files generated (~41.8%)** ✅
  - Web components: 37 files
  - Mobile components: 34 files
  - Core/Interactive: 11 files
  - Form components: 12 files
  - Avatar system: 7 files
  - Tag system: 9 files
  - Navigation: 16 files
  - Modal: 3 files
  - Header: 4 files
  - Feedback & overlay: 5 files
  - Other: 4 files

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