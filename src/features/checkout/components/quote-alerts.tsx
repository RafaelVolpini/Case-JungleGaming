import { TriangleAlert } from 'lucide-react'

import { Button } from '@/components/ui/button'
import type { Quote } from '@/contracts/quote'

type QuoteAlertsProps = {
  quote: Quote
  expired: boolean
  acknowledging: boolean
  refreshing: boolean
  onAcknowledge: () => void
  onRefresh: () => void
}

export function QuoteAlerts({
  quote,
  expired,
  acknowledging,
  refreshing,
  onAcknowledge,
  onRefresh,
}: QuoteAlertsProps) {
  if (!expired && quote.issues.length === 0) return null

  return (
    <div
      role="alert"
      className="border-warning/60 bg-warning/10 mb-6 flex gap-3 rounded-lg border p-4"
    >
      <TriangleAlert className="text-warning mt-0.5 size-5 shrink-0" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className="text-cream text-base font-bold">
          {expired ? 'Sua cotação expirou' : 'Seu pedido mudou desde a última cotação'}
        </p>
        {!expired && (
          <ul className="text-foreground mt-2 list-disc pl-5 text-sm">
            {quote.issues.map((issue) => (
              <li key={`${issue.code}-${issue.itemId ?? 'cart'}`}>{issue.message}</li>
            ))}
          </ul>
        )}
        <Button
          type="button"
          size="sm"
          className="mt-3"
          disabled={acknowledging || refreshing}
          onClick={expired ? onRefresh : onAcknowledge}
        >
          {expired ? 'Atualizar cotação' : 'Aceitar alterações e atualizar'}
        </Button>
      </div>
    </div>
  )
}
