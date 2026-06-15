'use client';
import { Handle, Position, NodeProps } from '@xyflow/react';
import type { TokenNodeData } from '@/lib/graph';

const LAYER_META: Record<string, { label: string; color: string; bg: string }> = {
  component: { label: 'Component', color: '#155EEF', bg: '#EEF4FF' },
  semantic:  { label: 'Semantic',  color: '#7c3aed', bg: '#f5f0ff' },
  primitive: { label: 'Primitive', color: '#0a7d4d', bg: '#ecfdf5' },
  missing:   { label: 'Unresolved', color: '#b42318', bg: '#fef3f2' },
};

export default function TokenNode({ data, selected }: NodeProps) {
  const d = data as TokenNodeData;
  const meta = LAYER_META[d.layer] || LAYER_META.component;
  return (
    <div style={{
      width: 248, minHeight: 60, boxSizing: 'border-box',
      border: '1px solid ' + (selected ? meta.color : '#e6e9ef'),
      borderLeft: '4px solid ' + meta.color,
      borderRadius: 8, background: '#fff', padding: '7px 10px',
      boxShadow: selected ? '0 0 0 2px ' + meta.bg : '0 1px 2px rgba(16,24,40,.05)',
      fontFamily: 'Inter, system-ui, sans-serif',
    }}>
      <Handle type="target" position={Position.Left} style={{ background: meta.color, width: 7, height: 7, border: 'none' }} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
        <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em', color: meta.color, background: meta.bg, padding: '1px 6px', borderRadius: 10 }}>{meta.label}</span>
        {d.swatch ? <span style={{ width: 14, height: 14, borderRadius: 4, background: d.swatch, border: '1px solid rgba(0,0,0,.15)' }} /> : null}
      </div>
      <div style={{ fontSize: 11, fontFamily: 'ui-monospace, Menlo, monospace', color: '#1a1a2e', lineHeight: 1.3, wordBreak: 'break-all' }}>{d.label}</div>
      {d.valueText ? <div style={{ fontSize: 10, color: '#667085', marginTop: 2, fontFamily: 'ui-monospace, Menlo, monospace' }}>{d.valueText}</div> : null}
      <Handle type="source" position={Position.Right} style={{ background: meta.color, width: 7, height: 7, border: 'none' }} />
    </div>
  );
}
