import { useEffect, useRef, useState } from 'react'
import { engineeringSpec } from '../lib/engineering'
import { useReducedMotion } from '../lib/useReducedMotion'

const spec = engineeringSpec

export function Engineering() {
  return (
    <div className="eng">
      <Material />
      <Precision />
      <Power />
      <DataFlow />
      <Close />
    </div>
  )
}

function Material() {
  const [low, high] = spec.material.alloyMassRange
  const [lighterLow, lighterHigh] = spec.material.lighterPercentRange

  return (
    <section className="eng-block" aria-labelledby="eng-material-title">
      <h3 id="eng-material-title">A lighter structure. A demanding material.</h3>
      <p>
        Magnesium alloy helped reduce the structural mass of MATCH, supporting the instrument’s tight mass allocation. For
        the same volume of material, aluminium is the reference at {spec.material.referenceMass}, and the magnesium alloy
        is approximately {low}–{high}. NARIT describes the material as approximately {lighterLow}–{lighterHigh}% lighter
        than aluminium. The comparison applies to the structural material. The complete instrument also contains detectors,
        electronics, and other components.
      </p>
      <p>This is the first time in Thailand that magnesium alloy material can be fabricated.</p>
      <AlloyCompare reference={spec.material.referenceMass} low={low} high={high} lighterLow={lighterLow} lighterHigh={lighterHigh} />
    </section>
  )
}

function AlloyCompare({
  reference,
  low,
  high,
  lighterLow,
  lighterHigh,
}: {
  reference: number
  low: number
  high: number
  lighterLow: number
  lighterHigh: number
}) {
  return (
    <figure
      className="alloy"
      aria-label={`Same volume. Aluminium mass ${reference}. Magnesium alloy mass ${low} to ${high}. Approximately ${lighterLow} to ${lighterHigh} percent lighter than aluminium.`}
    >
      <p className="alloy-volume">Same volume</p>
      <div className="alloy-pair">
        <div>
          <Billet tone="aluminium" />
          <p className="alloy-name">Aluminium</p>
          <p className="alloy-mass">
            {reference}
            <span>Mass</span>
          </p>
        </div>
        <div>
          <Billet tone="magnesium" />
          <p className="alloy-name">Magnesium alloy</p>
          <p className="alloy-mass">
            {low}–{high}
            <span>Mass</span>
          </p>
        </div>
      </div>
      <figcaption>
        <strong>
          {lighterLow}–{lighterHigh}%
        </strong>
        lighter than aluminium
      </figcaption>
    </figure>
  )
}

