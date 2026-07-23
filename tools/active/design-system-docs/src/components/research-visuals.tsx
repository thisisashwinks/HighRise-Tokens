"use client";

import { useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1] as const;

/* ------------------------------------------------------------------ */
/* Shared bits                                                         */
/* ------------------------------------------------------------------ */

function Pill({ tone, children }: { tone: "easy" | "hard" | "mixed"; children: ReactNode }) {
  const tones = {
    easy: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
    hard: "bg-red-50 text-red-700 dark:bg-red-900/40 dark:text-red-300",
    mixed: "bg-amber-50 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  };
  const icon = {
    easy: <path d="M2.5 6.5l2.2 2.2L9.5 3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />,
    hard: <path d="M3.5 3.5l5 5M8.5 3.5l-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />,
    mixed: <path d="M3 6h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />,
  };
  return (
    <span className={`inline-flex items-start gap-1.5 rounded-lg px-2 py-1 text-[12px] font-medium leading-4 ${tones[tone]}`}>
      <svg viewBox="0 0 12 12" className="mt-0.5 h-3 w-3 shrink-0" fill="none" aria-hidden>
        {icon[tone]}
      </svg>
      <span>{children}</span>
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Top & bottom summaries                                              */
/* ------------------------------------------------------------------ */

const WHY_POINTS = [
  {
    title: "Dark mode for free",
    body: "Component tokens resolve through the semantic chain, so flipping a theme changes zero component code.",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" aria-hidden>
        <path d="M16.5 11.5A6.8 6.8 0 018.6 3.4a7 7 0 107.9 8.1z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "White-label without forks",
    body: "An enterprise brand becomes a set of token values — not a CSS override file or a code fork.",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" aria-hidden>
        <path d="M3 6.5V4a1 1 0 011-1h4.5L17 11.5l-5.5 5.5L3 8.5v-2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <circle cx="7" cy="7" r="1.1" fill="currentColor" />
      </svg>
    ),
  },
  {
    title: "Change one thing safely",
    body: "Every component, variant, and state has its own named contract — restyle a button hover without touching anything else.",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" aria-hidden>
        <rect x="3" y="3" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <rect x="11" y="11" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M12 6h3.5M6 12v2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="2 2.4" />
      </svg>
    ),
  },
  {
    title: "One contract for design & code",
    body: "A token a designer sets in Figma is the exact token a developer reads in code. Handoff stops being guesswork.",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" aria-hidden>
        <path d="M7 13l-3.5-3L7 7M13 7l3.5 3L13 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

export function WhySummary({ variant }: { variant: "top" | "bottom" }) {
  const reduce = useReducedMotion();
  return (
    <div className="mt-4 overflow-hidden rounded-xl border border-primary-200 bg-gradient-to-br from-primary-50 via-white to-violet-50 p-5 shadow-card dark:border-primary-900 dark:from-primary-900/25 dark:via-surface-raised dark:to-violet-900/20">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-primary-600 dark:text-primary-300">
        {variant === "top" ? "The short version" : "The bottom line"}
      </p>
      <p className="mt-1 text-body font-semibold text-gray-900 dark:text-gray-100">
        {variant === "top"
          ? "Why component-level tokens are required"
          : "If you remember one thing from this report"}
      </p>
      <p className="mt-1.5 text-sub text-gray-600 dark:text-gray-400">
        {variant === "top"
          ? "Semantic tokens name intent globally; they cannot express per-component decisions. Every requirement HighLevel already has — dark mode, white-labeling, mobile + web, multi-team consistency — needs a third layer that scopes intent to one component, one variant, one state."
          : "Every surveyed system that supports dark mode, theming, or customization added a component token layer — none reversed course. The cost is front-loaded; the payoff compounds. Without the layer, every theme, brand, and per-component change is a manual code project. With it, they are token edits."}
      </p>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {WHY_POINTS.map((p, i) => (
          <motion.div
            key={p.title}
            initial={reduce ? false : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.4, delay: i * 0.07, ease: EASE }}
            className="flex items-start gap-3 rounded-lg border border-gray-200/80 bg-white/80 p-3 backdrop-blur dark:border-surface-line dark:bg-surface-raised/70"
          >
            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600 dark:bg-primary-900/40 dark:text-primary-300">
              {p.icon}
            </span>
            <div>
              <p className="text-sub font-semibold text-gray-900 dark:text-gray-100">{p.title}</p>
              <p className="mt-0.5 text-[12px] leading-[17px] text-gray-600 dark:text-gray-400">{p.body}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/** Count-up-style stat strip for the report header. */
export function ReportStats() {
  const reduce = useReducedMotion();
  const stats = [
    { value: "11", label: "design systems surveyed" },
    { value: "65", label: "HighRise components tokenized" },
    { value: "8", label: "size scales (3xs–2xl)" },
    { value: "5", label: "interaction states covered" },
  ];
  return (
    <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map((s, i) => (
        <motion.div
          key={s.label}
          initial={reduce ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: i * 0.06, ease: EASE }}
          className="rounded-xl border border-gray-200 bg-white p-3.5 text-center shadow-card dark:border-surface-line dark:bg-surface-raised"
        >
          <p className="text-[22px] font-semibold leading-7 text-primary-700 dark:text-primary-300">{s.value}</p>
          <p className="mt-0.5 text-[11.5px] leading-4 text-gray-500 dark:text-gray-400">{s.label}</p>
        </motion.div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* With vs. without — the two architectures                            */
/* ------------------------------------------------------------------ */

function FlowBox({ label, sub, tone }: { label: string; sub?: string; tone: "gray" | "primary" | "violet" }) {
  const tones = {
    gray: "border-gray-300 bg-gray-100 text-gray-700 dark:border-surface-line dark:bg-surface-overlay dark:text-gray-300",
    primary:
      "border-primary-300 bg-primary-50 text-primary-700 dark:border-primary-800 dark:bg-primary-900/30 dark:text-primary-300",
    violet: "border-violet-500/40 bg-violet-500/10 text-violet-700 dark:text-violet-300",
  };
  return (
    <div className={`w-full rounded-lg border px-3 py-2 text-center ${tones[tone]}`}>
      <p className="text-[12px] font-semibold">{label}</p>
      {sub ? <p className="mt-0.5 font-mono text-[10.5px] opacity-80">{sub}</p> : null}
    </div>
  );
}

function FlowArrow() {
  return <div className="mx-auto h-4 w-0.5 bg-gradient-to-b from-primary-400 to-violet-500" aria-hidden />;
}

/** Side-by-side architecture diagram: semantic-only vs three layers. */
export function TwoArchitectures() {
  const reduce = useReducedMotion();
  const cards = [
    {
      title: "With only semantic tokens",
      badge: "2 layers",
      badgeCls: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300",
      flow: (
        <>
          <FlowBox label="Component CSS" sub=".btn { background: var(--color-background-primary) }" tone="gray" />
          <FlowArrow />
          <FlowBox label="Semantic token" sub="color/background/primary/intense/0" tone="primary" />
          <FlowArrow />
          <FlowBox label="Primitive" sub="color/primary/blue/600 → #155eef" tone="gray" />
        </>
      ),
      notes: [
        "Every component hard-wires which semantic token it uses, directly in its CSS.",
        "Components that share a semantic are invisibly coupled — they can never diverge without new CSS.",
        "Per-component changes mean editing component CSS in code, per theme, per state.",
      ],
    },
    {
      title: "With component tokens",
      badge: "3 layers",
      badgeCls: "bg-violet-500/10 text-violet-700 dark:text-violet-300",
      flow: (
        <>
          <FlowBox label="Component CSS" sub=".btn { background: var(--button-primary-background) }" tone="gray" />
          <FlowArrow />
          <FlowBox label="Component token" sub="button/color/primary/background" tone="violet" />
          <FlowArrow />
          <FlowBox label="Semantic token" sub="color/background/primary/intense/0" tone="primary" />
          <FlowArrow />
          <FlowBox label="Primitive" sub="color/primary/blue/600 → #155eef" tone="gray" />
        </>
      ),
      notes: [
        "Each component owns a named contract; the coupling between components becomes explicit and editable.",
        "A per-component change is a one-line token edit — no CSS, no side effects.",
        "Theme and brand switching still happens in the semantic layer; the component layer never changes.",
      ],
    },
  ];
  return (
    <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
      {cards.map((c, ci) => (
        <motion.div
          key={c.title}
          initial={reduce ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.45, delay: ci * 0.1, ease: EASE }}
          className="flex flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-card dark:border-surface-line dark:bg-surface-raised"
        >
          <div className="mb-4 flex items-center justify-between gap-2">
            <p className="text-body font-semibold text-gray-900 dark:text-gray-100">{c.title}</p>
            <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${c.badgeCls}`}>{c.badge}</span>
          </div>
          <div className="flex flex-col">{c.flow}</div>
          <ul className="mt-4 space-y-1.5 border-t border-gray-100 pt-3 dark:border-surface-line">
            {c.notes.map((n) => (
              <li key={n} className="flex gap-2 text-[12.5px] leading-[18px] text-gray-600 dark:text-gray-400">
                <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-gray-400" aria-hidden />
                {n}
              </li>
            ))}
          </ul>
        </motion.div>
      ))}
    </div>
  );
}

/** Interactive demo: one design request, two outcomes. */
export function RippleDemo() {
  const [applied, setApplied] = useState(false);
  const base = "#155eef";
  const darker = "#0b3fb0";

  function MiniUi({ isolated }: { isolated: boolean }) {
    const buttonBg = applied ? darker : base;
    const otherBg = applied && !isolated ? darker : base;
    const changedOther = applied && !isolated;
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-3.5 dark:border-surface-line dark:bg-surface-overlay">
        {/* Button */}
        <div className="flex items-center gap-2">
          <motion.span
            animate={{ backgroundColor: buttonBg }}
            transition={{ duration: 0.3 }}
            className="inline-flex h-8 items-center rounded-lg px-3 text-[12px] font-medium text-white"
          >
            Save changes
          </motion.span>
          {applied && (
            <span className="rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
              intended ✓
            </span>
          )}
        </div>
        {/* Nav item */}
        <div className="mt-3 flex items-center gap-2">
          <span className="flex items-center gap-2 rounded-md px-2 py-1.5 text-[12px] font-medium" style={{ backgroundColor: `${otherBg}1a`, color: otherBg }}>
            <motion.span animate={{ backgroundColor: otherBg }} transition={{ duration: 0.3 }} className="h-2 w-2 rounded-full" />
            Active nav item
          </span>
          {changedOther && (
            <span className="rounded-full bg-red-50 px-1.5 py-0.5 text-[10px] font-medium text-red-700 dark:bg-red-900/50 dark:text-red-300">
              changed too ✕
            </span>
          )}
        </div>
        {/* Selected tag */}
        <div className="mt-3 flex items-center gap-2">
          <motion.span
            animate={{ backgroundColor: otherBg }}
            transition={{ duration: 0.3 }}
            className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium text-white"
          >
            Selected tag
          </motion.span>
          {changedOther && (
            <span className="rounded-full bg-red-50 px-1.5 py-0.5 text-[10px] font-medium text-red-700 dark:bg-red-900/50 dark:text-red-300">
              changed too ✕
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-xl border border-gray-200 bg-white p-5 shadow-card dark:border-surface-line dark:bg-surface-raised">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-body font-semibold text-gray-900 dark:text-gray-100">
            Try it: &quot;make the primary button darker — nothing else&quot;
          </p>
          <p className="mt-0.5 text-[12px] text-gray-500 dark:text-gray-400">
            The button, the active nav item, and the selected tag all resolve to the same primary fill today.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setApplied((a) => !a)}
          className="inline-flex h-8 items-center rounded-lg border border-gray-300 px-3 text-sub font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-surface-line dark:text-gray-200 dark:hover:bg-surface-overlay"
        >
          {applied ? "Reset" : "Apply the change"}
        </button>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
            Semantic tokens only
          </p>
          <MiniUi isolated={false} />
          <p className="mt-2 font-mono text-[10.5px] text-gray-500 dark:text-gray-400">
            edit: color/background/primary → ripples to every consumer
          </p>
        </div>
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
            With component tokens
          </p>
          <MiniUi isolated />
          <p className="mt-2 font-mono text-[10.5px] text-gray-500 dark:text-gray-400">
            edit: button/color/primary/background → the button, and only the button
          </p>
        </div>
      </div>
      <p className="mt-3 text-[12px] text-gray-500 dark:text-gray-400">
        With only semantic tokens the alternatives are equally bad: accept the ripple, mint a
        &quot;semantic&quot; token that secretly belongs to one component, or hard-code CSS and leave the token system.
      </p>
    </div>
  );
}

/** Honest task-by-task ease comparison. */
export function EaseMatrix() {
  const reduce = useReducedMotion();
  const rows: { task: string; semantic: [string, "easy" | "hard" | "mixed"]; component: [string, "easy" | "hard" | "mixed"] }[] = [
    { task: "Ship dark mode across 65 components", semantic: ["Hard — ~1,300 manual CSS overrides", "hard"], component: ["Easy — automatic through the chain", "easy"] },
    { task: "White-label an enterprise brand", semantic: ["Hard — CSS fork per customer", "hard"], component: ["Easy — swap a token values JSON", "easy"] },
    { task: "Restyle one component in one state", semantic: ["Hard — ripples or hard-coded CSS", "hard"], component: ["Easy — edit a single token", "easy"] },
    { task: "Add a compact or high-contrast theme", semantic: ["Hard — new overrides everywhere", "hard"], component: ["Easy — define new token values", "easy"] },
    { task: "Keep two teams' buttons identical", semantic: ["Hard — relies on convention only", "hard"], component: ["Easy — one named contract", "easy"] },
    { task: "Design a brand-new screen from scratch", semantic: ["Easy — semantic tokens are made for this", "easy"], component: ["Easy — unchanged; semantics stay available", "easy"] },
    { task: "Get a small single-theme product styled fast", semantic: ["Easy — fewer moving parts", "easy"], component: ["Slower — front-loaded setup cost", "mixed"] },
    { task: "Trace where a final value comes from", semantic: ["Easy — short 2-level chain", "easy"], component: ["Needs tooling — 3–6 level chains", "mixed"] },
  ];
  return (
    <div className="mt-4 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-card dark:border-surface-line dark:bg-surface-raised">
      <div className="grid grid-cols-[1.1fr_1fr_1fr] gap-2 border-b border-gray-200 bg-gray-50 px-4 py-2.5 dark:border-surface-line dark:bg-surface-overlay">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Task</p>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Semantic only</p>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">With component tokens</p>
      </div>
      <div className="divide-y divide-gray-100 dark:divide-surface-line">
        {rows.map((r, i) => (
          <motion.div
            key={r.task}
            initial={reduce ? false : { opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-30px" }}
            transition={{ duration: 0.3, delay: i * 0.04, ease: EASE }}
            className="grid grid-cols-[1.1fr_1fr_1fr] items-start gap-2 px-4 py-3"
          >
            <p className="text-sub font-medium text-gray-800 dark:text-gray-200">{r.task}</p>
            <div>
              <Pill tone={r.semantic[1]}>{r.semantic[0]}</Pill>
            </div>
            <div>
              <Pill tone={r.component[1]}>{r.component[0]}</Pill>
            </div>
          </motion.div>
        ))}
      </div>
      <p className="border-t border-gray-100 px-4 py-3 text-[12px] text-gray-500 dark:border-surface-line dark:text-gray-400">
        The pattern: semantic-only wins on simplicity for small, single-theme products. Component tokens win on
        everything HighLevel actually ships — themes, brands, platforms, and many teams.
      </p>
    </div>
  );
}

/** Who touches which layer — designer / scratch design / DS team lanes. */
export function WhoTouchesWhat() {
  const reduce = useReducedMotion();
  const lanes = [
    {
      who: "Product designers using library components",
      touch: "Nothing — just place the component",
      body: "Drop in the Button or Modal and ship. Component tokens are wired inside the library — designers never see or set them.",
      badge: "Zero token overhead",
      badgeTone: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
      icon: (
        <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" aria-hidden>
          <rect x="3" y="5" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
          <rect x="6" y="8.5" width="5" height="3" rx="1.5" fill="currentColor" />
        </svg>
      ),
    },
    {
      who: "Designers creating custom UI from scratch",
      touch: "Semantic tokens",
      body: "Anything not in the library is styled with semantic tokens — full creative freedom, and dark mode plus white-label still work automatically.",
      badge: "Full freedom",
      badgeTone: "bg-primary-50 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300",
      icon: (
        <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" aria-hidden>
          <path d="M12.5 3.5l4 4L7 17H3v-4l9.5-9.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      who: "The design system team",
      touch: "Component tokens",
      body: "When a library component itself must change, component tokens give the team complete, surgical control — exactly what can change, and what can't.",
      badge: "Complete control",
      badgeTone: "bg-violet-500/10 text-violet-700 dark:text-violet-300",
      icon: (
        <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" aria-hidden>
          <path d="M10 3l6 2.5v4c0 3.6-2.4 6.4-6 7.5-3.6-1.1-6-3.9-6-7.5v-4L10 3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M7.5 9.8l1.8 1.8 3.2-3.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
  ];
  return (
    <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-3">
      {lanes.map((l, i) => (
        <motion.div
          key={l.who}
          initial={reduce ? false : { opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.4, delay: i * 0.09, ease: EASE }}
          className="flex flex-col rounded-xl border border-gray-200 bg-white p-4 shadow-card dark:border-surface-line dark:bg-surface-raised"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-600 dark:bg-surface-overlay dark:text-gray-300">
              {l.icon}
            </span>
            <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${l.badgeTone}`}>{l.badge}</span>
          </div>
          <p className="mt-3 text-sub font-semibold text-gray-900 dark:text-gray-100">{l.who}</p>
          <p className="mt-0.5 font-mono text-[10.5px] text-gray-400 dark:text-gray-500">touches: {l.touch}</p>
          <p className="mt-2 text-[12.5px] leading-[18px] text-gray-600 dark:text-gray-400">{l.body}</p>
        </motion.div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Smaller in-flow illustrations                                       */
/* ------------------------------------------------------------------ */

/** Button interaction states, each labeled with its component token. */
export function StateSpectrum() {
  const reduce = useReducedMotion();
  const states = [
    { name: "default", bg: "#0050C8", text: "#ffffff", opacity: 1 },
    { name: "hover", bg: "#0042A8", text: "#ffffff", opacity: 1 },
    { name: "active", bg: "#003389", text: "#ffffff", opacity: 1 },
    { name: "disabled", bg: "#C9D8F8", text: "#ffffff", opacity: 1 },
  ];
  return (
    <div className="mt-4 rounded-xl border border-gray-200 bg-white p-5 shadow-card dark:border-surface-line dark:bg-surface-raised">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {states.map((s, i) => (
          <motion.div
            key={s.name}
            initial={reduce ? false : { opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-30px" }}
            transition={{ duration: 0.35, delay: i * 0.07, ease: EASE }}
            className="flex flex-col items-center gap-2 text-center"
          >
            <span
              className="inline-flex h-9 items-center rounded-lg px-4 text-[13px] font-medium"
              style={{ backgroundColor: s.bg, color: s.text }}
            >
              Save
            </span>
            <div>
              <p className="text-[11.5px] font-semibold text-gray-700 dark:text-gray-300">{s.name}</p>
              <p className="font-mono text-[10px] text-gray-400 dark:text-gray-500">…background.{s.name}</p>
              <p className="font-mono text-[10px] text-gray-400 dark:text-gray-500">{s.bg}</p>
            </div>
          </motion.div>
        ))}
      </div>
      <p className="mt-4 text-center text-[12px] text-gray-500 dark:text-gray-400">
        One token per state — <span className="font-mono text-[11px]">button.color.primary.primary.background.*</span> —
        so each state is explicit, testable, and changeable without side effects.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* "Drop the layer entirely" rebuttal                                  */
/* ------------------------------------------------------------------ */

const REBUTTALS: { topic: string; claims: string[]; response: string }[] = [
  {
    topic: "Usability — “2,768 variables instead of ~200”",
    claims: [
      "Designers must work with 2,768 variables instead of ~200 semantics.",
      "No way to know which of a button's 435 tokens does what.",
      "The variables panel becomes an unscrollable list.",
    ],
    response:
      "Product designers never bind component tokens — their working set is the ~200 Foundations semantics either way. Component tokens are wired inside library components by the design system team, and they can be kept out of product designers' pickers entirely: separate collections, hidden from publishing, visible only in the component library file. A button's 435 tokens aren't 435 things a designer must learn — they're 435 decisions that otherwise live invisibly in CSS.",
  },
  {
    topic: "Consistency — “change one semantic, it changes everywhere”",
    claims: [
      "One semantic edit propagates everywhere automatically.",
      "Impossible to accidentally desync components.",
      "One radius, one padding, one color for all components.",
    ],
    response:
      "Component tokens keep all of this — they point at semantics, so a semantic edit still sweeps every component at once. What “impossible to desync” really means is “impossible to diverge deliberately”: the moment one component must differ from the rest (button hover vs. nav hover), a semantic-only system has no safe way to say so. The layer adds the option without removing the sweep.",
  },
  {
    topic: "Maintenance — “95 collections kept in sync by hand”",
    claims: [
      "95 collections that must be updated in sync.",
      "A new state or variant requires dozens of new variables.",
      "Name duplication and primary/primary-style confusion.",
    ],
    response:
      "Sync is not manual upkeep: the token JSON repo is the single source of truth, and the pipeline (Figma plugin + CI) writes the variables — humans edit one place. A new state needing new tokens is the feature, not the bug: each state becomes an explicit, reviewable decision instead of a hover rule buried in CSS. And naming is fair feedback — primary/primary (variant + prominence) can be renamed without touching the architecture at all.",
  },
  {
    topic: "Onboarding — “a new designer starts immediately”",
    claims: [
      "A new designer opens Foundations, sees a clear structure, starts working.",
      "No manual needed for an intermediate layer.",
      "No “which of the two Alerts do I use?”",
    ],
    response:
      "That is exactly the onboarding path with component tokens too: new designers learn Foundations and place library components — the component layer never appears in their workflow, so there is nothing extra to onboard onto. The intermediate-layer manual is for the design system team only, where it replaces something worse: undocumented tribal knowledge about which semantic each component happens to use. Duplicate components are a library hygiene problem, not a token-architecture problem.",
  },
  {
    topic: "White-label — “fork one file instead of two”",
    claims: [
      "Rebrand by forking one file (Foundations).",
      "Fewer points where a rebrand can go wrong.",
      "Consistency guaranteed after a rebrand.",
    ],
    response:
      "With component tokens a rebrand also touches exactly one layer — the semantics (or the generated brand ramps beneath them). The component layer is never forked; it resolves through the chain untouched. What the layer adds is the guarantee in the other direction: no component can drift from the brand, because every visual property is pinned to a named semantic rather than to whatever a developer chose that day.",
  },
  {
    topic: "Theming — “no layer that can get stuck on an old value”",
    claims: [
      "Light/dark switching works directly through Semantic-Colors modes.",
      "No intermediate layer that can get “stuck”.",
      "The theme applies to all components uniformly.",
    ],
    response:
      "Component tokens are aliases, not copies — there is no cached value that can get stuck. Theme switching runs through exactly the same Semantic-Colors modes with or without the layer; the component collection has a single mode and never remaps. And when a theme needs a deliberate exception — an inverse tooltip, a border that only exists on raised surfaces — the component layer is the only clean place to express it.",
  },
  {
    topic: "Figma performance — “fewer variables, faster files”",
    claims: [
      "Fewer variables = faster file load.",
      "Faster search and binding of variables.",
      "Less strain when recalculating aliases.",
    ],
    response:
      "A real cost — but it lands on the design system team's library files, not on product files, which load only Foundations. It is managed with structure: per-platform collections, publishing only Foundations to product teams, component tokens living in the component library. Material, Fiori, and SLDS run this architecture at far larger variable counts in production tooling every day.",
  },
];

/** Point-by-point response to "drop component tokens entirely". */
export function DropLayerRebuttal() {
  const reduce = useReducedMotion();
  return (
    <div className="mt-4 space-y-4">
      {REBUTTALS.map((r, i) => (
        <motion.div
          key={r.topic}
          initial={reduce ? false : { opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.4, delay: 0.05, ease: EASE }}
          className="overflow-hidden rounded-xl border border-gray-200 shadow-card dark:border-surface-line"
        >
          <p className="border-b border-gray-200 bg-gray-50 px-4 py-2.5 text-sub font-semibold text-gray-900 dark:border-surface-line dark:bg-surface-overlay dark:text-gray-100">
            {i + 1}. {r.topic}
          </p>
          <div className="grid grid-cols-1 bg-white dark:bg-surface-raised lg:grid-cols-2">
            <div className="border-b border-gray-100 p-4 dark:border-surface-line lg:border-b-0 lg:border-r">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400">
                The claimed benefit of dropping the layer
              </p>
              <ul className="space-y-1.5">
                {r.claims.map((c) => (
                  <li key={c} className="flex gap-2 text-[12.5px] leading-[18px] text-gray-600 dark:text-gray-400">
                    <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-amber-400" aria-hidden />
                    {c}
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-4">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
                How component tokens handle it
              </p>
              <p className="text-[12.5px] leading-[18px] text-gray-700 dark:text-gray-300">{r.response}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
