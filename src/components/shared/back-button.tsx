import { useNavigate, useRouter } from '@tanstack/react-router'
import { ChevronLeft } from 'lucide-react'

import { cn } from '@/lib/utils'

type BackButtonProps = { fallback?: '/' | '/carrinho'; className?: string }

export function BackButton({ fallback = '/', className }: BackButtonProps) {
  const router = useRouter()
  const navigate = useNavigate()

  function goBack() {
    if (router.history.canGoBack()) router.history.back()
    else void navigate({ to: fallback })
  }

  return (
    <button
      type="button"
      onClick={goBack}
      aria-label="Voltar"
      className={cn(
        'bg-surface-raised text-foreground focus-visible:ring-ring grid size-[35px] place-items-center rounded-full outline-none focus-visible:ring-2',
        className,
      )}
    >
      <ChevronLeft className="size-5" strokeWidth={1.75} aria-hidden="true" />
    </button>
  )
}
