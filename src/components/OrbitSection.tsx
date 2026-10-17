import { OrbitControls } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type MutableRefObject } from 'react'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import * as THREE from 'three'
import moonColorUrl from '../assets/moon/lroc-color.jpg?url'
import { orbitRadiusKm, orbitScene, slantToSurface } from '../lib/orbit'
import { useReducedMotion } from '../lib/useReducedMotion'
import { useStageActivity } from '../lib/useStageActivity'
import { hasWebGL } from '../lib/webgl'
import { StageFrame } from './StageScreen'

const HALF = (orbitScene.coneHalfAngleDeg * Math.PI) / 180
const INCL = (orbitScene.inclinationDeg * Math.PI) / 180
const INITIAL = (55 * Math.PI) / 180
const MOON = orbitScene.moonRadiusKm
const RIM = 12

type Motion = {
  playing: boolean
  cones: boolean
  closeUp: boolean
  anomaly: number
  intro: number
  reduced: boolean
  visible: boolean
  pulse: number
}

type FleetCraft = {
  kind: 'moon' | 'space'
  gamma: number
  azimuth: number
  phase: number
  speed: number
  last: number
}

const FLEET: FleetCraft[] = [
  { kind: 'moon', gamma: HALF * 0.28, azimuth: 0.5, phase: 0.08, speed: 0.11, last: 0.08 },
  { kind: 'moon', gamma: HALF * 0.62, azimuth: 2.5, phase: 0.42, speed: 0.09, last: 0.42 },
  { kind: 'moon', gamma: HALF * 0.84, azimuth: 4.4, phase: 0.7, speed: 0.13, last: 0.7 },
  { kind: 'space', gamma: HALF * 0.32, azimuth: 1.1, phase: 0.18, speed: 0.1, last: 0.18 },
  { kind: 'space', gamma: HALF * 0.7, azimuth: 3.2, phase: 0.5, speed: 0.08, last: 0.5 },
  { kind: 'space', gamma: HALF * 0.48, azimuth: 5.3, phase: 0.78, speed: 0.12, last: 0.78 },
]

export function OrbitSection() {
  const reduced = useReducedMotion()
  const webgl = useMemo(() => hasWebGL(), [])
  const { ref: sectionRef, shown: visible, seen } = useStageActivity<HTMLElement>()
  const tags = useRef<Record<string, HTMLSpanElement | null>>({})
  const [playing, setPlaying] = useState(!reduced)
  const [cones, setCones] = useState(true)
  const [closeUp, setCloseUp] = useState(false)
  const [resetToken, setResetToken] = useState(0)
  const motion = useRef<Motion>({
    playing: !reduced,
    cones: true,
    closeUp: false,
    anomaly: INITIAL,
    intro: reduced ? 1 : 0,
    reduced,
    visible: false,
    pulse: 0,
  })

  motion.current.playing = playing
  motion.current.cones = cones
  motion.current.closeUp = closeUp
  motion.current.reduced = reduced
  motion.current.visible = visible
  if (reduced) motion.current.intro = 1

  useEffect(() => {
    if (!reduced) return
    motion.current.playing = false
    motion.current.intro = 1
    setPlaying(false)
  }, [reduced])

  function togglePlay() {
    setPlaying((value) => !value)
  }

  function resetView() {
    motion.current.closeUp = false
    setCloseUp(false)
    setResetToken((value) => value + 1)
  }

  function toggleClose() {
    setCloseUp((value) => !value)
    setResetToken((value) => value + 1)
  }

  return (
    <section className="orbit-block" ref={sectionRef} aria-label="Where MATCH observes">
      <div className="orbit-layout">
        {webgl ? (
          <StageFrame className="stage orbit-stage">
            {seen ? <OrbitCanvas motion={motion} resetToken={resetToken} tags={tags} /> : null}
            <div className="orbit-tags">
              <span ref={(node) => { tags.current.moon = node }}>Moon</span>
              <span ref={(node) => { tags.current.craft = node }}>CE-7 MATCH</span>
            </div>
            <div className="orbit-bar">
              <button type="button" onClick={togglePlay} aria-pressed={playing}>
                {playing ? 'Pause' : 'Play'}
              </button>
              <button type="button" onClick={resetView}>
                Reset view
              </button>
              <button type="button" onClick={() => setCones((value) => !value)} aria-pressed={cones}>
                Show viewing cones
              </button>
              <button type="button" onClick={toggleClose} aria-pressed={closeUp}>
                Close-up
              </button>
            </div>
          </StageFrame>
        ) : (
          <OrbitStill />
        )}

        <div className="orbit-copy">
          <p className="kicker">Around the Moon</p>
          <h2>One instrument. Two views.</h2>
          <p>
            From approximately 200 kilometres above the Moon, MATCH observes particles arriving from space and
            particles emerging from the lunar surface through two opposing viewing directions.
          </p>
          <p className="note">
            The path is a schematic near-polar circle, not the reconstructed mission trajectory. The cone angle is
            illustrative. It is not MATCH’s verified acceptance angle.
          </p>
          <p className="note">
            Particles leaving the surface stand in for Lunar Albedo, which emerges after interactions with lunar
            material. A cone shows viewing geometry. It does not mean every particle inside it is detected, or that
            arrival direction by itself identifies the source.
          </p>
          <p className="note">
            Lunar surface color from the CGI Moon Kit, NASA Scientific Visualization Studio.
          </p>
          <ul className="legend orbit-legend">
            <li>
              <span className="swatch craft" /> CE-7 MATCH
            </li>
            <li>
              <span className="swatch moon" /> Moon-facing view
            </li>
            <li>
              <span className="swatch space" /> Space-facing view
            </li>
          </ul>
        </div>
      </div>
      <p className="orbit-finish">
        Two viewing directions provide complementary measurements of the particle environment around the Moon.
      </p>
    </section>
  )
}

