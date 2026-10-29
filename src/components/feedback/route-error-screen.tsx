import { useRouter, type ErrorComponentProps } from '@tanstack/react-router'

import { ErrorState } from '@/components/feedback/error-state'

export function RouteErrorScreen({ error, reset }: ErrorComponentProps) {
  const router = useRouter()

  function retry() {
    reset()
    void router.invalidate()
  }

  return (
    <div className="mx-auto w-full max-w-[1200px] px-6 py-16">
      <ErrorState error={error} title="Não foi possível abrir esta página" onRetry={retry} />
    </div>
  )
}
