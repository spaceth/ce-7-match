import { useEffect, useMemo, useRef, useState } from 'react'
import { useReducedMotion } from '../lib/useReducedMotion'
import { copy } from '../content'

const STEPS = copy.transfer.steps

const EARTH = { x: 230, y: 500, r: 52 }
const MOON = { x: 690, y: 156, r: EARTH.r / 4 }
const PARK = 98
const LAUNCH = -Math.PI / 2

type Pt = { x: number; y: number; phase: number }

function buildRoute() {
  const dx = MOON.x - EARTH.x
  const dy = MOON.y - EARTH.y
  const span = Math.hypot(dx, dy)
  const ux = dx / span
  const uy = dy / span
  const px = -uy
  const py = ux
  const near = 62
  const ra = span - near
  const a = (PARK + ra) / 2
  const focus = a - PARK
  const b = Math.sqrt(a * a - focus * focus)
  const center = { x: EARTH.x + ux * focus, y: EARTH.y + uy * focus }
  const peri = Math.atan2(-uy, -ux)

  const points: Pt[] = []
  const push = (x: number, y: number, phase: number) => points.push({ x, y, phase })
  const cubic = (t: number, p0: Pt, p1: Pt, p2: Pt, p3: Pt) => {
    const u = 1 - t
    return {
      x: u * u * u * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t * t * t * p3.x,
      y: u * u * u * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t * t * t * p3.y,
    }
  }

  // Gravity turn: leave Wenchang going up, then pitch over and meet the parking orbit on its tangent.
  const insert = LAUNCH - 1.05
  const surface = {
    x: EARTH.x + Math.cos(LAUNCH) * EARTH.r,
    y: EARTH.y + Math.sin(LAUNCH) * EARTH.r,
    phase: 0,
  }
  const insertion = {
    x: EARTH.x + Math.cos(insert) * PARK,
    y: EARTH.y + Math.sin(insert) * PARK,
    phase: 0,
  }
  const climb = {
    x: surface.x + Math.cos(LAUNCH) * 54,
    y: surface.y + Math.sin(LAUNCH) * 54,
    phase: 0,
  }
  const tangent = { x: Math.sin(insert), y: -Math.cos(insert) }
  const align = {
    x: insertion.x - tangent.x * 58,
    y: insertion.y - tangent.y * 58,
    phase: 0,
  }
  const launchSteps = 48
  for (let i = 0; i <= launchSteps; i += 1) {
    const point = cubic(i / launchSteps, surface, climb, align, insertion)
    push(point.x, point.y, 0)
  }

  let end = peri
  while (end >= insert) end -= Math.PI * 2
  end -= Math.PI * 2
  const parkSteps = 150
  for (let i = 1; i <= parkSteps; i += 1) {
    const angle = insert + (end - insert) * (i / parkSteps)
    push(EARTH.x + Math.cos(angle) * PARK, EARTH.y + Math.sin(angle) * PARK, 1)
  }

  const transferSteps = 150
  for (let i = 1; i <= transferSteps; i += 1) {
    const phi = Math.PI * (i / transferSteps)
    const x = center.x - ux * a * Math.cos(phi) + px * b * Math.sin(phi)
    const y = center.y - uy * a * Math.cos(phi) + py * b * Math.sin(phi)
    push(x, y, phi < Math.PI * 0.28 ? 2 : 3)
  }

  const arrive = Math.atan2(-uy, -ux)
  const far = 118
  const circular = 50
  const ellipseLoops = 1.35
  const ellipseSteps = 120
  for (let i = 1; i <= ellipseSteps; i += 1) {
    const turns = ellipseLoops * (i / ellipseSteps)
    const angle = arrive + turns * Math.PI * 2
    const stretch = (1 - Math.cos(angle - arrive)) / 2
    const radius = near + (far - near) * stretch
    push(MOON.x + Math.cos(angle) * radius, MOON.y + Math.sin(angle) * radius, 4)
  }

  const roundSteps = 90
  for (let i = 1; i <= roundSteps; i += 1) {
    const blend = i / roundSteps
    const turns = ellipseLoops + blend
    const angle = arrive + turns * Math.PI * 2
    const stretch = (1 - Math.cos(angle - arrive)) / 2
    const elliptical = near + (far - near) * stretch
    const radius = elliptical + (circular - elliptical) * blend
    push(MOON.x + Math.cos(angle) * radius, MOON.y + Math.sin(angle) * radius, 5)
  }

  const circularStart = arrive + (ellipseLoops + 1) * Math.PI * 2
  const apo = -Math.PI / 2
  const norm = (angle: number) => {
    const turn = Math.PI * 2
    return ((angle % turn) + turn) % turn
  }
  const remain = (norm(apo) - norm(circularStart) + Math.PI * 2) % (Math.PI * 2)
  const coast = Math.PI * 2 + remain
  const coastSteps = 80
  for (let i = 1; i <= coastSteps; i += 1) {
    const angle = circularStart + coast * (i / coastSteps)
    push(MOON.x + Math.cos(angle) * circular, MOON.y + Math.sin(angle) * circular, 5)
  }

  // Separate on the circular orbit, at apoapsis, then drop to periapsis on the south pole.
  const periAngle = Math.PI / 2
  const apoRadius = circular
  const periRadius = MOON.r
  const axis = (apoRadius + periRadius) / 2
  const ecc = (apoRadius - periRadius) / (apoRadius + periRadius)
  const semiLatus = axis * (1 - ecc * ecc)
  const landSteps = 72
  const landing: Pt[] = []
  const splitAngle = circularStart + coast
  for (let i = 0; i <= landSteps; i += 1) {
    const t = i / landSteps
    const angle = apo + (periAngle - apo) * t
    const anomaly = Math.PI * (1 - t)
    const radius = semiLatus / (1 + ecc * Math.cos(anomaly))
    landing.push({
      x: MOON.x + Math.cos(angle) * radius,
      y: MOON.y + Math.sin(angle) * radius,
      phase: 6,
    })
    const orbit = splitAngle + Math.PI * 2 * 0.85 * t
    push(MOON.x + Math.cos(orbit) * circular, MOON.y + Math.sin(orbit) * circular, 6)
  }

  return { points, landing, launch: { x: EARTH.x, y: EARTH.y - EARTH.r } }
}

