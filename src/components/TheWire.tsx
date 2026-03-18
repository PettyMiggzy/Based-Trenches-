'use client'
import Link from 'next/link'
import type { Token } from '../lib/types'

// TODO: fetch from API/indexer — tokens with bondPercent > 80%
const WIRE_TOKENS: Partial<Token>[] = [
  {
    address: '0x9f244a0000000000000000000000000000000001',
    symbol: 'MOLTOV', name: 'Molotov Protocol', emoji: '💀',
    creator: '0x9f244a', bondedEth: 2.83, bondTarget: 3, bondPercent: 94.2,
    marketCap: 12840, volume24h: 0.8, isRaiding: true, raidState: 'active',
  },
  {
    address: '0x3b7c210000000000000000000000000000000002',
    symbol: 'TRENCH', name: 'TrenchWars DAO', emoji: '🎯',
    creator: '0x3b7c21', bondedEth: 2.63, bondTarget: 3, bondPercent: 87.6,
    marketCap: 11200, volume24h: 0.4, isRaiding: false,
  },
]

export function TheWire() {
  return (
    <section style={{ padding: '2.5rem 2rem' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        {/* Section header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <span style={{ fontFamily: 'Black Ops One, cursive', fontSize: '20px', color: 'var(--cream)' }}>The Wire</span>
          <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: '10px', fontWeight: 700, color: 'var(--red-b)', background: 'rgba(255,51,17,0.1)', border: '1px solid rgba(255,51,17,0.3)', padding: '2px 8px', letterSpacing: '0.1em' }}>Critical</span>
          <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg,var(--border),transparent)' }} />
          <Link href="/trenches" style={{ fontFamily: 'Oswald, sans-serif', fontSize: '11px', fontWeight: 700, color: 'var(--copper)', letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none' }}>
            ALL TOKENS →
          </Link>
        </div>

        {/* Wire cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          {WIRE_TOKENS.map(token => (
            <Link
              key={token.address}
              href={`/token/${token.address}`}
              style={{ textDecoration: 'none', display: 'block' }}
            >
              <div style={{
                background: 'var(--panel)', border: `1px solid ${token.isRaiding ? 'rgba(255,51,17,0.4)' : 'var(--border)'}`,
                padding: '1.25rem', cursor: 'crosshair', transition: 'border-color 0.2s',
                position: 'relative', overflow: 'hidden',
              }}>
                {/* Raid indicator bar */}
                {token.isRaiding && (
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg,var(--red),var(--red-b),var(--red))', animation: 'pulse 1s infinite' }} />
                )}

                {/* Header row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '24px' }}>{token.emoji}</span>
                    <div>
                      <div style={{ fontFamily: 'Black Ops One, cursive', fontSize: '18px', color: 'var(--gold-b)' }}>${token.symbol}</div>
                      <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '11px', color: 'var(--grey-l)' }}>{token.name} · by 0x{token.creator?.slice(-6)}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    {token.isRaiding ? (
                      <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: '10px', fontWeight: 700, color: 'var(--red-b)', background: 'rgba(255,51,17,0.15)', border: '1px solid rgba(255,51,17,0.4)', padding: '3px 8px', letterSpacing: '0.1em' }}>
                        ⚔ RAID ACTIVE
                      </span>
                    ) : (
                      <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: '10px', fontWeight: 700, color: 'var(--copper)', background: 'rgba(184,112,64,0.1)', border: '1px solid rgba(184,112,64,0.3)', padding: '3px 8px', letterSpacing: '0.1em' }}>
                        CRITICAL
                      </span>
                    )}
                    <div style={{ fontFamily: 'Black Ops One, cursive', fontSize: '20px', color: 'var(--copper-l)', marginTop: '4px' }}>
                      ${token.marketCap?.toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Bond progress */}
                <div style={{ marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: '12px', color: 'var(--grey-l)' }}>{token.bondPercent?.toFixed(1)}% Bonded</span>
                    <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '11px', color: 'var(--copper)' }}>{token.bondedEth?.toFixed(2)} / 3 ETH</span>
                  </div>
                  <div style={{ height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '0' }}>
                    <div style={{ height: '100%', width: `${token.bondPercent}%`, background: token.bondPercent! > 90 ? 'linear-gradient(90deg,var(--red),var(--red-b))' : 'linear-gradient(90deg,var(--copper),var(--gold-b))' }} />
                  </div>
                </div>

                {/* Stats row */}
                <div style={{ display: 'flex', gap: '1.5rem' }}>
                  <div>
                    <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '11px', color: 'var(--copper)' }}>{(3 - (token.bondedEth || 0)).toFixed(2)} ETH</div>
                    <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '9px', color: 'var(--grey)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Remaining</div>
                  </div>
                  <div>
                    <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '11px', color: 'var(--copper)' }}>+{token.volume24h?.toFixed(1)} ETH</div>
                    <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '9px', color: 'var(--grey)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>24h Vol</div>
                  </div>
                  <div>
                    <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '11px', color: token.isRaiding ? 'var(--red-b)' : 'var(--gold-b)', fontWeight: 700 }}>
                      {token.isRaiding ? '⚔ RAIDING' : '⚡ HOT'}
                    </div>
                    <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '9px', color: 'var(--grey)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Status</div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
