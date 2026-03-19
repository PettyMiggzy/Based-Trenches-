'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import { parseEther } from 'viem'
import Link from 'next/link'

const CURVE_ABI = [
  { name: 'buy',  type: 'function', stateMutability: 'payable',    inputs: [{ name: 'minTokens', type: 'uint256' }],                                        outputs: [{ type: 'uint256' }] },
  { name: 'sell', type: 'function', stateMutability: 'nonpayable', inputs: [{ name: 'tokenAmount', type: 'uint256' }, { name: 'minEth', type: 'uint256' }], outputs: [{ type: 'uint256' }] },
] as const

// Animated bonding curve SVG visual
function BondingCurveChart({ bondPercent, bondedEth, bondTarget }: { bondPercent: number, bondedEth: number, bondTarget: number }) {
  const W = 600, H = 200
  const pad = { l: 48, r: 16, t: 16, b: 36 }
  const iW = W - pad.l - pad.r
  const iH = H - pad.t - pad.b

  // Generate curve points: price = k * supply^1.5 (bonding curve shape)
  const points = Array.from({ length: 100 }, (_, i) => {
    const x = i / 99
    const y = Math.pow(x, 1.5)
    return { x, y }
  })

  const toSvgX = (x: number) => pad.l + x * iW
  const toSvgY = (y: number) => pad.t + iH - y * iH

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${toSvgX(p.x).toFixed(1)} ${toSvgY(p.y).toFixed(1)}`).join(' ')

  // Fill up to current bond percent
  const fillX = bondPercent / 100
  const fillPoints = points.filter(p => p.x <= fillX)
  const lastFill = fillPoints[fillPoints.length - 1] || { x: 0, y: 0 }
  const fillD = fillPoints.length > 1
    ? `${fillPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${toSvgX(p.x).toFixed(1)} ${toSvgY(p.y).toFixed(1)}`).join(' ')} L ${toSvgX(lastFill.x).toFixed(1)} ${toSvgY(0).toFixed(1)} L ${toSvgX(0).toFixed(1)} ${toSvgY(0).toFixed(1)} Z`
    : ''

  // Current price dot
  const dotX = toSvgX(fillX)
  const dotY = toSvgY(Math.pow(fillX, 1.5))

  // Y axis labels
  const yLabels = [0, 0.25, 0.5, 0.75, 1.0]

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
      <defs>
        <linearGradient id="fillGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#b87040" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#b87040" stopOpacity="0.05" />
        </linearGradient>
        <linearGradient id="curveGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#b87040" />
          <stop offset="100%" stopColor="#f0b020" />
        </linearGradient>
      </defs>

      {/* Grid lines */}
      {yLabels.map(y => (
        <g key={y}>
          <line x1={pad.l} y1={toSvgY(y)} x2={W - pad.r} y2={toSvgY(y)} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
          <text x={pad.l - 6} y={toSvgY(y) + 4} textAnchor="end" fill="rgba(255,255,255,0.3)" fontSize="9" fontFamily="Share Tech Mono, monospace">
            {(y * 100).toFixed(0)}%
          </text>
        </g>
      ))}

      {/* X axis */}
      <line x1={pad.l} y1={pad.t + iH} x2={W - pad.r} y2={pad.t + iH} stroke="rgba(255,255,255,0.1)" strokeWidth="1" />

      {/* X axis labels */}
      {[0, 1, 2, 3].map(eth => (
        <text key={eth} x={toSvgX(eth / bondTarget)} y={H - 8} textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="9" fontFamily="Share Tech Mono, monospace">
          {eth} ETH
        </text>
      ))}

      {/* Fill area */}
      {fillD && <path d={fillD} fill="url(#fillGrad)" />}

      {/* Full curve (unfilled) */}
      <path d={pathD} fill="none" stroke="rgba(184,112,64,0.25)" strokeWidth="1.5" strokeDasharray="4 4" />

      {/* Filled curve */}
      {fillPoints.length > 1 && (
        <path
          d={fillPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${toSvgX(p.x).toFixed(1)} ${toSvgY(p.y).toFixed(1)}`).join(' ')}
          fill="none" stroke="url(#curveGrad)" strokeWidth="2.5"
        />
      )}

      {/* Graduation line */}
      <line x1={W - pad.r} y1={pad.t} x2={W - pad.r} y2={pad.t + iH} stroke="rgba(240,176,32,0.4)" strokeWidth="1" strokeDasharray="3 3" />
      <text x={W - pad.r - 4} y={pad.t + 10} textAnchor="end" fill="rgba(240,176,32,0.6)" fontSize="8" fontFamily="Oswald, sans-serif">GRAD</text>

      {/* Current position dot */}
      {bondPercent > 0 && (
        <>
          <circle cx={dotX} cy={dotY} r="5" fill="#b87040" />
          <circle cx={dotX} cy={dotY} r="9" fill="rgba(184,112,64,0.2)" />
          <text x={dotX + 12} y={dotY - 8} fill="#f0b020" fontSize="10" fontFamily="Share Tech Mono, monospace">
            {bondedEth.toFixed(3)} ETH
          </text>
        </>
      )}

      {/* Labels */}
      <text x={pad.l} y={12} fill="rgba(255,255,255,0.4)" fontSize="9" fontFamily="Oswald, sans-serif" letterSpacing="0.1em">PRICE</text>
      <text x={W / 2} y={H - 2} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="9" fontFamily="Oswald, sans-serif" letterSpacing="0.1em">VOLUME BONDED</text>
    </svg>
  )
}

// DexScreener embed for graduated tokens
function DexChart({ tokenAddress }: { tokenAddress: string }) {
  return (
    <div style={{ width: '100%', borderRadius: 0, overflow: 'hidden', border: '1px solid var(--border)' }}>
      <iframe
        src={`https://dexscreener.com/base/${tokenAddress}?embed=1&theme=dark&info=0`}
        style={{ width: '100%', height: '400px', border: 'none', display: 'block' }}
        title="DexScreener Chart"
      />
    </div>
  )
}

export default function TokenPage() {
  const params = useParams()
  const address = params.id as string
  const { isConnected } = useAccount()
  const { openConnectModal } = useConnectModal()

  const [token, setToken]     = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')
  const [tab, setTab]         = useState<'buy' | 'sell'>('buy')
  const [amount, setAmount]   = useState('')

  const { writeContract, data: txHash, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess }     = useWaitForTransactionReceipt({ hash: txHash })

  useEffect(() => {
    if (!address) return
    let cancelled = false
    async function load() {
      try {
        const res = await fetch(`/api/token/${address}`)
        if (!res.ok) throw new Error('Token not found')
        const data = await res.json()
        if (!cancelled) { setToken(data); setError('') }
      } catch (e: any) {
        if (!cancelled) setError(e.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    const interval = setInterval(load, 15000)
    return () => { cancelled = true; clearInterval(interval) }
  }, [address])

  const handleTrade = () => {
    if (!isConnected) { openConnectModal?.(); return }
    if (!amount || !token) return
    if (tab === 'buy') {
      writeContract({ address: token.curve, abi: CURVE_ABI, functionName: 'buy', value: parseEther(amount), args: [BigInt(0)] })
    } else {
      writeContract({ address: token.curve, abi: CURVE_ABI, functionName: 'sell', args: [parseEther(amount), BigInt(0)] })
    }
  }

  if (loading) return <div style={{ padding: '4rem', textAlign: 'center', fontFamily: 'Oswald, sans-serif', color: 'var(--grey-l)' }}>Loading...</div>
  if (error || !token) return (
    <div style={{ padding: '4rem', textAlign: 'center', fontFamily: 'Oswald, sans-serif', color: 'var(--red-b)' }}>
      {error || 'Token not found'}<br />
      <Link href="/trenches" style={{ color: 'var(--copper)', textDecoration: 'none', fontSize: '13px' }}>← Back to Trenches</Link>
    </div>
  )

  return (
    <div style={{ padding: '2rem', maxWidth: '1280px', margin: '0 auto' }}>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <Link href="/trenches" style={{ fontFamily: 'Oswald, sans-serif', fontSize: '11px', color: 'var(--grey-l)', textDecoration: 'none' }}>← Trenches</Link>
        <span style={{ color: 'var(--border)' }}>/</span>
        <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '11px', color: 'var(--copper)' }}>${token.symbol}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem', alignItems: 'start' }}>
        {/* LEFT */}
        <div>
          {/* Token header */}
          <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', padding: '1.25rem', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {token.imageUrl
                ? <img src={token.imageUrl} alt={token.symbol} style={{ width: '52px', height: '52px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--copper)', flexShrink: 0 }} />
                : <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'var(--bg)', border: '2px solid var(--copper)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', flexShrink: 0 }}>🪖</div>
              }
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <span style={{ fontFamily: 'Black Ops One, cursive', fontSize: '24px', color: 'var(--gold-b)' }}>${token.symbol}</span>
                  <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: '14px', color: 'var(--grey-l)' }}>{token.name}</span>
                  {token.graduated && <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: '10px', fontWeight: 700, color: 'var(--gold-b)', background: 'rgba(240,176,32,0.1)', border: '1px solid rgba(240,176,32,0.3)', padding: '2px 8px', letterSpacing: '0.1em' }}>⚡ GRADUATED</span>}
                </div>
                {token.description && <p style={{ fontFamily: 'Oswald, sans-serif', fontSize: '12px', color: 'var(--grey-l)', margin: '4px 0 0', lineHeight: 1.5 }}>{token.description}</p>}
              </div>
            </div>
            {/* Socials + contract */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border)' }}>
              {token.twitter  && <a href={token.twitter}  target="_blank" rel="noopener noreferrer" style={{ fontFamily: 'Oswald, sans-serif', fontSize: '11px', color: 'var(--copper)', textDecoration: 'none' }}>Twitter ↗</a>}
              {token.telegram && <a href={token.telegram} target="_blank" rel="noopener noreferrer" style={{ fontFamily: 'Oswald, sans-serif', fontSize: '11px', color: 'var(--copper)', textDecoration: 'none' }}>Telegram ↗</a>}
              {token.website  && <a href={token.website}  target="_blank" rel="noopener noreferrer" style={{ fontFamily: 'Oswald, sans-serif', fontSize: '11px', color: 'var(--copper)', textDecoration: 'none' }}>Website ↗</a>}
              <a href={`https://basescan.org/address/${address}`} target="_blank" rel="noopener noreferrer" style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '11px', color: 'var(--grey-l)', textDecoration: 'none', marginLeft: 'auto' }}>
                {address.slice(0,6)}...{address.slice(-4)} ↗
              </a>
            </div>
          </div>

          {/* CHART SECTION */}
          <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', padding: '1.25rem', marginBottom: '1rem' }}>
            {token.graduated ? (
              <>
                <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '11px', fontWeight: 700, color: 'var(--gold-b)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1rem' }}>
                  ⚡ Live Chart — Uniswap V3 on Base
                </div>
                <DexChart tokenAddress={address} />
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <a href={`https://app.uniswap.org/swap?outputCurrency=${address}&chain=base`} target="_blank" rel="noopener noreferrer"
                    style={{ fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: '13px', color: '#060504', background: 'linear-gradient(135deg,var(--gold-b),#f0c040)', padding: '0.6rem 1.25rem', textDecoration: 'none', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                    Trade on Uniswap ↗
                  </a>
                  {token.lpAddress && (
                    <a href={`https://basescan.org/address/${token.lpAddress}`} target="_blank" rel="noopener noreferrer"
                      style={{ fontFamily: 'Oswald, sans-serif', fontWeight: 600, fontSize: '13px', color: 'var(--gold-b)', background: 'transparent', border: '1px solid rgba(240,176,32,0.4)', padding: '0.6rem 1.25rem', textDecoration: 'none', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                      View LP Pool ↗
                    </a>
                  )}
                </div>
              </>
            ) : (
              <>
                <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '11px', fontWeight: 700, color: 'var(--copper)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1rem' }}>
                  Bonding Curve
                </div>
                <BondingCurveChart bondPercent={token.bondPercent} bondedEth={token.bondedEth} bondTarget={token.bondTarget} />
                {/* Stats below curve */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1px', background: 'var(--border)', marginTop: '1rem' }}>
                  {[
                    ['Bonded',    `${token.bondedEth.toFixed(4)} ETH`],
                    ['To Grad',   `${(token.bondTarget - token.bondedEth).toFixed(4)} ETH`],
                    ['Progress',  `${token.bondPercent.toFixed(2)}%`],
                    ['Armory',    `${token.armoryBalance.toFixed(4)} ETH`],
                  ].map(([l, v]) => (
                    <div key={l} style={{ background: 'var(--bg)', padding: '0.75rem', textAlign: 'center' }}>
                      <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '13px', color: 'var(--cream)' }}>{v}</div>
                      <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '9px', color: 'var(--grey)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '2px' }}>{l}</div>
                    </div>
                  ))}
                </div>
                {/* Progress bar */}
                <div style={{ marginTop: '0.75rem' }}>
                  <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)' }}>
                    <div style={{ height: '100%', width: `${token.bondPercent}%`, background: token.bondPercent > 90 ? 'linear-gradient(90deg,var(--red),var(--red-b))' : 'linear-gradient(90deg,var(--copper),var(--gold-b))', transition: 'width 0.5s ease' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                    <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '10px', color: 'var(--grey)' }}>0 ETH</span>
                    <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '10px', color: 'var(--gold-b)' }}>{token.bondTarget} ETH — GRADUATION</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Creator info */}
          {token.creator && (
            <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', padding: '1rem', display: 'flex', gap: '1rem' }}>
              <div>
                <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '9px', color: 'var(--grey)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '2px' }}>Creator</div>
                <a href={`https://basescan.org/address/${token.creator}`} target="_blank" rel="noopener noreferrer" style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '12px', color: 'var(--copper)', textDecoration: 'none' }}>
                  {token.creator.slice(0,8)}...{token.creator.slice(-6)} ↗
                </a>
              </div>
              <div>
                <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '9px', color: 'var(--grey)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '2px' }}>Curve</div>
                <a href={`https://basescan.org/address/${token.curve}`} target="_blank" rel="noopener noreferrer" style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '12px', color: 'var(--grey-l)', textDecoration: 'none' }}>
                  {token.curve.slice(0,8)}...{token.curve.slice(-4)} ↗
                </a>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: Trade panel */}
        <div style={{ position: 'sticky', top: '72px' }}>
          <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', padding: '1.25rem' }}>
            {token.graduated ? (
              <div style={{ textAlign: 'center', padding: '0.5rem' }}>
                <div style={{ fontFamily: 'Black Ops One, cursive', fontSize: '20px', color: 'var(--gold-b)', marginBottom: '0.5rem' }}>⚡ Graduated</div>
                <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '13px', color: 'var(--grey-l)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                  This token has graduated from the bonding curve and now trades on Uniswap V3.
                </div>
                <a href={`https://app.uniswap.org/swap?outputCurrency=${address}&chain=base`} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'block', fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: '14px', color: '#060504', background: 'linear-gradient(135deg,var(--gold-b),#f0c040)', padding: '1rem', textDecoration: 'none', letterSpacing: '0.15em', textTransform: 'uppercase', textAlign: 'center', marginBottom: '0.75rem' }}>
                  Trade on Uniswap ↗
                </a>
                {token.lpAddress && (
                  <a href={`https://dexscreener.com/base/${address}`} target="_blank" rel="noopener noreferrer"
                    style={{ display: 'block', fontFamily: 'Oswald, sans-serif', fontWeight: 600, fontSize: '13px', color: 'var(--copper)', background: 'transparent', border: '1px solid rgba(184,112,64,0.4)', padding: '0.75rem', textDecoration: 'none', letterSpacing: '0.1em', textTransform: 'uppercase', textAlign: 'center' }}>
                    View on DexScreener ↗
                  </a>
                )}
              </div>
            ) : (
              <>
                {/* Buy/Sell tabs */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', marginBottom: '1.25rem', border: '1px solid var(--border)' }}>
                  {(['buy', 'sell'] as const).map(t => (
                    <button key={t} onClick={() => setTab(t)} style={{ fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: '13px', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0.65rem', border: 'none', cursor: 'crosshair', background: tab === t ? (t === 'buy' ? 'rgba(58,153,72,0.2)' : 'rgba(255,51,17,0.2)') : 'transparent', color: tab === t ? (t === 'buy' ? '#3a9948' : 'var(--red-b)') : 'var(--grey-l)', borderBottom: tab === t ? `2px solid ${t === 'buy' ? '#3a9948' : 'var(--red-b)'}` : '2px solid transparent' }}>
                      {t === 'buy' ? '▲ BUY' : '▼ SELL'}
                    </button>
                  ))}
                </div>

                <label style={{ fontFamily: 'Oswald, sans-serif', fontSize: '10px', fontWeight: 700, color: 'var(--copper)', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                  {tab === 'buy' ? 'ETH Amount' : 'Token Amount'}
                </label>
                <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder={tab === 'buy' ? '0.01' : '1000000'}
                  style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--cream)', fontFamily: 'Share Tech Mono, monospace', fontSize: '15px', padding: '10px', outline: 'none', boxSizing: 'border-box', marginBottom: '0.75rem' }} />

                {tab === 'buy' && (
                  <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.75rem' }}>
                    {['0.01', '0.05', '0.1', '0.5'].map(v => (
                      <button key={v} onClick={() => setAmount(v)} style={{ flex: 1, fontFamily: 'Share Tech Mono, monospace', fontSize: '10px', color: 'var(--copper)', background: 'rgba(184,112,64,0.08)', border: '1px solid rgba(184,112,64,0.2)', padding: '5px 0', cursor: 'crosshair' }}>{v}</button>
                    ))}
                  </div>
                )}

                {isSuccess && (
                  <div style={{ background: 'rgba(58,153,72,0.1)', border: '1px solid rgba(58,153,72,0.3)', padding: '0.65rem', marginBottom: '0.75rem', fontFamily: 'Oswald, sans-serif', fontSize: '12px', color: '#3a9948' }}>
                    ✓ Confirmed!{' '}
                    {txHash && <a href={`https://basescan.org/tx/${txHash}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--copper)' }}>View tx ↗</a>}
                  </div>
                )}

                <button onClick={handleTrade} disabled={isPending || isConfirming} style={{ width: '100%', padding: '0.9rem', fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: '14px', color: '#fff', letterSpacing: '0.15em', textTransform: 'uppercase', border: 'none', cursor: 'crosshair', background: isPending || isConfirming ? 'rgba(255,255,255,0.1)' : tab === 'buy' ? 'linear-gradient(135deg,#1a6b2a,#3a9948)' : 'linear-gradient(135deg,var(--red),var(--red-b))' }}>
                  {!isConnected ? '⚔ CONNECT WALLET' : isPending ? '⏳ CONFIRM...' : isConfirming ? '⏳ CONFIRMING...' : tab === 'buy' ? `▲ BUY $${token.symbol}` : `▼ SELL $${token.symbol}`}
                </button>

                <div style={{ marginTop: '0.75rem', fontFamily: 'Share Tech Mono, monospace', fontSize: '10px', color: 'var(--grey)', lineHeight: 1.8, padding: '0.65rem', background: 'var(--bg)', border: '1px solid var(--border)' }}>
                  Buy fee: 2% (1% creator · 1% platform)<br />
                  Sell fee: 2% (1% platform · 1% armory)
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
