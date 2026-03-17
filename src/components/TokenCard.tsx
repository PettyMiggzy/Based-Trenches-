import Link from 'next/link'
import type { Token } from '../lib/types'

const BADGE_STYLES: Record<string, { color: string; bg: string; border: string }> = {
  trending: { color: 'var(--copper)',  bg: 'rgba(184,112,64,0.1)',  border: 'rgba(184,112,64,0.25)' },
  hot:      { color: 'var(--gold-b)', bg: 'rgba(240,176,32,0.1)', border: 'rgba(240,176,32,0.25)' },
  new:      { color: 'var(--cyan)',   bg: 'rgba(26,184,176,0.1)',  border: 'rgba(26,184,176,0.25)' },
  raid:     { color: 'var(--red-b)',  bg: 'rgba(204,34,0,0.1)',    border: 'rgba(204,34,0,0.25)' },
}

interface Props {
  token: Token
}

export function TokenCard({ token }: Props) {
  const badge = token.badge ? BADGE_STYLES[token.badge] : null

  return (
    <Link
      href={`/token/${token.address}`}
      className="token-card-top-border"
      style={{
        display: 'block',
        background: 'var(--panel)',
        border: '1px solid var(--border)',
        padding: '1rem',
        position: 'relative',
        overflow: 'hidden',
        textDecoration: 'none',
        transition: 'background 0.2s',
      }}
    >
      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <span style={{ fontSize: '28px', lineHeight: 1 }}>{token.emoji}</span>
        {badge && token.badge && (
          <span style={{
            fontFamily: 'Oswald, sans-serif', fontSize: '9px', fontWeight: 700,
            padding: '2px 6px', letterSpacing: '0.1em', textTransform: 'uppercase',
            color: badge.color, background: badge.bg,
            border: `1px solid ${badge.border}`,
          }}>
            {token.badge === 'raid' ? '⚔ Raid' : token.badge.toUpperCase()}
          </span>
        )}
      </div>

      <div style={{ fontFamily: 'Black Ops One, cursive', fontSize: '14px', color: 'var(--cream)', marginBottom: '2px' }}>
        ${token.symbol}
      </div>
      <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '10px', color: 'var(--grey)' }}>
        by {token.creator.slice(0,6)}...{token.creator.slice(-4)}
      </div>

      {/* Progress */}
      <div style={{ margin: '0.75rem 0' }}>
        <div style={{ height: '6px', background: 'rgba(184,112,64,0.08)', border: '1px solid rgba(184,112,64,0.15)', position: 'relative', overflow: 'visible' }}>
          <div style={{
            height: '100%', width: `${token.bondPercent}%`,
            background: 'linear-gradient(90deg,var(--copper),var(--copper-l))',
            position: 'relative',
          }}>
            <div style={{
              position: 'absolute', right: '-2px', top: '-2px', bottom: '-2px',
              width: '3px', background: 'white',
              boxShadow: '0 0 6px 2px rgba(255,255,255,0.6)', borderRadius: '2px',
            }} />
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
          <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '10px', color: 'var(--copper)' }}>
            {token.bondPercent.toFixed(0)}%
          </span>
          <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '10px', color: 'var(--grey-l)' }}>
            {token.bondedEth.toFixed(2)} ETH
          </span>
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div style={{ fontFamily: 'Black Ops One, cursive', fontSize: '15px', color: 'var(--copper-l)' }}>
          ${token.marketCap.toLocaleString()}
          <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '10px', color: 'var(--copper)' }}> mcap</span>
        </div>
        <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '10px', color: 'var(--grey-l)', textAlign: 'right' }}>
          +{token.volume24h.toFixed(2)} ETH
          <span style={{ color: 'var(--grey)', display: 'block' }}>24h vol</span>
        </div>
      </div>
    </Link>
  )
}
