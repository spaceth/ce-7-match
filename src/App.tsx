import { useEffect, useMemo, useState } from 'react'
import logo from '../spaceth-logo.svg'
import { Explorer } from './components/Explorer'
import { FallbackView } from './components/FallbackView'
import { OrbitSection } from './components/OrbitSection'
import { hasWebGL } from './lib/webgl'

const CHAPTERS = [
  {
    id: 'mission-overview',
    number: '01',
    voice: 'display',
    title: 'Mission Overview',
    description: 'A first look at this story: the mission, the particles, and the instrument built to measure them.',
  },
  {
    id: 'cosmic-rays',
    number: '02',
    voice: 'statement',
    title: 'Why Study Cosmic Rays',
    description: 'Why energetic particles are worth measuring, and what they can reveal.',
  },
  {
    id: 'change-7',
    number: '03',
    voice: 'invert',
    title: 'About Chang’e-7 Mission',
    description: 'The lunar mission that carries MATCH, and the place this instrument holds in it.',
  },
  {
    id: 'orbit',
    number: '04',
    voice: 'aside',
    title: 'MATCH’s orbit around the Moon',
    description: 'Where MATCH flies, and the two directions it looks from that orbit.',
  },
  {
    id: 'how-match-works',
    number: '05',
    voice: 'direct',
    title: 'How MATCH works',
    description: 'How the detector turns arriving particles into measurements.',
  },
  {
    id: 'engineering',
    number: '06',
    voice: 'measured',
    title: 'Behind the Engineering',
    description: 'The design and construction that make the instrument possible.',
  },
  {
    id: 'people',
    number: '07',
    voice: 'human',
    title: 'People Behind this Project',
    description: 'The people who designed, built, and studied MATCH.',
  },
  {
    id: 'conclusion',
    number: '08',
    voice: 'close',
    title: 'Conclusion',
    description: 'What this view of MATCH leaves us with.',
  },
] as const

type ChapterId = (typeof CHAPTERS)[number]['id']

export function App() {
  const webgl = useMemo(() => hasWebGL(), [])
  const [active, setActive] = useState<ChapterId>(CHAPTERS[0].id)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const nodes = CHAPTERS.map((chapter) => document.getElementById(chapter.id)).filter(
      (node): node is HTMLElement => node !== null,
    )
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
        const id = visible[0]?.target.id
        if (id) setActive(id as ChapterId)
      },
      { rootMargin: '-20% 0px -55% 0px', threshold: [0.15, 0.4, 0.75] },
    )
    nodes.forEach((node) => observer.observe(node))
    return () => observer.disconnect()
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
        <h1 className="sr-only">MATCH</h1>
        <button
          type="button"
          className="menu-toggle"
          aria-expanded={menuOpen}
          aria-controls="chapter-menu"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <MenuIcon open={menuOpen} />
          <span className="sr-only">{menuOpen ? 'Close chapters' : 'Open chapters'}</span>
        </button>
        <img src={logo} alt="SpaceTH" />
      </header>

      {menuOpen ? (
        <button type="button" className="nav-backdrop" aria-label="Close chapters" onClick={() => setMenuOpen(false)} />
      ) : null}

      <div className="shell">
        <nav id="chapter-menu" className="chapters-nav" data-open={menuOpen} aria-label="Chapters">
          <p>Chapters</p>
          <ol>
            {CHAPTERS.map((chapter) => (
              <li key={chapter.id}>
                <a
                  href={`#${chapter.id}`}
                  aria-current={active === chapter.id ? 'true' : undefined}
                  onClick={goToChapter}
                >
                  <span>{chapter.number}</span>
                  {chapter.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <main className="page">
          {CHAPTERS.map((chapter) => (
            <section key={chapter.id} id={chapter.id} className={`chapter voice-${chapter.voice}`} aria-labelledby={`${chapter.id}-title`} tabIndex={-1}>
              <p className="kicker">Chapter {chapter.number}</p>
              <h2 id={`${chapter.id}-title`}>{chapter.title}</h2>
              <p className="chapter-lead">{chapter.description}</p>
              {chapter.id === 'orbit' ? (
                <div className="chapter-body">
                  <OrbitSection />
                </div>
              ) : null}
              {chapter.id === 'how-match-works' ? (
                <div className="chapter-body">
                  {webgl ? <Explorer /> : <FallbackView reason="webgl" />}
                  <section className="notes" aria-label="How MATCH measures particles">
                    <article>
                      <h3>Track its path.</h3>
                      <p>Silicon detectors record positions along a particle’s trajectory.</p>
                    </article>
                    <article>
                      <h3>Measure its energy deposits.</h3>
                      <p>Scintillators reveal how energy is deposited inside the instrument.</p>
                    </article>
                    <article>
                      <h3>Understand the environment.</h3>
                      <p>
                        Many events together help researchers investigate Solar Energetic Particles, Galactic Cosmic Rays,
                        Jovian Electrons, and Lunar Albedo.
                      </p>
                    </article>
                  </section>
                  <footer>
                    <p>
                      The hardware view is the supplied model, shown in white. Inside MATCH, the seven detector groups are
                      a schematic placed on the model’s axis — they are not separate parts in the file. Which window faces
                      space should be confirmed against the spacecraft mounting.
                    </p>
                  </footer>
                </div>
              ) : null}
              {chapter.id !== 'orbit' && chapter.id !== 'how-match-works' ? (
                <div className="chapter-slot">
                  <p>This chapter is ready for the next piece of the story.</p>
                </div>
              ) : null}
            </section>
          ))}
        </main>
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
