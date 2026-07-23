import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Badge, Callout, CodeBlock, TokenPath } from "@/components/ui";
import { PageTransition, Reveal } from "@/components/motion";
import { TokenPyramid, Toc } from "@/components/foundations-visuals";
import {
  DropLayerRebuttal,
  EaseMatrix,
  ReportStats,
  RippleDemo,
  StateSpectrum,
  TwoArchitectures,
  WhySummary,
  WhoTouchesWhat,
} from "@/components/research-visuals";

export const metadata = {
  title: "Component token research — HighRise Design System",
};

function Ext({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noreferrer">
      {children}
    </a>
  );
}

const SYSTEMS = [
  { n: 1, name: "Material Design 3", company: "Google", term: "“Component tokens” (md-comp-*)", dark: "Yes", href: "https://m3.material.io/foundations/design-tokens/overview", link: "m3.material.io" },
  { n: 2, name: "Ant Design 5", company: "Alibaba / Ant Group", term: "“Component Token” (explicit v5 feature)", dark: "Yes", href: "https://ant.design/docs/react/customize-theme/", link: "ant.design" },
  { n: 3, name: "Carbon v11", company: "IBM", term: "“Component tokens”", dark: "Yes (4 themes)", href: "https://carbondesignsystem.com/elements/color/tokens/", link: "carbondesignsystem.com" },
  { n: 4, name: "Salesforce SLDS", company: "Salesforce", term: "“Styling Hooks” (--slds-c-*)", dark: "Yes", href: "https://v1.lightningdesignsystem.com/components/buttons/", link: "lightningdesignsystem.com" },
  { n: 5, name: "Spectrum CSS", company: "Adobe", term: "“Component tokens” + --mod-* override layer", dark: "Yes", href: "https://github.com/adobe/spectrum-css", link: "github.com/adobe/spectrum-css" },
  { n: 6, name: "Primer", company: "GitHub", term: "“Component/pattern tokens”", dark: "Yes (9 themes)", href: "https://primer.style/product/getting-started/foundations/color-usage/", link: "primer.style" },
  { n: 7, name: "Fiori / theming-base", company: "SAP", term: "“Component design tokens” (sap[Component]_*)", dark: "Yes (4 themes)", href: "https://github.com/SAP/theming-base-content", link: "github.com/SAP/theming-base-content" },
  { n: 8, name: "Mantine", company: "Open source", term: "“Component CSS variables” (--button-*)", dark: "Yes", href: "https://mantine.dev/styles/css-variables-list/", link: "mantine.dev" },
  { n: 9, name: "Fluent UI v9", company: "Microsoft", term: "“Control tokens” / component variant tokens", dark: "Yes", href: "https://fluent2.microsoft.design/design-tokens", link: "fluent2.microsoft.design" },
  { n: 10, name: "Pajamas", company: "GitLab", term: "“Contextual design tokens”", dark: "Yes", href: "https://design.gitlab.com/product-foundations/design-tokens/", link: "design.gitlab.com" },
  { n: 11, name: "Chakra UI v3", company: "Open source", term: "“Component CSS variables” via slot recipes", dark: "Yes", href: "https://chakra-ui.com/docs/theming/slot-recipes", link: "chakra-ui.com" },
];

const COMPARISON: { capability: string; cells: string[] }[] = [
  { capability: "Component token layer", cells: ["Yes", "Yes", "Yes", "Yes", "Yes"] },
  { capability: "Named states (hover/active/disabled/focused)", cells: ["All 5", "All 5", "All 5", "Partial", "All 5"] },
  { capability: "Size scale", cells: ["8 scales (3xs–2xl)", "5 scales", "3 scales (sm/md/lg)", "3 sizes", "2 sizes"] },
  { capability: "Dark mode via token chain", cells: ["Yes", "Yes", "Yes", "Yes (4 themes)", "Yes (4 themes)"] },
  { capability: "Mobile-specific component tokens", cells: ["Yes (27 components)", "Yes (Android)", "No (web only)", "No (web only)", "Partial"] },
  { capability: "Web component tokens", cells: ["Yes (38 components)", "Yes", "Yes", "Yes", "Yes"] },
  { capability: "Figma Variable sync", cells: ["Yes (custom plugin)", "Yes (community)", "Partial", "Partial", "Partial"] },
  { capability: "Open source / documented", cells: ["Internal", "Open source", "Open source", "Open source", "Open source"] },
  { capability: "Token count (button)", cells: ["80+ tokens", "~40 tokens", "27 tokens", "~10 tokens", "~20 tokens"] },
];

