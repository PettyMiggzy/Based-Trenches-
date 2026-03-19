'use client'
import { useState, useEffect } from 'react'
import { createPublicClient, http, formatEther } from 'viem'
import { base } from 'viem/chains'

const WAR_CHEST = '0x34FA3E260484063cD9988380dD581642FC15c0BC' as const
const CHEST_ABI = [
  { name: 'balance',    type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
  { name: 'maxPayout',  type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
  { name: 'threshold',  type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
] as const

export function WarChestBar() {
  const [bal, setBal]       = useState(0)
  const [maxP, setMaxP]     = useState(2)
  const [thresh, setThresh] = useState(1)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const client = createPublicClient({ chain: base, transport: http('https://mainnet.base.org') })
    async function load() {
      try {
        const [b, m, t] = await Promise.all([
          client.readContract({ address: WAR_CHEST, abi: CHEST_ABI, functionName: 'balance'   }).catch(() => BigInt(0)),
          client.readContract({ address: WAR_CHEST, abi: CHEST_ABI, functionName: 'maxPayout' }).catch(() => BigInt(2e18)),
          client.readContract({ address: WAR_CHEST, abi: CHEST_ABI, functionName: 'threshold' }).catch(() => BigInt(1e18)),
        ])
        setBal(parseFloat(formatEther(b as bigint)))
        setMaxP(parseFloat(formatEther(m as bigint)))
        setThresh(parseFloat(formatEther(t as bigint)))
        setLoaded(true)
      } catch (_) { setLoaded(true) }
    }
    load()
    const interval = setInterval(load, 60000)
    return () => clearInterval(interval)
  }, [])

  const pct     = maxP > 0 ? Math.min(100, (bal / maxP) * 100) : 0
  const active  = bal >= thresh

  return (
    <div style={{ padding: '1.25rem 2rem', background: 'var(--panel)', borderBottom: '1px solid var(--border)' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ color: 'var(--gold-b)', fontSize: '16px' }}>⚡</span>
            <span style={{ fontFamily: 'Black Ops One, cursive', fontSize: '16px', color: 'var(--cream)' }}>War Chest</span>
            <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: '10px', color: 'var(--grey-l)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Global Jackpot · Base Chain</span>
          </div>

          <div style={{ fontFamily: 'Black Ops One, cursive', fontSize: '20px', color: loaded ? 'var(--gold-b)' : 'var(--grey)', minWidth: '80px' }}>
            {loaded ? `${bal.toFixed(3)} ETH` : '— ETH'}
          </div>

          <div style={{ flex: 1, minWidth: '160px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '10px', color: 'var(--grey-l)' }}>{pct.toFixed(0)}%</span>
              <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '10px', color: 'var(--grey-l)' }}>MAX: {maxP} ETH</span>
            </div>
            <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)' }}>
              <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg,var(--gold-b),#f0c040)', transition: 'width 0.5s' }} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {[['50%', 'Liq Boost'], ['30%', 'Random Buyers'], ['20%', 'Last Buyer']].map(([p, l]) => (
              <span key={l} style={{ fontFamily: 'Oswald, sans-serif', fontSize: '10px', color: 'var(--grey-l)', fontWeight: 600 }}>
                <span style={{ color: 'var(--copper)' }}>{p}</span> {l}
              </span>
            ))}
          </div>

          <div style={{ fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: '11px', letterSpacing: '0.1em', padding: '4px 12px', border: `1px solid ${active ? 'rgba(240,176,32,0.5)' : 'rgba(255,255,255,0.1)'}`, color: active ? 'var(--gold-b)' : 'var(--grey-l)' }}>
            {active ? '⚡ ACTIVE — NEXT BREAKOUT WINS' : '○ BUILDING'}
          </div>
        </div>
      </div>
    </div>
  )
}
