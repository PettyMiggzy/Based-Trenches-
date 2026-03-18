'use client'
import { useState, useCallback } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import { parseEther } from 'viem'
import { GRAD_FLOW } from '../../lib/types'

const FACTORY_ADDRESS = process.env.NEXT_PUBLIC_FACTORY_ADDRESS as `0x${string}`

const FACTORY_ABI = [
  {
    name: 'launchToken',
    type: 'function',
    stateMutability: 'payable',
    inputs: [
      {
        name: 'm',
        type: 'tuple',
        components: [
          { name: 'name',        type: 'string' },
          { name: 'symbol',      type: 'string' },
          { name: 'imageUri',    type: 'string' },
          { name: 'description', type: 'string' },
          { name: 'website',     type: 'string' },
          { name: 'twitter',     type: 'string' },
          { name: 'telegram',    type: 'string' },
        ],
      },
    ],
    outputs: [
      { name: 'token',   type: 'address' },
      { name: 'curve',   type: 'address' },
      { name: 'armory',  type: 'address' },
      { name: 'fortify', type: 'address' },
    ],
  },
] as const

export default function LaunchPage() {
  const { isConnected } = useAccount()
  const { openConnectModal } = useConnectModal()

  const [name,        setName]        = useState('')
  const [symbol,      setSymbol]      = useState('')
  const [description, setDescription] = useState('')
  const [imageUri,    setImageUri]    = useState('')
  const [imagePreview,setImagePreview]= useState('')
  const [twitter,     setTwitter]     = useState('')
  const [telegram,    setTelegram]    = useState('')
  const [website,     setWebsite]     = useState('')
  const [uploading,   setUploading]   = useState(false)
  const [dragOver,    setDragOver]    = useState(false)
  const [error,       setError]       = useState('')

  const { writeContract, data: txHash, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash })

  // Upload image to imgbb (free image hosting — no API key needed for small images)
  // Alternatively uploads to a base64 data URI if small enough
  const handleImage = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) { setError('Please upload an image file'); return }
    if (file.size > 5 * 1024 * 1024) { setError('Image must be under 5MB'); return }
    setError('')
    setUploading(true)
    try {
      // Convert to base64 for preview
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setImagePreview(result)
      }
      reader.readAsDataURL(file)

      // Upload to imgbb
      const formData = new FormData()
      formData.append('image', file)
      const res = await fetch('https://api.imgbb.com/1/upload?key=YOUR_KEY', {
        method: 'POST',
        body: formData,
      }).catch(() => null)

      if (res?.ok) {
        const data = await res.json()
        setImageUri(data.data.url)
      } else {
        // Fall back to base64 data URI if imgbb fails
        const reader2 = new FileReader()
        reader2.onload = (e) => {
          const result = e.target?.result as string
          setImageUri(result)
        }
        reader2.readAsDataURL(file)
      }
    } catch (e) {
      setError('Image upload failed')
    } finally {
      setUploading(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleImage(file)
  }, [handleImage])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleImage(file)
  }, [handleImage])

  const handleLaunch = async () => {
    if (!isConnected) { openConnectModal?.(); return }
    if (!name.trim())   { setError('Token name is required'); return }
    if (!symbol.trim()) { setError('Ticker symbol is required'); return }
    setError('')

    writeContract({
      address: FACTORY_ADDRESS,
      abi: FACTORY_ABI,
      functionName: 'launchToken',
      value: parseEther('0.002'),
      args: [{
        name:        name.trim(),
        symbol:      symbol.trim().toUpperCase(),
        imageUri:    imageUri,
        description: description.trim(),
        website:     website.trim(),
        twitter:     twitter.trim(),
        telegram:    telegram.trim(),
      }],
    })
  }

  const loading = isPending || isConfirming || uploading

  return (
    <div style={{ padding: '2.5rem 2rem' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <span style={{ fontFamily: 'Black Ops One, cursive', fontSize: '20px', color: 'var(--cream)' }}>Go To War</span>
          <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: '10px', fontWeight: 700, color: 'var(--copper)', background: 'rgba(184,112,64,0.1)', border: '1px solid rgba(184,112,64,0.25)', padding: '2px 8px', letterSpacing: '0.12em' }}>Launch</span>
          <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg,var(--border),transparent)' }} />
        </div>

        {/* Success State */}
        {isSuccess && (
          <div style={{ background: 'rgba(58,153,72,0.15)', border: '1px solid rgba(58,153,72,0.4)', padding: '1.5rem', marginBottom: '2rem', textAlign: 'center' }}>
            <div style={{ fontFamily: 'Black Ops One, cursive', fontSize: '24px', color: '#3a9948', marginBottom: '0.5rem' }}>⚔ TOKEN DEPLOYED</div>
            <div style={{ fontFamily: 'Oswald, sans-serif', color: 'var(--grey-l)', fontSize: '14px' }}>Your token is live on Base. Dig in.</div>
            {txHash && (
              <a href={`https://basescan.org/tx/${txHash}`} target="_blank" rel="noopener noreferrer"
                style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '11px', color: 'var(--copper)', marginTop: '0.5rem', display: 'block' }}>
                View on Basescan →
              </a>
            )}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '2rem', alignItems: 'start' }}>

          {/* Left: Form */}
          <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', padding: '2rem' }}>
            <div style={{ fontFamily: 'Black Ops One, cursive', fontSize: '20px', color: 'var(--cream)', marginBottom: '4px' }}>Deploy Your Token</div>
            <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '11px', color: 'var(--grey-l)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '2rem' }}>
              Launch Fee: {GRAD_FLOW.launchFee} ETH · 1,000,000,000 Supply · Smooth Bonding Curve
            </div>

            {/* Name + Symbol */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ fontFamily: 'Oswald, sans-serif', fontSize: '11px', fontWeight: 700, color: 'var(--copper)', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Token Name</label>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Trench Wars"
                  style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--cream)', fontFamily: 'Oswald, sans-serif', fontSize: '14px', padding: '10px 12px', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontFamily: 'Oswald, sans-serif', fontSize: '11px', fontWeight: 700, color: 'var(--copper)', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Ticker Symbol</label>
                <input value={symbol} onChange={e => setSymbol(e.target.value.toUpperCase())} placeholder="e.g. WARZ"
                  style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--gold-b)', fontFamily: 'Share Tech Mono, monospace', fontSize: '14px', padding: '10px 12px', outline: 'none', boxSizing: 'border-box' }} />
              </div>
            </div>

            {/* Description */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ fontFamily: 'Oswald, sans-serif', fontSize: '11px', fontWeight: 700, color: 'var(--copper)', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Description</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Tell the trenches what this is about..."
                rows={4} style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--cream)', fontFamily: 'Oswald, sans-serif', fontSize: '14px', padding: '10px 12px', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
            </div>

            {/* Image Upload */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ fontFamily: 'Oswald, sans-serif', fontSize: '11px', fontWeight: 700, color: 'var(--copper)', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Token Image</label>
              <label
                onDrop={handleDrop}
                onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                style={{ display: 'block', border: `2px dashed ${dragOver ? 'var(--copper)' : 'var(--border)'}`, background: dragOver ? 'rgba(184,112,64,0.05)' : 'var(--bg)', padding: '2rem', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s', position: 'relative' }}>
                <input type="file" accept="image/*" onChange={handleFileInput} style={{ display: 'none' }} />
                {imagePreview ? (
                  <div>
                    <img src={imagePreview} alt="preview" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '50%', margin: '0 auto 8px', display: 'block' }} />
                    <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '12px', color: 'var(--copper)' }}>Click to change</div>
                  </div>
                ) : (
                  <div>
                    <div style={{ fontSize: '32px', marginBottom: '8px' }}>🪖</div>
                    <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '13px', color: 'var(--grey-l)' }}>
                      {uploading ? 'Uploading...' : 'Drop image here or click to upload'}
                    </div>
                  </div>
                )}
              </label>
            </div>

            {/* Social Links */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ fontFamily: 'Oswald, sans-serif', fontSize: '11px', fontWeight: 700, color: 'var(--copper)', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Twitter / X</label>
                <input value={twitter} onChange={e => setTwitter(e.target.value)} placeholder="@handle"
                  style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--cream)', fontFamily: 'Oswald, sans-serif', fontSize: '14px', padding: '10px 12px', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontFamily: 'Oswald, sans-serif', fontSize: '11px', fontWeight: 700, color: 'var(--copper)', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Telegram</label>
                <input value={telegram} onChange={e => setTelegram(e.target.value)} placeholder="t.me/..."
                  style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--cream)', fontFamily: 'Oswald, sans-serif', fontSize: '14px', padding: '10px 12px', outline: 'none', boxSizing: 'border-box' }} />
              </div>
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ fontFamily: 'Oswald, sans-serif', fontSize: '11px', fontWeight: 700, color: 'var(--copper)', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Website</label>
              <input value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://..."
                style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--cream)', fontFamily: 'Oswald, sans-serif', fontSize: '14px', padding: '10px 12px', outline: 'none', boxSizing: 'border-box' }} />
            </div>

            {/* Launch Fee */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(184,112,64,0.06)', border: '1px solid rgba(184,112,64,0.2)', padding: '1rem 1.25rem', marginBottom: '1.5rem' }}>
              <div>
                <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '12px', fontWeight: 700, color: 'var(--copper)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Launch Fee</div>
                <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '11px', color: 'var(--grey-l)', marginTop: '2px' }}>One-time deployment cost</div>
              </div>
              <div style={{ fontFamily: 'Black Ops One, cursive', fontSize: '20px', color: 'var(--copper-l)' }}>
                {GRAD_FLOW.launchFee} <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '12px', color: 'var(--copper)' }}>ETH</span>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{ background: 'rgba(255,51,17,0.1)', border: '1px solid rgba(255,51,17,0.3)', padding: '0.75rem 1rem', marginBottom: '1rem', fontFamily: 'Oswald, sans-serif', fontSize: '13px', color: 'var(--red-b)' }}>
                {error}
              </div>
            )}

            {/* Deploy Button */}
            <button
              onClick={handleLaunch}
              disabled={loading}
              className="btn-clip"
              style={{ width: '100%', padding: '1rem', fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: '16px', color: '#fff', background: loading ? 'rgba(255,51,17,0.4)' : 'linear-gradient(135deg,var(--red),var(--red-b))', border: 'none', letterSpacing: '0.15em', cursor: loading ? 'not-allowed' : 'crosshair', textTransform: 'uppercase' }}>
              {!isConnected ? '⚔ CONNECT WALLET TO DEPLOY' : isPending ? '⏳ CONFIRM IN WALLET...' : isConfirming ? '⏳ DEPLOYING ON CHAIN...' : '⚔ DEPLOY TOKEN'}
            </button>
          </div>

          {/* Right: Preview */}
          <div style={{ position: 'sticky', top: '80px' }}>
            {/* Token Preview */}
            <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', padding: '1.25rem', marginBottom: '1rem' }}>
              <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '10px', fontWeight: 700, color: 'var(--copper)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '1rem' }}>Token Preview</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--bg)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  {imagePreview ? <img src={imagePreview} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: '20px' }}>🪖</span>}
                </div>
                <div>
                  <div style={{ fontFamily: 'Black Ops One, cursive', fontSize: '16px', color: 'var(--gold-b)' }}>${symbol || 'TICKER'}</div>
                  <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '12px', color: 'var(--grey-l)' }}>{name || 'Token Name'}</div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                {[['Supply', '1,000,000,000'], ['Start Mcap', '~$3,000'], ['Curve Target', '3 ETH'], ['Grad LP', '2.5 ETH']].map(([label, value]) => (
                  <div key={label} style={{ background: 'var(--bg)', border: '1px solid var(--border)', padding: '0.5rem 0.75rem' }}>
                    <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '9px', color: 'var(--grey)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{label}</div>
                    <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '13px', color: 'var(--cream)', marginTop: '2px' }}>{value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bonding Curve */}
            <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', padding: '1.25rem', marginBottom: '1rem' }}>
              <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '10px', fontWeight: 700, color: 'var(--copper)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Bonding Curve</div>
              <svg viewBox="0 0 240 100" style={{ width: '100%', height: '80px' }}>
                <defs><linearGradient id="curveGrad" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#b87040"/><stop offset="100%" stopColor="#f0b020"/></linearGradient></defs>
                <path d="M10,90 Q60,85 90,70 Q130,50 160,30 Q190,15 230,10" fill="none" stroke="url(#curveGrad)" strokeWidth="2.5"/>
                <text x="120" y="60" fill="#b87040" fontSize="9" fontFamily="Oswald">Early = best price</text>
                <text x="10" y="98" fill="#666" fontSize="8" fontFamily="Share Tech Mono">0</text>
                <text x="210" y="98" fill="#666" fontSize="8" fontFamily="Share Tech Mono">3 ETH</text>
              </svg>
            </div>

            {/* Fee Flow */}
            <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', padding: '1.25rem' }}>
              <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '10px', fontWeight: 700, color: 'var(--copper)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Fee Flow at Graduation</div>
              {[
                ['→ Uniswap V3 LP', '2.5 ETH + 200M tokens'],
                ['→ Your wallet', '0.25 ETH'],
                ['→ Platform', '0.25 ETH'],
                ['Buy fee (2%)', '1% you – 1% platform'],
                ['Sell fee (2%)', '1% platform – 1% Armory'],
              ].map(([label, value]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: '11px', color: 'var(--grey-l)' }}>{label}</span>
                  <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '11px', color: 'var(--copper)' }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
