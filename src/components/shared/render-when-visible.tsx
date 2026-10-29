import { useEffect, useRef, useState, type ReactNode } from 'react'

type RenderWhenVisibleProps = { children: ReactNode; rootMargin?: string; className?: string }

export function RenderWhenVisible({
  children,
  rootMargin = '300px',
  className,
}: RenderWhenVisibleProps) {
  const [visible, setVisible] = useState(typeof IntersectionObserver === 'undefined')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const node = ref.current
    if (!node || visible) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return
        setVisible(true)
        observer.disconnect()
      },
      { rootMargin },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [visible, rootMargin])

  return (
    <div ref={ref} className={className}>
      {visible ? children : null}
    </div>
  )
}
