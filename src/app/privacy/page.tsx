export default function PrivacyPage() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '4rem 2rem' }}>
      <div style={{ fontFamily: 'Black Ops One, cursive', fontSize: '28px', color: 'var(--cream)', marginBottom: '0.5rem' }}>Privacy Policy</div>
      <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '11px', color: 'var(--grey-l)', marginBottom: '3rem' }}>Last updated: March 2026 · Trench Guard Chrome Extension</div>

      {[
        ['Overview', 'Trench Guard is a Chrome browser extension that protects your crypto wallet. This privacy policy explains what data we collect, how we use it, and your rights. We take privacy seriously — Trench Guard is designed to protect you, not surveil you.'],
        ['Data We Collect', 'Trench Guard stores the following data LOCALLY on your device only, using Chrome\'s built-in storage API:\n\n• Trial start date — to track your 30-day free trial period\n• Pro subscription expiry — to verify your Pro access\n• Alert history — a local log of security warnings shown to you\n• Notification preferences — your on/off settings\n• Last known wallet balance — used only for Pro wallet monitoring to detect unusual outflows\n\nNone of this data is ever transmitted to our servers or any third party.'],
        ['Data We Do NOT Collect', 'We do not collect, store, or transmit:\n\n• Your wallet address or private keys\n• Your browsing history\n• Your transaction history\n• Any personally identifiable information\n• Cookies or tracking identifiers'],
        ['How We Use Data', 'All data stored by Trench Guard is used solely to provide the extension\'s security features:\n\n• Trial/subscription data — to determine which features to unlock\n• Alert history — to show you a log of past warnings in the extension popup\n• Wallet balance cache — to detect unexpected balance drops and alert you (Pro only)'],
        ['Third Party Services', 'Trench Guard makes read-only calls to the following public services:\n\n• Base Chain RPC (mainnet.base.org) — to read on-chain data for contract scanning, wallet health checks, and subscription verification\n• Basescan API — to fetch token transaction history for the approval scanner\n\nThese calls are read-only and do not send any personal data. They are equivalent to using a block explorer.'],
        ['Subscription Payments', 'Pro subscriptions are paid directly on Base Chain via your wallet. Trench Guard verifies payment by checking on-chain transaction history. We do not process payments, store payment information, or have access to your wallet.'],
        ['Data Sharing', 'We do not sell, trade, or transfer your data to any third parties. Period.'],
        ['Children\'s Privacy', 'Trench Guard is not directed at children under 13. We do not knowingly collect data from children.'],
        ['Changes to This Policy', 'We may update this privacy policy from time to time. We will post the updated policy at basedtrenches.fun/privacy with a new date.'],
        ['Contact', 'Questions about this privacy policy? Reach us at basedtrenches.fun or through our community channels.'],
      ].map(([title, body]) => (
        <div key={title} style={{ marginBottom: '2.5rem' }}>
          <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '16px', fontWeight: 700, color: 'var(--copper)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.75rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border)' }}>{title}</div>
          <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '13px', color: 'var(--grey-l)', lineHeight: 1.8, whiteSpace: 'pre-line' }}>{body}</div>
        </div>
      ))}
    </div>
  )
}
