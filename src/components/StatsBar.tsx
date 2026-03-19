'use client'
import { useState, useEffect } from 'react'

export function StatsBar() {
  const [stats, setStats] = useState({ total: 0, graduated: 0 })
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/tokens')
        const data = await res.json()
        const tokens = data.tokens || []
        setStats({
          total: data.total || 0,
          graduated: tokens.filter((t: any) => t.graduated).length,
        })
        setLoaded(true)
      } catch (_) { setLoaded(true) }
    }
    load()
    const interval = setInterval(load, 30000)
    return () => clearInterval(interval)
  }, [])

  const items = [
    { v: loaded ? String(stats.total)      : '—', l: 'Tokens Launched'  },
    { v: loaded ? '—'                      : '—', l: 'Total Volume'      },
    { v: loaded ? String(stats.graduated)  : '—', l: 'Broke Out'         },
    { v: '—',                                      l: 'War Chest'         },
    { v: '—',                                      l: 'Creator Rewards'   },
  ]

  return (
    <div style={{ borderBottom: '1px solid var(--border)', background: 'var(--panel)' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: '1px', background: 'var(--border)' }}>
        {items.map(({ v, l }) => (
          <div key={l} style={{ background: 'var(--panel)', padding: '1rem 1.25rem', textAlign: 'center' }}>
            <div style={{ fontFamily: 'Black Ops One, cursive', fontSize: '20px', color: 'var(--copper-l)' }}>{v}</div>
            <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '9px', color: 'var(--grey-l)', letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: '3px' }}>{l}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