function OrbitStill() {
  return (
    <div className="stage orbit-stage orbit-still" role="img" aria-label="Illustrative diagram of MATCH in a near-polar orbit, looking toward the Moon and toward space">
      <svg viewBox="0 0 640 640">
        <circle cx="300" cy="320" r="168" fill="#c5c8ce" />
        <ellipse cx="300" cy="320" rx="78" ry="214" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.25" />
        <circle cx="300" cy="132" r="5" fill="#fff" />
        <path d="M300 132 L268 168 L332 168 Z" fill="rgba(143,227,207,0.28)" stroke="#8fe3cf" strokeWidth="1" />
        <path d="M300 132 L274 78 L326 78 Z" fill="rgba(127,208,238,0.22)" stroke="#7fd0ee" strokeWidth="1" />
        <text x="248" y="520" fill="#f4f4f5" fontSize="14" fontFamily="Poppins, sans-serif">Moon</text>
        <text x="316" y="128" fill="#f4f4f5" fontSize="13" fontFamily="Poppins, sans-serif">CE-7 MATCH</text>
      </svg>
    </div>
  )
}

function OrbitCanvas({
  motion,
  resetToken,
  tags,
}: {
  motion: MutableRefObject<Motion>
  resetToken: number
  tags: MutableRefObject<Record<string, HTMLSpanElement | null>>
}) {
  const start = useMemo(() => overviewPose(), [])
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ fov: 30, near: 1, far: 40000, position: start.position.toArray() }}
      gl={{ antialias: true, alpha: false, stencil: false, powerPreference: 'default' }}
      style={{ position: 'absolute', inset: 0, touchAction: 'none' }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping
        gl.toneMappingExposure = 1.05
        gl.setClearColor('#000000', 1)
      }}
    >
      <color attach="background" args={['#000000']} />
      <hemisphereLight args={['#e7eef8', '#07080c', 0.55]} />
      <ambientLight intensity={0.16} />
      <directionalLight position={[5600, 900, -2400]} intensity={3.4} color="#f7f8fb" />
      <Simulation motion={motion} tags={tags} />
      <CameraRig motion={motion} resetToken={resetToken} home={start} />
    </Canvas>
  )
}

