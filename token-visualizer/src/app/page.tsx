'use client';
import { useEffect, useMemo, useState } from 'react';
import Toolbar, { type Platform } from '@/components/Toolbar';
import GraphView, { type SelectedToken } from '@/components/GraphView';
import Sidebar from '@/components/Sidebar';
import { DATA, type Mode, type SearchHit } from '@/lib/resolve';

export default function Page() {
  const [platform, setPlatform] = useState<Platform>('mobile');
  const [componentId, setComponentId] = useState<string>('');
  const [mode, setMode] = useState<Mode>('Light');
  const [filter, setFilter] = useState('');
  const [selected, setSelected] = useState<SelectedToken | null>(null);

  const componentsForPlatform = useMemo(
    () => DATA.components.filter((c) => c.platform === platform),
    [platform],
  );

  // keep a valid component selected when platform changes
  useEffect(() => {
    if (!componentsForPlatform.length) { setComponentId(''); return; }
    if (!componentsForPlatform.some((c) => c.id === componentId)) {
      const btn = componentsForPlatform.find((c) => /button/i.test(c.name));
      setComponentId((btn || componentsForPlatform[0]).id);
    }
  }, [platform, componentsForPlatform, componentId]);

  const component = useMemo(
    () => (componentId === '__ALL__' ? null : DATA.components.find((c) => c.id === componentId) || null),
    [componentId],
  );

  const onPick = (hit: SearchHit) => setSelected({ title: hit.title, startValue: hit.startValue, layer: hit.layer });

  return (
    <main style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <Toolbar
        platform={platform} setPlatform={setPlatform}
        componentId={componentId} setComponentId={setComponentId}
        mode={mode} setMode={setMode}
        filter={filter} setFilter={setFilter}
      />
      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          {componentId === '__ALL__' ? (
            <div style={{ display: 'grid', placeItems: 'center', height: '100%', padding: 32, textAlign: 'center', color: '#667085' }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#0a2463', marginBottom: 8 }}>All components view — coming next</div>
                <div style={{ fontSize: 13, maxWidth: 440 }}>This renders every {platform} component and all shared semantic/primitive nodes at once. It&apos;s heavy, so we kept it for a later stage. Pick a single component for now.</div>
              </div>
            </div>
          ) : (
            <GraphView component={component} mode={mode} filter={filter} onSelect={setSelected} />
          )}
        </div>
        <Sidebar selected={selected} component={component} mode={mode} onPick={onPick} />
      </div>
    </main>
  );
}
