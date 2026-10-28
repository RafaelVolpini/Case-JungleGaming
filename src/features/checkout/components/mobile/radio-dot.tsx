export function RadioDot() {
  return (
    <span
      aria-hidden="true"
      className="border-[#55321f] grid size-4 shrink-0 place-items-center rounded-full border-[1.5px] [[data-state=checked]_&]:border-primary"
    >
      <span className="bg-primary size-2 rounded-full opacity-0 [[data-state=checked]_&]:opacity-100" />
    </span>
  )
}
