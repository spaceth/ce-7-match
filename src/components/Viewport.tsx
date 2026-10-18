import { Html, Line, OrbitControls, useProgress } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Component, Suspense, useEffect, useLayoutEffect, useMemo, useRef, type Ref } from 'react'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import * as THREE from 'three'
import { createHousingMaterials, disposeHousing, paintHousing } from '../lib/housing'
import {
  MODEL_CENTER,
  TELESCOPE_WORLD,
  modelToWorld,
  overviewCallouts,
  type Mode,
  type Playback,
} from '../lib/instrument'
import { useMatchModel } from '../lib/model'
import { copy, fill } from '../content'
import { DetectorAssembly } from './Stack'

export type ViewHandle = {
  zoom: (factor: number) => void
}

type ViewportProps = {
  mode: Mode
  selected: string
  motion: React.MutableRefObject<Playback>
  progressEl: React.RefObject<HTMLDivElement | null>
  resetToken: number
  reduced: boolean
  autoRotate: boolean
  interacting: boolean
  onInteract: (active: boolean) => void
  onStep: (step: number) => void
  onEnded: () => void
  onReady: () => void
  onModelError: (message: string) => void
  viewRef: Ref<ViewHandle>
}

const sectionPlane = new THREE.Plane(new THREE.Vector3(-1, 0, 0), TELESCOPE_WORLD.x + 5)

export function Viewport(props: ViewportProps) {
  const start = overviewPose()
  return (
    <Canvas
      dpr={[1, 1.6]}
      camera={{ fov: 32, near: 2, far: 4000, position: start.position.toArray() }}
      gl={{
        antialias: true,
        alpha: false,
        stencil: false,
        localClippingEnabled: true,
        powerPreference: 'default',
      }}
      style={{ position: 'absolute', inset: 0, touchAction: 'none' }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping
        gl.toneMappingExposure = 1.12
        gl.setClearColor('#000000', 1)
      }}
    >
      <color attach="background" args={['#000000']} />
      <Lights />
      <CameraRig
        mode={props.mode}
        resetToken={props.resetToken}
        reduced={props.reduced}
        autoRotate={props.autoRotate}
        interacting={props.interacting}
        onInteract={props.onInteract}
        viewRef={props.viewRef}
      />
      <ModelBoundary onError={props.onModelError}>
        <Suspense fallback={null}>
          <Hardware mode={props.mode} onReady={props.onReady} />
        </Suspense>
      </ModelBoundary>
      {props.mode !== 'overview' && (
        <DetectorAssembly
          mode={props.mode}
          selected={props.selected}
          motion={props.motion}
          progressEl={props.progressEl}
          onStep={props.onStep}
          onEnded={props.onEnded}
        />
      )}
      <OverviewLabels visible={props.mode === 'overview'} />
      <OverviewDimensions visible={props.mode === 'overview'} />
    </Canvas>
  )
}

export function LoadState({ hidden }: { hidden: boolean }) {
  const { progress } = useProgress()
  if (hidden) return null
  const value = Math.max(4, Math.round(progress))
  return (
    <div className="loader" role="status">
      <p>{copy.explorer.loading}</p>
      <div className="meter" aria-hidden="true">
        <span style={{ width: `${value}%` }} />
      </div>
      <span className="sr-only">{fill(copy.ui.percent, { value })}</span>
    </div>
  )
}

function Lights() {
  return (
    <>
      <hemisphereLight args={['#eef3fb', '#05060a', 0.72]} />
      <ambientLight intensity={0.22} />
      <directionalLight position={[3.2, 2.4, 1.1]} intensity={4.4} color="#f8f9fc" />
      <directionalLight position={[-2.2, 0.4, 0.6]} intensity={1.15} color="#c5d2e6" />
      <directionalLight position={[0.4, 0.8, -2.6]} intensity={1.55} color="#d5def0" />
    </>
  )
}

