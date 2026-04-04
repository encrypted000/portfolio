import { useEffect } from 'react'

export default function useScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const delay = parseFloat(
              entry.target.style.getPropertyValue('--delay') || '0'
            ) * 1000
            setTimeout(() => entry.target.classList.add('revealed'), delay)
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.12 }
    )

    const elements = document.querySelectorAll('.reveal, .reveal-right')
    elements.forEach(el => observer.observe(el))

    return () => observer.disconnect()
  }, [])
}
