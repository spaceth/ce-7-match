import { OrbitControls } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { createContext, useContext, useEffect, useMemo, useRef } from 'react'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import * as THREE from 'three'
import { useReducedMotion } from '../lib/useReducedMotion'
import { useStageActivity } from '../lib/useStageActivity'
import { StageFrame } from './StageScreen'
import { copy } from '../content'

export type CraftSelection = 'overview' | 'orbiter' | 'lander' | 'rover' | 'hopper' | 'match'

const WHITE = '#fafafa'
const QUIET = '#666'
const ORBITER_BODY_HEIGHT = 1.2
const ORBITER_RADIUS = 1.1
const ORBITER_SHALLOW = ORBITER_BODY_HEIGHT * 0.3
const ORBITER_INNER = ORBITER_RADIUS - 0.1
const TANK_RADIUS = 0.15
const TANK_ORBIT = 0.55
const ORBITER_CONE_HEIGHT = 0.575
const ORBITER_CONE_TOP = ORBITER_BODY_HEIGHT + ORBITER_CONE_HEIGHT
const ORBITER_DROP = -2.5
const ORBITER_FOCUS = new THREE.Vector3(0, ORBITER_DROP + (ORBITER_CONE_TOP - 0.5) / 2, 0)
const STACK_TARGET = new THREE.Vector3(0, 2.1, 0)
const STACK_OFFSET = new THREE.Vector3(13.4, 7.6, 16).sub(STACK_TARGET)
const MATCH_X = ORBITER_RADIUS * 0.45
const MATCH_Y = ORBITER_BODY_HEIGHT / 2
const MATCH_LENGTH = 0.265
const MATCH_PULL = 0.9
const matchSurfaceZ = -Math.sqrt(ORBITER_RADIUS ** 2 - MATCH_X ** 2)
const MATCH_SURFACE = new THREE.Vector3(MATCH_X, MATCH_Y, matchSurfaceZ)
const MATCH_RADIAL = new THREE.Vector3(MATCH_X, 0, matchSurfaceZ).normalize()
const MATCH_CENTER = MATCH_RADIAL.clone().multiplyScalar(MATCH_LENGTH / 2)
const MATCH_AIM = new THREE.Quaternion()
  .setFromUnitVectors(new THREE.Vector3(0, 1, 0), MATCH_RADIAL)
  .multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 4))
const MATCH_FOCUS = MATCH_SURFACE.clone().addScaledVector(MATCH_RADIAL, MATCH_PULL).add(MATCH_CENTER)
const LANDER_HALF = 1.3
const LANDER_BOTTOM = 2
const LANDER_TOP = 3.2
const LANDER_SEAT = ORBITER_CONE_TOP - LANDER_BOTTOM
const HOPPER_BASE = LANDER_TOP + 0.17
const SURFACE_SCALE = 0.85
const ROVER_SCALE = 0.7

const Tone = createContext(WHITE)

function Mat({ side }: { side?: THREE.Side }) {
  const color = useContext(Tone)
  return <meshStandardMaterial color={color} roughness={0.82} metalness={0} side={side} />
}

function toneFor(selection: CraftSelection, id: Exclude<CraftSelection, 'overview'>) {
  if (selection === 'overview') return WHITE
  if (selection === 'orbiter' && id === 'match') return WHITE
  return selection === id ? WHITE : QUIET
}

type Vec = [number, number, number]

function Rod({ a, b, radius }: { a: Vec; b: Vec; radius: number }) {
  const start = new THREE.Vector3(...a)
  const end = new THREE.Vector3(...b)
  const delta = end.clone().sub(start)
  const length = delta.length()
  const mid = start.clone().addScaledVector(delta, 0.5)
  const quaternion = new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    delta.normalize(),
  )
  return (
    <mesh position={mid} quaternion={quaternion}>
      <cylinderGeometry args={[radius, radius, Math.max(length, 0.001), 8]} />
      <Mat />
    </mesh>
  )
}

