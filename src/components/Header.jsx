import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import styles from './Header.module.css'

const NAV = ['home', 'services', 'resume', 'portfolio', 'notes', 'contact']

export default function Header({ activeSection, theme, onThemeToggle }) {
  const [scrolled,   setScrolled]   = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const close = () => setMobileOpen(false)

  return (
    <>
      <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
        <a href="#home" className={styles.logo}>
          <span className={styles.logoWord}>Biddi</span>
        </a>

        <nav className={styles.navbar}>
          {NAV.map(id => (
            <a key={id} href={`#${id}`} className={activeSection === id ? styles.active : ''}>
              {id.charAt(0).toUpperCase() + id.slice(1)}
            </a>
          ))}
        </nav>

        <div className={styles.headerRight}>
          <button className={styles.themeToggle} onClick={onThemeToggle} aria-label="Toggle light/dark mode">
            <i className={`bx ${theme === 'dark' ? 'bx-sun' : 'bx-moon'}`} />
          </button>
          <Link to="/querynoir" className={styles.gameBtn}>
            🔍 Query Noir
          </Link>
          <a href="#contact" className={styles.cta}>Hire Me</a>
        </div>

        <button className={styles.hamburger} onClick={() => setMobileOpen(true)} aria-label="Open menu">
          <i className="bx bx-menu" />
        </button>
      </header>

      <div className={`${styles.mobileNav} ${mobileOpen ? styles.open : ''}`}>
        <button className={styles.closeBtn} onClick={close} aria-label="Close menu">
          <i className="bx bx-x" />
        </button>
        <nav>
          {NAV.map(id => (
            <a key={id} href={`#${id}`} onClick={close}>
              {id.charAt(0).toUpperCase() + id.slice(1)}
            </a>
          ))}
          <Link to="/querynoir" onClick={close} style={{ color: '#d97706' }}>
            🔍 Query Noir
          </Link>
        </nav>
      </div>
    </>
  )
}
