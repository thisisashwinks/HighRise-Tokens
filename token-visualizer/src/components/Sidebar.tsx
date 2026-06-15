'use client';
import { useMemo, useState } from 'react';
import {
  resolveChain, finalValue, searchTokens, isColorVal,
  type Mode, type ComponentDef, type ChainStep, type SearchHit,
} from '@/lib/resolve';
import type { SelectedToken } from './GraphView';

const LAYER_COLOR: Record<string, string> = {
  component: '#155EEF', semantic: '#7c3aed', primitive: '#0a7d4d', raw: '#0a7d4d', missing: '#b42318',
};

function Swatch({ v }: { v: unknown }) {
  if (!isColorVal(v)) return null;
  return <span style={{ display: 'inline-block', width: 13, height: 13, borderRadius: 3, background: v, border: '1px solid rgba(0,0,0,.15)', verticalAlign: '-2px', marginRight: 5 }} />;
}

function ChainView({ start, mode }: { start: unknown; mode: Mode }) {
  const steps = useMemo(() => resolveChain(start, mode), [start, mode]);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {steps.map((s: ChainStep, i) => (
        <div key={i}>
          <div style={{ border: '1px solid #e6e9ef', borderLeft: '3px solid ' + (LAYER_COLOR[s.kind] || '#98a2b3'), borderRadius: 8, padding: '7px 9px', background: s.kind === 'raw' ? '#ecfdf5' : '#fff' }}>
            <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em', color: LAYER_COLOR[s.kind] || '#98a2b3' }}>
              {s.kind === 'raw' ? 'Resolved value' : s.kind}
            </div>
            {s.path ? <div style={{ fontFamily: 'ui-monospace, Menlo, monospace', fontSize: 11, wordBreak: 'break-all', marginTop: 2 }}>{s.path}</div> : null}
            <div style={{ fontSize: 11, color: '#475467', marginTop: 2 }}><Swatch v={s.value} /><span style={{ fontFamily: 'ui-monospace, Menlo, monospace' }}>{String(s.value)}</span></div>
          </div>
          {i < steps.length - 1 ? <div style={{ textAlign: 'center', color: '#cbd5e1', fontSize: 13, lineHeight: '6px' }}>↓</div> : null}
        </div>
      ))}
    </div>
  );
}

export default function Sidebar({
  selected, component, mode, onPick,
}: {
  selected: SelectedToken | null;
  component: ComponentDef | null;
  mode: Mode;
  onPick: (hit: SearchHit) => void;
}) {
  const [q, setQ] = useState('');
  const hits = useMemo(() => searchTokens(q, component), [q, component]);

  return (
    <div style={{ width: 360, borderLeft: '1px solid #e6e9ef', background: '#f8f9fc', display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Q&A / lookup */}
      <div style={{ padding: 14, borderBottom: '1px solid #e6e9ef' }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#0a2463', marginBottom: 4 }}>Ask / look up a token</div>
        <div style={{ fontSize: 11, color: '#667085', marginBottom: 8 }}>Type part of a token name to find its semantic and primitive links and resolved value.</div>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="e.g. background primary, icon neutral, radius…"
          style={{ width: '100%', fontSize: 12, border: '1px solid #e6e9ef', borderRadius: 8, padding: '8px 10px', boxSizing: 'border-box' }} />
        {q && (
          <div style={{ marginTop: 8, maxHeight: 180, overflow: 'auto', border: '1px solid #e6e9ef', borderRadius: 8, background: '#fff' }}>
            {hits.length === 0 ? <div style={{ padding: 10, fontSize: 11, color: '#98a2b3' }}>No matches.</div> :
              hits.map((h, i) => {
                const fv = finalValue(h.startValue, mode);
                return (
                  <div key={i} onClick={() => onPick(h)} style={{ padding: '7px 9px', borderTop: i ? '1px solid #f0f2f5' : 'none', cursor: 'pointer', fontSize: 11 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 6 }}>
                      <span style={{ fontFamily: 'ui-monospace, Menlo, monospace', wordBreak: 'break-all' }}>{h.title}</span>
                      <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', color: LAYER_COLOR[h.layer] || '#98a2b3', whiteSpace: 'nowrap' }}>{h.layer}</span>
                    </div>
                    <div style={{ color: '#667085', marginTop: 2 }}><Swatch v={fv} />{String(fv)}</div>
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {/* selected token detail */}
      <div style={{ padding: 14, overflow: 'auto', flex: 1 }}>
        {!selected ? (
          <div style={{ fontSize: 12, color: '#98a2b3' }}>Click a node in the graph, or a search result above, to see its full chain.</div>
        ) : (
          <>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#0a2463' }}>Selected token</div>
            <div style={{ fontFamily: 'ui-monospace, Menlo, monospace', fontSize: 12, margin: '4px 0 6px', wordBreak: 'break-all' }}>{selected.title}</div>
            <div style={{ fontSize: 11, color: '#667085', marginBottom: 10 }}>
              Resolved value ({mode}): <Swatch v={finalValue(selected.startValue, mode)} /><b>{String(finalValue(selected.startValue, mode))}</b>
            </div>
            <ChainView start={selected.startValue} mode={mode} />
          </>
        )}
      </div>
    </div>
  );
}
