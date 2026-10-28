import { useEffect, useState } from 'react'

export function useIsExpired(expiresAt: string): boolean {
  const target = new Date(expiresAt).getTime()
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const remaining = target - Date.now()
    if (remaining <= 0) return
    const timer = setTimeout(() => setNow(Date.now()), remaining + 50)
    return () => clearTimeout(timer)
  }, [target])

  return now >= target
}
