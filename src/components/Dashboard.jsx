import styles from './Dashboard.module.css'

export default function Dashboard({ dashboard }) {
  if (!dashboard) return null
  return (
    <div className={styles.dash}>
      <div className={styles.dashHeader}>
        <span className={styles.dashDot} />
        <span className={styles.dashTitle}>{dashboard.title}</span>
        <span className={styles.dashLive}>● LIVE</span>
      </div>
      <div className={styles.dashPanels}>
        {dashboard.panels.map((panel, i) => (
          <div key={i} className={styles.panel}>
            <p className={styles.panelLabel}>{panel.label}</p>
            {panel.type === 'bar'              && <BarChart panel={panel} />}
            {panel.type === 'stat_grid'        && <StatGrid panel={panel} />}
            {panel.type === 'fire_grid'        && <FireGrid panel={panel} />}
            {panel.type === 'comparison_bars'  && <ComparisonBars panel={panel} />}
            {panel.type === 'timeline'         && <Timeline panel={panel} />}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── BAR CHART ── */
function BarChart({ panel }) {
  const max = Math.max(...panel.data.map(d => d.value))
  return (
    <div className={styles.barChartWrap}>
      <div className={styles.barChart}>
        {panel.data.map((d, i) => {
          const pct = Math.min((d.value / max) * 100, 100)
          return (
            <div key={i} className={styles.barCol}>
              <div className={styles.barValue} style={{ color: d.alert ? '#ef4444' : '#4ade80' }}>
                {d.value > 10 ? Math.round(d.value) : d.value}
              </div>
              <div className={styles.barTrack}>
                <div
                  className={`${styles.bar} ${d.alert ? styles.barAlert : styles.barNormal}`}
                  style={{ height: `${pct}%` }}
                />
                {d.value >= panel.alertThreshold && (
                  <div className={styles.alertLine} style={{ bottom: `${(panel.alertThreshold / max) * 100}%` }} />
                )}
              </div>
              <div className={styles.barLabel}>{d.day}</div>
            </div>
          )
        })}
      </div>
      {panel.note && <div className={styles.chartNote}>{panel.note}</div>}
    </div>
  )
}

/* ── STAT GRID ── */
function StatGrid({ panel }) {
  return (
    <div className={styles.statGrid}>
      {panel.stats.map((s, i) => (
        <div key={i} className={`${styles.statRow} ${s.alert ? styles.statAlert : ''}`}>
          <span className={styles.statKey}>{s.key}</span>
          <div className={styles.statRight}>
            <span className={`${styles.statVal} ${s.alert ? styles.statValAlert : ''}`}>{s.value}</span>
            {s.normal && <span className={styles.statNormal}>{s.normal}</span>}
          </div>
          {s.alert && <span className={styles.statPip} />}
        </div>
      ))}
    </div>
  )
}

/* ── FIRE GRID ── */
function FireGrid({ panel }) {
  const size = panel.gridSize
  const ignSet = new Set(panel.ignitions.map(([r, c]) => `${r},${c}`))
  return (
    <div className={styles.fireGridWrap}>
      <div className={styles.fireGrid} style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}>
        {Array.from({ length: size }, (_, r) =>
          Array.from({ length: size }, (_, c) => {
            const key = `${r + 1},${c + 1}`
            const isHot = ignSet.has(key)
            return (
              <div key={key} className={`${styles.fireCell} ${isHot ? styles.fireCellHot : ''}`}>
                {isHot && <span className={styles.fireMark}>🔥</span>}
              </div>
            )
          })
        )}
      </div>
      {panel.note && <div className={styles.chartNote}>{panel.note}</div>}
    </div>
  )
}

/* ── COMPARISON BARS ── */
function ComparisonBars({ panel }) {
  return (
    <div className={styles.compBars}>
      {panel.rows.map((row, i) => {
        const maxVal = Math.max(row.official, row.actual)
        const offPct = (row.official / maxVal) * 100
        const actPct = (row.actual / maxVal) * 100
        return (
          <div key={i} className={styles.compRow}>
            <span className={styles.compLabel}>{row.metric}</span>
            <div className={styles.compTracks}>
              <div className={styles.compTrackWrap}>
                <span className={styles.compTrackLabel}>Official</span>
                <div className={styles.compTrack}>
                  <div className={styles.compBarOff} style={{ width: `${offPct}%` }} />
                </div>
                <span className={styles.compTrackVal}>{row.official} {row.unit}</span>
              </div>
              <div className={styles.compTrackWrap}>
                <span className={styles.compTrackLabel} style={{ color: '#ef4444' }}>Actual</span>
                <div className={styles.compTrack}>
                  <div className={styles.compBarAct} style={{ width: `${actPct}%` }} />
                </div>
                <span className={styles.compTrackVal} style={{ color: '#ef4444' }}>{row.actual} {row.unit}</span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* ── TIMELINE ── */
function Timeline({ panel }) {
  return (
    <div className={styles.timeline}>
      {panel.events.map((e, i) => (
        <div key={i} className={`${styles.tlRow} ${e.hot ? styles.tlHot : ''}`}>
          <div className={styles.tlMonth}>{e.month}</div>
          <div className={styles.tlLine}>
            <div className={`${styles.tlDot} ${e.hot ? styles.tlDotHot : ''}`} />
            {i < panel.events.length - 1 && <div className={styles.tlConnector} />}
          </div>
          <div className={styles.tlContent}>
            <span className={styles.tlLabel}>{e.label}</span>
            <span className={styles.tlDetail}>{e.detail}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
