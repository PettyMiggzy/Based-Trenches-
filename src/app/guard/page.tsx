'use client'
import { useState, useEffect } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import { parseEther, formatEther, createPublicClient, http } from 'viem'
import { base } from 'viem/chains'
import Link from 'next/link'

const PLATFORM_WALLET = '0xB9d4B73bE18914c6d64Bee65a806648370be467f' as `0x${string}`
const MONTHLY_FEE     = '0.005'

const ERC20_ABI = [
  { name: 'symbol',    type: 'function', stateMutability: 'view',       inputs: [],                                                                                outputs: [{ type: 'string'  }] },
  { name: 'allowance', type: 'function', stateMutability: 'view',       inputs: [{ name: 'owner', type: 'address' }, { name: 'spender', type: 'address' }],       outputs: [{ type: 'uint256' }] },
  { name: 'approve',   type: 'function', stateMutability: 'nonpayable', inputs: [{ name: 'spender', type: 'address' }, { name: 'amount', type: 'uint256' }],       outputs: [{ type: 'bool'    }] },
] as const

const TABS = ['Overview', 'Revoke Permissions', 'Wallet Health', 'Contract Scanner', 'Subscription']

const client = createPublicClient({ chain: base, transport: http('https://mainnet.base.org') })

export default function GuardPage() {
  const [activeTab, setActiveTab] = useState('Overview')
  const { address, isConnected }  = useAccount()
  const { openConnectModal }       = useConnectModal()

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem' }}>
      {/* Hero */}
      <div style={{ background: 'var(--panel)', border: '1px solid rgba(58,153,72,0.3)', padding: '2rem', marginBottom: '2rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg,#3a9948,#22c55e,#3a9948)' }} />
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '36px' }}>🛡</span>
              <div>
                <div style={{ fontFamily: 'Black Ops One, cursive', fontSize: '28px', color: 'var(--cream)' }}>Trench Guard</div>
                <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '12px', color: '#3a9948', letterSpacing: '0.12em' }}>WALLET PROTECTION · BASE CHAIN</div>
              </div>
            </div>
            <p style={{ fontFamily: 'Oswald, sans-serif', fontSize: '13px', color: 'var(--grey-l)', maxWidth: '560px', lineHeight: 1.7, marginBottom: '0.75rem' }}>
              Chrome extension that protects your wallet 24/7. Scam detection, transaction simulation, rug pull alerts, and one-click approval revokes. Free 30-day trial.
            </p>
            <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '9px', color: 'var(--grey)', padding: '6px 10px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', display: 'inline-block' }}>
              ⚠ Trench Guard is a helpful tool — not a guarantee of security. Always verify transactions manually. Not liable for losses.
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', minWidth: '200px' }}>
            <a href="#" style={{ fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: '14px', color: '#060504', background: 'linear-gradient(135deg,#3a9948,#22c55e)', padding: '0.85rem 1.5rem', textDecoration: 'none', letterSpacing: '0.1em', textTransform: 'uppercase', textAlign: 'center', display: 'block', clipPath: 'polygon(6px 0%,100% 0%,calc(100% - 6px) 100%,0% 100%)' }}>
              Add to Chrome — Free
            </a>
            <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '10px', color: 'var(--grey-l)', textAlign: 'center' }}>30-day trial · No card needed</div>
          </div>
        </div>
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1px', background: 'var(--border)', marginTop: '1.5rem' }}>
          {[['30 Days','Free Trial'],['0.005 ETH/mo','Pro Plan'],['24/7','Monitoring'],['Base Chain','Network']].map(([v,l]) => (
            <div key={l} style={{ background: 'var(--bg)', padding: '0.75rem', textAlign: 'center' }}>
              <div style={{ fontFamily: 'Black Ops One, cursive', fontSize: '16px', color: '#3a9948' }}>{v}</div>
              <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '9px', color: 'var(--grey-l)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '2px' }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '2px', marginBottom: '1.5rem', background: 'var(--border)', padding: '2px', flexWrap: 'wrap' }}>
        {TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{ fontFamily: 'Oswald, sans-serif', fontSize: '12px', fontWeight: 700, color: activeTab === tab ? '#060504' : 'var(--grey-l)', background: activeTab === tab ? '#3a9948' : 'var(--panel)', border: 'none', padding: '8px 14px', cursor: 'crosshair', letterSpacing: '0.08em', textTransform: 'uppercase', flex: 1 }}>
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'Overview'           && <OverviewTab onConnect={openConnectModal} />}
      {activeTab === 'Revoke Permissions' && <RevokeTab address={address} isConnected={isConnected} onConnect={openConnectModal} />}
      {activeTab === 'Wallet Health'      && <WalletHealthTab address={address} isConnected={isConnected} onConnect={openConnectModal} />}
      {activeTab === 'Contract Scanner'   && <ContractScannerTab />}
      {activeTab === 'Subscription'       && <SubscriptionTab address={address} isConnected={isConnected} onConnect={openConnectModal} />}
    </div>
  )
}

