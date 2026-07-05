# Token Retier Changes

## Open Questions (Review triage)

Rows flagged **Review** across all components, grouped by question type.

| Component | Name | Question |
|-----------|------|----------|
| Text Area | text-area/label/height | Label is a nested comp — do we need a separate token? |
| Text Area | text-area/label/gap | Label is a nested comp — do we need a separate token? |
| File Upload | file-upload/action-zone/icon/name | Icon name string variable — can remove? |
| File Upload | file-upload/action-zone/label/color/default | No label in component but variables exist |
| File Upload | file-upload/file-row/file-icon/variants | Variants need to be checked |
| File Upload | file-upload/progress-bar/height | Container with padding solves height — do we need this? |
| File Upload | file-upload/progress-bar/percent-label/alignment | Do we have align variables? |
| File Upload | file-upload/action-button/* (size, radius, icon, bg, icons, layout) | Nested comp — do we need these variables? |
| Filter Sub-Item | filter-sub-item/border/left/color | Says LEFT but applies to all sides |
| Filter Sub-Item | filter-sub-item/radio-row/height | Can we use hug weight instead of fixed variable? |
| Filter Sub-Item | filter-sub-item/label/color | Nested component — is this variable required? |
| Mobile Filter | header/clear-button/* | Nested clear button — needed? |
| Mobile Filter | header/close-button/* | Nested close button — needed? (icon/name is a string variable not required) |
| Mobile Filter | footer/save-button/* | Nested save button — needed? |
| Video Player | controls/time/color/text/ios | No equivalent text color |
| Time Picker | stepper-time-picker/step-button/icon | String variables (increment/decrement) |
| Time Picker | pin-wheel/android ok button color & background | Text property variable {color.primary.600} |
| Time Picker | time-picker-android/footer/mode-icon/* | String variables (keyboard/clock) |

## Mobile Footer

| Name | Current | Semantic | Status | Comments |
|------|---------|----------|--------|----------|
| mobile-footer/bg | color/neutral/white/base | color/background/neutral/base | Updated | Applied |
| mobile-footer/padding | size/4 | padding/lg | Updated | Applied |
| mobile-footer/width | 393 | — | Raw value | No matching size |
| mobile-footer/border-top/width | 1 | border/width/default | Updated | Applied |
| mobile-footer/border-top/color | color/neutral/gray/200 | color/border/neutral/subtle/2 | Updated | Applied (renamed from border-top) |
| mobile-footer/button-area/gap | size/4 | gap/xl | Updated | Applied |
| mobile-footer/button-area/button-width | — | — | Review | Do we need this variable? |
| mobile-footer/home-indicator/bg | color/neutral/white/base | color/background/neutral/base | Updated | Applied |
| mobile-footer/home-indicator/height | 34 | — | Raw value | No matching size |

### Grabber

| Name | Current | Semantic | Status | Comments |
|------|---------|----------|--------|----------|
| mobile-footer/home-indicator/grabber/width | 134 | — | Raw value | We do not have this width |
| mobile-footer/home-indicator/grabber/height | 5 | — | Raw value | We do not have this height |
| mobile-footer/home-indicator/grabber/bottom-offset | — | — | Unused | Unused variable |

## Text Area

| Name | Current | Semantic | Status | Comments |
|------|---------|----------|--------|----------|
| text-area/container/gap | size/1 | gap/3xs | Updated | Applied |
| text-area/container/width | 361 | — | Removed | Token removed (not in Figma) |
| text-area/field/height | size/60–240 | — | Raw value | We do not have this size |
| text-area/field/padding | padding/2 | padding/2xs | Updated | Applied |
| text-area/field/width | 100 | — | Removed | Token removed (unused) |
| text-area/field/border/radius | border/radius/1 [5] | border/radius/sm | Updated | Applied |
| text-area/field/border/width/active | 3 | border/width/0[75] | Updated | Applied |
| text-area/label/height | size/6 | size/height/3xs | Updated | Applied |
| text-area/label/gap | size/1 | gap/3xs | Updated | Applied |
| text-area/label/text/color/mandatory | — | — | Removed | Token removed (broken) |
| text-area/label/info-icon/size | — | size/icon/3xs | Retier | |
| text-area/character-count/alignment | right | — | Removed | Token removed (not in Figma) |
| text-area/field/shadow/default | boxShadow/outer/xs | — | Removed | Token removed (not in Figma) |
| text-area/field/shadow/active | none | — | Removed | Token removed (not in Figma) |
| text-area/value/height | — | fill | Component change | |

> Note: Label component is from the HighRise library.

## File Upload

> Note: File upload action-zone icon got swapped.

| Name | Current | Semantic | Status | Comments |
|------|---------|----------|--------|----------|
| file-upload/container/gap/with-files | size/2 | gap/xs | Retier | |
| file-upload/container/gap/without-files | 0 | gap/none | Retier | |
| file-upload/action-zone/padding | size/2 | padding/2xs | Retier | |
| file-upload/action-zone/gap | size/1 | gap/3xs | Retier | |
| file-upload/action-zone/background/default | color/neutral/white/base | color/background/neutral/base | Retier | |
| file-upload/action-zone/background/disabled | color/neutral/gray/50 | color/bg/neutral/subtle/0 | Retier | |
| file-upload/action-zone/icon-container/size | size/9 | size/icon/3xl | Retier | |
| file-upload/action-zone/icon-container/background | color/neutral/gray/100 | color/bg/neutral/subtle/1 | Retier | |
| file-upload/action-zone/icon/size | size/5 | size/icon/md | Retier | |
| file-upload/action-zone/icon/name | — | — | Review | Icon name variable — can remove? |
| file-upload/action-zone/label/color/default | — | — | Review | No label in component but variables exist |
| file-upload/action-zone/label/color/disabled | color/neutral/gray/400 | color/text/neutral/subtitle/2 | Retier | |
| file-upload/action-zone/border/width | 1 | border/width/default | Retier | |
| file-upload/action-zone/border/color/active | color/primary/600 | — | Broken | Broken due to text variable |
| file-upload/action-zone/border/color/default | color/background/neutral/subtle/2 | color/border/neutral/subtle/2 | Retier | |
| file-upload/file-row/padding | size/2 | padding/2xs | Retier | |
| file-upload/file-row/gap/icon-to-content | size/1 | gap/3xs | Retier | |
| file-upload/file-row/gap/text-to-actions | size/2 | gap/xs | Retier | |
| file-upload/file-row/gap/header-to-progress | size/1 | gap/3xs | Retier | |
| file-upload/file-row/gap/title-to-description | 2 | gap/4xs | Retier | |
| file-upload/file-row/background/default | color/neutral/white/base | color/background/neutral/base | Retier | |
| file-upload/file-row/background/error | color/sec/25/base | color/background/error/inactive | Retier | |
| file-upload/file-row/file-icon/size | size/8 | size/xs | Retier | |
| file-upload/file-row/file-icon/variants | default \| success \| success-disabled \| error | — | Review | Needs to be checked |
| file-upload/file-row/title/color/error | color/sec/error/600 | color/text/error/body/2 | Retier | |
| file-upload/file-row/description/color/error | color/sec/error/700 | color/text/error/body/1 | Retier | |
| file-upload/file-row/border/width | 1 | border/width/default | Retier | |
| file-upload/file-row/border/color/default | color/bg/neutral/subtle/2 | color/border/neutral/subtle/2 | Retier | |
| file-upload/file-row/border/color/error | color/sec/error/300 | color/border/error/moderate/0 | Retier | |
| file-upload/progress-bar/height | size/2 | — | Review | Container with padding solves height — do we need this? |
| file-upload/progress-bar/percent-label/width | 32 | size/width/xs | Retier | |
| file-upload/progress-bar/percent-label/alignment | right | — | Review | Do we have align variables? |
| file-upload/progress-bar/fill/color | {color.primary.600} | color/bg/primary/default | Retier | Was string variable; created color variable |
| file-upload/action-button/size | size/9 | — | Review | Nested comp — do we need the button size variable? |
| file-upload/action-button/border-radius | full | — | Review | Nested comp — do we need this variable? |
| file-upload/action-button/icon/size | size/5 | — | Review | Nested comp — do we need this variable? |
| file-upload/action-button/background/default | gray/100 | — | Review | Nested comp — do we need this variable? |
| file-upload/action-button/background/success | success/100 | — | Review | Nested comp — do we need this variable? |
| file-upload/action-button/background/error | error/100 | — | Review | Nested comp — do we need this variable? |
| file-upload/action-button/icons/delete,success,retry | trash-01 | — | Review | Do we need this variable? |
| file-upload/action-button/layout/by-state | — | — | Review | Do we need this variable? |

## Mobile Filter

> Note: Footer got swapped with the in-file component. Header component is not aligned with the theme.

### Filter Item

| Name | Current | Semantic | Status | Comments |
|------|---------|----------|--------|----------|
| filter-item/height | size/14 | size/height/2xl | Updated | Applied |
| filter-item/gap | size/2 | gap/4xs | Updated | Applied |
| filter-item/padding/horizontal | 14 | padding/md | Updated | Applied |
| filter-item/padding/vertical | size/2 | padding/2xs | Updated | Applied |
| filter-item/background/default | color/neu/white/base | color/bg/neutral/base | Updated | Applied |
| filter-item/background/selected | color/pri/blue/50 | color/bg/primary/subtle/0 | Updated | Applied |
| filter-item/border/width | 3 | — | Raw value | We do not have this width size |
| filter-item/border/color/selected | color/primary/blue/600 | color/border/pri/default | Updated | Applied |
| filter-item/label/color/default | color/neu/gray/700 | color/text/neutral/body/1 | Updated | Applied |
| filter-item/label/color/selected | color/pri/blue/700 | color/text/primary/body/1 | Updated | Applied |

### Filter Sub-Item

| Name | Current | Semantic | Status | Comments |
|------|---------|----------|--------|----------|
| filter-sub-item/height | size/14 | size/height/2xl | Updated | Applied |
| filter-sub-item/width | 172 | — | Raw value | We do not have this width size |
| filter-sub-item/gap | size/2 | gap/xs | Updated | Applied |
| filter-sub-item/background | color/neu/white/base | color/bg/neutral/base | Updated | Applied |
| filter-sub-item/padding/horizontal | 14 | padding/md | Updated | Applied |
| filter-sub-item/padding/vertical | size/2 | padding/2xs | Updated | Applied |
| filter-sub-item/border/left/color | — | — | Review | Says LEFT but applies to all sides |
| filter-sub-item/border/left/width | 1 | border/width/default | Updated | Applied |
| filter-sub-item/border/left/color | color/neutral/grey/200 | color/border/neutral/subtle/2 | Updated | Applied |
| filter-sub-item/radio-row/gap | size/1 | gap/3xs | Updated | Applied |
| filter-sub-item/radio-row/height | size/5 | size/height/4xs | Review | Can we use hug weight instead of fixed variable? |
| filter-sub-item/label/color | color/neutral/gray/900 | color/text/neutral/title/1 | Review | Nested component — is this variable required? |

### Mobile Filter Base

| Name | Current | Semantic | Status | Comments |
|------|---------|----------|--------|----------|
| border/width | 1 | border/width/default | Updated | Applied |
| border/color | color/neutral/gray/200 | color/border/neutral/subtle/2 | Updated | Applied |
| left-column/width | 189 | — | Raw value | We do not have this width |
| right-column/width | 172 | — | Raw value | We do not have this width |

### Mobile Filter

| Name | Current | Semantic | Status | Comments |
|------|---------|----------|--------|----------|
| width | 393 | — | Raw value | We do not have this width |
| background | color/neutral/white/base | color/background/neutral/base | Updated | Applied |
| border/width | 1 | border/width/default | Updated | Applied |
| border/color | color/neutral/grey/100 | color/border/neutral/subtle/1 | Updated | Applied |
| header/gap | size/2 | gap/xs | Updated | Applied |
| header/padding/top | 12 | padding/sm | Updated | Applied |
| header/padding/horizontal | size/4 | padding/lg | Updated | Applied |
| header/drag-handle/width | 69 | — | Raw value | We do not have this width |
| header/drag-handle/height | size/2 | — | Raw value | No t-shirt size match |
| header/drag-handle/color | color/neutral/gray/200 | color/background/neutral/subtle/2 | Updated | Applied |
| header/title/color | color/neutral/gray/900 | color/text/neutral/title/1 | Updated | Applied |
| header/clear-button/background | color/neutral/white/base | color/background/neutral/base | Review | Nested clear button — needed? |
| header/clear-button/border/width | 1 | border/width/default | Review | Nested clear button — needed? |
| header/clear-button/border/color | color/neutral/gray/300 | color/border/neutral/default | Review | Nested clear button — needed? |
| header/clear-button/padding/horizontal | 14 | padding/md | Review | Nested clear button — needed? |
| header/clear-button/padding/vertical | size/2 | padding/2xs | Review | Nested clear button — needed? |
| header/clear-button/label/color | color/neutral/gray/700 | color/text/neutral/body/1 | Review | Nested clear button — needed? |
| header/close-button/size | 40 | size/md | Review | Nested close button — needed? |
| header/close-button/background | color/neutral/gray/100 | color/background/neutral/subtle/1 | Review | Nested close button — needed? |
| header/close-button/icon/name | — | — | Review | String variable not required |
| header/close-button/icon/size | size/6 | size/icon/lg | Updated | Applied |
| body/background | neutral/white/base | background/neutral/base | Updated | Applied |
| body/padding | size/4 | padding/lg | Updated | Applied |
| footer/padding/horizontal | size/4 | padding/lg | Updated | Applied |
| footer/padding/top | 12 | padding/sm | Updated | Applied |
| footer/padding/bottom | size/8 | — | Raw value | Padding size not available |
| footer/save-button/padding/horizontal | 14 | padding/md | Review | Nested save button — needed? |
| footer/save-button/padding/vertical | size/2 | padding/2xs | Review | Nested save button — needed? |
| footer/save-button/label/color | color/neutral/gray/700 | color/text/neutral/body/1 | Review | Nested save button — needed? |
| footer/apply-button/background | color/primary/blue/600 | color/background/primary/default | Updated | Applied |
| footer/apply-button/border/width | 1 | border/width/default | Updated | Applied |
| footer/apply-button/border/color | color/primary/blue/600 | color/border/primary/default | Updated | Applied |
| footer/apply-button/padding/horizontal | 14 | padding/md | Updated | Applied |
| footer/apply-button/padding/vertical | size/2 | padding/2xs | Updated | Applied |
| footer/apply-button/label/color | color/neutral/white/base | color/text/neutral/base | Updated | Applied |
| footer/apply-button/icon/size | size/5 | size/icon/md | Updated | Applied |

## Breadcrumb

> Note: Breadcrumb component is missing.

| Name | Current | Semantic | Status | Comments |
|------|---------|----------|--------|----------|
| breadcrumb-item/icon/color/default | color/neutral/gray/800 | color/icon/neutral/intense/0 | Retier | |
| breadcrumb-item/icon/size | 24 | size/icon/lg | Retier | |
| breadcrumb-item/gap | 6 | gap/2xs | Retier | |
| breadcrumb-item/icon/color/selected | color/primary/blue/700 | color/icon/primary/default | Retier | |
| breadcrumb-item/chevron/size | 18 | — | Raw value | We do not have this size |
| breadcrumb-item/chevron/color | neutral/gray/800 | color/icon/neutral/intense/0 | Retier | |
| breadcrumb-item/label/color/default | neutral/gray/800 | color/text/neutral/title/2 | Retier | |
| breadcrumb-item/label/color/selected | color/primary/blue/700 | color/text/primary/body/1 | Retier | |

## Video Player

> Note: Icons are from the HighRise library.

### Video Player Controls

| Name | Current | Semantic | Status | Platform | Comments |
|------|---------|----------|--------|----------|----------|
| controls/icon-button/border/radius | 16 | border/radius/2xl | Retier | All | |
| controls/icon-button/color/background/ios | f2f4f7 20% | — | Raw value | iOS | |
| controls/progress/gap | gap/1 | gap/3xs | Retier | All | |
| controls/progress/width | 320 | — | Raw value | All | We do not have this width |
| controls/progress/padding/horizontal | padding/2 | padding/2xs | Retier | All | |
| controls/progress/padding/vertical | padding/1 | padding/4xs | Retier | All | |
| controls/progress/color/background/ios | ffffff 20% | — | Raw value | iOS | |
| controls/progress/border/radius | 16 | border/radius/2xl | Retier | All | |
| controls/time/gap | gap/0[5] | gap/4xs | Retier | All | |
| controls/time/padding/horizontal | padding/2 | padding/2xs | Retier | All | |
| controls/time/border/radius | 11 | — | Raw value | All | We do not have this radius |
| controls/time/color/background/ios | f2f4f7 20% | — | Raw value | iOS | |
| controls/time/color/text/ios | background/neutral/subtle/1 | — | Review | iOS | No equivalent text color |

### Video Player Media

| Name | Current | Semantic | Status | Platform | Comments |
|------|---------|----------|--------|----------|----------|
| media/error/label/gap | gap/0[5] | gap/4xs | Retier | All | |
| media/error/label/padding/horizontal | padding/2 | padding/2xs | Retier | All | |
| media/error/label/border/radius | 11 | — | Raw value | All | We do not have this radius |
| media/error/label/position/top | 123 | — | Raw value | All | We do not have this top |
| media/error/overlay/color/background | #000000 50% | — | Raw value | All | We do not have this bg |
| media/container/width | 361 | — | Raw value | All | We do not have this width |
| media/container/height | 233 | — | Raw value | All | We do not have this height |

### Video Player

| Name | Current | Semantic | Status | Platform | Comments |
|------|---------|----------|--------|----------|----------|
| video-player/controls/inset/edge | padding/2 | padding/2xs | Retier | All | |
| video-player/controls/time/position/left | padding/2 | padding/2xs | Retier | All | |
| video-player/controls/time/position/top | 169 | — | Raw value | All | We do not have this size |
| video-player/controls/center/position/horizontal | 50 | — | Raw value | All | We do not have this size |
| video-player/controls/center/position/vertical | 50 | — | Raw value | All | We do not have this vertical |
| video-player/container/width | 361 | — | Raw value | All | We do not have this width |
| video-player/container/height | 233 | — | Raw value | All | We do not have this height |
| video-player/progress-overlay/width | 345 | — | Raw value | All | We do not have this width |
| video-player/progress-overlay/padding/horizontal | padding/2 | padding/2xs | Retier | All | |
| video-player/progress-overlay/padding/vertical | padding/1 | padding/4xs | Retier | All | |
| video-player/progress-overlay/position/bottom | padding/2 | padding/2xs | Retier | All | |
| video-player/progress-overlay/position/left | padding/2 | padding/2xs | Retier | All | |
| video-player/progress-overlay/border/radius | 16 | border/radius/2xl | Retier | All | |
| video-player/progress-overlay/color/background/ios | ffffff 10% | — | Raw value | iOS | |

## Time Picker

### Stepper Time Picker

| Name | Current | Semantic | Status | Platform | Comments |
|------|---------|----------|--------|----------|----------|
| stepper-time-picker/step-button/icon | increment/decrement | — | Review | All | String variables |

### Pin Wheel Time Picker

| Name | Current | Semantic | Status | Platform | Comments |
|------|---------|----------|--------|----------|----------|
| pin-wheel-time-picker/item/text-color/selected | {color.primary.600} | — | Review | iOS | Text property variable |
| pin-wheel-time-picker/column/width | 89 | — | Raw value | iOS | |
| pin-wheel-time-picker/am-pm-column/hidden-slot-opacity | 0 | — | Raw value | iOS | |

### Time Picker Android

| Name | Current | Semantic | Status | Platform | Comments |
|------|---------|----------|--------|----------|----------|
| time-picker-android/width | 280 | — | Raw value | Android | |
| time-picker-android/footer/button-group/ok/border/color | {color.primary.600} | — | Review | Android | Text property variable |
| time-picker-android/footer/button-group/ok/background | {color.primary.600} | — | Review | Android | Text property variable |
| time-picker-android/footer/mode-icon/dial-mode-icon | keyboard | — | Review | Android | String variable |
| time-picker-android/footer/mode-icon/input-mode-icon | clock | — | Review | Android | String variable |
| time-picker-android/clock/hour-label/font-size | 16 | — | Typography | Android | Consolidate into typography token |
| time-picker-android/clock/hour-label/line-height | 24 | — | Typography | Android | Consolidate into typography token |
| time-picker-android/clock/hour-label/letter-spacing | -0.3125 | — | Typography | Android | Consolidate into typography token |
| time-picker-android/clock/selection-bubble/size | 31 | — | Raw value | Android | Size not available |
| time-picker-android/clock/selection-bubble/font-size | 16 | — | Raw value | Android | Variable not available |
| time-picker-android/clock/selection-bubble/line-height | 24 | — | Raw value | Android | Variable not available |
| time-picker-android/clock/center-dot/size | 12 | size/height/6xs | Retier | Android | |
| time-picker-android/footer/gap | 32 | — | Raw value | Android | Gap variable not available |
