import { useEffect, useRef, useState } from 'react'

export function useStageActivity<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [shown, setShown] = useState(false)
  const [seen, setSeen] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    const play = new IntersectionObserver(([entry]) => setShown(entry.isIntersecting), { threshold: 0.15 })
    const warm = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setSeen(true)
      },
      { rootMargin: '360px 0px', threshold: 0 },
    )
    play.observe(node)
    warm.observe(node)
    return () => {
      play.disconnect()
      warm.disconnect()
    }
  }, [])

  return { ref, shown, seen }
}