function OrbiterBody() {
  const shell = useMemo(
    () =>
      new THREE.LatheGeometry(
        [
          new THREE.Vector2(ORBITER_RADIUS, 0),
          new THREE.Vector2(ORBITER_RADIUS, ORBITER_BODY_HEIGHT),
          new THREE.Vector2(0, ORBITER_BODY_HEIGHT),
          new THREE.Vector2(0, ORBITER_SHALLOW),
          new THREE.Vector2(ORBITER_INNER, ORBITER_SHALLOW),
          new THREE.Vector2(ORBITER_INNER, 0),
          new THREE.Vector2(ORBITER_RADIUS, 0),
        ],
        48,
      ),
    [],
  )
  return (
    <group>
      <mesh geometry={shell}>
        <Mat side={THREE.DoubleSide} />
      </mesh>
      {Array.from({ length: 4 }, (_, index) => {
        const angle = Math.PI / 4 + (index / 4) * Math.PI * 2
        return (
          <mesh
            key={index}
            position={[
              Math.cos(angle) * TANK_ORBIT,
              ORBITER_SHALLOW / 2,
              Math.sin(angle) * TANK_ORBIT,
            ]}
          >
            <sphereGeometry args={[TANK_RADIUS, 24, 16]} />
            <Mat />
          </mesh>
        )
      })}
      <mesh position={[0, ORBITER_BODY_HEIGHT + ORBITER_CONE_HEIGHT / 2, 0]}>
        <cylinderGeometry args={[0.6, 1.1, ORBITER_CONE_HEIGHT, 48]} />
        <Mat />
      </mesh>
      <mesh position={[0, -0.25, 0]}>
        <cylinderGeometry args={[0.1, 0.3, 0.5, 24]} />
        <Mat />
      </mesh>
      {([-1, 1] as const).map((side) => (
        <group key={side}>
          <mesh position={[side * 1.25, 0.9, 0]}>
            <boxGeometry args={[0.3, 0.05, 0.08]} />
            <Mat />
          </mesh>
          <mesh position={[side * 3.65, 0.9, 0]}>
            <boxGeometry args={[4.5, 0.03, 1.4]} />
            <Mat />
          </mesh>
        </group>
      ))}
    </group>
  )
}

function MatchBody() {
  return (
    <mesh position={MATCH_CENTER} quaternion={MATCH_AIM}>
      <boxGeometry args={[0.145, MATCH_LENGTH, 0.146]} />
      <Mat />
    </mesh>
  )
}

function LanderLegs() {
  const corners: Array<[number, number]> = [
    [1, 1],
    [1, -1],
    [-1, 1],
    [-1, -1],
  ]
  return (
    <>
      {corners.map(([sx, sz]) => {
        const hip: Vec = [sx * 1.15, 2.02, sz * 1.15]
        const reach: Vec = [sx * 1.8, 0.55, sz * 1.8]
        const foot: Vec = [
          hip[0] + (reach[0] - hip[0]) * 0.7,
          hip[1] + (reach[1] - hip[1]) * 0.7,
          hip[2] + (reach[2] - hip[2]) * 0.7,
        ]
        const mid: Vec = [(hip[0] + foot[0]) / 2, (hip[1] + foot[1]) / 2, (hip[2] + foot[2]) / 2]
        const brace: Vec = [sx * 0.85, 1.82, sz * 0.85]
        return (
          <group key={`${sx}${sz}`}>
            <Rod a={hip} b={foot} radius={0.04} />
            <Rod a={brace} b={mid} radius={0.02} />
            <mesh position={foot}>
              <cylinderGeometry args={[0.2, 0.2, 0.06, 20]} />
              <Mat />
            </mesh>
          </group>
        )
      })}
    </>
  )
}

function LanderHull() {
  const geometry = useMemo(() => {
    const half = LANDER_HALF
    const cut = 0.42
    const shape = new THREE.Shape()
    shape.moveTo(-half + cut, -half)
    shape.lineTo(half - cut, -half)
    shape.lineTo(half, -half + cut)
    shape.lineTo(half, half - cut)
    shape.lineTo(half - cut, half)
    shape.lineTo(-half + cut, half)
    shape.lineTo(-half, half - cut)
    shape.lineTo(-half, -half + cut)
    shape.closePath()
    const hull = new THREE.ExtrudeGeometry(shape, { depth: 1.2, bevelEnabled: false })
    hull.translate(0, 0, -0.6)
    hull.rotateX(Math.PI / 2)
    return hull
  }, [])

  return (
    <mesh position={[0, 2.6, 0]} geometry={geometry}>
      <Mat />
    </mesh>
  )
}

function LanderBody() {
  return (
    <group>
      <LanderHull />
      <mesh position={[0, LANDER_BOTTOM - 0.3, 0]}>
        <cylinderGeometry args={[0.12, 0.35, 0.6, 20]} />
        <Mat />
      </mesh>
      <LanderLegs />
      <mesh position={[0, 2.6, -(LANDER_HALF + 0.12)]}>
        <boxGeometry args={[1.8, 2, 0.03]} />
        <Mat />
      </mesh>
    </group>
  )
}

