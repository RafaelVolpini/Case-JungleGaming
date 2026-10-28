import { Link } from '@tanstack/react-router'
import { Fragment } from 'react'

type Crumb = { label: string; to?: '/' | '/carrinho' }

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Caminho de navegação" className="hidden md:block">
      <ol className="text-cream flex gap-[9px] text-[15px] leading-6 font-bold">
        {items.map((item, index) => (
          <Fragment key={item.label}>
            {index > 0 && <li aria-hidden="true">/</li>}
            <li aria-current={index === items.length - 1 ? 'page' : undefined}>
              {item.to ? (
                <Link to={item.to} className="hover:text-primary-light transition-colors">
                  {item.label}
                </Link>
              ) : (
                item.label
              )}
            </li>
          </Fragment>
        ))}
      </ol>
    </nav>
  )
}
