'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { WarChestBar } from '../components/WarChestBar'
import { StatsBar } from '../components/StatsBar'
import { TickerTape } from '../components/TickerTape'
import { TheWire } from '../components/TheWire'
import { TrendingTrenches } from '../components/TrendingTrenches'
import { CombatLog } from '../components/CombatLog'
import { HowItWorks } from '../components/HowItWorks'

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    const seen = document.cookie.split(';').some(c => c.trim().startsWith('bt_intro_seen='))
    if (!seen) router.push('/intro')
  }, [router])

  return (
    <>
      <section style={{ minHeight: 'calc(100vh - 56px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '4rem 2rem 6rem' }}>
        <Image src="/banner.png" alt="Based Trenches" width={700} height={307} style={{ maxWidth: 'min(700px, 90vw)', width: '100%', height: 'auto', marginBottom: '0.75rem', filter: 'drop-shadow(0 0 30px rgba(184,112,64,0.3))' }} priority />
        <p style={{ fontFamily: 'Oswald, sans-serif', fontSize: '18px', fontWeight: 400, color: 'var(--grey-l)', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: '2.5rem' }}>
          On <span style={{ color: 'var(--copper)' }}>Base</span>. Dig In.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '4rem', flexWrap: 'wrap' }}>
          <Link href="/launch" style={{ fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: '15px', color: '#060504', background: 'linear-gradient(135deg,#b87040,#d4956a)', border: 'none', padding: '0.75rem 2rem', letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none', display: 'inline-block', clipPath: 'polygon(6px 0%,100% 0%,calc(100% - 6px) 100%,0% 100%)' }}>
            Launch A Token
          </Link>
          <Link href="/trenches" style={{ fontFamily: 'Oswald, sans-serif', fontWeight: 600, fontSize: '15px', color: 'var(--copper)', background: 'transparent', border: '1px solid rgba(184,112,64,0.4)', padding: '0.75rem 2rem', letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'crosshair', textDecoration: 'none', display: 'inline-block' }}>
             View Live Trenches
        </Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1px', background: 'var(--border)', border: '1px solid var(--border)', maxWidth: '720px', width: '100%' }}>
          {[{v:'1,247+',l:'Tokens Launched'},{v:'89 ETH',l:'Total Volume'},{v:'34',l:'Broke Out'},{v:'1.74 ETH',l:'War Chest'}].map(s => (
            <div key={s.l} style={{ background: 'var(--panel)', padding: '1.25rem 1.5rem', textAlign: 'center' }}>
              <div style={{ fontFamily: 'Black Ops One, cursive', fontSize: '24px', color: 'var(--copper-l)' }}>{s.v}</div>
              <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '10px', color: 'var(--grey-l)', letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: '4px' }}>{s.l}</div>
            </div>
          ))}
        </div>
      </section>
      <TickerTape />
      <WarChestBar />
      <StatsBar />
      <TheWire />
      <TrendingTrenches />
      <CombatLog />
      <HowItWorks />
    </>
  )
}