import { useRef } from 'react'

export function useReturnFocus<T extends HTMLElement>() {
  const triggerRef = useRef<T>(null)

  function onCloseAutoFocus(event: Event) {
    event.preventDefault()
    triggerRef.current?.focus()
  }

  return { triggerRef, onCloseAutoFocus }
}
