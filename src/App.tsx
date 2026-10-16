import { useMemo } from 'react'
import { Explorer } from './components/Explorer'
import { FallbackView } from './components/FallbackView'
import { hasWebGL } from './lib/webgl'

export function App() {
  const webgl = useMemo(() => hasWebGL(), [])

  return (
    <main className="page">
      <header className="hero">
        <p className="eyebrow">Chang’e-7 · MATCH</p>
        <h1>Making the invisible measurable.</h1>
        <p className="lede">
          Explore MATCH, the particle detector designed to investigate the energetic particles around the Moon.
        </p>
      </header>

      {webgl ? <Explorer /> : <FallbackView reason="webgl" />}

      <section className="notes" aria-label="How MATCH measures particles">
        <article>
          <h2>Track its path.</h2>
          <p>Silicon detectors record positions along a particle’s trajectory.</p>
        </article>
        <article>
          <h2>Measure its energy deposits.</h2>
          <p>Scintillators reveal how energy is deposited inside the instrument.</p>
        </article>
        <article>
          <h2>Understand the environment.</h2>
          <p>
            Many events together help researchers investigate Solar Energetic Particles, Galactic Cosmic Rays, Jovian
            Electrons, and Lunar Albedo.
          </p>
        </article>
      </section>

      <footer>
        <p>
          The hardware view is the supplied model. Its blue color is the file’s display color. Inside MATCH, the seven
          detector groups are a schematic placed on the model’s axis — they are not separate parts in the file. Which
          window faces space should be confirmed against the spacecraft mounting.
        </p>
      </footer>
    </main>
  )
}
