import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Callout, CodeBlock, TokenPath } from "@/components/ui";
import { PageTransition } from "@/components/motion";

export const metadata = { title: "White-label & custom colors — HighRise Design System" };

export default function WhiteLabel() {
  return (
    <PageTransition>
    <article className="doc">
      <Breadcrumbs items={[{ label: "Foundations", href: "/foundations/tokens-overview" }, { label: "White-label & custom colors" }]} />
      <h1>White-label &amp; custom colors</h1>
      <p>
        HighLevel products are rebranded by agencies, so the primary color must be swappable — in light and dark, for
        every component — without touching a single design or line of component code. The token architecture makes this
        a primitive-layer operation. Two scenarios:
      </p>

      <h2>Scenario 1 — the accent already exists in HighRise</h2>
      <p>
        The Purple Light and Purple Dark modes are the built-in example. They are two extra columns of the same
        Semantic-Colors collection in which <strong>every <TokenPath>primary/*</TokenPath> semantic is re-pointed from
        the blue ramp to the accent/purple ramp — using the same step mapping</strong>. Where Light maps{" "}
        <TokenPath>background/primary/intense/0</TokenPath> → <code>blue/600</code>, Purple Light maps it →{" "}
        <code>purple/600</code>. Neutral, success, error, and warning mappings are untouched; nothing else changes.
      </p>
      <p>
        Because the step mapping is identical, all the contrast relationships engineered into the blue mapping carry
        over — the purple brand inherits accessible buttons, focus rings, and links for free. Adding another stock
        accent (teal, rose, indigo…) is the same recipe: one new mode column, zero new tokens.
      </p>

      <h2>Scenario 2 — a custom brand color not in the system</h2>
      <p>
        An agency brings <code>#7a3ce8</code>, or any other hex. No human authors a ramp for it. A runtime script does
        what the design system team did for blue, automatically:
      </p>
      <ol>
        <li>
          <strong>Convert the brand color to OKLCH</strong> — a lightness (L), chroma (C), and hue (H) triple in a
          perceptually uniform space.
        </li>
        <li>
          <strong>Generate the full 13-step ramp</strong>: hold H fixed so every step stays recognizably the brand hue,
          and step L across the same perceptual anchors the blue ramp uses (so <code>brand/600</code> is exactly as
          dark as <code>blue/600</code>). Chroma tapers toward the extremes to stay inside the sRGB gamut — very light
          and very dark colors physically cannot hold full saturation.
        </li>
        <li>
          <strong>Assign semantics by the same contrast targets.</strong> The <TokenPath>primary/*</TokenPath> mappings
          use the same steps as blue, and because ramp steps are contrast-anchored, both the light <em>and</em> dark
          mappings derive automatically — dark mode needs no separate brand work.
        </li>
      </ol>
      <CodeBlock>{`brandHex ─► toOKLCH(L, C, H)
          ─► ramp: H fixed, L stepped on blue's anchors, C tapered at extremes
          ─► primary/* semantics re-point to brand ramp (same steps as blue)
          ─► light + dark both resolve — semantics and component tokens untouched`}</CodeBlock>
      <Callout tone="info" title="The invariant">
        <p>
          Semantic and component tokens never change. White-label theming only changes what the primitive layer
          resolves to. That is why it works for every component, in both modes, on day one.
        </p>
      </Callout>

      <h2>Why OKLCH</h2>
      <p>
        The generation step needs a color model where lightness and contrast are predictable from the numbers. The
        candidates:
      </p>
      <table>
        <thead>
          <tr>
            <th>Model</th>
            <th>Perceptual lightness</th>
            <th>Hue stays put</th>
            <th>Contrast predictable</th>
            <th>CSS native</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>RGB / hex</strong></td>
            <td>No</td>
            <td>—</td>
            <td>No</td>
            <td>Yes</td>
          </tr>
          <tr>
            <td><strong>HSL</strong></td>
            <td>No — 50% L yellow looks far brighter than 50% L blue</td>
            <td>No — lightening blue drifts it purple</td>
            <td>No</td>
            <td>Yes</td>
          </tr>
          <tr>
            <td><strong>HSLuv</strong></td>
            <td>Yes</td>
            <td>Yes</td>
            <td>Decent</td>
            <td>No — JS library, sRGB only</td>
          </tr>
          <tr>
            <td><strong>OKLCH</strong></td>
            <td>Yes (best)</td>
            <td>Yes</td>
            <td>Yes</td>
            <td>Yes — native since 2023, P3-ready</td>
          </tr>
        </tbody>
      </table>
      <p>
        <strong>OKLCH is the choice</strong>: perceptually uniform (even L steps look even), hue-stable when
        lightening or darkening, contrast-predictable from L alone, and writable directly in CSS (
        <code>oklch(53.7% 0.229 262)</code>). HSL&apos;s fake lightness is, notably, the same defect that made the
        positional dark-mode inversion fail — see{" "}
        <Link href="/foundations/color-modes">Color modes &amp; dark mode</Link>. The only cost is that OKLCH values
        are not eyeball-guessable and results must be gamut-mapped back to sRGB — both one-liners in tooling.
      </p>
    </article>
    </PageTransition>
  );
}
