import { useNavigate } from '@tanstack/react-router'
import { Search } from 'lucide-react'
import { useState, type FormEvent } from 'react'

import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useReturnFocus } from '@/lib/use-return-focus'

import { useCatalogFilters } from '../hooks/use-catalog-filters'
import { catalogSearch } from '../search'

export function SearchDialog() {
  const [open, setOpen] = useState(false)
  const [term, setTerm] = useState('')
  const navigate = useNavigate()
  const { query } = useCatalogFilters()
  const { triggerRef, onCloseAutoFocus } = useReturnFocus<HTMLButtonElement>()

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const q = term.trim()
    setOpen(false)
    void navigate({ to: '/', search: catalogSearch({ q: q || undefined }), hash: 'catalogo' })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <button
        ref={triggerRef}
        type="button"
        aria-label="Buscar NFTs"
        onClick={() => {
          setTerm(query.q ?? '')
          setOpen(true)
        }}
        className="text-cream hover:text-primary-light grid size-6 place-items-center transition-colors"
      >
        <Search className="size-[23px]" strokeWidth={2.2} />
      </button>
      <DialogContent onCloseAutoFocus={onCloseAutoFocus} className="top-[22%] max-w-lg gap-3 p-6">
        <DialogTitle className="text-cream text-lg font-bold">Buscar NFTs</DialogTitle>
        <DialogDescription className="sr-only">
          Busque por nome ou número do token.
        </DialogDescription>
        <form onSubmit={handleSubmit} role="search">
          <Input
            autoFocus
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            placeholder="Nome ou token do NFT"
            aria-label="Buscar NFTs"
          />
        </form>
      </DialogContent>
    </Dialog>
  )
}
