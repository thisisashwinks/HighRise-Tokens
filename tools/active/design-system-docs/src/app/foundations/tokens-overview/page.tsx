import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Callout, CodeBlock, TokenPath } from "@/components/ui";
import { DecisionLadder, RubricGrid, Toc, TokenPyramid } from "@/components/foundations-visuals";
import { PageTransition, Reveal } from "@/components/motion";

export const metadata = { title: "Tokens overview — HighRise Design System" };

export default function TokensOverview() {
  return (
    <PageTransition>
    <article className="doc">
      <Toc
        items={[
          { id: "layers", label: "The three layers" },
          { id: "rules", label: "Core rules" },
          { id: "ladder", label: "Decision ladder" },
          { id: "rubric", label: "Review rubric" },
        ]}
      />
      <Breadcrumbs items={[{ label: "Foundations", href: "/foundations/tokens-overview" }, { label: "Tokens overview" }]} />
      <h1>Tokens overview</h1>
      <p>
        A design token is a named design decision. Instead of painting a card border <code>#d0d5dd</code>, you apply{" "}
        <TokenPath>color/border/neutral/default/1</TokenPath>. The name carries the meaning; the value is resolved per
        mode and per brand. This page explains the three layers, the rules that make the system work, and how to review
        work against them.
      </p>

      <h2 id="layers">The three layers</h2>
      <div className="mt-4">
        <TokenPyramid />
      </div>
      <p>A full resolution chain, from component to pixel:</p>
      <CodeBlock>{`button/color/primary/background
  → {color.background.primary.intense.0}   (semantic)
    → {color.primary.blue.600}             (primitive)
      → #155eef                            (light) / mode-specific value (dark)`}</CodeBlock>

      <h2 id="rules">The core rules</h2>
      <ol>
        <li>
          <strong>A design value is never a raw hex or pixel number.</strong> Every fill, stroke, text color, radius,
          and spacing value is a token reference. A raw value is invisible to theming — it will be wrong in dark mode
          and in every white-label brand, and nobody will know until it ships.
        </li>
        <li>
          <strong>Primitives are never applied directly to designs.</strong> The primitive layer exists to be
          referenced by semantics, not consumed. <TokenPath>gray/700</TokenPath> says nothing about intent, so it
          cannot be remapped when the mode changes. If you catch yourself picking a gray by eye, you want a semantic
          token instead.
        </li>
        <li>
          <strong>Consuming a library component? Never touch its tokens.</strong> Buttons, inputs, modals, and the rest
          arrive fully wired through component tokens. Restyling an instance breaks the chain and forks the component.
        </li>
        <li>
          <strong>Building anything custom? Semantic tokens only.</strong> A custom card, chart, or layout uses{" "}
          <TokenPath>surface/*</TokenPath>, <TokenPath>text/*</TokenPath>, <TokenPath>border/*</TokenPath>,{" "}
          <TokenPath>background/*</TokenPath>, and <TokenPath>icon/*</TokenPath> tokens. Never primitives, and never
          another component&apos;s component tokens.
        </li>
      </ol>

      <h2 id="ladder">Decision ladder for exceptions</h2>
      <p>
        When the &quot;right&quot; token looks wrong in some context, walk this ladder from the top.
      </p>
      <Reveal className="mt-4">
        <DecisionLadder />
      </Reveal>

      <h2 id="rubric">Review rubric</h2>
      <p>Eight checks. A screen that passes all eight is token-clean.</p>
      <Reveal className="mt-4">
        <RubricGrid />
      </Reveal>

      <Callout tone="info" title="Where to go next">
        <p>
          Layer by layer: <Link href="/foundations/primitive-tokens">Primitive tokens</Link> →{" "}
          <Link href="/foundations/semantic-tokens">Semantic tokens</Link> →{" "}
          <Link href="/foundations/component-tokens">Component tokens</Link>. For theming, see{" "}
          <Link href="/foundations/color-modes">Color modes &amp; dark mode</Link> and{" "}
          <Link href="/foundations/white-label">White-label &amp; custom colors</Link>.
        </p>
      </Callout>
    </article>
    </PageTransition>
  );
}
