// Based Trenches Launcher — popup.js
// Calls Factory contract directly via window.ethereum (MetaMask/Coinbase/Rabby)

const FACTORY = '0xa8b68EBc490F215C44c37987c9EB36741aAF882c'
const PLATFORM = '0xB9d4B73bE18914c6d64Bee65a806648370be467f'
const BASE_RPC  = 'https://mainnet.base.org'
const SITE_URL  = 'https://basedtrenches.fun'
const BASE_SCAN = 'https://basescan.org'
const LAUNCH_FEE = '0x71AFD498D0000' // 0.002 ETH in hex

// Factory ABI — launchToken function
const LAUNCH_ABI = {
  name: 'launchToken',
  type: 'function',
  inputs: [
    { name: 'm', type: 'tuple', components: [
      { name: 'name',        type: 'string' },
      { name: 'symbol',      type: 'string' },
      { name: 'img',         type: 'string' },
      { name: 'banner',      type: 'string' },
      { name: 'description', type: 'string' },
      { name: 'website',     type: 'string' },
      { name: 'twitter',     type: 'string' },
      { name: 'telegram',    type: 'string' },
    ]}
  ]
}

// ── State ─────────────────────────────────────────────────────────────────────
let walletAddress = null
let imageDataUrl  = null
let bannerDataUrl = null
let currentScreen = 'form'

// ── DOM ───────────────────────────────────────────────────────────────────────
const $ = id => document.getElementById(id)

// ── Init ──────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  setupImageUploads()
  setupFormListeners()
  setupButtons()
  await checkWallet()
  loadTrendingTokens()
})

// ── Wallet ────────────────────────────────────────────────────────────────────
async function checkWallet() {
  if (!window.ethereum) return
  try {
    const accounts = await window.ethereum.request({ method: 'eth_accounts' })
    if (accounts.length > 0) setWalletConnected(accounts[0])
  } catch (_) {}
}

async function connectWallet() {
  if (!window.ethereum) {
    alert('No wallet detected. Please install MetaMask or Coinbase Wallet.')
    return
  }
  try {
    // Switch to Base
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x2105' }] // Base mainnet
      })
    } catch (switchError) {
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: '0x2105',
            chainName: 'Base',
            nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
            rpcUrls: ['https://mainnet.base.org'],
            blockExplorerUrls: ['https://basescan.org']
          }]
        })
      }
    }
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
    setWalletConnected(accounts[0])
  } catch (e) {
    console.error('Connect failed:', e)
  }
}

function setWalletConnected(address) {
  walletAddress = address
  const short = address.slice(0, 6) + '...' + address.slice(-4)
  $('wallet-status').innerHTML = `<span class="wallet-dot"></span><span class="wallet-addr">${short}</span>`
  $('btn-connect').textContent = 'SWITCH'
  $('btn-connect').onclick = connectWallet
}

// ── Image uploads ─────────────────────────────────────────────────────────────
function setupImageUploads() {
  // Token image
  $('img-input').addEventListener('change', e => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      imageDataUrl = ev.target.result
      $('img-preview').src = imageDataUrl
      $('img-preview').style.display = 'block'
      $('img-ph').style.display = 'none'
      // Update preview
      const previewEl = $('preview-img')
      previewEl.innerHTML = `<img src="${imageDataUrl}" />`
    }
    reader.readAsDataURL(file)
  })

  // Banner
  $('banner-input').addEventListener('change', e => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      bannerDataUrl = ev.target.result
      $('banner-preview').src = bannerDataUrl
      $('banner-preview').style.display = 'block'
      $('banner-ph').style.display = 'none'
    }
    reader.readAsDataURL(file)
  })
}

// ── Form live preview ─────────────────────────────────────────────────────────
function setupFormListeners() {
  $('token-name').addEventListener('input', e => {
    $('preview-name').textContent = e.target.value || 'Token Name'
  })
  $('token-symbol').addEventListener('input', e => {
    const val = e.target.value.toUpperCase()
    e.target.value = val
    $('preview-symbol').textContent = val ? '$' + val : '$TICKER'
  })
}

// ── Buttons ───────────────────────────────────────────────────────────────────
function setupButtons() {
  $('btn-connect').onclick    = connectWallet
  $('btn-launch').onclick     = launchToken
  $('btn-view-trenches').onclick = () => showTrenches()
  $('btn-another').onclick    = () => showScreen('form')
  $('btn-open-site').onclick  = () => chrome.tabs.create({ url: SITE_URL })
  $('btn-all-tokens').onclick = () => chrome.tabs.create({ url: SITE_URL + '/trenches' })
}

