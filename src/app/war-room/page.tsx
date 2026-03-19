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

export default function WarRoomPage() {
  const [chest, setChest] = useState({ bal: 0, max: 2, thresh: 1, loaded: false })
  const [tokens, setTokens] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch real War Chest balance from chain
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

    // Fetch real tokens for raids/breakouts
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

  const pct       = chest.max > 0 ? Math.min(100, (chest.bal / chest.max) * 100) : 0
  const active    = chest.bal >= chest.thresh
  const graduated = tokens.filter(t => t.graduated)
  const nearGrad  = tokens.filter(t => !t.graduated && t.bondPercent >= 75).sort((a, b) => b.bondPercent - a.bondPercent)
  const hotTokens = tokens.filter(t => !t.graduated && t.bondPercent > 20).sort((a, b) => b.bondPercent - a.bondPercent)

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem', display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem', alignItems: 'start' }}>

      {/* LEFT */}
      <div>
        {/* War Chest — REAL DATA */}
        <div style={{ background: 'var(--panel)', border: '1px solid rgba(240,176,32,0.3)', padding: '2rem', marginBottom: '2rem', textAlign: 'center' }}>
          <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '11px', fontWeight: 700, color: 'var(--gold-b)', letterSpacing: '0.2em', marginBottom: '0.5rem' }}>
            ⚡ WAR CHEST — GLOBAL JACKPOT
          </div>
          <div style={{ fontFamily: 'Black Ops One, cursive', fontSize: '52px', color: chest.loaded ? 'var(--gold-b)' : 'var(--grey)', marginBottom: '0.25rem' }}>
            {chest.loaded ? `${chest.bal.toFixed(3)} ETH` : '— ETH'}
          </div>
          <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '13px', color: active ? 'var(--gold-b)' : 'var(--grey-l)', marginBottom: '1.5rem' }}>
            {chest.loaded
              ? active
                ? `ACTIVE · NEXT BREAKOUT WINS UP TO ${chest.max} ETH`
                : `BUILDING · ACTIVATES AT ${chest.thresh} ETH`
              : 'Loading...'
            }
          </div>

          {/* Progress bar */}
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '11px', color: 'var(--grey-l)' }}>{chest.bal.toFixed(3)} ETH</span>
              <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '11px', color: 'var(--grey-l)' }}>{chest.max} ETH MAX</span>
            </div>
            <div style={{ height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: 0 }}>
              <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg,var(--gold-b),#f0c040)', transition: 'width 0.5s' }} />
            </div>
          </div>

          {/* Payout split */}
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
            {[['50%', 'Liquidity Boost'], ['30%', 'Random Buyers'], ['20%', 'Last Buyer']].map(([p, l]) => (
              <div key={l} style={{ fontFamily: 'Oswald, sans-serif', fontSize: '11px', color: 'var(--grey-l)', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', padding: '4px 12px' }}>
                <span style={{ color: 'var(--gold-b)', fontWeight: 700 }}>{p}</span> {l}
              </div>
            ))}
          </div>
        </div>

        {/* Active Raids — real tokens near breakout */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <span style={{ fontFamily: 'Black Ops One, cursive', fontSize: '18px', color: 'var(--cream)' }}>Active Raids</span>
            <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: '9px', fontWeight: 700, color: 'var(--red-b)', background: 'rgba(255,51,17,0.1)', border: '1px solid rgba(255,51,17,0.3)', padding: '2px 6px', letterSpacing: '0.1em' }}>LIVE</span>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--red-b)' }} />
          </div>
          {loading ? (
            <div style={{ padding: '2rem', border: '1px solid var(--border)', fontFamily: 'Oswald, sans-serif', fontSize: '13px', color: 'var(--grey-l)', textAlign: 'center' }}>Loading...</div>
          ) : nearGrad.length === 0 ? (
            <div style={{ padding: '2rem', border: '1px solid var(--border)', fontFamily: 'Oswald, sans-serif', fontSize: '13px', color: 'var(--grey-l)', textAlign: 'center' }}>
              No active raids — tokens need 75%+ bonded to trigger raid mode
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {nearGrad.slice(0, 4).map(t => (
                <Link key={t.address} href={`/token/${t.address}`} style={{ textDecoration: 'none' }}>
                  <div style={{ background: 'var(--panel)', border: '1px solid rgba(255,51,17,0.3)', padding: '1.25rem', cursor: 'crosshair' }}>
                    <div style={{ position: 'relative', height: '2px', background: 'linear-gradient(90deg,var(--red),var(--red-b))', marginBottom: '1rem', top: '-1.25rem', margin: '-1.25rem -1.25rem 1rem' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <span style={{ fontFamily: 'Black Ops One, cursive', fontSize: '18px', color: 'var(--cream)' }}>${t.symbol}</span>
                      <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: '10px', fontWeight: 700, color: 'var(--red-b)', background: 'rgba(255,51,17,0.15)', border: '1px solid rgba(255,51,17,0.4)', padding: '3px 8px', letterSpacing: '0.1em' }}>⚔ RAID ACTIVE</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0.5rem', marginBottom: '0.75rem' }}>
                      {[
                        ['—', 'Buys'],
                        [`${t.bondedEth.toFixed(2)} ETH`, 'Volume'],
                        [`${t.bondPercent.toFixed(1)}%`, 'Bonded'],
                      ].map(([v, l]) => (
                        <div key={l}>
                          <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '13px', color: 'var(--cream)' }}>{v}</div>
                          <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '9px', color: 'var(--grey)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{l}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ height: '4px', background: 'rgba(255,255,255,0.06)' }}>
                      <div style={{ height: '100%', width: `${t.bondPercent}%`, background: 'linear-gradient(90deg,var(--red),var(--red-b))' }} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Breakouts — real graduated tokens */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <span style={{ fontFamily: 'Black Ops One, cursive', fontSize: '18px', color: 'var(--cream)' }}>Recent Breakouts</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
          </div>
          {loading ? (
            <div style={{ padding: '2rem', border: '1px solid var(--border)', fontFamily: 'Oswald, sans-serif', fontSize: '13px', color: 'var(--grey-l)', textAlign: 'center' }}>Loading...</div>
          ) : graduated.length === 0 ? (
            <div style={{ padding: '2rem', border: '1px solid var(--border)', fontFamily: 'Oswald, sans-serif', fontSize: '13px', color: 'var(--grey-l)', textAlign: 'center' }}>
              No breakouts yet — first token to reach 3 ETH wins the War Chest
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'var(--border)' }}>
              {graduated.slice(0, 5).map(t => (
                <Link key={t.address} href={`/token/${t.address}`} style={{ textDecoration: 'none' }}>
                  <div style={{ background: 'var(--panel)', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'crosshair' }}>
                    <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: '10px', fontWeight: 700, color: 'var(--gold-b)', background: 'rgba(240,176,32,0.1)', border: '1px solid rgba(240,176,32,0.3)', padding: '3px 8px', letterSpacing: '0.1em', whiteSpace: 'nowrap' }}>⚡ BROKE OUT</span>
                    <span style={{ fontFamily: 'Black Ops One, cursive', fontSize: '16px', color: 'var(--cream)' }}>${t.symbol}</span>
                    <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: '12px', color: 'var(--grey-l)', flex: 1 }}>3 ETH bonded · Creator +0.25 ETH · LP deployed</span>
                    <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '11px', color: 'var(--grey)' }}>—</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT sidebar */}
      <div>
        {/* Live feed — real tokens activity */}
        <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', padding: '1.25rem', marginBottom: '1rem' }}>
          <div style={{ fontFamily: 'Black Ops One, cursive', fontSize: '14px', color: 'var(--cream)', marginBottom: '1rem' }}>Live Feed</div>
          {loading ? (
            <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '12px', color: 'var(--grey-l)' }}>Loading...</div>
          ) : hotTokens.length === 0 ? (
            <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '12px', color: 'var(--grey-l)' }}>No activity yet — launch a token to get started</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {hotTokens.slice(0, 8).map(t => (
                <Link key={t.address} href={`/token/${t.address}`} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: '9px', fontWeight: 700, color: t.bondPercent > 75 ? 'var(--red-b)' : 'var(--copper)', letterSpacing: '0.08em' }}>
                    {t.bondPercent > 75 ? '⚔ RAID' : '▲ BUY'}
                  </span>
                  <span style={{ fontFamily: 'Black Ops One, cursive', fontSize: '13px', color: 'var(--cream)' }}>${t.symbol}</span>
                  <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '11px', color: 'var(--copper)', marginLeft: 'auto' }}>{t.bondPercent.toFixed(1)}%</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Whale Alerts — real near-grad tokens */}
        <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', padding: '1.25rem' }}>
          <div style={{ fontFamily: 'Black Ops One, cursive', fontSize: '14px', color: 'var(--cream)', marginBottom: '1rem' }}>Whale Alerts</div>
          {loading ? (
            <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '12px', color: 'var(--grey-l)' }}>Loading...</div>
          ) : nearGrad.length === 0 ? (
            <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '12px', color: 'var(--grey-l)', lineHeight: 1.6 }}>
              No whale activity yet.<br />
              Large buys pushing tokens toward graduation will appear here.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {nearGrad.slice(0, 5).map(t => (
                <Link key={t.address} href={`/token/${t.address}`} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '16px' }}>🐋</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: 'Black Ops One, cursive', fontSize: '13px', color: 'var(--cream)' }}>${t.symbol}</div>
                    <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '10px', color: 'var(--grey-l)' }}>Bonding surge</div>
                  </div>
                  <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '12px', color: 'var(--red-b)', fontWeight: 700 }}>+{t.bondedEth.toFixed(2)} ETH</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
