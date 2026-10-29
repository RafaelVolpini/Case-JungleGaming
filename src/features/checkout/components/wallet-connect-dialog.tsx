import { useMutation } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { useEffect } from 'react'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { NETWORK_LABELS } from '@/contracts/common'
import { WALLET_TYPE_LABELS, type Wallet } from '@/contracts/wallet'
import { connectWallet, disconnectWallet } from '@/features/wallets/api/wallets-api'
import { errorMessage } from '@/lib/http/errors'
import { shortAddress } from '@/lib/format/address'

type WalletConnectDialogProps = {
  open: boolean
  wallet: Wallet
  placing: boolean
  placeError: string | null
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export function WalletConnectDialog({
  open,
  wallet,
  placing,
  placeError,
  onOpenChange,
  onConfirm,
}: WalletConnectDialogProps) {
  const connect = useMutation({ mutationFn: () => connectWallet(wallet.id) })
  const disconnect = useMutation({ mutationFn: () => disconnectWallet(wallet.id) })
  const { mutate: startConnection, reset } = connect

  useEffect(() => {
    if (open) startConnection()
    else reset()
  }, [open, startConnection, reset])

  const connecting = connect.isPending
  const connected = connect.isSuccess && !disconnect.isSuccess
  const typeLabel = WALLET_TYPE_LABELS[wallet.walletType]

  return (
    <Dialog open={open} onOpenChange={(next) => !placing && onOpenChange(next)}>
      <DialogContent className="max-w-[420px]">
        <DialogTitle className="text-cream text-xl font-bold">
          {connecting
            ? `Conectando ${typeLabel}…`
            : connected
              ? 'Carteira conectada'
              : 'Conexão da carteira'}
        </DialogTitle>
        <DialogDescription className="text-foreground text-sm">
          {typeLabel} · {shortAddress(wallet.address)} · {NETWORK_LABELS[wallet.network]}
        </DialogDescription>

        <div aria-live="polite" className="min-h-[56px] text-sm">
          {connecting && (
            <p className="text-foreground flex items-center gap-2">
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              Aguardando a autorização na carteira.
            </p>
          )}
          {connect.isError && (
            <p role="alert" className="text-destructive">
              {errorMessage(connect.error)}
            </p>
          )}
          {connected && !placeError && !placing && (
            <p className="text-success">Pronto para enviar o pedido com esta carteira.</p>
          )}
          {placing && (
            <p className="text-foreground flex items-center gap-2">
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              Enviando o pedido…
            </p>
          )}
          {placeError && (
            <p role="alert" className="text-destructive">
              {placeError}
            </p>
          )}
          {disconnect.isError && (
            <p role="alert" className="text-destructive">
              {errorMessage(disconnect.error)}
            </p>
          )}
          {disconnect.isSuccess && (
            <p className="text-foreground">
              Carteira desconectada. Conecte novamente para continuar.
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-3">
          {connected && (
            <Button className="h-10 rounded-md text-base" disabled={placing} onClick={onConfirm}>
              {placeError ? 'Tentar novamente' : 'Confirmar e enviar'}
            </Button>
          )}
          {(connect.isError || disconnect.isSuccess) && (
            <Button
              className="h-10 rounded-md text-base"
              onClick={() => {
                disconnect.reset()
                startConnection()
              }}
            >
              Conectar novamente
            </Button>
          )}
          {connected && (
            <Button
              variant="outline"
              className="h-10 rounded-md text-base"
              disabled={placing || disconnect.isPending}
              onClick={() => disconnect.mutate()}
            >
              Desconectar
            </Button>
          )}
          <Button
            variant="ghost"
            disabled={placing}
            onClick={() => onOpenChange(false)}
            className="h-10 text-base"
          >
            Cancelar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
