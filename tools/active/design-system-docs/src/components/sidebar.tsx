"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ThemeToggle } from "./theme-toggle";

export interface NavComponent {
  slug: string;
  name: string;
  category: string;
}

const FOUNDATION_LINKS = [
  { href: "/foundations/tokens-overview", label: "Tokens overview" },
  { href: "/foundations/primitive-tokens", label: "Primitive tokens" },
  { href: "/foundations/semantic-tokens", label: "Semantic tokens" },
  { href: "/foundations/component-tokens", label: "Component tokens" },
  { href: "/foundations/color-modes", label: "Color modes & dark mode" },
  { href: "/foundations/white-label", label: "White-label & custom colors" },
];

// Inline SVG icons per component category.
const CATEGORY_ICONS: Record<string, ReactNode> = {
  avatar: (
    <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5" aria-hidden>
      <circle cx="8" cy="5.5" r="2.8" stroke="currentColor" strokeWidth="1.3" />
      <path d="M2.8 13.5a5.2 5.2 0 0110.4 0" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  ),
  badge: (
    <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5" aria-hidden>
      <rect x="2" y="5" width="12" height="6" rx="3" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  ),
  "date-picker": (
    <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5" aria-hidden>
      <rect x="2.5" y="3.5" width="11" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M2.5 6.5h11M5.5 2v2.5M10.5 2v2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  ),
  display: (
    <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5" aria-hidden>
      <rect x="2.5" y="3" width="11" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M5 6.5h6M5 9.5h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  ),
  feedback: (
    <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5" aria-hidden>
      <path d="M3 3.5h10v7H8.5L5.5 13v-2.5H3v-7z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  ),
  form: (
    <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5" aria-hidden>
      <rect x="2" y="4.5" width="12" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M4.5 8h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  ),
  header: (
    <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5" aria-hidden>
      <rect x="2" y="3" width="12" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M2 6.5h12" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  ),
  navigation: (
    <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5" aria-hidden>
      <path d="M8 2.5l2 4.3 4.5.5-3.4 3 1 4.4L8 12.4l-4.1 2.3 1-4.4-3.4-3 4.5-.5L8 2.5z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" />
    </svg>
  ),
  overlay: (
    <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5" aria-hidden>
      <rect x="2" y="2" width="9" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
      <rect x="6" y="6" width="8" height="8" rx="1.5" className="fill-white dark:fill-surface-raised" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  ),
  progress: (
    <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5" aria-hidden>
      <rect x="2" y="6.5" width="12" height="3" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
      <rect x="2" y="6.5" width="6" height="3" rx="1.5" fill="currentColor" />
    </svg>
  ),
  tag: (
    <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5" aria-hidden>
      <path d="M2.5 7V3.5A1 1 0 013.5 2.5H7l6.5 6.5-4.5 4.5L2.5 7z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      <circle cx="5.5" cy="5.5" r="0.9" fill="currentColor" />
    </svg>
  ),
  utilities: (
    <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5" aria-hidden>
      <path d="M6.5 2.5h3l.4 1.8 1.6.9 1.7-.6 1.5 2.6-1.3 1.2v1.2l1.3 1.2-1.5 2.6-1.7-.6-1.6.9-.4 1.8h-3l-.4-1.8-1.6-.9-1.7.6L1.3 11l1.3-1.2V8.6L1.3 7.4l1.5-2.6 1.7.6 1.6-.9.4-2z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" transform="scale(0.92) translate(0.7 0.4)" />
    </svg>
  ),
};

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      className={`h-3.5 w-3.5 text-gray-400 transition-transform ${open ? "rotate-90" : ""}`}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
    >
      <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function NavLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  const reduce = useReducedMotion();
  return (
    <Link
      href={href}
      className={`relative block rounded-md px-2.5 py-1.5 text-sub transition-colors ${
        active
          ? "font-medium text-primary-700 dark:text-primary-300"
          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-surface-overlay dark:hover:text-gray-100"
      }`}
    >
      {active &&
        (reduce ? (
          <span className="absolute inset-0 rounded-md bg-primary-50 dark:bg-primary-900/30" />
        ) : (
          <motion.span
            layoutId="sidebar-active"
            className="absolute inset-0 rounded-md bg-primary-50 dark:bg-primary-900/30"
            transition={{ type: "spring", stiffness: 500, damping: 42 }}
          />
        ))}
      <span className="relative">{label}</span>
    </Link>
  );
}

export function Sidebar({
  componentsByCategory,
  categoryLabels,
}: {
  componentsByCategory: Record<string, NavComponent[]>;
  categoryLabels: Record<string, string>;
}) {
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const activeCategory = pathname.startsWith("/components/")
    ? pathname.replace("/components/", "").split("--")[0]
    : null;

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    "getting-started": true,
    foundations: true,
    components: pathname.startsWith("/components"),
  });
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>(
    activeCategory ? { [activeCategory]: true } : {}
  );

  const filtered = useMemo(() => {
    if (!query.trim()) return componentsByCategory;
    const q = query.toLowerCase();
    const out: Record<string, NavComponent[]> = {};
    for (const [cat, list] of Object.entries(componentsByCategory)) {
      const hits = list.filter((c) => c.name.toLowerCase().includes(q));
      if (hits.length) out[cat] = hits;
    }
    return out;
  }, [query, componentsByCategory]);

  const searching = query.trim().length > 0;
  const componentsOpen = openGroups.components || pathname.startsWith("/components") || searching;

  function toggleGroup(key: string) {
    setOpenGroups((s) => ({ ...s, [key]: !(s[key] ?? false) }));
  }
  function toggleCategory(cat: string) {
    setOpenCategories((s) => ({ ...s, [cat]: !(s[cat] ?? cat === activeCategory) }));
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-20 flex w-[280px] flex-col border-r border-gray-200 bg-white dark:border-surface-line dark:bg-surface-raised">
      <div className="flex items-center gap-2.5 border-b border-gray-200 px-4 py-4 dark:border-surface-line">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-violet-600 font-semibold text-white shadow-sm">
          H
        </span>
        <div>
          <Link href="/" className="block text-body font-semibold text-gray-900 dark:text-gray-100">
            HighRise Design System
          </Link>
          <span className="text-[11px] text-gray-500 dark:text-gray-400">Tokens 1.1 documentation</span>
        </div>
      </div>

      <nav className="flex-1 space-y-4 overflow-y-auto px-3 py-4">
        <div>
          <p className="px-2.5 pb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
            Getting started
          </p>
          <NavLink href="/" label="Introduction" active={pathname === "/"} />
        </div>

        <div>
          <button
            type="button"
            onClick={() => toggleGroup("foundations")}
            className="flex w-full items-center justify-between px-2.5 pb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500"
          >
            Foundations
            <Chevron open={openGroups.foundations ?? true} />
          </button>
          {(openGroups.foundations ?? true) && (
            <div className="space-y-0.5">
              {FOUNDATION_LINKS.map((l) => (
                <NavLink key={l.href} href={l.href} label={l.label} active={pathname === l.href} />
              ))}
            </div>
          )}
        </div>

        <div>
          <button
            type="button"
            onClick={() => toggleGroup("components")}
            className="flex w-full items-center justify-between px-2.5 pb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500"
          >
            Components
            <Chevron open={componentsOpen} />
          </button>
          {componentsOpen && (
            <div className="space-y-1">
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Filter components"
                className="mx-1 mb-1 w-[calc(100%-8px)] rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-sub text-gray-900 placeholder:text-gray-400 focus:border-primary-600 focus:outline-none dark:border-surface-line dark:bg-surface-overlay dark:text-gray-100"
              />
              <NavLink href="/components" label="All components" active={pathname === "/components"} />
              {Object.entries(filtered).map(([cat, list]) => {
                const open = searching || (openCategories[cat] ?? cat === activeCategory);
                return (
                  <div key={cat}>
                    <button
                      type="button"
                      onClick={() => toggleCategory(cat)}
                      className="flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-sub font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-surface-overlay"
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-gray-400 dark:text-gray-500">{CATEGORY_ICONS[cat]}</span>
                        {categoryLabels[cat] ?? cat}{" "}
                        <span className="font-normal text-gray-400">({list.length})</span>
                      </span>
                      <Chevron open={open} />
                    </button>
                    {open && (
                      <div className="ml-[15px] space-y-0.5 border-l border-gray-200 pl-2.5 dark:border-surface-line">
                        {list.map((c) => (
                          <NavLink
                            key={c.slug}
                            href={`/components/${c.slug}`}
                            label={c.name}
                            active={pathname === `/components/${c.slug}`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
              {searching && Object.keys(filtered).length === 0 && (
                <p className="px-2.5 py-1.5 text-sub text-gray-400">No components match “{query}”</p>
              )}
            </div>
          )}
        </div>
      </nav>

      <div className="border-t border-gray-200 p-3 dark:border-surface-line">
        <ThemeToggle />
      </div>
    </aside>
  );
}
