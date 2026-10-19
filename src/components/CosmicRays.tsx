import { Canvas, useFrame } from '@react-three/fiber'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { orbitScene } from '../lib/orbit'
import { useReducedMotion } from '../lib/useReducedMotion'
import { useStageActivity } from '../lib/useStageActivity'
import { hasWebGL } from '../lib/webgl'
import { copy, fill } from '../content'

function sources() {
  return copy.cosmic.sources
}
const SPACE_PARTICLE = orbitScene.spaceFacing
const MOON_PARTICLE = orbitScene.moonFacing
const TRAIL_LIFE = 0.16
const DOT_SIZE = 4.5
const TRAIL_OPACITY = 0.8

const EARTH = { x: 292, y: 268 }
const ORBIT = 146

export function CosmicRays() {
  const reduced = useReducedMotion()
  const pinRef = useRef<HTMLDivElement>(null)
  const [progress, setProgress] = useState(reduced ? 0.5 : 0)

  useEffect(() => {
    const pin = pinRef.current
    if (!pin) return
    const measure = () => {
      const sticky = pin.querySelector('.tail-sticky')
      if (!sticky) return
      if (reduced) {
        setProgress(0.5)
        return
      }
      const header = document.querySelector('.brand')?.getBoundingClientRect().height ?? 56
      const rect = pin.getBoundingClientRect()
      const travel = Math.max(pin.offsetHeight - sticky.clientHeight, 1)
      const next = Math.min(1, Math.max(0, (header - rect.top) / travel))
      setProgress(next)
    }
    measure()
    window.addEventListener('scroll', measure, { passive: true })
    window.addEventListener('resize', measure)
    return () => {
      window.removeEventListener('scroll', measure)
      window.removeEventListener('resize', measure)
    }
  }, [reduced])

  const theta = Math.PI - progress * Math.PI * 2
  const moonX = EARTH.x + ORBIT * Math.cos(theta)
  const moonY = EARTH.y + ORBIT * Math.sin(theta)
  const alongTail = moonX - EARTH.x
  const inTail = alongTail > 36 && Math.abs(moonY - EARTH.y) < 26 + alongTail * 0.2

  return (
    <div className="rays">
      <section className="ray-sources" aria-label={copy.cosmic.sourcesLabel}>
        <h3>{copy.cosmic.heading}</h3>
        <div className="ray-intro">
          {copy.cosmic.intro.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        <div className="ray-grid">
          {sources().map((source) => (
            <article key={source.id}>
              {source.id === 'solar' ? (
                <SunFrame reduced={reduced} />
              ) : source.id === 'galactic' ? (
                <PulsarFrame reduced={reduced} />
              ) : source.id === 'jovian' ? (
                <JupiterFrame reduced={reduced} />
              ) : (
                <LunarFrame reduced={reduced} />
              )}
              <h4>{source.title}</h4>
              <p>{source.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="tail" ref={pinRef} data-reduced={reduced} aria-labelledby="magnetotail-title">
        <div className="tail-sticky">
          <div className="tail-copy">
            <p className="kicker">{copy.cosmic.tail.kicker}</p>
            <h3 id="magnetotail-title">{copy.cosmic.tail.title}</h3>
            <p>{copy.cosmic.tail.body}</p>
          </div>
          <div className="tail-stage">
            <svg viewBox="0 0 960 520" role="img" aria-labelledby="magnetotail-title magnetotail-status">
              <title>{copy.cosmic.tail.diagramTitle}</title>
              <defs>
                <linearGradient id="tail-fade" x1="0" x2="1" y1="0" y2="0">
                  <stop offset="0" stopColor="#7fd0ee" stopOpacity="1" />
                  <stop offset="1" stopColor="#7fd0ee" stopOpacity="0" />
                </linearGradient>
                <filter id="tail-edge" x="-12%" y="-30%" width="124%" height="160%">
                  <feGaussianBlur stdDeviation="7" />
                </filter>
              </defs>
              <g className="tail-wind" aria-hidden="true">
                <text x="28" y="128">
                  {copy.cosmic.tail.solarWind}
                </text>
              </g>
              <g className="tail-particles" aria-hidden="true">
                {[
                  { y: 156, x: 30, delay: '0s', duration: '3.4s' },
                  { y: 176, x: 72, delay: '-1.1s', duration: '3.8s' },
                  { y: 196, x: 44, delay: '-2.2s', duration: '3.1s' },
                  { y: 216, x: 98, delay: '-0.5s', duration: '4s' },
                  { y: 236, x: 20, delay: '-1.7s', duration: '3.5s' },
                  { y: 256, x: 84, delay: '-2.8s', duration: '3.2s' },
                  { y: 278, x: 52, delay: '-0.3s', duration: '3.9s' },
                  { y: 300, x: 110, delay: '-2s', duration: '3.4s' },
                  { y: 322, x: 36, delay: '-1.3s', duration: '3.7s' },
                  { y: 344, x: 90, delay: '-2.6s', duration: '3.1s' },
                  { y: 366, x: 60, delay: '-0.8s', duration: '4.1s' },
                ].map((particle) => (
                  <g key={particle.y} transform={reduced ? `translate(${particle.x} 0)` : undefined}>
                    {!reduced && (
                      <animateTransform
                        attributeName="transform"
                        type="translate"
                        from="16 0"
                        to="168 0"
                        dur={particle.duration}
                        begin={particle.delay}
                        repeatCount="indefinite"
                      />
                    )}
                    <line x1="-24" y1={particle.y} x2="0" y2={particle.y} />
                    <circle cx="0" cy={particle.y} r="2.25" />
                  </g>
                ))}
              </g>
              <path className="tail-bow" d="M292 150 C176 196 168 348 292 392" />
              <path
                className="tail-body"
                fill="url(#tail-fade)"
                d="M292 198 C214 226 206 314 292 340 C500 402 730 418 940 386 L940 150 C730 118 500 136 292 198 Z"
              />
              <text className="tail-label" x="620" y="250">
                {copy.cosmic.tail.magnetotail}
              </text>
              <circle className="tail-orbit" cx={EARTH.x} cy={EARTH.y} r={ORBIT} />
              <circle className="tail-earth" cx={EARTH.x} cy={EARTH.y} r="18" />
              <text className="tail-label" x={EARTH.x - 18} y={EARTH.y + 36}>
                {copy.ui.earth}
              </text>
              <g className="tail-moon">
                <circle cx={moonX} cy={moonY} r="7" />
              </g>
            </svg>
            <p id="magnetotail-status" className="tail-status" data-in={inTail}>
              <span>{inTail ? copy.cosmic.tail.inside : copy.cosmic.tail.outside}</span>
              {inTail ? copy.cosmic.tail.insideBody : copy.cosmic.tail.outsideBody}
            </p>
            {copy.cosmic.tail.caption ? <p className="tail-caption">{copy.cosmic.tail.caption}</p> : null}
          </div>
        </div>
      </section>

      <p className="ray-close">{copy.cosmic.close}</p>
      <p className="ray-close-lead">{copy.cosmic.closeLead}</p>
    </div>
  )
}

function ImagePlaceholder({ title }: { title: string }) {
  return (
    <div className="ray-frame" role="img" aria-label={fill(copy.cosmic.imagePlaceholder, { title })}>
      <span>{copy.ui.image}</span>
    </div>
  )
}

function SunFrame({ reduced }: { reduced: boolean }) {
  const webgl = useMemo(() => hasWebGL(), [])
  const { ref: frameRef, shown, seen } = useStageActivity<HTMLDivElement>()

  if (!webgl) {
    return (
      <ImagePlaceholder title={sources()[0].title} />
    )
  }

  const playing = shown && !reduced

  return (
    <div ref={frameRef} className="ray-frame ray-sun" role="img" aria-label={sources()[0].diagram}>
      {seen ? <Canvas
        dpr={[1, 1.5]}
        camera={{ fov: 30, position: [0, 0, 4.1] }}
        frameloop={playing ? 'always' : 'demand'}
        gl={{ antialias: true, alpha: false, stencil: false, powerPreference: 'default' }}
        style={{ position: 'absolute', inset: 0, touchAction: 'pan-y', pointerEvents: 'none' }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.NoToneMapping
          gl.setClearColor('#000000', 1)
        }}
      >
        <SunBody />
        <SolarParticles playing={playing} />
      </Canvas> : null}
    </div>
  )
}

function SunBody() {
  return (
    <mesh scale={1.48}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        transparent
        depthWrite={false}
        toneMapped={false}
        blending={THREE.NormalBlending}
        vertexShader={`
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          varying vec2 vUv;
          void main() {
            float r = length(vUv * 2.0 - 1.0);
            float disk = smoothstep(0.34, 0.2, r);
            float glow = smoothstep(1.0, 0.18, r);
            vec3 corona = vec3(0.55, 0.56, 0.58);
            vec3 core = vec3(0.96, 0.97, 0.98);
            vec3 color = mix(corona, core, disk);
            float alpha = max(disk, glow * glow * 0.85);
            gl_FragColor = vec4(color, alpha);
          }
        `}
      />
    </mesh>
  )
}

const PARTICLE_COUNT = 36

function SolarParticles({ playing }: { playing: boolean }) {
  const streaks = useStreaks(PARTICLE_COUNT, SPACE_PARTICLE)
  const flight = useMemo(() => {
    return Array.from({ length: PARTICLE_COUNT }, () => ({
      angle: Math.random() * Math.PI * 2,
      speed: 0.16 + Math.random() * 0.2,
      life: Math.random(),
    }))
  }, [])

  return (
    <StreakField
      streaks={streaks}
      tick={(index, delta, head, tail) => {
        const item = flight[index]
        if (playing && delta > 0) item.life += delta * item.speed
        if (item.life > 1) {
          item.life = 0
          item.angle = Math.random() * Math.PI * 2
          item.speed = 0.16 + Math.random() * 0.2
        }
        radialEnds(item.angle, item.life, 0.46, 0.95, head, tail)
      }}
    />
  )
}

function PulsarFrame({ reduced }: { reduced: boolean }) {
  const webgl = useMemo(() => hasWebGL(), [])
  const { ref: frameRef, shown, seen } = useStageActivity<HTMLDivElement>()

  if (!webgl) {
    return (
      <ImagePlaceholder title={sources()[1].title} />
    )
  }

  const playing = shown && !reduced

  return (
    <div ref={frameRef} className="ray-frame ray-pulsar" role="img" aria-label={sources()[1].diagram}>
      {seen ? <Canvas
        dpr={[1, 1.5]}
        camera={{ fov: 30, position: [0.4, 0.35, 4.2] }}
        frameloop={playing ? 'always' : 'demand'}
        gl={{ antialias: true, alpha: false, stencil: false, powerPreference: 'default' }}
        style={{ position: 'absolute', inset: 0, touchAction: 'pan-y', pointerEvents: 'none' }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.NoToneMapping
          gl.setClearColor('#000000', 1)
        }}
      >
        <Pulsar playing={playing} />
      </Canvas> : null}
    </div>
  )
}

function Pulsar({ playing }: { playing: boolean }) {
  const spin = useRef<THREE.Group>(null)

  useFrame((_, delta) => {
    if (!playing || !spin.current) return
    spin.current.rotation.y += Math.min(delta, 0.05) * 0.85
  })

  return (
    <>
      <group ref={spin}>
        <group rotation={[0.72, 0, 0.15]}>
          <Beam />
          <Beam flip />
          <BeamParticles playing={playing} />
        </group>
      </group>
      <mesh scale={0.72} renderOrder={3}>
        <planeGeometry args={[2, 2]} />
        <shaderMaterial
          transparent
          depthWrite={false}
          toneMapped={false}
          vertexShader={`
            varying vec2 vUv;
            void main() {
              vUv = uv;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `}
          fragmentShader={`
            varying vec2 vUv;
            void main() {
              float r = length(vUv * 2.0 - 1.0);
              float core = smoothstep(0.28, 0.0, r);
              float glow = smoothstep(1.0, 0.02, r);
              vec3 halo = vec3(0.62, 0.64, 0.66);
              vec3 hot = vec3(0.98, 0.98, 0.99);
              vec3 color = mix(halo, hot, smoothstep(0.42, 0.0, r));
              float alpha = max(core, glow * glow * 0.95);
              gl_FragColor = vec4(color, alpha);
            }
          `}
        />
      </mesh>
    </>
  )
}

function Beam({ flip = false }: { flip?: boolean }) {
  return (
    <mesh position={[0, flip ? -0.78 : 0.78, 0]} rotation={flip ? [0, 0, 0] : [Math.PI, 0, 0]}>
      <coneGeometry args={[0.2, 1.35, 28, 1, true]} />
      <shaderMaterial
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
        toneMapped={false}
        vertexShader={`
          varying vec3 vPos;
          void main() {
            vPos = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          varying vec3 vPos;
          void main() {
            float along = clamp((vPos.y + 0.675) / 1.35, 0.0, 1.0);
            float radial = clamp(length(vPos.xz) / 0.2, 0.0, 1.0);
            float beam = smoothstep(1.0, 0.0, radial);
            float alpha = beam * mix(0.16, 0.78, along);
            gl_FragColor = vec4(vec3(0.498, 0.816, 0.933), alpha);
          }
        `}
      />
    </mesh>
  )
}

const BEAM_PARTICLES = 28

function BeamParticles({ playing }: { playing: boolean }) {
  const streaks = useStreaks(BEAM_PARTICLES, SPACE_PARTICLE)
  const flight = useMemo(
    () =>
      Array.from({ length: BEAM_PARTICLES }, (_, index) => ({
        sign: index < BEAM_PARTICLES / 2 ? 1 : -1,
        angle: Math.random() * Math.PI * 2,
        speed: 0.28 + Math.random() * 0.28,
        life: Math.random(),
      })),
    [],
  )

  return (
    <StreakField
      streaks={streaks}
      tick={(index, delta, head, tail) => {
        const item = flight[index]
        if (playing && delta > 0) item.life += delta * item.speed
        if (item.life > 1) {
          item.life = 0
          item.angle = Math.random() * Math.PI * 2
          item.speed = 0.28 + Math.random() * 0.28
        }
        const lead = beamPoint(item.sign, item.angle, item.life)
        const follow = beamPoint(item.sign, item.angle, Math.max(0, item.life - TRAIL_LIFE))
        head.set(lead.x, lead.y, lead.z)
        tail.set(follow.x, follow.y, follow.z)
      }}
    />
  )
}

function JupiterFrame({ reduced }: { reduced: boolean }) {
  const webgl = useMemo(() => hasWebGL(), [])
  const { ref: frameRef, shown, seen } = useStageActivity<HTMLDivElement>()

  if (!webgl) {
    return (
      <ImagePlaceholder title={sources()[2].title} />
    )
  }

  const playing = shown && !reduced

  return (
    <div ref={frameRef} className="ray-frame ray-jupiter" role="img" aria-label={sources()[2].diagram}>
      {seen ? <Canvas
        dpr={[1, 1.5]}
        camera={{ fov: 30, position: [0.45, 0.28, 5.55] }}
        frameloop={playing ? 'always' : 'demand'}
        gl={{ antialias: true, alpha: false, stencil: false, powerPreference: 'default' }}
        style={{ position: 'absolute', inset: 0, touchAction: 'pan-y', pointerEvents: 'none' }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.NoToneMapping
          gl.setClearColor('#000000', 1)
        }}
      >
        <Jupiter playing={playing} />
      </Canvas> : null}
    </div>
  )
}

const JUPITER_RADIUS = 0.108

function Jupiter({ playing }: { playing: boolean }) {
  const spin = useRef<THREE.Group>(null)

  useFrame((_, delta) => {
    if (!playing || !spin.current) return
    spin.current.rotation.y += Math.min(delta, 0.05) * 0.28
  })

  return (
    <group rotation={[0.32, 0.15, 0.08]}>
      <group ref={spin}>
        <mesh>
          <sphereGeometry args={[JUPITER_RADIUS, 64, 48]} />
          <shaderMaterial
            toneMapped={false}
            vertexShader={`
              varying vec3 vNormal;
              void main() {
                vNormal = normalize(normalMatrix * normal);
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
              }
            `}
            fragmentShader={`
              varying vec3 vNormal;
              void main() {
                vec3 gray = vec3(0.90, 0.91, 0.93);
                float light = dot(normalize(vNormal), normalize(vec3(0.35, 0.2, 1.0)));
                float shade = 0.28 + 0.72 * clamp(light, 0.0, 1.0);
                gl_FragColor = vec4(gray * shade, 1.0);
              }
            `}
          />
        </mesh>
        <mesh>
          <sphereGeometry args={[JUPITER_RADIUS * 6.4, 64, 48]} />
          <shaderMaterial
            transparent
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
            vertexShader={`
              varying vec3 vNormal;
              void main() {
                vNormal = normalize(normalMatrix * normal);
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
              }
            `}
            fragmentShader={`
              varying vec3 vNormal;
              void main() {
                float facing = abs(dot(normalize(vNormal), vec3(0.0, 0.0, 1.0)));
                float feather = smoothstep(0.14, 0.9, facing);
                float halo = pow(1.0 - facing, 1.15);
                float glow = halo * feather;
                vec3 cyan = vec3(0.498, 0.816, 0.933);
                gl_FragColor = vec4(cyan * glow * 0.85, 1.0);
              }
            `}
          />
        </mesh>
        <FieldLines />
      </group>
      <JupiterElectrons playing={playing} />
    </group>
  )
}

const JUPITER_PARTICLES = 10

function jupiterElectronRadius(life: number) {
  return 0.86 + life * 1.15
}

function JupiterElectrons({ playing }: { playing: boolean }) {
  const streaks = useStreaks(JUPITER_PARTICLES, MOON_PARTICLE)
  const flight = useMemo(
    () =>
      Array.from({ length: JUPITER_PARTICLES }, () => ({
        dir: new THREE.Vector3().randomDirection(),
        speed: 1.05 + Math.random() * 0.45,
        life: Math.random(),
      })),
    [],
  )

  return (
    <StreakField
      streaks={streaks}
      tick={(index, delta, head, tail) => {
        const item = flight[index]
        if (playing && delta > 0) item.life += delta * item.speed
        if (item.life > 1) {
          item.life = 0
          item.dir.randomDirection()
          item.speed = 1.05 + Math.random() * 0.45
        }
        head.copy(item.dir).multiplyScalar(jupiterElectronRadius(item.life))
        tail.copy(item.dir).multiplyScalar(jupiterElectronRadius(Math.max(0, item.life - TRAIL_LIFE)))
      }}
    />
  )
}

function FieldLines() {
  const loops = useMemo(() => {
    const shells = [
      { reach: 0.82, color: '#7fd0ee', radius: 0.0032 },
      { reach: 1.32, color: '#7fd0ee', radius: 0.0036 },
      { reach: 1.92, color: '#d7d7de', radius: 0.0042 },
    ]
    const phis = [0.15, 1.2, 2.25, 3.3, 4.35, 5.4]
    return shells.flatMap((shell) =>
      phis.map((phi) => ({
        curve: new THREE.CatmullRomCurve3(dipolePoints(shell.reach, phi, JUPITER_RADIUS * 1.08)),
        color: shell.color,
        radius: shell.radius,
      })),
    )
  }, [])

  return (
    <group rotation={[0.2, 0, 0.1]}>
      {loops.map((loop, index) => (
        <mesh key={index}>
          <tubeGeometry args={[loop.curve, 72, loop.radius, 6, false]} />
          <meshBasicMaterial color={loop.color} transparent opacity={0.4} depthWrite={false} toneMapped={false} />
        </mesh>
      ))}
    </group>
  )
}

function dipolePoints(reach: number, phi: number, surface: number) {
  const thetaMin = Math.asin(Math.min(0.98, Math.sqrt(surface / reach)))
  const steps = 56
  const points: THREE.Vector3[] = []
  for (let i = 0; i <= steps; i += 1) {
    const theta = thetaMin + ((Math.PI - thetaMin * 2) * i) / steps
    const radius = reach * Math.sin(theta) * Math.sin(theta)
    points.push(
      new THREE.Vector3(
        radius * Math.sin(theta) * Math.cos(phi),
        radius * Math.cos(theta),
        radius * Math.sin(theta) * Math.sin(phi),
      ),
    )
  }
  return points
}

function beamPoint(sign: number, angle: number, life: number) {
  const distance = 0.2 + life * 1.22
  const spread = (Math.max(0, distance - 0.16) / 1.35) * 0.14
  return {
    x: Math.cos(angle) * spread,
    y: sign * distance,
    z: Math.sin(angle) * spread,
  }
}

const GROUND_RADIUS = 3.2
const GROUND_CENTER_Y = -3.9
const ALBEDO_COUNT = 36

function LunarFrame({ reduced }: { reduced: boolean }) {
  const webgl = useMemo(() => hasWebGL(), [])
  const { ref: frameRef, shown, seen } = useStageActivity<HTMLDivElement>()

  if (!webgl) {
    return (
      <ImagePlaceholder title={sources()[3].title} />
    )
  }

  const playing = shown && !reduced

  return (
    <div
      ref={frameRef}
      className="ray-frame ray-moon"
      role="img"
      aria-label={sources()[3].diagram}
    >
      {seen ? <Canvas
        dpr={[1, 1.5]}
        camera={{ fov: 30, position: [0, 1.02, 3.15] }}
        frameloop={playing ? 'always' : 'demand'}
        gl={{ antialias: true, alpha: false, stencil: false, powerPreference: 'default' }}
        style={{ position: 'absolute', inset: 0, touchAction: 'pan-y', pointerEvents: 'none' }}
        onCreated={({ gl, camera }) => {
          gl.toneMapping = THREE.NoToneMapping
          gl.setClearColor('#000000', 1)
          camera.lookAt(0, 0, 0)
        }}
      >
        <LunarGround />
        <AlbedoParticles playing={playing} />
      </Canvas> : null}
    </div>
  )
}

function LunarGround() {
  return (
    <mesh position={[0, GROUND_CENTER_Y, 0]}>
      <sphereGeometry args={[GROUND_RADIUS, 72, 40, 0, Math.PI * 2, 0, 0.95]} />
      <shaderMaterial
        toneMapped={false}
        vertexShader={`
          varying vec3 vPos;
          varying vec3 vNormal;
          void main() {
            vPos = position;
            vNormal = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          varying vec3 vPos;
          varying vec3 vNormal;
          void main() {
            float crest = clamp((vPos.y - 1.95) / 1.25, 0.0, 1.0);
            float radial = clamp(length(vPos.xz) / 2.5, 0.0, 1.0);
            vec3 highland = vec3(0.76, 0.77, 0.78);
            vec3 mare = vec3(0.40, 0.41, 0.43);
            vec3 limb = vec3(0.14, 0.15, 0.17);
            vec3 color = mix(mare, highland, smoothstep(0.05, 0.92, crest));
            color = mix(color, limb, smoothstep(0.28, 1.0, radial));
            float light = dot(normalize(vNormal), normalize(vec3(-0.2, 0.82, 0.4)));
            float shade = 0.62 + 0.38 * clamp(light, 0.0, 1.0);
            gl_FragColor = vec4(color * shade, 1.0);
          }
        `}
      />
    </mesh>
  )
}

function AlbedoParticles({ playing }: { playing: boolean }) {
  const streaks = useStreaks(ALBEDO_COUNT, SPACE_PARTICLE)
  const flight = useMemo(
    () =>
      Array.from({ length: ALBEDO_COUNT }, () => ({
        x: (Math.random() - 0.5) * 1.7,
        z: -0.2 + Math.random() * 1.2,
        angle: Math.random() * Math.PI * 2,
        phase: Math.random() < 0.55 ? 0 : 1,
        life: Math.random(),
        inSpeed: 0.34 + Math.random() * 0.22,
        outSpeed: 0.28 + Math.random() * 0.2,
      })),
    [],
  )

  return (
    <StreakField
      streaks={streaks}
      tick={(index, delta, head, tail) => {
        const item = flight[index]
        if (playing && delta > 0) item.life += delta * (item.phase === 0 ? item.inSpeed : item.outSpeed)
        if (item.life > 1) {
          item.life = 0
          if (item.phase === 0) {
            item.phase = 1
          } else {
            item.phase = 0
            item.x = (Math.random() - 0.5) * 1.7
            item.z = -0.2 + Math.random() * 1.2
            item.angle = Math.random() * Math.PI * 2
            item.inSpeed = 0.34 + Math.random() * 0.22
            item.outSpeed = 0.28 + Math.random() * 0.2
          }
        }
        const lead = albedoPoint(item)
        const follow = albedoPoint({ ...item, life: Math.max(0, item.life - TRAIL_LIFE) })
        head.set(lead.x, lead.y, lead.z)
        tail.set(follow.x, follow.y, follow.z)
        return item.phase === 0 ? SPACE_PARTICLE : MOON_PARTICLE
      }}
    />
  )
}

function lunarSurfaceY(x: number, z: number) {
  const rest = GROUND_RADIUS * GROUND_RADIUS - x * x - z * z
  if (rest <= 0) return 0
  return GROUND_CENTER_Y + Math.sqrt(rest)
}

function albedoPoint(item: { x: number; z: number; angle: number; phase: number; life: number }) {
  const ground = lunarSurfaceY(item.x, item.z)
  if (item.phase === 0) {
    return {
      x: item.x,
      y: 0.82 + (ground + 0.03 - 0.82) * item.life,
      z: item.z,
    }
  }
  return {
    x: item.x + Math.cos(item.angle) * item.life * 0.4,
    y: ground + 0.03 + item.life * 0.74,
    z: item.z + Math.sin(item.angle) * item.life * 0.26,
  }
}

type Streak = { trail: THREE.LineSegments; dot: THREE.Points }

const streakHead = new THREE.Vector3()
const streakTail = new THREE.Vector3()
const particleCircle = makeParticleCircle()

function useStreaks(count: number, color: string) {
  const streaks = useMemo(() => Array.from({ length: count }, () => makeStreak(color)), [count, color])
  useEffect(() => {
    return () => {
      streaks.forEach((streak) => {
        streak.trail.geometry.dispose()
        ;(streak.trail.material as THREE.Material).dispose()
        streak.dot.geometry.dispose()
        ;(streak.dot.material as THREE.Material).dispose()
      })
    }
  }, [streaks])
  return streaks
}

function StreakField({
  streaks,
  tick,
}: {
  streaks: Streak[]
  tick: (index: number, delta: number, head: THREE.Vector3, tail: THREE.Vector3) => string | void
}) {
  const tickRef = useRef(tick)
  tickRef.current = tick

  useLayoutEffect(() => {
    streaks.forEach((streak, index) => {
      const color = tickRef.current(index, 0, streakHead, streakTail)
      placeStreak(streak, streakHead, streakTail, color || undefined)
    })
  }, [streaks])

  useFrame((_, delta) => {
    const step = Math.min(delta, 0.05)
    streaks.forEach((streak, index) => {
      const color = tickRef.current(index, step, streakHead, streakTail)
      placeStreak(streak, streakHead, streakTail, color || undefined)
    })
  })

  return (
    <group>
      {streaks.map((streak, index) => (
        <group key={index}>
          <primitive object={streak.trail} />
          <primitive object={streak.dot} />
        </group>
      ))}
    </group>
  )
}

function radialEnds(
  angle: number,
  life: number,
  near: number,
  span: number,
  head: THREE.Vector3,
  tail: THREE.Vector3,
) {
  const lead = near + life * span
  const follow = near + Math.max(0, life - TRAIL_LIFE) * span
  head.set(Math.cos(angle) * lead, Math.sin(angle) * lead, 0)
  tail.set(Math.cos(angle) * follow, Math.sin(angle) * follow, 0)
}

function placeStreak(streak: Streak, head: THREE.Vector3, tail: THREE.Vector3, color?: string) {
  const line = streak.trail.geometry.getAttribute('position') as THREE.BufferAttribute
  line.setXYZ(0, tail.x, tail.y, tail.z)
  line.setXYZ(1, head.x, head.y, head.z)
  line.needsUpdate = true
  const dot = streak.dot.geometry.getAttribute('position') as THREE.BufferAttribute
  dot.setXYZ(0, head.x, head.y, head.z)
  dot.needsUpdate = true
  if (!color) return
  ;(streak.trail.material as THREE.LineBasicMaterial).color.set(color)
  ;(streak.dot.material as THREE.PointsMaterial).color.set(color)
}

function makeStreak(color: string): Streak {
  const trailGeometry = new THREE.BufferGeometry()
  trailGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(6), 3))
  const trailMaterial = new THREE.LineBasicMaterial({
    color,
    transparent: true,
    opacity: TRAIL_OPACITY,
    depthWrite: false,
    toneMapped: false,
  })
  const trail = new THREE.LineSegments(trailGeometry, trailMaterial)
  trail.frustumCulled = false
  trail.renderOrder = 3

  const dotGeometry = new THREE.BufferGeometry()
  dotGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(3), 3))
  const dotMaterial = new THREE.PointsMaterial({
    color,
    map: particleCircle,
    size: DOT_SIZE,
    sizeAttenuation: false,
    transparent: true,
    alphaTest: 0.45,
    opacity: 1,
    depthWrite: false,
    toneMapped: false,
  })
  const dot = new THREE.Points(dotGeometry, dotMaterial)
  dot.frustumCulled = false
  dot.renderOrder = 4
  return { trail, dot }
}

function makeParticleCircle() {
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
