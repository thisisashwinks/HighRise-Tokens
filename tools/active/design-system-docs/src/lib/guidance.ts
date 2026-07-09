import type { ComponentDoc } from "./data";

export interface PropRowLite {
  name: string;
  options: string;
  defaultValue: string;
  description: string;
}

export interface Guidance {
  /** Authored overview paragraph — used when token metadata is thin, or to lead the Overview tab. */
  overview?: string;
  whenToUse: string[];
  whenNotToUse: string[];
  dos: string[];
  donts: string[];
  /** Fallback props table for components with no variants metadata in the token source. */
  props?: PropRowLite[];
  authored: boolean;
}

type Entry = Omit<Guidance, "authored">;

// Hand-authored guidance for every main component, keyed by slug.
const AUTHORED: Record<string, Entry> = {
  "form--button": {
    overview:
      "Button is the workhorse action component: it triggers operations, submits forms, and opens flows. The variant ladder — primary, secondary, tertiary, link — maps directly to visual hierarchy, and every interaction state (hover, pressed, focused, disabled, loading) is wired through component tokens, making it the most heavily tokenized component in the system.",
    whenToUse: [
      "Any discrete action: submit, save, confirm, open a flow, trigger an operation.",
      "Primary variant for the single most important action on a screen.",
      "Destructive variant for actions that delete or cannot be undone.",
    ],
    whenNotToUse: [
      "Navigation that behaves like a hyperlink — use a link or link variant instead.",
      "Toggling a persistent state — use a toggle or content switcher.",
      "Icon-only actions in dense toolbars — use an action icon with a tooltip.",
    ],
    dos: [
      "Write verb-first labels: \"Save changes\", \"Add contact\", \"Try again\".",
      "Use one primary button per view; everything else steps down in prominence.",
      "Show the loading state on the button itself so the pressed action stays visible.",
    ],
    donts: [
      "Don't label buttons \"Submit\", \"OK\", or \"Click here\".",
      "Don't use the destructive style for emphasis — it means data loss.",
      "Don't restyle button internals; every state is wired through component tokens.",
    ],
    props: [
      { name: "variant", options: "primary | secondary | tertiary | destructive | link", defaultValue: "primary", description: "Position in the visual hierarchy ladder." },
      { name: "size", options: "sm | md | lg", defaultValue: "md", description: "Control height from the token size scale." },
      { name: "icon", options: "leading | trailing | only | none", defaultValue: "none", description: "Optional icon placement; icon-only requires an accessible label." },
      { name: "loading", options: "boolean", defaultValue: "false", description: "Replaces the label with a spinner while the action is in flight." },
      { name: "disabled", options: "boolean", defaultValue: "false", description: "Non-interactive state; explain how to enable it nearby." },
    ],
  },
  "form--input": {
    whenToUse: [
      "Free-form, single-line text: names, emails, URLs, amounts, search terms.",
      "With a label above and hint text below, wired through the input form wrapper.",
      "With leading or trailing icons for affordances such as search or clear.",
    ],
    whenNotToUse: [
      "Multi-line content — use the text area.",
      "A constrained set of options — use a select or radio group.",
      "Dates and times — use the date picker or time picker.",
    ],
    dos: [
      "Always pair with a visible label; placeholders are not labels.",
      "Use the error state plus hint text to explain how to fix invalid input.",
      "Match keyboard type to content on mobile (email, numeric, URL).",
    ],
    donts: [
      "Don't use placeholder text to carry required information — it disappears on focus.",
      "Don't validate on every keystroke before the user finishes typing.",
      "Don't shrink the touch target below the default height to save space.",
    ],
  },
  "form--input-form": {
    whenToUse: [
      "Wrapping any input with its label and hint so spacing and states stay consistent.",
      "Form-level validation messaging under the control it belongs to.",
    ],
    whenNotToUse: [
      "Standalone search fields where a label would be noise — the input alone is fine.",
      "Error summaries for a whole form — use an alert at the top instead.",
    ],
    dos: [
      "Keep hint text to one short, factual line.",
      "Write error messages that say how to fix the problem.",
    ],
    donts: [
      "Don't stack multiple hints under one field.",
      "Don't show raw error codes — translate them to plain language.",
    ],
  },
  "form--checkbox": {
    whenToUse: [
      "Selecting zero, one, or many items from a list.",
      "Opt-ins that take effect on submit — terms acceptance, preferences in a form.",
      "Parent/child selection trees, using the indeterminate state on the parent.",
    ],
    whenNotToUse: [
      "Instant-effect settings — use a toggle.",
      "Mutually exclusive choices — use radio buttons.",
    ],
    dos: [
      "Make the label clickable, not just the box.",
      "Phrase labels positively (\"Send me updates\") to avoid double negatives.",
      "Use indeterminate only as a mixed-selection display state, never as a third choice.",
    ],
    donts: [
      "Don't phrase labels as negatives — double negatives confuse the checked state.",
      "Don't mix checkboxes and radios in one visual group.",
      "Don't trigger immediate irreversible actions from a checkbox.",
    ],
  },
  "form--radio": {
    whenToUse: [
      "Choosing exactly one option from 2–5 visible, comparable choices.",
      "When users benefit from seeing all options at once — plans, shipping speeds.",
    ],
    whenNotToUse: [
      "More than ~5 options — use a select.",
      "Multi-select — use checkboxes.",
      "Binary on/off — use a toggle or single checkbox.",
    ],
    dos: [
      "Select a sensible default where one exists.",
      "Keep option labels parallel and scannable.",
      "Stack options vertically for easier scanning.",
    ],
    donts: [
      "Don't use radios for options that are not mutually exclusive.",
      "Don't mix radios and checkboxes in one group.",
    ],
  },
  "form--toggle": {
    whenToUse: [
      "A binary setting that takes effect immediately — notifications on/off, dark mode.",
      "Settings screens where each row is an independent switch.",
    ],
    whenNotToUse: [
      "Choices that only apply after a save — use a checkbox so the deferred effect is clear.",
      "Mutually exclusive options — use radio buttons or a content switcher.",
    ],
    dos: [
      "Apply the change instantly when toggled; that immediacy is the contract of a switch.",
      "Label the setting, not the state (\"Email notifications\", not \"Enabled\").",
      "Use the loading knob state when the change needs a round trip.",
    ],
    donts: [
      "Don't pair a toggle with a save button — that's a checkbox.",
      "Don't use ambiguous labels where the on state is unclear.",
      "Don't use a toggle for one-shot actions — use a button.",
    ],
  },
  "form--select": {
    whenToUse: [
      "Choosing one option from a list of roughly 5 or more items.",
      "When the default option is a sensible answer for most users.",
      "When screen space is too tight for radio buttons.",
    ],
    whenNotToUse: [
      "4 or fewer options users should compare at a glance — use radio buttons.",
      "Binary on/off state — use a toggle or checkbox.",
      "Very long lists users would scroll blindly — use the searchable variant.",
    ],
    dos: [
      "Order options logically — alphabetical, by frequency, or by workflow.",
      "Use a meaningful default rather than an empty state where possible.",
    ],
    donts: [
      "Don't hide the only two possible values in a dropdown.",
      "Don't use a select for navigation or actions.",
    ],
  },
  "form--text-area": {
    whenToUse: [
      "Multi-line free text: notes, descriptions, messages.",
      "With a character counter when a hard limit exists.",
    ],
    whenNotToUse: [
      "Single-line values — use the input field.",
      "Rich formatting needs — that's a rich text editor.",
    ],
    dos: [
      "Size the default height to the expected content, not the maximum.",
      "Show remaining characters as the user approaches the limit.",
    ],
    donts: [
      "Don't use a text area for short single-line answers.",
      "Don't cut input silently at the limit — show the counter.",
    ],
  },
  "form--input-stepper": {
    whenToUse: [
      "Small numeric adjustments within a narrow range — quantities, seats, counts.",
      "Values users nudge up or down rather than type.",
    ],
    whenNotToUse: [
      "Wide ranges where typing is faster — use a numeric input.",
      "Continuous values — use a slider.",
    ],
    dos: [
      "Disable the decrement/increment button at the range boundary.",
      "Let users type directly in the value for large jumps.",
    ],
    donts: [
      "Don't use a stepper for values spanning hundreds of steps.",
      "Don't hide the allowed range — surface min and max.",
    ],
  },
  "form--slider": {
    whenToUse: [
      "Selecting a value in a continuous or dense range where precision is secondary — volume, budget, radius.",
      "With the value tooltip so the current selection is always visible.",
    ],
    whenNotToUse: [
      "Values requiring exact entry — use a numeric input or stepper.",
      "Ranges with only a handful of steps — use a content switcher or radios.",
    ],
    dos: [
      "Show the current value near the knob while dragging.",
      "Label both ends of the range.",
    ],
    donts: [
      "Don't use a slider when the exact value matters.",
      "Don't make the track so short that single units are unreachable.",
    ],
  },
  "form--sliding-button": {
    whenToUse: [
      "High-consequence confirmations where an accidental tap is costly — sending payments, going live.",
      "Single-handed mobile flows where a deliberate gesture beats a two-step confirm.",
    ],
    whenNotToUse: [
      "Routine actions — the gesture cost is not justified.",
      "Anywhere a standard confirm dialog is expected by convention.",
    ],
    dos: [
      "Say what completing the slide does: \"Slide to send payment\".",
      "Snap back with feedback when the slide is not completed.",
    ],
    donts: [
      "Don't use it as a novelty for low-stakes actions.",
      "Don't combine it with a confirmation modal — one deliberate step is enough.",
    ],
    props: [
      { name: "state", options: "default | sliding | success | disabled", defaultValue: "default", description: "Interaction state of the slide track." },
      { name: "label", options: "string", defaultValue: "—", description: "Outcome-first instruction, e.g. \"Slide to confirm\"." },
    ],
  },
  "form--timed-button": {
    whenToUse: [
      "Undo windows — the action commits when the countdown ends.",
      "Rate-limited actions such as resending a verification code.",
    ],
    whenNotToUse: [
      "Actions with no time dimension — use a standard button.",
      "Critical decisions — never auto-commit something destructive on a timer.",
    ],
    dos: [
      "Show the remaining time in or next to the button.",
      "Let the user act early once the timer allows it.",
    ],
    donts: [
      "Don't auto-trigger destructive actions when the timer expires.",
      "Don't reset the countdown without telling the user why.",
    ],
  },
  "form--file-upload": {
    whenToUse: [
      "Attaching documents or images from the device — with camera and library sources on mobile.",
      "Multi-file uploads with per-file progress and remove affordances.",
    ],
    whenNotToUse: [
      "Profile photos with cropping — use the avatar action icon flow.",
      "Huge files better handled by a link or integration.",
    ],
    dos: [
      "State accepted formats and the size limit up front (PNG or JPG, up to 25 MB).",
      "Show per-file progress and allow cancel during upload.",
      "Explain failures and keep the failed file listed with a retry.",
    ],
    donts: [
      "Don't reject a file without saying which constraint it broke.",
      "Don't clear already-uploaded files when one file fails.",
    ],
  },
  "form--otp-input": {
    overview:
      "OTP input captures one-time verification codes with one box per digit. Focus advances automatically as digits are entered, paste fills the whole code, and the error state colors the entire group with a message beneath.",
    whenToUse: [
      "Verification codes from SMS or email — one box per digit, auto-advancing.",
      "Two-factor prompts where the code length is fixed and known.",
    ],
    whenNotToUse: [
      "Passwords or free-form secrets — use a standard input with masking.",
      "Codes longer than ~8 characters — use a single input field.",
    ],
    dos: [
      "Support paste across the whole group.",
      "Pair with a timed resend button.",
      "Keep the error message next to the group and preserve entered digits.",
    ],
    donts: [
      "Don't clear the code silently on failure.",
      "Don't require tapping each box individually.",
    ],
    props: [
      { name: "length", options: "4 | 6", defaultValue: "6", description: "Number of code digits." },
      { name: "state", options: "default | focus | error | success", defaultValue: "default", description: "Validation state applied to the whole group." },
      { name: "loader", options: "boolean", defaultValue: "false", description: "Shows the verification loader while the code is checked." },
    ],
  },
  "overlay--modal": {
    whenToUse: [
      "Blocking decisions the user must resolve before continuing — confirm a deletion, discard unsaved changes.",
      "Short, focused tasks that benefit from isolation, such as a 2–3 field form or a picker.",
      "Bottom-sheet form for mobile-native flows; dialogue form for centered confirmations.",
    ],
    whenNotToUse: [
      "Non-blocking status updates — use a snackbar so the user keeps context.",
      "Long or multi-step flows — navigate to a full screen instead.",
      "Anything that opens on page load without a user action.",
    ],
    dos: [
      "Give the modal one job and one primary action.",
      "Let the footer buttons state the outcome — \"Delete contact\", not \"OK\".",
      "Match the type variant to the consequence: destructive for deletes, warning for risky.",
    ],
    donts: [
      "Don't stack modals on modals.",
      "Don't hide the cancel path; every modal needs an obvious way out.",
      "Don't put dismissible marketing content in a blocking dialog.",
    ],
  },
  "overlay--snackbar": {
    whenToUse: [
      "Non-blocking feedback after an action: saved, sent, copied, deleted.",
      "Undo affordances for reversible destructive actions.",
      "Transient errors with a retry affordance.",
    ],
    whenNotToUse: [
      "Critical blocking decisions — use a modal; a snackbar can be missed.",
      "Persistent state the user needs to reference — use an inline alert.",
    ],
    dos: [
      "Write the message as a completed fact: \"Contact added\".",
      "Offer at most one action (\"Undo\", \"Retry\").",
      "Auto-dismiss after a few seconds.",
    ],
    donts: [
      "Don't stack multiple snackbars.",
      "Don't put irreversible confirmations in a snackbar.",
      "Don't rely on a snackbar as the only record of an error.",
    ],
  },
  "overlay--alert": {
    whenToUse: [
      "Persistent, contextual messaging inside a screen — trial ending, import finished, payment failed.",
      "Semantic tones (info, success, warning, error) mapped to real state.",
    ],
    whenNotToUse: [
      "Transient feedback — use a snackbar.",
      "App-wide conditions — use the system alert banner.",
    ],
    dos: [
      "Lead with the consequence, then the fix: \"Payment failed. Update your card to retry.\"",
      "Keep at most two actions, primary first.",
    ],
    donts: [
      "Don't show raw error codes or stack traces.",
      "Don't use the error tone for emphasis when nothing is wrong.",
    ],
  },
  "overlay--menu": {
    whenToUse: [
      "A short list of contextual actions behind an overflow affordance.",
      "Secondary actions that would clutter the surface as visible buttons.",
    ],
    whenNotToUse: [
      "Choosing a form value — use a select.",
      "More than ~8 actions — restructure or move to a full screen.",
    ],
    dos: [
      "Order items by frequency of use, destructive actions last.",
      "Style destructive items with the error text token so they read as dangerous.",
      "Use icons consistently — all items or none.",
    ],
    donts: [
      "Don't nest submenus on mobile.",
      "Don't hide the only way to do something important in an overflow menu.",
    ],
    props: [
      { name: "items", options: "MenuItem[]", defaultValue: "—", description: "Ordered list of actions; destructive items last." },
      { name: "icons", options: "boolean", defaultValue: "true", description: "Leading icons — used for all items or none." },
    ],
  },
  "overlay--popover": {
    whenToUse: [
      "Rich contextual content anchored to a trigger: small forms, detail previews, coach marks.",
      "When content is too rich for a tooltip but too light for a modal.",
    ],
    whenNotToUse: [
      "Plain text hints — use a tooltip.",
      "Blocking decisions — use a modal.",
    ],
    dos: [
      "Anchor to the triggering element and dismiss on outside tap.",
      "Keep it to one focused task.",
    ],
    donts: [
      "Don't open popovers from popovers.",
      "Don't trap focus without an obvious close.",
    ],
  },
  "overlay--mobile-filter": {
    overview:
      "Filter opens a bottom sheet of filter groups and persists applied filters as removable chips above the list. Filter items expand into sub-items for nested criteria, and the base sheet handles apply and clear actions.",
    whenToUse: [
      "Narrowing long lists by multiple criteria — status, owner, date.",
      "When applied filters must stay visible and individually removable.",
    ],
    whenNotToUse: [
      "A single toggle-like refinement — use a content switcher or segmented control.",
      "Full search — pair with the search input instead.",
    ],
    dos: [
      "Show applied filters as chips the user can remove one by one.",
      "Offer \"Clear all\" whenever two or more filters are active.",
      "Show the result count before applying where possible.",
    ],
    donts: [
      "Don't reset the user's filters on navigation without warning.",
      "Don't bury the apply button below the fold of the sheet.",
    ],
    props: [
      { name: "sections", options: "FilterSection[]", defaultValue: "—", description: "Filter groups shown in the sheet; each expands to its items." },
      { name: "applied", options: "FilterChip[]", defaultValue: "[]", description: "Currently applied filters rendered as removable chips." },
    ],
  },
  "overlay--time-picker": {
    overview:
      "Time picker captures a time of day in 12-hour format. Three variants share one token set: the Android-style dial/keyboard picker, a pin-wheel for native-feeling scroll selection, and a stepper for precise hour and minute adjustment.",
    whenToUse: [
      "Scheduling — appointments, reminders, send times.",
      "Pin wheel for quick approximate times; stepper when exact minutes matter.",
    ],
    whenNotToUse: [
      "Durations — use a stepper or input with units instead of a clock time.",
      "Dates and times together — pair with the date picker in one flow.",
    ],
    dos: [
      "Use 12-hour time with a space before AM/PM (3:00 PM).",
      "Default to a sensible time, such as the next round half hour.",
    ],
    donts: [
      "Don't mix pin wheel and stepper variants in the same flow.",
      "Don't force minute-level precision when the use case is approximate.",
    ],
    props: [
      { name: "variant", options: "android | pin-wheel | stepper", defaultValue: "pin-wheel", description: "Selection mechanism; keep one variant per flow." },
      { name: "minuteStep", options: "1 | 5 | 15", defaultValue: "5", description: "Minute increment for the wheel and stepper." },
    ],
  },
  "overlay--date-range-selector": {
    overview:
      "Date range selector extends the calendar to a start and end date, tinting the span between the endpoints. It includes the dates grid, a picker footer with apply/cancel actions, and a combined date-time variant for ranges that need times.",
    whenToUse: [
      "Reporting periods, booking windows, or any start–end date pair.",
      "With preset shortcuts (Last 7 days, This month) for common ranges.",
    ],
    whenNotToUse: [
      "A single date — use the date picker.",
      "Open-ended ranges — a single \"from\" date with no end reads better as one picker.",
    ],
    dos: [
      "Fill the endpoints and tint the span so the range reads at a glance.",
      "Write ranges with an en dash: Jan 10–14.",
      "Confirm with an explicit apply action in the footer.",
    ],
    donts: [
      "Don't apply a half-selected range — wait for both endpoints.",
      "Don't make the user re-pick the start date to adjust the end.",
    ],
    props: [
      { name: "presets", options: "RangePreset[]", defaultValue: "[]", description: "Shortcut ranges such as Last 7 days." },
      { name: "withTime", options: "boolean", defaultValue: "false", description: "Enables the date-time range variant." },
    ],
  },
  "date-picker--date-picker": {
    whenToUse: [
      "Selecting a single date with correct formatting and validation built in.",
      "Calendar view when context matters (weekday, proximity); pin wheel for fast known-date entry like birthdays.",
    ],
    whenNotToUse: [
      "Date ranges — use the date range selector.",
      "Approximate periods (\"sometime next quarter\") — use a select of options.",
    ],
    dos: [
      "Default to today or the most likely date.",
      "Disable dates outside the valid range rather than erroring after selection.",
      "Display dates as MM/DD/YYYY in data contexts and \"Jan 14, 2026\" in summaries.",
    ],
    donts: [
      "Don't force calendar navigation for far-past dates like birthdays — offer the pin wheel.",
      "Don't accept free-typed dates without validating the format.",
    ],
  },
  "navigation--tab": {
    whenToUse: [
      "Switching between peer views of the same object — Overview, Activity, Notes.",
      "When users will move between views repeatedly in one session.",
    ],
    whenNotToUse: [
      "Sequential steps — use progress steps; tabs imply free order.",
      "Primary app navigation — that's the bottom navbar.",
    ],
    dos: [
      "Keep labels to one or two words.",
      "Preserve each tab's state when switching.",
      "Default to the most important tab.",
    ],
    donts: [
      "Don't exceed what fits without scrolling on the smallest supported screen.",
      "Don't hide primary actions inside a non-default tab.",
    ],
  },
  "navigation--bottom-navigation-bar": {
    whenToUse: [
      "Top-level app destinations — 3 to 5 sections users switch between constantly.",
      "With badges for unread or attention states on a destination.",
    ],
    whenNotToUse: [
      "Actions — the navbar navigates; it never mutates data.",
      "More than 5 destinations — restructure the information architecture.",
    ],
    dos: [
      "Keep labels to a single short word.",
      "Highlight the active destination with the selected tint.",
      "Keep the bar visible on every top-level screen.",
    ],
    donts: [
      "Don't hide the navbar on some top-level screens and not others.",
      "Don't use it for contextual, screen-specific actions.",
    ],
  },
  "navigation--content-switcher": {
    overview:
      "Content switcher is the segmented control: a compact group of 2–4 mutually exclusive options where the active segment is raised. It switches views or modes of the same content in place — lighter than tabs, and always fully visible.",
    whenToUse: [
      "Switching views of the same data — list/board, day/week/month.",
      "2–4 short, stable options that all fit on screen.",
    ],
    whenNotToUse: [
      "More than 4 options — use tabs or a select.",
      "Actions or navigation between screens.",
    ],
    dos: [
      "Keep segment labels to one word where possible.",
      "Persist the user's choice across sessions.",
    ],
    donts: [
      "Don't use a switcher for actions like Save or Delete.",
      "Don't let one segment's label wrap or truncate — shorten it.",
    ],
    props: [
      { name: "items", options: "string[] (2–4)", defaultValue: "—", description: "Segment labels; all visible at once." },
      { name: "selected", options: "number", defaultValue: "0", description: "Index of the active segment." },
    ],
  },
  "navigation--breadcrumb": {
    whenToUse: [
      "Deep hierarchies where users need to see and jump to ancestors.",
      "Tablet and larger layouts where the trail fits comfortably.",
    ],
    whenNotToUse: [
      "Shallow apps where the header back button covers it.",
      "As a substitute for primary navigation.",
    ],
    dos: [
      "Make every ancestor tappable; keep the current page plain text.",
      "Collapse middle levels with an ellipsis when space is tight.",
    ],
    donts: [
      "Don't link the current page to itself.",
      "Don't let long titles push the trail to two lines — truncate them.",
    ],
  },
  "navigation--toolbar": {
    whenToUse: [
      "Clusters of related icon actions — formatting controls, canvas tools.",
      "Horizontal or vertical orientation depending on the surface.",
    ],
    whenNotToUse: [
      "Primary navigation — use the bottom navbar or header.",
      "One or two actions — plain buttons are clearer.",
    ],
    dos: [
      "Group related actions with dividers between groups.",
      "Mark the active tool with the selected tint.",
      "Give every icon a tooltip or accessible label.",
    ],
    donts: [
      "Don't mix navigation and mutation actions in one toolbar.",
      "Don't overflow more than one row — move extras behind a menu.",
    ],
  },
  "navigation--mobile-footer": {
    overview:
      "Mobile footer is the persistent bottom action bar for flows: back/continue pairs, sticky CTAs, and safe-area padding on devices with home indicators. It keeps the flow's primary action reachable with one thumb.",
    whenToUse: [
      "Multi-step flows needing persistent back/continue actions.",
      "A single sticky CTA that must stay reachable while content scrolls.",
    ],
    whenNotToUse: [
      "Top-level navigation — that's the bottom navbar.",
      "Screens with no primary action — don't add an empty bar.",
    ],
    dos: [
      "Put the primary action on the right, secondary on the left.",
      "Respect the device safe area below the buttons.",
    ],
    donts: [
      "Don't stack more than two actions in the footer.",
      "Don't let the footer cover the last form field — pad the scroll area.",
    ],
    props: [
      { name: "actions", options: "1 | 2 buttons", defaultValue: "2", description: "Primary right, secondary left." },
      { name: "safeArea", options: "boolean", defaultValue: "true", description: "Adds home-indicator padding." },
    ],
  },
  "header--header": {
    whenToUse: [
      "Screen-level titling with back navigation and up to two trailing actions.",
      "Header lite for sub-screens and sheets where 32px is enough.",
    ],
    whenNotToUse: [
      "In-content section headings — use text styles.",
      "More than two trailing actions — move extras into a menu.",
    ],
    dos: [
      "Keep titles short enough to never truncate on small screens.",
      "Use the platform back affordance consistently.",
    ],
    donts: [
      "Don't stack two rows of actions in a header.",
      "Don't change header height between sibling screens.",
    ],
  },
  "display--list-item": {
    whenToUse: [
      "Rows in scrolling lists: contacts, settings, results.",
      "Leading avatar or icon, one or two lines of text, and a trailing affordance.",
    ],
    whenNotToUse: [
      "Rich multi-field records — use a card or tile.",
      "Static prose content.",
    ],
    dos: [
      "Keep to one primary line plus one optional subtitle.",
      "Make the whole row the tap target, not just the chevron.",
    ],
    donts: [
      "Don't cram multiple actions into a row — one trailing control at most.",
      "Don't let text collide with the trailing element — truncate with ellipsis.",
    ],
  },
  "display--accordion": {
    whenToUse: [
      "Progressive disclosure of secondary content — FAQs, advanced settings.",
      "Long pages where users scan section titles before committing.",
    ],
    whenNotToUse: [
      "Critical information users must always see.",
      "Step-by-step flows — use progress steps.",
    ],
    dos: [
      "Write headers that fully describe the hidden content.",
      "Keep one level of nesting.",
      "Consider defaulting the most important section open.",
    ],
    donts: [
      "Don't hide form validation errors inside a collapsed section.",
      "Don't nest accordions inside accordions.",
    ],
    props: [
      { name: "items", options: "AccordionItem[]", defaultValue: "—", description: "Sections with header and collapsible content." },
      { name: "defaultOpen", options: "number | none", defaultValue: "none", description: "Index of the section open on load." },
      { name: "multiple", options: "boolean", defaultValue: "false", description: "Allow more than one section open at once." },
    ],
  },
  "display--tooltip": {
    whenToUse: [
      "Naming icon-only controls on long-press or hover.",
      "One-line clarifications that don't fit in the layout.",
    ],
    whenNotToUse: [
      "Content the user must read to proceed — put it in the layout.",
      "Rich content or actions — use a popover.",
    ],
    dos: [
      "Keep it to one short line.",
      "Point the arrow at the trigger.",
    ],
    donts: [
      "Don't hide required information in a tooltip.",
      "Don't put links or buttons inside a tooltip.",
    ],
  },
  "display--icon": {
    whenToUse: [
      "Reinforcing meaning next to labels, or alone with an accessible name.",
      "Sizes from the icon scale; color from icon semantic tokens.",
    ],
    whenNotToUse: [
      "Communicating alone where the metaphor is ambiguous — pair with a label.",
      "Decorative filler.",
    ],
    dos: [
      "Verify the icon name in the GHL icon library before use.",
      "Use outlined style as the default; filled for active states.",
    ],
    donts: [
      "Don't apply primitive colors — icon color comes from semantic tokens.",
      "Don't scale icons off the size scale.",
    ],
  },
  "display--tile": {
    whenToUse: [
      "Tappable summary blocks in a grid — dashboards, quick actions, module entries.",
      "A label plus a stat, icon, or preview per tile.",
    ],
    whenNotToUse: [
      "Long lists of similar records — use list items.",
      "Dense tabular comparison — use a table.",
    ],
    dos: [
      "Keep tiles in an even grid with equal heights per row.",
      "Make the whole tile the tap target.",
    ],
    donts: [
      "Don't overload a tile with more than one metric and one label.",
      "Don't mix tappable and static tiles in one grid without distinction.",
    ],
    props: [
      { name: "size", options: "sm | md | lg", defaultValue: "md", description: "Tile footprint in the grid." },
      { name: "content", options: "stat | icon | preview", defaultValue: "stat", description: "Primary content slot." },
    ],
  },
  "display--message-card": {
    whenToUse: [
      "Conversation previews: sender, timestamp, snippet, unread state.",
      "Inbox-style lists where scannability matters.",
    ],
    whenNotToUse: [
      "Full message threads — this is a preview, not the reader.",
      "System notifications — use the notification pattern.",
    ],
    dos: [
      "Show relative or short timestamps (2:14 PM, 2h ago).",
      "Mark unread state with the badge, not just bold text.",
    ],
    donts: [
      "Don't show more than two lines of snippet.",
      "Don't hide the sender behind an avatar alone.",
    ],
  },
  "display--system-alert": {
    whenToUse: [
      "App-wide conditions: offline, maintenance, version updates, account issues.",
      "Persistent until resolved or explicitly dismissed.",
    ],
    whenNotToUse: [
      "Screen-local messages — use an alert.",
      "Transient feedback — use a snackbar.",
    ],
    dos: [
      "Pin it to the top, full width, above screen content.",
      "Include the one action that resolves the condition where possible.",
    ],
    donts: [
      "Don't show more than one system alert at a time.",
      "Don't use it for promotions.",
    ],
  },
  "display--carousel": {
    whenToUse: [
      "Browsing a small set of visual items — onboarding slides, media galleries, featured cards.",
      "With the dot indicator for a few slides, or the number indicator for many.",
    ],
    whenNotToUse: [
      "Content users must all see — carousels hide everything after slide one.",
      "Long lists — use a scrolling list or grid.",
    ],
    dos: [
      "Show position with the dot or number indicator.",
      "Support swipe as the primary gesture; arrows are secondary.",
    ],
    donts: [
      "Don't auto-advance while the user is interacting.",
      "Don't put critical actions only on later slides.",
    ],
    props: [
      { name: "indicator", options: "dots | number | none", defaultValue: "dots", description: "Position indicator style." },
      { name: "arrows", options: "boolean", defaultValue: "false", description: "Show prev/next arrows on larger screens." },
      { name: "autoAdvance", options: "boolean", defaultValue: "false", description: "Cycle slides on a timer; pauses on interaction." },
    ],
  },
  "display--drag-item": {
    whenToUse: [
      "User-controlled ordering: pipeline stages, checklist steps, favorites.",
      "Lists where order is meaningful and persisted.",
    ],
    whenNotToUse: [
      "Sorted lists where order is computed — dragging would fight the sort.",
      "Moving items between containers — that's a different pattern.",
    ],
    dos: [
      "Show the grab handle so draggability is discoverable.",
      "Lift the dragged item with elevation and a tinted border.",
    ],
    donts: [
      "Don't make the whole row the drag handle if rows are also tappable.",
      "Don't reorder without persisting — losing the order erodes trust.",
    ],
    props: [
      { name: "state", options: "default | lifted | drop-target", defaultValue: "default", description: "Visual state during a drag interaction." },
      { name: "handle", options: "boolean", defaultValue: "true", description: "Shows the grab handle affordance." },
    ],
  },
  "display--video-player": {
    whenToUse: [
      "Playing hosted video inline — tutorials, walkthroughs, media messages.",
      "Platform variants match iOS and Android control conventions.",
    ],
    whenNotToUse: [
      "Background ambience — video with controls implies user intent.",
      "Audio-only content.",
    ],
    dos: [
      "Show duration and progress in MM:SS.",
      "Fade controls out during playback and back on tap.",
    ],
    donts: [
      "Don't autoplay with sound.",
      "Don't hide the fullscreen affordance.",
    ],
  },
  "progress--progress-indicator": {
    whenToUse: [
      "Communicating completion of an ongoing operation — uploads, imports, syncs.",
      "Bar for inline contexts, circle for compact ones, pill for count-based progress.",
    ],
    whenNotToUse: [
      "Unknown duration with no measurable progress — use the indeterminate state sparingly.",
      "Step-based flows — use progress steps.",
    ],
    dos: [
      "Pair the indicator with a label saying what's happening and how far along.",
      "Use determinate progress whenever the total is knowable.",
    ],
    donts: [
      "Don't let a bar sit at 95% indefinitely — show honest progress.",
      "Don't use progress indicators as decoration.",
    ],
  },
  "progress--progress-step": {
    whenToUse: [
      "Multi-step flows where users benefit from seeing position and remaining steps.",
      "3–5 steps with short labels.",
    ],
    whenNotToUse: [
      "Two-step flows — a simple back/continue footer is enough.",
      "Non-linear navigation — use tabs.",
    ],
    dos: [
      "Check completed steps and outline the current one.",
      "Let users tap back to completed steps where safe.",
    ],
    donts: [
      "Don't exceed five steps — combine or restructure.",
      "Don't use steps for views the user can visit in any order.",
    ],
  },
  "avatar--avatar": {
    overview:
      "Avatar represents a person, company, or account. It falls back in a fixed order — photo, then initials, then a generic icon — and supports masked shapes, an online presence indicator, and a company indicator overlay. Sizes come from the avatar scale so identity reads consistently everywhere from list rows to profile headers.",
    whenToUse: [
      "Representing a person, company, or account in lists, headers, and assignment controls.",
      "With the online indicator only where presence is genuinely live.",
    ],
    whenNotToUse: [
      "Decorative imagery — avatars imply identity.",
      "Content thumbnails — use an image or tile.",
    ],
    dos: [
      "Always provide the initials fallback; photos fail to load.",
      "Keep sizes from the scale — don't freehand dimensions.",
    ],
    donts: [
      "Don't stretch avatars to non-circular shapes outside the masked variants.",
      "Don't use color coding alone as identification.",
    ],
    props: [
      { name: "size", options: "xs | sm | md | lg | xl", defaultValue: "md", description: "Diameter from the avatar size scale." },
      { name: "source", options: "photo | initials | icon", defaultValue: "photo", description: "Falls back photo → initials → icon." },
      { name: "online", options: "boolean", defaultValue: "false", description: "Live presence dot; only where presence is real." },
      { name: "mask", options: "circle | squircle", defaultValue: "circle", description: "Shape mask variant." },
    ],
  },
  "avatar--avatar-group": {
    whenToUse: [
      "Compact \"who's involved\" displays — assignees, participants, followers.",
      "With a +N overflow count past a handful of members.",
    ],
    whenNotToUse: [
      "Lists where each person needs a label — use avatar with label rows.",
      "A single person — use a plain avatar.",
    ],
    dos: [
      "Cap the visible avatars and use the +N count for the rest.",
      "Keep overlap consistent with the stacked variant spacing.",
    ],
    donts: [
      "Don't stack so many that individual identities are unreadable.",
      "Don't mix sizes within one group.",
    ],
  },
  "avatar--avatar-action-icon": {
    whenToUse: [
      "A small action docked to an avatar — add photo, edit, camera swap.",
      "Profile and account screens where the avatar itself is editable.",
    ],
    whenNotToUse: [
      "General actions unrelated to the avatar — use a button.",
      "Status display — that's the online indicator's job.",
    ],
    dos: [
      "Keep the action icon on the bottom-right with the ring separation.",
      "Use one action per avatar.",
    ],
    donts: [
      "Don't overlap the action icon with the online indicator.",
      "Don't use it on tiny avatar sizes where the target is too small.",
    ],
  },
  "avatar--avatar-with-label": {
    whenToUse: [
      "The standard person reference: avatar plus name and an optional secondary line.",
      "Assignment rows, comment headers, member lists.",
    ],
    whenNotToUse: [
      "Dense tables where initials alone suffice.",
      "Groups — use the avatar group.",
    ],
    dos: [
      "Truncate long names with an ellipsis rather than wrapping.",
      "Keep the secondary line to one short fact (role, status, time).",
    ],
    donts: [
      "Don't stack more than two lines of text next to the avatar.",
      "Don't drop the name and rely on the avatar alone in ambiguous contexts.",
    ],
  },
  "badge--badge": {
    whenToUse: [
      "System-assigned status at a glance: active, pending, failed, new.",
      "Counts — unread messages, items needing attention.",
    ],
    whenNotToUse: [
      "User-editable labels — use a tag, which supports removal.",
      "Interactive filtering — badges are read-only.",
    ],
    dos: [
      "Map badge color to meaning consistently across the product.",
      "Keep text to a single word or short count.",
    ],
    donts: [
      "Don't make badges clickable.",
      "Don't use an error badge for emphasis when nothing is wrong.",
    ],
  },
  "tag--tag": {
    whenToUse: [
      "User-applied or content-derived labels: categories, filters, recipients.",
      "Removable selections using the close affordance; compact overflow with the count element.",
    ],
    whenNotToUse: [
      "System status — use a badge, which is read-only by design.",
      "Primary actions — a tag is metadata, not a button.",
    ],
    dos: [
      "Keep tag text to one or two words.",
      "Use the close affordance only when removal is genuinely available.",
    ],
    donts: [
      "Don't use color variants to invent status semantics — that's a badge's job.",
      "Don't mix interactive and read-only tags in one group without distinction.",
    ],
  },
  "tag--tag-group": {
    whenToUse: [
      "Any set of two or more related tags — the group owns wrapping and spacing.",
      "Overflow handling with a trailing +N tag.",
    ],
    whenNotToUse: [
      "A single tag — no wrapper needed.",
      "Status collections — use badges.",
    ],
    dos: [
      "Let the group wrap naturally; never truncate individual tags.",
      "Collapse past the row limit into a +N tag.",
    ],
    donts: [
      "Don't hand-space tags outside the group component.",
      "Don't mix tag sizes within one group.",
    ],
  },
  "feedback--empty-state": {
    whenToUse: [
      "First-run screens before the user has created anything.",
      "No-results states for searches and filters.",
      "Cleared states — inbox zero, all tasks done.",
    ],
    whenNotToUse: [
      "Loading — use skeletons; a flashing empty state reads as data loss.",
      "Errors — use an error state with a retry.",
    ],
    dos: [
      "Say what would be here and how to get it: illustration, one line, one CTA.",
      "Differentiate \"nothing exists yet\" from \"nothing matches your filters\".",
      "Offer to clear filters in no-results states.",
    ],
    donts: [
      "Don't leave a bare \"No data\" string.",
      "Don't offer a CTA the user lacks permission to complete.",
    ],
  },
  "utilities--utilities": {
    overview:
      "A holding page for supporting token sets that don't map to a single published Figma component: the custom slot container, the notification row and its actions, and the sub-account switcher. Documenting them here keeps every token file in the source visible and searchable.",
    whenToUse: [
      "Reference these token sets when building the notification center, custom slot containers, or the agency sub-account switcher.",
    ],
    whenNotToUse: [
      "As building blocks for new patterns — talk to the design system team first.",
    ],
    dos: ["Treat these tokens exactly like component tokens: reference, never copy values."],
    donts: ["Don't fork these token sets locally for lookalike patterns."],
    props: [
      { name: "—", options: "—", defaultValue: "—", description: "These are token sets, not published components; see the Tokens tab." },
    ],
  },
};

