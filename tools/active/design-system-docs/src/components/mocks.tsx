import type { ReactNode } from "react";

// Illustrative HighRise-styled mock primitives. These are documentation
// illustrations built with Tailwind — not the production components. They use
// the HighRise ramps (primary blue #2970ff/#155eef, gray ramp, 8px radius) and
// render correctly in both light and dark themes.

export function PhoneFrame({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`relative w-[264px] overflow-hidden rounded-[28px] border border-gray-200 bg-white shadow-lift dark:border-surface-line dark:bg-surface-raised ${className}`}
    >
      <div className="flex justify-center pt-2.5">
        <div className="h-[18px] w-[92px] rounded-full bg-gray-900 dark:bg-black" />
      </div>
      <div className="px-4 pb-3 pt-3">{children}</div>
      <div className="flex justify-center pb-2">
        <div className="h-1 w-[96px] rounded-full bg-gray-300 dark:bg-surface-line" />
      </div>
    </div>
  );
}

export function MockButton({
  children,
  variant = "primary",
  size = "md",
  block = false,
  disabled = false,
}: {
  children: ReactNode;
  variant?: "primary" | "secondary" | "tertiary" | "destructive" | "link";
  size?: "sm" | "md" | "lg";
  block?: boolean;
  disabled?: boolean;
}) {
  const sizes = { sm: "h-8 px-3 text-[13px]", md: "h-9 px-4 text-[13px]", lg: "h-11 px-5 text-[14px]" };
  const variants: Record<string, string> = {
    primary: "bg-primary-600 text-white shadow-sm",
    secondary:
      "border border-gray-300 bg-white text-gray-800 dark:border-surface-line dark:bg-surface-overlay dark:text-gray-100",
    tertiary: "bg-transparent text-gray-700 dark:text-gray-300",
    destructive: "bg-red-600 text-white shadow-sm",
    link: "bg-transparent px-0 text-primary-600 underline underline-offset-2 dark:text-primary-400",
  };
  return (
    <span
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg font-medium ${sizes[size]} ${variants[variant]} ${
        block ? "w-full" : ""
      } ${disabled ? "opacity-45" : ""}`}
    >
      {children}
    </span>
  );
}

export function MockTag({
  children,
  color = "gray",
  close = false,
  count,
}: {
  children: ReactNode;
  color?: "gray" | "blue" | "green" | "amber" | "red" | "violet";
  close?: boolean;
  count?: number;
}) {
  const colors: Record<string, string> = {
    gray: "bg-gray-100 text-gray-700 dark:bg-surface-overlay dark:text-gray-300",
    blue: "bg-primary-50 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300",
    green: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
    amber: "bg-amber-50 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    red: "bg-red-50 text-red-700 dark:bg-red-900/40 dark:text-red-300",
    violet: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[12px] font-medium ${colors[color]}`}>
      {children}
      {typeof count === "number" && (
        <span className="rounded bg-black/10 px-1 text-[10px] dark:bg-white/15">{count}</span>
      )}
      {close && <span className="text-[11px] opacity-60">✕</span>}
    </span>
  );
}

