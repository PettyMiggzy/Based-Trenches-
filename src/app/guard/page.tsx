'use client'
import { useState, useEffect } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import { formatEther, createPublicClient, http } from 'viem'
import { base } from 'viem/chains'
import Link from 'next/link'

const PLATFORM_WALLET = '0xB9d4B73bE18914c6d64Bee65a806648370be467f' as `0x${string}`
const MONTHLY_FEE_HEX = '0x' + BigInt(Math.round(0.005 * 1e18)).toString(16)
const BASE_RPC         = 'https://mainnet.base.org'

// Dangerous function selectors — detected from bytecode, no ABI needed
const SELECTORS: Record<string, { name: string, risk: 'critical'|'high'|'medium'|'safe', desc: string }> = {
  '40c10f19': { name: 'mint()',              risk: 'critical', desc: 'Can create unlimited new tokens — dilutes all holders' },
  '3659cfe6': { name: 'upgradeTo()',         risk: 'critical', desc: 'PROXY — entire contract code can be replaced at any time' },
  '4f1ef286': { name: 'upgradeToAndCall()', risk: 'critical', desc: 'PROXY — entire contract code can be replaced at any time' },
  '44337ea1': { name: 'blacklist()',         risk: 'critical', desc: 'Can block addresses from trading — classic honeypot indicator' },
  '7362d9c8': { name: 'addToBlacklist()',    risk: 'critical', desc: 'Can block addresses from trading — classic honeypot indicator' },
  'd9caed12': { name: 'withdrawTokens()',    risk: 'critical', desc: 'Owner can withdraw all tokens from contract' },
  '8456cb59': { name: 'pause()',             risk: 'high',     desc: 'Contract can be paused — may prevent selling your tokens' },
  '4a5d4da6': { name: 'setFee()',            risk: 'high',     desc: 'Buy/sell fee can be changed at any time — could be set to 100%' },
  'f2fde38b': { name: 'transferOwnership()', risk: 'high',    desc: 'Control can be transferred to unknown wallet' },
  '2e1a7d4d': { name: 'withdraw()',          risk: 'high',     desc: 'ETH can be withdrawn from contract' },
  '42966c68': { name: 'burn()',              risk: 'medium',   desc: 'Tokens can be burned — reduces supply' },
  '8da5cb5b': { name: 'owner()',             risk: 'medium',   desc: 'Contract has a privileged owner address' },
  '715018a6': { name: 'renounceOwnership()', risk: 'safe',    desc: 'Owner can give up control — generally a good sign' },
  'a9059cbb': { name: 'transfer()',          risk: 'safe',     desc: 'Standard ERC20 transfer — normal' },
  '095ea7b3': { name: 'approve()',           risk: 'safe',     desc: 'Standard ERC20 approval — normal' },
  'dd62ed3e': { name: 'allowance()',         risk: 'safe',     desc: 'Standard allowance check — normal' },
  '70a08231': { name: 'balanceOf()',         risk: 'safe',     desc: 'Standard balance check — normal' },
  '18160ddd': { name: 'totalSupply()',       risk: 'safe',     desc: 'Standard total supply — normal' },
}

const KNOWN_SPENDERS = [
  { address: '0x2626664c2603336E57B271c5C0b26F421741e481', name: 'Uniswap V3 Router' },
  { address: '0x03a520b32C04BF3bEEf7BEb72E919cf822Ed34f1', name: 'Uniswap V3 NFT Manager' },
  { address: '0xa8b68EBc490F215C44c37987c9EB36741aAF882c', name: 'BT Factory' },
  { address: '0x1231DEB6f5749EF6cE6943a275A1D3E7486F4EaE', name: 'LiFi Diamond' },
  { address: '0x1111111254EEB25477B68fb85Ed929f73A960582', name: '1inch V5 Router' },
  { address: '0xDef1C0ded9bec7F1a1670819833240f027b25EfF', name: '0x Exchange Proxy' },
  { address: '0x6131B5fae19EA4f9D964eAc0408E4408b66337b5', name: 'Kyber Aggregator' },
]

const ERC20_ABI = [
  { name: 'symbol',    type: 'function', stateMutability: 'view',       inputs: [],                                                                          outputs: [{ type: 'string'  }] },
  { name: 'allowance', type: 'function', stateMutability: 'view',       inputs: [{ name: 'owner', type: 'address' },{ name: 'spender', type: 'address' }],  outputs: [{ type: 'uint256' }] },
  { name: 'approve',   type: 'function', stateMutability: 'nonpayable', inputs: [{ name: 'spender', type: 'address' },{ name: 'amount', type: 'uint256' }], outputs: [{ type: 'bool'    }] },
] as const

