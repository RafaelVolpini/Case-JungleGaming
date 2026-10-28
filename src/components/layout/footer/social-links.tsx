import type { ComponentType, SVGProps } from 'react'

import {
  FacebookIcon,
  InstagramIcon,
  LinkedinIcon,
  TwitterIcon,
  YoutubeIcon,
} from '@/components/icons/brand-icons'
import { SOCIAL_LINKS } from '@/content/footer'

const ICONS: Record<string, ComponentType<SVGProps<SVGSVGElement>>> = {
  facebook: FacebookIcon,
  instagram: InstagramIcon,
  twitter: TwitterIcon,
  linkedin: LinkedinIcon,
  youtube: YoutubeIcon,
}

export function SocialLinks() {
  return (
    <ul className="mt-[14px] flex gap-2">
      {SOCIAL_LINKS.map(({ id, label, href }) => {
        const Icon = ICONS[id]
        return (
          <li key={id}>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground grid size-8 place-items-center rounded-md border transition-colors"
            >
              {Icon && <Icon className="size-[18px]" />}
            </a>
          </li>
        )
      })}
    </ul>
  )
}