function Simulation({
  motion,
  tags,
}: {
  motion: MutableRefObject<Motion>
  tags: MutableRefObject<Record<string, HTMLSpanElement | null>>
}) {
  const moonMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#c5c8ce',
        roughness: 0.96,
        metalness: 0,
        transparent: true,
      }),
    [],
  )
  const gl = useThree((state) => state.gl)

  useEffect(() => {
    const loader = new THREE.TextureLoader()
    let alive = true
    let texture: THREE.Texture | null = null
    loader.load(moonColorUrl, (loaded) => {
      if (!alive) {
        loaded.dispose()
        return
      }
      texture = loaded
      loaded.colorSpace = THREE.SRGBColorSpace
      loaded.anisotropy = gl.capabilities.getMaxAnisotropy()
      loaded.wrapS = THREE.RepeatWrapping
      moonMat.map = loaded
      moonMat.color.set('#ffffff')
      moonMat.needsUpdate = true
    })
    return () => {
      alive = false
      moonMat.map = null
      moonMat.color.set('#c5c8ce')
      moonMat.needsUpdate = true
      texture?.dispose()
    }
  }, [gl, moonMat])
  const orbitLine = useMemo(() => makeOrbit(), [])
  const moonCone = useMemo(() => makeVolume(moonAxial(), true, orbitScene.moonFacing), [])
  const spaceCone = useMemo(() => makeVolume(orbitScene.spaceConeLengthKm, false, orbitScene.spaceFacing), [])
  const moonSpokes = useMemo(() => makeSegments(RIM, orbitScene.moonFacing), [])
  const spaceSpokes = useMemo(() => makeSegments(RIM, orbitScene.spaceFacing), [])
  const footprint = useMemo(() => makeLoop(72, orbitScene.moonFacing), [])
  const spaceRim = useMemo(() => makeLoop(RIM, orbitScene.spaceFacing), [])
  const altitude = useMemo(() => makeSegments(1, '#ffffff'), [])
  const craftDot = useMemo(() => makeDot('#ffffff', 7), [])
  const pulseDot = useMemo(() => makeDot('#ffffff', 8), [])
  const trails = useMemo(
    () => FLEET.map((item) => makeSegments(1, item.kind === 'moon' ? orbitScene.moonFacing : orbitScene.spaceFacing)),
    [],
  )
  const dots = useMemo(
    () => FLEET.map((item) => makeDot(item.kind === 'moon' ? orbitScene.moonFacing : orbitScene.spaceFacing, 4.5)),
    [],
  )
  const fleet = useRef(FLEET.map((item) => ({ ...item })))
  const camera = useThree((state) => state.camera)
  const size = useThree((state) => state.size)

  useFrame((_, delta) => {
    const state = motion.current
    const step = Math.min(delta, 0.05)
    if (state.visible && state.intro < 1) state.intro = Math.min(1, state.intro + step / 2.7)
    if (state.visible && state.playing) {
      state.anomaly = (state.anomaly + (orbitScene.degreesPerSecond * step * Math.PI) / 180) % (Math.PI * 2)
    }

    const moonFade = fade(state.intro, 0, 0.34)
    const craftFade = fade(state.intro, 0.28, 0.58)
    const coneFade = fade(state.intro, 0.52, 0.88) * (state.cones ? 1 : 0)
    moonMat.opacity = moonFade
    moonMat.depthWrite = moonFade > 0.98
    setOpacity(orbitLine.material, 0.62 * moonFade)

    spacecraftInto(state.anomaly, craftV)
    radialV.copy(craftV).normalize()
    nadirV.copy(radialV).negate()

    moonCone.mesh.position.copy(craftV)
    moonCone.mesh.quaternion.setFromUnitVectors(DOWN, nadirV)
    spaceCone.mesh.position.copy(craftV)
    spaceCone.mesh.quaternion.setFromUnitVectors(DOWN, radialV)
    moonCone.material.uniforms.opacity.value = 0.2 * coneFade
    spaceCone.material.uniforms.opacity.value = 0.16 * coneFade

    writeSpokes(moonSpokes, craftV, nadirV, HALF, true)
    writeSpokes(spaceSpokes, craftV, radialV, HALF, false)
    writeLoop(footprint, craftV, nadirV, HALF, true)
    writeLoop(spaceRim, craftV, radialV, HALF, false)
    setOpacity(moonSpokes.material, 0.7 * coneFade)
    setOpacity(spaceSpokes.material, 0.55 * coneFade)
    setOpacity(footprint.material, 0.85 * coneFade)
    setOpacity(spaceRim.material, 0.55 * coneFade)

    surfaceV.copy(radialV).multiplyScalar(MOON)
    const gap = altitude.geometry.getAttribute('position') as THREE.BufferAttribute
    gap.setXYZ(0, surfaceV.x, surfaceV.y, surfaceV.z)
    gap.setXYZ(1, craftV.x, craftV.y, craftV.z)
    gap.needsUpdate = true
    setOpacity(altitude.material, 0.45 * craftFade)

    setPoint(craftDot, craftV, craftFade)
    state.pulse *= Math.exp(-step * 3.4)
    const pulseMat = pulseDot.material as THREE.PointsMaterial
    pulseMat.size = 8 + state.pulse * 18
    setPoint(pulseDot, craftV, state.pulse * coneFade * 0.8)

    layoutTags(tags.current, camera, size.width, size.height, craftV, moonFade, craftFade)

    fleet.current.forEach((item, index) => {
      if (state.visible && state.playing) item.phase = (item.phase + step * item.speed * 3) % 1
      const progress = item.phase
      if (state.playing && item.last > 0.92 && progress < item.last && coneFade > 0.4) state.pulse = 1
      item.last = progress
      const aimAxis = item.kind === 'moon' ? nadirV : radialV
      setBasis(aimAxis)
      aim(aimAxis, item.gamma, item.azimuth, dir)
      const trail = trails[index]
      const attr = trail.geometry.getAttribute('position') as THREE.BufferAttribute
      const head = sample(item.kind, craftV, dir, progress, item.gamma, headV)
      const tail = sample(item.kind, craftV, dir, Math.max(0, progress - 0.16), item.gamma, tailV)
      attr.setXYZ(0, tail.x, tail.y, tail.z)
      attr.setXYZ(1, head.x, head.y, head.z)
      attr.needsUpdate = true
      setOpacity(trail.material, 0.8 * coneFade)
      setPoint(dots[index], head, coneFade)
    })
  })

  return (
    <group>
      <mesh material={moonMat}>
        <sphereGeometry args={[MOON, 96, 64]} />
      </mesh>
      <primitive object={orbitLine} />
      <primitive object={moonCone.mesh} />
      <primitive object={spaceCone.mesh} />
      <primitive object={moonSpokes} />
      <primitive object={spaceSpokes} />
      <primitive object={footprint} />
      <primitive object={spaceRim} />
      <primitive object={altitude} />
      <primitive object={craftDot} />
      <primitive object={pulseDot} />
      {trails.map((line, index) => (
        <primitive key={index} object={line} />
      ))}
      {dots.map((dot, index) => (
        <primitive key={index} object={dot} />
      ))}
    </group>
  )
}