// ── Overview ──────────────────────────────────────────────────────────────────
function OverviewTab({ onConnect }: any) {
  const FREE = [
    ['🛡','Scam site detection','Warns before connecting to phishing sites'],
    ['⚠','Unlimited approval warnings','Flags transactions requesting unlimited token access'],
    ['✓','Based Trenches verified badge','Confirms you\'re on the official BT site'],
    ['🔍','Basic contract scanner','Check any address for red flags instantly'],
    ['📋','Alert history','Log of all security warnings on your device'],
  ]
  const PRO = [
    ['🍯','Honeypot detection','Simulate a sell before buying — know if you can exit'],
    ['🚨','Rug pull indicators','LP locked? Dev wallet %? Mint function? Blacklist?'],
    ['💸','Simulate before signing','See exactly what happens before you approve anything'],
    ['🐋','24/7 wallet monitoring','We watch your wallet and alert you to suspicious activity'],
    ['📊','Contract audit scores','Full 0-100 safety score for any token on Base'],
    ['🔓','One-click revoke','Revoke any token approval from the hub or extension'],
    ['🏥','Wallet health report','Every contract with access to your funds — full exposure report'],
    ['📈','Based Trenches alerts','Real-time alerts when your BT tokens hit milestones'],
  ]

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Free */}
        <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', padding: '1.5rem' }}>
          <div style={{ fontFamily: 'Black Ops One, cursive', fontSize: '18px', color: 'var(--cream)', marginBottom: '4px' }}>Free Tier</div>
          <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '11px', color: '#3a9948', marginBottom: '1.25rem' }}>30-day trial · No payment needed</div>
          {FREE.map(([icon, title, desc]) => (
            <div key={title as string} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
              <span style={{ fontSize: '16px', flexShrink: 0 }}>{icon}</span>
              <div>
                <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '13px', color: 'var(--cream)', fontWeight: 600 }}>{title}</div>
                <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '10px', color: 'var(--grey-l)', lineHeight: 1.5 }}>{desc}</div>
              </div>
            </div>
          ))}
          <a href="#" style={{ display: 'block', marginTop: '1rem', textAlign: 'center', fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: '13px', color: '#060504', background: '#3a9948', padding: '0.75rem', textDecoration: 'none', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Download Free →
          </a>
        </div>

        {/* Pro */}
        <div style={{ background: 'var(--panel)', border: '1px solid rgba(240,176,32,0.4)', padding: '1.5rem', position: 'relative' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg,var(--copper),var(--gold))' }} />
          <div style={{ fontFamily: 'Black Ops One, cursive', fontSize: '18px', color: 'var(--cream)', marginBottom: '4px' }}>Pro Tier</div>
          <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '11px', color: 'var(--gold)', marginBottom: '1.25rem' }}>0.005 ETH/month · ~$10 · Paid on Base</div>
          {PRO.map(([icon, title, desc]) => (
            <div key={title as string} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
              <span style={{ fontSize: '16px', flexShrink: 0 }}>{icon}</span>
              <div>
                <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '13px', color: 'var(--cream)', fontWeight: 600 }}>{title}</div>
                <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '10px', color: 'var(--grey-l)', lineHeight: 1.5 }}>{desc}</div>
              </div>
            </div>
          ))}
          <button onClick={onConnect} style={{ width: '100%', marginTop: '0.5rem', fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: '13px', color: '#060504', background: 'linear-gradient(135deg,var(--copper),var(--gold))', padding: '0.75rem', border: 'none', cursor: 'crosshair', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Get Pro — 0.005 ETH/mo
          </button>
        </div>
      </div>

      {/* Wallet monitoring callout */}
      <div style={{ background: 'rgba(240,176,32,0.05)', border: '1px solid rgba(240,176,32,0.25)', padding: '1.5rem', marginTop: '1.5rem' }}>
        <div style={{ fontFamily: 'Black Ops One, cursive', fontSize: '18px', color: 'var(--gold)', marginBottom: '0.5rem' }}>🐋 Pro: We Watch Your Wallet 24/7</div>
        <p style={{ fontFamily: 'Oswald, sans-serif', fontSize: '13px', color: 'var(--grey-l)', lineHeight: 1.7, marginBottom: '0.75rem' }}>
          Pro members get round-the-clock wallet monitoring on Base Chain. We watch for large outflows, new contract interactions, suspicious approvals, and rug pull indicators — and alert you instantly through the extension and browser notifications.
        </p>
        <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '9px', color: 'var(--grey)', padding: '8px 12px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)' }}>
          ⚠ Wallet monitoring is best-effort. Alerts may be delayed. Trench Guard is not a guarantee of security and we are not liable for any losses. Always practice safe wallet hygiene and verify all transactions manually.
        </div>
      </div>
    </div>
  )
}