function CameraRig({
  mode,
  resetToken,
  reduced,
  autoRotate,
  interacting,
  onInteract,
  viewRef,
}: {
  mode: Mode
  resetToken: number
  reduced: boolean
  autoRotate: boolean
  interacting: boolean
  onInteract: (active: boolean) => void
  viewRef: Ref<ViewHandle>
}) {
  const camera = useThree((state) => state.camera) as THREE.PerspectiveCamera
  const size = useThree((state) => state.size)
  const anim = useRef<{
    fromP: THREE.Vector3
    toP: THREE.Vector3
    fromT: THREE.Vector3
    toT: THREE.Vector3
    u: number
    mode: Mode
    pose: Pose
  } | null>(null)
  const signature = useRef('')
  const seen = useRef(false)
  const fitted = useRef<Pose | null>(null)
  const orbit = useRef<OrbitControlsImpl>(null)

  useLayoutEffect(() => {
    const pose = overviewPose()
    camera.position.copy(pose.position)
    camera.lookAt(pose.target)
    camera.updateProjectionMatrix()
  }, [camera])

  useLayoutEffect(() => {
    if (!viewRef || typeof viewRef === 'function') return
    viewRef.current = {
      zoom(factor: number) {
        const live = orbit.current
        if (!live) return
        anim.current = null
        const offset = camera.position.clone().sub(live.target)
        const distance = THREE.MathUtils.clamp(offset.length() * factor, live.minDistance, live.maxDistance)
        offset.setLength(distance)
        camera.position.copy(live.target).add(offset)
        live.update()
      },
    }
  }, [camera, viewRef])

  useFrame((_, delta) => {
    const live = orbit.current
    if (!live) return
    const aspect = size.width / Math.max(size.height, 1)
    const nextSignature = `${mode}:${resetToken}:${aspect.toFixed(2)}`
    if (signature.current !== nextSignature) {
      const pose = fitPose(mode === 'overview' ? overviewPose() : sectionPose(), aspect)
      fitted.current = pose
      const first = !seen.current
      seen.current = true
      signature.current = nextSignature
      live.minAzimuthAngle = -Infinity
      live.maxAzimuthAngle = Infinity
      live.minPolarAngle = 0.08
      live.maxPolarAngle = Math.PI - 0.08
      live.minDistance = pose.min
      live.maxDistance = pose.max
      if (first || reduced) {
        camera.position.copy(pose.position)
        live.target.copy(pose.target)
        live.update()
        if (mode !== 'overview') applySectionLimits(live, pose)
        anim.current = null
      } else {
        anim.current = {
          fromP: camera.position.clone(),
          toP: pose.position.clone(),
          fromT: live.target.clone(),
          toT: pose.target.clone(),
          u: 0,
          mode,
          pose,
        }
      }
    }

    if (!anim.current) return
    const duration = reduced ? 0.01 : 1.05
    anim.current.u = Math.min(1, anim.current.u + delta / duration)
    const k = 1 - (1 - anim.current.u) ** 3
    camera.position.lerpVectors(anim.current.fromP, anim.current.toP, k)
    live.target.lerpVectors(anim.current.fromT, anim.current.toT, k)
    live.update()
    if (anim.current.u >= 1) {
      if (anim.current.mode !== 'overview') applySectionLimits(live, anim.current.pose)
      anim.current = null
    }
  })

  return (
    <OrbitControls
      ref={orbit}
      makeDefault
      enableDamping
      dampingFactor={0.08}
      enablePan
      rotateSpeed={0.7}
      zoomSpeed={0.72}
      autoRotate={autoRotate && mode === 'overview' && !interacting && !reduced}
      autoRotateSpeed={0.42}
      onStart={() => {
        anim.current = null
        onInteract(true)
        const live = orbit.current
        if (mode !== 'overview' && live && fitted.current) applySectionLimits(live, fitted.current)
      }}
      onEnd={() => onInteract(false)}
    />
  )
}

