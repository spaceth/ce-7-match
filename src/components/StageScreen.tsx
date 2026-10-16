import { useEffect, useRef, useState, type HTMLAttributes, type ReactNode, type RefObject } from 'react'

type ScreenMode = 'off' | 'native' | 'overlay'

function currentFullscreen() {
  const legacy = document as Document & { webkitFullscreenElement?: Element | null }
  return document.fullscreenElement ?? legacy.webkitFullscreenElement ?? null
}

function useStageScreen(stageRef: RefObject<HTMLDivElement | null>) {
  const [mode, setModeState] = useState<ScreenMode>('off')
  const modeRef = useRef<ScreenMode>('off')

  function setMode(next: ScreenMode) {
    modeRef.current = next
    setModeState(next)
  }

  useEffect(() => {
    const sync = () => {
      if (currentFullscreen() === stageRef.current) setMode('native')
      else if (modeRef.current === 'native') setMode('off')
    }
    document.addEventListener('fullscreenchange', sync)
    document.addEventListener('webkitfullscreenchange', sync)
    return () => {
      document.removeEventListener('fullscreenchange', sync)
      document.removeEventListener('webkitfullscreenchange', sync)
      if (modeRef.current === 'overlay') document.body.style.overflow = ''
    }
  }, [stageRef])

  useEffect(() => {
    if (mode !== 'overlay') return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMode('off')
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previous
      document.removeEventListener('keydown', onKey)
    }
  }, [mode])

  async function enter() {
    const node = stageRef.current
    if (!node) return
    const legacy = node as HTMLElement & { webkitRequestFullscreen?: () => Promise<void> | void }
    const request = node.requestFullscreen?.bind(node) ?? legacy.webkitRequestFullscreen?.bind(node)
    if (request) {
      try {
        await request()
        if (currentFullscreen() === node) {
          setMode('native')
          return
        }
      } catch {
        // The browser refused the fullscreen request. Fill the window instead.
      }
    }
    setMode('overlay')
  }

  async function exit() {
    if (currentFullscreen()) {
      const legacy = document as Document & { webkitExitFullscreen?: () => Promise<void> | void }
      const leave = document.exitFullscreen?.bind(document) ?? legacy.webkitExitFullscreen?.bind(document)
      try {
        await leave?.()
      } catch {
        // The element may already have left fullscreen.
      }
    }
    setMode('off')
  }

  return {
    full: mode !== 'off',
    overlay: mode === 'overlay',
    className: mode === 'overlay' ? 'stage-fill' : '',
    enter,
    exit,
  }
}

export function StageFrame({ className, children, ...rest }: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const screen = useStageScreen(ref)
  return (
    <div ref={ref} className={[className, screen.className].filter(Boolean).join(' ')} {...rest}>
      {children}
      <ScreenButton full={screen.full} onEnter={screen.enter} onExit={screen.exit} />
    </div>
  )
}

function ScreenButton({ full, onEnter, onExit }: { full: boolean; onEnter: () => void; onExit: () => void }) {
  return (
    <button type="button" className="screen-toggle" aria-label={full ? 'Close full screen' : 'Full screen'} onClick={full ? onExit : onEnter}>
      {full ? <CloseIcon /> : <ExpandIcon />}
    </button>
  )
}

function ExpandIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  )
}
