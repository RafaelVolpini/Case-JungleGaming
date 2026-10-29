import { useId, type FormEvent } from 'react'
import { toast } from '@/lib/toast'

import { NEWSLETTER } from '@/content/footer'

export function NewsletterForm() {
  const inputId = useId()

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    toast.info('A assinatura da newsletter não está disponível nesta versão.')
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border-primary mt-8 mb-4 px-8 lg:border-l lg:px-0 lg:pt-[83px] lg:pl-4"
    >
      <h3 className="text-cream text-[17px] leading-6 font-bold">{NEWSLETTER.title}</h3>
      <div className="mt-[7px] flex h-10 max-w-[325px] overflow-hidden rounded-lg">
        <label htmlFor={inputId} className="sr-only">
          E-mail
        </label>
        <input
          id={inputId}
          type="email"
          placeholder={NEWSLETTER.placeholder}
          className="bg-brown placeholder:text-placeholder text-foreground min-w-0 flex-1 px-3 text-sm outline-none focus-visible:ring-primary focus-visible:ring-1"
        />
        <button
          type="submit"
          className="bg-primary text-primary-foreground hover:bg-primary-hover w-[85px] text-lg font-bold transition-colors"
        >
          Enviar
        </button>
      </div>
      <p className="text-foreground mt-3 text-sm leading-[22px]">{NEWSLETTER.description}</p>
    </form>
  )
}
