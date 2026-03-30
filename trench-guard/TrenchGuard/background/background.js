const SCAM_KW = ['basedtrenches-','based-trenches-','basedtrenchess','trenchguard-','claim-airdrop','wallet-verify','metamask-secure','free-eth','connect-earn']
const BT_HOSTS = ['basedtrenches.fun','www.basedtrenches.fun','basedtrenches.co','www.basedtrenches.co']

chrome.runtime.onInstalled.addListener(async () => {
  const d = await chrome.storage.local.get(['installDate'])
  if (!d.installDate) await chrome.storage.local.set({ installDate: Date.now() })
  console.log('Trench Guard installed')
})

// Watch all navigation for scam sites
chrome.webNavigation.onCommitted.addListener(async details => {
  if (details.frameId !== 0) return
  try {
    const url  = new URL(details.url)
    const host = url.hostname.toLowerCase()
    const bad  = SCAM_KW.some(k => host.includes(k))
    if (bad) {
      chrome.notifications.create('scam_' + Date.now(), {
        type: 'basic',
        iconUrl: 'icons/icon48.png',
        title: '⚠ Trench Guard — Danger Detected',
        message: `Suspicious site: ${host} — Do NOT connect your wallet!`,
        priority: 2
      })
      const d = await chrome.storage.local.get(['alerts'])
      const alerts = d.alerts || []
      alerts.unshift({ site: host, msg: 'Suspicious domain — possible phishing/drainer', time: Date.now() })
      await chrome.storage.local.set({ alerts: alerts.slice(0, 20) })
    }
  } catch (_) {}
})

// Pro: periodic wallet monitoring (every 30 mins)
chrome.alarms.create('walletMonitor', { periodInMinutes: 30 })
chrome.alarms.onAlarm.addListener(async alarm => {
  if (alarm.name !== 'walletMonitor') return
  const d = await chrome.storage.local.get(['proExpiry','proWallet'])
  const isPro = d.proExpiry && d.proExpiry > Date.now()
  if (!isPro || !d.proWallet) return

  // Check for large outflows by comparing recent txs
  try {
    const res = await fetch('https://mainnet.base.org', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'eth_getBalance', params: [d.proWallet, 'latest'] })
    })
    const data    = await res.json()
    const balance = parseInt(data.result, 16) / 1e18

    // Get last known balance
    const prev = await chrome.storage.local.get(['lastBalance'])
    const last  = prev.lastBalance || balance
    await chrome.storage.local.set({ lastBalance: balance })

    // Alert if balance dropped more than 0.1 ETH suddenly
    if (last - balance > 0.1) {
      chrome.notifications.create('balance_drop_' + Date.now(), {
        type: 'basic',
        iconUrl: 'icons/icon48.png',
        title: '⚠ Trench Guard — Wallet Alert',
        message: `Your wallet balance dropped by ${(last - balance).toFixed(4)} ETH. Check for unauthorized transactions.`,
        priority: 2
      })
    }
  } catch (_) {}
})
