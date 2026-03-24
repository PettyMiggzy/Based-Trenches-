'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

export default function IntroPage() {
  const [current, setCurrent] = useState(0)
  const [animating, setAnimating] = useState(false)
  const router = useRouter()

  const setCookie = () => {
 document.cookie = 'bt_intro_seen=1; path=/; max-age=31536000; SameSite=Lax'
document.cookie = 'bt_intro_seen=1; path=/; max-age=31536000; domain=.basedtrenches.co; SameSite=Lax'
  }

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') goTo(current + 1)
      if (e.key === 'ArrowLeft') goTo(current - 1)
      if (e.key === 'Escape') skip()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [current])

  const goTo = (n: number) => {
    if (n < 0 || n >= 6 || animating) return
    setAnimating(true)
    setTimeout(() => { setCurrent(n); setAnimating(false) }, 300)
  }

  const skip = () => { setCookie(); router.push('/') }
  const enter = () => { setCookie(); router.push('/') }
  const launch = () => { setCookie(); router.push('/launch') }

  const fade = {
    opacity: animating ? 0 : 1,
    transform: animating ? 'translateY(16px)' : 'translateY(0)',
    transition: 'opacity 0.3s ease, transform 0.3s ease',
    display: 'flex' as const,
    flexDirection: 'column' as const,
    alignItems: 'center' as const,
    textAlign: 'center' as const,
    maxWidth: '800px',
    width: '100%',
  }

  const panel = { background: '#110f0b', padding: '1.25rem 1rem', textAlign: 'center' as const }
  const mono = { fontFamily: 'Share Tech Mono, monospace' }
  const ops = { fontFamily: 'Black Ops One, cursive' }
  const osw = { fontFamily: 'Oswald, sans-serif' }
  const bar = { fontFamily: 'Barlow Condensed, sans-serif' }

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#060504', color: '#e8e0c8', fontFamily: 'Barlow Condensed, sans-serif', cursor: 'crosshair', overflow: 'hidden', zIndex: 200 }}>

      {/* BG */}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 100% 100% at 50% 0%,#0a0806 0%,#060504 100%)', zIndex: 0 }} />
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(184,112,64,0.07) 1px,transparent 1px),linear-gradient(90deg,rgba(184,112,64,0.07) 1px,transparent 1px)', backgroundSize: '48px 48px', WebkitMaskImage: 'linear-gradient(to bottom,rgba(0,0,0,0.5) 0%,transparent 80%)', maskImage: 'linear-gradient(to bottom,rgba(0,0,0,0.5) 0%,transparent 80%)', zIndex: 0 }} />
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center,transparent 20%,rgba(0,0,0,0.75) 100%)', zIndex: 0 }} />

      {/* Skip */}
      {current < 5 && (
        <button onClick={skip} style={{ position: 'absolute', top: '1.5rem', right: '2rem', zIndex: 50, ...mono, fontSize: '11px', color: '#8a8070', background: 'transparent', border: 'none', cursor: 'crosshair', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          Skip Intro →
        </button>
      )}

      {/* SLIDE AREA */}
      <div style={{ position: 'relative', zIndex: 1, width: '100%', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>

        {/* SLIDE 1 — TOSHI HERO */}
        {current === 0 && (
          <div style={{ opacity: animating ? 0 : 1, transform: animating ? 'translateY(16px)' : 'translateY(0)', transition: 'opacity 0.3s ease, transform 0.3s ease', display: 'grid', gridTemplateColumns: '1fr 1fr', maxWidth: '1100px', width: '100%', height: '85vh', alignItems: 'center', gap: '3rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ ...mono, fontSize: '12px', color: '#b87040', letterSpacing: '0.2em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ width: '32px', height: '1px', background: '#b87040', display: 'inline-block' }} />
                On Base · Dig In
              </div>
              <h1 style={{ ...ops, fontSize: 'clamp(40px,6vw,72px)', lineHeight: 0.92, letterSpacing: '0.02em', margin: 0 }}>
                BASED<br />
                <span style={{ background: 'linear-gradient(135deg,#b87040,#f0b020)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>TRENCHES</span>
              </h1>
              <p style={{ ...bar, fontSize: '18px', color: '#8a8070', lineHeight: 1.5, maxWidth: '460px', margin: 0 }}>
                A <strong style={{ color: '#d4956a' }}>memecoin launchpad</strong> on Base Chain. Tokens bond to 3 ETH, graduate to Uniswap V3, and feed a global jackpot. Every holder has skin in the game.
              </p>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginTop: '0.5rem' }}>
                <button onClick={() => goTo(1)} style={{ ...osw, fontWeight: 700, fontSize: '15px', color: '#060504', background: 'linear-gradient(135deg,#b87040,#d4956a)', border: 'none', padding: '0.8rem 2rem', letterSpacing: '0.1em', cursor: 'crosshair', clipPath: 'polygon(6px 0%,100% 0%,calc(100% - 6px) 100%,0% 100%)', textTransform: 'uppercase' }}>
                  Show Me How →
                </button>
                <button onClick={skip} style={{ ...osw, fontWeight: 600, fontSize: '14px', color: '#8a8070', background: 'transparent', border: 'none', cursor: 'crosshair', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  Skip
                </button>
              </div>
            </div>
            <div style={{ position: 'relative', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
              <Image
                src="/toshi.png"
                alt="Toshi"
                width={700}
                height={308}
                style={{ width: '100%', height: 'auto', maxHeight: '70vh', objectFit: 'contain', objectPosition: 'right center', filter: 'drop-shadow(-20px 0 60px rgba(184,112,64,0.15))', animation: 'float 6s ease-in-out infinite' }}
                priority
              />
            </div>
          </div>
        )}

        {/* SLIDE 2 — BONDING CURVE */}
        {current === 1 && (
          <div style={fade}>
            <div style={{ ...mono, fontSize: '11px', color: '#5a5040', letterSpacing: '0.2em', marginBottom: '2rem' }}>02 / 06</div>
            <div style={{ fontSize: '48px', marginBottom: '1rem' }}>📈</div>
            <h2 style={{ ...ops, fontSize: 'clamp(28px,5vw,52px)', color: '#e8e0c8', letterSpacing: '0.03em', marginBottom: '1rem', lineHeight: 1 }}>
              Launch on the <span style={{ color: '#d4956a' }}>Bonding Curve</span>
            </h2>
            <p style={{ ...bar, fontSize: '18px', color: '#8a8070', lineHeight: 1.6, maxWidth: '600px', marginBottom: '2rem' }}>
              Every token starts at ~<strong style={{ color: '#e8e0c8' }}>$3,000 market cap</strong>. Pay <strong style={{ color: '#e8e0c8' }}>0.002 ETH</strong> to deploy. The bonding curve runs until <strong style={{ color: '#e8e0c8' }}>3 ETH</strong> is reached — early buyers get the best price.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1px', background: 'rgba(184,112,64,0.18)', border: '1px solid rgba(184,112,64,0.18)', width: '100%', maxWidth: '600px', marginBottom: '2rem' }}>
              {[['0.002 ETH','Launch Fee'],['3 ETH','Graduation Target'],['1B','Token Supply']].map(([v,l]) => (
                <div key={l} style={panel}>
                  <div style={{ ...ops, fontSize: '22px', color: '#d4956a' }}>{v}</div>
                  <div style={{ ...mono, fontSize: '9px', color: '#8a8070', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: '4px' }}>{l}</div>
                </div>
              ))}
            </div>
            <p style={{ ...bar, fontSize: '15px', color: '#8a8070', lineHeight: 1.6, maxWidth: '560px' }}>
              At graduation: Uniswap V3 pool created automatically. Creator earns <strong style={{ color: '#3a9948' }}>0.25 ETH</strong>. Platform gets <strong style={{ color: '#b87040' }}>0.25 ETH</strong>. LP owned by protocol vault forever.
            </p>
          </div>
        )}

        {/* SLIDE 3 — WAR CHEST */}
        {current === 2 && (
          <div style={fade}>
            <div style={{ ...mono, fontSize: '11px', color: '#5a5040', letterSpacing: '0.2em', marginBottom: '2rem' }}>03 / 06</div>
            <div style={{ fontSize: '48px', marginBottom: '1rem' }}>⚡</div>
            <h2 style={{ ...ops, fontSize: 'clamp(28px,5vw,52px)', letterSpacing: '0.03em', marginBottom: '1rem', lineHeight: 1, background: 'linear-gradient(135deg,#c8900a,#f0b020)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              The War Chest
            </h2>
            <p style={{ ...bar, fontSize: '18px', color: '#8a8070', lineHeight: 1.6, maxWidth: '600px', marginBottom: '2rem' }}>
              Every graduated token feeds a <strong style={{ color: '#e8e0c8' }}>global jackpot</strong>. Activates at <strong style={{ color: '#e8e0c8' }}>1 ETH</strong>. The next token to break out wins up to <strong style={{ color: '#f0b020' }}>2 ETH</strong>.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '2rem' }}>
              {[['40%','Liquidity Boost'],['20%','Top 10 Holders'],['10%','Last Buyer'],['5%','Stakers'],['5%','Armory'],['20%','Platform']].map(([pct,label]) => (
                <div key={label} style={{ ...mono, fontSize: '11px', padding: '6px 14px', border: '1px solid rgba(200,144,10,0.25)', background: 'rgba(200,144,10,0.06)', color: '#c8900a' }}>
                  <strong style={{ color: '#f0b020' }}>{pct}</strong> {label}
                </div>
              ))}
            </div>
            <p style={{ ...bar, fontSize: '15px', color: '#8a8070', lineHeight: 1.6, maxWidth: '560px' }}>
              Be the <strong style={{ color: '#e8e0c8' }}>last buyer</strong> before graduation → 10%. Be a <strong style={{ color: '#e8e0c8' }}>top 10 holder</strong> → share 20%. Chest resets and charges again after each payout.
            </p>
          </div>
        )}

        {/* SLIDE 4 — RAIDS */}
        {current === 3 && (
          <div style={fade}>
            <div style={{ ...mono, fontSize: '11px', color: '#5a5040', letterSpacing: '0.2em', marginBottom: '2rem' }}>04 / 06</div>
            <div style={{ fontSize: '48px', marginBottom: '1rem' }}>⚔</div>
            <h2 style={{ ...ops, fontSize: 'clamp(28px,5vw,52px)', color: '#e8e0c8', letterSpacing: '0.03em', marginBottom: '1rem', lineHeight: 1 }}>
              What is a <span style={{ color: '#ff3311' }}>Raid</span>?
            </h2>
            <p style={{ ...bar, fontSize: '18px', color: '#8a8070', lineHeight: 1.6, maxWidth: '600px', marginBottom: '2rem' }}>
              When a token gets rapid buys — <strong style={{ color: '#e8e0c8' }}>5 buys in 90 seconds</strong> or a <strong style={{ color: '#e8e0c8' }}>0.5 ETH surge</strong> — a Raid triggers. Pure momentum signal. Get in before it graduates.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '2rem' }}>
              <div style={{ ...osw, fontWeight: 700, fontSize: '11px', padding: '5px 14px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#b87040', border: '1px solid rgba(184,112,64,0.4)', background: 'rgba(184,112,64,0.08)' }}>⚡ Raid Started</div>
              <div style={{ ...osw, fontWeight: 700, fontSize: '11px', padding: '5px 14px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#ff3311', border: '1px solid rgba(204,34,0,0.4)', background: 'rgba(204,34,0,0.08)' }}>⚔ Raid Active</div>
              <div style={{ ...osw, fontWeight: 700, fontSize: '11px', padding: '5px 14px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#3a9948', border: '1px solid rgba(58,153,72,0.4)', background: 'rgba(58,153,72,0.08)' }}>✓ Raid Successful</div>
              <div style={{ ...osw, fontWeight: 700, fontSize: '11px', padding: '5px 14px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8a8070', border: '1px solid rgba(90,80,64,0.4)' }}>✕ Raid Failed</div>
            </div>
            <p style={{ ...bar, fontSize: '15px', color: '#8a8070', lineHeight: 1.6, maxWidth: '560px' }}>
              Watch the <strong style={{ color: '#e8e0c8' }}>Combat Log</strong> and <strong style={{ color: '#e8e0c8' }}>War Room</strong> for live Raids. When you see ⚔ on a token card — that is your signal to move.
            </p>
          </div>
        )}

        {/* SLIDE 5 — FORTIFY & ARMORY */}
        {current === 4 && (
          <div style={fade}>
            <div style={{ ...mono, fontSize: '11px', color: '#5a5040', letterSpacing: '0.2em', marginBottom: '2rem' }}>05 / 06</div>
            <div style={{ fontSize: '48px', marginBottom: '1rem' }}>🏰</div>
            <h2 style={{ ...ops, fontSize: 'clamp(28px,5vw,52px)', color: '#e8e0c8', letterSpacing: '0.03em', marginBottom: '1rem', lineHeight: 1 }}>
              <span style={{ color: '#d4956a' }}>Fortify</span> &amp; <span style={{ background: 'linear-gradient(135deg,#c8900a,#f0b020)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Armory</span>
            </h2>
            <p style={{ ...bar, fontSize: '18px', color: '#8a8070', lineHeight: 1.6, maxWidth: '600px', marginBottom: '2rem' }}>
              Every graduated token has its own <strong style={{ color: '#e8e0c8' }}>staking pool</strong> (Fortify) earning real ETH from Uniswap fees, and a <strong style={{ color: '#e8e0c8' }}>reserve treasury</strong> (Armory) funded by sell fees.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1px', background: 'rgba(184,112,64,0.18)', border: '1px solid rgba(184,112,64,0.18)', maxWidth: '560px', width: '100%', marginBottom: '2rem' }}>
              {[['30d','1x'],['60d','1.5x'],['90d','2x'],['180d','3x']].map(([d,m]) => (
                <div key={d} style={panel}>
                  <div style={{ ...ops, fontSize: '16px', color: '#d4956a' }}>{d}</div>
                  <div style={{ ...mono, fontSize: '13px', color: '#3a9948', marginTop: '4px' }}>{m}</div>
                  <div style={{ ...mono, fontSize: '9px', color: '#5a5040', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: '2px' }}>multiplier</div>
                </div>
              ))}
            </div>
            <p style={{ ...bar, fontSize: '15px', color: '#8a8070', lineHeight: 1.6, maxWidth: '560px' }}>
              Stake longer, earn more. Unstake early = <strong style={{ color: '#e8e0c8' }}>10% penalty</strong> back to stakers + forfeit rewards. Armory votes monthly: <strong style={{ color: '#e8e0c8' }}>buyback + burn</strong> or <strong style={{ color: '#e8e0c8' }}>add liquidity</strong>.
            </p>
          </div>
        )}

        {/* SLIDE 6 — ENTER */}
        {current === 5 && (
          <div style={fade}>
            <div style={{ ...mono, fontSize: '11px', color: '#5a5040', letterSpacing: '0.2em', marginBottom: '2rem' }}>06 / 06</div>
            <div style={{ fontSize: '56px', marginBottom: '1rem' }}>🪖</div>
            <h2 style={{ ...ops, fontSize: 'clamp(36px,6vw,72px)', color: '#e8e0c8', letterSpacing: '0.02em', lineHeight: 0.92, marginBottom: '1rem' }}>
              READY TO<br />
              <span style={{ background: 'linear-gradient(135deg,#b87040,#f0b020)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>DIG IN?</span>
            </h2>
            <p style={{ ...osw, fontSize: '16px', color: '#8a8070', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '3rem' }}>
              On Base · The Trenches Await
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '2rem' }}>
              <button onClick={enter} style={{ ...osw, fontWeight: 700, fontSize: '17px', color: '#060504', background: 'linear-gradient(135deg,#b87040,#d4956a)', border: 'none', padding: '1rem 2.5rem', letterSpacing: '0.12em', cursor: 'crosshair', clipPath: 'polygon(8px 0%,100% 0%,calc(100% - 8px) 100%,0% 100%)', textTransform: 'uppercase' }}>
                ⚔ Enter The Trenches
              </button>
              <button onClick={launch} style={{ ...osw, fontWeight: 600, fontSize: '17px', color: '#b87040', background: 'transparent', border: '1px solid rgba(184,112,64,0.4)', padding: '1rem 2.5rem', letterSpacing: '0.12em', cursor: 'crosshair', clipPath: 'polygon(8px 0%,100% 0%,calc(100% - 8px) 100%,0% 100%)', textTransform: 'uppercase' }}>
                Launch A Token
              </button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ff3311', boxShadow: '0 0 6px #ff3311', animation: 'blink 0.9s ease-in-out infinite' }} />
              <span style={{ ...mono, fontSize: '11px', color: '#8a8070', letterSpacing: '0.1em' }}>LIVE ON BASE CHAIN</span>
            </div>
          </div>
        )}

      </div>

      {/* DOTS */}
      <div style={{ position: 'absolute', bottom: '2.5rem', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '0.6rem', alignItems: 'center', zIndex: 50 }}>
        {[0,1,2,3,4,5].map(i => (
          <div key={i} onClick={() => goTo(i)} style={{ width: i === current ? '24px' : '8px', height: '8px', borderRadius: i === current ? '4px' : '50%', background: i === current ? '#b87040' : 'rgba(184,112,64,0.25)', border: '1px solid rgba(184,112,64,0.3)', cursor: 'crosshair', transition: 'all 0.3s', boxShadow: i === current ? '0 0 8px rgba(184,112,64,0.6)' : 'none' }} />
        ))}
      </div>

      {/* PREV / NEXT */}
      {current > 0 && (
        <button onClick={() => goTo(current - 1)} style={{ position: 'absolute', bottom: '2rem', left: '2rem', ...osw, fontWeight: 700, fontSize: '12px', color: '#8a8070', background: 'rgba(184,112,64,0.06)', border: '1px solid rgba(184,112,64,0.18)', padding: '0.6rem 1rem', cursor: 'crosshair', letterSpacing: '0.1em', textTransform: 'uppercase', zIndex: 50 }}>
          ← Prev
        </button>
      )}
      {current < 5 && (
        <button onClick={() => goTo(current + 1)} style={{ position: 'absolute', bottom: '2rem', right: '2rem', ...osw, fontWeight: 700, fontSize: '12px', color: '#8a8070', background: 'rgba(184,112,64,0.06)', border: '1px solid rgba(184,112,64,0.18)', padding: '0.6rem 1rem', cursor: 'crosshair', letterSpacing: '0.1em', textTransform: 'uppercase', zIndex: 50 }}>
          Next →
        </button>
      )}

      <style>{`
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-16px)} }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.2} }
      `}</style>
    </div>
  )
}