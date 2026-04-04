function TimelineChart({ chart }) {
  return (
    <div style={{ fontFamily: "'Courier New', monospace", width: '100%' }}>
      <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#dc2626', letterSpacing: '.1em', marginBottom: '.4rem' }}>{chart.title}</div>
      <div style={{ fontSize: '.95rem', color: '#555', marginBottom: '1.6rem' }}>{chart.subtitle}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
        {chart.events.map((ev, i) => (
          <div key={i} style={{ display: 'flex', gap: '1.4rem', alignItems: 'flex-start' }}>
            {/* line */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
              <div style={{
                width: '1rem', height: '1rem', borderRadius: '50%', flexShrink: 0, marginTop: '.3rem',
                background: ev.hot ? '#dc2626' : '#333',
                boxShadow: ev.hot ? '0 0 6px #dc2626' : 'none',
              }} />
              {i < chart.events.length - 1 && (
                <div style={{ width: '1px', flex: 1, minHeight: '2rem', background: '#222', margin: '.2rem 0' }} />
              )}
            </div>
            {/* content */}
            <div style={{ paddingBottom: '1.4rem' }}>
              <div style={{ fontSize: '1rem', color: '#555', letterSpacing: '.06em' }}>{ev.day}</div>
              <div style={{ fontSize: '1.2rem', fontWeight: ev.hot ? 700 : 400, color: ev.hot ? '#e8e8e0' : '#777' }}>
                {ev.label}
              </div>
              <div style={{ fontSize: '1rem', color: ev.hot ? '#dc2626' : '#555' }}>{ev.value}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function LocationChart({ chart }) {
  return (
    <div style={{ fontFamily: "'Courier New', monospace", width: '100%' }}>
      <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#dc2626', letterSpacing: '.1em', marginBottom: '.4rem' }}>{chart.title}</div>
      <div style={{ fontSize: '.95rem', color: '#555', marginBottom: '.8rem' }}>{chart.subtitle}</div>
      {chart.window && (
        <div style={{ fontSize: '1rem', color: '#d97706', background: 'rgba(217,119,6,.08)', border: '1px solid rgba(217,119,6,.3)', padding: '.5rem 1rem', marginBottom: '1.6rem', letterSpacing: '.06em' }}>
          ⚠ {chart.window}
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '.8rem' }}>
        {chart.locations.map((loc, i) => (
          <div key={i} style={{
            display: 'flex', gap: '1.2rem', alignItems: 'center',
            padding: '.8rem 1rem',
            background: loc.alert ? 'rgba(220,38,38,.06)' : 'rgba(255,255,255,.02)',
            border: `1px solid ${loc.alert ? 'rgba(220,38,38,.25)' : '#1a1a1a'}`,
          }}>
            <div style={{ fontSize: '1.1rem', color: '#555', minWidth: '4.5rem', flexShrink: 0 }}>{loc.time}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '1.2rem', fontWeight: loc.alert ? 700 : 400, color: loc.alert ? '#e8e8e0' : '#777' }}>{loc.place}</div>
              <div style={{ fontSize: '.95rem', color: loc.alert ? '#dc2626' : '#444' }}>{loc.detail}</div>
            </div>
            {loc.alert && <div style={{ color: '#dc2626', fontSize: '1.2rem' }}>▸</div>}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function ForensicChart({ chart }) {
  if (!chart) return null
  if (chart.type === 'location_timeline') return <LocationChart chart={chart} />
  return <TimelineChart chart={chart} />
}
