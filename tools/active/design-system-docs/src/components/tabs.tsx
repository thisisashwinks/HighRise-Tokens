"use client";

import { useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

export function Tabs({ tabs }: { tabs: { label: string; content: ReactNode }[] }) {
  const [active, setActive] = useState(0);
  const reduce = useReducedMotion();
  return (
    <div>
      <div role="tablist" className="flex gap-1 border-b border-gray-200 dark:border-surface-line">
        {tabs.map((t, i) => (
          <button
            key={t.label}
            role="tab"
            aria-selected={i === active}
            type="button"
            onClick={() => setActive(i)}
            className={`relative -mb-px rounded-t-md px-3 py-2 text-body transition-colors ${
              i === active
                ? "font-medium text-primary-700 dark:text-primary-300"
                : "text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
          >
            {t.label}
            {i === active &&
              (reduce ? (
                <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-primary-600" />
              ) : (
                <motion.span
                  layoutId="tab-underline"
                  className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-primary-600"
                  transition={{ type: "spring", stiffness: 500, damping: 40 }}
                />
              ))}
          </button>
        ))}
      </div>
      <div role="tabpanel" className="pt-5">
        {reduce ? (
          tabs[active]?.content
        ) : (
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            >
              {tabs[active]?.content}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
