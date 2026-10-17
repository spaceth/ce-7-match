import type { ReactNode } from 'react'
import { useReducedMotion } from '../lib/useReducedMotion'

const SPECIES = [
  { name: 'Electrons', range: '4.0 MeV ~ 120 MeV', min: 4, max: 120, color: '#7fd0ee', delay: '-0.2s' },
  { name: 'Protons', range: '25 MeV ~ 150 MeV', min: 25, max: 150, color: '#f4f4f5', delay: '-0.55s' },
  { name: 'Alpha particles', range: '60 MeV ~ 400 MeV', min: 60, max: 400, color: '#8fe3cf', delay: '-0.9s' },
] as const

const ENERGY_MAX = 400
const STRIPS = 8

export function MeasureNotes() {
  const reduced = useReducedMotion()

  return (
    <>
      <Topic
        title="Track its path."
        body="Silicon detectors record positions along a particle’s trajectory."
        label="First Silicon tracking layer, Si 1, drawn as crossed strips"
      >
        <SiliconMark />
      </Topic>
      <Topic
        title="Measure its energy deposits."
        body="Scintillators reveal how energy is deposited inside the instrument."
        label="First ΔE scintillator and central E scintillator"
      >
        <EnergyMark />
      </Topic>
      <Topic
        title="Understand the environment."
        body="Many events together help researchers investigate Solar Energetic Particles, Galactic Cosmic Rays, Jovian Electrons, and Lunar Albedo."
        label="Electrons, protons, and alpha particles with their energy ranges"
        labelled={false}
      >
        <SpeciesMark reduced={reduced} />
        <SpeciesReadout />
      </Topic>
    </>
  )
}

function Topic({
  title,
  body,
  label,
  labelled = true,
  children,
}: {
  title: string
  body: string
  label: string
  labelled?: boolean
  children: ReactNode
}) {
  return (
    <article>
      <div className="stage note-stage" role={labelled ? 'img' : undefined} aria-label={labelled ? label : undefined}>
        {children}
      </div>
      <h3>{title}</h3>
      <p>{body}</p>
    </article>
  )
}

function SiliconMark() {
  const size = 112
  const pitch = size / STRIPS
  const gap = 3
  const span = pitch - gap
  const origin = (320 - size) / 2
  const top = 22

  return (
    <svg className="note-svg" viewBox="0 0 320 200" aria-hidden="true">
      <rect x={origin} y={top} width={size} height={size} fill="#4c5560" />
      {Array.from({ length: STRIPS }, (_, index) => (
        <rect key={`x-${index}`} x={origin} y={top + index * pitch + gap / 2} width={size} height={span} fill="#8b949e" />
      ))}
      {Array.from({ length: STRIPS }, (_, index) => {
        const at = origin + index * pitch + gap / 2
        return <rect key={`y-${index}`} x={at} y={top} width={span} height={size} fill="#c5ccd4" opacity="0.42" />
      })}
      <text className="note-svg-label" x="160" y="168" textAnchor="middle">
        Si 1
      </text>
    </svg>
  )
}

function EnergyMark() {
  return (
    <svg className="note-svg" viewBox="0 0 320 200" aria-hidden="true">
      <rect x="78" y="42" width="52" height="96" fill="#6d8494" />
      <rect x="176" y="28" width="78" height="110" fill="#8f8270" />
      <text className="note-svg-label is-delta" x="104" y="168" textAnchor="middle">
        ΔE 1
      </text>
      <text className="note-svg-label is-energy" x="215" y="168" textAnchor="middle">
        E
      </text>
    </svg>
  )
}

function SpeciesMark({ reduced }: { reduced: boolean }) {
  const rows = [34, 100, 166]

  return (
    <svg className="note-svg" viewBox="0 0 320 200" aria-hidden="true">
      {SPECIES.map((species, index) => (
        <g
          key={species.name}
          className={reduced ? undefined : 'env-streak'}
          style={reduced ? undefined : { animationDelay: species.delay }}
        >
          <line
            x1="18"
            y1={rows[index]}
            x2="40"
            y2={rows[index]}
            stroke={species.color}
            strokeWidth="1.25"
            strokeLinecap="round"
            opacity="0.8"
          />
          <circle cx="40" cy={rows[index]} r="2.4" fill={species.color} />
        </g>
      ))}
    </svg>
  )
}

function SpeciesReadout() {
  return (
    <ul className="env-readout">
      {SPECIES.map((species) => (
        <li key={species.name}>
          <span style={{ color: species.color }}>{species.name}</span>
          <strong>{species.range}</strong>
          <i className="env-track" aria-hidden="true">
            <b
              style={{
                left: `${(species.min / ENERGY_MAX) * 100}%`,
                width: `${((species.max - species.min) / ENERGY_MAX) * 100}%`,
                background: species.color,
              }}
            />
          </i>
        </li>
      ))}
    </ul>
  )
}
