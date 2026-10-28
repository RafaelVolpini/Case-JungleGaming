import { Link } from '@tanstack/react-router'

export function Logo() {
  return (
    <Link
      to="/"
      className="text-cream block text-base leading-6 font-bold"
      aria-label="Kurio, página inicial"
    >
      KURIO
    </Link>
  )
}
