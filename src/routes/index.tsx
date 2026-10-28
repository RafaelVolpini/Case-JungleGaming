import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  return (
    <main className="mx-auto max-w-[1280px] px-4 py-20 lg:px-20">
      <p className="text-sm text-foreground">Bem-vindo à Kurio</p>
      <h1 className="text-hero text-cream mt-2 font-bold uppercase">
        Seja dono do futuro da arte digital
      </h1>
      <button
        type="button"
        className="border-primary text-primary hover:bg-primary hover:text-primary-foreground mt-8 rounded-md border px-6 py-3 text-sm font-bold transition-colors"
      >
        EXPLORAR
      </button>
    </main>
  )
}
