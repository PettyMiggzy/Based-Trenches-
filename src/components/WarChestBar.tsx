'use client'
// TODO: Replace mock data with useWarChest() hook pulling from contract/indexer

const mockWarChest = {
  balance: 1.74,
  maxPayout: 2,
  active: true,
}

export function WarChestBar() {
  const pct = (mockWarChest.balance / mockWarChest.maxPayout) * 100

  return (
    <div style={{
      padding: '1.25rem 2rem',
      background: 'var(--panel)',
      borderBottom: '1px solid var(--border)',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Diagonal stripe */}
      <div className="stripe-overlay" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', position: 'relative', zIndex: 1, flexWrap: 'wrap' }}>
        {/* Label */}
        <div style={{ minWidth: '160px' }}>
          <div style={{ fontFamily: 'Black Ops One, cursive', fontSize: '18px', color: 'var(--gold-b)', letterSpacing: '0.04em' }}>
            ⚡ War Chest
          </div>
          <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '10px', color: 'var(--gold)', letterSpacing: '0.12em', marginTop: '2px' }}>
            GLOBAL JACKPOT · BASE CHAIN
          </div>
        </div>

        {/* Progress */}
        <div style={{ flex: 1, minWidth: '200px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontFamily: 'Black Ops One, cursive', fontSize: '16px', color: 'var(--gold-b)' }}>
              {mockWarChest.balance} ETH
            </span>
            <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '11px', color: 'var(--grey-l)' }}>
              MAX PAYOUT: {mockWarChest.maxPayout} ETH
            </span>
          </div>
          <div style={{ height: '10px', background: 'rgba(200,144,10,0.08)', border: '1px solid rgba(200,144,10,0.15)', position: 'relative', overflow: 'visible' }}>
            <div style={{
              height: '100%', width: `${pct}%`,
              background: 'linear-gradient(90deg,var(--gold),var(--gold-b))',
              position: 'relative',
            }}>
              <div style={{
                position: 'absolute', right: '-2px', top: '-3px', bottom: '-3px',
                width: '4px', background: 'white',
                boxShadow: '0 0 8px 3px rgba(255,255,255,0.7)', borderRadius: '2px',
              }} />
            </div>
          </div>
        </div>

        {/* Payout pills */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {[['50%','Liq Boost'],['30%','Random Buyers'],['20%','Last Buyer']].map(([pct, label]) => (
            <div key={label} style={{
              fontFamily: 'Share Tech Mono, monospace', fontSize: '10px',
              padding: '4px 10px', border: '1px solid rgba(200,144,10,0.25)',
              background: 'rgba(200,144,10,0.06)', color: 'var(--gold)',
              letterSpacing: '0.05em', whiteSpace: 'nowrap',
            }}>
              <strong style={{ color: 'var(--gold-b)' }}>{pct}</strong> {label}
            </div>
          ))}
        </div>

        {/* Status */}
        {mockWarChest.active && (
          <div className="animate-pulse-red" style={{
            fontFamily: 'Oswald, sans-serif', fontSize: '11px', fontWeight: 700,
            color: 'var(--gold-b)', letterSpacing: '0.15em',
            background: 'rgba(240,176,32,0.12)', border: '1px solid rgba(240,176,32,0.3)',
            padding: '4px 12px', whiteSpace: 'nowrap',
          }}>
            ⚡ ACTIVE — NEXT BREAKOUT WINS
          </div>
        )}
      </div>
    </div>
  )
}