function Hardware({ mode, onReady }: { mode: Mode; onReady: () => void }) {
  const { scene } = useMatchModel()
  const materials = useMemo(() => createHousingMaterials(), [])

  useLayoutEffect(() => {
    const planes = mode === 'overview' ? [] : [sectionPlane]
    for (const material of [materials.body, materials.fasteners, materials.windows]) {
      material.clippingPlanes = planes
      material.needsUpdate = true
    }
  }, [materials, mode])

  const root = useMemo(() => {
    const clone = scene.clone(true)
    clone.position.set(-MODEL_CENTER.x, -MODEL_CENTER.y, -MODEL_CENTER.z)
    paintHousing(clone, materials)
    return clone
  }, [materials, scene])

  useLayoutEffect(() => {
    const showEnds = mode === 'overview'
    root.traverse((object) => {
      const mesh = object as THREE.Mesh
      if (!mesh.isMesh || !/sldasm-Part-28[12]$/i.test(mesh.name)) return
      mesh.visible = showEnds
    })
  }, [mode, root])

  useEffect(() => () => disposeHousing(materials), [materials])

  const reported = useRef(false)
  useLayoutEffect(() => {
    if (reported.current) return
    reported.current = true
    onReady()
  }, [onReady])

  return <primitive object={root} />
}

type SideLabel = {
  id: string
  kicker: string
  title: string
  side: 'left' | 'right'
  anchor: THREE.Vector3
  line: THREE.Line
  host: THREE.Group | null
  el: HTMLDivElement | null
}

function OverviewLabels({ visible }: { visible: boolean }) {
  const labels = useMemo<SideLabel[]>(() => {
    return overviewCallouts().map((callout) => {
      const geometry = new THREE.BufferGeometry()
      geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(6), 3))
      const material = new THREE.LineBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.38 })
      const line = new THREE.Line(geometry, material)
      line.frustumCulled = false
      line.raycast = () => {}
      const [x, y, z] = modelToWorld(callout.anchor)
      return {
        side: callout.side,
        anchor: new THREE.Vector3(x, y, z),
        line,
        host: null,
        el: null,
        kicker: callout.kicker,
        title: callout.title,
        id: callout.id,
      }
    })
  }, [])

  useEffect(() => {
    return () => {
      for (const label of labels) {
        label.line.geometry.dispose()
        ;(label.line.material as THREE.Material).dispose()
      }
    }
  }, [labels])

  useFrame(({ camera, size }) => {
    if (!visible) return
    placeSideLabels(labels, camera, size.width, size.height)
  })

  if (!visible) return null
  return (
    <group>
      {labels.map((label) => (
        <group key={label.id}>
          <primitive object={label.line} />
          <ScreenDot position={label.anchor.toArray() as [number, number, number]} />
          <group ref={(node) => { label.host = node }}>
            <Html position={[0, 0, 0]} zIndexRange={[4, 0]} style={{ pointerEvents: 'none' }} wrapperClass="html-label">
              <div
                ref={(node) => { label.el = node }}
                className={`callout callout-${label.side}`}
              >
                <span>{label.kicker}</span>
                <strong>{label.title}</strong>
              </div>
            </Html>
          </group>
        </group>
      ))}
    </group>
  )
}

const sideNdc = new THREE.Vector3()
const sideEnd = new THREE.Vector3()
const sideLocal = new THREE.Vector3()
const payloadMin = new THREE.Vector3(...modelToWorld([-69, -227.257, -41.178]))
const payloadMax = new THREE.Vector3(...modelToWorld([78.4, 26.043, 109.022]))
const payloadCorner = new THREE.Vector3()

