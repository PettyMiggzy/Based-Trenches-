'use client'
import { useState } from 'react'
import { GRAD_FLOW } from '../../lib/types'

export default function LaunchPage() {
  const [name, setName] = useState('')
  const [symbol, setSymbol] = useState('')

  return (
    <div style={{ padding: '2.5rem 2rem' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <span style={{ fontFamily: 'Black Ops One, cursive', fontSize: '20px', color: 'var(--cream)' }}>Go To War</span>
          <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: '10px', fontWeight: 700, color: 'var(--copper)', background: 'rgba(184,112,64,0.1)', border: '1px solid rgba(184,112,64,0.25)', padding: '2px 8px', letterSpacing: '0.12em' }}>Launch</span>
          <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg,var(--border),transparent)' }} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '2rem', alignItems: 'start' }}>

          {/* ── FORM ── */}
          <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', padding: '2rem' }}>
            <div style={{ fontFamily: 'Black Ops One, cursive', fontSize: '22px', color: 'var(--cream)', marginBottom: '0.5rem' }}>Deploy Your Token</div>
            <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '11px', color: 'var(--grey-l)', letterSpacing: '0.1em', marginBottom: '2rem' }}>
              LAUNCH FEE: {GRAD_FLOW.launchFee} ETH · {GRAD_FLOW.totalSupply.toLocaleString()} SUPPLY · SMOOTH BONDING CURVE
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <label style={{ fontFamily: 'Oswald, sans-serif', fontSize: '12px', fontWeight: 700, color: 'var(--copper)', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Token Name</label>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Trench Wars" style={{ width: '100%', background: 'rgba(184,112,64,0.04)', border: '1px solid var(--border)', color: 'var(--cream)', fontFamily: 'Barlow Condensed, sans-serif', fontSize: '15px', padding: '0.7rem 1rem', outline: 'none' }} />
              </div>
              <div>
                <label style={{ fontFamily: 'Oswald, sans-serif', fontSize: '12px', fontWeight: 700, color: 'var(--copper)', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Ticker Symbol</label>
                <input value={symbol} onChange={e => setSymbol(e.target.value.toUpperCase())} placeholder="e.g. WARZ" maxLength={10} style={{ width: '100%', background: 'rgba(184,112,64,0.04)', border: '1px solid var(--border)', color: 'var(--cream)', fontFamily: 'Black Ops One, cursive', fontSize: '15px', padding: '0.7rem 1rem', outline: 'none' }} />
              </div>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ fontFamily: 'Oswald, sans-serif', fontSize: '12px', fontWeight: 700, color: 'var(--copper)', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Description</label>
              <textarea placeholder="Tell the trenches what this is about..." rows={3} style={{ width: '100%', background: 'rgba(184,112,64,0.04)', border: '1px solid var(--border)', color: 'var(--cream)', fontFamily: 'Barlow Condensed, sans-serif', fontSize: '15px', padding: '0.7rem 1rem', outline: 'none', resize: 'vertical' }} />
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ fontFamily: 'Oswald, sans-serif', fontSize: '12px', fontWeight: 700, color: 'var(--copper)', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Token Image</label>
              <div style={{ border: '1px dashed rgba(184,112,64,0.3)', background: 'rgba(184,112,64,0.03)', padding: '2rem', textAlign: 'center', cursor: 'crosshair' }}>
                <div style={{ fontSize: '32px', marginBottom: '0.5rem' }}>🪖</div>
                <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '13px', color: 'var(--grey-l)' }}>Drop image here or click to upload</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
              {[['Twitter / X','@handle'],['Telegram','t.me/...']].map(([label, ph]) => (
                <div key={label}>
                  <label style={{ fontFamily: 'Oswald, sans-serif', fontSize: '12px', fontWeight: 700, color: 'var(--copper)', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>{label}</label>
                  <input placeholder={ph} style={{ width: '100%', background: 'rgba(184,112,64,0.04)', border: '1px solid var(--border)', color: 'var(--cream)', fontFamily: 'Barlow Condensed, sans-serif', fontSize: '15px', padding: '0.7rem 1rem', outline: 'none' }} />
                </div>
              ))}
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ fontFamily: 'Oswald, sans-serif', fontSize: '12px', fontWeight: 700, color: 'var(--copper)', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Website</label>
              <input placeholder="https://..." style={{ width: '100%', background: 'rgba(184,112,64,0.04)', border: '1px solid var(--border)', color: 'var(--cream)', fontFamily: 'Barlow Condensed, sans-serif', fontSize: '15px', padding: '0.7rem 1rem', outline: 'none' }} />
            </div>

            {/* Fee box */}
            <div style={{ background: 'rgba(184,112,64,0.06)', border: '1px solid rgba(184,112,64,0.2)', padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '12px', fontWeight: 700, color: 'var(--copper)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Launch Fee</div>
                <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '11px', color: 'var(--grey-l)', marginTop: '2px' }}>One-time deployment cost</div>
              </div>
              <div style={{ fontFamily: 'Black Ops One, cursive', fontSize: '20px', color: 'var(--copper-l)' }}>
                {GRAD_FLOW.launchFee} <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '12px', color: 'var(--copper)' }}>ETH</span>
              </div>
            </div>

            <button className="btn-clip" style={{ width: '100%', padding: '1rem', fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: '16px', color: '#fff', background: 'linear-gradient(135deg,var(--red),var(--red-b))', border: 'none', letterSpacing: '0.15em', cursor: 'crosshair', textTransform: 'uppercase' }}>
              ⚔ DEPLOY TOKEN
            </button>
          </div>

          {/* ── PREVIEW ── */}
          <div style={{ position: 'sticky', top: '72px' }}>
            {/* Token preview card */}
            <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', padding: '1.5rem', marginBottom: '1rem' }}>
              <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '11px', fontWeight: 700, color: 'var(--copper)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '1rem' }}>Token Preview</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ width: '52px', height: '52px', background: 'rgba(184,112,64,0.1)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>🪖</div>
                <div>
                  <div style={{ fontFamily: 'Black Ops One, cursive', fontSize: '18px', color: 'var(--cream)' }}>${symbol || 'TICKER'}</div>
                  <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: '13px', color: 'var(--grey-l)' }}>{name || 'Token Name'}</div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                {[
                  ['Supply', '1,000,000,000'],
                  ['Start MCap', '~$3,000'],
                  ['Curve Target', '3 ETH'],
                  ['Grad LP', '2.5 ETH'],
                ].map(([l,v]) => (
                  <div key={l} style={{ background: 'rgba(184,112,64,0.04)', border: '1px solid var(--border)', padding: '0.6rem 0.75rem' }}>
                    <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '9px', color: 'var(--grey)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{l}</div>
                    <div style={{ fontFamily: 'Black Ops One, cursive', fontSize: '15px', color: 'var(--copper-l)' }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bonding curve SVG */}
            <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', padding: '1.5rem', marginBottom: '1rem' }}>
              <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '11px', fontWeight: 700, color: 'var(--copper)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '1rem' }}>Bonding Curve</div>
              <svg width="100%" viewBox="0 0 320 140" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#b87040" stopOpacity="0.3"/>
                    <stop offset="100%" stopColor="#b87040" stopOpacity="0.02"/>
                  </linearGradient>
                </defs>
                <path d="M 20 120 Q 80 115 120 90 Q 180 55 220 30 L 300 20 L 300 130 L 20 130 Z" fill="url(#cg)"/>
                <path d="M 20 120 Q 80 115 120 90 Q 180 55 220 30 L 300 20" fill="none" stroke="#b87040" strokeWidth="2"/>
                <line x1="20" y1="10" x2="20" y2="130" stroke="rgba(184,112,64,0.2)" strokeWidth="1"/>
                <line x1="20" y1="130" x2="310" y2="130" stroke="rgba(184,112,64,0.2)" strokeWidth="1"/>
                <text x="22" y="142" fill="#8a8070" fontSize="8" fontFamily="monospace">0</text>
                <text x="270" y="142" fill="#8a8070" fontSize="8" fontFamily="monospace">3 ETH</text>
                <text x="140" y="72" fill="#d4956a" fontSize="9" fontFamily="monospace">Early = best price</text>
              </svg>
            </div>

            {/* Grad flow */}
            <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', padding: '1.25rem' }}>
              <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '11px', fontWeight: 700, color: 'var(--copper)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Fee Flow At Graduation</div>
              {[
                ['→ Uniswap V3 LP', '2.5 ETH + 200M tokens', 'var(--gold-b)'],
                ['→ Your wallet',    '0.25 ETH',              'var(--green)'],
                ['→ Platform',       '0.25 ETH',              'var(--copper)'],
                ['Buy fee (2%)',     '1% you · 1% platform',  'var(--cream)'],
                ['Sell fee (2%)',    '1% platform · 1% Armory','var(--cream)'],
              ].map(([l,v,c]) => (
                <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid rgba(184,112,64,0.06)' }}>
                  <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '11px', color: 'var(--grey-l)' }}>{l}</span>
                  <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '11px', color: c }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
