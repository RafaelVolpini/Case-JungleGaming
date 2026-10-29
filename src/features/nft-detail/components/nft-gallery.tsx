import { Search } from 'lucide-react'
import { useState } from 'react'

import { NftImage } from '@/components/nft/nft-image'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import type { NftDetail } from '@/contracts/nft'
import { useReturnFocus } from '@/lib/use-return-focus'
import { cn } from '@/lib/utils'

type NftGalleryProps = { images: NftDetail['images']; name: string }

export function NftGallery({ images, name }: NftGalleryProps) {
  const [active, setActive] = useState(0)
  const [zoomed, setZoomed] = useState(false)
  const { triggerRef, onCloseAutoFocus } = useReturnFocus<HTMLButtonElement>()
  const current = images[active] ?? images[0]
  if (!current) return null

  return (
    <div className="flex flex-col gap-4 md:flex-row md:gap-7">
      <ul aria-label="Miniaturas" className="hidden shrink-0 flex-col gap-4 md:flex">
        {images.map((image, index) => (
          <li key={index}>
            <button
              type="button"
              aria-label={`Ver imagem ${index + 1} de ${images.length}`}
              aria-pressed={index === active}
              onClick={() => setActive(index)}
              className={cn(
                'focus-visible:ring-ring block size-[100px] overflow-hidden rounded-xl border outline-none focus-visible:ring-2',
                index === active ? 'border-primary' : 'border-transparent',
              )}
            >
              <NftImage image={image} sizes="100px" />
            </button>
          </li>
        ))}
      </ul>

      <div className="bg-card relative rounded-lg p-4 md:mt-0.5 md:size-[444px] md:p-5">
        <NftImage image={current} priority sizes="404px" className="rounded-3xl md:size-full" />
        <button
          ref={triggerRef}
          type="button"
          aria-label="Ampliar imagem"
          onClick={() => setZoomed(true)}
          className="bg-background text-cream ring-card focus-visible:outline-ring absolute top-[13px] right-3 grid size-[30px] place-items-center rounded-full ring-2 outline-offset-2 focus-visible:outline-2"
        >
          <Search className="size-5" aria-hidden="true" />
        </button>
        <Dialog open={zoomed} onOpenChange={setZoomed}>
          <DialogContent
            onCloseAutoFocus={onCloseAutoFocus}
            className="max-w-[min(92vw,720px)] p-4"
          >
            <DialogTitle className="sr-only">{name}</DialogTitle>
            <DialogDescription className="sr-only">Imagem ampliada de {name}</DialogDescription>
            <NftImage image={current} sizes="720px" className="rounded-xl" />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
