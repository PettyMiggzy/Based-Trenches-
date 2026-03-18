'use client'
import { GRAD_FLOW } from '../../lib/types'

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div style={{ marginBottom: '3rem' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
      <span style={{ fontFamily: 'Black Ops One, cursive', fontSize: '18px', color: 'var(--cream)' }}>{title}</span>
      <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg,var(--border),transparent)' }} />
    </div>
    {children}
  </div>
)

const Card = ({ title, value, sub }: { title: string; value: string; sub?: string }) => (
  <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', padding: '1rem 1.25rem' }}>
    <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '10px', color: 'var(--grey)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '4px' }}>{title}</div>
    <div style={{ fontFamily: 'Black Ops One, cursive', fontSize: '18px', color: 'var(--gold-b)' }}>{value}</div>
    {sub && <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '11px', color: 'var(--grey-l)', marginTop: '2px' }}>{sub}</div>}
  </div>
)

const Row = ({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
    <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: '13px', color: 'var(--grey-l)' }}>{label}</span>
    <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '13px', color: highlight ? 'var(--gold-b)' : 'var(--copper)' }}>{value}</span>
  </div>
)

export default function DocsPage() {
  return (
    <div style={{ padding: '2.5rem 2rem' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '3rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
            <span style={{ fontFamily: 'Black Ops One, cursive', fontSize: '28px', color: 'var(--cream)' }}>HQ Docs</span>
            <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: '10px', fontWeight: 700, color: 'var(--copper)', background: 'rgba(184,112,64,0.1)', border: '1px solid rgba(184,112,64,0.25)', padding: '2px 8px', letterSpacing: '0.12em' }}>v1.0</span>
          </div>
          <p style={{ fontFamily: 'Oswald, sans-serif', fontSize: '15px', color: 'var(--grey-l)', lineHeight: 1.6, maxWidth: '600px' }}>
            Based Trenches is a memecoin launchpad on Base Chain. Tokens bond to 3 ETH on a smooth curve, graduate to Uniswap V3 LP, and feed a global jackpot. Every holder has skin in the game.
          </p>
        </div>

        {/* Key Numbers */}
        <Section title="Key Numbers">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginBottom: '1rem' }}>
            <Card title="Launch Fee" value="0.002 ETH" sub="One-time per token" />
            <Card title="Total Supply" value="1B" sub="Per token" />
            <Card title="Curve Target" value="3 ETH" sub="To graduate" />
            <Card title="Buy / Sell Fee" value="2%" sub="Both sides" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
            <Card title="Curve Allocation" value="800M" sub="80% on bonding curve" />
            <Card title="LP Allocation" value="200M" sub="20% to Uniswap V3" />
            <Card title="Grad LP ETH" value="2.5 ETH" sub="Seeded to Uniswap" />
            <Card title="War Chest Max" value="2 ETH" sub="Global jackpot cap" />
          </div>
        </Section>

        {/* Launch */}
        <Section title="Launching a Token">
          <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', padding: '1.5rem', marginBottom: '1rem' }}>
            <p style={{ fontFamily: 'Oswald, sans-serif', fontSize: '14px', color: 'var(--grey-l)', lineHeight: 1.7, marginBottom: '1rem' }}>
              Anyone can launch a token by paying the <strong style={{ color: 'var(--copper)' }}>0.002 ETH</strong> launch fee. Your token gets 1,000,000,000 supply, a smooth bonding curve, and its own Armory vault — all deployed automatically on Base Chain.
            </p>
            <Row label="Name + Symbol" value="Required" />
            <Row label="Description / Image / Socials" value="Optional but recommended" />
            <Row label="Launch fee" value="0.002 ETH" highlight />
            <Row label="Token supply" value="1,000,000,000" />
            <Row label="Curve allocation" value="800,000,000 (80%)" />
            <Row label="LP allocation" value="200,000,000 (20%)" />
          </div>
        </Section>

        {/* Fees */}
        <Section title="Fee Structure">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', padding: '1.5rem' }}>
              <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '12px', fontWeight: 700, color: '#3a9948', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1rem' }}>Buy Fee — 2%</div>
              <Row label="Creator fee" value="1%" highlight />
              <Row label="Platform fee" value="1%" />
              <div style={{ marginTop: '0.75rem', padding: '0.5rem 0.75rem', background: 'rgba(58,153,72,0.08)', border: '1px solid rgba(58,153,72,0.2)' }}>
                <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '11px', color: '#3a9948' }}>With referral: 1% creator · 0.98% platform · 0.02% referrer</div>
              </div>
            </div>
            <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', padding: '1.5rem' }}>
              <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '12px', fontWeight: 700, color: 'var(--red-b)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1rem' }}>Sell Fee — 2%</div>
              <Row label="Platform buffer" value="1%" />
              <Row label="Armory Vault" value="1%" highlight />
            </div>
          </div>
        </Section>

        {/* Graduation */}
        <Section title="Graduation at 3 ETH">
          <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', padding: '1.5rem' }}>
            <p style={{ fontFamily: 'Oswald, sans-serif', fontSize: '14px', color: 'var(--grey-l)', lineHeight: 1.7, marginBottom: '1rem' }}>
              When a token bonds 3 ETH on the curve it graduates. A Uniswap V3 LP position is created automatically, and rewards are distributed.
            </p>
            <Row label="Uniswap V3 LP seeded" value="2.5 ETH + 200M tokens" highlight />
            <Row label="Creator payout" value="0.25 ETH" />
            <Row label="Platform payout" value="0.25 ETH" />
            <Row label="LP owned by" value="Protocol Vault (forever)" />
          </div>
        </Section>

        {/* War Chest */}
        <Section title="War Chest — Global Jackpot">
          <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', padding: '1.5rem', marginBottom: '1rem' }}>
            <p style={{ fontFamily: 'Oswald, sans-serif', fontSize: '14px', color: 'var(--grey-l)', lineHeight: 1.7, marginBottom: '1rem' }}>
              The War Chest is a global jackpot fed by Uniswap V3 fees from graduated tokens. It activates at <strong style={{ color: 'var(--copper)' }}>1 ETH</strong> and pays out up to <strong style={{ color: 'var(--copper)' }}>2 ETH</strong> when triggered.
            </p>
            <Row label="Activates at" value="1 ETH" />
            <Row label="Max payout" value="2 ETH" highlight />
            <Row label="Liquidity boost (40%)" value="→ Uniswap V3 LP" />
            <Row label="Top 10 holders (20%)" value="Pro-rata by balance" />
            <Row label="Last buyer (10%)" value="Most recent buyer" />
            <Row label="Fortify pool (5%)" value="→ Staking rewards" />
            <Row label="Armory (5%)" value="→ Token treasury" />
            <Row label="Platform (20%)" value="→ Operations" />
          </div>
        </Section>

        {/* Raids */}
        <Section title="Raids">
          <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', padding: '1.5rem' }}>
            <p style={{ fontFamily: 'Oswald, sans-serif', fontSize: '14px', color: 'var(--grey-l)', lineHeight: 1.7, marginBottom: '1rem' }}>
              Raids are momentum signals — they fire when a token gets heavy buy pressure in a short window. They appear in the War Room feed as a signal to the community.
            </p>
            <Row label="Trigger 1" value="5 buys in 90 seconds" highlight />
            <Row label="Trigger 2" value="0.5 ETH volume in 3 minutes" highlight />
          </div>
        </Section>

        {/* Fortify */}
        <Section title="Fortify — Staking">
          <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', padding: '1.5rem', marginBottom: '1rem' }}>
            <p style={{ fontFamily: 'Oswald, sans-serif', fontSize: '14px', color: 'var(--grey-l)', lineHeight: 1.7, marginBottom: '1rem' }}>
              Stake tokens in Fortify to earn ETH rewards from sell fees, Armory payouts, and War Chest distributions. Longer lockups earn higher multipliers.
            </p>
            <Row label="30 days" value="1x multiplier" />
            <Row label="60 days" value="1.5x multiplier" />
            <Row label="90 days" value="2x multiplier" highlight />
            <Row label="180 days" value="3x multiplier" highlight />
            <Row label="Early unstake penalty" value="10% of rewards → pool" />
          </div>
        </Section>

        {/* Contracts */}
        <Section title="Contracts (Base Chain)">
          <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', padding: '1.5rem' }}>
            {[
              ['Factory', process.env.NEXT_PUBLIC_FACTORY_ADDRESS || '—'],
              ['War Chest', process.env.NEXT_PUBLIC_WAR_CHEST_ADDRESS || '—'],
            ].map(([label, addr]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: '13px', color: 'var(--grey-l)' }}>{label}</span>
                <a href={`https://basescan.org/address/${addr}`} target="_blank" rel="noopener noreferrer"
                  style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '11px', color: 'var(--copper)', textDecoration: 'none' }}>
                  {addr?.slice(0, 6)}...{addr?.slice(-4)} ↗
                </a>
              </div>
            ))}
          </div>
        </Section>

      </div>
    </div>
  )
}
