'use client'
import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import Link from 'next/link'

const NAV_ITEMS = ['Overview', 'My Tokens', 'Deployed', 'Fortify Pools', 'Armory Controls', 'Creator Rewards', 'Settings']

export default function HQPage() {
  const [activeNav, setActiveNav] = useState('Overview')
  const { address, isConnected } = useAccount()
  const { openConnectModal } = useConnectModal()
  const [tokens, setTokens] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isConnected) return
    async function load() {
      try {
        const res = await fetch('/api/tokens')
        const data = await res.json()
        setTokens(data.tokens || [])
      } catch (_) {}
      finally { setLoading(false) }
    }
    load()
  }, [isConnected])

  const myDeployed = tokens.filter(t => t.creator?.toLowerCase() === address?.toLowerCase())
  const shortAddr = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '---'

  if (!isConnected) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 56px)', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ fontFamily: 'Black Ops One, cursive', fontSize: '24px', color: 'var(--cream)' }}>Connect to access HQ</div>
      <button onClick={openConnectModal} style={{ fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: '15px', color: '#060504', background: 'linear-gradient(135deg,var(--copper),var(--copper-l))', border: 'none', padding: '0.75rem 2.5rem', letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'crosshair' }}>
        Connect Wallet
      </button>
    </div>
  )

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', minHeight: 'calc(100vh - 56px)' }}>
      {/* Sidebar */}
      <div style={{ background: 'var(--panel)', borderRight: '1px solid var(--border)', padding: '1.5rem' }}>
        <div style={{ background: 'rgba(184,112,64,0.06)', border: '1px solid rgba(184,112,64,0.2)', padding: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '11px', color: 'var(--copper)', marginBottom: '0.25rem' }}>{shortAddr}</div>
          <div style={{ fontFamily: 'Black Ops One, cursive', fontSize: '18px', color: 'var(--cream)' }}>Commander</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {NAV_ITEMS.map(item => (
            <button key={item} onClick={() => setActiveNav(item)} style={{ fontFamily: 'Oswald, sans-serif', fontSize: '13px', fontWeight: 600, color: activeNav === item ? 'var(--cream)' : 'var(--grey-l)', background: activeNav === item ? 'rgba(184,112,64,0.08)' : 'none', border: 'none', borderLeft: activeNav === item ? '2px solid var(--copper)' : '2px solid transparent', padding: '0.65rem 0.75rem', cursor: 'crosshair', letterSpacing: '0.06em', textTransform: 'uppercase', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {item}
              {item === 'Deployed' && myDeployed.length > 0 && <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '9px', color: 'var(--copper)', background: 'rgba(184,112,64,0.12)', border: '1px solid rgba(184,112,64,0.2)', padding: '1px 5px', marginLeft: 'auto' }}>{myDeployed.length}</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Main */}
      <div style={{ padding: '2rem', overflowY: 'auto' }}>
        {activeNav === 'Overview' && <OverviewPanel deployed={myDeployed} address={address || ''} />}
        {activeNav === 'My Tokens' && <MyTokensPanel tokens={tokens} address={address || ''} />}
        {activeNav === 'Deployed' && <DeployedPanel tokens={myDeployed} loading={loading} />}
        {activeNav === 'Fortify Pools' && <FortifyPanel />}
        {activeNav === 'Armory Controls' && <ArmoryPanel tokens={myDeployed} />}
        {activeNav === 'Creator Rewards' && <RewardsPanel tokens={myDeployed} />}
        {activeNav === 'Settings' && <SettingsPanel address={address || ''} />}
      </div>
    </div>
  )
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
      <span style={{ fontFamily: 'Black Ops One, cursive', fontSize: '18px', color: 'var(--cream)' }}>{title}</span>
      <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
    </div>
  )
}

