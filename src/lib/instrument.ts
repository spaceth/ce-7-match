/**
 * MATCH detector axis, measured from model.glb.
 *
 * The assembly is one hollow bore. Two parts named "Window Extension 2.0"
 * sit at opposite ends of that bore, separated along the file's Z axis.
 * Scene bounds are about X −69…78, Y −227…26, Z −41…109, with no node transforms.
 *
 * lowZIsSpace is a working assignment for labels. The CAD names do not say
 * which end points outward. Flip this if the spacecraft mounting says otherwise.
 */
export const lowZIsSpace = true

export const MODEL_CENTER = { x: 4.7, y: -100.606707548, z: 33.922016071 }
export const TELESCOPE_MODEL = { x: 0, y: -29, z: 42.02 }
export const TELESCOPE_WORLD = {
  x: TELESCOPE_MODEL.x - MODEL_CENTER.x,
  y: TELESCOPE_MODEL.y - MODEL_CENTER.y,
  z: TELESCOPE_MODEL.z - MODEL_CENTER.z,
}

export const SILICON_SIZE = 48
export const SCINT_SIZE = 40
export const SILICON_SLOT = 2.8
export const DELTA_THICKNESS = 8.5
export const ENERGY_THICKNESS = 18
export const PLANE_OFFSET = 0.85
export const WAFER_THICKNESS = 0.36

export type Mode = 'overview' | 'inside' | 'particle'
export type Entrance = 'space' | 'moon'
export type LayerKind = 'silicon' | 'deltaE' | 'E'

export type LayerDef = {
  id: string
  kind: LayerKind
  pip: string
  name: string
  label: string
  body: string
}

export const LAYERS: LayerDef[] = [
  {
    id: 'si1',
    kind: 'silicon',
    pip: 'Si 1',
    name: 'First Silicon tracking layer',
    label: 'First Silicon',
    body: 'Records where a particle crosses on the space-facing side. Perpendicular strips measure X and Y — two of the eight Silicon planes.',
  },
  {
    id: 'si2',
    kind: 'silicon',
    pip: 'Si 2',
    name: 'Second Silicon tracking layer',
    label: 'Second Silicon',
    body: 'A second crossing, separated along the detector axis. Together with the first hit, it defines a straight trajectory.',
  },
  {
    id: 'de1',
    kind: 'deltaE',
    pip: 'ΔE 1',
    name: 'First ΔE scintillator',
    label: 'First ΔE',
    body: 'Measures a portion of the energy deposited as a particle passes through, before the central stopper.',
  },
  {
    id: 'e',
    kind: 'E',
    pip: 'E',
    name: 'Central E scintillator',
    label: 'Central E',
    body: 'The stopping stage for suitable events. It measures residual energy. Comparing ΔE with E helps distinguish particle types. Not every particle stops, and electron events require their own interpretation.',
  },
  {
    id: 'de2',
    kind: 'deltaE',
    pip: 'ΔE 2',
    name: 'Second ΔE scintillator',
    label: 'Second ΔE',
    body: 'The matching ΔE measurement on the Moon-facing side. A particle entering there meets this scintillator before the central stopper.',
  },
  {
    id: 'si3',
    kind: 'silicon',
    pip: 'Si 3',
    name: 'Third Silicon tracking layer',
    label: 'Third Silicon',
    body: 'A tracking layer on the Moon-facing half. Particles from that entrance reach it before the scintillators.',
  },
  {
    id: 'si4',
    kind: 'silicon',
    pip: 'Si 4',
    name: 'Fourth Silicon tracking layer',
    label: 'Fourth Silicon',
    body: 'The outer tracker on the Moon-facing side. Four tracking layers, each with crossed X and Y strips, give eight Silicon planes.',
  },
]

export type PlacedLayer = LayerDef & { z: number; thickness: number }

const GAP_GATHERED = 3.6
const GAP_SPREAD = 12.6

export function layoutLayers(spread: number): PlacedLayer[] {
  const t = clamp(spread, 0, 1)
  const gap = GAP_GATHERED + (GAP_SPREAD - GAP_GATHERED) * t
  const thicknesses = LAYERS.map((layer) =>
    layer.kind === 'silicon' ? SILICON_SLOT : layer.kind === 'deltaE' ? DELTA_THICKNESS : ENERGY_THICKNESS,
  )
  const total = thicknesses.reduce((sum, value) => sum + value, 0) + gap * (LAYERS.length - 1)
  const spaceToMoon = lowZIsSpace ? 1 : -1
  let cursor = -spaceToMoon * (total / 2)

  return LAYERS.map((layer, index) => {
    const thickness = thicknesses[index]
    const z = cursor + spaceToMoon * (thickness / 2)
    cursor += spaceToMoon * (thickness + gap)
    return { ...layer, z, thickness }
  })
}