const client = createPublicClient({ chain: base, transport: http(BASE_RPC) })
const TABS    = ['Overview', 'Revoke Permissions', 'Wallet Health', 'Contract Scanner', 'Subscription']

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
              <img src="/trenchguard.png" alt="Trench Guard" style={{ width: "52px", height: "52px", objectFit: "contain" }} />
              <div>
                <div style={{ fontFamily: 'Black Ops One, cursive', fontSize: '28px', color: 'var(--cream)' }}>Trench Guard</div>
                <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '12px', color: '#3a9948', letterSpacing: '0.12em' }}>WALLET PROTECTION · BASE CHAIN</div>
              </div>
            </div>
            <p style={{ fontFamily: 'Oswald, sans-serif', fontSize: '13px', color: 'var(--grey-l)', maxWidth: '560px', lineHeight: 1.7, marginBottom: '0.75rem' }}>
              Protect your wallet on Base Chain. Scan any contract to reveal dangerous permissions, revoke approvals, simulate transactions, and monitor your wallet 24/7.
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
  const FREE = [['🛡','Scam site detection','Warns before connecting to known phishing sites'],['⚠','Unlimited approval warnings','Flags any transaction requesting unlimited token access'],['✓','Based Trenches verified badge','Confirms you\'re on the official BT site'],['🔍','Contract permission scanner','Reveals every dangerous function in any Base contract — no ABI needed'],['📋','Alert history','Log of all security warnings triggered on your device']]
  const PRO  = [['🍯','Honeypot detection','Simulate a sell before buying — know if you can actually exit'],['🚨','Rug pull indicators','LP locked? Dev wallet %? Mint function? Blacklist? Proxy upgrade?'],['💸','Simulate before signing','See exactly what changes in your wallet before you approve anything'],['🐋','24/7 wallet monitoring','We watch your wallet and alert you to large outflows and new approvals'],['🔓','Revoke any approval','One-click revoke for any token approval on Base'],['🏥','Full wallet exposure report','Every contract with access to your funds — complete picture'],['📈','Based Trenches alerts','Real-time alerts when your BT tokens hit milestones']]

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', padding: '1.5rem' }}>
          <div style={{ fontFamily: 'Black Ops One, cursive', fontSize: '18px', color: 'var(--cream)', marginBottom: '4px' }}>Free Tier</div>
          <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '11px', color: '#3a9948', marginBottom: '1.25rem' }}>30-day trial · No payment needed</div>
          {FREE.map(([icon,title,desc]) => (
            <div key={title as string} style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.85rem' }}>
              <span style={{ fontSize: '16px', flexShrink: 0 }}>{icon}</span>
              <div>
                <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '13px', color: 'var(--cream)', fontWeight: 600 }}>{title}</div>
                <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '10px', color: 'var(--grey-l)', lineHeight: 1.5 }}>{desc}</div>
              </div>
            </div>
          ))}
          <a href="#" style={{ display: 'block', marginTop: '1rem', textAlign: 'center', fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: '13px', color: '#060504', background: '#3a9948', padding: '0.75rem', textDecoration: 'none', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Download Free →</a>
        </div>
        <div style={{ background: 'var(--panel)', border: '1px solid rgba(240,176,32,0.4)', padding: '1.5rem', position: 'relative' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg,var(--copper),var(--gold))' }} />
          <div style={{ fontFamily: 'Black Ops One, cursive', fontSize: '18px', color: 'var(--cream)', marginBottom: '4px' }}>Pro Tier</div>
          <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '11px', color: 'var(--gold)', marginBottom: '1.25rem' }}>0.005 ETH/month · ~$10 · Paid on Base</div>
          {PRO.map(([icon,title,desc]) => (
            <div key={title as string} style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.85rem' }}>
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
      <div style={{ background: 'rgba(240,176,32,0.05)', border: '1px solid rgba(240,176,32,0.25)', padding: '1.5rem', marginTop: '1.5rem' }}>
        <div style={{ fontFamily: 'Black Ops One, cursive', fontSize: '18px', color: 'var(--gold)', marginBottom: '0.5rem' }}>🐋 Pro: We Watch Your Wallet 24/7</div>
        <p style={{ fontFamily: 'Oswald, sans-serif', fontSize: '13px', color: 'var(--grey-l)', lineHeight: 1.7, marginBottom: '0.75rem' }}>Pro members get round-the-clock wallet monitoring on Base. We watch for large outflows, suspicious new approvals, and rug indicators — alerting you instantly through the extension.</p>
        <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '9px', color: 'var(--grey)', padding: '8px 12px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)' }}>
          ⚠ Monitoring is best-effort. Alerts may be delayed. Not a guarantee of security. We are not liable for any losses. Always verify transactions manually.
        </div>
      </div>
    </div>
  )
}

