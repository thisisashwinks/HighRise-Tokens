"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { CountUp } from "./motion";

const CHIPS = [
  { label: "color/background/primary/moderate/1", x: "6%", y: "14%", cls: "animate-float-slow" },
  { label: "#2970ff", x: "78%", y: "10%", cls: "animate-float-slower" },
  { label: "border/radius/full", x: "66%", y: "72%", cls: "animate-float-slow" },
  { label: "font/body/medium/sm", x: "8%", y: "70%", cls: "animate-float-slower" },
  { label: "size/icon/3xs", x: "84%", y: "44%", cls: "animate-float-slow" },
];

export function HomeHero({
  stats,
}: {
  stats: { primitives: number; semanticColors: number; components: number; modes: number };
}) {
  const reduce = useReducedMotion();
  return (
    <section className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white px-8 py-14 shadow-canvas dark:border-surface-line dark:bg-surface-raised">
      {/* Ambient gradient wash */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary-50 via-transparent to-violet-500/10 dark:from-primary-900/25 dark:to-violet-500/10"
      />
      {/* Floating token chips */}
      {CHIPS.map((c) => (
        <span
          key={c.label}
          aria-hidden
          className={`pointer-events-none absolute hidden rounded-full border border-gray-200 bg-white/80 px-2.5 py-1 font-mono text-[10.5px] text-gray-500 shadow-card backdrop-blur md:inline-block dark:border-surface-line dark:bg-surface-overlay/80 dark:text-gray-400 ${reduce ? "" : c.cls}`}
          style={{ left: c.x, top: c.y }}
        >
          {c.label}
        </span>
      ))}

      <div className="relative mx-auto max-w-[620px] text-center">
        <motion.h1
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="text-[34px] font-semibold leading-[1.15] tracking-[-0.02em] text-gray-900 dark:text-gray-100"
        >
          One token system,{" "}
          <span className="animate-gradient-x bg-gradient-to-r from-primary-600 via-violet-500 to-primary-600 bg-[length:200%_auto] bg-clip-text text-transparent">
            every screen in sync
          </span>
        </motion.h1>
        <motion.p
          initial={reduce ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mt-4 max-w-[520px] text-[15px] leading-6 text-gray-600 dark:text-gray-400"
        >
          Every color, spacing value, radius, and shadow in HighRise is a named decision — stored once, referenced
          everywhere, and resolved per mode. Change the decision and light, dark, and every white-label brand update
          together.
        </motion.p>
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
          className="mt-7 flex flex-wrap items-center justify-center gap-3"
        >
          <Link
            href="/foundations/tokens-overview"
            className="inline-flex h-10 items-center rounded-lg bg-primary-600 px-5 text-body font-medium text-white shadow-sm transition-colors hover:bg-primary-700"
          >
            Explore foundations
          </Link>
          <Link
            href="/components"
            className="inline-flex h-10 items-center rounded-lg border border-gray-300 bg-white px-5 text-body font-medium text-gray-800 transition-colors hover:bg-gray-50 dark:border-surface-line dark:bg-surface-overlay dark:text-gray-100 dark:hover:bg-surface-line"
          >
            Browse components
          </Link>
        </motion.div>

        <motion.dl
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.28 }}
          className="mt-12 grid grid-cols-2 gap-6 sm:grid-cols-4"
        >
          {[
            { value: stats.primitives, label: "Primitive tokens" },
            { value: stats.semanticColors, label: "Semantic colors" },
            { value: stats.components, label: "Components" },
            { value: stats.modes, label: "Color modes" },
          ].map((s) => (
            <div key={s.label}>
              <dt className="sr-only">{s.label}</dt>
              <dd className="text-[26px] font-semibold tabular-nums tracking-[-0.01em] text-gray-900 dark:text-gray-100">
                <CountUp to={s.value} />
              </dd>
              <dd className="mt-0.5 text-sub text-gray-500 dark:text-gray-400">{s.label}</dd>
            </div>
          ))}
        </motion.dl>
      </div>
    </section>
  );
}
