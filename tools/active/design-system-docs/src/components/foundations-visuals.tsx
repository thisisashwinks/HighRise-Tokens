"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1] as const;

/** Animated three-layer token flow: Primitive → Semantic → Component. */
export function TokenPyramid() {
  const reduce = useReducedMotion();
  const layers = [
    {
      name: "Component",
      example: "button/color/primary/background",
      note: "Scoped wiring — owned by the design system team",
      cls: "border-violet-500/40 bg-violet-500/10 text-violet-700 dark:text-violet-300",
      w: "w-[64%]",
    },
    {
      name: "Semantic",
      example: "color/background/primary/intense/0",
      note: "Meaning — varies per color mode",
      cls: "border-primary-300 bg-primary-50 text-primary-700 dark:border-primary-800 dark:bg-primary-900/30 dark:text-primary-300",
      w: "w-[82%]",
    },
    {
      name: "Primitive",
      example: "color/primary/blue/600 → #155eef",
      note: "Raw palette and scales — no usage opinion",
      cls: "border-gray-300 bg-gray-100 text-gray-700 dark:border-surface-line dark:bg-surface-overlay dark:text-gray-300",
      w: "w-full",
    },
  ];
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-card dark:border-surface-line dark:bg-surface-raised">
      <div className="flex flex-col items-center">
        {layers.map((l, i) => (
          <div key={l.name} className={`flex flex-col items-center ${l.w}`}>
            {i > 0 && (
              <motion.div
                initial={reduce ? false : { scaleY: 0 }}
                whileInView={{ scaleY: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.25 * i, ease: EASE }}
                className="h-5 w-0.5 origin-top bg-gradient-to-b from-primary-400 to-violet-500"
              />
            )}
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: 0.22 * i, ease: EASE }}
              className={`w-full rounded-lg border px-4 py-3 text-center ${l.cls}`}
            >
              <p className="text-[13px] font-semibold">{l.name}</p>
              <p className="mt-0.5 font-mono text-[11px] opacity-80">{l.example}</p>
              <p className="mt-0.5 text-[11px] opacity-70">{l.note}</p>
            </motion.div>
          </div>
        ))}
      </div>
      <p className="mt-4 text-center text-[12px] text-gray-500 dark:text-gray-400">
        A component token points at a semantic token, which points at a primitive. Modes and brands swap the arrows —
        never the names.
      </p>
    </div>
  );
}

/** Interactive light ↔ dark elevation ladder. */
export function ElevationLadder() {
  const [dark, setDark] = useState(false);
  const surfaces = dark
    ? { base: "#000000", raised: "#1d2939", overlay: "#344054", sunken: "#000000", text: "#eaecf0", sub: "#98a2b3" }
    : { base: "#ffffff", raised: "#ffffff", overlay: "#ffffff", sunken: "#f9fafb", text: "#101828", sub: "#667085" };
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-card dark:border-surface-line dark:bg-surface-raised">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-body font-semibold text-gray-900 dark:text-gray-100">Try it: surface elevation per mode</p>
        <button
          type="button"
          onClick={() => setDark((d) => !d)}
          className="inline-flex h-8 items-center gap-2 rounded-lg border border-gray-300 px-3 text-sub font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-surface-line dark:text-gray-200 dark:hover:bg-surface-overlay"
        >
          {dark ? "Switch to light" : "Switch to dark"}
        </button>
      </div>
      <motion.div
        animate={{ backgroundColor: surfaces.base }}
        transition={{ duration: 0.35 }}
        className="rounded-xl border border-gray-200 p-5 dark:border-surface-line"
      >
        <p className="font-mono text-[11px]" style={{ color: surfaces.sub }}>
          surface/base — {surfaces.base}
        </p>
        <motion.div
          animate={{ backgroundColor: surfaces.raised }}
          transition={{ duration: 0.35 }}
          className={`mt-3 rounded-lg p-4 ${dark ? "" : "border border-gray-200 shadow-card"}`}
        >
          <p className="font-mono text-[11px]" style={{ color: surfaces.sub }}>
            surface/raised — {surfaces.raised}
          </p>
          <p className="mt-1 text-[13px] font-medium" style={{ color: surfaces.text }}>
            A card. Light mode shows depth with shadow; dark mode steps the gray lighter.
          </p>
          <motion.div
            animate={{ backgroundColor: surfaces.overlay }}
            transition={{ duration: 0.35 }}
            className={`mt-3 rounded-lg p-3 ${dark ? "" : "border border-gray-200 shadow-modal"}`}
          >
            <p className="font-mono text-[11px]" style={{ color: surfaces.sub }}>
              surface/overlay — {surfaces.overlay}
            </p>
            <p className="mt-1 text-[12.5px]" style={{ color: surfaces.text }}>
              A menu or modal — closest to the user, lightest in dark mode.
            </p>
          </motion.div>
        </motion.div>
      </motion.div>
      <p className="mt-3 text-[12px] text-gray-500 dark:text-gray-400">
        Same tokens in both modes. Only the answers change: shadow carries elevation in light, lightness carries it in
        dark.
      </p>
    </div>
  );
}

