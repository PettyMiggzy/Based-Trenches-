'use client'
import { useState, useEffect } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt, usePublicClient } from 'wagmi'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import { parseEther, formatEther, createPublicClient, http } from 'viem'
import { base } from 'viem/chains'
import Link from 'next/link'

const PLATFORM_WALLET = '0xB9d4B73bE18914c6d64Bee65a806648370be467f' as const
const MONTHLY_FEE = '0.005'

// ERC20 ABI for approvals
const ERC20_ABI = [
  { name: 'allowance',   type: 'function', stateMutability: 'view',        inputs: [{ name: 'owner', type: 'address' }, { name: 'spender', type: 'address' }], outputs: [{ type: 'uint256' }] },
  { name: 'approve',     type: 'function', stateMutability: 'nonpayable',  inputs: [{ name: 'spender', type: 'address' }, { name: 'amount', type: 'uint256' }], outputs: [{ type: 'bool' }] },
  { name: 'symbol',      type: 'function', stateMutability: 'view',        inputs: [], outputs: [{ type: 'string' }] },
  { name: 'name',        type: 'function', stateMutability: 'view',        inputs: [], outputs: [{ type: 'string' }] },
  { name: 'decimals',    type: 'function', stateMutability: 'view',        inputs: [], outputs: [{ type: 'uint8' }] },
] as const

const TABS = ['Overview', 'Revoke Permissions', 'Wallet Health', 'Token Scanner', 'Subscription']

export default function GuardPage() {
  const [activeTab, setActiveTab] = useState('Overview')
  const { address, isConnected } = useAccount()
  const { openConnectModal } = useConnectModal()

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem' }}>

      {/* Hero */}
      <div style={{ background: 'var(--panel)', border: '1px solid rgba(58,153,72,0.3)', padding: '2.5rem', marginBottom: '2rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg,var(--green),#22c55e,var(--green))' }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '32px' }}>🛡</span>
              <div>
                <div style={{ fontFamily: 'Black Ops One, cursive', fontSize: '28px', color: 'var(--cream)' }}>Trench Guard</div>
                <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '13px', color: '#3a9948', letterSpacing: '0.1em' }}>WALLET PROTECTION · BASE CHAIN</div>
              </div>
            </div>
            <p style={{ fontFamily: 'Oswald, sans-serif', fontSize: '14px', color: 'var(--grey-l)', maxWidth: '520px', lineHeight: 1.6 }}>
              Chrome extension that protects your wallet from scams, drainers, and honeypots.
              Free 30-day trial. Pro tier includes real-time monitoring, transaction simulation, and wallet exposure reports.
            </p>
            <div style={{ marginTop: '0.75rem', fontFamily: 'Share Tech Mono, monospace', fontSize: '10px', color: 'var(--grey)', padding: '6px 10px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', display: 'inline-block' }}>
              ⚠ DISCLAIMER: Trench Guard is a helpful security tool. No protection is 100% guaranteed. Always verify transactions manually before signing.
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <a href="https://chrome.google.com/webstore" target="_blank" rel="noopener noreferrer"
              style={{ fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: '14px', color: '#060504', background: 'linear-gradient(135deg,#3a9948,#22c55e)', padding: '0.85rem 2rem', textDecoration: 'none', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'inline-block', textAlign: 'center', clipPath: 'polygon(6px 0%,100% 0%,calc(100% - 6px) 100%,0% 100%)' }}>
              Add to Chrome — Free
            </a>
            <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '10px', color: 'var(--grey-l)', textAlign: 'center' }}>30-day free trial · No credit card</div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1px', background: 'var(--border)', marginTop: '2rem' }}>
          {[
            ['Free Trial', '30 Days'],
            ['Pro Plan', '0.005 ETH/mo'],
            ['Protection', '24/7'],
            ['Network', 'Base Chain'],
          ].map(([l, v]) => (
            <div key={l} style={{ background: 'var(--bg)', padding: '1rem', textAlign: 'center' }}>
              <div style={{ fontFamily: 'Black Ops One, cursive', fontSize: '18px', color: '#3a9948' }}>{v}</div>
              <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '9px', color: 'var(--grey-l)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '3px' }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '2px', marginBottom: '1.5rem', background: 'var(--border)', padding: '2px', flexWrap: 'wrap' }}>
        {TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            fontFamily: 'Oswald, sans-serif', fontSize: '12px', fontWeight: 700,
            color: activeTab === tab ? '#060504' : 'var(--grey-l)',
            background: activeTab === tab ? '#3a9948' : 'var(--panel)',
            border: 'none', padding: '8px 16px', cursor: 'crosshair',
            letterSpacing: '0.08em', textTransform: 'uppercase', flex: 1,
          }}>
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'Overview'            && <OverviewTab onConnect={openConnectModal} />}
      {activeTab === 'Revoke Permissions'  && <RevokeTab address={address} isConnected={isConnected} onConnect={openConnectModal} />}
      {activeTab === 'Wallet Health'       && <WalletHealthTab address={address} isConnected={isConnected} onConnect={openConnectModal} />}
      {activeTab === 'Token Scanner'       && <TokenScannerTab />}
      {activeTab === 'Subscription'        && <SubscriptionTab address={address} isConnected={isConnected} onConnect={openConnectModal} />}
    </div>
  )
}

