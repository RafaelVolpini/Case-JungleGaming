import { Link } from '@tanstack/react-router'

export function Logo() {
  return (
    <Link
      to="/"
      className="text-cream block text-sm leading-6 font-bold tracking-[0.1em]"
      aria-label="Kurio, página inicial"
    >
      KURIO
    </Link>
  )
}
