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
├── PROJECT_STATUS_TRACKER.md          # Detailed component status tracker
├── HighRise-Component-Tokens-Project.md  # Project tracking document
├── ACTION_PLAN.md                     # Figma plugin setup action plan
├── requirements.txt                   # Python dependencies
│
├── tokens/                            # ── Token source of truth ──
│   ├── Primitive.json                 # Base primitive tokens (~3.9k lines)
│   ├── Semantics/
│   │   ├── Semantic.json              # Semantic layer tokens (~5.4k lines)
│   │   └── Semantic-Colors/           # Semantic color scales (light/dark)
│   ├── web-components/                # Web component tokens (37 files + template)
│   │   ├── component-token-template.json
│   │   ├── button.json  input.json  select.json  avatar*.json  tag*.json …
│   │   └── ...
│   ├── mobile-components/             # Mobile component tokens (96 files)
│   │   ├── avatar/                    # 5 files
│   │   ├── badge/                     # 1 file
│   │   ├── display/                   # 22 files (carousel, video-player, tile, …)
│   │   ├── feedback/                  # 1 file
│   │   ├── form/                      # 22 files (input, slider, otp, file-upload, …)
│   │   ├── header/                    # 4 files
│   │   ├── navigation/                # 8 files (tab, breadcrumb, footer, …)
│   │   ├── overlay/                   # 20 files (modal, menu, date-range, filter, …)
│   │   ├── progress/                  # 8 files (progress-indicator, progress-step)
│   │   ├── sub-account-switcher/      # 1 file
│   │   └── tag/                       # 4 files
│   ├── figma-mappings/               # Token → Figma variable mappings
│   └── Component Specific/           # Legacy component tokens (tag, Mode 1.json)
│
├── figma-mappings/                    # Generated mapping payloads (web + mobile)
│
├── ── Figma plugins ──
├── figma-plugin-token-sync/           # Sync tokens ↔ Figma variables
├── figma-plugin-apply-tokens/         # Apply component tokens to layers
├── figma-plugin-import-tokens/        # Import tokens + component-token-linker
├── figma-plugin-semantic-colors/      # Attach semantic color/shadow variables
│
├── token-visualizer/                  # Next.js app to browse/visualize tokens
│
├── scripts/                           # Generation + mapping automation
│   ├── token-generator.py             # Token generation automation
│   └── ...                            # Mapping + setup scripts and docs
└── remove_tokens_wrapper.py           # Utility script
```

> **Note:** `tokens/mobile-components/overlay/overlay/mobile-filter/` is a stray nested
> duplicate of `overlay/mobile-filter/` (4 files) and is slated for cleanup — it is **not**
> counted in the 96 canonical mobile files.

## 🧰 Tooling & Ecosystem

Beyond the token files themselves, the project now ships a supporting toolchain that
moves tokens between code and Figma and helps teams browse them:

| Tool | Purpose |
|------|---------|
| **`token-visualizer/`** | Next.js app to browse, search, and visualize the full token graph (primitive → semantic → component) |
| **`figma-plugin-token-sync/`** | Two-way sync between token JSON and Figma variables |
| **`figma-plugin-apply-tokens/`** | Apply component tokens directly to Figma layers |
| **`figma-plugin-import-tokens/`** | Import tokens into Figma; includes a `component-token-linker` |
| **`figma-plugin-semantic-colors/`** | Attach semantic color and shadow variables to Figma styles |
| **`figma-mappings/`** + **`scripts/`** | Generate token → Figma variable mapping payloads (web + mobile) |

See [`ACTION_PLAN.md`](./ACTION_PLAN.md) and [`scripts/README.md`](./scripts/README.md) for
the full Figma plugin setup workflow.

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
- [x] Existing token analysis (primitive + semantic foundation layers)
- [x] Component token template structure
- [x] Token generation automation scripts
- [x] File organization structure established

### 📈 **Component Status Summary**

#### **Completed Component Token Files (133 Files)**

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

**Mobile Components (96 files, organized by category folder):**

**Avatar (5):**
- ✅ `avatar.json`, `avatar-action-icon.json`, `avatar-company-indicator.json`, `avatar-mask.json`, `avatar-online-indicator.json`

**Badge (1):**
- ✅ `badge.json`

**Display (22):**
- ✅ Accordion: `accordion.json`
- ✅ Carousel (6): `carousel.json`, `carousel-arrow.json`, `carousel-dot-group.json`, `carousel-dot-indicator.json`, `carousel-number-indicator.json`, `carousel-empty-container.json`
- ✅ Video player (3): `video-player.json`, `video-player-controls.json`, `video-player-media.json`
- ✅ Notification (2): `notification.json`, `notification-action.json`
- ✅ Plus: `custom-slot.json`, `drag-item.json`, `empty state.json`, `icon.json`, `list-item.json`, `message-card.json`, `no-badge.json`, `system-alert.json`, `tile.json`, `tooltip.json`

**Feedback (1):**
- ✅ `empty-state.json`

**Form (22):**
- ✅ Core: `button.json`, `checkbox.json`, `radio.json`, `select.json`, `toggle.json`, `sliding-button.json`, `timed-button.json`
- ✅ Input (4): `input.json`, `input-form.json`, `input-form-label.json`, `input-form-hint-text.json`
- ✅ Stepper (2): `input-stepper.json`, `stepper-action.json`
- ✅ Slider (4): `slider.json`, `knob.json`, `knob-container.json`, `icon-knob.json`
- ✅ OTP (3): `otp-input-mobile.json`, `otp-input-field.json`, `otp-loader.json`
- ✅ Plus: `file-upload.json`, `text-area.json`

**Header (4):**
- ✅ `header.json`, `header-lite.json`, `header-lite-left.json`, `header-action-group.json`

**Navigation (8):**
- ✅ Tabs (2): `tab.json`, `tab-item.json`
- ✅ Content switcher (2): `content-switcher.json`, `content-switcher-item.json`
- ✅ Bottom nav (2): `bottom navigation bar.json`, `menu-item-navbar.json`
- ✅ Plus: `breadcrumb-item.json`, `mobile-footer.json`

**Overlay (20):**
- ✅ Modal (3): `modal.json`, `modal-header.json`, `modal-footer.json`
- ✅ Date/time range (5): `date-range-selector.json`, `date-time-range-picker.json`, `date-picker-footer.json`, `dates.json`, `dates-gap.json`
- ✅ Time picker (3): `pin-wheel-time-picker.json`, `stepper-time-picker.json`, `time-picker-android.json`
- ✅ Mobile filter (4): `mobile-filter.json`, `mobile-filter-base.json`, `filter-item.json`, `filter-sub-item.json`
- ✅ Menu (2): `menu.json`, `menu-item.json`
- ✅ Plus: `alert.json`, `popover.json`, `snackbar.json`

**Progress (8):**
- ✅ Indicator (5): `progress-indicator.json`, `progress-bar.json`, `progress-bar-intermediate.json`, `progress-circle.json`, `progress-pill.json`
- ✅ Step (3): `progress-step.json`, `progress-step-bar.json`, `single-step.json`

**Sub-account switcher (1):**
- ✅ `sub-account-switcher.json`

**Tag (4):**
- ✅ `tag.json`, `tag-close.json`, `tag-count.json`, `tag-loader.json`

#### **Progress Overview:**
```
Component Token Files: 133 completed
├── Web Components: 37 files
│   ├── Core/Interactive: 5 files (button, link-button, action-icon, icon, toggle)
│   ├── Form Components: 6 files (input, input-form, textarea, select, checkbox, radio)
│   ├── Avatar System: 7 files (avatar variants, indicators, group)
│   ├── Tag System: 5 files (tag, close, count, group, badge-group)
│   ├── Navigation: 9 files (tabs, dropdown, content-switcher, pagination)
│   ├── Feedback & Overlay: 3 files (alert, tooltip, inline-text-container)
│   └── Other: 2 files (action-group, time-picker)
└── Mobile Components: 96 files
    ├── Avatar: 5 files
    ├── Badge: 1 file
    ├── Display: 22 files (carousel, video-player, notification, tile, …)
    ├── Feedback: 1 file (empty-state)
    ├── Form: 22 files (input, slider, otp, file-upload, stepper, …)
    ├── Header: 4 files
    ├── Navigation: 8 files (tab, content-switcher, breadcrumb, footer, …)
    ├── Overlay: 20 files (modal, menu, date-range, time-picker, filter, …)
    ├── Progress: 8 files (indicator ×5, step ×3)
    ├── Sub-account switcher: 1 file
    └── Tag: 4 files
