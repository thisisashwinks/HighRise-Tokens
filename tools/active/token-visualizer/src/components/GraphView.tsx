'use client';
import { useMemo } from 'react';
import {
  ReactFlow, Background, Controls, MiniMap, type Node, type NodeMouseHandler,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import TokenNode from './TokenNode';
import { buildGraph, type TokenNodeData } from '@/lib/graph';
import type { ComponentDef, Mode } from '@/lib/resolve';

const nodeTypes = { token: TokenNode };

export interface SelectedToken { title: string; startValue: unknown; layer: string; }

export default function GraphView({
  component, mode, filter, onSelect,
}: {
  component: ComponentDef | null;
  mode: Mode;
  filter: string;
  onSelect: (s: SelectedToken) => void;
}) {
  const { nodes, edges, total, shown } = useMemo(() => {
    if (!component) return { nodes: [] as Node<TokenNodeData>[], edges: [], total: 0, shown: 0 };
    return buildGraph(component, mode, filter);
  }, [component, mode, filter]);

  const onNodeClick: NodeMouseHandler = (_e, node) => {
    const d = node.data as TokenNodeData;
    onSelect({ title: d.fullPath, startValue: d.startValue, layer: d.layer });
  };

  if (!component) {
    return <div style={{ display: 'grid', placeItems: 'center', height: '100%', color: '#667085' }}>Select a component to visualize its tokens.</div>;
  }

  return (
    <div style={{ position: 'relative', height: '100%' }}>
      {total > shown && (
        <div style={{ position: 'absolute', zIndex: 5, top: 10, left: 10, background: '#fff7ed', color: '#92400e', border: '1px solid #fed7aa', borderRadius: 8, padding: '6px 10px', fontSize: 11.5 }}>
          Showing {shown} of {total} tokens — use the token filter to narrow down.
        </div>
      )}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodeClick={onNodeClick}
        fitView
        minZoom={0.1}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#e6e9ef" gap={20} />
        <Controls showInteractive={false} />
        <MiniMap pannable zoomable nodeStrokeWidth={2} nodeColor={(n) => {
          const l = (n.data as TokenNodeData).layer;
          return l === 'component' ? '#155EEF' : l === 'semantic' ? '#7c3aed' : l === 'primitive' ? '#0a7d4d' : '#b42318';
        }} />
      </ReactFlow>
    </div>
  );
}
