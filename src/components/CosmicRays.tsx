import { Canvas, useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { useReducedMotion } from '../lib/useReducedMotion'
import { hasWebGL } from '../lib/webgl'

const SOURCES = [
  {
    title: 'Solar Cosmic Rays',
    body: 'The Sun releases bursts of energetic particles, especially during flares and eruptions. They arrive suddenly, then fade.',
  },
  {
    title: 'Galactic Cosmic Rays',
    body: 'A steadier rain comes from beyond the solar system. These are among the most energetic particles, likely sped up by the remnants of exploded stars.',
  },
  {
    title: 'Jovian Electrons',
    body: 'Jupiter’s vast magnetic field accelerates electrons. Some of them cross the solar system and can be measured near the Moon.',
  },
  {
    title: 'Lunar Albedo',
    body: 'Particles that strike the lunar surface can knock new particles back out. Those emerging particles are lunar albedo — not reflected light.',
  },
]

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
      <section className="ray-sources" aria-label="Sources of particles MATCH can study">
        <h3>More than one source.</h3>
        <div className="ray-grid">
          {SOURCES.map((source) => (
            <article key={source.title}>
              {source.title === 'Solar Cosmic Rays' ? (
                <SunFrame reduced={reduced} />
              ) : source.title === 'Galactic Cosmic Rays' ? (
                <PulsarFrame reduced={reduced} />
              ) : source.title === 'Jovian Electrons' ? (
                <JupiterFrame reduced={reduced} />
              ) : source.title === 'Lunar Albedo' ? (
                <LunarFrame reduced={reduced} />
              ) : (
                <div className="ray-frame" role="img" aria-label={`Image placeholder for ${source.title}`}>
                  <span>Image</span>
                </div>
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
            <p className="kicker">Around Earth</p>
            <h3 id="magnetotail-title">In and out of the magnetotail.</h3>
            <p>
              The Moon circles Earth about once a month. The solar wind blows Earth’s magnetic field into a long tail on the
              night side. For several days each month the Moon crosses that tail, then returns to the solar wind. MATCH
              flies with the Moon, so one orbit carries the detector through more than one particle environment.
            </p>
          </div>
          <div className="tail-stage">
            <svg viewBox="0 0 960 520" role="img" aria-labelledby="magnetotail-title magnetotail-status">
              <title>The Moon crossing Earth’s magnetotail</title>
              <defs>
                <filter id="tail-edge" x="-12%" y="-30%" width="124%" height="160%">
                  <feGaussianBlur stdDeviation="7" />
                </filter>
              </defs>
              <g className="tail-wind" aria-hidden="true">
                <text x="28" y="128">
                  Solar wind
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
                  <circle key={particle.y} cx={particle.x} cy={particle.y} r="2.2">
                    {!reduced && (
                      <animate
                        attributeName="cx"
                        from="16"
                        to="168"
                        dur={particle.duration}
                        begin={particle.delay}
                        repeatCount="indefinite"
                      />
                    )}
                  </circle>
                ))}
              </g>
              <path className="tail-bow" d="M292 150 C176 196 168 348 292 392" />
              <text className="tail-label" x="228" y="364" textAnchor="end">
                Bow shock
              </text>
              <path
                className="tail-body"
                d="M292 198 C214 226 206 314 292 340 C500 402 730 418 940 386 L940 150 C730 118 500 136 292 198 Z"
              />
              <text className="tail-label" x="620" y="250">
                Magnetotail
              </text>
              <circle className="tail-orbit" cx={EARTH.x} cy={EARTH.y} r={ORBIT} />
              <circle className="tail-earth" cx={EARTH.x} cy={EARTH.y} r="18" />
              <text className="tail-label" x={EARTH.x - 18} y={EARTH.y + 36}>
                Earth
              </text>
              <g className="tail-moon">
                <circle cx={moonX} cy={moonY} r="7" />
              </g>
            </svg>
            <p id="magnetotail-status" className="tail-status" data-in={inTail}>
              <span>{inTail ? 'Inside the magnetotail' : 'In the solar wind'}</span>
              {inTail
                ? 'Earth’s magnetic tail stands between the Moon and the solar wind. The particles MATCH can record are not the same mix.'
                : 'Outside the tail, particles from the Sun, the galaxy, and Jupiter can reach the Moon more directly.'}
            </p>
            <p className="tail-caption">
              Illustrative. The Moon’s orbit is not drawn to scale. Chang’e-7 / MATCH rides with the Moon.
            </p>
          </div>
        </div>
      </section>

      <p className="ray-close">That is why Thailand goes to orbit around the Moon.</p>
      <p className="ray-close-lead">
        A detector on Earth sits under the atmosphere and inside the magnetic field. From lunar orbit, MATCH passes
        through the solar wind and Earth’s magnetotail, and it can watch particles leaving the lunar surface. One flight
        can meet solar cosmic rays, galactic cosmic rays, Jovian electrons, and lunar albedo.
      </p>
    </div>
  )
}

function SunFrame({ reduced }: { reduced: boolean }) {
  const webgl = useMemo(() => hasWebGL(), [])
  const frameRef = useRef<HTMLDivElement>(null)
  const [shown, setShown] = useState(true)

  useEffect(() => {
    const node = frameRef.current
    if (!node) return
    const observer = new IntersectionObserver(([entry]) => setShown(entry.isIntersecting), { threshold: 0.15 })
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  if (!webgl) {
    return (
      <div className="ray-frame" role="img" aria-label="Image placeholder for Solar Cosmic Rays">
        <span>Image</span>
      </div>
    )
  }

  const playing = shown && !reduced

  return (
    <div ref={frameRef} className="ray-frame ray-sun" role="img" aria-label="Glowing orange Sun with particles leaving it">
      <Canvas
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
      </Canvas>
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
            vec3 corona = vec3(1.0, 0.42, 0.05);
            vec3 core = vec3(1.0, 0.96, 0.86);
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
  const points = useRef<THREE.Points>(null)
  const flight = useMemo(() => {
    return Array.from({ length: PARTICLE_COUNT }, () => ({
      angle: Math.random() * Math.PI * 2,
      speed: 0.16 + Math.random() * 0.2,
      life: Math.random(),
    }))
  }, [])

  useFrame((_, delta) => {
    const mesh = points.current
    if (!mesh) return
    const position = mesh.geometry.getAttribute('position') as THREE.BufferAttribute
    const lifeAttr = mesh.geometry.getAttribute('aLife') as THREE.BufferAttribute
    const step = Math.min(delta, 0.05)
    flight.forEach((item, index) => {
      if (playing) item.life += step * item.speed
      if (item.life > 1) {
        item.life = 0
        item.angle = Math.random() * Math.PI * 2
        item.speed = 0.16 + Math.random() * 0.2
      }
      const radius = 0.46 + item.life * 0.95
      position.setXY(index, Math.cos(item.angle) * radius, Math.sin(item.angle) * radius)
      lifeAttr.setX(index, item.life)
    })
    position.needsUpdate = true
    lifeAttr.needsUpdate = true
  })

  const geometry = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3)
    const lives = new Float32Array(PARTICLE_COUNT)
    flight.forEach((item, index) => {
      const radius = 0.46 + item.life * 0.95
      positions[index * 3] = Math.cos(item.angle) * radius
      positions[index * 3 + 1] = Math.sin(item.angle) * radius
      lives[index] = item.life
    })
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('aLife', new THREE.BufferAttribute(lives, 1))
    return geometry
  }, [flight])

  useEffect(() => {
    return () => geometry.dispose()
  }, [geometry])

  return (
    <points ref={points} geometry={geometry} frustumCulled={false} renderOrder={2}>
      <shaderMaterial
        transparent
        depthWrite={false}
        toneMapped={false}
        vertexShader={`
          attribute float aLife;
          varying float vLife;
          void main() {
            vLife = aLife;
            vec4 view = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = 3.5;
            gl_Position = projectionMatrix * view;
          }
        `}
        fragmentShader={`
          varying float vLife;
          void main() {
            float dist = length(gl_PointCoord - 0.5);
            float dot = smoothstep(0.5, 0.12, dist);
            float fade = smoothstep(0.0, 0.08, vLife) * smoothstep(1.0, 0.62, vLife);
            gl_FragColor = vec4(1.0, 0.9, 0.72, dot * fade);
          }
        `}
      />
    </points>
  )
}

function PulsarFrame({ reduced }: { reduced: boolean }) {
  const webgl = useMemo(() => hasWebGL(), [])
  const frameRef = useRef<HTMLDivElement>(null)
  const [shown, setShown] = useState(true)

  useEffect(() => {
    const node = frameRef.current
    if (!node) return
    const observer = new IntersectionObserver(([entry]) => setShown(entry.isIntersecting), { threshold: 0.15 })
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  if (!webgl) {
    return (
      <div className="ray-frame" role="img" aria-label="Image placeholder for Galactic Cosmic Rays">
        <span>Image</span>
      </div>
    )
  }

  const playing = shown && !reduced

  return (
    <div ref={frameRef} className="ray-frame ray-pulsar" role="img" aria-label="Rotating blue pulsar">
      <Canvas
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
      </Canvas>
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
              vec3 halo = vec3(0.55, 0.82, 1.0);
              vec3 hot = vec3(1.0, 1.0, 1.0);
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
            vec3 color = mix(vec3(0.28, 0.58, 1.0), vec3(0.94, 0.98, 1.0), along);
            gl_FragColor = vec4(color, alpha);
          }
        `}
      />
    </mesh>
  )
}

const BEAM_PARTICLES = 28

function BeamParticles({ playing }: { playing: boolean }) {
  const points = useRef<THREE.Points>(null)
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
  const geometry = useMemo(() => {
    const positions = new Float32Array(BEAM_PARTICLES * 3)
    const lives = new Float32Array(BEAM_PARTICLES)
    flight.forEach((item, index) => {
      const place = beamPoint(item.sign, item.angle, item.life)
      positions[index * 3] = place.x
      positions[index * 3 + 1] = place.y
      positions[index * 3 + 2] = place.z
      lives[index] = item.life
    })
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('aLife', new THREE.BufferAttribute(lives, 1))
    return geometry
  }, [flight])

  useEffect(() => {
    return () => geometry.dispose()
  }, [geometry])

  useFrame((_, delta) => {
    const mesh = points.current
    if (!mesh) return
    const position = mesh.geometry.getAttribute('position') as THREE.BufferAttribute
    const lifeAttr = mesh.geometry.getAttribute('aLife') as THREE.BufferAttribute
    const step = Math.min(delta, 0.05)
    flight.forEach((item, index) => {
      if (playing) item.life += step * item.speed
      if (item.life > 1) {
        item.life = 0
        item.angle = Math.random() * Math.PI * 2
        item.speed = 0.28 + Math.random() * 0.28
      }
      const place = beamPoint(item.sign, item.angle, item.life)
      position.setXYZ(index, place.x, place.y, place.z)
      lifeAttr.setX(index, item.life)
    })
    position.needsUpdate = true
    lifeAttr.needsUpdate = true
  })

  return (
    <points ref={points} geometry={geometry} frustumCulled={false} renderOrder={2}>
      <shaderMaterial
        transparent
        depthWrite={false}
        toneMapped={false}
        vertexShader={`
          attribute float aLife;
          varying float vLife;
          void main() {
            vLife = aLife;
            vec4 view = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = 3.2;
            gl_Position = projectionMatrix * view;
          }
        `}
        fragmentShader={`
          varying float vLife;
          void main() {
            float dist = length(gl_PointCoord - 0.5);
            float dot = smoothstep(0.5, 0.1, dist);
            float fade = smoothstep(0.0, 0.08, vLife) * smoothstep(1.0, 0.7, vLife);
            gl_FragColor = vec4(0.9, 0.96, 1.0, dot * fade);
          }
        `}
      />
    </points>
  )
}

function JupiterFrame({ reduced }: { reduced: boolean }) {
  const webgl = useMemo(() => hasWebGL(), [])
  const frameRef = useRef<HTMLDivElement>(null)
  const [shown, setShown] = useState(true)

  useEffect(() => {
    const node = frameRef.current
    if (!node) return
    const observer = new IntersectionObserver(([entry]) => setShown(entry.isIntersecting), { threshold: 0.15 })
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  if (!webgl) {
    return (
      <div className="ray-frame" role="img" aria-label="Image placeholder for Jovian Electrons">
        <span>Image</span>
      </div>
    )
  }

  const playing = shown && !reduced

  return (
    <div ref={frameRef} className="ray-frame ray-jupiter" role="img" aria-label="Rotating Jupiter with a blue magnetic glow, field lines, and a few particles leaving">
      <Canvas
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
      </Canvas>
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
                vec3 orange = vec3(0.91, 0.52, 0.18);
                float light = dot(normalize(vNormal), normalize(vec3(0.35, 0.2, 1.0)));
                float shade = 0.28 + 0.72 * clamp(light, 0.0, 1.0);
                gl_FragColor = vec4(orange * shade, 1.0);
              }
            `}
          />
        </mesh>
        <mesh>
          <sphereGeometry args={[JUPITER_RADIUS * 4.2, 48, 32]} />
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
                float rim = pow(1.0 - facing, 1.45);
                float body = pow(facing, 2.2) * 0.28;
                float glow = rim * 0.85 + body;
                vec3 blue = vec3(0.28, 0.55, 1.0);
                gl_FragColor = vec4(blue * glow * 0.62, 1.0);
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
  const points = useRef<THREE.Points>(null)
  const flight = useMemo(
    () =>
      Array.from({ length: JUPITER_PARTICLES }, () => ({
        dir: new THREE.Vector3().randomDirection(),
        speed: 1.05 + Math.random() * 0.45,
        life: Math.random(),
      })),
    [],
  )

  useFrame((_, delta) => {
    const mesh = points.current
    if (!mesh) return
    const position = mesh.geometry.getAttribute('position') as THREE.BufferAttribute
    const lifeAttr = mesh.geometry.getAttribute('aLife') as THREE.BufferAttribute
    const step = Math.min(delta, 0.05)
    flight.forEach((item, index) => {
      if (playing) item.life += step * item.speed
      if (item.life > 1) {
        item.life = 0
        item.dir.randomDirection()
        item.speed = 1.05 + Math.random() * 0.45
      }
      const radius = jupiterElectronRadius(item.life)
      position.setXYZ(index, item.dir.x * radius, item.dir.y * radius, item.dir.z * radius)
      lifeAttr.setX(index, item.life)
    })
    position.needsUpdate = true
    lifeAttr.needsUpdate = true
  })

  const geometry = useMemo(() => {
    const positions = new Float32Array(JUPITER_PARTICLES * 3)
    const lives = new Float32Array(JUPITER_PARTICLES)
    flight.forEach((item, index) => {
      const radius = jupiterElectronRadius(item.life)
      positions[index * 3] = item.dir.x * radius
      positions[index * 3 + 1] = item.dir.y * radius
      positions[index * 3 + 2] = item.dir.z * radius
      lives[index] = item.life
    })
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('aLife', new THREE.BufferAttribute(lives, 1))
    return geometry
  }, [flight])

  useEffect(() => {
    return () => geometry.dispose()
  }, [geometry])

  return (
    <points ref={points} geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        transparent
        depthWrite={false}
        toneMapped={false}
        vertexShader={`
          attribute float aLife;
          varying float vLife;
          void main() {
            vLife = aLife;
            gl_PointSize = 3.2;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          varying float vLife;
          void main() {
            float dist = length(gl_PointCoord - 0.5);
            float dot = smoothstep(0.5, 0.15, dist);
            float fade = smoothstep(0.0, 0.1, vLife) * smoothstep(1.0, 0.58, vLife);
            gl_FragColor = vec4(0.72, 0.86, 1.0, dot * fade);
          }
        `}
      />
    </points>
  )
}

function FieldLines() {
  const loops = useMemo(() => {
    const shells = [
      { reach: 0.82, color: '#8ec4ff', radius: 0.0032 },
      { reach: 1.32, color: '#c5e4ff', radius: 0.0036 },
      { reach: 1.92, color: '#f4f9ff', radius: 0.0042 },
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
          <meshBasicMaterial color={loop.color} transparent opacity={0.92} depthWrite={false} toneMapped={false} />
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
  const frameRef = useRef<HTMLDivElement>(null)
  const [shown, setShown] = useState(true)

  useEffect(() => {
    const node = frameRef.current
    if (!node) return
    const observer = new IntersectionObserver(([entry]) => setShown(entry.isIntersecting), { threshold: 0.15 })
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  if (!webgl) {
    return (
      <div className="ray-frame" role="img" aria-label="Image placeholder for Lunar Albedo">
        <span>Image</span>
      </div>
    )
  }

  const playing = shown && !reduced

  return (
    <div
      ref={frameRef}
      className="ray-frame ray-moon"
      role="img"
      aria-label="Lunar surface with particles striking it and particles leaving upward"
    >
      <Canvas
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
      </Canvas>
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
  const points = useRef<THREE.Points>(null)
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
  const geometry = useMemo(() => {
    const positions = new Float32Array(ALBEDO_COUNT * 3)
    const lives = new Float32Array(ALBEDO_COUNT)
    const phases = new Float32Array(ALBEDO_COUNT)
    flight.forEach((item, index) => {
      const place = albedoPoint(item)
      positions[index * 3] = place.x
      positions[index * 3 + 1] = place.y
      positions[index * 3 + 2] = place.z
      lives[index] = item.life
      phases[index] = item.phase
    })
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('aLife', new THREE.BufferAttribute(lives, 1))
    geometry.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1))
    return geometry
  }, [flight])

  useEffect(() => {
    return () => geometry.dispose()
  }, [geometry])

  useFrame((_, delta) => {
    const mesh = points.current
    if (!mesh) return
    const position = mesh.geometry.getAttribute('position') as THREE.BufferAttribute
    const lifeAttr = mesh.geometry.getAttribute('aLife') as THREE.BufferAttribute
    const phaseAttr = mesh.geometry.getAttribute('aPhase') as THREE.BufferAttribute
    const step = Math.min(delta, 0.05)
    flight.forEach((item, index) => {
      if (playing) item.life += step * (item.phase === 0 ? item.inSpeed : item.outSpeed)
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
      const place = albedoPoint(item)
      position.setXYZ(index, place.x, place.y, place.z)
      lifeAttr.setX(index, item.life)
      phaseAttr.setX(index, item.phase)
    })
    position.needsUpdate = true
    lifeAttr.needsUpdate = true
    phaseAttr.needsUpdate = true
  })

  return (
    <points ref={points} geometry={geometry} frustumCulled={false} renderOrder={2}>
      <shaderMaterial
        transparent
        depthWrite={false}
        toneMapped={false}
        vertexShader={`
          attribute float aLife;
          attribute float aPhase;
          varying float vLife;
          varying float vPhase;
          void main() {
            vLife = aLife;
            vPhase = aPhase;
            vec4 view = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = 4.2;
            gl_Position = projectionMatrix * view;
          }
        `}
        fragmentShader={`
          varying float vLife;
          varying float vPhase;
          void main() {
            float dist = length(gl_PointCoord - 0.5);
            float dot = smoothstep(0.5, 0.12, dist);
            float fade = smoothstep(0.0, 0.08, vLife) * smoothstep(1.0, 0.68, vLife);
            vec3 incoming = vec3(0.78, 0.88, 1.0);
            vec3 leaving = vec3(1.0, 0.93, 0.78);
            vec3 color = mix(incoming, leaving, step(0.5, vPhase));
            gl_FragColor = vec4(color, dot * fade);
          }
        `}
      />
    </points>
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
