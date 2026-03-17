'use client'
import { useState, useEffect } from 'react'
import type { FeedEvent, FeedEventType } from '../lib/types'

const TYPE_STYLES: Record<FeedEventType, { color: string; label: string }> = {
  buy:      { color: 'var(--green)',   label: 'BUY' },
  sell:     { color: 'var(--red-b)',   label: 'SELL' },
  breakout: { color: 'var(--gold-b)', label: 'BROKE OUT' },
  raid:     { color: 'var(--red-b)',   label: 'RAID' },
  chest:    { color: 'var(--gold-b)', label: 'WAR CHEST' },
  crown:    { color: 'var(--copper)', label: 'CROWN' },
}

const TYPE_ICONS: Record<FeedEventType, string> = {
  buy: '▲', sell: '▼', breakout: '🎖', raid: '⚔', chest: '⚡', crown: '♟',
}

const MOCK_EVENTS: FeedEvent[] = [
  { id:'1', type:'buy',      tokenSymbol:'MOLTOV', tokenAddress:'0x0', description:'0x9f2...44a bought 18,400 tokens for 0.12 ETH', ethAmount:0.12,  timestamp: Date.now()-12000 },
  { id:'2', type:'raid',     tokenSymbol:'MOLTOV', tokenAddress:'0x0', description:'Raid Active — 9 buys in 90 seconds · momentum building', timestamp: Date.now()-28000 },
  { id:'3', type:'breakout', tokenSymbol:'DRILLZ', tokenAddress:'0x0', description:'3 ETH bonded · Creator +0.25 ETH · Platform +0.25 ETH · LP deployed', timestamp: Date.now()-840000 },
  { id:'4', type:'chest',    tokenSymbol:'DRILLZ', tokenAddress:'0x0', description:'1.74 ETH awarded — 50% liq boost · 30% random buyers · 20% last buyer', timestamp: Date.now()-840000 },
  { id:'5', type:'sell',     tokenSymbol:'WARZ',   tokenAddress:'0x0', description:'0x7c5...d2b sold 50,000 tokens for 0.04 ETH', ethAmount:0.04, timestamp: Date.now()-1320000 },
  { id:'6', type:'crown',    tokenSymbol:'SURGE',  tokenAddress:'0x0', description:'New top holder — 0x1b3...9ea holds 2.4% of supply', timestamp: Date.now()-2040000 },
  { id:'7', type:'buy',      tokenSymbol:'TRENCH', tokenAddress:'0x0', description:'0x3b7...c21 bought 8,000 tokens for 0.06 ETH', ethAmount:0.06, timestamp: Date.now()-2460000 },
  { id:'8', type:'raid',     tokenSymbol:'SURGE',  tokenAddress:'0x0', description:'Raid Successful — 1.2 ETH volume spike in 3 minutes', timestamp: Date.now()-3600000 },
]

function timeAgo(ts: number): string {
  const s = Math.floor((Date.now() - ts) / 1000)
  if (s < 60) return `${s}s ago`
  if (s < 3600) return `${Math.floor(s/60)}m ago`
  return `${Math.floor(s/3600)}h ago`
}

// TODO: Replace with real WebSocket hook
// import { useFeed } from '@/hooks/useFeed'

interface Props {
  compact?: boolean
  maxRows?: number
}

export function CombatLog({ compact = false, maxRows = 8 }: Props) {
  const [events, setEvents] = useState<FeedEvent[]>(MOCK_EVENTS)

  // Simulate live feed — replace with WebSocket in production
  useEffect(() => {
    const liveEvents: FeedEvent[] = [
      { id:'live1', type:'buy',  tokenSymbol:'MOLTOV', tokenAddress:'0x0', description:'0x4f2...11b bought 22,000 tokens · 0.15 ETH', ethAmount:0.15, timestamp:0 },
      { id:'live2', type:'sell', tokenSymbol:'APEWAR', tokenAddress:'0x0', description:'0x8b1...3c2 sold 12,000 tokens · 0.09 ETH', ethAmount:0.09, timestamp:0 },
      { id:'live3', type:'raid', tokenSymbol:'SURGE',  tokenAddress:'0x0', description:'Raid Started — 5 buys in 60 seconds', timestamp:0 },
      { id:'live4', type:'buy',  tokenSymbol:'TRENCH', tokenAddress:'0x0', description:'0x3b7...c21 bought 8,000 tokens · 0.06 ETH', ethAmount:0.06, timestamp:0 },
    ]
    let i = 0
    const interval = setInterval(() => {
      const ev = { ...liveEvents[i % liveEvents.length], id: `live-${Date.now()}`, timestamp: Date.now() }
      setEvents(prev => [ev, ...prev].slice(0, maxRows + 4))
      i++
    }, 4500)
    return () => clearInterval(interval)
  }, [maxRows])

  return (
    <div style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}>
      {events.slice(0, maxRows).map((ev, idx) => {
        const style = TYPE_STYLES[ev.type]
        const isNew = idx === 0 && Date.now() - ev.timestamp < 1000
        return (
          <div
            key={ev.id}
            style={{
              display: 'flex', alignItems: 'center', gap: '1rem',
              padding: compact ? '0.5rem 1rem' : '0.6rem 1rem',
              borderBottom: '1px solid rgba(184,112,64,0.06)',
              background: isNew ? 'rgba(184,112,64,0.06)' : 'transparent',
              transition: 'background 0.8s',
            }}
          >
            <div style={{ width: '20px', flexShrink: 0, textAlign: 'center', fontSize: '12px' }}>
              {TYPE_ICONS[ev.type]}
            </div>
            <div style={{
              fontFamily: 'Oswald, sans-serif', fontSize: '11px', fontWeight: 700,
              letterSpacing: '0.1em', textTransform: 'uppercase',
              color: style.color, flexShrink: 0, width: compact ? '70px' : '85px',
            }}>
              {style.label}
            </div>
            <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '12px', color: 'var(--cream)', flexShrink: 0, width: '75px' }}>
              ${ev.tokenSymbol}
            </div>
            {!compact && (
              <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '11px', color: 'var(--grey-l)', flex: 1 }}>
                {ev.description}
              </div>
            )}
            {compact && (
              <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '11px', color: 'var(--grey-l)', flex: 1 }}>
                {ev.ethAmount ? `${ev.ethAmount} ETH` : ev.description.split('—')[0].trim()}
              </div>
            )}
            <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '10px', color: 'var(--grey)', flexShrink: 0 }}>
              {timeAgo(ev.timestamp)}
            </div>
          </div>
        )
      })}
    </div>
  )
}