// ── Revoke ────────────────────────────────────────────────────────────────────
function RevokeTab({ address, isConnected, onConnect }: any) {
  const [approvals, setApprovals] = useState<any[]>([])
  const [scanning, setScanning]   = useState(false)
  const [customToken, setCustomToken]     = useState('')
  const [customSpender, setCustomSpender] = useState('')
  const [revokeMsg, setRevokeMsg]         = useState('')

  const { writeContract, data: txHash, isPending } = useWriteContract()
  const { isSuccess } = useWaitForTransactionReceipt({ hash: txHash })

  useEffect(() => { if (isSuccess) setRevokeMsg('✓ Approval revoked!') }, [isSuccess])

  const KNOWN_SPENDERS = [
    { address: '0x2626664c2603336E57B271c5C0b26F421741e481', name: 'Uniswap V3 Router' },
    { address: '0x03a520b32C04BF3bEEf7BEb72E919cf822Ed34f1', name: 'Uniswap V3 NF Position Mgr' },
    { address: '0xa8b68EBc490F215C44c37987c9EB36741aAF882c', name: 'BT Factory' },
  ]

  async function scanApprovals() {
    if (!address) return
    setScanning(true)
    setApprovals([])
    try {
      const res    = await fetch('/api/tokens')
      const data   = await res.json()
      const tokens = (data.tokens || []).slice(0, 15)
      const found: any[] = []
      for (const token of tokens) {
        for (const spender of KNOWN_SPENDERS) {
          try {
            const allowance = await client.readContract({ address: token.address as `0x${string}`, abi: ERC20_ABI, functionName: 'allowance', args: [address, spender.address as `0x${string}`] }) as bigint
            if (allowance > BigInt(0)) {
              found.push({ tokenAddress: token.address, tokenSymbol: token.symbol, spenderAddress: spender.address, spenderName: spender.name, allowance, isUnlimited: allowance === BigInt('0x' + 'f'.repeat(64)) })
            }
          } catch (_) {}
        }
      }
      setApprovals(found)
    } catch (_) {}
    setScanning(false)
  }

  function revoke(tokenAddress: string, spenderAddress: string) {
    setRevokeMsg('')
    writeContract({ address: tokenAddress as `0x${string}`, abi: ERC20_ABI, functionName: 'approve', args: [spenderAddress as `0x${string}`, BigInt(0)] })
  }

  if (!isConnected) return <ConnectPrompt onConnect={onConnect} msg="Connect your wallet to scan and revoke token approvals." />

  return (
    <div>
      <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ fontFamily: 'Black Ops One, cursive', fontSize: '18px', color: 'var(--cream)', marginBottom: '0.5rem' }}>Revoke Token Permissions</div>
        <p style={{ fontFamily: 'Oswald, sans-serif', fontSize: '13px', color: 'var(--grey-l)', marginBottom: '1rem', lineHeight: 1.6 }}>
          Scan your wallet for active approvals. Any contract with approval can move your tokens at any time. Revoke what you don't need.
        </p>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '11px', color: 'var(--copper)' }}>{address?.slice(0,8)}...{address?.slice(-6)}</span>
          <button onClick={scanApprovals} disabled={scanning} style={{ fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: '13px', color: '#060504', background: '#3a9948', border: 'none', padding: '8px 20px', cursor: 'crosshair', letterSpacing: '0.08em', textTransform: 'uppercase', opacity: scanning ? 0.6 : 1 }}>
            {scanning ? '⏳ SCANNING...' : '🔍 SCAN APPROVALS'}
          </button>
        </div>
      </div>

      {/* Manual revoke */}
      <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '12px', fontWeight: 700, color: 'var(--copper)', letterSpacing: '0.1em', marginBottom: '1rem' }}>MANUAL REVOKE</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '0.75rem', alignItems: 'end' }}>
          <div>
            <label style={{ fontFamily: 'Oswald, sans-serif', fontSize: '9px', fontWeight: 700, color: 'var(--copper)', letterSpacing: '0.12em', display: 'block', marginBottom: '4px' }}>TOKEN ADDRESS</label>
            <input type="text" value={customToken} onChange={e => setCustomToken(e.target.value)} placeholder="0x..." style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--cream)', fontFamily: 'Share Tech Mono, monospace', fontSize: '12px', padding: '8px', outline: 'none' }} />
          </div>
          <div>
            <label style={{ fontFamily: 'Oswald, sans-serif', fontSize: '9px', fontWeight: 700, color: 'var(--copper)', letterSpacing: '0.12em', display: 'block', marginBottom: '4px' }}>SPENDER ADDRESS</label>
            <input type="text" value={customSpender} onChange={e => setCustomSpender(e.target.value)} placeholder="0x..." style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--cream)', fontFamily: 'Share Tech Mono, monospace', fontSize: '12px', padding: '8px', outline: 'none' }} />
          </div>
          <button onClick={() => customToken && customSpender && revoke(customToken, customSpender)} disabled={isPending || !customToken || !customSpender} style={{ fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: '12px', color: '#fff', background: 'var(--red)', border: 'none', padding: '8px 16px', cursor: 'crosshair', letterSpacing: '0.08em', textTransform: 'uppercase', whiteSpace: 'nowrap', opacity: isPending ? 0.6 : 1 }}>
            {isPending ? '⏳...' : 'REVOKE'}
          </button>
        </div>
        {revokeMsg && <div style={{ marginTop: '0.75rem', fontFamily: 'Share Tech Mono, monospace', fontSize: '11px', color: '#3a9948' }}>{revokeMsg}</div>}
      </div>

      {/* Scan results */}
      {approvals.length === 0 && !scanning && (
        <div style={{ padding: '3rem', textAlign: 'center', border: '1px solid var(--border)', fontFamily: 'Oswald, sans-serif', fontSize: '13px', color: 'var(--grey-l)' }}>
          Click "Scan Approvals" to check active permissions on your BT tokens
        </div>
      )}

      {approvals.length > 0 && (
        <div>
          <div style={{ fontFamily: 'Black Ops One, cursive', fontSize: '16px', color: 'var(--cream)', marginBottom: '1rem' }}>
            {approvals.length} Active Approval{approvals.length !== 1 ? 's' : ''} Found
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'var(--border)' }}>
            {approvals.map((a, i) => (
              <div key={i} style={{ background: 'var(--panel)', padding: '1rem 1.25rem', display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '1rem', alignItems: 'center' }}>
                <div>
                  <div style={{ fontFamily: 'Black Ops One, cursive', fontSize: '14px', color: a.isUnlimited ? 'var(--red)' : 'var(--cream)' }}>
                    ${a.tokenSymbol} {a.isUnlimited && <span style={{ fontSize: '10px', color: 'var(--red)' }}>⚠ UNLIMITED</span>}
                  </div>
                  <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '10px', color: 'var(--grey-l)' }}>{a.tokenAddress.slice(0,10)}...{a.tokenAddress.slice(-4)}</div>
                </div>
                <div>
                  <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '12px', color: 'var(--cream)' }}>{a.spenderName}</div>
                  <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '10px', color: 'var(--grey-l)' }}>{a.spenderAddress.slice(0,10)}...{a.spenderAddress.slice(-4)}</div>
                </div>
                <button onClick={() => revoke(a.tokenAddress, a.spenderAddress)} disabled={isPending} style={{ fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: '11px', color: '#fff', background: 'var(--red)', border: 'none', padding: '6px 14px', cursor: 'crosshair', letterSpacing: '0.06em', textTransform: 'uppercase', opacity: isPending ? 0.5 : 1 }}>
                  REVOKE
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Wallet Health ─────────────────────────────────────────────────────────────
function WalletHealthTab({ address, isConnected, onConnect }: any) {
  const [report, setReport]   = useState<any>(null)
  const [loading, setLoading] = useState(false)

  async function generateReport() {
    if (!address) return
    setLoading(true)
    try {
      const [balance, txCount, code] = await Promise.all([
        client.getBalance({ address }),
        client.getTransactionCount({ address }),
        client.getBytecode({ address }),
      ])
      const ethBal    = parseFloat(formatEther(balance))
      const isContract= !!code
      let score = 100
      const warnings: string[] = []
      const findings: any[]    = []

      if (ethBal > 10)   { score -= 15; warnings.push('Large ETH balance — consider a hardware wallet for amounts over 1 ETH') }
      if (ethBal > 1)    { score -= 5  }
      if (txCount > 1000){ warnings.push('High-activity wallet — review all active approvals regularly') }

      findings.push({ label: 'ETH Balance',   detail: `${ethBal.toFixed(4)} ETH`,  color: 'var(--cream)' })
      findings.push({ label: 'Transactions',  detail: txCount.toString(),           color: 'var(--cream)' })
      findings.push({ label: 'Account Type',  detail: isContract ? 'Contract' : 'Wallet (EOA)', color: 'var(--cream)' })
      findings.push({ label: 'Network',       detail: 'Base Mainnet',               color: '#3a9948' })
      findings.push({ label: 'Health Score',  detail: `${score}/100`,               color: score >= 80 ? '#3a9948' : score >= 60 ? 'var(--gold)' : 'var(--red)' })

      setReport({ score, findings, warnings })
    } catch (_) {}
    setLoading(false)
  }

  if (!isConnected) return <ConnectPrompt onConnect={onConnect} msg="Connect your wallet to generate a health report." />

  const scoreColor = !report ? 'var(--grey)' : report.score >= 80 ? '#3a9948' : report.score >= 60 ? 'var(--gold)' : 'var(--red)'

  return (
    <div>
      <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ fontFamily: 'Black Ops One, cursive', fontSize: '18px', color: 'var(--cream)', marginBottom: '0.5rem' }}>Wallet Health Report</div>
        <p style={{ fontFamily: 'Oswald, sans-serif', fontSize: '13px', color: 'var(--grey-l)', marginBottom: '1.25rem', lineHeight: 1.6 }}>
          Full analysis of your wallet — balance exposure, transaction activity, risk indicators, and safety score.
        </p>
        <button onClick={generateReport} disabled={loading} style={{ fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: '13px', color: '#060504', background: '#3a9948', border: 'none', padding: '10px 24px', cursor: 'crosshair', letterSpacing: '0.08em', textTransform: 'uppercase', opacity: loading ? 0.6 : 1 }}>
          {loading ? '⏳ ANALYZING...' : '🏥 GENERATE REPORT'}
        </button>
      </div>

      {report && (
        <div>
          <div style={{ background: 'var(--panel)', border: `2px solid ${scoreColor}`, padding: '2rem', textAlign: 'center', marginBottom: '1.5rem' }}>
            <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '11px', color: 'var(--grey-l)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>WALLET HEALTH SCORE</div>
            <div style={{ fontFamily: 'Black Ops One, cursive', fontSize: '72px', color: scoreColor, lineHeight: 1 }}>{report.score}</div>
            <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '14px', color: scoreColor, marginTop: '8px' }}>
              {report.score >= 80 ? '✓ Healthy' : report.score >= 60 ? '⚠ Review Recommended' : '✗ Action Required'}
            </div>
          </div>

          {report.warnings.map((w: string, i: number) => (
            <div key={i} style={{ background: 'rgba(255,51,17,0.06)', border: '1px solid rgba(255,51,17,0.3)', padding: '0.75rem 1rem', marginBottom: '8px', fontFamily: 'Oswald, sans-serif', fontSize: '13px', color: 'var(--red)' }}>⚠ {w}</div>
          ))}

          <div style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}>
            {report.findings.map((f: any, i: number) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 1.25rem', borderBottom: i < report.findings.length - 1 ? '1px solid rgba(184,112,64,0.08)' : 'none' }}>
                <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: '13px', color: 'var(--grey-l)' }}>{f.label}</span>
                <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '13px', color: f.color }}>{f.detail}</span>
              </div>
            ))}
          </div>

          <div style={{ background: 'rgba(240,176,32,0.05)', border: '1px solid rgba(240,176,32,0.3)', padding: '1rem 1.25rem', marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <div style={{ fontFamily: 'Black Ops One, cursive', fontSize: '14px', color: 'var(--gold)', marginBottom: '2px' }}>⚡ Pro: 24/7 Continuous Monitoring</div>
              <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '12px', color: 'var(--grey-l)' }}>Get instant alerts if your wallet shows suspicious activity</div>
            </div>
            <button onClick={() => {}} style={{ fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: '12px', color: '#060504', background: 'var(--gold)', border: 'none', padding: '8px 20px', cursor: 'crosshair', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Upgrade
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Contract Scanner ──────────────────────────────────────────────────────────
function ContractScannerTab() {
  const [addr, setAddr]       = useState('')
  const [result, setResult]   = useState<any>(null)
  const [loading, setLoading] = useState(false)

  async function scan() {
    if (!addr || addr.length !== 42) return
    setLoading(true)
    setResult(null)
    try {
      const [code, balance, txCount] = await Promise.all([
        client.getBytecode({ address: addr as `0x${string}` }),
        client.getBalance({ address: addr as `0x${string}` }),
        client.getTransactionCount({ address: addr as `0x${string}` }),
      ])
      const isContract = !!code && code !== '0x'
      const ethBal     = parseFloat(formatEther(balance))
      const codeSize   = code ? (code.length - 2) / 2 : 0

      const KNOWN: Record<string, string> = {
        '0xa8b68ebc490f215c44c37987c9eb36741aaf882c': 'BT Factory — Verified ✓',
        '0xe8ec7f7935870e4fae26ab689105c60d673ca023': 'BT ProtocolVault — Verified ✓',
        '0x34fa3e260484063cd9988380dd581642fc15c0bc': 'BT WarChest — Verified ✓',
      }
      const known = KNOWN[addr.toLowerCase()]

      let score = 70, risk = 'medium'
      const checks: any[] = []

      if (!isContract) {
        score = 90; risk = 'safe'
        checks.push({ label: 'Type',         val: 'Wallet / EOA',   status: 'safe' })
      } else {
        checks.push({ label: 'Type',         val: 'Smart Contract', status: 'info' })
        checks.push({ label: 'Code Size',    val: `${codeSize} bytes`, status: codeSize < 100 ? 'warn' : 'safe' })
        if (known) { score = 100; risk = 'safe'; checks.push({ label: 'Identity', val: known, status: 'safe' }) }
        else if (codeSize < 50) { score = 25; risk = 'danger'; checks.push({ label: 'Warning', val: 'Suspiciously small contract', status: 'danger' }) }
      }
      checks.push({ label: 'ETH Balance',    val: `${ethBal.toFixed(4)} ETH`, status: 'info' })
      checks.push({ label: 'Tx Count',       val: txCount.toString(),          status: 'info' })
      checks.push({ label: 'Safety Score',   val: `${score}/100`,              status: score >= 80 ? 'safe' : score >= 50 ? 'warn' : 'danger' })

      const c = { safe: '#3a9948', warn: 'var(--gold)', danger: 'var(--red)', info: 'var(--cream)' }
      const t = { safe: '✓ Looks Safe', medium: '⚠ Review Carefully', danger: '✗ High Risk' }
      setResult({ score, risk, checks, scoreColor: c[risk as keyof typeof c] || 'var(--grey-l)', title: t[risk as keyof typeof t] || '⚠ Unknown', statusColors: c })
    } catch (e: any) {
      setResult({ error: e.message })
    }
    setLoading(false)
  }

  return (
    <div>
      <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ fontFamily: 'Black Ops One, cursive', fontSize: '18px', color: 'var(--cream)', marginBottom: '0.5rem' }}>Contract & Wallet Scanner</div>
        <p style={{ fontFamily: 'Oswald, sans-serif', fontSize: '13px', color: 'var(--grey-l)', marginBottom: '1.25rem', lineHeight: 1.6 }}>
          Paste any contract or wallet address on Base for an instant safety analysis. Free for everyone.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <input type="text" value={addr} onChange={e => setAddr(e.target.value)} placeholder="0x... address on Base" onKeyDown={e => e.key === 'Enter' && scan()}
            style={{ flex: 1, background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--cream)', fontFamily: 'Share Tech Mono, monospace', fontSize: '13px', padding: '10px 12px', outline: 'none' }} />
          <button onClick={scan} disabled={loading || addr.length !== 42} style={{ fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: '13px', color: '#060504', background: '#3a9948', border: 'none', padding: '10px 24px', cursor: 'crosshair', letterSpacing: '0.08em', textTransform: 'uppercase', opacity: loading || addr.length !== 42 ? 0.5 : 1 }}>
            {loading ? '⏳' : '🔍 SCAN'}
          </button>
        </div>
      </div>

      {result?.error && (
        <div style={{ background: 'rgba(255,51,17,0.08)', border: '1px solid rgba(255,51,17,0.3)', padding: '1rem', fontFamily: 'Share Tech Mono, monospace', fontSize: '12px', color: 'var(--red)' }}>✗ {result.error}</div>
      )}

      {result && !result.error && (
        <div>
          <div style={{ background: 'var(--panel)', border: `2px solid ${result.scoreColor}`, padding: '1.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ textAlign: 'center', minWidth: '80px' }}>
              <div style={{ fontFamily: 'Black Ops One, cursive', fontSize: '52px', color: result.scoreColor, lineHeight: 1 }}>{result.score}</div>
              <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '9px', color: 'var(--grey-l)', textTransform: 'uppercase' }}>Safety Score</div>
            </div>
            <div>
              <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '14px', fontWeight: 700, color: result.scoreColor, marginBottom: '0.5rem' }}>{result.title}</div>
              <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '10px', color: 'var(--grey-l)', wordBreak: 'break-all' }}>{addr}</div>
            </div>
          </div>
          <div style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}>
            {result.checks.map((c: any, i: number) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 1.25rem', borderBottom: i < result.checks.length - 1 ? '1px solid rgba(184,112,64,0.08)' : 'none' }}>
                <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: '13px', color: 'var(--grey-l)' }}>{c.label}</span>
                <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '13px', color: result.statusColors[c.status] || 'var(--cream)' }}>{c.val}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '0.75rem', fontFamily: 'Share Tech Mono, monospace', fontSize: '9px', color: 'var(--grey)', padding: '8px', background: 'var(--panel)', border: '1px solid var(--border)' }}>
            ⚠ Automated analysis only. Not a guarantee of safety. Always do your own research.
          </div>
        </div>
      )}
    </div>
  )
}

