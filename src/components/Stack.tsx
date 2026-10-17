import { Html, Line } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import {
  ENERGY_THICKNESS,
  DELTA_THICKNESS,
  LAYERS,
  PLANE_OFFSET,
  SCINT_SIZE,
  SILICON_SIZE,
  SILICON_SLOT,
  TELESCOPE_WORLD,
  WAFER_THICKNESS,
  layoutLayers,
  lowZIsSpace,
  poseAt,
  stepIndex,
  type LayerKind,
  type Mode,
  type Playback,
} from '../lib/instrument'

type StackProps = {
  mode: Mode
  selected: string
  motion: React.MutableRefObject<Playback>
  progressEl: React.RefObject<HTMLDivElement | null>
  onStep: (step: number) => void
  onEnded: () => void
}

const siliconIdle = new THREE.Color('#66707e')
const siliconHot = new THREE.Color('#f2f4f7')
const deltaIdle = new THREE.Color('#5c727f')
const deltaHot = new THREE.Color('#d7e7f1')
const energyIdle = new THREE.Color('#6d665c')
const energyHot = new THREE.Color('#f1e4c8')

export function DetectorAssembly({ motion, progressEl, onStep, onEnded }: StackProps) {
  const built = useMemo(() => createMaterials(), [])
  const groups = useRef<(THREE.Group | null)[]>([])
  const hitGroups = useRef<Record<string, THREE.Group | null>>({})
  const deposits = useRef<Record<string, THREE.Mesh | null>>({})
  const particle = useRef<THREE.Mesh>(null)
  const spaceTag = useRef<THREE.Group>(null)
  const moonTag = useRef<THREE.Group>(null)
  const spaceLabel = useRef<HTMLDivElement>(null)
  const moonLabel = useRef<HTMLDivElement>(null)
  const sidePoint = useMemo(() => new THREE.Vector3(), [])
  const pathRod = useMemo(() => makeRod(1.05), [])
  const tailRod = useMemo(() => makeRod(0.45), [])

  useFrame(({ camera }, delta) => {
    const state = motion.current
    const follow = 1 - Math.exp(-delta * 3.4)
    state.spread += (state.spreadTarget - state.spread) * follow
    if (Math.abs(state.spreadTarget - state.spread) < 0.0008) state.spread = state.spreadTarget

    if (state.playing && !state.reduced && state.mode === 'particle') {
      state.t = Math.min(1, state.t + Math.min(delta, 0.05) / 12.5)
      const next = stepIndex(state.t)
      if (next !== state.step) {
        state.step = next
        onStep(next)
      }
      if (state.t >= 1) {
        state.playing = false
        onEnded()
      }
    }

    if (progressEl.current) {
      progressEl.current.style.transform = `scaleX(${state.t})`
    }

    const placed = layoutLayers(state.spread)
    const posing = state.mode === 'particle'
    const pose = poseAt(state.t, placed, state.entrance)
    const spaceToMoon = lowZIsSpace ? 1 : -1

    placed.forEach((layer, index) => {
      const group = groups.current[index]
      if (group) group.position.z = layer.z
      const glow = posing ? (pose.glow[layer.id] ?? 0) : 0
      const emphasis = posing ? 0.28 + 0.72 * glow : layer.id === state.selected ? 1 : 0.16
      applyEmphasis(built.materials[layer.id], layer.kind, emphasis)
    })

    for (const hit of pose.hits) {
      const group = hitGroups.current[hit.id]
      const material = built.hits[hit.id]
      if (!group || !material) continue
      group.position.x = hit.x
      group.position.y = hit.y
      group.visible = posing && hit.strength > 0.03
      material.opacity = hit.strength
    }

    for (const deposit of pose.deposits) {
      const mesh = deposits.current[deposit.id]
      if (!mesh) continue
      mesh.position.y = deposit.y
      mesh.position.z = deposit.z
      mesh.visible = posing && deposit.opacity > 0.03
      const material = mesh.material as THREE.MeshBasicMaterial
      material.opacity = deposit.opacity
      const scale = 0.35 + 0.65 * deposit.opacity
      mesh.scale.setScalar(scale)
    }

    if (particle.current) {
      particle.current.position.set(pose.particle.x, pose.particle.y, pose.particle.z)
      particle.current.visible = posing
    }

    placeRod(pathRod, pose.path?.a, pose.path?.b, posing ? (pose.path?.opacity ?? 0) : 0)
    placeRod(tailRod, pose.tail, pose.particle, posing ? pose.tailOpacity : 0)

    const first = placed.find((layer) => layer.id === 'si1')
    const last = placed.find((layer) => layer.id === 'si4')
    if (spaceTag.current && first) spaceTag.current.position.z = first.z - spaceToMoon * 20
    if (moonTag.current && last) moonTag.current.position.z = last.z + spaceToMoon * 20
    placeEntranceLabel(spaceLabel.current, spaceTag.current, moonTag.current, camera, sidePoint)
    placeEntranceLabel(moonLabel.current, moonTag.current, spaceTag.current, camera, sidePoint)
  })

  return (
    <group position={[TELESCOPE_WORLD.x, TELESCOPE_WORLD.y, TELESCOPE_WORLD.z]}>
      <Line points={[[0, 0, -86], [0, 0, 86]]} color="#ffffff" transparent opacity={0.16} lineWidth={1} />
      {LAYERS.map((layer, index) => {
        const thickness = layer.kind === 'silicon' ? SILICON_SLOT : layer.kind === 'deltaE' ? DELTA_THICKNESS : ENERGY_THICKNESS
        return (
          <group
            key={layer.id}
            ref={(node) => {
              groups.current[index] = node
            }}
          >
            {layer.kind === 'silicon' ? (
              <>
                <StripArray material={built.materials[layer.id][0]} offset={-PLANE_OFFSET} axis="x" />
                <StripArray material={built.materials[layer.id][1]} offset={PLANE_OFFSET} axis="y" />
                <group
                  ref={(node) => {
                    hitGroups.current[layer.id] = node
                  }}
                  visible={false}
                >
                  <mesh position={[0, 0, -PLANE_OFFSET]} material={built.hits[layer.id]} renderOrder={5}>
                    <ringGeometry args={[3.1, 4.05, 48]} />
                  </mesh>
                  <mesh position={[0, 0, PLANE_OFFSET]} material={built.hits[layer.id]} renderOrder={5}>
                    <ringGeometry args={[3.1, 4.05, 48]} />
                  </mesh>
                  <mesh material={built.hits[layer.id]} renderOrder={5}>
                    <sphereGeometry args={[1.7, 20, 20]} />
                  </mesh>
                </group>
              </>
            ) : (
              <>
                <RoundedCrystal material={built.materials[layer.id][0]} thickness={thickness} />
                <mesh
                  ref={(node) => {
                    deposits.current[layer.id] = node
                  }}
                  position={[SCINT_SIZE / 2, 0, 0]}
                  visible={false}
                  renderOrder={3}
                >
                  <sphereGeometry args={[layer.kind === 'E' ? 4.2 : 2.8, 24, 24]} />
                  <meshBasicMaterial
                    color={layer.kind === 'E' ? '#f8efd8' : '#e7f3fa'}
                    transparent
                    opacity={0}
                    depthWrite={false}
                    depthTest={false}
                    toneMapped={false}
                  />
                </mesh>
              </>
            )}
          </group>
        )
      })}

      <mesh ref={particle} renderOrder={6}>
        <sphereGeometry args={[1.7, 24, 24]} />
        <meshBasicMaterial color="#ffffff" toneMapped={false} depthTest={false} />
      </mesh>
      <primitive object={pathRod} />
      <primitive object={tailRod} />

      <group ref={spaceTag} position={[0, 46, -70]}>
        <Html zIndexRange={[4, 0]} style={{ pointerEvents: 'none' }} wrapperClass="html-label">
          <div ref={spaceLabel} className="callout">
            <span>Entrance</span>
            <strong>Space-facing</strong>
          </div>
        </Html>
      </group>
      <group ref={moonTag} position={[0, 46, 70]}>
        <Html zIndexRange={[4, 0]} style={{ pointerEvents: 'none' }} wrapperClass="html-label">
          <div ref={moonLabel} className="callout">
            <span>Entrance</span>
            <strong>Moon-facing</strong>
          </div>
        </Html>
      </group>
    </group>
  )
}