function payloadScreenSpan(camera: THREE.Camera, width: number) {
  let left = Infinity
  let right = -Infinity
  for (const x of [payloadMin.x, payloadMax.x]) {
    for (const y of [payloadMin.y, payloadMax.y]) {
      for (const z of [payloadMin.z, payloadMax.z]) {
        payloadCorner.set(x, y, z)
        sideLocal.copy(payloadCorner).applyMatrix4(camera.matrixWorldInverse)
        if (sideLocal.z > -1) continue
        sideNdc.copy(payloadCorner).project(camera)
        const sx = (sideNdc.x * 0.5 + 0.5) * width
        left = Math.min(left, sx)
        right = Math.max(right, sx)
      }
    }
  }
  if (!Number.isFinite(left)) return { left: width * 0.3, right: width * 0.7 }
  return { left, right }
}

function placeSideLabels(labels: SideLabel[], camera: THREE.Camera, width: number, height: number) {
  if (width < 2 || height < 2) return
  const payload = payloadScreenSpan(camera, width)
  const frames = labels.map((label) => {
    sideLocal.copy(label.anchor).applyMatrix4(camera.matrixWorldInverse)
    sideNdc.copy(label.anchor).project(camera)
    return {
      label,
      y: (-sideNdc.y * 0.5 + 0.5) * height,
      z: sideNdc.z,
      h: label.el?.offsetHeight || 36,
      w: label.el?.offsetWidth || 140,
      behind: sideLocal.z > -1,
    }
  })

  for (const side of ['left', 'right'] as const) {
    const group = frames.filter((frame) => frame.label.side === side).sort((a, b) => a.y - b.y)
    const limitTop = 28
    const limitBottom = height - (side === 'right' ? 220 : 56)
    let cursor = limitTop
    for (const frame of group) {
      const half = frame.h / 2
      frame.y = Math.max(frame.y, cursor + half)
      cursor = frame.y + half + 16
    }
    const last = group[group.length - 1]
    if (last) {
      const overflow = last.y + last.h / 2 - limitBottom
      if (overflow > 0) {
        for (const frame of group) frame.y -= overflow
      }
    }
  }

  for (const frame of frames) {
    const label = frame.label
    const host = label.host
    if (!host) continue
    if (frame.behind) {
      host.visible = false
      label.line.visible = false
      continue
    }
    const gap = 88
    const clearsChrome = frame.y - frame.h / 2 < 68 || frame.y + frame.h / 2 > height - 210
    const edge = label.side === 'right' && clearsChrome ? 76 : 16
    const beside = label.side === 'left'
      ? payload.left - gap + 12
      : payload.right + gap - 12
    const onScreen = label.side === 'left'
      ? edge + frame.w + 12
      : width - edge - frame.w - 12
    const lineX = label.side === 'left' ? Math.max(beside, onScreen) : Math.min(beside, onScreen)
    sideEnd.set((lineX / width) * 2 - 1, -(frame.y / height) * 2 + 1, frame.z).unproject(camera)
    const position = label.line.geometry.getAttribute('position') as THREE.BufferAttribute
    position.setXYZ(0, label.anchor.x, label.anchor.y, label.anchor.z)
    position.setXYZ(1, sideEnd.x, sideEnd.y, sideEnd.z)
    position.needsUpdate = true
    label.line.geometry.computeBoundingSphere()
    host.position.copy(sideEnd)
    host.visible = true
    label.line.visible = true
  }
}

type Point = [number, number, number]

/**
 * Overall envelope, drawn outside the model bounds.
 * 26.5 cm is the tall axis. 14.6 cm follows the longer horizontal
 * extent (entrance to entrance); 14.5 cm follows the other.
 */
function OverviewDimensions({ visible }: { visible: boolean }) {
  const measures = useMemo(() => dimensionLayout(), [])
  if (!visible) return null
  return (
    <group>
      {measures.map((item) => (
        <group key={item.text}>
          <Line points={item.line} color="#ffffff" transparent opacity={0.72} lineWidth={1} raycast={() => null} />
          <Html
            position={item.label}
            center
            zIndexRange={[3, 0]}
            style={{ pointerEvents: 'none' }}
            wrapperClass="html-label"
          >
            <div className="dimension">{item.text}</div>
          </Html>
        </group>
      ))}
    </group>
  )
}

