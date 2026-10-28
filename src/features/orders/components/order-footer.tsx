import { Link } from '@tanstack/react-router'

import { buttonVariants } from '@/components/ui/button'
import { NETWORK_LABELS } from '@/contracts/common'
import type { Order } from '@/contracts/order'

import { explorerName } from '../lib/explorer'

const DECLINED_FALLBACK = 'O pagamento foi recusado e nenhum valor foi cobrado.'

function messageFor(order: Order): string {
  const network = NETWORK_LABELS[order.wallet.network]
  if (order.status === 'confirmed') {
    return `Transação confirmada na ${network}. A propriedade foi transferida para sua carteira conectada e registrada na rede.`
  }
  if (order.status === 'declined') return order.declinedReason ?? DECLINED_FALLBACK
  return `Sua transação foi enviada para a ${network}. A confirmação leva alguns segundos; você pode fechar esta janela e continuar navegando.`
}

function Actions({ order }: { order: Order }) {
  if (order.status === 'confirmed') {
    return (
      <a
        href={order.explorerUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={buttonVariants({ size: 'lg', className: 'w-[186px] md:rounded' })}
      >
        Ver no {explorerName(order.wallet.network)}
      </a>
    )
  }
  if (order.status === 'declined') {
    return (
      <div className="flex flex-wrap justify-center gap-3">
        <Link to="/pagamento" className={buttonVariants({ size: 'lg', className: 'md:rounded' })}>
          Tentar novamente
        </Link>
        <Link
          to="/carrinho"
          className={buttonVariants({ size: 'lg', variant: 'outline', className: 'md:rounded' })}
        >
          Voltar ao carrinho
        </Link>
      </div>
    )
  }
  return null
}

export function OrderFooter({ order }: { order: Order }) {
  return (
    <div className="border-divider mt-[7px] flex flex-col items-center border-t pt-3">
      <p
        role={order.status === 'declined' ? 'alert' : undefined}
        className="text-foreground max-w-[490px] text-center text-sm leading-[22px]"
      >
        {messageFor(order)}
      </p>
      <div className="mt-[19.5px]">
        <Actions order={order} />
      </div>
    </div>
  )
}