export function MockBadge({
  children,
  tone = "gray",
  dot = false,
}: {
  children?: ReactNode;
  tone?: "gray" | "blue" | "green" | "amber" | "red";
  dot?: boolean;
}) {
  const tones: Record<string, string> = {
    gray: "bg-gray-100 text-gray-700 dark:bg-surface-overlay dark:text-gray-300",
    blue: "bg-primary-50 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300",
    green: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
    amber: "bg-amber-50 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    red: "bg-red-50 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  };
  const dots: Record<string, string> = {
    gray: "bg-gray-500",
    blue: "bg-primary-500",
    green: "bg-emerald-500",
    amber: "bg-amber-500",
    red: "bg-red-500",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium ${tones[tone]}`}>
      {dot && <span className={`h-1.5 w-1.5 rounded-full ${dots[tone]}`} />}
      {children}
    </span>
  );
}

export function MockField({
  label,
  placeholder = "Placeholder",
  value,
  state = "default",
  hint,
  leadingIcon = false,
}: {
  label?: string;
  placeholder?: string;
  value?: string;
  state?: "default" | "focus" | "error" | "disabled";
  hint?: string;
  leadingIcon?: boolean;
}) {
  const borders: Record<string, string> = {
    default: "border-gray-300 dark:border-surface-line",
    focus: "border-primary-600 ring-2 ring-primary-100 dark:ring-primary-900/50",
    error: "border-red-500 ring-2 ring-red-100 dark:ring-red-900/40",
    disabled: "border-gray-200 bg-gray-50 opacity-60 dark:border-surface-line dark:bg-surface-overlay",
  };
  return (
    <div className="w-full text-left">
      {label && <p className="mb-1 text-[12px] font-medium text-gray-700 dark:text-gray-300">{label}</p>}
      <div
        className={`flex h-9 items-center gap-2 rounded-lg border bg-white px-3 dark:bg-surface-raised ${borders[state]}`}
      >
        {leadingIcon && (
          <svg className="h-3.5 w-3.5 text-gray-400" viewBox="0 0 16 16" fill="none" aria-hidden>
            <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        )}
        <span className={`text-[13px] ${value ? "text-gray-900 dark:text-gray-100" : "text-gray-400"}`}>
          {value ?? placeholder}
        </span>
      </div>
      {hint && (
        <p className={`mt-1 text-[11px] ${state === "error" ? "text-red-600 dark:text-red-400" : "text-gray-500"}`}>
          {hint}
        </p>
      )}
    </div>
  );
}

export function MockToggle({ on = true, loading = false }: { on?: boolean; loading?: boolean }) {
  return (
    <span
      className={`inline-flex h-6 w-11 items-center rounded-full p-0.5 transition-colors ${
        on ? "bg-primary-600" : "bg-gray-300 dark:bg-surface-line"
      }`}
    >
      <span
        className={`flex h-5 w-5 items-center justify-center rounded-full bg-white shadow transition-transform ${
          on ? "translate-x-5" : ""
        }`}
      >
        {loading && <span className="h-3 w-3 animate-spin rounded-full border-[1.5px] border-primary-300 border-t-primary-600" />}
      </span>
    </span>
  );
}

export function MockCheckbox({
  checked = true,
  indeterminate = false,
  label,
}: {
  checked?: boolean;
  indeterminate?: boolean;
  label?: string;
}) {
  return (
    <span className="inline-flex items-center gap-2">
      <span
        className={`flex h-[18px] w-[18px] items-center justify-center rounded border ${
          checked || indeterminate
            ? "border-primary-600 bg-primary-600 text-white"
            : "border-gray-300 bg-white dark:border-surface-line dark:bg-surface-raised"
        }`}
      >
        {indeterminate ? (
          <span className="h-0.5 w-2.5 rounded bg-white" />
        ) : checked ? (
          <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none" aria-hidden>
            <path d="M2.5 6.5l2.2 2.2L9.5 3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : null}
      </span>
      {label && <span className="text-[13px] text-gray-800 dark:text-gray-200">{label}</span>}
    </span>
  );
}

export function MockRadio({ selected = false, label }: { selected?: boolean; label?: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span
        className={`flex h-[18px] w-[18px] items-center justify-center rounded-full border ${
          selected ? "border-primary-600" : "border-gray-300 dark:border-surface-line"
        } bg-white dark:bg-surface-raised`}
      >
        {selected && <span className="h-2.5 w-2.5 rounded-full bg-primary-600" />}
      </span>
      {label && <span className="text-[13px] text-gray-800 dark:text-gray-200">{label}</span>}
    </span>
  );
}

const AVATAR_COLORS = [
  "bg-primary-100 text-primary-700",
  "bg-violet-500/15 text-violet-600 dark:text-violet-400",
  "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300",
  "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
];

export function MockAvatar({
  initials = "AK",
  size = "md",
  online = false,
  colorIndex = 0,
}: {
  initials?: string;
  size?: "xs" | "sm" | "md" | "lg";
  online?: boolean;
  colorIndex?: number;
}) {
  const sizes = { xs: "h-6 w-6 text-[9px]", sm: "h-8 w-8 text-[11px]", md: "h-10 w-10 text-[13px]", lg: "h-14 w-14 text-[17px]" };
  return (
    <span className="relative inline-flex">
      <span
        className={`inline-flex items-center justify-center rounded-full font-semibold ${sizes[size]} ${AVATAR_COLORS[colorIndex % AVATAR_COLORS.length]}`}
      >
        {initials}
      </span>
      {online && (
        <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500 dark:border-surface-raised" />
      )}
    </span>
  );
}

export function MockAvatarGroup({ count = 3, overflow }: { count?: number; overflow?: number }) {
  const people = ["AK", "JM", "SR", "TL", "PD"].slice(0, count);
  return (
    <span className="inline-flex -space-x-2">
      {people.map((p, i) => (
        <span key={p} className="rounded-full ring-2 ring-white dark:ring-surface-raised">
          <MockAvatar initials={p} size="sm" colorIndex={i} />
        </span>
      ))}
      {overflow && (
        <span className="z-10 inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-[11px] font-semibold text-gray-600 ring-2 ring-white dark:bg-surface-overlay dark:text-gray-300 dark:ring-surface-raised">
          +{overflow}
        </span>
      )}
    </span>
  );
}

export function MockListItem({
  title,
  subtitle,
  leading,
  trailing = "chevron",
}: {
  title: string;
  subtitle?: string;
  leading?: ReactNode;
  trailing?: "chevron" | "toggle" | "none" | ReactNode;
}) {
  return (
    <div className="flex w-full items-center gap-3 border-b border-gray-100 py-2.5 last:border-0 dark:border-surface-line/60">
      {leading}
      <div className="min-w-0 flex-1 text-left">
        <p className="truncate text-[13px] font-medium text-gray-900 dark:text-gray-100">{title}</p>
        {subtitle && <p className="truncate text-[11px] text-gray-500 dark:text-gray-400">{subtitle}</p>}
      </div>
      {trailing === "chevron" ? (
        <svg className="h-4 w-4 text-gray-400" viewBox="0 0 16 16" fill="none" aria-hidden>
          <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : trailing === "toggle" ? (
        <MockToggle on />
      ) : trailing === "none" ? null : (
        trailing
      )}
    </div>
  );
}

export function Scrim({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gray-900/70 p-4 dark:bg-black/60 ${className}`}>
      {children}
    </div>
  );
}

