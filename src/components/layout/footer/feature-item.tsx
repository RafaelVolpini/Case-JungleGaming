import { cn } from '@/lib/utils'

type FeatureItemProps = {
  letter: string
  title: string
  description: string
  isFirst: boolean
}

export function FeatureItem({ letter, title, description, isFirst }: FeatureItemProps) {
  return (
    <div
      className={cn(
        'border-primary mt-8 mb-4 px-8 lg:border-l lg:px-0 lg:pl-4',
        isFirst && 'lg:border-l-0 lg:pl-12',
      )}
    >
      <div
        aria-hidden="true"
        className="bg-primary text-primary-foreground grid size-[74px] place-items-center rounded-full text-[28px] font-bold"
      >
        {letter}
      </div>
      <h3 className="text-cream mt-[9px] text-[17px] leading-6 font-bold">{title}</h3>
      <p className="text-foreground mt-[7px] max-w-[190px] text-sm leading-[22px]">{description}</p>
    </div>
  )
}