/** Interactive contrast-preservation demo: naive inversion vs derived dark values. */
export function ContrastDemo() {
  const [method, setMethod] = useState<"preserved" | "inverted">("preserved");
  const dark =
    method === "preserved"
      ? { title: "#eaecf0", body: "#98a2b3", fill: "#0a0d12", note: "Derived by matching each token's light-mode contrast." }
      : { title: "#ffffff", body: "#475467", fill: "#1d2939", note: "Positional mirror: titles glare, body text disappears, subtle fills shout." };
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-card dark:border-surface-line dark:bg-surface-raised">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <p className="text-body font-semibold text-gray-900 dark:text-gray-100">Try it: two ways to make dark mode</p>
        <div className="inline-flex rounded-lg bg-gray-100 p-0.5 dark:bg-surface-overlay">
          {(
            [
              ["preserved", "Contrast preserved"],
              ["inverted", "Naive inversion"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setMethod(key)}
              className={`rounded-md px-3 py-1 text-[12px] font-medium transition-colors ${
                method === key
                  ? "bg-white text-gray-900 shadow-sm dark:bg-surface-raised dark:text-gray-100"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Light reference */}
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400">Light (reference)</p>
          <p className="mt-2 text-[15px] font-semibold text-[#101828]">Weekly summary</p>
          <p className="mt-1 text-[12.5px] text-[#344054]">12 conversations, 5 new contacts, 2 deals moved forward.</p>
          <span className="mt-3 inline-block rounded-md bg-[#f2f4f7] px-2 py-1 font-mono text-[10.5px] text-[#475467]">
            background/neutral/subtle/1
          </span>
        </div>
        {/* Dark demo */}
        <motion.div
          animate={{ backgroundColor: "#000000" }}
          className="rounded-xl border border-surface-line p-4"
          style={{ backgroundColor: "#000" }}
        >
          <p className="text-[11px] font-medium uppercase tracking-wide text-gray-500">Dark ({method})</p>
          <motion.p animate={{ color: dark.title }} transition={{ duration: 0.3 }} className="mt-2 text-[15px] font-semibold">
            Weekly summary
          </motion.p>
          <motion.p animate={{ color: dark.body }} transition={{ duration: 0.3 }} className="mt-1 text-[12.5px]">
            12 conversations, 5 new contacts, 2 deals moved forward.
          </motion.p>
          <motion.span
            animate={{ backgroundColor: dark.fill }}
            transition={{ duration: 0.3 }}
            className="mt-3 inline-block rounded-md px-2 py-1 font-mono text-[10.5px] text-gray-400"
          >
            background/neutral/subtle/1
          </motion.span>
        </motion.div>
      </div>
      <p className="mt-3 text-[12px] text-gray-500 dark:text-gray-400">{dark.note}</p>
    </div>
  );
}

/** The exception decision ladder as a stepper graphic. */
export function DecisionLadder() {
  const reduce = useReducedMotion();
  const steps = [
    { title: "On-color token", detail: "Text or icon on a colored fill looks wrong? Use text/neutral/on-color — it stays light in both modes." },
    { title: "Elevation-aware token", detail: "Element sits on a raised or overlay surface? Use surface/* and border/*/on-raised tokens." },
    { title: "Fix the semantic centrally", detail: "Wrong for everyone, everywhere? Fix the shared semantic value once — one edit, every screen." },
    { title: "Propose a new semantic", detail: "The need recurs with a distinct meaning? That's a real role the system is missing." },
    { title: "Scoped override (last resort)", detail: "A genuine one-off — documented, scoped, and treated as debt." },
  ];
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-card dark:border-surface-line dark:bg-surface-raised">
      <ol className="space-y-0">
        {steps.map((s, i) => (
          <motion.li
            key={s.title}
            initial={reduce ? false : { opacity: 0, x: -14 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.4, delay: i * 0.08, ease: EASE }}
            className="relative flex gap-4 pb-6 last:pb-0"
          >
            {i < steps.length - 1 && (
              <span className="absolute left-[13px] top-7 h-[calc(100%-24px)] w-0.5 bg-gray-200 dark:bg-surface-line" aria-hidden />
            )}
            <span
              className={`z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold ${
                i === steps.length - 1
                  ? "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300"
                  : "bg-primary-50 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300"
              }`}
            >
              {i + 1}
            </span>
            <div>
              <p className="text-body font-semibold text-gray-900 dark:text-gray-100">{s.title}</p>
              <p className="mt-0.5 text-sub text-gray-600 dark:text-gray-400">{s.detail}</p>
            </div>
          </motion.li>
        ))}
      </ol>
      <p className="mt-4 text-[12px] text-gray-500 dark:text-gray-400">
        Walk from the top — each rung is a cheaper, more systematic fix than the one below it.
      </p>
    </div>
  );
}

/** Review rubric as a checklist card grid. */
export function RubricGrid() {
  const reduce = useReducedMotion();
  const checks = [
    "No raw hex or pixel values anywhere — every style is a token reference.",
    "No primitive tokens applied directly to design layers.",
    "Right property family: background on fills, text on text, border on strokes, icon on icons.",
    "The token's meaning matches the use — an error color marks an error.",
    "Correct elevation: page on surface/base, cards on surface/raised, overlays on surface/overlay.",
    "Text and icons on colored fills use on-color tokens.",
    "Checked in both light and dark modes.",
    "Library component instances are unmodified inside.",
  ];
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {checks.map((c, i) => (
        <motion.div
          key={c}
          initial={reduce ? false : { opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.35, delay: (i % 2) * 0.06 + Math.floor(i / 2) * 0.05, ease: EASE }}
          className="flex items-start gap-2.5 rounded-xl border border-gray-200 bg-white p-3.5 shadow-card dark:border-surface-line dark:bg-surface-raised"
        >
          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
            <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none" aria-hidden>
              <path d="M2.5 6.5l2.2 2.2L9.5 3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <p className="text-sub text-gray-700 dark:text-gray-300">
            <span className="mr-1 font-semibold text-gray-400">{i + 1}.</span>
            {c}
          </p>
        </motion.div>
      ))}
    </div>
  );
}

/** Sticky in-page table of contents for long pages. */
export function Toc({ items }: { items: { id: string; label: string }[] }) {
  return (
    <nav className="sticky top-0 z-10 -mx-2 mb-2 flex gap-1.5 overflow-x-auto border-b border-gray-200/70 bg-gray-50/90 px-2 py-2 backdrop-blur dark:border-surface-line/70 dark:bg-surface-base/90">
      <span className="shrink-0 self-center pr-1 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
        On this page
      </span>
      {items.map((it) => (
        <a
          key={it.id}
          href={`#${it.id}`}
          className="shrink-0 rounded-full border border-gray-200 bg-white px-2.5 py-1 text-[12px] text-gray-600 no-underline transition-colors hover:border-primary-300 hover:text-primary-700 dark:border-surface-line dark:bg-surface-raised dark:text-gray-300 dark:hover:text-primary-300"
        >
          {it.label}
        </a>
      ))}
    </nav>
  );
}
