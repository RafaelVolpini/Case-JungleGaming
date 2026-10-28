export function AuthDivider() {
  return (
    <div className="relative mt-[38px] xl:mt-[22px] flex h-5 items-center justify-center">
      <span aria-hidden="true" className="bg-input absolute inset-x-0 top-1/2 h-px" />
      <span className="bg-background xl:bg-card text-cream relative px-3 text-[13px] leading-5">
        Ou continue com
      </span>
    </div>
  )
}