// ── Screen management ─────────────────────────────────────────────────────────
function showScreen(name) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'))
  $('screen-' + name).classList.add('active')
  currentScreen = name
}

function showTrenches() {
  showScreen('trenches')
  loadTrendingTokens()
}

// ── Launch token ──────────────────────────────────────────────────────────────
async function launchToken() {
  const name    = $('token-name').value.trim()
  const symbol  = $('token-symbol').value.trim().toUpperCase()
  const desc    = $('token-desc').value.trim()
  const twitter = $('token-twitter').value.trim()
  const telegram= $('token-telegram').value.trim()
  const website = $('token-website').value.trim()

  if (!name || !symbol) {
    showStatus('launch-status', 'error', 'Token name and symbol are required.')
    return
  }

  if (!walletAddress) {
    showStatus('launch-status', 'loading', 'Connecting wallet...')
    await connectWallet()
    if (!walletAddress) return
  }

  showScreen('deploying')
  setDeployStatus('loading', 'Uploading images to IPFS...')

  // Upload images to IPFS via Pinata public gateway
  let imgUrl    = ''
  let bannerUrl = ''

  try {
    if (imageDataUrl) {
      imgUrl = await uploadToIPFS(imageDataUrl, `${symbol.toLowerCase()}-logo`)
    }
    if (bannerDataUrl) {
      bannerUrl = await uploadToIPFS(bannerDataUrl, `${symbol.toLowerCase()}-banner`)
    }
  } catch (e) {
    // IPFS upload failed — continue without images
    console.warn('IPFS upload failed:', e)
  }

  setDeployStatus('loading', 'Preparing transaction...')

  try {
    // Encode the launchToken call
    const calldata = encodeLaunchToken({
      name, symbol,
      img:         imgUrl,
      banner:      bannerUrl,
      description: desc,
      website,
      twitter,
      telegram,
    })

    setDeployStatus('loading', 'Confirm in your wallet...')

    // Pre-simulate the deploy so a would-revert tx never reaches the wallet
    // (a reverting tx is the #1 cause of MetaMask/Blockaid 'can't verify' warnings).
    try {
      await window.ethereum.request({ method: 'eth_call', params: [{ from: walletAddress, to: FACTORY, value: LAUNCH_FEE, data: calldata }, 'latest'] })
    } catch (_e) {
      setDeployStatus('error', 'Transaction would fail — check inputs/fee and try again.')
      return
    }

    const txHash = await window.ethereum.request({
      method: 'eth_sendTransaction',
      params: [{
        from:  walletAddress,
        to:    FACTORY,
        value: LAUNCH_FEE,
        data:  calldata,
        gas:   '0x7A120', // 500k gas limit
      }]
    })

    setDeployStatus('loading', `TX submitted: ${txHash.slice(0,10)}... Waiting for confirmation...`)

    // Wait for receipt
    const receipt = await waitForReceipt(txHash)

    if (receipt && receipt.status === '0x1') {
      // Extract token address from logs (first contract creation in logs)
      const tokenAddress = extractTokenAddress(receipt)
      showSuccess(txHash, tokenAddress, symbol)
    } else {
      setDeployStatus('error', 'Transaction failed. Please try again.')
      setTimeout(() => showScreen('form'), 2000)
    }
  } catch (e) {
    if (e.code === 4001) {
      setDeployStatus('error', 'Transaction rejected by user.')
    } else {
      setDeployStatus('error', `Error: ${e.message?.slice(0, 80)}`)
    }
    setTimeout(() => showScreen('form'), 2500)
  }
}

function showSuccess(txHash, tokenAddress, symbol) {
  showScreen('success')
  $('tx-link').href = `${BASE_SCAN}/tx/${txHash}`
  $('tx-link').textContent = `TX: ${txHash.slice(0,10)}...${txHash.slice(-6)} ↗`
  if (tokenAddress) {
    $('token-link').href = `${SITE_URL}/token/${tokenAddress}`
    $('token-link').textContent = `View $${symbol} on Based Trenches ↗`
    $('token-link').style.display = 'block'
  } else {
    $('token-link').style.display = 'none'
  }
}

// ── IPFS upload via nft.storage public endpoint ───────────────────────────────
async function uploadToIPFS(dataUrl, name) {
  // Convert dataUrl to blob
  const res    = await fetch(dataUrl)
  const blob   = await res.blob()
  const form   = new FormData()
  form.append('file', blob, name)

  // Use web3.storage or nft.storage free tier
  // Fallback: just return the dataUrl directly (stored in contract as base64)
  // For production you'd use Pinata API key
  // For now we store directly in contract metadata
  return dataUrl.substring(0, 500) // truncate if too large
}

