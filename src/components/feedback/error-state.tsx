import { Button } from '@/components/ui/button'
import { errorMessage } from '@/lib/http/errors'

type ErrorStateProps = { error: unknown; onRetry: () => void; title?: string }

export function ErrorState({
  error,
  onRetry,
  title = 'Não foi possível carregar',
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="border-destructive/50 flex flex-col items-center rounded-xl border px-6 py-16 text-center"
    >
      <h3 className="text-cream text-lg font-bold">{title}</h3>
      <p className="text-foreground mt-2 max-w-sm text-sm">{errorMessage(error)}</p>
      <Button variant="outline" className="mt-6" onClick={onRetry}>
        Tentar novamente
      </Button>
    </div>
  )
}
