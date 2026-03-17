const ITEMS = [
  { type:'buy',    text:'▲ 0x8e3...2f bought 12,400 $PEPE · +0.08 ETH' },
  { type:'broke',  text:'🎖 $DEGEN BROKE OUT · 3 ETH reached · War Chest awarded' },
  { type:'raid',   text:'⚔ RAID ACTIVE — $MOLTOV · 8 buys in 60s' },
  { type:'sell',   text:'▼ 0x4a1...bc sold 50,000 $BORK · -0.04 ETH' },
  { type:'buy',    text:'▲ 0x9f2...44 bought 8,200 $COPE · +0.05 ETH' },
  { type:'broke',  text:'🎖 $TOSHI BROKE OUT · Creator +0.25 ETH · LP deployed' },
  { type:'buy',    text:'▲ WHALE — 0x1b3...9e bought 100,000 $WARZ · +0.6 ETH' },
  { type:'raid',   text:'⚔ RAID SUCCESSFUL — $DRILLZ · +1.2 ETH surge' },
  { type:'sell',   text:'▼ 0x7c5...d2 sold 22,000 $REKT · -0.11 ETH' },
  { type:'buy',    text:'▲ 0x2a8...3f bought 5,000 $TRENCH · +0.03 ETH' },
]

const COLOR: Record<string, string> = {
  buy:   'var(--green)',
  sell:  'var(--red-b)',
  broke: 'var(--gold-b)',
  raid:  'var(--red-b)',
}

export function TickerTape() {
  const doubled = [...ITEMS, ...ITEMS] // duplicate for seamless loop

  return (
    <div style={{
      background: 'rgba(0,0,0,0.6)',
      borderTop: '1px solid var(--border)',
      borderBottom: '1px solid var(--border)',
      overflow: 'hidden', padding: '0.6rem 0', position: 'relative',
    }}>
      {/* Edge fades */}
      <div style={{ position:'absolute',top:0,left:0,bottom:0,width:'80px',background:'linear-gradient(90deg,rgba(6,5,4,1),transparent)',zIndex:2,pointerEvents:'none' }} />
      <div style={{ position:'absolute',top:0,right:0,bottom:0,width:'80px',background:'linear-gradient(270deg,rgba(6,5,4,1),transparent)',zIndex:2,pointerEvents:'none' }} />

      <div className="animate-ticker" style={{ display:'flex', whiteSpace:'nowrap' }}>
        {doubled.map((item, i) => (
          <span
            key={i}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              padding: '0 2rem',
              fontFamily: 'Share Tech Mono, monospace', fontSize: '12px',
              color: COLOR[item.type] ?? 'var(--grey-l)',
              borderRight: '1px solid var(--border)',
            }}
          >
            {item.text}
          </span>
        ))}
      </div>
    </div>
  )
}