function generateDefault(c: ComponentDoc): Guidance {
  const contexts = c.usage?.contexts
    ? c.usage.contexts.split(/,\s*/).slice(0, 5).map((s) => s.trim()).filter(Boolean)
    : [];
  return {
    whenToUse: contexts.length
      ? contexts.map((ctx) => ctx.charAt(0).toUpperCase() + ctx.slice(1) + ".")
      : [`Use ${c.name} in its documented contexts.`],
    whenNotToUse: [
      `Don't repurpose ${c.name} visually for a different meaning — if a recurring need has no component, raise it with the design system team.`,
    ],
    dos: [
      "Insert the library component and leave its internals untouched — every state is wired through component tokens.",
      "Pick variants from the documented set rather than restyling by hand.",
      "Check the result in both light and dark modes before handoff.",
    ],
    donts: [
      "Don't detach the instance or override its fills, strokes, or text styles.",
      "Don't apply primitive color tokens to any part of it.",
      "Don't invent new variants locally — propose them to the design system team.",
    ],
    authored: false,
  };
}

export function getGuidance(c: ComponentDoc): Guidance {
  const entry = AUTHORED[c.slug];
  if (entry) return { ...entry, authored: true };
  return generateDefault(c);
}

/** Authored overview paragraphs for components whose token metadata is thin. */
export const OVERVIEW_FALLBACKS: Record<string, string> = {
  "form--button":
    "Button is the workhorse action component: it triggers operations, submits forms, and opens flows. The variant ladder — primary, secondary, tertiary, link — maps directly to visual hierarchy, and every interaction state is wired through component tokens.",
  "avatar--avatar":
    "Avatar represents a person, company, or account with a fixed fallback order: photo, then initials, then a generic icon. It supports masked shapes, an online presence indicator, and a company indicator overlay, with sizes from the avatar scale.",
  "navigation--content-switcher":
    "Content switcher is the segmented control: 2–4 mutually exclusive options in a compact group where the active segment is raised. It switches views or modes of the same content in place — lighter than tabs, and always fully visible.",
};