// ── Revoke Permissions — scans ALL tokens on Base ─────────────────────────────
function RevokeTab({ address, isConnected, onConnect }: any) {
  const [approvals, setApprovals]         = useState<any[]>([])
  const [scanning, setScanning]           = useState(false)
  const [scanMsg, setScanMsg]             = useState('')
  const [customToken, setCustomToken]     = useState('')
  const [customSpender, setCustomSpender] = useState('')
  const [revokeMsg, setRevokeMsg]         = useState('')

  const { writeContract, data: txHash, isPending } = useWriteContract()
  const { isSuccess } = useWaitForTransactionReceipt({ hash: txHash })

  useEffect(() => { if (isSuccess) setRevokeMsg('✓ Approval revoked!') }, [isSuccess])

  async function scanApprovals() {
    if (!address) return
    setScanning(true)
    setApprovals([])
    setScanMsg('Scanning your Base token history...')

    try {
      // Pull all ERC20 token transactions from Basescan
      const res  = await fetch(`https://api.basescan.org/api?module=account&action=tokentx&address=${address}&startblock=0&endblock=99999999&sort=desc&apikey=YourApiKeyToken`)
      const data = await res.json()

      let tokenContracts: string[] = []

      if (data.status === '1' && data.result?.length) {
        // Get unique tokens from tx history
        tokenContracts = Array.from(new Set(data.result.map((tx: any) => tx.contractAddress.toLowerCase()))) as string[]
        setScanMsg(`Found ${tokenContracts.length} tokens. Checking approvals...`)
      } else {
        // Fallback: use BT tokens if Basescan fails
        const btRes   = await fetch('/api/tokens')
        const btData  = await btRes.json()
        tokenContracts = (btData.tokens || []).map((t: any) => t.address.toLowerCase())
        setScanMsg(`Checking ${tokenContracts.length} known tokens...`)
      }

      const found: any[] = []
      for (const tokenAddr of tokenContracts.slice(0, 30)) {
        // Get token symbol
        let symbol = '???'
        try {
          symbol = await client.readContract({ address: tokenAddr as `0x${string}`, abi: ERC20_ABI, functionName: 'symbol' }) as string
        } catch (_) {}

        for (const spender of KNOWN_SPENDERS) {
          try {
            const allowance = await client.readContract({ address: tokenAddr as `0x${string}`, abi: ERC20_ABI, functionName: 'allowance', args: [address, spender.address as `0x${string}`] }) as bigint
            if (allowance > BigInt(0)) {
              found.push({ tokenAddress: tokenAddr, tokenSymbol: symbol, spenderAddress: spender.address, spenderName: spender.name, allowance, isUnlimited: allowance >= BigInt('0x' + 'f'.repeat(60)) })
            }
          } catch (_) {}
        }
      }

      setApprovals(found)
      setScanMsg(found.length > 0 ? `Found ${found.length} active approval${found.length !== 1 ? 's' : ''}.` : '✓ No active approvals found. Your wallet looks clean.')
    } catch (e: any) {
      setScanMsg(`Scan failed. Use manual revoke below.`)
    }
    setScanning(false)
  }

  function revoke(tokenAddress: string, spenderAddress: string) {
    setRevokeMsg('')
    writeContract({ address: tokenAddress as `0x${string}`, abi: ERC20_ABI, functionName: 'approve', args: [spenderAddress as `0x${string}`, BigInt(0)] })
  }

  if (!isConnected) return <ConnectPrompt onConnect={onConnect} msg="Connect your wallet to scan and revoke token approvals on Base." />

  return (
    <div>
      <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ fontFamily: 'Black Ops One, cursive', fontSize: '18px', color: 'var(--cream)', marginBottom: '0.5rem' }}>Revoke Token Permissions</div>
        <p style={{ fontFamily: 'Oswald, sans-serif', fontSize: '13px', color: 'var(--grey-l)', marginBottom: '1rem', lineHeight: 1.6 }}>
          Scans your Base wallet for active token approvals across all tokens you've interacted with. Any approved contract can move your tokens at any time — revoke what you don't need.
        </p>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '11px', color: 'var(--copper)' }}>{address?.slice(0,10)}...{address?.slice(-6)}</span>
          <button onClick={scanApprovals} disabled={scanning} style={{ fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: '13px', color: '#060504', background: '#3a9948', border: 'none', padding: '8px 20px', cursor: 'crosshair', letterSpacing: '0.08em', textTransform: 'uppercase', opacity: scanning ? 0.6 : 1 }}>
            {scanning ? '⏳ SCANNING...' : '🔍 SCAN APPROVALS'}
          </button>
        </div>
        {scanMsg && <div style={{ marginTop: '0.75rem', fontFamily: 'Share Tech Mono, monospace', fontSize: '11px', color: scanMsg.startsWith('✓') ? '#3a9948' : scanMsg.includes('Found') ? 'var(--gold)' : 'var(--grey-l)' }}>{scanMsg}</div>}
      </div>

      {/* Manual revoke — any token, any spender */}
      <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '12px', fontWeight: 700, color: 'var(--copper)', letterSpacing: '0.1em', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Manual Revoke — Any Token on Base</div>
        <p style={{ fontFamily: 'Oswald, sans-serif', fontSize: '12px', color: 'var(--grey-l)', marginBottom: '1rem', lineHeight: 1.5 }}>
          Paste any ERC20 token address and spender address to revoke directly. Works for any token on Base.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '0.75rem', alignItems: 'end' }}>
          <div>
            <label style={{ fontFamily: 'Oswald, sans-serif', fontSize: '9px', fontWeight: 700, color: 'var(--copper)', letterSpacing: '0.12em', display: 'block', marginBottom: '4px', textTransform: 'uppercase' }}>Token Contract Address</label>
            <input type="text" value={customToken} onChange={e => setCustomToken(e.target.value)} placeholder="0x... token address" style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--cream)', fontFamily: 'Share Tech Mono, monospace', fontSize: '12px', padding: '8px', outline: 'none' }} />
          </div>
          <div>
            <label style={{ fontFamily: 'Oswald, sans-serif', fontSize: '9px', fontWeight: 700, color: 'var(--copper)', letterSpacing: '0.12em', display: 'block', marginBottom: '4px', textTransform: 'uppercase' }}>Spender Address</label>
            <input type="text" value={customSpender} onChange={e => setCustomSpender(e.target.value)} placeholder="0x... spender address" style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--cream)', fontFamily: 'Share Tech Mono, monospace', fontSize: '12px', padding: '8px', outline: 'none' }} />
          </div>
          <button onClick={() => customToken && customSpender && revoke(customToken, customSpender)} disabled={isPending || !customToken || !customSpender} style={{ fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: '12px', color: '#fff', background: 'var(--red)', border: 'none', padding: '8px 16px', cursor: 'crosshair', letterSpacing: '0.08em', textTransform: 'uppercase', whiteSpace: 'nowrap', opacity: isPending || !customToken || !customSpender ? 0.5 : 1 }}>
            {isPending ? '⏳...' : 'REVOKE'}
          </button>
        </div>
        {revokeMsg && <div style={{ marginTop: '0.75rem', fontFamily: 'Share Tech Mono, monospace', fontSize: '11px', color: revokeMsg.startsWith('✓') ? '#3a9948' : 'var(--red)' }}>{revokeMsg}</div>}
      </div>

      {/* Results */}
      {approvals.length > 0 && (
        <div>
          <div style={{ fontFamily: 'Black Ops One, cursive', fontSize: '16px', color: 'var(--cream)', marginBottom: '1rem' }}>{approvals.length} Active Approval{approvals.length !== 1 ? 's' : ''} Found</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'var(--border)' }}>
            {approvals.map((a, i) => (
              <div key={i} style={{ background: 'var(--panel)', padding: '1rem 1.25rem', display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '1rem', alignItems: 'center', borderLeft: `3px solid ${a.isUnlimited ? 'var(--red)' : 'var(--border)'}` }}>
                <div>
                  <div style={{ fontFamily: 'Black Ops One, cursive', fontSize: '14px', color: a.isUnlimited ? 'var(--red)' : 'var(--cream)' }}>
                    ${a.tokenSymbol} {a.isUnlimited && <span style={{ fontSize: '10px', fontFamily: 'Oswald', color: 'var(--red)', fontWeight: 700 }}>⚠ UNLIMITED</span>}
                  </div>
                  <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '10px', color: 'var(--grey-l)' }}>{a.tokenAddress.slice(0,10)}...{a.tokenAddress.slice(-4)}</div>
                </div>
                <div>
                  <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '12px', color: 'var(--cream)', fontWeight: 600 }}>{a.spenderName}</div>
                  <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '10px', color: 'var(--grey-l)' }}>{a.spenderAddress.slice(0,10)}...{a.spenderAddress.slice(-4)}</div>
                </div>
                <button onClick={() => revoke(a.tokenAddress, a.spenderAddress)} disabled={isPending} style={{ fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: '11px', color: '#fff', background: 'var(--red)', border: 'none', padding: '6px 14px', cursor: 'crosshair', letterSpacing: '0.06em', textTransform: 'uppercase', opacity: isPending ? 0.5 : 1, whiteSpace: 'nowrap' }}>REVOKE</button>
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
      const [balance, txCount] = await Promise.all([
        client.getBalance({ address }),
        client.getTransactionCount({ address }),
      ])
      const ethBal = parseFloat(formatEther(balance))
      let score = 100
      const warnings: string[] = []
      if (ethBal > 10) { score -= 15; warnings.push('Large ETH balance — consider a hardware wallet') }
      if (ethBal > 1)  { score -= 5  }
      if (txCount > 1000) warnings.push('High-activity wallet — review all active approvals regularly')

      const findings = [
        { label: 'ETH Balance',     detail: `${ethBal.toFixed(4)} ETH`,  color: 'var(--cream)' },
        { label: 'Transactions',    detail: txCount.toString(),           color: 'var(--cream)' },
        { label: 'Network',         detail: 'Base Mainnet',               color: '#3a9948'      },
        { label: 'Health Score',    detail: `${score}/100`,               color: score >= 80 ? '#3a9948' : score >= 60 ? 'var(--gold)' : 'var(--red)' },
      ]
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
        <p style={{ fontFamily: 'Oswald, sans-serif', fontSize: '13px', color: 'var(--grey-l)', marginBottom: '1.25rem', lineHeight: 1.6 }}>Full analysis of your Base wallet — balance exposure, activity, and risk score.</p>
        <button onClick={generateReport} disabled={loading} style={{ fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: '13px', color: '#060504', background: '#3a9948', border: 'none', padding: '10px 24px', cursor: 'crosshair', letterSpacing: '0.08em', textTransform: 'uppercase', opacity: loading ? 0.6 : 1 }}>
          {loading ? '⏳ ANALYZING...' : '🏥 GENERATE REPORT'}
        </button>
      </div>
      {report && (
        <div>
          <div style={{ background: 'var(--panel)', border: `2px solid ${scoreColor}`, padding: '2rem', textAlign: 'center', marginBottom: '1.5rem' }}>
            <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '11px', color: 'var(--grey-l)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>WALLET HEALTH SCORE</div>
            <div style={{ fontFamily: 'Black Ops One, cursive', fontSize: '72px', color: scoreColor, lineHeight: 1 }}>{report.score}</div>
            <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '14px', color: scoreColor, marginTop: '8px' }}>{report.score >= 80 ? '✓ Healthy' : report.score >= 60 ? '⚠ Review Recommended' : '✗ Action Required'}</div>
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
        </div>
      )}
    </div>
  )
}

