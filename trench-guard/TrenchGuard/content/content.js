;(function() {
  const BT_HOSTS = ['basedtrenches.fun','www.basedtrenches.fun','basedtrenches.co','www.basedtrenches.co']
  const host = location.hostname.toLowerCase()
  const isBT = BT_HOSTS.includes(host)

  // Inject verified badge on BT official site
  if (isBT) {
    window.addEventListener('load', () => {
      const b = document.createElement('div')
      b.innerHTML = '🛡 Trench Guard Verified'
      b.style.cssText = [
        'position:fixed','bottom:16px','right:16px','z-index:999999',
        'background:rgba(6,5,4,0.95)','border:1px solid rgba(58,153,72,0.5)',
        'color:#3a9948','font-family:Oswald,sans-serif','font-size:11px',
        'font-weight:700','padding:5px 14px','letter-spacing:0.08em',
        'pointer-events:none','opacity:0','transition:opacity 0.5s',
      ].join(';')
      document.body.appendChild(b)
      setTimeout(() => b.style.opacity = '1', 800)
      setTimeout(() => b.style.opacity = '0', 4000)
    })
  }

  // Intercept wallet requests — warn on unlimited approvals + suspicious contracts
  if (window.ethereum) {
    const orig = window.ethereum.request.bind(window.ethereum)
    window.ethereum.request = async function(args) {
      if (args.method === 'eth_sendTransaction') {
        const data  = args.params?.[0]?.data || ''
        const to    = (args.params?.[0]?.to || '').toLowerCase()
        const value = parseInt(args.params?.[0]?.value || '0x0', 16)

        // Warn on unlimited token approval
        if (data.startsWith('0x095ea7b3') && data.slice(-64) === 'f'.repeat(64)) {
          const ok = confirm(
            '⚠ TRENCH GUARD — UNLIMITED APPROVAL WARNING\n\n' +
            'This transaction grants UNLIMITED access to your tokens.\n' +
            'Scammers use this to drain your wallet later.\n\n' +
            'Proceed anyway?'
          )
          if (!ok) throw new Error('Blocked by Trench Guard — unlimited approval rejected')
        }

        // Pro: warn if sending large ETH to unknown contract
        const largeValue = value > 0.5 * 1e18
        if (largeValue && data && data !== '0x') {
          const ok = confirm(
            '⚠ TRENCH GUARD — LARGE TRANSACTION WARNING\n\n' +
            `Sending ${(value / 1e18).toFixed(4)} ETH to a contract.\n` +
            'Make sure you trust this contract.\n\n' +
            'Proceed?'
          )
          if (!ok) throw new Error('Blocked by Trench Guard — large tx rejected by user')
        }
      }
      return orig(args)
    }
  }
})()
