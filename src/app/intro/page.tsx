'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

const SLIDES = [
  { icon: null,  title: 'Based Trenches',   sub: 'A memecoin launchpad on Base Chain', body: 'Tokens bond to 3 ETH on a smooth curve, graduate to Uniswap V3 automatically, and feed a global jackpot. Every holder has skin in the game.', cta: 'SHOW ME HOW →' },
  { icon: '🪖',  title: 'Launch for $4',     sub: '0.002 ETH · 1B supply · ~$3K starting mcap', body: 'Deploy your token in one transaction. Your token gets its own bonding curve, Armory vault, and staking pool — all deployed automatically on Base.', cta: 'NEXT →' },
  { icon: '📈',  title: 'Bond to 3 ETH',     sub: 'Smooth bonding curve · Auto-graduation', body: 'Every buy pushes the price up the curve. Hit 3 ETH → graduation. 2.5 ETH + 200M tokens seeded to Uniswap V3. LP locked forever. 0.25 ETH goes to you.', cta: 'NEXT →' },
  { icon: '⚡',  title: 'The War Chest',      sub: 'Global jackpot · Up to 2 ETH', body: 'Every buy on every token feeds the War Chest. When it activates, the next token to graduate wins. 50% liq boost · 30% random buyers · 20% last buyer.', cta: 'NEXT →' },
  { icon: '🛡',  title: 'Trench Guard',       sub: 'Free Chrome extension · Wallet protection', body: 'Scam detection, unlimited approval warnings, and rug pull alerts built into your browser. Pro tier adds 24/7 wallet monitoring and transaction simulation.', cta: 'NEXT →' },
  { icon: '⚔',  title: 'Dig In.',             sub: 'Based Trenches is live on Base Chain.', body: 'Launch a token, trade the trenches, or protect your wallet with Trench Guard. Everything is on-chain and permissionless.', cta: '⚔ ENTER THE TRENCHES', isLast: true },
]

export default function IntroPage() {
  const router = useRouter()
  const [slide, setSlide] = useState(0)
  const [fading, setFading] = useState(false)

  function markSeen() {
    // Set both cookie AND localStorage — works on .fun AND .co
    try {
      document.cookie = 'bt_intro_seen=1; path=/; max-age=31536000; SameSite=Lax'
      localStorage.setItem('bt_intro_seen', '1')
    } catch (_) {}
  }

  function skip()   { markSeen(); router.push('/') }
  function launch() { markSeen(); router.push('/launch') }
  function guard()  { markSeen(); router.push('/guard') }

  function next() {
    if (slide >= SLIDES.length - 1) { markSeen(); router.push('/trenches'); return }
    setFading(true)
    setTimeout(() => { setSlide(s => s + 1); setFading(false) }, 180)
  }

  const s = SLIDES[slide]

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: '2rem', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(184,112,64,0.04) 0%, transparent 60%)', pointerEvents: 'none' }} />

      {/* Skip */}
      <button onClick={skip} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', fontFamily: 'Share Tech Mono, monospace', fontSize: '11px', color: 'var(--grey-l)', background: 'transparent', border: 'none', cursor: 'pointer', letterSpacing: '0.1em' }}>
        SKIP INTRO →
      </button>

      {/* Dots */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '3rem' }}>
        {SLIDES.map((_, i) => (
          <div key={i} style={{ width: i === slide ? '24px' : '6px', height: '6px', borderRadius: '3px', background: i === slide ? 'var(--copper)' : 'var(--grey)', transition: 'all 0.3s' }} />
        ))}
      </div>

      {/* Content */}
      <div style={{ maxWidth: '680px', width: '100%', textAlign: 'center', opacity: fading ? 0 : 1, transform: fading ? 'translateY(8px)' : 'translateY(0)', transition: 'all 0.18s' }}>
        {slide === 0
          ? <Image src="/banner.png" alt="Based Trenches" width={500} height={219} style={{ maxWidth: 'min(500px,90vw)', width: '100%', height: 'auto', marginBottom: '2rem', filter: 'drop-shadow(0 0 20px rgba(184,112,64,0.3))' }} priority />
          : <div style={{ fontSize: '52px', marginBottom: '1rem' }}>{s.icon}</div>
        }
        <div style={{ fontFamily: 'Black Ops One, cursive', fontSize: 'clamp(24px,5vw,42px)', color: 'var(--cream)', marginBottom: '0.5rem' }}>{s.title}</div>
        <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '13px', color: 'var(--copper)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '1.5rem' }}>{s.sub}</div>
        <p style={{ fontFamily: 'Oswald, sans-serif', fontSize: '16px', color: 'var(--grey-l)', lineHeight: 1.8, maxWidth: '520px', margin: '0 auto 3rem' }}>{s.body}</p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={next} style={{ fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: '15px', color: '#060504', background: 'linear-gradient(135deg,var(--copper),var(--copper-l))', border: 'none', padding: '0.85rem 2.5rem', cursor: 'pointer', letterSpacing: '0.12em', textTransform: 'uppercase', clipPath: 'polygon(6px 0%,100% 0%,calc(100% - 6px) 100%,0% 100%)' }}>
            {s.cta}
          </button>
          {(s as any).isLast && (
            <>
              <button onClick={launch} style={{ fontFamily: 'Oswald, sans-serif', fontWeight: 600, fontSize: '15px', color: 'var(--copper)', background: 'transparent', border: '1px solid rgba(184,112,64,0.4)', padding: '0.85rem 2rem', cursor: 'pointer', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                LAUNCH A TOKEN
              </button>
              <button onClick={guard} style={{ fontFamily: 'Oswald, sans-serif', fontWeight: 600, fontSize: '15px', color: '#3a9948', background: 'transparent', border: '1px solid rgba(58,153,72,0.4)', padding: '0.85rem 2rem', cursor: 'pointer', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                🛡 GET TRENCH GUARD
              </button>
            </>
          )}
        </div>
      </div>

      <div style={{ position: 'absolute', bottom: '2rem', fontFamily: 'Share Tech Mono, monospace', fontSize: '10px', color: 'var(--grey)', letterSpacing: '0.12em' }}>
        {slide + 1} / {SLIDES.length}
      </div>
    </div>
  )
}