function RoverBody() {
  const stations = [-0.55, 0, 0.55]
  return (
    <group>
      <mesh position={[0, 0.55, 0]}>
        <boxGeometry args={[1, 0.5, 1.5]} />
        <Mat />
      </mesh>
      {stations.flatMap((z) =>
        ([-1, 1] as const).map((side) => {
          const hub: Vec = [side * 0.74, 0.15, z]
          const root: Vec = [side * 0.5, 0.42, z]
          return (
            <group key={`${side}-${z}`}>
              <mesh position={hub} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.15, 0.15, 0.12, 18]} />
                <Mat />
              </mesh>
              <Rod a={root} b={hub} radius={0.02} />
            </group>
          )
        }),
      )}
      <mesh position={[0.28, 1.05, -0.7]}>
        <cylinderGeometry args={[0.012, 0.012, 0.3, 8]} />
        <Mat />
      </mesh>
    </group>
  )
}

function HopperBody() {
  return (
    <group>
      <mesh position={[0, 0.21, 0]}>
        <cylinderGeometry args={[0.54, 0.54, 0.42, 6]} />
        <Mat />
      </mesh>
      <mesh position={[0, -0.075, 0]}>
        <cylinderGeometry args={[0.06, 0.18, 0.15, 16]} />
        <Mat />
      </mesh>
      {Array.from({ length: 6 }, (_, index) => {
        const angle = (index / 6) * Math.PI * 2
        const c = Math.cos(angle)
        const s = Math.sin(angle)
        const hip: Vec = [c * 0.48, 0.108, s * 0.48]
        const knee: Vec = [c * 0.696, 0.372, s * 0.696]
        const foot: Vec = [c * 0.552, 0.012, s * 0.552]
        return (
          <group key={angle}>
            <Rod a={hip} b={knee} radius={0.02} />
            <mesh position={knee}>
              <sphereGeometry args={[0.05, 14, 14]} />
              <Mat />
            </mesh>
            <Rod a={knee} b={foot} radius={0.02} />
            <mesh position={foot} rotation={[Math.PI / 2, 0, angle]}>
              <cylinderGeometry args={[0.09, 0.09, 0.02, 14]} />
              <Mat />
            </mesh>
          </group>
        )
      })}
      <mesh position={[0, 0.432, -0.408]}>
        <boxGeometry args={[0.096, 0.096, 0.096]} />
        <Mat />
      </mesh>
      <mesh position={[0, 0.63, -0.504]}>
        <boxGeometry args={[0.96, 0.36, 0.024]} />
        <Mat />
      </mesh>
      <mesh position={[0.24, 0.57, 0]}>
        <cylinderGeometry args={[0.01, 0.01, 0.15, 8]} />
        <Mat />
      </mesh>
    </group>
  )
}

function damp(current: number, target: number, delta: number, reduced: boolean) {
  if (reduced) return target
  return current + (target - current) * (1 - Math.exp(-delta * 7))
}

function Assembly({ selection, reduced }: { selection: CraftSelection; reduced: boolean }) {
  const orbiter = useRef<THREE.Group>(null)
  const lander = useRef<THREE.Group>(null)
  const rover = useRef<THREE.Group>(null)
  const hopper = useRef<THREE.Group>(null)
  const match = useRef<THREE.Group>(null)
  const offsets = useRef({ orbiter: 0, lander: 0, rover: 0, hopper: 0, match: 0 })

  useFrame((_, delta) => {
    const next = offsets.current
    next.orbiter = damp(next.orbiter, selection === 'orbiter' ? ORBITER_DROP : 0, delta, reduced)
    next.lander = damp(next.lander, selection === 'lander' ? 2.6 : 0, delta, reduced)
    next.rover = damp(next.rover, selection === 'rover' ? 1.6 : 0, delta, reduced)
    next.hopper = damp(next.hopper, selection === 'hopper' ? 1.7 : 0, delta, reduced)
    next.match = damp(next.match, selection === 'match' ? MATCH_PULL : 0, delta, reduced)
    if (orbiter.current) orbiter.current.position.y = next.orbiter
    if (lander.current) lander.current.position.y = LANDER_SEAT + next.lander
    if (rover.current) rover.current.position.z = LANDER_HALF + 0.82 + next.rover
    if (hopper.current) hopper.current.position.y = HOPPER_BASE + next.hopper
    if (match.current) {
      match.current.position.copy(MATCH_SURFACE).addScaledVector(MATCH_RADIAL, next.match)
    }
  })

  return (
    <group>
      <Tone.Provider value={toneFor(selection, 'orbiter')}>
        <group ref={orbiter}>
          <OrbiterBody />
          <Tone.Provider value={toneFor(selection, 'match')}>
            <group ref={match} position={MATCH_SURFACE}>
              <MatchBody />
            </group>
          </Tone.Provider>
        </group>
      </Tone.Provider>

      <group ref={lander} position={[0, LANDER_SEAT, 0]}>
        <group position={[0, LANDER_BOTTOM, 0]} scale={SURFACE_SCALE}>
          <group position={[0, -LANDER_BOTTOM, 0]}>
            <Tone.Provider value={toneFor(selection, 'lander')}>
              <LanderBody />
            </Tone.Provider>
            <Tone.Provider value={toneFor(selection, 'rover')}>
              <group ref={rover} position={[0, 2.6, LANDER_HALF + 0.82]}>
                <group rotation={[-Math.PI / 2, 0, 0]}>
                  <group position={[0, 0.8, 0]} scale={ROVER_SCALE}>
                    <group position={[0, -0.8, 0]}>
                      <RoverBody />
                    </group>
                  </group>
                </group>
              </group>
            </Tone.Provider>
            <Tone.Provider value={toneFor(selection, 'hopper')}>
              <group ref={hopper} position={[0, HOPPER_BASE, 0]}>
                <HopperBody />
              </group>
            </Tone.Provider>
          </group>
        </group>
      </group>
    </group>
  )
}