function placeEntranceLabel(
  label: HTMLDivElement | null,
  tag: THREE.Group | null,
  other: THREE.Group | null,
  camera: THREE.Camera,
  point: THREE.Vector3,
) {
  if (!label || !tag || !other) return
  tag.getWorldPosition(point)
  const x = point.project(camera).x
  other.getWorldPosition(point)
  const otherX = point.project(camera).x
  const onLeft = x < otherX
  const outside = 170
  label.style.alignItems = onLeft ? 'flex-end' : 'flex-start'
  label.style.textAlign = onLeft ? 'right' : 'left'
  label.style.transform = onLeft ? `translate(calc(-100% - ${outside}px), -50%)` : `translate(${outside}px, -50%)`

  const canvas = label.closest('.stage')?.getBoundingClientRect()
  if (!canvas) return
  const rect = label.getBoundingClientRect()
  const margin = 16
  if (onLeft && rect.left < canvas.left + margin) {
    const nudge = canvas.left + margin - rect.left
    label.style.transform = `translate(calc(-100% - ${outside}px + ${nudge}px), -50%)`
  } else if (!onLeft && rect.right > canvas.right - margin) {
    const nudge = rect.right - (canvas.right - margin)
    label.style.transform = `translate(${outside - nudge}px, -50%)`
  }
}

const STRIP_COUNT = 8
const STRIP_GAP = 0.7

