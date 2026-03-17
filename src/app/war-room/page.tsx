import { CombatLog } from '../../components/CombatLog'

export default function WarRoomPage() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', minHeight: 'calc(100vh - 56px)' }}>

      {/* ── MAIN ── */}
      <div style={{ padding: '1.5rem 2rem', borderRight: '1px solid var(--border)' }}>

        {/* War Chest Hero */}
        <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', padding: '2rem', marginBottom: '1.5rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div className="stripe-overlay" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '11px', fontWeight: 700, color: 'var(--gold)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>⚡ War Chest — Global Jackpot</div>
            <div className="animate-logo-glow" style={{ fontFamily: 'Black Ops One, cursive', fontSize: '56px', color: 'var(--gold-b)', lineHeight: 1 }}>1.74 ETH</div>
            <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '12px', color: 'var(--gold)', marginTop: '0.5rem', marginBottom: '1.5rem' }}>ACTIVE · NEXT BREAKOUT WINS UP TO 2 ETH</div>
            <div style={{ maxWidth: '400px', margin: '0 auto 1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontFamily: 'Black Ops One, cursive', fontSize: '14px', color: 'var(--gold-b)' }}>1.74 / 2 ETH MAX</span>
              </div>
              <div style={{ height: '10px', background: 'rgba(200,144,10,0.08)', border: '1px solid rgba(200,144,10,0.15)', position: 'relative' }}>
                <div style={{ height: '100%', width: '87%', background: 'linear-gradient(90deg,var(--gold),var(--gold-b))', position: 'relative' }}>
                  <div style={{ position: 'absolute', right: '-2px', top: '-3px', bottom: '-3px', width: '4px', background: 'white', boxShadow: '0 0 8px 3px rgba(255,255,255,0.7)', borderRadius: '2px' }} />
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              {[['50%','Liquidity Boost'],['30%','Random Buyers'],['20%','Last Buyer']].map(([p,l]) => (
                <div key={l} style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '11px', padding: '5px 12px', border: '1px solid rgba(200,144,10,0.25)', background: 'rgba(200,144,10,0.06)', color: 'var(--gold)' }}>
                  <strong style={{ color: 'var(--gold-b)' }}>{p}</strong> {l}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Active Raids */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <span style={{ fontFamily: 'Black Ops One, cursive', fontSize: '18px', color: 'var(--cream)' }}>Active Raids</span>
          <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: '10px', fontWeight: 700, color: 'var(--copper)', background: 'rgba(184,112,64,0.1)', border: '1px solid rgba(184,112,64,0.25)', padding: '2px 8px' }}>Live</span>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--red-b)', boxShadow: '0 0 6px var(--red-b)' }} className="animate-blink" />
          <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg,var(--border),transparent)' }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
          {[
            { sym:'💀 $MOLTOV', state:'⚔ RAID ACTIVE', pct:94, buys:9, time:'90s', vol:'+0.8 ETH', bond:'94.2%' },
            { sym:'⚡ $SURGE',  state:'RAID STARTED',  pct:80, buys:5, time:'45s', vol:'+0.3 ETH', bond:'80%' },
          ].map(r => (
            <div key={r.sym} style={{ background: 'var(--panel)', border: '1px solid rgba(204,34,0,0.3)', padding: '1.25rem', position: 'relative', overflow: 'hidden' }}>
              <div className="animate-crit-glow" style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg,var(--red),var(--red-b))' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <div style={{ fontFamily: 'Black Ops One, cursive', fontSize: '18px', color: 'var(--cream)' }}>{r.sym}</div>
                <div className="animate-pulse-red" style={{ fontFamily: 'Oswald, sans-serif', fontSize: '10px', fontWeight: 700, color: 'var(--red-b)', background: 'rgba(204,34,0,0.1)', border: '1px solid rgba(204,34,0,0.3)', padding: '3px 8px', letterSpacing: '0.12em' }}>{r.state}</div>
              </div>
              <div style={{ height: '8px', background: 'rgba(204,34,0,0.08)', border: '1px solid rgba(204,34,0,0.15)', marginBottom: '0.5rem', position: 'relative' }}>
                <div style={{ height: '100%', width: `${r.pct}%`, background: 'linear-gradient(90deg,var(--red),var(--gold-b))' }} />
              </div>
              <div style={{ display: 'flex', gap: '1.5rem' }}>
                {[[`${r.buys}`, 'buys'],[`in ${r.time}`, 'window'],[r.vol, 'volume'],[r.bond, 'bonded']].map(([v,l]) => (
                  <div key={l}>
                    <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '11px', color: 'var(--cream)' }}>{v}</div>
                    <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '9px', color: 'var(--grey)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Recent Breakouts */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <span style={{ fontFamily: 'Black Ops One, cursive', fontSize: '18px', color: 'var(--cream)' }}>Recent Breakouts</span>
          <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg,var(--border),transparent)' }} />
        </div>
        {[
          { sym:'$DRILLZ', detail:'3 ETH bonded · Creator +0.25 ETH · LP deployed', time:'14m ago' },
          { sym:'$TOSHI',  detail:'3 ETH bonded · Creator +0.25 ETH · LP deployed', time:'2h ago' },
          { sym:'$DEGEN',  detail:'3 ETH bonded · War Chest awarded 1.4 ETH',       time:'6h ago' },
        ].map(b => (
          <div key={b.sym} style={{ background: 'var(--panel)', border: '1px solid rgba(240,176,32,0.2)', padding: '1rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '10px', fontWeight: 700, color: '#060504', background: 'var(--gold-b)', padding: '3px 8px', letterSpacing: '0.1em', flexShrink: 0 }}>🎖 BROKE OUT</div>
            <div style={{ fontFamily: 'Black Ops One, cursive', fontSize: '16px', color: 'var(--cream)', flex: 1 }}>{b.sym}</div>
            <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '11px', color: 'var(--grey-l)' }}>{b.detail}</div>
            <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '10px', color: 'var(--grey)', flexShrink: 0 }}>{b.time}</div>
          </div>
        ))}
      </div>

      {/* ── SIDEBAR ── */}
      <div style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <span style={{ fontFamily: 'Black Ops One, cursive', fontSize: '18px', color: 'var(--cream)' }}>Combat Log</span>
          <div className="animate-blink" style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--red-b)', boxShadow: '0 0 6px var(--red-b)' }} />
        </div>
        <CombatLog compact maxRows={10} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1.5rem 0 1rem' }}>
          <span style={{ fontFamily: 'Black Ops One, cursive', fontSize: '18px', color: 'var(--cream)' }}>Whale Alerts</span>
          <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg,var(--border),transparent)' }} />
        </div>
        <div style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}>
          {[
            { tok:'$WARZ — 0x1b3...9ea',   desc:'Single buy · bonding surge',     amt:'+0.6 ETH',  pos:true },
            { tok:'$SURGE — 0x5f1...8b2',  desc:'Single buy · raid triggered',    amt:'+0.55 ETH', pos:true },
            { tok:'$MOLTOV — 0x9f2...44a', desc:'Multiple buys · 94% bonded',     amt:'-0.21 ETH', pos:false },
          ].map(w => (
            <div key={w.tok} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem 1rem', borderBottom: '1px solid rgba(184,112,64,0.06)' }}>
              <div style={{ fontSize: '20px', flexShrink: 0 }}>🐋</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '12px', color: 'var(--cream)' }}>{w.tok}</div>
                <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '10px', color: 'var(--grey-l)' }}>{w.desc}</div>
              </div>
              <div style={{ fontFamily: 'Black Ops One, cursive', fontSize: '16px', color: w.pos ? 'var(--green)' : 'var(--red-b)' }}>{w.amt}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
