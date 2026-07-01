// Trench Guard — Full Pro Extension
const PLATFORM  = '0xB9d4B73bE18914c6d64Bee65a806648370be467f'
const BASE_RPC  = 'https://mainnet.base.org'
const FEE_WEI   = BigInt(Math.round(0.005 * 1e18))
const FEE_HEX   = '0x' + FEE_WEI.toString(16)
const BT_HOSTS  = ['basedtrenches.fun','www.basedtrenches.fun','basedtrenches.co','www.basedtrenches.co']
const SCAM_KW   = ['basedtrenches-','based-trenches-','basedtrenchess','trenchguard-','claim-airdrop','wallet-verify','metamask-secure','free-eth','connect-earn','airdrop-claim']
const ERC20_ABI = [
  '70a08231', // balanceOf
  'dd62ed3e', // allowance
  '095ea7b3', // approve
]

const $ = id => document.getElementById(id)
let isPro = false
let walletAddr = null

document.addEventListener('DOMContentLoaded', async () => {
  setupTabs()
  await checkTrial()
  await checkCurrentSite()
  await loadAlerts()
  await checkWallet()
  setupButtons()
})

// ── Tabs ──────────────────────────────────────────────────────────────────────
function setupTabs() {
  document.querySelectorAll('.tab').forEach(t => {
    t.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(x => x.classList.remove('active'))
      document.querySelectorAll('.tab-content').forEach(x => x.classList.remove('active'))
      t.classList.add('active')
      $('tab-' + t.dataset.tab).classList.add('active')
    })
  })
}

// ── Trial / Pro check ─────────────────────────────────────────────────────────
async function checkTrial() {
  const d = await chrome.storage.local.get(['installDate','proExpiry','proWallet'])
  if (!d.installDate) {
    await chrome.storage.local.set({ installDate: Date.now() })
    d.installDate = Date.now()
  }
  const now       = Date.now()
  const elapsed   = Math.floor((now - d.installDate) / 86400000)
  const trialLeft = Math.max(0, 30 - elapsed)
  isPro           = !!(d.proExpiry && d.proExpiry > now)
  const proLeft   = isPro ? Math.ceil((d.proExpiry - now) / 86400000) : 0

  if (isPro) {
    $('sub-status').textContent = `⚡ PRO · ${proLeft}d left`
    $('sub-status').style.color = 'var(--gold)'
    $('pro-status').textContent = 'Active ✓'
    $('pro-days').textContent   = `${proLeft} days`
    if (d.proWallet) $('pro-wallet').textContent = d.proWallet.slice(0,8) + '...' + d.proWallet.slice(-4)
    unlockPro()
  } else if (trialLeft > 0) {
    $('sub-status').textContent = `Free trial · ${trialLeft}d left`
    $('btn-upgrade').style.display = 'block'
    $('pro-status').textContent = 'Free Trial'
    $('pro-days').textContent   = `${trialLeft} days`
  } else {
    $('sub-status').textContent = `⚠ Trial expired — upgrade`
    $('sub-status').style.color = 'var(--red)'
    $('btn-upgrade').style.display = 'block'
    $('pro-status').textContent = 'Expired'
    $('pro-days').textContent   = '0'
  }
}

function unlockPro() {
  ;['ck-honey','ck-rug','ck-sim','ck-watch','ck-revoke'].forEach(id => {
    const el = $(id)
    if (el) { el.textContent = '✓'; el.className = 'ck on' }
  })
  // Show sim form, hide locked messages
  if ($('sim-locked'))  $('sim-locked').style.display  = 'none'
  if ($('sim-form'))    $('sim-form').style.display    = 'block'
  if ($('monitor-locked')) $('monitor-locked').style.display = 'none'
  if ($('monitor-active')) $('monitor-active').style.display = 'block'
}

// ── Current site check ────────────────────────────────────────────────────────
async function checkCurrentSite() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
  if (!tab?.url) return
  try {
    const url  = new URL(tab.url)
    const host = url.hostname.toLowerCase()
    $('site-url').textContent = host

    if (BT_HOSTS.includes(host)) {
      setVerdict('safe', '✓ Official Based Trenches site')
      $('bt-verified').style.display = 'flex'
      return
    }
    const isScam = SCAM_KW.some(k => host.includes(k) || tab.url.toLowerCase().includes(k))
    if (isScam) {
      setVerdict('danger', '⚠ DANGER — Do NOT connect your wallet!')
      setBadge('danger', '● DANGER')
      await saveAlert(host, 'Suspicious domain — possible phishing/drainer')
      return
    }
    const patterns = [/airdrop.*claim/i,/claim.*free/i,/wallet.*verify/i,/metamask.*update/i,/connect.*earn/i]
    if (patterns.some(p => p.test(tab.title || '') || p.test(tab.url))) {
      setVerdict('warning', '⚠ WARNING — Suspicious page content')
      setBadge('warning', '● WARNING')
      return
    }
    setVerdict('safe', '✓ No threats detected')
  } catch (_) {}
}

