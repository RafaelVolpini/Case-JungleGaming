import { Link } from '@tanstack/react-router'

type PendingOrderNoticeProps = {
  orderId: string
}

export function PendingOrderNotice({ orderId }: PendingOrderNoticeProps) {
  return (
    <p role="status" className="border-primary text-cream mt-4 rounded-lg border px-4 py-3 text-sm">
      Você tem um pedido em processamento.{' '}
      <Link
        to="/pedido/$orderId"
        params={{ orderId }}
        className="text-primary-light underline underline-offset-4"
      >
        Acompanhar pedido
      </Link>
    </p>
  )
}
