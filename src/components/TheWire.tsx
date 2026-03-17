import type { Token } from '../lib/types'

// TODO: fetch from API/indexer — tokens with bondPercent > 80%
const WIRE_TOKENS: Partial<Token>[] = [
  {
    symbol: 'MOLTOV', name: 'Molotov Protocol', emoji: '💀',
    creator: '0x9f244a', bondedEth: 2.83, bondTarget: 3, bondPercent: 94.2,
    marketCap: 12840, volume24h: 0.8, isRaiding: true, raidState: 'active',
  },
  {
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
          <span style={{ fontFamily: 'Black Ops One, cursive', fontSize: '20px', color: 'var(--cream)', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>The Wire</span>
          <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: '10px', fontWeight: 700, color: 'var(--copper)', background: 'rgba(184,112,64,0.1)', border: '1px solid rgba(184,112,64,0.25)', padding: '2px 8px', letterSpacing: '0.12em' }}>Critical</span>
          <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg,var(--border) 0%,transparent 100%)' }} />
          <button style={{ fontFamily: 'Oswald, sans-serif', fontSize: '12px', fontWeight: 600, color: 'var(--copper)', background: 'none', border: 'none', cursor: 'crosshair', letterSpacing: '0.08em', textTransform: 'uppercase' }}>All Tokens →</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '1rem' }}>
          {WIRE_TOKENS.map(token => {
            const isCrit = (token.bondPercent ?? 0) > 85
            return (
              <div key={token.symbol} style={{
                background: 'var(--panel)', border: '1px solid var(--border)',
                padding: '1.5rem', position: 'relative', overflow: 'hidden',
              }}>
                {/* Critical top bar */}
                <div className="animate-crit-glow" style={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
                  background: 'linear-gradient(90deg,var(--red),var(--gold-b))',
                }} />

                {/* Top row */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                  <div>
                    <div style={{ fontFamily: 'Black Ops One, cursive', fontSize: '20px', color: 'var(--cream)', letterSpacing: '0.05em' }}>
                      {token.emoji} ${token.symbol}
                    </div>
                    <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: '13px', color: 'var(--grey-l)' }}>
                      {token.name} · by {token.creator?.slice(0,8)}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                    {token.isRaiding && (
                      <div className="animate-pulse-red" style={{
                        fontFamily: 'Oswald, sans-serif', fontSize: '10px', fontWeight: 700,
                        color: 'var(--red-b)', background: 'rgba(204,34,0,0.1)',
                        border: '1px solid rgba(204,34,0,0.3)', padding: '3px 8px', letterSpacing: '0.12em',
                      }}>
                        ⚔ RAID ACTIVE
                      </div>
                    )}
                    {!token.isRaiding && (
                      <div style={{
                        fontFamily: 'Oswald, sans-serif', fontSize: '10px', fontWeight: 700,
                        color: 'var(--red-b)', background: 'rgba(204,34,0,0.1)',
                        border: '1px solid rgba(204,34,0,0.3)', padding: '3px 8px', letterSpacing: '0.12em',
                      }}>
                        CRITICAL
                      </div>
                    )}
                    <div style={{ fontFamily: 'Black Ops One, cursive', fontSize: '18px', color: 'var(--copper-l)' }}>
                      ${(token.marketCap ?? 0).toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Progress */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '13px', color: 'var(--gold-b)' }}>
                    {token.bondPercent?.toFixed(1)}% Bonded
                  </span>
                  <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '11px', color: 'var(--grey-l)' }}>
                    {token.bondedEth} / {token.bondTarget} ETH
                  </span>
                </div>
                <div style={{ height: '12px', background: 'rgba(184,112,64,0.08)', border: '1px solid rgba(184,112,64,0.15)', position: 'relative', overflow: 'visible' }}>
                  <div className={isCrit ? 'animate-crit-glow' : ''} style={{
                    height: '100%', width: `${token.bondPercent}%`,
                    background: isCrit
                      ? 'linear-gradient(90deg,var(--red),var(--gold-b))'
                      : 'linear-gradient(90deg,var(--copper),var(--copper-l))',
                    position: 'relative',
                  }}>
                    <div style={{
                      position: 'absolute', right: '-2px', top: '-3px', bottom: '-3px',
                      width: '4px', background: 'white',
                      boxShadow: '0 0 8px 3px rgba(255,255,255,0.7)', borderRadius: '2px',
                    }} />
                  </div>
                </div>

                {/* Stats row */}
                <div style={{ display: 'flex', gap: '2rem', marginTop: '0.75rem' }}>
                  <div>
                    <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '12px', color: 'var(--cream)' }}>
                      {((token.bondTarget ?? 3) - (token.bondedEth ?? 0)).toFixed(2)} ETH
                    </div>
                    <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '10px', color: 'var(--grey)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Remaining</div>
                  </div>
                  <div>
                    <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '12px', color: 'var(--cream)' }}>
                      +{token.volume24h} ETH
                    </div>
                    <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '10px', color: 'var(--grey)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>24h Vol</div>
                  </div>
                  <div>
                    <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '12px', color: token.isRaiding ? 'var(--red-b)' : 'var(--gold-b)' }}>
                      {token.isRaiding ? '⚔ RAIDING' : '⚡ HOT'}
                    </div>
                    <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '10px', color: 'var(--grey)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Status</div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
