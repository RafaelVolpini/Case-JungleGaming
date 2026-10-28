export const FOOTER_FEATURES = [
  {
    letter: 'W',
    title: 'Segurança da carteira',
    description: 'Proteja sua carteira e colecione arte digital verificada com confiança.',
  },
  {
    letter: 'C',
    title: 'Criadores em destaque',
    description: 'Conheça artistas, estúdios e comunidades que moldam a cultura digital na rede.',
  },
  {
    letter: 'D',
    title: 'Alertas de lançamentos',
    description:
      'Receba calendários de cunhagem, novidades de listas de acesso e análises do mercado.',
  },
] as const

export const NEWSLETTER = {
  title: 'Antecipe-se ao próximo lançamento',
  placeholder: 'digite seu e-mail...',
  description: 'Receba lançamentos selecionados, histórias de criadores e novidades do mercado.',
} as const

export const FOOTER_CONTACT = {
  slogan: 'Feito para colecionadores, criadores e cultura',
  email: 'contato@email.com',
  phone: '+55 11 4002 8922',
} as const

export type FooterLink =
  | { kind: 'route'; label: string; to: '/perfil' | '/favoritos' }
  | { kind: 'collection'; label: string; collectionId: string }
  | { kind: 'unavailable'; label: string }

export const FOOTER_LINK_COLUMNS: ReadonlyArray<{ title: string; links: FooterLink[] }> = [
  {
    title: 'Meu perfil',
    links: [
      { kind: 'route', label: 'Meu perfil', to: '/perfil' },
      { kind: 'unavailable', label: 'Minha coleção' },
      { kind: 'unavailable', label: 'Atividade' },
      { kind: 'unavailable', label: 'Estúdio do criador' },
      { kind: 'route', label: 'Lista de interesse', to: '/favoritos' },
    ],
  },
  {
    title: 'Central de ajuda',
    links: [
      { kind: 'unavailable', label: 'Central de ajuda' },
      { kind: 'unavailable', label: 'Como comprar NFTs' },
      { kind: 'unavailable', label: 'Carteira e segurança' },
      { kind: 'unavailable', label: 'Política do mercado' },
      { kind: 'unavailable', label: 'Denunciar item' },
    ],
  },
  {
    title: 'Coleções',
    links: [
      { kind: 'collection', label: 'Arte digital', collectionId: 'col-arte-digital' },
      { kind: 'collection', label: 'Fotografia', collectionId: 'col-fotografia' },
      { kind: 'collection', label: 'Música', collectionId: 'col-musica' },
      { kind: 'collection', label: 'Arte 3D', collectionId: 'col-arte-3d' },
      { kind: 'collection', label: 'Utilidade', collectionId: 'col-utilidade' },
    ],
  },
]

export const SOCIAL_LINKS = [
  { id: 'facebook', label: 'Facebook', href: 'https://www.facebook.com' },
  { id: 'instagram', label: 'Instagram', href: 'https://www.instagram.com' },
  { id: 'twitter', label: 'Twitter', href: 'https://twitter.com' },
  { id: 'linkedin', label: 'LinkedIn', href: 'https://www.linkedin.com' },
  { id: 'youtube', label: 'YouTube', href: 'https://www.youtube.com' },
] as const

export const COMPATIBLE_WALLETS = ['METAMASK', 'WALLETCONNECT', 'COINBASE'] as const

export const COPYRIGHT = '© 2026 Kurio. Propriedade digital para todos.'