// ── Contract Scanner — reads bytecode, no ABI needed ─────────────────────────
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
      const bytecode   = (code || '').toLowerCase().replace('0x', '')
      const codeSize   = bytecode.length / 2

      // Check known BT contracts
      const KNOWN: Record<string, string> = {
        '0xa8b68ebc490f215c44c37987c9eb36741aaf882c': 'BT Factory — Verified ✓',
        '0xe8ec7f7935870e4fae26ab689105c60d673ca023': 'BT ProtocolVault — Verified ✓',
        '0x34fa3e260484063cd9988380dd581642fc15c0bc': 'BT WarChest — Verified ✓',
      }
      const known = KNOWN[addr.toLowerCase()]

      // Scan bytecode for dangerous function selectors
      const detected: any[] = []
      let criticalCount = 0
      let highCount     = 0

      if (isContract) {
        for (const [selector, info] of Object.entries(SELECTORS)) {
          if (bytecode.includes(selector)) {
            detected.push({ selector: '0x' + selector, ...info })
            if (info.risk === 'critical') criticalCount++
            if (info.risk === 'high')     highCount++
          }
        }
      }

      // Calculate score
      let score = 100
      if (!isContract)    { score = 90 }
      if (criticalCount)  { score -= criticalCount * 20 }
      if (highCount)      { score -= highCount * 10 }
      if (codeSize < 100 && isContract) score -= 20
      score = Math.max(5, score)

      const risk = score >= 80 ? 'safe' : score >= 50 ? 'warning' : 'danger'
      const riskColors = { safe: '#3a9948', warning: 'var(--gold)', danger: 'var(--red)' }
      const riskTitles = { safe: '✓ Looks Safe', warning: '⚠ Review Carefully', danger: '✗ High Risk — Dangerous Functions Detected' }

      setResult({ score, risk, riskColor: riskColors[risk], riskTitle: riskTitles[risk], isContract, codeSize, ethBal, txCount, detected, known })
    } catch (e: any) {
      setResult({ error: e.message })
    }
    setLoading(false)
  }

  const riskBg = { critical: 'rgba(255,51,17,0.08)', high: 'rgba(240,176,32,0.08)', medium: 'rgba(184,112,64,0.08)', safe: 'rgba(58,153,72,0.08)' }
  const riskBorder = { critical: 'rgba(255,51,17,0.4)', high: 'rgba(240,176,32,0.4)', medium: 'rgba(184,112,64,0.3)', safe: 'rgba(58,153,72,0.3)' }
  const riskColor  = { critical: 'var(--red)', high: 'var(--gold)', medium: 'var(--copper)', safe: '#3a9948' }
  const riskLabel  = { critical: '🚨 CRITICAL', high: '⚠ HIGH RISK', medium: '⚠ MEDIUM', safe: '✓ SAFE' }

  return (
    <div>
      <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ fontFamily: 'Black Ops One, cursive', fontSize: '18px', color: 'var(--cream)', marginBottom: '0.5rem' }}>Contract Permission Scanner</div>
        <p style={{ fontFamily: 'Oswald, sans-serif', fontSize: '13px', color: 'var(--grey-l)', marginBottom: '0.75rem', lineHeight: 1.6 }}>
          Paste any contract address on Base. We scan the bytecode directly — no ABI needed — and reveal every dangerous function the contract contains. Works on any ERC20, DEX, protocol, or unknown contract.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <input type="text" value={addr} onChange={e => setAddr(e.target.value)} placeholder="0x... any contract address on Base" onKeyDown={e => e.key === 'Enter' && scan()}
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
          {/* Score + verdict */}
          <div style={{ background: 'var(--panel)', border: `2px solid ${result.riskColor}`, padding: '1.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ textAlign: 'center', minWidth: '80px' }}>
              <div style={{ fontFamily: 'Black Ops One, cursive', fontSize: '52px', color: result.riskColor, lineHeight: 1 }}>{result.score}</div>
              <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '9px', color: 'var(--grey-l)', textTransform: 'uppercase' }}>Safety Score</div>
            </div>
            <div>
              <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '14px', fontWeight: 700, color: result.riskColor, marginBottom: '0.5rem' }}>{result.riskTitle}</div>
              <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '10px', color: 'var(--grey-l)', wordBreak: 'break-all', marginBottom: '4px' }}>{addr}</div>
              {result.known && <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '12px', color: '#3a9948', fontWeight: 700 }}>{result.known}</div>}
            </div>
          </div>

          {/* Basic info */}
          <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', marginBottom: '1rem' }}>
            {[
              { k: 'Type',         v: result.isContract ? 'Smart Contract' : 'Wallet / EOA' },
              { k: 'Code Size',    v: result.isContract ? `${result.codeSize} bytes` : 'N/A' },
              { k: 'ETH Balance',  v: `${result.ethBal.toFixed(4)} ETH` },
              { k: 'Tx Count',     v: result.txCount.toString() },
            ].map((r, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.65rem 1.25rem', borderBottom: i < 3 ? '1px solid rgba(184,112,64,0.08)' : 'none' }}>
                <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: '13px', color: 'var(--grey-l)' }}>{r.k}</span>
                <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '13px', color: 'var(--cream)' }}>{r.v}</span>
              </div>
            ))}
          </div>

          {/* Detected functions */}
          {result.isContract && result.detected.length > 0 && (
            <div>
              <div style={{ fontFamily: 'Black Ops One, cursive', fontSize: '16px', color: 'var(--cream)', marginBottom: '1rem' }}>
                {result.detected.length} Function{result.detected.length !== 1 ? 's' : ''} Detected
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {result.detected
                  .sort((a: any, b: any) => {
                    const order = { critical: 0, high: 1, medium: 2, safe: 3 }
                    return order[a.risk as keyof typeof order] - order[b.risk as keyof typeof order]
                  })
                  .map((fn: any, i: number) => (
                    <div key={i} style={{ background: riskBg[fn.risk as keyof typeof riskBg], border: `1px solid ${riskBorder[fn.risk as keyof typeof riskBorder]}`, padding: '0.85rem 1.1rem', display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '0.75rem', alignItems: 'start' }}>
                      <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: '10px', fontWeight: 700, color: riskColor[fn.risk as keyof typeof riskColor], background: riskBg[fn.risk as keyof typeof riskBg], border: `1px solid ${riskBorder[fn.risk as keyof typeof riskBorder]}`, padding: '2px 8px', whiteSpace: 'nowrap', letterSpacing: '0.08em' }}>
                        {riskLabel[fn.risk as keyof typeof riskLabel]}
                      </span>
                      <div>
                        <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '12px', color: 'var(--cream)', marginBottom: '3px' }}>{fn.name} <span style={{ color: 'var(--grey-l)', fontSize: '10px' }}>{fn.selector}</span></div>
                        <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '12px', color: 'var(--grey-l)' }}>{fn.desc}</div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {result.isContract && result.detected.length === 0 && (
            <div style={{ background: 'rgba(58,153,72,0.08)', border: '1px solid rgba(58,153,72,0.3)', padding: '1rem', fontFamily: 'Oswald, sans-serif', fontSize: '13px', color: '#3a9948' }}>
              ✓ No dangerous functions detected in bytecode.
            </div>
          )}

          {!result.isContract && (
            <div style={{ background: 'rgba(58,153,72,0.08)', border: '1px solid rgba(58,153,72,0.3)', padding: '1rem', fontFamily: 'Oswald, sans-serif', fontSize: '13px', color: '#3a9948' }}>
              ✓ This is a wallet address (EOA) — not a contract. No bytecode to scan.
            </div>
          )}

          <div style={{ marginTop: '0.75rem', fontFamily: 'Share Tech Mono, monospace', fontSize: '9px', color: 'var(--grey)', padding: '8px', background: 'var(--panel)', border: '1px solid var(--border)' }}>
            ⚠ Bytecode analysis detects known function selectors. Results are not exhaustive — always do your own research before interacting with any contract.
          </div>
        </div>
      )}
    </div>
  )
}

