'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import type { Token } from '../lib/types'

const FILTERS = ['Trending', 'New', 'Raids', 'Hot', 'Near Breakout']

const PLACEHOLDER_TOKENS: Partial<Token>[] = [
  { address: '', symbol: 'WARZ',   name: 'War Zone',         bondPercent: 71,  bondedEth: 2.13, bondTarget: 3, marketCap: 8940,  volume24h: 0.6,  badge: 'trending', isRaiding: true  },
  { address: '', symbol: 'APEWAR', name: 'Ape War',           bondPercent: 55,  bondedEth: 1.65, bondTarget: 3, marketCap: 6220,  volume24h: 0.3,  badge: 'hot',      isRaiding: false },
  { address: '', symbol: 'BUNKER', name: 'Bunker Protocol',   bondPercent: 38,  bondedEth: 1.14, bondTarget: 3, marketCap: 4820,  volume24h: 0.2,  badge: 'trending', isRaiding: false },
  { address: '', symbol: 'SAPPER', name: 'Sapper Labs',       bondPercent: 12,  bondedEth: 0.36, bondTarget: 3, marketCap: 3480,  volume24h: 0.1,  badge: 'new',      isRaiding: false },
  { address: '', symbol: 'RECON',  name: 'Recon Ops',         bondPercent: 62,  bondedEth: 1.86, bondTarget: 3, marketCap: 7200,  volume24h: 0.35, badge: 'trending', isRaiding: false },
  { address: '', symbol: 'TACTIQ', name: 'Tactical IQ',       bondPercent: 46,  bondedEth: 1.38, bondTarget: 3, marketCap: 5520,  volume24h: 0.22, badge: 'hot',      isRaiding: false },
  { address: '', symbol: 'FLANK',  name: 'Flank Movement',    bondPercent: 7,   bondedEth: 0.21, bondTarget: 3, marketCap: 2800,  volume24h: 0.05, badge: 'new',      isRaiding: false },
  { address: '', symbol: 'SURGE',  name: 'Surge Protocol',    bondPercent: 80,  bondedEth: 2.40, bondTarget: 3, marketCap: 9600,  volume24h: 0.5,  badge: 'hot',      isRaiding: true  },
]

function MiniCard({ token, isPlaceholder }: { token: Partial<Token>, isPlaceholder?: boolean }) {
  const badgeColor = token.isRaiding ? 'var(--red-b)' : token.badge === 'hot' ? 'var(--red-b)' : token.badge === 'new' ? 'var(--copper)' : 'var(--grey-l)'

  const inner = (
    <div style={{
      background: 'var(--panel)', padding: '1rem',
      borderTop: token.isRaiding ? '2px solid var(--red-b)' : '2px solid transparent',
      opacity: isPlaceholder ? 0.6 : 1, cursor: isPlaceholder ? 'default' : 'crosshair',
      position: 'relative',
    }}>
      {isPlaceholder && <span style={{ position: 'absolute', top: '6px', right: '6px', fontFamily: 'Share Tech Mono, monospace', fontSize: '8px', color: 'var(--grey)' }}>DEMO</span>}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {token.imageUrl ? (
            <img src={token.imageUrl} alt={token.symbol || ''} style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border)', flexShrink: 0 }} />
          ) : (
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--bg)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', flexShrink: 0 }}>🪖</div>
          )}
          <div>
            <div style={{ fontFamily: 'Black Ops One, cursive', fontSize: '14px', color: 'var(--cream)' }}>${token.symbol}</div>
            <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '10px', color: 'var(--grey-l)' }}>{token.name}</div>
          </div>
        </div>
        <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: '9px', fontWeight: 700, color: badgeColor, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          {token.isRaiding ? '⚔ RAID' : token.badge}
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
        <span style={{ fontFamily: 'Black Ops One, cursive', fontSize: '13px', color: 'var(--copper-l)' }}>${(token.marketCap || 0).toLocaleString()}</span>
        <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '10px', color: 'var(--copper)' }}>+{token.volume24h?.toFixed(2)} ETH</span>
      </div>
    </div>
  )

  if (isPlaceholder) return inner
  return <Link href={`/token/${token.address}`} style={{ textDecoration: 'none', display: 'block' }}>{inner}</Link>
}

export function TrendingTrenches() {
  const [activeFilter, setActiveFilter] = useState('Trending')
  const [tokens, setTokens] = useState<Token[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
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
  const allDisplay = usingPlaceholders
    ? [...tokens, ...PLACEHOLDER_TOKENS.slice(0, Math.max(0, 8 - tokens.length))]
    : tokens

  const filtered = allDisplay.filter((t: any) => {
    if (activeFilter === 'New')           return (t.bondPercent || 0) < 15 || t.badge === 'new'
    if (activeFilter === 'Raids')         return t.isRaiding
    if (activeFilter === 'Hot')           return t.badge === 'hot' || (t.volume24h || 0) > 0.2
    if (activeFilter === 'Near Breakout') return (t.bondPercent || 0) >= 75
    return true
  }).slice(0, 8)

  return (
    <section style={{ padding: '2.5rem 2rem' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <span style={{ fontFamily: 'Black Ops One, cursive', fontSize: '20px', color: 'var(--cream)' }}>Trending Trenches</span>
          <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg,var(--border),transparent)' }} />
          {usingPlaceholders && !loading && <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '9px', color: 'var(--grey)' }}>DEMO</span>}
          <Link href="/trenches" style={{ fontFamily: 'Oswald, sans-serif', fontSize: '11px', fontWeight: 700, color: 'var(--copper)', letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none' }}>VIEW ALL →</Link>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          {FILTERS.map(f => (
            <button key={f} onClick={() => setActiveFilter(f)} style={{ fontFamily: 'Oswald, sans-serif', fontSize: '11px', fontWeight: 700, color: activeFilter === f ? '#060504' : 'var(--grey-l)', background: activeFilter === f ? 'var(--copper)' : 'transparent', border: `1px solid ${activeFilter === f ? 'var(--copper)' : 'rgba(255,255,255,0.1)'}`, padding: '4px 12px', letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'crosshair' }}>
              {f}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: '1px', background: 'var(--border)' }}>
            {Array.from({ length: 8 }).map((_, i) => <div key={i} style={{ background: 'var(--panel)', height: '140px', opacity: 0.2 }} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '2rem', border: '1px solid var(--border)', textAlign: 'center', fontFamily: 'Oswald, sans-serif', fontSize: '13px', color: 'var(--grey-l)' }}>
            No {activeFilter.toLowerCase()} tokens right now.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: '1px', background: 'var(--border)' }}>
            {filtered.map((token: any, i: number) => (
              <MiniCard key={token.address || token.symbol + i} token={token} isPlaceholder={!token.address} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