function CameraRig({
  motion,
  resetToken,
  home,
}: {
  motion: MutableRefObject<Motion>
  resetToken: number
  home: { position: THREE.Vector3; target: THREE.Vector3 }
}) {
  const camera = useThree((state) => state.camera) as THREE.PerspectiveCamera
  const controls = useRef<OrbitControlsImpl>(null)
  const anim = useRef<{
    fromP: THREE.Vector3
    toP: THREE.Vector3
    fromT: THREE.Vector3
    toT: THREE.Vector3
    u: number
  } | null>(null)
  const signature = useRef('')
  const riding = useRef(false)

  useLayoutEffect(() => {
    camera.position.copy(home.position)
    camera.lookAt(home.target)
    camera.updateProjectionMatrix()
  }, [camera, home])

  useFrame((_, delta) => {
    const live = controls.current
    if (!live) return
    const state = motion.current
    const next = `${state.closeUp}:${resetToken}`
    live.minDistance = state.closeUp ? 36 : orbitRadiusKm * 0.18
    live.maxDistance = state.closeUp ? orbitRadiusKm * 2.4 : orbitRadiusKm * 6.5
    if (signature.current !== next) {
      signature.current = next
      riding.current = false
      const pose = state.closeUp ? closePose(state.anomaly) : home
      if (state.reduced) {
        camera.position.copy(pose.position)
        live.target.copy(pose.target)
        live.update()
        anim.current = null
        riding.current = state.closeUp
      } else {
        anim.current = {
          fromP: camera.position.clone(),
          toP: pose.position.clone(),
          fromT: live.target.clone(),
          toT: pose.target.clone(),
          u: 0,
        }
      }
    } else if (state.closeUp && riding.current && !anim.current) {
      spacecraftInto(state.anomaly, closeCraft)
      camera.position.add(closeShift.subVectors(closeCraft, live.target))
      live.target.copy(closeCraft)
    }

    if (!anim.current) return
    anim.current.u = Math.min(1, anim.current.u + delta / 0.9)
    const k = 1 - (1 - anim.current.u) ** 3
    camera.position.lerpVectors(anim.current.fromP, anim.current.toP, k)
    live.target.lerpVectors(anim.current.fromT, anim.current.toT, k)
    live.update()
    if (anim.current.u >= 1) {
      anim.current = null
      if (state.closeUp) {
        spacecraftInto(state.anomaly, closeCraft)
        live.target.copy(closeCraft)
        riding.current = true
      }
    }
  })

  return (
    <OrbitControls
      ref={controls}
      enablePan={false}
      enableDamping
      dampingFactor={0.08}
      rotateSpeed={0.65}
      zoomSpeed={0.7}
      minDistance={orbitRadiusKm * 0.18}
      maxDistance={orbitRadiusKm * 6.5}
      onStart={() => {
        if (!motion.current.closeUp) return
        anim.current = null
        const live = controls.current
        if (!live) return
        spacecraftInto(motion.current.anomaly, closeCraft)
        camera.position.add(closeShift.subVectors(closeCraft, live.target))
        live.target.copy(closeCraft)
        riding.current = true
      }}
    />
  )
}