export function MockSheet({
  title = "Sheet title",
  children,
  footer = true,
}: {
  title?: string;
  children?: ReactNode;
  footer?: boolean;
}) {
  return (
    <div className="mx-auto w-full max-w-[248px] rounded-t-2xl bg-white pb-3 shadow-modal dark:bg-surface-raised">
      <div className="flex justify-center pt-2">
        <div className="h-1 w-9 rounded-full bg-gray-300 dark:bg-surface-line" />
      </div>
      <div className="flex items-center justify-between px-4 pb-2 pt-2">
        <p className="text-[13px] font-semibold text-gray-900 dark:text-gray-100">{title}</p>
        <span className="text-[12px] text-gray-400">✕</span>
      </div>
      <div className="px-4 text-left text-[12px] text-gray-600 dark:text-gray-400">{children}</div>
      {footer && (
        <div className="mt-3 flex gap-2 px-4">
          <MockButton variant="secondary" size="sm" block>
            Cancel
          </MockButton>
          <MockButton size="sm" block>
            Confirm
          </MockButton>
        </div>
      )}
    </div>
  );
}

export function MockDialog({
  title = "Delete this contact?",
  body = "This can't be undone. The contact and their history will be removed.",
  destructive = true,
}: {
  title?: string;
  body?: string;
  destructive?: boolean;
}) {
  return (
    <div className="mx-auto w-full max-w-[230px] rounded-xl bg-white p-4 text-left shadow-modal dark:bg-surface-raised">
      <p className="text-[13px] font-semibold text-gray-900 dark:text-gray-100">{title}</p>
      <p className="mt-1 text-[12px] leading-4 text-gray-600 dark:text-gray-400">{body}</p>
      <div className="mt-3 flex justify-end gap-2">
        <MockButton variant="secondary" size="sm">
          Cancel
        </MockButton>
        <MockButton variant={destructive ? "destructive" : "primary"} size="sm">
          {destructive ? "Delete" : "Confirm"}
        </MockButton>
      </div>
    </div>
  );
}

