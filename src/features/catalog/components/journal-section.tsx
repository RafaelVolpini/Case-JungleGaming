import { ArtImage } from '@/components/nft/art-image'
import { UnavailableAction } from '@/components/shared/unavailable-action'
import { JOURNAL_COPY, JOURNAL_POSTS } from '@/content/home'

export function JournalSection() {
  return (
    <section aria-labelledby="journal-title" className="page-container mt-24">
      <h2 id="journal-title" className="text-cream text-center text-[28px] leading-9 font-bold">
        {JOURNAL_COPY.title}
      </h2>
      <p className="text-foreground mt-2.5 text-center text-sm leading-6">
        {JOURNAL_COPY.subtitle}
      </p>

      <ul className="mt-[38px] grid gap-6 md:grid-cols-2 lg:w-[1144px] lg:max-w-full lg:grid-cols-4">
        {JOURNAL_POSTS.map((post) => (
          <li key={post.title} className="bg-card overflow-hidden rounded-[10px]">
            <ArtImage
              art={post.art}
              alt={`Ilustração do artigo ${post.title}`}
              sizes="268px"
              className="aspect-[268/195] w-full object-cover"
            />
            <div className="px-4 pt-3 pb-3.5">
              <p className="text-foreground/80 text-xs leading-4">
                {post.date}
                <span aria-hidden="true">{'  |  '}</span>
                <span className="sr-only">, </span>
                {post.readTime}
              </p>
              <h3 className="text-cream mt-2 text-base leading-[21px] font-bold">{post.title}</h3>
              <p className="text-foreground mt-2 text-xs leading-4">{post.excerpt}</p>
              <UnavailableAction
                subject="O artigo"
                className="text-primary-light mt-[7px] text-xs leading-4 font-bold hover:underline"
              >
                Ler mais →
              </UnavailableAction>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
