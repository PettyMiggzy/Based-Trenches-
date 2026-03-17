'use client'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ConnectButton } from '@rainbow-me/rainbowkit'

const navLinks = [
  { href: '/',          label: 'The Trenches' },
  { href: '/launch',   label: 'Go To War' },
  { href: '/war-room', label: 'War Room' },
  { href: '/hq',       label: 'HQ' },
  { href: '/docs',     label: 'Docs' },
]

export function Nav() {
  const pathname = usePathname()

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: 'rgba(6,5,4,0.94)',
      borderBottom: '1px solid rgba(184,112,64,0.18)',
      backdropFilter: 'blur(12px)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 2rem', height: '56px',
    }}>
      {/* LEFT — Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center' }}>
          <Image
            src="/BT.png"
            alt="Based Trenches"
            width={36}
            height={36}
            style={{ borderRadius: '4px', objectFit: 'cover' }}
            className="animate-logo-glow"
          />
        </Link>
        <div>
          <div style={{ fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: '15px', color: 'var(--cream)', letterSpacing: '0.05em' }}>
            Based Trenches
          </div>
          <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '10px', color: 'var(--copper)', letterSpacing: '0.15em' }}>
            ON BASE · DIG IN
          </div>
        </div>
      </div>

      {/* CENTER — Nav links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.1rem' }}>
        {navLinks.map(link => (
          <Link
            key={link.href}
            href={link.href}
            style={{
              fontFamily: 'Oswald, sans-serif',
              fontWeight: 500,
              fontSize: '13px',
              color: pathname === link.href ? 'var(--cream)' : 'var(--grey-l)',
              padding: '0.4rem 0.8rem',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              textDecoration: 'none',
              transition: 'color 0.2s',
            }}
          >
            {link.label}
          </Link>
        ))}
      </div>

      {/* RIGHT — War Room + Connect */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Link
          href="/war-room"
          className="animate-pulse-red"
          style={{
            fontFamily: 'Oswald, sans-serif',
            fontWeight: 700,
            fontSize: '12px',
            color: 'var(--red-b)',
            background: 'rgba(204,34,0,0.1)',
            border: '1px solid rgba(204,34,0,0.3)',
            padding: '0.35rem 0.8rem',
            letterSpacing: '0.1em',
            clipPath: 'polygon(6px 0%,100% 0%,calc(100% - 6px) 100%,0% 100%)',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <span className="animate-blink" style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--red-b)', boxShadow: '0 0 6px var(--red-b)', display: 'inline-block' }} />
          ⚔ WAR ROOM
        </Link>

        {/* RainbowKit connect — styled via theme in providers.tsx */}
        <ConnectButton
          label="Connect Wallet"
          accountStatus="address"
          chainStatus="none"
          showBalance={false}
        />
      </div>
    </nav>
  )
}