const DOWN = new THREE.Vector3(0, -1, 0)
const UP = new THREE.Vector3(0, 1, 0)
const AXIS_X = new THREE.Vector3(1, 0, 0)
const dir = new THREE.Vector3()
const perpA = new THREE.Vector3()
const perpB = new THREE.Vector3()
const headV = new THREE.Vector3()
const tailV = new THREE.Vector3()
const basisHelper = new THREE.Vector3()
const craftV = new THREE.Vector3()
const radialV = new THREE.Vector3()
const nadirV = new THREE.Vector3()
const surfaceV = new THREE.Vector3()
const MOON_AXIAL = slantToSurface(orbitRadiusKm, MOON, HALF) * Math.cos(HALF) + 18

function spacecraftInto(anomaly: number, target: THREE.Vector3) {
  const s = Math.sin(INCL)
  const c = Math.cos(INCL)
  return target.set(
    orbitRadiusKm * Math.cos(anomaly),
    orbitRadiusKm * Math.sin(anomaly) * s,
    orbitRadiusKm * Math.sin(anomaly) * c,
  )
}

function overviewPose() {
  return {
    position: new THREE.Vector3(0.78, 0.62, 1.05).normalize().multiplyScalar(orbitRadiusKm * 5.35),
    target: new THREE.Vector3(0, -orbitRadiusKm * 0.16, 0),
  }
}

const closeShift = new THREE.Vector3()
const closeCraft = new THREE.Vector3()
const closeRadial = new THREE.Vector3()
const closeSide = new THREE.Vector3()
const closePos = new THREE.Vector3()
const closeTarget = new THREE.Vector3()

function closePose(anomaly: number) {
  spacecraftInto(anomaly, closeCraft)
  closeRadial.copy(closeCraft).normalize()
  closeSide.crossVectors(closeRadial, UP)
  if (closeSide.lengthSq() < 1e-4) closeSide.crossVectors(closeRadial, AXIS_X)
  closeSide.normalize()
  closeTarget.copy(closeCraft)
  closePos
    .copy(closeCraft)
    .addScaledVector(closeSide, orbitScene.altitudeKm * 1.65)
    .addScaledVector(closeRadial, orbitScene.altitudeKm * 0.28)
  return { position: closePos, target: closeTarget }
}

function fade(t: number, a: number, b: number) {
  const x = Math.min(1, Math.max(0, (t - a) / (b - a)))
  return x * x * (3 - 2 * x)
}

const proj = new THREE.Vector3()
const limbV = new THREE.Vector3()
const camRight = new THREE.Vector3()

function screenPoint(anchor: THREE.Vector3, camera: THREE.Camera, width: number, height: number) {
  proj.copy(anchor).project(camera)
  return {
    x: (proj.x * 0.5 + 0.5) * width,
    y: (-proj.y * 0.5 + 0.5) * height,
  }
}