// ── Overview ──────────────────────────────────────────────────────────────────
function OverviewTab({ onConnect }: { onConnect: any }) {
  const FREE_FEATURES = [
    ['🛡', 'Scam site detection', 'Warns you before connecting to known phishing sites'],
    ['⚠', 'Unlimited approval warning', 'Flags transactions that request unlimited token access'],
    ['✓', 'Based Trenches verified badge', 'Confirms you\'re on the official BT site'],
    ['🔍', 'Basic contract scanner', 'Check any address for red flags'],
    ['📋', 'Alert history', 'Log of all warnings triggered on your device'],
  ]

  const PRO_FEATURES = [
    ['🍯', 'Honeypot detection', 'Simulate a sell before you buy — know if you can get out'],
    ['🚨', 'Rug pull indicators', 'LP locked? Dev wallet %? Mint function? Blacklist?'],
    ['📊', 'Contract audit score', 'Full 0-100 safety score for any token contract'],
    ['🐋', 'Wallet monitoring', 'We watch your wallet 24/7 and alert you to suspicious activity'],
    ['💸', 'Transaction simulation', 'See exactly what happens before you sign anything'],
    ['🔓', 'Revoke permissions', 'One-click revoke any token approval from the hub or extension'],
    ['📈', 'Based Trenches alerts', 'Real-time notifications when your BT tokens hit milestones'],
    ['🏥', 'Wallet health report', 'Full exposure report — every contract with access to your funds'],
  ]

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Free */}
        <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', padding: '1.5rem' }}>
          <div style={{ fontFamily: 'Black Ops One, cursive', fontSize: '18px', color: 'var(--cream)', marginBottom: '4px' }}>Free Tier</div>
          <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '11px', color: '#3a9948', marginBottom: '1.25rem' }}>30-day trial · No payment needed</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {FREE_FEATURES.map(([icon, title, desc]) => (
              <div key={title} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '16px', flexShrink: 0, marginTop: '2px' }}>{icon}</span>
                <div>
                  <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '13px', color: 'var(--cream)', fontWeight: 600 }}>{title}</div>
                  <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '10px', color: 'var(--grey-l)', lineHeight: 1.5 }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
          <a href="https://chrome.google.com/webstore" target="_blank" rel="noopener noreferrer"
            style={{ display: 'block', marginTop: '1.5rem', textAlign: 'center', fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: '13px', color: '#060504', background: '#3a9948', padding: '0.75rem', textDecoration: 'none', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Download Free →
          </a>
        </div>

        {/* Pro */}
        <div style={{ background: 'var(--panel)', border: '1px solid rgba(240,176,32,0.4)', padding: '1.5rem', position: 'relative' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg,var(--copper),var(--gold))' }} />
          <div style={{ fontFamily: 'Black Ops One, cursive', fontSize: '18px', color: 'var(--cream)', marginBottom: '4px' }}>Pro Tier</div>
          <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '11px', color: 'var(--gold)', marginBottom: '1.25rem' }}>0.005 ETH/month · ~$13 · Paid on Base</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {PRO_FEATURES.map(([icon, title, desc]) => (
              <div key={title} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '16px', flexShrink: 0, marginTop: '2px' }}>{icon}</span>
                <div>
                  <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '13px', color: 'var(--cream)', fontWeight: 600 }}>{title}</div>
                  <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '10px', color: 'var(--grey-l)', lineHeight: 1.5 }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
          <button onClick={onConnect} style={{ width: '100%', marginTop: '1.5rem', fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: '13px', color: '#060504', background: 'linear-gradient(135deg,var(--copper),var(--gold))', padding: '0.75rem', border: 'none', cursor: 'crosshair', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Get Pro — 0.005 ETH/mo
          </button>
        </div>
      </div>

      {/* Wallet monitoring callout */}
      <div style={{ background: 'rgba(240,176,32,0.06)', border: '1px solid rgba(240,176,32,0.3)', padding: '1.5rem', marginTop: '1.5rem' }}>
        <div style={{ fontFamily: 'Black Ops One, cursive', fontSize: '18px', color: 'var(--gold)', marginBottom: '0.5rem' }}>🐋 Pro: We Watch Your Wallet</div>
        <p style={{ fontFamily: 'Oswald, sans-serif', fontSize: '13px', color: 'var(--grey-l)', lineHeight: 1.7, marginBottom: '0.75rem' }}>
          Pro members get 24/7 wallet monitoring on Base Chain. We watch for unusual activity, large outflows, new contract interactions, and suspicious approvals — and alert you instantly via the extension.
        </p>
        <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '10px', color: 'var(--grey)', padding: '8px 12px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)' }}>
          ⚠ DISCLAIMER: Wallet monitoring is a best-effort service. Trench Guard is a helpful tool and not a guarantee of security. Always practice safe wallet hygiene. We are not liable for any losses.
        </div>
      </div>
    </div>
  )
}

