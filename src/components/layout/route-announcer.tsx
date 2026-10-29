import { useEffect, useState } from 'react'

const SETTLE_MS = 150

export function RouteAnnouncer() {
  const [message, setMessage] = useState('')

  useEffect(() => {
    const titleElement = document.querySelector('title')
    if (!titleElement) return
    let timer: number | undefined
    const observer = new MutationObserver(() => {
      window.clearTimeout(timer)
      timer = window.setTimeout(() => setMessage(document.title), SETTLE_MS)
    })
    observer.observe(titleElement, { childList: true, characterData: true, subtree: true })
    return () => {
      window.clearTimeout(timer)
      observer.disconnect()
    }
  }, [])

  return (
    <p role="status" aria-live="polite" className="sr-only">
      {message}
    </p>
  )
}
