import { Breadcrumbs } from "@/components/breadcrumbs";
import { Callout, TokenPath } from "@/components/ui";
import { TokenTable, type TokenRow } from "@/components/token-table";
import { primitives, isHexColor, formatValue, FIGMA_FOUNDATIONS_FILE } from "@/lib/data";
import { PageTransition } from "@/components/motion";

export const metadata = { title: "Primitive tokens — HighRise Design System" };

interface RampEntry {
  step: string;
  path: string;
  hex: string;
}

function buildRamps() {
  const ramps = new Map<string, RampEntry[]>();
  for (const t of primitives) {
    if (!t.path.startsWith("color/") || t.type !== "color") continue;
    const parts = t.path.split("/");
    if (parts.length < 4) continue;
    const family = parts.slice(1, 3).join("/");
    if (!isHexColor(t.resolved)) continue;
    const list = ramps.get(family) ?? [];
    list.push({ step: parts[3], path: t.path, hex: t.resolved });
    ramps.set(family, list);
  }
  for (const list of Array.from(ramps.values())) {
    list.sort((a, b) => Number(a.step) - Number(b.step));
  }
  return ramps;
}

const FEATURED: { family: string; label: string; note: string }[] = [
  { family: "neutral/gray", label: "Gray (neutral)", note: "The workhorse ramp — text, borders, and surfaces all resolve here." },
  { family: "primary/blue", label: "Blue (primary)", note: "The HighRise brand ramp. Every primary/* semantic points here in the default brand." },
  { family: "secondary/success", label: "Success", note: "Positive status — confirmations, success states." },
  { family: "secondary/error", label: "Error", note: "Destructive and error states." },
  { family: "secondary/warning", label: "Warning", note: "Caution and irreversible-action warnings." },
  { family: "accent/purple", label: "Purple (accent)", note: "The accent ramp used by the Purple Light and Purple Dark modes." },
];

export default function PrimitiveTokens() {
  const ramps = buildRamps();
  const accentFamilies = Array.from(ramps.keys()).filter(
    (f) => f.startsWith("accent/") && f !== "accent/purple"
  );

  const rows: TokenRow[] = primitives.map((t) => ({
    path: t.path,
    value: formatValue(t.value),
    type: t.type,
    description: t.description,
    resolved: typeof t.resolved === "string" || typeof t.resolved === "number" ? String(t.resolved) : undefined,
  }));

  return (
    <PageTransition>
    <article className="doc">
      <Breadcrumbs items={[{ label: "Foundations", href: "/foundations/tokens-overview" }, { label: "Primitive tokens" }]} />
      <h1>Primitive tokens</h1>
      <p>
        Primitives are the raw material of the system: the full color palette, plus the size, spacing, radius, font,
        opacity, and motion scales. Each primitive is a literal value with a systematic name —{" "}
        <TokenPath>color/neutral/gray/700</TokenPath> is <code>#344054</code>, <TokenPath>size/9</TokenPath> is{" "}
        <code>36px</code>. Primitives carry no usage meaning and are <strong>never applied directly to designs</strong>
        . They exist so the semantic layer has a stable, complete vocabulary to point at.
      </p>
      <Callout tone="info" title="Reference layer only">
        <p>
          If you find yourself picking <TokenPath>gray/500</TokenPath> because it &quot;looks right,&quot; stop — pick
          the semantic token that means what you are doing. The mode remapping that powers dark mode and white-label
          happens between the semantic and primitive layers, so a directly applied primitive can never adapt. See the{" "}
          <a href={FIGMA_FOUNDATIONS_FILE} target="_blank" rel="noreferrer">HighRise 1.2 Foundations file</a> for the
          same ramps in Figma.
        </p>
      </Callout>

      <h2>Color ramps</h2>
      <p>
        Every hue ships as a 13-step ramp (0/25/50–900, plus 950/1000 on gray) from near-white to near-black. The gray
        family also includes seven alternates (gray-blue, gray-cool, gray-modern, and so on) kept for parity with the
        Untitled UI base palette; HighRise semantics use <TokenPath>neutral/gray</TokenPath> only.
      </p>

      {FEATURED.map(({ family, label, note }) => {
        const ramp = ramps.get(family);
        if (!ramp) return null;
        return (
          <section key={family} className="mt-6">
            <h3>{label}</h3>
            <p className="!mt-1 text-sub text-gray-500 dark:text-gray-400">{note}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {ramp.map((e) => (
                <div key={e.path} className="w-[64px]">
                  <div
                    className="h-10 w-full rounded-md border border-gray-900/10 dark:border-white/15"
                    style={{ backgroundColor: e.hex }}
                    title={`${e.path} — ${e.hex}`}
                  />
                  <p className="!mt-1 text-center font-mono text-[10.5px] text-gray-500 dark:text-gray-400">
                    {e.step}
                  </p>
                </div>
              ))}
            </div>
          </section>
        );
      })}

      <h3>Accent ramps</h3>
      <p className="!mt-1 text-sub text-gray-500 dark:text-gray-400">
        Sixteen additional hues available for data visualization, avatars, and white-label accents.
      </p>
      <div className="mt-2 space-y-1.5">
        {accentFamilies.map((family) => {
          const ramp = ramps.get(family)!;
          return (
            <div key={family} className="flex items-center gap-3">
              <span className="w-28 shrink-0 font-mono text-[11px] text-gray-500 dark:text-gray-400">
                {family.replace("accent/", "")}
              </span>
              <div className="flex flex-1 overflow-hidden rounded-md border border-gray-900/10 dark:border-white/15">
                {ramp.map((e) => (
                  <div
                    key={e.path}
                    className="h-6 flex-1"
                    style={{ backgroundColor: e.hex }}
                    title={`${e.path} — ${e.hex}`}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <h2>All primitives</h2>
      <p>
        The full flattened primitive set — colors plus the non-color scales (spacing, size, border, font, opacity,
        z-index, motion, and shadow ingredients).
      </p>
      <div className="mt-4">
        <TokenTable rows={rows} searchPlaceholder="Search primitives (e.g. gray, size/9, radius)" />
      </div>
    </article>
    </PageTransition>
  );
}
