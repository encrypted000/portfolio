import { useEffect, useRef } from 'react'
import useScrollReveal from '../hooks/useScrollReveal'
import styles from './Hero.module.css'

const TYPED_STRINGS = [
  'Data Pipelines',
  'SQL & Python',
  'Power BI Dashboards',
  'Data Modelling',
  'Automation & Reporting',
]

export default function Hero() {
  useScrollReveal()
  const typedRef = useRef(null)

  useEffect(() => {
    let sIdx = 0, cIdx = 0, isDeleting = false
    let timer

    const tick = () => {
      const cur = TYPED_STRINGS[sIdx]
      if (typedRef.current) {
        typedRef.current.textContent = isDeleting ? cur.slice(0, --cIdx) : cur.slice(0, ++cIdx)
      }
      let delay = isDeleting ? 45 : 85
      if (!isDeleting && cIdx === cur.length) { delay = 1800; isDeleting = true }
      else if (isDeleting && cIdx === 0) { isDeleting = false; sIdx = (sIdx + 1) % TYPED_STRINGS.length; delay = 400 }
      timer = setTimeout(tick, delay)
    }

    timer = setTimeout(tick, 500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <section className={styles.home} id="home">
      <div className={styles.bgGrid} />
      <div className={`${styles.glow} ${styles.glow1}`} />
      <div className={`${styles.glow} ${styles.glow2}`} />

      <div className={`${styles.content} reveal`}>
        <div className={styles.badge}>
          <span className={styles.badgeDot} />
          Open to new opportunities
        </div>

        <h3>Hello there 👋</h3>
        <h1>Bidhan <span className={styles.nameAccent}>Pant</span></h1>
        <h2>
          I work with <span ref={typedRef} className={styles.typed} />
          <span className={styles.cursor}>|</span>
        </h2>

        <p className={styles.intro}>
          Data professional bridging the gap between raw data and real business decisions.
        </p>
        <p className={styles.desc}>
          I specialise in building data pipelines, modelling clean data with SQL & Python, and
          turning complex datasets into clear, interactive dashboards. Based in United Kingdom, I have a proven track record of 
          working across data analysis, pipeline development and automation.
        </p>

        <div className={styles.btnSci}>
          <a href="/Bidhan_Pant_CV.pdf" download className="btn btn-primary">
            <i className="bx bx-download" /> Download CV
          </a>
          <a href="#portfolio" className="btn btn-outline">View My Work</a>
          <div className="sci">
            <a href="https://www.linkedin.com/in/bidhan-pant/" target="_blank" rel="noreferrer">
              <i className="bx bxl-linkedin" />
            </a>
            <a href="https://github.com/encrypted000" target="_blank" rel="noreferrer">
              <i className="bx bxl-github" />
            </a>
            <a href="mailto:bidpant@gmail.com"><i className="bx bx-envelope" /></a>
          </div>
        </div>

        <div className={styles.stats}>
          <div className={styles.stat}><span className={styles.statNum}>5+</span><span className={styles.statLabel}>Years Experience</span></div>
          <div className={styles.statDivider} />
          <div className={styles.stat}><span className={styles.statNum}>10+</span><span className={styles.statLabel}>Clients Served</span></div>
          <div className={styles.statDivider} />
          <div className={styles.stat}><span className={styles.statNum}>4</span><span className={styles.statLabel}>Roles Delivered</span></div>
        </div>
      </div>

      <div className={`${styles.imgWrap} reveal-right`}>
        <div className={styles.orbit}>
          <div className={`${styles.orbitRing} ${styles.ring1}`}>
            {['bxl-python', 'bx-table', 'bxl-postgresql'].map(icon => (
              <div key={icon} className={styles.orbitIcon}>
                <i className={`bx ${icon}`} />
              </div>
            ))}
          </div>
          <div className={`${styles.orbitRing} ${styles.ring2}`}>
            {['bx-bar-chart-alt-2', 'bx-git-branch'].map(icon => (
              <div key={icon} className={styles.orbitIcon}>
                <i className={`bx ${icon}`} />
              </div>
            ))}
          </div>
          <div className={styles.imgBox}>
            <div className={styles.imgGlow} />
            <img src="/images/profile.png" alt="Bidhan Pant" />
          </div>
        </div>
      </div>
    </section>
  )
}
