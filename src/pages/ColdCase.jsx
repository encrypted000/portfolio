import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import CASES from '../data/coldcase'
import ForensicChart from '../components/ForensicChart'
import Mugshot from '../components/Mugshot'
import styles from './ColdCase.module.css'

const TOTAL = CASES.length
const CASE_TIME = 300

async function logCaseAnswer({ caseId, choiceIndex, correct, timeMs, sessionId }) {
  const URL = import.meta.env.VITE_SUPABASE_URL
  const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY
  if (!URL || !KEY) return
  try {
    await fetch(`${URL}/rest/v1/coldcase_answers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': KEY, 'Authorization': `Bearer ${KEY}`, 'Prefer': 'return=minimal' },
      body: JSON.stringify({ case_id: caseId, choice_index: choiceIndex, correct, time_ms: timeMs, session_id: sessionId, played_at: new Date().toISOString() }),
    })
  } catch (_) {}
}

async function logCaseSession({ score, total, durationMs, sessionId }) {
  const URL = import.meta.env.VITE_SUPABASE_URL
  const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY
  if (!URL || !KEY) return
  try {
    await fetch(`${URL}/rest/v1/coldcase_sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': KEY, 'Authorization': `Bearer ${KEY}`, 'Prefer': 'return=minimal' },
      body: JSON.stringify({ session_id: sessionId, score, total, duration_ms: durationMs, played_at: new Date().toISOString() }),
    })
  } catch (_) {}
}

function getVerdict(score) {
  if (score === TOTAL) return { rank: 'CHIEF ANALYST', label: 'Flawless. Every case cracked. You see what others miss.', stars: 6 }
  if (score >= 5)      return { rank: 'SENIOR DETECTIVE', label: 'Near-perfect. One slipped through — but your instincts are razor sharp.', stars: 5 }
  if (score >= 4)      return { rank: 'FIELD ANALYST', label: 'Solid work. Most patterns found. A few went cold.', stars: 4 }
  if (score >= 2)      return { rank: 'JUNIOR ANALYST', label: 'Some cases cracked, some went cold. Keep digging.', stars: 2 }
  return                      { rank: 'EVIDENCE LOST', label: 'The data was all there. You just couldn\'t see it. They all walked free.', stars: 1 }
}

function Typewriter({ text, speed = 16, onDone }) {
  const [display, setDisplay] = useState('')
  useEffect(() => {
    setDisplay('')
    let i = 0
    const t = setInterval(() => {
      i++
      setDisplay(text.slice(0, i))
      if (i >= text.length) { clearInterval(t); onDone?.() }
    }, speed)
    return () => clearInterval(t)
  }, [text])
  return <span>{display}<span className={styles.blinker}>▊</span></span>
}

