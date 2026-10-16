import { useGLTF } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState, type MutableRefObject } from 'react'
import * as THREE from 'three'
import modelUrl from '../../model.glb?url'
import { MODEL_CENTER } from '../lib/instrument'
import { useReducedMotion } from '../lib/useReducedMotion'
import { StageFrame } from './StageScreen'

useGLTF.preload(modelUrl)

const STEPS = [
  {
    kicker: 'The payload',
    title: 'MATCH flies on Chang’e-7.',
    body: 'A particle detector built to investigate energetic particles around the Moon.',
  },
  {
    kicker: 'One axis',
    title: 'Two entrances, one instrument.',
    body: 'Space-facing and Moon-facing views open onto the same detector bore.',
  },
  {
    kicker: 'The measurement',
    title: 'Path and energy, together.',
    body: 'Silicon layers record where a particle crosses. Scintillators record how energy is deposited.',
  },
  {
    kicker: 'The orbit',
    title: 'About 200 kilometres up.',
    body: 'From a near-polar orbit, MATCH watches particles arriving from space and emerging from the lunar surface.',
  },
]

const NEAR = 478
const FAR = 1560
const NARROW_NEAR = 904
const NARROW_FAR = 1900
const AZIMUTH = 0.78
const TURN = Math.PI * 0.78

export function MissionOverview({
  webgl,
  number,
  title,
  description,
}: {
  webgl: boolean
  number: string
  title: string
  description: string
}) {
  const reduced = useReducedMotion()
  const pinRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef(0)
  const visibleRef = useRef(true)
  const pivotRef = useRef<THREE.Group>(null)
  const [step, setStep] = useState(0)

  useEffect(() => {
    const pin = pinRef.current
    if (!pin) return
    const measure = () => {
      const sticky = pin.querySelector('.mission-sticky')
      if (!sticky) return
      const top = document.querySelector('.brand')?.getBoundingClientRect().height ?? 56
      const rect = pin.getBoundingClientRect()
      const travel = Math.max(pin.offsetHeight - sticky.clientHeight, 1)
      const progress = Math.min(1, Math.max(0, (top - rect.top) / travel))
      progressRef.current = reduced ? 0.45 : progress
      setStep(reduced ? 0 : Math.min(STEPS.length - 1, Math.floor(progress * STEPS.length)))
    }
    measure()
    const observer = new IntersectionObserver(
      ([entry]) => {
        visibleRef.current = entry.isIntersecting
      },
      { threshold: 0 },
    )
    observer.observe(pin)
    window.addEventListener('scroll', measure, { passive: true })
    window.addEventListener('resize', measure)
    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', measure)
      window.removeEventListener('resize', measure)
    }
  }, [reduced])

  return (
    <div className="mission" ref={pinRef} data-reduced={reduced}>
      <div className="mission-sticky">
        <div className="mission-heading">
          <p className="kicker">Chapter {number}</p>
          <h2 id="mission-overview-title">{title}</h2>
          <p className="chapter-lead">{description}</p>
        </div>
        <div className="mission-copy">
          <p className="mission-tag">Placeholder summary</p>
          {reduced ? (
            STEPS.map((item) => (
              <article key={item.title}>
                <p className="kicker">{item.kicker}</p>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))
          ) : (
            STEPS.map((item, index) => (
              <article key={item.title} data-on={index === step} aria-hidden={index !== step}>
                <p className="kicker">{item.kicker}</p>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))
          )}
        </div>
        <div className="mission-scrim" aria-hidden="true" />
        {webgl ? (
          <StageFrame className="stage mission-stage" screen={false} aria-label="MATCH payload">
            <Canvas
              dpr={[1, 1.6]}
              camera={{ fov: 28, near: 0.5, far: 9000, position: [220, 150, 340] }}
              gl={{ antialias: true, alpha: false, stencil: false, powerPreference: 'default' }}
              style={{ position: 'absolute', inset: 0, touchAction: 'pan-y' }}
              onCreated={({ gl }) => {
                gl.toneMapping = THREE.ACESFilmicToneMapping
                gl.toneMappingExposure = 1.12
                gl.setClearColor('#000000', 1)
              }}
            >
              <color attach="background" args={['#000000']} />
              <hemisphereLight args={['#eef3fb', '#05060a', 0.72]} />
              <ambientLight intensity={0.22} />
              <directionalLight position={[3.2, 2.4, 1.1]} intensity={4.4} color="#f8f9fc" />
              <directionalLight position={[-2.2, 0.4, 0.6]} intensity={1.15} color="#c5d2e6" />
              <directionalLight position={[0.4, 0.8, -2.6]} intensity={1.55} color="#d5def0" />
              <Suspense fallback={null}>
                <PayloadModel pivotRef={pivotRef} />
              </Suspense>
              <Turntable progressRef={progressRef} visibleRef={visibleRef} pivotRef={pivotRef} reduced={reduced} />
            </Canvas>
            <p className="mission-plate">CE-7 MATCH</p>
          </StageFrame>
        ) : (
          <div className="stage mission-stage mission-fallback" role="img" aria-label="MATCH is unavailable without WebGL">
            <p>The model needs WebGL.</p>
          </div>
        )}
        <ol className="mission-ticks" aria-hidden="true">
          {STEPS.map((item, index) => (
            <li key={item.title} data-on={index === step} />
          ))}
        </ol>
      </div>
    </div>
  )
}

