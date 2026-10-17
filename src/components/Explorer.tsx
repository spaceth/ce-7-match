import { Component, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import {
  LAYERS,
  STEP_COUNT,
  layersActiveAt,
  stepCopy,
  timeForStep,
  type Entrance,
  type Mode,
  type Playback,
} from '../lib/instrument'
import { useReducedMotion } from '../lib/useReducedMotion'
import { useStageActivity } from '../lib/useStageActivity'
import { FallbackView } from './FallbackView'
import { StageFrame } from './StageScreen'
import { LoadState, Viewport, type ViewHandle } from './Viewport'

const MODES: { id: Mode; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'inside', label: 'Inside MATCH' },
  { id: 'particle', label: 'Follow a particle' },
]

export function Explorer() {
  const reduced = useReducedMotion()
  const { ref: viewerRef, seen } = useStageActivity<HTMLElement>()
  const [mode, setMode] = useState<Mode>('overview')
  const [selected, setSelected] = useState('si1')
  const [spread, setSpread] = useState(true)
  const [entrance, setEntrance] = useState<Entrance>('space')
  const [playing, setPlaying] = useState(false)
  const [step, setStep] = useState(0)
  const [ready, setReady] = useState(false)
  const [modelError, setModelError] = useState<string | null>(null)
  const [resetToken, setResetToken] = useState(0)
  const [interacting, setInteracting] = useState(false)
  const [autoRotate, setAutoRotate] = useState(
    () => !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  const motion = useRef<Playback>({
    spread: 0.02,
    spreadTarget: 1,
    t: 0,
    playing: false,
    reduced,
    entrance: 'space',
    step: 0,
    mode: 'overview',
    selected: 'si1',
  })
  const progressEl = useRef<HTMLDivElement>(null)
  const viewRef = useRef<ViewHandle>(null)

  motion.current.mode = mode
  motion.current.selected = selected
  motion.current.entrance = entrance
  motion.current.reduced = reduced
  motion.current.playing = playing && mode === 'particle'
  if (mode === 'inside') motion.current.spreadTarget = spread ? 1 : 0
  if (mode === 'particle') motion.current.spreadTarget = 0.82

  const onReady = useCallback(() => setReady(true), [])
  const onModelError = useCallback((message: string) => {
    setModelError(message)
    setReady(true)
  }, [])
  const onStep = useCallback((next: number) => setStep(next), [])
  const onEnded = useCallback(() => setPlaying(false), [])

  useLayoutEffect(() => {
    motion.current.step = step
  }, [step])

  useEffect(() => {
    if (!playing || !reduced || mode !== 'particle') return
    const id = window.setInterval(() => {
      setStep((current) => {
        if (current >= STEP_COUNT - 1) {
          setPlaying(false)
          return current
        }
        const next = current + 1
        motion.current.t = timeForStep(next)
        motion.current.step = next
        if (progressEl.current) progressEl.current.style.transform = `scaleX(${motion.current.t})`
        return next
      })
    }, 1200)
    return () => window.clearInterval(id)
  }, [mode, playing, reduced])

  function changeMode(next: Mode) {
    if (motion.current.mode === 'overview' && next !== 'overview') motion.current.spread = 0.02
    if (next !== 'particle') {
      motion.current.playing = false
      setPlaying(false)
    }
    setMode(next)
  }

  function seek(next: number) {
    const clamped = Math.min(STEP_COUNT - 1, Math.max(0, next))
    motion.current.playing = false
    motion.current.t = timeForStep(clamped)
    motion.current.step = clamped
    setPlaying(false)
    setStep(clamped)
    if (progressEl.current) progressEl.current.style.transform = `scaleX(${motion.current.t})`
  }

  function togglePlay() {
    if (playing) {
      motion.current.playing = false
      setPlaying(false)
      return
    }
    if (motion.current.t >= 0.999) {
      motion.current.t = 0
      motion.current.step = 0
      setStep(0)
      if (progressEl.current) progressEl.current.style.transform = 'scaleX(0)'
    }
    motion.current.playing = true
    setPlaying(true)
  }

  function replay() {
    motion.current.t = 0
    motion.current.step = 0
    motion.current.playing = true
    setStep(0)
    setPlaying(true)
    if (progressEl.current) progressEl.current.style.transform = 'scaleX(0)'
  }

  function chooseEntrance(next: Entrance) {
    motion.current.entrance = next
    motion.current.t = 0
    motion.current.step = 0
    motion.current.playing = false
    setEntrance(next)
    setStep(0)
    setPlaying(false)
    if (progressEl.current) progressEl.current.style.transform = 'scaleX(0)'
  }

  const layer = LAYERS.find((item) => item.id === selected) ?? LAYERS[0]
  const eventStep = stepCopy(step, entrance)
  const active = new Set(layersActiveAt(step, entrance))
  const badge = mode === 'overview' ? 'Hardware model' : mode === 'inside' ? 'Detector schematic' : 'Illustrative event'

  return (
    <CanvasGuard fallback={<FallbackView reason="webgl" />}>
      <section ref={viewerRef} className="viewer" aria-label="MATCH explorer">
        <div className="toolbar">
          <div className="modes" role="tablist" aria-label="Explorer mode">
            {MODES.map((item) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                id={`tab-${item.id}`}
                aria-selected={mode === item.id}
                aria-controls="viewer-copy"
                onClick={() => changeMode(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
          <p className="badge">{badge}</p>
        </div>

        <div className="dock" id="viewer-copy" role="tabpanel" aria-labelledby={`tab-${mode}`}>
          {mode === 'overview' && (
            <>
              <p className="kicker">The instrument</p>
              <h2>Two entrances, one axis.</h2>
              <p>
                MATCH is a single layered detector. Window extensions at opposite ends open onto the same bore — one toward space, one toward the Moon.
              </p>
              <p>The housing in this view is the supplied flight-model geometry.</p>
              {modelError && <p className="note">{modelError}</p>}
              <div className="actions">
                <button type="button" onClick={() => changeMode('inside')}>
                  Inside the stack
                </button>
                <button type="button" onClick={() => changeMode('particle')}>
                  Follow a particle
                </button>
              </div>
            </>
          )}

          {mode === 'inside' && (
            <>
              <p className="kicker">Detector schematic</p>
              <h2>{layer.name}</h2>
              <p aria-live="polite">{layer.body}</p>
              <p className="note">
                Schematic, aligned with the hardware bore. Spacing is explanatory — these layers are not separate parts in the model.
              </p>
              <p className="axis-note">Space-facing side to Moon-facing side</p>
              <div className="pips" role="listbox" aria-label="Detector layers">
                {LAYERS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    role="option"
                    aria-selected={item.id === selected}
                    aria-label={item.name}
                    onClick={() => setSelected(item.id)}
                  >
                    {item.pip}
                  </button>
                ))}
              </div>
              <button type="button" className="quiet" aria-pressed={spread} onClick={() => setSpread((value) => !value)}>
                {spread ? 'Gather the layers' : 'Spread the layers'}
              </button>
              <Legend />
            </>
          )}

          {mode === 'particle' && (
            <>
              <p className="kicker">Illustrative event</p>
              <h2>Stopping ion</h2>
              <h3>{eventStep.title}</h3>
              <p aria-live="polite">{eventStep.body}</p>
              <div className="segment" role="group" aria-label="Entrance direction">
                <button type="button" aria-pressed={entrance === 'space'} onClick={() => chooseEntrance('space')}>
                  Space-facing
                </button>
                <button type="button" aria-pressed={entrance === 'moon'} onClick={() => chooseEntrance('moon')}>
                  Moon-facing
                </button>
              </div>
              <div className="progress" aria-hidden="true">
                <div ref={progressEl} />
              </div>
              <div className="transport">
                <button type="button" onClick={() => seek(step - 1)} disabled={step === 0}>
                  Previous
                </button>
                <button type="button" onClick={togglePlay} aria-label={playing ? 'Pause event' : 'Play event'}>
                  {playing ? 'Pause' : 'Play'}
                </button>
                <button type="button" onClick={() => seek(step + 1)} disabled={step === STEP_COUNT - 1}>
                  Next
                </button>
                <button type="button" onClick={replay}>
                  Replay
                </button>
              </div>
              <div className="dots" role="group" aria-label="Event steps">
                {Array.from({ length: STEP_COUNT }, (_, index) => (
                  <button
                    key={index}
                    type="button"
                    aria-label={`Step ${index + 1}: ${stepCopy(index, entrance).title}`}
                    aria-current={index === step ? 'step' : undefined}
                    onClick={() => seek(index)}
                  />
                ))}
              </div>
              <ul className="status" aria-hidden="true">
                {LAYERS.map((item) => (
                  <li key={item.id} data-on={active.has(item.id) ? 'true' : 'false'}>
                    {item.pip}
                  </li>
                ))}
              </ul>
              <p className="note">
                Comparing ΔE with E helps tell particle types apart when the particle stops. The entrance is a direction through MATCH, not proof of an astronomical source.
              </p>
              <Legend />
            </>
          )}
        </div>

        <StageFrame className="stage" role="region" aria-label="3D view of MATCH" aria-describedby="viewer-copy">
          {seen ? (
            <Viewport
              mode={mode}
              selected={selected}
              motion={motion}
              progressEl={progressEl}
              resetToken={resetToken}
              reduced={reduced}
              autoRotate={autoRotate}
              interacting={interacting}
              onInteract={setInteracting}
              onStep={onStep}
              onEnded={onEnded}
              onReady={onReady}
              onModelError={onModelError}
              viewRef={viewRef}
            />
          ) : null}
          <LoadState hidden={!seen || ready} />
          {modelError && mode === 'overview' && (
            <div className="overlay">
              <p>The hardware model could not be loaded.</p>
              <button type="button" onClick={() => changeMode('inside')}>
                View the schematic
              </button>
            </div>
          )}
          <div className="view-controls">
            <button type="button" aria-label="Zoom in" onClick={() => viewRef.current?.zoom(0.82)}>
              <PlusIcon />
            </button>
            <button type="button" aria-label="Zoom out" onClick={() => viewRef.current?.zoom(1 / 0.82)}>
              <MinusIcon />
            </button>
            <button type="button" aria-label="Reset view" onClick={() => setResetToken((value) => value + 1)}>
              <ResetIcon />
            </button>
            {mode === 'overview' && (
              <button
                type="button"
                aria-label={autoRotate ? 'Stop rotation' : 'Rotate gently'}
                aria-pressed={autoRotate}
                onClick={() => setAutoRotate((value) => !value)}
              >
                <RotateIcon />
              </button>
            )}
          </div>
        </StageFrame>
      </section>
    </CanvasGuard>
  )
}

function Legend() {
  return (
    <ul className="legend">
      <li>
        <i className="swatch silicon" /> Silicon tracker
      </li>
      <li>
        <i className="swatch delta" /> ΔE scintillator
      </li>
      <li>
        <i className="swatch energy" /> E scintillator
      </li>
    </ul>
  )
}

class CanvasGuard extends Component<{ children: React.ReactNode; fallback: React.ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  render() {
    if (this.state.error) return this.props.fallback
    return this.props.children
  }
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}

function MinusIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12h14" />
    </svg>
  )
}

function ResetIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 12a8 8 0 1 0 2.3-5.6" />
      <path d="M4 4v5h5" />
    </svg>
  )
}

function RotateIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20 12a8 8 0 1 1-2.3-5.6" />
      <path d="M20 4v5h-5" />
    </svg>
  )
}