export default function ColdCase() {
  const [screen,    setScreen]    = useState('intro')
  const [caseIdx,   setCaseIdx]   = useState(0)
  const [score,     setScore]     = useState(0)
  const [selected,  setSelected]  = useState(null)
  const [answers,   setAnswers]   = useState([])
  const [timeLeft,  setTimeLeft]  = useState(CASE_TIME)
  const [startT,    setStartT]    = useState(null)
  const [gameStart, setGameStart] = useState(null)
  const [briefDone, setBriefDone] = useState(false)
  const timerRef  = useRef(null)
  const sessionId = useRef(`cc_${Date.now()}_${Math.random().toString(36).slice(2,8)}`)
  const current   = CASES[caseIdx]
  const correctIdx = current?.options.findIndex(o => o.correct)

  useEffect(() => {
    if (screen !== 'investigation' || selected !== null) return
    setTimeLeft(CASE_TIME)
    const t0 = Date.now()
    setStartT(t0)
    timerRef.current = setInterval(() => {
      const left = Math.max(0, CASE_TIME - (Date.now() - t0) / 1000)
      setTimeLeft(Math.ceil(left))
      if (left <= 0) { clearInterval(timerRef.current); handleAnswer(null) }
    }, 300)
    return () => clearInterval(timerRef.current)
  }, [caseIdx, screen, selected])

  const startGame = () => {
    setCaseIdx(0); setScore(0); setSelected(null); setAnswers([])
    setGameStart(Date.now()); setBriefDone(false); setScreen('briefing')
  }

  const handleAnswer = (idx) => {
    clearInterval(timerRef.current)
    const timeMs = startT ? Date.now() - startT : CASE_TIME * 1000
    const correct = idx === correctIdx
    setSelected(idx ?? -1)
    const newAns = [...answers, { caseId: current.id, choiceIndex: idx, correct, timeMs }]
    setAnswers(newAns)
    if (correct) setScore(s => s + 1)
    logCaseAnswer({ caseId: current.id, choiceIndex: idx, correct, timeMs, sessionId: sessionId.current })
    setScreen('verdict')
  }

  const nextCase = () => {
    if (caseIdx + 1 >= TOTAL) {
      logCaseSession({ score, total: TOTAL, durationMs: gameStart ? Date.now() - gameStart : 0, sessionId: sessionId.current })
      setScreen('result')
    } else {
      setCaseIdx(i => i + 1)
      setSelected(null)
      setBriefDone(false)
      setScreen('briefing')
    }
  }

  const timerPct   = (timeLeft / CASE_TIME) * 100
  const timerMins  = String(Math.floor(timeLeft / 60)).padStart(2,'0')
  const timerSecs  = String(timeLeft % 60).padStart(2,'0')
  const timerDisplay = `${timerMins}:${timerSecs}`
  const timerColor = timeLeft > 120 ? '#dc2626' : timeLeft > 60 ? '#f59e0b' : '#f8fafc'

  // ── INTRO ──────────────────────────────────────────────────────────────────
  if (screen === 'intro') return (
    <div className={styles.page}>
      <div className={styles.scanlines} />
      <div className={styles.vignette} />
      <Link to="/" className={styles.backLink}>← BACK TO PORTFOLIO</Link>
      <div className={styles.introWrap}>
        <p className={styles.agency}>COLD CASE DIVISION — DATA FORENSICS UNIT</p>
        <div className={styles.stamp}>CLASSIFIED</div>
        <h1 className={styles.mainTitle}>COLD<br/><span>CASE</span></h1>
        <p className={styles.tagline}>
          Six cases. Each one unsolved.<br/>
          The data is all there — most people just don't know how to read it.<br/>
          <strong>5 minutes per case. No second chances.</strong>
        </p>
        <div className={styles.caseList}>
          {CASES.map((c, i) => (
            <div key={c.id} className={styles.caseListRow} style={{ animationDelay: `${i * 0.08}s` }}>
              <span className={styles.caseListNum}>{c.caseNumber}</span>
              <span className={styles.caseListTitle}>{c.emoji} {c.title}</span>
              <span className={styles.caseListStatus}>UNSOLVED</span>
            </div>
          ))}
        </div>
        <button className={styles.openBtn} onClick={startGame}>OPEN CASE FILES</button>
        <p className={styles.disclaimer}>All scenarios are fictional. Responses anonymously recorded and analysed.</p>
      </div>
    </div>
  )

  // ── BRIEFING ───────────────────────────────────────────────────────────────
  if (screen === 'briefing') return (
    <div className={styles.page}>
      <div className={styles.scanlines} />
      <div className={styles.vignette} />
      <div className={styles.briefWrap}>
        <div className={styles.briefTop}>
          <span className={styles.briefCaseNum}>{current.caseNumber}</span>
          <span className={styles.briefProgress}>CASE {caseIdx + 1} OF {TOTAL}</span>
        </div>
        <div className={styles.briefLayout}>
          <Mugshot suspect={current.suspect} caseNumber={current.caseNumber} />
          <div className={styles.dossier}>
            <div className={styles.dossierHeader}>
              <span className={styles.dossierEmoji}>{current.emoji}</span>
              <div>
                <h2 className={styles.dossierTitle}>{current.title}</h2>
                <p className={styles.dossierTagline}>"{current.tagline}"</p>
              </div>
            </div>
            <div className={styles.dossierDivider} />
            <div className={styles.dossierBody}>
              <p className={styles.dossierLabel}>▸ CASE BRIEFING</p>
              <p className={styles.dossierText}>
                <Typewriter text={current.briefing} speed={14} onDone={() => setBriefDone(true)} />
              </p>
            </div>
          </div>
        </div>
        {briefDone && (
          <button className={styles.evidenceBtn} onClick={() => setScreen('investigation')}>
            ▸ OPEN EVIDENCE FILE
          </button>
        )}
      </div>
    </div>
  )

  // ── INVESTIGATION ──────────────────────────────────────────────────────────
  if (screen === 'investigation') return (
    <div className={styles.page}>
      <div className={styles.scanlines} />
      <div className={styles.vignette} />
      <div className={styles.investWrap}>
        <div className={styles.investTop}>
          <div>
            <span className={styles.investCaseNum}>{current.caseNumber}</span>
            <span className={styles.investTitle}> — {current.title}</span>
          </div>
          <div className={styles.timerCircle}>
            <svg viewBox="0 0 50 50">
              <circle cx="25" cy="25" r="20" fill="none" stroke="rgba(220,38,38,.15)" strokeWidth="3.5"/>
              <circle cx="25" cy="25" r="20" fill="none" stroke={timerColor} strokeWidth="3.5"
                strokeDasharray={`${timerPct * 1.257} 125.7`} strokeLinecap="round"
                transform="rotate(-90 25 25)" style={{ transition: 'stroke-dasharray .3s linear, stroke .5s' }}/>
              <text x="25" y="27" textAnchor="middle" fill={timerColor} fontSize="8" fontWeight="800" fontFamily="'Courier New', monospace">{timerDisplay}</text>
            </svg>
          </div>
        </div>

        <div className={styles.investLayout}>
          <div className={styles.investMain}>
        <div className={styles.evidencePanel}>
          <p className={styles.evidencePanelLabel}>▸ EVIDENCE FILE — REVIEW ALL DATA</p>
          <div className={styles.evidenceGrid}>
            {current.evidence.map((e, i) => (
              <div key={i} className={`${styles.evidenceItem} ${e.highlight ? styles.evidenceHot : ''}`}>
                {e.highlight && <div className={styles.redDot} />}
                <span className={styles.evidenceItemKey}>{e.label}</span>
                <span className={styles.evidenceItemVal}>{e.value}</span>
              </div>
            ))}
          </div>
        </div>

        <ForensicChart chart={current.chart} />
          </div>{/* investMain */}
          <Mugshot suspect={current.suspect} caseNumber={current.caseNumber} compact={true} />
        </div>{/* investLayout */}

        <div className={styles.questionWrap}>
          <p className={styles.questionText}>▸ {current.question}</p>
          <div className={styles.optionGrid}>
            {current.options.map((opt, i) => (
              <button key={i} className={styles.optionBtn} onClick={() => handleAnswer(i)}>
                <span className={styles.optionKey}>{String.fromCharCode(65 + i)}</span>
                <span>{opt.text}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  // ── VERDICT SCREEN ─────────────────────────────────────────────────────────
  if (screen === 'verdict') {
    const wasCorrect = answers[answers.length - 1]?.correct
    return (
      <div className={styles.page}>
        <div className={styles.scanlines} />
        <div className={styles.vignette} />
        <div className={styles.verdictWrap}>
          <div className={`${styles.verdictBanner} ${wasCorrect ? styles.bannerSolved : styles.bannerCold}`}>
            {wasCorrect ? '✓ CASE SOLVED' : '✗ CASE CLOSED — COLD'}
          </div>

          <h2 className={styles.verdictCaseTitle}>{current.emoji} {current.title}</h2>

          <div className={styles.optionsReveal}>
            {current.options.map((opt, i) => (
              <div key={i} className={`${styles.optReveal}
                ${i === correctIdx ? styles.optRevealCorrect : ''}
                ${i === selected && i !== correctIdx ? styles.optRevealWrong : ''}
              `}>
                <span className={styles.optionKey}>{String.fromCharCode(65 + i)}</span>
                <span>{opt.text}</span>
                {i === correctIdx && <span className={styles.revealMark}>✓</span>}
                {i === selected && i !== correctIdx && <span className={styles.revealMarkWrong}>✗</span>}
              </div>
            ))}
          </div>

          <div className={styles.verdictFile}>
            <p className={styles.verdictFileLabel}>▸ OFFICIAL VERDICT</p>
            <p className={styles.verdictFileText}>{current.verdict}</p>
            <div className={styles.deduction}>
              <p>{current.deduction}</p>
            </div>
          </div>

          <div className={styles.verdictFooter}>
            <span className={styles.runningScore}>Solved: {score} / {caseIdx + 1}</span>
            <button className={styles.nextCaseBtn} onClick={nextCase}>
              {caseIdx + 1 >= TOTAL ? 'FINAL DEBRIEF →' : 'NEXT CASE →'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── RESULT ─────────────────────────────────────────────────────────────────
  if (screen === 'result') {
    const v = getVerdict(score)
    return (
      <div className={styles.page}>
        <div className={styles.scanlines} />
        <div className={styles.vignette} />
        <div className={styles.resultWrap}>
          <p className={styles.agency}>COLD CASE DIVISION — FINAL DEBRIEF</p>
          <div className={styles.resultRankBadge}>{v.rank}</div>
          <div className={styles.resultDial}>
            <svg viewBox="0 0 140 140">
              <circle cx="70" cy="70" r="56" fill="none" stroke="rgba(220,38,38,.12)" strokeWidth="8"/>
              <circle cx="70" cy="70" r="56" fill="none" stroke="#dc2626" strokeWidth="8"
                strokeDasharray={`${(score / TOTAL) * 351.9} 351.9`} strokeLinecap="round"
                transform="rotate(-90 70 70)" style={{ transition: 'stroke-dasharray 1.5s ease' }}/>
              <text x="70" y="62" textAnchor="middle" fill="#f8fafc" fontSize="36" fontWeight="800" fontFamily="'Courier New', monospace">{score}</text>
              <text x="70" y="84" textAnchor="middle" fill="#555" fontSize="14" fontFamily="'Courier New', monospace">/ {TOTAL}</text>
            </svg>
          </div>
          <p className={styles.resultVerdict}>{v.label}</p>

          <div className={styles.finalBreakdown}>
            {CASES.map((c, i) => {
              const a = answers[i]
              return (
                <div key={c.id} className={`${styles.fbRow} ${a?.correct ? styles.fbSolved : styles.fbCold}`}>
                  <span className={styles.fbNum}>{c.caseNumber}</span>
                  <span className={styles.fbTitle}>{c.emoji} {c.title}</span>
                  <span className={styles.fbBadge}>{a?.correct ? 'SOLVED' : 'COLD'}</span>
                </div>
              )
            })}
          </div>

          <div className={styles.resultActions}>
            <button className={styles.reopenBtn} onClick={startGame}>REOPEN FILES</button>
            <Link to="/" className={styles.portfolioBtn}>← PORTFOLIO</Link>
          </div>

          <p className={styles.dataNote}>
            📊 Your session is anonymously recorded. Bidhan will analyse all player responses
            and publish the findings as a live data project.
          </p>
        </div>
      </div>
    )
  }

  return null
}
