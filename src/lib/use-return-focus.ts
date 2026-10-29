import { useLayoutEffect, useRef } from 'react'

export function useReturnFocus<T extends HTMLElement>() {
  const triggerRef = useRef<T>(null)

  function onCloseAutoFocus(event: Event) {
    event.preventDefault()
    triggerRef.current?.focus()
  }

  return { triggerRef, onCloseAutoFocus }
}

export function useRestoreFocus(open: boolean) {
  const previous = useRef<HTMLElement | null>(null)

  useLayoutEffect(() => {
    if (open) previous.current = document.activeElement as HTMLElement | null
  }, [open])

  function onCloseAutoFocus(event: Event) {
    event.preventDefault()
    previous.current?.focus()
  }

  return { onCloseAutoFocus }
}
