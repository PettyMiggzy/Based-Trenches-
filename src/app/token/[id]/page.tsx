'use client'
import { useState } from 'react'
import { CombatLog } from '../../../components/CombatLog'
import { GRAD_FLOW } from '../../../lib/types'

const TABS = ['Overview','Trade','Fortify','Armory','Feed']

// TODO: fetch real token data using params.id
const TOKEN = {
  symbol: 'MOLTOV', name: 'Molotov Protocol', emoji: '💣',
  creator: '0x9f244a0000000000000000000000000000000000',
  bondedEth: 2.83, bondPercent: 94.2, marketCap: 12840, volume24h: 0.8,
  isRaiding: true, armoryBalance: 0.42,
}

export default function TokenPage({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState('Overview')
  const [tradeMode, setTradeMode] = useState<'buy'|'sell'>('buy')
  const [amount, setAmount] = useState('0.1')
  const [voteSelected, setVoteSelected] = useState<'buyback'|'liq'>('buyback')

  const amtNum = parseFloat(amount) || 0

  return (
    <div>
      {/* ── TOKEN HEADER ── */}
      <div style={{ background: 'var(--panel)', borderBottom: '1px solid var(--border)', padding: '1.5rem 2rem' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', alignItems: 'flex-start', gap: '2rem', flexWrap: 'wrap' }}>
          <div style={{ width: '72px', height: '72px', background: 'rgba(184,112,64,0.1)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', flexShrink: 0 }}>
            {TOKEN.emoji}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'Black Ops One, cursive', fontSize: '28px', color: 'var(--cream)', letterSpacing: '0.05em' }}>${TOKEN.symbol}</div>
            <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: '15px', color: 'var(--grey-l)', marginBottom: '0.5rem' }}>{TOKEN.name} · by {TOKEN.creator.slice(0,6)}...{TOKEN.creator.slice(-4)}</div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {['𝕏 Twitter','TG Telegram','🌐 Website'].map(s => (
                <button key={s} style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '10px', color: 'var(--grey-l)', background: 'rgba(184,112,64,0.06)', border: '1px solid var(--border)', padding: '4px 10px', cursor: 'crosshair', transition: 'all 0.2s' }}>{s}</button>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
            {[
              { v:`$${TOKEN.marketCap.toLocaleString()}`, l:'Market Cap' },
              { v:`${TOKEN.bondPercent}%`, l:'Bonded', color:'var(--gold-b)' },
              { v:`+${TOKEN.volume24h} ETH`, l:'24h Volume' },
              { v:'⚔ RAIDING', l:'Status', color:'var(--red-b)' },
            ].map(s => (
              <div key={s.l}>
                <div style={{ fontFamily: 'Black Ops One, cursive', fontSize: '18px', color: s.color ?? 'var(--copper-l)' }}>{s.v}</div>
                <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '9px', color: 'var(--grey)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{s.l}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button onClick={() => setActiveTab('Trade')} className="btn-clip" style={{ fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: '14px', color: '#060504', background: 'linear-gradient(135deg,var(--copper),var(--copper-l))', border: 'none', padding: '0.65rem 1.75rem', letterSpacing: '0.1em', cursor: 'crosshair', textTransform: 'uppercase' }}>Trade</button>
            <button className="btn-clip" style={{ fontFamily: 'Oswald, sans-serif', fontWeight: 600, fontSize: '14px', color: 'var(--copper)', background: 'transparent', border: '1px solid rgba(184,112,64,0.4)', padding: '0.65rem 1.75rem', letterSpacing: '0.1em', cursor: 'crosshair', textTransform: 'uppercase' }}>Share</button>
          </div>
        </div>
      </div>

      {/* ── TABS ── */}
      <div style={{ display: 'flex', background: 'var(--deep)', borderBottom: '1px solid var(--border)' }}>
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              fontFamily: 'Oswald, sans-serif', fontSize: '13px', fontWeight: 600,
              color: activeTab === tab ? 'var(--copper)' : 'var(--grey-l)',
              background: 'none', border: 'none',
              borderBottom: activeTab === tab ? '2px solid var(--copper)' : '2px solid transparent',
              padding: '0.85rem 1.5rem', cursor: 'crosshair',
              letterSpacing: '0.06em', textTransform: 'uppercase', transition: 'all 0.2s',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── TAB CONTENT ── */}
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>

        {/* OVERVIEW */}
        {activeTab === 'Overview' && (
          <div style={{ padding: '1.5rem 2rem', display: 'grid', gridTemplateColumns: '1fr 360px', gap: '1.5rem', alignItems: 'start' }}>
            <div>
              {/* Chart */}
              <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', padding: '1.25rem', marginBottom: '1rem' }}>
                <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '11px', fontWeight: 700, color: 'var(--copper)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '1rem' }}>Price Chart</div>
                <svg width="100%" height="220" viewBox="0 0 600 220" preserveAspectRatio="none">
                  <defs><linearGradient id="cg2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#b87040" stopOpacity="0.25"/><stop offset="100%" stopColor="#b87040" stopOpacity="0"/></linearGradient></defs>
                  <path d="M0 180 L60 160 L120 170 L180 140 L220 145 L260 110 L300 115 L340 85 L380 70 L420 55 L460 40 L500 30 L540 20 L600 15 L600 220 L0 220Z" fill="url(#cg2)"/>
                  <path d="M0 180 L60 160 L120 170 L180 140 L220 145 L260 110 L300 115 L340 85 L380 70 L420 55 L460 40 L500 30 L540 20 L600 15" fill="none" stroke="#b87040" strokeWidth="2"/>
                </svg>
              </div>
              <CombatLog maxRows={5} />
            </div>
            <div>
              {[
                { title:'Token Info', rows:[['Symbol','$MOLTOV','var(--copper)'],['Total Supply','1,000,000,000',''],['Curve Allocation','800,000,000',''],['LP Allocation','200,000,000',''],['Creator',TOKEN.creator.slice(0,8)+'...','var(--copper)'],['Chain','Base (8453)','']] },
                { title:'Bonding Status', rows:[['ETH Bonded',`${TOKEN.bondedEth} / 3 ETH`,'var(--gold-b)'],['Remaining',`${(3-TOKEN.bondedEth).toFixed(2)} ETH`,'var(--red-b)'],['Progress',`${TOKEN.bondPercent}%`,'var(--gold-b)'],['Creator Grad Payout','0.25 ETH','var(--green)'],['War Chest Status','⚡ ACTIVE','var(--gold-b)']] },
                { title:'Grad Flow (At 3 ETH)', rows:[['→ Uniswap V3 LP','2.5 ETH + 200M','var(--gold-b)'],['→ Creator','0.25 ETH','var(--green)'],['→ Platform','0.25 ETH','var(--copper)']] },
              ].map(block => (
                <div key={block.title} style={{ background: 'var(--panel)', border: '1px solid var(--border)', padding: '1.25rem', marginBottom: '1rem' }}>
                  <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '11px', fontWeight: 700, color: 'var(--copper)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>{block.title}</div>
                  {block.rows.map(([l,v,c]) => (
                    <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid rgba(184,112,64,0.06)' }}>
                      <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '11px', color: 'var(--grey-l)' }}>{l}</span>
                      <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '11px', color: c || 'var(--cream)' }}>{v}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TRADE */}
        {activeTab === 'Trade' && (
          <div style={{ padding: '1.5rem 2rem', display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem', alignItems: 'start' }}>
            <div>
              <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', padding: '1.5rem', marginBottom: '1rem' }}>
                {/* Buy/Sell toggle */}
                <div style={{ display: 'flex', marginBottom: '1.5rem', border: '1px solid var(--border)', overflow: 'hidden', width: 'fit-content' }}>
                  {(['buy','sell'] as const).map(mode => (
                    <button key={mode} onClick={() => setTradeMode(mode)} style={{
                      fontFamily: 'Oswald, sans-serif', fontSize: '13px', fontWeight: 700,
                      color: tradeMode === mode ? (mode === 'buy' ? 'var(--green)' : 'var(--red-b)') : 'var(--grey-l)',
                      background: tradeMode === mode ? (mode === 'buy' ? 'rgba(58,153,72,0.12)' : 'rgba(204,34,0,0.12)') : 'transparent',
                      border: 'none', borderRight: mode === 'buy' ? '1px solid var(--border)' : 'none',
                      padding: '0.6rem 1.5rem', cursor: 'crosshair', letterSpacing: '0.08em', textTransform: 'uppercase',
                    }}>{mode.toUpperCase()}</button>
                  ))}
                </div>

                <label style={{ fontFamily: 'Oswald, sans-serif', fontSize: '12px', fontWeight: 700, color: 'var(--copper)', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                  Amount ({tradeMode === 'buy' ? 'ETH' : `$${TOKEN.symbol}`})
                </label>
                <input type="number" value={amount} onChange={e => setAmount(e.target.value)} min="0" step="0.01"
                  style={{ width: '100%', background: 'rgba(184,112,64,0.04)', border: '1px solid var(--border)', color: 'var(--cream)', fontFamily: 'Black Ops One, cursive', fontSize: '24px', padding: '0.85rem 1rem', outline: 'none', marginBottom: '0.75rem' }} />

                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
                  {[0.05,0.1,0.25,0.5,1].map(v => (
                    <button key={v} onClick={() => setAmount(String(v))} style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '11px', color: 'var(--copper)', background: 'rgba(184,112,64,0.06)', border: '1px solid rgba(184,112,64,0.2)', padding: '4px 10px', cursor: 'crosshair' }}>{v}</button>
                  ))}
                </div>

                <div style={{ background: 'rgba(184,112,64,0.04)', border: '1px solid var(--border)', padding: '1rem', marginBottom: '1.25rem' }}>
                  {[
                    ['You receive (est.)', `~${Math.round(amtNum * 142000).toLocaleString()} $${TOKEN.symbol}`],
                    ['Fee (2%)', `${(amtNum * GRAD_FLOW.buyFee).toFixed(4)} ETH`],
                    ['Creator fee (1%)', `${(amtNum * GRAD_FLOW.creatorBuyFee).toFixed(4)} ETH`],
                    ['Price impact', '~0.8%'],
                    ['New bonding %', `~${Math.min(100, TOKEN.bondPercent + amtNum * 3.2).toFixed(1)}%`],
                  ].map(([l,v]) => (
                    <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.3rem 0' }}>
                      <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '11px', color: 'var(--grey-l)' }}>{l}</span>
                      <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '11px', color: 'var(--cream)' }}>{v}</span>
                    </div>
                  ))}
                </div>

                <button className="btn-clip" style={{
                  width: '100%', padding: '0.85rem',
                  fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: '15px',
                  color: tradeMode === 'buy' ? '#060504' : '#fff',
                  background: tradeMode === 'buy' ? 'linear-gradient(135deg,var(--copper),var(--copper-l))' : 'linear-gradient(135deg,var(--red),var(--red-b))',
                  border: 'none', letterSpacing: '0.1em', cursor: 'crosshair', textTransform: 'uppercase',
                }}>
                  {tradeMode === 'buy' ? `⚔ BUY $${TOKEN.symbol}` : `▼ SELL $${TOKEN.symbol}`}
                </button>
              </div>

              {/* Bonding progress */}
              <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', padding: '1.5rem' }}>
                <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '11px', fontWeight: 700, color: 'var(--copper)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Bonding Progress</div>
                <div style={{ height: '16px', background: 'rgba(184,112,64,0.08)', border: '1px solid rgba(184,112,64,0.15)', position: 'relative', marginBottom: '0.75rem' }}>
                  <div className="animate-crit-glow" style={{ height: '100%', width: `${TOKEN.bondPercent}%`, background: 'linear-gradient(90deg,var(--red),var(--gold-b))' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '11px', color: 'var(--grey-l)' }}>Bonded: <span style={{ color: 'var(--cream)' }}>{TOKEN.bondedEth} ETH</span></span>
                  <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '11px', color: 'var(--grey-l)' }}>Remaining: <span style={{ color: 'var(--red-b)' }}>{(3-TOKEN.bondedEth).toFixed(2)} ETH</span></span>
                  <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '11px', color: 'var(--grey-l)' }}>Target: <span style={{ color: 'var(--cream)' }}>3 ETH</span></span>
                </div>
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                  {[['Creator receives','0.25 ETH','var(--green)'],['Platform receives','0.25 ETH','var(--copper)'],['LP seeded with','2.5 ETH + 200M tokens','var(--gold-b)']].map(([l,v,c]) => (
                    <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.2rem 0' }}>
                      <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '11px', color: 'var(--grey-l)' }}>{l}</span>
                      <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '11px', color: c }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent trades */}
            <div style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}>
              <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '11px', fontWeight: 700, color: 'var(--copper)', letterSpacing: '0.15em', textTransform: 'uppercase', padding: '0.85rem 1rem', borderBottom: '1px solid var(--border)' }}>Recent Trades</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 70px', gap: '0.5rem', padding: '0.55rem 1rem', borderBottom: '1px solid var(--border)', fontFamily: 'Share Tech Mono, monospace', fontSize: '9px', color: 'var(--grey)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                <span>Type</span><span>Tokens</span><span>ETH</span><span>Time</span>
              </div>
              {[
                ['BUY','18,400','0.12','12s'],['BUY','5,000','0.04','2m'],['SELL','12,000','0.09','5m'],
                ['BUY','22,000','0.15','9m'],['BUY','8,400','0.06','14m'],['SELL','30,000','0.21','19m'],
              ].map(([type,tok,eth,time],i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 70px', gap: '0.5rem', padding: '0.55rem 1rem', borderBottom: '1px solid rgba(184,112,64,0.06)', fontFamily: 'Share Tech Mono, monospace', fontSize: '11px', alignItems: 'center' }}>
                  <span style={{ color: type==='BUY' ? 'var(--green)' : 'var(--red-b)' }}>{type}</span>
                  <span style={{ color: 'var(--cream)' }}>{tok}</span>
                  <span style={{ color: 'var(--grey-l)' }}>{eth}</span>
                  <span style={{ color: 'var(--grey)', textAlign: 'right' }}>{time}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FORTIFY */}
        {activeTab === 'Fortify' && (
          <div style={{ padding: '1.5rem 2rem', display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem' }}>
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1px', background: 'var(--border)', border: '1px solid var(--border)', marginBottom: '1.5rem' }}>
                {[['24.8%','Current APY'],['142K $MOLTOV','Total Staked'],['0.14 ETH','Pool Rewards']].map(([v,l]) => (
                  <div key={l} style={{ background: 'var(--deep)', padding: '1rem 1.25rem', textAlign: 'center' }}>
                    <div style={{ fontFamily: 'Black Ops One, cursive', fontSize: '20px', color: 'var(--copper-l)' }}>{v}</div>
                    <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '9px', color: 'var(--grey-l)', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: '3px' }}>{l}</div>
                  </div>
                ))}
              </div>
              <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', padding: '1.5rem' }}>
                <label style={{ fontFamily: 'Oswald, sans-serif', fontSize: '12px', fontWeight: 700, color: 'var(--copper)', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: '1rem' }}>Stake ${TOKEN.symbol}</label>
                <input placeholder="Amount to stake" style={{ width: '100%', background: 'rgba(184,112,64,0.04)', border: '1px solid var(--border)', color: 'var(--cream)', fontFamily: 'Barlow Condensed, sans-serif', fontSize: '15px', padding: '0.7rem 1rem', outline: 'none', marginBottom: '0.75rem' }} />
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
                  {['25%','50%','75%','MAX'].map(p => (
                    <button key={p} style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '11px', color: 'var(--copper)', background: 'rgba(184,112,64,0.06)', border: '1px solid rgba(184,112,64,0.2)', padding: '4px 10px', cursor: 'crosshair' }}>{p}</button>
                  ))}
                </div>
                <div style={{ background: 'rgba(184,112,64,0.04)', border: '1px solid var(--border)', padding: '1rem', marginBottom: '1.25rem' }}>
                  {[['Your balance','0 $MOLTOV'],['Estimated APY','24.8%'],['Funded by','0.4% Uni fee flow']].map(([l,v]) => (
                    <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.3rem 0' }}>
                      <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '11px', color: 'var(--grey-l)' }}>{l}</span>
                      <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '11px', color: l === 'Estimated APY' ? 'var(--green)' : 'var(--cream)' }}>{v}</span>
                    </div>
                  ))}
                </div>
                <button className="btn-clip" style={{ width: '100%', padding: '0.85rem', fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: '14px', color: '#060504', background: 'linear-gradient(135deg,var(--copper),var(--copper-l))', border: 'none', letterSpacing: '0.1em', cursor: 'crosshair', textTransform: 'uppercase' }}>Fortify Position</button>
              </div>
            </div>
            <div>
              <div style={{ background: 'rgba(58,153,72,0.06)', border: '1px solid rgba(58,153,72,0.2)', padding: '1.25rem', marginBottom: '1rem' }}>
                <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '11px', fontWeight: 700, color: 'var(--olive-l)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Your Position</div>
                <div style={{ fontFamily: 'Black Ops One, cursive', fontSize: '24px', color: 'var(--cream)' }}>0 ${TOKEN.symbol}</div>
                <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '11px', color: 'var(--grey-l)' }}>Connect wallet to view</div>
              </div>
              <div style={{ background: 'rgba(200,144,10,0.06)', border: '1px solid rgba(200,144,10,0.2)', padding: '1.25rem' }}>
                <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '11px', fontWeight: 700, color: 'var(--gold)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Claimable Rewards</div>
                <div style={{ fontFamily: 'Black Ops One, cursive', fontSize: '22px', color: 'var(--gold-b)', marginBottom: '0.25rem' }}>0.000 ETH</div>
                <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '10px', color: 'var(--gold)', marginBottom: '1rem' }}>Connect wallet to claim</div>
                <button className="btn-clip" style={{ width: '100%', padding: '0.65rem', fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: '14px', color: '#060504', background: 'linear-gradient(135deg,var(--copper),var(--copper-l))', border: 'none', letterSpacing: '0.1em', cursor: 'crosshair', textTransform: 'uppercase' }}>Claim Rewards</button>
              </div>
            </div>
          </div>
        )}

        {/* ARMORY */}
        {activeTab === 'Armory' && (
          <div style={{ padding: '1.5rem 2rem', display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem' }}>
            <div>
              <div style={{ background: 'rgba(184,112,64,0.06)', border: '1px solid rgba(184,112,64,0.2)', padding: '1.5rem', marginBottom: '1.5rem', textAlign: 'center' }}>
                <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '11px', fontWeight: 700, color: 'var(--copper)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Armory Reserve Balance</div>
                <div style={{ fontFamily: 'Black Ops One, cursive', fontSize: '40px', color: 'var(--copper-l)' }}>{TOKEN.armoryBalance} ETH</div>
                <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '12px', color: 'var(--grey-l)' }}>Funded by 1% of sell fees · Cannot be withdrawn as ETH</div>
              </div>

              <div style={{ border: '1px solid var(--border)', padding: '1.25rem', marginBottom: '1rem' }}>
                <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '13px', fontWeight: 700, color: 'var(--cream)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Monthly Action Vote</div>
                <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '10px', color: 'var(--grey-l)', marginBottom: '1rem' }}>NEXT ACTION IN: 18 DAYS · VOTE WITH YOUR WALLET</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                  {[
                    { id:'buyback' as const, title:'Buyback + Burn', desc:'Buy $MOLTOV and burn it permanently' },
                    { id:'liq' as const,     title:'Add Liquidity',  desc:'Add reserve to Uniswap V3 pool' },
                  ].map(opt => (
                    <div key={opt.id} onClick={() => setVoteSelected(opt.id)} style={{
                      border: `1px solid ${voteSelected === opt.id ? 'rgba(184,112,64,0.5)' : 'var(--border)'}`,
                      background: voteSelected === opt.id ? 'rgba(184,112,64,0.06)' : 'transparent',
                      padding: '1rem', cursor: 'crosshair', transition: 'all 0.2s',
                    }}>
                      <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '13px', fontWeight: 700, color: 'var(--cream)', textTransform: 'uppercase' }}>{opt.title}</div>
                      <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: '12px', color: 'var(--grey-l)', marginTop: '4px' }}>{opt.desc}</div>
                    </div>
                  ))}
                </div>
                {[['Buyback + Burn','64%'],['Add Liquidity','36%']].map(([l,p]) => (
                  <div key={l} style={{ marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '10px', color: 'var(--grey-l)' }}>{l}</span>
                      <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '10px', color: 'var(--cream)' }}>{p}</span>
                    </div>
                    <div style={{ height: '6px', background: 'rgba(184,112,64,0.08)', border: '1px solid rgba(184,112,64,0.1)' }}>
                      <div style={{ height: '100%', width: p, background: 'linear-gradient(90deg,var(--copper),var(--copper-l))' }} />
                    </div>
                  </div>
                ))}
                <button className="btn-clip" style={{ marginTop: '1rem', width: '100%', padding: '0.65rem', fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: '14px', color: '#060504', background: 'linear-gradient(135deg,var(--copper),var(--copper-l))', border: 'none', letterSpacing: '0.1em', cursor: 'crosshair', textTransform: 'uppercase' }}>Cast Vote</button>
              </div>
            </div>
            <div>
              <div style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}>
                <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '11px', fontWeight: 700, color: 'var(--copper)', letterSpacing: '0.15em', textTransform: 'uppercase', padding: '0.85rem 1rem', borderBottom: '1px solid var(--border)' }}>Action History</div>
                {[
                  ['Buyback','0.28 ETH used · 42,000 $MOLTOV burned','Feb 2026'],
                  ['Add Liq','0.15 ETH added to Uniswap V3 pool','Jan 2026'],
                  ['Buyback','0.09 ETH used · 18,000 $MOLTOV burned','Dec 2025'],
                ].map(([type,desc,date]) => (
                  <div key={date} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem 1rem', borderBottom: '1px solid rgba(184,112,64,0.06)' }}>
                    <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '11px', fontWeight: 700, color: 'var(--copper)', letterSpacing: '0.08em', textTransform: 'uppercase', width: '80px', flexShrink: 0 }}>{type}</div>
                    <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '11px', color: 'var(--grey-l)', flex: 1 }}>{desc}</div>
                    <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '10px', color: 'var(--grey)' }}>{date}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* FEED */}
        {activeTab === 'Feed' && (
          <div style={{ padding: '1.5rem 2rem' }}>
            <CombatLog maxRows={20} />
          </div>
        )}

      </div>
    </div>
  )
}
