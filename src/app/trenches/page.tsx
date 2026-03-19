'use client'
import { useState, useEffect } from 'react'
import { TokenCard } from '../../components/TokenCard'
import type { Token } from '../../lib/types'

const FILTERS = ['All', 'New', 'Trending', 'Hot', 'Near Breakout', 'Graduated']

export default function TrenchesPage() {
  const [filter, setFilter] = useState('All')
  const [tokens, setTokens] = useState<Token[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        setLoading(true)
        const res = await fetch('/api/tokens')
        const data = await res.json()
        if (!cancelled) setTokens(data.tokens || [])
      } catch (_) {}
      finally { if (!cancelled) setLoading(false) }
    }
    load()
    const interval = setInterval(load, 30000)
    return () => { cancelled = true; clearInterval(interval) }
  }, [])

  const filtered = tokens.filter(t => {
    const matchSearch = !search || t.name.toLowerCase().includes(search.toLowerCase()) || t.symbol.toLowerCase().includes(search.toLowerCase())
    const matchFilter =
      filter === 'All'          ? true :
      filter === 'New'          ? (Date.now() / 1000 - t.launchedAt) < 7200 :
      filter === 'Trending'     ? t.bondPercent > 20 && t.bondPercent < 80 :
      filter === 'Hot'          ? t.volume24h > 0.1 :
      filter === 'Near Breakout'? t.bondPercent >= 75 :
      filter === 'Graduated'    ? t.graduated :
      true
    return matchSearch && matchFilter
  })

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontFamily: 'Black Ops One, cursive', fontSize: '28px', color: 'var(--cream)', margin: 0 }}>The Trenches</h1>
          <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '11px', color: 'var(--grey-l)', marginTop: '4px' }}>
            {loading ? 'Loading...' : `${tokens.length} tokens deployed on Base`}
          </div>
        </div>
        {/* Search */}
        <input
          type="text"
          placeholder="Search tokens..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ background: 'var(--panel)', border: '1px solid var(--border)', color: 'var(--cream)', fontFamily: 'Share Tech Mono, monospace', fontSize: '13px', padding: '0.6rem 1rem', outline: 'none', width: '220px' }}
        />
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ fontFamily: 'Oswald, sans-serif', fontSize: '11px', fontWeight: 700, color: filter === f ? '#060504' : 'var(--grey-l)', background: filter === f ? 'var(--copper)' : 'transparent', border: `1px solid ${filter === f ? 'var(--copper)' : 'rgba(255,255,255,0.1)'}`, padding: '5px 14px', letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'crosshair' }}>
            {f}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '1px', background: 'var(--border)' }}>
          {Array.from({ length: 12 }).map((_, i) => <div key={i} style={{ background: 'var(--panel)', height: '180px', opacity: 0.3 }} />)}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div style={{ padding: '4rem', textAlign: 'center', border: '1px solid var(--border)', fontFamily: 'Oswald, sans-serif', fontSize: '14px', color: 'var(--grey-l)' }}>
          {tokens.length === 0 ? 'No tokens launched yet. Be the first.' : 'No tokens match this filter.'}
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '1px', background: 'var(--border)' }}>
          {filtered.map(token => <TokenCard key={token.address} token={token} />)}
        </div>
      )}
    </div>
  )
}
