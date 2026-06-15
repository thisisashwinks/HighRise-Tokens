'use client';
import { useMemo } from 'react';
import { DATA, MODES, type Mode, type ComponentDef } from '@/lib/resolve';

export type Platform = 'mobile' | 'web';

export default function Toolbar({
  platform, setPlatform, componentId, setComponentId, mode, setMode, filter, setFilter,
}: {
  platform: Platform; setPlatform: (p: Platform) => void;
  componentId: string; setComponentId: (id: string) => void;
  mode: Mode; setMode: (m: Mode) => void;
  filter: string; setFilter: (f: string) => void;
}) {
  const components = useMemo(
    () => DATA.components.filter((c) => c.platform === platform).sort((a, b) => a.name.localeCompare(b.name)),
    [platform],
  );

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', background: '#fff', borderBottom: '1px solid #e6e9ef', flexWrap: 'wrap' }}>
      <strong style={{ fontSize: 14, color: '#0a2463' }}>HighRise Token Visualizer</strong>

      <div style={{ display: 'flex', border: '1px solid #e6e9ef', borderRadius: 8, overflow: 'hidden' }}>
        {(['mobile', 'web'] as Platform[]).map((p) => (
          <button key={p} onClick={() => setPlatform(p)} style={tab(platform === p)}>{p[0].toUpperCase() + p.slice(1)}</button>
        ))}
      </div>

      <select value={componentId} onChange={(e) => setComponentId(e.target.value)} style={sel} title="Component">
        {components.map((c: ComponentDef) => (
          <option key={c.id} value={c.id}>{c.name} ({c.tokenCount})</option>
        ))}
        <option value="__ALL__">— All components (heavy, later) —</option>
      </select>

      <div style={{ display: 'flex', border: '1px solid #e6e9ef', borderRadius: 8, overflow: 'hidden' }}>
        {MODES.map((m) => (
          <button key={m} onClick={() => setMode(m)} style={tab(mode === m)}>{m}</button>
        ))}
      </div>

      <input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="filter tokens (e.g. background)…"
        style={{ flex: 1, minWidth: 160, fontSize: 12, border: '1px solid #e6e9ef', borderRadius: 8, padding: '7px 10px' }} />

      <span style={{ fontSize: 11, color: '#98a2b3', display: 'flex', gap: 10 }}>
        <span><b style={{ color: '#155EEF' }}>●</b> component</span>
        <span><b style={{ color: '#7c3aed' }}>●</b> semantic</span>
        <span><b style={{ color: '#0a7d4d' }}>●</b> primitive</span>
      </span>
    </div>
  );
}

const tab = (active: boolean): React.CSSProperties => ({
  border: 'none', background: active ? '#155EEF' : '#fff', color: active ? '#fff' : '#475467',
  fontSize: 12, fontWeight: 600, padding: '7px 12px', cursor: 'pointer',
});
const sel: React.CSSProperties = { fontSize: 12, border: '1px solid #e6e9ef', borderRadius: 8, padding: '7px 10px', minWidth: 200, background: '#fff' };