function Billet({ tone }: { tone: 'aluminium' | 'magnesium' }) {
  const face = tone === 'aluminium' ? ['#f7f8fa', '#d4d7dd', '#b7bcc4', '#a3a8b1'] : ['#ffffff', '#f3f4f7', '#e4e6eb', '#d5d8df']

  return (
    <svg className="alloy-shape" viewBox="0 0 320 176" aria-hidden="true">
      <defs>
        <linearGradient id={`${tone}-face`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={face[0]} />
          <stop offset="22%" stopColor={face[1]} />
          <stop offset="70%" stopColor={face[2]} />
          <stop offset="100%" stopColor={face[3]} />
        </linearGradient>
        <linearGradient id={`${tone}-sheen`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff" stopOpacity={tone === 'aluminium' ? 0.45 : 0.7} />
          <stop offset="26%" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <filter id={`${tone}-shadow`} x="-20%" y="-20%" width="140%" height="170%">
          <feDropShadow dx="0" dy="14" stdDeviation="10" floodColor="#000" floodOpacity="0.55" />
        </filter>
      </defs>
      <rect x="16" y="12" width="288" height="128" rx="8" fill={`url(#${tone}-face)`} filter={`url(#${tone}-shadow)`} />
      <rect x="16" y="12" width="288" height="128" rx="8" fill={`url(#${tone}-sheen)`} />
      <path d="M28 13.2 H292" stroke="#fff" strokeOpacity="0.85" strokeLinecap="round" />
    </svg>
  )
}

function Precision() {
  const reduced = useReducedMotion()
  const listRef = useRef<HTMLUListElement>(null)
  const [progress, setProgress] = useState(reduced ? 1 : 0)
  const facts = [
    { value: spec.manufacturing.structuralComponents, label: 'Structural components' },
    { value: spec.manufacturing.thaiFabrication, label: 'Fabricated by Thai engineers' },
    { value: 'Precision machining and dimensional inspection', label: '' },
  ]

  useEffect(() => {
    if (reduced) {
      setProgress(1)
      return
    }
    const node = listRef.current
    if (!node) return
    let frame = 0
    let played = false
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || played) return
        played = true
        const start = performance.now()
        const duration = 1200
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / duration)
          setProgress(1 - (1 - t) ** 3)
          if (t < 1) frame = requestAnimationFrame(tick)
        }
        frame = requestAnimationFrame(tick)
        observer.disconnect()
      },
      { threshold: 0.55 },
    )
    observer.observe(node)
    return () => {
      observer.disconnect()
      cancelAnimationFrame(frame)
    }
  }, [reduced])

  return (
    <section className="eng-block" aria-labelledby="eng-precision-title">
      <h3 id="eng-precision-title">Precision in every component.</h3>
      <ul className="eng-facts" ref={listRef}>
        {facts.map((fact) => (
          <li key={fact.value}>
            <strong className={fact.label ? undefined : 'eng-fact-line'} aria-label={fact.value}>
              {fact.label ? countUp(fact.value, progress) : fact.value}
            </strong>
            {fact.label ? <span>{fact.label}</span> : null}
          </li>
        ))}
      </ul>
      <div className="eng-photos">
        <Photo label="Magnesium-alloy machining" />
        <Photo label="Dimensional inspection" />
        <Photo label="Structural assembly" />
      </div>
    </section>
  )
}

function countUp(value: string, progress: number) {
  const match = value.match(/\d+/)
  if (!match || match.index === undefined) return value
  const current = Math.round(Number(match[0]) * progress)
  return value.slice(0, match.index) + current + value.slice(match.index + match[0].length)
}

function Power() {
  const verified = spec.power.verified

  return (
    <section className="eng-block" aria-labelledby="eng-power-title">
      <h3 id="eng-power-title">Sensitive measurements. Limited power.</h3>
      <p>Detector readout must capture small signals while sharing the spacecraft’s limited electrical resources.</p>
      <p className="eng-quiet">{verified ? `≤${spec.power.averageWatts} W average` : 'Low-power readout'}</p>
    </section>
  )
}

function DataFlow() {
  const showRate = spec.data.verified && spec.data.bitsPerSecond !== null

  return (
    <section className="eng-block" aria-labelledby="eng-data-title">
      <h3 id="eng-data-title">From signals to scientific information.</h3>
      <p>
        Particle interactions produce detector signals. Readout electronics convert those signals into digital
        information, which is passed to the Chang’e-7 spacecraft for return to Earth.
      </p>
      {showRate ? <p className="eng-quiet">{spec.data.bitsPerSecond} bit/s instrument data</p> : null}
    </section>
  )
}

function Close() {
  return (
    <section className="eng-block eng-close" aria-labelledby="eng-close-title">
      <h3 id="eng-close-title">Engineering makes the measurement possible.</h3>
      <p>
        The structure, detectors, electronics, and spacecraft interfaces must work as one system. Each engineering
        decision helps turn a scientific question into a measurement.
      </p>
      <Photo label="Engineering team or assembly" wide />
    </section>
  )
}

function Photo({ label, wide = false }: { label: string; wide?: boolean }) {
  return (
    <div className={wide ? 'eng-photo eng-photo-wide' : 'eng-photo'} role="img" aria-label={`Placeholder photograph: ${label}`}>
      <span>{label}</span>
    </div>
  )
}
