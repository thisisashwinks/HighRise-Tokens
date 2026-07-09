import { Breadcrumbs } from "@/components/breadcrumbs";
import { Callout, TokenPath, Swatch } from "@/components/ui";
import { SemanticColorTable, TokenTable, type TokenRow } from "@/components/token-table";
import { ElevationLadder, Toc } from "@/components/foundations-visuals";
import { PageTransition, Reveal } from "@/components/motion";
import { semanticColors, semanticTokens, formatValue, FIGMA_FOUNDATIONS_FILE } from "@/lib/data";

export const metadata = { title: "Semantic tokens — HighRise Design System" };

const SURFACES = [
  { token: "surface/base", light: "#ffffff", dark: "#000000", use: "The page or app background. Everything else sits on this." },
  { token: "surface/raised", light: "#ffffff", dark: "#1d2939", use: "Cards, list groups, and tiles sitting on the page." },
  { token: "surface/overlay", light: "#ffffff", dark: "#344054", use: "Modals, sheets, menus, popovers, and dropdowns." },
  { token: "surface/sunken", light: "#f9fafb", dark: "#000000", use: "Inset wells recessed into a surface." },
];

export default function SemanticTokens() {
  const nonColorRows: TokenRow[] = semanticTokens.map((t) => ({
    path: t.path,
    value: formatValue(t.value),
    type: t.type,
    description: t.description,
    resolved:
      typeof t.resolved === "string" || typeof t.resolved === "number" ? String(t.resolved) : undefined,
  }));

  return (
    <PageTransition>
    <article className="doc">
      <Toc
        items={[
          { id: "naming", label: "Naming" },
          { id: "surfaces", label: "Surface elevation" },
          { id: "on-color", label: "On-color" },
          { id: "on-raised", label: "On-raised borders" },
          { id: "colors", label: "Color tokens" },
          { id: "non-color", label: "Non-color" },
        ]}
      />
      <Breadcrumbs items={[{ label: "Foundations", href: "/foundations/tokens-overview" }, { label: "Semantic tokens" }]} />
      <h1>Semantic tokens</h1>
      <p>
        Semantic tokens are the layer designers and developers actually use. Each one names a <em>meaning</em> —
        &quot;default body text,&quot; &quot;subtle neutral fill,&quot; &quot;error border&quot; — and points at a
        primitive. Because the pointer can differ per color mode, the same semantic token resolves to different hexes
        in Light, Dark, Purple Light, and Purple Dark without any design or code change.
      </p>

      <h2 id="naming">Naming convention</h2>
      <p>Color semantics follow one predictable pattern:</p>
      <p className="!mt-2">
        <TokenPath>color/{"{property}"}/{"{role}"}/{"{prominence}"}/{"{step}"}</TokenPath>
      </p>
      <table>
        <thead>
          <tr>
            <th>Segment</th>
            <th>Values</th>
            <th>What it answers</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>property</strong></td>
            <td><code>background</code> · <code>text</code> · <code>border</code> · <code>icon</code> · <code>surface</code></td>
            <td>What kind of thing is being painted?</td>
          </tr>
          <tr>
            <td><strong>role</strong></td>
            <td><code>neutral</code> · <code>primary</code> · <code>success</code> · <code>error</code> · <code>warning</code></td>
            <td>What does it communicate?</td>
          </tr>
          <tr>
            <td><strong>prominence</strong></td>
            <td>
              <code>base</code> → <code>subtle</code> → <code>moderate</code> → <code>intense</code>; text also uses{" "}
              <code>title</code> / <code>body</code> / <code>subtitle</code>
            </td>
            <td>How strongly should it read?</td>
          </tr>
          <tr>
            <td><strong>step</strong></td>
            <td><code>0</code>, <code>1</code>, <code>2</code>…</td>
            <td>Fine gradation within a prominence.</td>
          </tr>
        </tbody>
      </table>
      <p>
        Examples: <TokenPath>color/text/neutral/body/1</TokenPath> is default body text;{" "}
        <TokenPath>color/background/primary/intense/0</TokenPath> is the solid primary button fill;{" "}
        <TokenPath>color/border/error/moderate/1</TokenPath> is an invalid-input border. Reading the name tells you
        where the token belongs — and the reviewer whether it was used correctly.
      </p>

      <h2 id="surfaces">Surface elevation tokens</h2>
      <p>
        Surfaces answer &quot;what is this element sitting on?&quot; Light mode shows depth with shadow, so all raised
        levels stay white; dark mode has no usable shadow, so each level up gets a lighter gray. Same token, two
        behaviors:
      </p>
      <Reveal className="mt-4">
        <ElevationLadder />
      </Reveal>
      <table>
        <thead>
          <tr>
            <th>Token</th>
            <th>Light</th>
            <th>Dark</th>
            <th>Use for</th>
          </tr>
        </thead>
        <tbody>
          {SURFACES.map((s) => (
            <tr key={s.token}>
              <td><TokenPath>{s.token}</TokenPath></td>
              <td>
                <span className="flex items-center gap-2">
                  <Swatch hex={s.light} /> <code>{s.light}</code>
                </span>
              </td>
              <td>
                <span className="flex items-center gap-2">
                  <Swatch hex={s.dark} /> <code>{s.dark}</code>
                </span>
              </td>
              <td>{s.use}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p>
        Because <code>raised</code> and <code>overlay</code> resolve to white in light mode, re-pointing a component
        from a plain background token to a surface token is invisible in light and only takes effect in dark — a
        low-risk migration.
      </p>

      <h2 id="on-color">On-color tokens</h2>
      <p>
        Text and icons that sit on a colored fill (a primary button, a solid badge) must stay light in{" "}
        <strong>both</strong> modes — inverting them with the theme would break contrast against the fill, which stays
        saturated. <TokenPath>text/neutral/on-color</TokenPath> and <TokenPath>icon/neutral/on-color</TokenPath> exist
        for exactly this. If white text on a blue button looks wrong somewhere, the answer is the on-color token — not
        a raw <code>#ffffff</code> and not a component override.
      </p>

      <h2 id="on-raised">Border -on-raised variants</h2>
      <p>
        A subtle border that reads fine on the black page background vanishes on a <code>#1d2939</code> card. The fix
        is not a component override — it is an elevation-aware border token that steps lighter in dark mode:{" "}
        <TokenPath>border/neutral/subtle/on-raised</TokenPath> and{" "}
        <TokenPath>border/neutral/default/on-raised</TokenPath> match their base variants in light mode and resolve one
        to two gray steps lighter in dark. Use them for dividers and input borders that live on raised surfaces.
      </p>

      <h2 id="colors">Semantic color tokens — light and dark</h2>
      <p>
        Every semantic color token with its resolved value in both modes, straight from{" "}
        <code>Semantics/Semantic-Colors/Light.json</code> and <code>Dark.json</code>. The reference column shows which
        primitive each mode points at. Ramps live in the{" "}
        <a href={FIGMA_FOUNDATIONS_FILE} target="_blank" rel="noreferrer">Foundations Figma file</a>.
      </p>
      <div className="mt-4">
        <SemanticColorTable rows={semanticColors} />
      </div>

      <h2 id="non-color">Non-color semantics</h2>
      <p>
        Spacing, size, font, border radius, and the other dimension-flavored semantics follow the same idea: a
        meaning-first alias onto the primitive scales.
      </p>
      <Callout tone="info">
        <p>
          These do not vary by color mode — they exist so component tokens reference one consistent vocabulary and so
          scale changes (say, a denser mobile spacing scale) can happen in one place.
        </p>
      </Callout>
      <div className="mt-4">
        <TokenTable rows={nonColorRows} searchPlaceholder="Search non-color semantics (e.g. padding, radius, font)" />
      </div>
    </article>
    </PageTransition>
  );
}
