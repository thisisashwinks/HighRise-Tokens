import dagre from '@dagrejs/dagre';
import type { Node, Edge } from '@xyflow/react';
import { ComponentDef, Mode, resolveChain, finalValue, isColorVal, stripRef } from './resolve';

export interface TokenNodeData extends Record<string, unknown> {
  layer: 'component' | 'semantic' | 'primitive' | 'missing';
  label: string;       // short label
  fullPath: string;    // full token path
  startValue: unknown; // value to resolve from (for the sidebar)
  swatch: string | null;
  valueText: string;
}

const NODE_W = 248;
const NODE_H = 60;

function short(path: string): string {
  const i = path.indexOf('.');
  return i === -1 ? path : path.slice(i + 1);
}
function valText(v: unknown): string {
  if (v === null || v === undefined) return '';
  return typeof v === 'string' ? v : String(v);
}

export interface BuildResult { nodes: Node<TokenNodeData>[]; edges: Edge[]; total: number; shown: number; }

// Build a left→right graph: component tokens → semantic → primitive (raw value shown on node).
export function buildGraph(
  component: ComponentDef,
  mode: Mode,
  filter: string,
  maxTokens = 140,
): BuildResult {
  const f = filter.trim().toLowerCase();
  const all = component.tokens.filter((t) => !f || t.path.toLowerCase().includes(f));
  const total = all.length;
  const tokens = all.slice(0, maxTokens);

  const nodeMap = new Map<string, Node<TokenNodeData>>();
  const edgeSet = new Set<string>();
  const edges: Edge[] = [];

  const addEdge = (sourceId: string, targetId: string) => {
    const key = sourceId + '→' + targetId;
    if (edgeSet.has(key)) return;
    edgeSet.add(key);
    edges.push({
      id: key, source: sourceId, target: targetId,
      type: 'smoothstep', animated: false,
      style: { stroke: '#c3cee0', strokeWidth: 1.5 },
      markerEnd: { type: 'arrowclosed' as any, color: '#c3cee0', width: 16, height: 16 },
    });
  };

  for (const tk of tokens) {
    const rootId = 'c:' + tk.path;
    const fv = finalValue(tk.value, mode);
    if (!nodeMap.has(rootId)) {
      nodeMap.set(rootId, mkNode(rootId, {
        layer: 'component', label: short(tk.path), fullPath: tk.path,
        startValue: tk.value, swatch: isColorVal(fv) ? fv : null, valueText: valText(fv),
      }));
    }
    const chain = resolveChain(tk.value, mode);
    let prevId = rootId;
    for (const step of chain) {
      if (step.kind === 'raw') continue; // raw hex is shown on the primitive node itself
      const key = step.path || 'unknown';
      const nodeId = step.kind + ':' + key;
      if (!nodeMap.has(nodeId)) {
        const sfv = step.kind === 'missing' ? null : finalValue(step.value, mode);
        nodeMap.set(nodeId, mkNode(nodeId, {
          layer: step.kind,
          label: short(key),
          fullPath: key,
          startValue: '{' + key + '}',
          swatch: sfv && isColorVal(sfv) ? sfv : null,
          valueText: step.kind === 'primitive' ? valText(step.value) : (step.kind === 'missing' ? 'unresolved' : valText(sfv)),
        }));
      }
      addEdge(prevId, nodeId);
      prevId = nodeId;
      if (step.kind === 'missing') break;
    }
  }

  const nodes = layout(Array.from(nodeMap.values()), edges);
  return { nodes, edges, total, shown: tokens.length };
}

function mkNode(id: string, data: TokenNodeData): Node<TokenNodeData> {
  return { id, type: 'token', position: { x: 0, y: 0 }, data, width: NODE_W, height: NODE_H };
}

function layout(nodes: Node<TokenNodeData>[], edges: Edge[]): Node<TokenNodeData>[] {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: 'LR', nodesep: 16, ranksep: 130, marginx: 24, marginy: 24 });
  nodes.forEach((n) => g.setNode(n.id, { width: NODE_W, height: NODE_H }));
  edges.forEach((e) => g.setEdge(e.source, e.target));
  dagre.layout(g);
  return nodes.map((n) => {
    const p = g.node(n.id);
    return { ...n, position: { x: p.x - NODE_W / 2, y: p.y - NODE_H / 2 } };
  });
}
