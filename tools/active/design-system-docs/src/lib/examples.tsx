import type { ReactNode } from "react";
import {
  MockAlert,
  MockAvatar,
  MockAvatarGroup,
  MockBadge,
  MockBottomNav,
  MockButton,
  MockCalendar,
  MockCheckbox,
  MockDialog,
  MockField,
  MockHeaderBar,
  MockIconTile,
  MockListItem,
  MockMenu,
  MockOtp,
  MockProgressBar,
  MockProgressCircle,
  MockRadio,
  MockSegmented,
  MockSheet,
  MockSlider,
  MockSnackbar,
  MockSteps,
  MockTabs,
  MockTag,
  MockToggle,
  MockTooltip,
  NAV_ICONS,
  PhoneFrame,
  Scrim,
  SkeletonBar,
} from "@/components/mocks";

export interface ExampleDef {
  label: string;
  caption?: string;
  node: ReactNode;
}

export interface ComponentExamples {
  /** Compact "live at a glance" strip for the Overview tab. */
  strip: ReactNode;
  examples: ExampleDef[];
  doSketch?: ReactNode;
  dontSketch?: ReactNode;
}

function Row({ children, gap = "gap-3" }: { children: ReactNode; gap?: string }) {
  return <div className={`flex flex-wrap items-center justify-center ${gap}`}>{children}</div>;
}

function Col({ children, w = "w-[240px]" }: { children: ReactNode; w?: string }) {
  return <div className={`flex flex-col gap-3 ${w}`}>{children}</div>;
}

