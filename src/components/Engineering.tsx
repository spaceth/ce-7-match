import { useEffect, useRef, useState } from 'react'
import { engineeringSpec } from '../lib/engineering'
import { useReducedMotion } from '../lib/useReducedMotion'
import { copy, fill } from '../content'

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

  const text = copy.engineering.material

  return (
    <section className="eng-block" aria-labelledby="eng-material-title">
      <h3 id="eng-material-title">{text.title}</h3>
      <p>
        {fill(text.body, {
          referenceMass: spec.material.referenceMass,
          low,
          high,
          lighterLow,
          lighterHigh,
        })}
      </p>
      <p>{text.first}</p>
    </section>
  )
}

function Precision() {
  const reduced = useReducedMotion()
  const listRef = useRef<HTMLUListElement>(null)
  const [progress, setProgress] = useState(reduced ? 1 : 0)
  const text = copy.engineering.precision
  const facts = [
    { value: spec.manufacturing.structuralComponents, label: text.components },
    { value: spec.manufacturing.thaiFabrication, label: text.fabricated },
    { value: text.inspection, label: '' },
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
      <h3 id="eng-precision-title">{text.title}</h3>
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

  const text = copy.engineering.power

  return (
    <section className="eng-block" aria-labelledby="eng-power-title">
      <h3 id="eng-power-title">{text.title}</h3>
      <p>{text.body}</p>
      <p className="eng-quiet">{verified ? fill(text.verified, { watts: spec.power.averageWatts ?? '' }) : text.quiet}</p>
    </section>
  )
}

function DataFlow() {
  const showRate = spec.data.verified && spec.data.bitsPerSecond !== null

  const text = copy.engineering.data

  return (
    <section className="eng-block" aria-labelledby="eng-data-title">
      <h3 id="eng-data-title">{text.title}</h3>
      <p>{text.body}</p>
      {showRate ? <p className="eng-quiet">{fill(text.rate, { rate: spec.data.bitsPerSecond ?? '' })}</p> : null}
    </section>
  )
}

function Close() {
  const text = copy.engineering.close

  return (
    <section className="eng-block eng-close" aria-labelledby="eng-close-title">
      <h3 id="eng-close-title">{text.title}</h3>
      <p>{text.body}</p>
    </section>
  )
}
