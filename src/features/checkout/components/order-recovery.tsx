import { Button } from '@/components/ui/button'
import type { CreateOrderInput } from '@/contracts/order'
import { ApiRequestError } from '@/lib/http/errors'

import { usePlaceOrder } from '../hooks/use-place-order'

export function OrderRecovery({ input }: { input: CreateOrderInput }) {
  const placeOrder = usePlaceOrder()
  const error = placeOrder.error instanceof ApiRequestError ? placeOrder.error.message : null

  return (
    <section
      aria-labelledby="order-recovery-title"
      className="border-primary mt-4 rounded-lg border px-4 py-3"
    >
      <h2 id="order-recovery-title" className="text-cream text-base font-bold">
        Estamos verificando o seu pedido
      </h2>
      <p className="text-foreground mt-1 text-sm">
        Não recebemos a confirmação da última tentativa de pagamento. Verificar o pedido não cria
        uma nova compra.
      </p>
      {error && (
        <p role="alert" className="text-destructive mt-2 text-sm">
          {error}
        </p>
      )}
      <Button
        className="mt-3 h-10 rounded-md"
        disabled={placeOrder.isPending}
        onClick={() => placeOrder.mutate(input)}
      >
        Verificar pedido
      </Button>
    </section>
  )
}
