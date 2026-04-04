import { useState, useEffect, useRef } from 'react'
import useScrollReveal from '../hooks/useScrollReveal'
import projects from '../data/projects'
import styles from './Portfolio.module.css'

const FILTERS = ['all', 'pipeline', 'analytics', 'automation']
const FILTER_LABELS = { all: 'All', pipeline: 'Pipelines', analytics: 'Dashboards', automation: 'Automation' }

export default function Portfolio() {
  useScrollReveal()
  const [active, setActive] = useState('all')
  const gridRef = useRef(null)

  const filtered = active === 'all' ? projects : projects.filter(p => p.category === active)

  useEffect(() => {
    const timer = setTimeout(() => {
      gridRef.current?.querySelectorAll('.reveal').forEach(el => el.classList.add('revealed'))
    }, 20)
    return () => clearTimeout(timer)
  }, [active])

  return (
    <section className={styles.portfolio} id="portfolio">
      <div className="section-header reveal">
        <span className="section-tag">My Work</span>
        <h2 className="section-title">Featured <span className="accent">Projects</span></h2>
        <p className="section-sub">Real projects across data pipelines, dashboards, modelling and automation.</p>
      </div>

      <div className={`${styles.filters} reveal`}>
        {FILTERS.map(f => (
          <button
            key={f}
            className={`${styles.filterBtn} ${active === f ? styles.activeFilter : ''}`}
            onClick={() => setActive(f)}
          >
            {FILTER_LABELS[f]}
          </button>
        ))}
      </div>

      <div className={styles.grid} ref={gridRef}>
        {filtered.map((p, i) => (
          <div key={p.id} className={`${styles.card} reveal`} style={{ '--delay': `${i * 0.08}s` }}>
            <div className={styles.cardImg}>
              {p.image
                ? <img src={p.image} alt={p.title} className={styles.cardImgPhoto} />
                : <div className={styles.placeholder}><i className={`bx ${p.icon}`} /></div>
              }
              <div className={styles.overlay}>
                <a href={p.github} className={styles.cardLink} title="GitHub" target="_blank" rel="noreferrer"><i className="bx bxl-github" /></a>
              </div>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.cardTags}>
                {p.tags.map(t => <span key={t}>{t}</span>)}
              </div>
              <h3>{p.title}</h3>
              <p>{p.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
