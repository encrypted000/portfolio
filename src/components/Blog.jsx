import useScrollReveal from '../hooks/useScrollReveal'
import notes from '../data/articles'
import styles from './Blog.module.css'

const TAG_ICONS = {
  'SQL':            'bx bx-data',
  'Power BI':       'bx bx-bar-chart-alt-2',
  'Python':         'bxl bxl-python',
  'Data Modelling': 'bx bx-git-branch',
}

export default function Blog({ onOpenNote }) {
  useScrollReveal()

  return (
    <section className={styles.blog} id="notes">
      <div className="section-header reveal">
        <span className="section-tag">Things I Know</span>
        <h2 className="section-title">My <span className="accent">Notes</span></h2>
        <p className="section-sub">Short, specific things I have learned from real work — not tutorials.</p>
      </div>

      <div className={styles.grid}>
        {notes.map((n, i) => (
          <div
            key={n.id}
            className={`${styles.card} reveal`}
            style={{ '--delay': `${i * 0.1}s` }}
            onClick={() => onOpenNote(n)}
          >
            <span className={styles.tag}>
              <i className={TAG_ICONS[n.tag] || 'bx bx-bulb'} />
              {n.tag}
            </span>
            <h3>{n.title}</h3>
            <p>{n.text}</p>
            <span className={styles.readMore}>Read note <i className="bx bx-right-arrow-alt" /></span>
          </div>
        ))}
      </div>
    </section>
  )
}
