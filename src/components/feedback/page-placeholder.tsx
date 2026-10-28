export function PagePlaceholder({ title }: { title: string }) {
  return (
    <section className="page-container py-16">
      <h1 className="text-cream text-2xl font-bold">{title}</h1>
      <p className="text-muted-foreground mt-2 text-sm">Em construção.</p>
    </section>
  )
}
