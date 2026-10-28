import { useEffect, useState, type FocusEvent } from 'react'

import { useMediaQuery } from '@/lib/use-media-query'
import { usePageVisible } from '@/lib/use-page-visible'

const ROTATION_MS = 5000

export function useHeroRotation(count: number) {
  const [selected, setSelected] = useState(0)
  const [hovering, setHovering] = useState(false)
  const [focusing, setFocusing] = useState(false)
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
  const visible = usePageVisible()

  const active = count > 0 ? selected % count : 0
  const running = count > 1 && visible && !hovering && !focusing && !reducedMotion

  useEffect(() => {
    if (!running) return
    const timer = window.setTimeout(() => setSelected((active + 1) % count), ROTATION_MS)
    return () => window.clearTimeout(timer)
  }, [running, active, count])

  return {
    active,
    select: setSelected,
    hoverProps: {
      onPointerEnter: () => setHovering(true),
      onPointerLeave: () => setHovering(false),
    },
    focusProps: {
      onFocus: (event: FocusEvent) => setFocusing(event.target.matches(':focus-visible')),
      onBlur: () => setFocusing(false),
    },
  }
}
