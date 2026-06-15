import graph from '@/data/graph.json';

export type BaseLayer = 'primitive' | 'semantic';
export interface BaseToken {
  value: unknown;
  type: string;
  description?: string;
  layer: BaseLayer;
  modes?: Record<string, unknown>;
}
export interface ComponentToken { path: string; value: unknown; type: string; description?: string; }
export interface ComponentDef {
  id: string; name: string; platform: 'mobile' | 'web'; file: string;
  tokenCount: number; tokens: ComponentToken[];
}
export interface GraphData {
  generatedAt?: string;
  base: Record<string, BaseToken>;
  components: ComponentDef[];
  error?: string;
}

export const DATA = graph as unknown as GraphData;

export const MODES = ['Light', 'Dark'] as const;
export type Mode = (typeof MODES)[number];

export function stripRef(v: unknown): string | null {
  return (typeof v === 'string' && v.startsWith('{') && v.endsWith('}')) ? v.slice(1, -1) : null;
}
export function isColorVal(v: unknown): v is string {
  return typeof v === 'string' && /^#([0-9a-f]{3,8})$/i.test(v);
}
export function tokenValueForMode(t: BaseToken, mode: Mode): unknown {
  return (t.modes && t.modes[mode] !== undefined) ? t.modes[mode] : t.value;
}

export type StepKind = 'semantic' | 'primitive' | 'raw' | 'missing';
export interface ChainStep {
  kind: StepKind;
  path?: string;
  value: unknown;
  type?: string;
  description?: string;
}

// Follow a value (possibly "{ref}") down through semantics → primitives → raw.
export function resolveChain(startValue: unknown, mode: Mode = 'Light', maxDepth = 24): ChainStep[] {
  const steps: ChainStep[] = [];
  let cur = startValue;
  let depth = 0;
  const seen = new Set<string>();
  while (depth++ < maxDepth) {
    const ref = stripRef(cur);
    if (ref === null) { steps.push({ kind: 'raw', value: cur }); break; }
    if (seen.has(ref)) { steps.push({ kind: 'missing', path: ref, value: '(cycle)' }); break; }
    seen.add(ref);
    const t = DATA.base[ref];
    if (!t) { steps.push({ kind: 'missing', path: ref, value: '(unresolved)' }); break; }
    const val = tokenValueForMode(t, mode);
    steps.push({ kind: t.layer, path: ref, value: val, type: t.type, description: t.description });
    cur = val;
  }
  return steps;
}

export function finalValue(startValue: unknown, mode: Mode = 'Light'): unknown {
  const s = resolveChain(startValue, mode);
  return s.length ? s[s.length - 1].value : startValue;
}

// Lightweight search across a component's tokens + the base layer (for the Q&A sidebar).
export interface SearchHit { title: string; startValue: unknown; layer: 'component' | BaseLayer; description?: string; type?: string; }
export function searchTokens(query: string, component: ComponentDef | null, limit = 40): SearchHit[] {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!terms.length) return [];
  const match = (s: string) => terms.every((t) => s.toLowerCase().includes(t));
  const hits: SearchHit[] = [];
  if (component) {
    for (const tk of component.tokens) {
      if (match(tk.path)) hits.push({ title: tk.path, startValue: tk.value, layer: 'component', description: tk.description, type: tk.type });
      if (hits.length >= limit) return hits;
    }
  }
  for (const [path, t] of Object.entries(DATA.base)) {
    if (match(path)) hits.push({ title: path, startValue: '{' + path + '}', layer: t.layer, description: t.description, type: t.type });
    if (hits.length >= limit) break;
  }
  return hits;
}