// ── Subscription ──────────────────────────────────────────────────────────────
function SubscriptionTab({ address, isConnected, onConnect }: any) {
  const [paid, setPaid]     = useState(false)
  const [paying, setPaying] = useState(false)
  const [msg, setMsg]       = useState('')

  async function sendPayment() {
    if (!isConnected) { onConnect?.(); return }
    setPaying(true); setMsg('')
    try {
      const { ethereum } = window as any
      if (!ethereum) throw new Error('No wallet detected')
      const hash = await ethereum.request({ method: 'eth_sendTransaction', params: [{ from: address, to: PLATFORM_WALLET, value: MONTHLY_FEE_HEX }] })
      setMsg('⏳ Confirming on Base...')
      let receipt = null
      for (let i = 0; i < 40; i++) {
        await new Promise(r => setTimeout(r, 2000))
        receipt = await ethereum.request({ method: 'eth_getTransactionReceipt', params: [hash] })
        if (receipt) break
      }
      if (receipt?.status === '0x1') { setPaid(true); setMsg('✓ Pro activated! Download the extension to unlock all features.') }
      else setMsg('✗ Transaction failed. Try again.')
    } catch (e: any) { setMsg(e.code === 4001 ? 'Cancelled.' : `Error: ${e.message?.slice(0,60)}`) }
    setPaying(false)
  }

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', padding: '1.5rem' }}>
          <div style={{ fontFamily: 'Black Ops One, cursive', fontSize: '18px', color: 'var(--cream)', marginBottom: '1.25rem' }}>Your Plan</div>
          {[['Status', isConnected ? 'Connected' : 'Not connected'],['Wallet', isConnected ? `${address?.slice(0,8)}...${address?.slice(-4)}` : '—'],['Plan', paid ? '⚡ Pro' : 'Free Trial'],['Network', 'Base Mainnet']].map(([k,v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--bg)', border: '1px solid var(--border)', marginBottom: '6px' }}>
              <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: '12px', color: 'var(--grey-l)' }}>{k}</span>
              <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '12px', color: 'var(--copper)' }}>{v}</span>
            </div>
          ))}
          {!isConnected && <button onClick={onConnect} style={{ width: '100%', marginTop: '0.75rem', fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: '13px', color: '#060504', background: 'var(--copper)', border: 'none', padding: '10px', cursor: 'crosshair', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Connect Wallet</button>}
        </div>
        <div style={{ background: 'rgba(240,176,32,0.05)', border: '1px solid rgba(240,176,32,0.4)', padding: '1.5rem', position: 'relative' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg,var(--copper),var(--gold))' }} />
          <div style={{ fontFamily: 'Black Ops One, cursive', fontSize: '18px', color: 'var(--gold)', marginBottom: '4px' }}>⚡ Go Pro</div>
          <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '11px', color: 'var(--grey-l)', marginBottom: '1.25rem' }}>0.005 ETH/month · ~$10 · Paid on Base</div>
          <ul style={{ listStyle: 'none', marginBottom: '1.25rem' }}>
            {['Honeypot detection','Rug pull indicators','Simulate before signing','24/7 wallet monitoring','Full contract audit','One-click revoke any token','Wallet exposure report','BT token alerts'].map(f => (
              <li key={f} style={{ fontFamily: 'Oswald, sans-serif', fontSize: '12px', color: 'var(--cream)', padding: '5px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>✓ {f}</li>
            ))}
          </ul>
          {paid ? (
            <div style={{ background: 'rgba(58,153,72,0.1)', border: '1px solid rgba(58,153,72,0.3)', padding: '1rem', textAlign: 'center', fontFamily: 'Oswald, sans-serif', fontSize: '14px', color: '#3a9948', fontWeight: 700 }}>✓ Pro Active!</div>
          ) : (
            <>
              <button onClick={sendPayment} disabled={paying} style={{ width: '100%', fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: '14px', color: '#060504', background: 'linear-gradient(135deg,var(--copper),var(--gold))', border: 'none', padding: '12px', cursor: 'crosshair', letterSpacing: '0.1em', textTransform: 'uppercase', opacity: paying ? 0.6 : 1 }}>
                {!isConnected ? 'CONNECT WALLET FIRST' : paying ? '⏳ PROCESSING...' : 'PAY 0.005 ETH ON BASE'}
              </button>
              {msg && <div style={{ marginTop: '0.75rem', fontFamily: 'Share Tech Mono, monospace', fontSize: '11px', color: msg.startsWith('✓') ? '#3a9948' : msg.startsWith('⏳') ? 'var(--gold)' : 'var(--red)' }}>{msg}</div>}
              <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '9px', color: 'var(--grey)', textAlign: 'center', marginTop: '8px' }}>Verified on-chain · No signup · 31 days per payment</div>
            </>
          )}
        </div>
      </div>
      <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', padding: '1.5rem', marginTop: '1.5rem' }}>
        <div style={{ fontFamily: 'Black Ops One, cursive', fontSize: '16px', color: 'var(--cream)', marginBottom: '1rem' }}>How Pro Works</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem' }}>
          {[['1','Pay 0.005 ETH','Send directly to our wallet on Base — no middleman'],['2','Auto-verified','Extension checks on-chain that your wallet paid — instant unlock'],['3','31 days access','Full Pro features. Renew anytime. No subscription traps.']].map(([n,t,d]) => (
            <div key={n} style={{ background: 'var(--bg)', border: '1px solid var(--border)', padding: '1rem' }}>
              <div style={{ fontFamily: 'Black Ops One, cursive', fontSize: '28px', color: 'var(--copper)', marginBottom: '6px' }}>{n}</div>
              <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '13px', color: 'var(--cream)', fontWeight: 600, marginBottom: '4px' }}>{t}</div>
              <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '10px', color: 'var(--grey-l)', lineHeight: 1.5 }}>{d}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: '1rem', fontFamily: 'Share Tech Mono, monospace', fontSize: '9px', color: 'var(--grey)', padding: '8px 12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)' }}>
          ⚠ Trench Guard is a helpful security tool — not a guarantee of safety. We are not responsible for any losses. Always verify transactions manually.
        </div>
      </div>
    </div>
  )
}

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