export type Callout = {
  id: string
  kicker: string
  title: string
  anchor: [number, number, number]
  side: 'left' | 'right'
}

/** Positions are in the GLB’s original coordinates, before centering. */
export function overviewCallouts(): Callout[] {
  const lowTitle = lowZIsSpace ? 'Space-facing' : 'Moon-facing'
  const highTitle = lowZIsSpace ? 'Moon-facing' : 'Space-facing'
  return [
    {
      id: 'entrance-low-z',
      kicker: 'Window extension',
      title: lowTitle,
      anchor: [0, 30, -20],
      side: 'right',
    },
    {
      id: 'entrance-high-z',
      kicker: 'Window extension',
      title: highTitle,
      anchor: [0, 30, 106],
      side: 'left',
    },
    {
      id: 'housing',
      kicker: 'Structure',
      title: 'Electrical part',
      anchor: [72, -132, 48],
      side: 'right',
    },
    {
      id: 'base',
      kicker: 'Bottom plate',
      title: 'Mounting structure',
      anchor: [66, -224, 20],
      side: 'left',
    },
  ]
}

export function modelToWorld(point: readonly [number, number, number]): [number, number, number] {
  return [point[0] - MODEL_CENTER.x, point[1] - MODEL_CENTER.y, point[2] - MODEL_CENTER.z]
}

export type Playback = {
  spread: number
  spreadTarget: number
  t: number
  playing: boolean
  reduced: boolean
  entrance: Entrance
  step: number
  mode: Mode
  selected: string
}

export const STEP_COUNT = 6
export const STEP_AT = [0, 0.14, 0.3, 0.46, 0.64, 0.8] as const

export function stepIndex(t: number) {
  let step = 0
  for (let i = 0; i < STEP_AT.length; i += 1) {
    if (t + 1e-4 >= STEP_AT[i]) step = i
  }
  return step
}

export function timeForStep(step: number) {
  if (step >= STEP_COUNT - 1) return 1
  return STEP_AT[step] ?? 0
}

export function stepCopy(step: number, entrance: Entrance) {
  const side = entrance === 'space' ? 'space-facing' : 'Moon-facing'
  const first = entrance === 'space' ? 'first' : 'fourth'
  const second = entrance === 'space' ? 'second' : 'third'
  const delta = entrance === 'space' ? 'first' : 'second'
  const steps = [
    {
      title: 'At the entrance',
      body: `A stopping ion approaches the ${side} side. This is an illustrative event, not a measured arrival.`,
    },
    {
      title: 'First tracking hit',
      body: `The ${first} Silicon layer records the crossing. Crossed strips give an X position and a Y position.`,
    },
    {
      title: 'Second tracking hit',
      body: `The ${second} Silicon layer records another crossing. Two separated positions define the trajectory.`,
    },
    {
      title: 'Deposit in ΔE',
      body: `The ${delta} ΔE scintillator measures energy deposited as the particle passes through.`,
    },
    {
      title: 'Stopping in E',
      body: 'The ion stops in the central E scintillator, which measures the residual energy. Comparing ΔE with E helps distinguish particle types. Not every particle stops, and electron events require their own interpretation.',
    },
    {
      title: 'Path from the hits',
      body: 'The line is drawn through the Silicon hits. It reconstructs direction inside MATCH. Arrival through one entrance does not, by itself, identify the astronomical source.',
    },
  ]
  return steps[step] ?? steps[0]
}

export function layersActiveAt(step: number, entrance: Entrance) {
  const ids = entrance === 'space' ? ['si1', 'si2', 'de1', 'e'] : ['si4', 'si3', 'de2', 'e']
  const count = step <= 0 ? 0 : step >= 4 ? 4 : step
  return ids.slice(0, count)
}

export type Vec3 = { x: number; y: number; z: number }

