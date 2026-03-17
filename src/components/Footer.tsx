import Image from 'next/image'
import Link from 'next/link'

export function Footer() {
  return (
    <footer style={{ background: 'var(--deep)', borderTop: '1px solid var(--border)', padding: '3rem 2rem 2rem' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '3rem' }}>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Image src="/BT.png" alt="BT" width={48} height={48} style={{ borderRadius: '6px', objectFit: 'cover' }} />
          <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '11px', color: 'var(--grey-l)', letterSpacing: '0.1em' }}>ON BASE · DIG IN · CHAIN ID 8453</div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {[
              { label:'𝕏 @basedtrenches',    href:'https://x.com/basedtrenches' },
              { label:'TG @Based_Trenches',  href:'https://t.me/Based_Trenches' },
              { label:'basedtrenches.fun',   href:'https://basedtrenches.fun' },
              { label:'basedtrenches.co',    href:'https://basedtrenches.co' },
            ].map(s => (
              <a key={s.href} href={s.href} target="_blank" rel="noopener noreferrer" style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '10px', color: 'var(--grey-l)', background: 'rgba(184,112,64,0.06)', border: '1px solid var(--border)', padding: '5px 10px', textDecoration: 'none', transition: 'all 0.2s' }}>
                {s.label}
              </a>
            ))}
          </div>
        </div>

        {[
          { title:'Platform', links:[{l:'The Trenches',h:'/'},{l:'Go To War',h:'/launch'},{l:'War Room',h:'/war-room'},{l:'HQ',h:'/hq'}] },
          { title:'Mechanics', links:[{l:'Bonding Curve',h:'#'},{l:'War Chest',h:'#'},{l:'Fortify',h:'#'},{l:'Armory',h:'#'},{l:'Raids',h:'#'}] },
          { title:'Resources', links:[{l:'Docs',h:'#'},{l:'Smart Contracts',h:'#'},{l:'Uniswap V3',h:'#'}] },
        ].map(col => (
          <div key={col.title}>
            <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '11px', fontWeight: 700, color: 'var(--copper)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '1rem' }}>{col.title}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {col.links.map(link => (
                <Link key={link.l} href={link.h} style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: '14px', color: 'var(--grey-l)', textDecoration: 'none', transition: 'color 0.2s' }}>
                  {link.l}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div style={{ maxWidth: '1280px', margin: '2rem auto 0', paddingTop: '1.5rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '10px', color: 'var(--grey)', letterSpacing: '0.08em' }}>
          © 2026 Based Trenches. Built on Base. Not financial advice.
        </div>
        <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '10px', color: 'var(--copper)', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--cyan)', boxShadow: '0 0 6px var(--cyan)', display: 'inline-block' }} />
          BASE CHAIN · ID 8453 · UNISWAP V3 · 1% FEE TIER
        </div>
      </div>
    </footer>
  )
}
