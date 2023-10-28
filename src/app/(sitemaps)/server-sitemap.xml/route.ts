import type { ISitemapField } from 'next-sitemap'
import { getServerSideSitemap } from 'next-sitemap'

import i18n from '@/i18n-config'
import { getEnv } from '@/utils'

export async function GET(_request: Request) {
  const { NEXT_PUBLIC_SITE_URL } = getEnv()
  // Method to source urls from cms
  // const urls = await fetch('https//example.com/api')

  const sitemap: ISitemapField[] = []
  const lastmod = new Date().toISOString()
  const urls = ['/request']
  urls.forEach((url) => {
    const loc = `${NEXT_PUBLIC_SITE_URL}${url}`
    sitemap.push({ loc, lastmod })

    i18n.locales.forEach((locale) => {
      const loc = `${NEXT_PUBLIC_SITE_URL}/${locale}${url}`
      sitemap.push({ loc, lastmod })
    })
  })

  return getServerSideSitemap(sitemap)
}
