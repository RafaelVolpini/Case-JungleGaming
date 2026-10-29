import type { NftDetail } from '@/contracts/nft'
import { formatEth } from '@/lib/money/eth'

import type { TargetOption } from '../hooks/use-simulator-target'
import { SimulatorSection } from './simulator-section'
import { SimulatorSelect } from './simulator-field'

type TargetPickerProps = {
  options: TargetOption[]
  slug: string | null
  edition: string
  detail: NftDetail | undefined
  onNft: (slug: string) => void
  onEdition: (label: string) => void
}

export function TargetPicker({
  options,
  slug,
  edition,
  detail,
  onNft,
  onEdition,
}: TargetPickerProps) {
  const selected = detail?.editions.find((candidate) => candidate.label === edition)

  return (
    <SimulatorSection title="NFT">
      <div className="grid grid-cols-[1fr_88px] gap-2">
        <SimulatorSelect
          label="NFT"
          value={slug ?? ''}
          onChange={(event) => onNft(event.target.value)}
        >
          {options.map((option) => (
            <option key={option.slug} value={option.slug}>
              {option.name}
            </option>
          ))}
        </SimulatorSelect>
        <SimulatorSelect
          label="Edição"
          value={edition}
          onChange={(event) => onEdition(event.target.value)}
        >
          {(detail?.editions ?? [{ id: edition, label: edition }]).map((item) => (
            <option key={item.id} value={item.label}>
              {item.label}
            </option>
          ))}
        </SimulatorSelect>
      </div>
      {detail && (
        <p className="text-foreground mt-2 text-xs" data-testid="simulator-live">
          Ao vivo: {formatEth(detail.priceEth)}
          {selected ? ` · edição ${selected.label}: ${selected.available} disponíveis` : ''}
        </p>
      )}
    </SimulatorSection>
  )
}
