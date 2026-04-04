import styles from './Footer.module.css'

const NAV = ['home', 'services', 'resume', 'portfolio', 'notes', 'contact']

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <a href="#home" className={styles.logo}>
          <span className={styles.logoWord}>Biddi</span>
        </a>
        <p>Turning data into decisions — one pipeline at a time.</p>
        <div className={styles.links}>
          {NAV.map(id => (
            <a key={id} href={`#${id}`}>
              {id.charAt(0).toUpperCase() + id.slice(1)}
            </a>
          ))}
        </div>
        <div className="sci">
          <a href="https://www.linkedin.com/in/bidhan-pant/" target="_blank" rel="noreferrer"><i className="bx bxl-linkedin" /></a>
          <a href="https://github.com/encrypted000" target="_blank" rel="noreferrer"><i className="bx bxl-github" /></a>
          <a href="mailto:bidpant@gmail.com"><i className="bx bx-envelope" /></a>
        </div>
        <p className={styles.copy}>© 2025 Bidhan Pant. All rights reserved.</p>
      </div>
    </footer>
  )
}
