'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import type { Token } from '../lib/types'

export function TheWire() {
  const [tokens, setTokens] = useState<Token[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await fetch('/api/tokens')
        const data = await res.json()
        if (!cancelled) {
          const wire = (data.tokens || [])
            .filter((t: Token) => t.bondPercent >= 75 && !t.graduated)
            .sort((a: Token, b: Token) => b.bondPercent - a.bondPercent)
            .slice(0, 2)
          setTokens(wire)
        }
      } catch (_) {}
      finally { if (!cancelled) setLoading(false) }
    }
    load()
    const interval = setInterval(load, 30000)
    return () => { cancelled = true; clearInterval(interval) }
  }, [])

  const slots = loading ? [null, null] : tokens.length >= 2 ? tokens : [...tokens, ...Array(2 - tokens.length).fill(null)]

  return (
    <section style={{ padding: '2.5rem 2rem' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <span style={{ fontFamily: 'Black Ops One, cursive', fontSize: '20px', color: 'var(--cream)' }}>The Wire</span>
          <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: '10px', fontWeight: 700, color: 'var(--red-b)', background: 'rgba(255,51,17,0.1)', border: '1px solid rgba(255,51,17,0.3)', padding: '2px 8px', letterSpacing: '0.1em' }}>Critical</span>
          <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg,var(--border),transparent)' }} />
          <Link href="/trenches" style={{ fontFamily: 'Oswald, sans-serif', fontSize: '11px', fontWeight: 700, color: 'var(--copper)', letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none' }}>ALL TOKENS →</Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          {slots.map((token, i) =>
            token ? (
              <Link key={(token as Token).address} href={`/token/${(token as Token).address}`} style={{ textDecoration: 'none', display: 'block' }}>
                <WireCard token={token as Token} />
              </Link>
            ) : (
              <div key={i} style={{ background: 'var(--panel)', border: '1px solid var(--border)', padding: '1.25rem', minHeight: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: loading ? 0.3 : 0.6 }}>
                {!loading && <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: '12px', color: 'var(--grey)' }}>No critical tokens right now</span>}
              </div>
            )
          )}
        </div>
      </div>
    </section>
  )
}

function WireCard({ token }: { token: Token }) {
  return (
    <div style={{ background: 'var(--panel)', border: `1px solid ${token.isRaiding ? 'rgba(255,51,17,0.4)' : 'var(--border)'}`, padding: '1.25rem', cursor: 'crosshair', position: 'relative', overflow: 'hidden' }}>
      {token.isRaiding && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg,var(--red),var(--red-b),var(--red))' }} />}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {token.imageUrl
            ? <img src={token.imageUrl} alt={token.symbol} style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} />
            : <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--bg)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>🪖</div>
          }
          <div>
            <div style={{ fontFamily: 'Black Ops One, cursive', fontSize: '18px', color: 'var(--gold-b)' }}>${token.symbol}</div>
            <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '11px', color: 'var(--grey-l)' }}>{token.name} · by {token.creator?.slice(0,8)}...</div>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: '10px', fontWeight: 700, color: token.isRaiding ? 'var(--red-b)' : 'var(--copper)', background: token.isRaiding ? 'rgba(255,51,17,0.15)' : 'rgba(184,112,64,0.1)', border: `1px solid ${token.isRaiding ? 'rgba(255,51,17,0.4)' : 'rgba(184,112,64,0.3)'}`, padding: '3px 8px', letterSpacing: '0.1em' }}>
            {token.isRaiding ? '⚔ RAID ACTIVE' : 'CRITICAL'}
          </span>
          <div style={{ fontFamily: 'Black Ops One, cursive', fontSize: '20px', color: 'var(--copper-l)', marginTop: '4px' }}>{token.bondPercent.toFixed(1)}%</div>
        </div>
      </div>
      <div style={{ marginBottom: '0.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: '12px', color: 'var(--grey-l)' }}>{token.bondedEth.toFixed(3)} / {token.bondTarget} ETH bonded</span>
          <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '11px', color: 'var(--copper)' }}>{(token.bondTarget - token.bondedEth).toFixed(3)} ETH left</span>
        </div>
        <div style={{ height: '6px', background: 'rgba(255,255,255,0.08)' }}>
          <div style={{ height: '100%', width: `${token.bondPercent}%`, background: token.bondPercent > 90 ? 'linear-gradient(90deg,var(--red),var(--red-b))' : 'linear-gradient(90deg,var(--copper),var(--gold-b))' }} />
        </div>
      </div>
    </div>
  )
}