// ── Revoke Permissions ────────────────────────────────────────────────────────
function RevokeTab({ address, isConnected, onConnect }: any) {
  const [approvals, setApprovals]   = useState<any[]>([])
  const [loading, setLoading]       = useState(false)
  const [scanning, setScanning]     = useState(false)
  const [customToken, setCustomToken] = useState('')
  const [customSpender, setCustomSpender] = useState('')

  const publicClient = createPublicClient({ chain: base, transport: http('https://mainnet.base.org') })
  const { writeContract, data: txHash, isPending } = useWriteContract()
  const { isSuccess } = useWaitForTransactionReceipt({ hash: txHash })

  // Known spenders to check
  const KNOWN_SPENDERS = [
    { address: '0x2626664c2603336E57B271c5C0b26F421741e481', name: 'Uniswap V3 Router' },
    { address: '0x03a520b32C04BF3bEEf7BEb72E919cf822Ed34f1', name: 'Uniswap V3 Position Manager' },
    { address: '0xa8b68EBc490F215C44c37987c9EB36741aAF882c', name: 'BT Factory' },
  ]

  async function scanApprovals() {
    if (!address) return
    setScanning(true)
    setApprovals([])

    try {
      // Get tokens from our API
      const res    = await fetch('/api/tokens')
      const data   = await res.json()
      const tokens = data.tokens || []

      const found: any[] = []

      for (const token of tokens.slice(0, 20)) {
        for (const spender of KNOWN_SPENDERS) {
          try {
            const allowance = await publicClient.readContract({
              address: token.address as `0x${string}`,
              abi: ERC20_ABI,
              functionName: 'allowance',
              args: [address, spender.address as `0x${string}`],
            }) as bigint

            if (allowance > BigInt(0)) {
              found.push({
                tokenAddress: token.address,
                tokenSymbol:  token.symbol,
                spenderAddress: spender.address,
                spenderName:    spender.name,
                allowance:      allowance,
                isUnlimited:    allowance === BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'),
              })
            }
          } catch (_) {}
        }
      }

      setApprovals(found)
    } catch (_) {}
    setScanning(false)
  }

  function revokeApproval(tokenAddress: string, spenderAddress: string) {
    writeContract({
      address: tokenAddress as `0x${string}`,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [spenderAddress as `0x${string}`, BigInt(0)],
    })
  }

  if (!isConnected) return (
    <ConnectPrompt onConnect={onConnect} msg="Connect your wallet to scan and revoke token approvals." />
  )

  return (
    <div>
      <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ fontFamily: 'Black Ops One, cursive', fontSize: '18px', color: 'var(--cream)', marginBottom: '0.5rem' }}>Revoke Token Permissions</div>
        <p style={{ fontFamily: 'Oswald, sans-serif', fontSize: '13px', color: 'var(--grey-l)', marginBottom: '1.25rem', lineHeight: 1.6 }}>
          Scan your wallet for active token approvals. Any contract with approval can move your tokens without asking again. Revoke ones you no longer need.
        </p>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '11px', color: 'var(--copper)' }}>
            {address?.slice(0,8)}...{address?.slice(-6)}
          </div>
          <button onClick={scanApprovals} disabled={scanning} style={{ fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: '13px', color: '#060504', background: '#3a9948', border: 'none', padding: '8px 20px', cursor: 'crosshair', letterSpacing: '0.08em', textTransform: 'uppercase', opacity: scanning ? 0.6 : 1 }}>
            {scanning ? '⏳ SCANNING...' : '🔍 SCAN APPROVALS'}
          </button>
        </div>
      </div>

      {/* Manual revoke */}
      <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '13px', fontWeight: 700, color: 'var(--copper)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1rem' }}>Manual Revoke</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '0.75rem', alignItems: 'end' }}>
          <div>
            <label style={{ fontFamily: 'Oswald, sans-serif', fontSize: '9px', fontWeight: 700, color: 'var(--copper)', letterSpacing: '0.12em', display: 'block', marginBottom: '4px' }}>TOKEN ADDRESS</label>
            <input type="text" value={customToken} onChange={e => setCustomToken(e.target.value)} placeholder="0x..." style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--cream)', fontFamily: 'Share Tech Mono, monospace', fontSize: '12px', padding: '8px', outline: 'none' }} />
          </div>
          <div>
            <label style={{ fontFamily: 'Oswald, sans-serif', fontSize: '9px', fontWeight: 700, color: 'var(--copper)', letterSpacing: '0.12em', display: 'block', marginBottom: '4px' }}>SPENDER ADDRESS</label>
            <input type="text" value={customSpender} onChange={e => setCustomSpender(e.target.value)} placeholder="0x..." style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--cream)', fontFamily: 'Share Tech Mono, monospace', fontSize: '12px', padding: '8px', outline: 'none' }} />
          </div>
          <button onClick={() => customToken && customSpender && revokeApproval(customToken, customSpender)} disabled={isPending || !customToken || !customSpender} style={{ fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: '12px', color: '#060504', background: 'var(--red)', border: 'none', padding: '8px 16px', cursor: 'crosshair', letterSpacing: '0.08em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
            {isPending ? '⏳...' : 'REVOKE'}
          </button>
        </div>
        {isSuccess && <div style={{ marginTop: '0.75rem', fontFamily: 'Share Tech Mono, monospace', fontSize: '11px', color: '#3a9948' }}>✓ Approval revoked successfully!</div>}
      </div>

      {/* Results */}
      {approvals.length === 0 && !scanning && (
        <div style={{ padding: '3rem', textAlign: 'center', border: '1px solid var(--border)', fontFamily: 'Oswald, sans-serif', fontSize: '13px', color: 'var(--grey-l)' }}>
          Click "Scan Approvals" to check your active permissions
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
                  <div style={{ fontFamily: 'Black Ops One, cursive', fontSize: '14px', color: a.isUnlimited ? 'var(--red)' : 'var(--cream)' }}>${a.tokenSymbol} {a.isUnlimited && <span style={{ fontSize: '10px', color: 'var(--red)' }}>⚠ UNLIMITED</span>}</div>
                  <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '10px', color: 'var(--grey-l)' }}>{a.tokenAddress.slice(0,8)}...{a.tokenAddress.slice(-4)}</div>
                </div>
                <div>
                  <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '12px', color: 'var(--cream)' }}>{a.spenderName}</div>
                  <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '10px', color: 'var(--grey-l)' }}>{a.spenderAddress.slice(0,8)}...{a.spenderAddress.slice(-4)}</div>
                </div>
                <button onClick={() => revokeApproval(a.tokenAddress, a.spenderAddress)} disabled={isPending} style={{ fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: '11px', color: '#fff', background: 'var(--red)', border: 'none', padding: '6px 14px', cursor: 'crosshair', letterSpacing: '0.08em', textTransform: 'uppercase', opacity: isPending ? 0.6 : 1 }}>
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
  const [report, setReport] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const publicClient = createPublicClient({ chain: base, transport: http('https://mainnet.base.org') })

  async function generateReport() {
    if (!address) return
    setLoading(true)
    try {
      const [balance, txCount, code] = await Promise.all([
        publicClient.getBalance({ address }),
        publicClient.getTransactionCount({ address }),
        publicClient.getBytecode({ address }),
      ])

      const ethBal = parseFloat(formatEther(balance))
      const isContract = !!code

      // Score: start at 100, deduct for risk factors
      let score = 100
      const findings: any[] = []
      const warnings: any[] = []

      if (ethBal > 10) {
        warnings.push('Large ETH balance — consider using a hardware wallet')
        score -= 10
      }

      if (txCount > 1000) {
        findings.push({ label: 'High activity wallet', detail: `${txCount} transactions`, color: 'var(--gold)' })
      }

      findings.push({ label: 'ETH Balance', detail: `${ethBal.toFixed(4)} ETH`, color: 'var(--cream)' })
      findings.push({ label: 'Transactions', detail: txCount.toString(), color: 'var(--cream)' })
      findings.push({ label: 'Type', detail: isContract ? 'Smart Contract' : 'EOA Wallet', color: 'var(--cream)' })
      findings.push({ label: 'Network', detail: 'Base Mainnet', color: '#3a9948' })

      setReport({ score, findings, warnings, ethBal, txCount })
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
          Full analysis of your wallet — balance exposure, transaction history, risk indicators, and active approvals.
        </p>
        <button onClick={generateReport} disabled={loading} style={{ fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: '13px', color: '#060504', background: '#3a9948', border: 'none', padding: '10px 24px', cursor: 'crosshair', letterSpacing: '0.08em', textTransform: 'uppercase', opacity: loading ? 0.6 : 1 }}>
          {loading ? '⏳ ANALYZING...' : '🏥 GENERATE REPORT'}
        </button>
      </div>

      {report && (
        <div>
          {/* Score */}
          <div style={{ background: 'var(--panel)', border: `1px solid ${scoreColor}`, padding: '2rem', textAlign: 'center', marginBottom: '1.5rem' }}>
            <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '11px', fontWeight: 700, color: 'var(--grey-l)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>WALLET HEALTH SCORE</div>
            <div style={{ fontFamily: 'Black Ops One, cursive', fontSize: '64px', color: scoreColor, lineHeight: 1 }}>{report.score}</div>
            <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '14px', color: scoreColor, marginTop: '4px' }}>
              {report.score >= 80 ? '✓ Healthy' : report.score >= 60 ? '⚠ Review Recommended' : '✗ Action Required'}
            </div>
          </div>

          {/* Warnings */}
          {report.warnings.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              {report.warnings.map((w: string, i: number) => (
                <div key={i} style={{ background: 'rgba(255,51,17,0.08)', border: '1px solid rgba(255,51,17,0.3)', padding: '0.75rem 1rem', marginBottom: '6px', fontFamily: 'Oswald, sans-serif', fontSize: '13px', color: 'var(--red)' }}>
                  ⚠ {w}
                </div>
              ))}
            </div>
          )}

          {/* Details */}
          <div style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}>
            {report.findings.map((f: any, i: number) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 1.25rem', borderBottom: i < report.findings.length - 1 ? '1px solid rgba(184,112,64,0.08)' : 'none', alignItems: 'center' }}>
                <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: '13px', color: 'var(--grey-l)' }}>{f.label}</span>
                <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '13px', color: f.color }}>{f.detail}</span>
              </div>
            ))}
          </div>

          {/* Pro callout */}
          <div style={{ background: 'rgba(240,176,32,0.06)', border: '1px solid rgba(240,176,32,0.3)', padding: '1.25rem', marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ fontFamily: 'Black Ops One, cursive', fontSize: '15px', color: 'var(--gold)', marginBottom: '3px' }}>⚡ Pro: Continuous Monitoring</div>
              <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '12px', color: 'var(--grey-l)' }}>Get alerted instantly if your wallet shows suspicious activity</div>
            </div>
            <Link href="/guard#subscription" style={{ fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: '12px', color: '#060504', background: 'var(--gold)', padding: '8px 20px', textDecoration: 'none', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Upgrade
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Token Scanner ─────────────────────────────────────────────────────────────
function TokenScannerTab() {
  const [addr, setAddr]     = useState('')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const publicClient = createPublicClient({ chain: base, transport: http('https://mainnet.base.org') })

  async function scan() {
    if (!addr || addr.length !== 42) return
    setLoading(true)
    setResult(null)

    try {
      const [code, balance, txCount] = await Promise.all([
        publicClient.getBytecode({ address: addr as `0x${string}` }),
        publicClient.getBalance({ address: addr as `0x${string}` }),
        publicClient.getTransactionCount({ address: addr as `0x${string}` }),
      ])

      const isContract = !!code && code !== '0x'
      const ethBal     = parseFloat(formatEther(balance))
      const codeSize   = code ? (code.length - 2) / 2 : 0

      let score    = 70
      let risk     = 'medium'
      const checks: any[] = []

      if (!isContract) {
        checks.push({ label: 'Type', val: 'Wallet / EOA', status: 'safe' })
        score = 95
        risk  = 'safe'
      } else {
        checks.push({ label: 'Type', val: 'Smart Contract', status: 'info' })
        checks.push({ label: 'Code Size', val: `${codeSize} bytes`, status: codeSize < 100 ? 'warn' : 'safe' })

        // Check if known BT contract
        const knownBT: Record<string, string> = {
          '0xa8b68ebc490f215c44c37987c9eb36741aaf882c': 'BT Factory — Verified ✓',
          '0xe8ec7f7935870e4fae26ab689105c60d673ca023': 'BT ProtocolVault — Verified ✓',
          '0x34fa3e260484063cd9988380dd581642fc15c0bc': 'BT WarChest — Verified ✓',
        }
        const known = knownBT[addr.toLowerCase()]
        if (known) {
          checks.push({ label: 'Identity', val: known, status: 'safe' })
          score = 100; risk = 'safe'
        }

        if (codeSize < 50) { score -= 30; risk = 'danger' }
      }

      checks.push({ label: 'ETH Balance', val: `${ethBal.toFixed(4)} ETH`, status: 'info' })
      checks.push({ label: 'Transaction Count', val: txCount.toString(), status: 'info' })

      const scoreColor = score >= 80 ? '#3a9948' : score >= 60 ? 'var(--gold)' : 'var(--red)'
      setResult({ score, risk, checks, scoreColor, isContract, codeSize })
    } catch (e: any) {
      setResult({ error: e.message })
    }
    setLoading(false)
  }

  const statusColors: Record<string, string> = { safe: '#3a9948', warn: 'var(--gold)', danger: 'var(--red)', info: 'var(--cream)' }

  return (
    <div>
      <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ fontFamily: 'Black Ops One, cursive', fontSize: '18px', color: 'var(--cream)', marginBottom: '0.5rem' }}>Token & Contract Scanner</div>
        <p style={{ fontFamily: 'Oswald, sans-serif', fontSize: '13px', color: 'var(--grey-l)', marginBottom: '1.25rem', lineHeight: 1.6 }}>
          Paste any contract or wallet address on Base to get a safety analysis. Free for everyone.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <input type="text" value={addr} onChange={e => setAddr(e.target.value)} placeholder="0x... contract or wallet address on Base" style={{ flex: 1, background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--cream)', fontFamily: 'Share Tech Mono, monospace', fontSize: '13px', padding: '10px 12px', outline: 'none' }} onKeyDown={e => e.key === 'Enter' && scan()} />
          <button onClick={scan} disabled={loading || addr.length !== 42} style={{ fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: '13px', color: '#060504', background: '#3a9948', border: 'none', padding: '10px 24px', cursor: 'crosshair', letterSpacing: '0.08em', textTransform: 'uppercase', opacity: loading || addr.length !== 42 ? 0.5 : 1 }}>
            {loading ? '⏳' : '🔍 SCAN'}
          </button>
        </div>
      </div>

      {result?.error && (
        <div style={{ background: 'rgba(255,51,17,0.08)', border: '1px solid rgba(255,51,17,0.3)', padding: '1rem', fontFamily: 'Share Tech Mono, monospace', fontSize: '12px', color: 'var(--red)' }}>
          ✗ {result.error}
        </div>
      )}

      {result && !result.error && (
        <div>
          <div style={{ background: 'var(--panel)', border: `1px solid ${result.scoreColor}`, padding: '1.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ textAlign: 'center', minWidth: '80px' }}>
              <div style={{ fontFamily: 'Black Ops One, cursive', fontSize: '48px', color: result.scoreColor, lineHeight: 1 }}>{result.score}</div>
              <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '9px', color: 'var(--grey-l)', textTransform: 'uppercase' }}>Safety Score</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '13px', fontWeight: 700, color: result.scoreColor, marginBottom: '0.5rem' }}>
                {result.score >= 80 ? '✓ Looks Safe' : result.score >= 60 ? '⚠ Review Carefully' : '✗ High Risk — Do Not Interact'}
              </div>
              <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '10px', color: 'var(--grey-l)', wordBreak: 'break-all' }}>{addr}</div>
            </div>
          </div>

          <div style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}>
            {result.checks.map((c: any, i: number) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 1.25rem', borderBottom: i < result.checks.length - 1 ? '1px solid rgba(184,112,64,0.08)' : 'none' }}>
                <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: '13px', color: 'var(--grey-l)' }}>{c.label}</span>
                <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '13px', color: statusColors[c.status] || 'var(--cream)' }}>{c.val}</span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '1rem', fontFamily: 'Share Tech Mono, monospace', fontSize: '9px', color: 'var(--grey)', padding: '8px 12px', background: 'var(--panel)', border: '1px solid var(--border)' }}>
            ⚠ This is an automated analysis. Results are not a guarantee of safety. Always do your own research before interacting with any contract.
          </div>
        </div>
      )}
    </div>
  )
}