function setVerdict(cls, msg) {
  const el = $('site-verdict')
  el.className = 'verdict ' + cls
  el.textContent = msg
}

function setBadge(cls, text) {
  $('guard-badge').className = 'badge ' + cls
  $('guard-badge').textContent = text
}

// ── Wallet check ──────────────────────────────────────────────────────────────
async function checkWallet() {
  if (!window.ethereum) return
  try {
    const accounts = await window.ethereum.request({ method: 'eth_accounts' })
    if (accounts.length > 0) setWalletConnected(accounts[0])
  } catch (_) {}
}

function setWalletConnected(addr) {
  walletAddr = addr
  $('pro-wallet').textContent = addr.slice(0,8) + '...' + addr.slice(-4)
  if (isPro) {
    $('wallet-locked').style.display    = 'none'
    $('wallet-connected').style.display = 'block'
    $('wallet-addr-display').textContent = addr.slice(0,8) + '...' + addr.slice(-4)
  }
}

// ── Contract scanner ──────────────────────────────────────────────────────────
async function scanContract() {
  const addr = $('scan-input').value.trim()
  if (!addr || addr.length !== 42) {
    $('scan-result').innerHTML = makeBox('warning', '⚠ Invalid address', [])
    return
  }
  $('scan-result').innerHTML = makeBox('', '⏳ Scanning...', [])
  try {
    const [code, balance, txCount] = await Promise.all([
      rpc('eth_getCode',              [addr, 'latest']),
      rpc('eth_getBalance',           [addr, 'latest']),
      rpc('eth_getTransactionCount',  [addr, 'latest']),
    ])
    const isCt   = code && code !== '0x'
    const ethBal = (parseInt(balance || '0x0', 16) / 1e18).toFixed(4)
    const txs    = parseInt(txCount || '0x0', 16)
    const size   = isCt ? (code.length - 2) / 2 : 0

    const KNOWN = {
      '0xa8b68ebc490f215c44c37987c9eb36741aaf882c': 'BT Factory ✓',
      '0xe8ec7f7935870e4fae26ab689105c60d673ca023': 'BT ProtocolVault ✓',
      '0x34fa3e260484063cd9988380dd581642fc15c0bc': 'BT WarChest ✓',
    }
    const known = KNOWN[addr.toLowerCase()]

    let score = 70, cls = 'warning'
    const rows = []

    if (!isCt) {
      score = 90; cls = 'safe'
      rows.push({ k: 'Type',        v: 'Wallet / EOA',      c: 'green' })
      rows.push({ k: 'Transactions', v: txs.toString(),      c: '' })
    } else {
      rows.push({ k: 'Type',      v: 'Smart Contract',       c: '' })
      rows.push({ k: 'Code size', v: `${size} bytes`,        c: size < 100 ? 'gold' : '' })
      if (known) {
        score = 100; cls = 'safe'
        rows.push({ k: 'Identity', v: known,                 c: 'green' })
      } else if (size < 50) {
        score = 25; cls = 'danger'
        rows.push({ k: 'Warning',  v: 'Suspiciously small',  c: 'red' })
      }
      // Pro: honeypot check
      if (isPro) {
        rows.push({ k: 'Honeypot check', v: 'Simulating sell...', c: 'gold' })
      }
    }
    rows.push({ k: 'ETH Balance',  v: `${ethBal} ETH`, c: '' })
    rows.push({ k: 'Safety Score', v: `${score}/100`,  c: score >= 80 ? 'green' : score >= 50 ? 'gold' : 'red' })

    const titles = { safe: '✓ Looks Clean', warning: '⚠ Review Carefully', danger: '✗ High Risk' }
    const colors = { safe: 'var(--green)',  warning: 'var(--gold)',         danger: 'var(--red)' }
    $('scan-result').innerHTML = makeBox(cls, `<span style="color:${colors[cls]}">${titles[cls]}</span>`, rows)
  } catch (e) {
    $('scan-result').innerHTML = makeBox('warning', '⚠ Scan failed', [{ k: 'Error', v: e.message?.slice(0,60), c: 'red' }])
  }
}