function StatBox({ v, u, l }: { v: string, u?: string, l: string }) {
  return (
    <div style={{ background: 'var(--deep)', border: '1px solid var(--border)', padding: '1.25rem', textAlign: 'center' }}>
      <div style={{ fontFamily: 'Black Ops One, cursive', fontSize: '22px', color: 'var(--copper-l)' }}>
        {v}{u && <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '12px', color: 'var(--copper)' }}> {u}</span>}
      </div>
      <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '9px', color: 'var(--grey-l)', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: '4px' }}>{l}</div>
    </div>
  )
}

function EmptyState({ msg }: { msg: string }) {
  return <div style={{ padding: '3rem', textAlign: 'center', border: '1px solid var(--border)', fontFamily: 'Oswald, sans-serif', fontSize: '14px', color: 'var(--grey-l)' }}>{msg}</div>
}

function OverviewPanel({ deployed, address }: { deployed: any[], address: string }) {
  return (
    <div>
      <SectionHeader title="Overview" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1px', background: 'var(--border)', marginBottom: '2rem' }}>
        <StatBox v={String(deployed.length)} l="Tokens Deployed" />
        <StatBox v="—" u="ETH" l="Creator Fees Earned" />
        <StatBox v="—" l="Portfolio Value" />
        <StatBox v="—" u="ETH" l="Staking Rewards" />
      </div>
      <SectionHeader title="Your Deployed Tokens" />
      {deployed.length === 0
        ? <div style={{ padding: '2rem', border: '1px solid var(--border)', fontFamily: 'Oswald, sans-serif', fontSize: '14px', color: 'var(--grey-l)', textAlign: 'center' }}>
            No tokens deployed yet. <Link href="/launch" style={{ color: 'var(--copper)', textDecoration: 'none' }}>Launch one →</Link>
          </div>
        : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: '1rem' }}>
            {deployed.map(t => <TokenMiniCard key={t.address} token={t} />)}
          </div>
      }
    </div>
  )
}

function MyTokensPanel({ tokens, address }: { tokens: any[], address: string }) {
  return (
    <div>
      <SectionHeader title="My Token Holdings" />
      <div style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', fontFamily: 'Share Tech Mono, monospace', fontSize: '9px', color: 'var(--grey)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          <span>Token</span><span>Bond %</span><span>Status</span><span>Action</span>
        </div>
        {tokens.length === 0
          ? <div style={{ padding: '2rem', textAlign: 'center', fontFamily: 'Oswald, sans-serif', fontSize: '13px', color: 'var(--grey-l)' }}>Connect wallet to see your holdings</div>
          : tokens.slice(0, 20).map(t => (
            <div key={t.address} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', padding: '0.75rem 1rem', borderBottom: '1px solid rgba(184,112,64,0.06)', alignItems: 'center' }}>
              <div>
                <div style={{ fontFamily: 'Black Ops One, cursive', fontSize: '14px', color: 'var(--cream)' }}>${t.symbol}</div>
                <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '10px', color: 'var(--grey-l)' }}>{t.name}</div>
              </div>
              <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '12px', color: 'var(--copper)' }}>{t.bondPercent.toFixed(1)}%</span>
              <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: '11px', color: t.graduated ? 'var(--gold-b)' : 'var(--green)', fontWeight: 700 }}>{t.graduated ? 'GRADUATED' : 'BONDING'}</span>
              <Link href={`/token/${t.address}`} style={{ fontFamily: 'Oswald, sans-serif', fontSize: '11px', color: 'var(--copper)', textDecoration: 'none', fontWeight: 700 }}>TRADE →</Link>
            </div>
          ))
        }
      </div>
    </div>
  )
}

function DeployedPanel({ tokens, loading }: { tokens: any[], loading: boolean }) {
  return (
    <div>
      <SectionHeader title="Your Deployed Tokens" />
      {loading && <EmptyState msg="Loading..." />}
      {!loading && tokens.length === 0 && (
        <div style={{ padding: '2rem', border: '1px solid var(--border)', textAlign: 'center' }}>
          <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '14px', color: 'var(--grey-l)', marginBottom: '1rem' }}>You haven't deployed any tokens yet.</div>
          <Link href="/launch" style={{ fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: '13px', color: '#060504', background: 'var(--copper)', padding: '0.6rem 1.5rem', textDecoration: 'none', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Launch a Token</Link>
        </div>
      )}
      {!loading && tokens.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '1rem' }}>
          {tokens.map(t => <TokenMiniCard key={t.address} token={t} showFull />)}
        </div>
      )}
    </div>
  )
}

