'use client'
import { useState, useEffect } from 'react'
import { TokenCard } from './TokenCard'
import type { Token } from '../lib/types'

const FILTERS = ['Trending', 'New', 'Raids', 'Hot', 'Near Breakout']

export function TrendingTrenches() {
  const [activeFilter, setActiveFilter] = useState('Trending')
  const [tokens, setTokens] = useState<Token[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        setLoading(true)
        const res = await fetch('/api/tokens')
        const data = await res.json()
        if (!cancelled) {
          setTokens(data.tokens || [])
          setError('')
        }
      } catch (e: any) {
        if (!cancelled) setError('Failed to load tokens')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    // Refresh every 30s
    const interval = setInterval(load, 30_000)
    return () => { cancelled = true; clearInterval(interval) }
  }, [])

  const filtered = tokens.filter(t => {
    if (activeFilter === 'New') return (Date.now() / 1000 - t.launchedAt) < 3600
    if (activeFilter === 'Raids') return t.isRaiding
    if (activeFilter === 'Hot') return t.volume24h > 0.3
    if (activeFilter === 'Near Breakout') return t.bondPercent >= 75
    return true // Trending = all
  })

  return (
    <section style={{ padding: '2.5rem 2rem' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <span style={{ fontFamily: 'Black Ops One, cursive', fontSize: '20px', color: 'var(--cream)' }}>Trending Trenches</span>
          <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg,var(--border),transparent)' }} />
          <a href="/trenches" style={{ fontFamily: 'Oswald, sans-serif', fontSize: '11px', fontWeight: 700, color: 'var(--copper)', letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none' }}>
            VIEW ALL →
          </a>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              style={{
                fontFamily: 'Oswald, sans-serif', fontSize: '11px', fontWeight: 700,
                color: activeFilter === f ? '#060504' : 'var(--grey-l)',
                background: activeFilter === f ? 'var(--copper)' : 'transparent',
                border: `1px solid ${activeFilter === f ? 'var(--copper)' : 'rgba(255,255,255,0.1)'}`,
                padding: '4px 12px', letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'crosshair',
              }}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '1px', background: 'var(--border)' }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{ background: 'var(--panel)', height: '180px', opacity: 0.4 }} />
            ))}
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '13px', color: 'var(--red-b)', padding: '2rem', textAlign: 'center' }}>
            {error}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && filtered.length === 0 && (
          <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '14px', color: 'var(--grey-l)', padding: '3rem', textAlign: 'center', border: '1px solid var(--border)' }}>
            {tokens.length === 0 ? 'No tokens launched yet. Be the first.' : `No ${activeFilter.toLowerCase()} tokens right now.`}
          </div>
        )}

        {/* Token grid */}
        {!loading && filtered.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '1px', background: 'var(--border)' }}>
            {filtered.slice(0, 12).map(token => (
              <TokenCard key={token.address} token={token} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
