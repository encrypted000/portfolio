import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import LEVELS from '../data/codegreen'
import Dashboard from '../components/Dashboard'
import styles from './CodeGreen.module.css'

const TOTAL = LEVELS.length
const LEVEL_TIME = 300 // 5 minutes

async function logAnswer({ levelId, choiceIndex, correct, timeMs, sessionId }) {
  const URL = import.meta.env.VITE_SUPABASE_URL
  const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY
  if (!URL || !KEY) return
  try {
    await fetch(`${URL}/rest/v1/codegreen_answers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: KEY, Authorization: `Bearer ${KEY}`, Prefer: 'return=minimal' },
      body: JSON.stringify({ level_id: levelId, choice_index: choiceIndex, correct, time_ms: timeMs, session_id: sessionId, played_at: new Date().toISOString() }),
    })
  } catch (_) {}
}

async function logSession({ score, total, durationMs, sessionId }) {
  const URL = import.meta.env.VITE_SUPABASE_URL
  const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY
  if (!URL || !KEY) return
  try {
    await fetch(`${URL}/rest/v1/codegreen_sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: KEY, Authorization: `Bearer ${KEY}`, Prefer: 'return=minimal' },
      body: JSON.stringify({ session_id: sessionId, score, total, duration_ms: durationMs, played_at: new Date().toISOString() }),
    })
  } catch (_) {}
}

function getRank(score) {
  if (score === TOTAL) return { title: 'CHIEF ANALYST', sub: 'Perfect mission. Nexara is finished. You saw every pattern.' }
  if (score >= 4)      return { title: 'SENIOR ANALYST', sub: 'Near-flawless. One level slipped — but the case still holds.' }
  if (score >= 3)      return { title: 'FIELD ANALYST', sub: 'Solid work. Most of Nexara exposed. Some evidence missed.' }
  if (score >= 2)      return { title: 'JUNIOR ANALYST', sub: 'Partial case built. Nexara\'s lawyers will find the gaps.' }
  return                      { title: 'CASE COMPROMISED', sub: 'Not enough evidence. Nexara walks free. The planet pays.' }
}

function Typewriter({ text, speed = 18, onDone }) {
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
  return <span className={styles.typeText}>{display}<span className={styles.cursor}>█</span></span>
}