function CameraRig({ selection, reduced }: { selection: CraftSelection; reduced: boolean }) {
  const { camera } = useThree()
  const controls = useThree((state) => state.controls) as OrbitControlsImpl | null
  const blend = useRef(1)
  const goal = useMemo(() => {
    if (selection === 'match') {
      return {
        position: MATCH_FOCUS.clone().add(new THREE.Vector3(1.15, 0.32, -1.05)),
        target: MATCH_FOCUS.clone(),
      }
    }
    if (selection === 'orbiter') {
      return {
        position: ORBITER_FOCUS.clone().add(STACK_OFFSET),
        target: ORBITER_FOCUS.clone(),
      }
    }
    return {
      position: STACK_TARGET.clone().add(STACK_OFFSET),
      target: STACK_TARGET.clone(),
    }
  }, [selection])

  useEffect(() => {
    blend.current = reduced ? 0 : 1
    if (reduced) {
      camera.position.copy(goal.position)
      if (controls) {
        controls.target.copy(goal.target)
        controls.update()
      }
    }
  }, [camera, controls, goal, reduced])

  useFrame((_, delta) => {
    if (!controls || blend.current <= 0) return
    const step = 1 - Math.exp(-delta * 4)
    camera.position.lerp(goal.position, step)
    controls.target.lerp(goal.target, step)
    controls.update()
    blend.current = Math.max(0, blend.current - delta / 0.85)
  })

  return (
    <OrbitControls
      makeDefault
      enablePan={false}
      enableDamping={!reduced}
      dampingFactor={0.08}
      minDistance={0.45}
      maxDistance={28}
      onStart={() => {
        blend.current = 0
      }}
    />
  )
}

function Scene({ selection, reduced }: { selection: CraftSelection; reduced: boolean }) {
  return (
    <>
      <color attach="background" args={['#000000']} />
      <hemisphereLight args={['#eef3fb', '#05060a', 0.7]} />
      <ambientLight intensity={0.22} />
      <directionalLight position={[7, 10, 6]} intensity={1.45} />
      <directionalLight position={[-6, 3, -4]} intensity={0.35} />
      <CameraRig selection={selection} reduced={reduced} />
      <Assembly selection={selection} reduced={reduced} />
    </>
  )
}

const FRAME_LABEL = copy.change7.frames

export function CraftView({ selection }: { selection: CraftSelection }) {
  const reduced = useReducedMotion()
  const { ref, seen, shown } = useStageActivity<HTMLDivElement>()

  return (
    <div ref={ref} className="craft-view">
      <StageFrame className="craft-frame" screen={false}>
        <div className="craft-canvas" role="img" aria-label={FRAME_LABEL[selection]}>
          {seen ? (
            <Canvas
              frameloop={shown ? 'always' : 'demand'}
              dpr={[1, 1.5]}
              camera={{ fov: 32, near: 0.05, far: 80, position: [10.5, 6.4, 12.5] }}
              gl={{ antialias: true, alpha: false, powerPreference: 'default' }}
              style={{ position: 'absolute', inset: 0, touchAction: 'none' }}
              onCreated={({ gl }) => {
                gl.toneMapping = THREE.ACESFilmicToneMapping
                gl.toneMappingExposure = 1.08
                gl.setClearColor('#000000', 1)
              }}
            >
              <Scene selection={selection} reduced={reduced} />
            </Canvas>
          ) : null}
        </div>
      </StageFrame>
    </div>
  )
}
