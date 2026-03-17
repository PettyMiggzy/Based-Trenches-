'use client'
import { useState } from 'react'

const NAV_ITEMS = ['Overview','My Tokens','Deployed','Fortify Pools','Armory Controls','Creator Rewards','Settings']

export default function HQPage() {
  const [activeNav, setActiveNav] = useState('Overview')

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', minHeight: 'calc(100vh - 56px)' }}>

      {/* ── SIDEBAR ── */}
      <div style={{ background: 'var(--panel)', borderRight: '1px solid var(--border)', padding: '1.5rem' }}>
        <div style={{ background: 'rgba(184,112,64,0.06)', border: '1px solid rgba(184,112,64,0.2)', padding: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '11px', color: 'var(--copper)', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>0x8e6D...1262</div>
          <div style={{ fontFamily: 'Black Ops One, cursive', fontSize: '22px', color: 'var(--cream)' }}>
            2.48 <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '12px', color: 'var(--copper)' }}>ETH</span>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {NAV_ITEMS.map(item => (
            <button
              key={item}
              onClick={() => setActiveNav(item)}
              style={{
                fontFamily: 'Oswald, sans-serif', fontSize: '13px', fontWeight: 600,
                color: activeNav === item ? 'var(--cream)' : 'var(--grey-l)',
                background: activeNav === item ? 'rgba(184,112,64,0.08)' : 'none',
                border: 'none',
                borderLeft: activeNav === item ? '2px solid var(--copper)' : '2px solid transparent',
                padding: '0.65rem 0.75rem',
                cursor: 'crosshair', letterSpacing: '0.06em', textTransform: 'uppercase',
                textAlign: 'left', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '0.75rem',
              }}
            >
              {item}
              {(item === 'My Tokens') && <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '9px', color: 'var(--copper)', background: 'rgba(184,112,64,0.12)', border: '1px solid rgba(184,112,64,0.2)', padding: '1px 5px', marginLeft: 'auto' }}>3</span>}
              {(item === 'Deployed') && <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '9px', color: 'var(--copper)', background: 'rgba(184,112,64,0.12)', border: '1px solid rgba(184,112,64,0.2)', padding: '1px 5px', marginLeft: 'auto' }}>2</span>}
            </button>
          ))}
        </div>
      </div>

      {/* ── MAIN ── */}
      <div style={{ padding: '2rem' }}>

        {/* Overview stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1px', background: 'var(--border)', border: '1px solid var(--border)', marginBottom: '2rem' }}>
          {[
            { v:'2', u:' tokens', l:'Deployed' },
            { v:'0.48', u:' ETH', l:'Creator Fees Earned' },
            { v:'$4,240', u:'', l:'Portfolio Value' },
            { v:'0.02', u:' ETH', l:'Staking Rewards' },
          ].map(s => (
            <div key={s.l} style={{ background: 'var(--deep)', padding: '1.25rem', textAlign: 'center' }}>
              <div style={{ fontFamily: 'Black Ops One, cursive', fontSize: '24px', color: 'var(--copper-l)' }}>
                {s.v}{s.u && <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '12px', color: 'var(--copper)' }}>{s.u}</span>}
              </div>
              <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '10px', color: 'var(--grey-l)', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: '4px' }}>{s.l}</div>
            </div>
          ))}
        </div>

        {/* Deployed tokens */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <span style={{ fontFamily: 'Black Ops One, cursive', fontSize: '16px', color: 'var(--cream)' }}>Deployed Tokens</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem' }}>
            {[
              { sym:'$WARZ',  status:'Bonding',    statusColor:'var(--copper)',  statBg:'rgba(184,112,64,0.1)',  statBorder:'rgba(184,112,64,0.25)', stats:[['71%','Bonded'],['0.14 ETH','Fees Earned'],['0.36 ETH','Armory'],['0.87 ETH','Needed']], pct:71 },
              { sym:'$RECON', status:'Graduated',  statusColor:'var(--gold-b)', statBg:'rgba(240,176,32,0.1)',  statBorder:'rgba(240,176,32,0.25)', stats:[['0.25 ETH','Grad Payout'],['0.34 ETH','Total Fees'],['$7,040','Market Cap'],['0.4%','Uni Fee APR']], pct:100 },
            ].map(t => (
              <div key={t.sym} style={{ background: 'var(--panel)', border: '1px solid var(--border)', padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <div style={{ fontFamily: 'Black Ops One, cursive', fontSize: '16px', color: 'var(--cream)' }}>{t.sym}</div>
                  <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '10px', fontWeight: 700, color: t.statusColor, background: t.statBg, border: `1px solid ${t.statBorder}`, padding: '2px 7px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{t.status}</div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  {t.stats.map(([v,l]) => (
                    <div key={l}>
                      <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '12px', color: 'var(--cream)' }}>{v}</div>
                      <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '9px', color: 'var(--grey)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{l}</div>
                    </div>
                  ))}
                </div>
                {t.pct < 100 && (
                  <div style={{ height: '6px', background: 'rgba(184,112,64,0.08)', border: '1px solid rgba(184,112,64,0.15)', position: 'relative' }}>
                    <div style={{ height: '100%', width: `${t.pct}%`, background: 'linear-gradient(90deg,var(--copper),var(--copper-l))' }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Holdings */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <span style={{ fontFamily: 'Black Ops One, cursive', fontSize: '16px', color: 'var(--cream)' }}>Holdings</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
          </div>
          <div style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: '0.5rem', padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', fontFamily: 'Share Tech Mono, monospace', fontSize: '9px', color: 'var(--grey)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              <span>Token</span><span>Balance</span><span>Value</span><span>Status</span><span>24h</span>
            </div>
            {[
              { sym:'$MOLTOV', name:'Molotov Protocol', bal:'42,000', val:'$1,840', status:'94.2%', chg:'+12.4%', pos:true },
              { sym:'$WARZ',   name:'War Zone',         bal:'18,000', val:'$1,220', status:'71%',   chg:'+8.1%',  pos:true },
              { sym:'$DRILLZ', name:'Drillz (Grad)',    bal:'95,000', val:'$1,180', status:'Uni LP', chg:'-3.2%', pos:false },
            ].map(h => (
              <div key={h.sym} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: '0.5rem', padding: '0.75rem 1rem', borderBottom: '1px solid rgba(184,112,64,0.06)', alignItems: 'center', transition: 'background 0.15s' }}>
                <div>
                  <div style={{ fontFamily: 'Black Ops One, cursive', fontSize: '14px', color: 'var(--cream)' }}>{h.sym}</div>
                  <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: '12px', color: 'var(--grey-l)' }}>{h.name}</div>
                </div>
                <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '12px', color: 'var(--cream)' }}>{h.bal}</span>
                <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '12px', color: 'var(--cream)' }}>{h.val}</span>
                <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '12px', color: h.status === 'Uni LP' ? 'var(--gold-b)' : 'var(--cream)' }}>{h.status}</span>
                <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '12px', color: h.pos ? 'var(--green)' : 'var(--red-b)' }}>{h.chg}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Creator rewards */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <span style={{ fontFamily: 'Black Ops One, cursive', fontSize: '16px', color: 'var(--cream)' }}>Creator Rewards</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
          </div>
          <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '10px', color: 'var(--grey-l)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '4px' }}>Total Creator Fees Earned</div>
              <div style={{ fontFamily: 'Black Ops One, cursive', fontSize: '32px', color: 'var(--copper-l)' }}>
                0.48 <span style={{ fontSize: '16px', fontFamily: 'Share Tech Mono, monospace', color: 'var(--copper)' }}>ETH</span>
              </div>
              <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '11px', color: 'var(--grey-l)', marginTop: '4px' }}>
                1% buy fee on $WARZ + $RECON · 0.25 ETH graduation payout on $RECON
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button className="btn-clip" style={{ fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: '14px', color: '#060504', background: 'linear-gradient(135deg,var(--copper),var(--copper-l))', border: 'none', padding: '0.65rem 1.75rem', letterSpacing: '0.1em', cursor: 'crosshair', textTransform: 'uppercase' }}>
                Claim All Rewards
              </button>
              <button className="btn-clip" style={{ fontFamily: 'Oswald, sans-serif', fontWeight: 600, fontSize: '14px', color: 'var(--copper)', background: 'transparent', border: '1px solid rgba(184,112,64,0.4)', padding: '0.65rem 1.75rem', letterSpacing: '0.1em', cursor: 'crosshair', textTransform: 'uppercase' }}>
                View Breakdown
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
