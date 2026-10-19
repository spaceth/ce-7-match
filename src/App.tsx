import { useEffect, useMemo, useState } from 'react'
import logo from '../spaceth-logo.svg'
import { Explorer } from './components/Explorer'
import { FallbackView } from './components/FallbackView'
import { ChangE7 } from './components/ChangE7'
import { Engineering } from './components/Engineering'
import { People } from './components/People'
import { CosmicRays } from './components/CosmicRays'
import { MissionOverview } from './components/MissionOverview'
import { MeasureNotes } from './components/MeasureNotes'
import { OrbitSection } from './components/OrbitSection'
import { hasWebGL } from './lib/webgl'
import { copy } from './content'
import { useLanguage } from './content/Language'

type ChapterId = 'mission-overview' | 'cosmic-rays' | 'change-7' | 'orbit' | 'how-match-works' | 'engineering' | 'people' | 'conclusion'

export function App() {
  const { lang, choose } = useLanguage()
  const chapters = copy.chapters
  const webgl = useMemo(() => hasWebGL(), [])
  const [active, setActive] = useState<ChapterId>(chapters[0].id as ChapterId)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const nodes = chapters.map((chapter) => document.getElementById(chapter.id)).filter(
      (node): node is HTMLElement => node !== null,
    )
    const markChapter = () => {
      const mark = window.innerHeight * 0.32
      const current = nodes.find((node) => {
        const rect = node.getBoundingClientRect()
        return rect.top <= mark && rect.bottom >= mark
      })
      if (current) setActive(current.id as ChapterId)
    }
    markChapter()
    const observer = new IntersectionObserver(markChapter, { threshold: 0 })
    nodes.forEach((node) => observer.observe(node))
    window.addEventListener('scroll', markChapter, { passive: true })
    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', markChapter)
    }
  }, [])

  useEffect(() => {
    if (!menuOpen) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [menuOpen])

  function goToChapter() {
    setMenuOpen(false)
  }

  return (
    <div className="site">
      <header className="brand">
        <h1 className="sr-only">{copy.ui.brand}</h1>
        <button
          type="button"
          className="menu-toggle"
          aria-expanded={menuOpen}
          aria-controls="chapter-menu"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <MenuIcon open={menuOpen} />
          <span className="sr-only">{menuOpen ? copy.ui.closeChapters : copy.ui.openChapters}</span>
        </button>
        <img src={logo} alt={copy.ui.logoAlt} />
        <div className="lang-switch" role="group" aria-label={copy.ui.language}>
          <button type="button" aria-pressed={lang === 'th'} onClick={() => choose('th')}>TH</button>
          <button type="button" aria-pressed={lang === 'en'} onClick={() => choose('en')}>EN</button>
        </div>
      </header>

      {menuOpen ? (
        <button type="button" className="nav-backdrop" aria-label={copy.ui.closeChapters} onClick={() => setMenuOpen(false)} />
      ) : null}

      <div className="shell">
        <nav id="chapter-menu" className="chapters-nav" data-open={menuOpen} aria-label={copy.ui.chapters}>
          <p>{copy.ui.chapters}</p>
          <ol>
            {chapters.map((chapter) => (
              <li key={chapter.id}>
                <a
                  href={`#${chapter.id}`}
                  aria-current={active === chapter.id ? 'true' : undefined}
                  onClick={goToChapter}
                >
                  {chapter.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="content">
          <section id={chapters[0].id} className={`chapter chapter-stage voice-${chapters[0].voice}`} aria-labelledby={`${chapters[0].id}-title`} tabIndex={-1}>
            <MissionOverview
              webgl={webgl}
              number={chapters[0].number}
              title={chapters[0].title}
              description={chapters[0].description}
            />
          </section>
        <main className="page">
          {chapters.slice(1).map((chapter) => (
            <section key={chapter.id} id={chapter.id} className={`chapter voice-${chapter.voice}`} aria-labelledby={`${chapter.id}-title`} tabIndex={-1}>
              <p className="kicker">{copy.ui.chapter} {chapter.number}</p>
              <h2 id={`${chapter.id}-title`}>{chapter.title}</h2>
              <p className="chapter-lead">{chapter.description}</p>
              {chapter.id === 'change-7' ? (
                <div className="chapter-body">
                  <ChangE7 />
                </div>
              ) : null}
              {chapter.id === 'engineering' ? (
                <div className="chapter-body">
                  <Engineering />
                </div>
              ) : null}
              {chapter.id === 'people' ? (
                <div className="chapter-body">
                  <People />
                </div>
              ) : null}
              {chapter.id === 'conclusion' ? (
                <div className="chapter-body close-copy">
                  {copy.conclusion.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              ) : null}
              {chapter.id === 'cosmic-rays' ? (
                <div className="chapter-body">
                  <CosmicRays />
                </div>
              ) : null}
              {chapter.id === 'orbit' ? (
                <div className="chapter-body">
                  <OrbitSection />
                </div>
              ) : null}
              {chapter.id === 'how-match-works' ? (
                <div className="chapter-body">
                  {webgl ? <Explorer /> : <FallbackView reason="webgl" />}
                  <section className="notes" aria-label={copy.notes.label}>
                    <MeasureNotes />
                  </section>
                  {copy.howFooter ? (
                    <footer>
                      <p>{copy.howFooter}</p>
                    </footer>
                  ) : null}
                </div>
              ) : null}
            </section>
          ))}
          <section className="end-credit" aria-labelledby="end-credit-title">
            <h2 id="end-credit-title">{copy.credits.title}</h2>
            <h3>{copy.credits.story}</h3>
            <ul>
              {copy.credits.roles.map((item) => (
                <li key={item.role}>
                  <span>{item.role}</span>
                  {item.name}
                </li>
              ))}
            </ul>
            <h3>{copy.credits.thanks}</h3>
            <ul>
              {copy.credits.thanksPeople.map((name) => (
                <li key={name}>{name}</li>
              ))}
            </ul>
            <h3>{copy.credits.memory}</h3>
            <p>{copy.credits.memoryName}</p>
            <p className="end-credit-copy">{copy.credits.copyright}</p>
          </section>
        </main>
        </div>
      </div>
    </div>
  )
}

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
    </svg>
  )
}
