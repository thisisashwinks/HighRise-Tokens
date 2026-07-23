import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Callout, CodeBlock, TokenPath } from "@/components/ui";
import { componentIndex, categoryLabel } from "@/lib/data";
import { TokenPyramid } from "@/components/foundations-visuals";
import { PageTransition, Reveal } from "@/components/motion";

export const metadata = { title: "Component tokens — HighRise Design System" };

export default function ComponentTokens() {
  const byCategory = new Map<string, typeof componentIndex>();
  for (const c of componentIndex) {
    const list = byCategory.get(c.category) ?? [];
    list.push(c);
    byCategory.set(c.category, list);
  }
  const total = componentIndex.reduce((n, c) => n + c.tokenCount, 0);

  return (
    <PageTransition>
    <article className="doc">
      <Breadcrumbs items={[{ label: "Foundations", href: "/foundations/tokens-overview" }, { label: "Component tokens" }]} />
      <h1>Component tokens</h1>
      <p>
        Component tokens are the third layer: the scoped wiring of one component. Where a semantic token says
        &quot;this is what default body text looks like,&quot; a component token says &quot;the label of a primary
        button uses <em>this</em> semantic token.&quot; Names are scoped to the component and its parts —{" "}
        <TokenPath>button/color/primary/text</TokenPath>, <TokenPath>modal/container/border/radius/dialogue</TokenPath>
        , <TokenPath>input/color/border/error</TokenPath>.
      </p>

      <h2>Why they exist</h2>
      <ul>
        <li>
          <strong>They make components self-describing.</strong> Every visual property of every part of a component is
          an explicit, named decision. Handoff stops being &quot;inspect and guess.&quot;
        </li>
        <li>
          <strong>They give the design system team one safe place to restyle a component.</strong> Re-pointing{" "}
          <TokenPath>modal/container/color/background</TokenPath> from a plain background token to{" "}
          <TokenPath>surface/overlay</TokenPath> fixes every modal at once — no product code changes.
        </li>
        <li>
          <strong>They keep the semantic layer honest.</strong> Component tokens point at semantics, not at primitives
          or raw values, so every component automatically follows dark mode and white-label remapping.
        </li>
      </ul>
      <Callout tone="warning" title="Edited by the design system team only">
        <p>
          Product designers and feature developers consume components; they do not repoint component tokens. If a
          component looks wrong in some context, walk the decision ladder on the{" "}
          <Link href="/foundations/tokens-overview">Tokens overview</Link> page — a component-token change is the last
          rung, not the first.
        </p>
      </Callout>
      <Callout tone="info" title="Why this layer exists at all">
        <p>
          For the industry case behind component tokens — 11 design systems surveyed, the W3C spec, and a direct
          response to the &quot;too deep&quot; objection — see the{" "}
          <Link href="/foundations/component-token-research">component token research report</Link>.
        </p>
      </Callout>

      <h2>The resolution chain</h2>
      <Reveal className="mt-4">
        <TokenPyramid />
      </Reveal>
      <p>One example, end to end — the primary button background:</p>
      <CodeBlock>{`button/color/primary/background            component token (scoped wiring)
  → {color.background.primary.intense.0}   semantic (meaning, varies by mode)
    → {color.primary.blue.600}             primitive (raw palette)
      → #155eef                            resolved hex in Light mode`}</CodeBlock>
      <p>
        In dark mode the middle arrow changes (the semantic points at a different primitive); in a white-label brand
        the bottom arrow changes (the primary ramp resolves to the brand ramp). The component token — and the component
        code — never changes at all.
      </p>

      <h2>Component catalog</h2>
      <p>
        {componentIndex.length} mobile components, {total.toLocaleString("en-US")} component tokens. Each name links to
        the component&apos;s full documentation, including its searchable token table.
      </p>
      {Array.from(byCategory.entries()).map(([cat, list]) => (
        <section key={cat}>
          <h3>{categoryLabel(cat)}</h3>
          <table>
            <thead>
              <tr>
                <th>Component</th>
                <th className="w-28">Tokens</th>
                <th className="w-40">Source file</th>
              </tr>
            </thead>
            <tbody>
              {list.map((c) => (
                <tr key={c.slug}>
                  <td>
                    <Link href={`/components/${c.slug}`}>{c.name}</Link>
                  </td>
                  <td>{c.tokenCount}</td>
                  <td className="font-mono text-[11px]">{c.file.split("/").pop()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ))}
    </article>
    </PageTransition>
  );
}
