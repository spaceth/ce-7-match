import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from '../lib/useReducedMotion'

const SOURCES = [
  {
    title: 'Solar Cosmic Rays',
    body: 'The Sun releases bursts of energetic particles, especially during flares and eruptions. They arrive suddenly, then fade.',
  },
  {
    title: 'Galactic Cosmic Rays',
    body: 'A steadier rain comes from beyond the solar system. These are among the most energetic particles, likely sped up by the remnants of exploded stars.',
  },
  {
    title: 'Jovian Electrons',
    body: 'Jupiter’s vast magnetic field accelerates electrons. Some of them cross the solar system and can be measured near the Moon.',
  },
  {
    title: 'Lunar Albedo',
    body: 'Particles that strike the lunar surface can knock new particles back out. Those emerging particles are lunar albedo — not reflected light.',
  },
]

const EARTH = { x: 292, y: 268 }
const ORBIT = 146

export function CosmicRays() {
  const reduced = useReducedMotion()
  const pinRef = useRef<HTMLDivElement>(null)
  const [progress, setProgress] = useState(reduced ? 0.5 : 0)

  useEffect(() => {
    const pin = pinRef.current
    if (!pin) return
    const measure = () => {
      const sticky = pin.querySelector('.tail-sticky')
      if (!sticky) return
      if (reduced) {
        setProgress(0.5)
        return
      }
      const header = document.querySelector('.brand')?.getBoundingClientRect().height ?? 56
      const rect = pin.getBoundingClientRect()
      const travel = Math.max(pin.offsetHeight - sticky.clientHeight, 1)
      const next = Math.min(1, Math.max(0, (header - rect.top) / travel))
      setProgress(next)
    }
    measure()
    window.addEventListener('scroll', measure, { passive: true })
    window.addEventListener('resize', measure)
    return () => {
      window.removeEventListener('scroll', measure)
      window.removeEventListener('resize', measure)
    }
  }, [reduced])

  const theta = Math.PI - progress * Math.PI * 2
  const moonX = EARTH.x + ORBIT * Math.cos(theta)
  const moonY = EARTH.y + ORBIT * Math.sin(theta)
  const alongTail = moonX - EARTH.x
  const inTail = alongTail > 36 && Math.abs(moonY - EARTH.y) < 26 + alongTail * 0.2

  return (
    <div className="rays">
      <section className="ray-sources" aria-label="Sources of particles MATCH can study">
        <h3>More than one source.</h3>
        <div className="ray-grid">
          {SOURCES.map((source) => (
            <article key={source.title}>
              <div className="ray-frame" role="img" aria-label={`Image placeholder for ${source.title}`}>
                <span>Image</span>
              </div>
              <h4>{source.title}</h4>
              <p>{source.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="tail" ref={pinRef} data-reduced={reduced} aria-labelledby="magnetotail-title">
        <div className="tail-sticky">
          <div className="tail-copy">
            <p className="kicker">Around Earth</p>
            <h3 id="magnetotail-title">In and out of the magnetotail.</h3>
            <p>
              The Moon circles Earth about once a month. The solar wind blows Earth’s magnetic field into a long tail on the
              night side. For several days each month the Moon crosses that tail, then returns to the solar wind. MATCH
              flies with the Moon, so one orbit carries the detector through more than one particle environment.
            </p>
          </div>
          <div className="tail-stage">
            <svg viewBox="0 0 960 520" role="img" aria-labelledby="magnetotail-title magnetotail-status">
              <title>The Moon crossing Earth’s magnetotail</title>
              <g className="tail-wind" aria-hidden="true">
                {[150, 210, 268, 326, 386].map((y) => (
                  <line key={y} x1="28" y1={y} x2="168" y2={y} />
                ))}
                <text x="28" y="128">
                  Solar wind
                </text>
              </g>
              <path className="tail-bow" d="M292 150 C176 196 168 348 292 392" />
              <path
                className="tail-body"
                d="M292 198 C214 226 206 314 292 340 C500 402 730 418 940 386 L940 150 C730 118 500 136 292 198 Z"
              />
              <text className="tail-label" x="620" y="250">
                Magnetotail
              </text>
              <circle className="tail-orbit" cx={EARTH.x} cy={EARTH.y} r={ORBIT} />
              <circle className="tail-earth" cx={EARTH.x} cy={EARTH.y} r="18" />
              <text className="tail-label" x={EARTH.x - 18} y={EARTH.y + 36}>
                Earth
              </text>
              <g className="tail-moon">
                <circle cx={moonX} cy={moonY} r="7" />
              </g>
            </svg>
            <p id="magnetotail-status" className="tail-status" data-in={inTail}>
              <span>{inTail ? 'Inside the magnetotail' : 'In the solar wind'}</span>
              {inTail
                ? 'Earth’s magnetic tail stands between the Moon and the solar wind. The particles MATCH can record are not the same mix.'
                : 'Outside the tail, particles from the Sun, the galaxy, and Jupiter can reach the Moon more directly.'}
            </p>
            <p className="tail-caption">
              Illustrative. The Moon’s orbit is not drawn to scale. Chang’e-7 / MATCH rides with the Moon.
            </p>
          </div>
        </div>
      </section>

      <p className="ray-close">That is why Thailand goes to orbit around the Moon.</p>
      <p className="ray-close-lead">
        A detector on Earth sits under the atmosphere and inside the magnetic field. From lunar orbit, MATCH passes
        through the solar wind and Earth’s magnetotail, and it can watch particles leaving the lunar surface. One flight
        can meet solar cosmic rays, galactic cosmic rays, Jovian electrons, and lunar albedo.
      </p>
    </div>
  )
}
