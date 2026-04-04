const STATUS_COLOR = {
  'PRIME SUSPECT':       '#dc2626',
  'PERSON OF INTEREST':  '#d97706',
  'CLEARED':             '#16a34a',
}

export default function Mugshot({ suspect, caseNumber, compact = false }) {
  const color = STATUS_COLOR[suspect.status] || '#888'

  if (compact) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem',
        padding: '1.6rem 1.2rem',
        border: `1px solid ${color}33`,
        borderTop: `3px solid ${color}`,
        background: 'rgba(0,0,0,.4)',
        minWidth: '14rem', maxWidth: '16rem',
        fontFamily: "'Courier New', monospace",
      }}>
        <img
          src={`https://i.pravatar.cc/80?img=${suspect.photoId}`}
          alt={suspect.name}
          style={{ width: '6rem', height: '6rem', borderRadius: '50%', objectFit: 'cover', border: `2px solid ${color}66`, filter: 'grayscale(60%)' }}
        />
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#e8e8e0', letterSpacing: '.04em' }}>{suspect.name}</div>
          <div style={{ fontSize: '.9rem', color: color, fontWeight: 700, letterSpacing: '.08em', marginTop: '.3rem' }}>{suspect.status}</div>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: '1.2rem',
      padding: '2rem',
      border: `1px solid ${color}44`,
      borderTop: `3px solid ${color}`,
      background: 'rgba(0,0,0,.45)',
      minWidth: '20rem', maxWidth: '22rem',
      fontFamily: "'Courier New', monospace",
    }}>
      <div style={{ fontSize: '1rem', color: '#555', letterSpacing: '.12em' }}>{caseNumber} — SUSPECT FILE</div>
      <img
        src={`https://i.pravatar.cc/200?img=${suspect.photoId}`}
        alt={suspect.name}
        style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', filter: 'grayscale(55%) contrast(1.1)', border: `1px solid ${color}44` }}
      />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
        <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#e8e8e0', letterSpacing: '.04em' }}>{suspect.name}</div>
        <div style={{ fontSize: '1.1rem', color: '#888' }}>{suspect.role}</div>
        <div style={{ fontSize: '1rem', color: '#888' }}>AGE: {suspect.age}</div>
        <div style={{
          display: 'inline-block', marginTop: '.4rem',
          fontSize: '1rem', fontWeight: 700, letterSpacing: '.12em',
          color: color, border: `1px solid ${color}`, padding: '.3rem .8rem',
          width: 'fit-content',
        }}>
          ▸ {suspect.status}
        </div>
      </div>
    </div>
  )
}
