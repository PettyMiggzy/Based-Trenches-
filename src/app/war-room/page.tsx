'use client'
import { useState, useEffect } from 'react'
import { createPublicClient, http, formatEther } from 'viem'
import { base } from 'viem/chains'
import Link from 'next/link'

const WAR_CHEST = '0x34FA3E260484063cD9988380dD581642FC15c0BC' as const
const CHEST_ABI = [
  { name: 'balance',   type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
  { name: 'maxPayout', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
  { name: 'threshold', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
] as const

// Placeholder raids shown until real tokens exist
const PLACEHOLDER_RAIDS = [
  { symbol: 'WARZ',   name: 'War Zone',        bondPercent: 71, bondedEth: 2.13, emoji: '🔥' },
  { symbol: 'SURGE',  name: 'Surge Protocol',  bondPercent: 80, bondedEth: 2.40, emoji: '⚡' },
]

const PLACEHOLDER_BREAKOUTS = [
  { symbol: 'DEGEN',  note: '3 ETH bonded · War Chest awarded · LP deployed' },
  { symbol: 'TOSHI',  note: '3 ETH bonded · Creator +0.25 ETH · LP deployed' },
  { symbol: 'DRILLZ', note: '3 ETH bonded · Creator +0.25 ETH · LP deployed' },
]

const PLACEHOLDER_FEED = [
  { type: 'BUY',      symbol: 'MOLTOV', detail: '0x4f2...11b bought 22,000 tokens · 0.15 ETH' },
  { type: 'RAID',     symbol: 'MOLTOV', detail: 'Raid Active — 9 buys in 90s' },
  { type: 'BROKE OUT',symbol: 'DRILLZ', detail: '3 ETH bonded · Creator +0.25 ETH · LP deployed' },
  { type: 'WAR CHEST',symbol: 'DRILLZ', detail: 'War Chest awarded — 50% liq boost' },
  { type: 'SELL',     symbol: 'WARZ',   detail: '0x7c5...d2b sold 50,000 tokens for 0.04 ETH' },
  { type: 'BUY',      symbol: 'TRENCH', detail: '0x8e6...44a bought 8,200 $SCOPE · 0.05 ETH' },
]

const PLACEHOLDER_WHALES = [
  { symbol: 'WARZ',  detail: '0x1b3...9ea bought 100,000 $WARZ', change: '+0.6 ETH',  pos: true  },
  { symbol: 'SURGE', detail: '0x5f1...0b2 single buy · raid triggered', change: '+0.55 ETH', pos: true },
  { symbol: 'MOLTOV',detail: '0x9f2...44a multiple buys · 94% bonded', change: '-0.21 ETH', pos: false },
]

export default function WarRoomPage() {
  const [chest, setChest]   = useState({ bal: 0, max: 2, thresh: 1, loaded: false })
  const [tokens, setTokens] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const client = createPublicClient({ chain: base, transport: http('https://mainnet.base.org') })

    async function loadChest() {
      try {
        const [b, m, t] = await Promise.all([
          client.readContract({ address: WAR_CHEST, abi: CHEST_ABI, functionName: 'balance'   }).catch(() => BigInt(0)),
          client.readContract({ address: WAR_CHEST, abi: CHEST_ABI, functionName: 'maxPayout' }).catch(() => BigInt(2e18)),
          client.readContract({ address: WAR_CHEST, abi: CHEST_ABI, functionName: 'threshold' }).catch(() => BigInt(1e18)),
        ])
        setChest({ bal: parseFloat(formatEther(b as bigint)), max: parseFloat(formatEther(m as bigint)), thresh: parseFloat(formatEther(t as bigint)), loaded: true })
      } catch (_) { setChest(c => ({ ...c, loaded: true })) }
    }

    async function loadTokens() {
      try {
        const res  = await fetch('/api/tokens')
        const data = await res.json()
        setTokens(data.tokens || [])
      } catch (_) {}
      finally { setLoading(false) }
    }

    loadChest()
    loadTokens()
    const i = setInterval(() => { loadChest(); loadTokens() }, 30000)
    return () => clearInterval(i)
  }, [])

  const pct        = chest.max > 0 ? Math.min(100, (chest.bal / chest.max) * 100) : 0
  const active     = chest.bal >= chest.thresh
  const graduated  = tokens.filter(t => t.graduated)
  const nearGrad   = tokens.filter(t => !t.graduated && t.bondPercent >= 75).sort((a, b) => b.bondPercent - a.bondPercent)
  const hotTokens  = tokens.filter(t => !t.graduated).sort((a, b) => b.bondPercent - a.bondPercent)

  // Use real data if available, fall back to placeholders
  const showRaids      = nearGrad.length > 0 ? nearGrad.slice(0, 4)         : PLACEHOLDER_RAIDS
  const showBreakouts  = graduated.length > 0 ? graduated.slice(0, 5)       : PLACEHOLDER_BREAKOUTS
  const showFeed       = hotTokens.length > 0  ? null                        : PLACEHOLDER_FEED
  const showWhales     = nearGrad.length > 0   ? null                        : PLACEHOLDER_WHALES
  const usingPlaceholder = tokens.length < 5

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem', display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem', alignItems: 'start' }}>

      {/* LEFT */}
      <div>
        {/* War Chest — ALWAYS REAL */}
        <div style={{ background: 'var(--panel)', border: '1px solid rgba(240,176,32,0.3)', padding: '2rem', marginBottom: '2rem', textAlign: 'center' }}>
          <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '11px', fontWeight: 700, color: 'var(--gold-b)', letterSpacing: '0.2em', marginBottom: '0.5rem' }}>
            ⚡ WAR CHEST — GLOBAL JACKPOT
          </div>
          <div style={{ fontFamily: 'Black Ops One, cursive', fontSize: '52px', color: chest.loaded ? 'var(--gold-b)' : 'var(--grey)', marginBottom: '0.25rem' }}>
            {chest.loaded ? `${chest.bal.toFixed(3)} ETH` : '— ETH'}
          </div>
          <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '13px', color: active ? 'var(--gold-b)' : 'var(--grey-l)', marginBottom: '1.5rem' }}>
            {chest.loaded
              ? active ? `ACTIVE · NEXT BREAKOUT WINS UP TO ${chest.max} ETH`
                       : `BUILDING · ACTIVATES AT ${chest.thresh} ETH`
              : 'Loading...'}
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '11px', color: 'var(--grey-l)' }}>{chest.bal.toFixed(3)} ETH</span>
              <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '11px', color: 'var(--grey-l)' }}>{chest.max} ETH MAX</span>
            </div>
            <div style={{ height: '8px', background: 'rgba(255,255,255,0.06)' }}>
              <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg,var(--gold-b),#f0c040)', transition: 'width 0.5s' }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
            {[['50%', 'Liquidity Boost'], ['30%', 'Random Buyers'], ['20%', 'Last Buyer']].map(([p, l]) => (
              <div key={l} style={{ fontFamily: 'Oswald, sans-serif', fontSize: '11px', color: 'var(--grey-l)', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', padding: '4px 12px' }}>
                <span style={{ color: 'var(--gold-b)', fontWeight: 700 }}>{p}</span> {l}
              </div>
            ))}
          </div>
        </div>

        {/* Active Raids */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <span style={{ fontFamily: 'Black Ops One, cursive', fontSize: '18px', color: 'var(--cream)' }}>Active Raids</span>
            <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: '9px', fontWeight: 700, color: 'var(--red-b)', background: 'rgba(255,51,17,0.1)', border: '1px solid rgba(255,51,17,0.3)', padding: '2px 6px', letterSpacing: '0.1em' }}>LIVE</span>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--red-b)' }} />
            {usingPlaceholder && <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '9px', color: 'var(--grey)', marginLeft: 'auto' }}>DEMO</span>}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {showRaids.map((t: any) => (
              <div key={t.symbol} style={{ background: 'var(--panel)', border: '1px solid rgba(255,51,17,0.3)', padding: '1.25rem', cursor: usingPlaceholder ? 'default' : 'crosshair', opacity: usingPlaceholder ? 0.7 : 1 }}
                onClick={() => !usingPlaceholder && t.address && (window.location.href = `/token/${t.address}`)}>
                <div style={{ height: '2px', background: 'linear-gradient(90deg,var(--red),var(--red-b))', margin: '-1.25rem -1.25rem 1rem' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ fontFamily: 'Black Ops One, cursive', fontSize: '18px', color: 'var(--cream)' }}>
                    {t.emoji || '⚔'} ${t.symbol}
                  </span>
                  <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: '10px', fontWeight: 700, color: 'var(--red-b)', background: 'rgba(255,51,17,0.15)', border: '1px solid rgba(255,51,17,0.4)', padding: '3px 8px', letterSpacing: '0.1em' }}>⚔ RAID ACTIVE</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  {[['—', 'Buys'], [`${(t.bondedEth || 0).toFixed(2)} ETH`, 'Volume'], [`${(t.bondPercent || 0).toFixed(1)}%`, 'Bonded']].map(([v, l]) => (
                    <div key={l}>
                      <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '13px', color: 'var(--cream)' }}>{v}</div>
                      <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '9px', color: 'var(--grey)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{l}</div>
                    </div>
                  ))}
                </div>
                <div style={{ height: '4px', background: 'rgba(255,255,255,0.06)' }}>
                  <div style={{ height: '100%', width: `${t.bondPercent || 0}%`, background: 'linear-gradient(90deg,var(--red),var(--red-b))' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Breakouts */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <span style={{ fontFamily: 'Black Ops One, cursive', fontSize: '18px', color: 'var(--cream)' }}>Recent Breakouts</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
            {usingPlaceholder && <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '9px', color: 'var(--grey)' }}>DEMO</span>}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'var(--border)' }}>
            {showBreakouts.map((t: any) => (
              <div key={t.symbol} style={{ background: 'var(--panel)', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', opacity: usingPlaceholder ? 0.7 : 1 }}>
                <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: '10px', fontWeight: 700, color: 'var(--gold-b)', background: 'rgba(240,176,32,0.1)', border: '1px solid rgba(240,176,32,0.3)', padding: '3px 8px', letterSpacing: '0.1em', whiteSpace: 'nowrap' }}>⚡ BROKE OUT</span>
                <span style={{ fontFamily: 'Black Ops One, cursive', fontSize: '16px', color: 'var(--cream)' }}>${t.symbol}</span>
                <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: '12px', color: 'var(--grey-l)', flex: 1 }}>{t.note || '3 ETH bonded · Creator +0.25 ETH · LP deployed'}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT sidebar */}
      <div>
        {/* Live Feed */}
        <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', padding: '1.25rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontFamily: 'Black Ops One, cursive', fontSize: '14px', color: 'var(--cream)' }}>Live Feed</span>
            {usingPlaceholder && <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '9px', color: 'var(--grey)' }}>DEMO</span>}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {(showFeed || hotTokens.slice(0, 6).map(t => ({ type: t.bondPercent > 75 ? 'RAID' : 'BUY', symbol: t.symbol, detail: `${t.bondPercent.toFixed(1)}% bonded` }))).map((item: any, i: number) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', opacity: usingPlaceholder ? 0.75 : 1 }}>
                <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: '9px', fontWeight: 700, color: item.type === 'RAID' ? 'var(--red-b)' : item.type === 'SELL' ? 'var(--grey-l)' : item.type === 'BROKE OUT' ? 'var(--gold-b)' : item.type === 'WAR CHEST' ? 'var(--gold-b)' : 'var(--green)', whiteSpace: 'nowrap', marginTop: '2px', letterSpacing: '0.06em' }}>
                  {item.type === 'BUY' ? '▲' : item.type === 'SELL' ? '▼' : item.type === 'RAID' ? '⚔' : item.type === 'BROKE OUT' ? '⚡' : '⚡'} {item.type}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'Black Ops One, cursive', fontSize: '12px', color: 'var(--cream)' }}>${item.symbol}</div>
                  <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '9px', color: 'var(--grey-l)', lineHeight: 1.4, wordBreak: 'break-word' }}>{item.detail}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Whale Alerts */}
        <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontFamily: 'Black Ops One, cursive', fontSize: '14px', color: 'var(--cream)' }}>Whale Alerts</span>
            {usingPlaceholder && <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '9px', color: 'var(--grey)' }}>DEMO</span>}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {(showWhales || nearGrad.slice(0, 3).map((t: any) => ({ symbol: t.symbol, detail: `Bonding surge · ${t.bondPercent.toFixed(1)}% bonded`, change: `+${t.bondedEth.toFixed(2)} ETH`, pos: true }))).map((w: any, i: number) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: usingPlaceholder ? 0.75 : 1 }}>
                <span style={{ fontSize: '16px' }}>🐋</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'Black Ops One, cursive', fontSize: '13px', color: 'var(--cream)' }}>${w.symbol}</div>
                  <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '9px', color: 'var(--grey-l)' }}>{w.detail}</div>
                </div>
                <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '12px', fontWeight: 700, color: w.pos ? 'var(--green)' : 'var(--red-b)', whiteSpace: 'nowrap' }}>{w.change}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