function TokenMiniCard({ token, showFull }: { token: any, showFull?: boolean }) {
  return (
    <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', padding: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
        <div style={{ fontFamily: 'Black Ops One, cursive', fontSize: '16px', color: 'var(--cream)' }}>${token.symbol}</div>
        <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: '10px', fontWeight: 700, color: token.graduated ? 'var(--gold-b)' : 'var(--copper)', background: token.graduated ? 'rgba(240,176,32,0.1)' : 'rgba(184,112,64,0.1)', border: `1px solid ${token.graduated ? 'rgba(240,176,32,0.3)' : 'rgba(184,112,64,0.3)'}`, padding: '2px 8px', letterSpacing: '0.1em' }}>
          {token.graduated ? 'GRADUATED' : 'BONDING'}
        </span>
      </div>
      {!token.graduated && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: '11px', color: 'var(--grey-l)' }}>{token.bondPercent.toFixed(1)}% bonded</span>
            <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '11px', color: 'var(--copper)' }}>{token.bondedEth.toFixed(3)} / {token.bondTarget} ETH</span>
          </div>
          <div style={{ height: '4px', background: 'rgba(255,255,255,0.06)', marginBottom: '0.75rem' }}>
            <div style={{ height: '100%', width: `${token.bondPercent}%`, background: 'linear-gradient(90deg,var(--copper),var(--gold-b))' }} />
          </div>
        </>
      )}
      {token.graduated && (
        <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '11px', color: 'var(--gold-b)', marginBottom: '0.75rem' }}>
          ⚡ Live on Uniswap V3
          {token.lpAddress && <a href={`https://basescan.org/address/${token.lpAddress}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--copper)', marginLeft: '0.5rem' }}>LP ↗</a>}
        </div>
      )}
      <Link href={`/token/${token.address}`} style={{ fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: '11px', color: 'var(--copper)', textDecoration: 'none', letterSpacing: '0.08em', textTransform: 'uppercase' }}>VIEW TOKEN →</Link>
    </div>
  )
}

function FortifyPanel() {
  return (
    <div>
      <SectionHeader title="Fortify Staking Pools" />
      <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', padding: '2rem', textAlign: 'center' }}>
        <div style={{ fontFamily: 'Black Ops One, cursive', fontSize: '20px', color: 'var(--cream)', marginBottom: '0.5rem' }}>Fortify Staking</div>
        <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '13px', color: 'var(--grey-l)', marginBottom: '1.5rem' }}>
          Stake tokens to earn ETH rewards. Lock longer for higher multipliers.<br />
          30d = 1x · 60d = 1.5x · 90d = 2x · 180d = 3x
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1px', background: 'var(--border)', marginBottom: '1.5rem' }}>
          {[['30 Days','1x'],['60 Days','1.5x'],['90 Days','2x'],['180 Days','3x']].map(([d,m]) => (
            <div key={d} style={{ background: 'var(--deep)', padding: '1rem', textAlign: 'center' }}>
              <div style={{ fontFamily: 'Black Ops One, cursive', fontSize: '20px', color: 'var(--gold-b)' }}>{m}</div>
              <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '10px', color: 'var(--grey-l)', marginTop: '4px' }}>{d}</div>
            </div>
          ))}
        </div>
        <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '11px', color: 'var(--grey)', padding: '1rem', border: '1px solid var(--border)' }}>
          Navigate to a specific token page to stake its tokens in the Fortify pool.
        </div>
      </div>
    </div>
  )
}

function ArmoryPanel({ tokens }: { tokens: any[] }) {
  return (
    <div>
      <SectionHeader title="Armory Controls" />
      {tokens.length === 0
        ? <EmptyState msg="Deploy a token to access Armory controls." />
        : tokens.map(t => (
          <div key={t.address} style={{ background: 'var(--panel)', border: '1px solid var(--border)', padding: '1.25rem', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ fontFamily: 'Black Ops One, cursive', fontSize: '16px', color: 'var(--cream)' }}>${t.symbol} Armory</div>
              <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '12px', color: 'var(--copper)' }}>{t.armoryBalance.toFixed(4)} ETH</span>
            </div>
            <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '11px', color: 'var(--grey-l)', marginBottom: '1rem' }}>
              Armory: <a href={`https://basescan.org/address/${t.armory}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--copper)', textDecoration: 'none' }}>{t.armory?.slice(0,8)}...{t.armory?.slice(-4)} ↗</a>
            </div>
            <Link href={`/token/${t.address}`} style={{ fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: '12px', color: 'var(--copper)', textDecoration: 'none', letterSpacing: '0.08em', textTransform: 'uppercase' }}>MANAGE ON TOKEN PAGE →</Link>
          </div>
        ))
      }
    </div>
  )
}

