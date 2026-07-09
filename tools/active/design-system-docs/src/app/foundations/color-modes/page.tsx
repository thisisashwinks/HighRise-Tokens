import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Callout, Swatch, TokenPath } from "@/components/ui";
import { ContrastDemo } from "@/components/foundations-visuals";
import { PageTransition, Reveal } from "@/components/motion";

export const metadata = { title: "Color modes & dark mode — HighRise Design System" };

const EXAMPLES = [
  {
    token: "text/neutral/title/1",
    light: { hex: "#101828", ref: "gray-900" },
    dark: { hex: "#eaecf0", ref: "gray-200" },
    preserves: "17.75:1 contrast on the base surface — and deliberately avoids pure-white glare.",
  },
  {
    token: "text/neutral/body/1",
    light: { hex: "#344054", ref: "gray-700" },
    dark: { hex: "#98a2b3", ref: "gray-400" },
    preserves: "Body-text contrast ratio, keeping the title → body → subtitle hierarchy legible.",
  },
  {
    token: "background/neutral/subtle/1",
    light: { hex: "#f2f4f7", ref: "gray-100" },
    dark: { hex: "#0a0d12", ref: "gray-950" },
    preserves: "A fill 3.9 L* below white stays 3.9 L* above black — subtle stays subtle.",
  },
];

export default function ColorModes() {
  return (
    <PageTransition>
    <article className="doc">
      <Breadcrumbs items={[{ label: "Foundations", href: "/foundations/tokens-overview" }, { label: "Color modes & dark mode" }]} />
      <h1>Color modes &amp; dark mode</h1>
      <p>
        HighRise ships four color modes: <strong>Light</strong>, <strong>Dark</strong>,{" "}
        <strong>Purple Light</strong>, and <strong>Purple Dark</strong>. A mode is not a different set of tokens — it
        is a different set of <em>answers</em> to the same tokens. Every semantic token exists once; each mode supplies
        its own primitive mapping.
      </p>

      <h2>One collection in Figma, separate files in code</h2>
      <p>
        In Figma, the four modes are four columns of a single <strong>Semantic-Colors variable collection</strong>.
        Selecting a mode on a frame re-resolves every variable on it — checking a screen in dark mode is one click, and
        a token can never exist in one mode but not another.
      </p>
      <p>
        In code, the same data lives as parallel JSON files — <code>Semantics/Semantic-Colors/Light.json</code> and{" "}
        <code>Dark.json</code> — with identical key structure. The sync tooling treats the Figma columns and the JSON
        files as two views of one table. Purple Light and Purple Dark are the white-label columns; see{" "}
        <Link href="/foundations/white-label">White-label &amp; custom colors</Link>.
      </p>

      <h2>Dark mode is not positional inversion</h2>
      <p>
        The tempting rule — &quot;gray-100 in light becomes gray-900 in dark&quot; — produces the classic dark-mode
        mess, because the gray ramp is <strong>perceptually uneven</strong>. Measured in L* (perceptual lightness), the
        light end of the ramp (gray 0–200) spans only about 7 L* across five steps — nearly flat — while the middle
        (gray 300–500) cliffs by about 38 L*. So <code>gray-50</code> sits 1.8 L* below white, but its positional
        mirror <code>gray-800</code> sits 16.2 L* above black — roughly 9 times the perceived separation. Multiply that
        distortion across every token and the whole hierarchy collapses: subtle fills shout, titles glare, and
        mid-grays disappear.
      </p>

      <h2>The method: contrast preservation</h2>
      <Reveal className="mt-4">
        <ContrastDemo />
      </Reveal>
      <p>
        Dark values are derived by preserving each token&apos;s light-mode <em>relationship</em>, not its ramp
        position:
      </p>
      <ul>
        <li>
          <strong>Foreground tokens (text, icon, border)</strong> reproduce their light-mode WCAG contrast ratio
          against the base surface. If a title hits 17.75:1 on white, its dark value is the primitive that hits 17.75:1
          on black.
        </li>
        <li>
          <strong>Fill tokens (background, surface tints)</strong> reproduce their lightness distance from the base
          surface. A fill 3.9 L* below white sits 3.9 L* above black — so &quot;subtle&quot; stays subtle and
          &quot;intense&quot; stays intense.
        </li>
      </ul>
      <p>
        Surface elevation tokens (<TokenPath>surface/base</TokenPath> through <TokenPath>surface/sunken</TokenPath>)
        are the deliberate exception: their dark values encode elevation (lighter = closer to the user), not contrast
        mirrors. See <Link href="/foundations/semantic-tokens">Semantic tokens</Link>.
      </p>

      <h3>Worked examples</h3>
      <table>
        <thead>
          <tr>
            <th>Token</th>
            <th>Light</th>
            <th>Dark</th>
            <th>What is preserved</th>
          </tr>
        </thead>
        <tbody>
          {EXAMPLES.map((e) => (
            <tr key={e.token}>
              <td><TokenPath>{e.token}</TokenPath></td>
              <td>
                <span className="flex items-center gap-2">
                  <Swatch hex={e.light.hex} />
                  <span>
                    <code>{e.light.hex}</code>{" "}
                    <span className="text-[11px] text-gray-400">{e.light.ref}</span>
                  </span>
                </span>
              </td>
              <td>
                <span className="flex items-center gap-2">
                  <Swatch hex={e.dark.hex} />
                  <span>
                    <code>{e.dark.hex}</code>{" "}
                    <span className="text-[11px] text-gray-400">{e.dark.ref}</span>
                  </span>
                </span>
              </td>
              <td>{e.preserves}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <Callout tone="info" title="Why titles are not pure white in dark mode">
        <p>
          Pure white text on pure black exceeds 21:1 — noticeably harsher than the 17.75:1 the light theme was designed
          around, and a common source of halation (glow) on OLED screens. Matching the intended contrast, rather than
          maximizing it, is what makes dark mode feel designed instead of inverted.
        </p>
      </Callout>

      <h2>What this means for you</h2>
      <ul>
        <li>Never hand-pick a dark variant. If a semantic token exists, its dark value is already derived.</li>
        <li>
          If a token genuinely reads wrong in dark mode for everyone, the fix is the shared semantic dark value —
          one edit, every screen — not a per-screen override.
        </li>
        <li>Review every design in both modes before handoff. The system makes this a mode switch, not a redesign.</li>
      </ul>
    </article>
    </PageTransition>
  );
}
