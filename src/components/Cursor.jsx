import { useEffect, useRef } from 'react'
import styles from './Cursor.module.css'

export default function Cursor() {
  const dotRef  = useRef(null)
  const ringRef = useRef(null)
  const mouse   = useRef({ x: 0, y: 0 })
  const ring    = useRef({ x: 0, y: 0 })
  const raf     = useRef(null)

  useEffect(() => {
    const onMove = e => {
      mouse.current = { x: e.clientX, y: e.clientY }
      dotRef.current.style.left = e.clientX + 'px'
      dotRef.current.style.top  = e.clientY + 'px'
    }

    const animate = () => {
      ring.current.x += (mouse.current.x - ring.current.x) * 0.15
      ring.current.y += (mouse.current.y - ring.current.y) * 0.15
      ringRef.current.style.left = ring.current.x + 'px'
      ringRef.current.style.top  = ring.current.y + 'px'
      raf.current = requestAnimationFrame(animate)
    }

    const addHover = () => {
      document.querySelectorAll('a, button, [role="button"]').forEach(el => {
        el.addEventListener('mouseenter', () => ringRef.current?.classList.add(styles.ringHover))
        el.addEventListener('mouseleave', () => ringRef.current?.classList.remove(styles.ringHover))
      })
    }

    document.addEventListener('mousemove', onMove)
    raf.current = requestAnimationFrame(animate)
    addHover()

    return () => {
      document.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(raf.current)
    }
  }, [])

  return (
    <>
      <div ref={dotRef}  className={styles.dot}  />
      <div ref={ringRef} className={styles.ring} />
    </>
  )
}
