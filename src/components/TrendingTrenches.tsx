'use client'
import { useState } from 'react'
import { TokenCard } from './TokenCard'
import type { Token } from '../lib/types'

const FILTERS = ['Trending', 'New', 'Raids', 'Hot', 'Near Breakout']

// TODO: fetch from indexer API with filter param
const MOCK_TOKENS: Token[] = [
  { address:'0x01', name:'War Zone',         symbol:'WARZ',   emoji:'🔥', creator:'0x1b39ea000000', bondedEth:2.13, bondTarget:3, bondPercent:71, marketCap:8940,  volume24h:0.6,  priceEth:0, graduated:false, isRaiding:true,  badge:'raid',     armoryBalance:0.36, launchedAt:0 },
  { address:'0x02', name:'Ape War',          symbol:'APEWAR', emoji:'🐒', creator:'0x7c5d2b000000', bondedEth:1.65, bondTarget:3, bondPercent:55, marketCap:6220,  volume24h:0.3,  priceEth:0, graduated:false, isRaiding:false, badge:'hot',      armoryBalance:0.12, launchedAt:0 },
  { address:'0x03', name:'Bunker Protocol',  symbol:'BUNKER', emoji:'💣', creator:'0x4a1bc0000000', bondedEth:1.14, bondTarget:3, bondPercent:38, marketCap:4180,  volume24h:0.2,  priceEth:0, graduated:false, isRaiding:false, badge:'trending', armoryBalance:0.08, launchedAt:0 },
  { address:'0x04', name:'Sapper Finance',   symbol:'SAPPER', emoji:'🎖', creator:'0x2a83f9000000', bondedEth:0.36, bondTarget:3, bondPercent:12, marketCap:3480,  volume24h:0.04, priceEth:0, graduated:false, isRaiding:false, badge:'new',      armoryBalance:0.01, launchedAt:0 },
  { address:'0x05', name:'Recon DAO',        symbol:'RECON',  emoji:'🪖', creator:'0x8e6262000000', bondedEth:1.86, bondTarget:3, bondPercent:62, marketCap:7040,  volume24h:0.22, priceEth:0, graduated:false, isRaiding:false, badge:'trending', armoryBalance:0.19, launchedAt:0 },
  { address:'0x06', name:'Tactiq',           symbol:'TACTIQ', emoji:'🔫', creator:'0x6d911f000000', bondedEth:1.38, bondTarget:3, bondPercent:46, marketCap:5310,  volume24h:0.17, priceEth:0, graduated:false, isRaiding:false, badge:'hot',      armoryBalance:0.10, launchedAt:0 },
  { address:'0x07', name:'Flank Attack',     symbol:'FLANK',  emoji:'🏴', creator:'0x3c27a4000000', bondedEth:0.21, bondTarget:3, bondPercent:7,  marketCap:3210,  volume24h:0.02, priceEth:0, graduated:false, isRaiding:false, badge:'new',      armoryBalance:0,    launchedAt:0 },
  { address:'0x08', name:'Surge Protocol',   symbol:'SURGE',  emoji:'⚡', creator:'0x5f18b2000000', bondedEth:2.40, bondTarget:3, bondPercent:80, marketCap:9800,  volume24h:0.55, priceEth:0, graduated:false, isRaiding:true,  badge:'raid',     armoryBalance:0.28, launchedAt:0 },
]

export function TrendingTrenches() {
  const [activeFilter, setActiveFilter] = useState('Trending')

  // TODO: filter tokens from API based on activeFilter
  const filtered = MOCK_TOKENS.filter(t => {
    if (activeFilter === 'Raids') return t.isRaiding
    if (activeFilter === 'Hot') return t.badge === 'hot'
    if (activeFilter === 'New') return t.badge === 'new'
    if (activeFilter === 'Near Breakout') return t.bondPercent >= 70
    return true
  })

  return (
    <section style={{ padding: '0 2rem 2.5rem' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <span style={{ fontFamily: 'Black Ops One, cursive', fontSize: '20px', color: 'var(--cream)', letterSpacing: '0.04em' }}>Trending Trenches</span>
          <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg,var(--border),transparent)' }} />
          <button style={{ fontFamily: 'Oswald, sans-serif', fontSize: '12px', fontWeight: 600, color: 'var(--copper)', background: 'none', border: 'none', cursor: 'crosshair', letterSpacing: '0.08em', textTransform: 'uppercase' }}>View All →</button>
        </div>

        {/* Filter tabs */}
        <div style={{ display: 'flex', marginBottom: '1.5rem', border: '1px solid var(--border)', width: 'fit-content', overflow: 'hidden' }}>
          {FILTERS.map((f, i) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              style={{
                fontFamily: 'Oswald, sans-serif', fontSize: '12px', fontWeight: 600,
                color: activeFilter === f ? 'var(--copper)' : 'var(--grey-l)',
                background: activeFilter === f ? 'rgba(184,112,64,0.12)' : 'transparent',
                border: 'none',
                borderRight: i < FILTERS.length - 1 ? '1px solid var(--border)' : 'none',
                padding: '0.5rem 1rem', cursor: 'crosshair',
                letterSpacing: '0.08em', textTransform: 'uppercase',
                transition: 'all 0.2s',
              }}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem' }}>
          {filtered.map(token => (
            <TokenCard key={token.address} token={token} />
          ))}
        </div>
      </div>
    </section>
  )
}
