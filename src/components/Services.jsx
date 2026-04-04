import useScrollReveal from '../hooks/useScrollReveal'
import services from '../data/services'
import styles from './Services.module.css'

export default function Services() {
  useScrollReveal()

  return (
    <section className={styles.services} id="services">
      <div className="section-header reveal">
        <span className="section-tag">What I Do</span>
        <h2 className="section-title">My <span className="accent">Services</span></h2>
        <p className="section-sub">From messy raw data to reliable pipelines, clean models and clear dashboards.</p>
      </div>

      <div className={styles.grid}>
        {services.map((s, i) => (
          <div
            key={s.id}
            className={`${styles.card} reveal`}
            style={{ '--delay': `${i * 0.07}s` }}
          >
            <div className={styles.icon}><i className={`bx ${s.icon}`} /></div>
            <h3>{s.title}</h3>
            <p>{s.desc}</p>
            <ul className={styles.tags}>
              {s.tags.map(t => <li key={t}>{t}</li>)}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}
