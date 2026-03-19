'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import type { Token } from '../../lib/types'

const FILTERS = ['All', 'New', 'Trending', 'Hot', 'Near Breakout', 'Graduated']

// Placeholder tokens shown until 5 real ones exist
const PLACEHOLDERS: Partial<Token>[] = [
  { address: '', symbol: 'WARZ',   name: 'War Zone',        bondPercent: 71, bondedEth: 2.13, bondTarget: 3, marketCap: 8940,  volume24h: 0.6,  badge: 'trending', isRaiding: true,  graduated: false },
  { address: '', symbol: 'MOLTOV', name: 'Molotov Protocol', bondPercent: 94, bondedEth: 2.83, bondTarget: 3, marketCap: 12840, volume24h: 0.8,  badge: 'hot',      isRaiding: true,  graduated: false },
  { address: '', symbol: 'TRENCH', name: 'TrenchWars DAO',   bondPercent: 87, bondedEth: 2.63, bondTarget: 3, marketCap: 11200, volume24h: 0.4,  badge: 'hot',      isRaiding: false, graduated: false },
  { address: '', symbol: 'BUNKER', name: 'Bunker Protocol',  bondPercent: 38, bondedEth: 1.14, bondTarget: 3, marketCap: 4820,  volume24h: 0.2,  badge: 'trending', isRaiding: false, graduated: false },
  { address: '', symbol: 'RECON',  name: 'Recon Ops',        bondPercent: 62, bondedEth: 1.86, bondTarget: 3, marketCap: 7200,  volume24h: 0.35, badge: 'trending', isRaiding: false, graduated: false },
  { address: '', symbol: 'SURGE',  name: 'Surge Protocol',   bondPercent: 80, bondedEth: 2.40, bondTarget: 3, marketCap: 9600,  volume24h: 0.5,  badge: 'hot',      isRaiding: true,  graduated: false },
  { address: '', symbol: 'SAPPER', name: 'Sapper Labs',      bondPercent: 12, bondedEth: 0.36, bondTarget: 3, marketCap: 3480,  volume24h: 0.1,  badge: 'new',      isRaiding: false, graduated: false },
  { address: '', symbol: 'FLANK',  name: 'Flank Movement',   bondPercent: 7,  bondedEth: 0.21, bondTarget: 3, marketCap: 2800,  volume24h: 0.05, badge: 'new',      isRaiding: false, graduated: false },
]

function TokenCard({ token, isPlaceholder }: { token: Partial<Token>, isPlaceholder?: boolean }) {
  const badgeColor = token.badge === 'hot' ? 'var(--red-b)' : token.badge === 'new' ? 'var(--copper)' : 'var(--grey-l)'
  const badgeBg    = token.badge === 'hot' ? 'rgba(255,51,17,0.15)' : token.badge === 'new' ? 'rgba(184,112,64,0.15)' : 'rgba(255,255,255,0.06)'

  const inner = (
    <div style={{
      background: 'var(--panel)', padding: '1rem', cursor: isPlaceholder ? 'default' : 'crosshair',
      borderTop: token.isRaiding ? '2px solid var(--red-b)' : '2px solid transparent',
      opacity: isPlaceholder ? 0.6 : 1,
      transition: 'opacity 0.2s',
      position: 'relative',
    }}>
      {isPlaceholder && (
        <span style={{ position: 'absolute', top: '6px', right: '6px', fontFamily: 'Share Tech Mono, monospace', fontSize: '8px', color: 'var(--grey)', letterSpacing: '0.08em' }}>DEMO</span>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>🪖</div>
          <div>
            <div style={{ fontFamily: 'Black Ops One, cursive', fontSize: '15px', color: 'var(--cream)' }}>${token.symbol}</div>
            <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '10px', color: 'var(--grey-l)' }}>{token.name}</div>
          </div>
        </div>
        <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: '9px', fontWeight: 700, color: badgeColor, background: badgeBg, border: `1px solid ${badgeColor}`, padding: '2px 7px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          {token.isRaiding ? '⚔ RAID' : token.badge?.toUpperCase()}
        </span>
      </div>

      <div style={{ marginBottom: '0.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
          <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '10px', color: 'var(--grey-l)' }}>{token.bondPercent?.toFixed(0)}%</span>
          <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '10px', color: 'var(--copper)' }}>{token.bondedEth?.toFixed(2)} ETH</span>
        </div>
        <div style={{ height: '4px', background: 'rgba(255,255,255,0.06)' }}>
          <div style={{ height: '100%', width: `${token.bondPercent}%`, background: (token.bondPercent || 0) > 80 ? 'linear-gradient(90deg,var(--red),var(--red-b))' : 'linear-gradient(90deg,var(--copper),var(--gold-b))' }} />
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontFamily: 'Black Ops One, cursive', fontSize: '14px', color: 'var(--copper-l)' }}>${(token.marketCap || 0).toLocaleString()}</div>
          <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '9px', color: 'var(--grey)', textTransform: 'uppercase' }}>mcap</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '12px', color: 'var(--copper)' }}>+{token.volume24h?.toFixed(2)} ETH</div>
          <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '9px', color: 'var(--grey)', textTransform: 'uppercase' }}>24h vol</div>
        </div>
      </div>
    </div>
  )

  if (isPlaceholder) return inner
  return <Link href={`/token/${token.address}`} style={{ textDecoration: 'none', display: 'block' }}>{inner}</Link>
}

