import { useState, useEffect } from 'react'
import useTheme from './hooks/useTheme'
import Cursor from './components/Cursor'
import Header from './components/Header'
import Hero from './components/Hero'
import Services from './components/Services'
import Resume from './components/Resume'
import Portfolio from './components/Portfolio'
import Blog from './components/Blog'
import Contact from './components/Contact'
import Footer from './components/Footer'
import BackToTop from './components/BackToTop'
import ArticleModal from './components/ArticleModal'

export default function App() {
  const { theme, toggle } = useTheme()
  const [activeSection, setActiveSection] = useState('home')
  const [note, setNote] = useState(null)

  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll('section[id]')
      const scrollY = window.scrollY + 120
      sections.forEach(section => {
        if (scrollY >= section.offsetTop && scrollY < section.offsetTop + section.offsetHeight) {
          setActiveSection(section.id)
        }
      })
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      <div className="noise" />
      <Cursor />
      <Header activeSection={activeSection} theme={theme} onThemeToggle={toggle} />
      <main>
        <Hero />
        <Services />
        <Resume />
        <Portfolio />
        <Blog onOpenNote={setNote} />
        <Contact />
      </main>
      <Footer />
      <BackToTop />
      {note && <ArticleModal article={note} onClose={() => setNote(null)} />}
    </>
  )
}