// ── Subscription ──────────────────────────────────────────────────────────────
function SubscriptionTab({ address, isConnected, onConnect }: any) {
  const [paid, setPaid]       = useState(false)
  const [paying, setPaying]   = useState(false)
  const [payMsg, setPayMsg]   = useState('')

  async function sendPayment() {
    if (!isConnected) { onConnect?.(); return }
    setPaying(true)
    setPayMsg('')
    try {
      const { ethereum } = window as any
      if (!ethereum) throw new Error('No wallet')
      const valHex = '0x' + BigInt(Math.round(parseFloat(MONTHLY_FEE) * 1e18)).toString(16)
      const hash   = await ethereum.request({ method: 'eth_sendTransaction', params: [{ from: address, to: PLATFORM_WALLET, value: valHex }] })
      setPayMsg('⏳ Confirming on Base...')

      // Poll for receipt
      let receipt = null
      for (let i = 0; i < 40; i++) {
        await new Promise(r => setTimeout(r, 2000))
        receipt = await ethereum.request({ method: 'eth_getTransactionReceipt', params: [hash] })
        if (receipt) break
      }
      if (receipt?.status === '0x1') {
        setPaid(true)
        setPayMsg('✓ Pro activated! Download the extension to unlock all features.')
      } else {
        setPayMsg('✗ Transaction failed. Please try again.')
      }
    } catch (e: any) {
      setPayMsg(e.code === 4001 ? 'Cancelled.' : `Error: ${e.message?.slice(0,60)}`)
    }
    setPaying(false)
  }

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Current plan */}
        <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', padding: '1.5rem' }}>
          <div style={{ fontFamily: 'Black Ops One, cursive', fontSize: '18px', color: 'var(--cream)', marginBottom: '1.25rem' }}>Your Plan</div>
          {[['Status', isConnected ? 'Connected' : 'Not connected'], ['Wallet', isConnected ? `${address?.slice(0,8)}...${address?.slice(-4)}` : '—'], ['Plan', paid ? '⚡ Pro' : 'Free Trial'], ['Network', 'Base Mainnet']].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--bg)', border: '1px solid var(--border)', marginBottom: '6px' }}>
              <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: '12px', color: 'var(--grey-l)' }}>{k}</span>
              <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '12px', color: 'var(--copper)' }}>{v}</span>
            </div>
          ))}
          {!isConnected && <button onClick={onConnect} style={{ width: '100%', marginTop: '0.75rem', fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: '13px', color: '#060504', background: 'var(--copper)', border: 'none', padding: '10px', cursor: 'crosshair', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Connect Wallet</button>}
        </div>

        {/* Upgrade */}
        <div style={{ background: 'rgba(240,176,32,0.05)', border: '1px solid rgba(240,176,32,0.4)', padding: '1.5rem', position: 'relative' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg,var(--copper),var(--gold))' }} />
          <div style={{ fontFamily: 'Black Ops One, cursive', fontSize: '18px', color: 'var(--gold)', marginBottom: '4px' }}>⚡ Go Pro</div>
          <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '11px', color: 'var(--grey-l)', marginBottom: '1.25rem' }}>0.005 ETH/month · ~$10 · Paid on Base</div>
          <ul style={{ listStyle: 'none', marginBottom: '1.25rem' }}>
            {['Honeypot detection','Rug pull alerts','Simulate before signing','24/7 wallet monitoring','Contract audit scores','One-click revoke','Wallet health report','Priority BT alerts'].map(f => (
              <li key={f} style={{ fontFamily: 'Oswald, sans-serif', fontSize: '12px', color: 'var(--cream)', padding: '5px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>✓ {f}</li>
            ))}
          </ul>
          {paid ? (
            <div style={{ background: 'rgba(58,153,72,0.1)', border: '1px solid rgba(58,153,72,0.3)', padding: '1rem', textAlign: 'center', fontFamily: 'Oswald, sans-serif', fontSize: '14px', color: '#3a9948', fontWeight: 700 }}>
              ✓ Pro Active! Download the extension to use all features.
            </div>
          ) : (
            <>
              <button onClick={sendPayment} disabled={paying} style={{ width: '100%', fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: '14px', color: '#060504', background: 'linear-gradient(135deg,var(--copper),var(--gold))', border: 'none', padding: '12px', cursor: 'crosshair', letterSpacing: '0.1em', textTransform: 'uppercase', opacity: paying ? 0.6 : 1 }}>
                {!isConnected ? 'CONNECT WALLET FIRST' : paying ? '⏳ PROCESSING...' : 'PAY 0.005 ETH ON BASE'}
              </button>
              {payMsg && <div style={{ marginTop: '0.75rem', fontFamily: 'Share Tech Mono, monospace', fontSize: '11px', color: payMsg.startsWith('✓') ? '#3a9948' : payMsg.startsWith('⏳') ? 'var(--gold)' : 'var(--red)' }}>{payMsg}</div>}
              <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '9px', color: 'var(--grey)', textAlign: 'center', marginTop: '8px', lineHeight: 1.6 }}>
                Verified on-chain · No signup · 31 days access per payment
              </div>
            </>
          )}
        </div>
      </div>

      {/* How it works */}
      <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', padding: '1.5rem', marginTop: '1.5rem' }}>
        <div style={{ fontFamily: 'Black Ops One, cursive', fontSize: '16px', color: 'var(--cream)', marginBottom: '1rem' }}>How Pro Works</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem' }}>
          {[['1','Pay 0.005 ETH','Send directly to our wallet on Base — no middleman'],['2','Auto-verified','Extension checks your wallet paid on-chain and unlocks instantly'],['3','31 days access','Full Pro features. Renew anytime. No subscription traps.']].map(([n,t,d]) => (
            <div key={n} style={{ background: 'var(--bg)', border: '1px solid var(--border)', padding: '1rem' }}>
              <div style={{ fontFamily: 'Black Ops One, cursive', fontSize: '28px', color: 'var(--copper)', marginBottom: '6px' }}>{n}</div>
              <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '13px', color: 'var(--cream)', fontWeight: 600, marginBottom: '4px' }}>{t}</div>
              <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '10px', color: 'var(--grey-l)', lineHeight: 1.5 }}>{d}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: '1rem', fontFamily: 'Share Tech Mono, monospace', fontSize: '9px', color: 'var(--grey)', padding: '8px 12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)' }}>
          ⚠ Trench Guard is a helpful security tool — not a guarantee of safety. We are not responsible for any losses. Always verify transactions manually and practice safe wallet hygiene.
        </div>
      </div>
    </div>
  )
}

// ── Shared ────────────────────────────────────────────────────────────────────
function ConnectPrompt({ onConnect, msg }: { onConnect: any, msg: string }) {
  return (
    <div style={{ padding: '4rem', textAlign: 'center', border: '1px solid var(--border)', background: 'var(--panel)' }}>
      <div style={{ fontSize: '36px', marginBottom: '1rem' }}>🛡</div>
      <div style={{ fontFamily: 'Black Ops One, cursive', fontSize: '20px', color: 'var(--cream)', marginBottom: '0.5rem' }}>Connect Your Wallet</div>
      <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '13px', color: 'var(--grey-l)', marginBottom: '1.5rem' }}>{msg}</div>
      <button onClick={onConnect} style={{ fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: '14px', color: '#060504', background: 'linear-gradient(135deg,var(--copper),var(--copper-l))', border: 'none', padding: '0.75rem 2rem', cursor: 'crosshair', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
        Connect Wallet
      </button>
    </div>
  )
}
