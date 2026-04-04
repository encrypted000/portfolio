import { useState, useEffect, useRef } from 'react'
import useScrollReveal from '../hooks/useScrollReveal'
import { experience, education, competencies, skillBars, skillPills } from '../data/resume'
import styles from './Resume.module.css'

function SkillBar({ label, pct, animate }) {
  return (
    <div className={styles.barItem}>
      <div className={styles.barMeta}>
        <span className={styles.barLabel}>{label}</span>
        <span className={styles.barPct}>{pct}%</span>
      </div>
      <div className={styles.bar}>
        <div
          className={styles.barFill}
          style={{ width: animate ? `${pct}%` : '0%', transition: animate ? 'width 1.2s cubic-bezier(.4,0,.2,1)' : 'none' }}
        />
      </div>
    </div>
  )
}

export default function Resume() {
  useScrollReveal()
  const [activeTab, setActiveTab] = useState('resume')
  const [barsAnimated, setBarsAnimated] = useState(false)
  const sectionRef = useRef(null)

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setBarsAnimated(true) },
      { threshold: 0.2 }
    )
    if (sectionRef.current) obs.observe(sectionRef.current)
    return () => obs.disconnect()
  }, [])

  const panelRef = useRef(null)

  const handleTab = (tab) => {
    setActiveTab(tab)
    if (tab === 'skills') setBarsAnimated(true)
  }

  // When tab changes, the new panel's elements are freshly mounted with .reveal
  // but the scroll observer already ran — reveal them immediately since they're in view
  useEffect(() => {
    const timer = setTimeout(() => {
      panelRef.current?.querySelectorAll('.reveal').forEach(el => el.classList.add('revealed'))
    }, 20)
    return () => clearTimeout(timer)
  }, [activeTab])

  return (
    <section className={styles.resume} id="resume" ref={sectionRef}>
      <div className="section-header reveal">
        <span className="section-tag">My Journey</span>
        <h2 className="section-title">Resume & <span className="accent">Skills</span></h2>
        <p className="section-sub">My experience, education and technical toolkit — all in one place.</p>
      </div>

      {/* Tabs */}
      <div className={`${styles.tabs} reveal`}>
        <button
          className={`${styles.tab} ${activeTab === 'resume' ? styles.active : ''}`}
          onClick={() => handleTab('resume')}
        >
          <i className="bx bx-file" /> Resume
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'skills' ? styles.active : ''}`}
          onClick={() => handleTab('skills')}
        >
          <i className="bx bx-chip" /> Skills
        </button>
        <div className={`${styles.slider} ${activeTab === 'skills' ? styles.sliderRight : ''}`} />
      </div>

      {/* Resume Tab */}
      {activeTab === 'resume' && (
        <div className={styles.panel} ref={panelRef}>
          <div className={styles.layout}>
            {/* Experience */}
            <div className={styles.col}>
              <h3 className={styles.colTitle}><i className="bx bx-briefcase" /> Experience</h3>
              <div className={styles.timeline}>
                {experience.map(e => (
                  <div key={e.id} className={`${styles.tlItem} reveal`}>
                    <div className={styles.tlDot} />
                    <div className={styles.tlContent}>
                      <span className={styles.tlDate}>{e.date}</span>
                      <h4>{e.role}</h4>
                      <span className={styles.tlCompany}>{e.company}</span>
                      <ul className={styles.tlBullets}>
                        {e.bullets.map((b, i) => <li key={i}>{b}</li>)}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Education + Competencies */}
            <div className={styles.col}>
              <h3 className={styles.colTitle}><i className="bx bx-book-open" /> Education</h3>
              <div className={styles.timeline}>
                {education.map(e => (
                  <div key={e.id} className={`${styles.tlItem} reveal`}>
                    <div className={styles.tlDot} />
                    <div className={styles.tlContent}>
                      <span className={styles.tlDate}>{e.date}</span>
                      <h4>{e.degree}</h4>
                      <span className={styles.tlCompany}>{e.grade}</span>
                      <p>{e.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <h3 className={`${styles.colTitle} reveal`} style={{ marginTop: '4rem' }}>
                <i className="bx bx-award" /> Core Competencies
              </h3>
              <div className={`${styles.compGrid} reveal`}>
                {competencies.map(c => (
                  <div key={c} className={styles.compItem}>
                    <i className="bx bx-check-circle" /> {c}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Skills Tab */}
      {activeTab === 'skills' && (
        <div className={styles.panel} ref={panelRef}>
          {/* Skill bars — full width, 2-col grid */}
          <div className={styles.skillsGroup} style={{ marginBottom: '4rem' }}>
            <span className={styles.groupLabel}><i className="bx bx-code-curly" /> Programming & Query</span>
            <div className={styles.barsGrid}>
              {skillBars.map(s => (
                <SkillBar key={s.label} label={s.label} pct={s.pct} animate={barsAnimated} />
              ))}
            </div>
          </div>

          {/* Pill groups — 3-col card grid */}
          <div className={styles.pillsGrid}>
            {Object.entries(skillPills).map(([group, pills]) => (
              <div key={group} className={styles.pillCard}>
                <span className={styles.groupLabel}>{group}</span>
                <div className={styles.pills}>
                  {pills.map(p => <span key={p}>{p}</span>)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