function RewardsPanel({ tokens }: { tokens: any[] }) {
  const totalFees = tokens.reduce((sum, t) => sum + (t.bondedEth * 0.01), 0)
  return (
    <div>
      <SectionHeader title="Creator Rewards" />
      <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', padding: '1.5rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '10px', color: 'var(--grey-l)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '4px' }}>Estimated Creator Fees</div>
          <div style={{ fontFamily: 'Black Ops One, cursive', fontSize: '32px', color: 'var(--copper-l)' }}>
            {totalFees.toFixed(4)} <span style={{ fontSize: '16px', fontFamily: 'Share Tech Mono, monospace', color: 'var(--copper)' }}>ETH</span>
          </div>
          <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '11px', color: 'var(--grey-l)', marginTop: '4px' }}>
            1% of buy volume across {tokens.length} deployed token{tokens.length !== 1 ? 's' : ''} · paid directly to your wallet
          </div>
        </div>
      </div>
      {tokens.length === 0
        ? <EmptyState msg="Deploy a token to start earning creator fees." />
        : <div style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', fontFamily: 'Share Tech Mono, monospace', fontSize: '9px', color: 'var(--grey)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              <span>Token</span><span>Bond</span><span>Est. Fees</span><span>Status</span>
            </div>
            {tokens.map(t => (
              <div key={t.address} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', padding: '0.75rem 1rem', borderBottom: '1px solid rgba(184,112,64,0.06)', alignItems: 'center' }}>
                <div style={{ fontFamily: 'Black Ops One, cursive', fontSize: '14px', color: 'var(--cream)' }}>${t.symbol}</div>
                <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '12px', color: 'var(--copper)' }}>{t.bondedEth.toFixed(3)} ETH</span>
                <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '12px', color: 'var(--cream)' }}>{(t.bondedEth * 0.01).toFixed(4)} ETH</span>
                <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: '11px', color: t.graduated ? 'var(--gold-b)' : 'var(--green)', fontWeight: 700 }}>{t.graduated ? 'GRAD' : 'LIVE'}</span>
              </div>
            ))}
          </div>
      }
    </div>
  )
}

function SettingsPanel({ address }: { address: string }) {
  return (
    <div>
      <SectionHeader title="Settings" />
      <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', padding: '1.5rem', marginBottom: '1rem' }}>
        <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '10px', color: 'var(--grey-l)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>Connected Wallet</div>
        <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '14px', color: 'var(--copper)' }}>{address}</div>
      </div>
      <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', padding: '1.5rem' }}>
        <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '10px', color: 'var(--grey-l)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>Network</div>
        <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '14px', color: 'var(--cream)' }}>Base Mainnet (Chain ID: 8453)</div>
      </div>
    </div>
  )
}