function layoutTags(
  tags: Record<string, HTMLSpanElement | null>,
  camera: THREE.Camera,
  width: number,
  height: number,
  craft: THREE.Vector3,
  moonFade: number,
  craftFade: number,
) {
  const top = 42
  const bottom = height - 78
  camRight.setFromMatrixColumn(camera.matrixWorld, 0)
  limbV.copy(camRight).multiplyScalar(-MOON)
  const limb = screenPoint(limbV, camera, width, height)
  const moon = tags.moon
  if (moon) {
    moon.style.opacity = String(moonFade)
    const w = moon.offsetWidth || 40
    moon.style.transform = `translate(${Math.round(Math.max(10, limb.x - w - 12))}px, ${Math.round(Math.min(Math.max(limb.y - 10, top), bottom - 20))}px)`
  }

  const craftEl = tags.craft
  if (!craftEl) return
  const point = screenPoint(craft, camera, width, height)
  const labelWidth = craftEl.offsetWidth || 140
  let x = point.x + 14
  if (width - x < labelWidth + 12) x = point.x - labelWidth - 14
  x = Math.min(Math.max(x, 10), width - labelWidth - 10)
  const y = Math.min(Math.max(point.y - 24, top), bottom - 20)
  craftEl.style.opacity = String(craftFade)
  craftEl.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`
}

function setBasis(axis: THREE.Vector3) {
  basisHelper.set(Math.abs(axis.y) > 0.92 ? 1 : 0, Math.abs(axis.y) > 0.92 ? 0 : 1, 0)
  perpA.crossVectors(axis, basisHelper).normalize()
  perpB.crossVectors(axis, perpA).normalize()
}

function aim(axis: THREE.Vector3, angle: number, azimuth: number, target: THREE.Vector3) {
  target.copy(axis).multiplyScalar(Math.cos(angle))
  target.addScaledVector(perpA, Math.sin(angle) * Math.cos(azimuth))
  target.addScaledVector(perpB, Math.sin(angle) * Math.sin(azimuth))
}

function sample(
  kind: 'moon' | 'space',
  craft: THREE.Vector3,
  direction: THREE.Vector3,
  amount: number,
  gamma: number,
  target: THREE.Vector3,
) {
  const reach = kind === 'moon' ? slantToSurface(orbitRadiusKm, MOON, gamma) : orbitScene.spaceConeLengthKm
  return target.copy(craft).addScaledVector(direction, reach * (1 - amount))
}

function moonAxial() {
  return MOON_AXIAL
}

function makeVolume(height: number, clip: boolean, color: string) {
  const radius = Math.tan(HALF) * height
  const geometry = new THREE.ConeGeometry(radius, height, 64, 1, true)
  geometry.translate(0, -height / 2, 0)
  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    toneMapped: false,
    uniforms: {
      tint: { value: new THREE.Color(color) },
      opacity: { value: 0 },
      moonRadius: { value: MOON },
      coneHeight: { value: height },
      clipMoon: { value: clip ? 1 : 0 },
    },
    vertexShader: `
      varying vec3 vWorld;
      varying float vAlong;
      uniform float coneHeight;
      void main() {
        vec4 world = modelMatrix * vec4(position, 1.0);
        vWorld = world.xyz;
        vAlong = clamp(-position.y / coneHeight, 0.0, 1.0);
        gl_Position = projectionMatrix * viewMatrix * world;
      }
    `,
    fragmentShader: `
      varying vec3 vWorld;
      varying float vAlong;
      uniform vec3 tint;
      uniform float opacity;
      uniform float moonRadius;
      uniform float clipMoon;
      void main() {
        if (clipMoon > 0.5 && length(vWorld) < moonRadius) discard;
        gl_FragColor = vec4(tint, opacity * mix(1.0, 0.32, vAlong));
      }
    `,
  })
  const mesh = new THREE.Mesh(geometry, material)
  mesh.renderOrder = 2
  mesh.frustumCulled = false
  return { mesh, material }
}

function makeOrbit() {
  const count = 256
  const s = Math.sin(INCL)
  const c = Math.cos(INCL)
  const positions = new Float32Array(count * 3)
  for (let i = 0; i < count; i += 1) {
    const angle = (i / count) * Math.PI * 2
    positions[i * 3] = orbitRadiusKm * Math.cos(angle)
    positions[i * 3 + 1] = orbitRadiusKm * Math.sin(angle) * s
    positions[i * 3 + 2] = orbitRadiusKm * Math.sin(angle) * c
  }
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  const material = new THREE.LineBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0, toneMapped: false })
  const line = new THREE.LineLoop(geometry, material)
  line.frustumCulled = false
  return line
}

function makeSegments(count: number, color: string) {
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 2 * 3), 3))
  const material = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0, depthWrite: false, toneMapped: false })
  const line = new THREE.LineSegments(geometry, material)
  line.frustumCulled = false
  line.renderOrder = 3
  return line
}

function makeLoop(count: number, color: string) {
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3))
  const material = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0, depthWrite: false, toneMapped: false })
  const line = new THREE.LineLoop(geometry, material)
  line.frustumCulled = false
  line.renderOrder = 3
  return line
}

const circleMap = makeCircleMap()

function makeCircleMap() {
  const canvas = document.createElement('canvas')
  canvas.width = 64
  canvas.height = 64
  const context = canvas.getContext('2d')
  if (!context) return new THREE.Texture()
  context.clearRect(0, 0, 64, 64)
  context.beginPath()
  context.arc(32, 32, 30, 0, Math.PI * 2)
  context.fillStyle = '#ffffff'
  context.fill()
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

function makeDot(color: string, size: number) {
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(3), 3))
  const material = new THREE.PointsMaterial({
    color,
    map: circleMap,
    size,
    sizeAttenuation: false,
    transparent: true,
    alphaTest: 0.45,
    opacity: 0,
    depthWrite: false,
    toneMapped: false,
  })
  const points = new THREE.Points(geometry, material)
  points.frustumCulled = false
  points.renderOrder = 4
  return points
}

function setOpacity(material: THREE.Material | THREE.Material[], opacity: number) {
  const item = Array.isArray(material) ? material[0] : material
  if ('opacity' in item) item.opacity = opacity
}

function setPoint(points: THREE.Points, position: THREE.Vector3, opacity: number) {
  const attr = points.geometry.getAttribute('position') as THREE.BufferAttribute
  attr.setXYZ(0, position.x, position.y, position.z)
  attr.needsUpdate = true
  const material = points.material as THREE.PointsMaterial
  material.opacity = opacity
}

const spokeEnd = new THREE.Vector3()

function writeSpokes(line: THREE.LineSegments, craft: THREE.Vector3, axis: THREE.Vector3, angle: number, clip: boolean) {
  setBasis(axis)
  const attr = line.geometry.getAttribute('position') as THREE.BufferAttribute
  for (let i = 0; i < RIM; i += 1) {
    aim(axis, angle, (i / RIM) * Math.PI * 2, dir)
    if (clip) onSurface(craft, dir, spokeEnd)
    else spokeEnd.copy(craft).addScaledVector(dir, orbitScene.spaceConeLengthKm)
    attr.setXYZ(i * 2, craft.x, craft.y, craft.z)
    attr.setXYZ(i * 2 + 1, spokeEnd.x, spokeEnd.y, spokeEnd.z)
  }
  attr.needsUpdate = true
}

function writeLoop(loop: THREE.LineLoop, craft: THREE.Vector3, axis: THREE.Vector3, angle: number, clip: boolean) {
  setBasis(axis)
  const attr = loop.geometry.getAttribute('position') as THREE.BufferAttribute
  const count = attr.count
  for (let i = 0; i < count; i += 1) {
    aim(axis, angle, (i / count) * Math.PI * 2, dir)
    if (clip) onSurface(craft, dir, spokeEnd)
    else spokeEnd.copy(craft).addScaledVector(dir, orbitScene.spaceConeLengthKm)
    attr.setXYZ(i, spokeEnd.x, spokeEnd.y, spokeEnd.z)
  }
  attr.needsUpdate = true
}

function onSurface(craft: THREE.Vector3, direction: THREE.Vector3, target: THREE.Vector3) {
  const reach = slantToSurface(orbitRadiusKm, MOON, HALF)
  target.copy(craft).addScaledVector(direction, reach)
  const lift = (MOON * 1.004) / Math.max(target.length(), 1)
  return target.multiplyScalar(lift)
}
