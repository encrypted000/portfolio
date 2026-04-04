import { useEffect } from 'react'
import styles from './ArticleModal.module.css'

export default function ArticleModal({ article, onClose }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    const onKey = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  return (
    <div className={styles.modal}>
      <div className={styles.backdrop} onClick={onClose} />
      <div className={styles.panel}>
        <button className={styles.close} onClick={onClose}>
          <i className="bx bx-x" />
        </button>
        <div className={styles.content}>
          <h2>{article.title}</h2>
          <div className={styles.meta}>
            <span><i className="bx bx-calendar" /> {article.date}</span>
            <span>{article.tag}</span>
          </div>
          {article.body.map((block, i) => {
            if (block.type === 'h3') return <h3 key={i}>{block.text}</h3>
            return <p key={i}>{block.text}</p>
          })}
        </div>
      </div>
    </div>
  )
}