function PayloadModel({ pivotRef }: { pivotRef: MutableRefObject<THREE.Group | null> }) {
  const { scene } = useGLTF(modelUrl)
  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#fafafa',
        roughness: 0.56,
        metalness: 0.08,
        side: THREE.DoubleSide,
      }),
    [],
  )
  const root = useMemo(() => {
    const pivot = new THREE.Group()
    const clone = scene.clone(true)
    clone.position.set(-MODEL_CENTER.x, -MODEL_CENTER.y, -MODEL_CENTER.z)
    clone.traverse((object) => {
      const mesh = object as THREE.Mesh
      if (!mesh.isMesh) return
      mesh.material = material
      mesh.castShadow = false
      mesh.receiveShadow = false
    })
    pivot.add(clone)
    return pivot
  }, [material, scene])

  useLayoutEffect(() => {
    pivotRef.current = root
    return () => {
      pivotRef.current = null
    }
  }, [pivotRef, root])

  useEffect(() => {
    return () => material.dispose()
  }, [material])

  return <primitive object={root} />
}

const focus = new THREE.Vector3()
const back = new THREE.Vector3()
const right = new THREE.Vector3()
const screenUp = new THREE.Vector3()

function Turntable({
  progressRef,
  visibleRef,
  pivotRef,
  reduced,
}: {
  progressRef: MutableRefObject<number>
  visibleRef: MutableRefObject<boolean>
  pivotRef: MutableRefObject<THREE.Group | null>
  reduced: boolean
}) {
  const camera = useThree((state) => state.camera)

  const apply = (width: number, height: number) => {
    const progress = reduced ? 0 : progressRef.current
    const narrow = width < 860
    const near = narrow ? NARROW_NEAR : NEAR
    const far = narrow ? NARROW_FAR : FAR
    const turn = smooth(Math.min(1, progress / 0.68))
    const zoom = smooth(Math.max(0, (progress - 0.2) / 0.8))
    const distance = near + (far - near) * zoom
    const aspect = width / Math.max(height, 1)
    const half = distance * Math.tan(THREE.MathUtils.degToRad(14))
    const offset = narrow ? 0 : half * aspect * (0.32 + 0.3)
    back.set(Math.sin(AZIMUTH), 0.18, Math.cos(AZIMUTH)).normalize()
    right.set(Math.cos(AZIMUTH), 0, -Math.sin(AZIMUTH))
    focus.copy(right).multiplyScalar(-offset)
    camera.position.copy(focus).addScaledVector(back, distance)
    camera.lookAt(focus)
    const settle = narrow ? 1 - smooth(Math.min(1, progress / 0.35)) : 1
    const drop = half * (narrow ? 0.1 : 0.5) * settle
    screenUp.set(0, 1, 0).applyQuaternion(camera.quaternion)
    focus.addScaledVector(screenUp, drop)
    camera.position.copy(focus).addScaledVector(back, distance)
    camera.lookAt(focus)
    const pivot = pivotRef.current
    if (pivot) pivot.rotation.y = (reduced ? 0.15 : turn) * TURN
  }

  useLayoutEffect(() => {
    apply(window.innerWidth, window.innerHeight)
  }, [reduced])

  useFrame((state) => {
    if (!visibleRef.current && !reduced) return
    apply(state.size.width, state.size.height)
  })

  return null
}

function smooth(value: number) {
  return value * value * (3 - 2 * value)
}
