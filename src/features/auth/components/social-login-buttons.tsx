import { FacebookFIcon, GoogleIcon } from '@/components/icons/social-login-icons'
import { UnavailableAction } from '@/components/shared/unavailable-action'
import { cn } from '@/lib/utils'

const BUTTON =
  'border-input text-foreground hover:border-primary/60 focus-visible:ring-ring flex h-10 w-full items-center justify-center gap-3 rounded border text-[13px] font-medium outline-none transition-colors focus-visible:ring-2'

export function SocialLoginButtons({ spacious = false }: { spacious?: boolean }) {
  return (
    <div className={cn('flex flex-col', spacious ? 'mt-3.5 gap-4' : 'mt-[10.5px] gap-3')}>
      <UnavailableAction subject="O login com Google" className={BUTTON}>
        <GoogleIcon className="size-5" />
        Continuar com Google
      </UnavailableAction>
      <UnavailableAction subject="O login com Facebook" className={BUTTON}>
        <FacebookFIcon className="size-5" />
        Continuar com Facebook
      </UnavailableAction>
    </div>
  )
}