function polyline(points: Pt[], count: number) {
  return points
    .slice(0, count)
    .map((point) => `${point.x.toFixed(1)},${point.y.toFixed(1)}`)
    .join(' ')
}

export function TransferPath() {
  const reduced = useReducedMotion()
  const pinRef = useRef<HTMLElement>(null)
  const [progress, setProgress] = useState(reduced ? 1 : 0)
  const route = useMemo(() => buildRoute(), [])

  useEffect(() => {
    const pin = pinRef.current
    if (!pin) return
    const measure = () => {
      const sticky = pin.querySelector('.transfer-sticky')
      if (!sticky) return
      if (reduced) {
        setProgress(1)
        return
      }
      const header = document.querySelector('.brand')?.getBoundingClientRect().height ?? 56
      const rect = pin.getBoundingClientRect()
      const travel = Math.max(pin.offsetHeight - sticky.clientHeight, 1)
      setProgress(Math.min(1, Math.max(0, (header - rect.top) / travel)))
    }
    measure()
    window.addEventListener('scroll', measure, { passive: true })
    window.addEventListener('resize', measure)
    return () => {
      window.removeEventListener('scroll', measure)
      window.removeEventListener('resize', measure)
    }
  }, [reduced])

  const index = Math.round(progress * (route.points.length - 1))
  const craft = route.points[index]
  const phase = craft.phase
  const step = STEPS[phase]
  const landingIndex = Math.max(0, index - (route.points.length - route.landing.length))
  const lander = phase === 6 ? route.landing[Math.min(landingIndex, route.landing.length - 1)] : null

  return (
    <section className="transfer" ref={pinRef} data-reduced={reduced} aria-labelledby="transfer-title">
      <div className="transfer-sticky">
        <div className="transfer-copy">
          <p className="kicker">{copy.transfer.kicker}</p>
          <h3 id="transfer-title">{copy.transfer.title}</h3>
          {reduced ? (
            <ol className="transfer-steps">
              {STEPS.map((item) => (
                <li key={item.title}>
                  <strong>{item.title}</strong>
                  <span>{item.body}</span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="transfer-status">
              <span>{step.title}</span>
              {step.body}
            </p>
          )}
          {copy.transfer.caption ? <p className="transfer-caption">{copy.transfer.caption}</p> : null}
        </div>
        <div className="transfer-stage">
          <svg viewBox="0 0 860 640" role="img" aria-label={copy.transfer.diagram}>
            <g className="transfer-path" fill="none">
              <polyline points={polyline(route.points, route.points.length)} />
              <polyline className="transfer-flown" points={polyline(route.points, index + 1)} />
              {phase === 6 ? (
                <polyline className="transfer-flown" points={polyline(route.landing, landingIndex + 1)} />
              ) : null}
            </g>
            <circle className="transfer-body" cx={EARTH.x} cy={EARTH.y} r={EARTH.r} />
            <circle className="transfer-body" cx={MOON.x} cy={MOON.y} r={MOON.r} />
            <text className="transfer-label" x={EARTH.x} y={EARTH.y + EARTH.r + 32} textAnchor="middle">
              {copy.ui.earth}
            </text>
            <text className="transfer-label" x={MOON.x} y={MOON.y - 132} textAnchor="middle">
              {copy.ui.moon}
            </text>
            <circle className="transfer-craft" cx={craft.x} cy={craft.y} r={5.5} />
            {lander ? <circle className="transfer-craft" cx={lander.x} cy={lander.y} r={5.5} /> : null}
          </svg>
        </div>
      </div>
    </section>
  )
}
