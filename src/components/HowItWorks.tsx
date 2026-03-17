const STEPS = [
  {
    n: '01',
    title: 'Deploy Your Token',
    desc: 'Pay 0.002 ETH. Your token launches on the bonding curve with 1B supply. 800M available to buy immediately at the starting price.',
  },
  {
    n: '02',
    title: 'Bond To 3 ETH',
    desc: 'Buyers accumulate ETH on a smooth curve. Buy fee: 1% to you as creator, 1% to platform buffer. Sell fee: 1% platform, 1% to your token\'s Armory.',
  },
  {
    n: '03',
    title: 'Break Out',
    desc: 'At exactly 3 ETH bonded: Uniswap V3 pool created with 2.5 ETH + 200M tokens. You receive 0.25 ETH. Platform gets 0.25 ETH.',
  },
  {
    n: '04',
    title: 'Win The War Chest',
    desc: 'If the chest is active (≥1 ETH) when your token breaks out, it wins up to 2 ETH — split 50% liquidity boost, 30% random buyers, 20% last buyer.',
  },
  {
    n: '05',
    title: 'Fortify & Armory',
    desc: 'Post-graduation: holders stake for yield via Fortify (0.4% of Uni fees). Armory treasury runs monthly buybacks or adds liquidity by community vote.',
  },
]

export function HowItWorks() {
  return (
    <section style={{ padding: '2.5rem 2rem' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <span style={{ fontFamily: 'Black Ops One, cursive', fontSize: '20px', color: 'var(--cream)', letterSpacing: '0.04em' }}>How It Works</span>
          <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg,var(--border),transparent)' }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: '1px', background: 'var(--border)', border: '1px solid var(--border)' }}>
          {STEPS.map(step => (
            <div key={step.n} style={{ background: 'var(--panel)', padding: '1.75rem 1.25rem' }}>
              <div style={{ fontFamily: 'Black Ops One, cursive', fontSize: '36px', color: 'rgba(184,112,64,0.12)', lineHeight: 1, marginBottom: '0.75rem' }}>
                {step.n}
              </div>
              <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '14px', fontWeight: 700, color: 'var(--copper)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                {step.title}
              </div>
              <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: '13px', color: 'var(--grey-l)', lineHeight: 1.5 }}>
                {step.desc}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