```

### 🎯 **Component Coverage**

| Component Category | Web Files | Mobile Files | Total | Status |
|-------------------|-----------|--------------|-------|---------|
| **Core/Interactive** | 5 files | 7 files | 12 files | ✅ Complete |
| **Forms** | 6 files | 22 files | 28 files | ✅ Complete |
| **Avatars** | 7 files | 5 files | 12 files | ✅ Complete |
| **Tags** | 5 files | 4 files | 9 files | ✅ Complete |
| **Badge** | - | 1 file | 1 file | ✅ Mobile complete |
| **Navigation** | 9 files | 8 files | 17 files | ✅ Complete |
| **Display** | - | 22 files | 22 files | ✅ Mobile complete |
| **Overlay/Modal** | - | 20 files | 20 files | ✅ Mobile complete |
| **Header** | - | 4 files | 4 files | ✅ Mobile complete |
| **Progress** | - | 8 files | 8 files | ✅ Mobile complete |
| **Feedback & Overlay (web)** | 3 files | - | 3 files | ✅ Web complete |
| **Sub-account switcher** | - | 1 file | 1 file | ✅ Mobile complete |
| **Other (web)** | 2 files | - | 2 files | ✅ Web complete |

### 📈 **Progress Metrics**
- **Primitive Tokens**: foundation layer complete (~3.9k-line source) ✅
- **Semantic Tokens**: foundation layer complete (~5.4k-line source, incl. semantic color scales) ✅
- **Component Token Files**: **133 files generated** ✅
  - Web components: 37 files
  - Mobile components: 96 files
  - Core/Interactive: 12 files (5 web + 7 mobile)
  - Form components: 28 files (6 web + 22 mobile)
  - Avatar system: 12 files (7 web + 5 mobile)
  - Tag system: 9 files (5 web + 4 mobile)
  - Navigation: 17 files (9 web + 8 mobile)
  - Display (mobile): 22 files
  - Overlay/Modal (mobile): 20 files
  - Progress (mobile): 8 files
  - Header (mobile): 4 files
  - Feedback & overlay (web): 3 files
  - Badge / Sub-account switcher (mobile): 2 files
  - Other (web): 2 files

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