// ── Subscription ──────────────────────────────────────────────────────────────
function SubscriptionTab({ address, isConnected, onConnect }: any) {
  const { writeContract, data: txHash, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess }     = useWaitForTransactionReceipt({ hash: txHash })
  const [paid, setPaid] = useState(false)

  useEffect(() => {
    if (isSuccess) setPaid(true)
  }, [isSuccess])

  function payForPro() {
    if (!isConnected) { onConnect?.(); return }
    writeContract({
      address: PLATFORM_WALLET,
      abi: [],
      functionName: '',
      value: parseEther(MONTHLY_FEE),
    } as any)
  }

  // Actually just send ETH directly
  async function sendPayment() {
    if (!isConnected) { onConnect?.(); return }
    try {
      const { ethereum } = window as any
      if (!ethereum) return
      const txHash = await ethereum.request({
        method: 'eth_sendTransaction',
        params: [{
          from:  address,
          to:    PLATFORM_WALLET,
          value: '0x' + (BigInt(parseEther(MONTHLY_FEE))).toString(16),
          data:  '0x547265e' + 'e6368475561726450726f',
        }]
      })
      setPaid(true)
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Current plan */}
        <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', padding: '1.5rem' }}>
          <div style={{ fontFamily: 'Black Ops One, cursive', fontSize: '18px', color: 'var(--cream)', marginBottom: '1.25rem' }}>Your Plan</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              ['Status', isConnected ? 'Connected' : 'Not connected'],
              ['Wallet', isConnected ? `${address?.slice(0,8)}...${address?.slice(-4)}` : '—'],
              ['Plan', paid ? 'Pro' : 'Free Trial'],
              ['Network', 'Base Mainnet'],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--bg)', border: '1px solid var(--border)' }}>
                <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: '12px', color: 'var(--grey-l)' }}>{k}</span>
                <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '12px', color: 'var(--copper)' }}>{v}</span>
              </div>
            ))}
          </div>
          {!isConnected && (
            <button onClick={onConnect} style={{ width: '100%', marginTop: '1rem', fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: '13px', color: '#060504', background: 'var(--copper)', border: 'none', padding: '10px', cursor: 'crosshair', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Connect Wallet
            </button>
          )}
        </div>

        {/* Upgrade */}
        <div style={{ background: 'rgba(240,176,32,0.06)', border: '1px solid rgba(240,176,32,0.4)', padding: '1.5rem', position: 'relative' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg,var(--copper),var(--gold))' }} />
          <div style={{ fontFamily: 'Black Ops One, cursive', fontSize: '18px', color: 'var(--gold)', marginBottom: '4px' }}>⚡ Go Pro</div>
          <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '11px', color: 'var(--grey-l)', marginBottom: '1.25rem' }}>0.005 ETH/month · ~$13 · Paid on Base</div>

          <ul style={{ listStyle: 'none', marginBottom: '1.25rem' }}>
            {['Honeypot detection', 'Rug pull alerts', 'Contract audit scores', '24/7 wallet monitoring', 'Transaction simulation', 'Revoke permissions hub', 'Whale wallet tracker', 'Priority BT alerts'].map(f => (
              <li key={f} style={{ fontFamily: 'Oswald, sans-serif', fontSize: '12px', color: 'var(--cream)', padding: '5px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                ✓ {f}
              </li>
            ))}
          </ul>

          {paid ? (
            <div style={{ background: 'rgba(58,153,72,0.1)', border: '1px solid rgba(58,153,72,0.3)', padding: '1rem', textAlign: 'center', fontFamily: 'Oswald, sans-serif', fontSize: '14px', color: '#3a9948', fontWeight: 700 }}>
              ✓ Pro Active! Download the extension to unlock all features.
            </div>
          ) : (
            <>
              <button onClick={sendPayment} disabled={isPending || isConfirming} style={{ width: '100%', fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: '14px', color: '#060504', background: 'linear-gradient(135deg,var(--copper),var(--gold))', border: 'none', padding: '12px', cursor: 'crosshair', letterSpacing: '0.1em', textTransform: 'uppercase', opacity: isPending || isConfirming ? 0.6 : 1 }}>
                {!isConnected ? 'CONNECT WALLET FIRST' : isPending ? '⏳ CONFIRM IN WALLET...' : isConfirming ? '⏳ CONFIRMING...' : 'PAY 0.005 ETH ON BASE'}
              </button>
              <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '9px', color: 'var(--grey)', textAlign: 'center', marginTop: '8px', lineHeight: 1.6 }}>
                Payment verified on-chain · No signup required · 31 days access per payment
              </div>
            </>
          )}
        </div>
      </div>

      {/* How it works */}
      <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', padding: '1.5rem', marginTop: '1.5rem' }}>
        <div style={{ fontFamily: 'Black Ops One, cursive', fontSize: '16px', color: 'var(--cream)', marginBottom: '1rem' }}>How Pro Works</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem' }}>
          {[
            ['1', 'Pay 0.005 ETH', 'Send payment on Base Chain from your wallet'],
            ['2', 'Auto-verified', 'Extension checks your wallet paid on-chain — instant unlock'],
            ['3', 'Full access', '31 days of Pro features. Renew anytime. No subscription traps.'],
          ].map(([n, t, d]) => (
            <div key={n} style={{ background: 'var(--bg)', border: '1px solid var(--border)', padding: '1rem' }}>
              <div style={{ fontFamily: 'Black Ops One, cursive', fontSize: '24px', color: 'var(--copper)', marginBottom: '6px' }}>{n}</div>
              <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '13px', color: 'var(--cream)', fontWeight: 600, marginBottom: '4px' }}>{t}</div>
              <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '10px', color: 'var(--grey-l)', lineHeight: 1.5 }}>{d}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Shared components ─────────────────────────────────────────────────────────
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
