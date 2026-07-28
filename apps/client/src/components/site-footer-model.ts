export type SiteFooterLink = {
  label: string
  href: string
  external?: boolean
  description?: string
}

export type SiteFooterGroup = {
  id: string
  title: string
  links: SiteFooterLink[]
}

export type SiteFooterContact = {
  label: string
  value: string
  href?: string
}

export type SiteFooterData = {
  brand: {
    name: string
    description?: string
    href?: string
  }
  groups?: SiteFooterGroup[]
  friends?: SiteFooterLink[]
  contacts?: SiteFooterContact[]
  compliance?: SiteFooterLink[]
  version?: string
  build?: string
  copyright: string
}

export const defaultSiteFooterData: SiteFooterData = {
  brand: {
    name: 'KKFIVE / NST',
    description: '面向真实业务的现代 Next.js 工程起点。',
    href: '/',
  },
  groups: [
    {
      id: 'explore',
      title: '探索',
      links: [
        { label: '首页', href: '/' },
        { label: '演示', href: '/demo' },
      ],
    },
    {
      id: 'resources',
      title: '资源',
      links: [
        { label: 'GitHub', href: 'https://github.com/kkfive/nextjs-start-template', external: true },
        { label: 'Next.js', href: 'https://nextjs.org', external: true },
      ],
    },
  ],
  version: 'V0.1',
  build: 'NEXT.JS 16',
  copyright: '© 2026 KKFIVE',
}
