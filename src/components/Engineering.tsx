import { useEffect, useRef, useState, type RefObject } from 'react'
import { engineeringSpec } from '../lib/engineering'
import { useReducedMotion } from '../lib/useReducedMotion'

const spec = engineeringSpec

export function Engineering() {
  const reduced = useReducedMotion()

  return (
    <div className="eng" data-motion={reduced ? 'reduce' : 'run'}>
      <Material />
      <Precision />
      <Power reduced={reduced} />
      <DataFlow reduced={reduced} />
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
    </section>
  )
}

function Precision() {
  const facts = [
    { value: spec.manufacturing.structuralComponents, label: 'Structural components' },
    { value: spec.manufacturing.thaiFabrication, label: 'Fabricated by Thai engineers' },
    { value: 'Precision machining and dimensional inspection', label: '' },
  ]

  return (
    <section className="eng-block" aria-labelledby="eng-precision-title">
      <h3 id="eng-precision-title">Precision in every component.</h3>
      <ul className="eng-facts">
        {facts.map((fact) => (
          <li key={fact.value}>
            <strong className={fact.label ? undefined : 'eng-fact-line'}>{fact.value}</strong>
            {fact.label ? <span>{fact.label}</span> : null}
          </li>
        ))}
      </ul>
      <ol className="eng-sequence">
        {['Material blank', 'Machining', 'Inspection', 'Assembly'].map((step, index) => (
          <li key={step}>
            <span>{index + 1}</span>
            {step}
          </li>
        ))}
      </ol>
      <div className="eng-photos">
        <Photo label="Magnesium-alloy machining" />
        <Photo label="Dimensional inspection" />
        <Photo label="Structural assembly" />
      </div>
    </section>
  )
}

function Power({ reduced }: { reduced: boolean }) {
  const [ref, shown] = useShown<HTMLDivElement>(reduced)
  const verified = spec.power.verified

  return (
    <section className="eng-block" aria-labelledby="eng-power-title">
      <h3 id="eng-power-title">Sensitive measurements. Limited power.</h3>
      <p>Detector readout must capture small signals while sharing the spacecraft’s limited electrical resources.</p>
      <p className="eng-quiet">{verified ? `≤${spec.power.averageWatts} W average` : 'Low-power readout'}</p>
      <div className="eng-power" ref={ref} data-shown={shown}>
        <svg viewBox="0 0 760 180" role="img" aria-label="Spacecraft power feeds instrument electronics, which feed detector readout">
          <line className="eng-power-line" x1="204" y1="90" x2="240" y2="90" />
          <line className="eng-power-line" x1="436" y1="90" x2="488" y2="90" />
          <circle className="eng-pulse" cx="222" cy="90" r="3.5" />
          <circle className="eng-pulse eng-pulse-late" cx="462" cy="90" r="3.5" />
          <PowerNode x={16} label="Spacecraft power" />
          <PowerNode x={248} label="Instrument electronics" />
          <PowerNode x={496} label="Detector readout" />
        </svg>
      </div>
    </section>
  )
}

function PowerNode({ x, label }: { x: number; label: string }) {
  const lines = label.split(' ')
  const first = lines.length > 2 ? lines.slice(0, -1).join(' ') : lines[0]
  const second = lines.length > 2 ? lines[lines.length - 1] : lines.slice(1).join(' ')
  return (
    <g>
      <rect x={x} y={54} width={180} height={72} rx={18} />
      <text x={x + 90} y={second ? 86 : 96} textAnchor="middle">
        {first}
      </text>
      {second ? (
        <text x={x + 90} y={106} textAnchor="middle">
          {second}
        </text>
      ) : null}
    </g>
  )
}

function DataFlow({ reduced }: { reduced: boolean }) {
  const [ref, shown] = useShown<HTMLOListElement>(reduced)
  const steps = ['Detector', 'Readout', 'Instrument data', 'Spacecraft', 'Earth']
  const showRate = spec.data.verified && spec.data.bitsPerSecond !== null

  return (
    <section className="eng-block" aria-labelledby="eng-data-title">
      <h3 id="eng-data-title">From signals to scientific information.</h3>
      <p>
        Particle interactions produce detector signals. Readout electronics convert those signals into digital
        information, which is passed to the Chang’e-7 spacecraft for return to Earth.
      </p>
      <ol className="eng-flow" ref={ref} data-shown={shown}>
        {steps.map((step, index) => (
          <li key={step}>
            <span>{step}</span>
            {index < steps.length - 1 ? <i className="eng-flow-dot" aria-hidden="true" /> : null}
          </li>
        ))}
      </ol>
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

function useShown<T extends HTMLElement>(reduced: boolean): [RefObject<T | null>, boolean] {
  const ref = useRef<T>(null)
  const [shown, setShown] = useState(reduced)

  useEffect(() => {
    if (reduced) {
      setShown(true)
      return
    }
    const node = ref.current
    if (!node) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setShown(true)
      },
      { threshold: 0.15 },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [reduced])

  return [ref, shown]
}
