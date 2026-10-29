import { Search, Settings2 } from 'lucide-react'
import { useState, type FormEvent } from 'react'

import { useCatalogFilters } from '../../hooks/use-catalog-filters'

export function MobileSearchBar({ onOpenFilters }: { onOpenFilters: () => void }) {
  const { query } = useCatalogFilters()
  return <SearchForm key={query.q ?? ''} applied={query.q ?? ''} onOpenFilters={onOpenFilters} />
}

type SearchFormProps = { applied: string; onOpenFilters: () => void }

function SearchForm({ applied, onOpenFilters }: SearchFormProps) {
  const { update } = useCatalogFilters()
  const [term, setTerm] = useState(applied)

  function submit(event: FormEvent) {
    event.preventDefault()
    update({ q: term.trim() || undefined })
  }

  return (
    <div className="flex gap-2">
      <form
        role="search"
        onSubmit={submit}
        className="bg-card focus-within:ring-ring flex h-[45px] min-w-0 flex-1 items-center gap-2.5 rounded-xl pl-3.5 focus-within:ring-2"
      >
        <Search
          className="text-placeholder size-[18px] shrink-0"
          strokeWidth={2}
          aria-hidden="true"
        />
        <input
          type="search"
          value={term}
          onChange={(event) => setTerm(event.target.value)}
          placeholder="Explorar coleções"
          aria-label="Buscar NFTs"
          className="placeholder:text-placeholder text-cream h-full min-w-0 flex-1 bg-transparent text-sm font-bold outline-none"
        />
      </form>
      <button
        type="button"
        onClick={onOpenFilters}
        aria-label="Abrir filtros"
        className="text-background focus-visible:ring-ring grid size-[45px] shrink-0 place-items-center rounded-xl bg-linear-to-br/srgb from-primary-glow/45 to-primary outline-none focus-visible:ring-2"
      >
        <Settings2 className="size-[22px]" strokeWidth={2} aria-hidden="true" />
      </button>
    </div>
  )
}
