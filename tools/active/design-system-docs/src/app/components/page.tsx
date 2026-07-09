import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Badge } from "@/components/ui";
import { PageTransition, Stagger, StaggerItem, HoverLift } from "@/components/motion";
import { componentIndex, categoryLabel } from "@/lib/data";

export const metadata = { title: "Components — HighRise Design System" };

const CATEGORY_CHIP: Record<string, string> = {
  avatar: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  badge: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  "date-picker": "bg-amber-50 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  display: "bg-primary-50 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300",
  feedback: "bg-rose-50 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
  form: "bg-sky-50 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
  header: "bg-teal-50 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300",
  navigation: "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300",
  overlay: "bg-fuchsia-50 text-fuchsia-700 dark:bg-fuchsia-900/40 dark:text-fuchsia-300",
  progress: "bg-cyan-50 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300",
  tag: "bg-lime-50 text-lime-700 dark:bg-lime-900/40 dark:text-lime-300",
  utilities: "bg-gray-100 text-gray-600 dark:bg-surface-overlay dark:text-gray-300",
};

export default function ComponentsIndex() {
  const byCategory = new Map<string, typeof componentIndex>();
  for (const c of componentIndex) {
    const list = byCategory.get(c.category) ?? [];
    list.push(c);
    byCategory.set(c.category, list);
  }

  return (
    <PageTransition>
      <article className="doc">
        <Breadcrumbs items={[{ label: "Components" }]} />
        <h1>Components</h1>
        <p>
          {componentIndex.length} main components curated from 106 token files in{" "}
          <code>tokens/mobile-components</code>. Base and subcomponents are folded into their parent&apos;s page — see
          each page&apos;s anatomy section. Every component page documents structure, variants, usage guidance, the
          full token table, and its live Figma page.
        </p>

        {Array.from(byCategory.entries()).map(([cat, list]) => (
          <section key={cat}>
            <h2>
              <span className={`mr-2 inline-flex items-center rounded-full px-2.5 py-0.5 text-[12px] font-semibold ${CATEGORY_CHIP[cat] ?? CATEGORY_CHIP.utilities}`}>
                {categoryLabel(cat)}
              </span>
              <span className="text-sub font-normal text-gray-400">({list.length})</span>
            </h2>
            <Stagger className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((c) => (
                <StaggerItem key={c.slug}>
                  <HoverLift className="h-full">
                    <Link
                      href={`/components/${c.slug}`}
                      className="group flex h-full flex-col rounded-xl border border-gray-200 bg-white p-4 no-underline shadow-card transition-shadow hover:border-primary-300 hover:shadow-lift dark:border-surface-line dark:bg-surface-raised dark:hover:border-primary-700"
                    >
                      <p className="!mt-0 font-semibold text-gray-900 group-hover:text-primary-700 dark:text-gray-100 dark:group-hover:text-primary-300">
                        {c.name}
                      </p>
                      <p className="!mt-1 line-clamp-2 flex-1 text-sub text-gray-500 dark:text-gray-400">
                        {c.description || "Component token documentation."}
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <Badge tone="primary">{c.tokenCount} tokens</Badge>
                        {c.baseCount > 0 && <Badge tone="gray">{c.baseCount} base</Badge>}
                        {c.hasFigma && <Badge tone="success">Figma</Badge>}
                      </div>
                    </Link>
                  </HoverLift>
                </StaggerItem>
              ))}
            </Stagger>
          </section>
        ))}
      </article>
    </PageTransition>
  );
}
