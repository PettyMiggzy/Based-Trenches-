// TODO: hook up to usePlatformStats() pulling from indexer API

const STATS = [
  { value: '1,247',  unit: '',    label: 'Tokens Launched' },
  { value: '89',     unit: ' ETH', label: 'Total Volume' },
  { value: '34',     unit: '',    label: 'Broke Out' },
  { value: '1.74',   unit: ' ETH', label: 'War Chest' },
  { value: '$284K',  unit: '',    label: 'Creator Rewards' },
]

export function StatsBar() {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: 'repeat(5,1fr)',
      gap: '1px', background: 'var(--border)',
      borderBottom: '1px solid var(--border)',
    }}>
      {STATS.map(s => (
        <div key={s.label} style={{ background: 'var(--deep)', padding: '1rem 1.25rem', textAlign: 'center' }}>
          <div style={{ fontFamily: 'Black Ops One, cursive', fontSize: '22px', color: 'var(--cream)' }}>
            {s.value}
            {s.unit && <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '12px', color: 'var(--copper)' }}>{s.unit}</span>}
          </div>
          <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '10px', color: 'var(--grey-l)', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: '3px' }}>
            {s.label}
          </div>
        </div>
      ))}
    </div>
  )
}
