'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import { parseEther, formatEther } from 'viem'
import Link from 'next/link'

const CURVE_ABI = [
  {
    name: 'buy',
    type: 'function',
    stateMutability: 'payable',
    inputs: [{ name: 'minTokens', type: 'uint256' }],
    outputs: [{ type: 'uint256' }],
  },
  {
    name: 'sell',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'tokenAmount', type: 'uint256' }, { name: 'minEth', type: 'uint256' }],
    outputs: [{ type: 'uint256' }],
  },
] as const

export default function TokenPage() {
  const params = useParams()
  const address = params.id as string
  const { isConnected } = useAccount()
  const { openConnectModal } = useConnectModal()

  const [token, setToken] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tab, setTab] = useState<'buy' | 'sell'>('buy')
  const [amount, setAmount] = useState('')

  const { writeContract, data: txHash, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash })

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
    const interval = setInterval(load, 15_000)
    return () => { cancelled = true; clearInterval(interval) }
  }, [address])

  const handleTrade = () => {
    if (!isConnected) { openConnectModal?.(); return }
    if (!amount || !token) return
    if (tab === 'buy') {
      writeContract({
        address: token.curve,
        abi: CURVE_ABI,
        functionName: 'buy',
        value: parseEther(amount),
        args: [BigInt(0)], // minTokens = 0
      })
    } else {
      writeContract({
        address: token.curve,
        abi: CURVE_ABI,
        functionName: 'sell',
        args: [parseEther(amount), BigInt(0)],
      })
    }
  }

  if (loading) return (
    <div style={{ padding: '3rem', textAlign: 'center', fontFamily: 'Oswald, sans-serif', color: 'var(--grey-l)' }}>
      Loading token...
    </div>
  )

  if (error || !token) return (
    <div style={{ padding: '3rem', textAlign: 'center', fontFamily: 'Oswald, sans-serif', color: 'var(--red-b)' }}>
      {error || 'Token not found'}
      <br />
      <Link href="/" style={{ color: 'var(--copper)', textDecoration: 'none', fontSize: '13px' }}>← Back to Trenches</Link>
    </div>
  )

  return (
    <div style={{ padding: '2rem', maxWidth: '1280px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <Link href="/" style={{ fontFamily: 'Oswald, sans-serif', fontSize: '11px', color: 'var(--grey-l)', textDecoration: 'none' }}>← Trenches</Link>
        <span style={{ color: 'var(--border)' }}>/</span>
        <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '11px', color: 'var(--copper)' }}>${token.symbol}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '2rem', alignItems: 'start' }}>

        {/* Left: Token info */}
        <div>
          {/* Token header */}
          <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', padding: '1.5rem', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              {token.imageUri ? (
                <img src={token.imageUri} alt={token.symbol} style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--copper)' }} />
              ) : (
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--bg)', border: '2px solid var(--copper)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>🪖</div>
              )}
              <div>
                <div style={{ fontFamily: 'Black Ops One, cursive', fontSize: '28px', color: 'var(--gold-b)' }}>${token.symbol}</div>
                <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '14px', color: 'var(--grey-l)' }}>{token.name}</div>
              </div>
              {token.graduated && (
                <span style={{ marginLeft: 'auto', fontFamily: 'Oswald, sans-serif', fontSize: '11px', fontWeight: 700, color: '#3a9948', background: 'rgba(58,153,72,0.15)', border: '1px solid rgba(58,153,72,0.4)', padding: '4px 12px', letterSpacing: '0.1em' }}>
                  ⚡ GRADUATED
                </span>
              )}
            </div>

            {token.description && (
              <p style={{ fontFamily: 'Oswald, sans-serif', fontSize: '13px', color: 'var(--grey-l)', marginBottom: '1rem', lineHeight: 1.6 }}>{token.description}</p>
            )}

            {/* Socials */}
            <div style={{ display: 'flex', gap: '1rem' }}>
              {token.twitter && <a href={token.twitter} target="_blank" rel="noopener noreferrer" style={{ fontFamily: 'Oswald, sans-serif', fontSize: '11px', color: 'var(--copper)', textDecoration: 'none' }}>Twitter/X ↗</a>}
              {token.telegram && <a href={token.telegram} target="_blank" rel="noopener noreferrer" style={{ fontFamily: 'Oswald, sans-serif', fontSize: '11px', color: 'var(--copper)', textDecoration: 'none' }}>Telegram ↗</a>}
              {token.website && <a href={token.website} target="_blank" rel="noopener noreferrer" style={{ fontFamily: 'Oswald, sans-serif', fontSize: '11px', color: 'var(--copper)', textDecoration: 'none' }}>Website ↗</a>}
              <a href={`https://basescan.org/address/${address}`} target="_blank" rel="noopener noreferrer" style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '11px', color: 'var(--grey-l)', textDecoration: 'none' }}>
                {address.slice(0, 6)}...{address.slice(-4)} ↗
              </a>
            </div>
          </div>

          {/* Bonding curve */}
          <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', padding: '1.5rem', marginBottom: '1rem' }}>
            <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '11px', fontWeight: 700, color: 'var(--copper)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1rem' }}>Bonding Curve</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: '13px', color: 'var(--grey-l)' }}>{token.bondPercent.toFixed(2)}% bonded</span>
              <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '13px', color: 'var(--copper)' }}>{token.bondedEth.toFixed(4)} / {token.bondTarget} ETH</span>
            </div>
            <div style={{ height: '10px', background: 'rgba(255,255,255,0.06)', marginBottom: '0.75rem' }}>
              <div style={{ height: '100%', width: `${token.bondPercent}%`, background: token.bondPercent > 90 ? 'linear-gradient(90deg,var(--red),var(--red-b))' : 'linear-gradient(90deg,var(--copper),var(--gold-b))', transition: 'width 0.5s ease' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
              {[
                ['ETH to Grad', `${(token.bondTarget - token.bondedEth).toFixed(4)} ETH`],
                ['Armory', `${token.armoryBalance.toFixed(4)} ETH`],
                ['Creator', `${token.creator?.slice(0, 6)}...${token.creator?.slice(-4)}`],
              ].map(([label, val]) => (
                <div key={label} style={{ background: 'var(--bg)', border: '1px solid var(--border)', padding: '0.75rem' }}>
                  <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '9px', color: 'var(--grey)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '2px' }}>{label}</div>
                  <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '13px', color: 'var(--cream)' }}>{val}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Trade */}
        <div style={{ position: 'sticky', top: '80px' }}>
          <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', padding: '1.5rem' }}>
            {/* Buy/Sell tabs */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', marginBottom: '1.5rem', border: '1px solid var(--border)' }}>
              {(['buy', 'sell'] as const).map(t => (
                <button key={t} onClick={() => setTab(t)} style={{
                  fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: '14px', letterSpacing: '0.1em',
                  textTransform: 'uppercase', padding: '0.75rem', border: 'none', cursor: 'crosshair',
                  background: tab === t ? (t === 'buy' ? 'rgba(58,153,72,0.2)' : 'rgba(255,51,17,0.2)') : 'transparent',
                  color: tab === t ? (t === 'buy' ? '#3a9948' : 'var(--red-b)') : 'var(--grey-l)',
                  borderBottom: tab === t ? `2px solid ${t === 'buy' ? '#3a9948' : 'var(--red-b)'}` : '2px solid transparent',
                }}>
                  {t === 'buy' ? '▲ BUY' : '▼ SELL'}
                </button>
              ))}
            </div>

            <label style={{ fontFamily: 'Oswald, sans-serif', fontSize: '11px', fontWeight: 700, color: 'var(--copper)', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
              {tab === 'buy' ? 'ETH Amount' : 'Token Amount'}
            </label>
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder={tab === 'buy' ? '0.01' : '1000000'}
              style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--cream)', fontFamily: 'Share Tech Mono, monospace', fontSize: '16px', padding: '12px', outline: 'none', boxSizing: 'border-box', marginBottom: '1rem' }}
            />

            {/* Quick amounts */}
            {tab === 'buy' && (
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                {['0.01', '0.05', '0.1', '0.5'].map(v => (
                  <button key={v} onClick={() => setAmount(v)} style={{ flex: 1, fontFamily: 'Share Tech Mono, monospace', fontSize: '11px', color: 'var(--copper)', background: 'rgba(184,112,64,0.08)', border: '1px solid rgba(184,112,64,0.2)', padding: '6px 0', cursor: 'crosshair' }}>
                    {v}
                  </button>
                ))}
              </div>
            )}

            {isSuccess && (
              <div style={{ background: 'rgba(58,153,72,0.1)', border: '1px solid rgba(58,153,72,0.3)', padding: '0.75rem', marginBottom: '1rem', fontFamily: 'Oswald, sans-serif', fontSize: '12px', color: '#3a9948' }}>
                ✓ Transaction confirmed!{' '}
                {txHash && <a href={`https://basescan.org/tx/${txHash}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--copper)' }}>View ↗</a>}
              </div>
            )}

            <button
              onClick={handleTrade}
              disabled={isPending || isConfirming}
              style={{
                width: '100%', padding: '1rem', fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: '15px',
                color: '#fff', letterSpacing: '0.15em', textTransform: 'uppercase', border: 'none', cursor: 'crosshair',
                background: isPending || isConfirming ? 'rgba(255,255,255,0.1)' :
                  tab === 'buy' ? 'linear-gradient(135deg,#1a6b2a,#3a9948)' : 'linear-gradient(135deg,var(--red),var(--red-b))',
              }}
            >
              {!isConnected ? '⚔ CONNECT WALLET' :
               isPending ? '⏳ CONFIRM IN WALLET...' :
               isConfirming ? '⏳ CONFIRMING...' :
               tab === 'buy' ? `▲ BUY $${token.symbol}` : `▼ SELL $${token.symbol}`}
            </button>

            <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'var(--bg)', border: '1px solid var(--border)' }}>
              <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '10px', color: 'var(--grey)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '4px' }}>Buy Fee</div>
              <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '12px', color: 'var(--grey-l)' }}>2% (1% creator · 1% platform)</div>
              <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '10px', color: 'var(--grey)', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: '6px', marginBottom: '4px' }}>Sell Fee</div>
              <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '12px', color: 'var(--grey-l)' }}>2% (1% platform · 1% armory)</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
