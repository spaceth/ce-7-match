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
import { copy, fill } from '../content'

const MODES = copy.explorer.modes
const text = copy.explorer

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
  const badge = text.badges[mode]

  return (
    <CanvasGuard fallback={<FallbackView reason="webgl" />}>
      <section ref={viewerRef} className="viewer" aria-label={text.label}>
        <div className="toolbar">
          <div className="modes" role="tablist" aria-label={text.modeLabel}>
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
              <p className="kicker">{text.overview.kicker}</p>
              <h2>{text.overview.title}</h2>
              <p>{text.overview.body}</p>
              {text.overview.housing ? <p>{text.overview.housing}</p> : null}
              {modelError && <p className="note">{modelError}</p>}
              <div className="actions">
                <button type="button" onClick={() => changeMode('inside')}>
                  {text.overview.inside}
                </button>
                <button type="button" onClick={() => changeMode('particle')}>
                  {text.overview.follow}
                </button>
              </div>
            </>
          )}

          {mode === 'inside' && (
            <>
              <p className="kicker">{text.inside.kicker}</p>
              <h2>{layer.name}</h2>
              <p aria-live="polite">{layer.body}</p>
              {text.inside.note ? <p className="note">{text.inside.note}</p> : null}
              <p className="axis-note">{text.inside.axis}</p>
              <div className="pips" role="listbox" aria-label={text.inside.layersLabel}>
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
                {spread ? text.inside.gather : text.inside.spread}
              </button>
              <Legend />
            </>
          )}

          {mode === 'particle' && (
            <>
              <p className="kicker">{text.particle.kicker}</p>
              <h2>{text.particle.title}</h2>
              <h3>{eventStep.title}</h3>
              <p aria-live="polite">{eventStep.body}</p>
              <div className="segment" role="group" aria-label={text.particle.entranceLabel}>
                <button type="button" aria-pressed={entrance === 'space'} onClick={() => chooseEntrance('space')}>
                  {text.particle.space}
                </button>
                <button type="button" aria-pressed={entrance === 'moon'} onClick={() => chooseEntrance('moon')}>
                  {text.particle.moon}
                </button>
              </div>
              <div className="progress" aria-hidden="true">
                <div ref={progressEl} />
              </div>
              <div className="transport">
                <button type="button" onClick={() => seek(step - 1)} disabled={step === 0}>
                  {copy.ui.previous}
                </button>
                <button type="button" onClick={togglePlay} aria-label={playing ? text.particle.pause : text.particle.play}>
                  {playing ? copy.ui.pause : copy.ui.play}
                </button>
                <button type="button" onClick={() => seek(step + 1)} disabled={step === STEP_COUNT - 1}>
                  {copy.ui.next}
                </button>
                <button type="button" onClick={replay}>
                  {copy.ui.replay}
                </button>
              </div>
              <div className="dots" role="group" aria-label={text.particle.stepsLabel}>
                {Array.from({ length: STEP_COUNT }, (_, index) => (
                  <button
                    key={index}
                    type="button"
                    aria-label={fill(text.particle.step, { n: index + 1, title: stepCopy(index, entrance).title })}
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
              <p className="note">{text.particle.note}</p>
              <Legend />
            </>
          )}
        </div>

        <StageFrame className="stage" role="region" aria-label={text.stage} aria-describedby="viewer-copy">
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
              <p>{text.modelFailed}</p>
              <button type="button" onClick={() => changeMode('inside')}>
                {text.viewSchematic}
              </button>
            </div>
          )}
          <div className="view-controls">
            <button type="button" aria-label={copy.ui.zoomIn} onClick={() => viewRef.current?.zoom(0.82)}>
              <PlusIcon />
            </button>
            <button type="button" aria-label={copy.ui.zoomOut} onClick={() => viewRef.current?.zoom(1 / 0.82)}>
              <MinusIcon />
            </button>
            <button type="button" aria-label={copy.ui.resetView} onClick={() => setResetToken((value) => value + 1)}>
              <ResetIcon />
            </button>
            {mode === 'overview' && (
              <button
                type="button"
                aria-label={autoRotate ? copy.ui.stopRotation : copy.ui.rotateGently}
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
        <i className="swatch silicon" /> {text.legend.silicon}
      </li>
      <li>
        <i className="swatch delta" /> {text.legend.delta}
      </li>
      <li>
        <i className="swatch energy" /> {text.legend.energy}
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
