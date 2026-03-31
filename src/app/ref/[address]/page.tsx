'use client'
import { useEffect } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'

export default function RefPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const refAddress = params.address as string
  const tokenAddress = searchParams.get('token')

  useEffect(() => {
    if (!refAddress || !refAddress.startsWith('0x')) {
      router.push('/')
      return
    }
    // Store referrer in localStorage — persists across sessions
    try {
      localStorage.setItem('bt_referrer', refAddress.toLowerCase())
      localStorage.setItem('bt_referrer_ts', Date.now().toString())
    } catch (_) {}

    // Short delay to show the splash, then redirect to token page or trenches
    const destination = tokenAddress && tokenAddress.startsWith('0x')
      ? `/token/${tokenAddress}`
      : '/trenches'
    const t = setTimeout(() => router.push(destination), 2000)
    return () => clearTimeout(t)
  }, [refAddress, router, tokenAddress])

  const short = refAddress
    ? `${refAddress.slice(0, 6)}...${refAddress.slice(-4)}`
    : '...'

  return (
    <div style={{
      minHeight: 'calc(100vh - 56px)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '2rem', textAlign: 'center',
      background: 'var(--bg)',
    }}>
      <Image src="/banner.png" alt="Based Trenches" width={400} height={175}
        style={{ maxWidth: '90vw', height: 'auto', marginBottom: '2rem', filter: 'drop-shadow(0 0 20px rgba(184,112,64,0.3))' }}
        priority
      />
      <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', padding: '2rem', maxWidth: '420px', width: '100%' }}>
        <div style={{ fontSize: '32px', marginBottom: '1rem' }}>🪖</div>
        <div style={{ fontFamily: 'Black Ops One, cursive', fontSize: '22px', color: 'var(--cream)', marginBottom: '0.5rem' }}>
          You've been recruited
        </div>
        <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '13px', color: 'var(--grey-l)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
          Referred by <span style={{ fontFamily: 'Share Tech Mono, monospace', color: 'var(--copper)' }}>{short}</span>
          <br />They'll earn 0.02% on every buy you make.
        </div>
        <div style={{ height: '4px', background: 'rgba(255,255,255,0.06)', marginBottom: '1rem', overflow: 'hidden' }}>
          <div style={{ height: '100%', background: 'linear-gradient(90deg,var(--copper),var(--gold))', animation: 'loading 2s linear forwards' }} />
        </div>
        <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '11px', color: 'var(--grey)' }}>
          Entering the trenches...
        </div>
      </div>
      <style>{`
        @keyframes loading {
          from { width: 0% }
          to   { width: 100% }
        }
      `}</style>
    </div>
  )
}
