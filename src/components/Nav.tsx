'use client'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ConnectButton } from '@rainbow-me/rainbowkit'

const navLinks = [
  { href: '/trenches',  label: 'The Trenches' },
  { href: '/launch',    label: 'Go To War'    },
  { href: '/war-room',  label: 'War Room'     },
  { href: '/hq',        label: 'HQ'           },
  { href: '/docs',      label: 'Docs'         },
  { href: '/guard',     label: '🛡 Guard'      },
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
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center' }}>
          <Image src="/BT.png" alt="Based Trenches" width={32} height={32}
            style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
        </Link>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <div style={{ fontFamily: 'Black Ops One, cursive', fontSize: '15px', color: 'var(--copper-l)', letterSpacing: '0.05em', lineHeight: 1 }}>Based Trenches</div>
          <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '8px', color: 'var(--grey-l)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>On Base · Dig In</div>
        </Link>
      </div>

      {/* Links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
        {navLinks.map(({ href, label }) => {
          const isActive = pathname === href || (href !== '/' && pathname.startsWith(href))
          const isGuard  = href === '/guard'
          return (
            <Link key={href} href={href} style={{
              fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: '12px',
              letterSpacing: '0.08em', textTransform: 'uppercase', textDecoration: 'none',
              padding: '0.35rem 0.65rem',
              color: isActive ? (isGuard ? '#3a9948' : 'var(--copper-l)') : isGuard ? 'rgba(58,153,72,0.8)' : 'var(--grey-l)',
              borderBottom: isActive ? `2px solid ${isGuard ? '#3a9948' : 'var(--copper)'}` : '2px solid transparent',
              transition: 'all 0.15s',
            }}>
              {label}
            </Link>
          )
        })}
      </div>

      {/* Right: War Room alert + wallet */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Link href="/war-room" style={{
          fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: '11px',
          letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none',
          color: 'var(--red)', display: 'flex', alignItems: 'center', gap: '4px',
          padding: '4px 10px', border: '1px solid rgba(255,51,17,0.3)',
          background: 'rgba(255,51,17,0.06)',
        }}>
          <span style={{ fontSize: '8px' }}>✖</span> WAR ROOM
        </Link>
        <ConnectButton />
      </div>
    </nav>
  )
}
