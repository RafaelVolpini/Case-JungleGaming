import type { ComponentProps } from 'react'

export function ThankYouEnvelope(props: ComponentProps<'svg'>) {
  return (
    <svg
      viewBox="0 0 65 78"
      preserveAspectRatio="none"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M1.5 35v39.5Q1.5 77 4 77h57q2.5 0 2.5-2.5V35" />
      <path d="M1.5 34v-2q0-2.5 2-4.5l3-3M63.5 34v-2q0-2.5-2-4.5l-3-3" />
      <path d="M6.6 37.5V9a2.1 2.1 0 0 1 2.1-2.1h48a2.1 2.1 0 0 1 2.1 2.1v28" />
      <path d="M24.5 6.9C25 3 28 1 32.5 1S40.5 3 41.5 6.9" />
      <path d="M2.3 38.7 19.4 56.2M62 38.5 45.7 54.5" />
      <path d="M2.5 75l21-24.5Q32.5 41 41 50l6.5 6.5M51.2 61 62 71.5" />
      <g fill="currentColor" stroke="none" fontSize="13" fontWeight="800" textAnchor="middle">
        <text x="32.5" y="25.6">
          THANK
        </text>
        <text x="32.5" y="39">
          YOU
        </text>
      </g>
    </svg>
  )
}
