import type { ReactNode } from 'react'

export function AuthIntro({ children }: { children: ReactNode }) {
  return (
    <p className="text-cream mx-auto mt-[35.5px] max-w-[410px] px-4 text-center md:px-0 text-[13px] leading-4">
      {children}
    </p>
  )
}