function StripArray({
  material,
  offset,
  axis,
}: {
  material: THREE.MeshStandardMaterial
  offset: number
  axis: 'x' | 'y'
}) {
  const pitch = SILICON_SIZE / STRIP_COUNT
  const span = pitch - STRIP_GAP
  const origin = -SILICON_SIZE / 2 + pitch / 2
  return (
    <group position={[0, 0, offset]}>
      {Array.from({ length: STRIP_COUNT }, (_, index) => {
        const at = origin + index * pitch
        const position: [number, number, number] = axis === 'x' ? [at, 0, 0] : [0, at, 0]
        const size: [number, number, number] =
          axis === 'x' ? [span, SILICON_SIZE, WAFER_THICKNESS] : [SILICON_SIZE, span, WAFER_THICKNESS]
        return (
          <mesh key={index} material={material} position={position} renderOrder={2}>
            <boxGeometry args={size} />
          </mesh>
        )
      })}
    </group>
  )
}

function RoundedCrystal({ material, thickness }: { material: THREE.MeshStandardMaterial; thickness: number }) {
  return (
    <mesh material={material} renderOrder={2}>
      <boxGeometry args={[SCINT_SIZE, SCINT_SIZE, thickness]} />
    </mesh>
  )
}

function createMaterials() {
  const materials: Record<string, THREE.MeshStandardMaterial[]> = {}
  const hits: Record<string, THREE.MeshBasicMaterial> = {}

  for (const layer of LAYERS) {
    if (layer.kind === 'silicon') {
      materials[layer.id] = [siliconMaterial(-1), siliconMaterial(-2)]
      hits[layer.id] = new THREE.MeshBasicMaterial({
        color: '#fff6d8',
        transparent: true,
        opacity: 0,
        depthWrite: false,
        depthTest: false,
        side: THREE.DoubleSide,
        toneMapped: false,
      })
    } else {
      const energy = layer.kind === 'E'
      materials[layer.id] = [
        new THREE.MeshStandardMaterial({
          color: energy ? energyIdle.clone() : deltaIdle.clone(),
          roughness: 0.28,
          metalness: 0.02,
          emissive: new THREE.Color(energy ? '#f0ddb4' : '#c5dff1'),
          emissiveIntensity: 0,
        }),
      ]
    }
  }

  return { materials, hits }
}

function siliconMaterial(offset: number) {
  const material = new THREE.MeshStandardMaterial({
    color: siliconIdle.clone(),
    roughness: 0.32,
    metalness: 0.62,
    emissive: new THREE.Color('#ffffff'),
    emissiveIntensity: 0.2,
  })
  material.polygonOffset = true
  material.polygonOffsetFactor = offset
  material.polygonOffsetUnits = offset
  return material
}

function applyEmphasis(materials: THREE.MeshStandardMaterial[], kind: LayerKind, emphasis: number) {
  const [idle, hot] =
    kind === 'silicon' ? [siliconIdle, siliconHot] : kind === 'E' ? [energyIdle, energyHot] : [deltaIdle, deltaHot]
  for (const material of materials) {
    material.color.copy(idle).lerp(hot, emphasis)
    material.emissiveIntensity = kind === 'silicon' ? 0.08 + emphasis * 0.9 : emphasis * (kind === 'E' ? 0.72 : 0.58)
  }
}

const rodStart = new THREE.Vector3()
const rodEnd = new THREE.Vector3()
const rodMid = new THREE.Vector3()
const rodDir = new THREE.Vector3()
const rodUp = new THREE.Vector3(0, 1, 0)

function makeRod(radius: number) {
  const mesh = new THREE.Mesh(
    new THREE.CylinderGeometry(radius, radius, 1, 12),
    new THREE.MeshBasicMaterial({
      color: '#ffffff',
      transparent: true,
      opacity: 0,
      depthWrite: false,
      depthTest: false,
      toneMapped: false,
    }),
  )
  mesh.frustumCulled = false
  mesh.renderOrder = 5
  mesh.visible = false
  return mesh
}

function placeRod(
  mesh: THREE.Mesh,
  a: { x: number; y: number; z: number } | undefined,
  b: { x: number; y: number; z: number } | undefined,
  opacity: number,
) {
  const material = mesh.material as THREE.MeshBasicMaterial
  material.opacity = opacity
  mesh.visible = Boolean(a && b && opacity > 0.03)
  if (!a || !b || !mesh.visible) return
  rodStart.set(a.x, a.y, a.z)
  rodEnd.set(b.x, b.y, b.z)
  rodDir.subVectors(rodEnd, rodStart)
  const length = Math.max(rodDir.length(), 0.001)
  rodMid.copy(rodStart).add(rodEnd).multiplyScalar(0.5)
  rodDir.multiplyScalar(1 / length)
  mesh.position.copy(rodMid)
  mesh.quaternion.setFromUnitVectors(rodUp, rodDir)
  mesh.scale.set(1, length, 1)
}
