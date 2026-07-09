import Link from "next/link";
import { TokenPath } from "@/components/ui";
import { HomeHero } from "@/components/home-hero";
import { PageTransition, Reveal, Stagger, StaggerItem, HoverLift } from "@/components/motion";
import { ExamplePreview } from "@/components/doc-blocks";
import { getExamples } from "@/lib/examples";
import { componentIndex, primitives, semanticColors, FIGMA_MOBILE_FILE, FIGMA_FOUNDATIONS_FILE } from "@/lib/data";

const PREVIEW_SLUGS = [
  "form--button",
  "overlay--modal",
  "tag--tag",
  "overlay--snackbar",
  "avatar--avatar",
  "form--toggle",
  "navigation--bottom-navigation-bar",
  "badge--badge",
  "progress--progress-step",
];

export default function GettingStarted() {
  const previews = PREVIEW_SLUGS.map((slug) => {
    const c = componentIndex.find((x) => x.slug === slug);
    const ex = getExamples(slug);
    return c && ex ? { slug, name: c.name, strip: ex.strip } : null;
  }).filter(Boolean) as { slug: string; name: string; strip: React.ReactNode }[];

  return (
    <PageTransition>
      <article>
        <HomeHero
          stats={{
            primitives: primitives.length,
            semanticColors: semanticColors.length,
            components: componentIndex.length,
            modes: 4,
          }}
        />

        <Reveal className="mt-12">
          <div className="doc">
            <h2 className="!mt-0">The three-layer architecture in one minute</h2>
            <ol>
              <li>
                <strong>Primitives</strong> — the raw palette and scales. <TokenPath>color/neutral/gray/700</TokenPath>{" "}
                is <code>#344054</code>. Primitives have no opinion about where they are used.
              </li>
              <li>
                <strong>Semantics</strong> — meaning. <TokenPath>color/text/neutral/body/1</TokenPath> means
                &quot;default body text&quot; and points at a primitive. It resolves differently per mode: gray-700 in
                light, gray-400 in dark.
              </li>
              <li>
                <strong>Component tokens</strong> — wiring. <TokenPath>button/color/primary/background</TokenPath> pins
                a specific part of a specific component to a semantic token. Maintained by the design system team only.
              </li>
            </ol>
            <p>
              Read <Link href="/foundations/tokens-overview">Tokens overview</Link> for the full rules, including the
              decision ladder for exceptions and the review rubric.
            </p>
          </div>
        </Reveal>

        <Reveal className="mt-12">
          <div className="doc">
            <h2 className="!mt-0">Component previews</h2>
            <p className="!mt-1 text-sub text-gray-500 dark:text-gray-400">
              Illustrative mocks from the component catalog — every page has live examples like these.
            </p>
          </div>
          <Stagger className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {previews.map((p) => (
              <StaggerItem key={p.slug}>
                <HoverLift className="h-full">
                  <Link href={`/components/${p.slug}`} className="block h-full no-underline">
                    <ExamplePreview label={p.name} padded={false}>
                      <div className="flex min-h-[110px] w-full scale-90 items-center justify-center">{p.strip}</div>
                    </ExamplePreview>
                  </Link>
                </HoverLift>
              </StaggerItem>
            ))}
          </Stagger>
        </Reveal>

        <Reveal className="mt-12">
          <div className="doc">
            <h2 className="!mt-0">What lives where</h2>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-card dark:border-surface-line dark:bg-surface-raised">
              <p className="font-semibold text-gray-900 dark:text-gray-100">Figma — component library</p>
              <p className="mt-1 text-sub text-gray-600 dark:text-gray-400">
                The published mobile component library designers consume. Every component page here embeds its page
                from this file.
              </p>
              <a
                className="mt-2 inline-block text-sub text-primary-600 hover:underline dark:text-primary-400"
                href={FIGMA_MOBILE_FILE}
                target="_blank"
                rel="noreferrer"
              >
                Open HighRise Mobile Components →
              </a>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-card dark:border-surface-line dark:bg-surface-raised">
              <p className="font-semibold text-gray-900 dark:text-gray-100">Figma — foundations</p>
              <p className="mt-1 text-sub text-gray-600 dark:text-gray-400">
                Color ramps, typography, spacing, and the multi-mode variable collections (Light, Dark, Purple Light,
                Purple Dark).
              </p>
              <a
                className="mt-2 inline-block text-sub text-primary-600 hover:underline dark:text-primary-400"
                href={FIGMA_FOUNDATIONS_FILE}
                target="_blank"
                rel="noreferrer"
              >
                Open HighRise 1.2 Foundations →
              </a>
            </div>
          </div>
          <div className="doc">
            <p>
              The code source of truth is the <strong>HighRise-Tokens repository</strong>. The <code>tokens/</code>{" "}
              directory holds <code>Primitive.json</code>, the semantic layers under <code>Semantics/</code>, and
              per-component token files under <code>mobile-components/</code>. Nothing on this site is hand-copied —
              every table is rebuilt from the JSON on each build, so it cannot drift from the source of truth.
            </p>
          </div>
        </Reveal>

        <Reveal className="mt-12">
          <div className="doc">
            <h2 className="!mt-0">How to consume the system</h2>
            <h3>Designers</h3>
            <ul>
              <li>Insert components from the published Figma library. Never detach, never restyle their internals.</li>
              <li>
                For anything custom, apply <strong>semantic variables only</strong> — pick by meaning, never by looks.
              </li>
              <li>Check every screen in both light and dark modes before handoff.</li>
              <li>Never type a raw hex or pixel value into a design — a missing token is a design system request.</li>
            </ul>
            <h3>Developers</h3>
            <ul>
              <li>Token JSON is transformed into platform variables by the build pipeline. Reference the variable, never its current value.</li>
              <li>Dark mode and white-label theming swap what the primitive and semantic layers resolve to — component code never branches on theme.</li>
              <li>
                The Tokens tab on any <Link href="/components">component page</Link> shows exactly which semantic token
                each part uses.
              </li>
            </ul>
          </div>
        </Reveal>
      </article>
    </PageTransition>
  );
}