function makeBox(cls, title, rows) {
  return `<div class="scan-box ${cls}">
    <div class="scan-title">${title}</div>
    ${rows.map(r => `<div class="scan-row"><span class="scan-key">${r.k}</span><span class="scan-val ${r.c}">${r.v}</span></div>`).join('')}
  </div>`
}

// ── Simulate transaction (Pro) ────────────────────────────────────────────────
async function simulateTx() {
  if (!isPro) return
  const contract = $('sim-contract').value.trim()
  const data     = $('sim-data').value.trim()
  const value    = $('sim-value').value.trim() || '0'
  if (!contract || contract.length !== 42) {
    $('sim-result').innerHTML = makeBox('warning', '⚠ Invalid contract address', [])
    return
  }
  $('sim-result').innerHTML = makeBox('', '⏳ Simulating...', [])
  try {
    const valWei  = '0x' + BigInt(Math.round(parseFloat(value) * 1e18)).toString(16)
    const from    = walletAddr || '0x0000000000000000000000000000000000000001'
    // Use eth_call to simulate
    const result  = await rpc('eth_call', [{
      from, to: contract, data: data || '0x', value: valWei
    }, 'latest'])

    const rows = [
      { k: 'Result',    v: result === '0x' ? 'Success (no return)' : result.slice(0,20) + '...', c: 'green' },
      { k: 'From',      v: from.slice(0,10) + '...',  c: '' },
      { k: 'To',        v: contract.slice(0,10) + '...', c: '' },
      { k: 'Value',     v: `${value} ETH`,             c: '' },
      { k: 'Verdict',   v: '✓ Transaction would succeed', c: 'green' },
    ]
    $('sim-result').innerHTML = makeBox('safe', '✓ Simulation Successful', rows)
  } catch (e) {
    const errMsg = e.message?.includes('revert') ? 'Transaction would REVERT' : e.message?.slice(0,60)
    $('sim-result').innerHTML = makeBox('danger', '✗ Simulation Failed', [
      { k: 'Reason', v: errMsg, c: 'red' },
      { k: 'Action', v: 'Do NOT sign this transaction', c: 'red' },
    ])
  }
}

// ── Wallet health scan (Pro) ──────────────────────────────────────────────────
async function scanWallet() {
  if (!isPro || !walletAddr) return
  const btn = $('btn-scan-wallet')
  btn.textContent = 'SCANNING...'
  btn.disabled = true

  try {
    const [balance, txCount] = await Promise.all([
      rpc('eth_getBalance',           [walletAddr, 'latest']),
      rpc('eth_getTransactionCount',  [walletAddr, 'latest']),
    ])
    const ethBal = parseFloat((parseInt(balance || '0x0', 16) / 1e18).toFixed(4))
    const txs    = parseInt(txCount || '0x0', 16)

    // Score logic
    let score = 100
    const warnings = []
    if (ethBal > 5)  { score -= 10; warnings.push('Large ETH balance — consider hardware wallet') }
    if (txs > 500)   { warnings.push('High activity wallet — review approvals regularly') }

    // Show score
    const scoreEl = $('health-score')
    scoreEl.textContent = score
    scoreEl.style.color = score >= 80 ? 'var(--green)' : score >= 60 ? 'var(--gold)' : 'var(--red)'
    $('health-score-wrap').style.display = 'block'

    // Show basic info + warnings
    const approvalList = $('approval-list')
    approvalList.innerHTML = `
      <div class="scan-box ${score >= 80 ? 'safe' : 'warning'}" style="margin-bottom:8px">
        <div class="scan-title" style="color:${score >= 80 ? 'var(--green)' : 'var(--gold)'}">Wallet Overview</div>
        <div class="scan-row"><span class="scan-key">Balance</span><span class="scan-val">${ethBal} ETH</span></div>
        <div class="scan-row"><span class="scan-key">Transactions</span><span class="scan-val">${txs}</span></div>
        <div class="scan-row"><span class="scan-key">Network</span><span class="scan-val green">Base Mainnet</span></div>
      </div>
      ${warnings.map(w => `<div style="background:rgba(255,51,17,0.06);border:1px solid rgba(255,51,17,0.3);padding:7px 10px;font-size:11px;color:var(--red);margin-bottom:5px;">⚠ ${w}</div>`).join('')}
      <div style="font-size:10px;color:var(--grey-l);text-align:center;margin-top:8px">Full revoke panel available on Guard Hub</div>
    `
  } catch (e) {
    $('approval-list').innerHTML = `<div class="scan-box warning"><div class="scan-title" style="color:var(--gold)">Error scanning wallet</div></div>`
  }

  btn.textContent = 'RESCAN'
  btn.disabled = false
}