export function MockSnackbar({
  message = "Contact added",
  action,
  tone = "neutral",
}: {
  message?: string;
  action?: string;
  tone?: "neutral" | "success" | "error";
}) {
  const icons = { neutral: null, success: "✓", error: "!" };
  const iconBg = { neutral: "", success: "bg-emerald-500", error: "bg-red-500" };
  return (
    <div className="inline-flex w-full max-w-[250px] items-center gap-2.5 rounded-xl bg-gray-900 px-3.5 py-2.5 text-left shadow-modal dark:bg-surface-overlay dark:ring-1 dark:ring-surface-line">
      {icons[tone] && (
        <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white ${iconBg[tone]}`}>
          {icons[tone]}
        </span>
      )}
      <span className="flex-1 text-[12px] text-white dark:text-gray-100">{message}</span>
      {action && <span className="text-[12px] font-semibold text-primary-300">{action}</span>}
    </div>
  );
}

export function MockAlert({
  tone = "info",
  title,
  body,
  actions = false,
}: {
  tone?: "info" | "success" | "warning" | "error";
  title: string;
  body?: string;
  actions?: boolean;
}) {
  const tones: Record<string, { wrap: string; icon: string; glyph: string }> = {
    info: { wrap: "border-primary-200 bg-primary-50 dark:border-primary-900 dark:bg-primary-900/20", icon: "text-primary-600 dark:text-primary-400", glyph: "ℹ" },
    success: { wrap: "border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-900/20", icon: "text-emerald-600 dark:text-emerald-400", glyph: "✓" },
    warning: { wrap: "border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-900/20", icon: "text-amber-600 dark:text-amber-400", glyph: "⚠" },
    error: { wrap: "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-900/20", icon: "text-red-600 dark:text-red-400", glyph: "✕" },
  };
  const t = tones[tone];
  return (
    <div className={`w-full rounded-lg border p-3 text-left ${t.wrap}`}>
      <div className="flex gap-2">
        <span className={`text-[13px] leading-4 ${t.icon}`}>{t.glyph}</span>
        <div className="flex-1">
          <p className="text-[12.5px] font-semibold leading-4 text-gray-900 dark:text-gray-100">{title}</p>
          {body && <p className="mt-0.5 text-[11.5px] leading-4 text-gray-600 dark:text-gray-400">{body}</p>}
          {actions && (
            <p className="mt-1.5 text-[11.5px] font-semibold text-gray-700 dark:text-gray-300">
              Learn more <span className="ml-3 text-gray-400">Dismiss</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export function MockTabs({ items = ["Overview", "Activity", "Notes"], active = 0 }: { items?: string[]; active?: number }) {
  return (
    <div className="flex w-full gap-4 border-b border-gray-200 dark:border-surface-line">
      {items.map((it, i) => (
        <span
          key={it}
          className={`-mb-px border-b-2 pb-1.5 text-[12.5px] ${
            i === active
              ? "border-primary-600 font-semibold text-primary-700 dark:text-primary-400"
              : "border-transparent text-gray-500 dark:text-gray-400"
          }`}
        >
          {it}
        </span>
      ))}
    </div>
  );
}

export function MockSegmented({ items = ["Day", "Week", "Month"], active = 0 }: { items?: string[]; active?: number }) {
  return (
    <div className="inline-flex rounded-lg bg-gray-100 p-0.5 dark:bg-surface-overlay">
      {items.map((it, i) => (
        <span
          key={it}
          className={`rounded-md px-3 py-1 text-[12px] font-medium ${
            i === active
              ? "bg-white text-gray-900 shadow-sm dark:bg-surface-raised dark:text-gray-100"
              : "text-gray-500 dark:text-gray-400"
          }`}
        >
          {it}
        </span>
      ))}
    </div>
  );
}

const NAV_ICONS: Record<string, ReactNode> = {
  home: (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden>
      <path d="M3 9l7-6 7 6v8a1 1 0 01-1 1h-4v-5H8v5H4a1 1 0 01-1-1V9z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  ),
  search: (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden>
      <circle cx="9" cy="9" r="5.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M13.5 13.5L17 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  bell: (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden>
      <path d="M5 14V9a5 5 0 0110 0v5l1.5 2h-13L5 14z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M8.5 18a1.5 1.5 0 003 0" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  ),
  user: (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden>
      <circle cx="10" cy="7" r="3.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3.5 17a6.5 6.5 0 0113 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
};

export function MockBottomNav({ active = 0 }: { active?: number }) {
  const items = [
    { label: "Home", icon: "home" },
    { label: "Search", icon: "search" },
    { label: "Alerts", icon: "bell", badge: true },
    { label: "Profile", icon: "user" },
  ];
  return (
    <div className="flex w-full items-center justify-around rounded-xl border border-gray-200 bg-white px-1 py-2 shadow-card dark:border-surface-line dark:bg-surface-raised">
      {items.map((it, i) => (
        <span
          key={it.label}
          className={`relative flex flex-col items-center gap-0.5 px-2 ${
            i === active ? "text-primary-600 dark:text-primary-400" : "text-gray-400"
          }`}
        >
          {NAV_ICONS[it.icon]}
          {it.badge && <span className="absolute -top-0.5 right-1 h-1.5 w-1.5 rounded-full bg-red-500" />}
          <span className={`text-[9px] ${i === active ? "font-semibold" : ""}`}>{it.label}</span>
        </span>
      ))}
    </div>
  );
}

export function MockHeaderBar({
  title = "Contacts",
  back = true,
  actions = 2,
}: {
  title?: string;
  back?: boolean;
  actions?: number;
}) {
  return (
    <div className="flex w-full items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2.5 shadow-card dark:border-surface-line dark:bg-surface-raised">
      {back && (
        <svg className="h-4 w-4 text-gray-600 dark:text-gray-300" viewBox="0 0 16 16" fill="none" aria-hidden>
          <path d="M10 4L6 8l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
      <span className="flex-1 text-[13px] font-semibold text-gray-900 dark:text-gray-100">{title}</span>
      {Array.from({ length: actions }).map((_, i) => (
        <span key={i} className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-gray-500 dark:bg-surface-overlay dark:text-gray-400">
          {i === 0 ? NAV_ICONS.search : NAV_ICONS.bell}
        </span>
      ))}
    </div>
  );
}

export function MockProgressBar({ value = 60, tone = "primary" }: { value?: number; tone?: "primary" | "success" }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-surface-line">
      <div
        className={`h-full rounded-full ${tone === "success" ? "bg-emerald-500" : "bg-primary-600"}`}
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

export function MockProgressCircle({ value = 70 }: { value?: number }) {
  const r = 15;
  const c = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 40 40" className="h-10 w-10 -rotate-90" aria-hidden>
      <circle cx="20" cy="20" r={r} className="stroke-gray-200 dark:stroke-surface-line" strokeWidth="4" fill="none" />
      <circle
        cx="20"
        cy="20"
        r={r}
        className="stroke-primary-600"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - value / 100)}
      />
    </svg>
  );
}

export function MockSteps({ steps = ["Details", "Address", "Review"], current = 1 }: { steps?: string[]; current?: number }) {
  return (
    <div className="flex w-full items-center">
      {steps.map((s, i) => (
        <div key={s} className={`flex items-center ${i < steps.length - 1 ? "flex-1" : ""}`}>
          <div className="flex flex-col items-center gap-1">
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold ${
                i < current
                  ? "bg-primary-600 text-white"
                  : i === current
                    ? "border-2 border-primary-600 bg-white text-primary-700 dark:bg-surface-raised dark:text-primary-400"
                    : "border border-gray-300 bg-white text-gray-400 dark:border-surface-line dark:bg-surface-raised"
              }`}
            >
              {i < current ? "✓" : i + 1}
            </span>
            <span className="text-[9px] text-gray-500 dark:text-gray-400">{s}</span>
          </div>
          {i < steps.length - 1 && (
            <div className={`mx-1 mb-4 h-0.5 flex-1 rounded ${i < current ? "bg-primary-600" : "bg-gray-200 dark:bg-surface-line"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

export function MockSlider({ value = 60, showValue = true }: { value?: number; showValue?: boolean }) {
  return (
    <div className="relative w-full py-2">
      <div className="h-1.5 w-full rounded-full bg-gray-200 dark:bg-surface-line">
        <div className="h-full rounded-full bg-primary-600" style={{ width: `${value}%` }} />
      </div>
      <span
        className="absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full border-2 border-primary-600 bg-white shadow dark:bg-gray-100"
        style={{ left: `calc(${value}% - 10px)` }}
      />
      {showValue && (
        <span
          className="absolute -top-4 rounded bg-gray-900 px-1.5 py-0.5 text-[9px] text-white dark:bg-surface-overlay"
          style={{ left: `calc(${value}% - 12px)` }}
        >
          {value}
        </span>
      )}
    </div>
  );
}

export function MockTooltip({ children = "Copy to clipboard", placement = "top" }: { children?: ReactNode; placement?: "top" | "bottom" }) {
  return (
    <span className="relative inline-flex flex-col items-center">
      {placement === "bottom" && <span className="h-2 w-2 rotate-45 bg-gray-900 dark:bg-surface-overlay" style={{ marginBottom: -4 }} />}
      <span className="rounded-md bg-gray-900 px-2 py-1 text-[11px] text-white shadow dark:bg-surface-overlay dark:ring-1 dark:ring-surface-line">
        {children}
      </span>
      {placement === "top" && <span className="h-2 w-2 rotate-45 bg-gray-900 dark:bg-surface-overlay" style={{ marginTop: -4 }} />}
    </span>
  );
}

export function MockMenu({
  items = [
    { label: "Edit", icon: "✎" },
    { label: "Duplicate", icon: "⧉" },
    { label: "Delete", icon: "🗑", destructive: true },
  ],
}: {
  items?: { label: string; icon?: string; destructive?: boolean }[];
}) {
  return (
    <div className="w-44 overflow-hidden rounded-xl border border-gray-200 bg-white py-1 text-left shadow-lift dark:border-surface-line dark:bg-surface-overlay">
      {items.map((it) => (
        <div
          key={it.label}
          className={`flex items-center gap-2.5 px-3 py-2 text-[12.5px] ${
            it.destructive ? "text-red-600 dark:text-red-400" : "text-gray-700 dark:text-gray-200"
          }`}
        >
          <span className="w-4 text-center text-[12px] opacity-70">{it.icon}</span>
          {it.label}
        </div>
      ))}
    </div>
  );
}

export function MockCalendar({ selected = [10, 11, 12, 13] }: { selected?: number[] }) {
  const days = Array.from({ length: 28 }, (_, i) => i + 1);
  return (
    <div className="w-full max-w-[240px] rounded-xl border border-gray-200 bg-white p-3 text-center shadow-card dark:border-surface-line dark:bg-surface-raised">
      <div className="mb-2 flex items-center justify-between px-1">
        <span className="text-[11px] text-gray-400">‹</span>
        <span className="text-[12px] font-semibold text-gray-900 dark:text-gray-100">Jan 2026</span>
        <span className="text-[11px] text-gray-400">›</span>
      </div>
      <div className="grid grid-cols-7 gap-y-1">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <span key={i} className="text-[9px] font-medium text-gray-400">
            {d}
          </span>
        ))}
        {days.map((d) => {
          const sel = selected.includes(d);
          const isEnd = sel && (d === selected[0] || d === selected[selected.length - 1]);
          return (
            <span
              key={d}
              className={`mx-auto flex h-5 w-5 items-center justify-center text-[9.5px] ${
                isEnd
                  ? "rounded-full bg-primary-600 font-semibold text-white"
                  : sel
                    ? "bg-primary-50 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300"
                    : "text-gray-600 dark:text-gray-400"
              }`}
            >
              {d}
            </span>
          );
        })}
      </div>
    </div>
  );
}

export function MockOtp({ filled = 3, error = false }: { filled?: number; error?: boolean }) {
  return (
    <div className="flex gap-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <span
          key={i}
          className={`flex h-10 w-8 items-center justify-center rounded-lg border text-[15px] font-semibold ${
            error
              ? "border-red-500 text-red-600 dark:text-red-400"
              : i === filled
                ? "border-primary-600 ring-2 ring-primary-100 dark:ring-primary-900/50"
                : "border-gray-300 dark:border-surface-line"
          } bg-white text-gray-900 dark:bg-surface-raised dark:text-gray-100`}
        >
          {i < filled ? "•" : ""}
        </span>
      ))}
    </div>
  );
}

export function MockIconTile({ glyph, tone = "gray" }: { glyph: ReactNode; tone?: "gray" | "blue" }) {
  return (
    <span
      className={`flex h-9 w-9 items-center justify-center rounded-lg ${
        tone === "blue"
          ? "bg-primary-50 text-primary-600 dark:bg-primary-900/40 dark:text-primary-400"
          : "bg-gray-100 text-gray-600 dark:bg-surface-overlay dark:text-gray-300"
      }`}
    >
      {glyph}
    </span>
  );
}

export function SkeletonBar({ w = "100%" }: { w?: string }) {
  return <span className="block h-2.5 animate-pulse rounded bg-gray-200 dark:bg-surface-line" style={{ width: w }} />;
}

export { NAV_ICONS };