export default function TrenchesPage() {
  const [filter, setFilter]   = useState('All')
  const [tokens, setTokens]   = useState<Token[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        setLoading(true)
        const res  = await fetch('/api/tokens')
        const data = await res.json()
        if (!cancelled) setTokens(data.tokens || [])
      } catch (_) {}
      finally { if (!cancelled) setLoading(false) }
    }
    load()
    const interval = setInterval(load, 30000)
    return () => { cancelled = true; clearInterval(interval) }
  }, [])

  const usingPlaceholders = tokens.length < 5
  const displayTokens = usingPlaceholders
    ? [...tokens, ...PLACEHOLDERS.slice(0, Math.max(0, 8 - tokens.length))]
    : tokens

  const filtered = displayTokens.filter((t: any) => {
    const isReal = !!t.address
    const matchSearch = !search || t.name?.toLowerCase().includes(search.toLowerCase()) || t.symbol?.toLowerCase().includes(search.toLowerCase())
    const matchFilter =
      filter === 'All'           ? true :
      filter === 'New'           ? t.badge === 'new' || (t.bondPercent || 0) < 10 :
      filter === 'Trending'      ? (t.bondPercent || 0) > 20 && (t.bondPercent || 0) < 80 :
      filter === 'Hot'           ? (t.volume24h || 0) > 0.1 || t.badge === 'hot' :
      filter === 'Near Breakout' ? (t.bondPercent || 0) >= 75 :
      filter === 'Graduated'     ? t.graduated :
      true
    return matchSearch && matchFilter
  })

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontFamily: 'Black Ops One, cursive', fontSize: '28px', color: 'var(--cream)', margin: '0 0 4px' }}>The Trenches</h1>
          <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '11px', color: 'var(--grey-l)' }}>
            {loading ? 'Loading...' : `${tokens.length} token${tokens.length !== 1 ? 's' : ''} deployed on Base`}
            {usingPlaceholders && !loading && <span style={{ color: 'var(--grey)', marginLeft: '0.5rem' }}>· demo tokens shown until more launch</span>}
          </div>
        </div>
        <input
          type="text" placeholder="Search tokens..." value={search}
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: '1px', background: 'var(--border)' }}>
          {Array.from({ length: 8 }).map((_, i) => <div key={i} style={{ background: 'var(--panel)', height: '160px', opacity: 0.2 }} />)}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div style={{ padding: '4rem', textAlign: 'center', border: '1px solid var(--border)', fontFamily: 'Oswald, sans-serif', fontSize: '14px', color: 'var(--grey-l)' }}>
          No tokens match this filter.
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: '1px', background: 'var(--border)' }}>
          {filtered.map((token: any, i: number) => (
            <TokenCard key={token.address || token.symbol} token={token} isPlaceholder={!token.address} />
          ))}
        </div>
      )}

      {/* Launch CTA */}
      <div style={{ marginTop: '3rem', padding: '2rem', background: 'var(--panel)', border: '1px solid var(--border)', textAlign: 'center' }}>
        <div style={{ fontFamily: 'Black Ops One, cursive', fontSize: '20px', color: 'var(--cream)', marginBottom: '0.5rem' }}>Ready to deploy?</div>
        <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '13px', color: 'var(--grey-l)', marginBottom: '1.25rem' }}>Launch your token for 0.002 ETH · 1B supply · ~$3K starting mcap</div>
        <Link href="/launch" style={{ fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: '14px', color: '#060504', background: 'linear-gradient(135deg,var(--copper),var(--copper-l))', padding: '0.75rem 2rem', textDecoration: 'none', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'inline-block', clipPath: 'polygon(6px 0%,100% 0%,calc(100% - 6px) 100%,0% 100%)' }}>
          Launch A Token →
        </Link>
      </div>
    </div>
  )
}
