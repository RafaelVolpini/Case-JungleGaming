import { useEffect, useState, type CSSProperties } from 'react'

const MIN_SCALE = 0.6

export function useFitScale<T extends HTMLElement>(margin = 12) {
  const [element, setElement] = useState<T | null>(null)
  const [scale, setScale] = useState(1)

  useEffect(() => {
    if (!element) return

    const measure = () => {
      const available = window.innerHeight - margin * 2
      const needed = element.scrollHeight
      setScale(needed > available ? Math.max(MIN_SCALE, available / needed) : 1)
    }

    const observer = new ResizeObserver(measure)
    observer.observe(element)
    for (const child of element.children) observer.observe(child)
    window.addEventListener('resize', measure)

    return () => {
      observer.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [element, margin])

  const style = { '--fit': scale } as CSSProperties
  return { ref: setElement, style }
}
