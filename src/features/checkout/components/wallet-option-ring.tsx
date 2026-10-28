export function WalletOptionRing({ checked = false }: { checked?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className="border-primary grid size-4 shrink-0 place-items-center rounded-full border-[1.5px]"
    >
      <span className={checked ? 'bg-primary size-2.5 rounded-full' : 'size-2.5'} />
    </span>
  )
}