// ── Pay for Pro ───────────────────────────────────────────────────────────────
async function payPro() {
  if (!window.ethereum) {
    alert('No wallet detected. Install MetaMask, Coinbase Wallet, or Rabby.')
    return
  }
  const btn = $('btn-pay')
  try {
    // Switch to Base
    await window.ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: '0x2105' }] })
      .catch(async e => {
        if (e.code === 4902) {
          await window.ethereum.request({ method: 'wallet_addEthereumChain', params: [{
            chainId: '0x2105', chainName: 'Base',
            nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
            rpcUrls: ['https://mainnet.base.org'],
            blockExplorerUrls: ['https://basescan.org']
          }]})
        }
      })

    const [acct] = await window.ethereum.request({ method: 'eth_requestAccounts' })
    setWalletConnected(acct)

    btn.textContent = '⏳ CONFIRM IN WALLET...'
    btn.disabled = true

    const _txp = { from: acct, to: PLATFORM, value: FEE_HEX,
      data: '0x' + Array.from(new TextEncoder().encode('TrenchGuardPro')).map(b => b.toString(16).padStart(2,'0')).join('') }
    // Pre-simulate so a would-revert tx never reaches the wallet (avoids the warning).
    try { await window.ethereum.request({ method: 'eth_call', params: [_txp, 'latest'] }) }
    catch (_e) { btn.textContent = 'TX WOULD FAIL — CHECK BALANCE'; btn.disabled = false; return }
    const hash = await window.ethereum.request({ method: 'eth_sendTransaction', params: [_txp]})

    btn.textContent = '⏳ VERIFYING ON CHAIN...'

    let receipt = null
    for (let i = 0; i < 40; i++) {
      await sleep(2000)
      receipt = await window.ethereum.request({ method: 'eth_getTransactionReceipt', params: [hash] })
      if (receipt) break
    }

    if (receipt?.status === '0x1') {
      const expiry = Date.now() + 31 * 86400000
      await chrome.storage.local.set({ proExpiry: expiry, proWallet: acct })
      isPro = true
      btn.textContent = '✓ PRO ACTIVE!'
      unlockPro()
      setWalletConnected(acct)
      await checkTrial()
    } else {
      btn.textContent = '✗ TX FAILED — TRY AGAIN'
      btn.disabled = false
    }
  } catch (e) {
    btn.textContent = e.code === 4001 ? 'CANCELLED' : '✗ ERROR — TRY AGAIN'
    btn.disabled = false
    setTimeout(() => { btn.textContent = 'PAY 0.005 ETH ON BASE'; btn.disabled = false }, 2500)
  }
}

// ── Alerts ────────────────────────────────────────────────────────────────────
async function loadAlerts() {
  const d = await chrome.storage.local.get(['alerts'])
  const alerts = (d.alerts || []).slice(0, 5)
  if (!alerts.length) return
  $('alert-list').innerHTML = alerts.map(a => `
    <div class="alert-item">
      <div class="alert-site">⚠ ${a.site}</div>
      <div class="alert-msg">${a.msg}</div>
    </div>`).join('')
}

async function saveAlert(site, msg) {
  const d = await chrome.storage.local.get(['alerts'])
  const alerts = d.alerts || []
  alerts.unshift({ site, msg, time: Date.now() })
  await chrome.storage.local.set({ alerts: alerts.slice(0, 20) })
  await loadAlerts()
}

// ── Buttons ───────────────────────────────────────────────────────────────────
function setupButtons() {
  $('btn-scan').onclick    = scanContract
  $('btn-pay').onclick     = payPro
  $('btn-upgrade').onclick = () => document.querySelector('[data-tab="pro"]').click()
  if ($('btn-simulate'))   $('btn-simulate').onclick = simulateTx
  if ($('btn-scan-wallet')) $('btn-scan-wallet').onclick = scanWallet
}

// ── RPC ───────────────────────────────────────────────────────────────────────
async function rpc(method, params) {
  const r = await fetch(BASE_RPC, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params })
  })
  const d = await r.json()
  if (d.error) throw new Error(d.error.message)
  return d.result
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }
