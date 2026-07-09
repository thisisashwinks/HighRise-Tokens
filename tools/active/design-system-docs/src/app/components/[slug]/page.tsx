import { notFound } from "next/navigation";
import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Tabs } from "@/components/tabs";
import { Badge, Callout, TokenPath } from "@/components/ui";
import { TokenTable, type TokenRow } from "@/components/token-table";
import { DoDontCard, ExamplePreview, FigmaEmbed, PropsTable, type PropRow } from "@/components/doc-blocks";
import { PageTransition, Reveal } from "@/components/motion";
import { getExamples } from "@/lib/examples";
import {
  components,
  categoryLabel,
  figmaNodeLink,
  formatValue,
  FIGMA_MOBILE_FILE,
  FIGMA_FOUNDATIONS_FILE,
  type ComponentDoc,
  type FlatToken,
  type VariantsMeta,
} from "@/lib/data";
import { getGuidance, OVERVIEW_FALLBACKS } from "@/lib/guidance";

export function generateStaticParams() {
  return components.map((c) => ({ slug: c.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const c = components.find((x) => x.slug === params.slug);
  return { title: c ? `${c.name} — HighRise Design System` : "Component — HighRise Design System" };
}

function splitList(s: string | undefined): string[] {
  if (!s) return [];
  return s
    .split(/,\s*/)
    .map((x) => x.trim())
    .filter(Boolean);
}

function VariantsTable({ variants }: { variants: NonNullable<VariantsMeta> }) {
  return (
    <table>
      <thead>
        <tr>
          <th className="w-32">Axis</th>
          <th className="w-36">Option</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
        {Object.entries(variants).flatMap(([axis, options]) =>
          typeof options === "string" ? (
            <tr key={axis}>
              <td><code>{axis}</code></td>
              <td>—</td>
              <td>{options}</td>
            </tr>
          ) : (
            Object.entries(options).map(([opt, desc], i) => (
              <tr key={`${axis}-${opt}`}>
                <td>{i === 0 ? <code>{axis}</code> : ""}</td>
                <td><code>{opt}</code></td>
                <td>{String(desc)}</td>
              </tr>
            ))
          )
        )}
      </tbody>
    </table>
  );
}

function OverviewTab({ c }: { c: ComponentDoc }) {
  const g = getGuidance(c);
  const ex = getExamples(c.slug);
  const features = splitList(c.usage?.features);
  const description = c.description || g.overview || OVERVIEW_FALLBACKS[c.slug] || "";
  return (
    <div className="doc">
      <p className="!mt-0">{description}</p>
      {g.overview && c.description && g.overview !== c.description && <p>{g.overview}</p>}

      {ex && (
        <div className="mt-5">
          <ExamplePreview label="At a glance">{ex.strip}</ExamplePreview>
        </div>
      )}

      {c.structure && (
        <>
          <h3>Structure</h3>
          <p>{c.structure}</p>
        </>
      )}

      {c.bases.length > 0 && (
        <>
          <h3>Anatomy — base components</h3>
          <p className="!mt-1 text-sub text-gray-500 dark:text-gray-400">
            These base components are part of {c.name} and are documented on this page rather than on pages of their
            own. Their tokens appear on the Tokens tab.
          </p>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {c.bases.map((b) => (
              <div
                key={b.key}
                className="rounded-xl border border-gray-200 bg-white p-3.5 shadow-card dark:border-surface-line dark:bg-surface-raised"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="!mt-0 text-body font-semibold text-gray-900 dark:text-gray-100">{b.name}</p>
                  <Badge tone="gray">{b.tokenCount} tokens</Badge>
                </div>
                <p className="!mt-1 line-clamp-3 text-sub text-gray-500 dark:text-gray-400">
                  {b.description || "Supporting token set for this component."}
                </p>
                <p className="!mt-1.5 font-mono text-[11px] text-gray-400">{b.file}</p>
              </div>
            ))}
          </div>
        </>
      )}

      {c.sizes && (
        <>
          <h3>Sizes</h3>
          <table>
            <thead>
              <tr>
                <th className="w-40">Size</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(c.sizes).map(([k, v]) => (
                <tr key={k}>
                  <td><code>{k}</code></td>
                  <td>{String(v)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {c.variants && (
        <>
          <h3>Variants</h3>
          <VariantsTable variants={c.variants} />
        </>
      )}

      {features.length > 0 && (
        <>
          <h3>Features</h3>
          <ul>
            {features.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

/** Derive a props table from $component.variants metadata, falling back to authored props. */
function deriveProps(c: ComponentDoc): PropRow[] {
  const g = getGuidance(c);
  const rows: PropRow[] = [];
  if (c.variants) {
    const stateOptions: string[] = [];
    for (const [axis, options] of Object.entries(c.variants)) {
      if (typeof options === "string") {
        stateOptions.push(axis);
      } else {
        const opts = Object.keys(options);
        const firstDesc = String(Object.values(options)[0] ?? "");
        rows.push({
          name: axis,
          options: opts.join(" | "),
          defaultValue: opts[0] ?? "",
          description: firstDesc
            ? `Variant axis. Option details in the variants table (e.g. ${opts[0]}: ${firstDesc.slice(0, 80)}${firstDesc.length > 80 ? "…" : ""}).`
            : "Variant axis from the token source; option details in the variants table.",
        });
      }
    }
    if (stateOptions.length) {
      rows.push({
        name: "variant",
        options: stateOptions.join(" | "),
        defaultValue: stateOptions[0],
        description: "Component variant set from the token source; each option is described in the variants table.",
      });
    }
  }
  if (g.props) {
    for (const p of g.props) {
      if (!rows.some((r) => r.name === p.name)) {
        rows.push({ name: p.name, options: p.options, defaultValue: p.defaultValue, description: p.description });
      }
    }
  }
  if (rows.length === 0) {
    rows.push(
      {
        name: "variant",
        options: "default",
        defaultValue: "default",
        description: "This component has a single documented variant in the token source.",
      },
      {
        name: "theme",
        options: "light | dark",
        defaultValue: "light",
        description: "Resolved automatically by the semantic token layer — never set per instance.",
      }
    );
  }
  return rows;
}

function UsageTab({ c }: { c: ComponentDoc }) {
  const g = getGuidance(c);
  const ex = getExamples(c.slug);
  return (
    <div className="doc">
      {ex && ex.examples.length > 0 && (
        <>
          <h3 className="!mt-0">Examples</h3>
          <p className="!mt-1 text-sub text-gray-500 dark:text-gray-400">
            Illustrative mocks built with the HighRise ramps — not the production component.
          </p>
          <div className="mt-3 space-y-4">
            {ex.examples.map((e, i) => (
              <Reveal key={e.label} delay={i * 0.04}>
                <ExamplePreview label={e.label} caption={e.caption}>
                  {e.node}
                </ExamplePreview>
              </Reveal>
            ))}
          </div>
        </>
      )}

      <h3>Do and don&apos;t</h3>
      <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <DoDontCard kind="do" headline={g.dos[0]} bullets={g.dos.slice(1)} sketch={ex?.doSketch} />
        <DoDontCard kind="dont" headline={g.donts[0]} bullets={g.donts.slice(1)} sketch={ex?.dontSketch} />
      </div>

      <h3>When to use</h3>
      <ul>
        {g.whenToUse.map((x) => (
          <li key={x}>{x}</li>
        ))}
      </ul>
      <h3>When not to use</h3>
      <ul>
        {g.whenNotToUse.map((x) => (
          <li key={x}>{x}</li>
        ))}
      </ul>

      <h3>Props</h3>
      <p className="!mt-1 text-sub text-gray-500 dark:text-gray-400">
        Derived from the component&apos;s variant metadata in the token source
        {c.variants ? "" : " (authored — this component has no variants metadata yet)"}.
      </p>
      <PropsTable rows={deriveProps(c)} />
    </div>
  );
}

function tokenRows(tokens: FlatToken[]): TokenRow[] {
  return tokens.map((t) => ({
    path: t.path,
    value: formatValue(t.value),
    type: t.type,
    description: t.description,
    resolved:
      typeof t.resolved === "string" || typeof t.resolved === "number" ? String(t.resolved) : undefined,
  }));
}

function TokensTab({ c }: { c: ComponentDoc }) {
  return (
    <div className="doc">
      <p className="!mt-0">
        {c.tokenCount} tokens across {c.name}
        {c.bases.length > 0 && <> and its {c.bases.length} base component{c.bases.length > 1 ? "s" : ""}</>}. Values
        reference semantic tokens; the arrow shows the resolved light-mode value where the chain resolves. See{" "}
        <Link href="/foundations/component-tokens">Component tokens</Link> for how this layer works.
      </p>
      {c.tokens.length > 0 && (
        <>
          {c.bases.length > 0 && <h3>{c.name}</h3>}
          {c.file && (
            <p className="!mt-1 font-mono text-[11.5px] text-gray-400">{c.file}</p>
          )}
          <div className="mt-3">
            <TokenTable rows={tokenRows(c.tokens)} searchPlaceholder={`Search ${c.name} tokens`} />
          </div>
        </>
      )}
      {c.bases.map((b) => (
        <section key={b.key} className="mt-8">
          <h3>
            {b.name} <span className="font-normal text-gray-400">(base component)</span>
          </h3>
          <p className="!mt-1 font-mono text-[11.5px] text-gray-400">{b.file}</p>
          <div className="mt-3">
            <TokenTable rows={tokenRows(b.tokens)} searchPlaceholder={`Search ${b.name} tokens`} />
          </div>
        </section>
      ))}
    </div>
  );
}

function DesignTab({ c }: { c: ComponentDoc }) {
  return (
    <div className="doc">
      {c.figmaPageId ? (
        <>
          <p className="!mt-0">
            Live embed of the <strong>{c.figmaPage}</strong> page from the HighRise Mobile Components file — the full
            component page with every variant (node <TokenPath>{c.figmaPageId}</TokenPath>).
          </p>
          <FigmaEmbed nodeId={c.figmaPageId} title={`${c.name} in Figma`} />
          {c.figmaNodeId && c.figmaNodeId !== c.figmaPageId && (
            <p>
              Deep link:{" "}
              <a href={figmaNodeLink(c.figmaNodeId)} target="_blank" rel="noreferrer">
                open this component&apos;s node ({c.figmaNodeId}) in Figma
              </a>
              .
            </p>
          )}
        </>
      ) : (
        <Callout tone="info" title="No single Figma page">
          <p>
            This page documents supporting token sets that don&apos;t map to one Figma component page. Browse the{" "}
            <a href={FIGMA_MOBILE_FILE} target="_blank" rel="noreferrer">
              HighRise Mobile Components file
            </a>{" "}
            for related frames.
          </p>
        </Callout>
      )}
      <p>
        Related: <a href={FIGMA_MOBILE_FILE} target="_blank" rel="noreferrer">Mobile Components file</a> ·{" "}
        <a href={FIGMA_FOUNDATIONS_FILE} target="_blank" rel="noreferrer">Foundations file</a>
      </p>
    </div>
  );
}

export default function ComponentPage({ params }: { params: { slug: string } }) {
  const c = components.find((x) => x.slug === params.slug);
  if (!c) notFound();

  return (
    <PageTransition>
      <article>
        <Breadcrumbs
          items={[
            { label: "Components", href: "/components" },
            { label: categoryLabel(c.category), href: "/components" },
            { label: c.name },
          ]}
        />
        <div className="mb-2 flex flex-wrap items-center gap-3">
          <h1 className="text-[26px] font-semibold leading-9 tracking-[-0.01em] text-gray-900 dark:text-gray-100">
            {c.name}
          </h1>
          <Badge tone="gray">{categoryLabel(c.category)}</Badge>
          <Badge tone="primary">{c.tokenCount} tokens</Badge>
          {c.bases.length > 0 && <Badge tone="success">{c.bases.length} base component{c.bases.length > 1 ? "s" : ""}</Badge>}
        </div>
        {c.file && (
          <p className="mb-6 text-sub text-gray-500 dark:text-gray-400">
            Source: <code className="font-mono text-[12px]">tokens/mobile-components/{c.file}</code>
          </p>
        )}
        <Tabs
          tabs={[
            { label: "Overview", content: <OverviewTab c={c} /> },
            { label: "Usage", content: <UsageTab c={c} /> },
            { label: "Tokens", content: <TokensTab c={c} /> },
            { label: "Design", content: <DesignTab c={c} /> },
          ]}
        />
      </article>
    </PageTransition>
  );
}