const REGISTRY: Record<string, ComponentExamples> = {
  // ---------- form ----------
  "form--button": {
    strip: (
      <Row>
        <MockButton>Save changes</MockButton>
        <MockButton variant="secondary">Cancel</MockButton>
        <MockButton variant="tertiary">Learn more</MockButton>
        <MockButton variant="destructive">Delete</MockButton>
      </Row>
    ),
    examples: [
      {
        label: "Variant ladder",
        caption: "Primary, secondary, and tertiary step down in prominence; one primary per view.",
        node: (
          <Row>
            <MockButton>Add contact</MockButton>
            <MockButton variant="secondary">Preview</MockButton>
            <MockButton variant="tertiary">Learn more</MockButton>
            <MockButton variant="link">View details</MockButton>
          </Row>
        ),
      },
      {
        label: "Sizes",
        caption: "Small, medium, and large heights from the token scale.",
        node: (
          <Row>
            <MockButton size="sm">Small</MockButton>
            <MockButton size="md">Medium</MockButton>
            <MockButton size="lg">Large</MockButton>
          </Row>
        ),
      },
      {
        label: "States",
        caption: "Destructive reads as data loss; disabled explains itself through nearby context.",
        node: (
          <Row>
            <MockButton variant="destructive">Delete contact</MockButton>
            <MockButton disabled>Save changes</MockButton>
          </Row>
        ),
      },
    ],
    doSketch: (
      <Row>
        <MockButton size="sm">Save changes</MockButton>
        <MockButton variant="secondary" size="sm">Cancel</MockButton>
      </Row>
    ),
    dontSketch: (
      <Row>
        <MockButton size="sm">Submit</MockButton>
        <MockButton size="sm">OK</MockButton>
        <MockButton size="sm">Click here</MockButton>
      </Row>
    ),
  },
  "form--input": {
    strip: (
      <Col>
        <MockField label="Email" placeholder="name@company.com" leadingIcon={false} />
      </Col>
    ),
    examples: [
      {
        label: "Anatomy",
        caption: "Label above, control, hint below — wired through the input form wrapper.",
        node: (
          <Col>
            <MockField label="Email" placeholder="name@company.com" hint="We'll never share your email." />
          </Col>
        ),
      },
      {
        label: "States",
        caption: "Focus and error rings come from semantic tokens; the error hint says how to fix it.",
        node: (
          <Col>
            <MockField label="Phone" value="(555) 014-2216" state="focus" />
            <MockField label="Website" value="not a url" state="error" hint="Enter a valid URL, like https://example.com." />
            <MockField label="Company" placeholder="Acme Inc." state="disabled" />
          </Col>
        ),
      },
      {
        label: "With leading icon",
        node: (
          <Col>
            <MockField placeholder="Search contacts" leadingIcon />
          </Col>
        ),
      },
    ],
    doSketch: (
      <div className="w-[210px]">
        <MockField label="Email" placeholder="name@company.com" />
      </div>
    ),
    dontSketch: (
      <div className="w-[210px]">
        <MockField placeholder="Enter your email address here" />
      </div>
    ),
  },
  "form--input-form": {
    strip: (
      <Col>
        <MockField label="Full name" placeholder="Jane Miller" hint="As it appears on the account." />
      </Col>
    ),
    examples: [
      {
        label: "Label + control + hint",
        caption: "The wrapper owns the 4px label gap and hint rhythm so every form field matches.",
        node: (
          <Col>
            <MockField label="Full name" placeholder="Jane Miller" hint="As it appears on the account." />
            <MockField label="Email" placeholder="name@company.com" />
          </Col>
        ),
      },
      {
        label: "Error message",
        node: (
          <Col>
            <MockField label="Email" value="jane@" state="error" hint="Enter a complete email address." />
          </Col>
        ),
      },
    ],
    doSketch: (
      <div className="w-[210px]">
        <MockField label="Email" value="jane@" state="error" hint="Enter a complete email address." />
      </div>
    ),
    dontSketch: (
      <div className="w-[210px]">
        <MockField label="Email" value="jane@" state="error" hint="Error 422: validation failed" />
      </div>
    ),
  },
  "form--checkbox": {
    strip: (
      <Row>
        <MockCheckbox checked label="Email" />
        <MockCheckbox checked={false} label="SMS" />
        <MockCheckbox indeterminate label="All channels" />
      </Row>
    ),
    examples: [
      {
        label: "Selection list",
        caption: "Zero, one, or many — the parent shows indeterminate when the selection is mixed.",
        node: (
          <div className="flex flex-col items-start gap-2.5">
            <MockCheckbox indeterminate label="Notification channels" />
            <span className="pl-6"><MockCheckbox checked label="Email" /></span>
            <span className="pl-6"><MockCheckbox checked={false} label="SMS" /></span>
            <span className="pl-6"><MockCheckbox checked label="Push" /></span>
          </div>
        ),
      },
    ],
    doSketch: <MockCheckbox checked label="Send me product updates" />,
    dontSketch: <MockCheckbox checked label="Don't not send updates" />,
  },
  "form--radio": {
    strip: (
      <Row>
        <MockRadio selected label="Monthly" />
        <MockRadio label="Yearly" />
      </Row>
    ),
    examples: [
      {
        label: "Single choice group",
        caption: "2–5 visible, comparable options with a sensible default selected.",
        node: (
          <div className="flex flex-col items-start gap-2.5">
            <MockRadio selected label="Standard shipping — free" />
            <MockRadio label="Express shipping — $9" />
            <MockRadio label="Overnight — $24" />
          </div>
        ),
      },
    ],
    doSketch: (
      <div className="flex flex-col items-start gap-2">
        <MockRadio selected label="Monthly" />
        <MockRadio label="Yearly" />
      </div>
    ),
    dontSketch: (
      <div className="flex flex-col items-start gap-2">
        <MockRadio label="Option A" />
        <MockCheckbox checked={false} label="Option B" />
      </div>
    ),
  },
  "form--toggle": {
    strip: (
      <Row>
        <MockToggle on />
        <MockToggle on={false} />
        <MockToggle on loading />
      </Row>
    ),
    examples: [
      {
        label: "Settings rows",
        caption: "Each row is an independent switch that applies immediately.",
        node: (
          <div className="w-[250px] rounded-xl border border-gray-200 bg-white px-3 dark:border-surface-line dark:bg-surface-raised">
            <MockListItem title="Push notifications" trailing="toggle" />
            <MockListItem title="Email digest" trailing={<MockToggle on={false} />} />
            <MockListItem title="Dark mode" trailing="toggle" />
          </div>
        ),
      },
      {
        label: "Loading knob",
        caption: "Use the loading state when the change needs a round trip.",
        node: <MockToggle on loading />,
      },
    ],
    doSketch: (
      <div className="flex items-center gap-3 text-[13px] text-gray-800 dark:text-gray-200">
        Email notifications <MockToggle on />
      </div>
    ),
    dontSketch: (
      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-3 text-[13px] text-gray-800 dark:text-gray-200">
          Enabled <MockToggle on />
        </div>
        <MockButton size="sm">Save</MockButton>
      </div>
    ),
  },
  "form--select": {
    strip: (
      <div className="w-[240px]">
        <MockField label="Country" value="United States" />
      </div>
    ),
    examples: [
      {
        label: "Closed and open",
        caption: "One row closed; a scrollable option list when open.",
        node: (
          <Row>
            <div className="w-[200px]">
              <MockField label="Country" value="United States" />
            </div>
            <MockMenu
              items={[
                { label: "United States", icon: "✓" },
                { label: "Canada", icon: " " },
                { label: "United Kingdom", icon: " " },
                { label: "Australia", icon: " " },
              ]}
            />
          </Row>
        ),
      },
    ],
    doSketch: (
      <div className="w-[190px]">
        <MockField label="Time zone" value="Pacific (GMT-8)" />
      </div>
    ),
    dontSketch: (
      <div className="w-[190px]">
        <MockField label="Enabled?" value="Yes" />
      </div>
    ),
  },
  "form--text-area": {
    strip: (
      <div className="w-[250px]">
        <div className="rounded-lg border border-gray-300 bg-white p-3 text-left dark:border-surface-line dark:bg-surface-raised">
          <p className="text-[13px] text-gray-400">Add a note about this contact…</p>
          <div className="mt-6 flex justify-end">
            <span className="text-[10px] text-gray-400">0 / 500</span>
          </div>
        </div>
      </div>
    ),
    examples: [
      {
        label: "With label and counter",
        caption: "Multi-line entry with a character counter when limits matter.",
        node: (
          <div className="w-[250px] text-left">
            <p className="mb-1 text-[12px] font-medium text-gray-700 dark:text-gray-300">Notes</p>
            <div className="rounded-lg border border-gray-300 bg-white p-3 dark:border-surface-line dark:bg-surface-raised">
              <p className="text-[13px] text-gray-900 dark:text-gray-100">Met at the Austin expo. Wants a demo of workflows next week.</p>
              <div className="mt-4 flex justify-end">
                <span className="text-[10px] text-gray-400">63 / 500</span>
              </div>
            </div>
          </div>
        ),
      },
    ],
    doSketch: (
      <div className="w-[200px] rounded-lg border border-gray-300 bg-white p-2.5 text-left text-[11px] text-gray-600 dark:border-surface-line dark:bg-surface-raised dark:text-gray-300">
        Longer, free-form notes live here…
      </div>
    ),
    dontSketch: (
      <div className="w-[200px] rounded-lg border border-gray-300 bg-white p-2.5 text-left text-[11px] text-gray-400 dark:border-surface-line dark:bg-surface-raised">
        jane@company.com
      </div>
    ),
  },
  "form--input-stepper": {
    strip: (
      <div className="inline-flex items-center overflow-hidden rounded-lg border border-gray-300 dark:border-surface-line">
        <span className="flex h-9 w-9 items-center justify-center bg-gray-50 text-gray-600 dark:bg-surface-overlay dark:text-gray-300">−</span>
        <span className="flex h-9 w-12 items-center justify-center bg-white text-[13px] font-medium text-gray-900 dark:bg-surface-raised dark:text-gray-100">3</span>
        <span className="flex h-9 w-9 items-center justify-center bg-gray-50 text-gray-600 dark:bg-surface-overlay dark:text-gray-300">+</span>
      </div>
    ),
    examples: [
      {
        label: "Quantity control",
        caption: "Decrement, value, increment — for small numeric adjustments.",
        node: (
          <div className="flex items-center gap-4">
            <span className="text-[13px] text-gray-700 dark:text-gray-300">Seats</span>
            <div className="inline-flex items-center overflow-hidden rounded-lg border border-gray-300 dark:border-surface-line">
              <span className="flex h-9 w-9 items-center justify-center bg-gray-50 text-gray-600 dark:bg-surface-overlay dark:text-gray-300">−</span>
              <span className="flex h-9 w-12 items-center justify-center bg-white text-[13px] font-medium text-gray-900 dark:bg-surface-raised dark:text-gray-100">3</span>
              <span className="flex h-9 w-9 items-center justify-center bg-gray-50 text-gray-600 dark:bg-surface-overlay dark:text-gray-300">+</span>
            </div>
          </div>
        ),
      },
    ],
  },
  "form--slider": {
    strip: (
      <div className="w-[240px]">
        <MockSlider value={60} />
      </div>
    ),
    examples: [
      {
        label: "Single value",
        caption: "Drag to set a value in a continuous range; the knob tooltip shows the current value.",
        node: (
          <div className="w-[260px]">
            <MockSlider value={60} />
          </div>
        ),
      },
      {
        label: "In context",
        node: (
          <div className="w-[250px] rounded-xl border border-gray-200 bg-white p-4 text-left dark:border-surface-line dark:bg-surface-raised">
            <p className="text-[12px] font-medium text-gray-700 dark:text-gray-300">Budget per day</p>
            <MockSlider value={35} />
            <div className="flex justify-between text-[10px] text-gray-400">
              <span>$0</span>
              <span>$500</span>
            </div>
          </div>
        ),
      },
    ],
    doSketch: (
      <div className="w-[180px]">
        <MockSlider value={40} />
      </div>
    ),
    dontSketch: (
      <div className="w-[180px]">
        <MockSlider value={100} showValue={false} />
        <p className="mt-1 text-center text-[10px] text-gray-500">Exact value required — use an input</p>
      </div>
    ),
  },
  "form--sliding-button": {
    strip: (
      <div className="relative flex h-11 w-[240px] items-center rounded-full bg-primary-50 px-1 dark:bg-primary-900/30">
        <span className="z-10 flex h-9 w-9 items-center justify-center rounded-full bg-primary-600 text-white shadow">→</span>
        <span className="flex-1 text-center text-[12.5px] font-medium text-primary-700 dark:text-primary-300">Slide to confirm</span>
      </div>
    ),
    examples: [
      {
        label: "Slide to confirm",
        caption: "A deliberate gesture for high-consequence actions — harder to trigger accidentally than a tap.",
        node: (
          <div className="relative flex h-11 w-[250px] items-center rounded-full bg-primary-50 px-1 dark:bg-primary-900/30">
            <span className="z-10 flex h-9 w-9 items-center justify-center rounded-full bg-primary-600 text-white shadow">→</span>
            <span className="flex-1 text-center text-[12.5px] font-medium text-primary-700 dark:text-primary-300">Slide to send payment</span>
          </div>
        ),
      },
    ],
  },
  "form--timed-button": {
    strip: (
      <span className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary-600 px-4 text-[13px] font-medium text-white">
        Undo send
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-[10px]">4</span>
      </span>
    ),
    examples: [
      {
        label: "Countdown action",
        caption: "The ring counts down; the action fires (or expires) when it reaches zero.",
        node: (
          <Row>
            <span className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary-600 px-4 text-[13px] font-medium text-white">
              Undo send
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-[10px]">4</span>
            </span>
            <span className="inline-flex h-9 items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 text-[13px] font-medium text-gray-700 dark:border-surface-line dark:bg-surface-raised dark:text-gray-200">
              Resend code
              <span className="text-[11px] text-gray-400">0:24</span>
            </span>
          </Row>
        ),
      },
    ],
  },
  "form--file-upload": {
    strip: (
      <div className="w-[250px] rounded-xl border-2 border-dashed border-gray-300 bg-white p-4 text-center dark:border-surface-line dark:bg-surface-raised">
        <p className="text-[12px] font-medium text-primary-600 dark:text-primary-400">Tap to upload</p>
        <p className="mt-0.5 text-[10.5px] text-gray-400">PNG or JPG, up to 25 MB</p>
      </div>
    ),
    examples: [
      {
        label: "Dropzone and file row",
        caption: "State the accepted formats and size limit up front; show upload progress per file.",
        node: (
          <Col w="w-[260px]">
            <div className="rounded-xl border-2 border-dashed border-gray-300 bg-white p-4 text-center dark:border-surface-line dark:bg-surface-raised">
              <p className="text-[12px] font-medium text-primary-600 dark:text-primary-400">Tap to upload</p>
              <p className="mt-0.5 text-[10.5px] text-gray-400">PNG or JPG, up to 25 MB</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-3 dark:border-surface-line dark:bg-surface-raised">
              <div className="flex items-center gap-2">
                <MockIconTile tone="blue" glyph={<span className="text-[11px]">IMG</span>} />
                <div className="flex-1 text-left">
                  <p className="text-[12px] font-medium text-gray-900 dark:text-gray-100">team-photo.jpg</p>
                  <p className="text-[10px] text-gray-400">2.4 MB · 80%</p>
                </div>
                <span className="text-[11px] text-gray-400">✕</span>
              </div>
              <div className="mt-2">
                <MockProgressBar value={80} />
              </div>
            </div>
          </Col>
        ),
      },
    ],
  },
  "form--otp-input": {
    strip: <MockOtp filled={3} />,
    examples: [
      {
        label: "6-digit code",
        caption: "One box per digit, auto-advancing; the active box carries the focus ring.",
        node: <MockOtp filled={3} />,
      },
      {
        label: "Error state",
        caption: "The whole group turns red with a message — never clear the code silently.",
        node: (
          <div className="flex flex-col items-center gap-1.5">
            <MockOtp filled={6} error />
            <p className="text-[11px] text-red-600 dark:text-red-400">That code didn&apos;t match. Try again.</p>
          </div>
        ),
      },
    ],
  },

  // ---------- overlay ----------
  "overlay--modal": {
    strip: (
      <Scrim className="w-[260px]">
        <MockDialog />
      </Scrim>
    ),
    examples: [
      {
        label: "Bottom sheet",
        caption: "The mobile-native form: slide-up panel on a dark scrim with a grab handle.",
        node: (
          <Scrim className="flex w-[280px] items-end pt-16">
            <MockSheet title="Filter contacts">
              <div className="space-y-2 py-1">
                <MockCheckbox checked label="Active" />
                <br />
                <MockCheckbox checked={false} label="Archived" />
              </div>
            </MockSheet>
          </Scrim>
        ),
      },
      {
        label: "Dialogue — destructive",
        caption: "Centered dialog where the confirm button states the outcome and reads as dangerous.",
        node: (
          <Scrim className="w-[280px]">
            <MockDialog />
          </Scrim>
        ),
      },
    ],
    doSketch: (
      <div className="scale-90">
        <MockDialog title="Delete this contact?" body="This can't be undone." />
      </div>
    ),
    dontSketch: (
      <div className="scale-90">
        <MockDialog title="Are you sure?" body="Please confirm your confirmation." destructive={false} />
      </div>
    ),
  },
  "overlay--snackbar": {
    strip: <MockSnackbar message="Contact added" action="Undo" tone="success" />,
    examples: [
      {
        label: "Confirmation with undo",
        caption: "A completed fact plus at most one action; auto-dismisses after a few seconds.",
        node: <MockSnackbar message="Contact added" action="Undo" tone="success" />,
      },
      {
        label: "Transient error",
        node: <MockSnackbar message="Can't connect right now" action="Retry" tone="error" />,
      },
      {
        label: "In context",
        node: (
          <PhoneFrame>
            <div className="space-y-2 pb-2">
              <SkeletonBar w="70%" />
              <SkeletonBar w="90%" />
              <SkeletonBar w="60%" />
            </div>
            <MockSnackbar message="Message sent" tone="success" />
          </PhoneFrame>
        ),
      },
    ],
    doSketch: <MockSnackbar message="Contact added" action="Undo" tone="success" />,
    dontSketch: (
      <div className="flex flex-col gap-1.5">
        <MockSnackbar message="Contact added" />
        <MockSnackbar message="Syncing complete" />
        <MockSnackbar message="3 new updates" />
      </div>
    ),
  },
  "overlay--alert": {
    strip: <div className="w-[260px]"><MockAlert tone="warning" title="Your trial ends in 3 days" body="Add a payment method to keep your workflows running." /></div>,
    examples: [
      {
        label: "Semantic tones",
        caption: "Info, success, warning, and error map to semantic color tokens.",
        node: (
          <Col w="w-[280px]">
            <MockAlert tone="info" title="Scheduled maintenance on Jan 14" />
            <MockAlert tone="success" title="Import finished" body="1,204 contacts added." />
            <MockAlert tone="warning" title="Your trial ends in 3 days" actions />
            <MockAlert tone="error" title="Payment failed" body="Update your card to retry." actions />
          </Col>
        ),
      },
    ],
    doSketch: (
      <div className="w-[220px]">
        <MockAlert tone="error" title="Payment failed" body="Update your card to retry." />
      </div>
    ),
    dontSketch: (
      <div className="w-[220px]">
        <MockAlert tone="error" title="Error 402" body="PAYMENT_REQUIRED at gateway.ts:114" />
      </div>
    ),
  },
  "overlay--menu": {
    strip: <MockMenu />,
    examples: [
      {
        label: "Contextual actions",
        caption: "Frequency-ordered actions; destructive items last, styled with the error text token.",
        node: <MockMenu />,
      },
    ],
    doSketch: (
      <MockMenu
        items={[
          { label: "Edit", icon: "✎" },
          { label: "Duplicate", icon: "⧉" },
          { label: "Delete", icon: "🗑", destructive: true },
        ]}
      />
    ),
    dontSketch: (
      <MockMenu
        items={[
          { label: "Delete", icon: "🗑", destructive: true },
          { label: "Edit", icon: "✎" },
          { label: "Settings ▸", icon: "⚙" },
        ]}
      />
    ),
  },
  "overlay--popover": {
    strip: (
      <div className="flex flex-col items-center">
        <div className="w-56 rounded-xl border border-gray-200 bg-white p-3 text-left shadow-lift dark:border-surface-line dark:bg-surface-overlay">
          <p className="text-[12px] font-semibold text-gray-900 dark:text-gray-100">Assign to</p>
          <div className="mt-2 flex items-center gap-2">
            <MockAvatar size="sm" initials="JM" colorIndex={1} />
            <span className="text-[12px] text-gray-700 dark:text-gray-300">Jane Miller</span>
          </div>
        </div>
        <span className="h-2 w-2 -translate-y-1 rotate-45 border-b border-r border-gray-200 bg-white dark:border-surface-line dark:bg-surface-overlay" />
      </div>
    ),
    examples: [
      {
        label: "Anchored content",
        caption: "Richer than a tooltip, lighter than a modal — one focused task, dismissed by tapping outside.",
        node: (
          <div className="flex flex-col items-center">
            <div className="w-60 rounded-xl border border-gray-200 bg-white p-3 text-left shadow-lift dark:border-surface-line dark:bg-surface-overlay">
              <p className="text-[12px] font-semibold text-gray-900 dark:text-gray-100">Assign to</p>
              <div className="mt-2 space-y-2">
                <div className="flex items-center gap-2">
                  <MockAvatar size="sm" initials="JM" colorIndex={1} />
                  <span className="text-[12px] text-gray-700 dark:text-gray-300">Jane Miller</span>
                </div>
                <div className="flex items-center gap-2">
                  <MockAvatar size="sm" initials="SR" colorIndex={2} />
                  <span className="text-[12px] text-gray-700 dark:text-gray-300">Sam Rivera</span>
                </div>
              </div>
            </div>
            <span className="h-2 w-2 -translate-y-1 rotate-45 border-b border-r border-gray-200 bg-white dark:border-surface-line dark:bg-surface-overlay" />
            <MockButton size="sm" variant="secondary">Assign</MockButton>
          </div>
        ),
      },
    ],
  },
  "overlay--mobile-filter": {
    strip: (
      <Row>
        <MockTag color="blue" close>Status: Active</MockTag>
        <MockTag color="blue" close>Owner: Me</MockTag>
        <MockTag>+ Add filter</MockTag>
      </Row>
    ),
    examples: [
      {
        label: "Filter sheet",
        caption: "Filters open in a bottom sheet; applied filters persist as removable chips.",
        node: (
          <Scrim className="flex w-[280px] items-end pt-12">
            <MockSheet title="Filter">
              <div className="space-y-2.5 py-1">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] text-gray-700 dark:text-gray-300">Status</span>
                  <span className="text-[11px] text-gray-400">Active ›</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[12px] text-gray-700 dark:text-gray-300">Owner</span>
                  <span className="text-[11px] text-gray-400">Anyone ›</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[12px] text-gray-700 dark:text-gray-300">Created</span>
                  <span className="text-[11px] text-gray-400">Any time ›</span>
                </div>
              </div>
            </MockSheet>
          </Scrim>
        ),
      },
      {
        label: "Applied filter chips",
        node: (
          <Row>
            <MockTag color="blue" close>Status: Active</MockTag>
            <MockTag color="blue" close>Owner: Me</MockTag>
            <MockTag>Clear all</MockTag>
          </Row>
        ),
      },
    ],
  },
  "overlay--time-picker": {
    strip: (
      <div className="flex items-center gap-1 rounded-xl border border-gray-200 bg-white p-3 dark:border-surface-line dark:bg-surface-raised">
        {["2", "45", "PM"].map((v, i) => (
          <span key={i} className="flex flex-col items-center px-2">
            <span className="text-[10px] text-gray-300 dark:text-gray-600">{i === 2 ? "AM" : String(Number(v) - 1 || 12)}</span>
            <span className="rounded-md bg-primary-50 px-2 py-0.5 text-[15px] font-semibold text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">{v}</span>
            <span className="text-[10px] text-gray-300 dark:text-gray-600">{i === 2 ? "" : String(Number(v) + 1)}</span>
          </span>
        ))}
      </div>
    ),
    examples: [
      {
        label: "Pin wheel",
        caption: "Native-feeling wheel selection; the highlighted row is the current value.",
        node: (
          <div className="flex items-center gap-1 rounded-xl border border-gray-200 bg-white p-3 dark:border-surface-line dark:bg-surface-raised">
            {[
              ["1", "2", "3"],
              ["44", "45", "46"],
              ["AM", "PM", ""],
            ].map((col, i) => (
              <span key={i} className="flex flex-col items-center gap-0.5 px-2">
                <span className="text-[11px] text-gray-300 dark:text-gray-600">{col[0]}</span>
                <span className="rounded-md bg-primary-50 px-2.5 py-0.5 text-[16px] font-semibold text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">
                  {col[1]}
                </span>
                <span className="text-[11px] text-gray-300 dark:text-gray-600">{col[2]}</span>
              </span>
            ))}
          </div>
        ),
      },
      {
        label: "Stepper variant",
        caption: "Hour and minute steppers for precise adjustment; 12-hour time with a space before AM/PM.",
        node: (
          <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 dark:border-surface-line dark:bg-surface-raised">
            {["02", "45"].map((v, i) => (
              <span key={i} className="flex flex-col items-center gap-1">
                <span className="text-[11px] text-gray-400">▲</span>
                <span className="rounded-lg border border-gray-200 px-3 py-1.5 text-[16px] font-semibold text-gray-900 dark:border-surface-line dark:text-gray-100">{v}</span>
                <span className="text-[11px] text-gray-400">▼</span>
              </span>
            ))}
            <MockSegmented items={["AM", "PM"]} active={1} />
          </div>
        ),
      },
    ],
  },
  "overlay--date-range-selector": {
    strip: <MockCalendar selected={[10, 11, 12, 13, 14]} />,
    examples: [
      {
        label: "Range selection",
        caption: "Start and end dates as filled endpoints with a tinted span between; ranges read Jan 10–14.",
        node: <MockCalendar selected={[10, 11, 12, 13, 14]} />,
      },
      {
        label: "With footer actions",
        node: (
          <div className="flex flex-col items-center gap-0">
            <MockCalendar selected={[10, 11, 12, 13, 14]} />
            <div className="-mt-1 flex w-full max-w-[240px] justify-end gap-2 rounded-b-xl border border-t-0 border-gray-200 bg-white p-2.5 dark:border-surface-line dark:bg-surface-raised">
              <MockButton size="sm" variant="secondary">Cancel</MockButton>
              <MockButton size="sm">Apply</MockButton>
            </div>
          </div>
        ),
      },
    ],
  },

  // ---------- date picker ----------
  "date-picker--date-picker": {
    strip: <MockCalendar selected={[14]} />,
    examples: [
      {
        label: "Single date",
        caption: "Calendar grid with one selected day; today can carry a subtle outline.",
        node: <MockCalendar selected={[14]} />,
      },
      {
        label: "Pin wheel variant",
        caption: "The wheel form for quick month/day/year entry on mobile.",
        node: (
          <div className="flex items-center gap-1 rounded-xl border border-gray-200 bg-white p-3 dark:border-surface-line dark:bg-surface-raised">
            {[
              ["Dec", "Jan", "Feb"],
              ["13", "14", "15"],
              ["2025", "2026", "2027"],
            ].map((col, i) => (
              <span key={i} className="flex flex-col items-center gap-0.5 px-2">
                <span className="text-[11px] text-gray-300 dark:text-gray-600">{col[0]}</span>
                <span className="rounded-md bg-primary-50 px-2 py-0.5 text-[14px] font-semibold text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">
                  {col[1]}
                </span>
                <span className="text-[11px] text-gray-300 dark:text-gray-600">{col[2]}</span>
              </span>
            ))}
          </div>
        ),
      },
    ],
    doSketch: <div className="scale-90"><MockCalendar selected={[14]} /></div>,
    dontSketch: (
      <div className="w-[180px]">
        <MockField label="Date" placeholder="MM/DD/YYYY" />
        <p className="mt-1 text-center text-[10px] text-gray-500">Free-typed dates invite format errors</p>
      </div>
    ),
  },

  // ---------- navigation ----------
  "navigation--tab": {
    strip: <div className="w-[260px]"><MockTabs /></div>,
    examples: [
      {
        label: "Peer views",
        caption: "Underline follows the active tab; labels stay to one or two words.",
        node: <div className="w-[280px]"><MockTabs items={["Overview", "Activity", "Notes", "Files"]} active={1} /></div>,
      },
    ],
    doSketch: <div className="w-[200px]"><MockTabs items={["Overview", "Activity"]} /></div>,
    dontSketch: <div className="w-[200px]"><MockTabs items={["Step 1", "Step 2", "Step 3"]} /></div>,
  },
  "navigation--bottom-navigation-bar": {
    strip: <div className="w-[260px]"><MockBottomNav /></div>,
    examples: [
      {
        label: "Primary destinations",
        caption: "3–5 top-level destinations; the active item is tinted and a dot marks unread state.",
        node: <div className="w-[280px]"><MockBottomNav active={0} /></div>,
      },
      {
        label: "In frame",
        node: (
          <PhoneFrame>
            <div className="space-y-2 pb-3">
              <SkeletonBar w="60%" />
              <SkeletonBar w="85%" />
              <SkeletonBar w="70%" />
            </div>
            <MockBottomNav active={2} />
          </PhoneFrame>
        ),
      },
    ],
  },
  "navigation--content-switcher": {
    strip: <MockSegmented />,
    examples: [
      {
        label: "Segmented control",
        caption: "Mutually exclusive views of the same data; the active segment is raised.",
        node: <MockSegmented items={["List", "Board", "Calendar"]} active={0} />,
      },
    ],
    doSketch: <MockSegmented items={["Day", "Week", "Month"]} />,
    dontSketch: <MockSegmented items={["Save", "Delete"]} />,
  },
  "navigation--breadcrumb": {
    strip: (
      <div className="flex items-center gap-1.5 text-[12.5px]">
        <span className="text-gray-500 dark:text-gray-400">Contacts</span>
        <span className="text-gray-300 dark:text-gray-600">/</span>
        <span className="text-gray-500 dark:text-gray-400">Companies</span>
        <span className="text-gray-300 dark:text-gray-600">/</span>
        <span className="font-medium text-gray-900 dark:text-gray-100">Acme Inc.</span>
      </div>
    ),
    examples: [
      {
        label: "Location trail",
        caption: "Every ancestor is tappable; the current page is plain text.",
        node: (
          <div className="flex items-center gap-1.5 text-[13px]">
            <span className="text-primary-600 dark:text-primary-400">Contacts</span>
            <span className="text-gray-300 dark:text-gray-600">/</span>
            <span className="text-primary-600 dark:text-primary-400">Companies</span>
            <span className="text-gray-300 dark:text-gray-600">/</span>
            <span className="font-medium text-gray-900 dark:text-gray-100">Acme Inc.</span>
          </div>
        ),
      },
    ],
  },
  "navigation--toolbar": {
    strip: (
      <div className="flex items-center gap-1 rounded-xl border border-gray-200 bg-white p-1.5 shadow-card dark:border-surface-line dark:bg-surface-raised">
        {["B", "I", "U"].map((g) => (
          <span key={g} className={`flex h-7 w-7 items-center justify-center rounded-md text-[12px] ${g === "B" ? "bg-primary-50 font-bold text-primary-700 dark:bg-primary-900/40 dark:text-primary-300" : "text-gray-600 dark:text-gray-300"}`}>
            {g}
          </span>
        ))}
        <span className="mx-1 h-5 w-px bg-gray-200 dark:bg-surface-line" />
        <span className="flex h-7 w-7 items-center justify-center rounded-md text-gray-600 dark:text-gray-300">{NAV_ICONS.search}</span>
      </div>
    ),
    examples: [
      {
        label: "Action cluster",
        caption: "Grouped icon actions with dividers between groups; the active tool is tinted.",
        node: (
          <div className="flex items-center gap-1 rounded-xl border border-gray-200 bg-white p-1.5 shadow-card dark:border-surface-line dark:bg-surface-raised">
            {["B", "I", "U", "S"].map((g, i) => (
              <span key={g} className={`flex h-8 w-8 items-center justify-center rounded-md text-[13px] ${i === 0 ? "bg-primary-50 font-bold text-primary-700 dark:bg-primary-900/40 dark:text-primary-300" : "text-gray-600 dark:text-gray-300"}`}>
                {g}
              </span>
            ))}
            <span className="mx-1 h-5 w-px bg-gray-200 dark:bg-surface-line" />
            <span className="flex h-8 w-8 items-center justify-center rounded-md text-gray-600 dark:text-gray-300">{NAV_ICONS.bell}</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-md text-gray-600 dark:text-gray-300">{NAV_ICONS.user}</span>
          </div>
        ),
      },
    ],
  },
  "navigation--mobile-footer": {
    strip: (
      <div className="w-[260px] rounded-xl border border-gray-200 bg-white p-3 shadow-card dark:border-surface-line dark:bg-surface-raised">
        <div className="flex gap-2">
          <MockButton variant="secondary" size="sm" block>Back</MockButton>
          <MockButton size="sm" block>Continue</MockButton>
        </div>
      </div>
    ),
    examples: [
      {
        label: "Sticky action footer",
        caption: "Persistent bottom actions for flows — primary on the right, safe-area padding below.",
        node: (
          <PhoneFrame>
            <div className="space-y-2 pb-3">
              <SkeletonBar w="80%" />
              <SkeletonBar w="65%" />
            </div>
            <div className="flex gap-2 border-t border-gray-100 pt-3 dark:border-surface-line/60">
              <MockButton variant="secondary" size="sm" block>Back</MockButton>
              <MockButton size="sm" block>Continue</MockButton>
            </div>
          </PhoneFrame>
        ),
      },
    ],
  },

  // ---------- header ----------
  "header--header": {
    strip: <div className="w-[260px]"><MockHeaderBar /></div>,
    examples: [
      {
        label: "Screen header",
        caption: "Back affordance, screen title, and up to two trailing actions.",
        node: <div className="w-[280px]"><MockHeaderBar title="Conversations" /></div>,
      },
      {
        label: "Header lite",
        caption: "The compact 32px row for sub-screens and sheets.",
        node: (
          <div className="flex w-[280px] items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 dark:border-surface-line dark:bg-surface-raised">
            <span className="text-[12px] text-gray-500">‹ Back</span>
            <span className="flex-1 text-center text-[12.5px] font-medium text-gray-900 dark:text-gray-100">Details</span>
            <span className="text-[12px] text-primary-600 dark:text-primary-400">Edit</span>
          </div>
        ),
      },
    ],
  },

  // ---------- display ----------
  "display--list-item": {
    strip: (
      <div className="w-[260px] rounded-xl border border-gray-200 bg-white px-3 dark:border-surface-line dark:bg-surface-raised">
        <MockListItem title="Jane Miller" subtitle="jane@acme.com" leading={<MockAvatar size="sm" initials="JM" colorIndex={1} />} />
      </div>
    ),
    examples: [
      {
        label: "Leading, content, trailing",
        caption: "Avatar or icon leading, title with optional subtitle, chevron or control trailing.",
        node: (
          <div className="w-[270px] rounded-xl border border-gray-200 bg-white px-3 dark:border-surface-line dark:bg-surface-raised">
            <MockListItem title="Jane Miller" subtitle="jane@acme.com" leading={<MockAvatar size="sm" initials="JM" colorIndex={1} />} />
            <MockListItem title="Sam Rivera" subtitle="Last seen 2h ago" leading={<MockAvatar size="sm" initials="SR" colorIndex={2} online />} />
            <MockListItem title="Notifications" leading={<MockIconTile glyph={NAV_ICONS.bell} />} trailing="toggle" />
          </div>
        ),
      },
    ],
    doSketch: (
      <div className="w-[210px] rounded-lg border border-gray-200 bg-white px-3 dark:border-surface-line dark:bg-surface-raised">
        <MockListItem title="Jane Miller" subtitle="jane@acme.com" leading={<MockAvatar size="sm" initials="JM" colorIndex={1} />} />
      </div>
    ),
    dontSketch: (
      <div className="w-[210px] rounded-lg border border-gray-200 bg-white px-3 dark:border-surface-line dark:bg-surface-raised">
        <MockListItem
          title="Jane Miller — jane@acme.com, Acme Inc., last seen 2h ago, 4 open deals"
          trailing={<div className="flex gap-1"><MockButton size="sm" variant="secondary">Edit</MockButton><MockButton size="sm">Call</MockButton></div>}
        />
      </div>
    ),
  },
  "display--accordion": {
    strip: (
      <div className="w-[260px] overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-surface-line dark:bg-surface-raised">
        <div className="flex items-center justify-between border-b border-gray-100 px-3 py-2.5 dark:border-surface-line/60">
          <span className="text-[12.5px] font-medium text-gray-900 dark:text-gray-100">How does billing work?</span>
          <span className="text-[11px] text-gray-400">⌄</span>
        </div>
        <div className="border-b border-gray-100 px-3 py-2.5 dark:border-surface-line/60">
          <div className="flex items-center justify-between">
            <span className="text-[12.5px] font-medium text-gray-900 dark:text-gray-100">Can I cancel anytime?</span>
            <span className="text-[11px] text-gray-400">⌃</span>
          </div>
          <p className="mt-1.5 text-[11.5px] text-gray-500 dark:text-gray-400">Yes — plans are month to month, and you keep access until the period ends.</p>
        </div>
        <div className="flex items-center justify-between px-3 py-2.5">
          <span className="text-[12.5px] font-medium text-gray-900 dark:text-gray-100">Do you offer refunds?</span>
          <span className="text-[11px] text-gray-400">⌄</span>
        </div>
      </div>
    ),
    examples: [
      {
        label: "Progressive disclosure",
        caption: "Headers fully describe the hidden content; one section open by default.",
        node: (
          <div className="w-[280px] overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-surface-line dark:bg-surface-raised">
            <div className="flex items-center justify-between border-b border-gray-100 px-3 py-2.5 dark:border-surface-line/60">
              <span className="text-[12.5px] font-medium text-gray-900 dark:text-gray-100">How does billing work?</span>
              <span className="text-[11px] text-gray-400">⌄</span>
            </div>
            <div className="border-b border-gray-100 px-3 py-2.5 dark:border-surface-line/60">
              <div className="flex items-center justify-between">
                <span className="text-[12.5px] font-medium text-gray-900 dark:text-gray-100">Can I cancel anytime?</span>
                <span className="text-[11px] text-gray-400">⌃</span>
              </div>
              <p className="mt-1.5 text-[11.5px] text-gray-500 dark:text-gray-400">
                Yes — plans are month to month, and you keep access until the period ends.
              </p>
            </div>
            <div className="flex items-center justify-between px-3 py-2.5">
              <span className="text-[12.5px] font-medium text-gray-900 dark:text-gray-100">Do you offer refunds?</span>
              <span className="text-[11px] text-gray-400">⌄</span>
            </div>
          </div>
        ),
      },
    ],
  },
  "display--tooltip": {
    strip: <MockTooltip />,
    examples: [
      {
        label: "Hint on press",
        caption: "One short line naming the control; the arrow points at the trigger.",
        node: (
          <div className="flex flex-col items-center gap-0">
            <MockTooltip>Copy to clipboard</MockTooltip>
            <MockIconTile glyph={<span className="text-[13px]">⧉</span>} />
          </div>
        ),
      },
    ],
    doSketch: (
      <div className="flex flex-col items-center">
        <MockTooltip>Copy link</MockTooltip>
        <MockIconTile glyph={<span className="text-[13px]">⧉</span>} />
      </div>
    ),
    dontSketch: (
      <div className="flex flex-col items-center">
        <MockTooltip>Click this button to copy the current link to your clipboard for sharing</MockTooltip>
        <MockIconTile glyph={<span className="text-[13px]">⧉</span>} />
      </div>
    ),
  },
  "display--icon": {
    strip: (
      <Row>
        <MockIconTile glyph={NAV_ICONS.home} />
        <MockIconTile glyph={NAV_ICONS.search} tone="blue" />
        <MockIconTile glyph={NAV_ICONS.bell} />
        <MockIconTile glyph={NAV_ICONS.user} />
      </Row>
    ),
    examples: [
      {
        label: "Sizes and tones",
        caption: "Icon sizes come from the size/icon scale; color always from icon semantic tokens.",
        node: (
          <Row>
            <span className="text-gray-500 [&_svg]:h-3 [&_svg]:w-3">{NAV_ICONS.bell}</span>
            <span className="text-gray-500 [&_svg]:h-4 [&_svg]:w-4">{NAV_ICONS.bell}</span>
            <span className="text-gray-600 dark:text-gray-300 [&_svg]:h-5 [&_svg]:w-5">{NAV_ICONS.bell}</span>
            <span className="text-primary-600 dark:text-primary-400 [&_svg]:h-6 [&_svg]:w-6">{NAV_ICONS.bell}</span>
          </Row>
        ),
      },
    ],
  },
  "display--tile": {
    strip: (
      <div className="grid w-[260px] grid-cols-2 gap-2">
        {[
          { label: "Contacts", value: "1,204" },
          { label: "Open deals", value: "37" },
        ].map((t) => (
          <div key={t.label} className="rounded-xl border border-gray-200 bg-white p-3 text-left dark:border-surface-line dark:bg-surface-raised">
            <p className="text-[10.5px] text-gray-500">{t.label}</p>
            <p className="text-[17px] font-semibold text-gray-900 dark:text-gray-100">{t.value}</p>
          </div>
        ))}
      </div>
    ),
    examples: [
      {
        label: "Tile grid",
        caption: "Tappable summary tiles with a label, a stat or icon, and equal grid sizing.",
        node: (
          <div className="grid w-[280px] grid-cols-2 gap-2.5">
            {[
              { label: "Contacts", value: "1,204" },
              { label: "Open deals", value: "37" },
              { label: "Tasks due", value: "5" },
              { label: "Campaigns", value: "12" },
            ].map((t) => (
              <div key={t.label} className="rounded-xl border border-gray-200 bg-white p-3 text-left shadow-card dark:border-surface-line dark:bg-surface-raised">
                <p className="text-[10.5px] text-gray-500">{t.label}</p>
                <p className="text-[17px] font-semibold text-gray-900 dark:text-gray-100">{t.value}</p>
              </div>
            ))}
          </div>
        ),
      },
    ],
  },
  "display--message-card": {
    strip: (
      <div className="w-[260px] rounded-xl border border-gray-200 bg-white p-3 text-left shadow-card dark:border-surface-line dark:bg-surface-raised">
        <div className="flex items-center gap-2">
          <MockAvatar size="sm" initials="SR" colorIndex={2} />
          <div className="flex-1">
            <p className="text-[12px] font-semibold text-gray-900 dark:text-gray-100">Sam Rivera</p>
            <p className="text-[10px] text-gray-400">2:14 PM</p>
          </div>
          <MockBadge tone="blue">New</MockBadge>
        </div>
        <p className="mt-2 text-[12px] text-gray-600 dark:text-gray-400">Sounds good — let&apos;s do Thursday at 3:00 PM.</p>
      </div>
    ),
    examples: [
      {
        label: "Conversation preview",
        caption: "Sender, timestamp, snippet, and unread state in one scannable card.",
        node: (
          <div className="w-[280px] space-y-2">
            {[
              { name: "Sam Rivera", time: "2:14 PM", msg: "Sounds good — let's do Thursday at 3:00 PM.", unread: true, i: 2 },
              { name: "Jane Miller", time: "11:02 AM", msg: "Sent the proposal over. Let me know!", unread: false, i: 1 },
            ].map((m) => (
              <div key={m.name} className="rounded-xl border border-gray-200 bg-white p-3 text-left shadow-card dark:border-surface-line dark:bg-surface-raised">
                <div className="flex items-center gap-2">
                  <MockAvatar size="sm" initials={m.name.split(" ").map((x) => x[0]).join("")} colorIndex={m.i} />
                  <div className="flex-1">
                    <p className="text-[12px] font-semibold text-gray-900 dark:text-gray-100">{m.name}</p>
                    <p className="text-[10px] text-gray-400">{m.time}</p>
                  </div>
                  {m.unread && <MockBadge tone="blue">New</MockBadge>}
                </div>
                <p className="mt-2 text-[12px] text-gray-600 dark:text-gray-400">{m.msg}</p>
              </div>
            ))}
          </div>
        ),
      },
    ],
  },
  "display--system-alert": {
    strip: (
      <div className="flex w-[260px] items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 dark:bg-amber-900/20">
        <span className="text-[12px] text-amber-600 dark:text-amber-400">⚠</span>
        <span className="flex-1 text-left text-[11.5px] text-amber-800 dark:text-amber-300">You&apos;re offline. Changes will sync when you reconnect.</span>
        <span className="text-[11px] text-amber-400">✕</span>
      </div>
    ),
    examples: [
      {
        label: "App-level banner",
        caption: "Full-width, persistent until resolved or dismissed — for states that affect the whole app.",
        node: (
          <Col w="w-[290px]">
            <div className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 dark:bg-amber-900/20">
              <span className="text-[12px] text-amber-600 dark:text-amber-400">⚠</span>
              <span className="flex-1 text-left text-[11.5px] text-amber-800 dark:text-amber-300">You&apos;re offline. Changes will sync when you reconnect.</span>
              <span className="text-[11px] text-amber-400">✕</span>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-primary-50 px-3 py-2 dark:bg-primary-900/20">
              <span className="text-[12px] text-primary-600 dark:text-primary-400">ℹ</span>
              <span className="flex-1 text-left text-[11.5px] text-primary-800 dark:text-primary-300">A new version is available.</span>
              <span className="text-[11px] font-semibold text-primary-600 dark:text-primary-400">Update</span>
            </div>
          </Col>
        ),
      },
    ],
  },
  "display--carousel": {
    strip: (
      <div className="flex w-[260px] flex-col items-center gap-2">
        <div className="flex w-full items-center gap-2">
          <span className="text-gray-300 dark:text-gray-600">‹</span>
          <div className="h-20 flex-1 rounded-xl bg-gradient-to-br from-primary-100 to-violet-500/20 dark:from-primary-900/50 dark:to-violet-500/20" />
          <span className="text-gray-500 dark:text-gray-300">›</span>
        </div>
        <div className="flex gap-1.5">
          <span className="h-1.5 w-4 rounded-full bg-primary-600" />
          <span className="h-1.5 w-1.5 rounded-full bg-gray-300 dark:bg-surface-line" />
          <span className="h-1.5 w-1.5 rounded-full bg-gray-300 dark:bg-surface-line" />
        </div>
      </div>
    ),
    examples: [
      {
        label: "Slides with dot indicator",
        caption: "Swipeable slides; the elongated dot marks the current position, arrows appear on larger screens.",
        node: (
          <div className="flex w-[280px] flex-col items-center gap-2.5">
            <div className="flex w-full items-center gap-2">
              <span className="text-gray-300 dark:text-gray-600">‹</span>
              <div className="flex h-24 flex-1 items-end rounded-xl bg-gradient-to-br from-primary-100 to-violet-500/25 p-3 dark:from-primary-900/50 dark:to-violet-500/25">
                <span className="rounded bg-white/80 px-1.5 py-0.5 text-[10px] font-medium text-gray-800 dark:bg-black/40 dark:text-gray-100">2 of 5</span>
              </div>
              <span className="text-gray-500 dark:text-gray-300">›</span>
            </div>
            <div className="flex gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-gray-300 dark:bg-surface-line" />
              <span className="h-1.5 w-4 rounded-full bg-primary-600" />
              <span className="h-1.5 w-1.5 rounded-full bg-gray-300 dark:bg-surface-line" />
              <span className="h-1.5 w-1.5 rounded-full bg-gray-300 dark:bg-surface-line" />
              <span className="h-1.5 w-1.5 rounded-full bg-gray-300 dark:bg-surface-line" />
            </div>
          </div>
        ),
      },
    ],
  },
  "display--drag-item": {
    strip: (
      <div className="w-[260px] space-y-1.5">
        {["Qualify lead", "Send proposal"].map((t, i) => (
          <div key={t} className={`flex items-center gap-2.5 rounded-lg border bg-white px-3 py-2 dark:bg-surface-raised ${i === 0 ? "border-primary-300 shadow-lift dark:border-primary-700" : "border-gray-200 dark:border-surface-line"}`}>
            <span className="text-gray-300 dark:text-gray-600">⠿</span>
            <span className="text-[12.5px] text-gray-800 dark:text-gray-200">{t}</span>
          </div>
        ))}
      </div>
    ),
    examples: [
      {
        label: "Reorderable list",
        caption: "The grab handle signals draggability; the lifted item gets elevation and a tinted border.",
        node: (
          <div className="w-[270px] space-y-1.5">
            {[
              { t: "Qualify lead", lifted: false },
              { t: "Send proposal", lifted: true },
              { t: "Schedule demo", lifted: false },
            ].map((x) => (
              <div
                key={x.t}
                className={`flex items-center gap-2.5 rounded-lg border bg-white px-3 py-2 dark:bg-surface-raised ${
                  x.lifted ? "rotate-1 border-primary-300 shadow-lift dark:border-primary-700" : "border-gray-200 dark:border-surface-line"
                }`}
              >
                <span className="text-gray-300 dark:text-gray-600">⠿</span>
                <span className="text-[12.5px] text-gray-800 dark:text-gray-200">{x.t}</span>
              </div>
            ))}
          </div>
        ),
      },
    ],
  },
  "display--video-player": {
    strip: (
      <div className="relative w-[260px] overflow-hidden rounded-xl bg-gray-900">
        <div className="flex h-32 items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 pl-0.5 text-gray-900">▶</span>
        </div>
        <div className="absolute inset-x-0 bottom-0 flex items-center gap-2 bg-gradient-to-t from-black/70 px-3 pb-2 pt-4">
          <span className="text-[10px] text-white">0:42 / 3:10</span>
          <div className="h-1 flex-1 rounded-full bg-white/30">
            <div className="h-full w-1/4 rounded-full bg-primary-500" />
          </div>
        </div>
      </div>
    ),
    examples: [
      {
        label: "Player with controls",
        caption: "Play overlay, scrub bar, and timestamps in MM:SS; controls fade during playback.",
        node: (
          <div className="relative w-[280px] overflow-hidden rounded-xl bg-gray-900">
            <div className="flex h-36 items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/90 pl-0.5 text-gray-900">▶</span>
            </div>
            <div className="absolute inset-x-0 bottom-0 flex items-center gap-2 bg-gradient-to-t from-black/70 px-3 pb-2.5 pt-5">
              <span className="text-[10px] text-white">0:42 / 3:10</span>
              <div className="h-1 flex-1 rounded-full bg-white/30">
                <div className="h-full w-1/4 rounded-full bg-primary-500" />
              </div>
              <span className="text-[11px] text-white">⛶</span>
            </div>
          </div>
        ),
      },
    ],
  },

  // ---------- progress ----------
  "progress--progress-indicator": {
    strip: (
      <div className="flex w-[260px] items-center gap-5">
        <div className="flex-1"><MockProgressBar value={60} /></div>
        <MockProgressCircle value={70} />
      </div>
    ),
    examples: [
      {
        label: "Bar, circle, and pill",
        caption: "Determinate forms show real progress; use the indeterminate bar only when the total is unknown.",
        node: (
          <div className="flex w-[280px] flex-col gap-4">
            <MockProgressBar value={60} />
            <div className="flex items-center justify-center gap-6">
              <MockProgressCircle value={70} />
              <span className="rounded-full bg-primary-50 px-3 py-1 text-[11px] font-semibold text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">
                7 of 10 done
              </span>
            </div>
          </div>
        ),
      },
    ],
    doSketch: (
      <div className="w-[180px]">
        <p className="mb-1 text-[10px] text-gray-500">Uploading… 80%</p>
        <MockProgressBar value={80} />
      </div>
    ),
    dontSketch: (
      <div className="w-[180px]">
        <p className="mb-1 text-[10px] text-gray-500">Loading…</p>
        <MockProgressBar value={95} />
        <p className="mt-1 text-[10px] text-gray-400">Stuck at 95% with no estimate</p>
      </div>
    ),
  },
  "progress--progress-step": {
    strip: <div className="w-[260px]"><MockSteps /></div>,
    examples: [
      {
        label: "Stepper",
        caption: "Completed steps get a check, the current step is outlined, upcoming steps stay muted.",
        node: <div className="w-[290px]"><MockSteps steps={["Details", "Address", "Payment", "Review"]} current={2} /></div>,
      },
    ],
    doSketch: <div className="w-[210px]"><MockSteps steps={["Details", "Review"]} current={1} /></div>,
    dontSketch: <div className="w-[210px]"><MockTabs items={["Details", "Review"]} active={1} /></div>,
  },

  // ---------- avatar ----------
  "avatar--avatar": {
    strip: (
      <Row>
        <MockAvatar size="lg" initials="JM" colorIndex={1} />
        <MockAvatar size="md" initials="SR" colorIndex={2} online />
        <MockAvatar size="sm" initials="AK" />
        <MockAvatar size="xs" initials="TL" colorIndex={3} />
      </Row>
    ),
    examples: [
      {
        label: "Sizes and presence",
        caption: "Sizes come from the avatar scale; the online indicator only where presence is live.",
        node: (
          <Row>
            <MockAvatar size="lg" initials="JM" colorIndex={1} />
            <MockAvatar size="md" initials="SR" colorIndex={2} online />
            <MockAvatar size="sm" initials="AK" />
            <MockAvatar size="xs" initials="TL" colorIndex={3} />
          </Row>
        ),
      },
      {
        label: "Fallback chain",
        caption: "Photo → initials → generic icon, in that order.",
        node: (
          <Row>
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary-400 to-violet-500 text-[13px] font-semibold text-white">📷</span>
            <MockAvatar initials="JM" colorIndex={1} />
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-400 dark:bg-surface-overlay">{NAV_ICONS.user}</span>
          </Row>
        ),
      },
    ],
    doSketch: <MockAvatar initials="JM" colorIndex={1} online />,
    dontSketch: (
      <span className="flex h-10 w-16 items-center justify-center rounded-lg bg-primary-100 text-[13px] font-semibold text-primary-700">JM</span>
    ),
  },
  "avatar--avatar-group": {
    strip: <MockAvatarGroup count={3} overflow={4} />,
    examples: [
      {
        label: "Overlapping group",
        caption: "Up to a handful of members, then a +N overflow count.",
        node: <MockAvatarGroup count={4} overflow={6} />,
      },
    ],
    doSketch: <MockAvatarGroup count={3} overflow={4} />,
    dontSketch: <MockAvatarGroup count={5} />,
  },
  "avatar--avatar-action-icon": {
    strip: (
      <span className="relative inline-flex">
      <MockAvatar size="lg" initials="JM" colorIndex={1} />
        <span className="absolute -bottom-0.5 -right-0.5 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-primary-600 text-[11px] text-white dark:border-surface-raised">
          ＋
        </span>
      </span>
    ),
    examples: [
      {
        label: "Attached action",
        caption: "A small action button docked to the avatar — add, edit, or camera swap.",
        node: (
          <Row>
            <span className="relative inline-flex">
              <MockAvatar size="lg" initials="JM" colorIndex={1} />
              <span className="absolute -bottom-0.5 -right-0.5 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-primary-600 text-[11px] text-white dark:border-surface-raised">＋</span>
            </span>
            <span className="relative inline-flex">
              <MockAvatar size="lg" initials="SR" colorIndex={2} />
              <span className="absolute -bottom-0.5 -right-0.5 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-gray-700 text-[10px] text-white dark:border-surface-raised">✎</span>
            </span>
          </Row>
        ),
      },
    ],
  },
  "avatar--avatar-with-label": {
    strip: (
      <div className="flex items-center gap-2.5">
        <MockAvatar initials="JM" colorIndex={1} />
        <div className="text-left">
          <p className="text-[13px] font-medium text-gray-900 dark:text-gray-100">Jane Miller</p>
          <p className="text-[11px] text-gray-500">Account owner</p>
        </div>
      </div>
    ),
    examples: [
      {
        label: "Identity row",
        caption: "Avatar plus name and secondary line — the standard person reference.",
        node: (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2.5">
              <MockAvatar initials="JM" colorIndex={1} />
              <div className="text-left">
                <p className="text-[13px] font-medium text-gray-900 dark:text-gray-100">Jane Miller</p>
                <p className="text-[11px] text-gray-500">Account owner</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <MockAvatar initials="SR" colorIndex={2} online />
              <div className="text-left">
                <p className="text-[13px] font-medium text-gray-900 dark:text-gray-100">Sam Rivera</p>
                <p className="text-[11px] text-gray-500">Online</p>
              </div>
            </div>
          </div>
        ),
      },
    ],
  },

  // ---------- badge / tag ----------
  "badge--badge": {
    strip: (
      <Row>
        <MockBadge tone="green" dot>Active</MockBadge>
        <MockBadge tone="amber" dot>Pending</MockBadge>
        <MockBadge tone="red" dot>Failed</MockBadge>
        <MockBadge tone="blue">New</MockBadge>
        <MockBadge tone="gray">Draft</MockBadge>
      </Row>
    ),
    examples: [
      {
        label: "Status set",
        caption: "Color maps to meaning consistently: green success, amber pending, red failure.",
        node: (
          <Row>
            <MockBadge tone="green" dot>Active</MockBadge>
            <MockBadge tone="amber" dot>Pending</MockBadge>
            <MockBadge tone="red" dot>Failed</MockBadge>
            <MockBadge tone="blue">New</MockBadge>
            <MockBadge tone="gray">Draft</MockBadge>
          </Row>
        ),
      },
      {
        label: "Count badge",
        node: (
          <span className="relative inline-flex">
            <MockIconTile glyph={NAV_ICONS.bell} />
            <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">3</span>
          </span>
        ),
      },
    ],
    doSketch: <MockBadge tone="green" dot>Active</MockBadge>,
    dontSketch: <MockBadge tone="red" dot>Everything is fine</MockBadge>,
  },
  "tag--tag": {
    strip: (
      <Row>
        <MockTag color="blue">Marketing</MockTag>
        <MockTag color="green" close>VIP</MockTag>
        <MockTag color="gray" count={3}>Segments</MockTag>
      </Row>
    ),
    examples: [
      {
        label: "Tag row with count",
        caption: "One or two words each; the count variant compacts overflow.",
        node: (
          <Row>
            <MockTag color="blue" close>Marketing</MockTag>
            <MockTag color="violet" close>Q3 campaign</MockTag>
            <MockTag color="green" close>VIP</MockTag>
            <MockTag color="gray">+3</MockTag>
          </Row>
        ),
      },
      {
        label: "Color range",
        caption: "Color distinguishes groups, not status — status is a badge's job.",
        node: (
          <Row>
            <MockTag color="gray">Default</MockTag>
            <MockTag color="blue">Blue</MockTag>
            <MockTag color="green">Green</MockTag>
            <MockTag color="amber">Amber</MockTag>
            <MockTag color="red">Red</MockTag>
            <MockTag color="violet">Violet</MockTag>
          </Row>
        ),
      },
    ],
    doSketch: (
      <Row>
        <MockTag color="blue" close>Marketing</MockTag>
        <MockTag color="green" close>VIP</MockTag>
      </Row>
    ),
    dontSketch: (
      <Row>
        <MockTag color="red">Payment failed on retry</MockTag>
      </Row>
    ),
  },
  "tag--tag-group": {
    strip: (
      <Row gap="gap-1.5">
        <MockTag color="blue">Sales</MockTag>
        <MockTag color="blue">Onboarding</MockTag>
        <MockTag color="blue">Renewal</MockTag>
        <MockTag>+2</MockTag>
      </Row>
    ),
    examples: [
      {
        label: "Wrapped group with overflow",
        caption: "The group owns spacing and wrapping; extras collapse into a +N tag.",
        node: (
          <div className="w-[250px]">
            <Row gap="gap-1.5">
              <MockTag color="blue">Sales</MockTag>
              <MockTag color="blue">Onboarding</MockTag>
              <MockTag color="blue">Renewal</MockTag>
              <MockTag color="blue">Upsell</MockTag>
              <MockTag>+2</MockTag>
            </Row>
          </div>
        ),
      },
    ],
  },

  // ---------- feedback ----------
  "feedback--empty-state": {
    strip: (
      <div className="flex w-[260px] flex-col items-center gap-2 rounded-xl border border-gray-200 bg-white p-5 dark:border-surface-line dark:bg-surface-raised">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-50 text-primary-500 dark:bg-primary-900/40 [&_svg]:h-6 [&_svg]:w-6">{NAV_ICONS.user}</span>
        <p className="text-[13px] font-semibold text-gray-900 dark:text-gray-100">No contacts yet</p>
        <p className="text-center text-[11.5px] text-gray-500">Add your first contact to start tracking conversations.</p>
        <MockButton size="sm">Add contact</MockButton>
      </div>
    ),
    examples: [
      {
        label: "First-run",
        caption: "Say what would be here and how to get it — illustration, one line, one CTA.",
        node: (
          <div className="flex w-[270px] flex-col items-center gap-2 rounded-xl border border-gray-200 bg-white p-5 dark:border-surface-line dark:bg-surface-raised">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-50 text-primary-500 dark:bg-primary-900/40 [&_svg]:h-6 [&_svg]:w-6">{NAV_ICONS.user}</span>
            <p className="text-[13px] font-semibold text-gray-900 dark:text-gray-100">No contacts yet</p>
            <p className="text-center text-[11.5px] text-gray-500">Add your first contact to start tracking conversations.</p>
            <MockButton size="sm">Add contact</MockButton>
          </div>
        ),
      },
      {
        label: "No results",
        caption: "Differentiate 'nothing exists' from 'nothing matches' — and offer to clear filters.",
        node: (
          <div className="flex w-[270px] flex-col items-center gap-2 rounded-xl border border-gray-200 bg-white p-5 dark:border-surface-line dark:bg-surface-raised">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400 dark:bg-surface-overlay [&_svg]:h-6 [&_svg]:w-6">{NAV_ICONS.search}</span>
            <p className="text-[13px] font-semibold text-gray-900 dark:text-gray-100">No matches</p>
            <p className="text-center text-[11.5px] text-gray-500">Nothing matches your current filters.</p>
            <MockButton size="sm" variant="secondary">Clear filters</MockButton>
          </div>
        ),
      },
    ],
    doSketch: (
      <div className="flex flex-col items-center gap-1.5">
        <p className="text-[12px] font-semibold text-gray-900 dark:text-gray-100">No contacts yet</p>
        <MockButton size="sm">Add contact</MockButton>
      </div>
    ),
    dontSketch: <p className="text-[12px] text-gray-400">No data</p>,
  },

  // ---------- utilities ----------
  "utilities--utilities": {
    strip: (
      <Row>
        <MockSnackbar message="Workflow published" tone="success" />
      </Row>
    ),
    examples: [
      {
        label: "Notification",
        caption: "The notification token set styles in-app notification rows and their actions.",
        node: (
          <div className="w-[270px] rounded-xl border border-gray-200 bg-white p-3 text-left shadow-card dark:border-surface-line dark:bg-surface-raised">
            <div className="flex items-start gap-2.5">
              <MockAvatar size="sm" initials="JM" colorIndex={1} />
              <div className="flex-1">
                <p className="text-[12px] text-gray-800 dark:text-gray-200">
                  <span className="font-semibold">Jane Miller</span> assigned you a task
                </p>
                <p className="text-[10px] text-gray-400">5 minutes ago</p>
                <div className="mt-2 flex gap-2">
                  <MockButton size="sm">View task</MockButton>
                  <MockButton size="sm" variant="secondary">Dismiss</MockButton>
                </div>
              </div>
              <span className="mt-1 h-2 w-2 rounded-full bg-primary-500" />
            </div>
          </div>
        ),
      },
    ],
  },
};

export function getExamples(slug: string): ComponentExamples | null {
  return REGISTRY[slug] ?? null;
}