const GLOSSARY: { term: string; def: React.ReactNode }[] = [
  { term: "Design token", def: "A named variable that stores a visual design decision (color, size, spacing, typography). The single source of truth between design and code." },
  { term: "Primitive token", def: <>The lowest layer. Stores raw values: <TokenPath>color.primary.blue.600 = #155EEF</TokenPath>. Never referenced directly in components.</> },
  { term: "Semantic token", def: <>The middle layer. Names the intent: <TokenPath>color.background.primary.default</TokenPath>. References a primitive. Changes value when theme changes.</> },
  { term: "Component token", def: <>The top layer. Scopes the intent to a specific component and state: <TokenPath>button.color.primary.primary.background.hover</TokenPath>. References a semantic token.</> },
  { term: "Alias", def: "A token that references another token instead of a raw value. All semantic and component tokens are aliases." },
  { term: "CSS custom property", def: <>A browser-native variable, written as <TokenPath>--variable-name: value</TokenPath>. The most common output format for design tokens on the web.</> },
  { term: "Style Dictionary", def: "An open-source tool by Amazon that transforms design token JSON files into platform-specific outputs (CSS, SCSS, iOS, Android, JavaScript)." },
  { term: "Tokens Studio", def: "A Figma plugin that syncs design token JSON files with Figma's variable and style system." },
  { term: "Token pipeline", def: "The automated process that takes token source files (JSON), transforms them via Style Dictionary, and outputs platform-specific variables for developers to use." },
  { term: "Dark mode", def: "A UI theme where backgrounds are dark and text is light. With component tokens, dark mode requires no component-level CSS changes — only semantic token values change." },
  { term: "White-labeling", def: "Providing the same product with a different brand identity to a different customer. Enabled by changing component and semantic token values without changing code." },
  { term: "DTCG", def: "Design Tokens Community Group — the W3C working group that published the first stable design token specification in October 2025." },
];

const PRIMARY_SOURCES = [
  { system: "Material Design 3 (Google)", href: "https://m3.material.io/foundations/design-tokens/overview", label: "m3.material.io/foundations/design-tokens/overview" },
  { system: "Material Web (source)", href: "https://github.com/material-components/material-web/tree/main/tokens", label: "github.com/material-components/material-web/tree/main/tokens" },
  { system: "Ant Design 5 (Alibaba)", href: "https://ant.design/docs/react/customize-theme/", label: "ant.design/docs/react/customize-theme" },
  { system: "Carbon v11 (IBM)", href: "https://carbondesignsystem.com/elements/color/tokens/", label: "carbondesignsystem.com/elements/color/tokens" },
  { system: "Salesforce SLDS Styling Hooks", href: "https://v1.lightningdesignsystem.com/components/buttons/", label: "v1.lightningdesignsystem.com/components/buttons" },
  { system: "Adobe Spectrum CSS", href: "https://github.com/adobe/spectrum-css", label: "github.com/adobe/spectrum-css" },
  { system: "Spectrum CSS token migration", href: "https://github.com/adobe/spectrum-css/wiki/Migrating-a-component-to-Spectrum-Tokens", label: "github.com/adobe/spectrum-css/wiki" },
  { system: "GitHub Primer", href: "https://primer.style/product/getting-started/foundations/color-usage/", label: "primer.style/product/getting-started/foundations/color-usage" },
  { system: "Primer design tokens guide", href: "https://github.com/primer/primitives/blob/main/DESIGN_TOKENS_GUIDE.md", label: "github.com/primer/primitives — DESIGN_TOKENS_GUIDE.md" },
  { system: "SAP Fiori tokens", href: "https://www.sap.com/design-system/fiori-design-web/v1-136/foundations/visual/design-tokens", label: "sap.com — design tokens" },
  { system: "SAP theming-base-content", href: "https://github.com/SAP/theming-base-content", label: "github.com/SAP/theming-base-content" },
  { system: "Fluent UI v9 (Microsoft)", href: "https://fluent2.microsoft.design/design-tokens", label: "fluent2.microsoft.design/design-tokens" },
  { system: "GitLab Pajamas", href: "https://design.gitlab.com/product-foundations/design-tokens/", label: "design.gitlab.com/product-foundations/design-tokens" },
  { system: "Mantine CSS variables", href: "https://mantine.dev/styles/css-variables-list/", label: "mantine.dev/styles/css-variables-list" },
  { system: "Chakra UI v3 slot recipes", href: "https://chakra-ui.com/docs/theming/slot-recipes", label: "chakra-ui.com/docs/theming/slot-recipes" },
];

const TOC = [
  { id: "executive-summary", label: "Summary" },
  { id: "primer", label: "Primer" },
  { id: "with-vs-without", label: "With vs. without" },
  { id: "industry-landscape", label: "Industry" },
  { id: "full-case", label: "The full case" },
  { id: "objection", label: "The objection" },
  { id: "highrise-in-context", label: "HighRise compared" },
  { id: "cost-of-not", label: "Cost of not" },
  { id: "glossary", label: "Glossary" },
  { id: "references", label: "References" },
];

export default function ComponentTokenResearch() {
  return (
    <PageTransition>
      <article className="doc">
        <Breadcrumbs
          items={[
            { label: "Foundations", href: "/foundations/tokens-overview" },
            { label: "Component token research" },
          ]}
        />
        <h1>Component-level design tokens: industry research</h1>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Badge tone="primary">Research report</Badge>
          <Badge>11 systems surveyed</Badge>
          <Badge>May 2026</Badge>
        </div>
        <p>
          Industry validation and rationale for implementing component-level tokens in the HighRise design system.
          Prepared for the HighLevel frontend team and leadership. For the reference documentation of the layer itself,
          see <Link href="/foundations/component-tokens">Component tokens</Link>.
        </p>

        <ReportStats />
        <WhySummary variant="top" />

        <div className="mt-6">
          <Toc items={TOC} />
        </div>

        {/* ------------------------------------------------------------ */}
        <h2 id="executive-summary">1. Executive summary</h2>
        <Callout tone="info" title="Bottom line">
          <p>
            Component-level tokens are not an over-engineering choice. They are the industry standard for any design
            system that needs to support multiple themes, dark mode, white-labeling, or multi-platform delivery — all
            of which HighLevel requires.
          </p>
        </Callout>
        <p>
          Every major design system operated at scale by Google, Microsoft, IBM, Adobe, Salesforce, GitHub, SAP,
          Alibaba, and GitLab has converged on exactly the same architectural decision: a three-layer token hierarchy
          that ends in component-specific tokens. The W3C Design Tokens Community Group released their first stable
          specification in October 2025, and it explicitly supports component-level token structures.
        </p>
        <p>
          This report surveyed <strong>11 publicly documented design systems</strong> that implement component-level
          tokens. Every system that supports dark mode, multi-brand theming, or third-party customization has found
          that two layers of tokens are not enough — and has added a third.
        </p>
        <p>
          HighRise&apos;s component token system covers <strong>65 components</strong> (38 web, 27 mobile) with full
          dark/light mode support, 8 size scales, and state coverage across default, hover, active, focused, and
          disabled interactions. This puts HighRise at or ahead of every industry peer reviewed in this report.
        </p>
        <p>
          The upfront implementation cost of component tokens is real. So is the long-term cost of not having them:
          every theme request, every dark mode bug, every white-label inquiry, and every &quot;can we change just this
          one button?&quot; becomes a manual, error-prone code change instead of a token swap.
        </p>
        <p>
          <strong>
            Component tokens are not a nice-to-have. They are the foundation of a themeable, maintainable, scalable UI
            system.
          </strong>
        </p>

        {/* ------------------------------------------------------------ */}
        <h2 id="primer">2. The token hierarchy: a quick primer</h2>
        <p>Design tokens exist in three layers. Each layer references the one above it. The chain is:</p>
        <Reveal className="mt-4">
          <TokenPyramid />
        </Reveal>
        <table>
          <thead>
            <tr>
              <th>Layer</th>
              <th>Name</th>
              <th>Purpose</th>
              <th>HighRise example</th>
              <th>Resolved value</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Layer 1</strong></td>
              <td>Primitive token</td>
              <td>Stores the actual value. Never used directly in components.</td>
              <td><TokenPath>color.primary.blue.600</TokenPath></td>
              <td><TokenPath>#155EEF</TokenPath></td>
            </tr>
            <tr>
              <td><strong>Layer 2</strong></td>
              <td>Semantic token</td>
              <td>Names the intent. Used for general UI patterns. Switches between light/dark.</td>
              <td><TokenPath>color.background.primary.default</TokenPath></td>
              <td>→ <TokenPath>{`{color.primary.blue.600}`}</TokenPath></td>
            </tr>
            <tr>
              <td><strong>Layer 3</strong></td>
              <td>Component token</td>
              <td>Scopes the intent to a specific component, variant, and state.</td>
              <td><TokenPath>button.color.primary.primary.background.hover</TokenPath></td>
              <td>→ <TokenPath>{`{color.background.primary.intense.1}`}</TokenPath></td>
            </tr>
          </tbody>
        </table>

        <h3>Why three layers and not two?</h3>
        <p>
          Semantic tokens solve the &quot;what does blue mean?&quot; problem — they replace{" "}
          <TokenPath>#155EEF</TokenPath> with <TokenPath>color.background.primary.default</TokenPath>. But semantic
          tokens are still global. They describe intent across the entire UI. They don&apos;t describe what a{" "}
          <em>button&apos;s</em> background should be on hover vs. what a <em>tooltip&apos;s</em> background should be
          on hover. Those two things can look the same today and diverge tomorrow. Component tokens give each component
          its own named contract.
        </p>
        <p>Think of it this way:</p>
        <ul>
          <li><strong>Primitive tokens</strong> = the paint colors in the hardware store</li>
          <li><strong>Semantic tokens</strong> = the color palette on your wall chart (&quot;warm beige for living rooms&quot;)</li>
          <li><strong>Component tokens</strong> = the paint label on the actual wall (&quot;left wall: warm beige, trim: semi-gloss white&quot;)</li>
        </ul>
        <p>You can repaint any wall without touching the others. That&apos;s the point.</p>

        {/* ------------------------------------------------------------ */}
        <h2 id="with-vs-without">3. With vs. without: the two architectures side by side</h2>
        <p>
          Before the industry survey, it helps to see concretely how the same design system behaves with and without
          the third layer. Both architectures are real and workable — they just make very different things easy.
        </p>

        <h3>How each system works</h3>
        <p>
          With only semantic tokens, component CSS consumes global semantics directly. With component tokens, a named
          per-component contract sits in between — everything below it stays exactly the same.
        </p>
        <TwoArchitectures />

        <h3>One design request, two outcomes</h3>
        <p>
          The failure mode of a two-layer system is not that it looks wrong — it&apos;s that perfectly reasonable
          requests have no safe home. Try the most common one:
        </p>
        <RippleDemo />

        <h3>What&apos;s easy where</h3>
        <p>
          An honest task-by-task comparison. Note the last three rows — semantic-only systems do have real advantages,
          and they are exactly the advantages that matter least at HighLevel&apos;s scale:
        </p>
        <EaseMatrix />

        <h3>Who actually touches component tokens?</h3>
        <p>Almost nobody — and that is by design. The layer exists so that one team has control, not so that everyone has homework:</p>
        <WhoTouchesWhat />
        <Callout tone="success" title="What this means for designers">
          <p>
            Designers using design system components simply <strong>use the component</strong> — they never touch (or
            even see) component-level tokens. Anything they create from scratch still uses{" "}
            <Link href="/foundations/semantic-tokens">semantic tokens</Link>, so they keep full freedom to change
            whatever their design needs. But when a component itself has to change, the design system team changes it
            at the component-token level — with complete control over exactly what can change and what can&apos;t,
            everywhere at once.
          </p>
        </Callout>

        {/* ------------------------------------------------------------ */}
        <h2 id="industry-landscape">4. The industry landscape: who uses component tokens?</h2>
        <h3>4.1 Summary table</h3>
        <p>
          The following 11 design systems have been confirmed to implement Layer 3 component tokens, with live
          documentation or open-source code verifiable as of May 2026:
        </p>
        <Reveal>
          <table>
            <thead>
              <tr>
                <th className="w-8">#</th>
                <th>Design system</th>
                <th>Company</th>
                <th>What they call them</th>
                <th>Dark mode</th>
                <th>Link</th>
              </tr>
            </thead>
            <tbody>
              {SYSTEMS.map((s) => (
                <tr key={s.n}>
                  <td>{s.n}</td>
                  <td><strong>{s.name}</strong></td>
                  <td>{s.company}</td>
                  <td>{s.term}</td>
                  <td>{s.dark}</td>
                  <td>
                    <Ext href={s.href}>{s.link}</Ext>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Reveal>
        <p>
          <strong>Every single one</strong> of these systems also supports dark mode. That is not a coincidence — it is
          causal. Component-level tokens are what make dark mode (and any other theme) architecturally clean.
        </p>

        <h3>4.2 Deep-dive spotlights</h3>

        <h4 className="mt-6 text-body font-semibold text-gray-900 dark:text-gray-100">Google — Material Design 3</h4>
        <p>
          Material Design 3 is the most exhaustively documented example of component tokens in the industry. Google
          uses an explicit three-tier naming system:
        </p>
        <table>
          <thead>
            <tr>
              <th>Tier</th>
              <th>Prefix</th>
              <th>Example</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Reference (primitive)</td>
              <td><TokenPath>md.ref.palette.*</TokenPath></td>
              <td><TokenPath>md.ref.palette.primary40</TokenPath> = raw color</td>
            </tr>
            <tr>
              <td>System (semantic)</td>
              <td><TokenPath>md.sys.color.*</TokenPath></td>
              <td><TokenPath>md.sys.color.primary</TokenPath></td>
            </tr>
            <tr>
              <td>Component</td>
              <td><TokenPath>md.comp.[component].*</TokenPath></td>
              <td><TokenPath>md.comp.filled-button.container-color</TokenPath></td>
            </tr>
          </tbody>
        </table>
        <p>Every Material Web component ships with its own token file. The filled button alone defines tokens for:</p>
        <CodeBlock>{`--md-filled-button-container-color         → background color
--md-filled-button-label-text-color        → text color
--md-filled-button-container-shape         → border radius
--md-filled-button-hover-container-elevation
--md-filled-button-pressed-state-layer-color
--md-filled-button-disabled-container-opacity
--md-filled-button-leading-space
--md-filled-button-trailing-space
--md-filled-button-icon-size`}</CodeBlock>
        <p>
          Source:{" "}
          <Ext href="https://github.com/material-components/material-web/tree/main/tokens">
            material-components/material-web on GitHub
          </Ext>
        </p>
        <Callout tone="info">
          <p>
            Google uses this architecture across every product that runs Material — Android, Chrome, Google Workspace,
            Google Maps. The scale of adoption is not incidental. It is proof that the architecture works at the
            highest possible volume.
          </p>
        </Callout>

        <h4 className="mt-6 text-body font-semibold text-gray-900 dark:text-gray-100">Alibaba — Ant Design 5</h4>
        <p>
          Ant Design v5, released in late 2022 and now powering hundreds of enterprise products across Alibaba&apos;s
          portfolio, made &quot;Component Token&quot; a first-class, named feature. Their documentation explicitly
          labels it as the third tier of their design token system.
        </p>
        <p>
          The Button component alone exposes <strong>27 component tokens</strong>:
        </p>
        <CodeBlock>{`// Usage via ConfigProvider — no CSS overrides needed
<ConfigProvider
  theme={{
    components: {
      Button: {
        defaultBg: '#f0f0f0',
        defaultHoverBg: '#e0e0e0',
        primaryColor: '#ffffff',
        fontWeight: 500,
        paddingInline: 16,
        onlyIconSize: 16,
      }
    }
  }}
>
  <Button type="primary">Save</Button>
</ConfigProvider>`}</CodeBlock>
        <p>
          Notable: Ant Design&apos;s component tokens can also accept an <TokenPath>algorithm</TokenPath> property that
          derives scaled variants programmatically — so a single component token can generate an entire state spectrum.
        </p>
        <p>
          Source: <Ext href="https://ant.design/docs/react/customize-theme/">ant.design/docs/react/customize-theme</Ext>
        </p>

        <h4 className="mt-6 text-body font-semibold text-gray-900 dark:text-gray-100">SAP — Fiori / theming-base-content</h4>
        <p>
          SAP&apos;s design system is arguably the most extensive real-world deployment of component tokens. SAP serves
          thousands of enterprise customers who each require custom branding. Without component tokens, that
          customization is impossible to manage at scale.
        </p>
        <p>
          The Button component in SAP Fiori defines tokens for every semantic variant, every interaction state, and
          every border property:
        </p>
        <CodeBlock>{`sapButton_Background
sapButton_BorderColor
sapButton_BorderWidth
sapButton_BorderCornerRadius
sapButton_TextColor
sapButton_Hover_Background
sapButton_Hover_TextColor
sapButton_Hover_BorderColor
sapButton_Active_Background
sapButton_Active_TextColor
sapButton_Active_BorderColor
sapButton_Emphasized_Background
sapButton_Emphasized_Hover_Background
sapButton_Emphasized_TextColor
sapButton_Reject_Background
sapButton_Accept_Background`}</CodeBlock>
        <p>
          SAP&apos;s system supports four themes simultaneously — Morning Horizon, Evening Horizon, High Contrast
          Black, and High Contrast White — each with different component token values. Component tokens are the only
          reason this is maintainable.
        </p>
        <p>
          Source: <Ext href="https://github.com/SAP/theming-base-content">github.com/SAP/theming-base-content</Ext>
        </p>

        <h4 className="mt-6 text-body font-semibold text-gray-900 dark:text-gray-100">Adobe — Spectrum CSS</h4>
        <p>
          Adobe&apos;s system introduces a concept that HighRise would benefit from explicitly naming: the{" "}
          <strong>mod token</strong> layer. In addition to internal component tokens (
          <TokenPath>--spectrum-actionbutton-border-color-default</TokenPath>), Spectrum CSS exposes a public API of{" "}
          <TokenPath>--mod-*</TokenPath> tokens that consumers can override without touching internals:
        </p>
        <CodeBlock>{`/* Internal component token — owned by the design system */
--spectrum-actionbutton-border-color-default: var(--spectrum-gray-300);

/* Mod token — the public override API */
--mod-actionbutton-border-color: var(--spectrum-actionbutton-border-color-default);`}</CodeBlock>
        <p>
          A consumer app that wants to change button border color only needs to override{" "}
          <TokenPath>--mod-actionbutton-border-color</TokenPath>. They never touch the internal token. This pattern is
          powerful because it separates the design system&apos;s internal implementation from the customization API.
        </p>
        <p>
          Source:{" "}
          <Ext href="https://github.com/adobe/spectrum-css/wiki/Migrating-a-component-to-Spectrum-Tokens">
            Spectrum CSS wiki — migrating a component to Spectrum tokens
          </Ext>
        </p>

        <h3>4.3 The W3C specification</h3>
        <p>
          The W3C Design Tokens Community Group (DTCG) published the{" "}
          <strong>first stable version of the Design Token Specification</strong> in October 2025. The specification
          explicitly supports:
        </p>
        <ul>
          <li>Named token groups (component-scoped namespaces)</li>
          <li>Alias tokens (references from component tokens to semantic tokens)</li>
          <li>The <TokenPath>$extends</TokenPath> property for component-level token inheritance</li>
        </ul>
        <p>
          Tools including Figma, Penpot, Sketch, Framer, Supernova, Zeroheight, and Style Dictionary are all
          implementing this specification.
        </p>
        <Callout tone="success">
          <p>
            The W3C spec arriving at stable status in 2025 signals that component-level tokens are not a cutting-edge
            experiment — they are the established, standardized foundation of modern design systems.
          </p>
        </Callout>
        <p>
          Source: <Ext href="https://www.designtokens.org/">W3C DTCG community</Ext>
        </p>

        {/* ------------------------------------------------------------ */}
        <h2 id="full-case">5. Why component tokens? The full case</h2>

        <h3>5.1 Why they are required</h3>
        <p>
          <strong>The fundamental problem semantic tokens cannot solve:</strong> semantic tokens are global.{" "}
          <TokenPath>color.background.primary.default</TokenPath> means &quot;the default background for primary UI
          elements.&quot; That definition applies everywhere. But components have unique visual behavior that
          doesn&apos;t always align with a global semantic rule.
        </p>
        <p>Consider hover state:</p>
        <ul>
          <li>A <strong>button</strong> on hover darkens its fill slightly</li>
          <li>A <strong>tooltip</strong> on hover may not change at all (it&apos;s already visible)</li>
          <li>An <strong>input field</strong> on hover shows a darker border, not a different fill</li>
          <li>A <strong>nav item</strong> on hover shows a subtle fill change</li>
        </ul>
        <p>
          All of these can use the same semantic hover token today. But the moment your design team decides that button
          hover should be 10% darker than nav hover — a totally valid, common design decision — you have no token to
          express that. Without component tokens, you either:
        </p>
        <ol>
          <li>Add a new semantic token (which is now component-specific in everything but name), or</li>
          <li>Write hard-coded CSS for one component (which breaks your token pipeline)</li>
        </ol>
        <p>Both are the same problem: you needed component tokens and didn&apos;t have them.</p>
        <p><strong>Component tokens are required when:</strong></p>
        <ul>
          <li>The design system needs to support dark mode cleanly</li>
          <li>Different products or teams need to customize individual component appearances</li>
          <li>Components share the same semantic intent but need different visual expressions</li>
          <li>Mobile and web versions of the same component need different sizing or spacing</li>
          <li>The system needs to support white-labeling or multi-brand theming</li>
        </ul>
        <p>
          All of these are HighLevel requirements. All of them become token operations — not code changes — when
          component tokens exist.
        </p>

        <h3>5.2 What they are used for</h3>
        <p>Component tokens serve six primary functions:</p>
        <p>
          <strong>1. State management</strong> — each interactive state (default, hover, active, focused, disabled)
          gets its own token. This makes state-specific styling explicit, testable, and changeable without side
          effects.
        </p>
        <StateSpectrum />
        <CodeBlock>{`button.color.primary.primary.background.default  → #0050C8
button.color.primary.primary.background.hover    → #0042A8
button.color.primary.primary.background.active   → #003389
button.color.primary.primary.background.disabled → #C9D8F8`}</CodeBlock>
        <p>
          <strong>2. Variant isolation</strong> — different visual variants of the same component (primary, secondary,
          tertiary, ghost, error, warning) get separate tokens even when they share semantic intent. Changing one
          variant&apos;s hover color doesn&apos;t affect any other.
        </p>
        <p>
          <strong>3. Size scaling</strong> — component tokens encode sizing contracts per size scale (3xs through 2xl
          in HighRise). Every height, padding, gap, and icon size is a named token — not a hard-coded pixel value.
        </p>
        <CodeBlock>{`button.regular.height.3xs  → 24px
button.regular.height.sm   → 36px  (the team's default)
button.regular.height.xl   → 48px`}</CodeBlock>
        <p>
          <strong>4. Theme switching</strong> — because component tokens reference semantic tokens, and semantic tokens
          have light and dark mode variants, flipping a theme requires changing nothing in the component token layer.
          The chain resolves automatically.
        </p>
        <p>
          <strong>5. Cross-platform parity</strong> — HighRise maintains both{" "}
          <TokenPath>web-components/button.json</TokenPath> and <TokenPath>mobile-components/button.json</TokenPath>.
          Mobile and web can have different padding, sizing, and touch targets while using the same semantic color and
          typography tokens. Consistency where it matters; flexibility where platforms differ.
        </p>
        <p>
          <strong>6. White-labeling and multi-brand</strong> — enterprise customers at HighLevel may need custom
          branded versions of the product. Component tokens make that possible without forking code — only token
          values change.
        </p>

        <h3>5.3 How they are implemented</h3>
        <p>Component tokens work by chaining references:</p>
        <CodeBlock>{`Component token → Semantic token → Primitive token → Resolved value`}</CodeBlock>
        <p>In HighRise&apos;s JSON files, this looks like:</p>
        <CodeBlock>{`// tokens/web-components/button.json
{
  "button": {
    "color": {
      "primary": {
        "primary": {
          "background": {
            "hover": {
              "value": "{color.background.primary.intense.1}",
              "type": "color"
            }
          }
        }
      }
    }
  }
}`}</CodeBlock>
        <CodeBlock>{`// tokens/Semantics/Light.json
{
  "color": {
    "background": {
      "primary": {
        "intense": {
          "1": {
            "value": "{color.primary.blue.700}",
            "type": "color"
          }
        }
      }
    }
  }
}`}</CodeBlock>
        <CodeBlock>{`// tokens/Primitive.json
{
  "color": {
    "primary": {
      "blue": {
        "700": {
          "value": "#0042A8",
          "type": "color"
        }
      }
    }
  }
}`}</CodeBlock>
        <p>
          When dark mode is active, <TokenPath>Light.json</TokenPath> is swapped for <TokenPath>Dark.json</TokenPath> —
          which maps <TokenPath>color.background.primary.intense.1</TokenPath> to a different primitive. The component
          token (<TokenPath>button.color.primary.primary.background.hover</TokenPath>) does not change at all. It just
          resolves to a different final value.
        </p>
        <h4 className="mt-6 text-body font-semibold text-gray-900 dark:text-gray-100">Tooling</h4>
        <p>
          No developer writes component token names manually during day-to-day work. The token pipeline handles this:
        </p>
        <table>
          <thead>
            <tr>
              <th>Tool</th>
              <th>Role</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Style Dictionary</strong></td>
              <td>Transforms JSON token files into CSS custom properties, SCSS variables, iOS Swift, Android XML, or JavaScript constants</td>
            </tr>
            <tr>
              <td><strong>Tokens Studio / Figma Variables</strong></td>
              <td>Syncs tokens from JSON into Figma&apos;s native variable system</td>
            </tr>
            <tr>
              <td><strong>Figma plugin (HighRise&apos;s custom)</strong></td>
              <td>Applies component tokens to Figma components via the API</td>
            </tr>
            <tr>
              <td><strong>VS Code / IDE</strong></td>
              <td>Autocompletes token names from the generated output</td>
            </tr>
          </tbody>
        </table>
        <p>The output of a component token file is a flat list of CSS custom properties:</p>
        <CodeBlock>{`:root {
  --button-primary-background-default: #0050C8;
  --button-primary-background-hover: #0042A8;
  --button-primary-background-active: #003389;
  --button-primary-background-disabled: #C9D8F8;
  --button-regular-height-sm: 36px;
  --button-regular-padding-x-sm: 12px;
}`}</CodeBlock>
        <p>
          A component&apos;s CSS file references these variables. The CSS file itself never changes when themes switch —
          only the variable values do.
        </p>
        <CodeBlock>{`.btn-primary {
  background: var(--button-primary-background-default);
  height: var(--button-regular-height-sm);
  padding: 0 var(--button-regular-padding-x-sm);
}
.btn-primary:hover {
  background: var(--button-primary-background-hover);
}`}</CodeBlock>

        <h3>5.4 Advantages</h3>
        <p><strong>For developers:</strong></p>
        <ul>
          <li>One token name per visual property. No guessing which semantic token to use in which component context.</li>
          <li>Changing a component&apos;s appearance in any theme is a data change (token value), not a code change.</li>
          <li>Fewer <TokenPath>!important</TokenPath> overrides. Fewer specificity battles. Fewer &quot;why did my change break something else?&quot; bugs.</li>
          <li>Dark mode works automatically — zero per-component dark mode CSS to write.</li>
        </ul>
        <p><strong>For designers:</strong></p>
        <ul>
          <li>Every token in Figma has a direct 1:1 counterpart in code. What designers set in Figma Variables is what developers implement.</li>
          <li>Design intent is preserved across handoff. If a designer sets <TokenPath>button.color.error.primary.background.hover</TokenPath> in Figma, the developer can look up exactly that token.</li>
          <li>Theme previews in Figma (light/dark/compact) reflect real implementation behavior.</li>
        </ul>
        <p><strong>For product managers and business:</strong></p>
        <ul>
          <li>White-labeling becomes a configuration exercise, not a development project.</li>
          <li>Adding a new theme (e.g., &quot;compact mode,&quot; &quot;high-contrast mode&quot;) requires defining token values, not rewriting component CSS.</li>
          <li>Consistent appearance across web, iOS, and Android is enforced by the token layer, not by manually synchronized spreadsheets.</li>
        </ul>
        <p><strong>For QA:</strong></p>
        <ul>
          <li>Token values are auditable. &quot;Is the button hover color correct in dark mode?&quot; becomes: &quot;Does <TokenPath>button.color.primary.primary.background.hover</TokenPath> resolve to the right value in the Dark semantic set?&quot; — a single lookup.</li>
          <li>Visual regressions are detectable at the token diff level before deployment.</li>
        </ul>
        <p><strong>For scale:</strong></p>
        <ul>
          <li>A design system that serves one product can get away with semantic tokens. A design system that serves 10 products, 3 platforms, 2 themes, and enterprise customization cannot. HighLevel is in the second category.</li>
        </ul>

        <h3>5.5 Pros and cons</h3>
        <p>This is an honest assessment. Component tokens have real costs.</p>
        <table>
          <thead>
            <tr>
              <th />
              <th>Pro</th>
              <th>Con</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Control</strong></td>
              <td>Pixel-precise control over every visual property of every component in every state</td>
              <td>Large surface area to define and maintain upfront</td>
            </tr>
            <tr>
              <td><strong>Theming</strong></td>
              <td>Theme switching (light/dark/compact/brand) is automatic once tokens are wired</td>
              <td>Token naming must be agreed upon and stable — renames require migrations</td>
            </tr>
            <tr>
              <td><strong>Customization</strong></td>
              <td>Any team can override any component&apos;s appearance without touching shared CSS</td>
              <td>Inconsistent overrides by downstream teams can fragment the design language</td>
            </tr>
            <tr>
              <td><strong>Handoff</strong></td>
              <td>Figma-to-code mapping is 1:1 and unambiguous</td>
              <td>Requires design and engineering to agree on token structure before implementation</td>
            </tr>
            <tr>
              <td><strong>Dark mode</strong></td>
              <td>Dark mode is free — no component-level dark mode CSS</td>
              <td>Semantic token layer must be designed correctly for this to work</td>
            </tr>
            <tr>
              <td><strong>Tooling</strong></td>
              <td>Tooling (Style Dictionary, Tokens Studio) handles the heavy lifting</td>
              <td>Teams must invest in the pipeline setup, CI integration, and documentation</td>
            </tr>
            <tr>
              <td><strong>Debugging</strong></td>
              <td>&quot;Which token controls this?&quot; is always answerable</td>
              <td>Token chains can be 3–6 levels deep — tracing a value requires tooling support</td>
            </tr>
            <tr>
              <td><strong>Mobile/web parity</strong></td>
              <td>Separate files allow platform-appropriate sizing while sharing semantic values</td>
              <td>Double the component token files to maintain (web + mobile)</td>
            </tr>
          </tbody>
        </table>
        <Callout tone="info" title="Net verdict">
          <p>
            The cons are front-loaded (upfront investment) and the pros compound over time. The longer a product runs
            without component tokens, the more expensive adding them later becomes — because existing components have
            baked-in assumptions that tokens would have made explicit.
          </p>
        </Callout>

        <h3>5.6 Customization depth</h3>
        <p>Here is a concrete map of what HighRise&apos;s component token system enables at each level:</p>
        <table>
          <thead>
            <tr>
              <th>Customization level</th>
              <th>What it controls</th>
              <th>Token example</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Per-component</strong></td>
              <td>How any one component looks, independent of all others</td>
              <td><TokenPath>button.*</TokenPath> vs. <TokenPath>input.*</TokenPath> — completely separate</td>
            </tr>
            <tr>
              <td><strong>Per-variant</strong></td>
              <td>How one visual variant (primary, secondary, ghost) of a component looks</td>
              <td><TokenPath>button.color.primary.*</TokenPath> vs. <TokenPath>button.color.error.*</TokenPath></td>
            </tr>
            <tr>
              <td><strong>Per-state</strong></td>
              <td>How a component looks in each interaction state</td>
              <td><TokenPath>…background.hover</TokenPath> vs. <TokenPath>.active</TokenPath> vs. <TokenPath>.disabled</TokenPath></td>
            </tr>
            <tr>
              <td><strong>Per-property</strong></td>
              <td>Background, border, text, icon — each individually addressable</td>
              <td><TokenPath>…background.*</TokenPath> vs. <TokenPath>.text.*</TokenPath> vs. <TokenPath>.border.*</TokenPath></td>
            </tr>
            <tr>
              <td><strong>Per-size</strong></td>
              <td>8 distinct size scales from 3xs (24px) to 2xl (56px)</td>
              <td><TokenPath>button.regular.height.sm</TokenPath> → 36px</td>
            </tr>
            <tr>
              <td><strong>Per-platform</strong></td>
              <td>Web and mobile maintain separate component token files with platform-appropriate values</td>
              <td><TokenPath>web-components/button.json</TokenPath> vs. <TokenPath>mobile-components/button.json</TokenPath></td>
            </tr>
            <tr>
              <td><strong>Per-theme</strong></td>
              <td>Light/dark/high-contrast — automatic through the semantic chain</td>
              <td>Dark semantic file remaps without touching component tokens</td>
            </tr>
          </tbody>
        </table>
        <p>
          This means a developer building a custom theme for an enterprise HighLevel client could, if needed, change
          only the button&apos;s disabled background color in dark mode on mobile, affecting nothing else — by
          overriding a single token value.
        </p>
        <p>That is the power of the full three-layer architecture.</p>

        {/* ------------------------------------------------------------ */}
        <h2 id="objection">6. Addressing the objection: &quot;they&apos;re too deep&quot;</h2>
        <p>
          The frontend team&apos;s concern is understandable and worth addressing directly. Here is the honest
          response:
        </p>

        <h3>&quot;The token names are too long&quot;</h3>
        <p>
          <strong>True.</strong> <TokenPath>button.color.primary.primary.background.hover</TokenPath> is 6 levels deep.
          But consider what it replaces: a hard-coded <TokenPath>#0042A8</TokenPath> buried in a component SCSS file,
          or a semantic token <TokenPath>color.background.primary.intense.1</TokenPath> used directly in component CSS
          — which creates a rigid dependency between the semantic layer and the component&apos;s visual behavior.
        </p>
        <p>
          The long name is the precision. And importantly:{" "}
          <strong>developers don&apos;t type token names directly in most modern workflows.</strong>
        </p>
        <ul>
          <li>In Figma, they&apos;re variables you click.</li>
          <li>In VS Code, they&apos;re autocompleted from the generated CSS custom properties.</li>
          <li>In component CSS, the variable is short: <TokenPath>var(--button-primary-background-hover)</TokenPath>.</li>
        </ul>
        <p>The JSON token file is the source of truth. The generated output is what developers use.</p>

        <h3>&quot;It takes too long to implement&quot;</h3>
        <p>
          <strong>True for the first component.</strong> Not true thereafter — patterns become clear, tooling
          accelerates the work, and Figma Variables sync handles the design side. The 11 design systems in this report
          all paid this upfront cost. None of them are reversing course.
        </p>
        <p>
          A more useful question: how long does it take to <em>not</em> implement component tokens and then need to add
          dark mode across 65 components later? The answer is: much longer.
        </p>

        <h3>&quot;Is this level of control actually necessary?&quot;</h3>
        <p>
          <strong>It depends on what HighLevel is building.</strong> If the answer to any of these questions is yes,
          then component tokens are necessary:
        </p>
        <ul>
          <li>Will HighLevel ever support dark mode? <em>(Yes)</em></li>
          <li>Will any component ever need different styling in different contexts? <em>(Yes)</em></li>
          <li>Will any enterprise customer ever request custom branding? <em>(Likely)</em></li>
          <li>Will the product ever run on iOS or Android with platform-consistent UI? <em>(Yes, mobile tokens already exist)</em></li>
          <li>Will the design system need to be maintained by multiple teams? <em>(Yes)</em></li>
        </ul>
        <p>
          The systems that went deepest into component tokens — SAP, Salesforce, Google, Microsoft — did so because
          they serve customers who need customization as a product feature. HighLevel, as a platform serving agencies
          and businesses, is in exactly this position.
        </p>

        <h3>&quot;Other companies don&apos;t do this&quot;</h3>
        <p>
          As the research in Section 4 demonstrates: they do. Google, Microsoft, IBM, Adobe, Salesforce, GitHub, SAP,
          Alibaba, GitLab all do. The companies that <em>don&apos;t</em> — Atlassian, Shopify, Radix — have either
          acknowledged the gap (Shopify&apos;s public GitHub discussion on component tokens, now archived) or operate
          in a narrower product context.
        </p>

        <h3>&quot;Why not drop component tokens entirely?&quot;</h3>
        <p>
          A stronger version of the objection proposes removing the layer altogether: keep ~200 Foundations semantics,
          delete the ~2,800 component variables, and let designers work directly against semantics. The claimed
          benefits are real observations about Figma ergonomics — and every one of them is either fully preserved by
          component tokens or is a tooling and organization problem, not an architecture problem. Point by point:
        </p>
        <DropLayerRebuttal />
        <Callout tone="warning" title="About “the single downside”">
          <p>
            The proposal concedes exactly one loss: <em>you can&apos;t override the style of one component in
            isolation</em>, and suggests handling that rare case by adding a new semantic token or hardcoding the
            value. Those two workarounds are precisely the failure modes described in section 5.1 — a
            &quot;semantic&quot; token that is component-scoped in everything but name, or a raw value that breaks the
            token pipeline. And the case is not rare: it is every dark-mode remap that touches one component, every
            elevation exception, every white-label request, and every &quot;make just this button darker.&quot;
            Section 8 puts a number on it — roughly 1,300 hand-written CSS rules for dark mode alone. The layer&apos;s
            entire purpose is to make the &quot;rare case&quot; a one-line token edit instead of a standing argument
            about where the hack should live.
          </p>
        </Callout>

        {/* ------------------------------------------------------------ */}
        <h2 id="highrise-in-context">7. HighRise in context: how our system compares</h2>
        <p>
          The following comparison uses the button component as a benchmark, since every design system exposes its
          button tokens as a primary example.
        </p>
        <Reveal>
          <table>
            <thead>
              <tr>
                <th>Capability</th>
                <th>HighRise</th>
                <th>Material Design 3</th>
                <th>Ant Design 5</th>
                <th>Carbon v11</th>
                <th>SAP Fiori</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON.map((row) => (
                <tr key={row.capability}>
                  <td>{row.capability}</td>
                  {row.cells.map((cell, i) => (
                    <td key={i} className={i === 0 ? "font-medium text-gray-900 dark:text-gray-100" : undefined}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </Reveal>
        <p><strong>HighRise strengths:</strong></p>
        <ul>
          <li>The largest size scale range of any surveyed system (8 scales)</li>
          <li>Full mobile/web parity in separate, platform-appropriate token files</li>
          <li>All 5 interaction states explicitly tokenized for every variant</li>
          <li>Both web and mobile covered in a single integrated system</li>
          <li>Custom Figma plugin for direct token application</li>
        </ul>
        <p><strong>HighRise gaps to be aware of:</strong></p>
        <ul>
          <li>Currently internal (not open source), so community tooling support must be built in-house</li>
          <li>
            The <TokenPath>--mod-*</TokenPath> override API layer that Adobe Spectrum CSS uses (a public customization
            layer on top of internal component tokens) has not yet been formalized in HighRise — this is worth
            considering for enterprise white-label use cases
          </li>
        </ul>

        {/* ------------------------------------------------------------ */}
        <h2 id="cost-of-not">8. The cost of not doing component tokens</h2>
        <p>Every shortcut taken now compounds later. Here is what deferring component tokens means in practice:</p>
        <h3>Dark mode becomes a CSS marathon</h3>
        <p>
          Without component tokens, adding dark mode means writing{" "}
          <TokenPath>@media (prefers-color-scheme: dark)</TokenPath> or <TokenPath>.dark</TokenPath> class overrides
          for every component, every variant, and every state — individually. For 65 components with 5 states and 4
          variants each, that is approximately <strong>1,300 individual dark mode CSS rules</strong> to write, test,
          and maintain. With component tokens, it is zero — the semantic layer handles it.
        </p>
        <h3>Theme requests become development projects</h3>
        <p>
          &quot;Can we have a compact version of the UI?&quot; Without component tokens: build a separate set of CSS
          overrides for every spacing-related property across every component. With component tokens: define a new set
          of size token values and apply them via a class or data attribute.
        </p>
        <h3>White-labeling requires a code fork</h3>
        <p>
          An agency running on HighLevel wants their branded version. Without component tokens: give them a CSS
          override file they maintain separately (which breaks on every update) or fork the codebase for them. With
          component tokens: give them a token values JSON. Every update to the design system propagates to their brand
          automatically.
        </p>
        <h3>Cross-team consistency breaks down</h3>
        <p>
          When semantic tokens are used directly in component CSS, every team makes their own decisions about which
          semantic token to use for which component state. Over time, Button A in Team 1&apos;s product and Button A in
          Team 2&apos;s product look different — because they each hardcoded different semantic tokens. Component
          tokens are the single source of truth that keeps this from happening.
        </p>
        <h3>Technical debt compounds</h3>
        <p>
          The longer a product runs without component tokens, the harder they become to add. Every component that has
          baked-in semantic token references or hard-coded values becomes a migration project. Starting with component
          tokens means never having that conversation.
        </p>

        {/* ------------------------------------------------------------ */}
        <h2 id="glossary">9. Glossary</h2>
        <table>
          <thead>
            <tr>
              <th className="w-48">Term</th>
              <th>Definition</th>
            </tr>
          </thead>
          <tbody>
            {GLOSSARY.map((g) => (
              <tr key={g.term}>
                <td><strong>{g.term}</strong></td>
                <td>{g.def}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ------------------------------------------------------------ */}
        <h2 id="references">10. References &amp; further reading</h2>
        <h3>Primary sources (design systems)</h3>
        <table>
          <thead>
            <tr>
              <th>System</th>
              <th>Component token documentation</th>
            </tr>
          </thead>
          <tbody>
            {PRIMARY_SOURCES.map((s) => (
              <tr key={s.system}>
                <td>{s.system}</td>
                <td>
                  <Ext href={s.href}>{s.label}</Ext>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <h3>Standards &amp; community</h3>
        <table>
          <thead>
            <tr>
              <th>Resource</th>
              <th>Link</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>W3C Design Tokens Community Group</td>
              <td><Ext href="https://www.designtokens.org/">designtokens.org</Ext></td>
            </tr>
            <tr>
              <td>W3C DTCG spec stable release (Oct 2025)</td>
              <td>
                <Ext href="https://www.w3.org/community/design-tokens/2025/10/28/design-tokens-specification-reaches-first-stable-version/">
                  w3.org announcement
                </Ext>
              </td>
            </tr>
            <tr>
              <td>State of Design Tokens 2024 (Supernova)</td>
              <td><Ext href="https://www.supernova.io/state-of-design-tokens">supernova.io/state-of-design-tokens</Ext></td>
            </tr>
            <tr>
              <td>Martin Fowler — design token-based UI architecture</td>
              <td>
                <Ext href="https://martinfowler.com/articles/design-token-based-ui-architecture.html">martinfowler.com</Ext>
              </td>
            </tr>
          </tbody>
        </table>
        <h3>Tooling</h3>
        <table>
          <thead>
            <tr>
              <th>Tool</th>
              <th>Link</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Style Dictionary (Amazon)</td>
              <td><Ext href="https://styledictionary.com/">styledictionary.com</Ext></td>
            </tr>
            <tr>
              <td>Tokens Studio (Figma plugin)</td>
              <td><Ext href="https://tokens.studio/">tokens.studio</Ext></td>
            </tr>
            <tr>
              <td>Panda CSS</td>
              <td><Ext href="https://panda-css.com/docs/theming/tokens">panda-css.com/docs/theming/tokens</Ext></td>
            </tr>
          </tbody>
        </table>

        {/* ------------------------------------------------------------ */}
        <WhySummary variant="bottom" />

        <p className="mt-8 text-sub text-gray-400 dark:text-gray-500">
          HighRise design token system data sourced directly from the Comp Tokens 1.1 repository · Industry research
          conducted May 2026.
        </p>
      </article>
    </PageTransition>
  );
}