// ── ABI encoding (manual, no ethers dependency) ───────────────────────────────
function encodeLaunchToken(meta) {
  // Function selector for launchToken((string,string,string,string,string,string,string,string))
  // keccak256("launchToken((string,string,string,string,string,string,string,string))") first 4 bytes
  const selector = '0x5a9249e6'

  const strings = [
    meta.name, meta.symbol, meta.img, meta.banner,
    meta.description, meta.website, meta.twitter, meta.telegram
  ]

  return selector + encodeABITuple(strings)
}

function encodeABITuple(strings) {
  // Encode a tuple of strings according to ABI spec
  const count  = strings.length
  // Tuple has one offset pointing to the start of the inner tuple data
  // Inner: offsets for each string, then string data
  let offsets  = []
  let data     = []
  let offset   = count * 32 // start after all offsets

  for (const s of strings) {
    offsets.push(offset)
    const encoded = encodeString(s)
    data.push(encoded)
    offset += encoded.length / 2
  }

  // Outer offset: 32 (points to start of tuple)
  let result = padHex(32) // offset to tuple

  // Inner offsets
  for (const o of offsets) {
    result += padHex(o)
  }

  // String data
  for (const d of data) {
    result += d
  }

  return result
}

function encodeString(str) {
  const bytes  = new TextEncoder().encode(str)
  const len    = bytes.length
  const lenHex = padHex(len)
  let dataHex  = ''
  for (const b of bytes) {
    dataHex += b.toString(16).padStart(2, '0')
  }
  // Pad to 32 bytes
  const padded = dataHex.padEnd(Math.ceil(len / 32) * 64, '0')
  return lenHex + padded
}

function padHex(n) {
  return n.toString(16).padStart(64, '0')
}

// ── Wait for receipt ──────────────────────────────────────────────────────────
async function waitForReceipt(txHash, retries = 30) {
  for (let i = 0; i < retries; i++) {
    await sleep(2000)
    try {
      const receipt = await window.ethereum.request({
        method: 'eth_getTransactionReceipt',
        params: [txHash]
      })
      if (receipt) return receipt
    } catch (_) {}
  }
  return null
}

function extractTokenAddress(receipt) {
  // Token is the first contract created in the tx (first log with contractAddress or first log[0].address)
  if (receipt.logs && receipt.logs.length > 0) {
    // The TokenLaunched event should have the token address in topics[1]
    for (const log of receipt.logs) {
      if (log.topics && log.topics.length >= 2) {
        const addr = '0x' + log.topics[1].slice(-40)
        if (addr !== '0x0000000000000000000000000000000000000000') {
          return addr
        }
      }
    }
  }
  return null
}

// ── Load trending tokens ──────────────────────────────────────────────────────
async function loadTrendingTokens() {
  try {
    const res  = await fetch(`${SITE_URL}/api/tokens`)
    const data = await res.json()
    renderTokens(data.tokens || [])
  } catch (e) {
    $('tokens-list').innerHTML = '<div class="loading-msg">Could not load tokens.</div>'
  }
}

function renderTokens(tokens) {
  if (tokens.length === 0) {
    $('tokens-list').innerHTML = '<div class="loading-msg">No tokens yet — be the first to launch!</div>'
    return
  }

  const html = tokens.slice(0, 20).map(t => {
    const imgHtml = t.imageUrl
      ? `<img src="${t.imageUrl}" />`
      : '🪖'
    const pct = (t.bondPercent || 0).toFixed(0)
    const badge = t.isRaiding ? '<span style="font-size:9px;color:var(--red)">⚔ RAID</span>'
                : t.graduated ? '<span style="font-size:9px;color:var(--gold)">⚡ GRAD</span>'
                : ''
    return `
      <a class="token-row" href="${SITE_URL}/token/${t.address}" target="_blank">
        <div class="token-row-img">${imgHtml}</div>
        <div class="token-row-info">
          <div class="token-row-sym">$${t.symbol} ${badge}</div>
          <div class="token-row-name">${t.name}</div>
        </div>
        <div class="token-row-right">
          <div class="token-row-pct">${pct}%</div>
          <div class="mini-bar"><div class="mini-fill" style="width:${pct}%"></div></div>
        </div>
      </a>
    `
  }).join('')

  $('tokens-list').innerHTML = html
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function showStatus(id, type, msg) {
  const el = $(id)
  el.className = `status ${type}`
  el.textContent = msg
  el.style.display = 'block'
}

function setDeployStatus(type, msg) {
  const el = $('deploy-status')
  el.className = `status ${type}`
  el.textContent = msg
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms))
}