export default function CodeGreen() {
  const [screen,    setScreen]    = useState('intro')
  const [lvlIdx,    setLvlIdx]    = useState(0)
  const [score,     setScore]     = useState(0)
  const [selected,  setSelected]  = useState(null)
  const [answers,   setAnswers]   = useState([])
  const [timeLeft,  setTimeLeft]  = useState(LEVEL_TIME)
  const [startT,    setStartT]    = useState(null)
  const [gameStart, setGameStart] = useState(null)
  const [typeDone,  setTypeDone]  = useState(false)
  const [tab,       setTab]       = useState('brief')
  const timerRef  = useRef(null)
  const sessionId = useRef(`cg_${Date.now()}_${Math.random().toString(36).slice(2,8)}`)
  const current   = LEVELS[lvlIdx]
  const correctIdx = current?.options.findIndex(o => o.correct)

  useEffect(() => {
    if (screen !== 'investigate' || selected !== null) return
    setTimeLeft(LEVEL_TIME)
    const t0 = Date.now()
    setStartT(t0)
    timerRef.current = setInterval(() => {
      const left = Math.max(0, LEVEL_TIME - (Date.now() - t0) / 1000)
      setTimeLeft(Math.ceil(left))
      if (left <= 0) { clearInterval(timerRef.current); handleAnswer(null) }
    }, 300)
    return () => clearInterval(timerRef.current)
  }, [lvlIdx, screen, selected])

  const startGame = () => {
    setLvlIdx(0); setScore(0); setSelected(null); setAnswers([])
    setGameStart(Date.now()); setTypeDone(false); setTab('brief'); setScreen('briefing')
  }

  const handleAnswer = (idx) => {
    clearInterval(timerRef.current)
    const timeMs = startT ? Date.now() - startT : LEVEL_TIME * 1000
    const correct = idx === correctIdx
    setSelected(idx ?? -1)
    const newAns = [...answers, { levelId: current.id, choiceIndex: idx, correct, timeMs }]
    setAnswers(newAns)
    if (correct) setScore(s => s + 1)
    logAnswer({ levelId: current.id, choiceIndex: idx, correct, timeMs, sessionId: sessionId.current })
    setScreen('reveal')
  }

  const nextLevel = () => {
    if (lvlIdx + 1 >= TOTAL) {
      logSession({ score, total: TOTAL, durationMs: gameStart ? Date.now() - gameStart : 0, sessionId: sessionId.current })
      setScreen('result')
    } else {
      setLvlIdx(i => i + 1)
      setSelected(null); setTypeDone(false); setTab('brief')
      setScreen('briefing')
    }
  }

  const mins = String(Math.floor(timeLeft / 60)).padStart(2, '0')
  const secs = String(timeLeft % 60).padStart(2, '0')
  const timerPct = (timeLeft / LEVEL_TIME) * 100
  const timerColor = timeLeft > 120 ? '#22c55e' : timeLeft > 60 ? '#f59e0b' : '#ef4444'

  // ── INTRO ──────────────────────────────────────────────────────────────────
  if (screen === 'intro') return (
    <div className={styles.page}>
      <div className={styles.scanlines} />
      <div className={styles.gridBg} />
      <Link to="/" className={styles.backLink}>← PORTFOLIO</Link>

      <div className={styles.introWrap}>
        <div className={styles.introTop}>
          <div className={styles.introOrg}>
            <span className={styles.orgDot} />
            UN DATA CRISIS CENTRE — ACTIVE
          </div>
          <div className={styles.introAlert}>⚠ PRIORITY ALPHA</div>
        </div>

        <div className={styles.introHero}>
          <div className={styles.introCode}>CODE</div>
          <div className={styles.introGreen}>GREEN</div>
          <div className={styles.introGlow} />
        </div>

        <p className={styles.introSub}>
          You are the last analyst standing between Nexara Industries<br/>
          and the greatest environmental cover-up in history.
        </p>

        <div className={styles.missionList}>
          {LEVELS.map((l, i) => (
            <div key={l.id} className={styles.missionRow} style={{ animationDelay: `${i * 0.1}s` }}>
              <div className={styles.missionNum}>{l.code}</div>
              <div className={styles.missionIcon}>{l.icon}</div>
              <div className={styles.missionInfo}>
                <span className={styles.missionTitle}>{l.title}</span>
                <span className={styles.missionLoc}>{l.location}</span>
              </div>
              <div className={styles.missionStatus}>
                {i === 0 ? <span className={styles.statusActive}>ACTIVE</span> : <span className={styles.statusLocked}>LOCKED</span>}
              </div>
            </div>
          ))}
        </div>

        <div className={styles.introStats}>
          <div className={styles.introStat}><span>5</span>Levels</div>
          <div className={styles.introStat}><span>5 min</span>Per Level</div>
          <div className={styles.introStat}><span>1</span>Story</div>
          <div className={styles.introStat}><span>∞</span>Stakes</div>
        </div>

        <button className={styles.launchBtn} onClick={startGame}>
          <span className={styles.launchDot} />
          INITIATE MISSION
        </button>

        <p className={styles.introDis}>All scenarios fictional. Responses anonymously recorded for a real data project.</p>
      </div>
    </div>
  )

  // ── BRIEFING ───────────────────────────────────────────────────────────────
  if (screen === 'briefing') return (
    <div className={styles.page}>
      <div className={styles.scanlines} />
      <div className={styles.gridBg} />
      <div className={styles.briefWrap}>
        <div className={styles.briefHeader}>
          <div className={styles.briefLeft}>
            <span className={styles.briefCode}>{current.code}</span>
            <span className={styles.briefSep}>—</span>
            <span className={styles.briefLoc}>{current.location}</span>
          </div>
          <div className={styles.briefProgress}>
            {LEVELS.map((l, i) => (
              <div key={l.id} className={`${styles.progressDot} ${i < lvlIdx ? styles.dotDone : i === lvlIdx ? styles.dotActive : styles.dotLocked}`} />
            ))}
          </div>
        </div>

        {/* Scene photo */}
        <div className={styles.sceneWrap}>
          <img
            src={`https://picsum.photos/id/${current.scenePhoto.id}/1200/400`}
            alt={current.scenePhoto.alt}
            className={styles.sceneImg}
          />
          <div className={styles.sceneOverlay} />
          <div className={styles.sceneTitle}>
            <span className={styles.sceneTitleIcon}>{current.icon}</span>
            <div>
              <h2 className={styles.sceneTitleText}>{current.title}</h2>
              <p className={styles.sceneTitleSub}>{current.subtitle}</p>
            </div>
          </div>
          <div className={styles.sceneCode}>{current.code}</div>
        </div>

        {/* Transmission */}
        <div className={styles.transmission}>
          <div className={styles.transHeader}>
            <span className={styles.transDot} />
            <span className={styles.transLabel}>INCOMING TRANSMISSION — UN CRISIS CENTRE</span>
            <span className={styles.transTime}>{new Date().toUTCString().slice(17, 25)} UTC</span>
          </div>
          <div className={styles.transBody}>
            <Typewriter text={current.storyIntro} speed={15} onDone={() => setTypeDone(true)} />
          </div>
        </div>

        {typeDone && (
          <button className={styles.investigateBtn} onClick={() => setScreen('investigate')}>
            ▶ ACCESS EVIDENCE DASHBOARD
          </button>
        )}
      </div>
    </div>
  )

  // ── INVESTIGATE ────────────────────────────────────────────────────────────
  if (screen === 'investigate') return (
    <div className={styles.page}>
      <div className={styles.scanlines} />
      <div className={styles.gridBg} />
      <div className={styles.investWrap}>

        {/* Top bar */}
        <div className={styles.investBar}>
          <div className={styles.investBarLeft}>
            <span className={styles.investCode}>{current.code}</span>
            <span className={styles.investTitle}>{current.icon} {current.title}</span>
          </div>
          <div className={styles.investTimer}>
            <svg viewBox="0 0 44 44" width="44" height="44">
              <circle cx="22" cy="22" r="18" fill="none" stroke="rgba(34,197,94,.1)" strokeWidth="3" />
              <circle cx="22" cy="22" r="18" fill="none" stroke={timerColor} strokeWidth="3"
                strokeDasharray={`${timerPct * 1.131} 113.1`} strokeLinecap="round"
                transform="rotate(-90 22 22)" style={{ transition: 'stroke-dasharray .3s linear, stroke .5s' }} />
            </svg>
            <span className={styles.timerNum} style={{ color: timerColor }}>{mins}:{secs}</span>
          </div>
        </div>

        {/* Tabs */}
        <div className={styles.tabs}>
          <button className={`${styles.tab} ${tab === 'brief' ? styles.tabActive : ''}`} onClick={() => setTab('brief')}>
            📋 Evidence File
          </button>
          <button className={`${styles.tab} ${tab === 'dash' ? styles.tabActive : ''}`} onClick={() => setTab('dash')}>
            📊 Data Dashboard
          </button>
          <button className={`${styles.tab} ${tab === 'scene' ? styles.tabActive : ''}`} onClick={() => setTab('scene')}>
            🛰 Scene Photo
          </button>
        </div>

        {/* Tab content */}
        <div className={styles.tabContent}>
          {tab === 'brief' && (
            <div className={styles.evidenceFile}>
              <p className={styles.fileLabel}>▸ EVIDENCE FILE — {current.code} — {current.title.toUpperCase()}</p>
              <div className={styles.evidenceRows}>
                {current.evidence.map((e, i) => (
                  <div key={i} className={`${styles.evidRow} ${e.hot ? styles.evidRowHot : ''}`}>
                    {e.hot && <div className={styles.hotPip} />}
                    <span className={styles.evidKey}>{e.label}</span>
                    <span className={styles.evidVal}>{e.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'dash' && (
            <Dashboard dashboard={current.dashboard} />
          )}

          {tab === 'scene' && (
            <div className={styles.sceneTab}>
              <img
                src={`https://picsum.photos/id/${current.scenePhoto.id}/1200/600`}
                alt={current.scenePhoto.alt}
                className={styles.sceneTabImg}
              />
              <div className={styles.sceneTabOverlay} />
              <div className={styles.sceneTabMeta}>
                <span>{current.icon} {current.title}</span>
                <span>{current.location}</span>
              </div>
            </div>
          )}
        </div>

        {/* Question */}
        <div className={styles.questionBlock}>
          <p className={styles.questionLabel}>▸ ANALYST DECISION REQUIRED</p>
          <p className={styles.question}>{current.question}</p>
          <div className={styles.optionList}>
            {current.options.map((opt, i) => (
              <button key={i} className={styles.optBtn} onClick={() => handleAnswer(i)}>
                <span className={styles.optKey}>{String.fromCharCode(65 + i)}</span>
                <span className={styles.optText}>{opt.text}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  // ── REVEAL ─────────────────────────────────────────────────────────────────
  if (screen === 'reveal') {
    const wasCorrect = answers[answers.length - 1]?.correct
    return (
      <div className={styles.page}>
        <div className={styles.scanlines} />
        <div className={styles.gridBg} />
        <div className={styles.revealWrap}>
          <div className={`${styles.revealBanner} ${wasCorrect ? styles.bannerCorrect : styles.bannerWrong}`}>
            {wasCorrect ? '✓ CORRECT ANALYSIS' : '✗ INCORRECT ANALYSIS'}
          </div>

          <h2 className={styles.revealTitle}>{current.icon} {current.title}</h2>

          {/* Answer reveal */}
          <div className={styles.answerList}>
            {current.options.map((opt, i) => (
              <div key={i} className={`${styles.ansRow}
                ${i === correctIdx ? styles.ansCorrect : ''}
                ${i === selected && i !== correctIdx ? styles.ansWrong : ''}
              `}>
                <span className={styles.optKey}>{String.fromCharCode(65 + i)}</span>
                <span>{opt.text}</span>
                {i === correctIdx && <span className={styles.ansTick}>✓</span>}
                {i === selected && i !== correctIdx && <span className={styles.ansCross}>✗</span>}
              </div>
            ))}
          </div>

          {/* Story reveal */}
          <div className={styles.storyReveal}>
            <div className={styles.transHeader}>
              <span className={styles.transDot} />
              <span className={styles.transLabel}>ANALYST DEBRIEF — {current.code}</span>
            </div>
            <p className={styles.storyRevealText}>{current.storyReveal}</p>
          </div>

          {/* Progress + next */}
          <div className={styles.revealFooter}>
            <div className={styles.revealProgress}>
              {LEVELS.map((l, i) => {
                const a = answers[i]
                return (
                  <div key={l.id} className={`${styles.revProgItem} ${a ? (a.correct ? styles.revProgDone : styles.revProgFail) : styles.revProgLocked}`}>
                    <span>{l.icon}</span>
                    <span className={styles.revProgCode}>{l.code}</span>
                  </div>
                )
              })}
            </div>
            <button className={styles.nextBtn} onClick={nextLevel}>
              {lvlIdx + 1 >= TOTAL ? 'FINAL DEBRIEF →' : `${LEVELS[lvlIdx + 1]?.code}: ${LEVELS[lvlIdx + 1]?.title} →`}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── RESULT ─────────────────────────────────────────────────────────────────
  if (screen === 'result') {
    const rank = getRank(score)
    return (
      <div className={styles.page}>
        <div className={styles.scanlines} />
        <div className={styles.gridBg} />
        <div className={styles.resultWrap}>
          <p className={styles.resultOrg}>UN DATA CRISIS CENTRE — MISSION DEBRIEF</p>

          <div className={styles.resultScore}>
            <svg viewBox="0 0 160 160">
              <circle cx="80" cy="80" r="65" fill="none" stroke="rgba(34,197,94,.1)" strokeWidth="10" />
              <circle cx="80" cy="80" r="65" fill="none" stroke="#22c55e" strokeWidth="10"
                strokeDasharray={`${(score / TOTAL) * 408.4} 408.4`} strokeLinecap="round"
                transform="rotate(-90 80 80)" style={{ transition: 'stroke-dasharray 1.5s ease' }} />
              <text x="80" y="70" textAnchor="middle" fill="#e8f5e8" fontSize="40" fontWeight="900" fontFamily="'Courier New', monospace">{score}</text>
              <text x="80" y="94" textAnchor="middle" fill="#4a6a4a" fontSize="16" fontFamily="'Courier New', monospace">/ {TOTAL}</text>
            </svg>
          </div>

          <div className={styles.resultRank}>{rank.title}</div>
          <p className={styles.resultSub}>{rank.sub}</p>

          {/* Level breakdown */}
          <div className={styles.breakdown}>
            {LEVELS.map((l, i) => {
              const a = answers[i]
              return (
                <div key={l.id} className={`${styles.bdRow} ${a?.correct ? styles.bdSolved : styles.bdFailed}`}>
                  <span className={styles.bdIcon}>{l.icon}</span>
                  <span className={styles.bdCode}>{l.code}</span>
                  <span className={styles.bdTitle}>{l.title}</span>
                  <span className={styles.bdStatus}>{a?.correct ? 'SOLVED' : 'FAILED'}</span>
                </div>
              )
            })}
          </div>

          <div className={styles.resultBtns}>
            <button className={styles.replayBtn} onClick={startGame}>REPLAY MISSION</button>
            <Link to="/" className={styles.homeBtn}>← PORTFOLIO</Link>
          </div>

          <p className={styles.dataNote}>
            📊 Your session is anonymously recorded and will be published as a real data analysis project on this portfolio.
          </p>
        </div>
      </div>
    )
  }

  return null
}