export type Pose = {
  particle: Vec3
  tail: Vec3
  tailOpacity: number
  glow: Record<string, number>
  hits: { id: string; x: number; y: number; strength: number }[]
  path: { a: Vec3; b: Vec3; opacity: number } | null
  deposits: { id: string; y: number; z: number; opacity: number; radius: number; color: string }[]
}

export function poseAt(t: number, layers: PlacedLayer[], entrance: Entrance): Pose {
  const dir = travelDir(entrance)
  const silicon = layers
    .filter((layer) => layer.kind === 'silicon')
    .sort((a, b) => dir * (a.z - b.z))
  const deltas = layers
    .filter((layer) => layer.kind === 'deltaE')
    .sort((a, b) => dir * (a.z - b.z))
  const energy = layers.find((layer) => layer.kind === 'E')!
  const first = silicon[0]
  const second = silicon[1]
  const delta = deltas[0]
  const outside = first.z - dir * (first.thickness * 0.5 + 22)
  const stop = energy.z + dir * energy.thickness * (0.42 - 0.5)
  const marks = [outside, first.z, second.z, delta.z, stop, stop]
  const { index, u } = span(t)
  const z =
    index >= marks.length - 1 ? marks[marks.length - 1] : marks[index] + (marks[index + 1] - marks[index]) * smooth(u)
  const particle = trackPoint(z, entrance)
  const behind = trackPoint(z - dir * 48, entrance)
  const hit1 = ramp(t, STEP_AT[1] - 0.07, STEP_AT[1])
  const hit2 = ramp(t, STEP_AT[2] - 0.07, STEP_AT[2])
  const deltaGlow = ramp(t, STEP_AT[3] - 0.08, STEP_AT[3])
  const energyGlow = ramp(t, STEP_AT[4] - 0.1, STEP_AT[4])
  const pathOpacity = ramp(t, 0.7, 0.94)
  const p1 = trackPoint(first.z, entrance)
  const p2 = trackPoint(second.z, entrance)
  const dx = p2.x - p1.x
  const dy = p2.y - p1.y
  const dz = p2.z - p1.z

  return {
    particle,
    tail: behind,
    tailOpacity: t > 0.02 ? 0.55 * (1 - pathOpacity) : 0,
    glow: {
      [first.id]: hit1,
      [second.id]: hit2,
      [delta.id]: deltaGlow,
      [energy.id]: energyGlow,
    },
    hits: [
      { id: first.id, x: p1.x, y: p1.y, strength: hit1 },
      { id: second.id, x: p2.x, y: p2.y, strength: hit2 },
    ],
    path: {
      a: { x: p1.x - dx * 0.25, y: p1.y - dy * 0.25, z: p1.z - dz * 0.25 },
      b: { x: p2.x + dx * 0.65, y: p2.y + dy * 0.65, z: p2.z + dz * 0.65 },
      opacity: pathOpacity,
    },
    deposits: [
      {
        id: delta.id,
        y: trackPoint(delta.z, entrance).y,
        z: 0,
        opacity: deltaGlow,
        radius: 2.3,
        color: '#e7f3fa',
      },
      {
        id: energy.id,
        y: trackPoint(stop, entrance).y,
        z: stop - energy.z,
        opacity: energyGlow,
        radius: 3.15,
        color: '#f8efd8',
      },
    ],
  }
}

function travelDir(entrance: Entrance) {
  const spaceToMoon = lowZIsSpace ? 1 : -1
  return entrance === 'space' ? spaceToMoon : -spaceToMoon
}

export function trackPoint(z: number, entrance: Entrance): Vec3 {
  if (entrance === 'space') return { x: 0.6, y: z * 0.28, z }
  return { x: -0.4, y: 1.2 - z * 0.24, z }
}

function span(t: number) {
  let index = 0
  for (let k = 0; k < STEP_AT.length - 1; k += 1) {
    if (t >= STEP_AT[k + 1]) index = k + 1
    else break
  }
  if (index >= STEP_AT.length - 1) return { index, u: 1 }
  const start = STEP_AT[index]
  const end = STEP_AT[index + 1]
  return { index, u: clamp((t - start) / (end - start), 0, 1) }
}

function smooth(u: number) {
  const x = clamp(u, 0, 1)
  return x * x * (3 - 2 * x)
}

function ramp(t: number, a: number, b: number) {
  if (b <= a) return t >= b ? 1 : 0
  return smooth((t - a) / (b - a))
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}