function dimensionLayout() {
  const min = modelToWorld([-69, -227.257, -41.178])
  const max = modelToWorld([78.4, 26.043, 109.022])
  const [x0, y0, z0] = min
  const [x1, y1, z1] = max
  const out = 36
  const ox = x0 - out
  const oy = y0 - out

  const measures: { text: string; line: Point[]; label: Point }[] = [
    {
      text: '26.5 cm',
      line: [
        [ox, y0, z1],
        [ox, y1, z1],
      ],
      label: [ox, (y0 + y1) / 2, z1],
    },
    {
      text: '14.5 cm',
      line: [
        [x0, oy, z1],
        [x1, oy, z1],
      ],
      label: [(x0 + x1) / 2, oy, z1],
    },
    {
      text: '14.6 cm',
      line: [
        [ox, oy, z0],
        [ox, oy, z1],
      ],
      label: [ox, oy, z0 + (z1 - z0) * 0.94],
    },
  ]

  return measures
}

const dotScale = new THREE.Vector3()

function ScreenDot({ position }: { position: [number, number, number] }) {
  const ref = useRef<THREE.Mesh>(null)
  useFrame(({ camera }) => {
    const mesh = ref.current
    if (!mesh) return
    const distance = camera.position.distanceTo(mesh.getWorldPosition(dotScale))
    const scale = Math.max(0.8, distance * 0.0032)
    mesh.scale.setScalar(scale)
  })
  return (
    <mesh ref={ref} position={position} raycast={() => null}>
      <sphereGeometry args={[1, 12, 12]} />
      <meshBasicMaterial color="#ffffff" />
    </mesh>
  )
}

class ModelBoundary extends Component<
  { children: React.ReactNode; onError: (message: string) => void },
  { failed: boolean }
> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error: Error) {
    this.props.onError(error.message || copy.explorer.modelFailed)
  }

  render() {
    if (this.state.failed) return null
    return this.props.children
  }
}

type Pose = {
  position: THREE.Vector3
  target: THREE.Vector3
  min: number
  max: number
}

function fitPose(pose: Pose, aspect: number): Pose {
  const factor = aspect >= 0.85 ? 1 : Math.min(1.05 / aspect, 1.85)
  const offset = pose.position.clone().sub(pose.target)
  offset.setLength(offset.length() * factor)
  return {
    position: pose.target.clone().add(offset),
    target: pose.target,
    min: pose.min * factor,
    max: pose.max,
  }
}

function overviewPose(): Pose {
  const target = new THREE.Vector3(0, -8, 0)
  const direction = new THREE.Vector3(0.86, 0.36, 0.42).normalize()
  const position = target.clone().add(direction.multiplyScalar(1080))
  return { position, target, min: 420, max: 1800 }
}

function sectionPose(): Pose {
  const target = new THREE.Vector3(TELESCOPE_WORLD.x, TELESCOPE_WORLD.y, TELESCOPE_WORLD.z)
  const direction = new THREE.Vector3(0.78, 0.3, 0.52).normalize()
  const position = target.clone().add(direction.multiplyScalar(390))
  return { position, target, min: 150, max: 760 }
}

function applySectionLimits(controls: OrbitControlsImpl, pose: Pose) {
  const offset = pose.position.clone().sub(pose.target)
  const azimuth = Math.atan2(offset.x, offset.z)
  controls.minAzimuthAngle = azimuth - 0.95
  controls.maxAzimuthAngle = azimuth + 0.95
  controls.minPolarAngle = 0.5
  controls.maxPolarAngle = 1.48
  controls.minDistance = 150
  controls.maxDistance = 760
}
