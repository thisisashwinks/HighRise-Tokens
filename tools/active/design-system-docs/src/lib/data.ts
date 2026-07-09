import primitivesJson from "@/data/primitives.json";
import semanticColorsJson from "@/data/semantic-colors.json";
import semanticJson from "@/data/semantic.json";
import componentsJson from "@/data/components.json";
import componentIndexJson from "@/data/component-index.json";

export type TokenValue = string | number | Record<string, unknown> | Array<Record<string, unknown>>;

export interface FlatToken {
  path: string;
  value: TokenValue;
  type: string;
  description: string;
  resolved?: TokenValue;
}

export interface SemanticColor {
  path: string;
  light: string;
  dark: string | null;
  lightRef: string | null;
  darkRef: string | null;
  description: string;
}

export type VariantsMeta = Record<string, Record<string, string> | string> | null;

export interface BaseComponent {
  key: string;
  name: string;
  file: string;
  description: string;
  structure: string;
  variants: VariantsMeta;
  tokenCount: number;
  tokens: FlatToken[];
}

export interface ComponentDoc {
  slug: string;
  name: string;
  category: string;
  file: string;
  figmaPage: string | null;
  figmaPageId: string | null;
  figmaNodeId: string | null;
  description: string;
  structure: string;
  sizes: Record<string, string> | null;
  variants: VariantsMeta;
  usage: { contexts?: string; features?: string } | null;
  ownTokenCount: number;
  tokenCount: number;
  tokens: FlatToken[];
  bases: BaseComponent[];
}

export interface ComponentIndexEntry {
  slug: string;
  name: string;
  category: string;
  file: string;
  tokenCount: number;
  baseCount: number;
  hasFigma: boolean;
  description: string;
}

export const primitives = primitivesJson as unknown as FlatToken[];
export const semanticColors = semanticColorsJson as unknown as SemanticColor[];
export const semanticTokens = semanticJson as unknown as FlatToken[];
export const components = componentsJson as unknown as ComponentDoc[];
export const componentIndex = componentIndexJson as unknown as ComponentIndexEntry[];

export const CATEGORY_LABELS: Record<string, string> = {
  avatar: "Avatar",
  badge: "Badge",
  "date-picker": "Date picker",
  display: "Display",
  feedback: "Feedback",
  form: "Form",
  header: "Header",
  navigation: "Navigation",
  overlay: "Overlay",
  progress: "Progress",
  "sub-account-switcher": "Sub-account switcher",
  tag: "Tag",
  utilities: "Utilities",
};

export function categoryLabel(cat: string): string {
  return CATEGORY_LABELS[cat] ?? cat.replace(/-/g, " ").replace(/^./, (c) => c.toUpperCase());
}

export const FIGMA_MOBILE_FILE =
  "https://www.figma.com/design/daEnmg5XxPvZ0Cn6mjyCNf/HighRise-Mobile-Components";
export const FIGMA_FOUNDATIONS_FILE =
  "https://www.figma.com/design/Aoseryza3L5jnDWIfBNtaL/HighRise-1.2-Foundations";

export function figmaEmbedUrl(nodeId: string | null): string | null {
  if (!nodeId) return null;
  const inner = `${FIGMA_MOBILE_FILE}?node-id=${nodeId.replace(/:/g, "-")}`;
  return `https://www.figma.com/embed?embed_host=highrise-ds&url=${encodeURIComponent(inner)}`;
}

export function figmaNodeLink(nodeId: string): string {
  return `${FIGMA_MOBILE_FILE}?node-id=${nodeId.replace(/:/g, "-")}`;
}

export function isHexColor(v: unknown): v is string {
  return typeof v === "string" && /^#[0-9a-fA-F]{3,8}$/.test(v.trim());
}

export function formatValue(v: TokenValue): string {
  if (typeof v === "string" || typeof v === "number") return String(v);
  return JSON.stringify(v);
}
